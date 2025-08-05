const PerformanceMonitor = require('../../performance/performance-monitor.js');
const promClient = require('prom-client');

class GatewayInstrumentation {
  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.setupCustomMetrics();
  }
  
  setupCustomMetrics() {
    // Request metrics
    this.requestsTotal = new promClient.Counter({
      name: 'gateway_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status']
    });
    
    this.requestDuration = new promClient.Histogram({
      name: 'gateway_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
    });
    
    this.concurrentRequests = new promClient.Gauge({
      name: 'gateway_concurrent_requests',
      help: 'Number of concurrent requests'
    });
    
    this.rateLimitHits = new promClient.Counter({
      name: 'gateway_rate_limit_hits_total',
      help: 'Total rate limit hits',
      labelNames: ['endpoint', 'user_type']
    });
    
    // Register metrics
    promClient.register.registerMetric(this.requestsTotal);
    promClient.register.registerMetric(this.requestDuration);
    promClient.register.registerMetric(this.concurrentRequests);
    promClient.register.registerMetric(this.rateLimitHits);
  }
  
  getMiddleware() {
    let currentRequests = 0;
    
    return (req, res, next) => {
      const start = Date.now();
      currentRequests++;
      this.concurrentRequests.set(currentRequests);
      
      // Apply performance monitoring
      this.performanceMonitor.middleware()(req, res, () => {});
      
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;
        
        this.requestsTotal.labels(req.method, route, res.statusCode).inc();
        this.requestDuration.labels(req.method, route).observe(duration);
        
        currentRequests--;
        this.concurrentRequests.set(currentRequests);
      });
      
      next();
    };
  }
  
  recordRateLimitHit(endpoint, userType) {
    this.rateLimitHits.labels(endpoint, userType).inc();
  }
  
  getMetrics() {
    return promClient.register.metrics();
  }
}

module.exports = GatewayInstrumentation;
