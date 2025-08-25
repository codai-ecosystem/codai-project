/**
 * MemorAI MCP Server - Modern TypeScript Implementation
 * Enterprise-grade memory management server with vector embeddings and hybrid search
 * Updated to use latest MCP TypeScript SDK patterns
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Core imports
import { ConfigManager } from './core/config-manager.js';
import { DatabaseManager } from './core/database-manager.js';
import { Logger } from './utils/logger.js';
import { HybridSearchEngine } from './engines/search/hybrid-search.js';
import { MemoryService } from './services/memory-service.js';

// Types
import { Memory, SearchRequest, AdvancedMetadata } from './core/types.js';

/**
 * MemorAI MCP Server - Modern Implementation
 */
export class MemorAIMCPServer {
    private app: Express;
    private mcpServer: McpServer;
    private config: ConfigManager;
    private database: DatabaseManager;
    private logger: Logger;
    private searchEngine: HybridSearchEngine;
    private memoryService: MemoryService;
    private isRunning: boolean = false;

    // Transport storage for session management
    private transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

    constructor() {
        this.app = express();
        this.mcpServer = new McpServer({
            name: 'memorai-mcp-server',
            version: '9.9.0-phase3-enterprise'
        });

        this.config = new ConfigManager();
        this.logger = new Logger('MemorAIMCPServer');
        this.database = new DatabaseManager(this.config, this.logger);
        this.searchEngine = new HybridSearchEngine(this.config, this.logger);
        this.memoryService = new MemoryService(
            this.database,
            this.searchEngine,
            this.logger
        );
    }

    /**
     * Start the server
     */
    async start(): Promise<void> {
        try {
            this.logger.info('🚀 Starting MemorAI MCP Server...');

            // Initialize components
            await this.database.initialize();
            await this.searchEngine.initialize();

            // Setup Express app
            this.setupExpress();

            // Setup MCP server
            this.setupMCPServer();

            // Start HTTP server
            const port = this.config.get<number>('PORT', 4950);
            const server = this.app.listen(port, () => {
                this.logger.info(`🌐 HTTP Server listening on port ${port}`);
                this.isRunning = true;
            });

            // Setup graceful shutdown
            process.on('SIGINT', () => this.shutdown(server));
            process.on('SIGTERM', () => this.shutdown(server));

            // Setup MCP transport for VS Code integration
            if (process.argv.includes('--stdio')) {
                const transport = new StdioServerTransport();
                await this.mcpServer.connect(transport);
                this.logger.info('📡 MCP STDIO transport connected');
            }

            this.logger.info('✅ MemorAI MCP Server started successfully');

        } catch (error) {
            this.logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    /**
     * Setup Express middleware and routes
     */
    private setupExpress(): void {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false
        }));

        this.app.use(cors({
            origin: this.config.get<string>('CORS_ORIGIN', '*'),
            credentials: true
        }));

