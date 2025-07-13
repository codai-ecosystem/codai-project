#!/usr/bin/env node

/**
 * Firebase Project Setup Script
 * Automates Firebase project creation using Google Cloud CLI and Firebase CLI
 * Part of the METU Template setup process
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Color utilities for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m',
};

const log = {
  info: msg => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: msg => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: msg => console.log(`${colors.cyan}🔧${colors.reset} ${msg}`),
  header: msg => console.log(`${colors.bright}${colors.magenta}🚀 ${msg}${colors.reset}\n`),
};

/**
 * Check if a command is available in the system
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
 * Execute a command with proper error handling
 */
function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
    return result?.toString().trim();
  } catch (error) {
    if (!options.allowFailure) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
    return null;
  }
}

/**
 * Prompt user for input
 */
function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Check if user is authenticated with Google Cloud
 */
function checkGoogleCloudAuth() {
  log.step('Checking Google Cloud authentication...');

  try {
    const result = execCommand(
      'gcloud auth list --filter=status:ACTIVE --format="value(account)"',
      { silent: true }
    );
    if (result && result.length > 0) {
      log.success(`Authenticated as: ${result}`);
      return true;
    }
  } catch (error) {
    // Ignore error, will prompt for authentication
  }

  return false;
}

/**
 * Authenticate with Google Cloud
 */
async function authenticateGoogleCloud() {
  log.step('Authenticating with Google Cloud...');

  if (checkGoogleCloudAuth()) {
    return true;
  }

  log.info('Opening browser for Google Cloud authentication...');
  execCommand('gcloud auth login');

  // Verify authentication
  if (checkGoogleCloudAuth()) {
    return true;
  }

  throw new Error('Google Cloud authentication failed');
}

/**
 * Get or set Google Cloud project
 */
async function setupGoogleCloudProject(projectName) {
  log.step('Setting up Google Cloud project...');

  const projectId = `${projectName}-${Date.now()}`;

  try {
    // Create the project
    log.info(`Creating Google Cloud project: ${projectId}`);
    execCommand(`gcloud projects create ${projectId} --name="${projectName}" --set-as-default`);

    // Enable billing (if billing account is set up)
    try {
      const billingAccounts = execCommand(
        'gcloud billing accounts list --format="value(name)" --limit=1',
        { silent: true }
      );
      if (billingAccounts) {
        const billingAccount = billingAccounts.split('\n')[0];
        execCommand(
          `gcloud billing projects link ${projectId} --billing-account=${billingAccount}`
        );
        log.success('Billing account linked');
      } else {
        log.warning('No billing account found. You may need to set up billing manually.');
      }
    } catch (error) {
      log.warning('Could not link billing account. Some Firebase features may require billing.');
    }

    // Enable required APIs
    log.step('Enabling required Google Cloud APIs...');
    const apis = [
      'firebase.googleapis.com',
      'firestore.googleapis.com',
      'identitytoolkit.googleapis.com',
      'cloudfunctions.googleapis.com',
      'storage-component.googleapis.com',
    ];

    for (const api of apis) {
      log.info(`Enabling ${api}...`);
      execCommand(`gcloud services enable ${api} --project=${projectId}`);
    }

    log.success(`Google Cloud project created: ${projectId}`);
    return projectId;
  } catch (error) {
    throw new Error(`Failed to create Google Cloud project: ${error.message}`);
  }
}

/**
 * Initialize Firebase project
 */
async function initializeFirebaseProject(projectId) {
  log.step('Initializing Firebase project...');

  try {
    // Add Firebase to the project
    execCommand(`firebase projects:addfirebase ${projectId}`);

    // Set the project as default
    execCommand(`firebase use ${projectId} --add`);

    // Enable Authentication
    log.info('Enabling Firebase Authentication...');
    execCommand(
      `firebase auth:import --project ${projectId} --hash-algo=SCRYPT --hash-key=base64key --salt-separator=Bw== --rounds=8 --mem-cost=14 /dev/null`,
      { allowFailure: true }
    );

    // Enable Firestore
    log.info('Enabling Firestore...');
    execCommand(`gcloud firestore databases create --project=${projectId} --region=us-central1`);

    log.success('Firebase project initialized');
    return true;
  } catch (error) {
    throw new Error(`Failed to initialize Firebase project: ${error.message}`);
  }
}

/**
 * Create service account and generate credentials
 */
