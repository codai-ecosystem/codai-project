#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join } from 'path';

console.log('🔧 Ensuring unique names for all vitest configs...');

// Find all vitest config files 
const appConfigs = glob.sync('apps/*/vitest.config.ts', { cwd: process.cwd() });
const packageConfigs = glob.sync('packages/*/vitest.config.ts', { cwd: process.cwd() });
const allConfigs = [...appConfigs, ...packageConfigs];

let fixedCount = 0;

for (const configPath of allConfigs) {
    try {
        const fullPath = join(process.cwd(), configPath);
        let content = readFileSync(fullPath, 'utf8');

        // Extract folder name (app or package name)
        const pathParts = configPath.split('/');
        const folderType = pathParts[0]; // 'apps' or 'packages'
        const folderName = pathParts[1];
        const uniqueName = `${folderType}-${folderName}`;

        // Check if name field exists
        if (content.includes('name:')) {
            // Replace existing name
            content = content.replace(/name:\s*['"][^'"]*['"]/, `name: '${uniqueName}'`);
        } else {
            // Add name field to test config
            if (content.includes('test: {')) {
                content = content.replace(/test:\s*{/, `test: {\n    name: '${uniqueName}',`);
            }
        }

        writeFileSync(fullPath, content, 'utf8');
        fixedCount++;

        console.log(`✅ Set unique name for: ${configPath} -> ${uniqueName}`);
    } catch (error) {
        console.log(`❌ Error with ${configPath}: ${error.message}`);
    }
}

console.log(`\n📊 Updated ${fixedCount} vitest configs with unique names!`);
