#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Express.js apps that need dependency fixing
const expressApps = [
    'aide', 'analizai', 'marketai', 'explorer', 'kodex', 'id', 'mod',
    'tools', 'dash', 'hub', 'docs', 'admin', 'stocai', 'ajutai', 'legalizai'
];

console.log('🔧 Fixing Express.js dependencies...');

for (const app of expressApps) {
    const appPath = path.join(__dirname, 'apps', app);
    const nodeModulesPath = path.join(appPath, 'node_modules');
    const ignoredPath = path.join(nodeModulesPath, '.ignored');

    if (fs.existsSync(ignoredPath)) {
        console.log(`📦 Fixing ${app}...`);

        // Restore express
        const expressIgnored = path.join(ignoredPath, 'express');
        const expressTarget = path.join(nodeModulesPath, 'express');
        if (fs.existsSync(expressIgnored) && !fs.existsSync(expressTarget)) {
            try {
                fs.renameSync(expressIgnored, expressTarget);
                console.log(`   ✅ Restored express for ${app}`);
            } catch (err) {
                console.log(`   ❌ Failed to restore express for ${app}: ${err.message}`);
            }
        }

        // Restore cors
        const corsIgnored = path.join(ignoredPath, 'cors');
        const corsTarget = path.join(nodeModulesPath, 'cors');
        if (fs.existsSync(corsIgnored) && !fs.existsSync(corsTarget)) {
            try {
                fs.renameSync(corsIgnored, corsTarget);
                console.log(`   ✅ Restored cors for ${app}`);
            } catch (err) {
                console.log(`   ❌ Failed to restore cors for ${app}: ${err.message}`);
            }
        }

        // Remove empty .ignored folder
        try {
            const ignoredContents = fs.readdirSync(ignoredPath);
            if (ignoredContents.length === 0) {
                fs.rmdirSync(ignoredPath);
                console.log(`   🗑️ Removed empty .ignored folder for ${app}`);
            }
        } catch (err) {
            // Ignore errors when removing .ignored folder
        }
    }
}

console.log('✅ Express.js dependency fixing complete!');
