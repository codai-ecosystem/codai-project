/**
 * ConversAI Service Type Definitions
 */

// ==================== CORE TYPES ====================

export interface Conversation {
  id: string
  userId: string
  title: string
  description?: string
  status: 'active' | 'archived' | 'deleted'
  context?: ConversationContext
  settings?: ConversationSettings
  createdAt: Date
  updatedAt: Date
  messageCount: number
  totalTokens: number
}

export interface ConversationMessage {
  id: string
  conversationId: string
  userId: string
  content: string
  type: 'text' | 'voice' | 'image' | 'file' | 'code'
  role: 'user' | 'assistant' | 'system'
  tokens?: number
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface ConversationSettings {
  model: string
  temperature: number
  maxTokens: number
  enableVoice: boolean
  enableVideo: boolean
  enableScreenShare: boolean
  enableDocuments: boolean
  autoSave: boolean
  realTimeSync: boolean
  memoryIntegration: boolean
  analyticsEnabled: boolean
  customInstructions?: string
  responseFormat?: 'markdown' | 'json' | 'text'
  safetyFilter?: boolean
  moderationLevel?: 'low' | 'medium' | 'high'
}

export interface ConversationContext {
  [key: string]: any
}

export interface ConversationAnalytics {
  conversationId: string
  totalMessages: number
  totalTokens: number
  averageResponseTime: number
  topics: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  complexity: 'low' | 'medium' | 'high'
  lastAnalyzedAt: Date
}

export interface ConversationMemory {
  id: string
  content: string
  relevanceScore: number
  timestamp: Date
  context?: Record<string, any>
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreateConversationOptions {
  title?: string
  description?: string
  context?: ConversationContext
  settings?: Partial<ConversationSettings>
}

export interface MessageOptions {
  type?: 'text' | 'voice' | 'image' | 'file' | 'code'
  role?: 'user' | 'assistant' | 'system'
  metadata?: Record<string, any>
}

export interface SearchFilters {
  status?: 'active' | 'archived' | 'deleted'
  createdAfter?: Date
  createdBefore?: Date
  titleContains?: string
  [key: string]: any
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ==================== ENHANCED TYPES ====================

export interface AIProvider {
  id: string
  name: string
  type: 'openai' | 'anthropic' | 'google' | 'azure' | 'local'
  apiKey?: string
  baseUrl?: string
  models: string[]
  capabilities: {
    text: boolean
    voice: boolean
    vision: boolean
    tools: boolean
  }
  isActive: boolean
}

export interface ConversationTemplate {
  id: string
  name: string
  description: string
  category: string
  systemPrompt: string
  userPromptTemplate: string
  settings: Partial<ConversationSettings>
  variables: ConversationTemplateVariable[]
  createdAt: Date
  usageCount: number
}

export interface ConversationTemplateVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect'
  description?: string
  required: boolean
  defaultValue?: any
  options?: string[] // for select/multiselect
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface ConversationWorkflow {
  id: string
  name: string
  description: string
  steps: ConversationWorkflowStep[]
  triggers: ConversationWorkflowTrigger[]
  isActive: boolean
  createdAt: Date
}

export interface ConversationWorkflowStep {
  id: string
  type: 'message' | 'condition' | 'action' | 'delay'
  name: string
  config: Record<string, any>
  nextSteps?: string[]
  conditions?: ConversationCondition[]
}

export interface ConversationWorkflowTrigger {
  type: 'keyword' | 'sentiment' | 'time' | 'user_action'
  value: any
  conditions?: ConversationCondition[]
}

export interface ConversationCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'regex'
  value: any
}

export interface ConversationExport {
  conversationId: string
  format: 'json' | 'markdown' | 'pdf' | 'html'
  includeMetadata: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  filters?: {
    roles?: ('user' | 'assistant' | 'system')[]
    messageTypes?: ('text' | 'voice' | 'image' | 'file' | 'code')[]
  }
}
