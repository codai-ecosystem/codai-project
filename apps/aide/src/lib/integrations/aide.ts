/**
 * Aide Integration Manager - AI Development Assistant Integration System
 * Handles integration with AI services, development tools, and CodAI ecosystem
 */

export interface AIServiceConfig {
  name: string
  endpoint?: string
  apiKey?: string
  model?: string
  maxTokens?: number
  temperature?: number
  enabled: boolean
}

export interface DevelopmentTool {
  name: string
  type: 'compiler' | 'linter' | 'formatter' | 'bundler' | 'test' | 'deploy'
  command: string
  args?: string[]
  workingDirectory?: string
  enabled: boolean
}

export interface CodeRepository {
  name: string
  type: 'git' | 'svn' | 'mercurial'
  url: string
  branch?: string
  credentials?: {
    username?: string
    token?: string
  }
  enabled: boolean
}

export interface IntegrationService {
  name: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: Date
  connect(): Promise<boolean>
  disconnect(): Promise<boolean>
  healthCheck(): Promise<boolean>
}

export class AIServiceIntegration implements IntegrationService {
  name: string
  private config: AIServiceConfig
  status: 'connected' | 'disconnected' | 'error' = 'disconnected'
  lastSync?: Date

  constructor(config: AIServiceConfig) {
    this.name = config.name
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.config.enabled) {
        this.status = 'disconnected'
        return false
      }

      // Test AI service connection
      const response = await fetch(`${this.config.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      }).catch(() => null)

      if (response?.ok) {
        this.status = 'connected'
        this.lastSync = new Date()
        return true
      }

      this.status = 'error'
      return false
    } catch (error) {
      console.error(`Failed to connect to AI service ${this.name}:`, error)
      this.status = 'error'
      return false
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      this.status = 'disconnected'
      return true
    } catch (error) {
      console.error(`Failed to disconnect from AI service ${this.name}:`, error)
      return false
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.config.enabled) {
        return false
      }

      // Quick health check
      const response = await fetch(`${this.config.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(3000)
      }).catch(() => null)

      return response?.ok || false
    } catch (error) {
      console.error(`Health check failed for AI service ${this.name}:`, error)
      return false
    }
  }

  async generateCode(prompt: string, language: string): Promise<string> {
    try {
      if (this.status !== 'connected') {
        throw new Error('AI service not connected')
      }

      const response = await fetch(`${this.config.endpoint}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          language,
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        })
      })

      if (!response.ok) {
        throw new Error(`AI service responded with ${response.status}`)
      }

      const data = await response.json()
      return data.code || data.text || ''
    } catch (error) {
      console.error(`Code generation failed for ${this.name}:`, error)
      throw error
    }
  }

  async analyzeCode(code: string, language: string): Promise<any> {
    try {
      if (this.status !== 'connected') {
        throw new Error('AI service not connected')
      }

      const response = await fetch(`${this.config.endpoint}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          language,
          model: this.config.model
        })
      })

      if (!response.ok) {
        throw new Error(`AI service responded with ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Code analysis failed for ${this.name}:`, error)
      throw error
    }
  }
}

export class DevelopmentToolIntegration implements IntegrationService {
  name: string
  private tool: DevelopmentTool
  status: 'connected' | 'disconnected' | 'error' = 'disconnected'
  lastSync?: Date

  constructor(tool: DevelopmentTool) {
    this.name = tool.name
    this.tool = tool
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.tool.enabled) {
        this.status = 'disconnected'
        return false
      }

