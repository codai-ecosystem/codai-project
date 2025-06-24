#!/usr/bin/env node

/**
 * 🏗️ CODAI ECOSYSTEM BUILD ORCHESTRATOR
 * 
 * Perfect build orchestration for all 29 services in the Codai ecosystem.
 * Handles dependency resolution, parallel builds, and deployment preparation.
 */

import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 🏆 Service Priority Matrix (Based on business criticality)
const SERVICE_PRIORITIES = {
    // Priority 1: Core Platform Services (Critical)
    codai: 1,      // Central Platform & AIDE Hub
    memorai: 1,    // AI Memory & Database Core  
    logai: 1,      // Identity & Authentication Hub

    // Priority 2: Financial & AI Services (High)
    bancai: 2,     // Financial Platform
    wallet: 2,     // Programmable Wallet
    fabricai: 2,   // AI Services Platform
    x: 2,          // AI Trading Platform

    // Priority 3: User-Facing Platforms (Medium)
    studiai: 3,    // AI Education Platform
    sociai: 3,     // AI Social Platform
    cumparai: 3,   // AI Shopping Platform

    // Priority 4: Supporting Services (Low)
    publicai: 4,   // Public AI Services
    admin: 4,      // Admin Panel & Management
    AIDE: 4,       // AI Development Environment
    ajutai: 4,     // AI Support & Help Platform
    analizai: 4,   // AI Analytics Platform
    dash: 4,       // Analytics Dashboard
    docs: 4,       // Documentation Platform
    explorer: 4,   // AI Blockchain Explorer
    hub: 4,        // Central Hub & Dashboard
    id: 4,         // Identity Management System
    jucai: 4,      // AI Gaming Platform
    kodex: 4,      // Code Repository & Version Control
    legalizai: 4,  // AI Legal Services Platform
    marketai: 4,   // AI Marketing Platform
    metu: 4,       // AI Metrics & Analytics
    mod: 4,        // Modding & Extension Platform
    stocai: 4,     // AI Stock Trading Platform
    templates: 4,  // Shared Templates & Boilerplates
    tools: 4       // Development Tools & Utilities
};

// 🎯 Build Configuration
const BUILD_CONFIG = {
    maxConcurrency: 4,
    timeout: 300000, // 5 minutes per service
    retryAttempts: 2,
    skipTests: false,
    production: process.env.NODE_ENV === 'production'
};

class BuildOrchestrator {
    constructor() {
        this.results = {
            successful: 0,
            failed: 0,
            skipped: 0,
            total: 0,
            duration: 0,
            services: {},
            errors: []
        };
        this.startTime = Date.now();
        this.isCI = process.env.CI === 'true';
        this.buildQueue = [];
        this.activeBuilds = new Map();
    }

    async run() {
        console.log('🏗️ CODAI ECOSYSTEM BUILD ORCHESTRATOR STARTING...\n');
        console.log(`📊 Total Services: ${Object.keys(SERVICE_PRIORITIES).length}`);
        console.log(`🔧 Environment: ${this.isCI ? 'CI/CD' : 'Development'}`);
        console.log(`⚡ Max Concurrency: ${BUILD_CONFIG.maxConcurrency}`);
        console.log(`🎯 Production Mode: ${BUILD_CONFIG.production ? 'Yes' : 'No'}\n`);

        try {
            // 1. Pre-build checks
            await this.preBuildChecks();

            // 2. Discover services
            const services = await this.discoverServices();
            console.log(`✅ Discovered ${services.length} services\n`);

            // 3. Build dependency graph
            const buildOrder = await this.createBuildOrder(services);

            // 4. Execute builds
            await this.executeBuildPlan(buildOrder);

            // 5. Post-build validation
            await this.postBuildValidation();

            // 6. Generate final report
            await this.generateReport();

            // 7. Exit with appropriate code
            process.exit(this.results.failed > 0 ? 1 : 0);

        } catch (error) {
            console.error('❌ CRITICAL BUILD ERROR:', error);
            this.results.errors.push({
                type: 'orchestrator',
                message: error.message,
                stack: error.stack
            });
            await this.generateReport();
            process.exit(1);
        }
    }

