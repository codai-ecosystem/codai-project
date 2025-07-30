/**
 * Enhanced API Gateway for Advanced Service Integrations
 * 
 * Provides comprehensive API gateway functionality with:
 * - Intelligent service discovery and health monitoring
 * - Advanced load balancing with circuit breakers
 * - Real-time WebSocket communication coordination
 * - Event-driven architecture support
 * - Performance monitoring and analytics
 * - Security middleware integration
 * - Request/response transformation
 * - Caching and rate limiting
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import EventEmitter from 'eventemitter3';
import chalk from 'chalk';
import ora from 'ora';
import cron from 'node-cron';
import _ from 'lodash';
import { createServer } from 'http';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Enhanced API Gateway Class
 * 
 * Manages advanced service integrations with intelligent routing,
 * load balancing, real-time communication, and comprehensive monitoring.
 */
export class EnhancedAPIGateway extends EventEmitter {
    constructor(options = {}) {
        super();

        // Configuration
        this.config = {
            port: options.port || 4000,
            host: options.host || 'localhost',
            redis: {
                url: options.redisUrl || 'redis://localhost:6379',
                keyPrefix: 'codai:gateway:'
            },
            services: options.services || this.getDefaultServices(),
            gateway: {
                timeout: 30000,
                retries: 3,
                circuitBreaker: {
                    errorThreshold: 50,
                    timeout: 60000,
                    resetTimeout: 30000
                },
                loadBalancing: {
                    strategy: 'round-robin', // round-robin, least-connections, weighted
                    healthCheckInterval: 10000
                }
            },
            websocket: {
                enabled: true,
                port: 4001,
                maxConnections: 1000,
                heartbeatInterval: 30000
            },
            security: {
                rateLimiting: {
                    windowMs: 15 * 60 * 1000, // 15 minutes
                    max: 1000 // requests per window
                },
                cors: {
                    origin: process.env.NODE_ENV === 'production' ? false : true,
                    credentials: true
                }
            },
            monitoring: {
                enabled: true,
                metricsInterval: 5000,
                alertThresholds: {
                    responseTime: 5000,
                    errorRate: 10,
                    cpuUsage: 80
                }
            },
            caching: {
                enabled: true,
                ttl: 300, // 5 minutes
                maxSize: 1000
            }
        };

        // Core components
        this.app = express();
        this.server = null;
        this.wsServer = null;
        this.redis = null;

        // Service management
        this.serviceRegistry = new Map();
        this.serviceHealth = new Map();
        this.serviceMetrics = new Map();
        this.loadBalancers = new Map();

        // Circuit breakers
        this.circuitBreakers = new Map();

        // Real-time communication
        this.connectedClients = new Set();
        this.eventBus = new EventEmitter();

        // Performance monitoring
        this.metrics = {
            requests: 0,
            responses: 0,
            errors: 0,
            totalResponseTime: 0,
            activeConnections: 0,
            cacheHits: 0,
            cacheMisses: 0
        };

        // Request cache
        this.requestCache = new Map();

        // Initialize spinner
        this.spinner = ora('Enhanced API Gateway initializing...').start();

        this.logger = this.createLogger();
    }

    /**
     * Get default CODAI services configuration
     */
    getDefaultServices() {
        return {
            gateway: {
                name: 'Gateway Service',
                instances: [{ host: 'localhost', port: 4000, weight: 1 }],
                healthCheck: '/health',
                version: '1.0.0'
            },
            codai: {
                name: 'CODAI Service',
                instances: [{ host: 'localhost', port: 4001, weight: 1 }],
                healthCheck: '/api/health',
                version: '1.0.0'
            },
            admin: {
                name: 'Admin Service',
                instances: [{ host: 'localhost', port: 4002, weight: 1 }],
                healthCheck: '/api/health',
                version: '1.0.0'
            },
            hub: {
                name: 'Hub Service',
                instances: [{ host: 'localhost', port: 4003, weight: 1 }],
                healthCheck: '/api/health',
                version: '1.0.0'
            },
            id: {
                name: 'ID Service',
                instances: [{ host: 'localhost', port: 4004, weight: 1 }],
                healthCheck: '/api/health',
                version: '1.0.0'
            },
            bancai: {
                name: 'BancAI Service',
                instances: [{ host: 'localhost', port: 4005, weight: 1 }],
                healthCheck: '/api/health',
                version: '1.0.0'
            },
            memorai: {
                name: 'MemorAI Service',
                instances: [{ host: 'localhost', port: 4006, weight: 1 }],
                healthCheck: '/api/health',
                version: '1.0.0'
            },
            cbd: {
                name: 'CBD Engine Service',
                instances: [{ host: 'localhost', port: 4007, weight: 1 }],
                healthCheck: '/api/health',
                version: '1.0.0'
            }
        };
    }

