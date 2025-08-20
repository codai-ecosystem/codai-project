/**
 * CBD Engine Service - Standalone Vector Database Service
 * Provides HTTP API for MemorAI MCP Server integration
 * Port: 4180 (as expected by MCP adapters)
 */

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { CBDMemoryEngine } from './index.js';
import { validateCBDConfig, CBDConfig } from './index.js';

interface CBDServiceOptions {
    port?: number;
    host?: string;
    dataPath?: string;
}

class CBDEngineService {
    protected port: number;
    protected host: string;
    protected cbdConfig: CBDConfig;
    protected engine: CBDMemoryEngine;
    protected app: express.Application;
    protected startupTime: number;
    protected requestCount: number;
    protected isHealthy: boolean;

    constructor(options: CBDServiceOptions = {}) {
        this.port = options.port || parseInt(process.env.CBD_PORT || '4180');
        this.host = options.host || process.env.CBD_HOST || 'localhost';

        // Initialize CBD Memory Engine with production config
        this.cbdConfig = {
            storage: {
                type: 'cbd-native' as const,
                dataPath: options.dataPath || process.env.CBD_DATA_PATH || './cbd-data'
            },
            embedding: {
                model: 'openai' as const,
                apiKey: process.env.OPENAI_API_KEY,
                modelName: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
                dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1536')
            },
            vector: {
                indexType: 'faiss' as const,
                dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1536'),
                similarityMetric: 'cosine' as const
            },
            cache: {
                enabled: true,
                maxSize: 1000,
                ttl: 3600000 // 1 hour
            }
        };

        // Validate configuration
        const validation = validateCBDConfig(this.cbdConfig);
        if (!validation.valid) {
            throw new Error(`Invalid CBD configuration: ${validation.errors.join(', ')}`);
        }

        this.engine = new CBDMemoryEngine(this.cbdConfig);
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();

        this.startupTime = Date.now();
        this.requestCount = 0;
        this.isHealthy = false;
    }

