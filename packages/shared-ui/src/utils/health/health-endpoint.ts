import { NextRequest, NextResponse } from 'next/server';

/**
 * Configuration for health endpoint
 */
export interface HealthConfig {
    serviceName: string;
    serviceId?: string;
    version?: string;
    defaultPort?: string;
    features?: Record<string, string>;
    capabilities?: string[];
    endpoints?: Record<string, string>;
    customChecks?: () => Promise<Record<string, any>> | Record<string, any>;
    systemMetrics?: boolean;
    ecosystemIntegration?: {
        ecosystem?: string;
        domain?: string;
        enabledServices?: string[];
        protocol?: string;
        authentication?: string;
    };
    externalServices?: {
        [key: string]: {
            url: string;
            healthCheck?: () => Promise<any>;
        };
    };
}

/**
 * Standard health check response structure
 */
export interface HealthResponse {
    status: 'healthy' | 'unhealthy' | 'degraded' | 'operational';
    service: string;
    serviceId?: string;
    timestamp: string;
    version: string;
    environment: string;
    port?: string;
    responseTime?: string;
    features?: Record<string, string>;
    capabilities?: string[];
    endpoints?: Record<string, string>;
    ecosystem?: string;
    domain?: string;
    uptime?: number;
    memory?: any;
    metrics?: Record<string, any>;
    services?: Record<string, any>;
    communication?: {
        enabledServices?: string[];
        protocol?: string;
        authentication?: string;
    };
    customData?: Record<string, any>;
    error?: string;
    message?: string;
}

/**
 * Creates a standardized health endpoint handler
 * @param config Health configuration object
 * @returns Next.js API route handlers
 */
