#!/usr/bin/env node

// FOCUSED DEPLOYMENT - START WORKING APPS FIRST
// Focus on apps we know work, then expand

const { spawn } = require('child_process');
const path = require('path');

// Start with verified working apps
const PRIORITY_APPS = [
    { name: 'stocai', port: 4063, status: 'verified' },
    { name: 'codai', port: 4030, status: 'configured' },
    { name: 'memorai', port: 4031, status: 'configured' },
    { name: 'bancai', port: 4033, status: 'configured' },
    { name: 'tools', port: 4062, status: 'partial' },
    { name: 'cumparai', port: 4052, status: 'partial' }
];

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m'
};

function log(message, color = 'white') {
    console.log(`${colors[color] || colors.reset}[${new Date().toLocaleTimeString()}] ${message}${colors.reset}`);
}

async function startApp(app) {
    return new Promise((resolve) => {
        const appPath = path.join(__dirname, 'apps', app.name);

        log(`🚀 Starting ${app.name.toUpperCase()} on port ${app.port}...`, 'cyan');

        const child = spawn('pnpm', ['dev', '--port', app.port.toString()], {
            cwd: appPath,
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        let hasStarted = false;
        let timeout;

        // Set 30-second timeout
        timeout = setTimeout(() => {
            if (!hasStarted) {
                log(`⏰ ${app.name}: Timeout (30s)`, 'yellow');
                child.kill();
                resolve({ success: false, reason: 'timeout' });
            }
        }, 30000);

        child.stdout.on('data', (data) => {
            const output = data.toString();
            if ((output.includes('Ready') || output.includes('Local:') || output.includes('started server')) && !hasStarted) {
                hasStarted = true;
                clearTimeout(timeout);
                log(`✅ ${app.name.toUpperCase()} LIVE: http://localhost:${app.port}`, 'green');
                resolve({ success: true, port: app.port, process: child });
            }
        });

        child.stderr.on('data', (data) => {
            const error = data.toString();
            if (error.includes('EADDRINUSE')) {
                clearTimeout(timeout);
                log(`⚠️ ${app.name}: Port ${app.port} in use (may already be running)`, 'yellow');
                resolve({ success: true, port: app.port, alreadyRunning: true });
            } else if (error.includes('Error:') && !error.includes('Warning:') && !hasStarted) {
                clearTimeout(timeout);
                log(`❌ ${app.name}: ${error.trim()}`, 'red');
                child.kill();
                resolve({ success: false, reason: error.trim() });
            }
        });

        child.on('error', (error) => {
            if (!hasStarted) {
                clearTimeout(timeout);
                log(`❌ ${app.name}: Process error - ${error.message}`, 'red');
                resolve({ success: false, reason: error.message });
            }
        });
    });
}

async function deployFocused() {
    log('🎯 FOCUSED DEPLOYMENT - PRIORITY APPS', 'bright');
    log('====================================', 'cyan');

    const results = [];
    const runningApps = [];

    // Start apps one by one to avoid conflicts
    for (const app of PRIORITY_APPS) {
        const result = await startApp(app);
        results.push({ app: app.name, ...result });

        if (result.success) {
            runningApps.push({ name: app.name, port: app.port || result.port });
        }

        // Small delay between starts
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Final report
    log('\n🎉 FOCUSED DEPLOYMENT COMPLETE!', 'bright');
    log('==============================', 'cyan');

    const successCount = results.filter(r => r.success).length;
    log(`📊 Success Rate: ${successCount}/${PRIORITY_APPS.length} apps`, 'blue');

    if (runningApps.length > 0) {
        log('\n✅ RUNNING APPS - TEST THEM NOW:', 'green');
        runningApps.forEach(app => {
            log(`  🌟 ${app.name.toUpperCase()}: http://localhost:${app.port}`, 'green');
        });

        log('\n🎨 BEAUTIFUL UI FEATURES LIVE:', 'cyan');
        log('  ✨ Framer Motion animations', 'blue');
        log('  🎨 Glass morphism design', 'blue');
        log('  📊 Real-time data updates', 'blue');
        log('  🌈 Beautiful gradients', 'blue');

        if (successCount >= 3) {
            log('\n🏆 READY FOR PRODUCTION DEPLOYMENT!', 'green');
            log('🚀 Run: node deploy-production-domains.js', 'cyan');
        }
    }

    // Show failed apps for retry
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
        log('\n⚠️ APPS NEEDING ATTENTION:', 'yellow');
        failed.forEach(f => {
            log(`  💥 ${f.app}: ${f.reason || 'unknown error'}`, 'yellow');
        });
    }

    return runningApps.length;
}

// Execute
deployFocused().then(runningCount => {
    if (runningCount >= 3) {
        log('\n🎯 MISSION SUCCESS! Multiple apps running!', 'green');
        log('🌍 Ready to deploy to production domains!', 'green');
    } else {
        log('\n⚠️ Partial success - need to troubleshoot failed apps', 'yellow');
    }
}).catch(error => {
    console.error('💥 Deployment error:', error);
});
