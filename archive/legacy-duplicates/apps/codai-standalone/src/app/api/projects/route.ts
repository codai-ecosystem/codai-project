import { NextRequest, NextResponse } from 'next/server'

// Mock data for demonstration
const mockProjects = [
  {
    id: 'proj_001',
    name: 'CODAI Core Platform',
    description: 'Main AI development platform with integrated services',
    status: 'active',
    tech_stack: ['Next.js', 'React', 'TypeScript', 'Azure OpenAI'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-19T15:30:00Z',
    team_size: 8,
    completion: 85
  },
  {
    id: 'proj_002',
    name: 'MemorAI Service',
    description: 'Advanced memory management system for AI agents',
    status: 'active',
    tech_stack: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-12-19T14:45:00Z',
    team_size: 4,
    completion: 92
  },
  {
    id: 'proj_003',
    name: 'BancAI Integration',
    description: 'Banking and financial AI services integration',
    status: 'development',
    tech_stack: ['Python', 'FastAPI', 'TensorFlow', 'Kubernetes'],
    created_at: '2024-03-10T11:30:00Z',
    updated_at: '2024-12-19T13:20:00Z',
    team_size: 6,
    completion: 67
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  let filteredProjects = mockProjects

  // Filter by status if provided
  if (status) {
    filteredProjects = mockProjects.filter(project => project.status === status)
  }

  // Apply pagination
  const paginatedProjects = filteredProjects.slice(offset, offset + limit)

  const responseData = {
    projects: paginatedProjects,
    pagination: {
      total: filteredProjects.length,
      limit,
      offset,
      has_more: offset + limit < filteredProjects.length
    },
    filters: {
      status: status || null
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
    const { name, description, tech_stack = [] } = body

    if (!name || !description) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['name', 'description'],
          provided: Object.keys(body)
        },
        { status: 400 }
      )
    }

    // Create new project (mock implementation)
    const newProject = {
      id: `proj_${Date.now()}`,
      name,
      description,
      status: 'planning',
      tech_stack,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      team_size: body.team_size || 1,
      completion: 0
    }

    // In a real implementation, save to database
    mockProjects.push(newProject)

    return NextResponse.json(
      {
        message: 'Project created successfully',
        project: newProject
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
