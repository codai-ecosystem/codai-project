#!/usr/bin/env node

/**
 * End-to-end integration test script for METU Template
 * Tests the communication between frontend and backend
 */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Root directory
const ROOT_DIR = path.resolve(__dirname, '..');

// Config
const FRONTEND_PORT = 3000;
const BACKEND_PORT = 8000;
const MAX_RETRY_COUNT = 30;
const RETRY_INTERVAL = 1000; // ms

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Processes
let frontendProcess = null;
let backendProcess = null;

/**
 * Print a formatted message to the console
 */
function log(message, type = 'info') {
  const date = new Date().toISOString().split('T')[1].split('.')[0];
  let prefix = '';

  switch (type) {
    case 'error':
      prefix = `${colors.red}[ERROR]${colors.reset}`;
      break;
    case 'success':
      prefix = `${colors.green}[SUCCESS]${colors.reset}`;
      break;
    case 'warning':
      prefix = `${colors.yellow}[WARNING]${colors.reset}`;
      break;
    case 'frontend':
      prefix = `${colors.cyan}[FRONTEND]${colors.reset}`;
      break;
    case 'backend':
      prefix = `${colors.magenta}[BACKEND]${colors.reset}`;
      break;
    default:
      prefix = `${colors.blue}[INFO]${colors.reset}`;
  }

  console.log(`${colors.gray}[${date}]${colors.reset} ${prefix} ${message}`);
}

/**
 * Wait for a service to be ready
 */
async function waitForService(name, url, retryCount = 0) {
  return new Promise((resolve, reject) => {
    if (retryCount >= MAX_RETRY_COUNT) {
      reject(new Error(`${name} service did not start within the expected time`));
      return;
    }

    log(`Checking if ${name} is ready (attempt ${retryCount + 1}/${MAX_RETRY_COUNT})...`, 'info');

    http
      .get(url, res => {
        if (res.statusCode === 200) {
          log(`${name} service is ready!`, 'success');
          resolve();
        } else {
          setTimeout(() => {
            waitForService(name, url, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, RETRY_INTERVAL);
        }
      })
      .on('error', () => {
        setTimeout(() => {
          waitForService(name, url, retryCount + 1)
            .then(resolve)
            .catch(reject);
        }, RETRY_INTERVAL);
      });
  });
}

/**
 * Start backend server
 */
function startBackend() {
  return new Promise((resolve, reject) => {
    log('Starting backend server...', 'info');

    backendProcess = spawn('pnpm', ['start'], {
      cwd: path.join(ROOT_DIR, 'apps/backend'),
      shell: true,
    });

    backendProcess.stdout.on('data', data => {
      const output = data.toString().trim();
      log(output, 'backend');

      // Check for successful startup message
      if (output.includes('Server listening at') || output.includes('Server running at')) {
        resolve();
      }
    });

    backendProcess.stderr.on('data', data => {
      log(data.toString().trim(), 'backend');
    });

    backendProcess.on('error', error => {
      log(`Failed to start backend: ${error.message}`, 'error');
      reject(error);
    });

    backendProcess.on('close', code => {
      if (code !== 0 && code !== null) {
        log(`Backend process exited with code ${code}`, 'error');
        reject(new Error(`Backend exited with code ${code}`));
      }
    });

    // Resolve after a timeout if not resolved by startup message
    setTimeout(() => {
      resolve();
    }, 5000);
  });
}

/**
 * Start frontend server
 */
function startFrontend() {
  return new Promise((resolve, reject) => {
    log('Starting frontend server...', 'info');

    frontendProcess = spawn('pnpm', ['dev'], {
      cwd: path.join(ROOT_DIR, 'apps/web'),
      shell: true,
    });

    frontendProcess.stdout.on('data', data => {
      const output = data.toString().trim();
      log(output, 'frontend');

      // Check for successful startup message
      if (output.includes('ready') && output.includes('started server')) {
        resolve();
      }
    });

    frontendProcess.stderr.on('data', data => {
      log(data.toString().trim(), 'frontend');
    });

    frontendProcess.on('error', error => {
      log(`Failed to start frontend: ${error.message}`, 'error');
      reject(error);
    });

    frontendProcess.on('close', code => {
      if (code !== 0 && code !== null) {
        log(`Frontend process exited with code ${code}`, 'error');
        reject(new Error(`Frontend exited with code ${code}`));
      }
    });

    // Resolve after a timeout if not resolved by startup message
    setTimeout(() => {
      resolve();
    }, 15000); // Next.js can take longer to start
  });
}

/**
 * Clean up processes
 */
function cleanup() {
  if (frontendProcess) {
    log('Stopping frontend server...', 'info');
    frontendProcess.kill('SIGINT');
  }

  if (backendProcess) {
    log('Stopping backend server...', 'info');
    backendProcess.kill('SIGINT');
  }
}

/**
 * Run basic tests
 */
async function runTests() {
  log('Starting integration tests...', 'info');

  try {
    // Test 1: Backend health check
    log('Test 1: Backend health check', 'info');
    const backendResponse = await fetch(`http://localhost:${BACKEND_PORT}/health`);
    const backendData = await backendResponse.json();

    if (backendResponse.status === 200 && backendData.status) {
      log('Backend health check successful', 'success');
    } else {
      throw new Error(`Backend health check failed: ${JSON.stringify(backendData)}`);
    }

    // Test 2: Frontend health check (API route)
    log('Test 2: Frontend API route health check', 'info');
    const frontendResponse = await fetch(`http://localhost:${FRONTEND_PORT}/api/health`);
    const frontendData = await frontendResponse.json();

    if (frontendResponse.status === 200 && frontendData.status) {
      log('Frontend API route health check successful', 'success');
    } else {
      throw new Error(`Frontend API route health check failed: ${JSON.stringify(frontendData)}`);
    }

    // Test 3: Backend-proxied API route
    log('Test 3: Backend proxy API route check', 'info');
    const proxyResponse = await fetch(`http://localhost:${FRONTEND_PORT}/api/backend/health`);
    const proxyData = await proxyResponse.json();

    if (proxyResponse.status === 200 && proxyData.status) {
      log('Backend proxy API route check successful', 'success');
    } else {
      throw new Error(`Backend proxy API route check failed: ${JSON.stringify(proxyData)}`);
    }

    log('All tests passed!', 'success');
    return true;
  } catch (error) {
    log(`Tests failed: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  let success = false;

  try {
    // Start services
    await startBackend();

    // Wait for backend to be ready
    await waitForService('Backend', `http://localhost:${BACKEND_PORT}/health`);

    await startFrontend();

    // Wait for frontend to be ready
    await waitForService('Frontend', `http://localhost:${FRONTEND_PORT}/api/health`);

    // Run tests
    success = await runTests();
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
  } finally {
    cleanup();

    if (success) {
      log('Integration tests completed successfully', 'success');
      process.exit(0);
    } else {
      log('Integration tests failed', 'error');
      process.exit(1);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Received SIGINT. Shutting down...', 'warning');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM. Shutting down...', 'warning');
  cleanup();
  process.exit(0);
});

// Start the script
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  cleanup();
  process.exit(1);
});
