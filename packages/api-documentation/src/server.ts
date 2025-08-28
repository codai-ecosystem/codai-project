/**
 * Interactive Documentation Server
 * Serves comprehensive OpenAPI documentation with interactive testing capabilities
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';

import OpenApiGenerator from './generator';
import { ESSENTIAL_CODAI_SERVICES, ServiceStatus, ValidationResult } from './types';
import { config, documentationHub, codeGenerationConfig } from './config';

export class DocumentationServer {
  private server: FastifyInstance;
  private generator: OpenApiGenerator;
  private serviceHealthCache: Map<string, ServiceStatus> = new Map();

  constructor() {
    this.server = Fastify({
      logger: {
        level: process.env.NODE_ENV === 'development' ? 'info' : 'warn'
      }
    });
    this.generator = new OpenApiGenerator();
    this.setupServer();
  }

  /**
   * Setup Fastify server with plugins and routes
   */
  private async setupServer(): Promise<void> {
    // Register CORS
    await this.server.register(fastifyCors, {
      origin: config.server.cors.origin,
      credentials: config.server.cors.credentials
    });

    // Register static file serving
    await this.server.register(fastifyStatic, {
      root: path.join(process.cwd(), 'static'),
      prefix: '/static/'
    });

    // Register Swagger documentation
    await this.server.register(fastifySwagger, {
      openapi: {
        openapi: '3.0.3',
        info: {
          title: 'CodAI API Documentation Server',
          description: 'Interactive documentation server for Essential CodAI Services',
          version: '1.0.0'
        },
        servers: [
          {
            url: `http://${config.server.host}:${config.server.port}`,
            description: 'Documentation Server'
          }
        ]
      }
    });

    // Register Swagger UI
    await this.server.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        tryItOutEnabled: true,
        requestInterceptor: `
          function(request) {
            console.log('API Request:', request);
            return request;
          }
        `,
        responseInterceptor: `
          function(response) {
            console.log('API Response:', response);
            return response;
          }
        `
      },
      uiHooks: {
        onRequest: async (request: FastifyRequest, reply: FastifyReply) => {
          console.log(`Documentation accessed: ${request.url}`);
        }
      },
      staticCSP: true,
      transformStaticCSP: (header: string) => header
    });

    // Setup routes
    this.setupRoutes();
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health endpoint
    this.server.get('/health', {
      schema: {
        description: 'Documentation server health check',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              service: { type: 'string' },
              version: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }, async (request, reply) => {
      return {
        status: 'healthy',
        service: 'CodAI API Documentation Server',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      };
    });

    // Documentation hub homepage
    this.server.get('/', {
      schema: {
        description: 'Documentation hub homepage',
        tags: ['Documentation'],
        response: {
          200: {
            type: 'string',
            description: 'HTML page'
          }
        }
      }
    }, async (request, reply) => {
      const html = await this.generateHubHomepage();
      reply.type('text/html').send(html);
    });

    // List all services
    this.server.get('/api/services', {
      schema: {
        description: 'Get all Essential CodAI Services',
        tags: ['Services'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                version: { type: 'string' },
                baseUrl: { type: 'string' },
                port: { type: 'number' },
                category: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
                status: { type: 'string' }
              }
            }
          }
        }
      }
    }, async (request, reply) => {
      const services = ESSENTIAL_CODAI_SERVICES.map(service => ({
        ...service,
        status: this.serviceHealthCache.get(service.id)?.status || 'unknown'
      }));
      return services;
    });

    // Get service OpenAPI specification
    this.server.get('/api/services/:serviceId/openapi', {
      schema: {
        description: 'Get OpenAPI specification for a service',
        tags: ['OpenAPI'],
        params: {
          type: 'object',
          properties: {
            serviceId: { type: 'string' }
          },
          required: ['serviceId']
        },
        querystring: {
          type: 'object',
          properties: {
            format: { type: 'string', enum: ['json', 'yaml'], default: 'json' }
          }
        }
      }
    }, async (request: any, reply) => {
      try {
        const { serviceId } = request.params;
        const { format = 'json' } = request.query;

        const spec = await this.generator.generateServiceSpec(serviceId);

        if (format === 'yaml') {
          const YAML = await import('yaml');
          reply.type('application/x-yaml');
          return YAML.stringify(spec);
        }

        return spec;
      } catch (error: any) {
        reply.code(404).send({
          error: 'Service not found',
          message: error?.message || 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Check service health
    this.server.get('/api/services/:serviceId/health', {
      schema: {
        description: 'Check health of a specific service',
        tags: ['Health'],
        params: {
          type: 'object',
          properties: {
            serviceId: { type: 'string' }
          },
          required: ['serviceId']
        }
      }
    }, async (request: any, reply) => {
      try {
        const { serviceId } = request.params;
        const status = await this.generator.checkServiceHealth(serviceId);
        this.serviceHealthCache.set(serviceId, status);
        return status;
      } catch (error: any) {
        reply.code(404).send({
          error: 'Service not found',
          message: error?.message || 'Unknown error'
        });
      }
    });

    // Get all services health
    this.server.get('/api/services/health', {
      schema: {
        description: 'Get health status of all services',
        tags: ['Health'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                serviceId: { type: 'string' },
                status: { type: 'string' },
                responseTime: { type: 'number' },
                lastChecked: { type: 'string', format: 'date-time' },
                error: { type: 'string' }
              }
            }
          }
        }
      }
    }, async (request, reply) => {
      const healthChecks = await Promise.allSettled(
        ESSENTIAL_CODAI_SERVICES.map(service =>
          this.generator.checkServiceHealth(service.id)
        )
      );

      const results = healthChecks.map((check, index) => {
        if (check.status === 'fulfilled') {
          this.serviceHealthCache.set(ESSENTIAL_CODAI_SERVICES[index].id, check.value);
          return check.value;
        } else {
          return {
            serviceId: ESSENTIAL_CODAI_SERVICES[index].id,
            status: 'error',
            lastChecked: new Date(),
            error: check.reason?.message || 'Health check failed'
          } as ServiceStatus;
        }
      });

      return results;
    });

    // Generate code examples for a service
    this.server.get('/api/services/:serviceId/code-examples', {
      schema: {
        description: 'Generate code examples for service endpoints',
        tags: ['Code Generation'],
        params: {
          type: 'object',
          properties: {
            serviceId: { type: 'string' }
          },
          required: ['serviceId']
        },
        querystring: {
          type: 'object',
          properties: {
            language: { type: 'string', default: 'typescript' },
            endpoint: { type: 'string' }
          }
        }
      }
    }, async (request: any, reply) => {
      try {
        const { serviceId } = request.params;
        const { language = 'typescript', endpoint } = request.query;

        const spec = await this.generator.generateServiceSpec(serviceId);
        const examples = this.generateCodeExamples(spec, language, endpoint);

        return examples;
      } catch (error: any) {
        reply.code(400).send({
          error: 'Code generation failed',
          message: error?.message || 'Unknown error'
        });
      }
    });

    // Validate OpenAPI specifications
    this.server.post('/api/validate', {
      schema: {
        description: 'Validate OpenAPI specifications',
        tags: ['Validation'],
        body: {
          type: 'object',
          properties: {
            serviceIds: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }, async (request: any, reply) => {
      const { serviceIds = ESSENTIAL_CODAI_SERVICES.map(s => s.id) } = request.body;

      const validationResults: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        serviceStatus: []
      };

      for (const serviceId of serviceIds) {
        try {
          const spec = await this.generator.generateServiceSpec(serviceId);
          const status = await this.generator.checkServiceHealth(serviceId);

          validationResults.serviceStatus.push(status);

          // Basic validation
          if (!spec.info?.title) {
            validationResults.errors.push({
              code: 'MISSING_TITLE',
              message: 'OpenAPI specification missing title',
              path: `${serviceId}.info.title`,
              severity: 'error'
            });
            validationResults.valid = false;
          }

          if (!spec.paths || Object.keys(spec.paths).length === 0) {
            validationResults.warnings.push({
              code: 'NO_PATHS',
              message: 'No API paths defined',
              path: `${serviceId}.paths`,
              suggestion: 'Consider adding API endpoint definitions'
            });
          }
        } catch (error: any) {
          validationResults.errors.push({
            code: 'GENERATION_ERROR',
            message: error?.message || 'Failed to generate specification',
            path: serviceId,
            severity: 'error'
          });
          validationResults.valid = false;
        }
      }

      return validationResults;
    });

    // Regenerate all documentation
    this.server.post('/api/generate', {
      schema: {
        description: 'Regenerate all documentation',
        tags: ['Generation'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              generated: { type: 'number' },
              errors: { type: 'array', items: { type: 'string' } },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }, async (request, reply) => {
      console.log('📝 Regenerating all documentation...');

      try {
        const specs = await this.generator.generateAllSpecs();

        return {
          success: true,
          generated: specs.size,
          errors: [],
          timestamp: new Date().toISOString()
        };
      } catch (error: any) {
        return {
          success: false,
          generated: 0,
          errors: [error?.message || 'Generation failed'],
          timestamp: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Generate homepage HTML for documentation hub
   */
  private async generateHubHomepage(): Promise<string> {
    const services = ESSENTIAL_CODAI_SERVICES;
    const healthStatuses = Array.from(this.serviceHealthCache.values());

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentationHub.title}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
      ${documentationHub.customization.customCss}
      .service-card { transition: all 0.3s ease; }
      .service-card:hover { transform: translateY(-2px); }
      .status-healthy { color: #10b981; }
      .status-unhealthy { color: #ef4444; }
      .status-unreachable { color: #f59e0b; }
      .loading-spinner { 
        animation: spin 1s linear infinite;
        display: inline-block;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    </style>
</head>
<body class="bg-gray-50">
    <div class="codai-header">
        <div class="container mx-auto px-6">
            <h1 class="text-4xl font-bold mb-4">${documentationHub.title}</h1>
            <p class="text-xl opacity-90">${documentationHub.description}</p>
        </div>
    </div>

    <div class="container mx-auto px-6 py-8">
        <div class="mb-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Essential CodAI Services</h2>
                <div class="space-x-4">
                    <button onclick="refreshHealth()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-sync-alt mr-2"></i>Refresh Health
                    </button>
                    <button onclick="generateDocs()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-file-alt mr-2"></i>Regenerate Docs
                    </button>
                </div>
            </div>
            
            <div class="codai-service-grid" id="servicesGrid">
                ${services.map(service => `
                    <div class="codai-service-card service-card" data-service-id="${service.id}">
                        <div class="flex justify-between items-start mb-3">
                            <h3 class="text-lg font-semibold text-gray-800">${service.name}</h3>
                            <span class="codai-status-badge service-status" id="status-${service.id}">
                                <i class="fas fa-spinner loading-spinner mr-1"></i>Checking...
                            </span>
                        </div>
                        <p class="text-gray-600 mb-4 text-sm">${service.description}</p>
                        <div class="mb-4">
                            <div class="flex flex-wrap gap-1">
                                ${service.tags.map(tag => `
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">${tag}</span>
                                `).join('')}
                            </div>
                        </div>
                        <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                            <span><i class="fas fa-server mr-1"></i>${service.baseUrl}</span>
                            <span><i class="fas fa-tag mr-1"></i>v${service.version}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <a href="${service.baseUrl}${service.docsEndpoint}" 
                               target="_blank" 
                               class="bg-blue-500 hover:bg-blue-600 text-white text-center px-3 py-2 rounded text-sm transition-colors">
                                <i class="fas fa-external-link-alt mr-1"></i>Live Docs
                            </a>
                            <a href="/api/services/${service.id}/openapi" 
                               class="bg-gray-500 hover:bg-gray-600 text-white text-center px-3 py-2 rounded text-sm transition-colors">
                                <i class="fas fa-download mr-1"></i>OpenAPI
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 class="text-xl font-semibold mb-4">Quick Actions</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/docs" class="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <i class="fas fa-book text-blue-500 text-2xl mb-2"></i>
                    <h4 class="font-semibold text-blue-800">Interactive Documentation</h4>
                    <p class="text-sm text-blue-600">Explore APIs with Swagger UI</p>
                </a>
                <a href="/api/services/health" class="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <i class="fas fa-heartbeat text-green-500 text-2xl mb-2"></i>
                    <h4 class="font-semibold text-green-800">Health Monitoring</h4>
                    <p class="text-sm text-green-600">Check all service statuses</p>
                </a>
                <a href="#" onclick="validateDocs()" class="block p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                    <i class="fas fa-check-circle text-yellow-500 text-2xl mb-2"></i>
                    <h4 class="font-semibold text-yellow-800">Validate Documentation</h4>
                    <p class="text-sm text-yellow-600">Ensure API specs are valid</p>
                </a>
            </div>
        </div>
    </div>

    <script>
        // Load service health on page load
        document.addEventListener('DOMContentLoaded', function() {
            refreshHealth();
        });

        async function refreshHealth() {
            try {
                const response = await fetch('/api/services/health');
                const statuses = await response.json();
                
                statuses.forEach(status => {
                    const statusElement = document.getElementById(\`status-\${status.serviceId}\`);
                    if (statusElement) {
                        let statusClass = 'codai-status-';
                        let icon = 'fas fa-';
                        
                        switch(status.status) {
                            case 'healthy':
                                statusClass += 'healthy';
                                icon += 'check-circle';
                                break;
                            case 'unhealthy':
                                statusClass += 'unhealthy';
                                icon += 'exclamation-triangle';
                                break;
                            default:
                                statusClass += 'unreachable';
                                icon += 'question-circle';
                        }
                        
                        statusElement.className = \`codai-status-badge \${statusClass}\`;
                        statusElement.innerHTML = \`<i class="\${icon} mr-1"></i>\${status.status.toUpperCase()}\`;
                    }
                });
            } catch (error) {
                console.error('Failed to refresh health:', error);
            }
        }

        async function generateDocs() {
            try {
                const button = event.target.closest('button');
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner loading-spinner mr-2"></i>Generating...';
                button.disabled = true;
                
                const response = await fetch('/api/generate', { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    alert(\`Successfully generated \${result.generated} specifications!\`);
                } else {
                    alert(\`Generation failed: \${result.errors.join(', ')}\`);
                }
                
                button.innerHTML = originalText;
                button.disabled = false;
            } catch (error) {
                console.error('Failed to generate docs:', error);
                alert('Documentation generation failed');
            }
        }

        async function validateDocs() {
            try {
                const response = await fetch('/api/validate', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                const result = await response.json();
                
                if (result.valid) {
                    alert('All documentation is valid!');
                } else {
                    alert(\`Validation failed: \${result.errors.length} errors, \${result.warnings.length} warnings\`);
                }
            } catch (error) {
                console.error('Failed to validate docs:', error);
                alert('Documentation validation failed');
            }
        }

        // Auto-refresh health every 30 seconds
        setInterval(refreshHealth, 30000);
    </script>
</body>
</html>
    `;
  }

  /**
   * Generate code examples for API endpoints
   */
  private generateCodeExamples(spec: any, language: string, endpoint?: string): any {
    const examples: any = {
      language,
      service: spec.info?.title || 'Unknown Service',
      examples: []
    };

    if (!spec.paths) {
      return examples;
    }

    const paths = endpoint ? { [endpoint]: spec.paths[endpoint] } : spec.paths;

    Object.entries(paths).forEach(([path, pathItem]: [string, any]) => {
      if (!pathItem) return;

      Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
        if (!operation || typeof operation !== 'object') return;

        const example = {
          endpoint: path,
          method: method.toUpperCase(),
          operationId: operation.operationId || `${method}${path.replace(/\//g, '_')}`,
          summary: operation.summary || `${method.toUpperCase()} ${path}`,
          code: this.generateCodeForLanguage(language, method, path, operation, spec)
        };

        examples.examples.push(example);
      });
    });

    return examples;
  }

  /**
   * Generate code for specific language
   */
  private generateCodeForLanguage(language: string, method: string, path: string, operation: any, spec: any): string {
    const baseUrl = spec.servers?.[0]?.url || 'http://localhost:8000';

    switch (language) {
      case 'typescript':
        return this.generateTypeScriptCode(baseUrl, method, path, operation);
      case 'python':
        return this.generatePythonCode(baseUrl, method, path, operation);
      case 'curl':
        return this.generateCurlCode(baseUrl, method, path, operation);
      default:
        return `// ${language} code generation not implemented yet`;
    }
  }

  /**
   * Generate TypeScript code example
   */
  private generateTypeScriptCode(baseUrl: string, method: string, path: string, operation: any): string {
    const operationId = operation.operationId || `${method}${path.replace(/\//g, '_')}`;
    const hasAuth = operation.security && operation.security.length > 0;

    return `
// TypeScript Example
import axios from 'axios';

interface ${operationId}Response {
  // Define response type based on your API specification
  [key: string]: any;
}

export async function ${operationId}(
  ${hasAuth ? 'token: string' : ''}
): Promise<${operationId}Response> {
  const response = await axios.${method}('${baseUrl}${path}', {
    ${hasAuth ? "headers: { 'Authorization': `Bearer ${token}` }," : ''}
  });
  
  return response.data;
}

// Usage
try {
  const result = await ${operationId}(${hasAuth ? '"your-jwt-token"' : ''});
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error);
}
    `.trim();
  }

  /**
   * Generate Python code example
   */
  private generatePythonCode(baseUrl: string, method: string, path: string, operation: any): string {
    const operationId = operation.operationId || `${method}_${path.replace(/\//g, '_')}`;
    const hasAuth = operation.security && operation.security.length > 0;

    return `
# Python Example
import requests
from typing import Dict, Any

def ${operationId}(${hasAuth ? 'token: str' : ''}) -> Dict[str, Any]:
    """
    ${operation.summary || `${method.toUpperCase()} ${path}`}
    """
    url = "${baseUrl}${path}"
    
    ${hasAuth ? `
    headers = {
        "Authorization": f"Bearer {token}"
    }
    ` : ''}
    
    response = requests.${method}(
        url${hasAuth ? ', headers=headers' : ''}
    )
    
    response.raise_for_status()
    return response.json()

# Usage
try:
    result = ${operationId}(${hasAuth ? '"your-jwt-token"' : ''})
    print("Success:", result)
except requests.exceptions.RequestException as error:
    print("Error:", error)
    `.trim();
  }

  /**
   * Generate cURL code example
   */
  private generateCurlCode(baseUrl: string, method: string, path: string, operation: any): string {
    const hasAuth = operation.security && operation.security.length > 0;

    let curl = `curl -X ${method.toUpperCase()} "${baseUrl}${path}"`;

    if (hasAuth) {
      curl += ` \\\n  -H "Authorization: Bearer YOUR_JWT_TOKEN"`;
    }

    curl += ` \\\n  -H "Content-Type: application/json"`;

    if (method !== 'get' && operation.requestBody) {
      curl += ` \\\n  -d '{}'`;
    }

    return curl;
  }

  /**
   * Start the documentation server
   */
  async start(): Promise<void> {
    try {
      const address = await this.server.listen({
        host: config.server.host,
        port: config.server.port
      });

      console.log(`🚀 CodAI API Documentation Server started at ${address}`);
      console.log(`📖 Documentation available at: ${address}`);
      console.log(`🔧 Interactive API docs: ${address}/docs`);
      console.log(`📊 Service health: ${address}/api/services/health`);

      // Generate initial documentation
      console.log('📝 Generating initial documentation...');
      await this.generator.generateAllSpecs();
      console.log('✅ Initial documentation generated');

      // Start health monitoring
      this.startHealthMonitoring();

    } catch (error) {
      console.error('❌ Failed to start documentation server:', error);
      process.exit(1);
    }
  }

  /**
   * Start periodic health monitoring
   */
  private startHealthMonitoring(): void {
    const healthCheckInterval = setInterval(async () => {
      try {
        const healthChecks = await Promise.allSettled(
          ESSENTIAL_CODAI_SERVICES.map(service =>
            this.generator.checkServiceHealth(service.id)
          )
        );

        healthChecks.forEach((check, index) => {
          if (check.status === 'fulfilled') {
            this.serviceHealthCache.set(ESSENTIAL_CODAI_SERVICES[index].id, check.value);
          }
        });
      } catch (error) {
        console.warn('⚠️ Health monitoring error:', error);
      }
    }, config.services.discoveryInterval);

    // Clean up on process termination
    process.on('SIGTERM', () => {
      clearInterval(healthCheckInterval);
      this.server.close();
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    await this.server.close();
    console.log('📴 Documentation server stopped');
  }
}

export default DocumentationServer;