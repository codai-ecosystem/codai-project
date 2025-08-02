import { NextRequest, NextResponse } from 'next/server'

interface WorkspaceInfo {
  id: string
  name: string
  type: 'development' | 'staging' | 'production'
  status: 'active' | 'inactive' | 'maintenance'
  services: ServiceInfo[]
  last_updated: string
  created: string
}

interface ServiceInfo {
  id: string
  name: string
  port: number
  status: 'running' | 'stopped' | 'error'
  url?: string
  health_check?: string
  description: string
}

const workspaces: WorkspaceInfo[] = [
  {
    id: 'codai-main',
    name: 'CODAI Main Workspace',
    type: 'development',
    status: 'active',
    services: [
      {
        id: 'gateway',
        name: 'API Gateway',
        port: 4000,
        status: 'running',
        url: 'http://localhost:4000',
        health_check: 'http://localhost:4000/health',
        description: 'Main API gateway for routing requests'
      },
      {
        id: 'codai',
        name: 'CODAI Service',
        port: 4001,
        status: 'running',
        url: 'http://localhost:4001',
        health_check: 'http://localhost:4001/health',
        description: 'Core CODAI platform service'
      },
      {
        id: 'admin',
        name: 'Admin Interface',
        port: 4002,
        status: 'running',
        url: 'http://localhost:4002',
        health_check: 'http://localhost:4002/health',
        description: 'Administrative interface'
      },
      {
        id: 'hub',
        name: 'Service Hub',
        port: 4003,
        status: 'running',
        url: 'http://localhost:4003',
        health_check: 'http://localhost:4003/health',
        description: 'Service discovery and coordination hub'
      },
      {
        id: 'id',
        name: 'Identity Service',
        port: 4004,
        status: 'running',
        url: 'http://localhost:4004',
        health_check: 'http://localhost:4004/health',
        description: 'User identity and authentication service'
      },
      {
        id: 'bancai',
        name: 'BancAI Service',
        port: 4005,
        status: 'running',
        url: 'http://localhost:4005',
        health_check: 'http://localhost:4005/health',
        description: 'Banking and financial AI service'
      },
      {
        id: 'memorai',
        name: 'MemorAI Service',
        port: 4006,
        status: 'running',
        url: 'http://localhost:4006',
        health_check: 'http://localhost:4006/health',
        description: 'Memory and context AI service'
      }
    ],
    last_updated: new Date().toISOString(),
    created: '2024-01-01T00:00:00Z'
  },
  {
    id: 'codai-production',
    name: 'CODAI Production',
    type: 'production',
    status: 'active',
    services: [
      {
        id: 'codai-main',
        name: 'CODAI Platform',
        port: 443,
        status: 'running',
        url: 'https://codai.ro',
        health_check: 'https://codai.ro/api/health',
        description: 'Main production CODAI platform'
      },
      {
        id: 'auth-service',
        name: 'Authentication',
        port: 443,
        status: 'running',
        url: 'https://auth.codai.ro',
        health_check: 'https://auth.codai.ro/api/health',
        description: 'Production authentication service'
      },
      {
        id: 'hub-service',
        name: 'Service Hub',
        port: 443,
        status: 'running',
        url: 'https://hub.codai.ro',
        health_check: 'https://hub.codai.ro/api/health',
        description: 'Production service hub'
      },
      {
        id: 'id-service',
        name: 'Identity Service',
        port: 443,
        status: 'running',
        url: 'https://id.codai.ro',
        health_check: 'https://id.codai.ro/api/health',
        description: 'Production identity service'
      }
    ],
    last_updated: new Date().toISOString(),
    created: '2024-01-15T00:00:00Z'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('id')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    let filteredWorkspaces = [...workspaces]

    // Filter by workspace ID
    if (workspaceId) {
      filteredWorkspaces = filteredWorkspaces.filter(workspace => workspace.id === workspaceId)
    }

    // Filter by type
    if (type) {
      filteredWorkspaces = filteredWorkspaces.filter(workspace => workspace.type === type)
    }

    // Filter by status
    if (status) {
      filteredWorkspaces = filteredWorkspaces.filter(workspace => workspace.status === status)
    }

    // If specific workspace requested, return detailed info
    if (workspaceId && filteredWorkspaces.length === 1) {
      const workspace = filteredWorkspaces[0]

      // Simulate health checks for services
      const servicesWithHealth = await Promise.all(
        workspace.services.map(async (service) => {
          try {
            // In a real implementation, this would make actual health check requests
            const isHealthy = Math.random() > 0.1 // 90% healthy simulation
            return {
              ...service,
              health_status: isHealthy ? 'healthy' : 'unhealthy',
              last_health_check: new Date().toISOString(),
              response_time: Math.floor(Math.random() * 100) + 50 // 50-150ms
            }
          } catch {
            return {
              ...service,
              health_status: 'unreachable',
              last_health_check: new Date().toISOString(),
              response_time: null
            }
          }
        })
      )

      return NextResponse.json({
        ...workspace,
        services: servicesWithHealth,
        summary: {
          total_services: workspace.services.length,
          running_services: servicesWithHealth.filter(s => s.health_status === 'healthy').length,
          unhealthy_services: servicesWithHealth.filter(s => s.health_status === 'unhealthy').length,
          unreachable_services: servicesWithHealth.filter(s => s.health_status === 'unreachable').length
        }
      })
    }

    return NextResponse.json({
      workspaces: filteredWorkspaces.map(workspace => ({
        ...workspace,
        service_count: workspace.services.length,
        running_services: workspace.services.filter(s => s.status === 'running').length
      })),
      total: filteredWorkspaces.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch workspace information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type = 'development', services = [] } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Workspace name is required' },
        { status: 400 }
      )
    }

    const newWorkspace: WorkspaceInfo = {
      id: `workspace-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name,
      type,
      status: 'active',
      services,
      last_updated: new Date().toISOString(),
      created: new Date().toISOString()
    }

    // In a real implementation, this would save to a database
    return NextResponse.json({
      message: 'Workspace created successfully',
      workspace: newWorkspace
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create workspace', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, services } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      )
    }

    const workspaceIndex = workspaces.findIndex(workspace => workspace.id === id)
    if (workspaceIndex === -1) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // Update workspace properties
    if (status) workspaces[workspaceIndex].status = status
    if (services) workspaces[workspaceIndex].services = services
    workspaces[workspaceIndex].last_updated = new Date().toISOString()

    return NextResponse.json({
      message: 'Workspace updated successfully',
      workspace: workspaces[workspaceIndex]
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update workspace', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
