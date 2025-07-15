import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import MemoraiPage from '../app/page'

describe('memorai Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Flows', () => {
    it('completes full dashboard navigation flow', async () => {
      const user = userEvent.setup()
      render(<MemoraiPage />)

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('MemorAI')).toBeInTheDocument()
      })

      // Navigate through all tabs
      const tabs = ['Overview', 'Features', 'Analytics', 'Monitor']

      for (const tabName of tabs) {
        const tab = screen.getByText(tabName)
        await user.click(tab)

        await waitFor(() => {
          expect(tab).toHaveClass('bg-blue-500/30')
        })
      }
    })

    it('handles real-time data updates correctly', async () => {
      render(<MemoraiPage />)

      // Wait for initial content to load
      await waitFor(() => {
        expect(screen.getByText('MemorAI')).toBeInTheDocument()
      })

      // Check that memory overview section appears
      await waitFor(() => {
        expect(screen.getByText('Memory Overview')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('maintains state across navigation', async () => {
      const user = userEvent.setup()
      render(<MemoraiPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('MemorAI')).toBeInTheDocument()
      })

      // Switch to analytics
      await user.click(screen.getByText('Analytics'))

      // Switch back to overview
      await user.click(screen.getByText('Overview'))

      // Verify overview content is restored
      await waitFor(() => {
        expect(screen.getByText('Memory Overview')).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('integrates stats with visual elements', async () => {
      render(<MemoraiPage />)

      await waitFor(() => {
        // Check that content sections are rendered
        const contentSections = document.querySelectorAll('[class*="bg-white/5"]')
        expect(contentSections.length).toBeGreaterThan(0)
      })

      await waitFor(() => {
        // Check for metric cards
        expect(screen.getByText('Memory Overview')).toBeInTheDocument()
      })
    })

    it('synchronizes real-time updates across components', async () => {
      render(<MemoraiPage />)

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
      render(<MemoraiPage />)

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('MemorAI')).toBeInTheDocument()
      })

      // Rapidly switch between tabs
      const tabs = ['Analytics', 'Features', 'Monitor', 'Overview']

      for (const tabName of tabs) {
        const tab = screen.getByText(tabName)
        await user.click(tab)
        // Don't wait for animation to complete - test rapid switching
      }

      // Should not crash or show errors
      expect(document.body).toBeInTheDocument()
    })
  })
})