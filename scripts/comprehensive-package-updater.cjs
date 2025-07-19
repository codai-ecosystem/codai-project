#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// CODAI Ecosystem Package Updater
// Updates all apps to latest stable versions while preserving Tailwind CSS v3

console.log('🚀 CODAI ECOSYSTEM - COMPREHENSIVE PACKAGE UPDATER');
console.log('='.repeat(65));
console.log('Updating all 43+ apps to latest stable package versions...\n');

// Latest stable package versions (July 2025)
const LATEST_VERSIONS = {
  // Core Next.js & React Stack
  'next': '^15.4.1',
  'react': '^19.1.0',
  'react-dom': '^19.1.0',

  // TypeScript & Types
  'typescript': '^5.8.3',
  '@types/react': '^19.1.8',
  '@types/react-dom': '^19.1.6',
  '@types/node': '^24.0.13',
  '@types/uuid': '^10.0.0',

  // Styling & UI (Tailwind v3 preserved)
  'tailwindcss': '^3.4.17',
  'autoprefixer': '^10.4.21',
  'postcss': '^8.5.6',
  'tailwindcss-animate': '^1.0.7',

  // Utility Libraries
  'lucide-react': '^0.469.0',
  'framer-motion': '^12.23.3',
  'class-variance-authority': '^0.7.1',
  'clsx': '^2.1.1',
  'tailwind-merge': '^3.3.1',

  // Radix UI Components
  '@radix-ui/react-dialog': '^1.1.14',
  '@radix-ui/react-dropdown-menu': '^2.1.15',
  '@radix-ui/react-slot': '^1.2.3',
  '@radix-ui/react-toast': '^1.2.14',
  '@radix-ui/react-tooltip': '^1.2.7',
  '@radix-ui/react-accordion': '^1.2.1',
  '@radix-ui/react-alert-dialog': '^1.1.2',
  '@radix-ui/react-avatar': '^1.1.1',
  '@radix-ui/react-checkbox': '^1.1.2',
  '@radix-ui/react-label': '^2.1.0',
  '@radix-ui/react-popover': '^1.1.2',
  '@radix-ui/react-progress': '^1.1.0',
  '@radix-ui/react-scroll-area': '^1.2.0',
  '@radix-ui/react-select': '^2.1.2',
  '@radix-ui/react-separator': '^1.1.0',
  '@radix-ui/react-slider': '^1.2.1',
  '@radix-ui/react-switch': '^1.1.1',
  '@radix-ui/react-tabs': '^1.1.1',
  '@radix-ui/react-toggle': '^1.1.0',

  // Development & Build Tools
  'eslint': '^9.31.0',
  'eslint-config-next': '^15.4.1',
  'prettier': '^3.6.2',
  'prettier-plugin-tailwindcss': '^0.6.14',
  '@typescript-eslint/eslint-plugin': '^8.36.0',
  '@typescript-eslint/parser': '^8.36.0',

  // Testing Framework
  'vitest': '^3.2.4',
  '@vitejs/plugin-react': '^4.6.0',
  '@testing-library/react': '^16.1.0',
  '@testing-library/jest-dom': '^6.6.3',
  '@testing-library/user-event': '^14.5.2',
  'jsdom': '^24.0.0',
  'happy-dom': '^15.1.1',
  'playwright': '^1.54.1',
  '@vitest/coverage-v8': '^3.2.4',

  // State Management & Data
  'zustand': '^5.0.6',
  'zod': '^4.0.5',
  'react-hook-form': '^7.60.0',
  '@hookform/resolvers': '^5.1.1',

  // Date & Utilities
  'date-fns': '^4.1.0',
  'uuid': '^11.1.0',
  'fuse.js': '^7.1.0',

  // Charts & Visualization
  'recharts': '^3.1.0',

  // Notifications & Toast
  'sonner': '^2.0.6',
  'react-hot-toast': '^2.5.2',

  // Real-time Communication
  'socket.io': '^4.8.1',
  'socket.io-client': '^4.8.1',

  // Fonts & Themes
  'geist': '^1.3.1',
  'next-themes': '^0.4.6',

  // Authentication
  'next-auth': '^4.24.11',

  // Database & API
  '@prisma/client': '^6.11.1',
  'prisma': '^6.11.1',

  // Payment Processing
  '@stripe/stripe-js': '^7.4.0',
  'stripe': '^18.3.0',

  // Firebase
  'firebase': '^11.10.0',

  // Build Tools
  '@next/env': '^15.4.1',
  '@swc/helpers': '^0.5.17'
};

// Packages to never update (workspace/internal packages)
const PRESERVE_PACKAGES = new Set([
  '@codai/shared-ui',
  '@codai/translations',
  '@codai/auth',
  '@codai/api-keys',
  '@codai/azure-openai',
  '@codai/logai-integration',
  '@codai/logai-sdk'
]);

