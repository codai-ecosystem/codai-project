/**
 * ROMAI AGI Mathematical Reasoning Tests
 * Tests the core mathematical reasoning capabilities with Romanian context
 */

import axios from 'axios'

const ROMAI_SERVER_URL = process.env.NEXT_PUBLIC_ROMAI_API_URL || 'http://localhost:6101'

describe('🧮 ROMAI AGI Mathematical Reasoning Tests', () => {
  let agiClient

  beforeAll(() => {
    agiClient = axios.create({
      baseURL: ROMAI_SERVER_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Test-Mode': 'true'
      }
    })
  })

  describe('Basic Mathematical Operations in Romanian', () => {
    const basicMathTests = [
      {
        problem: 'Calculați 25 + 17',
        expectedResult: 42,
        expectedRomanianTerms: ['calculați', 'rezultatul', 'suma'],
        difficulty: 'easy'
      },
      {
        problem: 'Cât este 144 împărțit la 12?',
        expectedResult: 12,
        expectedRomanianTerms: ['împărțit', 'rezultatul', 'diviziunea'],
        difficulty: 'easy'
      },
      {
        problem: 'Calculați √144',
        expectedResult: 12,
        expectedRomanianTerms: ['rădăcina pătrată', 'rezultatul'],
        difficulty: 'medium'
      }
    ]

    test.each(basicMathTests)(
      'should solve basic math problem: $problem',
      async ({ problem, expectedResult, expectedRomanianTerms, difficulty }) => {
        const startTime = Date.now()
        
        const response = await agiClient.post('/api/v1/mathematical-reasoning/solve', {
          problem,
          language: 'ro',
          context: 'romanian_mathematical_notation'
        })

        const processingTime = Date.now() - startTime

        // Validate response structure
        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('result')
        expect(response.data).toHaveProperty('confidence')
        expect(response.data).toHaveProperty('reasoning')
        expect(response.data).toHaveProperty('culturalContext')

        // Validate mathematical accuracy
        expect(response.data.result).toBe(expectedResult)
        expect(response.data.confidence).toBeGreaterThan(0.95)

        // Validate Romanian language usage
        const reasoning = response.data.reasoning.toLowerCase()
        expect(global.validateRomanianText(reasoning).hasDiacritics).toBe(true)

        // Check for expected Romanian mathematical terms
        expectedRomanianTerms.forEach(term => {
          expect(reasoning).toContain(term.toLowerCase())
        })

        // Validate performance requirements
        const maxTime = global.AGI_PERFORMANCE_BENCHMARKS.maxResponseTime[difficulty]
        expect(processingTime).toBeLessThan(maxTime)

        // Validate cultural context
        expect(response.data.culturalContext).toBe('Romanian mathematical notation')
        expect(response.data.processingTimeMs).toBeLessThan(maxTime)
      }
    )
  })

  describe('Advanced Mathematical Reasoning', () => {
    const advancedMathTests = [
      {
        problem: 'Rezolvați ecuația de gradul doi: x² - 5x + 6 = 0',
        expectedResults: [2, 3],
        expectedRomanianTerms: ['ecuație', 'gradul doi', 'soluții', 'discriminant'],
        difficulty: 'hard'
      },
      {
        problem: 'Calculați limita când x tinde către infinit: (2x + 1)/(x - 3)',
        expectedResult: 2,
        expectedRomanianTerms: ['limita', 'infinit', 'tinde către'],
        difficulty: 'hard'
      },
      {
        problem: 'Calculați integrata ∫(2x + 3)dx de la 0 la 5',
        expectedResult: 40,
        expectedRomanianTerms: ['integrală', 'primitiva', 'limita de integrare'],
        difficulty: 'hard'
      }
    ]

    test.each(advancedMathTests)(
      'should solve advanced math problem: $problem',
      async ({ problem, expectedResults, expectedResult, expectedRomanianTerms, difficulty }) => {
        const startTime = Date.now()
        
        const response = await agiClient.post('/api/v1/mathematical-reasoning/solve', {
          problem,
          language: 'ro',
          context: 'advanced_romanian_mathematics',
          showSteps: true
        })

        const processingTime = Date.now() - startTime

        // Validate response
        expect(response.status).toBe(200)
        expect(response.data.confidence).toBeGreaterThan(0.90)

        // Check for multiple solutions or single result
        if (expectedResults) {
          expect(expectedResults).toContain(response.data.result)
        } else {
          expect(response.data.result).toBe(expectedResult)
        }

        // Validate detailed reasoning steps in Romanian
        expect(response.data.reasoning).toBeDefined()
        expect(response.data.steps).toBeDefined()
        expect(response.data.steps.length).toBeGreaterThan(1)

        // Validate Romanian mathematical terminology
        const fullText = (response.data.reasoning + ' ' + response.data.steps.join(' ')).toLowerCase()
        expectedRomanianTerms.forEach(term => {
          expect(fullText).toContain(term.toLowerCase())
        })

        // Validate performance for complex operations
        const maxTime = global.AGI_PERFORMANCE_BENCHMARKS.maxResponseTime[difficulty]
        expect(processingTime).toBeLessThan(maxTime)

        // Validate each step has Romanian explanation
        response.data.steps.forEach(step => {
          expect(global.validateRomanianText(step).hasDiacritics).toBe(true)
        })
      }
    )
  })

  describe('Romanian Mathematical Word Problems', () => {
    const wordProblemsTests = [
      {
        problem: 'Ana are 15 mere. Ea dăruiește 5 mere fratelui său și cumpără încă 8 mere. Câte mere are Ana acum?',
        expectedResult: 18,
        expectedRomanianTerms: ['mere', 'dăruiește', 'cumpără', 'acum'],
        type: 'word_problem'
      },
      {
        problem: 'Un tren parcurge distanța de 240 km în 3 ore. Care este viteza medie a trenului în km/h?',
        expectedResult: 80,
        expectedRomanianTerms: ['distanța', 'viteza medie', 'km/h'],
        type: 'word_problem'
      },
      {
        problem: 'Într-o clasă sunt 28 de elevi. 60% sunt fete. Câți băieți sunt în clasă?',
        expectedResult: 11.2,
        expectedRomanianTerms: ['clasă', 'elevi', 'fete', 'băieți', 'procent'],
        type: 'percentage_problem'
      }
    ]

    test.each(wordProblemsTests)(
      'should solve Romanian word problem: $type',
      async ({ problem, expectedResult, expectedRomanianTerms, type }) => {
        const response = await agiClient.post('/api/v1/mathematical-reasoning/solve', {
          problem,
          language: 'ro',
          problemType: type,
          requiresWordAnalysis: true
        })

        // Validate mathematical accuracy
        expect(response.status).toBe(200)
        expect(Math.abs(response.data.result - expectedResult)).toBeLessThan(0.1)
        expect(response.data.confidence).toBeGreaterThan(0.88)

        // Validate word problem understanding
        expect(response.data.wordAnalysis).toBeDefined()
        expect(response.data.wordAnalysis.keyTerms).toBeDefined()

        // Validate Romanian language comprehension
        expectedRomanianTerms.forEach(term => {
          expect(response.data.wordAnalysis.keyTerms.map(t => t.toLowerCase())).toContain(term)
        })

        // Validate step-by-step solution in Romanian
        expect(response.data.steps).toBeDefined()
        response.data.steps.forEach(step => {
          expect(global.validateRomanianText(step).hasDiacritics).toBe(true)
        })

        // Validate cultural context understanding
        expect(response.data.culturalContext).toContain('Romanian')
      }
    )
  })

  describe('Performance and Error Handling', () => {
    test('should handle invalid mathematical expressions gracefully', async () => {
      const response = await agiClient.post('/api/v1/mathematical-reasoning/solve', {
        problem: 'Calculați abc + xyz', // Invalid expression
        language: 'ro'
      })

      expect(response.status).toBe(400)
      expect(response.data.error).toBeDefined()
      expect(response.data.error.message).toContain('expresie invalidă')
      expect(global.validateRomanianText(response.data.error.message).hasDiacritics).toBe(true)
    })

    test('should maintain performance under load', async () => {
      const promises = []
      const startTime = Date.now()

      // Submit multiple concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          agiClient.post('/api/v1/mathematical-reasoning/solve', {
            problem: `Calculați ${i + 1} × ${i + 2}`,
            language: 'ro'
          })
        )
      }

      const results = await Promise.all(promises)
      const totalTime = Date.now() - startTime

      // Validate all requests succeeded
      results.forEach((response, index) => {
        expect(response.status).toBe(200)
        expect(response.data.result).toBe((index + 1) * (index + 2))
        expect(response.data.confidence).toBeGreaterThan(0.95)
      })

      // Validate concurrent performance
      expect(totalTime).toBeLessThan(3000) // All 10 requests in under 3 seconds
    })

    test('should maintain mathematical precision for complex calculations', async () => {
      const response = await agiClient.post('/api/v1/mathematical-reasoning/solve', {
        problem: 'Calculați cu 10 zecimale: π × e²',
        language: 'ro',
        precision: 10
      })

      expect(response.status).toBe(200)
      expect(response.data.result).toBeCloseTo(23.1406926328, 8) // π × e² ≈ 23.1406926328
      expect(response.data.precision).toBe(10)
      expect(response.data.confidence).toBeGreaterThan(0.98)
    })
  })

  afterAll(async () => {
    // Clean up any test data or connections
    if (agiClient) {
      // Gracefully close any persistent connections
    }
  })
})