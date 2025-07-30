// 📊 Metrics Collection System for METU

export interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

export interface AggregatedMetrics {
  [key: string]: {
    count: number;
    sum: number;
    min: number;
    max: number;
    avg: number;
    percentiles: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
    };
  };
}

export class MetricsCollector {
  private metrics: Map<string, MetricData[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private readonly maxHistorySize = 10000;
  private readonly retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    // Initialize core metrics
    this.initializeMetrics();

    // Start cleanup interval
    setInterval(() => this.cleanup(), 60 * 60 * 1000); // Cleanup every hour
  }

  private initializeMetrics() {
    // Initialize counters
    this.counters.set('http_requests_total', 0);
    this.counters.set('http_errors_total', 0);
    this.counters.set('voice_interactions_total', 0);
    this.counters.set('device_discoveries_total', 0);
    this.counters.set('mcp_operations_total', 0);
    this.counters.set('database_operations_total', 0);

    // Initialize gauges
    this.gauges.set('connected_devices', 0);
    this.gauges.set('active_sessions', 0);
    this.gauges.set('memory_usage_bytes', 0);
    this.gauges.set('cpu_usage_percent', 0);
    this.gauges.set('uptime_seconds', 0);

    // Initialize histograms
    this.histograms.set('http_request_duration_ms', []);
    this.histograms.set('voice_processing_duration_ms', []);
    this.histograms.set('database_query_duration_ms', []);
    this.histograms.set('mcp_operation_duration_ms', []);
  }

