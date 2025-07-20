/**
 * Azure OpenAI Type Definitions
 * Comprehensive types for Azure OpenAI multi-model deployment integration
 */

// ==================== CORE CONFIGURATION ====================

export interface AzureOpenAIConfig {
  endpoint: string
  apiKey: string
  apiVersion: string
  deployments: ModelDeployment[]
  defaultDeployment?: string
  maxRetries?: number
  timeoutMs?: number
  rateLimitOptions?: RateLimitOptions
}

export interface ModelDeployment {
  name: string
  model: string
  version?: string
  capabilities: ModelCapabilities
  status: 'active' | 'inactive' | 'error' | 'unavailable'
  pricing?: PricingInfo
  limits?: ModelLimits
  metrics?: DeploymentMetrics
  lastHealthCheck?: Date
  error?: string
  metadata?: Record<string, any>
}

export interface ModelCapabilities {
  text: boolean
  image: boolean
  speech: boolean
  transcription: boolean
  vision: boolean
  tools: boolean
  streaming: boolean
}

export interface PricingInfo {
  inputTokenCost?: number // Cost per 1K input tokens
  outputTokenCost?: number // Cost per 1K output tokens
  imageCost?: number // Cost per image generation
  speechCost?: number // Cost per 1K characters
  transcriptionCost?: number // Cost per minute
}

export interface ModelLimits {
  maxTokens: number
  maxRequestsPerMinute?: number
  maxTokensPerMinute?: number
  maxConcurrentRequests?: number
}

export interface DeploymentMetrics {
  successRate: number
  averageResponseTime: number
  totalRequests: number
  errorCount: number
  lastUpdated: Date
}

export interface RateLimitOptions {
  requestsPerMinute?: number
  tokensPerMinute?: number
  burstAllowance?: number
  retryDelay?: number
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CompletionRequest {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stop?: string | string[]
  stream?: boolean
  tools?: Tool[]
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } }
  user?: string
  metadata?: Record<string, any>
}

export interface CompletionResponse {
  id: string
  object: string
  created: number
  model: string
  deployment: string
  choices: CompletionChoice[]
  usage: TokenUsage
  responseTime: number
  cost: number
  metadata?: Record<string, any>
}

export interface CompletionChoice {
  index: number
  message: ChatMessage
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  name?: string
  toolCalls?: ToolCall[]
  toolCallId?: string
}

export interface Tool {
  type: 'function'
  function: {
    name: string
    description?: string
    parameters: Record<string, any>
  }
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

// ==================== IMAGE GENERATION ====================

export interface ImageGenerationRequest {
  prompt: string
  model?: string
  n?: number
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  responseFormat?: 'url' | 'b64_json'
  user?: string
}

export interface ImageGenerationResponse {
  id: string
  created: number
  data: ImageData[]
  model: string
  deployment: string
  responseTime: number
  cost: number
}

export interface ImageData {
  url?: string
  b64Json?: string
  revisedPrompt?: string
}

// ==================== SPEECH SERVICES ====================

export interface SpeechRequest {
  input: string
  model?: string
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm'
  speed?: number // 0.25 to 4.0
}

export interface SpeechResponse {
  audio: ArrayBuffer
  model: string
  deployment: string
  responseTime: number
  cost: number
}

export interface TranscriptionRequest {
  file: Blob | File
  model?: string
  language?: string
  prompt?: string
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'
  temperature?: number
}

export interface TranscriptionResponse {
  text: string
  model: string
  deployment: string
  responseTime: number
  cost: number
  language?: string
  duration?: number
  segments?: TranscriptionSegment[]
}

export interface TranscriptionSegment {
  id: number
  seek: number
  start: number
  end: number
  text: string
  tokens: number[]
  temperature: number
  avgLogprob: number
  compressionRatio: number
  noSpeechProb: number
}

// ==================== USAGE TRACKING ====================

export interface TokenUsage {
  deploymentName: string
  totalTokens: number
  promptTokens: number
  completionTokens: number
  totalCost: number
  requestCount: number
  lastUsed: Date
}

export interface UsageReport {
  period: 'hourly' | 'daily' | 'monthly'
  startDate: Date
  endDate: Date
  deployments: DeploymentUsage[]
  totalCost: number
  totalTokens: number
  totalRequests: number
}

export interface DeploymentUsage {
  deploymentName: string
  model: string
  requests: number
  tokens: number
  cost: number
  averageResponseTime: number
  successRate: number
}

// ==================== ERROR HANDLING ====================

export class AzureOpenAIError extends Error {
  public readonly status: number
  public readonly code: string
  public readonly details?: any

