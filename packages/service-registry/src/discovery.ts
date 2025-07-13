import type Redis from 'redis';
import type { LogAIClient } from '@codai/logai-sdk';
import type { ServiceEndpoint, ServiceDiscoveryOptions } from './types.js';

/**
 * Service Discovery - Find and filter services based on criteria
 */
export class ServiceDiscovery {
  constructor(
    private redis: Redis.RedisClientType,
    private logger: LogAIClient
  ) { }

  async initialize(): Promise<void> {
    this.logger.info('Service Discovery initialized');
  }

  async findServices(options: ServiceDiscoveryOptions = {}): Promise<ServiceEndpoint[]> {
    const serviceKeys = await this.redis.keys('services:*');
    const endpoints: ServiceEndpoint[] = [];

    for (const key of serviceKeys) {
      const serviceName = key.replace('services:', '');
      const serviceData = await this.redis.hGetAll(key);

      // Apply filters
      if (!this.matchesFilters(serviceData, options)) {
        continue;
      }

      // Check if service is healthy (if requested)
      if (options.healthyOnly) {
        const healthData = await this.redis.hGetAll(`health:${serviceName}`);
        if (healthData.status !== 'healthy') {
          continue;
        }
      }

      // Get endpoints for this service
      const endpointsKey = `endpoints:${serviceName}`;
      const endpointData = await this.redis.hGetAll(endpointsKey);

      for (const [url, data] of Object.entries(endpointData)) {
        try {
          const endpoint = JSON.parse(data as string) as ServiceEndpoint;

          if (options.includeMetadata) {
            endpoint.metadata = {
              ...endpoint.metadata,
              serviceData: JSON.parse(serviceData.metadata || '{}'),
              capabilities: JSON.parse(serviceData.capabilities || '[]'),
              tags: JSON.parse(serviceData.tags || '[]'),
            };
          }

          endpoints.push(endpoint);
        } catch (error) {
          this.logger.error('Failed to parse endpoint data', {
            serviceName,
            url,
            error
          });
        }
      }
    }

    return endpoints;
  }

  async findServicesByTag(tags: string[]): Promise<ServiceEndpoint[]> {
    return this.findServices({ tags, includeMetadata: true });
  }

  async findServicesByCapability(capabilities: string[]): Promise<ServiceEndpoint[]> {
    return this.findServices({ capabilities, includeMetadata: true });
  }

  private matchesFilters(serviceData: Record<string, string>, options: ServiceDiscoveryOptions): boolean {
    // Check tags filter
    if (options.tags && options.tags.length > 0) {
      const serviceTags = JSON.parse(serviceData.tags || '[]') as string[];
      const hasMatchingTag = options.tags.some(tag => serviceTags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // Check capabilities filter
    if (options.capabilities && options.capabilities.length > 0) {
      const serviceCapabilities = JSON.parse(serviceData.capabilities || '[]') as string[];
      const hasMatchingCapability = options.capabilities.some(cap =>
        serviceCapabilities.includes(cap)
      );
      if (!hasMatchingCapability) return false;
    }

    return true;
  }

  async shutdown(): Promise<void> {
    this.logger.info('Service Discovery shutdown completed');
  }
}
