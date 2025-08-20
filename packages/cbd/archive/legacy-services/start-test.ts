#!/usr/bin/env tsx

/**
 * CBD Engine Service Testing Startup Script
 * Modified version that bypasses OpenAI requirement for testing
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

class TestCBDService {
    private port: number;
    private host: string;
    private app: express.Application;
    private startupTime: number;
    private requestCount: number;

    constructor() {
        this.port = parseInt(process.env.CBD_PORT || '4180');
        this.host = process.env.CBD_HOST || 'localhost';
        this.app = express();
        this.startupTime = Date.now();
        this.requestCount = 0;
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        this.app.use(helmet({ contentSecurityPolicy: false }));
        this.app.use(cors({ origin: true, credentials: true }));
        this.app.use(compression());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request counter
        this.app.use((req, res, next) => {
            this.requestCount++;
            const startTime = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - startTime;
                console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
            });
            next();
        });
    }

    private setupRoutes(): void {
        // Health check
        this.app.get('/health', (req, res) => {
            const uptime = Date.now() - this.startupTime;
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: uptime,
                service: 'CBD Engine Service (Test Mode)',
                version: '1.0.0',
                requests: this.requestCount,
                mode: 'testing'
            });
        });

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                service: 'CBD Engine Service',
                description: 'Test mode - OpenAI integration disabled',
                version: '1.0.0-test',
                endpoints: {
                    health: '/health',
                    statistics: '/api/admin/statistics'
                },
                status: 'operational',
                mode: 'testing'
            });
        });

        // Statistics endpoint
        this.app.get('/api/admin/statistics', (req, res) => {
            const uptime = Date.now() - this.startupTime;
            res.json({
                service: {
                    requests: this.requestCount,
                    uptime: uptime,
                    avgRequestsPerSecond: Math.round(this.requestCount / (uptime / 1000) * 100) / 100,
                    status: 'healthy'
                },
                mode: 'testing',
                message: 'OpenAI integration disabled for testing'
            });
        });

        // Memory endpoints (test stubs)
        this.app.post('/api/data/memories', (req, res) => {
            res.json({
                success: true,
                data: { structuredKey: 'test-' + Date.now() },
                message: 'Test mode - memory not actually stored'
            });
        });

        this.app.get('/api/data/memories', (req, res) => {
            res.json({
                success: true,
                data: [],
                count: 0,
                message: 'Test mode - no memories available'
            });
        });

        // Error handler
        this.app.use((error: Error, req: any, res: any, next: any) => {
            console.error('Error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Not found',
                message: 'The requested endpoint does not exist'
            });
        });
    }

    async start(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const server = this.app.listen(this.port, this.host, () => {
                console.log('');
                console.log('🎯 CBD Engine Service Started (Test Mode)');
                console.log('================================');
                console.log(`📊 Service: http://${this.host}:${this.port}`);
                console.log(`🧪 Mode: Testing (OpenAI disabled)`);
                console.log(`⚡ Ready for API testing`);
                console.log('================================');
                console.log('');
                resolve();
            });

            server.on('error', (error: Error) => {
                console.error('❌ Failed to start server:', error.message);
                reject(error);
            });
        });
    }
}

async function startTestService() {
    try {
        console.log('🚀 Starting CBD Engine Service in Test Mode...');
        const service = new TestCBDService();
        await service.start();
        
        // Setup graceful shutdown
        const shutdown = async (signal: string) => {
            console.log(`\n📡 Received ${signal}. Shutting down gracefully...`);
            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        
    } catch (error) {
        console.error('❌ Failed to start test service:', error);
        process.exit(1);
    }
}

startTestService();
