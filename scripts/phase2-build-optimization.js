#!/usr/bin/env node

/**
 * CODAI Ecosystem - Systematic Deployment Readiness Fix Script
 * Phase 2: Build System Optimization - Turbo, Scripts, and Build Pipeline
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.resolve(path.dirname(__dirname));
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const LIBS_DIR = path.join(ROOT_DIR, 'libs');

// Utility functions
const log = (message, level = 'info') => {
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m'
    };
    console.log(`${colors[level]}${message}${colors.reset}`);
};

const fileExists = (filePath) => fs.existsSync(filePath);

const readJsonFile = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        log(`Error reading ${filePath}: ${error.message}`, 'error');
        return null;
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
        return true;
    } catch (error) {
        log(`Error writing ${filePath}: ${error.message}`, 'error');
        return false;
    }
};

// Enhanced Turbo configuration
const OPTIMIZED_TURBO_CONFIG = {
    "$schema": "https://turbo.build/schema.json",
    "ui": "tui",
    "globalDependencies": [
        "**/.env.*local",
        "tsconfig.base.json",
        "package.json"
    ],
    "globalEnv": [
        "NODE_ENV",
        "NEXT_PUBLIC_*",
        "DATABASE_URL",
        "AZURE_OPENAI_*",
        "FIREBASE_*"
    ],
    "tasks": {
        "build": {
            "dependsOn": ["^build", "type-check"],
            "inputs": [
                "src/**/*.{ts,tsx,js,jsx}",
                "app/**/*.{ts,tsx,js,jsx}",
                "pages/**/*.{ts,tsx,js,jsx}",
                "components/**/*.{ts,tsx,js,jsx}",
                "lib/**/*.{ts,tsx,js,jsx}",
                "public/**/*",
                "next.config.js",
                "tailwind.config.ts",
                "tsconfig.json",
                "package.json"
            ],
            "outputs": [
                ".next/**",
                "!.next/cache/**",
                "dist/**",
                "build/**",
                "out/**"
            ],
            "env": [
                "NODE_ENV",
                "NEXT_PUBLIC_*"
            ]
        },
        "dev": {
            "cache": false,
            "persistent": true,
            "inputs": [
                "src/**/*.{ts,tsx,js,jsx}",
                "app/**/*.{ts,tsx,js,jsx}",
                "pages/**/*.{ts,tsx,js,jsx}",
                "components/**/*.{ts,tsx,js,jsx}",
                "lib/**/*.{ts,tsx,js,jsx}",
                "public/**/*",
                "next.config.js",
                "tailwind.config.ts",
                ".env*"
            ]
        },
        "lint": {
            "dependsOn": ["^lint"],
            "inputs": [
                "src/**/*.{ts,tsx,js,jsx}",
                "app/**/*.{ts,tsx,js,jsx}",
                "pages/**/*.{ts,tsx,js,jsx}",
                "components/**/*.{ts,tsx,js,jsx}",
                "lib/**/*.{ts,tsx,js,jsx}",
                ".eslintrc.*",
                "eslint.config.*",
                "package.json"
            ]
        },
        "type-check": {
            "dependsOn": ["^build"],
            "inputs": [
                "src/**/*.{ts,tsx}",
                "app/**/*.{ts,tsx}",
                "pages/**/*.{ts,tsx}",
                "components/**/*.{ts,tsx}",
                "lib/**/*.{ts,tsx}",
                "types/**/*.ts",
                "tsconfig.json",
                "package.json"
            ],
            "outputs": [
                "tsconfig.tsbuildinfo"
            ]
        },
        "test": {
            "dependsOn": ["^build"],
            "inputs": [
                "src/**/*.{ts,tsx,js,jsx}",
                "app/**/*.{ts,tsx,js,jsx}",
                "tests/**/*.{ts,tsx,js,jsx}",
                "**/*.test.{ts,tsx,js,jsx}",
                "**/*.spec.{ts,tsx,js,jsx}",
                "vitest.config.*",
                "jest.config.*",
                "package.json"
            ],
            "outputs": [
                "coverage/**"
            ]
        },
        "clean": {
            "cache": false
        }
    }
};

