/**
 * CODAI Real-Time System Exports
 * Comprehensive real-time communication, synchronization, and offline support
 */

// Export all real-time components
export { WebSocketManager } from './websocket-manager';
export { EventStreamHandler } from './event-stream';
export { SyncEngine } from './sync-engine';
export { OfflineQueue } from './offline-queue';

// Export types
export type {
  WebSocketOptions,
  ConnectionStats,
  WebSocketEvents
} from './websocket-manager';

export type {
  StreamEvent,
  EventFilter,
  SubscriptionOptions,
  StreamStats,
  EventStreamEvents
} from './event-stream';

export type {
  DataChange,
  SyncConflict,
  SyncState,
  SyncConfig,
  SyncStats,
  SyncOperation,
  ConflictResolution,
  SyncEvents
} from './sync-engine';

export type {
  QueueItem,
  QueueConfig,
  QueueStats,
  QueuePriority,
  QueueStatus,
  NetworkStatus,
  QueueEvents
} from './offline-queue';

/**
 * CODAI Real-Time Integration Hub
 * Central orchestrator for real-time communication, synchronization, and offline support
 */

import { EventEmitter } from 'eventemitter3';
import type { CodaiConfig } from '../types';
import { WebSocketManager } from './websocket-manager';
import { EventStreamHandler } from './event-stream';
import { SyncEngine } from './sync-engine';
import { OfflineQueue } from './offline-queue';

// Integration hub configuration
export interface RealTimeConfig {
  websocket: {
    enabled: boolean;
    url?: string;
    autoConnect: boolean;
    reconnectInterval: number;
    maxReconnectAttempts: number;
  };
  events: {
    enabled: boolean;
    bufferSize: number;
    batchSize: number;
    flushInterval: number;
  };
  sync: {
    enabled: boolean;
    interval: number;
    conflictResolution: 'client-wins' | 'server-wins' | 'last-write-wins' | 'merge' | 'manual';
    enableVersioning: boolean;
  };
  offline: {
    enabled: boolean;
    maxQueueSize: number;
    maxRetryAttempts: number;
    persistQueue: boolean;
  };
  debug: boolean;
}

// Hub status information
export interface HubStatus {
  websocket: {
    connected: boolean;
    connectionCount: number;
    lastConnected?: Date;
    latency?: number;
  };
  events: {
    totalProcessed: number;
    activeStreams: number;
    bufferUsage: number;
    lastEvent?: Date;
  };
  sync: {
    totalSyncs: number;
    pendingChanges: number;
    conflicts: number;
    lastSync?: Date;
  };
  offline: {
    queueSize: number;
    pendingItems: number;
    networkStatus: string;
    lastProcessed?: Date;
  };
  overallHealth: 'healthy' | 'degraded' | 'critical';
}

// Hub events
export interface RealTimeEvents {
  'hub:ready': { status: HubStatus };
  'hub:error': { error: Error; component: string };
  'hub:status:changed': { status: HubStatus; previous: HubStatus };
  'websocket:connected': {};
  'websocket:disconnected': {};
  'sync:completed': { changes: number; conflicts: number };
  'offline:queued': { itemId: string; operation: string };
  'data:received': { entityType: string; entityId: string; data: any };
  'data:sent': { entityType: string; entityId: string; operation: string };
  'conflict:detected': { entityType: string; entityId: string; conflictId: string };
}

/**
 * Comprehensive Real-Time Integration Hub
 */
export class RealTimeHub extends EventEmitter<RealTimeEvents> {
  private config: CodaiConfig;
  private realTimeConfig: RealTimeConfig;

  // Core components
  private wsManager?: WebSocketManager;
  private eventStream?: EventStreamHandler;
  private syncEngine?: SyncEngine;
  private offlineQueue?: OfflineQueue;

  // State management
  private isInitialized = false;
  private status: HubStatus;
  private healthCheckTimer?: NodeJS.Timeout;
  private statsUpdateTimer?: NodeJS.Timeout;

