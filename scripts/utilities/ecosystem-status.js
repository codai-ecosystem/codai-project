#!/usr/bin/env node

/**
 * Codai Ecosystem Status Script
 * Provides comprehensive status of the ecosystem
 */

const { existsSync, readdirSync, statSync, readFileSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

// Import chalk dynamically for CommonJS compatibility
let chalk;
(async () => {
  chalk = (await import('chalk')).default;
  main();
})();

const PROJECT_ROOT = process.cwd();
const SERVICES_DIR = join(PROJECT_ROOT, 'services');
const APPS_DIR = join(PROJECT_ROOT, 'apps');

const SERVICES = {
  codai: {
    port: 3000,
    priority: 1,
    description: 'Central Platform & AIDE Hub',
    repo: 'codai-ecosystem/codai',
  },
  memorai: {
    port: 3001,
    priority: 1,
    description: 'AI Memory & Database Core',
    repo: 'codai-ecosystem/memorai',
  },
  logai: {
    port: 3002,
    priority: 1,
    description: 'Identity & Authentication Hub',
    repo: 'codai-ecosystem/logai',
  },
  bancai: {
    port: 3003,
    priority: 2,
    description: 'Financial Platform',
    repo: 'codai-ecosystem/bancai',
  },
  wallet: {
    port: 3004,
    priority: 2,
    description: 'Programmable Wallet',
    repo: 'codai-ecosystem/wallet',
  },
  fabricai: {
    port: 3005,
    priority: 2,
    description: 'AI Services Platform',
    repo: 'codai-ecosystem/fabricai',
  },
  studiai: {
    port: 3006,
    priority: 3,
    description: 'AI Education Platform',
    repo: 'codai-ecosystem/studiai',
  },
  sociai: {
    port: 3007,
    priority: 3,
    description: 'AI Social Platform',
    repo: 'codai-ecosystem/sociai',
  },
  cumparai: {
    port: 3008,
    priority: 3,
    description: 'AI Shopping Platform',
    repo: 'codai-ecosystem/cumparai',
  },
  publicai: {
    port: 3009,
    priority: 4,
    description: 'Civic AI & Transparency Tools',
    repo: 'codai-ecosystem/publicai',
  },
  x: {
    port: 3010,
    priority: 4,
    description: 'AI Trading Platform',
    repo: 'codai-ecosystem/x',
  },
};

function logHeader(text, char = '=') {
  const width = 80;
  const padding = Math.max(0, width - text.length - 2);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;

  console.log(chalk.blue(char.repeat(width)));
  console.log(
    chalk.blue(char + ' '.repeat(leftPad) + text + ' '.repeat(rightPad) + char)
  );
  console.log(chalk.blue(char.repeat(width)));
}

function getServiceStatus(serviceName) {
  const servicePath = join(SERVICES_DIR, serviceName);
  const appPath = join(APPS_DIR, serviceName);

  let location = 'none';
  let hasPackageJson = false;
  let isGitRepo = false;
  let packageInfo = null;

  if (existsSync(servicePath)) {
    location = 'services';
    hasPackageJson = existsSync(join(servicePath, 'package.json'));
    isGitRepo = existsSync(join(servicePath, '.git'));

    if (hasPackageJson) {
      try {
        const packageContent = readFileSync(
          join(servicePath, 'package.json'),
          'utf8'
        );
        packageInfo = JSON.parse(packageContent);
      } catch (error) {
        // Ignore parse errors
      }
    }
  } else if (existsSync(appPath)) {
    location = 'apps';
    hasPackageJson = existsSync(join(appPath, 'package.json'));
    isGitRepo = existsSync(join(appPath, '.git'));

    if (hasPackageJson) {
      try {
        const packageContent = readFileSync(
          join(appPath, 'package.json'),
          'utf8'
        );
        packageInfo = JSON.parse(packageContent);
      } catch (error) {
        // Ignore parse errors
      }
    }
  }

  return {
    location,
    hasPackageJson,
    isGitRepo,
    packageInfo,
    path:
      location === 'services'
        ? servicePath
        : location === 'apps'
          ? appPath
          : null,
  };
}

function getGitStatus() {
  try {
    const status = execSync('git status --porcelain', {
      encoding: 'utf8',
      cwd: PROJECT_ROOT,
    });
    const branch = execSync('git branch --show-current', {
      encoding: 'utf8',
      cwd: PROJECT_ROOT,
    }).trim();

    const changes = status.split('\n').filter(line => line.trim()).length;

    return {
      branch,
      hasChanges: changes > 0,
      changeCount: changes,
    };
  } catch (error) {
    return {
      branch: 'unknown',
      hasChanges: false,
      changeCount: 0,
      error: error.message,
    };
  }
}

function getSubmoduleStatus() {
  try {
    const submodules = execSync('git submodule status', {
      encoding: 'utf8',
      cwd: PROJECT_ROOT,
    });
    return submodules
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const match = line.match(/^([ +-U])([a-f0-9]+) (.+?)( \(.+\))?$/);
        if (match) {
          return {
            status: match[1],
            commit: match[2],
            path: match[3],
            branch: match[4] ? match[4].slice(2, -1) : null,
          };
        }
        return null;
      })
      .filter(Boolean);
  } catch (error) {
    return [];
  }
}

