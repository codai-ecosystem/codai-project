import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}))

// Mock the complex components to focus on integration testing
vi.mock('../apps/web/components/GlassSearch', () => ({
  default: ({ placeholder, onSearch }: any) => (
    <div>
      <input placeholder={placeholder} data-testid="glass-search-input" />
      <button onClick={() => onSearch?.('test')}>Search</button>
    </div>
  )
}))

vi.mock('../apps/web/components/Header', () => ({
  default: ({ onLoginClick }: any) => (
    <header data-testid="header">
      <button onClick={onLoginClick}>Login</button>
    </header>
  )
}))

vi.mock('../apps/web/src/lib/logai', () => ({
  dexaiLogger: {
    log: vi.fn(),
    searchWord: vi.fn(),
  }
}))

// Import the component after mocks
const DexaiPage = React.lazy(() => import('../apps/web/app/page'))

describe('DEXAI Integration Tests - Romanian Dictionary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Dictionary User Flows', () => {
    it('displays main Romanian dictionary interface', async () => {
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <DexaiPage />
        </React.Suspense>
      )

      // Check for main dictionary title
      await waitFor(() => {
        expect(screen.getByText(/dicționarul/i)).toBeInTheDocument()
        expect(screen.getByText(/viitorului/i)).toBeInTheDocument()
      })

      // Check for search functionality
      expect(screen.getByTestId('glass-search-input')).toBeInTheDocument()
    })

    it('shows Romanian language statistics', async () => {
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <DexaiPage />
        </React.Suspense>
      )

      await waitFor(() => {
        // Check for Romanian language statistics
        expect(screen.getByText(/75,000\+/)).toBeInTheDocument()
        expect(screen.getByText(/24M\+/)).toBeInTheDocument()
        expect(screen.getByText(/500\+/)).toBeInTheDocument()
        expect(screen.getByText(/cuvinte în dex/i)).toBeInTheDocument()
        expect(screen.getByText(/vorbitori în lume/i)).toBeInTheDocument()
      })
    })

    it('displays AI technology features', async () => {
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <DexaiPage />
        </React.Suspense>
      )

      await waitFor(() => {
        expect(screen.getByText(/azure openai real/i)).toBeInTheDocument()
        expect(screen.getByText(/firebase live database/i)).toBeInTheDocument()
        expect(screen.getByText(/conturi utilizator reale/i)).toBeInTheDocument()
      })
    })

    it('shows example word definition for "acasă"', async () => {
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <DexaiPage />
        </React.Suspense>
      )

      await waitFor(() => {
        expect(screen.getByText('acasă')).toBeInTheDocument()
        expect(screen.getByText('adverb')).toBeInTheDocument()
        expect(screen.getByText(/la casa proprie/i)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Performance Validation', () => {
    it('shows search performance metrics', async () => {
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <DexaiPage />
        </React.Suspense>
      )

      await waitFor(() => {
        // Check for performance indicators
        expect(screen.getByText(/găsite/i)).toBeInTheDocument()
        expect(screen.getByText(/rezultate în/i)).toBeInTheDocument()
        expect(screen.getByText(/50/)).toBeInTheDocument()
        expect(screen.getByText(/ms/)).toBeInTheDocument()
      })
    })

    it('validates Romanian text rendering', async () => {
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <DexaiPage />
        </React.Suspense>
      )

      await waitFor(() => {
        // Check for proper Romanian diacritics and text
        expect(screen.getByText(/descoperiți frumusețea/i)).toBeInTheDocument()
        expect(screen.getByText(/realizat cu/i)).toBeInTheDocument()
        expect(screen.getByText(/pentru limba română/i)).toBeInTheDocument()
      })
    })

    it('displays animated background elements', async () => {
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <DexaiPage />
        </React.Suspense>
      )

      await waitFor(() => {
        // Check for animated background elements
        const animatedElements = document.querySelectorAll('.animate-float')
        expect(animatedElements.length).toBeGreaterThan(0)
      })
    })
  })
})