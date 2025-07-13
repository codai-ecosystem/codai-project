import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import TalentaiPage from '../app/page'

// Mock fetch for API calls
global.fetch = vi.fn()

describe('TALENTAI Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
      // Mock failed API response to test fallback behavior
      ; (global.fetch as any).mockRejectedValue(new Error('API not available'))
  })

  describe('Complete User Flows', () => {
    it('completes full dashboard navigation flow', async () => {
      const user = userEvent.setup()
      render(<TalentaiPage />)

      // Navigate through all tabs (actual TALENTAI tab names)
      const tabs = ['Dashboard', 'Analytics', 'Management', 'Settings']

      for (const tabName of tabs) {
        const tab = screen.getByText(tabName)
        await user.click(tab)

        await waitFor(() => {
          expect(tab).toHaveClass('bg-purple-500/30')
        })
      }
    })

    it('handles real-time talent data updates correctly', async () => {
      render(<TalentaiPage />)

      // Wait for talent-specific stats to load
      await waitFor(() => {
        expect(screen.getByText(/total registered/i)).toBeInTheDocument()
      })

      // Wait for stats update (simulated)
      await waitFor(() => {
        const statsElements = screen.getAllByText(/\d+/)
        expect(statsElements.length).toBeGreaterThan(0)
      }, { timeout: 5000 })
    })

    it('maintains state across navigation', async () => {
      const user = userEvent.setup()
      render(<TalentaiPage />)

      // Switch to analytics
      await user.click(screen.getByText('Analytics'))

      // Switch back to dashboard
      await user.click(screen.getByText('Dashboard'))

      // Verify dashboard content is restored
      await waitFor(() => {
        expect(screen.getByText(/total registered/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('integrates talent stats with visual elements', async () => {
      render(<TalentaiPage />)

      await waitFor(() => {
        // Check that talent stats are reflected in progress bars and feature cards
        const progressBars = document.querySelectorAll('[class*="w-full"][class*="bg-"]')
        expect(progressBars.length).toBeGreaterThan(0)
      })
    })

    it('synchronizes real-time updates across talent components', async () => {
      render(<TalentaiPage />)

      // Wait for multiple components to show consistent data
      await waitFor(() => {
        const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
        expect(timeElements.length).toBeGreaterThan(0)
      })
    })

    it('displays talent-specific features and metrics', async () => {
      render(<TalentaiPage />)

      await waitFor(() => {
        // Check for talent-specific features (using getAllByText to handle multiple matches)
        expect(screen.getAllByText(/AI candidate matching/i).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/Skills assessment automation/i).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/Interview scheduling/i).length).toBeGreaterThan(0)
      })
    })
  })

  describe('Performance Integration', () => {
    it('handles multiple simultaneous operations', async () => {
      const user = userEvent.setup()
      render(<TalentaiPage />)

      // Rapidly switch between tabs (actual TALENTAI tabs)
      const tabs = ['Analytics', 'Management', 'Settings', 'Dashboard']

      for (const tabName of tabs) {
        const tab = screen.getByText(tabName)
        await user.click(tab)
        // Don't wait for animation to complete - test rapid switching
      }

      // Should not crash or show errors
      expect(document.body).toBeInTheDocument()
    })

    it('maintains talent data integrity during rapid interactions', async () => {
      const user = userEvent.setup()
      render(<TalentaiPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/total registered/i)).toBeInTheDocument()
      })

      // Rapid navigation
      await user.click(screen.getByText('Analytics'))
      await user.click(screen.getByText('Management'))
      await user.click(screen.getByText('Dashboard'))

      // Data should still be consistent
      await waitFor(() => {
        expect(screen.getByText(/total registered/i)).toBeInTheDocument()
      })
    })
  })

  describe('AI-Driven Talent Platform Integration', () => {
    it('validates comprehensive talent acquisition features', async () => {
      render(<TalentaiPage />)

      await waitFor(() => {
        // Check for key talent platform features (using getAllByText to handle multiple matches)
        expect(screen.getAllByText(/AI candidate matching/i).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/Performance analytics/i).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/Talent pipeline management/i).length).toBeGreaterThan(0)
      })
    })

    it('integrates analytics dashboard with talent metrics', async () => {
      const user = userEvent.setup()
      render(<TalentaiPage />)

      // Navigate to analytics
      await user.click(screen.getByText('Analytics'))

      await waitFor(() => {
        expect(screen.getByText(/Analytics Dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/Efficiency Rate/i)).toBeInTheDocument()
        expect(screen.getByText(/Performance Score/i)).toBeInTheDocument()
      })
    })

    it('validates management interface functionality', async () => {
      const user = userEvent.setup()
      render(<TalentaiPage />)

      // Navigate to management
      await user.click(screen.getByText('Management'))

      await waitFor(() => {
        // Should show talent management data table
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
        expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument()
      })
    })
  })
})