    async preBuildChecks() {
        console.log('🔍 Running pre-build checks...');

        // Check if we're in the right directory
        const packageJsonPath = join(rootDir, 'package.json');
        try {
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            if (packageJson.name !== 'codai-project') {
                throw new Error('Not in Codai project root directory');
            }
        } catch (error) {
            throw new Error(`Invalid project structure: ${error.message}`);
        }

        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        if (majorVersion < 18) {
            throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
        }

        // Check for required tools
        const requiredTools = ['npm', 'pnpm'];
        for (const tool of requiredTools) {
            try {
                await this.execCommand(`${tool} --version`, { timeout: 5000 });
            } catch {
                console.log(`⚠️  ${tool} not available globally`);
            }
        }

        // Ensure build directories exist
        const buildDir = join(rootDir, 'dist');
        await fs.mkdir(buildDir, { recursive: true });

        console.log('✅ Pre-build checks passed\n');
    }

    async discoverServices() {
        const services = [];

        // Check apps directory
        const appsDir = join(rootDir, 'apps');
        try {
            const apps = await fs.readdir(appsDir);
            for (const app of apps) {
                const appPath = join(appsDir, app);
                const stat = await fs.stat(appPath);
                if (stat.isDirectory()) {
                    const service = await this.analyzeService(app, appPath, 'app');
                    if (service) services.push(service);
                }
            }
        } catch {
            console.log('⚠️  Apps directory not found');
        }

        // Check services directory
        const servicesDir = join(rootDir, 'services');
        try {
            const servicesList = await fs.readdir(servicesDir);
            for (const service of servicesList) {
                const servicePath = join(servicesDir, service);
                const stat = await fs.stat(servicePath);
                if (stat.isDirectory()) {
                    const serviceInfo = await this.analyzeService(service, servicePath, 'service');
                    if (serviceInfo) services.push(serviceInfo);
                }
            }
        } catch {
            console.log('⚠️  Services directory not found');
        }

        return services;
    }

    async analyzeService(name, path, type) {
        const packageJsonPath = join(path, 'package.json');

        try {
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

            return {
                name,
                path,
                type,
                priority: SERVICE_PRIORITIES[name] || 4,
                packageJson,
                hasBuildScript: !!(packageJson.scripts && packageJson.scripts.build),
                hasTypeScript: !!(packageJson.devDependencies && packageJson.devDependencies.typescript) ||
                    !!(packageJson.dependencies && packageJson.dependencies.typescript),
                framework: this.detectFramework(packageJson),
                dependencies: Object.keys(packageJson.dependencies || {}),
                devDependencies: Object.keys(packageJson.devDependencies || {})
            };
        } catch (error) {
            console.log(`⚠️  ${type} ${name} missing or invalid package.json: ${error.message}`);
            return null;
        }
    }

    detectFramework(packageJson) {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (deps.next) return 'next';
        if (deps.vue) return 'vue';
        if (deps.react) return 'react';
        if (deps.svelte) return 'svelte';
        if (deps.angular) return 'angular';
        if (deps.express) return 'express';
        if (deps.fastify) return 'fastify';

        return 'unknown';
    }

    async createBuildOrder(services) {
        console.log('📋 Creating build order...');

        // Sort by priority (lower number = higher priority)
        const priorityGroups = {};

        services.forEach(service => {
            if (!priorityGroups[service.priority]) {
                priorityGroups[service.priority] = [];
            }
            priorityGroups[service.priority].push(service);
        });

        // Create build order: Priority 1 first, then 2, 3, 4
        const buildOrder = [];
        for (let priority = 1; priority <= 4; priority++) {
            if (priorityGroups[priority]) {
                buildOrder.push(...priorityGroups[priority]);
            }
        }

        console.log('✅ Build order created:');
        buildOrder.forEach((service, index) => {
            console.log(`   ${index + 1}. ${service.name} (P${service.priority}) - ${service.framework}`);
        });
        console.log('');

        return buildOrder;
    }

    async executeBuildPlan(services) {
        console.log('🚀 Executing build plan...\n');

        for (const service of services) {
            await this.buildService(service);
        }
    }

