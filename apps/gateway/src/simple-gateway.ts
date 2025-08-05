/**
 * Simple CODAI Gateway - Working Version
 * Simplified version for quick testing and UI validation
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app: Application = express();
const PORT = parseInt(process.env.GATEWAY_PORT || '4003', 10);

// Basic middleware
app.use(cors({
    origin: ['http://localhost:4001', 'http://localhost:4004', 'http://localhost:4007', 'http://localhost:4008'],
    credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    res.setHeader('X-Request-ID', `req-${Date.now()}`);
    res.setHeader('X-Powered-By', 'CODAI Simple Gateway');
    next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            gateway: {
                status: 'healthy',
                version: '2.0.0-simple',
                uptime: process.uptime(),
                memory: process.memoryUsage()
            },
            services: [
                { id: 'codai', name: 'CODAI App', port: 4001, status: 'healthy' },
                { id: 'id', name: 'ID Service', port: 4004, status: 'healthy' },
                { id: 'admin', name: 'Admin Dashboard', port: 4007, status: 'healthy' },
                { id: 'hub', name: 'Hub App', port: 4008, status: 'healthy' },
                { id: 'cbd', name: 'CBD Database', port: 4180, status: 'healthy' }
            ]
        }
    });
});

// Gateway status endpoint
app.get('/api/gateway/health', (req: Request, res: Response) => {
    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            gateway: {
                status: 'healthy',
                version: '2.0.0-simple',
                uptime: process.uptime()
            },
            services: [
                { id: 'codai', status: 'healthy', category: 'business' },
                { id: 'id', status: 'healthy', category: 'core' },
                { id: 'admin', status: 'healthy', category: 'utility' },
                { id: 'hub', status: 'healthy', category: 'business' },
                { id: 'cbd', status: 'healthy', category: 'core' }
            ]
        }
    });
});

// Service discovery endpoint
app.get('/api/gateway/services', (req: Request, res: Response) => {
    const services = [
        {
            id: 'codai',
            name: 'CODAI Application',
            description: 'Main CODAI platform application',
            version: '2.0.0',
            category: 'business',
            endpoint: 'http://localhost:4001',
            status: 'healthy',
            lastHealthCheck: new Date().toISOString()
        },
        {
            id: 'id',
            name: 'ID Service',
            description: 'Identity and authentication service',
            version: '2.0.0',
            category: 'core',
            endpoint: 'http://localhost:4004',
            status: 'healthy',
            lastHealthCheck: new Date().toISOString()
        },
        {
            id: 'admin',
            name: 'Admin Dashboard',
            description: 'Administrative interface',
            version: '2.0.0',
            category: 'utility',
            endpoint: 'http://localhost:4007',
            status: 'healthy',
            lastHealthCheck: new Date().toISOString()
        },
        {
            id: 'hub',
            name: 'Hub Application',
            description: 'Central hub interface',
            version: '2.0.0',
            category: 'business',
            endpoint: 'http://localhost:4008',
            status: 'healthy',
            lastHealthCheck: new Date().toISOString()
        },
        {
            id: 'cbd',
            name: 'CBD Database',
            description: 'Universal database service',
            version: '1.0.0',
            category: 'core',
            endpoint: 'http://localhost:4180',
            status: 'healthy',
            lastHealthCheck: new Date().toISOString()
        }
    ];

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            services,
            total: services.length,
            healthy: services.filter(s => s.status === 'healthy').length,
            categories: {
                core: services.filter(s => s.category === 'core').length,
                business: services.filter(s => s.category === 'business').length,
                utility: services.filter(s => s.category === 'utility').length
            }
        }
    });
});

// Service discovery by ID
app.get('/api/gateway/discover/:serviceId', (req: Request, res: Response) => {
    const { serviceId } = req.params;

    const serviceMap: { [key: string]: any } = {
        'codai': {
            id: 'codai',
            name: 'CODAI Application',
            description: 'Main CODAI platform application',
            baseUrl: '/api/v1/codai',
            directUrl: 'http://localhost:4001',
            endpoints: ['/api', '/health', '/ready'],
            version: '2.0.0'
        },
        'id': {
            id: 'id',
            name: 'ID Service',
            description: 'Identity and authentication service',
            baseUrl: '/api/v1/id',
            directUrl: 'http://localhost:4004',
            endpoints: ['/api', '/health', '/ready'],
            version: '2.0.0'
        },
        'admin': {
            id: 'admin',
            name: 'Admin Dashboard',
            description: 'Administrative interface',
            baseUrl: '/api/v1/admin',
            directUrl: 'http://localhost:4007',
            endpoints: ['/api', '/health', '/ready'],
            version: '2.0.0'
        },
        'hub': {
            id: 'hub',
            name: 'Hub Application',
            description: 'Central hub interface',
            baseUrl: '/api/v1/hub',
            directUrl: 'http://localhost:4008',
            endpoints: ['/api', '/health', '/ready'],
            version: '2.0.0'
        },
        'cbd': {
            id: 'cbd',
            name: 'CBD Database',
            description: 'Universal database service',
            baseUrl: '/api/v1/cbd',
            directUrl: 'http://localhost:4180',
            endpoints: ['/health', '/stats', '/document'],
            version: '1.0.0'
        }
    };

    const service = serviceMap[serviceId];
    if (!service) {
        return res.status(404).json({
            success: false,
            error: 'Service not found',
            availableServices: Object.keys(serviceMap)
        });
    }

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: service
    });
});

// Metrics endpoint (protected)
app.get('/api/gateway/metrics', (req: Request, res: Response) => {
    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            gateway: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: '2.0.0-simple'
            },
            services: {
                total: 5,
                healthy: 5,
                unhealthy: 0
            },
            performance: {
                requestsPerSecond: Math.floor(Math.random() * 100),
                averageResponseTime: Math.floor(Math.random() * 50) + 10
            }
        }
    });
});

// Documentation endpoint
app.get('/docs', (req: Request, res: Response) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>CODAI Gateway Documentation</title>
        <meta charset="utf-8">
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
        <script>
            SwaggerUIBundle({
                url: '/api/swagger.json',
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.presets.standalone
                ]
            });
        </script>
    </body>
    </html>
    `);
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        availableServices: ['codai', 'id', 'admin', 'hub', 'cbd']
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Gateway error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        requestId: res.getHeader('X-Request-ID'),
        timestamp: new Date().toISOString()
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 CODAI Simple Gateway running on port ${PORT}`);
    console.log(`📚 Documentation: http://localhost:${PORT}/docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔍 Service Discovery: http://localhost:${PORT}/api/gateway/services`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Simple Gateway shutdown complete');
        process.exit(0);
    });
});

export default app;
