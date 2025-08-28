/**
 * Essential CodAI Services API Documentation Types
 * Comprehensive type definitions for interactive OpenAPI documentation generation
 */

import { OpenAPIV3 } from 'openapi-types';

// Core Service Configuration
export interface EssentialService {
  id: string;
  name: string;
  description: string;
  version: string;
  baseUrl: string;
  port: number;
  healthEndpoint: string;
  docsEndpoint: string;
  category: ServiceCategory;
  tags: string[];
  authentication: AuthenticationConfig;
  schemas: ServiceSchemas;
}

export enum ServiceCategory {
  AUTHENTICATION = 'authentication',
  API_GATEWAY = 'gateway',
  HUB_SERVICES = 'hub',
  DATABASE = 'database',
  FRONTEND = 'frontend',
  MCP_SERVICES = 'mcp'
}

// Authentication Configuration
export interface AuthenticationConfig {
  type: 'jwt' | 'oauth2' | 'api-key' | 'none';
  schemes: SecurityScheme[];
  scopes?: string[];
  flows?: OAuth2Flows;
}

export interface SecurityScheme {
  name: string;
  type: 'http' | 'oauth2' | 'apiKey';
  scheme?: string;
  bearerFormat?: string;
  in?: 'query' | 'header' | 'cookie';
  flows?: OAuth2Flows;
}

export interface OAuth2Flows {
  authorizationCode?: {
    authorizationUrl: string;
    tokenUrl: string;
    scopes: { [key: string]: string };
  };
  implicit?: {
    authorizationUrl: string;
    scopes: { [key: string]: string };
  };
}

// Schema Management
export interface ServiceSchemas {
  models: { [key: string]: OpenAPIV3.SchemaObject };
  requests: { [key: string]: OpenAPIV3.SchemaObject };
  responses: { [key: string]: OpenAPIV3.SchemaObject };
  errors: { [key: string]: OpenAPIV3.SchemaObject };
}

// Documentation Generation Configuration
export interface DocumentationConfig {
  title: string;
  description: string;
  version: string;
  termsOfService?: string;
  contact?: ContactInfo;
  license?: LicenseInfo;
  servers: ServerConfig[];
  externalDocs?: ExternalDocumentation;
  tags: TagDefinition[];
  security: SecurityRequirement[];
}

export interface ContactInfo {
  name: string;
  url?: string;
  email?: string;
}

export interface LicenseInfo {
  name: string;
  url?: string;
}

export interface ServerConfig {
  url: string;
  description?: string;
  variables?: { [key: string]: ServerVariable };
}

export interface ServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

export interface TagDefinition {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
}

export interface ExternalDocumentation {
  description?: string;
  url: string;
}

export interface SecurityRequirement {
  [key: string]: string[];
}

// Interactive Documentation Features
export interface InteractiveFeatures {
  tryItOut: boolean;
  requestInterception: boolean;
  responseValidation: boolean;
  codeGeneration: boolean;
  mockDataGeneration: boolean;
  testSuiteGeneration: boolean;
}

export interface CodeGenerationConfig {
  languages: CodeLanguage[];
  templates: { [key: string]: string };
  customization: CodeCustomization;
}

export enum CodeLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  CURL = 'curl',
  JAVA = 'java',
  CSHARP = 'csharp',
  GO = 'go',
  PHP = 'php'
}

export interface CodeCustomization {
  baseUrl?: string;
  authenticationMethod?: string;
  errorHandling?: boolean;
  typescript?: boolean;
  async?: boolean;
}

// Documentation Hub Configuration
export interface DocumentationHub {
  title: string;
  description: string;
  logo?: string;
  favicon?: string;
  theme: HubTheme;
  services: EssentialService[];
  features: InteractiveFeatures;
  customization: HubCustomization;
}

export interface HubTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  darkMode: boolean;
}

export interface HubCustomization {
  customCss?: string;
  customJs?: string;
  additionalPages?: AdditionalPage[];
  navigation?: NavigationItem[];
}

export interface AdditionalPage {
  title: string;
  path: string;
  content: string;
  order: number;
}

export interface NavigationItem {
  title: string;
  path: string;
  icon?: string;
  order: number;
  children?: NavigationItem[];
}

// Validation and Testing
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  serviceStatus: ServiceStatus[];
}

export interface ValidationError {
  code: string;
  message: string;
  path: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  code: string;
  message: string;
  path: string;
  suggestion?: string;
}

export interface ServiceStatus {
  serviceId: string;
  status: 'healthy' | 'unhealthy' | 'unreachable';
  responseTime?: number;
  lastChecked: Date;
  error?: string;
}

// CLI Configuration
export interface CLIOptions {
  configFile?: string;
  outputDir: string;
  format: 'json' | 'yaml' | 'html';
  watch?: boolean;
  serve?: boolean;
  port?: number;
  validate?: boolean;
  generateCode?: boolean;
  languages?: CodeLanguage[];
}

// Template System
export interface TemplateContext {
  service: EssentialService;
  config: DocumentationConfig;
  hub: DocumentationHub;
  timestamp: Date;
  version: string;
}

export interface TemplateRegistry {
  [templateName: string]: {
    path: string;
    context: TemplateContext;
    output: string;
  };
}

// Event System for Live Updates
export interface DocumentationEvent {
  type: DocumentationEventType;
  serviceId?: string;
  timestamp: Date;
  data: any;
}

