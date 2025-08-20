/**
 * 🧪 AI Package Test Setup
 * Global test configuration and mocks for AI package testing
 */

import { vi } from 'vitest';

// Mock console for testing output
vi.spyOn(console, 'log').mockImplementation(() => { });
vi.spyOn(console, 'error').mockImplementation(() => { });
vi.spyOn(console, 'warn').mockImplementation(() => { });
vi.spyOn(console, 'info').mockImplementation(() => { });

// Mock fetch for HTTP requests
global.fetch = vi.fn();

// Mock AI/ML related APIs
global.navigator = {
    ...global.navigator,
    gpu: vi.fn(),
    ml: vi.fn()
} as any;

// Set up global test utilities
global.beforeEach = () => {
    vi.clearAllMocks();
};

// Clean up after each test
global.afterEach = () => {
    vi.restoreAllMocks();
};
