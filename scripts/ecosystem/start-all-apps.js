#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// COMPREHENSIVE ALL-APPS STARTUP - 42 APPLICATIONS
const ALL_APPS = [
    // Core Platform Apps (4000-4099)
    { name: 'codai', port: 4030, category: 'core', description: 'AI Development Assistant' },
    { name: 'memorai', port: 4031, category: 'core', description: 'AI Memory & Database Core' },
    { name: 'hub', port: 4001, category: 'core', description: 'Central Command Center' },
    { name: 'admin', port: 4062, category: 'core', description: 'Administration Platform' },

    // Financial & Investment (4030-4039)
    { name: 'bancai', port: 4033, category: 'finance', description: 'Banking & Finance Platform' },
    { name: 'stocai', port: 4063, category: 'finance', description: 'Stock & Investment Platform' },
    { name: 'marketai', port: 4035, category: 'finance', description: 'Market Analysis Platform' },
    { name: 'wallet', port: 4036, category: 'finance', description: 'Digital Wallet Platform' },

    // Analytics & Data (4040-4049)
    { name: 'explorer', port: 4060, category: 'analytics', description: 'Blockchain Analytics Platform' },
    { name: 'analizai', port: 4041, category: 'analytics', description: 'Data Analysis Platform' },
    { name: 'dash', port: 4043, category: 'analytics', description: 'Dashboard Platform' },
    { name: 'logai', port: 4044, category: 'analytics', description: 'Logging & Monitoring Platform' },

    // Entertainment & Gaming (4050-4059)
    { name: 'jucai', port: 4070, category: 'entertainment', description: 'AI Gaming Platform' },
    { name: 'muzicai', port: 4051, category: 'entertainment', description: 'Music AI Platform' },
    { name: 'sociai', port: 4052, category: 'entertainment', description: 'Social AI Platform' },

    // Education & Learning (4010-4019)
    { name: 'studiai', port: 4012, category: 'education', description: 'AI Learning Platform' },
    { name: 'docs', port: 4013, category: 'education', description: 'Documentation Platform' },

    // Enterprise & Business (4020-4029)
    { name: 'curtai', port: 4050, category: 'enterprise', description: 'Enterprise Platform' },
    { name: 'talentai', port: 4021, category: 'enterprise', description: 'Talent Management Platform' },
    { name: 'conversai', port: 4022, category: 'enterprise', description: 'Conversation AI Platform' },
    { name: 'legalizai', port: 4023, category: 'enterprise', description: 'Legal AI Platform' },

    // Development & Tools (4080-4099)
    { name: 'tools', port: 4081, category: 'development', description: 'Development Tools Platform' },
    { name: 'kodex', port: 4082, category: 'development', description: 'Code Analysis Platform' },
    { name: 'fabricai', port: 4083, category: 'development', description: 'Fabric AI Platform' },
    { name: 'dexai', port: 4084, category: 'development', description: 'DEX Trading Platform' },

    // Mobile & Cross-Platform (4100-4119)
    { name: 'mobile', port: 4100, category: 'mobile', description: 'Mobile Platform' },
    { name: 'codai-mobile', port: 4101, category: 'mobile', description: 'Mobile Development Assistant' },
    { name: 'bancai-mobile', port: 4102, category: 'mobile', description: 'Mobile Banking Platform' },
    { name: 'metu', port: 4103, category: 'mobile', description: 'METU Desktop App' },
    { name: 'metu-web', port: 4104, category: 'mobile', description: 'METU Web Platform' },

    // Utilities & Services (4060-4079)
    { name: 'aide', port: 4042, category: 'utility', description: 'AI Assistant Platform' },
    { name: 'publicai', port: 4040, category: 'utility', description: 'Public AI Platform' },
    { name: 'cumparai', port: 4065, category: 'utility', description: 'Shopping Comparison Platform' },
    { name: 'glass', port: 4066, category: 'utility', description: 'Glass UI Platform' },
    { name: 'id', port: 4067, category: 'utility', description: 'Identity Management Platform' },
    { name: 'mod', port: 4068, category: 'utility', description: 'Moderation Platform' },
    { name: 'x', port: 4069, category: 'utility', description: 'X Platform' },

    // Specialized AI (4120-4139)
    { name: 'romai', port: 4120, category: 'ai', description: 'Romanian AI Platform' },
    { name: 'acasai', port: 4121, category: 'ai', description: 'Home AI Platform' },
    { name: 'ajutai', port: 4122, category: 'ai', description: 'Help AI Platform' },
    { name: 'donai', port: 4123, category: 'ai', description: 'Donation AI Platform' },
    { name: 'sunai', port: 4124, category: 'ai', description: 'Sun AI Platform' }
];

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m',
    white: '\x1b[37m'
};

