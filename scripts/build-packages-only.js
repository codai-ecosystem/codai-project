#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Building all packages without lint checks...');

// First, modify turbo.json to temporarily remove lint and type-check dependencies
const turboJsonPath = path.join(__dirname, '..', 'turbo.json');
const turboConfig = JSON.parse(fs.readFileSync(turboJsonPath, 'utf8'));

// Backup original config
const originalDependsOn = turboConfig.tasks.build.dependsOn;
console.log('📦 Original dependencies:', originalDependsOn);

// Temporarily modify to only have ^build dependency
turboConfig.tasks.build.dependsOn = ["^build"];

// Write modified config
fs.writeFileSync(turboJsonPath, JSON.stringify(turboConfig, null, 2));
console.log('✅ Temporarily modified turbo.json');

try {
    // Build packages only (not apps)
    console.log('🚀 Building all packages...');
    execSync('pnpm turbo build --filter="./packages/*"', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
    });

    console.log('✅ All packages built successfully!');
} catch (error) {
    console.error('❌ Build failed:', error.message);
} finally {
    // Restore original config
    turboConfig.tasks.build.dependsOn = originalDependsOn;
    fs.writeFileSync(turboJsonPath, JSON.stringify(turboConfig, null, 2));
    console.log('🔄 Restored original turbo.json');
}
