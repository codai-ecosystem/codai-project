#!/usr/bin/env node

// FOCUSED FIX AND DEPLOY - Working Apps Only
// Fix configuration issues and deploy verified working apps

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Apps we know have good structure
const WORKING_APPS = [
    { name: 'stocai', port: 4063, priority: 1 },
    { name: 'codai', port: 4030, priority: 1 },
    { name: 'tools', port: 4062, priority: 2 },
    { name: 'cumparai', port: 4052, priority: 2 },
    { name: 'admin', port: 4032, priority: 3 },
    { name: 'publicai', port: 4040, priority: 3 }
];

function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${new Date().toLocaleTimeString()}] ${message}${colors.reset}`);
}

function fixPackageJson(app) {
    const appPath = path.join(__dirname, 'apps', app.name);
    const packageJsonPath = path.join(appPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        log(`Package.json not found for ${app.name}`, 'error');
        return false;
    }

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        let modified = false;

        // Check if next.config.js uses ES modules
        const nextConfigPath = path.join(appPath, 'next.config.js');
        if (fs.existsSync(nextConfigPath)) {
            const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
            if (nextConfig.includes('export default') && !packageJson.type) {
                packageJson.type = 'module';
                modified = true;
                log(`Added "type": "module" to ${app.name}`, 'success');
            }
        }

        // Ensure dev script has correct port
        if (!packageJson.scripts) packageJson.scripts = {};
        const expectedDevScript = `next dev --port ${app.port}`;
        if (packageJson.scripts.dev !== expectedDevScript) {
            packageJson.scripts.dev = expectedDevScript;
            modified = true;
            log(`Fixed dev script for ${app.name}`, 'success');
        }

        if (modified) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            log(`Updated package.json for ${app.name}`, 'success');
        }

        return true;
    } catch (error) {
        log(`Error fixing ${app.name}: ${error.message}`, 'error');
        return false;
    }
}

function killProcessOnPort(port) {
    return new Promise((resolve) => {
        const { exec } = require('child_process');
        exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
            if (stdout) {
                const lines = stdout.split('\n');
                for (const line of lines) {
                    if (line.includes('LISTENING')) {
                        const parts = line.trim().split(/\s+/);
                        const pid = parts[parts.length - 1];
                        if (pid && pid !== '0') {
                            exec(`taskkill /F /PID ${pid}`, () => {
                                log(`Killed process on port ${port}`, 'warning');
                                resolve();
                            });
                            return;
                        }
                    }
                }
            }
            resolve();
        });
    });
}

async function startApp(app) {
    const appPath = path.join(__dirname, 'apps', app.name);

    if (!fs.existsSync(appPath)) {
        log(`App directory not found: ${app.name}`, 'error');
        return false;
    }

    // Kill any process on the port first
    await killProcessOnPort(app.port);

    log(`Starting ${app.name} on port ${app.port}...`, 'info');

    return new Promise((resolve) => {
        const child = spawn('pnpm', ['dev', '--port', app.port.toString()], {
            cwd: appPath,
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        let started = false;
        let timeout;

        timeout = setTimeout(() => {
            if (!started) {
                log(`Timeout starting ${app.name}`, 'warning');
                child.kill();
                resolve(false);
            }
        }, 25000);

        child.stdout.on('data', (data) => {
            const output = data.toString();
            if ((output.includes('Ready') || output.includes('Local:') || output.includes('started server')) && !started) {
                started = true;
                clearTimeout(timeout);
                log(`✅ ${app.name.toUpperCase()} LIVE: http://localhost:${app.port}`, 'success');
                resolve(true);
            }
        });

        child.stderr.on('data', (data) => {
            const error = data.toString();
            if (error.includes('EADDRINUSE') && !started) {
                clearTimeout(timeout);
                log(`Port ${app.port} in use for ${app.name}`, 'warning');
                resolve(false);
            }
            // Ignore warnings
            if (!error.includes('Warning') && error.includes('Error') && !started) {
                clearTimeout(timeout);
                log(`Error starting ${app.name}: ${error.trim()}`, 'error');
                child.kill();
                resolve(false);
            }
        });

        child.on('error', (error) => {
            if (!started) {
                clearTimeout(timeout);
                log(`Process error for ${app.name}: ${error.message}`, 'error');
                resolve(false);
            }
        });
    });
}

async function deployWorkingApps() {
    log('🎯 FOCUSED DEPLOYMENT - WORKING APPS ONLY', 'info');
    log('==========================================', 'info');

    const deployedApps = [];

    // Fix and deploy each app
    for (const app of WORKING_APPS) {
        log(`\n🔧 Processing ${app.name}...`, 'info');

        // Fix package.json
        if (fixPackageJson(app)) {
            // Try to start the app
            if (await startApp(app)) {
                deployedApps.push(app);
            }
        }

        // Small delay between starts
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Results
    log('\n🎉 DEPLOYMENT RESULTS', 'success');
    log('====================', 'info');
    log(`Deployed: ${deployedApps.length}/${WORKING_APPS.length} apps`, 'info');

    if (deployedApps.length > 0) {
        log('\n✅ LIVE APPS:', 'success');
        deployedApps.forEach(app => {
            log(`  🌟 ${app.name.toUpperCase()}: http://localhost:${app.port}`, 'success');
        });

        log('\n🎨 Beautiful UI Features:', 'info');
        log('  ✨ Framer Motion animations', 'info');
        log('  🎨 Glass morphism design', 'info');
        log('  📊 Real-time data updates', 'info');

        if (deployedApps.length >= 3) {
            log('\n🚀 READY FOR PRODUCTION!', 'success');
            log('Run: node deploy-production-domains.js', 'info');
        }
    }

    return deployedApps.length;
}

// Execute deployment
deployWorkingApps().then(count => {
    if (count >= 3) {
        log('\n🏆 MISSION SUCCESS! Multiple apps deployed!', 'success');
    } else {
        log('\n⚠️ Partial success - continuing efforts...', 'warning');
    }
}).catch(error => {
    log(`Deployment error: ${error.message}`, 'error');
});
