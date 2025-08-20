/**
 * Global Test Teardown
 * Cleanup test environment and resources
 */

import { promises as fs } from 'fs';
import { ChildProcess } from 'child_process';

export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting global test teardown...');

  try {
    // Stop test database service
    await stopTestDatabaseService();

    // Cleanup test files
    await cleanupTestFiles();

    console.log('✅ Global test teardown completed');
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't throw to avoid masking test failures
  }
}

async function stopTestDatabaseService(): Promise<void> {
  const testProcess = (global as any).__TEST_DATABASE_PROCESS__ as ChildProcess;
  
  if (testProcess && !testProcess.killed) {
    console.log('🛑 Stopping test database service...');
    
    testProcess.kill('SIGTERM');
    
    // Wait for graceful shutdown
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (!testProcess.killed) {
          testProcess.kill('SIGKILL');
        }
        resolve(undefined);
      }, 5000);

      testProcess.on('exit', () => {
        clearTimeout(timeout);
        resolve(undefined);
      });
    });

    console.log('✅ Test database service stopped');
  }
}

async function cleanupTestFiles(): Promise<void> {
  console.log('🗑️ Cleaning up test files...');

  try {
    // Remove temporary test files
    await fs.unlink('test-service.js').catch(() => {});
    
    // Additional cleanup can be added here
    console.log('✅ Test files cleaned up');
  } catch (error) {
    console.warn('⚠️ Some test files could not be cleaned up:', error);
  }
}
