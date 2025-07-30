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

interface ScaffoldingOptions {
  projectName: string
  description?: string
  author?: string
  license?: string
  repository?: string
  version?: string
  [key: string]: string | undefined
}

/**
 * Advanced template variable substitution
 * Supports nested variables, conditional content, and dynamic generation
 */
export function substituteTemplateVariables(
  content: string,
  variables: ScaffoldingOptions
): string {
  let result = content

  // Basic variable substitution {{variableName}}
  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, value)
    }
  }

  // Conditional content {{#if condition}}content{{/if}}
  const conditionalRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g
  result = result.replace(conditionalRegex, (match, condition, content) => {
    return variables[condition] ? content : ''
  })

  // List iteration {{#each items}}{{this}}{{/each}}
  const eachRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g
  result = result.replace(eachRegex, (match, listName, template) => {
    const list = variables[listName]
    if (Array.isArray(list)) {
      return list.map(item => template.replace(/{{this}}/g, item)).join('')
    }
    return ''
  })

  // Helper functions
  result = result.replace(/{{camelCase\s+(\w+)}}/g, (match, varName) => {
    const value = variables[varName]
    if (value) {
      return value.replace(/[-_\s]+(.)?/g, (_, char) =>
        char ? char.toUpperCase() : ''
      ).replace(/^./, char => char.toLowerCase())
    }
    return match
  })

  result = result.replace(/{{pascalCase\s+(\w+)}}/g, (match, varName) => {
    const value = variables[varName]
    if (value) {
      return value.replace(/[-_\s]+(.)?/g, (_, char) =>
        char ? char.toUpperCase() : ''
      ).replace(/^./, char => char.toUpperCase())
    }
    return match
  })

  result = result.replace(/{{kebabCase\s+(\w+)}}/g, (match, varName) => {
    const value = variables[varName]
    if (value) {
      return value.replace(/[_\s]+/g, '-').toLowerCase()
    }
    return match
  })

  result = result.replace(/{{snakeCase\s+(\w+)}}/g, (match, varName) => {
    const value = variables[varName]
    if (value) {
      return value.replace(/[-\s]+/g, '_').toLowerCase()
    }
    return match
  })

  return result
}

/**
 * Get workspace root directory
 */
function getWorkspaceRoot(): string {
  let workspaceRoot = process.cwd()
  if (workspaceRoot.includes('apps')) {
    workspaceRoot = path.join(workspaceRoot, '..', '..')
  }
  return workspaceRoot
}

/**
 * Load template from the templates system
 */
