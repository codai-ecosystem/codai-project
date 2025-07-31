#!/usr/bin/env node

/**
 * Comprehensive linting and type checking script for METU template
 * This script runs all quality checks in sequence
 */

const { execSync } = require('child_process');
const path = require('path');

const apps = [
  { name: 'web', path: 'apps/web' },
  { name: 'backend', path: 'apps/backend' },
];

const packages = [
  { name: 'ui', path: 'packages/ui' },
  { name: 'utils', path: 'packages/utils' },
  { name: 'eslint-config', path: 'packages/eslint-config' },
  { name: 'typescript-config', path: 'packages/typescript-config' },
];

function runCommand(command, cwd) {
  console.log(`\n🔍 Running: ${command}`);
  console.log(`📁 In: ${cwd}`);

  try {
    const output = execSync(command, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf8',
    });

    console.log('✅ Success');
    if (output.trim()) {
      console.log(output);
    }
    return true;
  } catch (error) {
    console.log('❌ Failed');
    console.error(error.stdout || error.message);
    return false;
  }
}

function checkProject(project) {
  console.log(`\n\n🚀 Checking ${project.name} (${project.path})`);
  console.log('='.repeat(50));

  const projectPath = path.resolve(process.cwd(), project.path);
  const results = {};

  // TypeScript check
  results.typescript = runCommand('npx tsc --noEmit --skipLibCheck', projectPath);

  // ESLint check
  if (project.name === 'web' || project.name === 'backend') {
    results.eslint = runCommand('npx eslint . --ext .ts,.tsx --max-warnings 0', projectPath);
  }

  // Build check
  if (project.name === 'web') {
    results.build = runCommand('pnpm build', projectPath);
  } else if (project.name === 'backend' || project.name === 'ui' || project.name === 'utils') {
    results.build = runCommand('pnpm build', projectPath);
  }

  // Tests (if available)
  if (project.name === 'web' || project.name === 'backend') {
    results.tests = runCommand('pnpm test --passWithNoTests', projectPath);
  }

  return results;
}

function main() {
  console.log('🎯 METU Template Quality Check');
  console.log('==============================');

  const allResults = {};

  // Check all projects
  [...apps, ...packages].forEach(project => {
    allResults[project.name] = checkProject(project);
  });

  // Summary
  console.log('\n\n📊 SUMMARY');
  console.log('='.repeat(50));

  let allPassed = true;

  Object.entries(allResults).forEach(([name, results]) => {
    console.log(`\n${name}:`);
    Object.entries(results).forEach(([check, passed]) => {
      const icon = passed ? '✅' : '❌';
      console.log(`  ${icon} ${check}`);
      if (!passed) allPassed = false;
    });
  });

  console.log(`\n${allPassed ? '🎉' : '💥'} Overall: ${allPassed ? 'PASSED' : 'FAILED'}`);

  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { checkProject, runCommand };
