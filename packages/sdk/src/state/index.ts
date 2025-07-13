/**
 * CODAI State Management System Exports
 * Global state management and cross-app data synchronization
 */

// Export state management components
export { GlobalStateStore } from './global-store';
export { CrossAppDataBridge } from './data-bridge';

// Export types
export type {
  StateValue,
  StatePath,
  StateListener,
  StateValidator,
  StateTransformer,
  StateOperation,
  StateChange,
  StateSubscriptionOptions,
  StateStoreConfig,
  StateStoreStats,
  StateStoreEvents
} from './global-store';

export type {
  DataBridgeConfig,
  CrossAppData,
  DataSubscription,
  DataCallback,
  DataFilter,
  DataTransformer,
  SubscriptionOptions,
  DataBridgeEvents,
  DataBridgeStats
} from './data-bridge';

/**
 * Unified State Management Hub
 * Combines global state store and cross-app data bridge
 */

import { EventEmitter } from 'eventemitter3';
import type { CodaiConfig } from '../types';
import type { RealTimeHub } from '../realtime';
import { GlobalStateStore, type StateValue } from './global-store';
import { CrossAppDataBridge } from './data-bridge';

// State hub configuration
export interface StateHubConfig {
  state: {
    namespace: string;
    persistent: boolean;
    syncEnabled: boolean;
    conflictResolution: 'client-wins' | 'server-wins' | 'merge' | 'manual';
    maxHistorySize: number;
  };
  bridge: {
    enableCache: boolean;
    cacheTimeout: number;
    maxDataSize: number;
    retryAttempts: number;
  };
}

// State hub events
export interface StateHubEvents {
  'hub:ready': { stateStore: GlobalStateStore; dataBridge: CrossAppDataBridge };
  'hub:error': { error: Error; component: string };
  'state:changed': { path: string; value: any; source: string };
  'data:shared': { dataType: string; targetApps: string[]; sourceApp: string };
}

/**
 * Unified State Management Hub
 */
export class StateManagementHub extends EventEmitter<StateHubEvents> {
  private config: CodaiConfig;
  private hubConfig: StateHubConfig;
  private realTimeHub?: RealTimeHub;

  // Core components
  public readonly stateStore: GlobalStateStore;
  public readonly dataBridge: CrossAppDataBridge;

  constructor(
    config: CodaiConfig,
    hubConfig: Partial<StateHubConfig> = {},
    realTimeHub?: RealTimeHub
  ) {
    super();
    this.config = config;
    this.realTimeHub = realTimeHub;

    this.hubConfig = {
      state: {
        namespace: config.appId,
        persistent: true,
        syncEnabled: true,
        conflictResolution: 'merge',
        maxHistorySize: 1000,
        ...hubConfig.state
      },
      bridge: {
        enableCache: true,
        cacheTimeout: 300000,
        maxDataSize: 1024 * 1024,
        retryAttempts: 3,
        ...hubConfig.bridge
      }
    };

    // Initialize components
    this.stateStore = new GlobalStateStore(
      config,
      {
        namespace: this.hubConfig.state.namespace,
        persistent: this.hubConfig.state.persistent,
        syncEnabled: this.hubConfig.state.syncEnabled,
        conflictResolution: this.hubConfig.state.conflictResolution,
        maxHistorySize: this.hubConfig.state.maxHistorySize
      },
      realTimeHub
    );

    this.dataBridge = new CrossAppDataBridge(
      config,
      this.stateStore,
      {
        namespace: `bridge_${config.appId}`,
        enableCache: this.hubConfig.bridge.enableCache,
        cacheTimeout: this.hubConfig.bridge.cacheTimeout,
        maxDataSize: this.hubConfig.bridge.maxDataSize,
        retryAttempts: this.hubConfig.bridge.retryAttempts
      },
      realTimeHub
    );

    this.setupEventForwarding();

    this.emit('hub:ready', { stateStore: this.stateStore, dataBridge: this.dataBridge });

    if (this.config.debug) {
      console.log('[StateManagementHub] Initialized with unified state management');
    }
  }

