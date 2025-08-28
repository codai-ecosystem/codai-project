import { render, screen, waitFor, act } from '@testing-library/react'
import { ComingSoonPage } from '@/components/pages/ComingSoonPage'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { MotionProvider } from '@/contexts/MotionContext'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock GSAP and ScrollTrigger
vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    ticker: {
      add: vi.fn(),
      remove: vi.fn(),
      lagSmoothing: vi.fn()
    }
  },
  ScrollTrigger: {
    create: vi.fn(),
    update: vi.fn()
  }
}))

// Mock Lenis dynamic import
vi.mock('lenis', () => ({
  default: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    raf: vi.fn(),
    on: vi.fn(),
    scrollTo: vi.fn()
  }))
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: 'en' }
  })
}))

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    mark: vi.fn(),
    measure: vi.fn()
  }
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider defaultTheme="dark">
    <MotionProvider>
      {children}
    </MotionProvider>
  </ThemeProvider>
)

describe('ComingSoonPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renders loading state initially', () => {
    render(
      <TestWrapper>
        <ComingSoonPage />
      </TestWrapper>
    )

    expect(screen.getByText('CODAI')).toBeInTheDocument()
    expect(screen.getByText('The AI Renaissance is Coming Soon')).toBeInTheDocument()
  })

  it('transitions from loading to main content', async () => {
    render(
      <TestWrapper>
        <ComingSoonPage />
      </TestWrapper>
    )

    // Initially shows loading state
    expect(screen.getByText('CODAI')).toBeInTheDocument()

    // Fast-forward timers to trigger failsafe
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    // Wait for component to update
    await waitFor(() => {
      expect(screen.queryByRole('main')).toBeInTheDocument()
    })
  })

  it('handles reduced motion preference', () => {
    // Mock window.matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    })

    render(
      <TestWrapper>
        <ComingSoonPage />
      </TestWrapper>
    )

    // Should not show loading state with reduced motion
    expect(screen.queryByRole('main')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    const customClass = 'custom-class'
    render(
      <TestWrapper>
        <ComingSoonPage className={customClass} />
      </TestWrapper>
    )

    act(() => {
      vi.advanceTimersByTime(3100)
    })

    waitFor(() => {
      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass(customClass)
    })
  })

  it('handles keyboard navigation', async () => {
    render(
      <TestWrapper>
        <ComingSoonPage />
      </TestWrapper>
    )

    act(() => {
      vi.advanceTimersByTime(3100)
    })

    await waitFor(() => {
      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveAttribute('tabIndex', '0')
    })
  })

  it('displays chapter navigation in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      configurable: true
    })

    render(
      <TestWrapper>
        <ComingSoonPage />
      </TestWrapper>
    )

    act(() => {
      vi.advanceTimersByTime(3100)
    })

    waitFor(() => {
      expect(screen.getByText(/Chapter:/)).toBeInTheDocument()
      expect(screen.getByText(/Progress:/)).toBeInTheDocument()
    })

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      configurable: true
    })
  })

  it('handles Lenis initialization failure gracefully', async () => {
    // Mock Lenis to throw an error
    vi.doMock('lenis', () => ({
      default: vi.fn().mockImplementation(() => {
        throw new Error('Lenis initialization failed')
      })
    }))

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <TestWrapper>
        <ComingSoonPage />
      </TestWrapper>
    )

    act(() => {
      vi.advanceTimersByTime(3100)
    })

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Lenis not available, falling back to native scroll'),
        expect.any(Error)
      )
    })

    consoleSpy.mockRestore()
  })

  it('renders accessibility attributes correctly', async () => {
    render(
      <TestWrapper>
        <ComingSoonPage />
      </TestWrapper>
    )

    act(() => {
      vi.advanceTimersByTime(3100)
    })

    await waitFor(() => {
      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveAttribute('aria-label', 'CODAI Ecosystem Experience')
    })
  })

  it('renders scroll progress component', async () => {
    render(
      <TestWrapper>
        <ComingSoonPage />
      </TestWrapper>
    )

    act(() => {
      vi.advanceTimersByTime(3100)
    })

    await waitFor(() => {
      // ScrollProgress component should be rendered
      const progressElement = screen.getByRole('main').querySelector('.fixed.top-0')
      expect(progressElement).toBeInTheDocument()
    })
  })
})