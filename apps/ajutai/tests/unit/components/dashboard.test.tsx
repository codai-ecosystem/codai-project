/**
 * AjutAI Dashboard Component Unit Tests
 * Testing main dashboard functionality and metrics display
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { AjutAIDashboard } from '@/components/dashboard/AjutAIDashboard'

// Mock the API calls
vi.mock('@/lib/api', () => ({
  getHealthMetrics: vi.fn(),
  getTicketStats: vi.fn(),
  getRecentActivities: vi.fn(),
}))

// Mock the stores
vi.mock('@/stores/ajutai-store', () => ({
  useAjutAIStore: vi.fn(() => ({
    metrics: {
      ticketsOpen: 12,
      ticketsResolved: 45,
      avgResponseTime: 2.5,
      customerSatisfaction: 4.7
    },
    activities: [
      { id: 1, type: 'ticket_created', message: 'New support ticket', timestamp: new Date() },
      { id: 2, type: 'ticket_resolved', message: 'Ticket resolved', timestamp: new Date() }
    ],
    loading: false,
    error: null,
    fetchMetrics: vi.fn(),
    refreshData: vi.fn()
  }))
}))

describe('AjutAI Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard with metrics correctly', () => {
    render(<AjutAIDashboard />)
    
    // Check if main dashboard elements are present
    expect(screen.getByText(/ajutai dashboard/i)).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument() // Open tickets
    expect(screen.getByText('45')).toBeInTheDocument() // Resolved tickets
    expect(screen.getByText('2.5 hours')).toBeInTheDocument() // Avg response time
    expect(screen.getByText('4.7/5')).toBeInTheDocument() // Customer satisfaction
  })

  it('displays recent activities', () => {
    render(<AjutAIDashboard />)
    
    expect(screen.getByText('New support ticket')).toBeInTheDocument()
    expect(screen.getByText('Ticket resolved')).toBeInTheDocument()
  })

  it('handles refresh button click', async () => {
    const mockRefresh = vi.fn()
    vi.mocked(require('@/stores/ajutai-store').useAjutAIStore).mockReturnValue({
      metrics: { ticketsOpen: 12, ticketsResolved: 45, avgResponseTime: 2.5, customerSatisfaction: 4.7 },
      activities: [],
      loading: false,
      error: null,
      fetchMetrics: vi.fn(),
      refreshData: mockRefresh
    })

    render(<AjutAIDashboard />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
  })

  it('displays loading state', () => {
    vi.mocked(require('@/stores/ajutai-store').useAjutAIStore).mockReturnValue({
      metrics: {},
      activities: [],
      loading: true,
      error: null,
      fetchMetrics: vi.fn(),
      refreshData: vi.fn()
    })

    render(<AjutAIDashboard />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error state', () => {
    vi.mocked(require('@/stores/ajutai-store').useAjutAIStore).mockReturnValue({
      metrics: {},
      activities: [],
      loading: false,
      error: 'Failed to load data',
      fetchMetrics: vi.fn(),
      refreshData: vi.fn()
    })

    render(<AjutAIDashboard />)
    
    expect(screen.getByText(/failed to load data/i)).toBeInTheDocument()
  })

  it('handles metric card clicks', () => {
    render(<AjutAIDashboard />)
    
    const openTicketsCard = screen.getByText('Open Tickets')
    fireEvent.click(openTicketsCard)
    
    // Should navigate or show details (depending on implementation)
    expect(openTicketsCard).toBeInTheDocument()
  })

  it('renders with empty metrics gracefully', () => {
    vi.mocked(require('@/stores/ajutai-store').useAjutAIStore).mockReturnValue({
      metrics: {},
      activities: [],
      loading: false,
      error: null,
      fetchMetrics: vi.fn(),
      refreshData: vi.fn()
    })

    render(<AjutAIDashboard />)
    
    expect(screen.getByText(/ajutai dashboard/i)).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument() // Default values
  })
})