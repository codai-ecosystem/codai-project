#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Target Tailwind CSS version (stable)
const TARGET_TAILWIND_VERSION = '^3.4.0';
const TARGET_POSTCSS_VERSION = '^8.4.31';
const TARGET_AUTOPREFIXER_VERSION = '^10.4.16';

// Apps that should use Tailwind v3
const APPS_TO_FIX = [
  'apps/aide',
  'apps/ajutai',
  'apps/analizai',
  'apps/bancai',
  'apps/codai',
  'apps/cumparai',
  'apps/curtai',
  'apps/dash',
  'apps/dexai',
  'apps/docs',
  'apps/explorer',
  'apps/fabricai',
  'apps/hub',
  'apps/id',
  'apps/jucai',
  'apps/kodex',
  'apps/legalizai',
  'apps/logai',
  'apps/marketai',
  'apps/memorai',
  'apps/metu',
  'apps/mobile',
  'apps/mod',
  'apps/muzicai',
  'apps/publicai',
  'apps/sociai',
  'apps/stocai',
  'apps/studiai',
  'apps/sunai',
  'apps/talentai',
  'apps/tools',
  'apps/wallet',
  'apps/x',
  'packages/config',
  'packages/ui'
];

console.log('🔧 Starting Tailwind CSS ecosystem standardization...\n');

function updatePackageJson(appPath) {
  const packageJsonPath = path.join(appPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  No package.json found in ${appPath}`);
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    let updated = false;

    // Update devDependencies
    if (packageJson.devDependencies) {
      if (packageJson.devDependencies.tailwindcss) {
        console.log(`📦 Updating ${appPath}: tailwindcss ${packageJson.devDependencies.tailwindcss} -> ${TARGET_TAILWIND_VERSION}`);
        packageJson.devDependencies.tailwindcss = TARGET_TAILWIND_VERSION;
        updated = true;
      }

      // Remove v4 specific packages
      if (packageJson.devDependencies['@tailwindcss/postcss']) {
        console.log(`🗑️  Removing @tailwindcss/postcss from ${appPath}`);
        delete packageJson.devDependencies['@tailwindcss/postcss'];
        updated = true;
      }

      // Ensure postcss and autoprefixer are present
      if (!packageJson.devDependencies.postcss) {
        console.log(`➕ Adding postcss to ${appPath}`);
        packageJson.devDependencies.postcss = TARGET_POSTCSS_VERSION;
        updated = true;
      }

      if (!packageJson.devDependencies.autoprefixer) {
        console.log(`➕ Adding autoprefixer to ${appPath}`);
        packageJson.devDependencies.autoprefixer = TARGET_AUTOPREFIXER_VERSION;
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✅ Updated ${appPath}/package.json\n`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error updating ${appPath}: ${error.message}`);
    return false;
  }
}

function updatePostCSSConfig(appPath) {
  const postCSSConfigs = ['postcss.config.js', 'postcss.config.cjs', 'postcss.config.mjs'];

  for (const configFile of postCSSConfigs) {
    const configPath = path.join(appPath, configFile);

    if (fs.existsSync(configPath)) {
      try {
        const currentConfig = fs.readFileSync(configPath, 'utf8');

        // Standard Tailwind v3 PostCSS config
        const newConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

        if (currentConfig !== newConfig) {
          fs.writeFileSync(configPath, newConfig);
          console.log(`🔧 Updated ${appPath}/${configFile}`);
        }
        return true;
      } catch (error) {
        console.error(`❌ Error updating PostCSS config in ${appPath}: ${error.message}`);
      }
    }
  }

  return false;
}

function updateTailwindConfig(appPath) {
  const tailwindConfigs = ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.cjs'];

  for (const configFile of tailwindConfigs) {
    const configPath = path.join(appPath, configFile);

    if (fs.existsSync(configPath)) {
      try {
        let config = fs.readFileSync(configPath, 'utf8');

        // Ensure proper content paths for v3
        if (!config.includes('content:') && config.includes('purge:')) {
          config = config.replace(/purge:/g, 'content:');
          fs.writeFileSync(configPath, config);
          console.log(`🔧 Updated Tailwind config content paths in ${appPath}/${configFile}`);
        }

        return true;
      } catch (error) {
        console.error(`❌ Error updating Tailwind config in ${appPath}: ${error.message}`);
      }
    }
  }

  return false;
}

function updateGlobalCSS(appPath) {
  const possibleCSSPaths = [
    'app/globals.css',
    'src/app/globals.css',
    'styles/globals.css',
    'src/styles/globals.css'
  ];

  for (const cssPath of possibleCSSPaths) {
    const fullPath = path.join(appPath, cssPath);

    if (fs.existsSync(fullPath)) {
      try {
        let css = fs.readFileSync(fullPath, 'utf8');

        // Fix CSS imports for v3
        const v3Imports = `@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';`;

        const v4Import = `@import "tailwindcss";`;

        if (css.includes(v4Import)) {
          css = css.replace(v4Import, v3Imports);
          fs.writeFileSync(fullPath, css);
          console.log(`🎨 Updated CSS imports in ${appPath}/${cssPath}`);
          return true;
        }

        // Ensure v3 imports are present
        if (!css.includes('@import \'tailwindcss/base\'')) {
          css = v3Imports + '\n\n' + css;
          fs.writeFileSync(fullPath, css);
          console.log(`🎨 Added Tailwind imports to ${appPath}/${cssPath}`);
          return true;
        }

      } catch (error) {
        console.error(`❌ Error updating CSS in ${appPath}: ${error.message}`);
      }
    }
  }

  return false;
}

// Main execution
let totalUpdated = 0;

for (const appPath of APPS_TO_FIX) {
  const fullPath = path.resolve(appPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Path not found: ${appPath}`);
    continue;
  }

  console.log(`🔍 Processing ${appPath}...`);

  let appUpdated = false;

  if (updatePackageJson(fullPath)) appUpdated = true;
  if (updatePostCSSConfig(fullPath)) appUpdated = true;
  if (updateTailwindConfig(fullPath)) appUpdated = true;
  if (updateGlobalCSS(fullPath)) appUpdated = true;

  if (appUpdated) {
    totalUpdated++;
    console.log(`✅ Completed ${appPath}\n`);
  } else {
    console.log(`ℹ️  No changes needed for ${appPath}\n`);
  }
}

console.log(`\n🎉 Ecosystem standardization complete!`);
console.log(`📊 Updated ${totalUpdated} apps to use Tailwind CSS v3.4.x`);
console.log(`\n🔄 Next steps:`);
console.log(`   1. Run: pnpm install`);
console.log(`   2. Restart development servers`);
console.log(`   3. Verify styling in each app\n`);
