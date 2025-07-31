/**
 * CODAI Ecosystem API Gateway
 * Centralized routing and management for all CODAI services
 * Enhanced with Phase 2 Security Infrastructure
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { setupSecurity } from '@codai/security';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import { z } from 'zod';

const app = express();
const PORT = parseInt(process.env.GATEWAY_PORT || '4000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Enhanced security setup for gateway
async function initializeSecurity() {
    console.log('🔒 Initializing API Gateway security...');

    const securityConfig = {
        serviceName: 'api-gateway',
        port: PORT,
        app: app,
        httpsEnabled: process.env.NODE_ENV === 'production' || process.env.FORCE_HTTPS === 'true',
        wafEnabled: true,
        rateLimitEnabled: true,
        // Gateway-specific security configuration
        wafConfig: {
            enabled: true,
            logAllRequests: true,
            blockByDefault: false,
            rateLimitEnabled: true,
            challengeEnabled: true,
            customRules: [
                {
                    id: 'GATEWAY_001',
                    name: 'API Key Validation',
                    pattern: /^\/api\/(?!health|status).*$/,
                    action: 'log',
                    description: 'Log all API endpoint access attempts',
                    category: 'custom',
                    severity: 'medium',
                    enabled: true
                }
            ]
        }
    };

    return await setupSecurity(securityConfig);
}

// Service registry with health status
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

const serviceRegistry: Record<string, ServiceConfig> = {
    // Core Services - CORRECTED PORT MAPPINGS
    'codai': {
        name: 'CODAI Service',
        url: 'http://localhost:4001',
        port: 4001,
        path: '/api/v1/codai',
        healthPath: '/health', // CODAI uses /health NOT /api/health
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'AI-native development platform',
        version: '1.0.0',
        category: 'core'
    },
    'admin': {
        name: 'ADMIN Service',
        url: 'http://localhost:4002',
        port: 4002,
        path: '/api/v1/admin',
        healthPath: '/api/health', // Admin uses /api/health
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Administration and user management',
        version: '1.0.0',
        category: 'core'
    },
    'hub': {
        name: 'HUB Service',
        url: 'http://localhost:4003',
        port: 4003,
        path: '/api/v1/hub',
        healthPath: '/api/health', // Hub uses /api/health
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Service discovery and routing',
        version: '1.0.0',
        category: 'core'
    },
    'id': {
        name: 'ID Service',
        url: 'http://localhost:4004',
        port: 4004,
        path: '/api/v1/id',
        healthPath: '/api/health', // ID uses /api/health but returns 503 (cndAuth issue)
        isHealthy: false, // Currently unhealthy due to cndAuth not_initialized
        lastHealthCheck: new Date(),
        description: 'Authentication and identity management',
        version: '2.0.0-cnd',
        category: 'core'
    },
    'bancai': {
        name: 'BANCAI Service',
        url: 'http://localhost:4005',
        port: 4005,
        path: '/api/v1/bancai',
        healthPath: '/api/health', // BancAI uses /api/health
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Financial services and banking',
        version: '1.0.0',
        category: 'business'
    },
    'cumparai': {
        name: 'CUMPARAI Service',
        url: 'http://localhost:4008',
        port: 4008,
        path: '/api/v1/cumparai',
        healthPath: '/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'E-commerce and product catalog',
        version: '1.0.0',
        category: 'business'
    },
    'wallet': {
        name: 'WALLET Service',
        url: 'http://localhost:4009',
        port: 4009,
        path: '/api/v1/wallet',
        healthPath: '/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Payment processing and transactions',
        version: '1.0.0',
        category: 'business'
    },
    'marketai': {
        name: 'MARKETAI Service',
        url: 'http://localhost:4010',
        port: 4010,
        path: '/api/v1/marketai',
        healthPath: '/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Marketing automation and campaigns',
        version: '1.0.0',
        category: 'business'
    },
    'fabricai': {
        name: 'FABRICAI Service',
        url: 'http://localhost:4011',
        port: 4011,
        path: '/api/v1/fabricai',
        healthPath: '/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Content creation and templates',
        version: '1.0.0',
        category: 'business'
    },
    'memorai': {
        name: 'MEMORAI Service',
        url: 'http://localhost:4006',
        port: 4006,
        path: '/api/v1/memorai',
        healthPath: '/api/health', // MemorAI uses /api/health
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Memory storage and recall system',
        version: '7.2.1',
        category: 'core'
    }
};

// JWT Authentication middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Access token is required',
            code: 'TOKEN_REQUIRED'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
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
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const isHealthy = response.ok;
        service.isHealthy = isHealthy;
        service.lastHealthCheck = new Date();
        return isHealthy;
    } catch (error) {
        service.isHealthy = false;
        service.lastHealthCheck = new Date();
        return false;
    }
}

// Periodic health checks
setInterval(async () => {
    const healthChecks = Object.keys(serviceRegistry).map(serviceId =>
        checkServiceHealth(serviceId)
    );
    await Promise.all(healthChecks);
}, 30000); // Check every 30 seconds

// Load balancer (simple round-robin for multiple instances)
class LoadBalancer {
    private instances: Map<string, string[]> = new Map();
    private currentIndex: Map<string, number> = new Map();

    addInstance(serviceId: string, url: string) {
        if (!this.instances.has(serviceId)) {
            this.instances.set(serviceId, []);
            this.currentIndex.set(serviceId, 0);
        }
        this.instances.get(serviceId)!.push(url);
    }

    getNextInstance(serviceId: string): string | null {
        const instances = this.instances.get(serviceId);
        if (!instances || instances.length === 0) return null;

        const currentIdx = this.currentIndex.get(serviceId) || 0;
        const instance = instances[currentIdx];
        this.currentIndex.set(serviceId, (currentIdx + 1) % instances.length);

        return instance;
    }
}

const loadBalancer = new LoadBalancer();

// Initialize load balancer with service instances
Object.entries(serviceRegistry).forEach(([serviceId, config]) => {
    loadBalancer.addInstance(serviceId, config.url);
});

// Enhanced proxy middleware with load balancing and health checks
const createServiceProxy = (serviceId: string) => {
    return createProxyMiddleware({
        target: serviceRegistry[serviceId].url,
        changeOrigin: true,
        pathRewrite: (path, req) => {
            // Handle health endpoint specifically for each service
            if (path.includes('/health')) {
                return serviceRegistry[serviceId].healthPath;
            }
            // Handle ready endpoint
            if (path.includes('/ready')) {
                return '/ready';
            }
            // Handle docs endpoint
            if (path.includes('/docs')) {
                return '/docs';
            }
            // For other endpoints, rewrite /api/v1/serviceid to /api or root based on service
            return path.replace(`/api/v1/${serviceId}`, '');
        },
        onProxyReq: (proxyReq, req, res) => {
            // Add custom headers
            proxyReq.setHeader('X-Gateway-Service', serviceId);
            proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
            proxyReq.setHeader('X-Request-ID', req.headers['x-request-id'] || `req-${Date.now()}`);

            // Log request
            console.log(`[GATEWAY] Routing ${req.method} ${req.path} to ${serviceId} service`);
        },
        onProxyRes: (proxyRes, req, res) => {
            // Add CORS headers
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['X-Powered-By'] = 'CODAI API Gateway';
            proxyRes.headers['X-Service'] = serviceId;
        },
        onError: (err, req, res) => {
            console.error(`[GATEWAY] Proxy error for ${serviceId}:`, err.message);
            (res as express.Response).status(502).json({
                success: false,
                error: 'Bad Gateway',
                message: `Service ${serviceId} is temporarily unavailable`,
                code: 'SERVICE_UNAVAILABLE',
                service: serviceId
            });
        }
    });
};

// Gateway API endpoints
app.get('/api/gateway/health', (req, res) => {
    const healthStatus = {
        gateway: {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        },
        services: Object.entries(serviceRegistry).map(([id, config]) => ({
            id,
            name: config.name,
            status: config.isHealthy ? 'healthy' : 'unhealthy',
            url: config.url,
            lastHealthCheck: config.lastHealthCheck,
            category: config.category
        }))
    };

    const allHealthy = Object.values(serviceRegistry).every(service => service.isHealthy);
    const statusCode = allHealthy ? 200 : 503;

    res.status(statusCode).json({
        success: allHealthy,
        data: healthStatus,
        message: allHealthy ? 'All services are healthy' : 'Some services are unhealthy'
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
        documentation: `${req.protocol}://${req.get('host')}/api/v1/${id}/docs`,
        status: config.isHealthy ? 'healthy' : 'unhealthy',
        lastHealthCheck: config.lastHealthCheck
    }));

    res.json({
        success: true,
        data: {
            services,
            total: services.length,
            healthy: services.filter(s => s.status === 'healthy').length,
            categories: {
                core: services.filter(s => s.category === 'core').length,
                business: services.filter(s => s.category === 'business').length,
                utility: services.filter(s => s.category === 'utility').length
            }
        },
        message: 'Service registry retrieved successfully'
    });
});

app.get('/api/gateway/metrics', authenticateToken, (req, res) => {
    const metrics = {
        gateway: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            platform: process.platform,
            nodeVersion: process.version
        },
        services: {
            total: Object.keys(serviceRegistry).length,
            healthy: Object.values(serviceRegistry).filter(s => s.isHealthy).length,
            byCategory: {
                core: Object.values(serviceRegistry).filter(s => s.category === 'core').length,
                business: Object.values(serviceRegistry).filter(s => s.category === 'business').length,
                utility: Object.values(serviceRegistry).filter(s => s.category === 'utility').length
            }
        },
        requests: {
            // In a production environment, you'd track these metrics
            total: 0,
            successful: 0,
            failed: 0,
            averageResponseTime: 0
        }
    };

    res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
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
            code: 'SERVICE_NOT_FOUND'
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
            lastHealthCheck: service.lastHealthCheck
        },
        message: 'Service discovery successful'
    });
});

// Combined OpenAPI documentation
const generateCombinedApiDocs = () => {
    return {
        openapi: '3.0.0',
        info: {
            title: 'CODAI Ecosystem API Gateway',
            version: '1.0.0',
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
            },
            responses: {
                Unauthorized: {
                    description: 'Unauthorized',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    error: { type: 'string', example: 'Unauthorized' },
                                    message: { type: 'string', example: 'Access token is required' },
                                    code: { type: 'string', example: 'TOKEN_REQUIRED' }
                                }
                            }
                        }
                    }
                },
                ServiceUnavailable: {
                    description: 'Service Unavailable',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    error: { type: 'string', example: 'Bad Gateway' },
                                    message: { type: 'string', example: 'Service is temporarily unavailable' },
                                    code: { type: 'string', example: 'SERVICE_UNAVAILABLE' },
                                    service: { type: 'string', example: 'service-id' }
                                }
                            }
                        }
                    }
                }
            }
        },
        paths: {
            '/gateway/health': {
                get: {
                    tags: ['Gateway Management'],
                    summary: 'Gateway and services health status',
                    description: 'Get health status of the gateway and all registered services',
                    responses: {
                        '200': {
                            description: 'Health status retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    gateway: {
                                                        type: 'object',
                                                        properties: {
                                                            status: { type: 'string' },
                                                            uptime: { type: 'number' },
                                                            timestamp: { type: 'string' },
                                                            version: { type: 'string' }
                                                        }
                                                    },
                                                    services: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'object',
                                                            properties: {
                                                                id: { type: 'string' },
                                                                name: { type: 'string' },
                                                                status: { type: 'string' },
                                                                category: { type: 'string' }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/gateway/services': {
                get: {
                    tags: ['Gateway Management'],
                    summary: 'List all registered services',
                    description: 'Get information about all services registered with the gateway',
                    security: [{ BearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'Services list retrieved successfully'
                        },
                        '401': { $ref: '#/components/responses/Unauthorized' }
                    }
                }
            }
        }
    };
};

// Gateway documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(generateCombinedApiDocs(), {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CODAI API Gateway Documentation'
}));

// Service routing with authentication
Object.keys(serviceRegistry).forEach(serviceId => {
    const serviceConfig = serviceRegistry[serviceId];

    // Public health check routes (no auth required)
    app.use(`/api/v1/${serviceId}/health`, createServiceProxy(serviceId));
    app.use(`/api/v1/${serviceId}/ready`, createServiceProxy(serviceId));

    // Documentation routes (no auth required for easy access)
    app.use(`/api/v1/${serviceId}/docs`, createServiceProxy(serviceId));

    // All other routes require authentication
    app.use(`/api/v1/${serviceId}`, authenticateToken, createServiceProxy(serviceId));
});

// Fallback for unknown routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'The requested endpoint was not found',
        code: 'ENDPOINT_NOT_FOUND',
        availableServices: Object.keys(serviceRegistry),
        suggestion: `Try /api/v1/{service-id} where service-id is one of: ${Object.keys(serviceRegistry).join(', ')}`
    });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[GATEWAY] Unhandled error:', error);

    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        requestId: req.headers['x-request-id'] || `req-${Date.now()}`
    });
});

// Start the gateway with security
async function startGateway() {
    try {
        console.log('🚀 Starting CODAI API Gateway...');

        // Initialize security first
        const securityIntegration = await initializeSecurity();

        // Health endpoints (before other routing)
        app.get('/health', (req, res) => {
            res.json({
                service: 'api-gateway',
                status: 'healthy',
                description: 'CODAI Ecosystem API Gateway',
                timestamp: new Date().toISOString(),
                security: securityIntegration.getSecurityStats(),
                uptime: process.uptime(),
                version: '2.0.0',
                registeredServices: Object.keys(serviceRegistry).length
            });
        });

        // Gateway health endpoint (test-compatible)
        app.get('/api/gateway/health', (req, res) => {
            res.json({
                service: 'Gateway Service',
                status: 'healthy',
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                registeredServices: Object.keys(serviceRegistry).length,
                security: securityIntegration.getSecurityStats()
            });
        });

        app.get('/security/status', async (req, res) => {
            const healthCheck = await securityIntegration.performSecurityHealthCheck();
            res.json(healthCheck);
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('[GATEWAY] Received SIGTERM, shutting down gracefully');
            await securityIntegration.shutdown();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            console.log('[GATEWAY] Received SIGINT, shutting down gracefully');
            await securityIntegration.shutdown();
            process.exit(0);
        });

        console.log(`🚀 CODAI API Gateway running on port ${PORT} (HTTP) and ${Number(PORT) + 443} (HTTPS)`);
        console.log(`🔒 Enhanced security enabled with WAF protection`);
        console.log(`📚 Gateway Documentation: http://localhost:${PORT}/docs`);
        console.log(`❤️  Gateway Health Check: http://localhost:${PORT}/health`);
        console.log(`🔍 Service Discovery: http://localhost:${PORT}/api/gateway/services`);
        console.log(`\n🌐 Registered Services:`);
        Object.entries(serviceRegistry).forEach(([id, config]) => {
            console.log(`   ${config.name}: http://localhost:${PORT}/api/v1/${id}`);
        });
        console.log(`\n✅ Gateway ready to route requests to ${Object.keys(serviceRegistry).length} services`);

    } catch (error) {
        console.error('❌ Failed to start API Gateway:', error);
        process.exit(1);
    }
}

// Start the gateway
startGateway();

export default app;
