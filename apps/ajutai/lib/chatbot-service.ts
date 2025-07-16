// AJUTAI AI Chatbot Service
// Comprehensive chatbot with Azure OpenAI integration, context awareness, and support escalation

import { AzureOpenAIService } from '@codai/azure-openai'
import { z } from 'zod'
import { prisma } from './db'

// Types and Interfaces
interface ChatContext {
  userId?: string
  sessionId: string
  language: string
  conversationHistory: ChatMessage[]
  userProfile?: UserProfile
  currentTopic?: string
  intent?: string
  entities?: Record<string, any>
}

interface ChatMessage {
  id: string
  content: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  timestamp: Date
  metadata?: Record<string, any>
}

interface UserProfile {
  id: string
  name?: string
  email?: string
  language: string
  timezone: string
  previousIssues?: string[]
  preferences?: Record<string, any>
}

interface ChatResponse {
  message: string
  intent?: string
  confidence: number
  suggestedActions?: SuggestedAction[]
  shouldEscalate?: boolean
  referencedArticles?: string[]
  metadata?: Record<string, any>
}

interface SuggestedAction {
  type: 'kb_article' | 'ticket' | 'contact_human' | 'tutorial' | 'documentation'
  title: string
  description: string
  url?: string
  priority: 'low' | 'medium' | 'high'
}

// Validation Schemas
const ChatInputSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().uuid(),
  userId: z.string().optional(),
  language: z.string().default('en'),
  context: z.record(z.any()).optional()
})

const ChatConfigSchema = z.object({
  maxHistoryLength: z.number().default(20),
  escalationThreshold: z.number().default(3),
  confidenceThreshold: z.number().default(0.7),
  enableKnowledgeBase: z.boolean().default(true),
  enableEscalation: z.boolean().default(true)
})

export class AIChatbotService {
  private azureOpenAI: AzureOpenAIService
  private config: z.infer<typeof ChatConfigSchema>

  constructor(config?: Partial<z.infer<typeof ChatConfigSchema>>) {
    this.azureOpenAI = new AzureOpenAIService()
    this.config = ChatConfigSchema.parse(config || {})
  }