  constructor(
    message: string,
    status: number = 500,
    code: string = 'AZURE_OPENAI_ERROR',
    details?: any
  ) {
    super(message)
    this.name = 'AzureOpenAIError'
    this.status = status
    this.code = code
    this.details = details

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AzureOpenAIError.prototype)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      stack: this.stack
    }
  }
}

// ==================== STREAMING TYPES ====================

export interface StreamingCompletionRequest extends Omit<CompletionRequest, 'stream'> {
  stream: true
}

export interface StreamingCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  deployment: string
  choices: StreamingChoice[]
}

export interface StreamingChoice {
  index: number
  delta: {
    role?: 'assistant'
    content?: string
    toolCalls?: ToolCall[]
  }
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
}

// ==================== FINE-TUNING TYPES ====================

export interface FineTuningJob {
  id: string
  object: string
  model: string
  createdAt: number
  finishedAt?: number
  fineTunedModel?: string
  status: 'validating_files' | 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'
  trainingFile: string
  validationFile?: string
  resultFiles: string[]
  trainedTokens?: number
  error?: {
    code: string
    message: string
    param?: string
  }
}

export interface FineTuningCreateRequest {
  trainingFile: string
  model: string
  validationFile?: string
  hyperparameters?: {
    batchSize?: number
    learningRateMultiplier?: number
    nEpochs?: number
  }
  suffix?: string
}

// ==================== EMBEDDINGS ====================

export interface EmbeddingRequest {
  input: string | string[]
  model?: string
  encodingFormat?: 'float' | 'base64'
  dimensions?: number
  user?: string
}

export interface EmbeddingResponse {
  object: string
  data: Embedding[]
  model: string
  deployment: string
  usage: {
    promptTokens: number
    totalTokens: number
  }
  responseTime: number
  cost: number
}

export interface Embedding {
  object: 'embedding'
  index: number
  embedding: number[]
}

// ==================== MODERATION ====================

export interface ModerationRequest {
  input: string | string[]
  model?: string
}

export interface ModerationResponse {
  id: string
  model: string
  deployment: string
  results: ModerationResult[]
}

export interface ModerationResult {
  flagged: boolean
  categories: {
    hate: boolean
    hateThreatening: boolean
    harassment: boolean
    harassmentThreatening: boolean
    selfHarm: boolean
    selfHarmIntent: boolean
    selfHarmInstructions: boolean
    sexual: boolean
    sexualMinors: boolean
    violence: boolean
    violenceGraphic: boolean
  }
  categoryScores: {
    hate: number
    hateThreatening: number
    harassment: number
    harassmentThreatening: number
    selfHarm: number
    selfHarmIntent: number
    selfHarmInstructions: number
    sexual: number
    sexualMinors: number
    violence: number
    violenceGraphic: number
  }
}

// ==================== HEALTH CHECK ====================

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  deployments: DeploymentHealth[]
  timestamp: Date
  responseTime: number
}

export interface DeploymentHealth {
  name: string
  model: string
  status: 'active' | 'inactive' | 'error' | 'unavailable'
  healthy: boolean
  latency?: number
  lastHealthCheck?: Date
  error?: string
}

// ==================== CONFIGURATION VALIDATION ====================

export interface ConfigValidationResult {
  isValid: boolean
  errors: ConfigValidationError[]
  warnings: ConfigValidationWarning[]
}

export interface ConfigValidationError {
  field: string
  message: string
  code: string
}

export interface ConfigValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// ==================== BATCH PROCESSING ====================

export interface BatchRequest {
  customId: string
  method: 'POST'
  url: string
  body: CompletionRequest | EmbeddingRequest | ModerationRequest
}

export interface BatchJob {
  id: string
  object: string
  endpoint: string
  errors?: {
    object: string
    data: BatchError[]
  }
  inputFileId: string
  completionWindow: string
  status: 'validating' | 'failed' | 'in_progress' | 'finalizing' | 'completed' | 'expired' | 'cancelling' | 'cancelled'
  outputFileId?: string
  errorFileId?: string
  createdAt: number
  inProgressAt?: number
  expiresAt?: number
  finalizingAt?: number
  completedAt?: number
  failedAt?: number
  expiredAt?: number
  cancellingAt?: number
  cancelledAt?: number
  requestCounts?: {
    total: number
    completed: number
    failed: number
  }
  metadata?: Record<string, string>
}

export interface BatchError {
  code: string
  message: string
  param?: string
  line?: number
}

// ==================== EXPORT ALL TYPES ====================

export type {
  // Core types already exported above
}
