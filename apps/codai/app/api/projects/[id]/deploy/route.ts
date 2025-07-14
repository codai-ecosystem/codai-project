import { NextRequest, NextResponse } from 'next/server'
import { spawn, ChildProcess } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { promises as fs } from 'fs'

interface DeploymentTask {
  id: string
  projectId: string
  provider: string
  environment: string
  branch?: string
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'cancelled'
  startTime?: Date
  endTime?: Date
  output: string[]
  deploymentUrl?: string
  buildId?: string
  process?: ChildProcess
  config?: Record<string, any>
}

interface DeploymentProvider {
  name: string
  displayName: string
  supportedFrameworks: string[]
  requiredConfig: string[]
  defaultCommands: {
    build?: string
    deploy: string
  }
}

// Supported deployment providers
const DEPLOYMENT_PROVIDERS: Record<string, DeploymentProvider> = {
  vercel: {
    name: 'vercel',
    displayName: 'Vercel',
    supportedFrameworks: ['next', 'react', 'vue', 'nuxt', 'svelte'],
    requiredConfig: ['projectName'],
    defaultCommands: {
      build: 'npm run build',
      deploy: 'vercel --prod'
    }
  },
  netlify: {
    name: 'netlify',
    displayName: 'Netlify',
    supportedFrameworks: ['react', 'vue', 'angular', 'gatsby', 'hugo'],
    requiredConfig: ['siteName'],
    defaultCommands: {
      build: 'npm run build',
      deploy: 'netlify deploy --prod'
    }
  },
  firebase: {
    name: 'firebase',
    displayName: 'Firebase Hosting',
    supportedFrameworks: ['react', 'vue', 'angular'],
    requiredConfig: ['projectId'],
    defaultCommands: {
      build: 'npm run build',
      deploy: 'firebase deploy'
    }
  },
  aws: {
    name: 'aws',
    displayName: 'AWS S3 + CloudFront',
    supportedFrameworks: ['react', 'vue', 'angular'],
    requiredConfig: ['bucketName', 'region'],
    defaultCommands: {
      build: 'npm run build',
      deploy: 'aws s3 sync ./dist s3://${bucketName} --delete'
    }
  },
  docker: {
    name: 'docker',
    displayName: 'Docker Container',
    supportedFrameworks: ['next', 'express', 'fastify', 'nest'],
    requiredConfig: ['imageName', 'registry'],
    defaultCommands: {
      deploy: 'docker build -t ${imageName} . && docker push ${registry}/${imageName}'
    }
  }
}

// In-memory deployment tasks storage (in production, use Redis or database)
const deploymentTasks = new Map<string, DeploymentTask>()

// Helper function to get workspace root
function getWorkspaceRoot(): string {
  let workspaceRoot = process.cwd()
  if (workspaceRoot.includes('apps')) {
    workspaceRoot = join(workspaceRoot, '..', '..')
  }
  return workspaceRoot
}

// Helper function to get project path
function getProjectPath(projectId: string): string {
  const [type, projectName] = projectId.split('-', 2)
  const workspaceRoot = getWorkspaceRoot()
  const projectDir = type === 'app' ? join(workspaceRoot, 'apps') : join(workspaceRoot, 'packages')
  return join(projectDir, projectName)
}

// Helper function to detect project framework
async function detectProjectFramework(projectPath: string): Promise<string | null> {
  try {
    const packageJsonPath = join(projectPath, 'package.json')
    if (!existsSync(packageJsonPath)) return null

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

    // Check for frameworks in order of specificity
    if (dependencies.next) return 'next'
    if (dependencies.nuxt) return 'nuxt'
    if (dependencies.gatsby) return 'gatsby'
    if (dependencies.react) return 'react'
    if (dependencies.vue) return 'vue'
    if (dependencies['@angular/core']) return 'angular'
    if (dependencies.svelte) return 'svelte'
    if (dependencies.express) return 'express'
    if (dependencies.fastify) return 'fastify'
    if (dependencies['@nestjs/core']) return 'nest'

    return null
  } catch (error) {
    console.error('Error detecting framework:', error)
    return null
  }
}

