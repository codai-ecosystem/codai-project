import type Redis from 'redis';
import axios from 'axios';
import { EventEmitter } from 'events';
import type { LogAIClient } from '@codai/logai-sdk';
import type { HealthStatus } from './types.js';

export interface HealthCheckConfig {
  interval: number; // seconds
  timeout: number; // milliseconds
}

export interface HealthCheckOptions {
  endpoint: string;
  healthPath: string;
  timeout?: number;
}

/**
 * Health Monitor - Tracks service health status
 */
export class HealthMonitor extends EventEmitter {
  private healthStatuses: Map<string, HealthStatus> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private redis: Redis.RedisClientType,
    private logger: LogAIClient,
    private config: HealthCheckConfig
  ) {
    super();
  }

  async initialize(): Promise<void> {
    this.logger.info('Health Monitor initialized');
  }

  async scheduleHealthCheck(serviceName: string, options: HealthCheckOptions): Promise<void> {
    // Clear existing interval if any
    const existingInterval = this.healthCheckIntervals.get(serviceName);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Schedule new health check
    const interval = setInterval(async () => {
      await this.performHealthCheck(serviceName, options);
    }, this.config.interval * 1000);

    this.healthCheckIntervals.set(serviceName, interval);

    // Perform initial health check
    await this.performHealthCheck(serviceName, options);
  }

  async performHealthCheck(serviceName: string, options: HealthCheckOptions): Promise<void> {
    const startTime = Date.now();

    try {
      const healthUrl = `${options.endpoint}${options.healthPath}`;
      const response = await axios.get(healthUrl, {
        timeout: options.timeout || this.config.timeout,
        validateStatus: (status) => status < 500,
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.status >= 200 && response.status < 400;

      const healthStatus: HealthStatus = {
        serviceName,
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date(),
        responseTime,
        details: response.data || {},
        version: response.data?.version || 'unknown',
        uptime: response.data?.uptime,
      };

      // Store health status
      this.healthStatuses.set(serviceName, healthStatus);
      await this.redis.hSet(`health:${serviceName}`, {
        status: healthStatus.status,
        timestamp: healthStatus.timestamp.toISOString(),
        responseTime: responseTime.toString(),
        details: JSON.stringify(healthStatus.details),
      });

      // Emit health change event if status changed
      const previousStatus = this.healthStatuses.get(serviceName);
      if (!previousStatus || previousStatus.status !== healthStatus.status) {
        this.emit('health-changed', serviceName, healthStatus);
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const healthStatus: HealthStatus = {
        serviceName,
        status: 'unhealthy',
        timestamp: new Date(),
        responseTime,
        details: {},
        error: error instanceof Error ? error.message : 'Unknown error',
        version: 'unknown',
      };

      this.healthStatuses.set(serviceName, healthStatus);
      await this.redis.hSet(`health:${serviceName}`, {
        status: 'unhealthy',
        timestamp: healthStatus.timestamp.toISOString(),
        responseTime: responseTime.toString(),
        error: healthStatus.error || '',
      });

      this.emit('health-changed', serviceName, healthStatus);
      this.logger.error('Health check failed', { serviceName, error });
    }
  }

  async performHealthChecks(): Promise<void> {
    const serviceKeys = await this.redis.keys('services:*');

    for (const key of serviceKeys) {
      const serviceName = key.replace('services:', '');
      const serviceData = await this.redis.hGetAll(key);

      if (serviceData.endpoint && serviceData.healthPath) {
        await this.performHealthCheck(serviceName, {
          endpoint: serviceData.endpoint,
          healthPath: serviceData.healthPath,
        });
      }
    }
  }

  async getHealthStatus(serviceName: string): Promise<HealthStatus | null> {
    return this.healthStatuses.get(serviceName) || null;
  }

  async getAllHealthStatuses(): Promise<HealthStatus[]> {
    return Array.from(this.healthStatuses.values());
  }

  async removeHealthCheck(serviceName: string): Promise<void> {
    const interval = this.healthCheckIntervals.get(serviceName);
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(serviceName);
    }

    this.healthStatuses.delete(serviceName);
    await this.redis.del(`health:${serviceName}`);
  }

  async shutdown(): Promise<void> {
    // Clear all intervals
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();
    this.healthStatuses.clear();

    this.logger.info('Health Monitor shutdown completed');
  }
}
