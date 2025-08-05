/**
 * Test Application Helper
 * Provides utilities for testing the MemorAI application
 */

import { NextApiRequest, NextApiResponse } from 'next'

export interface TestRequest extends Partial<NextApiRequest> {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
}

export interface TestResponse {
    statusCode: number;
    headers: Record<string, string>;
    _status: number;
    _data: any;
    status: (code: number) => TestResponse;
    json: (data: any) => TestResponse;
    end: (data?: any) => TestResponse;
    setHeader: (name: string, value: string) => TestResponse;
}

/**
 * Create a mock test application for API testing
 */
export function createTestApp() {
    return {
        request: async (path: string, options: RequestInit = {}): Promise<Response> => {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4006'
            try {
                const response = await fetch(`${baseUrl}${path}`, {
                    ...options,
                    headers: {
                        'User-Agent': 'MemorAI-Test-Client/1.0',
                        ...options.headers
                    }
                })
                return response
            } catch (error) {
                // Return a mock response for testing purposes when server is not available
                return new Response(
                    JSON.stringify({ error: 'Server not available during testing' }),
                    {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'content-type': 'application/json' }
                    }
                )
            }
        }
    }
}

/**
 * Create mock request object for API handler testing
 */
export function createMockRequest(overrides: TestRequest = {}): NextApiRequest {
    return {
        method: 'GET',
        url: '/',
        headers: {},
        body: {},
        query: {},
        cookies: {},
        ...overrides
    } as NextApiRequest
}

/**
 * Create mock response object for API handler testing
 */
export function createMockResponse(): TestResponse {
    const response = {
        statusCode: 200,
        headers: {} as Record<string, string>,
        _status: 200,
        _data: null,

        status: function (code: number) {
            this._status = code
            this.statusCode = code
            return this
        },

        json: function (data: any) {
            this._data = data
            return this
        },

        end: function (data?: any) {
            if (data) this._data = data
            return this
        },

        setHeader: function (name: string, value: string) {
            this.headers[name] = value
            return this
        }
    }

    return response as TestResponse
}

/**
 * Test utilities for authentication
 */
export const testAuth = {
    /**
     * Create a mock authenticated session
     */
    createMockSession: (overrides = {}) => ({
        user: {
            id: 'test-user-123',
            name: 'Test User',
            email: 'test@memorai.ro',
            image: 'https://avatar.memorai.ro/test-user.jpg',
            role: 'user',
            permissions: ['read', 'write'],
            ...overrides
        },
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() // 24h from now
    }),

    /**
     * Create mock JWT token
     */
    createMockToken: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwibmFtZSI6IlRlc3QgVXNlciIsImVtYWlsIjoidGVzdEBtZW1vcmFpLnJvIiwiaWF0IjoxNzMzMjIxNzEyfQ.test-signature',

    /**
     * Create authorization headers
     */
    createAuthHeaders: (token?: string) => ({
        'Authorization': `Bearer ${token || testAuth.createMockToken()}`,
        'Content-Type': 'application/json'
    })
}

/**
 * Test data factories
 */
export const testData = {
    /**
     * Create test memory object
     */
    createMemory: (overrides = {}) => ({
        id: 'memory-test-123',
        title: 'Test Memory',
        content: 'This is a test memory for integration testing',
        userId: 'test-user-123',
        type: 'note',
        tags: ['test', 'integration'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides
    }),

    /**
     * Create test user object
     */
    createUser: (overrides = {}) => ({
        id: 'test-user-123',
        name: 'Test User',
        email: 'test@memorai.ro',
        image: 'https://avatar.memorai.ro/test-user.jpg',
        role: 'user',
        permissions: ['read', 'write'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides
    })
}

/**
 * Sleep utility for testing
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Wait for condition utility
 */
export const waitFor = async (
    condition: () => Promise<boolean> | boolean,
    timeout: number = 5000,
    interval: number = 100
) => {
    const start = Date.now()

    while (Date.now() - start < timeout) {
        if (await condition()) {
            return true
        }
        await sleep(interval)
    }

    throw new Error(`Condition not met within ${timeout}ms`)
}
