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

const execAsync = promisify(exec);

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

// Colors and styling (simple implementation without chalk)
const colors = {
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// Logger
const logger = {
    info: (msg) => console.log(colors.blue('ℹ'), msg),
    success: (msg) => console.log(colors.green('✅'), msg),
    warning: (msg) => console.log(colors.yellow('⚠️'), msg),
    error: (msg) => console.log(colors.red('❌'), msg),
    title: (msg) => console.log(colors.bold(colors.cyan(msg)))
};

// Simple HTTP request function
function httpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: options.timeout || 5000
        };

        const req = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = {
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        data: data,
                        json: () => {
                            try {
                                return JSON.parse(data);
                            } catch {
                                return {};
                            }
                        }
                    };
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

async function checkServiceHealth(port) {
    try {
        // Try different health endpoints
        const healthPaths = ['/health', '/api/health'];

        for (const path of healthPaths) {
            try {
                const response = await httpRequest(`http://localhost:${port}${path}`);
                if (response.ok) {
                    return true;
                }
            } catch {
                // Continue to next path
            }
        }
        return false;
    } catch {
        return false;
    }
}

async function getSystemStatus() {
    console.log('🔍 Checking system status...');
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

    return results;
}

function displayStatus(services, json = false) {
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
            colors.green('HEALTHY') : colors.red('UNHEALTHY');

        console.log(`${icon} ${service.name.padEnd(25)} ${status.padEnd(15)} :${service.port}`);
    });

    console.log('\n' + '═'.repeat(60));
}

