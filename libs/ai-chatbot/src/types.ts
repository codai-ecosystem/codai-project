/**
 * CODAI AI Chatbot Core - Type Definitions
 * Comprehensive type definitions for the intelligent conversation system
 */

// Core Message Types  
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  userId?: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
  tokens?: number;
  processingTime?: number;
}

export interface MessageMetadata {
  intent?: string;
  sentiment?: SentimentAnalysis;
  entities?: Entity[];
  confidence?: number;
  language?: string;
  processingFlags?: string[];
  sourceType?: 'text' | 'voice' | 'file' | 'image';
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'code';
  name: string;
  size: number;
  url?: string;
  content?: string;
  metadata?: Record<string, any>;
}

// Conversation Management
export interface Conversation {
  id: string;
  userId?: string;
  title?: string;
  status: ConversationStatus;
  messages?: Message[];
  context?: ConversationContext;
  metadata: ConversationMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  messageCount: number;
  expiresAt?: Date;
  userPreferences?: UserPreferences;
}

export type ConversationStatus = 'active' | 'paused' | 'completed' | 'archived' | 'error';

export interface ConversationContext {
  currentTopic?: string;
  previousTopics: string[];
  userPreferences: UserPreferences;
  sessionData: Record<string, any>;
  workingMemory: WorkingMemoryItem[];
  longTermMemory: LongTermMemoryItem[];
}

export interface WorkingMemoryItem {
  key: string;
  value: any;
  timestamp: Date;
  relevanceScore: number;
  ttl: number;
}

export interface LongTermMemoryItem {
  key: string;
  id: string;
  type: 'fact' | 'preference' | 'goal' | 'pattern';
  content: string;
  confidence: number;
  lastAccessed: Date;
  accessCount: number;
  tags: string[];
}

export interface ConversationMetadata {
  totalMessages?: number;
  totalTokens?: number;
  averageResponseTime?: number;
  satisfactionScore?: number;
  languages?: string[];
  topics?: string[];
  flags?: string[];
  tags?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  source?: string;
}

// User and Preferences
export interface UserPreferences {
  language: string;
  communicationStyle: 'formal' | 'casual' | 'technical' | 'friendly';
  responseLength: 'concise' | 'detailed' | 'adaptive';
  expertise: Record<string, number>; // domain -> proficiency level (0-10)
  interests: string[];
  timezone: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  enabled: boolean;
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  types: string[];
}

// AI Processing Types
export interface AIResponse {
  content: string;
  confidence: number;
  reasoning?: string;
  alternatives?: string[];
  metadata: AIResponseMetadata;
  tokens: TokenUsage;
  processingTime: number;
}

export interface AIResponseMetadata {
  model: string;
  temperature: number;
  maxTokens: number;
  stopSequences?: string[];
  intent: string;
  sentiment: SentimentAnalysis;
  entities: Entity[];
  suggestedActions: SuggestedAction[];
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
  cost?: number;
}

export interface SuggestedAction {
  type: 'follow_up' | 'clarification' | 'resource' | 'task' | 'escalation';
  description: string;
  confidence: number;
  payload?: Record<string, any>;
}

// Natural Language Processing
export interface SentimentAnalysis {
  score: number; // -1 to 1
  magnitude: number; // 0 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface Entity {
  text: string;
  type: EntityType;
  confidence: number;
  startIndex: number;
  endIndex: number;
  metadata?: Record<string, any>;
}

export type EntityType =
  | 'person' | 'organization' | 'location' | 'date' | 'time'
  | 'money' | 'email' | 'phone' | 'url' | 'number'
  | 'product' | 'technology' | 'concept' | 'custom';

export interface IntentClassification {
  intent: string;
  confidence: number;
  parameters: Record<string, any>;
  domain?: string;
}

// AI Model Configuration
export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  model: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  apiKey?: string;
  endpoint?: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  systemPrompt?: string;
  timeout?: number;
  retries?: number;
  responseFormat?: any;
}

export type ChatbotCapability =
  | 'text_processing' | 'context_awareness' | 'multi_turn_conversation'
  | 'intent_recognition' | 'entity_extraction' | 'sentiment_analysis'
  | 'multi_language' | 'voice_support' | 'file_processing'
  | 'image_analysis' | 'code_execution' | 'web_search';

