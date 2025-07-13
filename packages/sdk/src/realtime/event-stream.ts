/**
 * CODAI Real-Time Event Stream Handler
 * High-performance event streaming with filtering and subscription management
 */

import { EventEmitter } from 'eventemitter3';
import type { CodaiConfig } from '../types';
import type { WebSocketManager, WebSocketMessage } from './websocket-manager';
import { ErrorUtils } from '../utils';

// Event stream types
export type EventStreamType = 'user' | 'system' | 'application' | 'workflow' | 'data' | 'security' | 'analytics';

// Event priority levels
export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

// Event stream message
export interface StreamEvent {
  id: string;
  type: EventStreamType;
  subtype: string;
  payload: any;
  timestamp: number;
  source: string;
  target?: string | string[];
  priority: EventPriority;
  correlationId?: string;
  parentId?: string;
  metadata?: Record<string, any>;
  ttl?: number; // Time to live in milliseconds
}

// Event filter criteria
export interface EventFilter {
  types?: EventStreamType[];
  subtypes?: string[];
  sources?: string[];
  priorities?: EventPriority[];
  correlationIds?: string[];
  metadata?: Record<string, any>;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

// Subscription options
export interface SubscriptionOptions {
  filter?: EventFilter;
  batchSize?: number;
  batchTimeout?: number;
  bufferSize?: number;
  persistent?: boolean;
  replayFromTimestamp?: number;
  buffered?: boolean;
}

// Event subscription
export interface EventSubscription {
  id: string;
  appId: string;
  filter: EventFilter;
  options: SubscriptionOptions;
  handler: (events: StreamEvent[]) => void | Promise<void>;
  createdAt: Date;
  lastEventTime?: Date;
  eventCount: number;
  active: boolean;
}

// Stream statistics
export interface StreamStats {
  totalEvents: number;
  eventsPerSecond: number;
  activeSubscriptions: number;
  filteredEvents: number;
  droppedEvents: number;
  averageLatency: number;
  peakLatency: number;
  memoryUsage: number;
  totalProcessed?: number;
  bufferUsage?: number;
  lastEvent?: Date;
}

// Event stream events
export interface EventStreamEvents {
  'event:received': { event: StreamEvent };
  'event:filtered': { event: StreamEvent; filter: EventFilter };
  'event:dropped': { event: StreamEvent; reason: string };
  'subscription:created': { subscription: EventSubscription };
  'subscription:removed': { subscriptionId: string };
  'batch:processed': { batchSize: number; processingTime: number };
  'error': { error: Error; context: string };
  'stats:updated': { stats: StreamStats };
}

/**
 * Advanced Event Stream Handler with real-time processing
 */
export class EventStreamHandler extends EventEmitter<EventStreamEvents> {
  private config: CodaiConfig;
  private wsManager: WebSocketManager;
  private subscriptions = new Map<string, EventSubscription>();
  private eventBuffer: StreamEvent[] = [];
  private stats: StreamStats;
  private processingTimer?: NodeJS.Timeout;
  private statsTimer?: NodeJS.Timeout;
  private eventHistory: StreamEvent[] = [];
  private readonly maxHistorySize = 10000;
  private readonly maxBufferSize = 50000;
  private latencyMeasurements: number[] = [];

  constructor(config: CodaiConfig, wsManager: WebSocketManager) {
    super();
    this.config = config;
    this.wsManager = wsManager;

    this.stats = {
      totalEvents: 0,
      eventsPerSecond: 0,
      activeSubscriptions: 0,
      filteredEvents: 0,
      droppedEvents: 0,
      averageLatency: 0,
      peakLatency: 0,
      memoryUsage: 0
    };

    this.setupWebSocketHandlers();
    this.startProcessing();
    this.startStatsCollection();

    if (this.config.debug) {
      console.log('[EventStreamHandler] Initialized with WebSocket manager');
    }
  }

