#!/usr/bin/env node
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
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[level]}${message}${colors.reset}`);
};

async function checkBuildHealth() {
  log('🏥 CODAI Ecosystem Health Check', 'info');
  log('================================', 'info');
  
  const issues = [];
  let healthScore = 0;
  const maxScore = 100;
  
  try {
    // Check TypeScript compilation
    log('\n🔍 Checking TypeScript compilation...', 'info');
    execSync('pnpm run type-check', { cwd: ROOT_DIR, stdio: 'ignore' });
    log('  ✅ TypeScript compilation: PASSED', 'success');
    healthScore += 40;
  } catch (error) {
    log('  ❌ TypeScript compilation: FAILED', 'error');
    issues.push('TypeScript compilation errors');
  }
  
  try {
    // Check linting
    log('\n🔍 Checking ESLint...', 'info');
    execSync('pnpm run lint:check', { cwd: ROOT_DIR, stdio: 'ignore' });
    log('  ✅ ESLint: PASSED', 'success');
    healthScore += 20;
  } catch (error) {
    log('  ❌ ESLint: FAILED', 'error');
    issues.push('ESLint errors found');
  }
  
  try {
    // Check build process
    log('\n🔍 Checking build process (dry run)...', 'info');
    execSync('pnpm run build:check', { cwd: ROOT_DIR, stdio: 'ignore' });
    log('  ✅ Build process: READY', 'success');
    healthScore += 40;
  } catch (error) {
    log('  ❌ Build process: ISSUES', 'error');
    issues.push('Build configuration issues');
  }
  
  // Generate health report
  log(`\n📊 Health Score: ${healthScore}/${maxScore}`, healthScore >= 80 ? 'success' : 'warning');
  
  if (issues.length === 0) {
    log('\n🎉 All systems operational! Ready for deployment!', 'success');
    return true;
  } else {
    log('\n⚠️  Issues found:', 'warning');
    issues.forEach(issue => log(`  - ${issue}`, 'error'));
    return false;
  }
}

checkBuildHealth().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
