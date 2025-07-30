const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { createSecureServer } = require('@codai/security');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 5900;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
    });

    // Apply security middleware
    createSecureServer(server, {
        serviceName: 'prezentai',
        port: port,
        enableTLS: true,
        enableWAF: true,
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 500 // Presentation creation workloads
        }
    });

    // Health check endpoint
    server.on('request', (req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'healthy',
                service: 'prezentai',
                description: 'AI Presentation Creator - SECURED',
                port: port,
                type: 'presentation-ai',
                category: 'productivity',
                security: {
                    https: true,
                    waf: true,
                    headers: true,
                    rateLimit: true
                },
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            }));
            return;
        }
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> PREZENTAI ready on https://localhost:${port} - SECURED`);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('PREZENTAI: Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('PREZENTAI: Received SIGINT, shutting down gracefully');
    process.exit(0);
});
