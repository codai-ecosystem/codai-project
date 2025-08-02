/**
 * CODAI Ecosystem API Gateway - Working Version
 * Simplified, functional gateway without problematic dependencies
 * This version focuses on core functionality and can be built upon
 */

import express from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import { z } from 'zod';

const app: express.Application = express();
const PORT = parseInt(process.env.GATEWAY_PORT || '4000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

// Service configuration interface
interface ServiceConfig {
    name: string;
    url: string;
    port: number;
    path: string;
    healthPath: string;
    isHealthy: boolean;
    lastHealthCheck: Date;
    description: string;
    version: string;
    category: 'core' | 'business' | 'utility';
}

// Service registry with corrected port mappings based on workspace analysis  
const serviceRegistry: Record<string, ServiceConfig> = {
    'codai': {
        name: 'CODAI Service',
        url: 'http://localhost:4001',
        port: 4001,
        path: '/api/v1/codai',
        healthPath: '/health',
        isHealthy: false,
        lastHealthCheck: new Date(),
        description: 'AI development platform and project management',
        version: '1.0.0',
        category: 'core'
    },
    'admin': {
        name: 'Admin Service',
        url: 'http://localhost:4007',
        port: 4007,
        path: '/api/v1/admin',
        healthPath: '/api/health',
        isHealthy: false,
        lastHealthCheck: new Date(),
        description: 'Administration and user management',
        version: '1.0.0',
        category: 'core'
    },
    'hub': {
        name: 'Hub Service',
        url: 'http://localhost:4008',
        port: 4008,
        path: '/api/v1/hub',
        healthPath: '/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Service discovery and coordination',
        version: '1.0.0',
        category: 'core'
    },
    'id': {
        name: 'ID Service',
        url: 'http://localhost:4004',
        port: 4004,
        path: '/api/v1/id',
        healthPath: '/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Authentication and identity management',
        version: '2.0.0',
        category: 'core'
    },
    'bancai': {
        name: 'BancAI Service',
        url: 'http://localhost:4005',
        port: 4005,
        path: '/api/v1/bancai',
        healthPath: '/api/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Financial services and banking platform',
        version: '1.0.0',
        category: 'business'
    },
    'memorai': {
        name: 'MemorAI Service',
        url: 'http://localhost:4006',
        port: 4006,
        path: '/api/v1/memorai',
        healthPath: '/api/health',
        isHealthy: false,
        lastHealthCheck: new Date(),
        description: 'Memory storage and recall system',
        version: '7.2.1',
        category: 'core'
    }
};

// Security middleware setup
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
        success: false,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip} - ${requestId}`);

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${requestId}`);
    });

    next();
});

// JWT Authentication middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Access token is required',
            code: 'TOKEN_REQUIRED',
            requestId: req.headers['x-request-id']
        });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN',
                requestId: req.headers['x-request-id']
            });
        }
        (req as any).user = user;
        next();
    });
};

// Health check for individual services
async function checkServiceHealth(serviceId: string): Promise<boolean> {
    const service = serviceRegistry[serviceId];
    if (!service) return false;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${service.url}${service.healthPath}`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'User-Agent': 'CODAI-Gateway/2.0.0',
                'Accept': 'application/json'
            }
        });

        clearTimeout(timeoutId);
        const isHealthy = response.ok;
        service.isHealthy = isHealthy;
        service.lastHealthCheck = new Date();

        if (!isHealthy) {
            console.warn(`[HEALTH] Service ${serviceId} health check failed: ${response.status} ${response.statusText}`);
        }

        return isHealthy;
    } catch (error) {
        service.isHealthy = false;
        service.lastHealthCheck = new Date();
        console.error(`[HEALTH] Service ${serviceId} health check error:`, (error as Error).message);
        return false;
    }
}

// Periodic health checks
setInterval(async () => {
    console.log('[HEALTH] Performing health checks...');
    const healthChecks = Object.keys(serviceRegistry).map(serviceId =>
        checkServiceHealth(serviceId)
    );
    const results = await Promise.all(healthChecks);
    const healthyCount = results.filter(Boolean).length;
    console.log(`[HEALTH] Health check complete: ${healthyCount}/${results.length} services healthy`);
}, 30000); // Check every 30 seconds

// Enhanced proxy middleware with proper error handling
const createServiceProxy = (serviceId: string): express.RequestHandler => {
    const service = serviceRegistry[serviceId];

    const proxyOptions: Options = {
        target: service.url,
        changeOrigin: true,
        pathRewrite: (path: string) => {
            // Handle specific endpoints
            if (path.includes('/health')) {
                return service.healthPath;
            }
            if (path.includes('/ready')) {
                return '/ready';
            }
            if (path.includes('/docs')) {
                return '/docs';
            }
            // For other endpoints, remove the service prefix
            return path.replace(`/api/v1/${serviceId}`, '/api');
        },
        onProxyReq: (proxyReq, req) => {
            // Add gateway headers
            proxyReq.setHeader('X-Gateway-Service', serviceId);
            proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
            proxyReq.setHeader('X-Request-ID', req.headers['x-request-id'] as string || 'unknown');
            proxyReq.setHeader('X-Forwarded-By', 'CODAI-Gateway');

            console.log(`[PROXY] Routing ${req.method} ${req.path} to ${serviceId} service at ${service.url}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            // Add response headers
            proxyRes.headers['x-powered-by'] = 'CODAI API Gateway';
            proxyRes.headers['x-service'] = serviceId;
            proxyRes.headers['x-gateway-version'] = '2.0.0';
        },
        onError: (err, req, res) => {
            console.error(`[PROXY] Error proxying to ${serviceId}:`, err.message);

            const response = res as express.Response;
            if (!response.headersSent) {
                response.status(502).json({
                    success: false,
                    error: 'Bad Gateway',
                    message: `Service ${serviceId} is temporarily unavailable`,
                    code: 'SERVICE_UNAVAILABLE',
                    service: serviceId,
                    requestId: req.headers['x-request-id']
                });
            }
        }
    };

    return createProxyMiddleware(proxyOptions);
};

