#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix ESLint configurations that have "module is not defined" errors
console.log('🔧 Fixing ESLint configurations...');

const servicesDir = path.join(process.cwd(), 'services');
const services = fs.readdirSync(servicesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

for (const service of services) {
    const eslintConfigPath = path.join(servicesDir, service, '.eslintrc.js');

    if (fs.existsSync(eslintConfigPath)) {
        try {
            const content = fs.readFileSync(eslintConfigPath, 'utf8');

            // Check if it has the "module is not defined" issue
            if (content.includes('module.exports') && !content.includes('/* eslint-env node */')) {
                // Add the node environment at the top
                const fixedContent = `/* eslint-env node */\n${content}`;
                fs.writeFileSync(eslintConfigPath, fixedContent);
                console.log(`  ✅ Fixed ESLint config for ${service}`);
            }
        } catch (error) {
            console.error(`  ❌ Error fixing ESLint config for ${service}:`, error.message);
        }
    }
}

console.log('✅ ESLint configuration fixes completed!');
