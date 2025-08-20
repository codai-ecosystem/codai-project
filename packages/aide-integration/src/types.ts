/**
 * Common types for AIDE ecosystem integration
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'contributor' | 'viewer';
  createdAt: Date;
  lastActiveAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  collaborators: string[];
  status: 'draft' | 'active' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  deploymentUrl?: string;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
  details?: Record<string, any>;
}

export interface IntegrationMetrics {
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  activeConnections: number;
}

// Event types for the ecosystem
export type AIDEEventType =
  | 'user.login'
  | 'user.logout'
  | 'project.created'
  | 'project.updated'
  | 'project.published'
  | 'project.deleted'
  | 'system.health_check'
  | 'system.error'
  | 'analytics.tracked';

// Service status enumeration
export enum ServiceStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error',
  SHUTTING_DOWN = 'shutting_down',
}
