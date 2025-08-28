/**
 * TypeScript Type Definitions for MemorAI Components
 * Following Microsoft's TypeScript best practices:
 * - Strict type definitions with proper generics
 * - Interface inheritance and composition
 * - Utility types for better type safety
 * - Proper API response typing
 */

// Base entity interfaces
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimestampedEntity extends BaseEntity {
  timestamp: Date;
}

// Memory-related types
export interface Memory {
  id: string;
  content: string;
  agentId?: string;
  metadata?: MemoryMetadata;
  tags?: string[];
  priority?: string;
  importance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryItem extends BaseEntity {
  title: string;
  content: string;
  category: string;
  tags: readonly string[];
  isFavorite: boolean;
  importance?: number;
  metadata?: MemoryMetadata;
}

export interface MemoryMetadata {
  readonly source?: string;
  readonly category?: string;
  readonly lastAccessed?: string;
  readonly wordCount?: number;
  readonly language?: string;
  readonly project?: string;
  readonly tags?: string[];
  readonly priority?: string;
  readonly importance?: number;
  readonly entityType?: string;
  readonly session?: string;
  readonly [key: string]: unknown;
}

export interface MemoryMetadata {
  readonly source?: string;
  readonly category?: string;
  readonly lastAccessed?: string;
  readonly wordCount?: number;
  readonly language?: string;
}

export interface MemoryStats {
  readonly totalMemories: number;
  readonly recentMemories: number;
  readonly favorites: number;
  readonly connections: number;
}

// AI Search types with strict typing
export interface QueryResult extends BaseEntity {
  title: string;
  content: string;
  type: 'memory' | 'note' | 'document' | 'code' | 'other';
  relevance: number;
  importance?: number;
  tags: readonly string[];
  url?: string;
  metadata?: QueryResultMetadata;
}

export interface QueryResultMetadata {
  readonly source?: string;
  readonly category?: string;
  readonly lastAccessed?: string;
  readonly similarity?: number;
  readonly confidence?: number;
}

export interface QuerySummary {
  readonly totalFound: number;
  readonly searchTime: number;
  readonly query: QueryInfo;
}

export interface QueryInfo {
  readonly originalQuery: string;
  readonly searchType: 'semantic' | 'keyword' | 'hybrid';
  readonly confidence: number;
}

export interface QueryInsights {
  readonly queryAnalysis: string;
  readonly resultPatterns: readonly string[];
  readonly suggestions: readonly string[];
}

export interface QueryResponse<TResult = QueryResult> {
  readonly results: readonly TResult[];
  readonly summary: QuerySummary;
  readonly insights: QueryInsights;
  readonly relatedQueries: readonly string[];
}

// Conversation types with discriminated unions
export type MessageType = 'user' | 'assistant' | 'system';

export interface BaseMessage extends TimestampedEntity {
  type: MessageType;
  content: string;
}

export interface UserMessage extends BaseMessage {
  type: 'user';
  query: string;
}

export interface AssistantMessage extends BaseMessage {
  type: 'assistant';
  results?: readonly QueryResult[];
  metadata?: MessageMetadata;
}

export interface SystemMessage extends BaseMessage {
  type: 'system';
  level?: 'info' | 'warning' | 'error';
}

export type ConversationMessage = UserMessage | AssistantMessage | SystemMessage;

export interface MessageMetadata {
  readonly processingTime: number;
  readonly confidence: number;
  readonly resultCount: number;
}

// AI Insights types
export type InsightType = 'pattern' | 'suggestion' | 'connection' | 'trend';

export interface AIInsight extends BaseEntity {
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  relevantMemories: readonly string[];
}

export interface InsightStats {
  readonly totalInsights: number;
  readonly patternsFound: number;
  readonly suggestionsGenerated: number;
  readonly connectionsDiscovered: number;
}

// Analytics types
export interface MemoryGrowthData {
  readonly date: string;
  readonly count: number;
}

export interface CategoryDistribution {
  readonly name: string;
  readonly value: number;
  readonly color: string;
}

export interface WeeklyActivity {
  readonly day: string;
  readonly memories: number;
  readonly searches: number;
}

export interface AnalyticsData {
  readonly memoryGrowth: readonly MemoryGrowthData[];
  readonly categoryDistribution: readonly CategoryDistribution[];
  readonly weeklyActivity: readonly WeeklyActivity[];
  readonly topTags?: readonly { name: string; count: number }[];
}

// API Response types with generic constraints
export interface APIResponse<TData = unknown> {
  readonly success: boolean;
  readonly data?: TData;
  readonly error?: string;
  readonly metadata?: APIMetadata;
}

export interface APIMetadata {
  readonly timestamp: string;
  readonly processingTime?: number;
  readonly requestId?: string;
  readonly version?: string;
}

// Component prop types with proper constraints
export interface SearchInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: (query: string) => void;
  readonly isLoading: boolean;
  readonly suggestions: readonly string[];
  readonly onSuggestionClick: (suggestion: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
  readonly showSuggestions?: boolean;
  readonly disabled?: boolean;
  readonly 'aria-label'?: string;
  readonly 'aria-describedby'?: string;
}

export interface ConversationViewProps {
  readonly messages: readonly ConversationMessage[];
  readonly onResultSelect?: (result: QueryResult) => void;
  readonly onCopy?: (text: string) => void;
  readonly className?: string;
  readonly showTimestamps?: boolean;
  readonly showMetadata?: boolean;
  readonly maxHeight?: string;
}

export interface SearchHeaderProps {
  readonly sessionId?: string;
  readonly showDetails: boolean;
  readonly onToggleDetails: () => void;
  readonly onClearConversation: () => void;
  readonly onSettingsClick?: () => void;
  readonly messageCount: number;
  readonly className?: string;
  readonly disabled?: boolean;
}

// Hook types
export interface UseAISearchOptions {
  readonly sessionId?: string;
  readonly maxResults?: number;
  readonly showSuggestions?: boolean;
  readonly autoLoadSuggestions?: boolean;
  readonly debounceMs?: number;
}

export interface UseAISearchReturn {
  // State (readonly for external consumers)
  readonly query: string;
  readonly conversation: readonly ConversationMessage[];
  readonly isLoading: boolean;
  readonly suggestions: readonly string[];
  readonly relatedQueries: readonly string[];
  readonly showDetails: boolean;
  readonly currentSessionId: string;
  readonly error: string | null;

