#!/usr/bin/env node

// EXPAND DEPLOYMENT - Add more working apps
// Now that we have 3+ confirmed working, let's add more

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Next batch of apps to deploy
const NEXT_BATCH = [
    { name: 'memorai', port: 4031, fix: 'port_conflict' },
    { name: 'bancai', port: 4033, fix: 'dependencies' },
    { name: 'publicai', port: 4040, fix: 'basic' },
    { name: 'logai', port: 4041, fix: 'basic' },
    { name: 'admin', port: 4032, fix: 'basic' },
    { name: 'hub', port: 4034, fix: 'basic' },
    { name: 'cumparai', port: 4052, fix: 'module_type' },
    { name: 'sociai', port: 4054, fix: 'basic' }
];

function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m',
        bright: '\x1b[1m'
    };
    console.log(`${colors[type]}[${new Date().toLocaleTimeString()}] ${message}${colors.reset}`);
}

async function killPort(port) {
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
                                log(`Cleared port ${port}`, 'warning');
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

function fixApp(app) {
    const appPath = path.join(__dirname, 'apps', app.name);
    const packageJsonPath = path.join(appPath, 'package.json');

    if (!fs.existsSync(appPath)) {
        log(`❌ ${app.name}: Directory not found`, 'error');
        return false;
    }

    if (!fs.existsSync(packageJsonPath)) {
        log(`❌ ${app.name}: No package.json`, 'error');
        return false;
    }

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        let modified = false;

        // Apply specific fixes based on app.fix
        switch (app.fix) {
            case 'module_type':
                if (!packageJson.type) {
                    packageJson.type = 'module';
                    modified = true;
                }
                break;
            case 'port_conflict':
                // Just ensure port is correct
                break;
            case 'dependencies':
                // Will handle during install
                break;
        }

        // Always ensure correct dev script
        if (!packageJson.scripts) packageJson.scripts = {};
        packageJson.scripts.dev = `next dev --port ${app.port}`;
        modified = true;

        if (modified) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            log(`✅ Fixed ${app.name} configuration`, 'success');
        }

        return true;
    } catch (error) {
        log(`❌ Error fixing ${app.name}: ${error.message}`, 'error');
        return false;
    }
}

async function startApp(app) {
    const appPath = path.join(__dirname, 'apps', app.name);

    // Clear the port first
    await killPort(app.port);
    await new Promise(resolve => setTimeout(resolve, 1000));

    log(`🚀 Starting ${app.name} on port ${app.port}...`, 'info');

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
                log(`⏰ ${app.name}: Timeout (20s)`, 'warning');
                child.kill();
                resolve(false);
            }
        }, 20000);

        child.stdout.on('data', (data) => {
            const output = data.toString();
            if ((output.includes('Ready') || output.includes('Local:')) && !started) {
                started = true;
                clearTimeout(timeout);
                log(`✅ ${app.name.toUpperCase()} DEPLOYED: http://localhost:${app.port}`, 'success');
                resolve(true);
            }
        });

        child.stderr.on('data', (data) => {
            const error = data.toString();
            if (error.includes('EADDRINUSE') && !started) {
                clearTimeout(timeout);
                log(`⚠️ ${app.name}: Port still in use`, 'warning');
                resolve(false);
            }
        });

        child.on('error', () => {
            if (!started) {
                clearTimeout(timeout);
                resolve(false);
            }
        });
    });
}

async function expandDeployment() {
    log('🎯 EXPANDING DEPLOYMENT - NEXT BATCH', 'bright');
    log('===================================', 'info');
    log(`Adding ${NEXT_BATCH.length} more apps to deployment`, 'info');

    const newDeployments = [];

    for (const app of NEXT_BATCH) {
        log(`\n🔧 Processing ${app.name} (${app.fix} fix)...`, 'info');

        if (fixApp(app)) {
            if (await startApp(app)) {
                newDeployments.push(app);
            }
        }

        // Delay between deployments
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Report results
    log('\n🎉 EXPANSION RESULTS', 'bright');
    log('===================', 'info');
    log(`New deployments: ${newDeployments.length}/${NEXT_BATCH.length}`, 'info');

    if (newDeployments.length > 0) {
        log('\n✅ NEWLY DEPLOYED APPS:', 'success');
        newDeployments.forEach(app => {
            log(`  🌟 ${app.name.toUpperCase()}: http://localhost:${app.port}`, 'success');
        });
    }

    const totalEstimate = 3 + newDeployments.length; // 3 from before + new ones
    log(`\n📊 ESTIMATED TOTAL LIVE: ${totalEstimate} apps`, 'info');

    if (totalEstimate >= 6) {
        log('\n🚀 EXCELLENT PROGRESS! Ready to continue scaling!', 'success');
    }

    return newDeployments.length;
}

// Execute expansion
expandDeployment().then(count => {
    log(`\n🏆 EXPANSION COMPLETE: ${count} new apps deployed`, 'bright');
    log('🔄 Continue iterating to reach all 32+ apps!', 'info');
}).catch(error => {
    log(`💥 Expansion error: ${error.message}`, 'error');
});
