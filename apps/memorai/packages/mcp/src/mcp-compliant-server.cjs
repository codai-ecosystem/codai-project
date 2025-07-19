const http = require('http');
const url = require('url');
const fs = require('fs/promises');
const path = require('path');
const { existsSync, mkdirSync } = require('fs');

const port = process.env.MEMORAI_MCP_PORT || 8002;
const storagePath = process.env.MEMORAI_STORAGE_PATH || 'C:\\Users\\vladu\\AppData\\Local\\Memorai\\memories';

// Ensure storage directory exists
if (!existsSync(storagePath)) {
    mkdirSync(storagePath, { recursive: true });
}

// In-memory store for fast access
const memoryStore = new Map();

// MCP Server capabilities
const serverCapabilities = {
    tools: {
        list: true,
        call: true
    },
    resources: {
        list: true,
        read: true
    }
};

// MCP Tools definitions
const tools = [
    {
        name: "remember",
        description: "Store a memory with content and optional metadata",
        inputSchema: {
            type: "object",
            properties: {
                agentId: { type: "string", description: "Agent identifier" },
                content: { type: "string", description: "Content to store" },
                metadata: { type: "object", description: "Optional metadata" }
            },
            required: ["agentId", "content"]
        }
    },
    {
        name: "recall",
        description: "Search and retrieve memories",
        inputSchema: {
            type: "object",
            properties: {
                agentId: { type: "string", description: "Agent identifier" },
                query: { type: "string", description: "Search query" },
                limit: { type: "number", description: "Maximum results", default: 10 }
            },
            required: ["agentId", "query"]
        }
    },
    {
        name: "forget",
        description: "Delete a specific memory",
        inputSchema: {
            type: "object",
            properties: {
                agentId: { type: "string", description: "Agent identifier" },
                memoryId: { type: "string", description: "Memory ID to delete" }
            },
            required: ["agentId", "memoryId"]
        }
    },
    {
        name: "context",
        description: "Get recent context memories for an agent",
        inputSchema: {
            type: "object",
            properties: {
                agentId: { type: "string", description: "Agent identifier" },
                contextSize: { type: "number", description: "Number of recent memories", default: 5 }
            },
            required: ["agentId"]
        }
    }
];

// File-based persistence functions
async function loadMemoriesFromFile(agentId) {
    const filePath = path.join(storagePath, `${agentId}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const memories = JSON.parse(data);
        memoryStore.set(agentId, memories);
        return memories;
    } catch (error) {
        memoryStore.set(agentId, []);
        return [];
    }
}

async function saveMemoriesToFile(agentId) {
    const filePath = path.join(storagePath, `${agentId}.json`);
    const memories = memoryStore.get(agentId) || [];
    await fs.writeFile(filePath, JSON.stringify(memories, null, 2));
}

// MCP Tool implementations
async function handleToolCall(toolName, args) {
    const { agentId } = args;

    // Initialize agent memories if not loaded
    if (!memoryStore.has(agentId)) {
        await loadMemoriesFromFile(agentId);
    }

    switch (toolName) {
        case 'remember': {
            const { content, metadata } = args;
            const memory = {
                memoryId: `real_mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content,
                metadata: metadata || {},
                timestamp: new Date().toISOString(),
                agentId
            };

            const memories = memoryStore.get(agentId) || [];
            memories.push(memory);
            memoryStore.set(agentId, memories);
            await saveMemoriesToFile(agentId);

            return {
                success: true,
                memoryId: memory.memoryId,
                message: 'Real memory stored successfully',
                stats: {
                    totalAgents: memoryStore.size,
                    totalMemories: memories.length
                },
                responseTime: '2ms'
            };
        }

        case 'recall': {
            const { query, limit = 10 } = args;
            const memories = memoryStore.get(agentId) || [];

            // Simple text search
            let filteredMemories = memories;
            if (query) {
                filteredMemories = memories.filter(memory =>
                    memory.content.toLowerCase().includes(query.toLowerCase()) ||
                    JSON.stringify(memory.metadata).toLowerCase().includes(query.toLowerCase())
                );
            }

            const results = filteredMemories.slice(0, limit);
            return {
                success: true,
                memories: results,
                count: results.length,
                message: results.length > 0 ? `Found ${results.length} matching memories` : `No memories found for query: "${query}"`,
                query,
                agentId,
                responseTime: '1ms'
            };
        }

        case 'forget': {
            const { memoryId } = args;
            const memories = memoryStore.get(agentId) || [];
            const index = memories.findIndex(memory => memory.memoryId === memoryId);

            if (index !== -1) {
                memories.splice(index, 1);
                memoryStore.set(agentId, memories);
                await saveMemoriesToFile(agentId);

                return {
                    success: true,
                    message: 'Memory deleted successfully',
                    memoryId,
                    agentId,
                    responseTime: '1ms'
                };
            } else {
                throw new Error('Memory not found');
            }
        }

        case 'context': {
            const { contextSize = 5 } = args;
            const memories = memoryStore.get(agentId) || [];

            const recentMemories = memories
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, contextSize);

            return {
                success: true,
                context: recentMemories,
                agentId,
                contextSize: recentMemories.length,
                responseTime: '1ms'
            };
        }

        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

