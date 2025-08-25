import '@testing-library/jest-dom'
import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'

// Global test setup following 2025 best practices

// Mock environment variables for consistent testing
beforeAll(() => {
  // Set up consistent test environment
  process.env.NODE_ENV = 'test'
  process.env.CI = 'true'

  // Mock window.matchMedia for responsive tests
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

  // Mock fetch globally
  global.fetch = vi.fn()

  // Mock localStorage
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString()
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
      length: Object.keys(store).length,
      key: vi.fn((index: number) => Object.keys(store)[index] || null)
    }
  })()
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  Object.defineProperty(window, 'sessionStorage', { value: localStorageMock })
})

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks()

  // Reset DOM
  document.body.innerHTML = ''

  // Clear localStorage mock
  window.localStorage.clear()
})

// Global cleanup
afterAll(() => {
  // Clean up any global state
  vi.restoreAllMocks()
})

// Custom matchers for better assertions
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeAccessible(): T
      toHaveValidStructuredData(): T
      toPassPerformanceAudit(): T
    }
  }
}

// Export test utilities
export const createMockUser = () => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user'
})

export const createMockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data))
})

export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

export { vi } from 'vitest'