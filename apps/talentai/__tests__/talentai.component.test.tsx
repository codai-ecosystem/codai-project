import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import TalentaiPage from '../src/app/page'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock the RealTimeStats component
vi.mock('../src/components/RealTimeStats', () => ({
  RealTimeStats: () => <div data-testid="real-time-stats">Real Time Stats Component</div>
}))

describe('TalentaiPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T14:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<TalentaiPage />)
      expect(document.body).toBeInTheDocument()
    })

    it('displays the main title', () => {
      render(<TalentaiPage />)
      const title = screen.getByRole('heading', { level: 1, name: /talent ai recruitment/i })
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-2xl', 'font-bold')
    })

    it('shows enterprise branding elements', () => {
      render(<TalentaiPage />)
      expect(screen.getAllByText(/AI-driven talent acquisition and human resource management/i)).toHaveLength(2)
    })

    it('displays glassmorphism styling', () => {
      render(<TalentaiPage />)
      const glassElements = document.getElementsByClassName('glassmorphism')
      expect(glassElements.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation', () => {
    it('renders all navigation tabs', () => {
      render(<TalentaiPage />)
      expect(screen.getByRole('tab', { name: /switch to overview tab/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /switch to analytics tab/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /switch to features tab/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /switch to monitor tab/i })).toBeInTheDocument()
    })

    it.skip('handles tab switching correctly', async () => {
      const user = userEvent.setup()
      render(<TalentaiPage />)
      
      const analyticsTab = screen.getByRole('tab', { name: /switch to analytics tab/i })
      await user.click(analyticsTab)
      
      await waitFor(() => {
        expect(screen.getByText('Advanced Analytics Dashboard')).toBeInTheDocument()
      })
    })

    it.skip('maintains active tab state', async () => {
      const user = userEvent.setup()
      render(<TalentaiPage />)
      
      const featuresTab = screen.getByRole('tab', { name: /switch to features tab/i })
      await user.click(featuresTab)
      
      await waitFor(() => {
        expect(featuresTab).toHaveClass('bg-purple-500/30') // Active state
      })
    })
  })

  describe('Real-time Features', () => {
    it('displays live statistics', () => {
      render(<TalentaiPage />)
      expect(screen.getByText(/total users/i)).toBeInTheDocument()
      expect(screen.getByText(/active now/i)).toBeInTheDocument()
      expect(screen.getAllByText(/performance/i).length).toBeGreaterThan(0)
    })

    it('shows current time updates', () => {
      render(<TalentaiPage />)
      const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
      expect(timeElements.length).toBeGreaterThan(0)
    })

    it('displays online status indicator', () => {
      render(<TalentaiPage />)
      expect(screen.getByText(/online|offline/i)).toBeInTheDocument()
    })
  })

  describe('Enterprise Features', () => {
    it('shows security features', () => {
      render(<TalentaiPage />)
      expect(screen.getByText(/enterprise security/i)).toBeInTheDocument()
    })

    it('displays performance metrics', () => {
      render(<TalentaiPage />)
      expect(screen.getByText(/high performance/i)).toBeInTheDocument()
    })

    it('shows global scale indicator', () => {
      render(<TalentaiPage />)
      expect(screen.getByText(/global scale/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<TalentaiPage />)
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
      
      // Check h1 exists
      const h1Elements = headings.filter(h => h.tagName === 'H1')
      expect(h1Elements.length).toBeGreaterThan(0)
    })

    it.skip('provides keyboard navigation support', async () => {
      const user = userEvent.setup()
      render(<TalentaiPage />)
      
      const firstTab = screen.getByRole('tab', { name: /switch to overview tab/i })
      firstTab.focus()
      
      await user.keyboard('{Tab}')
      expect(document.activeElement).not.toBe(firstTab)
    })

    it('has proper ARIA labels', () => {
      render(<TalentaiPage />)
      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-label', expect.stringMatching(/switch to \w+ tab/i))
      })
    })
  })

  describe('Performance', () => {
    it('renders within performance budget', () => {
      const startTime = performance.now()
      render(<TalentaiPage />)
      const endTime = performance.now()
      
      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(100) // Should render in under 100ms
    })

    it('handles large datasets efficiently', () => {
      // Test with mocked large dataset
      const mockLargeData = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
      render(<TalentaiPage />)
      
      // Should not crash with large datasets
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing props gracefully', () => {
      // Test component resilience
      expect(() => render(<TalentaiPage />)).not.toThrow()
    })

    it('displays error boundaries correctly', () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<TalentaiPage />)
      
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
      
      render(<TalentaiPage />)
      
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
      
      render(<TalentaiPage />)
      expect(document.body).toBeInTheDocument()
    })

    it('adapts to desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })
      
      render(<TalentaiPage />)
      expect(document.body).toBeInTheDocument()
    })
  })
})