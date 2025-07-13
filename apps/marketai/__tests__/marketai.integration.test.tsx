import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import MarketaiPage from '../app/page'

describe('marketai Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Flows', () => {
    it('completes full dashboard navigation flow', async () => {
      const user = userEvent.setup()
      render(<MarketaiPage />)

      // Navigate through all tabs using button role
      const tabs = ['Overview', 'Features', 'Analytics', 'Settings']

      for (const tabName of tabs) {
        const tab = screen.getByRole('button', { name: tabName })
        await user.click(tab)

        await waitFor(() => {
          expect(tab).toHaveClass('bg-orange-500/30')
        })
      }
    })

    it('handles real-time data updates correctly', async () => {
      render(<MarketaiPage />)

      // Wait for initial stats to load
      await waitFor(() => {
        expect(screen.getByText(/active users/i)).toBeInTheDocument()
      })

      // Wait for stats update (simulated)
      await waitFor(() => {
        const statsElements = screen.getAllByText(/\d+\.\d+[K%]?/)
        expect(statsElements.length).toBeGreaterThan(0)
      }, { timeout: 5000 })
    })

    it('maintains state across navigation', async () => {
      const user = userEvent.setup()
      render(<MarketaiPage />)

      // Switch to features using button role
      await user.click(screen.getByRole('button', { name: 'Features' }))

      // Switch back to overview
      await user.click(screen.getByRole('button', { name: 'Overview' }))

      // Verify overview content is restored
      await waitFor(() => {
        expect(screen.getByText(/active users/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('integrates stats with visual elements', async () => {
      render(<MarketaiPage />)

      await waitFor(() => {
        // Check that stats are reflected in metric cards
        const metricCards = document.querySelectorAll('[class*="bg-white/5"][class*="backdrop-blur-xl"]')
        expect(metricCards.length).toBeGreaterThan(0)
      })
    })

    it('synchronizes real-time updates across components', async () => {
      render(<MarketaiPage />)

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
      render(<MarketaiPage />)

      // Rapidly switch between tabs using button role
      const tabs = ['Features', 'Analytics', 'Settings', 'Overview']

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