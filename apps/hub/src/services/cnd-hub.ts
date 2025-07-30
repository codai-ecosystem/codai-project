/**
 * CND Hub Service - Central Coordination System
 * 
 * Provides:
 * - Service Discovery Registry
 * - Cross-Service Communication
 * - System Monitoring & Health Checks
 * - Ecosystem Orchestration
 * - Central Logging & Metrics
 * - Load Balancing & Routing
 */

import { CND } from '../../../../packages/cnd/dist/index.js';
import { z } from 'zod';

// Service Registration Schema
const ServiceRegistrationSchema = z.object({
    serviceId: z.string(),
    serviceName: z.string(),
    version: z.string(),
    host: z.string(),
    port: z.number(),
    protocol: z.enum(['http', 'https', 'ws', 'wss']),
    endpoints: z.array(z.object({
        path: z.string(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
        description: z.string().optional(),
    })),
    healthCheckPath: z.string().default('/health'),
    tags: z.array(z.string()).default([]),
    metadata: z.record(z.any()).default({}),
});

const ServiceHealthSchema = z.object({
    serviceId: z.string(),
    status: z.enum(['healthy', 'unhealthy', 'degraded', 'unknown']),
    lastCheck: z.date(),
    responseTime: z.number(),
    details: z.record(z.any()).default({}),
});

const CrossServiceRequestSchema = z.object({
    targetService: z.string(),
    endpoint: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    data: z.any().optional(),
    headers: z.record(z.string()).default({}),
    timeout: z.number().default(30000),
});

type ServiceRegistration = z.infer<typeof ServiceRegistrationSchema>;
type ServiceHealth = z.infer<typeof ServiceHealthSchema>;
type CrossServiceRequest = z.infer<typeof CrossServiceRequestSchema>;

export class CNDHubService {
    private cnd: CND;
    private serviceRegistry: Map<string, ServiceRegistration> = new Map();
    private healthStatus: Map<string, ServiceHealth> = new Map();
    private healthCheckInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.cnd = new CND({
            name: 'hub-service',
            cbd: {
                host: process.env.CBD_HOST || 'localhost',
                port: parseInt(process.env.CBD_PORT || '4020'),
                database: process.env.CBD_DATABASE || 'hub_service',
                memory: {
                    maxMemory: 512 * 1024 * 1024, // 512MB
                    persistenceInterval: 30000,
                },
            },
            enterprise: {
                authentication: {
                    enabled: true,
                    jwtSecret: process.env.JWT_SECRET || 'hub-service-secret',
                    tokenExpiry: '24h',
                },
                serviceDiscovery: {
                    enabled: true,
                    port: 4003,
                    healthCheckInterval: 30000,
                },
                auditLog: {
                    enabled: true,
                    logLevel: 'info',
                    includeRequestData: true,
                },
                metrics: {
                    enabled: true,
                    prometheusPort: 9093,
                    customMetrics: ['hub_services_registered', 'hub_health_checks', 'hub_cross_service_requests'],
                },
                security: {
                    encryption: {
                        enabled: true,
                        algorithm: 'aes-256-gcm',
                    },
                    rateLimit: {
                        enabled: true,
                        windowMs: 60000,
                        maxRequests: 1000,
                    },
                },
            },
        });
    }

    async initialize(): Promise<void> {
        try {
            await this.cnd.connect();

            // Initialize service registry table
            await this.initializeServiceRegistry();

            // Start health monitoring
            this.startHealthMonitoring();

            // Register self in service discovery
            await this.registerSelf();

            console.log('✅ CND Hub Service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize CND Hub Service:', error);
            throw error;
        }
    }

    private async initializeServiceRegistry(): Promise<void> {
        // Create service registry table
        await this.cnd.sql().query(`
      CREATE TABLE IF NOT EXISTS service_registry (
        service_id VARCHAR(255) PRIMARY KEY,
        service_name VARCHAR(255) NOT NULL,
        version VARCHAR(50) NOT NULL,
        host VARCHAR(255) NOT NULL,
        port INTEGER NOT NULL,
        protocol VARCHAR(10) NOT NULL,
        endpoints JSONB NOT NULL DEFAULT '[]',
        health_check_path VARCHAR(255) DEFAULT '/health',
        tags JSONB NOT NULL DEFAULT '[]',
        metadata JSONB NOT NULL DEFAULT '{}',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active'
      )
    `);

        // Create service health table
        await this.cnd.sql().query(`
      CREATE TABLE IF NOT EXISTS service_health (
        service_id VARCHAR(255) PRIMARY KEY,
        status VARCHAR(20) NOT NULL,
        last_check TIMESTAMP NOT NULL,
        response_time INTEGER NOT NULL,
        details JSONB NOT NULL DEFAULT '{}',
        FOREIGN KEY (service_id) REFERENCES service_registry(service_id) ON DELETE CASCADE
      )
    `);

        // Create cross-service logs table
        await this.cnd.sql().query(`
      CREATE TABLE IF NOT EXISTS cross_service_logs (
        id SERIAL PRIMARY KEY,
        source_service VARCHAR(255) NOT NULL,
        target_service VARCHAR(255) NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        method VARCHAR(10) NOT NULL,
        status_code INTEGER,
        response_time INTEGER,
        error_message TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create system metrics table
        await this.cnd.sql().query(`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(255) NOT NULL,
        metric_value NUMERIC NOT NULL,
        labels JSONB NOT NULL DEFAULT '{}',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }

    // Service Registration Management
    async registerService(registration: ServiceRegistration): Promise<void> {
        try {
            // Validate registration data
            const validRegistration = ServiceRegistrationSchema.parse(registration);

            // Store in database
            await this.cnd.sql().query(`
        INSERT INTO service_registry (
          service_id, service_name, version, host, port, protocol, 
          endpoints, health_check_path, tags, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
                validRegistration.serviceId,
                validRegistration.serviceName,
                validRegistration.version,
                validRegistration.host,
                validRegistration.port,
                validRegistration.protocol,
                JSON.stringify(validRegistration.endpoints),
                validRegistration.healthCheckPath,
                JSON.stringify(validRegistration.tags),
                JSON.stringify(validRegistration.metadata),
            ]);

            // Update in-memory registry
            this.serviceRegistry.set(validRegistration.serviceId, validRegistration);

            // Initialize health status
            await this.updateServiceHealth(validRegistration.serviceId, 'unknown', 0, {});

            // Audit logging disabled for now

            console.log(`✅ Service registered: ${validRegistration.serviceName} (${validRegistration.serviceId})`);
        } catch (error) {
            console.error('❌ Failed to register service:', error);
            throw error;
        }
    }

    async unregisterService(serviceId: string): Promise<void> {
        try {
            // Remove from database
            await this.cnd.sql().query(`DELETE FROM service_registry WHERE service_id = $1`, [serviceId]);

            // Remove from in-memory registry
            this.serviceRegistry.delete(serviceId);
            this.healthStatus.delete(serviceId);

            // Audit logging disabled for now

            console.log(`✅ Service unregistered: ${serviceId}`);
        } catch (error) {
            console.error('❌ Failed to unregister service:', error);
            throw error;
        }
    }

    async getRegisteredServices(): Promise<ServiceRegistration[]> {
        try {
            const result = await this.cnd.sql().query(`
        SELECT service_id, service_name, version, host, port, protocol, 
               endpoints, health_check_path, tags, metadata
        FROM service_registry 
        WHERE status = 'active'
        ORDER BY service_name
      `);

            return result.data.map(row => ({
                serviceId: row.service_id,
                serviceName: row.service_name,
                version: row.version,
                host: row.host,
                port: row.port,
                protocol: row.protocol,
                endpoints: JSON.parse(row.endpoints),
                healthCheckPath: row.health_check_path,
                tags: JSON.parse(row.tags),
                metadata: JSON.parse(row.metadata),
            }));
        } catch (error) {
            console.error('❌ Failed to get registered services:', error);
            throw error;
        }
    }

    async findServicesByTag(tag: string): Promise<ServiceRegistration[]> {
        try {
            const result = await this.cnd.sql().query(`
        SELECT service_id, service_name, version, host, port, protocol, 
               endpoints, health_check_path, tags, metadata
        FROM service_registry 
        WHERE status = 'active' AND tags::jsonb ? $1
        ORDER BY service_name
      `, [tag]);

            return result.data.map(row => ({
                serviceId: row.service_id,
                serviceName: row.service_name,
                version: row.version,
                host: row.host,
                port: row.port,
                protocol: row.protocol,
                endpoints: JSON.parse(row.endpoints),
                healthCheckPath: row.health_check_path,
                tags: JSON.parse(row.tags),
                metadata: JSON.parse(row.metadata),
            }));
        } catch (error) {
            console.error('❌ Failed to find services by tag:', error);
            throw error;
        }
    }

    // Health Monitoring
    private startHealthMonitoring(): void {
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthChecks();
        }, 30000); // Check every 30 seconds
    }

    private async performHealthChecks(): Promise<void> {
        const services = Array.from(this.serviceRegistry.values());

        for (const service of services) {
            await this.checkServiceHealth(service);
        }
    }

    private async checkServiceHealth(service: ServiceRegistration): Promise<void> {
        const startTime = Date.now();

        try {
            const url = `${service.protocol}://${service.host}:${service.port}${service.healthCheckPath}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'User-Agent': 'CODAI-Hub-HealthChecker/1.0' },
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            const responseTime = Date.now() - startTime;
            const status = response.ok ? 'healthy' : 'unhealthy';

            let details = {};
            try {
                details = await response.json();
            } catch {
                details = { statusText: response.statusText };
            }

            await this.updateServiceHealth(service.serviceId, status, responseTime, details);
        } catch (error) {
            const responseTime = Date.now() - startTime;
            await this.updateServiceHealth(service.serviceId, 'unhealthy', responseTime, {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private async updateServiceHealth(serviceId: string, status: string, responseTime: number, details: any): Promise<void> {
        try {
            const healthData = {
                service_id: serviceId,
                status,
                last_check: new Date(),
                response_time: responseTime,
                details: JSON.stringify(details),
            };

            // Update database
            await this.cnd.sql().query(`
        INSERT INTO service_health (service_id, status, last_check, response_time, details)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (service_id) 
        DO UPDATE SET status = $2, last_check = $3, response_time = $4, details = $5
      `, [serviceId, status, healthData.last_check, responseTime, JSON.stringify(details)]);

            // Update in-memory status
            this.healthStatus.set(serviceId, {
                serviceId,
                status: status as any,
                lastCheck: healthData.last_check,
                responseTime,
                details,
            });

            // Update last_seen in service registry
            await this.cnd.sql().query(`
        UPDATE service_registry SET last_seen = $1 WHERE service_id = $2
      `, [new Date(), serviceId]);

        } catch (error) {
            console.error(`❌ Failed to update health for service ${serviceId}:`, error);
        }
    }

    async getServiceHealth(serviceId?: string): Promise<ServiceHealth | ServiceHealth[]> {
        try {
            if (serviceId) {
                const result = await this.cnd.sql().query(`
          SELECT service_id, status, last_check, response_time, details
          FROM service_health WHERE service_id = $1
        `, [serviceId]);

                if (result.data.length === 0) {
                    throw new Error(`Service health not found: ${serviceId}`);
                }

                const row = result.data[0];
                return {
                    serviceId: row.service_id,
                    status: row.status,
                    lastCheck: new Date(row.last_check),
                    responseTime: row.response_time,
                    details: JSON.parse(row.details),
                };
            } else {
                const result = await this.cnd.sql().query(`
          SELECT service_id, status, last_check, response_time, details
          FROM service_health ORDER BY last_check DESC
        `);

                return result.data.map(row => ({
                    serviceId: row.service_id,
                    status: row.status,
                    lastCheck: new Date(row.last_check),
                    responseTime: row.response_time,
                    details: JSON.parse(row.details),
                }));
            }
        } catch (error) {
            console.error('❌ Failed to get service health:', error);
            throw error;
        }
    }

    // Cross-Service Communication
    async makeServiceRequest(request: CrossServiceRequest): Promise<any> {
        const startTime = Date.now();

        try {
            // Validate request
            const validRequest = CrossServiceRequestSchema.parse(request);

            // Find target service
            const targetService = this.serviceRegistry.get(validRequest.targetService);
            if (!targetService) {
                throw new Error(`Target service not found: ${validRequest.targetService}`);
            }

            // Check if service is healthy
            const health = this.healthStatus.get(validRequest.targetService);
            if (health && health.status === 'unhealthy') {
                throw new Error(`Target service is unhealthy: ${validRequest.targetService}`);
            }

            // Make request
            const url = `${targetService.protocol}://${targetService.host}:${targetService.port}${validRequest.endpoint}`;
            const response = await fetch(url, {
                method: validRequest.method,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'CODAI-Hub-ServiceCaller/1.0',
                    ...validRequest.headers,
                },
                body: validRequest.data ? JSON.stringify(validRequest.data) : undefined,
                signal: AbortSignal.timeout(validRequest.timeout),
            });

            const responseTime = Date.now() - startTime;
            const responseData = await response.json();

            // Log successful request
            await this.logCrossServiceRequest(
                'hub-service',
                validRequest.targetService,
                validRequest.endpoint,
                validRequest.method,
                response.status,
                responseTime
            );

            return {
                success: true,
                status: response.status,
                data: responseData,
                responseTime,
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Log failed request
            await this.logCrossServiceRequest(
                'hub-service',
                request.targetService,
                request.endpoint,
                request.method,
                0,
                responseTime,
                errorMessage
            );

            throw error;
        }
    }

    private async logCrossServiceRequest(
        sourceService: string,
        targetService: string,
        endpoint: string,
        method: string,
        statusCode: number,
        responseTime: number,
        errorMessage?: string
    ): Promise<void> {
        try {
            await this.cnd.sql().query(`
        INSERT INTO cross_service_logs (
          source_service, target_service, endpoint, method, 
          status_code, response_time, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
                sourceService,
                targetService,
                endpoint,
                method,
                statusCode || null,
                responseTime,
                errorMessage || null,
            ]);
        } catch (error) {
            console.error('❌ Failed to log cross-service request:', error);
        }
    }

    // System Metrics
    async recordMetric(metricName: string, value: number, labels: Record<string, any> = {}): Promise<void> {
        try {
            await this.cnd.sql().query(`
        INSERT INTO system_metrics (metric_name, metric_value, labels)
        VALUES ($1, $2, $3)
      `, [
                metricName,
                value,
                JSON.stringify(labels),
            ]);
        } catch (error) {
            console.error('❌ Failed to record metric:', error);
        }
    }

    async getSystemMetrics(metricName?: string, timeWindow?: string): Promise<any[]> {
        try {
            let query = `
        SELECT metric_name, metric_value, labels, timestamp
        FROM system_metrics
      `;
            const params: any[] = [];

            if (metricName) {
                query += ` WHERE metric_name = $1`;
                params.push(metricName);
            }

            if (timeWindow) {
                const whereClause = metricName ? ' AND' : ' WHERE';
                query += `${whereClause} timestamp >= NOW() - INTERVAL '${timeWindow}'`;
            }

            query += ` ORDER BY timestamp DESC LIMIT 1000`;

            const result = await this.cnd.sql().query(query, params);

            return result.data.map(row => ({
                metricName: row.metric_name,
                value: parseFloat(row.metric_value),
                labels: JSON.parse(row.labels),
                timestamp: row.timestamp,
            }));
        } catch (error) {
            console.error('❌ Failed to get system metrics:', error);
            throw error;
        }
    }

    // Load Balancing
    async getHealthyServiceInstances(serviceName: string): Promise<ServiceRegistration[]> {
        try {
            const result = await this.cnd.sql().query(`
        SELECT sr.service_id, sr.service_name, sr.version, sr.host, sr.port, sr.protocol, 
               sr.endpoints, sr.health_check_path, sr.tags, sr.metadata
        FROM service_registry sr
        JOIN service_health sh ON sr.service_id = sh.service_id
        WHERE sr.service_name = $1 AND sr.status = 'active' AND sh.status = 'healthy'
        ORDER BY sh.response_time ASC
      `, [serviceName]);

            return result.data.map(row => ({
                serviceId: row.service_id,
                serviceName: row.service_name,
                version: row.version,
                host: row.host,
                port: row.port,
                protocol: row.protocol,
                endpoints: JSON.parse(row.endpoints),
                healthCheckPath: row.health_check_path,
                tags: JSON.parse(row.tags),
                metadata: JSON.parse(row.metadata),
            }));
        } catch (error) {
            console.error('❌ Failed to get healthy service instances:', error);
            throw error;
        }
    }

    // Self Registration
    private async registerSelf(): Promise<void> {
        await this.registerService({
            serviceId: 'hub-service-001',
            serviceName: 'hub',
            version: '1.0.0',
            host: 'localhost',
            port: 4003,
            protocol: 'http',
            endpoints: [
                { path: '/api/services', method: 'GET', description: 'Get all registered services' },
                { path: '/api/services', method: 'POST', description: 'Register a new service' },
                { path: '/api/services/:id', method: 'DELETE', description: 'Unregister a service' },
                { path: '/api/health', method: 'GET', description: 'Get health status' },
                { path: '/api/health/:serviceId', method: 'GET', description: 'Get specific service health' },
                { path: '/api/communication/request', method: 'POST', description: 'Make cross-service request' },
                { path: '/api/metrics', method: 'GET', description: 'Get system metrics' },
                { path: '/api/metrics', method: 'POST', description: 'Record a metric' },
            ],
            tags: ['core', 'hub', 'orchestration', 'service-discovery'],
            metadata: {
                description: 'Central Hub Service for CODAI Ecosystem',
                features: ['service-discovery', 'health-monitoring', 'cross-service-communication', 'metrics', 'load-balancing'],
                maintainer: 'CODAI Team',
            },
        });
    }

    // Cleanup
    async shutdown(): Promise<void> {
        try {
            if (this.healthCheckInterval) {
                clearInterval(this.healthCheckInterval);
            }

            await this.unregisterService('hub-service-001');
            await this.cnd.close();

            console.log('✅ CND Hub Service shutdown complete');
        } catch (error) {
            console.error('❌ Error during Hub Service shutdown:', error);
        }
    }

    // Utility Methods
    async getHubStatus(): Promise<any> {
        try {
            const servicesCount = await this.cnd.sql().query(`SELECT COUNT(*) as count FROM service_registry WHERE status = 'active'`);
            const healthyServices = await this.cnd.sql().query(`SELECT COUNT(*) as count FROM service_health WHERE status = 'healthy'`);
            const recentRequests = await this.cnd.sql().query(`
        SELECT COUNT(*) as count FROM cross_service_logs 
        WHERE timestamp >= NOW() - INTERVAL '1 hour'
      `);

            return {
                status: 'operational',
                services: {
                    registered: parseInt(servicesCount.data?.[0]?.count || '0'),
                    healthy: parseInt(healthyServices.data?.[0]?.count || '0'),
                },
                crossServiceRequests: {
                    lastHour: parseInt(recentRequests.data?.[0]?.count || '0'),
                },
                hubService: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    platform: process.platform,
                    nodeVersion: process.version,
                },
                lastHealthCheck: new Date().toISOString(),
            };
        } catch (error) {
            console.error('❌ Failed to get Hub status:', error);
            return {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}

export default CNDHubService;
