/**
 * Real Project Data Service
 * NO MOCK DATA - Reads actual project information from file system and workspace
 */

import { readdirSync, statSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

export interface ProjectInfo {
  id: string
  name: string
  description: string
  path: string
  type: 'app' | 'package' | 'service'
  language: string[]
  framework: string[]
  status: 'active' | 'inactive' | 'development' | 'production'
  lastModified: Date
  size: number
  dependencies: number
  port?: number
  url?: string
}

export interface EcosystemStats {
  totalProjects: number
  activeApps: number
  packages: number
  services: number
  totalDependencies: number
  codeSize: number
  lastActivity: Date
}

/**
 * Read actual workspace projects
 */
export function getWorkspaceProjects(): ProjectInfo[] {
  const projects: ProjectInfo[] = []
  const workspaceRoot = process.cwd().replace(/apps[\/\\]codai$/, '')

  try {
    // Read apps directory
    const appsDir = join(workspaceRoot, 'apps')
    if (existsSync(appsDir)) {
      const apps = readdirSync(appsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())

      for (const app of apps) {
        const appPath = join(appsDir, app.name)
        const project = analyzeProject(appPath, 'app', app.name)
        if (project) projects.push(project)
      }
    }

    // Read packages directory
    const packagesDir = join(workspaceRoot, 'packages')
    if (existsSync(packagesDir)) {
      const packages = readdirSync(packagesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())

      for (const pkg of packages) {
        const pkgPath = join(packagesDir, pkg.name)
        const project = analyzeProject(pkgPath, 'package', pkg.name)
        if (project) projects.push(project)
      }
    }

    // Read services directory (if exists)
    const servicesDir = join(workspaceRoot, 'services')
    if (existsSync(servicesDir)) {
      const services = readdirSync(servicesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())

      for (const service of services) {
        const servicePath = join(servicesDir, service.name)
        const project = analyzeProject(servicePath, 'service', service.name)
        if (project) projects.push(project)
      }
    }

  } catch (error) {
    console.error('Error reading workspace projects:', error)
  }

  return projects
}

/**
 * Analyze individual project
 */
function analyzeProject(projectPath: string, type: 'app' | 'package' | 'service', name: string): ProjectInfo | null {
  try {
    const packageJsonPath = join(projectPath, 'package.json')

    if (!existsSync(packageJsonPath)) {
      return null
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    const stats = statSync(projectPath)

    // Determine languages
    const languages = detectLanguages(projectPath)

    // Determine frameworks
    const frameworks = detectFrameworks(packageJson)

    // Count dependencies
    const dependencies = Object.keys({
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies
    }).length

    // Calculate project size
    const size = calculateProjectSize(projectPath)

    // Determine status
    const status = determineProjectStatus(projectPath, packageJson)

    // Get port if it's an app
    const port = type === 'app' ? extractPort(packageJson) : undefined

    return {
      id: name,
      name: packageJson.name || name,
      description: packageJson.description || `${type.charAt(0).toUpperCase() + type.slice(1)} project`,
      path: projectPath,
      type,
      language: languages,
      framework: frameworks,
      status,
      lastModified: stats.mtime,
      size,
      dependencies,
      port,
      url: port ? `http://localhost:${port}` : undefined
    }
  } catch (error) {
    console.error(`Error analyzing project ${name}:`, error)
    return null
  }
}

/**
 * Detect programming languages in project
 */
function detectLanguages(projectPath: string): string[] {
  const languages: string[] = []

  try {
    const files = readdirSync(projectPath, { recursive: true })
    const extensions = new Set<string>()

    for (const file of files) {
      if (typeof file === 'string') {
        const ext = file.split('.').pop()?.toLowerCase()
        if (ext) extensions.add(ext)
      }
    }

    if (extensions.has('ts') || extensions.has('tsx')) languages.push('TypeScript')
    if (extensions.has('js') || extensions.has('jsx')) languages.push('JavaScript')
    if (extensions.has('py')) languages.push('Python')
    if (extensions.has('rs')) languages.push('Rust')
    if (extensions.has('go')) languages.push('Go')
    if (extensions.has('java')) languages.push('Java')
    if (extensions.has('cpp') || extensions.has('cc') || extensions.has('c')) languages.push('C++')
    if (extensions.has('css')) languages.push('CSS')
    if (extensions.has('scss') || extensions.has('sass')) languages.push('SCSS')
    if (extensions.has('html')) languages.push('HTML')
    if (extensions.has('md')) languages.push('Markdown')
    if (extensions.has('json')) languages.push('JSON')
    if (extensions.has('yaml') || extensions.has('yml')) languages.push('YAML')

  } catch (error) {
    console.error('Error detecting languages:', error)
  }

  return languages.length > 0 ? languages : ['Unknown']
}

/**
 * Detect frameworks from package.json
 */
function detectFrameworks(packageJson: any): string[] {
  const frameworks: string[] = []
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }

  if (deps.next) frameworks.push('Next.js')
  if (deps.react) frameworks.push('React')
  if (deps.vue) frameworks.push('Vue.js')
  if (deps.angular) frameworks.push('Angular')
  if (deps.express) frameworks.push('Express')
  if (deps.fastify) frameworks.push('Fastify')
  if (deps.tailwindcss) frameworks.push('Tailwind CSS')
  if (deps.typescript) frameworks.push('TypeScript')
  if (deps.vitest || deps.jest) frameworks.push('Testing')
  if (deps.prisma) frameworks.push('Prisma')
  if (deps['framer-motion']) frameworks.push('Framer Motion')
  if (deps.electron) frameworks.push('Electron')

  return frameworks
}

/**
 * Determine project status
 */
function determineProjectStatus(projectPath: string, packageJson: any): ProjectInfo['status'] {
  // Check if there's a build output
  const buildDirs = ['dist', 'build', '.next', 'out']
  const hasBuild = buildDirs.some(dir => existsSync(join(projectPath, dir)))

  // Check if it's actively developed (recent changes)
  const stats = statSync(projectPath)
  const lastModified = stats.mtime
  const daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24)

  if (daysSinceModified < 1) return 'development'
  if (hasBuild && daysSinceModified < 7) return 'active'
  if (hasBuild) return 'production'
  return 'inactive'
}

