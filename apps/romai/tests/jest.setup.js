// Vitest setup for ROMAI AGI testing
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { TextEncoder, TextDecoder } from 'util'

// Mock environment variables for testing
process.env.NEXT_PUBLIC_ROMAI_API_URL = 'http://localhost:6101'
process.env.NEXT_PUBLIC_ROMAI_ENV = 'test'
process.env.ROMAI_TEST_MODE = 'true'

// Romanian language test data setup
global.ROMANIAN_TEST_DATA = {
  culturalPhrases: [
    'La Mulți Ani!',
    'Sărbători fericite!',
    'A băga bățul prin gard',
    'Cât trăiești, înveți'
  ],
  mathematicalTerms: [
    'calculați', 'rezolvați', 'demonstrați', 'evaluați'
  ],
  diacritics: ['ă', 'â', 'î', 'ș', 'ț'],
  historicalFigures: [
    'Mihai Eminescu',
    'Ion Creangă', 
    'Nicolae Grigorescu',
    'George Enescu'
  ]
}

// Mock TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock IntersectionObserver for React components
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver for responsive components
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia for responsive testing
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

// Mock fetch for API testing
global.fetch = vi.fn()

// Romanian text processing utilities for testing
global.validateRomanianText = (text) => {
  const romanianDiacritics = /[ăâîșț]/g
  const matches = text.match(romanianDiacritics)
  return {
    hasDiacritics: matches !== null,
    diacriticsCount: matches ? matches.length : 0,
    isValidRomanian: matches !== null && matches.length > 0
  }
}

// AGI testing utilities
global.mockAGIResponse = (type, confidence = 0.95) => {
  const responses = {
    mathematical: {
      result: 42,
      confidence,
      reasoning: 'Calculul matematic este corect.',
      culturalContext: 'Romanian mathematical notation',
      processingTimeMs: 250
    },
    logical: {
      conclusion: 'Concluzia logică este validă',
      confidence,
      reasoningType: 'deductive',
      culturalContext: 'Romanian logical reasoning',
      processingTimeMs: 300
    },
    cultural: {
      analysis: 'Analiza culturală detaliată',
      confidence,
      culturalDepth: 'deep',
      historicalAccuracy: 0.92,
      processingTimeMs: 400
    }
  }
  return responses[type] || responses.mathematical
}

// Console warning suppression for tests
const originalWarn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalWarn.call(console, ...args)
}

// Error boundary for React component testing
global.ErrorBoundary = ({ children }) => {
  return children
}

// Mock localStorage for client-side testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock