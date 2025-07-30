// Enterprise Metrics and Monitoring
import { EventEmitter } from 'events';
import { MetricsData, CNDConfig } from '../types.js';

export interface PerformanceMetrics {
  timestamp: Date;
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
  database: {
    activeConnections: number;
    totalQueries: number;
    avgQueryTime: number;
    slowQueries: number;
  };
  api: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    evictions: number;
    totalKeys: number;
  };
}

export class MetricsManager extends EventEmitter {
  private config: CNDConfig['performance'];
  private metrics: MetricsData[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private metricsInterval: NodeJS.Timeout | null = null;
  private maxMetricsHistory = 10000;

  // Real-time counters
  private counters = {
    totalRequests: 0,
    totalErrors: 0,
    totalQueries: 0,
    slowQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheEvictions: 0
  };

  // Response time tracking
  private responseTimes: number[] = [];
  private queryTimes: number[] = [];

  constructor(config: CNDConfig['performance']) {
    super();
    this.config = config;
  }

  /**
   * Start metrics collection
   */
  async start(): Promise<void> {
    if (!this.config?.monitoring?.enabled) {
      return;
    }

    console.log('Starting metrics collection...');

    // Collect system metrics every 30 seconds
    this.metricsInterval = setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000);

    this.emit('started');
  }

  /**
   * Stop metrics collection
   */
  async stop(): Promise<void> {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    this.emit('stopped');
  }

  /**
   * Record API request metric
   */
  recordAPIRequest(operation: string, duration: number, status: 'success' | 'error'): void {
    const metric: MetricsData = {
      timestamp: new Date(),
      service: 'cnd',
      operation,
      duration,
      status,
      metadata: {
        type: 'api_request',
        responseTime: duration
      }
    };

    this.metrics.push(metric);
    this.responseTimes.push(duration);
    this.counters.totalRequests++;

    if (status === 'error') {
      this.counters.totalErrors++;
    }

    // Keep only recent metrics in memory
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Keep only recent response times (last 1000)
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }

