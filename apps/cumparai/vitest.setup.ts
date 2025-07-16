import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock React hooks with better default values
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: vi.fn((initial) => [initial, vi.fn()]),
    useEffect: vi.fn((fn) => fn()),
    useContext: vi.fn(),
    useRef: vi.fn(() => ({ current: null })),
  }
})

// Enhanced Lucide React icons mock with proper React elements
vi.mock('lucide-react', () => {
  const MockIcon = React.forwardRef(({ className, size, ...props }: any, ref: any) =>
    React.createElement('svg', {
      className,
      width: size || 24,
      height: size || 24,
      ref,
      'data-testid': 'lucide-icon',
      ...props
    })
  )

  return {
    ShoppingBag: MockIcon,
    Search: MockIcon,
    TrendingUp: MockIcon,
    Users: MockIcon,
    Database: MockIcon,
    Zap: MockIcon,
    Star: MockIcon,
    Filter: MockIcon,
    Grid: MockIcon,
    List: MockIcon,
    Heart: MockIcon,
    ShoppingCart: MockIcon,
    Sparkles: MockIcon,
    BarChart3: MockIcon,
    Clock: MockIcon,
    Activity: MockIcon
  }
})

// Enhanced framer-motion mock with proper React elements
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (target, prop) => {
      const Component = React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { whileHover, whileTap, animate, initial, exit, transition, ...restProps } = props
        return React.createElement(prop as string, { ...restProps, ref }, children)
      })
      Component.displayName = `motion.${String(prop)}`
      return Component
    }
  }),
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  })
}))

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

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => [])
  }
})

// Mock fetch for API calls with proper implementation
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    catch: () => Promise.resolve({ ok: false })
  } as any)
)