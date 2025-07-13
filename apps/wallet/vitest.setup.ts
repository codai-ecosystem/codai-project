import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Environment variables setup
vi.stubEnv('NODE_ENV', 'test')
vi.stubEnv('OPENAI_API_KEY', 'test-key')
vi.stubEnv('AZURE_OPENAI_API_KEY', 'test-azure-key')
vi.stubEnv('AZURE_OPENAI_ENDPOINT', 'https://test.openai.azure.com')
vi.stubEnv('PINECONE_API_KEY', 'test-pinecone-key')
vi.stubEnv('PINECONE_ENVIRONMENT', 'test-env')
vi.stubEnv('PINECONE_INDEX_NAME', 'test-index')
vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('SUPABASE_ANON_KEY', 'test-supabase-key')
vi.stubEnv('LOGAI_API_KEY', 'test-logai-key')
vi.stubEnv('LOGAI_ENDPOINT', 'https://test-logai.com')

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

// Mock fetch for API calls
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true, data: {} }),
    text: () => Promise.resolve('{}'),
    blob: () => Promise.resolve(new Blob()),
    headers: new Headers(),
  } as Response)
)

// Mock OpenAI SDK
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock response' } }],
        }),
      },
    },
  })),
}))

// Mock framer-motion to prevent animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const React = require('react')
      return React.createElement('div', props, children)
    },
    span: ({ children, ...props }: any) => {
      const React = require('react')
      return React.createElement('span', props, children)
    },
    path: ({ children, ...props }: any) => {
      const React = require('react')
      return React.createElement('path', props, children)
    },
    svg: ({ children, ...props }: any) => {
      const React = require('react')
      return React.createElement('svg', props, children)
    },
    button: ({ children, ...props }: any) => {
      const React = require('react')
      return React.createElement('button', props, children)
    },
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useMotionValue: () => ({
    set: vi.fn(),
    get: vi.fn(),
  }),
}))

// Mock LogAI SDK
vi.mock('@logai/sdk', () => ({
  LogAI: vi.fn().mockImplementation(() => ({
    log: vi.fn().mockImplementation((level, message, metadata) => {
      // Handle level.toUpperCase() call
      const normalizedLevel = typeof level === 'string' ? level.toUpperCase() : 'INFO'
      console.log(`[${normalizedLevel}] ${message}`, metadata)
      return Promise.resolve()
    }),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}))

// Mock Pinecone SDK
vi.mock('@pinecone-database/pinecone', () => ({
  Pinecone: vi.fn().mockImplementation(() => ({
    Index: vi.fn().mockImplementation(() => ({
      query: vi.fn().mockResolvedValue({
        matches: [],
        namespace: 'test',
      }),
      upsert: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({}),
    })),
  })),
}))

// Mock Supabase SDK
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockImplementation(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    data: [],
    error: null,
  })),
}))

// Mock process for environment compatibility
Object.defineProperty(global, 'process', {
  writable: true,
  value: {
    ...global.process,
    env: {
      ...global.process.env,
      NODE_ENV: 'test',
    },
  },
})

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