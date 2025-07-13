import type { CodaiConfig } from '../types';
import { HttpUtils, ErrorUtils, ValidationUtils } from '../utils';

// Support interfaces for suportai.ro integration
export interface SupportTicket {
  id: string;
  number: string;
  userId: string;
  subject: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'open' | 'pending' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedTeam?: string;
  source: 'web' | 'email' | 'phone' | 'chat' | 'api' | 'mobile';
  tags: string[];
  customFields: Record<string, any>;
  metadata: {
    browser?: string;
    os?: string;
    appVersion?: string;
    userAgent?: string;
    ip?: string;
    location?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
  };
  sla: {
    responseTime: number; // minutes
    resolutionTime: number; // minutes
    breached: boolean;
  };
  satisfaction?: {
    rating: number;
    feedback?: string;
    submittedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  message: string;
  messageType: 'text' | 'html' | 'markdown';
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  isInternal: boolean;
  isPublic: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface SupportAgent {
  id: string;
  userId: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
    title: string;
    department: string;
    bio?: string;
    languages: string[];
    timeZone: string;
  };
  permissions: {
    canViewAllTickets: boolean;
    canAssignTickets: boolean;
    canCloseTickets: boolean;
    canDeleteTickets: boolean;
    canManageAgents: boolean;
    canViewReports: boolean;
    canManageKnowledgeBase: boolean;
  };
  specializations: string[];
  availability: {
    status: 'available' | 'busy' | 'away' | 'offline';
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
    maxConcurrentTickets: number;
  };
  statistics: {
    ticketsResolved: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    customerSatisfaction: number;
    currentWorkload: number;
  };
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  categoryId: string;
  category: string;
  subcategory?: string;
  tags: string[];
  keywords: string[];
  language: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'customers' | 'agents' | 'internal';
  metadata: {
    readingTime: number; // minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    lastReviewed?: Date;
    reviewedBy?: string;
  };
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  statistics: {
    views: number;
    likes: number;
    dislikes: number;
    helpfulVotes: number;
    notHelpfulVotes: number;
  };
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface SupportTeam {
  id: string;
  name: string;
  description?: string;
  type: 'general' | 'technical' | 'billing' | 'sales' | 'escalation';
  agents: string[];
  leadId?: string;
  availability: {
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
    timeZone: string;
  };
  escalationRules: Array<{
    condition: string;
    action: string;
    threshold: number;
    unit: 'minutes' | 'hours' | 'days';
  }>;
  sla: {
    responseTime: number; // minutes
    resolutionTime: number; // minutes
  };
  categories: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportReport {
  id: string;
  type: 'performance' | 'satisfaction' | 'trends' | 'sla' | 'workload';
  name: string;
  description?: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  filters: Record<string, any>;
  data: {
    summary: Record<string, number>;
    details: any[];
    charts: Array<{
      type: 'line' | 'bar' | 'pie' | 'donut' | 'area';
      title: string;
      data: any[];
      config: Record<string, any>;
    }>;
  };
  generatedBy: string;
  generatedAt: Date;
}

export interface LiveChat {
  id: string;
  sessionId: string;
  userId?: string;
  visitorId: string;
  agentId?: string;
  status: 'waiting' | 'active' | 'ended' | 'transferred';
  messages: Array<{
    id: string;
    senderId: string;
    senderType: 'visitor' | 'agent' | 'bot';
    message: string;
    timestamp: Date;
    delivered: boolean;
    read: boolean;
  }>;
  metadata: {
    page: string;
    referrer?: string;
    browser?: string;
    os?: string;
    ip?: string;
    location?: string;
    userAgent?: string;
  };
  startedAt: Date;
  endedAt?: Date;
  transferredTo?: string;
  rating?: {
    score: number;
    feedback?: string;
  };
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  type: 'workflow' | 'macro' | 'trigger' | 'escalation';
  isActive: boolean;
  triggers: Array<{
    event: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  }>;
  actions: Array<{
    type: string;
    parameters: Record<string, any>;
    delay?: number; // seconds
  }>;
  statistics: {
    triggered: number;
    successful: number;
    failed: number;
    lastTriggered?: Date;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Support service for CODAI ecosystem (suportai.ro integration)
export class SupportService {
  private config: CodaiConfig;
  private httpClient: any;

  constructor(config: CodaiConfig) {
    this.config = config;
    this.httpClient = HttpUtils.createHttpClient(
      config.endpoints?.support || 'https://suportai.ro/api'
    );
  }

  // Ticket Management
  /**
   * Create support ticket
   */
  async createTicket(
    ticketData: Omit<SupportTicket, 'id' | 'number' | 'status' | 'sla' | 'createdAt' | 'updatedAt'>
  ): Promise<SupportTicket> {
    try {
      ValidationUtils.validateRequired(ticketData, [
        'userId', 'subject', 'description', 'category', 'priority', 'source'
      ]);

      const response = await this.httpClient.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create ticket',
        'TICKET_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get ticket
   */
  async getTicket(ticketId: string): Promise<SupportTicket> {
    try {
      const response = await this.httpClient.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get ticket',
        'TICKET_GET_FAILED',
        error
      );
    }
  }

  /**
   * Update ticket
   */
  async updateTicket(
    ticketId: string,
    updates: Partial<SupportTicket>
  ): Promise<SupportTicket> {
    try {
      const response = await this.httpClient.patch(`/tickets/${ticketId}`, updates);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update ticket',
        'TICKET_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * List tickets
   */
  async listTickets(options?: {
    userId?: string;
    assignedTo?: string;
    status?: SupportTicket['status'];
    priority?: SupportTicket['priority'];
    category?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'created' | 'updated' | 'priority' | 'status';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    tickets: SupportTicket[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.userId) params.append('userId', options.userId);
      if (options?.assignedTo) params.append('assignedTo', options.assignedTo);
      if (options?.status) params.append('status', options.status);
      if (options?.priority) params.append('priority', options.priority);
      if (options?.category) params.append('category', options.category);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

      const response = await this.httpClient.get(`/tickets?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to list tickets',
        'TICKET_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Assign ticket
   */
  async assignTicket(
    ticketId: string,
    agentId: string,
    teamId?: string
  ): Promise<SupportTicket> {
    try {
      const response = await this.httpClient.post(`/tickets/${ticketId}/assign`, {
        agentId,
        teamId
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to assign ticket',
        'TICKET_ASSIGN_FAILED',
        error
      );
    }
  }

  /**
   * Close ticket
   */
  async closeTicket(
    ticketId: string,
    reason?: string,
    solution?: string
  ): Promise<SupportTicket> {
    try {
      const response = await this.httpClient.post(`/tickets/${ticketId}/close`, {
        reason,
        solution
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to close ticket',
        'TICKET_CLOSE_FAILED',
        error
      );
    }
  }

  // Message Management
  /**
   * Add message to ticket
   */
  async addMessage(
    ticketId: string,
    messageData: Omit<SupportMessage, 'id' | 'ticketId' | 'createdAt'>
  ): Promise<SupportMessage> {
    try {
      ValidationUtils.validateRequired(messageData, [
        'senderId', 'senderType', 'message', 'messageType'
      ]);

      const response = await this.httpClient.post(`/tickets/${ticketId}/messages`, messageData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to add message',
        'MESSAGE_ADD_FAILED',
        error
      );
    }
  }

  /**
   * Get ticket messages
   */
  async getMessages(
    ticketId: string,
    options?: {
      includeInternal?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    messages: SupportMessage[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.includeInternal !== undefined) {
        params.append('includeInternal', options.includeInternal.toString());
      }
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const response = await this.httpClient.get(
        `/tickets/${ticketId}/messages?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get messages',
        'MESSAGE_GET_FAILED',
        error
      );
    }
  }

  // Knowledge Base
  /**
   * Search knowledge base
   */
  async searchKnowledgeBase(
    query: string,
    options?: {
      category?: string;
      language?: string;
      visibility?: KnowledgeBaseArticle['visibility'];
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    articles: KnowledgeBaseArticle[];
    totalCount: number;
    hasMore: boolean;
    suggestions: string[];
  }> {
    try {
      const response = await this.httpClient.post('/knowledge-base/search', {
        query,
        ...options
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to search knowledge base',
        'KB_SEARCH_FAILED',
        error
      );
    }
  }

  /**
   * Get knowledge base article
   */
  async getArticle(articleId: string): Promise<KnowledgeBaseArticle> {
    try {
      const response = await this.httpClient.get(`/knowledge-base/articles/${articleId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get article',
        'ARTICLE_GET_FAILED',
        error
      );
    }
  }

  /**
   * Create knowledge base article
   */
  async createArticle(
    articleData: Omit<KnowledgeBaseArticle, 'id' | 'statistics' | 'createdAt' | 'updatedAt'>
  ): Promise<KnowledgeBaseArticle> {
    try {
      ValidationUtils.validateRequired(articleData, [
        'title', 'content', 'categoryId', 'language', 'authorId'
      ]);

      const response = await this.httpClient.post('/knowledge-base/articles', articleData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create article',
        'ARTICLE_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Rate article helpfulness
   */
  async rateArticle(
    articleId: string,
    helpful: boolean,
    feedback?: string
  ): Promise<void> {
    try {
      await this.httpClient.post(`/knowledge-base/articles/${articleId}/rate`, {
        helpful,
        feedback
      });
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to rate article',
        'ARTICLE_RATE_FAILED',
        error
      );
    }
  }

  // Live Chat
  /**
   * Start live chat session
   */
  async startChat(
    visitorData: {
      userId?: string;
      visitorId: string;
      page: string;
      metadata?: Record<string, any>;
    }
  ): Promise<LiveChat> {
    try {
      ValidationUtils.validateRequired(visitorData, ['visitorId', 'page']);

      const response = await this.httpClient.post('/chat/start', visitorData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to start chat',
        'CHAT_START_FAILED',
        error
      );
    }
  }

  /**
   * Send chat message
   */
  async sendChatMessage(
    chatId: string,
    message: string,
    senderType: 'visitor' | 'agent' | 'bot'
  ): Promise<LiveChat> {
    try {
      const response = await this.httpClient.post(`/chat/${chatId}/messages`, {
        message,
        senderType
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to send chat message',
        'CHAT_MESSAGE_FAILED',
        error
      );
    }
  }

  /**
   * End chat session
   */
  async endChat(
    chatId: string,
    rating?: {
      score: number;
      feedback?: string;
    }
  ): Promise<LiveChat> {
    try {
      const response = await this.httpClient.post(`/chat/${chatId}/end`, { rating });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to end chat',
        'CHAT_END_FAILED',
        error
      );
    }
  }

  // Agent Management
  /**
   * Get agent profile
   */
  async getAgent(agentId: string): Promise<SupportAgent> {
    try {
      const response = await this.httpClient.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get agent',
        'AGENT_GET_FAILED',
        error
      );
    }
  }

  /**
   * Update agent availability
   */
  async updateAgentAvailability(
    agentId: string,
    status: SupportAgent['availability']['status']
  ): Promise<SupportAgent> {
    try {
      const response = await this.httpClient.patch(`/agents/${agentId}/availability`, {
        status
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update agent availability',
        'AGENT_AVAILABILITY_FAILED',
        error
      );
    }
  }

  // Reports and Analytics
  /**
   * Generate support report
   */
  async generateReport(
    reportType: SupportReport['type'],
    timeRange: { start: Date; end: Date },
    filters?: Record<string, any>
  ): Promise<SupportReport> {
    try {
      const response = await this.httpClient.post('/reports', {
        type: reportType,
        timeRange,
        filters
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to generate report',
        'REPORT_GENERATE_FAILED',
        error
      );
    }
  }

  /**
   * Get support metrics
   */
  async getMetrics(
    timeRange: { start: Date; end: Date },
    metrics?: string[]
  ): Promise<{
    tickets: {
      total: number;
      open: number;
      resolved: number;
      averageResolutionTime: number;
    };
    satisfaction: {
      average: number;
      responses: number;
      distribution: Record<string, number>;
    };
    agents: {
      active: number;
      averageResponseTime: number;
      workload: Record<string, number>;
    };
    sla: {
      compliance: number;
      breaches: number;
    };
  }> {
    try {
      const response = await this.httpClient.post('/metrics', {
        timeRange,
        metrics
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get metrics',
        'METRICS_GET_FAILED',
        error
      );
    }
  }

  // Automation
  /**
   * Create automation rule
   */
  async createAutomation(
    automationData: Omit<Automation, 'id' | 'statistics' | 'createdAt' | 'updatedAt'>
  ): Promise<Automation> {
    try {
      ValidationUtils.validateRequired(automationData, [
        'name', 'type', 'triggers', 'actions', 'createdBy'
      ]);

      const response = await this.httpClient.post('/automations', automationData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create automation',
        'AUTOMATION_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get available automation templates
   */
  async getAutomationTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    type: Automation['type'];
    template: Partial<Automation>;
  }>> {
    try {
      const response = await this.httpClient.get('/automations/templates');
      return response.data.templates;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get automation templates',
        'AUTOMATION_TEMPLATES_FAILED',
        error
      );
    }
  }
}
