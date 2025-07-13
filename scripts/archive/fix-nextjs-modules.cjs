#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING NEXT.JS CONFIG MODULE ISSUES');
console.log('======================================');

function fixPackageJsonModuleType(filePath) {
    try {
        const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let changed = false;

        // Remove type: "module" from services that have next.config.js
        const servicePath = path.dirname(filePath);
        const nextConfigPath = path.join(servicePath, 'next.config.js');

        if (fs.existsSync(nextConfigPath) && packageJson.type === 'module') {
            delete packageJson.type;
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

// Fix all package.json files
const directories = ['apps', 'services'];

for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
        const services = fs.readdirSync(dirPath);
        for (const service of services) {
            const servicePath = path.join(dirPath, service);
            const packageJsonPath = path.join(servicePath, 'package.json');
            const nextConfigPath = path.join(servicePath, 'next.config.js');

            if (fs.existsSync(packageJsonPath) && fs.existsSync(nextConfigPath)) {
                if (fixPackageJsonModuleType(packageJsonPath)) {
                    console.log(`✅ Fixed module type in ${service}`);
                }
            }
        }
    }
}

console.log('🎖️ NEXT.JS CONFIG FIXES COMPLETE');
