/**
 * CODAI Offline Queue System
 * Intelligent offline support with queue management and automatic retry
 */

import { EventEmitter } from 'eventemitter3';
import type { CodaiConfig } from '../types';
import type { SyncEngine, DataChange, SyncOperation } from './sync-engine';
import { ErrorUtils } from '../utils';

// Queue item priorities
export type QueuePriority = 'low' | 'normal' | 'high' | 'critical';

// Queue item status
export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Network status
export type NetworkStatus = 'online' | 'offline' | 'unstable';

// Queue item for offline operations
export interface QueueItem {
  id: string;
  entityType: string;
  entityId: string;
  operation: SyncOperation;
  data: any;
  previousData?: any;
  priority: QueuePriority;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  nextRetry?: number;
  status: QueueStatus;
  metadata: {
    source: string;
    sessionId: string;
    correlationId?: string;
    userAgent?: string;
    context?: any;
  };
  error?: Error;
  estimatedSize: number;
}

// Queue configuration
export interface QueueConfig {
  maxItems: number;
  maxSizeBytes: number;
  maxRetryAttempts: number;
  retryDelayBase: number;
  retryDelayMax: number;
  priorityWeights: Record<QueuePriority, number>;
  persistenceEnabled: boolean;
  compressionEnabled: boolean;
  networkCheckInterval: number;
  autoRetryEnabled: boolean;
  batchSize: number;
  processingTimeout: number;
}

// Queue statistics
export interface QueueStats {
  totalItems: number;
  pendingItems: number;
  processingItems: number;
  completedItems: number;
  failedItems: number;
  totalSizeBytes: number;
  averageProcessingTime: number;
  successRate: number;
  networkStatus: NetworkStatus;
  lastProcessed?: Date;
  queueFullCount: number;
  retryCount: number;
}

// Queue events
export interface QueueEvents {
  'item:added': { item: QueueItem };
  'item:processing': { item: QueueItem };
  'item:completed': { item: QueueItem; duration: number };
  'item:failed': { item: QueueItem; error: Error; willRetry: boolean };
  'item:retry': { item: QueueItem; attempt: number };
  'queue:full': { rejectedItem: QueueItem };
  'queue:empty': {};
  'network:online': {};
  'network:offline': {};
  'network:unstable': {};
  'batch:processing': { items: QueueItem[]; batchSize: number };
  'batch:completed': { items: QueueItem[]; successful: number; failed: number };
  'stats:updated': { stats: QueueStats };
  'error': { error: Error; context: string };
}

/**
 * Advanced Offline Queue with intelligent retry and priority management
 */
