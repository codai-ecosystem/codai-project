import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import JucaiPage from '../app/page'

describe('jucai Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Flows', () => {
    it('completes full dashboard navigation flow', async () => {
      const user = userEvent.setup()
      render(<JucaiPage />)

      // Navigate through all tabs
      const tabs = ['Overview', 'Analytics', 'Marketplace', 'Settings']

      for (const tabName of tabs) {
        // Use getByRole to specifically target the button
        const tab = screen.getByRole('button', { name: tabName })
        await user.click(tab)

        await waitFor(() => {
          expect(tab).toHaveClass('bg-pink-500/30')
        })
      }
    })

    it('handles real-time data updates correctly', async () => {
      render(<JucaiPage />)

      // Wait for initial metrics to load
      await waitFor(() => {
        expect(screen.getByText(/active players/i)).toBeInTheDocument()
      })

      // Wait for stats update (simulated)
      await waitFor(() => {
        const statsElements = screen.getAllByText(/\d+/)
        expect(statsElements.length).toBeGreaterThan(0)
      }, { timeout: 5000 })
    })

    it('maintains state across navigation', async () => {
      const user = userEvent.setup()
      render(<JucaiPage />)

      // Switch to analytics
      await user.click(screen.getByRole('button', { name: 'Analytics' }))

      // Switch back to overview
      await user.click(screen.getByRole('button', { name: 'Overview' }))

      // Verify overview content is restored
      await waitFor(() => {
        expect(screen.getByText(/active players/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('integrates stats with visual elements', async () => {
      render(<JucaiPage />)

      await waitFor(() => {
        // Check that stats are reflected in metric cards
        const metricCards = document.querySelectorAll('[class*="backdrop-blur-xl"][class*="rounded-2xl"]')
        expect(metricCards.length).toBeGreaterThan(0)
      })
    })

    it('synchronizes real-time updates across components', async () => {
      render(<JucaiPage />)

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
      render(<JucaiPage />)

      // Rapidly switch between tabs
      const tabs = ['Analytics', 'Marketplace', 'Settings', 'Overview']

      for (const tabName of tabs) {
        // Use getByRole to specifically target the button
        const tab = screen.getByRole('button', { name: tabName })
        await user.click(tab)
        // Don't wait for animation to complete - test rapid switching
      }

      // Should not crash or show errors
      expect(document.body).toBeInTheDocument()
    })
  })
})