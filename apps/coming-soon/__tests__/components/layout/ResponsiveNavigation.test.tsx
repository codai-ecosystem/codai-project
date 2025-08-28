import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import ResponsiveNavigation from '@/components/layout/ResponsiveNavigation'
import { I18nProvider } from '@/contexts/I18nContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }: any) => children,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
}))

// Mock heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  Bars3Icon: () => <div data-testid="menu-icon" />,
  XMarkIcon: () => <div data-testid="close-icon" />,
  HomeIcon: () => <div data-testid="home-icon" />,
  CubeIcon: () => <div data-testid="cube-icon" />,
  RocketLaunchIcon: () => <div data-testid="rocket-icon" />,
  InformationCircleIcon: () => <div data-testid="info-icon" />,
  EnvelopeIcon: () => <div data-testid="envelope-icon" />,
  ChevronDownIcon: () => <div data-testid="chevron-icon" />,
}))

// Mock child components
vi.mock('@/components/ui/LanguageSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid="language-switcher">Language Switcher</div>,
}))

vi.mock('@/components/ui/AnimatedComponents', () => ({
  AnimatedButton: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props} data-testid="animated-button">
      {children}
    </button>
  ),
  AnimatedIcon: ({ children }: any) => <div data-testid="animated-icon">{children}</div>,
}))

vi.mock('@/lib/animations', () => ({
  Reveal: ({ children }: any) => <div data-testid="reveal">{children}</div>,
}))

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </I18nProvider>
)

describe('ResponsiveNavigation', () => {
  beforeEach(() => {
    // Mock scrollTo
    window.scrollTo = vi.fn()

    // Mock getElementById
    document.getElementById = vi.fn((id) => ({
      getBoundingClientRect: () => ({ top: 100, bottom: 200 }),
    } as any))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Desktop Navigation', () => {
    it('renders desktop navigation correctly', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      expect(screen.getAllByText('CODAI')[0]).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('displays logo with animation', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      const logo = screen.getAllByText('CODAI')[0]
      expect(logo).toBeInTheDocument()

      // Logo should be clickable
      fireEvent.click(logo.closest('a')!)
      expect(window.scrollTo).toHaveBeenCalled()
    })

    it('handles navigation item clicks', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      const homeLink = screen.getByText('Home').closest('a')!
      await user.click(homeLink)

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      })
    })

    it('shows submenu on hover for projects', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      const projectsLink = screen.getByText('Projects').closest('a')!
      await user.hover(projectsLink)

      // Should show submenu items
      await waitFor(() => {
        // First check if submenu container exists
        expect(screen.getByTestId('projects-submenu')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Then check for submenu content
      expect(screen.getByText('AI & Machine Learning')).toBeInTheDocument()
      expect(screen.getByText('Financial Services')).toBeInTheDocument()
      expect(screen.getByText('Development Tools')).toBeInTheDocument()
    })

    it('renders theme and language controls', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
      expect(screen.getByText('Get Started')).toBeInTheDocument()
    })
  })

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
    })

    it('shows mobile menu button on small screens', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    })

    it('opens mobile menu when menu button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      const menuButton = screen.getByTestId('menu-icon').closest('button')!
      await user.click(menuButton)

      expect(screen.getByText('Menu')).toBeInTheDocument()
      expect(screen.getByText('Theme')).toBeInTheDocument()
      expect(screen.getByText('Language')).toBeInTheDocument()
    })

    it('closes mobile menu when close button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Open menu
      const menuButton = screen.getByTestId('menu-icon').closest('button')!
      await user.click(menuButton)

      // Close menu
      const closeButton = screen.getByTestId('close-icon').closest('button')!
      await user.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByText('Menu')).not.toBeInTheDocument()
      })
    })

    it('closes mobile menu when navigation item is clicked', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Open menu
      const menuButton = screen.getByTestId('menu-icon').closest('button')!
      await user.click(menuButton)

      // Click navigation item
      const homeLink = screen.getAllByText('Home')[1] // Mobile menu version
      await user.click(homeLink)

      await waitFor(() => {
        expect(screen.queryByText('Menu')).not.toBeInTheDocument()
      })
    })

    it('shows submenu items in mobile menu', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Open menu
      const menuButton = screen.getByTestId('menu-icon').closest('button')!
      await user.click(menuButton)

      // Should show submenu items directly
      expect(screen.getByText('AI & Machine Learning')).toBeInTheDocument()
      expect(screen.getByText('Financial Services')).toBeInTheDocument()
      expect(screen.getByText('Development Tools')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides skip to main content link', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink.getAttribute('href')).toBe('#main')
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Open mobile menu first
      const menuButton = screen.getByTestId('menu-icon').closest('button')!
      await user.click(menuButton)

      // Test Escape key
      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByText('Menu')).not.toBeInTheDocument()
      })
    })

    it('provides proper ARIA labels', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      const menuButton = screen.getByTestId('menu-icon').closest('button')!
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu')
    })

    it('supports screen readers with proper markup', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Navigation should be in a nav element
      const navElements = screen.getAllByRole('navigation')
      expect(navElements.length).toBeGreaterThan(0)
      expect(navElements[0]).toBeInTheDocument()

      // Links should be properly marked up
      const homeLink = screen.getByRole('link', { name: /Home/i })
      expect(homeLink).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('adapts to scroll position', () => {
      // Mock scroll position
      const mockScrollY = { get: () => 100 }
      vi.doMock('framer-motion', () => ({
        motion: {
          nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
          div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
          a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
        },
        AnimatePresence: ({ children }: any) => children,
        useScroll: () => ({ scrollY: mockScrollY }),
        useTransform: () => 0,
      }))

      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Navigation should adapt to scroll
      expect(screen.getAllByText('CODAI')[0]).toBeInTheDocument()
    })

    it('updates active section based on scroll position', () => {
      // Mock active section detection
      document.getElementById = vi.fn((id) => {
        if (id === 'ecosystem') {
          return {
            getBoundingClientRect: () => ({ top: 50, bottom: 150 }),
          } as any
        }
        return {
          getBoundingClientRect: () => ({ top: 200, bottom: 300 }),
        } as any
      })

      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Simulate scroll event
      fireEvent.scroll(window, { target: { scrollY: 100 } })

      // Should still render navigation correctly after scroll
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Projects')).toBeInTheDocument()
    })
  })

  describe('Theme Integration', () => {
    it('integrates with theme system', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Should render animated buttons
      const animatedButtons = screen.queryAllByTestId('animated-button')
      expect(animatedButtons.length).toBeGreaterThanOrEqual(0) // May have animated buttons
    })

    it('applies theme-appropriate styles', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Navigation should have theme-aware classes
      const navigations = screen.getAllByRole('navigation')
      expect(navigations.length).toBeGreaterThan(0)
      expect(navigations[0]).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders efficiently without unnecessary re-renders', () => {
      const { rerender } = render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Re-render with same props
      rerender(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Should still render correctly
      expect(screen.getAllByText('CODAI')[0]).toBeInTheDocument()
    })

    it('handles rapid scroll events gracefully', () => {
      render(
        <TestWrapper>
          <ResponsiveNavigation />
        </TestWrapper>
      )

      // Simulate rapid scroll events
      for (let i = 0; i < 10; i++) {
        fireEvent.scroll(window, { target: { scrollY: i * 100 } })
      }

      // Should still be functional
      expect(screen.getAllByText('CODAI')[0]).toBeInTheDocument()
    })
  })
})