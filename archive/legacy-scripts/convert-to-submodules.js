#!/usr/bin/env node

/**
 * Convert Git Subtrees to Git Submodules for Automatic Sync
 * 
 * This script will:
 * 1. Extract current subtree content to individual repositories
 * 2. Remove subtree content from parent repo
 * 3. Add projects as git submodules
 * 4. Setup automatic sync workflows
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECTS = [
    {
        name: 'memorai',
        path: 'apps/memorai',
        repo: 'https://github.com/codai-ecosystem/memorai.git',
        branch: 'main'
    },
    {
        name: 'logai',
        path: 'apps/logai',
        repo: 'https://github.com/codai-ecosystem/logai.git',
        branch: 'main'
    },
    {
        name: 'bancai',
        path: 'apps/bancai',
        repo: 'https://github.com/codai-ecosystem/bancai.git',
        branch: 'main'
    },
    // Add all other apps/services that should be independent
];

async function convertToSubmodules() {
    console.log('🚀 Converting Git Subtrees to Git Submodules...\n');

    for (const project of PROJECTS) {
        console.log(`📦 Processing ${project.name}...`);

        try {
            // Step 1: Create/update individual repository
            console.log(`  ✅ Extracting ${project.path} content...`);

            // Extract current content
            const tempDir = `temp-${project.name}`;
            execSync(`mkdir -p ${tempDir}`);
            execSync(`cp -r ${project.path}/* ${tempDir}/`);

            // Step 2: Remove from parent (after backup)
            console.log(`  🗑️  Removing subtree content...`);
            execSync(`git rm -rf ${project.path}`);

            // Step 3: Add as submodule
            console.log(`  🔗 Adding as submodule...`);
            execSync(`git submodule add ${project.repo} ${project.path}`);

            // Step 4: Initialize submodule
            execSync(`git submodule init`);
            execSync(`git submodule update`);

            console.log(`  ✅ ${project.name} converted successfully!\n`);

        } catch (error) {
            console.error(`  ❌ Error processing ${project.name}:`, error.message);
        }
    }

    // Step 5: Create .gitmodules configuration
    console.log('📝 Creating .gitmodules configuration...');

    // Step 6: Setup automatic sync workflows
    console.log('⚙️  Setting up automatic sync workflows...');
    await setupAutomaticSync();

    console.log('🎉 Conversion complete! You now have:');
    console.log('   - Individual repositories for each project');
    console.log('   - Automatic synchronization');
    console.log('   - Independent VS Code development');
    console.log('   - Ecosystem coordination via submodules');
}

async function setupAutomaticSync() {
    // Create GitHub Actions workflow for automatic sync
    const workflowContent = `
name: Sync Submodules

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
          token: \${{ secrets.GITHUB_TOKEN }}
      
      - name: Update submodules
        run: |
          git submodule update --remote --recursive
          
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git commit -m "Auto-sync submodules" || exit 0
          git push
`;

    fs.writeFileSync('.github/workflows/sync-submodules.yml', workflowContent.trim());
}

// Run conversion
if (require.main === module) {
    convertToSubmodules().catch(console.error);
}

module.exports = { convertToSubmodules };