    this.emit('metricRecorded', metric);
  }

  /**
   * Record database query metric
   */
  recordDatabaseQuery(operation: string, duration: number, status: 'success' | 'error'): void {
    const metric: MetricsData = {
      timestamp: new Date(),
      service: 'cnd',
      operation: `db_${operation}`,
      duration,
      status,
      metadata: {
        type: 'database_query',
        queryTime: duration
      }
    };

    this.metrics.push(metric);
    this.queryTimes.push(duration);
    this.counters.totalQueries++;

    // Track slow queries (>1 second)
    if (duration > 1000) {
      this.counters.slowQueries++;
    }

    // Keep only recent query times (last 1000)
    if (this.queryTimes.length > 1000) {
      this.queryTimes.shift();
    }

    this.emit('metricRecorded', metric);
  }

  /**
   * Record cache operation
   */
  recordCacheOperation(operation: 'hit' | 'miss' | 'eviction'): void {
    switch (operation) {
      case 'hit':
        this.counters.cacheHits++;
        break;
      case 'miss':
        this.counters.cacheMisses++;
        break;
      case 'eviction':
        this.counters.cacheEvictions++;
        break;
    }

    const metric: MetricsData = {
      timestamp: new Date(),
      service: 'cnd',
      operation: `cache_${operation}`,
      duration: 0,
      status: 'success',
      metadata: {
        type: 'cache_operation',
        operation
      }
    };

    this.metrics.push(metric);
    this.emit('metricRecorded', metric);
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    const now = new Date();
    const memUsage = process.memoryUsage();

    // Calculate averages
    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;

    const avgQueryTime = this.queryTimes.length > 0
      ? this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length
      : 0;

    const errorRate = this.counters.totalRequests > 0
      ? (this.counters.totalErrors / this.counters.totalRequests) * 100
      : 0;

    const cacheHitRate = (this.counters.cacheHits + this.counters.cacheMisses) > 0
      ? (this.counters.cacheHits / (this.counters.cacheHits + this.counters.cacheMisses)) * 100
      : 0;

    const cacheMissRate = 100 - cacheHitRate;

    return {
      timestamp: now,
      cpu: {
        usage: 0, // Would use os.loadavg() in real implementation
        loadAverage: [0, 0, 0] // Would use os.loadavg() in real implementation
      },
      memory: {
        used: memUsage.rss,
        total: memUsage.rss + memUsage.heapTotal,
        percentage: (memUsage.rss / (memUsage.rss + memUsage.heapTotal)) * 100,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal
      },
      database: {
        activeConnections: 1, // Would track actual connections
        totalQueries: this.counters.totalQueries,
        avgQueryTime,
        slowQueries: this.counters.slowQueries
      },
      api: {
        totalRequests: this.counters.totalRequests,
        avgResponseTime,
        errorRate,
        throughput: this.calculateThroughput()
      },
      cache: {
        hitRate: cacheHitRate,
        missRate: cacheMissRate,
        evictions: this.counters.cacheEvictions,
        totalKeys: this.counters.cacheHits + this.counters.cacheMisses
      }
    };
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(startDate?: Date, endDate?: Date, limit: number = 1000): MetricsData[] {
    let metrics = this.metrics;

    if (startDate) {
      metrics = metrics.filter(m => m.timestamp >= startDate);
    }

    if (endDate) {
      metrics = metrics.filter(m => m.timestamp <= endDate);
    }

    return metrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get performance metrics history
   */
  getPerformanceHistory(limit: number = 100): PerformanceMetrics[] {
    return this.performanceMetrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    checks: Record<string, { status: string; message: string; value?: number }>;
  } {
    const metrics = this.getCurrentMetrics();
    const checks: Record<string, { status: string; message: string; value?: number }> = {};

    // Memory check
    if (metrics.memory.percentage < 80) {
      checks.memory = { status: 'healthy', message: 'Memory usage normal', value: metrics.memory.percentage };
    } else if (metrics.memory.percentage < 90) {
      checks.memory = { status: 'warning', message: 'Memory usage high', value: metrics.memory.percentage };
    } else {
      checks.memory = { status: 'critical', message: 'Memory usage critical', value: metrics.memory.percentage };
    }

    // Error rate check
    if (metrics.api.errorRate < 1) {
      checks.errorRate = { status: 'healthy', message: 'Error rate normal', value: metrics.api.errorRate };
    } else if (metrics.api.errorRate < 5) {
      checks.errorRate = { status: 'warning', message: 'Error rate elevated', value: metrics.api.errorRate };
    } else {
      checks.errorRate = { status: 'critical', message: 'Error rate too high', value: metrics.api.errorRate };
    }

    // Response time check
    if (metrics.api.avgResponseTime < 100) {
      checks.responseTime = { status: 'healthy', message: 'Response time good', value: metrics.api.avgResponseTime };
    } else if (metrics.api.avgResponseTime < 500) {
      checks.responseTime = { status: 'warning', message: 'Response time slow', value: metrics.api.avgResponseTime };
    } else {
      checks.responseTime = { status: 'critical', message: 'Response time too slow', value: metrics.api.avgResponseTime };
    }

    // Determine overall status
    const statuses = Object.values(checks).map(check => check.status);
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (statuses.includes('critical')) {
      overallStatus = 'critical';
    } else if (statuses.includes('warning')) {
      overallStatus = 'warning';
    }

    return { status: overallStatus, checks };
  }

  private collectPerformanceMetrics(): void {
    const metrics = this.getCurrentMetrics();
    this.performanceMetrics.push(metrics);

    // Keep only recent performance metrics (last 1000)
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics.shift();
    }

    this.emit('performanceMetricsCollected', metrics);
  }

  private calculateThroughput(): number {
    // Calculate requests per minute based on recent activity
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentRequests = this.metrics.filter(m =>
      m.timestamp >= oneMinuteAgo && m.metadata.type === 'api_request'
    );
    return recentRequests.length;
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheusMetrics(): string {
    const metrics = this.getCurrentMetrics();
    const lines: string[] = [];

    // API metrics
    lines.push(`# HELP cnd_api_requests_total Total number of API requests`);
    lines.push(`# TYPE cnd_api_requests_total counter`);
    lines.push(`cnd_api_requests_total ${metrics.api.totalRequests}`);

    lines.push(`# HELP cnd_api_response_time_avg Average API response time in milliseconds`);
    lines.push(`# TYPE cnd_api_response_time_avg gauge`);
    lines.push(`cnd_api_response_time_avg ${metrics.api.avgResponseTime}`);

    lines.push(`# HELP cnd_api_error_rate API error rate percentage`);
    lines.push(`# TYPE cnd_api_error_rate gauge`);
    lines.push(`cnd_api_error_rate ${metrics.api.errorRate}`);

    // Memory metrics
    lines.push(`# HELP cnd_memory_usage_percentage Memory usage percentage`);
    lines.push(`# TYPE cnd_memory_usage_percentage gauge`);
    lines.push(`cnd_memory_usage_percentage ${metrics.memory.percentage}`);

    // Database metrics
    lines.push(`# HELP cnd_db_queries_total Total number of database queries`);
    lines.push(`# TYPE cnd_db_queries_total counter`);
    lines.push(`cnd_db_queries_total ${metrics.database.totalQueries}`);

    lines.push(`# HELP cnd_db_slow_queries_total Total number of slow database queries`);
    lines.push(`# TYPE cnd_db_slow_queries_total counter`);
    lines.push(`cnd_db_slow_queries_total ${metrics.database.slowQueries}`);

    // Cache metrics
    lines.push(`# HELP cnd_cache_hit_rate Cache hit rate percentage`);
    lines.push(`# TYPE cnd_cache_hit_rate gauge`);
    lines.push(`cnd_cache_hit_rate ${metrics.cache.hitRate}`);

    return lines.join('\n');
  }
}
