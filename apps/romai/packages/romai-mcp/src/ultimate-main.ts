#!/usr/bin/env node

/**
 * ROMAI Ultimate MCP Server Entry Point
 * The complete all-in-one enterprise solution with 26+ integrated tools
 */

import { RomaiUltimateMcpServer } from './ultimate-server.js';

async function main() {
  try {
    const server = new RomaiUltimateMcpServer();
    await server.run();
  } catch (error) {
    console.error('Fatal error starting ROMAI Ultimate MCP Server:', error);
    process.exit(1);
  }
}

main();
