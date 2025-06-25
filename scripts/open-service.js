#!/usr/bin/env node

/**
 * Open Individual Service Development Environment
 * Part of the Codai ecosystem orchestration system
 */

import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

const SERVICES = {
  // Priority 1 (Critical)
  codai: { priority: 'P1', type: 'central-platform', port: 3000 },
  memorai: { priority: 'P1', type: 'service', port: 3001 },
  logai: { priority: 'P1', type: 'identity-auth', port: 3002 },

  // Priority 2 (Important)
  bancai: { priority: 'P2', type: 'fintech', port: 3003 },
  fabricai: { priority: 'P2', type: 'ai-services', port: 3004 },
  wallet: { priority: 'P2', type: 'fintech-wallet', port: 3005 },

  // Priority 3 (Standard)
  studiai: { priority: 'P3', type: 'education', port: 3006 },
  sociai: { priority: 'P3', type: 'social', port: 3007 },
  cumparai: { priority: 'P3', type: 'ecommerce', port: 3008 },

  // Priority 4 (Support/Templates)
  publicai: { priority: 'P4', type: 'civic-tech', port: 3009 },
  templates: { priority: 'P4', type: 'templates', port: 3010 },
  x: { priority: 'P4', type: 'trading', port: 3011 },
};

function showUsage() {
  console.log(`
🚀 CODAI SERVICE DEVELOPMENT LAUNCHER
===================================

Usage: node scripts/open-service.js [service] [action]

Available Services:
${Object.entries(SERVICES)
  .map(
    ([name, config]) =>
      `  ${name.padEnd(12)} ${config.priority} | ${config.type} | Port ${config.port}`
  )
  .join('\n')}

Available Actions:
  code    - Open service in VS Code (default)
  dev     - Start development server
  build   - Build the service
  test    - Run tests
  status  - Show service status
  all     - Show all services status

Examples:
  node scripts/open-service.js codai
  node scripts/open-service.js memorai dev
  node scripts/open-service.js logai code
  node scripts/open-service.js all status
`);
}

function openInVSCode(serviceName) {
  const servicePath = join(rootDir, 'services', serviceName);

  if (!fs.existsSync(servicePath)) {
    console.error(`❌ Service '${serviceName}' not found at ${servicePath}`);
    return;
  }

  console.log(`🔧 Opening ${serviceName} in VS Code...`);

  // Open in new VS Code window
  const codeProcess = spawn('code', [servicePath, '--new-window'], {
    stdio: 'inherit',
    shell: true,
  });

  codeProcess.on('error', error => {
    console.error(`❌ Failed to open VS Code: ${error.message}`);
    console.log(`💡 Alternative: Open manually with: code ${servicePath}`);
  });

  codeProcess.on('close', code => {
    if (code === 0) {
      console.log(`✅ ${serviceName} opened in VS Code`);
    }
  });
}

function runServiceCommand(serviceName, command) {
  const servicePath = join(rootDir, 'services', serviceName);

  if (!fs.existsSync(servicePath)) {
    console.error(`❌ Service '${serviceName}' not found`);
    return;
  }

  console.log(`🚀 Running '${command}' in ${serviceName}...`);
  console.log(`📁 Path: ${servicePath}`);

  const pnpmProcess = spawn('pnpm', [command], {
    cwd: servicePath,
    stdio: 'inherit',
    shell: true,
  });

  pnpmProcess.on('error', error => {
    console.error(`❌ Failed to run command: ${error.message}`);
  });
}

function showServiceStatus(serviceName) {
  const servicePath = join(rootDir, 'services', serviceName);
  const config = SERVICES[serviceName];

  if (!fs.existsSync(servicePath)) {
    console.log(`❌ ${serviceName}: NOT FOUND`);
    return;
  }

  const packageJsonPath = join(servicePath, 'package.json');
  const hasPackageJson = fs.existsSync(packageJsonPath);
  const hasVSCode = fs.existsSync(join(servicePath, '.vscode'));
  const hasAgent = fs.existsSync(join(servicePath, 'agent.project.json'));

  console.log(`📊 ${serviceName.toUpperCase()}:`);
  console.log(
    `   Priority: ${config.priority} | Type: ${config.type} | Port: ${config.port}`
  );
  console.log(`   Package.json: ${hasPackageJson ? '✅' : '❌'}`);
  console.log(`   VS Code Config: ${hasVSCode ? '✅' : '❌'}`);
  console.log(`   Agent Config: ${hasAgent ? '✅' : '❌'}`);
  console.log(`   Path: ${servicePath}`);
  console.log('');
}

function showAllStatus() {
  console.log(`
🎯 CODAI ECOSYSTEM SERVICE STATUS
===============================
`);

  Object.keys(SERVICES).forEach(showServiceStatus);

  console.log(`
📋 QUICK COMMANDS:
- Open service: node scripts/open-service.js [service]
- Start dev: node scripts/open-service.js [service] dev
- View status: node scripts/open-service.js [service] status
`);
}

// Main execution
const [, , serviceName, action = 'code'] = process.argv;

if (!serviceName || serviceName === 'help' || serviceName === '--help') {
  showUsage();
  process.exit(0);
}

if (serviceName === 'all') {
  if (action === 'status') {
    showAllStatus();
  } else {
    console.log(`❌ Action '${action}' not available for 'all'. Use 'status'.`);
  }
  process.exit(0);
}

if (!SERVICES[serviceName]) {
  console.error(`❌ Unknown service: ${serviceName}`);
  console.log(`Available services: ${Object.keys(SERVICES).join(', ')}`);
  process.exit(1);
}

switch (action) {
  case 'code':
    openInVSCode(serviceName);
    break;
  case 'dev':
    runServiceCommand(serviceName, 'dev');
    break;
  case 'build':
    runServiceCommand(serviceName, 'build');
    break;
  case 'test':
    runServiceCommand(serviceName, 'test');
    break;
  case 'status':
    showServiceStatus(serviceName);
    break;
  default:
    console.error(`❌ Unknown action: ${action}`);
    console.log(`Available actions: code, dev, build, test, status`);
    process.exit(1);
}