      // Test tool availability
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      await execAsync(`${this.tool.command} --version`)
      this.status = 'connected'
      this.lastSync = new Date()
      return true
    } catch (error) {
      console.error(`Failed to connect to development tool ${this.name}:`, error)
      this.status = 'error'
      return false
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      this.status = 'disconnected'
      return true
    } catch (error) {
      console.error(`Failed to disconnect from development tool ${this.name}:`, error)
      return false
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.tool.enabled) {
        return false
      }

      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      await execAsync(`${this.tool.command} --version`)
      return true
    } catch (error) {
      return false
    }
  }

  async execute(args: string[] = []): Promise<string> {
    try {
      if (this.status !== 'connected') {
        throw new Error('Development tool not connected')
      }

      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      const command = `${this.tool.command} ${[...this.tool.args || [], ...args].join(' ')}`
      const { stdout } = await execAsync(command, {
        cwd: this.tool.workingDirectory
      })

      return stdout
    } catch (error) {
      console.error(`Tool execution failed for ${this.name}:`, error)
      throw error
    }
  }
}

export class RepositoryIntegration implements IntegrationService {
  name: string
  private repo: CodeRepository
  status: 'connected' | 'disconnected' | 'error' = 'disconnected'
  lastSync?: Date

  constructor(repo: CodeRepository) {
    this.name = repo.name
    this.repo = repo
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.repo.enabled) {
        this.status = 'disconnected'
        return false
      }

      // Test repository connection
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      await execAsync(`git ls-remote ${this.repo.url}`)
      this.status = 'connected'
      this.lastSync = new Date()
      return true
    } catch (error) {
      console.error(`Failed to connect to repository ${this.name}:`, error)
      this.status = 'error'
      return false
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      this.status = 'disconnected'
      return true
    } catch (error) {
      console.error(`Failed to disconnect from repository ${this.name}:`, error)
      return false
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.repo.enabled) {
        return false
      }

      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      await execAsync(`git ls-remote ${this.repo.url}`)
      return true
    } catch (error) {
      return false
    }
  }

  async clone(localPath: string): Promise<boolean> {
    try {
      if (this.status !== 'connected') {
        throw new Error('Repository not connected')
      }

      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      const branch = this.repo.branch ? `-b ${this.repo.branch}` : ''
      await execAsync(`git clone ${branch} ${this.repo.url} ${localPath}`)
      return true
    } catch (error) {
      console.error(`Repository clone failed for ${this.name}:`, error)
      throw error
    }
  }

  async pull(localPath: string): Promise<boolean> {
    try {
      if (this.status !== 'connected') {
        throw new Error('Repository not connected')
      }

      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      await execAsync('git pull', { cwd: localPath })
      return true
    } catch (error) {
      console.error(`Repository pull failed for ${this.name}:`, error)
      throw error
    }
  }
}

export class AideIntegrationManager {
  private services = new Map<string, IntegrationService>()
  private aiServices = new Map<string, AIServiceIntegration>()
  private developmentTools = new Map<string, DevelopmentToolIntegration>()
  private repositories = new Map<string, RepositoryIntegration>()

  constructor() {
    this.initializeServices()
  }

