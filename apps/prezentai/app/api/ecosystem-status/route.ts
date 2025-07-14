import { NextRequest, NextResponse } from 'next/server'

interface EcosystemStatus {
    appName: string
    port: number
    status: 'online' | 'offline' | 'maintenance'
    responseTime: number
    uptime: number
    lastChecked: string
}

const ecosystemApps = [
    { name: 'CODAI', port: 4030 },
    { name: 'MEMORAI', port: 4031 },
    { name: 'BANCAI', port: 4033 },
    { name: 'STOCAI', port: 4065 },
    { name: 'AIDE', port: 4073 },
    { name: 'PREZENTAI', port: 4085 }
]

async function checkAppStatus(appName: string, port: number): Promise<EcosystemStatus> {
    const startTime = Date.now()

    try {
        // Check if the app is running by making a request to localhost
        const response = await fetch(`http://localhost:${port}`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000) // 5 second timeout
        })

        const responseTime = Date.now() - startTime
        const status = response.ok ? 'online' : 'offline'

        return {
            appName,
            port,
            status,
            responseTime,
            uptime: Math.random() * 99 + 1, // Mock uptime percentage
            lastChecked: new Date().toISOString()
        }
    } catch (error) {
        return {
            appName,
            port,
            status: 'offline',
            responseTime: Date.now() - startTime,
            uptime: 0,
            lastChecked: new Date().toISOString()
        }
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log('[PREZENTAI API] Checking ecosystem status...')

        // Check status of all ecosystem apps in parallel
        const statusChecks = ecosystemApps.map(app =>
            checkAppStatus(app.name, app.port)
        )

        const statuses = await Promise.all(statusChecks)

        // Calculate overall ecosystem health
        const onlineApps = statuses.filter(app => app.status === 'online').length
        const totalApps = statuses.length
        const healthPercentage = Math.round((onlineApps / totalApps) * 100)

        const response = {
            timestamp: new Date().toISOString(),
            ecosystemHealth: {
                overall: healthPercentage,
                onlineServices: onlineApps,
                totalServices: totalApps,
                status: healthPercentage >= 80 ? 'healthy' : healthPercentage >= 50 ? 'degraded' : 'critical'
            },
            services: statuses,
            metrics: {
                avgResponseTime: Math.round(
                    statuses.reduce((sum, app) => sum + app.responseTime, 0) / statuses.length
                ),
                avgUptime: Math.round(
                    statuses.reduce((sum, app) => sum + app.uptime, 0) / statuses.length
                )
            }
        }

        console.log(`[PREZENTAI API] Ecosystem health: ${healthPercentage}% (${onlineApps}/${totalApps} services online)`)

        return NextResponse.json(response)
    } catch (error) {
        console.error('[PREZENTAI API] Error checking ecosystem status:', error)

        return NextResponse.json(
            {
                error: 'Failed to check ecosystem status',
                timestamp: new Date().toISOString(),
                ecosystemHealth: {
                    overall: 0,
                    onlineServices: 0,
                    totalServices: ecosystemApps.length,
                    status: 'critical'
                }
            },
            { status: 500 }
        )
    }
}
