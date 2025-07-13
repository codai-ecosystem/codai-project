// Service base interface for compatibility
interface Service {
  getName(): string
  getVersion(): string
  getStatus(): 'running' | 'stopped' | 'error'
  initialize(): Promise<void>
  shutdown(): Promise<void>
  healthCheck(): Promise<boolean>
}

type ServiceStatus = 'running' | 'stopped' | 'error'

// Support Ticket Types
export interface SupportTicket {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'waiting-response' | 'resolved' | 'closed'
  category: 'technical' | 'billing' | 'account' | 'feature-request' | 'bug-report' | 'general'
  userId: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  tags: string[]
  attachments: string[]
  escalationLevel: number
  satisfactionRating?: number
  estimatedResolutionTime?: number
  actualResolutionTime?: number
  metadata: {
    source: 'email' | 'chat' | 'phone' | 'portal' | 'social'
    device?: string
    browser?: string
    os?: string
    location?: string
    customerTier: 'basic' | 'premium' | 'enterprise'
  }
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative'
    urgency: number
    complexity: number
    suggestedCategory: string
    suggestedAssignee?: string
    similarTickets: string[]
    autoResolvable: boolean
    suggestedSolution?: string
  }
}

// Knowledge Base
export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  summary: string
  category: string
  subcategory?: string
  tags: string[]
  status: 'draft' | 'published' | 'archived' | 'under-review'
  author: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  views: number
  helpfulVotes: number
  unhelpfulVotes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: number
  relatedArticles: string[]
  attachments: string[]
  versions: ArticleVersion[]
  aiMetadata: {
    topics: string[]
    keywords: string[]
    readabilityScore: number
    completenessScore: number
    accuracyScore: number
    lastAiReview: string
    suggestedImprovements: string[]
  }
}

export interface ArticleVersion {
  id: string
  version: number
  content: string
  changes: string
  createdBy: string
  createdAt: string
  isActive: boolean
}

// Chat & Communication
export interface ChatSession {
  id: string
  userId: string
  agentId?: string
  type: 'ai-bot' | 'human-agent' | 'escalated'
  status: 'active' | 'waiting' | 'resolved' | 'abandoned'
  startedAt: string
  endedAt?: string
  messages: ChatMessage[]
  satisfaction?: {
    rating: number
    feedback: string
    categories: string[]
  }
  metadata: {
    channel: 'website' | 'mobile' | 'email' | 'social'
    userAgent?: string
    referrer?: string
    sessionDuration?: number
    messagesCount: number
    escalated: boolean
    escalationReason?: string
  }
  aiContext: {
    intent: string
    entities: Record<string, any>
    confidence: number
    suggestedResponses: string[]
    handoffRecommended: boolean
    sentiment: 'positive' | 'neutral' | 'negative'
  }
}

export interface ChatMessage {
  id: string
  sessionId: string
  senderId: string
  senderType: 'user' | 'agent' | 'ai-bot' | 'system'
  content: string
  timestamp: string
  messageType: 'text' | 'image' | 'file' | 'quick-reply' | 'card' | 'system'
  metadata?: {
    attachments?: string[]
    quickReplies?: string[]
    cards?: MessageCard[]
    isEdited?: boolean
    editedAt?: string
  }
  aiProcessing?: {
    intent: string
    entities: Record<string, any>
    confidence: number
    autoResponse?: string
    requiresHuman: boolean
  }
}

export interface MessageCard {
  title: string
  description: string
  imageUrl?: string
  actions: {
    label: string
    action: string
    value: string
  }[]
}

// User Management
export interface SupportUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  company?: string
  role: string
  tier: 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'inactive' | 'blocked'
  preferences: {
    language: string
    timezone: string
    communicationChannel: 'email' | 'chat' | 'phone' | 'sms'
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
  history: {
    totalTickets: number
    resolvedTickets: number
    averageResolutionTime: number
    averageSatisfaction: number
    lastContactDate: string
    totalInteractions: number
  }
  segments: string[]
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
}

