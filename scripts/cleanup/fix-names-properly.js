#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join } from 'path';

console.log('🔧 Fixing vitest config names properly...');

// Find all vitest config files 
const appConfigs = glob.sync('apps/*/vitest.config.ts', { cwd: process.cwd() });
const packageConfigs = glob.sync('packages/*/vitest.config.ts', { cwd: process.cwd() });

let fixedCount = 0;

// Fix apps
for (const configPath of appConfigs) {
    try {
        const fullPath = join(process.cwd(), configPath);
        let content = readFileSync(fullPath, 'utf8');

        const appName = configPath.split('/')[1];
        const uniqueName = `app-${appName}`;

        // Replace or add name field
        if (content.includes('name:')) {
            content = content.replace(/name:\s*['"][^'"]*['"]/, `name: '${uniqueName}'`);
        } else if (content.includes('test: {')) {
            content = content.replace(/test:\s*{/, `test: {\n    name: '${uniqueName}',`);
        }

        writeFileSync(fullPath, content, 'utf8');
        fixedCount++;

        console.log(`✅ App: ${appName} -> ${uniqueName}`);
    } catch (error) {
        console.log(`❌ Error with ${configPath}: ${error.message}`);
    }
}

// Fix packages
for (const configPath of packageConfigs) {
    try {
        const fullPath = join(process.cwd(), configPath);
        let content = readFileSync(fullPath, 'utf8');

        const packageName = configPath.split('/')[1];
        const uniqueName = `pkg-${packageName}`;

        // Replace or add name field
        if (content.includes('name:')) {
            content = content.replace(/name:\s*['"][^'"]*['"]/, `name: '${uniqueName}'`);
        } else if (content.includes('test: {')) {
            content = content.replace(/test:\s*{/, `test: {\n    name: '${uniqueName}',`);
        }

        writeFileSync(fullPath, content, 'utf8');
        fixedCount++;

        console.log(`✅ Package: ${packageName} -> ${uniqueName}`);
    } catch (error) {
        console.log(`❌ Error with ${configPath}: ${error.message}`);
    }
}

console.log(`\n📊 Fixed ${fixedCount} vitest configs with proper unique names!`);
