import { vi } from 'vitest'

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

// Mock session data
const mockSession = {
    user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
        roles: ['user'],
        permissions: []
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

// Export mock functions for use in tests
export { useSessionMock, signInMock, signOutMock, mockSession }
