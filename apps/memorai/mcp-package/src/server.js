#!/usr/bin/env node
/**
 * MemoraiMCP Server v7.0.0 - HPKV-Inspired Complete Rewrite
 * World-class semantic memory with structured keys, vector similarity, and intelligent search
 * 
 * Based on HPKV Memory Server architecture with four core functions:
 * - store_memory: Structured key-based storage with semantic understanding
 * - search_memory: AI-powered semantic search with relevance ranking  
 * - search_keys: Vector similarity search for related memory keys
 * - get_memory: Direct retrieval by exact structured key
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { MemoryDatabase } from './database.js';

// Input validation schemas
const RememberSchema = z.object({
    agentId: z.string().min(1, 'Agent ID is required'),
    content: z.string().min(1, 'Content is required'),
    metadata: z.object({
        project: z.string().optional(),
        session: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        tags: z.array(z.string()).optional(),
        type: z.string().optional()
    }).optional().default({})
});

const RecallSchema = z.object({
    agentId: z.string().min(1, 'Agent ID is required'),
    query: z.string().min(1, 'Query is required'),
    limit: z.number().int().min(1).max(100).optional().default(10),
    project: z.string().optional(),
    session: z.string().optional(),
    minImportance: z.number().min(0).max(1).optional().default(0.0)
});

const SearchKeysSchema = z.object({
    query: z.string().min(1, 'Query is required'),
    limit: z.number().int().min(1).max(50).optional().default(20),
    minScore: z.number().min(0).max(1).optional().default(0.0),
    agentId: z.string().optional()
});

const GetMemorySchema = z.object({
    structuredKey: z.string().min(1, 'Structured key is required')
});

const ForgetSchema = z.object({
    agentId: z.string().min(1, 'Agent ID is required'),
    structuredKey: z.string().min(1, 'Structured key is required')
});

const ContextSchema = z.object({
    agentId: z.string().min(1, 'Agent ID is required'),
    contextSize: z.number().int().min(1).max(20).optional().default(5),
    project: z.string().optional(),
    session: z.string().optional()
});

/**
 * HPKV-Inspired Memory Engine
 * Implements the four core memory functions with structured keys and semantic search
 */
class HPKVMemoryEngine {
    constructor() {
        this.database = new MemoryDatabase();
        this.isInitialized = false;
        this.startupTime = Date.now();
        this.operationCount = 0;
        this.operationTimes = [];
        
        // Performance tracking
        this.metrics = {
            totalOperations: 0,
            averageResponseTime: 0,
            operationsPerSecond: 0,
            memoryCount: 0,
            agentCount: 0,
            projectCount: 0,
            uptime: 0
        };
    }

    async initialize() {
        try {
            await this.database.initialize();
            this.isInitialized = true;
            console.error('🧠 HPKVMemoryEngine v7.0.0 initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize HPKVMemoryEngine:', error);
            throw error;
        }
    }

