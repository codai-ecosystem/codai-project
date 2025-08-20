/**
 * 🧪 CLI Package Test Setup
 * Global test configuration and mocks for CLI testing
 */

import { vi } from 'vitest';

// Mock console for testing output
vi.spyOn(console, 'log').mockImplementation(() => { });
vi.spyOn(console, 'error').mockImplementation(() => { });
vi.spyOn(console, 'warn').mockImplementation(() => { });

// Mock process.exit to prevent test runner from exiting
vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit() was called');
});

// Set up global test utilities
global.beforeEach = () => {
    vi.clearAllMocks();
};

// Clean up after each test
global.afterEach = () => {
    vi.restoreAllMocks();
};