export interface ChatbotConfig {
  name: string;
  description: string;
  version?: string;
  personality: PersonalityConfig;
  capabilities: ChatbotCapability[];
  limitations?: string[];
  aiModel: AIModelConfig;
  security: SecurityConfig;
  memory: MemoryConfig;
  features: FeatureConfig;
}

export interface PersonalityConfig {
  name?: string;
  description?: string;
  tone: 'professional' | 'friendly' | 'casual' | 'formal';
  style: 'concise' | 'detailed' | 'conversational' | 'technical' | 'adaptive';
  expertiseLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  traits?: Record<string, number>; // trait -> strength (0-10)
  communication?: {
    tone: 'professional' | 'friendly' | 'casual' | 'formal';
    style: 'concise' | 'detailed' | 'conversational' | 'technical';
    humor: number; // 0-10
    empathy: number; // 0-10
  };
  expertise?: Record<string, number>; // domain -> level (0-10)
}

export interface SecurityConfig {
  enabled: boolean;
  contentFiltering: boolean;
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    tokensPerHour: number;
  };
  dataRetention: {
    conversationTTL: number; // days
    userDataTTL: number; // days
    anonymization: boolean;
  };
  auditLogging: boolean;
}

export interface MemoryConfig {
  workingMemory: {
    maxItems: number;
    ttl: number; // seconds
  };
  longTermMemory: {
    enabled: boolean;
    maxItems: number;
    persistenceLevel: 'session' | 'user' | 'global';
  };
  contextWindow: number; // number of messages to include in context
}

export interface FeatureConfig {
  multiLanguage: boolean;
  voiceSupport: boolean;
  fileProcessing: boolean;
  imageAnalysis: boolean;
  codeExecution: boolean;
  webSearch: boolean;
  integrations: string[];
}

// Event System
export interface ChatbotEvent {
  id: string;
  type: ChatbotEventType;
  timestamp: Date;
  conversationId: string;
  userId?: string;
  data: Record<string, any>;
}

export type ChatbotEventType =
  | 'conversation_started' | 'conversation_ended'
  | 'message_received' | 'message_sent'
  | 'intent_classified' | 'entity_extracted'
  | 'context_updated' | 'error_occurred'
  | 'feature_used' | 'feedback_received';

// Error Handling
export interface ChatbotError extends Error {
  code: string;
  type: 'validation' | 'processing' | 'ai_model' | 'security' | 'rate_limit' | 'system';
  conversationId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  recoverable: boolean;
}

// Analytics and Metrics
export interface ConversationMetrics {
  totalConversations: number;
  activeConversations: number;
  averageLength: number;
  averageDuration: number;
  satisfactionScore: number;
  completionRate: number;
  escalationRate: number;
}

export interface AIMetrics {
  totalRequests: number;
  totalTokens: number;
  averageResponseTime: number;
  errorRate: number;
  modelAccuracy: number;
  costMetrics: CostMetrics;
}

export interface CostMetrics {
  totalCost: number;
  costPerConversation: number;
  costPerToken: number;
  period: string;
}

// Plugin System
export interface ChatbotPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  initialize: (chatbot: any) => Promise<void>;
  process: (message: Message, context: ConversationContext) => Promise<PluginResponse>;
  cleanup?: () => Promise<void>;
}

export interface PluginResponse {
  handled: boolean;
  response?: string;
  actions?: SuggestedAction[];
  contextUpdates?: Partial<ConversationContext>;
  metadata?: Record<string, any>;
}

// Integration Types
export interface ExternalIntegration {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'database' | 'service';
  config: Record<string, any>;
  enabled: boolean;
}

export interface WebhookConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  authentication?: {
    type: 'bearer' | 'basic' | 'api_key';
    credentials: Record<string, string>;
  };
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ChatbotEventHandler<T = any> = (event: ChatbotEvent & { data: T }) => void | Promise<void>;

export type MessageProcessor = (message: Message, context: ConversationContext) => Promise<AIResponse>;

export type ContextProvider = (conversationId: string, userId?: string) => Promise<ConversationContext>;

export type SecurityValidator = (message: Message, context: any) => Promise<boolean>;

// Configuration validation schemas (for runtime validation)
export interface ValidationSchema {
  message: any;
  conversation: any;
  config: any;
  user: any;
}
