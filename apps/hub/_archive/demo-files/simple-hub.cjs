// Simple Express.js Hub Service
// This replaces the complex Next.js version temporarily

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4008;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Hub Service (Simple)',
        version: '1.0.0-simple',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        description: 'Simple Hub Service - CND migration in progress',
        endpoints: {
            '/health': 'Service health check',
            '/api/minimal': 'Minimal API endpoint',
            '/api/services': 'Service discovery endpoint'
        }
    });
});

// Minimal API endpoint
app.get('/api/minimal', (req, res) => {
    res.json({
        success: true,
        message: 'Hub Service is operational',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        data: {
            serviceType: 'hub',
            migration: 'CND to CBD in progress',
            capabilities: ['service-discovery', 'health-monitoring', 'api-routing']
        }
    });
});

// Service discovery endpoint
app.get('/api/services', (req, res) => {
    res.json({
        success: true,
        services: [
            {
                name: 'CBD Universal Database',
                url: 'http://localhost:4180',
                status: 'healthy',
                paradigms: 6
            },
            {
                name: 'API Gateway',
                url: 'http://localhost:4000',
                status: 'healthy',
                services: 10
            },
            {
                name: 'Hub Service',
                url: 'http://localhost:4008',
                status: 'healthy',
                type: 'simple'
            }
        ],
        timestamp: new Date().toISOString()
    });
});

// Catch-all for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        available: ['/health', '/api/minimal', '/api/services'],
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Hub Service',
        version: '1.0.0-simple',
        status: 'healthy',
        description: 'Simple Hub Service for CODAI Ecosystem',
        api: {
            health: '/health',
            services: '/api/services',
            minimal: '/api/minimal'
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Hub Service Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 Simple Hub Service Started
📍 Port: ${PORT}
🌐 URL: http://localhost:${PORT}
❤️  Health: http://localhost:${PORT}/health
🔍 Services: http://localhost:${PORT}/api/services
📡 Minimal API: http://localhost:${PORT}/api/minimal

✅ Ready to handle requests
🔄 CND to CBD migration in progress...
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\\n🛑 Hub Service shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\\n🛑 Hub Service received SIGTERM, shutting down...');
    process.exit(0);
});
