#!/usr/bin/env node

/**
 * Development Orchestrator
 * Manages all primary services with hot reload, port management, and health monitoring
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { watch } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Enhanced color utilities
const colors = {
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    magenta: (text) => `\x1b[35m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    gray: (text) => `\x1b[90m${text}\x1b[0m`,
    bold: (text) => `\x1b[1m${text}\x1b[0m`,
    reset: '\x1b[0m'
};

const CONFIG = {
    // Primary applications with corrected ports
    primaryApps: [
        {
            name: 'codai',
            port: 4001,
            path: 'apps/codai',
            type: 'next',
            env: { PORT: 4001, NODE_ENV: 'development' },
            healthPath: '/',
            dependencies: []
        },
        {
            name: 'admin',
            port: 4002,
            path: 'apps/admin',
            type: 'next',
            env: { PORT: 4002, NODE_ENV: 'development' },
            healthPath: '/',
            dependencies: []
        },
        {
            name: 'hub',
            port: 4003,
            path: 'apps/hub',
            type: 'next',
            env: { PORT: 4003, NODE_ENV: 'development' },
            healthPath: '/',
            dependencies: []
        },
        {
            name: 'id',
            port: 4004,
            path: 'apps/id',
            type: 'next',
            env: { PORT: 4004, NODE_ENV: 'development' },
            healthPath: '/',
            dependencies: []
        },
        {
            name: 'bancai',
            port: 4005,
            path: 'apps/bancai',
            type: 'next',
            env: { PORT: 4005, NODE_ENV: 'development' },
            healthPath: '/',
            dependencies: []
        },
        {
            name: 'memorai',
            port: 4006,
            path: 'apps/memorai',
            type: 'next',
            env: { PORT: 4006, NODE_ENV: 'development' },
            healthPath: '/',
            dependencies: []
        }
    ],

    // Supporting services
    supportingServices: [
        {
            name: 'memorai-api',
            port: 4106,
            path: 'apps/memorai/apps/api',
            type: 'node',
            env: { PORT: 4106, NODE_ENV: 'development' },
            healthPath: '/health',
            dependencies: ['memorai']
        },
        {
            name: 'memorai-dashboard',
            port: 4206,
            path: 'apps/memorai/apps/dashboard',
            type: 'next',
            env: { PORT: 4206, NODE_ENV: 'development' },
            healthPath: '/',
            dependencies: ['memorai', 'memorai-api']
        }
    ],

    orchestrator: {
        healthCheckInterval: 5000,    // 5 seconds
        startupDelay: 3000,          // 3 seconds between service starts
        restartDelay: 2000,          // 2 seconds before restart
        maxRestarts: 3,              // Max restarts per service
        watchDebounce: 1000,         // File watch debounce
        shutdownTimeout: 10000       // Graceful shutdown timeout
    }
};

class DevOrchestrator {
    constructor() {
        this.services = new Map();
        this.watchers = new Map();
        this.healthChecks = new Map();
        this.restartCounts = new Map();
        this.isShuttingDown = false;
        this.startTime = Date.now();

        // Handle process termination
        process.on('SIGINT', () => this.gracefulShutdown());
        process.on('SIGTERM', () => this.gracefulShutdown());
        process.on('uncaughtException', (error) => {
            console.error(colors.red('💥 Uncaught Exception:'), error);
            this.gracefulShutdown();
        });
    }

    /**
     * Start all services with orchestrated startup
     */
    async startAll() {
        console.log(colors.bold(colors.blue('\n🚀 Starting Development Orchestrator...\n')));

        try {
            // Check ports first
            await this.checkPortAvailability();

            // Start primary apps first
            console.log(colors.cyan('📱 Starting Primary Applications...\n'));
            for (const app of CONFIG.primaryApps) {
                await this.startService(app);
                await this.delay(CONFIG.orchestrator.startupDelay);
            }

            // Wait for primary apps to be healthy
            console.log(colors.yellow('⏳ Waiting for primary services to be healthy...\n'));
            await this.waitForHealthy(CONFIG.primaryApps);

            // Start supporting services
            console.log(colors.cyan('🔧 Starting Supporting Services...\n'));
            for (const service of CONFIG.supportingServices) {
                await this.startService(service);
                await this.delay(CONFIG.orchestrator.startupDelay);
            }

            // Setup file watchers for auto-reload
            await this.setupFileWatchers();

            // Start health monitoring
            this.startHealthMonitoring();

            console.log(colors.bold(colors.green('\n✅ Development Orchestrator Ready!\n')));
            this.printStatus();

            // Keep process alive
            console.log(colors.gray('Press Ctrl+C to gracefully shutdown all services\n'));
            process.stdin.resume();

        } catch (error) {
            console.error(colors.red('💥 Failed to start orchestrator:'), error.message);
            await this.gracefulShutdown();
            process.exit(1);
        }
    }

    /**
     * Start a single service
     */
    async startService(service) {
        console.log(colors.blue(`🔄 Starting ${service.name} on port ${service.port}...`));

        try {
            const servicePath = join(projectRoot, service.path);

            // Check if path exists
            try {
                await fs.access(servicePath);
            } catch {
                console.log(colors.yellow(`⚠️  Service path not found: ${servicePath}, skipping...`));
                return null;
            }

            // Determine start command based on type
            let command, args;
            if (service.type === 'next') {
                command = 'pnpm';
                args = ['dev', '-p', service.port.toString()];
            } else if (service.type === 'node') {
                command = 'pnpm';
                args = ['start'];
            } else {
                command = 'pnpm';
                args = ['dev'];
            }

            // Start the service
            const child = spawn(command, args, {
                cwd: servicePath,
                env: {
                    ...process.env,
                    ...service.env,
                    FORCE_COLOR: '1',
                    CI: 'false'
                },
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            // Setup logging with service prefix
            child.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`${colors.gray(`[${service.name}]`)} ${output}`);
                }
            });

            child.stderr.on('data', (data) => {
                const output = data.toString().trim();
                if (output && !output.includes('DeprecationWarning')) {
                    console.log(`${colors.yellow(`[${service.name}]`)} ${output}`);
                }
            });

            child.on('error', (error) => {
                console.error(colors.red(`❌ ${service.name} process error:`), error.message);
                this.handleServiceFailure(service);
            });

            child.on('exit', (code, signal) => {
                if (!this.isShuttingDown && code !== 0) {
                    console.error(colors.red(`❌ ${service.name} exited with code ${code}`));
                    this.handleServiceFailure(service);
                }
            });

            // Store service info
            this.services.set(service.name, {
                ...service,
                process: child,
                status: 'starting',
                startTime: Date.now(),
                restarts: this.restartCounts.get(service.name) || 0
            });

            console.log(colors.green(`✅ ${service.name} process started (PID: ${child.pid})`));
            return child;

        } catch (error) {
            console.error(colors.red(`❌ Failed to start ${service.name}:`), error.message);
            throw error;
        }
    }

    /**
     * Setup file watchers for auto-reload
     */
    async setupFileWatchers() {
        console.log(colors.cyan('👀 Setting up file watchers for auto-reload...\n'));

        for (const [serviceName, serviceInfo] of this.services) {
            const servicePath = join(projectRoot, serviceInfo.path);

            try {
                // Watch for file changes
                const watcher = watch(servicePath, { recursive: true }, (eventType, filename) => {
                    if (filename && this.shouldReloadForFile(filename)) {
                        console.log(colors.yellow(`🔄 File changed: ${filename}, reloading ${serviceName}...`));
                        this.debounceRestart(serviceName);
                    }
                });

                this.watchers.set(serviceName, watcher);
                console.log(colors.green(`✅ File watcher active for ${serviceName}`));

            } catch (error) {
                console.log(colors.yellow(`⚠️  Could not setup file watcher for ${serviceName}:`, error.message));
            }
        }
    }

    /**
     * Check if file change should trigger reload
     */
    shouldReloadForFile(filename) {
        const reloadExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.env'];
        const ignorePatterns = [
            'node_modules',
            '.next',
            '.git',
            'dist',
            'build',
            '.cache',
            'coverage',
            '.test.',
            '.spec.'
        ];

        // Check if file should be ignored
        if (ignorePatterns.some(pattern => filename.includes(pattern))) {
            return false;
        }

        // Check if file extension should trigger reload
        return reloadExtensions.some(ext => filename.endsWith(ext));
    }

    /**
     * Debounced restart to prevent rapid restarts
     */
    debounceRestart(serviceName) {
        if (this.restartTimers?.has(serviceName)) {
            clearTimeout(this.restartTimers.get(serviceName));
        }

        if (!this.restartTimers) {
            this.restartTimers = new Map();
        }

        const timer = setTimeout(() => {
            this.restartService(serviceName);
            this.restartTimers.delete(serviceName);
        }, CONFIG.orchestrator.watchDebounce);

        this.restartTimers.set(serviceName, timer);
    }

    /**
     * Restart a specific service
     */
    async restartService(serviceName) {
        console.log(colors.yellow(`🔄 Restarting ${serviceName}...`));

        const serviceInfo = this.services.get(serviceName);
        if (!serviceInfo) return;

        try {
            // Stop the service
            if (serviceInfo.process && !serviceInfo.process.killed) {
                serviceInfo.process.kill('SIGTERM');
                await this.delay(CONFIG.orchestrator.restartDelay);
            }

            // Increment restart count
            const restarts = this.restartCounts.get(serviceName) || 0;
            this.restartCounts.set(serviceName, restarts + 1);

            // Restart if under limit
            if (restarts < CONFIG.orchestrator.maxRestarts) {
                await this.startService(serviceInfo);
            } else {
                console.error(colors.red(`❌ ${serviceName} exceeded max restarts (${CONFIG.orchestrator.maxRestarts})`));
            }

        } catch (error) {
            console.error(colors.red(`❌ Failed to restart ${serviceName}:`), error.message);
        }
    }

    /**
     * Handle service failure
     */
    handleServiceFailure(service) {
        if (this.isShuttingDown) return;

        console.log(colors.yellow(`⚠️  Service ${service.name} failed, attempting restart...`));
        setTimeout(() => {
            this.restartService(service.name);
        }, CONFIG.orchestrator.restartDelay);
    }

    /**
     * Check port availability
     */
    async checkPortAvailability() {
        console.log(colors.cyan('🔍 Checking port availability...\n'));

        const allServices = [...CONFIG.primaryApps, ...CONFIG.supportingServices];
        const portChecks = allServices.map(async (service) => {
            try {
                const { exec } = await import('child_process');
                const { promisify } = await import('util');
                const execAsync = promisify(exec);

                // Check if port is in use
                const { stdout } = await execAsync(`netstat -an | findstr :${service.port}`);
                if (stdout.trim()) {
                    console.log(colors.yellow(`⚠️  Port ${service.port} (${service.name}) may be in use`));
                } else {
                    console.log(colors.green(`✅ Port ${service.port} (${service.name}) available`));
                }
            } catch (error) {
                // Port likely available if netstat fails to find it
                console.log(colors.green(`✅ Port ${service.port} (${service.name}) available`));
            }
        });

        await Promise.all(portChecks);
        console.log();
    }

    /**
     * Wait for services to be healthy
     */
    async waitForHealthy(services, timeout = 60000) {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const healthPromises = services.map(async (service) => {
                try {
                    const response = await fetch(`http://localhost:${service.port}${service.healthPath}`);
                    return { service: service.name, healthy: response.ok };
                } catch {
                    return { service: service.name, healthy: false };
                }
            });

            const results = await Promise.all(healthPromises);
            const unhealthy = results.filter(r => !r.healthy);

            if (unhealthy.length === 0) {
                console.log(colors.green('✅ All services are healthy!\n'));
                return true;
            }

            console.log(colors.gray(`⏳ Waiting for: ${unhealthy.map(r => r.service).join(', ')}`));
            await this.delay(2000);
        }

        console.log(colors.yellow('⚠️  Some services may not be fully ready\n'));
        return false;
    }

    /**
     * Start health monitoring
     */
    startHealthMonitoring() {
        console.log(colors.cyan('🩺 Starting health monitoring...\n'));

        const healthCheck = setInterval(async () => {
            if (this.isShuttingDown) {
                clearInterval(healthCheck);
                return;
            }

            for (const [serviceName, serviceInfo] of this.services) {
                if (serviceInfo.status === 'running') {
                    try {
                        const response = await fetch(`http://localhost:${serviceInfo.port}${serviceInfo.healthPath}`, {
                            timeout: 5000
                        });

                        if (!response.ok) {
                            console.log(colors.yellow(`⚠️  Health check failed for ${serviceName}: ${response.status}`));
                        }
                    } catch (error) {
                        console.log(colors.yellow(`⚠️  Health check failed for ${serviceName}: ${error.message}`));
                    }
                }
            }
        }, CONFIG.orchestrator.healthCheckInterval);

        this.healthChecks.set('main', healthCheck);
    }

    /**
     * Print orchestrator status
     */
    printStatus() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);

        console.log(colors.bold(colors.blue('📊 Orchestrator Status:')));
        console.log(colors.gray(`   Uptime: ${uptime}s`));
        console.log(colors.gray(`   Services: ${this.services.size}`));
        console.log(colors.gray(`   Watchers: ${this.watchers.size}`));
        console.log();

        console.log(colors.bold(colors.green('🌐 Service URLs:')));
        for (const [name, info] of this.services) {
            console.log(colors.cyan(`   ${name}: http://localhost:${info.port}`));
        }
        console.log();
    }

    /**
     * Graceful shutdown
     */
    async gracefulShutdown() {
        if (this.isShuttingDown) return;
        this.isShuttingDown = true;

        console.log(colors.yellow('\n🛑 Gracefully shutting down orchestrator...\n'));

        // Stop health checks
        for (const [name, check] of this.healthChecks) {
            clearInterval(check);
        }

        // Stop file watchers
        for (const [name, watcher] of this.watchers) {
            try {
                watcher.close();
                console.log(colors.gray(`✅ File watcher stopped: ${name}`));
            } catch (error) {
                console.log(colors.yellow(`⚠️  Error stopping watcher ${name}:`, error.message));
            }
        }

        // Stop all services
        const shutdownPromises = Array.from(this.services.entries()).map(async ([name, info]) => {
            try {
                console.log(colors.gray(`🔄 Stopping ${name}...`));

                if (info.process && !info.process.killed) {
                    info.process.kill('SIGTERM');

                    // Wait for graceful shutdown or force kill
                    await new Promise((resolve) => {
                        const timeout = setTimeout(() => {
                            if (!info.process.killed) {
                                info.process.kill('SIGKILL');
                            }
                            resolve();
                        }, CONFIG.orchestrator.shutdownTimeout);

                        info.process.on('exit', () => {
                            clearTimeout(timeout);
                            resolve();
                        });
                    });
                }

                console.log(colors.green(`✅ ${name} stopped`));
            } catch (error) {
                console.log(colors.yellow(`⚠️  Error stopping ${name}:`, error.message));
            }
        });

        await Promise.all(shutdownPromises);

        console.log(colors.bold(colors.green('\n🏁 Orchestrator shutdown complete\n')));
        process.exit(0);
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI interface
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || process.argv[1]?.includes('dev-orchestrator.js')) {
    const orchestrator = new DevOrchestrator();

    const command = process.argv[2];

    switch (command) {
        case 'start':
        case undefined:
            orchestrator.startAll().catch((error) => {
                console.error(colors.red('💥 Failed to start orchestrator:'), error.message);
                process.exit(1);
            });
            break;

        case 'status':
            orchestrator.printStatus();
            break;

        default:
            console.log(`
${colors.bold(colors.blue('🚀 Development Orchestrator'))}

${colors.green('Commands:')}
  ${colors.cyan('start')}     Start all services with auto-reload
  ${colors.cyan('status')}    Show orchestrator status

${colors.green('Features:')}
  ✅ Auto-reload on file changes
  ✅ Health monitoring
  ✅ Graceful shutdown
  ✅ Port management
  ✅ Service dependencies
  ✅ Centralized logging

${colors.green('Primary Services:')}
  🌐 codai     → http://localhost:4001
  🌐 admin     → http://localhost:4002  
  🌐 hub       → http://localhost:4003
  🌐 id        → http://localhost:4004
  🌐 bancai    → http://localhost:4005
  🌐 memorai   → http://localhost:4006

${colors.green('Supporting Services:')}
  🔧 memorai-api       → http://localhost:4106
  🔧 memorai-dashboard → http://localhost:4206
`);
            break;
    }
}

export default DevOrchestrator;
