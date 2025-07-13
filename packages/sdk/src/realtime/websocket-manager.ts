/**
 * CODAI Real-Time WebSocket Manager
 * High-performance WebSocket connection management with auto-reconnection
 */

import { EventEmitter } from 'eventemitter3';
import type { CodaiConfig } from '../types';
import { ErrorUtils } from '../utils';

// WebSocket connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

// WebSocket message types
export interface WebSocketMessage {
  id?: string;
  type: string;
  payload: any;
  timestamp: number;
  source?: string;
  target?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// WebSocket connection options
export interface WebSocketOptions {
  url: string;
  protocols?: string[];
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
  maxMessageSize?: number;
  compression?: boolean;
  autoReconnect?: boolean;
}

// Connection statistics
export interface ConnectionStats {
  connected: boolean;
  connectTime?: Date;
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
  reconnectAttempts: number;
  lastHeartbeat?: Date;
  latency?: number;
  totalConnections?: number;
  lastConnected?: Date;
  averageLatency?: number;
}

// WebSocket events
export interface WebSocketEvents {
  'connection:established': { timestamp: Date; url: string };
  'connection:lost': { timestamp: Date; reason: string };
  'connection:reconnecting': { attempt: number; nextAttemptIn: number };
  'connection:failed': { error: Error; attempts: number };
  'message:received': { message: WebSocketMessage; size: number };
  'message:sent': { message: WebSocketMessage; size: number };
  'heartbeat:sent': { timestamp: Date; sequence: number };
  'heartbeat:received': { timestamp: Date; latency: number };
  'error': { error: Error; context: string };
  'connected': void;
  'disconnected': void;
}

/**
 * Advanced WebSocket Manager with enterprise features
 */
export class WebSocketManager extends EventEmitter<WebSocketEvents> {
  private config: CodaiConfig;
  private options: WebSocketOptions;
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;
  private heartbeatSequence = 0;
  private lastHeartbeatSent?: Date;
  private stats: ConnectionStats;
  private messageQueue: WebSocketMessage[] = [];
  private pendingMessages = new Map<string, { message: WebSocketMessage; resolve: Function; reject: Function; timeout: NodeJS.Timeout }>();

  constructor(config: CodaiConfig, options: WebSocketOptions) {
    super();
    this.config = config;
    this.options = {
      maxReconnectAttempts: 10,
      reconnectInterval: 5000,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
      maxMessageSize: 1024 * 1024, // 1MB
      compression: true,
      ...options
    };

    this.stats = {
      connected: false,
      messagesSent: 0,
      messagesReceived: 0,
      bytesTransferred: 0,
      reconnectAttempts: 0
    };

    if (this.config.debug) {
      console.log('[WebSocketManager] Initialized with options:', this.options);
    }
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.state === 'connected') {
        resolve();
        return;
      }

      if (this.state === 'connecting') {
        // Wait for current connection attempt
        this.once('connection:established', () => resolve());
        this.once('connection:failed', ({ error }) => reject(error));
        return;
      }

      this.setState('connecting');

