// AIDE Server - Backend API for autonomous development orchestration
const { createServer } = require('http')
const { Server: SocketServer } = require('socket.io')
const express = require('express')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')
const { spawn, exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)
const app = express()
const server = createServer(app)
const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// Data stores
const projects = new Map()
const agents = new Map()
const tasks = new Map()

// Advanced orchestration (simulated in JS)
const workflows = new Map()
const agentCommunications = []

// Simulation of advanced orchestration features
class SimpleOrchestrator {
  constructor() {
    this.activeWorkflows = new Map()
    this.communications = []
  }

  async createWorkflow(context) {
    const workflowId = `workflow-${Date.now()}`
    const workflow = {
      id: workflowId,
      name: `${context.taskType.toUpperCase()} - ${context.projectId}`,
      description: `Autonomous workflow for ${context.taskType}`,
      projectId: context.projectId,
      status: 'planning',
      createdAt: new Date().toISOString(),
      steps: this.generateSteps(context.taskType),
      participants: this.assignAgents(context.taskType),
      metrics: { efficiency: 0, quality: 0, collaboration: 0, innovation: 0 }
    }

    this.activeWorkflows.set(workflowId, workflow)

    // Start workflow execution
    setTimeout(() => this.executeWorkflow(workflowId), 2000)

    return workflowId
  }

  generateSteps(taskType) {
    const stepTemplates = {
      'feature_development': [
        { name: 'Requirements Analysis', duration: 30 },
        { name: 'Architecture Design', duration: 45 },
        { name: 'Implementation', duration: 120 },
        { name: 'Testing', duration: 60 },
        { name: 'Code Review', duration: 30 }
      ],
      'bug_fix': [
        { name: 'Bug Reproduction', duration: 20 },
        { name: 'Root Cause Analysis', duration: 40 },
        { name: 'Fix Implementation', duration: 60 },
        { name: 'Testing', duration: 30 }
      ]
    }

    const template = stepTemplates[taskType] || stepTemplates['feature_development']
    return template.map((step, index) => ({
      id: `step-${index + 1}`,
      name: step.name,
      description: `Execute ${step.name.toLowerCase()}`,
      assignedAgent: 'ai-agent-' + (index % 3 + 1),
      estimatedDuration: step.duration,
      status: 'pending'
    }))
  }

  assignAgents(taskType) {
    return [
      {
        agentId: 'senior-developer-agent',
        role: 'lead',
        expertise: ['react', 'typescript'],
        availability: 85,
        currentWorkload: 60
      },
      {
        agentId: 'qa-testing-agent',
        role: 'contributor',
        expertise: ['testing', 'quality-assurance'],
        availability: 75,
        currentWorkload: 65
      }
    ]
  }

  async executeWorkflow(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId)
    if (!workflow) return

    workflow.status = 'executing'

    for (const step of workflow.steps) {
      step.status = 'in_progress'

      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 1000))

      step.status = 'completed'
      step.output = { result: `${step.name} completed successfully` }
    }

    workflow.status = 'completed'
    workflow.completedAt = new Date().toISOString()
    workflow.metrics = {
      efficiency: 80 + Math.random() * 15,
      quality: 85 + Math.random() * 10,
      collaboration: 90 + Math.random() * 10,
      innovation: 70 + Math.random() * 20
    }
  }

  getWorkflows() {
    return Array.from(this.activeWorkflows.values())
  }

  getMetrics() {
    const workflows = this.getWorkflows()
    const completed = workflows.filter(w => w.status === 'completed')

    return {
      totalWorkflows: workflows.length,
      completedWorkflows: completed.length,
      activeWorkflows: workflows.filter(w => w.status === 'executing').length,
      averageEfficiency: completed.length > 0
        ? completed.reduce((sum, w) => sum + w.metrics.efficiency, 0) / completed.length
        : 0,
      averageQuality: completed.length > 0
        ? completed.reduce((sum, w) => sum + w.metrics.quality, 0) / completed.length
        : 0,
      communicationVolume: this.communications.length,
      collaborationScore: completed.length > 0
        ? completed.reduce((sum, w) => sum + w.metrics.collaboration, 0) / completed.length
        : 0
    }
  }
}

const orchestrator = new SimpleOrchestrator()

