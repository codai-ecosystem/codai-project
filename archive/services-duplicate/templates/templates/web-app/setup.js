#!/usr/bin/env node

/**
 * METU Template Setup Script
 * Unified comprehensive setup for development environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
 * Detect the preferred package manager
 */
function detectPackageManager() {
  // Check for pnpm-lock.yaml first (preferred)
  if (fs.existsSync('pnpm-lock.yaml')) {
    return isCommandAvailable('pnpm') ? 'pnpm' : null;
  }

  // Check for package-lock.json
  if (fs.existsSync('package-lock.json')) {
    return isCommandAvailable('npm') ? 'npm' : null;
  }

  // Check for yarn.lock
  if (fs.existsSync('yarn.lock')) {
    return isCommandAvailable('yarn') ? 'yarn' : null;
  }

  // Default to pnpm if available, otherwise npm
  if (isCommandAvailable('pnpm')) return 'pnpm';
  if (isCommandAvailable('npm')) return 'npm';
  if (isCommandAvailable('yarn')) return 'yarn';

  return null;
}

/**
 * Check Node.js version requirements
 */
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

  log.step('Checking Node.js version...');

  if (majorVersion < 18) {
    log.error(`Node.js 18 or higher is required. Current version: ${nodeVersion}`);
    log.info('Please update Node.js: https://nodejs.org/');
    process.exit(1);
  }

  log.success(`Node.js version ${nodeVersion} meets requirements`);
}

/**
 * Setup environment variables
 */
function setupEnvironment() {
  const envPaths = [
    { src: 'apps/web/.env.example', dest: 'apps/web/.env.local' },
    { src: 'apps/backend/.env.example', dest: 'apps/backend/.env.local' },
  ];

  log.step('Setting up environment variables...');

  envPaths.forEach(({ src, dest }) => {
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      try {
        fs.copyFileSync(src, dest);
        log.success(`Created ${dest}`);
      } catch (error) {
        log.warning(`Could not create ${dest}: ${error.message}`);
      }
    } else if (fs.existsSync(dest)) {
      log.info(`${dest} already exists`);
    }
  });
}

/**
 * Ask user if they want Firebase integration
 */
