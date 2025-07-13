import { NextResponse } from 'next/server'
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

export interface Project {
  id: string
  name: string
  type: string
  language: string
  framework: string
  status: 'active' | 'maintenance' | 'archived'
  lastModified: Date
  size: string
  description: string
}

function detectProjectLanguage(projectPath: string): string {
  try {
    const packageJsonPath = join(projectPath, 'package.json')
    if (existsSync(packageJsonPath)) {
      return 'TypeScript/JavaScript'
    }

    // Quick file existence check without reading directory
    if (existsSync(join(projectPath, 'pyproject.toml')) || existsSync(join(projectPath, 'requirements.txt'))) return 'Python'
    if (existsSync(join(projectPath, 'Cargo.toml'))) return 'Rust'
    if (existsSync(join(projectPath, 'go.mod'))) return 'Go'
    if (existsSync(join(projectPath, 'pom.xml'))) return 'Java'
    if (existsSync(join(projectPath, '*.csproj'))) return 'C#'

    return 'Unknown'
  } catch {
    return 'Unknown'
  }
}

function detectProjectFramework(projectPath: string): string {
  try {
    const packageJsonPath = join(projectPath, 'package.json')
    if (existsSync(packageJsonPath)) {
      // Read only the first 2KB of package.json for faster parsing
      const content = readFileSync(packageJsonPath, 'utf8').substring(0, 2048)

      if (content.includes('"next"')) return 'Next.js'
      if (content.includes('"react"')) return 'React'
      if (content.includes('"vue"')) return 'Vue.js'
      if (content.includes('"angular"') || content.includes('"@angular/core"')) return 'Angular'
      if (content.includes('"express"')) return 'Express.js'
      if (content.includes('"fastify"')) return 'Fastify'
      if (content.includes('"nuxt"')) return 'Nuxt.js'
    }

    return 'Custom'
  } catch {
    return 'Custom'
  }
}

function detectProjectType(projectPath: string, projectName: string): string {
  try {
    const packageJsonPath = join(projectPath, 'package.json')
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

      if (packageJson.main || packageJson.bin) return 'Application'
      if (packageJson.name?.includes('config')) return 'Configuration'
      if (packageJson.name?.includes('types')) return 'Type Definitions'
      if (projectName.includes('shared') || projectName.includes('common')) return 'Shared Library'
    }

    if (projectName.startsWith('app') || projectName.endsWith('ai')) return 'Application'
    if (projectName.includes('service')) return 'Microservice'
    if (projectName.includes('lib') || projectName.includes('util')) return 'Library'
    if (projectName.includes('test')) return 'Testing'

    return 'Module'
  } catch {
    return 'Module'
  }
}

function getProjectSize(projectPath: string): string {
  try {
    const stats = statSync(projectPath)
    if (stats.isDirectory()) {
      // Don't use recursive scan - just count direct files
      const files = readdirSync(projectPath)
      const fileCount = files.length
      if (fileCount > 50) return 'Large'
      if (fileCount > 10) return 'Medium'
      return 'Small'
    }
    return 'Unknown'
  } catch {
    return 'Unknown'
  }
}

function getProjectStatus(projectPath: string, lastModified: Date): 'active' | 'maintenance' | 'archived' {
  const daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24)

  // Simple time-based status for performance
  if (daysSinceModified < 7) return 'active'
  if (daysSinceModified < 30) return 'maintenance'
  return 'archived'
}

function getProjectDescription(projectPath: string, projectName: string): string {
  try {
    const packageJsonPath = join(projectPath, 'package.json')
    if (existsSync(packageJsonPath)) {
      // Read only the first 1KB to get description quickly
      const content = readFileSync(packageJsonPath, 'utf8').substring(0, 1024)
      const descMatch = content.match(/"description":\s*"([^"]+)"/)
      if (descMatch) {
        return descMatch[1]
      }
    }

    // Generate description based on name patterns (cached common patterns)
    if (projectName.includes('ai')) {
      const aiType = projectName.replace('ai', '').replace(/[^a-zA-Z]/g, '')
      return `AI-powered ${aiType} platform with intelligent automation`
    }
    if (projectName.includes('config')) return 'Configuration and setup utilities'
    if (projectName.includes('shared')) return 'Shared components and utilities'
    if (projectName.includes('types')) return 'TypeScript type definitions'
    if (projectName.includes('lib')) return 'Core library and utilities'

    return `${projectName} module for the CODAI ecosystem`
  } catch {
    return `${projectName} module for the CODAI ecosystem`
  }
}

export async function GET() {
  try {
    // Get the workspace root by going up from the current directory
    let workspaceRoot = process.cwd()

    // If we're in apps/codai, go up two levels to the workspace root
    if (workspaceRoot.includes('apps')) {
      workspaceRoot = join(workspaceRoot, '..', '..')
    }

    console.log('Workspace root:', workspaceRoot)

    const appsDir = join(workspaceRoot, 'apps')
    const packagesDir = join(workspaceRoot, 'packages')

    console.log('Apps dir:', appsDir, 'exists:', existsSync(appsDir))
    console.log('Packages dir:', packagesDir, 'exists:', existsSync(packagesDir))

    const projects: Project[] = []

    // Scan apps directory with filtering
    if (existsSync(appsDir)) {
      const appDirs = readdirSync(appsDir)
      for (const appName of appDirs) {
        // Skip node_modules and hidden directories
        if (appName.startsWith('.') || appName === 'node_modules') continue

        const appPath = join(appsDir, appName)
        try {
          const stats = statSync(appPath)

          if (stats.isDirectory()) {
            projects.push({
              id: `app-${appName}`,
              name: appName,
              type: detectProjectType(appPath, appName),
              language: detectProjectLanguage(appPath),
              framework: detectProjectFramework(appPath),
              status: getProjectStatus(appPath, stats.mtime),
              lastModified: stats.mtime,
              size: getProjectSize(appPath),
              description: getProjectDescription(appPath, appName)
            })
          }
        } catch (error) {
          console.log(`Skipping app ${appName}: ${error}`)
        }
      }
    }

    // Scan packages directory with filtering
    if (existsSync(packagesDir)) {
      const packageDirs = readdirSync(packagesDir)
      for (const packageName of packageDirs) {
        // Skip node_modules and hidden directories
        if (packageName.startsWith('.') || packageName === 'node_modules') continue

        const packagePath = join(packagesDir, packageName)
        try {
          const stats = statSync(packagePath)

          if (stats.isDirectory()) {
            projects.push({
              id: `package-${packageName}`,
              name: packageName,
              type: detectProjectType(packagePath, packageName),
              language: detectProjectLanguage(packagePath),
              framework: detectProjectFramework(packagePath),
              status: getProjectStatus(packagePath, stats.mtime),
              lastModified: stats.mtime,
              size: getProjectSize(packagePath),
              description: getProjectDescription(packagePath, packageName)
            })
          }
        } catch (error) {
          console.log(`Skipping package ${packageName}: ${error}`)
        }
      }
    }

    // Sort by last modified (most recent first)
    projects.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())

    return NextResponse.json({
      projects,
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting project data:', error)
    return NextResponse.json(
      { error: 'Failed to get project data' },
      { status: 500 }
    )
  }
}
