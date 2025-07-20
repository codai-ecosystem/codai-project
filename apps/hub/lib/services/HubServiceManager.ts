import { MemoraiService } from '@codai/memorai';
import { CentralizedAuthService } from '@codai/auth';
import { ConversaiService } from '@codai/conversai';
import { FabricaiService } from '@codai/fabricai';
import { RomaiService } from '@codai/romai';

// Service configuration
interface ServiceConfig {
  memorai: {
    databaseUrl: string;
    redisUrl?: string;
    vectorDbUrl?: string;
    storageProvider: 'local' | 's3' | 'azure';
    storageConfig: Record<string, any>;
  };
  auth: {
    authUrl: string;
    tokenKey: string;
    refreshKey: string;
    oauthProviders?: ('google' | 'github' | 'discord')[];
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableRemoteLogging: boolean;
    remoteEndpoint?: string;
  };
}

class HubServiceManager {
  private static instance: HubServiceManager;
  private services: {
    memorai?: MemoraiService;
    auth?: CentralizedAuthService;
    conversai?: ConversaiService;
    fabricai?: FabricaiService;
    romai?: RomaiService;
  } = {};

  private initialized = false;
  private config?: ServiceConfig;

  private constructor() { }

  static getInstance(): HubServiceManager {
    if (!HubServiceManager.instance) {
      HubServiceManager.instance = new HubServiceManager();
    }
    return HubServiceManager.instance;
  }

  async initialize(config: ServiceConfig): Promise<void> {
    if (this.initialized) {
      console.warn('HubServiceManager already initialized');
      return;
    }

    this.config = config;

    try {
      console.log('🚀 Initializing CODAI Hub Services...');

      // Initialize services in order of dependencies

      // 1. Initialize auth service (no dependencies)
      console.log('🔐 Initializing Authentication Service...');
      this.services.auth = new CentralizedAuthService(config.auth);

      // 2. Initialize memorai service (no dependencies)
      console.log('🧠 Initializing Memorai Service...');
      // Note: In real implementation, MemoraiService would take config parameter
      this.services.memorai = new MemoraiService(config.memorai);

      // 3. Initialize dependent services
      if (this.services.memorai && this.services.auth) {
        console.log('💬 Initializing Conversai Service...');
        this.services.conversai = new ConversaiService(
          this.services.memorai,
          this.services.auth
        );

        console.log('🎨 Initializing Fabricai Service...');
        this.services.fabricai = new FabricaiService(
          this.services.memorai,
          this.services.auth
        );

        console.log('🇷🇴 Initializing RomAI Service...');
        this.services.romai = new RomaiService(
          this.services.memorai,
          this.services.auth
        );
      }

      // Validate all services are initialized
      await this.validateServices();

      this.initialized = true;
      console.log('✅ All CODAI Hub Services initialized successfully!');

    } catch (error) {
      console.error('❌ Failed to initialize CODAI Hub Services:', error);
      throw new Error(`Service initialization failed: ${error}`);
    }
  }

  private async validateServices(): Promise<void> {
    const requiredServices = ['memorai', 'auth'] as const;
    const optionalServices = ['conversai', 'fabricai', 'romai'] as const;

    // Check required services
    for (const serviceName of requiredServices) {
      if (!this.services[serviceName]) {
        throw new Error(`Required service '${serviceName}' not initialized`);
      }
    }

    // Validate auth service
    if (this.services.auth) {
      try {
        // Test auth service connectivity
        await this.services.auth.validateToken();
        console.log('✅ Auth service validation successful');
      } catch (error) {
        console.warn('⚠️ Auth service validation warning:', error);
      }
    }

    // Validate memorai service
    if (this.services.memorai) {
      try {
        // Test memorai service connectivity
        const healthCheck = await this.services.memorai.health();
        if (!healthCheck.healthy) {
          console.warn('⚠️ Memorai service health check warning:', healthCheck.issues);
        } else {
          console.log('✅ Memorai service health check successful');
        }
      } catch (error) {
        console.warn('⚠️ Memorai service health check warning:', error);
      }
    }

    console.log('🔍 Service validation completed');
  }

  // Service getters with type safety
  get memorai(): MemoraiService {
    if (!this.services.memorai) {
      throw new Error('Memorai service not initialized. Call initialize() first.');
    }
    return this.services.memorai;
  }

  get auth(): CentralizedAuthService {
    if (!this.services.auth) {
      throw new Error('Auth service not initialized. Call initialize() first.');
    }
    return this.services.auth;
  }

  get conversai(): ConversaiService {
    if (!this.services.conversai) {
      throw new Error('Conversai service not initialized. Call initialize() first.');
    }
    return this.services.conversai;
  }

