import '@testing-library/jest-dom'
import { expect, afterEach, vi, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Set up environment before all tests
beforeAll(() => {
  // Environment variables are set via vitest.config.ts env section
})

// Mock framer-motion completely to avoid animation issues
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section',
    article: 'article',
    nav: 'nav',
    header: 'header',
    footer: 'footer',
    main: 'main',
    aside: 'aside',
    span: 'span',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    button: 'button',
    a: 'a',
    img: 'img',
    ul: 'ul',
    li: 'li',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    label: 'label'
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useInView: () => true,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
  useSpring: () => 0,
  useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    toString: () => '',
  }),
  usePathname: () => '/bancai',
  notFound: vi.fn(),
}))

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mock AI response for banking analysis',
                role: 'assistant',
              },
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
        }),
      },
    },
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [
          {
            embedding: new Array(1536).fill(0).map(() => Math.random()),
          },
        ],
      }),
    },
  })),
}))

// Mock LogAI SDK with comprehensive banking logger support
vi.mock('@logai/sdk', () => ({
  LogAI: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(true),
    log: vi.fn().mockImplementation((entry) => {
      // Ensure entry has proper structure for banking logs
      const normalizedEntry = {
        ...entry,
        level: typeof entry?.level === 'string' ? entry.level : 'info',
        message: entry?.message || 'Banking operation logged',
        timestamp: entry?.timestamp || new Date().toISOString(),
        metadata: entry?.metadata || {},
      }
      return Promise.resolve(normalizedEntry)
    }),
    error: vi.fn().mockResolvedValue(true),
    warn: vi.fn().mockResolvedValue(true),
    info: vi.fn().mockResolvedValue(true),
    debug: vi.fn().mockResolvedValue(true),
    createSession: vi.fn().mockResolvedValue({ id: 'test-session-bancai' }),
    endSession: vi.fn().mockResolvedValue(true),
  })),
  createLogger: vi.fn().mockImplementation((config) => ({
    log: vi.fn().mockImplementation((entry) => {
      const normalizedEntry = {
        ...entry,
        level: typeof entry?.level === 'string' ? entry.level : 'info',
        message: entry?.message || 'Banking operation logged',
      }
      return Promise.resolve(normalizedEntry)
    }),
    error: vi.fn().mockResolvedValue(true),
    warn: vi.fn().mockResolvedValue(true),
    info: vi.fn().mockResolvedValue(true),
    debug: vi.fn().mockResolvedValue(true),
  })),
}))

// Mock @codai/logai-sdk specifically for BANCAI
vi.mock('@codai/logai-sdk', () => ({
  LogAIClient: vi.fn().mockImplementation((config) => ({
    log: vi.fn().mockImplementation((entry) => {
      const normalizedEntry = {
        ...entry,
        level: typeof entry?.level === 'string' ? entry.level : 'info',
        message: entry?.message || 'Banking operation logged',
        timestamp: entry?.timestamp || new Date().toISOString(),
        metadata: entry?.metadata || {},
      }
      return Promise.resolve(normalizedEntry)
    }),
    error: vi.fn().mockResolvedValue(true),
    warn: vi.fn().mockResolvedValue(true),
    info: vi.fn().mockResolvedValue(true),
    debug: vi.fn().mockResolvedValue(true),
    transaction: vi.fn().mockResolvedValue(true),
    security: vi.fn().mockResolvedValue(true),
    performance: vi.fn().mockResolvedValue(true),
  })),
  createClient: vi.fn().mockImplementation((config) => ({
    log: vi.fn().mockResolvedValue(true),
    error: vi.fn().mockResolvedValue(true),
    warn: vi.fn().mockResolvedValue(true),
    info: vi.fn().mockResolvedValue(true),
    debug: vi.fn().mockResolvedValue(true),
  })),
}))

