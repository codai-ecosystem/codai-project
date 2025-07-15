import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'

// Mock React JSX Runtime (essential for React 19)
vi.mock('react/jsx-dev-runtime', () => ({
  jsxDEV: vi.fn(() => 'mocked-jsx-element'),
  Fragment: 'fragment'
}))

// Mock React first (essential for workspace)
vi.mock('react', () => ({
  default: {
    createElement: vi.fn(() => 'mocked-element'),
    Fragment: 'fragment',
  },
  createElement: vi.fn(() => 'mocked-element'),
  Fragment: 'fragment',
  useState: vi.fn(() => [null, vi.fn()]),
  useEffect: vi.fn(),
  useContext: vi.fn(),
  useRef: vi.fn(() => ({ current: null })),
  forwardRef: vi.fn((fn) => fn),
  memo: vi.fn((component) => component),
}))

// Mock react-dom
vi.mock('react-dom', () => ({
  default: { render: vi.fn() },
  render: vi.fn(),
  unmountComponentAtNode: vi.fn(),
}))

// Now we can import testing library since React is mocked
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock Lucide React icons
vi.mock('lucide-react', () => {
  const MockIcon = (props: any) => 'div'

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
    PresentationChart: MockIcon,
    Clock: MockIcon,
    Activity: MockIcon
  }
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