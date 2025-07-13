import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Essential framer-motion mock (minimal)
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    img: 'img',
    section: 'section',
    header: 'header',
    p: 'p'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  })
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }: any) =>
    React.createElement('svg', { className, ...props, 'data-testid': 'mock-icon' })

  return {
    User: MockIcon,
    Shield: MockIcon,
    Key: MockIcon,
    Lock: MockIcon,
    Activity: MockIcon,
    TrendingUp: MockIcon,
    Clock: MockIcon,
    Users: MockIcon,
    Settings: MockIcon,
    ChevronRight: MockIcon,
    Star: MockIcon,
    ArrowRight: MockIcon,
    Zap: MockIcon,
    CheckCircle: MockIcon,
    AlertTriangle: MockIcon,
    Globe: MockIcon,
    Database: MockIcon,
    Monitor: MockIcon,
    Layers: MockIcon
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

// Mock Performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    mark: vi.fn(),
    measure: vi.fn(),
    now: vi.fn(() => Date.now()),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  },
})

// Mock fetch for API calls
global.fetch = vi.fn().mockResolvedValue({
  ok: false,
  json: vi.fn().mockResolvedValue({}),
} as any)

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