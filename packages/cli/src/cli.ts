#!/usr/bin/env node

/**
 * CODAI CLI - Universal Command Line Interface
 * Entry point for all CODAI ecosystem operations
 */

import { program, Command } from 'commander';
import chalk from 'chalk';
import { CodaiCLI } from './index.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const cli = new CodaiCLI();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load package.json using fs instead of assert syntax
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Configure main program
program
  .name('codai')
  .description('Universal CLI for CODAI Ecosystem')
  .version(packageJson.version)
  .option('-v, --verbose', 'Enable verbose output')
  .option('--debug', 'Enable debug mode')
  .hook('preAction', (thisCommand: Command) => {
    const options = thisCommand.opts();
    if (options.verbose) {
      process.env.CODAI_VERBOSE = 'true';
    }
    if (options.debug) {
      process.env.CODAI_DEBUG = 'true';
    }
  });

// Core commands
program
  .command('dev')
  .description('Start development servers')
  .argument('[service]', 'Specific service to start (optional)')
  .option('-p, --port <port>', 'Custom port number')
  .option('-w, --watch', 'Enable file watching')
  .action(async (service: string | undefined, options: { port?: string; watch?: boolean }) => {
    await cli.dev(service, options);
  });

program
  .command('build')
  .description('Build services for production')
  .argument('[service]', 'Specific service to build (optional)')
  .option('--clean', 'Clean before building')
  .action(async (service: string | undefined, options: { clean?: boolean }) => {
    await cli.build(service, options);
  });

program
  .command('deploy')
  .description('Deploy services to production')
  .argument('<service>', 'Service to deploy')
  .argument('<environment>', 'Target environment (staging/production)')
  .option('--force', 'Force deployment without confirmation')
  .action(async (service: string, environment: string, options: { force?: boolean }) => {
    await cli.deploy(service, environment, options);
  });

program
  .command('status')
  .description('Check service status and health')
  .argument('[service]', 'Specific service to check (optional)')
  .option('--detailed', 'Show detailed status information')
  .action(async (service: string | undefined, options: { detailed?: boolean }) => {
    await cli.status(service, options);
  });

program
  .command('logs')
  .description('View service logs')
  .argument('<service>', 'Service to view logs for')
  .option('-f, --follow', 'Follow log output')
  .option('-n, --lines <number>', 'Number of lines to show', '100')
  .option('--level <level>', 'Log level filter (debug|info|warn|error|critical)')
  .action(async (service: string, options: { follow?: boolean; lines?: string; level?: 'debug' | 'info' | 'warn' | 'error' | 'critical' }) => {
    await cli.logs(service, options);
  });

program
  .command('config')
  .description('Manage ecosystem configuration')
  .argument('<action>', 'Action to perform (get|set|list|reset)')
  .argument('[key]', 'Configuration key')
  .argument('[value]', 'Configuration value')
  .action(async (action: string, key?: string, value?: string) => {
    await cli.configureSettings(action, key, value);
  });

// Service-specific commands
const memoraiCmd = program
  .command('memorai')
  .description('MemorAI database and memory management');

memoraiCmd
  .command('create-database')
  .description('Create a new memory database')
  .requiredOption('--name <name>', 'Database name')
  .option('--type <type>', 'Database type (memory|vector|hybrid)', 'memory')
  .action(async (options: { name: string; type?: string }) => {
    await cli.memoraiCreateDatabase(options);
  });

memoraiCmd
  .command('query')
  .description('Query memory database')
  .requiredOption('--database <name>', 'Database name')
  .requiredOption('--query <query>', 'Query string')
  .option('--limit <number>', 'Result limit', '10')
  .action(async (options: { database: string; query: string; limit?: string }) => {
    await cli.memoraiQuery(options);
  });

const logaiCmd = program
  .command('logai')
  .description('LogAI logging and analytics');

