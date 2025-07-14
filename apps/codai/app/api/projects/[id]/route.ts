import { NextResponse } from 'next/server'
import { readFileSync, existsSync, writeFileSync, statSync } from 'fs'
import { join } from 'path'

export interface ProjectDetail {
  id: string
  name: string
  path: string
  type: string
  language: string
  framework: string
  status: 'active' | 'maintenance' | 'archived'
  description: string
  lastModified: Date
  size: string
  dependencies: string[]
  devDependencies: string[]
  scripts: Record<string, string>
  gitBranch?: string
  gitCommits?: number
  packageJson?: any
  files?: {
    name: string
    type: 'file' | 'directory'
    size: number
    lastModified: Date
  }[]
}

// Helper functions
function getWorkspaceRoot(): string {
  let workspaceRoot = process.cwd()
  if (workspaceRoot.includes('apps')) {
    workspaceRoot = join(workspaceRoot, '..', '..')
  }
  return workspaceRoot
}

async function executeCommand(command: string, cwd?: string): Promise<{ stdout: string; stderr: string }> {
  const { spawn } = require('child_process')
  return new Promise((resolve, reject) => {
    const child = spawn('cmd', ['/c', command], {
      cwd: cwd || process.cwd(),
      shell: true
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    child.on('close', (code: number) => {
      if (code === 0) {
        resolve({ stdout, stderr })
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`))
      }
    })
  })
}

async function getGitInfo(projectPath: string): Promise<{ branch?: string; commits?: number }> {
  try {
    const { stdout: branch } = await executeCommand('git rev-parse --abbrev-ref HEAD', projectPath)
    const { stdout: commits } = await executeCommand('git rev-list --count HEAD', projectPath)

    return {
      branch: branch.trim(),
      commits: parseInt(commits.trim()) || 0
    }
  } catch {
    return {}
  }
}

function getProjectFiles(projectPath: string): { name: string; type: 'file' | 'directory'; size: number; lastModified: Date }[] {
  try {
    const fs = require('fs')
    const files = fs.readdirSync(projectPath)

    return files
      .filter((file: string) => !file.startsWith('.') && file !== 'node_modules')
      .map((file: string) => {
        const filePath = join(projectPath, file)
        const stats = fs.statSync(filePath)

        return {
          name: file,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          lastModified: stats.mtime
        }
      })
      .sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name)
        }
        return a.type === 'directory' ? -1 : 1
      })
  } catch {
    return []
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Parse project ID (format: app-projectname or package-projectname)
    const [type, projectName] = projectId.split('-', 2)

    if (!type || !projectName) {
      return NextResponse.json(
        { error: 'Invalid project ID format' },
        { status: 400 }
      )
    }

    const workspaceRoot = getWorkspaceRoot()
    const projectDir = type === 'app' ? join(workspaceRoot, 'apps') : join(workspaceRoot, 'packages')
    const projectPath = join(projectDir, projectName)

    if (!existsSync(projectPath)) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get project statistics
    const stats = statSync(projectPath)

    // Get package.json information
    let packageJson: any = null
    let dependencies: string[] = []
    let devDependencies: string[] = []
    let scripts: Record<string, string> = {}

    const packageJsonPath = join(projectPath, 'package.json')
    if (existsSync(packageJsonPath)) {
      try {
        packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
        dependencies = Object.keys(packageJson?.dependencies || {})
        devDependencies = Object.keys(packageJson?.devDependencies || {})
        scripts = packageJson?.scripts || {}
      } catch (error) {
        console.log('Error reading package.json:', error)
      }
    }

    // Get Git information
    const gitInfo = await getGitInfo(projectPath)

    // Get project files
    const files = getProjectFiles(projectPath)

    // Detect project details
    const language = packageJson ? 'TypeScript/JavaScript' : 'Unknown'
    let framework = 'Custom'

    if (packageJson) {
      if (packageJson?.dependencies?.['next']) framework = 'Next.js'
      else if (packageJson?.dependencies?.['react']) framework = 'React'
      else if (packageJson?.dependencies?.['express']) framework = 'Express.js'
      else if (packageJson?.dependencies?.['vue']) framework = 'Vue.js'
    }

    const projectDetail: ProjectDetail = {
      id: projectId,
      name: projectName,
      path: projectPath,
      type: type === 'app' ? 'Application' : 'Package',
      language,
      framework,
      status: 'active', // Could be determined by last modified date
      description: packageJson?.description || `${projectName} ${type}`,
      lastModified: stats.mtime,
      size: files.length > 50 ? 'Large' : files.length > 10 ? 'Medium' : 'Small',
      dependencies,
      devDependencies,
      scripts,
      gitBranch: gitInfo.branch,
      gitCommits: gitInfo.commits,
      packageJson,
      files
    }

    return NextResponse.json({
      project: projectDetail
    })

  } catch (error) {
    console.error('Error getting project details:', error)
    return NextResponse.json(
      { error: 'Failed to get project details' },
      { status: 500 }
    )
  }
}

// Update project settings
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const updates = await request.json()

    const [type, projectName] = projectId.split('-', 2)
    const workspaceRoot = getWorkspaceRoot()
    const projectDir = type === 'app' ? join(workspaceRoot, 'apps') : join(workspaceRoot, 'packages')
    const projectPath = join(projectDir, projectName)

    if (!existsSync(projectPath)) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const packageJsonPath = join(projectPath, 'package.json')

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

      // Update fields
      if (updates.description) packageJson.description = updates.description
      if (updates.version) packageJson.version = updates.version
      if (updates.scripts) packageJson.scripts = { ...packageJson.scripts, ...updates.scripts }

      if (updates.dependencies) {
        packageJson.dependencies = packageJson.dependencies || {}
        Object.entries(updates.dependencies).forEach(([dep, version]) => {
          if (version === null) {
            delete packageJson.dependencies[dep]
          } else {
            packageJson.dependencies[dep] = version
          }
        })
      }

      if (updates.devDependencies) {
        packageJson.devDependencies = packageJson.devDependencies || {}
        Object.entries(updates.devDependencies).forEach(([dep, version]) => {
          if (version === null) {
            delete packageJson.devDependencies[dep]
          } else {
            packageJson.devDependencies[dep] = version
          }
        })
      }

      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    }

    return NextResponse.json({
      message: 'Project updated successfully'
    })

  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}
