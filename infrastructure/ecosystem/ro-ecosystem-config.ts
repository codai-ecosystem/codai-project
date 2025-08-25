/**
 * 🇷🇴 Enhanced CODAI Ecosystem Configuration with .RO Domain Integration
 * Dual domain strategy: .codai.ro (ecosystem) + .ro (primary brands)
 */

export interface EnhancedServiceEndpoint {
  name: string;
  primaryDomain: string;     // Primary .ro domain
  ecosystemDomain: string;   // .codai.ro ecosystem domain
  port: number;
  protocol: 'https' | 'http';
  healthPath: string;
  apiPath: string;
  capabilities: string[];
  apiKey: string;
  marketFocus: 'romanian' | 'international' | 'both';
}

/**
 * 🌟 Enhanced CODAI Ecosystem with .RO Domain Integration
 * Supporting both primary .ro domains and .codai.ro ecosystem domains
 */
export const ENHANCED_ECOSYSTEM_SERVICES: Record<string, EnhancedServiceEndpoint> = {
  memorai: {
    name: 'MemorAI Service',
    primaryDomain: 'memorai.ro',           // 🇷🇴 Primary Romanian domain
    ecosystemDomain: 'memorai.codai.ro',   // 🌐 Ecosystem integration domain
    port: 443,
    protocol: 'https',
    healthPath: '/api/health',
    apiPath: '/api',
    capabilities: ['memory_management', 'context_storage', 'intelligent_recall', 'agent_memory'],
    apiKey: 'memorai-production-api-key-2025',
    marketFocus: 'both'
  },

  romai: {
    name: 'RomAI Intelligence',
    primaryDomain: 'romai.ro',             // 🇷🇴 Primary Romanian domain  
    ecosystemDomain: 'romai.codai.ro',     // 🌐 Ecosystem integration domain
    port: 443,
    protocol: 'https',
    healthPath: '/api/health',
    apiPath: '/api',
    capabilities: ['romanian_nlp', 'market_intelligence', 'regulatory_compliance', 'business_analysis'],
    apiKey: 'romai-production-api-key-2025',
    marketFocus: 'romanian'
  },

  controlai: {
    name: 'ControlAI Management',
    primaryDomain: 'controlai.ro',         // 🇷🇴 Primary Romanian domain
    ecosystemDomain: 'control.codai.ro',   // 🌐 Ecosystem integration domain  
    port: 443,
    protocol: 'https',
    healthPath: '/api/health',
    apiPath: '/api',
    capabilities: ['project_management', 'task_automation', 'resource_allocation', 'timeline_optimization'],
    apiKey: 'controlai-production-api-key-2025',
    marketFocus: 'both'
  },

  bancai: {
    name: 'BancAI FinTech',
    primaryDomain: 'bancai.ro',            // 🇷🇴 Primary Romanian domain (if available)
    ecosystemDomain: 'bancai.codai.ro',    // 🌐 Ecosystem integration domain
    port: 443,
    protocol: 'https',
    healthPath: '/api/health',
    apiPath: '/api',
    capabilities: ['financial_services', 'payment_processing', 'compliance_automation', 'risk_analysis'],
    apiKey: 'bancai-production-api-key-2025',
    marketFocus: 'romanian'
  },

  // Ecosystem coordination services (remain on .codai.ro)
  codai: {
    name: 'CODAI Platform',
    primaryDomain: 'codai.ro',             // 🌐 Main ecosystem domain
    ecosystemDomain: 'codai.ro',           // Same as primary
    port: 443,
    protocol: 'https',
    healthPath: '/api/health',
    apiPath: '/api',
    capabilities: ['code_generation', 'ai_assistance', 'project_management', 'development_tools'],
    apiKey: 'codai-ecosystem-master-key-2025',
    marketFocus: 'international'
  },

  admin: {
    name: 'Admin Dashboard',
    primaryDomain: 'admin.codai.ro',       // 🔧 Administrative domain
    ecosystemDomain: 'admin.codai.ro',     // Same as primary
    port: 443,
    protocol: 'https',
    healthPath: '/api/health',
    apiPath: '/api',
    capabilities: ['system_administration', 'user_management', 'monitoring', 'configuration'],
    apiKey: 'admin-production-api-key-2025',
    marketFocus: 'international'
  },

  hub: {
    name: 'CODAI Hub',
    primaryDomain: 'hub.codai.ro',         // 🌐 Service integration hub
    ecosystemDomain: 'hub.codai.ro',       // Same as primary
    port: 443,
    protocol: 'https',
    healthPath: '/api/health',
    apiPath: '/api',
    capabilities: ['service_integration', 'data_aggregation', 'workflow_orchestration', 'api_gateway'],
    apiKey: 'hub-production-api-key-2025',
    marketFocus: 'international'
  },

  id: {
    name: 'ID Service',
    primaryDomain: 'id.codai.ro',          // 🔐 Identity service
    ecosystemDomain: 'id.codai.ro',        // Same as primary
    port: 443,
    protocol: 'https',
    healthPath: '/api/health',
    apiPath: '/api',
    capabilities: ['authentication', 'authorization', 'user_identity', 'security_tokens'],
    apiKey: 'id-service-master-key-2025',
    marketFocus: 'international'
  },

  apps: {
    name: 'Applications Portal',
    primaryDomain: 'apps.codai.ro',        // 🚀 App deployment platform
    ecosystemDomain: 'apps.codai.ro',      // Same as primary
    port: 443,
    protocol: 'https',
    healthPath: '/api/health',
    apiPath: '/api',
    capabilities: ['app_deployment', 'marketplace', 'application_management', 'service_catalog'],
    apiKey: 'apps-production-api-key-2025',
    marketFocus: 'international'
  },

  gateway: {
    name: 'API Gateway',
    primaryDomain: 'api.codai.ro',         // 🌉 Central API gateway
    ecosystemDomain: 'api.codai.ro',       // Same as primary
    port: 443,
    protocol: 'https',
    healthPath: '/health',
    apiPath: '/v1',
    capabilities: ['api_routing', 'load_balancing', 'rate_limiting', 'authentication_proxy'],
    apiKey: 'gateway-master-api-key-2025',
    marketFocus: 'international'
  }
};

