import { z } from 'zod';
import { EventBus } from '../event-bus';

export const MonitoringServiceSchema = z.object({
  enabled: z.boolean().default(true),
  config: z.object({
    metricsInterval: z.number().default(60000), // 1 minute
    healthCheckInterval: z.number().default(30000), // 30 seconds
    alertThresholds: z.object({
      cpu: z.number().default(80), // 80%
      memory: z.number().default(85), // 85%
      errorRate: z.number().default(5), // 5%
      responseTime: z.number().default(2000), // 2 seconds
    }),
    retentionDays: z.number().default(7),
  }),
});

export type MonitoringServiceConfig = z.infer<typeof MonitoringServiceSchema>;

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // percentage
    cores: number;
  };
  memory: {
    used: number; // bytes
    total: number; // bytes
    usage: number; // percentage
  };
  disk: {
    used: number; // bytes
    total: number; // bytes
    usage: number; // percentage
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
}

export interface ApplicationMetrics {
  timestamp: Date;
  requests: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
  };
  errors: {
    count: number;
    rate: number; // percentage
    types: Record<string, number>;
  };
  users: {
    active: number;
    concurrent: number;
  };
  services: {
    [serviceName: string]: {
      status: 'healthy' | 'degraded' | 'down';
      responseTime: number;
      errorCount: number;
    };
  };
}

export interface Alert {
  id: string;
  type: 'system' | 'application' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: Date;
  error?: string;
  details: Record<string, any>;
}

export class MonitoringService {
  private eventBus: EventBus;
  private config: MonitoringServiceConfig;
  private initialized = false;
  private metricsInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;
  private systemMetricsHistory: SystemMetrics[] = [];
  private applicationMetricsHistory: ApplicationMetrics[] = [];
  private activeAlerts = new Map<string, Alert>();
  private healthChecks = new Map<string, HealthCheck>();

