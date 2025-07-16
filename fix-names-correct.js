#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('🔧 Fixing vitest config names correctly...');

// Get actual app and package directories
const appDirs = readdirSync('apps', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const packageDirs = readdirSync('packages', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

let fixedCount = 0;

// Fix apps
for (const appName of appDirs) {
    try {
        const configPath = join('apps', appName, 'vitest.config.ts');
        const fullPath = join(process.cwd(), configPath);

        let content = readFileSync(fullPath, 'utf8');
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
        console.log(`⚠️  No vitest config for app: ${appName}`);
    }
}

// Fix packages
for (const packageName of packageDirs) {
    try {
        const configPath = join('packages', packageName, 'vitest.config.ts');
        const fullPath = join(process.cwd(), configPath);

        let content = readFileSync(fullPath, 'utf8');
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
        console.log(`⚠️  No vitest config for package: ${packageName}`);
    }
}

console.log(`\n📊 Fixed ${fixedCount} vitest configs!`);
