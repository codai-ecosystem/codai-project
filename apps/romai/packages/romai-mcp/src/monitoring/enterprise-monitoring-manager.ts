/**
 * Enterprise Monitoring Manager
 * Comprehensive monitoring and observability for ROMAI Ultimate MCP Server
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export interface MetricPoint {
  timestamp: Date;
  value: number;
  tags?: Record<string, string>;
}

export interface PerformanceMetrics {
  requestCount: number;
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  };
  errorRate: number;
  throughput: number;
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
}

export interface HealthCheck {
  name: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  responseTime: number;
  message?: string;
  details?: Record<string, any>;
  lastCheck: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'GT' | 'LT' | 'EQ' | 'NE';
  threshold: number;
  duration: number; // seconds
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  channels: string[];
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';
}

export class EnterpriseMonitoringManager extends EventEmitter {
  private metrics: Map<string, MetricPoint[]> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private responseTimes: number[] = [];
  private requestCount = 0;
  private errorCount = 0;
  private startTime = Date.now();

  constructor() {
    super();
    this.initializeDefaultHealthChecks();
    this.initializeDefaultAlertRules();
    this.startPeriodicTasks();
  }

  /**
   * Metrics Collection
   */
  public recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricPoints = this.metrics.get(name)!;
    metricPoints.push({
      timestamp: new Date(),
      value,
      tags
    });

    // Keep only last 1000 points per metric
    if (metricPoints.length > 1000) {
      metricPoints.splice(0, metricPoints.length - 1000);
    }

    // Emit metric event for real-time processing
    this.emit('metric', { name, value, tags, timestamp: new Date() });

    // Check alert rules
    this.checkAlertRules(name, value);
  }

  public getMetric(name: string, duration?: number): MetricPoint[] {
    const points = this.metrics.get(name) || [];

    if (!duration) return points;

    const cutoff = new Date(Date.now() - duration * 1000);
    return points.filter(point => point.timestamp >= cutoff);
  }

  public getMetricStats(name: string, duration?: number): {
    count: number;
    avg: number;
    min: number;
    max: number;
    sum: number;
  } {
    const points = this.getMetric(name, duration);

    if (points.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, sum: 0 };
    }

    const values = points.map(p => p.value);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: points.length,
      avg: sum / points.length,
      min: Math.min(...values),
      max: Math.max(...values),
      sum
    };
  }

  /**
   * Performance Monitoring
   */
  public recordRequest(responseTime: number, isError: boolean = false): void {
    this.requestCount++;
    this.responseTimes.push(responseTime);

    if (isError) {
      this.errorCount++;
    }

    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes.splice(0, this.responseTimes.length - 1000);
    }

    // Record metrics
    this.recordMetric('request_count', 1);
    this.recordMetric('response_time', responseTime);

    if (isError) {
      this.recordMetric('error_count', 1);
    }
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    const sortedResponseTimes = [...this.responseTimes].sort((a, b) => a - b);
    const memUsage = process.memoryUsage();
    const uptime = (Date.now() - this.startTime) / 1000;

    return {
      requestCount: this.requestCount,
      responseTime: {
        avg: this.responseTimes.length > 0
          ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
          : 0,
        p50: this.getPercentile(sortedResponseTimes, 0.5),
        p95: this.getPercentile(sortedResponseTimes, 0.95),
        p99: this.getPercentile(sortedResponseTimes, 0.99),
        min: sortedResponseTimes.length > 0 ? sortedResponseTimes[0] : 0,
        max: sortedResponseTimes.length > 0 ? sortedResponseTimes[sortedResponseTimes.length - 1] : 0
      },
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      throughput: uptime > 0 ? this.requestCount / uptime : 0,
      uptime,
      memoryUsage: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      cpuUsage: this.getCPUUsage()
    };
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;

    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[Math.max(0, index)];
  }

  private getCPUUsage(): number {
    // Simplified CPU usage calculation
    // In production, this would use more sophisticated monitoring
    const usage = process.cpuUsage();
    return (usage.user + usage.system) / 1000000; // Convert to seconds
  }

  /**
   * Health Checks
   */
  public registerHealthCheck(
    name: string,
    checkFunction: () => Promise<{ status: 'HEALTHY' | 'WARNING' | 'CRITICAL'; message?: string; details?: Record<string, any> }>
  ): void {
    this.healthChecks.set(name, {
      name,
      status: 'UNKNOWN',
      responseTime: 0,
      lastCheck: new Date()
    });

    // Run health check immediately and then periodically
    this.runHealthCheck(name, checkFunction);

    setInterval(async () => {
      await this.runHealthCheck(name, checkFunction);
    }, 30000); // Run every 30 seconds
  }

  private async runHealthCheck(
    name: string,
    checkFunction: () => Promise<{ status: 'HEALTHY' | 'WARNING' | 'CRITICAL'; message?: string; details?: Record<string, any> }>
  ): Promise<void> {
    const startTime = performance.now();

    try {
      const result = await checkFunction();
      const responseTime = performance.now() - startTime;

      const healthCheck: HealthCheck = {
        name,
        status: result.status,
        responseTime,
        message: result.message,
        details: result.details,
        lastCheck: new Date()
      };

      this.healthChecks.set(name, healthCheck);

      // Record health check metrics
      this.recordMetric(`health_check_${name}_response_time`, responseTime);
      this.recordMetric(`health_check_${name}_status`, result.status === 'HEALTHY' ? 1 : 0);

      // Emit health check event
      this.emit('healthCheck', healthCheck);

    } catch (error) {
      const responseTime = performance.now() - startTime;

      const healthCheck: HealthCheck = {
        name,
        status: 'CRITICAL',
        responseTime,
        message: error instanceof Error ? error.message : 'Health check failed',
        lastCheck: new Date()
      };

      this.healthChecks.set(name, healthCheck);
      this.emit('healthCheck', healthCheck);
    }
  }

  public getHealthStatus(): {
    overall: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    checks: HealthCheck[];
    summary: {
      total: number;
      healthy: number;
      warning: number;
      critical: number;
    };
  } {
    const checks = Array.from(this.healthChecks.values());
    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'HEALTHY').length,
      warning: checks.filter(c => c.status === 'WARNING').length,
      critical: checks.filter(c => c.status === 'CRITICAL').length
    };

    let overall: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    if (summary.critical > 0) {
      overall = 'CRITICAL';
    } else if (summary.warning > 0) {
      overall = 'WARNING';
    } else {
      overall = 'HEALTHY';
    }

    return { overall, checks, summary };
  }

  /**
   * Alerting System
   */
  public addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
  }

  public removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
  }

  private checkAlertRules(metricName: string, value: number): void {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled || rule.metric !== metricName) continue;

      const shouldAlert = this.evaluateCondition(value, rule.condition, rule.threshold);

      if (shouldAlert) {
        this.triggerAlert(rule, value);
      }
    }
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'GT': return value > threshold;
      case 'LT': return value < threshold;
      case 'EQ': return value === threshold;
      case 'NE': return value !== threshold;
      default: return false;
    }
  }

  private triggerAlert(rule: AlertRule, value: number): void {
    const alertId = `${rule.id}_${Date.now()}`;

    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      severity: rule.severity,
      message: `${rule.name}: ${rule.metric} is ${value} (threshold: ${rule.threshold})`,
      triggeredAt: new Date(),
      status: 'ACTIVE'
    };

    this.activeAlerts.set(alertId, alert);

    // Emit alert event
    this.emit('alert', alert);

    // Send to configured channels
    this.sendAlert(alert, rule.channels);
  }

  private sendAlert(alert: Alert, channels: string[]): void {
    // In production, this would integrate with actual alerting services
    console.warn(`[ALERT] ${alert.severity}: ${alert.message}`);

    for (const channel of channels) {
      switch (channel) {
        case 'console':
          console.error(`Alert sent to console: ${alert.message}`);
          break;
        case 'email':
          console.log(`Alert would be sent to email: ${alert.message}`);
          break;
        case 'slack':
          console.log(`Alert would be sent to Slack: ${alert.message}`);
          break;
        case 'webhook':
          console.log(`Alert would be sent to webhook: ${alert.message}`);
          break;
      }
    }
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.status = 'ACKNOWLEDGED';
      this.activeAlerts.set(alertId, alert);
      this.emit('alertAcknowledged', alert);
    }
  }

  public resolveAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.status = 'RESOLVED';
      alert.resolvedAt = new Date();
      this.activeAlerts.set(alertId, alert);
      this.emit('alertResolved', alert);
    }
  }

  public getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values()).filter(a => a.status === 'ACTIVE');
  }

  /**
   * Logging & Tracing
   */
  public createTrace(operationName: string): {
    traceId: string;
    span: (spanName: string) => { end: () => number };
  } {
    const traceId = this.generateTraceId();

    return {
      traceId,
      span: (spanName: string) => {
        const startTime = performance.now();

        return {
          end: () => {
            const duration = performance.now() - startTime;
            this.recordMetric(`trace_${operationName}_${spanName}_duration`, duration);
            return duration;
          }
        };
      }
    };
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }

  /**
   * Dashboard Data
   */
  public getDashboardData(): {
    performance: PerformanceMetrics;
    health: {
      overall: 'HEALTHY' | 'WARNING' | 'CRITICAL';
      checks: HealthCheck[];
      summary: {
        total: number;
        healthy: number;
        warning: number;
        critical: number;
      };
    };
    alerts: {
      active: number;
      total: number;
      bySeverity: Record<string, number>;
    };
    metrics: {
      [key: string]: {
        current: number;
        trend: 'UP' | 'DOWN' | 'STABLE';
        change: number;
      };
    };
  } {
    const performance = this.getPerformanceMetrics();
    const health = this.getHealthStatus();
    const alerts = Array.from(this.activeAlerts.values());

    const alertsBySeverity: Record<string, number> = {};
    alerts.forEach(alert => {
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
    });

    // Calculate metric trends (simplified)
    const metrics: any = {};
    for (const [name, points] of this.metrics.entries()) {
      if (points.length >= 2) {
        const current = points[points.length - 1].value;
        const previous = points[points.length - 2].value;
        const change = ((current - previous) / previous) * 100;

        metrics[name] = {
          current,
          trend: change > 5 ? 'UP' : change < -5 ? 'DOWN' : 'STABLE',
          change
        };
      }
    }

    return {
      performance,
      health,
      alerts: {
        active: alerts.filter(a => a.status === 'ACTIVE').length,
        total: alerts.length,
        bySeverity: alertsBySeverity
      },
      metrics
    };
  }

  /**
   * Initialization
   */
  private initializeDefaultHealthChecks(): void {
    // Memory health check
    this.registerHealthCheck('memory', async () => {
      const memUsage = process.memoryUsage();
      const percentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      if (percentage > 90) {
        return { status: 'CRITICAL', message: `Memory usage at ${percentage.toFixed(1)}%` };
      } else if (percentage > 75) {
        return { status: 'WARNING', message: `Memory usage at ${percentage.toFixed(1)}%` };
      } else {
        return { status: 'HEALTHY', message: `Memory usage at ${percentage.toFixed(1)}%` };
      }
    });

    // Process health check
    this.registerHealthCheck('process', async () => {
      const uptime = process.uptime();
      return {
        status: 'HEALTHY',
        message: `Process running for ${Math.floor(uptime)} seconds`,
        details: { uptime, pid: process.pid }
      };
    });
  }

  private initializeDefaultAlertRules(): void {
    // High error rate alert
    this.addAlertRule({
      id: 'high_error_rate',
      name: 'High Error Rate',
      metric: 'error_count',
      condition: 'GT',
      threshold: 10,
      duration: 60,
      severity: 'HIGH',
      channels: ['console', 'email'],
      enabled: true
    });

    // High response time alert
    this.addAlertRule({
      id: 'high_response_time',
      name: 'High Response Time',
      metric: 'response_time',
      condition: 'GT',
      threshold: 1000, // 1 second
      duration: 30,
      severity: 'MEDIUM',
      channels: ['console'],
      enabled: true
    });

    // Memory usage alert
    this.addAlertRule({
      id: 'high_memory_usage',
      name: 'High Memory Usage',
      metric: 'memory_usage_percentage',
      condition: 'GT',
      threshold: 85,
      duration: 120,
      severity: 'HIGH',
      channels: ['console', 'email'],
      enabled: true
    });
  }

  private startPeriodicTasks(): void {
    // Record system metrics every 30 seconds
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const memPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      this.recordMetric('memory_usage_percentage', memPercentage);
      this.recordMetric('memory_used_bytes', memUsage.heapUsed);
      this.recordMetric('cpu_usage_percentage', this.getCPUUsage());

    }, 30000);

    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000);
  }

  private cleanupOldData(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    for (const [name, points] of this.metrics.entries()) {
      const filteredPoints = points.filter(point => point.timestamp >= cutoff);
      this.metrics.set(name, filteredPoints);
    }

    // Clean up resolved alerts older than 7 days
    const alertCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    for (const [id, alert] of this.activeAlerts.entries()) {
      if (alert.status === 'RESOLVED' && alert.resolvedAt && alert.resolvedAt < alertCutoff) {
        this.activeAlerts.delete(id);
      }
    }
  }
}
