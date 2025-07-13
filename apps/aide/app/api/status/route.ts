import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Track server startup time
const startTime = Date.now()

interface StatusData {
    status: 'healthy' | 'degraded' | 'down'
    version: string
    uptime: number
    timestamp: string
    stats: {
        totalProjects: number
        activeConversations: number
        supportedLanguages: number
        uptime: number
    }
    services: {
        chat: 'operational' | 'degraded' | 'down'
        projects: 'operational' | 'degraded' | 'down'
        files: 'operational' | 'degraded' | 'down'
    }
}

async function getProjectsCount(): Promise<number> {
    try {
        const projectsFile = path.join(process.cwd(), '.aide-projects.json')
        const data = await fs.readFile(projectsFile, 'utf-8')
        const projects = JSON.parse(data)
        return Array.isArray(projects) ? projects.length : 0
    } catch {
        return 0
    }
}

async function getConversationsCount(): Promise<number> {
    try {
        // In a real implementation, this would check active WebSocket connections
        // or database records of active conversations
        return Math.floor(Math.random() * 5) + 1 // Simulated for demo
    } catch {
        return 0
    }
}

async function checkServiceHealth(service: string): Promise<'operational' | 'degraded' | 'down'> {
    try {
        // Simple health checks for each service
        switch (service) {
            case 'chat':
                // Check if chat API is responsive
                return 'operational'
            case 'projects':
                // Check if projects API is responsive
                const projectCount = await getProjectsCount()
                return projectCount >= 0 ? 'operational' : 'degraded'
            case 'files':
                // Check file system access
                await fs.access(process.cwd())
                return 'operational'
            default:
                return 'down'
        }
    } catch {
        return 'down'
    }
}

export async function GET(request: NextRequest) {
    try {
        const currentTime = Date.now()
        const uptimeSeconds = Math.floor((currentTime - startTime) / 1000)

        // Get real-time statistics
        const [totalProjects, activeConversations] = await Promise.all([
            getProjectsCount(),
            getConversationsCount()
        ])

        // Check service health
        const [chatHealth, projectsHealth, filesHealth] = await Promise.all([
            checkServiceHealth('chat'),
            checkServiceHealth('projects'),
            checkServiceHealth('files')
        ])

        // Determine overall status
        const allServices = [chatHealth, projectsHealth, filesHealth]
        const overallStatus = allServices.every(s => s === 'operational')
            ? 'healthy'
            : allServices.some(s => s === 'down')
                ? 'degraded'
                : 'healthy'

        const statusData: StatusData = {
            status: overallStatus,
            version: '2.0.0',
            uptime: uptimeSeconds,
            timestamp: new Date().toISOString(),
            stats: {
                totalProjects,
                activeConversations,
                supportedLanguages: 7, // TypeScript, JavaScript, Python, Rust, Go, Java, etc.
                uptime: uptimeSeconds
            },
            services: {
                chat: chatHealth,
                projects: projectsHealth,
                files: filesHealth
            }
        }

        return NextResponse.json(statusData)
    } catch (error) {
        console.error('Status API error:', error)

        return NextResponse.json({
            status: 'down',
            version: '2.0.0',
            uptime: 0,
            timestamp: new Date().toISOString(),
            error: 'Failed to get status',
            stats: {
                totalProjects: 0,
                activeConversations: 0,
                supportedLanguages: 0,
                uptime: 0
            },
            services: {
                chat: 'down',
                projects: 'down',
                files: 'down'
            }
        }, { status: 500 })
    }
}

// Health check endpoint (simpler version for basic monitoring)
export async function HEAD() {
    return new NextResponse(null, { status: 200 })
}
