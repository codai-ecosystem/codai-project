#!/usr/bin/env node

/**
 * Enhanced MemoraiMCP Server with CBD (Codai Better Database) Backend
 * Merges HPKV-inspired architecture with existing MCP functionality
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { CBDMemoryEngine, createCBDEngine, validateCBDConfig } from '@codai/cbd';

// Tool schemas
const RememberSchema = z.object({
    agentId: z.string(),
    userRequest: z.string(),
    assistantResponse: z.string(),
    metadata: z.object({
        project: z.string().optional(),
        session: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        tags: z.array(z.string()).optional(),
        type: z.string().optional(),
    }).optional(),
});

const SearchMemorySchema = z.object({
    query: z.string(),
    limit: z.number().min(1).max(50).optional(),
    confidenceThreshold: z.number().min(0).max(1).optional(),
});

const SearchKeysSchema = z.object({
    query: z.string(),
    topK: z.number().min(1).max(50).optional(),
    minScore: z.number().min(0).max(1).optional(),
});

const GetMemorySchema = z.object({
    structuredKey: z.string(),
});

const RecallSchema = z.object({
    agentId: z.string(),
    query: z.string(),
    limit: z.number().min(1).max(100).optional(),
    minImportance: z.number().min(0).max(1).optional(),
    project: z.string().optional(),
    session: z.string().optional(),
});

const ForgetSchema = z.object({
    agentId: z.string(),
    structuredKey: z.string(),
});

const ContextSchema = z.object({
    agentId: z.string(),
    contextSize: z.number().min(1).max(20).optional(),
});

class EnhancedMemoraiMCPServer {
    private server: Server;
    private cbdEngine!: CBDMemoryEngine;
    private initialized = false;

    constructor() {
        this.server = new Server(
            {
                name: 'enhanced-memorai-mcp',
                version: '8.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.initializeCBD();
        this.setupToolHandlers();
    }

    private initializeCBD(): void {
        try {
            // Initialize CBD with configuration
            const config = {
                storage: {
                    type: 'cbd-native' as const,
                    dataPath: process.env.CBD_DATA_PATH || './enhanced-memorai-cbd-data'
                },
                embedding: {
                    model: 'openai' as const,
                    apiKey: process.env.OPENAI_API_KEY || undefined,
                    modelName: 'text-embedding-ada-002'
                }
            };

            const validation = validateCBDConfig(config as any);
            if (!validation.valid) {
                console.warn('CBD configuration issues:', validation.errors);
            }

            this.cbdEngine = createCBDEngine(config);
            console.log('🚀 Enhanced MemoraiMCP with CBD backend initialized');
        } catch (error) {
            console.error('Failed to initialize CBD engine:', error);
            throw error;
        }
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.cbdEngine.initialize();
            this.initialized = true;
        }
    }

    private setupToolHandlers(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'store_memory',
                        description: 'Store a conversation exchange (HPKV API)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                userRequest: { type: 'string', description: 'User request/question' },
                                assistantResponse: { type: 'string', description: 'Assistant response' },
                                metadata: {
                                    type: 'object',
                                    description: 'Memory metadata (project, session, agent info)',
                                    properties: {
                                        projectName: { type: 'string' },
                                        sessionName: { type: 'string' },
                                        agentId: { type: 'string' },
                                        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                                        tags: { type: 'array', items: { type: 'string' } }
                                    },
                                    required: ['projectName', 'sessionName', 'agentId']
                                }
                            },
                            required: ['userRequest', 'assistantResponse', 'metadata']
                        }
                    },
                    {
                        name: 'search_memory',
                        description: 'Semantic search with AI-powered summarization (HPKV API)',
                        inputSchema: SearchMemorySchema
                    },
                    {
                        name: 'search_keys',
                        description: 'Search for memory keys using vector similarity (HPKV API)',
                        inputSchema: SearchKeysSchema
                    },
                    {
                        name: 'get_memory',
                        description: 'Retrieve memory by exact structured key (HPKV API)',
                        inputSchema: GetMemorySchema
                    },
                    // Backward compatibility tools
                    {
                        name: 'remember',
                        description: 'Store a memory with agent isolation (legacy compatibility)',
                        inputSchema: RememberSchema
                    },
                    {
                        name: 'recall',
                        description: 'Search memories with semantic understanding (legacy compatibility)',
                        inputSchema: RecallSchema
                    },
                    {
                        name: 'forget',
                        description: 'Delete a memory by structured key (legacy compatibility)',
                        inputSchema: ForgetSchema
                    },
                    {
                        name: 'context',
                        description: 'Get recent context for agent (legacy compatibility)',
                        inputSchema: ContextSchema
                    }
                ]
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                await this.ensureInitialized();

                switch (name) {
                    case 'store_memory':
                        return await this.handleStoreMemory(args);
                    case 'search_memory':
                        return await this.handleSearchMemory(args);
                    case 'search_keys':
                        return await this.handleSearchKeys(args);
                    case 'get_memory':
                        return await this.handleGetMemory(args);
                    case 'remember':
                        return await this.handleRemember(args);
                    case 'recall':
                        return await this.handleRecall(args);
                    case 'forget':
                        return await this.handleForget(args);
                    case 'context':
                        return await this.handleContext(args);
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            } catch (error) {
                console.error(`Error in ${name}:`, error);
                throw new McpError(
                    ErrorCode.InternalError,
                    `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        });
    }

    // HPKV API Implementations
    private async handleStoreMemory(args: any) {
        const parsed = z.object({
            userRequest: z.string(),
            assistantResponse: z.string(),
            metadata: z.object({
                projectName: z.string(),
                sessionName: z.string(),
                agentId: z.string(),
                priority: z.string().optional(),
                tags: z.array(z.string()).optional()
            })
        }).parse(args);

        const structuredKey = await this.cbdEngine.store_memory(
            parsed.userRequest,
            parsed.assistantResponse,
            parsed.metadata
        );

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify({
                    success: true,
                    structuredKey,
                    message: 'Conversation exchange stored successfully with semantic embeddings',
                    metadata: {
                        operation: 'store_memory',
                        timestamp: new Date().toISOString(),
                        cbdVersion: '8.0.0'
                    }
                }, null, 2)
            }]
        };
    }

    private async handleSearchMemory(args: any) {
        const parsed = SearchMemorySchema.parse(args);

        const result = await this.cbdEngine.search_memory(
            parsed.query,
            parsed.limit || 10,
            parsed.confidenceThreshold || 0.5
        );

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify({
                    success: true,
                    summary: result.summary,
                    memories: result.memories.map(m => ({
                        structuredKey: m.memory.structuredKey,
                        relevanceScore: m.relevanceScore,
                        confidence: m.confidence,
                        userRequest: m.memory.userRequest,
                        assistantResponse: m.memory.assistantResponse,
                        projectName: m.memory.projectName,
                        sessionName: m.memory.sessionName,
                        createdAt: m.memory.createdAt
                    })),
                    metadata: {
                        operation: 'search_memory',
                        query: parsed.query,
                        resultsCount: result.memories.length,
                        timestamp: new Date().toISOString()
                    }
                }, null, 2)
            }]
        };
    }

    private async handleSearchKeys(args: any) {
        const parsed = SearchKeysSchema.parse(args);

        const results = await this.cbdEngine.search_keys(
            parsed.query,
            parsed.topK || 10,
            parsed.minScore || 0.3
        );

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify({
                    success: true,
                    keys: results,
                    metadata: {
                        operation: 'search_keys',
                        query: parsed.query,
                        resultsCount: results.length,
                        timestamp: new Date().toISOString()
                    }
                }, null, 2)
            }]
        };
    }

    private async handleGetMemory(args: any) {
        const parsed = GetMemorySchema.parse(args);

        const memory = await this.cbdEngine.get_memory(parsed.structuredKey);

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify({
                    success: true,
                    memory: memory ? {
                        structuredKey: memory.structuredKey,
                        userRequest: memory.userRequest,
                        assistantResponse: memory.assistantResponse,
                        projectName: memory.projectName,
                        sessionName: memory.sessionName,
                        agentId: memory.agentId,
                        metadata: memory.metadata,
                        confidenceScore: memory.confidenceScore,
                        createdAt: memory.createdAt,
                        updatedAt: memory.updatedAt
                    } : null,
                    metadata: {
                        operation: 'get_memory',
                        structuredKey: parsed.structuredKey,
                        found: !!memory,
                        timestamp: new Date().toISOString()
                    }
                }, null, 2)
            }]
        };
    }

    // Legacy compatibility implementations
    private async handleRemember(args: any) {
        const parsed = RememberSchema.parse(args);

        // Convert legacy format to CBD format
        const metadata = {
            projectName: parsed.metadata?.project || 'general',
            sessionName: parsed.metadata?.session || 'default',
            agentId: parsed.agentId,
            priority: parsed.metadata?.priority,
            tags: parsed.metadata?.tags,
            type: parsed.metadata?.type
        };

        const structuredKey = await this.cbdEngine.store_memory(
            parsed.userRequest,
            parsed.assistantResponse,
            metadata
        );

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify({
                    success: true,
                    structuredKey,
                    message: 'Memory stored successfully (legacy compatibility mode)',
                    metadata: {
                        operation: 'remember',
                        agentId: parsed.agentId,
                        timestamp: new Date().toISOString()
                    }
                }, null, 2)
            }]
        };
    }

    private async handleRecall(args: any) {
        const parsed = RecallSchema.parse(args);

        const result = await this.cbdEngine.search_memory(
            parsed.query,
            parsed.limit || 10,
            parsed.minImportance || 0.0
        );

        // Convert CBD format to legacy format
        const memories = result.memories.map(m => ({
            structured_key: m.memory.structuredKey,
            content: m.memory.userRequest,
            response: m.memory.assistantResponse,
            agent_id: m.memory.agentId,
            project: m.memory.projectName,
            session: m.memory.sessionName,
            metadata: m.memory.metadata,
            confidence_score: m.confidence,
            relevance_score: m.relevanceScore,
            created_at: m.memory.createdAt
        }));

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify({
                    success: true,
                    memories,
                    summary: result.summary.summary,
                    totalFound: memories.length,
                    query: parsed.query,
                    searchOptions: {
                        limit: parsed.limit,
                        minImportance: parsed.minImportance
                    },
                    metadata: {
                        operation: 'recall',
                        agentId: parsed.agentId,
                        timestamp: new Date().toISOString(),
                        compatibilityMode: true
                    }
                }, null, 2)
            }]
        };
    }

    private async handleForget(args: any) {
        const parsed = ForgetSchema.parse(args);

        const memory = await this.cbdEngine.get_memory(parsed.structuredKey);
        // Note: CBD doesn't have delete in the current implementation
        // This would need to be added to the StorageAdapter interface

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify({
                    success: false,
                    message: 'Delete functionality not yet implemented in CBD backend',
                    found: !!memory,
                    metadata: {
                        operation: 'forget',
                        structuredKey: parsed.structuredKey,
                        timestamp: new Date().toISOString()
                    }
                }, null, 2)
            }]
        };
    }

    private async handleContext(args: any) {
        const parsed = ContextSchema.parse(args);

        // Use search_memory to get recent context
        const result = await this.cbdEngine.search_memory(
            `recent context for ${parsed.agentId}`,
            parsed.contextSize || 5,
            0.0
        );

        const context = result.memories.slice(0, parsed.contextSize || 5).map(m => ({
            structured_key: m.memory.structuredKey,
            content: m.memory.userRequest,
            response: m.memory.assistantResponse,
            created_at: m.memory.createdAt,
            project: m.memory.projectName,
            session: m.memory.sessionName
        }));

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify({
                    success: true,
                    context,
                    agentId: parsed.agentId,
                    contextSize: context.length,
                    metadata: {
                        operation: 'context',
                        timestamp: new Date().toISOString(),
                        compatibilityMode: true
                    }
                }, null, 2)
            }]
        };
    }

    async start(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('🤖 Enhanced MemoraiMCP Server with CBD backend running on stdio');
    }
}

// Start the server
const server = new EnhancedMemoraiMCPServer();
server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
