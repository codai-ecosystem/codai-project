/**
 * 🧪 Analytics Package Test Setup
 * Global test configuration and mocks for Analytics package testing
 */

import { vi } from 'vitest';

// Mock console for testing output
vi.spyOn(console, 'log').mockImplementation(() => { });
vi.spyOn(console, 'error').mockImplementation(() => { });
vi.spyOn(console, 'warn').mockImplementation(() => { });
vi.spyOn(console, 'info').mockImplementation(() => { });

// Mock fetch for HTTP requests
global.fetch = vi.fn();

// Mock analytics APIs
global.gtag = vi.fn();
global.dataLayer = [];

// Mock performance APIs
global.performance = {
    ...global.performance,
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    now: vi.fn(() => Date.now())
} as any;

// Set up global test utilities
global.beforeEach = () => {
    vi.clearAllMocks();
};

// Clean up after each test
global.afterEach = () => {
    vi.restoreAllMocks();
};
