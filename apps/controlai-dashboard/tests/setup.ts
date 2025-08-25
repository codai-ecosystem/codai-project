// Vitest setup for controlai-dashboard app
// Standalone setup without external dependencies

import { beforeAll, afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock window.matchMedia for component tests
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock EventSource for real-time features
global.EventSource = vi.fn().mockImplementation((url) => ({
    url,
    readyState: 0,
    onopen: null,
    onmessage: null,
    onerror: null,
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
}))

// Mock fetch for API calls
global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
})

// Mock Next.js router
vi.mock('next/router', () => ({
    useRouter: () => ({
        route: '/',
        pathname: '/',
        query: {},
        asPath: '/',
        push: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Global test setup
beforeAll(() => {
    // Setup any global state or configuration here
})

// Cleanup after each test
afterEach(() => {
    vi.clearAllMocks()
})

// Test timeout constant
export const TEST_TIMEOUT = 10000