  /**
   * Subscribe to event stream with filtering
   */
  subscribe(
    appId: string,
    handler: (events: StreamEvent[]) => void | Promise<void>,
    options: SubscriptionOptions = {}
  ): string {
    const subscriptionId = this.generateSubscriptionId();

    const subscription: EventSubscription = {
      id: subscriptionId,
      appId,
      filter: options.filter || {},
      options: {
        batchSize: 10,
        batchTimeout: 1000,
        bufferSize: 1000,
        persistent: false,
        ...options
      },
      handler,
      createdAt: new Date(),
      eventCount: 0,
      active: true
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.updateStats();

    this.emit('subscription:created', { subscription });

    // Replay events if requested
    if (options.replayFromTimestamp) {
      this.replayEventsForSubscription(subscription, options.replayFromTimestamp);
    }

    if (this.config.debug) {
      console.log(`[EventStreamHandler] Created subscription ${subscriptionId} for app ${appId}`);
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from event stream
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = false;
      this.subscriptions.delete(subscriptionId);
      this.updateStats();

      this.emit('subscription:removed', { subscriptionId });

      if (this.config.debug) {
        console.log(`[EventStreamHandler] Removed subscription ${subscriptionId}`);
      }

      return true;
    }
    return false;
  }

  /**
   * Publish event to stream
   */
  async publish(event: Omit<StreamEvent, 'id' | 'timestamp'>): Promise<boolean> {
    const fullEvent: StreamEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: Date.now()
    };

    // Validate event
    if (!this.validateEvent(fullEvent)) {
      this.stats.droppedEvents++;
      this.emit('event:dropped', { event: fullEvent, reason: 'Invalid event structure' });
      return false;
    }

    // Check TTL
    if (fullEvent.ttl && (Date.now() - fullEvent.timestamp) > fullEvent.ttl) {
      this.stats.droppedEvents++;
      this.emit('event:dropped', { event: fullEvent, reason: 'Event TTL expired' });
      return false;
    }

    try {
      // Send via WebSocket
      const message: WebSocketMessage = {
        type: 'event:stream',
        payload: fullEvent,
        timestamp: fullEvent.timestamp,
        source: this.config.appId,
        target: typeof fullEvent.target === 'string' ? fullEvent.target : undefined,
        priority: this.mapPriorityToMessagePriority(fullEvent.priority)
      };

      await this.wsManager.send(message);

      // Add to local buffer for processing
      this.addEventToBuffer(fullEvent);

      return true;
    } catch (error) {
      this.emit('error', { error: error as Error, context: 'publish' });
      return false;
    }
  }

  /**
   * Get active subscriptions
   */
  getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): EventSubscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * Update subscription filter
   */
  updateSubscriptionFilter(subscriptionId: string, filter: EventFilter): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.filter = filter;

      if (this.config.debug) {
        console.log(`[EventStreamHandler] Updated filter for subscription ${subscriptionId}`);
      }

