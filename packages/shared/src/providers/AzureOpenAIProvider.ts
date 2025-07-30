/**
 * Azure OpenAI Provider - Multi-Model Deployment Integration
 * 
 * Comprehensive Azure OpenAI service with support for multiple model deployments:
 * - GPT-4, GPT-4-Turbo, GPT-3.5-Turbo deployments
 * - DALL-E 3 for image generation
 * - Whisper for speech-to-text
 * - Text-to-speech capabilities
 * - Custom fine-tuned models
 * - Advanced token management and cost optimization
 */

import { EventEmitter } from 'events'
import {
  AzureOpenAIConfig,
  ModelDeployment,
  CompletionRequest,
  CompletionResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
  SpeechRequest,
  SpeechResponse,
  TranscriptionRequest,
  TranscriptionResponse,
  ModelCapabilities,
  TokenUsage,
  AzureOpenAIError
} from '../types/azure-openai'

export class AzureOpenAIProvider extends EventEmitter {
  private static instance: AzureOpenAIProvider
  private config: AzureOpenAIConfig
  private deployments = new Map<string, ModelDeployment>()
  private tokenUsage = new Map<string, TokenUsage>()
  private isInitialized = false

  constructor(config: AzureOpenAIConfig) {
    super()
    this.config = config
  }

  static getInstance(config?: AzureOpenAIConfig): AzureOpenAIProvider {
    if (!AzureOpenAIProvider.instance) {
      if (!config) {
        throw new Error('AzureOpenAIProvider requires configuration on first initialization')
      }
      AzureOpenAIProvider.instance = new AzureOpenAIProvider(config)
    }
    return AzureOpenAIProvider.instance
  }

  static create(config: AzureOpenAIConfig): AzureOpenAIProvider {
    return new AzureOpenAIProvider(config)
  }

  // ==================== INITIALIZATION ====================