logaiCmd
  .command('query')
  .description('Query logs with AI assistance')
  .requiredOption('--service <service>', 'Service name')
  .requiredOption('--query <query>', 'Natural language query')
  .option('--timeframe <timeframe>', 'Time range (1h|6h|24h|7d)', '24h')
  .action(async (options: { service: string; query: string; timeframe?: string }) => {
    await cli.logaiQuery(options);
  });

logaiCmd
  .command('analytics')
  .description('Get log analytics and insights')
  .requiredOption('--service <service>', 'Service name')
  .option('--timeframe <timeframe>', 'Time range (1h|6h|24h|7d)', '24h')
  .action(async (options: { service: string; timeframe?: string }) => {
    await cli.logaiAnalytics(options);
  });

const bancaiCmd = program
  .command('bancai')
  .description('BancAI financial services and wallet management');

bancaiCmd
  .command('create-wallet')
  .description('Create a new user wallet')
  .requiredOption('--user <userId>', 'User ID')
  .option('--type <type>', 'Wallet type (standard|premium)', 'standard')
  .action(async (options: { user: string; type?: string }) => {
    await cli.bancaiCreateWallet(options);
  });

bancaiCmd
  .command('balance')
  .description('Check wallet balance')
  .requiredOption('--wallet <walletId>', 'Wallet ID')
  .action(async (options: { wallet: string }) => {
    await cli.bancaiBalance(options);
  });

const xCmd = program
  .command('x')
  .description('X trading platform operations');

xCmd
  .command('place-order')
  .description('Place a trading order')
  .requiredOption('--symbol <symbol>', 'Trading symbol (e.g., BTC/USD)')
  .requiredOption('--amount <amount>', 'Order amount')
  .requiredOption('--type <type>', 'Order type (buy|sell)')
  .option('--price <price>', 'Limit price (for limit orders)')
  .action(async (options: { symbol: string; amount: string; type: string; price?: string }) => {
    await cli.xPlaceOrder(options);
  });

const marketaiCmd = program
  .command('marketai')
  .description('MarketAI marketing platform operations');

marketaiCmd
  .command('create-campaign')
  .description('Create a new marketing campaign')
  .requiredOption('--name <name>', 'Campaign name')
  .option('--budget <budget>', 'Campaign budget')
  .option('--duration <days>', 'Campaign duration in days')
  .action(async (options: { name: string; budget?: string; duration?: string }) => {
    await cli.marketaiCreateCampaign(options);
  });

// Ecosystem management commands
const ecosystemCmd = program
  .command('ecosystem')
  .description('Manage the entire CODAI ecosystem');

ecosystemCmd
  .command('start')
  .description('Start the entire ecosystem')
  .option('--mode <mode>', 'Start mode (development|production)', 'development')
  .option('--services <services>', 'Comma-separated list of services to start')
  .action(async (options: { mode?: 'development' | 'production'; services?: string }) => {
    await cli.ecosystemStart(options);
  });

ecosystemCmd
  .command('stop')
  .description('Stop the entire ecosystem')
  .option('--force', 'Force stop all services')
  .action(async (options: { force?: boolean }) => {
    await cli.ecosystemStop(options);
  });

ecosystemCmd
  .command('sync')
  .description('Synchronize all services and data')
  .option('--force', 'Force synchronization')
  .action(async (options: { force?: boolean }) => {
    await cli.ecosystemSync(options);
  });

ecosystemCmd
  .command('health')
  .description('Comprehensive ecosystem health check')
  .option('--detailed', 'Show detailed health information')
  .action(async (options: { detailed?: boolean }) => {
    await cli.ecosystemHealth(options);
  });

// Error handling
program.configureOutput({
  writeErr: (str) => process.stderr.write(chalk.red(str)),
  writeOut: (str) => process.stdout.write(str)
});

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

// Parse and execute
async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Only run if this is the main module (ES module equivalent)
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith('/cli.js')) {
  main();
}

export { program };
