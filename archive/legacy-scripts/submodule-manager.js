#!/usr/bin/env node

/**
 * Development Workflow Manager for Git Submodules
 * 
 * Commands:
 * - npm run dev:ecosystem    # Start entire ecosystem
 * - npm run dev:memorai      # Open memorai in new VS Code
 * - npm run dev:logai        # Open logai in new VS Code  
 * - npm run dev:bancai       # Open bancai in new VS Code
 * - npm run sync:all         # Sync all submodules
 * - npm run sync:memorai     # Sync specific project
 */

const { execSync } = require('child_process');
const path = require('path');

class SubmoduleManager {
    constructor() {
        this.projects = [
            { name: 'memorai', path: 'apps/memorai' },
            { name: 'logai', path: 'apps/logai' },
            { name: 'bancai', path: 'apps/bancai' },
            { name: 'wallet', path: 'apps/wallet' },
            { name: 'fabricai', path: 'apps/fabricai' },
            { name: 'studiai', path: 'apps/studiai' },
            { name: 'sociai', path: 'apps/sociai' },
            { name: 'cumparai', path: 'apps/cumparai' },
            { name: 'x', path: 'apps/x' },
            { name: 'publicai', path: 'apps/publicai' },
            { name: 'codai', path: 'apps/codai' }
        ];
    }

    // Open project in new VS Code window
    openProject(projectName) {
        const project = this.projects.find(p => p.name === projectName);
        if (!project) {
            console.error(`❌ Project ${projectName} not found`);
            return;
        }

        console.log(`🚀 Opening ${projectName} in new VS Code window...`);

        try {
            // Sync latest changes first
            this.syncProject(projectName);

            // Open in new VS Code window
            execSync(`code ${project.path}`, { stdio: 'inherit' });

            console.log(`✅ ${projectName} opened successfully!`);
            console.log(`   Path: ${project.path}`);
            console.log(`   Independent development ready!`);

        } catch (error) {
            console.error(`❌ Error opening ${projectName}:`, error.message);
        }
    }

    // Sync specific project
    syncProject(projectName) {
        const project = this.projects.find(p => p.name === projectName);
        if (!project) {
            console.error(`❌ Project ${projectName} not found`);
            return;
        }

        console.log(`🔄 Syncing ${projectName}...`);

        try {
            execSync(`git submodule update --remote ${project.path}`, { stdio: 'inherit' });
            console.log(`✅ ${projectName} synced successfully!`);
        } catch (error) {
            console.error(`❌ Error syncing ${projectName}:`, error.message);
        }
    }

    // Sync all projects
    syncAll() {
        console.log('🔄 Syncing all submodules...');

        try {
            execSync('git submodule update --remote --recursive', { stdio: 'inherit' });
            console.log('✅ All projects synced successfully!');
        } catch (error) {
            console.error('❌ Error syncing projects:', error.message);
        }
    }

    // Start entire ecosystem
    startEcosystem() {
        console.log('🌟 Starting Codai Ecosystem...');

        try {
            // Sync all first
            this.syncAll();

            // Start ecosystem services
            execSync('pnpm dev', { stdio: 'inherit' });

        } catch (error) {
            console.error('❌ Error starting ecosystem:', error.message);
        }
    }

    // Show status of all projects
    showStatus() {
        console.log('📊 Submodule Status:\n');

        try {
            execSync('git submodule status', { stdio: 'inherit' });
        } catch (error) {
            console.error('❌ Error getting status:', error.message);
        }
    }
}

// CLI Interface
const manager = new SubmoduleManager();
const command = process.argv[2];
const projectName = process.argv[3];

switch (command) {
    case 'open':
        if (!projectName) {
            console.error('❌ Please specify project name: npm run dev:open <project>');
            process.exit(1);
        }
        manager.openProject(projectName);
        break;

    case 'sync':
        if (projectName) {
            manager.syncProject(projectName);
        } else {
            manager.syncAll();
        }
        break;

    case 'ecosystem':
        manager.startEcosystem();
        break;

    case 'status':
        manager.showStatus();
        break;

    default:
        console.log(`
🚀 Codai Submodule Manager

Usage:
  node submodule-manager.js open <project>   # Open project in new VS Code
  node submodule-manager.js sync [project]   # Sync project(s)
  node submodule-manager.js ecosystem        # Start entire ecosystem
  node submodule-manager.js status           # Show submodule status

Examples:
  node submodule-manager.js open memorai     # Open memorai independently
  node submodule-manager.js sync memorai     # Sync memorai only
  node submodule-manager.js sync             # Sync all projects
  node submodule-manager.js ecosystem        # Start full ecosystem
`);
}

module.exports = SubmoduleManager;
