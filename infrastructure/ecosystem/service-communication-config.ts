/**
 * 🌐 CODAI Ecosystem Service Communication Configuration
 * Enables production domain-based inter-service communication
 * Based on CBD Universal Database ecosystem integration
 */

export interface ServiceEndpoint {
  name: string;
  domain: string;
  port: number;
  protocol: 'https' | 'http';
  healthPath: string;
  apiPath: string;
  capabilities: string[];
}

export interface CommunicationRule {
  from: string;
  to: string;
  type: string;
  protocol: string;
  timeout: number;
  retries: number;
  authenticated: boolean;
}

/**
 * 🏗️ CODAI Ecosystem Services Registry
 * Registered in CBD Universal Database with full production domains
 */
export const ECOSYSTEM_SERVICES: Record<string, ServiceEndpoint> = {
  memorai: {
    name: 'MemorAI Service',
    domain: 'memorai.codai.ro',
    port: 443,
    protocol: 'https',
    healthPath: '/health',
    apiPath: '/api',
    capabilities: ['memory_management', 'context_storage', 'intelligent_recall', 'agent_memory']
  },
  
  codai: {
    name: 'CODAI Platform',
    domain: 'codai.ro',
    port: 443,
    protocol: 'https',
    healthPath: '/health',
    apiPath: '/api',
    capabilities: ['code_generation', 'ai_assistance', 'project_management', 'development_tools']
  },
  
  romai: {
    name: 'RomAI Intelligence',
    domain: 'romai.codai.ro',
    port: 443,
    protocol: 'https',
    healthPath: '/health',
    apiPath: '/api',
    capabilities: ['romanian_nlp', 'market_intelligence', 'regulatory_compliance', 'business_analysis']
  },
  
  bancai: {
    name: 'BancAI FinTech',
    domain: 'bancai.codai.ro',
    port: 443,
    protocol: 'https',
    healthPath: '/health',
    apiPath: '/api',
    capabilities: ['financial_services', 'payment_processing', 'compliance_automation', 'risk_analysis']
  },
  
  admin: {
    name: 'Admin Dashboard',
    domain: 'admin.codai.ro',
    port: 443,
    protocol: 'https',
    healthPath: '/health',
    apiPath: '/api',
    capabilities: ['system_administration', 'user_management', 'monitoring', 'configuration']
  },
  
  hub: {
    name: 'CODAI Hub',
    domain: 'hub.codai.ro',
    port: 443,
    protocol: 'https',
    healthPath: '/health',
    apiPath: '/api',
    capabilities: ['service_integration', 'data_aggregation', 'workflow_orchestration', 'api_gateway']
  },
  
  control: {
    name: 'ControlAI',
    domain: 'control.codai.ro',
    port: 443,
    protocol: 'https',
    healthPath: '/health',
    apiPath: '/api',
    capabilities: ['project_management', 'task_automation', 'resource_allocation', 'timeline_optimization']
  },
  
  id: {
    name: 'ID Service',
    domain: 'id.codai.ro',
    port: 443,
    protocol: 'https',
    healthPath: '/health',
    apiPath: '/api',
    capabilities: ['authentication', 'authorization', 'user_identity', 'security_tokens']
  },
  
  apps: {
    name: 'Applications Portal',
    domain: 'apps.codai.ro',
    port: 443,
    protocol: 'https',
    healthPath: '/health',
    apiPath: '/api',
    capabilities: ['app_deployment', 'marketplace', 'application_management', 'service_catalog']
  },
  
  gateway: {
    name: 'API Gateway',
    domain: 'api.codai.ro',
    port: 443,
    protocol: 'https',
    healthPath: '/health',
    apiPath: '/v1',
    capabilities: ['api_routing', 'load_balancing', 'rate_limiting', 'authentication_proxy']
  },
  
  // Local development service
  cbd: {
    name: 'CBD Universal Database',
    domain: 'localhost',
    port: 8080,
    protocol: 'http',
    healthPath: '/health',
    apiPath: '/api',
    capabilities: ['database', 'storage', 'analytics', 'ecosystem_hub']
  }
};

/**
 * 🔗 Communication Rules Matrix
 * Defines how services communicate with each other in production
 */
export const COMMUNICATION_RULES: CommunicationRule[] = [
  // MemorAI ↔ CODAI bidirectional communication
  {
    from: 'memorai',
    to: 'codai',
    type: 'memory_context',
    protocol: 'https',
    timeout: 5000,
    retries: 3,
    authenticated: true
  },
  {
    from: 'codai',
    to: 'memorai',
    type: 'store_context',
    protocol: 'https',
    timeout: 5000,
    retries: 3,
    authenticated: true
  },
  
  // RomAI → MemorAI for Romanian context storage
  {
    from: 'romai',
    to: 'memorai',
    type: 'romanian_context',
    protocol: 'https',
    timeout: 5000,
    retries: 3,
    authenticated: true
  },
  
  // All services → ID Service for authentication
  {
    from: '*',
    to: 'id',
    type: 'authentication',
    protocol: 'https',
    timeout: 3000,
    retries: 2,
    authenticated: false // Initial auth request
  },
  
  // All services → Gateway for API access
  {
    from: '*',
    to: 'gateway',
    type: 'api_access',
    protocol: 'https',
    timeout: 10000,
    retries: 3,
    authenticated: true
  },
  
  // Admin → All services for monitoring
  {
    from: 'admin',
    to: '*',
    type: 'monitoring',
    protocol: 'https',
    timeout: 5000,
    retries: 2,
    authenticated: true
  },
  
  // Hub → All services for orchestration
  {
    from: 'hub',
    to: '*',
    type: 'orchestration',
    protocol: 'https',
    timeout: 8000,
    retries: 3,
    authenticated: true
  },
  
  // ControlAI → All services for project coordination
  {
    from: 'control',
    to: '*',
    type: 'project_coordination',
    protocol: 'https',
    timeout: 7000,
    retries: 3,
    authenticated: true
  },
  
  // BancAI → ID Service for financial authentication
  {
    from: 'bancai',
    to: 'id',
    type: 'financial_auth',
    protocol: 'https',
    timeout: 3000,
    retries: 2,
    authenticated: true
  }
];

