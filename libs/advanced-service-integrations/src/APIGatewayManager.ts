/**
 * CODAI Advanced Service Integrations - API Gateway Manager
 * High-performance API gateway with routing, security, and monitoring
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options as ProxyOptions } from 'http-proxy-middleware';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer, Server } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync } from 'fs';
import { EventEmitter } from 'events';

import {
    APIGatewayConfig,
    RouteDefinition,
    RequestTransformation,
    RequestValidation,
    SecurityConfig,
    LoadBalancingConfig,
    CircuitBreakerConfig,
    IntegrationError
} from './types';

/**
 * API Gateway Manager
 * Provides centralized API routing, security, load balancing, and monitoring
 */
export class APIGatewayManager extends EventEmitter {
    private app: Express;
    private server: Server;
    private config: APIGatewayConfig;
    private routes: Map<string, RouteDefinition> = new Map();
    private serviceProxies: Map<string, any> = new Map();
    private requestCounts: Map<string, number> = new Map();
    private errorCounts: Map<string, number> = new Map();
    private managers: {
        securityManager: any;
        loadBalancerManager: any;
        rateLimitManager: any;
        monitoringManager: any;
    };

    constructor(config: APIGatewayConfig, managers: any) {
        super();
        this.config = config;
        this.managers = managers;
        this.app = express();
        this.initializeMiddleware();
    }

