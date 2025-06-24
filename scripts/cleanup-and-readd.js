#!/usr/bin/env node
/**
 * Clean and Re-add All Repositories
 * This script cleans up problematic git directories and re-adds repositories properly
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Define the core repositories we want to integrate
const CORE_SERVICES = [
    'logai',
    'bancai',
    'wallet',
    'fabricai',
    'sociai',
    'cumparai',
    'x'
];

// Define empty repositories that we should skip
const EMPTY_SERVICES = [
    'explorer',
    'marketai',
    'analizai',
    'tools'
];

function removeDirectory(dirPath) {
    try {
        if (fs.existsSync(dirPath)) {
            console.log(chalk.yellow(`🗑️  Removing ${dirPath}`));
            execSync(`rmdir /S /Q "${dirPath}"`, { stdio: 'inherit' });
        }
    } catch (error) {
        console.log(chalk.red(`❌ Failed to remove ${dirPath}: ${error.message}`));
    }
}

function addSubmodule(serviceName, repoUrl) {
    const servicePath = `services/${serviceName}`;

    try {
        console.log(chalk.blue(`📥 Adding ${serviceName} as git submodule...`));
        execSync(`git submodule add ${repoUrl} ${servicePath}`, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log(chalk.green(`✅ Successfully added ${serviceName}`));
        return true;
    } catch (error) {
        console.log(chalk.red(`❌ Failed to add ${serviceName}: ${error.message}`));
        return false;
    }
}

async function main() {
    console.log(chalk.bold.cyan('\n🧹 CODAI ECOSYSTEM - CLEANUP AND RE-INTEGRATION'));
    console.log(chalk.cyan('Cleaning up problematic directories and re-adding repositories...\n'));

    // Step 1: Remove empty repositories that failed to initialize
    console.log(chalk.bold.blue('\n📝 Step 1: Removing empty repositories'));
    for (const service of EMPTY_SERVICES) {
        const servicePath = `services/${service}`;
        removeDirectory(servicePath);
    }

    // Step 2: Remove and re-add core services that had git directory conflicts
    console.log(chalk.bold.blue('\n📝 Step 2: Re-adding core services'));
    let successCount = 0;
    let errorCount = 0;

    for (const service of CORE_SERVICES) {
        const servicePath = `services/${service}`;
        const repoUrl = `https://github.com/codai-ecosystem/${service}.git`;

        // Remove if exists
        if (fs.existsSync(servicePath)) {
            removeDirectory(servicePath);
        }

        // Wait a moment for file system
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add as submodule
        const success = addSubmodule(service, repoUrl);
        if (success) {
            successCount++;
        } else {
            errorCount++;
        }
    }

    // Step 3: Update all submodules
    console.log(chalk.bold.blue('\n📝 Step 3: Updating submodules'));
    try {
        execSync('git submodule update --init --recursive', { stdio: 'inherit' });
        console.log(chalk.green('✅ Submodules updated successfully'));
    } catch (error) {
        console.log(chalk.red(`❌ Failed to update submodules: ${error.message}`));
    }

    // Step 4: Clean up .gitmodules if needed
    console.log(chalk.bold.blue('\n📝 Step 4: Cleaning up .gitmodules'));
    try {
        const gitmodulesPath = '.gitmodules';
        if (fs.existsSync(gitmodulesPath)) {
            let content = fs.readFileSync(gitmodulesPath, 'utf8');

            // Remove entries for empty repositories
            for (const service of EMPTY_SERVICES) {
                const pattern = new RegExp(`\\[submodule "services/${service}"\\][\\s\\S]*?(?=\\[submodule|$)`, 'g');
                content = content.replace(pattern, '');
            }

            // Clean up any double newlines
            content = content.replace(/\n\n\n+/g, '\n\n');

            fs.writeFileSync(gitmodulesPath, content);
            console.log(chalk.green('✅ Cleaned up .gitmodules'));
        }
    } catch (error) {
        console.log(chalk.red(`❌ Failed to clean .gitmodules: ${error.message}`));
    }

    // Summary
    console.log(chalk.bold.green('\n🎉 CLEANUP SUMMARY:'));
    console.log(chalk.green(`✅ Successfully added: ${successCount} repositories`));
    console.log(chalk.red(`❌ Failed to add: ${errorCount} repositories`));
    console.log(chalk.yellow(`🗑️  Removed empty: ${EMPTY_SERVICES.length} repositories`));

    console.log(chalk.bold.cyan('\n📊 Final Status:'));
    console.log(chalk.blue('   Run "npm run status" to verify the integration'));
    console.log(chalk.blue('   All core services should now be properly integrated'));
}

main().catch(console.error);
