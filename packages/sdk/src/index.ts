/**
 * CODAI Universal SDK - Main Entry Point
 * Complete ecosystem integration for all CODAI services
 */

import type { CodaiConfig, CodaiEventMap } from './types';
import { CodaiEventBus } from './events';
import { StorageUtils, CryptoUtils, DateUtils, ErrorUtils } from './utils';

// Service imports
import { AuthService } from './auth';
import { StorageService } from './storage';
import { MemoryService } from './memory';
import { AnalyticsService } from './analytics';
import { WalletService } from './wallet';
import { MarketplaceService } from './marketplace';
import { LegalService } from './legal';
import { SupportService } from './support';
import { IdentityService } from './identity';

// Export all types and interfaces
export type { CodaiConfig, CodaiEventMap } from './types';
export * from './config';
export * from './events';
export * from './utils';
export * from './auth';
export * from './storage';
export * from './memory';
export * from './analytics';
export * from './wallet';
export * from './marketplace';
export * from './legal';
export * from './support';
export * from './identity';

// Real-time system exports
export * from './realtime';

// State management exports
export {
  GlobalStateStore,
  CrossAppDataBridge,
  StateManagementHub
} from './state';
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
  StateStoreEvents,
  DataBridgeConfig,
  CrossAppData,
  DataSubscription,
  DataCallback,
  DataFilter,
  DataTransformer,
  DataBridgeEvents,
  DataBridgeStats,
  StateHubConfig,
  StateHubEvents
} from './state';

// SDK Version
export const SDK_VERSION = '1.0.0';

/**
 * Main CODAI SDK Class
 * Orchestrates all CODAI ecosystem services
 */
export class CodaiSDK {
  private config: CodaiConfig;
  private eventBus: CodaiEventBus;
  private services: Map<string, any> = new Map();
  private initialized = false;

  // Service instances
  public readonly auth: AuthService;
  public readonly storage: StorageService;
  public readonly memory: MemoryService;
  public readonly analytics: AnalyticsService;
  public readonly wallet: WalletService;
  public readonly marketplace: MarketplaceService;
  public readonly legal: LegalService;
  public readonly support: SupportService;
  public readonly identity: IdentityService;

  constructor(config: CodaiConfig) {
    // Validate configuration
    this.config = {
      ...config,
      timeout: config.timeout ?? 30000,
      retryAttempts: config.retryAttempts ?? 3,
      debug: config.debug ?? false,
      startTime: config.startTime ?? Date.now(),
      healthCheckInterval: config.healthCheckInterval ?? 60000
    };

    this.eventBus = new CodaiEventBus(this.config);

    // Initialize all services
    this.auth = new AuthService(this.config);
    this.storage = new StorageService(this.config);
    this.memory = new MemoryService(this.config);
    this.analytics = new AnalyticsService(this.config);
    this.wallet = new WalletService(this.config);
    this.marketplace = new MarketplaceService(this.config);
    this.legal = new LegalService(this.config);
    this.support = new SupportService(this.config);
    this.identity = new IdentityService(this.config);

    // Register services
    this.services.set('auth', this.auth);
    this.services.set('storage', this.storage);
    this.services.set('memory', this.memory);
    this.services.set('analytics', this.analytics);
    this.services.set('wallet', this.wallet);
    this.services.set('marketplace', this.marketplace);
    this.services.set('legal', this.legal);
    this.services.set('support', this.support);
    this.services.set('identity', this.identity);

    if (this.config.debug) {
      console.log(`[CodaiSDK] Initialized v${SDK_VERSION} with ${this.services.size} services`);
    }
  }

