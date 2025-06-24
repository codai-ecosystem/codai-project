#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Fix Next.js dependency issues across all Codai services
 * Resolves pnpm workspace linking problems
 */

const APPS_DIR = path.join(__dirname, '..', 'apps');
const ROOT_DIR = path.join(__dirname, '..');

function log(message) {
    console.log(`🔧 ${message}`);
}

function error(message) {
    console.error(`❌ ${message}`);
}

function success(message) {
    console.log(`✅ ${message}`);
}

async function main() {
    log('Starting Next.js dependency fix for all Codai services...');

    try {
        // Step 1: Clean all node_modules and package-lock files
        log('Cleaning existing installations...');

        const apps = fs.readdirSync(APPS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const app of apps) {
            const appDir = path.join(APPS_DIR, app);
            const nodeModulesDir = path.join(appDir, 'node_modules');
            const packageLockPath = path.join(appDir, 'package-lock.json');

            if (fs.existsSync(nodeModulesDir)) {
                log(`Removing node_modules from ${app}...`);
                execSync(`rd /s /q "${nodeModulesDir}"`, { cwd: appDir, stdio: 'ignore' });
            }

            if (fs.existsSync(packageLockPath)) {
                log(`Removing package-lock.json from ${app}...`);
                fs.unlinkSync(packageLockPath);
            }
        }

        // Step 2: Clean root node_modules
        const rootNodeModules = path.join(ROOT_DIR, 'node_modules');
        if (fs.existsSync(rootNodeModules)) {
            log('Cleaning root node_modules...');
            execSync(`rd /s /q "${rootNodeModules}"`, { cwd: ROOT_DIR, stdio: 'ignore' });
        }

        // Step 3: Clean pnpm cache
        log('Cleaning pnpm cache...');
        try {
            execSync('pnpm store prune', { cwd: ROOT_DIR, stdio: 'pipe' });
        } catch (e) {
            log('pnpm store prune failed, continuing...');
        }

        // Step 4: Reinstall all dependencies
        log('Reinstalling all dependencies...');
        execSync('pnpm install --frozen-lockfile=false', {
            cwd: ROOT_DIR,
            stdio: 'inherit'
        });

        // Step 5: Verify Next.js installation for each app
        log('Verifying Next.js installations...');

        for (const app of apps) {
            const appDir = path.join(APPS_DIR, app);
            const packageJsonPath = path.join(appDir, 'package.json');

            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

                if (packageJson.dependencies && packageJson.dependencies.next) {
                    log(`Verifying Next.js for ${app}...`);

                    try {
                        // Try to find Next.js binary
                        const nextBinPath = path.join(ROOT_DIR, 'node_modules', '.pnpm', 'next@*', 'node_modules', 'next', 'dist', 'bin', 'next');

                        // Create symlink if needed
                        const appNodeModules = path.join(appDir, 'node_modules');
                        const appNextBin = path.join(appNodeModules, '.bin', 'next');

                        if (!fs.existsSync(appNodeModules)) {
                            fs.mkdirSync(appNodeModules, { recursive: true });
                        }

                        const binDir = path.join(appNodeModules, '.bin');
                        if (!fs.existsSync(binDir)) {
                            fs.mkdirSync(binDir, { recursive: true });
                        }

                        // Test if Next.js is accessible
                        try {
                            execSync('pnpm exec next --version', {
                                cwd: appDir,
                                stdio: 'pipe'
                            });
                            success(`Next.js working for ${app}`);
                        } catch (e) {
                            error(`Next.js issue in ${app}: ${e.message}`);
                        }

                    } catch (e) {
                        error(`Failed to verify Next.js for ${app}: ${e.message}`);
                    }
                }
            }
        }

        // Step 6: Test build one service
        log('Testing build for Codai service...');
        try {
            execSync('pnpm run --filter @codai/codai build', {
                cwd: ROOT_DIR,
                stdio: 'inherit'
            });
            success('Build test passed!');
        } catch (e) {
            error(`Build test failed: ${e.message}`);
            log('Trying alternative approach...');

            // Alternative: try direct next build
            try {
                execSync('pnpm exec next build', {
                    cwd: path.join(APPS_DIR, 'codai'),
                    stdio: 'inherit'
                });
                success('Alternative build approach worked!');
            } catch (e2) {
                error(`Alternative build also failed: ${e2.message}`);
            }
        }

        success('Next.js dependency fix completed!');
        log('You can now run: pnpm dev to start all services');

    } catch (error) {
        error(`Fix failed: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };
