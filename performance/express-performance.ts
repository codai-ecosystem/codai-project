/**
 * Express Performance Optimization Middleware
 * Comprehensive performance enhancements for CODAI backends
 */

import express from 'express';
import compression from 'compression';

// Response compression middleware
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress if > 1KB
});

// Response caching middleware
export const cacheMiddleware = (duration: number = 300) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Set cache headers
    res.setHeader('Cache-Control', `public, max-age=${duration}`);
    res.setHeader('Expires', new Date(Date.now() + duration * 1000).toUTCString());
    
    // Add ETag for conditional requests
    const originalSend = res.send;
    res.send = function(body) {
      if (body && typeof body === 'string') {
        const etag = `"${Buffer.from(body).toString('base64').slice(0, 10)}"`;
        res.setHeader('ETag', etag);
        
        if (req.headers['if-none-match'] === etag) {
          res.status(304).end();
          return res;
        }
      }
      return originalSend.call(this, body);
    };
    
    next();
  };
};

// Request timeout middleware
export const timeoutMiddleware = (timeout: number = 30000) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setTimeout(timeout, () => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request Timeout',
          message: `Request exceeded ${timeout}ms timeout limit`
        });
      }
    });
    next();
  };
};

// Request size limiting middleware
export const requestSizeLimit = (limit: string = '10mb') => {
  return express.json({ limit });
};

// Rate limiting with memory store (upgrade to Redis in production)
const rateLimitStore = new Map();

export const rateLimitMiddleware = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  max: number = 100 // requests per window
) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (rateLimitStore.has(key)) {
      const requests = rateLimitStore.get(key).filter((time: number) => time > windowStart);
      rateLimitStore.set(key, requests);
    } else {
      rateLimitStore.set(key, []);
    }
    
    const requests = rateLimitStore.get(key);
    
    if (requests.length >= max) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000)} seconds.`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
      return;
    }
    
    requests.push(now);
    rateLimitStore.set(key, requests);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - requests.length);
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
    
    next();
  };
};

// Request logging with performance metrics
export const performanceLoggingMiddleware = (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  const startTime = process.hrtime.bigint();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log performance data
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration.toFixed(2)}ms`);
    
    // Add performance headers
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    
    return originalEnd.apply(this, args);
  };
  
  next();
};

// Memory usage monitoring
export const memoryMonitoringMiddleware = (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  const memUsage = process.memoryUsage();
  
  // Log high memory usage
  if (memUsage.heapUsed > 100 * 1024 * 1024) { // > 100MB
    console.warn(`High memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  }
  
  // Add memory info to response headers (development only)
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('X-Memory-Heap-Used', Math.round(memUsage.heapUsed / 1024 / 1024));
    res.setHeader('X-Memory-Heap-Total', Math.round(memUsage.heapTotal / 1024 / 1024));
  }
  
  next();
};

// Connection pooling helper
export class ConnectionPool {
  private connections: any[] = [];
  private maxConnections: number;
  private currentConnections: number = 0;
  
  constructor(maxConnections: number = 10) {
    this.maxConnections = maxConnections;
  }
  
  async getConnection(): Promise<any> {
    if (this.connections.length > 0) {
      return this.connections.pop();
    }
    
    if (this.currentConnections >= this.maxConnections) {
      throw new Error('Connection pool exhausted');
    }
    
    this.currentConnections++;
    // Create new connection (implement based on your database)
    return this.createConnection();
  }
  
  releaseConnection(connection: any): void {
    if (this.connections.length < this.maxConnections / 2) {
      this.connections.push(connection);
    } else {
      this.closeConnection(connection);
      this.currentConnections--;
    }
  }
  
  private createConnection(): any {
    // Implement based on your database
    return {};
  }
  
  private closeConnection(connection: any): void {
    // Implement based on your database
  }
}

// Database query optimization helper
export class QueryOptimizer {
  private queryCache = new Map();
  private cacheTimeout: number;
  
  constructor(cacheTimeoutMs: number = 5 * 60 * 1000) { // 5 minutes
    this.cacheTimeout = cacheTimeoutMs;
  }
  
  async executeQuery(query: string, params: any[] = []): Promise<any> {
    const cacheKey = `${query}:${JSON.stringify(params)}`;
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.result;
    }
    
    // Execute query (implement based on your database)
    const result = await this.runQuery(query, params);
    
    // Cache result
    this.queryCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    return result;
  }
  
  private async runQuery(query: string, params: any[]): Promise<any> {
    // Implement based on your database
    return [];
  }
  
  clearCache(): void {
    this.queryCache.clear();
  }
}

// API response optimization
export const optimizedJsonResponse = (
  data: any, 
  req: express.Request, 
  res: express.Response
) => {
  // Add performance headers
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Optimize large responses
  if (typeof data === 'object' && Array.isArray(data) && data.length > 1000) {
    // Paginate large datasets
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    const paginatedData = data.slice(start, end);
    
    return res.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        pages: Math.ceil(data.length / limit)
      }
    });
  }
  
  return res.json(data);
};

// Express app performance setup
export const setupPerformanceMiddleware = (app: express.Application) => {
  // Basic performance middleware
  app.use(compressionMiddleware);
  app.use(timeoutMiddleware(30000));
  app.use(requestSizeLimit('10mb'));
  app.use(performanceLoggingMiddleware);
  app.use(memoryMonitoringMiddleware);
  
  // Rate limiting for API routes
  app.use('/api/', rateLimitMiddleware(15 * 60 * 1000, 1000)); // 1000 requests per 15 minutes
  
  // Caching for static content
  app.use('/static', cacheMiddleware(86400)); // 24 hours
  app.use('/assets', cacheMiddleware(86400)); // 24 hours
  
  // Health check endpoint with performance info
  app.get('/health', (req, res) => {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      memory: {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
      },
      performance: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    });
  });
  
  return app;
};

export default {
  compressionMiddleware,
  cacheMiddleware,
  timeoutMiddleware,
  requestSizeLimit,
  rateLimitMiddleware,
  performanceLoggingMiddleware,
  memoryMonitoringMiddleware,
  ConnectionPool,
  QueryOptimizer,
  optimizedJsonResponse,
  setupPerformanceMiddleware,
};
