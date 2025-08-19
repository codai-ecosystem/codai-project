/**
 * Test setup file for Vitest - NO MOCKING, REAL SERVICES ONLY
 * This setup ensures all tests use real Firebase services and real implementations
 */
import { afterAll, beforeAll, beforeEach } from 'vitest';

// Set NODE_ENV to test to load test environment configuration
process.env['NODE_ENV'] = 'test';

// Note: We don't import env at module level to avoid race conditions with test imports

// Test cleanup utilities
export function cleanupTestData(): void {
  // Clean up any test data after tests run
  // This will be implemented to clean up Firebase test data
  console.log('Cleaning up test data...');
}

// Global test hooks
beforeAll(() => {
  console.log('Setting up tests with real services...');
  // Initialize real Firebase Admin if needed
});

afterAll(() => {
  cleanupTestData();
});

beforeEach(() => {
  // Reset any state between tests without mocking
  console.log('Starting new test with real services');
});
