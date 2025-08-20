/*!
 * CBD MCP Server - Model Context Protocol compatibility layer
 * Bridges CBD Enterprise with MCP ecosystem
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createCBDClient, CBDClient, CBDConfig } from 'cbd-client';

interface MCPServerConfig extends CBDConfig {
    name?: string;
    version?: string;
    maxResultsPerQuery?: number;
    defaultSearchLimit?: number;
    enableResourceListing?: boolean;
}

export class CBDMCPServer {
    private server: Server;
    private cbdClient: CBDClient;
    private config: MCPServerConfig;

    constructor(config: MCPServerConfig) {
        this.config = {
            name: 'cbd-mcp-server',
            version: '1.0.0',
            maxResultsPerQuery: 100,
            defaultSearchLimit: 10,
            enableResourceListing: true,
            ...config,
        };

        this.server = new Server(
            {
                name: this.config.name!,
                version: this.config.version!,
            },
            {
                capabilities: {
                    resources: this.config.enableResourceListing ? {} : undefined,
                    tools: {},
                },
            }
        );

        this.cbdClient = createCBDClient(this.config);
        this.setupHandlers();
    }

    private setupHandlers(): void {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'store_memory',
                        description: 'Store a memory with semantic vector in CBD database',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: {
                                    type: 'string',
                                    description: 'Unique identifier for the memory'
                                },
                                content: {
                                    type: 'string',
                                    description: 'The content/text to store'
                                },
                                vector: {
                                    type: 'array',
                                    items: { type: 'number' },
                                    description: 'Vector embedding for semantic search'
                                },
                                metadata: {
                                    type: 'string',
                                    description: 'Optional metadata JSON string'
                                },
                                tags: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Optional tags for categorization'
                                }
                            },
                            required: ['key', 'content', 'vector']
                        }
                    },
                    {
                        name: 'search_memories',
                        description: 'Search memories by semantic similarity using vector embeddings',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query_vector: {
                                    type: 'array',
                                    items: { type: 'number' },
                                    description: 'Query vector for semantic search'
                                },
                                limit: {
                                    type: 'number',
                                    description: 'Maximum number of results to return',
                                    default: this.config.defaultSearchLimit
                                },
                                threshold: {
                                    type: 'number',
                                    description: 'Similarity threshold (0.0 to 1.0)',
                                    default: 0.0
                                },
                                include_vectors: {
                                    type: 'boolean',
                                    description: 'Whether to include vectors in results',
                                    default: false
                                }
                            },
                            required: ['query_vector']
                        }
                    },
                    {
                        name: 'get_memory',
                        description: 'Retrieve a specific memory by key',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: {
                                    type: 'string',
                                    description: 'The unique key of the memory to retrieve'
                                },
                                include_vector: {
                                    type: 'boolean',
                                    description: 'Whether to include the vector in response',
                                    default: false
                                }
                            },
                            required: ['key']
                        }
                    },
                    {
                        name: 'delete_memory',
                        description: 'Delete a memory by key',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: {
                                    type: 'string',
                                    description: 'The unique key of the memory to delete'
                                }
                            },
                            required: ['key']
                        }
                    },
                    {
                        name: 'list_memory_keys',
                        description: 'List memory keys with optional filtering',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                prefix: {
                                    type: 'string',
                                    description: 'Key prefix filter'
                                },
                                limit: {
                                    type: 'number',
                                    description: 'Maximum number of keys to return',
                                    default: this.config.maxResultsPerQuery
                                },
                                include_metadata: {
                                    type: 'boolean',
                                    description: 'Include metadata in response',
                                    default: false
                                }
                            }
                        }
                    },
                    {
                        name: 'get_server_stats',
                        description: 'Get CBD server statistics and health information',
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
                    {
                        name: 'health_check',
                        description: 'Check CBD server health status',
                        inputSchema: {
                            type: 'object',
                            properties: {}
                        }
                    }
                ]
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                await this.ensureConnected();

                switch (name) {
                    case 'store_memory':
                        return await this.handleStoreMemory(args);
                    case 'search_memories':
                        return await this.handleSearchMemories(args);
                    case 'get_memory':
                        return await this.handleGetMemory(args);
                    case 'delete_memory':
                        return await this.handleDeleteMemory(args);
                    case 'list_memory_keys':
                        return await this.handleListMemoryKeys(args);
                    case 'get_server_stats':
                        return await this.handleGetServerStats(args);
                    case 'health_check':
                        return await this.handleHealthCheck();
                    default:
                        throw new McpError(
                            ErrorCode.MethodNotFound,
                            `Unknown tool: ${name}`
                        );
                }
            } catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }

                const cbdError = error as any;
                throw new McpError(
                    ErrorCode.InternalError,
                    `CBD operation failed: ${cbdError.message}`,
                    { code: cbdError.code, retryable: cbdError.retryable }
                );
            }
        });

        // List resources (if enabled)
        if (this.config.enableResourceListing) {
            this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
                const keys = await this.cbdClient.listKeys({ limit: this.config.maxResultsPerQuery });

                return {
                    resources: keys.map(keyInfo => ({
                        uri: `cbd://memory/${keyInfo.key}`,
                        name: keyInfo.key,
                        description: `Memory stored at ${new Date(keyInfo.createdAt).toISOString()}`,
                        mimeType: 'application/json',
                    }))
                };
            });

            this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
                const uri = request.params.uri;

                if (!uri.startsWith('cbd://memory/')) {
                    throw new McpError(
                        ErrorCode.InvalidRequest,
                        `Invalid resource URI: ${uri}`
                    );
                }

                const key = uri.replace('cbd://memory/', '');
                const memory = await this.cbdClient.getMemory(key, { includeVector: true });

                if (!memory) {
                    throw new McpError(
                        ErrorCode.InvalidRequest,
                        `Memory not found: ${key}`
                    );
                }

                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(memory, null, 2)
                        }
                    ]
                };
            });
        }
    }

    private async ensureConnected(): Promise<void> {
        if (!this.cbdClient.isConnected()) {
            await this.cbdClient.connect();
        }
    }

    private async handleStoreMemory(args: any) {
        const { key, content, vector, metadata, tags } = args;

        const result = await this.cbdClient.storeMemory(
            key,
            content,
            vector,
            metadata,
            { tags }
        );

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: result.success,
                        message: result.message,
                        memory_id: result.memoryId,
                    }, null, 2)
                }
            ]
        };
    }

    private async handleSearchMemories(args: any) {
        const { query_vector, limit, threshold, include_vectors } = args;

        const results = await this.cbdClient.searchMemories(query_vector, {
            limit: limit || this.config.defaultSearchLimit,
            threshold: threshold || 0.0,
            includeVectors: include_vectors || false,
        });

        const limitedResults = results.slice(0, this.config.maxResultsPerQuery);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        results: limitedResults,
                        total_found: results.length,
                        limited_to: limitedResults.length,
                    }, null, 2)
                }
            ]
        };
    }

    private async handleGetMemory(args: any) {
        const { key, include_vector } = args;

        const memory = await this.cbdClient.getMemory(key, {
            includeVector: include_vector || false
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        found: memory !== null,
                        memory: memory,
                    }, null, 2)
                }
            ]
        };
    }

    private async handleDeleteMemory(args: any) {
        const { key } = args;

        const success = await this.cbdClient.deleteMemory(key);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success,
                        message: success ? 'Memory deleted successfully' : 'Failed to delete memory',
                    }, null, 2)
                }
            ]
        };
    }

    private async handleListMemoryKeys(args: any) {
        const { prefix, limit, include_metadata } = args;

        const keys = await this.cbdClient.listKeys({
            prefix,
            limit: Math.min(limit || this.config.maxResultsPerQuery!, this.config.maxResultsPerQuery!),
            includeMetadata: include_metadata || false,
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        keys,
                        count: keys.length,
                    }, null, 2)
                }
            ]
        };
    }

    private async handleGetServerStats(args: any) {
        const { detailed } = args;

        const stats = await this.cbdClient.getStats(detailed || false);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(stats, null, 2)
                }
            ]
        };
    }

    private async handleHealthCheck() {
        const health = await this.cbdClient.healthCheck();

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(health, null, 2)
                }
            ]
        };
    }

    async run(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);

        // Keep the server running
        process.on('SIGINT', async () => {
            await this.cbdClient.disconnect();
            process.exit(0);
        });
    }
}

// CLI entry point
async function main(): Promise<void> {
    const config: MCPServerConfig = {
        serverUrl: process.env.CBD_SERVER_URL || 'http://localhost:8081',
        protocol: (process.env.CBD_PROTOCOL as 'grpc' | 'rest') || 'rest',
        apiKey: process.env.CBD_API_KEY,
        logLevel: (process.env.CBD_LOG_LEVEL as any) || 'info',
        maxResultsPerQuery: parseInt(process.env.CBD_MAX_RESULTS || '100'),
        defaultSearchLimit: parseInt(process.env.CBD_DEFAULT_LIMIT || '10'),
        enableResourceListing: process.env.CBD_ENABLE_RESOURCES !== 'false',
    };

    const server = new CBDMCPServer(config);
    await server.run();
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('Fatal error in CBD MCP server:', error);
        process.exit(1);
    });
}

export default CBDMCPServer;
