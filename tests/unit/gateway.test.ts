import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'

// Integration test using the running gateway service
describe('Gateway Service - Integration Tests', () => {
  const GATEWAY_URL = 'http://localhost:4000'

  // Service configurations based on actual API responses
  const serviceExpectations = {
    codai: {
      serviceName: 'codai',
      statusField: 'healthy',
      port: 4001
    },
    admin: {
      serviceName: 'codai-admin-service', 
      statusField: 'healthy',
      port: 4002
    },
    hub: {
      serviceName: 'hub',
      statusField: 'operational', 
      port: 4003
    },
    id: {
      serviceName: 'id-service',
      statusField: 'healthy',
      port: 4004
    },
    bancai: {
      serviceName: 'BancAI Service',
      statusField: 'healthy',
      port: 4005
    },
    memorai: {
      serviceName: 'MEMORAI',
      statusField: 'healthy', 
      port: 4006
    }
  }

  describe('Service Routing & Health Checks', () => {
    it('should route to CODAI service health endpoint', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      const expected = serviceExpectations.codai
      expect(response.body).toHaveProperty('status')
      expect(response.body.status).toBe(expected.statusField)
      expect(response.body).toHaveProperty('service')
      expect(response.body.service).toBe(expected.serviceName)
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('port')
      expect(response.body.port).toBe(expected.port)
      expect(response.body).toHaveProperty('version')
      expect(response.body).toHaveProperty('features')
      expect(Array.isArray(response.body.features)).toBe(true)
    })

    it('should route to Admin service health endpoint', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/admin/health')
        .expect(200)

      const expected = serviceExpectations.admin
      expect(response.body).toHaveProperty('status')
      expect(response.body.status).toBe(expected.statusField)
      expect(response.body).toHaveProperty('service')
      expect(response.body.service).toBe(expected.serviceName)
    })

    it('should route to Hub service health endpoint', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/hub/health')
        .expect(200)

      const expected = serviceExpectations.hub
      expect(response.body).toHaveProperty('status')
      expect(response.body.status).toBe(expected.statusField)
      expect(response.body).toHaveProperty('service')
      expect(response.body.service).toBe(expected.serviceName)
    })

    it('should route to ID service health endpoint', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/id/health')
        .expect(200)

      const expected = serviceExpectations.id
      expect(response.body).toHaveProperty('status')
      expect(response.body.status).toBe(expected.statusField)
      expect(response.body).toHaveProperty('service')
      expect(response.body.service).toBe(expected.serviceName)
    })

    it('should route to BancAI service health endpoint', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/bancai/health')
        .expect(200)

      const expected = serviceExpectations.bancai
      expect(response.body).toHaveProperty('status')
      expect(response.body.status).toBe(expected.statusField)
      expect(response.body).toHaveProperty('service')
      expect(response.body.service).toBe(expected.serviceName)
    })

    it('should route to MemorAI service health endpoint', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/memorai/health')
        .expect(200)

      const expected = serviceExpectations.memorai
      expect(response.body).toHaveProperty('status')
      expect(response.body.status).toBe(expected.statusField)
      expect(response.body).toHaveProperty('service')
      expect(response.body.service).toBe(expected.serviceName)
    })
  })

  describe('Proxy Functionality', () => {
    it('should properly proxy requests to underlying services', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      // Verify response structure matches service format
      expect(response.body).toHaveProperty('features')
      expect(Array.isArray(response.body.features)).toBe(true)
      expect(response.body).toHaveProperty('version')
      expect(response.body).toHaveProperty('port')
    })

    it('should handle non-existent service routes', async () => {
      await request(GATEWAY_URL)
        .get('/api/v1/nonexistent/health')
        .expect(404)
    })

    it('should handle invalid endpoints on valid services', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/codai/invalid-endpoint')

      // May return 401 (unauthorized) or 404 (not found) depending on service implementation
      expect([401, 404]).toContain(response.status)
    })

    it('should handle requests without API version', async () => {
      const response = await request(GATEWAY_URL)
        .get('/health')
        .expect(404)

      // Check if response provides any guidance
      expect(response.body).toHaveProperty('message')
    })
  })

  describe('Security Headers', () => {
    it('should handle CORS correctly', async () => {
      const response = await request(GATEWAY_URL)
        .options('/api/v1/codai/health')

      // Should handle OPTIONS request for CORS
      expect([200, 204]).toContain(response.status)
    })
  })

  describe('Performance', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now()

      await request(GATEWAY_URL)
        .get('/api/v1/codai/health')
        .expect(200)

      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(2000) // 2 seconds for proxy
    })

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() => 
        request(GATEWAY_URL).get('/api/v1/codai/health')
      )

      const responses = await Promise.all(requests)

      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.status).toBe('healthy')
      })
    })

    it('should handle concurrent requests to different services', async () => {
      const services = Object.keys(serviceExpectations)
      const requests = services.map(service => 
        request(GATEWAY_URL).get(`/api/v1/${service}/health`)
      )

      const responses = await Promise.all(requests)

      responses.forEach((response, index) => {
        const service = services[index]
        const expected = serviceExpectations[service]
        
        expect(response.status).toBe(200)
        expect(response.body.status).toBe(expected.statusField)
        expect(response.body.service).toBe(expected.serviceName)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle requests to root path', async () => {
      const response = await request(GATEWAY_URL)
        .get('/')

      // Should either redirect or provide API info
      expect([200, 404, 302]).toContain(response.status)
    })

    it('should handle malformed API requests', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/invalid-version/codai/health')

      expect([400, 404]).toContain(response.status)
    })

    it('should provide error response for invalid requests', async () => {
      const response = await request(GATEWAY_URL)
        .get('/health')
        .expect(404)

      expect(response.body).toHaveProperty('message')
    })
  })

  describe('Service Health Status', () => {
    it('should validate all core services are healthy/operational', async () => {
      const services = Object.keys(serviceExpectations)
      
      for (const service of services) {
        const expected = serviceExpectations[service]
        const response = await request(GATEWAY_URL)
          .get(`/api/v1/${service}/health`)
          .expect(200)

        expect(response.body.status).toBe(expected.statusField)
        expect(response.body.service).toBe(expected.serviceName)
        expect(response.body).toHaveProperty('timestamp')
      }
    })

    it('should validate service ports are correctly configured', async () => {
      const services = Object.keys(serviceExpectations)
      
      for (const service of services) {
        const expected = serviceExpectations[service]
        const response = await request(GATEWAY_URL)
          .get(`/api/v1/${service}/health`)
          .expect(200)

        // Some services may return port as string, some as number
        const port = typeof response.body.port === 'string' 
          ? parseInt(response.body.port) 
          : response.body.port
          
        if (response.body.port !== undefined) {
          expect(port).toBe(expected.port)
        }
      }
    })
  })
})