    /**
     * HPKV Function 1: store_memory
     * Store memory with structured key format: project_name_date_session_name_sequence_number
     */
    async storeMemory(params) {
        const startTime = Date.now();
        
        try {
            const validated = RememberSchema.parse(params);
            
            const result = await this.database.storeMemory(
                validated.agentId,
                validated.content,
                validated.metadata
            );
            
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                success: true,
                memoryId: result.memoryId,
                structuredKey: result.structuredKey,
                projectName: result.projectName,
                sessionName: result.sessionName,
                sequenceNumber: result.sequenceNumber,
                isDuplicate: result.isDuplicate,
                importanceScore: result.importanceScore,
                message: result.isDuplicate ? 
                    'Memory already exists, access updated' : 
                    'Memory stored with structured key',
                metadata: {
                    responseTime: `${responseTime}ms`,
                    serverVersion: '7.0.0',
                    operation: 'store_memory',
                    structuredKeyFormat: 'project_date_session_sequence',
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                success: false,
                error: error.message,
                errorType: error.name,
                operation: 'store_memory',
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * HPKV Function 2: search_memory  
     * AI-powered semantic search with intelligent relevance ranking
     */
    async searchMemory(params) {
        const startTime = Date.now();
        
        try {
            const validated = RecallSchema.parse(params);
            
            const searchOptions = {
                limit: validated.limit,
                project: validated.project,
                session: validated.session,
                minImportance: validated.minImportance
            };
            
            const result = await this.database.searchMemories(
                validated.agentId,
                validated.query,
                searchOptions
            );
            
            // Generate AI-powered summary for non-empty results
            const summary = this.generateSearchSummary(result.memories, validated.query);
            
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                success: true,
                memories: result.memories,
                totalFound: result.totalFound,
                query: validated.query,
                summary: summary,
                searchOptions: searchOptions,
                message: this.getSearchMessage(result.totalFound, validated.query),
                metadata: {
                    responseTime: `${responseTime}ms`,
                    serverVersion: '7.0.0',
                    operation: 'search_memory',
                    searchType: 'semantic_with_relevance_ranking',
                    timestamp: new Date().toISOString()
                },
                systemInfo: result.totalFound === 0 ? await this.getSystemCapabilities() : null
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                success: false,
                error: error.message,
                errorType: error.name,
                operation: 'search_memory',
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * HPKV Function 3: search_keys
     * Vector similarity search for related memory keys
     */
    async searchKeys(params) {
        const startTime = Date.now();
        
        try {
            const validated = SearchKeysSchema.parse(params);
            
            const searchOptions = {
                limit: validated.limit,
                minScore: validated.minScore
            };
            
            const result = await this.database.searchKeys(validated.query, searchOptions);
            
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                success: true,
                keys: result.keys,
                totalFound: result.totalFound,
                query: validated.query,
                searchOptions: searchOptions,
                message: `Found ${result.totalFound} similar memory keys`,
                metadata: {
                    responseTime: `${responseTime}ms`,
                    serverVersion: '7.0.0',
                    operation: 'search_keys',
                    searchType: 'vector_similarity_keys',
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                success: false,
                error: error.message,
                errorType: error.name,
                operation: 'search_keys',
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * HPKV Function 4: get_memory
     * Direct retrieval by exact structured key
     */
    async getMemory(params) {
        const startTime = Date.now();
        
        try {
            const validated = GetMemorySchema.parse(params);
            
            const memory = await this.database.getMemory(validated.structuredKey);
            
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            if (!memory) {
                return {
                    success: false,
                    message: 'Memory not found with the specified structured key',
                    structuredKey: validated.structuredKey,
                    metadata: {
                        responseTime: `${responseTime}ms`,
                        serverVersion: '7.0.0',
                        operation: 'get_memory',
                        timestamp: new Date().toISOString()
                    }
                };
            }
            
            return {
                success: true,
                memory: memory,
                structuredKey: validated.structuredKey,
                message: 'Memory retrieved successfully',
                metadata: {
                    responseTime: `${responseTime}ms`,
                    serverVersion: '7.0.0',
                    operation: 'get_memory',
                    accessCount: memory.accessCount,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                success: false,
                error: error.message,
                errorType: error.name,
                operation: 'get_memory',
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Enhanced forget function with structured key support
     */
    async forgetMemory(params) {
        const startTime = Date.now();
        
        try {
            const validated = ForgetSchema.parse(params);
            
            const result = await this.database.deleteMemory(validated.structuredKey);
            
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                success: result.success,
                message: result.message,
                structuredKey: validated.structuredKey,
                agentId: validated.agentId,
                metadata: {
                    responseTime: `${responseTime}ms`,
                    serverVersion: '7.0.0',
                    operation: 'forget_memory',
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                success: false,
                error: error.message,
                errorType: error.name,
                operation: 'forget_memory',
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Enhanced context function with project/session filtering
     */
    async getContext(params) {
        const startTime = Date.now();
        
        try {
            const validated = ContextSchema.parse(params);
            
            const context = await this.database.getContext(
                validated.agentId, 
                validated.contextSize
            );
            
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                success: true,
                context: context,
                agentId: validated.agentId,
                contextSize: validated.contextSize,
                actualSize: context.length,
                message: `Retrieved ${context.length} recent memories for agent context`,
                metadata: {
                    responseTime: `${responseTime}ms`,
                    serverVersion: '7.0.0',
                    operation: 'get_context',
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                success: false,
                error: error.message,
                errorType: error.name,
                operation: 'get_context',
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Helper methods
    generateSearchSummary(memories, query) {
        if (memories.length === 0) {
            return 'No memories found matching your search criteria. Try broader terms or check system capabilities with "memorai help".';
        }

        if (memories.length === 1) {
            return `Found 1 memory matching "${query}" with ${Math.round(memories[0].relevanceScore * 100)}% relevance.`;
        }

        const avgRelevance = memories.reduce((acc, m) => acc + m.relevanceScore, 0) / memories.length;
        const topRelevance = Math.max(...memories.map(m => m.relevanceScore));
        
        return `Found ${memories.length} memories for "${query}". Top match: ${Math.round(topRelevance * 100)}% relevant. Average relevance: ${Math.round(avgRelevance * 100)}%.`;
    }

    getSearchMessage(totalFound, query) {
        if (totalFound === 0) {
            return `No memories found for "${query}". Use "memorai help" for assistance or try different search terms.`;
        }
        
        return `Found ${totalFound} memories with semantic search and relevance ranking.`;
    }

    async getSystemCapabilities() {
        const stats = await this.database.getStatistics();
        const uptime = Date.now() - this.startupTime;
        
        return {
            server: {
                name: 'MemoraiMCP Server',
                version: '7.0.0',
                architecture: 'HPKV-Inspired Semantic Memory',
                uptime: `${Math.round(uptime / 1000)}s`,
                status: 'Operational'
            },
            capabilities: {
                coreOperations: [
                    {
                        name: 'store_memory (remember)',
                        description: 'Store memories with structured keys: project_date_session_sequence',
                        features: ['Automatic key generation', 'Duplicate detection', 'Importance scoring']
                    },
                    {
                        name: 'search_memory (recall)',
                        description: 'Semantic search with AI-powered relevance ranking',
                        features: ['Full-text search', 'Relevance scoring', 'Project/session filtering']
                    },
                    {
                        name: 'search_keys',
                        description: 'Vector similarity search for related memory keys',
                        features: ['Key similarity matching', 'Configurable thresholds', 'Ranked results']
                    },
                    {
                        name: 'get_memory',
                        description: 'Direct memory retrieval by structured key',
                        features: ['Exact key matching', 'Access tracking', 'Metadata retrieval']
                    }
                ],
                additionalOperations: [
                    'forget_memory: Delete specific memories by structured key',
                    'get_context: Retrieve recent agent context with filtering'
                ]
            },
            database: {
                totalMemories: stats.totalMemories,
                uniqueAgents: stats.uniqueAgents,
                uniqueProjects: stats.uniqueProjects,
                uniqueSessions: stats.uniqueSessions,
                averageImportance: stats.averageImportance,
                version: stats.version
            },
            performance: await this.getPerformanceMetrics()
        };
    }

    async getPerformanceMetrics() {
        const stats = await this.database.getStatistics();
        const uptime = (Date.now() - this.startupTime) / 1000;
        
        return {
            totalOperations: this.operationCount,
            averageResponseTime: `${Math.round(this.getAverageResponseTime())}ms`,
            operationsPerSecond: Math.round(this.operationCount / uptime * 100) / 100,
            uptime: `${Math.round(uptime)}s`,
            memoryCount: stats.totalMemories,
            agentCount: stats.uniqueAgents,
            databasePath: stats.databasePath
        };
    }

    updateMetrics(responseTime) {
        this.operationCount++;
        this.operationTimes.push(responseTime);
        
        // Keep only last 100 operation times for rolling average
        if (this.operationTimes.length > 100) {
            this.operationTimes.shift();
        }
    }

    getAverageResponseTime() {
        if (this.operationTimes.length === 0) return 0;
        return this.operationTimes.reduce((a, b) => a + b, 0) / this.operationTimes.length;
    }

    async shutdown() {
        try {
            await this.database.close();
            console.error('🔄 HPKVMemoryEngine shutdown complete');
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        }
    }
}

/**
 * HPKV-Inspired MCP Server
 * Implements Model Context Protocol with semantic memory capabilities
 */
class HPKVMCPServer {
    constructor() {
        this.memoryEngine = new HPKVMemoryEngine();
        this.server = new Server(
            {
                name: 'memorai-hpkv-mcp-server',
                version: '7.0.0'
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );

        this.setupToolHandlers();
        
        // Graceful shutdown handling
        process.on('SIGINT', () => this.gracefulShutdown());
        process.on('SIGTERM', () => this.gracefulShutdown());
    }

    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'remember',
                    description: 'Store memory with structured key (HPKV store_memory)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agentId: { 
                                type: 'string', 
                                description: 'Agent identifier for memory isolation' 
                            },
                            content: { 
                                type: 'string', 
                                description: 'Memory content to store' 
                            },
                            metadata: {
                                type: 'object',
                                description: 'Optional metadata (project, session, priority, tags)',
                                properties: {
                                    project: { type: 'string', description: 'Project name for organization' },
                                    session: { type: 'string', description: 'Session name for grouping' },
                                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                                    tags: { type: 'array', items: { type: 'string' } },
                                    type: { type: 'string', description: 'Memory type' }
                                }
                            }
                        },
                        required: ['agentId', 'content']
                    }
                },
                {
                    name: 'recall',
                    description: 'Semantic search with relevance ranking (HPKV search_memory)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agentId: { 
                                type: 'string', 
                                description: 'Agent identifier (use "all" for cross-agent search)' 
                            },
                            query: { 
                                type: 'string', 
                                description: 'Natural language search query' 
                            },
                            limit: { 
                                type: 'number', 
                                description: 'Maximum results (1-100)', 
                                minimum: 1, 
                                maximum: 100 
                            },
                            project: { 
                                type: 'string', 
                                description: 'Filter by project name' 
                            },
                            session: { 
                                type: 'string', 
                                description: 'Filter by session name' 
                            },
                            minImportance: { 
                                type: 'number', 
                                description: 'Minimum importance score (0.0-1.0)',
                                minimum: 0,
                                maximum: 1
                            }
                        },
                        required: ['agentId', 'query']
                    }
                },
                {
                    name: 'search_keys',
                    description: 'Vector similarity search for memory keys (HPKV search_keys)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: { 
                                type: 'string', 
                                description: 'Query for finding similar memory keys' 
                            },
                            limit: { 
                                type: 'number', 
                                description: 'Maximum keys to return (1-50)', 
                                minimum: 1, 
                                maximum: 50 
                            },
                            minScore: { 
                                type: 'number', 
                                description: 'Minimum similarity score (0.0-1.0)',
                                minimum: 0,
                                maximum: 1
                            }
                        },
                        required: ['query']
                    }
                },
                {
                    name: 'get_memory',
                    description: 'Get memory by exact structured key (HPKV get_memory)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            structuredKey: { 
                                type: 'string', 
                                description: 'Exact structured key (project_date_session_sequence)' 
                            }
                        },
                        required: ['structuredKey']
                    }
                },
                {
                    name: 'forget',
                    description: 'Delete memory by structured key',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agentId: { 
                                type: 'string', 
                                description: 'Agent identifier' 
                            },
                            structuredKey: { 
                                type: 'string', 
                                description: 'Structured key of memory to delete' 
                            }
                        },
                        required: ['agentId', 'structuredKey']
                    }
                },
                {
                    name: 'context',
                    description: 'Get recent context for agent',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agentId: { 
                                type: 'string', 
                                description: 'Agent identifier' 
                            },
                            contextSize: { 
                                type: 'number', 
                                description: 'Number of recent memories (1-20)',
                                minimum: 1,
                                maximum: 20
                            }
                        },
                        required: ['agentId']
                    }
                }
            ]
        }));

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;

                let result;
                switch (name) {
                    case 'remember':
                        result = await this.memoryEngine.storeMemory(args);
                        break;

                    case 'recall':
                        result = await this.memoryEngine.searchMemory(args);
                        break;

                    case 'search_keys':
                        result = await this.memoryEngine.searchKeys(args);
                        break;

                    case 'get_memory':
                        result = await this.memoryEngine.getMemory(args);
                        break;

                    case 'forget':
                        result = await this.memoryEngine.forgetMemory(args);
                        break;

                    case 'context':
                        result = await this.memoryEngine.getContext(args);
                        break;

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };

            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: error.message,
                                errorType: error.name,
                                serverVersion: '7.0.0',
                                timestamp: new Date().toISOString()
                            }, null, 2)
                        }
                    ],
                    isError: true
                };
            }
        });
    }

    async run() {
        try {
            // Initialize memory engine
            await this.memoryEngine.initialize();
            
            // Connect to transport
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            
            console.error('🚀 MemoraiMCP Server v7.0.0 - HPKV-Inspired Architecture');
            console.error('💡 Features: Structured keys, semantic search, vector similarity');
            console.error('📊 Ready for VS Code Copilot integration');
            
        } catch (error) {
            console.error('❌ Failed to start MemoraiMCP Server:', error);
            process.exit(1);
        }
    }

    async gracefulShutdown() {
        console.error('🔄 Shutting down MemoraiMCP Server...');
        try {
            await this.memoryEngine.shutdown();
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    }
}

// Start the HPKV-inspired server
const server = new HPKVMCPServer();
server.run().catch(console.error);
