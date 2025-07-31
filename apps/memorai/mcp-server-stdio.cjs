#!/usr/bin/env node
/**
 * MemorAI MCP Server
 * JSON-RPC 2.0 MCP Server for VS Code integration
 * Simple implementation without external MCP SDK dependencies
 */

// Log startup information
process.stderr.write(`Starting MemorAI MCP Server...\n`);
process.stderr.write(`Working directory: ${process.cwd()}\n`);
process.stderr.write(`Script path: ${__filename}\n`);
process.stderr.write(`Node version: ${process.version}\n`);
process.stderr.write(`Process arguments: ${JSON.stringify(process.argv)}\n`);

const readline = require('readline');

class MemorAIMCPServer {
  constructor() {
    this.memories = new Map();
    this.setupJSONRPCServer();
  }

  setupJSONRPCServer() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', (line) => {
      try {
        const request = JSON.parse(line);
        this.handleRequest(request);
      } catch (error) {
        process.stderr.write(`Parse error: ${error.message}\n`);
        this.sendError(-32700, 'Parse error', null);
      }
    });

    rl.on('close', () => {
      process.stderr.write('MCP Server stdin closed\n');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      process.stderr.write('MCP Server received SIGINT\n');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      process.stderr.write('MCP Server received SIGTERM\n');
      process.exit(0);
    });
  }

  async handleRequest(request) {
    const { jsonrpc, id, method, params } = request;

    process.stderr.write(`Received request: ${method}\n`);

    if (jsonrpc !== '2.0') {
      this.sendError(-32600, 'Invalid Request', id);
      return;
    }

    try {
      switch (method) {
        case 'initialize':
          this.handleInitialize(id, params);
          break;
        case 'tools/list':
          this.handleListTools(id);
          break;
        case 'tools/call':
          await this.handleCallTool(id, params);
          break;
        case 'notifications/initialized':
          // Just acknowledge the notification
          break;
        default:
          process.stderr.write(`Unknown method: ${method}\n`);
          this.sendError(-32601, 'Method not found', id);
      }
    } catch (error) {
      process.stderr.write(`Error handling request: ${error.message}\n`);
      this.sendError(-32603, 'Internal error', id);
    }
  }

  handleInitialize(id, params) {
    process.stderr.write('Handling initialize request\n');
    this.sendResponse(id, {
      protocolVersion: '2025-06-18',
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: 'memorai-mcp-server',
        version: '1.0.0'
      }
    });
  }

  handleListTools(id) {
    this.sendResponse(id, {
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
    });
  }

  async handleCallTool(id, params) {
    const { name, arguments: args } = params;

    switch (name) {
      case 'mcp_memoraimcp_remember':
        this.sendResponse(id, await this.handleRemember(args));
        break;
      case 'mcp_memoraimcp_recall':
        this.sendResponse(id, await this.handleRecall(args));
        break;
      case 'mcp_memoraimcp_forget':
        this.sendResponse(id, await this.handleForget(args));
        break;
      case 'mcp_memoraimcp_context':
        this.sendResponse(id, await this.handleContext(args));
        break;
      default:
        this.sendError(-32601, `Unknown tool: ${name}`, id);
    }
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

  sendResponse(id, result) {
    const response = {
      jsonrpc: '2.0',
      id,
      result
    };
    console.log(JSON.stringify(response));
  }

  sendError(code, message, id) {
    const response = {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };
    console.log(JSON.stringify(response));
  }
}

// Start the server
console.error('Starting MemorAI MCP Server...');
const server = new MemorAIMCPServer();
console.error('MemorAI MCP Server running on stdio');
