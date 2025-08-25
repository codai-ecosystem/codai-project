/**
 * BancAI Test Setup
 * Self-contained setup following 2025 best practices
 */

import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, vi, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with DOM testing matchers
expect.extend(matchers)

// Mock window objects needed for banking UI components
beforeAll(() => {
  // Mock window.matchMedia for responsive components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
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

  // Mock IntersectionObserver for banking dashboard components
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock ResizeObserver for financial charts
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock fetch for API calls
  global.fetch = vi.fn()

  // Mock localStorage for banking preferences
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  vi.stubGlobal('localStorage', localStorageMock)

  // Mock sessionStorage for session data
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  vi.stubGlobal('sessionStorage', sessionStorageMock)

  // Mock crypto for secure operations
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: vi.fn().mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256)
        }
        return array
      }),
    },
  })
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Banking-specific test utilities
export const createMockBankingUser = () => ({
  id: 'user-123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'customer',
  accounts: ['acc-1', 'acc-2'],
  isAuthenticated: true,
  preferences: {
    showBalances: true,
    currency: 'USD',
    notifications: true
  }
})

export const createMockAccount = (overrides = {}) => ({
  id: 'acc-1',
  name: 'Primary Checking',
  type: 'checking',
  balance: 15420.75,
  accountNumber: '****4521',
  status: 'active',
  currency: 'USD',
  lastTransaction: '2 hours ago',
  interestRate: 0.25,
  ...overrides
})

export const createMockTransaction = (overrides = {}) => ({
  id: 'txn-1',
  accountId: 'acc-1',
  type: 'debit',
  amount: 87.50,
  description: 'Grocery Shopping',
  category: 'Food & Dining',
  merchant: 'Whole Foods Market',
  date: '2025-08-06T10:30:00Z',
  status: 'completed',
  location: 'New York, NY',
  ...overrides
})

export const createMockAlert = (overrides = {}) => ({
  id: 'alert-1',
  type: 'info',
  title: 'Credit Card Payment Due',
  message: 'Your Platinum Credit Card payment of $284.25 is due in 3 days.',
  timestamp: '2025-08-06T12:00:00Z',
  actionLabel: 'Pay Now',
  actionUrl: '/payments',
  ...overrides
})

// Wait for next tick utility
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

// Banking-specific API response utilities
export const createMockBankingApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  json: async () => data,
  text: async () => JSON.stringify(data),
})