  get fabricai(): FabricaiService {
    if (!this.services.fabricai) {
      throw new Error('Fabricai service not initialized. Call initialize() first.');
    }
    return this.services.fabricai;
  }

  get romai(): RomaiService {
    if (!this.services.romai) {
      throw new Error('RomAI service not initialized. Call initialize() first.');
    }
    return this.services.romai;
  }

  // Utility methods
  isInitialized(): boolean {
    return this.initialized;
  }

  getAvailableServices(): string[] {
    return Object.keys(this.services).filter(key => this.services[key as keyof typeof this.services]);
  }

  async getServiceHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: Array<{
      name: string;
      status: 'healthy' | 'degraded' | 'unhealthy';
      details?: string;
    }>;
  }> {
    const serviceChecks = [];
    let healthyCount = 0;

    // Check each service
    for (const [name, service] of Object.entries(this.services)) {
      if (!service) continue;

      try {
        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
        let details: string | undefined;

        // Service-specific health checks
        if (name === 'memorai' && 'health' in service) {
          const healthCheck = await (service as any).health();
          status = healthCheck.healthy ? 'healthy' : 'degraded';
          details = healthCheck.healthy ? undefined : healthCheck.issues?.join(', ');
        } else if (name === 'auth' && 'validateToken' in service) {
          try {
            await (service as any).validateToken();
            status = 'healthy';
          } catch (error) {
            status = 'degraded';
            details = 'Token validation failed';
          }
        }

        serviceChecks.push({ name, status, details });
        if (status === 'healthy') healthyCount++;

      } catch (error) {
        serviceChecks.push({
          name,
          status: 'unhealthy' as const,
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const overall = healthyCount === serviceChecks.length ? 'healthy' :
      healthyCount > serviceChecks.length / 2 ? 'degraded' : 'unhealthy';

    return { overall, services: serviceChecks };
  }

  // Cleanup method
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down CODAI Hub Services...');

    // Close services in reverse order
    const shutdownPromises = [];

    if (this.services.romai && 'shutdown' in this.services.romai) {
      shutdownPromises.push((this.services.romai as any).shutdown());
    }

    if (this.services.fabricai && 'shutdown' in this.services.fabricai) {
      shutdownPromises.push((this.services.fabricai as any).shutdown());
    }

    if (this.services.conversai && 'shutdown' in this.services.conversai) {
      shutdownPromises.push((this.services.conversai as any).shutdown());
    }

    if (this.services.memorai && 'shutdown' in this.services.memorai) {
      shutdownPromises.push((this.services.memorai as any).shutdown());
    }

    if (this.services.auth && 'shutdown' in this.services.auth) {
      shutdownPromises.push((this.services.auth as any).shutdown());
    }

    try {
      await Promise.allSettled(shutdownPromises);
      this.services = {};
      this.initialized = false;
      console.log('✅ All services shut down successfully');
    } catch (error) {
      console.error('❌ Error during service shutdown:', error);
    }
  }
}

// Export singleton instance
export const hubServices = HubServiceManager.getInstance();

// Export types
export type { ServiceConfig };
export { HubServiceManager };

// Default configuration for development
export const defaultConfig: ServiceConfig = {
  memorai: {
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/codai_hub',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    vectorDbUrl: process.env.VECTOR_DB_URL || 'http://localhost:8080',
    storageProvider: 'local',
    storageConfig: {
      basePath: './storage'
    }
  },
  auth: {
    authUrl: process.env.AUTH_URL || 'http://localhost:3000',
    tokenKey: 'codai_token',
    refreshKey: 'codai_refresh_token',
    oauthProviders: ['google', 'github']
  },
  logging: {
    level: 'info',
    enableRemoteLogging: false
  }
};

// React hooks for service access
export function useMemoraiService() {
  if (!hubServices.isInitialized()) {
    throw new Error('Services not initialized. Initialize services before using hooks.');
  }
  return hubServices.memorai;
}

export function useAuthService() {
  if (!hubServices.isInitialized()) {
    throw new Error('Services not initialized. Initialize services before using hooks.');
  }
  return hubServices.auth;
}

export function useConversaiService() {
  if (!hubServices.isInitialized()) {
    throw new Error('Services not initialized. Initialize services before using hooks.');
  }
  return hubServices.conversai;
}

export function useFabricaiService() {
  if (!hubServices.isInitialized()) {
    throw new Error('Services not initialized. Initialize services before using hooks.');
  }
  return hubServices.fabricai;
}

export function useRomaiService() {
  if (!hubServices.isInitialized()) {
    throw new Error('Services not initialized. Initialize services before using hooks.');
  }
  return hubServices.romai;
}
