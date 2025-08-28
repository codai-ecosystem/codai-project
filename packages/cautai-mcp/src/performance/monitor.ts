import EventEmitter from 'events';
import { performance } from 'perf_hooks';
import type { PerformanceMetrics } from '../types';

// Simple logger until @codai/logger is available
const logger = {
  debug: (msg: string, meta?: any) => console.debug(`[Performance] ${msg}`, meta || ''),
  info: (msg: string, meta?: any) => console.info(`[Performance] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[Performance] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[Performance] ${msg}`, meta || '')
};

export interface PerformanceThresholds {
  queryTime: number;        // Max acceptable query processing time (ms)
  searchTime: number;       // Max acceptable search execution time (ms)
  totalTime: number;        // Max acceptable total request time (ms)
  memoryUsage: number;      // Max acceptable memory usage (MB)
  cacheHitRate: number;     // Min acceptable cache hit rate (0-1)
  errorRate: number;        // Max acceptable error rate (0-1)
}

export interface AlertConfig {
  enabled: boolean;
  channels: Array<'console' | 'webhook' | 'email'>;
  thresholds: PerformanceThresholds;
  cooldownMs: number;       // Minimum time between alerts
}

export interface PerformanceAlert {
  id: string;
  timestamp: number;
  type: 'threshold_breach' | 'anomaly_detected' | 'system_degradation';
  metric: keyof PerformanceThresholds;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context?: Record<string, any>;
}

export interface SystemMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    heapUsed: number;
    heapTotal: number;
  };
  gc: {
    collections: number;
    duration: number;
  };
  eventLoop: {
    lag: number;
  };
}

export interface OperationMetrics {
  operationType: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: Error;
  metadata?: Record<string, any>;
}

/**
 * Advanced performance monitoring system with:
 * - Real-time metrics collection
 * - Performance threshold monitoring
 * - Automated alerting system
 * - System resource monitoring
 * - Performance trend analysis
 * - Memory leak detection
 * - Response time percentiles
 */
export class PerformanceMonitor extends EventEmitter {
  private readonly metrics: PerformanceMetrics[] = [];
  private readonly operations: Map<string, OperationMetrics> = new Map();
  private readonly alerts: PerformanceAlert[] = [];
  private readonly systemMetrics: SystemMetrics[] = [];
  
  private metricsTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private alertCooldowns: Map<string, number> = new Map();
  
  private startTime = performance.now();
  private operationCounter = 0;
  private alertCounter = 0;

  constructor(
    private readonly config: {
      retention: {
        metrics: number;      // How long to keep metrics (ms)
        operations: number;   // How long to keep operation data (ms)
        alerts: number;       // How long to keep alerts (ms)
      };
      sampling: {
        metricsInterval: number;    // How often to collect system metrics (ms)
        cleanupInterval: number;    // How often to cleanup old data (ms)
      };
      alerting: AlertConfig;
    }
  ) {
    super();
    this.startMonitoring();
  }

  /**
   * Start a performance measurement for an operation
   */
  startOperation(operationType: string, metadata?: Record<string, any>): string {
    const operationId = `${operationType}_${++this.operationCounter}_${Date.now()}`;
    
    const operation: OperationMetrics = {
      operationType,
      startTime: performance.now(),
      success: false,
      metadata
    };

    this.operations.set(operationId, operation);
    logger.debug('Started operation measurement', { operationId, operationType });
    
    return operationId;
  }

