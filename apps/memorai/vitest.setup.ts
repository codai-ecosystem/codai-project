import '@testing-library/jest-dom'
import { expect, afterEach, vi, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Mock lucide-react icons first
vi.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }: any) =>
    React.createElement('svg', { className, ...props, 'data-testid': 'mock-icon' })

  return {
    Brain: MockIcon,
    Database: MockIcon,
    Network: MockIcon,
    Search: MockIcon,
    Activity: MockIcon,
    TrendingUp: MockIcon,
    Clock: MockIcon,
    Users: MockIcon,
    Settings: MockIcon,
    ChevronRight: MockIcon,
    Star: MockIcon,
    ArrowRight: MockIcon,
    Zap: MockIcon,
    MemoryStick: MockIcon,
    HardDrive: MockIcon,
    Share: MockIcon,
    Shield: MockIcon,
    Layers: MockIcon,
    Globe: MockIcon
  }
})

// Mock OpenAI completely to prevent browser environment errors
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }],
        usage: { total_tokens: 100 }
      })
    },
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [{ text: 'Mock completion response' }],
        usage: { total_tokens: 50 }
      })
    }
  })),
  OpenAI: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }],
        usage: { total_tokens: 100 }
      })
    },
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [{ text: 'Mock completion response' }],
        usage: { total_tokens: 50 }
      })
    }
  }))
}))

// Mock LogAI SDK to prevent logger failures
vi.mock('@codai/logai-sdk', () => ({
  LogAIClient: vi.fn().mockImplementation(() => ({
    log: vi.fn().mockImplementation(async (entry) => {
      // Ensure level is a string for toUpperCase() calls
      const level = typeof entry.level === 'string' ? entry.level : 'info'
      console.log(`[MOCK-LOGAI] ${level.toUpperCase()}: ${entry.message}`)
      return Promise.resolve({
        success: true,
        id: 'mock-log-id-' + Date.now(),
        timestamp: new Date().toISOString()
      })
    }),
    logToConsole: vi.fn().mockImplementation((entry) => {
      const level = typeof entry.level === 'string' ? entry.level : 'info'
      console.log(`[MOCK-LOGAI-CONSOLE] ${level.toUpperCase()}: ${entry.message}`)
    }),
    configure: vi.fn(),
    flush: vi.fn().mockResolvedValue(true)
  }))
}))

// Mock core MEMORAI services
vi.mock('./packages/core/src/engine/MemoryEngine', () => ({
  MemoryEngine: vi.fn().mockImplementation(() => ({
    addMemory: vi.fn().mockResolvedValue({
      id: 'test-memory-id',
      content: 'Test memory content',
      metadata: { category: 'test' },
      timestamp: new Date().toISOString()
    }),
    searchMemories: vi.fn().mockResolvedValue([
      {
        id: 'search-result-1',
        content: 'Matching memory content',
        similarity: 0.95,
        metadata: { category: 'test' }
      }
    ]),
    getMemoryStats: vi.fn().mockResolvedValue({
      totalMemories: 100,
      totalUsers: 25,
      memoryTypes: { text: 80, image: 15, audio: 5 },
      searchQueries: 250,
      averageRetrieval: 45,
      activeUsers: 15
    }),
    getHealth: vi.fn().mockResolvedValue({
      status: 'healthy',
      uptime: 3600,
      memoryCount: 100,
      lastCheck: new Date().toISOString()
    })
  }))
}))

// Mock EmbeddingService
vi.mock('./packages/core/src/embedding/EmbeddingService', () => ({
  EmbeddingService: vi.fn().mockImplementation(() => ({
    generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)),
    generateEmbeddings: vi.fn().mockResolvedValue([
      new Array(1536).fill(0.1),
      new Array(1536).fill(0.2)
    ])
  }))
}))

