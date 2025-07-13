#!/usr/bin/env node

/**
 * Dashboard Fix Validation Script
 * Tests that all 29 services are properly detected and can be displayed
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

console.log('🧪 Validating Dashboard Fix - Service Discovery Test');
console.log('==================================================');

async function validateProjectsIndex() {
  console.log('\n1. 📋 Validating projects.index.json...');

  const projectsIndexPath = join(PROJECT_ROOT, 'projects.index.json');
  if (!existsSync(projectsIndexPath)) {
    console.log('❌ projects.index.json not found');
    return false;
  }

  try {
    const projectsIndex = JSON.parse(readFileSync(projectsIndexPath, 'utf8'));

    console.log(`   ✅ Total Apps: ${projectsIndex.totalApps}`);
    console.log(`   ✅ Total Services: ${projectsIndex.totalServices}`);
    console.log(`   ✅ Total Projects: ${projectsIndex.totalProjects}`);

    if (projectsIndex.totalServices !== 29) {
      console.log(`   ❌ Expected 29 services, found ${projectsIndex.totalServices}`);
      return false;
    }

    if (!projectsIndex.services || projectsIndex.services.length !== 29) {
      console.log(`   ❌ Services array missing or incorrect length`);
      return false;
    }

    console.log(`   ✅ Services array contains ${projectsIndex.services.length} entries`);
    return true;

  } catch (error) {
    console.log(`   ❌ Error parsing projects.index.json: ${error.message}`);
    return false;
  }
}

async function validateDashboardFiles() {
  console.log('\n2. 🎨 Validating dashboard files...');

  const dashboardFiles = [
    'services/memorai/apps/dashboard/public/index.html',
    'services/memorai/apps/dashboard/public/dashboard.js',
    'services/memorai/apps/dashboard/public/projects.index.json'
  ];

  let allValid = true;

  for (const file of dashboardFiles) {
    const filePath = join(PROJECT_ROOT, file);
    if (existsSync(filePath)) {
      console.log(`   ✅ ${file} exists`);
    } else {
      console.log(`   ❌ ${file} missing`);
      allValid = false;
    }
  }

  return allValid;
}

async function validateServiceDirectories() {
  console.log('\n3. 📁 Validating service directories...');

  const servicesDir = join(PROJECT_ROOT, 'services');
  if (!existsSync(servicesDir)) {
    console.log('   ❌ Services directory not found');
    return false;
  }

  const expectedServices = [
    'admin', 'AIDE', 'ajutai', 'analizai', 'bancai', 'codai', 'cumparai',
    'dash', 'docs', 'explorer', 'fabricai', 'hub', 'id', 'jucai', 'kodex',
    'legalizai', 'logai', 'marketai', 'memorai', 'metu', 'mod', 'publicai',
    'sociai', 'stocai', 'studiai', 'templates', 'tools', 'wallet', 'x'
  ];

  const { readdirSync } = await import('fs');
  const actualServices = readdirSync(servicesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`   📊 Expected: ${expectedServices.length} services`);
  console.log(`   📊 Found: ${actualServices.length} service directories`);

  const missing = expectedServices.filter(service => !actualServices.includes(service));
  const extra = actualServices.filter(service => !expectedServices.includes(service));

  if (missing.length > 0) {
    console.log(`   ⚠️  Missing services: ${missing.join(', ')}`);
  }

  if (extra.length > 0) {
    console.log(`   ℹ️  Extra services: ${extra.join(', ')}`);
  }

  if (actualServices.length === 29) {
    console.log('   ✅ All 29 service directories found');
    return true;
  } else {
    console.log(`   ❌ Expected 29 services, found ${actualServices.length}`);
    return false;
  }
}

async function validateDashboardFeatures() {
  console.log('\n4. 🔧 Validating dashboard features...');

  const dashboardJsPath = join(PROJECT_ROOT, 'services/memorai/apps/dashboard/public/dashboard.js');
  if (!existsSync(dashboardJsPath)) {
    console.log('   ❌ dashboard.js not found');
    return false;
  }

  const dashboardContent = readFileSync(dashboardJsPath, 'utf8');

  const requiredFeatures = [
    'fetchProjects',
    'updateProjectsDisplay',
    'ecosystem',
    'projects.index.json'
  ];

  let allPresent = true;

  for (const feature of requiredFeatures) {
    if (dashboardContent.includes(feature)) {
      console.log(`   ✅ ${feature} implemented`);
    } else {
      console.log(`   ❌ ${feature} missing`);
      allPresent = false;
    }
  }

  return allPresent;
}

async function main() {
  try {
    const results = await Promise.all([
      validateProjectsIndex(),
      validateDashboardFiles(),
      validateServiceDirectories(),
      validateDashboardFeatures()
    ]);

    const allValid = results.every(result => result === true);

    console.log('\n🎯 VALIDATION SUMMARY');
    console.log('====================');

    if (allValid) {
      console.log('✅ ALL TESTS PASSED!');
      console.log('🎉 Dashboard fix is complete and ready to display all 29 services');
      console.log('\n📋 What was fixed:');
      console.log('   • Added missing "services" section to projects.index.json');
      console.log('   • Updated dashboard to load and display service data');
      console.log('   • Added new "Ecosystem" tab to show all services and apps');
      console.log('   • Created auto-discovery script for future-proofing');
      console.log('   • Enhanced service discovery and display logic');

      console.log('\n🚀 Next steps:');
      console.log('   1. Open the dashboard in a browser');
      console.log('   2. Click the "Ecosystem" tab');
      console.log('   3. Verify all 40 projects (11 apps + 29 services) are displayed');

    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('🔧 Please review the validation results above');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run validation
main();
