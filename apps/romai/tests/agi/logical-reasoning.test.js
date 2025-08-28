/**
 * ROMAI AGI Logical Reasoning Tests
 * Tests the core logical reasoning capabilities with Romanian cultural context
 */

import axios from 'axios'

const ROMAI_SERVER_URL = process.env.NEXT_PUBLIC_ROMAI_API_URL || 'http://localhost:6102'

describe('🧠 ROMAI AGI Logical Reasoning Tests', () => {
  let agiClient

  beforeAll(() => {
    agiClient = axios.create({
      baseURL: ROMAI_SERVER_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Test-Mode': 'true'
      }
    })
  })

  describe('Deductive Reasoning in Romanian', () => {
    const deductiveTests = [
      {
        premise: 'Toate rozele sunt flori. Aceasta este o roză.',
        expectedConclusion: 'Aceasta este o floare',
        reasoningType: 'deductive',
        expectedTerms: ['premisă', 'concluzie', 'deducție'],
        difficulty: 'medium'
      },
      {
        premise: 'Toți românii sunt europeni. Mihai este român.',
        expectedConclusion: 'Mihai este european',
        reasoningType: 'deductive',
        expectedTerms: ['toți', 'sunt', 'deci'],
        difficulty: 'medium'
      },
      {
        premise: 'Dacă plouă, atunci strada devine udă. Plouă acum.',
        expectedConclusion: 'Strada este udă acum',
        reasoningType: 'modus_ponens',
        expectedTerms: ['dacă', 'atunci', 'deci'],
        difficulty: 'medium'
      }
    ]

    test.each(deductiveTests)(
      'should perform deductive reasoning: $reasoningType',
      async ({ premise, expectedConclusion, reasoningType, expectedTerms, difficulty }) => {
        const startTime = Date.now()

        const response = await agiClient.post('/agi/logical-reasoning', {
          premise,
          language: 'ro',
          reasoningType: 'deductive',
          context: 'romanian_logical_patterns'
        })

        const processingTime = Date.now() - startTime

        // Validate response structure
        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('conclusion')
        expect(response.data).toHaveProperty('confidence')
        expect(response.data).toHaveProperty('reasoning')
        expect(response.data).toHaveProperty('reasoningType')

        // Validate logical accuracy
        expect(response.data.conclusion).toContain(expectedConclusion)
        expect(response.data.reasoningType).toBe(reasoningType)
        expect(response.data.confidence).toBeGreaterThan(0.90)

        // Validate Romanian language usage
        const reasoning = response.data.reasoning.toLowerCase()
        expect(global.validateRomanianText(reasoning).hasDiacritics).toBe(true)

        // Check for expected logical terms in Romanian
        expectedTerms.forEach(term => {
          expect(reasoning).toContain(term.toLowerCase())
        })

        // Validate performance
        const maxTime = global.AGI_PERFORMANCE_BENCHMARKS.maxResponseTime[difficulty]
        expect(processingTime).toBeLessThan(maxTime)

        // Validate reasoning steps
        expect(response.data.steps).toBeDefined()
        expect(response.data.steps.length).toBeGreaterThan(1)
        
        response.data.steps.forEach(step => {
          expect(global.validateRomanianText(step).hasDiacritics).toBe(true)
        })
      }
    )
  })

  describe('Inductive Reasoning and Pattern Recognition', () => {
    const inductiveTests = [
      {
        observations: [
          'Mihai studiază și ia note bune',
          'Ana studiază și ia note bune', 
          'Petru studiază și ia note bune'
        ],
        expectedPattern: 'Cine studiază ia note bune',
        reasoningType: 'inductive',
        expectedTerms: ['observație', 'model', 'generalizare']
      },
      {
        observations: [
          'Iarna în România este frig',
          'Vara în România este cald',
          'Primăvara în România este plăcut'
        ],
        expectedPattern: 'România are un climat temperat cu variații sezoniere',
        reasoningType: 'pattern_recognition',
        expectedTerms: ['sezon', 'climat', 'variații']
      },
      {
        observations: [
          'Luni a plouat',
          'Marți a plouat',
          'Miercuri a plouat'
        ],
        expectedPattern: 'Această săptămână este ploioasă',
        reasoningType: 'inductive',
        expectedTerms: ['model', 'probabilitate', 'previziune']
      }
    ]

    test.each(inductiveTests)(
      'should perform inductive reasoning: $reasoningType',
      async ({ observations, expectedPattern, reasoningType, expectedTerms }) => {
        const response = await agiClient.post('/agi/logical-reasoning', {
          observations,
          language: 'ro',
          reasoningType: 'inductive',
          requirePatternRecognition: true
        })

        // Validate logical inference
        expect(response.status).toBe(200)
        expect(response.data.pattern).toBeDefined()
        expect(response.data.confidence).toBeGreaterThan(0.80)

        // Validate pattern similarity to expected
        const patternLower = response.data.pattern.toLowerCase()
        const expectedLower = expectedPattern.toLowerCase()
        
        // Check for key concepts from expected pattern
        const keyWords = expectedLower.split(' ').filter(word => word.length > 3)
        const matchedWords = keyWords.filter(word => patternLower.includes(word))
        expect(matchedWords.length).toBeGreaterThan(keyWords.length * 0.6) // At least 60% concept overlap

        // Validate Romanian logical terminology
        expectedTerms.forEach(term => {
          const reasoning = response.data.reasoning.toLowerCase()
          expect(reasoning).toContain(term.toLowerCase())
        })

        // Validate inductive reasoning process
        expect(response.data.inductiveSteps).toBeDefined()
        expect(response.data.inductiveSteps.observations).toBeDefined()
        expect(response.data.inductiveSteps.pattern).toBeDefined()
        expect(response.data.inductiveSteps.confidence).toBeDefined()
      }
    )
  })

  describe('Logical Fallacy Detection', () => {
    const fallacyTests = [
      {
        argument: 'Dacă plouă, strada este udă. Strada este udă, deci plouă.',
        expectedFallacy: 'affirming_the_consequent',
        expectedExplanation: 'afirmarea consecventului',
        fallacyLevel: 'common'
      },
      {
        argument: 'Toți oamenii fac greșeli. Această decizie este o greșeală, deci a fost luată de un om.',
        expectedFallacy: 'affirming_the_consequent',
        expectedExplanation: 'reasoning inversat',
        fallacyLevel: 'intermediate'
      },
      {
        argument: 'Fie îmi cumperi mașina, fie ești un om rău.',
        expectedFallacy: 'false_dilemma',
        expectedExplanation: 'dilemă falsă',
        fallacyLevel: 'common'
      },
      {
        argument: 'Nu pot dovedi că fantomele nu există, deci fantomele există.',
        expectedFallacy: 'argument_from_ignorance',
        expectedExplanation: 'argumentul din ignoranță',
        fallacyLevel: 'advanced'
      }
    ]

    test.each(fallacyTests)(
      'should detect logical fallacy: $expectedFallacy',
      async ({ argument, expectedFallacy, expectedExplanation, fallacyLevel }) => {
        const response = await agiClient.post('/agi/logical-reasoning', {
          argument,
          language: 'ro',
          task: 'fallacy_detection',
          context: 'romanian_logical_analysis'
        })

        // Validate fallacy detection
        expect(response.status).toBe(200)
        expect(response.data.hasFallacy).toBe(true)
        expect(response.data.fallacyType).toBe(expectedFallacy)
        expect(response.data.confidence).toBeGreaterThan(0.85)

        // Validate Romanian explanation
        const explanation = response.data.explanation.toLowerCase()
        expect(global.validateRomanianText(explanation).hasDiacritics).toBe(true)
        expect(explanation).toContain(expectedExplanation.toLowerCase())

        // Validate detailed analysis
        expect(response.data.analysis).toBeDefined()
        expect(response.data.analysis.premises).toBeDefined()
        expect(response.data.analysis.conclusion).toBeDefined()
        expect(response.data.analysis.logicalFlow).toBeDefined()

        // Validate educational explanation in Romanian
        expect(response.data.educationalExplanation).toBeDefined()
        expect(response.data.educationalExplanation.whyFallacy).toBeDefined()
        expect(response.data.educationalExplanation.correctReasoning).toBeDefined()
      }
    )
  })

  describe('Romanian Cultural Logic Patterns', () => {
    const culturalLogicTests = [
      {
        scenario: 'La masa de Crăciun, dacă nu ești cu familia, înseamnă că nu ești acasă pentru sărbători.',
        expectedReasoning: 'cultural_conditional',
        culturalContext: 'romanian_christmas_traditions',
        expectedTerms: ['familie', 'sărbători', 'tradiție']
      },
      {
        scenario: 'Dacă cineva refuză țuica oferită de gazdă, poate fi considerat nepoliticos în cultura românească.',
        expectedReasoning: 'cultural_implication',
        culturalContext: 'romanian_hospitality_customs',
        expectedTerms: ['gazdă', 'politețe', 'cultură']
      },
      {
        scenario: 'În România, dacă spui "Noroc" la masă, trebuie să te uiți în ochii celui cu care ciocnești.',
        expectedReasoning: 'cultural_rule',
        culturalContext: 'romanian_dining_etiquette',
        expectedTerms: ['noroc', 'tradiție', 'respect']
      }
    ]

    test.each(culturalLogicTests)(
      'should understand Romanian cultural logic: $culturalContext',
      async ({ scenario, expectedReasoning, culturalContext, expectedTerms }) => {
        const response = await agiClient.post('/agi/logical-reasoning', {
          scenario,
          language: 'ro',
          task: 'cultural_logic_analysis',
          culturalContext: culturalContext
        })

        // Validate cultural understanding
        expect(response.status).toBe(200)
        expect(response.data.reasoning).toBeDefined()
        expect(response.data.culturalContext).toBe(culturalContext)
        expect(response.data.confidence).toBeGreaterThan(0.80)

        // Validate cultural reasoning
        expect(response.data.reasoningType).toBe(expectedReasoning)
        
        // Check for cultural terms
        const analysis = response.data.analysis.toLowerCase()
        expectedTerms.forEach(term => {
          expect(analysis).toContain(term.toLowerCase())
        })

        // Validate cultural depth
        expect(response.data.culturalAnalysis).toBeDefined()
        expect(response.data.culturalAnalysis.historicalContext).toBeDefined()
        expect(response.data.culturalAnalysis.modernRelevance).toBeDefined()
        expect(response.data.culturalAnalysis.regionalVariations).toBeDefined()
      }
    )
  })

  describe('Complex Multi-Step Logical Problems', () => {
    test('should solve complex logical puzzle in Romanian', async () => {
      const puzzle = `
        Într-un sat românesc sunt trei case: una roșie, una albă și una albastră.
        În casele acestea locuiesc un doctor, un învățător și un preot.
        Știm că:
        1. Doctorul nu locuiește în casa roșie
        2. Învățătorul locuiește în casa albă
        3. Preotul nu locuiește în casa albastră
        În ce casă locuiește fiecare?
      `

      const response = await agiClient.post('/agi/logical-reasoning', {
        problem: puzzle,
        language: 'ro',
        task: 'complex_logical_puzzle',
        requireStepByStep: true
      })

      expect(response.status).toBe(200)
      expect(response.data.solution).toBeDefined()
      expect(response.data.confidence).toBeGreaterThan(0.95)

      // Validate solution accuracy
      const solution = response.data.solution
      expect(solution.doctor).toBe('casa albastră')
      expect(solution.învățător).toBe('casa albă') 
      expect(solution.preot).toBe('casa roșie')

      // Validate step-by-step reasoning in Romanian
      expect(response.data.steps).toBeDefined()
      expect(response.data.steps.length).toBeGreaterThan(3)
      
      response.data.steps.forEach(step => {
        expect(global.validateRomanianText(step).hasDiacritics).toBe(true)
      })

      // Validate logical methodology
      expect(response.data.methodology).toContain('eliminare')
      expect(response.data.methodology).toContain('deducție')
    })

    test('should handle contradictory premises gracefully', async () => {
      const contradiction = `
        Toți românii vorbesc română.
        Mihai este român și nu vorbește română.
        Ce putem concluziona?
      `

      const response = await agiClient.post('/agi/logical-reasoning', {
        problem: contradiction,
        language: 'ro',
        task: 'contradiction_analysis'
      })

      expect(response.status).toBe(200)
      expect(response.data.hasContradiction).toBe(true)
      expect(response.data.contradictionType).toBe('premise_contradiction')
      
      // Validate Romanian explanation of the contradiction
      const explanation = response.data.explanation
      expect(global.validateRomanianText(explanation).hasDiacritics).toBe(true)
      expect(explanation.toLowerCase()).toContain('contradicție')
      expect(explanation.toLowerCase()).toContain('premise')
    })
  })

  describe('Performance and Reliability', () => {
    test('should maintain logical consistency across multiple requests', async () => {
      const consistencyTest = {
        premise: 'Toate păsările pot zbura. Pinguinii sunt păsări.',
        expectedHandling: 'exception_recognition'
      }

      const promises = Array(5).fill().map(() => 
        agiClient.post('/agi/logical-reasoning', {
          premise: consistencyTest.premise,
          language: 'ro',
          task: 'logical_consistency_check'
        })
      )

      const responses = await Promise.all(promises)

      // Validate all responses are consistent
      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.data.hasException).toBe(true)
        expect(response.data.exceptionType).toBe('real_world_exception')
        expect(response.data.confidence).toBeGreaterThan(0.85)
      })

      // Validate consistency across responses
      const conclusions = responses.map(r => r.data.conclusion)
      const firstConclusion = conclusions[0]
      conclusions.forEach(conclusion => {
        // Should be semantically similar (not necessarily identical)
        expect(conclusion.toLowerCase()).toContain('pinguini')
        expect(conclusion.toLowerCase()).toContain('excepție')
      })
    })

    test('should handle edge cases with graceful degradation', async () => {
      const edgeCases = [
        { input: '', expectedError: 'empty_input' },
        { input: 'A' * 10000, expectedError: 'input_too_long' },
        { input: '🤖 👨‍💻 🇷🇴', expectedError: 'invalid_logical_content' }
      ]

      for (const { input, expectedError } of edgeCases) {
        try {
          const response = await agiClient.post('/agi/logical-reasoning', {
            premise: input,
            language: 'ro'
          })

          if (response.status !== 200) {
            expect(response.status).toBeGreaterThanOrEqual(400)
            expect(response.data.error).toBeDefined()
            expect(global.validateRomanianText(response.data.error.message).hasDiacritics).toBe(true)
          }
        } catch (error) {
          expect(error.response.status).toBeGreaterThanOrEqual(400)
          expect(error.response.data.error).toBeDefined()
        }
      }
    })
  })

  afterAll(async () => {
    // Clean up test resources
  })
})