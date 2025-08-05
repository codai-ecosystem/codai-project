const os = require('os');
const process = require('process');
const client = require('prom-client');

class PerformanceMonitor {
  constructor() {
    this.register = new client.Registry();
    this.setupMetrics();
    this.startMonitoring();
  }
  
  setupMetrics() {
    // CPU Usage
    this.cpuUsage = new client.Gauge({
      name: 'process_cpu_usage_percent',
      help: 'CPU usage percentage',
      collect() {
        const usage = process.cpuUsage();
        const total = usage.user + usage.system;
        this.set(total / 1000000); // Convert to seconds
      }
    });
    
    // Memory Usage
    this.memoryUsage = new client.Gauge({
      name: 'process_memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
      collect() {
        const usage = process.memoryUsage();
        this.set({ type: 'rss' }, usage.rss);
        this.set({ type: 'heapUsed' }, usage.heapUsed);
        this.set({ type: 'heapTotal' }, usage.heapTotal);
        this.set({ type: 'external' }, usage.external);
      }
    });
    
    // Event Loop Lag
    this.eventLoopLag = new client.Histogram({
      name: 'event_loop_lag_seconds',
      help: 'Event loop lag in seconds',
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5]
    });
    
    // HTTP Request Duration
    this.httpDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10]
    });
    
    // Business Metrics
    this.activeUsers = new client.Gauge({
      name: 'active_users_current',
      help: 'Current active users'
    });
    
    this.requestRate = new client.Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status']
    });
    
    // Register all metrics
    this.register.registerMetric(this.cpuUsage);
    this.register.registerMetric(this.memoryUsage);
    this.register.registerMetric(this.eventLoopLag);
    this.register.registerMetric(this.httpDuration);
    this.register.registerMetric(this.activeUsers);
    this.register.registerMetric(this.requestRate);
  }
  
  startMonitoring() {
    // Monitor event loop lag
    let start = process.hrtime.bigint();
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1e9;
      this.eventLoopLag.observe(lag);
      start = process.hrtime.bigint();
    });
    
    // Schedule next monitoring cycle
    setTimeout(() => this.startMonitoring(), 1000);
  }
  
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;
        
        this.httpDuration
          .labels(req.method, route, res.statusCode)
          .observe(duration);
          
        this.requestRate
          .labels(req.method, route, res.statusCode)
          .inc();
      });
      
      next();
    };
  }
  
  getMetrics() {
    return this.register.metrics();
  }
}

module.exports = PerformanceMonitor;