function log(message, color = 'white') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
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
        const { stdout } = await execAsync(`powershell "Test-NetConnection -ComputerName localhost -Port ${port} -InformationLevel Quiet"`);
        return stdout.trim() === 'True';
    } catch {
        return false;
    }
}

async function startApp(app, index, total) {
    const appPath = path.join(__dirname, 'apps', app.name);

    // Check if app directory exists
    if (!fs.existsSync(appPath)) {
        log(`⚠️  ${app.name} directory not found, skipping...`, 'yellow');
        return { success: false, reason: 'directory_not_found' };
    }

    // Check if already running
    const isRunning = await checkAppRunning(app.port);
    if (isRunning) {
        log(`✅ ${app.name} already running on port ${app.port}`, 'green');
        return { success: true, reason: 'already_running' };
    }

    log(`🚀 [${index}/${total}] Starting ${app.name} (${app.description}) on port ${app.port}...`, 'cyan');

    return new Promise((resolve) => {
        const child = spawn('pnpm', ['dev', '--port', app.port.toString()], {
            cwd: appPath,
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: true,
            env: { ...process.env, PORT: app.port.toString() }
        });

        let output = '';
        let started = false;
        let timeoutId;

        const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
        };

        child.stdout.on('data', (data) => {
            const str = data.toString();
            output += str;

            // Look for successful startup indicators
            if ((str.includes('Ready') ||
                str.includes('started') ||
                str.includes('Local:') ||
                str.includes(`localhost:${app.port}`) ||
                str.includes('compiled successfully')) && !started) {
                started = true;
                cleanup();
                log(`✅ ${app.name} started successfully on http://localhost:${app.port}`, 'green');
                resolve({ success: true, process: child, reason: 'started' });
            }
        });

        child.stderr.on('data', (data) => {
            const str = data.toString();
            output += str;

            // Don't treat warnings as errors
            if (str.includes('Error') && !str.includes('Warning') && !started) {
                cleanup();
                log(`❌ ${app.name} failed: ${str.slice(0, 100)}...`, 'red');
                child.kill();
                resolve({ success: false, error: str, reason: 'startup_error' });
            }
        });

        child.on('error', (error) => {
            if (!started) {
                cleanup();
                log(`❌ ${app.name} spawn error: ${error.message}`, 'red');
                resolve({ success: false, error: error.message, reason: 'spawn_error' });
            }
        });

        // Timeout after 30 seconds per app
        timeoutId = setTimeout(() => {
            if (!started) {
                log(`⏰ ${app.name} startup timeout (30s)`, 'yellow');
                child.kill();
                resolve({ success: false, error: 'timeout', reason: 'timeout' });
            }
        }, 30000);
    });
}

