import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AnalizaiPage from '../src/app/page'

// Real functionality integration tests for ANALIZAI - no mocks
describe('ANALIZAI Real Functionality Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders main dashboard without crashing', () => {
      render(<AnalizaiPage />)

      // Verify main title
      expect(screen.getByText('Analizai Dashboard')).toBeInTheDocument()
    })

    it('displays analytics metrics correctly', () => {
      render(<AnalizaiPage />)

      // Check for all the metrics displayed
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('1250')).toBeInTheDocument()

      expect(screen.getByText('Growth')).toBeInTheDocument()
      expect(screen.getByText('12.5%')).toBeInTheDocument()

      expect(screen.getByText('Revenue')).toBeInTheDocument()
      expect(screen.getByText('$45000')).toBeInTheDocument()

      expect(screen.getByText('Rating')).toBeInTheDocument()
      expect(screen.getByText('4.8/5')).toBeInTheDocument()
    })

    it('shows structured dashboard layout', () => {
      render(<AnalizaiPage />)

      // Check for main dashboard structure
      const title = screen.getByText('Analizai Dashboard')
      expect(title).toHaveClass('text-3xl', 'font-bold')

      // Check for metrics cards
      const userMetric = screen.getByText('1250')
      expect(userMetric).toHaveClass('text-2xl')
    })
  })

  describe('Real Component Functionality', () => {
    it('displays real metrics data', () => {
      render(<AnalizaiPage />)

      // Verify all metric values are displayed as expected
      const userCount = screen.getByText('1250')
      const growthRate = screen.getByText('12.5%')
      const revenue = screen.getByText('$45000')
      const rating = screen.getByText('4.8/5')

      expect(userCount).toBeInTheDocument()
      expect(growthRate).toBeInTheDocument()
      expect(revenue).toBeInTheDocument()
      expect(rating).toBeInTheDocument()
    })

    it('maintains consistent styling across metrics', () => {
      render(<AnalizaiPage />)

      // Check that all metrics have consistent styling
      const metricValues = screen.getAllByText(/^(1250|12\.5%|\$45000|4\.8\/5)$/)

      metricValues.forEach(metric => {
        expect(metric).toHaveClass('text-2xl')
      })
    })
  })

  describe('Performance and Stability', () => {
    it('renders within acceptable time', () => {
      const startTime = Date.now()
      render(<AnalizaiPage />)
      const endTime = Date.now()

      // Should render within 1 second
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('maintains component integrity on multiple renders', () => {
      // Render multiple times to test stability
      const { unmount } = render(<AnalizaiPage />)
      expect(screen.getByText('Analizai Dashboard')).toBeInTheDocument()

      unmount()

      render(<AnalizaiPage />)
      expect(screen.getByText('Analizai Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
    })

    it('handles component lifecycle correctly', () => {
      const { rerender } = render(<AnalizaiPage />)

      // Initial render
      expect(screen.getByText('Analizai Dashboard')).toBeInTheDocument()

      // Re-render
      rerender(<AnalizaiPage />)
      expect(screen.getByText('Analizai Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Revenue')).toBeInTheDocument()
    })
  })
})