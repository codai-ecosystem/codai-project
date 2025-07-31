#!/usr/bin/env node
/**
 * CODAI MCP Server Template
 * 
 * Enterprise-grade Model Context Protocol server template for the CODAI ecosystem.
 * This template provides a standardized structure for building MCP servers with:
 * - TypeScript for type safety
 * - Express.js for HTTP handling
 * - Winston for logging
 * - Zod for validation
 * - Docker support
 * - Comprehensive testing setup
 * 
 * @author CODAI Ecosystem
 * @version 1.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { logger } from './utils/logger.js';
import { config } from './config/index.js';
import type { MCPTool, MCPResource, MCPPrompt } from './types/mcp.js';

/**
 * MCP Server Template Class
 */
class MCPServerTemplate {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: config.server.name,
                version: config.server.version,
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                    prompts: {},
                },
            }
        );

        this.setupHandlers();
    }

    /**
     * Setup MCP server handlers
     */
    private setupHandlers(): void {
        // Tools handler
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            logger.info('Listing available tools');
            return {
                tools: this.getTools(),
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            logger.info(`Executing tool: ${name}`, { args });

            try {
                return await this.executeTool(name, args);
            } catch (error) {
                logger.error(`Tool execution failed: ${name}`, { error });
                throw new McpError(
                    ErrorCode.InternalError,
                    `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        });
    }

    /**
     * Get available tools
     */
    private getTools(): MCPTool[] {
        return [
            {
                name: 'hello_world',
                description: 'Returns a hello world message with optional name parameter',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Name to include in greeting',
                        },
                    },
                },
            },
            {
                name: 'get_server_info',
                description: 'Returns information about the MCP server',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
        ];
    }

    /**
     * Execute a tool
     */
    private async executeTool(name: string, args: unknown): Promise<any> {
        switch (name) {
            case 'hello_world':
                return this.handleHelloWorld(args);

            case 'get_server_info':
                return this.handleServerInfo();

            default:
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${name}`
                );
        }
    }

    /**
     * Handle hello world tool
     */
    private async handleHelloWorld(args: unknown) {
        const schema = z.object({
            name: z.string().optional().default('World'),
        });

        const parsed = schema.parse(args);

        return {
            content: [
                {
                    type: 'text',
                    text: `Hello, ${parsed.name}! Welcome to the CODAI MCP Server Template.`,
                },
            ],
        };
    }

    /**
     * Handle server info tool
     */
    private async handleServerInfo() {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        name: config.server.name,
                        version: config.server.version,
                        description: 'Enterprise-grade MCP server template',
                        features: ['Tools', 'Resources', 'Prompts'],
                        uptime: process.uptime(),
                        memory: process.memoryUsage(),
                        environment: config.environment,
                    }, null, 2),
                },
            ],
        };
    }

    /**
     * Start the MCP server
     */
    async start(): Promise<void> {
        const transport = new StdioServerTransport();

        logger.info(`Starting ${config.server.name} v${config.server.version}`);
        logger.info(`Environment: ${config.environment}`);
        logger.info(`Log level: ${config.logging.level}`);

        await this.server.connect(transport);
        logger.info('MCP Server started successfully');
    }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
    try {
        const mcpServer = new MCPServerTemplate();
        await mcpServer.start();
    } catch (error) {
        logger.error('Failed to start MCP server', { error });
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

// Start the server
main().catch((error) => {
    logger.error('Unhandled error in main', { error });
    process.exit(1);
});