// Gateway management endpoints
app.get('/api/gateway/health', (req, res) => {
    const healthStatus = {
        gateway: {
            status: 'healthy',
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
            version: '2.0.0-working',
            nodeVersion: process.version,
            platform: process.platform
        },
        services: Object.entries(serviceRegistry).map(([id, config]) => ({
            id,
            name: config.name,
            status: config.isHealthy ? 'healthy' : 'unhealthy',
            url: config.url,
            lastHealthCheck: config.lastHealthCheck.toISOString(),
            category: config.category,
            version: config.version
        }))
    };

    const healthyServices = Object.values(serviceRegistry).filter(service => service.isHealthy).length;
    const totalServices = Object.keys(serviceRegistry).length;
    const allHealthy = healthyServices === totalServices;

    res.status(allHealthy ? 200 : 503).json({
        service: 'Gateway Service',
        status: 'healthy',
        version: '2.0.0-working',
        success: true,
        data: healthStatus,
        message: `Gateway is healthy. Services: ${healthyServices}/${totalServices} healthy`,
        requestId: req.headers['x-request-id']
    });
});

app.get('/api/gateway/services', authenticateToken, (req, res) => {
    const services = Object.entries(serviceRegistry).map(([id, config]) => ({
        id,
        name: config.name,
        description: config.description,
        version: config.version,
        category: config.category,
        endpoint: `${req.protocol}://${req.get('host')}/api/v1/${id}`,
        directUrl: config.url,
        documentation: `${req.protocol}://${req.get('host')}/api/v1/${id}/docs`,
        status: config.isHealthy ? 'healthy' : 'unhealthy',
        lastHealthCheck: config.lastHealthCheck.toISOString()
    }));

    const healthyCount = services.filter(s => s.status === 'healthy').length;

    res.json({
        success: true,
        data: {
            services,
            total: services.length,
            healthy: healthyCount,
            unhealthy: services.length - healthyCount,
            categories: {
                core: services.filter(s => s.category === 'core').length,
                business: services.filter(s => s.category === 'business').length,
                utility: services.filter(s => s.category === 'utility').length
            }
        },
        message: 'Service registry retrieved successfully',
        requestId: req.headers['x-request-id']
    });
});

