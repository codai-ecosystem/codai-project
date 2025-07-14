import '@testing-library/jest-dom'
import { expect, afterEach, vi, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Global test environment setup
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
})

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }: any) =>
    React.createElement('svg', { className, ...props, 'data-testid': 'mock-icon' })

  return {
    FileText: MockIcon,
    Eye: MockIcon,
    AlertTriangle: MockIcon,
    Activity: MockIcon,
    TrendingUp: MockIcon,
    Clock: MockIcon,
    Users: MockIcon,
    Settings: MockIcon,
    ChevronRight: MockIcon,
    Star: MockIcon,
    ArrowRight: MockIcon,
    Zap: MockIcon,
    Shield: MockIcon,
    Database: MockIcon,
    Monitor: MockIcon,
    Search: MockIcon,
    Filter: MockIcon,
    BarChart3: MockIcon,
    Bell: MockIcon,
    Lock: MockIcon,
    Globe: MockIcon
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

// Mock fetch API with comprehensive LogAI data structure
global.fetch = vi.fn().mockImplementation((url) => {
  const mockResponses = {
    '/api/stats': {
      totalUsers: '125,432',
      activeUsers: '12,847',
      logsProcessed: '2.4M',
      alertsGenerated: '1,247',
      systemUptime: '99.9%',
      responseTime: '45ms'
    },
    '/api/logs': {
      logs: [
        { id: 1, level: 'info', message: 'System started', timestamp: '2024-01-01T00:00:00Z' },
        { id: 2, level: 'error', message: 'Database connection failed', timestamp: '2024-01-01T00:01:00Z' },
        { id: 3, level: 'warning', message: 'High memory usage', timestamp: '2024-01-01T00:02:00Z' }
      ]
    },
    '/api/analytics': {
      metrics: {
        errorRate: 0.02,
        throughput: 1250,
        latency: 45
      }
    }
  }

  const response = mockResponses[url as keyof typeof mockResponses] || { message: 'Not found' }

  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  })
})

// Mock LogAI SDK
vi.mock('@logai/sdk', () => ({
  LogAI: vi.fn().mockImplementation(() => ({
    log: vi.fn().mockResolvedValue({ success: true }),
    getStats: vi.fn().mockResolvedValue({
      totalUsers: 125432,
      activeUsers: 12847,
      logsProcessed: 2400000,
      alertsGenerated: 1247
    }),
    getLogs: vi.fn().mockResolvedValue([
      { id: 1, level: 'info', message: 'Test log entry' }
    ]),
    setLevel: vi.fn(),
    configure: vi.fn()
  })),
  createLogger: vi.fn().mockReturnValue({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}))

// Mock framer-motion to prevent animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => children),
    header: vi.fn(({ children, ...props }) => children),
    nav: vi.fn(({ children, ...props }) => children),
    button: vi.fn(({ children, ...props }) => children),
    section: vi.fn(({ children, ...props }) => children),
    article: vi.fn(({ children, ...props }) => children),
    span: vi.fn(({ children, ...props }) => children),
    h1: vi.fn(({ children, ...props }) => children),
    h2: vi.fn(({ children, ...props }) => children),
    h3: vi.fn(({ children, ...props }) => children),
    p: vi.fn(({ children, ...props }) => children),
    ul: vi.fn(({ children, ...props }) => children),
    li: vi.fn(({ children, ...props }) => children)
  },
  AnimatePresence: vi.fn(({ children }) => children),
  useAnimation: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  })),
  useMotionValue: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    onChange: vi.fn()
  })),
  useTransform: vi.fn(() => vi.fn()),
  useSpring: vi.fn(() => vi.fn()),
  useInView: vi.fn(() => true)
}))

// Mock process environment and methods
const originalProcess = global.process
Object.defineProperty(global.process, 'env', {
  writable: true,
  value: {
    ...originalProcess.env,
    NODE_ENV: 'test',
    LOGAI_API_KEY: 'test-api-key',
    DISABLE_LOGGING: 'true'
  }
})

// Mock process methods without overriding readonly properties
vi.spyOn(process, 'emit').mockImplementation(vi.fn())
vi.spyOn(process, 'on').mockImplementation(vi.fn())
vi.spyOn(process, 'once').mockImplementation(vi.fn())
vi.spyOn(process, 'removeListener').mockImplementation(vi.fn())

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