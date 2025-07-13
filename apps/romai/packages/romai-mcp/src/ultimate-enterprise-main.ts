#!/usr/bin/env node

/**
 * ROMAI Ultimate Enterprise MCP Server Entry Point
 * The complete all-in-one enterprise solution with security & monitoring
 */

import RomaiUltimateEnterpriseServer from './ultimate-enterprise-server.js';

async function main() {
  try {
    const server = new RomaiUltimateEnterpriseServer();
    await server.run();
  } catch (error) {
    console.error('Fatal error starting ROMAI Ultimate Enterprise MCP Server:', error);
    process.exit(1);
  }
}

main();
