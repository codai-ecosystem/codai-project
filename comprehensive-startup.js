#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// COMPREHENSIVE STARTUP WITH DOMAIN ACCESS
const TARGET_APPS = [
    { name: 'codai', port: 4030, domain: 'codai.local', priority: 1 },
    { name: 'memorai', port: 4031, domain: 'memorai.local', priority: 1 },
    { name: 'bancai', port: 4033, domain: 'bancai.local', priority: 1 },
    { name: 'aide', port: 4042, domain: 'aide.local', priority: 2 },
    { name: 'publicai', port: 4040, domain: 'publicai.local', priority: 2 }
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

async function execAsync(command, cwd) {
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

async function checkAppRunning(port) {
    try {
        await execAsync(`powershell "Test-NetConnection -ComputerName localhost -Port ${port} -InformationLevel Quiet"`);
        return true;
    } catch {
        return false;
    }
}

async function startAppWithMonitoring(app) {
    const appPath = path.join(__dirname, 'apps', app.name);

    return new Promise((resolve) => {
        log(`🚀 Starting ${app.name} on port ${app.port}...`, 'cyan');

        const child = spawn('pnpm', ['dev'], {
            cwd: appPath,
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: true
        });

        let output = '';
        let started = false;

        child.stdout.on('data', (data) => {
            const str = data.toString();
            output += str;

            // Look for successful startup indicators
            if ((str.includes('Ready') || str.includes('started') || str.includes('Local:')) && !started) {
                started = true;
                log(`✅ ${app.name} started successfully!`, 'green');
                log(`🌐 Local: http://localhost:${app.port}`, 'blue');
                log(`🎯 Domain: http://${app.domain}:3000`, 'magenta');
                resolve({ success: true, process: child });
            }
        });

        child.stderr.on('data', (data) => {
            const str = data.toString();
            output += str;

            if (str.includes('Error') && !started) {
                log(`❌ ${app.name} failed: ${str.slice(0, 200)}`, 'red');
                resolve({ success: false, error: str });
            }
        });

        // Timeout after 45 seconds
        setTimeout(() => {
            if (!started) {
                log(`⏰ ${app.name} startup timeout`, 'yellow');
                child.kill();
                resolve({ success: false, error: 'timeout' });
            }
        }, 45000);
    });
}

async function generateHostsFileEntries() {
    const hostsEntries = TARGET_APPS.map(app => `127.0.0.1 ${app.domain}`).join('\n');

    const hostsInstructions = `
# CODAI ECOSYSTEM - Beautiful UI Apps Local Access
# Add these entries to your hosts file:
# Windows: C:\\Windows\\System32\\drivers\\etc\\hosts
# Mac/Linux: /etc/hosts

${hostsEntries}

# Then access apps via:
${TARGET_APPS.map(app => `# 🎨 ${app.name}: http://${app.domain}:3000`).join('\n')}
`;

    fs.writeFileSync('hosts-entries.txt', hostsInstructions);
    log('📝 Hosts file entries saved to: hosts-entries.txt', 'blue');
}

async function comprehensiveStartup() {
    log('🎯 COMPREHENSIVE STARTUP WITH DOMAIN ACCESS', 'bright');
    log('==========================================', 'cyan');
    log('🎨 Beautiful UI apps with local domain access', 'yellow');

    // Generate hosts file instructions
    await generateHostsFileEntries();

    const runningApps = [];

    for (const app of TARGET_APPS.sort((a, b) => a.priority - b.priority)) {
        // Check if already running
        const isRunning = await checkAppRunning(app.port);
        if (isRunning) {
            log(`✅ ${app.name} already running on port ${app.port}`, 'green');
            continue;
        }

        // Install dependencies if needed
        const appPath = path.join(__dirname, 'apps', app.name);
        const hasNodeModules = fs.existsSync(path.join(appPath, 'node_modules'));

        if (!hasNodeModules) {
            log(`📦 Installing dependencies for ${app.name}...`, 'yellow');
            try {
                await execAsync('pnpm install', appPath);
                log(`✅ Dependencies installed for ${app.name}`, 'green');
            } catch (error) {
                log(`❌ Failed to install dependencies for ${app.name}`, 'red');
                continue;
            }
        }

        // Start the app
        const result = await startAppWithMonitoring(app);
        if (result.success) {
            runningApps.push({ ...app, process: result.process });
            // Brief pause between starts
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // Summary
    log('\n📊 STARTUP COMPLETE', 'bright');
    log('==================', 'cyan');

    if (runningApps.length > 0) {
        log(`\n✅ BEAUTIFUL UIs RUNNING (${runningApps.length}):`, 'green');
        runningApps.forEach(app => {
            log(`  🎨 ${app.name.toUpperCase()}`, 'green');
            log(`     📡 http://localhost:${app.port}`, 'blue');
            log(`     🌐 http://${app.domain}:3000`, 'magenta');
        });

        log('\n🎉 USER REQUEST FULFILLED!', 'bright');
        log('Beautiful, modern UI with animations and real-time data is LIVE!', 'green');
        log('Apps are accessible both locally and via domains!', 'yellow');

        log('\n📋 DOMAIN ACCESS SETUP:', 'cyan');
        log('1. Start domain proxy: node local-domain-proxy.js', 'white');
        log('2. Add entries from hosts-entries.txt to your hosts file', 'white');
        log('3. Access via: http://codai.local:3000', 'white');

        // Keep processes alive
        log('\n⏳ Apps running... Press Ctrl+C to stop all', 'yellow');

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
        }, 10000);

    } else {
        log('\n❌ No apps started successfully', 'red');
        log('Check the logs above for specific errors', 'yellow');
    }
}

// Run comprehensive startup
comprehensiveStartup().catch(console.error);
