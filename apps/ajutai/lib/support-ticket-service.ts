// AJUTAI Support Ticketing Service
// Comprehensive support ticket management with SLA tracking and AI integration

import { prisma } from './db'
import { AzureOpenAIService } from '@codai/azure-openai'
import { z } from 'zod'

// Validation Schemas
const CreateTicketSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  userId: z.string().uuid(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional()
})

const UpdateTicketSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assigneeId: z.string().uuid().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  resolutionSummary: z.string().optional()
})

const AddMessageSchema = z.object({
  ticketId: z.string().uuid(),
  senderId: z.string().uuid(),
  senderType: z.enum(['USER', 'AGENT', 'SYSTEM']),
  content: z.string().min(1),
  messageType: z.enum(['TEXT', 'INTERNAL_NOTE', 'RESOLUTION', 'ESCALATION']).default('TEXT'),
  attachments: z.array(z.string()).optional()
})

const SearchTicketsSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assigneeId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'dueDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Interfaces
interface TicketAnalysis {
  urgency: 'low' | 'medium' | 'high' | 'critical'
  category: string
  sentiment: 'positive' | 'neutral' | 'negative'
  complexity: number // 1-5 scale
  estimatedResolutionTime: number // in hours
  suggestedActions: string[]
  similarTickets: string[]
  tags: string[]
}

interface SLAMetrics {
  firstResponseDue: Date
  resolutionDue: Date
  isFirstResponseOverdue: boolean
  isResolutionOverdue: boolean
  responseTimeRemaining: number // in hours
  resolutionTimeRemaining: number // in hours
}

interface TicketMetrics {
  totalTickets: number
  openTickets: number
  avgResolutionTime: number
  firstResponseRate: number
  resolutionRate: number
  customerSatisfaction: number
  agentWorkload: { [agentId: string]: number }
  categoryDistribution: { [category: string]: number }
}

export class SupportTicketService {
  private azureOpenAI: AzureOpenAIService

  // SLA Configuration (in hours)
  private slaConfig = {
    firstResponse: {
      LOW: 24,
      MEDIUM: 8,
      HIGH: 4,
      CRITICAL: 1
    },
    resolution: {
      LOW: 72,
      MEDIUM: 24,
      HIGH: 8,
      CRITICAL: 4
    }
  }

  constructor() {
    this.azureOpenAI = new AzureOpenAIService()
  }

  /**
   * Create a new support ticket with AI analysis
   */
  async createTicket(data: z.infer<typeof CreateTicketSchema>) {
    try {
      const validatedData = CreateTicketSchema.parse(data)

      // Analyze ticket content using AI
      const analysis = await this.analyzeTicketContent(
        validatedData.title,
        validatedData.description
      )

      // Auto-adjust priority based on AI analysis if needed
      const finalPriority = this.determineFinalPriority(validatedData.priority, analysis.urgency)

      // Calculate SLA deadlines
      const slaMetrics = this.calculateSLAMetrics(finalPriority)

      // Find similar tickets for context
      const similarTickets = await this.findSimilarTickets(
        validatedData.title,
        validatedData.description
      )

      // Auto-assign agent based on workload and expertise
      const assigneeId = await this.autoAssignAgent(analysis.category, finalPriority)

      // Create the ticket
      const ticket = await prisma.ticket.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          userId: validatedData.userId,
          assigneeId,
          priority: finalPriority,
          status: 'OPEN',
          category: analysis.category,
          tags: [...(validatedData.tags || []), ...analysis.tags],
          aiAnalysis: JSON.stringify(analysis),
          firstResponseDue: slaMetrics.firstResponseDue,
          resolutionDue: slaMetrics.resolutionDue,
          estimatedResolutionTime: analysis.estimatedResolutionTime,
          sentiment: analysis.sentiment,
          complexityScore: analysis.complexity
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          assignee: {
            select: { id: true, name: true, email: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      })

      // Add initial system message
      await this.addMessage({
        ticketId: ticket.id,
        senderId: 'system',
        senderType: 'SYSTEM',
        content: `Ticket created and assigned to ${ticket.assignee?.name || 'support team'}. Priority: ${finalPriority}. Estimated resolution: ${analysis.estimatedResolutionTime} hours.`,
        messageType: 'TEXT'
      })

      // Send notifications
      await this.sendTicketNotifications(ticket, 'created')

      return {
        success: true,
        ticket,
        analysis,
        similarTickets,
        slaMetrics: this.calculateSLAMetrics(finalPriority, ticket.createdAt)
      }
    } catch (error) {
      console.error('Create ticket error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create ticket'
      }
    }
  }