export async function loadTemplate(templateId: string): Promise<ProjectTemplate | null> {
  try {
    const workspaceRoot = getWorkspaceRoot()
    const templatesDir = path.join(workspaceRoot, '.codai', 'templates')
    const templatePath = path.join(templatesDir, `${templateId}.json`)

    const content = await fs.readFile(templatePath, 'utf8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

/**
 * Advanced project scaffolding from template
 */
export async function scaffoldProject(
  projectPath: string,
  templateId: string,
  options: ScaffoldingOptions
): Promise<void> {
  // Load template
  const template = await loadTemplate(templateId)
  if (!template) {
    throw new Error(`Template '${templateId}' not found`)
  }

  // Ensure project directory exists
  await fs.mkdir(projectPath, { recursive: true })

  // Create all template files
  for (const file of template.files) {
    const filePath = path.join(projectPath, file.path)
    const fileDir = path.dirname(filePath)

    // Ensure directory exists
    await fs.mkdir(fileDir, { recursive: true })

    // Substitute variables in file content
    const processedContent = file.template !== false
      ? substituteTemplateVariables(file.content, options)
      : file.content

    // Write file
    await fs.writeFile(filePath, processedContent)
  }

  // Create package.json with dynamic dependencies
  const packageJsonPath = path.join(projectPath, 'package.json')
  try {
    const existingPackageJson = await fs.readFile(packageJsonPath, 'utf8')
    const packageData = JSON.parse(existingPackageJson)

    // Update with template data
    if (template.dependencies.length > 0) {
      packageData.dependencies = packageData.dependencies || {}
      template.dependencies.forEach(dep => {
        const [name, version] = dep.includes('@') && !dep.startsWith('@')
          ? dep.split('@')
          : [dep, 'latest']
        packageData.dependencies[name] = version
      })
    }

    if (template.devDependencies.length > 0) {
      packageData.devDependencies = packageData.devDependencies || {}
      template.devDependencies.forEach(dep => {
        const [name, version] = dep.includes('@') && !dep.startsWith('@')
          ? dep.split('@')
          : [dep, 'latest']
        packageData.devDependencies[name] = version
      })
    }

    if (Object.keys(template.scripts).length > 0) {
      packageData.scripts = { ...packageData.scripts, ...template.scripts }
    }

    // Apply template variables to package.json
    const finalPackageJson = substituteTemplateVariables(
      JSON.stringify(packageData, null, 2),
      options
    )

    await fs.writeFile(packageJsonPath, finalPackageJson)
  } catch {
    // If package.json doesn't exist or is invalid, create a basic one
    const basicPackageJson = {
      name: options.projectName,
      version: options.version || '0.1.0',
      description: options.description || '',
      author: options.author || '',
      license: options.license || 'MIT',
      private: true,
      scripts: template.scripts,
      dependencies: {},
      devDependencies: {}
    }

    // Add dependencies
    template.dependencies.forEach(dep => {
      const [name, version] = dep.includes('@') && !dep.startsWith('@')
        ? dep.split('@')
        : [dep, 'latest']
      basicPackageJson.dependencies[name] = version
    })

    template.devDependencies.forEach(dep => {
      const [name, version] = dep.includes('@') && !dep.startsWith('@')
        ? dep.split('@')
        : [dep, 'latest']
      basicPackageJson.devDependencies[name] = version
    })

    const finalPackageJson = substituteTemplateVariables(
      JSON.stringify(basicPackageJson, null, 2),
      options
    )

    await fs.writeFile(packageJsonPath, finalPackageJson)
  }
}

/**
 * Validate template structure
 */
export function validateTemplate(template: Partial<ProjectTemplate>): string[] {
  const errors: string[] = []

  if (!template.id) errors.push('Template ID is required')
  if (!template.name) errors.push('Template name is required')
  if (!template.category) errors.push('Template category is required')
  if (!template.files || template.files.length === 0) {
    errors.push('Template must include at least one file')
  }

  // Validate file paths
  if (template.files) {
    template.files.forEach((file, index) => {
      if (!file.path) errors.push(`File ${index} is missing path`)
      if (file.path && file.path.includes('..')) {
        errors.push(`File ${index} path contains invalid characters`)
      }
    })
  }

  return errors
}

/**
 * Generate project structure preview
 */
export function generateProjectPreview(
  template: ProjectTemplate,
  options: ScaffoldingOptions
): { path: string; type: 'file' | 'directory'; preview?: string }[] {
  const structure: { path: string; type: 'file' | 'directory'; preview?: string }[] = []
  const directories = new Set<string>()

  // Add all file paths and their directories
  template.files.forEach(file => {
    const filePath = file.path
    const parts = filePath.split('/')

    // Add all parent directories
    for (let i = 1; i < parts.length; i++) {
      const dirPath = parts.slice(0, i).join('/')
      if (dirPath && !directories.has(dirPath)) {
        directories.add(dirPath)
        structure.push({ path: dirPath, type: 'directory' })
      }
    }

    // Add the file
    const preview = file.template !== false
      ? substituteTemplateVariables(file.content, options).substring(0, 200)
      : file.content.substring(0, 200)

    structure.push({
      path: filePath,
      type: 'file',
      preview: preview + (file.content.length > 200 ? '...' : '')
    })
  })

  return structure.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
    return a.path.localeCompare(b.path)
  })
}

/**
 * Get available template variables for a template
 */
export function getTemplateVariables(template: ProjectTemplate): string[] {
  const variables = new Set<string>()
  const variableRegex = /{{(\w+)}}/g

  template.files.forEach(file => {
    if (file.template !== false) {
      let match
      while ((match = variableRegex.exec(file.content)) !== null) {
        variables.add(match[1])
      }
    }
  })

  return Array.from(variables).sort()
}