  /**
   * Set shared state that syncs across apps
   */
  async setSharedState<T extends StateValue>(path: string, value: T, targetApps?: string[]): Promise<boolean> {
    try {
      // Set in local state
      const success = this.stateStore.set(path, value, { sync: true });

      if (success && targetApps) {
        // Share via data bridge
        await this.dataBridge.sendData(
          targetApps,
          'shared_state',
          { path, value },
          { priority: 'normal' }
        );

        this.emit('data:shared', {
          dataType: 'shared_state',
          targetApps,
          sourceApp: this.config.appId
        });
      }

      return success;

    } catch (error) {
      this.emit('hub:error', { error: error as Error, component: 'setSharedState' });
      return false;
    }
  }

  /**
   * Subscribe to shared state changes from other apps
   */
  subscribeToSharedState<T>(
    path: string,
    callback: (value: T, sourceApp: string) => void,
    sourceApps?: string[]
  ): string {
    return this.dataBridge.subscribeToData(
      'shared_state',
      (data) => {
        if (data.payload.path === path) {
          callback(data.payload.value, data.sourceApp);
        }
      },
      { sourceApps }
    );
  }

  /**
   * Broadcast state change to all apps
   */
  async broadcastState<T extends StateValue>(path: string, value: T, excludeApps?: string[]): Promise<string> {
    try {
      // Set in local state
      this.stateStore.set(path, value, { sync: true });

      // Broadcast via data bridge
      const dataId = await this.dataBridge.broadcastData(
        'broadcast_state',
        { path, value },
        { excludeApps, priority: 'normal' }
      );

      this.emit('data:shared', {
        dataType: 'broadcast_state',
        targetApps: ['*'],
        sourceApp: this.config.appId
      });

      return dataId;

    } catch (error) {
      this.emit('hub:error', { error: error as Error, component: 'broadcastState' });
      throw error;
    }
  }

  /**
   * Subscribe to broadcast state changes
   */
  subscribeToBroadcastState<T>(
    callback: (path: string, value: T, sourceApp: string) => void,
    excludeApps?: string[]
  ): string {
    return this.dataBridge.subscribeToData(
      'broadcast_state',
      (data) => {
        if (!excludeApps || !excludeApps.includes(data.sourceApp)) {
          callback(data.payload.path, data.payload.value, data.sourceApp);
        }
      }
    );
  }

  /**
   * Get combined statistics
   */
  getStats(): {
    state: any;
    bridge: any;
    combined: {
      totalOperations: number;
      lastActivity: Date;
      memoryUsage: number;
    };
  } {
    const stateStats = this.stateStore.getStats();
    const bridgeStats = this.dataBridge.getStats();

    return {
      state: stateStats,
      bridge: bridgeStats,
      combined: {
        totalOperations: stateStats.operationsCount + bridgeStats.totalDataSent + bridgeStats.totalDataReceived,
        lastActivity: new Date(Math.max(stateStats.lastUpdate.getTime(), bridgeStats.lastActivity.getTime())),
        memoryUsage: stateStats.memoryUsage
      }
    };
  }

  /**
   * Update hub configuration
   */
  updateConfig(config: Partial<StateHubConfig>): void {
    this.hubConfig = { ...this.hubConfig, ...config };

    if (config.bridge) {
      this.dataBridge.updateConfig(config.bridge);
    }

    if (this.config.debug) {
      console.log('[StateManagementHub] Configuration updated');
    }
  }

  // Private methods

  private setupEventForwarding(): void {
    // Forward state store events
    this.stateStore.on('state:changed', (data) => {
      this.emit('state:changed', {
        path: data.change.path,
        value: data.change.value,
        source: data.change.source
      });
    });

    this.stateStore.on('state:error', (data) => {
      this.emit('hub:error', { error: data.error, component: 'stateStore' });
    });

    // Forward data bridge events
    this.dataBridge.on('data:sent', (data) => {
      this.emit('data:shared', {
        dataType: data.data.dataType,
        targetApps: data.targetApps,
        sourceApp: data.data.sourceApp
      });
    });

    this.dataBridge.on('error', (data) => {
      this.emit('hub:error', { error: data.error, component: 'dataBridge' });
    });
  }

  /**
   * Cleanup and destroy hub
   */
  destroy(): void {
    this.stateStore.destroy();
    this.dataBridge.destroy();
    this.removeAllListeners();

    if (this.config.debug) {
      console.log('[StateManagementHub] Destroyed');
    }
  }
}
