import { createServer } from 'http';
import { URL } from 'url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Configuration
const CONFIG = {
  port: parseInt(process.env.PORT || '4952'),
  host: process.env.HOST || '0.0.0.0',
  serverName: 'cautai-mcp-server',
  serverVersion: '1.0.0',
  maxResults: parseInt(process.env.CAUTAI_MAX_RESULTS || '10'),
  defaultLanguage: process.env.CAUTAI_DEFAULT_LANGUAGE || 'en',
};

// Simple logging utility
const log = {
  info: (message: string, ...args: any[]) => 
    console.error(`[${new Date().toISOString()}] INFO: ${message}`, ...args),
  error: (message: string, ...args: any[]) => 
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, ...args),
  warn: (message: string, ...args: any[]) => 
    console.error(`[${new Date().toISOString()}] WARN: ${message}`, ...args),
};

// Mock search implementation for demonstration
class MockSearchEngine {
  async search(query: string, options: { maxResults?: number; language?: string } = {}) {
    const { maxResults = CONFIG.maxResults, language = CONFIG.defaultLanguage } = options;
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    const mockResults = [
      {
        title: `Search results for "${query}"`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Mock search result for query: ${query}. This demonstrates the CAUTAI MCP server capabilities.`,
        timestamp: new Date().toISOString(),
        relevanceScore: 0.95,
        language: language
      },
      {
        title: `Advanced search: ${query}`,
        url: `https://example.com/advanced?q=${encodeURIComponent(query)}`,
        snippet: `Advanced search capabilities for: ${query}. Includes AI-powered ranking and filtering.`,
        timestamp: new Date().toISOString(),
        relevanceScore: 0.87,
        language: language
      }
    ];

    return {
      results: mockResults.slice(0, maxResults),
      totalResults: mockResults.length,
      query: query,
      searchTime: Math.random() * 300 + 50,
      language: language,
      timestamp: new Date().toISOString()
    };
  }
}

// Initialize components
const searchEngine = new MockSearchEngine();
const server = new Server(
  {
    name: CONFIG.serverName,
    version: CONFIG.serverVersion,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Store active transports by session ID
const transports = new Map<string, SSEServerTransport>();

// Configure MCP server handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_web',
        description: 'Search the web using CAUTAI AI search engine',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query to execute',
            },
            maxResults: {
              type: 'number',
              description: `Maximum number of results (default: ${CONFIG.maxResults})`,
              minimum: 1,
              maximum: 50,
            },
            language: {
              type: 'string',
              description: `Language for search results (default: ${CONFIG.defaultLanguage})`,
              enum: ['en', 'ro'],
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'compose_answer',
        description: 'Compose a comprehensive answer based on search results',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The question or topic to research',
            },
            maxSources: {
              type: 'number',
              description: 'Maximum number of sources to use (default: 5)',
              minimum: 1,
              maximum: 20,
            },
            language: {
              type: 'string',
              description: `Language for the composed answer (default: ${CONFIG.defaultLanguage})`,
              enum: ['en', 'ro'],
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_web': {
        const { query, maxResults, language } = args as {
          query: string;
          maxResults?: number;
          language?: string;
        };

        if (!query || typeof query !== 'string') {
          throw new Error('Query is required and must be a string');
        }

        const searchResults = await searchEngine.search(query, { maxResults, language });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(searchResults, null, 2),
            },
          ],
        };
      }

      case 'compose_answer': {
        const { query, maxSources = 5, language } = args as {
          query: string;
          maxSources?: number;
          language?: string;
        };

        if (!query || typeof query !== 'string') {
          throw new Error('Query is required and must be a string');
        }

        const searchResults = await searchEngine.search(query, { maxResults: maxSources, language });

        const composedAnswer = {
          answer: `Based on the search results for "${query}", here's a comprehensive answer:\n\n` +
                 `This is a mock composed answer generated by analyzing ${searchResults.totalResults} ` +
                 `relevant sources in ${searchResults.searchTime.toFixed(0)}ms. The CAUTAI search engine ` +
                 `provides AI-powered search capabilities with advanced ranking and filtering.`,
          sources: searchResults.results.map((result, index) => ({
            id: index + 1,
            title: result.title,
            url: result.url,
            relevance: result.relevanceScore,
            snippet: result.snippet.substring(0, 200) + '...',
          })),
          confidence: 0.85,
          language: language || CONFIG.defaultLanguage,
          generatedAt: new Date().toISOString(),
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(composedAnswer, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        },
      ],
      isError: true,
    };
  }
});

// Create HTTP server
const httpServer = createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url!, `http://${req.headers.host}`);

  // Health check endpoint
  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: CONFIG.serverName,
      version: CONFIG.serverVersion,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      config: {
        port: CONFIG.port,
        host: CONFIG.host,
        maxResults: CONFIG.maxResults,
        defaultLanguage: CONFIG.defaultLanguage,
      }
    }));
    return;
  }

  // SSE endpoint for legacy MCP client connections
  if (url.pathname === '/sse' && req.method === 'GET') {
    try {
      // Create SSE transport for legacy clients (separate /sse and /messages endpoints)
      const transport = new SSEServerTransport('/messages', res);
      
      // Store transport by session ID for message handling
      if (transport.sessionId) {
        transports.set(transport.sessionId, transport);
      }
      
      // Clean up on client disconnect
      req.on('close', () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
        log.info('SSE connection closed');
      });

      req.on('error', (error) => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
        log.error('SSE connection error:', error);
      });

      // Connect server to transport asynchronously
      server.connect(transport).then(() => {
        log.info('New SSE connection established');
      }).catch((error) => {
        log.error('Failed to connect SSE transport:', error);
      });

    } catch (error) {
      log.error('Failed to establish SSE connection:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to establish SSE connection' }));
    }
    return;
  }

  // Messages endpoint for legacy SSE client requests  
  if (url.pathname === '/messages' && req.method === 'POST') {
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing sessionId parameter' }));
      return;
    }

    const transport = transports.get(sessionId);
    if (!transport) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Transport not found for sessionId' }));
      return;
    }

    try {
      // Collect request body
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const message = JSON.parse(body);
          await transport.handlePostMessage(req, res, message);
        } catch (error) {
          log.error('Error handling POST message:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });

    } catch (error) {
      log.error('Error processing message request:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    error: 'Not Found',
    availableEndpoints: [
      'GET /health - Health check',
      'GET /sse - MCP Server-Sent Events endpoint'
    ]
  }));
});

// Start server
async function startServer() {
  try {
    httpServer.listen(CONFIG.port, CONFIG.host, () => {
      log.info(`🚀 CAUTAI MCP HTTP Server started`);
      log.info(`📍 Server running at http://${CONFIG.host}:${CONFIG.port}`);
      log.info(`🔗 MCP SSE endpoint: http://${CONFIG.host}:${CONFIG.port}/sse`);
      log.info(`💚 Health check: http://${CONFIG.host}:${CONFIG.port}/health`);
      log.info(`🛠️  Available tools: search_web, compose_answer`);
    });
  } catch (error) {
    log.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  log.info('Shutting down CAUTAI MCP HTTP Server...');
  httpServer.close(() => {
    log.info('Server shutdown complete');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log.info('Received SIGTERM, shutting down gracefully...');
  httpServer.close(() => {
    log.info('Server shutdown complete');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();