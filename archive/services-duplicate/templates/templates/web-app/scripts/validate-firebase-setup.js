#!/usr/bin/env node

/**
 * Firebase Setup Validation Script
 * Validates that the Firebase setup automation is working correctly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color utilities
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

const log = {
  info: msg => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: msg => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: msg => console.log(`${colors.bright}${colors.cyan}🔧 ${msg}${colors.reset}\n`),
};

/**
 * Check if a command is available
 */
function isCommandAvailable(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if file exists and has content
 */
function checkFile(filePath, description) {
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    log.error(`${description} not found: ${filePath}`);
    return false;
  }

  const stats = fs.statSync(fullPath);
  if (stats.size === 0) {
    log.warning(`${description} is empty: ${filePath}`);
    return false;
  }

  log.success(`${description} found and has content`);
  return true;
}

/**
 * Validate the Firebase setup script
 */
function validateFirebaseSetupScript() {
  log.header('Validating Firebase Setup Script');

  const scriptPath = 'scripts/firebase-setup.js';

  if (!checkFile(scriptPath, 'Firebase setup script')) {
    return false;
  }

  // Check script content
  const content = fs.readFileSync(scriptPath, 'utf8');

  const requiredFunctions = [
    'isCommandAvailable',
    'execCommand',
    'authenticateGoogleCloud',
    'setupGoogleCloudProject',
    'initializeFirebaseProject',
    'createServiceAccount',
    'createWebApp',
    'updateEnvironmentFiles',
    'setupFirebaseRules',
  ];

  let missingFunctions = [];
  for (const func of requiredFunctions) {
    if (!content.includes(func)) {
      missingFunctions.push(func);
    }
  }

  if (missingFunctions.length > 0) {
    log.error(`Missing functions in Firebase setup script: ${missingFunctions.join(', ')}`);
    return false;
  }

  log.success('All required functions found in Firebase setup script');

  // Test help functionality
  try {
    const helpOutput = execSync('node scripts/firebase-setup.js --help', { encoding: 'utf8' });
    if (helpOutput.includes('Firebase Project Setup Script')) {
      log.success('Help functionality working');
    } else {
      log.warning('Help output unexpected');
    }
  } catch (error) {
    log.error('Help functionality failed');
    return false;
  }

  return true;
}

/**
 * Validate setup.js integration
 */
function validateSetupIntegration() {
  log.header('Validating Setup Integration');

  if (!checkFile('setup.js', 'Main setup script')) {
    return false;
  }

  const content = fs.readFileSync('setup.js', 'utf8');

  const requiredIntegrations = ['firebase-setup.js', 'checkFirebaseConfig', 'gcloud', 'firebase'];

  let missingIntegrations = [];
  for (const integration of requiredIntegrations) {
    if (!content.includes(integration)) {
      missingIntegrations.push(integration);
    }
  }

  if (missingIntegrations.length > 0) {
    log.error(`Missing integrations in main setup: ${missingIntegrations.join(', ')}`);
    return false;
  }

  log.success('All required integrations found in main setup script');
  return true;
}

/**
 * Validate package.json scripts
 */
