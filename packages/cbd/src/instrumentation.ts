// Class-based module\nexport interface ModuleConfig {\n  [key: string]: any;\n}\n\nimport PerformanceMonitor from '../../performance/performance-monitor.js';
import promClient from 'prom-client';

class CBDInstrumentation {
  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.setupCustomMetrics();
  }
  
  setupCustomMetrics() {
    // Database operation metrics
    this.dbOperations = new promClient.Counter({
      name: 'cbd_operations_total',
      help: 'Total database operations',
      labelNames: ['operation', 'collection', 'status']
    });
    
    this.queryDuration = new promClient.Histogram({
      name: 'cbd_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation', 'collection'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5]
    });
    
    this.activeConnections = new promClient.Gauge({
      name: 'cbd_active_connections',
      help: 'Number of active database connections'
    });
    
    this.cacheHitRate = new promClient.Gauge({
      name: 'cbd_cache_hit_rate',
      help: 'Cache hit rate percentage'
    });
    
    // Register metrics
    promClient.register.registerMetric(this.dbOperations);
    promClient.register.registerMetric(this.queryDuration);
    promClient.register.registerMetric(this.activeConnections);
    promClient.register.registerMetric(this.cacheHitRate);
  }
  
  recordOperation(operation, collection, duration, status = 'success') {
    this.dbOperations.labels(operation, collection, status).inc();
    this.queryDuration.labels(operation, collection).observe(duration / 1000);
  }
  
  updateActiveConnections(count) {
    this.activeConnections.set(count);
  }
  
  updateCacheHitRate(rate) {
    this.cacheHitRate.set(rate * 100);
  }
  
  getMiddleware() {
    return this.performanceMonitor.middleware();
  }
  
  getMetrics() {
    return promClient.register.metrics();
  }
}

export default CBDInstrumentation;

