/**
 * MemorAI Core API Service
 * Express.js server with CBD database integration and JWT authentication
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment.js';
import { logger } from './utils/logger.js';
import { errorHandler } from '@/middleware/errorHandler.js';
import { authMiddleware } from '@/middleware/auth.js';
import { healthRoutes } from '@/routes/health.js';
import { authRoutes } from '@/routes/auth.js';
import { memoryRoutes } from '@/routes/memories.js';
import { cbdService } from '@/services/cbdService.js';

class MemorAIApiServer {
    private app: express.Application;
    private server: any;

    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupMiddleware(): void {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "https://cbd.memorai.ro", "https://auth.codai.ro", "https://id.codai.ro"],
                    fontSrc: ["'self'", "https:", "data:"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                },
            },
            crossOriginResourcePolicy: { policy: "cross-origin" }
        }));

        // CORS configuration
        this.app.use(cors({
            origin: [
                'http://localhost:4006',
                'https://memorai.ro',
                'https://app.memorai.ro',
                'https://admin.memorai.ro',
                'https://mcp.memorai.ro',
                'https://docs.memorai.ro'
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With']
        }));

        // Compression and parsing
        this.app.use(compression());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Logging
        this.app.use(morgan('combined', {
            stream: { write: (message: string) => logger.info(message.trim()) }
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: config.rateLimitMax, // limit each IP to rateLimitMax requests per windowMs
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use(limiter);

        // API versioning
        this.app.use('/v1', express.Router());
    }

    private setupRoutes(): void {
        // Health check (no auth required)
        this.app.use('/health', healthRoutes);
        this.app.use('/v1/health', healthRoutes);

        // Authentication routes (no auth required)
        this.app.use('/v1/auth', authRoutes);

        // Protected routes (auth required)
        this.app.use('/v1/memories', authMiddleware, memoryRoutes);

        // API documentation endpoint
        this.app.get('/v1', (req, res) => {
            res.json({
                name: 'MemorAI Core API',
                version: '1.0.0',
                description: 'AI-powered memory management platform with CBD vector database integration',
                endpoints: {
                    health: '/health',
                    auth: '/v1/auth',
                    memories: '/v1/memories'
                },
                documentation: 'https://docs.memorai.ro/api',
                status: 'operational'
            });
        });

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                message: 'MemorAI Core API Service',
                version: '1.0.0',
                status: 'operational',
                timestamp: new Date().toISOString(),
                environment: config.nodeEnv,
                endpoints: {
                    health: '/health',
                    api: '/v1',
                    documentation: 'https://docs.memorai.ro/api'
                }
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                message: `${req.method} ${req.originalUrl} is not a valid API endpoint`,
                availableEndpoints: ['/health', '/v1/auth', '/v1/memories'],
                documentation: 'https://docs.memorai.ro/api'
            });
        });
    }

    private setupErrorHandling(): void {
        this.app.use(errorHandler);
    }

    public async start(): Promise<void> {
        try {
            // Initialize CBD service connection
            await cbdService.initialize();
            logger.info('CBD service connection established');

            // Start server
            this.server = this.app.listen(config.port, '0.0.0.0', () => {
                logger.info(`🚀 MemorAI API Server running on port ${config.port}`);
                logger.info(`📊 Environment: ${config.nodeEnv}`);
                logger.info(`🔗 CBD Database: ${config.cbdDatabaseUrl}`);
                logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
                logger.info(`📚 API docs: http://localhost:${config.port}/v1`);
            });

            // Graceful shutdown handling
            process.on('SIGTERM', () => this.shutdown('SIGTERM'));
            process.on('SIGINT', () => this.shutdown('SIGINT'));
            process.on('uncaughtException', (error) => {
                logger.error('Uncaught Exception:', error);
                this.shutdown('uncaughtException');
            });
            process.on('unhandledRejection', (reason, promise) => {
                logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
                this.shutdown('unhandledRejection');
            });

        } catch (error) {
            logger.error('Failed to start MemorAI API server:', error);
            process.exit(1);
        }
    }

    private async shutdown(signal: string): Promise<void> {
        logger.info(`Received ${signal}. Shutting down gracefully...`);

        if (this.server) {
            this.server.close(async () => {
                logger.info('HTTP server closed');

                // Close CBD service connection
                await cbdService.disconnect();
                logger.info('CBD service connection closed');

                logger.info('Graceful shutdown completed');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    }

    public getApp(): express.Application {
        return this.app;
    }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const apiServer = new MemorAIApiServer();
    apiServer.start().catch((error) => {
        logger.error('Failed to start server:', error);
        process.exit(1);
    });
}

export { MemorAIApiServer };
export default MemorAIApiServer;
