import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: 'frontend' | 'backend' | 'fullstack' | 'library' | 'tools'
  tags: string[]
  language: string
  framework: string
  features: string[]
  dependencies: string[]
  devDependencies: string[]
  scripts: Record<string, string>
  files: {
    path: string
    content: string
    template?: boolean
  }[]
  created: Date
  updated: Date
}

// Helper function to get templates directory
function getTemplatesDirectory(): string {
  const workspaceRoot = process.cwd().includes('apps')
    ? path.join(process.cwd(), '..', '..')
    : process.cwd()
  return path.join(workspaceRoot, '.codai', 'templates')
}

// Helper function to load template with full details
async function loadTemplateWithDetails(templateId: string): Promise<ProjectTemplate | null> {
  try {
    const templatesDir = getTemplatesDirectory()
    const templatePath = path.join(templatesDir, `${templateId}.json`)
    const content = await fs.readFile(templatePath, 'utf8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

// Helper function to save template
async function saveTemplate(template: ProjectTemplate): Promise<void> {
  const templatesDir = getTemplatesDirectory()
  await fs.mkdir(templatesDir, { recursive: true })

  const templatePath = path.join(templatesDir, `${template.id}.json`)
  await fs.writeFile(templatePath, JSON.stringify(template, null, 2))
}

// GET: Get template details with file contents
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // First try to load from custom templates
    let template = await loadTemplateWithDetails(templateId)

    // If not found in custom templates, check default templates
    if (!template) {
      // Import default templates (this is a simplified approach)
      const defaultTemplates = await import('../route')

      // This is a workaround - in a real app, you'd store defaults in a database
      // For now, return a not found error
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      template
    })

  } catch (error) {
    console.error('Error loading template:', error)
    return NextResponse.json(
      { error: 'Failed to load template' },
      { status: 500 }
    )
  }
}

// PUT: Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id
    const updates = await request.json()

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Load existing template
    const existingTemplate = await loadTemplateWithDetails(templateId)
    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Update template
    const updatedTemplate: ProjectTemplate = {
      ...existingTemplate,
      ...updates,
      id: templateId, // Prevent ID changes
      updated: new Date()
    }

    await saveTemplate(updatedTemplate)

    return NextResponse.json({
      message: 'Template updated successfully',
      template: updatedTemplate
    })

  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE: Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const templatesDir = getTemplatesDirectory()
    const templatePath = path.join(templatesDir, `${templateId}.json`)

    try {
      await fs.unlink(templatePath)

      return NextResponse.json({
        message: 'Template deleted successfully'
      })

    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }
      throw error
    }

  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
