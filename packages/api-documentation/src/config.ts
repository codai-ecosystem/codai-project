/**
 * API Documentation Configuration
 * Environment-aware configuration for OpenAPI documentation generation
 */

import { DocumentationConfig, DocumentationHub, HubTheme, InteractiveFeatures, CodeLanguage, ESSENTIAL_CODAI_SERVICES } from './types';

// Environment Configuration
export const config = {
  // Server Configuration
  server: {
    host: process.env.DOCS_HOST || '0.0.0.0',
    port: parseInt(process.env.DOCS_PORT || '4200'),
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:4006',
        'http://localhost:4200',
        'http://localhost:8100',
        'http://localhost:8010',
        'http://localhost:8110',
        'http://localhost:8180'
      ],
      credentials: true
    }
  },

  // Documentation Generation
  generation: {
    outputDir: process.env.DOCS_OUTPUT_DIR || './docs/generated',
    templatesDir: process.env.DOCS_TEMPLATES_DIR || './src/templates',
    staticDir: process.env.DOCS_STATIC_DIR || './static',
    watchMode: process.env.NODE_ENV === 'development',
    autoReload: true,
    prettify: true
  },

  // Service Discovery
  services: {
    discoveryInterval: 30000, // 30 seconds
    healthCheckTimeout: 5000, // 5 seconds
    retryAttempts: 3,
    retryDelay: 1000
  },

  // Validation
  validation: {
    strictMode: process.env.NODE_ENV === 'production',
    validateResponses: true,
    validateRequests: true,
    schemaValidation: true
  },

  // Features
  features: {
    liveReload: process.env.NODE_ENV === 'development',
    mockData: true,
    codeGeneration: true,
    interactiveTesting: true,
    analytics: true
  }
};

// Main Documentation Configuration
export const documentationConfig: DocumentationConfig = {
  title: 'Essential CodAI Services API Documentation',
  description: 'Comprehensive interactive API documentation for all Essential CodAI Services including Authentication, Gateway, Hub, Database, and MCP services.',
  version: '1.0.0',
  termsOfService: 'https://codai.dev/terms',
  contact: {
    name: 'CodAI Development Team',
    url: 'https://codai.dev/support',
    email: 'api-support@codai.dev'
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT'
  },
  servers: [
    {
      url: 'http://localhost:8100',
      description: 'Authentication API - Development Server'
    },
    {
      url: 'http://localhost:8010',
      description: 'API Gateway - Development Server'
    },
    {
      url: 'http://localhost:8110',
      description: 'Hub API - Development Server'
    },
    {
      url: 'http://localhost:4950',
      description: 'MemorAI MCP Server - Development Server'
    },
    {
      url: 'http://localhost:8180',
      description: 'CBD Database API - Development Server'
    },
    {
      url: 'http://localhost:8006',
      description: 'MemorAI Frontend - Development Server'
    },
    {
      url: 'https://api.codai.dev',
      description: 'Production API Gateway'
    }
  ],
  externalDocs: {
    description: 'CodAI Development Documentation',
    url: 'https://docs.codai.dev'
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication, authorization, and security operations',
      externalDocs: {
        description: 'Authentication Guide',
        url: 'https://docs.codai.dev/authentication'
      }
    },
    {
      name: 'Gateway',
      description: 'API gateway, routing, and load balancing operations',
      externalDocs: {
        description: 'Gateway Configuration',
        url: 'https://docs.codai.dev/gateway'
      }
    },
    {
      name: 'Hub',
      description: 'Service discovery, configuration, and hub operations',
      externalDocs: {
        description: 'Hub Services Guide',
        url: 'https://docs.codai.dev/hub'
      }
    },
    {
      name: 'Memory',
      description: 'Memory management, storage, and retrieval operations',
      externalDocs: {
        description: 'Memory Context Protocol',
        url: 'https://docs.codai.dev/mcp'
      }
    },
    {
      name: 'Database',
      description: 'Data management, storage, and query operations',
      externalDocs: {
        description: 'Database Schema Guide',
        url: 'https://docs.codai.dev/database'
      }
    },
    {
      name: 'Frontend',
      description: 'Frontend application APIs and user interface operations',
      externalDocs: {
        description: 'Frontend Integration',
        url: 'https://docs.codai.dev/frontend'
      }
    }
  ],
  security: [
    {
      bearerAuth: []
    },
    {
      oauth2: ['read:profile']
    },
    {
      apiKeyAuth: []
    }
  ]
};

// Interactive Features Configuration
export const interactiveFeatures: InteractiveFeatures = {
  tryItOut: true,
  requestInterception: true,
  responseValidation: true,
  codeGeneration: true,
  mockDataGeneration: true,
  testSuiteGeneration: true
};

// Hub Theme Configuration
export const hubTheme: HubTheme = {
  primaryColor: '#0066cc',
  secondaryColor: '#004499',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  darkMode: false
};

