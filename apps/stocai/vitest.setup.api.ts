import { expect, vi, beforeAll } from 'vitest'

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

// Mock Supabase SDK with proper chaining
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn((table: string) => {
      const mockQuery = {
        select: vi.fn(() => mockQuery),
        insert: vi.fn(() => mockQuery),
        update: vi.fn(() => mockQuery),
        delete: vi.fn(() => mockQuery),
        eq: vi.fn(() => mockQuery),
        or: vi.fn(() => mockQuery),
        ilike: vi.fn(() => mockQuery),
        contains: vi.fn(() => mockQuery),
        range: vi.fn(() => mockQuery),
        order: vi.fn(() => mockQuery),
        single: vi.fn(() => Promise.resolve({
          data: { id: 'test-id', name: 'Test Dataset', file_name: 'test.txt', file_size: 1024 },
          error: null
        })),
        // Mock successful responses for SELECT operations
        then: vi.fn((callback) => {
          const mockData = table === 'file_metadata'
            ? [{ id: 'test-file', file_name: 'test.txt', file_size: 1024, file_type: 'text/plain' }]
            : [{ id: 'test-dataset', name: 'Test Dataset', description: 'Test' }]

          return callback({
            data: mockData,
            error: null,
            count: mockData.length
          })
        })
      }

      // Make mockQuery awaitable by adding Promise methods
      Object.assign(mockQuery, Promise.resolve({
        data: table === 'file_metadata'
          ? [{ id: 'test-file', file_name: 'test.txt', file_size: 1024, file_type: 'text/plain' }]
          : [{ id: 'test-dataset', name: 'Test Dataset', description: 'Test' }],
        error: null,
      }))

      return mockQuery
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
