#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Pre-publish validation script for METU Template
 * Ensures everything is ready for NPM publishing
 */

console.log('🔎 Running pre-publish validation...\n');

const validationSteps = [
  {
    name: 'Check Node.js version',
    run: () => {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      if (majorVersion < 18) {
        throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
      }
      console.log(`✅ Node.js ${nodeVersion}`);
    },
  },
  {
    name: 'Check package.json structure',
    run: () => {
      const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      const required = ['name', 'version', 'description', 'bin', 'repository'];

      for (const field of required) {
        if (!pkg[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      if (!pkg.bin['create-metu']) {
        throw new Error('Missing bin entry for create-metu');
      }

      console.log(`✅ Package.json structure valid`);
      console.log(`   Name: ${pkg.name}`);
      console.log(`   Version: ${pkg.version}`);
    },
  },
  {
    name: 'Check CLI script exists',
    run: () => {
      const cliPath = './bin/create-metu.js';
      if (!fs.existsSync(cliPath)) {
        throw new Error('CLI script not found at ./bin/create-metu.js');
      }

      // Check if executable
      const stats = fs.statSync(cliPath);
      if (!stats.isFile()) {
        throw new Error('CLI script is not a file');
      }

      console.log('✅ CLI script exists');
    },
  },
  {
    name: 'Validate TypeScript configuration',
    run: () => {
      try {
        execSync('pnpm type-check', { stdio: 'pipe' });
        console.log('✅ TypeScript validation passed');
      } catch (error) {
        throw new Error('TypeScript validation failed');
      }
    },
  },
  {
    name: 'Run unit tests',
    run: () => {
      try {
        const output = execSync('pnpm test', { stdio: 'pipe', encoding: 'utf8' });
        if (!output.includes('Tests:')) {
          throw new Error('Test output format unexpected');
        }
        console.log('✅ Unit tests passed');
      } catch (error) {
        throw new Error('Unit tests failed');
      }
    },
  },
  {
    name: 'Validate production build',
    run: () => {
      try {
        execSync('pnpm build', { stdio: 'pipe' });
        console.log('✅ Production build successful');
      } catch (error) {
        throw new Error('Production build failed');
      }
    },
  },
  {
    name: 'Check essential files',
    run: () => {
      const essentialFiles = [
        'README.md',
        'DEPLOYMENT.md',
        'package.json',
        'bin/create-metu.js',
        'apps/web/package.json',
        'apps/web/next.config.ts',
        'apps/web/tailwind.config.ts',
        'apps/web/src/app/layout.tsx',
        'apps/web/src/app/page.tsx',
      ];

      for (const file of essentialFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`Essential file missing: ${file}`);
        }
      }

      console.log('✅ All essential files present');
    },
  },
  {
    name: 'Validate environment configuration',
    run: () => {
      const envExample = './apps/web/.env.local';
      const envSchema = './apps/web/src/lib/env.ts';

      if (!fs.existsSync(envExample)) {
        throw new Error('Environment example file missing');
      }

      if (!fs.existsSync(envSchema)) {
        throw new Error('Environment validation schema missing');
      }

      console.log('✅ Environment configuration valid');
    },
  },
  {
    name: 'Check workspace configuration',
    run: () => {
      const workspaceFiles = [
        'pnpm-workspace.yaml',
        'turbo.json',
        'packages/eslint-config/package.json',
        'packages/typescript-config/package.json',
      ];

      for (const file of workspaceFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`Workspace file missing: ${file}`);
        }
      }

      console.log('✅ Workspace configuration valid');
    },
  },
];

// Run all validation steps
let passed = 0;
let failed = 0;

for (const step of validationSteps) {
  try {
    step.run();
    passed++;
  } catch (error) {
    console.error(`❌ ${step.name}: ${error.message}`);
    failed++;
  }
}

console.log(`\n📊 Validation Summary:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed > 0) {
  console.log('\n🚨 Please fix the failed validations before publishing');
  process.exit(1);
} else {
  console.log('\n🎉 All validations passed! Ready for publishing');
  console.log('\nNext steps:');
  console.log('1. git tag v1.0.0');
  console.log('2. git push origin main --tags');
  console.log('3. npm publish');
  console.log('\nOr use: pnpm release');
}
