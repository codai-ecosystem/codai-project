#!/usr/bin/env node

/**
 * CODAI Development Helper
 * Manages service startup and coordination for comprehensive testing
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import http from 'http';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service Configuration
const SERVICES = [
    {
        name: 'Gateway',
        port: 4000,
        command: 'node',
        args: ['gateway-simple.js'],
        cwd: path.join(__dirname, '../apps/gateway'),
        healthCheck: 'http://localhost:4000/health'
    },
    {
        name: 'CODAI',
        port: 4001,
        command: 'pnpm',
        args: ['dev'],
        cwd: path.join(__dirname, '../apps/codai'),
        healthCheck: 'http://localhost:4001/api/health'
    },
    {
        name: 'Admin',
        port: 4002,
        command: 'pnpm',
        args: ['dev'],
        cwd: path.join(__dirname, '../apps/admin'),
        healthCheck: 'http://localhost:4002/api/health',
        env: { NODE_OPTIONS: '--max-old-space-size=4096' }
    },
    {
        name: 'Hub',
        port: 4003,
        command: 'pnpm',
        args: ['dev'],
        cwd: path.join(__dirname, '../apps/hub'),
        healthCheck: 'http://localhost:4003/api/health',
        env: { NODE_OPTIONS: '--max-old-space-size=4096' }
    },
    {
        name: 'ID',
        port: 4004,
        command: 'pnpm',
        args: ['dev'],
        cwd: path.join(__dirname, '../apps/id'),
        healthCheck: 'http://localhost:4004/api/health',
        env: { NODE_OPTIONS: '--max-old-space-size=4096' }
    },
    {
        name: 'BancAI',
        port: 4005,
        command: 'pnpm',
        args: ['dev'],
        cwd: path.join(__dirname, '../apps/bancai'),
        healthCheck: 'http://localhost:4005/api/health',
        env: { NODE_OPTIONS: '--max-old-space-size=4096' }
    },
    {
        name: 'MemorAI',
        port: 4006,
        command: 'pnpm',
        args: ['dev'],
        cwd: path.join(__dirname, '../apps/memorai'),
        healthCheck: 'http://localhost:4006/api/health',
        env: { NODE_OPTIONS: '--max-old-space-size=4096' }
    },
    {
        name: 'CBD',
        port: 4180,
        command: 'npm',
        args: ['run', 'service'],
        cwd: path.join(__dirname, '../packages/cbd'),
        healthCheck: 'http://localhost:4180/health',
        env: { CBD_PORT: '4180', CBD_HOST: 'localhost' }
    }
];

// Global state
let runningServices = [];
let shuttingDown = false;

// Utility functions
function log(service, message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = service ? `[${service}]` : '[DEV-HELPER]';
    const colorMap = {
        info: '\x1b[36m',    // cyan
        success: '\x1b[32m', // green
        warning: '\x1b[33m', // yellow
        error: '\x1b[31m',   // red
        reset: '\x1b[0m'     // reset
    };

    console.log(`${colorMap[level]}${timestamp} ${prefix} ${message}${colorMap.reset}`);
}

function checkPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
        });

        server.on('error', () => resolve(false));
    });
}

async function waitForHealthCheck(service, maxRetries = 30) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const url = new URL(service.healthCheck);
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname,
                method: 'GET',
                timeout: 2000
            };

            await new Promise((resolve, reject) => {
                const req = http.request(options, (res) => {
                    if (res.statusCode === 200) {
                        resolve();
                    } else {
                        reject(new Error(`Health check failed with status ${res.statusCode}`));
                    }
                });

                req.on('error', reject);
                req.on('timeout', () => reject(new Error('Health check timeout')));
                req.setTimeout(2000);
                req.end();
            });

            log(service.name, `Health check passed`, 'success');
            return true;
        } catch (error) {
            if (i === maxRetries - 1) {
                log(service.name, `Health check failed after ${maxRetries} retries: ${error.message}`, 'error');
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    return false;
}

async function startService(service) {
    // Check if port is available
    const isPortAvailable = await checkPortAvailable(service.port);
    if (!isPortAvailable) {
        log(service.name, `Port ${service.port} is already in use, assuming service is running`, 'warning');
        return null;
    }

    // Check if service directory exists
    if (!fs.existsSync(service.cwd)) {
        log(service.name, `Service directory does not exist: ${service.cwd}`, 'error');
        return null;
    }

    log(service.name, `Starting on port ${service.port}...`, 'info');

    const env = { ...process.env, ...service.env };

    const child = spawn(service.command, service.args, {
        cwd: service.cwd,
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: process.platform === 'win32'
    });

    child.stdout.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
            log(service.name, message, 'info');
        }
    });

    child.stderr.on('data', (data) => {
        const message = data.toString().trim();
        if (message && !message.includes('warning')) {
            log(service.name, message, 'error');
        }
    });

    child.on('error', (error) => {
        log(service.name, `Process error: ${error.message}`, 'error');
    });

    child.on('exit', (code, signal) => {
        if (!shuttingDown) {
            log(service.name, `Process exited with code ${code} and signal ${signal}`, 'warning');
        }
    });

    // Wait for service to be ready
    const isHealthy = await waitForHealthCheck(service);
    if (!isHealthy) {
        log(service.name, `Failed to start properly`, 'error');
        child.kill();
        return null;
    }

    log(service.name, `Started successfully on port ${service.port}`, 'success');
    return child;
}

async function startAllServices() {
    log(null, 'Starting all services for comprehensive testing...', 'info');

    for (const service of SERVICES) {
        const child = await startService(service);
        if (child) {
            runningServices.push({ service, process: child });
        }
    }

    log(null, `Successfully started ${runningServices.length}/${SERVICES.length} services`, 'success');

    // Print service status
    console.log('\n=== SERVICE STATUS ===');
    SERVICES.forEach(service => {
        const isRunning = runningServices.some(rs => rs.service.name === service.name);
        const status = isRunning ? '✅ RUNNING' : '❌ FAILED';
        console.log(`${service.name.padEnd(10)} | Port ${service.port} | ${status}`);
    });
    console.log('=====================\n');

    if (runningServices.length === 0) {
        log(null, 'No services started successfully. Exiting.', 'error');
        process.exit(1);
    }
}

function stopAllServices() {
    if (shuttingDown) return;
    shuttingDown = true;

    log(null, 'Shutting down all services...', 'warning');

    runningServices.forEach(({ service, process }) => {
        log(service.name, 'Stopping...', 'warning');
        process.kill('SIGTERM');
    });

    setTimeout(() => {
        runningServices.forEach(({ service, process }) => {
            if (!process.killed) {
                log(service.name, 'Force killing...', 'error');
                process.kill('SIGKILL');
            }
        });
        process.exit(0);
    }, 5000);
}

// Handle graceful shutdown
process.on('SIGINT', stopAllServices);
process.on('SIGTERM', stopAllServices);
process.on('beforeExit', stopAllServices);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log(null, `Uncaught exception: ${error.message}`, 'error');
    stopAllServices();
});

process.on('unhandledRejection', (reason, promise) => {
    log(null, `Unhandled rejection at: ${promise}, reason: ${reason}`, 'error');
    stopAllServices();
});

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'start';

    switch (command) {
        case 'start':
        case 'dev':
            await startAllServices();

            // Keep process alive
            log(null, 'All services started. Press Ctrl+C to stop all services.', 'success');
            process.stdin.resume();
            break;

        case 'status':
            console.log('Checking service status...');
            for (const service of SERVICES) {
                const isPortUsed = !(await checkPortAvailable(service.port));
                const status = isPortUsed ? '✅ RUNNING' : '❌ STOPPED';
                console.log(`${service.name.padEnd(10)} | Port ${service.port} | ${status}`);
            }
            break;

        case 'help':
        default:
            console.log(`
CODAI Development Helper

Usage: node scripts/dev-helper.js [command]

Commands:
  start, dev  Start all services for development and testing
  status      Check the status of all services
  help        Show this help message

Services managed:
${SERVICES.map(s => `  - ${s.name.padEnd(10)} (port ${s.port})`).join('\n')}

This script is designed to support comprehensive testing by:
- Starting all services in the correct order
- Performing health checks to ensure services are ready
- Providing unified logging and error handling
- Graceful shutdown of all services
      `);
            break;
    }
}

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        log(null, `Fatal error: ${error.message}`, 'error');
        process.exit(1);
    });
}

export {
    SERVICES,
    startService,
    startAllServices,
    stopAllServices,
    checkPortAvailable,
    waitForHealthCheck
};
