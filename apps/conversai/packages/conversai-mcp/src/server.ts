#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { ConversAIServices } from './services/ConversAIServices.js';
import { logger } from './utils/logger.js';
import type { MCPTool } from './types/mcp.js';

class ConversAIMCPServer {
  private server: Server;
  private conversAIServices: ConversAIServices;

  constructor() {
    this.conversAIServices = new ConversAIServices();

    this.server = new Server(
      {
        name: 'conversai-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();

    // Error handling
    this.server.onerror = (error) => {
      logger.error('ConversAI MCP Server error:', error);
    };

    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_conversation',
            description: 'Create a new conversation with specified participants and settings',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of the conversation',
                },
                participants: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of participant usernames or IDs',
                  default: [],
                },
                settings: {
                  type: 'object',
                  properties: {
                    aiModel: { type: 'string', description: 'AI model to use (e.g., gpt-4)' },
                    temperature: { type: 'number', description: 'AI response creativity (0-1)' },
                    maxTokens: { type: 'number', description: 'Maximum tokens per AI response' },
                    systemPrompt: { type: 'string', description: 'System prompt for AI responses' },
                    autoSummarize: { type: 'boolean', description: 'Automatically summarize conversations' },
                    retentionDays: { type: 'number', description: 'Days to retain conversation after closure' },
                  },
                },
              },
              required: ['title'],
            },
          },
          {
            name: 'generate_ai_response',
            description: 'Generate an AI response to a user message in a conversation',
            inputSchema: {
              type: 'object',
              properties: {
                conversationId: {
                  type: 'string',
                  description: 'ID of the conversation',
                },
                userMessage: {
                  type: 'string',
                  description: 'User message to respond to',
                },
              },
              required: ['conversationId', 'userMessage'],
            },
          },
          {
            name: 'get_conversation',
            description: 'Retrieve a conversation by ID with all messages and metadata',
            inputSchema: {
              type: 'object',
              properties: {
                conversationId: {
                  type: 'string',
                  description: 'ID of the conversation to retrieve',
                },
              },
              required: ['conversationId'],
            },
          },
          {
            name: 'list_conversations',
            description: 'List conversations with optional filtering',
            inputSchema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['active', 'archived', 'closed'],
                  description: 'Filter by conversation status',
                },
                participant: {
                  type: 'string',
                  description: 'Filter by participant username/ID',
                },
                tag: {
                  type: 'string',
                  description: 'Filter by conversation tag',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of conversations to return',
                  default: 50,
                },
                offset: {
                  type: 'number',
                  description: 'Number of conversations to skip (for pagination)',
                  default: 0,
                },
              },
            },
          },
          {
            name: 'update_conversation',
            description: 'Update conversation settings, metadata, or participants',
            inputSchema: {
              type: 'object',
              properties: {
                conversationId: {
                  type: 'string',
                  description: 'ID of the conversation to update',
                },
                updates: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'New conversation title' },
                    participants: { type: 'array', items: { type: 'string' }, description: 'Updated participant list' },
                    metadata: {
                      type: 'object',
                      properties: {
                        tags: { type: 'array', items: { type: 'string' } },
                        priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
                        status: { type: 'string', enum: ['active', 'archived', 'closed'] },
                      },
                    },
                    settings: {
                      type: 'object',
                      properties: {
                        aiModel: { type: 'string' },
                        temperature: { type: 'number' },
                        maxTokens: { type: 'number' },
                        systemPrompt: { type: 'string' },
                        autoSummarize: { type: 'boolean' },
                        retentionDays: { type: 'number' },
                      },
                    },
                  },
                },
              },
              required: ['conversationId', 'updates'],
            },
          },
          {
            name: 'generate_summary',
            description: 'Generate an AI summary of a conversation with key points and topics',
            inputSchema: {
              type: 'object',
              properties: {
                conversationId: {
                  type: 'string',
                  description: 'ID of the conversation to summarize',
                },
              },
              required: ['conversationId'],
            },
          },
          {
            name: 'get_analytics',
            description: 'Get conversation analytics and usage statistics',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ] as any,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'create_conversation': {
            const { title, participants = [], settings = {} } = args as {
              title: string;
              participants?: string[];
              settings?: any;
            };

            const conversation = await this.conversAIServices.createConversation(title, participants, settings);

            return {
              content: [
                {
                  type: 'text',
                  text: `Created conversation "${title}" with ID: ${conversation.id}`,
                },
              ],
            };
          }

          case 'generate_ai_response': {
            const { conversationId, userMessage } = args as {
              conversationId: string;
              userMessage: string;
            };

            const response = await this.conversAIServices.generateAIResponse(conversationId, userMessage);

            return {
              content: [
                {
                  type: 'text',
                  text: `AI Response: ${response.content}`,
                },
              ],
            };
          }

          case 'get_conversation': {
            const { conversationId } = args as { conversationId: string };

            const conversation = await this.conversAIServices.getConversation(conversationId);

            if (!conversation) {
              throw new Error(`Conversation ${conversationId} not found`);
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(conversation, null, 2),
                },
              ],
            };
          }

          case 'list_conversations': {
            const filters = args as {
              status?: 'active' | 'archived' | 'closed';
              participant?: string;
              tag?: string;
              limit?: number;
              offset?: number;
            };

            const conversations = await this.conversAIServices.listConversations(filters);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(conversations, null, 2),
                },
              ],
            };
          }

          case 'update_conversation': {
            const { conversationId, updates } = args as {
              conversationId: string;
              updates: any;
            };

            const conversation = await this.conversAIServices.updateConversation(conversationId, updates);

            return {
              content: [
                {
                  type: 'text',
                  text: `Updated conversation ${conversationId}: ${conversation.title}`,
                },
              ],
            };
          }

          case 'generate_summary': {
            const { conversationId } = args as { conversationId: string };

            const summary = await this.conversAIServices.generateSummary(conversationId);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(summary, null, 2),
                },
              ],
            };
          }

          case 'get_analytics': {
            const analytics = await this.conversAIServices.getAnalytics();

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(analytics, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Tool execution error: ${error}`);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'conversai://conversations',
            mimeType: 'application/json',
            name: 'Active Conversations',
            description: 'List of all active conversations',
          },
          {
            uri: 'conversai://analytics',
            mimeType: 'application/json',
            name: 'ConversAI Analytics',
            description: 'Usage analytics and conversation statistics',
          },
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;

      switch (uri) {
        case 'conversai://conversations': {
          const conversations = await this.conversAIServices.listConversations({ status: 'active' });
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(conversations, null, 2),
              },
            ],
          };
        }

        case 'conversai://analytics': {
          const analytics = await this.conversAIServices.getAnalytics();
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(analytics, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Resource not found: ${uri}`);
      }
    });
  }

  private async cleanup(): Promise<void> {
    logger.info('Cleaning up ConversAI MCP Server...');
    await this.conversAIServices.cleanupExpiredConversations();
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('ConversAI MCP Server running on stdio');
  }
}

const server = new ConversAIMCPServer();
server.run().catch(console.error);