  /**
   * Process user message and generate AI response
   */
  async processMessage(input: z.infer<typeof ChatInputSchema>): Promise<ChatResponse> {
    try {
      // Validate input
      const validatedInput = ChatInputSchema.parse(input)

      // Get or create chat session
      let session = await this.getChatSession(validatedInput.sessionId, validatedInput.userId)

      // Build conversation context
      const context = await this.buildContext(session, validatedInput.message)

      // Analyze user intent and entities
      const analysis = await this.analyzeMessage(validatedInput.message, context)

      // Check if knowledge base can answer
      const kbResult = await this.searchKnowledgeBase(validatedInput.message, context)

      // Generate AI response
      const aiResponse = await this.generateResponse(validatedInput.message, context, analysis, kbResult)

      // Save message and response
      await this.saveConversation(session.id, validatedInput.message, aiResponse)

      // Update session analytics
      await this.updateSessionAnalytics(session.id, aiResponse)

      return aiResponse

    } catch (error) {
      console.error('Chat processing error:', error)
      throw new Error(`Failed to process chat message: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get or create chat session
   */
  private async getChatSession(sessionId: string, userId?: string) {
    let session = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: this.config.maxHistoryLength
        },
        user: true
      }
    })

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          sessionId,
          userId,
          language: 'en',
          isActive: true,
          context: {}
        },
        include: {
          messages: true,
          user: true
        }
      })
    }

    return session
  }

  /**
   * Build conversation context from session history
   */
  private async buildContext(session: any, currentMessage: string): Promise<ChatContext> {
    const conversationHistory: ChatMessage[] = session.messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: msg.createdAt,
      metadata: msg.entities
    }))

    return {
      userId: session.userId,
      sessionId: session.sessionId,
      language: session.language || 'en',
      conversationHistory,
      userProfile: session.user ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        language: session.user.language,
        timezone: session.user.timezone
      } : undefined,
      currentTopic: this.extractTopic(conversationHistory, currentMessage),
      intent: await this.detectIntent(currentMessage, conversationHistory),
      entities: await this.extractEntities(currentMessage)
    }
  }

  /**
   * Analyze user message for intent and entities
   */
  private async analyzeMessage(message: string, context: ChatContext) {
    const prompt = `
Analyze this user message for intent and entities in the context of customer support:

Message: "${message}"
Language: ${context.language}
Previous messages: ${context.conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Identify:
1. Primary intent (question, complaint, request, compliment, other)
2. Urgency level (low, medium, high, critical)
3. Emotion (positive, neutral, negative, frustrated, angry)
4. Topic category (technical, billing, account, general, other)
5. Entities (product names, error codes, dates, amounts, etc.)

Respond in JSON format:
{
  "intent": "question|complaint|request|compliment|other",
  "urgency": "low|medium|high|critical",
  "emotion": "positive|neutral|negative|frustrated|angry",
  "category": "technical|billing|account|general|other",
  "entities": {},
  "confidence": 0.0-1.0
}
`

    try {
      const messages = [
        { role: 'system' as const, content: 'You are an expert AI assistant that analyzes user messages for customer support.' },
        { role: 'user' as const, content: prompt }
      ]

      const response = await this.azureOpenAI.generateCompletion(messages, {
        maxTokens: 300,
        temperature: 0.3
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to analyze message')
      }

      return JSON.parse(response.data)
    } catch (error) {
      console.error('Message analysis error:', error)
      return {
        intent: 'other',
        urgency: 'medium',
        emotion: 'neutral',
        category: 'general',
        entities: {},
        confidence: 0.5
      }
    }
  }

  /**
   * Search knowledge base for relevant articles
   */
  private async searchKnowledgeBase(message: string, context: ChatContext) {
    if (!this.config.enableKnowledgeBase) {
      return null
    }

    try {
      // Search published articles
      const articles = await prisma.knowledgeBaseArticle.findMany({
        where: {
          status: 'PUBLISHED',
          language: context.language,
          OR: [
            { title: { contains: message, mode: 'insensitive' } },
            { content: { contains: message, mode: 'insensitive' } },
            { keywords: { hasSome: message.split(' ') } }
          ]
        },
        include: {
          category: true
        },
        take: 5,
        orderBy: {
          views: 'desc'
        }
      })

      if (articles.length === 0) {
        return null
      }

      return {
        articles: articles.map(article => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          url: `/kb/${article.slug}`,
          category: article.category.name,
          relevanceScore: this.calculateRelevance(message, article.content)
        })),
        hasDirectAnswer: this.hasDirectAnswer(message, articles[0]?.content || '')
      }
    } catch (error) {
      console.error('Knowledge base search error:', error)
      return null
    }
  }

  /**
   * Generate AI response using Azure OpenAI
   */
  private async generateResponse(
    message: string,
    context: ChatContext,
    analysis: any,
    kbResult: any
  ): Promise<ChatResponse> {
    const systemPrompt = this.buildSystemPrompt(context, analysis, kbResult)
    const conversationHistory = this.formatConversationHistory(context.conversationHistory)

    const prompt = `${systemPrompt}

Conversation History:
${conversationHistory}

User: ${message}`

    try {
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        {
          role: 'user' as const, content: `Based on this conversation history and context, respond to: ${message}

Conversation History:
${conversationHistory}`
        }
      ]

      const response = await this.azureOpenAI.generateCompletion(messages, {
        maxTokens: 800,
        temperature: 0.7
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate response')
      }

      // Determine if escalation is needed
      const shouldEscalate = this.shouldEscalateToHuman(analysis, context, response.data)

      // Build suggested actions
      const suggestedActions = this.buildSuggestedActions(analysis, kbResult, shouldEscalate)

      return {
        message: response.data,
        intent: analysis.intent,
        confidence: analysis.confidence,
        suggestedActions,
        shouldEscalate,
        referencedArticles: kbResult?.articles?.map((a: any) => a.id) || [],
        metadata: {
          category: analysis.category,
          urgency: analysis.urgency,
          emotion: analysis.emotion,
          processingTime: Date.now()
        }
      }
    } catch (error) {
      console.error('Response generation error:', error)
      return {
        message: 'I apologize, but I\'m experiencing technical difficulties. Let me connect you with a human agent.',
        intent: 'error',
        confidence: 0,
        shouldEscalate: true,
        suggestedActions: [{
          type: 'contact_human',
          title: 'Contact Support',
          description: 'Speak with a human agent',
          priority: 'high'
        }],
        referencedArticles: [],
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  /**
   * Build system prompt for AI assistant
   */
  private buildSystemPrompt(context: ChatContext, analysis: any, kbResult: any): string {
    const userInfo = context.userProfile
      ? `User: ${context.userProfile.name} (${context.userProfile.email})`
      : 'Anonymous user'

    const kbInfo = kbResult?.articles?.length
      ? `\nRelevant Knowledge Base Articles:\n${kbResult.articles.map((a: any) => `- ${a.title}: ${a.excerpt}`).join('\n')}`
      : ''

    return `You are AjutAI, the intelligent support assistant for the Codai ecosystem.

Context:
- ${userInfo}
- Language: ${context.language}
- Topic: ${context.currentTopic || 'General'}
- Intent: ${analysis.intent}
- Urgency: ${analysis.urgency}
- Emotion: ${analysis.emotion}

Guidelines:
1. Be helpful, friendly, and professional
2. Provide accurate information based on the knowledge base
3. If you don't know something, admit it and offer to escalate
4. Use the user's preferred language (${context.language})
5. Be concise but thorough
6. Always prioritize user safety and data privacy

${kbInfo}

Remember: You represent the entire Codai ecosystem (codai.ro, memorai.ro, fabricai.ro, publicai.ro, studiai.ro, sociai.ro, cumparai.ro, bancai.ro, wallet.bancai.ro, x.codai.ro, explorer.codai.ro, kodex.codai.ro, ajutai.ro, legalizai.ro, api.codai.ro, admin.codai.ro, docs.codai.ro, logai.ro, marketai.ro, stocai.ro, analizai.ro, metu.ro).`
  }

  /**
   * Save conversation to database
   */
  private async saveConversation(sessionId: string, userMessage: string, response: ChatResponse): Promise<void> {
    try {
      // Save user message
      await prisma.chatMessage.create({
        data: {
          sessionId,
          content: userMessage,
          role: 'USER',
          metadata: response.metadata
        }
      })

      // Save assistant response
      await prisma.chatMessage.create({
        data: {
          sessionId,
          content: response.message,
          role: 'ASSISTANT',
          metadata: {
            intent: response.intent,
            confidence: response.confidence,
            shouldEscalate: response.shouldEscalate,
            referencedArticles: response.referencedArticles,
            ...response.metadata
          }
        }
      })
    } catch (error) {
      console.error('Error saving conversation:', error)
    }
  }

  /**
   * Update session analytics
   */
  private async updateSessionAnalytics(sessionId: string, response: ChatResponse): Promise<void> {
    try {
      await prisma.chatSession.update({
        where: { sessionId },
        data: {
          messageCount: { increment: 2 }, // user + assistant message
          lastMessageAt: new Date(),
          metadata: {
            lastIntent: response.intent,
            lastConfidence: response.confidence,
            escalationRequested: response.shouldEscalate
          }
        }
      })
    } catch (error) {
      console.error('Error updating session analytics:', error)
    }
  }

  /**
   * Extract topic from conversation
   */
  private extractTopic(conversationHistory: ChatMessage[], currentMessage: string): string {
    const recentMessages = conversationHistory.slice(-5)
    const allText = [...recentMessages.map(m => m.content), currentMessage].join(' ')

    // Simple keyword-based topic extraction
    const topics = {
      'wallet': ['wallet', 'payment', 'money', 'transfer', 'balance'],
      'trading': ['trade', 'buy', 'sell', 'exchange', 'crypto'],
      'technical': ['error', 'bug', 'not working', 'problem', 'issue'],
      'account': ['login', 'password', 'profile', 'account', 'access'],
      'billing': ['bill', 'subscription', 'charge', 'refund', 'payment']
    }

    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => allText.toLowerCase().includes(keyword))) {
        return topic
      }
    }

    return 'general'
  }

  /**
   * Detect user intent
   */
  private async detectIntent(message: string, conversationHistory: ChatMessage[]): Promise<string> {
    const text = message.toLowerCase()

    if (text.includes('help') || text.includes('ajutor')) return 'help_request'
    if (text.includes('how') || text.includes('cum')) return 'how_to'
    if (text.includes('error') || text.includes('problem')) return 'technical_issue'
    if (text.includes('thank') || text.includes('multumesc')) return 'gratitude'
    if (text.includes('?')) return 'question'

    return 'general_inquiry'
  }

  /**
   * Extract entities from message
   */
  private async extractEntities(message: string): Promise<Record<string, any>> {
    const entities: Record<string, any> = {}

    // Simple entity extraction
    const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
    if (emailMatch) entities.email = emailMatch[0]

    const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)\s?(USD|EUR|RON|BTC|ETH)?/i)
    if (amountMatch) {
      entities.amount = {
        value: parseFloat(amountMatch[1]),
        currency: amountMatch[2] || 'USD'
      }
    }

    const urlMatch = message.match(/https?:\/\/[^\s]+/)
    if (urlMatch) entities.url = urlMatch[0]

    return entities
  }

  /**
   * Calculate relevance score for articles
   */
  private calculateRelevance(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(' ')
    const contentWords = content.toLowerCase().split(' ')

    let matches = 0
    for (const word of queryWords) {
      if (word.length > 2 && contentWords.includes(word)) {
        matches++
      }
    }

    return Math.min(matches / queryWords.length, 1)
  }

  /**
   * Check if KB article has direct answer
   */
  private hasDirectAnswer(query: string, content: string): boolean {
    const queryLower = query.toLowerCase()
    const contentLower = content.toLowerCase()

    // Simple heuristic: if query words appear in close proximity
    const queryWords = queryLower.split(' ').filter(w => w.length > 2)
    let foundWords = 0

    for (const word of queryWords) {
      if (contentLower.includes(word)) {
        foundWords++
      }
    }

    return foundWords >= Math.min(queryWords.length * 0.7, 3)
  }

  /**
   * Format conversation history for AI
   */
  private formatConversationHistory(history: ChatMessage[]): string {
    return history
      .slice(-10) // Last 10 messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')
  }

  /**
   * Determine if human escalation is needed
   */
  private shouldEscalateToHuman(analysis: any, context: ChatContext, response: string): boolean {
    // Escalate if urgency is critical
    if (analysis.urgency === 'critical') return true

    // Escalate if user is frustrated/angry
    if (analysis.emotion === 'frustrated' || analysis.emotion === 'angry') return true

    // Escalate if AI confidence is very low
    if (analysis.confidence < 0.3) return true

    // Escalate if response contains uncertainty phrases
    const uncertaintyPhrases = ['i don\'t know', 'not sure', 'unable to help', 'nu știu', 'nu sunt sigur']
    if (uncertaintyPhrases.some(phrase => response.toLowerCase().includes(phrase))) return true

    // Escalate if too many messages in session
    if (context.conversationHistory.length > 15) return true

    return false
  }

  /**
   * Build suggested actions
   */
  private buildSuggestedActions(analysis: any, kbResult: any, shouldEscalate: boolean): SuggestedAction[] {
    const actions: SuggestedAction[] = []

    if (shouldEscalate) {
      actions.push({
        type: 'contact_human',
        title: 'Contact Human Support',
        description: 'Speak with a human agent for personalized assistance',
        priority: 'high'
      })
    }

    if (kbResult?.articles?.length > 0) {
      actions.push({
        type: 'kb_article',
        title: 'Related Articles',
        description: `Found ${kbResult.articles.length} helpful articles`,
        url: `/kb/${kbResult.articles[0].id}`,
        priority: 'medium'
      })
    }

    if (analysis.category === 'technical') {
      actions.push({
        type: 'documentation',
        title: 'Technical Documentation',
        description: 'Browse our comprehensive documentation',
        url: '/docs',
        priority: 'medium'
      })
    }

    if (analysis.intent === 'how_to') {
      actions.push({
        type: 'tutorial',
        title: 'Interactive Tutorial',
        description: 'Follow step-by-step guidance',
        url: '/tutorials',
        priority: 'medium'
      })
    }

    return actions
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string) {
    try {
      const session = await prisma.chatSession.findUnique({
        where: { sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              sender: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        }
      }

      return {
        success: true,
        session: {
          id: session.id,
          sessionId: session.sessionId,
          language: session.language,
          isActive: session.isActive,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          user: session.user,
          context: session.context
        },
        messages: session.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          senderType: msg.senderType,
          messageType: msg.messageType,
          createdAt: msg.createdAt,
          sender: msg.sender,
          metadata: msg.metadata
        }))
      }
    } catch (error) {
      console.error('Get chat history error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get chat history'
      }
    }
  }
}