// Types for the AIDE system (JSDoc for better IDE support)
/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} path
 * @property {'web'|'mobile'|'api'|'ml'|'desktop'} type
 * @property {'active'|'building'|'testing'|'deploying'|'done'|'error'} status
 * @property {string} lastModified
 * @property {string[]} aiAgents
 * @property {string} gitBranch
 * @property {'npm'|'pnpm'|'yarn'} packageManager
 * @property {string} framework
 * @property {string} [buildCommand]
 * @property {string} [testCommand]
 * @property {string} [devCommand]
 * @property {number} [port]
 * @property {string[]} technologies
 * @property {string} [description]
 */

/**
 * @typedef {Object} Agent
 * @property {string} id
 * @property {string} name
 * @property {'coder'|'tester'|'deployer'|'analyzer'} type
 * @property {'idle'|'busy'|'error'} status
 * @property {string} currentProject
 * @property {number} tasksCompleted
 * @property {number} successRate
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {'code'|'test'|'deploy'|'analyze'} type
 * @property {string} projectId
 * @property {string} agentId
 * @property {string} command
 * @property {'pending'|'running'|'completed'|'failed'} status
 * @property {string} [output]
 * @property {number} [startTime]
 * @property {number} [endTime]
 */

// Initialize AI Agents
function initializeAgents() {
  const agentTypes = [
    { id: 'coder-1', name: 'Senior Coder', type: 'coder' },
    { id: 'tester-1', name: 'QA Tester', type: 'tester' },
    { id: 'deployer-1', name: 'DevOps Engineer', type: 'deployer' },
    { id: 'analyzer-1', name: 'Code Analyzer', type: 'analyzer' },
    { id: 'coder-2', name: 'Junior Coder', type: 'coder' },
    { id: 'tester-2', name: 'Automation Tester', type: 'tester' }
  ]

  agentTypes.forEach(agentData => {
    const agent = {
      ...agentData,
      status: 'idle',
      currentProject: '',
      tasksCompleted: Math.floor(Math.random() * 50),
      successRate: 85 + Math.floor(Math.random() * 15)
    }
    agents.set(agent.id, agent)
  })
}

// Project detection functions
function detectProjectType(packageJson) {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

  if (dependencies['react-native']) return 'mobile'
  if (dependencies['electron']) return 'desktop'
  if (dependencies['express'] || dependencies['fastify']) return 'api'
  if (dependencies['tensorflow'] || dependencies['pytorch']) return 'ml'
  if (dependencies['react'] || dependencies['vue'] || dependencies['angular']) return 'web'

  return 'web' // default
}

function detectPackageManager(packageJson) {
  if (packageJson.packageManager?.includes('pnpm')) return 'pnpm'
  if (packageJson.packageManager?.includes('yarn')) return 'yarn'
  return 'npm'
}

function detectFramework(packageJson) {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

  if (dependencies['next']) return 'Next.js'
  if (dependencies['react']) return 'React'
  if (dependencies['vue']) return 'Vue.js'
  if (dependencies['angular']) return 'Angular'
  if (dependencies['svelte']) return 'Svelte'
  if (dependencies['express']) return 'Express.js'
  return 'Unknown'
}

