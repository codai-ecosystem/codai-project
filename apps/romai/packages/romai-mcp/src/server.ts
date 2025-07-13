#!/usr/bin/env node
import { Command } from 'commander';
import { RomaiMcpServerWithLogging } from './enterprise-enhanced-server.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('romai-mcp')
  .description('ROMAI Model Context Protocol Server - Enhanced Edition')
  .version('0.2.0')
  .option('-c, --config <path>', 'Configuration file path')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--legacy', 'Use legacy server without Resources/Prompts support')
  .action(async options => {
    try {
      if (options.verbose) {
        process.env.DEBUG = 'true';
      }

      console.error('🇷🇴 Starting ROMAI MCP Enhanced Server...');
      console.error('✅ Features: Tools + Resources + Prompts');
      console.error('🏢 Enterprise-Ready Romanian Business Intelligence');

      const server = new RomaiMcpServerWithLogging();
      await server.run();
    } catch (error) {
      console.error('Failed to start ROMAI MCP Enhanced Server:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
