/**
 * CODAI Global State Store
 * Centralized state management with real-time synchronization across all apps
 */

import { EventEmitter } from 'eventemitter3';
import type { CodaiConfig } from '../types';
import type { RealTimeHub } from '../realtime';

// State management types
export type StateValue = string | number | boolean | object | null | undefined;
export type StatePath = string | string[];
export type StateListener<T = StateValue> = (value: T, previousValue: T, path: string) => void;
export type StateValidator<T = StateValue> = (value: T, path: string) => boolean | string;
export type StateTransformer<T = StateValue> = (value: T, path: string) => T;

// State operation types
export type StateOperation =
  | 'set'
  | 'merge'
  | 'delete'
  | 'push'
  | 'pop'
  | 'shift'
  | 'unshift'
  | 'splice'
  | 'increment'
  | 'decrement'
  | 'toggle';

// State change record
export interface StateChange {
  id: string;
  path: string;
  operation: StateOperation;
  value: StateValue;
  previousValue: StateValue;
  timestamp: number;
  source: string;
  metadata?: Record<string, any>;
}

// State subscription options
export interface StateSubscriptionOptions {
  immediate?: boolean;
  deep?: boolean;
  debounce?: number;
  throttle?: number;
  filter?: (value: StateValue, path: string) => boolean;
  transform?: StateTransformer;
}

// State store configuration
export interface StateStoreConfig {
  namespace: string;
  persistent: boolean;
  syncEnabled: boolean;
  conflictResolution: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  maxHistorySize: number;
  debounceInterval: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  validationEnabled: boolean;
}

// State store statistics
export interface StateStoreStats {
  totalKeys: number;
  memoryUsage: number;
  operationsCount: number;
  syncOperations: number;
  conflicts: number;
  lastUpdate: Date;
  listeners: number;
  subscriptions: number;
}

// State store events
export interface StateStoreEvents {
  'state:changed': { change: StateChange };
  'state:synced': { path: string; success: boolean };
  'state:conflict': { path: string; local: StateValue; remote: StateValue };
  'state:error': { error: Error; context: string };
  'state:cleared': { namespace: string };
  'subscription:added': { path: string; id: string };
  'subscription:removed': { path: string; id: string };
  'stats:updated': { stats: StateStoreStats };
}

/**
 * Global State Store with real-time synchronization
 */
export class GlobalStateStore extends EventEmitter<StateStoreEvents> {
  private config: CodaiConfig;
  private storeConfig: StateStoreConfig;
  private realTimeHub?: RealTimeHub;

  // State storage
  private state = new Map<string, StateValue>();
  private stateListeners = new Map<string, Set<StateListener>>();
  private subscriptions = new Map<string, string>();
  private validators = new Map<string, StateValidator>();
  private transformers = new Map<string, StateTransformer>();
  private history: StateChange[] = [];

