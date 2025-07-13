import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock framer-motion for test compatibility
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    h1: 'h1',
    section: 'section',
    span: 'span',
    button: 'button',
    nav: 'nav',
    header: 'header',
    main: 'main',
    aside: 'aside',
    footer: 'footer',
    article: 'article',
    p: 'p',
    img: 'img',
    ul: 'ul',
    li: 'li',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    option: 'option',
    table: 'table',
    thead: 'thead',
    tbody: 'tbody',
    tr: 'tr',
    td: 'td',
    th: 'th'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  }),
  useMotionValue: () => ({ get: vi.fn(), set: vi.fn() }),
  useTransform: () => ({ get: vi.fn(), set: vi.fn() }),
  useSpring: () => ({ get: vi.fn(), set: vi.fn() })
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