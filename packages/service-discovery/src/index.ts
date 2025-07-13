import { Redis } from 'ioredis'
import { z } from 'zod'
import { LogAIClient } from '@codai/logai-sdk'

// Service configuration schema
const ServiceConfigSchema = z.object({
    name: z.string(),
    version: z.string(),
    host: z.string(),
    port: z.number(),
    path: z.string().optional(),
    healthEndpoint: z.string().default('/health'),
    metadata: z.record(z.any()).optional(),
    tags: z.array(z.string()).default([]),
})

const ServiceEndpointSchema = z.object({
    id: z.string(),
    url: z.string(),
    health: z.enum(['healthy', 'unhealthy', 'unknown']),
    lastSeen: z.date(),
    loadScore: z.number().min(0).max(100).default(0),
})

const HealthStatusSchema = z.object({
    service: z.string(),
    status: z.enum(['healthy', 'unhealthy', 'degraded']),
    checks: z.array(z.object({
        name: z.string(),
        status: z.boolean(),
        message: z.string().optional(),
        duration: z.number().optional(),
    })),
    uptime: z.number(),
    version: z.string(),
    timestamp: z.date(),
})

export type ServiceConfig = z.infer<typeof ServiceConfigSchema>
export type ServiceEndpoint = z.infer<typeof ServiceEndpointSchema>
export type HealthStatus = z.infer<typeof HealthStatusSchema>

export class ServiceRegistry {
    private redis: Redis
    private logger: LogAIClient
    private heartbeatInterval: NodeJS.Timeout | null = null
    private readonly HEARTBEAT_TTL = 30 // seconds
    private readonly HEARTBEAT_INTERVAL = 10 // seconds

    constructor(
        redisConfig: { host: string; port: number; password?: string } = {
            host: 'localhost',
            port: 6379
        }
    ) {
        this.redis = new Redis(redisConfig)
        this.logger = new LogAIClient({
            service: 'service-discovery',
            apiKey: process.env.LOGAI_API_KEY,
        })
    }

    /**
     * Register a service in the registry
     */
    async register(config: ServiceConfig): Promise<void> {
        try {
            const validatedConfig = ServiceConfigSchema.parse(config)
            const serviceKey = this.getServiceKey(validatedConfig.name, validatedConfig.version)

            const endpoint: ServiceEndpoint = {
                id: `${validatedConfig.name}-${Date.now()}`,
                url: `http://${validatedConfig.host}:${validatedConfig.port}${validatedConfig.path || ''}`,
                health: 'unknown',
                lastSeen: new Date(),
                loadScore: 0,
            }

            // Store service configuration
            await this.redis.hset(`service:${serviceKey}`, {
                config: JSON.stringify(validatedConfig),
                endpoint: JSON.stringify(endpoint),
                registeredAt: new Date().toISOString(),
            })

            // Add to active services set
            await this.redis.sadd('services:active', serviceKey)

            // Set TTL for heartbeat
            await this.redis.expire(`service:${serviceKey}`, this.HEARTBEAT_TTL)

            await this.logger.info('Service registered', {
                service: validatedConfig.name,
                version: validatedConfig.version,
                endpoint: endpoint.url,
            })

            // Start heartbeat if this is the first service
            if (!this.heartbeatInterval) {
                this.startHeartbeat()
            }
        } catch (error) {
            await this.logger.error('Failed to register service', { error: error.message, config })
            throw error
        }
    }

    /**
     * Discover services by name with load balancing
     */
    async discover(serviceName: string): Promise<ServiceEndpoint> {
        try {
            const services = await this.getHealthyServices(serviceName)

            if (services.length === 0) {
                throw new Error(`No healthy instances found for service: ${serviceName}`)
            }

            // Simple round-robin load balancing
            const selectedService = services.reduce((best, current) =>
                current.loadScore < best.loadScore ? current : best
            )

            await this.logger.info('Service discovered', {
                service: serviceName,
                selected: selectedService.url,
                availableInstances: services.length,
            })

            return selectedService
        } catch (error) {
            await this.logger.error('Service discovery failed', { error: error.message, service: serviceName })
            throw error
        }
    }

    /**
     * Get health status for all services or specific service
     */
    async getHealth(serviceName?: string): Promise<HealthStatus[]> {
        try {
            const services = serviceName
                ? [serviceName]
                : await this.redis.smembers('services:active')

            const healthStatuses: HealthStatus[] = []

            for (const service of services) {
                const serviceData = await this.redis.hgetall(`service:${service}`)
                if (!serviceData.config) continue

                const config = JSON.parse(serviceData.config) as ServiceConfig
                const endpoint = JSON.parse(serviceData.endpoint) as ServiceEndpoint

                try {
                    // Perform health check
                    const healthCheck = await this.performHealthCheck(config, endpoint)
                    healthStatuses.push(healthCheck)
                } catch (error) {
                    // Return unhealthy status if health check fails
                    healthStatuses.push({
                        service: config.name,
                        status: 'unhealthy',
                        checks: [{
                            name: 'connectivity',
                            status: false,
                            message: error.message,
                        }],
                        uptime: 0,
                        version: config.version,
                        timestamp: new Date(),
                    })
                }
            }

            return healthStatuses
        } catch (error) {
            await this.logger.error('Health check failed', { error: error.message, service: serviceName })
            throw error
        }
    }