async function createServiceAccount(projectId, environment = 'dev') {
  log.step(`Creating service account for ${environment} environment...`);

  try {
    const serviceAccountName = `metu-${environment}`;
    const serviceAccountEmail = `${serviceAccountName}@${projectId}.iam.gserviceaccount.com`;
    const keyFileName = `${serviceAccountName}-key.json`;
    const keyFilePath = path.join(process.cwd(), 'apps', 'backend', keyFileName);

    // Create service account
    execCommand(
      `gcloud iam service-accounts create ${serviceAccountName} --display-name="METU ${environment.toUpperCase()} Service Account" --project=${projectId}`
    );

    // Grant necessary roles
    const roles = ['roles/firebase.admin', 'roles/datastore.user', 'roles/storage.admin'];

    for (const role of roles) {
      execCommand(
        `gcloud projects add-iam-policy-binding ${projectId} --member="serviceAccount:${serviceAccountEmail}" --role="${role}"`
      );
    }

    // Generate and download key
    execCommand(
      `gcloud iam service-accounts keys create "${keyFilePath}" --iam-account="${serviceAccountEmail}" --project=${projectId}`
    );

    // Read the key file to extract credentials
    const keyData = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

    log.success(`Service account created: ${serviceAccountEmail}`);
    log.success(`Credentials saved to: ${keyFilePath}`);

    return {
      projectId,
      clientEmail: keyData.client_email,
      privateKey: keyData.private_key.replace(/\\n/g, '\n'),
      privateKeyId: keyData.private_key_id,
      keyFilePath,
    };
  } catch (error) {
    throw new Error(`Failed to create service account: ${error.message}`);
  }
}

/**
 * Generate Web App configuration
 */
async function createWebApp(projectId, appName) {
  log.step('Creating Firebase web app...');

  try {
    // Create web app
    const result = execCommand(`firebase apps:create WEB "${appName}" --project=${projectId}`, {
      silent: true,
    });

    // Extract app ID from output
    const appIdMatch = result.match(/App ID: (.+)/);
    if (!appIdMatch) {
      throw new Error('Could not extract app ID from Firebase CLI output');
    }

    const appId = appIdMatch[1];

    // Get web app config
    const configResult = execCommand(
      `firebase apps:sdkconfig WEB ${appId} --project=${projectId}`,
      { silent: true }
    );

    // Parse the config
    const configMatch = configResult.match(/const firebaseConfig = ({[\s\S]*?});/);
    if (!configMatch) {
      throw new Error('Could not extract Firebase config');
    }

    const config = eval('(' + configMatch[1] + ')'); // Safe since we control the input

    log.success(`Web app created: ${appName}`);
    return config;
  } catch (error) {
    throw new Error(`Failed to create web app: ${error.message}`);
  }
}

/**
 * Update environment files with generated credentials
 */
function updateEnvironmentFiles(devCredentials, testCredentials, webConfig) {
  log.step('Updating environment files...');

  try {
    // Backend .env files
    const backendDir = path.join(process.cwd(), 'apps', 'backend');

    // Update .env for development
    const devEnvPath = path.join(backendDir, '.env');
    const devEnvContent = `# Firebase Configuration (Development)
FIREBASE_PROJECT_ID=${devCredentials.projectId}
FIREBASE_CLIENT_EMAIL=${devCredentials.clientEmail}
FIREBASE_PRIVATE_KEY="${devCredentials.privateKey}"
FIREBASE_PRIVATE_KEY_ID=${devCredentials.privateKeyId}

# Server Configuration
PORT=3001
NODE_ENV=development
`;

    fs.writeFileSync(devEnvPath, devEnvContent);
    log.success('Created .env for development');

    // Update .env.test for testing
    const testEnvPath = path.join(backendDir, '.env.test');
    const testEnvContent = `# Firebase Configuration (Testing)
FIREBASE_PROJECT_ID=${testCredentials.projectId}
FIREBASE_CLIENT_EMAIL=${testCredentials.clientEmail}
FIREBASE_PRIVATE_KEY="${testCredentials.privateKey}"
FIREBASE_PRIVATE_KEY_ID=${testCredentials.privateKeyId}

# Server Configuration
PORT=3002
NODE_ENV=test
`;

    fs.writeFileSync(testEnvPath, testEnvContent);
    log.success('Created .env.test for testing');

    // Frontend .env files
    const webDir = path.join(process.cwd(), 'apps', 'web');

    // Update .env.local for frontend
    const webEnvPath = path.join(webDir, '.env.local');
    const webEnvContent = `# Firebase Configuration (Web)
NEXT_PUBLIC_FIREBASE_API_KEY=${webConfig.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${webConfig.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${webConfig.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${webConfig.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${webConfig.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${webConfig.appId}

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
`;

    fs.writeFileSync(webEnvPath, webEnvContent);
    log.success('Created .env.local for frontend');

    log.success('All environment files updated successfully');
  } catch (error) {
    throw new Error(`Failed to update environment files: ${error.message}`);
  }
}

