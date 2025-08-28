/**
 * ROMAI AGI API Integration Tests
 * Tests the integration between Next.js frontend and FastAPI backend
 */

import request from 'supertest'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import axios from 'axios'

const port = parseInt(process.env.PORT, 10) || 3001
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

let server
let nextApp

describe('🔗 ROMAI AGI API Integration Tests', () => {
  beforeAll(async () => {
    // Initialize Next.js app
    await app.prepare()
    
    // Create HTTP server
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })

    // Start server
    await new Promise((resolve) => {
      server.listen(port, resolve)
    })

    nextApp = request(`http://localhost:${port}`)
  })

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve)
      })
    }
  })

  describe('AGI Server Health Checks', () => {
    test('should connect to AGI server health endpoint', async () => {
      const response = await axios.get('http://localhost:6102/health')
      
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('status', 'healthy')
      expect(response.data).toHaveProperty('service', 'romai-agi')
      expect(response.data).toHaveProperty('models')
      expect(response.data.models.loaded).toBeGreaterThan(0)
    })

    test('should validate AGI server capabilities endpoint', async () => {
      const response = await axios.get('http://localhost:6102/capabilities')
      
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('mathematical')
      expect(response.data).toHaveProperty('logical')
      expect(response.data).toHaveProperty('cultural')
      expect(response.data).toHaveProperty('linguistic')
      
      // Validate all capabilities are numbers between 0 and 100
      Object.values(response.data).forEach(capability => {
        expect(typeof capability).toBe('number')
        expect(capability).toBeGreaterThanOrEqual(0)
        expect(capability).toBeLessThanOrEqual(100)
      })
    })

    test('should check Romanian cultural processing availability', async () => {
      const response = await axios.get('http://localhost:6102/cultural/status')
      
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('romanianProcessing', true)
      expect(response.data).toHaveProperty('culturalDatabase')
      expect(response.data).toHaveProperty('linguisticModels')
      expect(response.data.culturalDatabase.romanianEntries).toBeGreaterThan(0)
    })
  })

  describe('Next.js API Route Integration', () => {
    test('should serve API route for AGI status', async () => {
      const response = await nextApp
        .get('/api/agi/status')
        .expect(200)

      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('capabilities')
      expect(response.body).toHaveProperty('performance')
      expect(response.body).toHaveProperty('culturalAnalysis')
      
      // Validate Romanian cultural analysis data
      expect(response.body.culturalAnalysis).toHaveProperty('romanianAccuracy')
      expect(response.body.culturalAnalysis.romanianAccuracy).toBeGreaterThan(0)
    })

    test('should handle mathematical reasoning API requests', async () => {
      const mathProblem = {
        problem: 'Calculați √144 + 25²',
        language: 'ro',
        context: 'romanian_mathematical_notation'
      }

      const response = await nextApp
        .post('/api/agi/mathematical-reasoning')
        .send(mathProblem)
        .expect(200)

      expect(response.body).toHaveProperty('result')
      expect(response.body).toHaveProperty('confidence')
      expect(response.body).toHaveProperty('reasoning')
      expect(response.body.result).toBe(637) // √144 + 25² = 12 + 625 = 637
      expect(response.body.confidence).toBeGreaterThan(0.95)
      
      // Validate Romanian language in reasoning
      expect(global.validateRomanianText(response.body.reasoning).hasDiacritics).toBe(true)
    })

    test('should handle logical reasoning API requests', async () => {
      const logicalPremise = {
        premise: 'Toate rozele sunt flori. Aceasta este o roză.',
        language: 'ro',
        reasoningType: 'deductive'
      }

      const response = await nextApp
        .post('/api/agi/logical-reasoning')
        .send(logicalPremise)
        .expect(200)

      expect(response.body).toHaveProperty('conclusion')
      expect(response.body).toHaveProperty('confidence')
      expect(response.body).toHaveProperty('reasoningType', 'deductive')
      expect(response.body.conclusion.toLowerCase()).toContain('floare')
      expect(response.body.confidence).toBeGreaterThan(0.90)
    })

    test('should handle Romanian cultural intelligence queries', async () => {
      const culturalQuery = {
        query: 'Explică-mi importanța Zilei Naționale a României',
        language: 'ro',
        domain: 'romanian_history'
      }

      const response = await nextApp
        .post('/api/agi/cultural-intelligence')
        .send(culturalQuery)
        .expect(200)

      expect(response.body).toHaveProperty('analysis')
      expect(response.body).toHaveProperty('culturalDepth')
      expect(response.body).toHaveProperty('historicalAccuracy')
      expect(response.body.culturalDepth).toBe('deep')
      expect(response.body.historicalAccuracy).toBeGreaterThan(0.90)
      
      // Validate content includes expected elements
      const analysis = response.body.analysis.toLowerCase()
      expect(analysis).toContain('1 decembrie')
      expect(analysis).toContain('mare unire')
      expect(analysis).toContain('1918')
    })
  })

  describe('Real-time WebSocket Integration', () => {
    test('should establish WebSocket connection for real-time updates', (done) => {
      const WebSocket = require('ws')
      const ws = new WebSocket('ws://localhost:6102/ws/realtime')

      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['agi_status', 'performance_metrics']
        }))
      })

      ws.on('message', (data) => {
        const message = JSON.parse(data)
        
        expect(message).toHaveProperty('type')
        expect(message).toHaveProperty('data')
        
        if (message.type === 'agi_status') {
          expect(message.data).toHaveProperty('capabilities')
          expect(message.data).toHaveProperty('performance')
          ws.close()
          done()
        }
      })

      ws.on('error', (error) => {
        done(error)
      })

      // Timeout after 10 seconds
      setTimeout(() => {
        ws.close()
        done(new Error('WebSocket connection timeout'))
      }, 10000)
    })

    test('should handle WebSocket Romanian language processing updates', (done) => {
      const WebSocket = require('ws')
      const ws = new WebSocket('ws://localhost:6102/ws/romanian')

      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'process_text',
          text: 'Această propoziție conține diacritice românești: ă, â, î, ș, ț',
          language: 'ro'
        }))
      })

      ws.on('message', (data) => {
        const message = JSON.parse(data)
        
        expect(message).toHaveProperty('type', 'text_processed')
        expect(message.data).toHaveProperty('diacriticsDetected')
        expect(message.data).toHaveProperty('languageScore')
        expect(message.data.diacriticsDetected).toContain('ă')
        expect(message.data.diacriticsDetected).toContain('ț')
        expect(message.data.languageScore).toBeGreaterThan(0.95)
        
        ws.close()
        done()
      })

      ws.on('error', (error) => {
        done(error)
      })
    })
  })

  describe('Database Integration', () => {
    test('should connect to Romanian cultural database', async () => {
      const response = await axios.get('http://localhost:6102/cultural/database/status')
      
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('connected', true)
      expect(response.data).toHaveProperty('collections')
      expect(response.data.collections).toHaveProperty('historical_figures')
      expect(response.data.collections).toHaveProperty('cultural_expressions')
      expect(response.data.collections).toHaveProperty('linguistic_patterns')
    })

    test('should query Romanian cultural data successfully', async () => {
      const culturalQuery = {
        collection: 'historical_figures',
        query: { name: 'Mihai Eminescu' },
        language: 'ro'
      }

      const response = await nextApp
        .post('/api/cultural/query')
        .send(culturalQuery)
        .expect(200)

      expect(response.body).toHaveProperty('results')
      expect(response.body.results).toBeInstanceOf(Array)
      expect(response.body.results.length).toBeGreaterThan(0)
      
      const eminescu = response.body.results[0]
      expect(eminescu).toHaveProperty('name', 'Mihai Eminescu')
      expect(eminescu).toHaveProperty('field', 'literatura română')
      expect(eminescu).toHaveProperty('importance')
      expect(eminescu.importance).toBeGreaterThan(0.95)
    })

    test('should handle cultural data updates and versioning', async () => {
      const updateData = {
        collection: 'cultural_expressions',
        update: {
          expression: 'Test cultural expression',
          meaning: 'Test meaning for integration test',
          type: 'test_idiom'
        },
        language: 'ro'
      }

      // Add test data
      const addResponse = await nextApp
        .post('/api/cultural/update')
        .send(updateData)
        .expect(200)

      expect(addResponse.body).toHaveProperty('success', true)
      expect(addResponse.body).toHaveProperty('version')

      // Verify data was added
      const queryResponse = await nextApp
        .post('/api/cultural/query')
        .send({
          collection: 'cultural_expressions',
          query: { expression: 'Test cultural expression' }
        })
        .expect(200)

      expect(queryResponse.body.results.length).toBeGreaterThan(0)

      // Clean up test data
      await nextApp
        .delete('/api/cultural/cleanup')
        .send({
          collection: 'cultural_expressions',
          query: { type: 'test_idiom' }
        })
        .expect(200)
    })
  })

  describe('Authentication and Authorization', () => {
    test('should require authentication for protected AGI endpoints', async () => {
      const response = await nextApp
        .post('/api/agi/train-model')
        .send({ modelType: 'cultural' })
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message.toLowerCase()).toContain('authentication')
    })

    test('should validate JWT tokens for Romanian cultural admin endpoints', async () => {
      const invalidToken = 'invalid.jwt.token'

      const response = await nextApp
        .post('/api/cultural/admin/update')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ action: 'update_database' })
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message.toLowerCase()).toContain('token')
    })
  })

  describe('Performance and Load Testing', () => {
    test('should handle concurrent AGI requests efficiently', async () => {
      const concurrentRequests = 10
      const requests = []

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          nextApp
            .post('/api/agi/mathematical-reasoning')
            .send({
              problem: `Calculați ${i + 1} × ${i + 2}`,
              language: 'ro'
            })
        )
      }

      const startTime = Date.now()
      const responses = await Promise.all(requests)
      const totalTime = Date.now() - startTime

      // Validate all requests succeeded
      responses.forEach((response, index) => {
        expect(response.status).toBe(200)
        expect(response.body.result).toBe((index + 1) * (index + 2))
        expect(response.body.confidence).toBeGreaterThan(0.95)
      })

      // Validate performance requirements
      expect(totalTime).toBeLessThan(5000) // All requests in under 5 seconds
      const avgTime = totalTime / concurrentRequests
      expect(avgTime).toBeLessThan(800) // Average per request under 800ms
    })

    test('should maintain Romanian language quality under load', async () => {
      const romanianTexts = [
        'Analizează această propoziție românească.',
        'Calculează rădăcina pătrată din 144.',
        'Explică-mi tradiția mărțișorului.',
        'Povestește despre Mihai Eminescu.',
        'Care este importanța Zilei Naționale?'
      ]

      const requests = romanianTexts.map(text => 
        nextApp
          .post('/api/agi/cultural-intelligence')
          .send({
            query: text,
            language: 'ro'
          })
      )

      const responses = await Promise.all(requests)

      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.confidence).toBeGreaterThan(0.85)
        
        // Validate Romanian language quality maintained
        const analysis = response.body.analysis
        expect(global.validateRomanianText(analysis).hasDiacritics).toBe(true)
        expect(response.body.languageQuality.diacriticsAccuracy).toBe(1.0)
        expect(response.body.languageQuality.grammarAccuracy).toBeGreaterThan(0.92)
      })
    })
  })

  describe('Error Handling and Recovery', () => {
    test('should handle AGI server downtime gracefully', async () => {
      // Mock AGI server being down
      const originalFetch = global.fetch
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'))

      const response = await nextApp
        .get('/api/agi/status')
        .expect(503)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message.toLowerCase()).toContain('server')
      expect(response.body).toHaveProperty('retry', true)
      
      // Validate Romanian error message
      expect(global.validateRomanianText(response.body.error.romanianMessage).hasDiacritics).toBe(true)

      // Restore original fetch
      global.fetch = originalFetch
    })

    test('should validate input sanitization for Romanian text', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '"; DROP TABLE users; --',
        '../../etc/passwd'
      ]

      for (const maliciousInput of maliciousInputs) {
        const response = await nextApp
          .post('/api/agi/cultural-intelligence')
          .send({
            query: maliciousInput,
            language: 'ro'
          })
          .expect(400)

        expect(response.body).toHaveProperty('error')
        expect(response.body.error.type).toBe('INVALID_INPUT')
        
        // Validate Romanian error message
        expect(global.validateRomanianText(response.body.error.message).hasDiacritics).toBe(true)
      }
    })

    test('should handle database connection failures', async () => {
      // This test would require mocking database connectivity
      // For integration test, we'll verify error handling structure
      
      const response = await nextApp
        .post('/api/cultural/query')
        .send({
          collection: 'nonexistent_collection',
          query: {}
        })
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.type).toBe('COLLECTION_NOT_FOUND')
      
      // Romanian error message
      expect(response.body.error.message).toContain('Colecția')
      expect(global.validateRomanianText(response.body.error.message).hasDiacritics).toBe(true)
    })
  })

  describe('Data Consistency and Integrity', () => {
    test('should maintain data consistency across AGI operations', async () => {
      // Test mathematical operation consistency
      const mathProblem = { problem: 'Calculați 15 + 27', language: 'ro' }
      
      const responses = await Promise.all([
        nextApp.post('/api/agi/mathematical-reasoning').send(mathProblem),
        nextApp.post('/api/agi/mathematical-reasoning').send(mathProblem),
        nextApp.post('/api/agi/mathematical-reasoning').send(mathProblem)
      ])

      // All should return the same result
      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.result).toBe(42)
        expect(response.body.confidence).toBeGreaterThan(0.98)
      })
    })

    test('should ensure Romanian cultural data integrity', async () => {
      const culturalQuery = {
        query: 'Cine a fost Mihai Eminescu?',
        language: 'ro',
        domain: 'romanian_literature'
      }

      const response = await nextApp
        .post('/api/agi/cultural-intelligence')
        .send(culturalQuery)
        .expect(200)

      // Validate core facts are correct
      const analysis = response.body.analysis.toLowerCase()
      expect(analysis).toContain('poet')
      expect(analysis).toContain('național')
      expect(analysis).toContain('român')
      
      // Validate data integrity
      expect(response.body.dataIntegrity).toBeDefined()
      expect(response.body.dataIntegrity.factualAccuracy).toBeGreaterThan(0.95)
      expect(response.body.dataIntegrity.sourceReliability).toBeGreaterThan(0.90)
    })
  })
})