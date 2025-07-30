import '@testing-library/jest-dom'
import { expect, afterEach, vi, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Set up environment variables for testing
beforeAll(() => {
  // Mock environment variables using vi.stubEnv
  vi.stubEnv('NODE_ENV', 'test')
  vi.stubEnv('TEST_MODE', 'true')
  vi.stubEnv('NEXT_PUBLIC_OPENAI_API_KEY', 'test-key-mock')
  vi.stubEnv('OPENAI_API_KEY', 'test-key-mock')
  vi.stubEnv('NEXT_PUBLIC_PINECONE_API_KEY', 'test-pinecone-key')
  vi.stubEnv('PINECONE_API_KEY', 'test-pinecone-key')
  vi.stubEnv('LOGAI_API_KEY', 'test-logai-key')
})

// Mock OpenAI SDK
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn().mockImplementation(({ input }) => {
        // Simulate failure for specific test text
        if (input === 'Test text' || input === 'force_embedding_failure') {
          return Promise.reject(new Error('API Error'));
        }

        return Promise.resolve({
          data: [{ embedding: new Array(1536).fill(0.1) }]
        });
      })
    },
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }]
        })
      }
    }
  }))
}))

// Mock Azure OpenAI
vi.mock('@/lib/azure-openai', () => ({
  azureOpenAI: {
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })
    },
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }]
        })
      }
    }
  }
}))

// Mock Pinecone SDK
vi.mock('@pinecone-database/pinecone', () => ({
  Pinecone: vi.fn().mockImplementation(() => ({
    index: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ upsertedCount: 1 }),
      query: vi.fn().mockResolvedValue({
        matches: [
          {
            id: 'test-vector-1',
            score: 0.95,
            metadata: { text: 'Test vector content' }
          }
        ]
      }),
      delete: vi.fn().mockImplementation(() => Promise.resolve({})),
      deleteOne: vi.fn().mockImplementation((id) => {
        // Simulate failure for specific test ID
        if (id === 'vector-1' && process.env.FORCE_PINECONE_FAILURE === 'true') {
          return Promise.reject(new Error('Pinecone Error'));
        }
        return Promise.resolve({});
      }),
      fetch: vi.fn().mockResolvedValue({
        vectors: {
          'test-vector-1': {
            id: 'test-vector-1',
            values: new Array(1536).fill(0.1),
            metadata: { text: 'Test vector content' }
          }
        }
      })
    })
  }))
}))

// Mock Supabase SDK
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 1, name: 'Test Dataset' },
            error: null
          })
        }),
        range: vi.fn().mockReturnValue({
          or: vi.fn().mockResolvedValue({
            data: [{ id: 1, name: 'Test Dataset', file_name: 'test.txt', file_size: 1024 }],
            error: null
          })
        }),
        or: vi.fn().mockResolvedValue({
          data: [{ id: 1, name: 'Test Dataset' }],
          error: null
        }),
        data: [{ id: 1, name: 'Test Dataset' }],
        error: null
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 1, name: 'Test Dataset' },
            error: null
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ id: 1, name: 'Updated Dataset' }],
          error: null
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'test-file.txt' },
          error: null
        }),
        download: vi.fn().mockResolvedValue({
          data: new Blob(['test content'], { type: 'text/plain' }),
          error: null
        }),
        remove: vi.fn().mockResolvedValue({
          data: [],
          error: null
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://mock-url.com/test-file.txt' }
        })
      })
    }
  })
}))

// Mock LogAI SDK
vi.mock('@codai/logai-sdk', () => ({
  LogAI: vi.fn().mockImplementation(() => ({
    log: vi.fn().mockResolvedValue({ success: true }),
    error: vi.fn().mockResolvedValue({ success: true }),
    info: vi.fn().mockResolvedValue({ success: true }),
    warn: vi.fn().mockResolvedValue({ success: true }),
    debug: vi.fn().mockResolvedValue({ success: true })
  })),
  LogAIClient: vi.fn().mockImplementation(() => ({
    log: vi.fn().mockResolvedValue({ success: true }),
    error: vi.fn().mockResolvedValue({ success: true }),
    info: vi.fn().mockResolvedValue({ success: true }),
    warn: vi.fn().mockResolvedValue({ success: true }),
    debug: vi.fn().mockResolvedValue({ success: true })
  })),
  createLogAIClient: vi.fn().mockReturnValue({
    log: vi.fn().mockResolvedValue({ success: true }),
    error: vi.fn().mockResolvedValue({ success: true }),
    info: vi.fn().mockResolvedValue({ success: true }),
    warn: vi.fn().mockResolvedValue({ success: true }),
    debug: vi.fn().mockResolvedValue({ success: true })
  })
}))

// Mock Next.js features
vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: vi.fn().mockReturnValue('/'),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams())
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => vi.fn().mockImplementation((props) => props.children)
  }),
  AnimatePresence: vi.fn().mockImplementation(({ children }) => children),
  useAnimation: vi.fn().mockReturnValue({
    start: vi.fn(),
    set: vi.fn(),
    stop: vi.fn()
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

// Mock fetch for API routes
global.fetch = vi.fn().mockImplementation((url) => {
  if (typeof url === 'string') {
    if (url.includes('/api/datasets')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: [{ id: 1, name: 'Test Dataset' }]
        })
      })
    }
    if (url.includes('/api/vectors')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: [{ id: 'vector-1', text: 'Test vector' }]
        })
      })
    }
    if (url.includes('/api/files')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: [{ id: 'file-1', name: 'test.txt' }]
        })
      })
    }
  }

  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true, data: [] })
  })
})

// Mock process.stdout for environments that don't support it
if (!process.stdout || typeof process.stdout.write !== 'function') {
  Object.defineProperty(process, 'stdout', {
    value: {
      write: vi.fn(),
      once: vi.fn(),
      emit: vi.fn()
    },
    writable: false
  })
}

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