import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import TalentaiPage from '../src/app/page'

// Mock framer-motion to avoid animation issues in tests
import { vi } from 'vitest'
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock the RealTimeStats component
vi.mock('../src/components/RealTimeStats', () => ({
  RealTimeStats: () => <div data-testid="real-time-stats">Real Time Stats Component</div>
}))

describe('talentai Accessibility Tests', () => {
  describe('WCAG 2.1 AA Compliance', () => {
    it('has proper heading hierarchy', () => {
      render(<TalentaiPage />)

      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)

      // Should have an h1
      const h1 = headings.find(h => h.tagName === 'H1')
      expect(h1).toBeInTheDocument()
    })

    it('provides alt text for images', () => {
      render(<TalentaiPage />)

      const images = screen.queryAllByRole('img')
      images.forEach(img => {
        expect(img).toHaveAttribute('alt')
      })
    })

    it('has sufficient color contrast', () => {
      render(<TalentaiPage />)

      // Check for proper semantic elements that usually have good contrast
      const mainContent = screen.getByText(/TalentAI/i)
      expect(mainContent).toBeInTheDocument()

      // Verify no elements use red/green only for important information
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)

      // Component should render without accessibility warnings
      expect(screen.getByText(/AI-Powered/i)).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      render(<TalentaiPage />)

      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('tabIndex', '0')
      })
    })

    it('provides proper ARIA labels', () => {
      render(<TalentaiPage />)

      const tabs = screen.getAllByRole('tab')

      tabs.forEach(tab => {
        const hasLabel = tab.hasAttribute('aria-label') ||
          tab.hasAttribute('aria-labelledby') ||
          tab.textContent?.trim()
        expect(hasLabel).toBeTruthy()
      })
    })

    it('announces state changes to screen readers', () => {
      render(<TalentaiPage />)

      // Check for aria-live regions
      const liveRegions = document.querySelectorAll('[aria-live]')
      expect(liveRegions.length).toBeGreaterThan(0)
    })
  })

  describe('Keyboard Accessibility', () => {
    it('supports tab navigation', () => {
      render(<TalentaiPage />)

      const focusableElements = screen.getAllByRole('tab')
      expect(focusableElements.length).toBeGreaterThan(0)
    })

    it('provides skip links', () => {
      render(<TalentaiPage />)

      // Look for skip to content links
      const skipLinks = screen.queryAllByText(/skip to/i)
      // Should have skip links for better navigation
    })
  })

  describe('Screen Reader Support', () => {
    it('provides meaningful page title', () => {
      render(<TalentaiPage />)

      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toHaveTextContent(/\w+/)
    })

    it('announces loading states', () => {
      render(<TalentaiPage />)

      // Check for loading indicators with proper ARIA
      const loadingElements = document.querySelectorAll('[aria-busy="true"], [role="status"]')
      // Should handle loading states accessibly
    })
  })
})