/**
 * 🔐 Enhanced Security Configuration
 */
export const SECURITY_CONFIG = {
  ecosystem: {
    masterKey: 'ecosystem-production-master-key-2025',
    apiKeyRotationDays: 90,
    requestTimeout: 10000,
    maxRetries: 3,
    rateLimitWindow: 900000, // 15 minutes
    rateLimitMax: 1000
  },

  authentication: {
    jwtSecret: 'ecosystem-jwt-production-secret-2025',
    tokenExpiry: '24h',
    refreshTokenExpiry: '7d',
    requireApiKey: true,
    requireSourceValidation: true
  },

  communication: {
    enforceHttps: true,
    validateCertificates: true,
    allowedSources: [
      'memorai.ro', 'memorai.codai.ro',
      'romai.ro', 'romai.codai.ro',
      'controlai.ro', 'control.codai.ro',
      'bancai.ro', 'bancai.codai.ro',
      'codai.ro', 'admin.codai.ro',
      'hub.codai.ro', 'id.codai.ro',
      'apps.codai.ro', 'api.codai.ro'
    ]
  }
};

/**
 * 🌐 Enhanced Ecosystem Communication Client with .RO Support
 */
export class EnhancedEcosystemClient {
  private serviceId: string;
  private apiKey: string;
  private preferPrimaryDomain: boolean;

  constructor(serviceId: string, apiKey?: string, preferPrimaryDomain: boolean = true) {
    this.serviceId = serviceId;
    this.apiKey = apiKey || process.env.ECOSYSTEM_API_KEY || SECURITY_CONFIG.ecosystem.masterKey;
    this.preferPrimaryDomain = preferPrimaryDomain;
  }

