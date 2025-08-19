/**
 * Gateway Client for CODAI SDK
 * Manages communication with the Gateway service
 */

import axios, { AxiosInstance } from 'axios';
import type {
  CODAIConfig,
  ApiResponse,
  ServiceHealth,
  ClientConfig,
  RequestOptions
} from '../types/common';
import type { GatewayService, ServiceRegistry } from '../types/services';
import { BaseClient } from './BaseClient';

export class GatewayClient extends BaseClient {
  constructor(config: CODAIConfig) {
    super(config.endpoints.gateway, config);
  }

  /**
   * Get Gateway health status
   */
  async health(): Promise<ApiResponse<ServiceHealth>> {
    return this.request<ServiceHealth>({
      method: 'GET',
      url: '/health'
    });
  }

  /**
   * Get all registered services
   */
  async getServices(): Promise<ApiResponse<ServiceRegistry>> {
    return this.request<ServiceRegistry>({
      method: 'GET',
      url: '/services'
    });
  }

  /**
   * Get specific service information
   */
  async getService(serviceName: string): Promise<ApiResponse<GatewayService>> {
    return this.request<GatewayService>({
      method: 'GET',
      url: `/services/${serviceName}`
    });
  }

  /**
   * Get service health
   */
  async getServiceHealth(serviceName: string): Promise<ApiResponse<ServiceHealth>> {
    return this.request<ServiceHealth>({
      method: 'GET',
      url: `/services/${serviceName}/health`
    });
  }

  /**
   * Register a new service
   */
  async registerService(service: {
    name: string;
    url: string;
    healthPath?: string;
    version?: string;
  }): Promise<ApiResponse<GatewayService>> {
    return this.request<GatewayService>({
      method: 'POST',
      url: '/services/register',
      data: service
    });
  }

  /**
   * Unregister a service
   */
  async unregisterService(serviceName: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/services/${serviceName}`
    });
  }

  /**
   * Proxy request to a service through Gateway
   */
  async proxyRequest<T = any>(
    serviceName: string,
    path: string,
    options: Partial<RequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: options.method || 'GET',
      url: `/proxy/${serviceName}${path}`,
      data: options.data,
      params: options.params,
      ...options
    });
  }

  /**
   * Get Gateway statistics
   */
  async getStats(): Promise<ApiResponse<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    uptime: number;
    servicesRegistered: number;
    servicesHealthy: number;
  }>> {
    return this.request({
      method: 'GET',
      url: '/stats'
    });
  }

  /**
   * Get service logs (if available)
   */
  async getServiceLogs(
    serviceName: string,
    options: {
      lines?: number;
      since?: string;
      level?: 'debug' | 'info' | 'warn' | 'error';
    } = {}
  ): Promise<ApiResponse<string[]>> {
    return this.request<string[]>({
      method: 'GET',
      url: `/services/${serviceName}/logs`,
      params: options
    });
  }

  /**
   * Restart a service (if supported)
   */
  async restartService(serviceName: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      url: `/services/${serviceName}/restart`
    });
  }

  /**
   * Update service configuration
   */
  async updateServiceConfig(
    serviceName: string,
    config: Record<string, any>
  ): Promise<ApiResponse<GatewayService>> {
    return this.request<GatewayService>({
      method: 'PUT',
      url: `/services/${serviceName}/config`,
      data: config
    });
  }
}
