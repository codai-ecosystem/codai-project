#!/usr/bin/env node

/**
 * Codai Development Orchestrator
 * Provides flexible development modes for individual services and ecosystem coordination
 */

import { program } from 'commander';
import { spawn } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const SERVICES_DIR = './services';
const CONFIG_FILE = './ecosystem.config.json';

// Available services configuration
const SERVICES = {
  codai: { port: 3000, priority: 1, description: 'Central Platform & AIDE Hub' },
  memorai: { port: 3001, priority: 1, description: 'AI Memory & Database Core' },
  logai: { port: 3002, priority: 1, description: 'Identity & Authentication Hub' },
  bancai: { port: 3003, priority: 2, description: 'Financial Platform' },
  wallet: { port: 3004, priority: 2, description: 'Programmable Wallet' },
  fabricai: { port: 3005, priority: 2, description: 'AI Services Platform' },
  studiai: { port: 3006, priority: 3, description: 'AI Education Platform' },
  sociai: { port: 3007, priority: 3, description: 'AI Social Platform' },
  cumparai: { port: 3008, priority: 3, description: 'AI Shopping Platform' },
  publicai: { port: 3009, priority: 4, description: 'Civic AI & Transparency Tools' },
  x: { port: 3010, priority: 4, description: 'AI Trading Platform' }
};

function getAvailableServices() {
  if (!existsSync(SERVICES_DIR)) {
    return [];
  }
  
  return readdirSync(SERVICES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => SERVICES[name]);
}

function logStatus(message, type = 'info') {
  const colors = {
    info: chalk.blue,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red
  };
  
  console.log(colors[type](`[CODAI] ${message}`));
}

function startService(serviceName, options = {}) {
  const servicePath = join(SERVICES_DIR, serviceName);
  
  if (!existsSync(servicePath)) {
    logStatus(`Service ${serviceName} not found at ${servicePath}`, 'error');
    return null;
  }
  
  const service = SERVICES[serviceName];
  const port = options.port || service.port;
  
  logStatus(`Starting ${serviceName} on port ${port}...`, 'info');
  
  const env = {
    ...process.env,
    PORT: port.toString(),
    NODE_ENV: options.production ? 'production' : 'development'
  };
  
  const child = spawn('pnpm', ['run', 'dev'], {
    cwd: servicePath,
    stdio: 'inherit',
    env
  });
  
  child.on('error', (error) => {
    logStatus(`Failed to start ${serviceName}: ${error.message}`, 'error');
  });
  
  return child;
}

function startMultipleServices(serviceNames, options = {}) {
  const processes = [];
  
  for (const serviceName of serviceNames) {
    const service = SERVICES[serviceName];
    const process = startService(serviceName, {
      ...options,
      port: options.basePort ? options.basePort + processes.length : service.port
    });
    
    if (process) {
      processes.push({ name: serviceName, process });
    }
  }
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logStatus('Shutting down services...', 'info');
    processes.forEach(({ name, process }) => {
      logStatus(`Stopping ${name}...`, 'info');
      process.kill('SIGINT');
    });
    process.exit(0);
  });
  
  return processes;
}

// CLI Commands
program
  .name('codai-dev')
  .description('Codai Development Orchestrator')
  .version('2.0.0');

program
  .command('start')
  .description('Start services in development mode')
  .option('-s, --services <services>', 'Comma-separated list of services to start')
  .option('-a, --all', 'Start all available services')
  .option('-p, --priority <level>', 'Start services by priority level (1-4)')
  .option('--port <port>', 'Base port number (auto-increment for multiple services)')
  .option('--production', 'Start in production mode')
  .action((options) => {
    const availableServices = getAvailableServices();
    
    if (availableServices.length === 0) {
      logStatus('No services found. Please run setup first.', 'error');
      process.exit(1);
    }
    
    let servicesToStart = [];
    
    if (options.all) {
      servicesToStart = availableServices;
    } else if (options.priority) {
      const priority = parseInt(options.priority);
      servicesToStart = availableServices.filter(name => 
        SERVICES[name].priority === priority
      );
    } else if (options.services) {
      servicesToStart = options.services.split(',').map(s => s.trim());
    } else {
      // Default: start priority 1 services
      servicesToStart = availableServices.filter(name => 
        SERVICES[name].priority === 1
      );
    }
    
    if (servicesToStart.length === 0) {
      logStatus('No services to start based on criteria', 'warning');
      process.exit(0);
    }
    
    logStatus(`Starting ${servicesToStart.length} services: ${servicesToStart.join(', ')}`, 'info');
    startMultipleServices(servicesToStart, options);
  });

program
  .command('list')
  .description('List available services')
  .option('-a, --available', 'Show only available services')
  .action((options) => {
    const availableServices = getAvailableServices();
    
    console.log(chalk.blue('\n🚀 Codai Ecosystem Services:\n'));
    
    Object.entries(SERVICES).forEach(([name, config]) => {
      const available = availableServices.includes(name);
      const status = available ? chalk.green('✓ Available') : chalk.yellow('○ Not Found');
      const priority = `P${config.priority}`;
      
      if (!options.available || available) {
        console.log(`${status} ${chalk.bold(name)} (${priority}) - ${config.description}`);
        console.log(`    Port: ${config.port}, Priority: ${config.priority}`);
        console.log('');
      }
    });
  });

program
  .command('status')
  .description('Show ecosystem status')
  .action(() => {
    const availableServices = getAvailableServices();
    const totalServices = Object.keys(SERVICES).length;
    const availableCount = availableServices.length;
    
    console.log(chalk.blue('\n📊 Ecosystem Status:\n'));
    console.log(`Services Available: ${chalk.green(availableCount)}/${totalServices}`);
    console.log(`Completion: ${chalk.yellow(Math.round((availableCount / totalServices) * 100))}%`);
    
    const priorityStats = {};
    Object.values(SERVICES).forEach(service => {
      priorityStats[service.priority] = (priorityStats[service.priority] || 0) + 1;
    });
    
    console.log('\nPriority Distribution:');
    Object.entries(priorityStats).forEach(([priority, count]) => {
      const available = availableServices.filter(name => 
        SERVICES[name].priority === parseInt(priority)
      ).length;
      console.log(`  Priority ${priority}: ${available}/${count} services`);
    });
    
    console.log('\nDevelopment Commands:');
    console.log('  Individual service: npm run dev:service [service-name]');
    console.log('  Priority level:     npm run dev -- --priority [1-4]');
    console.log('  All services:       npm run dev -- --all');
    console.log('');
  });

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('dev-orchestrator.js')) {
  program.parse();
}

export { startService, startMultipleServices, getAvailableServices };
