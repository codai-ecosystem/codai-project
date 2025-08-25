/**
 * AjutAI Page Component Tests
 * Testing main application pages and routing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import TicketsPage from '@/pages/TicketsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import { api } from '@/lib/api'

// Mock the API module
vi.mock('@/lib/api')
const mockedApi = vi.mocked(api)

// Test wrapper for components that need routing
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('AjutAI Page Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('HomePage', () => {
    it('renders welcome message and navigation', async () => {
      // Mock system health data
      mockedApi.getSystemHealth.mockResolvedValue({
        status: 'healthy',
        services: [
          { name: 'cbd-database', status: 'healthy' },
          { name: 'memorai-app', status: 'healthy' }
        ]
      })

      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      )

      expect(screen.getByText(/welcome to ajutai/i)).toBeInTheDocument()
      expect(screen.getByText(/intelligent customer support/i)).toBeInTheDocument()
      
      // Wait for health data to load
      await waitFor(() => {
        expect(screen.getByText(/system status/i)).toBeInTheDocument()
      })

      expect(mockedApi.getSystemHealth).toHaveBeenCalledOnce()
    })

    it('displays quick action buttons', () => {
      mockedApi.getSystemHealth.mockResolvedValue({
        status: 'healthy',
        services: []
      })

      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      )

      expect(screen.getByText(/create ticket/i)).toBeInTheDocument()
      expect(screen.getByText(/view analytics/i)).toBeInTheDocument()
      expect(screen.getByText(/search knowledge/i)).toBeInTheDocument()
    })

    it('handles system health errors gracefully', async () => {
      mockedApi.getSystemHealth.mockRejectedValue(new Error('API Error'))

      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/unable to load system status/i)).toBeInTheDocument()
      })
    })
  })

  describe('TicketsPage', () => {
    it('renders tickets list and controls', async () => {
      const mockTickets = [
        { id: 1, title: 'Login issue', status: 'open', priority: 'high', createdAt: '2025-08-23T09:00:00Z' },
        { id: 2, title: 'Feature request', status: 'closed', priority: 'low', createdAt: '2025-08-22T15:30:00Z' }
      ]

      mockedApi.getTickets.mockResolvedValue({
        tickets: mockTickets,
        total: 2
      })

      render(
        <RouterWrapper>
          <TicketsPage />
        </RouterWrapper>
      )

      expect(screen.getByText(/support tickets/i)).toBeInTheDocument()
      expect(screen.getByText(/create new ticket/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Login issue')).toBeInTheDocument()
        expect(screen.getByText('Feature request')).toBeInTheDocument()
      })

      expect(mockedApi.getTickets).toHaveBeenCalledWith({ page: 1, limit: 10 })
    })

    it('filters tickets by status', async () => {
      const user = userEvent.setup()
      mockedApi.getTickets.mockResolvedValue({ tickets: [], total: 0 })

      render(
        <RouterWrapper>
          <TicketsPage />
        </RouterWrapper>
      )

      const statusFilter = screen.getByLabelText(/filter by status/i)
      await user.selectOptions(statusFilter, 'open')

      expect(mockedApi.getTickets).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: 'open'
      })
    })

    it('opens create ticket modal', async () => {
      const user = userEvent.setup()
      mockedApi.getTickets.mockResolvedValue({ tickets: [], total: 0 })

      render(
        <RouterWrapper>
          <TicketsPage />
        </RouterWrapper>
      )

      const createButton = screen.getByText(/create new ticket/i)
      await user.click(createButton)

      expect(screen.getByText(/new ticket/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it('creates new ticket successfully', async () => {
      const user = userEvent.setup()
      mockedApi.getTickets.mockResolvedValue({ tickets: [], total: 0 })
      mockedApi.createTicket.mockResolvedValue({
        id: 3,
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'medium',
        status: 'open'
      })

      render(
        <RouterWrapper>
          <TicketsPage />
        </RouterWrapper>
      )

      // Open create modal
      await user.click(screen.getByText(/create new ticket/i))

      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'Test Ticket')
      await user.type(screen.getByLabelText(/description/i), 'Test Description')
      
      // Submit form
      await user.click(screen.getByText(/create ticket/i))

      expect(mockedApi.createTicket).toHaveBeenCalledWith({
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'medium'
      })
    })

    it('handles ticket creation errors', async () => {
      const user = userEvent.setup()
      mockedApi.getTickets.mockResolvedValue({ tickets: [], total: 0 })
      mockedApi.createTicket.mockRejectedValue(new Error('Creation failed'))

      render(
        <RouterWrapper>
          <TicketsPage />
        </RouterWrapper>
      )

      await user.click(screen.getByText(/create new ticket/i))
      await user.type(screen.getByLabelText(/title/i), 'Test Ticket')
      await user.click(screen.getByText(/create ticket/i))

      await waitFor(() => {
        expect(screen.getByText(/failed to create ticket/i)).toBeInTheDocument()
      })
    })
  })

  describe('AnalyticsPage', () => {
    it('renders analytics dashboard with metrics', async () => {
      const mockMetrics = {
        ticketsOpen: 15,
        ticketsResolved: 50,
        avgResponseTime: 2.5,
        customerSatisfaction: 4.6
      }

      mockedApi.getSupportMetrics.mockResolvedValue(mockMetrics)
      mockedApi.getActivityTimeline.mockResolvedValue([])

      render(
        <RouterWrapper>
          <AnalyticsPage />
        </RouterWrapper>
      )

      expect(screen.getByText(/support analytics/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText(/15/)).toBeInTheDocument() // Open tickets
        expect(screen.getByText(/50/)).toBeInTheDocument() // Resolved tickets
        expect(screen.getByText(/2.5 hours/i)).toBeInTheDocument() // Response time
        expect(screen.getByText(/4.6/)).toBeInTheDocument() // Satisfaction score
      })

      expect(mockedApi.getSupportMetrics).toHaveBeenCalledOnce()
      expect(mockedApi.getActivityTimeline).toHaveBeenCalledOnce()
    })

    it('displays activity timeline', async () => {
      const mockActivity = [
        { id: 1, type: 'ticket_created', timestamp: '2025-08-23T09:00:00Z', description: 'New ticket created' },
        { id: 2, type: 'ticket_resolved', timestamp: '2025-08-23T08:30:00Z', description: 'Ticket resolved' }
      ]

      mockedApi.getSupportMetrics.mockResolvedValue({
        ticketsOpen: 0,
        ticketsResolved: 0,
        avgResponseTime: 0,
        customerSatisfaction: 0
      })
      mockedApi.getActivityTimeline.mockResolvedValue(mockActivity)

      render(
        <RouterWrapper>
          <AnalyticsPage />
        </RouterWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/activity timeline/i)).toBeInTheDocument()
        expect(screen.getByText(/new ticket created/i)).toBeInTheDocument()
        expect(screen.getByText(/ticket resolved/i)).toBeInTheDocument()
      })
    })

    it('handles analytics data loading errors', async () => {
      mockedApi.getSupportMetrics.mockRejectedValue(new Error('Analytics API Error'))
      mockedApi.getActivityTimeline.mockRejectedValue(new Error('Timeline API Error'))

      render(
        <RouterWrapper>
          <AnalyticsPage />
        </RouterWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/failed to load analytics/i)).toBeInTheDocument()
      })
    })

    it('refreshes data when refresh button is clicked', async () => {
      const user = userEvent.setup()
      
      mockedApi.getSupportMetrics.mockResolvedValue({
        ticketsOpen: 10,
        ticketsResolved: 40,
        avgResponseTime: 2.0,
        customerSatisfaction: 4.5
      })
      mockedApi.getActivityTimeline.mockResolvedValue([])

      render(
        <RouterWrapper>
          <AnalyticsPage />
        </RouterWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/support analytics/i)).toBeInTheDocument()
      })

      const refreshButton = screen.getByText(/refresh/i)
      await user.click(refreshButton)

      expect(mockedApi.getSupportMetrics).toHaveBeenCalledTimes(2)
      expect(mockedApi.getActivityTimeline).toHaveBeenCalledTimes(2)
    })
  })

  describe('Page Navigation and Routing', () => {
    it('navigates between pages correctly', async () => {
      const user = userEvent.setup()
      
      // Mock all APIs
      mockedApi.getSystemHealth.mockResolvedValue({ status: 'healthy', services: [] })
      mockedApi.getTickets.mockResolvedValue({ tickets: [], total: 0 })
      mockedApi.getSupportMetrics.mockResolvedValue({
        ticketsOpen: 0,
        ticketsResolved: 0,
        avgResponseTime: 0,
        customerSatisfaction: 0
      })
      mockedApi.getActivityTimeline.mockResolvedValue([])

      render(
        <RouterWrapper>
          <div>
            <nav>
              <a href="/tickets">Tickets</a>
              <a href="/analytics">Analytics</a>
              <a href="/">Home</a>
            </nav>
            <HomePage />
          </div>
        </RouterWrapper>
      )

      // Should start on home page
      expect(screen.getByText(/welcome to ajutai/i)).toBeInTheDocument()

      // Navigation links should be present
      expect(screen.getByText(/tickets/i)).toBeInTheDocument()
      expect(screen.getByText(/analytics/i)).toBeInTheDocument()
    })
  })
})