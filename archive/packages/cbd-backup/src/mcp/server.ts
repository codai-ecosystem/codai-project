/*!
 * CBD MCP Server
 * Model Context Protocol server for CBD (Codai Better Database)
 * Provides direct vector database operations and management
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { CBDMemoryEngine } from '../memory/MemoryEngine.js';
import { createCBDEngine } from '../index.js';
import { getConfig, CBDMCPConfig, validateConfig } from './config.js';
import { healthCheck, quickHealthCheck } from './tools/monitoring/health.js';
import { getServerStats, getBasicStats } from './tools/monitoring/stats.js';

export class CBDMCPServer {
    private server: Server;
    private engine: CBDMemoryEngine;
    private config: CBDMCPConfig;
    private initialized = false;

    constructor(config?: Partial<CBDMCPConfig>) {
        this.config = { ...getConfig(), ...config };

        // Validate configuration
        const configErrors = validateConfig(this.config);
        if (configErrors.length > 0) {
            throw new Error(`Configuration errors: ${configErrors.join(', ')}`);
        }

        // Initialize MCP server
        this.server = new Server(
            {
                name: this.config.server.name,
                version: this.config.server.version,
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Initialize CBD engine with config
        this.engine = createCBDEngine({
            storage: {
                type: 'cbd-native',
                dataPath: this.config.database.path || './cbd-mcp-data'
            },
            embedding: {
                model: 'openai',
                apiKey: process.env.OPENAI_API_KEY || undefined,
                modelName: 'text-embedding-ada-002',
                dimensions: this.config.database.dimension || 1536
            },
            vector: {
                indexType: 'faiss',
                dimensions: this.config.database.dimension || 1536,
                similarityMetric: 'cosine'
            },
            cache: {
                enabled: true,
                maxSize: this.config.performance.cacheSize,
                ttl: 3600000 // 1 hour
            }
        });

        this.setupHandlers();
    }

    /**
     * Setup MCP request handlers
     */
    private setupHandlers(): void {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                // Monitoring Tools
                {
                    name: 'health_check',
                    description: 'Check CBD MCP server health status',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            detailed: {
                                type: 'boolean',
                                description: 'Include detailed health information',
                                default: false
                            }
                        }
                    }
                },
                {
                    name: 'get_server_stats',
                    description: 'Get CBD server statistics and performance metrics',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            detailed: {
                                type: 'boolean',
                                description: 'Include detailed statistics',
                                default: false
                            }
                        }
                    }
                },
                // Vector Operations (Phase 2)
                {
                    name: 'vector_search',
                    description: 'Search vectors by similarity',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Search query text'
                            },
                            limit: {
                                type: 'number',
                                description: 'Maximum number of results',
                                default: 10
                            },
                            threshold: {
                                type: 'number',
                                description: 'Similarity threshold (0.0 to 1.0)',
                                default: 0.0
                            }
                        },
                        required: ['query']
                    }
                },
                {
                    name: 'vector_store',
                    description: 'Store a vector with metadata',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            content: {
                                type: 'string',
                                description: 'Content to store'
                            },
                            metadata: {
                                type: 'object',
                                description: 'Additional metadata'
                            },
                            project: {
                                type: 'string',
                                description: 'Project name',
                                default: 'mcp'
                            },
                            session: {
                                type: 'string',
                                description: 'Session name',
                                default: 'default'
                            }
                        },
                        required: ['content']
                    }
                },
                // Memory Operations
                {
                    name: 'search_memory',
                    description: 'Search stored memories by query',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Search query'
                            },
                            limit: {
                                type: 'number',
                                description: 'Maximum results to return',
                                default: 10
                            },
                            project: {
                                type: 'string',
                                description: 'Filter by project name'
                            },
                            session: {
                                type: 'string',
                                description: 'Filter by session name'
                            }
                        },
                        required: ['query']
                    }
                },
                {
                    name: 'get_memory',
                    description: 'Retrieve a specific memory by structured key',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            key: {
                                type: 'string',
                                description: 'Structured key (project_date_session_sequence)'
                            }
                        },
                        required: ['key']
                    }
                }
            ]
        }));

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                await this.ensureInitialized();

                switch (name) {
                    case 'health_check':
                        return await this.handleHealthCheck(Boolean(args?.detailed));

                    case 'get_server_stats':
                        return await this.handleGetServerStats(Boolean(args?.detailed));

                    case 'vector_search':
                        return await this.handleVectorSearch(args);

                    case 'vector_store':
                        return await this.handleVectorStore(args);

                    case 'search_memory':
                        return await this.handleSearchMemory(args);

                    case 'get_memory':
                        return await this.handleGetMemory(args);

                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            } catch (error: any) {
                throw new McpError(
                    ErrorCode.InternalError,
                    `Tool execution failed: ${error?.message || 'Unknown error'}`
                );
            }
        });
    }

    /**
     * Ensure the CBD engine is initialized
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.engine.initialize();
            this.initialized = true;

            if (this.config.logging.enabled) {
                console.log(`🚀 CBD MCP Server initialized (${this.config.server.name} v${this.config.server.version})`);
            }
        }
    }

    /**
     * Handle health check tool
     */
    private async handleHealthCheck(detailed: boolean = false) {
        const health = detailed
            ? await healthCheck(this.engine, this.config)
            : await quickHealthCheck(this.engine);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(health, null, 2)
                }
            ]
        };
    }

    /**
     * Handle get server stats tool
     */
    private async handleGetServerStats(detailed: boolean = false) {
        const stats = detailed
            ? await getServerStats(this.engine, this.config, true)
            : await getBasicStats(this.engine, this.config);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(stats, null, 2)
                }
            ]
        };
    }

    /**
     * Handle vector search tool
     */
    private async handleVectorSearch(args: any) {
        if (!args?.query) {
            throw new McpError(ErrorCode.InvalidParams, 'Query is required');
        }

        const searchResult = await this.engine.search_memory(
            args.query,
            args.limit || 10,
            args.threshold || 0.0
        );

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        query: args.query,
                        limit: args.limit || 10,
                        summary: searchResult.summary,
                        results: searchResult.memories.length,
                        matches: searchResult.memories.map(result => ({
                            key: result.memory.structuredKey,
                            score: result.relevanceScore,
                            content: result.memory.userRequest + ' ' + result.memory.assistantResponse,
                            metadata: {
                                projectName: result.memory.projectName,
                                sessionName: result.memory.sessionName,
                                agentId: result.memory.agentId,
                                timestamp: result.memory.createdAt
                            }
                        }))
                    }, null, 2)
                }
            ]
        };
    }

    /**
     * Handle vector store tool
     */
    private async handleVectorStore(args: any) {
        if (!args?.content) {
            throw new McpError(ErrorCode.InvalidParams, 'Content is required');
        }

        const structuredKey = await this.engine.store_memory(
            args.content,
            'MCP Response', // Assistant response
            {
                projectName: args.project || 'mcp',
                sessionName: args.session || 'default',
                agentId: 'cbd-mcp-server',
                ...args.metadata
            }
        );

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        key: structuredKey,
                        project: args.project || 'mcp',
                        session: args.session || 'default'
                    }, null, 2)
                }
            ]
        };
    }

    /**
     * Handle search memory tool
     */
    private async handleSearchMemory(args: any) {
        if (!args?.query) {
            throw new McpError(ErrorCode.InvalidParams, 'Query is required');
        }

        const searchResult = await this.engine.search_memory(args.query, args.limit || 10);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        query: args.query,
                        summary: searchResult.summary,
                        results: searchResult.memories.map(result => ({
                            key: result.memory.structuredKey,
                            score: result.relevanceScore,
                            userRequest: result.memory.userRequest,
                            assistantResponse: result.memory.assistantResponse,
                            projectName: result.memory.projectName,
                            sessionName: result.memory.sessionName,
                            agentId: result.memory.agentId,
                            timestamp: result.memory.createdAt
                        }))
                    }, null, 2)
                }
            ]
        };
    }

    /**
     * Handle get memory tool
     */
    private async handleGetMemory(args: any) {
        if (!args?.key) {
            throw new McpError(ErrorCode.InvalidParams, 'Key is required');
        }

        const memory = await this.engine.get_memory(args.key);

        if (!memory) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ error: 'Memory not found' }, null, 2)
                    }
                ]
            };
        }

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        key: args.key,
                        structuredKey: memory.structuredKey,
                        userRequest: memory.userRequest,
                        assistantResponse: memory.assistantResponse,
                        projectName: memory.projectName,
                        sessionName: memory.sessionName,
                        agentId: memory.agentId,
                        timestamp: memory.createdAt,
                        sequenceNumber: memory.sequenceNumber,
                        confidenceScore: memory.confidenceScore
                    }, null, 2)
                }
            ]
        };
    }

    /**
     * Start the MCP server
     */
    async start(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);

        if (this.config.logging.enabled) {
            console.error('🤖 CBD MCP Server running on stdio');
        }
    }

    /**
     * Stop the MCP server
     */
    async stop(): Promise<void> {
        if (this.initialized) {
            await this.engine.shutdown();
        }
    }
}

// Export for use as module
export { CBDMCPConfig } from './config.js';
export * from './types.js';
