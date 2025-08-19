/**
 * Admin Dashboard Client for CODAI SDK
 * Manages admin operations and system monitoring
 */

import type {
  CODAIConfig,
  ApiResponse,
  ServiceHealth,
  PaginationParams,
  PaginatedResponse
} from '../types/common';
import type {
  SystemMetrics,
  ServiceMetrics,
  AdminAlert,
  User
} from '../types/services';
import { BaseClient } from './BaseClient';

export class AdminClient extends BaseClient {
  constructor(config: CODAIConfig) {
    super(config.endpoints.admin, config);
  }

  /**
   * Get admin dashboard health status
   */
  async health(): Promise<ApiResponse<ServiceHealth>> {
    return this.request<ServiceHealth>({
      method: 'GET',
      url: '/health'
    });
  }

  /**
   * Get system overview metrics
   */
  async getSystemOverview(): Promise<ApiResponse<{
    metrics: SystemMetrics;
    services: ServiceMetrics[];
    alerts: AdminAlert[];
    uptime: number;
  }>> {
    return this.request({
      method: 'GET',
      url: '/system/overview'
    });
  }

  /**
   * Get detailed system metrics
   */
  async getSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
    return this.request<SystemMetrics>({
      method: 'GET',
      url: '/system/metrics'
    });
  }

  /**
   * Get service metrics for all services
   */
  async getServiceMetrics(): Promise<ApiResponse<ServiceMetrics[]>> {
    return this.request<ServiceMetrics[]>({
      method: 'GET',
      url: '/services/metrics'
    });
  }

  /**
   * Get metrics for specific service
   */
  async getServiceMetric(serviceName: string): Promise<ApiResponse<ServiceMetrics>> {
    return this.request<ServiceMetrics>({
      method: 'GET',
      url: `/services/${serviceName}/metrics`
    });
  }

  /**
   * Restart a service
   */
  async restartService(serviceName: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: `/services/${serviceName}/restart`
    });
  }

  /**
   * Get service logs
   */
  async getServiceLogs(
    serviceName: string,
    options: {
      lines?: number;
      since?: string;
      level?: 'error' | 'warn' | 'info' | 'debug';
    } = {}
  ): Promise<ApiResponse<string[]>> {
    return this.request<string[]>({
      method: 'GET',
      url: `/services/${serviceName}/logs`,
      params: options
    });
  }

  /**
   * Get all alerts
   */
  async getAlerts(
    filters?: {
      type?: 'info' | 'warning' | 'error' | 'critical';
      acknowledged?: boolean;
      resolved?: boolean;
      source?: string;
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<AdminAlert>>> {
    return this.request<PaginatedResponse<AdminAlert>>({
      method: 'GET',
      url: '/alerts',
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Create a new alert
   */
  async createAlert(alert: {
    type: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    source: string;
  }): Promise<ApiResponse<AdminAlert>> {
    return this.request<AdminAlert>({
      method: 'POST',
      url: '/alerts',
      data: alert
    });
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'PUT',
      url: `/alerts/${alertId}/acknowledge`
    });
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'PUT',
      url: `/alerts/${alertId}/resolve`
    });
  }

  /**
   * Delete an alert
   */
  async deleteAlert(alertId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/alerts/${alertId}`
    });
  }

  /**
   * Get all users (admin function)
   */
  async getUsers(
    filters?: {
      role?: string;
      status?: 'active' | 'inactive' | 'suspended';
      search?: string;
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.request<PaginatedResponse<User>>({
      method: 'GET',
      url: '/users',
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>({
      method: 'GET',
      url: `/users/${userId}`
    });
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.request<User>({
      method: 'PUT',
      url: `/users/${userId}`,
      data: updates
    });
  }

  /**
   * Suspend user
   */
  async suspendUser(userId: string, reason?: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'PUT',
      url: `/users/${userId}/suspend`,
      data: { reason }
    });
  }

  /**
   * Activate user
   */
  async activateUser(userId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'PUT',
      url: `/users/${userId}/activate`
    });
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/users/${userId}`
    });
  }

  /**
   * Get system configuration
   */
  async getSystemConfig(): Promise<ApiResponse<Record<string, any>>> {
    return this.request<Record<string, any>>({
      method: 'GET',
      url: '/system/config'
    });
  }

  /**
   * Update system configuration
   */
  async updateSystemConfig(
    config: Record<string, any>
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'PUT',
      url: '/system/config',
      data: config
    });
  }

  /**
   * Export system data
   */
  async exportData(options: {
    type: 'users' | 'metrics' | 'alerts' | 'logs' | 'all';
    format: 'json' | 'csv' | 'xlsx';
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<{
    downloadUrl: string;
    filename: string;
    size: number;
  }>> {
    return this.request({
      method: 'POST',
      url: '/export',
      data: options
    });
  }

  /**
   * Import system data
   */
  async importData(
    file: File | Buffer,
    type: 'users' | 'config',
    options?: {
      merge?: boolean;
      validate?: boolean;
    }
  ): Promise<ApiResponse<{
    imported: number;
    errors: string[];
    warnings: string[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    return this.request({
      method: 'POST',
      url: '/import',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(
    filters?: {
      user?: string;
      action?: string;
      resource?: string;
      dateRange?: {
        start: string;
        end: string;
      };
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    user: string;
    action: string;
    resource: string;
    details: Record<string, any>;
    timestamp: string;
    ip: string;
    userAgent: string;
  }>>> {
    return this.request({
      method: 'GET',
      url: '/audit',
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Perform system backup
   */
  async createBackup(options: {
    includeData?: boolean;
    includeConfig?: boolean;
    includeUsers?: boolean;
    compression?: 'none' | 'gzip' | 'bzip2';
  }): Promise<ApiResponse<{
    backupId: string;
    filename: string;
    size: number;
    downloadUrl: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/backup',
      data: options
    });
  }

  /**
   * Get backup history
   */
  async getBackups(): Promise<ApiResponse<Array<{
    id: string;
    filename: string;
    size: number;
    created: string;
    status: 'completed' | 'failed' | 'in_progress';
    downloadUrl?: string;
  }>>> {
    return this.request({
      method: 'GET',
      url: '/backup'
    });
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: `/backup/${backupId}/restore`
    });
  }

  /**
   * Get system health check
   */
  async getHealthCheck(): Promise<ApiResponse<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: Array<{
      name: string;
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      lastCheck: string;
    }>;
    database: {
      status: 'connected' | 'disconnected';
      responseTime: number;
    };
    cache: {
      status: 'connected' | 'disconnected';
      hitRate: number;
    };
    storage: {
      available: number;
      total: number;
      percentage: number;
    };
  }>> {
    return this.request({
      method: 'GET',
      url: '/health/check'
    });
  }
}
