/**
 * CODAI Cross-App Data Bridge
 * Seamless data sharing and synchronization between all CODAI applications
 */

import { EventEmitter } from 'eventemitter3';
import type { CodaiConfig } from '../types';
import type { GlobalStateStore } from './global-store';
import type { RealTimeHub } from '../realtime';

// Data bridge types
export interface DataBridgeConfig {
  namespace: string;
  enableCache: boolean;
  cacheTimeout: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  maxDataSize: number;
  retryAttempts: number;
  batchSize: number;
}

// Cross-app data schema
export interface CrossAppData {
  id: string;
  sourceApp: string;
  targetApp?: string; // undefined means broadcast to all apps
  dataType: string;
  payload: any;
  metadata: {
    version: string;
    timestamp: number;
    ttl?: number; // time to live in ms
    priority: 'low' | 'normal' | 'high' | 'critical';
    encrypted: boolean;
    compressed: boolean;
    schema?: string;
  };
  routing: {
    broadcast: boolean;
    targetApps: string[];
    excludeApps: string[];
  };
}

// Data subscription
export interface DataSubscription {
  id: string;
  appId: string;
  dataTypes: string[];
  sourceApps: string[];
  callback: DataCallback;
  filter?: DataFilter;
  transform?: DataTransformer;
  options: SubscriptionOptions;
}

// Data callbacks and filters
export type DataCallback = (data: CrossAppData) => void | Promise<void>;
export type DataFilter = (data: CrossAppData) => boolean;
export type DataTransformer = (data: CrossAppData) => CrossAppData;

// Subscription options
export interface SubscriptionOptions {
  immediate?: boolean;
  persistent?: boolean;
  buffered?: boolean;
  batchSize?: number;
  debounce?: number;
  priority?: number;
}

// Data bridge events
export interface DataBridgeEvents {
  'data:sent': { data: CrossAppData; targetApps: string[] };
  'data:received': { data: CrossAppData; fromApp: string };
  'data:broadcast': { data: CrossAppData; recipients: number };
  'subscription:added': { subscription: DataSubscription };
  'subscription:removed': { subscriptionId: string };
  'cache:hit': { dataId: string; dataType: string };
  'cache:miss': { dataId: string; dataType: string };
  'error': { error: Error; context: string };
  'stats:updated': { stats: DataBridgeStats };
}

// Bridge statistics
export interface DataBridgeStats {
  totalDataSent: number;
  totalDataReceived: number;
  totalBroadcasts: number;
  activeSubscriptions: number;
  cacheHitRate: number;
  averageLatency: number;
  dataTransferred: number;
  errorsCount: number;
  lastActivity: Date;
}

/**
 * Cross-App Data Bridge for seamless data sharing
 */
export class CrossAppDataBridge extends EventEmitter<DataBridgeEvents> {
  private config: CodaiConfig;
  private bridgeConfig: DataBridgeConfig;
  private stateStore: GlobalStateStore;
  private realTimeHub?: RealTimeHub;

  // Data management
  private subscriptions = new Map<string, DataSubscription>();
  private dataCache = new Map<string, { data: CrossAppData; expiry: number }>();
  private pendingData = new Map<string, CrossAppData[]>();
  private stats: DataBridgeStats;

  // Internal state
  private cleanupTimer?: NodeJS.Timeout;
  private batchTimer?: NodeJS.Timeout;
  private latencyTracker = new Map<string, number>();

  constructor(
    config: CodaiConfig,
    stateStore: GlobalStateStore,
    bridgeConfig: Partial<DataBridgeConfig> = {},
    realTimeHub?: RealTimeHub
  ) {
    super();
    this.config = config;
    this.stateStore = stateStore;
    this.realTimeHub = realTimeHub;

    this.bridgeConfig = {
      namespace: `bridge_${config.appId}`,
      enableCache: true,
      cacheTimeout: 300000, // 5 minutes
      enableCompression: true,
      enableEncryption: false,
      maxDataSize: 1024 * 1024, // 1MB
      retryAttempts: 3,
      batchSize: 50,
      ...bridgeConfig
    };

    this.stats = {
      totalDataSent: 0,
      totalDataReceived: 0,
      totalBroadcasts: 0,
      activeSubscriptions: 0,
      cacheHitRate: 0,
      averageLatency: 0,
      dataTransferred: 0,
      errorsCount: 0,
      lastActivity: new Date()
    };

    this.setupRealTimeSync();
    this.startCleanupTimer();

    if (this.config.debug) {
      console.log('[CrossAppDataBridge] Initialized with config:', this.bridgeConfig);
    }
  }

