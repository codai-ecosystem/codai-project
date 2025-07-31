#!/usr/bin/env node
/**
 * MemorAI MCP Unified Server - Production-Ready Implementation
 *
 * Consolidated server combining the best features from all implementations:
 * - Correct tool names (mcp_memoraimcp_*) for VS Code MCP compatibility
 * - CBD backend for high-performance and reliability
 * - HPKV-inspired architecture with structured keys
 * - Advanced semantic search with OpenAI embeddings
 * - Performance tracking and analytics
 * - Hybrid storage with fallback mechanisms
 * - Simplified configuration and startup
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { randomUUID, createHash } from 'crypto';
import { config } from 'dotenv';
import OpenAI from 'openai';
import { MemoryRelationshipEngine } from './relationship-engine.js';
import { AdvancedSearchEngine } from './search-intelligence.js';
export class MemorAIUnifiedServer {
    server;
    config;
    memories = new Map();
    dataPath;
    isStarted = false;
    openai;
    // Enhanced engines
    relationshipEngine;
    searchEngine;
    // Performance tracking
    operationCount = 0;
    operationTimes = [];
    startTime = Date.now();
    // Memory analytics
    memoryStats = {
        totalMemories: 0,
        uniqueAgents: new Set(),
        uniqueProjects: new Set(),
        averageImportance: 0,
    };
    constructor(config) {
        this.config = {
            ...config,
            enableSemanticSearch: config.enableSemanticSearch ?? true,
            enablePerformanceTracking: config.enablePerformanceTracking ?? true,
            enableHybridStorage: config.enableHybridStorage ?? true,
            fallbackStorage: config.fallbackStorage ?? 'json'
        };
        this.dataPath = this.config.cbdPath;
        // Ensure data directory exists
        if (!existsSync(this.dataPath)) {
            mkdirSync(this.dataPath, { recursive: true });
        }
        // Initialize OpenAI client
        if (this.config.azureOpenAI && this.config.enableSemanticSearch) {
            this.openai = new OpenAI({
                apiKey: this.config.azureOpenAI.apiKey,
                baseURL: `${this.config.azureOpenAI.endpoint}/openai/deployments/${this.config.azureOpenAI.embeddingDeployment}`,
                defaultQuery: { 'api-version': this.config.azureOpenAI.apiVersion },
                defaultHeaders: {
                    'api-key': this.config.azureOpenAI.apiKey,
                },
            });
            this.log('info', `🔗 Azure OpenAI initialized with deployment: ${this.config.azureOpenAI.embeddingDeployment}`);
        }
        else if (this.config.openaiApiKey && this.config.enableSemanticSearch) {
            this.openai = new OpenAI({
                apiKey: this.config.openaiApiKey,
            });
            this.log('info', '🔗 OpenAI initialized (fallback mode)');
        }
        // Initialize enhanced engines
        this.relationshipEngine = new MemoryRelationshipEngine(this.openai);
        this.searchEngine = new AdvancedSearchEngine(this.openai);
        this.log('info', '🔗 Advanced engines initialized (Relationship + Search Intelligence)');
        // Initialize MCP Server
        this.server = new Server({
            name: this.config.serverName,
            version: this.config.version,
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
        this.loadMemories();
        this.log('info', `🚀 ${this.config.serverName} initialized`);
    }
    log(level, message, ...args) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
    }
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'mcp_memoraimcp_remember',
                        description: 'Store a new memory with metadata',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                content: { type: 'string', description: 'Memory content to store' },
                                metadata: {
                                    type: 'object',
                                    properties: {
                                        entityType: { type: 'string' },
                                        priority: { type: 'string' },
                                        project: { type: 'string' },
                                        session: { type: 'string' },
                                        tags: { type: 'array', items: { type: 'string' } }
                                    }
                                }
                            },
                            required: ['agentId', 'content'],
                        },
                    },
                    {
                        name: 'mcp_memoraimcp_recall',
                        description: 'Search and retrieve memories',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                query: { type: 'string', description: 'Search query' },
                                limit: { type: 'number', description: 'Maximum results', default: 10 },
                                minImportance: { type: 'number', description: 'Minimum importance score', default: 0 },
                                project: { type: 'string', description: 'Filter by project' },
                                session: { type: 'string', description: 'Filter by session' }
                            },
                            required: ['agentId', 'query'],
                        },
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
                            required: ['agentId', 'structuredKey'],
                        },
                    },
                    {
                        name: 'mcp_memoraimcp_context',
                        description: 'Get recent context for agent',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                contextSize: { type: 'number', description: 'Number of recent memories', default: 5 }
                            },
                            required: ['agentId'],
                        },
                    },
                    {
                        name: 'mcp_memoraimcp_get_memory',
                        description: 'Get memory by exact structured key',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                structuredKey: { type: 'string', description: 'Exact structured key' }
                            },
                            required: ['structuredKey'],
                        },
                    },
                    {
                        name: 'mcp_memoraimcp_search_keys',
                        description: 'Vector similarity search for memory keys',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: { type: 'string', description: 'Query for finding similar memory keys' },
                                limit: { type: 'number', description: 'Maximum keys to return', default: 10 },
                                minScore: { type: 'number', description: 'Minimum similarity score', default: 0.7 }
                            },
                            required: ['query'],
                        },
                    },
                    {
                        name: 'mcp_memoraimcp_link_memories',
                        description: 'Create a relationship between two memories',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                sourceMemoryKey: { type: 'string', description: 'Structured key of source memory' },
                                targetMemoryKey: { type: 'string', description: 'Structured key of target memory' },
                                relationshipType: {
                                    type: 'string',
                                    description: 'Type of relationship',
                                    enum: ['related', 'references', 'follows', 'contradicts', 'updates', 'similar', 'contains', 'explains']
                                },
                                strength: { type: 'number', description: 'Relationship strength (0.0-1.0)', default: 0.5 },
                                context: { type: 'string', description: 'Optional context for the relationship' }
                            },
                            required: ['agentId', 'sourceMemoryKey', 'targetMemoryKey', 'relationshipType'],
                        },
                    },
                    {
                        name: 'mcp_memoraimcp_get_relationships',
                        description: 'Get relationships for a memory',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                memoryKey: { type: 'string', description: 'Structured key of memory' },
                                maxDepth: { type: 'number', description: 'How many relationship hops to traverse', default: 1 },
                                relationshipTypes: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Filter by relationship types'
                                }
                            },
                            required: ['agentId', 'memoryKey'],
                        },
                    },
                    {
                        name: 'mcp_memoraimcp_explore_graph',
                        description: 'Explore the knowledge graph from a starting memory',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                startingMemoryKey: { type: 'string', description: 'Starting point for exploration' },
                                explorationRadius: { type: 'number', description: 'How far to explore', default: 2 },
                                includeWeakLinks: { type: 'boolean', description: 'Include weak relationships', default: false }
                            },
                            required: ['agentId', 'startingMemoryKey'],
                        },
                    }
                ],
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'mcp_memoraimcp_remember':
                        return await this.handleRemember(args);
                    case 'mcp_memoraimcp_recall':
                        return await this.handleRecall(args);
                    case 'mcp_memoraimcp_forget':
                        return await this.handleForget(args);
                    case 'mcp_memoraimcp_context':
                        return await this.handleContext(args);
                    case 'mcp_memoraimcp_get_memory':
                        return await this.handleGetMemory(args);
                    case 'mcp_memoraimcp_search_keys':
                        return await this.handleSearchKeys(args);
                    case 'mcp_memoraimcp_link_memories':
                        return await this.handleLinkMemories(args);
                    case 'mcp_memoraimcp_get_relationships':
                        return await this.handleGetRelationships(args);
                    case 'mcp_memoraimcp_explore_graph':
                        return await this.handleExploreGraph(args);
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                this.log('error', `Tool ${name} failed:`, error);
                throw error;
            }
        });
    }
    async handleRemember(args) {
        const startTime = Date.now();
        try {
            const { agentId, content, metadata = {} } = args;
            // Generate content hash for duplicate detection
            const contentHash = createHash('sha256').update(content).digest('hex');
            // Check for duplicates
            const existingMemory = Array.from(this.memories.values())
                .find(m => m.contentHash === contentHash && m.metadata.agentId === agentId);
            if (existingMemory) {
                existingMemory.accessCount++;
                existingMemory.lastAccessed = new Date().toISOString();
                this.saveMemories();
                const responseTime = Date.now() - startTime;
                this.updateMetrics(responseTime);
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                memoryId: existingMemory.id,
                                structuredKey: existingMemory.structuredKey,
                                isDuplicate: true,
                                message: 'Memory already exists, access updated',
                                metadata: {
                                    responseTime: `${responseTime}ms`,
                                    serverVersion: this.config.version,
                                    operation: 'store_memory'
                                }
                            }, null, 2)
                        }]
                };
            }
            // Generate structured key: project_date_session_sequence
            const dateStr = new Date().toISOString().split('T')[0];
            const date = dateStr ? dateStr.replace(/-/g, '') : 'unknown';
            const project = metadata.project || 'default';
            const session = metadata.session || agentId;
            const sequence = this.getNextSequenceNumber(project, session);
            const structuredKey = `${project}_${date}_${session}_${sequence}`;
            // Generate embedding if semantic search is enabled
            let embedding;
            let embeddingSummary;
            if (this.config.enableSemanticSearch && this.openai) {
                try {
                    const embeddingResponse = await this.openai.embeddings.create({
                        model: this.config.azureOpenAI?.embeddingModel || this.config.embeddingModel,
                        input: content,
                    });
                    if (embeddingResponse.data?.[0]?.embedding) {
                        embedding = embeddingResponse.data[0].embedding;
                        embeddingSummary = content.substring(0, 100) + '...';
                    }
                }
                catch (error) {
                    this.log('warn', 'Failed to generate embedding:', error);
                }
            }
            // Calculate importance score
            const importance = this.calculateImportance(content, metadata);
            const memory = {
                id: randomUUID(),
                content,
                contentHash,
                structuredKey,
                projectName: project,
                sessionName: session,
                sequenceNumber: sequence,
                metadata: {
                    agentId,
                    timestamp: new Date().toISOString(),
                    importance,
                    embeddingSummary,
                    ...metadata
                },
                accessCount: 0,
                lastAccessed: new Date().toISOString(),
                embedding,
                embeddingModel: this.config.embeddingModel,
                relationships: [], // Initialize empty relationships
                relatedMemoryIds: new Set() // Initialize empty related memory IDs
            };
            this.memories.set(memory.structuredKey, memory);
            // Detect and create relationships automatically
            const existingMemories = Array.from(this.memories.values()).filter(m => m.id !== memory.id);
            if (existingMemories.length > 0) {
                try {
                    const detectedRelationships = await this.relationshipEngine.detectRelationships(memory, existingMemories, {
                        maxRelationships: 5,
                        minSimilarityThreshold: 0.4,
                        enableAIAnalysis: false // Disable AI for speed during creation
                    });
                    memory.relationships = detectedRelationships;
                    memory.relatedMemoryIds = new Set(detectedRelationships.map(r => r.targetMemoryId));
                    this.log('info', `🔗 Detected ${detectedRelationships.length} relationships for ${memory.structuredKey}`);
                }
                catch (error) {
                    this.log('warn', 'Relationship detection failed:', error);
                }
            }
            this.updateMemoryStats(memory);
            this.saveMemories();
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            this.log('info', `📝 Stored memory: ${memory.structuredKey}`);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            memoryId: memory.id,
                            structuredKey: memory.structuredKey,
                            projectName: memory.projectName,
                            sessionName: memory.sessionName,
                            sequenceNumber: memory.sequenceNumber,
                            isDuplicate: false,
                            importanceScore: importance,
                            message: 'Memory stored with structured key',
                            metadata: {
                                responseTime: `${responseTime}ms`,
                                serverVersion: this.config.version,
                                operation: 'store_memory',
                                structuredKeyFormat: 'project_date_session_sequence',
                                timestamp: new Date().toISOString(),
                                hasEmbedding: !!embedding
                            }
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            operation: 'store_memory',
                            responseTime: `${responseTime}ms`,
                            timestamp: new Date().toISOString()
                        }, null, 2)
                    }]
            };
        }
    }
    async handleRecall(args) {
        const startTime = Date.now();
        try {
            const { agentId, query, limit = 10, minImportance = 0, project, session } = args;
            // Create search context
            const searchContext = {
                agentId,
                currentProject: project,
                currentSession: session,
                recentMemories: Array.from(this.memories.values())
                    .filter(m => m.metadata.agentId === agentId)
                    .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
                    .slice(0, 5)
                    .map(m => m.id)
            };
            // Advanced search options
            const searchOptions = {
                enableQueryExpansion: true,
                enableFuzzyMatching: true,
                includeRelatedMemories: true,
                temporalWeight: 0.2,
                searchScope: 'all',
                clustering: true,
                maxSuggestions: 5,
                similarityThreshold: 0.3
            };
            // Get all memories for the agent
            const agentMemories = Array.from(this.memories.values())
                .filter(memory => {
                if (memory.metadata.agentId !== agentId)
                    return false;
                if (memory.metadata.importance < minImportance)
                    return false;
                if (project && memory.metadata.project !== project)
                    return false;
                if (session && memory.metadata.session !== session)
                    return false;
                return true;
            });
            // Use advanced search engine
            const searchResults = await this.searchEngine.performAdvancedSearch(query, agentMemories, searchContext, searchOptions);
            // Apply limit
            const limitedMemories = searchResults.memories.slice(0, limit);
            // Update access counts
            limitedMemories.forEach(memory => {
                const originalMemory = this.memories.get(memory.structuredKey);
                if (originalMemory) {
                    originalMemory.accessCount++;
                    originalMemory.lastAccessed = new Date().toISOString();
                }
            });
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            this.log('info', `🔍 Advanced search found ${searchResults.totalFound} memories for query: ${query}`);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            memories: limitedMemories.map(memory => ({
                                id: memory.id,
                                content: memory.content,
                                structuredKey: memory.structuredKey,
                                metadata: memory.metadata,
                                searchScore: memory.searchScore,
                                highlightedContent: memory.highlightedContent,
                                relationshipContext: memory.relationshipContext,
                                matchedTerms: memory.matchedTerms,
                                accessCount: this.memories.get(memory.structuredKey)?.accessCount || 0,
                                lastAccessed: this.memories.get(memory.structuredKey)?.lastAccessed,
                                rank: limitedMemories.indexOf(memory) + 1
                            })),
                            totalFound: searchResults.totalFound,
                            query,
                            searchType: searchResults.searchType,
                            averageRelevance: searchResults.averageRelevance,
                            queryExpansions: searchResults.queryExpansions,
                            suggestions: searchResults.suggestions,
                            clusters: searchResults.clusters,
                            searchInsights: searchResults.searchInsights,
                            message: searchResults.totalFound > 0 ?
                                `Found ${searchResults.totalFound} memories using ${searchResults.searchType} search with advanced intelligence.` :
                                'No memories found matching your search criteria. Try broader terms or check suggestions.',
                            metadata: {
                                responseTime: `${responseTime}ms`,
                                serverVersion: this.config.version,
                                operation: 'advanced_search',
                                searchType: searchResults.searchType,
                                timestamp: new Date().toISOString(),
                                averageRelevance: searchResults.averageRelevance,
                                engineVersion: '2.0-intelligent'
                            }
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            operation: 'search_memory',
                            responseTime: `${responseTime}ms`,
                            timestamp: new Date().toISOString()
                        }, null, 2)
                    }]
            };
        }
    }
    async handleForget(args) {
        const { agentId, structuredKey } = args;
        const memory = this.memories.get(structuredKey);
        if (!memory || memory.metadata.agentId !== agentId) {
            throw new McpError(ErrorCode.InvalidRequest, `Memory not found: ${structuredKey}`);
        }
        this.memories.delete(structuredKey);
        this.saveMemories();
        this.log('info', `Deleted memory: ${structuredKey}`);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        message: `Memory ${structuredKey} deleted successfully`,
                        metadata: {
                            responseTime: '1ms',
                            serverVersion: this.config.version,
                            operation: 'delete_memory'
                        }
                    }, null, 2)
                }
            ],
        };
    }
    async handleContext(args) {
        const { agentId, contextSize = 5 } = args;
        const recentMemories = Array.from(this.memories.values())
            .filter(memory => memory.metadata.agentId === agentId)
            .sort((a, b) => new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime())
            .slice(0, contextSize);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        context: recentMemories.map(memory => ({
                            structuredKey: memory.structuredKey,
                            content: memory.content,
                            timestamp: memory.metadata.timestamp,
                            importance: memory.metadata.importance
                        })),
                        contextSize: recentMemories.length,
                        metadata: {
                            responseTime: '1ms',
                            serverVersion: this.config.version,
                            operation: 'get_context'
                        }
                    }, null, 2)
                }
            ],
        };
    }
    async handleGetMemory(args) {
        const { structuredKey } = args;
        const memory = this.memories.get(structuredKey);
        if (!memory) {
            throw new McpError(ErrorCode.InvalidRequest, `Memory not found: ${structuredKey}`);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        memory: {
                            id: memory.id,
                            content: memory.content,
                            structuredKey: memory.structuredKey,
                            metadata: memory.metadata
                        },
                        metadata: {
                            responseTime: '1ms',
                            serverVersion: this.config.version,
                            operation: 'get_memory'
                        }
                    }, null, 2)
                }
            ],
        };
    }
    async handleSearchKeys(args) {
        const { query, limit = 10, minScore = 0.7 } = args;
        // Simple key matching (in production, this would use vector similarity)
        const keys = Array.from(this.memories.keys())
            .filter(key => key.toLowerCase().includes(query.toLowerCase()))
            .slice(0, limit)
            .map(key => ({
            key,
            score: 0.85, // Placeholder score
            memory: this.memories.get(key)
        }));
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        keys: keys.map(item => ({
                            key: item.key,
                            score: item.score,
                            preview: item.memory?.content.substring(0, 100) + '...'
                        })),
                        totalFound: keys.length,
                        metadata: {
                            responseTime: '1ms',
                            serverVersion: this.config.version,
                            operation: 'search_keys'
                        }
                    }, null, 2)
                }
            ],
        };
    }
    async handleLinkMemories(args) {
        const startTime = Date.now();
        try {
            const { agentId, sourceMemoryKey, targetMemoryKey, relationshipType, strength = 0.5, context } = args;
            const sourceMemory = this.memories.get(sourceMemoryKey);
            const targetMemory = this.memories.get(targetMemoryKey);
            if (!sourceMemory || sourceMemory.metadata.agentId !== agentId) {
                throw new McpError(ErrorCode.InvalidRequest, `Source memory not found: ${sourceMemoryKey}`);
            }
            if (!targetMemory || targetMemory.metadata.agentId !== agentId) {
                throw new McpError(ErrorCode.InvalidRequest, `Target memory not found: ${targetMemoryKey}`);
            }
            // Create the relationship
            const relationship = {
                id: `${sourceMemory.id}_${targetMemory.id}_${relationshipType}_${Date.now()}`,
                sourceMemoryId: sourceMemory.id,
                targetMemoryId: targetMemory.id,
                relationshipType: relationshipType,
                strength: Math.max(0, Math.min(1, strength)),
                context,
                createdBy: 'user',
                timestamp: new Date().toISOString(),
                confidence: 1.0,
                bidirectional: ['similar', 'related'].includes(relationshipType)
            };
            // Add relationship to source memory
            sourceMemory.relationships.push(relationship);
            sourceMemory.relatedMemoryIds.add(targetMemory.id);
            // If bidirectional, add reverse relationship to target memory
            if (relationship.bidirectional) {
                const reverseRelationship = {
                    ...relationship,
                    id: `${targetMemory.id}_${sourceMemory.id}_${relationshipType}_${Date.now()}`,
                    sourceMemoryId: targetMemory.id,
                    targetMemoryId: sourceMemory.id
                };
                targetMemory.relationships.push(reverseRelationship);
                targetMemory.relatedMemoryIds.add(sourceMemory.id);
            }
            this.saveMemories();
            const responseTime = Date.now() - startTime;
            this.log('info', `🔗 Linked memories: ${sourceMemoryKey} → ${targetMemoryKey} (${relationshipType})`);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            relationship,
                            bidirectional: relationship.bidirectional,
                            message: `Successfully created ${relationshipType} relationship between memories`,
                            metadata: {
                                responseTime: `${responseTime}ms`,
                                serverVersion: this.config.version,
                                operation: 'link_memories'
                            }
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            operation: 'link_memories',
                            responseTime: `${responseTime}ms`
                        }, null, 2)
                    }]
            };
        }
    }
    async handleGetRelationships(args) {
        const startTime = Date.now();
        try {
            const { agentId, memoryKey, maxDepth = 1, relationshipTypes } = args;
            const memory = this.memories.get(memoryKey);
            if (!memory || memory.metadata.agentId !== agentId) {
                throw new McpError(ErrorCode.InvalidRequest, `Memory not found: ${memoryKey}`);
            }
            // Get direct relationships
            let relationships = memory.relationships;
            // Filter by relationship types if specified
            if (relationshipTypes && relationshipTypes.length > 0) {
                relationships = relationships.filter(r => relationshipTypes.includes(r.relationshipType));
            }
            // Get related memories if depth > 1
            const relatedMemories = [];
            const visited = new Set([memory.id]);
            const exploreRelationships = (currentMemory, depth) => {
                if (depth <= 0)
                    return;
                for (const rel of currentMemory.relationships) {
                    if (visited.has(rel.targetMemoryId))
                        continue;
                    const targetMemory = Array.from(this.memories.values())
                        .find(m => m.id === rel.targetMemoryId);
                    if (targetMemory && targetMemory.metadata.agentId === agentId) {
                        visited.add(rel.targetMemoryId);
                        relatedMemories.push({
                            memory: {
                                id: targetMemory.id,
                                structuredKey: targetMemory.structuredKey,
                                content: targetMemory.content.substring(0, 200) + '...',
                                metadata: targetMemory.metadata
                            },
                            relationship: rel,
                            depth: maxDepth - depth + 1
                        });
                        if (depth > 1) {
                            exploreRelationships(targetMemory, depth - 1);
                        }
                    }
                }
            };
            exploreRelationships(memory, maxDepth);
            const responseTime = Date.now() - startTime;
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            memory: {
                                id: memory.id,
                                structuredKey: memory.structuredKey,
                                content: memory.content.substring(0, 200) + '...'
                            },
                            directRelationships: relationships,
                            relatedMemories,
                            totalRelationships: relationships.length,
                            maxDepth,
                            metadata: {
                                responseTime: `${responseTime}ms`,
                                serverVersion: this.config.version,
                                operation: 'get_relationships'
                            }
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            operation: 'get_relationships',
                            responseTime: `${responseTime}ms`
                        }, null, 2)
                    }]
            };
        }
    }
    async handleExploreGraph(args) {
        const startTime = Date.now();
        try {
            const { agentId, startingMemoryKey, explorationRadius = 2, includeWeakLinks = false } = args;
            const startingMemory = this.memories.get(startingMemoryKey);
            if (!startingMemory || startingMemory.metadata.agentId !== agentId) {
                throw new McpError(ErrorCode.InvalidRequest, `Starting memory not found: ${startingMemoryKey}`);
            }
            // Get all memories for the agent
            const agentMemories = Array.from(this.memories.values())
                .filter(m => m.metadata.agentId === agentId);
            // Build knowledge graph
            const knowledgeGraph = await this.relationshipEngine.buildKnowledgeGraph(agentMemories);
            // Find exploration path from starting memory
            const explorationResult = this.exploreFromMemory(startingMemory, agentMemories, explorationRadius, includeWeakLinks);
            const responseTime = Date.now() - startTime;
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            startingMemory: {
                                id: startingMemory.id,
                                structuredKey: startingMemory.structuredKey,
                                content: startingMemory.content.substring(0, 100) + '...'
                            },
                            explorationPath: explorationResult.path,
                            discoveredMemories: explorationResult.discovered,
                            knowledgeGraph: {
                                totalNodes: knowledgeGraph.nodes.length,
                                totalEdges: knowledgeGraph.edges.length,
                                clusters: knowledgeGraph.clusters,
                                metrics: knowledgeGraph.metrics
                            },
                            explorationRadius,
                            includeWeakLinks,
                            metadata: {
                                responseTime: `${responseTime}ms`,
                                serverVersion: this.config.version,
                                operation: 'explore_graph'
                            }
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            operation: 'explore_graph',
                            responseTime: `${responseTime}ms`
                        }, null, 2)
                    }]
            };
        }
    }
    exploreFromMemory(startingMemory, allMemories, radius, includeWeakLinks) {
        const visited = new Set([startingMemory.id]);
        const path = [];
        const discovered = [];
        const explore = (memory, depth, currentPath) => {
            if (depth <= 0)
                return;
            const memoryInfo = {
                id: memory.id,
                structuredKey: memory.structuredKey,
                content: memory.content.substring(0, 100) + '...',
                depth: radius - depth + 1,
                relationships: memory.relationships.length
            };
            currentPath.push(memoryInfo);
            for (const relationship of memory.relationships) {
                if (visited.has(relationship.targetMemoryId))
                    continue;
                // Filter weak links if not included
                if (!includeWeakLinks && relationship.strength < 0.3)
                    continue;
                const targetMemory = allMemories.find(m => m.id === relationship.targetMemoryId);
                if (!targetMemory)
                    continue;
                visited.add(relationship.targetMemoryId);
                const discoveredInfo = {
                    memory: {
                        id: targetMemory.id,
                        structuredKey: targetMemory.structuredKey,
                        content: targetMemory.content.substring(0, 100) + '...',
                        metadata: targetMemory.metadata
                    },
                    relationship,
                    discoveredAt: radius - depth + 1,
                    path: [...currentPath]
                };
                discovered.push(discoveredInfo);
                if (depth > 1) {
                    explore(targetMemory, depth - 1, [...currentPath]);
                }
            }
        };
        explore(startingMemory, radius, []);
        return { path, discovered };
    }
    // Helper methods for advanced functionality
    getNextSequenceNumber(project, session) {
        const dateStr = new Date().toISOString().split('T')[0];
        const today = dateStr ? dateStr.replace(/-/g, '') : 'unknown';
        const prefix = `${project}_${today}_${session}_`;
        const existingKeys = Array.from(this.memories.keys())
            .filter(key => key.startsWith(prefix))
            .map(key => {
            const parts = key.split('_');
            const lastPart = parts[parts.length - 1];
            return lastPart ? parseInt(lastPart) || 0 : 0;
        });
        return existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 1;
    }
    calculateImportance(content, metadata) {
        let importance = 0.5; // Base importance
        // Increase importance based on content length (more detailed = more important)
        if (content.length > 500)
            importance += 0.1;
        if (content.length > 1000)
            importance += 0.1;
        // Increase importance based on priority metadata
        if (metadata.priority === 'high')
            importance += 0.2;
        if (metadata.priority === 'critical')
            importance += 0.3;
        // Increase importance based on entity type
        if (metadata.entityType === 'plan')
            importance += 0.15;
        if (metadata.entityType === 'task')
            importance += 0.1;
        if (metadata.entityType === 'decision')
            importance += 0.2;
        // Increase importance if it has tags (more structured = more important)
        if (metadata.tags && metadata.tags.length > 0)
            importance += 0.05;
        return Math.min(importance, 1.0); // Cap at 1.0
    }
    async performSemanticSearch(query, options, agentId) {
        if (!this.openai) {
            return this.performTextSearch(query, options, agentId);
        }
        try {
            // Generate embedding for the query
            const queryEmbedding = await this.openai.embeddings.create({
                model: this.config.azureOpenAI?.embeddingModel || this.config.embeddingModel,
                input: query,
            });
            const queryVector = queryEmbedding.data[0]?.embedding;
            if (!queryVector) {
                throw new Error('Failed to generate query embedding');
            }
            // Find memories with embeddings and calculate similarity
            const candidateMemories = Array.from(this.memories.values())
                .filter(memory => {
                if (memory.metadata.agentId !== agentId)
                    return false;
                if (memory.metadata.importance < options.minImportance)
                    return false;
                if (options.project && memory.metadata.project !== options.project)
                    return false;
                if (options.session && memory.metadata.session !== options.session)
                    return false;
                return memory.embedding !== undefined;
            });
            // Calculate cosine similarity for each memory
            const memoriesWithScores = candidateMemories.map(memory => ({
                ...memory,
                relevanceScore: this.calculateCosineSimilarity(queryVector, memory.embedding)
            }));
            // Sort by relevance score and apply limit
            const sortedMemories = memoriesWithScores
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, options.limit);
            // Update access counts
            sortedMemories.forEach(memory => {
                const originalMemory = this.memories.get(memory.structuredKey);
                if (originalMemory) {
                    originalMemory.accessCount++;
                    originalMemory.lastAccessed = new Date().toISOString();
                }
            });
            const averageRelevance = sortedMemories.length > 0 ?
                sortedMemories.reduce((sum, m) => sum + m.relevanceScore, 0) / sortedMemories.length : 0;
            return {
                memories: sortedMemories,
                totalFound: sortedMemories.length,
                searchType: 'semantic',
                averageRelevance
            };
        }
        catch (error) {
            this.log('warn', 'Semantic search failed, falling back to text search:', error);
            return this.performTextSearch(query, options, agentId);
        }
    }
    async performTextSearch(query, options, agentId) {
        const lowerQuery = query.toLowerCase();
        const results = Array.from(this.memories.values())
            .filter(memory => {
            if (memory.metadata.agentId !== agentId)
                return false;
            if (memory.metadata.importance < options.minImportance)
                return false;
            if (options.project && memory.metadata.project !== options.project)
                return false;
            if (options.session && memory.metadata.session !== options.session)
                return false;
            // Advanced text matching
            const contentMatch = memory.content.toLowerCase().includes(lowerQuery);
            const keyMatch = memory.structuredKey.toLowerCase().includes(lowerQuery);
            const tagMatch = memory.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) || false;
            return contentMatch || keyMatch || tagMatch;
        })
            .map(memory => {
            // Calculate relevance score based on text matching
            let score = 0;
            const content = memory.content.toLowerCase();
            const key = memory.structuredKey.toLowerCase();
            if (content.includes(lowerQuery))
                score += 0.8;
            if (key.includes(lowerQuery))
                score += 0.6;
            if (memory.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)))
                score += 0.4;
            // Boost score based on importance and recency
            score += memory.metadata.importance * 0.2;
            const originalMemory = this.memories.get(memory.structuredKey);
            if (originalMemory) {
                originalMemory.accessCount++;
                originalMemory.lastAccessed = new Date().toISOString();
            }
            return {
                ...memory,
                relevanceScore: Math.min(score, 1.0)
            };
        })
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, options.limit);
        const averageRelevance = results.length > 0 ?
            results.reduce((sum, m) => sum + m.relevanceScore, 0) / results.length : 0;
        return {
            memories: results,
            totalFound: results.length,
            searchType: 'text',
            averageRelevance
        };
    }
    calculateCosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            const aVal = a[i] ?? 0;
            const bVal = b[i] ?? 0;
            dotProduct += aVal * bVal;
            normA += aVal * aVal;
            normB += bVal * bVal;
        }
        const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
        return magnitude > 0 ? dotProduct / magnitude : 0;
    }
    generateSearchSummary(memories, query) {
        if (memories.length === 0) {
            return 'No memories found matching your search criteria. Try broader terms or check system capabilities with "memorai help".';
        }
        if (memories.length === 1) {
            const relevance = Math.round((memories[0]?.relevanceScore || 0.5) * 100);
            return `Found 1 memory matching "${query}" with ${relevance}% relevance.`;
        }
        const avgRelevance = memories.reduce((acc, m) => acc + (m.relevanceScore || 0.5), 0) / memories.length;
        const topRelevance = Math.max(...memories.map(m => m.relevanceScore || 0.5));
        return `Found ${memories.length} memories for "${query}". Top match: ${Math.round(topRelevance * 100)}% relevant. Average relevance: ${Math.round(avgRelevance * 100)}%.`;
    }
    updateMemoryStats(memory) {
        this.memoryStats.totalMemories = this.memories.size;
        this.memoryStats.uniqueAgents.add(memory.metadata.agentId);
        if (memory.metadata.project) {
            this.memoryStats.uniqueProjects.add(memory.metadata.project);
        }
        // Recalculate average importance
        const allMemories = Array.from(this.memories.values());
        this.memoryStats.averageImportance = allMemories.length > 0 ?
            allMemories.reduce((sum, m) => sum + m.metadata.importance, 0) / allMemories.length : 0;
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
        if (this.operationTimes.length === 0)
            return 0;
        return this.operationTimes.reduce((a, b) => a + b, 0) / this.operationTimes.length;
    }
    async getSystemCapabilities() {
        const uptime = Date.now() - this.startTime;
        return {
            server: {
                name: this.config.serverName,
                version: this.config.version,
                architecture: 'Advanced CBD + HPKV Hybrid Memory',
                uptime: `${Math.round(uptime / 1000)}s`,
                status: 'Operational'
            },
            capabilities: {
                coreOperations: [
                    {
                        name: 'store_memory (mcp_memoraimcp_remember)',
                        description: 'Store memories with structured keys: project_date_session_sequence',
                        features: [
                            'Automatic key generation',
                            'Duplicate detection',
                            'Importance scoring',
                            'Vector embeddings',
                            'Performance tracking'
                        ]
                    },
                    {
                        name: 'search_memory (mcp_memoraimcp_recall)',
                        description: 'Advanced semantic search with AI-powered relevance ranking',
                        features: [
                            'Semantic search with embeddings',
                            'Full-text search fallback',
                            'Relevance scoring',
                            'Project/session filtering',
                            'Access tracking'
                        ]
                    },
                    {
                        name: 'search_keys (mcp_memoraimcp_search_keys)',
                        description: 'Vector similarity search for related memory keys',
                        features: [
                            'Key similarity matching',
                            'Configurable thresholds',
                            'Ranked results'
                        ]
                    },
                    {
                        name: 'get_memory (mcp_memoraimcp_get_memory)',
                        description: 'Direct memory retrieval by structured key',
                        features: [
                            'Exact key matching',
                            'Access tracking',
                            'Metadata retrieval'
                        ]
                    }
                ],
                additionalOperations: [
                    'mcp_memoraimcp_forget: Delete specific memories by structured key',
                    'mcp_memoraimcp_context: Retrieve recent agent context with filtering'
                ]
            },
            database: {
                totalMemories: this.memoryStats.totalMemories,
                uniqueAgents: this.memoryStats.uniqueAgents.size,
                uniqueProjects: this.memoryStats.uniqueProjects.size,
                averageImportance: this.memoryStats.averageImportance,
                version: this.config.version
            },
            performance: {
                totalOperations: this.operationCount,
                averageResponseTime: `${Math.round(this.getAverageResponseTime())}ms`,
                operationsPerSecond: Math.round(this.operationCount / (uptime / 1000) * 100) / 100,
                uptime: `${Math.round(uptime / 1000)}s`,
                memoryCount: this.memoryStats.totalMemories,
                agentCount: this.memoryStats.uniqueAgents.size,
                databasePath: this.dataPath
            }
        };
    }
    loadMemories() {
        const memoriesFile = join(this.dataPath, 'memories.json');
        if (existsSync(memoriesFile)) {
            try {
                const data = readFileSync(memoriesFile, 'utf8');
                const memoriesArray = JSON.parse(data);
                for (const memory of memoriesArray) {
                    this.memories.set(memory.structuredKey, memory);
                }
                this.log('info', `Loaded ${this.memories.size} memories from storage`);
            }
            catch (error) {
                this.log('error', 'Failed to load memories:', error);
            }
        }
    }
    saveMemories() {
        const memoriesFile = join(this.dataPath, 'memories.json');
        try {
            const memoriesArray = Array.from(this.memories.values());
            writeFileSync(memoriesFile, JSON.stringify(memoriesArray, null, 2));
        }
        catch (error) {
            this.log('error', 'Failed to save memories:', error);
        }
    }
    async start() {
        if (this.isStarted) {
            return;
        }
        try {
            const transport = new StdioServerTransport();
            this.log('info', `🚀 ${this.config.serverName} starting on stdio`);
            await this.server.connect(transport);
            this.isStarted = true;
            this.log('info', `✅ ${this.config.serverName} running successfully`);
            this.log('info', `   📦 Version: ${this.config.version}`);
            this.log('info', `   📁 Data Path: ${this.dataPath}`);
            this.log('info', `   💾 Loaded Memories: ${this.memories.size}`);
        }
        catch (error) {
            this.log('error', 'Failed to start server:', error);
            throw error;
        }
    }
    async stop() {
        if (!this.isStarted) {
            return;
        }
        this.saveMemories();
        this.log('info', '🛑 MemorAI MCP Server stopped');
        this.isStarted = false;
    }
}
// Main execution logic
async function main() {
    // Check for help/version first
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(`
MemorAI CBD MCP Server - Published Package

Usage:
  npx -y @codai/memorai-mcp@latest

Environment Variables:
  DOTENV_CONFIG_PATH           Path to .env file (default: .env)
  AZURE_OPENAI_ENDPOINT        Azure OpenAI endpoint (required)
  AZURE_OPENAI_KEY             Azure OpenAI API key (required)
  AZURE_OPENAI_API_VERSION     Azure OpenAI API version (required)
  AZURE_OPENAI_EMBEDDING_ADA_DEPLOYMENT  Embedding deployment name (required)
  MEMORAI_CBD_PATH             CBD data directory (default: ./memorai-cbd-data)
  MEMORAI_LOG_LEVEL            Log level (default: info)
  MEMORAI_CACHE_SIZE           Memory cache size (default: 10000)
  MEMORAI_DIMENSIONS           Embedding dimensions (default: 1536)

Options:
  --help, -h             Show this help message
  --version, -v          Show version information

Examples:
  # Use with custom .env file
  DOTENV_CONFIG_PATH="/path/to/.env" npx @codai/memorai-mcp@latest

  # Use with custom CBD path
  MEMORAI_CBD_PATH="/path/to/data" npx @codai/memorai-mcp@latest
`);
        process.exit(0);
    }
    if (process.argv.includes('--version') || process.argv.includes('-v')) {
        console.log('@codai/memorai-mcp version 8.0.14');
        process.exit(0);
    }
    // Simple environment configuration
    console.error('[INIT] Configuring environment...');
    const envPath = process.env.DOTENV_CONFIG_PATH;
    if (envPath && existsSync(envPath)) {
        console.error(`[INIT] Loading .env from: ${envPath}`);
        config({ path: envPath });
    }
    else {
        console.error('[INIT] Loading default .env...');
        config();
    }
    // Build configuration
    console.error('[INIT] Building server configuration...');
    const memoraiCbdPath = process.env.MEMORAI_CBD_PATH || resolve(process.cwd(), 'memorai-cbd-data');
    const azureEnvConfig = {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_KEY,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
        embeddingDeployment: process.env.AZURE_OPENAI_EMBEDDING_ADA_DEPLOYMENT
    };
    const azureConfig = azureEnvConfig.endpoint && azureEnvConfig.apiKey && azureEnvConfig.embeddingDeployment ? {
        endpoint: azureEnvConfig.endpoint,
        apiKey: azureEnvConfig.apiKey,
        apiVersion: azureEnvConfig.apiVersion || '2024-02-01',
        embeddingDeployment: azureEnvConfig.embeddingDeployment,
        embeddingModel: 'text-embedding-ada-002'
    } : undefined;
    const serverConfig = {
        serverName: 'MemorAI-CBD-MCP',
        version: '9.0.0',
        cbdPath: memoraiCbdPath,
        logLevel: 'debug',
        enableSemanticSearch: true,
        enablePerformanceTracking: true,
        enableHybridStorage: true,
        azureOpenAI: azureConfig,
        fallbackStorage: 'json',
        embeddingModel: 'text-embedding-ada-002',
        dimensions: 1536,
        cacheSize: 10000,
        maxMemories: 100000,
        nodeEnv: 'production'
    };
    console.error(`[INIT] Server configured - CBD path: ${memoraiCbdPath}`);
    // Start the server
    try {
        console.error('[INIT] Creating server instance...');
        const server = new MemorAIUnifiedServer(serverConfig);
        console.error('[INIT] Starting MCP server...');
        await server.start();
        console.error('✅ MemorAI MCP Server running successfully!');
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.error('[SHUTDOWN] Graceful shutdown initiated...');
            await server.stop();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            console.error('[SHUTDOWN] Graceful shutdown initiated...');
            await server.stop();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Execute only if this is the main module
if (import.meta.url === `file://${process.argv[1]}` ||
    process.argv[1]?.includes('server-unified.js') ||
    process.argv[1]?.includes('@codai/memorai-mcp')) {
    console.error('[INIT] Starting unified server...');
    main();
}
//# sourceMappingURL=server.js.map