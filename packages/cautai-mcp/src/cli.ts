#!/usr/bin/env node

/**
 * @fileoverview Cautai MCP Server CLI entry point
 * @author Cautai Team
 * @version 1.0.0
 */

import { CautaiMCPServer } from './server.js';

async function main(): Promise<void> {
  const server = new CautaiMCPServer();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error('Received SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('Received SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  await server.start();
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}