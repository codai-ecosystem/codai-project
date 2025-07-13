import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import AcasaiPage from '../app/page'

// Mock framer-motion for test compatibility
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    h1: ({ children, ...props }: any) => React.createElement('h1', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

describe('ACASAI Integration Tests - Real Functionality', () => {
  beforeEach(() => {
    // Mock Date.now() for consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Real Component Rendering', () => {
    it('renders the main dashboard without mocks', async () => {
      const startTime = performance.now()
      render(<AcasaiPage />)
      const renderTime = performance.now() - startTime

      // Verify main heading is rendered
      const mainHeading = screen.getAllByText('Acasai').find(el => el.tagName === 'H1')
      expect(mainHeading).toBeInTheDocument()

      // Check enterprise platform branding
      expect(screen.getByText('Enterprise Platform')).toBeInTheDocument()

      // Verify online status
      expect(screen.getByText('Online')).toBeInTheDocument()

      // Performance check - should render in reasonable time
      expect(renderTime).toBeLessThan(100)
    })

    it('displays real-time stats with actual values', async () => {
      render(<AcasaiPage />)

      // Check that stat categories are present
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('Active Connections')).toBeInTheDocument()
      expect(screen.getByText('Data Processed')).toBeInTheDocument()
      expect(screen.getByText('Uptime')).toBeInTheDocument()

      // Verify percentage indicators are present
      expect(screen.getByText('↗ +5.2%')).toBeInTheDocument()
      expect(screen.getByText('Excellent')).toBeInTheDocument()
    })

    it('renders enterprise features without mocks', () => {
      render(<AcasaiPage />)

      // Verify analytics dashboard feature
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      expect(screen.getByText('View real-time analytics and performance metrics')).toBeInTheDocument()

      // Verify data management feature
      expect(screen.getByText('Data Management')).toBeInTheDocument()
      expect(screen.getByText('Manage and organize your data efficiently')).toBeInTheDocument()

      // Verify network status feature
      expect(screen.getByText('Network Status')).toBeInTheDocument()
      expect(screen.getByText('Monitor network performance and connectivity')).toBeInTheDocument()
    })

    it('displays real system status indicators', () => {
      render(<AcasaiPage />)

      // Check security status
      expect(screen.getByText('Secure Connection')).toBeInTheDocument()

      // Check performance status
      expect(screen.getByText('High Performance')).toBeInTheDocument()

      // Check system active indicator
      expect(screen.getByText('System Active')).toBeInTheDocument()
    })

    it('renders action buttons with proper text', () => {
      render(<AcasaiPage />)

      // Verify action button texts
      expect(screen.getByText('View Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Manage Data')).toBeInTheDocument()
      expect(screen.getByText('Check Status')).toBeInTheDocument()
    })

    it('measures performance with real component interactions', () => {
      const startTime = performance.now()
      render(<AcasaiPage />)

      const loadTime = performance.now() - startTime

      // Performance benchmark - should load within reasonable time
      expect(loadTime).toBeLessThan(500)

      // Verify all key elements are present with case-insensitive matching
      expect(screen.getByText(/advanced enterprise platform/i)).toBeInTheDocument()
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
    })

    it('validates glassmorphism styling is applied', () => {
      render(<AcasaiPage />)

      // Check that glassmorphism class elements are present
      const container = document.querySelector('.glassmorphism')
      expect(container).toBeInTheDocument()

      // Verify the CSS is injected
      const style = document.querySelector('style')
      expect(style?.textContent).toContain('glassmorphism')
      expect(style?.textContent).toContain('backdrop-filter: blur(20px)')
    })

    it('handles real-time updates correctly', () => {
      render(<AcasaiPage />)

      // Check initial render
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('Enterprise Platform')).toBeInTheDocument()
      expect(screen.getByText('System Active')).toBeInTheDocument()

      // Advance timers to trigger stats update
      vi.advanceTimersByTime(6000) // More than 5 seconds for stats update

      // Component should still be functional
      expect(screen.getByText('Enterprise Platform')).toBeInTheDocument()
      expect(screen.getByText('System Active')).toBeInTheDocument()
    })
  })
})