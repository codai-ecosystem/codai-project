/**
 * 🧪 Test Setup for @aide/enterprise
 * Global test configuration and mocks
 */

import { vi } from 'vitest';

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock fetch if needed
global.fetch = vi.fn();

// Package-specific mocks
if ('@aide/enterprise'.includes('analytics')) {
  // @ts-ignore
  global.gtag = vi.fn();
}

if ('@aide/enterprise'.includes('ai')) {
  // @ts-ignore
  global.navigator = { gpu: {} };
}
