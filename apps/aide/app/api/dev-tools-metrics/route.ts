import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// Real development tools metrics based on workspace analysis
export async function GET(request: NextRequest) {
  try {
    const workspaceRoot = process.cwd().includes('aide')
      ? join(process.cwd(), '..', '..')
      : process.cwd()

    const metrics = await calculateDevToolsMetrics(workspaceRoot)
    const tools = await getActiveDevelopmentTools(workspaceRoot)

    return NextResponse.json({
      metrics,
      tools,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error calculating dev tools metrics:', error)
    return NextResponse.json(
      { error: 'Failed to calculate development tools metrics' },
      { status: 500 }
    )
  }
}

async function calculateDevToolsMetrics(workspaceRoot: string) {
  const configFiles = scanConfigurationFiles(workspaceRoot)
  const buildTools = detectBuildTools(workspaceRoot)
  const lintingTools = detectLintingTools(workspaceRoot)
  const testingTools = detectTestingTools(workspaceRoot)
  const deploymentTools = detectDeploymentTools(workspaceRoot)

  return {
    totalConfigFiles: configFiles.length,
    buildToolsCount: buildTools.length,
    lintingToolsCount: lintingTools.length,
    testingToolsCount: testingTools.length,
    deploymentToolsCount: deploymentTools.length,
    workspaceComplexity: calculateWorkspaceComplexity(workspaceRoot),
    toolingEfficiency: calculateToolingEfficiency(configFiles, buildTools, lintingTools, testingTools),
    automationLevel: calculateAutomationLevel(workspaceRoot),
    codeQualityScore: calculateCodeQualityScore(lintingTools, testingTools),
    cicdMaturity: calculateCICDMaturity(workspaceRoot)
  }
}

function scanConfigurationFiles(workspaceRoot: string): string[] {
  const configFiles: string[] = []
  const configPatterns = [
    'package.json', 'tsconfig.json', 'next.config.js', 'tailwind.config.js',
    'eslint.config.js', '.eslintrc.*', 'prettier.config.js', '.prettierrc.*',
    'jest.config.js', 'vitest.config.ts', 'playwright.config.ts',
    'docker-compose*.yml', 'Dockerfile', 'vercel.json', '.env*',
    'pnpm-workspace.yaml', 'turbo.json'
  ]

  try {
    const scanDirectory = (dir: string, depth = 0) => {
      if (depth > 3) return // Limit depth to avoid deep scanning

      try {
        const items = readdirSync(dir)
        for (const item of items) {
          if (item.startsWith('.') && !item.startsWith('.env') && !item.startsWith('.eslint') && !item.startsWith('.prettier')) continue
          if (item === 'node_modules' || item === '.next' || item === '.turbo') continue

          const itemPath = join(dir, item)
          try {
            const stats = statSync(itemPath)

            if (stats.isFile()) {
              const matches = configPatterns.some(pattern => {
                if (pattern.includes('*')) {
                  const regex = new RegExp(pattern.replace(/\*/g, '.*'))
                  return regex.test(item)
                }
                return item === pattern
              })

              if (matches) {
                configFiles.push(itemPath.replace(workspaceRoot, '').replace(/\\/g, '/'))
              }
            } else if (stats.isDirectory() && depth < 2) {
              scanDirectory(itemPath, depth + 1)
            }
          } catch (statError) {
            // Skip files that can't be accessed
            continue
          }
        }
      } catch (readError) {
        // Skip directories that can't be read
        return
      }
    }

    scanDirectory(workspaceRoot)
  } catch (error) {
    console.error('Error scanning config files:', error)
  }

  return configFiles
}

function detectBuildTools(workspaceRoot: string): string[] {
  const tools: string[] = []
  const packageJsonPath = join(workspaceRoot, 'package.json')

  try {
    if (statSync(packageJsonPath).isFile()) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

      if (deps['next']) tools.push('Next.js')
      if (deps['vite']) tools.push('Vite')
      if (deps['webpack']) tools.push('Webpack')
      if (deps['turbo']) tools.push('Turbo')
      if (deps['rollup']) tools.push('Rollup')
      if (deps['esbuild']) tools.push('ESBuild')
      if (deps['typescript']) tools.push('TypeScript')
      if (deps['babel'] || deps['@babel/core']) tools.push('Babel')
    }
  } catch (error) {
    // Handle missing or invalid package.json
  }

  // Check for additional build tools
  try {
    if (statSync(join(workspaceRoot, 'turbo.json')).isFile()) tools.push('Turbo Monorepo')
  } catch { }

  try {
    if (statSync(join(workspaceRoot, 'pnpm-workspace.yaml')).isFile()) tools.push('PNPM Workspaces')
  } catch { }

  return [...new Set(tools)]
}

function detectLintingTools(workspaceRoot: string): string[] {
  const tools: string[] = []
  const packageJsonPath = join(workspaceRoot, 'package.json')

  try {
    if (statSync(packageJsonPath).isFile()) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

      if (deps['eslint']) tools.push('ESLint')
      if (deps['prettier']) tools.push('Prettier')
      if (deps['stylelint']) tools.push('Stylelint')
      if (deps['tslint']) tools.push('TSLint')
      if (deps['@typescript-eslint/parser']) tools.push('TypeScript ESLint')
    }
  } catch (error) {
    // Handle missing or invalid package.json
  }

  // Check for config files
  const lintConfigs = [
    'eslint.config.js', '.eslintrc.js', '.eslintrc.json',
    'prettier.config.js', '.prettierrc', '.prettierrc.json'
  ]

  for (const config of lintConfigs) {
    try {
      if (statSync(join(workspaceRoot, config)).isFile()) {
        if (config.includes('eslint')) tools.push('ESLint Config')
        if (config.includes('prettier')) tools.push('Prettier Config')
      }
    } catch { }
  }

  return [...new Set(tools)]
}

