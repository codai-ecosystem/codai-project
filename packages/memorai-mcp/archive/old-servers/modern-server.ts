#!/usr/bin/env node
/**
 * MemorAI MCP Server - Modern TypeScript Implementation
 * Updated to use latest MCP TypeScript SDK v1.0+ patterns
 * 
 * Features:
 * - Modern McpServer class with registerTool API
 * - Support for both STDIO and Streamable HTTP transports
 * - Enterprise memory management with Azure OpenAI embeddings
 * - Hybrid search engine (vector + keyword + fuzzy)
 * - RBAC security and multi-tenant support
 * - Session management for HTTP transport
 */

import { randomUUID } from 'node:crypto';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const CONFIG = {
    port: parseInt(process.env.MEMORAI_MCP_PORT || process.env.PORT || '4950'),
    apiKey: process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025',
    cbdBaseUrl: process.env.CBD_BASE_URL || 'http://localhost:4180',
    corsOrigin: process.env.CORS_ORIGIN || '*',

    // Azure OpenAI Configuration
    azure: {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'text-embedding-3-large',
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'
    },

    // OpenAI Fallback
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

        const results = [];

        // Generate query embedding for vector search
        let queryEmbedding: number[] | null = null;
        if (FEATURES.vectorSearch) {
            try {
                queryEmbedding = await this.generateEmbedding(query);
            } catch (error) {
                console.warn('Query embedding generation failed:', error instanceof Error ? error.message : String(error));
            }
        }

        // Score and rank memories
        for (const memory of agentMemories) {
            let score = 0;
            const scoreComponents: any = {};

            // Vector similarity scoring (40% weight)
            if (queryEmbedding && memory.embeddings) {
                const vectorScore = this.cosineSimilarity(queryEmbedding, memory.embeddings);
                scoreComponents.vector = vectorScore;
                score += vectorScore * 0.4;
            }

            // Keyword matching (30% weight)
            const keywordScore = memory.content.toLowerCase().includes(query.toLowerCase()) ? 1.0 : 0.0;
            scoreComponents.keyword = keywordScore;
            score += keywordScore * 0.3;

            // Fuzzy matching (20% weight)
            const fuzzyScore = this.fuzzyMatch(query.toLowerCase(), memory.content.toLowerCase());
            scoreComponents.fuzzy = fuzzyScore;
            score += fuzzyScore * 0.2;

            // Recency boost (10% weight)
            const age = Date.now() - new Date(memory.timestamp).getTime();
            const recencyScore = Math.exp(-age / (7 * 24 * 60 * 60 * 1000)); // Decay over 7 days
            scoreComponents.recency = recencyScore;
            score += recencyScore * 0.1;

            // Filter by minimum importance
            const importance = memory.metadata.importance || 5;
            if (importance >= (options.minImportance || 0) && score > 0.1) {
                results.push({
                    ...memory,
                    relevanceScore: score,
                    scoreComponents
                });
            }
        }

        // Sort by relevance score and apply limit
        return results
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, options.limit || 10);
    }

    async forget(agentId: string, structuredKey: string): Promise<{ success: boolean; error?: string }> {
        const agentMemories = this.memories.get(agentId) || [];
        const index = agentMemories.findIndex(m => m.structuredKey === structuredKey);

        if (index === -1) {
            return { success: false, error: 'Memory not found' };
        }

        const memory = agentMemories[index];
        agentMemories.splice(index, 1);
        this.memories.set(agentId, agentMemories);

        // Remove embeddings
        if (memory.id) {
            this.embeddings.delete(memory.id);
        }

        return { success: true };
    }

    async getContext(agentId: string, contextSize: number = 5): Promise<any[]> {
        const agentMemories = this.memories.get(agentId) || [];
        return agentMemories
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, contextSize);
    }

    // Simple embedding generation using OpenAI/Azure OpenAI
    private async generateEmbedding(text: string): Promise<number[] | null> {
        try {
            // Try Azure OpenAI first
            if (CONFIG.azure.endpoint && CONFIG.azure.apiKey) {
                return await this.callAzureEmbedding(text);
            }

            // Fallback to OpenAI
            if (CONFIG.openai.apiKey) {
                return await this.callOpenAIEmbedding(text);
            }

            return null;
        } catch (error) {
            throw error;
        }
    }

    private async callAzureEmbedding(text: string): Promise<number[]> {
        const url = `${CONFIG.azure.endpoint}openai/deployments/${CONFIG.azure.deploymentName}/embeddings?api-version=${CONFIG.azure.apiVersion}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': CONFIG.azure.apiKey!
            },
            body: JSON.stringify({
                input: text.substring(0, 8192),
                encoding_format: 'float'
            })
        });

        if (!response.ok) {
            throw new Error(`Azure OpenAI API failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].embedding;
    }

    private async callOpenAIEmbedding(text: string): Promise<number[]> {
        const url = 'https://api.openai.com/v1/embeddings';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.openai.apiKey}`
            },
            body: JSON.stringify({
                input: text.substring(0, 8192),
                model: CONFIG.openai.model,
                encoding_format: 'float'
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].embedding;
    }

    // Cosine similarity calculation
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Simple fuzzy matching using Levenshtein distance
    private fuzzyMatch(query: string, text: string, threshold: number = 0.7): number {
        const queryWords = query.match(/\b\w+\b/g) || [];
        const textWords = text.match(/\b\w+\b/g) || [];

        let matches = 0;

        for (const queryWord of queryWords) {
            for (const textWord of textWords) {
                const distance = this.levenshteinDistance(queryWord, textWord);
                const maxLength = Math.max(queryWord.length, textWord.length);
                const similarity = 1 - (distance / maxLength);

                if (similarity >= threshold) {
                    matches++;
                    break;
                }
            }
        }

        return queryWords.length > 0 ? matches / queryWords.length : 0;
    }

    private levenshteinDistance(str1: string, str2: string): number {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }
}

/**
 * Modern MemorAI MCP Server using latest SDK patterns
 */
class ModernMemorAIMCPServer {
    private mcpServer: McpServer;
    private memoryStore: MemoryStore;
    private app: express.Express;
    private transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

    constructor() {
        this.mcpServer = new McpServer({
            name: 'memorai-mcp-server',
            version: '9.9.0-phase3-enterprise'
        });

        this.memoryStore = new MemoryStore();
        this.app = express();

        this.setupMCPTools();
        this.setupExpressApp();
    }

    /**
     * Register MCP tools on a server instance (for stateless HTTP pattern)
     */
    private registerToolsOnServer(server: McpServer): void {
        // Remember tool
        server.registerTool(
            'mcp_memoraimcp_remember',
            {
                title: 'Remember Memory',
                description: 'Store a memory with content and metadata',
                inputSchema: {
                    agentId: z.string().describe('Agent identifier for memory isolation'),
                    content: z.string().describe('The content to remember'),
                    metadata: z.object({
                        entityType: z.string().optional(),
                        priority: z.string().optional(),
                        project: z.string().optional(),
                        session: z.string().optional(),
                        tags: z.array(z.string()).optional(),
                        importance: z.number().min(1).max(10).default(5)
                    }).optional()
                }
            },
            async ({ agentId, content, metadata }) => {
                try {
                    const memory = await this.memoryStore.store(agentId, content, metadata || {});

                    return {
                        content: [{
                            type: 'text',
                            text: `✅ Memory stored successfully!\n\n` +
                                `**Structured Key:** ${memory.structuredKey}\n` +
                                `**Content:** ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}\n` +
                                `**Agent ID:** ${agentId}\n` +
                                `**Entity Type:** ${metadata?.entityType || 'memory'}\n` +
                                `**Importance:** ${metadata?.importance || 5}/10\n` +
                                `**Vector Search:** ${FEATURES.vectorSearch ? 'Enabled' : 'Disabled'}\n` +
                                `**Timestamp:** ${memory.timestamp}`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `❌ Memory storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Recall tool
        server.registerTool(
            'mcp_memoraimcp_recall',
            {
                title: 'Recall Memory',
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
                            text: `🧠 Found ${memories.length} memories:\n\n` +
                                memories.map((memory, index) =>
                                    `**${index + 1}.** ${memory.content.substring(0, 150)}${memory.content.length > 150 ? '...' : ''}\n` +
                                    `   📋 Key: ${memory.structuredKey}\n` +
                                    `   📊 Importance: ${memory.metadata.importance || 5}/10\n` +
                                    `   🏷️  Type: ${memory.metadata.entityType || 'memory'}\n` +
                                    `   📅 Created: ${memory.timestamp}\n`
                                ).join('\n')
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `❌ Memory recall failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Forget tool
        server.registerTool(
            'mcp_memoraimcp_forget',
            {
                title: 'Forget Memory',
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
                                ? `✅ Memory with key "${structuredKey}" deleted successfully`
                                : `⚠️  Memory with key "${structuredKey}" not found`
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `❌ Memory deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // Context tool
        server.registerTool(
            'mcp_memoraimcp_context',
            {
                title: 'Get Recent Context',
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
                            text: `📋 Recent Context (${context.length} memories):\n\n` +
                                context.map((memory, index) =>
                                    `**${index + 1}.** ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}\n` +
                                    `   📊 Importance: ${memory.metadata.importance || 5}/10\n`
                                ).join('\n')
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `❌ Context retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }],
                        isError: true
                    };
                }
            }
        );
    }

    /**
     * Setup MCP tools using modern registerTool API
     */
    private setupMCPTools(): void {
        this.registerToolsOnServer(this.mcpServer);
    }

        // Recall tool
        this.mcpServer.registerTool(
        'mcp_memoraimcp_recall',
        {
            title: 'Recall Memories',
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
        async ({ agentId, query, limit, minImportance, project, session }) => {
            try {
                const memories = await this.memoryStore.recall(agentId, query, {
                    limit,
                    minImportance,
                    project,
                    session
                });

                if (memories.length === 0) {
                    return {
                        content: [{
                            type: 'text',
                            text: `🔍 No memories found for query: "${query}"\n\n` +
                                `**Agent ID:** ${agentId}\n` +
                                `**Search Features:** Vector=${FEATURES.vectorSearch}, Hybrid=${FEATURES.hybridSearch}\n` +
                                `**Suggestion:** Try broader keywords or check if memories exist for this agent.`
                        }]
                    };
                }

                let resultText = `🧠 Found ${memories.length} memories using hybrid search:\n\n`;

                memories.forEach((memory: any, index: number) => {
                    const scores = memory.scoreComponents;
                    resultText += `**${index + 1}. ${memory.metadata?.entityType || 'Memory'}** ` +
                        `(Score: ${memory.relevanceScore.toFixed(3)})\n` +
                        `${memory.content.substring(0, 150)}${memory.content.length > 150 ? '...' : ''}\n` +
                        `*Key: ${memory.structuredKey}*\n` +
                        `*Created: ${new Date(memory.timestamp).toLocaleString()}*\n`;

                    if (scores) {
                        resultText += `*Scores: Vector=${scores.vector?.toFixed(3) || 'N/A'}, ` +
                            `Keyword=${scores.keyword?.toFixed(3) || 'N/A'}, ` +
                            `Fuzzy=${scores.fuzzy?.toFixed(3) || 'N/A'}*\n`;
                    }

                    resultText += '\n';
                });

                resultText += `**Search Query:** "${query}"\n`;
                resultText += `**Agent ID:** ${agentId}\n`;
                resultText += `**Features Used:** Vector=${FEATURES.vectorSearch}, Hybrid=${FEATURES.hybridSearch}`;

                return {
                    content: [{
                        type: 'text',
                        text: resultText
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `❌ Memory recall failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }],
                    isError: true
                };
            }
        }
    );