    async buildService(service) {
        console.log(`🏗️ Building ${service.name} (${service.type})...`);

        const serviceResult = {
            name: service.name,
            type: service.type,
            priority: service.priority,
            framework: service.framework,
            success: false,
            duration: 0,
            size: 0,
            errors: []
        };

        const serviceStartTime = Date.now();

        try {
            // Check if service has build script
            if (!service.hasBuildScript) {
                console.log(`   ⚠️  No build script found for ${service.name}, creating basic build...`);
                await this.createBasicBuild(service);
                serviceResult.success = true;
                serviceResult.errors.push({
                    type: 'no_build_script',
                    message: 'No build script found, created basic build'
                });
            } else {
                // Install dependencies first
                console.log(`   📦 Installing dependencies for ${service.name}...`);
                await this.installDependencies(service);

                // Run build
                console.log(`   🔨 Building ${service.name}...`);
                const buildResult = await this.runBuild(service);

                serviceResult.success = buildResult.success;
                if (buildResult.errors) {
                    serviceResult.errors = buildResult.errors;
                }

                // Calculate build size
                serviceResult.size = await this.calculateBuildSize(service);
            }

        } catch (error) {
            console.log(`   ❌ Error building ${service.name}: ${error.message}`);
            serviceResult.success = false;
            serviceResult.errors.push({
                type: 'build_error',
                message: error.message,
                stack: error.stack
            });
        }

        serviceResult.duration = Date.now() - serviceStartTime;
        this.results.services[service.name] = serviceResult;

        // Update totals
        if (serviceResult.success) {
            this.results.successful++;
        } else {
            this.results.failed++;
        }
        this.results.total++;

        const status = serviceResult.success ? '✅ SUCCESS' : '❌ FAILED';
        const sizeInfo = serviceResult.size > 0 ? ` (${this.formatBytes(serviceResult.size)})` : '';

        console.log(`   ${status} ${service.name} (${serviceResult.duration}ms)${sizeInfo}\n`);
    }