/**
 * 🛡️ Service Communication Client
 * Handles secure inter-service communication
 */
export class EcosystemCommunicationClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(serviceId: string, apiKey?: string) {
    const service = ECOSYSTEM_SERVICES[serviceId];
    if (!service) {
      throw new Error(`Unknown service: ${serviceId}`);
    }
    
    this.baseUrl = `${service.protocol}://${service.domain}:${service.port}`;
    this.apiKey = apiKey || process.env.ECOSYSTEM_API_KEY || '';
    this.timeout = 10000;
  }

  /**
   * 🔗 Call another service in the ecosystem
   */
  async callService(
    targetServiceId: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    options?: {
      timeout?: number;
      retries?: number;
      authenticated?: boolean;
    }
  ): Promise<any> {
    const targetService = ECOSYSTEM_SERVICES[targetServiceId];
    if (!targetService) {
      throw new Error(`Unknown target service: ${targetServiceId}`);
    }

    const url = `${targetService.protocol}://${targetService.domain}:${targetService.port}${targetService.apiPath}${endpoint}`;
    const timeout = options?.timeout || this.timeout;
    const retries = options?.retries || 3;
    const authenticated = options?.authenticated !== false;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'CODAI-Ecosystem/1.0',
      'X-Ecosystem-Source': this.baseUrl
    };

    if (authenticated && this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;

      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Failed to call ${targetServiceId} after ${retries} attempts: ${lastError?.message}`);
  }

  /**
   * 🏥 Check health of a service
   */
  async checkServiceHealth(serviceId: string): Promise<{
    healthy: boolean;
    service: string;
    version?: string;
    uptime?: number;
    timestamp: string;
  }> {
    try {
      const result = await this.callService(serviceId, '/health', 'GET', undefined, {
        timeout: 5000,
        retries: 1,
        authenticated: false
      });

      return {
        healthy: true,
        service: result.service || serviceId,
        version: result.version,
        uptime: result.uptime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        service: serviceId,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 🔍 Discover available services
   */
  async discoverServices(): Promise<{
    totalServices: number;
    healthyServices: number;
    services: Array<{
      id: string;
      name: string;
      domain: string;
      healthy: boolean;
      capabilities: string[];
    }>;
  }> {
    const services = Object.keys(ECOSYSTEM_SERVICES);
    const results = await Promise.allSettled(
      services.map(async (serviceId) => {
        const health = await this.checkServiceHealth(serviceId);
        const service = ECOSYSTEM_SERVICES[serviceId];
        
        return {
          id: serviceId,
          name: service.name,
          domain: service.domain,
          healthy: health.healthy,
          capabilities: service.capabilities
        };
      })
    );

    const serviceResults = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const healthyCount = serviceResults.filter(service => service.healthy).length;

    return {
      totalServices: serviceResults.length,
      healthyServices: healthyCount,
      services: serviceResults
    };
  }
}

/**
 * 🌐 Ecosystem Configuration Helper
 */
export class EcosystemConfig {
  /**
   * Get service configuration
   */
  static getService(serviceId: string): ServiceEndpoint | null {
    return ECOSYSTEM_SERVICES[serviceId] || null;
  }

  /**
   * Get communication rules for a service
   */
  static getCommunicationRules(serviceId: string): CommunicationRule[] {
    return COMMUNICATION_RULES.filter(
      rule => rule.from === serviceId || rule.from === '*' || rule.to === serviceId || rule.to === '*'
    );
  }

  /**
   * Check if communication is allowed
   */
  static isCommunicationAllowed(from: string, to: string, type: string): boolean {
    return COMMUNICATION_RULES.some(
      rule => 
        (rule.from === from || rule.from === '*') &&
        (rule.to === to || rule.to === '*') &&
        rule.type === type
    );
  }

  /**
   * Get production environment configuration
   */
  static getProductionConfig() {
    return {
      ecosystem: 'codai-ecosystem',
      version: '1.0.0',
      services: ECOSYSTEM_SERVICES,
      communicationRules: COMMUNICATION_RULES,
      totalServices: Object.keys(ECOSYSTEM_SERVICES).length,
      environment: 'production',
      centralDatabase: 'CBD Universal Database',
      timestamp: new Date().toISOString()
    };
  }
}

export default {
  ECOSYSTEM_SERVICES,
  COMMUNICATION_RULES,
  EcosystemCommunicationClient,
  EcosystemConfig
};
