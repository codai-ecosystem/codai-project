#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 CODAI ECOSYSTEM REPAIR TOOLKIT');
console.log('='.repeat(60));

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    working: '🔄'
  };
  console.log(`${icons[type]} ${message}`);
}

function runCommand(command, cwd = process.cwd()) {
  log(`Running: ${command}`, 'working');
  try {
    const result = execSync(command, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return { success: true, output: result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || '',
      stderr: error.stderr || ''
    };
  }
}

async function step1_CleanWorkspace() {
  log('\n🧹 STEP 1: Cleaning workspace...', 'working');

  // Remove problematic files
  const pathsToClean = [
    'pnpm-lock.yaml',
    'node_modules',
    'apps/*/node_modules',
    'packages/*/node_modules'
  ];

  for (const cleanPath of pathsToClean) {
    try {
      if (cleanPath.includes('*')) {
        // Handle glob patterns manually
        if (cleanPath === 'apps/*/node_modules') {
          const apps = fs.readdirSync('apps').filter(d =>
            fs.statSync(path.join('apps', d)).isDirectory()
          );
          for (const app of apps) {
            const nodeModulesPath = path.join('apps', app, 'node_modules');
            if (fs.existsSync(nodeModulesPath)) {
              fs.rmSync(nodeModulesPath, { recursive: true, force: true });
              log(`Removed apps/${app}/node_modules`, 'success');
            }
          }
        }
        if (cleanPath === 'packages/*/node_modules') {
          const packages = fs.readdirSync('packages').filter(d =>
            fs.statSync(path.join('packages', d)).isDirectory()
          );
          for (const pkg of packages) {
            const nodeModulesPath = path.join('packages', pkg, 'node_modules');
            if (fs.existsSync(nodeModulesPath)) {
              fs.rmSync(nodeModulesPath, { recursive: true, force: true });
              log(`Removed packages/${pkg}/node_modules`, 'success');
            }
          }
        }
      } else {
        if (fs.existsSync(cleanPath)) {
          if (fs.statSync(cleanPath).isDirectory()) {
            fs.rmSync(cleanPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(cleanPath);
          }
          log(`Removed ${cleanPath}`, 'success');
        }
      }
    } catch (error) {
      log(`Failed to remove ${cleanPath}: ${error.message}`, 'warning');
    }
  }
}

async function step2_ValidatePackageStructure() {
  log('\n🔍 STEP 2: Validating package structure...', 'working');

  // Check critical packages
  const criticalPackages = ['shared-ui', 'translations'];

  for (const pkg of criticalPackages) {
    const pkgPath = path.join('packages', pkg);
    const pkgJsonPath = path.join(pkgPath, 'package.json');

    if (!fs.existsSync(pkgJsonPath)) {
      log(`Missing package.json for ${pkg}`, 'error');
      return false;
    }

    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      if (pkgJson.name !== `@codai/${pkg}`) {
        log(`Invalid package name for ${pkg}: ${pkgJson.name}`, 'error');
        return false;
      }
      log(`Package ${pkg} structure valid`, 'success');
    } catch (error) {
      log(`Invalid package.json for ${pkg}: ${error.message}`, 'error');
      return false;
    }
  }

  return true;
}

async function step3_InstallDependencies() {
  log('\n📦 STEP 3: Installing dependencies...', 'working');

  const result = runCommand('pnpm install --no-frozen-lockfile');
  if (result.success) {
    log('Dependencies installed successfully', 'success');
    return true;
  } else {
    log(`Dependency installation failed: ${result.error}`, 'error');
    return false;
  }
}

async function step4_BuildSharedPackages() {
  log('\n🔨 STEP 4: Building shared packages...', 'working');

  const packagesToBuild = ['shared-ui', 'translations'];

  for (const pkg of packagesToBuild) {
    const pkgPath = path.join('packages', pkg);

    if (!fs.existsSync(pkgPath)) {
      log(`Package ${pkg} not found`, 'error');
      return false;
    }

    const result = runCommand('pnpm build', pkgPath);
    if (result.success) {
      log(`Built ${pkg} successfully`, 'success');
    } else {
      log(`Failed to build ${pkg}: ${result.error}`, 'error');
      return false;
    }
  }

  return true;
}

async function step5_TestCriticalApps() {
  log('\n🧪 STEP 5: Testing critical apps...', 'working');

  const testApps = ['codai', 'memorai', 'bancai'];
  const results = [];

  for (const app of testApps) {
    const appPath = path.join('apps', app);

    // Check if required files exist
    const requiredFiles = [
      'package.json',
      'app/layout.tsx',
      'app/page.tsx',
      'middleware.ts'
    ];

    let appValid = true;
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(appPath, file))) {
        log(`${app} missing ${file}`, 'error');
        appValid = false;
      }
    }

    if (!appValid) {
      results.push({ app, success: false, reason: 'missing files' });
      continue;
    }

    // Try to build the app
    log(`Testing build for ${app}...`, 'working');
    const buildResult = runCommand('pnpm build', appPath);

    if (buildResult.success) {
      log(`${app} builds successfully`, 'success');
      results.push({ app, success: true });
    } else {
      log(`${app} build failed`, 'error');
      results.push({
        app,
        success: false,
        reason: 'build failed',
        error: buildResult.stderr.slice(0, 200)
      });
    }
  }

  return results;
}

async function main() {
  try {
    // Run repair steps
    await step1_CleanWorkspace();

    const structureValid = await step2_ValidatePackageStructure();
    if (!structureValid) {
      log('Package structure validation failed', 'error');
      return process.exit(1);
    }

    const depsInstalled = await step3_InstallDependencies();
    if (!depsInstalled) {
      log('Dependency installation failed', 'error');
      return process.exit(1);
    }

    const packagesBuilt = await step4_BuildSharedPackages();
    if (!packagesBuilt) {
      log('Shared package build failed', 'error');
      return process.exit(1);
    }

    const testResults = await step5_TestCriticalApps();

    // Summary
    log('\n📊 REPAIR SUMMARY', 'info');
    log('='.repeat(60));

    const successful = testResults.filter(r => r.success).length;
    const total = testResults.length;

    log(`Apps tested: ${total}`);
    log(`Apps working: ${successful}`);
    log(`Success rate: ${((successful / total) * 100).toFixed(1)}%`);

    if (successful === total) {
      log('\n🎉 ECOSYSTEM REPAIR SUCCESSFUL!', 'success');
      log('All critical apps are now working correctly.');
    } else {
      log('\n⚠️ PARTIAL SUCCESS', 'warning');
      log('Some apps still have issues:');

      testResults.filter(r => !r.success).forEach(result => {
        log(`  - ${result.app}: ${result.reason}`, 'error');
        if (result.error) {
          log(`    Error: ${result.error}`, 'error');
        }
      });
    }

  } catch (error) {
    log(`Repair process failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();
