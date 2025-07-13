#!/usr/bin/env node

/**
 * 🎼 CODAI ECOSYSTEM ORCHESTRATOR
 * Single terminal to rule them all
 * 
 * Manages all 29 services with real-time status dashboard
 * No more multiple terminal windows mess!
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 🎯 Complete service configuration from projects.index.json
const SERVICES_CONFIG = [
    // Core Apps (3000-3010)
    { name: 'codai', port: 3000, type: 'app', category: 'foundation', priority: 1 },
    { name: 'memorai', port: 3001, type: 'app', category: 'foundation', priority: 1 },
    { name: 'logai', port: 3002, type: 'app', category: 'foundation', priority: 1 },
    { name: 'bancai', port: 3003, type: 'app', category: 'business', priority: 2 },
    { name: 'wallet', port: 3004, type: 'app', category: 'business', priority: 2 },
    { name: 'fabricai', port: 3005, type: 'app', category: 'business', priority: 2 },
    { name: 'studiai', port: 3006, type: 'app', category: 'user', priority: 3 },
    { name: 'sociai', port: 3007, type: 'app', category: 'user', priority: 3 },
    { name: 'cumparai', port: 3008, type: 'app', category: 'user', priority: 3 },
    { name: 'x', port: 3009, type: 'app', category: 'specialized', priority: 4 },
    { name: 'publicai', port: 3010, type: 'app', category: 'specialized', priority: 4 },

    // Extended Services (4000-4017)
    { name: 'admin', port: 4000, type: 'service', category: 'infrastructure', priority: 1 },
    { name: 'AIDE', port: 4001, type: 'service', category: 'development', priority: 1 },
    { name: 'ajutai', port: 4002, type: 'service', category: 'user', priority: 2 },
    { name: 'analizai', port: 4003, type: 'service', category: 'business', priority: 2 },
    { name: 'dash', port: 4004, type: 'service', category: 'infrastructure', priority: 2 },
    { name: 'docs', port: 4005, type: 'service', category: 'infrastructure', priority: 2 },
    { name: 'explorer', port: 4006, type: 'service', category: 'specialized', priority: 3 },
    { name: 'hub', port: 4007, type: 'service', category: 'infrastructure', priority: 1 },
    { name: 'id', port: 4008, type: 'service', category: 'foundation', priority: 1 },
    { name: 'jucai', port: 4009, type: 'service', category: 'user', priority: 3 },
    { name: 'kodex', port: 4010, type: 'service', category: 'foundation', priority: 2 },
    { name: 'legalizai', port: 4011, type: 'service', category: 'specialized', priority: 3 },
    { name: 'marketai', port: 4012, type: 'service', category: 'business', priority: 3 },
    { name: 'metu', port: 4013, type: 'service', category: 'user', priority: 2 },
    { name: 'mod', port: 4014, type: 'service', category: 'development', priority: 3 },
    { name: 'stocai', port: 4015, type: 'service', category: 'foundation', priority: 2 },
    { name: 'templates', port: 4016, type: 'service', category: 'development', priority: 2 },
    { name: 'tools', port: 4017, type: 'service', category: 'development', priority: 2 }
];

class CodaiEcosystemOrchestrator {
    constructor() {
        this.services = new Map();
        this.totalServices = SERVICES_CONFIG.length;
        this.runningCount = 0;
        this.startTime = Date.now();
        this.dashboard = {
            lastUpdate: Date.now(),
            updateInterval: 2000, // 2 seconds
        };
    }

    // 🎼 Main orchestration entry point
    async orchestrate(command = 'start') {
        console.clear();
        this.printHeader();

        switch (command) {
            case 'start':
            case 'dev':
                await this.startAllServices();
                break;
            case 'stop':
                await this.stopAllServices();
                break;
            case 'restart':
                await this.restartAllServices();
                break;
            case 'status':
                await this.showStatus();
                break;
            case 'health':
                await this.healthCheck();
                break;
            default:
                this.showHelp();
        }
    }

    // 🎨 Beautiful header
    printHeader() {
        const header = `
┌─────────────────────────────────────────────────────────────────┐
│  🎼 CODAI ECOSYSTEM ORCHESTRATOR                                 │
│  Single Terminal to Rule Them All                               │
│  ────────────────────────────────────────────────────────────   │
│  Total Services: ${this.totalServices.toString().padStart(2)} | Running: ${this.runningCount.toString().padStart(2)} | Coverage: ${((this.runningCount / this.totalServices) * 100).toFixed(0).padStart(3)}%  │
│  Uptime: ${this.getUptime().padEnd(15)} | Last Update: ${new Date().toLocaleTimeString()}        │
└─────────────────────────────────────────────────────────────────┘
`;
        console.log(header);
    }

    // 🚀 Start all services with real-time status
    async startAllServices() {
        console.log('🚀 Starting Codai Ecosystem Services...\n');

        // Group by priority for staged deployment
        const priorityGroups = this.groupByPriority();

        for (const [priority, services] of priorityGroups) {
            console.log(`📋 Starting Priority ${priority} Services (${services.length} services):`);
            await this.startServicesGroup(services);
            console.log(`✅ Priority ${priority} deployment complete\n`);

            // Brief pause between priority groups
            await this.sleep(1000);
        }

        // Start real-time dashboard
        this.startDashboard();
    }

    // 🏗️ Start a group of services
    async startServicesGroup(services) {
        const promises = services.map(service => this.startService(service));
        await Promise.allSettled(promises);
    }

    // 🔧 Start individual service
    async startService(serviceConfig) {
        const { name, port, type, category } = serviceConfig;
        const servicePath = type === 'app' ?
            path.join(process.cwd(), 'apps', name) :
            path.join(process.cwd(), 'services', name);

        try {
            // Check if service directory exists
            if (!fs.existsSync(servicePath)) {
                throw new Error(`Service directory not found: ${servicePath}`);
            }

            // Determine start command
            const startCommand = await this.getStartCommand(servicePath);

            console.log(`  🔧 ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${category.padEnd(12)} | Starting...`);

            // Spawn service process
            const process = spawn(startCommand.command, startCommand.args, {
                cwd: servicePath,
                stdio: 'pipe',
                shell: true,
                detached: true
            });

            // Store service info
            this.services.set(name, {
                ...serviceConfig,
                process: process,
                status: 'starting',
                startTime: Date.now(),
                logs: [],
                lastPing: null
            });

            // Handle process events
            process.stdout?.on('data', (data) => {
                this.handleServiceLog(name, data.toString(), 'info');
            });

            process.stderr?.on('data', (data) => {
                this.handleServiceLog(name, data.toString(), 'error');
            });

            process.on('close', (code) => {
                this.handleServiceExit(name, code);
            });

            process.on('error', (error) => {
                this.handleServiceError(name, error);
            });

            // Detach so parent can exit
            process.unref();

            // Wait for service to start
            await this.sleep(2000);

            // Check if service is responding
            const isHealthy = await this.pingService(name, port);
            if (isHealthy) {
                this.services.get(name).status = 'running';
                this.runningCount++;
                console.log(`  ✅ ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${category.padEnd(12)} | Operational`);
            } else {
                this.services.get(name).status = 'failed';
                console.log(`  ❌ ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${category.padEnd(12)} | Failed to start`);
            }

        } catch (error) {
            console.log(`  ❌ ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${category.padEnd(12)} | Error: ${error.message}`);
            this.services.set(name, {
                ...serviceConfig,
                status: 'error',
                error: error.message
            });
        }
    }

    // 🔍 Determine start command for service
    async getStartCommand(servicePath) {
        const packageJsonPath = path.join(servicePath, 'package.json');

        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

                // Check for Next.js
                if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
                    return { command: 'pnpm', args: ['dev'] };
                }

                // Check for custom start script
                if (packageJson.scripts?.dev) {
                    return { command: 'pnpm', args: ['dev'] };
                }

                if (packageJson.scripts?.start) {
                    return { command: 'pnpm', args: ['start'] };
                }
            } catch (error) {
                // Fall back to server.js if package.json is invalid
            }
        }

        // Check for server.js
        if (fs.existsSync(path.join(servicePath, 'server.js'))) {
            return { command: 'node', args: ['server.js'] };
        }

        throw new Error('No start command found');
    }

    // 🏥 Health check service
    async pingService(name, port) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const timeout = 5000; // 5 seconds

            const checkHealth = () => {
                exec(`curl -s http://localhost:${port}/health`, (error, stdout, stderr) => {
                    if (!error && stdout) {
                        try {
                            const response = JSON.parse(stdout);
                            if (response.status === 'healthy') {
                                this.services.get(name).lastPing = Date.now();
                                resolve(true);
                                return;
                            }
                        } catch (e) {
                            // Not JSON, but server responded
                            resolve(true);
                            return;
                        }
                    }

                    // Retry if not timed out
                    if (Date.now() - startTime < timeout) {
                        setTimeout(checkHealth, 500);
                    } else {
                        resolve(false);
                    }
                });
            };

            checkHealth();
        });
    }

    // 📊 Real-time dashboard
    startDashboard() {
        console.log('\\n🎨 Starting Real-Time Dashboard...');

        const dashboardTimer = setInterval(() => {
            this.updateDashboard();
        }, this.dashboard.updateInterval);

        // Handle cleanup
        process.on('SIGINT', () => {
            clearInterval(dashboardTimer);
            console.log('\\n\\n🛑 Shutting down orchestrator...');
            this.stopAllServices().then(() => {
                process.exit(0);
            });
        });

        // Show initial dashboard
        this.updateDashboard();
    }

    // 📈 Update dashboard display
    updateDashboard() {
        // Move cursor up and clear
        process.stdout.write('\\u001b[2J\\u001b[0;0H');

        this.printHeader();
        this.printServicesTable();
        this.printStatistics();
        this.printFooter();
    }

    // 📋 Services status table
    printServicesTable() {
        console.log('\\n📋 Services Status:');
        console.log('┌────────────┬──────┬──────────────┬──────────────┬─────────────┬─────────────┐');
        console.log('│ Service    │ Port │ Type         │ Category     │ Status      │ Uptime      │');
        console.log('├────────────┼──────┼──────────────┼──────────────┼─────────────┼─────────────┤');

        SERVICES_CONFIG.forEach(config => {
            const service = this.services.get(config.name) || { status: 'stopped' };
            const statusIcon = this.getStatusIcon(service.status);
            const uptime = service.startTime ? this.formatDuration(Date.now() - service.startTime) : '-';

            console.log(`│ ${config.name.padEnd(10)} │ ${config.port.toString().padStart(4)} │ ${config.type.padEnd(12)} │ ${config.category.padEnd(12)} │ ${(statusIcon + ' ' + service.status).padEnd(11)} │ ${uptime.padEnd(11)} │`);
        });

        console.log('└────────────┴──────┴──────────────┴──────────────┴─────────────┴─────────────┘');
    }

    // 📊 Statistics panel
    printStatistics() {
        const stats = this.calculateStats();

        console.log('\\n📊 Ecosystem Statistics:');
        console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
        console.log(`│ 🚀 Running Services: ${stats.running.toString().padStart(2)}/${this.totalServices} (${stats.coverage}%)                                    │`);
        console.log(`│ ⚡ Healthy Services: ${stats.healthy.toString().padStart(2)}/${this.totalServices} (${stats.healthRate}%)                                    │`);
        console.log(`│ 🏗️  Infrastructure: ${stats.byCategory.infrastructure || 0} | 🤖 AI Services: ${stats.byCategory.business || 0} | 👥 User Services: ${stats.byCategory.user || 0}     │`);
        console.log(`│ 🎯 Priority 1: ${stats.byPriority[1] || 0} | Priority 2: ${stats.byPriority[2] || 0} | Priority 3: ${stats.byPriority[3] || 0} | Priority 4: ${stats.byPriority[4] || 0}             │`);
        console.log(`│ ⏱️  Total Uptime: ${this.getUptime()}                                                │`);
        console.log('└──────────────────────────────────────────────────────────────────────────────┘');
    }

    // 🦶 Footer with controls
    printFooter() {
        console.log('\\n🎮 Controls:');
        console.log('  Ctrl+C: Shutdown all services | r: Restart all | s: Status | h: Health check');
        console.log('  Dashboard updates every 2 seconds | Last update:', new Date().toLocaleTimeString());
    }

    // 📈 Calculate statistics
    calculateStats() {
        const stats = {
            running: 0,
            healthy: 0,
            coverage: 0,
            healthRate: 0,
            byCategory: {},
            byPriority: {}
        };

        this.services.forEach((service, name) => {
            const config = SERVICES_CONFIG.find(c => c.name === name);

            if (service.status === 'running') {
                stats.running++;
                stats.byCategory[config.category] = (stats.byCategory[config.category] || 0) + 1;
                stats.byPriority[config.priority] = (stats.byPriority[config.priority] || 0) + 1;
            }

            if (service.lastPing && Date.now() - service.lastPing < 10000) {
                stats.healthy++;
            }
        });

        stats.coverage = Math.round((stats.running / this.totalServices) * 100);
        stats.healthRate = Math.round((stats.healthy / this.totalServices) * 100);

        return stats;
    }

    // 🎨 Status icon helper
    getStatusIcon(status) {
        const icons = {
            running: '🟢',
            starting: '🟡',
            failed: '🔴',
            stopped: '⚪',
            error: '❌'
        };
        return icons[status] || '❓';
    }

    // ⏱️ Utility functions
    getUptime() {
        return this.formatDuration(Date.now() - this.startTime);
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    groupByPriority() {
        const groups = new Map();
        SERVICES_CONFIG.forEach(service => {
            if (!groups.has(service.priority)) {
                groups.set(service.priority, []);
            }
            groups.get(service.priority).push(service);
        });
        return new Map([...groups.entries()].sort());
    }

    handleServiceLog(name, data, level) {
        const service = this.services.get(name);
        if (service) {
            service.logs.push({ timestamp: Date.now(), level, data: data.trim() });
            // Keep only last 50 logs per service
            if (service.logs.length > 50) {
                service.logs.shift();
            }
        }
    }

    handleServiceExit(name, code) {
        const service = this.services.get(name);
        if (service) {
            service.status = code === 0 ? 'stopped' : 'failed';
            if (service.status === 'stopped') {
                this.runningCount = Math.max(0, this.runningCount - 1);
            }
        }
    }

    handleServiceError(name, error) {
        const service = this.services.get(name);
        if (service) {
            service.status = 'error';
            service.error = error.message;
        }
    }

    async stopAllServices() {
        console.log('🛑 Stopping all services...');

        this.services.forEach((service, name) => {
            if (service.process && !service.process.killed) {
                service.process.kill('SIGTERM');
                console.log(`  🛑 Stopped ${name}`);
            }
        });

        this.services.clear();
        this.runningCount = 0;
    }

    async restartAllServices() {
        await this.stopAllServices();
        await this.sleep(2000);
        await this.startAllServices();
    }

    async showStatus() {
        console.clear();
        this.printHeader();
        this.printServicesTable();
        this.printStatistics();
    }

    async healthCheck() {
        console.log('🏥 Running health check on all services...');

        const healthPromises = Array.from(this.services.entries()).map(async ([name, service]) => {
            const config = SERVICES_CONFIG.find(c => c.name === name);
            const isHealthy = await this.pingService(name, config.port);
            return { name, isHealthy, port: config.port };
        });

        const results = await Promise.allSettled(healthPromises);

        console.log('\\n🏥 Health Check Results:');
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                const { name, isHealthy, port } = result.value;
                const icon = isHealthy ? '✅' : '❌';
                console.log(`  ${icon} ${name.padEnd(12)} | Port ${port.toString().padStart(4)} | ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
            }
        });
    }

    showHelp() {
        console.log(`
🎼 CODAI ECOSYSTEM ORCHESTRATOR

Commands:
  start/dev    Start all services with real-time dashboard
  stop         Stop all running services
  restart      Stop and restart all services
  status       Show current status of all services
  health       Run health check on all services
  help         Show this help message

Examples:
  node orchestrator.cjs start     # Start ecosystem with dashboard
  node orchestrator.cjs status    # Quick status check
  node orchestrator.cjs health    # Health check all services

The orchestrator manages all ${this.totalServices} services in one unified interface.
No more multiple terminal windows!
`);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 🚀 Main execution
async function main() {
    const [, , command] = process.argv;
    const orchestrator = new CodaiEcosystemOrchestrator();

    try {
        await orchestrator.orchestrate(command);
    } catch (error) {
        console.error('❌ Orchestrator failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { CodaiEcosystemOrchestrator };