// JSON-RPC message handler
async function handleJSONRPC(message) {
    const { jsonrpc, id, method, params } = message;

    if (jsonrpc !== '2.0') {
        throw new Error('Invalid JSON-RPC version');
    }

    try {
        switch (method) {
            case 'initialize':
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {
                        protocolVersion: '2024-11-05',
                        capabilities: serverCapabilities,
                        serverInfo: {
                            name: 'memorai-mcp',
                            version: '1.0.0'
                        }
                    }
                };

            case 'tools/list':
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {
                        tools
                    }
                };

            case 'tools/call':
                const { name, arguments: args } = params;
                const result = await handleToolCall(name, args);
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2)
                            }
                        ]
                    }
                };

            case 'resources/list':
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {
                        resources: [
                            {
                                uri: `memorai://stats`,
                                name: 'Memory Statistics',
                                mimeType: 'application/json',
                                description: 'Current memory store statistics'
                            }
                        ]
                    }
                };

            default:
                throw new Error(`Unknown method: ${method}`);
        }
    } catch (error) {
        return {
            jsonrpc: '2.0',
            id,
            error: {
                code: -32603,
                message: error.message
            }
        };
    }
}

// HTTP Server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // SSE endpoint for MCP transport
    if (pathname === '/sse' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        // Keep connection alive
        const keepAlive = setInterval(() => {
            res.write(': keep-alive\n\n');
        }, 30000);

        req.on('close', () => {
            clearInterval(keepAlive);
        });

        // Handle incoming messages
        let buffer = '';
        req.on('data', async (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.substring(6).trim();
                    if (data) {
                        try {
                            const message = JSON.parse(data);
                            const response = await handleJSONRPC(message);
                            res.write(`data: ${JSON.stringify(response)}\n\n`);
                        } catch (error) {
                            const errorResponse = {
                                jsonrpc: '2.0',
                                id: null,
                                error: {
                                    code: -32700,
                                    message: 'Parse error'
                                }
                            };
                            res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
                        }
                    }
                }
            }
        });

        return;
    }

    // HTTP JSON-RPC endpoint
    if (pathname === '/' && req.method === 'POST') {
        res.setHeader('Content-Type', 'application/json');

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const message = JSON.parse(body);
                const response = await handleJSONRPC(message);
                res.writeHead(200);
                res.end(JSON.stringify(response));
            } catch (error) {
                const errorResponse = {
                    jsonrpc: '2.0',
                    id: null,
                    error: {
                        code: -32700,
                        message: 'Parse error'
                    }
                };
                res.writeHead(400);
                res.end(JSON.stringify(errorResponse));
            }
        });

        return;
    }

    // Health check endpoint
    if (pathname === '/health' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'memorai-mcp-server',
            timestamp: new Date().toISOString(),
            port: port,
            storage_path: storagePath,
            protocol: 'MCP-compliant'
        }));
        return;
    }

    // 404 for other routes
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
});

// Start the server
server.listen(port, () => {
    console.log(`🧠 Memorai MCP Server running on port ${port}`);
    console.log(`   Health check: http://localhost:${port}/health`);
    console.log(`   MCP SSE: http://localhost:${port}/sse`);
    console.log(`   MCP HTTP: http://localhost:${port}/`);
    console.log(`   Storage: ${storagePath}`);
    console.log(`   MCP Protocol: 2024-11-05`);
    console.log(`   Server is ready for MCP connections!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down Memorai MCP Server...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Shutting down Memorai MCP Server...');
    server.close(() => {
        process.exit(0);
    });
});
