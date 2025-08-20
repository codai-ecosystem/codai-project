#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import updateNotifier from 'update-notifier';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import commands
import { createMemoryCommand } from './commands/create.js';
import { searchCommand } from './commands/search.js';
import { listCommand } from './commands/list.js';
import { deleteCommand } from './commands/delete.js';
import { configCommand } from './commands/config.js';
import { exportCommand } from './commands/export.js';
import { importCommand } from './commands/import.js';
import { statsCommand } from './commands/stats.js';
import { loginCommand } from './commands/auth.js';

// Get package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

// Check for updates
const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 60 * 24 // 24 hours
});

if (notifier.update) {
    notifier.notify({
        defer: false,
        message: `Update available ${chalk.dim('{currentVersion}')} → ${chalk.green('{latestVersion}')}\nRun ${chalk.cyan('npm i -g @memorai/cli')} to update`
    });
}

// Create CLI program
const program = new Command();

program
    .name('memorai')
    .description('MemorAI CLI - AI memory infrastructure platform')
    .version(packageJson.version, '-v, --version', 'Display version number')
    .option('-e, --endpoint <url>', 'MemorAI API endpoint', process.env.MEMORAI_ENDPOINT || 'https://api.memorai.ro')
    .option('-k, --api-key <key>', 'MemorAI API key', process.env.MEMORAI_API_KEY)
    .option('--debug', 'Enable debug mode', false)
    .option('--no-colors', 'Disable colored output', false)
    .hook('preAction', (thisCommand) => {
        // Set global options
        const opts = thisCommand.opts();
        process.env.MEMORAI_ENDPOINT = opts.endpoint;
        process.env.MEMORAI_API_KEY = opts.apiKey;
        process.env.MEMORAI_DEBUG = opts.debug ? 'true' : 'false';

        if (opts.noColors) {
            chalk.level = 0;
        }
    });

// Add commands
program.addCommand(createMemoryCommand());
program.addCommand(searchCommand());
program.addCommand(listCommand());
program.addCommand(deleteCommand());
program.addCommand(configCommand());
program.addCommand(exportCommand());
program.addCommand(importCommand());
program.addCommand(statsCommand());
program.addCommand(loginCommand());

// Global error handler
program.exitOverride((err) => {
    if (err.code === 'commander.version') {
        console.log(packageJson.version);
        process.exit(0);
    }
    if (err.code === 'commander.help') {
        process.exit(0);
    }
    if (err.code === 'commander.unknownCommand') {
        console.error(chalk.red(`Unknown command: ${err.message}`));
        console.log(chalk.yellow('Run "memorai --help" for available commands'));
        process.exit(1);
    }

    if (process.env.MEMORAI_DEBUG === 'true') {
        console.error(chalk.red('Debug Error:'), err);
    } else {
        console.error(chalk.red('Error:'), err.message);
    }
    process.exit(1);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error(chalk.red('Uncaught Exception:'), error.message);
    if (process.env.MEMORAI_DEBUG === 'true') {
        console.error(error.stack);
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error(chalk.red('Unhandled Rejection:'), reason);
    process.exit(1);
});

// Parse command line arguments
program.parse();
