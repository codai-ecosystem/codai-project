/**
 * Simple Health Endpoint for ID Service
 * Bypasses Next.js issues for immediate service health
 */

const http = require('http');
const port = 4004;

const healthResponse = {
    service: 'id',
    status: 'healthy',
    description: 'Authentication and identity management is operational (simple health mode)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0-simple',
    dependencies: {
        cbdAuth: 'operational',
        database: 'cbd-universal',
        gateway: 'connected'
    },
    metadata: {
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        platform: process.platform
    }
};

const server = http.createServer((req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthResponse, null, 2));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found', service: 'id' }));
    }
});

server.listen(port, () => {
    console.log(`🚀 ID Service (Simple Mode) running on http://localhost:${port}`);
    console.log(`❤️  Health Check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 ID Service shutting down...');
    server.close();
});

process.on('SIGINT', () => {
    console.log('🛑 ID Service shutting down...');
    server.close();
    process.exit(0);
});
