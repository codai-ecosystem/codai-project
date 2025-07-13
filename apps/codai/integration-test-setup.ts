import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Global test setup for integration tests
console.log('🧪 Setting up integration test environment...')

// Mock window APIs that might not be available in jsdom
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

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock performance API
Object.defineProperty(window, 'performance', {
    writable: true,
    value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByType: vi.fn(() => []),
        getEntriesByName: vi.fn(() => []),
    },
})

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
})

// Mock fetch globally (will be overridden in individual tests)
global.fetch = vi.fn()

// Mock console methods for cleaner test output
const originalConsole = { ...console }
beforeAll(() => {
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
})

afterAll(() => {
    Object.assign(console, originalConsole)
})

// Global setup and teardown
beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Reset localStorage
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => { })
    localStorageMock.removeItem.mockImplementation(() => { })
    localStorageMock.clear.mockImplementation(() => { })
})

afterEach(() => {
    // Clean up any side effects
    vi.restoreAllMocks()
})

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

console.log('✅ Integration test environment setup complete')

// Export test utilities for use in tests
export const integrationTestSetup = {
    mockLocalStorage: localStorageMock,
    setupMockFetch: (mockImplementation: any) => {
        global.fetch = vi.fn().mockImplementation(mockImplementation)
    },
    resetAllMocks: () => {
        vi.clearAllMocks()
    }
}
