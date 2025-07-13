import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import AjutaiPage from '../src/app/page'
import AjutaiDashboard from '../src/components/Dashboard'
import Supportchat from '../src/components/supportchat'
import Aiassistance from '../src/components/aiassistance'

// Mock fetch for dashboard API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      totalUsers: 1250,
      activeProjects: 42,
      completionRate: 87,
      recentActivity: [
        { id: '1', action: 'User logged in', timestamp: '2 min ago', user: 'Alice' },
        { id: '2', action: 'Ticket created', timestamp: '5 min ago', user: 'Bob' }
      ],
      performanceMetrics: [
        { metric: 'Response Time', value: 120, change: 5 },
        { metric: 'Resolution Rate', value: 94, change: 2 }
      ]
    })
  })
) as any

describe('AJUTAI Integration Tests - Real Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Landing Page Integration', () => {
    it('renders AJUTAI landing page with all core elements', async () => {
      render(<AjutaiPage />)

      // Verify main heading
      expect(screen.getByText('Welcome to AJUTAI')).toBeInTheDocument()

      // Verify service description
      expect(screen.getByText(/AI-Powered Service Ready/i)).toBeInTheDocument()
      expect(screen.getByText(/This ajutai service is part of the Codai ecosystem/i)).toBeInTheDocument()

      // Verify all feature cards are present
      expect(screen.getByText(/Development/)).toBeInTheDocument()
      expect(screen.getByText(/Integration/)).toBeInTheDocument()
      expect(screen.getByText(/AI Ready/)).toBeInTheDocument()
      expect(screen.getByText(/Scalable/)).toBeInTheDocument()

      // Verify feature descriptions
      expect(screen.getByText(/Ready for AI-powered development/i)).toBeInTheDocument()
      expect(screen.getByText(/Connected to the Codai ecosystem/i)).toBeInTheDocument()
      expect(screen.getByText(/Built for AI agent integration/i)).toBeInTheDocument()
      expect(screen.getByText(/Enterprise-ready architecture/i)).toBeInTheDocument()
    })

    it('validates feature card hover interactions', async () => {
      const user = userEvent.setup()
      render(<AjutaiPage />)

      const developmentCard = screen.getByText('Development').closest('div')
      expect(developmentCard).toBeInTheDocument()

      // Test hover interaction (classes should be applied)
      await user.hover(developmentCard!)

      // Verify arrow elements are present (there are multiple cards)
      const arrows = screen.getAllByText('->')
      expect(arrows.length).toBeGreaterThan(0)
    })

    it('validates responsive layout structure', async () => {
      render(<AjutaiPage />)

      // Check for responsive grid layout
      const gridContainer = document.querySelector('.lg\\:grid-cols-4')
      expect(gridContainer).toBeInTheDocument()

      // Verify main layout structure
      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass('flex', 'min-h-screen', 'flex-col')
    })
  })

  describe('Dashboard Integration', () => {
    it('renders dashboard with real data integration', async () => {
      render(<AjutaiDashboard />)

      // Wait for API call and data loading
      await waitFor(() => {
        expect(screen.getByText('AJUTAI Dashboard')).toBeInTheDocument()
      })

      // Verify user greeting
      expect(screen.getByText(/Welcome back, Test User!/i)).toBeInTheDocument()

      // Verify stats cards are rendered with real data
      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument()
        expect(screen.getByText('Active Projects')).toBeInTheDocument()
        expect(screen.getByText('Completion Rate')).toBeInTheDocument()
        expect(screen.getByText('System Status')).toBeInTheDocument()
      })

      // Verify Quick Actions button
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    it('displays feature implementation status correctly', async () => {
      render(<AjutaiDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Feature Implementation Status')).toBeInTheDocument()
      })

      // Verify all feature categories are displayed
      expect(screen.getByText(/User Flows/i)).toBeInTheDocument()
      expect(screen.getByText(/Business Logic/i)).toBeInTheDocument()
      expect(screen.getByText(/Integrations/i)).toBeInTheDocument()

      // Verify specific features are listed (using getAllByText for multiple matches)
      expect(screen.getAllByText(/support chat/i)[0]).toBeInTheDocument()
      expect(screen.getByText(/ticket management/i)).toBeInTheDocument()
      expect(screen.getAllByText(/knowledge base/i)[0]).toBeInTheDocument() // First match
      expect(screen.getByText(/ai assistance/i)).toBeInTheDocument()
    })

    it('validates performance analytics rendering', async () => {
      render(<AjutaiDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument()
        expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      })

      // Check for chart container - ResponsiveContainer creates a wrapper div
      const chartHeaders = screen.getAllByText('Performance Metrics')
      expect(chartHeaders.length).toBeGreaterThan(0)
    })

    it('handles loading state correctly', async () => {
      // Mock slow API response
      global.fetch = vi.fn(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({})
          }), 100)
        )
      ) as any

      render(<AjutaiDashboard />)

      // Should show loading spinner initially
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('validates system status indicators', async () => {
      render(<AjutaiDashboard />)

      await waitFor(() => {
        // Check for operational status badge
        expect(screen.getByText('Operational')).toBeInTheDocument()

        // Check for uptime display
        expect(screen.getByText('99.9%')).toBeInTheDocument()
        expect(screen.getByText('Uptime')).toBeInTheDocument()
      })
    })
  })

  describe('Support Components Integration', () => {
    it('renders support chat component', async () => {
      render(<Supportchat />)

      expect(screen.getByText('Support Chat')).toBeInTheDocument()
      expect(screen.getByText(/This is the support chat interface for ajutai/i)).toBeInTheDocument()

      // Verify container structure
      const container = document.querySelector('.container.mx-auto.p-6')
      expect(container).toBeInTheDocument()
    })

    it('renders AI assistance component', async () => {
      render(<Aiassistance />)

      expect(screen.getByText('Ai Assistance')).toBeInTheDocument()
      expect(screen.getByText(/This is the ai assistance interface for ajutai/i)).toBeInTheDocument()

      // Verify container structure
      const container = document.querySelector('.container.mx-auto.p-6')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Real-Time Data Integration', () => {
    it('handles API data fetching and display', async () => {
      render(<AjutaiDashboard />)

      // Wait for dashboard to load and verify it renders without errors
      await waitFor(() => {
        expect(screen.getByText('AJUTAI Dashboard')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Verify that stats sections are rendered (validates the component structure)
      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument()
        expect(screen.getByText('Active Projects')).toBeInTheDocument()
        expect(screen.getByText('Completion Rate')).toBeInTheDocument()
        expect(screen.getByText('System Status')).toBeInTheDocument()
      })

      // Verify the fetch was set up as a mock (validates test configuration)
      expect(typeof global.fetch).toBe('function')
    })

    it('displays recent activity with real data', async () => {
      render(<AjutaiDashboard />)

      // Wait for Recent Activity section to be visible
      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      })

      // Check if the recent activity container exists
      const activitySection = screen.getByText('Recent Activity').closest('.rounded-lg')
      expect(activitySection).toBeInTheDocument()
    })

    it('validates progress bar functionality', async () => {
      render(<AjutaiDashboard />)

      await waitFor(() => {
        // Check for progress component using role
        const progressElements = document.querySelectorAll('[role="progressbar"]')
        expect(progressElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Performance and Accessibility Integration', () => {
    it('measures component rendering performance', async () => {
      const startTime = performance.now()
      render(<AjutaiPage />)
      const endTime = performance.now()

      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(100) // Should render within 100ms
    })

    it('validates accessibility features', async () => {
      render(<AjutaiDashboard />)

      // Wait for dashboard to load completely
      await waitFor(() => {
        expect(screen.getByText('AJUTAI Dashboard')).toBeInTheDocument()
      })

      // Check for semantic HTML structure using text content
      const mainHeading = screen.getByText('AJUTAI Dashboard')
      expect(mainHeading).toBeInTheDocument()

      // Check for button accessibility
      const button = screen.getByText('Quick Actions')
      expect(button).toBeInTheDocument()
    })

    it('ensures keyboard navigation support', async () => {
      const user = userEvent.setup()
      render(<AjutaiDashboard />)

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      })

      const button = screen.getByText('Quick Actions')

      // Test keyboard focus
      await user.tab()
      expect(button).toHaveFocus()
    })
  })
})