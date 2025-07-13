import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SociAIPage from '../app/page'

// Mock framer-motion for testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children
}))

describe('SOCIAI Integration Tests - Real Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock Date for consistent time display
    const mockDate = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(mockDate)
  })

  it('renders main SOCIAI dashboard successfully', async () => {
    render(<SociAIPage />)

    // Verify main title and branding
    expect(screen.getByRole('heading', { name: 'SociAI' })).toBeInTheDocument()
    expect(screen.getByText('AI Social Platform')).toBeInTheDocument()

    // Verify navigation tabs are present
    expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Features' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Analytics' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  it('displays real social media metrics correctly', async () => {
    render(<SociAIPage />)

    // Check for actual metric values from the component
    expect(screen.getByText('12.4K')).toBeInTheDocument() // Active Users
    expect(screen.getByText('98.5%')).toBeInTheDocument() // Performance
    expect(screen.getByText('4')).toBeInTheDocument() // Features count
    expect(screen.getByText('4.9/5')).toBeInTheDocument() // Satisfaction

    // Verify metric descriptions using getAllByText for duplicates
    expect(screen.getAllByText('Active Users')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Performance')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Features')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Satisfaction')[0]).toBeInTheDocument()
  })

  it('handles tab navigation between different sections', async () => {
    render(<SociAIPage />)

    // Start with overview tab (default)
    expect(screen.getByText('Social media management and analytics with AI-powered insights')).toBeInTheDocument()

    // Click Features tab using role-based selector
    const featuresTab = screen.getByRole('button', { name: 'Features' })
    fireEvent.click(featuresTab)

    await waitFor(() => {
      expect(screen.getByText('Social Management')).toBeInTheDocument()
      expect(screen.getByText('Content AI')).toBeInTheDocument()
    })

    // Click Analytics tab using role-based selector
    const analyticsTab = screen.getByRole('button', { name: 'Analytics' })
    fireEvent.click(analyticsTab)

    await waitFor(() => {
      expect(screen.getByText('Analytics Panel')).toBeInTheDocument()
      expect(screen.getByText('Advanced analytics and insights for your platform usage and performance metrics.')).toBeInTheDocument()
    })
  })

  it('displays feature cards with proper status indicators', async () => {
    render(<SociAIPage />)

    // Navigate to features tab
    const featuresTab = screen.getByRole('button', { name: 'Features' })
    fireEvent.click(featuresTab)

    await waitFor(() => {
      // Check all feature cards are displayed
      expect(screen.getByText('Social Management')).toBeInTheDocument()
      expect(screen.getByText('Advanced social management capabilities with AI optimization')).toBeInTheDocument()

      expect(screen.getByText('Content AI')).toBeInTheDocument()
      expect(screen.getByText('Advanced content ai capabilities with AI optimization')).toBeInTheDocument()

      // Check for "Learn More" buttons
      const learnMoreButtons = screen.getAllByText('Learn More')
      expect(learnMoreButtons).toHaveLength(4)
    })
  })

  it('displays live status indicator correctly', async () => {
    render(<SociAIPage />)

    // Check for live status indicator
    expect(screen.getByText('Live')).toBeInTheDocument()

    // The time should be displayed in 24-hour format (12:30:00 due to timezone)
    expect(screen.getByText('12:30:00')).toBeInTheDocument()
  })

  it('measures component render performance', async () => {
    const startTime = performance.now()

    render(<SociAIPage />)

    // Verify key elements are rendered
    expect(screen.getByRole('heading', { name: 'SociAI' })).toBeInTheDocument()
    expect(screen.getByText('AI Social Platform')).toBeInTheDocument()

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Component should render within reasonable time (< 100ms)
    expect(renderTime).toBeLessThan(100)
  })
})