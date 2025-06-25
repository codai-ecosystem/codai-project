#!/usr/bin/env node
/**
 * Codai App Integration Script
 * Safely integrates a Codai app into the monorepo structure
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function integrateApp(appName) {
  console.log(`🚀 Starting integration of ${appName}...`);

  try {
    // Phase 1: Pre-integration Validation
    console.log('📋 Phase 1: Pre-integration validation...');

    const appPath = path.join('apps', appName);
    const appExists = await fs
      .access(appPath)
      .then(() => true)
      .catch(() => false);

    if (appExists) {
      throw new Error(`App ${appName} already exists in apps/ directory`);
    }

    // Phase 2: Repository Integration
    console.log('📦 Phase 2: Repository integration...');

    try {
      // Try git subtree first with codai-ecosystem organization
      execSync(
        `git subtree add --prefix=apps/${appName} https://github.com/codai-ecosystem/${appName}.git main --squash`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      console.log('⚠️  Subtree failed, trying fallback clone method...');
      try {
        execSync(
          `git clone https://github.com/codai-ecosystem/${appName}.git apps/${appName}`,
          { stdio: 'inherit' }
        );
        execSync(`rm -rf apps/${appName}/.git`, { stdio: 'inherit' });
      } catch (cloneError) {
        console.log(
          '⚠️  Clone from codai-ecosystem failed, repository may not exist yet'
        );
        throw new Error(
          `Repository https://github.com/codai-ecosystem/${appName}.git not accessible`
        );
      }
    }

    // Phase 3: App Configuration
    console.log('⚙️  Phase 3: App configuration...');

    const agentProjectConfig = {
      name: appName,
      type: 'codai-app',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      status: 'integrated',
      repository: `https://github.com/codai-ecosystem/${appName}.git`,
      localPath: `apps/${appName}`,
      dependencies: [],
      scripts: {
        dev: 'next dev',
        build: 'next build',
        test: 'jest',
        lint: 'next lint',
      },
      ports: {
        dev: 3000,
        preview: 3001,
      },
      environment: {
        nodeVersion: '>=18.0.0',
        requiredEnvVars: [],
      },
    };

    await fs.writeFile(
      path.join(appPath, 'agent.project.json'),
      JSON.stringify(agentProjectConfig, null, 2)
    );

    // Phase 4: Update projects index
    console.log('📝 Phase 4: Updating projects index...');

    const indexPath = 'projects.index.json';
    const index = JSON.parse(await fs.readFile(indexPath, 'utf8'));

    index.apps.push({
      name: appName,
      type: 'codai-app',
      status: 'active',
      path: `apps/${appName}`,
      repository: `https://github.com/codai-ecosystem/${appName}.git`,
      lastUpdated: new Date().toISOString(),
      integration: {
        method: 'git-subtree',
        branch: 'main',
        lastSync: new Date().toISOString(),
      },
      metadata: {
        framework: 'next.js',
        language: 'typescript',
        styling: 'tailwindcss',
      },
    });

    index.totalApps = index.apps.length;
    index.lastUpdated = new Date().toISOString();

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));

    console.log(`✅ Successfully integrated ${appName}!`);
    console.log('🔄 Run "pnpm install" to update dependencies');
  } catch (error) {
    console.error(`❌ Integration failed: ${error.message}`);
    process.exit(1);
  }
}

const appName = process.argv[2];
if (!appName) {
  console.error('Usage: node scripts/integrate-app.js <app-name>');
  process.exit(1);
}

integrateApp(appName);
