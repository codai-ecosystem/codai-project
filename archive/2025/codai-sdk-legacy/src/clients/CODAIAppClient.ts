/**
 * CODAI App Client for CODAI SDK
 * Manages main CODAI application features, projects, and AI assistance
 */

import type { 
  CODAIConfig, 
  ApiResponse, 
  ServiceHealth,
  PaginationParams,
  PaginatedResponse
} from '../types/common';
import type { 
  CODAIProject, 
  CODAIChat 
} from '../types/services';
import { BaseClient } from './BaseClient';

export class CODAIAppClient extends BaseClient {
  constructor(config: CODAIConfig) {
    super(config.endpoints.codai, config);
  }

  /**
   * Get CODAI app health status
   */
  async health(): Promise<ApiResponse<ServiceHealth>> {
    return this.request<ServiceHealth>({
      method: 'GET',
      url: '/health'
    });
  }

  /**
   * Get CODAI dashboard overview
   */
  async getDashboard(): Promise<ApiResponse<{
    projects: {
      total: number;
      active: number;
      completed: number;
      byType: Record<string, number>;
      byStatus: Record<string, number>;
    };
    ai_assistance: {
      total_chats: number;
      active_sessions: number;
      models_available: string[];
      features_enabled: string[];
    };
    collaboration: {
      team_members: number;
      shared_projects: number;
      recent_activity: Array<{
        type: string;
        description: string;
        user: string;
        timestamp: string;
      }>;
    };
    analytics: {
      code_generation: number;
      ai_interactions: number;
      deployment_success_rate: number;
      avg_project_duration: number;
    };
  }>> {
    return this.request({
      method: 'GET',
      url: '/dashboard'
    });
  }

  // Project Management

