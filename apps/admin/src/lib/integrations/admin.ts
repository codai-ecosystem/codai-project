/**
 * Admin Integration Manager - Core Service Integration System
 * Handles integration with all CodAI ecosystem services and external systems
 */

export interface IntegrationService {
  name: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: Date
  connect(): Promise<boolean>
  disconnect(): Promise<boolean>
  sync(): Promise<boolean>
  healthCheck(): Promise<boolean>
}

export interface IntegrationConfig {
  apiKey?: string
  endpoint?: string
  timeout?: number
  retries?: number
  enabled: boolean
}

export class CodAIServiceIntegration implements IntegrationService {
  name: string
  private config: IntegrationConfig
  status: 'connected' | 'disconnected' | 'error' = 'disconnected'
  lastSync?: Date

  constructor(serviceName: string, config: IntegrationConfig) {
    this.name = serviceName
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.config.enabled) {
        this.status = 'disconnected'
        return false
      }

      // Simulate connection logic
      const response = await fetch(`${this.config.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout || 5000)
      }).catch(() => null)

      if (response?.ok) {
        this.status = 'connected'
        return true
      }

      this.status = 'error'
      return false
    } catch (error) {
      console.error(`Failed to connect to ${this.name}:`, error)
      this.status = 'error'
      return false
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      this.status = 'disconnected'
      return true
    } catch (error) {
      console.error(`Failed to disconnect from ${this.name}:`, error)
      return false
    }
  }

  async sync(): Promise<boolean> {
    try {
      if (this.status !== 'connected') {
        return false
      }

      // Simulate sync logic
      this.lastSync = new Date()
      return true
    } catch (error) {
      console.error(`Failed to sync with ${this.name}:`, error)
      return false
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.config.enabled) {
        return false
      }

      const response = await fetch(`${this.config.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(3000)
      }).catch(() => null)

      return response?.ok || false
    } catch (error) {
      console.error(`Health check failed for ${this.name}:`, error)
      return false
    }
  }
}

export class ExternalServiceIntegration implements IntegrationService {
  name: string
  private config: IntegrationConfig
  status: 'connected' | 'disconnected' | 'error' = 'disconnected'
  lastSync?: Date

  constructor(serviceName: string, config: IntegrationConfig) {
    this.name = serviceName
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.config.enabled) {
        this.status = 'disconnected'
        return false
      }

      // External service connection logic
      this.status = 'connected'
      return true
    } catch (error) {
      console.error(`Failed to connect to external service ${this.name}:`, error)
      this.status = 'error'
      return false
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      this.status = 'disconnected'
      return true
    } catch (error) {
      console.error(`Failed to disconnect from external service ${this.name}:`, error)
      return false
    }
  }

  async sync(): Promise<boolean> {
    try {
      if (this.status !== 'connected') {
        return false
      }

      this.lastSync = new Date()
      return true
    } catch (error) {
      console.error(`Failed to sync with external service ${this.name}:`, error)
      return false
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.config.enabled) {
        return false
      }

      // External service health check
      return true
    } catch (error) {
      console.error(`Health check failed for external service ${this.name}:`, error)
      return false
    }
  }
}

export class AdminIntegrationManager {
  private services = new Map<string, IntegrationService>()
  private configs = new Map<string, IntegrationConfig>()

  constructor() {
    this.initializeServices()
  }

  private initializeServices() {
    // CodAI Ecosystem Services
    const codaiServices = [
      'ajutai', 'analizai', 'bancai', 'codai', 'cumparai', 'fabricai',
      'kodex', 'legalizai', 'logai', 'marketai', 'memorai', 'publicai',
      'sociai', 'stocai', 'studiai', 'wallet', 'mobile'
    ]

    codaiServices.forEach(service => {
      const config: IntegrationConfig = {
        endpoint: `http://localhost:${this.getServicePort(service)}`,
        apiKey: process.env[`${service.toUpperCase()}_API_KEY`] || 'dev-key',
        timeout: 5000,
        retries: 3,
        enabled: true
      }

      this.configs.set(service, config)
      this.services.set(service, new CodAIServiceIntegration(service, config))
    })

    // Infrastructure Services
    const infraServices = ['aide', 'dash', 'docs', 'explorer', 'hub', 'id', 'memorai', 'stocai', 'x']

    infraServices.forEach(service => {
      const config: IntegrationConfig = {
        endpoint: `http://localhost:${this.getServicePort(service)}`,
        apiKey: process.env[`${service.toUpperCase()}_API_KEY`] || 'dev-key',
        timeout: 5000,
        retries: 3,
        enabled: true
      }

      this.configs.set(service, config)
      this.services.set(service, new CodAIServiceIntegration(service, config))
    })

    // External Services
    const externalServices = [
      { name: 'stripe', port: null },
      { name: 'sendgrid', port: null },
      { name: 'aws', port: null },
      { name: 'redis', port: 6379 },
      { name: 'postgresql', port: 5432 },
      { name: 'mongodb', port: 27017 }
    ]

    externalServices.forEach(({ name, port }) => {
      const config: IntegrationConfig = {
        endpoint: port ? `http://localhost:${port}` : undefined,
        apiKey: process.env[`${name.toUpperCase()}_API_KEY`] || process.env[`${name.toUpperCase()}_URL`],
        timeout: 5000,
        retries: 3,
        enabled: !!process.env[`${name.toUpperCase()}_ENABLED`] || false
      }

      this.configs.set(name, config)
      this.services.set(name, new ExternalServiceIntegration(name, config))
    })
  }

