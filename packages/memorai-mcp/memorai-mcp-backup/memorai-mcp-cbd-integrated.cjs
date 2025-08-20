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

const app = express();
const PORT = process.env.MEMORAI_MCP_PORT || 4950;
const API_KEY = process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025';
const CBD_BASE_URL = process.env.CBD_BASE_URL || 'http://localhost:4180';

// Enable CORS for VS Code
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CBD Database Integration
class CBDMemoryStore {
    constructor(baseUrl = CBD_BASE_URL) {
        this.baseUrl = baseUrl;
        this.collectionName = 'memorai_memories';
        this.initializeCollection();
    }

    async initializeCollection() {
        try {
            // Create collection in CBD if it doesn't exist
            const response = await fetch(`${this.baseUrl}/document/collections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.collectionName,
                    schema: {
                        id: { type: 'string', required: true },
                        agentId: { type: 'string', required: true },
                        content: { type: 'string', required: true },
                        metadata: { type: 'object' },
                        createdAt: { type: 'date', required: true },
                        timestamp: { type: 'string', required: true },
                        structuredKey: { type: 'string', required: true }
                    }
                })
            });

            console.log(`✅ CBD collection ${this.collectionName} initialized`);
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

            const response = await fetch(`${this.baseUrl}/document/${this.collectionName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memory)
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
            const response = await fetch(`${this.baseUrl}/document/collections/${this.collectionName}/documents`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`CBD getAll failed: ${response.statusText}`);

            const result = await response.json();
            const filteredMemories = (result.documents || [])
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

            // Filter and search memories
            let matchingMemories = memories.filter(memory => {
                if (memory.agentId !== agentId) return false;

                const contentMatch = memory.content.toLowerCase().includes(query);
                const importance = memory.metadata.importance || 5;
                const projectMatch = !project || memory.metadata.project === project;
                const sessionMatch = !session || memory.metadata.session === session;

                return contentMatch && importance >= minImportance && projectMatch && sessionMatch;
            });

            // Sort by importance (descending) and limit results  
            matchingMemories = matchingMemories
                .sort((a, b) => {
                    const aImportance = a.metadata.importance || 5;
                    const bImportance = b.metadata.importance || 5;
                    return bImportance - aImportance;
                })
                .slice(0, limit);

            return matchingMemories;
        } catch (error) {
            console.error('❌ CBD search error:', error);
            throw error;
        }
    }

    async delete(structuredKey, agentId) {
        try {
            // First get all memories to find the one with matching structuredKey
            const memories = await this.getAll(agentId);
            const memory = memories.find(m =>
                m.structuredKey === structuredKey && m.agentId === agentId
            );

            if (!memory) {
                return { success: false, found: false };
            }

            // Delete using the memory's ID
            const response = await fetch(`${this.baseUrl}/document/${this.collectionName}/${memory.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`CBD delete failed: ${response.statusText}`);

            console.log(`🗑️  Deleted memory: ${structuredKey} for agent: ${agentId}`);
            return { success: true, found: true };
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
        const response = await fetch(`${CBD_BASE_URL}/document/collections/memorai_memories/documents`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`Failed to fetch memories count: ${response.status}`);

        const result = await response.json();
        return (result.documents || []).length;
    } catch (error) {
        console.error('❌ Error getting total memories count:', error);
        return 0;
    }
}

async function getAgentStats() {
    try {
        const response = await fetch(`${CBD_BASE_URL}/document/collections/memorai_memories/documents`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`Failed to fetch memories for stats: ${response.status}`);

        const result = await response.json();
        const memories = result.documents || [];

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

// MCP Protocol Implementation
app.post('/', async (req, res) => {
    try {
        const { method, params, id } = req.body;

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
                            message: `Method '${name}' not found`
                        }
                    });
                    break;
            }
        } else {
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
        res.status(500).json({
            jsonrpc: "2.0",
            error: {
                code: -32603,
                message: 'Internal server error'
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
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nSIGTERM received, shutting down gracefully');
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log('🧠 MemorAI MCP Server (VS Code Compatible) started successfully!');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log(`📅 Date: ${new Date().toISOString()}`);
    console.log(`🎯 MCP Protocol: 2025-06-18 (VS Code Compatible)`);
    console.log(`✅ Ready for VS Code MCP integration`);
    console.log(`🔧 Root endpoint: GET/POST http://localhost:${PORT}/`);
    console.log(`💡 Health check: GET http://localhost:${PORT}/health`);
    console.log(`💾 CBD Database: ${CBD_BASE_URL}`);
    console.log(`🗂️  Collection: memorai_memories`);
});