    /**
     * Load balance requests across healthy service instances
     */
    async loadBalance(serviceName: string): Promise<ServiceEndpoint> {
        const services = await this.getHealthyServices(serviceName)

        if (services.length === 0) {
            throw new Error(`No healthy instances available for ${serviceName}`)
        }

        // Weighted round-robin based on load scores
        const totalWeight = services.reduce((sum, service) => sum + (100 - service.loadScore), 0)
        const random = Math.random() * totalWeight

        let currentWeight = 0
        for (const service of services) {
            currentWeight += (100 - service.loadScore)
            if (random <= currentWeight) {
                return service
            }
        }

        // Fallback to first service
        return services[0]
    }

    /**
     * Deregister a service
     */
    async deregister(serviceName: string, version: string): Promise<void> {
        try {
            const serviceKey = this.getServiceKey(serviceName, version)

            await this.redis.del(`service:${serviceKey}`)
            await this.redis.srem('services:active', serviceKey)

            await this.logger.info('Service deregistered', { service: serviceName, version })
        } catch (error) {
            await this.logger.error('Failed to deregister service', { error: error.message, service: serviceName })
            throw error
        }
    }

    /**
     * Update service load score
     */
    async updateLoadScore(serviceName: string, version: string, loadScore: number): Promise<void> {
        try {
            const serviceKey = this.getServiceKey(serviceName, version)
            const serviceData = await this.redis.hgetall(`service:${serviceKey}`)

            if (serviceData.endpoint) {
                const endpoint = JSON.parse(serviceData.endpoint) as ServiceEndpoint
                endpoint.loadScore = Math.max(0, Math.min(100, loadScore))
                endpoint.lastSeen = new Date()

                await this.redis.hset(`service:${serviceKey}`, 'endpoint', JSON.stringify(endpoint))
            }
        } catch (error) {
            await this.logger.error('Failed to update load score', { error: error.message, service: serviceName })
        }
    }

    /**
     * Close the registry and cleanup resources
     */
    async close(): Promise<void> {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
        }

        await this.redis.quit()
        await this.logger.info('Service registry closed')
    }

    // Private methods

    private getServiceKey(name: string, version: string): string {
        return `${name}:${version}`
    }

    private async getHealthyServices(serviceName: string): Promise<ServiceEndpoint[]> {
        const activeServices = await this.redis.smembers('services:active')
        const matchingServices = activeServices.filter(service => service.startsWith(`${serviceName}:`))

        const healthyServices: ServiceEndpoint[] = []

        for (const serviceKey of matchingServices) {
            const serviceData = await this.redis.hgetall(`service:${serviceKey}`)
            if (serviceData.endpoint) {
                const endpoint = JSON.parse(serviceData.endpoint) as ServiceEndpoint
                if (endpoint.health === 'healthy') {
                    healthyServices.push(endpoint)
                }
            }
        }

        return healthyServices
    }

    private async performHealthCheck(config: ServiceConfig, endpoint: ServiceEndpoint): Promise<HealthStatus> {
        const startTime = Date.now()

        try {
            // Basic connectivity check with timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const response = await fetch(`${endpoint.url}${config.healthEndpoint}`, {
                method: 'GET',
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            const responseTime = Date.now() - startTime
            const isHealthy = response.ok

            // Update endpoint health
            endpoint.health = isHealthy ? 'healthy' : 'unhealthy'
            endpoint.lastSeen = new Date()

            return {
                service: config.name,
                status: isHealthy ? 'healthy' : 'unhealthy',
                checks: [
                    {
                        name: 'connectivity',
                        status: isHealthy,
                        message: isHealthy ? 'Service responding' : `HTTP ${response.status}`,
                        duration: responseTime,
                    },
                    {
                        name: 'response_time',
                        status: responseTime < 1000,
                        message: `${responseTime}ms`,
                        duration: responseTime,
                    }
                ],
                uptime: responseTime,
                version: config.version,
                timestamp: new Date(),
            }
        } catch (error) {
            endpoint.health = 'unhealthy'
            endpoint.lastSeen = new Date()

            return {
                service: config.name,
                status: 'unhealthy',
                checks: [{
                    name: 'connectivity',
                    status: false,
                    message: error.message,
                    duration: Date.now() - startTime,
                }],
                uptime: 0,
                version: config.version,
                timestamp: new Date(),
            }
        }
    }

    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(async () => {
            try {
                const activeServices = await this.redis.smembers('services:active')

                for (const serviceKey of activeServices) {
                    const serviceData = await this.redis.hgetall(`service:${serviceKey}`)

                    if (serviceData.config && serviceData.endpoint) {
                        const config = JSON.parse(serviceData.config) as ServiceConfig
                        const endpoint = JSON.parse(serviceData.endpoint) as ServiceEndpoint

                        // Perform health check
                        const healthStatus = await this.performHealthCheck(config, endpoint)

                        // Update endpoint in Redis
                        await this.redis.hset(`service:${serviceKey}`, 'endpoint', JSON.stringify(endpoint))

                        // Refresh TTL if healthy
                        if (healthStatus.status === 'healthy') {
                            await this.redis.expire(`service:${serviceKey}`, this.HEARTBEAT_TTL)
                        }
                    }
                }
            } catch (error) {
                await this.logger.error('Heartbeat failed', { error: error.message })
            }
        }, this.HEARTBEAT_INTERVAL * 1000)
    }
}

// Export singleton instance
export const serviceRegistry = new ServiceRegistry()
