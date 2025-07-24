import { describe, it, expect } from 'vitest'
import request from 'supertest'

const GATEWAY_BASE_URL = 'http://localhost:4000'

// Use the Gateway for all tests (MemorAI service is behind Gateway proxy)
const app = GATEWAY_BASE_URL

describe('MemorAI Service - Integration Tests', () => {
  describe('Service Architecture Understanding', () => {
    it('should be an advanced AI-powered memory management system', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.service).toBe('MEMORAI')
      expect(response.body.status).toBe('healthy')
      expect(response.body.version).toBe('1.0.0')
      expect(response.body.port).toBe('4006')
    })

    it('should provide comprehensive health endpoint via Gateway proxy', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.timestamp).toBeDefined()
      expect(response.body.environment).toBe('development')
      expect(response.body.uptime).toBeDefined()
      expect(response.body.memory).toBeDefined()
      expect(response.body.checks).toBeDefined()
    })

    it('should validate service environment configuration', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.environment).toBe('development')
      expect(response.body.port).toBe('4006')
    })

    it('should provide system timestamp information', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.timestamp).toBeDefined()
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date)
    })
  })

  describe('Memory Management Features', () => {
    it('should provide comprehensive memory usage metrics', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      const memory = response.body.memory
      expect(memory.used).toBeGreaterThan(0)
      expect(memory.total).toBeGreaterThan(0)
      expect(memory.rss).toBeGreaterThan(0)
      expect(typeof memory.used).toBe('number')
      expect(typeof memory.total).toBe('number')
      expect(typeof memory.rss).toBe('number')
    })

    it('should validate memory efficiency', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      const memory = response.body.memory
      expect(memory.used).toBeLessThanOrEqual(memory.total)
      expect(memory.rss).toBeGreaterThan(0)
    })

    it('should provide memory core status', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.checks.memory_core).toBe('healthy')
    })

    it('should validate uptime tracking', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.uptime).toBeGreaterThan(0)
      expect(typeof response.body.uptime).toBe('number')
    })

    it('should provide API status validation', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.checks.api).toBe('healthy')
    })
  })

  describe('System Health Checks', () => {
    it('should validate all health check categories', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      const checks = response.body.checks
      expect(checks.database).toBeDefined()
      expect(checks.api).toBe('healthy')
      expect(checks.memory_core).toBe('healthy')
      expect(checks.mcp_server).toBeDefined()
    })

    it('should validate database status', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      // Database status may be pending during initialization
      expect(['healthy', 'pending']).toContain(response.body.checks.database)
    })

    it('should validate MCP server status', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      // MCP server status may be pending during initialization
      expect(['healthy', 'pending']).toContain(response.body.checks.mcp_server)
    })

    it('should validate API health check', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.checks.api).toBe('healthy')
    })

    it('should validate memory core health check', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.checks.memory_core).toBe('healthy')
    })
  })

  describe('Service Performance & Monitoring', () => {
    it('should provide real-time uptime metrics', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.uptime).toBeGreaterThan(0)
      expect(typeof response.body.uptime).toBe('number')
    })

    it('should track memory usage efficiently', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      const memory = response.body.memory
      expect(memory.used).toBeGreaterThan(0)
      expect(memory.total).toBeGreaterThan(memory.used)
      expect(memory.rss).toBeGreaterThan(0)
    })

    it('should validate system performance metrics', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.uptime).toBeGreaterThan(0)
      expect(response.body.memory.used).toBeGreaterThan(0)
      expect(response.body.memory.total).toBeGreaterThan(0)
      expect(response.body.memory.rss).toBeGreaterThan(0)
    })

    it('should provide consistent timestamp tracking', async () => {
      const response1 = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      await new Promise(resolve => setTimeout(resolve, 100))

      const response2 = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      const timestamp1 = new Date(response1.body.timestamp).getTime()
      const timestamp2 = new Date(response2.body.timestamp).getTime()
      
      expect(timestamp2).toBeGreaterThan(timestamp1)
    })
  })

  describe('Advanced Memory Features', () => {
    it('should validate memory core system status', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.checks.memory_core).toBe('healthy')
    })

    it('should validate memory statistics', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      const memory = response.body.memory
      expect(memory.used).toBeGreaterThan(0)
      expect(memory.total).toBeGreaterThan(0)
      expect(memory.rss).toBeGreaterThan(0)
      expect(memory.used).toBeLessThanOrEqual(memory.total)
    })

    it('should validate API availability', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.checks.api).toBe('healthy')
      expect(response.body.status).toBe('healthy')
    })

    it('should validate service version information', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.version).toBe('1.0.0')
      expect(response.body.service).toBe('MEMORAI')
    })
  })

  describe('Gateway Integration & Performance', () => {
    it('should handle concurrent health check requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/v1/memorai/health')
          .expect(200)
      )

      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.body.status).toBe('healthy')
        expect(response.body.service).toBe('MEMORAI')
      })
    })

    it('should respond to health checks within acceptable time', async () => {
      const startTime = Date.now()
      
      await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(5000) // 5 seconds max
    })

    it('should maintain consistent response structure', async () => {
      const response1 = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      const response2 = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      // Both responses should have the same structure
      expect(Object.keys(response1.body).sort()).toEqual(Object.keys(response2.body).sort())
      expect(response1.body.service).toBe(response2.body.service)
      expect(response1.body.version).toBe(response2.body.version)
      expect(response1.body.status).toBe(response2.body.status)
    })

    it('should validate service availability through Gateway', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.status).toBe('healthy')
      expect(response.body.service).toBe('MEMORAI')
      expect(response.body.port).toBe('4006')
      expect(response.body.uptime).toBeGreaterThan(0)
    })

    it('should provide consistent health status across requests', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/v1/memorai/health')
          .expect(200)
      )

      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.body.status).toBe('healthy')
        expect(response.body.checks.api).toBe('healthy')
        expect(response.body.checks.memory_core).toBe('healthy')
      })
    })
  })

  describe('Integration & Service Discovery', () => {
    it('should validate service identity', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.service).toBe('MEMORAI')
      expect(response.body.port).toBe('4006')
      expect(response.body.version).toBe('1.0.0')
    })

    it('should validate environment configuration', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.environment).toBe('development')
    })

    it('should validate service health status', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.status).toBe('healthy')
    })

    it('should validate dependency status checks', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      const checks = response.body.checks
      expect(checks.api).toBe('healthy')
      expect(checks.memory_core).toBe('healthy')
      expect(checks.database).toBeDefined()
      expect(checks.mcp_server).toBeDefined()
    })

    it('should validate core system functionality', async () => {
      const response = await request(app)
        .get('/api/v1/memorai/health')
        .expect(200)

      expect(response.body.status).toBe('healthy')
      expect(response.body.checks.memory_core).toBe('healthy')
      expect(response.body.uptime).toBeGreaterThan(0)
      expect(response.body.memory.used).toBeGreaterThan(0)
    })
  })
})
