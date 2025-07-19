#!/usr/bin/env node

/**
 * Codai Development Orchestrator CLI
 * Interactive table-based management system for development services
 * 
 * Features:
 * - Real-time status monitoring with updateable table
 * - Individual service start/stop/restart commands
 * - Selective bulk operations with confirmation prompts
 * - Port conflict detection and management
 * - Process health monitoring
 * 
 * Usage: 
 *   node scripts/orchestrator-cli.js
 *   pnpm orchestrator
 */

import { program } from 'commander';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { createConnection } from 'net';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root configuration
const PROJECT_ROOT = resolve(__dirname, '..');
const APPS_DIR = join(PROJECT_ROOT, 'apps');
const SERVICES_DIR = join(PROJECT_ROOT, 'services');

// Service management state
class ServiceManager {
    constructor() {
        this.processes = new Map();
        this.services = new Map();
        this.isRunning = false;
        this.refreshInterval = null;
    }

    // Discover all available apps and services
    async discoverServices() {
        const services = new Map();

        // Discover apps
        if (existsSync(APPS_DIR)) {
            const appDirs = await fs.readdir(APPS_DIR, { withFileTypes: true });
            for (const dir of appDirs) {
                if (dir.isDirectory()) {
                    const packagePath = join(APPS_DIR, dir.name, 'package.json');
                    if (existsSync(packagePath)) {
                        try {
                            const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
                            const port = this.extractPortFromScripts(packageJson.scripts);

                            services.set(dir.name, {
                                name: dir.name,
                                type: 'app',
                                path: join(APPS_DIR, dir.name),
                                port: port || 'auto',
                                description: packageJson.description || 'No description',
                                scripts: packageJson.scripts || {},
                                status: 'stopped',
                                pid: null,
                                uptime: null,
                                lastStart: null
                            });
                        } catch (error) {
                            console.warn(`⚠️  Failed to parse package.json for ${dir.name}: ${error.message}`);
                        }
                    }
                }
            }
        }

        // Discover services (if services directory exists)
        if (existsSync(SERVICES_DIR)) {
            const serviceDirs = await fs.readdir(SERVICES_DIR, { withFileTypes: true });
            for (const dir of serviceDirs) {
                if (dir.isDirectory()) {
                    const packagePath = join(SERVICES_DIR, dir.name, 'package.json');
                    if (existsSync(packagePath)) {
                        try {
                            const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
                            const port = this.extractPortFromScripts(packageJson.scripts);

                            services.set(dir.name, {
                                name: dir.name,
                                type: 'service',
                                path: join(SERVICES_DIR, dir.name),
                                port: port || 'auto',
                                description: packageJson.description || 'No description',
                                scripts: packageJson.scripts || {},
                                status: 'stopped',
                                pid: null,
                                uptime: null,
                                lastStart: null
                            });
                        } catch (error) {
                            console.warn(`⚠️  Failed to parse package.json for ${dir.name}: ${error.message}`);
                        }
                    }
                }
            }
        }

        this.services = services;
        return services;
    }

    // Extract port from package.json scripts
    extractPortFromScripts(scripts) {
        if (!scripts) return null;

        const devScript = scripts.dev || scripts.start || '';

        // Look for -p or --port flags
        const portMatch = devScript.match(/(?:-p|--port)\s+(\d+)/);
        if (portMatch) {
            return parseInt(portMatch[1]);
        }

        // Look for PORT environment variable
        const envMatch = devScript.match(/PORT=(\d+)/);
        if (envMatch) {
            return parseInt(envMatch[1]);
        }

        return null;
    }

    // Check if a port is available
    async isPortAvailable(port) {
        return new Promise((resolve) => {
            const conn = createConnection({ port, host: 'localhost' });

            conn.on('connect', () => {
                conn.destroy();
                resolve(false); // Port is taken
            });

            conn.on('error', () => {
                resolve(true); // Port is available
            });

            setTimeout(() => {
                conn.destroy();
                resolve(true); // Assume available if timeout
            }, 1000);
        });
    }

