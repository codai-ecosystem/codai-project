/**
 * Unit Tests for Romanian Language Processor Component
 * Tests Romanian cultural intelligence, language processing, and diacritic handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RomanianLanguageProcessor } from '@/components/agi/RomanianLanguageProcessor'

// Mock the Romanian processing utilities
vi.mock('@/utils/romanian-processing', () => ({
  detectDiacritics: vi.fn(),
  analyzeFormality: vi.fn(),
  identifyRegionalVariant: vi.fn(),
  extractCulturalMarkers: vi.fn(),
}))

import {
  detectDiacritics,
  analyzeFormality,
  identifyRegionalVariant,
  extractCulturalMarkers
} from '@/utils/romanian-processing'

describe('RomanianLanguageProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Diacritic Detection', () => {
    it('correctly identifies Romanian diacritics', () => {
      const textWithDiacritics = "Bună ziua, cum vă simțiți astăzi?"

      // Mock the diacritic detection
      vi.mocked(detectDiacritics).mockReturnValue({
        hasDiacritics: true,
        count: 4,
        diacriticChars: ['ă', 'ă', 'ţ', 'ă'],
        correctnessScore: 1.0
      })

      render(
        <RomanianLanguageProcessor
          text={textWithDiacritics}
          analyzeDiacritics={true}
        />
      )

      expect(detectDiacritics).toHaveBeenCalledWith(textWithDiacritics)
      expect(screen.getByText(/4 diacritics detected/i)).toBeInTheDocument()
      expect(screen.getByText(/correctness: 100%/i)).toBeInTheDocument()
    })

    it('handles text without diacritics correctly', () => {
      const textWithoutDiacritics = "Buna ziua, cum va simtiti astazi?"

      vi.mocked(detectDiacritics).mockReturnValue({
        hasDiacritics: false,
        count: 0,
        diacriticChars: [],
        correctnessScore: 0.7
      })

      render(
        <RomanianLanguageProcessor
          text={textWithoutDiacritics}
          analyzeDiacritics={true}
        />
      )

      expect(screen.getByText(/no diacritics detected/i)).toBeInTheDocument()
      expect(screen.getByText(/correctness: 70%/i)).toBeInTheDocument()
    })
  })

  describe('Formality Analysis', () => {
    it('detects formal Romanian address patterns', () => {
      const formalText = "Vă rog să îmi explicați conceptul de inteligență artificială."

      vi.mocked(analyzeFormality).mockReturnValue({
        level: 'formal',
        confidence: 0.95,
        markers: ['Vă rog', 'îmi explicați'],
        addressForm: 'polite_plural'
      })

      render(
        <RomanianLanguageProcessor
          text={formalText}
          analyzeFormality={true}
        />
      )

      expect(analyzeFormality).toHaveBeenCalledWith(formalText)
      expect(screen.getByText(/formal greeting/i)).toBeInTheDocument()
      expect(screen.getByText(/confidence: 95%/i)).toBeInTheDocument()
    })

    it('detects informal Romanian address patterns', () => {
      const informalText = "Poți să îmi explici ce e aia AI?"

      vi.mocked(analyzeFormality).mockReturnValue({
        level: 'informal',
        confidence: 0.88,
        markers: ['Poți', 'ce e aia'],
        addressForm: 'familiar_singular'
      })

      render(
        <RomanianLanguageProcessor
          text={informalText}
          analyzeFormality={true}
        />
      )

      expect(screen.getByText(/informal style/i)).toBeInTheDocument()
      expect(screen.getByText(/confidence: 88%/i)).toBeInTheDocument()
    })
  })

  describe('Regional Variant Detection', () => {
    it('identifies Moldovan Romanian variants', () => {
      const moldovanText = "Bună dimineața, ce mai faceți?"

      vi.mocked(identifyRegionalVariant).mockReturnValue({
        region: 'moldova',
        confidence: 0.82,
        dialectFeatures: ['dimineața'],
        characteristics: ['eastern_pronunciation']
      })

      render(
        <RomanianLanguageProcessor
          text={moldovanText}
          detectRegion={true}
        />
      )

      expect(identifyRegionalVariant).toHaveBeenCalledWith(moldovanText)
      expect(screen.getByText(/moldovan variant/i)).toBeInTheDocument()
      expect(screen.getByText(/dialect features: dimineața/i)).toBeInTheDocument()
    })

    it('identifies Transylvanian Romanian variants', () => {
      const transylvanianText = "Servus! Cum o mai duci?"

      vi.mocked(identifyRegionalVariant).mockReturnValue({
        region: 'transylvania',
        confidence: 0.91,
        dialectFeatures: ['servus'],
        characteristics: ['hungarian_influence']
      })

      render(
        <RomanianLanguageProcessor
          text={transylvanianText}
          detectRegion={true}
        />
      )

      expect(screen.getByText(/transylvanian variant/i)).toBeInTheDocument()
      expect(screen.getByText(/hungarian influence detected/i)).toBeInTheDocument()
    })
  })

  describe('Cultural Marker Extraction', () => {
    it('extracts Romanian cultural references', () => {
      const culturalText = "Ce părerere aveți despre tradițiile de Crăciun în România?"

      vi.mocked(extractCulturalMarkers).mockReturnValue({
        traditions: ['Crăciun'],
        culturalContext: 'holiday_discussion',
        culturalReferences: ['Romania'],
        relevanceScore: 0.93
      })

      render(
        <RomanianLanguageProcessor
          text={culturalText}
          extractCultural={true}
        />
      )

      expect(extractCulturalMarkers).toHaveBeenCalledWith(culturalText)
      expect(screen.getByText(/cultural context: holiday discussion/i)).toBeInTheDocument()
      expect(screen.getByText(/traditions: crăciun/i)).toBeInTheDocument()
    })

    it('handles text without cultural markers', () => {
      const neutralText = "Calculează rădăcina pătrată din 144."

      vi.mocked(extractCulturalMarkers).mockReturnValue({
        traditions: [],
        culturalContext: 'mathematical',
        culturalReferences: [],
        relevanceScore: 0.15
      })

      render(
        <RomanianLanguageProcessor
          text={neutralText}
          extractCultural={true}
        />
      )

      expect(screen.getByText(/mathematical context/i)).toBeInTheDocument()
      expect(screen.getByText(/no cultural traditions identified/i)).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('renders with all analysis features enabled', async () => {
      const complexText = "Vă rog să îmi explicați cum se sărbătorește Mărțișorul în Translivania."

      // Setup comprehensive mocks
      vi.mocked(detectDiacritics).mockReturnValue({
        hasDiacritics: true,
        count: 3,
        diacriticChars: ['ă', 'ă', 'ă'],
        correctnessScore: 1.0
      })

      vi.mocked(analyzeFormality).mockReturnValue({
        level: 'formal',
        confidence: 0.96,
        markers: ['Vă rog', 'îmi explicați'],
        addressForm: 'polite_plural'
      })

      vi.mocked(identifyRegionalVariant).mockReturnValue({
        region: 'transylvania',
        confidence: 0.75,
        dialectFeatures: ['Transilivania'],
        characteristics: ['regional_reference']
      })

      vi.mocked(extractCulturalMarkers).mockReturnValue({
        traditions: ['Mărțișor'],
        culturalContext: 'spring_tradition',
        culturalReferences: ['Transylvania'],
        relevanceScore: 0.89
      })

      render(
        <RomanianLanguageProcessor
          text={complexText}
          analyzeDiacritics={true}
          analyzeFormality={true}
          detectRegion={true}
          extractCultural={true}
        />
      )

      // Verify all analysis components are rendered
      await waitFor(() => {
        expect(screen.getByText(/3 diacritics detected/i)).toBeInTheDocument()
        expect(screen.getByText(/formal greeting/i)).toBeInTheDocument()
        expect(screen.getByText(/transylvanian variant/i)).toBeInTheDocument()
        expect(screen.getByText(/traditions: mărțișor/i)).toBeInTheDocument()
      })
    })

    it('handles loading states correctly', () => {
      render(
        <RomanianLanguageProcessor
          text=""
          analyzeDiacritics={true}
          isLoading={true}
        />
      )

      expect(screen.getByText(/analyzing romanian text.../i)).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('handles error states gracefully', () => {
      vi.mocked(detectDiacritics).mockImplementation(() => {
        throw new Error('Analysis failed')
      })

      render(
        <RomanianLanguageProcessor
          text="test text"
          analyzeDiacritics={true}
        />
      )

      expect(screen.getByText(/analysis error/i)).toBeInTheDocument()
      expect(screen.getByText(/failed to analyze romanian text/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels for analysis results', () => {
      vi.mocked(detectDiacritics).mockReturnValue({
        hasDiacritics: true,
        count: 2,
        diacriticChars: ['ă', 'ț'],
        correctnessScore: 0.95
      })

      render(
        <RomanianLanguageProcessor
          text="text cu diacritice"
          analyzeDiacritics={true}
        />
      )

      const diacriticResult = screen.getByRole('region', { name: /diacritic analysis/i })
      expect(diacriticResult).toBeInTheDocument()
      expect(diacriticResult).toHaveAttribute('aria-label',
        expect.stringContaining('diacritic analysis results'))
    })

    it('supports keyboard navigation for interactive elements', () => {
      render(
        <RomanianLanguageProcessor
          text="test text"
          analyzeDiacritics={true}
          onAnalysisToggle={vi.fn()}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /toggle analysis/i })
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveAttribute('tabIndex', '0')

      fireEvent.keyDown(toggleButton, { key: 'Enter' })
      expect(vi.mocked(toggleButton.onclick)).toHaveBeenCalled
    })
  })
})