import '@testing-library/jest-dom'
import { expect, afterEach, vi, beforeAll } from 'vitest'

// Basic test environment setup without React Testing Library imports
beforeAll(() => {
  // Environment variables are set via vitest.config.ts env section
  global.process.env.NODE_ENV = 'test'
})

// Basic cleanup without React Testing Library
afterEach(() => {
  // Clean up any DOM changes manually if needed
  document.body.innerHTML = ''
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

// Mock IndexedDB for memory storage tests
const mockIDBFactory = {
  open: vi.fn().mockImplementation(() => ({
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: vi.fn(),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          get: vi.fn(),
          delete: vi.fn(),
          clear: vi.fn()
        }))
      }))
    }
  })),
  deleteDatabase: vi.fn()
}

Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: mockIDBFactory
})

// Mock localStorage for memory persistence
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: localStorageMock
})

// Mock Web Workers for memory processing
Object.defineProperty(window, 'Worker', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null,
    onerror: null
  }))
})

// Mock for memory-specific APIs
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('memory') || url.includes('embedding') || url.includes('search')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        success: true,
        data: {
          memories: [
            { id: '1', content: 'Test memory 1', embedding: new Array(1536).fill(0.1) },
            { id: '2', content: 'Test memory 2', embedding: new Array(1536).fill(0.2) }
          ],
          search: {
            query: 'test search',
            results: [
              { id: '1', content: 'Test memory 1', similarity: 0.95 }
            ]
          }
        }
      }),
      text: () => Promise.resolve('Memory API response')
    } as Response)
  }

  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve('Mock response')
  } as Response)
})