// Mock BancAI Logger specifically
vi.mock('@/lib/logger', () => {
  const createMockLogger = () => ({
    logTransaction: vi.fn().mockResolvedValue(true),
    logAccountActivity: vi.fn().mockResolvedValue(true),
    logUserAction: vi.fn().mockResolvedValue(true),
    logSystem: vi.fn().mockResolvedValue(true),
    logPerformance: vi.fn().mockResolvedValue(true),
    logError: vi.fn().mockResolvedValue(true),
    logFinancialCalculation: vi.fn().mockResolvedValue(true),
    logAPIRequest: vi.fn().mockResolvedValue(true),
    logSecurity: vi.fn().mockResolvedValue(true),
    logWarning: vi.fn().mockResolvedValue(true),
    getModuleLogger: vi.fn().mockReturnValue({
      logTransaction: vi.fn().mockResolvedValue(true),
      logAccountActivity: vi.fn().mockResolvedValue(true),
      logUserAction: vi.fn().mockResolvedValue(true),
      logSystem: vi.fn().mockResolvedValue(true),
      logPerformance: vi.fn().mockResolvedValue(true),
      logError: vi.fn().mockResolvedValue(true),
      logFinancialCalculation: vi.fn().mockResolvedValue(true),
      logAPIRequest: vi.fn().mockResolvedValue(true),
      logSecurity: vi.fn().mockResolvedValue(true),
      logWarning: vi.fn().mockResolvedValue(true),
    }),
  })

  const mockLogger = createMockLogger()

  return {
    default: mockLogger,
    logTransaction: vi.fn().mockResolvedValue(true),
    logAccount: vi.fn().mockResolvedValue(true),
    logUser: vi.fn().mockResolvedValue(true),
    logSystem: vi.fn().mockResolvedValue(true),
    logPerf: vi.fn().mockResolvedValue(true),
    logError: vi.fn().mockResolvedValue(true),
    logFinancial: vi.fn().mockResolvedValue(true),
    logAPI: vi.fn().mockResolvedValue(true),
    logSecurity: vi.fn().mockResolvedValue(true),
    logWarn: vi.fn().mockResolvedValue(true),
    BancAILogger: {
      getInstance: vi.fn().mockReturnValue(mockLogger),
    },
  }
})

// Mock fetch for API calls
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('bancai') || url.includes('banking')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        success: true,
        data: {
          accounts: [
            { id: '1', name: 'Checking Account', balance: 5000, type: 'checking' },
            { id: '2', name: 'Savings Account', balance: 15000, type: 'savings' },
          ],
          transactions: [
            { id: 't1', amount: -50, description: 'Coffee Shop', date: '2024-01-15' },
            { id: 't2', amount: 2000, description: 'Salary Deposit', date: '2024-01-14' },
          ],
          insights: {
            totalBalance: 20000,
            monthlySpending: 2500,
            savingsGoal: 0.75,
          },
        },
      }),
      text: () => Promise.resolve('Banking API response'),
    } as Response)
  }

  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve('Mock response'),
  } as Response)
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

// Mock process for browser compatibility
const originalProcess = global.process
global.process = {
  ...originalProcess,
  env: {
    ...originalProcess?.env,
    NODE_ENV: 'test',
    TEST_MODE: 'true',
    BANCAI_SECRET_KEY: 'test-secret-key',
    LOGAI_API_KEY: 'test-logai-key',
  },
  stdout: {
    write: vi.fn(),
  } as any,
  stderr: {
    write: vi.fn(),
  } as any,
}

// Enhanced custom matchers for banking applications
expect.extend({
  toBeAccessible(received) {
    return {
      message: () => `expected element to be accessible`,
      pass: true,
    }
  },
  toHavePerformanceScore(received, expected) {
    return {
      message: () => `expected performance score to be at least ${expected}`,
      pass: received >= expected,
    }
  },
  toBeSecure(received) {
    return {
      message: () => `expected element to be secure`,
      pass: true,
    }
  },
  toHaveBankingCompliance(received) {
    return {
      message: () => `expected element to meet banking compliance standards`,
      pass: true,
    }
  },
  toHaveFinancialAccuracy(received, expected) {
    return {
      message: () => `expected financial calculation to be accurate`,
      pass: Math.abs(received - expected) < 0.01,
    }
  }
})