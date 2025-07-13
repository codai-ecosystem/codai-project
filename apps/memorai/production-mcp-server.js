#!/usr/bin/env node
/**
 * PRODUCTION MemorAI MCP Server - Real Memory Storage
 * Enterprise-grade implementation with persistent storage
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

class ProductionMemoryEngine {
  constructor() {
    this.dataDir = path.join(os.homedir(), '.memorai-mcp-data');
    this.memoryFile = path.join(this.dataDir, 'memories.json');
    this.metrics = {
      totalQueries: 0,
      avgResponseTime: 0,
      cacheHitRate: 0,
      operationsPerSecond: 0,
      cacheSize: 0,
      memoryEfficiency: 1
    };
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });

      // Load existing memories or create empty storage
      try {
        const data = await fs.readFile(this.memoryFile, 'utf8');
        this.memories = JSON.parse(data);
      } catch {
        this.memories = {};
        await this.saveMemories();
      }

      console.error('🎯 PRODUCTION MemorAI MCP Server initialized with persistent storage');
    } catch (error) {
      console.error('❌ Failed to initialize memory storage:', error);
      this.memories = {}; // Fallback to in-memory
    }
  }

  async saveMemories() {
    try {
      await fs.writeFile(this.memoryFile, JSON.stringify(this.memories, null, 2));
    } catch (error) {
      console.error('❌ Failed to save memories:', error);
    }
  }

  async remember(params) {
    const startTime = Date.now();

    const memoryId = `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;

    const memory = {
      id: memoryId,
      content: params.content,
      agentId: params.agentId,
      metadata: params.metadata || {},
      timestamp: new Date().toISOString(),
      type: params.metadata?.entityType || 'general',
      importance: params.metadata?.priority === 'high' ? 0.9 :
        params.metadata?.priority === 'medium' ? 0.7 : 0.5
    };

    this.memories[memoryId] = memory;
    await this.saveMemories();

    const responseTime = Date.now() - startTime;
    this.updateMetrics(responseTime);

    return {
      success: true,
      memoryId,
      message: 'Memory stored successfully in persistent storage',
      debug: {
        requestId: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        contentLength: params.content.length,
        agentId: params.agentId,
        storageType: 'persistent-file'
      },
      performance: {
        responseTime: `${responseTime}ms`,
        requestId: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        serverType: 'production-persistent',
        metrics: this.metrics,
        timestamp: new Date().toISOString()
      }
    };
  }

  async recall(params) {
    const startTime = Date.now();

    const query = params.query.toLowerCase();
    const agentId = params.agentId;
    const limit = params.limit || 10;

    // Search through actual stored memories
    const relevantMemories = [];

    for (const [id, memory] of Object.entries(this.memories)) {
      // Filter by agent if specified
      if (agentId !== 'all' && memory.agentId !== agentId) {
        continue;
      }

      // Calculate relevance based on content matching
      let relevance = 0;
      const content = memory.content.toLowerCase();
      const queryTerms = query.split(' ').filter(term => term.length > 2);

      for (const term of queryTerms) {
        if (content.includes(term)) {
          relevance += 0.3;
        }
      }

      // Boost relevance for metadata matches
      if (memory.metadata) {
        const metadataStr = JSON.stringify(memory.metadata).toLowerCase();
        for (const term of queryTerms) {
          if (metadataStr.includes(term)) {
            relevance += 0.2;
          }
        }
      }

      if (relevance > 0.1) {
        relevantMemories.push({
          id: memory.id,
          content: memory.content, // Return ACTUAL stored content
          relevance: Math.min(relevance, 1.0),
          metadata: memory.metadata,
          timestamp: memory.timestamp
        });
      }
    }

    // Sort by relevance and apply limit
    relevantMemories.sort((a, b) => b.relevance - a.relevance);
    const results = relevantMemories.slice(0, limit);

    const responseTime = Date.now() - startTime;
    this.updateMetrics(responseTime);

    return {
      success: true,
      memories: results,
      count: results.length,
      message: 'Found memories from persistent storage',
      debug: {
        requestId: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        queryLength: query.length,
        searchLimit: limit,
        cacheStatus: 'miss',
        agentId: params.agentId
      },
      performance: {
        responseTime: `${responseTime}ms`,
        requestId: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        serverType: 'production-persistent',
        metrics: this.metrics,
        timestamp: new Date().toISOString()
      }
    };
  }

  async forget(params) {
    const startTime = Date.now();

    const memoryId = params.memoryId;
    const exists = this.memories[memoryId] !== undefined;

    if (exists) {
      delete this.memories[memoryId];
      await this.saveMemories();
    }

    const responseTime = Date.now() - startTime;
    this.updateMetrics(responseTime);

    return {
      success: exists,
      message: exists ? 'Memory deleted successfully' : 'Memory not found',
      debug: {
        requestId: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        memoryId,
        existed: exists
      },
      performance: {
        responseTime: `${responseTime}ms`,
        serverType: 'production-persistent',
        timestamp: new Date().toISOString()
      }
    };
  }

  async context(params) {
    const startTime = Date.now();

    const agentId = params.agentId;
    const contextSize = params.contextSize || 5;

    // Get recent memories for the agent
    const agentMemories = Object.values(this.memories)
      .filter(memory => memory.agentId === agentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, contextSize);

    const responseTime = Date.now() - startTime;
    this.updateMetrics(responseTime);

    return {
      success: true,
      context: agentMemories.map(memory => ({
        id: memory.id,
        content: memory.content,
        metadata: memory.metadata,
        timestamp: memory.timestamp
      })),
      count: agentMemories.length,
      message: 'Context retrieved from persistent storage',
      debug: {
        requestId: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        agentId,
        contextSize,
        totalMemories: Object.keys(this.memories).length
      }
    };
  }

  updateMetrics(responseTime) {
    this.metrics.totalQueries++;
    this.metrics.avgResponseTime =
      ((this.metrics.avgResponseTime * (this.metrics.totalQueries - 1)) + responseTime) /
      this.metrics.totalQueries;
    this.metrics.cacheSize = Object.keys(this.memories).length;
  }
}

class ProductionMCPServer {
  constructor() {
    this.memoryEngine = new ProductionMemoryEngine();
    this.server = new Server(
      {
        name: 'memorai-production-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'remember',
          description: 'Store a memory with content and metadata',
          inputSchema: {
            type: 'object',
            properties: {
              agentId: { type: 'string', description: 'Agent identifier' },
              content: { type: 'string', description: 'Memory content to store' },
              metadata: { type: 'object', description: 'Additional metadata' }
            },
            required: ['agentId', 'content']
          }
        },
        {
          name: 'recall',
          description: 'Search and retrieve memories',
          inputSchema: {
            type: 'object',
            properties: {
              agentId: { type: 'string', description: 'Agent identifier' },
              query: { type: 'string', description: 'Search query' },
              limit: { type: 'number', description: 'Maximum results' }
            },
            required: ['agentId', 'query']
          }
        },
        {
          name: 'forget',
          description: 'Delete a specific memory',
          inputSchema: {
            type: 'object',
            properties: {
              agentId: { type: 'string', description: 'Agent identifier' },
              memoryId: { type: 'string', description: 'Memory ID to delete' }
            },
            required: ['agentId', 'memoryId']
          }
        },
        {
          name: 'context',
          description: 'Get recent context for an agent',
          inputSchema: {
            type: 'object',
            properties: {
              agentId: { type: 'string', description: 'Agent identifier' },
              contextSize: { type: 'number', description: 'Number of recent memories' }
            },
            required: ['agentId']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'remember':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await this.memoryEngine.remember(args))
                }
              ]
            };

          case 'recall':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await this.memoryEngine.recall(args))
                }
              ]
            };

          case 'forget':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await this.memoryEngine.forget(args))
                }
              ]
            };

          case 'context':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await this.memoryEngine.context(args))
                }
              ]
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message
              })
            }
          ],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Production MemorAI MCP Server running with persistent storage!');
  }
}

// Start the production server
const server = new ProductionMCPServer();
server.run().catch(console.error);
