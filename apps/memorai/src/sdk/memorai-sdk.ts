/**
 * MemorAI TypeScript SDK
 * Official client library for the MemorAI REST API
 * 
 * @version 1.0.0
 * @author MemorAI Team
 */

export interface MemorAIConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  retries?: number;
  userAgent?: string;
}

export interface Memory {
  id?: string;
  structuredKey?: string;
  content: string;
  agentId: string;
  importance?: number;
  project?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  project?: string;
  tags?: string[];
  importance?: { min?: number; max?: number };
  dateRange?: { from?: string; to?: string };
}

export interface ExportOptions {
  format?: 'json' | 'csv';
  project?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface ImportOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  preserveTimestamps?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    count?: number;
    cached?: boolean;
    [key: string]: any;
  };
}

export class MemorAIError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'MemorAIError';
    this.code = code;
    this.details = details;
  }
}

export class MemorAISDK {
  private config: Required<MemorAIConfig>;

  constructor(config: MemorAIConfig) {
    this.config = {
      baseURL: 'https://api.memorai.ro',
      timeout: 30000,
      retries: 3,
      userAgent: 'MemorAI-JS-SDK/1.0.0',
      ...config
    };

    if (!this.config.apiKey) {
      throw new MemorAIError('API key is required', 'MISSING_API_KEY');
    }
  }

  /**
   * Make HTTP request to MemorAI API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'User-Agent': this.config.userAgent,
      ...options.headers
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.config.timeout)
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new MemorAIError(
            errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
            errorData.error?.code || 'HTTP_ERROR',
            { status: response.status, ...errorData.error?.details }
          );
        }

        const data = await response.json();
        return data as ApiResponse<T>;

      } catch (error) {
        lastError = error as Error;

        if (error instanceof MemorAIError) {
          throw error;
        }

        // Retry on network errors
        if (attempt === this.config.retries - 1) {
          throw new MemorAIError(
            `Request failed after ${this.config.retries} attempts: ${lastError.message}`,
            'NETWORK_ERROR',
            { originalError: lastError }
          );
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError!;
  }

  /**
   * Create a new memory
   */
  async createMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Memory> {
    const response = await this.request<Memory>('/api/memories', {
      method: 'POST',
      body: JSON.stringify(memory)
    });

    if (!response.success || !response.data) {
      throw new MemorAIError(
        response.error?.message || 'Failed to create memory',
        response.error?.code || 'CREATE_FAILED'
      );
    }

    return response.data;
  }

  /**
   * Get all memories with optional filtering
   */
  async getMemories(options?: {
    category?: string;
    tags?: string[];
    limit?: number;
  }): Promise<Memory[]> {
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.tags?.length) params.set('tags', options.tags.join(','));
    if (options?.limit) params.set('limit', options.limit.toString());

    const endpoint = `/api/memories${params.toString() ? `?${params}` : ''}`;
    const response = await this.request<Memory[]>(endpoint);

    if (!response.success || !response.data) {
      throw new MemorAIError(
        response.error?.message || 'Failed to fetch memories',
        response.error?.code || 'FETCH_FAILED'
      );
    }

    return response.data;
  }

  /**
   * Get a specific memory by ID
   */
  async getMemory(id: string): Promise<Memory> {
    const response = await this.request<Memory>(`/api/memories/${id}`);

    if (!response.success || !response.data) {
      throw new MemorAIError(
        response.error?.message || 'Failed to fetch memory',
        response.error?.code || 'FETCH_FAILED'
      );
    }

    return response.data;
  }

  /**
   * Update a memory
   */
  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory> {
    const response = await this.request<Memory>(`/api/memories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    if (!response.success || !response.data) {
      throw new MemorAIError(
        response.error?.message || 'Failed to update memory',
        response.error?.code || 'UPDATE_FAILED'
      );
    }

    return response.data;
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<boolean> {
    const response = await this.request<{ deleted: boolean }>(`/api/memories/${id}`, {
      method: 'DELETE'
    });

    if (!response.success || !response.data) {
      throw new MemorAIError(
        response.error?.message || 'Failed to delete memory',
        response.error?.code || 'DELETE_FAILED'
      );
    }

    return response.data.deleted;
  }

  /**
   * Search memories
   */
  async searchMemories(options: SearchOptions): Promise<Memory[]> {
    const params = new URLSearchParams();
    params.set('q', options.query);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.project) params.set('project', options.project);
    if (options.tags?.length) params.set('tags', options.tags.join(','));
    if (options.importance?.min) params.set('importanceMin', options.importance.min.toString());
    if (options.importance?.max) params.set('importanceMax', options.importance.max.toString());
    if (options.dateRange?.from) params.set('dateFrom', options.dateRange.from);
    if (options.dateRange?.to) params.set('dateTo', options.dateRange.to);

    const response = await this.request<Memory[]>(`/api/search?${params}`);

    if (!response.success || !response.data) {
      throw new MemorAIError(
        response.error?.message || 'Failed to search memories',
        response.error?.code || 'SEARCH_FAILED'
      );
    }

    return response.data;
  }

  /**
   * Export memories
   */
  async exportMemories(options: ExportOptions = {}): Promise<Blob> {
    const params = new URLSearchParams();
    if (options.format) params.set('format', options.format);
    if (options.project) params.set('project', options.project);
    if (options.tags?.length) params.set('tags', options.tags.join(','));
    if (options.dateFrom) params.set('dateFrom', options.dateFrom);
    if (options.dateTo) params.set('dateTo', options.dateTo);

    const url = `${this.config.baseURL}/api/memories/export?${params}`;
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'User-Agent': this.config.userAgent
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new MemorAIError(
        errorData.error?.message || `Export failed: ${response.statusText}`,
        errorData.error?.code || 'EXPORT_FAILED'
      );
    }

    return response.blob();
  }

  /**
   * Import memories
   */
  async importMemories(
    memories: Memory[],
    options: ImportOptions = {}
  ): Promise<{
    summary: {
      totalProcessed: number;
      imported: number;
      updated: number;
      skipped: number;
      errors: number;
    };
    details?: { errors: any[] };
  }> {
    const response = await this.request<any>('/api/memories/import', {
      method: 'POST',
      body: JSON.stringify({ memories, options })
    });

    if (!response.success || !response.data) {
      throw new MemorAIError(
        response.error?.message || 'Failed to import memories',
        response.error?.code || 'IMPORT_FAILED'
      );
    }

    return response.data;
  }

  /**
   * Get API health status
   */
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    version?: string;
  }> {
    const response = await this.request<any>('/api/health');

    if (!response.success || !response.data) {
      throw new MemorAIError(
        response.error?.message || 'Failed to get health status',
        response.error?.code || 'HEALTH_CHECK_FAILED'
      );
    }

    return response.data;
  }
}

// Default export
export default MemorAISDK;

// Named exports
export { MemorAISDK as MemorAI };
