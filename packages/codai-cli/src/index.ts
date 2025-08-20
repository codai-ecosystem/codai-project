#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { ServiceCommand } from './commands/service.js';
import { DeployCommand } from './commands/deploy.js';
import { TestCommand } from './commands/test.js';
import { MonitorCommand } from './commands/monitor.js';

const program = new Command();

program
  .name('codai')
  .description('CODAI Ecosystem CLI - Service management, deployment, and monitoring tools')
  .version('1.0.0');

// ASCII Art Banner
const banner = `
  ╔═══════════════════════════════════════╗
  ║           🚀 CODAI CLI v1.0.0          ║
  ║   Ecosystem Management & Operations   ║
  ╚═══════════════════════════════════════╝
`;

console.log(chalk.cyan(banner));

// Service management commands
const serviceCommand = new Command('service')
  .alias('svc')
  .description('Manage CODAI ecosystem services');

serviceCommand
  .command('list')
  .alias('ls')
  .description('List all services and their status')
  .action(ServiceCommand.list);

serviceCommand
  .command('start <service>')
  .description('Start a specific service')
  .option('-p, --port <port>', 'Override default port')
  .action(ServiceCommand.start);

serviceCommand
  .command('stop <service>')
  .description('Stop a specific service')
  .action(ServiceCommand.stop);

serviceCommand
  .command('restart <service>')
  .description('Restart a specific service')
  .action(ServiceCommand.restart);

serviceCommand
  .command('health')
  .description('Check health status of all services')
  .option('-v, --verbose', 'Show detailed health information')
  .action(ServiceCommand.health);

serviceCommand
  .command('logs <service>')
  .description('Show logs for a specific service')
  .option('-f, --follow', 'Follow log output')
  .option('-n, --lines <lines>', 'Number of lines to show', '50')
  .action(ServiceCommand.logs);

// Deployment commands
const deployCommand = new Command('deploy')
  .description('Deploy CODAI ecosystem components');

deployCommand
  .command('all')
  .description('Deploy all services')
  .option('--env <environment>', 'Deployment environment', 'development')
  .action(DeployCommand.all);

deployCommand
  .command('service <service>')
  .description('Deploy a specific service')
  .option('--env <environment>', 'Deployment environment', 'development')
  .action(DeployCommand.service);

deployCommand
  .command('rollback')
  .description('Rollback to previous deployment')
  .option('--version <version>', 'Specific version to rollback to')
  .action(DeployCommand.rollback);

// Testing commands
const testCommand = new Command('test')
  .description('Run tests across the ecosystem');

testCommand
  .command('all')
  .description('Run all tests')
  .option('--coverage', 'Generate coverage report')
  .action(TestCommand.all);

testCommand
  .command('service <service>')
  .description('Run tests for a specific service')
  .action(TestCommand.service);

testCommand
  .command('performance')
  .alias('perf')
  .description('Run performance tests')
  .option('--load <users>', 'Number of concurrent users', '100')
  .action(TestCommand.performance);

testCommand
  .command('security')
  .alias('sec')
  .description('Run security tests')
  .action(TestCommand.security);

// Monitoring commands
const monitorCommand = new Command('monitor')
  .alias('mon')
  .description('Monitor ecosystem health and metrics');

monitorCommand
  .command('dashboard')
  .description('Launch monitoring dashboard')
  .action(MonitorCommand.dashboard);

monitorCommand
  .command('metrics')
  .description('Show current metrics')
  .option('-s, --service <service>', 'Show metrics for specific service')
  .action(MonitorCommand.metrics);

monitorCommand
  .command('alerts')
  .description('Show active alerts')
  .action(MonitorCommand.alerts);

// Add commands to main program
program.addCommand(serviceCommand);
program.addCommand(deployCommand);
program.addCommand(testCommand);
program.addCommand(monitorCommand);

// Global error handler
program.configureOutput({
  writeErr: (str) => process.stderr.write(chalk.red(str))
});

// Parse command line arguments
program.parse();
