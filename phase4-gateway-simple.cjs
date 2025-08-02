/**
 * CODAI Phase 4 - Ecosystem Integration Gateway (Simplified)
 * Basic Node.js HTTP server for service integration through CBD
 */

const http = require('http');
const url = require('url');

const PORT = 3000;

// Service registry with all ecosystem services
const services = {
    'codai': { name: 'CODAI Main App', url: 'http://localhost:4001', healthy: true },
    'hub': { name: 'Hub App', url: 'http://localhost:4008', healthy: true },
    'cbd': { name: 'CBD Universal Database', url: 'http://localhost:4180', healthy: true },
    'id': { name: 'ID Service', url: 'http://localhost:4004', healthy: true },
    'memorai': { name: 'MemorAI App', url: 'http://localhost:4006', healthy: true },
    'admin': { name: 'Admin Dashboard', url: 'http://localhost:4007', healthy: false },
    'bancai': { name: 'BancAI App', url: 'http://localhost:4005', healthy: false },
    'controlai': { name: 'ControlAI Dashboard', url: 'http://localhost:4200', healthy: false }
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, data: result, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Simple router
async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`[${new Date().toISOString()}] ${method} ${path}`);

    try {
        // Health check endpoint
        if (path === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'healthy',
                gateway: 'Phase 4 Gateway (Simplified)',
                services: Object.entries(services).map(([id, config]) => ({
                    id, name: config.name, url: config.url, status: config.healthy ? 'healthy' : 'unhealthy'
                })),
                uptime: Math.floor(process.uptime()),
                timestamp: new Date().toISOString()
            }));
            return;
        }

        // Service status endpoint
        if (path === '/api/services') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: {
                    services: Object.entries(services).map(([id, config]) => ({
                        id, name: config.name, url: config.url,
                        proxyUrl: `http://localhost:${PORT}/api/${id}`,
                        status: config.healthy ? 'healthy' : 'unhealthy'
                    })),
                    total: Object.keys(services).length,
                    healthy: Object.values(services).filter(s => s.healthy).length
                }
            }));
            return;
        }

        // CBD Sync endpoint
        if (path === '/api/cbd/sync' && method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const { service, operation, data } = JSON.parse(body);

                    const cbdResponse = await makeRequest({
                        hostname: 'localhost',
                        port: 4180,
                        path: '/document/',
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    }, {
                        collection: 'ecosystem_operations',
                        document: {
                            service, operation, data,
                            timestamp: new Date().toISOString(),
                            gateway: 'Phase4-Gateway'
                        }
                    });

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: 'Operation synced to CBD',
                        cbd_result: cbdResponse.data
                    }));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false, error: 'CBD Sync Failed', message: error.message
                    }));
                }
            });
            return;
        }

        // CBD Operations endpoint
        if (path === '/api/cbd/operations') {
            const cbdResponse = await makeRequest({
                hostname: 'localhost', port: 4180, path: '/stats', method: 'GET'
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: { cbd_status: cbdResponse.data, message: 'CBD operations retrieved successfully' }
            }));
            return;
        }

        // Service proxy routes
        for (const [serviceId, config] of Object.entries(services)) {
            if (path.startsWith(`/api/${serviceId}`)) {
                const targetUrl = url.parse(config.url);
                const targetPath = path.replace(`/api/${serviceId}`, '') || '/';

                console.log(`[PROXY] ${method} ${path} -> ${config.url}${targetPath}`);

                try {
                    const proxyResponse = await makeRequest({
                        hostname: targetUrl.hostname,
                        port: targetUrl.port,
                        path: targetPath + (parsedUrl.search || ''),
                        method: method,
                        headers: {
                            ...req.headers,
                            'host': targetUrl.hostname + ':' + targetUrl.port,
                            'X-Gateway-Service': serviceId,
                            'X-Gateway-Timestamp': new Date().toISOString()
                        }
                    });

                    res.writeHead(proxyResponse.status, {
                        'Content-Type': proxyResponse.headers['content-type'] || 'application/json',
                        'X-Powered-By': 'Phase4-Gateway'
                    });
                    res.end(typeof proxyResponse.data === 'string' ?
                        proxyResponse.data : JSON.stringify(proxyResponse.data));
                } catch (error) {
                    res.writeHead(502, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false, error: 'Service Unavailable',
                        service: serviceId, message: `${config.name} is currently unavailable`
                    }));
                }
                return;
            }
        }

        // 404 for unknown routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false, error: 'Not Found', path: path,
            availableRoutes: ['/health', '/api/services', '/api/cbd/sync', '/api/cbd/operations',
                ...Object.keys(services).map(id => `/api/${id}`)]
        }));

    } catch (error) {
        console.error('[GATEWAY ERROR]:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false, error: 'Internal Server Error', message: error.message
        }));
    }
}

// Create and start the server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`🚀 CODAI Phase 4 Gateway (Simplified) running on port ${PORT}`);
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

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    server.close(() => process.exit(0));
});

module.exports = server;
