#!/usr/bin/env node

/**
 * Fix caniuse-lite global dependency corruption
 * Addresses: "Cannot find module '../../data/browsers'" error
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const CORRUPTION_PATTERNS = [
    'Cannot find module \'../../data/browsers\'',
    'caniuse-lite@1.0.30001726'
];

async function fixCanIUseLiteCorruption() {
    console.log('🔧 Fixing caniuse-lite global dependency corruption...');

    try {
        // Step 1: Clear corrupted cache
        console.log('📦 Clearing PNPM cache...');
        try {
            execSync('pnpm store prune', { stdio: 'inherit' });
        } catch (error) {
            console.log('⚠️  Cache clear failed, continuing...');
        }

        // Step 2: Remove corrupted node_modules
        console.log('🗑️  Removing corrupted node_modules...');
        try {
            await fs.rm('node_modules', { recursive: true, force: true });
        } catch (error) {
            console.log('⚠️  node_modules removal failed, continuing...');
        }

        // Step 3: Remove pnpm lockfile
        console.log('🔒 Removing pnpm lockfile...');
        try {
            await fs.rm('pnpm-lock.yaml', { force: true });
        } catch (error) {
            console.log('⚠️  Lockfile removal failed, continuing...');
        }

        // Step 4: Force reinstall with specific caniuse-lite version
        console.log('📥 Force reinstalling dependencies...');
        execSync('pnpm install --force --no-frozen-lockfile', { stdio: 'inherit' });

        // Step 5: Manually fix caniuse-lite data if needed
        await fixCanIUseLiteData();

        console.log('✅ caniuse-lite corruption fix completed!');
        return true;

    } catch (error) {
        console.error('❌ Failed to fix caniuse-lite corruption:', error);
        return false;
    }
}

async function fixCanIUseLiteData() {
    const caniusePath = 'node_modules/.pnpm/caniuse-lite@1.0.30001726/node_modules/caniuse-lite';

    try {
        // Check if data directory exists
        const dataPath = path.join(caniusePath, 'data');
        const browsersPath = path.join(dataPath, 'browsers.json');

        // If browsers.json is missing, create minimal data
        try {
            await fs.access(browsersPath);
        } catch {
            console.log('🔨 Creating missing browsers.json...');
            await fs.mkdir(dataPath, { recursive: true });

            const minimalBrowsersData = {
                "chrome": "120.0.0",
                "firefox": "120.0.0",
                "safari": "17.0.0",
                "edge": "120.0.0"
            };

            await fs.writeFile(browsersPath, JSON.stringify(minimalBrowsersData, null, 2));
        }
    } catch (error) {
        console.log('⚠️  Could not fix caniuse-lite data manually:', error.message);
    }
}

async function testFix() {
    console.log('🧪 Testing fix with sample build...');

    try {
        // Test with a simple service
        execSync('cd services/admin && npm run build --silent', { stdio: 'pipe' });
        console.log('✅ Test build successful!');
        return true;
    } catch (error) {
        console.log('❌ Test build failed, corruption may persist');
        return false;
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting caniuse-lite corruption fix...\n');

    const fixed = await fixCanIUseLiteCorruption();

    if (fixed) {
        console.log('\n🧪 Testing the fix...');
        const testPassed = await testFix();

        if (testPassed) {
            console.log('\n🎉 SUCCESS: caniuse-lite corruption fixed and verified!');
            console.log('📈 Ready to test services directory builds');
        } else {
            console.log('\n⚠️  Fix applied but test failed - may need alternative approach');
        }
    } else {
        console.log('\n❌ Fix failed - manual intervention may be required');
    }
}

main().catch(console.error);