// Agent Management
export interface SupportAgent {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'agent' | 'senior-agent' | 'supervisor' | 'admin'
  departments: string[]
  skills: string[]
  languages: string[]
  status: 'available' | 'busy' | 'away' | 'offline'
  workingHours: {
    timezone: string
    schedule: WeeklySchedule
  }
  performance: {
    averageResponseTime: number
    averageResolutionTime: number
    customerSatisfaction: number
    ticketsResolved: number
    activeTickets: number
    ticketCapacity: number
  }
  aiAssistance: {
    enabled: boolean
    suggestions: boolean
    autoResponses: boolean
    escalationAlerts: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface WeeklySchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface DaySchedule {
  start: string // HH:mm
  end: string   // HH:mm
  breaks: { start: string; end: string }[]
  available: boolean
}

// Automation & Workflows
export interface Automation {
  id: string
  name: string
  description: string
  type: 'ticket-routing' | 'auto-response' | 'escalation' | 'notification' | 'workflow'
  status: 'active' | 'inactive' | 'testing'
  triggers: AutomationTrigger[]
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  performance: {
    triggeredCount: number
    successRate: number
    averageExecutionTime: number
    errorRate: number
    lastTriggered?: string
  }
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AutomationTrigger {
  type: 'ticket-created' | 'message-received' | 'status-changed' | 'time-based' | 'escalation'
  conditions: Record<string, any>
}

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater-than' | 'less-than' | 'in' | 'not-in'
  value: any
}

export interface AutomationAction {
  type: 'assign-agent' | 'send-message' | 'update-status' | 'create-task' | 'send-notification'
  parameters: Record<string, any>
}

// Analytics & Reporting
export interface SupportAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  ticketMetrics: {
    totalTickets: number
    openTickets: number
    resolvedTickets: number
    averageResolutionTime: number
    firstResponseTime: number
    customerSatisfaction: number
    ticketsByCategory: Record<string, number>
    ticketsByPriority: Record<string, number>
    ticketsByStatus: Record<string, number>
    escalationRate: number
    reopenRate: number
  }
  agentMetrics: {
    totalAgents: number
    activeAgents: number
    averageResponseTime: number
    averageResolutionTime: number
    agentUtilization: number
    agentSatisfaction: number
    topPerformers: { agentId: string; score: number }[]
  }
  chatMetrics: {
    totalSessions: number
    averageSessionDuration: number
    botResolutionRate: number
    handoffRate: number
    abandonmentRate: number
    customerSatisfaction: number
    messagesPerSession: number
  }
  knowledgeBaseMetrics: {
    totalArticles: number
    articlesViewed: number
    averageRating: number
    searchQueries: number
    searchSuccessRate: number
    topArticles: { articleId: string; views: number }[]
    topSearches: { query: string; count: number }[]
  }
  aiMetrics: {
    automationUsage: number
    aiAccuracy: number
    timesSaved: number
    autoResolutions: number
    escalationsPrevented: number
    suggestionAcceptanceRate: number
  }
}

class AjutAIService implements Service {
  private static instance: AjutAIService
  private tickets: SupportTicket[] = []
  private knowledgeArticles: KnowledgeArticle[] = []
  private chatSessions: ChatSession[] = []
  private users: SupportUser[] = []
  private agents: SupportAgent[] = []
  private automations: Automation[] = []

  private constructor() {
    this.initializeWithMockData()
  }

  public static getInstance(): AjutAIService {
    if (!AjutAIService.instance) {
      AjutAIService.instance = new AjutAIService()
    }
    return AjutAIService.instance
  }

  // Service Implementation
  getName(): string {
    return 'AjutAI'
  }

  getVersion(): string {
    return '1.0.0'
  }

  getStatus(): ServiceStatus {
    return 'running'
  }

  async initialize(): Promise<void> {
    this.initializeWithMockData()
  }

  async shutdown(): Promise<void> {
    // Cleanup logic here
  }

  async healthCheck(): Promise<boolean> {
    return true
  }

  // Ticket Management
  async createTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.tickets.push(newTicket)
    return newTicket
  }