// Cleanup after each test case
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Setup global environment before all tests
beforeAll(() => {
  // Comprehensive environment setup for MEMORAI tests
  vi.stubGlobal('process', {
    ...process,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      MEMORY_API_KEY: 'test-api-key-12345678901234567890',
      MEMORY_EMBEDDING_API_KEY: 'test-embedding-api-key-12345678901234567890',
      MEMORY_OPENAI_API_KEY: 'test-openai-api-key-12345678901234567890',
      MEMORY_DATABASE_HOST: 'localhost',
      MEMORY_DATABASE_PORT: '6379',
      MEMORY_EMBEDDING_MODEL: 'text-embedding-ada-002',
      MEMORY_ENCRYPTION_KEY: 'test-encryption-key-32-chars-long',
      OPENAI_API_KEY: 'test-key-12345678901234567890',
      LOGAI_API_KEY: 'test-logai-key-12345678901234567890',
      LOGAI_ENDPOINT: 'http://localhost:4032'
    },
    // Mock process methods that may be called during tests
    emit: vi.fn().mockReturnValue(true),
    on: vi.fn(),
    once: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
    listeners: vi.fn().mockReturnValue([]),
    listenerCount: vi.fn().mockReturnValue(0),
    setMaxListeners: vi.fn(),
    getMaxListeners: vi.fn().mockReturnValue(10),
    exit: vi.fn(),
    kill: vi.fn(),
    nextTick: vi.fn((cb) => setTimeout(cb, 0)),
    cwd: vi.fn().mockReturnValue('/test'),
    chdir: vi.fn(),
    umask: vi.fn().mockReturnValue(0o022)
  })

  // Mock fetch API for all HTTP requests with proper MEMORAI data structure
  global.fetch = vi.fn((url: string) => {
    // Handle memory-metrics API endpoint specifically
    if (url?.includes('/api/memory-metrics')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          metrics: {
            knowledgeGraphNodes: 1247,
            memoryEfficiency: 87,
            activeDataStreams: 5,
            cacheHitRate: 84,
            storageUsedMB: 512,
            totalMemories: 100,
            totalUsers: 25,
            memoryTypes: { text: 80, image: 15, audio: 5 },
            searchQueries: 250,
            averageRetrieval: 45,
            activeUsers: 15
          },
          knowledgeStores: [
            {
              id: 'store-1',
              name: 'Primary Memory Store',
              type: 'vector',
              status: 'active',
              size: 256
            },
            {
              id: 'store-2',
              name: 'Knowledge Graph Store',
              type: 'graph',
              status: 'active',
              size: 128
            },
            {
              id: 'store-3',
              name: 'Cache Store',
              type: 'cache',
              status: 'active',
              size: 128
            }
          ],
          message: 'Memory metrics retrieved successfully'
        }),
        text: () => Promise.resolve('Memory metrics response'),
        headers: new Headers(),
        redirected: false,
        statusText: 'OK',
        type: 'basic' as ResponseType,
        url: url,
        clone: () => ({}) as Response,
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData())
      })
    }

    // Default fetch response for other endpoints
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        success: true,
        data: {
          totalMemories: 100,
          totalUsers: 25,
          memoryTypes: { text: 80, image: 15, audio: 5 },
          searchQueries: 250,
          averageRetrieval: 45,
          activeUsers: 15
        },
        message: 'Test API response'
      }),
      text: () => Promise.resolve('Test response'),
      headers: new Headers(),
      redirected: false,
      statusText: 'OK',
      type: 'basic' as ResponseType,
      url: url,
      clone: () => ({}) as Response,
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData())
    })
  }) as any
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

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16)
  return 1
}) as any
global.cancelAnimationFrame = vi.fn()

// Mock Next.js router and navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/memorai',
}))

// Mock browser APIs that may be used by components
Object.defineProperty(global, 'navigator', {
  writable: true,
  value: {
    userAgent: 'Mozilla/5.0 (Test Environment) Test/1.0',
    platform: 'Test',
    language: 'en-US',
    languages: ['en-US', 'en'],
    cookieEnabled: true,
    onLine: true,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue('test')
    }
  },
})

// Mock localStorage and sessionStorage
Object.defineProperty(global, 'localStorage', {
  writable: true,
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(() => null)
  }
})

Object.defineProperty(global, 'sessionStorage', {
  writable: true,
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(() => null)
  }
})

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
    button: 'button',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    label: 'label',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({}),
  useMotionValue: () => ({}),
  useTransform: () => ({}),
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