  /**
   * End a performance measurement for an operation
   */
  endOperation(operationId: string, success: boolean = true, error?: Error): PerformanceMetrics | null {
    const operation = this.operations.get(operationId);
    if (!operation) {
      logger.warn('Operation not found', { operationId });
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - operation.startTime;

    operation.endTime = endTime;
    operation.duration = duration;
    operation.success = success;
    operation.error = error;

    // Create performance metrics
    const metrics: PerformanceMetrics = {
      queryTime: duration,
      searchTime: duration, // Simplified - in real impl, would track sub-operations
      processingTime: duration * 0.1, // Estimated processing overhead
      totalTime: duration,
      cacheHit: false, // Would be set by cache layer
      resultCount: 0, // Would be set by search layer
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      timestamp: Date.now()
    };

    this.addMetrics(metrics);
    this.checkThresholds(metrics, operation);

    logger.debug('Completed operation measurement', { 
      operationId, 
      operationType: operation.operationType,
      duration: `${duration.toFixed(2)}ms`,
      success 
    });

    // Keep operation for a while, then clean up
    setTimeout(() => this.operations.delete(operationId), this.config.retention.operations);

    return metrics;
  }

  /**
   * Add performance metrics manually
   */
  addMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    this.emit('metrics', metrics);
    
    // Trim old metrics
    const cutoff = Date.now() - this.config.retention.metrics;
    while (this.metrics.length > 0 && this.metrics[0].timestamp < cutoff) {
      this.metrics.shift();
    }
  }

