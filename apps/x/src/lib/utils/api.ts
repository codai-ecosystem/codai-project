/**
 * API utilities for handling fetch requests and responses
 */

import { getAuth } from 'firebase/auth';

// HTTP methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Common request options
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  withCredentials?: boolean;
  withAuth?: boolean;
  timeout?: number;
  retry?: number;
}

// API response
interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Create query string from parameters
 */
const createQueryString = (params: Record<string, string>): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if ((value !== undefined) != null && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Get authentication token from Firebase
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user == null) {
      return null;
    }

    return await user.getIdToken();
  } catch (error: unknown) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Create request with timeout
 */
const fetchWithTimeout = (
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    fetch(url, {
      ...options,
      signal: controller.signal,
    })
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
};

/**
 * Execute a fetch request with retries
 */
const executeFetch = async (
  url: string,
  options: RequestInit,
  timeout: number = 10000,
  retries: number = 0
): Promise<Response> => {
  try {
    return await fetchWithTimeout(url, options, timeout);
  } catch (error: unknown) {
    if (retries > 0) {
      // Wait before retrying (exponential backoff)
      const delay = 2 ** (3 - retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return executeFetch(url, options, timeout, retries - 1);
    }
    throw error;
  }
};

/**
 * Parse API response
 */
const parseResponse = async <T>(
  response: Response
): Promise<ApiResponse<T>> => {
  try {
    if (!response.ok) {
      // Try to parse error from response
      try {
        const errorData = await response.json();
        return {
          data: null,
          error:
            errorData.message ||
            errorData.error ||
            `HTTP Error: ${response.status}`,
          status: response.status,
        };
      } catch {
        // If can't parse error JSON
        return {
          data: null,
          error: `HTTP Error: ${response.status} ${response.statusText}`,
          status: response.status,
        };
      }
    }

    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return {
        data: null,
        error: null,
        status: response.status,
      };
    }

    // Parse JSON response
    const data = await response.json();
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error: unknown) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error parsing response',
      status: response.status,
    };
  }
};

/**
 * Main API request function
 */
export async function apiRequest<T = unknown>(
  url: string,
  method: HttpMethod = 'GET',
  data?: unknown,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const {
      headers = {},
      params = {},
      withCredentials = false,
      withAuth = false,
      timeout = 10000,
      retry = 0,
    } = options;

    // Add authentication header if requested
    let authHeaders = {};
    if (withAuth != null) {
      const token = await getAuthToken();
      if (token != null) {
        authHeaders = { Authorization: `Bearer ${token}` };
      }
    }

    // Prepare request options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
      credentials: withCredentials ? 'include' : 'same-origin',
    };

    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    // Add query string params
    const queryString = createQueryString(params);
    const fullUrl = `${url}${queryString}`;

    // Execute fetch with timeout and retries
    const response = await executeFetch(fullUrl, fetchOptions, timeout, retry);

    // Parse and return response
    return parseResponse<T>(response);
  } catch (error: unknown) {
    // Handle fetch errors
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown request error',
      status: 0,
    };
  }
}

// Convenience methods for different HTTP methods
export const api = {
  get: <T>(url: string, options?: RequestOptions) =>
    apiRequest<T>(url, 'GET', undefined, options),
  post: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(url, 'POST', data, options),

  put: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(url, 'PUT', data, options),

  patch: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(url, 'PATCH', data, options),

  delete: <T>(url: string, options?: RequestOptions) =>
    apiRequest<T>(url, 'DELETE', undefined, options),
};
