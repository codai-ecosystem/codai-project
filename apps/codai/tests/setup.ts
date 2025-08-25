import { beforeAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Global test setup
beforeAll(() => {
  // Setup global mocks
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => { },
      removeListener: () => { },
      addEventListener: () => { },
      removeEventListener: () => { },
      dispatchEvent: () => { },
    }),
  })

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: class IntersectionObserver {
      constructor() { }
      observe() { }
      unobserve() { }
      disconnect() { }
    },
  })

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: class ResizeObserver {
      constructor() { }
      observe() { }
      unobserve() { }
      disconnect() { }
    },
  })

  // Mock fetch
  global.fetch = fetch

  // Mock localStorage
  const localStorageMock = {
    getItem: (key: string) => null,
    setItem: (key: string, value: string) => { },
    removeItem: (key: string) => { },
    clear: () => { },
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
  })

  // Mock crypto
  Object.defineProperty(window, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid',
      getRandomValues: (arr: any) => arr
    }
  })
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Helper functions for CODAI testing
export const createMockAuthUser = () => ({
  id: 'user-123',
  email: 'test@codai.dev',
  name: 'Test Developer',
  roles: ['developer', 'user'],
  permissions: ['read', 'write'],
  profile: {
    avatar: 'https://example.com/avatar.jpg',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'AI'],
    experience_level: 'senior'
  }
})

export const createMockProject = () => ({
  id: 'project-456',
  name: 'Test AI Project',
  description: 'Test project for CODAI platform',
  type: 'ai-development',
  status: 'active',
  technologies: ['React', 'Python', 'TensorFlow'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
})

export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))