  async getTickets(filters?: {
    status?: SupportTicket['status']
    priority?: SupportTicket['priority']
    category?: SupportTicket['category']
    assignedTo?: string
    userId?: string
  }): Promise<SupportTicket[]> {
    let filtered = [...this.tickets]

    if (filters) {
      if (filters.status) {
        filtered = filtered.filter(ticket => ticket.status === filters.status)
      }
      if (filters.priority) {
        filtered = filtered.filter(ticket => ticket.priority === filters.priority)
      }
      if (filters.category) {
        filtered = filtered.filter(ticket => ticket.category === filters.category)
      }
      if (filters.assignedTo) {
        filtered = filtered.filter(ticket => ticket.assignedTo === filters.assignedTo)
      }
      if (filters.userId) {
        filtered = filtered.filter(ticket => ticket.userId === filters.userId)
      }
    }

    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  async getTicketById(id: string): Promise<SupportTicket | null> {
    return this.tickets.find(ticket => ticket.id === id) || null
  }

  async updateTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | null> {
    const index = this.tickets.findIndex(ticket => ticket.id === id)
    if (index === -1) return null

    this.tickets[index] = {
      ...this.tickets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return this.tickets[index]
  }

  // Knowledge Base Management
  async createArticle(article: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'helpfulVotes' | 'unhelpfulVotes'>): Promise<KnowledgeArticle> {
    const newArticle: KnowledgeArticle = {
      ...article,
      id: `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    }

    this.knowledgeArticles.push(newArticle)
    return newArticle
  }

  async getArticles(filters?: {
    category?: string
    status?: KnowledgeArticle['status']
    difficulty?: KnowledgeArticle['difficulty']
    search?: string
  }): Promise<KnowledgeArticle[]> {
    let filtered = [...this.knowledgeArticles]

    if (filters) {
      if (filters.category) {
        filtered = filtered.filter(article => article.category === filters.category)
      }
      if (filters.status) {
        filtered = filtered.filter(article => article.status === filters.status)
      }
      if (filters.difficulty) {
        filtered = filtered.filter(article => article.difficulty === filters.difficulty)
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(article =>
          article.title.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }
    }

    return filtered.sort((a, b) => b.views - a.views)
  }

  async getArticleById(id: string): Promise<KnowledgeArticle | null> {
    const article = this.knowledgeArticles.find(article => article.id === id)
    if (article) {
      // Increment view count
      article.views++
    }
    return article || null
  }

  // Chat Management
  async createChatSession(session: Omit<ChatSession, 'id' | 'startedAt' | 'messages'>): Promise<ChatSession> {
    const newSession: ChatSession = {
      ...session,
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startedAt: new Date().toISOString(),
      messages: []
    }

    this.chatSessions.push(newSession)
    return newSession
  }

  async getChatSessions(filters?: {
    userId?: string
    agentId?: string
    status?: ChatSession['status']
    type?: ChatSession['type']
  }): Promise<ChatSession[]> {
    let filtered = [...this.chatSessions]

    if (filters) {
      if (filters.userId) {
        filtered = filtered.filter(session => session.userId === filters.userId)
      }
      if (filters.agentId) {
        filtered = filtered.filter(session => session.agentId === filters.agentId)
      }
      if (filters.status) {
        filtered = filtered.filter(session => session.status === filters.status)
      }
      if (filters.type) {
        filtered = filtered.filter(session => session.type === filters.type)
      }
    }

    return filtered.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  }

  async addMessageToSession(sessionId: string, message: Omit<ChatMessage, 'id' | 'sessionId' | 'timestamp'>): Promise<ChatMessage | null> {
    const session = this.chatSessions.find(s => s.id === sessionId)
    if (!session) return null

    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      timestamp: new Date().toISOString()
    }

    session.messages.push(newMessage)
    session.metadata.messagesCount = session.messages.length

    return newMessage
  }

  // User Management
  async getUsers(filters?: {
    tier?: SupportUser['tier']
    status?: SupportUser['status']
    segment?: string
  }): Promise<SupportUser[]> {
    let filtered = [...this.users]

    if (filters) {
      if (filters.tier) {
        filtered = filtered.filter(user => user.tier === filters.tier)
      }
      if (filters.status) {
        filtered = filtered.filter(user => user.status === filters.status)
      }
      if (filters.segment) {
        filtered = filtered.filter(user => user.segments.includes(filters.segment!))
      }
    }

    return filtered.sort((a, b) => a.firstName.localeCompare(b.firstName))
  }

  async getUserById(id: string): Promise<SupportUser | null> {
    return this.users.find(user => user.id === id) || null
  }

  // Agent Management
  async getAgents(filters?: {
    department?: string
    status?: SupportAgent['status']
    role?: SupportAgent['role']
  }): Promise<SupportAgent[]> {
    let filtered = [...this.agents]

    if (filters) {
      if (filters.department) {
        filtered = filtered.filter(agent => agent.departments.includes(filters.department!))
      }
      if (filters.status) {
        filtered = filtered.filter(agent => agent.status === filters.status)
      }
      if (filters.role) {
        filtered = filtered.filter(agent => agent.role === filters.role)
      }
    }

    return filtered.sort((a, b) => a.firstName.localeCompare(b.firstName))
  }

  async getAgentById(id: string): Promise<SupportAgent | null> {
    return this.agents.find(agent => agent.id === id) || null
  }

  // AI-Powered Features
  async analyzeTicket(ticketId: string): Promise<SupportTicket['aiAnalysis'] | null> {
    const ticket = await this.getTicketById(ticketId)
    if (!ticket) return null

    // Mock AI analysis
    const analysis: SupportTicket['aiAnalysis'] = {
      sentiment: Math.random() > 0.7 ? 'negative' : Math.random() > 0.5 ? 'neutral' : 'positive',
      urgency: Math.floor(Math.random() * 100),
      complexity: Math.floor(Math.random() * 100),
      suggestedCategory: ticket.category,
      similarTickets: this.tickets.filter(t => t.category === ticket.category && t.id !== ticket.id).slice(0, 3).map(t => t.id),
      autoResolvable: Math.random() > 0.8,
      suggestedSolution: 'Based on similar tickets, try restarting the application and clearing cache.'
    }

    // Update ticket with analysis
    await this.updateTicket(ticketId, { aiAnalysis: analysis })

    return analysis
  }

  async suggestResponse(sessionId: string, userMessage: string): Promise<string[]> {
    // Mock AI response suggestions
    const suggestions = [
      "I understand your concern. Let me help you with that.",
      "Thank you for contacting us. I'll look into this issue right away.",
      "I can see why this would be frustrating. Here's what we can do...",
      "Let me check our knowledge base for the best solution.",
      "I'd be happy to escalate this to our technical team for you."
    ]

    return suggestions.slice(0, Math.floor(Math.random() * 3) + 1)
  }

  // Analytics
  async getAnalytics(period: SupportAnalytics['period'] = 'month'): Promise<SupportAnalytics> {
    const now = new Date()
    const periodStart = this.getPeriodStart(now, period)

    const ticketsInPeriod = this.tickets.filter(ticket =>
      new Date(ticket.createdAt) >= periodStart
    )

    const sessionsInPeriod = this.chatSessions.filter(session =>
      new Date(session.startedAt) >= periodStart
    )

    return {
      period,
      ticketMetrics: {
        totalTickets: this.tickets.length,
        openTickets: this.tickets.filter(t => ['open', 'in-progress'].includes(t.status)).length,
        resolvedTickets: this.tickets.filter(t => t.status === 'resolved').length,
        averageResolutionTime: 24, // hours
        firstResponseTime: 2.5, // hours
        customerSatisfaction: 4.3,
        ticketsByCategory: this.groupBy(this.tickets, 'category'),
        ticketsByPriority: this.groupBy(this.tickets, 'priority'),
        ticketsByStatus: this.groupBy(this.tickets, 'status'),
        escalationRate: 12.5,
        reopenRate: 3.2
      },
      agentMetrics: {
        totalAgents: this.agents.length,
        activeAgents: this.agents.filter(a => a.status === 'available').length,
        averageResponseTime: 15, // minutes
        averageResolutionTime: 4.2, // hours
        agentUtilization: 78.5,
        agentSatisfaction: 4.1,
        topPerformers: this.agents.slice(0, 5).map(agent => ({
          agentId: agent.id,
          score: agent.performance.customerSatisfaction
        }))
      },
      chatMetrics: {
        totalSessions: this.chatSessions.length,
        averageSessionDuration: 8.5, // minutes
        botResolutionRate: 67.3,
        handoffRate: 18.7,
        abandonmentRate: 14.2,
        customerSatisfaction: 4.2,
        messagesPerSession: 12.3
      },
      knowledgeBaseMetrics: {
        totalArticles: this.knowledgeArticles.length,
        articlesViewed: this.knowledgeArticles.reduce((sum, article) => sum + article.views, 0),
        averageRating: 4.1,
        searchQueries: 15420,
        searchSuccessRate: 73.8,
        topArticles: this.knowledgeArticles
          .sort((a, b) => b.views - a.views)
          .slice(0, 5)
          .map(article => ({ articleId: article.id, views: article.views })),
        topSearches: [
          { query: 'password reset', count: 1245 },
          { query: 'billing issues', count: 987 },
          { query: 'account setup', count: 756 }
        ]
      },
      aiMetrics: {
        automationUsage: 85.3,
        aiAccuracy: 91.7,
        timesSaved: 1420, // hours
        autoResolutions: 2340,
        escalationsPrevented: 567,
        suggestionAcceptanceRate: 72.4
      }
    }
  }

  // Helper Methods
  private initializeWithMockData(): void {
    // Mock Support Tickets
    this.tickets = [
      {
        id: 'ticket_001',
        title: 'Unable to login to account',
        description: 'I cannot log into my account even with the correct credentials. Getting "Invalid credentials" error.',
        priority: 'high',
        status: 'in-progress',
        category: 'account',
        userId: 'user_001',
        assignedTo: 'agent_001',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T14:45:00Z',
        tags: ['login', 'credentials', 'error'],
        attachments: ['screenshot_error.png'],
        escalationLevel: 0,
        estimatedResolutionTime: 4,
        metadata: {
          source: 'email',
          device: 'Desktop',
          browser: 'Chrome',
          os: 'Windows 10',
          location: 'New York, US',
          customerTier: 'premium'
        },
        aiAnalysis: {
          sentiment: 'negative',
          urgency: 75,
          complexity: 60,
          suggestedCategory: 'account',
          suggestedAssignee: 'agent_001',
          similarTickets: ['ticket_045', 'ticket_078'],
          autoResolvable: false,
          suggestedSolution: 'Check account status and password reset options'
        }
      },
      {
        id: 'ticket_002',
        title: 'Feature request: Dark mode',
        description: 'Would love to see a dark mode option for the application interface.',
        priority: 'low',
        status: 'open',
        category: 'feature-request',
        userId: 'user_002',
        createdAt: '2024-01-14T16:20:00Z',
        updatedAt: '2024-01-14T16:20:00Z',
        tags: ['dark-mode', 'ui', 'enhancement'],
        attachments: [],
        escalationLevel: 0,
        metadata: {
          source: 'portal',
          device: 'Mobile',
          customerTier: 'basic'
        }
      }
    ]

    // Mock Knowledge Articles
    this.knowledgeArticles = [
      {
        id: 'article_001',
        title: 'How to Reset Your Password',
        content: 'To reset your password, follow these steps...',
        summary: 'Step-by-step guide for password reset',
        category: 'Account Management',
        subcategory: 'Authentication',
        tags: ['password', 'reset', 'login', 'security'],
        status: 'published',
        author: 'support_team',
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-12T00:00:00Z',
        publishedAt: '2024-01-10T00:00:00Z',
        views: 2543,
        helpfulVotes: 234,
        unhelpfulVotes: 12,
        difficulty: 'beginner',
        estimatedReadTime: 3,
        relatedArticles: ['article_002', 'article_003'],
        attachments: ['password_reset_flow.png'],
        versions: [],
        aiMetadata: {
          topics: ['authentication', 'security', 'troubleshooting'],
          keywords: ['password', 'reset', 'login', 'credentials'],
          readabilityScore: 85,
          completenessScore: 92,
          accuracyScore: 98,
          lastAiReview: '2024-01-12T00:00:00Z',
          suggestedImprovements: ['Add video tutorial', 'Include mobile app instructions']
        }
      }
    ]

    // Mock Users
    this.users = [
      {
        id: 'user_001',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0123',
        company: 'Tech Corp',
        role: 'Developer',
        tier: 'premium',
        status: 'active',
        preferences: {
          language: 'en',
          timezone: 'America/New_York',
          communicationChannel: 'email',
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        },
        history: {
          totalTickets: 8,
          resolvedTickets: 6,
          averageResolutionTime: 18,
          averageSatisfaction: 4.2,
          lastContactDate: '2024-01-15T10:30:00Z',
          totalInteractions: 24
        },
        segments: ['power-user', 'developer'],
        customFields: {},
        createdAt: '2023-06-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ]

    // Mock Agents
    this.agents = [
      {
        id: 'agent_001',
        email: 'sarah.support@company.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'senior-agent',
        departments: ['Technical Support', 'Account Management'],
        skills: ['troubleshooting', 'billing', 'technical'],
        languages: ['en', 'es'],
        status: 'available',
        workingHours: {
          timezone: 'America/New_York',
          schedule: {
            monday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }], available: true },
            tuesday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }], available: true },
            wednesday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }], available: true },
            thursday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }], available: true },
            friday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }], available: true },
            saturday: { start: '00:00', end: '00:00', breaks: [], available: false },
            sunday: { start: '00:00', end: '00:00', breaks: [], available: false }
          }
        },
        performance: {
          averageResponseTime: 12, // minutes
          averageResolutionTime: 3.5, // hours
          customerSatisfaction: 4.7,
          ticketsResolved: 156,
          activeTickets: 8,
          ticketCapacity: 15
        },
        aiAssistance: {
          enabled: true,
          suggestions: true,
          autoResponses: false,
          escalationAlerts: true
        },
        createdAt: '2023-03-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ]

    // Mock Chat Sessions
    this.chatSessions = [
      {
        id: 'chat_001',
        userId: 'user_001',
        agentId: 'agent_001',
        type: 'human-agent',
        status: 'resolved',
        startedAt: '2024-01-15T14:30:00Z',
        endedAt: '2024-01-15T15:45:00Z',
        messages: [],
        satisfaction: {
          rating: 5,
          feedback: 'Very helpful and quick response!',
          categories: ['helpful', 'knowledgeable', 'quick']
        },
        metadata: {
          channel: 'website',
          userAgent: 'Mozilla/5.0...',
          sessionDuration: 75,
          messagesCount: 12,
          escalated: false
        },
        aiContext: {
          intent: 'account_support',
          entities: { accountId: 'acc_123', issueType: 'login' },
          confidence: 0.92,
          suggestedResponses: [],
          handoffRecommended: false,
          sentiment: 'positive'
        }
      }
    ]
  }

  private getPeriodStart(date: Date, period: SupportAnalytics['period']): Date {
    const result = new Date(date)
    switch (period) {
      case 'day':
        result.setHours(0, 0, 0, 0)
        break
      case 'week':
        result.setDate(date.getDate() - date.getDay())
        result.setHours(0, 0, 0, 0)
        break
      case 'month':
        result.setDate(1)
        result.setHours(0, 0, 0, 0)
        break
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3)
        result.setMonth(quarter * 3, 1)
        result.setHours(0, 0, 0, 0)
        break
      case 'year':
        result.setMonth(0, 1)
        result.setHours(0, 0, 0, 0)
        break
    }
    return result
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = String(item[key])
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export default AjutAIService
