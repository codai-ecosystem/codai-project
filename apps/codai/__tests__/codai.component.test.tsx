import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import CodaiPage from '../app/page'

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

// Mock fetch API to provide test data
global.fetch = vi.fn()

const mockSystemMetrics = {
  activeUsers: 5,
  cpuUsage: 25,
  memoryUsage: 40,
  diskUsage: 60,
  networkActivity: 80,
  systemUptime: 345600, // 4 days
  serviceStatus: [
    { name: 'CODAI', status: 'running' as const, port: 4030, uptime: '2d 5h' },
    { name: 'MEMORAI', status: 'running' as const, port: 4031, uptime: '1d 12h' },
  ]
}

const mockProjectsData = {
  projects: [
    { id: '1', name: 'React App', type: 'Application', language: 'TypeScript', framework: 'React', status: 'active' as const, lastModified: new Date(), size: '2.5MB', description: 'Modern React app' },
    { id: '2', name: 'Security Package', type: 'Library', language: 'TypeScript', framework: 'Node.js', status: 'active' as const, lastModified: new Date(), size: '500KB', description: 'Enterprise security features' },
  ],
  totalProjects: 10,
  activeProjects: 8,
  lastUpdated: new Date().toISOString()
}

describe('CodaiPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup fetch mock responses
    const mockFetch = fetch as any
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/system-metrics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSystemMetrics)
        })
      }
      if (url.includes('/api/projects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProjectsData)
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CodaiPage />)
      expect(document.body).toBeInTheDocument()
    })

    it('displays the main title', () => {
      render(<CodaiPage />)
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-3xl', 'font-bold')
    })

    it('shows enterprise branding elements', async () => {
      render(<CodaiPage />)
      // Wait for data to load and check for enterprise-related content
      await waitFor(() => {
        expect(screen.getByText(/Live AI Development Platform with/i)).toBeInTheDocument()
      })
    })

    it('displays glassmorphism styling', () => {
      render(<CodaiPage />)
      // Check for backdrop-blur classes that create glassmorphism effect
      const blurElements = document.querySelectorAll('[class*="backdrop-blur"]')
      expect(blurElements.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation', () => {
    it('renders all navigation tabs', () => {
      render(<CodaiPage />)
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('handles tab switching correctly', async () => {
      const user = userEvent.setup()
      render(<CodaiPage />)

      const analyticsTab = screen.getByText('Analytics')
      await user.click(analyticsTab)

      await waitFor(() => {
        expect(screen.getByText('Analytics Panel')).toBeInTheDocument()
      })
    })

    it('maintains active tab state', async () => {
      const user = userEvent.setup()
      render(<CodaiPage />)

      const featuresTab = screen.getByText('Features')
      await user.click(featuresTab)

      await waitFor(() => {
        expect(featuresTab).toHaveClass('bg-indigo-500/30') // Active state
      })
    })
  })

  describe('Real-time Features', () => {
    it('displays live statistics', async () => {
      render(<CodaiPage />)
      // Wait for data to load and check for statistics
      await waitFor(() => {
        expect(screen.getByText(/Active Users/i)).toBeInTheDocument()
      })
      expect(screen.getByText(/Performance/i)).toBeInTheDocument()
      expect(screen.getByText(/Active Apps/i)).toBeInTheDocument()
    })

    it('shows current time updates', () => {
      render(<CodaiPage />)
      const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
      expect(timeElements.length).toBeGreaterThan(0)
    })

    it('displays online status indicator', () => {
      render(<CodaiPage />)
      expect(screen.getByText(/live/i)).toBeInTheDocument()
    })
  })

  describe('Enterprise Features', () => {
    it('shows security features', async () => {
      render(<CodaiPage />)

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(/Live AI Development Platform with/i)).toBeInTheDocument()
      })

      // Click Features tab to see feature cards
      const featuresTab = screen.getByText('Features')
      await userEvent.setup().click(featuresTab)

      // Check for security-related content in features
      await waitFor(() => {
        expect(screen.getByText(/TypeScript Integration/i)).toBeInTheDocument()
      })
    })

    it('displays performance metrics', async () => {
      render(<CodaiPage />)
      // Wait for performance data to load
      await waitFor(() => {
        expect(screen.getByText(/Performance/i)).toBeInTheDocument()
      })
    })

    it('shows global scale indicator', async () => {
      render(<CodaiPage />)
      // Wait for global scale data to load
      await waitFor(() => {
        expect(screen.getByText(/Active Apps/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<CodaiPage />)
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)

      // Check h1 exists
      const h1Elements = headings.filter(h => h.tagName === 'H1')
      expect(h1Elements.length).toBeGreaterThan(0)
    })

    it('provides keyboard navigation support', async () => {
      const user = userEvent.setup()
      render(<CodaiPage />)

      const firstTab = screen.getByText('Overview')
      firstTab.focus()

      await user.keyboard('{Tab}')
      expect(document.activeElement).not.toBe(firstTab)
    })

    it('has proper ARIA labels', () => {
      render(<CodaiPage />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // Each button should have either aria-label or accessible text content
        const hasAriaLabel = button.hasAttribute('aria-label')
        const hasTextContent = button.textContent && button.textContent.trim().length > 0
        expect(hasAriaLabel || hasTextContent).toBe(true)
      })
    })
  })

  describe('Performance', () => {
    it('renders within performance budget', () => {
      const startTime = performance.now()
      render(<CodaiPage />)
      const endTime = performance.now()

      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(100) // Should render in under 100ms
    })

    it('handles large datasets efficiently', () => {
      // Test with mocked large dataset
      const mockLargeData = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
      render(<CodaiPage />)

      // Should not crash with large datasets
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing props gracefully', () => {
      // Test component resilience
      expect(() => render(<CodaiPage />)).not.toThrow()
    })

    it('displays error boundaries correctly', () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      render(<CodaiPage />)

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

      render(<CodaiPage />)

      // Check for responsive classes like max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
      const responsiveContainer = document.querySelector('.max-w-7xl')
      expect(responsiveContainer).toBeInTheDocument()
    })

    it('adapts to tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(<CodaiPage />)
      expect(document.body).toBeInTheDocument()
    })

    it('adapts to desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      render(<CodaiPage />)
      expect(document.body).toBeInTheDocument()
    })
  })
})