/**
 * 🧪 Modern React Testing Utilities for CODAI
 * Latest 2024-2025 best practices with React Testing Library v16.1.0
 * Based on Context7 MCP research and Microsoft Docs MCP guidelines
 */
import React from 'react'
import { render, RenderOptions, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, expect, describe, it, test, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'

// Mock QueryClient and MotionConfig for testing
const MockQueryClient = {
  QueryClient: function (options: any) {
    return {
      defaultOptions: options?.defaultOptions || {},
      logger: options?.logger || { log: () => { }, warn: () => { }, error: () => { } }
    }
  }
}

const MockQueryClientProvider = ({ children, client }: { children: React.ReactNode, client: any }) => (
  <div data-testid="query-provider">{children}</div>
)

const MockMotionConfig = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="motion-config">{children}</div>
)

// Create a test QueryClient with React 18+ compatibility and performance optimizations
const createTestQueryClient = () => MockQueryClient.QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0, // Modern replacement for cacheTime
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      networkMode: 'offlineFirst', // Modern best practice
    },
    mutations: {
      retry: false,
      networkMode: 'offlineFirst',
    },
  },
  logger: {
    log: () => { },
    warn: () => { },
    error: () => { },
  }
})

// Modern providers wrapper with error boundaries and accessibility testing
interface AllProvidersProps {
  children: React.ReactNode
  queryClient?: any
}

const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  queryClient
}) => {
  const client = React.useMemo(() => queryClient || createTestQueryClient(), [queryClient])

  return (
    <MockQueryClientProvider client={client}>
      <MockMotionConfig>
        <div role="main" aria-label="Test container">
          {children}
        </div>
      </MockMotionConfig>
    </MockQueryClientProvider>
  )
}

// Custom render function with modern patterns and user event setup
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: any
  initialEntries?: string[]
  user?: ReturnType<typeof userEvent.setup>
}

const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, user, ...renderOptions } = options

  // Setup user events with modern patterns
  const userEventInstance = user || userEvent.setup()

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllProviders queryClient={queryClient}>
      {children}
    </AllProviders>
  )

  return {
    user: userEventInstance,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: queryClient || createTestQueryClient(),
  }
}

// Modern mock data factories with TypeScript strict typing
export const mockUser = {
  id: 'user-123',
  email: 'test@codai.ro',
  name: 'Test User',
  avatar: '/test-avatar.jpg',
  role: 'user' as const,
} as const

export const mockProject = {
  id: 'project-123',
  name: 'Test Project',
  description: 'A test project for CODAI',
  status: 'active' as const,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-08-05'),
  userId: 'user-123',
} as const

export const mockAIInsight = {
  id: 'insight-123',
  type: 'opportunity' as const,
  title: 'Performance Optimization Opportunity',
  description: 'Your application could benefit from code splitting',
  impact: 'high' as const,
  confidence: 0.85,
  timestamp: new Date('2025-08-05'),
  actionable: true,
  category: 'performance' as const,
} as const

// Modern testing utilities with React 18+ patterns
export const waitForLoader = async () => {
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  }, { timeout: 3000 })
}

export const waitForElement = async (
  role: string,
  options?: { name?: string; timeout?: number }
) => {
  return await waitFor(() => {
    const element = options?.name
      ? screen.getByRole(role, { name: options.name })
      : screen.getByRole(role)
    expect(element).toBeInTheDocument()
    return element
  }, { timeout: options?.timeout || 3000 })
}

// Modern fetch mocking with Response constructor
export const mockFetch = (data: any, status = 200) => {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(data), {
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: { 'Content-Type': 'application/json' }
    })
  )
}

export const mockApiError = (message = 'API Error', status = 500) => {
  return vi.fn().mockRejectedValue(
    new Error(message, { cause: { status, statusText: message } })
  )
}

// Modern accessibility testing helpers
export const expectToBeAccessible = async (container: HTMLElement) => {
  // Check for basic ARIA compliance
  const buttons = container.querySelectorAll('button')
  buttons.forEach(button => {
    expect(button).toHaveAttribute('type')
  })

  const inputs = container.querySelectorAll('input')
  inputs.forEach(input => {
    expect(input).toHaveAccessibleName()
  })
}

// Export everything needed for modern testing
export * from '@testing-library/react'
export { renderWithProviders as render }
export { createTestQueryClient }
export { AllProviders }
export { userEvent }
export { screen, waitFor }
export { vi, expect, describe, it, test, beforeEach, afterEach, beforeAll, afterAll }

// Modern testing patterns and helpers
export const setupTest = () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
}

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => Promise<void> | void) => {
  const start = performance.now()
  await renderFn()
  const end = performance.now()
  return end - start
}

// Custom matchers for CODAI-specific testing
export const customMatchers = {
  toBeValidCODAIComponent: (received: HTMLElement) => {
    const hasProperStructure = received.getAttribute('data-testid')?.startsWith('codai-')
    const hasAccessibleName = received.hasAttribute('aria-label') || received.hasAttribute('aria-labelledby')

    return {
      message: () => `Expected element to be a valid CODAI component`,
      pass: hasProperStructure && hasAccessibleName,
    }
  }
}
