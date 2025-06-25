#!/usr/bin/env node

/**
 * Push Remaining Scaffolded Services Script
 * Pushes scaffolded content to empty repositories in codai-ecosystem
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SERVICES_DIR = 'services';
const EMPTY_SERVICES = ['wallet', 'fabricai', 'sociai', 'cumparai', 'x'];

function execCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📋 Executing: ${command}`);
    const result = execSync(command, {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    console.log(`✅ Success: ${command}`);
    return result;
  } catch (error) {
    console.error(`❌ Error executing: ${command}`);
    console.error(error.message);
    throw error;
  }
}

function pushServiceToGitHub(serviceName) {
  const servicePath = path.join(SERVICES_DIR, serviceName);

  if (!fs.existsSync(servicePath)) {
    console.log(`⚠️  Service directory not found: ${servicePath}`);
    return false;
  }

  console.log(`\n🚀 Processing ${serviceName}...`);

  try {
    // Check if it's already a git repository
    const hasGit = fs.existsSync(path.join(servicePath, '.git'));

    if (!hasGit) {
      console.log(`📁 Initializing git repository for ${serviceName}`);
      execCommand('git init', servicePath);
      execCommand(
        `git remote add origin https://github.com/codai-ecosystem/${serviceName}.git`,
        servicePath
      );
    } else {
      // Fix remote URL if needed
      try {
        const remote = execCommand(
          'git remote get-url origin',
          servicePath
        ).trim();
        if (!remote.includes(`codai-ecosystem/${serviceName}`)) {
          console.log(`🔧 Fixing remote URL for ${serviceName}`);
          execCommand(
            `git remote set-url origin https://github.com/codai-ecosystem/${serviceName}.git`,
            servicePath
          );
        }
      } catch (error) {
        console.log(`🔧 Adding remote origin for ${serviceName}`);
        execCommand(
          `git remote add origin https://github.com/codai-ecosystem/${serviceName}.git`,
          servicePath
        );
      }
    }

    // Add all files
    execCommand('git add .', servicePath);

    // Check if there are changes to commit
    try {
      const status = execCommand('git status --porcelain', servicePath);
      if (!status.trim()) {
        console.log(`✅ ${serviceName}: No changes to commit`);
        return true;
      }
    } catch (error) {
      // Continue with commit
    }

    // Create descriptive commit message
    const commitMessage = `feat: Initial ${serviceName} scaffolding with Next.js 14 + TypeScript foundation

- Complete Next.js 14 setup with App Router
- TypeScript configuration with strict settings
- Tailwind CSS for styling
- VS Code development environment
- Vitest testing framework
- ESLint configuration
- ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} platform foundation ready for AI development`;

    // Commit changes
    execCommand(`git commit -m "${commitMessage}"`, servicePath);

    // Set main branch
    execCommand('git branch -M main', servicePath);

    // Push to GitHub
    execCommand('git push -u origin main', servicePath);

    console.log(
      `✅ ${serviceName}: Successfully pushed scaffolded content to GitHub!`
    );
    return true;
  } catch (error) {
    console.error(`❌ ${serviceName}: Failed to push to GitHub`);
    console.error(error.message);
    return false;
  }
}

async function main() {
  console.log('🎯 PUSHING REMAINING SCAFFOLDED SERVICES TO GITHUB\n');
  console.log(`Services to process: ${EMPTY_SERVICES.join(', ')}\n`);

  const results = [];

  for (const service of EMPTY_SERVICES) {
    const success = pushServiceToGitHub(service);
    results.push({ service, success });
  }

  console.log('\n📊 PUSH RESULTS:');
  console.log('================');

  let successCount = 0;
  for (const { service, success } of results) {
    const status = success ? '✅ SUCCESS' : '❌ FAILED';
    console.log(`${service.padEnd(10)} ${status}`);
    if (success) successCount++;
  }

  console.log(
    `\n🎉 COMPLETED: ${successCount}/${results.length} services pushed successfully!`
  );

  if (successCount === results.length) {
    console.log('\n🚀 ALL EMPTY REPOSITORIES NOW HAVE SCAFFOLDED CONTENT!');
    console.log('Ready for individual AI agent development on each service.');
  }
}

main().catch(console.error);
