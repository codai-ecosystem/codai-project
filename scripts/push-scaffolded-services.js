#!/usr/bin/env node

/**
 * Push Scaffolded Services Script
 * 
 * This script pushes all scaffolded services to their respective
 * codai-ecosystem repositories with appropriate commit messages.
 * 
 * Usage: node scripts/push-scaffolded-services.js
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

// Service configurations
const SERVICES = [
    {
        name: 'bancai',
        description: 'Financial Platform',
        domain: 'bancai.ro',
        priority: 2,
        features: ['Payment processing', 'Financial analytics', 'Banking APIs', 'Transaction management']
    },
    {
        name: 'wallet',
        description: 'Programmable Wallet',
        domain: 'wallet.bancai.ro',
        priority: 2,
        features: ['Digital wallet', 'Cryptocurrency support', 'Smart contracts', 'Multi-chain integration']
    },
    {
        name: 'fabricai',
        description: 'AI Services Platform',
        domain: 'fabricai.ro',
        priority: 2,
        features: ['AI model hosting', 'API endpoints', 'Model training', 'Service orchestration']
    },
    {
        name: 'sociai',
        description: 'AI Social Platform',
        domain: 'sociai.ro',
        priority: 3,
        features: ['Social networking', 'AI-powered content', 'Community features', 'Real-time chat']
    },
    {
        name: 'cumparai',
        description: 'AI Shopping Platform',
        domain: 'cumparai.ro',
        priority: 3,
        features: ['E-commerce', 'AI recommendations', 'Product catalog', 'Payment integration']
    },
    {
        name: 'publicai',
        description: 'Civic AI & Transparency Tools',
        domain: 'publicai.ro',
        priority: 4,
        features: ['Government transparency', 'Public data access', 'Civic engagement', 'AI governance']
    },
    {
        name: 'x',
        description: 'AI Trading Platform',
        domain: 'x.codai.ro',
        priority: 4,
        features: ['Algorithmic trading', 'Market analysis', 'Portfolio management', 'Risk assessment']
    }
];

/**
 * Generate commit message for a service
 */
function generateCommitMessage(service) {
    const featuresText = service.features.map(f => `- ${f}`).join('\n');

    return `feat: Initial scaffolding for ${service.description}

✅ COMPLETE NEXT.JS 14 FOUNDATION:
- Next.js 14 with App Router and TypeScript
- Tailwind CSS for modern styling
- Complete project structure (app/, components/, lib/, types/)
- VS Code workspace configuration
- Environment variable templates
- AI agent integration (agent.project.json, copilot-instructions.md)

✅ DEVELOPMENT READY:
- PNPM workspace integration
- Vitest testing framework
- ESLint and TypeScript configuration
- VS Code debugging and tasks setup
- Production build configuration

🎯 PURPOSE: ${service.description} (${service.domain})
- Priority: ${service.priority}
- Core Features Ready:
${featuresText}

✨ ARCHITECTURE:
- Codai Ecosystem v2.0 integration
- Git submodule configuration
- Monorepo coordination support
- Individual AI agent workspace

STATUS: Ready for AI agent development and business logic implementation`;
}

/**
 * Check if service directory has scaffolding
 */
function hasScaffolding(serviceName) {
    const servicePath = path.join('services', serviceName);
    const requiredFiles = ['package.json', 'app/page.tsx', 'agent.project.json'];

    return requiredFiles.every(file => {
        return fs.existsSync(path.join(servicePath, file));
    });
}

/**
 * Push a single service
 */
async function pushService(service) {
    const servicePath = path.join('services', service.name);

    console.log(chalk.blue(`\n📦 Processing ${service.name}...`));

    // Check if service exists and has scaffolding
    if (!fs.existsSync(servicePath)) {
        console.log(chalk.yellow(`  ⚠️  Service directory not found: ${servicePath}`));
        return false;
    }

    if (!hasScaffolding(service.name)) {
        console.log(chalk.yellow(`  ⚠️  Service not scaffolded: ${service.name}`));
        return false;
    }

    try {
        // Change to service directory
        process.chdir(servicePath);

        // Check if there are changes to commit
        const { stdout: statusOut } = await execAsync('git status --porcelain');
        if (!statusOut.trim()) {
            console.log(chalk.gray(`  ℹ️  No changes to commit for ${service.name}`));
            process.chdir('../../');
            return true;
        }

        // Stage all files
        await execAsync('git add .');
        console.log(chalk.green(`  ✅ Staged files for ${service.name}`));

        // Commit with generated message
        const commitMessage = generateCommitMessage(service);
        await execAsync(`git commit -m "${commitMessage}"`);
        console.log(chalk.green(`  ✅ Committed changes for ${service.name}`));

        // Push to origin
        await execAsync('git push origin main');
        console.log(chalk.green(`  ✅ Pushed ${service.name} to codai-ecosystem/${service.name}`));

        // Return to main directory
        process.chdir('../../');
        return true;

    } catch (error) {
        console.log(chalk.red(`  ❌ Error with ${service.name}: ${error.message}`));
        // Ensure we return to main directory even on error
        try {
            process.chdir('../../');
        } catch (cdError) {
            // Already in correct directory or other issue
        }
        return false;
    }
}

/**
 * Main execution
 */
async function main() {
    console.log(chalk.bold.blue('🚀 Pushing Scaffolded Services to Codai Ecosystem\n'));

    const startTime = Date.now();
    let successCount = 0;
    let totalCount = 0;

    // Ensure we start from the correct directory
    const rootDir = process.cwd();
    if (!fs.existsSync('services') || !fs.existsSync('package.json')) {
        console.log(chalk.red('❌ Please run this script from the codai-project root directory'));
        process.exit(1);
    }

    console.log(chalk.gray(`Root directory: ${rootDir}`));
    console.log(chalk.gray(`Services to process: ${SERVICES.length}\n`));

    for (const service of SERVICES) {
        totalCount++;
        if (await pushService(service)) {
            successCount++;
        }
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(chalk.bold.green('\n✅ Service Push Complete!'));
    console.log(chalk.gray('📊 Summary:'));
    console.log(chalk.gray(`   • Services processed: ${totalCount}`));
    console.log(chalk.gray(`   • Successfully pushed: ${successCount}`));
    console.log(chalk.gray(`   • Duration: ${duration}s`));

    if (successCount === totalCount) {
        console.log(chalk.bold.green('\n🎉 All scaffolded services successfully pushed to codai-ecosystem!'));
        console.log(chalk.gray('Ready for individual AI agent development.\n'));
    } else {
        console.log(chalk.yellow(`\n⚠️  ${totalCount - successCount} services had issues or were skipped.`));
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { pushService, generateCommitMessage, SERVICES };