function detectTestingTools(workspaceRoot: string): string[] {
  const tools: string[] = []
  const packageJsonPath = join(workspaceRoot, 'package.json')

  try {
    if (statSync(packageJsonPath).isFile()) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

      if (deps['jest']) tools.push('Jest')
      if (deps['vitest']) tools.push('Vitest')
      if (deps['@playwright/test']) tools.push('Playwright')
      if (deps['cypress']) tools.push('Cypress')
      if (deps['@testing-library/react']) tools.push('React Testing Library')
      if (deps['@testing-library/jest-dom']) tools.push('Jest DOM')
    }
  } catch (error) {
    // Handle missing or invalid package.json
  }

  // Check for test config files
  const testConfigs = [
    'jest.config.js', 'vitest.config.ts', 'playwright.config.ts', 'cypress.config.js'
  ]

  for (const config of testConfigs) {
    try {
      if (statSync(join(workspaceRoot, config)).isFile()) {
        if (config.includes('jest')) tools.push('Jest Config')
        if (config.includes('vitest')) tools.push('Vitest Config')
        if (config.includes('playwright')) tools.push('Playwright Config')
        if (config.includes('cypress')) tools.push('Cypress Config')
      }
    } catch { }
  }

  return [...new Set(tools)]
}

function detectDeploymentTools(workspaceRoot: string): string[] {
  const tools: string[] = []

  try {
    if (statSync(join(workspaceRoot, 'Dockerfile')).isFile()) tools.push('Docker')
  } catch { }

  try {
    if (statSync(join(workspaceRoot, 'docker-compose.yml')).isFile()) tools.push('Docker Compose')
  } catch { }

  try {
    if (statSync(join(workspaceRoot, 'vercel.json')).isFile()) tools.push('Vercel')
  } catch { }

  try {
    if (statSync(join(workspaceRoot, '.github')).isDirectory()) tools.push('GitHub Actions')
  } catch { }

  try {
    const k8sFiles = readdirSync(workspaceRoot).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
    if (k8sFiles.some(file => file.includes('kubernetes') || file.includes('k8s'))) {
      tools.push('Kubernetes')
    }
  } catch { }

  return [...new Set(tools)]
}

function calculateWorkspaceComplexity(workspaceRoot: string): number {
  try {
    const appsCount = readdirSync(join(workspaceRoot, 'apps')).length
    const packagesCount = readdirSync(join(workspaceRoot, 'packages')).length

    // Complexity score based on number of projects and packages
    const baseComplexity = appsCount + packagesCount
    const normalizedComplexity = Math.min(100, Math.round((baseComplexity / 50) * 100))

    return normalizedComplexity
  } catch {
    return 25 // Default moderate complexity
  }
}

