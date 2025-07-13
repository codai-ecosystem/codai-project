import type Redis from 'redis';
import type { LogAIClient } from '@codai/logai-sdk';
import type { ServiceEndpoint, LoadBalancingStrategy } from './types.js';

export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'weighted' | 'least-connections' | 'random';
}

/**
 * Load Balancer - Manages endpoint selection and routing
 */
export class LoadBalancer {
  private strategies: Map<string, LoadBalancingStrategy> = new Map();
  private endpointCounters: Map<string, number> = new Map();
  private connectionCounts: Map<string, number> = new Map();

  constructor(
    private redis: Redis.RedisClientType,
    private logger: LogAIClient,
    private config: LoadBalancerConfig
  ) {
    this.initializeStrategies();
  }

  async initialize(): Promise<void> {
    this.logger.info('Load Balancer initialized');
  }

  async addEndpoint(serviceName: string, endpoint: ServiceEndpoint): Promise<void> {
    const endpointsKey = `endpoints:${serviceName}`;
    await this.redis.hSet(endpointsKey, endpoint.url, JSON.stringify(endpoint));

    this.logger.info('Endpoint added', { serviceName, endpoint: endpoint.url });
  }

  async removeEndpoint(serviceName: string, endpointUrl?: string): Promise<void> {
    const endpointsKey = `endpoints:${serviceName}`;

    if (endpointUrl) {
      await this.redis.hDel(endpointsKey, endpointUrl);
    } else {
      await this.redis.del(endpointsKey);
    }

    this.logger.info('Endpoint removed', { serviceName, endpointUrl });
  }

  async updateEndpoint(serviceName: string, endpointUrl: string): Promise<void> {
    const endpointsKey = `endpoints:${serviceName}`;
    const endpointData = await this.redis.hGet(endpointsKey, endpointUrl);

    if (endpointData) {
      const endpoint = JSON.parse(endpointData) as ServiceEndpoint;
      endpoint.url = endpointUrl;
      await this.redis.hSet(endpointsKey, endpointUrl, JSON.stringify(endpoint));
    }
  }

  async getEndpoint(serviceName: string): Promise<ServiceEndpoint | null> {
    const endpoints = await this.getEndpoints(serviceName);
    if (endpoints.length === 0) return null;

    const strategy = this.strategies.get(this.config.strategy);
    return strategy?.select(endpoints) || endpoints[0];
  }

  async getEndpoints(serviceName: string): Promise<ServiceEndpoint[]> {
    const endpointsKey = `endpoints:${serviceName}`;
    const endpointData = await this.redis.hGetAll(endpointsKey);

    return Object.values(endpointData).map(data => JSON.parse(data) as ServiceEndpoint);
  }

  private initializeStrategies(): void {
    // Round Robin Strategy
    this.strategies.set('round-robin', {
      select: (endpoints: ServiceEndpoint[]) => {
        const serviceName = endpoints[0]?.serviceName;
        if (!serviceName) return null;

        const currentIndex = this.endpointCounters.get(serviceName) || 0;
        const nextIndex = (currentIndex + 1) % endpoints.length;
        this.endpointCounters.set(serviceName, nextIndex);

        return endpoints[currentIndex];
      },
      updateMetrics: () => { }, // No additional metrics needed
    });

    // Weighted Strategy
    this.strategies.set('weighted', {
      select: (endpoints: ServiceEndpoint[]) => {
        const totalWeight = endpoints.reduce((sum, ep) => sum + ep.weight, 0);
        const random = Math.random() * totalWeight;

        let currentWeight = 0;
        for (const endpoint of endpoints) {
          currentWeight += endpoint.weight;
          if (random <= currentWeight) {
            return endpoint;
          }
        }

        return endpoints[0];
      },
      updateMetrics: () => { }, // No additional metrics needed
    });

    // Least Connections Strategy
    this.strategies.set('least-connections', {
      select: (endpoints: ServiceEndpoint[]) => {
        return endpoints.reduce((least, current) => {
          const leastConnections = this.connectionCounts.get(least.url) || 0;
          const currentConnections = this.connectionCounts.get(current.url) || 0;
          return currentConnections < leastConnections ? current : least;
        });
      },
      updateMetrics: (serviceName: string, endpoint: string, responseTime: number) => {
        // Update connection count (simplified)
        const currentCount = this.connectionCounts.get(endpoint) || 0;
        this.connectionCounts.set(endpoint, Math.max(0, currentCount - 1));
      },
    });

    // Random Strategy
    this.strategies.set('random', {
      select: (endpoints: ServiceEndpoint[]) => {
        const randomIndex = Math.floor(Math.random() * endpoints.length);
        return endpoints[randomIndex];
      },
      updateMetrics: () => { }, // No additional metrics needed
    });
  }

  async shutdown(): Promise<void> {
    this.strategies.clear();
    this.endpointCounters.clear();
    this.connectionCounts.clear();

    this.logger.info('Load Balancer shutdown completed');
  }
}