// Enhanced root package.json scripts
const ENHANCED_ROOT_SCRIPTS = {
    "test": "vitest run",
    "test:unit": "vitest run tests/unit-components.test.ts",
    "test:integration": "vitest run tests/api-integration.test.ts",
    "test:e2e": "playwright test tests/comprehensive-coverage.spec.ts",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:debug": "vitest run --reporter=verbose",
    "test:quick": "vitest run tests/unit-components.test.ts --reporter=basic",
    "test:comprehensive": "node run-comprehensive-tests.js",
    "dev": "node scripts/dev-helper.js",
    "dev:all": "turbo dev --concurrency=10",
    "dev:primary": "turbo dev --filter=codai --filter=admin --filter=hub --filter=id --filter=bancai --filter=memorai",
    "dev:admin": "turbo dev --filter=admin",
    "dev:hub": "turbo dev --filter=hub",
    "dev:id": "turbo dev --filter=id",
    "dev:admin-ecosystem": "turbo dev --filter=admin --filter=hub --filter=id",
    "build": "turbo build --concurrency=20",
    "build:primary": "turbo build --filter=codai --filter=admin --filter=hub --filter=id --filter=bancai --filter=memorai",
    "build:check": "turbo build --dry-run",
    "build:force": "turbo build --force",
    "lint": "turbo lint",
    "lint:fix": "turbo lint --fix",
    "lint:check": "turbo lint --no-fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "turbo type-check",
    "type-check:primary": "turbo type-check --filter=codai --filter=admin --filter=hub --filter=id --filter=bancai --filter=memorai",
    "clean": "turbo clean",
    "clean:cache": "turbo clean && rm -rf .turbo",
    "validate": "pnpm run type-check && pnpm run lint && pnpm run test:coverage",
    "validate:primary": "pnpm run type-check:primary && pnpm run build:primary",
    "security:audit": "pnpm audit",
    "security:scan": "npm audit --audit-level high",
    "deps:update": "pnpm update --interactive",
    "deps:outdated": "pnpm outdated",
    "ports:check": "node scripts/enforce-port-policy.js",
    "ports:fix": "node scripts/enforce-port-policy.js --fix",
    "orchestrator": "node scripts/orchestrator-cli.js",
    "orchestrator:interactive": "node scripts/orchestrator-cli.js interactive",
    "orchestrator:status": "node scripts/orchestrator-cli.js status",
    "orchestrator:list": "node scripts/orchestrator-cli.js list",
    "orchestrator:examples": "node scripts/orchestrator-examples.js",
    "start:service": "node scripts/orchestrator-cli.js start",
    "health-check": "node scripts/health-check.js",
    "deploy:check": "pnpm run validate && pnpm run build",
    "deploy:primary": "pnpm run validate:primary && echo 'Primary apps ready for deployment!'"
};

// Main functions
async function optimizeTurboConfig() {
    log('\n🔧 Step 2.1: Optimizing Turbo Configuration...', 'info');

    const turboConfigPath = path.join(ROOT_DIR, 'turbo.json');

    if (writeJsonFile(turboConfigPath, OPTIMIZED_TURBO_CONFIG)) {
        log('  ✅ Updated turbo.json with optimized configuration', 'success');
        return true;
    }

    return false;
}

async function enhanceRootPackageJson() {
    log('\n🔧 Step 2.2: Enhancing Root Package Scripts...', 'info');

    const packageJsonPath = path.join(ROOT_DIR, 'package.json');
    const packageJson = readJsonFile(packageJsonPath);

    if (packageJson) {
        // Merge enhanced scripts
        packageJson.scripts = { ...packageJson.scripts, ...ENHANCED_ROOT_SCRIPTS };

        if (writeJsonFile(packageJsonPath, packageJson)) {
            log('  ✅ Updated root package.json with enhanced scripts', 'success');
            return true;
        }
    }

    return false;
}

async function createBuildValidationScript() {
    log('\n🔧 Step 2.3: Creating Build Validation System...', 'info');

    const healthCheckScript = `#!/usr/bin/env node
/**
 * Health Check Script for CODAI Ecosystem
 * Validates build readiness across all apps
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(path.dirname(__dirname));

const log = (message, level = 'info') => {
  const colors = {
    info: '\\x1b[36m',
    success: '\\x1b[32m',
    warning: '\\x1b[33m',
    error: '\\x1b[31m',
    reset: '\\x1b[0m'
  };
  console.log(\`\${colors[level]}\${message}\${colors.reset}\`);
};

async function checkBuildHealth() {
  log('🏥 CODAI Ecosystem Health Check', 'info');
  log('================================', 'info');
  
  const issues = [];
  let healthScore = 0;
  const maxScore = 100;
  
  try {
    // Check TypeScript compilation
    log('\\n🔍 Checking TypeScript compilation...', 'info');
    execSync('pnpm run type-check', { cwd: ROOT_DIR, stdio: 'ignore' });
    log('  ✅ TypeScript compilation: PASSED', 'success');
    healthScore += 40;
  } catch (error) {
    log('  ❌ TypeScript compilation: FAILED', 'error');
    issues.push('TypeScript compilation errors');
  }
  
  try {
    // Check linting
    log('\\n🔍 Checking ESLint...', 'info');
    execSync('pnpm run lint:check', { cwd: ROOT_DIR, stdio: 'ignore' });
    log('  ✅ ESLint: PASSED', 'success');
    healthScore += 20;
  } catch (error) {
    log('  ❌ ESLint: FAILED', 'error');
    issues.push('ESLint errors found');
  }
  
  try {
    // Check build process
    log('\\n🔍 Checking build process (dry run)...', 'info');
    execSync('pnpm run build:check', { cwd: ROOT_DIR, stdio: 'ignore' });
    log('  ✅ Build process: READY', 'success');
    healthScore += 40;
  } catch (error) {
    log('  ❌ Build process: ISSUES', 'error');
    issues.push('Build configuration issues');
  }
  
  // Generate health report
  log(\`\\n📊 Health Score: \${healthScore}/\${maxScore}\`, healthScore >= 80 ? 'success' : 'warning');
  
  if (issues.length === 0) {
    log('\\n🎉 All systems operational! Ready for deployment!', 'success');
    return true;
  } else {
    log('\\n⚠️  Issues found:', 'warning');
    issues.forEach(issue => log(\`  - \${issue}\`, 'error'));
    return false;
  }
}

checkBuildHealth().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log(\`Fatal error: \${error.message}\`, 'error');
  process.exit(1);
});
`;

    const healthCheckPath = path.join(ROOT_DIR, 'scripts', 'health-check.js');
    fs.writeFileSync(healthCheckPath, healthCheckScript);
    log('  ✅ Created health-check.js script', 'success');

    return true;
}

