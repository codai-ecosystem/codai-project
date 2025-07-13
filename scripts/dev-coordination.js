#!/usr/bin/env node

/**
 * Development Coordination Script
 * Manage multiple Codai services simultaneously
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

const PRIORITY_GROUPS = {
  p1: ['codai', 'memorai', 'logai'],
  p2: ['bancai', 'fabricai', 'wallet'],
  p3: ['studiai', 'sociai', 'cumparai'],
  p4: ['publicai', 'templates', 'x'],
};

const DEVELOPMENT_MODES = {
  focus: {
    description: 'Open Priority 1 services for focused development',
    services: PRIORITY_GROUPS.p1,
  },
  platform: {
    description: 'Open core platform services (P1 + P2)',
    services: [...PRIORITY_GROUPS.p1, ...PRIORITY_GROUPS.p2],
  },
  full: {
    description: 'Open all services for full ecosystem development',
    services: Object.values(PRIORITY_GROUPS).flat(),
  },
};

function showUsage() {
  console.log(`
🎯 CODAI DEVELOPMENT COORDINATION
===============================

Usage: node scripts/dev-coordination.js [mode] [action]

Development Modes:
${Object.entries(DEVELOPMENT_MODES)
  .map(
    ([mode, config]) =>
      `  ${mode.padEnd(10)} - ${config.description}\n              Services: ${config.services.join(', ')}`
  )
  .join('\n')}

Actions:
  open    - Open all services in VS Code (default)
  dev     - Start development servers for all services
  status  - Show status of all services in mode
  build   - Build all services in mode
  
Examples:
  node scripts/dev-coordination.js focus        # Open P1 services
  node scripts/dev-coordination.js platform dev # Start P1+P2 services
  node scripts/dev-coordination.js full status  # Check all services

Individual Service Commands:
  node scripts/open-service.js [service] [action]
`);
}

async function executeForServices(services, action, sequential = false) {
  console.log(`
🚀 Executing '${action}' for services: ${services.join(', ')}
${'='.repeat(60)}
`);

  if (sequential) {
    // Execute one by one
    for (const service of services) {
      await executeServiceAction(service, action);
    }
  } else {
    // Execute in parallel
    const promises = services.map(service =>
      executeServiceAction(service, action)
    );
    await Promise.allSettled(promises);
  }
}

function executeServiceAction(service, action) {
  return new Promise((resolve, reject) => {
    const servicePath = join(rootDir, 'services', service);

    if (!fs.existsSync(servicePath)) {
      console.log(`⚠️  ${service}: Service not found, skipping...`);
      resolve();
      return;
    }

    console.log(`🔧 ${service}: Starting ${action}...`);

    let command, args;

    switch (action) {
      case 'open':
        command = 'code';
        args = [servicePath, '--new-window'];
        break;
      case 'dev':
      case 'build':
      case 'test':
        command = 'pnpm';
        args = [action];
        break;
      case 'status':
        // Handle status separately
        showServiceQuickStatus(service);
        resolve();
        return;
      default:
        console.error(`❌ Unknown action: ${action}`);
        reject(new Error(`Unknown action: ${action}`));
        return;
    }

    const process = spawn(command, args, {
      cwd: action === 'open' ? undefined : servicePath,
      stdio: action === 'open' ? 'pipe' : 'inherit',
      shell: true,
    });

    process.on('error', error => {
      console.error(`❌ ${service}: Failed to ${action} - ${error.message}`);
      resolve(); // Don't reject to continue with other services
    });

    process.on('close', code => {
      if (code === 0) {
        console.log(`✅ ${service}: ${action} completed successfully`);
      } else if (action !== 'open') {
        // VS Code opening might return non-zero but still work
        console.error(`❌ ${service}: ${action} failed with code ${code}`);
      }
      resolve();
    });

    // For 'open' action, don't wait too long
    if (action === 'open') {
      setTimeout(() => {
        console.log(`⏱️  ${service}: VS Code opening (backgrounded)`);
        resolve();
      }, 2000);
    }
  });
}

function showServiceQuickStatus(service) {
  const servicePath = join(rootDir, 'services', service);
  const packageJsonPath = join(servicePath, 'package.json');

  if (!fs.existsSync(servicePath)) {
    console.log(`❌ ${service}: NOT FOUND`);
    return;
  }

  let info = '';
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      info = pkg.version ? `v${pkg.version}` : 'no version';
    } catch (e) {
      info = 'invalid package.json';
    }
  } else {
    info = 'no package.json';
  }

  const hasVSCode = fs.existsSync(join(servicePath, '.vscode'));
  const hasAgent = fs.existsSync(join(servicePath, 'agent.project.json'));

  console.log(
    `📊 ${service}: ${info} | VS Code: ${hasVSCode ? '✅' : '❌'} | Agent: ${hasAgent ? '✅' : '❌'}`
  );
}

async function setupDevelopmentEnvironment(mode) {
  const config = DEVELOPMENT_MODES[mode];

  console.log(`
🎯 SETTING UP ${mode.toUpperCase()} DEVELOPMENT ENVIRONMENT
${'='.repeat(60)}
${config.description}
Services: ${config.services.join(', ')}
`);

  // First show status
  console.log('📊 Current Status:');
  config.services.forEach(showServiceQuickStatus);

  console.log(`\n🚀 Opening services in VS Code...`);
  await executeForServices(config.services, 'open');

  console.log(`
✅ Development environment ready!

Next steps:
1. Switch between VS Code windows for each service
2. Use integrated terminals in each service for commands
3. Start development servers: pnpm dev (in each service)
4. Use the orchestration layer for coordination

Useful commands:
- node scripts/dev-coordination.js ${mode} dev     # Start all dev servers
- node scripts/dev-coordination.js ${mode} status  # Check all services
- node scripts/open-service.js [service] [action]  # Individual service commands
`);
}

// Main execution
const [, , mode = 'focus', action = 'open'] = process.argv;

if (!mode || mode === 'help' || mode === '--help') {
  showUsage();
  process.exit(0);
}

if (!DEVELOPMENT_MODES[mode]) {
  console.error(`❌ Unknown mode: ${mode}`);
  console.log(`Available modes: ${Object.keys(DEVELOPMENT_MODES).join(', ')}`);
  process.exit(1);
}

const config = DEVELOPMENT_MODES[mode];

if (action === 'open') {
  setupDevelopmentEnvironment(mode);
} else {
  executeForServices(
    config.services,
    action,
    action === 'build' || action === 'test'
  );
}