export enum DocumentationEventType {
  SERVICE_UPDATED = 'service_updated',
  SCHEMA_CHANGED = 'schema_changed',
  HEALTH_CHANGED = 'health_changed',
  CONFIG_UPDATED = 'config_updated',
  DOCUMENTATION_GENERATED = 'documentation_generated'
}

// Metrics and Analytics
export interface DocumentationMetrics {
  serviceId: string;
  endpoint: string;
  method: string;
  requests: number;
  errors: number;
  averageResponseTime: number;
  lastAccessed: Date;
}

export interface AnalyticsData {
  totalServices: number;
  totalEndpoints: number;
  healthyServices: number;
  documentsGenerated: number;
  lastUpdate: Date;
  metrics: DocumentationMetrics[];
}

// Export configuration for Essential CodAI Services
export const ESSENTIAL_CODAI_SERVICES: EssentialService[] = [
  {
    id: 'codai-auth-api',
    name: 'CodAI Authentication API',
    description: 'Comprehensive authentication service with JWT, MFA, OAuth2, and RBAC',
    version: '1.0.0',
    baseUrl: 'http://localhost:8100',
    port: 8100,
    healthEndpoint: '/api/v1/health',
    docsEndpoint: '/api/v1/docs',
    category: ServiceCategory.AUTHENTICATION,
    tags: ['authentication', 'security', 'jwt', 'oauth2', 'mfa', 'rbac'],
    authentication: {
      type: 'jwt',
      schemes: [
        {
          name: 'bearerAuth',
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        {
          name: 'oauth2',
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: '/api/v1/auth/oauth2/authorize',
              tokenUrl: '/api/v1/auth/oauth2/token',
              scopes: {
                'read:profile': 'Read user profile',
                'write:profile': 'Modify user profile',
                'admin': 'Administrative access'
              }
            }
          }
        }
      ]
    },
    schemas: {
      models: {},
      requests: {},
      responses: {},
      errors: {}
    }
  },
  {
    id: 'codai-gateway-api',
    name: 'CodAI API Gateway',
    description: 'Central API gateway for routing, load balancing, and service orchestration',
    version: '1.0.0',
    baseUrl: 'http://localhost:8010',
    port: 8010,
    healthEndpoint: '/api/v1/health',
    docsEndpoint: '/api/v1/docs',
    category: ServiceCategory.API_GATEWAY,
    tags: ['gateway', 'routing', 'load-balancing', 'orchestration'],
    authentication: {
      type: 'jwt',
      schemes: [
        {
          name: 'bearerAuth',
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      ]
    },
    schemas: {
      models: {},
      requests: {},
      responses: {},
      errors: {}
    }
  },
  {
    id: 'codai-hub-api',
    name: 'CodAI Hub API',
    description: 'Central hub for service discovery, configuration, and inter-service communication',
    version: '1.0.0',
    baseUrl: 'http://localhost:8110',
    port: 8110,
    healthEndpoint: '/api/v1/health',
    docsEndpoint: '/api/v1/docs',
    category: ServiceCategory.HUB_SERVICES,
    tags: ['hub', 'service-discovery', 'configuration', 'communication'],
    authentication: {
      type: 'jwt',
      schemes: [
        {
          name: 'bearerAuth',
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      ]
    },
    schemas: {
      models: {},
      requests: {},
      responses: {},
      errors: {}
    }
  },
  {
    id: 'codai-memorai-mcp',
    name: 'MemorAI MCP Server',
    description: 'Memory Context Protocol server for intelligent memory management and retrieval',
    version: '1.0.0',
    baseUrl: 'http://localhost:4950',
    port: 4950,
    healthEndpoint: '/health',
    docsEndpoint: '/docs',
    category: ServiceCategory.MCP_SERVICES,
    tags: ['memory', 'mcp', 'ai', 'context', 'retrieval'],
    authentication: {
      type: 'api-key',
      schemes: [
        {
          name: 'apiKeyAuth',
          type: 'apiKey',
          in: 'header'
        }
      ]
    },
    schemas: {
      models: {},
      requests: {},
      responses: {},
      errors: {}
    }
  },
  {
    id: 'codai-cbd-database',
    name: 'CodAI CBD Database',
    description: 'Central Business Data database service with graph capabilities',
    version: '1.0.0',
    baseUrl: 'http://localhost:8180',
    port: 8180,
    healthEndpoint: '/api/v1/health',
    docsEndpoint: '/api/v1/docs',
    category: ServiceCategory.DATABASE,
    tags: ['database', 'cbd', 'graph', 'data-management'],
    authentication: {
      type: 'jwt',
      schemes: [
        {
          name: 'bearerAuth',
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      ]
    },
    schemas: {
      models: {},
      requests: {},
      responses: {},
      errors: {}
    }
  },
  {
    id: 'codai-memorai-frontend',
    name: 'MemorAI Frontend Application',
    description: 'Next.js frontend application for MemorAI with interactive memory management',
    version: '1.0.0',
    baseUrl: 'http://localhost:8006',
    port: 8006,
    healthEndpoint: '/api/health',
    docsEndpoint: '/api/docs',
    category: ServiceCategory.FRONTEND,
    tags: ['frontend', 'nextjs', 'memory', 'ui', 'interactive'],
    authentication: {
      type: 'none',
      schemes: []
    },
    schemas: {
      models: {},
      requests: {},
      responses: {},
      errors: {}
    }
  }
];