#!/usr/bin/env node

/**
 * Codai Service Setup Script
 * Migrates existing apps to new service architecture with git submodules
 */

import { execSync, spawn } from 'child_process';
import {
  existsSync,
  readdirSync,
  statSync,
  copyFileSync,
  mkdirSync,
  rmSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');
const APPS_DIR = join(PROJECT_ROOT, 'apps');
const SERVICES_DIR = join(PROJECT_ROOT, 'services');

// Service repository mapping
const SERVICE_REPOS = {
  codai: 'https://github.com/codai-ecosystem/codai.git',
  memorai: 'https://github.com/codai-ecosystem/memorai.git',
  studiai: 'https://github.com/codai-ecosystem/studiai.git',
  logai: 'https://github.com/codai-ecosystem/logai.git',
  bancai: 'https://github.com/codai-ecosystem/bancai.git',
  fabricai: 'https://github.com/codai-ecosystem/fabricai.git',
  sociai: 'https://github.com/codai-ecosystem/sociai.git',
  cumparai: 'https://github.com/codai-ecosystem/cumparai.git',
  publicai: 'https://github.com/codai-ecosystem/publicai.git',
  wallet: 'https://github.com/codai-ecosystem/wallet.git',
  x: 'https://github.com/codai-ecosystem/x.git',
};

function logStatus(message, type = 'info') {
  const colors = {
    info: chalk.blue,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
  };

  console.log(colors[type](`[SETUP] ${message}`));
}

function execCommand(command, cwd = PROJECT_ROOT, silent = false) {
  try {
    const result = execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit',
    });
    return { success: true, output: result };
  } catch (error) {
    if (!silent) {
      logStatus(`Command failed: ${command}`, 'error');
      logStatus(error.message, 'error');
    }
    return { success: false, error: error.message };
  }
}

function checkGitRepository() {
  const result = execCommand('git status', PROJECT_ROOT, true);
  if (!result.success) {
    logStatus(
      'This is not a git repository. Please initialize git first.',
      'error'
    );
    process.exit(1);
  }
}

function backupExistingApps() {
  if (!existsSync(APPS_DIR)) {
    logStatus('No existing apps directory found.', 'info');
    return;
  }

  const backupDir = join(PROJECT_ROOT, 'apps-backup');
  logStatus('Creating backup of existing apps...', 'info');

  if (existsSync(backupDir)) {
    rmSync(backupDir, { recursive: true, force: true });
  }

  execCommand(`cp -r "${APPS_DIR}" "${backupDir}"`);
  logStatus('Backup created at apps-backup/', 'success');
}

function setupService(serviceName, options = {}) {
  const servicePath = join(SERVICES_DIR, serviceName);
  const repoUrl = SERVICE_REPOS[serviceName];

  if (!repoUrl) {
    logStatus(`No repository configured for service: ${serviceName}`, 'error');
    return false;
  }

  logStatus(`Setting up service: ${serviceName}`, 'info');

  // Remove existing service directory if it exists
  if (existsSync(servicePath)) {
    logStatus(`Removing existing service directory: ${serviceName}`, 'warning');
    rmSync(servicePath, { recursive: true, force: true });
  }

  // Check if repository exists
  const checkRepo = execCommand(`git ls-remote ${repoUrl}`, PROJECT_ROOT, true);
  if (!checkRepo.success) {
    logStatus(`Repository not accessible: ${repoUrl}`, 'warning');

    // Try to create empty repository structure
    if (options.createEmpty) {
      return createEmptyService(serviceName);
    }
    return false;
  }

  // Add as git submodule
  logStatus(`Adding ${serviceName} as git submodule...`, 'info');
  const submoduleResult = execCommand(
    `git submodule add ${repoUrl} services/${serviceName}`,
    PROJECT_ROOT,
    false
  );

  if (!submoduleResult.success) {
    logStatus(`Failed to add submodule: ${serviceName}`, 'error');
    return false;
  }

  // Initialize and update submodule
  execCommand(
    `git submodule update --init --recursive services/${serviceName}`
  );

  logStatus(`Service ${serviceName} setup complete`, 'success');
  return true;
}

