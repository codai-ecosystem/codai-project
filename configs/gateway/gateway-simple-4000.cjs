/**
 * Simple CODAI Gateway - Port 4000
 * Simple routing without complex proxy middleware
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Service registry
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

// Simple proxy function
const proxyRequest = async (req, res, targetUrl) => {
    try {
        const url = new URL(req.originalUrl.replace('/api/v1/' + req.params.service, '/api'), targetUrl);

        const headers = {
            'Content-Type': req.headers['content-type'] || 'application/json',
            'X-Gateway-Service': req.params.service,
            'X-Gateway-Timestamp': new Date().toISOString(),
            'X-Forwarded-For': req.ip,
            'X-Forwarded-Proto': req.protocol
        };

        // Copy authorization headers
        if (req.headers.authorization) {
            headers.Authorization = req.headers.authorization;
        }

        console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${url.toString()}`);

        const response = await fetch(url.toString(), {
            method: req.method,
            headers: headers,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
        });

        const responseData = await response.text();

        res.status(response.status);
        res.set('X-Gateway-Service', req.params.service);
        res.set('X-Gateway-Route', req.originalUrl);

        try {
            const jsonData = JSON.parse(responseData);
            res.json(jsonData);
        } catch {
            res.send(responseData);
        }
    } catch (error) {
        console.error(`[PROXY ERROR] ${req.params.service}:`, error.message);
        res.status(502).json({
            success: false,
            error: 'Service Unavailable',
            service: req.params.service,
            message: `Service is currently unavailable: ${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
};

// Service proxy routes
app.all('/api/v1/:service/*', async (req, res) => {
    const serviceId = req.params.service;
    const service = services[serviceId];

    if (!service) {
        return res.status(404).json({
            success: false,
            error: 'Service Not Found',
            service: serviceId,
            availableServices: Object.keys(services),
            timestamp: new Date().toISOString()
        });
    }

    await proxyRequest(req, res, service.url);
});

// Service health checks
app.get('/api/v1/:service/health', async (req, res) => {
    const serviceId = req.params.service;
    const service = services[serviceId];

    if (!service) {
        return res.status(404).json({
            success: false,
            error: 'Service Not Found',
            service: serviceId
        });
    }

    try {
        const healthUrl = `${service.url}/api/health`;
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
            service: service.name,
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
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
        console.log(`      Health: http://localhost:${PORT}/api/v1/${id}/health`);
    });

    console.log(`\n✅ Simple Gateway ready!`);
});

module.exports = app;
