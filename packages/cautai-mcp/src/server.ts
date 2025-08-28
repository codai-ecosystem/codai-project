/**
 * @fileoverview Cautai MCP Server implementation
 * @author Cautai Team
 * @version 1.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { SearchTool } from './tools/search-v2.js';
import { ComposeTool } from './tools/compose.js';
import { CitationTool } from './tools/citations.js';
import { defaultConfig, CautaiConfig } from './config.js';

export class CautaiMCPServer {
  private server: Server;
  private config: CautaiConfig;
  private searchTool: SearchTool;
  private composeTool: ComposeTool;
  private citationTool: CitationTool;

  constructor(config: Partial<CautaiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.server = new Server(
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

    this.searchTool = new SearchTool();
    this.composeTool = new ComposeTool(this.config);
    this.citationTool = new CitationTool(this.config);

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_web',
            description: 'Search the web for information with advanced filtering and AI-powered ranking',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query text',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 10)',
                  default: 10,
                },
                language: {
                  type: 'string',
                  enum: ['en', 'ro'],
                  description: 'Search language (default: en)',
                  default: 'en',
                },
                mode: {
                  type: 'string',
                  enum: ['ai', 'basic'],
                  description: 'Search mode (default: ai)',
                  default: 'ai',
                },
                filters: {
                  type: 'object',
                  description: 'Advanced search filters',
                  properties: {
                    domain: {
                      type: 'string',
                      description: 'Filter by specific domain',
                    },
                    dateRange: {
                      type: 'object',
                      properties: {
                        start: { type: 'string', description: 'Start date (ISO string)' },
                        end: { type: 'string', description: 'End date (ISO string)' },
                      },
                      required: ['start', 'end'],
                    },
                    contentType: {
                      type: 'string',
                      enum: ['article', 'video', 'pdf', 'all'],
                      description: 'Content type filter',
                    },
                    region: {
                      type: 'string',
                      description: 'Geographic region filter',
                    },
                  },
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'compose_answer',
            description: 'Compose an answer based on search results with citations',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Question or topic to answer',
                },
                maxSources: {
                  type: 'number',
                  description: 'Maximum number of sources to use (default: 5)',
                  default: 5,
                },
                language: {
                  type: 'string',
                  enum: ['en', 'ro', 'auto'],
                  description: 'Language for the answer (default: auto)',
                  default: 'auto',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_citations',
            description: 'Get formatted citations for given URLs',
            inputSchema: {
              type: 'object',
              properties: {
                urls: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'URLs to generate citations for',
                },
                format: {
                  type: 'string',
                  enum: ['apa', 'mla', 'chicago', 'ieee'],
                  description: 'Citation format (default: apa)',
                  default: 'apa',
                },
              },
              required: ['urls'],
            },
          },
        ] as Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'search_web':
          return await this.searchTool.execute(args || {});

        case 'compose_answer':
          return await this.composeTool.execute(args || {});

        case 'get_citations':
          return await this.citationTool.execute(args || {});

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Cautai MCP Server started on stdio transport');
  }

  async stop(): Promise<void> {
    await this.server.close();
  }
}