/**
 * OpenAPI Documentation Generator
 * Generates comprehensive OpenAPI specifications for Essential CodAI Services
 */

import { OpenAPIV3 } from 'openapi-types';
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import axios from 'axios';

import { EssentialService, DocumentationConfig, ServiceStatus, TemplateContext, ESSENTIAL_CODAI_SERVICES } from './types';
import { documentationConfig, defaultOpenApiTemplate, config } from './config';

export class OpenApiGenerator {
  private services: Map<string, EssentialService> = new Map();
  private serviceStatuses: Map<string, ServiceStatus> = new Map();

  constructor() {
    // Initialize services
    ESSENTIAL_CODAI_SERVICES.forEach(service => {
      this.services.set(service.id, service);
      this.serviceStatuses.set(service.id, {
        serviceId: service.id,
        status: 'unreachable',
        lastChecked: new Date()
      });
    });
  }

  /**
   * Generate OpenAPI specification for a specific service
   */
  async generateServiceSpec(serviceId: string): Promise<OpenAPIV3.Document> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    console.log(`🔧 Generating OpenAPI spec for ${service.name}...`);

    // Create base specification
    const spec: OpenAPIV3.Document = {
      openapi: '3.0.3',
      info: {
        title: service.name,
        description: service.description,
        version: service.version,
        termsOfService: documentationConfig.termsOfService,
        contact: documentationConfig.contact,
        license: documentationConfig.license
      },
      servers: [
        {
          url: service.baseUrl,
          description: `${service.name} - Development Server`
        }
      ],
      tags: [
        {
          name: service.category,
          description: service.description,
          externalDocs: {
            description: 'Service Documentation',
            url: `https://docs.codai.dev/${service.id}`
          }
        }
      ],
      paths: await this.generateServicePaths(service),
      components: {
        schemas: await this.generateServiceSchemas(service),
        securitySchemes: this.generateSecuritySchemes(service),
        responses: this.generateCommonResponses(),
        parameters: this.generateCommonParameters()
      },
      security: this.generateSecurityRequirements(service)
    };

    // Enhance with service-specific paths if available
    await this.enhanceWithExistingSpec(service, spec);