  private initializeServices() {
    // AI Services
    const aiServiceConfigs: AIServiceConfig[] = [
      {
        name: 'openai-gpt4',
        endpoint: 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4',
        maxTokens: 2048,
        temperature: 0.7,
        enabled: !!process.env.OPENAI_API_KEY
      },
      {
        name: 'anthropic-claude',
        endpoint: 'https://api.anthropic.com',
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-3-opus',
        maxTokens: 2048,
        temperature: 0.7,
        enabled: !!process.env.ANTHROPIC_API_KEY
      },
      {
        name: 'google-gemini',
        endpoint: 'https://generativelanguage.googleapis.com',
        apiKey: process.env.GOOGLE_API_KEY,
        model: 'gemini-pro',
        maxTokens: 2048,
        temperature: 0.7,
        enabled: !!process.env.GOOGLE_API_KEY
      },
      {
        name: 'codai-local',
        endpoint: 'http://localhost:3005',
        apiKey: 'local-dev-key',
        model: 'codai-assistant',
        maxTokens: 4096,
        temperature: 0.5,
        enabled: true
      }
    ]

    aiServiceConfigs.forEach(config => {
      const service = new AIServiceIntegration(config)
      this.aiServices.set(config.name, service)
      this.services.set(config.name, service)
    })

    // Development Tools
    const developmentToolsConfigs: DevelopmentTool[] = [
      {
        name: 'typescript',
        type: 'compiler',
        command: 'tsc',
        args: ['--noEmit'],
        enabled: true
      },
      {
        name: 'eslint',
        type: 'linter',
        command: 'eslint',
        args: ['--ext', '.js,.ts,.jsx,.tsx'],
        enabled: true
      },
      {
        name: 'prettier',
        type: 'formatter',
        command: 'prettier',
        args: ['--check'],
        enabled: true
      },
      {
        name: 'webpack',
        type: 'bundler',
        command: 'webpack',
        args: ['--mode', 'production'],
        enabled: true
      },
      {
        name: 'jest',
        type: 'test',
        command: 'jest',
        args: ['--coverage'],
        enabled: true
      },
      {
        name: 'docker',
        type: 'deploy',
        command: 'docker',
        args: ['build'],
        enabled: true
      }
    ]

    developmentToolsConfigs.forEach(tool => {
      const service = new DevelopmentToolIntegration(tool)
      this.developmentTools.set(tool.name, service)
      this.services.set(tool.name, service)
    })

    // Code Repositories
    const repositoryConfigs: CodeRepository[] = [
      {
        name: 'github-main',
        type: 'git',
        url: process.env.GITHUB_REPO_URL || 'https://github.com/example/repo.git',
        branch: 'main',
        credentials: {
          username: process.env.GITHUB_USERNAME,
          token: process.env.GITHUB_TOKEN
        },
        enabled: !!process.env.GITHUB_REPO_URL
      },
      {
        name: 'gitlab-main',
        type: 'git',
        url: process.env.GITLAB_REPO_URL || '',
        branch: 'main',
        credentials: {
          username: process.env.GITLAB_USERNAME,
          token: process.env.GITLAB_TOKEN
        },
        enabled: !!process.env.GITLAB_REPO_URL
      }
    ]

    repositoryConfigs.forEach(repo => {
      const service = new RepositoryIntegration(repo)
      this.repositories.set(repo.name, service)
      this.services.set(repo.name, service)
    })
  }

  async connectAll(): Promise<boolean> {
    try {
      const connections = await Promise.allSettled(
        Array.from(this.services.values()).map(service => service.connect())
      )

      const successful = connections.filter(result =>
        result.status === 'fulfilled' && result.value === true
      ).length

      return successful > 0
    } catch (error) {
      console.error('Failed to connect all services:', error)
      return false
    }
  }

  async disconnectAll(): Promise<boolean> {
    try {
      await Promise.allSettled(
        Array.from(this.services.values()).map(service => service.disconnect())
      )
      return true
    } catch (error) {
      console.error('Failed to disconnect all services:', error)
      return false
    }
  }

  async healthCheckAll(): Promise<Record<string, boolean>> {
    try {
      const checks = await Promise.allSettled(
        Array.from(this.services.entries()).map(async ([name, service]) => ({
          name,
          healthy: await service.healthCheck()
        }))
      )

      const results: Record<string, boolean> = {}
      checks.forEach(result => {
        if (result.status === 'fulfilled') {
          results[result.value.name] = result.value.healthy
        }
      })

      return results
    } catch (error) {
      console.error('Failed to run health checks:', error)
      return {}
    }
  }

  // AI Service Methods
  async generateCodeWithAI(serviceName: string, prompt: string, language: string): Promise<string> {
    const aiService = this.aiServices.get(serviceName)
    if (!aiService) {
      throw new Error(`AI service ${serviceName} not found`)
    }

    return await aiService.generateCode(prompt, language)
  }

  async analyzeCodeWithAI(serviceName: string, code: string, language: string): Promise<any> {
    const aiService = this.aiServices.get(serviceName)
    if (!aiService) {
      throw new Error(`AI service ${serviceName} not found`)
    }

    return await aiService.analyzeCode(code, language)
  }

