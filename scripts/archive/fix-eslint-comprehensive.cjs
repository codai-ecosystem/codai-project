#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the correct ESLint config content
const eslintConfig = `/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['next/core-web-vitals'],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@next/next/no-img-element': 'off',
    'react/no-unescaped-entities': 'off',
    '@next/next/no-page-custom-font': 'off',
  },
};
`;

function fixESLintConfig(basePath, serviceName) {
    const eslintPath = path.join(basePath, '.eslintrc.js');

    try {
        // Check if .eslintrc.js exists
        if (fs.existsSync(eslintPath)) {
            // Read current content
            const currentContent = fs.readFileSync(eslintPath, 'utf8');

            // Check if it has the "module is not defined" issue
            if (currentContent.includes('module.exports') && !currentContent.includes('env:')) {
                fs.writeFileSync(eslintPath, eslintConfig);
                console.log(`  ✅ Fixed ESLint config for ${serviceName}`);
            } else if (!currentContent.includes('env:')) {
                fs.writeFileSync(eslintPath, eslintConfig);
                console.log(`  ✅ Updated ESLint config for ${serviceName}`);
            } else {
                console.log(`  ℹ️  ESLint config already correct for ${serviceName}`);
            }
        } else {
            // Create ESLint config if it doesn't exist
            fs.writeFileSync(eslintPath, eslintConfig);
            console.log(`  ✅ Created ESLint config for ${serviceName}`);
        }
    } catch (error) {
        console.error(`  ❌ Failed to fix ESLint config for ${serviceName}:`, error.message);
    }
}

console.log('🔧 Fixing ESLint configurations across all services...');

// Process apps directory
const appsDir = path.join(__dirname, '..', 'apps');
if (fs.existsSync(appsDir)) {
    const apps = fs.readdirSync(appsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    console.log(`\n📱 Processing ${apps.length} apps...`);
    apps.forEach(app => {
        const appPath = path.join(appsDir, app);
        fixESLintConfig(appPath, `apps/${app}`);
    });
}

// Process services directory
const servicesDir = path.join(__dirname, '..', 'services');
if (fs.existsSync(servicesDir)) {
    const services = fs.readdirSync(servicesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    console.log(`\n🛠️  Processing ${services.length} services...`);
    services.forEach(service => {
        const servicePath = path.join(servicesDir, service);
        fixESLintConfig(servicePath, `services/${service}`);
    });
}

console.log('\n✅ ESLint configuration fixes completed!');
console.log('\n🎯 Next: Test builds to verify "module is not defined" errors are resolved');