  /**
   * Send data to specific app(s)
   */
  async sendData(
    targetApp: string | string[],
    dataType: string,
    payload: any,
    options: {
      priority?: 'low' | 'normal' | 'high' | 'critical';
      ttl?: number;
      metadata?: Record<string, any>;
      schema?: string;
    } = {}
  ): Promise<string> {
    try {
      const targetApps = Array.isArray(targetApp) ? targetApp : [targetApp];

      const data: CrossAppData = {
        id: this.generateDataId(),
        sourceApp: this.config.appId,
        dataType,
        payload,
        metadata: {
          version: this.config.apiVersion,
          timestamp: Date.now(),
          ttl: options.ttl,
          priority: options.priority || 'normal',
          encrypted: this.bridgeConfig.enableEncryption,
          compressed: this.bridgeConfig.enableCompression,
          schema: options.schema,
          ...options.metadata
        },
        routing: {
          broadcast: false,
          targetApps,
          excludeApps: []
        }
      };

      // Validate data size
      const dataSize = this.calculateDataSize(data);
      if (dataSize > this.bridgeConfig.maxDataSize) {
        throw new Error(`Data size ${dataSize} exceeds maximum ${this.bridgeConfig.maxDataSize}`);
      }

      // Store in state for persistence
      await this.storeData(data);

      // Send via real-time hub if available
      if (this.realTimeHub) {
        await this.sendViaRealTime(data);
      }

      // Cache if enabled
      if (this.bridgeConfig.enableCache) {
        this.cacheData(data);
      }

      this.stats.totalDataSent++;
      this.stats.dataTransferred += dataSize;
      this.stats.lastActivity = new Date();
      this.updateStats();

      this.emit('data:sent', { data, targetApps });

      if (this.config.debug) {
        console.log(`[CrossAppDataBridge] Sent ${dataType} to ${targetApps.join(', ')}`);
      }

      return data.id;

    } catch (error) {
      this.stats.errorsCount++;
      this.emit('error', { error: error as Error, context: 'sendData' });
      throw error;
    }
  }

