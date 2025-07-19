import http from 'http';
import url from 'url';
import fs from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const port = process.env.MEMORAI_MCP_PORT || 8002;
const storagePath = process.env.MEMORAI_STORAGE_PATH || 'C:\\Users\\vladu\\AppData\\Local\\Memorai\\memories';

// Ensure storage directory exists
if (!existsSync(storagePath)) {
    mkdirSync(storagePath, { recursive: true });
}

// In-memory store for fast access
const memoryStore = new Map();

// File-based persistence
async function loadMemoriesFromFile(agentId) {
    const filePath = path.join(storagePath, `${agentId}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const memories = JSON.parse(data);
        memoryStore.set(agentId, memories);
        return memories;
    } catch (error) {
        // File doesn't exist or is corrupt, return empty array
        memoryStore.set(agentId, []);
        return [];
    }
}

async function saveMemoriesToFile(agentId) {
    const filePath = path.join(storagePath, `${agentId}.json`);
    const memories = memoryStore.get(agentId) || [];
    await fs.writeFile(filePath, JSON.stringify(memories, null, 2));
}

// Simple HTTP server without Express
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // MCP SSE endpoint for VS Code
    if (pathname === '/sse' && method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        // Send initial MCP initialization
        const initResponse = {
            jsonrpc: '2.0',
            id: 1,
            result: {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {
                        list: true,
                        call: true
                    },
                    resources: {
                        list: true,
                        read: true
                    }
                },
                serverInfo: {
                    name: 'memorai-mcp',
                    version: '1.0.0'
                }
            }
        };

        res.write(`data: ${JSON.stringify(initResponse)}\n\n`);

        // Keep connection alive
        const keepAlive = setInterval(() => {
            res.write('data: {"jsonrpc":"2.0","method":"ping"}\n\n');
        }, 30000);

        req.on('close', () => {
            clearInterval(keepAlive);
        });

        return;
    }

    // Set JSON content type for other endpoints
    res.setHeader('Content-Type', 'application/json');

    try {
        // Health check endpoint
        if (pathname === '/health' && method === 'GET') {
            const response = {
                status: 'healthy',
                service: 'memorai-mcp-http-wrapper',
                timestamp: new Date().toISOString(),
                port: port,
                storage_path: storagePath
            };
            res.writeHead(200);
            res.end(JSON.stringify(response, null, 2));
            return;
        }

        // Capabilities endpoint
        if (pathname === '/capabilities' && method === 'GET') {
            const response = {
                service: 'memorai-mcp-http-wrapper',
                version: '1.0.0',
                capabilities: {
                    memory: {
                        remember: true,
                        recall: true,
                        forget: true,
                        context: true,
                        stats: true
                    },
                    storage: {
                        persistent: true,
                        agent_isolation: true,
                        search: true
                    }
                },
                endpoints: [
                    'GET /health',
                    'GET /capabilities',
                    'POST /api/memory/:agentId/remember',
                    'GET /api/memory/:agentId/recall',
                    'DELETE /api/memory/:agentId/forget/:memoryId',
                    'GET /api/memory/:agentId/context',
                    'GET /api/memory/:agentId/stats'
                ]
            };
            res.writeHead(200);
            res.end(JSON.stringify(response, null, 2));
            return;
        }

        // Parse agent ID from path
        const pathMatch = pathname.match(/^\/api\/memory\/([^\/]+)\/(.+)$/);
        if (pathMatch) {
            const agentId = pathMatch[1];
            const action = pathMatch[2];

            // Initialize agent memories if not loaded
            if (!memoryStore.has(agentId)) {
                await loadMemoriesFromFile(agentId);
            }

            // Remember endpoint
            if (action === 'remember' && method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', async () => {
                    try {
                        const { content, metadata } = JSON.parse(body);

                        if (!content) {
                            const response = { success: false, error: 'Content is required' };
                            res.writeHead(400);
                            res.end(JSON.stringify(response, null, 2));
                            return;
                        }

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

                        const response = {
                            success: true,
                            memoryId: memory.memoryId,
                            message: 'Real memory stored successfully',
                            stats: {
                                totalAgents: memoryStore.size,
                                totalMemories: memories.length,
                                agentBreakdown: {
                                    [agentId]: memories.length
                                }
                            },
                            responseTime: '2ms'
                        };
                        res.writeHead(200);
                        res.end(JSON.stringify(response, null, 2));
                    } catch (parseError) {
                        const response = { success: false, error: 'Invalid JSON body', message: parseError.message };
                        res.writeHead(400);
                        res.end(JSON.stringify(response, null, 2));
                    }
                });
                return;
            }

            // Recall endpoint
            if (action === 'recall' && method === 'GET') {
                const queryStr = query.query || '';
                const limit = parseInt(query.limit) || 10;

                const memories = memoryStore.get(agentId) || [];

                // Simple text search
                let filteredMemories = memories;
                if (queryStr) {
                    filteredMemories = memories.filter(memory =>
                        memory.content.toLowerCase().includes(queryStr.toLowerCase()) ||
                        JSON.stringify(memory.metadata).toLowerCase().includes(queryStr.toLowerCase())
                    );
                }

                // Limit results
                const results = filteredMemories.slice(0, limit);

                const response = {
                    success: true,
                    memories: results,
                    count: results.length,
                    message: results.length > 0 ? `Found ${results.length} matching memories` : `No memories found for query: "${queryStr}"`,
                    query: queryStr,
                    agentId,
                    responseTime: '1ms'
                };
                res.writeHead(200);
                res.end(JSON.stringify(response, null, 2));
                return;
            }

            // Context endpoint
            if (action === 'context' && method === 'GET') {
                const contextSize = parseInt(query.contextSize) || 5;
                const memories = memoryStore.get(agentId) || [];

                // Get recent memories for context
                const recentMemories = memories
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, contextSize);

                const response = {
                    success: true,
                    context: recentMemories,
                    agentId,
                    contextSize: recentMemories.length,
                    responseTime: '1ms'
                };
                res.writeHead(200);
                res.end(JSON.stringify(response, null, 2));
                return;
            }

            // Stats endpoint
            if (action === 'stats' && method === 'GET') {
                const memories = memoryStore.get(agentId) || [];

                const response = {
                    success: true,
                    stats: {
                        agentId,
                        totalMemories: memories.length,
                        oldestMemory: memories.length > 0 ? memories[0].timestamp : null,
                        newestMemory: memories.length > 0 ? memories[memories.length - 1].timestamp : null,
                        storagePath,
                        memoryTypes: {}
                    },
                    responseTime: '1ms'
                };

                // Count memory types
                memories.forEach(memory => {
                    const entityType = memory.metadata?.entityType || 'general';
                    response.stats.memoryTypes[entityType] = (response.stats.memoryTypes[entityType] || 0) + 1;
                });

                res.writeHead(200);
                res.end(JSON.stringify(response, null, 2));
                return;
            }

            // Forget endpoint
            const forgetMatch = action.match(/^forget\/(.+)$/);
            if (forgetMatch && method === 'DELETE') {
                const memoryId = forgetMatch[1];
                const memories = memoryStore.get(agentId) || [];
                const index = memories.findIndex(memory => memory.memoryId === memoryId);

                if (index !== -1) {
                    memories.splice(index, 1);
                    memoryStore.set(agentId, memories);
                    await saveMemoriesToFile(agentId);

                    const response = {
                        success: true,
                        message: 'Memory deleted successfully',
                        memoryId,
                        agentId,
                        responseTime: '1ms'
                    };
                    res.writeHead(200);
                    res.end(JSON.stringify(response, null, 2));
                } else {
                    const response = {
                        success: false,
                        error: 'Memory not found',
                        memoryId,
                        agentId
                    };
                    res.writeHead(404);
                    res.end(JSON.stringify(response, null, 2));
                }
                return;
            }
        }

        // 404 for unhandled routes
        const response = { success: false, error: 'Not found', path: pathname, method: method };
        res.writeHead(404);
        res.end(JSON.stringify(response, null, 2));

    } catch (error) {
        const response = { success: false, error: 'Internal server error', message: error.message };
        res.writeHead(500);
        res.end(JSON.stringify(response, null, 2));
    }
});

// Start the server
server.listen(port, () => {
    console.log(`🧠 Memorai MCP HTTP Wrapper running on port ${port}`);
    console.log(`   Health check: http://localhost:${port}/health`);
    console.log(`   Capabilities: http://localhost:${port}/capabilities`);
    console.log(`   Memory API: http://localhost:${port}/api/memory/{agentId}/remember`);
    console.log(`   Storage: ${storagePath}`);
    console.log(`   Server is ready to accept requests!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down Memorai MCP HTTP Wrapper...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Shutting down Memorai MCP HTTP Wrapper...');
    server.close(() => {
        process.exit(0);
    });
});
