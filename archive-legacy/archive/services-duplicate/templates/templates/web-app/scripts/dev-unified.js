#!/usr/bin/env node

/**
 * METU Template Development Launcher
 *
 * This script provides a unified way to start the development environment:
 * 1. Starts backend server
 * 2. Starts Next.js frontend
 * 3. Optionally starts Firebase emulators
 *
 * Usage: node scripts/dev-unified.js [--with-emulators]
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

// Parse arguments
const args = process.argv.slice(2);
const withEmulators = args.includes('--with-emulators');

// Store processes to clean up on exit
const processes = [];

// Logger utility
function createLogger(prefix, color) {
  return data => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(chalk[color](`[${prefix}]`), line);
      }
    });
  };
}

// Start a process and set up logging
function startProcess(command, args, options, logPrefix, logColor = 'blue') {
  console.log(chalk.green(`Starting ${logPrefix}...`));

  const proc = spawn(command, args, {
    ...options,
    stdio: 'pipe',
    shell: process.platform === 'win32', // Use shell on Windows
  });

  const logger = createLogger(logPrefix, logColor);

  proc.stdout.on('data', logger);
  proc.stderr.on('data', logger);

  proc.on('close', code => {
    if (code !== 0) {
      console.log(chalk.red(`${logPrefix} process exited with code ${code}`));
    }
  });

  processes.push(proc);
  return proc;
}

// Make sure everything gets cleaned up
function setupCleanup() {
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nShutting down all processes...'));
    processes.forEach(p => {
      try {
        p.kill('SIGINT');
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
    process.exit(0);
  });
}

// Start all development services
async function main() {
  console.log(chalk.bold('\n🚀 METU Template Development Environment\n'));

  setupCleanup();

  // Ensure .env files exist
  if (!fs.existsSync('.env.local')) {
    console.log(chalk.yellow('Warning: .env.local not found. Run scripts/dev-setup.js first.'));
  }

  // Start backend
  startProcess(
    'pnpm',
    ['--filter', '@metu/backend', 'dev'],
    { cwd: process.cwd() },
    'Backend',
    'cyan'
  );

  // Start frontend
  startProcess('pnpm', ['--filter', '@metu/web', 'dev'], { cwd: process.cwd() }, 'Web', 'magenta');

  // Optionally start Firebase emulators
  if (withEmulators) {
    startProcess('pnpm', ['dev:firebase'], { cwd: process.cwd() }, 'Firebase', 'yellow');
  }

  console.log(chalk.green('\n✅ Development environment started!\n'));
  console.log(
    chalk[withEmulators ? 'yellow' : 'blue'](
      `Running in ${withEmulators ? 'emulator' : 'regular'} mode\n`
    )
  );

  console.log(chalk.italic('Press Ctrl+C to stop all processes\n'));
}

// Run main function
main().catch(err => {
  console.error(chalk.red('Failed to start development environment:'), err);
  process.exit(1);
});
