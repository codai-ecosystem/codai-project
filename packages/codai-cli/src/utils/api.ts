/**
 * CODAI CLI API Client
 * Provides HTTP client functionality for interacting with CODAI services
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Service, ServiceHealth, ServiceStatus } from '../config/services';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class ApiClient {
  private client: AxiosInstance;
  private gatewayUrl: string;

  constructor(gatewayUrl: string = 'http://localhost:4003') {
    this.gatewayUrl = gatewayUrl;
    this.client = axios.create({
      baseURL: gatewayUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CODAI-CLI/1.0.0'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNREFUSED') {
          throw new Error(`Cannot connect to Gateway at ${this.gatewayUrl}. Is the service running?`);
        }
        if (error.response?.status === 404) {
          throw new Error(`Service not found. Check if the service is registered with the Gateway.`);
        }
        throw error;
      }
    );
  }

  /**
   * Check Gateway health status
   */
  async getGatewayHealth(): Promise<ServiceHealth> {
    try {
      const response = await this.client.get('/health');
      return {
        status: 'healthy',
        service: 'gateway',
        version: response.data.version || '1.0.0',
        uptime: response.data.uptime || 0,
        timestamp: new Date().toISOString(),
        details: response.data
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'gateway',
        version: 'unknown',
        uptime: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get health status for all services
   */
  async getAllServicesHealth(): Promise<ServiceHealth[]> {
    try {
      const response = await this.client.get('/services/health');
      return response.data.services || [];
    } catch (error) {
      console.error('Failed to get services health:', error);
      return [];
    }
  }

  /**
   * Get health status for a specific service
   */
  async getServiceHealth(serviceName: string): Promise<ServiceHealth> {
    try {
      const response = await this.client.get(`/services/${serviceName}/health`);
      return response.data;
    } catch (error) {
      return {
        status: 'unhealthy',
        service: serviceName,
        version: 'unknown',
        uptime: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get service information
   */
  async getServiceInfo(serviceName: string): Promise<Service | null> {
    try {
      const response = await this.client.get(`/services/${serviceName}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get service info for ${serviceName}:`, error);
      return null;
    }
  }

  /**
   * Get service logs (if supported)
   */
  async getServiceLogs(serviceName: string, lines: number = 100): Promise<string[]> {
    try {
      const response = await this.client.get(`/services/${serviceName}/logs?lines=${lines}`);
      return response.data.logs || [];
    } catch (error) {
      console.error(`Failed to get logs for ${serviceName}:`, error);
      return [`Error getting logs: ${error instanceof Error ? error.message : 'Unknown error'}`];
    }
  }

  /**
   * Start a service (if supported)
   */
  async startService(serviceName: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post(`/services/${serviceName}/start`);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Stop a service (if supported)
   */
  async stopService(serviceName: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post(`/services/${serviceName}/stop`);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Restart a service (if supported)
   */
  async restartService(serviceName: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post(`/services/${serviceName}/restart`);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get service statistics
   */
  async getServiceStats(serviceName: string): Promise<any> {
    try {
      const response = await this.client.get(`/services/${serviceName}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get stats for ${serviceName}:`, error);
      return null;
    }
  }

  /**
   * Test service connectivity
   */
  async testServiceConnectivity(service: Service): Promise<boolean> {
    try {
      const response = await axios.get(`http://localhost:${service.port}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Make a custom request to a service
   */
  async customRequest(method: string, path: string, data?: any): Promise<AxiosResponse> {
    return this.client.request({
      method: method.toUpperCase(),
      url: path,
      data
    });
  }
}

export default ApiClient;