  /**
   * Broadcast data to all apps
   */
  async broadcastData(
    dataType: string,
    payload: any,
    options: {
      excludeApps?: string[];
      priority?: 'low' | 'normal' | 'high' | 'critical';
      ttl?: number;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string> {
    try {
      const data: CrossAppData = {
        id: this.generateDataId(),
        sourceApp: this.config.appId,
        dataType,
        payload,
        metadata: {
          version: this.config.apiVersion,
          timestamp: Date.now(),
          ttl: options.ttl,
          priority: options.priority || 'normal',
          encrypted: this.bridgeConfig.enableEncryption,
          compressed: this.bridgeConfig.enableCompression,
          ...options.metadata
        },
        routing: {
          broadcast: true,
          targetApps: [],
          excludeApps: options.excludeApps || []
        }
      };

      // Store in state for persistence
      await this.storeData(data);

      // Broadcast via real-time hub
      if (this.realTimeHub) {
        await this.broadcastViaRealTime(data);
      }

      // Cache if enabled
      if (this.bridgeConfig.enableCache) {
        this.cacheData(data);
      }

      const recipientCount = this.calculateRecipientCount(data);
      this.stats.totalBroadcasts++;
      this.stats.dataTransferred += this.calculateDataSize(data);
      this.stats.lastActivity = new Date();
      this.updateStats();

      this.emit('data:broadcast', { data, recipients: recipientCount });

      if (this.config.debug) {
        console.log(`[CrossAppDataBridge] Broadcast ${dataType} to ${recipientCount} apps`);
      }

      return data.id;

    } catch (error) {
      this.stats.errorsCount++;
      this.emit('error', { error: error as Error, context: 'broadcastData' });
      throw error;
    }
  }

  /**
   * Subscribe to data from specific apps and types
   */
  subscribeToData(
    dataTypes: string | string[],
    callback: DataCallback,
    options: SubscriptionOptions & {
      sourceApps?: string[];
      filter?: DataFilter;
      transform?: DataTransformer;
    } = {}
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    const dataTypesArray = Array.isArray(dataTypes) ? dataTypes : [dataTypes];

    const subscription: DataSubscription = {
      id: subscriptionId,
      appId: this.config.appId,
      dataTypes: dataTypesArray,
      sourceApps: options.sourceApps || [],
      callback,
      filter: options.filter,
      transform: options.transform,
      options
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Subscribe to state changes for each data type
    dataTypesArray.forEach(dataType => {
      const statePath = `bridge.${dataType}`;
      this.stateStore.subscribe(
        statePath,
        (value) => this.handleStateChange(value, subscription),
        {
          immediate: options.immediate,
          debounce: options.debounce
        }
      );
    });

    this.stats.activeSubscriptions++;
    this.updateStats();

    this.emit('subscription:added', { subscription });

    if (this.config.debug) {
      console.log(`[CrossAppDataBridge] Subscribed to ${dataTypesArray.join(', ')} (ID: ${subscriptionId})`);
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from data
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    this.subscriptions.delete(subscriptionId);
    this.stats.activeSubscriptions--;
    this.updateStats();

    this.emit('subscription:removed', { subscriptionId });

    if (this.config.debug) {
      console.log(`[CrossAppDataBridge] Unsubscribed ${subscriptionId}`);
    }

    return true;
  }

  /**
   * Get cached data
   */
  getCachedData(dataId: string): CrossAppData | null {
    if (!this.bridgeConfig.enableCache) {
      return null;
    }

    const cached = this.dataCache.get(dataId);
    if (!cached) {
      this.emit('cache:miss', { dataId, dataType: 'unknown' });
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.dataCache.delete(dataId);
      this.emit('cache:miss', { dataId, dataType: cached.data.dataType });
      return null;
    }

    this.emit('cache:hit', { dataId, dataType: cached.data.dataType });
    return cached.data;
  }

  /**
   * Query data by type and filters
   */
  async queryData(
    dataType: string,
    filter?: (data: CrossAppData) => boolean,
    limit?: number
  ): Promise<CrossAppData[]> {
    try {
      const statePath = `bridge.${dataType}`;
      const stateData = this.stateStore.get(statePath);

      if (!stateData || !Array.isArray(stateData)) {
        return [];
      }

      let results = stateData as CrossAppData[];

      if (filter) {
        results = results.filter(filter);
      }

      if (limit) {
        results = results.slice(0, limit);
      }

      return results;

    } catch (error) {
      this.emit('error', { error: error as Error, context: 'queryData' });
      return [];
    }
  }

  /**
   * Clear expired data and cache
   */
  cleanup(): void {
    const now = Date.now();

    // Clear expired cache entries
    for (const [dataId, cached] of this.dataCache.entries()) {
      if (now > cached.expiry) {
        this.dataCache.delete(dataId);
      }
    }

    // Clear expired state data
    this.clearExpiredStateData(now);

    if (this.config.debug) {
      console.log('[CrossAppDataBridge] Cleanup completed');
    }
  }

  /**
   * Get bridge statistics
   */
  getStats(): DataBridgeStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Update bridge configuration
   */
  updateConfig(config: Partial<DataBridgeConfig>): void {
    this.bridgeConfig = { ...this.bridgeConfig, ...config };

    if (this.config.debug) {
      console.log('[CrossAppDataBridge] Configuration updated:', config);
    }
  }

  // Private methods

  private async storeData(data: CrossAppData): Promise<void> {
    const statePath = `bridge.${data.dataType}`;
    const existingData = this.stateStore.get(statePath) as CrossAppData[] || [];

    // Add new data
    existingData.push(data);

    // Keep only recent data (last 100 items per type)
    if (existingData.length > 100) {
      existingData.splice(0, existingData.length - 100);
    }

    this.stateStore.set(statePath, existingData, {
      sync: true,
      metadata: { bridgeOperation: true }
    });
  }

  private async sendViaRealTime(data: CrossAppData): Promise<void> {
    if (!this.realTimeHub) {
      return;
    }

    const startTime = Date.now();

    try {
      await this.realTimeHub.sendChange(
        'bridge',
        data.id,
        'create',
        data,
        { priority: data.metadata.priority }
      );

      // Track latency
      const latency = Date.now() - startTime;
      this.latencyTracker.set(data.id, latency);
      this.updateAverageLatency();

    } catch (error) {
      throw new Error(`Failed to send via real-time: ${error}`);
    }
  }

  private async broadcastViaRealTime(data: CrossAppData): Promise<void> {
    if (!this.realTimeHub) {
      return;
    }

    try {
      await this.realTimeHub.sendChange(
        'bridge',
        `broadcast_${data.id}`,
        'create',
        data,
        { priority: data.metadata.priority }
      );

    } catch (error) {
      throw new Error(`Failed to broadcast via real-time: ${error}`);
    }
  }

  private cacheData(data: CrossAppData): void {
    const ttl = data.metadata.ttl || this.bridgeConfig.cacheTimeout;
    const expiry = Date.now() + ttl;

    this.dataCache.set(data.id, { data, expiry });
  }

  private handleStateChange(value: any, subscription: DataSubscription): void {
    if (!Array.isArray(value)) {
      return;
    }

    const dataArray = value as CrossAppData[];

    dataArray.forEach(data => {
      // Skip if from same app
      if (data.sourceApp === this.config.appId) {
        return;
      }

      // Check source app filter
      if (subscription.sourceApps.length > 0 &&
        !subscription.sourceApps.includes(data.sourceApp)) {
        return;
      }

      // Apply filter if provided
      if (subscription.filter && !subscription.filter(data)) {
        return;
      }

      // Apply transform if provided
      let finalData = data;
      if (subscription.transform) {
        finalData = subscription.transform(data);
      }

      // Call the callback
      try {
        subscription.callback(finalData);

        this.stats.totalDataReceived++;
        this.stats.lastActivity = new Date();
        this.emit('data:received', { data: finalData, fromApp: data.sourceApp });

      } catch (error) {
        this.emit('error', { error: error as Error, context: 'callback' });
      }
    });
  }

  private setupRealTimeSync(): void {
    if (!this.realTimeHub) {
      return;
    }

    // Subscribe to bridge data changes
    this.realTimeHub.subscribeToChanges(
      'bridge',
      (data: any) => this.handleRealTimeData(data),
      { operations: ['create', 'update'] }
    );

    if (this.config.debug) {
      console.log('[CrossAppDataBridge] Real-time sync enabled');
    }
  }

  private handleRealTimeData(data: any): void {
    try {
      const crossAppData = data.data as CrossAppData;

      // Skip if from same app
      if (crossAppData.sourceApp === this.config.appId) {
        return;
      }

      // Process based on routing
      if (crossAppData.routing.broadcast) {
        // Check if excluded
        if (crossAppData.routing.excludeApps.includes(this.config.appId)) {
          return;
        }
      } else {
        // Check if targeted
        if (!crossAppData.routing.targetApps.includes(this.config.appId)) {
          return;
        }
      }

      // Store the received data
      this.storeData(crossAppData);

    } catch (error) {
      this.emit('error', { error: error as Error, context: 'handleRealTimeData' });
    }
  }

  private clearExpiredStateData(now: number): void {
    // This would clear expired data from state store
    // Implementation depends on specific TTL handling strategy
  }

  private calculateDataSize(data: CrossAppData): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private calculateRecipientCount(data: CrossAppData): number {
    // This would calculate based on known apps in the ecosystem
    // For now, return estimated count
    return 36 - data.routing.excludeApps.length;
  }

  private updateAverageLatency(): void {
    if (this.latencyTracker.size === 0) {
      return;
    }

    const latencies = Array.from(this.latencyTracker.values());
    this.stats.averageLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;

    // Keep only recent latencies
    if (this.latencyTracker.size > 100) {
      const oldestKey = Array.from(this.latencyTracker.keys())[0];
      this.latencyTracker.delete(oldestKey);
    }
  }

  private updateStats(): void {
    // Calculate cache hit rate
    const totalCacheRequests = this.stats.totalDataReceived + this.stats.totalDataSent;
    if (totalCacheRequests > 0) {
      // This is a simplified calculation
      this.stats.cacheHitRate = (this.dataCache.size / totalCacheRequests) * 100;
    }

    this.emit('stats:updated', { stats: this.stats });
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  private generateDataId(): string {
    return `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and destroy bridge
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.subscriptions.clear();
    this.dataCache.clear();
    this.pendingData.clear();
    this.latencyTracker.clear();
    this.removeAllListeners();

    if (this.config.debug) {
      console.log('[CrossAppDataBridge] Destroyed');
    }
  }
}
