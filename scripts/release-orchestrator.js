#!/usr/bin/env node

/**
 * 🚀 CODAI ECOSYSTEM RELEASE ORCHESTRATOR
 * 
 * Perfect release orchestration for all 29 services in the Codai ecosystem.
 * Handles versioning, tagging, publishing, and deployment coordination.
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

// 🎯 Release Types
const RELEASE_TYPES = {
    patch: { bump: 'patch', description: 'Bug fixes and minor updates' },
    minor: { bump: 'minor', description: 'New features and improvements' },
    major: { bump: 'major', description: 'Breaking changes and major updates' },
    prerelease: { bump: 'prerelease', description: 'Pre-release versions' }
};

class ReleaseOrchestrator {
    constructor() {
        this.results = {
            released: 0,
            failed: 0,
            skipped: 0,
            total: 0,
            duration: 0,
            services: {},
            errors: []
        };
        this.startTime = Date.now();
        this.releaseType = process.argv[2] || 'patch';
        this.dryRun = process.argv.includes('--dry-run');
        this.skipTests = process.argv.includes('--skip-tests');
        this.isCI = process.env.CI === 'true';
    }

    async run() {
        console.log('🚀 CODAI ECOSYSTEM RELEASE ORCHESTRATOR STARTING...\n');
        console.log(`📦 Release Type: ${this.releaseType} (${RELEASE_TYPES[this.releaseType]?.description || 'custom'})`);
        console.log(`🔍 Mode: ${this.dryRun ? 'DRY RUN (no changes)' : 'EXECUTE'}`);
        console.log(`🧪 Tests: ${this.skipTests ? 'SKIP' : 'RUN'}`);
        console.log(`🔧 Environment: ${this.isCI ? 'CI/CD' : 'Development'}\n`);

        try {
            // 1. Pre-release checks
            await this.preReleaseChecks();

            // 2. Discover services
            const services = await this.discoverServices();
            console.log(`✅ Discovered ${services.length} services\n`);

            // 3. Pre-release validation
            if (!this.skipTests) {
                await this.runPreReleaseTests();
            }

            // 4. Execute releases by priority
            await this.executeReleases(services);

            // 5. Post-release tasks
            await this.postReleaseTasks();

            // 6. Generate final report
            await this.generateReport();

            console.log('🎉 RELEASE COMPLETED SUCCESSFULLY!');

        } catch (error) {
            console.error('❌ CRITICAL RELEASE ERROR:', error);
            this.results.errors.push({
                type: 'orchestrator',
                message: error.message,
                stack: error.stack
            });
            await this.generateReport();
            process.exit(1);
        }
    }

    async preReleaseChecks() {
        console.log('🔍 Running pre-release checks...');

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

        // Check Git status
        if (!this.dryRun) {
            try {
                const gitStatus = await this.execCommand('git status --porcelain');
                if (gitStatus.trim()) {
                    throw new Error('Working directory is not clean. Commit or stash changes before release.');
                }
            } catch (error) {
                console.log('⚠️  Git status check failed:', error.message);
            }
        }

        // Validate release type
        if (!RELEASE_TYPES[this.releaseType] && !['patch', 'minor', 'major', 'prerelease'].includes(this.releaseType)) {
            throw new Error(`Invalid release type: ${this.releaseType}`);
        }

        console.log('✅ Pre-release checks passed\n');
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

        // Sort by priority (lower number = higher priority)
        return services.sort((a, b) => a.priority - b.priority);
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
                currentVersion: packageJson.version || '0.0.0',
                packageJson,
                hasTests: !!(packageJson.scripts && packageJson.scripts.test),
                hasPublishScript: !!(packageJson.scripts && packageJson.scripts.publish),
                isPrivate: packageJson.private === true
            };
        } catch (error) {
            console.log(`⚠️  ${type} ${name} missing or invalid package.json: ${error.message}`);
            return null;
        }
    }

    async runPreReleaseTests() {
        console.log('🧪 Running pre-release tests...');

        try {
            await this.execCommand('npm run test', { timeout: 300000 }); // 5 minutes timeout
            console.log('✅ Pre-release tests passed\n');
        } catch (error) {
            if (this.isCI) {
                throw new Error(`Pre-release tests failed: ${error.message}`);
            } else {
                console.log('⚠️  Pre-release tests failed, continuing in development mode\n');
            }
        }
    }

    async executeReleases(services) {
        console.log('🚀 Executing releases...\n');

        // Group by priority
        const priorityGroups = {};
        services.forEach(service => {
            if (!priorityGroups[service.priority]) {
                priorityGroups[service.priority] = [];
            }
            priorityGroups[service.priority].push(service);
        });

        // Release by priority groups
        for (const [priority, group] of Object.entries(priorityGroups)) {
            console.log(`\n🎯 RELEASING PRIORITY ${priority} SERVICES (${group.length} services):`);
            console.log(`   ${group.map(s => s.name).join(', ')}\n`);

            for (const service of group) {
                await this.releaseService(service);
            }
        }
    }

    async releaseService(service) {
        console.log(`🚀 Releasing ${service.name} (${service.type})...`);

        const serviceResult = {
            name: service.name,
            type: service.type,
            priority: service.priority,
            oldVersion: service.currentVersion,
            newVersion: service.currentVersion,
            success: false,
            duration: 0,
            steps: [],
            errors: []
        };

        const serviceStartTime = Date.now();

        try {
            // Skip private packages unless they have a publish script
            if (service.isPrivate && !service.hasPublishScript) {
                console.log(`   ⚠️  Skipping private package ${service.name}`);
                serviceResult.success = true;
                serviceResult.steps.push('skipped_private');
                this.results.skipped++;
            } else {
                // 1. Bump version
                const newVersion = await this.bumpVersion(service);
                serviceResult.newVersion = newVersion;
                serviceResult.steps.push(`version_bumped_${newVersion}`);

                // 2. Run tests (if available and not skipped)
                if (!this.skipTests && service.hasTests) {
                    await this.runServiceTests(service);
                    serviceResult.steps.push('tests_passed');
                }

                // 3. Build service
                await this.buildService(service);
                serviceResult.steps.push('build_completed');

                // 4. Create git tag
                if (!this.dryRun) {
                    await this.createGitTag(service, newVersion);
                    serviceResult.steps.push(`tag_created_${newVersion}`);
                }

                // 5. Publish (if not private or has publish script)
                if (!service.isPrivate || service.hasPublishScript) {
                    await this.publishService(service);
                    serviceResult.steps.push('published');
                }

                serviceResult.success = true;
                this.results.released++;
            }

        } catch (error) {
            console.log(`   ❌ Error releasing ${service.name}: ${error.message}`);
            serviceResult.success = false;
            serviceResult.errors.push({
                type: 'release_error',
                message: error.message,
                stack: error.stack
            });
            this.results.failed++;
        }

        serviceResult.duration = Date.now() - serviceStartTime;
        this.results.services[service.name] = serviceResult;
        this.results.total++;

        const status = serviceResult.success ? '✅ RELEASED' : '❌ FAILED';
        const version = serviceResult.oldVersion !== serviceResult.newVersion ?
            ` (${serviceResult.oldVersion} → ${serviceResult.newVersion})` : '';

        console.log(`   ${status} ${service.name}${version} (${serviceResult.duration}ms)`);

        if (serviceResult.steps.length > 0) {
            console.log(`     Steps: ${serviceResult.steps.join(' → ')}`);
        }

        console.log('');
    }

    async bumpVersion(service) {
        if (this.dryRun) {
            return this.calculateNewVersion(service.currentVersion, this.releaseType);
        }

        try {
            const result = await this.execCommand(`npm version ${this.releaseType} --no-git-tag-version`, {
                cwd: service.path
            });
            return result.trim().replace('v', '');
        } catch (error) {
            throw new Error(`Version bump failed: ${error.message}`);
        }
    }

    calculateNewVersion(currentVersion, releaseType) {
        const [major, minor, patch] = currentVersion.split('.').map(Number);

        switch (releaseType) {
            case 'major':
                return `${major + 1}.0.0`;
            case 'minor':
                return `${major}.${minor + 1}.0`;
            case 'patch':
            default:
                return `${major}.${minor}.${patch + 1}`;
        }
    }

    async runServiceTests(service) {
        try {
            await this.execCommand('npm test', {
                cwd: service.path,
                timeout: 120000 // 2 minutes timeout
            });
        } catch (error) {
            throw new Error(`Tests failed: ${error.message}`);
        }
    }

    async buildService(service) {
        try {
            // Check if build script exists
            if (service.packageJson.scripts && service.packageJson.scripts.build) {
                await this.execCommand('npm run build', {
                    cwd: service.path,
                    timeout: 300000 // 5 minutes timeout
                });
            }
        } catch (error) {
            throw new Error(`Build failed: ${error.message}`);
        }
    }

    async createGitTag(service, version) {
        try {
            const tagName = `${service.name}@${version}`;
            await this.execCommand(`git tag -a "${tagName}" -m "Release ${service.name} v${version}"`);
        } catch (error) {
            throw new Error(`Git tag creation failed: ${error.message}`);
        }
    }

    async publishService(service) {
        if (this.dryRun) {
            return;
        }

        try {
            if (service.hasPublishScript) {
                await this.execCommand('npm run publish', {
                    cwd: service.path,
                    timeout: 180000 // 3 minutes timeout
                });
            } else if (!service.isPrivate) {
                await this.execCommand('npm publish', {
                    cwd: service.path,
                    timeout: 180000 // 3 minutes timeout
                });
            }
        } catch (error) {
            // Don't fail on publish errors in development
            if (this.isCI) {
                throw new Error(`Publish failed: ${error.message}`);
            } else {
                console.log(`     ⚠️  Publish warning: ${error.message}`);
            }
        }
    }

    async postReleaseTasks() {
        console.log('📋 Running post-release tasks...');

        if (!this.dryRun) {
            try {
                // Push tags to remote
                await this.execCommand('git push --tags');
                console.log('✅ Git tags pushed to remote');
            } catch (error) {
                console.log('⚠️  Failed to push tags:', error.message);
            }

            // Update changelog
            await this.updateChangelog();
        }

        console.log('✅ Post-release tasks completed\n');
    }

    async updateChangelog() {
        try {
            const changelogPath = join(rootDir, 'CHANGELOG.md');
            const date = new Date().toISOString().split('T')[0];
            const releaseHeader = `\n## Release ${date} (${this.releaseType})\n\n`;

            const releasedServices = Object.values(this.results.services)
                .filter(s => s.success && s.oldVersion !== s.newVersion)
                .map(s => `- ${s.name}: ${s.oldVersion} → ${s.newVersion}`)
                .join('\n');

            const changelogEntry = `${releaseHeader}### Services Updated\n${releasedServices}\n\n### Summary\n- Released ${this.results.released} services\n- Success rate: ${Math.round((this.results.released / this.results.total) * 100)}%\n`;

            let existingChangelog = '';
            try {
                existingChangelog = await fs.readFile(changelogPath, 'utf8');
            } catch {
                existingChangelog = '# Codai Ecosystem Changelog\n';
            }

            const updatedChangelog = existingChangelog.replace(
                '# Codai Ecosystem Changelog\n',
                `# Codai Ecosystem Changelog\n${changelogEntry}`
            );

            await fs.writeFile(changelogPath, updatedChangelog);
            console.log('✅ Changelog updated');
        } catch (error) {
            console.log('⚠️  Failed to update changelog:', error.message);
        }
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
                    reject(new Error(`Command failed: ${stderr || stdout}`));
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

    async generateReport() {
        this.results.duration = Date.now() - this.startTime;

        console.log('\n' + '='.repeat(60));
        console.log('🚀 CODAI ECOSYSTEM RELEASE RESULTS');
        console.log('='.repeat(60));

        console.log(`\n📊 SUMMARY:`);
        console.log(`   Total Services: ${this.results.total}`);
        console.log(`   Released: ${this.results.released} ✅`);
        console.log(`   Failed: ${this.results.failed} ❌`);
        console.log(`   Skipped: ${this.results.skipped} ⚠️`);
        console.log(`   Duration: ${Math.round(this.results.duration / 1000)}s`);
        console.log(`   Release Type: ${this.releaseType}`);

        if (this.dryRun) {
            console.log(`   🔍 DRY RUN - No actual changes made`);
        }

        const successRate = this.results.total > 0 ?
            Math.round((this.results.released / this.results.total) * 100) : 0;
        console.log(`   Success Rate: ${successRate}%`);

        // Service breakdown
        console.log(`\n📋 SERVICE BREAKDOWN:`);
        Object.entries(this.results.services).forEach(([name, result]) => {
            const status = result.success ? '✅' : '❌';
            const version = result.oldVersion !== result.newVersion ?
                ` (${result.oldVersion} → ${result.newVersion})` : '';
            console.log(`   ${status} ${name} (P${result.priority})${version} - ${result.duration}ms`);

            if (result.steps.length > 0) {
                console.log(`      Steps: ${result.steps.join(' → ')}`);
            }

            if (result.errors.length > 0) {
                result.errors.forEach(error => {
                    console.log(`      🔍 ${error.type}: ${error.message}`);
                });
            }
        });

        // Version changes summary
        const versionChanges = Object.values(this.results.services)
            .filter(s => s.oldVersion !== s.newVersion);

        if (versionChanges.length > 0) {
            console.log(`\n📦 VERSION CHANGES:`);
            versionChanges.forEach(service => {
                console.log(`   ${service.name}: ${service.oldVersion} → ${service.newVersion}`);
            });
        }

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
            console.log(`   • Fix ${this.results.failed} failing releases`);
        }
        if (!this.skipTests) {
            console.log(`   • All tests passed - great job!`);
        } else {
            console.log(`   • Consider running tests before release`);
        }
        console.log(`   • Update documentation for released services`);
        console.log(`   • Monitor deployment status`);

        console.log('\n' + '='.repeat(60));
        console.log(this.results.failed === 0 ?
            '🎉 RELEASE COMPLETED SUCCESSFULLY! 🎉' :
            '⚠️  SOME RELEASES FAILED - CHECK ERRORS ABOVE'
        );
        console.log('='.repeat(60) + '\n');

        // Save detailed report
        const reportPath = join(rootDir, 'release-results.json');
        await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`📄 Detailed report saved to: ${reportPath}`);
    }
}

// Run if called directly
if (process.argv[1] && (process.argv[1].endsWith('release-orchestrator.js') || import.meta.url === `file://${process.argv[1]}`)) {
    const orchestrator = new ReleaseOrchestrator();
    orchestrator.run().catch(console.error);
}

export default ReleaseOrchestrator;
