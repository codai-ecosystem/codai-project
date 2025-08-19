/**
 * Hub Service Client for CODAI SDK
 * Manages service integrations, marketplace, and hub ecosystem
 */

import type { 
  CODAIConfig, 
  ApiResponse, 
  ServiceHealth,
  PaginationParams,
  PaginatedResponse
} from '../types/common';
import type { 
  HubService, 
  HubIntegration 
} from '../types/services';
import { BaseClient } from './BaseClient';

export class HubClient extends BaseClient {
  constructor(config: CODAIConfig) {
    super(config.endpoints.hub, config);
  }

  /**
   * Get Hub service health status
   */
  async health(): Promise<ApiResponse<ServiceHealth>> {
    return this.request<ServiceHealth>({
      method: 'GET',
      url: '/health'
    });
  }

  /**
   * Get hub overview
   */
  async getOverview(): Promise<ApiResponse<{
    totalServices: number;
    activeServices: number;
    totalIntegrations: number;
    activeIntegrations: number;
    marketplaceItems: number;
    recentActivity: Array<{
      type: string;
      description: string;
      timestamp: string;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: '/overview'
    });
  }

  // Service Management

  /**
   * Get all services
   */
  async getServices(
    filters?: {
      type?: string;
      status?: 'active' | 'inactive' | 'error';
      search?: string;
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<HubService>>> {
    return this.request<PaginatedResponse<HubService>>({
      method: 'GET',
      url: '/services',
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Get service by ID
   */
  async getService(serviceId: string): Promise<ApiResponse<HubService>> {
    return this.request<HubService>({
      method: 'GET',
      url: `/services/${serviceId}`
    });
  }

  /**
   * Register new service
   */
  async registerService(service: {
    name: string;
    type: string;
    url: string;
    config: Record<string, any>;
    dependencies?: string[];
  }): Promise<ApiResponse<HubService>> {
    return this.request<HubService>({
      method: 'POST',
      url: '/services',
      data: service
    });
  }

  /**
   * Update service configuration
   */
  async updateService(
    serviceId: string,
    updates: Partial<HubService>
  ): Promise<ApiResponse<HubService>> {
    return this.request<HubService>({
      method: 'PUT',
      url: `/services/${serviceId}`,
      data: updates
    });
  }

  /**
   * Activate service
   */
  async activateService(serviceId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: `/services/${serviceId}/activate`
    });
  }

  /**
   * Deactivate service
   */
  async deactivateService(serviceId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: `/services/${serviceId}/deactivate`
    });
  }

  /**
   * Unregister service
   */
  async unregisterService(serviceId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/services/${serviceId}`
    });
  }

  /**
   * Test service health
   */
  async testServiceHealth(serviceId: string): Promise<ApiResponse<{
    healthy: boolean;
    responseTime: number;
    error?: string;
  }>> {
    return this.request({
      method: 'POST',
      url: `/services/${serviceId}/health-check`
    });
  }

  // Integration Management

  /**
   * Get all integrations
   */
  async getIntegrations(
    filters?: {
      status?: 'active' | 'inactive';
      service?: string;
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<HubIntegration>>> {
    return this.request<PaginatedResponse<HubIntegration>>({
      method: 'GET',
      url: '/integrations',
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Get integration by ID
   */
  async getIntegration(integrationId: string): Promise<ApiResponse<HubIntegration>> {
    return this.request<HubIntegration>({
      method: 'GET',
      url: `/integrations/${integrationId}`
    });
  }

  /**
   * Create new integration
   */
  async createIntegration(integration: {
    name: string;
    services: string[];
    config: Record<string, any>;
  }): Promise<ApiResponse<HubIntegration>> {
    return this.request<HubIntegration>({
      method: 'POST',
      url: '/integrations',
      data: integration
    });
  }

  /**
   * Update integration
   */
  async updateIntegration(
    integrationId: string,
    updates: Partial<HubIntegration>
  ): Promise<ApiResponse<HubIntegration>> {
    return this.request<HubIntegration>({
      method: 'PUT',
      url: `/integrations/${integrationId}`,
      data: updates
    });
  }

  /**
   * Activate integration
   */
  async activateIntegration(integrationId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: `/integrations/${integrationId}/activate`
    });
  }

  /**
   * Deactivate integration
   */
  async deactivateIntegration(integrationId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: `/integrations/${integrationId}/deactivate`
    });
  }

  /**
   * Delete integration
   */
  async deleteIntegration(integrationId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/integrations/${integrationId}`
    });
  }

  // Marketplace

  /**
   * Browse marketplace items
   */
  async browseMarketplace(
    filters?: {
      category?: string;
      type?: 'template' | 'plugin' | 'integration' | 'service';
      featured?: boolean;
      search?: string;
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    name: string;
    description: string;
    type: string;
    category: string;
    author: string;
    version: string;
    downloads: number;
    rating: number;
    featured: boolean;
    price: number;
    currency: string;
    tags: string[];
    screenshots: string[];
    created: string;
    updated: string;
  }>>> {
    return this.request({
      method: 'GET',
      url: '/marketplace',
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Get marketplace item details
   */
  async getMarketplaceItem(itemId: string): Promise<ApiResponse<{
    id: string;
    name: string;
    description: string;
    longDescription: string;
    type: string;
    category: string;
    author: string;
    version: string;
    downloads: number;
    rating: number;
    reviews: number;
    featured: boolean;
    price: number;
    currency: string;
    tags: string[];
    screenshots: string[];
    documentation: string;
    requirements: string[];
    changelog: string;
    license: string;
    created: string;
    updated: string;
  }>> {
    return this.request({
      method: 'GET',
      url: `/marketplace/${itemId}`
    });
  }

  /**
   * Install marketplace item
   */
  async installMarketplaceItem(
    itemId: string,
    config?: Record<string, any>
  ): Promise<ApiResponse<{
    installationId: string;
    status: 'pending' | 'installing' | 'completed' | 'failed';
    progress: number;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: `/marketplace/${itemId}/install`,
      data: { config }
    });
  }

  /**
   * Get installation status
   */
  async getInstallationStatus(installationId: string): Promise<ApiResponse<{
    id: string;
    itemId: string;
    status: 'pending' | 'installing' | 'completed' | 'failed';
    progress: number;
    message: string;
    logs: string[];
    started: string;
    completed?: string;
  }>> {
    return this.request({
      method: 'GET',
      url: `/installations/${installationId}`
    });
  }

  /**
   * Get user installations
   */
  async getInstallations(): Promise<ApiResponse<Array<{
    id: string;
    itemId: string;
    itemName: string;
    version: string;
    status: 'active' | 'inactive' | 'updating' | 'error';
    installed: string;
    updated: string;
  }>>> {
    return this.request({
      method: 'GET',
      url: '/installations'
    });
  }

  /**
   * Uninstall item
   */
  async uninstallItem(installationId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'DELETE',
      url: `/installations/${installationId}`
    });
  }

  // Templates

  /**
   * Get available templates
   */
  async getTemplates(
    filters?: {
      category?: string;
      technology?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
    }
  ): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    technologies: string[];
    difficulty: string;
    features: string[];
    preview: string;
    downloadUrl: string;
    created: string;
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
      variables?: Record<string, string>;
    }
  ): Promise<ApiResponse<{
    projectId: string;
    repositoryUrl?: string;
    setupInstructions: string[];
  }>> {
    return this.request({
      method: 'POST',
      url: `/templates/${templateId}/create`,
      data: projectData
    });
  }

  // Analytics

  /**
   * Get hub analytics
   */
  async getAnalytics(period?: '24h' | '7d' | '30d' | '90d'): Promise<ApiResponse<{
    services: {
      total: number;
      active: number;
      byType: Record<string, number>;
    };
    integrations: {
      total: number;
      active: number;
      mostUsed: Array<{
        name: string;
        usage: number;
      }>;
    };
    marketplace: {
      totalItems: number;
      totalDownloads: number;
      topItems: Array<{
        name: string;
        downloads: number;
      }>;
    };
    traffic: Array<{
      date: string;
      requests: number;
      errors: number;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: '/analytics',
      params: { period }
    });
  }
}
