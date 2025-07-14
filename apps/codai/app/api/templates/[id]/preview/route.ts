import { NextRequest, NextResponse } from 'next/server'
import { loadTemplate, generateProjectPreview, getTemplateVariables, validateTemplate } from '../../../../../lib/scaffolding'

// GET: Get template preview with project structure
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

    const url = new URL(request.url)
    const projectName = url.searchParams.get('projectName') || 'my-project'
    const description = url.searchParams.get('description') || 'A new project'
    const author = url.searchParams.get('author') || ''

    // Load template
    const template = await loadTemplate(templateId)
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Generate project structure preview
    const scaffoldingOptions = {
      projectName,
      description,
      author,
      license: 'MIT',
      version: '0.1.0'
    }

    const projectStructure = generateProjectPreview(template, scaffoldingOptions)
    const templateVariables = getTemplateVariables(template)
    const validationErrors = validateTemplate(template)

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        framework: template.framework,
        language: template.language,
        features: template.features
      },
      projectStructure,
      templateVariables,
      validationErrors,
      previewOptions: scaffoldingOptions
    })

  } catch (error) {
    console.error('Error generating template preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate template preview' },
      { status: 500 }
    )
  }
}

// POST: Validate template structure and variables
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id
    const { variables } = await request.json()

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Load template
    const template = await loadTemplate(templateId)
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Validate template with provided variables
    const validationErrors = validateTemplate(template)

    if (validationErrors.length > 0) {
      return NextResponse.json({
        valid: false,
        errors: validationErrors
      })
    }

    // Generate preview with custom variables
    const scaffoldingOptions = {
      projectName: 'example-project',
      description: 'Example project description',
      author: 'Example Author',
      license: 'MIT',
      version: '0.1.0',
      ...variables
    }

    const projectStructure = generateProjectPreview(template, scaffoldingOptions)
    const templateVariables = getTemplateVariables(template)

    return NextResponse.json({
      valid: true,
      projectStructure,
      templateVariables,
      processedVariables: scaffoldingOptions
    })

  } catch (error) {
    console.error('Error validating template:', error)
    return NextResponse.json(
      { error: 'Failed to validate template' },
      { status: 500 }
    )
  }
}
