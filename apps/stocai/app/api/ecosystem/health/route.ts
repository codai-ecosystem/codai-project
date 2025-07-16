import { NextRequest, NextResponse } from 'next/server'

interface ServiceHealth {
    service: string
    port: number
    status: 'healthy' | 'unhealthy' | 'unknown'
    responseTime: number
    lastChecked: Date
    version?: string
    connections?: number
}

interface EcosystemStatus {
    totalServices: number
    healthyServices: number
    unhealthyServices: number
    averageResponseTime: number
    systemLoad: number
    timestamp: Date
    services: ServiceHealth[]
}

// Known ecosystem services
const ECOSYSTEM_SERVICES = [
    { name: 'CODAI', port: 4030, description: 'Core Platform' },
    { name: 'MEMORAI', port: 4031, description: 'Memory Core' },
    { name: 'BANCAI', port: 4033, description: 'Banking Platform' },
    { name: 'STOCAI', port: 4065, description: 'AI Storage Service' },
    { name: 'StocAI', port: 4066, description: 'Stock Trading Platform' },
    { name: 'AIDE', port: 4073, description: 'Development Environment' },
    { name: 'Unknown Service', port: 4074, description: 'Unknown Service' },
    { name: 'PREZENTAI', port: 4081, description: 'Portfolio Platform' },
]

async function checkServiceHealth(service: { name: string; port: number }): Promise<ServiceHealth> {
    const startTime = Date.now()

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch(`http://localhost:${service.port}/api/health`, {
            signal: controller.signal,
            method: 'GET',
        })

        clearTimeout(timeout)
        const responseTime = Date.now() - startTime

        return {
            service: service.name,
            port: service.port,
            status: response.ok ? 'healthy' : 'unhealthy',
            responseTime,
            lastChecked: new Date(),
        }
    } catch (error) {
        // Try root endpoint if health endpoint fails
        try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 3000)

            const response = await fetch(`http://localhost:${service.port}`, {
                signal: controller.signal,
                method: 'GET',
            })

            clearTimeout(timeout)
            const responseTime = Date.now() - startTime

            return {
                service: service.name,
                port: service.port,
                status: response.ok ? 'healthy' : 'unhealthy',
                responseTime,
                lastChecked: new Date(),
            }
        } catch (rootError) {
            return {
                service: service.name,
                port: service.port,
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                lastChecked: new Date(),
            }
        }
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const startTime = Date.now()

        // Check all services in parallel
        const healthChecks = await Promise.all(
            ECOSYSTEM_SERVICES.map(service => checkServiceHealth(service))
        )

        const healthyServices = healthChecks.filter(check => check.status === 'healthy')
        const unhealthyServices = healthChecks.filter(check => check.status === 'unhealthy')

        const averageResponseTime = healthChecks.reduce((sum, check) => sum + check.responseTime, 0) / healthChecks.length

        const ecosystemStatus: EcosystemStatus = {
            totalServices: healthChecks.length,
            healthyServices: healthyServices.length,
            unhealthyServices: unhealthyServices.length,
            averageResponseTime: Math.round(averageResponseTime),
            systemLoad: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
            timestamp: new Date(),
            services: healthChecks.sort((a, b) => a.port - b.port),
        }

        const processingTime = Date.now() - startTime

        return NextResponse.json({
            success: true,
            processingTime,
            ecosystem: ecosystemStatus,
            stocai: {
                status: 'healthy',
                version: '1.0.0',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                features: ['vector-storage', 'rag', 'analytics', 'file-management'],
            }
        })
    } catch (error) {
        console.error('Ecosystem health check failed:', error)

        return NextResponse.json({
            success: false,
            error: 'Failed to check ecosystem health',
            timestamp: new Date(),
        }, { status: 500 })
    }
}
