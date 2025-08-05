import { vi } from 'vitest'

// Manual mock for next-auth/react due to v5 beta module resolution issues
export const useSession = vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: vi.fn()
}))

export const signIn = vi.fn()
export const signOut = vi.fn()

export const SessionProvider = vi.fn(({ children }: { children: React.ReactNode }) => children)

export const getSession = vi.fn(() => Promise.resolve(null))
export const getCsrfToken = vi.fn(() => Promise.resolve('test-csrf-token'))
export const getProviders = vi.fn(() => Promise.resolve({}))

// Export default for default imports
export default {
    useSession,
    signIn,
    signOut,
    SessionProvider,
    getSession,
    getCsrfToken,
    getProviders
}
