/**
 * CODAI Advanced Service Integrations - Real-time Communication Manager
 * WebSocket server with rooms, authentication, and monitoring
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer, Server } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import { EventEmitter } from 'events';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import {
    WebSocketConfig,
    WebSocketMessage,
    WSAuthenticationConfig,
    RoomConfig,
    WSRateLimitConfig,
    HeartbeatConfig,
    IntegrationError
} from './types';

/**
 * WebSocket Manager
 * Provides real-time communication with authentication, rooms, and monitoring
 */
export class WebSocketManager extends EventEmitter {
    private server: Server;
    private io: SocketIOServer;
    private config: WebSocketConfig;
    private rooms: Map<string, RoomState> = new Map();
    private connections: Map<string, ConnectionState> = new Map();
    private rateLimiters: Map<string, RateLimiterMemory> = new Map();
    private messageHistory: Map<string, WebSocketMessage[]> = new Map();
    private userSockets: Map<string, Set<string>> = new Map();
    private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();
    private managers: {
        securityManager: any;
        rateLimitManager: any;
        monitoringManager: any;
    };

    constructor(config: WebSocketConfig, managers: any) {
        super();
        this.config = config;
        this.managers = managers;
    }

    /**
     * Start the WebSocket server
     */
    async start(): Promise<void> {
        try {
            this.emit('websocket:starting');

            // Create HTTP server
            this.server = createServer();

            // Create Socket.IO server
            this.io = new SocketIOServer(this.server, {
                path: this.config.path,
                cors: this.config.cors.enabled ? {
                    origin: this.config.cors.origins,
                    credentials: this.config.cors.credentials
                } : false,
                compression: this.config.compression.enabled,
                allowEIO3: true,
                transports: ['websocket', 'polling']
            });

            // Setup authentication
            if (this.config.authentication.enabled) {
                this.io.use(this.authenticationMiddleware.bind(this));
            }

            // Setup rate limiting
            if (this.config.rateLimit.enabled) {
                this.setupRateLimiting();
            }

            // Setup connection handling
            this.io.on('connection', this.handleConnection.bind(this));

            // Initialize rooms
            await this.initializeRooms();

            // Start server
            await new Promise<void>((resolve, reject) => {
                this.server.listen(this.config.port, (error?: Error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            this.emit('websocket:started', { port: this.config.port });

        } catch (error) {
            this.emit('websocket:error', error);
            throw new IntegrationError(
                'WEBSOCKET_START_FAILED',
                `Failed to start WebSocket server: ${error.message}`,
                { error },
                false,
                'server'
            );
        }
    }

    /**
     * Stop the WebSocket server
     */
    async stop(): Promise<void> {
        try {
            this.emit('websocket:stopping');

            // Clear heartbeat intervals
            this.heartbeatIntervals.forEach(interval => clearInterval(interval));
            this.heartbeatIntervals.clear();

            // Disconnect all clients
            this.io.disconnectSockets(true);

            // Close server
            if (this.server) {
                await new Promise<void>((resolve) => {
                    this.server.close(() => resolve());
                });
            }

            // Clear state
            this.rooms.clear();
            this.connections.clear();
            this.rateLimiters.clear();
            this.messageHistory.clear();
            this.userSockets.clear();

            this.emit('websocket:stopped');

        } catch (error) {
            this.emit('websocket:error', error);
            throw error;
        }
    }

    /**
     * Send message to a specific socket
     */
    sendToSocket(socketId: string, event: string, data: any): boolean {
        try {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
                socket.emit(event, data);

                this.emit('message:sent', {
                    socketId,
                    event,
                    dataSize: JSON.stringify(data).length,
                    timestamp: new Date()
                });

                return true;
            }
            return false;
        } catch (error) {
            this.emit('message:error', { socketId, event, error });
            return false;
        }
    }

    /**
     * Send message to a room
     */
    sendToRoom(roomName: string, event: string, data: any, excludeSocket?: string): void {
        try {
            const roomSockets = excludeSocket
                ? this.io.to(roomName).except(excludeSocket)
                : this.io.to(roomName);

            roomSockets.emit(event, data);

            // Store message in history if enabled
            const roomConfig = this.config.rooms.find(r => r.name === roomName);
            if (roomConfig?.messageHistory && roomConfig.messageHistory > 0) {
                this.addMessageToHistory(roomName, {
                    id: this.generateMessageId(),
                    type: event,
                    payload: data,
                    timestamp: new Date(),
                    room: roomName
                });
            }

            this.emit('message:broadcast', {
                room: roomName,
                event,
                dataSize: JSON.stringify(data).length,
                excludeSocket,
                timestamp: new Date()
            });

        } catch (error) {
            this.emit('message:error', { room: roomName, event, error });
        }
    }

    /**
     * Send message to specific user (all their sockets)
     */
    sendToUser(userId: string, event: string, data: any): number {
        try {
            const userSocketIds = this.userSockets.get(userId);
            if (userSocketIds) {
                let sentCount = 0;
                userSocketIds.forEach(socketId => {
                    if (this.sendToSocket(socketId, event, data)) {
                        sentCount++;
                    }
                });

                this.emit('message:user', {
                    userId,
                    event,
                    socketsCount: userSocketIds.size,
                    sentCount,
                    timestamp: new Date()
                });

                return sentCount;
            }
            return 0;
        } catch (error) {
            this.emit('message:error', { userId, event, error });
            return 0;
        }
    }

    /**
     * Broadcast message to all connected sockets
     */
    broadcast(event: string, data: any): void {
        try {
            this.io.emit(event, data);

            this.emit('message:broadcast', {
                event,
                dataSize: JSON.stringify(data).length,
                totalSockets: this.io.sockets.sockets.size,
                timestamp: new Date()
            });
        } catch (error) {
            this.emit('message:error', { event, error });
        }
    }

    /**
     * Get room information
     */
    getRoomInfo(roomName: string): RoomInfo | null {
        const roomState = this.rooms.get(roomName);
        if (!roomState) {
            return null;
        }

        const socketsInRoom = this.io.sockets.adapter.rooms.get(roomName);
        const socketCount = socketsInRoom ? socketsInRoom.size : 0;

        return {
            name: roomName,
            socketCount,
            maxUsers: roomState.config.maxUsers,
            messageCount: this.messageHistory.get(roomName)?.length || 0,
            created: roomState.created,
            lastActivity: roomState.lastActivity
        };
    }

    /**
     * Get all rooms information
     */
    getAllRooms(): RoomInfo[] {
        return Array.from(this.rooms.keys())
            .map(roomName => this.getRoomInfo(roomName))
            .filter(room => room !== null) as RoomInfo[];
    }

    /**
     * Get connection metrics
     */
    getMetrics(): WebSocketMetrics {
        const totalConnections = this.connections.size;
        const totalRooms = this.rooms.size;
        const totalMessages = Array.from(this.messageHistory.values())
            .reduce((sum, messages) => sum + messages.length, 0);

        return {
            totalConnections,
            totalRooms,
            totalMessages,
            averageConnectionsPerRoom: totalRooms > 0 ? totalConnections / totalRooms : 0,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            timestamp: new Date()
        };
    }

    /**
     * Get connection health status
     */
    getHealthStatus(): WebSocketHealthStatus {
        return {
            status: this.server?.listening ? 'healthy' : 'unhealthy',
            connections: this.connections.size,
            rooms: this.rooms.size,
            uptime: process.uptime(),
            lastCheck: new Date()
        };
    }

    // ==================== PRIVATE METHODS ====================

    private async authenticationMiddleware(socket: Socket, next: Function): Promise<void> {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;

            if (!token) {
                return next(new Error('Authentication token required'));
            }

            // Verify token based on authentication type
            let user: any;
            switch (this.config.authentication.type) {
                case 'jwt':
                    user = await this.verifyJWTToken(token as string);
                    break;
                case 'token':
                    user = await this.verifyCustomToken(token as string);
                    break;
                case 'session':
                    user = await this.verifySessionToken(token as string);
                    break;
                case 'custom':
                    if (this.config.authentication.verifyConnection) {
                        const isValid = await this.config.authentication.verifyConnection({
                            token,
                            socket
                        });
                        if (!isValid) {
                            return next(new Error('Authentication failed'));
                        }
                        user = { id: 'custom-user' }; // Placeholder
                    }
                    break;
                default:
                    return next(new Error('Invalid authentication type'));
            }

            if (!user) {
                return next(new Error('Authentication failed'));
            }

            // Attach user to socket
            (socket as any).user = user;
            next();

        } catch (error) {
            this.emit('auth:error', { socketId: socket.id, error });
            next(new Error('Authentication failed'));
        }
    }

    private setupRateLimiting(): void {
        const config = this.config.rateLimit;

        // Create rate limiter for messages
        const messageLimiter = new RateLimiterMemory({
            points: config.messagesPerSecond * config.windowSize,
            duration: config.windowSize,
            blockDuration: config.windowSize
        });

        this.rateLimiters.set('messages', messageLimiter);
    }

    private async initializeRooms(): Promise<void> {
        for (const roomConfig of this.config.rooms) {
            const roomState: RoomState = {
                config: roomConfig,
                created: new Date(),
                lastActivity: new Date()
            };

            this.rooms.set(roomConfig.name, roomState);

            if (roomConfig.messageHistory > 0) {
                this.messageHistory.set(roomConfig.name, []);
            }
        }
    }

    private async handleConnection(socket: Socket): Promise<void> {
        try {
            const user = (socket as any).user;
            const connectionState: ConnectionState = {
                socketId: socket.id,
                userId: user?.id,
                connectedAt: new Date(),
                lastActivity: new Date(),
                rooms: new Set(),
                messageCount: 0
            };

            this.connections.set(socket.id, connectionState);

            // Track user sockets
            if (user?.id) {
                if (!this.userSockets.has(user.id)) {
                    this.userSockets.set(user.id, new Set());
                }
                this.userSockets.get(user.id)!.add(socket.id);
            }

            // Setup heartbeat if enabled
            if (this.config.heartbeat.enabled) {
                this.setupHeartbeat(socket);
            }

            // Setup event handlers
            this.setupSocketEventHandlers(socket);

            this.emit('connection:established', {
                socketId: socket.id,
                userId: user?.id,
                timestamp: new Date()
            });

        } catch (error) {
            this.emit('connection:error', { socketId: socket.id, error });
            socket.disconnect(true);
        }
    }

    private setupSocketEventHandlers(socket: Socket): void {
        // Handle disconnection
        socket.on('disconnect', (reason) => {
            this.handleDisconnection(socket, reason);
        });

        // Handle room joining
        socket.on('join-room', async (data) => {
            await this.handleJoinRoom(socket, data);
        });

        // Handle room leaving
        socket.on('leave-room', async (data) => {
            await this.handleLeaveRoom(socket, data);
        });

        // Handle message sending
        socket.on('message', async (data) => {
            await this.handleMessage(socket, data);
        });

        // Handle room message
        socket.on('room-message', async (data) => {
            await this.handleRoomMessage(socket, data);
        });

        // Handle ping/pong for heartbeat
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });

        // Handle custom events
        socket.onAny((eventName, ...args) => {
            this.handleCustomEvent(socket, eventName, args);
        });
    }

