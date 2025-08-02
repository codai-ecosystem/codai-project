#!/usr/bin/env node

import { RomaiMcpServer } from '@codai/romai-mcp';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.error('🧠 Starting ROMAI MCP Server (Standalone)...');

    const server = new RomaiMcpServer();
    await server.run();
  } catch (error) {
    console.error('❌ Failed to start ROMAI MCP Server:', error);
    process.exit(1);
  }
}

main();
