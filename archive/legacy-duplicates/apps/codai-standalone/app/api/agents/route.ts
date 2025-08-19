import { NextRequest, NextResponse } from 'next/server'

interface AgentInfo {
  id: string
  name: string
  type: string
  status: 'online' | 'offline' | 'busy'
  capabilities: string[]
  last_active: string
  description?: string
  specialties?: string[]
}

const agents: AgentInfo[] = [
  {
    id: 'codai-senior-dev',
    name: 'Senior Developer Agent',
    type: 'development',
    status: 'online',
    capabilities: ['React', 'TypeScript', 'Node.js', 'System Design', 'Performance Optimization'],
    specialties: ['Frontend Development', 'Backend APIs', 'Database Design'],
    description: 'Expert in full-stack development, architecture design, and code optimization',
    last_active: new Date().toISOString()
  },
  {
    id: 'codai-devops',
    name: 'DevOps Engineer Agent',
    type: 'infrastructure',
    status: 'online',
    capabilities: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GitHub Actions'],
    specialties: ['Infrastructure as Code', 'Monitoring', 'Security'],
    description: 'Specialized in CI/CD, infrastructure, and deployment automation',
    last_active: new Date().toISOString()
  },
  {
    id: 'codai-qa',
    name: 'QA Engineer Agent',
    type: 'testing',
    status: 'online',
    capabilities: ['Playwright', 'Jest', 'Cypress', 'API Testing', 'Performance Testing'],
    specialties: ['Test Automation', 'Bug Analysis', 'Quality Metrics'],
    description: 'Expert in testing strategies, automation, and quality assurance',
    last_active: new Date().toISOString()
  },
  {
    id: 'codai-security',
    name: 'Security Engineer Agent',
    type: 'security',
    status: 'online',
    capabilities: ['Security Auditing', 'Penetration Testing', 'OWASP', 'Compliance'],
    specialties: ['Application Security', 'Infrastructure Security', 'Compliance'],
    description: 'Focused on security audits, vulnerability assessment, and secure coding',
    last_active: new Date().toISOString()
  },
  {
    id: 'codai-ux',
    name: 'UX Designer Agent',
    type: 'design',
    status: 'busy',
    capabilities: ['User Research', 'Prototyping', 'Accessibility', 'Design Systems'],
    specialties: ['User Interface Design', 'User Experience', 'Design Thinking'],
    description: 'Specialized in user experience design and interface optimization',
    last_active: new Date().toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('id')
    const capability = searchParams.get('capability')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    let filteredAgents = [...agents]

    // Filter by specific agent ID
    if (agentId) {
      filteredAgents = filteredAgents.filter(agent => agent.id === agentId)
    }

    // Filter by capability
    if (capability) {
      filteredAgents = filteredAgents.filter(agent =>
        agent.capabilities.some(cap =>
          cap.toLowerCase().includes(capability.toLowerCase())
        )
      )
    }

    // Filter by status
    if (status) {
      filteredAgents = filteredAgents.filter(agent => agent.status === status)
    }

    // Filter by type
    if (type) {
      filteredAgents = filteredAgents.filter(agent => agent.type === type)
    }

    return NextResponse.json({
      agents: filteredAgents,
      total: filteredAgents.length,
      online: filteredAgents.filter(a => a.status === 'online').length,
      busy: filteredAgents.filter(a => a.status === 'busy').length,
      offline: filteredAgents.filter(a => a.status === 'offline').length,
      available_capabilities: [...new Set(agents.flatMap(agent => agent.capabilities))],
      available_types: [...new Set(agents.map(agent => agent.type))],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent_id, task, priority = 'normal' } = body

    if (!agent_id || !task) {
      return NextResponse.json(
        { error: 'Agent ID and task are required' },
        { status: 400 }
      )
    }

    const agent = agents.find(a => a.id === agent_id)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    const taskAssignment = {
      id: `task_${Date.now()}`,
      agent_id,
      agent_name: agent.name,
      task,
      priority,
      status: 'assigned',
      assigned_at: new Date().toISOString(),
      estimated_completion: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    }

    return NextResponse.json(taskAssignment, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to assign task' },
      { status: 500 }
    )
  }
}
