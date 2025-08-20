#!/usr/bin/env node

/**
 * MemorAI MCP Server - Port 4950
 * Production-ready MCP server for VS Code integration
 * Date: August 4, 2025
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.MEMORAI_MCP_PORT || 4950;
const API_KEY = process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025';

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:4006', 'vscode-file:', 'vscode-webview:'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const apiKey = authHeader?.replace('Bearer ', '') || req.query.apiKey || req.headers['x-api-key'];

    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide a valid API key',
            expectedFormat: 'Authorization: Bearer <api-key> or x-api-key header'
        });
    }
    next();
};

// In-memory storage for simplicity (in production, use a proper database)
let memories = [];
let memoryCounter = 1;

// MCP Capability endpoints
app.get('/capabilities', (req, res) => {
    res.json({
        protocolVersion: "2024-11-05",
        capabilities: {
            tools: {
                listChanged: true
            },
            logging: {},
        },
        serverInfo: {
            name: "memorai-mcp",
            version: "1.0.0"
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'MemorAI MCP Server',
        version: '1.0.0',
        port: PORT,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// MCP Tools endpoint
app.post('/tools/list', authenticate, (req, res) => {
    res.json({
        tools: [
            {
                name: "remember",
                description: "Store a memory with content and metadata",
                inputSchema: {
                    type: "object",
                    properties: {
                        content: {
                            type: "string",
                            description: "The content to remember"
                        },
                        metadata: {
                            type: "object",
                            description: "Additional metadata for the memory",
                            properties: {
                                tags: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                importance: {
                                    type: "number",
                                    minimum: 1,
                                    maximum: 10
                                },
                                project: { type: "string" },
                                session: { type: "string" }
                            }
                        }
                    },
                    required: ["content"]
                }
            },
            {
                name: "recall",
                description: "Search and retrieve memories",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Search query"
                        },
                        limit: {
                            type: "number",
                            description: "Maximum number of results",
                            default: 10
                        },
                        minImportance: {
                            type: "number",
                            description: "Minimum importance score",
                            default: 0
                        }
                    },
                    required: ["query"]
                }
            },
            {
                name: "forget",
                description: "Delete a specific memory",
                inputSchema: {
                    type: "object",
                    properties: {
                        memoryId: {
                            type: "string",
                            description: "ID of the memory to delete"
                        }
                    },
                    required: ["memoryId"]
                }
            },
            {
                name: "context",
                description: "Get recent context and activity",
                inputSchema: {
                    type: "object",
                    properties: {
                        contextSize: {
                            type: "number",
                            description: "Number of recent memories to retrieve",
                            default: 5
                        }
                    }
                }
            }
        ]
    });
});

// MCP Tools execution endpoint
app.post('/tools/call', authenticate, async (req, res) => {
    const { name, arguments: args } = req.body;

    try {
        switch (name) {
            case 'remember':
                const memory = {
                    id: `mem_${memoryCounter++}`,
                    content: args.content,
                    metadata: args.metadata || {},
                    timestamp: new Date().toISOString(),
                    lastAccessed: new Date().toISOString()
                };
                memories.push(memory);

                res.json({
                    content: [{
                        type: "text",
                        text: `Memory stored successfully with ID: ${memory.id}`
                    }],
                    isError: false
                });
                break;

            case 'recall':
                const query = args.query.toLowerCase();
                const limit = args.limit || 10;
                const minImportance = args.minImportance || 0;

                const matchingMemories = memories
                    .filter(memory => {
                        const contentMatch = memory.content.toLowerCase().includes(query);
                        const importance = memory.metadata.importance || 5;
                        return contentMatch && importance >= minImportance;
                    })
                    .sort((a, b) => {
                        const aImportance = a.metadata.importance || 5;
                        const bImportance = b.metadata.importance || 5;
                        return bImportance - aImportance;
                    })
                    .slice(0, limit);

                // Update last accessed time
                matchingMemories.forEach(memory => {
                    memory.lastAccessed = new Date().toISOString();
                });

                res.json({
                    content: [{
                        type: "text",
                        text: `Found ${matchingMemories.length} matching memories:\n\n` +
                            matchingMemories.map(memory =>
                                `ID: ${memory.id}\nContent: ${memory.content}\nImportance: ${memory.metadata.importance || 5}\nTimestamp: ${memory.timestamp}\n`
                            ).join('\n')
                    }],
                    isError: false
                });
                break;

            case 'forget':
                const memoryId = args.memoryId;
                const memoryIndex = memories.findIndex(m => m.id === memoryId);

                if (memoryIndex === -1) {
                    res.json({
                        content: [{
                            type: "text",
                            text: `Memory with ID ${memoryId} not found`
                        }],
                        isError: true
                    });
                } else {
                    memories.splice(memoryIndex, 1);
                    res.json({
                        content: [{
                            type: "text",
                            text: `Memory ${memoryId} deleted successfully`
                        }],
                        isError: false
                    });
                }
                break;

            case 'context':
                const contextSize = args.contextSize || 5;
                const recentMemories = memories
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, contextSize);

                res.json({
                    content: [{
                        type: "text",
                        text: `Recent context (${recentMemories.length} memories):\n\n` +
                            recentMemories.map(memory =>
                                `[${memory.timestamp}] ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}`
                            ).join('\n')
                    }],
                    isError: false
                });
                break;

            default:
                res.status(400).json({
                    content: [{
                        type: "text",
                        text: `Unknown tool: ${name}`
                    }],
                    isError: true
                });
        }
    } catch (error) {
        console.error('Tool execution error:', error);
        res.status(500).json({
            content: [{
                type: "text",
                text: `Error executing tool ${name}: ${error.message}`
            }],
            isError: true
        });
    }
});

// Additional API endpoints for direct usage
app.get('/memories', authenticate, (req, res) => {
    res.json({
        memories: memories,
        total: memories.length,
        timestamp: new Date().toISOString()
    });
});

app.post('/memories', authenticate, (req, res) => {
    const { content, metadata } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    const memory = {
        id: `mem_${memoryCounter++}`,
        content,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
    };

    memories.push(memory);
    res.status(201).json(memory);
});

app.delete('/memories/:id', authenticate, (req, res) => {
    const memoryId = req.params.id;
    const memoryIndex = memories.findIndex(m => m.id === memoryId);

    if (memoryIndex === -1) {
        return res.status(404).json({ error: 'Memory not found' });
    }

    memories.splice(memoryIndex, 1);
    res.json({ message: 'Memory deleted successfully' });
});

// Stats endpoint
app.get('/stats', authenticate, (req, res) => {
    const totalMemories = memories.length;
    const memoryByImportance = memories.reduce((acc, memory) => {
        const importance = memory.metadata.importance || 5;
        acc[importance] = (acc[importance] || 0) + 1;
        return acc;
    }, {});

    res.json({
        totalMemories,
        memoryByImportance,
        serverInfo: {
            name: 'MemorAI MCP Server',
            version: '1.0.0',
            port: PORT,
            uptime: process.uptime()
        },
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🧠 MemorAI MCP Server started successfully!`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log(`📅 Date: ${new Date().toISOString()}`);
    console.log(`🎯 MCP Protocol: 2024-11-05`);
    console.log(`✅ Ready for VS Code MCP integration`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
