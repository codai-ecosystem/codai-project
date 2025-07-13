#!/usr/bin/env node

/**
 * Install Dependencies for All Apps
 * Ensures each app has its own node_modules with all required dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Installing dependencies for all apps...\n');

const APPS = [
  'codai',
  'memorai',
  'logai',
  'bancai',
  'wallet',
  'fabricai',
  'studiai',
  'sociai',
  'cumparai',
  'x',
  'publicai',
];

async function installAppDependencies(appName) {
  const appPath = path.join(process.cwd(), 'apps', appName);

  if (!fs.existsSync(appPath)) {
    console.log(`⚠️  App directory ${appName} does not exist, skipping...`);
    return;
  }

  console.log(`📦 Installing dependencies for ${appName}...`);

  try {
    // Change to app directory
    process.chdir(appPath);

    // Install dependencies
    execSync('pnpm install', { stdio: 'inherit' });

    console.log(`✅ Dependencies installed for ${appName}\n`);
  } catch (error) {
    console.error(
      `❌ Failed to install dependencies for ${appName}:`,
      error.message
    );
  }
}

async function testAppBuild(appName) {
  const appPath = path.join(process.cwd(), 'apps', appName);

  console.log(`🧪 Testing build for ${appName}...`);

  try {
    // Change to app directory
    process.chdir(appPath);

    // Test build
    execSync('pnpm build', { stdio: 'inherit' });

    console.log(`✅ Build successful for ${appName}\n`);
    return true;
  } catch (error) {
    console.error(`❌ Build failed for ${appName}:`, error.message);
    return false;
  }
}

async function main() {
  const rootDir = process.cwd();
  console.log(`📁 Working from: ${rootDir}\n`);

  // Install dependencies for each app
  for (const appName of APPS) {
    await installAppDependencies(appName);
    // Return to root directory
    process.chdir(rootDir);
  }

  console.log('🧪 Testing builds for all apps...\n');

  const buildResults = {};

  // Test builds for each app
  for (const appName of APPS) {
    const success = await testAppBuild(appName);
    buildResults[appName] = success;
    // Return to root directory
    process.chdir(rootDir);
  }

  console.log('📊 BUILD RESULTS SUMMARY:\n');

  const successful = Object.entries(buildResults).filter(
    ([_, success]) => success
  );
  const failed = Object.entries(buildResults).filter(
    ([_, success]) => !success
  );

  if (successful.length > 0) {
    console.log('✅ SUCCESSFUL BUILDS:');
    successful.forEach(([appName]) => {
      console.log(`   ✅ ${appName}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ FAILED BUILDS:');
    failed.forEach(([appName]) => {
      console.log(`   ❌ ${appName}`);
    });
  }

  console.log(
    `\n📈 OVERALL SUCCESS RATE: ${successful.length}/${APPS.length} (${Math.round((successful.length / APPS.length) * 100)}%)`
  );

  if (successful.length === APPS.length) {
    console.log('\n🎉 ALL SERVICES BUILDING SUCCESSFULLY!');
  } else {
    console.log('\n⚠️  Some services need additional attention.');
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