  /**
   * Get all projects
   */
  async getProjects(
    filters?: {
      type?: 'web' | 'mobile' | 'api' | 'ml' | 'other';
      status?: 'planning' | 'development' | 'testing' | 'deployed' | 'archived';
      owner?: string;
      collaborator?: string;
      search?: string;
      technologies?: string[];
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<CODAIProject>>> {
    return this.request<PaginatedResponse<CODAIProject>>({
      method: 'GET',
      url: '/projects',
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<ApiResponse<CODAIProject>> {
    return this.request<CODAIProject>({
      method: 'GET',
      url: `/projects/${projectId}`
    });
  }

  /**
   * Create new project
   */
  async createProject(project: {
    name: string;
    description: string;
    type: 'web' | 'mobile' | 'api' | 'ml' | 'other';
    technologies?: string[];
    repository?: string;
    collaborators?: string[];
    aiAssistance?: {
      enabled: boolean;
      model?: string;
      features?: string[];
    };
  }): Promise<ApiResponse<CODAIProject>> {
    return this.request<CODAIProject>({
      method: 'POST',
      url: '/projects',
      data: project
    });
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    updates: Partial<CODAIProject>
  ): Promise<ApiResponse<CODAIProject>> {
    return this.request<CODAIProject>({
      method: 'PUT',
      url: `/projects/${projectId}`,
      data: updates
    });
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/projects/${projectId}`
    });
  }

  /**
   * Archive project
   */
  async archiveProject(projectId: string): Promise<ApiResponse<CODAIProject>> {
    return this.request<CODAIProject>({
      method: 'POST',
      url: `/projects/${projectId}/archive`
    });
  }

  /**
   * Clone project
   */
  async cloneProject(
    projectId: string,
    newName: string
  ): Promise<ApiResponse<CODAIProject>> {
    return this.request<CODAIProject>({
      method: 'POST',
      url: `/projects/${projectId}/clone`,
      data: { name: newName }
    });
  }

  /**
   * Add collaborator to project
   */
  async addCollaborator(
    projectId: string,
    collaboratorEmail: string,
    role?: 'viewer' | 'contributor' | 'admin'
  ): Promise<ApiResponse<{
    success: boolean;
    collaborator: {
      email: string;
      role: string;
      added: string;
    };
  }>> {
    return this.request({
      method: 'POST',
      url: `/projects/${projectId}/collaborators`,
      data: { email: collaboratorEmail, role: role || 'contributor' }
    });
  }

  /**
   * Remove collaborator from project
   */
  async removeCollaborator(
    projectId: string,
    collaboratorEmail: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/projects/${projectId}/collaborators/${collaboratorEmail}`
    });
  }

  // AI Chat & Assistance

  /**
   * Get project chats
   */
  async getProjectChats(projectId: string): Promise<ApiResponse<CODAIChat[]>> {
    return this.request<CODAIChat[]>({
      method: 'GET',
      url: `/projects/${projectId}/chats`
    });
  }

  /**
   * Get chat by ID
   */
  async getChat(chatId: string): Promise<ApiResponse<CODAIChat>> {
    return this.request<CODAIChat>({
      method: 'GET',
      url: `/chats/${chatId}`
    });
  }

  /**
   * Create new chat
   */
  async createChat(
    projectId: string,
    title?: string
  ): Promise<ApiResponse<CODAIChat>> {
    return this.request<CODAIChat>({
      method: 'POST',
      url: `/projects/${projectId}/chats`,
      data: { title }
    });
  }

  /**
   * Send message to AI
   */
  async sendMessage(
    chatId: string,
    message: string,
    options?: {
      model?: string;
      context?: Record<string, any>;
      tools?: string[];
      temperature?: number;
    }
  ): Promise<ApiResponse<{
    message: {
      id: string;
      role: 'assistant';
      content: string;
      timestamp: string;
      metadata: Record<string, any>;
    };
    usage?: {
      tokens: number;
      cost: number;
    };
  }>> {
    return this.request({
      method: 'POST',
      url: `/chats/${chatId}/messages`,
      data: { message, options }
    });
  }

  /**
   * Get AI suggestions for project
   */
  async getAISuggestions(
    projectId: string,
    context?: string
  ): Promise<ApiResponse<{
    suggestions: Array<{
      type: 'architecture' | 'technology' | 'best-practice' | 'optimization';
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      implementation: string[];
      benefits: string[];
      effort: 'low' | 'medium' | 'high';
    }>;
    insights: Array<{
      category: string;
      observation: string;
      recommendation: string;
      confidence: number;
    }>;
  }>> {
    return this.request({
      method: 'POST',
      url: `/projects/${projectId}/ai/suggestions`,
      data: { context }
    });
  }

  /**
   * Generate code with AI
   */
  async generateCode(request: {
    projectId: string;
    prompt: string;
    language?: string;
    framework?: string;
    style?: 'function' | 'class' | 'component' | 'module';
    context?: {
      files?: Array<{
        path: string;
        content: string;
      }>;
      dependencies?: string[];
      requirements?: string[];
    };
  }): Promise<ApiResponse<{
    code: string;
    language: string;
    explanation: string;
    suggestions: string[];
    tests?: string;
    documentation?: string;
    metadata: {
      model: string;
      tokens: number;
      confidence: number;
    };
  }>> {
    return this.request({
      method: 'POST',
      url: '/ai/generate-code',
      data: request
    });
  }

  /**
   * Review code with AI
   */
  async reviewCode(request: {
    projectId: string;
    code: string;
    language: string;
    focus?: Array<'security' | 'performance' | 'maintainability' | 'style' | 'bugs'>;
    context?: string;
  }): Promise<ApiResponse<{
    overall_score: number;
    issues: Array<{
      type: 'error' | 'warning' | 'suggestion' | 'style';
      category: 'security' | 'performance' | 'maintainability' | 'style' | 'logic';
      line?: number;
      column?: number;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      fix_suggestion?: string;
    }>;
    improvements: Array<{
      category: string;
      suggestion: string;
      example?: string;
      impact: 'low' | 'medium' | 'high';
    }>;
    summary: {
      total_issues: number;
      by_severity: Record<string, number>;
      by_category: Record<string, number>;
    };
  }>> {
    return this.request({
      method: 'POST',
      url: '/ai/review-code',
      data: request
    });
  }

  // Templates & Boilerplates

  /**
   * Get available templates
   */
  async getTemplates(filters?: {
    type?: 'web' | 'mobile' | 'api' | 'ml' | 'other';
    technology?: string;
    complexity?: 'beginner' | 'intermediate' | 'advanced';
    category?: string;
  }): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    technologies: string[];
    complexity: string;
    category: string;
    features: string[];
    preview_url?: string;
    documentation_url?: string;
    downloads: number;
    rating: number;
    created: string;
    updated: string;
  }>>> {
    return this.request({
      method: 'GET',
      url: '/templates',
      params: filters
    });
  }

  /**
   * Create project from template
   */
  async createFromTemplate(
    templateId: string,
    projectData: {
      name: string;
      description?: string;
      customizations?: Record<string, any>;
    }
  ): Promise<ApiResponse<{
    project: CODAIProject;
    setup_instructions: string[];
    next_steps: string[];
  }>> {
    return this.request({
      method: 'POST',
      url: `/templates/${templateId}/create-project`,
      data: projectData
    });
  }

  // Deployment & CI/CD

  /**
   * Get deployment options
   */
  async getDeploymentOptions(projectId: string): Promise<ApiResponse<{
    platforms: Array<{
      name: string;
      type: 'static' | 'serverless' | 'container' | 'traditional';
      supported: boolean;
      requirements: string[];
      features: string[];
      pricing: string;
    }>;
    recommendations: Array<{
      platform: string;
      score: number;
      reasoning: string[];
      setup_complexity: 'low' | 'medium' | 'high';
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: `/projects/${projectId}/deployment/options`
    });
  }

  /**
   * Deploy project
   */
  async deployProject(
    projectId: string,
    deployment: {
      platform: string;
      environment: 'development' | 'staging' | 'production';
      config: Record<string, any>;
    }
  ): Promise<ApiResponse<{
    deployment_id: string;
    status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
    url?: string;
    logs_url: string;
    estimated_duration: number;
  }>> {
    return this.request({
      method: 'POST',
      url: `/projects/${projectId}/deployment/deploy`,
      data: deployment
    });
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<ApiResponse<{
    id: string;
    status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
    progress: number;
    url?: string;
    logs: string[];
    started: string;
    completed?: string;
    error?: string;
  }>> {
    return this.request({
      method: 'GET',
      url: `/deployments/${deploymentId}/status`
    });
  }

  // Analytics & Insights

  /**
   * Get project analytics
   */
  async getProjectAnalytics(
    projectId: string,
    period?: '7d' | '30d' | '90d' | '1y'
  ): Promise<ApiResponse<{
    development: {
      commits: number;
      lines_of_code: number;
      files_changed: number;
      ai_assistance_usage: number;
    };
    collaboration: {
      collaborators: number;
      messages: number;
      shared_resources: number;
    };
    deployment: {
      total_deployments: number;
      success_rate: number;
      average_duration: number;
      uptime: number;
    };
    ai_metrics: {
      code_generated: number;
      reviews_performed: number;
      suggestions_implemented: number;
      time_saved_hours: number;
    };
    timeline: Array<{
      date: string;
      commits: number;
      deployments: number;
      ai_interactions: number;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: `/projects/${projectId}/analytics`,
      params: { period }
    });
  }

  /**
   * Export project data
   */
  async exportProject(
    projectId: string,
    options: {
      format: 'zip' | 'tar' | 'json';
      include_code?: boolean;
      include_chats?: boolean;
      include_analytics?: boolean;
      include_deployments?: boolean;
    }
  ): Promise<ApiResponse<{
    download_url: string;
    filename: string;
    size: number;
    expires_at: string;
  }>> {
    return this.request({
      method: 'POST',
      url: `/projects/${projectId}/export`,
      data: options
    });
  }

  /**
   * Get global CODAI statistics
   */
  async getGlobalStats(): Promise<ApiResponse<{
    users: {
      total: number;
      active_monthly: number;
      new_this_month: number;
    };
    projects: {
      total: number;
      active: number;
      deployed: number;
      by_type: Record<string, number>;
    };
    ai_usage: {
      total_interactions: number;
      code_generated_lines: number;
      models_used: Record<string, number>;
      time_saved_hours: number;
    };
    platform: {
      uptime: number;
      response_time: number;
      success_rate: number;
    };
  }>> {
    return this.request({
      method: 'GET',
      url: '/stats/global'
    });
  }
}
