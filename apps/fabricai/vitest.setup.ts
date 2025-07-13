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
    section: 'section'
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
    Cpu: MockIcon,
    Code: MockIcon,
    Workflow: MockIcon,
    Zap: MockIcon,
    Activity: MockIcon,
    TrendingUp: MockIcon,
    Clock: MockIcon,
    Users: MockIcon,
    Settings: MockIcon,
    ChevronRight: MockIcon,
    Star: MockIcon,
    ArrowRight: MockIcon,
    Sparkles: MockIcon,
    Layers: MockIcon,
    Terminal: MockIcon,
    FileCode: MockIcon,
    GitBranch: MockIcon,
    Play: MockIcon,
    Download: MockIcon,
    Upload: MockIcon,
    Brain: MockIcon
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
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => [])
  }
})

// Mock fetch for API calls (minimal - let real functionality handle responses)
global.fetch = vi.fn()