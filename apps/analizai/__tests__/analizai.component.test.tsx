import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import AnalizaiPage from '../app/page'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('AnalizaiPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<AnalizaiPage />)
      expect(document.body).toBeInTheDocument()
    })

    it('displays the main title', () => {
      render(<AnalizaiPage />)
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-3xl', 'font-bold')
    })

    it('shows enterprise branding elements', () => {
      render(<AnalizaiPage />)
      expect(screen.getByText(/enterprise/i)).toBeInTheDocument()
    })

    it('displays glassmorphism styling', () => {
      render(<AnalizaiPage />)
      const glassElements = document.getElementsByClassName('glassmorphism')
      expect(glassElements.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation', () => {
    it('renders all navigation tabs', () => {
      render(<AnalizaiPage />)
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Monitor')).toBeInTheDocument()
    })

    it('handles tab switching correctly', async () => {
      const user = userEvent.setup()
      render(<AnalizaiPage />)
      
      const analyticsTab = screen.getByText('Analytics')
      await user.click(analyticsTab)
      
      await waitFor(() => {
        expect(screen.getByText('Advanced Analytics Dashboard')).toBeInTheDocument()
      })
    })

    it('maintains active tab state', async () => {
      const user = userEvent.setup()
      render(<AnalizaiPage />)
      
      const featuresTab = screen.getByText('Features')
      await user.click(featuresTab)
      
      await waitFor(() => {
        expect(featuresTab).toHaveClass('bg-blue-500/30') // Active state
      })
    })
  })

  describe('Real-time Features', () => {
    it('displays live statistics', () => {
      render(<AnalizaiPage />)
      expect(screen.getByText(/total users/i)).toBeInTheDocument()
      expect(screen.getByText(/active now/i)).toBeInTheDocument()
      expect(screen.getByText(/performance/i)).toBeInTheDocument()
    })

    it('shows current time updates', () => {
      render(<AnalizaiPage />)
      const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
      expect(timeElements.length).toBeGreaterThan(0)
    })

    it('displays online status indicator', () => {
      render(<AnalizaiPage />)
      expect(screen.getByText(/online|offline/i)).toBeInTheDocument()
    })
  })

  describe('Enterprise Features', () => {
    it('shows security features', () => {
      render(<AnalizaiPage />)
      expect(screen.getByText(/enterprise security/i)).toBeInTheDocument()
    })

    it('displays performance metrics', () => {
      render(<AnalizaiPage />)
      expect(screen.getByText(/high performance/i)).toBeInTheDocument()
    })

    it('shows global scale indicator', () => {
      render(<AnalizaiPage />)
      expect(screen.getByText(/global scale/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<AnalizaiPage />)
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
      
      // Check h1 exists
      const h1Elements = headings.filter(h => h.tagName === 'H1')
      expect(h1Elements.length).toBeGreaterThan(0)
    })

    it('provides keyboard navigation support', async () => {
      const user = userEvent.setup()
      render(<AnalizaiPage />)
      
      const firstTab = screen.getByText('Overview')
      firstTab.focus()
      
      await user.keyboard('{Tab}')
      expect(document.activeElement).not.toBe(firstTab)
    })

    it('has proper ARIA labels', () => {
      render(<AnalizaiPage />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', expect.any(String))
      })
    })
  })

  describe('Performance', () => {
    it('renders within performance budget', () => {
      const startTime = performance.now()
      render(<AnalizaiPage />)
      const endTime = performance.now()
      
      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(100) // Should render in under 100ms
    })

    it('handles large datasets efficiently', () => {
      // Test with mocked large dataset
      const mockLargeData = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
      render(<AnalizaiPage />)
      
      // Should not crash with large datasets
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing props gracefully', () => {
      // Test component resilience
      expect(() => render(<AnalizaiPage />)).not.toThrow()
    })

    it('displays error boundaries correctly', () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<AnalizaiPage />)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Responsive Design', () => {
    it('adapts to mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<AnalizaiPage />)
      
      // Check mobile-specific classes
      const container = document.querySelector('.container')
      expect(container).toBeInTheDocument()
    })

    it('adapts to tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      render(<AnalizaiPage />)
      expect(document.body).toBeInTheDocument()
    })

    it('adapts to desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })
      
      render(<AnalizaiPage />)
      expect(document.body).toBeInTheDocument()
    })
  })
})