/**
 * CODAI SDK - TypeScript/JavaScript SDK
 * Official SDK for interacting with the CODAI ecosystem
 */

export * from './clients/GatewayClient';
export * from './clients/CBDClient';
export * from './clients/AdminClient';
export * from './clients/IdClient';
export * from './clients/HubClient';
export * from './clients/ControlAIClient';
export * from './clients/RomAIClient';
export * from './clients/BancAIClient';
export * from './clients/MemorAIClient';
export * from './clients/CODAIAppClient';

export * from './types/common';
export * from './types/services';
export * from './types/responses';

import { GatewayClient } from './clients/GatewayClient';
import { CBDClient } from './clients/CBDClient';
import { AdminClient } from './clients/AdminClient';
import { IdClient } from './clients/IdClient';
import { HubClient } from './clients/HubClient';
import { ControlAIClient } from './clients/ControlAIClient';
import { RomAIClient } from './clients/RomAIClient';
import { BancAIClient } from './clients/BancAIClient';
import { MemorAIClient } from './clients/MemorAIClient';
import { CODAIAppClient } from './clients/CODAIAppClient';

import type { 
  CODAIConfig, 
  ServiceEndpoints, 
  AuthConfig,
  ApiResponse
} from './types/common';

/**
 * Main CODAI SDK Class
 * Provides unified access to all CODAI services
 */
export class CODAI {
  private config: CODAIConfig;
  
  public readonly gateway: GatewayClient;
  public readonly cbd: CBDClient;
  public readonly admin: AdminClient;
  public readonly id: IdClient;
  public readonly hub: HubClient;
  public readonly controlai: ControlAIClient;
  public readonly romai: RomAIClient;
  public readonly bancai: BancAIClient;
  public readonly memorai: MemorAIClient;
  public readonly app: CODAIAppClient;

  /**
   * Initialize CODAI SDK
   * @param config - SDK configuration
   */
  constructor(config: Partial<CODAIConfig> = {}) {
    this.config = {
      gatewayUrl: 'http://localhost:4003',
      endpoints: {
        gateway: 'http://localhost:4003',
        cbd: 'http://localhost:4180',
        admin: 'http://localhost:4007',
        id: 'http://localhost:4004',
        hub: 'http://localhost:4008',
        controlai: 'http://localhost:4200',
        romai: 'http://localhost:6100',
        bancai: 'http://localhost:4005',
        memorai: 'http://localhost:4006',
        codai: 'http://localhost:4001'
      },
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      ...config
    };

    // Initialize service clients
    this.gateway = new GatewayClient(this.config);
    this.cbd = new CBDClient(this.config);
    this.admin = new AdminClient(this.config);
    this.id = new IdClient(this.config);
    this.hub = new HubClient(this.config);
    this.controlai = new ControlAIClient(this.config);
    this.romai = new RomAIClient(this.config);
    this.bancai = new BancAIClient(this.config);
    this.memorai = new MemorAIClient(this.config);
    this.app = new CODAIAppClient(this.config);
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<ApiResponse<Record<string, any>>> {
    try {
      const services = await Promise.allSettled([
        this.gateway.health(),
        this.cbd.health(),
        this.admin.health(),
        this.id.health(),
        this.hub.health(),
        this.controlai.health(),
        this.romai.health(),
        this.bancai.health(),
        this.memorai.health(),
        this.app.health()
      ]);

      const healthStatus = services.map((result, index) => {
        const serviceName = ['gateway', 'cbd', 'admin', 'id', 'hub', 'controlai', 'romai', 'bancai', 'memorai', 'app'][index];
        
        if (result.status === 'fulfilled') {
          return {
            service: serviceName,
            status: 'healthy',
            data: result.value.data
          };
        } else {
          return {
            service: serviceName,
            status: 'unhealthy',
            error: result.reason
          };
        }
      });

      const healthyCount = healthStatus.filter(s => s.status === 'healthy').length;
      const totalCount = healthStatus.length;

      return {
        success: true,
        data: {
          overall: {
            healthy: healthyCount,
            total: totalCount,
            percentage: Math.round((healthyCount / totalCount) * 100)
          },
          services: healthStatus
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown health check error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update SDK configuration
   */
  updateConfig(newConfig: Partial<CODAIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update all client configurations
    [
      this.gateway, this.cbd, this.admin, this.id, this.hub,
      this.controlai, this.romai, this.bancai, this.memorai, this.app
    ].forEach(client => {
      if (client.updateConfig) {
        client.updateConfig(this.config);
      }
    });
  }

  /**
   * Get current SDK configuration
   */
  getConfig(): CODAIConfig {
    return { ...this.config };
  }

  /**
   * Set authentication for all services
   */
  setAuth(auth: AuthConfig): void {
    this.config.auth = auth;
    this.updateConfig({ auth });
  }

  /**
   * Get SDK version
   */
  static getVersion(): string {
    return '1.0.0';
  }
}

/**
 * Create a new CODAI SDK instance
 * @param config - SDK configuration
 */
export function createCODAI(config?: Partial<CODAIConfig>): CODAI {
  return new CODAI(config);
}

/**
 * Default export for easier importing
 */
export default CODAI;
