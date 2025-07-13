import { io } from 'socket.io-client';
import { RealtimeEventBus, CODAI_EVENTS } from './events';
export class RealtimeClient {
    constructor(config) {
        var _a, _b, _c, _d, _e;
        this.connectionState = 'disconnected';
        this.subscriptions = new Set();
        this.rooms = new Set();
        this.messageQueue = [];
        this.latency = 0;
        this.lastPingTime = 0;
        this.config = config;
        this.eventBus = new RealtimeEventBus();
        this.socket = io(config.url, {
            autoConnect: ((_a = config.options) === null || _a === void 0 ? void 0 : _a.autoConnect) !== false,
            reconnection: ((_b = config.options) === null || _b === void 0 ? void 0 : _b.reconnection) !== false,
            reconnectionDelay: ((_c = config.options) === null || _c === void 0 ? void 0 : _c.reconnectionDelay) || 1000,
            reconnectionAttempts: ((_d = config.options) === null || _d === void 0 ? void 0 : _d.reconnectionAttempts) || 5,
            timeout: ((_e = config.options) === null || _e === void 0 ? void 0 : _e.timeout) || 20000,
            transports: ['websocket', 'polling'],
        });
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        // Connection events
        this.socket.on('connect', () => {
            var _a;
            console.log('Connected to realtime server');
            this.connectionState = 'connected';
            // Authenticate if token is provided
            if ((_a = this.config.auth) === null || _a === void 0 ? void 0 : _a.token) {
                this.authenticate(this.config.auth.token);
            }
            // Resubscribe to channels
            if (this.subscriptions.size > 0) {
                this.subscribe([...this.subscriptions]);
            }
            // Rejoin rooms
            this.rooms.forEach(roomId => {
                this.joinRoom(roomId);
            });
            // Process queued messages
            this.processMessageQueue();
            // Start ping monitoring
            this.startPingMonitoring();
            this.eventBus.emitEvent(CODAI_EVENTS.USER_CONNECTED, { socketId: this.socket.id }, 'client');
        });
        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from realtime server:', reason);
            this.connectionState = 'disconnected';
            this.stopPingMonitoring();
            this.eventBus.emitEvent(CODAI_EVENTS.USER_DISCONNECTED, { reason }, 'client');
        });
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.connectionState = 'disconnected';
        });
        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Reconnected after', attemptNumber, 'attempts');
            this.connectionState = 'connected';
        });
        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Reconnection attempt', attemptNumber);
            this.connectionState = 'reconnecting';
        });
        // Message events
        this.socket.on('message', (message) => {
            this.eventBus.emitEvent('message:received', message, 'server');
            this.eventBus.emit('message', message);
            this.eventBus.emit(`message:${message.type}`, message);
        });
        this.socket.on('event', (event) => {
            this.eventBus.emitEvent('event:received', event, 'server');
            this.eventBus.emit('event', event);
            this.eventBus.emit(event.type, event);
        });
        this.socket.on('sync', (syncData) => {
            this.eventBus.emitEvent('sync:received', syncData, 'server');
            this.eventBus.emit('sync', syncData);
            this.eventBus.emit(`sync:${syncData.type}`, syncData);
        });
        this.socket.on('conflict', (conflictData) => {
            this.eventBus.emitEvent('conflict:detected', conflictData, 'server');
            this.eventBus.emit('conflict', conflictData);
        });
        // Room events
        this.socket.on('join', (data) => {
            this.eventBus.emitEvent(CODAI_EVENTS.COLLAB_JOIN, data, 'server');
        });
        this.socket.on('leave', (data) => {
            this.eventBus.emitEvent(CODAI_EVENTS.COLLAB_LEAVE, data, 'server');
        });
        // System events
        this.socket.on('connected', (data) => {
            console.log('Authentication successful, connection ID:', data.connectionId);
        });
        this.socket.on('error', (error) => {
            console.error('Server error:', error);
            this.eventBus.emitEvent(CODAI_EVENTS.SYSTEM_ERROR, error, 'server');
        });
        // Ping/Pong for latency measurement
        this.socket.on('pong', () => {
            this.latency = Date.now() - this.lastPingTime;
        });
    }
    // Authentication
    authenticate(token) {
        this.socket.emit('authenticate', { token });
    }
    // Connection management
    connect() {
        if (this.connectionState === 'disconnected') {
            this.connectionState = 'connecting';
            this.socket.connect();
        }
    }
    disconnect() {
        this.stopPingMonitoring();
        this.socket.disconnect();
        this.connectionState = 'disconnected';
    }
    isConnected() {
        return this.connectionState === 'connected';
    }
    getConnectionState() {
        return this.connectionState;
    }
    getLatency() {
        return this.latency;
    }
    // Messaging
    sendMessage(type, payload, target, channel, priority = 'normal') {
        const message = {
            type,
            payload,
            target,
            channel,
            priority,
        };
        if (this.isConnected()) {
            this.socket.emit('message', message);
        }
        else {
            // Queue message for later
            this.messageQueue.push({ type: 'message', data: message });
        }
    }
    broadcast(type, payload) {
        this.sendMessage(type, payload, undefined, 'broadcast');
    }
    sendToChannel(channel, type, payload) {
        this.sendMessage(type, payload, undefined, channel);
    }
    sendToUser(userId, type, payload) {
        this.sendMessage(type, payload, userId);
    }
    // Channel management
    subscribe(channels) {
        channels.forEach(channel => this.subscriptions.add(channel));
        if (this.isConnected()) {
            this.socket.emit('subscribe', { channels });
        }
    }
    unsubscribe(channels) {
        channels.forEach(channel => this.subscriptions.delete(channel));
        if (this.isConnected()) {
            this.socket.emit('unsubscribe', { channels });
        }
    }
    getSubscriptions() {
        return [...this.subscriptions];
    }
    // Room management
    joinRoom(roomId) {
        this.rooms.add(roomId);
        if (this.isConnected()) {
            this.socket.emit('joinRoom', { roomId });
        }
    }
    leaveRoom(roomId) {
        this.rooms.delete(roomId);
        if (this.isConnected()) {
            this.socket.emit('leaveRoom', { roomId });
        }
    }
    getRooms() {
        return [...this.rooms];
    }
    // Data synchronization
    sync(data) {
        if (this.isConnected()) {
            this.socket.emit('sync', data);
        }
        else {
            this.messageQueue.push({ type: 'sync', data });
        }
    }
    // Event handling
    on(event, listener) {
        this.eventBus.on(event, listener);
    }
    off(event, listener) {
        this.eventBus.off(event, listener);
    }
    once(event, listener) {
        this.eventBus.once(event, listener);
    }
    // Utility methods
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const item = this.messageQueue.shift();
            if (item.type === 'message') {
                this.socket.emit('message', item.data);
            }
            else if (item.type === 'sync') {
                this.socket.emit('sync', item.data);
            }
        }
    }
    startPingMonitoring() {
        this.pingInterval = setInterval(() => {
            this.lastPingTime = Date.now();
            this.socket.emit('ping');
        }, 30000); // Ping every 30 seconds
    }
    stopPingMonitoring() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = undefined;
        }
    }
    // Advanced features
    enableDebugMode() {
        this.socket.onAny((event, ...args) => {
            console.log(`[Realtime Debug] ${event}:`, args);
        });
    }
    getStats() {
        return {
            connectionState: this.connectionState,
            latency: this.latency,
            subscriptions: this.subscriptions.size,
            rooms: this.rooms.size,
            queuedMessages: this.messageQueue.length,
        };
    }
    // Cleanup
    destroy() {
        this.stopPingMonitoring();
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.eventBus.removeAllListeners();
    }
}
// Factory function to create client
export function createRealtimeClient(config) {
    return new RealtimeClient(config);
}
// React hook for realtime client (if using React)
export function useRealtimeClient(config) {
    const client = new RealtimeClient(config);
    // Cleanup on unmount
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
            client.destroy();
        });
    }
    return client;
}
