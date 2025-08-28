/**
 * Integration Tests for ROMAI AGI API Endpoints
 * Tests complete API functionality with Romanian cultural intelligence
 */

import { test, expect } from '@playwright/test'

// Configure test timeout for AGI operations
test.describe.configure({ timeout: 30000 })

test.describe('ROMAI AGI API Integration Tests', () => {
  const BASE_URL = process.env.ROMAI_API_URL || 'http://localhost:6101'

  test.beforeAll(async () => {
    // Verify AGI service is running
    const response = await fetch(`${BASE_URL}/health`)
    expect(response.ok).toBeTruthy()
  })

  test.describe('Health and Status Endpoints', () => {
    test('GET /health returns healthy status', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/health`)

      expect(response.ok()).toBeTruthy()
      const health = await response.json()

      expect(health.status).toBe('healthy')
      expect(health.service).toBe('romai-agi')
      expect(health.version).toBeDefined()
      expect(health.uptime_seconds).toBeGreaterThan(0)
    })

    test('GET /capabilities returns comprehensive AGI capabilities', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/v1/capabilities`)

      expect(response.ok()).toBeTruthy()
      const capabilities = await response.json()

      expect(capabilities.success).toBe(true)
      expect(capabilities.romanian_language_processing).toBeGreaterThan(90)
      expect(capabilities.cultural_understanding).toBeGreaterThan(85)
      expect(capabilities.advanced_reasoning).toBeGreaterThan(80)
      expect(capabilities.overall_agi_score).toBeGreaterThan(85)
      expect(capabilities.confidence_interval).toBeGreaterThan(90)
    })

    test('GET /performance returns real-time performance metrics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/v1/performance`)

      expect(response.ok()).toBeTruthy()
      const performance = await response.json()

      expect(performance.success).toBe(true)
      expect(performance.metrics.total_inferences).toBeGreaterThan(0)
      expect(performance.metrics.avg_response_time_ms).toBeLessThan(1000)
      expect(performance.metrics.success_rate).toBeGreaterThan(0.95)
    })
  })

  test.describe('Romanian Language Processing', () => {
    test('processes Romanian text with cultural intelligence', async ({ request }) => {
      const testData = {
        message: "Bună ziua! Cum vă simțiți astăzi? Sper că aveți o zi frumoasă în România.",
        context: "romanian",
        include_cultural_analysis: true,
        include_linguistic_analysis: true
      }

      const response = await request.post(`${BASE_URL}/api/v1/romanian-intelligence/process`, {
        data: testData
      })

      expect(response.ok()).toBeTruthy()
      const result = await response.json()

      expect(result.success).toBe(true)
      expect(result.language).toBe('romanian')
      expect(result.confidence).toBeGreaterThan(0.95)

      // Cultural analysis
      expect(result.cultural_analysis.formality).toBe('formal')
      expect(result.cultural_analysis.greeting_type).toBe('polite')
      expect(result.cultural_analysis.cultural_references).toContain('România')

      // Linguistic analysis
      expect(result.linguistic_analysis.diacritics_detected).toBe(true)
      expect(result.linguistic_analysis.diacritic_count).toBeGreaterThan(5)
      expect(result.linguistic_analysis.correctness_score).toBeGreaterThan(0.95)
    })

    test('handles Romanian regional dialects accurately', async ({ request }) => {
      const dialectTests = [
        {
          text: "Servus! Cum o mai duci prin Ardeal?",
          expected_region: "transylvania",
          expected_features: ["servus", "ardeal"]
        },
        {
          text: "Bună dimineața! Ce mai faceți în Moldova?",
          expected_region: "moldova",
          expected_features: ["dimineața"]
        }
      ]

      for (const test of dialectTests) {
        const response = await request.post(`${BASE_URL}/api/v1/romanian-intelligence/analyze-dialect`, {
          data: {
            text: test.text,
            detect_region: true,
            analyze_features: true
          }
        })

        expect(response.ok()).toBeTruthy()
        const result = await response.json()

        expect(result.success).toBe(true)
        expect(result.detected_region).toBe(test.expected_region)
        expect(result.confidence).toBeGreaterThan(0.75)

        test.expected_features.forEach(feature => {
          expect(result.dialect_features.some((f: any) =>
            f.feature.toLowerCase().includes(feature.toLowerCase())
          )).toBe(true)
        })
      }
    })
  })

  test.describe('Cultural Knowledge API', () => {
    test('answers Romanian cultural questions accurately', async ({ request }) => {
      const culturalQuestions = [
        {
          question: "Ce sărbătorim pe 1 decembrie în România?",
          expected_keywords: ["ziua națională", "marea unire", "1918"],
          category: "national_holidays"
        },
        {
          question: "Cine a scris romanul 'Mara'?",
          expected_keywords: ["ioan slavici"],
          category: "literature"
        },
        {
          question: "Ce ingrediente are tradiționalul cozonac românesc?",
          expected_keywords: ["făină", "ouă", "zahăr", "drojdie", "stafide"],
          category: "cuisine"
        }
      ]

      for (const q of culturalQuestions) {
        const response = await request.post(`${BASE_URL}/api/v1/cultural-knowledge/query`, {
          data: {
            question: q.question,
            language: "romanian",
            include_sources: true
          }
        })

        expect(response.ok()).toBeTruthy()
        const result = await response.json()

        expect(result.success).toBe(true)
        expect(result.cultural_accuracy).toBeGreaterThan(0.90)
        expect(result.category).toBe(q.category)

        // Check that answer contains expected keywords
        const answerLower = result.answer.toLowerCase()
        q.expected_keywords.forEach(keyword => {
          expect(answerLower).toContain(keyword.toLowerCase())
        })

        // Verify sources are provided
        expect(result.sources).toBeInstanceOf(Array)
        expect(result.sources.length).toBeGreaterThan(0)
      }
    })

    test('provides contextually appropriate responses', async ({ request }) => {
      const contextTests = [
        {
          question: "Cum salutăm în mediul de afaceri?",
          context: "business_formal",
          expected_formality: "formal",
          expected_elements: ["respect", "protocolare"]
        },
        {
          question: "Ce facem la o petrecere de familie?",
          context: "family_informal",
          expected_formality: "informal",
          expected_elements: ["familie", "distracție"]
        }
      ]

      for (const test of contextTests) {
        const response = await request.post(`${BASE_URL}/api/v1/cultural-knowledge/contextual-query`, {
          data: {
            question: test.question,
            context: test.context,
            language: "romanian"
          }
        })

        expect(response.ok()).toBeTruthy()
        const result = await response.json()

        expect(result.success).toBe(true)
        expect(result.detected_context.formality).toBe(test.expected_formality)

        const answerLower = result.answer.toLowerCase()
        test.expected_elements.forEach(element => {
          expect(answerLower).toContain(element.toLowerCase())
        })
      }
    })
  })

  test.describe('AGI Reasoning API', () => {
    test('performs deductive reasoning in Romanian', async ({ request }) => {
      const reasoningTest = {
        premise: "Toate rozele sunt flori. Aceasta este o roză.",
        query: "Ce putem concluziona despre acest obiect?",
        reasoning_type: "deductive"
      }

      const response = await request.post(`${BASE_URL}/api/v1/reasoning/logical`, {
        data: reasoningTest
      })

      expect(response.ok()).toBeTruthy()
      const result = await response.json()

      expect(result.success).toBe(true)
      expect(result.reasoning_type).toBe("deductive")
      expect(result.confidence).toBeGreaterThan(0.95)
      expect(result.conclusion.toLowerCase()).toContain("floare")

      // Verify reasoning chain
      expect(result.reasoning_steps).toBeInstanceOf(Array)
      expect(result.reasoning_steps.length).toBeGreaterThan(2)
      expect(result.logical_validity).toBe(true)
    })

    test('solves mathematical problems with Romanian explanations', async ({ request }) => {
      const mathProblems = [
        {
          problem: "Calculează rădăcina pătrată din 144",
          expected_answer: 12,
          type: "square_root"
        },
        {
          problem: "Rezolvă ecuația: 3x + 9 = 21",
          expected_answer: 4,
          type: "linear_equation"
        }
      ]

      for (const prob of mathProblems) {
        const response = await request.post(`${BASE_URL}/api/v1/reasoning/mathematical`, {
          data: {
            problem: prob.problem,
            language: "romanian",
            show_steps: true
          }
        })

        expect(response.ok()).toBeTruthy()
        const result = await response.json()

        expect(result.success).toBe(true)
        expect(result.answer).toBe(prob.expected_answer)
        expect(result.problem_type).toBe(prob.type)
        expect(result.confidence).toBeGreaterThan(0.98)

        // Solution steps should be in Romanian
        expect(result.solution_steps).toBeInstanceOf(Array)
        expect(result.solution_steps.length).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Conversation Management', () => {
    test('maintains conversation context across multiple turns', async ({ request }) => {
      const conversationId = `test-conversation-${Date.now()}`

      // First message
      const firstResponse = await request.post(`${BASE_URL}/api/v1/conversation/chat`, {
        data: {
          message: "Bună ziua! Mă numesc Alexandru și sunt din București.",
          conversation_id: conversationId,
          maintain_context: true
        }
      })

      expect(firstResponse.ok()).toBeTruthy()
      const firstResult = await firstResponse.json()
      expect(firstResult.success).toBe(true)
      expect(firstResult.conversation_context.message_count).toBe(1)

      // Second message referencing first
      const secondResponse = await request.post(`${BASE_URL}/api/v1/conversation/chat`, {
        data: {
          message: "Poți să îmi spui ceva interesant despre orașul meu?",
          conversation_id: conversationId,
          maintain_context: true
        }
      })

      expect(secondResponse.ok()).toBeTruthy()
      const secondResult = await secondResponse.json()
      expect(secondResult.success).toBe(true)
      expect(secondResult.conversation_context.message_count).toBe(2)

      // Should reference București in response
      expect(secondResult.response.toLowerCase()).toContain("bucurești")
      expect(secondResult.context_used).toBe(true)
    })

    test('handles conversation history retrieval', async ({ request }) => {
      const conversationId = `history-test-${Date.now()}`

      // Send multiple messages
      const messages = [
        "Salut! Sunt Maria.",
        "Îmi place să citesc cărți românești.",
        "Care e cartea ta preferată?"
      ]

      for (const message of messages) {
        await request.post(`${BASE_URL}/api/v1/conversation/chat`, {
          data: {
            message,
            conversation_id: conversationId,
            maintain_context: true
          }
        })
      }

      // Retrieve history
      const historyResponse = await request.get(
        `${BASE_URL}/api/v1/conversation/${conversationId}/history`
      )

      expect(historyResponse.ok()).toBeTruthy()
      const history = await historyResponse.json()

      expect(history.success).toBe(true)
      expect(history.messages).toBeInstanceOf(Array)
      expect(history.messages.length).toBeGreaterThanOrEqual(messages.length * 2) // user + agi messages

      // Verify message content
      messages.forEach(msg => {
        expect(history.messages.some((m: any) => m.content === msg)).toBe(true)
      })
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('handles malformed requests gracefully', async ({ request }) => {
      const malformedRequests = [
        { endpoint: '/api/v1/romanian-intelligence/process', data: {} },
        { endpoint: '/api/v1/reasoning/logical', data: { premise: "" } },
        { endpoint: '/api/v1/conversation/chat', data: { message: null } }
      ]

      for (const req of malformedRequests) {
        const response = await request.post(`${BASE_URL}${req.endpoint}`, {
          data: req.data
        })

        expect(response.status()).toBe(400)
        const result = await response.json()
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
        expect(result.error_code).toBeDefined()
      }
    })

    test('handles non-Romanian text appropriately', async ({ request }) => {
      const nonRomanianTexts = [
        { text: "Hello, how are you today?", language: "english" },
        { text: "Bonjour, comment allez-vous?", language: "french" },
        { text: "Hola, ¿cómo estás?", language: "spanish" }
      ]

      for (const test of nonRomanianTexts) {
        const response = await request.post(`${BASE_URL}/api/v1/romanian-intelligence/process`, {
          data: {
            message: test.text,
            context: "romanian",
            strict_romanian_only: false
          }
        })

        expect(response.ok()).toBeTruthy()
        const result = await response.json()

        expect(result.success).toBe(true)
        expect(result.detected_language).toBe(test.language)
        expect(result.is_romanian).toBe(false)
        expect(result.confidence).toBeLessThan(0.5)

        // Should provide language detection feedback
        expect(result.feedback).toContain("detected language")
      }
    })

    test('handles timeout scenarios correctly', async ({ request }) => {
      // Simulate complex reasoning that might timeout
      const complexQuery = {
        problem: `Rezolvă următorul sistem de ecuații cu explicații detaliate în română:
        x + 2y + 3z = 14
        2x - y + z = 5
        3x + y - 2z = -2
        
        Explică fiecare pas în detaliu și verifică soluția găsită.`,
        language: "romanian",
        detailed_explanation: true,
        verify_solution: true
      }

      const response = await request.post(`${BASE_URL}/api/v1/reasoning/mathematical`, {
        data: complexQuery
      })

      // Should either complete successfully or handle timeout gracefully
      if (response.ok()) {
        const result = await response.json()
        expect(result.success).toBe(true)
        expect(result.solution_steps.length).toBeGreaterThan(5)
      } else {
        expect(response.status()).toBe(408) // Request timeout
        const result = await response.json()
        expect(result.error).toContain("timeout")
      }
    })
  })

  test.describe('Performance and Load Testing', () => {
    test('handles concurrent requests efficiently', async ({ request }) => {
      const concurrentRequests = Array.from({ length: 10 }, (_, i) =>
        request.post(`${BASE_URL}/api/v1/romanian-intelligence/process`, {
          data: {
            message: `Mesajul concurrent numărul ${i + 1}: Bună ziua!`,
            context: "romanian"
          }
        })
      )

      const startTime = Date.now()
      const responses = await Promise.all(concurrentRequests)
      const endTime = Date.now()

      // All requests should complete within 5 seconds
      expect(endTime - startTime).toBeLessThan(5000)

      // All responses should be successful
      for (const response of responses) {
        expect(response.ok()).toBeTruthy()
        const result = await response.json()
        expect(result.success).toBe(true)
      }
    })

    test('maintains response quality under load', async ({ request }) => {
      const loadTestRequests = Array.from({ length: 20 }, (_, i) => ({
        message: `Test de încărcare ${i + 1}: Ce știi despre cultura românească?`,
        expected_keywords: ["cultură", "România", "tradiții"]
      }))

      const responses = await Promise.all(
        loadTestRequests.map(req =>
          request.post(`${BASE_URL}/api/v1/cultural-knowledge/query`, {
            data: {
              question: req.message,
              language: "romanian"
            }
          })
        )
      )

      // All responses should maintain quality
      for (let i = 0; i < responses.length; i++) {
        const response = responses[i]
        expect(response.ok()).toBeTruthy()

        const result = await response.json()
        expect(result.success).toBe(true)
        expect(result.cultural_accuracy).toBeGreaterThan(0.8)

        const answerLower = result.answer.toLowerCase()
        loadTestRequests[i].expected_keywords.forEach(keyword => {
          expect(answerLower).toContain(keyword.toLowerCase())
        })
      }
    })
  })
})