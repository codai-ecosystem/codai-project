/**
 * ControlAI Client for CODAI SDK
 * Manages AI project coordination, task management, and agent orchestration
 */

import type { 
  CODAIConfig, 
  ApiResponse, 
  ServiceHealth,
  PaginationParams,
  PaginatedResponse
} from '../types/common';
import type { 
  Project, 
  Task, 
  Agent 
} from '../types/services';
import { BaseClient } from './BaseClient';

export class ControlAIClient extends BaseClient {
  constructor(config: CODAIConfig) {
    super(config.endpoints.controlai, config);
  }

  /**
   * Get ControlAI service health status
   */
  async health(): Promise<ApiResponse<ServiceHealth>> {
    return this.request<ServiceHealth>({
      method: 'GET',
      url: '/health'
    });
  }

  /**
   * Get dashboard overview
   */
  async getDashboard(): Promise<ApiResponse<{
    projects: {
      total: number;
      active: number;
      completed: number;
      overdue: number;
    };
    tasks: {
      total: number;
      todo: number;
      inProgress: number;
      completed: number;
      blocked: number;
    };
    agents: {
      total: number;
      available: number;
      busy: number;
      offline: number;
    };
    performance: {
      averageProjectDuration: number;
      taskCompletionRate: number;
      agentUtilization: number;
    };
    recentActivity: Array<{
      type: string;
      description: string;
      timestamp: string;
      user?: string;
    }>;
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
      status?: 'active' | 'completed' | 'paused';
      owner?: string;
      team?: string;
      search?: string;
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Project>>> {
    return this.request<PaginatedResponse<Project>>({
      method: 'GET',
      url: '/projects',
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    return this.request<Project>({
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
    owner: string;
    team?: string[];
    deadline?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
  }): Promise<ApiResponse<Project>> {
    return this.request<Project>({
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
    updates: Partial<Project>
  ): Promise<ApiResponse<Project>> {
    return this.request<Project>({
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
   * Get project analytics
   */
  async getProjectAnalytics(projectId: string): Promise<ApiResponse<{
    progress: {
      overall: number;
      byPhase: Record<string, number>;
      timeline: Array<{
        date: string;
        progress: number;
      }>;
    };
    tasks: {
      total: number;
      completed: number;
      overdue: number;
      byStatus: Record<string, number>;
    };
    team: {
      members: number;
      utilization: Array<{
        member: string;
        utilization: number;
      }>;
    };
    timeline: {
      estimatedCompletion: string;
      actualProgress: number;
      milestones: Array<{
        name: string;
        date: string;
        completed: boolean;
      }>;
    };
  }>> {
    return this.request({
      method: 'GET',
      url: `/projects/${projectId}/analytics`
    });
  }

  // Task Management

  /**
   * Get tasks for project
   */
  async getProjectTasks(
    projectId: string,
    filters?: {
      status?: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
      assignee?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return this.request<PaginatedResponse<Task>>({
      method: 'GET',
      url: `/projects/${projectId}/tasks`,
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Get all tasks (across projects)
   */
  async getTasks(
    filters?: {
      projectId?: string;
      status?: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
      assignee?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      dueDate?: string;
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return this.request<PaginatedResponse<Task>>({
      method: 'GET',
      url: '/tasks',
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>({
      method: 'GET',
      url: `/tasks/${taskId}`
    });
  }

  /**
   * Create new task
   */
  async createTask(task: {
    projectId: string;
    title: string;
    description: string;
    assignee?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours?: number;
    dueDate?: string;
    dependencies?: string[];
    tags?: string[];
  }): Promise<ApiResponse<Task>> {
    return this.request<Task>({
      method: 'POST',
      url: '/tasks',
      data: task
    });
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<ApiResponse<Task>> {
    return this.request<Task>({
      method: 'PUT',
      url: `/tasks/${taskId}`,
      data: updates
    });
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/tasks/${taskId}`
    });
  }

  /**
   * Assign task to agent/user
   */
  async assignTask(
    taskId: string,
    assignee: string
  ): Promise<ApiResponse<Task>> {
    return this.request<Task>({
      method: 'PUT',
      url: `/tasks/${taskId}/assign`,
      data: { assignee }
    });
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskId: string,
    status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked',
    comment?: string
  ): Promise<ApiResponse<Task>> {
    return this.request<Task>({
      method: 'PUT',
      url: `/tasks/${taskId}/status`,
      data: { status, comment }
    });
  }

  /**
   * Log time on task
   */
  async logTime(
    taskId: string,
    hours: number,
    description?: string
  ): Promise<ApiResponse<{
    success: boolean;
    totalHours: number;
  }>> {
    return this.request({
      method: 'POST',
      url: `/tasks/${taskId}/time`,
      data: { hours, description }
    });
  }

  // Agent Management

  /**
   * Get all agents
   */
  async getAgents(
    filters?: {
      type?: string;
      status?: 'available' | 'busy' | 'offline' | 'error';
      capability?: string;
    }
  ): Promise<ApiResponse<Agent[]>> {
    return this.request<Agent[]>({
      method: 'GET',
      url: '/agents',
      params: filters
    });
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string): Promise<ApiResponse<Agent>> {
    return this.request<Agent>({
      method: 'GET',
      url: `/agents/${agentId}`
    });
  }

  /**
   * Register new agent
   */
  async registerAgent(agent: {
    name: string;
    type: string;
    capabilities: string[];
    config?: Record<string, any>;
  }): Promise<ApiResponse<Agent>> {
    return this.request<Agent>({
      method: 'POST',
      url: '/agents',
      data: agent
    });
  }

  /**
   * Update agent configuration
   */
  async updateAgent(
    agentId: string,
    updates: Partial<Agent>
  ): Promise<ApiResponse<Agent>> {
    return this.request<Agent>({
      method: 'PUT',
      url: `/agents/${agentId}`,
      data: updates
    });
  }

  /**
   * Deactivate agent
   */
  async deactivateAgent(agentId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      url: `/agents/${agentId}/deactivate`
    });
  }

  /**
   * Get agent performance metrics
   */
  async getAgentMetrics(agentId: string): Promise<ApiResponse<{
    performance: {
      tasksCompleted: number;
      averageTime: number;
      successRate: number;
      efficiency: number;
    };
    workload: {
      current: number;
      capacity: number;
      utilization: number;
    };
    timeline: Array<{
      date: string;
      tasksCompleted: number;
      averageTime: number;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: `/agents/${agentId}/metrics`
    });
  }

  // AI Orchestration

  /**
   * Get AI recommendations for task assignment
   */
  async getTaskRecommendations(taskId: string): Promise<ApiResponse<{
    recommendations: Array<{
      agentId: string;
      agentName: string;
      score: number;
      reasoning: string;
      estimatedTime: number;
    }>;
    confidence: number;
  }>> {
    return this.request({
      method: 'GET',
      url: `/tasks/${taskId}/recommendations`
    });
  }

  /**
   * Auto-assign tasks using AI
   */
  async autoAssignTasks(
    projectId?: string,
    criteria?: {
      priority?: boolean;
      workload?: boolean;
      skills?: boolean;
      performance?: boolean;
    }
  ): Promise<ApiResponse<{
    assigned: number;
    skipped: number;
    assignments: Array<{
      taskId: string;
      agentId: string;
      score: number;
    }>;
  }>> {
    return this.request({
      method: 'POST',
      url: '/tasks/auto-assign',
      data: { projectId, criteria }
    });
  }

  /**
   * Optimize project timeline
   */
  async optimizeTimeline(projectId: string): Promise<ApiResponse<{
    optimized: boolean;
    changes: Array<{
      taskId: string;
      field: string;
      oldValue: any;
      newValue: any;
      reason: string;
    }>;
    estimatedImprovement: {
      timeReduction: number;
      efficiencyGain: number;
    };
  }>> {
    return this.request({
      method: 'POST',
      url: `/projects/${projectId}/optimize`
    });
  }

  // Workflow Automation

  /**
   * Get available workflows
   */
  async getWorkflows(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    triggers: string[];
    actions: string[];
    enabled: boolean;
    created: string;
  }>>> {
    return this.request({
      method: 'GET',
      url: '/workflows'
    });
  }

  /**
   * Create workflow
   */
  async createWorkflow(workflow: {
    name: string;
    description: string;
    triggers: Array<{
      type: string;
      conditions: Record<string, any>;
    }>;
    actions: Array<{
      type: string;
      parameters: Record<string, any>;
    }>;
  }): Promise<ApiResponse<{
    id: string;
    name: string;
    enabled: boolean;
  }>> {
    return this.request({
      method: 'POST',
      url: '/workflows',
      data: workflow
    });
  }

  /**
   * Toggle workflow
   */
  async toggleWorkflow(
    workflowId: string,
    enabled: boolean
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'PUT',
      url: `/workflows/${workflowId}/toggle`,
      data: { enabled }
    });
  }

  /**
   * Get workflow execution history
   */
  async getWorkflowHistory(
    workflowId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    status: 'success' | 'failed' | 'running';
    trigger: string;
    startTime: string;
    endTime?: string;
    error?: string;
    results: Record<string, any>;
  }>>> {
    return this.request({
      method: 'GET',
      url: `/workflows/${workflowId}/history`,
      params: pagination
    });
  }
}