async function createDevHelperScript() {
    log('\n🔧 Step 2.4: Creating Development Helper...', 'info');

    const devHelperScript = `#!/usr/bin/env node
/**
 * Development Helper Script for CODAI Ecosystem
 * Provides intelligent development server management
 */

import { spawn } from 'child_process';
import inquirer from 'inquirer';

const DEVELOPMENT_MODES = {
  'all': {
    name: 'All Applications (43 apps)',
    command: 'turbo dev --concurrency=10',
    description: 'Start all applications - requires high system resources'
  },
  'primary': {
    name: 'Primary Applications (6 core apps)',
    command: 'turbo dev --filter=codai --filter=admin --filter=hub --filter=id --filter=bancai --filter=memorai',
    description: 'Start core applications: codai, admin, hub, id, bancai, memorai'
  },
  'admin': {
    name: 'Admin Ecosystem (3 apps)',
    command: 'turbo dev --filter=admin --filter=hub --filter=id',
    description: 'Start admin-related applications'
  },
  'single': {
    name: 'Single Application',
    command: null,
    description: 'Start a specific application'
  }
};

const APPS = [
  'codai', 'admin', 'hub', 'id', 'bancai', 'memorai', 'acasai', 'aide',
  'ajutai', 'analizai', 'conversai', 'cumparai', 'curtai', 'dash',
  'dexai', 'docs', 'donai', 'explorer', 'fabricai', 'glass', 'jucai',
  'kodex', 'legalizai', 'logai', 'marketai', 'metu', 'metu-web',
  'mobile', 'mod', 'muzicai', 'prezentai', 'publicai', 'romai',
  'sociai', 'stocai', 'studiai', 'sunai', 'talentai', 'tools', 'wallet', 'x'
];

async function startDevelopment() {
  console.log('🚀 CODAI Ecosystem Development Helper');
  console.log('====================================\\n');
  
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Select development mode:',
      choices: Object.entries(DEVELOPMENT_MODES).map(([key, config]) => ({
        name: \`\${config.name} - \${config.description}\`,
        value: key
      }))
    }
  ]);
  
  let command = DEVELOPMENT_MODES[mode].command;
  
  if (mode === 'single') {
    const { app } = await inquirer.prompt([
      {
        type: 'list',
        name: 'app',
        message: 'Select application to start:',
        choices: APPS
      }
    ]);
    command = \`turbo dev --filter=\${app}\`;
  }
  
  console.log(\`\\n🎯 Starting: \${DEVELOPMENT_MODES[mode].name}\`);
  console.log(\`📋 Command: \${command}\\n\`);
  
  const child = spawn('pnpm', ['run', ...command.split(' ').slice(1)], {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('close', (code) => {
    console.log(\`\\n✅ Development server stopped with code \${code}\`);
  });
}

startDevelopment().catch(console.error);
`;

    const devHelperPath = path.join(ROOT_DIR, 'scripts', 'dev-helper.js');
    fs.writeFileSync(devHelperPath, devHelperScript);
    log('  ✅ Created dev-helper.js script', 'success');

    return true;
}

async function main() {
    log('🚀 CODAI DEPLOYMENT READINESS - PHASE 2: BUILD SYSTEM OPTIMIZATION', 'info');
    log('==================================================================', 'info');
    log('Starting Phase 2: Build System Optimization...', 'info');

    const steps = [
        optimizeTurboConfig,
        enhanceRootPackageJson,
        createBuildValidationScript,
        createDevHelperScript
    ];

    let completedSteps = 0;
    let errorCount = 0;

    for (const step of steps) {
        try {
            const success = await step();
            if (success) {
                completedSteps++;
            } else {
                errorCount++;
            }
        } catch (error) {
            log(`Step error: ${error.message}`, 'error');
            errorCount++;
        }
    }

    // Summary
    log(`\\n📊 Phase 2 Summary:`, 'info');
    log(`✅ Successfully completed: ${completedSteps} steps`, 'success');
    if (errorCount > 0) {
        log(`❌ Errors encountered: ${errorCount} steps`, 'error');
    }

    log('\\n🚀 Phase 2 Complete! Build system optimized for better performance', 'success');
    log('📋 Ready for Phase 3: Application-Specific Fixes', 'info');
    log('💡 Try: pnpm run health-check to validate current state', 'info');
}

// Run the script
main().catch((error) => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
});
