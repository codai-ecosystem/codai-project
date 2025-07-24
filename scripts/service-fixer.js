#!/usr/bin/env node

/**
 * CODAI Service Fixer
 * Automatically diagnoses and fixes common service issues
 */

import { execSync } from 'child_process';
import http from 'http';

class ServiceFixer {
    constructor() {
        this.services = [
            { name: 'Gateway', port: 4000, path: '/health', task: 'Start Gateway Service' },
            { name: 'CODAI', port: 4001, path: '/api/health', task: 'Start CODAI Service' },
            { name: 'Admin', port: 4002, path: '/api/health', task: 'Start Admin Service' },
            { name: 'Hub', port: 4003, path: '/api/health', task: 'Start Hub Service' },
            { name: 'ID', port: 4004, path: '/api/health', task: 'Start ID Service' },
            { name: 'BancAI', port: 4005, path: '/api/health', task: 'Start BancAI Service' }
        ];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async checkServiceHealth(service) {
        return new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: service.port,
                path: service.path,
                method: 'GET',
                timeout: 3000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        success: res.statusCode === 200,
                        status: res.statusCode,
                        data: data
                    });
                });
            });

            req.on('error', (error) => {
                resolve({
                    success: false,
                    status: 0,
                    error: error.message
                });
            });

            req.end();
        });
    }

    async killPortProcess(port) {
        try {
            this.log(`Killing any process on port ${port}`, 'warning');
            // Use PowerShell to find and kill the process
            const cmd = `powershell -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`;
            execSync(cmd, { stdio: 'ignore' });
            await this.sleep(2000);
            return true;
        } catch (error) {
            this.log(`Failed to kill process on port ${port}: ${error.message}`, 'warning');
            return false;
        }
    }

    async restartService(service) {
        this.log(`Restarting ${service.name} service...`, 'warning');

        try {
            // Kill any process on the port
            await this.killPortProcess(service.port);

            // Start the service using pnpm
            const serviceName = service.name.toLowerCase();
            const cmd = `pnpm --filter=${serviceName} dev`;

            this.log(`Executing: ${cmd}`, 'info');

            // Start the service in background
            const child = execSync(`start /B ${cmd}`, {
                stdio: 'ignore',
                shell: true,
                detached: true
            });

            // Wait for service to start
            await this.sleep(5000);

            // Verify it's running
            const health = await this.checkServiceHealth(service);
            if (health.success) {
                this.log(`${service.name} service restarted successfully`, 'success');
                return true;
            } else {
                this.log(`${service.name} service restart failed - health check returned ${health.status}`, 'error');
                return false;
            }

        } catch (error) {
            this.log(`Failed to restart ${service.name}: ${error.message}`, 'error');
            return false;
        }
    }

    async fixCODAIHealthPath() {
        // CODAI service might be using a different health path
        const paths = ['/api/health', '/health', '/api/v1/health', '/status'];

        for (const path of paths) {
            const health = await this.checkServiceHealth({ port: 4001, path });
            if (health.success) {
                this.log(`CODAI health endpoint found at: ${path}`, 'success');
                return path;
            }
        }

        this.log('Could not find working CODAI health endpoint', 'error');
        return null;
    }

    async fixServiceErrors() {
        // Check for common service error patterns and fix them

        // Fix 1: Database connection issues
        try {
            this.log('Checking database connections...', 'info');
            execSync('pnpm run db:status', { stdio: 'pipe' });
        } catch (error) {
            this.log('Database issues detected, attempting to fix...', 'warning');
            try {
                execSync('pnpm run db:migrate', { stdio: 'pipe' });
                this.log('Database migration completed', 'success');
            } catch (dbError) {
                this.log('Database fix failed', 'error');
            }
        }

        // Fix 2: Environment variables
        this.log('Checking environment configuration...', 'info');
        // Add environment checks here if needed

        // Fix 3: Port conflicts
        this.log('Checking for port conflicts...', 'info');
        // This is handled by individual service restarts
    }

    async diagnoseAndFix() {
        this.log('🔧 Starting CODAI Service Diagnostic and Fix', 'info');

        // Step 1: Initial health check
        this.log('\n📋 Step 1: Initial Health Assessment', 'info');
        const results = [];

        for (const service of this.services) {
            const health = await this.checkServiceHealth(service);
            results.push({ service, health });

            if (health.success) {
                this.log(`${service.name} (${service.port}): ✅ Healthy`, 'success');
            } else if (health.status > 0) {
                this.log(`${service.name} (${service.port}): ⚠️ Status ${health.status}`, 'warning');
            } else {
                this.log(`${service.name} (${service.port}): ❌ Down`, 'error');
            }
        }

        // Step 2: Fix common issues
        this.log('\n🔧 Step 2: Fixing Common Issues', 'info');
        await this.fixServiceErrors();

        // Step 3: Restart failed services
        this.log('\n🔄 Step 3: Restarting Failed Services', 'info');
        const failedServices = results.filter(r => !r.health.success);

        for (const { service } of failedServices) {
            if (service.name === 'CODAI') {
                // Special handling for CODAI health path issue
                const workingPath = await this.fixCODAIHealthPath();
                if (!workingPath) {
                    await this.restartService(service);
                }
            } else {
                await this.restartService(service);
            }
        }

        // Step 4: Final health check
        this.log('\n✅ Step 4: Final Health Assessment', 'info');
        const finalResults = [];

        for (const service of this.services) {
            const health = await this.checkServiceHealth(service);
            finalResults.push({ service, health });

            if (health.success) {
                this.log(`${service.name} (${service.port}): ✅ Healthy`, 'success');
            } else {
                this.log(`${service.name} (${service.port}): ❌ Still failing`, 'error');
            }
        }

        // Summary
        const healthy = finalResults.filter(r => r.health.success).length;
        const total = finalResults.length;

        this.log(`\n📊 Final Results: ${healthy}/${total} services healthy`, 'info');

        if (healthy === total) {
            this.log('🎉 All services are now operational!', 'success');
            return true;
        } else {
            this.log('⚠️ Some services still need manual attention', 'warning');

            // Show which services still need work
            const stillFailed = finalResults.filter(r => !r.health.success);
            this.log('\n🔍 Services requiring manual attention:', 'info');
            stillFailed.forEach(({ service, health }) => {
                this.log(`   ${service.name} (${service.port}): ${health.error || `Status ${health.status}`}`, 'warning');
            });

            return false;
        }
    }
}

// Run the fixer
const fixer = new ServiceFixer();
fixer.diagnoseAndFix()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Service fixer crashed:', error);
        process.exit(1);
    });
