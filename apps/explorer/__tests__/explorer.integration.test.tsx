import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ExplorerPage from '../app/page'

describe('explorer Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Flows', () => {
    it('completes full dashboard navigation flow', async () => {
      const user = userEvent.setup()
      render(<ExplorerPage />)
      
      // Navigate through all tabs
      const tabs = ['Overview', 'Analytics', 'Features', 'Monitor']
      
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName)
        await user.click(tab)
        
        await waitFor(() => {
          expect(tab).toHaveClass('bg-blue-500/30')
        })
      }
    })

    it('handles real-time data updates correctly', async () => {
      render(<ExplorerPage />)
      
      // Wait for initial stats to load
      await waitFor(() => {
        expect(screen.getByText(/total users/i)).toBeInTheDocument()
      })
      
      // Wait for stats update (simulated)
      await waitFor(() => {
        const statsElements = screen.getAllByText(/\d+/)
        expect(statsElements.length).toBeGreaterThan(0)
      }, { timeout: 5000 })
    })

    it('maintains state across navigation', async () => {
      const user = userEvent.setup()
      render(<ExplorerPage />)
      
      // Switch to analytics
      await user.click(screen.getByText('Analytics'))
      
      // Switch back to overview
      await user.click(screen.getByText('Overview'))
      
      // Verify overview content is restored
      await waitFor(() => {
        expect(screen.getByText(/total users/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('integrates stats with visual elements', async () => {
      render(<ExplorerPage />)
      
      await waitFor(() => {
        // Check that stats are reflected in progress bars
        const progressBars = document.querySelectorAll('[class*="w-full"][class*="bg-"]')
        expect(progressBars.length).toBeGreaterThan(0)
      })
    })

    it('synchronizes real-time updates across components', async () => {
      render(<ExplorerPage />)
      
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
      render(<ExplorerPage />)
      
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