  getAvailableAIServices(): string[] {
    return Array.from(this.aiServices.keys()).filter(name => {
      const service = this.aiServices.get(name)
      return service?.status === 'connected'
    })
  }

  // Development Tool Methods
  async executeTool(toolName: string, args: string[] = []): Promise<string> {
    const tool = this.developmentTools.get(toolName)
    if (!tool) {
      throw new Error(`Development tool ${toolName} not found`)
    }

    return await tool.execute(args)
  }

  getAvailableTools(): string[] {
    return Array.from(this.developmentTools.keys()).filter(name => {
      const tool = this.developmentTools.get(name)
      return tool?.status === 'connected'
    })
  }

  // Repository Methods
  async cloneRepository(repoName: string, localPath: string): Promise<boolean> {
    const repo = this.repositories.get(repoName)
    if (!repo) {
      throw new Error(`Repository ${repoName} not found`)
    }

    return await repo.clone(localPath)
  }

  async pullRepository(repoName: string, localPath: string): Promise<boolean> {
    const repo = this.repositories.get(repoName)
    if (!repo) {
      throw new Error(`Repository ${repoName} not found`)
    }

    return await repo.pull(localPath)
  }

  getAvailableRepositories(): string[] {
    return Array.from(this.repositories.keys()).filter(name => {
      const repo = this.repositories.get(name)
      return repo?.status === 'connected'
    })
  }

  // General Service Methods
  getService(name: string): IntegrationService | undefined {
    return this.services.get(name)
  }

  getServiceStatus(name: string): string {
    const service = this.services.get(name)
    return service?.status || 'unknown'
  }

  getAllServices(): IntegrationService[] {
    return Array.from(this.services.values())
  }

  getServicesByStatus(status: 'connected' | 'disconnected' | 'error'): IntegrationService[] {
    return Array.from(this.services.values()).filter(service => service.status === status)
  }

  getIntegrationSummary() {
    const services = Array.from(this.services.values())
    const connected = services.filter(s => s.status === 'connected').length
    const disconnected = services.filter(s => s.status === 'disconnected').length
    const error = services.filter(s => s.status === 'error').length

    return {
      total: services.length,
      connected,
      disconnected,
      error,
      healthyPercentage: (connected / services.length) * 100,
      aiServices: this.aiServices.size,
      developmentTools: this.developmentTools.size,
      repositories: this.repositories.size,
      lastSync: Math.max(...services.map(s => s.lastSync?.getTime() || 0))
    }
  }

  async processIntegrationRequest(serviceName: string, data: any): Promise<any> {
    try {
      const service = this.services.get(serviceName)
      if (!service) {
        throw new Error(`Service ${serviceName} not found`)
      }

      if (service.status !== 'connected') {
        const connected = await service.connect()
        if (!connected) {
          throw new Error(`Failed to connect to ${serviceName}`)
        }
      }

      // Process the integration request based on service type
      if (this.aiServices.has(serviceName)) {
        // Handle AI service requests
        if (data.type === 'generate') {
          return await this.generateCodeWithAI(serviceName, data.prompt, data.language)
        } else if (data.type === 'analyze') {
          return await this.analyzeCodeWithAI(serviceName, data.code, data.language)
        }
      } else if (this.developmentTools.has(serviceName)) {
        // Handle development tool requests
        return await this.executeTool(serviceName, data.args)
      } else if (this.repositories.has(serviceName)) {
        // Handle repository requests
        if (data.type === 'clone') {
          return await this.cloneRepository(serviceName, data.localPath)
        } else if (data.type === 'pull') {
          return await this.pullRepository(serviceName, data.localPath)
        }
      }

      throw new Error(`Unsupported request type for service ${serviceName}`)
    } catch (error) {
      console.error(`Failed to process integration request for ${serviceName}:`, error)
      throw error
    }
  }
}

export default AideIntegrationManager
