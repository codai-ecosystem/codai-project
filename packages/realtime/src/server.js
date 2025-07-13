import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { RealtimeEventBus, CODAI_EVENTS } from './events';
import { DataSynchronizer } from './sync';
import { generateId, validateChannel, RateLimiter } from './utils';
export class RealtimeServer {
    constructor(config) {
        this.connections = new Map();
        this.rooms = new Map();
        this.config = config;
        this.eventBus = new RealtimeEventBus(config.channels.messageHistory);
        this.synchronizer = new DataSynchronizer(config.sync.conflictResolution);
        this.rateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute
        this.metrics = {
            connections: { active: 0, total: 0, byApp: {} },
            messages: { sent: 0, received: 0, failed: 0, rate: 0 },
            latency: { average: 0, p95: 0, p99: 0 },
            errors: { count: 0, rate: 0, types: {} },
        };
        this.initializeServer();
        this.setupEventHandlers();
    }
    initializeServer() {
        // Create HTTP server
        this.httpServer = createServer();
        // Create Socket.IO server
        this.io = new SocketIOServer(this.httpServer, {
            cors: this.config.server.cors,
            transports: ['websocket', 'polling'],
            allowEIO3: true,
        });
        // Initialize Redis if configured
        if (this.config.server.redis) {
            this.redis = new Redis(this.config.server.redis);
            try {
                // Try to use socket.io-redis adapter if available
                const redisAdapter = require('socket.io-redis');
                this.io.adapter(redisAdapter(this.redis));
            }
            catch (error) {
                console.warn('socket.io-redis adapter not available, using default adapter');
            }
        }
    }
    setupEventHandlers() {
        // Handle new connections
        this.io.on('connection', (socket) => {
            const connectionId = generateId();
            console.log(`New connection: ${connectionId}`);
            // Initialize connection info
            const connectionInfo = {
                id: connectionId,
                appId: 'unknown',
                roles: [],
                permissions: [],
                connectedAt: Date.now(),
                lastActivity: Date.now(),
                metadata: {},
            };
            this.connections.set(socket.id, connectionInfo);
            this.updateMetrics('connection', { type: 'connected' });
            // Handle authentication
            socket.on('authenticate', async (data) => {
                try {
                    const { token } = data;
                    const decoded = jwt.verify(token, this.config.auth.secret);
                    connectionInfo.userId = decoded.sub || decoded.userId;
                    connectionInfo.roles = decoded.roles || [];
                    connectionInfo.permissions = decoded.permissions || [];
                    connectionInfo.appId = decoded.appId || 'unknown';
                    connectionInfo.metadata = decoded.metadata || {};
                    this.connections.set(socket.id, connectionInfo);
                    // Join user-specific room
                    if (connectionInfo.userId) {
                        socket.join(`user:${connectionInfo.userId}`);
                    }
                    // Emit authentication success
                    socket.emit('connected', { connectionId });
                    // Broadcast user connected event
                    this.eventBus.emitEvent(CODAI_EVENTS.USER_AUTHENTICATED, { userId: connectionInfo.userId, connectionId }, 'system');
                }
                catch (error) {
                    socket.emit('error', {
                        message: 'Authentication failed',
                        code: 'AUTH_FAILED'
                    });
                }
            });
            // Handle messages
            socket.on('message', (data) => {
                if (!this.rateLimiter.isAllowed(socket.id)) {
                    socket.emit('error', {
                        message: 'Rate limit exceeded',
                        code: 'RATE_LIMIT'
                    });
                    return;
                }
                try {
                    const messageId = this.eventBus.sendMessage(data.type, data.payload, connectionInfo.userId || connectionId, data.target, data.channel, data.priority);
                    this.updateMetrics('message', { type: 'sent' });
                    // Broadcast to appropriate targets
                    if (data.target) {
                        this.io.to(`user:${data.target}`).emit('message', {
                            id: messageId,
                            ...data,
                            sender: connectionInfo.userId || connectionId,
                            timestamp: Date.now(),
                        });
                    }
                    else if (data.channel) {
                        this.io.to(`channel:${data.channel}`).emit('message', {
                            id: messageId,
                            ...data,
                            sender: connectionInfo.userId || connectionId,
                            timestamp: Date.now(),
                        });
                    }
                    else {
                        // Broadcast to all
                        socket.broadcast.emit('message', {
                            id: messageId,
                            ...data,
                            sender: connectionInfo.userId || connectionId,
                            timestamp: Date.now(),
                        });
                    }
                }
                catch (error) {
                    this.updateMetrics('message', { type: 'failed' });
                    socket.emit('error', {
                        message: 'Failed to send message',
                        code: 'MESSAGE_FAILED'
                    });
                }
            });
            // Handle channel subscription
            socket.on('subscribe', (data) => {
                const { channels } = data;
                channels.forEach(channel => {
                    if (validateChannel(channel)) {
                        socket.join(`channel:${channel}`);
                    }
                });
            });
            // Handle channel unsubscription
            socket.on('unsubscribe', (data) => {
                const { channels } = data;
                channels.forEach(channel => {
                    if (validateChannel(channel)) {
                        socket.leave(`channel:${channel}`);
                    }
                });
            });
            // Handle room operations
            socket.on('joinRoom', (data) => {
                const { roomId } = data;
                if (this.canJoinRoom(connectionInfo, roomId)) {
                    socket.join(`room:${roomId}`);
                    this.addToRoom(roomId, connectionInfo.userId || connectionId);
                    socket.emit('join', { roomId, userId: connectionInfo.userId || connectionId });
                    socket.to(`room:${roomId}`).emit('join', {
                        roomId,
                        userId: connectionInfo.userId || connectionId
                    });
                }
            });
            socket.on('leaveRoom', (data) => {
                const { roomId } = data;
                socket.leave(`room:${roomId}`);
                this.removeFromRoom(roomId, connectionInfo.userId || connectionId);
                socket.emit('leave', { roomId, userId: connectionInfo.userId || connectionId });
                socket.to(`room:${roomId}`).emit('leave', {
                    roomId,
                    userId: connectionInfo.userId || connectionId
                });
            });
            // Handle synchronization
            socket.on('sync', async (data) => {
                try {
                    const operation = {
                        ...data,
                        timestamp: Date.now(),
                        author: connectionInfo.userId || connectionId,
                        type: data.operation, // Use operation field for sync type
                    };
                    const result = await this.synchronizer.applyOperation(operation);
                    if (result.success) {
                        // Broadcast sync to other clients
                        socket.broadcast.emit('sync', operation);
                    }
                    else {
                        // Handle conflicts
                        socket.emit('conflict', {
                            id: data.id,
                            conflicts: result.conflicts || []
                        });
                    }
                }
                catch (error) {
                    socket.emit('error', {
                        message: 'Sync operation failed',
                        code: 'SYNC_FAILED'
                    });
                }
            });
            // Handle ping for latency measurement
            socket.on('ping', () => {
                socket.emit('pong');
            });
            // Handle disconnection
            socket.on('disconnect', (reason) => {
                console.log(`Connection ${connectionId} disconnected: ${reason}`);
                // Clean up connection
                this.connections.delete(socket.id);
                this.updateMetrics('connection', { type: 'disconnected' });
                // Broadcast disconnection event
                if (connectionInfo.userId) {
                    this.eventBus.emitEvent(CODAI_EVENTS.USER_DISCONNECTED, { userId: connectionInfo.userId, reason }, 'system');
                }
                socket.emit('disconnected', { reason });
            });
            // Update activity timestamp
            socket.onAny(() => {
                connectionInfo.lastActivity = Date.now();
            });
        });
    }
    canJoinRoom(connection, roomId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            // Create new public room
            this.createRoom(roomId, 'public');
            return true;
        }
        if (room.type === 'public') {
            return true;
        }
        if (room.type === 'private') {
            return room.participants.includes(connection.userId || connection.id);
        }
        if (room.type === 'system') {
            return connection.roles.includes('admin') || connection.roles.includes('system');
        }
        return false;
    }
    createRoom(roomId, type) {
        const room = {
            id: roomId,
            name: roomId,
            type,
            participants: [],
            metadata: {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        this.rooms.set(roomId, room);
    }
    addToRoom(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (room && !room.participants.includes(userId)) {
            room.participants.push(userId);
            room.updatedAt = Date.now();
        }
    }
    removeFromRoom(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.participants = room.participants.filter(id => id !== userId);
            room.updatedAt = Date.now();
        }
    }
    updateMetrics(type, data) {
        switch (type) {
            case 'connection':
                if (data.type === 'connected') {
                    this.metrics.connections.active++;
                    this.metrics.connections.total++;
                }
                else if (data.type === 'disconnected') {
                    this.metrics.connections.active--;
                }
                break;
            case 'message':
                if (data.type === 'sent') {
                    this.metrics.messages.sent++;
                }
                else if (data.type === 'received') {
                    this.metrics.messages.received++;
                }
                else if (data.type === 'failed') {
                    this.metrics.messages.failed++;
                }
                break;
        }
    }
    // Public API methods
    start() {
        return new Promise((resolve) => {
            this.httpServer.listen(this.config.server.port, this.config.server.host, () => {
                console.log(`Realtime server listening on ${this.config.server.host}:${this.config.server.port}`);
                resolve();
            });
        });
    }
    stop() {
        return new Promise((resolve) => {
            this.io.close(() => {
                this.httpServer.close(() => {
                    if (this.redis) {
                        this.redis.disconnect();
                    }
                    resolve();
                });
            });
        });
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getConnections() {
        return Array.from(this.connections.values());
    }
    getRooms() {
        return Array.from(this.rooms.values());
    }
    broadcastToApp(appId, type, payload) {
        const connections = Array.from(this.connections.values())
            .filter(conn => conn.appId === appId);
        connections.forEach(conn => {
            this.io.to(conn.id).emit('message', {
                id: generateId(),
                type,
                payload,
                timestamp: Date.now(),
                sender: 'system',
                priority: 'normal',
            });
        });
    }
    broadcastToUser(userId, type, payload) {
        this.io.to(`user:${userId}`).emit('message', {
            id: generateId(),
            type,
            payload,
            timestamp: Date.now(),
            sender: 'system',
            priority: 'normal',
        });
    }
    broadcastToChannel(channel, type, payload) {
        this.io.to(`channel:${channel}`).emit('message', {
            id: generateId(),
            type,
            payload,
            timestamp: Date.now(),
            sender: 'system',
            priority: 'normal',
        });
    }
    broadcastSystemMessage(type, payload) {
        this.io.emit('message', {
            id: generateId(),
            type,
            payload,
            timestamp: Date.now(),
            sender: 'system',
            priority: 'high',
        });
    }
}
// Factory function to create and configure server
export function createRealtimeServer(config) {
    return new RealtimeServer(config);
}
