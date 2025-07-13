/**
 * @codai/service-registry
 * 
 * Universal Service Discovery and Registry System
 * Enables seamless cross-service communication across the CODAI ecosystem
 */

import { EventEmitter } from 'events';
import axios, { AxiosInstance } from 'axios';
import Joi from 'joi';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ServiceConfig {
  id: string;
  name: string;
  version: string;
  type: 'web' | 'api' | 'worker' | 'database' | 'cache';
  url: string;
  port: number;
  endpoints?: string[];
  dependencies?: string[];
  metadata?: Record<string, any>;
  tags?: string[];
  environment: 'development' | 'staging' | 'production';
  region?: string;
}

export interface ServiceHealth {
  id: string;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  lastChecked: Date;
  responseTime: number;
  uptime: number;
  errors: string[];
  metrics?: Record<string, number>;
}

export interface ServiceInstance {
  config: ServiceConfig;
  health: ServiceHealth;
  registeredAt: Date;
  lastSeen: Date;
}

export interface DiscoveryQuery {
  name?: string;
  type?: string;
  tags?: string[];
  environment?: string;
  region?: string;
  healthyOnly?: boolean;
}

export interface LoadBalancingOptions {
  strategy?: 'round-robin' | 'least-connections' | 'weighted' | 'random';
  healthCheck?: boolean;
  retries?: number;
  timeout?: number;
}

// ============================================================================
// Service Registry Core
// ============================================================================

export class ServiceRegistry extends EventEmitter {
  private services = new Map<string, ServiceInstance>();
  private healthChecks = new Map<string, NodeJS.Timeout>();
  private loadBalancers = new Map<string, LoadBalancer>();
  private httpClient: AxiosInstance;
  private healthCheckInterval: number = 30000; // 30 seconds
  private maxRetries: number = 3;
  private requestTimeout: number = 5000; // 5 seconds

  constructor() {
    super();
    this.httpClient = axios.create({
      timeout: this.requestTimeout,
      validateStatus: (status) => status < 500
    });

    this.startHealthChecking();
    this.startCleanupProcess();

    console.log('🚀 ServiceRegistry initialized');
  }

  // ========================================================================
  // Service Registration
  // ========================================================================

  public async registerService(config: ServiceConfig): Promise<void> {
    this.validateServiceConfig(config);

    const instance: ServiceInstance = {
      config,
      health: {
        id: config.id,
        status: 'unknown',
        lastChecked: new Date(),
        responseTime: 0,
        uptime: 0,
        errors: []
      },
      registeredAt: new Date(),
      lastSeen: new Date()
    };

    this.services.set(config.id, instance);

    // Start health checking for this service
    await this.startHealthCheckForService(config.id);

    // Initialize load balancer for this service type
    this.initializeLoadBalancer(config.name);

    this.emit('service:registered', { serviceId: config.id, config });

    console.log(`✅ Service registered: ${config.name} (${config.id})`);
  }

  public async unregisterService(serviceId: string): Promise<void> {
    const instance = this.services.get(serviceId);
    if (!instance) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    // Stop health checking
    const healthCheck = this.healthChecks.get(serviceId);
    if (healthCheck) {
      clearInterval(healthCheck);
      this.healthChecks.delete(serviceId);
    }

    // Remove from registry
    this.services.delete(serviceId);

    this.emit('service:unregistered', { serviceId, config: instance.config });

    console.log(`❌ Service unregistered: ${instance.config.name} (${serviceId})`);
  }

  public async updateService(serviceId: string, updates: Partial<ServiceConfig>): Promise<void> {
    const instance = this.services.get(serviceId);
    if (!instance) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    // Update configuration
    instance.config = { ...instance.config, ...updates };
    instance.lastSeen = new Date();

    this.emit('service:updated', { serviceId, config: instance.config });

    console.log(`🔄 Service updated: ${instance.config.name} (${serviceId})`);
  }

  // ========================================================================
  // Service Discovery
  // ========================================================================

  public async discoverServices(query: DiscoveryQuery = {}): Promise<ServiceInstance[]> {
    const services = Array.from(this.services.values());

    return services.filter(instance => {
      if (query.name && instance.config.name !== query.name) return false;
      if (query.type && instance.config.type !== query.type) return false;
      if (query.environment && instance.config.environment !== query.environment) return false;
      if (query.region && instance.config.region !== query.region) return false;
      if (query.healthyOnly && instance.health.status !== 'healthy') return false;

      if (query.tags && query.tags.length > 0) {
        const serviceTags = instance.config.tags || [];
        if (!query.tags.every(tag => serviceTags.includes(tag))) return false;
      }

      return true;
    });
  }

  public async getService(serviceId: string): Promise<ServiceInstance | null> {
    return this.services.get(serviceId) || null;
  }

  public async getServiceByName(serviceName: string): Promise<ServiceInstance[]> {
    return this.discoverServices({ name: serviceName });
  }