  /**
   * Update an existing ticket
   */
  async updateTicket(id: string, data: z.infer<typeof UpdateTicketSchema>) {
    try {
      const validatedData = UpdateTicketSchema.parse(data)

      const existingTicket = await prisma.ticket.findUnique({
        where: { id },
        include: { user: true, assignee: true }
      })

      if (!existingTicket) {
        throw new Error('Ticket not found')
      }

      // Re-analyze if description changed
      let analysis: TicketAnalysis | null = null
      if (validatedData.description || validatedData.title) {
        const newTitle = validatedData.title || existingTicket.title
        const newDescription = validatedData.description || existingTicket.description
        analysis = await this.analyzeTicketContent(newTitle, newDescription)
      }

      // Update SLA metrics if priority changed
      let slaUpdate = {}
      if (validatedData.priority && validatedData.priority !== existingTicket.priority) {
        const slaMetrics = this.calculateSLAMetrics(validatedData.priority, existingTicket.createdAt)
        slaUpdate = {
          firstResponseDue: slaMetrics.firstResponseDue,
          resolutionDue: slaMetrics.resolutionDue
        }
      }

      const updateData: any = {
        ...validatedData,
        ...slaUpdate
      }

      if (analysis) {
        updateData.aiAnalysis = JSON.stringify(analysis)
        updateData.estimatedResolutionTime = analysis.estimatedResolutionTime
        updateData.sentiment = analysis.sentiment
        updateData.complexityScore = analysis.complexity
        if (!validatedData.tags) {
          updateData.tags = analysis.tags
        }
      }

      // Set resolution timestamp if status changed to RESOLVED
      if (validatedData.status === 'RESOLVED' && existingTicket.status !== 'RESOLVED') {
        updateData.resolvedAt = new Date()
      }

      const ticket = await prisma.ticket.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          assignee: {
            select: { id: true, name: true, email: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })

      // Add system message for significant changes
      if (validatedData.status || validatedData.assigneeId || validatedData.priority) {
        const changes: string[] = []
        if (validatedData.status) changes.push(`Status: ${validatedData.status}`)
        if (validatedData.assigneeId) changes.push(`Assigned to: ${ticket.assignee?.name || 'Unassigned'}`)
        if (validatedData.priority) changes.push(`Priority: ${validatedData.priority}`)

        await this.addMessage({
          ticketId: id,
          senderId: 'system',
          senderType: 'SYSTEM',
          content: `Ticket updated: ${changes.join(', ')}`,
          messageType: 'TEXT'
        })
      }

      // Send notifications for status changes
      if (validatedData.status) {
        await this.sendTicketNotifications(ticket, 'updated')
      }

      return {
        success: true,
        ticket,
        analysis
      }
    } catch (error) {
      console.error('Update ticket error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update ticket'
      }
    }
  }

