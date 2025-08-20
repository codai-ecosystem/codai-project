/**
 * 🧪 Test Setup for @aide/optimization
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

// Mock fetch for API calls
global.fetch = vi.fn();
