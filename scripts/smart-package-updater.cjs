const fs = require('fs');
const path = require('path');

console.log('📦 CODAI ECOSYSTEM - SMART PACKAGE UPDATER');
console.log('='.repeat(60));
console.log('Analyzing and updating to latest stable versions...\n');

// Latest stable versions (July 2025) - excluding Tailwind CSS v3
const latestVersions = {
  // Core Framework
  'next': '^15.4.1',
  'react': '^19.1.0',
  'react-dom': '^19.1.0',

  // TypeScript
  'typescript': '^5.8.3',
  '@types/react': '^19.1.8',
  '@types/react-dom': '^19.1.6',
  '@types/node': '^24.0.13',

  // Styling (Keep Tailwind v3 as requested)
  'tailwindcss': '^3.4.17',
  'autoprefixer': '^10.4.21',
  'postcss': '^8.5.6',
  'tailwindcss-animate': '^1.0.7',

  // UI Libraries
  'lucide-react': '^0.469.0',
  'framer-motion': '^12.23.3',
  'class-variance-authority': '^0.7.1',
  'clsx': '^2.1.1',
  'tailwind-merge': '^3.3.1',

  // Radix UI - Latest stable
  '@radix-ui/react-dialog': '^1.1.14',
  '@radix-ui/react-dropdown-menu': '^2.1.15',
  '@radix-ui/react-slot': '^1.2.3',
  '@radix-ui/react-toast': '^1.2.14',
  '@radix-ui/react-tooltip': '^1.2.7',

  // Development Tools
  'eslint': '^9.31.0',
  'eslint-config-next': '^15.4.1',
  'prettier': '^3.6.2',
  '@typescript-eslint/eslint-plugin': '^8.36.0',
  '@typescript-eslint/parser': '^8.36.0',

  // Testing
  'vitest': '^3.2.4',
  '@vitejs/plugin-react': '^4.6.0',
  '@testing-library/react': '^16.1.0',
  '@testing-library/jest-dom': '^6.6.3',
  '@testing-library/user-event': '^14.5.2',
  'jsdom': '^24.0.0',
  'happy-dom': '^15.1.1',

  // Other common packages
  'zustand': '^5.0.6',
  'zod': '^4.0.5',
  'date-fns': '^4.1.0',
  'recharts': '^3.1.0'
};

// Packages to skip (keep current versions)
const skipPackages = new Set([
  '@codai/shared-ui',
  '@codai/translations',
  '@codai/auth',
  '@codai/api-keys',
  '@codai/azure-openai',
  '@codai/logai-integration',
  '@codai/logai-sdk'
]);

function compareVersions(current, latest) {
  // Remove ^ and ~ prefixes for comparison
  const cleanCurrent = current.replace(/^[\^~]/, '');
  const cleanLatest = latest.replace(/^[\^~]/, '');

  if (cleanCurrent === cleanLatest) return 'equal';

  const currentParts = cleanCurrent.split('.').map(Number);
  const latestParts = cleanLatest.split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const curr = currentParts[i] || 0;
    const lat = latestParts[i] || 0;

    if (lat > curr) return 'outdated';
    if (lat < curr) return 'newer';
  }

  return 'equal';
}

// Get all app directories
const appsDir = 'apps';
const apps = fs.readdirSync(appsDir).filter(dir => {
  const appPath = path.join(appsDir, dir);
  return fs.statSync(appPath).isDirectory() &&
    fs.existsSync(path.join(appPath, 'package.json'));
});

console.log(`Found ${apps.length} apps to analyze:\n`);

let totalUpdates = 0;
let appsUpdated = 0;
const updateLog = [];

for (const app of apps) {
  console.log(`🔍 Analyzing ${app.toUpperCase()}...`);

  try {
    const packageJsonPath = path.join(appsDir, app, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const updates = [];
    let packageUpdated = false;

    // Check dependencies
    if (packageJson.dependencies) {
      for (const [pkg, currentVersion] of Object.entries(packageJson.dependencies)) {
        if (skipPackages.has(pkg)) continue;

        if (latestVersions[pkg]) {
          const comparison = compareVersions(currentVersion, latestVersions[pkg]);
          if (comparison === 'outdated') {
            packageJson.dependencies[pkg] = latestVersions[pkg];
            updates.push(`${pkg}: ${currentVersion} → ${latestVersions[pkg]}`);
            packageUpdated = true;
            totalUpdates++;
          }
        }
      }
    }

    // Check devDependencies
    if (packageJson.devDependencies) {
      for (const [pkg, currentVersion] of Object.entries(packageJson.devDependencies)) {
        if (skipPackages.has(pkg)) continue;

        if (latestVersions[pkg]) {
          const comparison = compareVersions(currentVersion, latestVersions[pkg]);
          if (comparison === 'outdated') {
            packageJson.devDependencies[pkg] = latestVersions[pkg];
            updates.push(`${pkg}: ${currentVersion} → ${latestVersions[pkg]}`);
            packageUpdated = true;
            totalUpdates++;
          }
        }
      }
    }

    if (packageUpdated) {
      // Write updated package.json with proper formatting
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`  ✅ Updated ${updates.length} packages`);
      updates.forEach(update => console.log(`    📦 ${update}`));
      appsUpdated++;
      updateLog.push({ app, updates });
    } else {
      console.log(`  ✅ All tracked packages are up to date`);
    }

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

// Summary Report
console.log('\n' + '='.repeat(60));
console.log('📊 PACKAGE UPDATE SUMMARY');
console.log('='.repeat(60));
console.log(`🎯 Apps Analyzed: ${apps.length}`);
console.log(`🔄 Apps Updated: ${appsUpdated}`);
console.log(`📦 Total Package Updates: ${totalUpdates}`);
console.log(`✅ Apps Already Current: ${apps.length - appsUpdated}`);

if (updateLog.length > 0) {
  console.log('\n🔄 DETAILED UPDATE LOG:');
  updateLog.forEach(({ app, updates }) => {
    console.log(`\n📱 ${app.toUpperCase()}:`);
    updates.forEach(update => console.log(`  • ${update}`));
  });
}

console.log('\n🎯 SPECIAL NOTES:');
console.log('• Tailwind CSS kept at v3.x as requested (stable version)');
console.log('• Workspace packages (@codai/*) preserved as-is');
console.log('• Only stable, well-tested versions selected');

console.log('\n🚀 NEXT STEPS:');
console.log('1. Run: pnpm install (to install updated packages)');
console.log('2. Test: Critical apps for compatibility');
console.log('3. Verify: Build process works correctly');
console.log('4. Deploy: After successful testing');

if (totalUpdates > 0) {
  console.log(`\n🎉 Successfully updated ${totalUpdates} packages across ${appsUpdated} apps!`);
} else {
  console.log('\n✨ All apps are already using the latest versions!');
}