/**
 * Set up Firebase security rules
 */
async function setupFirebaseRules(projectId) {
  log.step('Setting up Firebase security rules...');

  try {
    // Firestore rules
    const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public data that anyone can read
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`;

    const rulesPath = path.join(process.cwd(), 'apps', 'web', 'firestore.rules');
    fs.writeFileSync(rulesPath, firestoreRules);

    // Deploy rules
    execCommand(`firebase deploy --only firestore:rules --project ${projectId}`);

    log.success('Firebase security rules deployed');
  } catch (error) {
    log.warning(`Could not deploy security rules: ${error.message}`);
  }
}

/**
 * Main setup function
 */
async function main() {
  try {
    log.header('Firebase Project Setup');

    // Check prerequisites
    if (!isCommandAvailable('gcloud')) {
      log.error('Google Cloud CLI is not installed. Please install it first:');
      log.info('https://cloud.google.com/sdk/docs/install');
      process.exit(1);
    }

    if (!isCommandAvailable('firebase')) {
      log.error('Firebase CLI is not installed. Please install it first:');
      log.info('npm install -g firebase-tools');
      process.exit(1);
    }

    // Get project name
    const projectName = await promptUser('Enter your project name (e.g., "my-app"): ');
    if (!projectName) {
      log.error('Project name is required');
      process.exit(1);
    }

    // Authenticate
    await authenticateGoogleCloud();

    // Create Google Cloud project
    const projectId = await setupGoogleCloudProject(projectName);

    // Initialize Firebase
    await initializeFirebaseProject(projectId);

    // Create service accounts for dev and test
    log.step('Creating service accounts...');
    const devCredentials = await createServiceAccount(projectId, 'dev');
    const testCredentials = await createServiceAccount(projectId, 'test');

    // Create web app
    const webConfig = await createWebApp(projectId, `${projectName}-web`);

    // Update environment files
    updateEnvironmentFiles(devCredentials, testCredentials, webConfig);

    // Set up security rules
    await setupFirebaseRules(projectId);

    // Success message
    log.success('Firebase project setup completed successfully!');

    console.log('\n' + '='.repeat(60));
    log.header('Setup Complete!');

    console.log(`${colors.green}✅ Project ID:${colors.reset} ${projectId}`);
    console.log(`${colors.green}✅ Web App Config:${colors.reset} Updated in apps/web/.env.local`);
    console.log(
      `${colors.green}✅ Backend Dev Config:${colors.reset} Updated in apps/backend/.env`
    );
    console.log(
      `${colors.green}✅ Backend Test Config:${colors.reset} Updated in apps/backend/.env.test`
    );
    console.log(
      `${colors.green}✅ Service Account Keys:${colors.reset} Generated in apps/backend/`
    );

    console.log('\n' + colors.yellow + 'Next Steps:' + colors.reset);
    console.log('1. Review the generated environment files');
    console.log('2. Run "pnpm dev" to start the development servers');
    console.log('3. Run "pnpm test" to verify backend tests pass');
    console.log('4. Visit Firebase Console to configure additional settings:');
    console.log(`   https://console.firebase.google.com/project/${projectId}`);

    console.log('\n' + colors.cyan + 'Important:' + colors.reset);
    console.log('- Service account keys contain sensitive information');
    console.log('- Never commit .env files to version control');
    console.log('- Consider setting up CI/CD environment variables');
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const helpFlag = args.includes('--help') || args.includes('-h');

if (helpFlag) {
  console.log(`
Firebase Project Setup Script

This script automates the creation of a Firebase project with all necessary
configurations for the METU template.

Prerequisites:
- Google Cloud CLI (gcloud)
- Firebase CLI (firebase-tools)
- Google Cloud account with billing enabled (recommended)

Usage:
  node scripts/firebase-setup.js

The script will:
1. Authenticate with Google Cloud
2. Create a new Google Cloud project
3. Enable required APIs
4. Initialize Firebase
5. Create service accounts for dev and test environments
6. Generate and configure environment files
7. Set up basic security rules

Options:
  -h, --help    Show this help message

For more information, see the documentation at:
https://github.com/metu-org/metu-template
  `);
  process.exit(0);
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = {
  main,
  createServiceAccount,
  updateEnvironmentFiles,
  setupFirebaseRules,
};
