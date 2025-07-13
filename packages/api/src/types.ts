// API types for the Codai ecosystem

export interface ApiRequest<T = any> {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: T;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  statusCode: number;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  key: string;
  tags?: string[];
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// tRPC Router type (simplified)
export interface AppRouter {
  auth: {
    login: any;
    register: any;
    logout: any;
    me: any;
  };
  memory: {
    store: any;
    retrieve: any;
    delete: any;
    search: any;
  };
  projects: {
    create: any;
    list: any;
    get: any;
    update: any;
    delete: any;
  };
  ai: {
    chat: any;
    complete: any;
    analyze: any;
  };
}

export type ServiceEndpoints = {
  aide: string;
  memorai: string;
  logai: string;
  bancai: string;
  fabricai: string;
};

export interface RequestConfig {
  retries?: number;
  timeout?: number;
  cache?: CacheConfig;
  headers?: Record<string, string>;
}