/**
 * Extract port from package.json scripts
 */
function extractPort(packageJson: any): number | undefined {
  const scripts = packageJson.scripts || {}

  for (const script of Object.values(scripts)) {
    if (typeof script === 'string') {
      const portMatch = script.match(/--port[=\s]+(\d+)/) || script.match(/-p[=\s]+(\d+)/)
      if (portMatch) {
        return parseInt(portMatch[1], 10)
      }
    }
  }

  return undefined
}

/**
 * Calculate project size (approximate)
 */
function calculateProjectSize(projectPath: string): number {
  let totalSize = 0

  try {
    const calculateDirSize = (dirPath: string): number => {
      let size = 0
      const items = readdirSync(dirPath, { withFileTypes: true })

      for (const item of items) {
        const itemPath = join(dirPath, item.name)

        if (item.isDirectory() && item.name !== 'node_modules' && !item.name.startsWith('.')) {
          size += calculateDirSize(itemPath)
        } else if (item.isFile()) {
          const stats = statSync(itemPath)
          size += stats.size
        }
      }

      return size
    }

    totalSize = calculateDirSize(projectPath)
  } catch (error) {
    console.error('Error calculating project size:', error)
  }

  return totalSize
}

/**
 * Get ecosystem statistics
 */
export function getEcosystemStats(projects: ProjectInfo[]): EcosystemStats {
  const stats: EcosystemStats = {
    totalProjects: projects.length,
    activeApps: projects.filter(p => p.type === 'app' && p.status === 'active').length,
    packages: projects.filter(p => p.type === 'package').length,
    services: projects.filter(p => p.type === 'service').length,
    totalDependencies: projects.reduce((sum, p) => sum + p.dependencies, 0),
    codeSize: projects.reduce((sum, p) => sum + p.size, 0),
    lastActivity: projects.reduce((latest, p) =>
      p.lastModified > latest ? p.lastModified : latest,
      new Date(0)
    )
  }

  return stats
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${Math.round(size * 10) / 10} ${units[unitIndex]}`
}
