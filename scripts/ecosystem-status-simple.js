#!/usr/bin/env node

/**
 * Codai Ecosystem Status Script (Simple Version)
 * Provides comprehensive status of the ecosystem
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');
const SERVICES_DIR = join(PROJECT_ROOT, 'services');
const APPS_DIR = join(PROJECT_ROOT, 'apps');

const SERVICES = {
    codai: { port: 3000, priority: 1, description: 'Central Platform & AIDE Hub' },
    memorai: { port: 3001, priority: 1, description: 'AI Memory & Database Core' },
    logai: { port: 3002, priority: 1, description: 'Identity & Authentication Hub' },
    bancai: { port: 3003, priority: 2, description: 'Financial Platform' },
    wallet: { port: 3004, priority: 2, description: 'Programmable Wallet' },
    fabricai: { port: 3005, priority: 2, description: 'AI Services Platform' },
    studiai: { port: 3006, priority: 3, description: 'AI Education Platform' },
    sociai: { port: 3007, priority: 3, description: 'AI Social Platform' },
    cumparai: { port: 3008, priority: 3, description: 'AI Shopping Platform' },
    publicai: { port: 3009, priority: 4, description: 'Civic AI & Transparency Tools' },
    x: { port: 3010, priority: 4, description: 'AI Trading Platform' }
};

function main() {
    console.clear();
    console.log('================================================================================');
    console.log('                          CODAI ECOSYSTEM STATUS v2.0                          ');
    console.log('================================================================================');

    // Check architecture
    const hasServices = existsSync(SERVICES_DIR);
    const hasApps = existsSync(APPS_DIR);

    console.log('\n📊 Architecture Status:');
    if (hasServices && hasApps) {
        console.log('⚠️  Hybrid Architecture (Migration Available)');
        console.log('   Both apps/ and services/ directories found');
        console.log('   Run "npm run setup" to migrate to v2.0');
    } else if (hasServices) {
        console.log('✅ V2.0 Architecture (Services + Submodules)');
    } else if (hasApps) {
        console.log('ℹ️  V1.0 Architecture (Apps + Subtrees)');
        console.log('   Consider upgrading to v2.0 for better workflow');
    } else {
        console.log('❌ No Services Found');
        console.log('   Run "npm run setup" to initialize');
    }

    // Check services
    console.log('\n🏗️ Services Status:');
    let servicesInServices = 0;
    let servicesInApps = 0;
    const totalServices = Object.keys(SERVICES).length;

    Object.entries(SERVICES).forEach(([name, config]) => {
        const inServices = hasServices && existsSync(join(SERVICES_DIR, name));
        const inApps = hasApps && existsSync(join(APPS_DIR, name));

        if (inServices) servicesInServices++;
        if (inApps) servicesInApps++;

        const location = inServices ? 'services/' : (inApps ? 'apps/' : 'missing');
        const icon = inServices ? '🟢' : (inApps ? '🟡' : '🔴');

        console.log(`  ${icon} ${name.padEnd(12)} (P${config.priority}) - ${config.description}`);
        console.log(`      Location: ${location}, Port: ${config.port}`);
    });

    console.log(`\n📊 Summary:`);
    console.log(`Total Services: ${totalServices}`);
    console.log(`In services/: ${servicesInServices}`);
    console.log(`In apps/: ${servicesInApps}`);
    console.log(`Missing: ${totalServices - servicesInServices - servicesInApps}`);

    console.log('\n🛠️ Available Commands:');
    console.log('  npm run setup       - Initialize/migrate to v2.0 architecture');
    console.log('  npm run dev         - Start priority 1 services');
    console.log('  npm run dev:all     - Start all available services');
    console.log('  npm run status      - Show this status report');
    console.log('  npm run sync        - Sync git submodules');

    console.log('\n📚 Documentation:');
    console.log('  ARCHITECTURE.md     - Architecture overview');
    console.log('  README-v2.md        - Updated documentation');

    console.log('\n✨ Next Steps:');
    if (hasApps && !hasServices) {
        console.log('  1. Run "npm run setup" to migrate to v2.0');
        console.log('  2. Test new development workflows');
        console.log('  3. Enjoy improved development experience');
    } else if (hasServices) {
        console.log('  1. Use "npm run dev" to start development');
        console.log('  2. Try "npm run list" to see available services');
        console.log('  3. Read ARCHITECTURE.md for workflow details');
    } else {
        console.log('  1. Run "npm run setup" to initialize ecosystem');
        console.log('  2. Clone individual repositories as needed');
        console.log('  3. Start developing with hybrid workflows');
    }

    console.log('\n================================================================================');
    console.log('🚀 Codai Ecosystem - Building the future of AI-native development');
    console.log('================================================================================\n');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('ecosystem-status-simple.js')) {
    main();
}

export { main };
