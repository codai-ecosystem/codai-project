import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface Project {
  id: string
  name: string
  path: string
  type: string
  lastOpened: string
  gitUrl?: string
  description?: string
}

// Simple project storage - in production this would use a database
const PROJECTS_FILE = path.join(process.cwd(), '.aide-projects.json')

async function loadProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    // File doesn't exist, return empty array
    return []
  }
}

async function saveProjects(projects: Project[]): Promise<void> {
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2))
}

export async function GET() {
  try {
    const projects = await loadProjects()
    return NextResponse.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error('Failed to load projects:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load projects'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required'
        },
        { status: 400 }
      )
    }

    const projects = await loadProjects()

    // Create a project directory path based on name
    const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
    const projectPath = path.join(process.cwd(), 'projects', safeName)

    // Check if project already exists
    const existingProject = projects.find(p => p.name.toLowerCase() === name.toLowerCase())
    if (existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project with this name already exists'
        },
        { status: 409 }
      )
    }

    // Create project directory
    try {
      await fs.mkdir(projectPath, { recursive: true })

      // Create a basic package.json
      const packageJson = {
        name: safeName,
        version: '0.1.0',
        description: description || 'AI-generated project',
        main: 'index.js',
        scripts: {
          start: 'node index.js',
          dev: 'node index.js',
          test: 'echo "No tests specified"'
        }
      }

      await fs.writeFile(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      )

      // Create a basic README
      const readme = `# ${name}\n\n${description || 'AI-generated project'}\n\n## Getting Started\n\nThis project was created with AIDE AI Development Environment.\n`
      await fs.writeFile(path.join(projectPath, 'README.md'), readme)

    } catch (fsError) {
      console.error('Failed to create project directory:', fsError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create project directory'
        },
        { status: 500 }
      )
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name,
      path: projectPath,
      type: 'javascript', // Default type
      lastOpened: new Date().toISOString(),
      description
    }

    projects.push(newProject)
    await saveProjects(projects)

    return NextResponse.json({
      success: true,
      data: newProject
    })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, lastOpened, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const projects = await loadProjects()
    const projectIndex = projects.findIndex(p => p.id === id)

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Update project
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      lastOpened: lastOpened || new Date().toISOString()
    }

    await saveProjects(projects)

    return NextResponse.json({ project: projects[projectIndex] })
  } catch (error) {
    console.error('Failed to update project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const projects = await loadProjects()
    const filteredProjects = projects.filter(p => p.id !== id)

    if (filteredProjects.length === projects.length) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    await saveProjects(filteredProjects)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
