/**
 * AjutAI Service - AI Support & Customer Success Platform
 * Intelligent customer support automation, ticket management, and AI-powered assistance
 */

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'bug' | 'feature_request' | 'security';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  userId: string;
  assignedTo?: string;
  tags: string[];
  metadata: {
    source: 'email' | 'chat' | 'form' | 'api' | 'phone';
    browser?: string;
    device?: string;
    appVersion?: string;
    errorLogs?: string[];
    screenshots?: string[];
  };
  conversation: ConversationMessage[];
  aiInsights: {
    sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
    urgency: number; // 0-100
    category: string;
    suggestedResponses: string[];
    relatedKnowledge: string[];
    estimatedResolutionTime: number; // minutes
  };
  sla: {
    responseTime: number; // minutes
    resolutionTime: number; // minutes
    breached: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  rating?: {
    score: number; // 1-5
    feedback: string;
    submittedAt: Date;
  };
}

interface ConversationMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorType: 'user' | 'agent' | 'ai' | 'system';
  content: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  aiGenerated: boolean;
  metadata: {
    readAt?: Date;
    editedAt?: Date;
    originalContent?: string;
  };
  createdAt: Date;
}

interface SupportAgent {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  avatar: string;
  role: 'support' | 'senior_support' | 'team_lead' | 'admin';
  specializations: string[];
  languages: string[];
  availability: {
    status: 'online' | 'busy' | 'away' | 'offline';
    workingHours: {
      timezone: string;
      schedule: Record<string, { start: string; end: string }>;
    };
  };
  metrics: {
    totalTickets: number;
    resolvedTickets: number;
    averageResponseTime: number; // minutes
    averageResolutionTime: number; // minutes
    customerSatisfaction: number; // 1-5
    currentWorkload: number;
  };
  preferences: {
    autoAssign: boolean;
    maxConcurrentTickets: number;
    notificationSettings: {
      email: boolean;
      push: boolean;
      desktop: boolean;
    };
  };
  createdAt: Date;
  lastActiveAt: Date;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  subcategory: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  visibility: 'public' | 'internal' | 'private';
  metadata: {
    views: number;
    helpfulVotes: number;
    notHelpfulVotes: number;
    lastUpdated: Date;
    version: string;
    relatedArticles: string[];
    searchKeywords: string[];
  };
  author: {
    id: string;
    name: string;
    role: string;
  };
  approval: {
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: Date;
    comments?: string;
  };
  analytics: {
    searchAppearances: number;
    clickThroughRate: number;
    bounceRate: number;
    avgTimeOnPage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface SupportMetrics {
  realtime: {
    activeTickets: number;
    onlineAgents: number;
    avgResponseTime: number;
    queueLength: number;
    currentLoad: number;
  };
  daily: {
    ticketsCreated: number;
    ticketsResolved: number;
    avgResolutionTime: number;
    customerSatisfaction: number;
    firstContactResolution: number;
  };
  trends: {
    ticketVolume: Array<{ date: string; count: number }>;
    responseTime: Array<{ date: string; minutes: number }>;
    satisfaction: Array<{ date: string; score: number }>;
    categories: Record<string, number>;
  };
  performance: {
    slaCompliance: number;
    agentUtilization: number;
    escalationRate: number;
    repeatContactRate: number;
  };
}

interface AIAssistant {
  id: string;
  name: string;
  type: 'classifier' | 'responder' | 'analyzer' | 'suggester';
  model: string;
  capabilities: string[];
  configuration: {
    confidence_threshold: number;
    max_response_length: number;
    tone: 'professional' | 'friendly' | 'casual';
    languages: string[];
  };
  performance: {
    accuracy: number;
    responseTime: number;
    userSatisfaction: number;
    usage: number;
  };
  status: 'active' | 'training' | 'maintenance' | 'disabled';
  lastTrained: Date;
  createdAt: Date;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'ticket_created' | 'message_received' | 'status_changed' | 'time_elapsed';
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: 'assign' | 'categorize' | 'prioritize' | 'respond' | 'escalate' | 'close';
    parameters: Record<string, any>;
  }>;
  active: boolean;
  metrics: {
    triggered: number;
    successful: number;
    lastTriggered?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

class AjutAIService {
  private tickets: Map<string, SupportTicket> = new Map();
  private agents: Map<string, SupportAgent> = new Map();
  private knowledgeBase: Map<string, KnowledgeArticle> = new Map();
  private aiAssistants: Map<string, AIAssistant> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    console.log('🎯 Initializing AjutAI Service - AI Support & Customer Success Platform');

    this.createSampleAgents();
    this.createSampleKnowledgeBase();
    this.createSampleAIAssistants();
    this.createSampleAutomationRules();
    this.createSampleTickets();

    console.log('✅ AjutAI Service initialized successfully');
  }

  private createSampleAgents(): void {
    const sampleAgents = [
      {
        id: 'agent-001',
        userId: 'user-agent-001',
        displayName: 'Maria Popescu',
        email: 'maria.popescu@ajutai.ro',
        avatar: '/avatars/maria-popescu.jpg',
        role: 'team_lead' as const,
        specializations: ['technical_support', 'billing', 'enterprise'],
        languages: ['ro', 'en', 'fr'],
        availability: {
          status: 'online' as const,
          workingHours: {
            timezone: 'Europe/Bucharest',
            schedule: {
              monday: { start: '09:00', end: '17:00' },
              tuesday: { start: '09:00', end: '17:00' },
              wednesday: { start: '09:00', end: '17:00' },
              thursday: { start: '09:00', end: '17:00' },
              friday: { start: '09:00', end: '17:00' }
            }
          }
        },
        metrics: {
          totalTickets: 2456,
          resolvedTickets: 2398,
          averageResponseTime: 12,
          averageResolutionTime: 185,
          customerSatisfaction: 4.8,
          currentWorkload: 3
        },
        preferences: {
          autoAssign: true,
          maxConcurrentTickets: 8,
          notificationSettings: {
            email: true,
            push: true,
            desktop: true
          }
        }
      },
      {
        id: 'agent-002',
        userId: 'user-agent-002',
        displayName: 'Alex Ionescu',
        email: 'alex.ionescu@ajutai.ro',
        avatar: '/avatars/alex-ionescu.jpg',
        role: 'senior_support' as const,
        specializations: ['api_integration', 'developer_support', 'technical'],
        languages: ['ro', 'en'],
        availability: {
          status: 'busy' as const,
          workingHours: {
            timezone: 'Europe/Bucharest',
            schedule: {
              monday: { start: '10:00', end: '18:00' },
              tuesday: { start: '10:00', end: '18:00' },
              wednesday: { start: '10:00', end: '18:00' },
              thursday: { start: '10:00', end: '18:00' },
              friday: { start: '10:00', end: '18:00' }
            }
          }
        },
        metrics: {
          totalTickets: 1876,
          resolvedTickets: 1823,
          averageResponseTime: 8,
          averageResolutionTime: 156,
          customerSatisfaction: 4.9,
          currentWorkload: 6
        },
        preferences: {
          autoAssign: true,
          maxConcurrentTickets: 6,
          notificationSettings: {
            email: true,
            push: false,
            desktop: true
          }
        }
      },
      {
        id: 'agent-003',
        userId: 'user-agent-003',
        displayName: 'Sarah Chen',
        email: 'sarah.chen@ajutai.ro',
        avatar: '/avatars/sarah-chen.jpg',
        role: 'support' as const,
        specializations: ['general_support', 'onboarding', 'billing'],
        languages: ['en', 'zh', 'ro'],
        availability: {
          status: 'online' as const,
          workingHours: {
            timezone: 'Asia/Shanghai',
            schedule: {
              monday: { start: '09:00', end: '17:00' },
              tuesday: { start: '09:00', end: '17:00' },
              wednesday: { start: '09:00', end: '17:00' },
              thursday: { start: '09:00', end: '17:00' },
              friday: { start: '09:00', end: '17:00' }
            }
          }
        },
        metrics: {
          totalTickets: 1234,
          resolvedTickets: 1198,
          averageResponseTime: 15,
          averageResolutionTime: 210,
          customerSatisfaction: 4.6,
          currentWorkload: 4
        },
        preferences: {
          autoAssign: true,
          maxConcurrentTickets: 10,
          notificationSettings: {
            email: true,
            push: true,
            desktop: false
          }
        }
      }
    ];

    sampleAgents.forEach(agentData => {
      const agent: SupportAgent = {
        ...agentData,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date()
      };
      this.agents.set(agent.id, agent);
    });
  }

  private createSampleKnowledgeBase(): void {
    const sampleArticles = [
      {
        id: 'kb-001',
        title: 'Getting Started with MemorAI MCP Integration',
        summary: 'Learn how to integrate MemorAI MCP server with your applications for persistent AI memory.',
        category: 'integration',
        subcategory: 'memorai',
        difficulty: 'beginner' as const,
        content: `# Getting Started with MemorAI MCP Integration

## Overview
MemorAI provides a Model Context Protocol (MCP) server that enables persistent AI memory across applications. This guide will help you integrate MemorAI into your workflow.

## Prerequisites
- Active Codai ecosystem account
- Basic understanding of API integration
- Node.js or Python development environment

## Step 1: Authentication
First, obtain your API credentials from the MemorAI dashboard...

## Step 2: Install Dependencies
\`\`\`bash
npm install @memorai/mcp-client
\`\`\`

## Step 3: Basic Configuration
\`\`\`javascript
import { MemorAIClient } from '@memorai/mcp-client';

const client = new MemorAIClient({
  apiKey: 'your-api-key',
  endpoint: 'https://mcp.memorai.ro'
});
\`\`\`

## Common Use Cases
- Persistent conversation context
- Knowledge base building
- Multi-session memory
- Agent state management

## Troubleshooting
If you encounter issues, check our troubleshooting guide or contact support.`,
        tags: ['memorai', 'mcp', 'integration', 'api', 'getting-started'],
        visibility: 'public' as const
      },
      {
        id: 'kb-002',
        title: 'BancAI Payment Processing Setup',
        summary: 'Configure payment processing and financial workflows using BancAI services.',
        category: 'payment',
        subcategory: 'bancai',
        difficulty: 'intermediate' as const,
        content: `# BancAI Payment Processing Setup

## Introduction
BancAI provides comprehensive financial services including payment processing, KYC/AML compliance, and transaction monitoring.

## Stripe Integration
Learn how to configure Stripe payment processing with BancAI...

## KYC/AML Verification
Implement customer verification workflows...

## Transaction Monitoring
Set up real-time transaction monitoring and fraud detection...`,
        tags: ['bancai', 'payments', 'stripe', 'kyc', 'aml', 'financial'],
        visibility: 'public' as const
      },
      {
        id: 'kb-003',
        title: 'KodexChain Smart Contract Development',
        summary: 'Build and deploy smart contracts on the KodexChain protocol for AI-powered automation.',
        category: 'blockchain',
        subcategory: 'kodex',
        difficulty: 'advanced' as const,
        content: `# KodexChain Smart Contract Development

## Overview
KodexChain is the core protocol for programmable money and AI automation within the Codai ecosystem.

## Smart Contract Architecture
- Agent-based contracts
- Rule engine integration
- Governance mechanisms
- Economic models

## Development Environment
Set up your development environment for KodexChain...

## Contract Templates
Explore pre-built contract templates for common use cases...`,
        tags: ['kodex', 'blockchain', 'smart-contracts', 'ai', 'automation'],
        visibility: 'public' as const
      },
      {
        id: 'kb-004',
        title: 'Troubleshooting API Rate Limits',
        summary: 'Understanding and handling API rate limits across Codai ecosystem services.',
        category: 'troubleshooting',
        subcategory: 'api',
        difficulty: 'intermediate' as const,
        content: `# Troubleshooting API Rate Limits

## Understanding Rate Limits
All Codai ecosystem APIs implement rate limiting to ensure fair usage...

## Rate Limit Headers
- X-RateLimit-Limit
- X-RateLimit-Remaining
- X-RateLimit-Reset

## Best Practices
- Implement exponential backoff
- Cache responses when possible
- Use webhooks for real-time updates
- Monitor your usage patterns

## Handling Rate Limit Errors
When you receive a 429 status code...`,
        tags: ['api', 'rate-limits', 'troubleshooting', 'best-practices'],
        visibility: 'public' as const
      }
    ];

    sampleArticles.forEach(articleData => {
      const article: KnowledgeArticle = {
        ...articleData,
        metadata: {
          views: Math.floor(Math.random() * 5000) + 100,
          helpfulVotes: Math.floor(Math.random() * 100) + 10,
          notHelpfulVotes: Math.floor(Math.random() * 20),
          lastUpdated: new Date(),
          version: '1.0.0',
          relatedArticles: [],
          searchKeywords: articleData.tags
        },
        author: {
          id: 'author-001',
          name: 'Documentation Team',
          role: 'Technical Writer'
        },
        approval: {
          status: 'approved' as const,
          reviewedBy: 'reviewer-001',
          reviewedAt: new Date(),
          comments: 'Approved for publication'
        },
        analytics: {
          searchAppearances: Math.floor(Math.random() * 1000),
          clickThroughRate: Math.random() * 0.3 + 0.1,
          bounceRate: Math.random() * 0.5 + 0.2,
          avgTimeOnPage: Math.random() * 300 + 120
        },
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
      this.knowledgeBase.set(article.id, article);
    });
  }

  private createSampleAIAssistants(): void {
    const sampleAssistants = [
      {
        id: 'ai-classifier',
        name: 'Ticket Classifier',
        type: 'classifier' as const,
        model: 'gpt-4-turbo',
        capabilities: [
          'ticket_categorization',
          'priority_detection',
          'sentiment_analysis',
          'urgency_assessment'
        ],
        configuration: {
          confidence_threshold: 0.85,
          max_response_length: 500,
          tone: 'professional' as const,
          languages: ['en', 'ro', 'fr', 'de', 'es']
        },
        performance: {
          accuracy: 0.94,
          responseTime: 1.2,
          userSatisfaction: 4.7,
          usage: 15234
        },
        status: 'active' as const,
        lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'ai-responder',
        name: 'Response Generator',
        type: 'responder' as const,
        model: 'gpt-4',
        capabilities: [
          'response_generation',
          'template_completion',
          'personalization',
          'context_awareness'
        ],
        configuration: {
          confidence_threshold: 0.80,
          max_response_length: 1000,
          tone: 'friendly' as const,
          languages: ['en', 'ro']
        },
        performance: {
          accuracy: 0.89,
          responseTime: 2.1,
          userSatisfaction: 4.5,
          usage: 8765
        },
        status: 'active' as const,
        lastTrained: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'ai-analyzer',
        name: 'Conversation Analyzer',
        type: 'analyzer' as const,
        model: 'gpt-3.5-turbo',
        capabilities: [
          'conversation_analysis',
          'escalation_detection',
          'satisfaction_prediction',
          'resolution_suggestion'
        ],
        configuration: {
          confidence_threshold: 0.75,
          max_response_length: 800,
          tone: 'professional' as const,
          languages: ['en', 'ro', 'fr']
        },
        performance: {
          accuracy: 0.87,
          responseTime: 1.8,
          userSatisfaction: 4.3,
          usage: 12456
        },
        status: 'active' as const,
        lastTrained: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
      }
    ];

    sampleAssistants.forEach(assistantData => {
      const assistant: AIAssistant = {
        ...assistantData,
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
      };
      this.aiAssistants.set(assistant.id, assistant);
    });
  }

  private createSampleAutomationRules(): void {
    const sampleRules = [
      {
        id: 'rule-001',
        name: 'Auto-Assign Technical Issues',
        description: 'Automatically assign technical issues to specialized agents',
        trigger: {
          type: 'ticket_created' as const,
          conditions: {
            category: 'technical',
            keywords: ['api', 'integration', 'error', 'bug']
          }
        },
        actions: [
          {
            type: 'assign' as const,
            parameters: {
              agentPool: ['agent-002'], // Alex Ionescu - technical specialist
              criteria: 'specialization'
            }
          },
          {
            type: 'prioritize' as const,
            parameters: {
              priority: 'high'
            }
          }
        ],
        active: true,
        metrics: {
          triggered: 234,
          successful: 228,
          lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      },
      {
        id: 'rule-002',
        name: 'Escalate Urgent Issues',
        description: 'Escalate tickets marked as urgent to team leads',
        trigger: {
          type: 'ticket_created' as const,
          conditions: {
            priority: 'urgent',
            sentiment: 'frustrated'
          }
        },
        actions: [
          {
            type: 'assign' as const,
            parameters: {
              role: 'team_lead'
            }
          },
          {
            type: 'respond' as const,
            parameters: {
              template: 'urgent_acknowledgment',
              immediate: true
            }
          }
        ],
        active: true,
        metrics: {
          triggered: 67,
          successful: 65,
          lastTriggered: new Date(Date.now() - 5 * 60 * 60 * 1000)
        }
      },
      {
        id: 'rule-003',
        name: 'Auto-Close Resolved Tickets',
        description: 'Automatically close tickets after 48 hours of no response when marked as resolved',
        trigger: {
          type: 'time_elapsed' as const,
          conditions: {
            status: 'resolved',
            hours_elapsed: 48,
            no_customer_response: true
          }
        },
        actions: [
          {
            type: 'close' as const,
            parameters: {
              reason: 'auto_close_no_response',
              send_notification: true
            }
          }
        ],
        active: true,
        metrics: {
          triggered: 156,
          successful: 156,
          lastTriggered: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      }
    ];

    sampleRules.forEach(ruleData => {
      const rule: AutomationRule = {
        ...ruleData,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
      this.automationRules.set(rule.id, rule);
    });
  }

  private createSampleTickets(): void {
    const sampleTickets = [
      {
        id: 'ticket-001',
        title: 'MemorAI API Integration Issues',
        description: 'Unable to connect to MemorAI MCP server. Getting connection timeout errors when trying to establish WebSocket connection.',
        priority: 'high' as const,
        category: 'technical' as const,
        status: 'in_progress' as const,
        userId: 'user-dev-001',
        assignedTo: 'agent-002',
        tags: ['memorai', 'api', 'websocket', 'timeout'],
        metadata: {
          source: 'form' as const,
          browser: 'Chrome 121.0',
          device: 'MacBook Pro M2',
          appVersion: '1.2.3',
          errorLogs: [
            'WebSocket connection failed: timeout after 30s',
            'Retry attempt 3/3 failed',
            'Fallback to HTTP failed with 502'
          ],
          screenshots: ['/support/screenshots/memorai-error-001.png']
        }
      },
      {
        id: 'ticket-002',
        title: 'Billing Question - Upgrade to Enterprise',
        description: 'We want to upgrade our current Pro plan to Enterprise for our team of 50 developers. Need information about pricing and migration process.',
        priority: 'medium' as const,
        category: 'billing' as const,
        status: 'open' as const,
        userId: 'user-biz-001',
        tags: ['billing', 'upgrade', 'enterprise', 'pricing'],
        metadata: {
          source: 'email' as const,
          appVersion: '1.2.3'
        }
      },
      {
        id: 'ticket-003',
        title: 'KodexChain Smart Contract Deployment Failed',
        description: 'Smart contract deployment through Kodex platform is failing with gas estimation errors. Contract compiles successfully but deployment fails.',
        priority: 'urgent' as const,
        category: 'technical' as const,
        status: 'open' as const,
        userId: 'user-dev-002',
        tags: ['kodex', 'smart-contract', 'deployment', 'gas', 'blockchain'],
        metadata: {
          source: 'chat' as const,
          browser: 'Firefox 122.0',
          device: 'Windows 11',
          appVersion: '1.2.3',
          errorLogs: [
            'Gas estimation failed: insufficient funds',
            'Transaction reverted without reason',
            'Contract size exceeds limit'
          ]
        }
      },
      {
        id: 'ticket-004',
        title: 'Feature Request: Dark Mode for StudiAI',
        description: 'Would love to see a dark mode option for the StudiAI learning platform. Current bright interface causes eye strain during long study sessions.',
        priority: 'low' as const,
        category: 'feature_request' as const,
        status: 'open' as const,
        userId: 'user-student-001',
        tags: ['studiai', 'dark-mode', 'ui', 'accessibility'],
        metadata: {
          source: 'form' as const,
          browser: 'Safari 17.2',
          device: 'iPad Pro',
          appVersion: '1.2.3'
        }
      },
      {
        id: 'ticket-005',
        title: 'Security Concern - Unauthorized Access Attempt',
        description: 'Received notification about failed login attempts from unknown IP addresses. Want to ensure account security and enable additional protection.',
        priority: 'high' as const,
        category: 'security' as const,
        status: 'resolved' as const,
        userId: 'user-sec-001',
        assignedTo: 'agent-001',
        tags: ['security', 'login', 'unauthorized', 'protection'],
        metadata: {
          source: 'email' as const,
          appVersion: '1.2.3'
        },
        resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];

    sampleTickets.forEach(ticketData => {
      const now = new Date();
      const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

      const ticket: SupportTicket = {
        ...ticketData,
        conversation: this.generateConversation(ticketData.id, ticketData.userId, ticketData.assignedTo),
        aiInsights: this.generateAIInsights(ticketData.description, ticketData.category),
        sla: this.calculateSLA(ticketData.priority, createdAt),
        createdAt,
        updatedAt: new Date(),
        rating: ticketData.status === 'resolved' ? {
          score: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          feedback: 'Great support, issue resolved quickly!',
          submittedAt: new Date()
        } : undefined
      };
      this.tickets.set(ticket.id, ticket);
    });
  }

  private generateConversation(ticketId: string, userId: string, assignedTo?: string): ConversationMessage[] {
    const messages: ConversationMessage[] = [];
    const messageCount = Math.floor(Math.random() * 5) + 2;

    for (let i = 0; i < messageCount; i++) {
      const isUserMessage = i % 2 === 0;
      messages.push({
        id: `msg-${ticketId}-${i + 1}`,
        ticketId,
        authorId: isUserMessage ? userId : (assignedTo || 'ai-responder'),
        authorType: isUserMessage ? 'user' : (assignedTo ? 'agent' : 'ai'),
        content: this.generateMessageContent(isUserMessage, i),
        aiGenerated: !isUserMessage && !assignedTo,
        metadata: {
          readAt: new Date()
        },
        createdAt: new Date(Date.now() - (messageCount - i) * 30 * 60 * 1000)
      });
    }

    return messages;
  }

  private generateMessageContent(isUser: boolean, index: number): string {
    if (isUser) {
      const userMessages = [
        'I need help with this issue as soon as possible.',
        'Thanks for the quick response. I tried your suggestion but still having problems.',
        'That worked perfectly! Thank you for your help.',
        'Can you provide more details about the solution?'
      ];
      return userMessages[index % userMessages.length];
    } else {
      const agentMessages = [
        'Thank you for contacting support. I understand your issue and I\'m here to help.',
        'Let me investigate this further. Can you try clearing your browser cache and try again?',
        'I\'ve escalated this to our development team. You should receive an update within 24 hours.',
        'Great! I\'m glad we could resolve this for you. Is there anything else I can help with?'
      ];
      return agentMessages[index % agentMessages.length];
    }
  }

  private generateAIInsights(description: string, category: string): SupportTicket['aiInsights'] {
    const sentiments = ['positive', 'neutral', 'negative', 'frustrated'] as const;
    const urgency = Math.floor(Math.random() * 100);

    return {
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      urgency,
      category,
      suggestedResponses: [
        'Thank you for reaching out. I understand your concern and I\'m here to help.',
        'Let me look into this issue for you right away.',
        'I can see this is important to you. Let\'s get this resolved quickly.'
      ],
      relatedKnowledge: ['kb-001', 'kb-002'],
      estimatedResolutionTime: Math.floor(Math.random() * 240) + 60 // 1-4 hours
    };
  }

  private calculateSLA(priority: string, createdAt: Date): SupportTicket['sla'] {
    const slaTargets = {
      urgent: { response: 15, resolution: 240 },    // 15 min, 4 hours
      high: { response: 60, resolution: 480 },      // 1 hour, 8 hours
      medium: { response: 240, resolution: 1440 },  // 4 hours, 24 hours
      low: { response: 480, resolution: 2880 }      // 8 hours, 48 hours
    };

    const target = slaTargets[priority as keyof typeof slaTargets] || slaTargets.medium;
    const elapsed = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60));

    return {
      responseTime: target.response,
      resolutionTime: target.resolution,
      breached: elapsed > target.response
    };
  }

  // Public API Methods

  async createTicket(ticketData: Partial<SupportTicket>): Promise<SupportTicket> {
    const ticketId = this.generateTicketId();
    const now = new Date();

    const ticket: SupportTicket = {
      id: ticketId,
      title: ticketData.title || 'Support Request',
      description: ticketData.description || '',
      priority: ticketData.priority || 'medium',
      category: ticketData.category || 'general',
      status: 'open',
      userId: ticketData.userId!,
      tags: ticketData.tags || [],
      metadata: {
        source: ticketData.metadata?.source || 'form',
        ...ticketData.metadata
      },
      conversation: [],
      aiInsights: this.generateAIInsights(ticketData.description || '', ticketData.category || 'general'),
      sla: this.calculateSLA(ticketData.priority || 'medium', now),
      createdAt: now,
      updatedAt: now
    };

    this.tickets.set(ticketId, ticket);

    // Auto-assign based on rules
    await this.processAutomationRules(ticket);

    return ticket;
  }

  async getTicket(ticketId: string): Promise<SupportTicket | undefined> {
    return this.tickets.get(ticketId);
  }

  async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return undefined;

    const updatedTicket = {
      ...ticket,
      ...updates,
      updatedAt: new Date()
    };

    this.tickets.set(ticketId, updatedTicket);
    return updatedTicket;
  }

  async searchTickets(query: {
    status?: string[];
    priority?: string[];
    category?: string[];
    assignedTo?: string;
    userId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    tickets: SupportTicket[];
    total: number;
    facets: {
      status: Record<string, number>;
      priority: Record<string, number>;
      category: Record<string, number>;
    };
  }> {
    let tickets = Array.from(this.tickets.values());

    // Apply filters
    if (query.status?.length) {
      tickets = tickets.filter(t => query.status!.includes(t.status));
    }
    if (query.priority?.length) {
      tickets = tickets.filter(t => query.priority!.includes(t.priority));
    }
    if (query.category?.length) {
      tickets = tickets.filter(t => query.category!.includes(t.category));
    }
    if (query.assignedTo) {
      tickets = tickets.filter(t => t.assignedTo === query.assignedTo);
    }
    if (query.userId) {
      tickets = tickets.filter(t => t.userId === query.userId);
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      tickets = tickets.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    const total = tickets.length;

    // Apply pagination
    if (query.offset) {
      tickets = tickets.slice(query.offset);
    }
    if (query.limit) {
      tickets = tickets.slice(0, query.limit);
    }

    // Calculate facets
    const allTickets = Array.from(this.tickets.values());
    const facets = {
      status: this.calculateFacets(allTickets, 'status'),
      priority: this.calculateFacets(allTickets, 'priority'),
      category: this.calculateFacets(allTickets, 'category')
    };

    return { tickets, total, facets };
  }

  async addMessage(ticketId: string, messageData: Partial<ConversationMessage>): Promise<ConversationMessage> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const message: ConversationMessage = {
      id: `msg-${ticketId}-${Date.now()}`,
      ticketId,
      authorId: messageData.authorId!,
      authorType: messageData.authorType || 'user',
      content: messageData.content || '',
      attachments: messageData.attachments,
      aiGenerated: messageData.aiGenerated || false,
      metadata: {
        ...messageData.metadata
      },
      createdAt: new Date()
    };

    ticket.conversation.push(message);
    ticket.updatedAt = new Date();

    // Update AI insights after new message
    ticket.aiInsights = this.generateAIInsights(message.content, ticket.category);

    this.tickets.set(ticketId, ticket);
    return message;
  }

  async getKnowledgeBase(query?: {
    category?: string;
    search?: string;
    difficulty?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    articles: KnowledgeArticle[];
    total: number;
    categories: string[];
  }> {
    let articles = Array.from(this.knowledgeBase.values())
      .filter(a => a.visibility === 'public' && a.approval.status === 'approved');

    if (query?.category) {
      articles = articles.filter(a => a.category === query.category);
    }
    if (query?.difficulty) {
      articles = articles.filter(a => a.difficulty === query.difficulty);
    }
    if (query?.search) {
      const searchLower = query.search.toLowerCase();
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(searchLower) ||
        a.summary.toLowerCase().includes(searchLower) ||
        a.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    const total = articles.length;

    if (query?.offset) {
      articles = articles.slice(query.offset);
    }
    if (query?.limit) {
      articles = articles.slice(0, query.limit);
    }

    const categories = [...new Set(Array.from(this.knowledgeBase.values()).map(a => a.category))];

    return { articles, total, categories };
  }

  async getSupportMetrics(): Promise<SupportMetrics> {
    const tickets = Array.from(this.tickets.values());
    const agents = Array.from(this.agents.values());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeTickets = tickets.filter(t => ['open', 'in_progress'].includes(t.status));
    const onlineAgents = agents.filter(a => a.availability.status === 'online');

    const todayTickets = tickets.filter(t => t.createdAt >= today);
    const resolvedToday = tickets.filter(t => t.resolvedAt && t.resolvedAt >= today);

    return {
      realtime: {
        activeTickets: activeTickets.length,
        onlineAgents: onlineAgents.length,
        avgResponseTime: this.calculateAverageResponseTime(tickets),
        queueLength: tickets.filter(t => t.status === 'open' && !t.assignedTo).length,
        currentLoad: activeTickets.length / Math.max(onlineAgents.length, 1)
      },
      daily: {
        ticketsCreated: todayTickets.length,
        ticketsResolved: resolvedToday.length,
        avgResolutionTime: this.calculateAverageResolutionTime(resolvedToday),
        customerSatisfaction: this.calculateAverageRating(resolvedToday),
        firstContactResolution: this.calculateFirstContactResolution(resolvedToday)
      },
      trends: {
        ticketVolume: this.generateVolumeData(),
        responseTime: this.generateResponseTimeData(),
        satisfaction: this.generateSatisfactionData(),
        categories: this.calculateFacets(tickets, 'category')
      },
      performance: {
        slaCompliance: this.calculateSLACompliance(tickets),
        agentUtilization: this.calculateAgentUtilization(agents),
        escalationRate: this.calculateEscalationRate(tickets),
        repeatContactRate: this.calculateRepeatContactRate(tickets)
      }
    };
  }

  async processAutomationRules(ticket: SupportTicket): Promise<void> {
    for (const rule of this.automationRules.values()) {
      if (!rule.active) continue;

      if (this.evaluateRuleTrigger(rule, ticket)) {
        await this.executeRuleActions(rule, ticket);

        // Update rule metrics
        rule.metrics.triggered++;
        rule.metrics.lastTriggered = new Date();
      }
    }
  }

  private evaluateRuleTrigger(rule: AutomationRule, ticket: SupportTicket): boolean {
    const { trigger } = rule;

    if (trigger.type === 'ticket_created') {
      return this.matchesConditions(trigger.conditions, ticket);
    }

    return false;
  }

  private matchesConditions(conditions: Record<string, any>, ticket: SupportTicket): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'category' && ticket.category !== value) return false;
      if (key === 'priority' && ticket.priority !== value) return false;
      if (key === 'keywords') {
        const hasKeyword = value.some((keyword: string) =>
          ticket.title.toLowerCase().includes(keyword.toLowerCase()) ||
          ticket.description.toLowerCase().includes(keyword.toLowerCase())
        );
        if (!hasKeyword) return false;
      }
    }
    return true;
  }

  private async executeRuleActions(rule: AutomationRule, ticket: SupportTicket): Promise<void> {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'assign':
          await this.autoAssignTicket(ticket, action.parameters);
          break;
        case 'prioritize':
          ticket.priority = action.parameters.priority;
          break;
        case 'categorize':
          ticket.category = action.parameters.category;
          break;
        case 'respond':
          await this.autoRespond(ticket, action.parameters);
          break;
      }
    }

    rule.metrics.successful++;
    this.tickets.set(ticket.id, ticket);
  }

  private async autoAssignTicket(ticket: SupportTicket, parameters: any): Promise<void> {
    let targetAgent: SupportAgent | undefined;

    if (parameters.agentPool) {
      const availableAgents = parameters.agentPool
        .map((id: string) => this.agents.get(id))
        .filter((agent: SupportAgent | undefined) =>
          agent && agent.availability.status === 'online' &&
          agent.metrics.currentWorkload < agent.preferences.maxConcurrentTickets
        );

      if (availableAgents.length > 0) {
        targetAgent = availableAgents.reduce((prev: SupportAgent, current: SupportAgent) =>
          prev.metrics.currentWorkload < current.metrics.currentWorkload ? prev : current
        );
      }
    } else if (parameters.role) {
      const roleAgents = Array.from(this.agents.values())
        .filter(agent =>
          agent.role === parameters.role &&
          agent.availability.status === 'online' &&
          agent.metrics.currentWorkload < agent.preferences.maxConcurrentTickets
        );

      if (roleAgents.length > 0) {
        targetAgent = roleAgents[0];
      }
    }

    if (targetAgent) {
      ticket.assignedTo = targetAgent.id;
      targetAgent.metrics.currentWorkload++;
      this.agents.set(targetAgent.id, targetAgent);
    }
  }

  private async autoRespond(ticket: SupportTicket, parameters: any): Promise<void> {
    const templates = {
      urgent_acknowledgment: 'Thank you for contacting us about this urgent matter. We have escalated your ticket to our senior support team and you can expect a response within 15 minutes.',
      technical_response: 'Thank you for reporting this technical issue. Our engineering team is investigating and will provide an update soon.',
      billing_response: 'Thank you for your billing inquiry. Our billing specialist will review your account and respond shortly.'
    };

    const content = templates[parameters.template as keyof typeof templates] ||
      'Thank you for contacting support. We have received your request and will respond soon.';

    await this.addMessage(ticket.id, {
      authorId: 'ai-responder',
      authorType: 'ai',
      content,
      aiGenerated: true
    });
  }

  private calculateFacets(tickets: SupportTicket[], field: keyof SupportTicket): Record<string, number> {
    const facets: Record<string, number> = {};
    tickets.forEach(ticket => {
      const value = ticket[field] as string;
      facets[value] = (facets[value] || 0) + 1;
    });
    return facets;
  }

  private calculateAverageResponseTime(tickets: SupportTicket[]): number {
    const responseTimes = tickets
      .filter(t => t.conversation.length > 1)
      .map(t => {
        const firstMessage = t.conversation.find(m => m.authorType === 'user');
        const firstResponse = t.conversation.find(m => m.authorType === 'agent');
        if (firstMessage && firstResponse) {
          return firstResponse.createdAt.getTime() - firstMessage.createdAt.getTime();
        }
        return 0;
      })
      .filter(time => time > 0);

    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / (1000 * 60); // minutes
  }

  private calculateAverageResolutionTime(tickets: SupportTicket[]): number {
    const resolutionTimes = tickets
      .filter(t => t.resolvedAt)
      .map(t => t.resolvedAt!.getTime() - t.createdAt.getTime());

    if (resolutionTimes.length === 0) return 0;
    return resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length / (1000 * 60); // minutes
  }

  private calculateAverageRating(tickets: SupportTicket[]): number {
    const ratings = tickets.filter(t => t.rating).map(t => t.rating!.score);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  private calculateFirstContactResolution(tickets: SupportTicket[]): number {
    const resolved = tickets.filter(t => t.status === 'resolved');
    const firstContact = resolved.filter(t => t.conversation.length <= 2); // Initial request + response
    return resolved.length > 0 ? (firstContact.length / resolved.length) * 100 : 0;
  }

  private generateVolumeData(): Array<{ date: string; count: number }> {
    const days = 7;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      });
    }

    return data;
  }

