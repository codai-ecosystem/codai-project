/**
 * Codai Central Service Integration
 * Core platform API for the Codai ecosystem
 */

interface CodaiConfig {
  apiUrl: string;
  apiKey?: string;
  serviceId: string;
}

interface ServiceInfo {
  id: string;
  name: string;
  domain: string;
  port: number;
  status: 'online' | 'offline' | 'maintenance';
  version: string;
  priority: number;
}

interface ServiceRegistration {
  success: boolean;
  serviceId?: string;
  error?: string;
}

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  metrics?: {
    uptime: number;
    memory: number;
    cpu: number;
    responseTime: number;
  };
  services?: {
    logai: boolean;
    memorai: boolean;
    database?: boolean;
  };
}

class CodaiService {
  private config: CodaiConfig;

  constructor(config: CodaiConfig) {
    this.config = config;
  }

  /**
   * Register service with central platform
   */
  async registerService(
    serviceInfo: Omit<ServiceInfo, 'id'>
  ): Promise<ServiceRegistration> {
    try {
      const response = await fetch(`${this.config.apiUrl}/services/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          ...serviceInfo,
          serviceId: this.config.serviceId,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Codai registration error:', error);
      return {
        success: false,
        error: 'Platform service unavailable',
      };
    }
  }

  /**
   * Send health check status
   */
  async sendHealthCheck(
    health: HealthCheck
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/services/${this.config.serviceId}/health`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify(health),
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Codai health check error:', error);
      return {
        success: false,
        error: 'Platform service unavailable',
      };
    }
  }

  /**
   * Get service discovery information
   */
  async getServices(): Promise<ServiceInfo[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/services`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.services || [];
    } catch (error) {
      console.error('Codai service discovery error:', error);
      return [];
    }
  }

  /**
   * Get specific service information
   */
  async getService(serviceId: string): Promise<ServiceInfo | null> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/services/${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Codai service info error:', error);
      return null;
    }
  }

  /**
   * Send service metrics
   */
  async sendMetrics(
    metrics: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/services/${this.config.serviceId}/metrics`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            metrics,
          }),
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Codai metrics error:', error);
      return {
        success: false,
        error: 'Platform service unavailable',
      };
    }
  }
}

// Singleton instance
let codaiService: CodaiService | null = null;

export function getCodaiService(): CodaiService {
  if (!codaiService) {
    const config: CodaiConfig = {
      apiUrl: process.env.CODAI_API_URL || 'http://localhost:3000',
      apiKey: process.env.CODAI_API_KEY,
      serviceId: 'fabricai',
    };
    codaiService = new CodaiService(config);
  }
  return codaiService;
}

export type { ServiceInfo, ServiceRegistration, HealthCheck, CodaiConfig };
