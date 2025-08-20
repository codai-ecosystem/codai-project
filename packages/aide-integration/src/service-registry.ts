import type { ServiceHealth } from './types';
import { ServiceStatus } from './types';

export interface ServiceRegistration {
  name: string;
  version: string;
  status: ServiceStatus;
  endpoint?: string;
  healthCheckUrl?: string;
  capabilities: string[];
  metadata?: Record<string, any>;
  registeredAt: Date;
  lastHeartbeat?: Date;
}

/**
 * Service Registry for managing AIDE ecosystem services
 */
export class ServiceRegistry {
  private services = new Map<string, ServiceRegistration>();
  private healthChecks = new Map<string, () => Promise<boolean>>();

  /**
   * Register a service
   */
  register(registration: Omit<ServiceRegistration, 'registeredAt'>): void {
    const fullRegistration: ServiceRegistration = {
      ...registration,
      registeredAt: new Date(),
    };

    this.services.set(registration.name, fullRegistration);
    console.log(`🔧 Service registered: ${registration.name} v${registration.version}`);
  }

  /**
   * Unregister a service
   */
  unregister(serviceName: string): boolean {
    const removed = this.services.delete(serviceName);
    this.healthChecks.delete(serviceName);

    if (removed) {
      console.log(`🔧 Service unregistered: ${serviceName}`);
    }

    return removed;
  }

  /**
   * Get service registration
   */
  get(serviceName: string): ServiceRegistration | undefined {
    return this.services.get(serviceName);
  }

  /**
   * List all registered services
   */
  list(): ServiceRegistration[] {
    return Array.from(this.services.values());
  }

  /**
   * Update service status
   */
  updateStatus(serviceName: string, status: ServiceStatus): void {
    const service = this.services.get(serviceName);
    if (service) {
      service.status = status;
      service.lastHeartbeat = new Date();
    }
  }

  /**
   * Register a health check function for a service
   */
  registerHealthCheck(serviceName: string, healthCheck: () => Promise<boolean>): void {
    this.healthChecks.set(serviceName, healthCheck);
  }

  /**
   * Run health checks for all services
   */
  async runHealthChecks(): Promise<ServiceHealth[]> {
    const results: ServiceHealth[] = [];

    for (const [serviceName, service] of this.services.entries()) {
      const healthCheck = this.healthChecks.get(serviceName);
      let status: ServiceHealth['status'] = 'down';
      let details: Record<string, any> = {};

      try {
        if (healthCheck) {
          const isHealthy = await healthCheck();
          status = isHealthy ? 'healthy' : 'degraded';
        } else if (service.status === ServiceStatus.READY) {
          status = 'healthy';
        }
      } catch (error) {
        status = 'down';
        details.error = error instanceof Error ? error.message : 'Unknown error';
      }

      results.push({
        service: serviceName,
        status,
        lastChecked: new Date(),
        details,
      });
    }

    return results;
  }

  /**
   * Find services by capability
   */
  findByCapability(capability: string): ServiceRegistration[] {
    return Array.from(this.services.values()).filter(service =>
      service.capabilities.includes(capability)
    );
  }
}

// Global service registry instance
export const globalServiceRegistry = new ServiceRegistry();
