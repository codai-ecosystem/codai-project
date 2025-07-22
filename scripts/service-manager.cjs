#!/usr/bin/env node
/**
 * CODAI Ecosystem Service Manager
 * Production-ready service orchestration
 * Created: July 22, 2025
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');

class CODAIServiceManager {
    constructor() {
        this.services = new Map();
        this.healthCheckInterval = null;
        this.config = this.loadConfig();
    }

    loadConfig() {
        return {
            services: [
                {
                    name: 'CODAI Platform',
                    path: 'apps/codai',
                    port: 4001,
                    command: 'pnpm dev',
                    healthEndpoint: '/',
                    critical: true
                },
                {
                    name: 'MEMORAI Core',
                    path: 'apps/memorai',
                    port: 4002,
                    command: 'pnpm dev',
                    healthEndpoint: '/',
                    critical: true
                },
                {
                    name: 'BANCAI Financial',
                    path: 'apps/bancai',
                    port: 4003,
                    command: 'pnpm dev',
                    healthEndpoint: '/',
                    critical: true
                },
                {
                    name: 'STOCAI Trading',
                    path: 'apps/stocai',
                    port: 4065,
                    command: 'pnpm dev',
                    healthEndpoint: '/',
                    critical: true
                },
                {
                    name: 'PREZENTAI Portfolio',
                    path: 'apps/prezentai',
                    port: 4081,
                    command: 'pnpm dev',
                    healthEndpoint: '/',
                    critical: false
                }
            ],
            mcpServers: [
                {
                    name: 'AI MCP',
                    path: 'packages/ai-mcp',
                    port: null, // stdio only
                    command: 'node dist/server.js',
                    buildCommand: 'npx tsc || .\\node_modules\\.bin\\tsc.cmd',
                    critical: true
                },
                {
                    name: 'ControlAI MCP',
                    path: 'packages/controlai-mcp',
                    port: null,
                    command: 'node dist/server.js',
                    buildCommand: 'pnpm run build',
                    critical: true
                },
                {
                    name: 'BancAI MCP',
                    path: 'apps/bancai/packages/bancai-mcp',
                    port: null, // stdio only
                    command: 'node dist/server.js',
                    buildCommand: 'pnpm run build',
                    critical: true
                },
                {
                    name: 'ConversAI MCP',
                    path: 'apps/conversai/packages/conversai-mcp',
                    port: null,
                    command: 'node dist/server.js',
                    buildCommand: 'pnpm run build',
                    critical: true
                },
                {
                    name: 'StocAI MCP',
                    path: 'apps/stocai/packages/stocai-mcp',
                    port: null,
                    command: 'node dist/server.js',
                    buildCommand: 'pnpm run build',
                    critical: true
                },
                {
                    name: 'TalentAI MCP',
                    path: 'apps/talentai/packages/talentai-mcp',
                    port: null,
                    command: 'node dist/server.js',
                    buildCommand: 'pnpm run build',
                    critical: true
                }
            ]
        };
    }

    async buildAllMCPs() {
        console.log('🔨 Building all MCP servers...');
        const originalCwd = process.cwd();

        for (const mcp of this.config.mcpServers) {
            console.log(`  Building ${mcp.name}...`);

            try {
                const mcpPath = path.resolve(originalCwd, mcp.path);
                if (fs.existsSync(mcpPath)) {
                    process.chdir(mcpPath);
                    await this.execAsync(mcp.buildCommand);
                    process.chdir(originalCwd);
                    console.log(`    ✅ ${mcp.name} built successfully`);
                } else {
                    console.log(`    ⚠️ ${mcp.name} path not found: ${mcp.path}`);
                }
            } catch (error) {
                console.error(`    ❌ ${mcp.name} build failed:`, error.message);
                process.chdir(originalCwd);
            }
        }
    }

    async startService(serviceConfig) {
        const servicePath = path.resolve(process.cwd(), serviceConfig.path);
        if (!fs.existsSync(servicePath)) {
            console.log(`⚠️ Service path not found: ${serviceConfig.path}`);
            return null;
        }

        console.log(`🚀 Starting ${serviceConfig.name}...`);

        const child = spawn('pnpm', ['dev'], {
            cwd: serviceConfig.path,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, PORT: serviceConfig.port }
        });

        const serviceInfo = {
            name: serviceConfig.name,
            process: child,
            config: serviceConfig,
            status: 'starting',
            startTime: new Date()
        };

        child.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('Ready') || output.includes('started')) {
                serviceInfo.status = 'running';
                console.log(`✅ ${serviceConfig.name} is ready on port ${serviceConfig.port}`);
            }
        });

        child.stderr.on('data', (data) => {
            console.error(`${serviceConfig.name} error:`, data.toString());
        });

        child.on('exit', (code) => {
            serviceInfo.status = 'stopped';
            console.log(`⏹️ ${serviceConfig.name} exited with code ${code}`);
            this.services.delete(serviceConfig.name);
        });

        this.services.set(serviceConfig.name, serviceInfo);
        return serviceInfo;
    }

    async checkHealth(service) {
        return new Promise((resolve) => {
            if (!service.config.port) {
                resolve({ healthy: true, status: 'N/A (stdio)' });
                return;
            }

            const req = http.request({
                hostname: 'localhost',
                port: service.config.port,
                path: service.config.healthEndpoint || '/',
                method: 'HEAD',
                timeout: 5000
            }, (res) => {
                resolve({
                    healthy: res.statusCode >= 200 && res.statusCode < 400,
                    status: `HTTP ${res.statusCode}`
                });
            });

            req.on('error', (err) => {
                resolve({ healthy: false, status: err.message });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({ healthy: false, status: 'timeout' });
            });

            req.end();
        });
    }

    async startHealthMonitoring() {
        console.log('💚 Starting health monitoring...');

        this.healthCheckInterval = setInterval(async () => {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`\n🏥 Health Check - ${timestamp}`);

            for (const [name, service] of this.services.entries()) {
                const health = await this.checkHealth(service);
                const statusIcon = health.healthy ? '✅' : '❌';
                console.log(`  ${statusIcon} ${name}: ${health.status}`);
            }
        }, 30000); // Check every 30 seconds
    }

    async startAllServices() {
        console.log('🚀 CODAI Ecosystem Service Manager');
        console.log('='.repeat(50));

        // First, build all MCP servers
        await this.buildAllMCPs();

        console.log('\n📦 Starting core services...');

        // Start core services with staggered startup
        for (const serviceConfig of this.config.services) {
            await this.startService(serviceConfig);
            await this.sleep(5000); // Wait 5 seconds between service starts
        }

        // Start health monitoring
        await this.startHealthMonitoring();

        console.log('\n✅ All services started! Press Ctrl+C to stop.');
    }

    async stopAllServices() {
        console.log('\n⏹️ Stopping all services...');

        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        for (const [name, service] of this.services.entries()) {
            console.log(`  Stopping ${name}...`);
            service.process.kill('SIGTERM');
        }

        // Wait for graceful shutdown
        await this.sleep(3000);

        console.log('✅ All services stopped.');
        process.exit(0);
    }

    execAsync(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async showStatus() {
        console.log('\n📊 CODAI Ecosystem Status');
        console.log('='.repeat(40));

        if (this.services.size === 0) {
            console.log('No services running.');
            return;
        }

        for (const [name, service] of this.services.entries()) {
            const health = await this.checkHealth(service);
            const statusIcon = health.healthy ? '✅' : '❌';
            const uptime = Math.round((new Date() - service.startTime) / 1000);

            console.log(`${statusIcon} ${name}`);
            console.log(`   Status: ${service.status}`);
            console.log(`   Port: ${service.config.port || 'stdio'}`);
            console.log(`   Uptime: ${uptime}s`);
            console.log(`   Health: ${health.status}`);
            console.log('');
        }
    }
}

// CLI Interface
async function main() {
    const manager = new CODAIServiceManager();
    const command = process.argv[2];

    process.on('SIGINT', () => {
        manager.stopAllServices();
    });

    process.on('SIGTERM', () => {
        manager.stopAllServices();
    });

    switch (command) {
        case 'start':
            await manager.startAllServices();
            break;
        case 'status':
            await manager.showStatus();
            break;
        case 'build':
            await manager.buildAllMCPs();
            break;
        case 'health':
            const healthResults = {};
            for (const serviceConfig of manager.config.services) {
                const mockService = { config: serviceConfig };
                healthResults[serviceConfig.name] = await manager.checkHealth(mockService);
            }
            console.log('🏥 Health Check Results:');
            console.log(JSON.stringify(healthResults, null, 2));
            break;
        default:
            console.log('CODAI Service Manager');
            console.log('Usage: node service-manager.cjs [command]');
            console.log('');
            console.log('Commands:');
            console.log('  start   - Start all services');
            console.log('  status  - Show service status');
            console.log('  build   - Build all MCP servers');
            console.log('  health  - Check service health');
            console.log('');
            console.log('Examples:');
            console.log('  node service-manager.cjs start');
            console.log('  node service-manager.cjs health');
            break;
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = CODAIServiceManager;
