#!/usr/bin/env node

/**
 * Test Infrastructure Manager
 * Handles service startup, health checks, and cleanup for real integration testing
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

// Simple color utilities
const colors = {
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    gray: (text) => `\x1b[90m${text}\x1b[0m`
};

const CONFIG = {
    // Primary apps that need dev servers for testing
    primaryApps: [
        { name: 'codai', port: 4001, path: 'apps/codai' },
        { name: 'admin', port: 4002, path: 'apps/admin' },
        { name: 'hub', port: 4003, path: 'apps/hub' },
        { name: 'id', port: 4004, path: 'apps/id' },
        { name: 'bancai', port: 4005, path: 'apps/bancai' },
        { name: 'memorai', port: 4006, path: 'apps/memorai' }
    ],
    healthCheckTimeout: 60000, // 1 minute
    healthCheckInterval: 2000,  // 2 seconds
    startupDelay: 5000,        // 5 seconds initial delay
    shutdownTimeout: 10000     // 10 seconds for graceful shutdown
};

class TestInfrastructure {
    constructor() {
        this.services = new Map();
        this.healthChecks = new Map();
        this.isShuttingDown = false;

        // Handle process termination
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
        process.on('exit', () => this.shutdown());
    }

    /**
     * Start all required services for testing
     */
    async startServices() {
        console.log(colors.blue('\n🚀 Starting test infrastructure...\n'));

        const startTime = Date.now();
        const results = [];

        // Start services in parallel
        const startPromises = CONFIG.primaryApps.map(async (app) => {
            try {
                const result = await this.startService(app);
                results.push({ app: app.name, success: true, result });
                return result;
            } catch (error) {
                console.error(colors.red(`❌ Failed to start ${app.name}: ${error.message}`));
                results.push({ app: app.name, success: false, error: error.message });
                return null;
            }
        });

        const serviceResults = await Promise.allSettled(startPromises);

        // Wait for initial startup delay
        console.log(colors.yellow(`⏳ Waiting ${CONFIG.startupDelay}ms for services to initialize...\n`));
        await this.delay(CONFIG.startupDelay);

        // Perform health checks
        console.log(colors.blue('🔍 Performing health checks...\n'));
        const healthResults = await this.performHealthChecks();

        const totalTime = Date.now() - startTime;
        const successCount = results.filter(r => r.success).length;

        console.log(colors.blue('\n📊 Infrastructure Status Summary:'));
        console.log(`   Total time: ${totalTime}ms`);
        console.log(`   Services started: ${successCount}/${CONFIG.primaryApps.length}`);
        console.log(`   Health checks passed: ${healthResults.healthy}/${healthResults.total}\n`);

        if (successCount === 0) {
            throw new Error('No services started successfully');
        }

        return {
            services: results,
            healthChecks: healthResults,
            totalTime,
            successRate: successCount / CONFIG.primaryApps.length
        };
    }

    /**
     * Start a single service
     */
    async startService(app) {
        console.log(colors.blue(`Starting ${app.name} on port ${app.port}...`));

        // Check if app directory exists
        const appPath = join(process.cwd(), app.path);
        try {
            await fs.access(appPath);
        } catch (error) {
            throw new Error(`App directory not found: ${app.path}`);
        }

        // Check if port is available
        const isPortFree = await this.checkPortAvailable(app.port);
        if (!isPortFree) {
            console.log(colors.yellow(`⚠️  Port ${app.port} already in use for ${app.name}`));
            return { status: 'already-running', port: app.port };
        }

        // Start the service
        const child = spawn('pnpm', ['dev'], {
            cwd: appPath,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, PORT: app.port.toString() }
        });

        // Store service reference
        this.services.set(app.name, {
            process: child,
            port: app.port,
            startTime: Date.now(),
            status: 'starting'
        });

        // Handle service output
        let output = '';
        child.stdout.on('data', (data) => {
            output += data.toString();
            if (output.includes('ready') || output.includes('started') || output.includes(`localhost:${app.port}`)) {
                this.services.get(app.name).status = 'ready';
            }
        });

        child.stderr.on('data', (data) => {
            const errorOutput = data.toString();
            if (errorOutput.includes('Error') || errorOutput.includes('EADDRINUSE')) {
                console.error(colors.red(`❌ ${app.name} error: ${errorOutput}`));
            }
        });

        child.on('error', (error) => {
            console.error(colors.red(`❌ ${app.name} process error: ${error.message}`));
            this.services.get(app.name).status = 'error';
        });

        child.on('exit', (code) => {
            if (code !== 0 && !this.isShuttingDown) {
                console.error(colors.red(`❌ ${app.name} exited with code ${code}`));
                this.services.get(app.name).status = 'stopped';
            }
        });

        console.log(colors.green(`✅ ${app.name} process started (PID: ${child.pid})`));

        return {
            status: 'started',
            pid: child.pid,
            port: app.port,
            startTime: Date.now()
        };
    }

    /**
     * Perform health checks on all services
     */
    async performHealthChecks() {
        const results = {
            healthy: 0,
            total: CONFIG.primaryApps.length,
            details: []
        };

        const healthPromises = CONFIG.primaryApps.map(async (app) => {
            const isHealthy = await this.checkServiceHealth(app);
            results.details.push({
                name: app.name,
                port: app.port,
                healthy: isHealthy,
                url: `http://localhost:${app.port}`
            });

            if (isHealthy) {
                results.healthy++;
                console.log(colors.green(`✅ ${app.name} health check passed`));
            } else {
                console.log(colors.red(`❌ ${app.name} health check failed`));
            }

            return isHealthy;
        });

        await Promise.all(healthPromises);
        return results;
    }

    /**
     * Check if a service is healthy
     */
    async checkServiceHealth(app) {
        const baseUrl = `http://localhost:${app.port}`;
        const endpoints = ['/', '/api/health', '/health', '/api/status'];

        const startTime = Date.now();

        while (Date.now() - startTime < CONFIG.healthCheckTimeout) {
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${baseUrl}${endpoint}`, {
                        timeout: 5000,
                        signal: AbortSignal.timeout(5000)
                    });

                    if (response.ok || response.status === 404) {
                        // 404 is ok - means server is running
                        return true;
                    }
                } catch (error) {
                    // Continue trying
                }
            }

            await this.delay(CONFIG.healthCheckInterval);
        }

        return false;
    }

    /**
     * Check if a port is available
     */
    async checkPortAvailable(port) {
        try {
            const response = await fetch(`http://localhost:${port}`, {
                timeout: 1000,
                signal: AbortSignal.timeout(1000)
            });
            return false; // Port is in use
        } catch (error) {
            return true; // Port is available
        }
    }

    /**
     * Shutdown all services
     */
    async shutdown() {
        if (this.isShuttingDown) return;
        this.isShuttingDown = true;

        console.log(colors.blue('\n🛑 Shutting down test infrastructure...\n'));

        const shutdownPromises = Array.from(this.services.entries()).map(async ([name, service]) => {
            try {
                console.log(colors.yellow(`🔄 Stopping ${name}...`));

                // Try graceful shutdown first
                service.process.kill('SIGTERM');

                // Wait for graceful shutdown
                await Promise.race([
                    new Promise(resolve => service.process.on('exit', resolve)),
                    this.delay(CONFIG.shutdownTimeout)
                ]);

                // Force kill if still running
                if (!service.process.killed) {
                    service.process.kill('SIGKILL');
                }

                console.log(colors.green(`✅ ${name} stopped`));
            } catch (error) {
                console.error(colors.red(`❌ Error stopping ${name}: ${error.message}`));
            }
        });

        await Promise.allSettled(shutdownPromises);
        console.log(colors.blue('🏁 Test infrastructure shutdown complete\n'));
    }

    /**
     * Utility: Delay execution
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI interface
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || process.argv[1]?.includes('test-infrastructure.js')) {
    const infrastructure = new TestInfrastructure();

    const command = process.argv[2];

    switch (command) {
        case 'start':
            infrastructure.startServices()
                .then((result) => {
                    console.log(colors.green('🎉 Test infrastructure ready!'));
                    console.log('Press Ctrl+C to shutdown services');

                    // Keep process alive
                    process.stdin.resume();
                })
                .catch((error) => {
                    console.error(colors.red(`💥 Failed to start infrastructure: ${error.message}`));
                    process.exit(1);
                });
            break;

        case 'stop':
            infrastructure.shutdown()
                .then(() => process.exit(0))
                .catch((error) => {
                    console.error(colors.red(`💥 Shutdown error: ${error.message}`));
                    process.exit(1);
                });
            break;

        default:
            console.log(`
${colors.blue('Test Infrastructure Manager')}

Usage:
  node scripts/test-infrastructure.js start    Start all services
  node scripts/test-infrastructure.js stop     Stop all services

The start command will:
  ✅ Start all primary app dev servers
  ✅ Perform health checks  
  ✅ Wait for services to be ready
  ✅ Provide status summary
`);
            break;
    }
}

export default TestInfrastructure;
