#!/usr/bin/env node
import { RomaiMcpSimpleServer } from './simple-server.js';

async function main() {
  try {
    const server = new RomaiMcpSimpleServer();
    await server.run();
  } catch (error) {
    console.error('Failed to start ROMAI MCP Simple Server:', error);
    process.exit(1);
  }
}

main().catch(console.error);
