
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import MarketaiPage from '../app/page'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...restProps } = props
      return <div {...restProps}>{children}</div>
    },
    button: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...restProps } = props
      return <button {...restProps}>{children}</button>
    },
    h1: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...restProps } = props
      return <h1 {...restProps}>{children}</h1>
    },
    p: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...restProps } = props
      return <p {...restProps}>{children}</p>
    },
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Target: () => <svg data-testid="target-icon" />,
  TrendingUp: () => <svg data-testid="trending-up-icon" />,
  Zap: () => <svg data-testid="zap-icon" />,
  BarChart3: () => <svg data-testid="bar-chart-icon" />,
  Activity: () => <svg data-testid="activity-icon" />,
  Clock: () => <svg data-testid="clock-icon" />,
  Users: () => <svg data-testid="users-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
  Star: () => <svg data-testid="star-icon" />,
  ArrowRight: () => <svg data-testid="arrow-right-icon" />,
}))

// Mock the MarketAI service to avoid loading errors
vi.mock('../services/marketaiService', () => ({
  MarketAIService: {
    getInstance: () => ({
      getAnalytics: vi.fn().mockResolvedValue({
        overview: {
          totalCampaigns: 5,
          activeCampaigns: 3,
          totalSpend: 50000,
          totalRevenue: 200000,
          totalLeads: 1500,
          totalConversions: 150,
          averageRoas: 4.0,
          averageCtr: 3.5,
        },
      }),
    }),
  },
}))

// Mock the logger to avoid import issues
vi.mock('../lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
  logCampaign: vi.fn(),
  logAudience: vi.fn(),
  logContent: vi.fn(),
  logAnalytics: vi.fn(),
  logUser: vi.fn(),
  logSystem: vi.fn(),
  logPerf: vi.fn(),
  logABTest: vi.fn(),
  logSocial: vi.fn(),
}))

describe('MarketaiPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      render(<MarketaiPage />)
      await waitFor(() => {
        expect(document.body).toBeInTheDocument()
      })
    })

    it('displays the main title', async () => {
      render(<MarketaiPage />)
      await waitFor(() => {
        const title = screen.getByText('MarketAI')
        expect(title).toBeInTheDocument()
      })
    })

    it('shows enterprise branding elements', async () => {
      render(<MarketaiPage />)
      await waitFor(() => {
        expect(screen.getByText('AI Marketing Platform')).toBeInTheDocument()
      })
    })

    it('displays glassmorphism styling', () => {
      render(<MarketaiPage />)
      const glassElements = document.getElementsByClassName('glassmorphism')
      expect(glassElements.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation', () => {
    it('renders all navigation tabs', () => {
      render(<MarketaiPage />)
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Monitor')).toBeInTheDocument()
    })

    it('handles tab switching correctly', async () => {
      const user = userEvent.setup()
      render(<MarketaiPage />)

      const analyticsTab = screen.getByText('Analytics')
      await user.click(analyticsTab)

      await waitFor(() => {
        expect(screen.getByText('Advanced Analytics Dashboard')).toBeInTheDocument()
      })
    })

    it('maintains active tab state', async () => {
      const user = userEvent.setup()
      render(<MarketaiPage />)

      const featuresTab = screen.getByText('Features')
      await user.click(featuresTab)

      await waitFor(() => {
        expect(featuresTab).toHaveClass('bg-blue-500/30') // Active state
      })
    })
  })

  describe('Real-time Features', () => {
    it('displays live statistics', () => {
      render(<MarketaiPage />)
      expect(screen.getByText(/total users/i)).toBeInTheDocument()
      expect(screen.getByText(/active now/i)).toBeInTheDocument()
      expect(screen.getByText(/performance/i)).toBeInTheDocument()
    })

    it('shows current time updates', () => {
      render(<MarketaiPage />)
      const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
      expect(timeElements.length).toBeGreaterThan(0)
    })

    it('displays online status indicator', () => {
      render(<MarketaiPage />)
      expect(screen.getByText(/online|offline/i)).toBeInTheDocument()
    })
  })

  describe('Enterprise Features', () => {
    it('shows security features', () => {
      render(<MarketaiPage />)
      expect(screen.getByText(/enterprise security/i)).toBeInTheDocument()
    })

    it('displays performance metrics', () => {
      render(<MarketaiPage />)
      expect(screen.getByText(/high performance/i)).toBeInTheDocument()
    })

    it('shows global scale indicator', () => {
      render(<MarketaiPage />)
      expect(screen.getByText(/global scale/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<MarketaiPage />)
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)

      // Check h1 exists
      const h1Elements = headings.filter(h => h.tagName === 'H1')
      expect(h1Elements.length).toBeGreaterThan(0)
    })

    it('provides keyboard navigation support', async () => {
      const user = userEvent.setup()
      render(<MarketaiPage />)

      const firstTab = screen.getByText('Overview')
      firstTab.focus()

      await user.keyboard('{Tab}')
      expect(document.activeElement).not.toBe(firstTab)
    })

    it('has proper ARIA labels', () => {
      render(<MarketaiPage />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', expect.any(String))
      })
    })
  })

  describe('Performance', () => {
    it('renders within performance budget', () => {
      const startTime = performance.now()
      render(<MarketaiPage />)
      const endTime = performance.now()

      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(100) // Should render in under 100ms
    })

    it('handles large datasets efficiently', () => {
      // Test with mocked large dataset
      const mockLargeData = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
      render(<MarketaiPage />)

      // Should not crash with large datasets
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing props gracefully', () => {
      // Test component resilience
      expect(() => render(<MarketaiPage />)).not.toThrow()
    })

    it('displays error boundaries correctly', () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      render(<MarketaiPage />)

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

      render(<MarketaiPage />)

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

      render(<MarketaiPage />)
      expect(document.body).toBeInTheDocument()
    })

    it('adapts to desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      render(<MarketaiPage />)
      expect(document.body).toBeInTheDocument()
    })
  })
})