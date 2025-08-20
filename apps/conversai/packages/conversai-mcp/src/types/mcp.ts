/**
 * Type definitions for MCP Server Template
 */

import { z } from 'zod';

/**
 * MCP Tool definition
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * MCP Resource definition
 */
export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

/**
 * MCP Prompt definition
 */
export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

/**
 * Server health status
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  version: string;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }>;
}

/**
 * Request context
 */
export interface RequestContext {
  requestId: string;
  startTime: number;
  user?: {
    id: string;
    roles: string[];
  };
  metadata?: Record<string, any>;
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: {
    code: number;
    message: string;
    details?: any;
  };
  requestId: string;
  timestamp: string;
}

/**
 * Configuration schemas
 */
export const ToolConfigSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  enabled: z.boolean().default(true),
  timeout: z.number().positive().default(30000),
  retries: z.number().min(0).default(0),
});

export const SecurityConfigSchema = z.object({
  enableAuth: z.boolean().default(false),
  allowedOrigins: z.array(z.string()).default(['*']),
  rateLimiting: z.object({
    enabled: z.boolean().default(true),
    windowMs: z.number().positive().default(900000),
    max: z.number().positive().default(100),
  }),
});

export type ToolConfig = z.infer<typeof ToolConfigSchema>;
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;