  /**
   * Add a message to a ticket
   */
  async addMessage(data: z.infer<typeof AddMessageSchema>) {
    try {
      const validatedData = AddMessageSchema.parse(data)

      const message = await prisma.ticketMessage.create({
        data: validatedData,
        include: {
          sender: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      // Update ticket's lastActivity timestamp
      await prisma.ticket.update({
        where: { id: validatedData.ticketId },
        data: { updatedAt: new Date() }
      })

      // If this is the first agent response, mark first response time
      if (validatedData.senderType === 'AGENT') {
        const ticket = await prisma.ticket.findUnique({
          where: { id: validatedData.ticketId }
        })

        if (ticket && !ticket.firstResponseAt) {
          await prisma.ticket.update({
            where: { id: validatedData.ticketId },
            data: { firstResponseAt: new Date() }
          })
        }
      }

      // Analyze message sentiment for escalation detection
      if (validatedData.senderType === 'USER') {
        const sentimentAnalysis = await this.analyzeSentiment(validatedData.content)
        if (sentimentAnalysis.escalationNeeded) {
          await this.escalateTicket(validatedData.ticketId, sentimentAnalysis.reason)
        }
      }

      return { success: true, message }
    } catch (error) {
      console.error('Add message error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add message'
      }
    }
  }

  /**
   * Search tickets with advanced filtering
   */
  async searchTickets(params: z.infer<typeof SearchTicketsSchema>) {
    try {
      const validatedParams = SearchTicketsSchema.parse(params)

      const whereClause: any = {}

      // Apply filters
      if (validatedParams.status) whereClause.status = validatedParams.status
      if (validatedParams.priority) whereClause.priority = validatedParams.priority
      if (validatedParams.assigneeId) whereClause.assigneeId = validatedParams.assigneeId
      if (validatedParams.userId) whereClause.userId = validatedParams.userId
      if (validatedParams.category) whereClause.category = validatedParams.category

      if (validatedParams.tags && validatedParams.tags.length > 0) {
        whereClause.tags = { hasSome: validatedParams.tags }
      }

      if (validatedParams.dateFrom || validatedParams.dateTo) {
        whereClause.createdAt = {}
        if (validatedParams.dateFrom) {
          whereClause.createdAt.gte = new Date(validatedParams.dateFrom)
        }
        if (validatedParams.dateTo) {
          whereClause.createdAt.lte = new Date(validatedParams.dateTo)
        }
      }

      // Text search
      if (validatedParams.query) {
        whereClause.OR = [
          { title: { contains: validatedParams.query, mode: 'insensitive' } },
          { description: { contains: validatedParams.query, mode: 'insensitive' } }
        ]
      }

      // Get tickets with pagination
      const [tickets, totalCount] = await Promise.all([
        prisma.ticket.findMany({
          where: whereClause,
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            assignee: {
              select: { id: true, name: true, email: true }
            },
            _count: {
              select: { messages: true }
            }
          },
          orderBy: { [validatedParams.sortBy]: validatedParams.sortOrder },
          take: validatedParams.limit,
          skip: validatedParams.offset
        }),
        prisma.ticket.count({ where: whereClause })
      ])

      // Add SLA status to each ticket
      const ticketsWithSLA = tickets.map(ticket => ({
        ...ticket,
        slaMetrics: this.calculateSLAMetrics(ticket.priority, ticket.createdAt, ticket.firstResponseAt, ticket.resolvedAt)
      }))

      return {
        tickets: ticketsWithSLA,
        totalCount,
        facets: await this.getTicketFacets(whereClause)
      }
    } catch (error) {
      console.error('Search tickets error:', error)
      return {
        tickets: [],
        totalCount: 0,
        facets: { statuses: [], priorities: [], categories: [], assignees: [] }
      }
    }
  }

  /**
   * Get comprehensive ticket metrics and analytics
   */
  async getTicketMetrics(filters?: { dateFrom?: string; dateTo?: string; assigneeId?: string }): Promise<TicketMetrics> {
    try {
      const whereClause: any = {}

      if (filters?.dateFrom || filters?.dateTo) {
        whereClause.createdAt = {}
        if (filters.dateFrom) whereClause.createdAt.gte = new Date(filters.dateFrom)
        if (filters.dateTo) whereClause.createdAt.lte = new Date(filters.dateTo)
      }

      if (filters?.assigneeId) {
        whereClause.assigneeId = filters.assigneeId
      }

      const [
        totalTickets,
        openTickets,
        resolvedTickets,
        avgResolutionData,
        firstResponseData,
        agentWorkloadData,
        categoryData
      ] = await Promise.all([
        prisma.ticket.count({ where: whereClause }),
        prisma.ticket.count({ where: { ...whereClause, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
        prisma.ticket.findMany({
          where: { ...whereClause, status: 'RESOLVED', resolvedAt: { not: null } },
          select: { createdAt: true, resolvedAt: true }
        }),
        prisma.ticket.findMany({
          where: { ...whereClause, status: 'RESOLVED', resolvedAt: { not: null } },
          select: { createdAt: true, resolvedAt: true }
        }),
        prisma.ticket.findMany({
          where: { ...whereClause, firstResponseAt: { not: null } },
          select: { createdAt: true, firstResponseAt: true, firstResponseDue: true }
        }),
        prisma.ticket.groupBy({
          by: ['assigneeId'],
          where: whereClause,
          _count: { assigneeId: true }
        }),
        prisma.ticket.groupBy({
          by: ['category'],
          where: whereClause,
          _count: { category: true }
        })
      ])

      // Calculate average resolution time
      const avgResolutionTime = resolvedTickets.length > 0
        ? resolvedTickets.reduce((sum, ticket) => {
            const resolutionTime = (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60)
            return sum + resolutionTime
          }, 0) / resolvedTickets.length
        : 0

      // Calculate first response rate
      const firstResponseRate = firstResponseData.length > 0
        ? firstResponseData.filter(ticket => 
            ticket.firstResponseAt! <= ticket.firstResponseDue
          ).length / firstResponseData.length
        : 0

      // Calculate resolution rate
      const resolutionRate = totalTickets > 0 ? resolvedTickets.length / totalTickets : 0

      // Agent workload
      const agentWorkload: { [agentId: string]: number } = {}
      agentWorkloadData.forEach(data => {
        if (data.assigneeId) {
          agentWorkload[data.assigneeId] = data._count.assigneeId
        }
      })

      // Category distribution
      const categoryDistribution: { [category: string]: number } = {}
      categoryData.forEach(data => {
        if (data.category) {
          categoryDistribution[data.category] = data._count.category
        }
      })

      return {
        totalTickets,
        openTickets,
        avgResolutionTime,
        firstResponseRate,
        resolutionRate,
        customerSatisfaction: 0.85, // This would come from surveys/feedback
        agentWorkload,
        categoryDistribution
      }
    } catch (error) {
      console.error('Get ticket metrics error:', error)
      return {
        totalTickets: 0,
        openTickets: 0,
        avgResolutionTime: 0,
        firstResponseRate: 0,
        resolutionRate: 0,
        customerSatisfaction: 0,
        agentWorkload: {},
        categoryDistribution: {}
      }
    }
  }

  /**
   * Analyze ticket content using AI
   */
  private async analyzeTicketContent(title: string, description: string): Promise<TicketAnalysis> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: 'You are an expert support ticket analyzer. Analyze tickets for urgency, category, sentiment, and provide actionable insights.'
        },
        {
          role: 'user' as const,
          content: `Analyze this support ticket and provide detailed analysis:

Title: ${title}
Description: ${description}

Provide analysis in JSON format:
{
  "urgency": "low|medium|high|critical",
  "category": "technical|billing|account|feature_request|bug|other",
  "sentiment": "positive|neutral|negative",
  "complexity": 1-5,
  "estimatedResolutionTime": number_in_hours,
  "suggestedActions": ["action1", "action2"],
  "similarTickets": ["search_term1", "search_term2"],
  "tags": ["tag1", "tag2"]
}`
        }
      ]

      const response = await this.azureOpenAI.generateCompletion(messages, {
        maxTokens: 400,
        temperature: 0.2
      })

      if (!response.success || !response.data) {
        throw new Error('Failed to analyze ticket')
      }

      return JSON.parse(response.data)
    } catch (error) {
      console.error('Ticket analysis error:', error)
      // Return default analysis
      return {
        urgency: 'medium',
        category: 'general',
        sentiment: 'neutral',
        complexity: 3,
        estimatedResolutionTime: 24,
        suggestedActions: ['review_ticket', 'assign_agent'],
        similarTickets: [],
        tags: ['general']
      }
    }
  }

  /**
   * Calculate SLA metrics for a ticket
   */
  private calculateSLAMetrics(
    priority: string,
    createdAt?: Date,
    firstResponseAt?: Date | null,
    resolvedAt?: Date | null
  ): SLAMetrics {
    const now = new Date()
    const created = createdAt || now

    const firstResponseHours = this.slaConfig.firstResponse[priority as keyof typeof this.slaConfig.firstResponse]
    const resolutionHours = this.slaConfig.resolution[priority as keyof typeof this.slaConfig.resolution]

    const firstResponseDue = new Date(created.getTime() + (firstResponseHours * 60 * 60 * 1000))
    const resolutionDue = new Date(created.getTime() + (resolutionHours * 60 * 60 * 1000))

    const isFirstResponseOverdue = !firstResponseAt && now > firstResponseDue
    const isResolutionOverdue = !resolvedAt && now > resolutionDue

    const responseTimeRemaining = firstResponseAt 
      ? 0 
      : Math.max(0, (firstResponseDue.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    const resolutionTimeRemaining = resolvedAt 
      ? 0 
      : Math.max(0, (resolutionDue.getTime() - now.getTime()) / (1000 * 60 * 60))

    return {
      firstResponseDue,
      resolutionDue,
      isFirstResponseOverdue,
      isResolutionOverdue,
      responseTimeRemaining,
      resolutionTimeRemaining
    }
  }

  /**
   * Find similar tickets using AI-powered search
   */
  private async findSimilarTickets(title: string, description: string): Promise<string[]> {
    try {
      // This would typically use vector similarity search
      // For now, we'll use a simple text-based approach
      const keywords = [...title.split(' '), ...description.split(' ')]
        .filter(word => word.length > 3)
        .slice(0, 10)

      const similarTickets = await prisma.ticket.findMany({
        where: {
          OR: keywords.map(keyword => ({
            OR: [
              { title: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } }
            ]
          }))
        },
        select: { id: true, title: true },
        take: 5
      })

      return similarTickets.map(ticket => ticket.id)
    } catch (error) {
      console.error('Find similar tickets error:', error)
      return []
    }
  }

  /**
   * Auto-assign agent based on workload and expertise
   */
  private async autoAssignAgent(category: string, priority: string): Promise<string | null> {
    try {
      // Get agents with current workload
      const agentWorkload = await prisma.ticket.groupBy({
        by: ['assigneeId'],
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          assigneeId: { not: null }
        },
        _count: { assigneeId: true }
      })

      // This would typically query a User table with agent roles
      // For now, return null to indicate manual assignment needed
      return null
    } catch (error) {
      console.error('Auto assign agent error:', error)
      return null
    }
  }

  /**
   * Determine final priority based on user input and AI analysis
   */
  private determineFinalPriority(userPriority: string, aiUrgency: string): string {
    // AI can escalate but not de-escalate user priority
    const priorityOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    const userIndex = priorityOrder.indexOf(userPriority)
    const aiIndex = priorityOrder.indexOf(aiUrgency.toUpperCase())
    
    return priorityOrder[Math.max(userIndex, aiIndex)]
  }

  /**
   * Analyze message sentiment for escalation detection
   */
  private async analyzeSentiment(content: string) {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: 'Analyze message sentiment and determine if escalation is needed.'
        },
        {
          role: 'user' as const,
          content: `Analyze this message: "${content}"

Return JSON: {
  "sentiment": "positive|neutral|negative|angry",
  "escalationNeeded": boolean,
  "reason": "string"
}`
        }
      ]

