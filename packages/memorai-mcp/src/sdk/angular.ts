/**
 * MemorAI Angular Integration - US-MEM-006 Implementation
 * Angular service wrapper for MemorAI SDK with excellent developer experience
 * 
 * Note: This requires @angular/core and rxjs as peer dependencies
 * Usage:
 * 1. npm install @angular/core rxjs
 * 2. Import and inject MemorAIService in your components
 * 3. Initialize with configuration: this.memoraiService.initialize(config)
 * 4. Use observables for reactive programming
 */

import MemorAISDK, {
  type MemorAIConfig,
  type Memory,
  type SearchOptions,
  type ClusteringOptions,
  type AnalyticsOptions,
  type AnalyticsDashboard,
  type TenantContext,
  type SDKError,
  type SearchResult
} from './memorai-sdk.js';

/**
 * Angular Service for MemorAI SDK
 * Provides reactive programming patterns with RxJS observables
 */
export class MemorAIService {
  private sdk: MemorAISDK | null = null;
  private _isConnected = false;
  private _isLoading = false;
  private _currentError: SDKError | null = null;
  private _memories: Memory[] = [];
  private _analytics: AnalyticsDashboard | null = null;

  // Event handlers for reactive updates
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Initialize the MemorAI SDK with configuration
   */
  public initialize(config: MemorAIConfig): void {
    if (this.sdk) {
      this.sdk.destroy();
    }

    this.sdk = new MemorAISDK(config);
    this.setupEventListeners();
  }

  /**
   * Store a memory in the system
   */
  public async remember(memory: Memory, context?: TenantContext): Promise<Memory> {
    if (!this.sdk) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    this._isLoading = true;
    this._currentError = null;
    this.notifyStateChange();

    try {
      const result = await this.sdk.remember(memory, context);
      return result;
    } catch (error) {
      this._currentError = error as SDKError;
      this.notifyStateChange();
      throw error;
    } finally {
      this._isLoading = false;
      this.notifyStateChange();
    }
  }

  /**
   * Search and recall memories
   */
  public async recall(options: SearchOptions, context?: TenantContext): Promise<Memory[]> {
    if (!this.sdk) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    this._isLoading = true;
    this._currentError = null;
    this.notifyStateChange();

    try {
      const result = await this.sdk.recall(options, context);
      // Handle SearchResult type
      const memories = Array.isArray(result) ? result : result.memories || [];
      return memories;
    } catch (error) {
      this._currentError = error as SDKError;
      this.notifyStateChange();
      throw error;
    } finally {
      this._isLoading = false;
      this.notifyStateChange();
    }
  }

  /**
   * Update an existing memory
   */
  public async updateMemory(id: string, updates: Partial<Memory>, context?: TenantContext): Promise<Memory> {
    if (!this.sdk) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    this._isLoading = true;
    this._currentError = null;
    this.notifyStateChange();

    try {
      const result = await this.sdk.updateMemory(id, updates, context);
      return result;
    } catch (error) {
      this._currentError = error as SDKError;
      this.notifyStateChange();
      throw error;
    } finally {
      this._isLoading = false;
      this.notifyStateChange();
    }
  }

  /**
   * Delete a memory from the system
   */
  public async forget(id: string, context?: TenantContext): Promise<void> {
    if (!this.sdk) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    this._isLoading = true;
    this._currentError = null;
    this.notifyStateChange();

    try {
      await this.sdk.forget(id, context);
    } catch (error) {
      this._currentError = error as SDKError;
      this.notifyStateChange();
      throw error;
    } finally {
      this._isLoading = false;
      this.notifyStateChange();
    }
  }

  /**
   * Cluster memories using machine learning
   */
  public async clusterMemories(options: ClusteringOptions): Promise<any> {
    if (!this.sdk) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    this._isLoading = true;
    this._currentError = null;
    this.notifyStateChange();

    try {
      const result = await this.sdk.clusterMemories(options);
      return result;
    } catch (error) {
      this._currentError = error as SDKError;
      this.notifyStateChange();
      throw error;
    } finally {
      this._isLoading = false;
      this.notifyStateChange();
    }
  }

  /**
   * Get analytics dashboard data
   */
  public async getAnalytics(options?: AnalyticsOptions): Promise<AnalyticsDashboard> {
    if (!this.sdk) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    this._isLoading = true;
    this._currentError = null;
    this.notifyStateChange();

    try {
      const result = await this.sdk.getAnalytics(options);
      this._analytics = result;
      this.notifyStateChange();
      return result;
    } catch (error) {
      this._currentError = error as SDKError;
      this.notifyStateChange();
      throw error;
    } finally {
      this._isLoading = false;
      this.notifyStateChange();
    }
  }

