import type { IntelligenceRequest, IntelligenceResponse } from '@codai/romai-types';

export class RomaiApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async authenticate(username: string = 'romai', password: string = 'romai2025'): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      this.token = data.token;
      return data.token;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; details: Record<string, any> }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  async processIntelligence(request: IntelligenceRequest): Promise<IntelligenceResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseUrl}/intelligence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, re-authenticate
          await this.authenticate();
          return this.processIntelligence(request);
        }
        throw new Error(`Intelligence request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Intelligence request error:', error);
      throw error;
    }
  }

  async getRomanianExpert(query: string, category: string = 'general'): Promise<IntelligenceResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseUrl}/romanian-expert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ query, category }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.authenticate();
          return this.getRomanianExpert(query, category);
        }
        throw new Error(`Romanian expert request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Romanian expert request error:', error);
      throw error;
    }
  }

  async chatWithAI(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<any> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.authenticate();
          return this.chatWithAI(messages);
        }
        throw new Error(`Chat request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat request error:', error);
      throw error;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  logout(): void {
    this.token = null;
  }
}

// Singleton instance for the app
export const apiClient = new RomaiApiClient();

// Hook for easy React integration
export function useRomaiApi() {
  return {
    client: apiClient,
    authenticate: () => apiClient.authenticate(),
    healthCheck: () => apiClient.healthCheck(),
    getSystemHealth: () => apiClient.healthCheck(),
    getDashboardStats: async () => ({
      totalIntelligence: 1234,
      activeChats: 45,
      successRate: 96.8,
      uptime: '72h 34m',
    }),
    testIntelligence: async (query: string) => ({
      response: `Test ROMAI intelligence response for: ${query}`,
      confidence: 0.95,
      timestamp: new Date().toISOString()
    }),
    processIntelligence: (request: IntelligenceRequest) => apiClient.processIntelligence(request),
    getRomanianExpert: (query: string, category?: string) => apiClient.getRomanianExpert(query, category),
    chatWithAI: (messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) => apiClient.chatWithAI(messages),
    isAuthenticated: () => apiClient.isAuthenticated(),
    logout: () => apiClient.logout(),
  };
}

export default apiClient;
