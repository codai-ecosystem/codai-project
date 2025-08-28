/**
 * AGI Benchmark Tests - Romanian Cultural Intelligence
 * Comprehensive testing suite for Romanian AGI capabilities
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { AGITestClient } from '@/tests/utils/agi-test-client'

describe('AGI Romanian Cultural Intelligence Benchmarks', () => {
  let agiClient: AGITestClient

  beforeAll(async () => {
    agiClient = new AGITestClient({
      baseURL: process.env.ROMAI_TEST_URL || 'http://localhost:6101',
      timeout: 10000
    })

    // Verify AGI service is available
    const health = await agiClient.checkHealth()
    expect(health.status).toBe('healthy')
  })

  afterAll(async () => {
    await agiClient.cleanup()
  })

  describe('Romanian Language Processing', () => {
    it('processes Romanian text with perfect accuracy', async () => {
      const testCases = [
        {
          input: "Bună ziua! Cum vă simțiți astăzi?",
          expectedFeatures: {
            language: 'romanian',
            formality: 'formal',
            diacritics_present: true,
            greeting_type: 'polite'
          },
          minConfidence: 0.95
        },
        {
          input: "Salut! Ce mai faci?",
          expectedFeatures: {
            language: 'romanian',
            formality: 'informal',
            greeting_type: 'casual'
          },
          minConfidence: 0.90
        }
      ]

      for (const testCase of testCases) {
        const response = await agiClient.processRomanianText(testCase.input)

        expect(response.success).toBe(true)
        expect(response.confidence).toBeGreaterThanOrEqual(testCase.minConfidence)

        // Verify language detection
        expect(response.analysis.language).toBe(testCase.expectedFeatures.language)
        expect(response.analysis.formality).toBe(testCase.expectedFeatures.formality)

        if (testCase.expectedFeatures.diacritics_present) {
          expect(response.analysis.diacritics_detected).toBe(true)
        }
      }
    })

    it('handles regional Romanian dialects accurately', async () => {
      const dialectTests = [
        {
          text: "Servus! Cum o mai duci?",
          expectedRegion: 'transylvania',
          dialectMarkers: ['servus'],
          minAccuracy: 0.85
        },
        {
          text: "Bună dimineața, ce mai faceți?",
          expectedRegion: 'moldova',
          dialectMarkers: ['dimineața'],
          minAccuracy: 0.80
        },
        {
          text: "Zdravo! Cum ești?",
          expectedRegion: 'banat',
          dialectMarkers: ['zdravo'],
          minAccuracy: 0.75
        }
      ]

      for (const test of dialectTests) {
        const response = await agiClient.analyzeRomanianDialect(test.text)

        expect(response.success).toBe(true)
        expect(response.accuracy).toBeGreaterThanOrEqual(test.minAccuracy)
        expect(response.detected_region).toBe(test.expectedRegion)

        test.dialectMarkers.forEach(marker => {
          expect(response.dialect_features).toContain(marker)
        })
      }
    })
  })

  describe('Cultural Knowledge Assessment', () => {
    it('demonstrates comprehensive Romanian cultural knowledge', async () => {
      const culturalQuestions = [
        {
          question: "Ce sărbătorim pe 1 decembrie în România?",
          expectedAnswer: "Ziua Națională a României",
          category: 'national_holidays',
          minAccuracy: 0.98
        },
        {
          question: "Cine a scris 'Luceafărul'?",
          expectedAnswer: "Mihai Eminescu",
          category: 'literature',
          minAccuracy: 0.95
        },
        {
          question: "Ce înseamnă tradiționalul Mărțișor?",
          expectedKeywords: ['primăvară', 'tradiție', 'martie', 'simbol'],
          category: 'traditions',
          minAccuracy: 0.90
        },
        {
          question: "Care sunt ingredientele principale ale mămăligii?",
          expectedKeywords: ['mălai', 'apă', 'sare'],
          category: 'cuisine',
          minAccuracy: 0.92
        }
      ]

      for (const q of culturalQuestions) {
        const response = await agiClient.askCulturalQuestion(q.question)

        expect(response.success).toBe(true)
        expect(response.cultural_accuracy).toBeGreaterThanOrEqual(q.minAccuracy)
        expect(response.category).toBe(q.category)

        if (q.expectedAnswer) {
          expect(response.answer.toLowerCase()).toContain(q.expectedAnswer.toLowerCase())
        }

        if (q.expectedKeywords) {
          q.expectedKeywords.forEach(keyword => {
            expect(response.answer.toLowerCase()).toContain(keyword.toLowerCase())
          })
        }
      }
    })

    it('provides contextually appropriate cultural responses', async () => {
      const contextualTests = [
        {
          context: 'formal_business',
          question: "Cum salutăm în mediul de afaceri românesc?",
          expectedFormality: 'formal',
          expectedElements: ['respect', 'protocolare', 'profesional']
        },
        {
          context: 'traditional_family',
          question: "Cum se sărbătorește Paștele în familiile românești?",
          expectedFormality: 'neutral',
          expectedElements: ['familie', 'tradiționale', 'ouă roșii', 'biserică']
        }
      ]

      for (const test of contextualTests) {
        const response = await agiClient.processWithCulturalContext(
          test.question,
          test.context
        )

        expect(response.success).toBe(true)
        expect(response.cultural_context.formality).toBe(test.expectedFormality)

        test.expectedElements.forEach(element => {
          expect(response.answer.toLowerCase()).toContain(element.toLowerCase())
        })
      }
    })
  })

  describe('Reasoning and Logic Assessment', () => {
    it('performs deductive reasoning in Romanian', async () => {
      const logicTests = [
        {
          premise: "Toate rozele sunt flori. Aceasta este o roză.",
          question: "Ce putem concluziona?",
          expectedConclusion: "aceasta este o floare",
          reasoningType: 'deductive',
          minConfidence: 0.95
        },
        {
          premise: "Dacă plouă, atunci strada se udă. Plouă.",
          question: "Ce se întâmplă cu strada?",
          expectedConclusion: "strada se udă",
          reasoningType: 'deductive',
          minConfidence: 0.98
        }
      ]

      for (const test of logicTests) {
        const response = await agiClient.performLogicalReasoning(
          test.premise + " " + test.question
        )

        expect(response.success).toBe(true)
        expect(response.reasoning_type).toBe(test.reasoningType)
        expect(response.confidence).toBeGreaterThanOrEqual(test.minConfidence)
        expect(response.conclusion.toLowerCase()).toContain(test.expectedConclusion)

        // Verify reasoning chain is present and logical
        expect(response.reasoning_steps).toBeInstanceOf(Array)
        expect(response.reasoning_steps.length).toBeGreaterThan(0)
      }
    })

    it('solves mathematical problems in Romanian context', async () => {
      const mathTests = [
        {
          problem: "Calculează rădăcina pătrată din 144.",
          expectedAnswer: 12,
          type: 'square_root',
          minConfidence: 0.99
        },
        {
          problem: "Rezolvă ecuația: 2x + 6 = 14",
          expectedAnswer: 4,
          type: 'linear_equation',
          minConfidence: 0.95
        },
        {
          problem: "Câte grade are suma unghiurilor unui triunghi?",
          expectedAnswer: 180,
          type: 'geometry',
          minConfidence: 0.98
        }
      ]

      for (const test of mathTests) {
        const response = await agiClient.solveMathProblem(test.problem)

        expect(response.success).toBe(true)
        expect(response.confidence).toBeGreaterThanOrEqual(test.minConfidence)
        expect(response.answer).toBe(test.expectedAnswer)
        expect(response.problem_type).toBe(test.type)

        // Verify solution steps are in Romanian
        expect(response.solution_steps).toBeInstanceOf(Array)
        response.solution_steps.forEach(step => {
          expect(typeof step).toBe('string')
          expect(step.length).toBeGreaterThan(0)
        })
      }
    })
  })

  describe('Performance Benchmarks', () => {
    it('maintains response time under 500ms for simple queries', async () => {
      const simpleQueries = [
        "Bună ziua!",
        "Ce oră este?",
        "Calculează 2 + 2.",
        "Cum te cheamă?"
      ]

      for (const query of simpleQueries) {
        const startTime = Date.now()
        const response = await agiClient.sendSimpleQuery(query)
        const endTime = Date.now()

        const responseTime = endTime - startTime
        expect(responseTime).toBeLessThan(500)
        expect(response.success).toBe(true)
      }
    })

    it('handles concurrent requests efficiently', async () => {
      const concurrentQueries = Array.from({ length: 10 }, (_, i) =>
        `Întrebarea numărul ${i + 1}: Ce înseamnă inteligența artificială?`
      )

      const startTime = Date.now()
      const responses = await Promise.all(
        concurrentQueries.map(query => agiClient.sendQuery(query))
      )
      const endTime = Date.now()

      // All requests should complete within 2 seconds
      expect(endTime - startTime).toBeLessThan(2000)

      // All responses should be successful
      responses.forEach(response => {
        expect(response.success).toBe(true)
        expect(response.confidence).toBeGreaterThan(0.8)
      })
    })

    it('maintains memory efficiency during extended conversations', async () => {
      const conversationLength = 50
      const responses: any[] = []

      // Simulate extended conversation
      for (let i = 0; i < conversationLength; i++) {
        const response = await agiClient.sendQuery(
          `Mesajul ${i + 1}: Povestește-mi despre România.`,
          {
            maintainContext: true,
            conversationId: 'benchmark_conversation'
          }
        )

        responses.push(response)
        expect(response.success).toBe(true)

        // Check memory usage doesn't grow excessively
        if (i > 10) {
          const memoryMetrics = await agiClient.getMemoryMetrics()
          expect(memoryMetrics.heap_used_mb).toBeLessThan(1000) // 1GB limit
        }
      }

      // Verify context is maintained throughout
      const contextCheck = await agiClient.getConversationContext('benchmark_conversation')
      expect(contextCheck.message_count).toBe(conversationLength)
      expect(contextCheck.context_preserved).toBe(true)
    })
  })

  describe('Comprehensive AGI Evaluation', () => {
    it('passes comprehensive Romanian AGI assessment', async () => {
      const agiAssessment = await agiClient.runComprehensiveAssessment({
        language_processing: true,
        cultural_knowledge: true,
        logical_reasoning: true,
        mathematical_ability: true,
        creative_thinking: true,
        contextual_understanding: true
      })

      expect(agiAssessment.success).toBe(true)

      // Overall AGI score should be above 85%
      expect(agiAssessment.overall_score).toBeGreaterThan(85)

      // Individual capability scores
      expect(agiAssessment.capabilities.language_processing).toBeGreaterThan(90)
      expect(agiAssessment.capabilities.cultural_knowledge).toBeGreaterThan(85)
      expect(agiAssessment.capabilities.logical_reasoning).toBeGreaterThan(80)
      expect(agiAssessment.capabilities.mathematical_ability).toBeGreaterThan(90)
      expect(agiAssessment.capabilities.creative_thinking).toBeGreaterThan(75)
      expect(agiAssessment.capabilities.contextual_understanding).toBeGreaterThan(85)

      // Performance metrics
      expect(agiAssessment.performance.avg_response_time_ms).toBeLessThan(750)
      expect(agiAssessment.performance.accuracy_rate).toBeGreaterThan(0.90)
      expect(agiAssessment.performance.cultural_sensitivity_score).toBeGreaterThan(0.92)

      // Romanian-specific metrics
      expect(agiAssessment.romanian_metrics.diacritic_accuracy).toBeGreaterThan(0.98)
      expect(agiAssessment.romanian_metrics.cultural_context_accuracy).toBeGreaterThan(0.90)
      expect(agiAssessment.romanian_metrics.dialect_recognition_rate).toBeGreaterThan(0.80)
      expect(agiAssessment.romanian_metrics.formality_detection_accuracy).toBeGreaterThan(0.95)
    })

    it('demonstrates superior performance compared to baseline', async () => {
      const baselineComparison = await agiClient.compareToBaseline({
        baseline_model: 'gpt-4o',
        test_categories: [
          'romanian_language_understanding',
          'cultural_knowledge',
          'reasoning_ability',
          'response_quality'
        ],
        test_duration_minutes: 5
      })

      expect(baselineComparison.success).toBe(true)

      // Should outperform baseline in Romanian-specific tasks
      expect(baselineComparison.improvements.romanian_language_understanding).toBeGreaterThan(0.15) // 15% improvement
      expect(baselineComparison.improvements.cultural_knowledge).toBeGreaterThan(0.25) // 25% improvement
      expect(baselineComparison.improvements.reasoning_ability).toBeGreaterThan(0.05) // 5% improvement
      expect(baselineComparison.improvements.response_quality).toBeGreaterThan(0.10) // 10% improvement

      // Overall superiority score
      expect(baselineComparison.superiority_score).toBeGreaterThan(0.20) // 20% overall improvement
    })
  })
})