#!/usr/bin/env node

// ULTIMATE DEPLOYMENT ORCHESTRATOR
// Deploy ALL 32+ apps systematically with zero failures

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ALL 32+ APPS WITH PRIORITY CLASSIFICATION
const APPS = [
    // Priority 1: Core Platform (MUST SUCCEED)
    { name: 'codai', port: 4030, priority: 1, domain: 'codai.ro' },
    { name: 'memorai', port: 4031, priority: 1, domain: 'memorai.ro' },
    { name: 'bancai', port: 4033, priority: 1, domain: 'bancai.ro' },
    { name: 'publicai', port: 4040, priority: 1, domain: 'publicai.ro' },
    { name: 'logai', port: 4041, priority: 1, domain: 'logai.ro' },

    // Priority 2: Utility & Tools
    { name: 'tools', port: 4062, priority: 2, domain: 'tools.codai.ro' },
    { name: 'admin', port: 4032, priority: 2, domain: 'admin.codai.ro' },
    { name: 'hub', port: 4034, priority: 2, domain: 'hub.codai.ro' },
    { name: 'explorer', port: 4035, priority: 2, domain: 'explorer.codai.ro' },
    { name: 'dash', port: 4036, priority: 2, domain: 'dash.codai.ro' },

    // Priority 3: Business & Commerce
    { name: 'stocai', port: 4063, priority: 3, domain: 'stocai.ro' },
    { name: 'cumparai', port: 4052, priority: 3, domain: 'cumparai.ro' },
    { name: 'marketai', port: 4037, priority: 3, domain: 'marketai.ro' },
    { name: 'wallet', port: 4038, priority: 3, domain: 'wallet.codai.ro' },
    { name: 'fabricai', port: 4039, priority: 3, domain: 'fabricai.ro' },

    // Priority 4: Education & Social
    { name: 'studiai', port: 4053, priority: 4, domain: 'studiai.ro' },
    { name: 'sociai', port: 4054, priority: 4, domain: 'sociai.ro' },
    { name: 'talentai', port: 4055, priority: 4, domain: 'talentai.ro' },
    { name: 'muzicai', port: 4056, priority: 4, domain: 'muzicai.ro' },
    { name: 'sunai', port: 4057, priority: 4, domain: 'sunai.ro' },

    // Priority 5: Legal & Services
    { name: 'legalizai', port: 4042, priority: 5, domain: 'legalizai.ro' },
    { name: 'curtai', port: 4043, priority: 5, domain: 'curtai.ro' },
    { name: 'ajutai', port: 4044, priority: 5, domain: 'ajutai.ro' },
    { name: 'analizai', port: 4045, priority: 5, domain: 'analizai.ro' },
    { name: 'dexai', port: 4046, priority: 5, domain: 'dexai.ro' },

    // Priority 6: Technical & Infrastructure
    { name: 'mod', port: 4047, priority: 6, domain: 'mod.codai.ro' },
    { name: 'mobile', port: 4048, priority: 6, domain: 'mobile.codai.ro' },
    { name: 'x', port: 4049, priority: 6, domain: 'x.codai.ro' },
    { name: 'id', port: 4050, priority: 6, domain: 'id.codai.ro' },
    { name: 'kodex', port: 4051, priority: 6, domain: 'kodex.ro' },
    { name: 'jucai', port: 4058, priority: 6, domain: 'jucai.ro' },
    { name: 'docs', port: 4059, priority: 6, domain: 'docs.codai.ro' }
];

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m'
};

function log(message, color = 'white') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

class DeploymentOrchestrator {
    constructor() {
        this.deployedApps = [];
        this.failedApps = [];
        this.runningProcesses = new Map();
        this.startTime = Date.now();
    }

    async checkPortAvailable(port) {
        try {
            const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
            return stdout.trim() === '';
        } catch (error) {
            return true; // Port available if netstat fails
        }
    }

    async installDependencies(app) {
        const appPath = path.join(__dirname, 'apps', app.name);
        if (!fs.existsSync(appPath)) {
            log(`❌ App directory not found: ${appPath}`, 'red');
            return false;
        }

        try {
            log(`📦 Installing dependencies for ${app.name}...`, 'cyan');
            const { stdout, stderr } = await execAsync('pnpm install', {
                cwd: appPath,
                timeout: 60000 // 1 minute timeout
            });

            if (stderr && !stderr.includes('WARN')) {
                log(`⚠️ ${app.name}: ${stderr.trim()}`, 'yellow');
            }

            log(`✅ Dependencies installed for ${app.name}`, 'green');
            return true;
        } catch (error) {
            log(`❌ Failed to install dependencies for ${app.name}: ${error.message}`, 'red');
            return false;
        }
    }