app.get('/api/gateway/metrics', authenticateToken, (req, res) => {
    const memUsage = process.memoryUsage();

    const metrics = {
        gateway: {
            uptime: Math.floor(process.uptime()),
            memory: {
                rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
                external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
            },
            platform: process.platform,
            nodeVersion: process.version,
            pid: process.pid
        },
        services: {
            total: Object.keys(serviceRegistry).length,
            healthy: Object.values(serviceRegistry).filter(s => s.isHealthy).length,
            byCategory: Object.values(serviceRegistry).reduce((acc, service) => {
                acc[service.category] = (acc[service.category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        },
        timestamp: new Date().toISOString()
    };

    res.json({
        success: true,
        data: metrics,
        requestId: req.headers['x-request-id']
    });
});

// Service discovery endpoint
app.get('/api/gateway/discover/:serviceId', (req, res) => {
    const { serviceId } = req.params;
    const service = serviceRegistry[serviceId];

    if (!service) {
        return res.status(404).json({
            success: false,
            error: 'Service not found',
            message: `Service '${serviceId}' is not registered`,
            code: 'SERVICE_NOT_FOUND',
            availableServices: Object.keys(serviceRegistry),
            requestId: req.headers['x-request-id']
        });
    }

    res.json({
        success: true,
        data: {
            id: serviceId,
            name: service.name,
            description: service.description,
            version: service.version,
            category: service.category,
            baseUrl: `${req.protocol}://${req.get('host')}/api/v1/${serviceId}`,
            directUrl: service.url,
            documentation: `${req.protocol}://${req.get('host')}/api/v1/${serviceId}/docs`,
            status: service.isHealthy ? 'healthy' : 'unhealthy',
            lastHealthCheck: service.lastHealthCheck.toISOString()
        },
        message: 'Service discovery successful',
        requestId: req.headers['x-request-id']
    });
});

// API Documentation
const apiDocs = {
    openapi: '3.0.0',
    info: {
        title: 'CODAI Ecosystem API Gateway',
        version: '2.0.0-working',
        description: 'Centralized API gateway for the CODAI ecosystem services',
        contact: {
            name: 'CODAI Team',
            url: 'https://codai.ro'
        }
    },
    servers: [
        {
            url: '/api/v1',
            description: 'Gateway API Server'
        }
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    paths: {
        '/gateway/health': {
            get: {
                tags: ['Gateway Management'],
                summary: 'Gateway and services health status',
                responses: {
                    '200': { description: 'Health status retrieved successfully' },
                    '503': { description: 'Some services are unhealthy' }
                }
            }
        },
        '/gateway/services': {
            get: {
                tags: ['Gateway Management'],
                summary: 'List all registered services',
                security: [{ BearerAuth: [] }],
                responses: {
                    '200': { description: 'Services list retrieved successfully' },
                    '401': { description: 'Unauthorized' }
                }
            }
        }
    }
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiDocs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CODAI API Gateway Documentation'
}));

// Service routing setup
Object.keys(serviceRegistry).forEach(serviceId => {
    // Public health check routes (no auth required)
    app.use(`/api/v1/${serviceId}/health`, createServiceProxy(serviceId));
    app.use(`/api/v1/${serviceId}/ready`, createServiceProxy(serviceId));
    app.use(`/api/v1/${serviceId}/docs`, createServiceProxy(serviceId));

    // All other routes require authentication
    app.use(`/api/v1/${serviceId}`, authenticateToken, createServiceProxy(serviceId));

    console.log(`[SETUP] Route configured: /api/v1/${serviceId} -> ${serviceRegistry[serviceId].url}`);
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'The requested endpoint was not found',
        code: 'ENDPOINT_NOT_FOUND',
        path: req.originalUrl,
        method: req.method,
        availableServices: Object.keys(serviceRegistry),
        suggestion: `Try /api/v1/{service-id} where service-id is one of: ${Object.keys(serviceRegistry).join(', ')}`,
        requestId: req.headers['x-request-id']
    });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[GATEWAY] Unhandled error:', error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        requestId: req.headers['x-request-id']
    });
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
    console.log(`[GATEWAY] Received ${signal}, shutting down gracefully...`);
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the gateway
app.listen(PORT, () => {
    console.log(`🚀 CODAI API Gateway (Working Version) running on port ${PORT}`);
    console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
    console.log(`📚 Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/api/gateway/health`);
    console.log(`🔍 Service Discovery: http://localhost:${PORT}/api/gateway/services`);
    console.log(`📊 Metrics: http://localhost:${PORT}/api/gateway/metrics`);
    console.log(`\n🌐 Registered Services (${Object.keys(serviceRegistry).length}):`);

    Object.entries(serviceRegistry).forEach(([id, config]) => {
        console.log(`   ${config.name}: http://localhost:${PORT}/api/v1/${id} -> ${config.url}`);
    });

    console.log(`\n✅ Gateway ready to route requests!`);
    console.log(`📝 Note: This is the working version without problematic dependencies`);

    // Perform initial health check
    setTimeout(async () => {
        console.log('\n🔍 Performing initial health checks...');
        const healthChecks = Object.keys(serviceRegistry).map(serviceId =>
            checkServiceHealth(serviceId)
        );
        const results = await Promise.all(healthChecks);
        const healthyCount = results.filter(Boolean).length;
        console.log(`✅ Initial health check: ${healthyCount}/${results.length} services are healthy\n`);
    }, 2000);
});

export default app;
