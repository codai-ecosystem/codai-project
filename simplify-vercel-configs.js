#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get all app directories
const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir).filter(dir =>
    fs.statSync(path.join(appsDir, dir)).isDirectory() && dir !== 'README.md'
);

console.log(`Found ${apps.length} apps to update`);

// Minimal vercel.json configuration that works
const minimalConfig = {
    version: 2
};

apps.forEach(app => {
    const vercelJsonPath = path.join(appsDir, app, 'vercel.json');

    try {
        // Write minimal config
        fs.writeFileSync(vercelJsonPath, JSON.stringify(minimalConfig, null, 2));
        console.log(`✅ Updated ${app}/vercel.json`);
    } catch (error) {
        console.error(`❌ Failed to update ${app}/vercel.json:`, error.message);
    }
});

console.log('✨ All vercel.json files updated with minimal configuration');
