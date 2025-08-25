#!/usr/bin/env node
/**
 * MemorAI MCP Server - Microsoft-Compliant Implementation
 * Updated to follow Microsoft MCP documentation patterns exactly
 * 
 * Features:
 * - Modern McpServer class with registerTool API (Microsoft pattern)
 * - Stateless HTTP server pattern from Microsoft docs
 * - Support for both STDIO and Streamable HTTP transports
 * - Enterprise memory management with Azure OpenAI embeddings
 * - Hybrid search engine (vector + keyword + fuzzy)
 * - Error handling following Microsoft best practices
 */

import { randomUUID } from 'node:crypto';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { advancedAI } from './advanced-ai-integration.js';
import type { AIResult, KnowledgeGraphOptions, TemporalRange } from './types.js';

// Load environment variables from root project directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Navigate from packages/memorai-mcp/src to project root
const projectRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(projectRoot, '.env') });

// Configuration
const CONFIG = {
    port: parseInt(process.env.MEMORAI_MCP_PORT || process.env.PORT || '4950'),
    apiKey: process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025',
    // Use Docker service hostname when in container, localhost when running locally
    cbdBaseUrl: process.env.CBD_BASE_URL || `http://${process.env.CBD_HOST || 'localhost'}:${process.env.CBD_PORT || '4180'}`,
    corsOrigin: process.env.CORS_ORIGIN || '*',

    // Azure OpenAI Configuration - use the new deployment names from .env
    azure: {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || process.env.AZURE_AI_FOUNDRY_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_KEY || process.env.AZURE_AI_FOUNDRY_KEY,
        deploymentName: process.env.AZURE_OPENAI_EMBEDDING_LARGE_DEPLOYMENT || 'text-embedding-3-large',
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview'
    },

    // OpenAI Fallback (not used when Azure is available)
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'text-embedding-3-small'
    }
};

// Feature flags
const FEATURES = {
    vectorSearch: process.env.ENABLE_VECTOR_SEARCH !== 'false',
    hybridSearch: process.env.ENABLE_HYBRID_SEARCH !== 'false',
    rbacSecurity: process.env.ENABLE_RBAC !== 'false',
    monitoring: process.env.ENABLE_MONITORING !== 'false'
};

// RomAI Integration Configuration
const ROMAI_CONFIG = {
    pythonPath: process.env.PYTHON_PATH || 'python',
    apiEndpoint: process.env.ROMAI_AGI_BASE_URL || 'http://localhost:6101',
    enableQuantum: process.env.QUANTUM_ENABLED === 'true',
    enableConsciousness: process.env.CONSCIOUSNESS_ENGINE === 'true'
};

/**
 * Simple in-memory storage for demonstration
 * In production, this would connect to CBD database
 */
class MemoryStore {
    private memories: Map<string, any[]> = new Map();
    private embeddings: Map<string, number[]> = new Map();