        // Rate limiting
        this.app.use(rateLimit({
            windowMs: this.config.get<number>('RATE_LIMIT_WINDOW_MS', 60000),
            max: this.config.get<number>('RATE_LIMIT_MAX_REQUESTS', 1000),
            message: { error: 'Too many requests from this IP' }
        }));

        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Health check endpoint
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                status: 'healthy',
                service: 'memorai-mcp-server',
                version: '9.9.0',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                isRunning: this.isRunning
            });
        });

        // Memory endpoints
        this.app.post('/api/v1/memory/remember', async (req: Request, res: Response) => {
            try {
                const result = await this.memoryService.remember(req.body);
                res.json(result);
            } catch (error) {
                this.logger.error('Remember endpoint error:', error);
                res.status(500).json({
                    error: 'Failed to store memory',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        this.app.post('/api/v1/memory/recall', async (req: Request, res: Response) => {
            try {
                const result = await this.memoryService.recall(req.body);
                res.json(result);
            } catch (error) {
                this.logger.error('Recall endpoint error:', error);
                res.status(500).json({
                    error: 'Failed to retrieve memories',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        this.app.delete('/api/v1/memory/:structuredKey', async (req: Request, res: Response) => {
            try {
                const { agentId } = req.query;
                if (!agentId || typeof agentId !== 'string') {
                    return res.status(400).json({ error: 'agentId is required' });
                }

                const result = await this.memoryService.forget({
                    agentId,
                    structuredKey: req.params.structuredKey
                });
                res.json(result);
            } catch (error) {
                this.logger.error('Forget endpoint error:', error);
                res.status(500).json({
                    error: 'Failed to delete memory',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        this.app.get('/api/v1/memory/context/:agentId', async (req: Request, res: Response) => {
            try {
                const { contextSize } = req.query;
                const result = await this.memoryService.getContext({
                    agentId: req.params.agentId,
                    contextSize: contextSize ? parseInt(contextSize as string) : 5
                });
                res.json(result);
            } catch (error) {
                this.logger.error('Context endpoint error:', error);
                res.status(500).json({
                    error: 'Failed to retrieve context',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }

    /**
     * Setup MCP server tools and handlers
     */
    private setupMCPServer(): void {
        // List available tools
        this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'mcp_memoraimcp_remember',
                        description: 'Store a memory with content and metadata',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier for memory isolation' },
                                content: { type: 'string', description: 'The content to remember' },
                                metadata: {
                                    type: 'object',
                                    description: 'Additional metadata for the memory',
                                    properties: {
                                        entityType: { type: 'string' },
                                        priority: { type: 'string' },
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
                        description: 'Search and retrieve memories with intelligent suggestions',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier for memory isolation' },
                                query: { type: 'string', description: 'Search query for finding relevant memories' },
                                limit: { type: 'number', description: 'Maximum number of results to return (default: 10)' },
                                minImportance: { type: 'number', description: 'Minimum importance score filter (default: 0)' },
                                project: { type: 'string', description: 'Filter memories by project name' },
                                session: { type: 'string', description: 'Filter memories by session identifier' }
                            },
                            required: ['agentId', 'query']
                        }
                    },
                    {
                        name: 'mcp_memoraimcp_forget',
                        description: 'Delete a memory by structured key',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                structuredKey: { type: 'string', description: 'Structured key of memory to delete' }
                            },
                            required: ['agentId', 'structuredKey']
                        }
                    },
                    {
                        name: 'mcp_memoraimcp_context',
                        description: 'Get recent context for agent',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
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
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            } catch (error) {
                this.logger.error(`Tool execution error [${name}]:`, error);
                throw new McpError(
                    ErrorCode.InternalError,
                    `Error executing ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        });
    }

    /**
     * Handle remember tool
     */
    private async handleRemember(args: any) {
        this.logger.debug('Processing remember request', { agentId: args.agentId });

        const response = await this.memoryService.remember({
            agentId: args.agentId,
            content: args.content,
            metadata: args.metadata || {}
        });

        return {
            content: [{
                type: 'text',
                text: `✅ Memory stored successfully!\n\n` +
                    `**Structured Key:** ${response.structuredKey}\n` +
                    `**Content:** ${response.content.substring(0, 100)}${response.content.length > 100 ? '...' : ''}\n` +
                    `**Entity Type:** ${response.metadata?.entityType || 'general'}\n` +
                    `**Timestamp:** ${response.timestamp}\n` +
                    `**Agent ID:** ${response.agentId}`
            }]
        };
    }

    /**
     * Handle recall tool
     */
    private async handleRecall(args: any) {
        this.logger.debug('Processing recall request', {
            agentId: args.agentId,
            query: args.query?.substring(0, 50)
        });

        const response = await this.memoryService.recall({
            agentId: args.agentId,
            query: args.query,
            limit: args.limit || 10,
            minImportance: args.minImportance || 0,
            project: args.project,
            session: args.session
        });

        if (response.memories.length === 0) {
            return {
                content: [{
                    type: 'text',
                    text: `🔍 No memories found for query: "${args.query}"\n\n` +
                        `**Agent ID:** ${args.agentId}\n` +
                        `**Search performed:** ${response.searchType}\n` +
                        `**Suggestions:** Try broader keywords or check if memories exist for this agent.`
                }]
            };
        }

        let resultText = `🧠 Found ${response.memories.length} memories (${response.searchType} search):\n\n`;

        response.memories.forEach((memory: any, index: number) => {
            resultText += `**${index + 1}. ${memory.metadata?.entityType || 'Memory'}** ` +
                `(Score: ${memory.relevanceScore?.toFixed(3) || 'N/A'})\n` +
                `${memory.content.substring(0, 200)}${memory.content.length > 200 ? '...' : ''}\n` +
                `*Key: ${memory.structuredKey} | ${new Date(memory.timestamp).toLocaleString()}*\n\n`;
        });

        resultText += `**Query Analysis:** ${response.queryAnalysis || 'Standard search'}\n`;
        resultText += `**Total Results:** ${response.totalCount}\n`;
        resultText += `**Performance:** ${response.performanceMetrics?.searchTime || 'N/A'}ms`;

        return {
            content: [{
                type: 'text',
                text: resultText
            }]
        };
    }

    /**
     * Handle forget tool
     */
    private async handleForget(args: any) {
        this.logger.debug('Processing forget request', {
            agentId: args.agentId,
            structuredKey: args.structuredKey
        });

        const response = await this.memoryService.forget({
            agentId: args.agentId,
            structuredKey: args.structuredKey
        });

        return {
            content: [{
                type: 'text',
                text: response.success
                    ? `🗑️ Memory deleted successfully!\n\n**Key:** ${args.structuredKey}\n**Agent ID:** ${args.agentId}`
                    : `❌ Failed to delete memory: ${response.error}`
            }]
        };
    }

    /**
     * Handle context tool
     */
    private async handleContext(args: any) {
        this.logger.debug('Processing context request', {
            agentId: args.agentId,
            contextSize: args.contextSize
        });

        const response = await this.memoryService.getContext({
            agentId: args.agentId,
            contextSize: args.contextSize || 5
        });

        if (response.context.length === 0) {
            return {
                content: [{
                    type: 'text',
                    text: `📋 No context available for agent: ${args.agentId}\n\n` +
                        `**Suggestion:** Start by storing some memories to build context.`
                }]
            };
        }

        let contextText = `📋 Recent context for ${args.agentId} (${response.context.length} items):\n\n`;

        response.context.forEach((memory: any, index: number) => {
            contextText += `**${index + 1}.** ${memory.content.substring(0, 150)}${memory.content.length > 150 ? '...' : ''}\n` +
                `*${memory.metadata?.entityType || 'Memory'} | ${new Date(memory.timestamp).toLocaleString()}*\n\n`;
        });

        return {
            content: [{
                type: 'text',
                text: contextText
            }]
        };
    }

    /**
     * Shutdown the server gracefully
     */
    private async shutdown(server: any): Promise<void> {
        this.logger.info('Shutting down MemorAI MCP Server...');

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
    const server = new MemorAIMCPServer();
    server.start().catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}
