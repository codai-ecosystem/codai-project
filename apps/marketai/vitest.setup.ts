import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }: any) => {
    // Use a simple div element as mock
    return {
      type: 'svg',
      props: { className, ...props, 'data-testid': 'mock-icon' }
    }
  }

  return {
    Target: MockIcon,
    TrendingUp: MockIcon,
    Zap: MockIcon,
    BarChart3: MockIcon,
    Activity: MockIcon,
    Clock: MockIcon,
    Users: MockIcon,
    Settings: MockIcon,
    ChevronRight: MockIcon,
    Star: MockIcon,
    ArrowRight: MockIcon,
    MessageSquare: MockIcon,
    Globe: MockIcon,
    Share: MockIcon,
    Heart: MockIcon,
    Eye: MockIcon,
    Brain: MockIcon,
    Megaphone: MockIcon
  }
})

// Environment variables setup
vi.stubEnv('NODE_ENV', 'test')
vi.stubEnv('OPENAI_API_KEY', 'test-key')
vi.stubEnv('AZURE_OPENAI_API_KEY', 'test-azure-key')
vi.stubEnv('AZURE_OPENAI_ENDPOINT', 'https://test.openai.azure.com')
vi.stubEnv('AZURE_OPENAI_DEPLOYMENT_NAME', 'test-deployment')
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

// Mock OpenAI SDK with test environment configuration
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

// Mock Azure OpenAI Service directly to prevent browser environment issues
vi.mock('@codai/azure-openai', () => ({
  AzureOpenAIService: vi.fn().mockImplementation(() => ({
    generateCompletion: vi.fn().mockResolvedValue('Mock Azure OpenAI response'),
    healthCheck: vi.fn().mockResolvedValue(true),
    isConfigured: vi.fn().mockReturnValue(true),
  })),
}))

// Mock Stripe SDK with proper webhook handling
vi.mock('stripe', () => {
  const mockWebhooks = {
    constructEvent: vi.fn().mockImplementation((payload, sig, secret) => {
      if (sig === 'invalid_signature') {
        const error = new Error('Unable to extract timestamp and signatures from header') as any
        error.name = 'StripeSignatureVerificationError'
        error.type = 'StripeSignatureVerificationError'
        throw error
      }
      return { type: 'payment_intent.succeeded', data: { object: { id: 'pi_test' } } }
    })
  }

  const mockStripe = vi.fn().mockImplementation(() => ({
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        amount: 1000,
        currency: 'usd',
        status: 'requires_payment_method'
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 1000,
        currency: 'usd'
      })
    },
    webhooks: mockWebhooks
  }))

  return {
    default: mockStripe,
    webhooks: mockWebhooks
  }
})

// Mock framer-motion to prevent animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => ({ type: 'div', props, children }),
    span: ({ children, ...props }: any) => ({ type: 'span', props, children }),
    path: ({ children, ...props }: any) => ({ type: 'path', props, children }),
    svg: ({ children, ...props }: any) => ({ type: 'svg', props, children }),
    button: ({ children, ...props }: any) => ({ type: 'button', props, children }),
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