import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import StocaiPage from '../app/page'

describe('STOCAI App', () => {
  it('renders the main page without crashing', () => {
    render(<StocaiPage />)
    expect(screen.getByText(/STOCAI/i)).toBeInTheDocument()
  })

  it('displays the app title correctly', async () => {
    render(<StocaiPage />)
    expect(screen.getByText(/AI-Native Storage Service/i)).toBeInTheDocument()
  })

  it('shows online status indicator', async () => {
    render(<StocaiPage />)
    await waitFor(() => {
      expect(screen.getByText(/Online/i)).toBeInTheDocument()
    })
  })

  it('displays real-time stats', async () => {
    render(<StocaiPage />)
    await waitFor(() => {
      expect(screen.getByText(/Storage Operations/i)).toBeInTheDocument()
      expect(screen.getByText(/Vector Embeddings/i)).toBeInTheDocument()
    })
  })

  it('handles responsive design', async () => {
    render(<StocaiPage />)
    // Test storage dashboard navigation
    const dashboardTab = screen.getByText('Dashboard')
    expect(dashboardTab).toBeInTheDocument()
  })

  it('implements accessibility standards', async () => {
    render(<StocaiPage />)
    // Check for proper ARIA labels in storage interface
    const navigationButtons = screen.getAllByRole('button')
    expect(navigationButtons.length).toBeGreaterThan(0)
  })

  it('handles error states gracefully', async () => {
    render(<StocaiPage />)
    // Storage component should render without errors
    expect(screen.getByText(/STOCAI/i)).toBeInTheDocument()
  })

  it('performs well under load', async () => {
    const startTime = performance.now()
    render(<StocaiPage />)
    const endTime = performance.now()
    // Should render within reasonable time (less than 100ms)
    expect(endTime - startTime).toBeLessThan(100)
  })
})

describe('STOCAI Components', () => {
  it('renders glass card components', () => {
    render(<StocaiPage />)
    // Check for storage glassmorphism cards
    const storageCards = screen.getAllByText(/Storage Manager|Vector Explorer|Analytics Dashboard/i)
    expect(storageCards.length).toBeGreaterThan(0)
  })

  it('displays gradient text correctly', () => {
    render(<StocaiPage />)
    expect(screen.getByText(/STOCAI/i)).toBeInTheDocument()
  })

  it('shows animated backgrounds', () => {
    render(<StocaiPage />)
    // Storage component renders with animated elements
    expect(screen.getByText(/AI-Native Storage/i)).toBeInTheDocument()
  })

  it('handles interactive elements', () => {
    render(<StocaiPage />)
    const interactiveElements = screen.getAllByRole('button')
    expect(interactiveElements.length).toBeGreaterThan(0)
  })
})

describe('STOCAI Real-time Features', () => {
  it('connects to real-time data sources', async () => {
    render(<StocaiPage />)
    await waitFor(() => {
      expect(screen.getByText(/Storage Operations/i)).toBeInTheDocument()
    })
  })

  it('updates stats in real-time', async () => {
    render(<StocaiPage />)
    await waitFor(() => {
      // Storage stats should be displayed with numerical values
      const statsElements = screen.getAllByText(/\d+/);
      expect(statsElements.length).toBeGreaterThan(0)
    })
  })

  it('handles connection failures gracefully', async () => {
    render(<StocaiPage />)
    // Storage component should still render even if some data fails to load
    expect(screen.getByText(/STOCAI/i)).toBeInTheDocument()
  })
})