async function askFirebaseIntegration() {
  log.step('Firebase Integration Setup');

  console.log('\n' + colors.cyan + 'Do you need Firebase integration?' + colors.reset);
  console.log(
    'Firebase provides authentication, database (Firestore), and other backend services.'
  );
  console.log('');
  console.log(`${colors.green}Choose "Yes" if you need:${colors.reset}`);
  console.log('  • User authentication (login/register)');
  console.log('  • Database storage (Firestore)');
  console.log('  • File storage');
  console.log('  • Real-time features');
  console.log('');
  console.log(`${colors.yellow}Choose "No" if you\'re building:${colors.reset}`);
  console.log('  • A landing page');
  console.log('  • A static site');
  console.log('  • An app with a different backend');
  console.log('');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const useFirebase = await new Promise(resolve => {
    rl.question('Enable Firebase integration? (y/N): ', answer => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });

  return useFirebase;
}

/**
 * Ask user if they want to use Firebase emulators
 */
async function askFirebaseEmulators() {
  console.log('\n' + colors.cyan + 'Firebase Development Environment' + colors.reset);
  console.log('For development, you can use:');
  console.log('');
  console.log(`${colors.green}Production Firebase (Recommended):${colors.reset}`);
  console.log('  • Uses real Firebase services');
  console.log('  • Requires Firebase project setup');
  console.log('  • Better for testing real functionality');
  console.log('');
  console.log(`${colors.yellow}Firebase Emulators:${colors.reset}`);
  console.log('  • Local development environment');
  console.log('  • No Firebase project required initially');
  console.log('  • Offline development capability');
  console.log('');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const useEmulators = await new Promise(resolve => {
    rl.question('Use Firebase emulators for development? (y/N): ', answer => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });

  return useEmulators;
}

/**
 * Update emulator settings in existing environment files
 */
async function updateEmulatorSettings(useEmulators) {
  const webEnvPath = 'apps/web/.env.local';
  const backendEnvPath = 'apps/backend/.env.local';

  // Update web env
  if (fs.existsSync(webEnvPath)) {
    let webEnv = fs.readFileSync(webEnvPath, 'utf8');

    if (useEmulators) {
      webEnv = webEnv.replace(
        /NEXT_PUBLIC_USE_EMULATORS="?false"?/g,
        'NEXT_PUBLIC_USE_EMULATORS="true"'
      );
      webEnv = webEnv.replace(/# FIREBASE_AUTH_EMULATOR_HOST/g, 'FIREBASE_AUTH_EMULATOR_HOST');
      webEnv = webEnv.replace(/# FIRESTORE_EMULATOR_HOST/g, 'FIRESTORE_EMULATOR_HOST');
      webEnv = webEnv.replace(
        /# FIREBASE_STORAGE_EMULATOR_HOST/g,
        'FIREBASE_STORAGE_EMULATOR_HOST'
      );
      webEnv = webEnv.replace(
        /# FIREBASE_DATABASE_EMULATOR_HOST/g,
        'FIREBASE_DATABASE_EMULATOR_HOST'
      );
      webEnv = webEnv.replace(
        /# FIREBASE_FUNCTIONS_EMULATOR_HOST/g,
        'FIREBASE_FUNCTIONS_EMULATOR_HOST'
      );
    } else {
      webEnv = webEnv.replace(
        /NEXT_PUBLIC_USE_EMULATORS="?true"?/g,
        'NEXT_PUBLIC_USE_EMULATORS="false"'
      );
      webEnv = webEnv.replace(/^FIREBASE_AUTH_EMULATOR_HOST/gm, '# FIREBASE_AUTH_EMULATOR_HOST');
      webEnv = webEnv.replace(/^FIRESTORE_EMULATOR_HOST/gm, '# FIRESTORE_EMULATOR_HOST');
      webEnv = webEnv.replace(
        /^FIREBASE_STORAGE_EMULATOR_HOST/gm,
        '# FIREBASE_STORAGE_EMULATOR_HOST'
      );
      webEnv = webEnv.replace(
        /^FIREBASE_DATABASE_EMULATOR_HOST/gm,
        '# FIREBASE_DATABASE_EMULATOR_HOST'
      );
      webEnv = webEnv.replace(
        /^FIREBASE_FUNCTIONS_EMULATOR_HOST/gm,
        '# FIREBASE_FUNCTIONS_EMULATOR_HOST'
      );
    }

    fs.writeFileSync(webEnvPath, webEnv);
    log.success(`Updated ${webEnvPath} with emulator settings`);
  }
}

/**
 * Setup Firebase with emulator configuration
 */
async function setupFirebaseWithEmulators() {
  log.info('Setting up Firebase with emulator support...');

  const webEnvContent = `# Firebase Integration - ENABLED (with emulators)
NEXT_PUBLIC_FIREBASE_ENABLED="true"

# Firebase Configuration (demo project for emulators)
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-metu-template
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-DEMO123456

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:6388
NEXT_PUBLIC_APP_NAME="METU Template"
NEXT_PUBLIC_APP_DESCRIPTION="Modern Next.js 15 Template with Firebase"
NEXT_PUBLIC_BACKEND_URL="http://localhost:6389"

# Development
NODE_ENV=development
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_USE_EMULATORS=true

# Firebase Emulator Configuration
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
FIREBASE_DATABASE_EMULATOR_HOST=localhost:9000
FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001

# Stripe Configuration (Optional - for payment processing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"

# Optional: For advanced Stripe features
NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_your_stripe_connect_client_id
`;

  const backendEnvContent = `# METU Template - Backend Environment Configuration (with Firebase emulators)
# ------------------------------------------------

# Server Configuration
NODE_ENV=development
PORT=6389
HOST=localhost
LOG_LEVEL=info

# Firebase Integration - ENABLED (with emulators)
FIREBASE_ENABLED="true"

# Firebase Configuration (demo project for emulators)
FIREBASE_PROJECT_ID=demo-metu-template

# JWT Configuration (for custom auth if needed)
JWT_SECRET="metu-template-dev-secret-CHANGE-IN-PRODUCTION"
JWT_EXPIRES_IN="3600"

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:6388

# Rate Limiting Configuration
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW_MS="60000"

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_endpoint_secret_here
STRIPE_CONNECT_CLIENT_SECRET=sk_test_your_stripe_connect_secret_here
`;

  // Write environment files
  fs.writeFileSync('apps/web/.env.local', webEnvContent);
  fs.writeFileSync('apps/backend/.env.local', backendEnvContent);

  log.success('Firebase emulator configuration created');
  console.log('\n' + colors.green + 'Next steps for Firebase emulators:' + colors.reset);
  console.log('  1. Install Firebase CLI: npm install -g firebase-tools');
  console.log('  2. Start emulators: firebase emulators:start');
  console.log('  3. Start development servers: pnpm dev');
  console.log('');
  console.log(colors.cyan + 'Emulator URLs:' + colors.reset);
  console.log('  • Auth UI: http://localhost:4000/auth');
  console.log('  • Firestore UI: http://localhost:4000/firestore');
  console.log('  • Storage UI: http://localhost:4000/storage');
}

/**
 * Setup Firebase integration
 */
async function setupFirebaseIntegration() {
  const envPath = 'apps/web/.env.local';
  const backendEnvPath = 'apps/backend/.env.local';

  // Ask about emulator usage first
  const useEmulators = await askFirebaseEmulators();

  // Check if Firebase is already configured
  const hasWebConfig =
    fs.existsSync(envPath) &&
    fs.readFileSync(envPath, 'utf8').includes('NEXT_PUBLIC_FIREBASE_API_KEY') &&
    !fs.readFileSync(envPath, 'utf8').includes('your_api_key_here');

  const hasBackendConfig =
    fs.existsSync(backendEnvPath) &&
    fs.readFileSync(backendEnvPath, 'utf8').includes('FIREBASE_PROJECT_ID') &&
    !fs.readFileSync(backendEnvPath, 'utf8').includes('your_project_id_here');

  if (hasWebConfig && hasBackendConfig) {
    log.success('Firebase configuration appears to be set up');

    // Update emulator settings in existing config
    await updateEmulatorSettings(useEmulators);
    return;
  }

  // Check for CLI tools
  const hasGCloudCLI = isCommandAvailable('gcloud');
  const hasFirebaseCLI = isCommandAvailable('firebase');

  if (hasGCloudCLI && hasFirebaseCLI && !useEmulators) {
    log.info('Firebase CLI tools detected!');
    console.log('\n' + colors.cyan + 'Firebase Setup Options:' + colors.reset);
    console.log('1. Automated setup (recommended) - Creates new Firebase project');
    console.log('2. Manual setup - Configure existing Firebase project');
    console.log('3. Skip for now - Set up Firebase later');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise(resolve => {
      rl.question('\nChoose an option (1-3): ', answer => {
        rl.close();
        resolve(answer.trim());
      });
    });

    if (answer === '1') {
      log.info('Running automated Firebase setup...');
      try {
        const { execSync } = require('child_process');
        execSync('node scripts/firebase-setup.js', { stdio: 'inherit' });
        log.success('Automated Firebase setup completed!');
        await updateEmulatorSettings(useEmulators);
        return;
      } catch (error) {
        log.error('Automated setup failed. Falling back to manual instructions.');
      }
    } else if (answer === '3') {
      log.info(
        'Skipping Firebase setup. You can run it later with: node scripts/firebase-setup.js'
      );
      return;
    }
  }

  // Manual setup instructions
  if (useEmulators) {
    log.info('Setting up Firebase with emulator configuration...');
    await setupFirebaseWithEmulators();
  } else {
    log.warning('Firebase configuration needed:');
    console.log('\n' + colors.yellow + 'Manual Setup Steps:' + colors.reset);
    console.log('   1. Create a Firebase project at https://console.firebase.google.com');
    console.log('   2. Enable Authentication and Firestore');
    console.log('   3. Create a web app and copy config to apps/web/.env.local');
    console.log('   4. Create service accounts and add credentials to apps/backend/.env.local');
    console.log('   5. Enable Google OAuth in Firebase Authentication settings');

    if (!hasGCloudCLI || !hasFirebaseCLI) {
      console.log('\n' + colors.cyan + 'For automated setup, install:' + colors.reset);
      if (!hasGCloudCLI) {
        console.log('   - Google Cloud CLI: https://cloud.google.com/sdk/docs/install');
      }
      if (!hasFirebaseCLI) {
        console.log('   - Firebase CLI: npm install -g firebase-tools');
      }
      console.log('   Then run: node scripts/firebase-setup.js');
    }
  }
}

/**
 * Configure environment for Firebase-less mode
 */
function configureWithoutFirebase() {
  log.step('Configuring template without Firebase...');

  const envPaths = [
    {
      path: 'apps/web/.env.local',
      content: `# METU Template Configuration (No Firebase)
# App Configuration
NEXT_PUBLIC_APP_NAME="METU Template"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_ENV="development"
NEXT_PUBLIC_DEFAULT_LOCALE="en"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS="false"
NEXT_PUBLIC_ENABLE_PWA="true"
NEXT_PUBLIC_ENABLE_I18N="true"
NEXT_PUBLIC_DEBUG="false"

# Firebase Integration - DISABLED
NEXT_PUBLIC_FIREBASE_ENABLED="false"

# Stripe Configuration (Optional - for payment processing)
# Get your keys from https://dashboard.stripe.com/apikeys
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
# NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID="ca_your_stripe_connect_client_id"

# Analytics Configuration (Optional)
# NEXT_PUBLIC_ANALYTICS_ID=""

# Add your other environment variables here
`,
    },
    {
      path: 'apps/backend/.env.local',
      content: `# METU Template Backend Configuration (No Firebase)
NODE_ENV="development"
PORT="3001"
HOST="0.0.0.0"
LOG_LEVEL="info"

# Firebase Integration - DISABLED
FIREBASE_ENABLED="false"

# JWT Configuration (for custom auth if needed)
JWT_SECRET="metu-template-dev-secret-CHANGE-IN-PRODUCTION"
JWT_EXPIRES_IN="3600"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting Configuration
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW_MS="60000"

# Stripe Configuration (Optional - for payment processing)
# Get your keys from https://dashboard.stripe.com/apikeys  
# STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
# STRIPE_WEBHOOK_SECRET="whsec_your_webhook_endpoint_secret_here"
# STRIPE_CONNECT_CLIENT_SECRET="sk_test_your_stripe_connect_secret_here"

# Database Configuration (Optional - for non-Firebase databases)
# DATABASE_URL=""

# Add your other environment variables here
`,
    },
  ];

  envPaths.forEach(({ path, content }) => {
    if (!fs.existsSync(path)) {
      try {
        fs.writeFileSync(path, content);
        log.success(`Created ${path} (Firebase disabled)`);
      } catch (error) {
        log.warning(`Could not create ${path}: ${error.message}`);
      }
    } else {
      log.info(`${path} already exists`);
    }
  });

  log.success('Template configured without Firebase integration');
  console.log('\n' + colors.green + 'Benefits of Firebase-less mode:' + colors.reset);
  console.log('  ✓ Faster setup and build times');
  console.log('  ✓ No external dependencies');
  console.log('  ✓ Perfect for landing pages and static sites');
  console.log('  ✓ You can add Firebase later if needed');
}

/**
 * Setup Git hooks
 */
function setupGitHooks() {
  log.step('Setting up Git hooks...');

  if (!fs.existsSync('.git')) {
    log.warning('Not a Git repository - skipping Git hooks setup');
    return;
  }

  try {
    execSync('npx husky install', { stdio: 'ignore' });
    log.success('Git hooks configured with Husky');
  } catch (error) {
    log.warning('Could not setup Git hooks');
  }
}

/**
 * Install dependencies with the detected package manager
 */
function installDependencies(packageManager) {
  log.step('Installing dependencies...');

  const commands = {
    pnpm: 'pnpm install',
    npm: 'npm install',
    yarn: 'yarn install',
  };

  try {
    execSync(commands[packageManager], { stdio: 'inherit' });
    log.success('Dependencies installed successfully');
  } catch (error) {
    log.error('Failed to install dependencies');
    throw error;
  }
}

/**
 * Run development checks
 */
function runDevChecks(packageManager) {
  log.step('Running development checks...');

  const commands = {
    pnpm: 'pnpm run type-check',
    npm: 'npm run type-check',
    yarn: 'yarn type-check',
  };

  try {
    execSync(commands[packageManager], { stdio: 'ignore' });
    log.success('TypeScript compilation successful');
  } catch (error) {
    log.warning('TypeScript compilation had issues (this might be normal during initial setup)');
  }
}

/**
 * Display final instructions
 */
function displayFinalInstructions(packageManager) {
  const runCommands = {
    pnpm: 'pnpm run',
    npm: 'npm run',
    yarn: 'yarn',
  };

  const run = runCommands[packageManager];

  console.log('\n' + '='.repeat(60));
  log.header('Setup Complete! 🎉');

  console.log('Next steps:');

  // Check if Firebase is enabled
  const webEnvPath = 'apps/web/.env.local';
  const isFirebaseEnabled =
    fs.existsSync(webEnvPath) &&
    !fs.readFileSync(webEnvPath, 'utf8').includes('NEXT_PUBLIC_FIREBASE_ENABLED="false"');

  if (isFirebaseEnabled) {
    console.log(`${colors.yellow}1.${colors.reset} Complete Firebase setup (if not done already):`);
    console.log('   - Edit apps/web/.env.local with your Firebase credentials');
    console.log('   - Enable Authentication and Firestore in your Firebase project');
    console.log('');
  } else {
    console.log(`${colors.yellow}1.${colors.reset} Firebase is disabled - ready to use!`);
    console.log('   - You can enable Firebase later by running: node scripts/firebase-setup.js');
    console.log('');
  }

  console.log(`${colors.yellow}2.${colors.reset} Start the development server:`);
  console.log(`   ${colors.green}${run} dev${colors.reset}`);
  console.log('');

  console.log(`${colors.yellow}3.${colors.reset} Open your browser:`);
  console.log(`   ${colors.cyan}http://localhost:3000${colors.reset}`);
  console.log('');

  console.log(`${colors.yellow}4.${colors.reset} Additional commands:`);
  console.log(`   ${run} build          # Build for production`);
  console.log(`   ${run} test           # Run tests`);
  console.log(`   ${run} test:e2e       # Run E2E tests`);
  console.log(`   ${run} lint           # Run linter`);
  console.log(`   ${run} format         # Format code`);
  console.log(`   ${run} type-check     # Check TypeScript`);
  console.log(`   ${run} validate:all   # Run all validation`);
  console.log('');

  console.log(`${colors.yellow}5.${colors.reset} Documentation:`);
  console.log('   - README.md for full documentation');
  console.log('   - DEPLOYMENT.md for deployment guide');
  console.log('   - copilot-instructions.md for coding guidelines');
  console.log('');

  if (!isFirebaseEnabled) {
    console.log(`${colors.green}Template is configured for:${colors.reset}`);
    console.log('   ✓ Landing pages');
    console.log('   ✓ Static sites');
    console.log('   ✓ Apps with custom backends');
    console.log('   ✓ Quick prototyping');
    console.log('');
  }

  console.log(`${colors.bright}Happy coding! 🚀${colors.reset}`);
  console.log('='.repeat(60));
}

/**
 * Main setup function
 */
async function main() {
  try {
    log.header('METU Template Setup');

    // Pre-flight checks
    checkNodeVersion();

    const packageManager = detectPackageManager();
    if (!packageManager) {
      log.error('No package manager found. Please install pnpm, npm, or yarn.');
      process.exit(1);
    }

    log.success(`Using package manager: ${packageManager}`);

    // Setup steps
    await installDependencies(packageManager);

    // Ask about Firebase integration FIRST
    const useFirebase = await askFirebaseIntegration();

    if (useFirebase) {
      setupEnvironment(); // Copy .env.example files for Firebase mode
      await setupFirebaseIntegration();
    } else {
      configureWithoutFirebase(); // Create minimal config files for Firebase-less mode
    }

    setupGitHooks();
    runDevChecks(packageManager);

    // Final instructions
    displayFinalInstructions(packageManager);
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main();
}