export class OfflineQueue extends EventEmitter<QueueEvents> {
  private config: CodaiConfig;
  private syncEngine: SyncEngine;
  private queueConfig: QueueConfig;
  private queue: QueueItem[] = [];
  private processing = new Set<string>();
  private stats: QueueStats;
  private networkStatus: NetworkStatus = 'online';
  private processingTimer?: NodeJS.Timeout;
  private networkCheckTimer?: NodeJS.Timeout;
  private retryTimer?: NodeJS.Timeout;
  private processingTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    config: CodaiConfig,
    syncEngine: SyncEngine,
    queueConfig: Partial<QueueConfig> = {}
  ) {
    super();
    this.config = config;
    this.syncEngine = syncEngine;

    this.queueConfig = {
      maxItems: 1000,
      maxSizeBytes: 50 * 1024 * 1024, // 50MB
      maxRetryAttempts: 5,
      retryDelayBase: 1000,
      retryDelayMax: 30000,
      priorityWeights: {
        critical: 4,
        high: 3,
        normal: 2,
        low: 1
      },
      persistenceEnabled: true,
      compressionEnabled: true,
      networkCheckInterval: 5000,
      autoRetryEnabled: true,
      batchSize: 10,
      processingTimeout: 30000,
      ...queueConfig
    };

    this.stats = {
      totalItems: 0,
      pendingItems: 0,
      processingItems: 0,
      completedItems: 0,
      failedItems: 0,
      totalSizeBytes: 0,
      averageProcessingTime: 0,
      successRate: 0,
      networkStatus: this.networkStatus,
      queueFullCount: 0,
      retryCount: 0
    };

    this.initializeNetworkMonitoring();
    this.startProcessing();
    this.loadPersistedQueue();

    if (this.config.debug) {
      console.log('[OfflineQueue] Initialized with config:', this.queueConfig);
    }
  }

  /**
   * Add item to queue
   */
  async enqueue(
    entityType: string,
    entityId: string,
    operation: SyncOperation,
    data: any,
    options: {
      priority?: QueuePriority;
      previousData?: any;
      maxAttempts?: number;
      metadata?: any;
    } = {}
  ): Promise<string | null> {
    try {
      // Check queue capacity
      if (this.queue.length >= this.queueConfig.maxItems) {
        const rejectedItem = this.createQueueItem(entityType, entityId, operation, data, options);
        this.stats.queueFullCount++;
        this.emit('queue:full', { rejectedItem });

        if (this.config.debug) {
          console.warn('[OfflineQueue] Queue full, item rejected');
        }
        return null;
      }

      // Check size capacity
      const estimatedSize = this.estimateItemSize(data);
      if (this.stats.totalSizeBytes + estimatedSize > this.queueConfig.maxSizeBytes) {
        // Try to remove oldest low-priority items
        const freed = this.freeSpace(estimatedSize);
        if (!freed) {
          if (this.config.debug) {
            console.warn('[OfflineQueue] Queue size limit reached, item rejected');
          }
          return null;
        }
      }

      const item = this.createQueueItem(entityType, entityId, operation, data, options);

      // Insert item based on priority
      this.insertByPriority(item);

      this.updateStats();
      this.emit('item:added', { item });

      // Persist queue if enabled
      if (this.queueConfig.persistenceEnabled) {
        await this.persistQueue();
      }

      // Start processing if online
      if (this.networkStatus === 'online' && !this.processingTimer) {
        this.startProcessing();
      }

      if (this.config.debug) {
        console.log(`[OfflineQueue] Added ${operation} item for ${entityType}:${entityId} (Priority: ${item.priority})`);
      }

      return item.id;

    } catch (error) {
      this.emit('error', { error: error as Error, context: 'enqueue' });
      return null;
    }
  }

  /**
   * Remove item from queue
   */
  remove(itemId: string): boolean {
    const index = this.queue.findIndex(item => item.id === itemId);
    if (index === -1) {
      return false;
    }

    const item = this.queue[index];

    // Cancel processing if active
    if (this.processing.has(itemId)) {
      this.processing.delete(itemId);
      const timeout = this.processingTimeouts.get(itemId);
      if (timeout) {
        clearTimeout(timeout);
        this.processingTimeouts.delete(itemId);
      }
    }

    // Remove from queue
    this.queue.splice(index, 1);
    item.status = 'cancelled';

    this.updateStats();

    if (this.config.debug) {
      console.log(`[OfflineQueue] Removed item ${itemId}`);
    }

    return true;
  }

  /**
   * Clear all queue items
   */
  clear(): void {
    // Cancel all processing
    this.processing.forEach(itemId => {
      const timeout = this.processingTimeouts.get(itemId);
      if (timeout) {
        clearTimeout(timeout);
      }
    });

    this.processing.clear();
    this.processingTimeouts.clear();
    this.queue.length = 0;

    this.updateStats();
    this.emit('queue:empty', {});

    if (this.config.debug) {
      console.log('[OfflineQueue] Queue cleared');
    }
  }

  /**
   * Get queue items by status
   */
  getItems(status?: QueueStatus): QueueItem[] {
    if (status) {
      return this.queue.filter(item => item.status === status);
    }
    return [...this.queue];
  }

  /**
   * Get specific queue item
   */
  getItem(itemId: string): QueueItem | undefined {
    return this.queue.find(item => item.id === itemId);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Force process queue (even if offline)
   */
  async forceProcess(): Promise<{ processed: number; successful: number; failed: number }> {
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
    }

    const result = await this.processQueue();

    if (this.queueConfig.autoRetryEnabled) {
      this.scheduleRetries();
    }

    return result;
  }

  /**
   * Update queue configuration
   */
  updateConfig(config: Partial<QueueConfig>): void {
    this.queueConfig = { ...this.queueConfig, ...config };

    // Restart network monitoring if interval changed
    if (config.networkCheckInterval) {
      this.stopNetworkMonitoring();
      this.initializeNetworkMonitoring();
    }

    if (this.config.debug) {
      console.log('[OfflineQueue] Configuration updated:', config);
    }
  }

  /**
   * Set network status manually
   */
  setNetworkStatus(status: NetworkStatus): void {
    const oldStatus = this.networkStatus;
    this.networkStatus = status;
    this.stats.networkStatus = status;

    if (oldStatus !== status) {
      switch (status) {
        case 'online':
          this.emit('network:online', {});
          this.startProcessing();
          break;
        case 'offline':
          this.emit('network:offline', {});
          this.stopProcessing();
          break;
        case 'unstable':
          this.emit('network:unstable', {});
          break;
      }

      if (this.config.debug) {
        console.log(`[OfflineQueue] Network status changed: ${oldStatus} -> ${status}`);
      }
    }
  }

  // Private methods

  private createQueueItem(
    entityType: string,
    entityId: string,
    operation: SyncOperation,
    data: any,
    options: any
  ): QueueItem {
    return {
      id: this.generateItemId(),
      entityType,
      entityId,
      operation,
      data,
      previousData: options.previousData,
      priority: options.priority || 'normal',
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: options.maxAttempts || this.queueConfig.maxRetryAttempts,
      status: 'pending',
      metadata: {
        source: 'offline-queue',
        sessionId: this.generateSessionId(),
        correlationId: options.metadata?.correlationId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
        context: options.metadata
      },
      estimatedSize: this.estimateItemSize(data)
    };
  }

  private insertByPriority(item: QueueItem): void {
    const weight = this.queueConfig.priorityWeights[item.priority];

    // Find insertion point based on priority and timestamp
    let insertIndex = this.queue.length;

    for (let i = 0; i < this.queue.length; i++) {
      const existingWeight = this.queueConfig.priorityWeights[this.queue[i].priority];

      if (weight > existingWeight ||
        (weight === existingWeight && item.timestamp < this.queue[i].timestamp)) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, item);
  }

  private freeSpace(requiredSize: number): boolean {
    let freedSize = 0;
    const toRemove: number[] = [];

    // Remove oldest low-priority items first
    for (let i = this.queue.length - 1; i >= 0 && freedSize < requiredSize; i--) {
      const item = this.queue[i];
      if (item.priority === 'low' && item.status === 'pending') {
        freedSize += item.estimatedSize;
        toRemove.push(i);
      }
    }

    // Remove items
    toRemove.forEach(index => {
      this.queue.splice(index, 1);
    });

    return freedSize >= requiredSize;
  }

  private startProcessing(): void {
    if (this.processingTimer || this.networkStatus === 'offline') {
      return;
    }

    this.processingTimer = setTimeout(async () => {
      try {
        await this.processQueue();

        if (this.queue.some(item => item.status === 'pending')) {
          this.startProcessing(); // Continue processing
        } else {
          this.processingTimer = undefined;
        }

      } catch (error) {
        this.emit('error', { error: error as Error, context: 'process queue' });
        this.processingTimer = undefined;
      }
    }, 100);
  }

  private stopProcessing(): void {
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
      this.processingTimer = undefined;
    }
  }

  private async processQueue(): Promise<{ processed: number; successful: number; failed: number }> {
    const pendingItems = this.queue.filter(item =>
      item.status === 'pending' && !this.processing.has(item.id)
    );

    if (pendingItems.length === 0) {
      return { processed: 0, successful: 0, failed: 0 };
    }

    // Process in batches
    const batch = pendingItems.slice(0, this.queueConfig.batchSize);
    let successful = 0;
    let failed = 0;

    this.emit('batch:processing', { items: batch, batchSize: batch.length });

    for (const item of batch) {
      const result = await this.processItem(item);
      if (result) {
        successful++;
      } else {
        failed++;
      }
    }

    this.emit('batch:completed', { items: batch, successful, failed });

    return { processed: batch.length, successful, failed };
  }

  private async processItem(item: QueueItem): Promise<boolean> {
    if (this.processing.has(item.id)) {
      return false;
    }

    this.processing.add(item.id);
    item.status = 'processing';
    item.attempts++;

    const startTime = Date.now();
    this.emit('item:processing', { item });

    // Set processing timeout
    const timeoutId = setTimeout(() => {
      this.processing.delete(item.id);
      item.status = 'failed';
      item.error = new Error('Processing timeout');
      this.scheduleRetry(item);
    }, this.queueConfig.processingTimeout);

    this.processingTimeouts.set(item.id, timeoutId);

    try {
      // Record change in sync engine
      await this.syncEngine.recordChange(
        item.entityType,
        item.entityId,
        item.operation,
        item.data,
        item.previousData
      );

      // Try to sync immediately if online
      if (this.networkStatus === 'online') {
        const syncSuccess = await this.syncEngine.syncEntity(item.entityType, item.entityId);

        if (syncSuccess) {
          item.status = 'completed';
          this.removeFromQueue(item.id);

          const duration = Date.now() - startTime;
          this.stats.completedItems++;
          this.updateAverageProcessingTime(duration);

          this.emit('item:completed', { item, duration });

        } else {
          throw new Error('Sync failed');
        }
      } else {
        // Just record for later sync
        item.status = 'completed';
        this.removeFromQueue(item.id);
        this.stats.completedItems++;
        this.emit('item:completed', { item, duration: Date.now() - startTime });
      }

      return true;

    } catch (error) {
      item.status = 'failed';
      item.error = error as Error;
      this.stats.failedItems++;

      const willRetry = this.scheduleRetry(item);
      this.emit('item:failed', { item, error: error as Error, willRetry });

      return false;

    } finally {
      this.processing.delete(item.id);
      const timeout = this.processingTimeouts.get(item.id);
      if (timeout) {
        clearTimeout(timeout);
        this.processingTimeouts.delete(item.id);
      }
      this.updateStats();
    }
  }

  private scheduleRetry(item: QueueItem): boolean {
    if (item.attempts >= item.maxAttempts) {
      return false;
    }

    // Calculate exponential backoff delay
    const delay = Math.min(
      this.queueConfig.retryDelayBase * Math.pow(2, item.attempts - 1),
      this.queueConfig.retryDelayMax
    );

    item.nextRetry = Date.now() + delay;
    item.status = 'pending';
    this.stats.retryCount++;

    if (this.config.debug) {
      console.log(`[OfflineQueue] Scheduled retry for ${item.id} in ${delay}ms (attempt ${item.attempts}/${item.maxAttempts})`);
    }

    return true;
  }

  private scheduleRetries(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    const now = Date.now();
    const retryItems = this.queue.filter(item =>
      item.status === 'pending' &&
      item.nextRetry &&
      item.nextRetry <= now
    );

    if (retryItems.length > 0) {
      retryItems.forEach(item => {
        this.emit('item:retry', { item, attempt: item.attempts });
      });

      this.startProcessing();
    }

    // Schedule next retry check
    const nextRetry = this.queue
      .filter(item => item.nextRetry && item.nextRetry > now)
      .map(item => item.nextRetry!)
      .sort()[0];

    if (nextRetry) {
      this.retryTimer = setTimeout(() => {
        this.scheduleRetries();
      }, nextRetry - now);
    }
  }

  private removeFromQueue(itemId: string): void {
    const index = this.queue.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  private updateStats(): void {
    this.stats.totalItems = this.queue.length;
    this.stats.pendingItems = this.queue.filter(item => item.status === 'pending').length;
    this.stats.processingItems = this.processing.size;
    this.stats.totalSizeBytes = this.queue.reduce((total, item) => total + item.estimatedSize, 0);
    this.stats.successRate = this.stats.totalItems > 0
      ? (this.stats.completedItems / (this.stats.completedItems + this.stats.failedItems)) * 100
      : 0;
    this.stats.lastProcessed = new Date();

    this.emit('stats:updated', { stats: this.stats });
  }

  private updateAverageProcessingTime(duration: number): void {
    if (this.stats.completedItems === 1) {
      this.stats.averageProcessingTime = duration;
    } else {
      this.stats.averageProcessingTime =
        (this.stats.averageProcessingTime * (this.stats.completedItems - 1) + duration) / this.stats.completedItems;
    }
  }

  private initializeNetworkMonitoring(): void {
    // Check network status periodically
    this.networkCheckTimer = setInterval(() => {
      this.checkNetworkStatus();
    }, this.queueConfig.networkCheckInterval);

    // Listen for online/offline events in browser
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setNetworkStatus('online'));
      window.addEventListener('offline', () => this.setNetworkStatus('offline'));
    }

    // Initial check
    this.checkNetworkStatus();
  }

  private stopNetworkMonitoring(): void {
    if (this.networkCheckTimer) {
      clearInterval(this.networkCheckTimer);
      this.networkCheckTimer = undefined;
    }
  }

  private checkNetworkStatus(): void {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      const isOnline = navigator.onLine;
      this.setNetworkStatus(isOnline ? 'online' : 'offline');
    } else {
      // For Node.js, assume online unless manually set
      if (this.networkStatus === 'offline') {
        this.setNetworkStatus('online');
      }
    }
  }

  private async persistQueue(): Promise<void> {
    if (!this.queueConfig.persistenceEnabled) {
      return;
    }

    try {
      const queueData = {
        items: this.queue,
        stats: this.stats,
        timestamp: Date.now()
      };

      const serialized = JSON.stringify(queueData);

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('codai_offline_queue', serialized);
      }

    } catch (error) {
      this.emit('error', { error: error as Error, context: 'persist queue' });
    }
  }

  private async loadPersistedQueue(): Promise<void> {
    if (!this.queueConfig.persistenceEnabled) {
      return;
    }

    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      const serialized = localStorage.getItem('codai_offline_queue');
      if (!serialized) {
        return;
      }

      const queueData = JSON.parse(serialized);

      // Load items that are still pending
      const validItems = queueData.items.filter((item: QueueItem) =>
        item.status === 'pending' || item.status === 'failed'
      );

      this.queue = validItems;
      this.updateStats();

      if (this.config.debug) {
        console.log(`[OfflineQueue] Loaded ${validItems.length} persisted items`);
      }

    } catch (error) {
      this.emit('error', { error: error as Error, context: 'load persisted queue' });
    }
  }

  private estimateItemSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 1000; // Default estimate
    }
  }

  private generateItemId(): string {
    return `qit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and destroy queue
   */
  destroy(): void {
    this.stopProcessing();
    this.stopNetworkMonitoring();

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    // Clear all timeouts
    this.processingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.processingTimeouts.clear();

    this.processing.clear();
    this.queue.length = 0;
    this.removeAllListeners();

    if (this.config.debug) {
      console.log('[OfflineQueue] Destroyed');
    }
  }
}
