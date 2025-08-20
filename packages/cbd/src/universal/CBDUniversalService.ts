/**
 * CBD Universal Database Service
 * Next-generation database service with multi-paradigm support
 * 
 * Integrates all Phase 1 components: Universal Storage, SQL Engine, Vector Engine, Document Engine
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { EventEmitter } from 'events';

// Universal CBD Components
import {
    UniversalStorageEngine,
    StorageEngineConfig,
    StorageStats
} from './UniversalStorageEngine.js';
import {
    UniversalSQLEngine
} from './UniversalSQLEngine.js';
import {
    QueryContext
} from './UniversalDataModel.js';

/**
 * Service configuration
 */
export interface CBDUniversalServiceConfig {
    // Server settings
    port: number;
    host: string;

    // Storage engine configuration
    storage: StorageEngineConfig;

    // API settings
    enableSQLEndpoint: boolean;
    enableDocumentEndpoint: boolean;
    enableVectorEndpoint: boolean;
    enableGraphEndpoint: boolean;
    enableLegacyEndpoints: boolean;

    // Security and performance
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    enableCompression: boolean;
    enableCORS: boolean;

    // Monitoring
    enableMetrics: boolean;
    enableHealthChecks: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Service statistics
 */
export interface ServiceStats {
    // Request statistics
    totalRequests: number;
    sqlRequests: number;
    documentRequests: number;
    vectorRequests: number;
    graphRequests: number;
    legacyRequests: number;

    // Performance metrics
    averageResponseTime: number;
    errorRate: number;

    // Storage statistics
    storage: StorageStats;

    // Service health
    uptime: number;
    startTime: Date;
    memoryUsage: NodeJS.MemoryUsage;

    // Feature usage
    activeConnections: number;
    cacheHitRate: number;
}

/**
 * CBD Universal Database Service - Next-generation multi-paradigm database
 */
export class CBDUniversalService extends EventEmitter {
    private config: CBDUniversalServiceConfig;
    private app: express.Application;
    private server: any;

    // Core engines
    private storageEngine: UniversalStorageEngine;
    private sqlEngine: UniversalSQLEngine;
    private legacyEngine?: any; // CBDMemoryEngine for backward compatibility

    // Service state
    private initialized = false;
    private stats: ServiceStats;
    private startTime: Date;