  // Actions
  readonly setQuery: (query: string) => void;
  readonly handleSubmit: (queryText?: string) => Promise<void>;
  readonly clearConversation: () => void;
  readonly toggleDetails: () => void;
  readonly loadSuggestions: () => Promise<void>;
  readonly retry: () => Promise<void>;

  // Utils
  readonly generateResponseMessage: (response: QueryResponse) => string;
  readonly formatTimestamp: (timestamp: Date) => string;
  readonly copyToClipboard: (text: string) => Promise<void>;
}

// Error types for better error handling
export interface MemorAIError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;
}

export class APIError extends Error implements MemorAIError {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export class ValidationError extends Error implements MemorAIError {
  public readonly code: string = 'VALIDATION_ERROR';
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.timestamp = new Date();
  }
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Form validation types
export interface FormValidationResult {
  readonly isValid: boolean;
  readonly errors: Record<string, string>;
}

export type ValidationRule<T> = (value: T) => string | null;

// Theme and styling types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ComponentSize = 'sm' | 'md' | 'lg';
export type ComponentVariant = 'default' | 'secondary' | 'outline' | 'ghost';

// Performance monitoring types
export interface PerformanceMetrics {
  readonly renderTime: number;
  readonly componentName: string;
  readonly propsHash: string;
  readonly timestamp: Date;
}