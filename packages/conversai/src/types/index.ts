export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  tokens?: number;
  model?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  status: 'active' | 'archived' | 'deleted';
  context?: Record<string, unknown>;
  settings?: ConversationSettings;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  messageCount: number;
  totalTokens: number;
}

export interface ConversationSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  memoryEnabled: boolean;
  contextWindow: number;
  autoTitle: boolean;
  retentionDays?: number;
}

export interface ConversationContext {
  id: string;
  conversationId: string;
  key: string;
  value: unknown;
  type: 'system' | 'user' | 'assistant' | 'memory';
  priority: number;
  expiresAt?: Date;
  createdAt: Date;
}

export interface ConversationMemory {
  id: string;
  conversationId: string;
  content: string;
  importance: number;
  categories: string[];
  embedding?: number[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
}

export interface ConversationAnalytics {
  conversationId: string;
  totalMessages: number;
  totalTokens: number;
  averageResponseTime: number;
  userSatisfactionScore?: number;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'low' | 'medium' | 'high';
  lastAnalyzedAt: Date;
}

export interface ConversationExport {
  conversation: Conversation;
  messages: ConversationMessage[];
  context: ConversationContext[];
  memory: ConversationMemory[];
  analytics: ConversationAnalytics;
  exportedAt: Date;
  format: 'json' | 'markdown' | 'txt' | 'csv';
}

export interface ConversationSearchOptions {
  userId?: string;
  query?: string;
  status?: Conversation['status'];
  dateRange?: {
    from: Date;
    to: Date;
  };
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastMessageAt' | 'messageCount';
  sortOrder?: 'asc' | 'desc';
}

export interface MessageSearchOptions {
  conversationId?: string;
  userId?: string;
  role?: ConversationMessage['role'];
  query?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  limit?: number;
  offset?: number;
}

export interface ConversationStats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  totalTokens: number;
  averageMessagesPerConversation: number;
  topTopics: Array<{ topic: string; count: number }>;
  userActivity: Array<{ userId: string; conversationCount: number; messageCount: number }>;
  modelUsage: Array<{ model: string; usage: number }>;
  period: {
    from: Date;
    to: Date;
  };
}
