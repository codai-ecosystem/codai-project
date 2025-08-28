import { render, screen, fireEvent, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

// Test component to use the theme context
const TestThemeComponent = () => {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme()
  
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button onClick={toggleTheme} data-testid="toggle-theme">
        Toggle
      </button>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('provides default dark theme', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <TestThemeComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
  })

  it('provides default light theme', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestThemeComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
  })

  it('toggles theme correctly', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestThemeComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-theme'))
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('sets theme explicitly', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <TestThemeComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    
    act(() => {
      fireEvent.click(screen.getByTestId('set-light'))
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    
    act(() => {
      fireEvent.click(screen.getByTestId('set-dark'))
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('loads theme from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('light')

    render(
      <ThemeProvider defaultTheme="dark">
        <TestThemeComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme')
  })

  it('saves theme to localStorage when changed', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <TestThemeComponent />
      </ThemeProvider>
    )

    act(() => {
      fireEvent.click(screen.getByTestId('set-light'))
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('handles system theme preference', () => {
    // Mock system preference for dark mode
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(
      <ThemeProvider defaultTheme="system">
        <TestThemeComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
  })

  it('provides fallback theme when used outside provider', () => {
    // This test ensures the hook works even without provider (SSR scenario)
    render(<TestThemeComponent />)

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
  })
})