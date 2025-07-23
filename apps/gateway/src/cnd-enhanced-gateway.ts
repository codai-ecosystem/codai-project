/**
 * CODAI Ecosystem API Gateway - CND Enhanced
 * Phase 2 Implementation: Enterprise CND Integration
 * 
 * Features:
 * - CND Authentication Manager integration
 * - CND Service Discovery with dynamic routing
 * - CND Audit logging for all requests/responses
 * - CND Metrics monitoring and Prometheus integration
 * - Enterprise security and performance optimization
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { setupSecurity } from '@codai/security';
import swaggerUi from 'swagger-ui-express';
import { CND } from '@codai/cnd';
import { z } from 'zod';

const app = express();
const PORT = process.env.GATEWAY_PORT || 4000;

// Initialize CND with enterprise features for Gateway
let cndInstance: CND;

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

// Base service registry (will be enhanced with CND service discovery)
const staticServiceRegistry: Record<string, ServiceConfig> = {
    // Core Services
    'codai': {
        name: 'CODAI Service',
        url: 'http://localhost:4001',
        port: 4001,
        path: '/api/v1/codai',
        healthPath: '/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'AI processing and development platform',
        version: '1.0.0',
        category: 'core'
    },
    'admin': {
        name: 'Admin Service',
        url: 'http://localhost:4002',
        port: 4002,
        path: '/api/v1/admin',
        healthPath: '/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Administration and management',
        version: '1.0.0',
        category: 'core'
    },
    'hub': {
        name: 'Hub Service',
        url: 'http://localhost:4003',
        port: 4003,
        path: '/api/v1/hub',
        healthPath: '/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Central coordination hub',
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
        description: 'Identity and authentication',
        version: '1.0.0',
        category: 'core'
    },
    'bancai': {
        name: 'BancAI Service',
        url: 'http://localhost:4005',
        port: 4005,
        path: '/api/v1/bancai',
        healthPath: '/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Banking and financial services',
        version: '1.0.0',
        category: 'business'
    }
};

// Enhanced security setup with CND integration
async function initializeCNDSecurity() {
    console.log('🔒 Initializing CND-enhanced API Gateway security...');

    // Initialize CND with enterprise configuration
    const cndConfig = {
        connectionString: process.env.CND_CONNECTION_STRING || 'cnd://localhost:5432/gateway_db',
        enterprise: {
            enabled: true,
            features: {
                serviceDiscovery: true,
                authentication: true,
                authorization: true,
                audit: true,
                monitoring: true,
                encryption: process.env.NODE_ENV === 'production',
                clustering: false // Will be enabled in Phase 6
            },
            serviceDiscovery: {
                enabled: true,
                serviceName: 'api-gateway',
                port: PORT,
                healthCheckPath: '/health',
                metadata: {
                    version: '2.0.0',
                    category: 'infrastructure',
                    capabilities: ['routing', 'authentication', 'rate-limiting', 'load-balancing']
                }
            },
            authentication: {
                enabled: true,
                jwtSecret: process.env.JWT_SECRET || 'gateway-secret-key',
                sessionTimeout: 3600000, // 1 hour
                tokenRefreshThreshold: 300000 // 5 minutes
            },
            authorization: {
                enabled: true,
                defaultRole: 'user',
                adminRoles: ['admin', 'gateway-admin'],
                roles: {
                    'admin': {
                        permissions: ['*']
                    },
                    'gateway-admin': {
                        permissions: ['gateway:*', 'services:read', 'metrics:read']
                    },
                    'service-consumer': {
                        permissions: ['services:read', 'api:call']
                    },
                    'user': {
                        permissions: ['api:call:basic']
                    }
                }
            },
            audit: {
                enabled: true,
                logLevel: 'detailed',
                storage: 'database',
                includeRequestBody: true,
                includeResponseBody: false,
                retentionDays: 90
            },
            monitoring: {
                enabled: true,
                metricsEnabled: true,
                healthChecksEnabled: true,
                performanceTracking: true,
                customMetrics: {
                    'gateway_requests_total': 'counter',
                    'gateway_request_duration': 'histogram',
                    'gateway_service_health': 'gauge',
                    'gateway_active_connections': 'gauge'
                }
            }
        }
    };

    cndInstance = new CND(cndConfig);
    await cndInstance.connect();

    // Register initial services with CND service discovery
    for (const [serviceId, config] of Object.entries(staticServiceRegistry)) {
        await cndInstance.registerService(serviceId, {
            name: config.name,
            url: config.url,
            port: config.port,
            healthPath: config.healthPath,
            description: config.description,
            version: config.version,
            category: config.category,
            metadata: {
                path: config.path,
                registeredBy: 'gateway',
                registrationTime: new Date().toISOString()
            }
        });
    }

    console.log('✅ CND enterprise features initialized');
    console.log('🔍 Service discovery enabled with', Object.keys(staticServiceRegistry).length, 'services registered');

    return cndInstance;
}

// CND Authentication middleware (replaces JWT middleware)
const cndAuthenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            await cndInstance.logAudit({
                action: 'authentication_failed',
                resource: req.path,
                userId: 'anonymous',
                details: { reason: 'missing_token', ip: req.ip, userAgent: req.get('User-Agent') },
                timestamp: new Date(),
                severity: 'warning'
            });

            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Access token is required',
                code: 'TOKEN_REQUIRED'
            });
        }

        // Use CND authentication manager
        const authResult = await cndInstance.authenticateToken(token);

        if (!authResult.isValid) {
            await cndInstance.logAudit({
                action: 'authentication_failed',
                resource: req.path,
                userId: authResult.user?.id || 'unknown',
                details: { reason: 'invalid_token', ip: req.ip, userAgent: req.get('User-Agent') },
                timestamp: new Date(),
                severity: 'warning'
            });

            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }

        // Add user context to request
        (req as any).user = authResult.user;
        (req as any).permissions = authResult.permissions;

        // Log successful authentication
        await cndInstance.logAudit({
            action: 'authentication_success',
            resource: req.path,
            userId: authResult.user.id,
            details: { ip: req.ip, userAgent: req.get('User-Agent') },
            timestamp: new Date(),
            severity: 'info'
        });

        next();
    } catch (error) {
        console.error('[GATEWAY] CND Authentication error:', error);

        await cndInstance.logAudit({
            action: 'authentication_error',
            resource: req.path,
            userId: 'system',
            details: { error: error.message, ip: req.ip },
            timestamp: new Date(),
            severity: 'error'
        });

        res.status(500).json({
            success: false,
            error: 'Authentication Error',
            message: 'Authentication service temporarily unavailable',
            code: 'AUTH_SERVICE_ERROR'
        });
    }
};

// CND Authorization middleware
const cndAuthorize = (requiredPermission: string) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const user = (req as any).user;
            const permissions = (req as any).permissions || [];

            // Check if user has required permission
            const hasPermission = permissions.includes(requiredPermission) || permissions.includes('*');

            if (!hasPermission) {
                await cndInstance.logAudit({
                    action: 'authorization_failed',
                    resource: req.path,
                    userId: user?.id || 'unknown',
                    details: {
                        requiredPermission,
                        userPermissions: permissions,
                        ip: req.ip
                    },
                    timestamp: new Date(),
                    severity: 'warning'
                });

                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: `Insufficient permissions. Required: ${requiredPermission}`,
                    code: 'INSUFFICIENT_PERMISSIONS'
                });
            }

            next();
        } catch (error) {
            console.error('[GATEWAY] CND Authorization error:', error);
            res.status(500).json({
                success: false,
                error: 'Authorization Error',
                message: 'Authorization service temporarily unavailable',
                code: 'AUTH_SERVICE_ERROR'
            });
        }
    };
};

// CND Audit logging middleware for all requests
const cndAuditMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add request ID to headers
    req.headers['x-request-id'] = requestId;

    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;

    let responseBody: any = null;

    // Override response methods to capture response
    res.send = function (body) {
        responseBody = body;
        return originalSend.call(this, body);
    };

    res.json = function (body) {
        responseBody = body;
        return originalJson.call(this, body);
    };

    // Log request start
    await cndInstance.logAudit({
        action: 'request_start',
        resource: req.path,
        userId: (req as any).user?.id || 'anonymous',
        details: {
            method: req.method,
            path: req.path,
            query: req.query,
            headers: {
                'user-agent': req.get('User-Agent'),
                'content-type': req.get('Content-Type'),
                'x-forwarded-for': req.get('X-Forwarded-For')
            },
            ip: req.ip,
            requestId
        },
        timestamp: new Date(),
        severity: 'info'
    });

    // Handle response completion
    res.on('finish', async () => {
        const duration = Date.now() - startTime;

        await cndInstance.logAudit({
            action: 'request_complete',
            resource: req.path,
            userId: (req as any).user?.id || 'anonymous',
            details: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration,
                requestId,
                success: res.statusCode < 400
            },
            timestamp: new Date(),
            severity: res.statusCode >= 400 ? 'warning' : 'info'
        });

        // Update metrics
        await cndInstance.recordMetric('gateway_requests_total', 1, {
            method: req.method,
            status_code: res.statusCode.toString(),
            path: req.route?.path || req.path
        });

        await cndInstance.recordMetric('gateway_request_duration', duration, {
            method: req.method,
            path: req.route?.path || req.path
        });
    });

    next();
};

// CND Service discovery integration
async function getServiceFromCND(serviceId: string): Promise<ServiceConfig | null> {
    try {
        const service = await cndInstance.discoverService(serviceId);
        if (!service) {
            return staticServiceRegistry[serviceId] || null;
        }

        return {
            name: service.name,
            url: service.url,
            port: service.port,
            path: service.metadata?.path || `/api/v1/${serviceId}`,
            healthPath: service.healthPath,
            isHealthy: service.isHealthy,
            lastHealthCheck: new Date(service.lastHealthCheck),
            description: service.description,
            version: service.version,
            category: service.category as 'core' | 'business' | 'utility'
        };
    } catch (error) {
        console.error(`[GATEWAY] Failed to discover service ${serviceId}:`, error);
        return staticServiceRegistry[serviceId] || null;
    }
}

// Enhanced health check with CND integration
async function performCNDHealthCheck(serviceId: string): Promise<boolean> {
    try {
        const service = await getServiceFromCND(serviceId);
        if (!service) return false;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${service.url}${service.healthPath}`, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const isHealthy = response.ok;

        // Update health status in CND
        await cndInstance.updateServiceHealth(serviceId, isHealthy);

        // Record health metric
        await cndInstance.recordMetric('gateway_service_health', isHealthy ? 1 : 0, {
            service_id: serviceId,
            service_name: service.name
        });

        return isHealthy;
    } catch (error) {
        console.error(`[GATEWAY] Health check failed for ${serviceId}:`, error);
        await cndInstance.updateServiceHealth(serviceId, false);
        await cndInstance.recordMetric('gateway_service_health', 0, {
            service_id: serviceId,
            error: error.message
        });
        return false;
    }
}

// Enhanced proxy middleware with CND features
const createCNDServiceProxy = (serviceId: string) => {
    return createProxyMiddleware({
        target: async (req) => {
            const service = await getServiceFromCND(serviceId);
            return service?.url || `http://localhost:4001`; // Fallback
        },
        changeOrigin: true,
        pathRewrite: {
            [`^/api/v1/${serviceId}`]: '/api/v1'
        },
        onProxyReq: async (proxyReq, req, res) => {
            // Add CND tracking headers
            proxyReq.setHeader('X-Gateway-Service', serviceId);
            proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
            proxyReq.setHeader('X-Request-ID', req.headers['x-request-id']);
            proxyReq.setHeader('X-CND-Enabled', 'true');

            // Add user context if available
            if ((req as any).user) {
                proxyReq.setHeader('X-User-ID', (req as any).user.id);
                proxyReq.setHeader('X-User-Role', (req as any).user.role);
            }

            console.log(`[GATEWAY] CND Routing ${req.method} ${req.path} to ${serviceId} service`);
        },
        onProxyRes: (proxyRes, req, res) => {
            // Add CND response headers
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['X-Powered-By'] = 'CODAI CND Gateway';
            proxyRes.headers['X-Service'] = serviceId;
            proxyRes.headers['X-CND-Enhanced'] = 'true';
        },
        onError: async (err, req, res) => {
            console.error(`[GATEWAY] CND Proxy error for ${serviceId}:`, err.message);

            // Log error to CND audit
            await cndInstance.logAudit({
                action: 'proxy_error',
                resource: req.path,
                userId: (req as any).user?.id || 'system',
                details: {
                    serviceId,
                    error: err.message,
                    method: req.method,
                    path: req.path
                },
                timestamp: new Date(),
                severity: 'error'
            });

            (res as express.Response).status(502).json({
                success: false,
                error: 'Bad Gateway',
                message: `Service ${serviceId} is temporarily unavailable`,
                code: 'SERVICE_UNAVAILABLE',
                service: serviceId,
                requestId: req.headers['x-request-id']
            });
        }
    });
};

// Enhanced Gateway API endpoints with CND integration
app.get('/api/gateway/health', async (req, res) => {
    try {
        const cndHealth = await cndInstance.getHealthStatus();
        const services = await cndInstance.discoverAllServices();

        const healthStatus = {
            gateway: {
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                version: '2.0.0-cnd',
                cndEnabled: true,
                cndHealth: cndHealth
            },
            services: services.map(service => ({
                id: service.id,
                name: service.name,
                status: service.isHealthy ? 'healthy' : 'unhealthy',
                url: service.url,
                lastHealthCheck: service.lastHealthCheck,
                category: service.category
            }))
        };

        const allHealthy = services.every(service => service.isHealthy);
        const statusCode = allHealthy ? 200 : 503;

        res.status(statusCode).json({
            success: allHealthy,
            data: healthStatus,
            message: allHealthy ? 'All services are healthy' : 'Some services are unhealthy'
        });
    } catch (error) {
        console.error('[GATEWAY] Health check error:', error);
        res.status(500).json({
            success: false,
            error: 'Health Check Error',
            message: 'Unable to perform health check',
            code: 'HEALTH_CHECK_ERROR'
        });
    }
});

app.get('/api/gateway/services', cndAuthenticateToken, cndAuthorize('services:read'), async (req, res) => {
    try {
        const services = await cndInstance.discoverAllServices();

        const servicesData = services.map(service => ({
            id: service.id,
            name: service.name,
            description: service.description,
            version: service.version,
            category: service.category,
            endpoint: `${req.protocol}://${req.get('host')}/api/v1/${service.id}`,
            documentation: `${req.protocol}://${req.get('host')}/api/v1/${service.id}/docs`,
            status: service.isHealthy ? 'healthy' : 'unhealthy',
            lastHealthCheck: service.lastHealthCheck,
            metadata: service.metadata
        }));

        res.json({
            success: true,
            data: {
                services: servicesData,
                total: servicesData.length,
                healthy: servicesData.filter(s => s.status === 'healthy').length,
                categories: {
                    core: servicesData.filter(s => s.category === 'core').length,
                    business: servicesData.filter(s => s.category === 'business').length,
                    utility: servicesData.filter(s => s.category === 'utility').length
                }
            },
            message: 'Service registry retrieved successfully from CND'
        });
    } catch (error) {
        console.error('[GATEWAY] Services list error:', error);
        res.status(500).json({
            success: false,
            error: 'Service Discovery Error',
            message: 'Unable to retrieve services from CND',
            code: 'DISCOVERY_ERROR'
        });
    }
});

app.get('/api/gateway/metrics', cndAuthenticateToken, cndAuthorize('metrics:read'), async (req, res) => {
    try {
        const cndMetrics = await cndInstance.getCurrentMetrics();
        const prometheusMetrics = await cndInstance.exportPrometheusMetrics();

        const metrics = {
            gateway: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
                platform: process.platform,
                nodeVersion: process.version,
                cndEnabled: true
            },
            cnd: cndMetrics,
            prometheus: prometheusMetrics,
            requests: {
                // Get these from CND metrics
                total: cndMetrics['gateway_requests_total'] || 0,
                successful: cndMetrics['gateway_requests_success'] || 0,
                failed: cndMetrics['gateway_requests_failed'] || 0,
                averageResponseTime: cndMetrics['gateway_request_duration_avg'] || 0
            }
        };

        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[GATEWAY] Metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Metrics Error',
            message: 'Unable to retrieve metrics from CND',
            code: 'METRICS_ERROR'
        });
    }
});

// Enhanced service discovery endpoint
app.get('/api/gateway/discover/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const service = await getServiceFromCND(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found',
                message: `Service '${serviceId}' is not registered in CND`,
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
                lastHealthCheck: service.lastHealthCheck,
                cndManaged: true
            },
            message: 'Service discovery successful via CND'
        });
    } catch (error) {
        console.error('[GATEWAY] Service discovery error:', error);
        res.status(500).json({
            success: false,
            error: 'Discovery Error',
            message: 'Unable to discover service via CND',
            code: 'CND_DISCOVERY_ERROR'
        });
    }
});

// Periodic CND health checks
setInterval(async () => {
    try {
        const services = await cndInstance.discoverAllServices();
        const healthChecks = services.map(service =>
            performCNDHealthCheck(service.id)
        );
        await Promise.all(healthChecks);

        // Record overall gateway health
        await cndInstance.recordMetric('gateway_active_connections', services.length);
    } catch (error) {
        console.error('[GATEWAY] Periodic health check error:', error);
    }
}, 30000); // Check every 30 seconds

// Apply global middleware
app.use(express.json());
app.use(cndAuditMiddleware);

// Enhanced documentation with CND information
const generateCNDEnhancedApiDocs = () => {
    return {
        openapi: '3.0.0',
        info: {
            title: 'CODAI Ecosystem API Gateway - CND Enhanced',
            version: '2.0.0',
            description: 'Enterprise-grade API gateway powered by CND (CODAI Network Database) with advanced authentication, service discovery, audit logging, and monitoring capabilities.',
            contact: {
                name: 'CODAI Team',
                url: 'https://codai.ro'
            }
        },
        servers: [
            {
                url: '/api/v1',
                description: 'CND-Enhanced Gateway API Server'
            }
        ],
        components: {
            securitySchemes: {
                CND_BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'CND-managed JWT authentication'
                }
            },
            schemas: {
                CNDServiceInfo: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        version: { type: 'string' },
                        category: { type: 'string', enum: ['core', 'business', 'utility'] },
                        status: { type: 'string', enum: ['healthy', 'unhealthy'] },
                        cndManaged: { type: 'boolean', example: true }
                    }
                }
            }
        },
        paths: {
            '/gateway/health': {
                get: {
                    tags: ['CND Gateway Management'],
                    summary: 'CND-enhanced health status',
                    description: 'Get comprehensive health status including CND enterprise features',
                    responses: {
                        '200': {
                            description: 'Health status with CND integration details'
                        }
                    }
                }
            },
            '/gateway/services': {
                get: {
                    tags: ['CND Gateway Management'],
                    summary: 'CND service discovery',
                    description: 'List all services discovered through CND service registry',
                    security: [{ CND_BearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'Services from CND service discovery'
                        }
                    }
                }
            },
            '/gateway/metrics': {
                get: {
                    tags: ['CND Gateway Management'],
                    summary: 'CND metrics and monitoring',
                    description: 'Comprehensive metrics including CND performance data',
                    security: [{ CND_BearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'CND-enhanced metrics and monitoring data'
                        }
                    }
                }
            }
        }
    };
};

// CND-enhanced documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(generateCNDEnhancedApiDocs(), {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CODAI CND-Enhanced API Gateway Documentation'
}));

// Dynamic service routing with CND discovery
async function setupDynamicRouting() {
    try {
        const services = await cndInstance.discoverAllServices();

        for (const service of services) {
            const serviceId = service.id;

            // Public health check routes (no auth required)
            app.use(`/api/v1/${serviceId}/health`, createCNDServiceProxy(serviceId));
            app.use(`/api/v1/${serviceId}/ready`, createCNDServiceProxy(serviceId));

            // Documentation routes (no auth required)
            app.use(`/api/v1/${serviceId}/docs`, createCNDServiceProxy(serviceId));

            // All other routes require CND authentication
            app.use(`/api/v1/${serviceId}`, cndAuthenticateToken, createCNDServiceProxy(serviceId));

            console.log(`📍 Route configured for ${service.name}: /api/v1/${serviceId}`);
        }
    } catch (error) {
        console.error('[GATEWAY] Dynamic routing setup failed:', error);

        // Fallback to static routing
        Object.keys(staticServiceRegistry).forEach(serviceId => {
            app.use(`/api/v1/${serviceId}/health`, createCNDServiceProxy(serviceId));
            app.use(`/api/v1/${serviceId}/ready`, createCNDServiceProxy(serviceId));
            app.use(`/api/v1/${serviceId}/docs`, createCNDServiceProxy(serviceId));
            app.use(`/api/v1/${serviceId}`, cndAuthenticateToken, createCNDServiceProxy(serviceId));
        });
    }
}

// Enhanced error handling with CND audit logging
app.use('*', async (req, res) => {
    await cndInstance.logAudit({
        action: 'route_not_found',
        resource: req.path,
        userId: (req as any).user?.id || 'anonymous',
        details: { method: req.method, path: req.path, ip: req.ip },
        timestamp: new Date(),
        severity: 'warning'
    });

    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'The requested endpoint was not found',
        code: 'ENDPOINT_NOT_FOUND',
        cndEnabled: true,
        suggestion: 'Use /api/gateway/services to discover available services'
    });
});

// Global error handler with CND integration
app.use(async (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[GATEWAY] Unhandled error:', error);

    await cndInstance.logAudit({
        action: 'unhandled_error',
        resource: req.path,
        userId: (req as any).user?.id || 'system',
        details: {
            error: error.message,
            stack: error.stack,
            method: req.method,
            path: req.path,
            ip: req.ip
        },
        timestamp: new Date(),
        severity: 'error'
    });

    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        requestId: req.headers['x-request-id'],
        cndEnabled: true
    });
});

// Start the CND-enhanced gateway
async function startCNDGateway() {
    try {
        console.log('🚀 Starting CODAI CND-Enhanced API Gateway...');

        // Initialize CND with enterprise features
        await initializeCNDSecurity();

        // Initialize traditional security (as backup)
        const securityConfig = {
            serviceName: 'cnd-api-gateway',
            port: PORT,
            app: app,
            httpsEnabled: process.env.NODE_ENV === 'production',
            wafEnabled: true,
            rateLimitEnabled: true
        };
        const securityIntegration = await setupSecurity(securityConfig);

        // Health endpoints
        app.get('/health', async (req, res) => {
            const cndHealth = await cndInstance.getHealthStatus();
            res.json({
                service: 'cnd-api-gateway',
                status: 'healthy',
                description: 'CODAI Ecosystem CND-Enhanced API Gateway',
                timestamp: new Date().toISOString(),
                cnd: cndHealth,
                security: securityIntegration.getSecurityStats(),
                uptime: process.uptime(),
                version: '2.0.0-cnd',
                features: ['service-discovery', 'authentication', 'audit', 'monitoring']
            });
        });

        // Setup dynamic routing based on CND service discovery
        await setupDynamicRouting();

        // Graceful shutdown with CND cleanup
        const gracefulShutdown = async (signal: string) => {
            console.log(`[GATEWAY] Received ${signal}, shutting down gracefully...`);

            try {
                await cndInstance.logAudit({
                    action: 'gateway_shutdown',
                    resource: 'system',
                    userId: 'system',
                    details: { signal, uptime: process.uptime() },
                    timestamp: new Date(),
                    severity: 'info'
                });

                await cndInstance.disconnect();
                await securityIntegration.shutdown();
                process.exit(0);
            } catch (error) {
                console.error('[GATEWAY] Shutdown error:', error);
                process.exit(1);
            }
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        console.log(`🚀 CODAI CND-Enhanced API Gateway running on port ${PORT}`);
        console.log(`🔒 Enterprise CND features: Authentication, Authorization, Audit, Monitoring`);
        console.log(`🔍 CND Service Discovery: Dynamic routing enabled`);
        console.log(`📚 Enhanced Documentation: http://localhost:${PORT}/docs`);
        console.log(`❤️  CND Health Check: http://localhost:${PORT}/health`);
        console.log(`🌐 Service Discovery API: http://localhost:${PORT}/api/gateway/services`);
        console.log(`📊 CND Metrics: http://localhost:${PORT}/api/gateway/metrics`);

        const services = await cndInstance.discoverAllServices();
        console.log(`\n🌐 CND Discovered Services (${services.length}):`);
        services.forEach(service => {
            console.log(`   ${service.name}: http://localhost:${PORT}/api/v1/${service.id}`);
        });

        console.log(`\n✅ CND-Enhanced Gateway ready with enterprise features!`);

    } catch (error) {
        console.error('❌ Failed to start CND-Enhanced API Gateway:', error);
        process.exit(1);
    }
}

// Start the gateway
startCNDGateway();

export default app;
