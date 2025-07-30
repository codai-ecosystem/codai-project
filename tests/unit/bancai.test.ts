import { describe, it, expect } from 'vitest'
import request from 'supertest'

const GATEWAY_BASE_URL = 'http://localhost:4000'

// Use the Gateway for all tests (BancAI service is behind Gateway proxy)
const app = GATEWAY_BASE_URL

describe('BancAI Service - Integration Tests', () => {
  describe('Service Architecture Understanding', () => {
    it('should be a comprehensive banking and financial services platform', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.service).toBe('BancAI Service')
      expect(response.body.status).toBe('healthy')
      expect(response.body.version).toBe('1.0.0')
      expect(response.body.port).toBe(4005)
    })

    it('should provide comprehensive health endpoint via Gateway proxy', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.timestamp).toBeDefined()
      expect(response.body.database).toBeDefined()
      expect(response.body.banking).toBeDefined()
      expect(response.body.statistics).toBeDefined()
      expect(response.body.enterpriseFeatures).toBeDefined()
      expect(response.body.performance).toBeDefined()
      expect(response.body.dependencies).toBeDefined()
    })

    it('should validate database connectivity', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.database.status).toBe('healthy')
    })

    it('should provide dependency status information', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.dependencies.cnd).toBe('healthy')
      expect(response.body.dependencies.nodejs).toBeDefined()
      expect(response.body.dependencies.nodejs).toMatch(/^v\d+\.\d+\.\d+$/)
      expect(response.body.dependencies.environment).toBe('development')
    })
  })

  describe('Banking Features Validation', () => {
    it('should validate all core banking operations are operational', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      const banking = response.body.banking
      expect(banking.accountManagement).toBe('operational')
      expect(banking.transactionProcessing).toBe('operational')
      expect(banking.complianceMonitoring).toBe('operational')
      expect(banking.riskAssessment).toBe('operational')
      expect(banking.regulatoryReporting).toBe('operational')
    })

    it('should provide banking statistics and metrics', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      const statistics = response.body.statistics
      expect(statistics.accounts).toBeGreaterThanOrEqual(0)
      expect(statistics.transactions).toBeGreaterThanOrEqual(0)
      expect(statistics.openComplianceAlerts).toBeGreaterThanOrEqual(0)
      expect(typeof statistics.accounts).toBe('number')
      expect(typeof statistics.transactions).toBe('number')
      expect(typeof statistics.openComplianceAlerts).toBe('number')
    })

    it('should validate enterprise security features', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      const enterpriseFeatures = response.body.enterpriseFeatures
      expect(enterpriseFeatures.authentication).toBe(true)
      expect(enterpriseFeatures.auditLogging).toBe(true)
      expect(enterpriseFeatures.serviceDiscovery).toBe(true)
      expect(enterpriseFeatures.metrics).toBe(true)
      expect(enterpriseFeatures.encryption).toBe(true)
      expect(enterpriseFeatures.complianceMode).toBe('monitoring')
    })

    it('should validate account management capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.banking.accountManagement).toBe('operational')
      expect(response.body.statistics.accounts).toBeGreaterThanOrEqual(0)
    })

    it('should validate transaction processing capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.banking.transactionProcessing).toBe('operational')
      expect(response.body.statistics.transactions).toBeGreaterThanOrEqual(0)
    })

    it('should validate compliance and risk management', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.banking.complianceMonitoring).toBe('operational')
      expect(response.body.banking.riskAssessment).toBe('operational')
      expect(response.body.banking.regulatoryReporting).toBe('operational')
      expect(response.body.statistics.openComplianceAlerts).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Performance & System Metrics', () => {
    it('should provide uptime metrics', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.performance.uptime).toBeGreaterThan(0)
      expect(typeof response.body.performance.uptime).toBe('number')
    })

    it('should provide comprehensive memory usage metrics', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      const memoryUsage = response.body.performance.memoryUsage
      expect(memoryUsage.rss).toBeGreaterThan(0)
      expect(memoryUsage.heapTotal).toBeGreaterThan(0)
      expect(memoryUsage.heapUsed).toBeGreaterThan(0)
      expect(memoryUsage.external).toBeGreaterThan(0)
      expect(memoryUsage.arrayBuffers).toBeGreaterThan(0)
    })

    it('should provide CPU usage metrics', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      const cpuUsage = response.body.performance.cpuUsage
      expect(cpuUsage.user).toBeGreaterThanOrEqual(0)
      expect(cpuUsage.system).toBeGreaterThanOrEqual(0)
      expect(typeof cpuUsage.user).toBe('number')
      expect(typeof cpuUsage.system).toBe('number')
    })

    it('should validate all system performance metrics', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.performance).toBeDefined()
      expect(response.body.performance.uptime).toBeGreaterThan(0)
      expect(response.body.performance.memoryUsage).toBeDefined()
      expect(response.body.performance.cpuUsage).toBeDefined()
    })
  })

  describe('Enterprise Security Features', () => {
    it('should validate authentication system', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.enterpriseFeatures.authentication).toBe(true)
    })

    it('should validate audit logging capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.enterpriseFeatures.auditLogging).toBe(true)
    })

    it('should validate service discovery integration', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.enterpriseFeatures.serviceDiscovery).toBe(true)
    })

    it('should validate metrics collection', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.enterpriseFeatures.metrics).toBe(true)
    })

    it('should validate encryption capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.enterpriseFeatures.encryption).toBe(true)
    })

    it('should validate compliance monitoring mode', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.enterpriseFeatures.complianceMode).toBe('monitoring')
    })
  })

  describe('Gateway Integration & Performance', () => {
    it('should handle concurrent health check requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/v1/bancai/health')
          .expect(200)
      )

      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.body.status).toBe('healthy')
        expect(response.body.service).toBe('BancAI Service')
      })
    })

    it('should respond to health checks within acceptable time', async () => {
      const startTime = Date.now()
      
      await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(5000) // 5 seconds max
    })

    it('should maintain consistent response structure', async () => {
      const response1 = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      const response2 = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      // Both responses should have the same structure
      expect(Object.keys(response1.body).sort()).toEqual(Object.keys(response2.body).sort())
      expect(response1.body.service).toBe(response2.body.service)
      expect(response1.body.version).toBe(response2.body.version)
      expect(response1.body.status).toBe(response2.body.status)
    })

    it('should validate service availability through Gateway', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.status).toBe('healthy')
      expect(response.body.service).toBe('BancAI Service')
      expect(response.body.port).toBe(4005)
      expect(response.body.performance.uptime).toBeGreaterThan(0)
    })
  })

  describe('Business Logic Validation', () => {
    it('should validate account management operational status', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.banking.accountManagement).toBe('operational')
      expect(response.body.statistics.accounts).toBeGreaterThanOrEqual(0)
    })

    it('should validate transaction processing capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.banking.transactionProcessing).toBe('operational')
      expect(response.body.statistics.transactions).toBeGreaterThanOrEqual(0)
    })

    it('should validate regulatory compliance features', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.banking.complianceMonitoring).toBe('operational')
      expect(response.body.banking.regulatoryReporting).toBe('operational')
      expect(response.body.statistics.openComplianceAlerts).toBeGreaterThanOrEqual(0)
    })

    it('should validate risk assessment capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.banking.riskAssessment).toBe('operational')
    })

    it('should validate database connectivity for banking operations', async () => {
      const response = await request(app)
        .get('/api/v1/bancai/health')
        .expect(200)

      expect(response.body.database.status).toBe('healthy')
    })
  })
})