      const response = await this.azureOpenAI.generateCompletion(messages, {
        maxTokens: 100,
        temperature: 0.1
      })

      if (response.success && response.data) {
        return JSON.parse(response.data)
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error)
    }

    return { escalationNeeded: false, reason: '', sentiment: 'neutral' }
  }

  /**
   * Escalate ticket to higher priority or management
   */
  private async escalateTicket(ticketId: string, reason: string) {
    try {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          priority: 'HIGH',
          tags: { push: 'escalated' }
        }
      })

      await this.addMessage({
        ticketId,
        senderId: 'system',
        senderType: 'SYSTEM',
        content: `Ticket escalated: ${reason}`,
        messageType: 'ESCALATION'
      })
    } catch (error) {
      console.error('Escalate ticket error:', error)
    }
  }

  /**
   * Send ticket notifications (placeholder)
   */
  private async sendTicketNotifications(ticket: any, action: string) {
    // This would integrate with email/SMS/Slack notifications
    console.log(`Notification: Ticket ${ticket.id} ${action}`)
  }

  /**
   * Get ticket search facets
   */
  private async getTicketFacets(baseWhereClause: any) {
    const [statuses, priorities, categories, assignees] = await Promise.all([
      prisma.ticket.groupBy({
        by: ['status'],
        where: baseWhereClause,
        _count: { status: true }
      }),
      prisma.ticket.groupBy({
        by: ['priority'],
        where: baseWhereClause,
        _count: { priority: true }
      }),
      prisma.ticket.groupBy({
        by: ['category'],
        where: baseWhereClause,
        _count: { category: true }
      }),
      prisma.ticket.groupBy({
        by: ['assigneeId'],
        where: { ...baseWhereClause, assigneeId: { not: null } },
        _count: { assigneeId: true }
      })
    ])

    return {
      statuses: statuses.map(s => ({ status: s.status, count: s._count.status })),
      priorities: priorities.map(p => ({ priority: p.priority, count: p._count.priority })),
      categories: categories.map(c => ({ category: c.category || 'Uncategorized', count: c._count.category })),
      assignees: assignees.map(a => ({ assigneeId: a.assigneeId!, count: a._count.assigneeId }))
    }
  }
}

export default SupportTicketService
