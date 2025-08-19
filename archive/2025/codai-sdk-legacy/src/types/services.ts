/**
 * Service-specific types and interfaces
 */

// Gateway Service Types
export interface GatewayService {
  name: string;
  url: string;
  health: 'healthy' | 'unhealthy' | 'degraded';
  version: string;
  uptime: number;
  lastCheck: string;
}

export interface ServiceRegistry {
  services: GatewayService[];
  total: number;
  healthy: number;
  unhealthy: number;
}

// CBD Universal Database Types
export interface CBDDocument {
  id: string;
  collection: string;
  data: Record<string, any>;
  created: string;
  updated: string;
}

export interface CBDQuery {
  collection: string;
  filter?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  limit?: number;
  offset?: number;
}

export interface CBDVector {
  id: string;
  vector: number[];
  metadata?: Record<string, any>;
}

export interface CBDGraph {
  nodes: Array<{
    id: string;
    label: string;
    properties: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    type: string;
    properties: Record<string, any>;
  }>;
}

export type CBDParadigm = 'document' | 'vector' | 'graph' | 'kv' | 'timeseries' | 'file';

// Identity Service Types
export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  status: 'active' | 'inactive' | 'suspended';
  created: string;
  lastLogin?: string;
}

export interface AuthToken {
  token: string;
  type: 'bearer' | 'refresh';
  expiresAt: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

// Hub Service Types
export interface HubService {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  url: string;
  health: 'healthy' | 'unhealthy';
  dependencies: string[];
  config: Record<string, any>;
}

export interface HubIntegration {
  id: string;
  name: string;
  services: string[];
  status: 'active' | 'inactive';
  config: Record<string, any>;
}

// ControlAI Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  owner: string;
  team: string[];
  created: string;
  deadline?: string;
  progress: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created: string;
  due?: string;
  completed?: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: 'available' | 'busy' | 'offline';
  workload: number;
  performance: {
    tasksCompleted: number;
    averageTime: number;
    successRate: number;
  };
}

// RomAI Types
export interface RomAIQuery {
  question: string;
  language?: 'ro' | 'en';
  context?: string;
  region?: string;
}

export interface RomAIResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  language: 'ro' | 'en';
  region?: string;
  metadata: {
    processingTime: number;
    model: string;
    tokens: number;
  };
}

export interface RomAIAnalytics {
  totalQueries: number;
  activeUsers: number;
  successRate: number;
  averageResponseTime: number;
  popularRegions: Array<{
    region: string;
    count: number;
  }>;
  languageDistribution: {
    romanian: number;
    english: number;
  };
}

// BancAI Types
export interface BancAIAccount {
  id: string;
  accountNumber: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  owner: string;
}

export interface BancAITransaction {
  id: string;
  accountId: string;
  type: 'debit' | 'credit';
  amount: number;
  currency: string;
  description: string;
  category?: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

// MemorAI Types
export interface Memory {
  id: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  tags: string[];
  metadata: Record<string, any>;
  embedding?: number[];
  created: string;
  accessed: string;
  relevance?: number;
}

export interface MemoryQuery {
  query: string;
  type?: string;
  tags?: string[];
  limit?: number;
  threshold?: number;
}

export interface MemoryCollection {
  id: string;
  name: string;
  description: string;
  memories: string[];
  created: string;
  updated: string;
}

// Admin Dashboard Types
export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    incoming: number;
    outgoing: number;
  };
}

export interface ServiceMetrics {
  name: string;
  requests: {
    total: number;
    success: number;
    error: number;
    rate: number;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  errors: Array<{
    message: string;
    count: number;
    lastOccurred: string;
  }>;
}

export interface AdminAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

// CODAI App Service Types
export interface CODAIProject {
  id: string;
  name: string;
  description: string;
  type: 'web' | 'mobile' | 'api' | 'ml' | 'other';
  status: 'planning' | 'development' | 'testing' | 'deployed' | 'archived';
  technologies: string[];
  repository?: string;
  owner: string;
  collaborators: Array<{
    email: string;
    role: 'viewer' | 'contributor' | 'admin';
    added: string;
  }>;
  created: string;
  updated: string;
  ai_assistance?: {
    enabled: boolean;
    model?: string;
    features?: string[];
  };
  metadata?: Record<string, any>;
}

export interface CODAIChat {
  id: string;
  project_id: string;
  title: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  created: string;
  updated: string;
  active: boolean;
  metadata?: Record<string, any>;
}
