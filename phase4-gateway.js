/**
 * CODAI Phase 4 - Ecosystem Integration Gateway
 * Simple Node.js gateway to connect services through CBD Universal Database
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Service registry with current running services
const services = {
    'codai': {
        name: 'CODAI Main App',
        url: 'http://localhost:4001',
        healthy: true
    },
    'hub': {
        name: 'Hub App',
        url: 'http://localhost:4008',
        healthy: true
    },
    'cbd': {
        name: 'CBD Universal Database',
        url: 'http://localhost:4180',
        healthy: true
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
        gateway: 'Phase 4 Gateway',
        services: Object.entries(services).map(([id, config]) => ({
            id,
            name: config.name,
            url: config.url,
            status: config.healthy ? 'healthy' : 'unhealthy'
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
                proxyUrl: `http://localhost:${PORT}/api/${id}`,
                status: config.healthy ? 'healthy' : 'unhealthy'
            })),
            total: Object.keys(services).length,
            healthy: Object.values(services).filter(s => s.healthy).length
        }
    });
});

// Setup proxy middleware for each service
Object.entries(services).forEach(([serviceId, config]) => {
    const proxyMiddleware = createProxyMiddleware({
        target: config.url,
        changeOrigin: true,
        pathRewrite: {
            [`^/api/${serviceId}`]: '' // Remove the service prefix
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[PROXY] ${req.method} ${req.path} -> ${config.url}`);
            proxyReq.setHeader('X-Gateway-Service', serviceId);
            proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
        },
        onError: (err, req, res) => {
            console.error(`[PROXY ERROR] ${serviceId}:`, err.message);
            res.status(502).json({
                success: false,
                error: 'Service Unavailable',
                service: serviceId,
                message: `${config.name} is currently unavailable`
            });
        }
    });

    app.use(`/api/${serviceId}`, proxyMiddleware);
    console.log(`✅ Route configured: /api/${serviceId} -> ${config.url}`);
});

// CBD Integration endpoints
app.post('/api/cbd/sync', async (req, res) => {
    try {
        const { service, operation, data } = req.body;

        // Store operation in CBD document storage
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
                    gateway: 'Phase4-Gateway'
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

// CBD Data retrieval endpoint
app.get('/api/cbd/operations', async (req, res) => {
    try {
        const response = await fetch('http://localhost:4180/stats');

        if (response.ok) {
            const stats = await response.json();
            res.json({
                success: true,
                data: {
                    cbd_status: stats,
                    message: 'CBD operations retrieved successfully'
                }
            });
        } else {
            throw new Error(`CBD query failed: ${response.statusText}`);
        }
    } catch (error) {
        console.error('[CBD QUERY ERROR]:', error.message);
        res.status(500).json({
            success: false,
            error: 'CBD Query Failed',
            message: error.message
        });
    }
});

// Catch-all for unknown routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        path: req.originalUrl,
        availableRoutes: [
            '/health',
            '/api/services',
            '/api/cbd/sync',
            '/api/cbd/operations',
            ...Object.keys(services).map(id => `/api/${id}`)
        ]
    });
});

// Start the gateway
app.listen(PORT, () => {
    console.log(`🚀 CODAI Phase 4 Gateway running on port ${PORT}`);
    console.log(`🔗 Ecosystem Integration Active`);
    console.log(`💾 CBD Universal Database: http://localhost:4180`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    console.log(`📊 Service Status: http://localhost:${PORT}/api/services`);
    console.log(`🔄 CBD Sync: http://localhost:${PORT}/api/cbd/sync`);
    console.log(`📈 CBD Operations: http://localhost:${PORT}/api/cbd/operations`);
    console.log(`\n🌐 Service Routes:`);

    Object.entries(services).forEach(([id, config]) => {
        console.log(`   ${config.name}: http://localhost:${PORT}/api/${id} -> ${config.url}`);
    });

    console.log(`\n✅ Phase 4 Gateway ready for ecosystem integration!`);
});

module.exports = app;