  private generateResponseTimeData(): Array<{ date: string; minutes: number }> {
    const days = 7;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        minutes: Math.floor(Math.random() * 30) + 5
      });
    }

    return data;
  }

  private generateSatisfactionData(): Array<{ date: string; score: number }> {
    const days = 7;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        score: Math.random() * 1 + 4 // 4-5 range
      });
    }

    return data;
  }

  private calculateSLACompliance(tickets: SupportTicket[]): number {
    const slaTickets = tickets.filter(t => t.sla);
    const compliant = slaTickets.filter(t => !t.sla.breached);
    return slaTickets.length > 0 ? (compliant.length / slaTickets.length) * 100 : 100;
  }

  private calculateAgentUtilization(agents: SupportAgent[]): number {
    const activeAgents = agents.filter(a => a.availability.status !== 'offline');
    if (activeAgents.length === 0) return 0;

    const totalCapacity = activeAgents.reduce((sum, agent) => sum + agent.preferences.maxConcurrentTickets, 0);
    const currentLoad = activeAgents.reduce((sum, agent) => sum + agent.metrics.currentWorkload, 0);

    return (currentLoad / totalCapacity) * 100;
  }

  private calculateEscalationRate(tickets: SupportTicket[]): number {
    const escalated = tickets.filter(t =>
      t.conversation.some(m => m.content.toLowerCase().includes('escalat'))
    );
    return tickets.length > 0 ? (escalated.length / tickets.length) * 100 : 0;
  }

  private calculateRepeatContactRate(tickets: SupportTicket[]): number {
    const userTicketCounts = new Map<string, number>();
    tickets.forEach(ticket => {
      userTicketCounts.set(ticket.userId, (userTicketCounts.get(ticket.userId) || 0) + 1);
    });

    const repeatUsers = Array.from(userTicketCounts.values()).filter(count => count > 1);
    const totalUsers = userTicketCounts.size;

    return totalUsers > 0 ? (repeatUsers.length / totalUsers) * 100 : 0;
  }

  private generateTicketId(): string {
    return `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Additional utility methods for analytics and reporting
  async getAgentPerformance(agentId: string): Promise<SupportAgent | undefined> {
    return this.agents.get(agentId);
  }

  async getTicketsByAgent(agentId: string): Promise<SupportTicket[]> {
    return Array.from(this.tickets.values()).filter(t => t.assignedTo === agentId);
  }

  async getTicketsByUser(userId: string): Promise<SupportTicket[]> {
    return Array.from(this.tickets.values()).filter(t => t.userId === userId);
  }
}

export default AjutAIService;
