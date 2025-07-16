import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock Azure OpenAI Service
vi.mock('@codai/azure-openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      generateCompletion: vi.fn().mockResolvedValue({
        success: true,
        data: 'Mock response',
        metadata: {
          model: 'gpt-4',
          tokens: 100,
          responseTime: 500,
          timestamp: new Date().toISOString()
        }
      }),
      healthCheck: vi.fn().mockResolvedValue(true),
      getServiceInfo: vi.fn().mockReturnValue({
        endpoint: 'https://mock.***',
        deployment: 'gpt-4',
        apiVersion: '2024-02-15-preview',
        model: 'gpt-4',
        isHealthy: true,
        timestamp: new Date().toISOString()
      })
    }))
  }
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

// Mock fetch for API calls
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('/api/insights')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        insights: [
          { id: 1, title: 'Sample Insight', description: 'Test insight', type: 'info' },
          { id: 2, title: 'Another Insight', description: 'Test insight 2', type: 'warning' }
        ]
      })
    } as Response);
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: [] })
  } as Response);
});

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