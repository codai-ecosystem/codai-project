import '@testing-library/jest-dom'
import { expect, afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock console warnings in tests to reduce noise
const originalWarn = console.warn
const originalError = console.error

beforeEach(() => {
  console.warn = (...args: any[]) => {
    if (args[0]?.includes?.('React.createElement: type is invalid')) return
    if (args[0]?.includes?.('Warning: React.createElement')) return
    originalWarn(...args)
  }
  
  console.error = (...args: any[]) => {
    if (args[0]?.includes?.('Warning: React.createElement')) return
    if (args[0]?.includes?.('Invalid hook call')) return
    originalError(...args)
  }
})

afterEach(() => {
  console.warn = originalWarn
  console.error = originalError
})
