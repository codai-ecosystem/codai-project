import { expect, afterEach, beforeAll, vi } from 'vitest';

// Mock dotenv before importing the server module
vi.mock('dotenv', async (importOriginal) => {
  const actual = await importOriginal<typeof import('dotenv')>();
  return {
    ...actual,
    config: vi.fn(() => ({ parsed: {}, error: undefined })),
  };
});

// Load environment variables for testing
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

// Extend Vitest's expect with additional matchers if needed
// expect.extend(matchers);

// Mock console methods in tests to reduce noise
const originalConsole = { ...console };

beforeAll(() => {
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.MEMORAI_API_KEY = 'test-api-key';
  process.env.CBD_BASE_URL = 'http://localhost:4180';
  process.env.MEMORAI_MCP_PORT = '0'; // Use random port for tests
  
  // Mock external services for testing
  vi.stubGlobal('fetch', vi.fn());
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});

// Global test utilities
globalThis.testUtils = {
  createMockRequest: (url: string = 'http://localhost:4950/test') => {
    return {
      url,
      method: 'GET',
      headers: {},
      body: null
    };
  },
  
  createMockMemory: (id: string = 'test-memory') => ({
    id,
    content: 'Test memory content',
    metadata: {
      entityType: 'test',
      importance: 5,
      timestamp: new Date().toISOString()
    }
  }),
  
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

// Define types for test utilities
declare global {
  var testUtils: {
    createMockRequest: (url?: string) => any;
    createMockMemory: (id?: string) => any;
    delay: (ms: number) => Promise<void>;
  };
}

export {};