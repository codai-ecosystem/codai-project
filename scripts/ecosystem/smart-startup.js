#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// SMART ECOSYSTEM STARTUP STRATEGY
// Based on discovery: Modern UI with animations already exists!
// Goal: Start critical apps systematically with proper dependency management

const CRITICAL_APPS = [
    'codai',     // 4030 - Main platform 
    'memorai',   // 4031 - Memory system
    'logai',     // 4032 - Logging 
    'bancai',    // 4033 - Banking platform
    'aide',      // 4042 - Development aid
    'publicai'   // 4040 - Public interface
];

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bright: '\x1b[1m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

async function checkAppExists(appName) {
    const appPath = path.join(__dirname, 'apps', appName);
    const packageJsonPath = path.join(appPath, 'package.json');
    return fs.existsSync(packageJsonPath);
}

async function installAppDependencies(appName) {
    const appPath = path.join(__dirname, 'apps', appName);
    log(`📦 Installing dependencies for ${appName}...`, 'yellow');

    try {
        await execCommand('pnpm install', appPath);
        log(`✅ Dependencies installed for ${appName}`, 'green');
        return true;
    } catch (error) {
        log(`❌ Failed to install dependencies for ${appName}: ${error.error.message}`, 'red');
        return false;
    }
}

async function startApp(appName, port) {
    const appPath = path.join(__dirname, 'apps', appName);
    log(`🚀 Starting ${appName} on port ${port}...`, 'cyan');

    const child = spawn('pnpm', ['dev'], {
        cwd: appPath,
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
    });

    return new Promise((resolve) => {
        let started = false;
        let output = '';

        child.stdout.on('data', (data) => {
            const str = data.toString();
            output += str;

            if (str.includes('Ready') || str.includes('started') || str.includes(`localhost:${port}`)) {
                if (!started) {
                    started = true;
                    log(`✅ ${appName} started successfully on port ${port}`, 'green');
                    resolve({ success: true, process: child });
                }
            }
        });

        child.stderr.on('data', (data) => {
            const str = data.toString();
            output += str;

            if (str.includes('Error') || str.includes('EADDRINUSE')) {
                if (!started) {
                    log(`❌ ${appName} failed to start: ${str}`, 'red');
                    resolve({ success: false, error: str });
                }
            }
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            if (!started) {
                log(`⏰ ${appName} startup timeout (30s)`, 'yellow');
                child.kill();
                resolve({ success: false, error: 'timeout' });
            }
        }, 30000);
    });
}

async function smartStartup() {
    log('🎯 SMART ECOSYSTEM STARTUP STRATEGY', 'bright');
    log('=====================================', 'cyan');
    log('🎨 Discovery: Modern UI with animations already implemented!', 'green');
    log('🚀 Goal: Start critical apps systematically', 'yellow');

    const startupResults = [];
    const ports = { codai: 4030, memorai: 4031, logai: 4032, bancai: 4033, aide: 4042, publicai: 4040 };

    // Phase 1: Verify apps exist
    log('\n🔍 PHASE 1: Verifying app existence...', 'magenta');
    const existingApps = [];

    for (const appName of CRITICAL_APPS) {
        const exists = await checkAppExists(appName);
        if (exists) {
            existingApps.push(appName);
            log(`  ✅ ${appName} - Found`, 'green');
        } else {
            log(`  ❌ ${appName} - Not found`, 'red');
        }
    }

    if (existingApps.length === 0) {
        log('\n❌ No critical apps found! Check workspace structure.', 'red');
        return;
    }

    // Phase 2: Install dependencies for existing apps
    log('\n📦 PHASE 2: Installing dependencies...', 'magenta');
    const appsReady = [];

    for (const appName of existingApps) {
        const success = await installAppDependencies(appName);
        if (success) {
            appsReady.push(appName);
        }
    }

    // Phase 3: Start apps sequentially
    log('\n🚀 PHASE 3: Starting applications...', 'magenta');
    const runningApps = [];

    for (const appName of appsReady) {
        const port = ports[appName];
        const result = await startApp(appName, port);

        startupResults.push({
            app: appName,
            port,
            success: result.success,
            error: result.error || null
        });

        if (result.success) {
            runningApps.push({ app: appName, port, process: result.process });
            // Wait 2 seconds between starts to avoid conflicts
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Phase 4: Summary and next steps
    log('\n📊 STARTUP SUMMARY', 'bright');
    log('================', 'cyan');

    const successful = startupResults.filter(r => r.success);
    const failed = startupResults.filter(r => !r.success);

    if (successful.length > 0) {
        log(`\n✅ SUCCESSFULLY STARTED (${successful.length} apps):`, 'green');
        successful.forEach(app => {
            log(`  🟢 ${app.app.toUpperCase()} - http://localhost:${app.port}`, 'green');
        });
    }

    if (failed.length > 0) {
        log(`\n❌ FAILED TO START (${failed.length} apps):`, 'red');
        failed.forEach(app => {
            log(`  🔴 ${app.app.toUpperCase()} - ${app.error || 'Unknown error'}`, 'red');
        });
    }

    const successRate = Math.round((successful.length / CRITICAL_APPS.length) * 100);
    log(`\n🎯 SUCCESS RATE: ${successRate}% (${successful.length}/${CRITICAL_APPS.length})`,
        successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'red');

    if (successful.length > 0) {
        log('\n🎉 NEXT STEPS:', 'cyan');
        log('  1. Test the running apps in browser', 'white');
        log('  2. Verify modern UI and animations are working', 'white');
        log('  3. Fix any remaining non-critical apps', 'white');
        log('  4. Enhance features and functionality', 'white');

        // Keep processes alive
        log('\n⏳ Keeping apps running... Press Ctrl+C to stop all apps', 'yellow');

        process.on('SIGINT', () => {
            log('\n🛑 Shutting down all apps...', 'yellow');
            runningApps.forEach(({ app, process }) => {
                log(`  Stopping ${app}...`, 'yellow');
                process.kill();
            });
            process.exit(0);
        });

        // Keep the script alive
        setInterval(() => {
            // Check if processes are still running
            const aliveCount = runningApps.filter(({ process }) => !process.killed).length;
            if (aliveCount === 0) {
                log('All apps have stopped. Exiting...', 'red');
                process.exit(1);
            }
        }, 5000);
    }

    return startupResults;
}

// Run the smart startup
smartStartup().catch(console.error);
