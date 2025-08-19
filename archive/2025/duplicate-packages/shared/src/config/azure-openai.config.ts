/**
 * Azure OpenAI Configuration - Multi-Model Deployments
 * 
 * Configuration for Azure OpenAI service with multiple model deployments
 * optimized for the CODAI ecosystem services
 */

import { AzureOpenAIConfig, ModelDeployment } from '../types/azure-openai'

// ==================== DEPLOYMENT CONFIGURATIONS ====================

const GPT4_DEPLOYMENT: ModelDeployment = {
  name: 'codai-gpt4-turbo',
  model: 'gpt-4-turbo',
  version: '2024-04-09',
  capabilities: {
    text: true,
    image: false,
    speech: false,
    transcription: false,
    vision: true,
    tools: true,
    streaming: true
  },
  status: 'active',
  pricing: {
    inputTokenCost: 0.01, // $10 per 1M input tokens
    outputTokenCost: 0.03, // $30 per 1M output tokens
  },
  limits: {
    maxTokens: 128000,
    maxRequestsPerMinute: 300,
    maxTokensPerMinute: 150000,
    maxConcurrentRequests: 10
  },
  metrics: {
    successRate: 0.99,
    averageResponseTime: 1500,
    totalRequests: 0,
    errorCount: 0,
    lastUpdated: new Date()
  }
}

const GPT4_MINI_DEPLOYMENT: ModelDeployment = {
  name: 'codai-gpt4-mini',
  model: 'gpt-4o-mini',
  version: '2024-07-18',
  capabilities: {
    text: true,
    image: false,
    speech: false,
    transcription: false,
    vision: true,
    tools: true,
    streaming: true
  },
  status: 'active',
  pricing: {
    inputTokenCost: 0.00015, // $0.15 per 1M input tokens
    outputTokenCost: 0.0006, // $0.6 per 1M output tokens
  },
  limits: {
    maxTokens: 128000,
    maxRequestsPerMinute: 500,
    maxTokensPerMinute: 200000,
    maxConcurrentRequests: 15
  },
  metrics: {
    successRate: 0.99,
    averageResponseTime: 800,
    totalRequests: 0,
    errorCount: 0,
    lastUpdated: new Date()
  }
}

const GPT35_TURBO_DEPLOYMENT: ModelDeployment = {
  name: 'codai-gpt35-turbo',
  model: 'gpt-35-turbo',
  version: '0125',
  capabilities: {
    text: true,
    image: false,
    speech: false,
    transcription: false,
    vision: false,
    tools: true,
    streaming: true
  },
  status: 'active',
  pricing: {
    inputTokenCost: 0.0005, // $0.5 per 1M input tokens
    outputTokenCost: 0.0015, // $1.5 per 1M output tokens
  },
  limits: {
    maxTokens: 16385,
    maxRequestsPerMinute: 1000,
    maxTokensPerMinute: 300000,
    maxConcurrentRequests: 20
  },
  metrics: {
    successRate: 0.98,
    averageResponseTime: 600,
    totalRequests: 0,
    errorCount: 0,
    lastUpdated: new Date()
  }
}

const DALLE3_DEPLOYMENT: ModelDeployment = {
  name: 'codai-dalle3',
  model: 'dall-e-3',
  capabilities: {
    text: false,
    image: true,
    speech: false,
    transcription: false,
    vision: false,
    tools: false,
    streaming: false
  },
  status: 'active',
  pricing: {
    imageCost: 0.04, // $0.04 per standard quality image
  },
  limits: {
    maxTokens: 4000, // For prompt
    maxRequestsPerMinute: 50,
    maxConcurrentRequests: 5
  },
  metrics: {
    successRate: 0.97,
    averageResponseTime: 8000,
    totalRequests: 0,
    errorCount: 0,
    lastUpdated: new Date()
  }
}

const TTS_DEPLOYMENT: ModelDeployment = {
  name: 'codai-tts',
  model: 'tts-1',
  capabilities: {
    text: false,
    image: false,
    speech: true,
    transcription: false,
    vision: false,
    tools: false,
    streaming: false
  },
  status: 'active',
  pricing: {
    speechCost: 0.015, // $15 per 1M characters
  },
  limits: {
    maxTokens: 4096, // For input text
    maxRequestsPerMinute: 100,
    maxConcurrentRequests: 3
  },
  metrics: {
    successRate: 0.98,
    averageResponseTime: 3000,
    totalRequests: 0,
    errorCount: 0,
    lastUpdated: new Date()
  }
}

const WHISPER_DEPLOYMENT: ModelDeployment = {
  name: 'codai-whisper',
  model: 'whisper-1',
  capabilities: {
    text: false,
    image: false,
    speech: false,
    transcription: true,
    vision: false,
    tools: false,
    streaming: false
  },
  status: 'active',
  pricing: {
    transcriptionCost: 0.006, // $0.006 per minute
  },
  limits: {
    maxTokens: 4096,
    maxRequestsPerMinute: 50,
    maxConcurrentRequests: 3
  },
  metrics: {
    successRate: 0.96,
    averageResponseTime: 5000,
    totalRequests: 0,
    errorCount: 0,
    lastUpdated: new Date()
  }
}

// ==================== MAIN CONFIGURATION ====================

