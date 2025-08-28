#!/usr/bin/env node

/**
 * Cautai MCP Server - Standalone Version
 * Simple MCP server for VS Code integration without complex dependencies
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
  type ListToolsRequest,
} from '@modelcontextprotocol/sdk/types.js';

// Simple in-memory search implementation
class SimpleSearchEngine {
  async search(query: string, options: { maxResults?: number; language?: string } = {}) {
    const { maxResults = 10, language = 'en' } = options;
    
    // Mock search results for demo purposes
    const mockResults = [
      {
        title: `Search results for "${query}"`,
        url: 'https://example.com/search',
        snippet: `This is a mock search result for the query: ${query}. In a real implementation, this would connect to search APIs.`,
        timestamp: new Date().toISOString(),
        relevanceScore: 0.95,
        language: language
      },
      {
        title: `Advanced search: ${query}`,
        url: 'https://example.com/advanced',
        snippet: `Advanced search capabilities would be implemented here for: ${query}`,
        timestamp: new Date().toISOString(),
        relevanceScore: 0.87,
        language: language
      }
    ];

    return {
      results: mockResults.slice(0, maxResults),
      totalResults: mockResults.length,
      query: query,
      searchTime: Math.random() * 500 + 100, // Mock search time
      language: language
    };
  }
}

// Create the MCP server
const server = new Server(
  {
    name: 'cautai-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize search engine
const searchEngine = new SimpleSearchEngine();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_web',
        description: 'Search the web for information using the Cautai AI search engine',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query to execute',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of search results to return (default: 10)',
              minimum: 1,
              maximum: 50,
            },
            language: {
              type: 'string',
              description: 'Language for search results (default: en)',
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
              description: 'The question or topic to research and compose an answer for',
            },
            maxSources: {
              type: 'number',
              description: 'Maximum number of sources to use (default: 5)',
              minimum: 1,
              maximum: 20,
            },
            language: {
              type: 'string',
              description: 'Language for the composed answer (default: en)',
              enum: ['en', 'ro'],
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_web': {
        const { query, maxResults = 10, language = 'en' } = args as {
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
        const { query, maxSources = 5, language = 'en' } = args as {
          query: string;
          maxSources?: number;
          language?: string;
        };

        if (!query || typeof query !== 'string') {
          throw new Error('Query is required and must be a string');
        }

        // First, search for information
        const searchResults = await searchEngine.search(query, { maxResults: maxSources, language });

        // Compose a comprehensive answer (mock implementation)
        const composedAnswer = {
          answer: `Based on the search results for "${query}", here's a comprehensive answer:\n\n` +
                 `This is a mock composed answer that would normally be generated by analyzing ` +
                 `the search results and creating a coherent response. The system found ${searchResults.totalResults} ` +
                 `relevant sources and processed them in ${searchResults.searchTime.toFixed(0)}ms.`,
          sources: searchResults.results.map((result, index) => ({
            id: index + 1,
            title: result.title,
            url: result.url,
            relevance: result.relevanceScore,
            snippet: result.snippet.substring(0, 200) + '...'
          })),
          confidence: 0.85,
          language: language,
          generatedAt: new Date().toISOString()
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

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log to stderr so it doesn't interfere with the MCP protocol on stdout
  console.error('Cautai MCP Server started successfully');
  console.error('Available tools: search_web, compose_answer');
  console.error('Ready to accept MCP requests...');
}

// Handle process termination
process.on('SIGINT', async () => {
  console.error('Shutting down Cautai MCP Server...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down Cautai MCP Server...');
  await server.close();
  process.exit(0);
});

main().catch((error) => {
  console.error('Failed to start Cautai MCP Server:', error);
  process.exit(1);
});