/**
 * CODAI Real-Time Sync Engine
 * Advanced data synchronization with conflict resolution and version control
 */

import { EventEmitter } from 'eventemitter3';
import type { CodaiConfig } from '../types';
import type { WebSocketManager } from './websocket-manager';
import type { EventStreamHandler, StreamEvent } from './event-stream';
import { ErrorUtils } from '../utils';

// Sync operation types
export type SyncOperation = 'create' | 'update' | 'delete' | 'move' | 'copy';

// Conflict resolution strategies
export type ConflictResolution = 'client-wins' | 'server-wins' | 'last-write-wins' | 'merge' | 'manual';

// Data change record
export interface DataChange {
  id: string;
  entityType: string;
  entityId: string;
  operation: SyncOperation;
  data: any;
  previousData?: any;
  timestamp: number;
  version: number;
  checksum: string;
  author: string;
  source: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

// Conflict information
export interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  clientChange: DataChange;
  serverChange: DataChange;
  conflictType: 'version' | 'concurrent' | 'deleted' | 'type-mismatch';
  resolution?: ConflictResolution;
  resolvedData?: any;
  timestamp: number;
  status: 'pending' | 'resolved' | 'failed';
}

// Sync state for entities
export interface SyncState {
  entityType: string;
  entityId: string;
  version: number;
  checksum: string;
  lastSyncTime: number;
  lastChangeTime: number;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  pendingChanges: DataChange[];
  conflicts: SyncConflict[];
}

// Sync configuration
export interface SyncConfig {
  batchSize: number;
  syncInterval: number;
  conflictResolution: ConflictResolution;
  retryAttempts: number;
  retryDelay: number;
  enableOptimisticLocking: boolean;
  enableVersioning: boolean;
  maxPendingChanges: number;
  syncTimeout: number;
}

// Sync statistics
export interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsDetected: number;
  conflictsResolved: number;
  pendingChanges: number;
  averageSyncTime: number;
  dataTransferred: number;
  lastSyncTime?: Date;
}

// Sync events
export interface SyncEvents {
  'sync:started': { entityType?: string; batchSize: number };
  'sync:completed': { entityType?: string; changes: number; conflicts: number; duration: number };
  'sync:failed': { entityType?: string; error: Error; retryCount: number };
  'change:applied': { change: DataChange; success: boolean };
  'conflict:detected': { conflict: SyncConflict };
  'conflict:resolved': { conflict: SyncConflict; resolution: any };
  'entity:synced': { entityType: string; entityId: string; version: number };
  'stats:updated': { stats: SyncStats };
  'error': { error: Error; context: string };
}

/**
 * Advanced Sync Engine with intelligent conflict resolution
 */