    constructor(config: Partial<CBDUniversalServiceConfig> = {}) {
        super();

        // Merge with defaults
        this.config = {
            port: 4180,
            host: 'localhost',
            enableSQLEndpoint: true,
            enableDocumentEndpoint: true,
            enableVectorEndpoint: true,
            enableGraphEndpoint: true,
            enableLegacyEndpoints: true,
            rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
            rateLimitMaxRequests: 1000,
            enableCompression: true,
            enableCORS: true,
            enableMetrics: true,
            enableHealthChecks: true,
            logLevel: 'info',
            ...config,
            storage: { ...this.getDefaultStorageConfig(), ...config.storage }
        };

        this.startTime = new Date();
        this.stats = this.createInitialStats();

        // Initialize engines
        this.storageEngine = new UniversalStorageEngine(this.config.storage);
        this.sqlEngine = new UniversalSQLEngine(this.storageEngine);

        // Initialize Express app
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * Start the universal database service
     */
    async start(): Promise<void> {
        if (this.initialized) return;

        try {
            console.log('🚀 Starting CBD Universal Database Service...');
            console.log(`📊 Configuration:`, {
                host: this.config.host,
                port: this.config.port,
                paradigms: {
                    sql: this.config.enableSQLEndpoint,
                    document: this.config.enableDocumentEndpoint,
                    vector: this.config.enableVectorEndpoint,
                    graph: this.config.enableGraphEndpoint,
                    legacy: this.config.enableLegacyEndpoints
                }
            });

            // Initialize storage engine
            await this.storageEngine.initialize();

            // Initialize legacy engine if enabled
            if (this.config.enableLegacyEndpoints) {
                // TODO: Initialize legacy engine when CBDMemoryEngine is available
                console.log('⚠️  Legacy endpoints enabled but CBDMemoryEngine not yet integrated');
            }

            // Start HTTP server
            this.server = this.app.listen(this.config.port, this.config.host, () => {
                console.log(`✅ CBD Universal Database Service running at http://${this.config.host}:${this.config.port}`);
                this.initialized = true;
                this.emit('started', {
                    host: this.config.host,
                    port: this.config.port
                });
            });

            // Setup graceful shutdown
            this.setupGracefulShutdown();

        } catch (error) {
            console.error('❌ Failed to start CBD Universal Database Service:', error);
            throw error;
        }
    }

    /**
     * Stop the service gracefully
     */
    async stop(): Promise<void> {
        if (!this.initialized) return;

        console.log('🛑 Stopping CBD Universal Database Service...');

        try {
            // Close HTTP server
            if (this.server) {
                await new Promise<void>((resolve) => {
                    this.server.close(() => resolve());
                });
            }

            // Shutdown engines
            await this.storageEngine.shutdown();
            if (this.legacyEngine) {
                await this.legacyEngine.shutdown();
            }

            this.initialized = false;
            console.log('✅ CBD Universal Database Service stopped gracefully');

        } catch (error) {
            console.error('❌ Error during service shutdown:', error);
            throw error;
        }
    }

    /**
     * Get service statistics
     */
    async getStats(): Promise<ServiceStats> {
        this.stats.uptime = (Date.now() - this.startTime.getTime()) / 1000;
        this.stats.memoryUsage = process.memoryUsage();
        this.stats.storage = await this.storageEngine.getStats();

        return { ...this.stats };
    }

    // Private setup methods

    private getDefaultStorageConfig(): StorageEngineConfig {
        return {
            dataPath: './cbd-universal-data',
            maxMemoryUsage: 1024,
            cacheSize: 10000,
            flushInterval: 30,
            defaultLayout: 'hybrid',
            compressionEnabled: true,
            compressionAlgorithm: 'lz4',
            vectorIndexType: 'hnsw',
            sqlPageSize: 8192,
            documentMaxSize: 16 * 1024 * 1024
        };
    }

    private createInitialStats(): ServiceStats {
        return {
            totalRequests: 0,
            sqlRequests: 0,
            documentRequests: 0,
            vectorRequests: 0,
            graphRequests: 0,
            legacyRequests: 0,
            averageResponseTime: 0,
            errorRate: 0,
            storage: {
                totalRecords: 0,
                relationalRecords: 0,
                documentRecords: 0,
                graphNodes: 0,
                graphEdges: 0,
                vectorRecords: 0,
                timeSeriesRecords: 0,
                keyValueRecords: 0,
                totalSizeBytes: 0,
                compressedSizeBytes: 0,
                compressionRatio: 1,
                averageReadLatency: 0,
                averageWriteLatency: 0,
                cacheHitRate: 0,
                indexEfficiency: 1,
                memoryUsageBytes: 0,
                diskUsageBytes: 0,
                cpuUsagePercent: 0,
                uptime: 0,
                lastHealthCheck: new Date(),
                errorRate: 0
            },
            uptime: 0,
            startTime: this.startTime,
            memoryUsage: process.memoryUsage(),
            activeConnections: 0,
            cacheHitRate: 0
        };
    }

    private setupMiddleware(): void {
        // Security middleware
        this.app.use(helmet());

        // CORS
        if (this.config.enableCORS) {
            this.app.use(cors());
        }

        // Compression
        if (this.config.enableCompression) {
            this.app.use(compression());
        }

        // Rate limiting
        const limiter = rateLimit({
            windowMs: this.config.rateLimitWindowMs,
            max: this.config.rateLimitMaxRequests,
            message: 'Too many requests from this IP, please try again later.'
        });
        this.app.use(limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging and stats
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const startTime = Date.now();
            this.stats.totalRequests++;

            res.on('finish', () => {
                const responseTime = Date.now() - startTime;
                this.stats.averageResponseTime =
                    (this.stats.averageResponseTime + responseTime) / 2;

                // Track by endpoint type
                if (req.path.startsWith('/sql')) this.stats.sqlRequests++;
                else if (req.path.startsWith('/document')) this.stats.documentRequests++;
                else if (req.path.startsWith('/vector')) this.stats.vectorRequests++;
                else if (req.path.startsWith('/graph')) this.stats.graphRequests++;
                else if (req.path.startsWith('/api')) this.stats.legacyRequests++;

                if (res.statusCode >= 400) {
                    this.stats.errorRate =
                        (this.stats.errorRate + 1) / this.stats.totalRequests;
                }
            });

            next();
        });
    }