  constructor(config: CodaiConfig, realTimeConfig: Partial<RealTimeConfig> = {}) {
    super();
    this.config = config;

    this.realTimeConfig = {
      websocket: {
        enabled: true,
        autoConnect: true,
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
        ...realTimeConfig.websocket
      },
      events: {
        enabled: true,
        bufferSize: 1000,
        batchSize: 50,
        flushInterval: 1000,
        ...realTimeConfig.events
      },
      sync: {
        enabled: true,
        interval: 10000,
        conflictResolution: 'last-write-wins',
        enableVersioning: true,
        ...realTimeConfig.sync
      },
      offline: {
        enabled: true,
        maxQueueSize: 1000,
        maxRetryAttempts: 5,
        persistQueue: true,
        ...realTimeConfig.offline
      },
      debug: realTimeConfig.debug ?? config.debug
    };

    this.status = this.initializeStatus();

    if (this.realTimeConfig.debug) {
      console.log('[RealTimeHub] Initialized with config:', this.realTimeConfig);
    }
  }

  /**
   * Initialize all real-time components
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[RealTimeHub] Already initialized');
      return;
    }

    try {
      // Initialize WebSocket Manager
      if (this.realTimeConfig.websocket.enabled) {
        await this.initializeWebSocket();
      }

      // Initialize Event Stream Handler
      if (this.realTimeConfig.events.enabled) {
        await this.initializeEventStream();
      }

      // Initialize Sync Engine
      if (this.realTimeConfig.sync.enabled) {
        await this.initializeSyncEngine();
      }

      // Initialize Offline Queue
      if (this.realTimeConfig.offline.enabled) {
        await this.initializeOfflineQueue();
      }

      // Setup cross-component communication
      this.setupComponentIntegration();

      // Start monitoring
      this.startHealthMonitoring();
      this.startStatsUpdates();

      this.isInitialized = true;
      this.updateStatus();

      this.emit('hub:ready', { status: this.status });

      if (this.realTimeConfig.debug) {
        console.log('[RealTimeHub] Initialization complete');
      }

    } catch (error) {
      this.emit('hub:error', { error: error as Error, component: 'hub' });
      throw error;
    }
  }

  /**
   * Send data change to real-time system
   */
  async sendChange(
    entityType: string,
    entityId: string,
    operation: 'create' | 'update' | 'delete' | 'move' | 'copy',
    data: any,
    options: {
      priority?: 'low' | 'normal' | 'high' | 'critical';
      immediate?: boolean;
      offline?: boolean;
    } = {}
  ): Promise<boolean> {
    try {
      // Check if we should queue for offline
      const isOffline = !this.wsManager?.isConnected();
      const shouldQueue = options.offline || isOffline || !this.realTimeConfig.websocket.enabled;

      if (shouldQueue && this.offlineQueue) {
        // Queue for offline processing
        const itemId = await this.offlineQueue.enqueue(
          entityType,
          entityId,
          operation,
          data,
          {
            priority: options.priority || 'normal',
            metadata: { immediate: options.immediate }
          }
        );

        if (itemId) {
          this.emit('offline:queued', { itemId, operation });
          return true;
        }
        return false;
      }

      // Send immediately if online
      if (this.syncEngine) {
        await this.syncEngine.recordChange(entityType, entityId, operation, data);

        if (options.immediate && this.wsManager?.isConnected()) {
          const success = await this.syncEngine.syncEntity(entityType, entityId);
          if (success) {
            this.emit('data:sent', { entityType, entityId, operation });
          }
          return success;
        }

        return true;
      }

      return false;

    } catch (error) {
      this.emit('hub:error', { error: error as Error, component: 'send' });
      return false;
    }
  }

  /**
   * Subscribe to real-time data changes
   */
  subscribeToChanges(
    entityType: string,
    callback: (data: { entityId: string; operation: string; data: any }) => void,
    options: {
      entityId?: string;
      operations?: string[];
      buffer?: boolean;
    } = {}
  ): string | null {
    if (!this.eventStream) {
      console.warn('[RealTimeHub] Event stream not available');
      return null;
    }

    const subscriptionId = this.eventStream.subscribe(
      `${entityType}:changes`,
      (events) => {
        events.forEach(event => {
          if (event.type === 'data' && event.subtype === 'change') {
            const changeData = event.payload as any;

            // Filter by entityId if specified
            if (options.entityId && changeData.entityId !== options.entityId) {
              return;
            }

            // Filter by operations if specified
            if (options.operations && !options.operations.includes(changeData.operation)) {
              return;
            }

            callback({
              entityId: changeData.entityId,
              operation: changeData.operation,
              data: changeData.data
            });
          }
        });
      },
      {
        filter: {
          types: ['data'],
          subtypes: ['change']
        },
        buffered: options.buffer || false
      }
    );

    return subscriptionId;
  }

