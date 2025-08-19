#!/usr/bin/env node

/**
 * METU Template Verification Script
 * This script verifies that all backend API routes are functioning correctly,
 * and that the frontend is able to interact with them through our proxy.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const readline = require('readline');

// Root directory
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'apps', 'backend');
const WEB_DIR = path.join(ROOT_DIR, 'apps', 'web');

// Config
const FRONTEND_PORT = 3000;
const BACKEND_PORT = 3001;
const MAX_RETRY_COUNT = 30;
const RETRY_INTERVAL = 1000; // ms

// Test user
const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',
  displayName: 'Test User',
};

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
  bold: '\x1b[1m',
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
    case 'test':
      prefix = `${colors.blue}[TEST]${colors.reset}`;
      break;
    case 'step':
      prefix = `${colors.bold}${colors.blue}[STEP]${colors.reset}`;
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

    const httpModule = url.startsWith('https') ? https : http;

    httpModule
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
 * Make an HTTP request
 */
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const { method = 'GET', body = null, headers = {}, timeout = 10000 } = options;

    const httpModule = url.startsWith('https') ? https : http;

    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout,
    };

    const req = httpModule.request(url, requestOptions, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          let parsedData = data;

          // Try to parse as JSON if possible
          if (data && (res.headers['content-type'] || '').includes('application/json')) {
            parsedData = JSON.parse(data);
          }

          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData,
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Start the backend server for testing
 */
function startBackend() {
  log('Starting backend server...', 'step');

  return new Promise((resolve, reject) => {
    // Check for required environment variables
    const dotEnvPath = path.join(BACKEND_DIR, '.env.local');

    // If .env.local doesn't exist, create it
    if (!fs.existsSync(dotEnvPath)) {
      log('.env.local not found, creating from .env.example...', 'warning');
      const exampleEnvPath = path.join(BACKEND_DIR, '.env.example');

      if (!fs.existsSync(exampleEnvPath)) {
        reject(new Error('.env.example file not found for backend'));
        return;
      }

      fs.copyFileSync(exampleEnvPath, dotEnvPath);
    }

    // Start the backend server
    backendProcess = spawn('pnpm', ['run', 'dev'], {
      cwd: BACKEND_DIR,
      env: {
        ...process.env,
        PORT: BACKEND_PORT,
        NODE_ENV: 'development',
      },
      shell: true,
    });

    // Handle backend output
    backendProcess.stdout.on('data', data => {
      const output = data.toString().trim();
      if (output) {
        log(output, 'backend');
      }
    });

    backendProcess.stderr.on('data', data => {
      const output = data.toString().trim();
      if (output) {
        log(output, 'backend');
      }
    });

    backendProcess.on('error', error => {
      log(`Backend process error: ${error.message}`, 'error');
      reject(error);
    });

    backendProcess.on('exit', code => {
      if (code !== 0 && code !== null) {
        log(`Backend process exited with code ${code}`, 'error');
      }
    });

    // Wait for backend to be ready
    waitForService('backend', `http://localhost:${BACKEND_PORT}/api/health`)
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Start the frontend server for testing
 */
function startFrontend() {
  log('Starting frontend server...', 'step');

  return new Promise((resolve, reject) => {
    // Check for required environment variables
    const dotEnvPath = path.join(WEB_DIR, '.env.local');

    // If .env.local doesn't exist, create it
    if (!fs.existsSync(dotEnvPath)) {
      log('.env.local not found, creating from .env.example...', 'warning');
      const exampleEnvPath = path.join(WEB_DIR, '.env.example');

      if (!fs.existsSync(exampleEnvPath)) {
        reject(new Error('.env.example file not found for frontend'));
        return;
      }

      fs.copyFileSync(exampleEnvPath, dotEnvPath);

      // Add backend URL to the .env.local file
      fs.appendFileSync(
        dotEnvPath,
        `\n# Backend URL\nNEXT_PUBLIC_BACKEND_URL=http://localhost:${BACKEND_PORT}\nBACKEND_URL=http://localhost:${BACKEND_PORT}\n`
      );
    }

    // Start the frontend server
    frontendProcess = spawn('pnpm', ['run', 'dev'], {
      cwd: WEB_DIR,
      env: {
        ...process.env,
        PORT: FRONTEND_PORT,
        NODE_ENV: 'development',
      },
      shell: true,
    });

    // Handle frontend output
    frontendProcess.stdout.on('data', data => {
      const output = data.toString().trim();
      if (output) {
        log(output, 'frontend');
      }
    });

    frontendProcess.stderr.on('data', data => {
      const output = data.toString().trim();
      if (output) {
        log(output, 'frontend');
      }
    });

    frontendProcess.on('error', error => {
      log(`Frontend process error: ${error.message}`, 'error');
      reject(error);
    });

    frontendProcess.on('exit', code => {
      if (code !== 0 && code !== null) {
        log(`Frontend process exited with code ${code}`, 'error');
      }
    });

    // Wait for frontend to be ready
    waitForService('frontend', `http://localhost:${FRONTEND_PORT}`).then(resolve).catch(reject);
  });
}

/**
 * Test the backend health endpoint directly
 */
async function testBackendHealth() {
  log('Testing backend health endpoint...', 'test');

  try {
    const response = await makeRequest(`http://localhost:${BACKEND_PORT}/api/health`);

    if (response.status === 200) {
      log('Backend health check successful', 'success');
      return true;
    } else {
      log(`Backend health check failed with status ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    log(`Backend health check error: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Test the frontend health endpoint (proxied from backend)
 */
async function testFrontendProxyHealth() {
  log('Testing frontend proxy health endpoint...', 'test');

  try {
    const response = await makeRequest(`http://localhost:${FRONTEND_PORT}/api/backend/health`);

    if (response.status === 200) {
      log('Frontend proxy health check successful', 'success');
      return true;
    } else {
      log(`Frontend proxy health check failed with status ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    log(`Frontend proxy health check error: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Test backend user registration
 */
async function testUserRegistration() {
  log('Testing user registration...', 'test');

  try {
    // Generate a unique email to avoid conflicts
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const user = {
      ...TEST_USER,
      email: uniqueEmail,
    };

    const response = await makeRequest(
      `http://localhost:${FRONTEND_PORT}/api/backend/auth/register`,
      {
        method: 'POST',
        body: user,
      }
    );

    if (response.status === 201 || response.status === 200) {
      log('User registration successful', 'success');
      return {
        success: true,
        user,
        token: response.data?.token || null,
      };
    } else {
      log(`User registration failed with status ${response.status}`, 'error');
      log(`Response: ${JSON.stringify(response.data)}`, 'error');
      return { success: false };
    }
  } catch (error) {
    log(`User registration error: ${error.message}`, 'error');
    return { success: false };
  }
}

/**
 * Test user login
 */
async function testUserLogin(user) {
  log('Testing user login...', 'test');

  try {
    const response = await makeRequest(`http://localhost:${FRONTEND_PORT}/api/backend/auth/login`, {
      method: 'POST',
      body: {
        email: user.email,
        password: user.password,
      },
    });

    if (response.status === 200) {
      log('User login successful', 'success');
      return {
        success: true,
        token: response.data?.token || null,
        cookie: response.headers['set-cookie'] || null,
      };
    } else {
      log(`User login failed with status ${response.status}`, 'error');
      log(`Response: ${JSON.stringify(response.data)}`, 'error');
      return { success: false };
    }
  } catch (error) {
    log(`User login error: ${error.message}`, 'error');
    return { success: false };
  }
}

/**
 * Test getting user profile with authentication
 */
async function testGetUserProfile(authCookie) {
  log('Testing get user profile...', 'test');

  try {
    const response = await makeRequest(`http://localhost:${FRONTEND_PORT}/api/backend/users/me`, {
      headers: {
        Cookie: authCookie,
      },
    });

    if (response.status === 200) {
      log('Get user profile successful', 'success');
      return {
        success: true,
        user: response.data,
      };
    } else {
      log(`Get user profile failed with status ${response.status}`, 'error');
      log(`Response: ${JSON.stringify(response.data)}`, 'error');
      return { success: false };
    }
  } catch (error) {
    log(`Get user profile error: ${error.message}`, 'error');
    return { success: false };
  }
}

/**
 * Test user logout
 */
async function testUserLogout(authCookie) {
  log('Testing user logout...', 'test');

  try {
    const response = await makeRequest(
      `http://localhost:${FRONTEND_PORT}/api/backend/auth/logout`,
      {
        method: 'POST',
        headers: {
          Cookie: authCookie,
        },
      }
    );

    if (response.status === 200) {
      log('User logout successful', 'success');
      return { success: true };
    } else {
      log(`User logout failed with status ${response.status}`, 'error');
      log(`Response: ${JSON.stringify(response.data)}`, 'error');
      return { success: false };
    }
  } catch (error) {
    log(`User logout error: ${error.message}`, 'error');
    return { success: false };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  let testsPassed = 0;
  let testsFailed = 0;
  let authCookie = null;
  let user = null;

  log('Running verification tests...', 'step');

  // Test backend health
  if (await testBackendHealth()) {
    testsPassed++;
  } else {
    testsFailed++;
  }

  // Test frontend proxy health
  if (await testFrontendProxyHealth()) {
    testsPassed++;
  } else {
    testsFailed++;
  }

  // Test user registration
  const registrationResult = await testUserRegistration();
  if (registrationResult.success) {
    testsPassed++;
    user = registrationResult.user;
  } else {
    testsFailed++;
    // If registration fails, use the default test user for login test
    user = TEST_USER;
  }

  // Test user login
  const loginResult = await testUserLogin(user);
  if (loginResult.success) {
    testsPassed++;
    authCookie = loginResult.cookie;
  } else {
    testsFailed++;
  }

  // Test get user profile (only if login was successful)
  if (loginResult.success && authCookie) {
    const profileResult = await testGetUserProfile(authCookie);
    if (profileResult.success) {
      testsPassed++;
    } else {
      testsFailed++;
    }

    // Test user logout
    const logoutResult = await testUserLogout(authCookie);
    if (logoutResult.success) {
      testsPassed++;
    } else {
      testsFailed++;
    }
  } else {
    log('Skipping authenticated tests since login failed', 'warning');
  }

  // Display results
  log('', 'info');
  log('Test Results:', 'step');
  log(`Tests passed: ${testsPassed}`, 'success');
  log(`Tests failed: ${testsFailed}`, 'error');
  log('', 'info');

  if (testsFailed > 0) {
    log('Some tests failed. Check the logs for details.', 'error');
    process.exit(1);
  } else {
    log('All tests passed. The frontend-backend integration is working correctly!', 'success');
  }
}

/**
 * Clean up resources
 */
function cleanup() {
  log('Cleaning up resources...', 'step');

  if (frontendProcess) {
    frontendProcess.kill();
    log('Frontend process terminated', 'info');
  }

  if (backendProcess) {
    backendProcess.kill();
    log('Backend process terminated', 'info');
  }
}

/**
 * Main function
 */
async function main() {
  log('Starting METU Template verification...', 'step');

  try {
    // Set up clean exit
    process.on('SIGINT', () => {
      log('Received SIGINT, cleaning up...', 'warning');
      cleanup();
      process.exit(0);
    });

    // Start backend
    await startBackend();

    // Start frontend
    await startFrontend();

    // Run tests
    await runTests();

    // Clean up
    cleanup();
  } catch (error) {
    log(`Verification failed: ${error.message}`, 'error');
    cleanup();
    process.exit(1);
  }
}

// Run the main function
main();
