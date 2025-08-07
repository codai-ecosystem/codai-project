/**
 * 🧪 React Hook Testing Utilities for CODAI
 * Comprehensive setup for testing React components with hooks
 */
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'

// Create a test QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})

// All providers wrapper for testing
interface AllProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  queryClient = createTestQueryClient()
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="always">
        {children}
      </MotionConfig>
    </QueryClientProvider>
  )
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  initialEntries?: string[]
}

const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, ...renderOptions } = options

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllProviders queryClient={queryClient}>
      {children}
    </AllProviders>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: queryClient || createTestQueryClient(),
  }
}

// Mock data factories for consistent testing
export const mockUser = {
  id: 'user-123',
  email: 'test@codai.ro',
  name: 'Test User',
  avatar: '/test-avatar.jpg',
  role: 'user' as const,
}

export const mockProject = {
  id: 'project-123',
  name: 'Test Project',
  description: 'A test project for CODAI',
  status: 'active' as const,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-08-05'),
  userId: 'user-123',
}

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
}

// Utility functions for testing
export const waitForLoader = async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
}

export const mockFetch = (data: any, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

export const mockApiError = (message = 'API Error', status = 500) => {
  return vi.fn().mockRejectedValue({
    message,
    status,
    response: { status, statusText: message }
  })
}

// Export everything needed for testing
export * from '@testing-library/react'
export { renderWithProviders as render }
export { createTestQueryClient }
export { AllProviders }

// Re-export testing utilities
export { vi, expect, describe, it, test, beforeEach, afterEach } from 'vitest'
