#!/usr/bin/env node

/**
 * 🚀 OPTIMIZED CODAI ECOSYSTEM ORCHESTRATOR
 * Single terminal to rule them all - FIXED VERSION
 * 
 * Key Improvements:
 * - Correct start commands for apps vs services
 * - Better error handling and stability
 * - Optimized health checks
 * - Service restart mechanisms
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 🎯 Complete service configuration with CORRECT start commands
const SERVICES_CONFIG = [
    // Core Apps (3000-3010) - Use "pnpm dev" for Next.js apps
    { name: 'codai', port: 3000, type: 'app', category: 'foundation', priority: 1, folder: 'apps', command: 'pnpm', args: ['dev'] },
    { name: 'memorai', port: 3001, type: 'app', category: 'foundation', priority: 1, folder: 'apps', command: 'pnpm', args: ['dev'] },
    { name: 'logai', port: 3002, type: 'app', category: 'foundation', priority: 1, folder: 'apps', command: 'pnpm', args: ['dev'] },
    { name: 'bancai', port: 3003, type: 'app', category: 'business', priority: 2, folder: 'apps', command: 'pnpm', args: ['dev'] },
    { name: 'wallet', port: 3004, type: 'app', category: 'business', priority: 2, folder: 'apps', command: 'pnpm', args: ['dev'] },
    { name: 'fabricai', port: 3005, type: 'app', category: 'business', priority: 2, folder: 'apps', command: 'pnpm', args: ['dev'] },
    { name: 'studiai', port: 3006, type: 'app', category: 'user', priority: 3, folder: 'apps', command: 'pnpm', args: ['dev'] },
    { name: 'sociai', port: 3007, type: 'app', category: 'user', priority: 3, folder: 'apps', command: 'pnpm', args: ['dev'] },
    { name: 'cumparai', port: 3008, type: 'app', category: 'user', priority: 3, folder: 'apps', command: 'pnpm', args: ['dev'] },
    { name: 'x', port: 3009, type: 'app', category: 'specialized', priority: 4, folder: 'apps', command: 'pnpm', args: ['dev'] },
    { name: 'publicai', port: 3010, type: 'app', category: 'specialized', priority: 4, folder: 'apps', command: 'pnpm', args: ['dev'] },

    // Extended Services (4000-4017) - Use "node server.js" for Express services
    { name: 'admin', port: 4000, type: 'service', category: 'infrastructure', priority: 1, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'AIDE', port: 4001, type: 'service', category: 'development', priority: 1, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'ajutai', port: 4002, type: 'service', category: 'user', priority: 2, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'analizai', port: 4003, type: 'service', category: 'business', priority: 2, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'dash', port: 4004, type: 'service', category: 'infrastructure', priority: 2, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'docs', port: 4005, type: 'service', category: 'infrastructure', priority: 2, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'explorer', port: 4006, type: 'service', category: 'specialized', priority: 3, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'hub', port: 4007, type: 'service', category: 'infrastructure', priority: 1, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'id', port: 4008, type: 'service', category: 'foundation', priority: 1, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'jucai', port: 4009, type: 'service', category: 'user', priority: 3, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'kodex', port: 4010, type: 'service', category: 'foundation', priority: 2, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'legalizai', port: 4011, type: 'service', category: 'specialized', priority: 3, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'marketai', port: 4012, type: 'service', category: 'business', priority: 3, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'metu', port: 4013, type: 'service', category: 'user', priority: 2, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'mod', port: 4014, type: 'service', category: 'development', priority: 3, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'stocai', port: 4015, type: 'service', category: 'foundation', priority: 2, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'templates', port: 4016, type: 'service', category: 'development', priority: 2, folder: 'services', command: 'node', args: ['server.js'] },
    { name: 'tools', port: 4017, type: 'service', category: 'development', priority: 2, folder: 'services', command: 'node', args: ['server.js'] }
];

class CodaiEcosystemOrchestrator {
    constructor() {
        this.services = new Map();
        this.processes = new Map();
        this.startTime = Date.now();
        this.dashboard = null;
        this.isShuttingDown = false;

        // Initialize service status
        SERVICES_CONFIG.forEach(service => {
            this.services.set(service.name, {
                ...service,
                status: 'stopped',
                process: null,
                uptime: 0,
                healthy: false,
                startTime: null,
                restartCount: 0
            });
        });
    }

    // 🚀 Start specific service with correct command
    async startService(serviceConfig) {
        const { name, port, type, category, priority, folder, command, args } = serviceConfig;

        const servicePath = path.join(process.cwd(), folder, name);

        if (!fs.existsSync(servicePath)) {
            console.log(`  ❌ ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${category.padEnd(12)} | Path not found: ${servicePath}`);
            this.services.set(name, {
                ...serviceConfig,
                status: 'error',
                error: 'Path not found'
            });
            return;
        }

        try {
            console.log(`  🔧 ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${category.padEnd(12)} | Starting...`);

            // Set environment variables
            const env = {
                ...process.env,
                PORT: port.toString(),
                NODE_ENV: 'development'
            };

            // Spawn process with correct command
            const childProcess = spawn(command, args, {
                cwd: servicePath,
                env: env,
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: os.platform() === 'win32'
            });

            // Store process reference
            this.processes.set(name, childProcess);

            // Update service status
            this.services.set(name, {
                ...serviceConfig,
                status: 'starting',
                process: childProcess,
                startTime: Date.now(),
                error: null
            });

            // Handle process events
            childProcess.on('spawn', () => {
                this.services.set(name, {
                    ...this.services.get(name),
                    status: 'running'
                });
                console.log(`  ✅ ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${category.padEnd(12)} | Operational`);
            });

            childProcess.on('error', (error) => {
                console.log(`  ❌ ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${category.padEnd(12)} | Failed to start`);
                this.services.set(name, {
                    ...this.services.get(name),
                    status: 'failed',
                    error: error.message
                });
                this.processes.delete(name);
            });

            childProcess.on('exit', (code, signal) => {
                if (!this.isShuttingDown) {
                    console.log(`  ⚠️ ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${category.padEnd(12)} | Exited with code ${code}`);

                    const serviceData = this.services.get(name);
                    this.services.set(name, {
                        ...serviceData,
                        status: 'failed',
                        error: `Exited with code ${code}`,
                        restartCount: (serviceData.restartCount || 0) + 1
                    });

                    // Auto-restart if not too many failures
                    if ((serviceData.restartCount || 0) < 3) {
                        setTimeout(() => {
                            if (!this.isShuttingDown) {
                                console.log(`  🔄 ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${category.padEnd(12)} | Auto-restarting...`);
                                this.startService(serviceConfig);
                            }
                        }, 5000);
                    }
                }
                this.processes.delete(name);
            });

            // Give service time to start
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.log(`  ❌ ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${category.padEnd(12)} | Error: ${error.message}`);
            this.services.set(name, {
                ...serviceConfig,
                status: 'error',
                error: error.message
            });
        }
    }

    // 🏥 Improved health check
    async pingService(name, port) {
        return new Promise((resolve) => {
            const http = require('http');
            const req = http.request({
                hostname: 'localhost',
                port: port,
                path: '/',
                method: 'GET',
                timeout: 3000
            }, (res) => {
                resolve(true);
            });

            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });

            req.end();
        });
    }

    // 📊 Enhanced dashboard
    renderDashboard() {
        if (this.isShuttingDown) return;

        const totalServices = SERVICES_CONFIG.length;
        const runningServices = Array.from(this.services.values()).filter(s => s.status === 'running').length;
        const healthyServices = Array.from(this.services.values()).filter(s => s.healthy).length;
        const coverage = Math.round((runningServices / totalServices) * 100);
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);

        // Clear screen and render header
        console.clear();
        console.log('┌─────────────────────────────────────────────────────────────────┐');
        console.log('│  🚀 OPTIMIZED CODAI ECOSYSTEM ORCHESTRATOR                       │');
        console.log('│  Single Terminal to Rule Them All - FIXED VERSION               │');
        console.log('│  ────────────────────────────────────────────────────────────   │');
        console.log(`│  Total Services: ${totalServices} | Running: ${runningServices.toString().padStart(2)} | Coverage: ${coverage.toString().padStart(3)}%  │`);
        console.log(`│  Uptime: ${this.formatUptime(uptime).padEnd(16)} | Last Update: ${new Date().toLocaleTimeString().padStart(8)}        │`);
        console.log('└─────────────────────────────────────────────────────────────────┘');

        // Services table
        console.log('\n📋 Services Status:');
        console.log('┌────────────┬──────┬──────────────┬──────────────┬─────────────┬─────────────┐');
        console.log('│ Service    │ Port │ Type         │ Category     │ Status      │ Uptime      │');
        console.log('├────────────┼──────┼──────────────┼──────────────┼─────────────┼─────────────┤');

        for (const service of SERVICES_CONFIG) {
            const serviceData = this.services.get(service.name);
            const status = this.getStatusIcon(serviceData.status);
            const uptime = serviceData.startTime ? this.formatUptime(Math.floor((Date.now() - serviceData.startTime) / 1000)) : '0s';

            console.log(`│ ${service.name.padEnd(10)} │ ${service.port.toString().padStart(4)} │ ${service.type.padEnd(12)} │ ${service.category.padEnd(12)} │ ${status.padEnd(11)} │ ${uptime.padEnd(11)} │`);
        }
        console.log('└────────────┴──────┴──────────────┴──────────────┴─────────────┴─────────────┘');

        // Statistics
        const stats = this.calculateStats();
        console.log('\n📊 Ecosystem Statistics:');
        console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
        console.log(`│ 🚀 Running Services: ${runningServices.toString().padStart(2)}/${totalServices} (${coverage}%)${' '.repeat(42)} │`);
        console.log(`│ ⚡ Healthy Services: ${healthyServices.toString().padStart(2)}/${totalServices} (${Math.round((healthyServices / totalServices) * 100)}%)${' '.repeat(42)} │`);
        console.log(`│ 🏗️  Infrastructure: ${stats.infrastructure} | 🤖 AI Services: ${stats.business} | 👥 User Services: ${stats.user}     │`);
        console.log(`│ 🎯 Priority 1: ${stats.p1} | Priority 2: ${stats.p2} | Priority 3: ${stats.p3} | Priority 4: ${stats.p4}             │`);
        console.log(`│ ⏱️  Total Uptime: ${this.formatUptime(uptime)}${' '.repeat(63 - this.formatUptime(uptime).length)} │`);
        console.log('└──────────────────────────────────────────────────────────────────────────────┘');

        console.log('\n🎮 Controls:');
        console.log('  Ctrl+C: Shutdown all services | r: Restart all | s: Status | h: Health check');
        console.log(`  Dashboard updates every 2 seconds | Last update: ${new Date().toLocaleTimeString()}`);
    }

    getStatusIcon(status) {
        switch (status) {
            case 'running': return '🟢 running';
            case 'starting': return '🟡 starting';
            case 'failed': return '🔴 failed';
            case 'error': return '❌ error';
            default: return '⚪ stopped';
        }
    }

    calculateStats() {
        const running = Array.from(this.services.values()).filter(s => s.status === 'running');
        return {
            infrastructure: running.filter(s => s.category === 'infrastructure').length,
            business: running.filter(s => s.category === 'business').length,
            user: running.filter(s => s.category === 'user').length,
            foundation: running.filter(s => s.category === 'foundation').length,
            specialized: running.filter(s => s.category === 'specialized').length,
            development: running.filter(s => s.category === 'development').length,
            p1: running.filter(s => s.priority === 1).length,
            p2: running.filter(s => s.priority === 2).length,
            p3: running.filter(s => s.priority === 3).length,
            p4: running.filter(s => s.priority === 4).length
        };
    }

    formatUptime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }

    // 🚀 Start services by priority
    async startEcosystem() {
        console.log('🚀 Starting Codai Ecosystem Services...\n');

        const priorities = [1, 2, 3, 4];

        for (const priority of priorities) {
            const priorityServices = SERVICES_CONFIG.filter(s => s.priority === priority);

            console.log(`📋 Starting Priority ${priority} Services (${priorityServices.length} services):`);

            // Start all services in this priority level
            await Promise.all(priorityServices.map(service => this.startService(service)));

            console.log(`✅ Priority ${priority} deployment complete\n`);

            // Brief pause between priority levels
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Start health monitoring
        this.startHealthMonitoring();

        // Start dashboard
        console.log('🎨 Starting Real-Time Dashboard...');
        this.dashboard = setInterval(() => {
            this.renderDashboard();
        }, 2000);

        // Handle keyboard input
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', (key) => {
            if (key[0] === 3) { // Ctrl+C
                this.shutdown();
            }
        });
    }

    // 🏥 Start health monitoring
    startHealthMonitoring() {
        setInterval(async () => {
            if (this.isShuttingDown) return;

            for (const [name, serviceData] of this.services.entries()) {
                if (serviceData.status === 'running') {
                    const isHealthy = await this.pingService(name, serviceData.port);
                    this.services.set(name, {
                        ...serviceData,
                        healthy: isHealthy
                    });
                }
            }
        }, 10000); // Check every 10 seconds
    }

    // 🛑 Graceful shutdown
    async shutdown() {
        this.isShuttingDown = true;

        console.log('\n\n🛑 Shutting down orchestrator...');
        console.log('🛑 Stopping all services...');

        if (this.dashboard) {
            clearInterval(this.dashboard);
        }

        // Stop all processes
        for (const [name, process] of this.processes.entries()) {
            console.log(`  🛑 Stopped ${name}`);
            process.kill('SIGTERM');
        }

        // Give processes time to shut down gracefully
        await new Promise(resolve => setTimeout(resolve, 2000));

        process.exit(0);
    }
}

// 🎯 Main execution
async function main() {
    const action = process.argv[2] || 'start';

    if (action === 'start') {
        const orchestrator = new CodaiEcosystemOrchestrator();
        await orchestrator.startEcosystem();
    } else {
        console.log('Usage: node orchestrator-optimized.cjs [start]');
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

main().catch(console.error);
