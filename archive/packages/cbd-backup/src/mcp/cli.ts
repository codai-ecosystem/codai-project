#!/usr/bin/env node
/*!
 * CBD MCP Server CLI
 * Command line interface for the CBD Model Context Protocol server
 */

import { CBDMCPServer } from './server.js';

async function main(): Promise<void> {
    try {
        // Create and start the server
        const server = new CBDMCPServer();

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.error('🛑 Shutting down CBD MCP server...');
            await server.stop();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.error('🛑 Shutting down CBD MCP server...');
            await server.stop();
            process.exit(0);
        });

        // Start the server
        await server.start();

    } catch (error: any) {
        console.error('❌ Failed to start CBD MCP server:', error?.message || error);
        process.exit(1);
    }
}

// Only run if this file is being executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('💥 Unhandled error:', error);
        process.exit(1);
    });
}
