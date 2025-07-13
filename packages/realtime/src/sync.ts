import { SyncData, ConflictResolution } from './types';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'patch';
  data: any;
  path?: string[];
  version: number;
  timestamp: number;
  author: string;
  checksum?: string;
}

export class DataSynchronizer {
  private localData: Map<string, any> = new Map();
  private versions: Map<string, number> = new Map();
  private conflictQueue: SyncOperation[] = [];
  private conflictResolution: ConflictResolution;

  constructor(conflictResolution: ConflictResolution = { strategy: 'last-write-wins' }) {
    this.conflictResolution = conflictResolution;
  }

  // Apply a sync operation
  async applyOperation(operation: SyncOperation): Promise<{ success: boolean; conflicts?: any[] }> {
    const { id, type, data, version, timestamp, author } = operation;

    // Check for conflicts
    const currentVersion = this.versions.get(id) || 0;
    const hasConflict = version <= currentVersion;

    if (hasConflict) {
      return this.handleConflict(operation);
    }

    // Apply the operation
    try {
      switch (type) {
        case 'create':
          return this.handleCreate(id, data, version, timestamp, author);
        case 'update':
          return this.handleUpdate(id, data, version, timestamp, author);
        case 'delete':
          return this.handleDelete(id, version, timestamp, author);
        case 'patch':
          return this.handlePatch(id, data, operation.path || [], version, timestamp, author);
        default:
          throw new Error(`Unknown operation type: ${type}`);
      }
    } catch (error) {
      return { success: false, conflicts: [{ error: (error as Error).message, operation }] };
    }
  }