      return true;
    }
    return false;
  }

  /**
   * Get event stream statistics
   */
  getStats(): StreamStats {
    return { ...this.stats };
  }

  /**
   * Get recent events matching filter
   */
  getRecentEvents(filter?: EventFilter, limit = 100): StreamEvent[] {
    let events = this.eventHistory;

    if (filter) {
      events = this.filterEvents(events, filter);
    }

    return events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];

    if (this.config.debug) {
      console.log('[EventStreamHandler] Event history cleared');
    }
  }

  /**
   * Pause subscription
   */
  pauseSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = false;
      return true;
    }
    return false;
  }

  /**
   * Resume subscription
   */
  resumeSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = true;
      return true;
    }
    return false;
  }

  // Private methods

  private setupWebSocketHandlers(): void {
    this.wsManager.on('message:received', ({ message }) => {
      if (message.type === 'event:stream') {
        this.handleIncomingEvent(message.payload as StreamEvent);
      }
    });

    this.wsManager.on('connection:lost', () => {
      if (this.config.debug) {
        console.log('[EventStreamHandler] WebSocket connection lost');
      }
    });

    this.wsManager.on('connection:established', () => {
      if (this.config.debug) {
        console.log('[EventStreamHandler] WebSocket connection established');
      }
    });
  }

  private handleIncomingEvent(event: StreamEvent): void {
    const startTime = Date.now();

    // Validate event
    if (!this.validateEvent(event)) {
      this.stats.droppedEvents++;
      this.emit('event:dropped', { event, reason: 'Invalid incoming event' });
      return;
    }

    // Check TTL
    if (event.ttl && (Date.now() - event.timestamp) > event.ttl) {
      this.stats.droppedEvents++;
      this.emit('event:dropped', { event, reason: 'Event TTL expired' });
      return;
    }

    // Add to buffer
    this.addEventToBuffer(event);

    // Measure latency
    const latency = Date.now() - startTime;
    this.recordLatency(latency);

    this.emit('event:received', { event });
  }

  private addEventToBuffer(event: StreamEvent): void {
    // Add to buffer
    this.eventBuffer.push(event);

    // Add to history
    this.eventHistory.push(event);

    // Manage buffer size
    if (this.eventBuffer.length > this.maxBufferSize) {
      const removed = this.eventBuffer.splice(0, this.eventBuffer.length - this.maxBufferSize);
      this.stats.droppedEvents += removed.length;
    }

    // Manage history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.splice(0, this.eventHistory.length - this.maxHistorySize);
    }

    this.stats.totalEvents++;
  }

  private startProcessing(): void {
    this.processingTimer = setInterval(() => {
      this.processEventBuffer();
    }, 100); // Process every 100ms
  }

  private processEventBuffer(): void {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const startTime = Date.now();
    const eventsToProcess = [...this.eventBuffer];
    this.eventBuffer = [];

    // Group events by subscription
    const subscriptionBatches = new Map<string, StreamEvent[]>();

    for (const event of eventsToProcess) {
      for (const [subscriptionId, subscription] of this.subscriptions) {
        if (!subscription.active) continue;

        if (this.matchesFilter(event, subscription.filter)) {
          if (!subscriptionBatches.has(subscriptionId)) {
            subscriptionBatches.set(subscriptionId, []);
          }
          subscriptionBatches.get(subscriptionId)!.push(event);
        } else {
          this.stats.filteredEvents++;
          this.emit('event:filtered', { event, filter: subscription.filter });
        }
      }
    }

    // Process batches
    for (const [subscriptionId, events] of subscriptionBatches) {
      this.processBatchForSubscription(subscriptionId, events);
    }

    const processingTime = Date.now() - startTime;
    this.emit('batch:processed', { batchSize: eventsToProcess.length, processingTime });
  }

  private processBatchForSubscription(subscriptionId: string, events: StreamEvent[]): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || !subscription.active) {
      return;
    }

    const batchSize = subscription.options.batchSize || 10;

    // Process events in batches
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);

      try {
        const result = subscription.handler(batch);
        if (result instanceof Promise) {
          result.catch(error => {
            this.emit('error', { error, context: `subscription ${subscriptionId}` });
          });
        }

        subscription.eventCount += batch.length;
        subscription.lastEventTime = new Date();

      } catch (error) {
        this.emit('error', { error: error as Error, context: `subscription ${subscriptionId}` });
      }
    }
  }

  private matchesFilter(event: StreamEvent, filter: EventFilter): boolean {
    // Check types
    if (filter.types && !filter.types.includes(event.type)) {
      return false;
    }

    // Check subtypes
    if (filter.subtypes && !filter.subtypes.includes(event.subtype)) {
      return false;
    }

    // Check sources
    if (filter.sources && !filter.sources.includes(event.source)) {
      return false;
    }

    // Check priorities
    if (filter.priorities && !filter.priorities.includes(event.priority)) {
      return false;
    }

    // Check correlation IDs
    if (filter.correlationIds && event.correlationId &&
      !filter.correlationIds.includes(event.correlationId)) {
      return false;
    }

    // Check time range
    if (filter.timeRange) {
      const eventTime = new Date(event.timestamp);
      if (eventTime < filter.timeRange.start || eventTime > filter.timeRange.end) {
        return false;
      }
    }

    // Check metadata
    if (filter.metadata && event.metadata) {
      for (const [key, value] of Object.entries(filter.metadata)) {
        if (event.metadata[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  private filterEvents(events: StreamEvent[], filter: EventFilter): StreamEvent[] {
    return events.filter(event => this.matchesFilter(event, filter));
  }

  private replayEventsForSubscription(subscription: EventSubscription, fromTimestamp: number): void {
    const replayEvents = this.eventHistory.filter(event =>
      event.timestamp >= fromTimestamp && this.matchesFilter(event, subscription.filter)
    );

    if (replayEvents.length > 0) {
      setTimeout(() => {
        this.processBatchForSubscription(subscription.id, replayEvents);
      }, 0);
    }
  }

  private validateEvent(event: StreamEvent): boolean {
    return !!(
      event.id &&
      event.type &&
      event.subtype &&
      event.timestamp &&
      event.source &&
      event.priority &&
      event.payload !== undefined
    );
  }

  private startStatsCollection(): void {
    this.statsTimer = setInterval(() => {
      this.updateStats();
    }, 5000); // Update stats every 5 seconds
  }

  private updateStats(): void {
    this.stats.activeSubscriptions = this.subscriptions.size;
    this.stats.memoryUsage = this.calculateMemoryUsage();
    this.stats.averageLatency = this.calculateAverageLatency();
    this.stats.peakLatency = this.calculatePeakLatency();

    this.emit('stats:updated', { stats: this.stats });
  }

  private recordLatency(latency: number): void {
    this.latencyMeasurements.push(latency);

    // Keep only last 1000 measurements
    if (this.latencyMeasurements.length > 1000) {
      this.latencyMeasurements.shift();
    }
  }

  private calculateAverageLatency(): number {
    if (this.latencyMeasurements.length === 0) return 0;

    const sum = this.latencyMeasurements.reduce((a, b) => a + b, 0);
    return sum / this.latencyMeasurements.length;
  }

  private calculatePeakLatency(): number {
    if (this.latencyMeasurements.length === 0) return 0;
    return Math.max(...this.latencyMeasurements);
  }

  private calculateMemoryUsage(): number {
    // Rough estimation of memory usage
    const eventSize = JSON.stringify(this.eventHistory[0] || {}).length;
    const bufferSize = this.eventBuffer.length * eventSize;
    const historySize = this.eventHistory.length * eventSize;
    const subscriptionSize = this.subscriptions.size * 1000; // Rough estimate

    return bufferSize + historySize + subscriptionSize;
  }

  private mapPriorityToMessagePriority(priority: EventPriority): 'low' | 'medium' | 'high' | 'critical' {
    return priority;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and destroy handler
   */
  destroy(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
    }

    if (this.statsTimer) {
      clearInterval(this.statsTimer);
    }

    this.subscriptions.clear();
    this.eventBuffer = [];
    this.eventHistory = [];
    this.removeAllListeners();

    if (this.config.debug) {
      console.log('[EventStreamHandler] Destroyed');
    }
  }
}
