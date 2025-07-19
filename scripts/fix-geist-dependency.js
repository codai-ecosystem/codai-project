#!/usr/bin/env node

/**
 * Fix Geist Font Dependency Issue Across All Apps
 * This script installs the geist package for all apps that need it
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// List of all apps that need geist dependency
const APPS_NEEDING_GEIST = [
    'acasai', 'aide', 'ajutai', 'analizai', 'bancai', 'codai', 'conversai',
    'cumparai', 'curtai', 'dexai', 'donai', 'fabricai', 'jucai', 'legalizai',
    'logai', 'marketai', 'memorai', 'muzicai', 'prezentai', 'publicai',
    'romai', 'sociai', 'stocai', 'studiai', 'sunai', 'talentai'
];

async function checkFileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function addGeistToRootPackageJson() {
    console.log('📦 Adding geist to root package.json...');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageContent = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageContent);

    // Add geist to dependencies if not already present
    if (!packageJson.dependencies.geist) {
        packageJson.dependencies.geist = '^1.3.1';

        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
        console.log('✅ Added geist to root package.json');
    } else {
        console.log('✅ geist already in root package.json');
    }
}

async function installGeistInWorkspace() {
    console.log('📦 Installing geist in workspace...');

    try {
        await execAsync('pnpm add geist -w', { cwd: process.cwd() });
        console.log('✅ geist installed in workspace');
    } catch (error) {
        console.log('⚠️ Warning: Could not install geist in workspace, will try individual apps');
        console.log('Error:', error.message);
    }
}

async function installGeistInApp(appName) {
    const appPath = path.join(process.cwd(), 'apps', appName);
    const packageJsonPath = path.join(appPath, 'package.json');

    // Check if app exists and has package.json
    if (!(await checkFileExists(packageJsonPath))) {
        console.log(`⏭️ Skipping ${appName} - no package.json found`);
        return false;
    }

    console.log(`📦 Installing geist in ${appName}...`);

    try {
        // Check if geist is already in dependencies
        const packageContent = await fs.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageContent);

        if (packageJson.dependencies && packageJson.dependencies.geist) {
            console.log(`✅ ${appName} already has geist dependency`);
            return true;
        }

        // Install geist
        await execAsync('pnpm add geist', { cwd: appPath });
        console.log(`✅ geist installed in ${appName}`);
        return true;
    } catch (error) {
        console.log(`❌ Failed to install geist in ${appName}:`, error.message);
        return false;
    }
}

async function checkLayoutFiles() {
    console.log('🔍 Checking layout files for geist imports...');

    const appsWithGeistImports = [];

    for (const appName of APPS_NEEDING_GEIST) {
        const layoutPath = path.join(process.cwd(), 'apps', appName, 'app', 'layout.tsx');

        if (await checkFileExists(layoutPath)) {
            const layoutContent = await fs.readFile(layoutPath, 'utf8');

            if (layoutContent.includes("import { GeistSans } from 'geist/font/sans'")) {
                appsWithGeistImports.push(appName);
            }
        }
    }

    console.log(`📋 Found ${appsWithGeistImports.length} apps with geist imports:`, appsWithGeistImports);
    return appsWithGeistImports;
}

async function main() {
    console.log('🚀 Starting Geist Font Dependency Fix...\n');

    try {
        // Step 1: Add geist to root package.json
        await addGeistToRootPackageJson();

        // Step 2: Install geist in workspace
        await installGeistInWorkspace();

        // Step 3: Check which apps actually need geist
        const appsWithGeistImports = await checkLayoutFiles();

        // Step 4: Install geist in individual apps if needed
        console.log('\n📦 Installing geist in individual apps...');
        const results = [];

        for (const appName of appsWithGeistImports) {
            const success = await installGeistInApp(appName);
            results.push({ app: appName, success });
        }

        // Summary
        console.log('\n📊 Summary:');
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`✅ Successfully processed: ${successful} apps`);
        console.log(`❌ Failed: ${failed} apps`);

        if (failed > 0) {
            console.log('\n❌ Failed apps:');
            results.filter(r => !r.success).forEach(r => console.log(`  - ${r.app}`));
        }

        console.log('\n🎉 Geist dependency fix completed!');
        console.log('💡 Please restart your development servers to pick up the new dependency.');

    } catch (error) {
        console.error('💥 Error during geist dependency fix:', error);
        process.exit(1);
    }
}

main();
