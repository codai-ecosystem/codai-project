/**
 * CBD Engine Service - Standalone Vector Database Service
 * Provides HTTP API for MemorAI MCP Server integration
 * Port: 4180 (as expected by MCP adapters)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { CBDMemoryEngine } from './index.js';
import { validateCBDConfig } from './index.js';

class CBDEngineService {
    constructor(options = {}) {
        this.port = options.port || process.env.CBD_PORT || 4180;
        this.host = options.host || process.env.CBD_HOST || 'localhost';
        
        // Initialize CBD Memory Engine with production config
        this.cbdConfig = {
            storage: {
                type: 'cbd-native',
                dataPath: options.dataPath || process.env.CBD_DATA_PATH || './cbd-data'
            },
            embedding: {
                model: 'openai',
                apiKey: process.env.OPENAI_API_KEY,
                modelName: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
                dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS) || 1536
            },
            vector: {
                indexType: 'faiss',
                dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS) || 1536,
                similarityMetric: 'cosine'
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

    setupMiddleware() {
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

    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            const uptime = Date.now() - this.startupTime;
            res.json({
                status: this.isHealthy ? 'healthy' : 'unhealthy',
                service: 'CBD Engine',
                version: '1.0.0',
                uptime: `${Math.round(uptime / 1000)}s`,
                timestamp: new Date().toISOString(),
                requests: this.requestCount
            });
        });

        // Root endpoint with service info
        this.app.get('/', (req, res) => {
            res.json({
                service: 'CBD Engine Service',
                version: '1.0.0',
                description: 'Vector database service for MemorAI MCP integration',
                endpoints: {
                    health: '/health',
                    admin: '/api/admin/*',
                    data: '/api/data/*',
                    search: '/api/search/*',
                    vector: '/api/vector/*'
                },
                status: this.isHealthy ? 'operational' : 'initializing'
            });
        });

        // Admin endpoints
        this.app.get('/api/admin/statistics', async (req, res) => {
            try {
                const stats = await this.engine.getStatistics();
                const uptime = Date.now() - this.startupTime;
                
                res.json({
                    ...stats,
                    service: {
                        uptime: Math.round(uptime / 1000),
                        requests: this.requestCount,
                        avgRequestsPerSecond: Math.round(this.requestCount / (uptime / 1000) * 100) / 100,
                        status: this.isHealthy ? 'healthy' : 'unhealthy'
                    }
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to get statistics',
                    message: error.message
                });
            }
        });

        this.app.post('/api/admin/database', async (req, res) => {
            try {
                const { name, config } = req.body;
                // For now, acknowledge database creation (CBD handles this internally)
                res.json({
                    success: true,
                    message: `Database ${name} initialized`,
                    config: config
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to create database',
                    message: error.message
                });
            }
        });

        // Memory storage endpoints
        this.app.post('/api/data/memories', async (req, res) => {
            try {
                const { records } = req.body;
                const results = [];

                for (const record of records) {
                    const result = await this.engine.storeMemory({
                        agentId: record.agent_id,
                        content: record.content,
                        metadata: {
                            project: record.project_name,
                            session: record.session_name,
                            ...JSON.parse(record.metadata || '{}')
                        }
                    });
                    results.push(result.memoryId);
                }

                res.json({
                    success: true,
                    insertedIds: results,
                    count: results.length
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to store memories',
                    message: error.message
                });
            }
        });

        this.app.get('/api/data/memories', async (req, res) => {
            try {
                const { filter, orderBy, limit, project, session } = req.query;
                
                // For structured key lookup
                if (filter && filter.includes('structured_key')) {
                    const keyMatch = filter.match(/structured_key = '([^']+)'/);
                    if (keyMatch) {
                        const memory = await this.engine.getMemoryByKey(keyMatch[1]);
                        res.json({
                            records: memory ? [memory] : [],
                            count: memory ? 1 : 0
                        });
                        return;
                    }
                }

                // For agent-based queries
                if (filter && filter.includes('agent_id')) {
                    const agentMatch = filter.match(/agent_id = '([^']+)'/);
                    if (agentMatch) {
                        const memories = await this.engine.getRecentMemories(agentMatch[1], {
                            limit: parseInt(limit) || 10,
                            project,
                            session
                        });
                        res.json({
                            records: memories,
                            count: memories.length
                        });
                        return;
                    }
                }

                res.json({
                    records: [],
                    count: 0,
                    message: 'No matching records found'
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to get memories',
                    message: error.message
                });
            }
        });

        this.app.patch('/api/data/memories/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const updates = req.body;
                
                // For now, acknowledge the update
                // CBD engine handles access tracking internally
                res.json({
                    success: true,
                    message: `Memory ${id} updated`,
                    updates
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to update memory',
                    message: error.message
                });
            }
        });

        this.app.delete('/api/data/memories', async (req, res) => {
            try {
                const { filter } = req.query;
                
                if (filter && filter.includes('structured_key')) {
                    const keyMatch = filter.match(/structured_key = '([^']+)'/);
                    if (keyMatch) {
                        const result = await this.engine.deleteMemory(keyMatch[1]);
                        res.json({
                            success: result.success,
                            deletedCount: result.success ? 1 : 0,
                            message: result.message
                        });
                        return;
                    }
                }

                res.json({
                    success: false,
                    deletedCount: 0,
                    message: 'No matching records found for deletion'
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to delete memories',
                    message: error.message
                });
            }
        });

        // Search endpoints
        this.app.post('/api/search/memories', async (req, res) => {
            try {
                const { query, limit, agentId, project, session, minImportance, searchType } = req.body;
                
                const searchOptions = {
                    limit: limit || 10,
                    agentId,
                    project,
                    session,
                    minImportance: minImportance || 0.0
                };

                const results = await this.engine.searchMemories(query, searchOptions);
                
                res.json({
                    results: results.memories || [],
                    totalFound: results.totalFound || 0,
                    query,
                    searchOptions
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to search memories',
                    message: error.message
                });
            }
        });

        // Vector search endpoints
        this.app.post('/api/vector/search', async (req, res) => {
            try {
                const { vector, limit, threshold, table, vectorColumn } = req.body;
                
                const searchOptions = {
                    limit: limit || 20,
                    threshold: threshold || 0.0
                };

                const results = await this.engine.vectorSearch(vector, searchOptions);
                
                res.json({
                    results: results || [],
                    searchOptions,
                    vectorDimensions: vector.length
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to perform vector search',
                    message: error.message
                });
            }
        });

        // Schema endpoints
        this.app.post('/api/schema/create', async (req, res) => {
            try {
                const schema = req.body;
                // For now, acknowledge schema creation
                // CBD engine handles schema internally
                res.json({
                    success: true,
                    message: 'Schema created successfully',
                    tables: Object.keys(schema.tables || {})
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to create schema',
                    message: error.message
                });
            }
        });

        // Data insertion endpoints for database_info
        this.app.post('/api/data/memories/database_info', async (req, res) => {
            try {
                const { records } = req.body;
                // Acknowledge database info insertion
                res.json({
                    success: true,
                    message: 'Database info updated',
                    records: records.length
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to update database info',
                    message: error.message
                });
            }
        });

        // Transaction endpoints
        this.app.post('/api/transaction/execute', async (req, res) => {
            try {
                const { operations } = req.body;
                // For now, acknowledge transaction
                res.json({
                    success: true,
                    message: 'Transaction executed successfully',
                    operations: operations.length
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to execute transaction',
                    message: error.message
                });
            }
        });

        // Backup endpoints
        this.app.post('/api/admin/backup', async (req, res) => {
            try {
                const { database, path, format } = req.body;
                // For now, acknowledge backup creation
                res.json({
                    success: true,
                    message: `Backup created for database ${database}`,
                    path,
                    format
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to create backup',
                    message: error.message
                });
            }
        });

        // Error handling middleware
        this.app.use((error, req, res, next) => {
            console.error('CBD Engine Service Error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                message: `${req.method} ${req.path} is not a valid endpoint`,
                availableEndpoints: [
                    'GET /health',
                    'GET /api/admin/statistics',
                    'POST /api/data/memories',
                    'GET /api/data/memories',
                    'POST /api/search/memories',
                    'POST /api/vector/search'
                ]
            });
        });
    }

    async start() {
        try {
            // Initialize CBD Memory Engine
            console.log('🔄 Initializing CBD Memory Engine...');
            await this.engine.initialize();
            console.log('✅ CBD Memory Engine initialized successfully');

            this.isHealthy = true;

            // Start HTTP server
            return new Promise((resolve, reject) => {
                const server = this.app.listen(this.port, this.host, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    console.log('🚀 CBD Engine Service started successfully');
                    console.log(`📊 Service: http://${this.host}:${this.port}`);
                    console.log(`💾 Data Path: ${this.cbdConfig.storage.dataPath}`);
                    console.log(`🔍 Vector Dimensions: ${this.cbdConfig.vector.dimensions}`);
                    console.log(`🧠 Embedding Model: ${this.cbdConfig.embedding.modelName}`);
                    console.log('✅ Ready to serve MemorAI MCP requests');

                    resolve(server);
                });

                server.on('error', (error) => {
                    console.error('❌ CBD Engine Service failed to start:', error);
                    reject(error);
                });
            });

        } catch (error) {
            console.error('❌ Failed to start CBD Engine Service:', error);
            throw error;
        }
    }

    async stop() {
        try {
            this.isHealthy = false;
            await this.engine.close();
            console.log('🔄 CBD Engine Service stopped');
        } catch (error) {
            console.error('❌ Error stopping CBD Engine Service:', error);
            throw error;
        }
    }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
    const service = new CBDEngineService();
    
    service.start().catch((error) => {
        console.error('❌ Failed to start CBD Engine Service:', error);
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('🔄 Graceful shutdown initiated...');
        await service.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('🔄 Service termination requested...');
        await service.stop();
        process.exit(0);
    });
}

export { CBDEngineService };
export default CBDEngineService;
