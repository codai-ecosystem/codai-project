const fs = require('fs');
const path = require('path');

console.log('🔄 CODAI ECOSYSTEM - PACKAGE UPDATER');
console.log('='.repeat(50));
console.log('Updating packages to latest versions (keeping Tailwind CSS v3)...\n');

// Latest package versions (as of July 2025)
const latestVersions = {
  // Core Next.js & React
  'next': '^15.4.1',
  'react': '^19.1.0',
  'react-dom': '^19.1.0',

  // TypeScript
  'typescript': '^5.8.3',
  '@types/react': '^19.1.0',
  '@types/react-dom': '^19.1.0',
  '@types/node': '^22.15.0',

  // Styling & UI
  'tailwindcss': '^3.4.17', // Keep at v3 as requested
  '@tailwindcss/forms': '^0.5.9',
  '@tailwindcss/typography': '^0.5.15',
  'autoprefixer': '^10.4.20',
  'postcss': '^8.5.1',

  // Utilities
  'lucide-react': '^0.469.0',
  'framer-motion': '^12.0.0',
  'class-variance-authority': '^0.7.1',
  'clsx': '^2.1.1',
  'tailwind-merge': '^2.6.0',

  // Radix UI Components
  '@radix-ui/react-dialog': '^1.1.2',
  '@radix-ui/react-dropdown-menu': '^2.1.2',
  '@radix-ui/react-slot': '^1.1.0',
  '@radix-ui/react-separator': '^1.1.0',
  '@radix-ui/react-accordion': '^1.2.1',
  '@radix-ui/react-alert-dialog': '^1.1.2',
  '@radix-ui/react-avatar': '^1.1.1',
  '@radix-ui/react-checkbox': '^1.1.2',
  '@radix-ui/react-collapsible': '^1.1.1',
  '@radix-ui/react-label': '^2.1.0',
  '@radix-ui/react-popover': '^1.1.2',
  '@radix-ui/react-progress': '^1.1.0',
  '@radix-ui/react-radio-group': '^1.2.1',
  '@radix-ui/react-scroll-area': '^1.2.0',
  '@radix-ui/react-select': '^2.1.2',
  '@radix-ui/react-slider': '^1.2.1',
  '@radix-ui/react-switch': '^1.1.1',
  '@radix-ui/react-tabs': '^1.1.1',
  '@radix-ui/react-toast': '^1.2.2',
  '@radix-ui/react-toggle': '^1.1.0',
  '@radix-ui/react-tooltip': '^1.1.3',

  // Development tools
  'eslint': '^9.15.0',
  'eslint-config-next': '^15.4.1',
  'prettier': '^3.4.2',
  '@typescript-eslint/eslint-plugin': '^8.17.0',
  '@typescript-eslint/parser': '^8.17.0',

  // Testing
  '@playwright/test': '^1.49.0',
  'vitest': '^2.1.8',
  '@vitejs/plugin-react': '^4.3.4',

  // Workspace packages
  '@codai/shared-ui': 'workspace:*',
  '@codai/translations': 'workspace:*',
  '@codai/auth': 'workspace:*'
};

// Get all app directories
const appsDir = 'apps';
const apps = fs.readdirSync(appsDir).filter(dir => {
  const appPath = path.join(appsDir, dir);
  return fs.statSync(appPath).isDirectory() &&
    fs.existsSync(path.join(appPath, 'package.json'));
});

console.log(`Found ${apps.length} apps to update:\n`);

let updatedCount = 0;
let errorCount = 0;
const updateSummary = [];

for (const app of apps) {
  console.log(`🔄 Updating ${app.toUpperCase()}...`);

  try {
    const packageJsonPath = path.join(appsDir, app, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    let updatesMade = 0;
    const updatedPackages = [];

    // Update dependencies
    if (packageJson.dependencies) {
      for (const [pkg, currentVersion] of Object.entries(packageJson.dependencies)) {
        if (latestVersions[pkg] && currentVersion !== latestVersions[pkg]) {
          packageJson.dependencies[pkg] = latestVersions[pkg];
          updatedPackages.push(`${pkg}: ${currentVersion} → ${latestVersions[pkg]}`);
          updatesMade++;
        }
      }
    }

    // Update devDependencies
    if (packageJson.devDependencies) {
      for (const [pkg, currentVersion] of Object.entries(packageJson.devDependencies)) {
        if (latestVersions[pkg] && currentVersion !== latestVersions[pkg]) {
          packageJson.devDependencies[pkg] = latestVersions[pkg];
          updatedPackages.push(`${pkg}: ${currentVersion} → ${latestVersions[pkg]}`);
          updatesMade++;
        }
      }
    }

    if (updatesMade > 0) {
      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`  ✅ Updated ${updatesMade} packages`);
      updatedPackages.forEach(update => console.log(`    📦 ${update}`));
      updatedCount++;
      updateSummary.push({ app, updates: updatesMade, packages: updatedPackages });
    } else {
      console.log(`  ✅ Already up to date`);
    }

  } catch (error) {
    console.log(`  ❌ Error updating ${app}: ${error.message}`);
    errorCount++;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 PACKAGE UPDATE SUMMARY');
console.log('='.repeat(50));
console.log(`🎯 Total Apps: ${apps.length}`);
console.log(`✅ Updated: ${updatedCount}`);
console.log(`❌ Errors: ${errorCount}`);

if (updateSummary.length > 0) {
  console.log('\n🔄 DETAILED UPDATES:');
  updateSummary.forEach(({ app, updates, packages }) => {
    console.log(`\n📦 ${app.toUpperCase()} (${updates} packages):`);
    packages.forEach(pkg => console.log(`  • ${pkg}`));
  });
}

console.log('\n🎯 IMPORTANT: Tailwind CSS kept at version 3.x as requested');
console.log('🔄 Next: Run "pnpm install" to install updated packages');
console.log('🧪 Then: Test critical apps to ensure compatibility');
