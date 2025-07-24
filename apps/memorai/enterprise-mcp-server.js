#!/usr/bin/env node
/**
 * ENTERPRISE MemorAI MCP Server - CND Integration
 * World-class implementation with CND multi-paradigm database integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CND } from '@codai/cnd';

class EnterpriseMemoryEngine {
    constructor() {
        this.metrics = {
            totalQueries: 0,
            avgResponseTime: 0,
            cacheHitRate: 0,
            operationsPerSecond: 0,
            cacheSize: 0,
            memoryEfficiency: 1,
            cndOperations: 0,
            vectorSearches: 0
        };
        this.init();
    }

    async init() {
        try {
            // Initialize CND with enterprise configuration  
            this.cnd = new CND({
                cbd: {
                    host: 'localhost',
                    port: 8080,
                    database: 'memorai_enterprise'
                },
                cache: {
                    enabled: true,
                    ttl: 3600
                },
                realtime: {
                    enabled: false
                },
                logging: {
                    enabled: true,
                    level: 'info'
                }
            });

            console.error('🚀 ENTERPRISE MemorAI MCP Server initialized with CND integration');
            console.error('🎯 Multi-paradigm database ready: Document, Vector, Cache, Graph APIs');
        } catch (error) {
            console.error('❌ Failed to initialize CND integration:', error);
            throw error;
        }
    }

    async remember(params) {
        const startTime = Date.now();

        try {
            const memoryId = `mem_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;

            const memory = {
                id: memoryId,
                content: params.content,
                agentId: params.agentId,
                metadata: params.metadata || {},
                timestamp: new Date().toISOString(),
                type: params.metadata?.entityType || 'general',
                importance: params.metadata?.priority === 'high' ? 0.9 :
                    params.metadata?.priority === 'medium' ? 0.7 : 0.5
            };

            // Store in CND Document API (using collection method)
            await this.cnd.collection('memories').create(memory);

            // Store in CND Cache for fast retrieval
            await this.cnd.cache.set(`memory:${memoryId}`, JSON.stringify(memory), 3600);

            // If content is significant, store in vector API  
            if (params.content.length > 50) {
                try {
                    await this.cnd.vector('memories').insert(memoryId, {
                        content: params.content,
                        metadata: memory.metadata,
                        agentId: params.agentId
                    });
                } catch (vectorError) {
                    console.error('⚠️ Vector storage failed (non-critical):', vectorError.message);
                }
            }

            // Create knowledge graph relationships if metadata indicates connections
            if (params.metadata?.relatedTo) {
                try {
                    await this.cnd.graph.relate(memoryId, params.metadata.relatedTo, 'RELATED_TO');
                } catch (graphError) {
                    console.error('⚠️ Graph relationship failed (non-critical):', graphError.message);
                }
            }

            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            this.metrics.cndOperations++;

            return {
                success: true,
                memoryId,
                message: 'Memory stored successfully in CND enterprise database',
                debug: {
                    requestId: `ent-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    contentLength: params.content.length,
                    agentId: params.agentId,
                    storageType: 'cnd-enterprise'
                },
                performance: {
                    responseTime: `${responseTime}ms`,
                    requestId: `ent-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    serverType: 'enterprise-cnd',
                    metrics: this.metrics,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Enterprise memory storage failed:', error);
            return {
                success: false,
                error: error.message,
                fallback: 'Consider checking CND configuration'
            };
        }
    }

    async recall(params) {
        const startTime = Date.now();

        try {
            const query = params.query.toLowerCase();
            const agentId = params.agentId;
            const limit = params.limit || 10;

            let results = [];

            // First try cache for recent queries
            const cacheKey = `recall:${agentId}:${query}:${limit}`;
            const cached = await this.cnd.cache.get(cacheKey);

            if (cached) {
                results = JSON.parse(cached);
                this.metrics.cacheHitRate = (this.metrics.cacheHitRate + 1) / 2;
            } else {
                // Use CND Vector API for semantic search if available
                if (query.length > 20) {
                    try {
                        const vectorResults = await this.cnd.vector('memories').semanticSearch(query, {
                            limit,
                            filter: agentId !== 'all' ? { agentId } : undefined
                        });

                        results = vectorResults.map(result => ({
                            id: result.id,
                            content: result.metadata.content,
                            relevance: result.score,
                            metadata: result.metadata,
                            timestamp: result.metadata.timestamp
                        }));

                        this.metrics.vectorSearches++;
                    } catch (vectorError) {
                        console.error('⚠️ Vector search failed, falling back to document search');
                    }
                }

                // Fallback to CND Document API search
                if (results.length === 0) {
                    const searchQuery = {
                        $or: [
                            { content: { $regex: query, $options: 'i' } },
                            { 'metadata.type': { $regex: query, $options: 'i' } }
                        ]
                    };

                    if (agentId !== 'all') {
                        searchQuery.agentId = agentId;
                    }

                    const documents = await this.cnd.collection('memories').find(searchQuery).limit(limit);

                    results = documents.map(doc => ({
                        id: doc.id,
                        content: doc.content,
                        relevance: this.calculateRelevance(doc.content, query),
                        metadata: doc.metadata,
                        timestamp: doc.timestamp
                    }));
                }

                // Cache results for 5 minutes
                await this.cnd.cache.set(cacheKey, JSON.stringify(results), 300);
            }

            // Sort by relevance and timestamp
            results.sort((a, b) => {
                if (Math.abs(a.relevance - b.relevance) < 0.1) {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                }
                return b.relevance - a.relevance;
            });

            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            this.metrics.cndOperations++;

            return {
                success: true,
                memories: results.slice(0, limit),
                count: results.length,
                message: 'Found memories from CND enterprise database',
                debug: {
                    requestId: `ent-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    queryLength: query.length,
                    searchLimit: limit,
                    cacheStatus: cached ? 'hit' : 'miss',
                    agentId: params.agentId,
                    searchMethod: results.length > 0 && this.metrics.vectorSearches > 0 ? 'vector' : 'document'
                },
                performance: {
                    responseTime: `${responseTime}ms`,
                    requestId: `ent-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    serverType: 'enterprise-cnd',
                    metrics: this.metrics,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Enterprise memory recall failed:', error);
            return {
                success: false,
                error: error.message,
                memories: [],
                count: 0
            };
        }
    }

    async forget(params) {
        const startTime = Date.now();

        try {
            const memoryId = params.memoryId || params.structuredKey;

            // Delete from all CND storage systems
            const deletions = await Promise.allSettled([
                this.cnd.collection('memories').delete({ id: memoryId }),
                this.cnd.cache.delete(`memory:${memoryId}`),
                this.cnd.vector('memories').delete(memoryId),
                this.cnd.graph.deleteNode(memoryId)
            ]);

            const successful = deletions.filter(result => result.status === 'fulfilled').length;

            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            this.metrics.cndOperations++;

            return {
                success: successful > 0,
                message: successful > 0 ? `Memory deleted from ${successful}/4 CND systems` : 'Memory not found',
                debug: {
                    requestId: `ent-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    memoryId,
                    deletionsSuccessful: successful
                },
                performance: {
                    responseTime: `${responseTime}ms`,
                    serverType: 'enterprise-cnd',
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Enterprise memory deletion failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async context(params) {
        const startTime = Date.now();

        try {
            const agentId = params.agentId;
            const contextSize = params.contextSize || 5;

            // Get recent memories for the agent from CND
            const recentMemories = await this.cnd.collection('memories')
                .find({ agentId })
                .sort({ timestamp: -1 })
                .limit(contextSize);

            const context = recentMemories.map(memory => ({
                id: memory.id,
                content: memory.content,
                metadata: memory.metadata,
                timestamp: memory.timestamp
            }));

            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            this.metrics.cndOperations++;

            return {
                success: true,
                context,
                count: context.length,
                message: 'Context retrieved from CND enterprise database',
                debug: {
                    requestId: `ent-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    agentId,
                    contextSize,
                    totalMemories: await this.cnd.collection('memories').count({ agentId })
                },
                performance: {
                    responseTime: `${responseTime}ms`,
                    serverType: 'enterprise-cnd',
                    metrics: this.metrics,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Enterprise context retrieval failed:', error);
            return {
                success: false,
                error: error.message,
                context: [],
                count: 0
            };
        }
    }

    calculateRelevance(content, query) {
        const contentLower = content.toLowerCase();
        const queryTerms = query.split(' ').filter(term => term.length > 2);

        let score = 0;
        for (const term of queryTerms) {
            if (contentLower.includes(term)) {
                score += 0.3;
            }
        }

        return Math.min(score, 1.0);
    }

    updateMetrics(responseTime) {
        this.metrics.totalQueries++;
        this.metrics.avgResponseTime =
            ((this.metrics.avgResponseTime * (this.metrics.totalQueries - 1)) + responseTime) /
            this.metrics.totalQueries;
    }
}

class EnterpriseMCPServer {
    constructor() {
        this.memoryEngine = new EnterpriseMemoryEngine();
        this.server = new Server(
            {
                name: 'memorai-enterprise-mcp',
                version: '2.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();
    }

    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'remember',
                    description: 'Store a memory using CND enterprise database',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agentId: { type: 'string', description: 'Agent identifier' },
                            content: { type: 'string', description: 'Memory content to store' },
                            metadata: { type: 'object', description: 'Additional metadata for semantic relationships' }
                        },
                        required: ['agentId', 'content']
                    }
                },
                {
                    name: 'recall',
                    description: 'Search and retrieve memories using semantic search',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agentId: { type: 'string', description: 'Agent identifier' },
                            query: { type: 'string', description: 'Search query (supports semantic search)' },
                            limit: { type: 'number', description: 'Maximum results' }
                        },
                        required: ['agentId', 'query']
                    }
                },
                {
                    name: 'forget',
                    description: 'Delete a specific memory from all CND systems',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agentId: { type: 'string', description: 'Agent identifier' },
                            memoryId: { type: 'string', description: 'Memory ID to delete' },
                            structuredKey: { type: 'string', description: 'Alternative structured key for deletion' }
                        },
                        required: ['agentId']
                    }
                },
                {
                    name: 'context',
                    description: 'Get recent context for an agent from CND',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agentId: { type: 'string', description: 'Agent identifier' },
                            contextSize: { type: 'number', description: 'Number of recent memories' }
                        },
                        required: ['agentId']
                    }
                }
            ]
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;

                switch (name) {
                    case 'remember':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(await this.memoryEngine.remember(args))
                                }
                            ]
                        };

                    case 'recall':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(await this.memoryEngine.recall(args))
                                }
                            ]
                        };

                    case 'forget':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(await this.memoryEngine.forget(args))
                                }
                            ]
                        };

                    case 'context':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(await this.memoryEngine.context(args))
                                }
                            ]
                        };

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: error.message,
                                serverType: 'enterprise-cnd'
                            })
                        }
                    ],
                    isError: true
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('🚀 Enterprise MemorAI MCP Server running with CND integration!');
        console.error('🎯 Features: Semantic Search, Vector Storage, Caching, Graph Relationships');
    }
}

// Start the enterprise server
const server = new EnterpriseMCPServer();
server.run().catch(console.error);
