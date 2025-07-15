import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import type { NextApiRequest, NextApiResponse } from 'next'

// Global test setup
beforeAll(() => {
  // Setup global mocks
  global.fetch = vi.fn()

  // Mock environment variables
  process.env.SUPABASE_URL = 'https://test.supabase.co'
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
  // Cleanup after each test
  cleanup()
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

// Mock implementations with proper chain support
export const mockSupabase: any = {
  from: vi.fn((table: string) => {
    let insertedData: any = null;
    let updatedData: any = null;
    
    const mockQuery = {
      select: vi.fn(() => mockQuery),
      insert: vi.fn((data: any) => {
        insertedData = Array.isArray(data) ? data[0] : data;
        return mockQuery;
      }),
      update: vi.fn((data: any) => {
        updatedData = data;
        return mockQuery;
      }),
      delete: vi.fn(() => mockQuery),
      eq: vi.fn(() => mockQuery),
      or: vi.fn(() => mockQuery),
      ilike: vi.fn(() => mockQuery),
      contains: vi.fn(() => mockQuery),
      range: vi.fn(() => mockQuery),
      order: vi.fn(() => mockQuery),
      single: vi.fn(() => {
        // Return inserted/updated data when available
        if (insertedData) {
          const result = { 
            id: 'test-id', 
            ...insertedData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          insertedData = null; // Reset after use
          return Promise.resolve({ data: result, error: null });
        }
        if (updatedData) {
          const result = { 
            id: 'test-id', 
            name: updatedData.name || 'Test Dataset',
            ...updatedData,
            updated_at: new Date().toISOString()
          };
          updatedData = null; // Reset after use
          return Promise.resolve({ data: result, error: null });
        }
        // Default return
        return Promise.resolve({
          data: { id: 'test-id', name: 'Test Dataset', file_name: 'test.txt', file_size: 1024, description: 'Test' },
          error: null
        });
      }),
      // Support async execution with proper await
      then: vi.fn((callback) => {
        const result = {
          data: insertedData ? [{ id: 'test-id', ...insertedData }] : [{ id: 'test-id', name: 'Test Dataset', file_name: 'test.txt', description: 'Test description' }],
          error: null,
          count: 1
        };
        insertedData = null; // Reset after use
        return callback ? callback(result) : result;
      })
    }
    
    // Mock successful responses for different tables
    if (table === 'file_metadata') {
      mockQuery.single.mockResolvedValue({
        data: { id: 'test-file', name: 'test.txt', file_name: 'test.txt', file_size: 1024, description: 'Test file' },
        error: null
      })
    } else if (table === 'datasets') {
      mockQuery.single.mockResolvedValue({
        data: { id: 'test-dataset', name: 'Test Dataset', file_name: '', file_size: 0, description: 'Test description' },
        error: null
      })
    }
    
    return mockQuery
  }),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({
        data: { path: 'test-path/file.txt' },
        error: null
      }),
      download: vi.fn().mockResolvedValue({
        data: new Blob(['test content']),
        error: null
      }),
      remove: vi.fn().mockResolvedValue({
        data: null,
        error: null
      }),
      list: vi.fn().mockResolvedValue({
        data: [{ name: 'test.txt', metadata: {} }],
        error: null
      }),
      getPublicUrl: vi.fn(() => ({
        data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/files/test.txt' }
      }))
    }))
  }
}

export const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn()
    }
  },
  embeddings: {
    create: vi.fn()
  }
}

export const mockPinecone = {
  Index: vi.fn(() => ({
    upsert: vi.fn(),
    query: vi.fn(),
    delete: vi.fn(),
    fetch: vi.fn()
  }))
}

// Test API handler utility
export async function testApiHandler({
  handler,
  url,
  method = 'GET',
  body,
  headers = {}
}: {
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<Response>;
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