    // Start a service
    async startService(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not found`);
        }

        if (service.status === 'running') {
            throw new Error(`Service ${serviceName} is already running`);
        }

        // Check port availability if port is specified
        if (service.port !== 'auto' && !(await this.isPortAvailable(service.port))) {
            throw new Error(`Port ${service.port} is already in use`);
        }

        const command = service.scripts.dev || service.scripts.start;
        if (!command) {
            throw new Error(`No dev or start script found for ${serviceName}`);
        }

        console.log(chalk.blue(`🚀 Starting ${serviceName}...`));

        const child = spawn('pnpm', ['run', 'dev'], {
            cwd: service.path,
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                NODE_ENV: 'development'
            }
        });

        // Store process reference
        this.processes.set(serviceName, child);

        // Update service status
        service.status = 'starting';
        service.pid = child.pid;
        service.lastStart = new Date();

        // Handle process events
        child.on('spawn', () => {
            service.status = 'running';
            service.uptime = Date.now();
            console.log(chalk.green(`✅ ${serviceName} started successfully (PID: ${child.pid})`));
        });

        child.on('error', (error) => {
            service.status = 'error';
            service.pid = null;
            console.error(chalk.red(`❌ Failed to start ${serviceName}: ${error.message}`));
            this.processes.delete(serviceName);
        });

        child.on('exit', (code, signal) => {
            service.status = 'stopped';
            service.pid = null;
            service.uptime = null;

            if (code === 0) {
                console.log(chalk.yellow(`📤 ${serviceName} exited normally`));
            } else {
                console.log(chalk.red(`💥 ${serviceName} exited with code ${code} (signal: ${signal})`));
            }

            this.processes.delete(serviceName);
        });

        // Capture output for monitoring
        let output = '';
        child.stdout.on('data', (data) => {
            output += data.toString();
            // Look for "ready" or "listening" indicators
            if (output.includes('ready') || output.includes('listening') || output.includes('started')) {
                service.status = 'running';
            }
        });

        child.stderr.on('data', (data) => {
            const errorOutput = data.toString();
            if (errorOutput.includes('EADDRINUSE') || errorOutput.includes('port') && errorOutput.includes('in use')) {
                service.status = 'port-conflict';
            }
        });

        return child;
    }

    // Stop a service
    async stopService(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not found`);
        }

        const process = this.processes.get(serviceName);
        if (!process) {
            service.status = 'stopped';
            return;
        }

        console.log(chalk.yellow(`🛑 Stopping ${serviceName}...`));

        // Graceful shutdown
        process.kill('SIGTERM');

        // Force kill after timeout
        setTimeout(() => {
            if (this.processes.has(serviceName)) {
                console.log(chalk.red(`⚡ Force killing ${serviceName}...`));
                process.kill('SIGKILL');
            }
        }, 5000);

        return new Promise((resolve) => {
            process.on('exit', () => {
                console.log(chalk.green(`✅ ${serviceName} stopped`));
                resolve();
            });
        });
    }

    // Restart a service
    async restartService(serviceName) {
        console.log(chalk.blue(`🔄 Restarting ${serviceName}...`));

        if (this.processes.has(serviceName)) {
            await this.stopService(serviceName);
            // Wait a bit for cleanup
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        return this.startService(serviceName);
    }

    // Get service status
    getServiceStatus(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) return null;

        const process = this.processes.get(serviceName);
        if (process && service.uptime) {
            service.uptime = Date.now() - service.uptime;
        }

        return service;
    }

    // Stop all services
    async stopAll() {
        const runningServices = Array.from(this.processes.keys());

        if (runningServices.length === 0) {
            console.log(chalk.yellow('No services running'));
            return;
        }

        console.log(chalk.blue(`🛑 Stopping ${runningServices.length} services...`));

        const stopPromises = runningServices.map(name => this.stopService(name));
        await Promise.all(stopPromises);

        console.log(chalk.green('✅ All services stopped'));
    }

    // Format uptime
    formatUptime(uptimeMs) {
        if (!uptimeMs) return 'N/A';

        const seconds = Math.floor(uptimeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Display services table
    displayTable() {
        const table = new Table({
            head: [
                chalk.bold('Service'),
                chalk.bold('Type'),
                chalk.bold('Status'),
                chalk.bold('Port'),
                chalk.bold('PID'),
                chalk.bold('Uptime'),
                chalk.bold('Description')
            ],
            colWidths: [15, 8, 12, 8, 8, 10, 35],
            style: {
                head: ['cyan']
            }
        });

        // Sort services by type and name
        const sortedServices = Array.from(this.services.values()).sort((a, b) => {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            return a.name.localeCompare(b.name);
        });

        for (const service of sortedServices) {
            const statusColor = {
                'running': 'green',
                'starting': 'yellow',
                'stopped': 'gray',
                'error': 'red',
                'port-conflict': 'magenta'
            }[service.status] || 'white';

            const statusIcon = {
                'running': '🟢',
                'starting': '🟡',
                'stopped': '⚪',
                'error': '🔴',
                'port-conflict': '🟣'
            }[service.status] || '⚫';

            table.push([
                service.name,
                service.type,
                `${statusIcon} ${chalk[statusColor](service.status)}`,
                service.port || 'auto',
                service.pid || '-',
                this.formatUptime(service.uptime),
                service.description.substring(0, 32) + (service.description.length > 32 ? '...' : '')
            ]);
        }

        // Clear screen and show table
        console.clear();
        console.log(chalk.cyan.bold('\n🎼 Codai Development Orchestrator\n'));
        console.log(table.toString());
        console.log(chalk.gray(`\nLast updated: ${new Date().toLocaleTimeString()}`));
    }
}

// CLI Interface
class OrchestratorCLI {
    constructor() {
        this.serviceManager = new ServiceManager();
        this.isInteractive = false;
    }

    async initialize() {
        await this.serviceManager.discoverServices();
    }

    // Interactive mode
    async runInteractive() {
        this.isInteractive = true;

        // Initial display
        this.serviceManager.displayTable();

        // Set up refresh interval
        const refreshInterval = setInterval(() => {
            this.serviceManager.displayTable();
        }, 3000);

        while (this.isInteractive) {
            try {
                const { action } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'action',
                        message: 'What would you like to do?',
                        choices: [
                            { name: '🚀 Start service', value: 'start' },
                            { name: '🛑 Stop service', value: 'stop' },
                            { name: '🔄 Restart service', value: 'restart' },
                            { name: '📊 Refresh status', value: 'refresh' },
                            { name: '🚀 Start multiple services', value: 'start-multiple' },
                            { name: '🛑 Stop all services', value: 'stop-all' },
                            { name: '🔄 Restart all services', value: 'restart-all' },
                            { name: '❌ Exit', value: 'exit' }
                        ]
                    }
                ]);

                await this.handleAction(action);
            } catch (error) {
                if (error.isTtyError) {
                    console.log(chalk.red('Interactive mode not supported in this environment'));
                    break;
                }
                console.error(chalk.red(`Error: ${error.message}`));
            }
        }

        clearInterval(refreshInterval);
    }

    async handleAction(action) {
        switch (action) {
            case 'start':
                await this.startServiceInteractive();
                break;
            case 'stop':
                await this.stopServiceInteractive();
                break;
            case 'restart':
                await this.restartServiceInteractive();
                break;
            case 'refresh':
                this.serviceManager.displayTable();
                break;
            case 'start-multiple':
                await this.startMultipleServices();
                break;
            case 'stop-all':
                await this.stopAllServices();
                break;
            case 'restart-all':
                await this.restartAllServices();
                break;
            case 'exit':
                this.isInteractive = false;
                console.log(chalk.blue('👋 Goodbye!'));
                break;
        }
    }

    async startServiceInteractive() {
        const stoppedServices = Array.from(this.serviceManager.services.values())
            .filter(s => s.status === 'stopped' || s.status === 'error')
            .map(s => ({ name: `${s.name} (${s.type})`, value: s.name }));

        if (stoppedServices.length === 0) {
            console.log(chalk.yellow('No stopped services to start'));
            return;
        }

        const { serviceName } = await inquirer.prompt([
            {
                type: 'list',
                name: 'serviceName',
                message: 'Which service would you like to start?',
                choices: stoppedServices
            }
        ]);

        try {
            await this.serviceManager.startService(serviceName);
        } catch (error) {
            console.error(chalk.red(`Failed to start ${serviceName}: ${error.message}`));
        }
    }

    async stopServiceInteractive() {
        const runningServices = Array.from(this.serviceManager.services.values())
            .filter(s => s.status === 'running' || s.status === 'starting')
            .map(s => ({ name: `${s.name} (${s.type})`, value: s.name }));

        if (runningServices.length === 0) {
            console.log(chalk.yellow('No running services to stop'));
            return;
        }

        const { serviceName } = await inquirer.prompt([
            {
                type: 'list',
                name: 'serviceName',
                message: 'Which service would you like to stop?',
                choices: runningServices
            }
        ]);

        try {
            await this.serviceManager.stopService(serviceName);
        } catch (error) {
            console.error(chalk.red(`Failed to stop ${serviceName}: ${error.message}`));
        }
    }

    async restartServiceInteractive() {
        const services = Array.from(this.serviceManager.services.values())
            .map(s => ({ name: `${s.name} (${s.type}) - ${s.status}`, value: s.name }));

        const { serviceName } = await inquirer.prompt([
            {
                type: 'list',
                name: 'serviceName',
                message: 'Which service would you like to restart?',
                choices: services
            }
        ]);

        try {
            await this.serviceManager.restartService(serviceName);
        } catch (error) {
            console.error(chalk.red(`Failed to restart ${serviceName}: ${error.message}`));
        }
    }

    async startMultipleServices() {
        const stoppedServices = Array.from(this.serviceManager.services.values())
            .filter(s => s.status === 'stopped' || s.status === 'error')
            .map(s => ({ name: `${s.name} (${s.type})`, value: s.name }));

        if (stoppedServices.length === 0) {
            console.log(chalk.yellow('No stopped services available'));
            return;
        }

        const { services } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'services',
                message: 'Select services to start:',
                choices: stoppedServices
            }
        ]);

        if (services.length === 0) {
            console.log(chalk.yellow('No services selected'));
            return;
        }

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Start ${services.length} services?`,
                default: true
            }
        ]);

        if (!confirm) {
            console.log(chalk.yellow('Operation cancelled'));
            return;
        }

        console.log(chalk.blue(`🚀 Starting ${services.length} services...`));

        for (const serviceName of services) {
            try {
                await this.serviceManager.startService(serviceName);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between starts
            } catch (error) {
                console.error(chalk.red(`Failed to start ${serviceName}: ${error.message}`));
            }
        }
    }

    async stopAllServices() {
        const runningServices = Array.from(this.serviceManager.processes.keys());

        if (runningServices.length === 0) {
            console.log(chalk.yellow('No services running'));
            return;
        }

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Stop all ${runningServices.length} running services?`,
                default: false
            }
        ]);

        if (confirm) {
            await this.serviceManager.stopAll();
        } else {
            console.log(chalk.yellow('Operation cancelled'));
        }
    }

    async restartAllServices() {
        const runningServices = Array.from(this.serviceManager.processes.keys());

        if (runningServices.length === 0) {
            console.log(chalk.yellow('No services running to restart'));
            return;
        }

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Restart all ${runningServices.length} running services?`,
                default: false
            }
        ]);

        if (confirm) {
            for (const serviceName of runningServices) {
                try {
                    await this.serviceManager.restartService(serviceName);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Delay between restarts
                } catch (error) {
                    console.error(chalk.red(`Failed to restart ${serviceName}: ${error.message}`));
                }
            }
        } else {
            console.log(chalk.yellow('Operation cancelled'));
        }
    }
}

// Main program
program
    .name('orchestrator-cli')
    .description('Codai Development Orchestrator - Interactive service management')
    .version('1.0.0');

program
    .command('interactive')
    .alias('i')
    .description('Run in interactive mode with live table updates')
    .action(async () => {
        const cli = new OrchestratorCLI();
        await cli.initialize();
        await cli.runInteractive();
    });

program
    .command('status')
    .alias('s')
    .description('Show current status of all services')
    .action(async () => {
        const cli = new OrchestratorCLI();
        await cli.initialize();
        cli.serviceManager.displayTable();
    });

program
    .command('start <service>')
    .description('Start a specific service')
    .action(async (serviceName) => {
        const cli = new OrchestratorCLI();
        await cli.initialize();

        try {
            await cli.serviceManager.startService(serviceName);
            console.log(chalk.green(`✅ Service ${serviceName} started successfully`));
        } catch (error) {
            console.error(chalk.red(`❌ Failed to start ${serviceName}: ${error.message}`));
            process.exit(1);
        }
    });

program
    .command('stop <service>')
    .description('Stop a specific service')
    .action(async (serviceName) => {
        const cli = new OrchestratorCLI();
        await cli.initialize();

        try {
            await cli.serviceManager.stopService(serviceName);
            console.log(chalk.green(`✅ Service ${serviceName} stopped successfully`));
        } catch (error) {
            console.error(chalk.red(`❌ Failed to stop ${serviceName}: ${error.message}`));
            process.exit(1);
        }
    });

program
    .command('restart <service>')
    .description('Restart a specific service')
    .action(async (serviceName) => {
        const cli = new OrchestratorCLI();
        await cli.initialize();

        try {
            await cli.serviceManager.restartService(serviceName);
            console.log(chalk.green(`✅ Service ${serviceName} restarted successfully`));
        } catch (error) {
            console.error(chalk.red(`❌ Failed to restart ${serviceName}: ${error.message}`));
            process.exit(1);
        }
    });

program
    .command('list')
    .alias('ls')
    .description('List all available services')
    .action(async () => {
        const cli = new OrchestratorCLI();
        await cli.initialize();

        console.log(chalk.cyan.bold('\n📋 Available Services:\n'));

        const services = Array.from(cli.serviceManager.services.values());
        const apps = services.filter(s => s.type === 'app');
        const servicesList = services.filter(s => s.type === 'service');

        if (apps.length > 0) {
            console.log(chalk.yellow.bold('Apps:'));
            apps.forEach(app => {
                console.log(`  ${app.name} - ${app.description} (Port: ${app.port})`);
            });
            console.log();
        }

        if (servicesList.length > 0) {
            console.log(chalk.yellow.bold('Services:'));
            servicesList.forEach(service => {
                console.log(`  ${service.name} - ${service.description} (Port: ${service.port})`);
            });
            console.log();
        }

        console.log(chalk.gray(`Total: ${services.length} services available`));
    });

// Default action - run interactive mode
program
    .action(async () => {
        const cli = new OrchestratorCLI();
        await cli.initialize();
        await cli.runInteractive();
    });

// Handle cleanup on exit
process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n🛑 Shutting down orchestrator...'));

    // Stop all running services
    const manager = new ServiceManager();
    await manager.discoverServices();
    await manager.stopAll();

    console.log(chalk.blue('👋 Goodbye!'));
    process.exit(0);
});

program.parse();
