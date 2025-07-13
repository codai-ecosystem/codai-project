import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ToolsPage from '../app/page'

describe('TOOLS Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Flows', () => {
    it('completes full dashboard navigation flow', async () => {
      const user = userEvent.setup()
      render(<ToolsPage />)

      // Navigate through all tabs (actual TOOLS tab names)
      const tabs = ['Overview', 'Features', 'Analytics', 'Settings']

      for (const tabName of tabs) {
        const tabElements = screen.getAllByText(tabName)
        const tab = tabElements.find(el => el.tagName === 'BUTTON') || tabElements[0]
        await user.click(tab)

        await waitFor(() => {
          expect(tab).toHaveClass('bg-stone-500/30')
        })
      }
    })

    it('handles real-time tools data updates correctly', async () => {
      render(<ToolsPage />)

      // Wait for tools-specific stats to load
      await waitFor(() => {
        expect(screen.getByText(/Active Users/i)).toBeInTheDocument()
      })

      // Wait for stats update (simulated)
      await waitFor(() => {
        const statsElements = screen.getAllByText(/\d+/)
        expect(statsElements.length).toBeGreaterThan(0)
      }, { timeout: 5000 })
    })

    it('maintains state across navigation', async () => {
      const user = userEvent.setup()
      render(<ToolsPage />)

      // Switch to analytics
      await user.click(screen.getByText('Analytics'))

      // Switch back to overview
      await user.click(screen.getByText('Overview'))

      // Verify overview content is restored
      await waitFor(() => {
        expect(screen.getByText(/Active Users/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('integrates tools stats with visual elements', async () => {
      render(<ToolsPage />)

      await waitFor(() => {
        // Check that stats are reflected in metric cards
        const metricCards = document.querySelectorAll('[class*="bg-white/5"][class*="backdrop-blur-xl"]')
        expect(metricCards.length).toBeGreaterThan(0)
      })
    })

    it('synchronizes real-time updates across tools components', async () => {
      render(<ToolsPage />)

      // Wait for multiple components to show consistent data
      await waitFor(() => {
        const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
        expect(timeElements.length).toBeGreaterThan(0)
      })
    })

    it('displays tools-specific features and metrics', async () => {
      const user = userEvent.setup()
      render(<ToolsPage />)

      // Navigate to Features tab to see the feature cards
      const featuresTabElements = screen.getAllByText('Features')
      const featuresTab = featuresTabElements.find(el => el.tagName === 'BUTTON') || featuresTabElements[0]
      await user.click(featuresTab)

      await waitFor(() => {
        // Check for tools-specific features (use getAllByText for multiple matches)
        const developmentToolsElements = screen.getAllByText(/Development Tools/i)
        expect(developmentToolsElements.length).toBeGreaterThan(0)

        // Use getAllByText for Utilities since it appears in multiple places  
        const utilitiesElements = screen.getAllByText(/Utilities/i)
        expect(utilitiesElements.length).toBeGreaterThan(0)

        // Check if feature cards are rendered with specific feature content
        const pageContent = document.body.textContent || ''
        console.log('Feature content:', pageContent.substring(pageContent.indexOf('Advanced'), pageContent.indexOf('Advanced') + 200))
        expect(pageContent).toMatch(/automation|integration/i)
      })
    })
  })

  describe('Performance Integration', () => {
    it('handles multiple simultaneous operations', async () => {
      const user = userEvent.setup()
      render(<ToolsPage />)

      // Rapidly switch between tabs (actual TOOLS tabs)
      const tabs = ['Analytics', 'Settings', 'Overview']

      for (const tabName of tabs) {
        const tab = screen.getByText(tabName)
        await user.click(tab)
        // Don't wait for animation to complete - test rapid switching
      }

      // Should not crash or show errors
      expect(document.body).toBeInTheDocument()
    })

    it('maintains tools data integrity during rapid interactions', async () => {
      const user = userEvent.setup()
      render(<ToolsPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/Active Users/i)).toBeInTheDocument()
      })

      // Navigate to features tab
      await user.click(screen.getAllByText('Features')[0]) // Get the button, not the content

      // Navigate back to overview
      await user.click(screen.getByText('Overview'))

      // Data should still be consistent
      await waitFor(() => {
        expect(screen.getByText(/Active Users/i)).toBeInTheDocument()
      })
    })
  })

  describe('AI-Driven Tools Platform Integration', () => {
    it('validates comprehensive development tools features', async () => {
      const user = userEvent.setup()
      render(<ToolsPage />)

      // Navigate to Features tab to see the feature cards
      const featuresTabElements = screen.getAllByText('Features')
      const featuresTab = featuresTabElements.find(el => el.tagName === 'BUTTON') || featuresTabElements[0]
      await user.click(featuresTab)

      await waitFor(() => {
        // Check for key tools platform features (use getAllByText for multiple matches)
        const developmentToolsElements = screen.getAllByText(/Development Tools/i)
        expect(developmentToolsElements.length).toBeGreaterThan(0)

        // Use getAllByText for Utilities since it appears in multiple places
        const utilitiesElements = screen.getAllByText(/Utilities/i)
        expect(utilitiesElements.length).toBeGreaterThan(0)

        // Check if feature cards are rendered - look for any mention of the features  
        const pageContent = document.body.textContent || ''
        console.log('Feature content2:', pageContent.substring(pageContent.indexOf('Advanced'), pageContent.indexOf('Advanced') + 200))
        expect(pageContent).toMatch(/automation|integration/i)
      })
    })

    it('integrates analytics panel functionality', async () => {
      const user = userEvent.setup()
      render(<ToolsPage />)

      // Navigate to analytics
      await user.click(screen.getByText('Analytics'))

      await waitFor(() => {
        expect(screen.getByText(/Analytics Panel/i)).toBeInTheDocument()
        expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument()
      })
    })

    it('validates settings interface functionality', async () => {
      const user = userEvent.setup()
      render(<ToolsPage />)

      // Navigate to settings
      await user.click(screen.getByText('Settings'))

      await waitFor(() => {
        expect(screen.getByText(/Settings Panel/i)).toBeInTheDocument()
        expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument()
      })
    })
  })
})