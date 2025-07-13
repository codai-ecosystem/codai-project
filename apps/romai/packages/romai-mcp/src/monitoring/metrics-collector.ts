/**
 * ROMAI Metrics Collector
 * 
 * Enterprise-grade metrics collection compatible with Prometheus, OpenTelemetry,
 * and other observability platforms. Provides real-time performance monitoring
 * and business intelligence analytics.
 */

import { MetricData } from '../logging/enterprise-logger';

export interface SystemMetrics {
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage: number;
  uptime: number;
  timestamp: string;
}

export interface BusinessMetrics {
  activeUsers: number;
  organizationsCount: number;
  requestsPerSecond: number;
  revenueMetrics: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    apiCallsUsed: number;
    quotaUtilization: number;
  };
  timestamp: string;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;
  private lastRequestTime: number = 0;

  private constructor() {
    this.startTime = Date.now();
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Collect system performance metrics
   */
  public collectSystemMetrics(): SystemMetrics {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      memoryUsage: {
        rss: memoryUsage.rss,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external
      },
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      uptime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Track request metrics
   */
  public trackRequest(): void {
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  /**
   * Track error metrics
   */
  public trackError(): void {
    this.errorCount++;
  }

  /**
   * Get current performance summary
   */
  public getPerformanceSummary(): {
    uptime: number;
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    requestsPerSecond: number;
    memoryUsageMB: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  } {
    const uptime = Date.now() - this.startTime;
    const requestsPerSecond = this.requestCount / (uptime / 1000);
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    const memoryUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;

    let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';

    if (errorRate > 10 || memoryUsageMB > 500) {
      systemHealth = 'critical';
    } else if (errorRate > 5 || memoryUsageMB > 200) {
      systemHealth = 'warning';
    } else if (errorRate > 1 || memoryUsageMB > 100) {
      systemHealth = 'good';
    }

    return {
      uptime,
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRate,
      requestsPerSecond,
      memoryUsageMB,
      systemHealth
    };
  }

  /**
   * Generate Prometheus-compatible metrics
   */
  public generatePrometheusMetrics(): string {
    const summary = this.getPerformanceSummary();
    const systemMetrics = this.collectSystemMetrics();

    return `
# HELP romai_requests_total Total number of MCP requests
# TYPE romai_requests_total counter
romai_requests_total ${summary.totalRequests}

# HELP romai_errors_total Total number of MCP errors  
# TYPE romai_errors_total counter
romai_errors_total ${summary.totalErrors}

# HELP romai_request_rate_per_second Current request rate
# TYPE romai_request_rate_per_second gauge
romai_request_rate_per_second ${summary.requestsPerSecond.toFixed(2)}

# HELP romai_error_rate_percent Current error rate percentage
# TYPE romai_error_rate_percent gauge  
romai_error_rate_percent ${summary.errorRate.toFixed(2)}

# HELP romai_memory_usage_bytes Current memory usage in bytes
# TYPE romai_memory_usage_bytes gauge
romai_memory_usage_bytes ${systemMetrics.memoryUsage.heapUsed}

# HELP romai_uptime_seconds Server uptime in seconds
# TYPE romai_uptime_seconds gauge
romai_uptime_seconds ${systemMetrics.uptime.toFixed(0)}

# HELP romai_system_health System health status (0=critical, 1=warning, 2=good, 3=excellent)
# TYPE romai_system_health gauge
romai_system_health ${this.getHealthScore(summary.systemHealth)}
`.trim();
  }

  /**
   * Generate OpenTelemetry-compatible metrics
   */
  public generateOpenTelemetryMetrics(): Array<{
    name: string;
    description: string;
    unit: string;
    type: 'counter' | 'gauge' | 'histogram';
    value: number;
    labels: Record<string, string>;
    timestamp: number;
  }> {
    const summary = this.getPerformanceSummary();
    const systemMetrics = this.collectSystemMetrics();
    const timestamp = Date.now();

    return [
      {
        name: 'romai_requests_total',
        description: 'Total number of MCP requests',
        unit: 'requests',
        type: 'counter',
        value: summary.totalRequests,
        labels: { service: 'romai-mcp', version: '0.2.0' },
        timestamp
      },
      {
        name: 'romai_errors_total',
        description: 'Total number of MCP errors',
        unit: 'errors',
        type: 'counter',
        value: summary.totalErrors,
        labels: { service: 'romai-mcp', version: '0.2.0' },
        timestamp
      },
      {
        name: 'romai_request_duration_seconds',
        description: 'Request duration in seconds',
        unit: 'seconds',
        type: 'histogram',
        value: 0, // Updated per request
        labels: { service: 'romai-mcp', version: '0.2.0' },
        timestamp
      },
      {
        name: 'romai_memory_usage_bytes',
        description: 'Current memory usage in bytes',
        unit: 'bytes',
        type: 'gauge',
        value: systemMetrics.memoryUsage.heapUsed,
        labels: { service: 'romai-mcp', version: '0.2.0', type: 'heap' },
        timestamp
      },
      {
        name: 'romai_system_health_score',
        description: 'System health score',
        unit: 'score',
        type: 'gauge',
        value: this.getHealthScore(summary.systemHealth),
        labels: { service: 'romai-mcp', version: '0.2.0' },
        timestamp
      }
    ];
  }

  /**
   * Collect business intelligence metrics
   */
  public collectBusinessMetrics(activeUsers: number = 0, organizationsCount: number = 1): BusinessMetrics {
    const summary = this.getPerformanceSummary();

    return {
      activeUsers,
      organizationsCount,
      requestsPerSecond: summary.requestsPerSecond,
      revenueMetrics: {
        dailyActiveUsers: activeUsers,
        monthlyActiveUsers: activeUsers, // Enhanced in production
        apiCallsUsed: summary.totalRequests,
        quotaUtilization: 0 // Calculated based on plan limits
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate health score from status
   */
  private getHealthScore(health: string): number {
    switch (health) {
      case 'excellent': return 3;
      case 'good': return 2;
      case 'warning': return 1;
      case 'critical': return 0;
      default: return 0;
    }
  }

  /**
   * Reset metrics (for testing)
   */
  public reset(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
  }
}

/**
 * Export singleton instance
 */
export const metricsCollector = MetricsCollector.getInstance();