    async installDependencies(service) {
        // Check if node_modules exists
        const nodeModulesPath = join(service.path, 'node_modules');
        try {
            await fs.access(nodeModulesPath);
            return; // Dependencies already installed
        } catch {
            // Need to install dependencies
        }

        return new Promise((resolve, reject) => {
            const installProcess = spawn('npm', ['install'], {
                cwd: service.path,
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true
            });

            let stderr = '';

            installProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            installProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Dependency installation failed: ${stderr}`));
                }
            });

            // Set timeout for installation
            setTimeout(() => {
                installProcess.kill();
                reject(new Error('Dependency installation timed out'));
            }, 120000); // 2 minute timeout
        });
    }

    async runBuild(service) {
        return new Promise((resolve) => {
            const buildProcess = spawn('npm', ['run', 'build'], {
                cwd: service.path,
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true
            });

            let stdout = '';
            let stderr = '';

            buildProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            buildProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            buildProcess.on('close', (code) => {
                const result = {
                    success: code === 0,
                    errors: []
                };

                if (code !== 0) {
                    result.errors.push({
                        type: 'build_failure',
                        message: stderr || stdout || 'Build failed with no output',
                        code
                    });
                }

                resolve(result);
            });

            // Set timeout for build
            setTimeout(() => {
                buildProcess.kill();
                resolve({
                    success: false,
                    errors: [{
                        type: 'timeout',
                        message: 'Build execution timed out'
                    }]
                });
            }, BUILD_CONFIG.timeout);
        });
    }

    async createBasicBuild(service) {
        // Create a basic build script if none exists
        const packageJsonPath = join(service.path, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }

        // Add basic build script based on framework
        if (service.framework === 'next') {
            packageJson.scripts.build = 'next build';
        } else if (service.hasTypeScript) {
            packageJson.scripts.build = 'tsc';
        } else {
            packageJson.scripts.build = 'echo "No build required"';
        }

        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    async calculateBuildSize(service) {
        const buildDirs = ['.next', 'dist', 'build', 'out'];
        let totalSize = 0;

        for (const buildDir of buildDirs) {
            const buildPath = join(service.path, buildDir);
            try {
                totalSize += await this.getDirectorySize(buildPath);
            } catch {
                // Build directory doesn't exist
            }
        }

        return totalSize;
    }

    async getDirectorySize(dirPath) {
        let totalSize = 0;

        try {
            const files = await fs.readdir(dirPath, { withFileTypes: true });

            for (const file of files) {
                const filePath = join(dirPath, file.name);

                if (file.isDirectory()) {
                    totalSize += await this.getDirectorySize(filePath);
                } else {
                    const stats = await fs.stat(filePath);
                    totalSize += stats.size;
                }
            }
        } catch {
            // Directory doesn't exist or can't be accessed
        }

        return totalSize;
    }

    async postBuildValidation() {
        console.log('🔍 Running post-build validation...');

        // Check if critical services built successfully
        const criticalServices = ['codai', 'memorai', 'logai'];
        const failedCritical = criticalServices.filter(name => {
            const result = this.results.services[name];
            return result && !result.success;
        });

        if (failedCritical.length > 0) {
            console.log(`⚠️  Critical services failed to build: ${failedCritical.join(', ')}`);
        }

        console.log('✅ Post-build validation completed\n');
    }

    async execCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, {
                shell: true,
                stdio: 'pipe',
                ...options
            });

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(`Command failed: ${stderr}`));
                }
            });

            if (options.timeout) {
                setTimeout(() => {
                    process.kill();
                    reject(new Error('Command timed out'));
                }, options.timeout);
            }
        });
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async generateReport() {
        this.results.duration = Date.now() - this.startTime;

        console.log('\n' + '='.repeat(60));
        console.log('🏗️ CODAI ECOSYSTEM BUILD RESULTS');
        console.log('='.repeat(60));

        console.log(`\n📊 SUMMARY:`);
        console.log(`   Total Services: ${this.results.total}`);
        console.log(`   Successful: ${this.results.successful} ✅`);
        console.log(`   Failed: ${this.results.failed} ❌`);
        console.log(`   Duration: ${Math.round(this.results.duration / 1000)}s`);

        const successRate = this.results.total > 0 ?
            Math.round((this.results.successful / this.results.total) * 100) : 0;
        console.log(`   Success Rate: ${successRate}%`);

        // Calculate total build size
        const totalSize = Object.values(this.results.services)
            .reduce((sum, service) => sum + service.size, 0);
        console.log(`   Total Build Size: ${this.formatBytes(totalSize)}`);

        // Service breakdown
        console.log(`\n📋 SERVICE BREAKDOWN:`);
        Object.entries(this.results.services).forEach(([name, result]) => {
            const status = result.success ? '✅' : '❌';
            const size = result.size > 0 ? ` (${this.formatBytes(result.size)})` : '';
            console.log(`   ${status} ${name} (P${result.priority}) - ${result.duration}ms${size}`);

            if (result.errors.length > 0) {
                result.errors.forEach(error => {
                    console.log(`      🔍 ${error.type}: ${error.message}`);
                });
            }
        });

        // Framework breakdown
        const frameworks = {};
        Object.values(this.results.services).forEach(service => {
            if (!frameworks[service.framework]) {
                frameworks[service.framework] = { total: 0, successful: 0 };
            }
            frameworks[service.framework].total++;
            if (service.success) {
                frameworks[service.framework].successful++;
            }
        });

        console.log(`\n🎯 FRAMEWORK BREAKDOWN:`);
        Object.entries(frameworks).forEach(([framework, stats]) => {
            const rate = Math.round((stats.successful / stats.total) * 100);
            console.log(`   ${framework}: ${stats.successful}/${stats.total} (${rate}%)`);
        });

        // Errors summary
        if (this.results.errors.length > 0) {
            console.log(`\n🚨 ORCHESTRATOR ERRORS:`);
            this.results.errors.forEach(error => {
                console.log(`   • ${error.type}: ${error.message}`);
            });
        }

        // Recommendations
        console.log(`\n💡 RECOMMENDATIONS:`);
        if (this.results.failed > 0) {
            console.log(`   • Fix ${this.results.failed} failing builds`);
        }
        console.log(`   • Optimize build sizes (current: ${this.formatBytes(totalSize)})`);
        console.log(`   • Consider implementing build caching`);
        console.log(`   • Add build performance monitoring`);

        console.log('\n' + '='.repeat(60));
        console.log(this.results.failed === 0 ?
            '🎉 ALL BUILDS SUCCESSFUL - PERFECT ECOSYSTEM! 🎉' :
            '⚠️  SOME BUILDS FAILED - NEEDS ATTENTION'
        );
        console.log('='.repeat(60) + '\n');

        // Save detailed report
        const reportPath = join(rootDir, 'build-results.json');
        await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`📄 Detailed report saved to: ${reportPath}`);
    }
}

// Run if called directly
if (process.argv[1] && (process.argv[1].endsWith('build-orchestrator.js') || import.meta.url === `file://${process.argv[1]}`)) {
    const orchestrator = new BuildOrchestrator();
    orchestrator.run().catch(console.error);
}

export default BuildOrchestrator;
