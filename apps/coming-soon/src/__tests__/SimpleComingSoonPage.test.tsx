import { render, screen, waitFor, act } from '@testing-library/react'
import { SimpleComingSoonPage } from '@/components/pages/SimpleComingSoonPage'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the ChapterIntro component
vi.mock('@/components/chapters', () => ({
  ChapterIntro: ({ title, theme }: { title: string, theme: string }) => (
    <div data-testid="chapter-intro" data-theme={theme}>
      <h2>{title}</h2>
    </div>
  )
}))

describe('SimpleComingSoonPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renders loading state initially', () => {
    render(<SimpleComingSoonPage />)

    expect(screen.getByText('CODAI')).toBeInTheDocument()
    expect(screen.getByText('The AI Renaissance is Coming Soon')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('transitions from loading to main content', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(<SimpleComingSoonPage />)

    // Initially shows loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // Fast-forward timer
    act(() => {
      vi.advanceTimersByTime(1100)
    })

    // Wait for component to update
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    expect(consoleSpy).toHaveBeenCalledWith('SimpleComingSoonPage: Loading complete')
    consoleSpy.mockRestore()
  })

  it('renders main content with all sections', async () => {
    render(<SimpleComingSoonPage />)

    act(() => {
      vi.advanceTimersByTime(1100)
    })

    await waitFor(() => {
      // Hero section
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CODAI')
      expect(screen.getByText('Experience the future of AI-native development')).toBeInTheDocument()

      // Features
      expect(screen.getByText('AI-Native Development')).toBeInTheDocument()
      expect(screen.getByText('Intelligent Infrastructure')).toBeInTheDocument()
      expect(screen.getByText('Universal Integration')).toBeInTheDocument()

      // CTA section
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
      expect(screen.getByText('Notify Me')).toBeInTheDocument()

      // Chapter preview
      expect(screen.getByTestId('chapter-intro')).toBeInTheDocument()

      // Footer
      expect(screen.getByText(/© 2025 CODAI Ecosystem/)).toBeInTheDocument()
    })
  })

  it('renders with custom className', async () => {
    const customClass = 'custom-class'
    render(<SimpleComingSoonPage className={customClass} />)

    act(() => {
      vi.advanceTimersByTime(1100)
    })

    await waitFor(() => {
      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass(customClass)
    })
  })

  it('has proper accessibility attributes', async () => {
    render(<SimpleComingSoonPage />)

    act(() => {
      vi.advanceTimersByTime(1100)
    })

    await waitFor(() => {
      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveAttribute('aria-label', 'CODAI Ecosystem Experience')
    })
  })

  it('renders email form elements', async () => {
    render(<SimpleComingSoonPage />)

    act(() => {
      vi.advanceTimersByTime(1100)
    })

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('Enter your email')
      const notifyButton = screen.getByText('Notify Me')

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(notifyButton).toHaveAttribute('type', 'button')
    })
  })

  it('renders ChapterIntro component with correct props', async () => {
    render(<SimpleComingSoonPage />)

    act(() => {
      vi.advanceTimersByTime(1100)
    })

    await waitFor(() => {
      const chapterIntro = screen.getByTestId('chapter-intro')
      expect(chapterIntro).toHaveAttribute('data-theme', 'intro')
      expect(screen.getByText('The AI Renaissance')).toBeInTheDocument()
    })
  })
})