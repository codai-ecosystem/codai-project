// Class-based module
export interface ModuleConfig {
  [key: string]: any;
}

import * as promClient from 'prom-client';

// Create a simple performance monitor interface since the import is failing
interface PerformanceMonitor {
  middleware(): any;
}

class SimplePerfMonitor implements PerformanceMonitor {
  middleware() {
    return (req: any, res: any, next: any) => {
      const start = process.hrtime();
      res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        console.log(`Request completed in ${duration.toFixed(2)}ms`);
      });
      next();
    };
  }
}

class CBDInstrumentation {
  private performanceMonitor: PerformanceMonitor;
  private dbOperations!: promClient.Counter<string>;
  private queryDuration!: promClient.Histogram<string>;
  private activeConnections!: promClient.Gauge<string>;
  private cacheHitRate!: promClient.Gauge<string>;

  constructor() {
    this.performanceMonitor = new SimplePerfMonitor();
    this.setupCustomMetrics();
  }
  
  setupCustomMetrics(): void {
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
  
  recordOperation(operation: string, collection: string, duration: number, status: string = 'success'): void {
    this.dbOperations.labels(operation, collection, status).inc();
    this.queryDuration.labels(operation, collection).observe(duration / 1000);
  }
  
  updateActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }
  
  updateCacheHitRate(rate: number): void {
    this.cacheHitRate.set(rate * 100);
  }
  
  getMiddleware(): any {
    return this.performanceMonitor.middleware();
  }
  
  getMetrics(): Promise<string> {
    return promClient.register.metrics();
  }
}

export default CBDInstrumentation;

