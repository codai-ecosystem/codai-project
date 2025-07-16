// CODAI Ecosystem API Gateway
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const config = require('./ecosystem-config.json');

const app = express();
const PORT = config.ecosystem.integration.api_gateway.port || 8080;

// Enable CORS for all routes
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4030', 'http://localhost:4031', 'http://localhost:4033', 'http://localhost:4066', 'http://localhost:4074'],
    credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        ecosystem: 'CODAI',
        timestamp: new Date().toISOString(),
        services: Object.keys(config.ecosystem.services)
    });
});

// Service discovery endpoint
app.get('/api/services', (req, res) => {
    const services = Object.entries(config.ecosystem.services).map(([key, service]) => ({
        id: key,
        name: service.name,
        url: service.url,
        role: service.role,
        status: 'running' // TODO: Add actual health checks
    }));

    res.json({
        services,
        total: services.length,
        gateway_url: `http://localhost:${PORT}`
    });
});

// Proxy routes for each service
Object.entries(config.ecosystem.integration.api_gateway.routes).forEach(([route, target]) => {
    const serviceName = route.replace('/*', '').replace('/', '');

    app.use(route, createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^/${serviceName}`]: '', // Remove service prefix
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`🔄 Proxying ${req.method} ${req.url} to ${target}`);
        },
        onError: (err, req, res) => {
            console.error(`❌ Proxy error for ${serviceName}:`, err.message);
            res.status(503).json({
                error: 'Service Unavailable',
                service: serviceName,
                message: 'The requested service is temporarily unavailable'
            });
        }
    }));
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'CODAI Ecosystem API Gateway',
        version: config.ecosystem.version,
        services: `/api/services`,
        health: `/health`,
        documentation: '/docs'
    });
});

// Start the gateway
app.listen(PORT, () => {
    console.log(`🚀 CODAI Ecosystem API Gateway running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Service discovery: http://localhost:${PORT}/api/services`);
    console.log(`📋 Available routes:`);

    Object.entries(config.ecosystem.integration.api_gateway.routes).forEach(([route, target]) => {
        console.log(`   ${route} → ${target}`);
    });
});

module.exports = app;
