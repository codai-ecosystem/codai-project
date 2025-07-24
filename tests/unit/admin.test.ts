import { describe, it, expect } from 'vitest'
import request from 'supertest'

const GATEWAY_BASE_URL = 'http://localhost:4000'

// Use the Gateway for all tests (Admin service is behind Gateway proxy)
const app = GATEWAY_BASE_URL

describe('Admin Service - Integration Tests', () => {
  describe('Service Architecture Understanding', () => {
    it('should be a Next.js application serving admin dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.framework).toBe('Next.js 15')
      expect(response.body.service).toBe('codai-admin-service')
      expect(response.body.version).toBe('1.0.0')
    })

    it('should provide comprehensive health endpoint via Gateway proxy', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.status).toBe('healthy')
      expect(response.body.timestamp).toBeDefined()
      expect(response.body.port).toBe('4002')
      expect(response.body.environment).toBe('development')
    })

    it('should include detailed system monitoring information', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.memory).toBeDefined()
      expect(response.body.admin).toBeDefined()
      expect(response.body.admin.cpu).toBeDefined()
      expect(response.body.admin.memory).toBeDefined()
      expect(response.body.admin.database).toBeDefined()
      expect(response.body.admin.api).toBeDefined()
      expect(response.body.admin.cache).toBeDefined()
      expect(response.body.admin.adminMetrics).toBeDefined()
    })

    it('should include CND status monitoring', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.cnd).toBeDefined()
      expect(response.body.cnd.status).toBeDefined()
      expect(response.body.cnd.checks).toBeDefined()
      expect(response.body.cnd.checks.memory).toBeDefined()
      expect(response.body.cnd.checks.errorRate).toBeDefined()
      expect(response.body.cnd.checks.responseTime).toBeDefined()
    })
  })

  describe('Admin Features Validation', () => {
    it('should include core admin features', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.features).toBeDefined()
      expect(response.body.features.enterpriseFeatures).toBe(true)
      expect(response.body.cnd.adminFeatures).toBeDefined()
    })

    it('should validate user management capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.features.userManagement).toBe(true)
      expect(response.body.cnd.adminFeatures.userManagement).toBe(true)
    })

    it('should validate role-based access control', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.features.roleBasedAccess).toBe(true)
      expect(response.body.cnd.adminFeatures.roleBasedAccess).toBe(true)
    })

    it('should validate permission system', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.features.permissionSystem).toBe(true)
      expect(response.body.cnd.adminFeatures.permissionSystem).toBe(true)
    })

    it('should validate audit logging capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.features.auditLogging).toBe(true)
      expect(response.body.cnd.adminFeatures.auditLogging).toBe(true)
    })

    it('should validate system monitoring capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.features.systemMonitoring).toBe(true)
      expect(response.body.cnd.adminFeatures.systemMonitoring).toBe(true)
    })
  })

  describe('System Metrics Validation', () => {
    it('should provide CPU monitoring metrics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.admin.cpu).toBeDefined()
      expect(response.body.admin.cpu.usage).toBeDefined()
      expect(response.body.admin.cpu.loadAverage).toBeDefined()
      expect(Array.isArray(response.body.admin.cpu.loadAverage)).toBe(true)
    })

    it('should provide memory monitoring metrics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.admin.memory).toBeDefined()
      expect(response.body.admin.memory.used).toBeGreaterThan(0)
      expect(response.body.admin.memory.total).toBeGreaterThan(0)
      expect(response.body.admin.memory.percentage).toBeGreaterThan(0)
      expect(response.body.admin.memory.heapUsed).toBeGreaterThan(0)
      expect(response.body.admin.memory.heapTotal).toBeGreaterThan(0)
    })

    it('should provide database monitoring metrics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.admin.database).toBeDefined()
      expect(response.body.admin.database.activeConnections).toBeDefined()
      expect(response.body.admin.database.totalQueries).toBeDefined()
      expect(response.body.admin.database.avgQueryTime).toBeDefined()
      expect(response.body.admin.database.slowQueries).toBeDefined()
    })

    it('should provide API performance metrics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.admin.api).toBeDefined()
      expect(response.body.admin.api.totalRequests).toBeDefined()
      expect(response.body.admin.api.avgResponseTime).toBeDefined()
      expect(response.body.admin.api.errorRate).toBeDefined()
      expect(response.body.admin.api.throughput).toBeDefined()
    })

    it('should provide cache performance metrics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.admin.cache).toBeDefined()
      expect(response.body.admin.cache.hitRate).toBeDefined()
      expect(response.body.admin.cache.missRate).toBeDefined()
      expect(response.body.admin.cache.evictions).toBeDefined()
      expect(response.body.admin.cache.totalKeys).toBeDefined()
    })

    it('should provide admin-specific metrics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.admin.adminMetrics).toBeDefined()
      expect(response.body.admin.adminMetrics.totalUsers).toBeDefined()
      expect(response.body.admin.adminMetrics.activeUsers).toBeDefined()
      expect(response.body.admin.adminMetrics.activeSessions).toBeDefined()
      expect(response.body.admin.adminMetrics.auditLogsToday).toBeDefined()
    })
  })

  describe('Gateway Integration & Performance', () => {
    it('should handle concurrent health check requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/v1/admin/health')
          .expect(200)
      )

      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.body.status).toBe('healthy')
        expect(response.body.service).toBe('codai-admin-service')
      })
    })

    it('should respond to health checks within acceptable time', async () => {
      const startTime = Date.now()
      
      await request(app)
        .get('/api/v1/admin/health')
        .expect(200)
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(5000) // 5 seconds max
    })

    it('should maintain consistent response structure', async () => {
      const response1 = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      const response2 = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      // Both responses should have the same structure
      expect(Object.keys(response1.body).sort()).toEqual(Object.keys(response2.body).sort())
      expect(response1.body.service).toBe(response2.body.service)
      expect(response1.body.framework).toBe(response2.body.framework)
    })

    it('should validate service availability through Gateway', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.status).toBe('healthy')
      expect(response.body.service).toBe('codai-admin-service')
      expect(response.body.port).toBe('4002')
      expect(response.body.uptime).toBeGreaterThan(0)
    })
  })

  describe('CND Integration Validation', () => {
    it('should include CND status information', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.cnd).toBeDefined()
      expect(response.body.cnd.status).toBeDefined()
      expect(['healthy', 'warning', 'critical'].includes(response.body.cnd.status)).toBe(true)
    })

    it('should validate CND health check components', async () => {
      const response = await request(app)
        .get('/api/v1/admin/health')
        .expect(200)

      expect(response.body.cnd.checks).toBeDefined()
      expect(response.body.cnd.checks.memory).toBeDefined()
      expect(response.body.cnd.checks.memory.status).toBeDefined()
      expect(response.body.cnd.checks.memory.message).toBeDefined()
      expect(response.body.cnd.checks.memory.value).toBeDefined()

      expect(response.body.cnd.checks.errorRate).toBeDefined()
      expect(response.body.cnd.checks.errorRate.status).toBeDefined()
      expect(response.body.cnd.checks.errorRate.message).toBeDefined()
      expect(response.body.cnd.checks.errorRate.value).toBeDefined()

      expect(response.body.cnd.checks.responseTime).toBeDefined()
      expect(response.body.cnd.checks.responseTime.status).toBeDefined()
      expect(response.body.cnd.checks.responseTime.message).toBeDefined()
      expect(response.body.cnd.checks.responseTime.value).toBeDefined()
    })
  })
})