/**
 * System Monitor
 * 
 * Comprehensive system monitoring with real-time metrics, alerts, and dashboards
 * Provides performance tracking, resource monitoring, and predictive analytics
 */

import { EventEmitter } from 'events';
import * as os from 'os';
import * as process from 'process';
import { performance } from 'perf_hooks';

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    usage: number;
    total: number;
    free: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
  };
  process: {
    pid: number;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}

export interface PerformanceMetrics {
  responseTime: {
    average: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    totalRequests: number;
    successRate: number;
  };
  errors: {
    total: number;
    rate: number;
    byType: Record<string, number>;
  };
  custom: Record<string, number>;
}

export interface ResourceUsage {
  service: string;
  cpu: number;
  memory: number;
  disk: number;
  network: {
    inbound: number;
    outbound: number;
  };
  connections: number;
  threads: number;
}

export interface AlertConfig {
  id: string;
  name: string;
  metric: string;
  threshold: {
    warning: number;
    critical: number;
  };
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  duration: number;
  enabled: boolean;
  actions: AlertAction[];
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'console' | 'slack' | 'pagerduty';
  config: Record<string, any>;
}

export interface DashboardConfig {
  enabled: boolean;
  port: number;
  refreshInterval: number;
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'gauge' | 'table' | 'text';
  title: string;
  metric: string;
  config: Record<string, any>;
}

export interface MonitoringEvent {
  id: string;
  type: 'alert' | 'metric' | 'event' | 'log';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface MetricThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
  description: string;
}

export interface MonitoringConfig {
  metricsInterval: number;
  retention: string;
  dashboard: DashboardConfig;
  alerts: {
    enabled: boolean;
    rules: AlertConfig[];
  };
  thresholds: MetricThreshold[];
}

