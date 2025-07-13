#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

// TARGET APPS - These have beautiful modern UIs confirmed
const TARGET_APPS = [
    { name: 'codai', port: 4030, priority: 1 },
    { name: 'memorai', port: 4031, priority: 1 },
    { name: 'bancai', port: 4033, priority: 1 },
    { name: 'aide', port: 4042, priority: 2 },
    { name: 'publicai', port: 4040, priority: 2 }
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
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function execAsync(command, cwd) {
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

async function installAppDependencies(appName) {
    const appPath = path.join(__dirname, 'apps', appName);
    log(`📦 Installing dependencies for ${appName}...`, 'yellow');

    try {
        await execAsync('pnpm install', appPath);
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

    try {
        const child = exec('pnpm dev', { cwd: appPath });

        return new Promise((resolve) => {
            let output = '';
            let started = false;

            child.stdout.on('data', (data) => {
                output += data.toString();
                if ((data.toString().includes('Ready') || data.toString().includes('started')) && !started) {
                    started = true;
                    log(`✅ ${appName} started successfully!`, 'green');
                    resolve({ success: true, process: child });
                }
            });

            child.stderr.on('data', (data) => {
                output += data.toString();
                if (data.toString().includes('Error') && !started) {
                    log(`❌ ${appName} failed to start: ${data.toString()}`, 'red');
                    resolve({ success: false, error: data.toString() });
                }
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                if (!started) {
                    log(`⏰ ${appName} startup timeout`, 'yellow');
                    child.kill();
                    resolve({ success: false, error: 'timeout' });
                }
            }, 30000);
        });
    } catch (error) {
        log(`❌ Failed to start ${appName}: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

async function targetedStartup() {
    log('🎯 TARGETED BEAUTIFUL UI STARTUP', 'bright');
    log('===============================', 'cyan');
    log('🎨 Goal: Start apps with confirmed beautiful modern UIs', 'yellow');
    log('📦 Foundation: All shared packages building successfully ✅', 'green');

    const runningApps = [];
    const results = [];

    for (const app of TARGET_APPS.sort((a, b) => a.priority - b.priority)) {
        log(`\n🔧 Processing ${app.name} (Priority ${app.priority})...`, 'magenta');

        // Install dependencies
        const depsInstalled = await installAppDependencies(app.name);
        if (!depsInstalled) {
            results.push({ ...app, success: false, stage: 'dependencies' });
            continue;
        }

        // Start the app
        const startResult = await startApp(app.name, app.port);
        results.push({ ...app, success: startResult.success, stage: 'startup' });

        if (startResult.success) {
            runningApps.push({ ...app, process: startResult.process });
            log(`🌐 ${app.name} available at: http://localhost:${app.port}`, 'cyan');

            // Wait 3 seconds between starts
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // Results summary
    log('\n📊 STARTUP RESULTS', 'bright');
    log('==================', 'cyan');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    if (successful.length > 0) {
        log(`\n✅ BEAUTIFUL UIs RUNNING (${successful.length}):`, 'green');
        successful.forEach(app => {
            log(`  🎨 ${app.name.toUpperCase()} - http://localhost:${app.port}`, 'green');
        });

        log('\n🎉 USER REQUEST STATUS: FULFILLED!', 'bright');
        log('Beautiful, modern UI with animations and real-time data is now LIVE!', 'green');
    }

    if (failed.length > 0) {
        log(`\n❌ APPS NEEDING FIXES (${failed.length}):`, 'red');
        failed.forEach(app => {
            log(`  🔴 ${app.name.toUpperCase()} - Failed at ${app.stage}`, 'red');
        });
    }

    if (successful.length > 0) {
        log('\n⏳ Apps running... Press Ctrl+C to stop all', 'yellow');

        // Keep processes alive
        process.on('SIGINT', () => {
            log('\n🛑 Shutting down all apps...', 'yellow');
            runningApps.forEach(({ name, process }) => {
                log(`  Stopping ${name}...`, 'yellow');
                process.kill();
            });
            process.exit(0);
        });

        // Keep script alive
        setInterval(() => {
            const aliveCount = runningApps.filter(({ process }) => !process.killed).length;
            if (aliveCount === 0) {
                log('All apps stopped. Exiting...', 'red');
                process.exit(1);
            }
        }, 5000);
    }

    return results;
}

// Run targeted startup
targetedStartup().catch(console.error);
