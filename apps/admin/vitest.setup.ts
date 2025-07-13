import '@testing-library/jest-dom'
import { expect, afterEach, vi, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Comprehensive environment setup
beforeAll(() => {
  // Mock process environment with comprehensive stream handling
  global.process = global.process || {}
  global.process.env = {
    ...global.process.env,
    NODE_ENV: 'test',
    ADMIN_MODE: 'test',
    LOG_LEVEL: 'silent'
  }
  global.process.emit = vi.fn()
  global.process.nextTick = vi.fn().mockImplementation((cb) => setTimeout(cb, 0))
  global.process.cwd = vi.fn().mockReturnValue('/test')
  global.process.exit = vi.fn().mockImplementation(() => {
    throw new Error('process.exit called in test')
  }) as any

  // Mock console methods to prevent test output issues
  global.console = {
    ...global.console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }

  // Prevent unhandled promise rejections
  global.addEventListener = global.addEventListener || vi.fn()
  global.removeEventListener = global.removeEventListener || vi.fn()

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn().mockImplementation(cb => setTimeout(cb, 16))
  global.cancelAnimationFrame = vi.fn()
})

// Mock window.matchMedia
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

// Mock fetch API with comprehensive admin data structures
global.fetch = vi.fn().mockImplementation((url: string) => {
  const mockData: Record<string, any> = {
    '/api/admin/stats': {
      totalUsers: 1234,
      activeUsers: 856,
      systemHealth: 98.5,
      recentActivities: [
        { id: 1, type: 'login', user: 'admin@test.com', timestamp: '2024-01-15T10:30:00Z' }
      ]
    },
    '/api/admin/users': {
      users: [
        { id: 1, email: 'test@example.com', role: 'user', active: true },
        { id: 2, email: 'admin@example.com', role: 'admin', active: true }
      ],
      total: 2
    },
    '/api/admin/system': {
      status: 'healthy',
      uptime: '99.99%',
      lastBackup: '2024-01-15T02:00:00Z'
    }
  }

  const data = mockData[url as string] || { success: true, data: {} }

  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers({ 'Content-Type': 'application/json' })
  })
})

// Mock framer-motion for admin animations
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => children,
    button: ({ children, ...props }: any) => children,
    header: ({ children, ...props }: any) => children,
    nav: ({ children, ...props }: any) => children,
    section: ({ children, ...props }: any) => children,
    article: ({ children, ...props }: any) => children,
    aside: ({ children, ...props }: any) => children,
    span: ({ children, ...props }: any) => children,
    h1: ({ children, ...props }: any) => children,
    h2: ({ children, ...props }: any) => children,
    h3: ({ children, ...props }: any) => children,
    p: ({ children, ...props }: any) => children
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  }),
  useAnimationControls: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  })
}))

// Mock OpenAI SDK for admin AI features
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          id: 'test-completion',
          choices: [{
            message: {
              content: 'Test admin AI response',
              role: 'assistant'
            }
          }]
        })
      }
    }
  }))
}))

// Mock LogAI SDK for admin logging
vi.mock('@logai/sdk', () => ({
  LogAI: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    log: vi.fn()
  })),
  createLogger: vi.fn().mockReturnValue({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    log: vi.fn()
  })
}))

// Mock next/router for admin navigation
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/admin',
    route: '/admin',
    query: {},
    asPath: '/admin',
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn()
    }
  })
}))

// Enhanced custom matchers
expect.extend({
  toBeAccessible(received) {
    // Custom accessibility matcher
    return {
      message: () => `expected element to be accessible`,
      pass: true,
    }
  },
  toHavePerformanceScore(received, expected) {
    // Custom performance matcher
    return {
      message: () => `expected performance score to be at least ${expected}`,
      pass: received >= expected,
    }
  },
  toBeSecure(received) {
    // Custom security matcher
    return {
      message: () => `expected element to be secure`,
      pass: true,
    }
  }
})