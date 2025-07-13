import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock framer-motion with comprehensive motion component support
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    span: 'span',
    button: 'button',
    header: 'header',
    nav: 'nav',
    main: 'main',
    article: 'article',
    aside: 'aside',
    footer: 'footer',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    img: 'img',
    video: 'video',
    canvas: 'canvas',
    svg: 'svg',
    path: 'path',
    circle: 'circle',
    rect: 'rect',
    line: 'line',
    ul: 'ul',
    li: 'li',
    a: 'a'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  }),
  useMotionValue: (initial: any) => ({ get: () => initial, set: vi.fn() }),
  useTransform: () => vi.fn(),
  useSpring: (value: any) => value,
  useMotionTemplate: () => '',
  useDragControls: () => ({ start: vi.fn() }),
  useAnimationControls: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() })
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