function detectTechnologies(packageJson) {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
  const technologies = []

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

function extractPortFromDevScript(devScript) {
  if (!devScript) return undefined
  const portMatch = devScript.match(/--port[=\s]+(\d+)|:(\d+)/)
  return portMatch ? parseInt(portMatch[1] || portMatch[2]) : undefined
}

async function getProjectStatus(projectPath) {
  try {
    // Check if there's a running dev server
    const packageJsonPath = path.join(projectPath, 'package.json')
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
    const port = extractPortFromDevScript(packageJson.scripts?.dev)

    if (port) {
      try {
        // Try to connect to the port to see if server is running
        const { stdout } = await execAsync(`netstat -an | findstr :${port}`)
        if (stdout.includes('LISTENING')) {
          return 'active'
        }
      } catch { }
    }

    return 'done'
  } catch {
    return 'error'
  }
}

async function getGitBranch(projectPath) {
  try {
    const { stdout } = await execAsync('git branch --show-current', { cwd: projectPath })
    return stdout.trim() || 'main'
  } catch {
    return 'main'
  }
}

// Workspace scanning
async function scanWorkspace(workspacePath) {
  const projects = []

  try {
    const appsPath = path.join(workspacePath, 'apps')
    const appDirs = await fs.readdir(appsPath, { withFileTypes: true })

    for (const dir of appDirs.filter(d => d.isDirectory())) {
      const projectPath = path.join(appsPath, dir.name)
      const packageJsonPath = path.join(projectPath, 'package.json')

      try {
        const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8')
        const packageJson = JSON.parse(packageJsonContent)

        const project = {
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
      } catch (error) {
        console.warn(`Failed to process project ${dir.name}:`, error.message)
      }
    }
  } catch (error) {
    console.error('Failed to scan workspace:', error.message)
  }

  return projects
}

// Task execution
async function executeTask(taskId) {
  const task = tasks.get(taskId)
  if (!task) return

  task.status = 'running'
  task.startTime = Date.now()

  const agent = agents.get(task.agentId)
  if (agent) {
    agent.status = 'busy'
    agent.currentProject = task.projectId
  }

  // Emit updates
  io.emit('task_update', task)
  io.emit('agent_update', agent)

  try {
    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

    // Mock different outcomes based on task type
    const success = Math.random() > 0.2 // 80% success rate

    task.status = success ? 'completed' : 'failed'
    task.endTime = Date.now()
    task.output = success
      ? `✅ ${task.type} task completed successfully`
      : `❌ ${task.type} task failed with error`

    if (agent) {
      agent.status = 'idle'
      agent.currentProject = ''
      agent.tasksCompleted++
      if (success) agent.successRate = Math.min(100, agent.successRate + 0.1)
    }

  } catch (error) {
    task.status = 'failed'
    task.output = `Error: ${error.message}`

    if (agent) {
      agent.status = 'idle'
      agent.currentProject = ''
    }
  }

  // Emit final updates
  io.emit('task_update', task)
  io.emit('agent_update', agent)
}

// API Routes
app.get('/api/projects', async (req, res) => {
  try {
    const workspacePath = process.env.WORKSPACE_PATH || 'e:\\GitHub\\codai-project'
    const scannedProjects = await scanWorkspace(workspacePath)

    // Update projects map
    scannedProjects.forEach(project => {
      projects.set(project.id, project)
    })

    res.json({
      success: true,
      data: Array.from(projects.values()),
      count: projects.size
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/agents', (req, res) => {
  try {
    res.json({
      success: true,
      data: Array.from(agents.values()),
      count: agents.size
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/tasks', (req, res) => {
  try {
    const taskList = Array.from(tasks.values())

    // Optional filtering
    const { status, projectId } = req.query
    let filteredTasks = taskList

    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status)
    }

    if (projectId) {
      filteredTasks = filteredTasks.filter(task => task.projectId === projectId)
    }

    res.json({
      success: true,
      data: filteredTasks,
      count: filteredTasks.length
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
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

    const task = {
      id: `task-${Date.now()}`,
      type,
      projectId,
      agentId: availableAgent.id,
      command,
      status: 'pending'
    }

    tasks.set(task.id, task)

    // Execute task asynchronously
    setImmediate(() => executeTask(task.id))

    res.json({
      success: true,
      data: task
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Advanced Orchestration Endpoints
app.get('/api/workflows', (req, res) => {
  try {
    const workflows = orchestrator.getWorkflows()
    res.json({
      success: true,
      data: workflows,
      count: workflows.length
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/workflows', async (req, res) => {
  try {
    const { taskType, projectId, priority = 'medium', requirements = [] } = req.body

    const context = {
      taskType,
      projectId,
      priority,
      requirements,
      constraints: [],
      stakeholders: ['development-team']
    }

    const workflowId = await orchestrator.createWorkflow(context)

    res.json({
      success: true,
      data: { workflowId }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/orchestration/metrics', (req, res) => {
  try {
    const metrics = orchestrator.getMetrics()
    res.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/workflows/:id', (req, res) => {
  try {
    const workflow = orchestrator.activeWorkflows.get(req.params.id)
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' })
    }

    res.json({
      success: true,
      data: workflow
    })
  } catch (error) {
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

      const task = {
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
    } catch (error) {
      socket.emit('error', { message: error.message })
    }
  })
})

// Initialize system
initializeAgents()

// Start server
const PORT = process.env.PORT || 4043
server.listen(PORT, () => {
  console.log(`🚀 AIDE Server running on http://localhost:${PORT}`)
  console.log(`🤖 ${agents.size} AI agents initialized`)
  console.log(`📁 Workspace: ${process.env.WORKSPACE_PATH || 'e:\\GitHub\\codai-project'}`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down AIDE Server...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

module.exports = { app, server, io }
