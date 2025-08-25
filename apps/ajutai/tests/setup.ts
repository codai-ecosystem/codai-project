/**
 * AjutAI Test Setup
 * Global test configuration and mocks for AjutAI application
 */

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
vi.mock('next/config', () => ({
  default: () => ({
    publicRuntimeConfig: {
      apiUrl: 'http://localhost:4007/api'
    }
  })
}))

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  })
}))

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
    dispatchEvent: vi.fn()
  }))
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock fetch globally
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock window.scrollTo
window.scrollTo = vi.fn()

// Mock AjutAI API module
vi.mock('@/lib/api', () => ({
  api: {
    getSystemHealth: vi.fn(),
    runHealthCheck: vi.fn(),
    getTickets: vi.fn(),
    createTicket: vi.fn(),
    updateTicket: vi.fn(),
    deleteTicket: vi.fn(),
    getTicket: vi.fn(),
    searchKnowledgeBase: vi.fn(),
    createKnowledgeArticle: vi.fn(),
    getSupportMetrics: vi.fn(),
    getActivityTimeline: vi.fn()
  }
}))

// AjutAI-specific test utilities
export const ajutaiTestUtils = {
  createMockSupportTicket: () => ({
    id: 1,
    title: 'Test Support Ticket',
    description: 'Test ticket description',
    status: 'open' as const,
    priority: 'medium' as const,
    category: 'technical' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: null,
    customer: {
      id: 'customer-1',
      name: 'Test Customer',
      email: 'customer@example.com'
    }
  }),
  
  createMockHealthStatus: () => ({
    status: 'healthy' as const,
    services: [
      { name: 'cbd-database', status: 'healthy' as const },
      { name: 'memorai-app', status: 'healthy' as const },
      { name: 'romai-agi', status: 'healthy' as const }
    ],
    uptime: '99.9%',
    lastCheck: new Date().toISOString()
  }),
  
  createMockSupportMetrics: () => ({
    ticketsOpen: 15,
    ticketsResolved: 50,
    ticketsInProgress: 8,
    avgResponseTime: 2.5,
    customerSatisfaction: 4.6,
    resolutionRate: 85.2
  }),
  
  createMockKnowledgeArticle: () => ({
    id: 1,
    title: 'How to Reset Password',
    content: 'Step-by-step password reset instructions...',
    category: 'account' as const,
    tags: ['password', 'login', 'security'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Support Team'
  })
}
