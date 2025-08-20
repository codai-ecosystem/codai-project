/**
 * MemorAI MCP Advanced Server
 * Enterprise-Grade Memory Management with Enhanced Search
 * Version: 10.0.0-enterprise
 * Date: August 6, 2025
 */

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { config } from './core/config-manager.js';
import { database } from './core/database-manager.js';
import { memoryService } from './services/memory-service.js';
import { Logger } from './utils/logger.js';
import { Memory, APIResponse, SearchResult } from './core/types.js';

export class MemorAIAdvancedServer {
    private app: express.Application;
    private mcpServer: Server;
    private logger: Logger;
    private isRunning: boolean;

    constructor() {
        this.app = express();
        this.mcpServer = new Server(
            {
                name: 'memorai-mcp-advanced',
                version: '10.0.0'
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );
        this.logger = new Logger('AdvancedServer');
        this.isRunning = false;

        this.setupMiddleware();
        this.setupMCPTools();
        this.setupHttpRoutes();
    }

    /**
     * Setup Express middleware
     */
    private setupMiddleware(): void {
        const serverConfig = config.getConfig().server;

        // CORS configuration for VS Code compatibility
        this.app.use(cors(serverConfig.cors));

        // Body parsing
        this.app.use(express.json({ limit: serverConfig.maxRequestSize }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req, res, next) => {
            this.logger.debug(`${req.method} ${req.path}`, {
                userAgent: req.get('User-Agent'),
                contentType: req.get('Content-Type')
            });
            next();
        });

        // Error handling
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            this.logger.error('Express error:', err);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: err.message || 'Internal server error',
                    timestamp: new Date()
                }
            });
        });
    }

    /**
     * Setup MCP tools for VS Code integration
     */
    private setupMCPTools(): void {
        // List available tools
        this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'mcp_memoraimcp_remember',
                        description: 'Store information with intelligent categorization and importance scoring',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier for memory isolation' },
                                content: { type: 'string', description: 'The content to remember' },
                                metadata: {
                                    type: 'object',
                                    description: 'Additional metadata for the memory',
                                    properties: {
                                        entityType: { type: 'string', enum: ['prompt', 'task', 'plan', 'knowledge', 'context', 'user_instructions'] },
                                        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                                        project: { type: 'string' },
                                        session: { type: 'string' },
                                        tags: { type: 'array', items: { type: 'string' } }
                                    }
                                }
                            },
                            required: ['agentId', 'content']
                        }
                    },
                    {
                        name: 'mcp_memoraimcp_recall',
                        description: 'Search and retrieve stored information with advanced semantic search',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier for memory isolation' },
                                query: { type: 'string', description: 'Search query for finding relevant memories' },
                                limit: { type: 'number', description: 'Maximum number of results to return (default: 10)' },
                                minImportance: { type: 'number', description: 'Minimum importance score filter (default: 0)' },
                                project: { type: 'string', description: 'Filter memories by project name' },
                                session: { type: 'string', description: 'Filter memories by session identifier' },
                                entityType: { type: 'string', description: 'Filter by entity type' },
                                useHybridSearch: { type: 'boolean', description: 'Use advanced hybrid search (default: true)' }
                            },
                            required: ['agentId', 'query']
                        }
                    },
                    {
                        name: 'mcp_memoraimcp_forget',
                        description: 'Delete a specific memory by structured key',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier for memory isolation' },
                                structuredKey: { type: 'string', description: 'Structured key of memory to delete' }
                            },
                            required: ['agentId', 'structuredKey']
                        }
                    },
                    {
                        name: 'mcp_memoraimcp_context',
                        description: 'Get recent context for agent with intelligent prioritization',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier for memory isolation' },
                                contextSize: { type: 'number', description: 'Number of recent memories to retrieve (default: 5)' }
                            },
                            required: ['agentId']
                        }
                    }
                ]
            };
        });

        // Handle tool calls
        this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'mcp_memoraimcp_remember':
                        return await this.handleRemember(args as any);

                    case 'mcp_memoraimcp_recall':
                        return await this.handleRecall(args as any);

                    case 'mcp_memoraimcp_forget':
                        return await this.handleForget(args as any);

                    case 'mcp_memoraimcp_context':
                        return await this.handleContext(args as any);

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                this.logger.error(`Tool execution error [${name}]:`, error);
                return {
                    content: [{
                        type: 'text',
                        text: `❌ Error executing ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }]
                };
            }
        });
    }

    /**
     * Handle remember tool
     */
    private async handleRemember(args: any) {
        this.logger.debug('Processing remember request', { agentId: args.agentId });

        const response = await memoryService.remember({
            agentId: args.agentId,
            content: args.content,
            metadata: args.metadata
        });

        if (response.success && response.data) {
            const memory = response.data;
            return {
                content: [{
                    type: 'text',
                    text: `✅ Memory stored successfully in CBD Database!\n\nID: ${memory.id}\nAgent: ${memory.agentId}\nContent: ${memory.content}\nStructured Key: ${memory.structuredKey}\nTimestamp: ${memory.timestamp.toISOString()}`
                }]
            };
        } else {
            return {
                content: [{
                    type: 'text',
                    text: `❌ Failed to store memory: ${response.error?.message || 'Unknown error'}`
                }]
            };
        }
    }

    /**
     * Handle recall tool
     */
    private async handleRecall(args: any) {
        this.logger.debug('Processing recall request', {
            agentId: args.agentId,
            query: args.query
        });

        const response = await memoryService.recall({
            agentId: args.agentId,
            query: args.query,
            limit: args.limit,
            minImportance: args.minImportance,
            project: args.project,
            session: args.session,
            entityType: args.entityType,
            useHybridSearch: args.useHybridSearch
        });

        if (response.success && response.data) {
            const results = response.data;

            if (results.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `🔍 No memories found in CBD Database for query "${args.query}" (agent: ${args.agentId})`
                    }]
                };
            }

            const memoriesText = results.map((result, index) => {
                const memory = result.memory;
                const score = result.relevanceScore.toFixed(3);
                const matchType = result.matchType.toUpperCase();

                return `${index + 1}. [${matchType}] Score: ${score}\n   Content: ${memory.content}\n   Type: ${memory.metadata.entityType} | Importance: ${memory.metadata.importance}\n   Created: ${memory.timestamp.toISOString()}`;
            }).join('\n\n');

            const processingTime = response.metadata?.processingTime || 0;
            const cacheHit = response.metadata?.cacheHit ? ' (cached)' : '';

            return {
                content: [{
                    type: 'text',
                    text: `🧠 Found ${results.length} memories for "${args.query}" (${processingTime}ms${cacheHit}):\n\n${memoriesText}`
                }]
            };
        } else {
            return {
                content: [{
                    type: 'text',
                    text: `❌ Failed to search memories: ${response.error?.message || 'Unknown error'}`
                }]
            };
        }
    }

    /**
     * Handle forget tool
     */
    private async handleForget(args: any) {
        this.logger.debug('Processing forget request', {
            agentId: args.agentId,
            structuredKey: args.structuredKey
        });

        const response = await memoryService.forget(args.structuredKey, args.agentId);

        if (response.success) {
            return {
                content: [{
                    type: 'text',
                    text: `✅ Memory deleted successfully from CBD Database\n\nStructured Key: ${args.structuredKey}\nAgent: ${args.agentId}`
                }]
            };
        } else {
            return {
                content: [{
                    type: 'text',
                    text: `❌ Failed to delete memory: ${response.error?.message || 'Unknown error'}`
                }]
            };
        }
    }

    /**
     * Handle context tool
     */
    private async handleContext(args: any) {
        this.logger.debug('Processing context request', {
            agentId: args.agentId,
            contextSize: args.contextSize
        });

        const response = await memoryService.getContext(args.agentId, args.contextSize || 5);

        if (response.success && response.data) {
            const memories = response.data;

            if (memories.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `📋 No recent context found for agent: ${args.agentId}`
                    }]
                };
            }

            const contextText = memories.map((memory, index) => {
                return `${index + 1}. [${memory.metadata.entityType.toUpperCase()}] ${memory.content}\n   Importance: ${memory.metadata.importance} | Created: ${memory.timestamp.toISOString()}`;
            }).join('\n\n');

            return {
                content: [{
                    type: 'text',
                    text: `📋 Recent context for ${args.agentId} (${memories.length} memories):\n\n${contextText}`
                }]
            };
        } else {
            return {
                content: [{
                    type: 'text',
                    text: `❌ Failed to get context: ${response.error?.message || 'Unknown error'}`
                }]
            };
        }
    }

    /**
     * Setup HTTP routes for direct API access
     */
    private setupHttpRoutes(): void {
        // Health check endpoint
        this.app.get('/health', async (req, res) => {
            try {
                const dbHealth = await database.getHealthStatus();
                const memStats = await memoryService.getStats();

                res.json({
                    success: true,
                    data: {
                        status: 'healthy',
                        service: 'MemorAI MCP Advanced',
                        version: '10.0.0-enterprise',
                        timestamp: new Date().toISOString(),
                        database: dbHealth?.status || 'unknown',
                        memoryService: memoryService.isServiceInitialized(),
                        stats: memStats
                    }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'HEALTH_CHECK_FAILED',
                        message: error instanceof Error ? error.message : 'Health check failed',
                        timestamp: new Date()
                    }
                });
            }
        });

        // Direct memory operations via HTTP
        this.app.post('/memory', async (req, res) => {
            try {
                const response = await memoryService.remember({
                    agentId: req.body.agentId,
                    content: req.body.content,
                    metadata: req.body.metadata
                });
                res.json(response);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'MEMORY_OPERATION_FAILED',
                        message: error instanceof Error ? error.message : 'Memory operation failed',
                        timestamp: new Date()
                    }
                });
            }
        });

        this.app.get('/memory/search', async (req, res) => {
            try {
                const response = await memoryService.recall({
                    agentId: req.query.agentId as string,
                    query: req.query.query as string,
                    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                    minImportance: req.query.minImportance ? parseFloat(req.query.minImportance as string) : undefined,
                    project: req.query.project as string,
                    session: req.query.session as string,
                    entityType: req.query.entityType as string,
                    useHybridSearch: req.query.useHybridSearch !== 'false'
                });
                res.json(response);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'SEARCH_FAILED',
                        message: error instanceof Error ? error.message : 'Search failed',
                        timestamp: new Date()
                    }
                });
            }
        });

        this.app.delete('/memory', async (req, res) => {
            try {
                const response = await memoryService.forget(
                    req.body.structuredKey,
                    req.body.agentId
                );
                res.json(response);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'DELETE_FAILED',
                        message: error instanceof Error ? error.message : 'Delete failed',
                        timestamp: new Date()
                    }
                });
            }
        });

        this.app.get('/memory/context', async (req, res) => {
            try {
                const response = await memoryService.getContext(
                    req.query.agentId as string,
                    req.query.contextSize ? parseInt(req.query.contextSize as string) : undefined
                );
                res.json(response);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'CONTEXT_FAILED',
                        message: error instanceof Error ? error.message : 'Context retrieval failed',
                        timestamp: new Date()
                    }
                });
            }
        });

        // Statistics endpoint
        this.app.get('/stats', async (req, res) => {
            try {
                const stats = await memoryService.getStats();
                res.json({
                    success: true,
                    data: stats
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'STATS_FAILED',
                        message: error instanceof Error ? error.message : 'Statistics failed',
                        timestamp: new Date()
                    }
                });
            }
        });
    }

    /**
     * Initialize and start the server
     */
    public async start(): Promise<void> {
        if (this.isRunning) {
            this.logger.warn('Server already running');
            return;
        }

        try {
            this.logger.info('Starting MemorAI MCP Advanced Server...');

            // Print configuration
            config.printConfiguration();

            // Initialize services
            await memoryService.initialize();

            // Start HTTP server
            const port = config.getPort();
            const server = this.app.listen(port, '0.0.0.0', () => {
                this.logger.info(`🚀 MemorAI MCP Advanced Server running on port ${port}`);
                this.logger.info('🔗 VS Code MCP Integration: Enabled');
                this.logger.info('🧠 Enhanced Search: TF-IDF + Vector Embeddings + Fuzzy Matching');
                this.logger.info('🎯 Enterprise Features: Multi-tenant, RBAC, Advanced Analytics');
                this.isRunning = true;
            });

            // Handle graceful shutdown
            process.on('SIGINT', () => this.shutdown(server));
            process.on('SIGTERM', () => this.shutdown(server));

            // Setup MCP transport for VS Code integration
            if (process.argv.includes('--stdio')) {
                const transport = new StdioServerTransport();
                await this.mcpServer.connect(transport);
                this.logger.info('📡 MCP STDIO transport connected');
            }

        } catch (error) {
            this.logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    /**
     * Shutdown the server gracefully
     */
    private async shutdown(server: any): Promise<void> {
        this.logger.info('Shutting down MemorAI MCP Advanced Server...');

        try {
            // Close HTTP server
            server.close(() => {
                this.logger.info('HTTP server closed');
            });

            // Close MCP server
            await this.mcpServer.close();

            this.isRunning = false;
            this.logger.info('Server shutdown complete');
            process.exit(0);
        } catch (error) {
            this.logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    }
}

// Start server if run directly
if (require.main === module) {
    const server = new MemorAIAdvancedServer();
    server.start().catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}