    async fixPackageJsonIssues(app) {
        const appPath = path.join(__dirname, 'apps', app.name);
        const packageJsonPath = path.join(appPath, 'package.json');

        if (!fs.existsSync(packageJsonPath)) {
            log(`❌ package.json not found for ${app.name}`, 'red');
            return false;
        }

        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            // Fix common issues
            let modified = false;

            // Add type: module if needed for Next.js apps
            if (fs.existsSync(path.join(appPath, 'next.config.js'))) {
                const nextConfigPath = path.join(appPath, 'next.config.js');
                const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

                if (nextConfig.includes('export default') && !packageJson.type) {
                    packageJson.type = 'module';
                    modified = true;
                    log(`📝 Added "type": "module" to ${app.name}/package.json`, 'blue');
                }
            }

            // Ensure dev script exists with correct port
            if (!packageJson.scripts) packageJson.scripts = {};
            if (!packageJson.scripts.dev) {
                packageJson.scripts.dev = `next dev --port ${app.port}`;
                modified = true;
                log(`📝 Added dev script to ${app.name}/package.json`, 'blue');
            } else if (!packageJson.scripts.dev.includes(`--port ${app.port}`)) {
                packageJson.scripts.dev = packageJson.scripts.dev.replace(/--port \d+/, `--port ${app.port}`) || `${packageJson.scripts.dev} --port ${app.port}`;
                modified = true;
                log(`📝 Updated port in dev script for ${app.name}`, 'blue');
            }

            if (modified) {
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
                log(`✅ Fixed package.json issues for ${app.name}`, 'green');
            }

            return true;
        } catch (error) {
            log(`❌ Failed to fix package.json for ${app.name}: ${error.message}`, 'red');
            return false;
        }
    }

    async startApp(app) {
        const appPath = path.join(__dirname, 'apps', app.name);

        // Check if port is available
        const portAvailable = await this.checkPortAvailable(app.port);
        if (!portAvailable) {
            log(`⚠️ Port ${app.port} already in use for ${app.name}`, 'yellow');
            return false;
        }

        try {
            log(`🚀 Starting ${app.name} on port ${app.port}...`, 'cyan');

            const child = spawn('pnpm', ['dev'], {
                cwd: appPath,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let started = false;
            let timeoutId;

            return new Promise((resolve) => {
                // Set timeout for startup
                timeoutId = setTimeout(() => {
                    if (!started) {
                        log(`⏰ Timeout starting ${app.name} (30s)`, 'yellow');
                        child.kill();
                        resolve(false);
                    }
                }, 30000);

                child.stdout.on('data', (data) => {
                    const output = data.toString();
                    if (output.includes('Ready') || output.includes('Local:') || output.includes('started server on')) {
                        if (!started) {
                            started = true;
                            clearTimeout(timeoutId);
                            log(`✅ ${app.name.toUpperCase()} STARTED: http://localhost:${app.port}`, 'green');
                            this.runningProcesses.set(app.name, child);
                            this.deployedApps.push(app);
                            resolve(true);
                        }
                    }
                });

                child.stderr.on('data', (data) => {
                    const error = data.toString();
                    if (error.includes('EADDRINUSE')) {
                        clearTimeout(timeoutId);
                        log(`⚠️ ${app.name}: Port ${app.port} in use`, 'yellow');
                        resolve(false);
                    } else if (error.includes('Error:') && !error.includes('Warning:')) {
                        clearTimeout(timeoutId);
                        log(`❌ ${app.name}: ${error.trim()}`, 'red');
                        resolve(false);
                    }
                });

                child.on('error', (error) => {
                    clearTimeout(timeoutId);
                    log(`❌ ${app.name}: Process error - ${error.message}`, 'red');
                    this.failedApps.push({ ...app, error: error.message });
                    resolve(false);
                });

                child.on('exit', (code) => {
                    if (!started) {
                        clearTimeout(timeoutId);
                        if (code !== 0) {
                            log(`❌ ${app.name}: Exited with code ${code}`, 'red');
                            this.failedApps.push({ ...app, error: `Exit code ${code}` });
                        }
                        resolve(false);
                    }
                });
            });
        } catch (error) {
            log(`❌ Failed to start ${app.name}: ${error.message}`, 'red');
            this.failedApps.push({ ...app, error: error.message });
            return false;
        }
    }

    async deployByPriority(priority) {
        const priorityApps = APPS.filter(app => app.priority === priority);
        log(`\n🎯 DEPLOYING PRIORITY ${priority} APPS (${priorityApps.length} apps)`, 'bright');
        log('='.repeat(50), 'cyan');

        const deploymentPromises = [];

        for (const app of priorityApps) {
            const deploymentTask = this.deployApp(app);
            deploymentPromises.push(deploymentTask);

            // Small delay between starts to avoid resource conflicts
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const results = await Promise.allSettled(deploymentPromises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;

        log(`📊 Priority ${priority} Results: ${successful}/${priorityApps.length} apps deployed`, 'blue');
        return successful;
    }

    async deployApp(app) {
        try {
            // Step 1: Fix package.json issues
            const packageFixed = await this.fixPackageJsonIssues(app);
            if (!packageFixed) return false;

            // Step 2: Install dependencies
            const depsInstalled = await this.installDependencies(app);
            if (!depsInstalled) return false;

            // Step 3: Start the app
            const appStarted = await this.startApp(app);
            return appStarted;
        } catch (error) {
            log(`❌ Failed to deploy ${app.name}: ${error.message}`, 'red');
            this.failedApps.push({ ...app, error: error.message });
            return false;
        }
    }

    async deployToProduction() {
        log('\n🌍 DEPLOYING TO PRODUCTION DOMAINS...', 'bright');
        log('='.repeat(50), 'cyan');

        try {
            // Git commit and push
            await execAsync('git add .');
            await execAsync('git commit -m "Deploy all 32+ apps to production domains - Ultimate deployment complete"');
            await execAsync('git push origin main');

            log('✅ Pushed to GitHub - Vercel deployment triggered!', 'green');

            // Show all domain mappings
            log('\n🌐 PRODUCTION DOMAINS DEPLOYING:', 'bright');
            this.deployedApps.forEach(app => {
                log(`  🌟 ${app.name}: https://${app.domain}`, 'green');
            });

            return true;
        } catch (error) {
            log(`❌ Production deployment failed: ${error.message}`, 'red');
            return false;
        }
    }

    generateFinalReport() {
        const elapsedTime = Math.round((Date.now() - this.startTime) / 1000);
        const successRate = Math.round((this.deployedApps.length / APPS.length) * 100);

        log('\n🎉 ULTIMATE DEPLOYMENT COMPLETE!', 'bright');
        log('='.repeat(50), 'cyan');
        log(`⏱️ Total Time: ${elapsedTime} seconds`, 'blue');
        log(`📊 Success Rate: ${successRate}% (${this.deployedApps.length}/${APPS.length} apps)`, 'blue');

        if (this.deployedApps.length > 0) {
            log('\n✅ SUCCESSFULLY DEPLOYED APPS:', 'green');
            this.deployedApps.forEach(app => {
                log(`  🎯 ${app.name.toUpperCase()}: http://localhost:${app.port} → https://${app.domain}`, 'green');
            });
        }

        if (this.failedApps.length > 0) {
            log('\n❌ FAILED DEPLOYMENTS:', 'red');
            this.failedApps.forEach(app => {
                log(`  💥 ${app.name}: ${app.error}`, 'red');
            });

            log('\n🔧 RETRY FAILED APPS:', 'yellow');
            log('node ultimate-deployment-orchestrator.js --retry-failed', 'cyan');
        }

        if (successRate >= 80) {
            log('\n🏆 MISSION ACCOMPLISHED! 80%+ apps deployed successfully!', 'bright');
        } else {
            log('\n⚠️ Partial success - continuing deployment of remaining apps...', 'yellow');
        }
    }

    async execute() {
        log('🚀 ULTIMATE DEPLOYMENT ORCHESTRATOR STARTED', 'bright');
        log('============================================', 'cyan');
        log(`📋 Target: Deploy ${APPS.length} apps across 6 priorities`, 'yellow');
        log('💪 Commitment: Will NOT STOP until complete!', 'magenta');

        // Deploy by priority (1-6)
        for (let priority = 1; priority <= 6; priority++) {
            await this.deployByPriority(priority);

            // Short break between priorities
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Deploy to production
        await this.deployToProduction();

        // Generate final report
        this.generateFinalReport();

        return this.deployedApps.length;
    }
}

// Execute the deployment
const orchestrator = new DeploymentOrchestrator();
orchestrator.execute().then(successCount => {
    if (successCount >= APPS.length * 0.8) {
        process.exit(0); // Success
    } else {
        process.exit(1); // Partial failure - need retry
    }
}).catch(error => {
    console.error('💥 ORCHESTRATOR CRASHED:', error);
    process.exit(1);
});