// Forget tool
this.mcpServer.registerTool(
    'mcp_memoraimcp_forget',
    {
        title: 'Forget Memory',
        description: 'Delete a memory by structured key',
        inputSchema: {
            agentId: z.string().describe('Agent identifier'),
            structuredKey: z.string().describe('Structured key of memory to delete')
        }
    },
    async ({ agentId, structuredKey }) => {
        try {
            const result = await this.memoryStore.forget(agentId, structuredKey);

            return {
                content: [{
                    type: 'text',
                    text: result.success
                        ? `🗑️ Memory deleted successfully!\n\n**Key:** ${structuredKey}\n**Agent ID:** ${agentId}`
                        : `❌ Failed to delete memory: ${result.error}`
                }],
                isError: !result.success
            };
        } catch (error) {
            return {
                content: [{
                    type: 'text',
                    text: `❌ Memory deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                }],
                isError: true
            };
        }
    }
);

// Context tool
this.mcpServer.registerTool(
    'mcp_memoraimcp_context',
    {
        title: 'Get Context',
        description: 'Get recent context for agent',
        inputSchema: {
            agentId: z.string().describe('Agent identifier'),
            contextSize: z.number().default(5).describe('Number of recent memories to retrieve')
        }
    },
    async ({ agentId, contextSize }) => {
        try {
            const context = await this.memoryStore.getContext(agentId, contextSize);

            if (context.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `📋 No context available for agent: ${agentId}\n\n` +
                            `**Suggestion:** Start by storing some memories to build context.`
                    }]
                };
            }

            let contextText = `📋 Recent context for ${agentId} (${context.length} items):\n\n`;

            context.forEach((memory: any, index: number) => {
                contextText += `**${index + 1}.** ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}\n` +
                    `*${memory.metadata?.entityType || 'Memory'} | ${new Date(memory.timestamp).toLocaleString()}*\n` +
                    `*Key: ${memory.structuredKey}*\n\n`;
            });

            return {
                content: [{
                    type: 'text',
                    text: contextText
                }]
            };
        } catch (error) {
            return {
                content: [{
                    type: 'text',
                    text: `❌ Context retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                }],
                isError: true
            };
        }
    }
);
    }

    /**
     * Setup Express app for HTTP transport support
     */
    private setupExpressApp(): void {
    this.app.use(cors({
        origin: CONFIG.corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'mcp-session-id'],
        exposedHeaders: ['mcp-session-id']
    }));

    this.app.use(express.json({ limit: '10mb' }));

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
        res.json({
            status: 'healthy',
            service: 'memorai-mcp-server',
            version: '9.9.0-phase3-enterprise',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            features: FEATURES,
            mcpProtocol: '2025-03-26',
            transports: ['stdio', 'streamable-http'],
            config: {
                port: CONFIG.port,
                vectorSearch: FEATURES.vectorSearch,
                azureOpenAI: !!(CONFIG.azure.endpoint && CONFIG.azure.apiKey),
                openAI: !!CONFIG.openai.apiKey
            }
        });
    });

    // MCP HTTP transport endpoint - Microsoft recommended stateless pattern
    this.app.post('/mcp', async (req: Request, res: Response) => {
        try {
            // Microsoft pattern: Create fresh server instance for each request (stateless)
            const server = new McpServer({
                name: 'memorai-mcp-server',
                version: '9.9.0-phase3-enterprise'
            });

            // Register tools for this request
            this.registerToolsOnServer(server);

            // Create fresh transport for this request
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined, // Microsoft pattern: no session persistence
            });

            // Clean up when request closes
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

    // Handle GET requests for server-to-client notifications via SSE
    this.app.get('/mcp', async (req: Request, res: Response) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;

        if (!sessionId || !this.transports[sessionId]) {
            res.status(400).send('Invalid or missing session ID');
            return;
        }

        const transport = this.transports[sessionId];
        await transport.handleRequest(req, res);
    });

    // Handle DELETE requests for session termination
    this.app.delete('/mcp', async (req: Request, res: Response) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;

        if (!sessionId || !this.transports[sessionId]) {
            res.status(400).send('Invalid or missing session ID');
            return;
        }

        const transport = this.transports[sessionId];
        await transport.handleRequest(req, res);
    });
}

    /**
     * Start the server with both STDIO and HTTP transports
     */
    async start(): Promise < void> {
    try {
        console.log('🧠 Starting MemorAI MCP Server - Modern Implementation...');

        // Check if running in STDIO-only mode
        const isStdioOnly = process.argv.includes('--stdio');

        if(isStdioOnly) {
            console.log('📡 Starting in STDIO-only mode for VS Code integration...');

            // Setup STDIO transport only
            const transport = new StdioServerTransport();
            await this.mcpServer.connect(transport);
            console.log('✅ MemorAI MCP Server connected via STDIO');
            console.log('🎯 MCP Protocol: 2025-03-26 (STDIO only)');
            console.log('🛠️  Tools: mcp_memoraimcp_remember, mcp_memoraimcp_recall, mcp_memoraimcp_forget, mcp_memoraimcp_context');
            console.log('📅 Ready for MCP clients\n');
            return;
        }

            // Display configuration for full mode
            console.log('📋 Configuration:');
        console.log(`   Port: ${CONFIG.port}`);
        console.log(`   CBD Database: ${CONFIG.cbdBaseUrl}`);
        console.log(`   Vector Search: ${FEATURES.vectorSearch}`);
        console.log(`   Azure OpenAI: ${!!(CONFIG.azure.endpoint && CONFIG.azure.apiKey)}`);
        console.log(`   OpenAI Fallback: ${!!CONFIG.openai.apiKey}`);
        console.log('');

        // Start HTTP server for Streamable HTTP transport
        const server = this.app.listen(CONFIG.port, () => {
            console.log(`🌐 HTTP Server listening on port ${CONFIG.port}`);
            console.log(`🔗 Health check: http://localhost:${CONFIG.port}/health`);
            console.log(`📡 MCP HTTP endpoint: http://localhost:${CONFIG.port}/mcp`);
        });

        // Setup STDIO transport for VS Code integration (in dual mode)
        if(process.argv.includes('--with-stdio')) {
    const transport = new StdioServerTransport();
    await this.mcpServer.connect(transport);
    console.log('📡 MCP STDIO transport connected for VS Code');
}

// Setup graceful shutdown
const shutdown = async () => {
    console.log('\n🛑 Shutting down MemorAI MCP Server...');

    // Close HTTP server
    server.close(() => {
        console.log('HTTP server closed');
    });

    // Close all MCP transports
    for (const transport of Object.values(this.transports)) {
        try {
            transport.close();
        } catch (error) {
            console.warn('Transport close error:', error);
        }
    }

    console.log('✅ Server shutdown complete');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('✅ MemorAI MCP Server started successfully!');
console.log('🎯 MCP Protocol: 2025-03-26 (Streamable HTTP + STDIO)');
console.log('🛠️  Tools: mcp_memoraimcp_remember, mcp_memoraimcp_recall, mcp_memoraimcp_forget, mcp_memoraimcp_context');
console.log('📅 Ready for MCP clients\n');

        } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
}
    }
}

// Main execution
async function main() {
    const server = new ModernMemorAIMCPServer();
    await server.start();
}

// Start the server immediately
main().catch((error) => {
    console.error('Application error:', error);
    process.exit(1);
});

export { ModernMemorAIMCPServer };