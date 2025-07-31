#!/usr/bin/env node
/**
 * ENHANCED MemorAI MCP Server - CND-Ready Implementation
 * Production-ready implementation with CND integration foundation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

class EnhancedMemoryEngine {
    constructor() {
        this.dataDir = path.join(os.homedir(), '.memorai-mcp-enhanced');
        this.memoryFile = path.join(this.dataDir, 'memories.json');
        this.indexFile = path.join(this.dataDir, 'search-index.json');
        this.graphFile = path.join(this.dataDir, 'knowledge-graph.json');

        this.metrics = {
            totalQueries: 0,
            avgResponseTime: 0,
            cacheHitRate: 0,
            operationsPerSecond: 0,
            cacheSize: 0,
            memoryEfficiency: 1,
            semanticSearches: 0,
            graphOperations: 0
        };

        this.cache = new Map();
        this.searchIndex = new Map();
        this.knowledgeGraph = new Map();

        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });

            // Load existing memories
            try {
                const data = await fs.readFile(this.memoryFile, 'utf8');
                this.memories = JSON.parse(data);
            } catch {
                this.memories = {};
                await this.saveMemories();
            }

            // Load search index
            try {
                const indexData = await fs.readFile(this.indexFile, 'utf8');
                const indexObj = JSON.parse(indexData);
                this.searchIndex = new Map(Object.entries(indexObj));
            } catch {
                this.searchIndex = new Map();
                await this.saveSearchIndex();
            }

            // Load knowledge graph
            try {
                const graphData = await fs.readFile(this.graphFile, 'utf8');
                const graphObj = JSON.parse(graphData);
                this.knowledgeGraph = new Map(Object.entries(graphObj));
            } catch {
                this.knowledgeGraph = new Map();
                await this.saveKnowledgeGraph();
            }

            console.error('🚀 ENHANCED MemorAI MCP Server initialized with advanced features');
            console.error('🎯 Features: Semantic Search, Knowledge Graph, Caching, Multi-paradigm Storage');
        } catch (error) {
            console.error('❌ Failed to initialize enhanced memory storage:', error);
            this.memories = {};
        }
    }

    async saveMemories() {
        try {
            await fs.writeFile(this.memoryFile, JSON.stringify(this.memories, null, 2));
        } catch (error) {
            console.error('❌ Failed to save memories:', error);
        }
    }

    async saveSearchIndex() {
        try {
            const indexObj = Object.fromEntries(this.searchIndex);
            await fs.writeFile(this.indexFile, JSON.stringify(indexObj, null, 2));
        } catch (error) {
            console.error('❌ Failed to save search index:', error);
        }
    }

    async saveKnowledgeGraph() {
        try {
            const graphObj = Object.fromEntries(this.knowledgeGraph);
            await fs.writeFile(this.graphFile, JSON.stringify(graphObj, null, 2));
        } catch (error) {
            console.error('❌ Failed to save knowledge graph:', error);
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

            // Store in main memory
            this.memories[memoryId] = memory;
            await this.saveMemories();

            // Add to cache for fast retrieval
            this.cache.set(`memory:${memoryId}`, memory);

            // Build search index
            this.buildSearchIndex(memoryId, memory);
            await this.saveSearchIndex();

            // Build knowledge graph relationships
            if (params.metadata?.relatedTo || params.metadata?.tags) {
                this.updateKnowledgeGraph(memoryId, memory);
                await this.saveKnowledgeGraph();
                this.metrics.graphOperations++;
            }

            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);

            return {
                success: true,
                memoryId,
                message: 'Memory stored successfully with enhanced indexing',
                debug: {
                    requestId: `enh-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    contentLength: params.content.length,
                    agentId: params.agentId,
                    storageType: 'enhanced-multi-paradigm',
                    indexTerms: this.extractSearchTerms(params.content).length,
                    graphConnections: this.knowledgeGraph.get(memoryId)?.connections?.length || 0
                },
                performance: {
                    responseTime: `${responseTime}ms`,
                    requestId: `enh-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    serverType: 'enhanced-memory',
                    metrics: this.metrics,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Enhanced memory storage failed:', error);
            return {
                success: false,
                error: error.message,
                fallback: 'Enhanced storage failed, check logs'
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

            // Check cache first
            const cacheKey = `recall:${agentId}:${query}:${limit}`;
            if (this.cache.has(cacheKey)) {
                results = this.cache.get(cacheKey);
                this.metrics.cacheHitRate = (this.metrics.cacheHitRate + 1) / 2;
            } else {
                // Use enhanced semantic search
                if (query.length > 10) {
                    results = this.performSemanticSearch(query, agentId, limit);
                    this.metrics.semanticSearches++;
                } else {
                    // Use traditional keyword search
                    results = this.performKeywordSearch(query, agentId, limit);
                }

                // Cache results for 5 minutes
                this.cache.set(cacheKey, results);
                setTimeout(() => this.cache.delete(cacheKey), 300000);
            }

            // Sort by relevance and recency
            results.sort((a, b) => {
                const relevanceDiff = b.relevance - a.relevance;
                if (Math.abs(relevanceDiff) < 0.1) {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                }
                return relevanceDiff;
            });

            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);

            return {
                success: true,
                memories: results.slice(0, limit),
                count: results.length,
                message: 'Found memories using enhanced search algorithms',
                debug: {
                    requestId: `enh-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    queryLength: query.length,
                    searchLimit: limit,
                    cacheStatus: this.cache.has(cacheKey) ? 'hit' : 'miss',
                    agentId: params.agentId,
                    searchMethod: query.length > 10 ? 'semantic' : 'keyword',
                    indexHits: this.searchIndex.size
                },
                performance: {
                    responseTime: `${responseTime}ms`,
                    requestId: `enh-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    serverType: 'enhanced-memory',
                    metrics: this.metrics,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Enhanced memory recall failed:', error);
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
            const exists = this.memories[memoryId] !== undefined;

            if (exists) {
                // Remove from all storage systems
                delete this.memories[memoryId];
                await this.saveMemories();

                // Remove from cache
                this.cache.delete(`memory:${memoryId}`);

                // Remove from search index
                this.removeFromSearchIndex(memoryId);
                await this.saveSearchIndex();

                // Remove from knowledge graph
                this.removeFromKnowledgeGraph(memoryId);
                await this.saveKnowledgeGraph();
            }

            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);

            return {
                success: exists,
                message: exists ? 'Memory deleted from all enhanced storage systems' : 'Memory not found',
                debug: {
                    requestId: `enh-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    memoryId,
                    existed: exists,
                    systemsCleared: exists ? 4 : 0
                },
                performance: {
                    responseTime: `${responseTime}ms`,
                    serverType: 'enhanced-memory',
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Enhanced memory deletion failed:', error);
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

            // Get recent memories for the agent with enhanced filtering
            const agentMemories = Object.values(this.memories)
                .filter(memory => memory.agentId === agentId)
                .sort((a, b) => {
                    // Sort by importance and recency
                    const importanceDiff = b.importance - a.importance;
                    if (Math.abs(importanceDiff) < 0.1) {
                        return new Date(b.timestamp) - new Date(a.timestamp);
                    }
                    return importanceDiff;
                })
                .slice(0, contextSize);

            const context = agentMemories.map(memory => ({
                id: memory.id,
                content: memory.content,
                metadata: memory.metadata,
                timestamp: memory.timestamp,
                importance: memory.importance
            }));

            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);

            return {
                success: true,
                context,
                count: context.length,
                message: 'Context retrieved with enhanced relevance filtering',
                debug: {
                    requestId: `enh-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    agentId,
                    contextSize,
                    totalMemories: Object.keys(this.memories).length,
                    agentMemories: agentMemories.length
                },
                performance: {
                    responseTime: `${responseTime}ms`,
                    serverType: 'enhanced-memory',
                    metrics: this.metrics,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Enhanced context retrieval failed:', error);
            return {
                success: false,
                error: error.message,
                context: [],
                count: 0
            };
        }
    }

    // Enhanced search algorithms
    performSemanticSearch(query, agentId, limit) {
        const queryTerms = this.extractSearchTerms(query);
        const results = [];

        for (const [memoryId, memory] of Object.entries(this.memories)) {
            if (agentId !== 'all' && memory.agentId !== agentId) continue;

            const contentTerms = this.extractSearchTerms(memory.content);
            const relevance = this.calculateSemanticSimilarity(queryTerms, contentTerms);

            if (relevance > 0.1) {
                results.push({
                    id: memory.id,
                    content: memory.content,
                    relevance,
                    metadata: memory.metadata,
                    timestamp: memory.timestamp
                });
            }
        }

        return results;
    }

    performKeywordSearch(query, agentId, limit) {
        const results = [];
        const queryLower = query.toLowerCase();

        for (const [memoryId, memory] of Object.entries(this.memories)) {
            if (agentId !== 'all' && memory.agentId !== agentId) continue;

            let relevance = 0;
            const contentLower = memory.content.toLowerCase();

            // Exact phrase match
            if (contentLower.includes(queryLower)) {
                relevance += 0.8;
            }

            // Word matching
            const queryWords = queryLower.split(' ').filter(w => w.length > 2);
            for (const word of queryWords) {
                if (contentLower.includes(word)) {
                    relevance += 0.2;
                }
            }

            // Metadata matching
            const metadataStr = JSON.stringify(memory.metadata).toLowerCase();
            if (metadataStr.includes(queryLower)) {
                relevance += 0.3;
            }

            if (relevance > 0.1) {
                results.push({
                    id: memory.id,
                    content: memory.content,
                    relevance: Math.min(relevance, 1.0),
                    metadata: memory.metadata,
                    timestamp: memory.timestamp
                });
            }
        }

        return results;
    }

    extractSearchTerms(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(term => term.length > 2)
            .filter((term, index, array) => array.indexOf(term) === index);
    }

    calculateSemanticSimilarity(terms1, terms2) {
        const intersection = terms1.filter(term => terms2.includes(term));
        const union = [...new Set([...terms1, ...terms2])];

        if (union.length === 0) return 0;
        return intersection.length / union.length;
    }

    buildSearchIndex(memoryId, memory) {
        const terms = this.extractSearchTerms(memory.content);
        for (const term of terms) {
            if (!this.searchIndex.has(term)) {
                this.searchIndex.set(term, []);
            }
            this.searchIndex.get(term).push(memoryId);
        }
    }

    removeFromSearchIndex(memoryId) {
        for (const [term, memoryIds] of this.searchIndex) {
            const index = memoryIds.indexOf(memoryId);
            if (index !== -1) {
                memoryIds.splice(index, 1);
                if (memoryIds.length === 0) {
                    this.searchIndex.delete(term);
                }
            }
        }
    }

    updateKnowledgeGraph(memoryId, memory) {
        const node = {
            id: memoryId,
            type: memory.type,
            agentId: memory.agentId,
            importance: memory.importance,
            connections: []
        };

        // Create connections based on metadata
        if (memory.metadata?.relatedTo) {
            node.connections.push({
                target: memory.metadata.relatedTo,
                type: 'relatedTo',
                strength: 0.8
            });
        }

        if (memory.metadata?.tags) {
            for (const tag of memory.metadata.tags) {
                node.connections.push({
                    target: `tag:${tag}`,
                    type: 'hasTag',
                    strength: 0.6
                });
            }
        }

        this.knowledgeGraph.set(memoryId, node);
    }

    removeFromKnowledgeGraph(memoryId) {
        this.knowledgeGraph.delete(memoryId);

        // Remove incoming connections
        for (const [nodeId, node] of this.knowledgeGraph) {
            node.connections = node.connections.filter(conn => conn.target !== memoryId);
        }
    }

    updateMetrics(responseTime) {
        this.metrics.totalQueries++;
        this.metrics.avgResponseTime =
            ((this.metrics.avgResponseTime * (this.metrics.totalQueries - 1)) + responseTime) /
            this.metrics.totalQueries;
        this.metrics.cacheSize = Object.keys(this.memories).length;
    }
}

class EnhancedMCPServer {
    constructor() {
        this.memoryEngine = new EnhancedMemoryEngine();
        this.server = new Server(
            {
                name: 'memorai-enhanced-mcp',
                version: '1.5.0',
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
                    description: 'Store a memory with enhanced semantic indexing and graph relationships',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agentId: { type: 'string', description: 'Agent identifier' },
                            content: { type: 'string', description: 'Memory content to store' },
                            metadata: {
                                type: 'object',
                                description: 'Enhanced metadata (supports relatedTo, tags, priority)',
                                properties: {
                                    entityType: { type: 'string' },
                                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                                    relatedTo: { type: 'string' },
                                    tags: { type: 'array', items: { type: 'string' } }
                                }
                            }
                        },
                        required: ['agentId', 'content']
                    }
                },
                {
                    name: 'recall',
                    description: 'Search and retrieve memories using semantic search and knowledge graph',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agentId: { type: 'string', description: 'Agent identifier' },
                            query: { type: 'string', description: 'Search query (supports semantic and keyword search)' },
                            limit: { type: 'number', description: 'Maximum results' }
                        },
                        required: ['agentId', 'query']
                    }
                },
                {
                    name: 'forget',
                    description: 'Delete a specific memory from all enhanced storage systems',
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
                    description: 'Get recent context with enhanced relevance filtering',
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
                                serverType: 'enhanced-memory'
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
        console.error('🚀 Enhanced MemorAI MCP Server running with advanced features!');
        console.error('🎯 Features: Semantic Search, Knowledge Graph, Multi-Index Storage, Enhanced Caching');
    }
}

// Start the enhanced server
const server = new EnhancedMCPServer();
server.run().catch(console.error);