  /**
   * Initialize SDK and establish connections
   */
  async initialize(): Promise<void> {
    try {
      if (this.initialized) {
        console.warn('[CodaiSDK] Already initialized');
        return;
      }

      if (this.config.debug) {
        console.log('[CodaiSDK] Starting initialization...');
      }

      // Emit initialization event
      this.eventBus.emit('sdk:init:start', {
        version: SDK_VERSION,
        config: this.config,
        timestamp: new Date()
      });

      // Initialize each service
      const initPromises = Array.from(this.services.entries()).map(async ([name, service]) => {
        try {
          if (typeof service.initialize === 'function') {
            await service.initialize();
          }

          if (this.config.debug) {
            console.log(`[CodaiSDK] Service ${name} initialized successfully`);
          }

          return { name, status: 'success' };
        } catch (error) {
          console.error(`[CodaiSDK] Failed to initialize service ${name}:`, error);
          return { name, status: 'failed', error };
        }
      });

      const results = await Promise.allSettled(initPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (this.config.debug) {
        console.log(`[CodaiSDK] Initialization complete: ${successful} successful, ${failed} failed`);
      }

      this.initialized = true;

      // Emit completion event
      this.eventBus.emit('sdk:init:complete', {
        version: SDK_VERSION,
        successful,
        failed,
        timestamp: new Date()
      });

      // Start health monitoring
      this.startHealthMonitoring();

    } catch (error) {
      this.eventBus.emit('sdk:init:error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw ErrorUtils.createError('SDK initialization failed', 'SDK_INIT_FAILED', error);
    }
  }

  /**
   * Get SDK health status
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    services: Record<string, {
      status: 'online' | 'offline' | 'error';
      responseTime?: number;
      lastCheck: Date;
      error?: string;
    }>;
    uptime: number;
    timestamp: Date;
  }> {
    const healthChecks = await Promise.allSettled(
      Array.from(this.services.entries()).map(async ([name, service]) => {
        const start = Date.now();
        try {
          // Health check method if available
          if (typeof service.healthCheck === 'function') {
            await service.healthCheck();
          }

          return {
            name,
            status: 'online' as const,
            responseTime: Date.now() - start,
            lastCheck: new Date()
          };
        } catch (error) {
          return {
            name,
            status: 'error' as const,
            responseTime: Date.now() - start,
            lastCheck: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const services: Record<string, any> = {};
    let onlineCount = 0;
    let errorCount = 0;

    healthChecks.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { name, ...serviceHealth } = result.value;
        services[name] = serviceHealth;
        if (serviceHealth.status === 'online') onlineCount++;
        if (serviceHealth.status === 'error') errorCount++;
      }
    });

    const totalServices = this.services.size;
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';

    if (errorCount === 0) {
      overallStatus = 'healthy';
    } else if (errorCount < totalServices / 2) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    return {
      status: overallStatus,
      version: SDK_VERSION,
      services,
      uptime: Date.now() - (this.config.startTime || Date.now()),
      timestamp: new Date()
    };
  }

  /**
   * Get configuration
   */
  getConfig(): CodaiConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<CodaiConfig>): void {
    this.config = { ...this.config, ...updates };

    // Propagate config updates to services
    this.services.forEach((service, name) => {
      if (typeof service.updateConfig === 'function') {
        service.updateConfig(this.config);
      }
    });

    this.eventBus.emit('sdk:config:updated', {
      updates,
      timestamp: new Date()
    });
  }

  /**
   * Get event bus for cross-app communication
   */
  getEventBus(): CodaiEventBus {
    return this.eventBus;
  }

  /**
   * Get service by name
   */
  getService<T = any>(name: string): T | undefined {
    return this.services.get(name);
  }

  /**
   * Check if service is available
   */
  hasService(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * List all available services
   */
  listServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Cleanup and disconnect
   */
  async destroy(): Promise<void> {
    try {
      if (this.config.debug) {
        console.log('[CodaiSDK] Starting cleanup...');
      }

      this.eventBus.emit('sdk:destroy:start', {
        timestamp: new Date()
      });

      // Stop health monitoring
      this.stopHealthMonitoring();

      // Cleanup services
      const cleanupPromises = Array.from(this.services.entries()).map(async ([name, service]) => {
        try {
          if (typeof service.destroy === 'function') {
            await service.destroy();
          }
          if (this.config.debug) {
            console.log(`[CodaiSDK] Service ${name} cleaned up`);
          }
        } catch (error) {
          console.error(`[CodaiSDK] Failed to cleanup service ${name}:`, error);
        }
      });

      await Promise.allSettled(cleanupPromises);

      // Clear services
      this.services.clear();
      this.initialized = false;

      this.eventBus.emit('sdk:destroy:complete', {
        timestamp: new Date()
      });

      if (this.config.debug) {
        console.log('[CodaiSDK] Cleanup complete');
      }

    } catch (error) {
      console.error('[CodaiSDK] Error during cleanup:', error);
      throw ErrorUtils.createError('SDK cleanup failed', 'SDK_CLEANUP_FAILED', error);
    }
  }

  // Private methods
  private healthMonitorInterval?: NodeJS.Timeout;

  private startHealthMonitoring(): void {
    if (this.config.healthCheckInterval && this.config.healthCheckInterval > 0) {
      this.healthMonitorInterval = setInterval(async () => {
        try {
          const health = await this.getHealth();
          this.eventBus.emit('sdk:health:check', health);

          if (health.status === 'unhealthy') {
            this.eventBus.emit('sdk:health:unhealthy', {
              services: health.services,
              timestamp: health.timestamp
            });
          }
        } catch (error) {
          console.error('[CodaiSDK] Health check failed:', error);
        }
      }, this.config.healthCheckInterval);
    }
  }

  private stopHealthMonitoring(): void {
    if (this.healthMonitorInterval) {
      clearInterval(this.healthMonitorInterval);
      this.healthMonitorInterval = undefined;
    }
  }
}

/**
 * Create and initialize CODAI SDK instance
 */
export async function createCodaiSDK(config: CodaiConfig): Promise<CodaiSDK> {
  const sdk = new CodaiSDK(config);
  await sdk.initialize();
  return sdk;
}

/**
 * Default SDK instance (singleton pattern)
 */
let defaultSDKInstance: CodaiSDK | null = null;

/**
 * Get or create default SDK instance
 */
export async function getCodaiSDK(config?: CodaiConfig): Promise<CodaiSDK> {
  if (!defaultSDKInstance && config) {
    defaultSDKInstance = await createCodaiSDK(config);
  }

  if (!defaultSDKInstance) {
    throw new Error('SDK not initialized. Call getCodaiSDK(config) first.');
  }

  return defaultSDKInstance;
}

/**
 * Reset default SDK instance
 */
export async function resetCodaiSDK(): Promise<void> {
  if (defaultSDKInstance) {
    await defaultSDKInstance.destroy();
    defaultSDKInstance = null;
  }
}

// Export default
export default CodaiSDK;
