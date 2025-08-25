/**
 * Working CODAI Gateway - Port 4000
 * Fixed routing for ecosystem integration
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Service registry - actual running services
const services = {
    'cbd': {
        name: 'CBD Universal Database',
        url: 'http://localhost:4180',
        healthy: true,
        description: 'Universal database service with 6 paradigms'
    },
    'romai': {
        name: 'RomAI AGI Service',
        url: 'http://localhost:6101',
        healthy: true,
        description: 'Romanian AGI cultural intelligence platform'
    },
    'memorai': {
        name: 'MemorAI Service',
        url: 'http://localhost:4006',
        healthy: true,
        description: 'AI memory and context management'
    }
};

// Log requests
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

// Service routes with proxy middleware
Object.entries(services).forEach(([serviceId, config]) => {
    // Create proxy for each service
    const proxyOptions = {
        target: config.url,
        changeOrigin: true,
        pathRewrite: (path) => {
            // Rewrite /api/v1/serviceId/... to /api/...
            return path.replace(`/api/v1/${serviceId}`, '/api');
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${config.url}${req.originalUrl.replace(`/api/v1/${serviceId}`, '/api')}`);
            proxyReq.setHeader('X-Gateway-Service', serviceId);
            proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
        },
        onError: (err, req, res) => {
            console.error(`[PROXY ERROR] ${serviceId}:`, err.message);
            res.status(502).json({
                success: false,
                error: 'Service Unavailable',
                service: serviceId,
                message: `Service is currently unavailable: ${err.message}`,
                timestamp: new Date().toISOString()
            });
        }
    };

    app.use(`/api/v1/${serviceId}`, createProxyMiddleware(proxyOptions));
    console.log(`✅ Configured proxy: /api/v1/${serviceId} -> ${config.url}/api`);
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
            discovery: `http://localhost:${PORT}/api/discovery`
        }
    });
});

// 404 handler
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
            ...Object.keys(services).map(id => `/api/v1/${id}`)
        ],
        timestamp: new Date().toISOString()
    });
});

// Start the gateway
app.listen(PORT, () => {
    console.log(`🚀 CODAI Ecosystem Gateway running on port ${PORT}`);
    console.log(`🔗 Multi-Service Integration Active`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    console.log(`📊 Service Status: http://localhost:${PORT}/api/services`);
    console.log(`🔍 Service Discovery: http://localhost:${PORT}/api/discovery`);
    console.log(`\n🌐 Service Routes:`);

    Object.entries(services).forEach(([id, config]) => {
        console.log(`   ${config.name}:`);
        console.log(`      Proxy: http://localhost:${PORT}/api/v1/${id} -> ${config.url}/api`);
    });

    console.log(`\n✅ Working Gateway ready!`);
});

module.exports = app;