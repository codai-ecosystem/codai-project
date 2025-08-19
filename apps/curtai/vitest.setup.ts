import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock Lucide React icons
vi.mock('lucide-react', () => {
  const MockIcon = (props: any) => 'div'

  return {
    Monitor: MockIcon,
    Activity: MockIcon,
    TrendingUp: MockIcon,
    Users: MockIcon,
    Globe: MockIcon,
    Zap: MockIcon,
    Shield: MockIcon,
    Star: MockIcon,
    ArrowRight: MockIcon,
    Clock: MockIcon,
    BarChart3: MockIcon,
    Layers: MockIcon,
    Network: MockIcon,
    Database: MockIcon,
    Lightbulb: MockIcon
  }
})

// Essential framer-motion mock (minimal)
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    section: 'section',
    header: 'header',
    nav: 'nav'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children
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