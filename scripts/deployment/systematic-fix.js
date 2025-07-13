#!/usr/bin/env node

// SYSTEMATIC ISSUE RESOLVER
// Fix specific issues we can see in the logs

const fs = require('fs');
const path = require('path');

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

// Fix CUMPARAI module type issue
function fixCumparai() {
    const packageJsonPath = path.join(__dirname, 'apps', 'cumparai', 'package.json');

    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            packageJson.type = 'module';
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            log('✅ Fixed CUMPARAI module type', 'success');
            return true;
        } catch (error) {
            log(`❌ Error fixing CUMPARAI: ${error.message}`, 'error');
            return false;
        }
    }
    return false;
}

// Fix TOOLS module type issue  
function fixTools() {
    const packageJsonPath = path.join(__dirname, 'apps', 'tools', 'package.json');

    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            packageJson.type = 'module';
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            log('✅ Fixed TOOLS module type', 'success');
            return true;
        } catch (error) {
            log(`❌ Error fixing TOOLS: ${error.message}`, 'error');
            return false;
        }
    }
    return false;
}

// Fix STUDIAI package.json issues
function fixStudiai() {
    const packageJsonPath = path.join(__dirname, 'apps', 'studiai', 'package.json');

    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            // Ensure basic structure
            if (!packageJson.scripts) packageJson.scripts = {};
            packageJson.scripts.dev = 'next dev --port 4053';
            packageJson.scripts.build = 'next build';
            packageJson.scripts.start = 'next start --port 4053';

            // Add basic dependencies if missing
            if (!packageJson.dependencies) packageJson.dependencies = {};
            if (!packageJson.dependencies.next) {
                packageJson.dependencies.next = '^15.1.0';
                packageJson.dependencies.react = '^19.0.0';
                packageJson.dependencies['react-dom'] = '^19.0.0';
            }

            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            log('✅ Fixed STUDIAI configuration', 'success');
            return true;
        } catch (error) {
            log(`❌ Error fixing STUDIAI: ${error.message}`, 'error');
            return false;
        }
    }
    return false;
}

// Check and fix BANCAI dependencies
function fixBancai() {
    const packageJsonPath = path.join(__dirname, 'apps', 'bancai', 'package.json');

    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            // Ensure Next.js is properly configured
            packageJson.scripts.dev = 'next dev --port 4033';

            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            log('✅ Fixed BANCAI scripts', 'success');
            return true;
        } catch (error) {
            log(`❌ Error fixing BANCAI: ${error.message}`, 'error');
            return false;
        }
    }
    return false;
}

// Kill process on MEMORAI port
async function fixMemoraiPort() {
    return new Promise((resolve) => {
        const { exec } = require('child_process');

        log('🔧 Fixing MEMORAI port conflict...', 'warning');

        exec('netstat -ano | findstr :4031', (error, stdout) => {
            if (stdout) {
                const lines = stdout.split('\n');
                for (const line of lines) {
                    if (line.includes('LISTENING')) {
                        const parts = line.trim().split(/\s+/);
                        const pid = parts[parts.length - 1];
                        if (pid && pid !== '0') {
                            exec(`taskkill /F /PID ${pid}`, () => {
                                log('✅ Killed process on port 4031', 'success');
                                resolve(true);
                            });
                            return;
                        }
                    }
                }
            }
            resolve(false);
        });
    });
}

async function systematicFix() {
    log('🔧 SYSTEMATIC ISSUE RESOLVER', 'bright');
    log('============================', 'info');

    const fixes = [];

    // Apply fixes
    if (fixCumparai()) fixes.push('CUMPARAI module type');
    if (fixTools()) fixes.push('TOOLS module type');
    if (fixStudiai()) fixes.push('STUDIAI configuration');
    if (fixBancai()) fixes.push('BANCAI scripts');

    // Fix port conflict
    if (await fixMemoraiPort()) fixes.push('MEMORAI port conflict');

    log('\n📊 FIXES APPLIED:', 'success');
    fixes.forEach(fix => log(`  ✅ ${fix}`, 'success'));

    log('\n🔄 Fixes complete! Apps should start properly now.', 'info');
    log('🚀 Use VS Code tasks or pnpm dev to restart apps.', 'info');

    return fixes.length;
}

// Execute fixes
systematicFix().then(count => {
    log(`\n🏆 APPLIED ${count} FIXES!`, 'bright');
    log('Ready to continue deployment!', 'success');
}).catch(error => {
    log(`💥 Error applying fixes: ${error.message}`, 'error');
});
