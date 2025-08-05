import '@testing-library/jest-dom'
import { vi, afterEach, beforeAll } from 'vitest'
import React from 'react'

// Setup fetch for integration tests - Node.js 18+ has native fetch
beforeAll(async () => {
    // Ensure fetch is available globally for integration tests
    if (typeof globalThis.fetch === 'undefined') {
        // Dynamic import of fetch from undici (Node.js's built-in fetch implementation)
        const { fetch, Headers, Request, Response } = await import('undici')
        globalThis.fetch = fetch as any
        globalThis.Headers = Headers as any
        globalThis.Request = Request as any
        globalThis.Response = Response as any
    }
})

// Mock Next.js router
vi.mock('next/router', () => ({
    useRouter: () => ({
        push: vi.fn(),
        pathname: '/',
        query: {},
        asPath: '/'
    })
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn()
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams()
}))

// Mock Next.js Link - simple string return to avoid JSX issues
vi.mock('next/link', () => ({
    default: vi.fn(({ children }) => children)
}))

// Create mock functions for NextAuth
const useSessionMock = vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: vi.fn()
}))

const signInMock = vi.fn()
const signOutMock = vi.fn()

// Mock NextAuth with function references
vi.mock('next-auth/react', () => ({
    useSession: useSessionMock,
    signIn: signInMock,
    signOut: signOutMock,
    SessionProvider: vi.fn(({ children }) => children),
    getSession: vi.fn(() => Promise.resolve(null)),
    getCsrfToken: vi.fn(() => Promise.resolve('test-csrf-token')),
    getProviders: vi.fn(() => Promise.resolve({}))
}))

// Mock UI components with proper event handling
vi.mock('@/components/ui/badge', () => ({
    Badge: vi.fn(({ children }) => children)
}))

// Mock Lucide React icons - comprehensive set
vi.mock('lucide-react', () => ({
    User: vi.fn(() => React.createElement('svg', { 'data-testid': 'user-icon' })),
    LogOut: vi.fn(() => React.createElement('svg', { 'data-testid': 'logout-icon' })),
    Settings: vi.fn(() => React.createElement('svg', { 'data-testid': 'settings-icon' })),
    Shield: vi.fn(() => React.createElement('svg', { 'data-testid': 'shield-icon' })),
    Key: vi.fn(() => React.createElement('svg', { 'data-testid': 'key-icon' })),
    Loader2: vi.fn(() => React.createElement('svg', { 'data-testid': 'loader2-icon' })),
    ChevronDown: vi.fn(() => React.createElement('svg', { 'data-testid': 'chevron-down-icon' })),
    Plus: vi.fn(() => React.createElement('svg', { 'data-testid': 'plus-icon' })),
    CheckCircle: vi.fn(() => React.createElement('svg', { 'data-testid': 'check-circle-icon' })),
    Mail: vi.fn(() => React.createElement('svg', { 'data-testid': 'mail-icon' })),
    Eye: vi.fn(() => React.createElement('svg', { 'data-testid': 'eye-icon' })),
    EyeOff: vi.fn(() => React.createElement('svg', { 'data-testid': 'eye-off-icon' })),
    Info: vi.fn(() => React.createElement('svg', { 'data-testid': 'info-icon' })),
    XCircle: vi.fn(() => React.createElement('svg', { 'data-testid': 'x-circle-icon' })),
    AlertCircle: vi.fn(() => React.createElement('svg', { 'data-testid': 'alert-circle-icon' })),
    AlertTriangle: vi.fn(() => React.createElement('svg', { 'data-testid': 'alert-triangle-icon' })),
    X: vi.fn(() => React.createElement('svg', { 'data-testid': 'x-icon' })),
    Check: vi.fn(() => React.createElement('svg', { 'data-testid': 'check-icon' }))
}))

// Mock environment variables
process.env.NEXTAUTH_URL = 'http://localhost:4006'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.CODAI_CLIENT_ID = 'test-client-id'
process.env.CODAI_CLIENT_SECRET = 'test-client-secret'
process.env.CODAI_AUTH_URL = 'https://auth.codai.ro'
process.env.CODAI_ID_URL = 'https://id.codai.ro'

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Clean up after each test
afterEach(() => {
    vi.clearAllMocks()
    // Reset session mock to default state
    useSessionMock.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn()
    })
})

// Mock session data
const mockSession = {
    user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
        roles: ['user'],
        permissions: ['memorai:read']
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

// Export mock functions for use in tests
export { useSessionMock, signInMock, signOutMock, mockSession }