    setupMiddleware(): void {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: false // Allow for development
        }));

        // CORS - allow all origins for development
        this.app.use(cors({
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
        }));

        // Compression
        this.app.use(compression());

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // Limit each IP to 1000 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        });
        this.app.use('/api/', limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging and metrics
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            this.requestCount++;
            const startTime = Date.now();

            res.on('finish', () => {
                const duration = Date.now() - startTime;
                console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
            });

            next();
        });
    }

    setupRoutes(): void {
        // Health check endpoint
        this.app.get('/health', (_req: Request, res: Response) => {
            const uptime = Date.now() - this.startupTime;
            res.json({
                status: this.isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                uptime: uptime,
                service: 'CBD Engine Service',
                version: '1.0.0',
                requests: this.requestCount
            });
        });

        // Service info endpoint
        this.app.get('/', (_req: Request, res: Response) => {
            res.json({
                service: 'CBD Engine Service',
                description: 'Standalone Vector Database Service for MemorAI MCP integration',
                version: '1.0.0',
                endpoints: {
                    health: '/health',
                    statistics: '/api/admin/statistics',
                    memories: '/api/data/memories',
                    search: '/api/search/memories',
                    vectorSearch: '/api/vector/search'
                },
                status: this.isHealthy ? 'operational' : 'initializing'
            });
        });

        // Statistics endpoint
        this.app.get('/api/admin/statistics', async (_req: Request, res: Response) => {
            try {
                const stats = await this.engine.get_statistics();
                const uptime = Date.now() - this.startupTime;
                
                res.json({
                    ...stats,
                    service: {
                        requests: this.requestCount,
                        uptime: uptime,
                        avgRequestsPerSecond: Math.round(this.requestCount / (uptime / 1000) * 100) / 100,
                        status: this.isHealthy ? 'healthy' : 'unhealthy'
                    }
                });
            } catch (error: unknown) {
                res.status(500).json({
                    error: 'Failed to get statistics',
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });

        // Memory storage endpoints
        this.app.post('/api/data/memories', async (req: Request, res: Response): Promise<void> => {
            try {
                const { userRequest, assistantResponse, metadata } = req.body;
                
                if (!userRequest || !assistantResponse || !metadata) {
                    res.status(400).json({
                        success: false,
                        message: 'Missing required fields: userRequest, assistantResponse, metadata'
                    });
                    return;
                }

                const result = await this.engine.store_memory(
                    userRequest,
                    assistantResponse,
                    metadata
                );
                
                res.json({
                    success: true,
                    data: { structuredKey: result }
                });
            } catch (error: unknown) {
                res.status(500).json({
                    error: 'Failed to store memory',
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });

        // Memory retrieval endpoint
        this.app.get('/api/data/memories', async (req: Request, res: Response): Promise<void> => {
            try {
                const { filter, limit } = req.query;
                
                // Handle specific memory key lookup
                if (typeof filter === 'string' && filter.includes('structured_key')) {
                    const keyMatch = filter.match(/structured_key = '([^']+)'/);
                    if (keyMatch && keyMatch[1]) {
                        const memory = await this.engine.get_memory(keyMatch[1]);
                        res.json({
                            success: true,
                            data: memory ? [memory] : [],
                            count: memory ? 1 : 0
                        });
                        return;
                    }
                }

                // Default: return recent memories using search
                const searchOptions = {
                    limit: typeof limit === 'string' ? parseInt(limit) || 10 : 10,
                    confidenceThreshold: 0.0 // Get all memories
                };

                // Use search_memory for general queries
                const results = await this.engine.search_memory(
                    '', // Empty query to get all memories
                    searchOptions.limit,
                    searchOptions.confidenceThreshold
                );
                
                res.json({
                    success: true,
                    data: results.memories.map(r => r.memory),
                    count: results.memories.length,
                    summary: results.summary
                });
            } catch (error: unknown) {
                res.status(500).json({
                    error: 'Failed to retrieve memories',
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });

        // Memory deletion endpoint
        this.app.delete('/api/data/memories', async (req: Request, res: Response): Promise<void> => {
            try {
                const { filter } = req.query;
                
                if (typeof filter === 'string' && filter.includes('structured_key')) {
                    const keyMatch = filter.match(/structured_key = '([^']+)'/);
                    if (keyMatch && keyMatch[1]) {
                        const result = await this.engine.delete_memory(keyMatch[1]);
                        res.json({
                            success: true,
                            deleted: result
                        });
                        return;
                    }
                }

                res.status(400).json({
                    success: false,
                    message: 'Must specify structured_key filter for deletion'
                });
                return;
            } catch (error: unknown) {
                res.status(500).json({
                    error: 'Failed to delete memory',
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });

        // Memory search endpoint
        this.app.post('/api/search/memories', async (req: Request, res: Response) => {
            try {
                const { query, limit, minImportance } = req.body;
                
                const searchLimit = limit || 10;
                const confidenceThreshold = minImportance || 0.0;

                const results = await this.engine.search_memory(
                    query || '', 
                    searchLimit,
                    confidenceThreshold
                );
                
                res.json({
                    success: true,
                    data: results.memories,
                    count: results.memories.length,
                    summary: results.summary
                });
            } catch (error: unknown) {
                res.status(500).json({
                    error: 'Failed to search memories',
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });

        // Vector search endpoint
        this.app.post('/api/vector/search', async (req: Request, res: Response) => {
            try {
                const { vector, limit, threshold } = req.body;
                
                const searchOptions: any = {
                    topK: limit || 10,
                    minScore: threshold || 0.0
                };

                const results = await this.engine.vector_search(vector, searchOptions);
                
                res.json({
                    success: true,
                    data: results,
                    count: results.length
                });
            } catch (error: unknown) {
                res.status(500).json({
                    error: 'Failed to perform vector search',
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });

        // Error handling middleware
        const errorHandler: ErrorRequestHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
            console.error('Unhandled error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        };
        this.app.use(errorHandler);

        // 404 handler
        this.app.use((_req: Request, res: Response) => {
            res.status(404).json({
                error: 'Not found',
                message: 'The requested endpoint does not exist'
            });
        });
    }

    async start(): Promise<void> {
        try {
            console.log('🚀 Starting CBD Engine Service...');
            
            // Initialize the engine
            await this.engine.initialize();
            
            // Mark as healthy
            this.isHealthy = true;
            console.log('✅ CBD Memory Engine initialized');

            // Start the server
            return new Promise<void>((resolve, reject) => {
                const server = this.app.listen(this.port, this.host, () => {
                    console.log('');
                    console.log('🎯 CBD Engine Service Started');
                    console.log('================================');
                    console.log(`📊 Service: http://${this.host}:${this.port}`);
                    console.log(`💾 Data Path: ${this.cbdConfig.storage.dataPath}`);
                    console.log(`🔍 Vector Dimensions: ${this.cbdConfig.vector.dimensions}`);
                    console.log(`🧠 Embedding Model: ${this.cbdConfig.embedding.modelName}`);
                    console.log('================================');
                    console.log('');
                    resolve();
                });

                server.on('error', (error: Error) => {
                    console.error('❌ Failed to start server:', error.message);
                    reject(error);
                });
            });
        } catch (error) {
            console.error('❌ Failed to start CBD Engine Service:', error);
            this.isHealthy = false;
            await this.engine.shutdown();
            throw error;
        }
    }
}

export { CBDEngineService };

// Start server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    const service = new CBDEngineService();
    service.start().catch(console.error);
}
