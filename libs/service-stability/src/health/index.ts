/**
 * Service Health Manager
 * 
 * Comprehensive health monitoring and alerting system
 * Provides real-time health checks, threshold monitoring, and alert management
 */

import { EventEmitter } from 'events';
import axios from 'axios';
import * as os from 'os';
import * as process from 'process';

export interface HealthCheck {
  id: string;
  name: string;
  type: 'http' | 'tcp' | 'command' | 'custom';
  config: any;
  interval: number;
  timeout: number;
  retries: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  timestamp: string;
  responseTime?: number;
  details?: Record<string, any>;
}

export interface ServiceHealth {
  service: string;
  status: HealthStatus;
  checks: Record<string, HealthStatus>;
  metadata: Record<string, any>;
}

export interface HealthMetrics {
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  unhealthyServices: number;
  averageResponseTime: number;
  checksPerformed: number;
  alertsTriggered: number;
}

export interface HealthThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  actions: string[];
}

export interface MonitoringConfig {
  checkInterval: number;
  thresholds: Record<string, HealthThreshold>;
  alerting: {
    enabled: boolean;
    channels: string[];
    webhooks?: string[];
  };
}

export class ServiceHealthManager extends EventEmitter {
  private services: Map<string, ServiceHealth> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private activeAlerts: Map<string, any> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private config: MonitoringConfig;
  private metrics: HealthMetrics;
  private running: boolean = false;

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;
    this.metrics = this.initializeMetrics();
    this.setupSystemHealthChecks();
  }

  private initializeMetrics(): HealthMetrics {
    return {
      totalServices: 0,
      healthyServices: 0,
      degradedServices: 0,
      unhealthyServices: 0,
      averageResponseTime: 0,
      checksPerformed: 0,
      alertsTriggered: 0
    };
  }

  private setupSystemHealthChecks(): void {
    // CPU usage check
    this.addHealthCheck({
      id: 'system-cpu',
      name: 'System CPU Usage',
      type: 'custom',
      config: {
        check: () => this.checkCpuUsage()
      },
      interval: 30000,
      timeout: 5000,
      retries: 1
    });

    // Memory usage check
    this.addHealthCheck({
      id: 'system-memory',
      name: 'System Memory Usage',
      type: 'custom',
      config: {
        check: () => this.checkMemoryUsage()
      },
      interval: 30000,
      timeout: 5000,
      retries: 1
    });

    // Disk usage check
    this.addHealthCheck({
      id: 'system-disk',
      name: 'System Disk Usage',
      type: 'custom',
      config: {
        check: () => this.checkDiskUsage()
      },
      interval: 60000,
      timeout: 10000,
      retries: 1
    });
  }

  /**
   * Start the health monitoring system
   */
  async start(): Promise<void> {
    if (this.running) {
      console.warn('Health manager is already running');
      return;
    }

    this.running = true;

    // Start all health checks
    for (const [id, check] of this.healthChecks) {
      this.startHealthCheck(id, check);
    }

    // Start metrics collection
    this.startMetricsCollection();

    console.log('✅ Service Health Manager started successfully');
    this.emit('started');
  }

  /**
   * Stop the health monitoring system
   */
  async stop(): Promise<void> {
    if (!this.running) {
      console.warn('Health manager is not running');
      return;
    }

    this.running = false;

    // Clear all intervals
    for (const [id, interval] of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.clear();

    console.log('✅ Service Health Manager stopped successfully');
    this.emit('stopped');
  }

  /**
   * Register a new service for monitoring
   */
  async registerService(service: any): Promise<void> {
    const serviceHealth: ServiceHealth = {
      service: service.name,
      status: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      },
      checks: {},
      metadata: service.metadata || {}
    };

    this.services.set(service.name, serviceHealth);

    // Add HTTP health check for the service
    if (service.healthCheckPath) {
      await this.addServiceHealthCheck(service);
    }

    this.updateMetrics();
    console.log(`✅ Service ${service.name} registered for health monitoring`);
  }

  /**
   * Unregister a service
   */
  async unregisterService(serviceName: string): Promise<void> {
    this.services.delete(serviceName);

    // Remove associated health checks
    const checksToRemove = Array.from(this.healthChecks.keys())
      .filter(id => id.startsWith(`${serviceName}-`));

    for (const checkId of checksToRemove) {
      this.removeHealthCheck(checkId);
    }

    this.updateMetrics();
    console.log(`✅ Service ${serviceName} unregistered from health monitoring`);
  }

  /**
   * Add a custom health check
   */
  addHealthCheck(check: HealthCheck): void {
    this.healthChecks.set(check.id, check);

    if (this.running) {
      this.startHealthCheck(check.id, check);
    }
  }

  /**
   * Remove a health check
   */
  removeHealthCheck(checkId: string): void {
    const interval = this.intervals.get(checkId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(checkId);
    }

    this.healthChecks.delete(checkId);
  }

  /**
   * Get overall system health
   */
  async getOverallHealth(): Promise<HealthStatus> {
    const services = Array.from(this.services.values());
    const systemChecks = Array.from(this.healthChecks.values())
      .filter(check => check.id.startsWith('system-'));

    let healthyCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;

    // Check service health
    for (const service of services) {
      switch (service.status.status) {
        case 'healthy':
          healthyCount++;
          break;
        case 'degraded':
          degradedCount++;
          break;
        case 'unhealthy':
          unhealthyCount++;
          break;
      }
    }

    // Check system health
    for (const check of systemChecks) {
      const result = await this.performHealthCheck(check);
      switch (result.status) {
        case 'healthy':
          healthyCount++;
          break;
        case 'degraded':
          degradedCount++;
          break;
        case 'unhealthy':
          unhealthyCount++;
          break;
      }
    }

    const totalChecks = services.length + systemChecks.length;
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (unhealthyCount > 0 || unhealthyCount / totalChecks > 0.2) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0 || degradedCount / totalChecks > 0.1) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      message: `${healthyCount}/${totalChecks} components healthy`,
      timestamp: new Date().toISOString(),
      details: {
        total: totalChecks,
        healthy: healthyCount,
        degraded: degradedCount,
        unhealthy: unhealthyCount
      }
    };
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<any[]> {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Mark a service as unhealthy
   */
  async markServiceUnhealthy(serviceName: string, reason: string): Promise<void> {
    const service = this.services.get(serviceName);
    if (service) {
      service.status = {
        status: 'unhealthy',
        message: reason,
        timestamp: new Date().toISOString()
      };

      await this.triggerAlert({
        id: `service-${serviceName}-unhealthy`,
        service: serviceName,
        severity: 'critical',
        message: `Service ${serviceName} marked as unhealthy: ${reason}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get health metrics
   */
  async getMetrics(): Promise<HealthMetrics> {
    this.updateMetrics();
    return { ...this.metrics };
  }

  private async addServiceHealthCheck(service: any): Promise<void> {
    const checkId = `${service.name}-health`;
    const healthCheck: HealthCheck = {
      id: checkId,
      name: `${service.name} Health Check`,
      type: 'http',
      config: {
        url: `${service.url}${service.healthCheckPath}`,
        method: 'GET',
        expectedStatus: 200,
        timeout: 5000
      },
      interval: this.config.checkInterval,
      timeout: 5000,
      retries: 3
    };

    this.addHealthCheck(healthCheck);
  }

  private startHealthCheck(checkId: string, check: HealthCheck): void {
    const interval = setInterval(async () => {
      try {
        const result = await this.performHealthCheck(check);
        await this.processHealthCheckResult(checkId, result);
      } catch (error) {
        console.error(`Health check ${checkId} failed:`, error);
      }
    }, check.interval);

    this.intervals.set(checkId, interval);
  }

  private async performHealthCheck(check: HealthCheck): Promise<HealthStatus> {
    const startTime = Date.now();
    let result: HealthStatus;

    try {
      switch (check.type) {
        case 'http':
          result = await this.performHttpCheck(check);
          break;
        case 'custom':
          result = await check.config.check();
          break;
        default:
          throw new Error(`Unsupported health check type: ${check.type}`);
      }

      result.responseTime = Date.now() - startTime;
      this.metrics.checksPerformed++;

    } catch (error) {
      result = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      };
    }

    return result;
  }

  private async performHttpCheck(check: HealthCheck): Promise<HealthStatus> {
    try {
      const response = await axios({
        method: check.config.method || 'GET',
        url: check.config.url,
        timeout: check.config.timeout || 5000,
        validateStatus: (status) => status === (check.config.expectedStatus || 200)
      });

      return {
        status: 'healthy',
        message: `HTTP ${response.status}`,
        timestamp: new Date().toISOString(),
        details: {
          status: response.status,
          headers: response.headers
        }
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        return {
          status: status && status < 500 ? 'degraded' : 'unhealthy',
          message: `HTTP ${status || 'timeout'}: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  private async checkCpuUsage(): Promise<HealthStatus> {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);

    const threshold = this.config.thresholds?.cpu;
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (threshold) {
      if (usage >= threshold.critical) {
        status = 'unhealthy';
      } else if (usage >= threshold.warning) {
        status = 'degraded';
      }
    }

    return {
      status,
      message: `CPU usage: ${usage}%`,
      timestamp: new Date().toISOString(),
      details: { usage, threshold: threshold?.warning }
    };
  }

  private async checkMemoryUsage(): Promise<HealthStatus> {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usage = (usedMem / totalMem) * 100;

    const threshold = this.config.thresholds?.memory;
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (threshold) {
      if (usage >= threshold.critical) {
        status = 'unhealthy';
      } else if (usage >= threshold.warning) {
        status = 'degraded';
      }
    }

    return {
      status,
      message: `Memory usage: ${usage.toFixed(1)}%`,
      timestamp: new Date().toISOString(),
      details: {
        usage: usage.toFixed(1),
        total: Math.round(totalMem / 1024 / 1024 / 1024),
        used: Math.round(usedMem / 1024 / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024 / 1024)
      }
    };
  }

  private async checkDiskUsage(): Promise<HealthStatus> {
    // Simplified disk usage check - in production, use a proper disk usage library
    const usage = 45; // Placeholder value

    const threshold = this.config.thresholds?.disk;
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (threshold) {
      if (usage >= threshold.critical) {
        status = 'unhealthy';
      } else if (usage >= threshold.warning) {
        status = 'degraded';
      }
    }

    return {
      status,
      message: `Disk usage: ${usage}%`,
      timestamp: new Date().toISOString(),
      details: { usage, threshold: threshold?.warning }
    };
  }

  private async processHealthCheckResult(checkId: string, result: HealthStatus): Promise<void> {
    // Update service status if this is a service check
    const serviceName = checkId.replace('-health', '');
    const service = this.services.get(serviceName);

    if (service) {
      service.status = result;
      service.checks[checkId] = result;

      // Trigger alerts for status changes
      if (result.status !== 'healthy') {
        await this.triggerAlert({
          id: `${checkId}-${result.status}`,
          service: serviceName,
          severity: result.status === 'unhealthy' ? 'critical' : 'warning',
          message: `${service.service}: ${result.message}`,
          timestamp: result.timestamp
        });
      }
    }

    this.emit('healthCheckResult', { checkId, result });
  }

  private async triggerAlert(alert: any): Promise<void> {
    if (!this.config.alerting.enabled) {
      return;
    }

    this.activeAlerts.set(alert.id, alert);
    this.metrics.alertsTriggered++;

    // Send alert through configured channels
    for (const channel of this.config.alerting.channels) {
      await this.sendAlert(channel, alert);
    }

    this.emit('alert', alert);
  }

  private async sendAlert(channel: string, alert: any): Promise<void> {
    switch (channel) {
      case 'console':
        console.warn(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
        break;
      case 'webhook':
        // Implementation for webhook alerts
        break;
      default:
        console.warn(`Unknown alert channel: ${channel}`);
    }
  }

  private updateMetrics(): void {
    const services = Array.from(this.services.values());
    this.metrics.totalServices = services.length;
    this.metrics.healthyServices = services.filter(s => s.status.status === 'healthy').length;
    this.metrics.degradedServices = services.filter(s => s.status.status === 'degraded').length;
    this.metrics.unhealthyServices = services.filter(s => s.status.status === 'unhealthy').length;

    const responseTimes = services
      .map(s => s.status.responseTime)
      .filter(rt => rt !== undefined) as number[];

    this.metrics.averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length
      : 0;
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.updateMetrics();
      this.emit('metricsUpdated', this.metrics);
    }, 30000); // Update metrics every 30 seconds
  }
}