export class SyncEngine extends EventEmitter<SyncEvents> {
  private config: CodaiConfig;
  private wsManager: WebSocketManager;
  private eventStream: EventStreamHandler;
  private syncConfig: SyncConfig;
  private syncStates = new Map<string, SyncState>();
  private pendingChanges = new Map<string, DataChange[]>();
  private conflicts = new Map<string, SyncConflict>();
  private stats: SyncStats;
  private syncTimer?: NodeJS.Timeout;
  private activeSyncs = new Set<string>();
  private syncTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    config: CodaiConfig,
    wsManager: WebSocketManager,
    eventStream: EventStreamHandler,
    syncConfig: Partial<SyncConfig> = {}
  ) {
    super();
    this.config = config;
    this.wsManager = wsManager;
    this.eventStream = eventStream;

    this.syncConfig = {
      batchSize: 50,
      syncInterval: 10000, // 10 seconds
      conflictResolution: 'last-write-wins',
      retryAttempts: 3,
      retryDelay: 2000,
      enableOptimisticLocking: true,
      enableVersioning: true,
      maxPendingChanges: 1000,
      syncTimeout: 30000,
      ...syncConfig
    };

    this.stats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      pendingChanges: 0,
      averageSyncTime: 0,
      dataTransferred: 0
    };

    this.setupEventHandlers();
    this.startPeriodicSync();

    if (this.config.debug) {
      console.log('[SyncEngine] Initialized with config:', this.syncConfig);
    }
  }

  /**
   * Record a local data change
   */
  async recordChange(
    entityType: string,
    entityId: string,
    operation: SyncOperation,
    data: any,
    previousData?: any
  ): Promise<DataChange> {
    const change: DataChange = {
      id: this.generateChangeId(),
      entityType,
      entityId,
      operation,
      data,
      previousData,
      timestamp: Date.now(),
      version: this.getNextVersion(entityType, entityId),
      checksum: this.calculateChecksum(data),
      author: this.config.appId,
      source: 'local',
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
        sessionId: this.generateSessionId()
      }
    };

    // Add to pending changes
    const key = `${entityType}:${entityId}`;
    if (!this.pendingChanges.has(key)) {
      this.pendingChanges.set(key, []);
    }

    const pending = this.pendingChanges.get(key)!;
    pending.push(change);

    // Limit pending changes
    if (pending.length > this.syncConfig.maxPendingChanges) {
      pending.shift(); // Remove oldest
    }

    // Update sync state
    this.updateSyncState(entityType, entityId, change);

    // Try immediate sync for critical operations
    if (operation === 'delete' || data.priority === 'critical') {
      await this.syncEntity(entityType, entityId);
    }

    this.updateStats();

    if (this.config.debug) {
      console.log(`[SyncEngine] Recorded ${operation} change for ${entityType}:${entityId}`);
    }

    return change;
  }

  /**
   * Sync specific entity
   */
  async syncEntity(entityType: string, entityId: string): Promise<boolean> {
    const key = `${entityType}:${entityId}`;

    if (this.activeSyncs.has(key)) {
      if (this.config.debug) {
        console.log(`[SyncEngine] Sync already in progress for ${key}`);
      }
      return false;
    }

    this.activeSyncs.add(key);
    const startTime = Date.now();

    try {
      this.emit('sync:started', { entityType, batchSize: 1 });

      const pending = this.pendingChanges.get(key) || [];
      if (pending.length === 0) {
        this.activeSyncs.delete(key);
        return true;
      }

      // Setup timeout
      const timeoutId = setTimeout(() => {
        this.activeSyncs.delete(key);
        this.emit('sync:failed', {
          entityType,
          error: new Error('Sync timeout'),
          retryCount: 0
        });
      }, this.syncConfig.syncTimeout);

      this.syncTimeouts.set(key, timeoutId);

      // Send changes to server
      const result = await this.sendChangesToServer(entityType, entityId, pending);

      if (result.success) {
        // Process server response
        await this.processServerResponse(result.response);

        // Clear pending changes
        this.pendingChanges.delete(key);

        const duration = Date.now() - startTime;
        this.stats.successfulSyncs++;
        this.stats.totalSyncs++;
        this.updateAverageSyncTime(duration);

        this.emit('sync:completed', {
          entityType,
          changes: pending.length,
          conflicts: result.conflicts || 0,
          duration
        });

        this.emit('entity:synced', { entityType, entityId, version: result.version });

      } else {
        this.stats.failedSyncs++;
        this.stats.totalSyncs++;

        this.emit('sync:failed', {
          entityType,
          error: result.error,
          retryCount: 0
        });
      }

      return result.success;

    } catch (error) {
      this.stats.failedSyncs++;
      this.stats.totalSyncs++;

      this.emit('sync:failed', {
        entityType,
        error: error as Error,
        retryCount: 0
      });

      return false;

    } finally {
      this.activeSyncs.delete(key);
      const timeoutId = this.syncTimeouts.get(key);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.syncTimeouts.delete(key);
      }
    }
  }

  /**
   * Sync all pending changes
   */
  async syncAll(): Promise<{ successful: number; failed: number; conflicts: number }> {
    const startTime = Date.now();
    let successful = 0;
    let failed = 0;
    const totalConflicts = 0;

    this.emit('sync:started', { batchSize: this.pendingChanges.size });

    // Group changes by entity type for efficient syncing
    const entitiesByType = new Map<string, string[]>();

    for (const [key] of this.pendingChanges) {
      const [entityType, entityId] = key.split(':');
      if (!entitiesByType.has(entityType)) {
        entitiesByType.set(entityType, []);
      }
      entitiesByType.get(entityType)!.push(entityId);
    }

    // Sync each entity type in batches
    for (const [entityType, entityIds] of entitiesByType) {
      const batches = this.createBatches(entityIds, this.syncConfig.batchSize);

      for (const batch of batches) {
        const batchPromises = batch.map(entityId => this.syncEntity(entityType, entityId));
        const results = await Promise.allSettled(batchPromises);

        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            successful++;
          } else {
            failed++;
          }
        });
      }
    }

    const duration = Date.now() - startTime;
    this.emit('sync:completed', {
      changes: successful + failed,
      conflicts: totalConflicts,
      duration
    });

    return { successful, failed, conflicts: totalConflicts };
  }

  /**
   * Resolve a conflict manually
   */
  async resolveConflict(conflictId: string, resolution: any): Promise<boolean> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      return false;
    }

    try {
      conflict.resolvedData = resolution;
      conflict.status = 'resolved';
      conflict.resolution = 'manual';

      // Apply resolved data
      const success = await this.applyResolvedChange(conflict);

      if (success) {
        this.conflicts.delete(conflictId);
        this.stats.conflictsResolved++;

        this.emit('conflict:resolved', { conflict, resolution });

        if (this.config.debug) {
          console.log(`[SyncEngine] Conflict ${conflictId} resolved manually`);
        }
      }

      return success;

    } catch (error) {
      conflict.status = 'failed';
      this.emit('error', { error: error as Error, context: 'resolve conflict' });
      return false;
    }
  }

  /**
   * Get sync state for entity
   */
  getSyncState(entityType: string, entityId: string): SyncState | undefined {
    return this.syncStates.get(`${entityType}:${entityId}`);
  }

  /**
   * Get all pending changes
   */
  getPendingChanges(): Map<string, DataChange[]> {
    return new Map(this.pendingChanges);
  }

  /**
   * Get all conflicts
   */
  getConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Get sync statistics
   */
  getStats(): SyncStats {
    this.stats.pendingChanges = Array.from(this.pendingChanges.values())
      .reduce((total, changes) => total + changes.length, 0);
    this.stats.lastSyncTime = new Date();

    return { ...this.stats };
  }

  /**
   * Clear all pending changes
   */
  clearPendingChanges(): void {
    this.pendingChanges.clear();
    this.updateStats();

    if (this.config.debug) {
      console.log('[SyncEngine] All pending changes cleared');
    }
  }

  /**
   * Update sync configuration
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.syncConfig = { ...this.syncConfig, ...config };

    // Restart periodic sync if interval changed
    if (config.syncInterval) {
      this.stopPeriodicSync();
      this.startPeriodicSync();
    }

    if (this.config.debug) {
      console.log('[SyncEngine] Configuration updated:', config);
    }
  }

  // Private methods

  private setupEventHandlers(): void {
    // Listen for remote changes
    this.eventStream.subscribe(
      this.config.appId,
      (events) => this.handleRemoteEvents(events),
      {
        filter: {
          types: ['data'],
          subtypes: ['change', 'sync_response']
        }
      }
    );
  }

  private startPeriodicSync(): void {
    if (this.syncConfig.syncInterval > 0) {
      this.syncTimer = setInterval(() => {
        if (this.pendingChanges.size > 0) {
          this.syncAll().catch(error => {
            this.emit('error', { error, context: 'periodic sync' });
          });
        }
      }, this.syncConfig.syncInterval);
    }
  }

  private stopPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }

  private async handleRemoteEvents(events: StreamEvent[]): Promise<void> {
    for (const event of events) {
      if (event.subtype === 'change') {
        await this.handleRemoteChange(event.payload as DataChange);
      } else if (event.subtype === 'sync_response') {
        await this.processServerResponse(event.payload);
      }
    }
  }

  private async handleRemoteChange(remoteChange: DataChange): Promise<void> {
    const key = `${remoteChange.entityType}:${remoteChange.entityId}`;
    const localPending = this.pendingChanges.get(key) || [];
    const syncState = this.syncStates.get(key);

    // Check for conflicts
    const conflict = this.detectConflict(remoteChange, localPending, syncState);

    if (conflict) {
      this.conflicts.set(conflict.id, conflict);
      this.stats.conflictsDetected++;

      this.emit('conflict:detected', { conflict });

      // Try automatic resolution
      const resolved = await this.tryAutoResolveConflict(conflict);
      if (!resolved && this.config.debug) {
        console.log(`[SyncEngine] Conflict requires manual resolution: ${conflict.id}`);
      }

    } else {
      // No conflict, apply change
      await this.applyRemoteChange(remoteChange);
    }
  }

  private detectConflict(
    remoteChange: DataChange,
    localPending: DataChange[],
    syncState?: SyncState
  ): SyncConflict | null {
    // Check for concurrent modifications
    const conflictingLocal = localPending.find(local =>
      local.entityId === remoteChange.entityId &&
      local.timestamp > remoteChange.timestamp - 1000 && // Within 1 second
      local.operation !== remoteChange.operation
    );

    if (conflictingLocal) {
      return {
        id: this.generateConflictId(),
        entityType: remoteChange.entityType,
        entityId: remoteChange.entityId,
        clientChange: conflictingLocal,
        serverChange: remoteChange,
        conflictType: 'concurrent',
        timestamp: Date.now(),
        status: 'pending'
      };
    }

    // Check version conflicts
    if (syncState && this.syncConfig.enableVersioning) {
      if (remoteChange.version <= syncState.version) {
        return {
          id: this.generateConflictId(),
          entityType: remoteChange.entityType,
          entityId: remoteChange.entityId,
          clientChange: localPending[localPending.length - 1], // Latest local change
          serverChange: remoteChange,
          conflictType: 'version',
          timestamp: Date.now(),
          status: 'pending'
        };
      }
    }

    return null;
  }

  private async tryAutoResolveConflict(conflict: SyncConflict): Promise<boolean> {
    try {
      let resolvedData: any;

      switch (this.syncConfig.conflictResolution) {
        case 'client-wins':
          resolvedData = conflict.clientChange.data;
          break;

        case 'server-wins':
          resolvedData = conflict.serverChange.data;
          break;

        case 'last-write-wins':
          resolvedData = conflict.clientChange.timestamp > conflict.serverChange.timestamp
            ? conflict.clientChange.data
            : conflict.serverChange.data;
          break;

        case 'merge':
          resolvedData = this.mergeData(conflict.clientChange.data, conflict.serverChange.data);
          break;

        default:
          return false; // Manual resolution required
      }

      conflict.resolvedData = resolvedData;
      conflict.status = 'resolved';
      conflict.resolution = this.syncConfig.conflictResolution;

      const success = await this.applyResolvedChange(conflict);

      if (success) {
        this.conflicts.delete(conflict.id);
        this.stats.conflictsResolved++;

        this.emit('conflict:resolved', { conflict, resolution: resolvedData });
      }

      return success;

    } catch (error) {
      this.emit('error', { error: error as Error, context: 'auto resolve conflict' });
      return false;
    }
  }

  private mergeData(clientData: any, serverData: any): any {
    // Simple merge strategy - can be enhanced for specific data types
    if (typeof clientData === 'object' && typeof serverData === 'object') {
      return { ...serverData, ...clientData };
    }

    // For non-objects, prefer client data
    return clientData;
  }

  private async applyRemoteChange(change: DataChange): Promise<void> {
    try {
      // Apply the change (this would typically update local data store)
      // For now, we'll just emit an event

      this.emit('change:applied', { change, success: true });

      // Update sync state
      this.updateSyncState(change.entityType, change.entityId, change);

      if (this.config.debug) {
        console.log(`[SyncEngine] Applied remote ${change.operation} for ${change.entityType}:${change.entityId}`);
      }

    } catch (error) {
      this.emit('change:applied', { change, success: false });
      this.emit('error', { error: error as Error, context: 'apply remote change' });
    }
  }

  private async applyResolvedChange(conflict: SyncConflict): Promise<boolean> {
    try {
      // Create a resolved change
      const resolvedChange: DataChange = {
        ...conflict.serverChange,
        data: conflict.resolvedData,
        timestamp: Date.now(),
        version: this.getNextVersion(conflict.entityType, conflict.entityId),
        checksum: this.calculateChecksum(conflict.resolvedData)
      };

      await this.applyRemoteChange(resolvedChange);
      return true;

    } catch (error) {
      this.emit('error', { error: error as Error, context: 'apply resolved change' });
      return false;
    }
  }

  private async sendChangesToServer(
    entityType: string,
    entityId: string,
    changes: DataChange[]
  ): Promise<{ success: boolean; response?: any; conflicts?: number; version?: number; error?: Error }> {
    try {
      const message = {
        type: 'sync:request',
        payload: {
          entityType,
          entityId,
          changes,
          clientVersion: this.getEntityVersion(entityType, entityId)
        },
        timestamp: Date.now()
      };

      const response = await this.wsManager.request(message, this.syncConfig.syncTimeout);

      this.stats.dataTransferred += JSON.stringify(changes).length;

      return {
        success: response.success,
        response: response.data,
        conflicts: response.conflicts,
        version: response.version
      };

    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  }

  private async processServerResponse(response: any): Promise<void> {
    if (response.conflicts) {
      for (const conflictData of response.conflicts) {
        const conflict = this.createConflictFromResponse(conflictData);
        this.conflicts.set(conflict.id, conflict);
        this.stats.conflictsDetected++;
        this.emit('conflict:detected', { conflict });
      }
    }

    if (response.changes) {
      for (const change of response.changes) {
        await this.handleRemoteChange(change);
      }
    }
  }

  private createConflictFromResponse(conflictData: any): SyncConflict {
    return {
      id: conflictData.id || this.generateConflictId(),
      entityType: conflictData.entityType,
      entityId: conflictData.entityId,
      clientChange: conflictData.clientChange,
      serverChange: conflictData.serverChange,
      conflictType: conflictData.conflictType,
      timestamp: Date.now(),
      status: 'pending'
    };
  }

  private updateSyncState(entityType: string, entityId: string, change: DataChange): void {
    const key = `${entityType}:${entityId}`;
    const existing = this.syncStates.get(key);

    const syncState: SyncState = {
      entityType,
      entityId,
      version: change.version,
      checksum: change.checksum,
      lastSyncTime: existing?.lastSyncTime || 0,
      lastChangeTime: change.timestamp,
      syncStatus: 'pending',
      pendingChanges: this.pendingChanges.get(key) || [],
      conflicts: []
    };

    this.syncStates.set(key, syncState);
  }

  private getEntityVersion(entityType: string, entityId: string): number {
    const syncState = this.syncStates.get(`${entityType}:${entityId}`);
    return syncState?.version || 0;
  }

  private getNextVersion(entityType: string, entityId: string): number {
    return this.getEntityVersion(entityType, entityId) + 1;
  }

  private calculateChecksum(data: any): string {
    const serialized = JSON.stringify(data, Object.keys(data).sort());
    // Simple hash for now - can be enhanced with crypto libraries
    let hash = 0;
    for (let i = 0; i < serialized.length; i++) {
      const char = serialized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private updateStats(): void {
    this.emit('stats:updated', { stats: this.getStats() });
  }

  private updateAverageSyncTime(duration: number): void {
    if (this.stats.totalSyncs === 1) {
      this.stats.averageSyncTime = duration;
    } else {
      this.stats.averageSyncTime = (this.stats.averageSyncTime * (this.stats.totalSyncs - 1) + duration) / this.stats.totalSyncs;
    }
  }

  private generateChangeId(): string {
    return `chg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConflictId(): string {
    return `cnf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and destroy engine
   */
  destroy(): void {
    this.stopPeriodicSync();

    // Clear all timeouts
    this.syncTimeouts.forEach(timeout => clearTimeout(timeout));
    this.syncTimeouts.clear();

    this.syncStates.clear();
    this.pendingChanges.clear();
    this.conflicts.clear();
    this.activeSyncs.clear();
    this.removeAllListeners();

    if (this.config.debug) {
      console.log('[SyncEngine] Destroyed');
    }
  }
}
