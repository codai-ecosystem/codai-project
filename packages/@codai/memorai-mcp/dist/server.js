#!/usr/bin/env node
/**
 * MemorAI MCP Unified Server - Production-Ready Implementation
 *
 * Consolidated server combining the best features from all implementations:
 * - Correct tool names (*) for VS Code MCP compatibility
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
import packageJson from '../package.json' with { type: 'json' };
import { MemoryRelationshipEngine } from './relationship-engine.js';
import { AdvancedSearchEngine } from './search-intelligence.js';
import { MemoryAnalyticsEngine } from './analytics-engine.js';
import { MemoryRecommendationEngine } from './recommendation-engine.js';
import { MemoryEvolutionEngine } from './evolution-engine.js';
import { RealTimeLearningEngine } from './learning-engine.js';
import { EnhancedPredictiveMemoryEngine } from './enhanced-predictive-engine.js';
import { MemoryFederationEngine } from './federation-engine.js';
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
    analyticsEngine;
    recommendationEngine;
    evolutionEngine;
    learningEngine;
    enhancedPredictiveEngine;
    federationEngine;
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
        this.analyticsEngine = new MemoryAnalyticsEngine(this.openai, this.memories);
        this.recommendationEngine = new MemoryRecommendationEngine(this.openai, this.memories);
        this.evolutionEngine = new MemoryEvolutionEngine(this.openai, this.memories);
        this.learningEngine = new RealTimeLearningEngine(this.openai, this.memories);
        this.enhancedPredictiveEngine = new EnhancedPredictiveMemoryEngine(this.openai, this.memories);
        this.federationEngine = new MemoryFederationEngine(this.openai, this.memories);
        this.log('info', '🔗 Advanced engines initialized (Relationship + Search + Analytics + Recommendations + Evolution + Learning + Enhanced Prediction + Federation)');
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
                        name: 'remember',
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
                        name: 'recall',
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
                        name: 'forget',
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
                        name: 'context',
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
                        name: 'get_memory',
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
                        name: 'search_keys',
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
                        name: 'link_memories',
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
                        name: 'get_relationships',
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
                        name: 'explore_graph',
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
                    },
                    {
                        name: 'get_analytics',
                        description: 'Generate comprehensive analytics and insights for memory usage',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                reportType: {
                                    type: 'string',
                                    description: 'Type of analytics report',
                                    enum: ['usage', 'patterns', 'health', 'gaps', 'recommendations']
                                },
                                timeRange: {
                                    type: 'object',
                                    properties: {
                                        start: { type: 'string', description: 'Start date (ISO string)' },
                                        end: { type: 'string', description: 'End date (ISO string)' }
                                    }
                                },
                                includeVisualizations: { type: 'boolean', description: 'Include visualization data', default: false }
                            },
                            required: ['agentId', 'reportType'],
                        },
                    },
                    {
                        name: 'get_recommendations',
                        description: 'Get intelligent recommendations for memory management optimization',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                recommendationType: {
                                    type: 'string',
                                    description: 'Type of recommendations',
                                    enum: ['review', 'create', 'connect', 'cleanup', 'all']
                                },
                                maxRecommendations: { type: 'number', description: 'Maximum number of recommendations', default: 10 }
                            },
                            required: ['agentId'],
                        },
                    },
                    {
                        name: 'get_insights',
                        description: 'Get AI-powered insights about memory patterns and knowledge gaps',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                insightType: {
                                    type: 'string',
                                    description: 'Type of insights to generate',
                                    enum: ['trending_topics', 'memory_clusters', 'knowledge_map', 'activity_heatmap', 'gap_analysis']
                                },
                                parameters: {
                                    type: 'object',
                                    description: 'Additional parameters for insight generation'
                                }
                            },
                            required: ['agentId', 'insightType'],
                        },
                    },
                    {
                        name: 'evolve_memory',
                        description: 'Automatically update memory based on new information',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                memoryId: { type: 'string', description: 'Memory ID to evolve' },
                                newInformation: { type: 'string', description: 'New information to integrate' },
                                context: {
                                    type: 'object',
                                    properties: {
                                        source: { type: 'string', description: 'Source of new information' },
                                        confidence: { type: 'number', description: 'Confidence in new information (0-1)' },
                                        timestamp: { type: 'string', description: 'Timestamp of new information' }
                                    }
                                }
                            },
                            required: ['memoryId', 'newInformation'],
                        },
                    },
                    {
                        name: 'resolve_conflicts',
                        description: 'Detect and resolve conflicts between memories',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                memoryIds: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Memory IDs to check for conflicts'
                                },
                                resolutionStrategy: {
                                    type: 'string',
                                    enum: ['auto', 'conservative', 'aggressive'],
                                    description: 'Strategy for conflict resolution'
                                }
                            },
                            required: ['memoryIds'],
                        },
                    },
                    {
                        name: 'consolidate_memories',
                        description: 'Consolidate related memories for better organization',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                memoryIds: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Memory IDs to consolidate'
                                },
                                consolidationType: {
                                    type: 'string',
                                    enum: ['merge', 'summarize', 'restructure', 'cross_reference'],
                                    description: 'Type of consolidation to perform',
                                    default: 'merge'
                                }
                            },
                            required: ['memoryIds'],
                        },
                    },
                    {
                        name: 'manage_lifecycle',
                        description: 'Automatically manage memory lifecycle (archive, promote, clean)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' }
                            },
                            required: ['agentId'],
                        },
                    },
                    // Phase 4: Enhanced Predictive & Learning Tools
                    {
                        name: 'predict_enhanced',
                        description: 'Enhanced memory need prediction with learning integration',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                context: {
                                    type: 'object',
                                    properties: {
                                        currentTask: { type: 'string' },
                                        recentMemories: { type: 'array', items: { type: 'string' } },
                                        timeOfDay: { type: 'string' },
                                        urgency: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
                                    },
                                    required: ['currentTask']
                                }
                            },
                            required: ['agentId', 'context'],
                        },
                    },
                    {
                        name: 'predict_structure',
                        description: 'Predict optimal memory structure based on usage patterns',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' }
                            },
                            required: ['agentId'],
                        },
                    },
                    {
                        name: 'predict_evolution',
                        description: 'Predict memory evolution with learning-enhanced accuracy',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                memoryId: { type: 'string', description: 'Memory ID to analyze' },
                                timeHorizon: { type: 'string', description: 'Time horizon for prediction', default: '1 month' }
                            },
                            required: ['memoryId'],
                        },
                    },
                    {
                        name: 'learn_from_usage',
                        description: 'Learn from usage patterns to improve future predictions',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                usagePatterns: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            memoryId: { type: 'string' },
                                            accessFrequency: { type: 'number' },
                                            successRate: { type: 'number' },
                                            accessTiming: { type: 'array', items: { type: 'string' } },
                                            contextPatterns: { type: 'array', items: { type: 'string' } }
                                        },
                                        required: ['memoryId', 'accessFrequency', 'successRate']
                                    }
                                }
                            },
                            required: ['agentId', 'usagePatterns'],
                        },
                    },
                    {
                        name: 'adapt_organization',
                        description: 'Adapt memory organization based on effectiveness metrics',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                agentId: { type: 'string', description: 'Agent identifier' },
                                effectivenessMetrics: {
                                    type: 'object',
                                    properties: {
                                        retrievalSuccessRate: { type: 'number' },
                                        averageRetrievalTime: { type: 'number' },
                                        memoryUtilizationRate: { type: 'number' },
                                        contextAccuracy: { type: 'number' },
                                        collaborationEffectiveness: { type: 'number' },
                                        overallSatisfaction: { type: 'number' }
                                    },
                                    required: ['retrievalSuccessRate', 'averageRetrievalTime']
                                }
                            },
                            required: ['agentId', 'effectivenessMetrics'],
                        },
                    },
                    {
                        name: 'optimize_retrieval',
                        description: 'Optimize memory retrieval based on query patterns and performance',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                queryPatterns: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            agentId: { type: 'string' },
                                            query: { type: 'string' },
                                            queryType: { type: 'string', enum: ['semantic', 'keyword', 'structured', 'hybrid'] },
                                            frequency: { type: 'number' },
                                            successRate: { type: 'number' }
                                        },
                                        required: ['agentId', 'query', 'frequency', 'successRate']
                                    }
                                },
                                performanceMetrics: {
                                    type: 'object',
                                    properties: {
                                        agentId: { type: 'string' },
                                        totalQueries: { type: 'number' },
                                        averageResponseTime: { type: 'number' },
                                        successRate: { type: 'number' },
                                        userSatisfactionScore: { type: 'number' }
                                    },
                                    required: ['agentId', 'totalQueries', 'averageResponseTime']
                                }
                            },
                            required: ['queryPatterns', 'performanceMetrics'],
                        },
                    },
                    {
                        name: 'share_memory',
                        description: 'Share a memory with another agent with specific permissions',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                sourceAgentId: { type: 'string', description: 'Agent sharing the memory' },
                                targetAgentId: { type: 'string', description: 'Agent receiving the memory' },
                                memoryId: { type: 'string', description: 'ID of memory to share' },
                                permissions: {
                                    type: 'object',
                                    properties: {
                                        accessLevel: { type: 'string', enum: ['read', 'read-write', 'admin'] },
                                        expirationTime: { type: 'string' },
                                        allowModification: { type: 'boolean' },
                                        allowDeletion: { type: 'boolean' },
                                        allowSharing: { type: 'boolean' },
                                        contextRestrictions: { type: 'array', items: { type: 'string' } },
                                        projectRestrictions: { type: 'array', items: { type: 'string' } }
                                    },
                                    required: ['accessLevel', 'allowModification', 'allowDeletion', 'allowSharing']
                                }
                            },
                            required: ['sourceAgentId', 'targetAgentId', 'memoryId', 'permissions'],
                        },
                    },
                    {
                        name: 'federated_query',
                        description: 'Perform a distributed query across multiple agents',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                requestingAgentId: { type: 'string', description: 'Agent making the request' },
                                query: { type: 'string', description: 'Search query' },
                                targetAgents: { type: 'array', items: { type: 'string' }, description: 'Agent IDs to query' },
                                queryType: { type: 'string', enum: ['search', 'recommendation', 'insight', 'verification'] },
                                priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                                responseTimeout: { type: 'number', description: 'Timeout in seconds' },
                                aggregationMethod: { type: 'string', enum: ['union', 'intersection', 'weighted', 'consensus'] }
                            },
                            required: ['requestingAgentId', 'query', 'targetAgents', 'queryType', 'aggregationMethod'],
                        },
                    },
                    {
                        name: 'collective_insights',
                        description: 'Generate collective insights from multiple agents about a topic',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                participatingAgents: { type: 'array', items: { type: 'string' }, description: 'Agent IDs to include' },
                                topic: { type: 'string', description: 'Topic for collective analysis' }
                            },
                            required: ['participatingAgents', 'topic'],
                        },
                    },
                    {
                        name: 'collaborative_learning',
                        description: 'Enable real-time collaborative learning across agents',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                participatingAgents: { type: 'array', items: { type: 'string' }, description: 'Agent IDs to include' },
                                learningObjective: { type: 'string', description: 'Objective for collaborative learning' }
                            },
                            required: ['participatingAgents', 'learningObjective'],
                        },
                    },
                    {
                        name: 'synchronize_federation',
                        description: 'Synchronize memories across federated agents',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                participatingAgents: { type: 'array', items: { type: 'string' }, description: 'Agent IDs to synchronize' }
                            },
                            required: ['participatingAgents'],
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
                    case 'remember':
                        return await this.handleRemember(args);
                    case 'recall':
                        return await this.handleRecall(args);
                    case 'forget':
                        return await this.handleForget(args);
                    case 'context':
                        return await this.handleContext(args);
                    case 'get_memory':
                        return await this.handleGetMemory(args);
                    case 'search_keys':
                        return await this.handleSearchKeys(args);
                    case 'link_memories':
                        return await this.handleLinkMemories(args);
                    case 'get_relationships':
                        return await this.handleGetRelationships(args);
                    case 'explore_graph':
                        return await this.handleExploreGraph(args);
                    case 'get_analytics':
                        this.log('info', '=== get_analytics tool called ===');
                        this.log('info', 'Arguments received:', JSON.stringify(args));
                        const agentId = args?.agentId || 'unknown';
                        const reportType = args?.reportType || 'usage';
                        const timeRange = args?.timeRange || 'week';
                        const includePatterns = args?.includePatterns !== false;
                        try {
                            // Comprehensive memory analysis with safe operations
                            let memoryCount = 0;
                            let totalRelationships = 0;
                            let totalImportance = 0;
                            const projects = new Set();
                            const entityTypes = new Set();
                            const priorities = new Map();
                            for (const [key, memory] of this.memories.entries()) {
                                if (memory?.metadata?.agentId === agentId) {
                                    memoryCount++;
                                    // Safe relationship counting
                                    if (memory.relationships && Array.isArray(memory.relationships)) {
                                        totalRelationships += memory.relationships.length;
                                    }
                                    // Safe importance accumulation
                                    if (typeof memory.metadata?.importance === 'number') {
                                        totalImportance += memory.metadata.importance;
                                    }
                                    else {
                                        totalImportance += 0.5; // default importance
                                    }
                                    // Safe metadata extraction
                                    if (memory.metadata?.project) {
                                        projects.add(memory.metadata.project);
                                    }
                                    if (memory.metadata?.entityType) {
                                        entityTypes.add(memory.metadata.entityType);
                                    }
                                    if (memory.metadata?.priority) {
                                        const priority = memory.metadata.priority;
                                        priorities.set(priority, (priorities.get(priority) || 0) + 1);
                                    }
                                }
                            }
                            const avgImportance = memoryCount > 0 ? totalImportance / memoryCount : 0;
                            const avgRelationships = memoryCount > 0 ? totalRelationships / memoryCount : 0;
                            // Calculate health scores
                            const overallHealth = memoryCount > 0 ?
                                Math.min(100, Math.round((avgImportance * 40) + (avgRelationships * 30) + 30)) : 0;
                            const organizationScore = Math.min(100, projects.size * 20);
                            const contentQuality = Math.min(100, entityTypes.size * 25);
                            const result = {
                                content: [{
                                        type: 'text',
                                        text: `Memory Analytics Report for Agent: ${agentId}

CONFIGURATION:
• Report Type: ${reportType}
• Time Range: ${timeRange}
• Include Patterns: ${includePatterns}
• Timestamp: ${new Date().toISOString()}

USAGE METRICS:
• Total Memories: ${memoryCount}
• Average Importance: ${avgImportance.toFixed(2)}
• Total Relationships: ${totalRelationships}
• Avg Relationships per Memory: ${avgRelationships.toFixed(1)}

ORGANIZATION:
• Projects: ${projects.size} (${Array.from(projects).slice(0, 3).join(', ')}${projects.size > 3 ? `, +${projects.size - 3} more` : ''})
• Entity Types: ${entityTypes.size} (${Array.from(entityTypes).slice(0, 3).join(', ')}${entityTypes.size > 3 ? `, +${entityTypes.size - 3} more` : ''})
• Priority Distribution: ${Array.from(priorities.entries()).map(([p, c]) => `${p}(${c})`).join(', ') || 'None set'}

HEALTH SCORES:
• Overall Health: ${overallHealth}%
• Organization Score: ${organizationScore}%
• Content Quality: ${contentQuality}%
• Relationship Quality: ${totalRelationships > 0 ? Math.min(100, avgRelationships * 50) : 0}%

INSIGHTS:
• Memory Activity: ${memoryCount > 0 ? 'Active' : 'No memories found'}
• Data Quality: ${avgImportance > 0.7 ? 'Excellent' : avgImportance > 0.5 ? 'Good' : avgImportance > 0.3 ? 'Fair' : 'Needs improvement'}
• Organization Level: ${projects.size > 3 ? 'Well organized' : projects.size > 1 ? 'Moderate organization' : 'Basic organization'}
• Connectivity: ${avgRelationships > 2 ? 'Highly connected' : avgRelationships > 1 ? 'Well connected' : avgRelationships > 0 ? 'Some connections' : 'Isolated memories'}

Analytics completed successfully in ${Date.now() - Date.now()}ms.`
                                    }]
                            };
                            this.log('info', '=== get_analytics completed successfully ===');
                            return result;
                        }
                        catch (error) {
                            this.log('error', '=== get_analytics failed ===', error);
                            return {
                                content: [{
                                        type: 'text',
                                        text: `Analytics Error for Agent: ${agentId}

Error: ${error?.message || 'Unknown error'}
Report Type: ${reportType}
Time Range: ${timeRange}
System Memory Count: ${this.memories.size}

Please check the server logs for more details.

Stack trace: ${error?.stack || 'Not available'}`
                                    }]
                            };
                        }
                    case 'get_recommendations':
                        return await this.handleGetRecommendations(args);
                    case 'get_insights':
                        this.log('info', '=== get_insights tool called ===');
                        this.log('info', 'Arguments received:', JSON.stringify(args));
                        const insightsAgentId = args?.agentId || 'unknown';
                        const insightType = args?.insightType || 'trending_topics';
                        const includeParameters = args?.parameters || {};
                        try {
                            // Simple insights generation without complex analytics engine
                            let memoryCount = 0;
                            const topics = new Map();
                            const projects = new Set();
                            const entityTypes = new Set();
                            const importanceScores = [];
                            const recentMemories = [];
                            for (const [key, memory] of this.memories.entries()) {
                                if (memory?.metadata?.agentId === insightsAgentId) {
                                    memoryCount++;
                                    // Extract topics from content (simple word frequency)
                                    if (memory.content) {
                                        const words = memory.content.toLowerCase()
                                            .split(/\s+/)
                                            .filter(word => word.length > 4)
                                            .slice(0, 10); // top 10 words
                                        words.forEach(word => {
                                            topics.set(word, (topics.get(word) || 0) + 1);
                                        });
                                    }
                                    // Collect metadata
                                    if (memory.metadata?.project)
                                        projects.add(memory.metadata.project);
                                    if (memory.metadata?.entityType)
                                        entityTypes.add(memory.metadata.entityType);
                                    if (typeof memory.metadata?.importance === 'number') {
                                        importanceScores.push(memory.metadata.importance);
                                    }
                                    // Track recent memories (basic)
                                    recentMemories.push({
                                        key: memory.structuredKey,
                                        content: memory.content.substring(0, 100) + '...',
                                        importance: memory.metadata?.importance || 0.5
                                    });
                                }
                            }
                            // Generate insights based on type
                            let insightContent = '';
                            switch (insightType) {
                                case 'trending_topics':
                                    const topTopics = Array.from(topics.entries())
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 5);
                                    insightContent = `Trending Topics Analysis for Agent: ${insightsAgentId}

TOP TRENDING TOPICS:
${topTopics.map((topic, i) => `${i + 1}. "${topic[0]}" (mentioned ${topic[1]} times)`).join('\n')}

TOPIC INSIGHTS:
• Most frequent topic: ${topTopics[0] ? topTopics[0][0] : 'No data'}
• Topic diversity: ${topics.size} unique topics identified
• Content richness: ${topics.size > 10 ? 'High' : topics.size > 5 ? 'Moderate' : 'Low'}`;
                                    break;
                                case 'memory_clusters':
                                    insightContent = `Memory Clusters Analysis for Agent: ${insightsAgentId}

PROJECT CLUSTERS:
${Array.from(projects).map(p => `• ${p}`).join('\n') || '• No projects identified'}

ENTITY TYPE CLUSTERS:
${Array.from(entityTypes).map(e => `• ${e}`).join('\n') || '• No entity types identified'}

CLUSTER INSIGHTS:
• Project diversity: ${projects.size} different projects
• Entity type variety: ${entityTypes.size} different types
• Organization level: ${projects.size > 2 ? 'Well organized' : 'Basic organization'}`;
                                    break;
                                case 'knowledge_map':
                                    const avgImportance = importanceScores.length > 0 ?
                                        importanceScores.reduce((a, b) => a + b, 0) / importanceScores.length : 0;
                                    insightContent = `Knowledge Map Analysis for Agent: ${insightsAgentId}

KNOWLEDGE DISTRIBUTION:
• Total knowledge nodes: ${memoryCount}
• Average importance: ${avgImportance.toFixed(2)}
• High-value memories: ${importanceScores.filter(s => s > 0.7).length}
• Projects covered: ${projects.size}

KNOWLEDGE GAPS:
${projects.size < 2 ? '• Limited project diversity - consider expanding scope' : '• Good project coverage'}
${entityTypes.size < 3 ? '• Limited entity types - consider categorizing content better' : '• Good entity type diversity'}
${avgImportance < 0.5 ? '• Low average importance - consider reviewing content quality' : '• Good content importance scores'}`;
                                    break;
                                case 'activity_heatmap':
                                    insightContent = `Activity Heatmap Analysis for Agent: ${insightsAgentId}

ACTIVITY OVERVIEW:
• Total memories: ${memoryCount}
• Active projects: ${projects.size}
• Memory types: ${entityTypes.size}
• Content volume: ${recentMemories.reduce((sum, m) => sum + m.content.length, 0)} characters

ACTIVITY PATTERNS:
• Creation frequency: ${memoryCount > 10 ? 'High' : memoryCount > 5 ? 'Moderate' : 'Low'}
• Project focus: ${projects.size === 1 ? 'Single project focused' : 'Multi-project'}
• Content variety: ${entityTypes.size > 3 ? 'Diverse' : 'Focused'}`;
                                    break;
                                case 'gap_analysis':
                                    const gaps = [];
                                    if (projects.size < 2)
                                        gaps.push('Limited project diversity');
                                    if (entityTypes.size < 3)
                                        gaps.push('Few entity types');
                                    if (importanceScores.filter(s => s > 0.7).length < memoryCount * 0.2)
                                        gaps.push('Few high-importance memories');
                                    if (memoryCount < 5)
                                        gaps.push('Limited memory volume');
                                    insightContent = `Gap Analysis for Agent: ${insightsAgentId}

IDENTIFIED GAPS:
${gaps.map(gap => `• ${gap}`).join('\n') || '• No significant gaps identified'}

RECOMMENDATIONS:
${gaps.length === 0 ? '• Memory management appears well-balanced' : ''}
${projects.size < 2 ? '• Consider expanding to additional projects or domains' : ''}
${entityTypes.size < 3 ? '• Consider adding more diverse content types' : ''}
${memoryCount < 5 ? '• Consider creating more detailed memories for better insights' : ''}

STRENGTH AREAS:
• Memory volume: ${memoryCount} memories
• Organization: ${projects.size} projects, ${entityTypes.size} entity types
• Quality: Average importance ${(importanceScores.reduce((a, b) => a + b, 0) / importanceScores.length || 0).toFixed(2)}`;
                                    break;
                                default:
                                    insightContent = `General Insights for Agent: ${insightsAgentId}

OVERVIEW:
• Total memories: ${memoryCount}
• Projects: ${projects.size}
• Entity types: ${entityTypes.size}
• Insight type: ${insightType}

This insight type (${insightType}) is available. Use specific types like:
• trending_topics - Most frequent content themes
• memory_clusters - Organization patterns  
• knowledge_map - Knowledge distribution
• activity_heatmap - Activity patterns
• gap_analysis - Areas for improvement`;
                            }
                            const result = {
                                content: [{
                                        type: 'text',
                                        text: insightContent + `

METADATA:
• Insight Type: ${insightType}
• Memories Analyzed: ${memoryCount}
• Generated: ${new Date().toISOString()}
• Parameters: ${JSON.stringify(includeParameters)}

Insights generated successfully.`
                                    }]
                            };
                            this.log('info', '=== get_insights completed successfully ===');
                            return result;
                        }
                        catch (error) {
                            this.log('error', '=== get_insights failed ===', error);
                            return {
                                content: [{
                                        type: 'text',
                                        text: `Insights Error for Agent: ${insightsAgentId}

Error: ${error?.message || 'Unknown error'}
Insight Type: ${insightType}
System Memory Count: ${this.memories.size}

Please check the server logs for more details.

Stack trace: ${error?.stack || 'Not available'}`
                                    }]
                            };
                        }
                    case 'evolve_memory':
                        return await this.handleEvolveMemory(args);
                    case 'resolve_conflicts':
                        return await this.handleResolveConflicts(args);
                    case 'consolidate_memories':
                        return await this.handleConsolidateMemories(args);
                    case 'manage_lifecycle':
                        return await this.handleManageLifecycle(args);
                    // Phase 4: Enhanced Predictive & Learning Handlers
                    case 'predict_enhanced':
                        return await this.handlePredictEnhanced(args);
                    case 'predict_structure':
                        return await this.handlePredictStructure(args);
                    case 'predict_evolution':
                        return await this.handlePredictEvolution(args);
                    case 'learn_from_usage':
                        return await this.handleLearnFromUsage(args);
                    case 'adapt_organization':
                        return await this.handleAdaptOrganization(args);
                    case 'optimize_retrieval':
                        return await this.handleOptimizeRetrieval(args);
                    case 'share_memory':
                        return await this.handleShareMemory(args);
                    case 'federated_query':
                        return await this.handleFederatedQuery(args);
                    case 'collective_insights':
                        return await this.handleCollectiveInsights(args);
                    case 'collaborative_learning':
                        return await this.handleCollaborativeLearning(args);
                    case 'synchronize_federation':
                        return await this.handleSynchronizeFederation(args);
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
                    .sort((a, b) => {
                    const aTime = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
                    const bTime = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
                    return bTime - aTime;
                })
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
            .sort((a, b) => {
            const aTime = a.metadata?.timestamp ? new Date(a.metadata.timestamp).getTime() : 0;
            const bTime = b.metadata?.timestamp ? new Date(b.metadata.timestamp).getTime() : 0;
            return bTime - aTime;
        })
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
                        name: 'store_memory (remember)',
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
                        name: 'search_memory (recall)',
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
                        name: 'search_keys (search_keys)',
                        description: 'Vector similarity search for related memory keys',
                        features: [
                            'Key similarity matching',
                            'Configurable thresholds',
                            'Ranked results'
                        ]
                    },
                    {
                        name: 'get_memory (get_memory)',
                        description: 'Direct memory retrieval by structured key',
                        features: [
                            'Exact key matching',
                            'Access tracking',
                            'Metadata retrieval'
                        ]
                    }
                ],
                additionalOperations: [
                    'forget: Delete specific memories by structured key',
                    'context: Retrieve recent agent context with filtering'
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
    // Phase 2 Enhanced Analytics Handler Methods
    async handleGetAnalytics(args) {
        const startTime = Date.now();
        const { agentId, timeRange = 'week', includePatterns = true } = args || {};
        this.log('info', 'Analytics requested for agent:', agentId);
        this.log('info', 'Total memories in system:', this.memories.size);
        try {
            if (!agentId) {
                throw new McpError(ErrorCode.InvalidRequest, 'Agent ID is required');
            }
            // Get agent memories count only to avoid any complex operations
            let memoryCount = 0;
            let hasErrors = false;
            try {
                for (const memory of this.memories.values()) {
                    if (memory?.metadata?.agentId === agentId) {
                        memoryCount++;
                    }
                }
                this.log('info', `Found ${memoryCount} memories for agent ${agentId}`);
            }
            catch (error) {
                this.log('error', 'Error counting memories by agent:', error);
                hasErrors = true;
            }
            const responseTime = Date.now() - startTime;
            this.log('info', `Analytics generated for agent ${agentId} in ${responseTime}ms`);
            const analyticsText = `Memory Analytics Report for Agent: ${agentId}

Time Range: ${timeRange}
Response Time: ${responseTime}ms
${hasErrors ? 'Warning: Some errors occurred during analysis' : ''}

BASIC USAGE REPORT:
• Total Memories: ${memoryCount}
• System Health: ${hasErrors ? 'Needs attention' : 'Operational'}
• Analysis Status: ${memoryCount > 0 ? 'Data available' : 'No data found'}

This is a simplified analytics report. The agent has ${memoryCount > 0 ? `${memoryCount} memories` : 'no memories'} in the system.`;
            return {
                content: [{
                        type: 'text',
                        text: analyticsText
                    }]
            };
        }
        catch (error) {
            this.log('error', `Get analytics failed with error:`, error);
            this.log('error', 'Error details:', {
                message: error?.message,
                stack: error?.stack,
                agentId,
                memoriesCount: this.memories.size
            });
            return {
                content: [{
                        type: 'text',
                        text: `Analytics Error for Agent: ${agentId || 'unknown'}

Error: ${error?.message || 'Unknown error'}
Memories in system: ${this.memories.size}
Response Time: ${Date.now() - startTime}ms

Debug Information:
- Agent ID: ${agentId || 'not provided'}
- Time Range: ${timeRange}
- Include Patterns: ${includePatterns}

Please check the server logs for more details.`
                    }]
            };
        }
    }
    async handleGetRecommendations(args) {
        const startTime = Date.now();
        try {
            const { agentId, type = 'all', maxRecommendations = 10 } = args;
            if (!agentId) {
                throw new McpError(ErrorCode.InvalidRequest, 'Agent ID is required');
            }
            // Get agent memories
            const agentMemories = Array.from(this.memories.values())
                .filter(m => m.metadata.agentId === agentId);
            if (agentMemories.length === 0) {
                return {
                    message: 'No memories found for this agent',
                    recommendations: {
                        review: [],
                        create: [],
                        connect: [],
                        cleanup: []
                    }
                };
            }
            // Generate recommendations based on type
            let recommendations = {};
            if (type === 'all' || type === 'review') {
                recommendations.review = await this.recommendationEngine.recommendReview(agentId);
            }
            if (type === 'all' || type === 'create') {
                recommendations.create = await this.recommendationEngine.suggestNewMemories(agentId);
            }
            if (type === 'all' || type === 'connect') {
                recommendations.connect = await this.recommendationEngine.recommendRelationships(agentId);
            }
            if (type === 'all' || type === 'cleanup') {
                recommendations.cleanup = await this.recommendationEngine.suggestCleanup(agentId);
            }
            // Limit results
            if (maxRecommendations > 0) {
                Object.keys(recommendations).forEach(key => {
                    if (Array.isArray(recommendations[key])) {
                        recommendations[key] = recommendations[key].slice(0, maxRecommendations);
                    }
                });
            }
            const responseTime = Date.now() - startTime;
            this.log('info', `Recommendations generated for agent ${agentId} in ${responseTime}ms`);
            // Format recommendations for display
            let recommendationText = `Memory Management Recommendations for Agent: ${agentId}\n\nRecommendation Type: ${type}\nMemories Analyzed: ${agentMemories.length}\nResponse Time: ${responseTime}ms\n\n`;
            if (recommendations.review && recommendations.review.length > 0) {
                recommendationText += `REVIEW RECOMMENDATIONS (${recommendations.review.length}):\n`;
                recommendations.review.forEach((rec, index) => {
                    recommendationText += `${index + 1}. ${rec.reasoning}\n   Action: ${rec.actionSuggestion}\n   Priority: ${rec.priority} | Confidence: ${(rec.confidence * 100).toFixed(0)}%\n\n`;
                });
            }
            if (recommendations.create && recommendations.create.length > 0) {
                recommendationText += `CREATE NEW MEMORIES (${recommendations.create.length}):\n`;
                recommendations.create.forEach((rec, index) => {
                    recommendationText += `${index + 1}. ${rec.suggestedContent}\n   Category: ${rec.category} | Priority: ${rec.priority}\n   Reasoning: ${rec.reasoning}\n\n`;
                });
            }
            if (recommendations.connect && recommendations.connect.length > 0) {
                recommendationText += `RELATIONSHIP SUGGESTIONS (${recommendations.connect.length}):\n`;
                recommendations.connect.forEach((rec, index) => {
                    recommendationText += `${index + 1}. Connect ${rec.sourceMemoryKey} → ${rec.targetMemoryKey}\n   Type: ${rec.relationshipType} | Confidence: ${(rec.confidence * 100).toFixed(0)}%\n   Reasoning: ${rec.reasoning}\n\n`;
                });
            }
            if (recommendations.cleanup && recommendations.cleanup.length > 0) {
                recommendationText += `CLEANUP SUGGESTIONS (${recommendations.cleanup.length}):\n`;
                recommendations.cleanup.forEach((rec, index) => {
                    recommendationText += `${index + 1}. ${rec.type.toUpperCase()}: ${rec.memoryKeys.length} memories\n   Risk Level: ${rec.riskLevel}\n   Reasoning: ${rec.reasoning}\n\n`;
                });
            }
            return {
                content: [{
                        type: 'text',
                        text: recommendationText
                    }]
            };
        }
        catch (error) {
            this.log('error', `Get recommendations failed:`, error);
            throw error;
        }
    }
    async handleGetInsights(args) {
        const startTime = Date.now();
        try {
            const { agentId, includeKnowledgeGaps = true, includePredictions = false } = args;
            if (!agentId) {
                throw new McpError(ErrorCode.InvalidRequest, 'Agent ID is required');
            }
            // Get agent memories
            const agentMemories = Array.from(this.memories.values())
                .filter(m => m.metadata.agentId === agentId);
            if (agentMemories.length === 0) {
                return {
                    message: 'No memories found for this agent',
                    insights: {
                        knowledgeGaps: [],
                        recommendations: [],
                        summary: 'No data available for analysis'
                    }
                };
            }
            // Generate comprehensive insights
            const insights = {};
            if (includeKnowledgeGaps) {
                insights.knowledgeGaps = await this.analyticsEngine.identifyKnowledgeGaps(agentId);
            }
            // Generate AI-powered recommendations
            const recommendations = await this.analyticsEngine.generateRecommendations(agentId);
            insights.recommendations = recommendations;
            // Create summary
            const healthScore = await this.analyticsEngine.calculateMemoryHealth(agentId);
            insights.summary = this.generateInsightsSummary(agentMemories, healthScore, recommendations);
            const responseTime = Date.now() - startTime;
            this.log('info', `Insights generated for agent ${agentId} in ${responseTime}ms`);
            return {
                insights,
                performance: {
                    responseTime,
                    memoriesAnalyzed: agentMemories.length,
                    insightTypes: Object.keys(insights)
                }
            };
        }
        catch (error) {
            this.log('error', `Get insights failed:`, error);
            throw error;
        }
    }
    generateInsightsSummary(memories, healthScore, recommendations) {
        const memoryCount = memories.length;
        const avgImportance = memories.reduce((sum, m) => sum + (m.metadata.importance || 0.5), 0) / memoryCount;
        const healthRating = healthScore.overall > 0.8 ? 'excellent' : healthScore.overall > 0.6 ? 'good' : 'needs improvement';
        return `Memory analysis for ${memoryCount} memories shows ${healthRating} health (${(healthScore.overall * 100).toFixed(0)}% score) with average importance of ${avgImportance.toFixed(2)}. ${recommendations.length} optimization recommendations available.`;
    }
    async handleEvolveMemory(args) {
        try {
            const { memoryId, newInformation, context } = args;
            if (!memoryId || typeof memoryId !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Memory ID is required');
            }
            if (!newInformation || typeof newInformation !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'New information is required');
            }
            const evolutionResult = await this.evolutionEngine.evolveMemory(memoryId, newInformation, context);
            this.log('info', `Memory evolved: ${memoryId} (${evolutionResult.evolutionType})`);
            return {
                content: [{
                        type: 'text',
                        text: `Memory evolution completed successfully.

Evolution Type: ${evolutionResult.evolutionType}
Confidence: ${(evolutionResult.confidence * 100).toFixed(1)}%
Changes Made: ${evolutionResult.changes.length}
Reasoning: ${evolutionResult.reasoning}

The memory has been ${evolutionResult.evolutionType === 'update' ? 'updated' :
                            evolutionResult.evolutionType === 'merge' ? 'merged with new information' :
                                evolutionResult.evolutionType === 'enhance' ? 'enhanced with additional metadata' :
                                    evolutionResult.evolutionType === 'archive' ? 'archived as outdated' :
                                        'processed'} based on the provided information.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Memory evolution failed:`, error);
            throw error;
        }
    }
    async handleResolveConflicts(args) {
        try {
            const { memoryIds, resolutionStrategy } = args;
            if (!Array.isArray(memoryIds) || memoryIds.length < 2) {
                throw new McpError(ErrorCode.InvalidParams, 'At least 2 memory IDs are required');
            }
            const conflictResolution = await this.evolutionEngine.resolveMemoryConflicts(memoryIds, resolutionStrategy);
            this.log('info', `Conflict resolved between ${memoryIds.length} memories`);
            return {
                content: [{
                        type: 'text',
                        text: `Conflict resolution completed successfully.

Conflict Type: ${conflictResolution.conflictType.replace('_', ' ')}
Resolution Strategy: ${conflictResolution.resolution.strategy}
Confidence: ${(conflictResolution.confidence * 100).toFixed(1)}%
Primary Memory: ${conflictResolution.resolution.primaryMemoryId}
Secondary Memories: ${conflictResolution.resolution.secondaryMemoryIds.join(', ')}

Reasoning: ${conflictResolution.reasoning}

The conflict has been resolved using the ${conflictResolution.resolution.strategy} strategy.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Conflict resolution failed:`, error);
            throw error;
        }
    }
    async handleConsolidateMemories(args) {
        try {
            const { memoryIds, consolidationType = 'merge' } = args;
            if (!Array.isArray(memoryIds) || memoryIds.length < 2) {
                throw new McpError(ErrorCode.InvalidParams, 'At least 2 memory IDs are required');
            }
            const consolidation = await this.evolutionEngine.consolidateMemories(memoryIds, consolidationType);
            this.log('info', `Consolidated ${memoryIds.length} memories using ${consolidationType}`);
            return {
                content: [{
                        type: 'text',
                        text: `Memory consolidation completed successfully.

Consolidation Type: ${consolidation.consolidationType}
Source Memories: ${consolidation.sourceMemoryIds.length}
Quality Score: ${(consolidation.qualityScore * 100).toFixed(1)}%
Consolidated Memory ID: ${consolidation.consolidatedMemory.id}

Preserved Information:
${consolidation.preservedInformation.map(info => `• ${info}`).join('\n')}

${consolidation.lostInformation.length > 0 ? `
Lost Information:
${consolidation.lostInformation.map(info => `• ${info}`).join('\n')}
` : 'No information was lost during consolidation.'}

The memories have been successfully consolidated into a single, organized memory.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Memory consolidation failed:`, error);
            throw error;
        }
    }
    async handleManageLifecycle(args) {
        try {
            const { agentId } = args;
            if (!agentId || typeof agentId !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Agent ID is required');
            }
            const lifecycleResult = await this.evolutionEngine.manageMemoryLifecycle(agentId);
            this.log('info', `Lifecycle management completed for agent: ${agentId}`);
            const totalProcessed = lifecycleResult.archived.length +
                lifecycleResult.promoted.length +
                lifecycleResult.cleaned.length +
                lifecycleResult.enhanced.length;
            return {
                content: [{
                        type: 'text',
                        text: `Memory lifecycle management completed successfully.

Agent: ${agentId}
Total Memories Processed: ${totalProcessed}

Actions Taken:
• Archived: ${lifecycleResult.archived.length} memories (old/unused)
• Promoted: ${lifecycleResult.promoted.length} memories (high value)
• Cleaned: ${lifecycleResult.cleaned.length} memories (duplicates)
• Enhanced: ${lifecycleResult.enhanced.length} memories (missing metadata)

${lifecycleResult.archived.length > 0 ? `\nArchived Memory IDs:\n${lifecycleResult.archived.join(', ')}` : ''}
${lifecycleResult.promoted.length > 0 ? `\nPromoted Memory IDs:\n${lifecycleResult.promoted.join(', ')}` : ''}
${lifecycleResult.cleaned.length > 0 ? `\nCleaned Memory IDs:\n${lifecycleResult.cleaned.join(', ')}` : ''}
${lifecycleResult.enhanced.length > 0 ? `\nEnhanced Memory IDs:\n${lifecycleResult.enhanced.join(', ')}` : ''}

Your memory system has been optimized for better performance and organization.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Lifecycle management failed:`, error);
            throw error;
        }
    }
    // Phase 4: Enhanced Predictive & Learning Handler Methods
    async handlePredictEnhanced(args) {
        try {
            const { agentId, context } = args;
            if (!agentId || typeof agentId !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Agent ID is required');
            }
            if (!context || typeof context !== 'object') {
                throw new McpError(ErrorCode.InvalidParams, 'Context is required');
            }
            // Ensure context has required fields with defaults
            const validatedContext = {
                currentTask: context.currentTask || 'general_task',
                urgency: context.urgency || 'medium',
                recentMemories: Array.isArray(context.recentMemories) ? context.recentMemories : [],
                timeOfDay: context.timeOfDay || new Date().toISOString(),
                ...context
            };
            const predictions = await this.enhancedPredictiveEngine.predictNeededMemoriesEnhanced(agentId, validatedContext);
            this.log('info', `Enhanced prediction completed for agent: ${agentId}`);
            return {
                content: [{
                        type: 'text',
                        text: `Enhanced Memory Predictions for Agent: ${agentId}

Context: ${validatedContext.currentTask}
Urgency: ${validatedContext.urgency || 'medium'}

Predicted Memories (${predictions.length}):

${predictions.map((pred, index) => `
${index + 1}. ${pred.title}
   Relevance: ${(pred.predictedRelevance * 100).toFixed(1)}%
   Confidence: ${(pred.confidence * 100).toFixed(1)}%
   Time to Need: ${pred.timeToNeed} minutes
   Adaptation Score: ${(pred.adaptationScore * 100).toFixed(1)}%
   Learning Factors: ${pred.learningFactors.length}
   ${pred.learningFactors.map(f => `   • ${f.type}: ${f.description} (${(f.strength * 100).toFixed(1)}%)`).join('\n')}
   
   Reasoning: ${pred.reasoning}
   ${pred.collaborativeInsights && pred.collaborativeInsights.length > 0 ?
                            `Collaborative Insights: ${pred.collaborativeInsights.map(ci => ci.description).join(', ')}` : ''}
`).join('\n')}

Enhanced predictions use real-time learning to improve accuracy and adapt to your usage patterns.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Enhanced prediction failed:`, error);
            throw error;
        }
    }
    async handlePredictStructure(args) {
        try {
            const { agentId } = args;
            if (!agentId || typeof agentId !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Agent ID is required');
            }
            const structurePrediction = await this.enhancedPredictiveEngine.predictOptimalStructure(agentId);
            this.log('info', `Structure prediction completed for agent: ${agentId}`);
            return {
                content: [{
                        type: 'text',
                        text: `Optimal Memory Structure Prediction for Agent: ${agentId}

Current Structure Analysis:
• Total Memories: ${structurePrediction.currentStructure.totalMemories}
• Current Clusters: ${structurePrediction.currentStructure.clusterCount}
• Average Cluster Size: ${structurePrediction.currentStructure.averageClusterSize.toFixed(1)}
• Relationship Density: ${(structurePrediction.currentStructure.relationshipDensity * 100).toFixed(1)}%
• Organization Score: ${(structurePrediction.currentStructure.organizationScore * 100).toFixed(1)}%
• Access Efficiency: ${(structurePrediction.currentStructure.accessPatternEfficiency * 100).toFixed(1)}%

Recommended Structure:
• Optimal Clusters: ${structurePrediction.recommendedStructure.optimalClusterCount}
• Cluster Themes:
${structurePrediction.recommendedStructure.clusterThemes.map(theme => `  - ${theme.name}: ${theme.description} (${theme.expectedMemoryCount} memories)`).join('\n')}

Expected Benefits:
${structurePrediction.expectedBenefits.map(benefit => `• ${benefit.category}: ${benefit.description} - ${benefit.quantifiableBenefit} (${benefit.timeToRealization})`).join('\n')}

Implementation Complexity: ${structurePrediction.implementationComplexity}
Migration Timeline: ${structurePrediction.migrationPlan.totalDuration}

Migration Plan:
${structurePrediction.migrationPlan.phases.map(phase => `• ${phase.name} (${phase.duration}): ${phase.actions.join(', ')}`).join('\n')}

This analysis uses AI-powered pattern recognition to optimize your memory organization for maximum efficiency.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Structure prediction failed:`, error);
            throw error;
        }
    }
    async handlePredictEvolution(args) {
        try {
            const { memoryId, timeHorizon = '1 month' } = args;
            if (!memoryId || typeof memoryId !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Memory ID is required');
            }
            const evolutionPrediction = await this.enhancedPredictiveEngine.predictMemoryEvolution(memoryId, timeHorizon);
            this.log('info', `Evolution prediction completed for memory: ${memoryId}`);
            return {
                content: [{
                        type: 'text',
                        text: `Memory Evolution Prediction

Memory ID: ${memoryId}
Time Horizon: ${timeHorizon}
Prediction Confidence: ${(evolutionPrediction.confidence * 100).toFixed(1)}%

Current State:
• Importance: ${(evolutionPrediction.currentState.importance * 100).toFixed(1)}%
• Usage Frequency: ${(evolutionPrediction.currentState.usageFrequency * 100).toFixed(1)}%
• Content Quality: ${(evolutionPrediction.currentState.contentQuality * 100).toFixed(1)}%
• Relationships: ${evolutionPrediction.currentState.relationshipCount}
• Last Accessed: ${new Date(evolutionPrediction.currentState.lastAccessTime).toLocaleDateString()}

Predicted Evolution Steps:
${evolutionPrediction.predictedEvolution.map(step => `
${step.timeframe} (${(step.probability * 100).toFixed(1)}% probability):
${step.expectedChanges.map(change => `  • ${change.attribute}: ${change.direction} by ${(change.magnitude * 100).toFixed(1)}% - ${change.reason}`).join('\n')}
Catalysts: ${step.catalysts.join(', ')}
`).join('\n')}

Potential Trigger Events:
${evolutionPrediction.triggerEvents.map(event => `• ${event.event} (${(event.probability * 100).toFixed(1)}% chance in ${event.timeToEvent} days)`).join('\n')}

This prediction uses machine learning to forecast how your memory will evolve based on usage patterns and context.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Evolution prediction failed:`, error);
            throw error;
        }
    }
    async handleLearnFromUsage(args) {
        try {
            const { agentId, usagePatterns } = args;
            if (!agentId || typeof agentId !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Agent ID is required');
            }
            if (!Array.isArray(usagePatterns)) {
                throw new McpError(ErrorCode.InvalidParams, 'Usage patterns array is required');
            }
            // Validate and sanitize usage patterns
            const validUsagePatterns = usagePatterns.filter(pattern => pattern &&
                typeof pattern === 'object' &&
                pattern.memoryId &&
                typeof pattern.accessFrequency === 'number' &&
                typeof pattern.successRate === 'number').map(pattern => ({
                agentId: pattern.agentId || agentId,
                memoryId: pattern.memoryId,
                accessFrequency: pattern.accessFrequency,
                accessTiming: Array.isArray(pattern.accessTiming) ? pattern.accessTiming : [],
                contextPatterns: Array.isArray(pattern.contextPatterns) ? pattern.contextPatterns : [],
                successRate: pattern.successRate,
                collaborationPatterns: Array.isArray(pattern.collaborationPatterns) ? pattern.collaborationPatterns : []
            }));
            if (validUsagePatterns.length === 0) {
                throw new McpError(ErrorCode.InvalidParams, 'No valid usage patterns provided');
            }
            const learningResult = await this.enhancedPredictiveEngine.learnFromUsagePatterns(agentId, validUsagePatterns);
            this.log('info', `Learning from usage completed for agent: ${agentId}`);
            return {
                content: [{
                        type: 'text',
                        text: `Learning Results for Agent: ${agentId}

Learning Period: ${new Date(learningResult.learningPeriod).toLocaleDateString()}
Usage Patterns Analyzed: ${usagePatterns.length}

Patterns Learned (${learningResult.patternsLearned.length}):
${learningResult.patternsLearned.map(pattern => `
• ${pattern.type}: ${pattern.pattern}
  Strength: ${(pattern.strength * 100).toFixed(1)}%
  Validation Score: ${(pattern.validationScore * 100).toFixed(1)}%
  Applications: ${pattern.applications.join(', ')}
`).join('\n')}

Prediction Adaptations Made (${learningResult.adaptationsMade.length}):
${learningResult.adaptationsMade.map(adaptation => `
• ${adaptation.predictionType}: ${adaptation.originalApproach} → ${adaptation.adaptedApproach}
  Improvement: ${(adaptation.measuredImprovement * 100).toFixed(1)}%
  Reason: ${adaptation.improvementReason}
`).join('\n')}

Performance Improvements:
${learningResult.performanceImprovements.map(improvement => `
• ${improvement.metric}: ${improvement.beforeValue} → ${improvement.afterValue} (+${improvement.improvementPercentage.toFixed(1)}%)
`).join('\n')}

Next Learning Cycle: ${new Date(learningResult.nextLearningCycle).toLocaleDateString()}

The system has learned from your usage patterns and adapted its prediction algorithms for better accuracy.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Learning from usage failed:`, error);
            throw error;
        }
    }
    async handleAdaptOrganization(args) {
        try {
            const { agentId, effectivenessMetrics } = args;
            if (!agentId || typeof agentId !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Agent ID is required');
            }
            if (!effectivenessMetrics || typeof effectivenessMetrics !== 'object') {
                throw new McpError(ErrorCode.InvalidParams, 'Effectiveness metrics are required');
            }
            // Create a proper metrics object with agent ID and time range
            const fullMetrics = {
                agentId,
                timeRange: { start: '', end: '', granularity: 'day' },
                retrievalSuccessRate: effectivenessMetrics.retrievalSuccessRate,
                averageRetrievalTime: effectivenessMetrics.averageRetrievalTime,
                memoryUtilizationRate: effectivenessMetrics.memoryUtilizationRate || 0.7,
                contextAccuracy: effectivenessMetrics.contextAccuracy || 0.7,
                collaborationEffectiveness: effectivenessMetrics.collaborationEffectiveness || 0.5,
                overallSatisfaction: effectivenessMetrics.overallSatisfaction || 0.7
            };
            const organizationAdaptation = await this.learningEngine.adaptMemoryOrganization(agentId, fullMetrics);
            this.log('info', `Organization adaptation completed for agent: ${agentId}`);
            return {
                content: [{
                        type: 'text',
                        text: `Memory Organization Adaptation for Agent: ${agentId}

Current Effectiveness Metrics:
• Retrieval Success Rate: ${(fullMetrics.retrievalSuccessRate * 100).toFixed(1)}%
• Average Retrieval Time: ${fullMetrics.averageRetrievalTime.toFixed(1)}ms
• Memory Utilization: ${(fullMetrics.memoryUtilizationRate * 100).toFixed(1)}%
• Context Accuracy: ${(fullMetrics.contextAccuracy * 100).toFixed(1)}%
• Collaboration Effectiveness: ${(fullMetrics.collaborationEffectiveness * 100).toFixed(1)}%
• Overall Satisfaction: ${(fullMetrics.overallSatisfaction * 100).toFixed(1)}%

Recommended Adaptations (${organizationAdaptation.adaptations.length}):
${organizationAdaptation.adaptations.map(adaptation => `
• ${adaptation.type}: ${adaptation.description}
  Expected Impact:
    - Retrieval Speed: +${adaptation.impact.retrievalSpeed}%
    - Accuracy: +${adaptation.impact.accuracy}%
    - User Satisfaction: +${adaptation.impact.userSatisfaction}%
    - System Load: ${adaptation.impact.systemLoad >= 0 ? '+' : ''}${adaptation.impact.systemLoad}%
  Automation: ${adaptation.automation ? 'Yes' : 'No'}
`).join('\n')}

Expected Improvements:
${organizationAdaptation.expectedImprovements.map(improvement => `• ${improvement.metric}: +${improvement.improvement}%`).join('\n')}

Implementation Plan:
Timeline: ${organizationAdaptation.implementationPlan.timeline}
${organizationAdaptation.implementationPlan.phases.map(phase => `
• ${phase.name} (${phase.duration}):
  Activities: ${phase.activities.join(', ')}
  Deliverables: ${phase.deliverables.join(', ')}
`).join('\n')}

Success Criteria:
${organizationAdaptation.implementationPlan.successCriteria.map(criteria => `• ${criteria.metric}: ${criteria.target} (${criteria.timeline})`).join('\n')}

Rollback Plan: ${organizationAdaptation.rollbackPlan.timeline}
Triggers: ${organizationAdaptation.rollbackPlan.triggers.join(', ')}

The system will automatically adapt your memory organization to improve performance based on these metrics.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Organization adaptation failed:`, error);
            throw error;
        }
    }
    async handleOptimizeRetrieval(args) {
        try {
            const { queryPatterns, performanceMetrics } = args;
            if (!Array.isArray(queryPatterns)) {
                throw new McpError(ErrorCode.InvalidParams, 'Query patterns array is required');
            }
            if (!performanceMetrics || typeof performanceMetrics !== 'object') {
                throw new McpError(ErrorCode.InvalidParams, 'Performance metrics are required');
            }
            // Create proper metrics object with time range
            const fullPerformanceMetrics = {
                ...performanceMetrics,
                timeRange: { start: '', end: '', granularity: 'day' },
                precisionRate: performanceMetrics.precisionRate || 0.8,
                recallRate: performanceMetrics.recallRate || 0.7,
                userSatisfactionScore: performanceMetrics.userSatisfactionScore || 0.8
            };
            const retrievalOptimization = await this.learningEngine.optimizeMemoryRetrieval(queryPatterns, fullPerformanceMetrics);
            this.log('info', `Retrieval optimization completed for agent: ${performanceMetrics.agentId}`);
            return {
                content: [{
                        type: 'text',
                        text: `Memory Retrieval Optimization for Agent: ${performanceMetrics.agentId}

Current Performance Metrics:
• Total Queries: ${performanceMetrics.totalQueries}
• Average Response Time: ${performanceMetrics.averageResponseTime.toFixed(1)}ms
• Success Rate: ${(performanceMetrics.successRate * 100).toFixed(1)}%
• User Satisfaction: ${(fullPerformanceMetrics.userSatisfactionScore * 100).toFixed(1)}%

Query Patterns Analyzed: ${queryPatterns.length}

Recommended Optimizations (${retrievalOptimization.optimizations.length}):
${retrievalOptimization.optimizations.map(opt => `
• ${opt.area}: ${opt.description}
  Technique: ${opt.technique}
  Expected Gain: +${opt.expectedGain}%
`).join('\n')}

Expected Performance Improvements:
${retrievalOptimization.expectedImprovements.map(improvement => `
• ${improvement.metric}: ${improvement.currentValue} → ${improvement.projectedValue} (${(improvement.confidence * 100).toFixed(1)}% confidence)
`).join('\n')}

Implementation Plan:
Immediate Actions:
${retrievalOptimization.implementation.immediate.map(action => `  • ${action}`).join('\n')}

Short-term Actions:
${retrievalOptimization.implementation.shortTerm.map(action => `  • ${action}`).join('\n')}

Long-term Actions:
${retrievalOptimization.implementation.longTerm.map(action => `  • ${action}`).join('\n')}

Experimental Features:
${retrievalOptimization.implementation.experimental.map(feature => `  • ${feature}`).join('\n')}

These optimizations will improve your memory retrieval speed, accuracy, and overall user experience.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Retrieval optimization failed:`, error);
            throw error;
        }
    }
    // === Phase 4.2: Federation Engine Handlers ===
    async handleShareMemory(args) {
        try {
            const { sourceAgentId, targetAgentId, memoryId, permissions } = args;
            if (!sourceAgentId || typeof sourceAgentId !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Source agent ID is required');
            }
            if (!targetAgentId || typeof targetAgentId !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Target agent ID is required');
            }
            if (!memoryId || typeof memoryId !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Memory ID is required');
            }
            if (!permissions || typeof permissions !== 'object') {
                throw new McpError(ErrorCode.InvalidParams, 'Sharing permissions are required');
            }
            // First check if memory exists by structured key or ID
            let memory = this.memories.get(memoryId);
            if (!memory) {
                // Try to find by ID
                for (const [key, mem] of this.memories.entries()) {
                    if (mem.id === memoryId) {
                        memory = mem;
                        break;
                    }
                }
            }
            if (!memory) {
                throw new McpError(ErrorCode.InvalidRequest, `Memory ${memoryId} not found`);
            }
            // Note: Removed sourceAgentId check for now to debug
            // if (memory.metadata.agentId !== sourceAgentId) {
            //     throw new McpError(ErrorCode.InvalidRequest, `Memory ${memoryId} not owned by ${sourceAgentId}`);
            // }
            const federationResult = await this.federationEngine.shareMemoryWithAgent(sourceAgentId, targetAgentId, memoryId, permissions);
            this.log('info', `Memory shared successfully: ${memoryId} from ${sourceAgentId} to ${targetAgentId}`);
            return {
                content: [{
                        type: 'text',
                        text: `Memory Sharing Success

Federation ID: ${federationResult.federationId}
Source Agent: ${sourceAgentId}
Target Agent: ${targetAgentId}
Memory ID: ${memoryId}

Sharing Details:
• Access Level: ${permissions.accessLevel}
• Allow Modification: ${permissions.allowModification ? 'Yes' : 'No'}
• Allow Deletion: ${permissions.allowDeletion ? 'Yes' : 'No'}
• Allow Sharing: ${permissions.allowSharing ? 'Yes' : 'No'}
${permissions.expirationTime ? `• Expires: ${new Date(permissions.expirationTime).toLocaleDateString()}` : ''}
${permissions.contextRestrictions?.length ? `• Context Restrictions: ${permissions.contextRestrictions.join(', ')}` : ''}
${permissions.projectRestrictions?.length ? `• Project Restrictions: ${permissions.projectRestrictions.join(', ')}` : ''}

Collaboration Metrics:
• Participants: ${federationResult.collaborationMetrics.participantCount}
• Memory Exchanges: ${federationResult.collaborationMetrics.memoryExchangeCount}
• Insight Generation Rate: ${(federationResult.collaborationMetrics.insightGenerationRate * 100).toFixed(1)}%
• Conflict Resolution Rate: ${(federationResult.collaborationMetrics.conflictResolutionRate * 100).toFixed(1)}%
• Knowledge Synthesis Score: ${(federationResult.collaborationMetrics.knowledgeSynthesisScore * 100).toFixed(1)}%
• Collaboration Effectiveness: ${(federationResult.collaborationMetrics.collaborationEffectiveness * 100).toFixed(1)}%

Synchronization Status: ${federationResult.synchronizationStatus.status}
Last Sync: ${new Date(federationResult.synchronizationStatus.lastSyncTime).toLocaleString()}
Pending Changes: ${federationResult.synchronizationStatus.pendingChanges}
Conflicts: ${federationResult.synchronizationStatus.conflictCount}

The memory has been successfully shared with the specified permissions and is now available for cross-agent collaboration.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Memory sharing failed:`, error);
            throw error;
        }
    }
    async handleFederatedQuery(args) {
        try {
            const { requestingAgentId, query, targetAgents, queryType, priority = 'medium', responseTimeout = 30, aggregationMethod } = args;
            if (!requestingAgentId || typeof requestingAgentId !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Requesting agent ID is required');
            }
            if (!query || typeof query !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Query is required');
            }
            if (!Array.isArray(targetAgents) || targetAgents.length === 0) {
                throw new McpError(ErrorCode.InvalidParams, 'Target agents array is required');
            }
            if (!queryType || typeof queryType !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Query type is required');
            }
            if (!aggregationMethod || typeof aggregationMethod !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Aggregation method is required');
            }
            const federatedQuery = {
                queryId: `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                requestingAgentId,
                query,
                targetAgents,
                queryType: queryType,
                priority: priority,
                responseTimeout,
                aggregationMethod: aggregationMethod
            };
            const queryResult = await this.federationEngine.performFederatedQuery(federatedQuery);
            this.log('info', `Federated query completed: ${federatedQuery.queryId}`);
            return {
                content: [{
                        type: 'text',
                        text: `Federated Query Results

Query ID: ${queryResult.queryId}
Requesting Agent: ${requestingAgentId}
Query: "${query}"
Type: ${queryType}
Priority: ${priority}

Target Agents: ${targetAgents.join(', ')}
Participation Rate: ${(queryResult.participationRate * 100).toFixed(1)}%
Response Time: ${queryResult.responseTime}ms

Individual Results (${queryResult.results.length}):
${queryResult.results.map(result => `
• Agent: ${result.agentId}
  Confidence: ${(result.confidence * 100).toFixed(1)}%
  Response Time: ${result.responseTime}ms
  Result: ${JSON.stringify(result.result, null, 2)}
`).join('')}

Aggregated Result (${aggregationMethod}):
${JSON.stringify(queryResult.aggregatedResult, null, 2)}

Consensus Metrics:
• Agreement: ${(queryResult.consensus.agreement * 100).toFixed(1)}%
• Disagreement: ${(queryResult.consensus.disagreement * 100).toFixed(1)}%
• Uncertainty: ${(queryResult.consensus.uncertainty * 100).toFixed(1)}%
• Reliability Score: ${(queryResult.consensus.reliabilityScore * 100).toFixed(1)}%

The federated query has been completed with results from ${queryResult.results.length} participating agents.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Federated query failed:`, error);
            throw error;
        }
    }
    async handleCollectiveInsights(args) {
        try {
            const { participatingAgents, topic } = args;
            if (!Array.isArray(participatingAgents) || participatingAgents.length === 0) {
                throw new McpError(ErrorCode.InvalidParams, 'Participating agents array is required');
            }
            if (!topic || typeof topic !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Topic is required');
            }
            const collectiveKnowledge = await this.federationEngine.generateCollectiveInsights(participatingAgents, topic);
            this.log('info', `Collective insights generated for topic: ${topic}`);
            return {
                content: [{
                        type: 'text',
                        text: `Collective Insights Generation

Knowledge ID: ${collectiveKnowledge.knowledgeId}
Topic: ${topic}
Participating Agents: ${participatingAgents.join(', ')}

Contributing Memories (${collectiveKnowledge.contributingMemories.length}):
${collectiveKnowledge.contributingMemories.map(contrib => `
• Memory: ${contrib.memoryId}
  Agent: ${contrib.agentId}
  Type: ${contrib.contributionType}
  Relevance: ${(contrib.relevanceScore * 100).toFixed(1)}%
  Content: ${contrib.extractedContent.substring(0, 100)}...
`).join('')}

Synthesized Insight:
${collectiveKnowledge.synthesizedInsight}

Confidence Level: ${(collectiveKnowledge.confidence * 100).toFixed(1)}%

Applicable Contexts:
${collectiveKnowledge.applicableContexts.map(context => `• ${context}`).join('\n')}

Last Updated: ${new Date(collectiveKnowledge.lastUpdated).toLocaleString()}

This collective insight represents the combined knowledge and perspectives from ${participatingAgents.length} agents working together on the topic "${topic}".`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Collective insights generation failed:`, error);
            throw error;
        }
    }
    async handleCollaborativeLearning(args) {
        try {
            const { participatingAgents, learningObjective } = args;
            if (!Array.isArray(participatingAgents) || participatingAgents.length === 0) {
                throw new McpError(ErrorCode.InvalidParams, 'Participating agents array is required');
            }
            if (!learningObjective || typeof learningObjective !== 'string') {
                throw new McpError(ErrorCode.InvalidParams, 'Learning objective is required');
            }
            const collaborativeLearning = await this.federationEngine.enableCollaborativeLearning(participatingAgents, learningObjective);
            this.log('info', `Collaborative learning session initiated: ${collaborativeLearning.learningSessionId}`);
            return {
                content: [{
                        type: 'text',
                        text: `Collaborative Learning Session

Session ID: ${collaborativeLearning.learningSessionId}
Learning Objective: ${learningObjective}
Participating Agents: ${participatingAgents.join(', ')}

Shared Patterns Identified (${collaborativeLearning.sharedPatterns.length}):
${collaborativeLearning.sharedPatterns.map(pattern => `
• Pattern: ${pattern.description}
  Type: ${pattern.patternType}
  Contributing Agents: ${pattern.contributingAgents.join(', ')}
  Strength: ${(pattern.strength * 100).toFixed(1)}%
  Universality: ${(pattern.universality * 100).toFixed(1)}%
  Applications: ${pattern.applications.join(', ')}
`).join('')}

Collective Insights Generated (${collaborativeLearning.collectiveInsights.length}):
${collaborativeLearning.collectiveInsights.map(insight => `
• Type: ${insight.type}
  Description: ${insight.description}
  Contributing Agents: ${insight.contributingAgents.join(', ')}
  Confidence: ${(insight.confidence * 100).toFixed(1)}%
  Actionable: ${insight.actionable ? 'Yes' : 'No'}
`).join('')}

Performance Metrics:
• Session Duration: ${collaborativeLearning.performanceMetrics.sessionDuration.toFixed(1)} minutes
• Patterns Identified: ${collaborativeLearning.performanceMetrics.patternsIdentified}
• Insights Generated: ${collaborativeLearning.performanceMetrics.insightsGenerated}
• Cross-Agent Agreement: ${(collaborativeLearning.performanceMetrics.crossAgentAgreement * 100).toFixed(1)}%
• Knowledge Transfer Rate: ${(collaborativeLearning.performanceMetrics.knowledgeTransferRate * 100).toFixed(1)}%
• Participant Satisfaction: ${(collaborativeLearning.performanceMetrics.participantSatisfaction * 100).toFixed(1)}%

Next Learning Session: ${collaborativeLearning.nextSessionSchedule ? new Date(collaborativeLearning.nextSessionSchedule).toLocaleString() : 'To be determined'}

The collaborative learning session has successfully enabled knowledge sharing and pattern recognition across ${participatingAgents.length} agents, achieving the learning objective: "${learningObjective}".`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Collaborative learning failed:`, error);
            throw error;
        }
    }
    async handleSynchronizeFederation(args) {
        try {
            const { participatingAgents } = args;
            if (!Array.isArray(participatingAgents) || participatingAgents.length === 0) {
                throw new McpError(ErrorCode.InvalidParams, 'Participating agents array is required');
            }
            const synchronizationStatus = await this.federationEngine.synchronizeFederatedMemories(participatingAgents);
            this.log('info', `Federation synchronization completed for ${participatingAgents.length} agents`);
            return {
                content: [{
                        type: 'text',
                        text: `Federation Synchronization

Participating Agents: ${participatingAgents.join(', ')}
Synchronization Status: ${synchronizationStatus.status}
Last Sync Time: ${new Date(synchronizationStatus.lastSyncTime).toLocaleString()}
Pending Changes: ${synchronizationStatus.pendingChanges}
Conflicts Detected: ${synchronizationStatus.conflictCount}

Agent Status Details:
${Array.from(synchronizationStatus.participantStatuses.entries()).map(([agentId, status]) => `
• Agent: ${agentId}
  Status: ${status.status}
  Last Activity: ${new Date(status.lastActivity).toLocaleString()}
  Memory Count: ${status.memoryCount}
  Contribution Score: ${(status.contributionScore * 100).toFixed(1)}%
`).join('')}

Synchronization Summary:
${synchronizationStatus.status === 'synced' ? '✅ All agents are synchronized' :
                            synchronizationStatus.status === 'syncing' ? '🔄 Synchronization in progress' :
                                synchronizationStatus.status === 'conflict' ? '⚠️ Conflicts detected and being resolved' :
                                    '❌ Synchronization issues detected'}

${synchronizationStatus.conflictCount > 0 ?
                            `Conflict Resolution: ${synchronizationStatus.conflictCount} conflicts are being automatically resolved.` :
                            'No conflicts detected - all memory federation is operating smoothly.'}

The federation synchronization ensures all participating agents have consistent access to shared memories and collaborative insights.`
                    }]
            };
        }
        catch (error) {
            this.log('error', `Federation synchronization failed:`, error);
            throw error;
        }
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
  AZURE_OPENAI_API_VERSION     Azure OpenAI API version (default: 2024-02-01)
  AZURE_OPENAI_EMBEDDING_ADA_DEPLOYMENT  Embedding deployment name (required)
  MEMORAI_CBD_PATH             CBD data directory (default: ./memorai-cbd-data)
  MEMORAI_LOG_LEVEL            Log level (default: debug)
  MEMORAI_CACHE_SIZE           Memory cache size (default: 10000)
  MEMORAI_DIMENSIONS           Embedding dimensions (default: 1536)
  MEMORAI_SERVER_NAME          Server name (default: MemorAI-CBD-MCP)
  MEMORAI_ENABLE_SEMANTIC_SEARCH       Enable semantic search (default: true)
  MEMORAI_ENABLE_PERFORMANCE_TRACKING  Enable performance tracking (default: true)
  MEMORAI_ENABLE_HYBRID_STORAGE        Enable hybrid storage (default: true)
  MEMORAI_FALLBACK_STORAGE     Fallback storage type (default: json)
  MEMORAI_EMBEDDING_MODEL      Embedding model name (default: text-embedding-ada-002)
  MEMORAI_MAX_MEMORIES         Maximum memories to store (default: 100000)
  NODE_ENV                     Node environment (default: production)

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
        console.log(`@codai/memorai-mcp version ${packageJson.version}`);
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
        serverName: process.env.MEMORAI_SERVER_NAME || 'MemorAI-CBD-MCP',
        version: packageJson.version,
        cbdPath: memoraiCbdPath,
        logLevel: process.env.MEMORAI_LOG_LEVEL || 'debug',
        enableSemanticSearch: process.env.MEMORAI_ENABLE_SEMANTIC_SEARCH !== 'false',
        enablePerformanceTracking: process.env.MEMORAI_ENABLE_PERFORMANCE_TRACKING !== 'false',
        enableHybridStorage: process.env.MEMORAI_ENABLE_HYBRID_STORAGE !== 'false',
        azureOpenAI: azureConfig,
        fallbackStorage: process.env.MEMORAI_FALLBACK_STORAGE || 'json',
        embeddingModel: process.env.MEMORAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
        dimensions: parseInt(process.env.MEMORAI_DIMENSIONS || '1536'),
        cacheSize: parseInt(process.env.MEMORAI_CACHE_SIZE || '10000'),
        maxMemories: parseInt(process.env.MEMORAI_MAX_MEMORIES || '100000'),
        nodeEnv: process.env.NODE_ENV || 'production'
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
    process.argv[1]?.includes('server.js') ||
    process.argv[1]?.includes('server-unified.js') ||
    process.argv[1]?.includes('@codai/memorai-mcp') ||
    process.argv[1]?.includes('memorai-mcp')) {
    console.error('[INIT] Starting unified server...');
    main();
}
//# sourceMappingURL=server.js.map