  // Create operation
  private async handleCreate(id: string, data: any, version: number, timestamp: number, author: string): Promise<{ success: boolean }> {
    if (this.localData.has(id)) {
      throw new Error(`Data with id ${id} already exists`);
    }

    this.localData.set(id, {
      ...data,
      _metadata: {
        version,
        timestamp,
        author,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    });

    this.versions.set(id, version);
    return { success: true };
  }

  // Update operation
  private async handleUpdate(id: string, data: any, version: number, timestamp: number, author: string): Promise<{ success: boolean }> {
    if (!this.localData.has(id)) {
      throw new Error(`Data with id ${id} does not exist`);
    }

    const existing = this.localData.get(id);
    this.localData.set(id, {
      ...data,
      _metadata: {
        ...existing._metadata,
        version,
        timestamp,
        author,
        updatedAt: timestamp,
      },
    });

    this.versions.set(id, version);
    return { success: true };
  }

  // Delete operation
  private async handleDelete(id: string, version: number, timestamp: number, author: string): Promise<{ success: boolean }> {
    if (!this.localData.has(id)) {
      throw new Error(`Data with id ${id} does not exist`);
    }

    this.localData.delete(id);
    this.versions.set(id, version);
    return { success: true };
  }

  // Patch operation (partial update)
  private async handlePatch(id: string, data: any, path: string[], version: number, timestamp: number, author: string): Promise<{ success: boolean }> {
    if (!this.localData.has(id)) {
      throw new Error(`Data with id ${id} does not exist`);
    }

    const existing = this.localData.get(id);
    const updated = this.applyPatch(existing, data, path);

    this.localData.set(id, {
      ...updated,
      _metadata: {
        ...existing._metadata,
        version,
        timestamp,
        author,
        updatedAt: timestamp,
      },
    });

    this.versions.set(id, version);
    return { success: true };
  }

  // Apply patch to nested object
  private applyPatch(target: any, patch: any, path: string[]): any {
    if (path.length === 0) {
      return { ...target, ...patch };
    }

    const [head, ...tail] = path;
    return {
      ...target,
      [head]: this.applyPatch(target[head] || {}, patch, tail),
    };
  }

  // Handle conflict resolution
  private async handleConflict(operation: SyncOperation): Promise<{ success: boolean; conflicts: any[] }> {
    const conflicts = [operation];

    switch (this.conflictResolution.strategy) {
      case 'last-write-wins':
        // Always apply the new operation
        this.versions.set(operation.id, operation.version);
        const result = await this.applyOperation(operation);
        return { success: result.success, conflicts: result.conflicts || [] };

      case 'merge':
        // Attempt to merge the changes
        const mergeResult = await this.attemptMerge(operation);
        return { success: mergeResult.success, conflicts: mergeResult.conflicts || [] };

      case 'custom':
        // Use custom resolver
        if (this.conflictResolution.resolver) {
          const resolved = this.conflictResolution.resolver(
            this.localData.get(operation.id),
            operation.data
          );
          const updateResult = await this.handleUpdate(operation.id, resolved, operation.version + 1, Date.now(), 'system');
          return { success: updateResult.success, conflicts: [] };
        }
        break;

      case 'user-choice':
        // Queue for user resolution
        this.conflictQueue.push(operation);
        return { success: false, conflicts };
    }

    return { success: false, conflicts };
  }

  // Attempt automatic merge
  private async attemptMerge(operation: SyncOperation): Promise<{ success: boolean; conflicts?: any[] }> {
    const existing = this.localData.get(operation.id);
    if (!existing) {
      return this.applyOperation(operation);
    }

    try {
      // Simple merge for objects
      if (typeof existing === 'object' && typeof operation.data === 'object') {
        const merged = {
          ...existing,
          ...operation.data,
          _metadata: {
            ...existing._metadata,
            version: Math.max(existing._metadata?.version || 0, operation.version),
            timestamp: Date.now(),
            author: 'merged',
            mergedFrom: [existing._metadata?.author, operation.author],
          },
        };

        this.localData.set(operation.id, merged);
        this.versions.set(operation.id, merged._metadata.version);
        return { success: true };
      }
    } catch (error) {
      // Merge failed, fallback to conflict queue
      this.conflictQueue.push(operation);
      return { success: false, conflicts: [{ error: (error as Error).message, operation }] };
    }

    return { success: false, conflicts: [{ reason: 'Unable to merge', operation }] };
  }

  // Get current data
  getData(id: string): any {
    return this.localData.get(id);
  }

  // Get all data
  getAllData(): Map<string, any> {
    return new Map(this.localData);
  }

  // Get current version
  getVersion(id: string): number {
    return this.versions.get(id) || 0;
  }

  // Get conflicts requiring resolution
  getConflicts(): SyncOperation[] {
    return [...this.conflictQueue];
  }

  // Resolve a specific conflict
  async resolveConflict(conflictId: string, resolution: any): Promise<{ success: boolean }> {
    const conflictIndex = this.conflictQueue.findIndex(op => op.id === conflictId);
    if (conflictIndex === -1) {
      return { success: false };
    }

    const conflict = this.conflictQueue[conflictIndex];
    this.conflictQueue.splice(conflictIndex, 1);

    // Apply the resolution
    return this.handleUpdate(
      conflict.id,
      resolution,
      conflict.version + 1,
      Date.now(),
      'user-resolved'
    );
  }

  // Create a sync operation
  createSyncOperation(
    id: string,
    type: 'create' | 'update' | 'delete' | 'patch',
    data: any,
    author: string,
    path?: string[]
  ): SyncOperation {
    const currentVersion = this.getVersion(id);

    return {
      id,
      type,
      data,
      path,
      version: currentVersion + 1,
      timestamp: Date.now(),
      author,
      checksum: this.calculateChecksum(data),
    };
  }

  // Calculate simple checksum
  private calculateChecksum(data: any): string {
    return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 8);
  }

  // Export data for synchronization
  exportData(): { data: any[]; versions: Record<string, number> } {
    const data = Array.from(this.localData.entries()).map(([id, value]) => ({
      id,
      ...value,
    }));

    const versions = Object.fromEntries(this.versions.entries());

    return { data, versions };
  }

  // Import data from synchronization
  async importData(syncData: { data: any[]; versions: Record<string, number> }): Promise<void> {
    // Clear existing data
    this.localData.clear();
    this.versions.clear();

    // Import new data
    for (const item of syncData.data) {
      const { id, ...data } = item;
      this.localData.set(id, data);
    }

    // Import versions
    for (const [id, version] of Object.entries(syncData.versions)) {
      this.versions.set(id, version);
    }
  }
}

// Global synchronizer instance
export const globalSynchronizer = new DataSynchronizer();
