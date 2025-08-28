/**
 * @fileoverview Configuration for Cautai HTTP Server
 * @author Cautai Team
 * @version 1.0.0
 */

import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

export interface ServerConfig {
  port: number;
  host: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  // Rate limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  
  // JWT configuration
  jwt: {
    secret: string;
    expiresIn: string;
  };
  
  // CORS configuration
  cors: {
    origin: string[];
    credentials: boolean;
  };
  
  // API configuration
  api: {
    prefix: string;
    version: string;
  };
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  logLevel: (process.env.LOG_LEVEL as ServerConfig['logLevel']) || 'info',
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'cautai-dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
    credentials: true,
  },
  
  api: {
    prefix: process.env.API_PREFIX || '/api',
    version: process.env.API_VERSION || 'v1',
  },
};

// Mock types for walking skeleton
export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  domain: string;
  publishedAt?: string;
  score: number;
  citations: string[];
}

export interface ComposeRequest {
  query: string;
  sources: Array<{
    url: string;
    title: string;
    snippet: string;
  }>;
  style?: 'concise' | 'detailed' | 'academic';
}

export interface ComposeResponse {
  answer: string;
  sources: string[];
  confidence: number;
  processingTimeMs: number;
}