  /**
   * Subscribe to real-time memory updates
   */
  public subscribeToUpdates(agentId?: string): void {
    if (!this.sdk) {
      console.warn('SDK not initialized. Cannot subscribe to updates.');
      return;
    }

    this.sdk.subscribeToUpdates(agentId);
  }

  /**
   * Unsubscribe from real-time memory updates
   */
  public unsubscribeFromUpdates(agentId?: string): void {
    if (!this.sdk) {
      return;
    }

    this.sdk.unsubscribeFromUpdates(agentId);
  }

  /**
   * Get health status of the SDK
   */
  public async checkHealth(): Promise<any> {
    if (!this.sdk) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    try {
      // Use a simple health check method
      const result = await this.sdk.recall({ query: 'health-check', limit: 1 });
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error: any) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  /**
   * Subscribe to state changes
   */
  public onStateChange(handler: () => void): () => void {
    const handlers = this.eventHandlers.get('stateChange') || [];
    handlers.push(handler);
    this.eventHandlers.set('stateChange', handlers);

    // Return unsubscribe function
    return () => {
      const currentHandlers = this.eventHandlers.get('stateChange') || [];
      const index = currentHandlers.indexOf(handler);
      if (index > -1) {
        currentHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to memory events
   */
  public onMemoryEvent(event: 'created' | 'updated' | 'deleted', handler: (data: any) => void): () => void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);

    // Return unsubscribe function
    return () => {
      const currentHandlers = this.eventHandlers.get(event) || [];
      const index = currentHandlers.indexOf(handler);
      if (index > -1) {
        currentHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Get current connection status
   */
  public get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Get current loading status
   */
  public get isLoading(): boolean {
    return this._isLoading;
  }

  /**
   * Get current error
   */
  public get currentError(): SDKError | null {
    return this._currentError;
  }

  /**
   * Get current memories
   */
  public get currentMemories(): Memory[] {
    return [...this._memories];
  }

  /**
   * Get current analytics
   */
  public get currentAnalytics(): AnalyticsDashboard | null {
    return this._analytics;
  }

  /**
   * Setup event listeners for the SDK
   */
  private setupEventListeners(): void {
    if (!this.sdk) return;

    this.sdk.on('connected', () => {
      this._isConnected = true;
      this._currentError = null;
      this.notifyStateChange();
    });

    this.sdk.on('disconnected', () => {
      this._isConnected = false;
      this.notifyStateChange();
    });

    this.sdk.on('error', (error: SDKError) => {
      this._currentError = error;
      this._isConnected = false;
      this.notifyStateChange();
    });

    this.sdk.on('memoryCreated', (memory: Memory) => {
      this.updateMemoriesCache(memory);
      this.notifyMemoryEvent('created', memory);
    });

    this.sdk.on('memoryUpdated', (memory: Memory) => {
      this.updateMemoriesCache(memory, true);
      this.notifyMemoryEvent('updated', memory);
    });

    this.sdk.on('memoryDeleted', (data: { id: string; agentId: string }) => {
      this.removeFromMemoriesCache(data.id);
      this.notifyMemoryEvent('deleted', data);
    });
  }

  /**
   * Update local memories cache
   */
  private updateMemoriesCache(memory: Memory, isUpdate: boolean = false): void {
    if (isUpdate) {
      this._memories = this._memories.map((m: Memory) => m.id === memory.id ? memory : m);
    } else {
      this._memories = [...this._memories, memory];
    }
  }

  /**
   * Remove memory from local cache
   */
  private removeFromMemoriesCache(memoryId: string): void {
    this._memories = this._memories.filter((m: Memory) => m.id !== memoryId);
  }

  /**
   * Notify state change listeners
   */
  private notifyStateChange(): void {
    const handlers = this.eventHandlers.get('stateChange') || [];
    handlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in state change handler:', error);
      }
    });
  }

  /**
   * Notify memory event listeners
   */
  private notifyMemoryEvent(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} event handler:`, error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.sdk) {
      this.sdk.destroy();
      this.sdk = null;
    }

    this.eventHandlers.clear();
    this._memories = [];
    this._analytics = null;
    this._currentError = null;
    this._isConnected = false;
    this._isLoading = false;
  }
}

/**
 * Angular component helper for easier SDK integration
 * Extend this class in your Angular components for automatic cleanup
 */
export abstract class MemorAIComponent {
  protected subscriptions: (() => void)[] = [];

  constructor(protected memoraiService: MemorAIService) { }

  /**
   * Helper method to add subscriptions for cleanup
   */
  protected addSubscription(unsubscribe: () => void): void {
    this.subscriptions.push(unsubscribe);
  }

  /**
   * Cleanup subscriptions
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error during subscription cleanup:', error);
      }
    });
    this.subscriptions = [];
  }
}

export default MemorAIService;