import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Event, Message } from './types';

export class RealtimeEventBus extends EventEmitter {
  private messageHistory: Message[] = [];
  private maxHistorySize: number = 1000;

  constructor(maxHistorySize?: number) {
    super();
    if (maxHistorySize) {
      this.maxHistorySize = maxHistorySize;
    }
  }

  // Emit a real-time event
  emitEvent(type: string, data: any, source: string, metadata?: Record<string, any>): void {
    const event: Event = {
      type,
      data,
      source,
      timestamp: Date.now(),
      metadata,
    };

    this.emit('event', event);
    this.emit(type, event);
  }

  // Send a message
  sendMessage(
    type: string,
    payload: any,
    sender: string,
    target?: string,
    channel?: string,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): string {
    const message: Message = {
      id: uuidv4(),
      type,
      payload,
      timestamp: Date.now(),
      sender,
      target,
      channel,
      priority,
    };

    // Add to history
    this.addToHistory(message);

    // Emit message
    this.emit('message', message);
    this.emit(`message:${type}`, message);

    if (channel) {
      this.emit(`channel:${channel}`, message);
    }

    if (target) {
      this.emit(`user:${target}`, message);
    }

    return message.id;
  }

  // Broadcast to all connections
  broadcast(type: string, payload: any, sender: string, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    this.sendMessage(type, payload, sender, undefined, 'broadcast', priority);
  }

  // Send to specific channel
  toChannel(channel: string, type: string, payload: any, sender: string): void {
    this.sendMessage(type, payload, sender, undefined, channel);
  }

  // Send to specific user
  toUser(userId: string, type: string, payload: any, sender: string): void {
    this.sendMessage(type, payload, sender, userId);
  }

  // Get message history
  getMessageHistory(limit?: number): Message[] {
    if (limit) {
      return this.messageHistory.slice(-limit);
    }
    return [...this.messageHistory];
  }

  // Get messages for specific channel
  getChannelHistory(channel: string, limit?: number): Message[] {
    const channelMessages = this.messageHistory.filter(msg => msg.channel === channel);
    if (limit) {
      return channelMessages.slice(-limit);
    }
    return channelMessages;
  }

  // Clear message history
  clearHistory(): void {
    this.messageHistory = [];
  }

  // Add message to history with size management
  private addToHistory(message: Message): void {
    this.messageHistory.push(message);
    
    // Trim history if it exceeds max size
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
    }
  }

  // Remove old messages (cleanup)
  cleanupOldMessages(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    this.messageHistory = this.messageHistory.filter(msg => msg.timestamp > cutoff);
  }

  // Get event statistics
  getStats(): {
    messageCount: number;
    oldestMessage: number | null;
    newestMessage: number | null;
    channelDistribution: Record<string, number>;
  } {
    const channelDistribution: Record<string, number> = {};
    
    this.messageHistory.forEach(msg => {
      if (msg.channel) {
        channelDistribution[msg.channel] = (channelDistribution[msg.channel] || 0) + 1;
      }
    });

    return {
      messageCount: this.messageHistory.length,
      oldestMessage: this.messageHistory.length > 0 ? this.messageHistory[0].timestamp : null,
      newestMessage: this.messageHistory.length > 0 ? this.messageHistory[this.messageHistory.length - 1].timestamp : null,
      channelDistribution,
    };
  }
}

// Global event bus instance
export const globalEventBus = new RealtimeEventBus();

// Event types for the CODAI ecosystem
export const CODAI_EVENTS = {
  // User events
  USER_CONNECTED: 'user:connected',
  USER_DISCONNECTED: 'user:disconnected',
  USER_AUTHENTICATED: 'user:authenticated',
  
  // Data synchronization events
  DATA_CREATED: 'data:created',
  DATA_UPDATED: 'data:updated',
  DATA_DELETED: 'data:deleted',
  DATA_SYNCED: 'data:synced',
  
  // Collaboration events
  COLLAB_JOIN: 'collaboration:join',
  COLLAB_LEAVE: 'collaboration:leave',
  COLLAB_CURSOR: 'collaboration:cursor',
  COLLAB_SELECTION: 'collaboration:selection',
  COLLAB_EDIT: 'collaboration:edit',
  
  // System events
  SYSTEM_STATUS: 'system:status',
  SYSTEM_ERROR: 'system:error',
  SYSTEM_MAINTENANCE: 'system:maintenance',
  
  // Application events
  APP_LAUNCHED: 'app:launched',
  APP_CLOSED: 'app:closed',
  APP_ERROR: 'app:error',
  
  // Notification events
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_CLEAR: 'notification:clear',
} as const;

export type CodaiEventType = typeof CODAI_EVENTS[keyof typeof CODAI_EVENTS];
