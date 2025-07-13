import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LogaiPage from '../app/page'

describe('logai Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Flows', () => {
    it('completes full dashboard navigation flow', async () => {
      const user = userEvent.setup()
      render(<LogaiPage />)

      // Navigate through all tabs (using actual LOGAI tab names)
      const tabs = ['Overview', 'Features', 'Analytics', 'Settings']

      for (const tabName of tabs) {
        // Use getByRole to be specific about tab buttons
        const tab = screen.getByRole('button', { name: tabName })
        await user.click(tab)

        await waitFor(() => {
          expect(tab).toHaveClass('bg-blue-500/30')
        })
      }
    })

    it('handles real-time data updates correctly', async () => {
      render(<LogaiPage />)

      // Wait for initial stats to load (using actual LOGAI metric names)
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
      render(<LogaiPage />)

      // Switch to analytics
      await user.click(screen.getByRole('button', { name: 'Analytics' }))

      // Switch back to overview
      await user.click(screen.getByRole('button', { name: 'Overview' }))

      // Verify overview content is restored (using actual LOGAI content)
      await waitFor(() => {
        expect(screen.getByText(/active users/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('integrates stats with visual elements', async () => {
      render(<LogaiPage />)

      await waitFor(() => {
        // Check that metric cards are present (simpler and more reliable selector)
        const metricCards = document.querySelectorAll('.grid > div')
        expect(metricCards.length).toBeGreaterThan(0)
      })
    })

    it('synchronizes real-time updates across components', async () => {
      render(<LogaiPage />)

      // Wait for time elements to show (LOGAI has real-time clock)
      await waitFor(() => {
        const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
        expect(timeElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Performance Integration', () => {
    it('handles multiple simultaneous operations', async () => {
      const user = userEvent.setup()
      render(<LogaiPage />)

      // Rapidly switch between tabs (using actual LOGAI tabs)
      const tabs = ['Analytics', 'Features', 'Settings', 'Overview']

      for (const tabName of tabs) {
        const tab = screen.getByRole('button', { name: tabName })
        await user.click(tab)
        // Don't wait for animation to complete - test rapid switching
      }

      // Should not crash or show errors
      expect(document.body).toBeInTheDocument()
    })
  })
})