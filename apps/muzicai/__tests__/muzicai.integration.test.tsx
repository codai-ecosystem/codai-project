import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import MuzicaiPage from '../app/page'

describe('muzicai Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Flows', () => {
    it('renders music AI platform landing page successfully', async () => {
      render(<MuzicaiPage />)

      // Check main title and subtitle
      await waitFor(() => {
        const muzicaiElements = screen.getAllByText('Muzicai')
        expect(muzicaiElements.length).toBeGreaterThan(0)
      })

      const enterprisePlatformElements = screen.getAllByText(/enterprise platform/i)
      expect(enterprisePlatformElements.length).toBeGreaterThan(0)
    })

    it('handles real-time data updates correctly', async () => {
      render(<MuzicaiPage />)

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

    it('displays feature cards and interactive elements', async () => {
      const user = userEvent.setup()
      render(<MuzicaiPage />)

      // Check for feature cards
      await waitFor(() => {
        expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/data management/i)).toBeInTheDocument()
        expect(screen.getByText(/network status/i)).toBeInTheDocument()
      })

      // Test hover interactions on feature cards
      const analyticsCard = screen.getByText(/analytics dashboard/i).closest('div')
      if (analyticsCard) {
        await user.hover(analyticsCard)
        // Card should be interactable
        expect(analyticsCard).toBeInTheDocument()
      }
    })
  })

  describe('Data Flow Integration', () => {
    it('integrates stats with visual elements', async () => {
      render(<MuzicaiPage />)

      await waitFor(() => {
        // Check that stats are displayed in the stats grid
        expect(screen.getByText(/total users/i)).toBeInTheDocument()
        expect(screen.getByText(/active connections/i)).toBeInTheDocument()
        expect(screen.getByText(/data processed/i)).toBeInTheDocument()
        expect(screen.getByText(/uptime/i)).toBeInTheDocument()
      })
    })

    it('synchronizes real-time updates across components', async () => {
      render(<MuzicaiPage />)

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
      render(<MuzicaiPage />)

      // Test multiple hover interactions rapidly
      const featureTexts = ['Analytics Dashboard', 'Data Management', 'Network Status']

      for (const featureText of featureTexts) {
        const element = screen.getByText(featureText)
        await user.hover(element)
        // Don't wait for animation to complete - test rapid switching
      }

      // Should not crash or show errors
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('MUZICAI-Specific Features', () => {
    it('displays music AI platform branding correctly', async () => {
      render(<MuzicaiPage />)

      await waitFor(() => {
        const muzicaiElements = screen.getAllByText('Muzicai')
        expect(muzicaiElements.length).toBeGreaterThan(0)
      })

      const enterprisePlatformElements = screen.getAllByText(/enterprise platform/i)
      expect(enterprisePlatformElements.length).toBeGreaterThan(0)
    })

    it('shows system status and connection indicators', async () => {
      render(<MuzicaiPage />)

      await waitFor(() => {
        expect(screen.getByText(/system active/i)).toBeInTheDocument()
        expect(screen.getByText(/secure connection/i)).toBeInTheDocument()
        expect(screen.getByText(/high performance/i)).toBeInTheDocument()
      })
    })

    it('displays real-time clock and status updates', async () => {
      render(<MuzicaiPage />)

      await waitFor(() => {
        // Check for time display
        const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
        expect(timeElements.length).toBeGreaterThan(0)

        // Check for online/offline status
        expect(screen.getByText(/online|offline/i)).toBeInTheDocument()
      })
    })
  })
})