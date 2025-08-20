/**
 * 🧪 API Package Test Setup
 * Global test configuration and mocks for API package testing
 */

import { vi } from 'vitest';

// Mock console for testing output
vi.spyOn(console, 'log').mockImplementation(() => { });
vi.spyOn(console, 'error').mockImplementation(() => { });
vi.spyOn(console, 'warn').mockImplementation(() => { });
vi.spyOn(console, 'info').mockImplementation(() => { });

// Mock fetch for HTTP requests
global.fetch = vi.fn();

// Mock Request and Response for API testing
global.Request = vi.fn() as any;
global.Response = vi.fn(() => ({
    ok: true,
    status: 200,
    json: vi.fn(() => Promise.resolve({})),
    text: vi.fn(() => Promise.resolve('')),
})) as any;

// Mock Headers for API testing
global.Headers = vi.fn() as any;

// Set up global test utilities
global.beforeEach = () => {
    vi.clearAllMocks();
};

// Clean up after each test
global.afterEach = () => {
    vi.restoreAllMocks();
};
