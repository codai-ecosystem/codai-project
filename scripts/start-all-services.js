#!/usr/bin/env node

/**
 * 🚀 CODAI ECOSYSTEM SERVICES ORCHESTRATOR v2.0
 * 
 * Comprehensive startup system for all 29 microservices
 * Enhanced for 110% perfection with enterprise-grade monitoring
 * 
 * Generated: July 4, 2025 - Phase 2 Implementation
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors for beautiful output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

const CONFIG = {
    projectsIndexPath: path.join(__dirname, '..', 'projects.index.json'),
    servicesPath: path.join(__dirname, '..', 'services'),
    startupDelay: 2000, // 2 seconds between service starts (faster startup)
    maxRetries: 3,
    healthCheckDelay: 8000 // 8 seconds after startup to check health
};

class EcosystemStarter {
    constructor() {
        this.projectsIndex = this.loadProjectsIndex();
        this.runningServices = new Map();
        this.startedServices = [];
        this.failedServices = [];
    }

    loadProjectsIndex() {
        try {
            const content = fs.readFileSync(CONFIG.projectsIndexPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error('❌ Failed to load projects.index.json:', error.message);
            process.exit(1);
        }
    }

    async startService(service) {
        const servicePath = path.join(__dirname, '..', service.path);

        console.log(`🚀 Starting ${service.name} on port ${service.port}...`);

        return new Promise((resolve) => {
            const child = spawn('npm', ['start'], {
                cwd: servicePath,
                detached: false,
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true
            });

            let stdoutData = '';
            let stderrData = '';

            child.stdout.on('data', (data) => {
                stdoutData += data.toString();
                const lines = data.toString().split('\n');
                lines.forEach(line => {
                    if (line.trim()) {
                        console.log(`   [${service.name}] ${line.trim()}`);
                    }
                });
            });

            child.stderr.on('data', (data) => {
                stderrData += data.toString();
                const lines = data.toString().split('\n');
                lines.forEach(line => {
                    if (line.trim()) {
                        console.error(`   [${service.name}] ERROR: ${line.trim()}`);
                    }
                });
            });

            // Consider the service started if it doesn't exit immediately
            const startupTimer = setTimeout(() => {
                if (!child.killed) {
                    console.log(`   ✅ ${service.name} startup initiated`);
                    this.runningServices.set(service.name, {
                        process: child,
                        service: service,
                        startTime: Date.now()
                    });
                    this.startedServices.push(service);
                    resolve({ success: true, service });
                }
            }, 3000); // Wait 3 seconds to see if service starts successfully

            child.on('exit', (code, signal) => {
                clearTimeout(startupTimer);
                if (code !== 0) {
                    console.error(`   ❌ ${service.name} failed to start (code: ${code})`);
                    this.failedServices.push({ service, code, stdout: stdoutData, stderr: stderrData });
                    resolve({ success: false, service, code });
                }
            });

            child.on('error', (error) => {
                clearTimeout(startupTimer);
                console.error(`   ❌ ${service.name} startup error:`, error.message);
                this.failedServices.push({ service, error: error.message });
                resolve({ success: false, service, error: error.message });
            });
        });
    }

    async healthCheck() {
        console.log('\n🏥 Performing health checks...\n');

        const healthResults = [];

        for (const [serviceName, serviceInfo] of this.runningServices) {
            const { service } = serviceInfo;

            try {
                const response = await this.testServiceHealth(service.port);
                if (response.success) {
                    console.log(`   ✅ ${serviceName} is healthy (${response.responseTime}ms)`);
                    healthResults.push({ service: serviceName, healthy: true, responseTime: response.responseTime });
                } else {
                    console.log(`   ⚠️  ${serviceName} not responding: ${response.error}`);
                    healthResults.push({ service: serviceName, healthy: false, error: response.error });
                }
            } catch (error) {
                console.log(`   ❌ ${serviceName} health check failed: ${error.message}`);
                healthResults.push({ service: serviceName, healthy: false, error: error.message });
            }
        }

        return healthResults;
    }

    testServiceHealth(port) {
        return new Promise((resolve) => {
            const startTime = Date.now();

            const req = http.get(`http://localhost:${port}`, (res) => {
                const responseTime = Date.now() - startTime;
                resolve({
                    success: true,
                    statusCode: res.statusCode,
                    responseTime: responseTime
                });
            });

            req.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message
                });
            });

            req.setTimeout(5000, () => {
                req.abort();
                resolve({
                    success: false,
                    error: 'Health check timeout'
                });
            });
        });
    }

    generateReport(healthResults) {
        console.log('\n📊 STARTUP SUMMARY REPORT');
        console.log('==========================\n');

        const totalServices = this.projectsIndex.services.length;
        const startedCount = this.startedServices.length;
        const failedCount = this.failedServices.length;
        const healthyCount = healthResults.filter(r => r.healthy).length;

        console.log(`📈 SERVICE STARTUP STATS:`);
        console.log(`   Total Services: ${totalServices}`);
        console.log(`   Started Successfully: ${startedCount}`);
        console.log(`   Failed to Start: ${failedCount}`);
        console.log(`   Health Check Passed: ${healthyCount}`);
        console.log(`   🎯 Operational Coverage: ${Math.round((healthyCount / totalServices) * 100)}%\n`);

        if (this.failedServices.length > 0) {
            console.log('❌ FAILED SERVICES:');
            this.failedServices.forEach(failed => {
                console.log(`   - ${failed.service.name}: ${failed.error || 'Exit code ' + failed.code}`);
            });
            console.log('');
        }

        const healthyServices = healthResults.filter(r => r.healthy);
        if (healthyServices.length > 0) {
            console.log('✅ OPERATIONAL SERVICES:');
            healthyServices.forEach(healthy => {
                console.log(`   - ${healthy.service} (${healthy.responseTime}ms)`);
            });
            console.log('');
        }

        const unhealthyServices = healthResults.filter(r => !r.healthy);
        if (unhealthyServices.length > 0) {
            console.log('⚠️  SERVICES NEEDING ATTENTION:');
            unhealthyServices.forEach(unhealthy => {
                console.log(`   - ${unhealthy.service}: ${unhealthy.error}`);
            });
            console.log('');
        }

        // Generate browser test URLs
        console.log('🌐 BROWSER VALIDATION URLS:');
        healthyServices.forEach(healthy => {
            const service = this.runningServices.get(healthy.service)?.service;
            if (service) {
                console.log(`   - http://localhost:${service.port} (${service.domain})`);
            }
        });
        console.log('');

        console.log('🚀 NEXT STEPS:');
        if (failedCount > 0) {
            console.log(`   1. Fix ${failedCount} failed services`);
            console.log(`   2. Restart failed services`);
        }
        if (unhealthyServices.length > 0) {
            console.log(`   3. Investigate ${unhealthyServices.length} unresponsive services`);
        }
        console.log(`   4. Browser test all ${healthyServices.length} operational services`);
        console.log(`   5. Performance test and load validation`);
        console.log('');
    }

    async run() {
        console.log('🚀 CODAI ECOSYSTEM BATCH STARTUP');
        console.log('=================================\n');
        console.log(`Starting ${this.projectsIndex.services.length} services...\n`);

        // Start services with delays
        for (const service of this.projectsIndex.services) {
            await this.startService(service);

            // Add delay between service starts to prevent port conflicts
            if (this.projectsIndex.services.indexOf(service) < this.projectsIndex.services.length - 1) {
                console.log(`   ⏱️  Waiting ${CONFIG.startupDelay}ms before next service...\n`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.startupDelay));
            }
        }

        // Wait for services to stabilize
        console.log(`\n⏱️  Waiting ${CONFIG.healthCheckDelay}ms for services to stabilize...\n`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.healthCheckDelay));

        // Run health checks
        const healthResults = await this.healthCheck();

        // Generate final report
        this.generateReport(healthResults);

        // Keep services running
        console.log('🔄 Services are running. Press Ctrl+C to stop all services.\n');

        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down all services...');
            for (const [serviceName, serviceInfo] of this.runningServices) {
                console.log(`   Stopping ${serviceName}...`);
                serviceInfo.process.kill('SIGTERM');
            }
            process.exit(0);
        });
    }
}

// Start the ecosystem
const starter = new EcosystemStarter();
starter.run().catch(console.error);
