import { vi } from 'vitest'

// Mock Next.js environment
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3005'
  }
})

// Mock environment variables
vi.mock('process', () => ({
  env: {
    LOGAI_API_URL: 'http://localhost:3002',
    MEMORAI_API_URL: 'http://localhost:3003',
    CODAI_API_URL: 'http://localhost:3001',
    NODE_ENV: 'test'
  }
}))

// Mock fetch globally
global.fetch = vi.fn()

// Setup console mocks to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