  // Counter methods
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>) {
    const currentValue = this.counters.get(name) || 0;
    this.counters.set(name, currentValue + value);

    this.recordMetric({
      name,
      value: currentValue + value,
      timestamp: Date.now(),
      labels
    });
  }

  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  // Gauge methods
  setGauge(name: string, value: number, labels?: Record<string, string>) {
    this.gauges.set(name, value);

    this.recordMetric({
      name,
      value,
      timestamp: Date.now(),
      labels
    });
  }

  getGauge(name: string): number {
    return this.gauges.get(name) || 0;
  }

  // Histogram methods
  recordLatency(name: string, duration: number, labels?: Record<string, string>) {
    let histogram = this.histograms.get(name) || [];
    histogram.push(duration);

    // Keep only recent values
    if (histogram.length > this.maxHistorySize) {
      histogram = histogram.slice(-this.maxHistorySize);
    }

    this.histograms.set(name, histogram);

    this.recordMetric({
      name,
      value: duration,
      timestamp: Date.now(),
      labels
    });
  }

  private recordMetric(metric: MetricData) {
    let metricHistory = this.metrics.get(metric.name) || [];
    metricHistory.push(metric);

    // Keep only recent metrics
    if (metricHistory.length > this.maxHistorySize) {
      metricHistory = metricHistory.slice(-this.maxHistorySize);
    }

    this.metrics.set(metric.name, metricHistory);
  }

  // Memory usage tracking
  recordMemoryUsage() {
    const memUsage = process.memoryUsage();
    this.setGauge('memory_usage_bytes', memUsage.rss);
    this.setGauge('heap_used_bytes', memUsage.heapUsed);
    this.setGauge('heap_total_bytes', memUsage.heapTotal);
  }

  // CPU usage tracking
  recordCPUUsage() {
    const loadAvg = require('os').loadavg();
    const cpuCount = require('os').cpus().length;
    const cpuUsage = (loadAvg[0] / cpuCount) * 100;
    this.setGauge('cpu_usage_percent', cpuUsage);
  }

  // Uptime tracking
  updateUptime() {
    this.setGauge('uptime_seconds', process.uptime());
  }

  // Get aggregated metrics
  getAggregatedMetrics(): AggregatedMetrics {
    const aggregated: AggregatedMetrics = {};

    for (const [name, values] of this.histograms) {
      if (values.length === 0) continue;

      const sorted = [...values].sort((a, b) => a - b);
      const sum = values.reduce((a, b) => a + b, 0);

      aggregated[name] = {
        count: values.length,
        sum,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: sum / values.length,
        percentiles: {
          p50: this.percentile(sorted, 50),
          p90: this.percentile(sorted, 90),
          p95: this.percentile(sorted, 95),
          p99: this.percentile(sorted, 99)
        }
      };
    }

    return aggregated;
  }

  private percentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;

    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sortedArray[lower];
    }

    return sortedArray[lower] + (sortedArray[upper] - sortedArray[lower]) * (index - lower);
  }

  // Get all metrics for export
  getMetrics() {
    this.recordMemoryUsage();
    this.recordCPUUsage();
    this.updateUptime();

    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: this.getAggregatedMetrics(),
      timestamp: new Date().toISOString()
    };
  }

  // Get metrics in Prometheus format
  getPrometheusMetrics(): string {
    let output = '';

    // Export counters
    for (const [name, value] of this.counters) {
      output += `# HELP metu_${name} Total count of ${name.replace(/_/g, ' ')}\n`;
      output += `# TYPE metu_${name} counter\n`;
      output += `metu_${name} ${value}\n\n`;
    }

    // Export gauges
    for (const [name, value] of this.gauges) {
      output += `# HELP metu_${name} Current value of ${name.replace(/_/g, ' ')}\n`;
      output += `# TYPE metu_${name} gauge\n`;
      output += `metu_${name} ${value}\n\n`;
    }

    // Export histogram summaries
    const aggregated = this.getAggregatedMetrics();
    for (const [name, stats] of Object.entries(aggregated)) {
      output += `# HELP metu_${name}_summary Summary statistics for ${name.replace(/_/g, ' ')}\n`;
      output += `# TYPE metu_${name}_summary summary\n`;
      output += `metu_${name}_summary{quantile="0.5"} ${stats.percentiles.p50}\n`;
      output += `metu_${name}_summary{quantile="0.9"} ${stats.percentiles.p90}\n`;
      output += `metu_${name}_summary{quantile="0.95"} ${stats.percentiles.p95}\n`;
      output += `metu_${name}_summary{quantile="0.99"} ${stats.percentiles.p99}\n`;
      output += `metu_${name}_summary_sum ${stats.sum}\n`;
      output += `metu_${name}_summary_count ${stats.count}\n\n`;
    }

    return output;
  }

  // Time series data for specific metric
  getTimeSeriesData(metricName: string, duration: number = 3600000): MetricData[] {
    const metrics = this.metrics.get(metricName) || [];
    const cutoff = Date.now() - duration;

    return metrics.filter(metric => metric.timestamp >= cutoff);
  }

  // Cleanup old metrics
  private cleanup() {
    const cutoff = Date.now() - this.retentionPeriod;

    for (const [name, metrics] of this.metrics) {
      const filtered = metrics.filter(metric => metric.timestamp >= cutoff);
      this.metrics.set(name, filtered);
    }

    // Cleanup histograms
    for (const [name, values] of this.histograms) {
      if (values.length > this.maxHistorySize) {
        this.histograms.set(name, values.slice(-this.maxHistorySize));
      }
    }
  }

  // Reset all metrics (useful for testing)
  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.metrics.clear();
    this.initializeMetrics();
  }

  // Export metrics to JSON
  exportToJSON(): string {
    return JSON.stringify({
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: this.getAggregatedMetrics(),
      timeSeries: Object.fromEntries(this.metrics),
      exportTime: new Date().toISOString()
    }, null, 2);
  }

  // Import metrics from JSON (for restoration)
  importFromJSON(jsonData: string) {
    try {
      const data = JSON.parse(jsonData);

      if (data.counters) {
        this.counters = new Map(Object.entries(data.counters));
      }

      if (data.gauges) {
        this.gauges = new Map(Object.entries(data.gauges));
      }

      if (data.timeSeries) {
        this.metrics = new Map(Object.entries(data.timeSeries));
      }

      console.log('✅ Metrics imported successfully');
    } catch (error) {
      console.error('❌ Failed to import metrics:', error);
    }
  }
}