  /**
   * Unsubscribe from real-time changes
   */
  unsubscribe(subscriptionId: string): boolean {
    if (!this.eventStream) {
      return false;
    }

    return this.eventStream.unsubscribe(subscriptionId);
  }

  /**
   * Force sync all pending changes
   */
  async forceSyncAll(): Promise<{ successful: number; failed: number; conflicts: number }> {
    if (!this.syncEngine) {
      return { successful: 0, failed: 0, conflicts: 0 };
    }

    try {
      const result = await this.syncEngine.syncAll();
      this.emit('sync:completed', { changes: result.successful + result.failed, conflicts: result.conflicts });
      return result;
    } catch (error) {
      this.emit('hub:error', { error: error as Error, component: 'sync' });
      return { successful: 0, failed: 0, conflicts: 0 };
    }
  }

  /**
   * Process offline queue
   */
  async processOfflineQueue(): Promise<{ processed: number; successful: number; failed: number }> {
    if (!this.offlineQueue) {
      return { processed: 0, successful: 0, failed: 0 };
    }

    try {
      return await this.offlineQueue.forceProcess();
    } catch (error) {
      this.emit('hub:error', { error: error as Error, component: 'offline' });
      return { processed: 0, successful: 0, failed: 0 };
    }
  }

  /**
   * Get current hub status
   */
  getStatus(): HubStatus {
    this.updateStatus();
    return { ...this.status };
  }

  /**
   * Get sync conflicts
   */
  getConflicts(): any[] {
    if (!this.syncEngine) {
      return [];
    }

    return this.syncEngine.getConflicts();
  }

