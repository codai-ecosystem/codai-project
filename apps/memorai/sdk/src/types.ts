export interface Memory {
  id: string;
  content: string;
  title?: string;
  category?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  metadata?: Record<string, any>;
  vector?: number[];
}

export interface MemoryInput {
  content: string;
  title?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MemoryUpdate {
  content?: string;
  title?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  algorithm?: 'exact' | 'fulltext' | 'semantic' | 'fuzzy';
  limit?: number;
  offset?: number;
  category?: string;
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
  threshold?: number;
}

export interface SearchResult {
  memories: Memory[];
  total: number;
  took: number;
  algorithm: string;
  query: string;
}

export interface AnalyticsData {
  totalMemories: number;
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  recentActivity: Array<{
    date: string;
    count: number;
    type: string;
  }>;
  searchPatterns: Array<{
    query: string;
    count: number;
    avgResponseTime: number;
  }>;
  performanceMetrics: {
    avgResponseTime: number;
    cacheHitRate: number;
    totalRequests: number;
    errorRate: number;
  };
}

export interface WebSocketMessage {
  type: 'memory_created' | 'memory_updated' | 'memory_deleted' | 'user_connected' | 'user_disconnected';
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    took?: number;
  };
}

export interface SDKOptions {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  enableWebSocket?: boolean;
  wsUrl?: string;
  debug?: boolean;
}

export interface PerformanceMetrics {
  responseTime: number;
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  cacheHit?: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  count: number;
  createdAt: Date;
}

export interface Tag {
  name: string;
  count: number;
  category?: string;
}

export interface UserSession {
  userId: string;
  sessionId: string;
  isAuthenticated: boolean;
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  checks: Record<string, {
    status: 'pass' | 'fail';
    message?: string;
    responseTime?: number;
  }>;
}

export interface BatchOperation<T> {
  operation: 'create' | 'update' | 'delete';
  data: T;
  id?: string;
}

export interface BatchResult<T> {
  successful: Array<{ id: string; data: T }>;
  failed: Array<{ error: string; data: T }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    duration: number;
  };
}

export type EventHandler<T = any> = (data: T) => void;

export interface EventMap {
  'memory:created': Memory;
  'memory:updated': Memory;
  'memory:deleted': { id: string };
  'search:completed': SearchResult;
  'analytics:updated': AnalyticsData;
  'connection:opened': void;
  'connection:closed': void;
  'connection:error': Error;
  'rate_limit:exceeded': RateLimitInfo;
  'performance:metric': PerformanceMetrics;
}
