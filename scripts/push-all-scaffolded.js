#!/usr/bin/env node

/**
 * Push All Scaffolded Services Script
 *
 * This script commits and pushes all scaffolded services to their
 * respective codai-ecosystem repositories.
 *
 * Usage: node scripts/push-all-scaffolded.js
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

// Services that should have scaffolding
const SCAFFOLDED_SERVICES = ['wallet', 'fabricai', 'sociai', 'cumparai', 'x'];

/**
 * Generate commit message for a service
 */
function generateCommitMessage(serviceName) {
  const serviceDescriptions = {
    wallet: 'Programmable Wallet (wallet.bancai.ro)',
    fabricai: 'AI Services Platform (fabricai.ro)',
    sociai: 'AI Social Platform (sociai.ro)',
    cumparai: 'AI Shopping Platform (cumparai.ro)',
    x: 'AI Trading Platform (x.codai.ro)',
  };

  const serviceFeatures = {
    wallet: [
      'Digital wallet',
      'Cryptocurrency support',
      'Smart contracts',
      'Multi-chain integration',
    ],
    fabricai: [
      'AI model hosting',
      'API endpoints',
      'Model training',
      'Service orchestration',
    ],
    sociai: [
      'Social networking',
      'AI-powered content',
      'Community features',
      'Real-time chat',
    ],
    cumparai: [
      'E-commerce',
      'AI recommendations',
      'Product catalog',
      'Payment integration',
    ],
    x: [
      'Algorithmic trading',
      'Market analysis',
      'Portfolio management',
      'Risk assessment',
    ],
  };

  const description =
    serviceDescriptions[serviceName] || `${serviceName} Service`;
  const features = serviceFeatures[serviceName] || [
    'Core functionality',
    'AI integration',
    'Modern UI',
  ];
  const featuresText = features.map(f => `- ${f}`).join('\n');

  return `feat: Initial scaffolding for ${description}

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

🎯 PURPOSE: ${description}
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
 * Check if service has scaffolding
 */
function hasScaffolding(serviceName) {
  const servicePath = path.join('services', serviceName);
  const requiredFiles = ['package.json', 'app/page.tsx', 'agent.project.json'];

  if (!fs.existsSync(servicePath)) {
    return false;
  }

  return requiredFiles.every(file => {
    return fs.existsSync(path.join(servicePath, file));
  });
}

/**
 * Push a single service
 */
async function pushService(serviceName) {
  const servicePath = path.join('services', serviceName);

  console.log(chalk.blue(`\n📦 Processing ${serviceName}...`));

  if (!hasScaffolding(serviceName)) {
    console.log(chalk.yellow(`  ⚠️  Service not scaffolded: ${serviceName}`));
    return false;
  }

  try {
    // Change to service directory and execute git commands
    const commitMessage = generateCommitMessage(serviceName);

    console.log(chalk.gray(`  • Staging files...`));
    await execAsync('git add .', { cwd: servicePath });

    console.log(chalk.gray(`  • Committing changes...`));
    await execAsync(`git commit -m "${commitMessage}"`, { cwd: servicePath });

    console.log(chalk.gray(`  • Pushing to origin...`));
    await execAsync('git push origin main', { cwd: servicePath });

    console.log(
      chalk.green(
        `  ✅ Successfully pushed ${serviceName} to codai-ecosystem/${serviceName}`
      )
    );
    return true;
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      console.log(chalk.gray(`  ℹ️  No changes to commit for ${serviceName}`));
      return true;
    } else {
      console.log(
        chalk.red(`  ❌ Error with ${serviceName}: ${error.message}`)
      );
      return false;
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(
    chalk.bold.blue('🚀 Pushing All Scaffolded Services to Codai Ecosystem\n')
  );

  const startTime = Date.now();
  let successCount = 0;
  let totalCount = 0;

  // Ensure we're in the correct directory
  if (!fs.existsSync('services') || !fs.existsSync('package.json')) {
    console.log(
      chalk.red(
        '❌ Please run this script from the codai-project root directory'
      )
    );
    process.exit(1);
  }

  console.log(
    chalk.gray(`Services to process: ${SCAFFOLDED_SERVICES.length}\n`)
  );

  for (const serviceName of SCAFFOLDED_SERVICES) {
    totalCount++;
    if (await pushService(serviceName)) {
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
    console.log(
      chalk.bold.green(
        '\n🎉 All scaffolded services successfully pushed to codai-ecosystem!'
      )
    );
    console.log(chalk.gray('Ready for individual AI agent development.\n'));
  } else {
    console.log(
      chalk.yellow(
        `\n⚠️  ${totalCount - successCount} services had issues or were skipped.`
      )
    );
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { pushService, generateCommitMessage, SCAFFOLDED_SERVICES };
