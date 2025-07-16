#!/usr/bin/env node

/**
 * ROMAI Ultimate MCP Server Entry Point
 * The complete all-in-one enterprise solution with 26+ integrated tools
 */

import dotenv from 'dotenv';
import { RomaiUltimateMcpServer } from './ultimate-server.js';

// Load environment variables from .env file
if (process.env.DOTENV_CONFIG_PATH) {
  dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });
} else {
  dotenv.config();
}

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