export function createHealthEndpoint(config: HealthConfig) {
    const {
        serviceName,
        serviceId,
        version = '1.0.0',
        defaultPort = '3000',
        features = {},
        capabilities = [],
        endpoints = {},
        customChecks,
        systemMetrics = false,
        ecosystemIntegration,
        externalServices = {}
    } = config;

    async function GET(request: NextRequest): Promise<NextResponse> {
        try {
            const startTime = Date.now();

            const healthStatus: HealthResponse = {
                status: 'healthy',
                service: serviceName,
                timestamp: new Date().toISOString(),
                version,
                environment: process.env.NODE_ENV || 'development'
            };

            // Add service ID if provided
            if (serviceId) {
                healthStatus.serviceId = serviceId;
            }

            // Add port if available
            const port = process.env.PORT || defaultPort;
            if (port) {
                healthStatus.port = port;
            }

            // Add features
            if (Object.keys(features).length > 0) {
                healthStatus.features = features;
            }

            // Add capabilities
            if (capabilities.length > 0) {
                healthStatus.capabilities = capabilities;
            }

            // Add endpoints
            if (Object.keys(endpoints).length > 0) {
                healthStatus.endpoints = endpoints;
            }

            // Add ecosystem integration
            if (ecosystemIntegration) {
                if (ecosystemIntegration.ecosystem) healthStatus.ecosystem = ecosystemIntegration.ecosystem;
                if (ecosystemIntegration.domain) healthStatus.domain = ecosystemIntegration.domain;
                if (ecosystemIntegration.enabledServices || ecosystemIntegration.protocol || ecosystemIntegration.authentication) {
                    healthStatus.communication = {
                        enabledServices: ecosystemIntegration.enabledServices,
                        protocol: ecosystemIntegration.protocol,
                        authentication: ecosystemIntegration.authentication
                    };
                }
            }

            // Add system metrics if requested
            if (systemMetrics) {
                healthStatus.uptime = Math.floor(process.uptime());
                healthStatus.memory = process.memoryUsage();
                healthStatus.metrics = {
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage(),
                    nodeVersion: process.version,
                    platform: process.platform
                };
            }

            // Check external services
            if (Object.keys(externalServices).length > 0) {
                const services: Record<string, any> = {};
                for (const [name, serviceConfig] of Object.entries(externalServices)) {
                    try {
                        if (serviceConfig.healthCheck) {
                            const serviceHealth = await serviceConfig.healthCheck();
                            services[name] = {
                                status: 'operational',
                                url: serviceConfig.url,
                                ...serviceHealth
                            };
                        } else {
                            services[name] = {
                                status: 'operational',
                                url: serviceConfig.url
                            };
                        }
                    } catch (error) {
                        services[name] = {
                            status: 'unhealthy',
                            url: serviceConfig.url,
                            error: error instanceof Error ? error.message : 'Unknown error'
                        };
                    }
                }
                healthStatus.services = services;
            }

            // Add custom health checks if provided
            if (customChecks) {
                try {
                    const customData = await customChecks();
                    healthStatus.customData = customData;
                } catch (customError) {
                    // Custom checks failed, but service is still operational
                    healthStatus.customData = {
                        customChecks: 'failed',
                        error: customError instanceof Error ? customError.message : 'Unknown custom check error'
                    };
                }
            }

            // Calculate response time
            const responseTime = Date.now() - startTime;
            healthStatus.responseTime = `${responseTime}ms`;

            // Set appropriate status based on service health
            if (healthStatus.services) {
                const serviceStatuses = Object.values(healthStatus.services).map((s: any) => s.status);
                const unhealthyCount = serviceStatuses.filter(status => status === 'unhealthy').length;
                if (unhealthyCount > 0) {
                    healthStatus.status = unhealthyCount === serviceStatuses.length ? 'unhealthy' : 'degraded';
                }
            }

            return NextResponse.json(healthStatus, {
                status: 200,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
        } catch (error) {
            const errorResponse: HealthResponse = {
                status: 'unhealthy',
                service: serviceName,
                timestamp: new Date().toISOString(),
                version,
                environment: process.env.NODE_ENV || 'development',
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            if (serviceId) errorResponse.serviceId = serviceId;

            // Add basic service status as degraded for external services
            if (Object.keys(externalServices).length > 0) {
                const services: Record<string, any> = {};
                Object.keys(externalServices).forEach(name => {
                    services[name] = { status: 'unknown' };
                });
                errorResponse.services = services;
            }

            return NextResponse.json(errorResponse, { status: 503 });
        }
    }

    async function HEAD(request: NextRequest): Promise<Response> {
        return new Response(null, { status: 200 });
    }

    return { GET, HEAD };
}

/**
 * Standard feature status values
 */
export const FeatureStatus = {
    OPERATIONAL: 'operational',
    DEGRADED: 'degraded',
    DOWN: 'down',
    MAINTENANCE: 'maintenance'
} as const;

/**
 * Standard service status values
 */
export const ServiceStatus = {
    HEALTHY: 'healthy',
    UNHEALTHY: 'unhealthy',
    DEGRADED: 'degraded',
    OPERATIONAL: 'operational',
    WARNING: 'warning',
    UNKNOWN: 'unknown'
} as const;

/**
 * Common feature sets for different service types
 */
export const CommonFeatures = {
    WEB_APP: {
        frontend: FeatureStatus.OPERATIONAL,
        api: FeatureStatus.OPERATIONAL,
        database: FeatureStatus.OPERATIONAL
    },
    API_SERVICE: {
        api: FeatureStatus.OPERATIONAL,
        authentication: FeatureStatus.OPERATIONAL,
        database: FeatureStatus.OPERATIONAL
    },
    AI_SERVICE: {
        ai_processing: FeatureStatus.OPERATIONAL,
        model_inference: FeatureStatus.OPERATIONAL,
        data_processing: FeatureStatus.OPERATIONAL
    },
    ANALYTICS: {
        data_collection: FeatureStatus.OPERATIONAL,
        reporting: FeatureStatus.OPERATIONAL,
        visualization: FeatureStatus.OPERATIONAL
    },
    TALENT_MANAGEMENT: {
        talent_management: FeatureStatus.OPERATIONAL,
        hr_analytics: FeatureStatus.OPERATIONAL,
        recruitment: FeatureStatus.OPERATIONAL,
        performance_tracking: FeatureStatus.OPERATIONAL,
        employee_onboarding: FeatureStatus.OPERATIONAL
    },
    MEMORY_SERVICE: {
        memory_management: FeatureStatus.OPERATIONAL,
        context_storage: FeatureStatus.OPERATIONAL,
        intelligent_recall: FeatureStatus.OPERATIONAL,
        agent_memory: FeatureStatus.OPERATIONAL,
        ecosystem_integration: FeatureStatus.OPERATIONAL
    }
} as const;

/**
 * Common capabilities for different service types
 */
export const CommonCapabilities = {
    AI_SERVICE: [
        'ai-assistant',
        'code-generation',
        'natural-language-processing',
        'intelligent-automation'
    ],
    TALENT_AI: [
        'talent-management',
        'hr-analytics',
        'recruitment',
        'performance-tracking',
        'employee-onboarding'
    ],
    MEMORY_AI: [
        'memory_management',
        'context_storage',
        'intelligent_recall',
        'agent_memory',
        'ecosystem_integration'
    ],
    CODE_ANALYSIS: [
        'code-analysis',
        'documentation-generation',
        'blockchain-support',
        'static-analysis'
    ]
} as const;