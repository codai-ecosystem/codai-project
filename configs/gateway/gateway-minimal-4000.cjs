/**
 * Minimal CODAI Gateway - Port 4000
 * Minimal routing for BancAI tests
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

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
        services: [
            { id: 'bancai', name: 'BancAI Service', url: 'http://localhost:4005', status: 'healthy' },
            { id: 'romai', name: 'RomAI Service', url: 'http://localhost:6100', status: 'healthy' },
            { id: 'hub', name: 'Hub Service', url: 'http://localhost:4008', status: 'healthy' }
        ],
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// BancAI health check specifically
app.get('/api/v1/bancai/health', async (req, res) => {
    try {
        console.log('[HEALTH CHECK] bancai -> http://localhost:4005/api/health');

        const response = await fetch('http://localhost:4005/api/health', {
            method: 'GET',
            timeout: 5000,
            headers: {
                'X-Gateway-Service': 'bancai',
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
        console.error('[HEALTH CHECK ERROR] bancai:', error.message);
        res.status(503).json({
            service: 'BancAI Service',
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Generic proxy for BancAI
app.all('/api/v1/bancai*', async (req, res) => {
    try {
        const targetPath = req.path.replace('/api/v1/bancai', '/api');
        const url = 'http://localhost:4005' + targetPath + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');

        console.log(`[PROXY] ${req.method} ${req.path} -> ${url}`);

        const headers = {
            'Content-Type': req.headers['content-type'] || 'application/json',
            'X-Gateway-Service': 'bancai',
            'X-Gateway-Timestamp': new Date().toISOString()
        };

        if (req.headers.authorization) {
            headers.Authorization = req.headers.authorization;
        }

        const response = await fetch(url, {
            method: req.method,
            headers: headers,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
        });

        const responseData = await response.text();

        res.status(response.status);
        res.set('X-Gateway-Service', 'bancai');
        res.set('X-Gateway-Route', req.path);

        try {
            const jsonData = JSON.parse(responseData);
            res.json(jsonData);
        } catch {
            res.send(responseData);
        }
    } catch (error) {
        console.error('[PROXY ERROR] bancai:', error.message);
        res.status(502).json({
            success: false,
            error: 'Service Unavailable',
            service: 'bancai',
            message: `BancAI service is currently unavailable: ${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
});

// Services endpoint
app.get('/api/services', (req, res) => {
    res.json({
        success: true,
        data: {
            services: [
                {
                    id: 'bancai',
                    name: 'BancAI Service',
                    url: 'http://localhost:4005',
                    proxyUrl: `http://localhost:${PORT}/api/v1/bancai`,
                    status: 'healthy',
                    description: 'AI-powered banking platform'
                }
            ],
            total: 1,
            healthy: 1
        }
    });
});

// Catch-all
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        path: req.originalUrl,
        gateway: 'CODAI Ecosystem Gateway',
        availableRoutes: ['/health', '/api/services', '/api/v1/bancai'],
        timestamp: new Date().toISOString()
    });
});

// Start the gateway
app.listen(PORT, () => {
    console.log(`🚀 Minimal CODAI Gateway running on port ${PORT}`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    console.log(`🏦 BancAI Proxy: http://localhost:${PORT}/api/v1/bancai -> http://localhost:4005/api`);
    console.log(`🔍 BancAI Health: http://localhost:${PORT}/api/v1/bancai/health`);
    console.log(`✅ Gateway ready for BancAI tests!`);
});

module.exports = app;
