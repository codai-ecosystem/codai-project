// Codai Ecosystem Service Client
// Standardized client for inter-service communication

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ServiceConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export class CodaiServiceClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;

  constructor(config: ServiceConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 5000;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ServiceResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'bancai-service/0.1.0',
        ...(options.headers as Record<string, string>),
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || `HTTP ${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async get<T>(endpoint: string): Promise<ServiceResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ServiceResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ServiceResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ServiceResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch {
      return false;
    }
  }
}

// Service client instances
export const memoraiClient = new CodaiServiceClient({
  baseUrl: process.env.MEMORAI_API_URL || 'http://localhost:3001',
  apiKey: process.env.MEMORAI_API_KEY,
  timeout: 10000,
});

export const logaiClient = new CodaiServiceClient({
  baseUrl: process.env.LOGAI_API_URL || 'http://localhost:3002',
  apiKey: process.env.LOGAI_API_KEY,
  timeout: 5000,
});

// Specific service interfaces
export interface MemoryEntry {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

// MemorAI specific methods
export class MemoraiService extends CodaiServiceClient {
  async storeMemory(content: string, metadata?: Record<string, any>): Promise<ServiceResponse<MemoryEntry>> {
    return this.post<MemoryEntry>('/api/memories', { content, metadata });
  }

  async recallMemory(query: string): Promise<ServiceResponse<MemoryEntry[]>> {
    return this.get<MemoryEntry[]>(`/api/memories/search?q=${encodeURIComponent(query)}`);
  }

  async getMemory(id: string): Promise<ServiceResponse<MemoryEntry>> {
    return this.get<MemoryEntry>(`/api/memories/${id}`);
  }

  async deleteMemory(id: string): Promise<ServiceResponse<void>> {
    return this.delete<void>(`/api/memories/${id}`);
  }
}

// LogAI specific methods
export class LogaiService extends CodaiServiceClient {
  async authenticate(token: string): Promise<ServiceResponse<AuthUser>> {
    return this.post<AuthUser>('/api/auth/validate', { token });
  }

  async getCurrentUser(sessionToken: string): Promise<ServiceResponse<AuthUser>> {
    return this.get<AuthUser>('/api/auth/user');
  }

  async refreshToken(refreshToken: string): Promise<ServiceResponse<{ token: string; refreshToken: string }>> {
    return this.post('/api/auth/refresh', { refreshToken });
  }
}

// Export configured service instances
export const memorai = new MemoraiService({
  baseUrl: process.env.MEMORAI_API_URL || 'http://localhost:3001',
  apiKey: process.env.MEMORAI_API_KEY,
});

export const logai = new LogaiService({
  baseUrl: process.env.LOGAI_API_URL || 'http://localhost:3002',
  apiKey: process.env.LOGAI_API_KEY,
});