  constructor(config: MonitoringServiceConfig, eventBus: EventBus) {
    this.config = MonitoringServiceSchema.parse(config);
    this.eventBus = eventBus;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('📊 Initializing Monitoring Service...');

    // Start metrics collection
    this.startMetricsCollection();

    // Start health checks
    this.startHealthChecks();

    // Setup data cleanup
    this.setupDataCleanup();

    this.initialized = true;
    console.log('✅ Monitoring Service initialized');

    await this.eventBus.emit({
      eventType: 'performance',
      timestamp: new Date(),
      data: { action: 'monitoring_service_initialized' },
    });
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(async () => {
      try {
        await this.collectSystemMetrics();
        await this.collectApplicationMetrics();
        await this.analyzeMetrics();
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, this.config.config.metricsInterval);
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        console.error('Error performing health checks:', error);
      }
    }, this.config.config.healthCheckInterval);
  }

  private setupDataCleanup(): void {
    // Clean up old metrics every hour
    setInterval(() => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - this.config.config.retentionDays);

      this.systemMetricsHistory = this.systemMetricsHistory
        .filter(metric => metric.timestamp > cutoff);

      this.applicationMetricsHistory = this.applicationMetricsHistory
        .filter(metric => metric.timestamp > cutoff);

      console.log(`Cleaned up metrics older than ${this.config.config.retentionDays} days`);
    }, 60 * 60 * 1000); // Every hour
  }

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    // Mock system metrics collection
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
      },
      memory: {
        used: Math.random() * 16 * 1024 * 1024 * 1024, // Random up to 16GB
        total: 16 * 1024 * 1024 * 1024, // 16GB
        usage: Math.random() * 100,
      },
      disk: {
        used: Math.random() * 500 * 1024 * 1024 * 1024, // Random up to 500GB
        total: 1024 * 1024 * 1024 * 1024, // 1TB
        usage: Math.random() * 100,
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
      },
    };

    this.systemMetricsHistory.push(metrics);
    return metrics;
  }

  private async collectApplicationMetrics(): Promise<ApplicationMetrics> {
    // Mock application metrics collection
    const metrics: ApplicationMetrics = {
      timestamp: new Date(),
      requests: {
        total: Math.floor(Math.random() * 1000),
        successful: Math.floor(Math.random() * 950),
        failed: Math.floor(Math.random() * 50),
        avgResponseTime: Math.random() * 1000,
      },
      errors: {
        count: Math.floor(Math.random() * 10),
        rate: Math.random() * 5,
        types: {
          'ValidationError': Math.floor(Math.random() * 3),
          'NetworkError': Math.floor(Math.random() * 2),
          'DatabaseError': Math.floor(Math.random() * 1),
        },
      },
      users: {
        active: Math.floor(Math.random() * 100),
        concurrent: Math.floor(Math.random() * 50),
      },
      services: {
        'analytics-service': {
          status: 'healthy',
          responseTime: Math.random() * 500,
          errorCount: 0,
        },
        'project-service': {
          status: 'healthy',
          responseTime: Math.random() * 300,
          errorCount: Math.floor(Math.random() * 2),
        },
      },
    };

    this.applicationMetricsHistory.push(metrics);
    return metrics;
  }

  private async analyzeMetrics(): Promise<void> {
    const latest = this.systemMetricsHistory[this.systemMetricsHistory.length - 1];
    if (!latest) return;

    const thresholds = this.config.config.alertThresholds;

    // Check CPU usage
    if (latest.cpu.usage > thresholds.cpu) {
      await this.triggerAlert({
        type: 'system',
        severity: 'high',
        title: 'High CPU Usage',
        description: `CPU usage is ${latest.cpu.usage.toFixed(1)}%, exceeding threshold of ${thresholds.cpu}%`,
        metadata: { cpuUsage: latest.cpu.usage, threshold: thresholds.cpu },
      });
    }

    // Check memory usage
    if (latest.memory.usage > thresholds.memory) {
      await this.triggerAlert({
        type: 'system',
        severity: 'high',
        title: 'High Memory Usage',
        description: `Memory usage is ${latest.memory.usage.toFixed(1)}%, exceeding threshold of ${thresholds.memory}%`,
        metadata: { memoryUsage: latest.memory.usage, threshold: thresholds.memory },
      });
    }

    // Check application metrics
    const latestApp = this.applicationMetricsHistory[this.applicationMetricsHistory.length - 1];
    if (latestApp && latestApp.errors.rate > thresholds.errorRate) {
      await this.triggerAlert({
        type: 'application',
        severity: 'medium',
        title: 'High Error Rate',
        description: `Error rate is ${latestApp.errors.rate.toFixed(1)}%, exceeding threshold of ${thresholds.errorRate}%`,
        metadata: { errorRate: latestApp.errors.rate, threshold: thresholds.errorRate },
      });
    }
  }

  private async performHealthChecks(): Promise<void> {
    const services = ['analytics-service', 'project-service', 'auth-service', 'deployment-service'];

    for (const service of services) {
      try {
        const startTime = Date.now();

        // Mock health check
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

        const responseTime = Date.now() - startTime;
        const isHealthy = Math.random() > 0.05; // 95% uptime simulation

        const healthCheck: HealthCheck = {
          service,
          status: isHealthy ? 'healthy' : 'degraded',
          responseTime,
          lastCheck: new Date(),
          details: {
            version: '1.0.0',
            uptime: Math.random() * 86400, // Random uptime in seconds
          },
        };

        if (!isHealthy) {
          healthCheck.error = 'Service timeout or error response';
          healthCheck.status = 'down';

          await this.triggerAlert({
            type: 'system',
            severity: 'critical',
            title: `${service} Health Check Failed`,
            description: `Service ${service} is not responding or returning errors`,
            metadata: { service, responseTime, error: healthCheck.error },
          });
        }

        this.healthChecks.set(service, healthCheck);

      } catch (error) {
        const healthCheck: HealthCheck = {
          service,
          status: 'down',
          responseTime: 0,
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
          details: {},
        };

        this.healthChecks.set(service, healthCheck);

        await this.triggerAlert({
          type: 'system',
          severity: 'critical',
          title: `${service} Health Check Error`,
          description: `Failed to perform health check for ${service}: ${healthCheck.error}`,
          metadata: { service, error: healthCheck.error },
        });
      }
    }
  }

  private async triggerAlert(alertData: Omit<Alert, 'id' | 'triggeredAt'>): Promise<Alert> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      triggeredAt: new Date(),
      ...alertData,
    };

    this.activeAlerts.set(alert.id, alert);

    console.log(`🚨 Alert triggered: ${alert.title} (${alert.severity})`);

    await this.eventBus.emit({
      eventType: 'error',
      timestamp: new Date(),
      data: {
        type: 'alert_triggered',
        alert: {
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
        },
      },
    });

    return alert;
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.resolvedAt = new Date();
    console.log(`✅ Alert resolved: ${alert.title}`);

    await this.eventBus.emit({
      eventType: 'performance',
      timestamp: new Date(),
      data: {
        type: 'alert_resolved',
        alertId,
        duration: alert.resolvedAt.getTime() - alert.triggeredAt.getTime(),
      },
    });

    return true;
  }

  getSystemMetrics(limit?: number): SystemMetrics[] {
    const metrics = [...this.systemMetricsHistory].reverse();
    return limit ? metrics.slice(0, limit) : metrics;
  }

  getApplicationMetrics(limit?: number): ApplicationMetrics[] {
    const metrics = [...this.applicationMetricsHistory].reverse();
    return limit ? metrics.slice(0, limit) : metrics;
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => !alert.resolvedAt)
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    services: HealthCheck[];
    alerts: number;
    uptime: number;
  }> {
    const healthChecks = this.getHealthChecks();
    const activeAlerts = this.getActiveAlerts();

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    const criticalServices = healthChecks.filter(hc => hc.status === 'down').length;
    const degradedServices = healthChecks.filter(hc => hc.status === 'degraded').length;
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical').length;

    if (criticalServices > 0 || criticalAlerts > 0) {
      status = 'critical';
    } else if (degradedServices > 0 || activeAlerts.length > 3) {
      status = 'degraded';
    }

    return {
      status,
      services: healthChecks,
      alerts: activeAlerts.length,
      uptime: process.uptime(), // Process uptime in seconds
    };
  }

  async cleanup(): Promise<void> {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.systemMetricsHistory = [];
    this.applicationMetricsHistory = [];
    this.activeAlerts.clear();
    this.healthChecks.clear();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getConfig(): MonitoringServiceConfig {
    return this.config;
  }
}

export default MonitoringService;
