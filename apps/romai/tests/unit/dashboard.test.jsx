/**
 * ROMAI Dashboard Component Tests
 * Tests the main dashboard component with Romanian theming and AGI integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import Dashboard from '@/app/dashboard/page'
import { ThemeProvider } from 'next-themes'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock the AGI server responses
global.fetch = jest.fn()

const mockAGIServerResponse = {
  status: 'healthy',
  capabilities: {
    mathematical: 85.2,
    logical: 78.9,
    cultural: 92.1,
    linguistic: 94.5,
    overall: 87.7
  },
  models: {
    loaded: 14,
    active: 14,
    total: 14
  },
  performance: {
    avgResponseTime: 245,
    requestsPerSecond: 125,
    memoryUsage: 78.5,
    cpuUsage: 65.2
  },
  culturalAnalysis: {
    romanianAccuracy: 96.8,
    culturalDepth: 'advanced',
    historicalKnowledge: 91.3,
    linguisticPrecision: 97.2
  }
}

// Mock localStorage for theme persistence
const localStorageMock = {
  getItem: jest.fn(() => 'light'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

describe('🎨 ROMAI Dashboard Component Tests', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch.mockClear()
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockAGIServerResponse
    })
  })

  describe('Dashboard Rendering and Structure', () => {
    test('should render dashboard with Romanian branding', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      // Validate Romanian branding elements
      expect(screen.getByText(/RomAI/)).toBeInTheDocument()
      expect(screen.getByText(/Inteligență Artificială Română/)).toBeInTheDocument()
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(/Tablou de Bord/)).toBeInTheDocument()
      })

      // Validate main dashboard sections
      expect(screen.getByText(/Capabilități AGI/)).toBeInTheDocument()
      expect(screen.getByText(/Performanță Server/)).toBeInTheDocument()
      expect(screen.getByText(/Analiză Culturală/)).toBeInTheDocument()
    })

    test('should display real-time AGI capabilities with Romanian labels', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      await waitFor(() => {
        // Validate capability scores display
        expect(screen.getByText(/85\.2%/)).toBeInTheDocument() // Mathematical
        expect(screen.getByText(/78\.9%/)).toBeInTheDocument() // Logical  
        expect(screen.getByText(/92\.1%/)).toBeInTheDocument() // Cultural
        expect(screen.getByText(/94\.5%/)).toBeInTheDocument() // Linguistic
      })

      // Validate Romanian capability labels
      expect(screen.getByText(/Raționament Matematic/)).toBeInTheDocument()
      expect(screen.getByText(/Raționament Logic/)).toBeInTheDocument()
      expect(screen.getByText(/Inteligență Culturală/)).toBeInTheDocument()
      expect(screen.getByText(/Procesare Lingvistică/)).toBeInTheDocument()
    })

    test('should show Romanian cultural analysis metrics', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      await waitFor(() => {
        // Validate cultural metrics
        expect(screen.getByText(/96\.8%/)).toBeInTheDocument() // Romanian accuracy
        expect(screen.getByText(/91\.3%/)).toBeInTheDocument() // Historical knowledge
        expect(screen.getByText(/97\.2%/)).toBeInTheDocument() // Linguistic precision
      })

      // Validate Romanian cultural labels
      expect(screen.getByText(/Acuratețe Română/)).toBeInTheDocument()
      expect(screen.getByText(/Cunoștințe Istorice/)).toBeInTheDocument()
      expect(screen.getByText(/Precizie Lingvistică/)).toBeInTheDocument()
    })
  })

  describe('Internationalization (i18n) Testing', () => {
    test('should display Romanian text with proper diacritics', () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      // Test for Romanian diacritics in UI text
      const romanianTexts = [
        'Tablou de Bord',
        'Inteligență Artificială',
        'Capabilități',
        'Performanță',
        'Analiză'
      ]

      romanianTexts.forEach(text => {
        const element = screen.getByText(new RegExp(text))
        expect(element).toBeInTheDocument()
        expect(global.validateRomanianText(element.textContent).hasDiacritics).toBe(true)
      })
    })

    test('should support theme switching with Romanian labels', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      // Find and click theme toggle button
      const themeToggle = screen.getByRole('button', { name: /temă/i })
      expect(themeToggle).toBeInTheDocument()

      await user.click(themeToggle)

      // Validate theme toggle worked (DOM class changes)
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBeTruthy()
      })
    })

    test('should handle language switching between Romanian and English', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      // Find language switcher
      const langSwitcher = screen.getByRole('button', { name: /ro/i })
      await user.click(langSwitcher)

      // Should show English options
      await waitFor(() => {
        expect(screen.getByText(/English/)).toBeInTheDocument()
      })

      // Switch to English
      const englishOption = screen.getByText(/English/)
      await user.click(englishOption)

      // Validate English labels appear
      await waitFor(() => {
        expect(screen.getByText(/Dashboard/)).toBeInTheDocument()
        expect(screen.getByText(/AGI Capabilities/)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Data Integration', () => {
    test('should fetch and display real-time AGI server data', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      // Validate API call was made
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/agi/status'),
          expect.any(Object)
        )
      })

      // Validate data is displayed
      expect(screen.getByText(/14.*modele.*încărcate/)).toBeInTheDocument()
      expect(screen.getByText(/245.*ms/)).toBeInTheDocument() // Response time
      expect(screen.getByText(/125.*req\/s/)).toBeInTheDocument() // Requests per second
    })

    test('should handle API error states gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Server connection failed'))

      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      await waitFor(() => {
        // Should show error message in Romanian
        expect(screen.getByText(/Eroare la conectarea cu serverul/)).toBeInTheDocument()
        
        // Should show retry button
        expect(screen.getByRole('button', { name: /încearcă din nou/i })).toBeInTheDocument()
      })
    })

    test('should auto-refresh data at regular intervals', async () => {
      jest.useFakeTimers()

      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      // Initial call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      // Fast forward 30 seconds (auto-refresh interval)
      jest.advanceTimersByTime(30000)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })

      jest.useRealTimers()
    })
  })

  describe('Interactive Features', () => {
    test('should allow capability section expansion/collapse', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/Capabilități AGI/)).toBeInTheDocument()
      })

      // Find expand/collapse button
      const expandButton = screen.getByRole('button', { name: /extinde.*capabilități/i })
      await user.click(expandButton)

      // Should show detailed metrics
      await waitFor(() => {
        expect(screen.getByText(/Detalii Avansate/)).toBeInTheDocument()
        expect(screen.getByText(/Modele Neurale Active/)).toBeInTheDocument()
      })
    })

    test('should provide capability testing interface', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      // Find test interface button
      const testButton = screen.getByRole('button', { name: /testează.*capabilități/i })
      await user.click(testButton)

      // Should open test dialog
      await waitFor(() => {
        expect(screen.getByText(/Test Capabilități AGI/)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Introduceți întrebarea în română/)).toBeInTheDocument()
      })

      // Test mathematical capability
      const testInput = screen.getByPlaceholderText(/Introduceți întrebarea în română/)
      await user.type(testInput, 'Calculați √144')

      const submitButton = screen.getByRole('button', { name: /trimite/i })
      await user.click(submitButton)

      // Should show loading state
      expect(screen.getByText(/Se procesează/)).toBeInTheDocument()
    })
  })

  describe('Performance Metrics Display', () => {
    test('should display performance charts with Romanian labels', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      await waitFor(() => {
        // Validate chart sections
        expect(screen.getByText(/Performanță în Timp Real/)).toBeInTheDocument()
        expect(screen.getByText(/Utilizare Memorie/)).toBeInTheDocument()
        expect(screen.getByText(/Utilizare CPU/)).toBeInTheDocument()
        expect(screen.getByText(/Timp de Răspuns/)).toBeInTheDocument()
      })

      // Validate chart elements are present
      const charts = screen.getAllByRole('img', { name: /grafic/i })
      expect(charts.length).toBeGreaterThan(0)
    })

    test('should show model status with Romanian descriptions', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      await waitFor(() => {
        // Validate model status section
        expect(screen.getByText(/Status Modele/)).toBeInTheDocument()
        expect(screen.getByText(/14.*modele.*active/)).toBeInTheDocument()
        
        // Validate individual model types in Romanian
        expect(screen.getByText(/Model Matematic/)).toBeInTheDocument()
        expect(screen.getByText(/Model Logic/)).toBeInTheDocument()
        expect(screen.getByText(/Model Cultural/)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility (WCAG 2.1 AA Compliance)', () => {
    test('should meet WCAG 2.1 AA accessibility standards', async () => {
      const { container } = render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('should support keyboard navigation', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      const user = userEvent.setup()

      // Test tab navigation through interactive elements
      await user.tab()
      expect(screen.getByRole('button', { name: /temă/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /ro/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /testează/i })).toHaveFocus()
    })

    test('should provide proper ARIA labels for Romanian content', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      await waitFor(() => {
        // Validate ARIA labels in Romanian
        const capabilitySection = screen.getByRole('region', { name: /capabilități.*agi/i })
        expect(capabilitySection).toBeInTheDocument()

        const performanceSection = screen.getByRole('region', { name: /performanță.*server/i })
        expect(performanceSection).toBeInTheDocument()

        const culturalSection = screen.getByRole('region', { name: /analiză.*culturală/i })
        expect(culturalSection).toBeInTheDocument()
      })

      // Validate screen reader friendly content
      const visuallyHiddenElements = container.querySelectorAll('.sr-only')
      visuallyHiddenElements.forEach(element => {
        expect(global.validateRomanianText(element.textContent).hasDiacritics).toBe(true)
      })
    })
  })

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'large', width: 1920, height: 1080 }
    ]

    test.each(viewports)(
      'should render correctly on $name viewport ($width x $height)',
      async ({ width, height }) => {
        // Mock viewport size
        global.innerWidth = width
        global.innerHeight = height
        global.dispatchEvent(new Event('resize'))

        render(
          <ThemeProvider attribute="class" defaultTheme="light">
            <Dashboard />
          </ThemeProvider>
        )

        await waitFor(() => {
          // Validate main elements are visible
          expect(screen.getByText(/RomAI/)).toBeVisible()
          expect(screen.getByText(/Tablou de Bord/)).toBeVisible()
        })

        // Validate responsive layout adjustments
        const mainContent = screen.getByRole('main')
        expect(mainContent).toBeVisible()

        // On mobile, some elements might be collapsed
        if (width < 768) {
          // Mobile-specific validations
          expect(screen.queryByText(/Detalii Complete/)).not.toBeInTheDocument()
        } else {
          // Desktop-specific validations
          expect(screen.getByText(/Capabilități AGI/)).toBeVisible()
          expect(screen.getByText(/Performanță Server/)).toBeVisible()
        }
      }
    )

    test('should handle touch interactions on mobile devices', async () => {
      global.innerWidth = 375
      global.innerHeight = 667
      
      const user = userEvent.setup({
        pointerEventsCheck: 0 // Disable pointer events check for touch simulation
      })

      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/Tablou de Bord/)).toBeInTheDocument()
      })

      // Simulate touch interaction with capability card
      const capabilityCard = screen.getByText(/Capabilități AGI/).closest('[role="button"]')
      if (capabilityCard) {
        await user.click(capabilityCard)
        
        // Should expand or show details
        await waitFor(() => {
          expect(screen.getByText(/Detalii/)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Animation and Visual Effects', () => {
    test('should animate capability score changes', async () => {
      const { rerender } = render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/85\.2%/)).toBeInTheDocument()
      })

      // Mock updated data
      const updatedResponse = {
        ...mockAGIServerResponse,
        capabilities: {
          ...mockAGIServerResponse.capabilities,
          mathematical: 87.5
        }
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => updatedResponse
      })

      // Trigger re-render with new data
      rerender(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      // Should animate to new value
      await waitFor(() => {
        expect(screen.getByText(/87\.5%/)).toBeInTheDocument()
      })
    })

    test('should provide loading animations with Romanian text', async () => {
      global.fetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => mockAGIServerResponse
        }), 2000))
      )

      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <Dashboard />
        </ThemeProvider>
      )

      // Should show loading state in Romanian
      expect(screen.getByText(/Se încarcă/)).toBeInTheDocument()
      expect(screen.getByText(/Așteptați să se încarce datele/)).toBeInTheDocument()

      // Loading spinner should be present
      const loadingSpinner = screen.getByRole('status', { name: /se încarcă/i })
      expect(loadingSpinner).toBeInTheDocument()
    })
  })
})