    /**
     * Start the API Gateway
     */
    async start(): Promise<void> {
        try {
            this.emit('gateway:starting');

            // Setup routes
            await this.setupRoutes();

            // Setup error handling
            this.setupErrorHandling();

            // Create server
            this.server = this.config.ssl?.enabled
                ? createHttpsServer({
                    key: readFileSync(this.config.ssl.keyPath),
                    cert: readFileSync(this.config.ssl.certPath),
                    ca: this.config.ssl.caPath ? readFileSync(this.config.ssl.caPath) : undefined
                }, this.app)
                : createServer(this.app);

            // Start listening
            await new Promise<void>((resolve, reject) => {
                this.server.listen(this.config.port, this.config.host, (error?: Error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            this.emit('gateway:started', {
                host: this.config.host,
                port: this.config.port,
                protocol: this.config.protocol
            });

        } catch (error) {
            this.emit('gateway:error', error);
            throw new IntegrationError(
                'GATEWAY_START_FAILED',
                `Failed to start API Gateway: ${error.message}`,
                { error },
                false,
                'server'
            );
        }
    }

    /**
     * Stop the API Gateway
     */
    async stop(): Promise<void> {
        try {
            this.emit('gateway:stopping');

            if (this.server) {
                await new Promise<void>((resolve) => {
                    this.server.close(() => {
                        resolve();
                    });
                });
            }

            // Clear internal state
            this.routes.clear();
            this.serviceProxies.clear();
            this.requestCounts.clear();
            this.errorCounts.clear();

            this.emit('gateway:stopped');

        } catch (error) {
            this.emit('gateway:error', error);
            throw error;
        }
    }

    /**
     * Add a route to the gateway
     */
    addRoute(route: RouteDefinition): void {
        try {
            this.validateRoute(route);

            this.routes.set(route.id, route);
            this.setupRouteHandler(route);

            this.emit('route:added', { routeId: route.id, path: route.path });
        } catch (error) {
            this.emit('route:error', { routeId: route.id, error });
            throw error;
        }
    }

    /**
     * Remove a route from the gateway
     */
    removeRoute(routeId: string): void {
        try {
            const route = this.routes.get(routeId);
            if (!route) {
                throw new IntegrationError(
                    'ROUTE_NOT_FOUND',
                    `Route ${routeId} not found`,
                    { routeId },
                    false,
                    'client'
                );
            }

            this.routes.delete(routeId);
            this.serviceProxies.delete(routeId);

            this.emit('route:removed', { routeId });
        } catch (error) {
            this.emit('route:error', { routeId, error });
            throw error;
        }
    }

    /**
     * Update a route
     */
    updateRoute(routeId: string, updates: Partial<RouteDefinition>): void {
        try {
            const route = this.routes.get(routeId);
            if (!route) {
                throw new IntegrationError(
                    'ROUTE_NOT_FOUND',
                    `Route ${routeId} not found`,
                    { routeId },
                    false,
                    'client'
                );
            }

            const updatedRoute = { ...route, ...updates };
            this.validateRoute(updatedRoute);

            this.routes.set(routeId, updatedRoute);
            this.setupRouteHandler(updatedRoute);

            this.emit('route:updated', { routeId });
        } catch (error) {
            this.emit('route:error', { routeId, error });
            throw error;
        }
    }

    /**
     * Get gateway metrics
     */
    getMetrics(): GatewayMetrics {
        const totalRequests = Array.from(this.requestCounts.values())
            .reduce((sum, count) => sum + count, 0);

        const totalErrors = Array.from(this.errorCounts.values())
            .reduce((sum, count) => sum + count, 0);

        return {
            totalRequests,
            totalErrors,
            errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
            activeRoutes: this.routes.size,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            routeMetrics: this.getRouteMetrics(),
            timestamp: new Date()
        };
    }

    /**
     * Get health status
     */
    getHealthStatus(): GatewayHealthStatus {
        return {
            status: this.server?.listening ? 'healthy' : 'unhealthy',
            uptime: process.uptime(),
            activeRoutes: this.routes.size,
            memoryUsage: process.memoryUsage(),
            lastCheck: new Date()
        };
    }

    // ==================== PRIVATE METHODS ====================

    private initializeMiddleware(): void {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: false, // Allow for flexible CSP
            crossOriginEmbedderPolicy: false
        }));

        // CORS middleware
        if (this.config.cors.enabled) {
            this.app.use(cors({
                origin: this.config.cors.origins,
                methods: this.config.cors.methods,
                allowedHeaders: this.config.cors.headers,
                credentials: this.config.cors.credentials,
                maxAge: this.config.cors.maxAge,
                preflightContinue: this.config.cors.preflightContinue
            }));
        }

        // Compression middleware
        if (this.config.compression.enabled) {
            this.app.use(compression({
                level: this.config.compression.level,
                threshold: this.config.compression.threshold,
                chunkSize: this.config.compression.chunkSize,
                filter: (req, res) => {
                    if (req.headers['x-no-compression']) {
                        return false;
                    }
                    return compression.filter(req, res);
                }
            }));
        }

        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging middleware
        this.app.use(this.requestLoggingMiddleware.bind(this));

        // Rate limiting middleware
        if (this.config.rateLimit.enabled) {
            this.app.use(rateLimit({
                windowMs: this.config.rateLimit.global.windowSize * 1000,
                max: this.config.rateLimit.global.requestsPerSecond *
                    (this.config.rateLimit.global.windowSize / 1000),
                message: 'Too many requests from this IP',
                standardHeaders: true,
                legacyHeaders: false
            }));
        }

        // Custom middleware from configuration
        this.config.middleware
            .sort((a, b) => a.order - b.order)
            .forEach(middleware => {
                if (middleware.enabled) {
                    this.app.use(this.createCustomMiddleware(middleware));
                }
            });
    }

    private async setupRoutes(): Promise<void> {
        // Setup configured routes
        for (const route of this.config.routing.routes) {
            if (route.enabled) {
                this.addRoute(route);
            }
        }

        // Setup health check endpoint
        this.app.get('/_health', (req, res) => {
            const health = this.getHealthStatus();
            res.status(health.status === 'healthy' ? 200 : 503).json(health);
        });

        // Setup metrics endpoint
        this.app.get('/_metrics', (req, res) => {
            const metrics = this.getMetrics();
            res.json(metrics);
        });

        // Setup fallback route
        this.app.use('*', this.handleFallback.bind(this));
    }

    private setupRouteHandler(route: RouteDefinition): void {
        const routePath = route.path;
        const method = route.method.toLowerCase();

        // Remove existing handler if it exists
        if (this.serviceProxies.has(route.id)) {
            // Express doesn't have a direct way to remove middleware,
            // so we'll mark it as disabled in our tracking
            this.serviceProxies.delete(route.id);
        }

        // Create route-specific middleware chain
        const middlewareChain = [
            // Route validation middleware
            this.createValidationMiddleware(route),
            // Route transformation middleware
            this.createTransformationMiddleware(route),
            // Route authentication middleware
            this.createAuthenticationMiddleware(route),
            // Route authorization middleware
            this.createAuthorizationMiddleware(route),
            // Route rate limiting middleware
            this.createRouteRateLimitMiddleware(route),
            // Circuit breaker middleware
            this.createCircuitBreakerMiddleware(route),
            // Proxy middleware
            this.createProxyMiddleware(route)
        ];

        // Apply middleware to route
        if (method === '*') {
            this.app.all(routePath, ...middlewareChain);
        } else {
            (this.app as any)[method](routePath, ...middlewareChain);
        }

        this.serviceProxies.set(route.id, { route, middlewareChain });
    }

    private createValidationMiddleware(route: RouteDefinition) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                if (route.validation?.enabled) {
                    await this.validateRequest(req, route.validation);
                }
                next();
            } catch (error) {
                this.handleValidationError(res, error);
            }
        };
    }

    private createTransformationMiddleware(route: RouteDefinition) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                if (route.transformation) {
                    this.transformRequest(req, route.transformation);
                }
                next();
            } catch (error) {
                this.handleTransformationError(res, error);
            }
        };
    }

    private createAuthenticationMiddleware(route: RouteDefinition) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                // Authentication logic would be implemented here
                // For now, we'll just pass through
                next();
            } catch (error) {
                res.status(401).json({ error: 'Authentication failed' });
            }
        };
    }

    private createAuthorizationMiddleware(route: RouteDefinition) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                // Authorization logic would be implemented here
                // For now, we'll just pass through
                next();
            } catch (error) {
                res.status(403).json({ error: 'Authorization failed' });
            }
        };
    }

    private createRouteRateLimitMiddleware(route: RouteDefinition) {
        return rateLimit({
            windowMs: 60 * 1000, // 1 minute
            max: 100, // Default rate limit
            keyGenerator: (req) => {
                // Generate key based on IP, user, or custom logic
                return req.ip + ':' + route.id;
            },
            handler: (req, res) => {
                this.incrementErrorCount(route.id);
                res.status(429).json({
                    error: 'Rate limit exceeded for this route',
                    routeId: route.id
                });
            }
        });
    }

    private createCircuitBreakerMiddleware(route: RouteDefinition) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                // Check circuit breaker status
                const isOpen = await this.managers.loadBalancerManager
                    ?.isCircuitBreakerOpen?.(route.targetService);

                if (isOpen) {
                    this.incrementErrorCount(route.id);
                    return res.status(503).json({
                        error: 'Service temporarily unavailable',
                        routeId: route.id,
                        serviceId: route.targetService
                    });
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    private createProxyMiddleware(route: RouteDefinition) {
        const proxyOptions: ProxyOptions = {
            target: `http://localhost:4000`, // Placeholder - would be dynamic
            changeOrigin: true,
            pathRewrite: route.targetPath ? {
                [`^${route.path}`]: route.targetPath
            } : undefined,
            timeout: 30000,
            proxyTimeout: 30000,
            onProxyReq: (proxyReq, req, res) => {
                this.incrementRequestCount(route.id);
                this.emit('request:proxied', {
                    routeId: route.id,
                    method: req.method,
                    path: req.path,
                    target: proxyReq.path
                });
            },
            onProxyRes: (proxyRes, req, res) => {
                // Record response metrics
                this.emit('response:received', {
                    routeId: route.id,
                    statusCode: proxyRes.statusCode,
                    responseTime: Date.now() - (req as any).startTime
                });
            },
            onError: (err, req, res) => {
                this.incrementErrorCount(route.id);
                this.emit('proxy:error', {
                    routeId: route.id,
                    error: err.message
                });

                if (!res.headersSent) {
                    res.status(502).json({
                        error: 'Bad Gateway',
                        message: 'Service unavailable',
                        routeId: route.id
                    });
                }
            }
        };

        return createProxyMiddleware(proxyOptions);
    }

    private requestLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
        (req as any).startTime = Date.now();

        this.emit('request:received', {
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
        });

        next();
    }

    private createCustomMiddleware(middlewareConfig: any) {
        return (req: Request, res: Response, next: NextFunction) => {
            // Custom middleware implementation would go here
            // For now, just pass through
            next();
        };
    }

    private setupErrorHandling(): void {
        // 404 handler
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({
                error: 'Not Found',
                message: `Route ${req.method} ${req.path} not found`,
                timestamp: new Date().toISOString()
            });
        });

        // Global error handler
        this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
            this.emit('gateway:error', error);

            res.status(500).json({
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
                timestamp: new Date().toISOString()
            });
        });
    }

    private handleFallback(req: Request, res: Response): void {
        switch (this.config.routing.fallbackBehavior) {
            case 'redirect':
                if (this.config.routing.defaultTarget) {
                    res.redirect(302, this.config.routing.defaultTarget);
                } else {
                    res.status(404).json({ error: 'Route not found' });
                }
                break;

            case 'static':
                res.status(200).json({
                    message: 'API Gateway is running',
                    version: '1.0.0',
                    timestamp: new Date().toISOString()
                });
                break;

            default:
                res.status(404).json({ error: 'Route not found' });
        }
    }

    private validateRoute(route: RouteDefinition): void {
        if (!route.id) {
            throw new IntegrationError(
                'INVALID_ROUTE',
                'Route ID is required',
                { route },
                false,
                'validation'
            );
        }

        if (!route.path) {
            throw new IntegrationError(
                'INVALID_ROUTE',
                'Route path is required',
                { route },
                false,
                'validation'
            );
        }

        if (!route.targetService) {
            throw new IntegrationError(
                'INVALID_ROUTE',
                'Target service is required',
                { route },
                false,
                'validation'
            );
        }
    }

    private async validateRequest(req: Request, validation: RequestValidation): Promise<void> {
        // Request validation logic would be implemented here
        // For now, we'll just pass through
    }

    private transformRequest(req: Request, transformation: RequestTransformation): void {
        // Request transformation logic would be implemented here
        // For now, we'll just pass through
    }

    private handleValidationError(res: Response, error: any): void {
        res.status(400).json({
            error: 'Validation Error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }

    private handleTransformationError(res: Response, error: any): void {
        res.status(500).json({
            error: 'Transformation Error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }

    private incrementRequestCount(routeId: string): void {
        const current = this.requestCounts.get(routeId) || 0;
        this.requestCounts.set(routeId, current + 1);
    }

    private incrementErrorCount(routeId: string): void {
        const current = this.errorCounts.get(routeId) || 0;
        this.errorCounts.set(routeId, current + 1);
    }

    private getRouteMetrics(): RouteMetrics[] {
        return Array.from(this.routes.entries()).map(([routeId, route]) => ({
            routeId,
            path: route.path,
            method: route.method,
            requestCount: this.requestCounts.get(routeId) || 0,
            errorCount: this.errorCounts.get(routeId) || 0,
            enabled: route.enabled
        }));
    }
}

// ==================== INTERFACE DEFINITIONS ====================

export interface GatewayMetrics {
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    activeRoutes: number;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    routeMetrics: RouteMetrics[];
    timestamp: Date;
}

export interface GatewayHealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    uptime: number;
    activeRoutes: number;
    memoryUsage: NodeJS.MemoryUsage;
    lastCheck: Date;
}

export interface RouteMetrics {
    routeId: string;
    path: string;
    method: string;
    requestCount: number;
    errorCount: number;
    enabled: boolean;
}
