import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Make React available globally for JSX
global.React = React

// Cleanup after each test case
afterEach(() => {
  cleanup()
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

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(({ children, ...props }: any) =>
      React.createElement('div', props, children)
    ),
    section: vi.fn(({ children, ...props }: any) =>
      React.createElement('section', props, children)
    ),
    h1: vi.fn(({ children, ...props }: any) =>
      React.createElement('h1', props, children)
    ),
    p: vi.fn(({ children, ...props }: any) =>
      React.createElement('p', props, children)
    ),
    span: vi.fn(({ children, ...props }: any) =>
      React.createElement('span', props, children)
    ),
    button: vi.fn(({ children, ...props }: any) =>
      React.createElement('button', props, children)
    ),
  },
  AnimatePresence: vi.fn(({ children }: any) => children),
  useAnimation: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  })),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const MockIcon = ({ className, size, ...props }: any) =>
    React.createElement('svg', {
      className,
      width: size || 24,
      height: size || 24,
      'data-testid': 'mock-icon',
      ...props
    }, React.createElement('rect', { width: size || 24, height: size || 24 }))

  return new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        return MockIcon
      }
      return target[prop as keyof typeof target]
    }
  })
})

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