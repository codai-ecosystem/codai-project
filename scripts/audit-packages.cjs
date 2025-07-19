const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 CODAI ECOSYSTEM - PACKAGE UPDATE AUDIT');
console.log('='.repeat(50));
console.log('Analyzing package versions across 43+ apps...\n');

// Get latest versions of common packages (excluding Tailwind CSS 3.x)
const commonPackages = {
  'next': 'latest',
  'react': 'latest',
  'react-dom': 'latest',
  'typescript': 'latest',
  '@types/react': 'latest',
  '@types/react-dom': 'latest',
  '@types/node': 'latest',
  'eslint': 'latest',
  'eslint-config-next': 'latest',
  'autoprefixer': 'latest',
  'postcss': 'latest',
  'tailwindcss': '^3.4.17', // Keep Tailwind at v3
  '@tailwindcss/forms': '^0.5.9',
  '@tailwindcss/typography': '^0.5.15',
  'lucide-react': 'latest',
  'framer-motion': 'latest',
  '@radix-ui/react-dialog': 'latest',
  '@radix-ui/react-dropdown-menu': 'latest',
  '@radix-ui/react-button': 'latest',
  'class-variance-authority': 'latest',
  'clsx': 'latest',
  'tailwind-merge': 'latest',
  '@codai/shared-ui': 'workspace:*',
  '@codai/translations': 'workspace:*'
};

// Get all app directories
const appsDir = 'apps';
const apps = fs.readdirSync(appsDir).filter(dir => {
  const appPath = path.join(appsDir, dir);
  return fs.statSync(appPath).isDirectory() &&
    fs.existsSync(path.join(appPath, 'package.json'));
});

console.log(`Found ${apps.length} apps to update:\n`);

let outdatedApps = [];
let updatedApps = [];
let errors = [];

for (const app of apps) {
  console.log(`\n🔍 Analyzing ${app.toUpperCase()}...`);

  try {
    const packageJsonPath = path.join(appsDir, app, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    let hasUpdates = false;
    const currentDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const updates = {};

    // Check for outdated packages
    for (const [pkg, targetVersion] of Object.entries(commonPackages)) {
      if (currentDeps[pkg]) {
        const currentVersion = currentDeps[pkg];
        if (currentVersion !== targetVersion && !currentVersion.startsWith('workspace:')) {
          updates[pkg] = {
            current: currentVersion,
            target: targetVersion
          };
          hasUpdates = true;
        }
      }
    }

    if (hasUpdates) {
      console.log(`  📊 Found ${Object.keys(updates).length} packages to update:`);
      Object.entries(updates).forEach(([pkg, versions]) => {
        console.log(`    📌 ${pkg}: ${versions.current} → ${versions.target}`);
      });
      outdatedApps.push({ app, updates });
    } else {
      console.log(`  ✅ All packages are up to date`);
      updatedApps.push(app);
    }

  } catch (error) {
    console.log(`  ❌ Error analyzing ${app}: ${error.message}`);
    errors.push({ app, error: error.message });
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 PACKAGE AUDIT SUMMARY');
console.log('='.repeat(50));
console.log(`🎯 Total Apps: ${apps.length}`);
console.log(`✅ Up to Date: ${updatedApps.length}`);
console.log(`🔄 Need Updates: ${outdatedApps.length}`);
console.log(`❌ Errors: ${errors.length}`);

if (outdatedApps.length > 0) {
  console.log('\n🔄 APPS NEEDING UPDATES:');
  outdatedApps.forEach(({ app, updates }) => {
    console.log(`  📦 ${app}: ${Object.keys(updates).length} packages`);
  });
}

if (errors.length > 0) {
  console.log('\n❌ APPS WITH ERRORS:');
  errors.forEach(({ app, error }) => {
    console.log(`  🚨 ${app}: ${error}`);
  });
}

console.log('\n🎯 Next: Run package update script to apply changes...');