  private getServicePort(service: string): number {
    const portMap: Record<string, number> = {
      // Phase 2 Services
      'ajutai': 3002,
      'analizai': 3003,
      'bancai': 3004,
      'codai': 3005,
      'cumparai': 3006,
      'fabricai': 3007,
      'kodex': 3008,
      'legalizai': 3009,
      'logai': 3010,
      'marketai': 3011,
      'memorai': 3012,
      'publicai': 3013,
      'sociai': 3014,
      'stocai': 3015,
      'studiai': 3016,
      'wallet': 3017,
      'mobile': 3018,

      // Phase 3 Infrastructure Services
      'admin': 3001,
      'aide': 3020,
      'dash': 3021,
      'docs': 3022,
      'explorer': 3023,
      'hub': 3024,
      'id': 3025,
      'x': 3029,

      // Phase 4 Specialized Services
      'mod': 3030,
      'tools': 3031
    }

    return portMap[service] || 3000
  }

  async connectAll(): Promise<boolean> {
    try {
      const connections = await Promise.allSettled(
        Array.from(this.services.values()).map(service => service.connect())
      )

      const successful = connections.filter(result =>
        result.status === 'fulfilled' && result.value === true
      ).length

      return successful > 0
    } catch (error) {
      console.error('Failed to connect all services:', error)
      return false
    }
  }

  async disconnectAll(): Promise<boolean> {
    try {
      await Promise.allSettled(
        Array.from(this.services.values()).map(service => service.disconnect())
      )
      return true
    } catch (error) {
      console.error('Failed to disconnect all services:', error)
      return false
    }
  }

  async syncAll(): Promise<boolean> {
    try {
      const syncs = await Promise.allSettled(
        Array.from(this.services.values())
          .filter(service => service.status === 'connected')
          .map(service => service.sync())
      )

      const successful = syncs.filter(result =>
        result.status === 'fulfilled' && result.value === true
      ).length

      return successful > 0
    } catch (error) {
      console.error('Failed to sync all services:', error)
      return false
    }
  }

  async healthCheckAll(): Promise<Record<string, boolean>> {
    try {
      const checks = await Promise.allSettled(
        Array.from(this.services.entries()).map(async ([name, service]) => ({
          name,
          healthy: await service.healthCheck()
        }))
      )

      const results: Record<string, boolean> = {}
      checks.forEach(result => {
        if (result.status === 'fulfilled') {
          results[result.value.name] = result.value.healthy
        }
      })

      return results
    } catch (error) {
      console.error('Failed to run health checks:', error)
      return {}
    }
  }

  getService(name: string): IntegrationService | undefined {
    return this.services.get(name)
  }

  getServiceStatus(name: string): string {
    const service = this.services.get(name)
    return service?.status || 'unknown'
  }

  getAllServices(): IntegrationService[] {
    return Array.from(this.services.values())
  }

  getServicesByStatus(status: 'connected' | 'disconnected' | 'error'): IntegrationService[] {
    return Array.from(this.services.values()).filter(service => service.status === status)
  }

  async processIntegrationRequest(serviceName: string, data: any): Promise<any> {
    try {
      const service = this.services.get(serviceName)
      if (!service) {
        throw new Error(`Service ${serviceName} not found`)
      }

      if (service.status !== 'connected') {
        const connected = await service.connect()
        if (!connected) {
          throw new Error(`Failed to connect to ${serviceName}`)
        }
      }

      // Process the integration request
      // This would typically involve service-specific logic
      return {
        service: serviceName,
        processed: true,
        data: data,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error(`Failed to process integration request for ${serviceName}:`, error)
      throw error
    }
  }

  async updateServiceConfig(serviceName: string, config: Partial<IntegrationConfig>): Promise<boolean> {
    try {
      const existingConfig = this.configs.get(serviceName)
      if (!existingConfig) {
        throw new Error(`Service ${serviceName} not found`)
      }

      const updatedConfig = { ...existingConfig, ...config }
      this.configs.set(serviceName, updatedConfig)

      // Reinitialize the service with new config
      const service = this.services.get(serviceName)
      if (service) {
        await service.disconnect()
        const newService = serviceName.includes('stripe') || serviceName.includes('sendgrid') || serviceName.includes('aws') || serviceName.includes('redis') || serviceName.includes('postgresql') || serviceName.includes('mongodb')
          ? new ExternalServiceIntegration(serviceName, updatedConfig)
          : new CodAIServiceIntegration(serviceName, updatedConfig)

        this.services.set(serviceName, newService)
      }

      return true
    } catch (error) {
      console.error(`Failed to update config for ${serviceName}:`, error)
      return false
    }
  }

  getIntegrationSummary() {
    const services = Array.from(this.services.values())
    const connected = services.filter(s => s.status === 'connected').length
    const disconnected = services.filter(s => s.status === 'disconnected').length
    const error = services.filter(s => s.status === 'error').length

    return {
      total: services.length,
      connected,
      disconnected,
      error,
      healthyPercentage: (connected / services.length) * 100,
      lastSync: Math.max(...services.map(s => s.lastSync?.getTime() || 0)),
      services: services.map(s => ({
        name: s.name,
        status: s.status,
        lastSync: s.lastSync
      }))
    }
  }
}

export default AdminIntegrationManager
