#!/usr/bin/env node

/**
 * Batch Service Starter
 * Starts multiple Express services simultaneously
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = [
    { name: 'ajutai', port: 4013, path: 'services/ajutai' },
    { name: 'legalizai', port: 4022, path: 'services/legalizai' },
    { name: 'marketai', port: 4023, path: 'services/marketai' },
    { name: 'metu', port: 4024, path: 'services/metu' },
    { name: 'mod', port: 4025, path: 'services/mod' },
    { name: 'stocai', port: 4026, path: 'services/stocai' },
    { name: 'tools', port: 4028, path: 'services/tools' },
    { name: 'kodex', port: 4021, path: 'services/kodex' },
    { name: 'templates', port: 4030, path: 'services/templates' }
];

class BatchServiceStarter {
    constructor() {
        this.projectRoot = path.dirname(__dirname);
        this.startedServices = [];
        this.failedServices = [];
    }

    async setupService(service) {
        const servicePath = path.join(this.projectRoot, service.path);

        console.log(`🔧 Setting up ${service.name}...`);

        try {
            // Copy package-express.json to package.json
            const copyProcess = spawn('copy', ['package-express.json', 'package.json'], {
                cwd: servicePath,
                shell: true,
                stdio: 'pipe'
            });

            await new Promise((resolve, reject) => {
                copyProcess.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`Copy failed with code ${code}`));
                });
            });

            // Install dependencies
            console.log(`📦 Installing dependencies for ${service.name}...`);
            const installProcess = spawn('npm', ['install', '--no-workspaces'], {
                cwd: servicePath,
                shell: true,
                stdio: 'pipe'
            });

            await new Promise((resolve, reject) => {
                installProcess.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`Install failed with code ${code}`));
                });
            });

            return true;
        } catch (error) {
            console.error(`❌ Setup failed for ${service.name}:`, error.message);
            return false;
        }
    }

    async startService(service) {
        const servicePath = path.join(this.projectRoot, service.path);

        console.log(`🚀 Starting ${service.name} on port ${service.port}...`);

        try {
            const serverProcess = spawn('node', ['server.js'], {
                cwd: servicePath,
                shell: true,
                stdio: 'pipe'
            });

            // Give it a moment to start
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.startedServices.push({
                ...service,
                process: serverProcess
            });

            console.log(`✅ ${service.name} started successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to start ${service.name}:`, error.message);
            this.failedServices.push({ ...service, error: error.message });
            return false;
        }
    }

    async startAll() {
        console.log('🚀 Starting batch service setup and launch...\n');

        for (const service of services) {
            console.log(`\n--- Processing ${service.name} ---`);

            // Setup service
            const setupSuccess = await this.setupService(service);
            if (!setupSuccess) {
                this.failedServices.push({ ...service, error: 'Setup failed' });
                continue;
            }

            // Start service
            await this.startService(service);
        }

        // Report results
        console.log('\n📊 Batch Start Summary:');
        console.log(`✅ Services Started: ${this.startedServices.length}`);
        console.log(`❌ Services Failed: ${this.failedServices.length}`);

        if (this.startedServices.length > 0) {
            console.log('\n🎉 Started Services:');
            this.startedServices.forEach(service => {
                console.log(`  - ${service.name}: http://localhost:${service.port}`);
            });
        }

        if (this.failedServices.length > 0) {
            console.log('\n⚠️  Failed Services:');
            this.failedServices.forEach(({ name, error }) => {
                console.log(`  - ${name}: ${error}`);
            });
        }

        console.log('\n✨ Batch service start complete!');
        console.log('\n🔄 Services will continue running in background.');
        console.log('Press Ctrl+C to stop all services.');

        // Keep the script running
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping all services...');
            this.startedServices.forEach(({ name, process }) => {
                console.log(`Stopping ${name}...`);
                process.kill();
            });
            process.exit(0);
        });
    }
}

const starter = new BatchServiceStarter();
starter.startAll().catch(console.error);