  async initialize(): Promise<void> {
    try {
      this.emit('initialization:started')

      // Load model deployments
      await this.loadDeployments()

      // Validate API connectivity
      await this.validateConnection()

      // Initialize token tracking
      this.initializeTokenTracking()

      this.isInitialized = true
      this.emit('initialization:completed')

      console.log('✅ Azure OpenAI Provider initialized successfully')
      console.log(`📊 Loaded ${this.deployments.size} model deployments`)
    } catch (error) {
      this.emit('initialization:error', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new AzureOpenAIError(`Failed to initialize Azure OpenAI Provider: ${errorMessage}`)
    }
  }

  private async loadDeployments(): Promise<void> {
    // Load configured deployments
    for (const deployment of this.config.deployments) {
      await this.registerDeployment(deployment)
    }
  }

  private async registerDeployment(deployment: ModelDeployment): Promise<void> {
    try {
      // Validate deployment availability
      const isAvailable = await this.checkDeploymentHealth(deployment)

      if (isAvailable) {
        deployment.status = 'active'
        deployment.lastHealthCheck = new Date()
        this.deployments.set(deployment.name, deployment)
        this.emit('deployment:registered', deployment)
      } else {
        deployment.status = 'unavailable'
        console.warn(`⚠️  Deployment ${deployment.name} is not available`)
      }
    } catch (error) {
      deployment.status = 'error'
      deployment.error = error instanceof Error ? error.message : String(error)
      console.error(`❌ Failed to register deployment ${deployment.name}:`, error)
    }
  }

  private async checkDeploymentHealth(deployment: ModelDeployment): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        deployment: deployment.name,
        endpoint: 'completions',
        method: 'POST',
        data: {
          messages: [{ role: 'user', content: 'Health check' }],
          max_tokens: 1
        }
      })
      return response.status >= 200 && response.status < 300
    } catch (error) {
      return false
    }
  }

  // ==================== TEXT COMPLETION ====================

  async createCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    this.validateInitialization()

    try {
      const deployment = this.selectOptimalDeployment('text', request.model)
      if (!deployment) {
        throw new AzureOpenAIError(`No suitable deployment found for model: ${request.model}`)
      }

      this.emit('completion:started', { deployment: deployment.name, request })

      const startTime = Date.now()
      const response = await this.makeRequest({
        deployment: deployment.name,
        endpoint: 'chat/completions',
        method: 'POST',
        data: {
          messages: request.messages,
          model: deployment.model,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 4096,
          top_p: request.topP || 1.0,
          frequency_penalty: request.frequencyPenalty || 0.0,
          presence_penalty: request.presencePenalty || 0.0,
          stop: request.stop,
          stream: request.stream || false,
          tools: request.tools,
          tool_choice: request.toolChoice
        }
      })

      const responseTime = Date.now() - startTime
      const result: CompletionResponse = {
        id: response.data.id,
        object: response.data.object,
        created: response.data.created,
        model: deployment.model,
        deployment: deployment.name,
        choices: response.data.choices,
        usage: response.data.usage,
        responseTime,
        cost: this.calculateCost(deployment, response.data.usage)
      }

      // Track token usage
      this.trackTokenUsage(deployment.name, response.data.usage, result.cost)

      this.emit('completion:completed', { deployment: deployment.name, result })
      return result

    } catch (error) {
      this.emit('completion:error', { error, request })
      throw this.handleAPIError(error)
    }
  }

  // ==================== IMAGE GENERATION ====================

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    this.validateInitialization()

    try {
      const deployment = this.selectOptimalDeployment('image', request.model || 'dall-e-3')
      if (!deployment) {
        throw new AzureOpenAIError(`No DALL-E deployment found`)
      }

      this.emit('image:generation:started', { deployment: deployment.name, request })

      const startTime = Date.now()
      const response = await this.makeRequest({
        deployment: deployment.name,
        endpoint: 'images/generations',
        method: 'POST',
        data: {
          prompt: request.prompt,
          model: deployment.model,
          n: request.n || 1,
          size: request.size || '1024x1024',
          quality: request.quality || 'standard',
          style: request.style || 'vivid',
          response_format: request.responseFormat || 'url'
        }
      })

      const responseTime = Date.now() - startTime
      const result: ImageGenerationResponse = {
        id: response.data.id || `img-${Date.now()}`,
        created: Math.floor(Date.now() / 1000),
        data: response.data.data,
        model: deployment.model,
        deployment: deployment.name,
        responseTime,
        cost: this.calculateImageCost(deployment, request)
      }

      this.emit('image:generation:completed', { deployment: deployment.name, result })
      return result

    } catch (error) {
      this.emit('image:generation:error', { error, request })
      throw this.handleAPIError(error)
    }
  }

  // ==================== SPEECH SERVICES ====================

  async createSpeech(request: SpeechRequest): Promise<SpeechResponse> {
    this.validateInitialization()

    try {
      const deployment = this.selectOptimalDeployment('speech', 'tts-1')
      if (!deployment) {
        throw new AzureOpenAIError(`No text-to-speech deployment found`)
      }

      this.emit('speech:creation:started', { deployment: deployment.name, request })

      const startTime = Date.now()
      const response = await this.makeRequest({
        deployment: deployment.name,
        endpoint: 'audio/speech',
        method: 'POST',
        data: {
          model: deployment.model,
          input: request.input,
          voice: request.voice || 'alloy',
          response_format: request.responseFormat || 'mp3',
          speed: request.speed || 1.0
        },
        responseType: 'arraybuffer'
      })

      const responseTime = Date.now() - startTime
      const result: SpeechResponse = {
        audio: response.data,
        model: deployment.model,
        deployment: deployment.name,
        responseTime,
        cost: this.calculateSpeechCost(deployment, request)
      }

      this.emit('speech:creation:completed', { deployment: deployment.name, result })
      return result

    } catch (error) {
      this.emit('speech:creation:error', { error, request })
      throw this.handleAPIError(error)
    }
  }

  async createTranscription(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    this.validateInitialization()

    try {
      const deployment = this.selectOptimalDeployment('transcription', 'whisper-1')
      if (!deployment) {
        throw new AzureOpenAIError(`No Whisper deployment found`)
      }

      this.emit('transcription:started', { deployment: deployment.name, request })

      const startTime = Date.now()
      const formData = new FormData()
      formData.append('file', request.file)
      formData.append('model', deployment.model)
      if (request.language) formData.append('language', request.language)
      if (request.prompt) formData.append('prompt', request.prompt)
      if (request.responseFormat) formData.append('response_format', request.responseFormat)
      if (request.temperature) formData.append('temperature', request.temperature.toString())

      const response = await this.makeRequest({
        deployment: deployment.name,
        endpoint: 'audio/transcriptions',
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const responseTime = Date.now() - startTime
      const result: TranscriptionResponse = {
        text: response.data.text,
        model: deployment.model,
        deployment: deployment.name,
        responseTime,
        cost: this.calculateTranscriptionCost(deployment, request)
      }

      this.emit('transcription:completed', { deployment: deployment.name, result })
      return result

    } catch (error) {
      this.emit('transcription:error', { error, request })
      throw this.handleAPIError(error)
    }
  }

  // ==================== DEPLOYMENT MANAGEMENT ====================

  getDeployments(): ModelDeployment[] {
    return Array.from(this.deployments.values())
  }

  getActiveDeployments(): ModelDeployment[] {
    return this.getDeployments().filter(d => d.status === 'active')
  }

  selectOptimalDeployment(capability: keyof ModelCapabilities, preferredModel?: string): ModelDeployment | null {
    const activeDeployments = this.getActiveDeployments()

    // Filter by capability
    const capableDeployments = activeDeployments.filter(d => d.capabilities[capability])

    if (capableDeployments.length === 0) return null

    // Try to match preferred model
    if (preferredModel) {
      const exactMatch = capableDeployments.find(d => d.model === preferredModel)
      if (exactMatch) return exactMatch

      const modelMatch = capableDeployments.find(d => d.model.includes(preferredModel))
      if (modelMatch) return modelMatch
    }

    // Return deployment with best performance metrics
    return capableDeployments.sort((a, b) => {
      const aScore = (a.metrics?.successRate || 0) - (a.metrics?.averageResponseTime || 1000)
      const bScore = (b.metrics?.successRate || 0) - (b.metrics?.averageResponseTime || 1000)
      return bScore - aScore
    })[0]
  }

  // ==================== COST MANAGEMENT ====================

  private calculateCost(deployment: ModelDeployment, usage: any): number {
    if (!deployment.pricing) return 0

    const promptCost = (usage.prompt_tokens || 0) * (deployment.pricing.inputTokenCost || 0) / 1000
    const completionCost = (usage.completion_tokens || 0) * (deployment.pricing.outputTokenCost || 0) / 1000

    return promptCost + completionCost
  }

  private calculateImageCost(deployment: ModelDeployment, request: ImageGenerationRequest): number {
    if (!deployment.pricing?.imageCost) return 0

    const imageCount = request.n || 1
    return imageCount * deployment.pricing.imageCost
  }

  private calculateSpeechCost(deployment: ModelDeployment, request: SpeechRequest): number {
    if (!deployment.pricing?.speechCost) return 0

    const characterCount = request.input.length
    return characterCount * deployment.pricing.speechCost / 1000
  }

  private calculateTranscriptionCost(deployment: ModelDeployment, request: TranscriptionRequest): number {
    if (!deployment.pricing?.transcriptionCost) return 0

    // Estimate based on file size (rough approximation)
    const estimatedMinutes = request.file.size / (1024 * 1024 * 2) // Rough estimate: 2MB per minute
    return estimatedMinutes * deployment.pricing.transcriptionCost
  }

  // ==================== TOKEN USAGE TRACKING ====================

  private trackTokenUsage(deploymentName: string, usage: any, cost: number): void {
    if (!usage) return

    const existing = this.tokenUsage.get(deploymentName) || {
      deploymentName,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalCost: 0,
      requestCount: 0,
      lastUsed: new Date()
    }

    existing.totalTokens += usage.total_tokens || 0
    existing.promptTokens += usage.prompt_tokens || 0
    existing.completionTokens += usage.completion_tokens || 0
    existing.totalCost += cost
    existing.requestCount += 1
    existing.lastUsed = new Date()

    this.tokenUsage.set(deploymentName, existing)
    this.emit('usage:updated', existing)
  }

  getTokenUsage(deploymentName?: string): TokenUsage | TokenUsage[] | null {
    if (deploymentName) {
      return this.tokenUsage.get(deploymentName) || null
    }
    return Array.from(this.tokenUsage.values())
  }

  private initializeTokenTracking(): void {
    // Reset daily usage tracking
    const resetUsage = () => {
      for (const [deploymentName, usage] of this.tokenUsage.entries()) {
        this.tokenUsage.set(deploymentName, {
          ...usage,
          totalTokens: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalCost: 0,
          requestCount: 0
        })
      }
      this.emit('usage:reset')
    }

    // Reset at midnight
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    setTimeout(() => {
      resetUsage()
      setInterval(resetUsage, 24 * 60 * 60 * 1000) // Every 24 hours
    }, tomorrow.getTime() - now.getTime())
  }

  // ==================== UTILITY METHODS ====================

  private async validateConnection(): Promise<void> {
    const activeDeployments = this.getActiveDeployments()
    if (activeDeployments.length === 0) {
      throw new AzureOpenAIError('No active deployments available')
    }

    // Test connection with a simple request
    try {
      const testDeployment = activeDeployments[0]
      await this.makeRequest({
        deployment: testDeployment.name,
        endpoint: 'models',
        method: 'GET'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new AzureOpenAIError(`Connection validation failed: ${errorMessage}`)
    }
  }

  private validateInitialization(): void {
    if (!this.isInitialized) {
      throw new AzureOpenAIError('Provider not initialized. Call initialize() first.')
    }
  }

  private async makeRequest(options: {
    deployment: string
    endpoint: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    headers?: Record<string, string>
    responseType?: 'json' | 'arraybuffer'
  }): Promise<any> {
    const { deployment, endpoint, method, data, headers = {}, responseType = 'json' } = options

    const url = `${this.config.endpoint}/openai/deployments/${deployment}/${endpoint}?api-version=${this.config.apiVersion}`

    const requestHeaders = {
      'api-key': this.config.apiKey,
      'Content-Type': 'application/json',
      ...headers
    }

    // Make the actual HTTP request (implementation depends on your HTTP client)
    // This is a placeholder for the actual implementation
    throw new Error('HTTP client implementation required')
  }

  private handleAPIError(error: any): AzureOpenAIError {
    const azureError = new AzureOpenAIError(
      error.message || 'Unknown API error',
      error.status || 500,
      error.code || 'UNKNOWN_ERROR',
      error.details
    )

    this.emit('api:error', azureError)
    return azureError
  }

  // ==================== HEALTH & MONITORING ====================

  async healthCheck(): Promise<{ status: string; deployments: any[] }> {
    const deploymentStatus = []

    for (const deployment of this.deployments.values()) {
      const isHealthy = await this.checkDeploymentHealth(deployment)
      deploymentStatus.push({
        name: deployment.name,
        model: deployment.model,
        status: deployment.status,
        healthy: isHealthy,
        lastHealthCheck: deployment.lastHealthCheck
      })
    }

    const overallStatus = deploymentStatus.every(d => d.healthy) ? 'healthy' : 'degraded'

    return {
      status: overallStatus,
      deployments: deploymentStatus
    }
  }

  destroy(): void {
    this.removeAllListeners()
    this.deployments.clear()
    this.tokenUsage.clear()
    this.isInitialized = false
    console.log('🧹 Azure OpenAI Provider destroyed')
  }
}

export default AzureOpenAIProvider
