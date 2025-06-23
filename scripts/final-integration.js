#!/usr/bin/env node
/**
 * Final Repository Integration Script
 * Properly integrates all available repositories from codai-ecosystem
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';

// All known codai-ecosystem repositories
const ALL_REPOS = [
  { name: 'codai', priority: 1, description: 'Central Platform & AIDE Hub', hasContent: true },
  { name: 'memorai', priority: 1, description: 'AI Memory & Database Core', hasContent: true },
  { name: 'studiai', priority: 3, description: 'AI Education Platform', hasContent: true },
  { name: 'templates', priority: 4, description: 'Shared Templates & Boilerplates', hasContent: true },
  { name: 'logai', priority: 1, description: 'Identity & Authentication Hub', hasContent: false },
  { name: 'bancai', priority: 2, description: 'Financial Platform', hasContent: false },
  { name: 'wallet', priority: 2, description: 'Programmable Wallet', hasContent: false },
  { name: 'fabricai', priority: 2, description: 'AI Services Platform', hasContent: false },
  { name: 'sociai', priority: 3, description: 'AI Social Platform', hasContent: false },
  { name: 'cumparai', priority: 3, description: 'AI Shopping Platform', hasContent: false },
  { name: 'publicai', priority: 4, description: 'Civic AI & Transparency Tools', hasContent: false },
  { name: 'x', priority: 4, description: 'AI Trading Platform', hasContent: false }
];

function checkRepoExists(repoName) {
  try {
    execSync(`git ls-remote --heads https://github.com/codai-ecosystem/${repoName}.git`, { 
      stdio: 'pipe',
      timeout: 5000 
    });
    return true;
  } catch (error) {
    return false;
  }
}

function checkRepoHasContent(repoName) {
  try {
    const output = execSync(`git ls-remote --heads https://github.com/codai-ecosystem/${repoName}.git`, { 
      encoding: 'utf8',
      timeout: 5000 
    });
    return output.trim().length > 0;
  } catch (error) {
    return false;
  }
}

function addToGitmodules(repo) {
  const gitmodulesPath = '.gitmodules';
  const entry = `[submodule "services/${repo.name}"]
\tpath = services/${repo.name}
\turl = https://github.com/codai-ecosystem/${repo.name}.git\n`;

  try {
    let content = '';
    if (fs.existsSync(gitmodulesPath)) {
      content = fs.readFileSync(gitmodulesPath, 'utf8');
      
      // Check if already exists
      if (content.includes(`[submodule "services/${repo.name}"]`)) {
        return true; // Already exists
      }
    }
    
    content += entry;
    fs.writeFileSync(gitmodulesPath, content);
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to add ${repo.name} to .gitmodules: ${error.message}`));
    return false;
  }
}

function cloneRepo(repo) {
  const repoPath = `services/${repo.name}`;
  
  try {
    if (fs.existsSync(repoPath)) {
      console.log(chalk.yellow(`⚠️  ${repo.name} directory already exists`));
      return true;
    }

    console.log(chalk.blue(`📥 Cloning ${repo.name}...`));
    execSync(`git clone https://github.com/codai-ecosystem/${repo.name}.git ${repoPath}`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    if (repo.hasContent) {
      console.log(chalk.green(`✅ Successfully cloned ${repo.name} (with content)`));
    } else {
      console.log(chalk.yellow(`⚠️  Cloned ${repo.name} (empty repository)`));
    }
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to clone ${repo.name}: ${error.message}`));
    return false;
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n🎯 CODAI ECOSYSTEM - FINAL REPOSITORY INTEGRATION'));
  console.log(chalk.cyan('Integrating all available repositories from codai-ecosystem organization...\n'));

  // Create services directory if it doesn't exist
  if (!fs.existsSync('services')) {
    fs.mkdirSync('services');
  }

  const results = {
    existing: [],
    cloned: [],
    empty: [],
    failed: [],
    notFound: []
  };

  // Process each repository
  for (const repo of ALL_REPOS) {
    console.log(chalk.bold(`\n📦 Processing ${repo.name} (${repo.description})`));
    
    // Check if repository exists
    const exists = checkRepoExists(repo.name);
    if (!exists) {
      console.log(chalk.red(`❌ Repository ${repo.name} not found`));
      results.notFound.push(repo);
      continue;
    }

    // Check if already exists locally
    const localPath = `services/${repo.name}`;
    if (fs.existsSync(localPath)) {
      console.log(chalk.yellow(`⚠️  ${repo.name} already exists locally`));
      results.existing.push(repo);
      continue;
    }

    // Clone the repository
    const success = cloneRepo(repo);
    if (success) {
      if (repo.hasContent) {
        results.cloned.push(repo);
      } else {
        results.empty.push(repo);
      }
    } else {
      results.failed.push(repo);
    }
  }

  // Update .gitmodules to include all cloned repos as submodules
  console.log(chalk.bold.blue('\n📝 Updating .gitmodules configuration'));
  const allRepos = [...results.existing, ...results.cloned, ...results.empty];
  for (const repo of allRepos) {
    addToGitmodules(repo);
  }

  // Convert to proper submodules
  console.log(chalk.bold.blue('\n🔄 Converting clones to submodules'));
  for (const repo of [...results.cloned, ...results.empty]) {
    try {
      const repoPath = `services/${repo.name}`;
      
      // Remove the .git directory to prepare for submodule conversion
      const gitDir = `${repoPath}/.git`;
      if (fs.existsSync(gitDir)) {
        execSync(`rmdir /S /Q "${gitDir}"`, { stdio: 'pipe' });
      }
      
      console.log(chalk.green(`✅ Prepared ${repo.name} for submodule conversion`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to prepare ${repo.name}: ${error.message}`));
    }
  }

  // Final submodule sync
  console.log(chalk.bold.blue('\n🔄 Syncing all submodules'));
  try {
    execSync('git add .gitmodules', { stdio: 'inherit' });
    execSync('git submodule sync', { stdio: 'inherit' });
    console.log(chalk.green('✅ Submodules synced successfully'));
  } catch (error) {
    console.log(chalk.red(`❌ Failed to sync submodules: ${error.message}`));
  }

  // Print comprehensive summary
  console.log(chalk.bold.green('\n🎉 INTEGRATION SUMMARY:'));
  
  console.log(chalk.green(`✅ Successfully Integrated: ${results.existing.length + results.cloned.length + results.empty.length}`));
  console.log(chalk.blue('   📚 Repositories with Content:'));
  [...results.existing.filter(r => r.hasContent), ...results.cloned].forEach(repo => 
    console.log(chalk.green(`      - ${repo.name} (${repo.description})`))
  );
  
  console.log(chalk.yellow('   📋 Empty Repositories (templates ready):'));
  [...results.existing.filter(r => !r.hasContent), ...results.empty].forEach(repo => 
    console.log(chalk.yellow(`      - ${repo.name} (${repo.description})`))
  );

  if (results.failed.length > 0) {
    console.log(chalk.red(`❌ Failed: ${results.failed.length}`));
    results.failed.forEach(repo => console.log(chalk.red(`   - ${repo.name} (${repo.description})`)));
  }

  if (results.notFound.length > 0) {
    console.log(chalk.red(`🔍 Not Found: ${results.notFound.length}`));
    results.notFound.forEach(repo => console.log(chalk.red(`   - ${repo.name} (${repo.description})`)));
  }

  const totalIntegrated = results.existing.length + results.cloned.length + results.empty.length;
  console.log(chalk.bold.cyan(`\n📊 Total Integrated: ${totalIntegrated}/${ALL_REPOS.length} repositories`));

  console.log(chalk.bold.blue('\n🎯 Next Steps:'));
  console.log(chalk.blue('   1. Run "npm run status" to verify integration'));
  console.log(chalk.blue('   2. Run "npm run dev" to start development'));
  console.log(chalk.blue('   3. Empty repositories are ready for content creation'));
  console.log(chalk.blue('   4. Use individual VS Code windows for service development'));
}

main().catch(console.error);