    private setupHeartbeat(socket: Socket): void {
        const config = this.config.heartbeat;
        let missedHeartbeats = 0;

        const heartbeatInterval = setInterval(() => {
            socket.emit('heartbeat', { timestamp: Date.now() });

            const heartbeatTimeout = setTimeout(() => {
                missedHeartbeats++;
                if (missedHeartbeats >= config.maxFailures) {
                    this.emit('heartbeat:failed', { socketId: socket.id, missedHeartbeats });
                    socket.disconnect(true);
                    clearInterval(heartbeatInterval);
                }
            }, config.timeout);

            socket.once('heartbeat-ack', () => {
                clearTimeout(heartbeatTimeout);
                missedHeartbeats = 0;
            });

        }, config.interval);

        this.heartbeatIntervals.set(socket.id, heartbeatInterval);

        socket.on('disconnect', () => {
            clearInterval(heartbeatInterval);
            this.heartbeatIntervals.delete(socket.id);
        });
    }

    private handleDisconnection(socket: Socket, reason: string): void {
        const connectionState = this.connections.get(socket.id);
        if (connectionState) {
            // Remove from user sockets tracking
            if (connectionState.userId) {
                const userSockets = this.userSockets.get(connectionState.userId);
                if (userSockets) {
                    userSockets.delete(socket.id);
                    if (userSockets.size === 0) {
                        this.userSockets.delete(connectionState.userId);
                    }
                }
            }

            // Clean up heartbeat
            const heartbeatInterval = this.heartbeatIntervals.get(socket.id);
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                this.heartbeatIntervals.delete(socket.id);
            }

            this.connections.delete(socket.id);
        }

