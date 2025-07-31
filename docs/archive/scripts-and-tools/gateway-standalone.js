/**
 * CODAI Ecosystem API Gateway - Standalone Version
 * Simplified version for testing health endpoints
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = parseInt(process.env.GATEWAY_PORT || '4000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(express.json());

// Service registry with health status
const serviceRegistry = {
    'codai': {
        name: 'CODAI Service',
        url: 'http://localhost:4001',
        port: 4001,
        path: '/api/v1/codai',
        healthPath: '/health',
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
        healthPath: '/api/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Administration and user management',
        version: '2.0.0',
        category: 'core'
    },
    'hub': {
        name: 'HUB Service',
        url: 'http://localhost:4003',
        port: 4003,
        path: '/api/v1/hub',
        healthPath: '/api/health',
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
        healthPath: '/api/health',
        isHealthy: false,
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
        healthPath: '/api/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Financial services and banking',
        version: '1.0.0',
        category: 'business'
    },
    'memorai': {
        name: 'MEMORAI Service',
        url: 'http://localhost:4006',
        port: 4006,
        path: '/api/v1/memorai',
        healthPath: '/api/health',
        isHealthy: true,
        lastHealthCheck: new Date(),
        description: 'Memory storage and recall system',
        version: '7.2.1',
        category: 'core'
    }
};

// Health check for individual services
async function checkServiceHealth(serviceId) {
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

// Gateway health endpoint
app.get('/health', (req, res) => {
    const healthStatus = {
        gateway: {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: '2.0.0-standalone'
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

// Gateway services list
app.get('/api/gateway/services', (req, res) => {
    const services = Object.entries(serviceRegistry).map(([id, config]) => ({
        id,
        name: config.name,
        description: config.description,
        version: config.version,
        category: config.category,
        endpoint: `${req.protocol}://${req.get('host')}/api/v1/${id}`,
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

// Create proxy middleware for services
const createServiceProxy = (serviceId) => {
    return createProxyMiddleware({
        target: serviceRegistry[serviceId].url,
        changeOrigin: true,
        pathRewrite: (path, req) => {
            if (path.includes('/health')) {
                return serviceRegistry[serviceId].healthPath;
            }
            return path.replace(`/api/v1/${serviceId}`, '');
        },
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('X-Gateway-Service', serviceId);
            proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
            console.log(`[GATEWAY] Routing ${req.method} ${req.path} to ${serviceId} service`);
        },
        onError: (err, req, res) => {
            console.error(`[GATEWAY] Proxy error for ${serviceId}:`, err.message);
            res.status(502).json({
                success: false,
                error: 'Bad Gateway',
                message: `Service ${serviceId} is temporarily unavailable`,
                code: 'SERVICE_UNAVAILABLE',
                service: serviceId
            });
        }
    });
};

// Service routing
Object.keys(serviceRegistry).forEach(serviceId => {
    // Health check routes (no auth required)
    app.use(`/api/v1/${serviceId}/health`, createServiceProxy(serviceId));
    
    // All other routes
    app.use(`/api/v1/${serviceId}`, createServiceProxy(serviceId));
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

// Start the gateway
app.listen(PORT, () => {
    console.log(`🚀 CODAI API Gateway (Standalone) running on port ${PORT}`);
    console.log(`❤️  Gateway Health Check: http://localhost:${PORT}/health`);
    console.log(`🔍 Service Discovery: http://localhost:${PORT}/api/gateway/services`);
    console.log(`\n🌐 Registered Services:`);
    Object.entries(serviceRegistry).forEach(([id, config]) => {
        console.log(`   ${config.name}: http://localhost:${PORT}/api/v1/${id}`);
    });
    console.log(`\n✅ Gateway ready to route requests to ${Object.keys(serviceRegistry).length} services`);
});

export default app;
