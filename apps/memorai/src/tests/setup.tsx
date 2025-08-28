// 2025 Test Setup - Modern Testing Best Practices
// Import jest-dom matchers for enhanced DOM assertions
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Enable React 18 concurrent features in tests
global.React = React

// Mock global fetch function for API calls
global.fetch = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
  // Handle different API endpoints
  if (typeof url === 'string') {
    if (url.includes('/api/ai/natural-query?action=suggestions')) {
      return Promise.resolve(new Response(JSON.stringify({
        success: true,
        data: {
          commonQueries: [
            'Show me React components from last month',
            'Find TypeScript interfaces I created',
            'Search for important notes about authentication',
            'Display all project documentation'
          ]
        }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    
    if (url.includes('/api/ai/natural-query') && options?.method === 'POST') {
      return Promise.resolve(new Response(JSON.stringify({
        success: true,
        data: {
          results: [],
          summary: {
            query: {
              originalQuery: 'test query',
              searchType: 'semantic',
              confidence: 0.85
            }
          },
          insights: {
            resultPatterns: [],
            suggestions: ['Try a more specific search term']
          },
          relatedQueries: []
        }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    
    // Default mock response for other API calls
    return Promise.resolve(new Response(JSON.stringify({
      success: true,
      data: null
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }
  
  return Promise.reject(new Error('Invalid URL'));
});

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: vi.fn(() => Promise.resolve(true)),
      replace: vi.fn(() => Promise.resolve(true)),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(() => Promise.resolve()),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
      isFallback: false,
    }
  }
}))

// Mock Next.js navigation (App Router)
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
  notFound: vi.fn(),
  redirect: vi.fn(),
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children)
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) =>
    React.createElement('img', { src, alt, ...props })
}))

// Mock environment variables
vi.mock('@/lib/config', () => ({
  config: {
    api: {
      baseUrl: 'http://localhost:3000',
      timeout: 5000,
    },
    features: {
      analytics: false,
      realtime: false,
    },
  },
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Setup and teardown
beforeAll(() => {
  // Global test setup
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

afterAll(() => {
  // Global test cleanup
})

// Test utilities export
export const createMockUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const createMockMemory = () => ({
  id: 'test-memory-id',
  title: 'Test Memory',
  content: 'Test memory content',
  tags: ['test', 'memory'],
  category: 'general',
  userId: 'test-user-id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Custom render function with providers
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { NotificationProvider } from '@/contexts/NotificationContext'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }