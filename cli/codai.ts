#!/usr/bin/env node

/**
 * CODAI CLI - Comprehensive Command Line Interface
 * Unified management tool for the entire CODAI ecosystem
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const https = require('https');

const execAsync = promisify(exec);
const program = new Command();

// Configuration
const CONFIG = {
    GATEWAY_URL: 'http://localhost:4003',
    SERVICES: {
        gateway: { port: 4003, name: 'API Gateway' },
        admin: { port: 4007, name: 'Admin Dashboard' },
        id: { port: 4004, name: 'ID Service' },
        hub: { port: 4008, name: 'Hub Service' },
        codai: { port: 4001, name: 'CODAI App' },
        bancai: { port: 4005, name: 'BancAI App' },
        memorai: { port: 4006, name: 'MemorAI App' },
        cbd: { port: 4180, name: 'CBD Universal Database' },
        controlai: { port: 4200, name: 'ControlAI Dashboard' },
        romai: { port: 6100, name: 'RomAI App' }
    }
};

// Utility Functions
const logger = {
    info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
    success: (msg: string) => console.log(chalk.green('✅'), msg),
    warning: (msg: string) => console.log(chalk.yellow('⚠️'), msg),
    error: (msg: string) => console.log(chalk.red('❌'), msg),
    title: (msg: string) => console.log(chalk.bold.cyan(msg))
};

async function checkServiceHealth(port: number): Promise<boolean> {
    try {
        const response = await fetch(`http://localhost:${port}/health`, {
            method: 'GET',
            timeout: 5000
        });
        return response.ok;
    } catch {
        return false;
    }
}

async function getSystemStatus() {
    const spinner = ora('Checking system status...').start();
    const results = [];

    for (const [id, config] of Object.entries(CONFIG.SERVICES)) {
        const isHealthy = await checkServiceHealth(config.port);
        results.push({
            id,
            name: config.name,
            port: config.port,
            status: isHealthy ? 'healthy' : 'unhealthy',
            url: `http://localhost:${config.port}`
        });
    }

    spinner.stop();
    return results;
}

// Commands

// Status Command
program
    .command('status')
    .description('Check status of all CODAI services')
    .option('-j, --json', 'Output in JSON format')
    .option('-w, --watch', 'Watch status continuously')
    .action(async (options) => {
        if (options.watch) {
            logger.info('Watching system status (Press Ctrl+C to stop)...');
            const watchStatus = async () => {
                console.clear();
                const status = await getSystemStatus();
                displayStatus(status, options.json);
                setTimeout(watchStatus, 5000);
            };
            await watchStatus();
        } else {
            const status = await getSystemStatus();
            displayStatus(status, options.json);
        }
    });

function displayStatus(services: any[], json: boolean) {
    if (json) {
        console.log(JSON.stringify(services, null, 2));
        return;
    }

    logger.title('\n🌐 CODAI Ecosystem Status');
    console.log('═'.repeat(60));

    const healthy = services.filter(s => s.status === 'healthy').length;
    const total = services.length;

    console.log(`📊 System Health: ${healthy}/${total} services healthy\n`);

    services.forEach(service => {
        const icon = service.status === 'healthy' ? '🟢' : '🔴';
        const status = service.status === 'healthy' ?
            chalk.green('HEALTHY') : chalk.red('UNHEALTHY');

        console.log(`${icon} ${service.name.padEnd(25)} ${status.padEnd(15)} :${service.port}`);
    });

    console.log('\n' + '═'.repeat(60));
}

// Start Command
program
    .command('start')
    .description('Start CODAI services')
    .option('-s, --service <service>', 'Start specific service')
    .option('-a, --all', 'Start all services')
    .option('-c, --core', 'Start core services only')
    .action(async (options) => {
        if (options.service) {
            await startService(options.service);
        } else if (options.all) {
            await startAllServices();
        } else if (options.core) {
            await startCoreServices();
        } else {
            const choices = Object.entries(CONFIG.SERVICES).map(([id, config]) => ({
                name: `${config.name} (:${config.port})`,
                value: id
            }));

            const answers = await inquirer.prompt([{
                type: 'checkbox',
                name: 'services',
                message: 'Select services to start:',
                choices: choices
            }]);

            for (const serviceId of answers.services) {
                await startService(serviceId);
            }
        }
    });

async function startService(serviceId: string) {
    const service = CONFIG.SERVICES[serviceId as keyof typeof CONFIG.SERVICES];
    if (!service) {
        logger.error(`Unknown service: ${serviceId}`);
        return;
    }

    const spinner = ora(`Starting ${service.name}...`).start();

    try {
        // Different start commands for different services
        let command = '';
        let cwd = '';

        switch (serviceId) {
            case 'gateway':
                command = 'pnpm dev';
                cwd = 'apps/gateway';
                break;
            case 'cbd':
                command = 'tsx src/start.ts';
                cwd = 'packages/cbd';
                break;
            default:
                command = 'pnpm dev';
                cwd = `apps/${serviceId}`;
        }

        // Start service in background
        const child = spawn('pnpm', command.split(' ').slice(1), {
            cwd: path.join(process.cwd(), cwd),
            detached: true,
            stdio: 'ignore'
        });

        child.unref();

        // Wait a moment and check if it started
        await new Promise(resolve => setTimeout(resolve, 3000));
        const isHealthy = await checkServiceHealth(service.port);

        if (isHealthy) {
            spinner.succeed(`${service.name} started successfully on port ${service.port}`);
        } else {
            spinner.warn(`${service.name} may be starting... Check status in a moment`);
        }
    } catch (error) {
        spinner.fail(`Failed to start ${service.name}: ${error}`);
    }
}

async function startCoreServices() {
    logger.info('Starting core services...');
    const coreServices = ['cbd', 'gateway', 'admin', 'id', 'hub'];

    for (const serviceId of coreServices) {
        await startService(serviceId);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Stagger starts
    }
}

async function startAllServices() {
    logger.info('Starting all services...');
    const allServices = Object.keys(CONFIG.SERVICES);

    for (const serviceId of allServices) {
        await startService(serviceId);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Stagger starts
    }
}

// Stop Command
program
    .command('stop')
    .description('Stop CODAI services')
    .option('-s, --service <service>', 'Stop specific service')
    .option('-a, --all', 'Stop all services')
    .action(async (options) => {
        if (options.service) {
            await stopService(options.service);
        } else if (options.all) {
            await stopAllServices();
        } else {
            const { confirmed } = await inquirer.prompt([{
                type: 'confirm',
                name: 'confirmed',
                message: 'Stop all CODAI services?',
                default: false
            }]);

            if (confirmed) {
                await stopAllServices();
            }
        }
    });

async function stopService(serviceId: string) {
    const service = CONFIG.SERVICES[serviceId as keyof typeof CONFIG.SERVICES];
    if (!service) {
        logger.error(`Unknown service: ${serviceId}`);
        return;
    }

    const spinner = ora(`Stopping ${service.name}...`).start();

    try {
        // Kill process on port
        if (process.platform === 'win32') {
            await execAsync(`netstat -ano | findstr :${service.port} | findstr LISTENING`).then(async (result) => {
                const lines = result.stdout.split('\n');
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 5) {
                        const pid = parts[4];
                        await execAsync(`taskkill /PID ${pid} /F`);
                    }
                }
            });
        } else {
            await execAsync(`lsof -ti:${service.port} | xargs kill -9`);
        }

        spinner.succeed(`${service.name} stopped`);
    } catch (error) {
        spinner.warn(`${service.name} may not be running`);
    }
}

async function stopAllServices() {
    logger.info('Stopping all services...');
    const allServices = Object.keys(CONFIG.SERVICES);

    for (const serviceId of allServices) {
        await stopService(serviceId);
    }
}

// Logs Command
program
    .command('logs')
    .description('View service logs')
    .option('-s, --service <service>', 'Service to view logs for')
    .option('-f, --follow', 'Follow log output')
    .action(async (options) => {
        if (!options.service) {
            const choices = Object.entries(CONFIG.SERVICES).map(([id, config]) => ({
                name: config.name,
                value: id
            }));

            const answers = await inquirer.prompt([{
                type: 'list',
                name: 'service',
                message: 'Select service to view logs:',
                choices: choices
            }]);

            options.service = answers.service;
        }

        logger.info(`Viewing logs for ${CONFIG.SERVICES[options.service as keyof typeof CONFIG.SERVICES]?.name}...`);
        // Log viewing implementation would go here
        // For now, just show a message
        logger.warning('Log viewing feature coming soon!');
    });

// Health Command
program
    .command('health')
    .description('Detailed health check of all services')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
        const spinner = ora('Running comprehensive health check...').start();

        try {
            const gatewayResponse = await fetch(`${CONFIG.GATEWAY_URL}/health`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!gatewayResponse.ok) {
                throw new Error('Gateway unreachable');
            }

            const healthData = await gatewayResponse.json();
            spinner.stop();

            logger.title('\n🏥 CODAI Health Report');
            console.log('═'.repeat(60));

            console.log(`📊 Gateway Status: ${healthData.status.toUpperCase()}`);
            console.log(`⏱️ Uptime: ${healthData.uptime} seconds`);
            console.log(`🔧 Version: ${healthData.version}`);
            console.log(`📡 Registered Services: ${healthData.registeredServices}`);

            if (options.verbose) {
                console.log('\n📋 Service Details:');
                healthData.services.forEach((service: any) => {
                    const icon = service.status === 'healthy' ? '🟢' : '🔴';
                    console.log(`${icon} ${service.name}`);
                    console.log(`   URL: ${service.url}`);
                    console.log(`   Status: ${service.status}`);
                    console.log(`   Last Check: ${service.lastCheck}`);
                    if (service.responseTime) {
                        console.log(`   Response Time: ${service.responseTime}ms`);
                    }
                    console.log('');
                });
            }

            console.log('═'.repeat(60));

        } catch (error) {
            spinner.fail('Health check failed');
            logger.error(`Error: ${error}`);
        }
    });

// Deploy Command
program
    .command('deploy')
    .description('Deploy CODAI to production')
    .option('-e, --env <environment>', 'Deployment environment', 'production')
    .action(async (options) => {
        logger.warning('Deployment feature coming soon!');
        logger.info(`Target environment: ${options.env}`);
    });

// Test Command
program
    .command('test')
    .description('Run test suites')
    .option('-s, --service <service>', 'Test specific service')
    .option('-t, --type <type>', 'Test type (unit|integration|e2e)', 'unit')
    .action(async (options) => {
        logger.info(`Running ${options.type} tests...`);

        if (options.service) {
            logger.info(`Testing service: ${options.service}`);
        }

        logger.warning('Test execution feature coming soon!');
    });

// Version and setup
program
    .name('codai')
    .description('CODAI Ecosystem Command Line Interface')
    .version('1.0.0');

// Help command
program
    .command('help')
    .description('Show detailed help')
    .action(() => {
        console.log(chalk.bold.cyan('\n🚀 CODAI CLI - Complete Ecosystem Management\n'));

        console.log('Available Commands:');
        console.log('  status      - Check system status');
        console.log('  start       - Start services');
        console.log('  stop        - Stop services');
        console.log('  health      - Comprehensive health check');
        console.log('  logs        - View service logs');
        console.log('  test        - Run test suites');
        console.log('  deploy      - Deploy to production');
        console.log('');
        console.log('Examples:');
        console.log('  codai status              - Check all services');
        console.log('  codai start --core        - Start core services');
        console.log('  codai start -s admin      - Start admin service');
        console.log('  codai stop --all          - Stop all services');
        console.log('  codai health --verbose    - Detailed health report');
        console.log('');
    });

// Parse arguments
if (process.argv.length === 2) {
    // No arguments provided, show interactive menu
    (async () => {
        const choices = [
            'System Status',
            'Start Services',
            'Stop Services',
            'Health Check',
            'View Logs',
            'Run Tests',
            'Exit'
        ];

        const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: choices
        }]);

        switch (action) {
            case 'System Status':
                await program.parseAsync(['node', 'codai', 'status']);
                break;
            case 'Health Check':
                await program.parseAsync(['node', 'codai', 'health', '--verbose']);
                break;
            // Add other cases...
            default:
                logger.info('Goodbye!');
        }
    })();
} else {
    program.parse();
}
