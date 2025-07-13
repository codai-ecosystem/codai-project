// AIDE Server - Backend API for autonomous development orchestration
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import * as express from 'express'
import * as cors from 'cors'
import { promises as fs } from 'fs'
import * as path from 'path'
import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import { EnhancedAgentNetwork, ProjectContext } from './enhanced-agents'

const execAsync = promisify(exec)
const app = express.default()
const server = createServer(app)
const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Initialize Enhanced Agent Network
const agentNetwork = new EnhancedAgentNetwork()

// Middleware
app.use(cors.default())
app.use(express.default.json())
app.use(express.default.static('public'))

// Types for the AIDE system
interface Project {
  id: string
  name: string
  path: string
  type: 'web' | 'mobile' | 'api' | 'ml' | 'desktop'
  status: 'active' | 'building' | 'testing' | 'deploying' | 'done' | 'error'
  lastModified: string
  aiAgents: string[]
  gitBranch: string
  packageManager: 'npm' | 'pnpm' | 'yarn'
  framework: string
  buildCommand?: string
  testCommand?: string
  devCommand?: string
  port?: number
  technologies: string[]
  description?: string
}

interface AIAgent {
  id: string
  name: string
  type: 'manager' | 'coder' | 'tester' | 'deployer' | 'analyzer' | 'debugger'
  status: 'idle' | 'working' | 'waiting' | 'error' | 'busy'
  currentTask?: string
  tasksCompleted: number
  projectId?: string
  lastUpdate: string
}

interface Task {
  id: string
  type: 'build' | 'test' | 'deploy' | 'analyze' | 'debug' | 'code'
  projectId: string
  agentId: string
  command: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  output?: string
  startTime?: string
  endTime?: string
}

interface FileSystemNode {
  name: string
  type: 'file' | 'directory'
  path: string
  size?: number
  lastModified: string
  children?: FileSystemNode[]
}

// In-memory storage (will be replaced with database)
const projects = new Map<string, Project>()
const agents = new Map<string, AIAgent>()
const tasks = new Map<string, Task>()
const activePorts = new Set<number>()

// Initialize AI Agents
function initializeAIAgents() {
  const initialAgents: AIAgent[] = [
    {
      id: 'manager-001',
      name: 'Project Manager AI',
      type: 'manager',
      status: 'idle',
      tasksCompleted: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'coder-001',
      name: 'Senior Developer AI',
      type: 'coder',
      status: 'idle',
      tasksCompleted: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'tester-001',
      name: 'QA Engineer AI',
      type: 'tester',
      status: 'idle',
      tasksCompleted: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'deployer-001',
      name: 'DevOps Specialist AI',
      type: 'deployer',
      status: 'idle',
      tasksCompleted: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'analyzer-001',
      name: 'Code Analyzer AI',
      type: 'analyzer',
      status: 'idle',
      tasksCompleted: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'debugger-001',
      name: 'Debug Assistant AI',
      type: 'debugger',
      status: 'idle',
      tasksCompleted: 0,
      lastUpdate: new Date().toISOString()
    }
  ]

  initialAgents.forEach(agent => agents.set(agent.id, agent))
  console.log('🤖 AI Agents initialized:', agents.size)
}

// Workspace scanning and project detection
async function scanWorkspace(workspacePath: string): Promise<Project[]> {
  try {
    const projects: Project[] = []
    const appsPath = path.join(workspacePath, 'apps')

    const appDirs = await fs.readdir(appsPath, { withFileTypes: true })

    for (const dir of appDirs) {
      if (dir.isDirectory()) {
        const projectPath = path.join(appsPath, dir.name)
        const packageJsonPath = path.join(projectPath, 'package.json')

        try {
          const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8')
          const packageJson = JSON.parse(packageJsonContent)

          const project: Project = {
            id: dir.name,
            name: packageJson.name || dir.name,
            path: projectPath,
            type: detectProjectType(packageJson),
            status: await getProjectStatus(projectPath),
            lastModified: new Date().toISOString(),
            aiAgents: [],
            gitBranch: await getGitBranch(projectPath),
            packageManager: detectPackageManager(packageJson),
            framework: detectFramework(packageJson),
            buildCommand: packageJson.scripts?.build,
            testCommand: packageJson.scripts?.test,
            devCommand: packageJson.scripts?.dev,
            port: extractPortFromDevScript(packageJson.scripts?.dev),
            technologies: detectTechnologies(packageJson),
            description: packageJson.description
          }

          projects.push(project)
        } catch (error: any) {
          console.warn(`Failed to process project ${dir.name}:`, error.message)
        }
      }
    }

    return projects
  } catch (error) {
    console.error('Failed to scan workspace:', error)
    return []
  }
}

