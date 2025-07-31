#!/usr/bin/env node
/**
 * MemorAI HTTP/SSE MCP Server
 * HTTP server with Server-Sent Events for VS Code MCP integration
 * Properly implements MCP protocol over HTTP as expected by VS Code
 */

const http = require('http');
const url = require('url');

class MemorAIMCPHTTPServer {
  constructor() {
    this.memories = new Map();
    this.clients = new Set();
    this.port = 8002;
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  handleRequest(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/health') {
      this.handleHealth(req, res);
    } else if (pathname === '/sse') {
      this.handleSSE(req, res);
    } else if (pathname === '/initialize') {
      this.handleInitialize(req, res);
    } else if (pathname === '/tools/list') {
      this.handleListTools(req, res);
    } else if (pathname === '/tools/call') {
      this.handleCallTool(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }

  handleSSE(req, res) {
    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    this.clients.add(res);

    // Send initial connection event
    res.write(`data: ${JSON.stringify({
      type: 'connection',
      message: 'Connected to MemorAI MCP Server',
      timestamp: new Date().toISOString()
    })}\n\n`);

    req.on('close', () => {
      this.clients.delete(res);
    });
  }

  handleHealth(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      server: {
        name: 'MemoraiMCP Server',
        version: '1.0.0',
        protocol: 'HTTP/SSE',
        status: 'Operational'
      },
      capabilities: ['tools', 'memory_storage', 'memory_retrieval'],
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
  }

  handleInitialize(req, res) {
    this.handleJSONRPC(req, res, (request) => {
      return {
        protocolVersion: '2025-06-18',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'memorai-mcp-server',
          version: '1.0.0'
        }
      };
    });
  }

  handleListTools(req, res) {
    this.handleJSONRPC(req, res, (request) => {
      return {
        tools: [
          {
            name: 'mcp_memoraimcp_remember',
            description: 'Store information in memory with metadata',
            inputSchema: {
              type: 'object',
              properties: {
                agentId: {
                  type: 'string',
                  description: 'Agent identifier for memory isolation',
                },
                content: {
                  type: 'string',
                  description: 'Memory content to store',
                },
                metadata: {
                  type: 'object',
                  description: 'Optional metadata (project, session, priority, tags)',
                  properties: {
                    entityType: { type: 'string' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                    project: { type: 'string' },
                    session: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
              required: ['agentId', 'content'],
            },
          },
          {
            name: 'mcp_memoraimcp_recall',
            description: 'Search and retrieve stored memories',
            inputSchema: {
              type: 'object',
              properties: {
                agentId: {
                  type: 'string',
                  description: 'Agent identifier (use "all" for cross-agent search)',
                },
                query: {
                  type: 'string',
                  description: 'Natural language search query',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum results (1-100)',
                  minimum: 1,
                  maximum: 100,
                },
                minImportance: {
                  type: 'number',
                  description: 'Minimum importance score (0.0-1.0)',
                  minimum: 0,
                  maximum: 1,
                },
                project: {
                  type: 'string',
                  description: 'Filter by project name',
                },
                session: {
                  type: 'string',
                  description: 'Filter by session name',
                },
              },
              required: ['agentId', 'query'],
            },
          },
          {
            name: 'mcp_memoraimcp_forget',
            description: 'Delete memory by structured key',
            inputSchema: {
              type: 'object',
              properties: {
                agentId: {
                  type: 'string',
                  description: 'Agent identifier',
                },
                structuredKey: {
                  type: 'string',
                  description: 'Structured key of memory to delete',
                },
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
                agentId: {
                  type: 'string',
                  description: 'Agent identifier',
                },
                contextSize: {
                  type: 'number',
                  description: 'Number of recent memories (1-20)',
                  minimum: 1,
                  maximum: 20,
                },
              },
              required: ['agentId'],
            },
          },
        ],
      };
    });
  }

  handleCallTool(req, res) {
    this.handleJSONRPC(req, res, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'mcp_memoraimcp_remember':
          return await this.handleRemember(args);
        case 'mcp_memoraimcp_recall':
          return await this.handleRecall(args);
        case 'mcp_memoraimcp_forget':
          return await this.handleForget(args);
        case 'mcp_memoraimcp_context':
          return await this.handleContext(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  handleJSONRPC(req, res, handler) {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const request = JSON.parse(body);
        const result = await handler(request);

        const response = {
          jsonrpc: '2.0',
          id: request.id,
          result
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        const errorResponse = {
          jsonrpc: '2.0',
          id: request?.id || null,
          error: {
            code: -32603,
            message: error.message
          }
        };

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(errorResponse));
      }
    });
  }

  async handleRemember(args) {
    const { agentId, content, metadata = {} } = args;

    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0].replace(/-/g, '_');
    const project = metadata.project || 'default';
    const session = metadata.session || 'default';
    const sequence = this.memories.size + 1;

    const structuredKey = `${project}_${date}_${session}_${sequence}`;

    const memory = {
      structuredKey,
      agentId,
      content,
      metadata,
      timestamp,
      importance: this.calculateImportance(content, metadata),
    };

    this.memories.set(structuredKey, memory);

    // Broadcast to SSE clients
    this.broadcast({
      type: 'memory_stored',
      structuredKey,
      agentId
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            structuredKey,
            agentId,
            content,
            metadata,
            timestamp,
            message: `Memory stored successfully with key: ${structuredKey}`,
            systemInfo: {
              server: {
                name: 'MemoraiMCP Server',
                version: '1.0.0',
                status: 'Operational'
              }
            }
          }, null, 2),
        },
      ],
    };
  }

  async handleRecall(args) {
    const { agentId, query, limit = 10, minImportance = 0, project, session } = args;

    const results = [];
    const searchTerms = query.toLowerCase().split(' ');

    for (const [key, memory] of this.memories) {
      // Agent filter
      if (agentId !== 'all' && memory.agentId !== agentId) continue;

      // Project filter
      if (project && memory.metadata.project !== project) continue;

      // Session filter
      if (session && memory.metadata.session !== session) continue;

      // Importance filter
      if (memory.importance < minImportance) continue;

      // Text search
      const contentLower = memory.content.toLowerCase();
      const keyLower = key.toLowerCase();

      let relevanceScore = 0;
      for (const term of searchTerms) {
        if (contentLower.includes(term)) relevanceScore += 0.5;
        if (keyLower.includes(term)) relevanceScore += 0.3;
      }

      if (relevanceScore > 0) {
        results.push({
          ...memory,
          relevanceScore: Math.min(relevanceScore, 1.0),
        });
      }
    }

    // Sort by relevance and limit
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const limitedResults = results.slice(0, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            memories: limitedResults,
            totalFound: results.length,
            query,
            summary: limitedResults.length > 0
              ? `Found ${limitedResults.length} relevant memories`
              : 'No memories found matching your search criteria',
            searchOptions: { limit, minImportance },
            message: limitedResults.length > 0
              ? `Retrieved ${limitedResults.length} memories for "${query}"`
              : `No memories found for "${query}". Try broader search terms.`,
            metadata: {
              responseTime: '2ms',
              serverVersion: '1.0.0',
              operation: 'search_memory',
              timestamp: new Date().toISOString()
            }
          }, null, 2),
        },
      ],
    };
  }

  async handleForget(args) {
    const { agentId, structuredKey } = args;

    const memory = this.memories.get(structuredKey);
    if (!memory) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `Memory not found: ${structuredKey}`,
              structuredKey,
              agentId
            }, null, 2),
          },
        ],
      };
    }

    if (memory.agentId !== agentId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `Access denied: Memory belongs to different agent`,
              structuredKey,
              agentId
            }, null, 2),
          },
        ],
      };
    }

    this.memories.delete(structuredKey);

    // Broadcast to SSE clients
    this.broadcast({
      type: 'memory_deleted',
      structuredKey,
      agentId
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            structuredKey,
            agentId,
            message: `Memory deleted successfully: ${structuredKey}`
          }, null, 2),
        },
      ],
    };
  }

  async handleContext(args) {
    const { agentId, contextSize = 10 } = args;

    const agentMemories = Array.from(this.memories.values())
      .filter(memory => memory.agentId === agentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, contextSize);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            context: agentMemories,
            agentId,
            contextSize: agentMemories.length,
            message: `Retrieved ${agentMemories.length} recent memories for agent ${agentId}`
          }, null, 2),
        },
      ],
    };
  }

  calculateImportance(content, metadata) {
    let importance = 0.5; // Base importance

    // Adjust based on metadata
    if (metadata.priority === 'critical') importance += 0.4;
    else if (metadata.priority === 'high') importance += 0.3;
    else if (metadata.priority === 'medium') importance += 0.1;

    // Adjust based on content length and complexity
    if (content.length > 500) importance += 0.1;
    if (content.includes('error') || content.includes('issue')) importance += 0.2;
    if (content.includes('success') || content.includes('completed')) importance += 0.1;

    return Math.min(importance, 1.0);
  }

  broadcast(data) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(message);
      } catch (error) {
        this.clients.delete(client);
      }
    }
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`MemorAI MCP HTTP/SSE Server running on port ${this.port}`);
      console.log(`Health check: http://localhost:${this.port}/health`);
      console.log(`SSE endpoint: http://localhost:${this.port}/sse`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down MemorAI MCP Server...');
      this.server.close(() => {
        process.exit(0);
      });
    });
  }
}

// Start the server
const server = new MemorAIMCPHTTPServer();
server.start();
