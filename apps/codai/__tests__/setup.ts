/**
 * 🧪 Vitest Setup for CODAI Application Testing
 * Configuration and global test setup for modern testing with Vitest
 */

import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach, expect } from 'vitest'
import { configure } from '@testing-library/react'
import { vi } from 'vitest'

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
})

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    route: '/dashboard',
    pathname: '/dashboard',
    query: {},
    asPath: '/dashboard',
    push: vi.fn(),
    pop: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
  }),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Lucide React icons - comprehensive icon mocking
vi.mock('lucide-react', () => {
  const React = require('react');
  const mockIcon = (name: string) => {
    const MockedIcon: React.FC<any> = (props: any) => {
      return React.createElement('span', {
        'data-testid': `icon-${name.toLowerCase()}`,
        'data-icon': name,
        className: props.className || '',
        ...props
      }, name);
    };
    MockedIcon.displayName = `Mocked${name}Icon`;
    return MockedIcon;
  };

  return new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        return mockIcon(prop);
      }
      return undefined;
    }
  });
});

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => {
    const React = require('react')
    return React.cloneElement(children, { href })
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4003/api'
process.env.NEXT_PUBLIC_GATEWAY_URL = 'http://localhost:4003'
process.env.NEXT_PUBLIC_CBD_URL = 'http://localhost:4180'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock matchMedia
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

// Mock fetch API
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ status: 'healthy', service: 'codai' }),
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    text: () => Promise.resolve('{"status":"healthy"}'),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  } as Response)
)

// Mock WebSocket
global.WebSocket = vi.fn(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  send: vi.fn(),
  readyState: WebSocket.OPEN,
})) as any

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7),
    getRandomValues: (arr: any) => arr.map(() => Math.floor(Math.random() * 256)),
  },
})

// Console error and warning suppression for cleaner test output
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  // Suppress known warnings and errors during tests
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: React.createFactory() is deprecated') ||
        args[0].includes('Warning: componentWillReceiveProps'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps has been renamed') ||
        args[0].includes('Warning: React.createFactory'))
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  // Restore original console methods
  console.error = originalError
  console.warn = originalWarn
})

// Global test cleanup
afterEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})

// Custom matchers for enhanced testing
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
  toHaveBeenCalledWithObject(received: any, expected: any) {
    const pass = received.mock.calls.some((call: any) =>
      JSON.stringify(call[0]) === JSON.stringify(expected)
    )
    return {
      message: () =>
        pass
          ? `expected function not to have been called with object ${JSON.stringify(expected)}`
          : `expected function to have been called with object ${JSON.stringify(expected)}`,
      pass,
    }
  },
})

// Global test utilities
declare global {
  var testUtils: {
    createMockProject: (overrides?: any) => any
    createMockUser: (overrides?: any) => any
    createMockApiResponse: (data?: any, status?: number) => Promise<Response>
    waitForLoadingToFinish: () => Promise<void>
    mockFetch: (data: any, status?: number) => void
  }
}

global.testUtils = {
  createMockProject: (overrides = {}) => ({
    id: 'test-project-' + Math.random().toString(36).substring(7),
    name: 'Test Project',
    description: 'Test project description',
    template: 'react-app',
    status: 'active',
    files: [],
    dependencies: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  createMockUser: (overrides = {}) => ({
    id: 'test-user-' + Math.random().toString(36).substring(7),
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    avatar: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  createMockApiResponse: (data = {}, status = 200) => {
    return Promise.resolve({
      json: () => Promise.resolve(data),
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: new Headers(),
      text: () => Promise.resolve(JSON.stringify(data)),
    } as Response)
  },

  waitForLoadingToFinish: async () => {
    const { waitFor, screen } = await import('@testing-library/react')
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  },

  mockFetch: (data: any, status = 200) => {
    ; (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(data),
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: new Headers(),
      text: () => Promise.resolve(JSON.stringify(data)),
    })
  },
}

// Mock Date for consistent testing
const mockDate = new Date('2025-08-05T00:00:00Z')
vi.setSystemTime(mockDate)

export { }
