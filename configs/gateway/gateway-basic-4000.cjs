/**
 * Basic HTTP Gateway - Port 4000
 * Using Node.js built-in HTTP server to avoid Express routing issues
 */

const http = require('http');
const { URL } = require('url');

const PORT = 4000;

// Service registry
const services = {
    'bancai': {
        name: 'BancAI Service',
        url: 'http://localhost:4005',
        healthy: true,
        description: 'AI-powered banking and financial services platform'
    }
};

// Simple JSON response helper
const sendJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
    });
    res.end(JSON.stringify(data, null, 2));
};

// Proxy function
const proxyRequest = async (req, res, targetUrl) => {
    try {
        const url = new URL(req.url.replace('/api/v1/bancai', '/api'), targetUrl);

        console.log(`[PROXY] ${req.method} ${req.url} -> ${url.toString()}`);

        // Collect request body for POST/PUT requests
        let body = '';
        if (req.method === 'POST' || req.method === 'PUT') {
            for await (const chunk of req) {
                body += chunk;
            }
        }

        const headers = {
            'Content-Type': req.headers['content-type'] || 'application/json',
            'X-Gateway-Service': 'bancai',
            'X-Gateway-Timestamp': new Date().toISOString()
        };

        if (req.headers.authorization) {
            headers.Authorization = req.headers.authorization;
        }

        const response = await fetch(url.toString(), {
            method: req.method,
            headers: headers,
            body: body || undefined
        });

        const responseData = await response.text();

        res.writeHead(response.status, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Gateway-Service': 'bancai',
            'X-Gateway-Route': req.url
        });

        res.end(responseData);
    } catch (error) {
        console.error('[PROXY ERROR] bancai:', error.message);
        sendJSON(res, 502, {
            success: false,
            error: 'Service Unavailable',
            service: 'bancai',
            message: `BancAI service is currently unavailable: ${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
};

// Main server
const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

    console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
        });
        res.end();
        return;
    }

    // Routes
    if (pathname === '/health' && req.method === 'GET') {
        sendJSON(res, 200, {
            status: 'healthy',
            gateway: 'CODAI Basic Gateway',
            port: PORT,
            services: [
                { id: 'bancai', name: 'BancAI Service', url: 'http://localhost:4005', status: 'healthy' }
            ],
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString()
        });
    }
    else if (pathname === '/api/services' && req.method === 'GET') {
        sendJSON(res, 200, {
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
    }
    else if (pathname.startsWith('/api/v1/bancai')) {
        await proxyRequest(req, res, 'http://localhost:4005');
    }
    else {
        sendJSON(res, 404, {
            success: false,
            error: 'Not Found',
            path: pathname,
            gateway: 'CODAI Basic Gateway',
            availableRoutes: ['/health', '/api/services', '/api/v1/bancai'],
            timestamp: new Date().toISOString()
        });
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 CODAI Basic Gateway running on port ${PORT}`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    console.log(`🏦 BancAI Proxy: http://localhost:${PORT}/api/v1/bancai -> http://localhost:4005/api`);
    console.log(`🔍 BancAI Health: http://localhost:${PORT}/api/v1/bancai/health`);
    console.log(`📊 Services: http://localhost:${PORT}/api/services`);
    console.log(`✅ Basic Gateway ready for BancAI tests!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => process.exit(0));
});

module.exports = server;
