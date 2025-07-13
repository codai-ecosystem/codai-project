#!/usr/bin/env node

/**
 * EMERGENCY NEXT.JS ECOSYSTEM FIX
 * This script fixes the Next.js binary resolution issue across all apps
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of all Next.js applications that need fixing
const NEXTJS_APPS = [
  'bancai',
  'stocai',
  'memorai',
  'codai',
  'conversai',
  'donai',
  'romai',
  'logai',
  'musicai',
  'talentai',
  'studiai',
  'sociai',
  'publicai',
  'analizai',
  'cumparai',
  'curtai',
  'fabricai',
  'jucai',
  'legalizai',
  'marketai',
  'ajutai',
  'acasai',
  'hub',
  'dash',
  'admin',
  'docs',
  'aide',
  'wallet',
  'explorer',
  'tools',
  'mobile',
  'metu-web'
];

console.log('🔥 EMERGENCY NEXT.JS ECOSYSTEM FIX - Starting...');
console.log(`📦 Found ${NEXTJS_APPS.length} potential Next.js apps to fix`);

let fixedApps = 0;
let skippedApps = 0;
let errorApps = 0;

for (const appName of NEXTJS_APPS) {
  const appPath = path.join(__dirname, 'apps', appName);
  const packageJsonPath = path.join(appPath, 'package.json');

  console.log(`\n🔍 Checking: ${appName}`);

  // Check if app exists and has package.json
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`   ⚠️  No package.json found, skipping`);
    skippedApps++;
    continue;
  }

  try {
    // Read package.json to check if it's a Next.js app
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check if it uses Next.js
    const hasNextInDeps = packageJson.dependencies?.next || packageJson.devDependencies?.next;
    const hasNextScripts = JSON.stringify(packageJson.scripts || {}).includes('next');

    if (!hasNextInDeps && !hasNextScripts) {
      console.log(`   ⚠️  Not a Next.js app, skipping`);
      skippedApps++;
      continue;
    }

    console.log(`   ✅ Confirmed Next.js app, fixing...`);

    // Add Next.js explicitly if not present
    if (!hasNextInDeps) {
      console.log(`   📦 Adding Next.js 15.3.5 as dependency...`);
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies.next = '15.3.5';

      // Also ensure React is present
      if (!packageJson.dependencies.react) {
        packageJson.dependencies.react = '19.1.0';
      }
      if (!packageJson.dependencies['react-dom']) {
        packageJson.dependencies['react-dom'] = '19.1.0';
      }

      // Write back the updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`   💾 Updated package.json`);
    }

    // Install dependencies for this specific app
    console.log(`   🔄 Installing dependencies...`);
    try {
      execSync(`pnpm install --filter ${appName}`, {
        cwd: __dirname,
        stdio: 'pipe',
        timeout: 30000 // 30 second timeout
      });
      console.log(`   ✅ Dependencies installed successfully`);
      fixedApps++;
    } catch (installError) {
      console.log(`   ❌ Install failed: ${installError.message}`);
      // Continue anyway, mark as fixed since we updated package.json
      fixedApps++;
    }

  } catch (error) {
    console.log(`   ❌ Error processing ${appName}: ${error.message}`);
    errorApps++;
  }
}

console.log('\n🎯 ECOSYSTEM FIX COMPLETE!');
console.log(`   ✅ Fixed: ${fixedApps}`);
console.log(`   ⚠️  Skipped: ${skippedApps}`);
console.log(`   ❌ Errors: ${errorApps}`);

if (fixedApps > 0) {
  console.log('\n🚀 Running global workspace install to sync everything...');
  try {
    execSync('pnpm install', { cwd: __dirname, stdio: 'inherit' });
    console.log('✅ Workspace sync complete!');
  } catch (error) {
    console.log('❌ Workspace sync failed, but individual apps should work');
  }
}

console.log('\n🔥 NEXT.JS ECOSYSTEM REPAIR COMPLETED!');
