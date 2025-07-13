#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING VERSION ISSUES');
console.log('========================');

function fixVersions(filePath) {
    try {
        const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let changed = false;

        // Fix version issues
        if (packageJson.devDependencies && packageJson.devDependencies['@types/nodemailer']) {
            packageJson.devDependencies['@types/nodemailer'] = '^6.4.17';
            changed = true;
        }

        if (packageJson.dependencies && packageJson.dependencies['ethereum']) {
            packageJson.dependencies['ethereum'] = '^0.0.4';
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

            if (fs.existsSync(packageJsonPath)) {
                if (fixVersions(packageJsonPath)) {
                    console.log(`✅ Fixed version in ${service}`);
                }
            }
        }
    }
}

console.log('🎖️ VERSION FIXES COMPLETE');
