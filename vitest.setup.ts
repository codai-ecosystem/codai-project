/**
 * Global Vitest Setup File
 * 
 * This file is used for setting up global test configurations
 * and mocks that apply to all test environments.
 */

import { beforeEach, beforeAll, afterAll, vi } from 'vitest';

// Global test setup
beforeEach(() => {
  // Reset any global state between tests
  if (typeof global !== 'undefined' && global.timeOffset !== undefined) {
    global.timeOffset = 0;
  }
});

// Mock console methods to reduce noise during tests
const originalConsole = { ...console };

beforeAll(() => {
  // Optionally suppress console output during tests
  if (process.env.NODE_ENV === 'test') {
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  }
});

afterAll(() => {
  // Restore console methods
  Object.assign(console, originalConsole);
});

// Global type declarations
declare global {
  var timeOffset: number | undefined;
}

export {};
