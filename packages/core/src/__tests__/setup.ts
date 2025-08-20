/**
 * Vitest Test Setup for CODAI Core
 * Global test configuration and mocks
 */

import { vi } from 'vitest';

// Global test configuration
global.process.env.NODE_ENV = 'test';

// Mock API endpoints
const mockApiResponses = {
    '/api/health': { status: 'healthy', timestamp: Date.now() },
    '/api/services': [
        { name: 'test-service', version: '1.0.0', status: 'running' }
    ],
    '/api/auth': {
        token: 'mock-jwt-token',
        user: {
            id: 'test-user-id',
            email: 'test@example.com',
            permissions: ['read', 'write']
        }
    },
    '/api/user': {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        permissions: ['read', 'write']
    }
};

// Mock HTTP client
vi.stubGlobal('fetch', vi.fn((url: string, options?: any) => {
    const pathname = new URL(url, 'http://localhost').pathname;

    if (mockApiResponses[pathname as keyof typeof mockApiResponses]) {
        return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockApiResponses[pathname as keyof typeof mockApiResponses])
        });
    }

    // Handle dynamic routes
    if (pathname.startsWith('/api/services/') && pathname.endsWith('/health')) {
        return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ status: 'healthy', timestamp: Date.now() })
        });
    }

    if (pathname.startsWith('/api/concurrent/') || pathname.startsWith('/api/memory-test/')) {
        return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true, data: `Mock response for ${pathname}` })
        });
    }

    // Default mock response
    return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: 'mock-data' })
    });
}));

// Mock console methods to avoid test output pollution
global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
};

// Mock timers for consistent testing
// Note: Using real timers for network-related tests to avoid hangs
// vi.useFakeTimers();

// Mock process.env
process.env.CODAI_API_KEY = 'test-api-key';
process.env.CODAI_ENVIRONMENT = 'test';
process.env.CODAI_BASE_URL = 'http://localhost:3000';

// Global test utilities
global.testUtils = {
    createMockUser: () => ({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        permissions: ['read', 'write'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }),

    createMockServiceConfig: () => ({
        name: 'test-service',
        version: '1.0.0',
        endpoint: '/api/test',
        healthCheck: '/health',
        timeout: 5000,
        retryAttempts: 3
    }),

    createMockApiResponse: (data: any = {}, success: boolean = true) => ({
        success,
        data,
        timestamp: Date.now(),
        requestId: 'mock-request-id'
    }),

    waitForAsync: () => new Promise(resolve => setTimeout(resolve, 0))
};

// Global type declarations for test utilities
declare global {
    var testUtils: {
        createMockUser: () => any;
        createMockServiceConfig: () => any;
        createMockApiResponse: (data?: any, success?: boolean) => any;
        waitForAsync: () => Promise<void>;
    };
}
