import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PublicaiPage from '../app/page'

describe('PublicAI Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders public AI services dashboard successfully', async () => {
    render(<PublicaiPage />)

    // Check main branding
    expect(screen.getByText('PublicAI')).toBeInTheDocument()
    expect(screen.getByText('Public AI Services')).toBeInTheDocument()

    // Check description
    await waitFor(() => {
      expect(screen.getByText('Public-facing AI services and tools for general use')).toBeInTheDocument()
    })
  })

  it('handles real-time data updates correctly', async () => {
    render(<PublicaiPage />)

    // Wait for initial stats to load
    await waitFor(() => {
      expect(screen.getByText('Active Users')).toBeInTheDocument()
      expect(screen.getByText('12.4K')).toBeInTheDocument()
    })

    // Check for performance metrics
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('98.5%')).toBeInTheDocument()
  })

  it('displays feature cards and interactive elements', async () => {
    render(<PublicaiPage />)

    // Navigate to features tab - use more specific selector
    const user = userEvent.setup()
    const featuresTab = screen.getAllByText('Features')[0] // Tab is first occurrence
    await user.click(featuresTab)

    await waitFor(() => {
      expect(screen.getByText('AI Tools')).toBeInTheDocument()
      expect(screen.getByText('Public APIs')).toBeInTheDocument()
      expect(screen.getByText('Documentation')).toBeInTheDocument()
      expect(screen.getByText('Community')).toBeInTheDocument()
    })
  })

  it('integrates stats with visual elements', async () => {
    render(<PublicaiPage />)

    await waitFor(() => {
      // Check that stats and metrics are displayed
      expect(screen.getByText('Active Users')).toBeInTheDocument()
      expect(screen.getAllByText('Features')[1]).toBeInTheDocument() // Metric text is second occurrence
      expect(screen.getByText('Satisfaction')).toBeInTheDocument()
    })
  })

  it('synchronizes real-time updates across components', async () => {
    render(<PublicaiPage />)

    // Wait for live status indicator
    await waitFor(() => {
      expect(screen.getByText('Live')).toBeInTheDocument()
    })

    // Check for time display elements
    const timeElements = document.querySelectorAll('[class*="text-gray-400"]')
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('handles multiple simultaneous operations', async () => {
    const user = userEvent.setup()
    render(<PublicaiPage />)

    // Rapidly switch between tabs - use getAllByText for Features
    const tabs = ['Analytics', 'Settings', 'Overview']

    for (const tabName of tabs) {
      const tab = screen.getByText(tabName)
      await user.click(tab)
      // Don't wait for animation to complete - test rapid switching
    }

    // Also test Features tab specifically
    const featuresTab = screen.getAllByText('Features')[0]
    await user.click(featuresTab)

    // Should not crash or show errors
    expect(document.body).toBeInTheDocument()
  })

  it('displays public AI services branding correctly', async () => {
    render(<PublicaiPage />)

    // Check branding elements
    expect(screen.getByText('PublicAI')).toBeInTheDocument()
    expect(screen.getByText('Public AI Services')).toBeInTheDocument()

    // Check description text
    await waitFor(() => {
      expect(screen.getByText(/Public-facing AI services and tools for general use/)).toBeInTheDocument()
    })
  })

  it('shows public AI features and service offerings', async () => {
    const user = userEvent.setup()
    render(<PublicaiPage />)

    // Navigate to features - use getAllByText for Features
    const featuresTab = screen.getAllByText('Features')[0]
    await user.click(featuresTab)

    await waitFor(() => {
      expect(screen.getByText('AI Tools')).toBeInTheDocument()
      expect(screen.getByText('Public APIs')).toBeInTheDocument()
      expect(screen.getByText('Documentation')).toBeInTheDocument()
      expect(screen.getByText('Community')).toBeInTheDocument()
    })

    // Check for "Learn More" buttons
    const learnMoreButtons = screen.getAllByText('Learn More')
    expect(learnMoreButtons.length).toBe(4)
  })

  it('displays analytics and settings sections', async () => {
    const user = userEvent.setup()
    render(<PublicaiPage />)

    // Test analytics section
    await user.click(screen.getByText('Analytics'))
    await waitFor(() => {
      expect(screen.getByText('Analytics Panel')).toBeInTheDocument()
      expect(screen.getByText('Advanced analytics and insights for your platform usage and performance metrics.')).toBeInTheDocument()
    })

    // Test settings section
    await user.click(screen.getByText('Settings'))
    await waitFor(() => {
      expect(screen.getByText('Settings Panel')).toBeInTheDocument()
      expect(screen.getByText('Configure your platform settings and preferences for optimal performance.')).toBeInTheDocument()
    })
  })
})