async function startService(serviceId) {
    const service = CONFIG.SERVICES[serviceId];
    if (!service) {
        logger.error(`Unknown service: ${serviceId}`);
        return;
    }

    console.log(`🚀 Starting ${service.name}...`);

    try {
        // Different start commands for different services
        let command = '';
        let args = [];
        let cwd = '';

        // Handle Windows vs Unix process spawning
        const isWindows = process.platform === 'win32';

        switch (serviceId) {
            case 'gateway':
                if (isWindows) {
                    command = 'cmd';
                    args = ['/c', 'pnpm', 'dev'];
                } else {
                    command = 'pnpm';
                    args = ['dev'];
                }
                cwd = path.join(process.cwd(), 'apps/gateway');
                break;
            case 'cbd':
                if (isWindows) {
                    command = 'cmd';
                    args = ['/c', 'tsx', 'src/start.ts'];
                } else {
                    command = 'tsx';
                    args = ['src/start.ts'];
                }
                cwd = path.join(process.cwd(), 'packages/cbd');
                break;
            default:
                if (isWindows) {
                    command = 'cmd';
                    args = ['/c', 'pnpm', 'dev'];
                } else {
                    command = 'pnpm';
                    args = ['dev'];
                }
                cwd = path.join(process.cwd(), `apps/${serviceId}`);
        }

        logger.info(`Executing: ${command} ${args.join(' ')} in ${cwd}`);

        // Start service in background
        const child = spawn(command, args, {
            cwd: cwd,
            detached: true,
            stdio: ['ignore', 'ignore', 'ignore'],
            shell: isWindows
        });

        if (!isWindows) {
            child.unref();
        }

        // Wait a moment and check if it started
        logger.info('Waiting for service to start...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        const isHealthy = await checkServiceHealth(service.port);

        if (isHealthy) {
            logger.success(`${service.name} started successfully on port ${service.port}`);
        } else {
            logger.warning(`${service.name} may be starting... Check status in a moment`);
            logger.info(`Try: codai status  or  codai health verbose`);
        }
    } catch (error) {
        logger.error(`Failed to start ${service.name}: ${error.message}`);
        logger.info(`You can also start manually using VS Code tasks or:`);
        logger.info(`cd ${cwd} && pnpm dev`);
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

async function stopService(serviceId) {
    const service = CONFIG.SERVICES[serviceId];
    if (!service) {
        logger.error(`Unknown service: ${serviceId}`);
        return;
    }

    console.log(`🛑 Stopping ${service.name}...`);

    try {
        // Kill process on port
        if (process.platform === 'win32') {
            try {
                const result = await execAsync(`netstat -ano | findstr :${service.port} | findstr LISTENING`);
                const lines = result.stdout.split('\n');
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 5) {
                        const pid = parts[4];
                        await execAsync(`taskkill /PID ${pid} /F`);
                    }
                }
                logger.success(`${service.name} stopped`);
            } catch {
                logger.warning(`${service.name} may not be running`);
            }
        } else {
            try {
                await execAsync(`lsof -ti:${service.port} | xargs kill -9`);
                logger.success(`${service.name} stopped`);
            } catch {
                logger.warning(`${service.name} may not be running`);
            }
        }
    } catch (error) {
        logger.error(`Failed to stop ${service.name}: ${error.message}`);
    }
}

async function stopAllServices() {
    logger.info('Stopping all services...');
    const allServices = Object.keys(CONFIG.SERVICES);

    for (const serviceId of allServices) {
        await stopService(serviceId);
    }
}

async function healthCheck(verbose = false) {
    console.log('🏥 Running comprehensive health check...');

    try {
        const response = await httpRequest(`${CONFIG.GATEWAY_URL}/health`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Gateway unreachable');
        }

        const healthData = response.json();

        logger.title('\n🏥 CODAI Health Report');
        console.log('═'.repeat(60));

        console.log(`📊 Gateway Status: ${healthData.status?.toUpperCase() || 'UNKNOWN'}`);
        console.log(`⏱️ Uptime: ${healthData.uptime || 0} seconds`);
        console.log(`🔧 Version: ${healthData.version || 'Unknown'}`);
        console.log(`📡 Registered Services: ${healthData.registeredServices || 0}`);

        if (verbose && healthData.services) {
            console.log('\n📋 Service Details:');
            healthData.services.forEach((service) => {
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
        logger.error(`Health check failed: ${error.message}`);
    }
}

function showHelp() {
    console.log(colors.bold(colors.cyan('\n🚀 CODAI CLI - Complete Ecosystem Management\n')));

    console.log('Available Commands:');
    console.log('  status      - Check system status');
    console.log('  start       - Start services');
    console.log('  stop        - Stop services');
    console.log('  health      - Comprehensive health check');
    console.log('  help        - Show this help');
    console.log('');
    console.log('Examples:');
    console.log('  codai status              - Check all services');
    console.log('  codai start core          - Start core services');
    console.log('  codai start all           - Start all services');
    console.log('  codai start admin         - Start admin service');
    console.log('  codai stop all            - Stop all services');
    console.log('  codai health verbose      - Detailed health report');
    console.log('');
}

// Main command processing
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        logger.title('🌐 CODAI CLI');
        console.log('Run "codai help" for available commands');
        return;
    }

    const command = args[0];
    const subcommand = args[1];
    const flags = args.slice(2);

    switch (command) {
        case 'status':
            const isJson = flags.includes('--json');
            const status = await getSystemStatus();
            displayStatus(status, isJson);
            break;

        case 'start':
            if (subcommand === 'core') {
                await startCoreServices();
            } else if (subcommand === 'all') {
                await startAllServices();
            } else if (subcommand && CONFIG.SERVICES[subcommand]) {
                await startService(subcommand);
            } else {
                logger.error('Usage: codai start [core|all|<service>]');
                console.log('Available services:', Object.keys(CONFIG.SERVICES).join(', '));
            }
            break;

        case 'stop':
            if (subcommand === 'all') {
                await stopAllServices();
            } else if (subcommand && CONFIG.SERVICES[subcommand]) {
                await stopService(subcommand);
            } else {
                logger.error('Usage: codai stop [all|<service>]');
                console.log('Available services:', Object.keys(CONFIG.SERVICES).join(', '));
            }
            break;

        case 'health':
            const verbose = subcommand === 'verbose' || flags.includes('--verbose');
            await healthCheck(verbose);
            break;

        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;

        default:
            logger.error(`Unknown command: ${command}`);
            showHelp();
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled rejection: ${reason}`);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught exception: ${error.message}`);
    process.exit(1);
});

// Run the CLI
if (require.main === module) {
    main().catch(error => {
        logger.error(`CLI error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    getSystemStatus,
    checkServiceHealth,
    startService,
    stopService,
    healthCheck,
    CONFIG
};
