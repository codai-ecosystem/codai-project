import { describe, it, expect } from 'vitest'
import request from 'supertest'

const GATEWAY_BASE_URL = 'http://localhost:4000'

// Use the Gateway for all tests (Hub service is behind Gateway proxy)
const app = GATEWAY_BASE_URL

describe('Hub Service - Integration Tests', () => {
  describe('Service Architecture Understanding', () => {
    it('should be a Node.js service for service coordination and management', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.service).toBe('hub')
      expect(response.body.success).toBe(true)
      expect(response.body.status).toBe('operational')
    })

    it('should provide comprehensive health endpoint via Gateway proxy', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.timestamp).toBeDefined()
      expect(response.body.lastHealthCheck).toBeDefined()
      expect(response.body.success).toBe(true)
    })

    it('should include service coordination information', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.services).toBeDefined()
      expect(response.body.services.registered).toBeDefined()
      expect(response.body.services.healthy).toBeDefined()
      expect(response.body.crossServiceRequests).toBeDefined()
      expect(response.body.crossServiceRequests.lastHour).toBeDefined()
    })

    it('should include detailed system information', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.hubService).toBeDefined()
      expect(response.body.hubService.uptime).toBeDefined()
      expect(response.body.hubService.memory).toBeDefined()
      expect(response.body.hubService.platform).toBeDefined()
      expect(response.body.hubService.nodeVersion).toBeDefined()
    })
  })

  describe('Service Coordination Features', () => {
    it('should track registered services', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.services.registered).toBeGreaterThanOrEqual(0)
      expect(typeof response.body.services.registered).toBe('number')
    })

    it('should track healthy services', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.services.healthy).toBeGreaterThanOrEqual(0)
      expect(typeof response.body.services.healthy).toBe('number')
    })

    it('should monitor cross-service requests', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.crossServiceRequests).toBeDefined()
      expect(response.body.crossServiceRequests.lastHour).toBeGreaterThanOrEqual(0)
      expect(typeof response.body.crossServiceRequests.lastHour).toBe('number')
    })

    it('should validate service coordination capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      // Service coordination should be operational
      expect(response.body.status).toBe('operational')
      expect(response.body.success).toBe(true)
      
      // Should have service tracking capabilities
      expect(response.body.services).toBeDefined()
      expect(Object.keys(response.body.services)).toContain('registered')
      expect(Object.keys(response.body.services)).toContain('healthy')
    })
  })

  describe('System Metrics Validation', () => {
    it('should provide uptime metrics', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.hubService.uptime).toBeGreaterThan(0)
      expect(typeof response.body.hubService.uptime).toBe('number')
    })

    it('should provide memory monitoring metrics', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.hubService.memory).toBeDefined()
      expect(response.body.hubService.memory.rss).toBeGreaterThan(0)
      expect(response.body.hubService.memory.heapTotal).toBeGreaterThan(0)
      expect(response.body.hubService.memory.heapUsed).toBeGreaterThan(0)
      expect(response.body.hubService.memory.external).toBeGreaterThan(0)
      expect(response.body.hubService.memory.arrayBuffers).toBeGreaterThan(0)
    })

    it('should provide platform information', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.hubService.platform).toBeDefined()
      expect(typeof response.body.hubService.platform).toBe('string')
      expect(response.body.hubService.nodeVersion).toBeDefined()
      expect(response.body.hubService.nodeVersion).toMatch(/^v\d+\.\d+\.\d+$/)
    })

    it('should provide consistent timestamps', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      const timestamp = new Date(response.body.timestamp)
      const lastHealthCheck = new Date(response.body.lastHealthCheck)
      
      expect(timestamp.getTime()).toBeGreaterThan(0)
      expect(lastHealthCheck.getTime()).toBeGreaterThan(0)
      expect(Math.abs(timestamp.getTime() - lastHealthCheck.getTime())).toBeLessThan(1000) // Within 1 second
    })
  })

  describe('Gateway Integration & Performance', () => {
    it('should handle concurrent health check requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/v1/hub/health')
          .expect(200)
      )

      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.body.success).toBe(true)
        expect(response.body.service).toBe('hub')
        expect(response.body.status).toBe('operational')
      })
    })

    it('should respond to health checks within acceptable time', async () => {
      const startTime = Date.now()
      
      await request(app)
        .get('/api/v1/hub/health')
        .expect(200)
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(5000) // 5 seconds max
    })

    it('should maintain consistent response structure', async () => {
      const response1 = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      const response2 = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      // Both responses should have the same structure
      expect(Object.keys(response1.body).sort()).toEqual(Object.keys(response2.body).sort())
      expect(response1.body.service).toBe(response2.body.service)
      expect(response1.body.success).toBe(response2.body.success)
      expect(response1.body.status).toBe(response2.body.status)
    })

    it('should validate service availability through Gateway', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.service).toBe('hub')
      expect(response.body.status).toBe('operational')
      expect(response.body.hubService.uptime).toBeGreaterThan(0)
    })
  })

  describe('Service Discovery & Management', () => {
    it('should provide service registration metrics', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      // Service registration should be tracked
      expect(response.body.services.registered).toBeGreaterThanOrEqual(0)
      expect(response.body.services.healthy).toBeGreaterThanOrEqual(0)
      
      // Healthy services should not exceed registered services
      expect(response.body.services.healthy).toBeLessThanOrEqual(response.body.services.registered)
    })

    it('should monitor inter-service communication', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.crossServiceRequests).toBeDefined()
      expect(response.body.crossServiceRequests.lastHour).toBeGreaterThanOrEqual(0)
      
      // Should track communication patterns
      expect(typeof response.body.crossServiceRequests.lastHour).toBe('number')
    })

    it('should validate Hub service coordination capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      // Hub should be operational for service coordination
      expect(response.body.status).toBe('operational')
      expect(response.body.success).toBe(true)
      
      // Should have all required coordination features
      const requiredFields = ['services', 'crossServiceRequests', 'hubService']
      requiredFields.forEach(field => {
        expect(response.body[field]).toBeDefined()
      })
    })

    it('should provide health check status updates', async () => {
      const response = await request(app)
        .get('/api/v1/hub/health')
        .expect(200)

      expect(response.body.lastHealthCheck).toBeDefined()
      const healthCheckTime = new Date(response.body.lastHealthCheck)
      const currentTime = new Date()
      
      // Health check should be recent (within last minute)
      const timeDiff = currentTime.getTime() - healthCheckTime.getTime()
      expect(timeDiff).toBeLessThan(60000) // 60 seconds
    })
  })
})