    private setupRoutes(): void {
        // Health check endpoint
        this.app.get('/health', this.handleHealthCheck);

        // Service statistics
        this.app.get('/stats', this.handleGetStats);

        // SQL endpoints
        if (this.config.enableSQLEndpoint) {
            this.app.post('/sql/query', this.handleSQLQuery);
            this.app.post('/sql/transaction/begin', this.handleBeginTransaction);
            this.app.post('/sql/transaction/:id/commit', this.handleCommitTransaction);
            this.app.post('/sql/transaction/:id/rollback', this.handleRollbackTransaction);
        }

        // Document endpoints
        if (this.config.enableDocumentEndpoint) {
            this.app.post('/document/:collection', this.handleInsertDocument);
            this.app.get('/document/:collection/:id', this.handleGetDocument);
            this.app.put('/document/:collection/:id', this.handleUpdateDocument);
            this.app.delete('/document/:collection/:id', this.handleDeleteDocument);
            this.app.post('/document/:collection/query', this.handleQueryDocuments);
        }

        // Vector endpoints
        if (this.config.enableVectorEndpoint) {
            this.app.post('/vector/:collection', this.handleInsertVector);
            this.app.post('/vector/:collection/search', this.handleVectorSearch);
            this.app.get('/vector/:collection/:id', this.handleGetVector);
            this.app.delete('/vector/:collection/:id', this.handleDeleteVector);
        }

        // Graph endpoints
        if (this.config.enableGraphEndpoint) {
            this.app.post('/graph/nodes', this.handleCreateNode);
            this.app.post('/graph/edges', this.handleCreateEdge);
            this.app.get('/graph/nodes/:id', this.handleGetNode);
            this.app.get('/graph/edges/:id', this.handleGetEdge);
            this.app.post('/graph/query', this.handleGraphQuery);
        }

        // Legacy CBD endpoints (backward compatibility)
        if (this.config.enableLegacyEndpoints) {
            this.app.post('/api/memory/store', this.handleLegacyStore);
            this.app.post('/api/memory/search', this.handleLegacySearch);
            this.app.get('/api/memory/get/:key', this.handleLegacyGet);
            this.app.delete('/api/memory/delete/:key', this.handleLegacyDelete);
            this.app.get('/api/stats', this.handleLegacyStats);
        }
    }