      try {
        // Create WebSocket connection
        this.ws = new WebSocket(this.options.url, this.options.protocols);

        // Configure WebSocket
        if (this.options.compression && 'binaryType' in this.ws) {
          this.ws.binaryType = 'arraybuffer';
        }

        // Connection timeout
        const timeoutId = setTimeout(() => {
          if (this.state === 'connecting') {
            this.disconnect();
            reject(new Error('Connection timeout'));
          }
        }, this.options.connectionTimeout);

        // Event handlers
        this.ws.onopen = () => {
          clearTimeout(timeoutId);
          this.onConnectionOpen();
          resolve();
        };

        this.ws.onclose = (event) => {
          clearTimeout(timeoutId);
          this.onConnectionClose(event);
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeoutId);
          this.onConnectionError(error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          this.onMessage(event);
        };

      } catch (error) {
        this.setState('failed');
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.setState('disconnected');
    this.stopHeartbeat();
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    // Reject all pending messages
    this.pendingMessages.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Connection closed'));
    });
    this.pendingMessages.clear();
  }

  /**
   * Send message with optional acknowledgment
   */
  async send(message: Omit<WebSocketMessage, 'timestamp'>, waitForAck = false): Promise<boolean> {
    const fullMessage: WebSocketMessage = {
      ...message,
      id: message.id || this.generateMessageId(),
      timestamp: Date.now()
    };

    // Queue message if not connected
    if (this.state !== 'connected') {
      this.queueMessage(fullMessage);
      return false;
    }

    try {
      const serialized = JSON.stringify(fullMessage);
      const size = new Blob([serialized]).size;

      // Check message size
      if (size > this.options.maxMessageSize!) {
        throw new Error(`Message size (${size}) exceeds maximum (${this.options.maxMessageSize})`);
      }

      // Send message
      this.ws!.send(serialized);

      // Update statistics
      this.stats.messagesSent++;
      this.stats.bytesTransferred += size;

      this.emit('message:sent', { message: fullMessage, size });

      if (this.config.debug) {
        console.log('[WebSocketManager] Message sent:', fullMessage.type, fullMessage.id);
      }

      // Wait for acknowledgment if requested
      if (waitForAck && fullMessage.id) {
        return this.waitForAcknowledgment(fullMessage);
      }

      return true;
    } catch (error) {
      this.emit('error', { error: error as Error, context: 'send' });
      throw error;
    }
  }

  /**
   * Send message and wait for response
   */
  async request<T = any>(message: Omit<WebSocketMessage, 'timestamp'>, timeout = 30000): Promise<T> {
    const messageId = message.id || this.generateMessageId();
    const fullMessage: WebSocketMessage = {
      ...message,
      id: messageId,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      // Setup timeout
      const timeoutId = setTimeout(() => {
        this.pendingMessages.delete(messageId);
        reject(new Error('Request timeout'));
      }, timeout);

      // Store pending request
      this.pendingMessages.set(messageId, {
        message: fullMessage,
        resolve,
        reject,
        timeout: timeoutId
      });

      // Send message
      this.send(fullMessage).catch(reject);
    });
  }

  /**
   * Get connection statistics
   */
  getStats(): ConnectionStats {
    return {
      ...this.stats,
      connected: this.state === 'connected',
      latency: this.calculateLatency()
    };
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'connected';
  }

  /**
   * Get queued messages count
   */
  getQueuedMessagesCount(): number {
    return this.messageQueue.length;
  }

  /**
   * Clear message queue
   */
  clearQueue(): void {
    this.messageQueue = [];
  }

  /**
   * Update connection options
   */
  updateOptions(options: Partial<WebSocketOptions>): void {
    this.options = { ...this.options, ...options };

    // Restart heartbeat if interval changed
    if (options.heartbeatInterval && this.state === 'connected') {
      this.startHeartbeat();
    }
  }

  // Private methods

  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;

      if (this.config.debug) {
        console.log(`[WebSocketManager] State changed to: ${newState}`);
      }
    }
  }

  private onConnectionOpen(): void {
    this.setState('connected');
    this.stats.connected = true;
    this.stats.connectTime = new Date();
    this.reconnectAttempts = 0;

    this.emit('connection:established', {
      timestamp: new Date(),
      url: this.options.url
    });

    // Start heartbeat
    this.startHeartbeat();

    // Send queued messages
    this.processMessageQueue();
  }

  private onConnectionClose(event: CloseEvent): void {
    this.setState('disconnected');
    this.stats.connected = false;
    this.stopHeartbeat();

    this.emit('connection:lost', {
      timestamp: new Date(),
      reason: event.reason || `Code: ${event.code}`
    });

    // Auto-reconnect if not intentional disconnect
    if (event.code !== 1000 && this.reconnectAttempts < this.options.maxReconnectAttempts!) {
      this.scheduleReconnect();
    }
  }

  private onConnectionError(error: Event): void {
    this.emit('error', {
      error: new Error('WebSocket connection error'),
      context: 'connection'
    });
  }

  private onMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      const size = new Blob([event.data]).size;

      // Update statistics
      this.stats.messagesReceived++;
      this.stats.bytesTransferred += size;

      this.emit('message:received', { message, size });

      // Handle heartbeat response
      if (message.type === 'heartbeat:response') {
        this.onHeartbeatResponse(message);
        return;
      }

      // Handle request responses
      if (message.id && this.pendingMessages.has(message.id)) {
        const pending = this.pendingMessages.get(message.id)!;
        this.pendingMessages.delete(message.id);
        clearTimeout(pending.timeout);
        pending.resolve(message.payload);
        return;
      }

      if (this.config.debug) {
        console.log('[WebSocketManager] Message received:', message.type, message.id);
      }

    } catch (error) {
      this.emit('error', {
        error: error as Error,
        context: 'message parsing'
      });
    }
  }

  private scheduleReconnect(): void {
    this.setState('reconnecting');
    this.stats.reconnectAttempts++;
    this.reconnectAttempts++;

    const delay = Math.min(
      this.options.reconnectInterval! * Math.pow(1.5, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.emit('connection:reconnecting', {
      attempt: this.reconnectAttempts,
      nextAttemptIn: delay
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts!) {
          this.setState('failed');
          this.emit('connection:failed', {
            error: new Error('Max reconnection attempts reached'),
            attempts: this.reconnectAttempts
          });
        } else {
          this.scheduleReconnect();
        }
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    if (this.options.heartbeatInterval! > 0) {
      this.heartbeatTimer = setInterval(() => {
        this.sendHeartbeat();
      }, this.options.heartbeatInterval);
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private sendHeartbeat(): void {
    if (this.state === 'connected') {
      this.heartbeatSequence++;
      this.lastHeartbeatSent = new Date();

      const heartbeat: WebSocketMessage = {
        type: 'heartbeat:ping',
        payload: { sequence: this.heartbeatSequence },
        timestamp: Date.now()
      };

      this.send(heartbeat);
      this.emit('heartbeat:sent', {
        timestamp: this.lastHeartbeatSent,
        sequence: this.heartbeatSequence
      });
    }
  }

  private onHeartbeatResponse(message: WebSocketMessage): void {
    if (this.lastHeartbeatSent) {
      const latency = Date.now() - this.lastHeartbeatSent.getTime();
      this.stats.lastHeartbeat = new Date();

      this.emit('heartbeat:received', {
        timestamp: new Date(),
        latency
      });
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    // Add to queue with priority handling
    if (message.priority === 'critical') {
      this.messageQueue.unshift(message);
    } else {
      this.messageQueue.push(message);
    }

    // Limit queue size
    const maxQueueSize = 1000;
    if (this.messageQueue.length > maxQueueSize) {
      // Remove oldest non-critical messages
      this.messageQueue = this.messageQueue.filter(
        (msg, index) => msg.priority === 'critical' || index >= this.messageQueue.length - maxQueueSize
      );
    }
  }

  private async processMessageQueue(): Promise<void> {
    const queueCopy = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of queueCopy) {
      try {
        await this.send(message);
      } catch (error) {
        // Re-queue failed messages
        this.queueMessage(message);
        break;
      }
    }
  }

  private waitForAcknowledgment(message: WebSocketMessage): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Acknowledgment timeout'));
      }, 10000);

      const ackHandler = (ackMessage: { message: WebSocketMessage }) => {
        if (ackMessage.message.type === 'ack' && ackMessage.message.payload?.messageId === message.id) {
          clearTimeout(timeoutId);
          this.off('message:received', ackHandler);
          resolve(true);
        }
      };

      this.on('message:received', ackHandler);
    });
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateLatency(): number | undefined {
    if (this.stats.lastHeartbeat && this.lastHeartbeatSent) {
      return this.stats.lastHeartbeat.getTime() - this.lastHeartbeatSent.getTime();
    }
    return undefined;
  }

  /**
   * Cleanup and destroy manager
   */
  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
    this.messageQueue = [];
    this.pendingMessages.clear();
  }
}

