#!/usr/bin/env node

// RAPID DEPLOYMENT SCRIPT - ALL APPS
// Simple, robust deployment without complex orchestration

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const APPS = [
    'codai', 'memorai', 'bancai', 'publicai', 'logai',
    'tools', 'admin', 'hub', 'explorer', 'dash',
    'stocai', 'cumparai', 'marketai', 'wallet', 'fabricai',
    'studiai', 'sociai', 'talentai', 'muzicai', 'sunai',
    'legalizai', 'curtai', 'ajutai', 'analizai', 'dexai',
    'mod', 'mobile', 'x', 'id', 'kodex', 'jucai', 'docs'
];

const BASE_PORT = 4030;

function log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

function fixApp(appName, port) {
    const appPath = path.join(__dirname, 'apps', appName);

    if (!fs.existsSync(appPath)) {
        log(`❌ ${appName}: Directory not found`);
        return false;
    }

    try {
        // Fix package.json
        const packageJsonPath = path.join(appPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            // Add type module if needed
            if (fs.existsSync(path.join(appPath, 'next.config.js'))) {
                const config = fs.readFileSync(path.join(appPath, 'next.config.js'), 'utf8');
                if (config.includes('export default') && !pkg.type) {
                    pkg.type = 'module';
                }
            }

            // Fix dev script
            if (!pkg.scripts) pkg.scripts = {};
            pkg.scripts.dev = `next dev --port ${port}`;

            fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
            log(`✅ ${appName}: Fixed package.json`);
        }

        // Install dependencies
        try {
            execSync('pnpm install', { cwd: appPath, stdio: 'pipe', timeout: 30000 });
            log(`✅ ${appName}: Dependencies installed`);
        } catch (error) {
            log(`⚠️ ${appName}: Dependencies may have issues`);
        }

        return true;
    } catch (error) {
        log(`❌ ${appName}: Error - ${error.message}`);
        return false;
    }
}

function main() {
    log('🚀 RAPID DEPLOYMENT - FIXING ALL APPS');
    log('=====================================');

    let fixed = 0;

    APPS.forEach((app, index) => {
        const port = BASE_PORT + index;
        log(`🔧 Processing ${app} (port ${port})...`);

        if (fixApp(app, port)) {
            fixed++;
        }
    });

    log(`\n📊 RESULTS: ${fixed}/${APPS.length} apps processed`);
    log('\n🚀 NEXT: Run "pnpm dev" to start all apps');
    log('🌍 THEN: Run "node deploy-production-domains.js" for production');

    // Create start commands
    const startCommands = APPS.map((app, index) => {
        const port = BASE_PORT + index;
        return `echo "Starting ${app}..." && cd apps/${app} && pnpm dev --port ${port}`;
    }).join(' && ');

    fs.writeFileSync('start-all-apps.bat', startCommands);
    log('📝 Created start-all-apps.bat');
}

main();
