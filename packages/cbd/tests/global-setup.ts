/**
 * Global Test Setup
 * Initialize test environment and shared resources
 */

import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

let testDatabaseProcess: ChildProcess | null = null;

export default async function globalSetup(): Promise<void> {
  console.log('🚀 Starting global test setup...');

  try {
    // Ensure test directories exist
    await ensureTestDirectories();

    // Start test database service
    await startTestDatabaseService();

    // Wait for services to be ready
    await waitForServicesReady();

    console.log('✅ Global test setup completed');
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  }
}

async function ensureTestDirectories(): Promise<void> {
  const directories = [
    'test-data',
    'test-results',
    'coverage'
  ];

  for (const dir of directories) {
    try {
      await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }
}

async function startTestDatabaseService(): Promise<void> {
  console.log('🗄️ Starting test database service...');

  // Create test service configuration
  const testServiceScript = `
    const { CBDEngineService } = require('./dist/src/service');
    
    const service = new CBDEngineService({
      port: 4181,
      host: 'localhost'
    });
    
    service.start().then(() => {
      console.log('Test service started on port 4181');
    }).catch(console.error);
  `;

  await fs.writeFile('test-service.js', testServiceScript);

  // Start the test service
  testDatabaseProcess = spawn('node', ['test-service.js'], {
    stdio: 'pipe'
  });

  if (testDatabaseProcess.stdout) {
    testDatabaseProcess.stdout.on('data', (data) => {
      console.log(`Test Service: ${data}`);
    });
  }

  if (testDatabaseProcess.stderr) {
    testDatabaseProcess.stderr.on('data', (data) => {
      console.error(`Test Service Error: ${data}`);
    });
  }
}

async function waitForServicesReady(): Promise<void> {
  console.log('⏳ Waiting for services to be ready...');

  const maxAttempts = 30;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('http://localhost:4181/health');
      
      if (response.ok) {
        console.log('✅ Test services are ready');
        return;
      }
    } catch (error) {
      // Service not ready yet
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Test services failed to start within timeout');
}

// Store process reference for cleanup
(global as any).__TEST_DATABASE_PROCESS__ = testDatabaseProcess;