  /**
   * Resolve a sync conflict
   */
  async resolveConflict(conflictId: string, resolution: any): Promise<boolean> {
    if (!this.syncEngine) {
      return false;
    }

    try {
      return await this.syncEngine.resolveConflict(conflictId, resolution);
    } catch (error) {
      this.emit('hub:error', { error: error as Error, component: 'conflict' });
      return false;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RealTimeConfig>): void {
    const oldConfig = { ...this.realTimeConfig };
    this.realTimeConfig = { ...this.realTimeConfig, ...config };

    // Update component configs
    if (config.sync && this.syncEngine) {
      this.syncEngine.updateConfig({
        syncInterval: config.sync.interval,
        conflictResolution: config.sync.conflictResolution,
        enableVersioning: config.sync.enableVersioning
      });
    }

    if (config.offline && this.offlineQueue) {
      this.offlineQueue.updateConfig({
        maxItems: config.offline.maxQueueSize,
        maxRetryAttempts: config.offline.maxRetryAttempts,
        persistenceEnabled: config.offline.persistQueue
      });
    }

    if (this.realTimeConfig.debug) {
      console.log('[RealTimeHub] Configuration updated');
    }
  }

  /**
   * Shutdown the hub and cleanup resources
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Stop monitoring
      this.stopHealthMonitoring();
      this.stopStatsUpdates();

      // Cleanup components
      if (this.offlineQueue) {
        this.offlineQueue.destroy();
      }

      if (this.syncEngine) {
        this.syncEngine.destroy();
      }

      if (this.eventStream) {
        this.eventStream.destroy();
      }

      if (this.wsManager) {
        await this.wsManager.disconnect();
        this.wsManager.destroy();
      }

      this.isInitialized = false;
      this.removeAllListeners();

      if (this.realTimeConfig.debug) {
        console.log('[RealTimeHub] Shutdown complete');
      }

    } catch (error) {
      this.emit('hub:error', { error: error as Error, component: 'shutdown' });
    }
  }

  // Private methods

  private async initializeWebSocket(): Promise<void> {
    const wsUrl = this.realTimeConfig.websocket.url || this.generateWebSocketUrl();

    this.wsManager = new WebSocketManager(this.config, {
      url: wsUrl,
      autoReconnect: true,
      reconnectInterval: this.realTimeConfig.websocket.reconnectInterval,
      maxReconnectAttempts: this.realTimeConfig.websocket.maxReconnectAttempts,
      heartbeatInterval: 30000
    });

    // Setup WebSocket event handlers
    this.wsManager.on('connected', () => {
      this.emit('websocket:connected', {});
      this.updateStatus();
    });

    this.wsManager.on('disconnected', () => {
      this.emit('websocket:disconnected', {});
      this.updateStatus();
    });

    this.wsManager.on('error', (data) => {
      this.emit('hub:error', { error: data.error, component: 'websocket' });
    });

    if (this.realTimeConfig.websocket.autoConnect) {
      await this.wsManager.connect();
    }
  }

  private async initializeEventStream(): Promise<void> {
    if (!this.wsManager) {
      throw new Error('WebSocket manager required for event stream');
    }

    this.eventStream = new EventStreamHandler(this.config, this.wsManager);

    // Setup event handlers
    this.eventStream.on('event:received', (data) => {
      if (data.event.type === 'data' && data.event.subtype === 'change') {
        const changeData = data.event.payload as any;
        this.emit('data:received', {
          entityType: changeData.entityType,
          entityId: changeData.entityId,
          data: changeData.data
        });
      }
    });

    this.eventStream.on('error', (data) => {
      this.emit('hub:error', { error: data.error, component: 'events' });
    });
  }

  private async initializeSyncEngine(): Promise<void> {
    if (!this.wsManager || !this.eventStream) {
      throw new Error('WebSocket manager and event stream required for sync engine');
    }

    this.syncEngine = new SyncEngine(this.config, this.wsManager, this.eventStream, {
      syncInterval: this.realTimeConfig.sync.interval,
      conflictResolution: this.realTimeConfig.sync.conflictResolution,
      enableVersioning: this.realTimeConfig.sync.enableVersioning
    });

    // Setup sync event handlers
    this.syncEngine.on('sync:completed', (data) => {
      this.emit('sync:completed', { changes: data.changes, conflicts: data.conflicts });
    });

    this.syncEngine.on('conflict:detected', (data) => {
      this.emit('conflict:detected', {
        entityType: data.conflict.entityType,
        entityId: data.conflict.entityId,
        conflictId: data.conflict.id
      });
    });

    this.syncEngine.on('error', (data) => {
      this.emit('hub:error', { error: data.error, component: 'sync' });
    });
  }

  private async initializeOfflineQueue(): Promise<void> {
    if (!this.syncEngine) {
      throw new Error('Sync engine required for offline queue');
    }

    this.offlineQueue = new OfflineQueue(this.config, this.syncEngine, {
      maxItems: this.realTimeConfig.offline.maxQueueSize,
      maxRetryAttempts: this.realTimeConfig.offline.maxRetryAttempts,
      persistenceEnabled: this.realTimeConfig.offline.persistQueue
    });

    // Setup offline queue event handlers
    this.offlineQueue.on('item:added', (data) => {
      this.emit('offline:queued', {
        itemId: data.item.id,
        operation: data.item.operation
      });
    });

    this.offlineQueue.on('error', (data) => {
      this.emit('hub:error', { error: data.error, component: 'offline' });
    });
  }

  private setupComponentIntegration(): void {
    // Integration logic between components
    if (this.wsManager && this.offlineQueue) {
      // When connection is restored, process offline queue
      this.wsManager.on('connected', () => {
        this.processOfflineQueue();
      });
    }
  }

  private generateWebSocketUrl(): string {
    const protocol = this.config.environment === 'production' ? 'wss' : 'ws';
    const baseUrl = this.config.baseUrl || 'localhost:3000';
    return `${protocol}://${baseUrl}/ws`;
  }

  private initializeStatus(): HubStatus {
    return {
      websocket: {
        connected: false,
        connectionCount: 0
      },
      events: {
        totalProcessed: 0,
        activeStreams: 0,
        bufferUsage: 0
      },
      sync: {
        totalSyncs: 0,
        pendingChanges: 0,
        conflicts: 0
      },
      offline: {
        queueSize: 0,
        pendingItems: 0,
        networkStatus: 'online'
      },
      overallHealth: 'healthy'
    };
  }

  private updateStatus(): void {
    const previousStatus = { ...this.status };

    // Update WebSocket status
    if (this.wsManager) {
      const wsStats = this.wsManager.getStats();
      this.status.websocket = {
        connected: this.wsManager.isConnected(),
        connectionCount: wsStats.totalConnections || 0,
        lastConnected: wsStats.connectTime,
        latency: wsStats.latency || 0
      };
    }

    // Update Events status
    if (this.eventStream) {
      const eventStats = this.eventStream.getStats();
      this.status.events = {
        totalProcessed: eventStats.totalProcessed || eventStats.totalEvents,
        activeStreams: eventStats.activeSubscriptions,
        bufferUsage: eventStats.bufferUsage || 0,
        lastEvent: eventStats.lastEvent
      };
    }

    // Update Sync status
    if (this.syncEngine) {
      const syncStats = this.syncEngine.getStats();
      this.status.sync = {
        totalSyncs: syncStats.totalSyncs,
        pendingChanges: syncStats.pendingChanges,
        conflicts: syncStats.conflictsDetected - syncStats.conflictsResolved,
        lastSync: syncStats.lastSyncTime
      };
    }

    // Update Offline status
    if (this.offlineQueue) {
      const queueStats = this.offlineQueue.getStats();
      this.status.offline = {
        queueSize: queueStats.totalItems,
        pendingItems: queueStats.pendingItems,
        networkStatus: queueStats.networkStatus,
        lastProcessed: queueStats.lastProcessed
      };
    }

    // Calculate overall health
    this.status.overallHealth = this.calculateOverallHealth();

    // Emit status change if different
    if (JSON.stringify(previousStatus) !== JSON.stringify(this.status)) {
      this.emit('hub:status:changed', { status: this.status, previous: previousStatus });
    }
  }

  private calculateOverallHealth(): 'healthy' | 'degraded' | 'critical' {
    let healthScore = 0;
    let maxScore = 0;

    // WebSocket health
    if (this.realTimeConfig.websocket.enabled) {
      maxScore += 25;
      if (this.status.websocket.connected) {
        healthScore += 25;
      } else {
        healthScore += 5; // Partial credit for offline mode
      }
    }

    // Sync health
    if (this.realTimeConfig.sync.enabled) {
      maxScore += 25;
      if (this.status.sync.conflicts === 0) {
        healthScore += 25;
      } else if (this.status.sync.conflicts < 5) {
        healthScore += 15;
      } else {
        healthScore += 5;
      }
    }

    // Events health
    if (this.realTimeConfig.events.enabled) {
      maxScore += 25;
      if (this.status.events.bufferUsage < 80) {
        healthScore += 25;
      } else if (this.status.events.bufferUsage < 95) {
        healthScore += 15;
      } else {
        healthScore += 5;
      }
    }

    // Offline queue health
    if (this.realTimeConfig.offline.enabled) {
      maxScore += 25;
      const queueUsage = (this.status.offline.queueSize / this.realTimeConfig.offline.maxQueueSize) * 100;
      if (queueUsage < 70) {
        healthScore += 25;
      } else if (queueUsage < 90) {
        healthScore += 15;
      } else {
        healthScore += 5;
      }
    }

    const healthPercentage = maxScore > 0 ? (healthScore / maxScore) * 100 : 100;

    if (healthPercentage >= 80) return 'healthy';
    if (healthPercentage >= 60) return 'degraded';
    return 'critical';
  }

  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(() => {
      this.updateStatus();
    }, 5000); // Update every 5 seconds
  }

  private stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  private startStatsUpdates(): void {
    this.statsUpdateTimer = setInterval(() => {
      this.updateStatus();
    }, 10000); // Update stats every 10 seconds
  }

  private stopStatsUpdates(): void {
    if (this.statsUpdateTimer) {
      clearInterval(this.statsUpdateTimer);
      this.statsUpdateTimer = undefined;
    }
  }
}
