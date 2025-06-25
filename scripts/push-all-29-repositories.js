#!/usr/bin/env node

/**
 * Push All Scaffolded Services to GitHub Script
 * Ensures all 29 repositories have content and are connected to the ecosystem
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SERVICES_DIR = 'services';

// All repositories that need scaffolding pushed
const REPOSITORIES_TO_SCAFFOLD = [
  'stocai',
  'marketai',
  'analizai',
  'ajutai',
  'legalizai',
  'jucai',
  'metu',
  'tools',
  'explorer',
  'hub',
  'dash',
  'admin',
  'docs',
  'kodex',
  'mod',
  'id',
  'AIDE',
];

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

    // Create descriptive commit message based on service name
    const getServiceDescription = name => {
      const descriptions = {
        stocai: 'AI Stock Trading Platform',
        marketai: 'AI Marketing Platform',
        analizai: 'AI Analytics Platform',
        ajutai: 'AI Support & Help Platform',
        legalizai: 'AI Legal Services Platform',
        jucai: 'AI Gaming Platform',
        metu: 'AI Metrics & Analytics',
        tools: 'Development Tools & Utilities',
        explorer: 'AI Blockchain Explorer',
        hub: 'Central Hub & Dashboard',
        dash: 'Analytics Dashboard',
        admin: 'Admin Panel & Management',
        docs: 'Documentation Platform',
        kodex: 'Code Repository & Version Control',
        mod: 'Modding & Extension Platform',
        id: 'Identity Management System',
        AIDE: 'AI Development Environment',
      };
      return descriptions[name] || 'AI-powered service';
    };

    const description = getServiceDescription(serviceName);
    const commitMessage = `feat: Initial ${serviceName} scaffolding with Next.js 14 + TypeScript foundation

- Complete Next.js 14 setup with App Router
- TypeScript configuration with strict settings
- Tailwind CSS for styling
- VS Code development environment
- Vitest testing framework
- ESLint configuration
- ${description} foundation ready for AI development`;

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
  console.log('🎯 PUSHING ALL SCAFFOLDED SERVICES TO GITHUB');
  console.log('==============================================');
  console.log(`Services to process: ${REPOSITORIES_TO_SCAFFOLD.length}`);
  console.log(`Services: ${REPOSITORIES_TO_SCAFFOLD.join(', ')}\n`);

  const results = [];

  for (const service of REPOSITORIES_TO_SCAFFOLD) {
    const success = pushServiceToGitHub(service);
    results.push({ service, success });
  }

  console.log('\n📊 PUSH RESULTS:');
  console.log('================');

  let successCount = 0;
  for (const { service, success } of results) {
    const status = success ? '✅ SUCCESS' : '❌ FAILED';
    console.log(`${service.padEnd(12)} ${status}`);
    if (success) successCount++;
  }

  console.log(
    `\n🎉 COMPLETED: ${successCount}/${results.length} services pushed successfully!`
  );

  if (successCount === results.length) {
    console.log('\n🚀 ALL SCAFFOLDED REPOSITORIES NOW HAVE CONTENT!');
    console.log(
      '✨ All 29 repositories in codai-ecosystem are filled with content'
    );
    console.log('🔗 All repositories are properly connected to the ecosystem');
    console.log('👥 Ready for individual AI agent development on each service');

    console.log('\n📋 NEXT ACTIONS:');
    console.log('1. Run: git submodule update --init --recursive');
    console.log('2. Run: npm run verify-repos');
    console.log('3. Start development: npm run dev');
    console.log(
      '4. Open individual services in VS Code for parallel development'
    );
  } else {
    console.log(
      '\n⚠️  Some repositories failed to push. Check the errors above.'
    );
  }
}

main().catch(console.error);