  public async getHealthyService(serviceName: string): Promise<ServiceInstance | null> {
    const services = await this.discoverServices({
      name: serviceName,
      healthyOnly: true
    });

    if (services.length === 0) return null;

    // Use load balancer to select instance
    const loadBalancer = this.getLoadBalancer(serviceName);
    return loadBalancer.selectInstance(services);
  }

  // ========================================================================
  // Health Monitoring
  // ========================================================================

  private async startHealthCheckForService(serviceId: string): Promise<void> {
    const instance = this.services.get(serviceId);
    if (!instance) return;

    const healthCheck = setInterval(async () => {
      await this.checkServiceHealth(serviceId);
    }, this.healthCheckInterval);

    this.healthChecks.set(serviceId, healthCheck);

    // Initial health check
    await this.checkServiceHealth(serviceId);
  }

  private async checkServiceHealth(serviceId: string): Promise<void> {
    const instance = this.services.get(serviceId);
    if (!instance) return;

    const startTime = Date.now();

    try {
      const healthUrl = `${instance.config.url}/health`;
      const response = await this.httpClient.get(healthUrl);
      const responseTime = Date.now() - startTime;

      const isHealthy = response.status >= 200 && response.status < 400;

      instance.health = {
        ...instance.health,
        status: isHealthy ? 'healthy' : 'degraded',
        lastChecked: new Date(),
        responseTime,
        uptime: instance.health.uptime + (isHealthy ? this.healthCheckInterval : 0),
        errors: isHealthy ? [] : [`HTTP ${response.status}`]
      };

      instance.lastSeen = new Date();

      this.emit('service:health-updated', {
        serviceId,
        health: instance.health,
        wasHealthy: isHealthy
      });

    } catch (error) {
      instance.health = {
        ...instance.health,
        status: 'unhealthy',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };

      this.emit('service:health-updated', {
        serviceId,
        health: instance.health,
        wasHealthy: false
      });

      console.warn(`⚠️ Health check failed for ${instance.config.name}: ${error}`);
    }
  }

  public async getAllHealthStatuses(): Promise<Record<string, ServiceHealth>> {
    const statuses: Record<string, ServiceHealth> = {};

    for (const [serviceId, instance] of this.services) {
      statuses[serviceId] = instance.health;
    }

    return statuses;
  }

  // ========================================================================
  // Load Balancing
  // ========================================================================

  private initializeLoadBalancer(serviceName: string): void {
    if (!this.loadBalancers.has(serviceName)) {
      this.loadBalancers.set(serviceName, new LoadBalancer());
    }
  }

  private getLoadBalancer(serviceName: string): LoadBalancer {
    let loadBalancer = this.loadBalancers.get(serviceName);
    if (!loadBalancer) {
      loadBalancer = new LoadBalancer();
      this.loadBalancers.set(serviceName, loadBalancer);
    }
    return loadBalancer;
  }

  public async makeRequest(
    serviceName: string,
    path: string,
    options: LoadBalancingOptions = {}
  ): Promise<any> {
    const services = await this.discoverServices({
      name: serviceName,
      healthyOnly: options.healthCheck !== false
    });

    if (services.length === 0) {
      throw new Error(`No healthy instances found for service: ${serviceName}`);
    }

    const loadBalancer = this.getLoadBalancer(serviceName);
    const retries = options.retries || this.maxRetries;

    for (let attempt = 0; attempt < retries; attempt++) {
      const instance = loadBalancer.selectInstance(services, options.strategy);
      if (!instance) continue;

      try {
        const response = await this.httpClient.request({
          url: `${instance.config.url}${path}`,
          timeout: options.timeout || this.requestTimeout
        });

        // Update success metrics
        loadBalancer.recordSuccess(instance.config.id);

        return response.data;

      } catch (error) {
        // Record failure
        loadBalancer.recordFailure(instance.config.id);

        if (attempt === retries - 1) {
          throw error;
        }

        console.warn(`Request failed for ${serviceName}, retrying... (${attempt + 1}/${retries})`);
      }
    }

    throw new Error(`All requests failed for service: ${serviceName}`);
  }

  // ========================================================================
  // Cleanup and Maintenance
  // ========================================================================

  private startHealthChecking(): void {
    console.log('🔍 Starting health checking system');
  }

  private startCleanupProcess(): void {
    cron.schedule('*/5 * * * *', () => {
      this.cleanupStaleServices();
    });

    console.log('🧹 Cleanup process scheduled');
  }

  private cleanupStaleServices(): void {
    const now = new Date();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes

    for (const [serviceId, instance] of this.services) {
      const timeSinceLastSeen = now.getTime() - instance.lastSeen.getTime();

      if (timeSinceLastSeen > staleThreshold) {
        console.log(`🗑️ Removing stale service: ${instance.config.name} (${serviceId})`);
        this.unregisterService(serviceId);
      }
    }
  }

  // ========================================================================
  // Validation
  // ========================================================================

