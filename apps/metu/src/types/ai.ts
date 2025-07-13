// AI Integration Types
export interface AIConfig {
    provider: 'azure-openai' | 'openai' | 'custom'
    model: string
    apiKey: string
    endpoint?: string
    temperature: number
    maxTokens: number
    stream: boolean
    responseStyle: 'conversational' | 'formal' | 'friendly' | 'professional'
    interruptionHandling: 'graceful' | 'immediate' | 'context-aware'
    contextPreservation: boolean
}

export interface ConversationMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: number
    metadata?: {
        voice?: boolean
        interrupted?: boolean
        interruptionContext?: string
        confidence?: number
        processingTime?: number
    }
}

export interface ConversationContext {
    sessionId: string
    messages: ConversationMessage[]
    lastInteraction: number
    interruptionCount: number
    contextSummary: string
    userPreferences: UserPreferences
    currentTopic?: string
    mood?: 'neutral' | 'happy' | 'sad' | 'excited' | 'confused' | 'frustrated'
}

export interface UserPreferences {
    voiceSpeed: number
    voicePitch: number
    responseLength: 'short' | 'medium' | 'long'
    conversationStyle: 'casual' | 'formal' | 'friendly' | 'professional'
    interruptionSensitivity: 'low' | 'medium' | 'high'
    contextMemory: 'session' | 'daily' | 'persistent'
    language: string
    timezone: string
}

export interface InterruptionContext {
    originalMessage: string
    interruptionPoint: number
    userInterruption: string
    contextType: 'clarification' | 'redirection' | 'correction' | 'continuation'
    preservedContext: string
    newDirection: string
}

export interface AIResponse {
    content: string
    confidence: number
    processingTime: number
    tokensUsed: number
    interruptionHandled: boolean
    contextPreserved: boolean
    metadata?: {
        reasoning?: string
        alternatives?: string[]
        mood?: string
        nextActions?: string[]
    }
}

export interface ConversationFlow {
    currentPhase: 'greeting' | 'conversation' | 'clarification' | 'conclusion'
    flowState: 'listening' | 'processing' | 'responding' | 'interrupted'
    contextStack: string[]
    pendingActions: string[]
    interruptionStrategy: 'queue' | 'replace' | 'merge'
}

// AI Service Interface
export interface AIService {
    config: AIConfig
    generateResponse(
        messages: ConversationMessage[],
        context: ConversationContext
    ): Promise<AIResponse>
    handleInterruption(
        interruptionContext: InterruptionContext
    ): Promise<AIResponse>
    streamResponse(
        messages: ConversationMessage[],
        context: ConversationContext,
        onChunk: (chunk: string) => void
    ): Promise<AIResponse>
    updateContext(context: Partial<ConversationContext>): void
    getConversationSummary(messages: ConversationMessage[]): Promise<string>
}

// Memory and Context Management
export interface MemoryStore {
    saveConversation(context: ConversationContext): Promise<void>
    loadConversation(sessionId: string): Promise<ConversationContext | null>
    searchConversations(query: string): Promise<ConversationMessage[]>
    updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void>
    getUserPreferences(): Promise<UserPreferences>
    clearOldSessions(olderThan: number): Promise<void>
}
