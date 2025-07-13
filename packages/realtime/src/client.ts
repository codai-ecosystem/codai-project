import { io, Socket } from 'socket.io-client';
import {
  Message,
  Event,
  ServerToClientEvents,
  ClientToServerEvents,
  SyncData
} from './types';
import { RealtimeEventBus, CODAI_EVENTS } from './events';
import { generateId, debounce, retry } from './utils';

export interface RealtimeClientConfig {
  url: string;
  auth?: {
    token: string;
  };
  options?: {
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionDelay?: number;
    reconnectionAttempts?: number;
    timeout?: number;
  };
}

export class RealtimeClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private eventBus: RealtimeEventBus;
  private config: RealtimeClientConfig;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private subscriptions: Set<string> = new Set();
  private rooms: Set<string> = new Set();
  private messageQueue: any[] = [];
  private pingInterval?: NodeJS.Timeout;
  private latency: number = 0;

  constructor(config: RealtimeClientConfig) {
    this.config = config;
    this.eventBus = new RealtimeEventBus();

    this.socket = io(config.url, {
      autoConnect: config.options?.autoConnect !== false,
      reconnection: config.options?.reconnection !== false,
      reconnectionDelay: config.options?.reconnectionDelay || 1000,
      reconnectionAttempts: config.options?.reconnectionAttempts || 5,
      timeout: config.options?.timeout || 20000,
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to realtime server');
      this.connectionState = 'connected';

      // Authenticate if token is provided
      if (this.config.auth?.token) {
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

    (this.socket as any).on('reconnect', (attemptNumber: number) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      this.connectionState = 'connected';
    });

    (this.socket as any).on('reconnect_attempt', (attemptNumber: number) => {
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
  public authenticate(token: string): void {
    this.socket.emit('authenticate', { token });
  }

  // Connection management
  public connect(): void {
    if (this.connectionState === 'disconnected') {
      this.connectionState = 'connecting';
      this.socket.connect();
    }
  }

  public disconnect(): void {
    this.stopPingMonitoring();
    this.socket.disconnect();
    this.connectionState = 'disconnected';
  }

  public isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  public getConnectionState(): string {
    return this.connectionState;
  }

  public getLatency(): number {
    return this.latency;
  }

  // Messaging
  public sendMessage(
    type: string,
    payload: any,
    target?: string,
    channel?: string,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): void {
    const message = {
      type,
      payload,
      target,
      channel,
      priority,
    };

    if (this.isConnected()) {
      this.socket.emit('message', message);
    } else {
      // Queue message for later
      this.messageQueue.push({ type: 'message', data: message });
    }
  }

  public broadcast(type: string, payload: any): void {
    this.sendMessage(type, payload, undefined, 'broadcast');
  }

  public sendToChannel(channel: string, type: string, payload: any): void {
    this.sendMessage(type, payload, undefined, channel);
  }

  public sendToUser(userId: string, type: string, payload: any): void {
    this.sendMessage(type, payload, userId);
  }

  // Channel management
  public subscribe(channels: string[]): void {
    channels.forEach(channel => this.subscriptions.add(channel));

    if (this.isConnected()) {
      this.socket.emit('subscribe', { channels });
    }
  }

  public unsubscribe(channels: string[]): void {
    channels.forEach(channel => this.subscriptions.delete(channel));

    if (this.isConnected()) {
      this.socket.emit('unsubscribe', { channels });
    }
  }

  public getSubscriptions(): string[] {
    return [...this.subscriptions];
  }

  // Room management
  public joinRoom(roomId: string): void {
    this.rooms.add(roomId);

    if (this.isConnected()) {
      this.socket.emit('joinRoom', { roomId });
    }
  }

  public leaveRoom(roomId: string): void {
    this.rooms.delete(roomId);

    if (this.isConnected()) {
      this.socket.emit('leaveRoom', { roomId });
    }
  }

  public getRooms(): string[] {
    return [...this.rooms];
  }

  // Data synchronization
  public sync(data: Omit<SyncData, 'timestamp'>): void {
    if (this.isConnected()) {
      this.socket.emit('sync', data);
    } else {
      this.messageQueue.push({ type: 'sync', data });
    }
  }

  // Event handling
  public on(event: string, listener: (...args: any[]) => void): void {
    this.eventBus.on(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void): void {
    this.eventBus.off(event, listener);
  }

  public once(event: string, listener: (...args: any[]) => void): void {
    this.eventBus.once(event, listener);
  }

  // Utility methods
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const item = this.messageQueue.shift();
      if (item.type === 'message') {
        this.socket.emit('message', item.data);
      } else if (item.type === 'sync') {
        this.socket.emit('sync', item.data);
      }
    }
  }

  private lastPingTime: number = 0;

  private startPingMonitoring(): void {
    this.pingInterval = setInterval(() => {
      this.lastPingTime = Date.now();
      this.socket.emit('ping');
    }, 30000); // Ping every 30 seconds
  }

  private stopPingMonitoring(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = undefined;
    }
  }

  // Advanced features
  public enableDebugMode(): void {
    this.socket.onAny((event, ...args) => {
      console.log(`[Realtime Debug] ${event}:`, args);
    });
  }

  public getStats(): {
    connectionState: string;
    latency: number;
    subscriptions: number;
    rooms: number;
    queuedMessages: number;
  } {
    return {
      connectionState: this.connectionState,
      latency: this.latency,
      subscriptions: this.subscriptions.size,
      rooms: this.rooms.size,
      queuedMessages: this.messageQueue.length,
    };
  }

  // Cleanup
  public destroy(): void {
    this.stopPingMonitoring();
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.eventBus.removeAllListeners();
  }
}

// Factory function to create client
export function createRealtimeClient(config: RealtimeClientConfig): RealtimeClient {
  return new RealtimeClient(config);
}

// React hook for realtime client (if using React)
export function useRealtimeClient(config: RealtimeClientConfig) {
  const client = new RealtimeClient(config);

  // Cleanup on unmount
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      client.destroy();
    });
  }

  return client;
}
