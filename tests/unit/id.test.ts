import { describe, it, expect } from 'vitest'
import request from 'supertest'

const GATEWAY_BASE_URL = 'http://localhost:4000'

// Use the Gateway for all tests (ID service is behind Gateway proxy)
const app = GATEWAY_BASE_URL

describe('ID Service - Integration Tests', () => {
  describe('Service Architecture Understanding', () => {
    it('should be a real authentication and identity management service', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.service).toBe('id-service')
      expect(response.body.version).toBe('2.0.0-real')
      expect(response.body.description).toBe('CODAI Identity and Authentication Service - Real Implementation')
      expect(response.body.status).toBe('healthy')
    })

    it('should provide comprehensive health endpoint via Gateway proxy', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.timestamp).toBeDefined()
      expect(response.body.uptime).toBeGreaterThan(0)
      expect(response.body.nodeVersion).toBeDefined()
      expect(response.body.environment).toBe('development')
      expect(response.body.responseTime).toBeDefined()
    })

    it('should include comprehensive health checks', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.checks).toBeDefined()
      expect(response.body.checks.auth).toBeDefined()
      expect(response.body.checks.memory).toBeDefined()
      expect(response.body.checks.cpu).toBeDefined()
    })

    it('should provide authentication service endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.endpoints).toBeDefined()
      expect(response.body.endpoints.login).toBe('/api/auth/login')
      expect(response.body.endpoints.register).toBe('/api/auth/register')
      expect(response.body.endpoints.logout).toBe('/api/auth/logout')
      expect(response.body.endpoints.validate).toBe('/api/auth/validate')
      expect(response.body.endpoints.health).toBe('/api/health')
    })
  })

  describe('Authentication Features Validation', () => {
    it('should include comprehensive authentication features', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.features).toBeDefined()
      expect(response.body.features).toContain('real-authentication')
      expect(response.body.features).toContain('user-management')
      expect(response.body.features).toContain('session-management')
      expect(response.body.features).toContain('audit-logging')
      expect(response.body.features).toContain('metrics-monitoring')
      expect(response.body.features).toContain('file-based-storage')
      expect(response.body.features).toContain('jwt-tokens')
    })

    it('should validate authentication system health', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.checks.auth.status).toBe('healthy')
      expect(response.body.checks.auth.details.status).toBe('healthy')
    })

    it('should provide database connectivity information', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      const database = response.body.checks.auth.details.database
      expect(database.connected).toBe(true)
      expect(database.userCount).toBeGreaterThanOrEqual(0)
      expect(database.activeSessionsCount).toBeGreaterThanOrEqual(0)
      expect(database.storageType).toBe('file-based')
      expect(database.storagePath).toBeDefined()
    })

    it('should provide authentication metrics', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      const metrics = response.body.checks.auth.details.metrics
      expect(metrics.loginAttempts).toBeGreaterThanOrEqual(0)
      expect(metrics.loginSuccess).toBeGreaterThanOrEqual(0)
      expect(metrics.loginFailures).toBeGreaterThanOrEqual(0)
      expect(metrics.userRegistrations).toBeGreaterThanOrEqual(0)
    })

    it('should validate authentication service features', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      const authFeatures = response.body.checks.auth.details.features
      expect(authFeatures).toContain('authentication')
      expect(authFeatures).toContain('user-management')
      expect(authFeatures).toContain('session-management')
      expect(authFeatures).toContain('audit-logging')
    })
  })

  describe('System Health Monitoring', () => {
    it('should provide memory health status', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.checks.memory.status).toBe('healthy')
      expect(response.body.checks.memory.usage).toBeDefined()
      expect(response.body.checks.memory.usage.rss).toBeGreaterThan(0)
      expect(response.body.checks.memory.usage.heapTotal).toBeGreaterThan(0)
      expect(response.body.checks.memory.usage.heapUsed).toBeGreaterThan(0)
      expect(response.body.checks.memory.usage.external).toBeGreaterThan(0)
      expect(response.body.checks.memory.usage.arrayBuffers).toBeGreaterThan(0)
    })

    it('should provide memory usage in human-readable format', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.checks.memory.heapUsed).toMatch(/^\d+\s+MB$/)
      expect(response.body.checks.memory.heapTotal).toMatch(/^\d+\s+MB$/)
    })

    it('should provide CPU health status', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.checks.cpu.status).toBe('healthy')
      expect(response.body.checks.cpu.usage).toBeDefined()
      expect(response.body.checks.cpu.usage.user).toBeGreaterThanOrEqual(0)
      expect(response.body.checks.cpu.usage.system).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(response.body.checks.cpu.loadAverage)).toBe(true)
      expect(response.body.checks.cpu.loadAverage).toHaveLength(3)
    })

    it('should validate all health checks are passing', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.checks.auth.status).toBe('healthy')
      expect(response.body.checks.memory.status).toBe('healthy')
      expect(response.body.checks.cpu.status).toBe('healthy')
    })
  })

  describe('Service Information & Metrics', () => {
    it('should provide service uptime metrics', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.uptime).toBeGreaterThan(0)
      expect(typeof response.body.uptime).toBe('number')
    })

    it('should provide Node.js version information', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.nodeVersion).toBeDefined()
      expect(response.body.nodeVersion).toMatch(/^v\d+\.\d+\.\d+$/)
    })

    it('should provide response time metrics', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.responseTime).toBeDefined()
      expect(typeof response.body.responseTime).toBe('number')
      expect(response.body.responseTime).toBeGreaterThanOrEqual(0)
    })

    it('should validate service environment', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.environment).toBe('development')
    })
  })

  describe('Gateway Integration & Performance', () => {
    it('should handle concurrent health check requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/v1/id/health')
          .expect(200)
      )

      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.body.status).toBe('healthy')
        expect(response.body.service).toBe('id-service')
      })
    })

    it('should respond to health checks within acceptable time', async () => {
      const startTime = Date.now()
      
      await request(app)
        .get('/api/v1/id/health')
        .expect(200)
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(5000) // 5 seconds max
    })

    it('should maintain consistent response structure', async () => {
      const response1 = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      const response2 = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      // Both responses should have the same structure
      expect(Object.keys(response1.body).sort()).toEqual(Object.keys(response2.body).sort())
      expect(response1.body.service).toBe(response2.body.service)
      expect(response1.body.version).toBe(response2.body.version)
      expect(response1.body.status).toBe(response2.body.status)
    })

    it('should validate service availability through Gateway', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      expect(response.body.status).toBe('healthy')
      expect(response.body.service).toBe('id-service')
      expect(response.body.uptime).toBeGreaterThan(0)
    })
  })

  describe('File-Based Storage Validation', () => {
    it('should validate file-based storage system', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      const database = response.body.checks.auth.details.database
      expect(database.storageType).toBe('file-based')
      expect(database.storagePath).toBeDefined()
      expect(database.storagePath).toMatch(/auth-storage\.json$/)
    })

    it('should provide user and session counts', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      const database = response.body.checks.auth.details.database
      expect(database.userCount).toBeGreaterThanOrEqual(0)
      expect(database.activeSessionsCount).toBeGreaterThanOrEqual(0)
      expect(typeof database.userCount).toBe('number')
      expect(typeof database.activeSessionsCount).toBe('number')
    })

    it('should validate database connectivity', async () => {
      const response = await request(app)
        .get('/api/v1/id/health')
        .expect(200)

      const database = response.body.checks.auth.details.database
      expect(database.connected).toBe(true)
    })
  })
})
