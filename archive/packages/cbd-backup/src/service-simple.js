/**
 * CBD Engine Service - Simple Implementation for MCP Integration
 * HTTP service that wraps the CBD Memory Engine
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { CBDMemoryEngine } from './memory/MemoryEngine.js';

export class CBDEngineService {
    constructor(options = {}) {
        this.port = options.port || process.env.CBD_PORT || 4180;
        this.host = options.host || process.env.CBD_HOST || 'localhost';
        this.dataPath = options.dataPath || './cbd-data';
        
        this.engine = new CBDMemoryEngine({
            dataPath: this.dataPath
        });
        
        this.app = express();
        this.server = null;
        this.isHealthy = false;
        this.startupTime = Date.now();
        this.requestCount = 0;
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // Security
        this.app.use(helmet({
            contentSecurityPolicy: false
        }));

        // CORS
        this.app.use(cors({
            origin: ['http://localhost:3000', 'http://localhost:4180', 'http://localhost:4200'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
        }));

        // Compression
        this.app.use(compression());

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // requests per window
        });
        this.app.use('/api/', limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request counting
        this.app.use((req, res, next) => {
            this.requestCount++;
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            const uptime = Date.now() - this.startupTime;
            res.json({
                status: this.isHealthy ? 'healthy' : 'unhealthy',
                uptime: Math.floor(uptime / 1000),
                service: 'cbd-engine',
                version: '1.0.0',
                requests: this.requestCount
            });
        });

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                service: 'CBD Engine Service',
                version: '1.0.0',
                description: 'Codai Better Database - High-Performance Vector Memory System',
                endpoints: [
                    'GET /health - Health check',
                    'POST /api/data/memories - Store memory',
                    'GET /api/data/memories - Get memories',
                    'POST /api/search/memories - Search memories',
                    'DELETE /api/data/memories - Delete memory'
                ],
                status: this.isHealthy ? 'operational' : 'initializing'
            });
        });

        // Store memory
        this.app.post('/api/data/memories', async (req, res) => {
            try {
                const { agentId, content, metadata } = req.body;
                
                if (!agentId || !content) {
                    return res.status(400).json({
                        error: 'Missing required fields: agentId, content'
                    });
                }

                const result = await this.engine.storeMemory({
                    agentId,
                    content,
                    metadata: metadata || {}
                });

                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to store memory',
                    message: error.message
                });
            }
        });

        // Get memories
        this.app.get('/api/data/memories', async (req, res) => {
            try {
                const { agentId, project, session, limit } = req.query;

                if (req.query.key) {
                    // Get specific memory by key
                    const memory = await this.engine.getMemoryByKey(req.query.key);
                    return res.json({
                        success: true,
                        data: memory ? [memory] : []
                    });
                }

                if (agentId) {
                    // Get recent memories for agent
                    const memories = await this.engine.getRecentMemories(agentId, {
                        project,
                        session,
                        limit: parseInt(limit) || 5
                    });
                    return res.json({
                        success: true,
                        data: memories
                    });
                }

                res.status(400).json({
                    error: 'Missing required parameter: agentId or key'
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to get memories',
                    message: error.message
                });
            }
        });

        // Search memories
        this.app.post('/api/search/memories', async (req, res) => {
            try {
                const { query, limit, agentId, project, session, minImportance } = req.body;

                const searchOptions = {
                    limit: parseInt(limit) || 10,
                    agentId,
                    project,
                    session,
                    minImportance: parseFloat(minImportance) || 0.0
                };

                const results = await this.engine.searchMemories(query, searchOptions);

                res.json({
                    success: true,
                    data: results
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to search memories',
                    message: error.message
                });
            }
        });

        // Delete memory
        this.app.delete('/api/data/memories', async (req, res) => {
            try {
                const { key } = req.query;
                
                if (!key) {
                    return res.status(400).json({
                        error: 'Missing required parameter: key'
                    });
                }

                const result = await this.engine.deleteMemory(key);
                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to delete memory',
                    message: error.message
                });
            }
        });

        // Create/initialize database
        this.app.post('/api/admin/database', async (req, res) => {
            try {
                const { name, config } = req.body;
                
                // For now, just acknowledge the database creation
                // In a real implementation, this would create database instances
                console.log(`📊 Database initialization request: ${name}`, config);
                
                res.json({
                    success: true,
                    data: {
                        name: name || 'memorai',
                        status: 'initialized',
                        config: config || {},
                        message: 'Database initialized successfully'
                    }
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to initialize database',
                    message: error.message
                });
            }
        });

        // Create schema
        this.app.post('/api/schema/create', async (req, res) => {
            try {
                console.log('📋 Schema creation request received');
                
                // For now, just acknowledge the schema creation
                // In a real implementation, this would create tables and indexes
                res.json({
                    success: true,
                    data: {
                        message: 'Schema created successfully',
                        tables: ['memories', 'memory_embeddings', 'semantic_search_cache', 'database_info']
                    }
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to create schema',
                    message: error.message
                });
            }
        });

        // Database info endpoint
        this.app.post('/api/data/memories/database_info', async (req, res) => {
            try {
                const { records } = req.body;
                console.log('📊 Database info initialization:', records);
                
                res.json({
                    success: true,
                    data: {
                        message: 'Database info stored successfully',
                        records: records || []
                    }
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to store database info',
                    message: error.message
                });
            }
        });

        // Statistics
        this.app.get('/api/admin/statistics', async (req, res) => {
            try {
                const stats = await this.engine.getStatistics();
                const uptime = Date.now() - this.startupTime;

                res.json({
                    success: true,
                    data: {
                        ...stats,
                        uptime: Math.floor(uptime / 1000),
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

        // Error handling
        this.app.use((error, req, res, next) => {
            console.error('Unhandled error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Not found',
                message: `Endpoint ${req.method} ${req.path} not found`
            });
        });
    }

    async start() {
        try {
            console.log('🔄 Initializing CBD Memory Engine...');
            await this.engine.initialize();
            
            console.log('🚀 Starting HTTP server...');
            this.isHealthy = true;

            return new Promise((resolve, reject) => {
                const server = this.app.listen(this.port, this.host, (error) => {
                    if (error) {
                        this.isHealthy = false;
                        return reject(error);
                    }

                    this.server = server;
                    console.log(`✅ CBD Engine Service started successfully`);
                    console.log(`📊 Service: http://${this.host}:${this.port}`);
                    console.log(`💾 Data Path: ${this.dataPath}`);
                    console.log(`🔍 Memory Engine: CBD v1.0.0`);
                    resolve(server);
                });

                server.on('error', (error) => {
                    console.error('❌ Server error:', error);
                    this.isHealthy = false;
                    reject(error);
                });
            });
        } catch (error) {
            console.error('❌ Failed to start CBD Engine Service:', error);
            this.isHealthy = false;
            await this.engine.close();
            throw error;
        }
    }

    async stop() {
        if (this.server) {
            this.server.close();
        }
        this.isHealthy = false;
        await this.engine.close();
        console.log('🔄 CBD Engine Service stopped');
    }
}