// Helper functions
function detectProjectType(packageJson: any): Project['type'] {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

  if (dependencies['react-native'] || dependencies['expo']) return 'mobile'
  if (dependencies['express'] || dependencies['fastify'] || dependencies['koa']) return 'api'
  if (dependencies['tensorflow'] || dependencies['pytorch'] || dependencies['@tensorflow/tfjs']) return 'ml'
  if (dependencies['electron']) return 'desktop'
  return 'web'
}

function detectPackageManager(packageJson: any): 'npm' | 'pnpm' | 'yarn' {
  if (packageJson.packageManager?.includes('pnpm')) return 'pnpm'
  if (packageJson.packageManager?.includes('yarn')) return 'yarn'
  return 'npm'
}

function detectFramework(packageJson: any): string {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

  if (dependencies['next']) return 'Next.js'
  if (dependencies['react']) return 'React'
  if (dependencies['vue']) return 'Vue.js'
  if (dependencies['angular']) return 'Angular'
  if (dependencies['svelte']) return 'Svelte'
  if (dependencies['express']) return 'Express.js'
  return 'Unknown'
}

function detectTechnologies(packageJson: any): string[] {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
  const technologies: string[] = []

  if (dependencies['typescript'] || dependencies['@types/node']) technologies.push('TypeScript')
  if (dependencies['tailwindcss']) technologies.push('Tailwind CSS')
  if (dependencies['jest']) technologies.push('Jest')
  if (dependencies['eslint']) technologies.push('ESLint')
  if (dependencies['prettier']) technologies.push('Prettier')
  if (dependencies['socket.io']) technologies.push('WebSocket')
  if (dependencies['prisma']) technologies.push('Prisma')
  if (dependencies['mongoose']) technologies.push('MongoDB')
  if (dependencies['redis']) technologies.push('Redis')

  return technologies
}

async function getProjectStatus(projectPath: string): Promise<Project['status']> {
  try {
    // Check if there's a running dev server
    const packageJsonPath = path.join(projectPath, 'package.json')
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
    const port = extractPortFromDevScript(packageJson.scripts?.dev)

    if (port && await isPortInUse(port)) {
      return 'active'
    }

    return 'done'
  } catch {
    return 'done'
  }
}

async function getGitBranch(projectPath: string): Promise<string> {
  try {
    const { stdout } = await execAsync('git branch --show-current', { cwd: projectPath })
    return stdout.trim() || 'main'
  } catch {
    return 'main'
  }
}

function extractPortFromDevScript(devScript?: string): number | undefined {
  if (!devScript) return undefined

  const portMatch = devScript.match(/--port\s+(\d+)/)
  return portMatch ? parseInt(portMatch[1]) : undefined
}

async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = require('net').createServer()
    server.listen(port, () => {
      server.once('close', () => resolve(false))
      server.close()
    })
    server.on('error', () => resolve(true))
  })
}

// File system operations
async function getFileTree(dirPath: string): Promise<FileSystemNode[]> {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true })
    const nodes: FileSystemNode[] = []

    for (const item of items) {
      if (item.name.startsWith('.') && !item.name.startsWith('.env')) continue
      if (item.name === 'node_modules') continue

      const itemPath = path.join(dirPath, item.name)
      const stats = await fs.stat(itemPath)

      const node: FileSystemNode = {
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        path: itemPath,
        size: item.isFile() ? stats.size : undefined,
        lastModified: stats.mtime.toISOString()
      }

      if (item.isDirectory()) {
        try {
          node.children = await getFileTree(itemPath)
        } catch {
          node.children = []
        }
      }

      nodes.push(node)
    }

    return nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'directory' ? -1 : 1
    })
  } catch (error) {
    console.error('Failed to get file tree:', error)
    return []
  }
}

// Task execution system
async function executeTask(taskId: string): Promise<void> {
  const task = tasks.get(taskId)
  if (!task) throw new Error('Task not found')

  const agent = agents.get(task.agentId)
  if (!agent) throw new Error('Agent not found')

  // Update task status
  task.status = 'running'
  task.startTime = new Date().toISOString()
  agent.status = 'working'
  agent.currentTask = `Executing: ${task.command}`

  // Broadcast status updates
  io.emit('task_update', task)
  io.emit('agent_update', agent)

  try {
    const project = projects.get(task.projectId)
    if (!project) throw new Error('Project not found')

    const { stdout, stderr } = await execAsync(task.command, {
      cwd: project.path,
      timeout: 300000 // 5 minutes timeout
    })

    task.status = 'completed'
    task.output = stdout || stderr
    task.endTime = new Date().toISOString()

    agent.status = 'idle'
    agent.currentTask = undefined
    agent.tasksCompleted += 1

    console.log(`✅ Task ${taskId} completed successfully`)

  } catch (error: any) {
    task.status = 'failed'
    task.output = error.message
    task.endTime = new Date().toISOString()

    agent.status = 'error'
    agent.currentTask = `Error: ${error.message}`

    console.error(`❌ Task ${taskId} failed:`, error.message)
  }

  // Broadcast final status
  io.emit('task_update', task)
  io.emit('agent_update', agent)
}