function main() {
  console.clear();

  logHeader('CODAI ECOSYSTEM STATUS', '🚀');

  // Git Status
  console.log(chalk.yellow('\n📦 Repository Status:'));
  const gitStatus = getGitStatus();
  console.log(`Branch: ${chalk.green(gitStatus.branch)}`);
  console.log(
    `Changes: ${gitStatus.hasChanges ? chalk.yellow(`${gitStatus.changeCount} files`) : chalk.green('Clean')}`
  );

  // Submodule Status
  const submodules = getSubmoduleStatus();
  if (submodules.length > 0) {
    console.log(chalk.yellow('\n🔗 Git Submodules:'));
    submodules.forEach(sub => {
      const statusIcon =
        {
          ' ': '✅',
          '+': '🆕',
          '-': '❌',
          U: '⚠️',
        }[sub.status] || '❓';

      console.log(`${statusIcon} ${sub.path} (${sub.commit.slice(0, 7)})`);
    });
  }

  // Services Status
  console.log(chalk.yellow('\n🏗️ Services Status:'));

  const totalServices = Object.keys(SERVICES).length;
  let availableServices = 0;
  let servicesInServices = 0;
  let servicesInApps = 0;

  const priorityGroups = {};

  Object.entries(SERVICES).forEach(([name, config]) => {
    const status = getServiceStatus(name);

    if (!priorityGroups[config.priority]) {
      priorityGroups[config.priority] = [];
    }
    priorityGroups[config.priority].push({ name, config, status });

    if (status.location !== 'none') {
      availableServices++;
      if (status.location === 'services') servicesInServices++;
      if (status.location === 'apps') servicesInApps++;
    }
  });

  // Priority groups
  Object.entries(priorityGroups)
    .sort()
    .forEach(([priority, services]) => {
      console.log(chalk.blue(`\n  Priority ${priority} Services:`));

      services.forEach(({ name, config, status }) => {
        const locationIcon = {
          services: '🟢',
          apps: '🟡',
          none: '🔴',
        }[status.location];

        const packageIcon = status.hasPackageJson ? '📦' : '❌';
        const gitIcon = status.isGitRepo ? '🔧' : '❌';

        console.log(
          `    ${locationIcon} ${name.padEnd(12)} - ${config.description}`
        );
        console.log(
          `      Location: ${status.location.padEnd(8)} Package: ${packageIcon} Git: ${gitIcon}`
        );

        if (status.packageInfo) {
          console.log(
            `      Version: ${status.packageInfo.version}, Framework: ${status.packageInfo.dependencies?.next ? 'Next.js' : 'Unknown'}`
          );
        }
      });
    });

  // Summary
  console.log(chalk.yellow('\n📊 Summary:'));
  console.log(`Total Services: ${totalServices}`);
  console.log(
    `Available: ${chalk.green(availableServices)}/${totalServices} (${Math.round((availableServices / totalServices) * 100)}%)`
  );
  console.log(`In services/: ${chalk.green(servicesInServices)}`);
  console.log(`In apps/: ${chalk.yellow(servicesInApps)}`);
  console.log(`Missing: ${chalk.red(totalServices - availableServices)}`);

  // Architecture Status
  console.log(chalk.yellow('\n🏛️ Architecture Status:'));

  const hasServices = existsSync(SERVICES_DIR);
  const hasApps = existsSync(APPS_DIR);
  const isV2Architecture = hasServices && servicesInServices > 0;
  const isV1Architecture = hasApps && servicesInApps > 0;
  const isHybrid = isV1Architecture && isV2Architecture;

  if (isHybrid) {
    console.log(
      `${chalk.yellow('⚠️')} Hybrid Architecture (Migration in Progress)`
    );
    console.log('   Run migration script to complete transition to v2.0');
  } else if (isV2Architecture) {
    console.log(
      `${chalk.green('✅')} V2.0 Architecture (Services + Submodules)`
    );
  } else if (isV1Architecture) {
    console.log(`${chalk.blue('ℹ️')} V1.0 Architecture (Apps + Subtrees)`);
    console.log(
      '   Consider upgrading to v2.0 for better development workflow'
    );
  } else {
    console.log(`${chalk.red('❌')} No Services Found`);
    console.log('   Run setup script to initialize the ecosystem');
  }

  // Development Commands
  console.log(chalk.yellow('\n🛠️ Development Commands:'));
  console.log('  npm run setup     - Initialize/migrate to v2.0 architecture');
  console.log('  npm run dev       - Start priority 1 services');
  console.log('  npm run dev --all - Start all available services');
  console.log('  npm run status    - Show this status report');
  console.log('  npm run sync      - Sync all git submodules');

  console.log('\n');
}

if (require.main === module) {
  // Will be called when chalk is loaded
}