function validatePackageScripts() {
  log.header('Validating Package Scripts');

  if (!checkFile('package.json', 'Package.json')) {
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  if (!packageJson.scripts || !packageJson.scripts['firebase:setup']) {
    log.error('firebase:setup script not found in package.json');
    return false;
  }

  if (packageJson.scripts['firebase:setup'] !== 'node scripts/firebase-setup.js') {
    log.error('firebase:setup script has incorrect command');
    return false;
  }

  log.success('firebase:setup script correctly configured in package.json');
  return true;
}

/**
 * Validate CLI tool detection
 */
function validateCLITools() {
  log.header('Validating CLI Tool Detection');

  const gcloudAvailable = isCommandAvailable('gcloud');
  const firebaseAvailable = isCommandAvailable('firebase');

  if (gcloudAvailable) {
    log.success('Google Cloud CLI is available');
  } else {
    log.warning('Google Cloud CLI not found (install: https://cloud.google.com/sdk/docs/install)');
  }

  if (firebaseAvailable) {
    log.success('Firebase CLI is available');
  } else {
    log.warning('Firebase CLI not found (install: npm install -g firebase-tools)');
  }

  return { gcloudAvailable, firebaseAvailable };
}

/**
 * Validate documentation
 */
function validateDocumentation() {
  log.header('Validating Documentation');

  const docFiles = [
    { path: 'docs/firebase-setup-automation.md', description: 'Firebase automation documentation' },
    { path: 'README.md', description: 'Main README' },
  ];

  let allValid = true;

  for (const doc of docFiles) {
    if (!checkFile(doc.path, doc.description)) {
      allValid = false;
      continue;
    }

    const content = fs.readFileSync(doc.path, 'utf8');

    if (doc.path.includes('firebase-setup-automation.md')) {
      if (!content.includes('Google Cloud CLI') || !content.includes('Firebase CLI')) {
        log.error('Firebase automation documentation missing CLI information');
        allValid = false;
      } else {
        log.success('Firebase automation documentation is comprehensive');
      }
    }

    if (doc.path.includes('README.md')) {
      if (!content.includes('firebase:setup') || !content.includes('Automated Setup')) {
        log.error('README missing Firebase automation information');
        allValid = false;
      } else {
        log.success('README includes Firebase automation information');
      }
    }
  }

  return allValid;
}

/**
 * Main validation function
 */
function main() {
  console.log(`${colors.bright}${colors.cyan}🚀 Firebase Setup Validation${colors.reset}\n`);

  const results = {
    script: validateFirebaseSetupScript(),
    integration: validateSetupIntegration(),
    packageScripts: validatePackageScripts(),
    documentation: validateDocumentation(),
  };

  const { gcloudAvailable, firebaseAvailable } = validateCLITools();

  console.log('\n' + '='.repeat(60));
  log.header('Validation Summary');

  const allPassed = Object.values(results).every(result => result);

  console.log(
    `${colors.green}✅ Firebase Setup Script:${colors.reset} ${results.script ? 'PASS' : 'FAIL'}`
  );
  console.log(
    `${colors.green}✅ Setup Integration:${colors.reset} ${results.integration ? 'PASS' : 'FAIL'}`
  );
  console.log(
    `${colors.green}✅ Package Scripts:${colors.reset} ${results.packageScripts ? 'PASS' : 'FAIL'}`
  );
  console.log(
    `${colors.green}✅ Documentation:${colors.reset} ${results.documentation ? 'PASS' : 'FAIL'}`
  );

  console.log('\n' + colors.cyan + 'CLI Tools:' + colors.reset);
  console.log(`   Google Cloud CLI: ${gcloudAvailable ? '✅ Available' : '⚠️ Not found'}`);
  console.log(`   Firebase CLI: ${firebaseAvailable ? '✅ Available' : '⚠️ Not found'}`);

  if (allPassed) {
    console.log(`\n${colors.bright}${colors.green}🎉 All validations passed!${colors.reset}`);

    if (gcloudAvailable && firebaseAvailable) {
      console.log(`\n${colors.cyan}Ready for automated Firebase setup!${colors.reset}`);
      console.log('Run: pnpm firebase:setup');
    } else {
      console.log(`\n${colors.yellow}Install CLI tools for full automation:${colors.reset}`);
      if (!gcloudAvailable)
        console.log('- Google Cloud CLI: https://cloud.google.com/sdk/docs/install');
      if (!firebaseAvailable) console.log('- Firebase CLI: npm install -g firebase-tools');
    }
  } else {
    console.log(
      `\n${colors.red}❌ Some validations failed. Please fix the issues above.${colors.reset}`
    );
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  main();
}