        this.emit('connection:disconnected', {
            socketId: socket.id,
            userId: connectionState?.userId,
            reason,
            duration: connectionState ? Date.now() - connectionState.connectedAt.getTime() : 0,
            messageCount: connectionState?.messageCount || 0,
            timestamp: new Date()
        });
    }

    private async handleJoinRoom(socket: Socket, data: { room: string }): Promise<void> {
        try {
            const { room } = data;
            const roomConfig = this.config.rooms.find(r => r.name === room);

            if (!roomConfig) {
                socket.emit('error', { message: `Room ${room} does not exist` });
                return;
            }

            // Check room capacity
            const roomSockets = this.io.sockets.adapter.rooms.get(room);
            const currentCount = roomSockets ? roomSockets.size : 0;

            if (currentCount >= roomConfig.maxUsers) {
                socket.emit('error', { message: `Room ${room} is full` });
                return;
            }

            // Check permissions
            const user = (socket as any).user;
            const hasPermission = await this.checkRoomPermission(user, roomConfig, 'join');

            if (!hasPermission) {
                socket.emit('error', { message: `Not allowed to join room ${room}` });
                return;
            }

            // Join room
            await socket.join(room);

            // Update connection state
            const connectionState = this.connections.get(socket.id);
            if (connectionState) {
                connectionState.rooms.add(room);
            }

            // Update room activity
            const roomState = this.rooms.get(room);
            if (roomState) {
                roomState.lastActivity = new Date();
            }

            // Send room history if enabled
            if (roomConfig.messageHistory > 0) {
                const history = this.messageHistory.get(room) || [];
                socket.emit('room-history', { room, messages: history.slice(-roomConfig.messageHistory) });
            }

            // Notify room
            socket.to(room).emit('user-joined', {
                socketId: socket.id,
                userId: user?.id,
                timestamp: new Date()
            });

            socket.emit('joined-room', { room });

            this.emit('room:joined', {
                socketId: socket.id,
                userId: user?.id,
                room,
                timestamp: new Date()
            });

        } catch (error) {
            this.emit('room:error', { socketId: socket.id, action: 'join', error });
            socket.emit('error', { message: 'Failed to join room' });
        }
    }

    private async handleLeaveRoom(socket: Socket, data: { room: string }): Promise<void> {
        try {
            const { room } = data;

            // Leave room
            await socket.leave(room);

            // Update connection state
            const connectionState = this.connections.get(socket.id);
            if (connectionState) {
                connectionState.rooms.delete(room);
            }

            // Notify room
            const user = (socket as any).user;
            socket.to(room).emit('user-left', {
                socketId: socket.id,
                userId: user?.id,
                timestamp: new Date()
            });

            socket.emit('left-room', { room });

            this.emit('room:left', {
                socketId: socket.id,
                userId: user?.id,
                room,
                timestamp: new Date()
            });

        } catch (error) {
            this.emit('room:error', { socketId: socket.id, action: 'leave', error });
            socket.emit('error', { message: 'Failed to leave room' });
        }
    }

    private async handleMessage(socket: Socket, data: any): Promise<void> {
        try {
            // Rate limiting check
            if (this.config.rateLimit.enabled) {
                const rateLimiter = this.rateLimiters.get('messages');
                if (rateLimiter) {
                    try {
                        await rateLimiter.consume(socket.id);
                    } catch (rateLimitError) {
                        socket.emit('error', { message: 'Rate limit exceeded' });
                        return;
                    }
                }
            }

            // Update connection activity
            const connectionState = this.connections.get(socket.id);
            if (connectionState) {
                connectionState.lastActivity = new Date();
                connectionState.messageCount++;
            }

            const message: WebSocketMessage = {
                id: this.generateMessageId(),
                type: 'message',
                payload: data,
                timestamp: new Date(),
                sender: (socket as any).user?.id
            };

            // Echo message back to sender
            socket.emit('message-sent', message);

            this.emit('message:received', {
                socketId: socket.id,
                userId: (socket as any).user?.id,
                message,
                timestamp: new Date()
            });

        } catch (error) {
            this.emit('message:error', { socketId: socket.id, error });
            socket.emit('error', { message: 'Failed to process message' });
        }
    }

    private async handleRoomMessage(socket: Socket, data: { room: string; message: any }): Promise<void> {
        try {
            const { room, message } = data;

            // Check if socket is in room
            const socketRooms = Array.from(socket.rooms);
            if (!socketRooms.includes(room)) {
                socket.emit('error', { message: `Not in room ${room}` });
                return;
            }

            // Check permissions
            const user = (socket as any).user;
            const roomConfig = this.config.rooms.find(r => r.name === room);
            const hasPermission = roomConfig ? await this.checkRoomPermission(user, roomConfig, 'send') : true;

            if (!hasPermission) {
                socket.emit('error', { message: `Not allowed to send messages in room ${room}` });
                return;
            }

            // Rate limiting check
            if (this.config.rateLimit.enabled) {
                const rateLimiter = this.rateLimiters.get('messages');
                if (rateLimiter) {
                    try {
                        await rateLimiter.consume(socket.id);
                    } catch (rateLimitError) {
                        socket.emit('error', { message: 'Rate limit exceeded' });
                        return;
                    }
                }
            }

            const wsMessage: WebSocketMessage = {
                id: this.generateMessageId(),
                type: 'room-message',
                payload: message,
                timestamp: new Date(),
                sender: user?.id,
                room
            };

            // Send to all sockets in room except sender
            socket.to(room).emit('room-message', wsMessage);

            // Add to message history
            if (roomConfig?.messageHistory && roomConfig.messageHistory > 0) {
                this.addMessageToHistory(room, wsMessage);
            }

            // Update connection state
            const connectionState = this.connections.get(socket.id);
            if (connectionState) {
                connectionState.lastActivity = new Date();
                connectionState.messageCount++;
            }

            // Confirm to sender
            socket.emit('room-message-sent', { room, messageId: wsMessage.id });

            this.emit('room-message:sent', {
                socketId: socket.id,
                userId: user?.id,
                room,
                message: wsMessage,
                timestamp: new Date()
            });

        } catch (error) {
            this.emit('room-message:error', { socketId: socket.id, error });
            socket.emit('error', { message: 'Failed to send room message' });
        }
    }

    private handleCustomEvent(socket: Socket, eventName: string, args: any[]): void {
        // Skip built-in events
        if (['connect', 'disconnect', 'join-room', 'leave-room', 'message', 'room-message', 'ping', 'heartbeat-ack'].includes(eventName)) {
            return;
        }

        this.emit('custom-event', {
            socketId: socket.id,
            userId: (socket as any).user?.id,
            eventName,
            args,
            timestamp: new Date()
        });
    }

    private async verifyJWTToken(token: string): Promise<any> {
        try {
            // This would use the actual JWT secret/key
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
            return decoded;
        } catch (error) {
            return null;
        }
    }

    private async verifyCustomToken(token: string): Promise<any> {
        // Custom token verification logic
        return { id: 'token-user' }; // Placeholder
    }

    private async verifySessionToken(token: string): Promise<any> {
        // Session token verification logic
        return { id: 'session-user' }; // Placeholder
    }

    private async checkRoomPermission(user: any, roomConfig: RoomConfig, action: string): Promise<boolean> {
        if (roomConfig.adminOnly && !user?.isAdmin) {
            return false;
        }

        if (roomConfig.permissions && roomConfig.permissions.length > 0) {
            const userRole = user?.role || 'user';
            const permission = roomConfig.permissions.find(p => p.role === userRole);
            return permission ? permission.actions.includes(action as any) : false;
        }

        return true;
    }

    private addMessageToHistory(room: string, message: WebSocketMessage): void {
        const history = this.messageHistory.get(room) || [];
        history.push(message);

        const roomConfig = this.config.rooms.find(r => r.name === room);
        const maxHistory = roomConfig?.messageHistory || 100;

        if (history.length > maxHistory) {
            history.splice(0, history.length - maxHistory);
        }

        this.messageHistory.set(room, history);
    }

    private generateMessageId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    }
}

// ==================== INTERFACE DEFINITIONS ====================

interface RoomState {
    config: RoomConfig;
    created: Date;
    lastActivity: Date;
}

interface ConnectionState {
    socketId: string;
    userId?: string;
    connectedAt: Date;
    lastActivity: Date;
    rooms: Set<string>;
    messageCount: number;
}

export interface RoomInfo {
    name: string;
    socketCount: number;
    maxUsers: number;
    messageCount: number;
    created: Date;
    lastActivity: Date;
}

export interface WebSocketMetrics {
    totalConnections: number;
    totalRooms: number;
    totalMessages: number;
    averageConnectionsPerRoom: number;
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
    timestamp: Date;
}

export interface WebSocketHealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    connections: number;
    rooms: number;
    uptime: number;
    lastCheck: Date;
}