function createEmptyService(serviceName) {
  const servicePath = join(SERVICES_DIR, serviceName);

  logStatus(`Creating empty service structure for: ${serviceName}`, 'info');

  if (!existsSync(servicePath)) {
    mkdirSync(servicePath, { recursive: true });
  }

  // Create basic package.json
  const packageJson = {
    name: `@codai/${serviceName}`,
    version: '0.1.0',
    private: true,
    description: `Codai ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Service`,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      test: 'jest',
      typecheck: 'tsc --noEmit',
    },
    dependencies: {
      next: '^14.0.0',
      react: '^18.0.0',
      'react-dom': '^18.0.0',
      typescript: '^5.0.0',
    },
  };

  import('fs').then(fs => {
    fs.writeFileSync(
      join(servicePath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create basic README
    const readme = `# ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Service

Part of the Codai Ecosystem.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Architecture

This service is part of the Codai ecosystem and follows the hybrid development architecture.
`;

    fs.writeFileSync(join(servicePath, 'README.md'), readme);
  });

  logStatus(`Empty service created: ${serviceName}`, 'success');
  return true;
}

function migrateExistingApps() {
  if (!existsSync(APPS_DIR)) {
    logStatus('No apps directory to migrate.', 'info');
    return;
  }

  const apps = readdirSync(APPS_DIR).filter(name => {
    const appPath = join(APPS_DIR, name);
    return statSync(appPath).isDirectory();
  });

  logStatus(`Found ${apps.length} apps to migrate: ${apps.join(', ')}`, 'info');

  for (const appName of apps) {
    const appPath = join(APPS_DIR, appName);
    const servicePath = join(SERVICES_DIR, appName);

    logStatus(`Migrating ${appName}...`, 'info');

    // Copy app content to temporary location
    const tempPath = join(PROJECT_ROOT, `temp-${appName}`);
    if (existsSync(tempPath)) {
      rmSync(tempPath, { recursive: true, force: true });
    }

    execCommand(`cp -r "${appPath}" "${tempPath}"`);

    // Setup service (this will clone from repository)
    const setupSuccess = setupService(appName, { createEmpty: true });

    if (setupSuccess) {
      // If we have a repository, we may need to merge local changes
      if (existsSync(servicePath)) {
        logStatus(`Service ${appName} already has repository content`, 'info');
        // TODO: Implement smart merge logic if needed
      }
    }

    // Clean up temp directory
    if (existsSync(tempPath)) {
      rmSync(tempPath, { recursive: true, force: true });
    }
  }
}

function updateGitignore() {
  const gitignorePath = join(PROJECT_ROOT, '.gitignore');
  const gitignoreContent = `
# Codai Project
apps-backup/
temp-*/

# Dependencies
node_modules/
.pnpm-store/

# Next.js
.next/
out/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build
dist/
build/
coverage/
`;

  import('fs').then(fs => {
    if (existsSync(gitignorePath)) {
      const existing = fs.readFileSync(gitignorePath, 'utf8');
      if (!existing.includes('# Codai Project')) {
        fs.appendFileSync(gitignorePath, gitignoreContent);
      }
    } else {
      fs.writeFileSync(gitignorePath, gitignoreContent);
    }
  });
}

async function main() {
  logStatus('Starting Codai Service Setup...', 'info');

  checkGitRepository();

  // Create services directory
  if (!existsSync(SERVICES_DIR)) {
    mkdirSync(SERVICES_DIR, { recursive: true });
  }

  // Backup existing apps
  backupExistingApps();

  // Update .gitignore
  await updateGitignore();

  // Setup all services
  let successCount = 0;
  const serviceNames = Object.keys(SERVICE_REPOS);

  for (const serviceName of serviceNames) {
    const success = setupService(serviceName, { createEmpty: true });
    if (success) successCount++;
  }

  // Migrate existing apps if any
  migrateExistingApps();

  // Update git submodules
  logStatus('Updating git submodules...', 'info');
  execCommand('git submodule update --init --recursive');

  logStatus(
    `Setup complete! ${successCount}/${serviceNames.length} services configured.`,
    'success'
  );
  logStatus('Next steps:', 'info');
  logStatus('1. Run "npm run status" to check ecosystem status', 'info');
  logStatus('2. Run "npm run dev" to start development services', 'info');
  logStatus('3. Run "npm run dev -- --all" to start all services', 'info');
}

// Run if called directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].endsWith('setup-services.js')
) {
  main().catch(error => {
    logStatus(`Setup failed: ${error.message}`, 'error');
    process.exit(1);
  });
}