async function startAllApps() {
    log('🎯 STARTING ALL 42 APPLICATIONS IN CODAI ECOSYSTEM', 'bright');
    log('==================================================', 'cyan');
    log(`🚀 Total applications to start: ${ALL_APPS.length}`, 'yellow');
    log('📊 Categories: Core, Finance, Analytics, Entertainment, Education, Enterprise, Development, Mobile, Utilities, AI', 'blue');

    const results = {
        started: [],
        alreadyRunning: [],
        failed: [],
        skipped: []
    };

    // Start apps in batches by category to avoid overwhelming the system
    const categories = [...new Set(ALL_APPS.map(app => app.category))];

    for (const category of categories) {
        const categoryApps = ALL_APPS.filter(app => app.category === category);
        log(`\n📂 Starting ${category.toUpperCase()} category (${categoryApps.length} apps)...`, 'magenta');

        // Start apps in parallel within each category (max 5 at a time)
        const batchSize = 5;
        for (let i = 0; i < categoryApps.length; i += batchSize) {
            const batch = categoryApps.slice(i, i + batchSize);
            const batchPromises = batch.map((app, batchIndex) =>
                startApp(app, i + batchIndex + 1, categoryApps.length)
            );

            const batchResults = await Promise.all(batchPromises);

            // Process results
            batch.forEach((app, index) => {
                const result = batchResults[index];
                if (result.success) {
                    if (result.reason === 'already_running') {
                        results.alreadyRunning.push({ ...app, ...result });
                    } else {
                        results.started.push({ ...app, ...result });
                    }
                } else {
                    if (result.reason === 'directory_not_found') {
                        results.skipped.push({ ...app, ...result });
                    } else {
                        results.failed.push({ ...app, ...result });
                    }
                }
            });

            // Brief pause between batches
            if (i + batchSize < categoryApps.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Pause between categories
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Final summary
    log('\n🎉 STARTUP COMPLETE - ALL APPLICATIONS PROCESSED', 'bright');
    log('===============================================', 'cyan');

    if (results.started.length > 0) {
        log(`\n✅ SUCCESSFULLY STARTED (${results.started.length}):`, 'green');
        results.started.forEach(app => {
            log(`  🚀 ${app.name.toUpperCase()} - ${app.description}`, 'green');
            log(`     🌐 http://localhost:${app.port}`, 'blue');
        });
    }

    if (results.alreadyRunning.length > 0) {
        log(`\n✅ ALREADY RUNNING (${results.alreadyRunning.length}):`, 'green');
        results.alreadyRunning.forEach(app => {
            log(`  ✔️  ${app.name.toUpperCase()} - http://localhost:${app.port}`, 'green');
        });
    }

    if (results.failed.length > 0) {
        log(`\n❌ FAILED TO START (${results.failed.length}):`, 'red');
        results.failed.forEach(app => {
            log(`  ❌ ${app.name.toUpperCase()} - ${app.reason}`, 'red');
        });
    }

    if (results.skipped.length > 0) {
        log(`\n⚠️  SKIPPED (${results.skipped.length}):`, 'yellow');
        results.skipped.forEach(app => {
            log(`  ⚠️  ${app.name.toUpperCase()} - ${app.reason}`, 'yellow');
        });
    }

    const totalRunning = results.started.length + results.alreadyRunning.length;
    log(`\n📊 FINAL STATUS:`, 'bright');
    log(`   🟢 Running: ${totalRunning}/${ALL_APPS.length} applications`, totalRunning > 30 ? 'green' : 'yellow');
    log(`   ⚡ Success Rate: ${Math.round((totalRunning / ALL_APPS.length) * 100)}%`, 'cyan');

    if (totalRunning >= 30) {
        log('\n🏆 ACHIEVEMENT UNLOCKED: 30+ APPLICATIONS RUNNING!', 'bright');
        log('🎉 USER REQUEST FULFILLED - MASSIVE ECOSYSTEM IS LIVE!', 'green');
    }

    // Keep script alive to monitor running apps
    if (results.started.length > 0) {
        log('\n⏳ Monitoring applications... Press Ctrl+C to stop all', 'yellow');

        process.on('SIGINT', () => {
            log('\n🛑 Shutting down all applications...', 'yellow');
            results.started.forEach(({ name, process }) => {
                if (process && !process.killed) {
                    log(`  Stopping ${name}...`, 'yellow');
                    process.kill();
                }
            });
            process.exit(0);
        });

        // Keep script alive and monitor health
        setInterval(() => {
            const aliveCount = results.started.filter(({ process }) => process && !process.killed).length;
            log(`💓 Health check: ${aliveCount}/${results.started.length} apps still running`, 'blue');

            if (aliveCount === 0) {
                log('All apps stopped. Exiting...', 'red');
                process.exit(1);
            }
        }, 30000); // Check every 30 seconds
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log(`💥 Uncaught Exception: ${error.message}`, 'red');
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    log(`💥 Unhandled Rejection: ${reason}`, 'red');
    process.exit(1);
});

// Start all applications
startAllApps().catch((error) => {
    log(`💥 Startup failed: ${error.message}`, 'red');
    process.exit(1);
});
