import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import axios from 'axios'

// Integration Testing Configuration
interface ServiceConfig {
  url: string;
  name: string;
}

interface ServicesConfig {
  [key: string]: ServiceConfig;
  gateway: ServiceConfig;
  codai: ServiceConfig;
  memorai: ServiceConfig;
  admin: ServiceConfig;
  hub: ServiceConfig;
  id: ServiceConfig;
  romai: ServiceConfig;
  cbd: ServiceConfig;
}

export const INTEGRATION_CONFIG = {
  services: {
    gateway: { url: 'http://localhost:4003', name: 'API Gateway' },
    codai: { url: 'http://localhost:4001', name: 'CODAI App' },
    memorai: { url: 'http://localhost:4006', name: 'MemorAI App' },
    admin: { url: 'http://localhost:4007', name: 'Admin Dashboard' },
    hub: { url: 'http://localhost:4008', name: 'Hub App' },
    id: { url: 'http://localhost:4004', name: 'ID App' },
    romai: { url: 'http://localhost:6100', name: 'RomAI App' },
    cbd: { url: 'http://localhost:4180', name: 'CBD Database' }
  } as ServicesConfig,
  timeouts: {
    healthCheck: 5000,
    apiCall: 10000,
    integration: 15000
  },
  retries: {
    healthCheck: 3,
    apiCall: 2,
    integration: 1
  }
}

// Service Health Check Utility
export async function checkServiceHealth(serviceKey: string, retries = INTEGRATION_CONFIG.retries.healthCheck): Promise<boolean> {
  const service = INTEGRATION_CONFIG.services[serviceKey]
  if (!service) throw new Error(`Service ${serviceKey} not found in configuration`)

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(`${service.url}/api/health`, {
        timeout: INTEGRATION_CONFIG.timeouts.healthCheck
      })

      if (response.status === 200) {
        // eslint-disable-next-line no-console
        console.log(`✅ ${service.name} health check passed (attempt ${attempt})`)
        return true
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`❌ ${service.name} health check failed (attempt ${attempt}/${retries})`)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
      }
    }
  }

  return false
}

// Cross-Service Communication Test Utility
export async function testCrossServiceCall(fromService: string, toService: string, endpoint: string, data?: any): Promise<any> {
  const fromUrl = INTEGRATION_CONFIG.services[fromService]?.url
  const toUrl = INTEGRATION_CONFIG.services[toService]?.url

  if (!fromUrl || !toUrl) {
    throw new Error(`Invalid service configuration: ${fromService} -> ${toService}`)
  }

  try {
    const response = await axios.post(`${fromUrl}/api/integration/call`, {
      targetService: toUrl,
      endpoint,
      data
    }, {
      timeout: INTEGRATION_CONFIG.timeouts.integration
    })

    return response.data
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error(`Cross-service call failed: ${fromService} -> ${toService}${endpoint}`, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

// API Gateway Routing Test Utility
export async function testGatewayRouting(route: string, expectedService: string): Promise<boolean> {
  try {
    const response = await axios.get(`${INTEGRATION_CONFIG.services.gateway.url}${route}`, {
      timeout: INTEGRATION_CONFIG.timeouts.apiCall,
      headers: { 'X-Test-Mode': 'integration' }
    })

    // Check if the response indicates it came from the expected service
    const serviceHeader = response.headers['x-service-name'] || response.data?.service
    return serviceHeader === expectedService
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error(`Gateway routing test failed for ${route}`, error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}

// Database Integration Test Utility
export async function testDatabaseIntegration(operation: string, data?: any): Promise<any> {
  try {
    const response = await axios.post(`${INTEGRATION_CONFIG.services.cbd.url}/api/test`, {
      operation,
      data,
      testMode: true
    }, {
      timeout: INTEGRATION_CONFIG.timeouts.integration
    })

    return response.data
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error(`Database integration test failed for operation: ${operation}`, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

// Authentication Flow Test Utility
export async function testAuthenticationFlow(credentials: any, targetService: string): Promise<any> {
  try {
    // Step 1: Authenticate with ID service
    const authResponse = await axios.post(`${INTEGRATION_CONFIG.services.id.url}/api/auth/login`, credentials, {
      timeout: INTEGRATION_CONFIG.timeouts.apiCall
    })

    const token = authResponse.data.token

    // Step 2: Use token to access target service
    const serviceResponse = await axios.get(`${INTEGRATION_CONFIG.services[targetService].url}/api/protected`, {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: INTEGRATION_CONFIG.timeouts.apiCall
    })

    return {
      authSuccess: authResponse.status === 200,
      serviceAccess: serviceResponse.status === 200,
      token
    }
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error(`Authentication flow test failed for ${targetService}`, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

// Service Discovery Test Utility
export async function discoverServices(): Promise<string[]> {
  const activeServices: string[] = []

  for (const [key, service] of Object.entries(INTEGRATION_CONFIG.services)) {
    try {
      const isHealthy = await checkServiceHealth(key)
      if (isHealthy) {
        activeServices.push(key)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`Service discovery failed for ${service.name}`)
    }
  }

  return activeServices
}

// Integration Test Helpers
export const integrationHelpers = {
  async waitForService(serviceKey: string, maxWaitTime = 30000): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      const isHealthy = await checkServiceHealth(serviceKey, 1)
      if (isHealthy) return true

      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    return false
  },

  async waitForAllServices(serviceKeys: string[], maxWaitTime = 60000): Promise<string[]> {
    const startTime = Date.now()
    const activeServices: string[] = []

    while (Date.now() - startTime < maxWaitTime && activeServices.length < serviceKeys.length) {
      for (const serviceKey of serviceKeys) {
        if (!activeServices.includes(serviceKey)) {
          const isHealthy = await checkServiceHealth(serviceKey, 1)
          if (isHealthy) {
            activeServices.push(serviceKey)
          }
        }
      }

      if (activeServices.length < serviceKeys.length) {
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }

    return activeServices
  },

  createTestData(type: string): any {
    const testData: { [key: string]: any } = {
      user: {
        id: 'test-user-' + Date.now(),
        email: 'test@codai.ro',
        name: 'Test User',
        password: 'TestPassword123!'
      },
      memory: {
        id: 'test-memory-' + Date.now(),
        content: 'Test memory content for integration testing',
        type: 'test',
        tags: ['integration', 'test']
      },
      transaction: {
        id: 'test-tx-' + Date.now(),
        amount: 100.00,
        currency: 'RON',
        type: 'test',
        description: 'Integration test transaction'
      }
    }

    return testData[type] || {}
  }
}
