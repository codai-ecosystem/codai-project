/**
 * LogAI Service Integration
 * Authentication service for the Codai ecosystem
 */

interface LogAIConfig {
  apiUrl: string;
  apiKey?: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

class LogAIService {
  private config: LogAIConfig;

  constructor(config: LogAIConfig) {
    this.config = config;
  }

  /**
   * Validate authentication token
   */
  async validateToken(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.config.apiUrl}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('LogAI validation error:', error);
      return {
        success: false,
        error: 'Authentication service unavailable',
      };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const response = await fetch(`${this.config.apiUrl}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('LogAI profile error:', error);
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.config.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      return await response.json();
    } catch (error) {
      console.error('LogAI refresh error:', error);
      return {
        success: false,
        error: 'Token refresh failed',
      };
    }
  }
}

// Singleton instance
let logaiService: LogAIService | null = null;

export function getLogAIService(): LogAIService {
  if (!logaiService) {
    const config: LogAIConfig = {
      apiUrl: process.env.LOGAI_API_URL || 'http://localhost:3002',
      apiKey: process.env.LOGAI_API_KEY,
    };
    logaiService = new LogAIService(config);
  }
  return logaiService;
}

export type { AuthUser, AuthResponse, LogAIConfig };
