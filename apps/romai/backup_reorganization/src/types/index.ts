// Common types for CODAI ecosystem apps
export interface AppConfig {
  name: string;
  version: string;
  description: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
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