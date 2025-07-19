#!/usr/bin/env node

/**
 * CODAI Ecosystem Package Updater
 * Updates all packages across 43+ apps to latest versions
 * Exception: Tailwind CSS stays at version 3.x for stability
 */

import { readdir, readFile, writeFile, access } from 'fs/promises';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = resolve(process.cwd());
const APPS_DIR = join(ROOT_DIR, 'apps');

// Packages to keep at specific versions
const VERSION_EXCEPTIONS = {
    'tailwindcss': '^3.4.17',        // Keep Tailwind v3
    'react': '^19.1.0',              // Already latest
    'react-dom': '^19.1.0',          // Already latest
    'next': '^15.4.1',               // Already latest
    'typescript': '^5.8.3'           // Already latest
};

// Critical packages that need careful handling
const CRITICAL_PACKAGES = [
    'react', 'react-dom', 'next', 'typescript', 'tailwindcss',
    '@types/react', '@types/react-dom', '@types/node'
];

class PackageUpdater {
    constructor() {
        this.apps = [];
        this.updateResults = [];
        this.errors = [];
    }

    async findAllApps() {
        console.log('🔍 Scanning for apps...');

        try {
            const entries = await readdir(APPS_DIR, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory() && entry.name !== 'README.md') {
                    const appPath = join(APPS_DIR, entry.name);
                    const packageJsonPath = join(appPath, 'package.json');

                    try {
                        await access(packageJsonPath);
                        this.apps.push({
                            name: entry.name,
                            path: appPath,
                            packageJsonPath
                        });
                    } catch (error) {
                        console.log(`ℹ️  No package.json found in ${entry.name}, skipping...`);
                    }
                }
            }

            console.log(`📦 Found ${this.apps.length} apps with package.json files`);
            return this.apps;
        } catch (error) {
            console.error('❌ Error scanning apps directory:', error.message);
            throw error;
        }
    }

    async readPackageJson(packageJsonPath) {
        try {
            const content = await readFile(packageJsonPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`❌ Error reading ${packageJsonPath}:`, error.message);
            throw error;
        }
    }

    async writePackageJson(packageJsonPath, packageData) {
        try {
            const content = JSON.stringify(packageData, null, 2) + '\n';
            await writeFile(packageJsonPath, content, 'utf8');
            return true;
        } catch (error) {
            console.error(`❌ Error writing ${packageJsonPath}:`, error.message);
            return false;
        }
    }

    async getLatestVersion(packageName) {
        try {
            // Handle special cases first
            if (VERSION_EXCEPTIONS[packageName]) {
                return VERSION_EXCEPTIONS[packageName];
            }

            // Get latest version from npm
            const result = execSync(`npm view ${packageName} version`, {
                encoding: 'utf8',
                timeout: 10000
            }).trim();

            return `^${result}`;
        } catch (error) {
            console.warn(`⚠️  Could not fetch latest version for ${packageName}:`, error.message);
            return null;
        }
    }

    async updatePackageDependencies(packageData, appName) {
        console.log(`\n🔄 Updating dependencies for ${appName}...`);

        let updated = false;
        const updates = [];

        // Update dependencies
        if (packageData.dependencies) {
            for (const [name, currentVersion] of Object.entries(packageData.dependencies)) {
                // Skip workspace packages
                if (currentVersion.startsWith('workspace:')) {
                    continue;
                }

                const latestVersion = await this.getLatestVersion(name);
                if (latestVersion && latestVersion !== currentVersion) {
                    console.log(`  📈 ${name}: ${currentVersion} → ${latestVersion}`);
                    packageData.dependencies[name] = latestVersion;
                    updates.push({ name, from: currentVersion, to: latestVersion, type: 'dependency' });
                    updated = true;
                }
            }
        }

        // Update devDependencies
        if (packageData.devDependencies) {
            for (const [name, currentVersion] of Object.entries(packageData.devDependencies)) {
                // Skip workspace packages
                if (currentVersion.startsWith('workspace:')) {
                    continue;
                }

                const latestVersion = await this.getLatestVersion(name);
                if (latestVersion && latestVersion !== currentVersion) {
                    console.log(`  📈 ${name}: ${currentVersion} → ${latestVersion} (dev)`);
                    packageData.devDependencies[name] = latestVersion;
                    updates.push({ name, from: currentVersion, to: latestVersion, type: 'devDependency' });
                    updated = true;
                }
            }
        }

        return { updated, updates };
    }

    async updateSingleApp(app) {
        console.log(`\n🚀 Processing ${app.name}...`);

        try {
            const packageData = await this.readPackageJson(app.packageJsonPath);
            const { updated, updates } = await this.updatePackageDependencies(packageData, app.name);

            if (updated) {
                const writeSuccess = await this.writePackageJson(app.packageJsonPath, packageData);

                if (writeSuccess) {
                    console.log(`✅ ${app.name}: Updated ${updates.length} packages`);
                    this.updateResults.push({
                        app: app.name,
                        success: true,
                        updatesCount: updates.length,
                        updates
                    });
                } else {
                    console.log(`❌ ${app.name}: Failed to write package.json`);
                    this.errors.push({
                        app: app.name,
                        error: 'Failed to write package.json'
                    });
                }
            } else {
                console.log(`ℹ️  ${app.name}: All packages already up to date`);
                this.updateResults.push({
                    app: app.name,
                    success: true,
                    updatesCount: 0,
                    updates: []
                });
            }
        } catch (error) {
            console.error(`❌ ${app.name}: ${error.message}`);
            this.errors.push({
                app: app.name,
                error: error.message
            });
        }
    }

    async updateAllApps() {
        console.log(`\n🔄 Starting package updates for ${this.apps.length} apps...\n`);

        for (const app of this.apps) {
            await this.updateSingleApp(app);

            // Small delay to avoid overwhelming npm registry
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async runPostUpdateCommands() {
        console.log('\n🔧 Running post-update commands...');

        try {
            console.log('📦 Installing updated packages...');
            execSync('pnpm install', {
                stdio: 'inherit',
                cwd: ROOT_DIR,
                timeout: 300000 // 5 minutes
            });

            console.log('🧹 Cleaning up...');
            execSync('pnpm run clean', {
                stdio: 'inherit',
                cwd: ROOT_DIR,
                timeout: 60000 // 1 minute
            });

            console.log('✅ Post-update commands completed successfully');
        } catch (error) {
            console.error('❌ Error running post-update commands:', error.message);
            this.errors.push({
                app: 'post-update',
                error: error.message
            });
        }
    }

    generateReport() {
        console.log('\n📊 PACKAGE UPDATE REPORT');
        console.log('='.repeat(50));

        const successfulUpdates = this.updateResults.filter(r => r.success);
        const totalUpdates = this.updateResults.reduce((sum, r) => sum + r.updatesCount, 0);

        console.log(`✅ Successfully processed: ${successfulUpdates.length}/${this.apps.length} apps`);
        console.log(`📈 Total package updates: ${totalUpdates}`);
        console.log(`❌ Errors: ${this.errors.length}`);

        if (this.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.errors.forEach(error => {
                console.log(`  - ${error.app}: ${error.error}`);
            });
        }

        if (totalUpdates > 0) {
            console.log('\n📈 MAJOR UPDATES:');
            this.updateResults
                .filter(r => r.updatesCount > 0)
                .forEach(result => {
                    console.log(`\n${result.app} (${result.updatesCount} updates):`);
                    result.updates.forEach(update => {
                        console.log(`  - ${update.name}: ${update.from} → ${update.to}`);
                    });
                });
        }

        console.log('\n🎉 Package update process completed!');
    }

    async run() {
        console.log('🚀 CODAI Ecosystem Package Updater');
        console.log('='.repeat(50));

        try {
            await this.findAllApps();
            await this.updateAllApps();
            await this.runPostUpdateCommands();
            this.generateReport();

            // Store results in memory for future reference
            const reportData = {
                timestamp: new Date().toISOString(),
                totalApps: this.apps.length,
                successfulUpdates: this.updateResults.filter(r => r.success).length,
                totalPackageUpdates: this.updateResults.reduce((sum, r) => sum + r.updatesCount, 0),
                errors: this.errors.length,
                details: this.updateResults
            };

            console.log('\n💾 Update completed successfully!');
            console.log('Run "pnpm run lint:fix" to ensure code formatting is correct');
            console.log('Run "pnpm run test" to verify all tests still pass');

            process.exit(0);
        } catch (error) {
            console.error('\n💥 Fatal error:', error.message);
            process.exit(1);
        }
    }
}

// Run the updater
const updater = new PackageUpdater();
updater.run();