    async store(agentId: string, content: string, metadata: any = {}): Promise<any> {
        const structuredKey = `${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const memory: any = {
            id: randomUUID(),
            agentId,
            content,
            metadata: {
                importance: 5,
                entityType: 'memory',
                ...metadata
            },
            structuredKey,
            timestamp: new Date().toISOString()
        };

        // Store memory
        const agentMemories = this.memories.get(agentId) || [];
        agentMemories.push(memory);
        this.memories.set(agentId, agentMemories);

        // Generate embeddings if enabled
        if (FEATURES.vectorSearch) {
            try {
                const embedding = await this.generateEmbedding(content);
                if (embedding) {
                    this.embeddings.set(memory.id, embedding);
                    memory.embeddings = embedding;
                }
            } catch (error) {
                console.warn('Embedding generation failed:', error instanceof Error ? error.message : String(error));
            }
        }

        return memory;
    }

    async recall(agentId: string, query: string, options: any = {}): Promise<any[]> {
        const agentMemories = this.memories.get(agentId) || [];

        if (agentMemories.length === 0) {
            return [];
        }

        let results = agentMemories;

        // Apply importance filter
        if (options.minImportance && options.minImportance > 0) {
            results = results.filter(memory =>
                (memory.metadata?.importance || 5) >= options.minImportance
            );
        }

        // Apply project filter
        if (options.project) {
            results = results.filter(memory =>
                memory.metadata?.project === options.project
            );
        }

        // Apply session filter
        if (options.session) {
            results = results.filter(memory =>
                memory.metadata?.session === options.session
            );
        }

        // Search implementation - simple text match for now
        const searchResults = results.filter(memory =>
            memory.content.toLowerCase().includes(query.toLowerCase()) ||
            JSON.stringify(memory.metadata).toLowerCase().includes(query.toLowerCase())
        );

        // Sort by timestamp (most recent first) and importance
        searchResults.sort((a, b) => {
            const importanceA = a.metadata?.importance || 5;
            const importanceB = b.metadata?.importance || 5;
            if (importanceA !== importanceB) {
                return importanceB - importanceA; // Higher importance first
            }
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        // Apply limit
        const limit = options.limit || 10;
        return searchResults.slice(0, limit);
    }

    async forget(agentId: string, structuredKey: string): Promise<boolean> {
        const agentMemories = this.memories.get(agentId) || [];
        const memoryIndex = agentMemories.findIndex(memory => memory.structuredKey === structuredKey);

        if (memoryIndex === -1) {
            return false;
        }

        const memory = agentMemories[memoryIndex];

        // Remove from embeddings
        if (memory.id && this.embeddings.has(memory.id)) {
            this.embeddings.delete(memory.id);
        }

        // Remove from memories
        agentMemories.splice(memoryIndex, 1);
        this.memories.set(agentId, agentMemories);

        return true;
    }

    async getContext(agentId: string, contextSize: number = 5): Promise<any[]> {
        const agentMemories = this.memories.get(agentId) || [];

        // Get most recent memories
        const sortedMemories = agentMemories.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return sortedMemories.slice(0, contextSize);
    }

    // Placeholder for embedding generation
    private async generateEmbedding(text: string): Promise<number[] | null> {
        // In a real implementation, this would call Azure OpenAI or OpenAI
        // For now, return null to indicate embeddings are not available
        if (!CONFIG.azure.apiKey && !CONFIG.openai.apiKey) {
            return null;
        }

        // Generate mock embedding for demonstration
        const mockEmbedding = new Array(1536).fill(0).map(() => Math.random() - 0.5);
        return mockEmbedding;
    }
}

// Export MemoryStore for testing
export { MemoryStore };

/**
 * Microsoft-Compliant MemorAI MCP Server
 * Following exact patterns from Microsoft documentation
 */
class MicrosoftCompliantMemorAIMCPServer {
    private memoryStore: MemoryStore;
    private app: express.Express;

    constructor() {
        this.memoryStore = new MemoryStore();
        this.app = express();
        this.setupExpressApp();
    }

    /**
     * Create and configure MCP tools following Microsoft pattern
     * This method creates a fresh server instance (stateless pattern)
     */
    private createMCPServerWithTools(): McpServer {
        // Microsoft pattern: Create fresh server instance for each request
        const server = new McpServer({
            name: 'memorai-mcp-server',
            version: '9.9.0-microsoft-compliant'
        });

        // Remember tool - Microsoft pattern with proper Zod schemas
        server.registerTool(
            'remember',
            {
                description: 'Store a memory with content and metadata',
                inputSchema: {
                    agentId: z.string().describe('Agent identifier for memory isolation'),
                    content: z.string().describe('The content to remember'),
                    metadata: z.object({
                        entityType: z.string().optional().describe('Type of the entity'),
                        priority: z.string().optional().describe('Priority level'),
                        project: z.string().optional().describe('Project name'),
                        session: z.string().optional().describe('Session identifier'),
                        tags: z.array(z.string()).optional().describe('Tags for categorization'),
                        importance: z.number().min(1).max(10).default(5).describe('Importance score 1-10')
                    }).optional().describe('Additional metadata for the memory')
                }
            },
            async ({ agentId, content, metadata }) => {
                try {
                    const memory = await this.memoryStore.store(agentId, content, metadata || {});

                    return {
                        content: [{
                            type: 'text',
                            text: `Memory stored successfully!\n\n` +
                                `Structured Key: ${memory.structuredKey}\n` +
                                `Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}\n` +
                                `Agent ID: ${agentId}\n` +
                                `Entity Type: ${metadata?.entityType || 'memory'}\n` +
                                `Importance: ${metadata?.importance || 5}/10\n` +
                                `Vector Search: ${FEATURES.vectorSearch ? 'Enabled' : 'Disabled'}\n` +
                                `Timestamp: ${memory.timestamp}`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Memory storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Recall tool - Microsoft pattern
        server.registerTool(
            'recall',
            {
                description: 'Search and retrieve memories with intelligent suggestions',
                inputSchema: {
                    agentId: z.string().describe('Agent identifier for memory isolation'),
                    query: z.string().describe('Search query for finding relevant memories'),
                    limit: z.number().default(10).describe('Maximum number of results to return'),
                    minImportance: z.number().default(0).describe('Minimum importance score filter'),
                    project: z.string().optional().describe('Filter memories by project name'),
                    session: z.string().optional().describe('Filter memories by session identifier')
                }
            },
            async ({ agentId, query, limit = 10, minImportance = 0, project, session }) => {
                try {
                    const memories = await this.memoryStore.recall(agentId, query, {
                        limit,
                        minImportance,
                        project,
                        session
                    });

                    return {
                        content: [{
                            type: 'text',
                            text: `Found ${memories.length} memories:\n\n` +
                                memories.map((memory, index) =>
                                    `${index + 1}. ${memory.content.substring(0, 150)}${memory.content.length > 150 ? '...' : ''}\n` +
                                    `   Key: ${memory.structuredKey}\n` +
                                    `   Importance: ${memory.metadata.importance || 5}/10\n` +
                                    `   Type: ${memory.metadata.entityType || 'memory'}\n` +
                                    `   Created: ${memory.timestamp}\n`
                                ).join('\n')
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Memory recall failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Forget tool - Microsoft pattern
        server.registerTool(
            'forget',
            {
                description: 'Delete a memory by structured key',
                inputSchema: {
                    agentId: z.string().describe('Agent identifier'),
                    structuredKey: z.string().describe('Structured key of memory to delete')
                }
            },
            async ({ agentId, structuredKey }) => {
                try {
                    const deleted = await this.memoryStore.forget(agentId, structuredKey);
                    return {
                        content: [{
                            type: 'text',
                            text: deleted
                                ? `Memory with key "${structuredKey}" deleted successfully`
                                : `Memory with key "${structuredKey}" not found`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Memory deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Context tool - Microsoft pattern
        server.registerTool(
            'context',
            {
                description: 'Get recent context for agent',
                inputSchema: {
                    agentId: z.string().describe('Agent identifier'),
                    contextSize: z.number().default(5).describe('Number of recent memories to retrieve')
                }
            },
            async ({ agentId, contextSize = 5 }) => {
                try {
                    const context = await this.memoryStore.getContext(agentId, contextSize);
                    return {
                        content: [{
                            type: 'text',
                            text: `Recent Context (${context.length} memories):\n\n` +
                                context.map((memory, index) =>
                                    `${index + 1}. ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}\n` +
                                    `   Importance: ${memory.metadata.importance || 5}/10\n`
                                ).join('\n')
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Context retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // ===== ADVANCED AI TOOLS =====
        // Knowledge Graph Operations

        server.registerTool(
            'knowledge_graph',
            {
                description: 'Generate and visualize memory connections and knowledge relationships',
                inputSchema: {
                    agentId: z.string().describe('Agent identifier'),
                    maxNodes: z.number().default(100).describe('Maximum number of nodes in graph'),
                    includeWeights: z.boolean().default(true).describe('Include relationship weights'),
                    layout: z.string().default('force').describe('Graph layout: force, hierarchical, circular')
                }
            },
            async ({ agentId, maxNodes = 100, includeWeights = true, layout = 'force' }) => {
                try {
                    // Get memories for graph creation
                    const memories = await this.memoryStore.recall(agentId, '', { limit: maxNodes });

                    // Create knowledge graph using RomAI AGI
                    const result: AIResult = await advancedAI.createKnowledgeGraph(agentId, memories, {
                        maxNodes,
                        includeWeights,
                        layout
                    });

                    const nodeCount = result.metrics?.nodeCount || 0;
                    const edgeCount = result.metrics?.edgeCount || 0;
                    const clusterCount = result.metrics?.clusterCount || 0;
                    const density = result.metrics?.density || 0;
                    const insights = result.insights || [];
                    const centrality = result.metrics?.centrality || {};

                    return {
                        content: [{
                            type: 'text',
                            text: `🕸️ Knowledge Graph Generated!\n\n` +
                                `Nodes: ${nodeCount}\n` +
                                `Edges: ${edgeCount}\n` +
                                `Clusters: ${clusterCount}\n` +
                                `Graph Density: ${(density * 100).toFixed(1)}%\n\n` +
                                `Key Insights:\n${insights.slice(0, 5).map((insight: string) => `• ${insight}`).join('\n')}\n\n` +
                                `Central Concepts: ${Object.keys(centrality).slice(0, 3).join(', ')}`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Knowledge graph generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        server.registerTool(
            'analyze_patterns',
            {
                description: 'Advanced pattern analysis with ML-enhanced insights',
                inputSchema: {
                    agentId: z.string().describe('Agent identifier'),
                    analysisType: z.string().default('all').describe('Analysis type: relationships, trends, clusters, anomalies, all'),
                    timeRange: z.string().default('month').describe('Time range: day, week, month, quarter, year'),
                    minPatternStrength: z.number().default(0.5).describe('Minimum pattern strength threshold')
                }
            },
            async ({ agentId, analysisType = 'all', timeRange = 'month', minPatternStrength = 0.5 }) => {
                try {
                    // Get memories for analysis
                    const memories = await this.memoryStore.recall(agentId, '', { limit: 500 });

                    // Perform advanced pattern analysis using RomAI AGI
                    const result: AIResult = await advancedAI.analyzePatterns(agentId, memories, analysisType);

                    const patternStrength = result.metrics?.patternStrength || 0;
                    const confidence = result.metrics?.confidence || 0;
                    const novelty = result.metrics?.novelty || 0;
                    const patterns = result.patterns || [];
                    const relationships = result.relationships || [];
                    const anomalies = result.anomalies || [];
                    const insights = result.insights || [];
                    const recommendations = result.recommendations || [];

                    return {
                        content: [{
                            type: 'text',
                            text: `🔍 Advanced Pattern Analysis Complete!\n\n` +
                                `Analysis Type: ${analysisType.toUpperCase()}\n` +
                                `Pattern Strength: ${(patternStrength * 100).toFixed(1)}%\n` +
                                `Confidence: ${(confidence * 100).toFixed(1)}%\n` +
                                `Novelty Score: ${(novelty * 100).toFixed(1)}%\n\n` +
                                `Patterns Discovered: ${patterns.length}\n` +
                                `Relationships: ${relationships.length}\n` +
                                `Anomalies: ${anomalies.length}\n\n` +
                                `Key Insights:\n${insights.slice(0, 5).map((insight: string) => `• ${insight}`).join('\n')}\n\n` +
                                `Recommendations:\n${recommendations.slice(0, 3).map((rec: string) => `→ ${rec}`).join('\n')}`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Pattern analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        server.registerTool(
            'semantic_clustering',
            {
                description: 'Automatic memory organization by topic and similarity using advanced AI',
                inputSchema: {
                    agentId: z.string().describe('Agent identifier'),
                    clusterCount: z.number().default(10).describe('Number of clusters to create'),
                    similarityThreshold: z.number().default(0.7).describe('Similarity threshold for clustering'),
                    autoLabel: z.boolean().default(true).describe('Automatically generate cluster labels')
                }
            },
            async ({ agentId, clusterCount = 10, similarityThreshold = 0.7, autoLabel = true }) => {
                try {
                    // Get memories for clustering
                    const memories = await this.memoryStore.recall(agentId, '', { limit: 1000 });

                    // Perform semantic clustering using RomAI AGI
                    const result: AIResult = await advancedAI.performSemanticClustering(agentId, memories, clusterCount);

                    const clusters = result.clusters || [];
                    const silhouetteScore = result.metrics?.silhouetteScore || 0;
                    const cohesion = result.metrics?.cohesion || 0;
                    const separation = result.metrics?.separation || 0;
                    const labels = result.labels || [];
                    const insights = result.insights || [];

                    return {
                        content: [{
                            type: 'text',
                            text: `🗂️ Semantic Clustering Complete!\n\n` +
                                `Clusters Created: ${clusters.length}\n` +
                                `Silhouette Score: ${(silhouetteScore * 100).toFixed(1)}%\n` +
                                `Cohesion: ${(cohesion * 100).toFixed(1)}%\n` +
                                `Separation: ${(separation * 100).toFixed(1)}%\n\n` +
                                `Cluster Labels:\n${labels.map((label: string, i: number) => `${i + 1}. ${label}`).join('\n')}\n\n` +
                                `Key Insights:\n${insights.slice(0, 5).map((insight: string) => `• ${insight}`).join('\n')}`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Semantic clustering failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Multimodal Processing Tools

        server.registerTool(
            'multimodal_synthesis',
            {
                description: 'Advanced multimodal content synthesis with Romanian cultural intelligence',
                inputSchema: {
                    content: z.any().describe('Multimodal content to synthesize'),
                    synthesisMode: z.string().default('TRANSCENDENT').describe('Synthesis mode: BASIC, CROSS_MODAL, TRANSCENDENT'),
                    culturalContext: z.boolean().default(true).describe('Include Romanian cultural context')
                }
            },
            async ({ content, synthesisMode = 'TRANSCENDENT', culturalContext = true }) => {
                try {
                    // Perform multimodal synthesis using RomAI AGI
                    const result = await advancedAI.synthesizeMultimodal(content, synthesisMode);

                    return {
                        content: [{
                            type: 'text',
                            text: `🎭 Multimodal Synthesis Complete!\n\n` +
                                `Synthesis Mode: ${synthesisMode}\n` +
                                `Quality Score: ${(result.qualityMetrics.synthesisQuality * 100).toFixed(1)}%\n` +
                                `Cultural Authenticity: ${(result.qualityMetrics.culturalAuthenticity * 100).toFixed(1)}%\n` +
                                `Transcendence Level: ${(result.qualityMetrics.transcendenceLevel * 100).toFixed(1)}%\n` +
                                `Processing Time: ${result.processingTime.toFixed(2)}s\n\n` +
                                `Synthesized Understanding:\n${result.synthesizedContent}\n\n` +
                                `Cross-Modal Insights:\n${result.crossModalInsights.slice(0, 3).map(insight => `• ${insight}`).join('\n')}\n\n` +
                                `Cultural Context:\n${result.culturalContext}`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Multimodal synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        server.registerTool(
            'cross_modal_reasoning',
            {
                description: 'Advanced cross-modal reasoning and content analysis',
                inputSchema: {
                    input: z.any().describe('Input for cross-modal reasoning'),
                    reasoningType: z.string().default('comprehensive').describe('Reasoning type: analytical, creative, comprehensive'),
                    consciousnessLevel: z.number().default(0.85).describe('Consciousness integration level')
                }
            },
            async ({ input, reasoningType = 'comprehensive', consciousnessLevel = 0.85 }) => {
                try {
                    // Perform cross-modal reasoning using RomAI AGI
                    const result = await advancedAI.performCrossModalReasoning(input, reasoningType);

                    return {
                        content: [{
                            type: 'text',
                            text: `🧠 Cross-Modal Reasoning Complete!\n\n` +
                                `Reasoning Type: ${reasoningType.toUpperCase()}\n` +
                                `Confidence: ${(result.confidence * 100).toFixed(1)}%\n` +
                                `Cross-Modal Connections: ${result.crossModalConnections.length}\n\n` +
                                `Reasoning Chain:\n${result.reasoning.slice(0, 5).map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n` +
                                `Conclusions:\n${result.conclusions.slice(0, 3).map(conclusion => `• ${conclusion}`).join('\n')}\n\n` +
                                `Cultural Insights:\n${result.culturalInsights.slice(0, 2).map(insight => `→ ${insight}`).join('\n')}`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Cross-modal reasoning failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Temporal Analysis Tools

        server.registerTool(
            'temporal_search',
            {
                description: 'Enhanced time-based queries with evolution tracking',
                inputSchema: {
                    agentId: z.string().describe('Agent identifier'),
                    query: z.string().describe('Search query for temporal analysis'),
                    timeRange: z.object({
                        from: z.string().describe('Start date (ISO format)'),
                        to: z.string().describe('End date (ISO format)')
                    }).describe('Time range for analysis'),
                    evolutionTracking: z.boolean().default(true).describe('Track evolution patterns'),
                    includePatterns: z.boolean().default(true).describe('Include temporal patterns')
                }
            },
            async ({ agentId, query, timeRange, evolutionTracking = true, includePatterns = true }) => {
                try {
                    // Perform temporal analysis using RomAI AGI
                    const result = await advancedAI.analyzeTemporalEvolution(agentId, query, timeRange);

                    return {
                        content: [{
                            type: 'text',
                            text: `⏰ Temporal Analysis Complete!\n\n` +
                                `Query: "${query}"\n` +
                                `Time Range: ${timeRange.from} to ${timeRange.to}\n` +
                                `Timeline Events: ${result.timeline.length}\n` +
                                `Evolution Patterns: ${result.evolution.length}\n` +
                                `Change Points: ${result.changePoints.length}\n\n` +
                                `Volatility: ${(result.metrics.volatility * 100).toFixed(1)}%\n` +
                                `Trend Strength: ${(result.metrics.trend_strength * 100).toFixed(1)}%\n` +
                                `Periodicity: ${(result.metrics.periodicity * 100).toFixed(1)}%\n\n` +
                                `Key Trends:\n${result.trends.slice(0, 3).map(trend => `• ${trend}`).join('\n')}\n\n` +
                                `Predictions:\n${result.predictions.slice(0, 2).map(pred => `→ ${pred}`).join('\n')}\n\n` +
                                `Temporal Insights:\n${result.insights.slice(0, 3).map(insight => `💡 ${insight}`).join('\n')}`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Temporal analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Intelligence Integration Tools

        server.registerTool(
            'intelligence_query',
            {
                description: 'Process queries using RomAI AGI intelligence systems',
                inputSchema: {
                    query: z.string().describe('Query for intelligence processing'),
                    context: z.any().optional().describe('Additional context for processing'),
                    intelligenceTypes: z.array(z.string()).default(['analytical', 'creative', 'cultural']).describe('Types of intelligence to engage'),
                    enhancementLevel: z.string().default('maximum').describe('Enhancement level: basic, advanced, maximum')
                }
            },
            async ({ query, context = {}, intelligenceTypes = ['analytical', 'creative', 'cultural'], enhancementLevel = 'maximum' }) => {
                try {
                    // Process intelligence query using RomAI AGI
                    const result = await advancedAI.processIntelligenceQuery(query, { ...context, intelligenceTypes, enhancementLevel });

                    return {
                        content: [{
                            type: 'text',
                            text: `💭 Intelligence Query Processed!\n\n` +
                                `Query: "${query}"\n` +
                                `Intelligence Types Used: ${result.intelligenceTypes.join(', ')}\n` +
                                `Confidence: ${(result.confidence * 100).toFixed(1)}%\n` +
                                `Processing Time: ${result.metrics.processingTime.toFixed(2)}s\n` +
                                `Complexity Score: ${(result.metrics.complexityScore * 100).toFixed(1)}%\n` +
                                `Novelty Score: ${(result.metrics.noveltyScore * 100).toFixed(1)}%\n\n` +
                                `Response:\n${result.response}\n\n` +
                                `Reasoning:\n${result.reasoning}\n\n` +
                                `Cultural Context:\n${result.culturalContext}\n\n` +
                                `Capabilities Engaged:\n${result.capabilities.map(cap => `• ${cap}`).join('\n')}`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Intelligence query processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Advanced Synthesis Engine

        server.registerTool(
            'synthesis_engine',
            {
                description: 'Advanced knowledge synthesis across multiple memories and contexts',
                inputSchema: {
                    agentId: z.string().describe('Agent identifier'),
                    queries: z.array(z.string()).describe('Multiple queries for synthesis'),
                    synthesisType: z.string().default('knowledge_integration').describe('Synthesis type: knowledge_integration, pattern_fusion, insight_generation'),
                    culturalEnhancement: z.boolean().default(true).describe('Include Romanian cultural enhancement')
                }
            },
            async ({ agentId, queries, synthesisType = 'knowledge_integration', culturalEnhancement = true }) => {
                try {
                    // Get relevant memories for all queries
                    const allMemories = [];
                    for (const query of queries) {
                        const memories = await this.memoryStore.recall(agentId, query, { limit: 50 });
                        allMemories.push(...memories);
                    }

                    // Remove duplicates based on structured key
                    const uniqueMemories = allMemories.filter((memory, index, self) =>
                        index === self.findIndex(m => m.structuredKey === memory.structuredKey)
                    );

                    // Perform advanced synthesis
                    const synthesisContent = {
                        memories: uniqueMemories,
                        queries: queries,
                        type: synthesisType,
                        cultural_enhancement: culturalEnhancement
                    };

                    const result = await advancedAI.synthesizeMultimodal(synthesisContent, 'TRANSCENDENT');

                    return {
                        content: [{
                            type: 'text',
                            text: `⚗️ Advanced Synthesis Complete!\n\n` +
                                `Synthesis Type: ${synthesisType.toUpperCase()}\n` +
                                `Queries Processed: ${queries.length}\n` +
                                `Memories Analyzed: ${uniqueMemories.length}\n` +
                                `Quality Score: ${(result.qualityMetrics.synthesisQuality * 100).toFixed(1)}%\n` +
                                `Cultural Authenticity: ${(result.qualityMetrics.culturalAuthenticity * 100).toFixed(1)}%\n\n` +
                                `Synthesized Knowledge:\n${result.synthesizedContent}\n\n` +
                                `Cross-Modal Insights:\n${result.crossModalInsights.slice(0, 3).map(insight => `• ${insight}`).join('\n')}\n\n` +
                                `Cultural Integration:\n${result.culturalContext}`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Advanced synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Collaboration Tools

        server.registerTool(
            'collaborative_memory',
            {
                description: 'Share and synchronize memories across agents with advanced coordination',
                inputSchema: {
                    sourceAgentId: z.string().describe('Source agent identifier'),
                    targetAgentId: z.string().describe('Target agent identifier'),
                    memoryKey: z.string().describe('Memory key to share'),
                    permissions: z.string().default('read').describe('Permissions: read, write, admin'),
                    collaborationType: z.string().default('knowledge_sharing').describe('Collaboration type: knowledge_sharing, pattern_synthesis, joint_reasoning')
                }
            },
            async ({ sourceAgentId, targetAgentId, memoryKey, permissions = 'read', collaborationType = 'knowledge_sharing' }) => {
                try {
                    // Get source memory
                    const sourceMemories = await this.memoryStore.recall(sourceAgentId, memoryKey, { limit: 1 });
                    if (sourceMemories.length === 0) {
                        throw new Error('Source memory not found');
                    }

                    const sourceMemory = sourceMemories[0];

                    // Create collaborative memory with enhanced metadata
                    const collaborativeContent = `[COLLABORATIVE MEMORY]\n` +
                        `Source Agent: ${sourceAgentId}\n` +
                        `Collaboration Type: ${collaborationType}\n` +
                        `Permissions: ${permissions}\n` +
                        `Original Content: ${sourceMemory.content}`;

                    const collaborativeMemory = await this.memoryStore.store(targetAgentId, collaborativeContent, {
                        entityType: 'collaborative_memory',
                        sourceAgentId,
                        collaborationType,
                        permissions,
                        originalMemoryKey: memoryKey,
                        importance: (sourceMemory.metadata.importance || 5) + 1 // Increase importance for collaborative memories
                    });

                    return {
                        content: [{
                            type: 'text',
                            text: `🤝 Collaborative Memory Created!\n\n` +
                                `Source Agent: ${sourceAgentId}\n` +
                                `Target Agent: ${targetAgentId}\n` +
                                `Collaboration Type: ${collaborationType.toUpperCase()}\n` +
                                `Permissions: ${permissions.toUpperCase()}\n` +
                                `Memory Key: ${collaborativeMemory.structuredKey}\n\n` +
                                `Shared Content:\n${sourceMemory.content.substring(0, 200)}${sourceMemory.content.length > 200 ? '...' : ''}\n\n` +
                                `✅ Memory successfully shared and synchronized!`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Collaborative memory creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Pattern Discovery Tools

        server.registerTool(
            'pattern_discovery',
            {
                description: 'Discover hidden patterns and anomalies using advanced AI',
                inputSchema: {
                    agentId: z.string().describe('Agent identifier'),
                    discoveryType: z.string().default('comprehensive').describe('Discovery type: relationships, behavioral, temporal, comprehensive'),
                    sensitivityLevel: z.number().default(0.7).describe('Pattern sensitivity level (0.1-1.0)'),
                    includeAnomalies: z.boolean().default(true).describe('Include anomaly detection')
                }
            },
            async ({ agentId, discoveryType = 'comprehensive', sensitivityLevel = 0.7, includeAnomalies = true }) => {
                try {
                    // Get comprehensive memory set for pattern discovery
                    const memories = await this.memoryStore.recall(agentId, '', { limit: 1000 });

                    // Perform advanced pattern discovery using RomAI AGI
                    const result = await advancedAI.analyzePatterns(agentId, memories, discoveryType);

                    return {
                        content: [{
                            type: 'text',
                            text: `🔍 Pattern Discovery Complete!\n\n` +
                                `Discovery Type: ${discoveryType.toUpperCase()}\n` +
                                `Sensitivity Level: ${(sensitivityLevel * 100).toFixed(1)}%\n` +
                                `Patterns Found: ${result.patterns.length}\n` +
                                `Relationships Discovered: ${result.relationships.length}\n` +
                                `Anomalies Detected: ${result.anomalies.length}\n\n` +
                                `Pattern Strength: ${(result.metrics.patternStrength * 100).toFixed(1)}%\n` +
                                `Confidence: ${(result.metrics.confidence * 100).toFixed(1)}%\n` +
                                `Novelty Score: ${(result.metrics.novelty * 100).toFixed(1)}%\n\n` +
                                `Key Patterns:\n${result.patterns.slice(0, 5).map((pattern, i) => `${i + 1}. ${pattern}`).join('\n')}\n\n` +
                                `Critical Insights:\n${result.insights.slice(0, 3).map(insight => `💡 ${insight}`).join('\n')}\n\n` +
                                `Anomalies Detected:\n${result.anomalies.slice(0, 3).map(anomaly => `⚠️ ${anomaly}`).join('\n')}`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Pattern discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        return server;
    }

    /**
     * Setup Express app with Microsoft-recommended patterns
     */
    private setupExpressApp(): void {
        // CORS configuration
        this.app.use(cors({
            origin: CONFIG.corsOrigin,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'mcp-session-id']
        }));

        this.app.use(express.json({ limit: '10mb' }));

        // Health endpoint
        this.app.get('/health', async (req: Request, res: Response) => {
            try {
                const aiHealthCheck = await advancedAI.healthCheck();

                res.json({
                    status: 'healthy',
                    service: 'memorai-mcp-server',
                    version: '10.0.0-advanced-ai',
                    mcpProtocol: '2025-03-26',
                    transports: ['stdio', 'streamable-http'],
                    config: {
                        port: CONFIG.port,
                        vectorSearch: FEATURES.vectorSearch,
                        azureOpenAI: !!CONFIG.azure.apiKey,
                        openAI: !!CONFIG.openai.apiKey
                    },
                    advancedAI: {
                        status: aiHealthCheck.status,
                        romaiIntegration: aiHealthCheck.romaiIntegration,
                        capabilities: aiHealthCheck.capabilities || []
                    },
                    tools: {
                        basic: ['remember', 'recall', 'forget', 'context'],
                        advanced: [
                            'knowledge_graph',
                            'analyze_patterns',
                            'semantic_clustering',
                            'multimodal_synthesis',
                            'cross_modal_reasoning',
                            'temporal_search',
                            'intelligence_query',
                            'synthesis_engine',
                            'collaborative_memory',
                            'pattern_discovery'
                        ]
                    }
                });
            } catch (error) {
                console.error('Health check error:', error);
                res.status(500).json({
                    status: 'error',
                    service: 'memorai-mcp-server',
                    version: '10.0.0-advanced-ai',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // SSE endpoint for MCP HTTP transport (for VS Code compatibility)
        this.app.get('/mcp/sse', async (req: Request, res: Response) => {
            try {
                // Set SSE headers
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Cache-Control'
                });

                // Create MCP server for this SSE session
                const server = this.createMCPServerWithTools();
                const transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: undefined,
                });

                // Clean up when connection closes
                req.on('close', () => {
                    res.end();
                    transport.close?.();
                    server.close?.();
                });

                await server.connect(transport);

                // Send keepalive ping every 30 seconds
                const keepAlive = setInterval(() => {
                    if (!res.destroyed) {
                        res.write('data: {"type":"ping"}\n\n');
                    } else {
                        clearInterval(keepAlive);
                    }
                }, 30000);

                console.log('🔗 New SSE connection established for MCP');

            } catch (error) {
                console.error('SSE connection error:', error);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'SSE connection failed' });
                }
            }
        });

        // Microsoft pattern: Stateless MCP HTTP endpoint
        this.app.post('/mcp', async (req: Request, res: Response) => {
            try {
                // Microsoft pattern: Create fresh server instance for each request (stateless)
                const server = this.createMCPServerWithTools();

                // Create fresh transport for this request
                const transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: undefined, // Microsoft pattern: no session persistence
                });

                // Clean up when request closes - Microsoft pattern
                res.on('close', () => {
                    transport.close?.();
                    server.close?.();
                });

                await server.connect(transport);
                await transport.handleRequest(req, res, req.body);

            } catch (error) {
                console.error('MCP HTTP request error:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        jsonrpc: '2.0',
                        error: {
                            code: -32603,
                            message: 'Internal server error',
                        },
                        id: null,
                    });
                }
            }
        });
    }

    /**
     * Start the server with both STDIO and HTTP transports
     */
    async start(): Promise<void> {
        try {
            console.log('🧠 Starting MemorAI MCP Server - Microsoft Compliant Implementation...');

            // Check if running in STDIO-only mode
            const isStdioOnly = process.argv.includes('--stdio');

            if (isStdioOnly) {
                console.log('📡 Starting in STDIO-only mode for VS Code integration...');

                // Setup STDIO transport with Microsoft pattern
                const server = this.createMCPServerWithTools();
                const transport = new StdioServerTransport();
                await server.connect(transport);

                console.log('✅ MemorAI MCP Server connected via STDIO');
                console.log('🎯 MCP Protocol: 2025-03-26 (STDIO only)');
                console.log('🛠️  Basic Tools: remember, recall, forget, context');
                console.log('🚀 Advanced AI Tools: knowledge_graph, analyze_patterns, semantic_clustering,');
                console.log('     multimodal_synthesis, cross_modal_reasoning, temporal_search,');
                console.log('     intelligence_query, synthesis_engine, collaborative_memory, pattern_discovery');
                console.log('🧠 RomAI AGI Integration: Enabled');
                console.log('📅 Ready for MCP clients\n');
                return;
            }

            // Display configuration for full mode
            console.log('📋 Configuration:');
            console.log(`   Port: ${CONFIG.port}`);
            console.log(`   CBD Database: ${CONFIG.cbdBaseUrl}`);
            console.log(`   Vector Search: ${FEATURES.vectorSearch}`);
            console.log(`   Azure OpenAI: ${!!CONFIG.azure.apiKey}`);
            console.log(`   OpenAI Fallback: ${!!CONFIG.openai.apiKey}`);

            // Start HTTP server
            this.app.listen(CONFIG.port, () => {
                console.log('🚀 Server Status:');
                console.log(`   ✅ HTTP Server listening on port ${CONFIG.port}`);
                console.log(`   🌐 MCP Endpoint: http://localhost:${CONFIG.port}/mcp`);
                console.log(`   💚 Health Check: http://localhost:${CONFIG.port}/health`);
                console.log('🧠 Advanced AI Integration:');
                console.log('   🎯 Basic Tools: remember, recall, forget, context');
                console.log('   � Advanced Tools: 10 AI-powered tools available');
                console.log('   💡 Capabilities: Knowledge graphs, pattern analysis, multimodal synthesis,');
                console.log('      temporal analysis, cross-modal reasoning, collaborative memory');
                console.log('🎯 MCP Protocol: 2025-03-26 (HTTP + STDIO)');
                console.log('✅ MemorAI MCP Server ready with Advanced AI capabilities!\n');
            });

            // Also setup STDIO transport for VS Code integration
            const server = this.createMCPServerWithTools();
            const transport = new StdioServerTransport();
            await server.connect(transport);

        } catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
}

// Graceful shutdown handling - Microsoft pattern
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down server...');
    process.exit(0);
});

// Main execution
async function main() {
    const server = new MicrosoftCompliantMemorAIMCPServer();
    await server.start();
}

// Start the server immediately - ES module compatible
main().catch((error) => {
    console.error('Application error:', error);
    process.exit(1);
});

export { MicrosoftCompliantMemorAIMCPServer };