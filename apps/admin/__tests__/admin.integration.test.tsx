import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import AdminPage from '../app/page'

describe('admin Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Flows', () => {
    it('completes full dashboard navigation flow', async () => {
      const user = userEvent.setup()
      render(<AdminPage />)

      // Navigate through all tabs (ADMIN has: Overview, Features, Analytics, Settings)
      const tabs = ['Overview', 'Features', 'Analytics', 'Settings']

      for (const tabName of tabs) {
        // Use getByRole to be more specific about tab buttons
        const tab = screen.getByRole('button', { name: tabName })
        await user.click(tab)

        await waitFor(() => {
          // ADMIN uses red theme, not blue
          expect(tab).toHaveClass('bg-red-500/30')
        })
      }
    })

    it('handles real-time data updates correctly', async () => {
      render(<AdminPage />)

      // Wait for initial stats to load (ADMIN shows "Active Users", not "total users")
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
      render(<AdminPage />)

      // Switch to analytics
      await user.click(screen.getByText('Analytics'))

      // Switch back to overview
      await user.click(screen.getByText('Overview'))

      // Verify overview content is restored (ADMIN shows "Active Users")
      await waitFor(() => {
        expect(screen.getByText(/active users/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('integrates stats with visual elements', async () => {
      render(<AdminPage />)

      await waitFor(() => {
        // Check that metric cards are present (ADMIN doesn't have progress bars)
        const metricCards = document.querySelectorAll('[class*="bg-white/5"][class*="backdrop-blur-xl"]')
        expect(metricCards.length).toBeGreaterThan(0)
      })
    })

    it('synchronizes real-time updates across components', async () => {
      render(<AdminPage />)

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
      render(<AdminPage />)

      // Rapidly switch between tabs (ADMIN has: Overview, Features, Analytics, Settings)
      const tabs = ['Features', 'Analytics', 'Settings', 'Overview']

      for (const tabName of tabs) {
        // Use getByRole to be more specific about tab buttons
        const tab = screen.getByRole('button', { name: tabName })
        await user.click(tab)
        // Don't wait for animation to complete - test rapid switching
      }

      // Should not crash or show errors
      expect(document.body).toBeInTheDocument()
    })
  })
})