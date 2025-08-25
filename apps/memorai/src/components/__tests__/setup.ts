/**
 * Test Setup Configuration for MemorAI Components
 * Microsoft React Testing Best Practices Implementation
 * 
 * Features:
 * - Vitest-compatible setup with React Testing Library
 * - Custom accessibility matchers using axe-core directly
 * - SSR-safe browser API mocks
 * - Performance testing utilities
 * - TypeScript strict mode compliance
 */

import { beforeAll, afterEach, expect, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { configure } from '@testing-library/react'
import * as axeCore from 'axe-core'
// Import jest-dom matchers for Vitest
import '@testing-library/jest-dom'

// Configure React Testing Library for better accessibility testing
configure({
  testIdAttribute: 'data-testid',
  // Prefer accessible queries over data-testid
  defaultHidden: true,
})

// Global test setup
beforeAll(() => {
  // Mock browser APIs for SSR compatibility
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

  // Mock Clipboard API with configurable: true to allow userEvent redefinition
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    configurable: true, // Allow redefinition by userEvent
    value: {
      writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      readText: vi.fn().mockImplementation(() => Promise.resolve('')),
    },
  })

  // Mock getUserMedia for potential future camera/microphone features
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: vi.fn().mockImplementation(() => Promise.resolve({
        getTracks: () => [],
      })),
    },
  })

  // Mock Web Speech API for potential voice features
  global.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
    speaking: false,
    pending: false,
    paused: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as any

  // Mock requestAnimationFrame for animation testing
  global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16))
  global.cancelAnimationFrame = vi.fn()
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Custom accessibility matcher using axe-core directly
export const toBeAccessible = async (container: Element | null) => {
  if (!container) {
    return {
      pass: false,
      message: () => 'Container element is null or undefined',
    }
  }

  try {
    const results = await axeCore.run(container, {
      rules: {
        // Standard axe-core WCAG 2.1 AA compliance rules
        'color-contrast': { enabled: true },
        'landmark-unique': { enabled: true },
        'heading-order': { enabled: true },
        'button-name': { enabled: true },
        'link-name': { enabled: true },
        'image-alt': { enabled: true },
        'label': { enabled: true },
        'form-field-multiple-labels': { enabled: true },
        'aria-required-children': { enabled: true },
        'aria-required-parent': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'role-img-alt': { enabled: true },
        'scrollable-region-focusable': { enabled: true },
        'skip-link': { enabled: true },
      },
    })

    const violations = results.violations
    if (violations.length === 0) {
      return {
        pass: true,
        message: () => 'Element is accessible',
      }
    }

    const violationMessages = violations.map(
      violation => `${violation.id}: ${violation.description}`
    ).join('\n')

    return {
      pass: false,
      message: () => `Accessibility violations found:\n${violationMessages}`,
    }
  } catch (error) {
    return {
      pass: false,
      message: () => `Accessibility testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

// Extend Vitest expect with accessibility matcher
expect.extend({
  toBeAccessible,
})

// Type definitions for custom matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeAccessible(): Promise<any>
  }
  interface AsymmetricMatchersContaining {
    toBeAccessible(): any
  }
}

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now()
  renderFn()
  // Wait for React to complete render cycle
  await new Promise(resolve => setTimeout(resolve, 0))
  return performance.now() - start
}

// Mock data generators for testing
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: null,
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const createMockMemory = (overrides: Partial<any> = {}) => ({
  id: 'test-memory-1',
  title: 'Test Memory',
  content: 'This is a test memory content',
  tags: ['test', 'memory'],
  importance: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'test-user-1',
  ...overrides,
})

export const createMockSearchResult = (overrides: Partial<any> = {}) => ({
  id: 'test-result-1',
  title: 'Test Search Result',
  content: 'This is a test search result',
  relevance: 0.95,
  source: 'memory',
  ...overrides,
})