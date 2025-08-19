/**
 * CODAI Ecosystem Gateway - Port 4000
 * Gateway service for routing to all ecosystem services including BancAI
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Service registry with all running services
const services = {
    'bancai': {
        name: 'BancAI Service',
        url: 'http://localhost:4005',
        healthy: true,
        description: 'AI-powered banking and financial services platform'
    },
    'romai': {
        name: 'RomAI Service',
        url: 'http://localhost:6100',
        healthy: true,
        description: 'Romanian AI cultural analysis platform'
    },
    'hub': {
        name: 'Hub Service',
        url: 'http://localhost:4008',
        healthy: true,
        description: 'Service discovery and coordination hub'
    },
    'cbd': {
        name: 'CBD Universal Database',
        url: 'http://localhost:4180',
        healthy: true,
        description: 'Universal database service'
    },
    'memorai': {
        name: 'MemorAI Service',
        url: 'http://localhost:4006',
        healthy: true,
        description: 'AI memory and context management'
    }
};

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        gateway: 'CODAI Ecosystem Gateway',
        port: PORT,
        services: Object.entries(services).map(([id, config]) => ({
            id,
            name: config.name,
            url: config.url,
            status: config.healthy ? 'healthy' : 'unhealthy',
            description: config.description
        })),
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// Service status endpoint
app.get('/api/services', (req, res) => {
    res.json({
        success: true,
        data: {
            services: Object.entries(services).map(([id, config]) => ({
                id,
                name: config.name,
                url: config.url,
                proxyUrl: `http://localhost:${PORT}/api/v1/${id}`,
                status: config.healthy ? 'healthy' : 'unhealthy',
                description: config.description
            })),
            total: Object.keys(services).length,
            healthy: Object.values(services).filter(s => s.healthy).length
        }
    });
});

// Setup proxy middleware for each service with v1 API routing
Object.entries(services).forEach(([serviceId, config]) => {
    const proxyMiddleware = createProxyMiddleware({
        target: config.url,
        changeOrigin: true,
        pathRewrite: {
            [`^/api/v1/${serviceId}`]: '/api' // Route /api/v1/servicename to /api on target service
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[PROXY] ${req.method} ${req.path} -> ${config.url}`);
            proxyReq.setHeader('X-Gateway-Service', serviceId);
            proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
            proxyReq.setHeader('X-Forwarded-For', req.ip);
            proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
        },
        onProxyRes: (proxyRes, req, res) => {
            proxyRes.headers['X-Gateway-Service'] = serviceId;
            proxyRes.headers['X-Gateway-Route'] = req.path;
        },
        onError: (err, req, res) => {
            console.error(`[PROXY ERROR] ${serviceId}:`, err.message);
            res.status(502).json({
                success: false,
                error: 'Service Unavailable',
                service: serviceId,
                serviceName: config.name,
                message: `${config.name} is currently unavailable`,
                timestamp: new Date().toISOString()
            });
        }
    });

    app.use(`/api/v1/${serviceId}`, proxyMiddleware);
    console.log(`✅ Route configured: /api/v1/${serviceId} -> ${config.url}/api`);
});

// Health check proxy routes for direct service health checks
Object.entries(services).forEach(([serviceId, config]) => {
    app.get(`/api/v1/${serviceId}/health`, async (req, res) => {
        try {
            const healthUrl = `${config.url}/api/health`;
            console.log(`[HEALTH CHECK] ${serviceId} -> ${healthUrl}`);

            const response = await fetch(healthUrl, {
                method: 'GET',
                timeout: 5000,
                headers: {
                    'X-Gateway-Service': serviceId,
                    'X-Gateway-Health-Check': 'true'
                }
            });

            if (response.ok) {
                const healthData = await response.json();
                res.json(healthData);
            } else {
                throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error(`[HEALTH CHECK ERROR] ${serviceId}:`, error.message);
            res.status(503).json({
                service: config.name,
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });
});

// CBD Integration endpoints
app.post('/api/cbd/sync', async (req, res) => {
    try {
        const { service, operation, data } = req.body;

        const response = await fetch('http://localhost:4180/document/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                collection: 'ecosystem_operations',
                document: {
                    service,
                    operation,
                    data,
                    timestamp: new Date().toISOString(),
                    gateway: 'CODAI-Gateway-4000'
                }
            })
        });

        if (response.ok) {
            const result = await response.json();
            res.json({
                success: true,
                message: 'Operation synced to CBD',
                cbd_result: result
            });
        } else {
            throw new Error(`CBD sync failed: ${response.statusText}`);
        }
    } catch (error) {
        console.error('[CBD SYNC ERROR]:', error.message);
        res.status(500).json({
            success: false,
            error: 'CBD Sync Failed',
            message: error.message
        });
    }
});

// Service discovery endpoint
app.get('/api/discovery', (req, res) => {
    res.json({
        success: true,
        gateway: 'CODAI Ecosystem Gateway',
        port: PORT,
        services: Object.entries(services).map(([id, config]) => ({
            id,
            name: config.name,
            url: config.url,
            healthEndpoint: `http://localhost:${PORT}/api/v1/${id}/health`,
            proxyEndpoint: `http://localhost:${PORT}/api/v1/${id}`,
            status: config.healthy ? 'healthy' : 'unhealthy',
            description: config.description
        })),
        endpoints: {
            health: `http://localhost:${PORT}/health`,
            services: `http://localhost:${PORT}/api/services`,
            discovery: `http://localhost:${PORT}/api/discovery`,
            cbd_sync: `http://localhost:${PORT}/api/cbd/sync`
        }
    });
});

// Catch-all for unknown routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        path: req.originalUrl,
        gateway: 'CODAI Ecosystem Gateway',
        availableRoutes: [
            '/health',
            '/api/services',
            '/api/discovery',
            '/api/cbd/sync',
            ...Object.keys(services).map(id => `/api/v1/${id}`)
        ],
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start the gateway
app.listen(PORT, () => {
    console.log(`🚀 CODAI Ecosystem Gateway running on port ${PORT}`);
    console.log(`🔗 Multi-Service Integration Active`);
    console.log(`💾 CBD Universal Database: http://localhost:4180`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    console.log(`📊 Service Status: http://localhost:${PORT}/api/services`);
    console.log(`🔍 Service Discovery: http://localhost:${PORT}/api/discovery`);
    console.log(`🔄 CBD Sync: http://localhost:${PORT}/api/cbd/sync`);
    console.log(`\n🌐 Service Routes:`);

    Object.entries(services).forEach(([id, config]) => {
        console.log(`   ${config.name}:`);
        console.log(`      Proxy: http://localhost:${PORT}/api/v1/${id} -> ${config.url}/api`);
        console.log(`      Health: http://localhost:${PORT}/api/v1/${id}/health`);
    });

    console.log(`\n✅ CODAI Ecosystem Gateway ready!`);
});

module.exports = app;