  private validateServiceConfig(config: ServiceConfig): void {
    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      version: Joi.string().required(),
      type: Joi.string().valid('web', 'api', 'worker', 'database', 'cache').required(),
      url: Joi.string().uri().required(),
      port: Joi.number().port().required(),
      endpoints: Joi.array().items(Joi.string()),
      dependencies: Joi.array().items(Joi.string()),
      metadata: Joi.object(),
      tags: Joi.array().items(Joi.string()),
      environment: Joi.string().valid('development', 'staging', 'production').required(),
      region: Joi.string()
    });

    const { error } = schema.validate(config);
    if (error) {
      throw new Error(`Invalid service configuration: ${error.message}`);
    }
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  public getRegistryStats(): any {
    const services = Array.from(this.services.values());
    const healthyCount = services.filter(s => s.health.status === 'healthy').length;
    const unhealthyCount = services.filter(s => s.health.status === 'unhealthy').length;

    return {
      totalServices: services.length,
      healthyServices: healthyCount,
      unhealthyServices: unhealthyCount,
      serviceTypes: [...new Set(services.map(s => s.config.type))],
      environments: [...new Set(services.map(s => s.config.environment))],
      averageResponseTime: services.reduce((acc, s) => acc + s.health.responseTime, 0) / services.length || 0
    };
  }

  public async shutdown(): Promise<void> {
    console.log('⏹️ Shutting down ServiceRegistry...');

    // Clear all health check intervals
    for (const healthCheck of this.healthChecks.values()) {
      clearInterval(healthCheck);
    }

    this.healthChecks.clear();
    this.services.clear();
    this.loadBalancers.clear();

    console.log('✅ ServiceRegistry shutdown complete');
  }
}

// ============================================================================
// Load Balancer Implementation
// ============================================================================

class LoadBalancer {
  private roundRobinIndex = 0;
  private connectionCounts = new Map<string, number>();
  private weights = new Map<string, number>();
  private successCounts = new Map<string, number>();
  private failureCounts = new Map<string, number>();

  public selectInstance(
    instances: ServiceInstance[],
    strategy: LoadBalancingOptions['strategy'] = 'round-robin'
  ): ServiceInstance | null {
    if (instances.length === 0) return null;
    if (instances.length === 1) return instances[0];

    switch (strategy) {
      case 'round-robin':
        return this.selectRoundRobin(instances);
      case 'least-connections':
        return this.selectLeastConnections(instances);
      case 'weighted':
        return this.selectWeighted(instances);
      case 'random':
        return this.selectRandom(instances);
      default:
        return this.selectRoundRobin(instances);
    }
  }

  private selectRoundRobin(instances: ServiceInstance[]): ServiceInstance {
    const instance = instances[this.roundRobinIndex % instances.length];
    this.roundRobinIndex++;
    return instance;
  }

  private selectLeastConnections(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((least, current) => {
      const leastConnections = this.connectionCounts.get(least.config.id) || 0;
      const currentConnections = this.connectionCounts.get(current.config.id) || 0;
      return currentConnections < leastConnections ? current : least;
    });
  }

  private selectWeighted(instances: ServiceInstance[]): ServiceInstance {
    const totalWeight = instances.reduce((sum, instance) => {
      return sum + (this.weights.get(instance.config.id) || 1);
    }, 0);

    let random = Math.random() * totalWeight;

    for (const instance of instances) {
      const weight = this.weights.get(instance.config.id) || 1;
      random -= weight;
      if (random <= 0) {
        return instance;
      }
    }

    return instances[0];
  }

  private selectRandom(instances: ServiceInstance[]): ServiceInstance {
    const randomIndex = Math.floor(Math.random() * instances.length);
    return instances[randomIndex];
  }

  public recordSuccess(serviceId: string): void {
    const current = this.successCounts.get(serviceId) || 0;
    this.successCounts.set(serviceId, current + 1);
  }

  public recordFailure(serviceId: string): void {
    const current = this.failureCounts.get(serviceId) || 0;
    this.failureCounts.set(serviceId, current + 1);
  }

  public setWeight(serviceId: string, weight: number): void {
    this.weights.set(serviceId, weight);
  }

  public incrementConnections(serviceId: string): void {
    const current = this.connectionCounts.get(serviceId) || 0;
    this.connectionCounts.set(serviceId, current + 1);
  }

  public decrementConnections(serviceId: string): void {
    const current = this.connectionCounts.get(serviceId) || 0;
    this.connectionCounts.set(serviceId, Math.max(0, current - 1));
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function createServiceConfig(
  name: string,
  url: string,
  port: number,
  type: ServiceConfig['type'] = 'api',
  environment: ServiceConfig['environment'] = 'development'
): ServiceConfig {
  return {
    id: uuidv4(),
    name,
    version: '1.0.0',
    type,
    url,
    port,
    environment,
    endpoints: ['/health', '/status'],
    dependencies: [],
    metadata: {},
    tags: []
  };
}

export function createServiceId(name: string, environment: string): string {
  return `${name}-${environment}-${Date.now()}`;
}

// ============================================================================
// Error Classes
// ============================================================================

export class ServiceRegistryError extends Error {
  constructor(
    public code: string,
    message: string,
    public serviceName?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ServiceRegistryError';
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default ServiceRegistry;
