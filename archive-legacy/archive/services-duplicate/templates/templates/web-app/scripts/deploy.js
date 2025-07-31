#!/usr/bin/env node

/**
 * METU Template Production Deployment Script
 *
 * This script automates the deployment process for the METU Template project.
 * It performs pre-deployment checks, builds the project, and deploys to various platforms.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'apps', 'backend');
const WEB_DIR = path.join(ROOT_DIR, 'apps', 'web');

// Environment paths
const BACKEND_ENV_PROD = path.join(BACKEND_DIR, '.env.production');
const FRONTEND_ENV_PROD = path.join(WEB_DIR, '.env.production');
const BACKEND_ENV_PATH = path.join(BACKEND_DIR, '.env.local');
const FRONTEND_ENV_PATH = path.join(WEB_DIR, '.env.local');

// Required environment variables
const REQUIRED_ENV_VARS = {
  backend: [
    'NODE_ENV',
    'PORT',
    'HOST',
    'JWT_SECRET',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'CORS_ORIGIN',
  ],
  frontend: [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_BACKEND_URL',
    'BACKEND_URL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ],
};

/**
 * Create a readline interface for user input
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Ask a question and get user input
 */
async function askQuestion(question) {
  const rl = createInterface();

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Execute a command in a specific directory
 */
function executeCommand(command, options = {}) {
  const { cwd = ROOT_DIR, silent = false } = options;

  if (!silent) {
    console.log(chalk.blue(`> ${command}`));
  }

  try {
    return execSync(command, {
      cwd,
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
    });
  } catch (error) {
    if (!silent) {
      console.error(chalk.red(`Command execution failed: ${error.message}`));
      if (error.stdout) console.error(chalk.red(`Output: ${error.stdout}`));
      if (error.stderr) console.error(chalk.red(`Error: ${error.stderr}`));
    }
    return null;
  }
}

/**
 * Check if an environment file exists and contains required variables
 */
function checkEnvFile(filePath, requiredVars, isProduction = false) {
  // For production, we also check if the production env file exists
  if (isProduction && !fs.existsSync(filePath)) {
    console.error(chalk.red(`❌ Production environment file not found: ${filePath}`));
    console.log(chalk.yellow(`ℹ️  Create a production environment file based on .env.example`));
    return false;
  }

  if (!fs.existsSync(filePath)) {
    console.error(chalk.red(`❌ Environment file not found: ${filePath}`));
    return false;
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  let isValid = true;
  let missingVars = [];

  requiredVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`)) {
      missingVars.push(varName);
      isValid = false;
    }
  });

  if (missingVars.length > 0) {
    console.error(chalk.red(`❌ Missing required environment variables:`));
    missingVars.forEach(varName => {
      console.error(chalk.red(`   - ${varName}`));
    });
  }

  return isValid;
}

/**
 * Run pre-deployment checks
 */
async function runChecks() {
  console.log(chalk.yellow('📋 Running pre-deployment checks...'));

  // Check production environment files
  const backendEnvProdValid = checkEnvFile(BACKEND_ENV_PROD, REQUIRED_ENV_VARS.backend, true);
  const frontendEnvProdValid = checkEnvFile(FRONTEND_ENV_PROD, REQUIRED_ENV_VARS.frontend, true);

  if (!backendEnvProdValid || !frontendEnvProdValid) {
    console.error(chalk.red('❌ Production environment validation failed'));
    const answer = await askQuestion(chalk.yellow('Do you want to continue anyway? (y/n): '));
    if (answer.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }

  // Run security audit
  console.log(chalk.blue('🔒 Running security checks...'));
  try {
    executeCommand('pnpm check:secrets');
    executeCommand('pnpm security:check');
  } catch (error) {
    console.error(chalk.red('❌ Security checks failed'));
    const answer = await askQuestion(chalk.yellow('Do you want to continue anyway? (y/n): '));
    if (answer.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }

  // Validate code quality
  console.log(chalk.blue('🧪 Validating code quality...'));
  try {
    executeCommand('pnpm type-check');
    executeCommand('pnpm lint');
    executeCommand('pnpm format:check');
  } catch (error) {
    console.error(chalk.red('❌ Code quality validation failed'));
    const answer = await askQuestion(chalk.yellow('Do you want to continue anyway? (y/n): '));
    if (answer.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }

  // Run tests
  console.log(chalk.blue('✅ Running tests...'));
  try {
    executeCommand('pnpm test:unit');
  } catch (error) {
    console.error(chalk.red('❌ Unit tests failed'));
    const answer = await askQuestion(chalk.yellow('Do you want to continue anyway? (y/n): '));
    if (answer.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }

  // Verify frontend-backend integration
  console.log(chalk.blue('🔄 Verifying frontend-backend integration...'));
  try {
    // This integration test is comprehensive and may take time
    const skipIntegration = await askQuestion(
      chalk.yellow('Do you want to skip integration tests? (y/n): ')
    );
    if (skipIntegration.toLowerCase() !== 'y') {
      executeCommand('pnpm test:integration');
    }
  } catch (error) {
    console.error(chalk.red('❌ Integration tests failed'));
    const answer = await askQuestion(chalk.yellow('Do you want to continue anyway? (y/n): '));
    if (answer.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }

  console.log(chalk.green('✅ All pre-deployment checks passed'));
  return true;
}

/**
 * Build the backend
 */
async function buildBackend() {
  console.log(chalk.yellow('🔨 Building backend...'));

  try {
    // Clean previous backend build
    executeCommand('pnpm clean', { cwd: BACKEND_DIR });

    // Copy production env for build if it exists
    if (fs.existsSync(BACKEND_ENV_PROD)) {
      fs.copyFileSync(BACKEND_ENV_PROD, path.join(BACKEND_DIR, '.env'));
    }

    // Run backend build
    executeCommand('pnpm build', { cwd: BACKEND_DIR });

    console.log(chalk.green('✅ Backend build completed successfully'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Backend build failed'));
    return false;
  }
}

/**
 * Build the frontend
 */
async function buildFrontend() {
  console.log(chalk.yellow('🔨 Building frontend...'));

  try {
    // Clean previous frontend build
    executeCommand('pnpm clean', { cwd: WEB_DIR });

    // Copy production env for build if it exists
    if (fs.existsSync(FRONTEND_ENV_PROD)) {
      fs.copyFileSync(FRONTEND_ENV_PROD, path.join(WEB_DIR, '.env'));
    }

    // Run frontend build
    executeCommand('pnpm build', { cwd: WEB_DIR });

    console.log(chalk.green('✅ Frontend build completed successfully'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Frontend build failed'));
    return false;
  }
}

/**
 * Deploy the backend
 */
async function deployBackend(platform) {
  console.log(chalk.yellow('🚀 Deploying backend...'));

  switch (platform) {
    case 'vercel':
      // Deploy to Vercel
      console.log(chalk.blue('📦 Deploying backend to Vercel...'));
      executeCommand('vercel --prod', { cwd: BACKEND_DIR });
      break;
    case 'aws':
      // Deploy to AWS Lambda
      console.log(chalk.blue('📦 Deploying backend to AWS Lambda...'));
      executeCommand('serverless deploy --stage prod', { cwd: BACKEND_DIR });
      break;
    case 'gcp':
      // Deploy to Google Cloud Run
      console.log(chalk.blue('📦 Deploying backend to Google Cloud Run...'));
      executeCommand(
        'gcloud run deploy metu-backend --source . --platform managed --region us-central1 --allow-unauthenticated',
        { cwd: BACKEND_DIR }
      );
      break;
    case 'docker':
      // Build and push Docker image
      console.log(chalk.blue('� Building Docker image for backend...'));
      executeCommand('docker build -t metu-backend:latest .', { cwd: BACKEND_DIR });
      console.log(chalk.green('✅ Docker image built successfully.'));

      const registry = await askQuestion(
        chalk.yellow('Enter Docker registry URL (leave empty to skip pushing): ')
      );
      if (registry) {
        const taggedImage = `${registry}/metu-backend:latest`;
        executeCommand(`docker tag metu-backend:latest ${taggedImage}`, { cwd: BACKEND_DIR });
        executeCommand(`docker push ${taggedImage}`, { cwd: BACKEND_DIR });
      }
      break;
    default:
      console.log(chalk.yellow('⚠️ No backend deployment platform selected.'));
      return false;
  }

  console.log(chalk.green('✅ Backend deployment completed'));
  return true;
}

/**
 * Deploy the frontend
 */
async function deployFrontend(platform) {
  console.log(chalk.yellow('🚀 Deploying frontend...'));

  switch (platform) {
    case 'vercel':
      // Deploy to Vercel
      console.log(chalk.blue('📦 Deploying frontend to Vercel...'));
      executeCommand('vercel --prod', { cwd: WEB_DIR });
      break;
    case 'netlify':
      // Deploy to Netlify
      console.log(chalk.blue('📦 Deploying frontend to Netlify...'));
      executeCommand('netlify deploy --prod', { cwd: WEB_DIR });
      break;
    case 'firebase':
      // Deploy to Firebase Hosting
      console.log(chalk.blue('📦 Deploying frontend to Firebase Hosting...'));
      executeCommand('firebase deploy --only hosting', { cwd: WEB_DIR });
      break;
    default:
      console.log(chalk.yellow('⚠️ No frontend deployment platform selected.'));
      return false;
  }

  console.log(chalk.green('✅ Frontend deployment completed'));
  return true;
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.cyan('🚀 Starting METU Template Deployment Process'));

  // Run pre-deployment checks
  await runChecks();

  // Build backend and frontend
  const backendBuilt = await buildBackend();
  const frontendBuilt = await buildFrontend();

  if (!backendBuilt || !frontendBuilt) {
    console.error(chalk.red('❌ Build process failed'));
    process.exit(1);
  }

  // Ask for deployment platform
  const backendPlatform = await askQuestion(`
Choose backend deployment platform:
1. Vercel
2. AWS Lambda
3. Google Cloud Run
4. Docker build only
5. Skip backend deployment
Enter your choice (1-5): `);

  const frontendPlatform = await askQuestion(`
Choose frontend deployment platform:
1. Vercel
2. Netlify
3. Firebase Hosting
4. Skip frontend deployment
Enter your choice (1-4): `);

  // Convert choices to platform names
  const backendPlatformName =
    {
      1: 'vercel',
      2: 'aws',
      3: 'gcp',
      4: 'docker',
      5: 'skip',
    }[backendPlatform] || 'skip';

  const frontendPlatformName =
    {
      1: 'vercel',
      2: 'netlify',
      3: 'firebase',
      4: 'skip',
    }[frontendPlatform] || 'skip';

  // Deploy backend if not skipped
  if (backendPlatformName !== 'skip') {
    await deployBackend(backendPlatformName);
  }

  // Deploy frontend if not skipped
  if (frontendPlatformName !== 'skip') {
    await deployFrontend(frontendPlatformName);
  }

  console.log(chalk.green('🎉 Deployment process completed successfully!'));
}

// Run the main function
main().catch(error => {
  console.error(chalk.red(`❌ Deployment failed: ${error.message}`));
  process.exit(1);
});
