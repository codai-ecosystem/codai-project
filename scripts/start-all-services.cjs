const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const serviceConfigs = [
    { name: 'admin', port: 4001 },
    { name: 'AIDE', port: 4002 },
    { name: 'ajutai', port: 4003 },
    { name: 'analizai', port: 4004 },
    { name: 'bancai', port: 4005 },
    { name: 'codai', port: 4006 },
    { name: 'cumparai', port: 4007 },
    { name: 'dash', port: 4008 },
    { name: 'docs', port: 4009 },
    { name: 'explorer', port: 4010 },
    { name: 'fabricai', port: 4011 },
    { name: 'hub', port: 4012 },
    { name: 'id', port: 4013 },
    { name: 'jucai', port: 4014 },
    { name: 'kodex', port: 4015 },
    { name: 'legalizai', port: 4016 },
    { name: 'logai', port: 4017 },
    { name: 'marketai', port: 4018 },
    { name: 'memorai', port: 4019 },
    { name: 'metu', port: 4020 },
    { name: 'mod', port: 4021 },
    { name: 'publicai', port: 4022 },
    { name: 'sociai', port: 4023 },
    { name: 'stocai', port: 4024 },
    { name: 'studiai', port: 4025 },
    { name: 'templates', port: 4026 },
    { name: 'tools', port: 4027 },
    { name: 'wallet', port: 4028 },
    { name: 'x', port: 4029 }
];

class ServiceOrchestrator {
    constructor() {
        this.runningServices = new Map();
        this.installQueue = [...serviceConfigs];
        this.startQueue = [];
    }

    async installDependencies() {
        console.log('📦 Installing dependencies for all services...\n');

        const promises = this.installQueue.map(config => this.installServiceDeps(config));
        await Promise.allSettled(promises);

        console.log('\\n✅ Dependency installation complete!');
    }

    installServiceDeps(config) {
        return new Promise((resolve, reject) => {
            const servicePath = path.join(__dirname, '..', 'services', config.name);

            if (!fs.existsSync(path.join(servicePath, 'package.json'))) {
                console.log(`⚠️  ${config.name}: package.json not found`);
                resolve();
                return;
            }

            console.log(`📦 Installing ${config.name} dependencies...`);

            const npm = spawn('npm', ['install'], {
                cwd: servicePath,
                stdio: 'pipe'
            });

            npm.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ ${config.name}: dependencies installed`);
                    this.startQueue.push(config);
                } else {
                    console.log(`❌ ${config.name}: installation failed (code ${code})`);
                }
                resolve();
            });

            npm.on('error', (err) => {
                console.log(`❌ ${config.name}: ${err.message}`);
                resolve();
            });
        });
    }

    async startService(config) {
        return new Promise((resolve) => {
            const servicePath = path.join(__dirname, '..', 'services', config.name);

            console.log(`🚀 Starting ${config.name} on port ${config.port}...`);

            const service = spawn('node', ['index.js'], {
                cwd: servicePath,
                stdio: 'pipe',
                env: { ...process.env, PORT: config.port }
            });

            let started = false;

            service.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('running on port') && !started) {
                    console.log(`✅ ${config.name} started successfully on port ${config.port}`);
                    this.runningServices.set(config.name, { process: service, port: config.port });
                    started = true;
                    resolve(true);
                }
            });

            service.stderr.on('data', (data) => {
                const error = data.toString();
                if (error.includes('EADDRINUSE')) {
                    console.log(`⚠️  ${config.name}: Port ${config.port} already in use`);
                    resolve(false);
                } else if (!started) {
                    console.log(`❌ ${config.name}: ${error.trim()}`);
                }
            });

            service.on('close', (code) => {
                if (!started) {
                    console.log(`❌ ${config.name}: exited with code ${code}`);
                    resolve(false);
                }
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (!started) {
                    console.log(`⏰ ${config.name}: startup timeout`);
                    service.kill();
                    resolve(false);
                }
            }, 10000);
        });
    }

    async startAllServices() {
        console.log('\\n🚀 Starting all services...\n');

        const results = [];

        // Start services in batches to avoid overwhelming the system
        const batchSize = 5;
        for (let i = 0; i < this.startQueue.length; i += batchSize) {
            const batch = this.startQueue.slice(i, i + batchSize);
            console.log(`Starting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(this.startQueue.length / batchSize)}...`);

            const batchPromises = batch.map(config => this.startService(config));
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Wait a bit between batches
            if (i + batchSize < this.startQueue.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return results;
    }

    async checkServiceHealth() {
        console.log('\\n🏥 Checking service health...\n');

        const healthChecks = [];

        for (const [name, service] of this.runningServices) {
            healthChecks.push(this.checkHealth(name, service.port));
        }

        const results = await Promise.allSettled(healthChecks);

        let healthy = 0;
        let unhealthy = 0;

        results.forEach((result, index) => {
            const serviceName = Array.from(this.runningServices.keys())[index];
            if (result.status === 'fulfilled' && result.value) {
                console.log(`✅ ${serviceName}: healthy`);
                healthy++;
            } else {
                console.log(`❌ ${serviceName}: unhealthy`);
                unhealthy++;
            }
        });

        console.log(`\\n📊 Health Summary: ${healthy} healthy, ${unhealthy} unhealthy`);
        return { healthy, unhealthy };
    }

    async checkHealth(serviceName, port) {
        try {
            const response = await fetch(`http://localhost:${port}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    displayStatus() {
        console.log('\\n📊 CODAI ECOSYSTEM STATUS');
        console.log('─'.repeat(50));
        console.log(`Total Services: ${serviceConfigs.length}`);
        console.log(`Running Services: ${this.runningServices.size}`);
        console.log(`Success Rate: ${((this.runningServices.size / serviceConfigs.length) * 100).toFixed(1)}%`);

        if (this.runningServices.size > 0) {
            console.log('\\n🟢 Running Services:');
            for (const [name, service] of this.runningServices) {
                console.log(`   - ${name} (port ${service.port})`);
            }
        }

        console.log('\\n🔗 Quick Health Check:');
        for (const [name, service] of this.runningServices) {
            console.log(`   curl http://localhost:${service.port}/health`);
        }
    }

    shutdown() {
        console.log('\\n🛑 Shutting down all services...');

        for (const [name, service] of this.runningServices) {
            console.log(`Stopping ${name}...`);
            service.process.kill();
        }

        console.log('✅ All services stopped');
        process.exit(0);
    }
}

async function main() {
    const orchestrator = new ServiceOrchestrator();

    // Handle graceful shutdown
    process.on('SIGINT', () => orchestrator.shutdown());
    process.on('SIGTERM', () => orchestrator.shutdown());

    try {
        // Install dependencies
        await orchestrator.installDependencies();

        // Start services
        const results = await orchestrator.startAllServices();

        // Display status
        orchestrator.displayStatus();

        // Check health
        setTimeout(() => {
            orchestrator.checkServiceHealth();
        }, 5000);

        // Keep the process alive
        console.log('\\n⏰ Services running... Press Ctrl+C to stop all services');

    } catch (error) {
        console.error('❌ Orchestration failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = ServiceOrchestrator;