// WebSocket connection pool for multiple connections
export class WebSocketPool {
  private connections = new Map<string, WebSocketManager>();
  private config: CodaiConfig;

  constructor(config: CodaiConfig) {
    this.config = config;
  }

  /**
   * Add connection to pool
   */
  addConnection(name: string, options: WebSocketOptions): WebSocketManager {
    if (this.connections.has(name)) {
      throw new Error(`Connection '${name}' already exists`);
    }

    const manager = new WebSocketManager(this.config, options);
    this.connections.set(name, manager);
    return manager;
  }

  /**
   * Get connection from pool
   */
  getConnection(name: string): WebSocketManager | undefined {
    return this.connections.get(name);
  }

  /**
   * Remove connection from pool
   */
  removeConnection(name: string): boolean {
    const manager = this.connections.get(name);
    if (manager) {
      manager.destroy();
      return this.connections.delete(name);
    }
    return false;
  }

  /**
   * Get all connection names
   */
  getConnectionNames(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Get pool statistics
   */
  getPoolStats(): Record<string, ConnectionStats> {
    const stats: Record<string, ConnectionStats> = {};
    this.connections.forEach((manager, name) => {
      stats[name] = manager.getStats();
    });
    return stats;
  }

  /**
   * Broadcast message to all connections
   */
  async broadcast(message: Omit<WebSocketMessage, 'timestamp'>): Promise<void> {
    const promises = Array.from(this.connections.values()).map(manager => {
      if (manager.isConnected()) {
        return manager.send(message);
      }
      return Promise.resolve(false);
    });

    await Promise.allSettled(promises);
  }

  /**
   * Destroy all connections
   */
  destroy(): void {
    this.connections.forEach(manager => manager.destroy());
    this.connections.clear();
  }
}