    private setupErrorHandling(): void {
        this.app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
            console.error('❌ Unhandled error:', error);

            res.status(500).json({
                error: 'Internal server error',
                message: this.config.logLevel === 'debug' ? error.message : 'An error occurred',
                timestamp: new Date().toISOString()
            });
        });
    }

    private setupGracefulShutdown(): void {
        const shutdown = async (signal: string) => {
            console.log(`📡 Received ${signal}, shutting down gracefully...`);
            try {
                await this.stop();
                process.exit(0);
            } catch (error) {
                console.error('Error during shutdown:', error);
                process.exit(1);
            }
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }

    // Request handlers

    private handleHealthCheck = async (_req: express.Request, res: express.Response) => {
        try {
            const health = {
                status: 'healthy',
                uptime: (Date.now() - this.startTime.getTime()) / 1000,
                service: 'cbd-universal-database',
                version: '2.0.0',
                paradigms: {
                    sql: this.config.enableSQLEndpoint,
                    document: this.config.enableDocumentEndpoint,
                    vector: this.config.enableVectorEndpoint,
                    graph: this.config.enableGraphEndpoint,
                    legacy: this.config.enableLegacyEndpoints
                },
                storage: {
                    engine: 'universal',
                    status: 'healthy'
                },
                timestamp: new Date().toISOString()
            };

            res.json(health);
        } catch (error) {
            res.status(500).json({
                status: 'unhealthy',
                error: (error as Error).message
            });
        }
    };

    private handleGetStats = async (_req: express.Request, res: express.Response) => {
        try {
            const stats = await this.getStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    };

    private handleSQLQuery = async (req: express.Request, res: express.Response) => {
        try {
            const { sql, parameters = [], transactionId } = req.body;

            if (!sql) {
                res.status(400).json({ error: 'SQL query is required' });
                return;
            }

            const context: QueryContext & { transactionId?: string } = {
                paradigm: 'sql',
                user: req.headers['x-user-id'] as string || 'anonymous',
                transactionId
            };

            const result = await this.sqlEngine.executeSQL(sql, parameters, context);
            res.json(result);

        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    };

    private handleBeginTransaction = async (req: express.Request, res: express.Response) => {
        try {
            const { isolationLevel = 'READ_COMMITTED' } = req.body;
            const transactionId = await this.sqlEngine.beginTransaction(isolationLevel);

            res.json({ transactionId });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    };

    private handleCommitTransaction = async (req: express.Request, res: express.Response) => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ error: 'Transaction ID is required' });
                return;
            }
            await this.sqlEngine.commitTransaction(id);

            res.json({ success: true, message: 'Transaction committed' });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    };

    private handleRollbackTransaction = async (req: express.Request, res: express.Response) => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ error: 'Transaction ID is required' });
                return;
            }
            await this.sqlEngine.rollbackTransaction(id);

            res.json({ success: true, message: 'Transaction rolled back' });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    };

    // Placeholder handlers for other endpoints
    private handleInsertDocument = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Document endpoints coming in Phase 1.2' });
    };

    private handleGetDocument = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Document endpoints coming in Phase 1.2' });
    };

    private handleUpdateDocument = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Document endpoints coming in Phase 1.2' });
    };

    private handleDeleteDocument = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Document endpoints coming in Phase 1.2' });
    };

    private handleQueryDocuments = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Document endpoints coming in Phase 1.2' });
    };

    private handleInsertVector = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Vector endpoints coming in Phase 1.3' });
    };

    private handleVectorSearch = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Vector endpoints coming in Phase 1.3' });
    };

    private handleGetVector = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Vector endpoints coming in Phase 1.3' });
    };

    private handleDeleteVector = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Vector endpoints coming in Phase 1.3' });
    };

    private handleCreateNode = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Graph endpoints coming in Phase 2' });
    };

    private handleCreateEdge = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Graph endpoints coming in Phase 2' });
    };

    private handleGetNode = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Graph endpoints coming in Phase 2' });
    };

    private handleGetEdge = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Graph endpoints coming in Phase 2' });
    };

    private handleGraphQuery = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Graph endpoints coming in Phase 2' });
    };

    // Legacy compatibility handlers
    private handleLegacyStore = async (req: express.Request, res: express.Response) => {
        try {
            if (!this.legacyEngine) {
                res.status(503).json({ error: 'Legacy endpoints not enabled' });
                return;
            }

            const { content, summary, metadata = {} } = req.body;

            if (!content) {
                res.status(400).json({ error: 'Content is required' });
                return;
            }

            const structuredKey = await this.legacyEngine.store_memory(
                content,
                summary || 'Stored via legacy API',
                {
                    projectName: metadata.projectName || 'legacy',
                    sessionName: metadata.sessionName || 'default',
                    agentId: metadata.agentId || 'system',
                    ...metadata
                }
            );

            res.json({
                success: true,
                structuredKey,
                message: 'Memory stored successfully'
            });

        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    };

    private handleLegacySearch = async (req: express.Request, res: express.Response) => {
        try {
            if (!this.legacyEngine) {
                res.status(503).json({ error: 'Legacy endpoints not enabled' });
                return;
            }

            const { query, limit = 10, confidenceThreshold = 0.5 } = req.body;

            if (!query) {
                res.status(400).json({ error: 'Query is required' });
                return;
            }

            const result = await this.legacyEngine.search_memory(query, limit, confidenceThreshold);
            res.json(result);

        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    };

    private handleLegacyGet = async (req: express.Request, res: express.Response) => {
        try {
            if (!this.legacyEngine) {
                res.status(503).json({ error: 'Legacy endpoints not enabled' });
                return;
            }

            const { key } = req.params;
            const memory = await this.legacyEngine.get_memory(key);

            if (!memory) {
                res.status(404).json({ error: 'Memory not found' });
                return;
            }

            res.json({ memory });

        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    };

    private handleLegacyDelete = async (_req: express.Request, res: express.Response) => {
        res.status(501).json({ error: 'Legacy delete not implemented' });
    };

    private handleLegacyStats = async (_req: express.Request, res: express.Response) => {
        try {
            const stats = await this.getStats();

            // Convert to legacy format
            const legacyStats = {
                totalMemories: stats.storage.totalRecords,
                uniqueAgents: 1, // Simplified
                uniqueProjects: 1, // Simplified  
                averageImportance: 0.5, // Default
                databaseSize: stats.storage.totalSizeBytes,
                lastUpdated: new Date().toISOString()
            };

            res.json(legacyStats);

        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    };
}