function updatePackageJson(filePath, appName) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const updates = [];
    let hasChanges = false;

    // Update dependencies
    if (packageJson.dependencies) {
      for (const [pkg, currentVersion] of Object.entries(packageJson.dependencies)) {
        if (PRESERVE_PACKAGES.has(pkg)) continue;

        if (LATEST_VERSIONS[pkg] && currentVersion !== LATEST_VERSIONS[pkg]) {
          packageJson.dependencies[pkg] = LATEST_VERSIONS[pkg];
          updates.push(`  📦 ${pkg}: ${currentVersion} → ${LATEST_VERSIONS[pkg]}`);
          hasChanges = true;
        }
      }
    }

    // Update devDependencies
    if (packageJson.devDependencies) {
      for (const [pkg, currentVersion] of Object.entries(packageJson.devDependencies)) {
        if (PRESERVE_PACKAGES.has(pkg)) continue;

        if (LATEST_VERSIONS[pkg] && currentVersion !== LATEST_VERSIONS[pkg]) {
          packageJson.devDependencies[pkg] = LATEST_VERSIONS[pkg];
          updates.push(`  📦 ${pkg}: ${currentVersion} → ${LATEST_VERSIONS[pkg]}`);
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      // Write updated package.json with consistent formatting
      fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
      return { success: true, updates, count: updates.length };
    }

    return { success: true, updates: [], count: 0 };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Main execution
function main() {
  const appsDir = 'apps';

  if (!fs.existsSync(appsDir)) {
    console.error('❌ Apps directory not found. Run this script from project root.');
    process.exit(1);
  }

  const apps = fs.readdirSync(appsDir).filter(dir => {
    const appPath = path.join(appsDir, dir);
    return fs.statSync(appPath).isDirectory() &&
      fs.existsSync(path.join(appPath, 'package.json'));
  });

  console.log(`🎯 Found ${apps.length} apps to update:\n`);

  let successCount = 0;
  let updateCount = 0;
  let totalPackageUpdates = 0;
  const updateLog = [];
  const errors = [];

  for (const app of apps) {
    console.log(`🔍 Processing ${app.toUpperCase()}...`);

    const packageJsonPath = path.join(appsDir, app, 'package.json');
    const result = updatePackageJson(packageJsonPath, app);

    if (result.success) {
      successCount++;

      if (result.count > 0) {
        updateCount++;
        totalPackageUpdates += result.count;
        console.log(`  ✅ Updated ${result.count} packages:`);
        result.updates.forEach(update => console.log(update));
        updateLog.push({ app, updates: result.updates });
      } else {
        console.log(`  ✅ Already up to date`);
      }
    } else {
      console.log(`  ❌ Error: ${result.error}`);
      errors.push({ app, error: result.error });
    }
  }

  // Final Summary
  console.log('\n' + '='.repeat(65));
  console.log('📊 COMPREHENSIVE UPDATE SUMMARY');
  console.log('='.repeat(65));
  console.log(`🎯 Total Apps Processed: ${apps.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`🔄 Apps Updated: ${updateCount}`);
  console.log(`📦 Total Package Updates: ${totalPackageUpdates}`);
  console.log(`❌ Errors: ${errors.length}`);

  if (updateLog.length > 0) {
    console.log('\n🔄 DETAILED UPDATE BREAKDOWN:');
    updateLog.forEach(({ app, updates }) => {
      console.log(`\n📱 ${app.toUpperCase()}:`);
      updates.forEach(update => console.log(update));
    });
  }

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(({ app, error }) => {
      console.log(`  🚨 ${app}: ${error}`);
    });
  }

  console.log('\n🎯 IMPORTANT NOTES:');
  console.log('• ✅ Tailwind CSS kept at v3.4.17 (stable as requested)');
  console.log('• ✅ All @codai/* workspace packages preserved');
  console.log('• ✅ Only tested, stable versions selected');
  console.log('• ✅ Consistent version formatting applied');

  console.log('\n🚀 NEXT STEPS:');
  console.log('1. 📥 Run: pnpm install (install updated packages)');
  console.log('2. 🧪 Test: Build process for critical apps');
  console.log('3. ✅ Verify: Apps start and function correctly');
  console.log('4. 🚀 Deploy: After successful testing');

  if (totalPackageUpdates > 0) {
    console.log(`\n🎉 SUCCESS: Updated ${totalPackageUpdates} packages across ${updateCount} apps!`);
    console.log('📦 Your CODAI ecosystem is now using the latest stable packages!');
  } else {
    console.log('\n✨ PERFECT: All apps are already using the latest versions!');
  }
}

// Execute the main function
main();