    /**
     * Initialize the enhanced API gateway
     */
    async initialize() {
        try {
            this.logger('🚀 Initializing Enhanced API Gateway...');

            // Initialize Redis connection
            await this.initializeRedis();

            // Setup Express middleware
            await this.setupMiddleware();

            // Initialize service discovery
            await this.initializeServiceDiscovery();

            // Setup routing and load balancing
            await this.setupRouting();

            // Initialize WebSocket server
            if (this.config.websocket.enabled) {
                await this.initializeWebSocket();
            }

            // Setup monitoring and health checks
            await this.setupMonitoring();

            // Start the server
            await this.start();

            this.spinner.succeed('Enhanced API Gateway initialized successfully');
            this.logger('✅ Enhanced API Gateway ready for advanced service integrations');

            // Emit initialization complete event
            this.emit('initialized', {
                port: this.config.port,
                services: Object.keys(this.config.services).length,
                websocket: this.config.websocket.enabled
            });

            return {
                status: 'success',
                message: 'Enhanced API Gateway initialized successfully',
                services: Object.keys(this.config.services).length,
                features: [
                    'service_discovery',
                    'load_balancing',
                    'circuit_breakers',
                    'real_time_communication',
                    'performance_monitoring',
                    'request_caching',
                    'rate_limiting',
                    'security_middleware'
                ]
            };

        } catch (error) {
            this.spinner.fail('Enhanced API Gateway initialization failed');
            this.logger(`❌ Initialization error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Initialize Redis connection for caching and state management
     */
    async initializeRedis() {
        try {
            this.redis = createClient({ url: this.config.redis.url });

            this.redis.on('error', (error) => {
                this.logger(`❌ Redis error: ${error.message}`);
            });

            this.redis.on('connect', () => {
                this.logger('🔗 Connected to Redis');
            });

            await this.redis.connect();
            this.logger('✅ Redis connection established');

        } catch (error) {
            this.logger(`⚠️ Redis connection failed: ${error.message}`);
            // Continue without Redis if not available
        }
    }

    /**
     * Setup Express middleware stack
     */
    async setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: false, // Allow for development
            crossOriginEmbedderPolicy: false
        }));

        // CORS configuration
        this.app.use(cors(this.config.security.cors));

        // Compression
        this.app.use(compression());

        // Rate limiting
        const limiter = rateLimit(this.config.security.rateLimiting);
        this.app.use(limiter);

        // Request parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging and metrics
        this.app.use((req, res, next) => {
            const startTime = Date.now();
            this.metrics.requests++;

            // Add request ID
            req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Log request
            this.logger(`📨 ${req.method} ${req.url} [${req.requestId}]`);

            // Response time tracking
            res.on('finish', () => {
                const responseTime = Date.now() - startTime;
                this.metrics.totalResponseTime += responseTime;
                this.metrics.responses++;

                if (res.statusCode >= 400) {
                    this.metrics.errors++;
                }

                // Emit metrics event
                this.emit('request_completed', {
                    requestId: req.requestId,
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    responseTime
                });
            });

            next();
        });

        this.logger('✅ Express middleware configured');
    }

    /**
     * Initialize service discovery and registration
     */
    async initializeServiceDiscovery() {
        // Register all configured services
        for (const [serviceId, config] of Object.entries(this.config.services)) {
            await this.registerService(serviceId, config);
        }

        // Start health check monitoring
        this.startHealthChecks();

        this.logger(`✅ Service discovery initialized with ${this.serviceRegistry.size} services`);
    }

    /**
     * Register a service in the registry
     */
    async registerService(serviceId, config) {
        this.serviceRegistry.set(serviceId, {
            ...config,
            id: serviceId,
            registeredAt: new Date(),
            status: 'unknown'
        });

        // Initialize health status
        this.serviceHealth.set(serviceId, {
            status: 'unknown',
            lastCheck: null,
            consecutiveFailures: 0,
            averageResponseTime: 0
        });

        // Initialize metrics
        this.serviceMetrics.set(serviceId, {
            requests: 0,
            responses: 0,
            errors: 0,
            totalResponseTime: 0
        });

        // Initialize load balancer
        this.loadBalancers.set(serviceId, {
            strategy: this.config.gateway.loadBalancing.strategy,
            instances: [...config.instances],
            currentIndex: 0
        });

        // Initialize circuit breaker
        this.circuitBreakers.set(serviceId, {
            state: 'closed', // closed, open, half-open
            failures: 0,
            lastFailureTime: null,
            resetTimer: null
        });

        this.logger(`📋 Registered service: ${config.name} (${serviceId})`);
    }

    /**
     * Setup routing and proxy middleware
     */
    async setupRouting() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: Object.fromEntries(
                    Array.from(this.serviceHealth.entries()).map(([id, health]) => [
                        id, health.status
                    ])
                ),
                metrics: {
                    ...this.metrics,
                    averageResponseTime: this.metrics.responses > 0 ?
                        Math.round(this.metrics.totalResponseTime / this.metrics.responses) : 0
                }
            });
        });

        // Service registry endpoint
        this.app.get('/registry', (req, res) => {
            res.json({
                services: Array.from(this.serviceRegistry.entries()).map(([id, service]) => ({
                    id,
                    name: service.name,
                    status: this.serviceHealth.get(id)?.status || 'unknown',
                    instances: service.instances.length,
                    version: service.version
                }))
            });
        });

        // Metrics endpoint
        this.app.get('/metrics', (req, res) => {
            const serviceMetrics = Object.fromEntries(
                Array.from(this.serviceMetrics.entries())
            );

            res.json({
                gateway: this.metrics,
                services: serviceMetrics,
                timestamp: new Date().toISOString()
            });
        });

        // Dynamic service routing
        for (const [serviceId, service] of this.serviceRegistry.entries()) {
            await this.setupServiceRoute(serviceId, service);
        }

        this.logger('✅ Routing and load balancing configured');
    }

    /**
     * Setup routing for a specific service
     */
    async setupServiceRoute(serviceId, service) {
        const routePath = `/api/${serviceId}`;

        // Create proxy middleware with enhanced features
        const proxy = createProxyMiddleware({
            target: this.getServiceTarget(serviceId),
            changeOrigin: true,
            pathRewrite: {
                [`^/api/${serviceId}`]: ''
            },
            router: (req) => {
                return this.getServiceTarget(serviceId);
            },
            onProxyReq: (proxyReq, req, res) => {
                // Add service tracking headers
                proxyReq.setHeader('X-Gateway-Request-ID', req.requestId);
                proxyReq.setHeader('X-Gateway-Service', serviceId);
                proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());

                // Update service metrics
                const metrics = this.serviceMetrics.get(serviceId);
                if (metrics) {
                    metrics.requests++;
                }
            },
            onProxyRes: (proxyRes, req, res) => {
                // Update service metrics
                const metrics = this.serviceMetrics.get(serviceId);
                if (metrics) {
                    metrics.responses++;
                    if (proxyRes.statusCode >= 400) {
                        metrics.errors++;
                    }
                }

                // Update circuit breaker
                this.updateCircuitBreaker(serviceId, proxyRes.statusCode < 400);
            },
            onError: (err, req, res) => {
                this.logger(`❌ Proxy error for ${serviceId}: ${err.message}`);

                // Update metrics
                const metrics = this.serviceMetrics.get(serviceId);
                if (metrics) {
                    metrics.errors++;
                }

                // Update circuit breaker
                this.updateCircuitBreaker(serviceId, false);

                // Send error response
                res.status(503).json({
                    error: 'Service Unavailable',
                    service: serviceId,
                    message: 'The requested service is currently unavailable',
                    requestId: req.requestId
                });
            }
        });

        // Apply caching middleware if enabled
        if (this.config.caching.enabled) {
            this.app.use(routePath, this.createCacheMiddleware(serviceId));
        }

        // Apply the proxy
        this.app.use(routePath, proxy);

        this.logger(`🔀 Route configured: ${routePath} -> ${service.name}`);
    }

    /**
     * Get target URL for a service using load balancing
     */
    getServiceTarget(serviceId) {
        const loadBalancer = this.loadBalancers.get(serviceId);
        const circuitBreaker = this.circuitBreakers.get(serviceId);

        // Check circuit breaker
        if (circuitBreaker && circuitBreaker.state === 'open') {
            throw new Error(`Circuit breaker is open for service: ${serviceId}`);
        }

        if (!loadBalancer || loadBalancer.instances.length === 0) {
            throw new Error(`No healthy instances available for service: ${serviceId}`);
        }

        // Simple round-robin load balancing
        const instance = loadBalancer.instances[loadBalancer.currentIndex];
        loadBalancer.currentIndex = (loadBalancer.currentIndex + 1) % loadBalancer.instances.length;

        return `http://${instance.host}:${instance.port}`;
    }

    /**
     * Create caching middleware for a service
     */
    createCacheMiddleware(serviceId) {
        return async (req, res, next) => {
            // Only cache GET requests
            if (req.method !== 'GET') {
                return next();
            }

            const cacheKey = `${this.config.redis.keyPrefix}cache:${serviceId}:${req.url}`;

            try {
                if (this.redis) {
                    const cachedResponse = await this.redis.get(cacheKey);
                    if (cachedResponse) {
                        this.metrics.cacheHits++;
                        const data = JSON.parse(cachedResponse);
                        return res.json(data);
                    }
                }

                this.metrics.cacheMisses++;

                // Store original json method
                const originalJson = res.json.bind(res);

                // Override json method to cache response
                res.json = (data) => {
                    if (this.redis && res.statusCode === 200) {
                        this.redis.setex(cacheKey, this.config.caching.ttl, JSON.stringify(data));
                    }
                    return originalJson(data);
                };

            } catch (error) {
                this.logger(`⚠️ Cache error: ${error.message}`);
            }

            next();
        };
    }

    /**
     * Initialize WebSocket server for real-time communication
     */
    async initializeWebSocket() {
        this.server = createServer(this.app);

        this.wsServer = new WebSocketServer({
            server: this.server,
            path: '/ws'
        });

        this.wsServer.on('connection', (ws, req) => {
            this.connectedClients.add(ws);
            this.metrics.activeConnections++;

            this.logger(`🔌 New WebSocket connection (${this.connectedClients.size} total)`);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connected',
                message: 'Connected to Enhanced API Gateway',
                timestamp: new Date().toISOString(),
                services: Array.from(this.serviceRegistry.keys())
            }));

            // Handle messages
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.handleWebSocketMessage(ws, data);
                } catch (error) {
                    this.logger(`❌ Invalid WebSocket message: ${error.message}`);
                }
            });

            // Handle disconnection
            ws.on('close', () => {
                this.connectedClients.delete(ws);
                this.metrics.activeConnections--;
                this.logger(`🔌 WebSocket disconnected (${this.connectedClients.size} remaining)`);
            });

            // Handle errors
            ws.on('error', (error) => {
                this.logger(`❌ WebSocket error: ${error.message}`);
                this.connectedClients.delete(ws);
                this.metrics.activeConnections--;
            });
        });

        // Setup heartbeat
        this.setupWebSocketHeartbeat();

        this.logger('✅ WebSocket server initialized for real-time communication');
    }

    /**
     * Handle WebSocket messages
     */
    handleWebSocketMessage(ws, data) {
        switch (data.type) {
            case 'subscribe':
                // Subscribe to service events
                if (data.service && this.serviceRegistry.has(data.service)) {
                    ws.subscribedServices = ws.subscribedServices || new Set();
                    ws.subscribedServices.add(data.service);

                    ws.send(JSON.stringify({
                        type: 'subscribed',
                        service: data.service,
                        timestamp: new Date().toISOString()
                    }));
                }
                break;

            case 'unsubscribe':
                // Unsubscribe from service events
                if (ws.subscribedServices) {
                    ws.subscribedServices.delete(data.service);
                }
                break;

            case 'ping':
                // Respond to ping
                ws.send(JSON.stringify({
                    type: 'pong',
                    timestamp: new Date().toISOString()
                }));
                break;

            default:
                this.logger(`⚠️ Unknown WebSocket message type: ${data.type}`);
        }
    }

    /**
     * Setup WebSocket heartbeat
     */
    setupWebSocketHeartbeat() {
        setInterval(() => {
            this.connectedClients.forEach(ws => {
                if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'heartbeat',
                        timestamp: new Date().toISOString(),
                        metrics: {
                            activeConnections: this.connectedClients.size,
                            totalRequests: this.metrics.requests
                        }
                    }));
                }
            });
        }, this.config.websocket.heartbeatInterval);
    }

    /**
     * Broadcast message to connected WebSocket clients
     */
    broadcast(message, filter = null) {
        this.connectedClients.forEach(ws => {
            if (ws.readyState === ws.OPEN) {
                // Apply filter if provided
                if (filter && !filter(ws)) {
                    return;
                }

                ws.send(JSON.stringify({
                    ...message,
                    timestamp: new Date().toISOString()
                }));
            }
        });
    }

    /**
     * Start health checks for all services
     */
    startHealthChecks() {
        const checkInterval = this.config.gateway.loadBalancing.healthCheckInterval;

        setInterval(async () => {
            for (const [serviceId, service] of this.serviceRegistry.entries()) {
                await this.performHealthCheck(serviceId, service);
            }
        }, checkInterval);

        this.logger('✅ Health check monitoring started');
    }

    /**
     * Perform health check for a service
     */
    async performHealthCheck(serviceId, service) {
        const health = this.serviceHealth.get(serviceId);
        const startTime = Date.now();

        try {
            // Check each instance
            for (const instance of service.instances) {
                const url = `http://${instance.host}:${instance.port}${service.healthCheck}`;

                const response = await fetch(url, {
                    method: 'GET',
                    timeout: 5000
                });

                const responseTime = Date.now() - startTime;

                if (response.ok) {
                    health.status = 'healthy';
                    health.consecutiveFailures = 0;
                    health.averageResponseTime = responseTime;

                    // Reset circuit breaker if healthy
                    const circuitBreaker = this.circuitBreakers.get(serviceId);
                    if (circuitBreaker && circuitBreaker.state === 'half-open') {
                        circuitBreaker.state = 'closed';
                        circuitBreaker.failures = 0;
                    }
                } else {
                    throw new Error(`Health check failed with status: ${response.status}`);
                }
            }

        } catch (error) {
            health.status = 'unhealthy';
            health.consecutiveFailures++;

            this.logger(`❌ Health check failed for ${serviceId}: ${error.message}`);

            // Update circuit breaker
            this.updateCircuitBreaker(serviceId, false);
        }

        health.lastCheck = new Date();

        // Broadcast health status change
        this.broadcast({
            type: 'service_health',
            service: serviceId,
            status: health.status,
            responseTime: health.averageResponseTime
        }, ws => ws.subscribedServices && ws.subscribedServices.has(serviceId));
    }

    /**
     * Update circuit breaker state
     */
    updateCircuitBreaker(serviceId, success) {
        const circuitBreaker = this.circuitBreakers.get(serviceId);
        if (!circuitBreaker) return;

        if (success) {
            if (circuitBreaker.state === 'half-open') {
                circuitBreaker.state = 'closed';
                circuitBreaker.failures = 0;
            }
        } else {
            circuitBreaker.failures++;
            circuitBreaker.lastFailureTime = Date.now();

            // Open circuit breaker if error threshold reached
            const threshold = this.config.gateway.circuitBreaker.errorThreshold;
            if (circuitBreaker.failures >= threshold && circuitBreaker.state === 'closed') {
                circuitBreaker.state = 'open';

                this.logger(`⚠️ Circuit breaker opened for service: ${serviceId}`);

                // Set timer to transition to half-open
                const resetTimeout = this.config.gateway.circuitBreaker.resetTimeout;
                circuitBreaker.resetTimer = setTimeout(() => {
                    circuitBreaker.state = 'half-open';
                    this.logger(`🔄 Circuit breaker half-open for service: ${serviceId}`);
                }, resetTimeout);

                // Broadcast circuit breaker event
                this.broadcast({
                    type: 'circuit_breaker',
                    service: serviceId,
                    state: 'open'
                });
            }
        }
    }

    /**
     * Setup monitoring and alerting
     */
    async setupMonitoring() {
        // Performance monitoring
        setInterval(() => {
            this.collectMetrics();
        }, this.config.monitoring.metricsInterval);

        // Alert checking
        setInterval(() => {
            this.checkAlerts();
        }, this.config.monitoring.metricsInterval * 2);

        this.logger('✅ Performance monitoring and alerting configured');
    }

    /**
     * Collect performance metrics
     */
    collectMetrics() {
        const currentMetrics = {
            ...this.metrics,
            timestamp: new Date().toISOString(),
            averageResponseTime: this.metrics.responses > 0 ?
                Math.round(this.metrics.totalResponseTime / this.metrics.responses) : 0,
            errorRate: this.metrics.requests > 0 ?
                Math.round((this.metrics.errors / this.metrics.requests) * 100) : 0
        };

        // Broadcast metrics to subscribed clients
        this.broadcast({
            type: 'metrics',
            data: currentMetrics
        }, ws => ws.subscribedToMetrics);

        // Store metrics in Redis if available
        if (this.redis) {
            const key = `${this.config.redis.keyPrefix}metrics:${Date.now()}`;
            this.redis.setex(key, 3600, JSON.stringify(currentMetrics)); // Keep for 1 hour
        }
    }

    /**
     * Check for alerts based on thresholds
     */
    checkAlerts() {
        const thresholds = this.config.monitoring.alertThresholds;
        const averageResponseTime = this.metrics.responses > 0 ?
            this.metrics.totalResponseTime / this.metrics.responses : 0;
        const errorRate = this.metrics.requests > 0 ?
            (this.metrics.errors / this.metrics.requests) * 100 : 0;

        // Check response time threshold
        if (averageResponseTime > thresholds.responseTime) {
            this.emit('alert', {
                type: 'high_response_time',
                value: averageResponseTime,
                threshold: thresholds.responseTime,
                timestamp: new Date().toISOString()
            });
        }

        // Check error rate threshold
        if (errorRate > thresholds.errorRate) {
            this.emit('alert', {
                type: 'high_error_rate',
                value: errorRate,
                threshold: thresholds.errorRate,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Start the gateway server
     */
    async start() {
        return new Promise((resolve) => {
            const startServer = () => {
                if (this.server) {
                    // Using HTTP server for WebSocket support
                    this.server.listen(this.config.port, this.config.host, () => {
                        this.logger(`🌐 Enhanced API Gateway listening on http://${this.config.host}:${this.config.port}`);
                        resolve();
                    });
                } else {
                    // Using Express app directly
                    this.app.listen(this.config.port, this.config.host, () => {
                        this.logger(`🌐 Enhanced API Gateway listening on http://${this.config.host}:${this.config.port}`);
                        resolve();
                    });
                }
            };

            startServer();
        });
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        this.logger('🔄 Shutting down Enhanced API Gateway...');

        try {
            // Close WebSocket connections
            if (this.wsServer) {
                this.connectedClients.forEach(ws => {
                    ws.close(1000, 'Server shutting down');
                });
                this.wsServer.close();
            }

            // Close HTTP server
            if (this.server) {
                this.server.close();
            }

            // Close Redis connection
            if (this.redis) {
                await this.redis.quit();
            }

            // Clear intervals and timeouts
            this.circuitBreakers.forEach(cb => {
                if (cb.resetTimer) {
                    clearTimeout(cb.resetTimer);
                }
            });

            this.logger('✅ Enhanced API Gateway shutdown complete');

        } catch (error) {
            this.logger(`❌ Shutdown error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create logger function
     */
    createLogger() {
        return (message) => {
            const timestamp = new Date().toISOString();
            console.log(chalk.blue(`[${timestamp}] 🚪 API Gateway: ${message}`));
        };
    }
}

/**
 * Standalone mode execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log(chalk.cyan('🚪 Enhanced API Gateway - Standalone Mode'));

    const gateway = new EnhancedAPIGateway();

    // Initialize and start
    gateway.initialize().catch(error => {
        console.error(chalk.red('❌ Failed to initialize Enhanced API Gateway:'), error);
        process.exit(1);
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n⚠️ Received SIGINT, shutting down gracefully...'));
        await gateway.shutdown();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log(chalk.yellow('\n⚠️ Received SIGTERM, shutting down gracefully...'));
        await gateway.shutdown();
        process.exit(0);
    });
}

export default EnhancedAPIGateway;
