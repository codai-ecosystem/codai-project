/**
 * ROMAI Romanian Cultural Intelligence Tests
 * Tests the deep understanding of Romanian culture, history, language, and traditions
 */

import axios from 'axios'

const ROMAI_SERVER_URL = process.env.NEXT_PUBLIC_ROMAI_API_URL || 'http://localhost:6102'

describe('🇷🇴 ROMAI Romanian Cultural Intelligence Tests', () => {
  let agiClient

  beforeAll(() => {
    agiClient = axios.create({
      baseURL: ROMAI_SERVER_URL,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Test-Mode': 'true'
      }
    })
  })

  describe('Romanian Historical Knowledge', () => {
    const historicalTests = [
      {
        query: 'Explică-mi importanța Zilei Naționale a României (1 Decembrie)',
        expectedElements: ['1 Decembrie', 'Marea Unire', '1918', 'Transilvania', 'Basarabia'],
        expectedAccuracy: 0.95,
        culturalDepth: 'deep',
        historicalPeriod: 'secolul XX'
      },
      {
        query: 'Cine a fost Mihai Eminescu și care este importanța sa culturală?',
        expectedElements: ['poet național', 'literatura română', 'romantism', 'Luceafărul'],
        expectedAccuracy: 0.98,
        culturalDepth: 'deep',
        historicalPeriod: 'secolul XIX'
      },
      {
        query: 'Povestește-mi despre Vlad Țepeș și legenda sa',
        expectedElements: ['Vlad Țepeș', 'Valahia', 'Dracula', 'otomani', 'justiție'],
        expectedAccuracy: 0.92,
        culturalDepth: 'complex',
        historicalPeriod: 'secolul XV'
      },
      {
        query: 'Care a fost rolul lui Ștefan cel Mare în istoria României?',
        expectedElements: ['Moldova', 'otomani', 'fortărețe', 'creștinism', 'independență'],
        expectedAccuracy: 0.94,
        culturalDepth: 'deep',
        historicalPeriod: 'secolul XV-XVI'
      }
    ]

    test.each(historicalTests)(
      'should demonstrate deep historical knowledge: $query',
      async ({ query, expectedElements, expectedAccuracy, culturalDepth, historicalPeriod }) => {
        const startTime = Date.now()

        const response = await agiClient.post('/agi/cultural-intelligence', {
          query,
          language: 'ro',
          domain: 'romanian_history',
          depthLevel: 'comprehensive'
        })

        const processingTime = Date.now() - startTime

        // Validate response structure
        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('analysis')
        expect(response.data).toHaveProperty('culturalDepth')
        expect(response.data).toHaveProperty('historicalAccuracy')
        expect(response.data).toHaveProperty('confidence')

        // Validate historical accuracy
        expect(response.data.historicalAccuracy).toBeGreaterThan(expectedAccuracy)
        expect(response.data.culturalDepth).toBe(culturalDepth)
        expect(response.data.confidence).toBeGreaterThan(0.90)

        // Validate content contains expected historical elements
        const content = response.data.analysis.toLowerCase()
        const matchedElements = expectedElements.filter(element => 
          content.includes(element.toLowerCase())
        )
        expect(matchedElements.length).toBeGreaterThan(expectedElements.length * 0.7)

        // Validate Romanian language quality
        expect(global.validateRomanianText(content).hasDiacritics).toBe(true)
        expect(response.data.languageQuality.diacriticsAccuracy).toBe(1.0)
        expect(response.data.languageQuality.grammarAccuracy).toBeGreaterThan(0.95)

        // Validate historical context
        expect(response.data.historicalContext).toBeDefined()
        expect(response.data.historicalContext.period).toContain(historicalPeriod)
        expect(response.data.historicalContext.significance).toBeDefined()

        // Validate performance
        expect(processingTime).toBeLessThan(8000)
      }
    )
  })

  describe('Romanian Literary and Artistic Knowledge', () => {
    const literaryTests = [
      {
        query: 'Analizează importanța culturală a poemului "Luceafărul" de Mihai Eminescu',
        expectedThemes: ['dragoste', 'nemurire', 'sacrificiu', 'mitologie'],
        author: 'Mihai Eminescu',
        genre: 'poezie romantică'
      },
      {
        query: 'Explică-mi opera lui Constantin Brâncuși și contribuția sa la arta modernă',
        expectedThemes: ['sculptură', 'simplitate', 'esență', 'modernism'],
        author: 'Constantin Brâncuși',
        genre: 'sculptură modernă'
      },
      {
        query: 'Care este importanța culturală a "Amintirilor din copilărie" de Ion Creangă?',
        expectedThemes: ['copilărie', 'tradiții', 'umor popular', 'educație'],
        author: 'Ion Creangă',
        genre: 'proză autobiografică'
      }
    ]

    test.each(literaryTests)(
      'should analyze Romanian literary works: $author',
      async ({ query, expectedThemes, author, genre }) => {
        const response = await agiClient.post('/agi/cultural-intelligence', {
          query,
          language: 'ro',
          domain: 'romanian_literature_arts',
          analysisType: 'literary_cultural_analysis'
        })

        // Validate literary analysis
        expect(response.status).toBe(200)
        expect(response.data.literaryAnalysis).toBeDefined()
        expect(response.data.culturalSignificance).toBeGreaterThan(0.88)
        expect(response.data.confidence).toBeGreaterThan(0.90)

        // Validate author and genre recognition
        expect(response.data.literaryAnalysis.author).toBe(author)
        expect(response.data.literaryAnalysis.genre).toContain(genre)

        // Validate thematic analysis
        const themes = response.data.literaryAnalysis.themes.map(t => t.toLowerCase())
        const matchedThemes = expectedThemes.filter(theme => 
          themes.some(t => t.includes(theme.toLowerCase()))
        )
        expect(matchedThemes.length).toBeGreaterThan(expectedThemes.length * 0.6)

        // Validate cultural context
        expect(response.data.culturalContext).toBeDefined()
        expect(response.data.culturalContext.historicalPeriod).toBeDefined()
        expect(response.data.culturalContext.culturalMovement).toBeDefined()
        expect(response.data.culturalContext.influence).toBeDefined()

        // Validate Romanian literary terminology
        const analysis = response.data.analysis.toLowerCase()
        expect(analysis).toContain('cultură')
        expect(analysis).toContain('literatură')
        expect(global.validateRomanianText(analysis).hasDiacritics).toBe(true)
      }
    )
  })

  describe('Romanian Language and Linguistic Features', () => {
    const linguisticTests = [
      {
        text: 'Această propoziție conține toate diacriticele românești: ă, â, î, ș, ț',
        expectedFeatures: {
          diacritics: ['ă', 'â', 'î', 'ș', 'ț'],
          languageFamily: 'latin_romance',
          complexity: 'standard'
        }
      },
      {
        text: 'Mergând prin pădurea înfrunzită, am întâlnit un țăran bătrân care își îndruma boii către sat.',
        expectedFeatures: {
          literaryElements: ['gerunziu', 'epitet', 'narativă'],
          languageFamily: 'latin_romance',
          complexity: 'literary'
        }
      },
      {
        text: 'Noroc bun și la mulți ani! Să fiți sănătoși și fericiți!',
        expectedFeatures: {
          type: 'traditional_greeting',
          culturalContext: 'celebration',
          complexity: 'formulaic'
        }
      }
    ]

    test.each(linguisticTests)(
      'should analyze Romanian linguistic features: $text',
      async ({ text, expectedFeatures }) => {
        const response = await agiClient.post('/agi/cultural-intelligence', {
          text,
          language: 'ro',
          domain: 'romanian_linguistics',
          analysisType: 'comprehensive_linguistic_analysis'
        })

        // Validate linguistic analysis
        expect(response.status).toBe(200)
        expect(response.data.linguisticAnalysis).toBeDefined()
        expect(response.data.confidence).toBeGreaterThan(0.92)

        // Validate diacritics detection if expected
        if (expectedFeatures.diacritics) {
          const detectedDiacritics = response.data.linguisticAnalysis.diacritics
          expectedFeatures.diacritics.forEach(diacritic => {
            expect(detectedDiacritics).toContain(diacritic)
          })
          expect(response.data.linguisticAnalysis.diacriticsAccuracy).toBe(1.0)
        }

        // Validate language family
        if (expectedFeatures.languageFamily) {
          expect(response.data.linguisticAnalysis.languageFamily).toBe(expectedFeatures.languageFamily)
        }

        // Validate complexity assessment
        if (expectedFeatures.complexity) {
          expect(response.data.linguisticAnalysis.complexity).toBe(expectedFeatures.complexity)
        }

        // Validate grammatical analysis
        expect(response.data.linguisticAnalysis.grammaticalFeatures).toBeDefined()
        expect(response.data.linguisticAnalysis.syntaxAnalysis).toBeDefined()
        expect(response.data.linguisticAnalysis.morphologyAnalysis).toBeDefined()

        // Validate cultural context if present
        if (expectedFeatures.culturalContext) {
          expect(response.data.culturalContext).toContain(expectedFeatures.culturalContext)
        }
      }
    )
  })

  describe('Romanian Cultural Expressions and Idioms', () => {
    const culturalExpressions = [
      {
        expression: 'A băga bățul prin gard',
        expectedMeaning: 'provoca conflict',
        expressionType: 'idiom',
        culturalSignificance: 0.85,
        origin: 'rural_traditional'
      },
      {
        expression: 'Cât trăiești, înveți',
        expectedMeaning: 'învățare continuă',
        expressionType: 'proverb',
        culturalSignificance: 0.90,
        origin: 'popular_wisdom'
      },
      {
        expression: 'Cu vorba bună treci și pe la Dumnezeu în casă',
        expectedMeaning: 'puterea cuvintelor frumoase',
        expressionType: 'proverb',
        culturalSignificance: 0.88,
        origin: 'religious_traditional'
      },
      {
        expression: 'A face pe dracu-n patru',
        expectedMeaning: 'efort extrem pentru a rezolva ceva',
        expressionType: 'idiom',
        culturalSignificance: 0.82,
        origin: 'popular_colloquial'
      }
    ]

    test.each(culturalExpressions)(
      'should understand Romanian cultural expression: $expression',
      async ({ expression, expectedMeaning, expressionType, culturalSignificance, origin }) => {
        const response = await agiClient.post('/agi/cultural-intelligence', {
          expression,
          language: 'ro',
          domain: 'romanian_cultural_expressions',
          analysisType: 'idiom_proverb_analysis'
        })

        // Validate cultural understanding
        expect(response.status).toBe(200)
        expect(response.data.expressionAnalysis).toBeDefined()
        expect(response.data.culturalSignificance).toBeGreaterThan(culturalSignificance * 0.9)
        expect(response.data.confidence).toBeGreaterThan(0.85)

        // Validate expression type
        expect(response.data.expressionAnalysis.type).toBe(expressionType)

        // Validate meaning understanding
        const meaning = response.data.expressionAnalysis.meaning.toLowerCase()
        expect(meaning).toContain(expectedMeaning.toLowerCase())

        // Validate cultural context
        expect(response.data.culturalContext).toBeDefined()
        expect(response.data.culturalContext.origin).toContain(origin)
        expect(response.data.culturalContext.modernUsage).toBeDefined()
        expect(response.data.culturalContext.regionalVariations).toBeDefined()

        // Validate examples and usage
        expect(response.data.usageExamples).toBeDefined()
        expect(response.data.usageExamples.length).toBeGreaterThan(1)

        // Validate Romanian explanation quality
        const explanation = response.data.explanation
        expect(global.validateRomanianText(explanation).hasDiacritics).toBe(true)
        expect(explanation).toContain('expresie')
        expect(explanation).toContain('înseamnă')
      }
    )
  })

  describe('Romanian Traditions and Customs', () => {
    const traditionTests = [
      {
        tradition: 'Sărbătoarea Mărțișorului',
        expectedElements: ['1 martie', 'primăvara', 'mărțișor alb și roșu', 'femei'],
        traditionalValue: 0.95,
        modernRelevance: 0.90
      },
      {
        tradition: 'Colinde de Crăciun',
        expectedElements: ['Crăciun', 'copii', 'cântece tradiționale', 'familie'],
        traditionalValue: 0.98,
        modernRelevance: 0.92
      },
      {
        tradition: 'Paștele românesc',
        expectedElements: ['ouă roșii', 'miel', 'resurecție', 'tradițiCitări ortodoxe'],
        traditionalValue: 0.97,
        modernRelevance: 0.94
      },
      {
        tradition: 'Hora - dansul tradițional',
        expectedElements: ['dans în cerc', 'unire', 'comunitate', 'muzică populară'],
        traditionalValue: 0.93,
        modernRelevance: 0.85
      }
    ]

    test.each(traditionTests)(
      'should understand Romanian traditions: $tradition',
      async ({ tradition, expectedElements, traditionalValue, modernRelevance }) => {
        const response = await agiClient.post('/agi/cultural-intelligence', {
          tradition,
          language: 'ro',
          domain: 'romanian_traditions_customs',
          analysisType: 'tradition_analysis',
          includeModernContext: true
        })

        // Validate tradition understanding
        expect(response.status).toBe(200)
        expect(response.data.traditionAnalysis).toBeDefined()
        expect(response.data.traditionalValue).toBeGreaterThan(traditionalValue * 0.9)
        expect(response.data.modernRelevance).toBeGreaterThan(modernRelevance * 0.8)
        expect(response.data.confidence).toBeGreaterThan(0.88)

        // Validate expected elements
        const analysis = response.data.analysis.toLowerCase()
        const matchedElements = expectedElements.filter(element => 
          analysis.includes(element.toLowerCase())
        )
        expect(matchedElements.length).toBeGreaterThan(expectedElements.length * 0.6)

        // Validate cultural depth
        expect(response.data.culturalAnalysis).toBeDefined()
        expect(response.data.culturalAnalysis.historicalOrigin).toBeDefined()
        expect(response.data.culturalAnalysis.symbolism).toBeDefined()
        expect(response.data.culturalAnalysis.regionalVariations).toBeDefined()
        expect(response.data.culturalAnalysis.modernAdaptations).toBeDefined()

        // Validate Romanian cultural terminology
        expect(analysis).toContain('tradiție')
        expect(analysis).toContain('cultură')
        expect(global.validateRomanianText(analysis).hasDiacritics).toBe(true)
      }
    )
  })

  describe('Contemporary Romanian Culture', () => {
    const contemporaryTests = [
      {
        topic: 'Cinema românesc contemporan',
        expectedAspects: ['Cristian Mungiu', 'Corneliu Porumboiu', 'Noul Val Românesc'],
        culturalPeriod: 'secolele XX-XXI',
        globalRelevance: 0.85
      },
      {
        topic: 'Muzica românească modernă',
        expectedAspects: ['pop românesc', 'manele', 'rock românesc', 'folk contemporan'],
        culturalPeriod: 'secolului XXI',
        globalRelevance: 0.75
      },
      {
        topic: 'Tehnologia și inovația în România',
        expectedAspects: ['startup-uri', 'IT', 'Bucuresti', 'Cluj-Napoca'],
        culturalPeriod: 'secolul XXI',
        globalRelevance: 0.88
      }
    ]

    test.each(contemporaryTests)(
      'should understand contemporary Romanian culture: $topic',
      async ({ topic, expectedAspects, culturalPeriod, globalRelevance }) => {
        const response = await agiClient.post('/agi/cultural-intelligence', {
          topic,
          language: 'ro',
          domain: 'contemporary_romanian_culture',
          timeframe: 'modern',
          globalContext: true
        })

        // Validate contemporary understanding
        expect(response.status).toBe(200)
        expect(response.data.contemporaryAnalysis).toBeDefined()
        expect(response.data.globalRelevance).toBeGreaterThan(globalRelevance * 0.8)
        expect(response.data.confidence).toBeGreaterThan(0.80)

        // Validate expected aspects
        const analysis = response.data.analysis.toLowerCase()
        const matchedAspects = expectedAspects.filter(aspect => 
          analysis.includes(aspect.toLowerCase())
        )
        expect(matchedAspects.length).toBeGreaterThan(expectedAspects.length * 0.5)

        // Validate temporal context
        expect(response.data.temporalContext.period).toContain(culturalPeriod)
        expect(response.data.temporalContext.trends).toBeDefined()
        expect(response.data.temporalContext.evolution).toBeDefined()

        // Validate global context
        if (globalRelevance > 0.8) {
          expect(response.data.globalContext).toBeDefined()
          expect(response.data.globalContext.internationalRecognition).toBeDefined()
        }
      }
    )
  })

  describe('Cultural Intelligence Performance', () => {
    test('should maintain cultural accuracy under concurrent requests', async () => {
      const culturalQueries = [
        'Cine a fost Mihai Eminescu?',
        'Ce este mărțișorul?', 
        'Explică-mi importanța Paștelui în România',
        'Povestește-mi despre Vlad Țepeș',
        'Ce reprezintă hora pentru români?'
      ]

      const promises = culturalQueries.map(query => 
        agiClient.post('/agi/cultural-intelligence', {
          query,
          language: 'ro',
          domain: 'romanian_general_culture'
        })
      )

      const responses = await Promise.all(promises)

      // Validate all responses
      responses.forEach((response, index) => {
        expect(response.status).toBe(200)
        expect(response.data.confidence).toBeGreaterThan(0.85)
        expect(response.data.culturalAccuracy).toBeGreaterThan(0.90)
        
        // Validate Romanian language quality
        const content = response.data.analysis
        expect(global.validateRomanianText(content).hasDiacritics).toBe(true)
      })

      // Validate performance metrics
      const avgConfidence = responses.reduce((sum, r) => sum + r.data.confidence, 0) / responses.length
      expect(avgConfidence).toBeGreaterThan(0.88)
    })

    test('should handle cultural nuances and context-dependent meanings', async () => {
      const nuancedQuery = `
        Explică diferența culturală între felul în care sărbătoresc românii din Transilvania 
        versus cei din Muntenia ziua de Crăciun, ținând cont de influențele istorice.
      `

      const response = await agiClient.post('/agi/cultural-intelligence', {
        query: nuancedQuery,
        language: 'ro',
        domain: 'romanian_regional_culture',
        requireNuancedAnalysis: true
      })

      expect(response.status).toBe(200)
      expect(response.data.culturalNuancing).toBeDefined()
      expect(response.data.confidence).toBeGreaterThan(0.82)

      // Validate regional understanding
      const analysis = response.data.analysis.toLowerCase()
      expect(analysis).toContain('transilvania')
      expect(analysis).toContain('muntenia')
      expect(analysis).toContain('diferență')
      expect(analysis).toContain('influență')

      // Validate historical context awareness
      expect(response.data.historicalInfluences).toBeDefined()
      expect(response.data.regionalVariations).toBeDefined()
      expect(response.data.culturalNuances).toBeDefined()
    })
  })

  afterAll(async () => {
    // Cleanup cultural test resources
  })
})