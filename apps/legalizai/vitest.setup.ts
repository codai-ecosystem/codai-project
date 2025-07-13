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
    p: 'p',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    a: 'a',
    article: 'article',
    nav: 'nav',
    footer: 'footer',
    main: 'main',
    aside: 'aside'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  }),
  useInView: () => true,
  useMotionValue: (initial: any) => ({ get: () => initial, set: vi.fn() }),
  useSpring: (value: any) => value,
  useTransform: (value: any, input: any, output: any) => value,
  animate: vi.fn()
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }: any) =>
    React.createElement('svg', { className, ...props, 'data-testid': 'mock-icon' })

  return {
    Scale: MockIcon,
    FileText: MockIcon,
    Shield: MockIcon,
    BookOpen: MockIcon,
    Gavel: MockIcon,
    Users: MockIcon,
    AlertTriangle: MockIcon,
    CheckCircle: MockIcon,
    Activity: MockIcon,
    TrendingUp: MockIcon,
    Clock: MockIcon,
    Settings: MockIcon,
    ChevronRight: MockIcon,
    Star: MockIcon,
    ArrowRight: MockIcon,
    Brain: MockIcon,
    Search: MockIcon,
    MessageSquare: MockIcon
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

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    mark: vi.fn(),
    measure: vi.fn(),
    now: () => Date.now(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => [])
  }
})