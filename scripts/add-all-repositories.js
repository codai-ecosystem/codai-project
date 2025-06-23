#!/usr/bin/env node
/**
 * Add All Repositories from codai-ecosystem Organization
 * This script integrates all available repositories from the codai-ecosystem organization
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Define all known codai-ecosystem services
const ECOSYSTEM_SERVICES = [
  {
    name: 'codai',
    description: 'Central Platform & AIDE Hub',
    priority: 1,
    domain: 'codai.ro',
    repo: 'https://github.com/codai-ecosystem/codai.git'
  },
  {
    name: 'memorai',
    description: 'AI Memory & Database Core',
    priority: 1,
    domain: 'memorai.ro',
    repo: 'https://github.com/codai-ecosystem/memorai.git'
  },
  {
    name: 'logai',
    description: 'Identity & Authentication Hub',
    priority: 1,
    domain: 'logai.ro',
    repo: 'https://github.com/codai-ecosystem/logai.git'
  },
  {
    name: 'bancai',
    description: 'Financial Platform',
    priority: 2,
    domain: 'bancai.ro',
    repo: 'https://github.com/codai-ecosystem/bancai.git'
  },
  {
    name: 'wallet',
    description: 'Programmable Wallet',
    priority: 2,
    domain: 'wallet.bancai.ro',
    repo: 'https://github.com/codai-ecosystem/wallet.git'
  },
  {
    name: 'fabricai',
    description: 'AI Services Platform',
    priority: 2,
    domain: 'fabricai.ro',
    repo: 'https://github.com/codai-ecosystem/fabricai.git'
  },
  {
    name: 'studiai',
    description: 'AI Education Platform',
    priority: 3,
    domain: 'studiai.ro',
    repo: 'https://github.com/codai-ecosystem/studiai.git'
  },
  {
    name: 'sociai',
    description: 'AI Social Platform',
    priority: 3,
    domain: 'sociai.ro',
    repo: 'https://github.com/codai-ecosystem/sociai.git'
  },
  {
    name: 'cumparai',
    description: 'AI Shopping Platform',
    priority: 3,
    domain: 'cumparai.ro',
    repo: 'https://github.com/codai-ecosystem/cumparai.git'
  },
  {
    name: 'publicai',
    description: 'Civic AI & Transparency Tools',
    priority: 4,
    domain: 'publicai.ro',
    repo: 'https://github.com/codai-ecosystem/publicai.git'
  },
  {
    name: 'x',
    description: 'AI Trading Platform',
    priority: 4,
    domain: 'x.codai.ro',
    repo: 'https://github.com/codai-ecosystem/x.git'
  },
  // Additional repositories that might exist
  {
    name: 'explorer',
    description: 'AI Blockchain Explorer',
    priority: 4,
    domain: 'explorer.codai.ro',
    repo: 'https://github.com/codai-ecosystem/explorer.git'
  },
  {
    name: 'marketai',
    description: 'AI Marketplace',
    priority: 4,
    domain: 'marketai.ro',
    repo: 'https://github.com/codai-ecosystem/marketai.git'
  },
  {
    name: 'analizai',
    description: 'AI Analytics Platform',
    priority: 4,
    domain: 'analizai.ro',
    repo: 'https://github.com/codai-ecosystem/analizai.git'
  },
  {
    name: 'templates',
    description: 'Shared Templates & Boilerplates',
    priority: 4,
    domain: null,
    repo: 'https://github.com/codai-ecosystem/templates.git'
  },
  {
    name: 'tools',
    description: 'Development Tools & Utilities',
    priority: 4,
    domain: null,
    repo: 'https://github.com/codai-ecosystem/tools.git'
  }
];

async function checkRepositoryExists(repoUrl) {
  try {
    execSync(`git ls-remote --heads ${repoUrl}`, { 
      stdio: 'pipe',
      timeout: 10000 
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function addAsSubmodule(service) {
  const servicePath = `services/${service.name}`;
  
  try {
    // Check if already exists as submodule
    if (fs.existsSync(servicePath)) {
      console.log(chalk.yellow(`⚠️  ${service.name} already exists in services/`));
      return { status: 'exists', service };
    }

    // Check if repository exists
    const exists = await checkRepositoryExists(service.repo);
    if (!exists) {
      console.log(chalk.red(`❌ Repository ${service.repo} does not exist or is not accessible`));
      return { status: 'not_found', service };
    }

    // Add as git submodule
    console.log(chalk.blue(`📥 Adding ${service.name} as git submodule...`));
    execSync(`git submodule add ${service.repo} ${servicePath}`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log(chalk.green(`✅ Successfully added ${service.name} to services/`));
    return { status: 'added', service };

  } catch (error) {
    console.log(chalk.red(`❌ Failed to add ${service.name}: ${error.message}`));
    return { status: 'error', service, error: error.message };
  }
}

async function migrateFromApps(service) {
  const appsPath = `apps/${service.name}`;
  const servicePath = `services/${service.name}`;
  
  if (!fs.existsSync(appsPath)) {
    return { status: 'not_in_apps', service };
  }

  try {
    // If it's already in services, skip
    if (fs.existsSync(servicePath)) {
      console.log(chalk.yellow(`⚠️  ${service.name} already in services/, skipping migration`));
      return { status: 'already_migrated', service };
    }

    // Check if the apps version has real content or is just a template
    const packageJsonPath = path.join(appsPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.name && packageJson.name.includes('template')) {
        console.log(chalk.blue(`📋 ${service.name} in apps/ is a template, will replace with repository`));
      }
    }

    // Add as submodule (this will replace template content)
    return await addAsSubmodule(service);

  } catch (error) {
    console.log(chalk.red(`❌ Failed to migrate ${service.name}: ${error.message}`));
    return { status: 'error', service, error: error.message };
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n🚀 CODAI ECOSYSTEM - REPOSITORY INTEGRATION SCRIPT'));
  console.log(chalk.cyan('Adding all available repositories from codai-ecosystem organization...\n'));

  const results = {
    added: [],
    exists: [],
    not_found: [],
    errors: [],
    migrated: []
  };

  // Process each service
  for (const service of ECOSYSTEM_SERVICES) {
    console.log(chalk.bold(`\n📦 Processing ${service.name} (${service.description})`));
    
    const result = await migrateFromApps(service);
    
    switch (result.status) {
      case 'added':
        results.added.push(result.service);
        break;
      case 'exists':
      case 'already_migrated':
        results.exists.push(result.service);
        break;
      case 'not_found':
        results.not_found.push(result.service);
        break;
      case 'error':
        results.errors.push(result);
        break;
      case 'not_in_apps':
        // Try to add as submodule anyway
        const addResult = await addAsSubmodule(service);
        if (addResult.status === 'added') {
          results.added.push(addResult.service);
        } else if (addResult.status === 'exists') {
          results.exists.push(addResult.service);
        } else if (addResult.status === 'not_found') {
          results.not_found.push(addResult.service);
        } else {
          results.errors.push(addResult);
        }
        break;
    }
  }

  // Update submodules
  if (results.added.length > 0) {
    console.log(chalk.blue('\n🔄 Initializing and updating submodules...'));
    try {
      execSync('git submodule update --init --recursive', { stdio: 'inherit' });
      console.log(chalk.green('✅ Submodules updated successfully'));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to update submodules: ${error.message}`));
    }
  }

  // Print summary
  console.log(chalk.bold.green('\n🎉 INTEGRATION SUMMARY:'));
  console.log(chalk.green(`✅ Added: ${results.added.length} repositories`));
  results.added.forEach(service => console.log(chalk.green(`   - ${service.name} (${service.description})`)));
  
  console.log(chalk.yellow(`⚠️  Existing: ${results.exists.length} repositories`));
  results.exists.forEach(service => console.log(chalk.yellow(`   - ${service.name} (${service.description})`)));
  
  console.log(chalk.red(`❌ Not Found: ${results.not_found.length} repositories`));
  results.not_found.forEach(service => console.log(chalk.red(`   - ${service.name} (${service.description})`)));
  
  if (results.errors.length > 0) {
    console.log(chalk.red(`💥 Errors: ${results.errors.length} repositories`));
    results.errors.forEach(result => console.log(chalk.red(`   - ${result.service.name}: ${result.error}`)));
  }

  const totalIntegrated = results.added.length + results.exists.length;
  console.log(chalk.bold.cyan(`\n📊 Total Integrated: ${totalIntegrated}/${ECOSYSTEM_SERVICES.length} repositories`));
  
  if (results.added.length > 0) {
    console.log(chalk.blue('\n🎯 Next Steps:'));
    console.log(chalk.blue('   1. Run "npm run status" to verify integration'));
    console.log(chalk.blue('   2. Run "npm run dev" to start development'));
    console.log(chalk.blue('   3. Check individual services in services/ directory'));
  }
}

main().catch(console.error);
