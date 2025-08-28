/**
 * Unit Tests for Romanian Processing Utilities
 * Tests core Romanian language analysis functions
 */

import { describe, it, expect } from 'vitest'
import {
  detectDiacritics,
  analyzeFormality,
  identifyRegionalVariant,
  extractCulturalMarkers,
  validateRomanianText,
  normalizeRomanianText
} from '@/utils/romanian-processing'

describe('Romanian Processing Utilities', () => {
  describe('detectDiacritics', () => {
    it('correctly identifies all Romanian diacritics', () => {
      const text = "Mâine să vă simțiți ca acasă în România!"
      const result = detectDiacritics(text)

      expect(result.hasDiacritics).toBe(true)
      expect(result.count).toBe(5)
      expect(result.diacriticChars).toEqual(['â', 'ă', 'ă', 'ț', 'â'])
      expect(result.correctnessScore).toBeCloseTo(1.0)
    })

    it('handles text without diacritics', () => {
      const text = "Maine sa va simtiti ca acasa in Romania!"
      const result = detectDiacritics(text)

      expect(result.hasDiacritics).toBe(false)
      expect(result.count).toBe(0)
      expect(result.diacriticChars).toEqual([])
      expect(result.correctnessScore).toBeLessThan(1.0)
    })

    it('calculates correctness score accurately', () => {
      // Mixed correct and incorrect diacritics
      const text = "Bună ziua, cum vă simtiti astăzi?" // missing ț in "simțiți"
      const result = detectDiacritics(text)

      expect(result.hasDiacritics).toBe(true)
      expect(result.correctnessScore).toBeLessThan(1.0)
      expect(result.correctnessScore).toBeGreaterThan(0.5)
    })

    it('identifies specific diacritic characters', () => {
      const testCases = [
        { char: 'ă', word: 'căpșună' },
        { char: 'â', word: 'român' },
        { char: 'î', word: 'începe' },
        { char: 'ș', word: 'pleașcă' },
        { char: 'ț', word: 'țară' }
      ]

      testCases.forEach(({ char, word }) => {
        const result = detectDiacritics(word)
        expect(result.diacriticChars).toContain(char)
      })
    })
  })

  describe('analyzeFormality', () => {
    it('detects formal address patterns', () => {
      const formalTexts = [
        "Vă rog să îmi explicați conceptul.",
        "Ar fi posibil să îmi oferiți informații?",
        "Vă mulțumesc pentru răspuns."
      ]

      formalTexts.forEach(text => {
        const result = analyzeFormality(text)
        expect(result.level).toBe('formal')
        expect(result.confidence).toBeGreaterThan(0.8)
        expect(result.addressForm).toBe('polite_plural')
      })
    })

    it('detects informal address patterns', () => {
      const informalTexts = [
        "Poți să îmi explici?",
        "Ce mai faci?",
        "Mulțumesc pentru ajutor."
      ]

      informalTexts.forEach(text => {
        const result = analyzeFormality(text)
        expect(result.level).toBe('informal')
        expect(result.confidence).toBeGreaterThan(0.8)
        expect(result.addressForm).toBe('familiar_singular')
      })
    })

    it('identifies formality markers correctly', () => {
      const text = "Vă rog să îmi explicați, dacă aveți bunăvoința."
      const result = analyzeFormality(text)

      expect(result.markers).toContain('Vă rog')
      expect(result.markers).toContain('îmi explicați')
      expect(result.markers).toContain('bunăvoința')
    })

    it('handles neutral formality', () => {
      const neutralText = "Calculează rădăcina pătrată din 144."
      const result = analyzeFormality(neutralText)

      expect(result.level).toBe('neutral')
      expect(result.confidence).toBeLessThan(0.7)
    })
  })

  describe('identifyRegionalVariant', () => {
    it('identifies Moldovan variants', () => {
      const moldovanTexts = [
        "Bună dimineața, ce mai faceți?",
        "Am fost la târgul din oraș.",
        "Mergem la horă diseară."
      ]

      moldovanTexts.forEach(text => {
        const result = identifyRegionalVariant(text)
        expect(result.region).toBe('moldova')
        expect(result.confidence).toBeGreaterThan(0.6)
      })
    })

    it('identifies Transylvanian variants', () => {
      const transylvanianTexts = [
        "Servus! Cum o mai duci?",
        "Hai să mergem la cârciumă.",
        "Ce faci, măi băiete?"
      ]

      transylvanianTexts.forEach(text => {
        const result = identifyRegionalVariant(text)
        expect(result.region).toBe('transylvania')
        expect(result.confidence).toBeGreaterThan(0.6)
      })
    })

    it('identifies Banatean variants', () => {
      const banateaTtexts = [
        "Zdravo! Cum ești?",
        "Am mâncat paprikaș azi.",
        "Mergem la kirmes."
      ]

      banateaTtexts.forEach(text => {
        const result = identifyRegionalVariant(text)
        expect(result.region).toBe('banat')
        expect(result.dialectFeatures.length).toBeGreaterThan(0)
      })
    })

    it('defaults to standard Romanian for neutral text', () => {
      const standardText = "Calculează suma numerelor de la 1 la 10."
      const result = identifyRegionalVariant(standardText)

      expect(result.region).toBe('standard')
      expect(result.dialectFeatures).toEqual([])
    })
  })

  describe('extractCulturalMarkers', () => {
    it('identifies Romanian holidays and traditions', () => {
      const culturalTexts = [
        {
          text: "Ce sărbătorim pe 1 decembrie?",
          expectedTraditions: ['Ziua Națională'],
          expectedContext: 'national_holiday'
        },
        {
          text: "Când se dă Mărțișorul?",
          expectedTraditions: ['Mărțișor'],
          expectedContext: 'spring_tradition'
        },
        {
          text: "Cum se face colindatul de Crăciun?",
          expectedTraditions: ['colinde', 'Crăciun'],
          expectedContext: 'winter_tradition'
        }
      ]

      culturalTexts.forEach(({ text, expectedTraditions, expectedContext }) => {
        const result = extractCulturalMarkers(text)

        expect(result.culturalContext).toBe(expectedContext)
        expectedTraditions.forEach(tradition => {
          expect(result.traditions.some(t =>
            t.toLowerCase().includes(tradition.toLowerCase())
          )).toBe(true)
        })
        expect(result.relevanceScore).toBeGreaterThan(0.7)
      })
    })

    it('identifies Romanian cultural references', () => {
      const text = "Mihai Eminescu este poetul național al României."
      const result = extractCulturalMarkers(text)

      expect(result.culturalReferences).toContain('Mihai Eminescu')
      expect(result.culturalReferences).toContain('România')
      expect(result.culturalContext).toBe('literary_cultural')
    })

    it('handles text without cultural content', () => {
      const neutralText = "Calculează aria unui triunghi dreptunghic."
      const result = extractCulturalMarkers(neutralText)

      expect(result.traditions).toEqual([])
      expect(result.culturalReferences).toEqual([])
      expect(result.relevanceScore).toBeLessThan(0.3)
      expect(result.culturalContext).toBe('neutral')
    })

    it('identifies regional cultural patterns', () => {
      const text = "Am fost la Mănăstirea Voroneț din Bucovina."
      const result = extractCulturalMarkers(text)

      expect(result.culturalReferences).toContain('Mănăstirea Voroneț')
      expect(result.culturalReferences).toContain('Bucovina')
      expect(result.culturalContext).toBe('regional_cultural')
    })
  })

  describe('validateRomanianText', () => {
    it('validates correct Romanian text', () => {
      const correctText = "Bună ziua! Cum vă simțiți astăzi în România?"
      const result = validateRomanianText(correctText)

      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThan(0.9)
      expect(result.errors).toEqual([])
    })

    it('identifies common Romanian spelling errors', () => {
      const errorTexts = [
        {
          text: "Buna ziua! Cum va simtiti astazi?", // missing diacritics
          expectedErrors: ['missing_diacritics']
        },
        {
          text: "Vă rog sā îmi explicați.", // wrong diacritic (ā instead of ă)
          expectedErrors: ['incorrect_diacritic']
        },
        {
          text: "Mergeam la şcoală.", // cedilla instead of comma accent
          expectedErrors: ['wrong_diacritic_type']
        }
      ]

      errorTexts.forEach(({ text, expectedErrors }) => {
        const result = validateRomanianText(text)
        expect(result.isValid).toBe(false)
        expect(result.score).toBeLessThan(0.9)
        expectedErrors.forEach(error => {
          expect(result.errors.some(e => e.type === error)).toBe(true)
        })
      })
    })

    it('provides correction suggestions', () => {
      const text = "Buna ziua, cum va simtiti?"
      const result = validateRomanianText(text)

      expect(result.suggestions).toContainEqual({
        original: 'Buna',
        suggested: 'Bună',
        position: expect.any(Number)
      })
      expect(result.suggestions).toContainEqual({
        original: 'va',
        suggested: 'vă',
        position: expect.any(Number)
      })
    })
  })

  describe('normalizeRomanianText', () => {
    it('normalizes diacritics correctly', () => {
      const testCases = [
        { input: 'şcoală', expected: 'școală' }, // cedilla to comma accent
        { input: 'ţară', expected: 'țară' }, // cedilla to comma accent
        { input: 'românã', expected: 'română' }, // tilde to breve
      ]

      testCases.forEach(({ input, expected }) => {
        const result = normalizeRomanianText(input)
        expect(result.normalized).toBe(expected)
        expect(result.changes).toContainEqual({
          position: expect.any(Number),
          original: expect.any(String),
          normalized: expect.any(String),
          reason: 'diacritic_normalization'
        })
      })
    })

    it('handles mixed case correctly', () => {
      const text = "ROMÂNIA este ȚARA MEA"
      const result = normalizeRomanianText(text, { preserveCase: true })

      expect(result.normalized).toBe("ROMÂNIA este ȚARA MEA")
      expect(result.casePreserved).toBe(true)
    })

    it('normalizes whitespace and punctuation', () => {
      const text = "Bună  ziua  ,   cum   vă   simțiți   ?"
      const result = normalizeRomanianText(text, {
        normalizeWhitespace: true,
        normalizePunctuation: true
      })

      expect(result.normalized).toBe("Bună ziua, cum vă simțiți?")
      expect(result.changes.some(c => c.reason === 'whitespace_normalization')).toBe(true)
    })

    it('reports normalization statistics', () => {
      const text = "şcoală ţară românã"
      const result = normalizeRomanianText(text)

      expect(result.stats.totalChanges).toBe(3)
      expect(result.stats.diacriticChanges).toBe(3)
      expect(result.stats.preservedCharacters).toBeGreaterThan(0)
    })
  })

  describe('Integration Tests', () => {
    it('processes complex Romanian text correctly', () => {
      const complexText = `Vă rog sā îmi explicați cum se sărbătorește Mărțișorul în Transilivania. 
                           Este o tradiție foarte importantă pentru românii de pretutindeni.`

      const diacritics = detectDiacritics(complexText)
      const formality = analyzeFormality(complexText)
      const region = identifyRegionalVariant(complexText)
      const cultural = extractCulturalMarkers(complexText)
      const validation = validateRomanianText(complexText)

      // Should detect issues with diacritics (ā instead of ă)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.type === 'incorrect_diacritic')).toBe(true)

      // Should recognize formality
      expect(formality.level).toBe('formal')
      expect(formality.confidence).toBeGreaterThan(0.8)

      // Should identify cultural content
      expect(cultural.traditions).toContain('Mărțișor')
      expect(cultural.culturalReferences).toContain('Transilivania')
      expect(cultural.relevanceScore).toBeGreaterThan(0.8)
    })

    it('handles edge cases gracefully', () => {
      const edgeCases = ['', ' ', null, undefined, 123, {}]

      edgeCases.forEach(edgeCase => {
        // These functions should not throw errors
        expect(() => detectDiacritics(edgeCase as any)).not.toThrow()
        expect(() => analyzeFormality(edgeCase as any)).not.toThrow()
        expect(() => identifyRegionalVariant(edgeCase as any)).not.toThrow()
        expect(() => extractCulturalMarkers(edgeCase as any)).not.toThrow()
        expect(() => validateRomanianText(edgeCase as any)).not.toThrow()
        expect(() => normalizeRomanianText(edgeCase as any)).not.toThrow()
      })
    })
  })
})