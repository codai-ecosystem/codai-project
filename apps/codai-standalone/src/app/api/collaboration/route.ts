import { NextRequest, NextResponse } from 'next/server'

// Mock collaboration data
const mockCollaborationSessions = [
  {
    id: 'collab_001',
    project_id: 'proj_001',
    session_name: 'CODAI Core Architecture Review',
    participants: [
      { agent_id: 'agent_001', role: 'lead_developer', joined_at: '2024-12-19T14:00:00Z' },
      { agent_id: 'agent_002', role: 'devops_engineer', joined_at: '2024-12-19T14:02:00Z' },
      { agent_id: 'agent_004', role: 'ux_designer', joined_at: '2024-12-19T14:05:00Z' }
    ],
    status: 'active',
    session_type: 'code_review',
    created_at: '2024-12-19T14:00:00Z',
    last_activity: '2024-12-19T15:45:00Z',
    deliverables: [
      'Architecture documentation',
      'Security audit report',
      'Performance optimization plan'
    ]
  },
  {
    id: 'collab_002',
    project_id: 'proj_002',
    session_name: 'MemorAI Performance Optimization',
    participants: [
      { agent_id: 'agent_001', role: 'senior_developer', joined_at: '2024-12-19T10:00:00Z' },
      { agent_id: 'agent_003', role: 'data_scientist', joined_at: '2024-12-19T10:30:00Z' }
    ],
    status: 'completed',
    session_type: 'optimization',
    created_at: '2024-12-19T10:00:00Z',
    last_activity: '2024-12-19T13:30:00Z',
    deliverables: [
      'Performance benchmarks',
      'Optimization recommendations',
      'Implementation timeline'
    ]
  },
  {
    id: 'collab_003',
    project_id: 'proj_003',
    session_name: 'BancAI Security Assessment',
    participants: [
      { agent_id: 'agent_002', role: 'security_engineer', joined_at: '2024-12-19T09:00:00Z' },
      { agent_id: 'agent_001', role: 'lead_developer', joined_at: '2024-12-19T09:15:00Z' }
    ],
    status: 'scheduled',
    session_type: 'security_review',
    created_at: '2024-12-19T08:45:00Z',
    last_activity: '2024-12-19T09:30:00Z',
    deliverables: [
      'Security vulnerability assessment',
      'Compliance verification',
      'Risk mitigation plan'
    ]
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')
  const status = searchParams.get('status')
  const sessionType = searchParams.get('session_type')

  let filteredSessions = mockCollaborationSessions

  // Filter by project ID
  if (projectId) {
    filteredSessions = filteredSessions.filter(session => session.project_id === projectId)
  }

  // Filter by status
  if (status) {
    filteredSessions = filteredSessions.filter(session => session.status === status)
  }

  // Filter by session type
  if (sessionType) {
    filteredSessions = filteredSessions.filter(session => session.session_type === sessionType)
  }

  const responseData = {
    collaboration_sessions: filteredSessions,
    summary: {
      total: filteredSessions.length,
      active: filteredSessions.filter(s => s.status === 'active').length,
      completed: filteredSessions.filter(s => s.status === 'completed').length,
      scheduled: filteredSessions.filter(s => s.status === 'scheduled').length,
      session_types: [...new Set(filteredSessions.map(s => s.session_type))]
    },
    filters: {
      project_id: projectId || null,
      status: status || null,
      session_type: sessionType || null
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
    const { project_id, session_name, session_type } = body

    if (!project_id || !session_name || !session_type) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['project_id', 'session_name', 'session_type'],
          provided: Object.keys(body)
        },
        { status: 400 }
      )
    }

    // Validate session type
    const validSessionTypes = [
      'code_review',
      'planning',
      'optimization',
      'security_review',
      'design_review',
      'testing',
      'deployment'
    ]

    if (!validSessionTypes.includes(session_type)) {
      return NextResponse.json(
        {
          error: 'Invalid session type',
          valid_types: validSessionTypes,
          provided: session_type
        },
        { status: 400 }
      )
    }

    // Create new collaboration session (mock implementation)
    const newSession = {
      id: `collab_${Date.now()}`,
      project_id,
      session_name,
      participants: body.participants || [],
      status: 'scheduled',
      session_type,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      deliverables: body.deliverables || []
    }

    // In a real implementation, save to database
    mockCollaborationSessions.push(newSession)

    return NextResponse.json(
      {
        message: 'Collaboration session created successfully',
        session: newSession
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