  /**
   * 🔗 Smart domain selection - prefers .ro domains when available
   */
  private getServiceUrl(serviceId: string, usePrimary: boolean = this.preferPrimaryDomain): string {
    const service = ENHANCED_ECOSYSTEM_SERVICES[serviceId];
    if (!service) {
      throw new Error(`Unknown service: ${serviceId}`);
    }

    const domain = usePrimary ? service.primaryDomain : service.ecosystemDomain;
    return `${service.protocol}://${domain}:${service.port}`;
  }

  /**
   * 🚀 Enhanced secure service communication
   */
  async callService(
    targetServiceId: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    options?: {
      timeout?: number;
      retries?: number;
      usePrimaryDomain?: boolean;
      includeEcosystemHeaders?: boolean;
    }
  ): Promise<any> {
    const targetService = ENHANCED_ECOSYSTEM_SERVICES[targetServiceId];
    if (!targetService) {
      throw new Error(`Unknown target service: ${targetServiceId}`);
    }

    const baseUrl = this.getServiceUrl(targetServiceId, options?.usePrimaryDomain);
    const url = `${baseUrl}${targetService.apiPath}${endpoint}`;

    const timeout = options?.timeout || SECURITY_CONFIG.ecosystem.requestTimeout;
    const retries = options?.retries || SECURITY_CONFIG.ecosystem.maxRetries;

    // Enhanced security headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': 'CODAI-Enhanced-Ecosystem/2.0',
      'X-Ecosystem-Source': this.getServiceUrl(this.serviceId),
      'X-Service-ID': this.serviceId,
      'X-Target-Service': targetServiceId,
      'X-Request-ID': `${this.serviceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    if (options?.includeEcosystemHeaders !== false) {
      headers['X-Ecosystem-Version'] = '2.0';
      headers['X-Security-Level'] = 'enterprise';
      headers['X-Communication-Type'] = 'inter-service';
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        console.log(`🔗 Calling ${targetServiceId} at ${url} (attempt ${attempt}/${retries})`);

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

        console.log(`✅ Successfully called ${targetServiceId}`);
        return result;

      } catch (error) {
        lastError = error as Error;
        console.log(`❌ Failed to call ${targetServiceId}: ${lastError.message}`);

        if (attempt < retries) {
          // Try with ecosystem domain if primary domain failed
          if (options?.usePrimaryDomain !== false && attempt === 1) {
            console.log(`🔄 Retrying with ecosystem domain...`);
            options = { ...options, usePrimaryDomain: false };
          }

          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Failed to call ${targetServiceId} after ${retries} attempts: ${lastError?.message}`);
  }

  /**
   * 🏥 Enhanced health check with domain fallback
   */
  async checkServiceHealth(serviceId: string, checkBothDomains: boolean = true): Promise<{
    healthy: boolean;
    service: string;
    domain: string;
    version?: string;
    uptime?: number;
    primaryDomainHealthy?: boolean;
    ecosystemDomainHealthy?: boolean;
    timestamp: string;
  }> {
    const service = ENHANCED_ECOSYSTEM_SERVICES[serviceId];
    if (!service) {
      throw new Error(`Unknown service: ${serviceId}`);
    }

    let primaryHealthy = false;
    let ecosystemHealthy = false;
    let result: any = null;
    let activeDomain = '';

    // Check primary domain (.ro)
    try {
      result = await this.callService(serviceId, '/health', 'GET', undefined, {
        timeout: 5000,
        retries: 1,
        usePrimaryDomain: true,
        includeEcosystemHeaders: false
      });
      primaryHealthy = true;
      activeDomain = service.primaryDomain;
    } catch (error) {
      console.log(`⚠️ Primary domain ${service.primaryDomain} health check failed`);
    }

    // Check ecosystem domain (.codai.ro) if needed
    if (checkBothDomains || !primaryHealthy) {
      try {
        const ecosystemResult = await this.callService(serviceId, '/health', 'GET', undefined, {
          timeout: 5000,
          retries: 1,
          usePrimaryDomain: false,
          includeEcosystemHeaders: false
        });
        ecosystemHealthy = true;
        if (!primaryHealthy) {
          result = ecosystemResult;
          activeDomain = service.ecosystemDomain;
        }
      } catch (error) {
        console.log(`⚠️ Ecosystem domain ${service.ecosystemDomain} health check failed`);
      }
    }

    const healthy = primaryHealthy || ecosystemHealthy;

    return {
      healthy,
      service: service.name,
      domain: activeDomain,
      version: result?.version,
      uptime: result?.uptime,
      primaryDomainHealthy: checkBothDomains ? primaryHealthy : undefined,
      ecosystemDomainHealthy: checkBothDomains ? ecosystemHealthy : undefined,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 🇷🇴 Romanian market focused service discovery
   */
  async discoverRomanianServices(): Promise<{
    romanianServices: number;
    internationalServices: number;
    roDomainsActive: number;
    services: Array<{
      id: string;
      name: string;
      primaryDomain: string;
      ecosystemDomain: string;
      marketFocus: string;
      healthy: boolean;
      capabilities: string[];
    }>;
  }> {
    const allServices = Object.keys(ENHANCED_ECOSYSTEM_SERVICES);
    const results = await Promise.allSettled(
      allServices.map(async (serviceId) => {
        const health = await this.checkServiceHealth(serviceId, true);
        const service = ENHANCED_ECOSYSTEM_SERVICES[serviceId];

        return {
          id: serviceId,
          name: service.name,
          primaryDomain: service.primaryDomain,
          ecosystemDomain: service.ecosystemDomain,
          marketFocus: service.marketFocus,
          healthy: health.healthy,
          capabilities: service.capabilities,
          primaryDomainHealthy: health.primaryDomainHealthy,
          ecosystemDomainHealthy: health.ecosystemDomainHealthy
        };
      })
    );

    const serviceResults = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const romanianServices = serviceResults.filter(s => s.marketFocus === 'romanian' || s.marketFocus === 'both').length;
    const internationalServices = serviceResults.filter(s => s.marketFocus === 'international' || s.marketFocus === 'both').length;
    const roDomainsActive = serviceResults.filter(s => s.primaryDomain.endsWith('.ro') && s.primaryDomainHealthy).length;

    return {
      romanianServices,
      internationalServices,
      roDomainsActive,
      services: serviceResults
    };
  }
}

/**
 * 🎯 Enhanced Configuration Helper
 */
export class EnhancedEcosystemConfig {
  /**
   * Get dual domain configuration
   */
  static getDualDomainConfig() {
    return {
      ecosystem: 'codai-enhanced-ecosystem',
      version: '2.0.0',
      security: SECURITY_CONFIG,
      services: ENHANCED_ECOSYSTEM_SERVICES,
      domainStrategy: 'dual_domain_ro_integration',
      roDomainsAvailable: ['memorai.ro', 'romai.ro', 'controlai.ro', 'bancai.ro'],
      ecosystemDomains: Object.values(ENHANCED_ECOSYSTEM_SERVICES).map(s => s.ecosystemDomain),
      totalServices: Object.keys(ENHANCED_ECOSYSTEM_SERVICES).length,
      environment: 'production',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Romanian market configuration
   */
  static getRomanianMarketConfig() {
    const romanianServices = Object.entries(ENHANCED_ECOSYSTEM_SERVICES)
      .filter(([_, service]) => service.marketFocus === 'romanian' || service.marketFocus === 'both')
      .reduce((acc, [key, service]) => {
        acc[key] = service;
        return acc;
      }, {} as Record<string, EnhancedServiceEndpoint>);

    return {
      market: 'romanian',
      domain_strategy: '.ro_primary_domains',
      services: romanianServices,
      advantages: [
        'Local market trust',
        'SEO benefits in Romania',
        'Professional brand presence',
        'Regulatory compliance',
        'Cultural alignment'
      ],
      timestamp: new Date().toISOString()
    };
  }
}

export default {
  ENHANCED_ECOSYSTEM_SERVICES,
  SECURITY_CONFIG,
  EnhancedEcosystemClient,
  EnhancedEcosystemConfig
};
