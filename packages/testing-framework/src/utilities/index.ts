/**
 * 🧪 Testing Utilities
 * Common utilities for all test types across the CODAI ecosystem
 */

import { vi } from 'vitest';
import type { MockedFunction } from 'vitest';

export interface TestUtilities {
    createMockConsole(): MockedConsole;
    createMockFetch(): MockedFunction<typeof fetch>;
    createMockLocalStorage(): Storage;
    createMockSessionStorage(): Storage;
    createMockEnvironment(env: Record<string, string>): void;
    resetAllMocks(): void;
}

export interface MockedConsole {
    log: MockedFunction<typeof console.log>;
    error: MockedFunction<typeof console.error>;
    warn: MockedFunction<typeof console.warn>;
    info: MockedFunction<typeof console.info>;
    debug: MockedFunction<typeof console.debug>;
}

export class TestUtilities implements TestUtilities {
    private static mocks: Set<MockedFunction<any>> = new Set();

    static createMockConsole(): MockedConsole {
        const mockConsole = {
            log: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            info: vi.fn(),
            debug: vi.fn(),
        };

        // Track mocks for cleanup
        Object.values(mockConsole).forEach(mock => this.mocks.add(mock));

        return mockConsole;
    }

    static createMockFetch(): MockedFunction<typeof fetch> {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({}),
            text: vi.fn().mockResolvedValue(''),
            blob: vi.fn().mockResolvedValue(new Blob()),
            arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
            headers: new Headers(),
            redirected: false,
            statusText: 'OK',
            type: 'basic' as ResponseType,
            url: '',
            clone: vi.fn(),
            body: null,
            bodyUsed: false,
            formData: vi.fn().mockResolvedValue(new FormData()),
            bytes: vi.fn().mockResolvedValue(new Uint8Array()),
        } as unknown as Response);

        this.mocks.add(mockFetch);
        return mockFetch;
    }

    static createMockLocalStorage(): Storage {
        const storage = new Map<string, string>();

        const mockStorage = {
            getItem: vi.fn((key: string) => storage.get(key) || null),
            setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
            removeItem: vi.fn((key: string) => storage.delete(key)),
            clear: vi.fn(() => storage.clear()),
            key: vi.fn((index: number) => Array.from(storage.keys())[index] || null),
            get length() { return storage.size; },
        };

        Object.values(mockStorage).forEach(mock => {
            if (vi.isMockFunction(mock)) {
                this.mocks.add(mock);
            }
        });

        return mockStorage as Storage;
    }

    static createMockSessionStorage(): Storage {
        return this.createMockLocalStorage(); // Same implementation
    }

    static createMockEnvironment(env: Record<string, string>): () => void {
        const originalEnv = { ...process.env };

        // Set new environment variables
        Object.assign(process.env, env);

        // Return cleanup function
        return () => {
            process.env = originalEnv;
        };
    }

    static resetAllMocks(): void {
        this.mocks.forEach(mock => mock.mockReset());
        this.mocks.clear();
    }

    // Component-specific utilities
    static async waitForAsync(fn: () => Promise<any>, timeout = 5000): Promise<any> {
        const start = Date.now();

        while (Date.now() - start < timeout) {
            try {
                return await fn();
            } catch (error) {
                if (Date.now() - start >= timeout) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        throw new Error(`Timeout waiting for async operation after ${timeout}ms`);
    }

    static createTestTimeout(category: 'unit' | 'integration' | 'e2e' = 'unit'): number {
        const timeouts = {
            unit: 5000,
            integration: 15000,
            e2e: 30000,
        };

        return timeouts[category];
    }

    // Performance testing utilities
    static measurePerformance<T>(fn: () => T): { result: T; duration: number } {
        const start = performance.now();
        const result = fn();
        const end = performance.now();

        return {
            result,
            duration: end - start,
        };
    }

    static async measureAsyncPerformance<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();

        return {
            result,
            duration: end - start,
        };
    }
}

// Export commonly used utilities
export const {
    createMockConsole,
    createMockFetch,
    createMockLocalStorage,
    createMockSessionStorage,
    createMockEnvironment,
    resetAllMocks,
    waitForAsync,
    createTestTimeout,
    measurePerformance,
    measureAsyncPerformance,
} = TestUtilities;
