#!/usr/bin/env node

/**
 * Comprehensive Codai Ecosystem Startup Script
 * Starts all apps and services in the correct order with proper port management
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const APPS = [
  { name: 'codai', port: 4030, path: 'apps/codai', priority: 1, description: 'Central Platform & AIDE Hub' },
  { name: 'memorai', port: 4031, path: 'apps/memorai', priority: 1, description: 'AI Memory & Database Core' },
  { name: 'logai', port: 4032, path: 'apps/logai', priority: 1, description: 'Identity & Authentication Hub' },
  { name: 'bancai', port: 4033, path: 'apps/bancai', priority: 2, description: 'Financial Platform' },
  { name: 'wallet', port: 4034, path: 'apps/wallet', priority: 2, description: 'Programmable Wallet' },
  { name: 'fabricai', port: 4035, path: 'apps/fabricai', priority: 2, description: 'AI Services Platform' },
  { name: 'studiai', port: 4036, path: 'apps/studiai', priority: 3, description: 'AI Education Platform' },
  { name: 'sociai', port: 4037, path: 'apps/sociai', priority: 3, description: 'AI Social Platform' },
  { name: 'cumparai', port: 4038, path: 'apps/cumparai', priority: 3, description: 'AI Shopping Platform' },
  { name: 'x', port: 4039, path: 'apps/x', priority: 4, description: 'AI Trading Platform' },
  { name: 'publicai', port: 4040, path: 'apps/publicai', priority: 4, description: 'Civic AI & Transparency Tools' }
];

const runningProcesses = [];

function log(level, service, message) {
  const timestamp = new Date().toISOString().slice(11, 23);
  const prefix = `[${timestamp}] [${service.toUpperCase()}]`;

  switch (level) {
    case 'info':
      console.log(chalk.blue(prefix), message);
      break;
    case 'success':
      console.log(chalk.green(prefix), message);
      break;
    case 'error':
      console.log(chalk.red(prefix), message);
      break;
    case 'warn':
      console.log(chalk.yellow(prefix), message);
      break;
  }
}

function startApp(app) {
  return new Promise((resolve, reject) => {
    const appPath = join(process.cwd(), app.path);

    if (!existsSync(appPath)) {
      log('error', app.name, `App directory not found: ${appPath}`);
      resolve(false);
      return;
    }

    if (!existsSync(join(appPath, 'package.json'))) {
      log('error', app.name, 'No package.json found');
      resolve(false);
      return;
    }

    log('info', app.name, `Starting ${app.description} on port ${app.port}...`);

    const child = spawn('pnpm', ['dev'], {
      cwd: appPath,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    let started = false;
    let output = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;

      // Check for successful startup indicators
      if ((text.includes('Ready in') || text.includes('Local:') || text.includes('started server')) && !started) {
        started = true;
        log('success', app.name, `✅ Started successfully on port ${app.port}`);
        log('info', app.name, `🌐 Available at http://localhost:${app.port}`);
        resolve(true);
      }
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;

      if (text.includes('EADDRINUSE') && !started) {
        log('error', app.name, `❌ Port ${app.port} already in use`);
        resolve(false);
      } else if (text.includes('Error:') && !started) {
        log('error', app.name, `❌ Failed to start: ${text.trim()}`);
        resolve(false);
      }
    });

    child.on('close', (code) => {
      if (!started) {
        if (code === 0) {
          log('warn', app.name, 'Process exited without clear startup signal');
          resolve(true);
        } else {
          log('error', app.name, `Process exited with code ${code}`);
          resolve(false);
        }
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        log('error', app.name, 'Startup timeout (30s)');
        child.kill();
        resolve(false);
      }
    }, 30000);

    runningProcesses.push({ name: app.name, process: child });
  });
}

async function startAllApps() {
  console.log(chalk.cyan('\n🚀 CODAI ECOSYSTEM STARTUP\n'));
  console.log(chalk.gray('Starting all applications in priority order...\n'));

  // Sort by priority
  const sortedApps = [...APPS].sort((a, b) => a.priority - b.priority);

  const results = [];
  let totalStarted = 0;

  // Start apps in priority groups
  for (let priority = 1; priority <= 4; priority++) {
    const appsInPriority = sortedApps.filter(app => app.priority === priority);

    if (appsInPriority.length > 0) {
      console.log(chalk.cyan(`\n📋 Starting Priority ${priority} Apps:`));

      // Start all apps in this priority level concurrently
      const promises = appsInPriority.map(startApp);
      const priorityResults = await Promise.all(promises);

      priorityResults.forEach((success, index) => {
        const app = appsInPriority[index];
        results.push({ app: app.name, success, port: app.port });
        if (success) totalStarted++;
      });

      // Wait a bit before starting next priority level
      if (priority < 4) {
        console.log(chalk.gray('\n⏳ Waiting 3 seconds before starting next priority level...\n'));
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  // Print final summary
  console.log(chalk.cyan('\n📊 STARTUP SUMMARY:\n'));

  results.forEach(({ app, success, port }) => {
    const status = success ? chalk.green('✅ RUNNING') : chalk.red('❌ FAILED');
    const url = success ? chalk.blue(`http://localhost:${port}`) : chalk.gray('Not available');
    console.log(`${app.padEnd(12)} ${status} ${url}`);
  });

  console.log(chalk.cyan(`\n🎯 Total: ${totalStarted}/${APPS.length} apps started successfully\n`));

  if (totalStarted === APPS.length) {
    console.log(chalk.green('🎉 ALL APPLICATIONS STARTED SUCCESSFULLY!\n'));
    console.log(chalk.cyan('🌐 Main Applications:'));
    console.log(chalk.blue('   • Codai Platform: http://localhost:4030'));
    console.log(chalk.blue('   • Memory System:  http://localhost:4031'));
    console.log(chalk.blue('   • Authentication: http://localhost:4032'));
    console.log(chalk.blue('   • Financial:      http://localhost:4033'));
    console.log('\n' + chalk.gray('Press Ctrl+C to stop all applications'));
  } else {
    console.log(chalk.yellow(`⚠️  ${APPS.length - totalStarted} applications failed to start`));
    console.log(chalk.gray('Check the logs above for details\n'));
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.cyan('\n🛑 Shutting down all applications...'));

  runningProcesses.forEach(({ name, process }) => {
    console.log(chalk.gray(`Stopping ${name}...`));
    process.kill('SIGTERM');
  });

  setTimeout(() => {
    console.log(chalk.green('✅ All applications stopped'));
    process.exit(0);
  }, 2000);
});

// Start the ecosystem
startAllApps().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
