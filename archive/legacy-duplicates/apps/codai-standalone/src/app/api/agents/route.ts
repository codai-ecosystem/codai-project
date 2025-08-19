import { NextRequest, NextResponse } from 'next/server'

// Mock AI agents data
const mockAgents = [
  {
    id: 'agent_001',
    name: 'Senior Developer Agent',
    type: 'development',
    status: 'active',
    capabilities: [
      'TypeScript/JavaScript development',
      'React/Next.js expertise',
      'API design and implementation',
      'Code review and optimization',
      'Testing and quality assurance'
    ],
    current_tasks: 2,
    max_concurrent_tasks: 5,
    efficiency_score: 94,
    total_projects: 15,
    created_at: '2024-01-10T08:00:00Z',
    last_active: '2024-12-19T15:45:00Z'
  },
  {
    id: 'agent_002',
    name: 'DevOps Engineer Agent',
    type: 'infrastructure',
    status: 'active',
    capabilities: [
      'Container orchestration (Docker/Kubernetes)',
      'CI/CD pipeline management',
      'Cloud infrastructure (AWS/Azure)',
      'Monitoring and logging',
      'Security and compliance'
    ],
    current_tasks: 1,
    max_concurrent_tasks: 3,
    efficiency_score: 98,
    total_projects: 12,
    created_at: '2024-01-15T10:30:00Z',
    last_active: '2024-12-19T15:30:00Z'
  },
  {
    id: 'agent_003',
    name: 'Data Science Agent',
    type: 'analytics',
    status: 'active',
    capabilities: [
      'Machine learning model development',
      'Data analysis and visualization',
      'Statistical analysis',
      'Python/R programming',
      'Big data processing'
    ],
    current_tasks: 3,
    max_concurrent_tasks: 4,
    efficiency_score: 91,
    total_projects: 8,
    created_at: '2024-02-01T09:15:00Z',
    last_active: '2024-12-19T14:20:00Z'
  },
  {
    id: 'agent_004',
    name: 'UX Designer Agent',
    type: 'design',
    status: 'busy',
    capabilities: [
      'User experience design',
      'Interface prototyping',
      'User research and testing',
      'Design systems',
      'Accessibility compliance'
    ],
    current_tasks: 4,
    max_concurrent_tasks: 4,
    efficiency_score: 89,
    total_projects: 10,
    created_at: '2024-01-20T14:00:00Z',
    last_active: '2024-12-19T15:10:00Z'
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const available = searchParams.get('available') === 'true'

  let filteredAgents = mockAgents

  // Filter by type
  if (type) {
    filteredAgents = filteredAgents.filter(agent => agent.type === type)
  }

  // Filter by status
  if (status) {
    filteredAgents = filteredAgents.filter(agent => agent.status === status)
  }

  // Filter by availability (agents with capacity for more tasks)
  if (available) {
    filteredAgents = filteredAgents.filter(agent =>
      agent.current_tasks < agent.max_concurrent_tasks
    )
  }

  const responseData = {
    agents: filteredAgents,
    summary: {
      total: filteredAgents.length,
      active: filteredAgents.filter(a => a.status === 'active').length,
      busy: filteredAgents.filter(a => a.status === 'busy').length,
      available: filteredAgents.filter(a => a.current_tasks < a.max_concurrent_tasks).length,
      average_efficiency: Math.round(
        filteredAgents.reduce((sum, agent) => sum + agent.efficiency_score, 0) / filteredAgents.length
      )
    },
    filters: {
      type: type || null,
      status: status || null,
      available_only: available
    },
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(responseData, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { name, type, capabilities = [] } = body

    if (!name || !type) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['name', 'type'],
          provided: Object.keys(body)
        },
        { status: 400 }
      )
    }

    // Validate agent type
    const validTypes = ['development', 'infrastructure', 'analytics', 'design', 'qa', 'management']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          error: 'Invalid agent type',
          valid_types: validTypes,
          provided: type
        },
        { status: 400 }
      )
    }

    // Create new agent (mock implementation)
    const newAgent = {
      id: `agent_${Date.now()}`,
      name,
      type,
      status: 'active',
      capabilities,
      current_tasks: 0,
      max_concurrent_tasks: body.max_concurrent_tasks || 3,
      efficiency_score: 0,
      total_projects: 0,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    }

    // In a real implementation, save to database
    mockAgents.push(newAgent)

    return NextResponse.json(
      {
        message: 'Agent created successfully',
        agent: newAgent
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Invalid JSON payload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    )
  }
}
