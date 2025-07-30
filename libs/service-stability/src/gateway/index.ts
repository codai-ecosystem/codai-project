/**
 * Gateway Optimizer
 * 
 * Advanced API gateway with load balancing, circuit breaking, and failover capabilities
 * Provides intelligent routing, rate limiting, and performance optimization
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { EventEmitter } from 'events';
import axios from 'axios';

export interface GatewayConfig {
  port: number;
  loadBalancing: LoadBalancerConfig;
  circuitBreaker: CircuitBreakerConfig;
  rateLimit: RateLimitConfig;
  cors?: {
    enabled: boolean;
    origins: string[];
  };
  compression?: boolean;
  security?: {
    requireAuth: boolean;
    apiKeyHeader?: string;
  };
}

export interface LoadBalancerConfig {
  algorithm: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
  healthCheckEnabled: boolean;
  retryAttempts: number;
  timeout: number;
}

export interface RouteConfig {
  path: string;
  serviceName: string;
  targets: ServiceTarget[];
  methods: string[];
  middleware?: string[];
  caching?: {
    enabled: boolean;
    ttl: number;
  };
}

export interface ServiceTarget {
  url: string;
  weight: number;
  healthy: boolean;
  connections: number;
  responseTime: number;
}

export interface FailoverConfig {
  enabled: boolean;
  maxFailures: number;
  recoveryTime: number;
  backupTargets: ServiceTarget[];
}

export interface ProxyRule {
  id: string;
  pattern: string;
  target: string;
  rewrite?: string;
  headers?: Record<string, string>;
}

export interface CircuitBreakerConfig {
  threshold: number;
  timeout: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface GatewayMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  activeConnections: number;
  circuitBreakerTrips: number;
  rateLimitHits: number;
  uptime: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
  nextAttempt: number;
}

export class GatewayOptimizer extends EventEmitter {
  private app: Express;
  private server: any;
  private config: GatewayConfig;
  private routes: Map<string, RouteConfig> = new Map();
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private metrics: GatewayMetrics;
  private targetIndex: Map<string, number> = new Map();
  private connectionCounts: Map<string, number> = new Map();
  private running: boolean = false;

  constructor(config: GatewayConfig) {
    super();
    this.config = config;
    this.app = express();
    this.metrics = this.initializeMetrics();
    this.setupMiddleware();
  }

  private initializeMetrics(): GatewayMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      activeConnections: 0,
      circuitBreakerTrips: 0,
      rateLimitHits: 0,
      uptime: 0
    };
  }

  private setupMiddleware(): void {
    // CORS middleware
    if (this.config.cors?.enabled) {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        const origin = req.headers.origin as string;
        if (this.config.cors!.origins.includes('*') || this.config.cors!.origins.includes(origin)) {
          res.header('Access-Control-Allow-Origin', origin);
          res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
          res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        next();
      });
    }

    // Compression middleware
    if (this.config.compression) {
      const compression = require('compression');
      this.app.use(compression());
    }

    // Security middleware
    if (this.config.security?.requireAuth) {
      this.app.use(this.authMiddleware.bind(this));
    }

    // Rate limiting
    const limiter = rateLimit(this.config.rateLimit);
    this.app.use(limiter);

    // Metrics middleware
    this.app.use(this.metricsMiddleware.bind(this));

    // Health check endpoint
    this.app.get('/health', this.healthCheckHandler.bind(this));
    this.app.get('/metrics', this.metricsHandler.bind(this));
  }

  /**
   * Start the gateway server
   */
  async start(): Promise<void> {
    if (this.running) {
      console.warn('Gateway is already running');
      return;
    }

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.port, () => {
        this.running = true;
        this.metrics.uptime = Date.now();

        // Start health checking
        this.startHealthChecking();

        console.log(`✅ Gateway Optimizer started on port ${this.config.port}`);
        this.emit('started');
        resolve();
      });

      this.server.on('error', (error: Error) => {
        reject(error);
      });
    });
  }

  /**
   * Stop the gateway server
   */
  async stop(): Promise<void> {
    if (!this.running) {
      console.warn('Gateway is not running');
      return;
    }

    return new Promise<void>((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.running = false;
          console.log('✅ Gateway Optimizer stopped');
          this.emit('stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Add a route configuration
   */
  async addRoute(service: any): Promise<void> {
    const route: RouteConfig = {
      path: service.path || `/${service.name}`,
      serviceName: service.name,
      targets: [{
        url: service.url,
        weight: 1,
        healthy: true,
        connections: 0,
        responseTime: 0
      }],
      methods: service.methods || ['GET', 'POST', 'PUT', 'DELETE'],
      middleware: service.middleware || [],
      caching: service.caching
    };

    this.routes.set(service.name, route);
    this.setupRouteProxy(route);

    console.log(`✅ Route added for service ${service.name} at ${route.path}`);
  }

  /**
   * Remove a route
   */
  async removeRoute(serviceName: string): Promise<void> {
    this.routes.delete(serviceName);
    this.circuitBreakers.delete(serviceName);
    this.targetIndex.delete(serviceName);
    this.connectionCounts.delete(serviceName);

    console.log(`✅ Route removed for service ${serviceName}`);
  }

  /**
   * Activate failover for a service
   */
  async activateFailover(serviceName: string): Promise<void> {
    const route = this.routes.get(serviceName);
    if (!route) {
      throw new Error(`Service ${serviceName} not found`);
    }

    // Mark primary targets as unhealthy
    route.targets.forEach(target => {
      target.healthy = false;
    });

    // Add backup targets if configured
    const failoverConfig = this.getFailoverConfig(serviceName);
    if (failoverConfig?.backupTargets) {
      route.targets.push(...failoverConfig.backupTargets);
    }

    console.log(`🚨 Failover activated for service ${serviceName}`);
    this.emit('failover', { serviceName, timestamp: new Date().toISOString() });
  }

  /**
   * Get gateway status
   */
  async getStatus(): Promise<any> {
    return {
      status: this.running ? 'healthy' : 'stopped',
      port: this.config.port,
      routes: this.routes.size,
      uptime: this.running ? Date.now() - this.metrics.uptime : 0,
      metrics: this.metrics,
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([service, state]) => ({
        service,
        state: state.state,
        failures: state.failures
      }))
    };
  }

  /**
   * Get gateway metrics
   */
  async getMetrics(): Promise<GatewayMetrics> {
    return {
      ...this.metrics,
      uptime: this.running ? Date.now() - this.metrics.uptime : 0
    };
  }

  private setupRouteProxy(route: RouteConfig): void {
    const proxyOptions: Options = {
      target: '', // Will be set dynamically
      changeOrigin: true,
      pathRewrite: (path: string) => {
        return path.replace(new RegExp(`^${route.path}`), '');
      },
      router: (req: Request) => {
        const target = this.selectTarget(route.serviceName);
        return target ? target.url : route.targets[0]?.url;
      },
      onProxyReq: (proxyReq, req, res) => {
        const startTime = Date.now();
        (req as any).__startTime = startTime;

        const serviceName = route.serviceName;
        const currentConnections = this.connectionCounts.get(serviceName) || 0;
        this.connectionCounts.set(serviceName, currentConnections + 1);
      },
      onProxyRes: (proxyRes, req, res) => {
        const responseTime = Date.now() - (req as any).__startTime;
        const serviceName = route.serviceName;

        // Update metrics
        this.updateResponseTime(serviceName, responseTime);

        // Decrease connection count
        const currentConnections = this.connectionCounts.get(serviceName) || 0;
        this.connectionCounts.set(serviceName, Math.max(0, currentConnections - 1));

        // Update circuit breaker
        if (proxyRes.statusCode && proxyRes.statusCode >= 500) {
          this.recordFailure(serviceName);
        } else {
          this.recordSuccess(serviceName);
        }
      },
      onError: (err, req, res) => {
        const serviceName = route.serviceName;
        this.recordFailure(serviceName);

        // Decrease connection count
        const currentConnections = this.connectionCounts.get(serviceName) || 0;
        this.connectionCounts.set(serviceName, Math.max(0, currentConnections - 1));

        res.status(503).json({
          error: 'Service temporarily unavailable',
          service: serviceName,
          timestamp: new Date().toISOString()
        });
      }
    };

    // Create proxy middleware with circuit breaker
    const proxy = createProxyMiddleware(proxyOptions);
    const circuitBreakerProxy = this.wrapWithCircuitBreaker(proxy, route.serviceName);

    // Apply route-specific middleware
    const middlewares = [circuitBreakerProxy];

    // Register route for all specified methods
    for (const method of route.methods) {
      (this.app as any)[method.toLowerCase()](`${route.path}/*`, ...middlewares);
    }
  }

  private wrapWithCircuitBreaker(proxy: any, serviceName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const circuitBreaker = this.getCircuitBreaker(serviceName);

      if (circuitBreaker.state === 'open') {
        if (Date.now() > circuitBreaker.nextAttempt) {
          circuitBreaker.state = 'half-open';
        } else {
          return res.status(503).json({
            error: 'Circuit breaker is open',
            service: serviceName,
            nextAttempt: new Date(circuitBreaker.nextAttempt).toISOString()
          });
        }
      }

      proxy(req, res, next);
    };
  }

  private selectTarget(serviceName: string): ServiceTarget | null {
    const route = this.routes.get(serviceName);
    if (!route || route.targets.length === 0) {
      return null;
    }

    const healthyTargets = route.targets.filter(target => target.healthy);
    if (healthyTargets.length === 0) {
      return null;
    }

    switch (this.config.loadBalancing.algorithm) {
      case 'round-robin':
        return this.selectRoundRobin(serviceName, healthyTargets);
      case 'least-connections':
        return this.selectLeastConnections(healthyTargets);
      case 'weighted':
        return this.selectWeighted(healthyTargets);
      case 'ip-hash':
        return this.selectIpHash(serviceName, healthyTargets);
      default:
        return healthyTargets[0];
    }
  }

  private selectRoundRobin(serviceName: string, targets: ServiceTarget[]): ServiceTarget {
    const currentIndex = this.targetIndex.get(serviceName) || 0;
    const nextIndex = (currentIndex + 1) % targets.length;
    this.targetIndex.set(serviceName, nextIndex);
    return targets[currentIndex];
  }

  private selectLeastConnections(targets: ServiceTarget[]): ServiceTarget {
    return targets.reduce((least, current) =>
      current.connections < least.connections ? current : least
    );
  }

  private selectWeighted(targets: ServiceTarget[]): ServiceTarget {
    const totalWeight = targets.reduce((sum, target) => sum + target.weight, 0);
    let random = Math.random() * totalWeight;

    for (const target of targets) {
      random -= target.weight;
      if (random <= 0) {
        return target;
      }
    }

    return targets[0];
  }

  private selectIpHash(serviceName: string, targets: ServiceTarget[]): ServiceTarget {
    // Simplified IP hash - in production, use actual client IP
    const hash = serviceName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const index = Math.abs(hash) % targets.length;
    return targets[index];
  }

  private getCircuitBreaker(serviceName: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed',
        nextAttempt: 0
      });
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  private recordFailure(serviceName: string): void {
    const circuitBreaker = this.getCircuitBreaker(serviceName);
    circuitBreaker.failures++;
    circuitBreaker.lastFailureTime = Date.now();

    if (circuitBreaker.failures >= this.config.circuitBreaker.threshold) {
      circuitBreaker.state = 'open';
      circuitBreaker.nextAttempt = Date.now() + this.config.circuitBreaker.resetTimeout;
      this.metrics.circuitBreakerTrips++;

      console.warn(`🚨 Circuit breaker opened for service ${serviceName}`);
      this.emit('circuitBreakerOpen', { serviceName, failures: circuitBreaker.failures });
    }

    this.metrics.failedRequests++;
  }

  private recordSuccess(serviceName: string): void {
    const circuitBreaker = this.getCircuitBreaker(serviceName);

    if (circuitBreaker.state === 'half-open') {
      circuitBreaker.state = 'closed';
      circuitBreaker.failures = 0;
      console.log(`✅ Circuit breaker closed for service ${serviceName}`);
      this.emit('circuitBreakerClosed', { serviceName });
    }

    this.metrics.successfulRequests++;
  }

  private updateResponseTime(serviceName: string, responseTime: number): void {
    const route = this.routes.get(serviceName);
    if (route && route.targets.length > 0) {
      // Update average response time for targets
      route.targets.forEach(target => {
        target.responseTime = (target.responseTime + responseTime) / 2;
      });
    }

    // Update global average response time
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime + responseTime) / 2;
  }

  private authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers[this.config.security?.apiKeyHeader || 'x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    // In production, validate API key against database
    // For now, just check if it exists
    next();
  }

  private metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
    this.metrics.totalRequests++;
    this.metrics.activeConnections++;

    res.on('finish', () => {
      this.metrics.activeConnections--;
    });

    next();
  }

  private healthCheckHandler(req: Request, res: Response): void {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.metrics.uptime,
      routes: this.routes.size,
      metrics: this.metrics
    };

    res.json(health);
  }

  private metricsHandler(req: Request, res: Response): void {
    res.json(this.metrics);
  }

  private startHealthChecking(): void {
    if (!this.config.loadBalancing.healthCheckEnabled) {
      return;
    }

    setInterval(async () => {
      for (const [serviceName, route] of this.routes) {
        for (const target of route.targets) {
          try {
            const response = await axios.get(`${target.url}/health`, {
              timeout: 5000
            });
            target.healthy = response.status === 200;
          } catch (error) {
            target.healthy = false;
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private getFailoverConfig(serviceName: string): FailoverConfig | undefined {
    // In production, this would come from configuration storage
    return {
      enabled: true,
      maxFailures: 3,
      recoveryTime: 60000,
      backupTargets: []
    };
  }
}
