#!/usr/bin/env node

/**
 * Comprehensive Pre-Commit Validation Script
 * Validates the Codai project before committing and publishing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 CODAI PRE-COMMIT VALIDATION STARTING...\n');

let errors = [];
let warnings = [];

// 1. Check workspace structure
console.log('📁 Validating workspace structure...');
const requiredFiles = [
    'package.json',
    'pnpm-workspace.yaml',
    'turbo.json',
    'projects.index.json',
    'README.md'
];

for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
        errors.push(`Missing required file: ${file}`);
    }
}

// 2. Validate package.json
console.log('📦 Validating package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.scripts) {
        errors.push('package.json missing scripts section');
    }
    if (!packageJson.scripts.test) {
        warnings.push('package.json missing test script');
    }
    if (!packageJson.scripts.build) {
        errors.push('package.json missing build script');
    }
} catch (err) {
    errors.push(`Invalid package.json: ${err.message}`);
}

// 3. Check critical directories
console.log('🗂️  Validating directory structure...');
const requiredDirs = ['apps', 'services', 'scripts', 'packages'];
for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
        errors.push(`Missing required directory: ${dir}`);
    }
}

// 4. Validate services
console.log('🔧 Validating services...');
if (fs.existsSync('services')) {
    const services = fs.readdirSync('services');
    console.log(`Found ${services.length} services`);
    
    for (const service of services) {
        const servicePath = path.join('services', service);
        if (fs.statSync(servicePath).isDirectory()) {
            const packageJsonPath = path.join(servicePath, 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                warnings.push(`Service ${service} missing package.json`);
            }
        }
    }
}

// 5. Validate apps
console.log('📱 Validating apps...');
if (fs.existsSync('apps')) {
    const apps = fs.readdirSync('apps');
    console.log(`Found ${apps.length} apps`);
    
    for (const app of apps) {
        const appPath = path.join('apps', app);
        if (fs.statSync(appPath).isDirectory()) {
            const packageJsonPath = path.join(appPath, 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                warnings.push(`App ${app} missing package.json`);
            }
        }
    }
}

// 6. Check Git status
console.log('📝 Checking Git status...');
try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
        console.log('📋 Uncommitted changes found:');
        console.log(gitStatus);
    } else {
        console.log('✅ No uncommitted changes');
    }
} catch (err) {
    warnings.push('Could not check git status');
}

// 7. Basic syntax validation for key files
console.log('✨ Validating key file syntax...');
const keyFiles = [
    'package.json',
    'pnpm-workspace.yaml',
    'turbo.json',
    'projects.index.json'
];

for (const file of keyFiles) {
    if (fs.existsSync(file)) {
        try {
            if (file.endsWith('.json')) {
                JSON.parse(fs.readFileSync(file, 'utf8'));
            }
        } catch (err) {
            errors.push(`Invalid syntax in ${file}: ${err.message}`);
        }
    }
}

// 8. Memory system check
console.log('🧠 Checking memory system...');
try {
    const projectsIndex = JSON.parse(fs.readFileSync('projects.index.json', 'utf8'));
    if (!projectsIndex.apps || !Array.isArray(projectsIndex.apps)) {
        errors.push('Invalid projects.index.json structure - missing apps array');
    }
    if (projectsIndex.totalApps !== projectsIndex.apps.length) {
        warnings.push(`Total apps mismatch: expected ${projectsIndex.totalApps}, found ${projectsIndex.apps.length}`);
    }
} catch (err) {
    errors.push(`Error reading projects.index.json: ${err.message}`);
}

// 9. Check for common issues
console.log('🔍 Checking for common issues...');
if (fs.existsSync('node_modules') && fs.statSync('node_modules').isDirectory()) {
    console.log('✅ node_modules exists');
} else {
    warnings.push('node_modules directory not found - run pnpm install');
}

// Report results
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION RESULTS');
console.log('='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
    console.log('🎉 ALL CHECKS PASSED! Project is ready for commit and publish.');
    process.exit(0);
} else {
    if (errors.length > 0) {
        console.log('\n❌ ERRORS FOUND:');
        errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    }
    
    if (warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        warnings.forEach((warning, i) => console.log(`${i + 1}. ${warning}`));
    }
    
    if (errors.length > 0) {
        console.log('\n🚫 Cannot commit with errors. Please fix the issues above.');
        process.exit(1);
    } else {
        console.log('\n✅ No blocking errors. Warnings can be addressed later.');
        console.log('✅ Project is ready for commit and publish.');
        process.exit(0);
    }
}