export class SystemMonitor extends EventEmitter {
  private config: MonitoringConfig;
  private metrics: SystemMetrics[];
  private performanceMetrics: PerformanceMetrics;
  private resourceUsage: Map<string, ResourceUsage> = new Map();
  private alerts: Map<string, AlertConfig> = new Map();
  private activeAlerts: Map<string, MonitoringEvent> = new Map();
  private metricsInterval: NodeJS.Timeout | null = null;
  private responseTimes: number[] = [];
  private requestCount: number = 0;
  private errorCount: number = 0;
  private running: boolean = false;
  private startTime: number = Date.now();

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;
    this.metrics = [];
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.setupAlerts();
  }

  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      responseTime: {
        average: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0
      },
      throughput: {
        requestsPerSecond: 0,
        totalRequests: 0,
        successRate: 100
      },
      errors: {
        total: 0,
        rate: 0,
        byType: {}
      },
      custom: {}
    };
  }

  private setupAlerts(): void {
    for (const alertConfig of this.config.alerts.rules) {
      this.alerts.set(alertConfig.id, alertConfig);
    }
  }

  /**
   * Start the monitoring system
   */
  async start(): Promise<void> {
    if (this.running) {
      console.warn('System monitor is already running');
      return;
    }

    this.running = true;
    this.startTime = Date.now();

    // Start metrics collection
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsInterval);

    // Start alert checking
    setInterval(() => {
      this.checkAlerts();
    }, 30000); // Check alerts every 30 seconds

    // Start performance monitoring
    this.startPerformanceMonitoring();

    console.log('✅ System Monitor started successfully');
    this.emit('started');
  }

  /**
   * Stop the monitoring system
   */
  async stop(): Promise<void> {
    if (!this.running) {
      console.warn('System monitor is not running');
      return;
    }

    this.running = false;

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    console.log('✅ System Monitor stopped successfully');
    this.emit('stopped');
  }

  /**
   * Record a response time
   */
  recordResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);
    this.requestCount++;

    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }

    this.updatePerformanceMetrics();
  }

  /**
   * Record an error
   */
  recordError(errorType: string): void {
    this.errorCount++;
    this.performanceMetrics.errors.total++;
    this.performanceMetrics.errors.byType[errorType] =
      (this.performanceMetrics.errors.byType[errorType] || 0) + 1;

    this.updatePerformanceMetrics();
  }

  /**
   * Record a custom metric
   */
  recordCustomMetric(name: string, value: number): void {
    this.performanceMetrics.custom[name] = value;
    this.emit('customMetric', { name, value, timestamp: new Date().toISOString() });
  }

  /**
   * Record a failover event
   */
  async recordFailoverEvent(serviceName: string, reason: string): Promise<void> {
    const event: MonitoringEvent = {
      id: `failover-${Date.now()}`,
      type: 'event',
      severity: 'critical',
      message: `Failover triggered for service ${serviceName}: ${reason}`,
      timestamp: new Date().toISOString(),
      metadata: {
        service: serviceName,
        reason,
        type: 'failover'
      }
    };

    this.emit('event', event);
    console.log(`📊 Failover event recorded: ${serviceName}`);
  }

  /**
   * Get current system metrics
   */
  async getCurrentMetrics(): Promise<SystemMetrics> {
    return this.collectSystemMetrics();
  }

  /**
   * Get performance metrics
   */
  async getMetrics(): Promise<PerformanceMetrics> {
    return { ...this.performanceMetrics };
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<any> {
    const currentMetrics = await this.getCurrentMetrics();

    return {
      status: this.running ? 'healthy' : 'stopped',
      uptime: this.running ? Date.now() - this.startTime : 0,
      metricsCollected: this.metrics.length,
      activeAlerts: this.activeAlerts.size,
      currentMetrics,
      performance: this.performanceMetrics
    };
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(duration: number = 3600000): SystemMetrics[] {
    const cutoff = Date.now() - duration;
    return this.metrics.filter(metric =>
      new Date(metric.timestamp).getTime() > cutoff
    );
  }

  /**
   * Add a custom alert rule
   */
  addAlertRule(alertConfig: AlertConfig): void {
    this.alerts.set(alertConfig.id, alertConfig);
    console.log(`✅ Alert rule added: ${alertConfig.name}`);
  }

  /**
   * Remove an alert rule
   */
  removeAlertRule(alertId: string): void {
    this.alerts.delete(alertId);
    this.activeAlerts.delete(alertId);
    console.log(`✅ Alert rule removed: ${alertId}`);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): MonitoringEvent[] {
    return Array.from(this.activeAlerts.values());
  }

  private collectMetrics(): void {
    const metrics = this.collectSystemMetrics();
    this.metrics.push(metrics);

    // Keep only recent metrics based on retention policy
    const retentionMs = this.parseRetention(this.config.retention);
    const cutoff = Date.now() - retentionMs;
    this.metrics = this.metrics.filter(metric =>
      new Date(metric.timestamp).getTime() > cutoff
    );

    this.emit('metricsCollected', metrics);
  }

  private collectSystemMetrics(): SystemMetrics {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const processMemory = process.memoryUsage();
    const processCpu = process.cpuUsage();

    return {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: this.calculateCpuUsage(),
        loadAverage: os.loadavg(),
        cores: cpus.length
      },
      memory: {
        total: Math.round(totalMem / 1024 / 1024), // MB
        used: Math.round(usedMem / 1024 / 1024), // MB
        free: Math.round(freeMem / 1024 / 1024), // MB
        usage: (usedMem / totalMem) * 100
      },
      disk: {
        usage: 45, // Placeholder - implement actual disk usage
        total: 1000000, // Placeholder
        free: 550000 // Placeholder
      },
      network: {
        bytesReceived: 0, // Placeholder - implement actual network stats
        bytesSent: 0,
        packetsReceived: 0,
        packetsSent: 0
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: processMemory,
        cpuUsage: processCpu
      }
    };
  }

  private calculateCpuUsage(): number {
    // Simplified CPU usage calculation
    const loadAvg = os.loadavg()[0];
    const numCPUs = os.cpus().length;
    return Math.min((loadAvg / numCPUs) * 100, 100);
  }

  private updatePerformanceMetrics(): void {
    if (this.responseTimes.length === 0) return;

    // Calculate percentiles
    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const len = sorted.length;

    this.performanceMetrics.responseTime = {
      average: sorted.reduce((sum, rt) => sum + rt, 0) / len,
      p50: sorted[Math.floor(len * 0.5)],
      p90: sorted[Math.floor(len * 0.9)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)]
    };

    // Calculate throughput
    const uptime = (Date.now() - this.startTime) / 1000; // seconds
    this.performanceMetrics.throughput = {
      requestsPerSecond: this.requestCount / uptime,
      totalRequests: this.requestCount,
      successRate: ((this.requestCount - this.errorCount) / this.requestCount) * 100
    };

    // Calculate error rate
    this.performanceMetrics.errors.rate = (this.errorCount / this.requestCount) * 100;
  }

  private checkAlerts(): void {
    if (!this.config.alerts.enabled) return;

    const currentMetrics = this.collectSystemMetrics();

    for (const [alertId, alertConfig] of this.alerts) {
      if (!alertConfig.enabled) continue;

      const metricValue = this.getMetricValue(currentMetrics, alertConfig.metric);
      if (metricValue === undefined) continue;

      const shouldAlert = this.evaluateAlertCondition(
        metricValue,
        alertConfig.threshold.critical,
        alertConfig.condition
      );

      if (shouldAlert && !this.activeAlerts.has(alertId)) {
        this.triggerAlert(alertId, alertConfig, metricValue, 'critical');
      } else if (!shouldAlert && this.activeAlerts.has(alertId)) {
        this.resolveAlert(alertId);
      }

      // Check warning threshold
      const shouldWarn = this.evaluateAlertCondition(
        metricValue,
        alertConfig.threshold.warning,
        alertConfig.condition
      );

      if (shouldWarn && !shouldAlert && !this.activeAlerts.has(`${alertId}-warning`)) {
        this.triggerAlert(`${alertId}-warning`, alertConfig, metricValue, 'warning');
      } else if (!shouldWarn && this.activeAlerts.has(`${alertId}-warning`)) {
        this.resolveAlert(`${alertId}-warning`);
      }
    }
  }

  private getMetricValue(metrics: SystemMetrics, metricPath: string): number | undefined {
    const parts = metricPath.split('.');
    let value: any = metrics;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return typeof value === 'number' ? value : undefined;
  }

  private evaluateAlertCondition(
    value: number,
    threshold: number,
    condition: string
  ): boolean {
    switch (condition) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return value === threshold;
      case 'not_equals':
        return value !== threshold;
      default:
        return false;
    }
  }

  private triggerAlert(
    alertId: string,
    alertConfig: AlertConfig,
    value: number,
    severity: 'warning' | 'critical'
  ): void {
    const alert: MonitoringEvent = {
      id: alertId,
      type: 'alert',
      severity,
      message: `${alertConfig.name}: ${alertConfig.metric} is ${value} (threshold: ${severity === 'critical' ? alertConfig.threshold.critical : alertConfig.threshold.warning})`,
      timestamp: new Date().toISOString(),
      metadata: {
        alertId: alertConfig.id,
        metric: alertConfig.metric,
        value,
        threshold: severity === 'critical' ? alertConfig.threshold.critical : alertConfig.threshold.warning,
        condition: alertConfig.condition
      }
    };

    this.activeAlerts.set(alertId, alert);
    this.executeAlertActions(alertConfig, alert);
    this.emit('alert', alert);

    console.warn(`🚨 ALERT [${severity.toUpperCase()}]: ${alert.message}`);
  }

  private resolveAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      this.activeAlerts.delete(alertId);
      console.log(`✅ Alert resolved: ${alert.message}`);
      this.emit('alertResolved', alert);
    }
  }

  private executeAlertActions(alertConfig: AlertConfig, alert: MonitoringEvent): void {
    for (const action of alertConfig.actions) {
      switch (action.type) {
        case 'console':
          console.warn(`🚨 ${alert.message}`);
          break;
        case 'webhook':
          this.sendWebhookAlert(action.config.url, alert);
          break;
        case 'email':
          // Implement email sending
          break;
        case 'slack':
          // Implement Slack notification
          break;
        case 'pagerduty':
          // Implement PagerDuty integration
          break;
        default:
          console.warn(`Unknown alert action type: ${action.type}`);
      }
    }
  }

  private async sendWebhookAlert(url: string, alert: MonitoringEvent): Promise<void> {
    try {
      const axios = require('axios');
      await axios.post(url, alert);
      console.log(`✅ Webhook alert sent to ${url}`);
    } catch (error) {
      console.error(`❌ Failed to send webhook alert to ${url}:`, error);
    }
  }

  private parseRetention(retention: string): number {
    const match = retention.match(/^(\d+)([smhd])$/);
    if (!match) return 24 * 60 * 60 * 1000; // Default 24 hours

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  private startPerformanceMonitoring(): void {
    // Monitor Node.js performance
    if (typeof performance.mark === 'function') {
      setInterval(() => {
        const memUsage = process.memoryUsage();
        this.recordCustomMetric('node_memory_heap_used', memUsage.heapUsed);
        this.recordCustomMetric('node_memory_heap_total', memUsage.heapTotal);
        this.recordCustomMetric('node_memory_external', memUsage.external);
      }, this.config.metricsInterval);
    }
  }
}