function calculateToolingEfficiency(
  configFiles: string[],
  buildTools: string[],
  lintingTools: string[],
  testingTools: string[]
): number {
  // Calculate efficiency based on tool coverage
  const totalTools = buildTools.length + lintingTools.length + testingTools.length
  const configCoverage = configFiles.length

  // Ideal tool count for good coverage
  const idealToolCount = 8
  const idealConfigCount = 12

  const toolScore = Math.min(100, (totalTools / idealToolCount) * 100)
  const configScore = Math.min(100, (configCoverage / idealConfigCount) * 100)

  return Math.round((toolScore + configScore) / 2)
}

function calculateAutomationLevel(workspaceRoot: string): number {
  let automationScore = 0

  // Check for automation indicators
  try {
    const packageJson = JSON.parse(readFileSync(join(workspaceRoot, 'package.json'), 'utf8'))
    const scripts = packageJson.scripts || {}

    if (scripts.build) automationScore += 15
    if (scripts.test) automationScore += 15
    if (scripts.lint) automationScore += 10
    if (scripts.dev || scripts.start) automationScore += 10
    if (scripts['type-check']) automationScore += 10

    // Check for CI/CD files
    if (statSync(join(workspaceRoot, '.github/workflows')).isDirectory()) automationScore += 20
  } catch { }

  try {
    if (statSync(join(workspaceRoot, 'turbo.json')).isFile()) automationScore += 10
  } catch { }

  try {
    if (statSync(join(workspaceRoot, 'docker-compose.yml')).isFile()) automationScore += 10
  } catch { }

  return Math.min(100, automationScore)
}

function calculateCodeQualityScore(lintingTools: string[], testingTools: string[]): number {
  let qualityScore = 0

  // Linting tools contribution
  if (lintingTools.includes('ESLint')) qualityScore += 25
  if (lintingTools.includes('Prettier')) qualityScore += 15
  if (lintingTools.includes('TypeScript ESLint')) qualityScore += 10

  // Testing tools contribution
  if (testingTools.includes('Jest') || testingTools.includes('Vitest')) qualityScore += 25
  if (testingTools.includes('Playwright')) qualityScore += 15
  if (testingTools.includes('React Testing Library')) qualityScore += 10

  return Math.min(100, qualityScore)
}

function calculateCICDMaturity(workspaceRoot: string): number {
  let maturityScore = 0

  try {
    // Check for GitHub Actions
    if (statSync(join(workspaceRoot, '.github/workflows')).isDirectory()) {
      maturityScore += 40
    }
  } catch { }

  try {
    // Check for Docker
    if (statSync(join(workspaceRoot, 'Dockerfile')).isFile()) {
      maturityScore += 20
    }
  } catch { }

  try {
    // Check for automated testing
    const packageJson = JSON.parse(readFileSync(join(workspaceRoot, 'package.json'), 'utf8'))
    if (packageJson.scripts?.test) maturityScore += 20
    if (packageJson.scripts?.build) maturityScore += 20
  } catch { }

  return Math.min(100, maturityScore)
}

async function getActiveDevelopmentTools(workspaceRoot: string) {
  const buildTools = detectBuildTools(workspaceRoot)
  const lintingTools = detectLintingTools(workspaceRoot)
  const testingTools = detectTestingTools(workspaceRoot)
  const deploymentTools = detectDeploymentTools(workspaceRoot)

  return [
    {
      id: 'build-tools',
      name: 'Build Tools',
      type: 'build',
      tools: buildTools,
      count: buildTools.length,
      status: buildTools.length > 0 ? 'active' : 'inactive',
      efficiency: buildTools.length > 0 ? 90 : 0
    },
    {
      id: 'linting-tools',
      name: 'Code Quality',
      type: 'quality',
      tools: lintingTools,
      count: lintingTools.length,
      status: lintingTools.length > 0 ? 'active' : 'inactive',
      efficiency: lintingTools.length > 1 ? 85 : lintingTools.length > 0 ? 60 : 0
    },
    {
      id: 'testing-tools',
      name: 'Testing Suite',
      type: 'testing',
      tools: testingTools,
      count: testingTools.length,
      status: testingTools.length > 0 ? 'active' : 'inactive',
      efficiency: testingTools.length > 2 ? 95 : testingTools.length > 0 ? 70 : 0
    },
    {
      id: 'deployment-tools',
      name: 'Deployment',
      type: 'deployment',
      tools: deploymentTools,
      count: deploymentTools.length,
      status: deploymentTools.length > 0 ? 'active' : 'inactive',
      efficiency: deploymentTools.length > 1 ? 80 : deploymentTools.length > 0 ? 50 : 0
    }
  ]
}
