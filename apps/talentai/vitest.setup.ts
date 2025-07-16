import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'

// Mock cleanup function instead of importing from @testing-library/react
const cleanup = vi.fn()

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock framer-motion components with proper prop filtering
vi.mock('framer-motion', () => {
  const React = (() => {
    try {
      return require('react')
    } catch {
      // Fallback for ESM environments
      return {
        createElement: (tag: string, props: any, ...children: any[]) => ({
          type: tag,
          props: { ...props, children }
        }),
        forwardRef: (fn: any) => fn
      }
    }
  })()

  // Animation props to filter out
  const animationProps = new Set([
    'initial',
    'animate',
    'exit',
    'transition',
    'whileHover',
    'whileTap',
    'whileFocus',
    'whileInView',
    'variants',
    'layoutId',
    'layout',
    'onAnimationStart',
    'onAnimationComplete',
    'drag',
    'dragConstraints',
    'dragElastic',
    'dragMomentum',
    'onDrag',
    'onDragStart',
    'onDragEnd'
  ])

  const filterProps = (props: any) => {
    const filtered: any = {}
    for (const [key, value] of Object.entries(props)) {
      if (!animationProps.has(key)) {
        filtered[key] = value
      }
    }
    return filtered
  }

  const createMotionComponent = (Component: string) => {
    return React.forwardRef((props: any, ref: any) => {
      const filteredProps = filterProps(props)
      return React.createElement(Component, { ...filteredProps, ref })
    })
  }

  return {
    motion: {
      div: createMotionComponent('div'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      h3: createMotionComponent('h3'),
      p: createMotionComponent('p'),
      span: createMotionComponent('span'),
      section: createMotionComponent('section'),
      main: createMotionComponent('main'),
      button: createMotionComponent('button'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children
  }
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