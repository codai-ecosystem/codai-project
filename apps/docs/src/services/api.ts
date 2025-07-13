import { logger } from '@/lib/logger';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string> | undefined;
  body?: unknown;
  params?: Record<string, string> | undefined;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * API client service for making requests to the backend API
 */
export class ApiService {
  /**
   * Base URL for the API
   * Will use environment variable or default to local URL
   */
  private static baseUrl =
    process.env['NEXT_PUBLIC_BACKEND_URL'] || 'http://localhost:8000';

  /**
   * Make a request to the backend API
   */
  static async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { method = 'GET', headers = {}, body, params } = options;

      // Build URL with query params if any
      let url = `${this.baseUrl}${endpoint}`;
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(key, value);
        });
        url = `${url}?${queryParams.toString()}`;
      }

      // Add default headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        credentials: 'include',
      };

      // Add body if needed
      if (body) {
        requestOptions.body = JSON.stringify(body);
      }

      // Make the request
      const response = await fetch(url, requestOptions);
      const status = response.status;

      // Handle response based on content type
      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && contentType.includes('text/')) {
        data = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        const errorMessage =
          typeof data === 'object' && data?.message
            ? data.message
            : data || 'Unknown error';

        logger.error(`API Error: ${endpoint}`, {
          context: {
            status,
            error: errorMessage,
          },
        });

        return {
          data: null,
          error: errorMessage,
          status,
        };
      }

      return {
        data,
        error: null,
        status,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error(`API Request failed: ${endpoint}`, {
        context: { error: errorMessage },
      });

      return {
        data: null,
        error: errorMessage,
        status: 0,
      };
    }
  }

  /**
   * Make a GET request
   */
  static async get<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * Make a POST request
   */
  static async post<T>(
    endpoint: string,
    data: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: data, headers });
  }

  /**
   * Make a PUT request
   */
  static async put<T>(
    endpoint: string,
    data: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: data, headers });
  }

  /**
   * Make a DELETE request
   */
  static async delete<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', params });
  }

  /**
   * Make a PATCH request
   */
  static async patch<T>(
    endpoint: string,
    data: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data, headers });
  }

  /**
   * Check if backend is healthy
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.status === 200 && response.error === null;
    } catch {
      return false;
    }
  }
}
