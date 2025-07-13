// Core Types
export interface RomaiConfig {
  azure: AzureOpenAIConfig;
  memory: MemoryConfig;
  mcp: McpConfig;
  api: ApiConfig;
}

export interface AzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  apiVersion?: string;
  deploymentName?: string;
}

export interface MemoryConfig {
  provider: 'memorai' | 'local' | 'redis';
  config: Record<string, unknown>;
}

export interface McpConfig {
  port: number;
  name: string;
  version: string;
  description: string;
}

export interface ApiConfig {
  port: number;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  auth: AuthConfig;
}

export interface CorsConfig {
  origin: string | string[];
  credentials: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface AuthConfig {
  jwtSecret: string;
  expiresIn: string;
}

// AI Types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  message: AIMessage;
  usage?: TokenUsage;
  model?: string;
  finishReason?: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// MCP Types
export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface McpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface McpServer {
  name: string;
  version: string;
  description: string;
  tools: McpTool[];
  resources: McpResource[];
}

// Memory Types
export interface MemoryEntry {
  id: string;
  content: string;
  embedding?: number[];
  metadata: MemoryMetadata;
  timestamp: Date;
}

export interface MemoryMetadata {
  entityType?: string;
  importance?: number;
  tags?: string[];
  sessionId?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface MemoryQuery {
  query: string;
  limit?: number;
  threshold?: number;
  filters?: Record<string, unknown>;
}

export interface MemoryResult {
  entry: MemoryEntry;
  similarity: number;
}

// API Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Date;
}

// Intelligence Types
export interface IntelligenceRequest {
  query: string;
  context?: string;
  language?: 'ro' | 'en';
  domain?: string;
  userId?: string;
  sessionId?: string;
}

export interface IntelligenceResponse {
  response: string;
  confidence: number;
  sources?: string[];
  relatedTopics?: string[];
  suggestions?: string[];
}

// Event Types
export interface RomaiEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  source: string;
}

export type EventHandler<T = Record<string, unknown>> = (
  event: RomaiEvent & { payload: T }
) => void | Promise<void>;

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Romanian Language Types
export interface RomanianContext {
  dialect?: 'moldovenesc' | 'oltenesc' | 'ardelean' | 'standard';
  formality?: 'formal' | 'informal';
  domain?: 'business' | 'technical' | 'academic' | 'casual';
}

export interface LocalizationData {
  language: string;
  region: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
}

// Performance Types
export interface PerformanceMetrics {
  responseTime: number;
  tokenUsage: TokenUsage;
  memoryAccess: number;
  cacheHits: number;
  errorRate: number;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: Record<string, ServiceHealth>;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

// Export all types
// Additional module exports will be added as they are created