export const createAzureOpenAIConfig = (): AzureOpenAIConfig => {
  // Get configuration from environment variables
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-06-01'

  if (!endpoint || !apiKey) {
    throw new Error(
      'Azure OpenAI configuration missing. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY environment variables.'
    )
  }

  return {
    endpoint,
    apiKey,
    apiVersion,
    deployments: [
      GPT4_DEPLOYMENT,
      GPT4_MINI_DEPLOYMENT,
      GPT35_TURBO_DEPLOYMENT,
      DALLE3_DEPLOYMENT,
      TTS_DEPLOYMENT,
      WHISPER_DEPLOYMENT
    ],
    defaultDeployment: 'codai-gpt4-mini',
    maxRetries: 3,
    timeoutMs: 30000,
    rateLimitOptions: {
      requestsPerMinute: 1000,
      tokensPerMinute: 150000,
      burstAllowance: 50,
      retryDelay: 1000
    }
  }
}

// ==================== DEPLOYMENT PRESETS ====================

export const DEPLOYMENT_PRESETS = {
  // High-performance conversational AI
  CONVERSATION_OPTIMIZED: {
    primary: 'codai-gpt4-mini',
    fallback: 'codai-gpt35-turbo',
    settings: {
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.95
    }
  },

  // Code generation and analysis
  CODE_GENERATION: {
    primary: 'codai-gpt4-turbo',
    fallback: 'codai-gpt4-mini',
    settings: {
      temperature: 0.1,
      maxTokens: 8192,
      topP: 0.1
    }
  },

  // Creative content generation
  CREATIVE_CONTENT: {
    primary: 'codai-gpt4-turbo',
    fallback: 'codai-gpt4-mini',
    settings: {
      temperature: 0.9,
      maxTokens: 8192,
      topP: 0.95
    }
  },

  // Fast responses for real-time applications
  REAL_TIME_OPTIMIZED: {
    primary: 'codai-gpt35-turbo',
    fallback: 'codai-gpt4-mini',
    settings: {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9
    }
  },

  // Cost-optimized for high-volume applications
  COST_OPTIMIZED: {
    primary: 'codai-gpt35-turbo',
    fallback: 'codai-gpt4-mini',
    settings: {
      temperature: 0.7,
      maxTokens: 1024,
      topP: 0.9
    }
  },

  // Romanian language optimized
  ROMANIAN_OPTIMIZED: {
    primary: 'codai-gpt4-turbo',
    fallback: 'codai-gpt4-mini',
    settings: {
      temperature: 0.8,
      maxTokens: 4096,
      topP: 0.95
    }
  }
} as const

// ==================== UTILITY FUNCTIONS ====================

export const getDeploymentByCapability = (
  config: AzureOpenAIConfig,
  capability: keyof ModelDeployment['capabilities']
): ModelDeployment[] => {
  return config.deployments.filter(
    deployment => deployment.capabilities[capability] && deployment.status === 'active'
  )
}

export const getOptimalDeployment = (
  config: AzureOpenAIConfig,
  capability: keyof ModelDeployment['capabilities'],
  preferredModel?: string
): ModelDeployment | null => {
  const capableDeployments = getDeploymentByCapability(config, capability)

  if (capableDeployments.length === 0) return null

  // Try to match preferred model
  if (preferredModel) {
    const exactMatch = capableDeployments.find(d => d.model === preferredModel)
    if (exactMatch) return exactMatch

    const partialMatch = capableDeployments.find(d =>
      d.model.toLowerCase().includes(preferredModel.toLowerCase())
    )
    if (partialMatch) return partialMatch
  }

  // Return deployment with best performance score
  return capableDeployments.sort((a, b) => {
    const aScore = (a.metrics?.successRate || 0) * 100 - (a.metrics?.averageResponseTime || 10000) / 100
    const bScore = (b.metrics?.successRate || 0) * 100 - (b.metrics?.averageResponseTime || 10000) / 100
    return bScore - aScore
  })[0]
}

export const estimateCost = (
  deployment: ModelDeployment,
  inputTokens: number,
  outputTokens: number = 0
): number => {
  if (!deployment.pricing) return 0

  const inputCost = (deployment.pricing.inputTokenCost || 0) * inputTokens / 1000
  const outputCost = (deployment.pricing.outputTokenCost || 0) * outputTokens / 1000

  return inputCost + outputCost
}

// ==================== VALIDATION ====================

export const validateConfig = (config: AzureOpenAIConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!config.endpoint) {
    errors.push('Missing Azure OpenAI endpoint')
  }

  if (!config.apiKey) {
    errors.push('Missing Azure OpenAI API key')
  }

  if (!config.apiVersion) {
    errors.push('Missing Azure OpenAI API version')
  }

  if (!config.deployments || config.deployments.length === 0) {
    errors.push('No model deployments configured')
  }

  // Validate each deployment
  config.deployments?.forEach((deployment, index) => {
    if (!deployment.name) {
      errors.push(`Deployment ${index}: Missing name`)
    }

    if (!deployment.model) {
      errors.push(`Deployment ${index}: Missing model`)
    }

    if (!deployment.capabilities) {
      errors.push(`Deployment ${index}: Missing capabilities`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

export default createAzureOpenAIConfig
