import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const projects = [
      {
        id: 'proj_001',
        name: 'E-commerce Platform',
        status: 'active',
        progress: 75,
        technologies: ['Next.js', 'TypeScript', 'PostgreSQL'],
        last_updated: new Date().toISOString()
      },
      {
        id: 'proj_002',
        name: 'Mobile Banking App',
        status: 'planning',
        progress: 20,
        technologies: ['React Native', 'Node.js', 'MongoDB'],
        last_updated: new Date().toISOString()
      },
      {
        id: 'proj_003',
        name: 'AI Analytics Dashboard',
        status: 'completed',
        progress: 100,
        technologies: ['React', 'Python', 'TensorFlow'],
        last_updated: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      projects,
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, technologies = [], template } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const newProject = {
      id: `proj_${Date.now()}`,
      name,
      description,
      technologies,
      template,
      status: 'planning',
      progress: 0,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
