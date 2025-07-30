import { describe, it, expect } from 'vitest'
import request from 'supertest'

const GATEWAY_URL = 'http://localhost:4000'
const CODAI_URL = 'http://localhost:4001'

describe('CODAI Service - Corrected Integration Tests', () => {
  describe('Service Architecture Understanding', () => {
    it('should be a Next.js application serving web interface', async () => {
      const response = await request(CODAI_URL)
        .get('/')
        .expect(200)

      // Should return HTML content
      expect(response.text).toContain('<!DOCTYPE html>')
      expect(response.text).toContain('Codai')
      expect(response.headers['content-type']).toContain('text/html')
    })

    it('should provide health endpoint via Gateway proxy only', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'healthy')
      expect(response.body).toHaveProperty('service', 'codai')
      expect(response.body).toHaveProperty('port', 4001)
      expect(response.body).toHaveProperty('version', '1.0.0')
      expect(response.body).toHaveProperty('timestamp')
    })

    it('should include all required service features in health response', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      const expectedFeatures = [
        'ai-assistant',
        'code-generation',
        'natural-language-processing',
        'intelligent-automation'
      ]

      expect(response.body).toHaveProperty('features')
      expect(Array.isArray(response.body.features)).toBe(true)
      expectedFeatures.forEach(feature => {
        expect(response.body.features).toContain(feature)
      })
    })
  })

  describe('Gateway Integration', () => {
    it('should require authentication for main API endpoints', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai')
        
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'Unauthorized')
      expect(response.body).toHaveProperty('code', 'TOKEN_REQUIRED')
    })

    it('should allow health checks without authentication', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      expect(response.body.status).toBe('healthy')
    })

    it('should handle concurrent health check requests', async () => {
      const promises = Array(5).fill(null).map(() =>
        request(GATEWAY_URL).get('/api/v1/codai/health')
      )

      const responses = await Promise.all(promises)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.status).toBe('healthy')
        expect(response.body.service).toBe('codai')
      })
    })
  })

  describe('Service Performance', () => {
    it('should respond to health checks within acceptable time', async () => {
      const startTime = Date.now()
      
      await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(2000) // 2 second maximum
    })

    it('should maintain consistent response format', async () => {
      const promises = Array(3).fill(null).map(() =>
        request(GATEWAY_URL).get('/api/v1/codai/health')
      )

      const responses = await Promise.all(promises)
      const firstResponse = responses[0].body
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
        // All responses should have same structure
        expect(Object.keys(response.body).sort()).toEqual(Object.keys(firstResponse).sort())
        expect(response.body.service).toBe(firstResponse.service)
        expect(response.body.version).toBe(firstResponse.version)
        expect(response.body.port).toBe(firstResponse.port)
      })
    })
  })

  describe('Service Validation', () => {
    it('should validate AI assistant capabilities', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      expect(response.body.features).toContain('ai-assistant')
    })

    it('should validate code generation capabilities', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      expect(response.body.features).toContain('code-generation')
    })

    it('should validate natural language processing capabilities', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      expect(response.body.features).toContain('natural-language-processing')
    })

    it('should validate intelligent automation capabilities', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      expect(response.body.features).toContain('intelligent-automation')
    })

    it('should not include unexpected features', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      // Features array should only contain expected features
      const expectedFeatures = [
        'ai-assistant',
        'code-generation',
        'natural-language-processing',
        'intelligent-automation'
      ]
      
      const unexpectedFeatures = response.body.features.filter(
        feature => !expectedFeatures.includes(feature)
      )
      
      expect(unexpectedFeatures).toHaveLength(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid Gateway routes gracefully', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/nonexistent')
        
      // Should return some form of error (404, 401, etc.)
      expect([400, 401, 404, 500]).toContain(response.status)
    })

    it('should validate service availability through Gateway', async () => {
      // Test multiple requests to ensure consistent availability
      const availability = []
      
      for (let i = 0; i < 10; i++) {
        try {
          const response = await request(GATEWAY_URL)
            .get('/api/v1/codai/health')
          availability.push(response.status === 200)
        } catch (error) {
          availability.push(false)
        }
      }

      const successRate = availability.filter(Boolean).length / availability.length
      expect(successRate).toBeGreaterThanOrEqual(0.9) // 90% availability minimum
    })
  })
})
