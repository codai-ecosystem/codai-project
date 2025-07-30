import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'

// Global test setup
beforeAll(() => {
  // Setup global mocks
  global.fetch = vi.fn()

  // Mock environment variables
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.SUPABASE_ANON_KEY = 'test-key'
  process.env.OPENAI_API_KEY = 'test-openai-key'
  process.env.PINECONE_API_KEY = 'test-pinecone-key'
  process.env.PINECONE_ENVIRONMENT = 'test'
  process.env.MASTER_ENCRYPTION_KEY = 'test-master-key-32-characters-long'
})

afterAll(() => {
  // Cleanup global mocks
  vi.restoreAllMocks()
})

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks()
})

afterEach(() => {
  // API tests don't need React cleanup
})

// Global test utilities
export const mockFetch = (response: any, options: { ok?: boolean; status?: number } = {}) => {
  const mockResponse = {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response))
  }

    ; (global.fetch as any).mockResolvedValue(mockResponse)
  return mockResponse
}

export const mockSupabaseResponse = (data: any, error: any = null) => {
  return {
    data,
    error,
    status: error ? 400 : 200,
    statusText: error ? 'Bad Request' : 'OK'
  }
}

// Test API handler utility
export async function testApiHandler({
  handler,
  url,
  method = 'GET',
  body,
  headers = {}
}: {
  handler: (req: any, res: any) => Promise<Response>;
  url: string;
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}) {
  const urlObj = new URL(url, 'http://localhost:3000');

  const mockRequest = {
    method,
    url,
    query: Object.fromEntries(urlObj.searchParams.entries()),
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    json: vi.fn().mockResolvedValue(body)
  } as any;

  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis()
  } as any;

  try {
    const response = await handler(mockRequest, mockResponse);
    return {
      response: {
        status: response.status,
        json: async () => response.json ? await response.json() : JSON.parse(await response.text())
      }
    };
  } catch (error) {
    return {
      response: {
        status: 500,
        json: async () => ({ success: false, error: 'Internal server error' })
      }
    };
  }
}
