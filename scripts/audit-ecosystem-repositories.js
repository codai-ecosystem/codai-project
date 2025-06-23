#!/usr/bin/env node

/**
 * Codai Ecosystem Repository Audit Script
 * 
 * This script audits all repositories in the codai-ecosystem organization
 * and identifies which ones are empty or need content.
 * 
 * Usage: node scripts/audit-ecosystem-repositories.js
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

// Known repositories in codai-ecosystem organization
const ECOSYSTEM_REPOSITORIES = [
    // Core Services (Priority 1-4)
    'codai', 'memorai', 'studiai', 'logai', 'bancai', 'wallet', 
    'fabricai', 'sociai', 'cumparai', 'x',
    
    // Infrastructure & Support
    'templates', 'tools', 'docs', 'hub', 'admin', 'dash',
    
    // Additional AI Services
    'marketai', 'analizai', 'stocai', 'legalizai', 'ajutai', 'jucai',
    
    // Legacy/Alternative names
    'AIDE', 'kodex', 'explorer', 'mod', 'id', 'metu',
    
    // Main orchestration
    'codai-project'
];

// Core services that should have scaffolding in the monorepo
const CORE_SERVICES = [
    'codai', 'memorai', 'studiai', 'logai', 'bancai', 'wallet',
    'fabricai', 'sociai', 'cumparai', 'x', 'templates'
];

/**
 * Check if a repository URL is accessible
 */
async function checkRepositoryExists(repoName) {
    try {
        const { stdout } = await execAsync(`git ls-remote https://github.com/codai-ecosystem/${repoName}.git HEAD`);
        return stdout.trim().length > 0;
    } catch (error) {
        return false;
    }
}

/**
 * Check if a repository is empty (has minimal commits)
 */
async function checkRepositoryEmpty(repoName) {
    try {
        const { stdout } = await execAsync(`git ls-remote https://github.com/codai-ecosystem/${repoName}.git | wc -l`);
        const refCount = parseInt(stdout.trim());
        return refCount <= 2; // Only HEAD and maybe one branch
    } catch (error) {
        return true; // Assume empty if can't check
    }
}

/**
 * Check if local service has scaffolding
 */
function hasLocalScaffolding(serviceName) {
    const servicePath = path.join('services', serviceName);
    
    if (!fs.existsSync(servicePath)) {
        return false;
    }
    
    const requiredFiles = [
        'package.json',
        'app/page.tsx',
        'agent.project.json',
        'copilot-instructions.md'
    ];
    
    return requiredFiles.every(file => {
        return fs.existsSync(path.join(servicePath, file));
    });
}

/**
 * Get repository stats
 */
async function getRepositoryStats(repoName) {
    const exists = await checkRepositoryExists(repoName);
    if (!exists) {
        return { exists: false, empty: true, hasScaffolding: false };
    }
    
    const empty = await checkRepositoryEmpty(repoName);
    const hasScaffolding = CORE_SERVICES.includes(repoName) ? hasLocalScaffolding(repoName) : false;
    
    return { exists, empty, hasScaffolding };
}

/**
 * Main audit function
 */
async function auditRepositories() {
    console.log(chalk.bold.blue('🔍 Codai Ecosystem Repository Audit\n'));
    
    const results = {
        total: 0,
        existing: 0,
        empty: 0,
        withContent: 0,
        scaffolded: 0,
        needsPush: 0
    };
    
    const categories = {
        contentRich: [],
        empty: [],
        scaffolded: [],
        needsPush: [],
        nonExistent: []
    };
    
    for (const repoName of ECOSYSTEM_REPOSITORIES) {
        results.total++;
        console.log(chalk.gray(`Checking ${repoName}...`));
        
        const stats = await getRepositoryStats(repoName);
        
        if (!stats.exists) {
            categories.nonExistent.push(repoName);
            console.log(chalk.red(`  ❌ ${repoName} - Repository does not exist`));
            continue;
        }
        
        results.existing++;
        
        if (!stats.empty) {
            results.withContent++;
            categories.contentRich.push(repoName);
            console.log(chalk.green(`  ✅ ${repoName} - Has content`));
        } else {
            results.empty++;
            
            if (stats.hasScaffolding) {
                results.scaffolded++;
                results.needsPush++;
                categories.scaffolded.push(repoName);
                categories.needsPush.push(repoName);
                console.log(chalk.yellow(`  📦 ${repoName} - Empty repo, has local scaffolding, needs push`));
            } else {
                categories.empty.push(repoName);
                console.log(chalk.red(`  📭 ${repoName} - Empty repo, no scaffolding`));
            }
        }
    }
    
    // Summary Report
    console.log(chalk.bold.blue('\n📊 Audit Summary:'));
    console.log(chalk.gray(`Total repositories checked: ${results.total}`));
    console.log(chalk.green(`Existing repositories: ${results.existing}`));
    console.log(chalk.blue(`Repositories with content: ${results.withContent}`));
    console.log(chalk.yellow(`Empty repositories: ${results.empty}`));
    console.log(chalk.cyan(`Scaffolded locally: ${results.scaffolded}`));
    console.log(chalk.orange(`Need immediate push: ${results.needsPush}`));
    
    // Detailed Categories
    if (categories.contentRich.length > 0) {
        console.log(chalk.bold.green('\n✅ Repositories with Content:'));
        categories.contentRich.forEach(repo => console.log(chalk.green(`  • ${repo}`)));
    }
    
    if (categories.needsPush.length > 0) {
        console.log(chalk.bold.yellow('\n📦 Scaffolded - Need Push:'));
        categories.needsPush.forEach(repo => console.log(chalk.yellow(`  • ${repo}`)));
    }
    
    if (categories.empty.length > 0) {
        console.log(chalk.bold.red('\n📭 Empty Repositories:'));
        categories.empty.forEach(repo => console.log(chalk.red(`  • ${repo}`)));
    }
    
    if (categories.nonExistent.length > 0) {
        console.log(chalk.bold.gray('\n❌ Non-existent Repositories:'));
        categories.nonExistent.forEach(repo => console.log(chalk.gray(`  • ${repo}`)));
    }
    
    // Recommendations
    console.log(chalk.bold.blue('\n🎯 Recommended Actions:'));
    
    if (categories.needsPush.length > 0) {
        console.log(chalk.yellow(`1. Run "npm run push-scaffolded" to push ${categories.needsPush.length} scaffolded services`));
    }
    
    if (categories.empty.length > 0) {
        console.log(chalk.red(`2. Create scaffolding for ${categories.empty.length} empty repositories`));
    }
    
    if (categories.nonExistent.length > 0) {
        console.log(chalk.gray(`3. Create ${categories.nonExistent.length} missing repositories in GitHub`));
    }
    
    console.log(chalk.bold.green('\n🚀 Ready to scale the Codai Ecosystem!'));
    
    return { results, categories };
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    auditRepositories().catch(console.error);
}

export { auditRepositories, ECOSYSTEM_REPOSITORIES, CORE_SERVICES };
