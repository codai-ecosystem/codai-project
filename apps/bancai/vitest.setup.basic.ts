import '@testing-library/jest-dom'
import { expect, afterEach, vi, beforeAll } from 'vitest'

// Basic test environment setup without React Testing Library imports
beforeAll(() => {
  // Environment variables are set via vitest.config.ts env section
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
