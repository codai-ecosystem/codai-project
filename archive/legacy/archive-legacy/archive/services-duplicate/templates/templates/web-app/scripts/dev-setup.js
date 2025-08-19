#!/usr/bin/env node

/**
 * METU Template Development Setup Script
 *
 * This script automates the setup process for the METU template project:
 * 1. Checks and validates environment files
 * 2. Ensures Firebase emulators are properly configured
 * 3. Creates a unified development experience
 *
 * Usage: node scripts/dev-setup.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const ENV_FILES = {
  rootEnv: '.env.local',
  webEnv: 'apps/web/.env.local',
  webEmulators: 'apps/web/.env.emulators',
  backendEnv: 'apps/backend/.env.local',
};

const FIREBASE_DIRS = {
  configDir: 'apps/web/firebase',
  seedDir: 'apps/web/firebase/seed',
};

// Utility functions
function logSuccess(message) {
  console.log(chalk.green('✓'), message);
}

function logError(message) {
  console.log(chalk.red('✗'), message);
}

function logInfo(message) {
  console.log(chalk.blue('ℹ'), message);
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function createDirectoryIfNotExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logSuccess(`Created directory: ${dir}`);
  }
}

function copyFileIfNotExists(source, dest) {
  if (!fs.existsSync(dest) && fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    logSuccess(`Created ${dest} from template`);
  }
}

// Check environment files
function checkEnvironmentFiles() {
  logInfo('Checking environment files...');

  // Create .env.local files if they don't exist
  Object.entries(ENV_FILES).forEach(([key, filePath]) => {
    const templatePath = `${filePath}.example`;

    if (!fileExists(filePath) && fileExists(templatePath)) {
      copyFileIfNotExists(templatePath, filePath);
    } else if (!fileExists(filePath)) {
      logError(`Missing ${filePath} and no template found.`);
    } else {
      logSuccess(`${filePath} exists`);
    }
  });
}

// Check Firebase configuration
function checkFirebaseConfig() {
  logInfo('Checking Firebase configuration...');

  // Ensure Firebase config directories exist
  Object.values(FIREBASE_DIRS).forEach(dir => {
    createDirectoryIfNotExists(dir);
  });

  // Check Firebase configuration file
  const firebaseConfigPath = path.join(FIREBASE_DIRS.configDir, 'firebase.json');
  if (!fileExists(firebaseConfigPath)) {
    logError(
      'Firebase configuration not found. Please run firebase init in the apps/web directory.'
    );
  } else {
    logSuccess('Firebase configuration exists');
  }
}

// Set up development workspace
function setupDevelopment() {
  try {
    logInfo('Installing dependencies...');
    execSync('pnpm install', { stdio: 'inherit' });
    logSuccess('Dependencies installed');
  } catch (error) {
    logError('Failed to install dependencies');
    console.error(error);
  }
}

// Main execution
async function main() {
  console.log(chalk.bold('\n🚀 METU Template Development Setup\n'));

  // Run all setup functions
  checkEnvironmentFiles();
  checkFirebaseConfig();
  setupDevelopment();

  console.log(chalk.bold('\n✅ Setup complete!\n'));
  console.log(chalk.bold('Next steps:'));
  console.log('  1. Edit .env.local files to add your Firebase configuration');
  console.log('  2. Run pnpm dev to start the development servers');
  console.log('  3. Run pnpm dev:firebase to start Firebase emulators');
  console.log('\nHappy coding! 🎉\n');
}

// Run the main function
main().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});
