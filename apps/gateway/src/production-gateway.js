/**
 * CODAI Gateway - Simplified Production Version
 * A lightweight, reliable gateway for the CODAI ecosystem
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4003;
const GATEWAY_NAME = process.env.GATEWAY_NAME || 'CODAI Gateway';

// Security headers middleware
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
};

// Middleware setup
app.use(cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(securityHeaders);

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: GATEWAY_NAME,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        port: PORT,
        environment: process.env.NODE_ENV || 'production'
    });
});

// API health endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: GATEWAY_NAME,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        port: PORT,
        registeredServices: 0,
        activeProxies: 0
    });
});

// Service registry endpoint
app.get('/api/services', (req, res) => {
    res.status(200).json({
        services: [],
        totalServices: 0,
        healthyServices: 0,
        timestamp: new Date().toISOString()
    });
});

// Dashboard endpoint - Simple HTML response
app.get('/dashboard', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CODAI Gateway Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
            .status { color: #28a745; font-weight: bold; font-size: 18px; }
            .info { margin: 10px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
            .metric { display: flex; justify-content: space-between; margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 CODAI Gateway Dashboard</h1>
            <div class="status">Status: Healthy</div>
            <div class="info">
                <h3>Gateway Information</h3>
                <div class="metric"><span>Service:</span><span>${GATEWAY_NAME}</span></div>
                <div class="metric"><span>Version:</span><span>1.0.0</span></div>
                <div class="metric"><span>Port:</span><span>${PORT}</span></div>
                <div class="metric"><span>Uptime:</span><span>${Math.floor(process.uptime())} seconds</span></div>
                <div class="metric"><span>Environment:</span><span>${process.env.NODE_ENV || 'production'}</span></div>
                <div class="metric"><span>Timestamp:</span><span>${new Date().toISOString()}</span></div>
            </div>
            <div class="info">
                <h3>Available Endpoints</h3>
                <ul>
                    <li><a href="/health">/health</a> - Health check</li>
                    <li><a href="/api/health">/api/health</a> - API health check</li>
                    <li><a href="/api/services">/api/services</a> - Service registry</li>
                    <li><a href="/dashboard">/dashboard</a> - This dashboard</li>
                </ul>
            </div>
        </div>
    </body>
    </html>`;
    res.send(html);
});

// Root endpoint
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// Catch-all route
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint was not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Gateway Error:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ${GATEWAY_NAME} started successfully`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`⚡ Ready to handle requests on port ${PORT}`);
});

module.exports = app;