    console.log(`✅ Generated OpenAPI spec for ${service.name}`);
    return spec;
  }

  /**
   * Generate paths for a service based on its category
   */
  private async generateServicePaths(service: EssentialService): Promise<OpenAPIV3.PathsObject> {
    const paths: OpenAPIV3.PathsObject = {};

    // Common health endpoint
    paths['/health'] = {
      get: {
        tags: [service.category],
        summary: 'Health check endpoint',
        description: `Check the health status of ${service.name}`,
        operationId: `${service.id}-health`,
        responses: {
          '200': {
            $ref: '#/components/responses/Health'
          },
          'default': {
            $ref: '#/components/responses/Error'
          }
        }
      }
    };

    // Service-specific paths based on category
    switch (service.category) {
      case 'authentication':
        Object.assign(paths, await this.generateAuthPaths(service));
        break;
      case 'gateway':
        Object.assign(paths, await this.generateGatewayPaths(service));
        break;
      case 'hub':
        Object.assign(paths, await this.generateHubPaths(service));
        break;
      case 'mcp':
        Object.assign(paths, await this.generateMcpPaths(service));
        break;
      case 'database':
        Object.assign(paths, await this.generateDatabasePaths(service));
        break;
      case 'frontend':
        Object.assign(paths, await this.generateFrontendPaths(service));
        break;
    }

    return paths;
  }

  /**
   * Generate authentication service paths
   */
  private async generateAuthPaths(service: EssentialService): Promise<OpenAPIV3.PathsObject> {
    return {
      '/api/v1/auth/login': {
        post: {
          tags: ['authentication'],
          summary: 'User login',
          description: 'Authenticate user with email and password',
          operationId: 'login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Successful login',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                      expiresIn: { type: 'number' },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            '401': {
              $ref: '#/components/responses/Error'
            }
          }
        }
      },
      '/api/v1/auth/register': {
        post: {
          tags: ['authentication'],
          summary: 'User registration',
          description: 'Register a new user account',
          operationId: 'register',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' }
                  },
                  required: ['email', 'password', 'firstName', 'lastName']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/auth/oauth2/{provider}/authorize': {
        get: {
          tags: ['authentication'],
          summary: 'OAuth2 authorization',
          description: 'Initiate OAuth2 authorization flow',
          operationId: 'oauth2Authorize',
          parameters: [
            {
              name: 'provider',
              in: 'path',
              required: true,
              schema: { type: 'string', enum: ['google', 'github'] }
            }
          ],
          responses: {
            '302': {
              description: 'Redirect to OAuth2 provider'
            }
          }
        }
      },
      '/api/v1/auth/mfa/setup': {
        post: {
          tags: ['authentication'],
          summary: 'Setup MFA',
          description: 'Setup Multi-Factor Authentication for user',
          operationId: 'setupMfa',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'MFA setup successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      secret: { type: 'string' },
                      qrCode: { type: 'string' },
                      backupCodes: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Generate gateway service paths
   */
  private async generateGatewayPaths(service: EssentialService): Promise<OpenAPIV3.PathsObject> {
    return {
      '/api/v1/routes': {
        get: {
          tags: ['gateway'],
          summary: 'List routes',
          description: 'Get all registered routes',
          operationId: 'getRoutes',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Routes list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Route' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/proxy/*': {
        get: {
          tags: ['gateway'],
          summary: 'Proxy request',
          description: 'Proxy request to backend service',
          operationId: 'proxyGet',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Proxied response' }
          }
        },
        post: {
          tags: ['gateway'],
          summary: 'Proxy POST request',
          description: 'Proxy POST request to backend service',
          operationId: 'proxyPost',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Proxied response' }
          }
        }
      }
    };
  }

  /**
   * Generate hub service paths
   */
  private async generateHubPaths(service: EssentialService): Promise<OpenAPIV3.PathsObject> {
    return {
      '/api/v1/services': {
        get: {
          tags: ['hub'],
          summary: 'List services',
          description: 'Get all registered services',
          operationId: 'getServices',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Services list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Service' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/services/{serviceId}/status': {
        get: {
          tags: ['hub'],
          summary: 'Get service status',
          description: 'Get status of a specific service',
          operationId: 'getServiceStatus',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'serviceId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Service status',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ServiceStatus' }
                }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Generate MCP service paths
   */
  private async generateMcpPaths(service: EssentialService): Promise<OpenAPIV3.PathsObject> {
    return {
      '/mcp': {
        post: {
          tags: ['memory'],
          summary: 'MCP JSON-RPC endpoint',
          description: 'Memory Context Protocol JSON-RPC interface',
          operationId: 'mcpJsonRpc',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    jsonrpc: { type: 'string', enum: ['2.0'] },
                    method: { type: 'string' },
                    params: { type: 'object' },
                    id: {
                      oneOf: [
                        { type: 'string' },
                        { type: 'number' }
                      ]
                    }
                  },
                  required: ['jsonrpc', 'method']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'JSON-RPC response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      jsonrpc: { type: 'string' },
                      result: { type: 'object' },
                      id: {
                        oneOf: [
                          { type: 'string' },
                          { type: 'number' }
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/memories': {
        get: {
          tags: ['memory'],
          summary: 'List memories',
          description: 'Get all stored memories',
          operationId: 'getMemories',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 }
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', default: 0 }
            }
          ],
          responses: {
            '200': {
              description: 'Memories list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      memories: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Memory' }
                      },
                      total: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Generate database service paths
   */
  private async generateDatabasePaths(service: EssentialService): Promise<OpenAPIV3.PathsObject> {
    return {
      '/api/v1/query': {
        post: {
          tags: ['database'],
          summary: 'Execute query',
          description: 'Execute a database query',
          operationId: 'executeQuery',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string' },
                    parameters: { type: 'object' }
                  },
                  required: ['query']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Query results',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      results: { type: 'array', items: { type: 'object' } },
                      count: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/schema': {
        get: {
          tags: ['database'],
          summary: 'Get schema',
          description: 'Get database schema information',
          operationId: 'getSchema',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Database schema',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      tables: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Table' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Generate frontend service paths
   */
  private async generateFrontendPaths(service: EssentialService): Promise<OpenAPIV3.PathsObject> {
    return {
      '/api/health': {
        get: {
          tags: ['frontend'],
          summary: 'Frontend health',
          description: 'Check frontend application health',
          operationId: 'frontendHealth',
          responses: {
            '200': {
              description: 'Frontend is healthy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Health' }
                }
              }
            }
          }
        }
      },
      '/api/config': {
        get: {
          tags: ['frontend'],
          summary: 'Frontend configuration',
          description: 'Get frontend configuration',
          operationId: 'getFrontendConfig',
          responses: {
            '200': {
              description: 'Frontend configuration',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      apiBaseUrl: { type: 'string' },
                      features: { type: 'object' },
                      version: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Generate common schemas for a service
   */
  private async generateServiceSchemas(service: EssentialService): Promise<{ [key: string]: OpenAPIV3.SchemaObject }> {
    const schemas: { [key: string]: OpenAPIV3.SchemaObject } = {
      Health: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['healthy', 'unhealthy'] },
          service: { type: 'string' },
          version: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' }
        },
        required: ['status', 'service', 'version', 'timestamp']
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          code: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' }
        },
        required: ['error', 'code', 'timestamp']
      }
    };

    // Add service-specific schemas
    switch (service.category) {
      case 'authentication':
        schemas.User = {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
            mfaEnabled: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        };
        break;
      case 'gateway':
        schemas.Route = {
          type: 'object',
          properties: {
            id: { type: 'string' },
            path: { type: 'string' },
            method: { type: 'string' },
            target: { type: 'string' },
            weight: { type: 'number' }
          }
        };
        break;
      case 'hub':
        schemas.Service = {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            url: { type: 'string' },
            status: { type: 'string' },
            version: { type: 'string' }
          }
        };
        schemas.ServiceStatus = {
          type: 'object',
          properties: {
            serviceId: { type: 'string' },
            status: { type: 'string', enum: ['healthy', 'unhealthy', 'unreachable'] },
            responseTime: { type: 'number' },
            lastChecked: { type: 'string', format: 'date-time' }
          }
        };
        break;
      case 'mcp':
        schemas.Memory = {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        };
        break;
      case 'database':
        schemas.Table = {
          type: 'object',
          properties: {
            name: { type: 'string' },
            columns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string' },
                  nullable: { type: 'boolean' }
                }
              }
            }
          }
        };
        break;
    }

    return schemas;
  }

  /**
   * Generate security schemes for a service
   */
  private generateSecuritySchemes(service: EssentialService): { [key: string]: OpenAPIV3.SecuritySchemeObject } {
    const schemes: { [key: string]: OpenAPIV3.SecuritySchemeObject } = {};

    service.authentication.schemes.forEach(scheme => {
      if (scheme.type === 'http') {
        schemes[scheme.name] = {
          type: 'http',
          scheme: scheme.scheme || 'bearer',
          bearerFormat: scheme.bearerFormat
        };
      } else if (scheme.type === 'oauth2' && scheme.flows) {
        schemes[scheme.name] = {
          type: 'oauth2',
          flows: scheme.flows as any
        };
      } else if (scheme.type === 'apiKey') {
        schemes[scheme.name] = {
          type: 'apiKey',
          in: scheme.in || 'header',
          name: 'X-API-Key'
        };
      }
    });

    return schemes;
  }

  /**
   * Generate common responses
   */
  private generateCommonResponses(): { [key: string]: OpenAPIV3.ResponseObject } {
    return {
      Error: {
        description: 'Error response',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      Health: {
        description: 'Health check response',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Health' }
          }
        }
      }
    };
  }

  /**
   * Generate common parameters
   */
  private generateCommonParameters(): { [key: string]: OpenAPIV3.ParameterObject } {
    return {
      limitParam: {
        name: 'limit',
        in: 'query',
        description: 'Number of items to return',
        schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 }
      },
      offsetParam: {
        name: 'offset',
        in: 'query',
        description: 'Number of items to skip',
        schema: { type: 'integer', default: 0, minimum: 0 }
      }
    };
  }

  /**
   * Generate security requirements for a service
   */
  private generateSecurityRequirements(service: EssentialService): OpenAPIV3.SecurityRequirementObject[] {
    if (service.authentication.type === 'none') {
      return [];
    }

    return service.authentication.schemes.map(scheme => ({
      [scheme.name]: scheme.flows?.authorizationCode?.scopes ? Object.keys(scheme.flows.authorizationCode.scopes) : []
    }));
  }

  /**
   * Check service health and update status
   */
  async checkServiceHealth(serviceId: string): Promise<ServiceStatus> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    const startTime = Date.now();

    try {
      const response = await axios.get(`${service.baseUrl}${service.healthEndpoint}`, {
        timeout: config.services.healthCheckTimeout
      });

      const responseTime = Date.now() - startTime;
      const status: ServiceStatus = {
        serviceId,
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked: new Date()
      };

      this.serviceStatuses.set(serviceId, status);
      return status;
    } catch (error) {
      const status: ServiceStatus = {
        serviceId,
        status: 'unreachable',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.serviceStatuses.set(serviceId, status);
      return status;
    }
  }

  /**
   * Enhance specification with existing service documentation
   */
  private async enhanceWithExistingSpec(service: EssentialService, spec: OpenAPIV3.Document): Promise<void> {
    try {
      // Try to fetch existing OpenAPI spec from service
      const response = await axios.get(`${service.baseUrl}${service.docsEndpoint}/openapi.json`, {
        timeout: 5000
      });

      if (response.data && response.data.paths) {
        // Merge existing paths with generated paths
        Object.assign(spec.paths, response.data.paths);

        // Merge schemas
        if (response.data.components?.schemas && spec.components) {
          Object.assign(spec.components.schemas, response.data.components.schemas);
        }
      }
    } catch (error: any) {
      console.warn(`⚠️ Could not fetch existing spec for ${service.name}: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Save specification to file
   */
  async saveSpecification(serviceId: string, spec: OpenAPIV3.Document, format: 'json' | 'yaml' = 'json'): Promise<string> {
    const outputDir = path.join(config.generation.outputDir, serviceId);
    await fs.ensureDir(outputDir);

    const filename = format === 'yaml' ? 'openapi.yaml' : 'openapi.json';
    const filePath = path.join(outputDir, filename);

    const content = format === 'yaml' ? YAML.stringify(spec) : JSON.stringify(spec, null, 2);
    await fs.writeFile(filePath, content, 'utf8');

    console.log(`📄 Saved ${format.toUpperCase()} specification: ${filePath}`);
    return filePath;
  }

  /**
   * Generate all service specifications
   */
  async generateAllSpecs(): Promise<Map<string, OpenAPIV3.Document>> {
    console.log('🔧 Generating OpenAPI specifications for all Essential CodAI Services...');

    const specs = new Map<string, OpenAPIV3.Document>();

    for (const [serviceId, service] of this.services) {
      try {
        const spec = await this.generateServiceSpec(serviceId);
        specs.set(serviceId, spec);

        // Save in both formats
        await this.saveSpecification(serviceId, spec, 'json');
        await this.saveSpecification(serviceId, spec, 'yaml');
      } catch (error: any) {
        console.error(`❌ Failed to generate spec for ${service.name}: ${error?.message || 'Unknown error'}`);
      }
    }

    console.log(`✅ Generated ${specs.size} OpenAPI specifications`);
    return specs;
  }

  /**
   * Get service status
   */
  getServiceStatus(serviceId: string): ServiceStatus | undefined {
    return this.serviceStatuses.get(serviceId);
  }

  /**
   * Get all service statuses
   */
  getAllServiceStatuses(): ServiceStatus[] {
    return Array.from(this.serviceStatuses.values());
  }
}

export default OpenApiGenerator;