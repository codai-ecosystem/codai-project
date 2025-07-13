import EventEmitter from 'eventemitter3';
import type { CodaiConfig } from '../types';

// Event types for the CODAI ecosystem
export interface CodaiEventMap {
  // SDK lifecycle events
  'sdk:init:start': { version: string; config: any; timestamp: Date };
  'sdk:init:complete': { version: string; successful: number; failed: number; timestamp: Date };
  'sdk:init:error': { error: string; timestamp: Date };
  'sdk:config:updated': { updates: any; timestamp: Date };
  'sdk:destroy:start': { timestamp: Date };
  'sdk:destroy:complete': { timestamp: Date };
  'sdk:health:check': any;
  'sdk:health:unhealthy': { services: any; timestamp: Date };

  // Authentication events
  'auth:login': { user: any; timestamp: Date };
  'auth:logout': { userId: string; timestamp: Date };
  'auth:refresh': { userId: string; timestamp: Date };
  'auth:error': { error: Error; timestamp: Date };

  // Service events
  'service:connected': { service: string; timestamp: Date };
  'service:disconnected': { service: string; timestamp: Date };
  'service:error': { service: string; error: Error; timestamp: Date };

  // Data events
  'data:created': { type: string; id: string; data: any; timestamp: Date };
  'data:updated': { type: string; id: string; data: any; timestamp: Date };
  'data:deleted': { type: string; id: string; timestamp: Date };

  // Cross-app communication events
  'app:message': { from: string; to: string; data: any; timestamp: Date };
  'app:broadcast': { from: string; data: any; timestamp: Date };

  // System events
  'system:ready': { timestamp: Date };
  'system:error': { error: Error; timestamp: Date };
}

// Universal Event Bus for cross-app communication
export class CodaiEventBus extends EventEmitter<CodaiEventMap> {
  private config: CodaiConfig;
  private appId: string;

  constructor(config: CodaiConfig) {
    super();
    this.config = config;
    this.appId = config.appId;
  }

  /**
   * Publish an event to the ecosystem
   */
  publish<K extends keyof CodaiEventMap>(
    event: K,
    data: Omit<CodaiEventMap[K], 'timestamp'>
  ): void {
    const eventData = {
      ...data,
      timestamp: new Date()
    } as CodaiEventMap[K];

    this.emit(event, eventData);

    // Also send to global event bus if configured
    if (this.config.debug) {
      console.log(`[CODAI Event] ${this.appId} -> ${event}:`, eventData);
    }
  }

  /**
   * Subscribe to ecosystem events
   */
  subscribe<K extends keyof CodaiEventMap>(
    event: K,
    handler: (data: CodaiEventMap[K]) => void
  ): () => void {
    this.on(event, handler);
    return () => this.off(event, handler);
  }

  /**
   * Send message to specific app
   */
  sendMessage(targetApp: string, data: any): void {
    this.publish('app:message', {
      from: this.appId,
      to: targetApp,
      data
    });
  }

  /**
   * Broadcast message to all apps
   */
  broadcast(data: any): void {
    this.publish('app:broadcast', {
      from: this.appId,
      data
    });
  }

  /**
   * Health check for event system
   */
  healthCheck(): { status: 'healthy' | 'unhealthy'; listenerCount: number } {
    const totalListeners = this.eventNames().reduce(
      (count, event) => count + this.listenerCount(event),
      0
    );

    return {
      status: totalListeners > 0 ? 'healthy' : 'unhealthy',
      listenerCount: totalListeners
    };
  }
}

// Event utilities
export class EventUtils {
  /**
   * Create a typed event emitter for specific service
   */
  static createServiceEmitter<T extends Record<string, any>>(): EventEmitter<T> {
    return new EventEmitter<T>();
  }

  /**
   * Batch events for performance
   */
  static batchEvents<T>(
    events: T[],
    batchSize: number,
    handler: (batch: T[]) => void
  ): void {
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      handler(batch);
    }
  }

  /**
   * Debounce event handler
   */
  static debounce<T extends any[]>(
    fn: (...args: T) => void,
    delay: number
  ): (...args: T) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle event handler
   */
  static throttle<T extends any[]>(
    fn: (...args: T) => void,
    limit: number
  ): (...args: T) => void {
    let inThrottle: boolean;

    return (...args: T) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}