// Helper function to validate deployment configuration
function validateDeploymentConfig(provider: string, config: Record<string, any>): string[] {
  const providerInfo = DEPLOYMENT_PROVIDERS[provider]
  if (!providerInfo) return ['Invalid deployment provider']

  const errors: string[] = []

  for (const required of providerInfo.requiredConfig) {
    if (!config[required]) {
      errors.push(`Missing required configuration: ${required}`)
    }
  }

  return errors
}

// Helper function to substitute variables in commands
function substituteVariables(command: string, config: Record<string, any>): string {
  let substituted = command

  for (const [key, value] of Object.entries(config)) {
    const placeholder = `\${${key}}`
    substituted = substituted.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
  }

  return substituted
}

// Generate unique deployment ID
function generateDeploymentId(): string {
  return `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Execute deployment command with real-time output capture
async function executeDeploymentCommand(
  deploymentId: string,
  projectPath: string,
  command: string,
  environment: Record<string, string> = {}
): Promise<void> {
  const task = deploymentTasks.get(deploymentId)
  if (!task) return

  return new Promise((resolve) => {
    task.status = 'deploying'
    task.startTime = new Date()

    const [cmd, ...args] = command.split(' ')
    const childProcess = spawn(cmd, args, {
      cwd: projectPath,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...environment }
    })

    task.process = childProcess

    // Capture stdout
    childProcess.stdout?.on('data', (data) => {
      const output = data.toString()
      task.output.push(output)

      // Extract deployment URL if available
      const urlMatch = output.match(/https?:\/\/[^\s]+/)
      if (urlMatch && !task.deploymentUrl) {
        task.deploymentUrl = urlMatch[0]
      }

      // Limit output size to prevent memory issues
      if (task.output.length > 1000) {
        task.output = task.output.slice(-500) // Keep last 500 lines
      }
    })

    // Capture stderr
    childProcess.stderr?.on('data', (data) => {
      const output = `ERROR: ${data.toString()}`
      task.output.push(output)

      if (task.output.length > 1000) {
        task.output = task.output.slice(-500)
      }
    })

    // Handle process completion
    childProcess.on('close', (code) => {
      task.endTime = new Date()
      task.status = code === 0 ? 'success' : 'failed'
      task.process = undefined
      resolve()
    })

    // Handle process error
    childProcess.on('error', (error) => {
      task.endTime = new Date()
      task.output.push(`PROCESS ERROR: ${error.message}`)
      task.status = 'failed'
      task.process = undefined
      resolve()
    })
  })
}

// GET: Get deployment providers and project deployment info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const deploymentId = url.searchParams.get('deploymentId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    if (action === 'providers') {
      // Return available deployment providers
      const projectPath = getProjectPath(projectId)
      const framework = await detectProjectFramework(projectPath)

      const compatibleProviders = Object.values(DEPLOYMENT_PROVIDERS)
        .filter(provider => !framework || provider.supportedFrameworks.includes(framework))
        .map(provider => ({
          name: provider.name,
          displayName: provider.displayName,
          supportedFrameworks: provider.supportedFrameworks,
          requiredConfig: provider.requiredConfig,
          isCompatible: !framework || provider.supportedFrameworks.includes(framework)
        }))

      return NextResponse.json({
        providers: compatibleProviders,
        detectedFramework: framework
      })
    }

    if (deploymentId) {
      // Get specific deployment
      const task = deploymentTasks.get(deploymentId)
      if (!task || task.projectId !== projectId) {
        return NextResponse.json(
          { error: 'Deployment not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        deploymentId: task.id,
        projectId: task.projectId,
        provider: task.provider,
        environment: task.environment,
        branch: task.branch,
        status: task.status,
        startTime: task.startTime,
        endTime: task.endTime,
        output: task.output,
        deploymentUrl: task.deploymentUrl,
        buildId: task.buildId,
        config: task.config,
        duration: task.startTime && task.endTime
          ? task.endTime.getTime() - task.startTime.getTime()
          : task.startTime
            ? Date.now() - task.startTime.getTime()
            : 0
      })
    } else {
      // Get all deployments for project
      const projectDeployments = Array.from(deploymentTasks.values())
        .filter(task => task.projectId === projectId)
        .map(task => ({
          deploymentId: task.id,
          provider: task.provider,
          environment: task.environment,
          branch: task.branch,
          status: task.status,
          startTime: task.startTime,
          endTime: task.endTime,
          deploymentUrl: task.deploymentUrl,
          duration: task.startTime && task.endTime
            ? task.endTime.getTime() - task.startTime.getTime()
            : task.startTime
              ? Date.now() - task.startTime.getTime()
              : 0
        }))
        .sort((a, b) => {
          const aTime = a.startTime ? new Date(a.startTime).getTime() : 0
          const bTime = b.startTime ? new Date(b.startTime).getTime() : 0
          return bTime - aTime // Most recent first
        })

      return NextResponse.json({
        deployments: projectDeployments
      })
    }

  } catch (error) {
    console.error('Error getting deployment info:', error)
    return NextResponse.json(
      { error: 'Failed to get deployment info' },
      { status: 500 }
    )
  }
}

// POST: Start a deployment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const { provider, environment = 'production', branch, config = {}, buildFirst = false } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    if (!provider || typeof provider !== 'string') {
      return NextResponse.json(
        { error: 'Deployment provider is required' },
        { status: 400 }
      )
    }

    // Validate provider
    const providerInfo = DEPLOYMENT_PROVIDERS[provider]
    if (!providerInfo) {
      return NextResponse.json(
        { error: 'Invalid deployment provider' },
        { status: 400 }
      )
    }

    // Validate configuration
    const configErrors = validateDeploymentConfig(provider, config)
    if (configErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: configErrors },
        { status: 400 }
      )
    }

    // Get project path
    const projectPath = getProjectPath(projectId)

    if (!existsSync(projectPath)) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if package.json exists
    const packageJsonPath = join(projectPath, 'package.json')
    if (!existsSync(packageJsonPath)) {
      return NextResponse.json(
        { error: 'Project does not have a package.json file' },
        { status: 400 }
      )
    }

    // Generate deployment ID and create task
    const deploymentId = generateDeploymentId()
    const deploymentTask: DeploymentTask = {
      id: deploymentId,
      projectId,
      provider,
      environment,
      branch,
      config,
      status: 'pending',
      output: []
    }

    deploymentTasks.set(deploymentId, deploymentTask)

    // Start deployment execution asynchronously
    setImmediate(async () => {
      try {
        // Build first if requested
        if (buildFirst && providerInfo.defaultCommands.build) {
          deploymentTask.output.push('Building project before deployment...')
          const buildCommand = substituteVariables(providerInfo.defaultCommands.build, config)
          await executeDeploymentCommand(deploymentId, projectPath, buildCommand)

          if (deploymentTask.status === 'failed') {
            deploymentTask.output.push('Build failed, deployment cancelled')
            return
          }

          deploymentTask.output.push('Build completed successfully, starting deployment...')
        }

        // Execute deployment command
        const deployCommand = substituteVariables(providerInfo.defaultCommands.deploy, config)
        await executeDeploymentCommand(deploymentId, projectPath, deployCommand, {
          NODE_ENV: environment,
          DEPLOYMENT_ENV: environment
        })
      } catch (error) {
        deploymentTask.status = 'failed'
        deploymentTask.endTime = new Date()
        deploymentTask.output.push(`Deployment error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })

    return NextResponse.json({
      deploymentId,
      status: 'pending',
      message: 'Deployment started'
    })

  } catch (error) {
    console.error('Error starting deployment:', error)
    return NextResponse.json(
      { error: 'Failed to start deployment' },
      { status: 500 }
    )
  }
}

// DELETE: Cancel a running deployment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const url = new URL(request.url)
    const deploymentId = url.searchParams.get('deploymentId')

    if (!projectId || !deploymentId) {
      return NextResponse.json(
        { error: 'Project ID and Deployment ID are required' },
        { status: 400 }
      )
    }

    const task = deploymentTasks.get(deploymentId)
    if (!task || task.projectId !== projectId) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    if (task.status !== 'deploying') {
      return NextResponse.json(
        { error: 'Deployment is not running' },
        { status: 400 }
      )
    }

    // Kill the process
    if (task.process) {
      task.process.kill('SIGTERM')

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (task.process && !task.process.killed) {
          task.process.kill('SIGKILL')
        }
      }, 5000)
    }

    task.status = 'cancelled'
    task.endTime = new Date()
    task.output.push('Deployment cancelled by user')

    return NextResponse.json({
      message: 'Deployment cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling deployment:', error)
    return NextResponse.json(
      { error: 'Failed to cancel deployment' },
      { status: 500 }
    )
  }
}
