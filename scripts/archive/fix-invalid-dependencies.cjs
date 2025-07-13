#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING INVALID DEPENDENCIES');
console.log('Removing non-existent packages and fixing dependency issues...');
console.log('============================================================');

// Services to fix - include ALL services  
const SERVICES = [
  'apps/codai', 'apps/memorai', 'apps/logai', 'apps/bancai', 'apps/wallet',
  'apps/fabricai', 'apps/studiai', 'apps/sociai', 'apps/cumparai', 'apps/x', 'apps/publicai',
  'services/admin', 'services/AIDE', 'services/hub', 'services/ajutai', 'services/analizai',
  'services/dash', 'services/docs', 'services/explorer', 'services/id', 'services/jucai',
  'services/kodex', 'services/legalizai', 'services/marketai', 'services/metu', 'services/mod',
  'services/stocai', 'services/templates', 'services/tools', 'services/bancai', 'services/codai',
  'services/cumparai', 'services/fabricai', 'services/logai', 'services/memorai', 'services/publicai',
  'services/sociai', 'services/studiai', 'services/wallet', 'services/x'
];

// Invalid packages to remove
const INVALID_PACKAGES = [
  '@radix-ui/react-badge',
  'compliance-checker',
  'aws-sdk', // too large and not needed
  'coinbase', // deprecated
  'paypal-rest-sdk', // deprecated
  'metamask-sdk', // package name incorrect
  'ldap-client', // wrong package name
  'fluent-ffmpeg', // deprecated
  'pytorch', // wrong package name, should be torch
  'huggingface', // deprecated
  'wandb', // wrong version/package
  'grafana-api' // doesn't exist
];

let changes = 0;

SERVICES.forEach(servicePath => {
  const packageJsonPath = path.join(servicePath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return;

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    let modified = false;

    // Remove invalid dependencies
    if (packageJson.dependencies) {
      INVALID_PACKAGES.forEach(pkg => {
        if (packageJson.dependencies[pkg]) {
          delete packageJson.dependencies[pkg];
          modified = true;
          console.log(`❌ Removed invalid dependency: ${pkg} from ${servicePath}`);
        }
      });
    }

    // Remove invalid devDependencies
    if (packageJson.devDependencies) {
      INVALID_PACKAGES.forEach(pkg => {
        if (packageJson.devDependencies[pkg]) {
          delete packageJson.devDependencies[pkg];
          modified = true;
          console.log(`❌ Removed invalid devDependency: ${pkg} from ${servicePath}`);
        }
      });
    }

    if (modified) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      changes++;
      console.log(`✅ Fixed package.json: ${servicePath}`);
    }
  } catch (error) {
    console.log(`❌ Failed to fix package.json: ${servicePath} - ${error.message}`);
  }
});

console.log(`\n🎯 Fixed ${changes} package.json files`);
console.log('✅ DEPENDENCY CLEANUP COMPLETE!');
