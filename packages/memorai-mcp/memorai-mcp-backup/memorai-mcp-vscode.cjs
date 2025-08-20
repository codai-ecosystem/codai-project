#!/usr/bin/env node

/**
 * MemorAI MCP Server - CBD Database Integration
 * VS Code Compatible with Persistent Storage
 * Date: August 5, 2025
 * Port: 4950
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.MEMORAI_MCP_PORT || 4950;
const API_KEY = process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025';
const CBD_BASE_URL = process.env.CBD_BASE_URL || 'http://localhost:4180';

// CBD Database management
let cbdProcess = null;

// Enable CORS for VS Code MCP client
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'mcp-session-id'],
    exposedHeaders: ['mcp-session-id', 'Content-Type']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CBD Database Management Functions
async function isCBDRunning() {
    try {
        const response = await fetch(`${CBD_BASE_URL}/health`, {
            method: 'GET',
            timeout: 3000
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

async function startCBDDatabase() {
    if (cbdProcess) {
        console.log('🗃️ CBD Database process already running');
        return true;
    }

    const isRunning = await isCBDRunning();
    if (isRunning) {
        console.log('✅ CBD Database is already running on port 4180');
        return true;
    }

    console.log('🚀 Starting CBD Database...');
    console.log('⚠️  Note: External CBD start required - please ensure CBD is running on port 4180');

    // Try to wait for external CBD Database to become available
    console.log('⏳ Waiting for CBD Database to start...');
    for (let i = 0; i < 15; i++) {  // Reduced wait time since we expect external start
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (await isCBDRunning()) {
            console.log('✅ CBD Database detected and ready on port 4180');
            return true;
        }
    }

    console.log('⚠️  CBD Database not detected within 15 seconds');
    console.log('💡 Please start CBD Database manually using VS Code task or:');
    console.log('   cd packages/cbd && npx tsx src/start.ts');

    // Return true to allow MemorAI MCP to start anyway (graceful degradation)
    console.log('🚀 Continuing MemorAI MCP startup (will retry CBD connection as needed)');
    return true;
}

function stopCBDDatabase() {
    if (cbdProcess) {
        console.log('🛑 Stopping CBD Database...');
        cbdProcess.kill('SIGTERM');
        cbdProcess = null;
    }
}

// CBD Database Integration
class CBDMemoryStore {
    constructor(baseUrl = CBD_BASE_URL) {
        this.baseUrl = baseUrl;
        this.collectionName = 'memorai_memories';
        this.initializeCollection();
    }

    async initializeCollection() {
        try {
            // Test CBD connection by trying to get existing documents
            const response = await fetch(`${this.baseUrl}/document/${this.collectionName}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                console.log(`✅ CBD collection ${this.collectionName} initialized`);
            } else {
                console.log(`✅ CBD collection ${this.collectionName} ready (empty collection)`);
            }
        } catch (error) {
            console.error('❌ CBD collection initialization error:', error.message);
        }
    }

    async store(agentId, content, metadata = {}) {
        try {
            const memory = {
                id: uuidv4(),
                agentId,
                content,
                metadata: {
                    importance: 5,
                    ...metadata
                },
                createdAt: new Date().toISOString(),
                timestamp: new Date().toISOString(),
                structuredKey: `${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };

            const response = await fetch(`${this.baseUrl}/document/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: this.collectionName,
                    document: memory
                })
            });

            if (!response.ok) throw new Error(`CBD store failed: ${response.statusText}`);

            console.log(`💾 Stored memory: ${memory.structuredKey} for agent: ${agentId}`);
            return memory;
        } catch (error) {
            console.error('❌ CBD store error:', error);
            throw error;
        }
    }

    async getAll(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/document/${this.collectionName}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`CBD getAll failed: ${response.statusText}`);

            const result = await response.json();
            const filteredMemories = (result.result || [])
                .filter(memory => memory.agentId === agentId)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return filteredMemories;
        } catch (error) {
            console.error('❌ CBD getAll error:', error);
            return [];
        }
    }

    async search(agentId, query, options = {}) {
        try {
            const { limit = 10, minImportance = 0, project, session } = options;

            // Get all memories for the agent
            const memories = await this.getAll(agentId);

            // Enhanced search with intelligent matching
            let matchingMemories = memories.filter(memory => {
                if (memory.agentId !== agentId) return false;

                // Multi-strategy search approach
                const searchText = memory.content.toLowerCase();
                const queryLower = query.toLowerCase();

                // Strategy 1: Direct contains (original)
                const directMatch = searchText.includes(queryLower);

                // Strategy 2: Individual word matching (order-independent)
                const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
                const wordMatches = queryWords.filter(word => searchText.includes(word));
                const wordMatchScore = queryWords.length > 0 ? (wordMatches.length / queryWords.length) : 0;

                // Strategy 3: Fuzzy word matching for partial matches
                let fuzzyScore = 0;
                if (queryWords.length > 0) {
                    for (const word of queryWords) {
                        // Check if any part of the memory text contains variations
                        const textWords = searchText.split(/\s+/);
                        for (const textWord of textWords) {
                            if (textWord.includes(word) || word.includes(textWord)) {
                                fuzzyScore += 0.5;
                            }
                        }
                    }
                    fuzzyScore = fuzzyScore / queryWords.length;
                }

                // Strategy 4: Common technical terms and synonyms
                const synonymMap = {
                    'remaining': ['left', 'pending', 'todo', 'incomplete', 'outstanding'],
                    'sections': ['parts', 'modules', 'components', 'areas', 'pages'],
                    'modernization': ['modernize', 'upgrade', 'update', 'improvement'],
                    'comprehensive': ['complete', 'full', 'detailed', 'thorough'],
                    'implementation': ['implement', 'build', 'create', 'develop']
                };

                let synonymScore = 0;
                for (const queryWord of queryWords) {
                    if (synonymMap[queryWord]) {
                        for (const synonym of synonymMap[queryWord]) {
                            if (searchText.includes(synonym)) {
                                synonymScore += 0.3;
                            }
                        }
                    }
                }
                synonymScore = Math.min(synonymScore, 1);

                // Combine all matching strategies
                const hasMatch = directMatch || wordMatchScore >= 0.5 || fuzzyScore >= 0.3 || synonymScore >= 0.2;

                // Filter by other criteria
                const importance = memory.metadata.importance || 5;
                const projectMatch = !project || memory.metadata.project === project;
                const sessionMatch = !session || memory.metadata.session === session;

                return hasMatch && importance >= minImportance && projectMatch && sessionMatch;
            });

            // Sort by relevance score (combination of importance and match quality)
            matchingMemories = matchingMemories
                .map(memory => {
                    const searchText = memory.content.toLowerCase();
                    const queryLower = query.toLowerCase();
                    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

                    // Calculate relevance score
                    let relevanceScore = 0;

                    // Direct match bonus
                    if (searchText.includes(queryLower)) relevanceScore += 10;

                    // Word match score
                    const wordMatches = queryWords.filter(word => searchText.includes(word));
                    relevanceScore += (wordMatches.length / Math.max(queryWords.length, 1)) * 5;

                    // Position bonus (earlier matches are better)
                    const firstMatchPos = searchText.indexOf(queryLower);
                    if (firstMatchPos >= 0) {
                        relevanceScore += Math.max(0, 5 - (firstMatchPos / 100));
                    }

                    // Importance factor
                    const importance = memory.metadata.importance || 5;
                    relevanceScore += importance * 0.5;

                    return { ...memory, relevanceScore };
                })
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, limit);

            console.log(`🔍 Search results for "${query}" (agent: ${agentId}): ${matchingMemories.length}/${memories.length} memories`);

            return matchingMemories;
        } catch (error) {
            console.error('❌ CBD search error:', error);
            throw error;
        }
    }

    async delete(structuredKey, agentId) {
        try {
            // First, find the memory to delete by structured key and agent ID
            const memories = await this.getAll(agentId);
            const targetMemory = memories.find(memory => memory.structuredKey === structuredKey);

            if (!targetMemory) {
                console.log(`⚠️ Memory not found: ${structuredKey} for agent: ${agentId}`);
                return {
                    success: false,
                    found: false,
                    error: `Memory with structured key "${structuredKey}" not found for agent "${agentId}"`
                };
            }

            // Delete the memory using the new CBD DELETE operation
            const response = await fetch(`${this.baseUrl}/document/${this.collectionName}/${targetMemory._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`CBD delete failed: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.deletedCount > 0) {
                console.log(`🗑️ Successfully deleted memory: ${structuredKey} for agent: ${agentId}`);
                return {
                    success: true,
                    found: true,
                    deletedCount: result.deletedCount,
                    id: targetMemory._id
                };
            } else {
                return {
                    success: false,
                    found: true,
                    error: "Memory found but deletion failed"
                };
            }
        } catch (error) {
            console.error('❌ CBD delete error:', error);
            return { success: false, error: error.message };
        }
    }

    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`CBD health check failed: ${response.statusText}`);

            const health = await response.json();
            return { success: true, healthy: health.status === 'healthy', details: health };
        } catch (error) {
            console.error('❌ CBD health check error:', error);
            return { success: false, healthy: false, error: error.message };
        }
    }
}

// Initialize CBD Memory Store
const memoryStore = new CBDMemoryStore();

// Helper functions for stats
async function getTotalMemoriesCount() {
    try {
        const response = await fetch(`${CBD_BASE_URL}/document/memorai_memories`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`Failed to fetch memories count: ${response.status}`);

        const result = await response.json();
        return (result.result || []).length;
    } catch (error) {
        console.error('❌ Error getting total memories count:', error);
        return 0;
    }
}

async function getAgentStats() {
    try {
        const response = await fetch(`${CBD_BASE_URL}/document/memorai_memories`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`Failed to fetch memories for stats: ${response.status}`);

        const result = await response.json();
        const memories = result.result || [];

        return memories.reduce((acc, memory) => {
            acc[memory.agentId] = (acc[memory.agentId] || 0) + 1;
            return acc;
        }, {});
    } catch (error) {
        console.error('❌ Error getting agent stats:', error);
        return {};
    }
}

// Authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const apiKey = authHeader?.replace('Bearer ', '') ||
        req.query.apiKey ||
        req.headers['x-api-key'];

    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide a valid API key'
        });
    }
    next();
};

// Health endpoint
app.get('/health', async (req, res) => {
    try {
        const healthCheck = await memoryStore.healthCheck();
        const totalMemories = await getTotalMemoriesCount();

        res.json({
            status: 'healthy',
            service: 'MemorAI MCP Server',
            version: '1.0.0',
            port: PORT,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development',
            totalMemories: totalMemories,
            mcpProtocol: '2025-06-18',
            cbdHealth: healthCheck.healthy,
            cbdDetails: healthCheck.details
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Stats endpoint
app.get('/stats', authenticate, async (req, res) => {
    try {
        const totalMemories = await getTotalMemoriesCount();
        const agentStats = await getAgentStats();

        res.json({
            totalMemories: totalMemories,
            memoriesByAgent: agentStats,
            serverInfo: {
                name: 'MemorAI MCP Server',
                version: '1.0.0',
                port: PORT,
                uptime: process.uptime(),
                protocol: '2025-06-18'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Root endpoint for VS Code MCP client
app.get('/', (req, res) => {
    res.json({
        service: 'MemorAI MCP Server',
        version: '1.0.0',
        protocol: '2025-06-18',
        port: PORT,
        timestamp: new Date().toISOString(),
        message: 'MemorAI MCP Server is running with CBD Database integration'
    });
});

// MCP Protocol Implementation with Proper Initialization
app.post('/', async (req, res) => {
    try {
        const { jsonrpc, method, params, id } = req.body;

        // Handle MCP initialization
        if (method === 'initialize') {
            res.json({
                jsonrpc: "2.0",
                id: id,
                result: {
                    protocolVersion: "2025-06-18",
                    capabilities: {
                        tools: {
                            listChanged: true
                        },
                        resources: {},
                        prompts: {},
                        logging: {}
                    },
                    serverInfo: {
                        name: "MemorAI MCP Server",
                        version: "1.0.0"
                    }
                }
            });
            return;
        }

        // Handle tools/list request
        if (method === 'tools/list') {
            res.json({
                jsonrpc: "2.0",
                id: id,
                result: {
                    tools: [
                        {
                            name: "remember",
                            description: "Store a memory with content and metadata",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    agentId: {
                                        type: "string",
                                        description: "Agent identifier for memory isolation"
                                    },
                                    content: {
                                        type: "string",
                                        description: "The content to remember"
                                    },
                                    metadata: {
                                        type: "object",
                                        description: "Additional metadata for the memory",
                                        properties: {
                                            project: { type: "string" },
                                            session: { type: "string" },
                                            tags: {
                                                type: "array",
                                                items: { type: "string" }
                                            },
                                            priority: { type: "string" },
                                            entityType: { type: "string" },
                                            importance: {
                                                type: "number",
                                                minimum: 1,
                                                maximum: 10
                                            }
                                        }
                                    }
                                },
                                required: ["agentId", "content"]
                            }
                        },
                        {
                            name: "recall",
                            description: "Search and retrieve memories with intelligent suggestions",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    agentId: {
                                        type: "string",
                                        description: "Agent identifier for memory isolation"
                                    },
                                    query: {
                                        type: "string",
                                        description: "Search query for finding relevant memories"
                                    },
                                    limit: {
                                        type: "number",
                                        description: "Maximum number of results to return (default: 10)",
                                        default: 10
                                    },
                                    minImportance: {
                                        type: "number",
                                        description: "Minimum importance score filter (default: 0)",
                                        default: 0
                                    },
                                    project: {
                                        type: "string",
                                        description: "Filter memories by project name"
                                    },
                                    session: {
                                        type: "string",
                                        description: "Filter memories by session identifier"
                                    }
                                },
                                required: ["agentId", "query"]
                            }
                        },
                        {
                            name: "forget",
                            description: "Delete a memory by structured key",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    agentId: {
                                        type: "string",
                                        description: "Agent identifier"
                                    },
                                    structuredKey: {
                                        type: "string",
                                        description: "Structured key of memory to delete"
                                    }
                                },
                                required: ["agentId", "structuredKey"]
                            }
                        },
                        {
                            name: "context",
                            description: "Get recent context for agent",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    agentId: {
                                        type: "string",
                                        description: "Agent identifier"
                                    },
                                    contextSize: {
                                        type: "number",
                                        description: "Number of recent memories to retrieve (default: 5)",
                                        default: 5
                                    }
                                },
                                required: ["agentId"]
                            }
                        }
                    ]
                }
            });
            return;
        }

        // Handle MCP initialized notification (optional acknowledgment)
        if (method === 'notifications/initialized') {
            // No response needed for notifications
            res.status(200).send();
            return;
        }

        if (method === 'tools/call') {
            const { name, arguments: args } = params;

            switch (name) {
                case 'remember':
                    try {
                        const storeResult = await memoryStore.store(args.agentId, args.content, args.metadata);

                        res.json({
                            jsonrpc: "2.0",
                            id: id,
                            result: {
                                content: [{
                                    type: "text",
                                    text: `✅ Memory stored successfully in CBD Database!\n\nID: ${storeResult.id}\nAgent: ${storeResult.agentId}\nContent: ${storeResult.content}\nStructured Key: ${storeResult.structuredKey}\nTimestamp: ${storeResult.createdAt}`
                                }],
                                isError: false
                            }
                        });
                    } catch (error) {
                        console.error('❌ CBD remember error:', error);
                        res.json({
                            jsonrpc: "2.0",
                            id: id,
                            result: {
                                content: [{
                                    type: "text",
                                    text: `❌ Error storing memory in CBD Database: ${error.message}`
                                }],
                                isError: true
                            }
                        });
                    }
                    break;

                case 'recall':
                    try {
                        const query = args.query.toLowerCase();
                        const limit = args.limit || 10;
                        const minImportance = args.minImportance || 0;
                        const agentId = args.agentId;

                        const searchResults = await memoryStore.search(agentId, query, {
                            limit,
                            minImportance,
                            project: args.project,
                            session: args.session
                        });

                        const resultsText = searchResults.length > 0
                            ? `🔍 Found ${searchResults.length} matching memories from CBD Database for agent "${agentId}":\n\n` +
                            searchResults.map((memory, index) =>
                                `${index + 1}. **${memory.structuredKey}**\n` +
                                `   Content: ${memory.content}\n` +
                                `   Importance: ${memory.metadata.importance || 5}/10\n` +
                                `   Project: ${memory.metadata.project || 'N/A'}\n` +
                                `   Tags: ${memory.metadata.tags ? memory.metadata.tags.join(', ') : 'None'}\n` +
                                `   Created: ${memory.timestamp}\n`
                            ).join('\n')
                            : `🔍 No memories found in CBD Database for query "${query}" (agent: ${agentId})`;

                        res.json({
                            jsonrpc: "2.0",
                            id: id,
                            result: {
                                content: [{
                                    type: "text",
                                    text: resultsText
                                }],
                                isError: false
                            }
                        });
                    } catch (error) {
                        console.error('❌ CBD recall error:', error);
                        res.json({
                            jsonrpc: "2.0",
                            id: id,
                            result: {
                                content: [{
                                    type: "text",
                                    text: `❌ Error searching memories in CBD Database: ${error.message}`
                                }],
                                isError: true
                            }
                        });
                    }
                    break;

                case 'forget':
                    try {
                        const structuredKey = args.structuredKey;
                        const agentForget = args.agentId;

                        const deleted = await memoryStore.delete(structuredKey, agentForget);

                        if (deleted.success && deleted.found) {
                            res.json({
                                jsonrpc: "2.0",
                                id: id,
                                result: {
                                    content: [{
                                        type: "text",
                                        text: `✅ Memory deleted successfully from CBD Database!\n\nDeleted Key: ${structuredKey}\nAgent: ${agentForget}`
                                    }],
                                    isError: false
                                }
                            });
                        } else {
                            res.json({
                                jsonrpc: "2.0",
                                id: id,
                                result: {
                                    content: [{
                                        type: "text",
                                        text: `❌ Memory with structured key "${structuredKey}" not found in CBD Database for agent "${agentForget}"`
                                    }],
                                    isError: true
                                }
                            });
                        }
                    } catch (error) {
                        console.error('❌ CBD forget error:', error);
                        res.json({
                            jsonrpc: "2.0",
                            id: id,
                            result: {
                                content: [{
                                    type: "text",
                                    text: `❌ Error deleting memory from CBD Database: ${error.message}`
                                }],
                                isError: true
                            }
                        });
                    }
                    break;

                case 'context':
                    try {
                        const contextAgent = args.agentId;
                        const contextSize = args.contextSize || 5;

                        const allMemories = await memoryStore.getAll(contextAgent);
                        const recentMemories = allMemories
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .slice(0, contextSize);

                        const contextText = recentMemories.length > 0
                            ? `📝 Recent context from CBD Database for agent "${contextAgent}" (${recentMemories.length} memories):\n\n` +
                            recentMemories.map((memory, index) =>
                                `${index + 1}. [${memory.timestamp}] ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}\n` +
                                `   Project: ${memory.metadata.project || 'N/A'}\n` +
                                `   Key: ${memory.structuredKey}\n`
                            ).join('\n')
                            : `📝 No recent context found in CBD Database for agent "${contextAgent}"`;

                        res.json({
                            jsonrpc: "2.0",
                            id: id,
                            result: {
                                content: [{
                                    type: "text",
                                    text: contextText
                                }],
                                isError: false
                            }
                        });
                    } catch (error) {
                        console.error('❌ CBD context error:', error);
                        res.json({
                            jsonrpc: "2.0",
                            id: id,
                            result: {
                                content: [{
                                    type: "text",
                                    text: `❌ Error retrieving context from CBD Database: ${error.message}`
                                }],
                                isError: true
                            }
                        });
                    }
                    break;

                default:
                    res.json({
                        jsonrpc: "2.0",
                        id: id,
                        error: {
                            code: -32601,
                            message: `Tool '${name}' not found`
                        }
                    });
                    break;
            }
        } else {
            // Handle unsupported MCP methods
            res.json({
                jsonrpc: "2.0",
                id: id,
                error: {
                    code: -32601,
                    message: `Method '${method}' not found`
                }
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.json({
            jsonrpc: "2.0",
            id: id || null,
            error: {
                code: -32603,
                message: 'Internal server error',
                data: error.message
            }
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        jsonrpc: "2.0",
        error: {
            code: -32603,
            message: 'Internal server error'
        }
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully');
    stopCBDDatabase();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nSIGTERM received, shutting down gracefully');
    stopCBDDatabase();
    process.exit(0);
});

// Start server with CBD dependency
async function startServer() {
    console.log('🧠 Starting MemorAI MCP Server...');

    // Check if CBD Database is running (no longer enforce startup)
    const cbdStarted = await startCBDDatabase();
    if (!cbdStarted) {
        console.log('⚠️  CBD Database connection failed, but continuing startup');
        console.log('💡 MemorAI MCP will attempt to reconnect to CBD as needed');
    }

    // Start the Express server
    app.listen(PORT, () => {
        console.log('🧠 MemorAI MCP Server (VS Code Compatible) started successfully!');
        console.log(`📡 Server running on http://localhost:${PORT}`);
        console.log(`🔑 API Key: ${API_KEY}`);
        console.log(`📅 Date: ${new Date().toISOString()}`);
        console.log(`🎯 MCP Protocol: 2025-06-18 (Full JSON-RPC 2.0 Compliance)`);
        console.log(`✅ MCP Initialize Method: Implemented`);
        console.log(`🛠️  MCP Tools: remember, recall, forget, context`);
        console.log(`🔧 Root endpoint: POST http://localhost:${PORT}/ (MCP JSON-RPC)`);
        console.log(`💡 Health check: GET http://localhost:${PORT}/health`);
        console.log(`💾 CBD Database: ${CBD_BASE_URL}`);
        console.log(`🗂️  Collection: memorai_memories`);
        console.log(`📋 Ready for VS Code MCP client integration`);
    });
}

// Start the server
startServer().catch(error => {
    console.error('❌ Failed to start MemorAI MCP Server:', error);
    process.exit(1);
});