// Documentation Hub Configuration
export const documentationHub: DocumentationHub = {
  title: 'CodAI API Documentation Hub',
  description: 'Interactive documentation and testing interface for all Essential CodAI Services',
  logo: '/assets/codai-logo.svg',
  favicon: '/assets/favicon.ico',
  theme: hubTheme,
  services: ESSENTIAL_CODAI_SERVICES,
  features: interactiveFeatures,
  customization: {
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin-bottom: 2rem; }
      .swagger-ui .scheme-container { margin-bottom: 2rem; }
      .codai-header {
        background: linear-gradient(135deg, #0066cc, #004499);
        color: white;
        padding: 2rem;
        text-align: center;
        margin-bottom: 2rem;
      }
      .codai-service-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
      }
      .codai-service-card {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.5rem;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: box-shadow 0.2s;
      }
      .codai-service-card:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
      .codai-status-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;
      }
      .codai-status-healthy {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      .codai-status-unhealthy {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
    `,
    additionalPages: [
      {
        title: 'Getting Started',
        path: '/getting-started',
        content: '# Getting Started with CodAI APIs\n\nWelcome to the CodAI API documentation...',
        order: 1
      },
      {
        title: 'Authentication Guide',
        path: '/authentication',
        content: '# Authentication Guide\n\nLearn how to authenticate with CodAI services...',
        order: 2
      }
    ],
    navigation: [
      {
        title: 'Services',
        path: '/services',
        icon: 'service',
        order: 1
      },
      {
        title: 'Interactive Testing',
        path: '/testing',
        icon: 'test',
        order: 2
      },
      {
        title: 'Code Examples',
        path: '/examples',
        icon: 'code',
        order: 3
      }
    ]
  }
};

// Code Generation Configuration
export const codeGenerationConfig = {
  languages: [
    CodeLanguage.JAVASCRIPT,
    CodeLanguage.TYPESCRIPT,
    CodeLanguage.PYTHON,
    CodeLanguage.CURL,
    CodeLanguage.JAVA,
    CodeLanguage.CSHARP
  ],
  templates: {
    [CodeLanguage.TYPESCRIPT]: `
// TypeScript Example
import axios from 'axios';

interface {{operationId}}Request {
  {{#parameters}}
  {{name}}: {{type}};
  {{/parameters}}
}

interface {{operationId}}Response {
  {{#responses}}
  {{name}}: {{type}};
  {{/responses}}
}

export async function {{operationId}}(
  {{#parameters}}{{name}}: {{type}}{{#hasMore}}, {{/hasMore}}{{/parameters}}
): Promise<{{operationId}}Response> {
  const response = await axios.{{method}}('{{baseUrl}}{{path}}', {
    {{#hasBody}}data: { {{#bodyParams}}{{name}}{{#hasMore}}, {{/hasMore}}{{/bodyParams}} },{{/hasBody}}
    {{#hasQuery}}params: { {{#queryParams}}{{name}}{{#hasMore}}, {{/hasMore}}{{/queryParams}} },{{/hasQuery}}
    {{#hasAuth}}headers: { 'Authorization': \`Bearer \${token}\` },{{/hasAuth}}
  });
  
  return response.data;
}
    `,
    [CodeLanguage.PYTHON]: `
# Python Example
import requests
from typing import Dict, Any

def {{operationId}}(
    {{#parameters}}{{name}}: {{pythonType}}{{#hasMore}}, {{/hasMore}}{{/parameters}}
) -> Dict[str, Any]:
    """
    {{description}}
    """
    url = "{{baseUrl}}{{path}}"
    
    {{#hasQuery}}
    params = {
        {{#queryParams}}"{{name}}": {{name}}{{#hasMore}},{{/hasMore}}{{/queryParams}}
    }
    {{/hasQuery}}
    
    {{#hasBody}}
    data = {
        {{#bodyParams}}"{{name}}": {{name}}{{#hasMore}},{{/hasMore}}{{/bodyParams}}
    }
    {{/hasBody}}
    
    {{#hasAuth}}
    headers = {
        "Authorization": f"Bearer {token}"
    }
    {{/hasAuth}}
    
    response = requests.{{method}}(
        url{{#hasQuery}}, params=params{{/hasQuery}}{{#hasBody}}, json=data{{/hasBody}}{{#hasAuth}}, headers=headers{{/hasAuth}}
    )
    
    response.raise_for_status()
    return response.json()
    `
  },
  customization: {
    baseUrl: 'http://localhost:8010',
    authenticationMethod: 'bearer',
    errorHandling: true,
    typescript: true,
    async: true
  }
};

// Default OpenAPI Template
export const defaultOpenApiTemplate = {
  openapi: '3.0.3',
  info: {
    title: '{{service.name}}',
    description: '{{service.description}}',
    version: '{{service.version}}',
    termsOfService: 'https://codai.dev/terms',
    contact: {
      name: 'CodAI Development Team',
      url: 'https://codai.dev/support',
      email: 'api-support@codai.dev'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: '{{service.baseUrl}}',
      description: '{{service.name}} - Development Server'
    }
  ],
  tags: [
    {
      name: '{{service.category}}',
      description: '{{service.description}}',
      externalDocs: {
        description: 'Service Documentation',
        url: 'https://docs.codai.dev/{{service.id}}'
      }
    }
  ],
  paths: {},
  components: {
    schemas: {},
    securitySchemes: {},
    responses: {
      Error: {
        description: 'Error response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  description: 'Error message'
                },
                code: {
                  type: 'string',
                  description: 'Error code'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Error timestamp'
                }
              },
              required: ['error', 'code', 'timestamp']
            }
          }
        }
      },
      Health: {
        description: 'Health check response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['healthy', 'unhealthy'],
                  description: 'Service health status'
                },
                service: {
                  type: 'string',
                  description: 'Service name'
                },
                version: {
                  type: 'string',
                  description: 'Service version'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Health check timestamp'
                }
              },
              required: ['status', 'service', 'version', 'timestamp']
            }
          }
        }
      }
    }
  }
};