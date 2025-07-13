import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

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

// Minimal framer-motion mock for animation components
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
    section: 'section',
    article: 'article',
    nav: 'nav',
    header: 'header',
    footer: 'footer',
    main: 'main',
    aside: 'aside'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children
}))

// Mock next-auth for dashboard component
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Test User' } },
    status: 'authenticated'
  })
}))

// Mock recharts for dashboard charts
vi.mock('recharts', () => ({
  ResponsiveContainer: vi.fn(({ children }) => children),
  LineChart: vi.fn(({ children }) => children),
  Line: vi.fn(() => null),
  XAxis: vi.fn(() => null),
  YAxis: vi.fn(() => null),
  CartesianGrid: vi.fn(() => null),
  Tooltip: vi.fn(() => null),
  BarChart: vi.fn(({ children }) => children),
  Bar: vi.fn(() => null),
  PieChart: vi.fn(({ children }) => children),
  Pie: vi.fn(() => null),
  Cell: vi.fn(() => null)
}))