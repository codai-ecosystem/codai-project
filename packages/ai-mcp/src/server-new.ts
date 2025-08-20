#!/usr/bin/env node
/**
 * CODAI Core AI MCP Server
 * 
 * Provides centralized AI model management, inference, and orchestration
 * for the CODAI ecosystem through Model Context Protocol.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { AIServices } from './services/aiServices.js';
import { logger } from './utils/logger.js';
import { config } from './config/index.js';

// Initialize AI Services
const aiServices = new AIServices();

/**
 * Available MCP tools for AI operations
 */
const AI_TOOLS: Tool[] = [
    {
        name: 'list_ai_providers',
        description: 'Get list of available AI providers and their status',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'list_ai_models',
        description: 'Get list of available AI models, optionally filtered by provider',
        inputSchema: {
            type: 'object',
            properties: {
                providerId: {
                    type: 'string',
                    description: 'Optional provider ID to filter models',
                },
            },
        },
    },
    {
        name: 'get_model_info',
        description: 'Get detailed information about a specific AI model',
        inputSchema: {
            type: 'object',
            properties: {
                modelId: {
                    type: 'string',
                    description: 'The ID of the model to get information for',
                },
            },
            required: ['modelId'],
        },
    },
    {
        name: 'generate_completion',
        description: 'Generate text completion or chat response using specified AI model',
        inputSchema: {
            type: 'object',
            properties: {
                modelId: {
                    type: 'string',
                    description: 'The ID of the model to use for generation',
                },
                prompt: {
                    type: 'string',
                    description: 'The prompt text for generation',
                },
                messages: {
                    type: 'array',
                    description: 'Chat messages for conversation-style completion',
                    items: {
                        type: 'object',
                        properties: {
                            role: { type: 'string' },
                            content: { type: 'string' },
                        },
                        required: ['role', 'content'],
                    },
                },
                systemPrompt: {
                    type: 'string',
                    description: 'Optional system prompt to set context',
                },
                maxTokens: {
                    type: 'number',
                    description: 'Maximum tokens to generate',
                    minimum: 1,
                    maximum: 4000,
                },
                temperature: {
                    type: 'number',
                    description: 'Sampling temperature (0-2)',
                    minimum: 0,
                    maximum: 2,
                },
                topP: {
                    type: 'number',
                    description: 'Nucleus sampling parameter (0-1)',
                    minimum: 0,
                    maximum: 1,
                },
                frequencyPenalty: {
                    type: 'number',
                    description: 'Frequency penalty (-2 to 2)',
                    minimum: -2,
                    maximum: 2,
                },
                presencePenalty: {
                    type: 'number',
                    description: 'Presence penalty (-2 to 2)',
                    minimum: -2,
                    maximum: 2,
                },
            },
            required: ['modelId', 'prompt'],
        },
    },
    {
        name: 'optimize_model_selection',
        description: 'Get the optimal AI model for given capabilities',
        inputSchema: {
            type: 'object',
            properties: {
                capabilities: {
                    type: 'array',
                    description: 'Required capabilities (chat, reasoning, coding, etc.)',
                    items: { type: 'string' },
                },
            },
        },
    },
    {
        name: 'get_model_performance',
        description: 'Get performance metrics for AI models',
        inputSchema: {
            type: 'object',
            properties: {
                modelId: {
                    type: 'string',
                    description: 'Optional specific model ID to get performance for',
                },
            },
        },
    },
    {
        name: 'get_ai_system_status',
        description: 'Get overall AI system status and statistics',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'clear_ai_cache',
        description: 'Clear AI services cache to free memory',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
];

/**
 * Create and configure the MCP server
 */
const server = new Server(
    {
        name: config.server.name,
        version: config.server.version,
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Handle tool list requests
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('Received tools list request');
    return {
        tools: AI_TOOLS,
    };
});

/**
 * Handle tool call requests
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info(`Executing AI tool: ${name}`, { args });

    try {
        switch (name) {
            case 'list_ai_providers': {
                const providers = await aiServices.listProviders();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(providers, null, 2),
                        },
                    ],
                };
            }

            case 'list_ai_models': {
                const { providerId } = args as { providerId?: string };
                const models = await aiServices.listModels(providerId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(models, null, 2),
                        },
                    ],
                };
            }

            case 'get_model_info': {
                const { modelId } = args as { modelId: string };
                const modelInfo = await aiServices.getModelInfo(modelId);

                if (!modelInfo) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Model "${modelId}" not found`,
                            },
                        ],
                        isError: true,
                    };
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(modelInfo, null, 2),
                        },
                    ],
                };
            }

            case 'generate_completion': {
                const {
                    modelId,
                    prompt,
                    messages,
                    systemPrompt,
                    maxTokens,
                    temperature,
                    topP,
                    frequencyPenalty,
                    presencePenalty,
                } = args as {
                    modelId: string;
                    prompt: string;
                    messages?: Array<{ role: string; content: string }>;
                    systemPrompt?: string;
                    maxTokens?: number;
                    temperature?: number;
                    topP?: number;
                    frequencyPenalty?: number;
                    presencePenalty?: number;
                };

                const result = await aiServices.generateCompletion({
                    modelId,
                    prompt,
                    messages,
                    systemPrompt,
                    maxTokens,
                    temperature,
                    topP,
                    frequencyPenalty,
                    presencePenalty,
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }

            case 'optimize_model_selection': {
                const { capabilities } = args as { capabilities?: string[] };
                const optimalModelId = await aiServices.optimizeModelSelection(capabilities || []);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ optimalModelId }, null, 2),
                        },
                    ],
                };
            }

            case 'get_model_performance': {
                const { modelId } = args as { modelId?: string };
                const performance = await aiServices.getModelPerformance(modelId);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(performance, null, 2),
                        },
                    ],
                };
            }

            case 'get_ai_system_status': {
                const status = await aiServices.getSystemStatus();

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(status, null, 2),
                        },
                    ],
                };
            }

            case 'clear_ai_cache': {
                await aiServices.clearCache();

                return {
                    content: [
                        {
                            type: 'text',
                            text: 'AI cache cleared successfully',
                        },
                    ],
                };
            }

            default:
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Unknown tool: ${name}`,
                        },
                    ],
                    isError: true,
                };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error(`Error executing tool ${name}: ${errorMessage}`, { error });

        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});

/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport();

    logger.info('Starting CODAI Core AI MCP Server', {
        name: config.server.name,
        version: config.server.version,
        environment: config.environment,
    });

    await server.connect(transport);
    logger.info('AI MCP Server connected and ready');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await server.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await server.close();
    process.exit(0);
});

// Start the server
main().catch((error) => {
    logger.error('Failed to start AI MCP Server:', error);
    process.exit(1);
});
