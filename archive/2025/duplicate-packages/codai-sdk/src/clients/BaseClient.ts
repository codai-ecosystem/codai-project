/**
 * Base Client for CODAI SDK
 * Provides common functionality for all service clients
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type {
  CODAIConfig,
  ApiResponse,
  RequestOptions,
  AuthConfig,
  CODAIError,
  NetworkError,
  AuthenticationError,
  ServiceUnavailableError
} from '../types/common';

export abstract class BaseClient {
  protected client: AxiosInstance;
  protected config: CODAIConfig;
  protected baseURL: string;

  constructor(baseURL: string, config: CODAIConfig) {
    this.baseURL = baseURL;
    this.config = config;

    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `CODAI-SDK/1.0.0`
      }
    });

    this.setupInterceptors();
    this.setupAuth(config.auth);
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.config.debug) {
          console.log(`[CODAI SDK] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (this.config.debug) {
          console.log(`[CODAI SDK] Response: ${response.status} ${response.statusText}`);
        }
        return response;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Setup authentication
   */
  private setupAuth(auth?: AuthConfig): void {
    if (!auth) return;

    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          this.client.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
        }
        break;

      case 'api-key':
        if (auth.apiKey) {
          this.client.defaults.headers.common['X-API-Key'] = auth.apiKey;
        }
        break;

      case 'basic':
        if (auth.username && auth.password) {
          const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          this.client.defaults.headers.common['Authorization'] = `Basic ${credentials}`;
        }
        break;
    }
  }

  /**
   * Handle errors and convert to CODAI errors
   */
  private handleError(error: any): Error {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new NetworkError(`Cannot connect to service at ${this.baseURL}`);
    }

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          return new AuthenticationError(data?.message || 'Authentication failed');
        case 503:
          return new ServiceUnavailableError(this.baseURL);
        default:
          return new CODAIError(
            data?.message || `HTTP ${status} error`,
            'HTTP_ERROR',
            status,
            data
          );
      }
    }

    return error instanceof Error ? error : new Error('Unknown error occurred');
  }

  /**
   * Make HTTP request with retry logic
   */
  protected async request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= (this.config.retries || 1); attempt++) {
      try {
        const response: AxiosResponse<T> = await this.client.request({
          method: options.method,
          url: options.url,
          data: options.data,
          params: options.params,
          headers: options.headers,
          timeout: options.timeout || this.config.timeout
        });

        const duration = Date.now() - startTime;

        return {
          success: true,
          data: response.data,
          timestamp: new Date().toISOString(),
          meta: {
            requestId: response.headers['x-request-id'],
            duration,
            version: response.headers['x-api-version']
          }
        };

      } catch (error) {
        lastError = this.handleError(error);

        // Don't retry on authentication errors or validation errors
        if (lastError instanceof AuthenticationError ||
          (lastError as any).statusCode === 400) {
          break;
        }

        // Wait before retry (except on last attempt)
        if (attempt < (this.config.retries || 1)) {
          await this.wait(this.config.retryDelay || 1000);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Request failed',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Wait for specified milliseconds
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update client configuration
   */
  updateConfig(config: Partial<CODAIConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.timeout) {
      this.client.defaults.timeout = config.timeout;
    }

    if (config.auth) {
      this.setupAuth(config.auth);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): CODAIConfig {
    return { ...this.config };
  }

  /**
   * Health check for the service
   */
  abstract health(): Promise<ApiResponse<any>>;
}