// API Routes
app.get('/api/projects', async (req, res) => {
  try {
    const workspacePath = process.env.WORKSPACE_PATH || 'e:\\GitHub\\codai-project'
    const scannedProjects = await scanWorkspace(workspacePath)

    // Update projects map and agent network
    scannedProjects.forEach(project => {
      projects.set(project.id, project)
      // Add project to enhanced agent network
      const projectContext: ProjectContext = {
        ...project,
        lastModified: new Date(project.lastModified)
      }
      agentNetwork.addProject(projectContext)
    })

    res.json({
      success: true,
      data: Array.from(projects.values()),
      count: projects.size
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/projects/:projectId', (req, res) => {
  const project = projects.get(req.params.projectId)
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' })
  }

  res.json({ success: true, data: project })
})

app.get('/api/projects/:projectId/files', async (req, res) => {
  try {
    const project = projects.get(req.params.projectId)
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const fileTree = await getFileTree(project.path)
    res.json({ success: true, data: fileTree })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/agents', (req, res) => {
  res.json({
    success: true,
    data: Array.from(agents.values()),
    count: agents.size
  })
})

app.post('/api/tasks', async (req, res) => {
  try {
    const { type, projectId, command, agentType } = req.body

    // Find available agent of the requested type
    const availableAgent = Array.from(agents.values()).find(
      agent => agent.type === agentType && agent.status === 'idle'
    )

    if (!availableAgent) {
      return res.status(400).json({
        success: false,
        error: `No available ${agentType} agent`
      })
    }

    const task: Task = {
      id: `task-${Date.now()}`,
      type,
      projectId,
      agentId: availableAgent.id,
      command,
      status: 'pending'
    }

    tasks.set(task.id, task)

    // Execute task asynchronously
    executeTask(task.id).catch(console.error)

    res.json({ success: true, data: task })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/tasks', (req, res) => {
  const { projectId } = req.query
  let taskList = Array.from(tasks.values())

  if (projectId) {
    taskList = taskList.filter(task => task.projectId === projectId)
  }

  res.json({
    success: true,
    data: taskList,
    count: taskList.length
  })
})

// Enhanced Agent Endpoints
app.get('/api/enhanced-agents/metrics', (req, res) => {
  try {
    const metrics = agentNetwork.getAgentMetrics()
    res.json({
      success: true,
      data: metrics
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/enhanced-agents/health', (req, res) => {
  try {
    const health = agentNetwork.getSystemHealth()
    res.json({
      success: true,
      data: health
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/enhanced-agents/execute', async (req, res) => {
  try {
    const { task, projectId } = req.body

    if (!task || !projectId) {
      return res.status(400).json({
        success: false,
        error: 'Task and projectId are required'
      })
    }

    const result = await agentNetwork.executeTask(task, projectId)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// WebSocket connections
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id)

  // Send initial data
  socket.emit('projects', Array.from(projects.values()))
  socket.emit('agents', Array.from(agents.values()))
  socket.emit('tasks', Array.from(tasks.values()))

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id)
  })

  socket.on('execute_command', async (data) => {
    try {
      const { command, projectId, agentType = 'coder' } = data

      // Create and execute task
      const availableAgent = Array.from(agents.values()).find(
        agent => agent.type === agentType && agent.status === 'idle'
      )

      if (!availableAgent) {
        socket.emit('error', { message: `No available ${agentType} agent` })
        return
      }

      const task: Task = {
        id: `task-${Date.now()}`,
        type: 'code',
        projectId,
        agentId: availableAgent.id,
        command,
        status: 'pending'
      }

      tasks.set(task.id, task)
      executeTask(task.id).catch(console.error)

      socket.emit('task_created', task)
    } catch (error: any) {
      socket.emit('error', { message: error.message })
    }
  })
})

// Initialize and start server
async function startServer() {
  try {
    initializeAIAgents()

    const PORT = process.env.PORT || 4043
    server.listen(PORT, () => {
      console.log(`🚀 AIDE Server running on port ${PORT}`)
      console.log(`📊 Dashboard: http://localhost:${PORT}`)
      console.log(`🤖 AI Agents: ${agents.size} initialized`)
      console.log(`🎯 Ready for autonomous development tasks`)
    })
  } catch (error) {
    console.error('Failed to start AIDE server:', error)
    process.exit(1)
  }
}

startServer()

export { app, io, projects, agents, tasks }
