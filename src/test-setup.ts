import { vi, beforeEach, afterEach, afterAll } from 'vitest'
// Import React Testing Library matchers for better DOM assertions
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Prevent process.exit from actually terminating tests
const originalExit = process.exit
process.exit = vi.fn((code?: number) => {
  console.warn(`Process.exit called with code ${code}, intercepted in test environment`)
  throw new Error(`Test attempted process.exit(${code})`)
}) as any

// Mock window object for PWA tests
Object.defineProperty(globalThis, 'window', {
  value: {
    location: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      hostname: 'localhost',
      port: '3000',
      protocol: 'http:',
      pathname: '/',
      search: '',
      hash: ''
    },
    navigator: {
      serviceWorker: {
        register: vi.fn().mockResolvedValue({}),
        ready: Promise.resolve({})
      },
      userAgent: 'Node.js test environment',
      language: 'en-US'
    },
    document: {
      title: 'Test Environment',
      createElement: vi.fn(),
      addEventListener: vi.fn(),
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
      head: { appendChild: vi.fn(), removeChild: vi.fn() }
    },
    localStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    sessionStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    // Add missing console for compatibility
    console: {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn()
    }
  },
  writable: true
})

// Enhanced process mock with better exit handling
Object.defineProperty(globalThis, 'process', {
  value: {
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_API_URL: 'http://localhost:4010',
      NEXT_PUBLIC_CBD_URL: 'http://localhost:4180',
      NEXT_PUBLIC_MCP_URL: 'http://localhost:4950',
      ROMAI_AGI_BASE_URL: 'http://localhost:6101',
      ROMAI_ENTERPRISE_API_URL: 'http://localhost:8001'
    },
    versions: { node: '20.0.0' },
    platform: 'test',
    argv: ['node', 'vitest'],
    cwd: vi.fn(() => '/test'),
    exit: vi.fn((code?: number) => {
      console.warn(`Process.exit intercepted with code ${code}`)
      // Don't actually exit, just throw an error for testing
      if (code !== 0) {
        throw new Error(`Process exit with non-zero code: ${code}`)
      }
    }),
    on: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
    removeListener: vi.fn()
  },
  writable: true
})

// Mock fetch for API calls with better error handling
globalThis.fetch = vi.fn().mockImplementation((url: string, options?: any) => {
  // Default success response for health checks
  if (url.includes('/health')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: 'healthy', service: 'test-service' }),
      text: () => Promise.resolve(JSON.stringify({ status: 'healthy' }))
    })
  }

  // Default mock response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ message: 'Mock response' }),
    text: () => Promise.resolve('Mock response'),
    headers: new Map()
  })
})

// Mock crypto for secure random values
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    })
  },
  writable: true
})

// Mock next/router for Next.js tests
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/'
  }))
}))

// Mock next/image for Next.js Image component
vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, ...props }) => {
    return {
      type: 'img',
      props: { src, alt, ...props }
    }
  })
}))

// Mock browser-specific APIs that don't exist in test environment
Object.defineProperty(globalThis, 'ResizeObserver', {
  value: vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true
})

Object.defineProperty(globalThis, 'IntersectionObserver', {
  value: vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true
})

// Global test utilities
declare global {
  var testUtils: {
    createMockResponse: (data: any, status?: number) => any;
    createMockService: (baseUrl: string) => any;
    waitFor: (ms: number) => Promise<void>;
    skipIfBrowserRequired: () => void;
  };
}

globalThis.testUtils = {
  createMockResponse: (data: any, status = 200) => ({
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    ok: status >= 200 && status < 300,
    status,
    headers: new Map()
  }),

  createMockService: (baseUrl: string) => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    health: vi.fn().mockResolvedValue({ status: 'healthy' })
  }),

  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Skip tests that require browser automation
  skipIfBrowserRequired: () => {
    if (process.env.SKIP_BROWSER_TESTS !== 'false') {
      console.warn('Skipping browser-dependent test in headless environment')
      return true
    }
    return false
  }
}

// Cleanup function for tests - prevent memory leaks
afterEach(() => {
  vi.clearAllMocks()
  // Clear any timers that might be running
  vi.clearAllTimers()
  // Clean up React Testing Library
  cleanup()
})

// Restore original process.exit after all tests complete
afterAll(() => {
  if (originalExit) {
    process.exit = originalExit
  }
})

export { }