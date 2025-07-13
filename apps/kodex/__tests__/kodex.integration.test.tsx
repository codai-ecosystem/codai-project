import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import KodexPage from '../src/app/page'

describe('KODEX Integration Tests - CodaiChain Protocol & Smart Contract Platform', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Flows', () => {
    it('renders dashboard with all metrics displayed', async () => {
      render(<KodexPage />)

      // Verify main heading
      await waitFor(() => {
        expect(screen.getByText('Kodex Dashboard')).toBeInTheDocument()
      })

      // Verify all metric cards are present
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Growth')).toBeInTheDocument()
      expect(screen.getByText('Revenue')).toBeInTheDocument()
      expect(screen.getByText('Rating')).toBeInTheDocument()
    })

    it('displays correct metric values', async () => {
      render(<KodexPage />)

      // Verify metric values are displayed
      await waitFor(() => {
        expect(screen.getByText('1250')).toBeInTheDocument() // Users
        expect(screen.getByText('12.5%')).toBeInTheDocument() // Growth
        expect(screen.getByText('$45000')).toBeInTheDocument() // Revenue
        expect(screen.getByText('4.8/5')).toBeInTheDocument() // Rating
      })
    })

    it('maintains proper grid layout structure', async () => {
      render(<KodexPage />)

      // Check grid container exists
      const gridContainer = document.querySelector('.grid.grid-cols-4.gap-4')
      expect(gridContainer).toBeInTheDocument()

      // Check all metric cards have proper styling
      const metricCards = document.querySelectorAll('.bg-white.p-4.rounded.shadow')
      expect(metricCards).toHaveLength(4)
    })
  })

  describe('Data Flow Integration', () => {
    it('integrates dashboard data with visual components', async () => {
      render(<KodexPage />)

      await waitFor(() => {
        // Verify that each metric card contains both label and value
        const usersCard = screen.getByText('Users').closest('div')
        expect(usersCard).toContainElement(screen.getByText('1250'))

        const growthCard = screen.getByText('Growth').closest('div')
        expect(growthCard).toContainElement(screen.getByText('12.5%'))

        const revenueCard = screen.getByText('Revenue').closest('div')
        expect(revenueCard).toContainElement(screen.getByText('$45000'))

        const ratingCard = screen.getByText('Rating').closest('div')
        expect(ratingCard).toContainElement(screen.getByText('4.8/5'))
      })
    })

    it('validates data consistency across components', async () => {
      render(<KodexPage />)

      // Check that numeric values are properly formatted
      await waitFor(() => {
        const numericElements = [
          screen.getByText('1250'),
          screen.getByText('12.5%'),
          screen.getByText('$45000'),
          screen.getByText('4.8/5')
        ]

        numericElements.forEach(element => {
          expect(element).toHaveClass('text-2xl')
        })
      })
    })
  })

  describe('Performance Integration', () => {
    it('renders dashboard components efficiently', async () => {
      const startTime = performance.now()

      render(<KodexPage />)

      await waitFor(() => {
        expect(screen.getByText('Kodex Dashboard')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Dashboard should render within reasonable time
      expect(renderTime).toBeLessThan(1000)
    })
  })
})