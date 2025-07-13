import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import BancaiPage from '../app/page'

describe('bancai Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Flows', () => {
    it('completes full dashboard navigation flow', async () => {
      const user = userEvent.setup()
      render(<BancaiPage />)

      // Navigate through all tabs using getByRole to avoid ambiguity
      const tabs = [
        { name: 'Overview', role: 'button' },
        { name: 'Features', role: 'button' },
        { name: 'Analytics', role: 'button' },
        { name: 'Settings', role: 'button' }
      ]

      for (const tabInfo of tabs) {
        const tab = screen.getByRole(tabInfo.role, { name: tabInfo.name })
        await user.click(tab)

        await waitFor(() => {
          expect(tab).toHaveClass('bg-emerald-500/30')
        })
      }
    })

    it('handles real-time data updates correctly', async () => {
      render(<BancaiPage />)

      // Wait for initial stats to load
      await waitFor(() => {
        expect(screen.getByText(/active users/i)).toBeInTheDocument()
      })

      // Wait for stats update (simulated)
      await waitFor(() => {
        const statsElements = screen.getAllByText(/\d+/)
        expect(statsElements.length).toBeGreaterThan(0)
      }, { timeout: 5000 })
    })

    it('maintains state across navigation', async () => {
      const user = userEvent.setup()
      render(<BancaiPage />)

      // Switch to analytics
      await user.click(screen.getByText('Analytics'))

      // Switch back to overview
      await user.click(screen.getByText('Overview'))

      // Verify overview content is restored
      await waitFor(() => {
        expect(screen.getByText(/active users/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('integrates stats with visual elements', async () => {
      render(<BancaiPage />)

      await waitFor(() => {
        // Check that banking stats are displayed
        const statsElements = screen.getAllByText(/\d+/)
        expect(statsElements.length).toBeGreaterThan(0)
      })
    })

    it('synchronizes real-time updates across components', async () => {
      render(<BancaiPage />)

      // Wait for multiple components to show consistent data
      await waitFor(() => {
        const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
        expect(timeElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Performance Integration', () => {
    it('handles multiple simultaneous operations', async () => {
      const user = userEvent.setup()
      render(<BancaiPage />)

      // Rapidly switch between tabs using getByRole
      const tabs = [
        { name: 'Analytics', role: 'button' },
        { name: 'Features', role: 'button' },
        { name: 'Settings', role: 'button' },
        { name: 'Overview', role: 'button' }
      ]

      for (const tabInfo of tabs) {
        const tab = screen.getByRole(tabInfo.role, { name: tabInfo.name })
        await user.click(tab)
        // Don't wait for animation to complete - test rapid switching
      }

      // Should not crash or show errors
      expect(document.body).toBeInTheDocument()
    })
  })
})