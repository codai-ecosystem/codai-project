// Enterprise Service Discovery Manager
import { EventEmitter } from 'events';
import { ServiceDiscoveryConfig, CNDConfig } from '../types.js';

export interface ServiceInstance {
  id: string;
  name: string;
  version: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'tcp' | 'udp';
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastSeen: Date;
  tags: string[];
  metadata: Record<string, any>;
}

export class ServiceDiscoveryManager extends EventEmitter {
  private config: ServiceDiscoveryConfig;
  private services = new Map<string, ServiceInstance>();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private registrationInterval: NodeJS.Timeout | null = null;

  constructor(config: ServiceDiscoveryConfig) {
    super();
    this.config = config;
  }

  /**
   * Start service discovery
   */
  async start(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    console.log('Starting service discovery...');

    // Register this service
    await this.registerSelf();

    // Start health checks
    this.startHealthChecks();

    // Start service registration heartbeat
    this.startRegistrationHeartbeat();

    // Discover existing services
    await this.discoverServices();

    this.emit('started');
  }

  /**
   * Stop service discovery
   */
  async stop(): Promise<void> {
    console.log('Stopping service discovery...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.registrationInterval) {
      clearInterval(this.registrationInterval);
      this.registrationInterval = null;
    }

    // Deregister this service
    await this.deregisterSelf();

    this.emit('stopped');
  }

  /**
   * Register this service instance
   */
  async registerSelf(): Promise<void> {
    const instance: ServiceInstance = {
      id: this.config.serviceId,
      name: this.config.serviceName,
      version: this.config.version,
      host: process.env.HOST || 'localhost',
      port: parseInt(process.env.PORT || '3000'),
      protocol: 'http',
      status: 'healthy',
      lastSeen: new Date(),
      tags: this.config.tags,
      metadata: {
        ...this.config.metadata,
        startTime: new Date(),
        nodeVersion: process.version,
        platform: process.platform
      }
    };

    try {
      // In a real implementation, this would register with Consul, etcd, etc.
      await this.registerService(instance);
      this.services.set(instance.id, instance);

      console.log(`Registered service: ${instance.name}@${instance.version}`);
      this.emit('serviceRegistered', instance);
    } catch (error) {
      console.error('Failed to register service:', error);
      this.emit('registrationError', error);
    }
  }

  /**
   * Deregister this service instance
   */
  async deregisterSelf(): Promise<void> {
    try {
      await this.deregisterService(this.config.serviceId);
      this.services.delete(this.config.serviceId);

      console.log(`Deregistered service: ${this.config.serviceName}`);
      this.emit('serviceDeregistered', this.config.serviceId);
    } catch (error) {
      console.error('Failed to deregister service:', error);
    }
  }

  /**
   * Discover all available services
   */
  async discoverServices(): Promise<ServiceInstance[]> {
    try {
      // In a real implementation, this would query the service registry
      const services = await this.queryServiceRegistry();

      for (const service of services) {
        this.services.set(service.id, service);
      }

      this.emit('servicesDiscovered', services);
      return services;
    } catch (error) {
      console.error('Failed to discover services:', error);
      this.emit('discoveryError', error);
      return [];
    }
  }

  /**
   * Find services by name
   */
  findServices(name: string): ServiceInstance[] {
    return Array.from(this.services.values()).filter(service =>
      service.name === name && service.status === 'healthy'
    );
  }

  /**
   * Find services by tag
   */
  findServicesByTag(tag: string): ServiceInstance[] {
    return Array.from(this.services.values()).filter(service =>
      service.tags.includes(tag) && service.status === 'healthy'
    );
  }

  /**
   * Get service by ID
   */
  getService(id: string): ServiceInstance | undefined {
    return this.services.get(id);
  }

  /**
   * Get all healthy services
   */
  getHealthyServices(): ServiceInstance[] {
    return Array.from(this.services.values()).filter(service =>
      service.status === 'healthy'
    );
  }

  /**
   * Load balance - get next available instance
   */
  getNextInstance(serviceName: string): ServiceInstance | null {
    const instances = this.findServices(serviceName);
    if (instances.length === 0) {
      return null;
    }

    // Simple round-robin for now
    const index = Math.floor(Math.random() * instances.length);
    return instances[index];
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheck.interval);
  }

  private startRegistrationHeartbeat(): void {
    this.registrationInterval = setInterval(async () => {
      await this.registerSelf();
    }, 30000); // Heartbeat every 30 seconds
  }

  private async performHealthChecks(): Promise<void> {
    for (const [id, service] of this.services.entries()) {
      try {
        const isHealthy = await this.checkServiceHealth(service);
        if (isHealthy !== (service.status === 'healthy')) {
          service.status = isHealthy ? 'healthy' : 'unhealthy';
          service.lastSeen = new Date();
          this.emit('serviceStatusChanged', service);
        }
      } catch (error) {
        service.status = 'unhealthy';
        console.error(`Health check failed for ${service.name}:`, error);
      }
    }
  }

  private async checkServiceHealth(service: ServiceInstance): Promise<boolean> {
    // In a real implementation, this would make HTTP requests to health endpoints
    // For now, simulate health checks
    return Math.random() > 0.1; // 90% uptime simulation
  }

  private async registerService(instance: ServiceInstance): Promise<void> {
    // Mock registration - in real implementation, this would call service registry API
    console.log(`Registering service: ${instance.name} at ${instance.host}:${instance.port}`);
  }

  private async deregisterService(serviceId: string): Promise<void> {
    // Mock deregistration - in real implementation, this would call service registry API
    console.log(`Deregistering service: ${serviceId}`);
  }

  private async queryServiceRegistry(): Promise<ServiceInstance[]> {
    // Mock service discovery - in real implementation, this would query the registry
    return [
      {
        id: 'gateway-001',
        name: 'gateway',
        version: '1.0.0',
        host: 'localhost',
        port: 4000,
        protocol: 'http',
        status: 'healthy',
        lastSeen: new Date(),
        tags: ['api', 'gateway'],
        metadata: { role: 'api-gateway' }
      },
      {
        id: 'codai-001',
        name: 'codai',
        version: '1.0.0',
        host: 'localhost',
        port: 4001,
        protocol: 'http',
        status: 'healthy',
        lastSeen: new Date(),
        tags: ['ai', 'core'],
        metadata: { role: 'ai-service' }
      }
    ];
  }
}
