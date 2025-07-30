// Test setup for Frontend Architecture
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)

// Mock ResizeObserver
const mockResizeObserver = vi.fn()
mockResizeObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
vi.stubGlobal('ResizeObserver', mockResizeObserver)

// Mock MutationObserver
const mockMutationObserver = vi.fn()
mockMutationObserver.mockReturnValue({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(),
})
vi.stubGlobal('MutationObserver', mockMutationObserver)

// Mock requestAnimationFrame
vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
  return setTimeout(() => callback(Date.now()), 16)
})

vi.stubGlobal('cancelAnimationFrame', (id: number) => {
  clearTimeout(id)
})

// Mock requestIdleCallback
vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) => {
  return setTimeout(() => callback({
    didTimeout: false,
    timeRemaining: () => 50,
  } as IdleDeadline), 1)
})

vi.stubGlobal('cancelIdleCallback', (id: number) => {
  clearTimeout(id)
})

// Mock performance.memory (Chrome-specific)
Object.defineProperty(performance, 'memory', {
  value: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
  writable: false,
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
vi.stubGlobal('sessionStorage', sessionStorageMock)

// Mock matchMedia
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

// Console spy setup for development
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

// Global test utilities
global.testUtils = {
  // Utility to wait for next tick
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Utility to wait for RAF
  nextFrame: () => new Promise(resolve => requestAnimationFrame(resolve)),

  // Utility to simulate time passage
  advanceTime: (ms: number) => {
    vi.advanceTimersByTime(ms)
  },

  // Utility to mock component
  mockComponent: (name: string) => {
    return vi.fn().mockImplementation(({ children, ...props }) => {
      return createElement('div', { 'data-testid': name, ...props }, children)
    })
  },
}

// Extend global types for test utils
declare global {
  var testUtils: {
    nextTick: () => Promise<void>
    nextFrame: () => Promise<number>
    advanceTime: (ms: number) => void
    mockComponent: (name: string) => any
  }
}

export { }