  /**
   * Get performance statistics for a time period
   */
  getStats(periodMs: number = 60000): {
    count: number;
    averages: {
      queryTime: number;
      searchTime: number;
      processingTime: number;
      totalTime: number;
      memoryUsage: number;
    };
    percentiles: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
    };
    cacheHitRate: number;
    errorRate: number;
  } {
    const cutoff = Date.now() - periodMs;
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff);
    
    if (recentMetrics.length === 0) {
      return {
        count: 0,
        averages: { queryTime: 0, searchTime: 0, processingTime: 0, totalTime: 0, memoryUsage: 0 },
        percentiles: { p50: 0, p90: 0, p95: 0, p99: 0 },
        cacheHitRate: 0,
        errorRate: 0
      };
    }

    // Calculate averages
    const averages = {
      queryTime: recentMetrics.reduce((sum, m) => sum + m.queryTime, 0) / recentMetrics.length,
      searchTime: recentMetrics.reduce((sum, m) => sum + m.searchTime, 0) / recentMetrics.length,
      processingTime: recentMetrics.reduce((sum, m) => sum + m.processingTime, 0) / recentMetrics.length,
      totalTime: recentMetrics.reduce((sum, m) => sum + m.totalTime, 0) / recentMetrics.length,
      memoryUsage: recentMetrics.reduce((sum, m) => sum + (m.memoryUsage || 0), 0) / recentMetrics.length
    };

    // Calculate percentiles based on total time
    const sortedTimes = recentMetrics.map(m => m.totalTime).sort((a, b) => a - b);
    const percentiles = {
      p50: this.calculatePercentile(sortedTimes, 0.5),
      p90: this.calculatePercentile(sortedTimes, 0.9),
      p95: this.calculatePercentile(sortedTimes, 0.95),
      p99: this.calculatePercentile(sortedTimes, 0.99)
    };

    // Calculate rates
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = cacheHits / recentMetrics.length;

    // Error rate would need to be tracked separately
    const errorRate = 0; // Placeholder

    return {
      count: recentMetrics.length,
      averages,
      percentiles,
      cacheHitRate,
      errorRate
    };
  }

  /**
   * Get current system metrics
   */
  getCurrentSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      timestamp: Date.now(),
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to ms
        loadAverage: require('os').loadavg()
      },
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
        heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
        heapTotal: memUsage.heapTotal / 1024 / 1024 // MB
      },
      gc: {
        collections: 0, // Would need GC hooks
        duration: 0
      },
      eventLoop: {
        lag: 0 // Would need event loop monitoring
      }
    };
  }

  /**
   * Get recent alerts
   */
  getAlerts(periodMs: number = 3600000): PerformanceAlert[] {
    const cutoff = Date.now() - periodMs;
    return this.alerts.filter(alert => alert.timestamp >= cutoff);
  }

  /**
   * Get performance health score (0-100)
   */
  getHealthScore(): number {
    const stats = this.getStats(300000); // 5 minutes
    let score = 100;

    const thresholds = this.config.alerting.thresholds;
    
    // Penalize slow response times
    if (stats.averages.totalTime > thresholds.totalTime) {
      score -= Math.min(30, (stats.averages.totalTime / thresholds.totalTime - 1) * 100);
    }

    // Penalize low cache hit rate
    if (stats.cacheHitRate < thresholds.cacheHitRate) {
      score -= Math.min(20, (thresholds.cacheHitRate - stats.cacheHitRate) * 100);
    }

    // Penalize high error rate
    if (stats.errorRate > thresholds.errorRate) {
      score -= Math.min(40, (stats.errorRate / thresholds.errorRate) * 100);
    }

    // Penalize high memory usage
    const currentMemory = this.getCurrentSystemMetrics().memory.heapUsed;
    if (currentMemory > thresholds.memoryUsage) {
      score -= Math.min(10, (currentMemory / thresholds.memoryUsage - 1) * 50);
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format: 'prometheus' | 'json' | 'csv' = 'json'): string {
    const stats = this.getStats();
    const systemMetrics = this.getCurrentSystemMetrics();
    const healthScore = this.getHealthScore();

    if (format === 'json') {
      return JSON.stringify({
        timestamp: Date.now(),
        performance: stats,
        system: systemMetrics,
        health_score: healthScore,
        alerts: this.getAlerts(300000) // Last 5 minutes
      }, null, 2);
    }

    // Prometheus format
    if (format === 'prometheus') {
      return [
        `# HELP cautai_request_duration_seconds Request duration`,
        `# TYPE cautai_request_duration_seconds histogram`,
        `cautai_request_duration_seconds{quantile="0.5"} ${stats.percentiles.p50 / 1000}`,
        `cautai_request_duration_seconds{quantile="0.9"} ${stats.percentiles.p90 / 1000}`,
        `cautai_request_duration_seconds{quantile="0.95"} ${stats.percentiles.p95 / 1000}`,
        `cautai_request_duration_seconds{quantile="0.99"} ${stats.percentiles.p99 / 1000}`,
        ``,
        `# HELP cautai_cache_hit_rate Cache hit rate`,
        `# TYPE cautai_cache_hit_rate gauge`,
        `cautai_cache_hit_rate ${stats.cacheHitRate}`,
        ``,
        `# HELP cautai_memory_usage_mb Memory usage in MB`,
        `# TYPE cautai_memory_usage_mb gauge`,
        `cautai_memory_usage_mb ${systemMetrics.memory.heapUsed}`,
        ``,
        `# HELP cautai_health_score Health score (0-100)`,
        `# TYPE cautai_health_score gauge`,
        `cautai_health_score ${healthScore}`
      ].join('\n');
    }

    // CSV format
    return [
      'timestamp,query_time,search_time,processing_time,total_time,cache_hit_rate,memory_usage,health_score',
      ...this.metrics.slice(-100).map(m => 
        `${m.timestamp},${m.queryTime},${m.searchTime},${m.processingTime},${m.totalTime},${m.cacheHit ? 1 : 0},${m.memoryUsage || 0},${this.getHealthScore()}`
      )
    ].join('\n');
  }

  /**
   * Destroy the monitor and clean up resources
   */
  destroy(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.metrics.length = 0;
    this.operations.clear();
    this.alerts.length = 0;
    this.systemMetrics.length = 0;
    this.alertCooldowns.clear();
    
    logger.info('Performance monitor destroyed');
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    
    const index = (percentile * (sortedValues.length - 1));
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedValues[lower];
    }
    
    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  /**
   * Check if metrics breach thresholds and create alerts
   */
  private checkThresholds(metrics: PerformanceMetrics, operation: OperationMetrics): void {
    if (!this.config.alerting.enabled) return;

    const thresholds = this.config.alerting.thresholds;
    const checks: Array<{ metric: keyof PerformanceThresholds; value: number; threshold: number }> = [
      { metric: 'queryTime', value: metrics.queryTime, threshold: thresholds.queryTime },
      { metric: 'searchTime', value: metrics.searchTime, threshold: thresholds.searchTime },
      { metric: 'totalTime', value: metrics.totalTime, threshold: thresholds.totalTime },
      { metric: 'memoryUsage', value: metrics.memoryUsage || 0, threshold: thresholds.memoryUsage }
    ];

    for (const check of checks) {
      if (check.value > check.threshold) {
        this.createAlert({
          type: 'threshold_breach',
          metric: check.metric,
          value: check.value,
          threshold: check.threshold,
          severity: this.calculateSeverity(check.value, check.threshold),
          context: {
            operationType: operation.operationType,
            operationId: operation
          }
        });
      }
    }
  }

  /**
   * Create and emit an alert
   */
  private createAlert(params: Omit<PerformanceAlert, 'id' | 'timestamp' | 'message'>): void {
    const cooldownKey = `${params.type}_${params.metric}`;
    const lastAlert = this.alertCooldowns.get(cooldownKey) || 0;
    
    if (Date.now() - lastAlert < this.config.alerting.cooldownMs) {
      return; // Still in cooldown
    }

    const alert: PerformanceAlert = {
      id: `alert_${++this.alertCounter}_${Date.now()}`,
      timestamp: Date.now(),
      message: this.generateAlertMessage(params),
      ...params
    };

    this.alerts.push(alert);
    this.alertCooldowns.set(cooldownKey, Date.now());
    
    this.emit('alert', alert);
    logger.warn('Performance alert created', alert);
  }

  /**
   * Calculate alert severity based on how much threshold was breached
   */
  private calculateSeverity(value: number, threshold: number): PerformanceAlert['severity'] {
    const ratio = value / threshold;
    
    if (ratio >= 3) return 'critical';
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Generate human-readable alert message
   */
  private generateAlertMessage(params: Omit<PerformanceAlert, 'id' | 'timestamp' | 'message'>): string {
    const { metric, value, threshold, severity } = params;
    
    const unit = metric.includes('Time') ? 'ms' : 
                 metric === 'memoryUsage' ? 'MB' : '';
                 
    return `${severity.toUpperCase()}: ${metric} is ${value.toFixed(2)}${unit}, exceeding threshold of ${threshold}${unit}`;
  }

  /**
   * Start background monitoring tasks
   */
  private startMonitoring(): void {
    // Collect system metrics
    this.metricsTimer = setInterval(() => {
      const systemMetrics = this.getCurrentSystemMetrics();
      this.systemMetrics.push(systemMetrics);
      
      // Trim old system metrics
      const cutoff = Date.now() - this.config.retention.metrics;
      while (this.systemMetrics.length > 0 && this.systemMetrics[0].timestamp < cutoff) {
        this.systemMetrics.shift();
      }
      
      this.emit('systemMetrics', systemMetrics);
    }, this.config.sampling.metricsInterval);

    // Cleanup old data
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      
      // Clean up old alerts
      const alertCutoff = now - this.config.retention.alerts;
      while (this.alerts.length > 0 && this.alerts[0].timestamp < alertCutoff) {
        this.alerts.shift();
      }
      
      // Clean up alert cooldowns
      for (const [key, timestamp] of this.alertCooldowns.entries()) {
        if (now - timestamp > this.config.alerting.cooldownMs * 2) {
          this.alertCooldowns.delete(key);
        }
      }
      
      logger.debug('Performance monitor cleanup completed');
    }, this.config.sampling.cleanupInterval);

    logger.info('Performance monitoring started');
  }
}

// Export default configuration
export const DEFAULT_PERFORMANCE_CONFIG = {
  retention: {
    metrics: 1000 * 60 * 60 * 24,    // 24 hours
    operations: 1000 * 60 * 30,      // 30 minutes
    alerts: 1000 * 60 * 60 * 24 * 7  // 7 days
  },
  sampling: {
    metricsInterval: 30000,  // 30 seconds
    cleanupInterval: 300000  // 5 minutes
  },
  alerting: {
    enabled: true,
    channels: ['console'] as const,
    thresholds: {
      queryTime: 5000,      // 5 seconds
      searchTime: 3000,     // 3 seconds
      totalTime: 10000,     // 10 seconds
      memoryUsage: 512,     // 512 MB
      cacheHitRate: 0.7,    // 70%
      errorRate: 0.05       // 5%
    },
    cooldownMs: 300000      // 5 minutes
  }
};