  // Internal state
  private stats: StateStoreStats;
  private syncTimer?: NodeJS.Timeout;
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private throttleTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    config: CodaiConfig,
    storeConfig: Partial<StateStoreConfig> = {},
    realTimeHub?: RealTimeHub
  ) {
    super();
    this.config = config;
    this.realTimeHub = realTimeHub;

    this.storeConfig = {
      namespace: config.appId,
      persistent: true,
      syncEnabled: true,
      conflictResolution: 'merge',
      maxHistorySize: 1000,
      debounceInterval: 100,
      compressionEnabled: true,
      encryptionEnabled: false,
      validationEnabled: true,
      ...storeConfig
    };

    this.stats = {
      totalKeys: 0,
      memoryUsage: 0,
      operationsCount: 0,
      syncOperations: 0,
      conflicts: 0,
      lastUpdate: new Date(),
      listeners: 0,
      subscriptions: 0
    };

    this.setupRealTimeSync();
    this.loadPersistedState();

    if (this.config.debug) {
      console.log('[GlobalStateStore] Initialized with config:', this.storeConfig);
    }
  }

  /**
   * Set a state value
   */
  set<T extends StateValue>(path: StatePath, value: T, options: {
    sync?: boolean;
    validate?: boolean;
    transform?: boolean;
    metadata?: Record<string, any>;
  } = {}): boolean {
    const normalizedPath = this.normalizePath(path);
    const previousValue = this.state.get(normalizedPath);

    try {
      // Validation
      if (options.validate !== false && this.storeConfig.validationEnabled) {
        const validator = this.validators.get(normalizedPath);
        if (validator) {
          const validationResult = validator(value, normalizedPath);
          if (typeof validationResult === 'string') {
            throw new Error(`Validation failed for ${normalizedPath}: ${validationResult}`);
          }
          if (!validationResult) {
            throw new Error(`Validation failed for ${normalizedPath}`);
          }
        }
      }

      // Transformation
      let finalValue = value;
      if (options.transform !== false) {
        const transformer = this.transformers.get(normalizedPath);
        if (transformer) {
          finalValue = transformer(value, normalizedPath) as T;
        }
      }

      // Update state
      this.state.set(normalizedPath, finalValue);

      // Record change
      const change: StateChange = {
        id: this.generateChangeId(),
        path: normalizedPath,
        operation: 'set',
        value: finalValue,
        previousValue,
        timestamp: Date.now(),
        source: this.config.appId,
        metadata: options.metadata
      };

      this.recordChange(change);

      // Notify listeners
      this.notifyListeners(normalizedPath, finalValue, previousValue);

      // Sync if enabled
      if (options.sync !== false && this.storeConfig.syncEnabled) {
        this.syncState(normalizedPath, change);
      }

      // Persist if enabled
      if (this.storeConfig.persistent) {
        this.persistState();
      }

      this.updateStats();

      if (this.config.debug) {
        console.log(`[GlobalStateStore] Set ${normalizedPath}:`, finalValue);
      }

      return true;

    } catch (error) {
      this.emit('state:error', { error: error as Error, context: 'set' });
      return false;
    }
  }

  /**
   * Get a state value
   */
  get<T extends StateValue>(path: StatePath, defaultValue?: T): T | undefined {
    const normalizedPath = this.normalizePath(path);
    const value = this.state.get(normalizedPath);
    return value !== undefined ? (value as T) : defaultValue;
  }

  /**
   * Check if a path exists in state
   */
  has(path: StatePath): boolean {
    const normalizedPath = this.normalizePath(path);
    return this.state.has(normalizedPath);
  }

  /**
   * Delete a state value
   */
  delete(path: StatePath, options: { sync?: boolean; metadata?: Record<string, any> } = {}): boolean {
    const normalizedPath = this.normalizePath(path);
    const previousValue = this.state.get(normalizedPath);

    if (!this.state.has(normalizedPath)) {
      return false;
    }

    try {
      this.state.delete(normalizedPath);

      // Record change
      const change: StateChange = {
        id: this.generateChangeId(),
        path: normalizedPath,
        operation: 'delete',
        value: undefined,
        previousValue,
        timestamp: Date.now(),
        source: this.config.appId,
        metadata: options.metadata
      };

      this.recordChange(change);

      // Notify listeners
      this.notifyListeners(normalizedPath, undefined, previousValue);

      // Sync if enabled
      if (options.sync !== false && this.storeConfig.syncEnabled) {
        this.syncState(normalizedPath, change);
      }

      // Persist if enabled
      if (this.storeConfig.persistent) {
        this.persistState();
      }

      this.updateStats();

      if (this.config.debug) {
        console.log(`[GlobalStateStore] Deleted ${normalizedPath}`);
      }

      return true;

    } catch (error) {
      this.emit('state:error', { error: error as Error, context: 'delete' });
      return false;
    }
  }

  /**
   * Merge object values
   */
  merge<T extends Record<string, any>>(
    path: StatePath,
    value: Partial<T>,
    options: { sync?: boolean; deep?: boolean; metadata?: Record<string, any> } = {}
  ): boolean {
    const normalizedPath = this.normalizePath(path);
    const currentValue = this.get(normalizedPath) as T || {} as T;

    if (typeof currentValue !== 'object' || currentValue === null) {
      return this.set(path, value, options);
    }

    try {
      const mergedValue = options.deep
        ? this.deepMerge(currentValue, value)
        : { ...currentValue, ...value };

      return this.set(path, mergedValue, options);

    } catch (error) {
      this.emit('state:error', { error: error as Error, context: 'merge' });
      return false;
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe<T extends StateValue>(
    path: StatePath,
    listener: StateListener<T>,
    options: StateSubscriptionOptions = {}
  ): string {
    const normalizedPath = this.normalizePath(path);
    const subscriptionId = this.generateSubscriptionId();

    // Wrap listener with options
    const wrappedListener = this.wrapListener(listener, options);

    // Add to listeners
    if (!this.stateListeners.has(normalizedPath)) {
      this.stateListeners.set(normalizedPath, new Set());
    }
    this.stateListeners.get(normalizedPath)!.add(wrappedListener as StateListener);

    // Store subscription mapping
    this.subscriptions.set(subscriptionId, normalizedPath);

    // Immediate notification if requested
    if (options.immediate) {
      const currentValue = this.get(normalizedPath);
      wrappedListener(currentValue as T, undefined as T, normalizedPath);
    }

    this.emit('subscription:added', { path: normalizedPath, id: subscriptionId });
    this.updateStats();

    if (this.config.debug) {
      console.log(`[GlobalStateStore] Subscribed to ${normalizedPath} (ID: ${subscriptionId})`);
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(subscriptionId: string): boolean {
    const path = this.subscriptions.get(subscriptionId);
    if (!path) {
      return false;
    }

    const listeners = this.stateListeners.get(path);
    if (listeners) {
      // Remove all listeners for this subscription (simplified approach)
      listeners.clear();
    }

    this.subscriptions.delete(subscriptionId);
    this.emit('subscription:removed', { path, id: subscriptionId });
    this.updateStats();

    if (this.config.debug) {
      console.log(`[GlobalStateStore] Unsubscribed ${subscriptionId}`);
    }

    return true;
  }

  /**
   * Add state validator
   */
  addValidator<T extends StateValue>(path: StatePath, validator: StateValidator<T>): void {
    const normalizedPath = this.normalizePath(path);
    this.validators.set(normalizedPath, validator as StateValidator);

    if (this.config.debug) {
      console.log(`[GlobalStateStore] Added validator for ${normalizedPath}`);
    }
  }

  /**
   * Add state transformer
   */
  addTransformer<T extends StateValue>(path: StatePath, transformer: StateTransformer<T>): void {
    const normalizedPath = this.normalizePath(path);
    this.transformers.set(normalizedPath, transformer as unknown as StateTransformer);

    if (this.config.debug) {
      console.log(`[GlobalStateStore] Added transformer for ${normalizedPath}`);
    }
  }

  /**
   * Get all state keys
   */
  keys(): string[] {
    return Array.from(this.state.keys());
  }

  /**
   * Get all state values
   */
  values(): StateValue[] {
    return Array.from(this.state.values());
  }

  /**
   * Get all state entries
   */
  entries(): [string, StateValue][] {
    return Array.from(this.state.entries());
  }

  /**
   * Clear all state
   */
  clear(options: { sync?: boolean } = {}): void {
    const previousState = new Map(this.state);
    this.state.clear();
    this.stateListeners.clear();
    this.subscriptions.clear();
    this.history.length = 0;

    // Record clear operation
    const change: StateChange = {
      id: this.generateChangeId(),
      path: '*',
      operation: 'delete',
      value: undefined,
      previousValue: Object.fromEntries(previousState),
      timestamp: Date.now(),
      source: this.config.appId
    };

    this.recordChange(change);

    // Sync if enabled
    if (options.sync !== false && this.storeConfig.syncEnabled) {
      this.syncState('*', change);
    }

    // Persist if enabled
    if (this.storeConfig.persistent) {
      this.persistState();
    }

    this.emit('state:cleared', { namespace: this.storeConfig.namespace });
    this.updateStats();

    if (this.config.debug) {
      console.log('[GlobalStateStore] State cleared');
    }
  }

  /**
   * Get change history
   */
  getHistory(limit?: number): StateChange[] {
    return limit ? this.history.slice(-limit) : [...this.history];
  }

  /**
   * Get store statistics
   */
  getStats(): StateStoreStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Export state as JSON
   */
  export(): string {
    const exportData = {
      namespace: this.storeConfig.namespace,
      state: Object.fromEntries(this.state),
      timestamp: Date.now(),
      version: this.config.apiVersion
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import state from JSON
   */
  import(jsonData: string, options: { merge?: boolean; validate?: boolean } = {}): boolean {
    try {
      const importData = JSON.parse(jsonData);

      if (!options.merge) {
        this.clear({ sync: false });
      }

      for (const [path, value] of Object.entries(importData.state || {})) {
        this.set(path, value as StateValue, {
          sync: false,
          validate: options.validate
        });
      }

      if (this.config.debug) {
        console.log('[GlobalStateStore] State imported');
      }

      return true;

    } catch (error) {
      this.emit('state:error', { error: error as Error, context: 'import' });
      return false;
    }
  }

  // Private methods

  private normalizePath(path: StatePath): string {
    if (Array.isArray(path)) {
      return path.join('.');
    }
    return path;
  }

  private generateChangeId(): string {
    return `chg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private recordChange(change: StateChange): void {
    this.history.push(change);

    // Trim history if needed
    if (this.history.length > this.storeConfig.maxHistorySize) {
      this.history.shift();
    }

    this.emit('state:changed', { change });
  }

  private notifyListeners(path: string, value: StateValue, previousValue: StateValue): void {
    const listeners = this.stateListeners.get(path);
    if (listeners) {
      listeners.forEach((listener: StateListener) => {
        try {
          listener(value, previousValue, path);
        } catch (error) {
          this.emit('state:error', { error: error as Error, context: 'listener' });
        }
      });
    }
  }

  private wrapListener<T extends StateValue>(
    listener: StateListener<T>,
    options: StateSubscriptionOptions
  ): StateListener<T> {
    let wrappedListener = listener;

    // Apply filter
    if (options.filter) {
      const originalListener = wrappedListener;
      wrappedListener = (value, previousValue, path) => {
        if (options.filter!(value, path)) {
          originalListener(value, previousValue, path);
        }
      };
    }

    // Apply transform
    if (options.transform) {
      const originalListener = wrappedListener;
      wrappedListener = (value, previousValue, path) => {
        const transformedValue = options.transform!(value, path) as T;
        const transformedPrevious = previousValue !== undefined
          ? options.transform!(previousValue, path) as T
          : previousValue;
        originalListener(transformedValue, transformedPrevious, path);
      };
    }

    // Apply debounce
    if (options.debounce) {
      const originalListener = wrappedListener;
      wrappedListener = (value, previousValue, path) => {
        const timerId = this.debounceTimers.get(path);
        if (timerId) {
          clearTimeout(timerId);
        }

        this.debounceTimers.set(path, setTimeout(() => {
          originalListener(value, previousValue, path);
          this.debounceTimers.delete(path);
        }, options.debounce));
      };
    }

    // Apply throttle
    if (options.throttle) {
      const originalListener = wrappedListener;
      let lastCall = 0;

      wrappedListener = (value, previousValue, path) => {
        const now = Date.now();
        if (now - lastCall >= options.throttle!) {
          lastCall = now;
          originalListener(value, previousValue, path);
        }
      };
    }

    return wrappedListener;
  }

  private deepMerge(target: any, source: any): any {
    if (typeof target !== 'object' || target === null ||
      typeof source !== 'object' || source === null) {
      return source;
    }

    const result = { ...target };

    for (const key in source) {
      if (typeof source[key] === 'object' && source[key] !== null &&
        typeof result[key] === 'object' && result[key] !== null) {
        result[key] = this.deepMerge(result[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  private setupRealTimeSync(): void {
    if (!this.realTimeHub || !this.storeConfig.syncEnabled) {
      return;
    }

    // Subscribe to remote state changes
    this.realTimeHub.subscribeToChanges(
      'state',
      (data) => this.handleRemoteStateChange(data),
      { operations: ['set', 'merge', 'delete'] }
    );

    if (this.config.debug) {
      console.log('[GlobalStateStore] Real-time sync enabled');
    }
  }

  private async syncState(path: string, change: StateChange): Promise<void> {
    if (!this.realTimeHub) {
      return;
    }

    try {
      const success = await this.realTimeHub.sendChange(
        'state',
        `${this.storeConfig.namespace}:${path}`,
        'update',
        {
          change,
          namespace: this.storeConfig.namespace
        },
        { priority: 'normal' }
      );

      this.stats.syncOperations++;
      this.emit('state:synced', { path, success });

      if (this.config.debug) {
        console.log(`[GlobalStateStore] Synced ${path}: ${success ? 'success' : 'failed'}`);
      }

    } catch (error) {
      this.emit('state:error', { error: error as Error, context: 'sync' });
    }
  }

  private handleRemoteStateChange(data: any): void {
    const { change, namespace } = data.data;

    // Only process changes from other namespaces
    if (namespace === this.storeConfig.namespace) {
      return;
    }

    const localValue = this.get(change.path);

    // Detect conflicts
    if (localValue !== undefined && localValue !== change.previousValue) {
      this.stats.conflicts++;
      this.emit('state:conflict', {
        path: change.path,
        local: localValue,
        remote: change.value
      });

      // Apply conflict resolution
      const resolvedValue = this.resolveConflict(localValue, change.value, change.path);
      this.set(change.path, resolvedValue, { sync: false });
    } else {
      // No conflict, apply change
      this.set(change.path, change.value, { sync: false });
    }
  }

  private resolveConflict(localValue: StateValue, remoteValue: StateValue, path: string): StateValue {
    switch (this.storeConfig.conflictResolution) {
      case 'client-wins':
        return localValue;

      case 'server-wins':
        return remoteValue;

      case 'merge':
        if (typeof localValue === 'object' && typeof remoteValue === 'object' &&
          localValue !== null && remoteValue !== null) {
          return this.deepMerge(localValue, remoteValue);
        }
        return remoteValue;

      default:
        return remoteValue;
    }
  }

  private persistState(): void {
    if (!this.storeConfig.persistent || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stateData = {
        state: Object.fromEntries(this.state),
        timestamp: Date.now(),
        namespace: this.storeConfig.namespace
      };

      const serialized = JSON.stringify(stateData);
      const key = `codai_state_${this.storeConfig.namespace}`;

      localStorage.setItem(key, serialized);

    } catch (error) {
      this.emit('state:error', { error: error as Error, context: 'persist' });
    }
  }

  private loadPersistedState(): void {
    if (!this.storeConfig.persistent || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const key = `codai_state_${this.storeConfig.namespace}`;
      const serialized = localStorage.getItem(key);

      if (!serialized) {
        return;
      }

      const stateData = JSON.parse(serialized);

      for (const [path, value] of Object.entries(stateData.state || {})) {
        this.state.set(path, value as StateValue);
      }

      this.updateStats();

      if (this.config.debug) {
        console.log(`[GlobalStateStore] Loaded ${this.state.size} persisted state items`);
      }

    } catch (error) {
      this.emit('state:error', { error: error as Error, context: 'load' });
    }
  }

  private updateStats(): void {
    this.stats.totalKeys = this.state.size;
    this.stats.memoryUsage = this.calculateMemoryUsage();
    this.stats.operationsCount++;
    this.stats.lastUpdate = new Date();
    this.stats.listeners = Array.from(this.stateListeners.values())
      .reduce((total, set) => total + set.size, 0);
    this.stats.subscriptions = this.subscriptions.size;

    this.emit('stats:updated', { stats: this.stats });
  }

  private calculateMemoryUsage(): number {
    try {
      return JSON.stringify(Object.fromEntries(this.state)).length;
    } catch {
      return 0;
    }
  }

  /**
   * Cleanup and destroy store
   */
  destroy(): void {
    // Clear all timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.throttleTimers.forEach(timer => clearTimeout(timer));

    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    // Clear all data
    this.state.clear();
    this.stateListeners.clear();
    this.subscriptions.clear();
    this.validators.clear();
    this.transformers.clear();
    this.history.length = 0;
    this.debounceTimers.clear();
    this.throttleTimers.clear();

    // Remove all event listeners
    this.removeAllListeners();

    if (this.config.debug) {
      console.log('[GlobalStateStore] Destroyed');
    }
  }
}
