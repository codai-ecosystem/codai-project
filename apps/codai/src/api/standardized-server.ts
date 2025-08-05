/**
 * CODAI Service API Implementation
 * Standardized platform management API using CODAI standards
 */

import express from 'express';
// import {
//     setupCodaiMiddleware,
//     createStandardApiConfig,
//     jwtAuthMiddleware,
//     validate,
//     CodaiValidationSchemas,
//     generateServiceOpenApiSpec,
//     globalErrorHandler,
//     notFoundHandler
// } from '@codai/api-standards';
import { OpenAPIV3 } from 'openapi-types';
// import swaggerUi from 'swagger-ui-express';
import { z } from 'zod';
import { Express } from 'express';

const app: Express = express();

// Basic middleware setup for development
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Helper function to wrap Zod schemas for validation middleware
const wrapSchema = (schema: z.ZodSchema) => schema as any;
// const config = createStandardApiConfig('codai', 4006);

// Basic validation middleware
const validate = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Validation failed', details: error });
  }
};

// Setup universal CODAI middleware - simplified for deployment
// setupCodaiMiddleware(app, config);

// CODAI specific validation schemas
const CodaiSchemas = {
    createProject: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(['WEB', 'MOBILE', 'API', 'DESKTOP', 'CLI', 'LIBRARY']),
        template: z.string().optional(),
        framework: z.string().optional(),
        language: z.enum(['TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GO', 'RUST', 'JAVA']),
        features: z.array(z.string()).optional(),
        settings: z.record(z.string(), z.any()).optional(),
        isPrivate: z.boolean().default(false),
        tags: z.array(z.string()).optional()
    }),

    updateProject: z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        framework: z.string().optional(),
        features: z.array(z.string()).optional(),
        settings: z.record(z.string(), z.any()).optional(),
        isPrivate: z.boolean().optional(),
        tags: z.array(z.string()).optional()
    }),

    generateCode: z.object({
        projectId: z.string().min(1),
        prompt: z.string().min(1),
        type: z.enum(['COMPONENT', 'FUNCTION', 'CLASS', 'API', 'TEST', 'FULL_FEATURE']),
        language: z.enum(['TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GO', 'RUST', 'JAVA']).optional(),
        framework: z.string().optional(),
        options: z.record(z.string(), z.any()).optional()
    }),

    analyzeCode: z.object({
        projectId: z.string().min(1),
        filePath: z.string().min(1).optional(),
        code: z.string().min(1).optional(),
        analysisType: z.enum(['QUALITY', 'SECURITY', 'PERFORMANCE', 'COMPLEXITY', 'DEPENDENCIES']),
        options: z.record(z.string(), z.any()).optional()
    }),

    createTemplate: z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        type: z.enum(['PROJECT', 'COMPONENT', 'FEATURE', 'BOILERPLATE']),
        category: z.string().min(1),
        language: z.enum(['TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GO', 'RUST', 'JAVA']),
        framework: z.string().optional(),
        tags: z.array(z.string()).optional(),
        content: z.record(z.string(), z.any()),
        isPublic: z.boolean().default(false)
    })
};

// CODAI Service specific paths for OpenAPI
const codaiServicePaths: OpenAPIV3.PathsObject = {
    '/projects': {
        get: {
            tags: ['Projects'],
            summary: 'List projects',
            description: 'Retrieve all user projects',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'type',
                    in: 'query',
                    description: 'Filter by project type',
                    schema: {
                        type: 'string',
                        enum: ['WEB', 'MOBILE', 'API', 'DESKTOP', 'CLI', 'LIBRARY']
                    }
                },
                {
                    name: 'language',
                    in: 'query',
                    description: 'Filter by programming language',
                    schema: {
                        type: 'string',
                        enum: ['TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GO', 'RUST', 'JAVA']
                    }
                },
                {
                    name: 'tag',
                    in: 'query',
                    description: 'Filter by tag',
                    schema: { type: 'string' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of projects to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
                }
            ],
            responses: {
                '200': {
                    description: 'List of projects',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    projects: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Project' }
                                                    },
                                                    total: { type: 'integer' }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' }
            }
        },
        post: {
            tags: ['Projects'],
            summary: 'Create project',
            description: 'Create a new code project',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateProjectRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Project created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Project' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '400': { $ref: '#/components/responses/BadRequest' },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    },
    '/projects/{id}': {
        get: {
            tags: ['Projects'],
            summary: 'Get project details',
            description: 'Get detailed information about a specific project',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Project ID',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'Project details',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Project' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' },
                '404': { $ref: '#/components/responses/NotFound' }
            }
        },
        put: {
            tags: ['Projects'],
            summary: 'Update project',
            description: 'Update an existing project',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Project ID',
                    schema: { type: 'string' }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateProjectRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Project updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Project' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' },
                '404': { $ref: '#/components/responses/NotFound' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        },
        delete: {
            tags: ['Projects'],
            summary: 'Delete project',
            description: 'Delete a project',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Project ID',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'Project deleted successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CodaiResponse' }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' },
                '404': { $ref: '#/components/responses/NotFound' }
            }
        }
    },
    '/ai/generate': {
        post: {
            tags: ['AI'],
            summary: 'Generate code',
            description: 'Generate code using AI based on natural language prompt',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/GenerateCodeRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Code generated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    code: { type: 'string' },
                                                    explanation: { type: 'string' },
                                                    files: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'object',
                                                            properties: {
                                                                path: { type: 'string' },
                                                                content: { type: 'string' }
                                                            }
                                                        }
                                                    },
                                                    dependencies: {
                                                        type: 'array',
                                                        items: { type: 'string' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '400': { $ref: '#/components/responses/BadRequest' },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    },
    '/ai/analyze': {
        post: {
            tags: ['AI'],
            summary: 'Analyze code',
            description: 'Analyze code quality, security, performance, and complexity',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/AnalyzeCodeRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Code analysis completed',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    score: { type: 'number' },
                                                    issues: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'object',
                                                            properties: {
                                                                type: { type: 'string' },
                                                                severity: { type: 'string' },
                                                                message: { type: 'string' },
                                                                line: { type: 'integer' },
                                                                suggestion: { type: 'string' }
                                                            }
                                                        }
                                                    },
                                                    metrics: { type: 'object' },
                                                    recommendations: {
                                                        type: 'array',
                                                        items: { type: 'string' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '400': { $ref: '#/components/responses/BadRequest' },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    },
    '/templates': {
        get: {
            tags: ['Templates'],
            summary: 'List templates',
            description: 'Get available code templates',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'type',
                    in: 'query',
                    description: 'Filter by template type',
                    schema: {
                        type: 'string',
                        enum: ['PROJECT', 'COMPONENT', 'FEATURE', 'BOILERPLATE']
                    }
                },
                {
                    name: 'category',
                    in: 'query',
                    description: 'Filter by category',
                    schema: { type: 'string' }
                },
                {
                    name: 'language',
                    in: 'query',
                    description: 'Filter by programming language',
                    schema: {
                        type: 'string',
                        enum: ['TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GO', 'RUST', 'JAVA']
                    }
                }
            ],
            responses: {
                '200': {
                    description: 'List of templates',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    templates: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Template' }
                                                    },
                                                    total: { type: 'integer' }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' }
            }
        },
        post: {
            tags: ['Templates'],
            summary: 'Create template',
            description: 'Create a new code template',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateTemplateRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Template created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Template' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '400': { $ref: '#/components/responses/BadRequest' },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    }
};

// CODAI Service specific schemas
const codaiServiceSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    Project: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'Project ID'
            },
            name: {
                type: 'string',
                description: 'Project name'
            },
            description: {
                type: 'string',
                description: 'Project description'
            },
            type: {
                type: 'string',
                enum: ['WEB', 'MOBILE', 'API', 'DESKTOP', 'CLI', 'LIBRARY'],
                description: 'Project type'
            },
            template: {
                type: 'string',
                description: 'Template used to create project'
            },
            framework: {
                type: 'string',
                description: 'Framework or library used'
            },
            language: {
                type: 'string',
                enum: ['TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GO', 'RUST', 'JAVA'],
                description: 'Primary programming language'
            },
            features: {
                type: 'array',
                items: { type: 'string' },
                description: 'Project features'
            },
            settings: {
                type: 'object',
                description: 'Project settings'
            },
            isPrivate: {
                type: 'boolean',
                description: 'Project privacy status'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Project tags'
            },
            ownerId: {
                type: 'string',
                description: 'Project owner user ID'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Creation timestamp'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Last update timestamp'
            }
        },
        required: ['id', 'name', 'type', 'language', 'ownerId', 'createdAt']
    },
    CreateProjectRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                description: 'Project name'
            },
            description: {
                type: 'string',
                description: 'Project description'
            },
            type: {
                type: 'string',
                enum: ['WEB', 'MOBILE', 'API', 'DESKTOP', 'CLI', 'LIBRARY'],
                description: 'Project type'
            },
            template: {
                type: 'string',
                description: 'Template to use for project creation'
            },
            framework: {
                type: 'string',
                description: 'Framework or library to use'
            },
            language: {
                type: 'string',
                enum: ['TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GO', 'RUST', 'JAVA'],
                description: 'Primary programming language'
            },
            features: {
                type: 'array',
                items: { type: 'string' },
                description: 'Features to include in project'
            },
            settings: {
                type: 'object',
                description: 'Initial project settings'
            },
            isPrivate: {
                type: 'boolean',
                default: false,
                description: 'Make project private'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Project tags'
            }
        },
        required: ['name', 'type', 'language']
    },
    UpdateProjectRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                description: 'Project name'
            },
            description: {
                type: 'string',
                description: 'Project description'
            },
            framework: {
                type: 'string',
                description: 'Framework or library'
            },
            features: {
                type: 'array',
                items: { type: 'string' },
                description: 'Project features'
            },
            settings: {
                type: 'object',
                description: 'Project settings'
            },
            isPrivate: {
                type: 'boolean',
                description: 'Project privacy status'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Project tags'
            }
        }
    },
    GenerateCodeRequest: {
        type: 'object',
        properties: {
            projectId: {
                type: 'string',
                minLength: 1,
                description: 'Target project ID'
            },
            prompt: {
                type: 'string',
                minLength: 1,
                description: 'Natural language description of code to generate'
            },
            type: {
                type: 'string',
                enum: ['COMPONENT', 'FUNCTION', 'CLASS', 'API', 'TEST', 'FULL_FEATURE'],
                description: 'Type of code to generate'
            },
            language: {
                type: 'string',
                enum: ['TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GO', 'RUST', 'JAVA'],
                description: 'Programming language for generated code'
            },
            framework: {
                type: 'string',
                description: 'Framework or library context'
            },
            options: {
                type: 'object',
                description: 'Additional generation options'
            }
        },
        required: ['projectId', 'prompt', 'type']
    },
    AnalyzeCodeRequest: {
        type: 'object',
        properties: {
            projectId: {
                type: 'string',
                minLength: 1,
                description: 'Project ID for context'
            },
            filePath: {
                type: 'string',
                minLength: 1,
                description: 'File path to analyze'
            },
            code: {
                type: 'string',
                minLength: 1,
                description: 'Code content to analyze'
            },
            analysisType: {
                type: 'string',
                enum: ['QUALITY', 'SECURITY', 'PERFORMANCE', 'COMPLEXITY', 'DEPENDENCIES'],
                description: 'Type of analysis to perform'
            },
            options: {
                type: 'object',
                description: 'Analysis options'
            }
        },
        required: ['projectId', 'analysisType']
    },
    Template: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'Template ID'
            },
            name: {
                type: 'string',
                description: 'Template name'
            },
            description: {
                type: 'string',
                description: 'Template description'
            },
            type: {
                type: 'string',
                enum: ['PROJECT', 'COMPONENT', 'FEATURE', 'BOILERPLATE'],
                description: 'Template type'
            },
            category: {
                type: 'string',
                description: 'Template category'
            },
            language: {
                type: 'string',
                enum: ['TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GO', 'RUST', 'JAVA'],
                description: 'Programming language'
            },
            framework: {
                type: 'string',
                description: 'Framework or library'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Template tags'
            },
            content: {
                type: 'object',
                description: 'Template content and structure'
            },
            isPublic: {
                type: 'boolean',
                description: 'Template visibility'
            },
            authorId: {
                type: 'string',
                description: 'Template author ID'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Creation timestamp'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Last update timestamp'
            }
        },
        required: ['id', 'name', 'type', 'category', 'language', 'content', 'authorId', 'createdAt']
    },
    CreateTemplateRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                description: 'Template name'
            },
            description: {
                type: 'string',
                minLength: 1,
                description: 'Template description'
            },
            type: {
                type: 'string',
                enum: ['PROJECT', 'COMPONENT', 'FEATURE', 'BOILERPLATE'],
                description: 'Template type'
            },
            category: {
                type: 'string',
                minLength: 1,
                description: 'Template category'
            },
            language: {
                type: 'string',
                enum: ['TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GO', 'RUST', 'JAVA'],
                description: 'Programming language'
            },
            framework: {
                type: 'string',
                description: 'Framework or library'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Template tags'
            },
            content: {
                type: 'object',
                description: 'Template content and structure'
            },
            isPublic: {
                type: 'boolean',
                default: false,
                description: 'Make template public'
            }
        },
        required: ['name', 'description', 'type', 'category', 'language', 'content']
    }
};

// Generate OpenAPI specification
const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'CODAI Service API',
        version: '1.0.0',
        description: 'CODAI platform management API'
    },
    paths: codaiServicePaths,
    components: {
        schemas: codaiServiceSchemas
    }
};

// Swagger UI documentation (disabled for build)
// app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
//     customCss: '.swagger-ui .topbar { display: none }',
//     customSiteTitle: 'CODAI Service API Documentation',
// }));

// Authentication middleware for protected routes (simplified)
const authMiddleware = (req: any, res: any, next: any) => {
    // Skip authentication for now - implement proper JWT middleware later
    next();
};

// API Routes
app.use('/api/v1', authMiddleware);

// Projects endpoints
app.get('/api/v1/projects', async (req, res) => {
    // Mock implementation
    const projects = [
        {
            id: 'proj-123e4567-e89b-12d3-a456-426614174000',
            name: 'My Web App',
            description: 'A modern web application',
            type: 'WEB',
            template: 'next-js-starter',
            framework: 'Next.js',
            language: 'TYPESCRIPT',
            features: ['authentication', 'database', 'api'],
            settings: { port: 3000, environment: 'development' },
            isPrivate: false,
            tags: ['web', 'react', 'nextjs'],
            ownerId: 'user-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    const filteredProjects = projects.filter(project => {
        if (req.query.type && project.type !== req.query.type) return false;
        if (req.query.language && project.language !== req.query.language) return false;
        if (req.query.tag && !project.tags.includes(req.query.tag as string)) return false;
        return true;
    });

    const response = req.responseBuilder.success({
        projects: filteredProjects.slice(0, parseInt(req.query.limit as string) || 20),
        total: filteredProjects.length
    });

    res.json(response);
});

app.post('/api/v1/projects',
    validate(wrapSchema(CodaiSchemas.createProject)),
    async (req, res) => {
        // Mock implementation
        const newProject = {
            id: 'proj-' + Date.now(),
            ...req.body,
            ownerId: 'user-123', // From JWT token in real implementation
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newProject);
        res.status(201).json(response);
    }
);

app.get('/api/v1/projects/:id', async (req, res) => {
    // Mock implementation
    const project = {
        id: req.params.id,
        name: 'Sample Project',
        description: 'A sample project for demonstration',
        type: 'WEB',
        template: 'next-js-starter',
        framework: 'Next.js',
        language: 'TYPESCRIPT',
        features: ['authentication', 'database'],
        settings: { port: 3000 },
        isPrivate: false,
        tags: ['web', 'sample'],
        ownerId: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const response = req.responseBuilder.success(project);
    res.json(response);
});

// AI endpoints
app.post('/api/v1/ai/generate',
    validate(wrapSchema(CodaiSchemas.generateCode)),
    async (req, res) => {
        // Mock implementation
        const generatedCode = {
            code: `// Generated ${req.body.type.toLowerCase()} based on: "${req.body.prompt}"
export const generatedFunction = () => {
  console.log('This code was generated by CODAI');
  return 'Generated code result';
};`,
            explanation: `This ${req.body.type.toLowerCase()} was generated based on your prompt: "${req.body.prompt}". It includes basic functionality and follows best practices for ${req.body.language || 'the target language'}.`,
            files: [
                {
                    path: 'generated/component.ts',
                    content: 'export const Component = () => <div>Generated Component</div>;'
                }
            ],
            dependencies: ['react', 'typescript']
        };

        const response = req.responseBuilder.success(generatedCode);
        res.json(response);
    }
);

app.post('/api/v1/ai/analyze',
    validate(wrapSchema(CodaiSchemas.analyzeCode)),
    async (req, res) => {
        // Mock implementation
        const analysis = {
            score: 85,
            issues: [
                {
                    type: 'STYLE',
                    severity: 'INFO',
                    message: 'Consider using more descriptive variable names',
                    line: 12,
                    suggestion: 'Rename variable "x" to something more meaningful'
                },
                {
                    type: 'PERFORMANCE',
                    severity: 'WARNING',
                    message: 'This loop could be optimized',
                    line: 25,
                    suggestion: 'Consider using Array.map() for better performance'
                }
            ],
            metrics: {
                complexity: 8,
                maintainability: 75,
                testCoverage: 90,
                duplicateLines: 5
            },
            recommendations: [
                'Add more unit tests for edge cases',
                'Consider breaking down large functions',
                'Add JSDoc comments for better documentation'
            ]
        };

        const response = req.responseBuilder.success(analysis);
        res.json(response);
    }
);

// Templates endpoints
app.get('/api/v1/templates', async (req, res) => {
    // Mock implementation
    const templates = [
        {
            id: 'template-next-starter',
            name: 'Next.js Starter',
            description: 'A complete Next.js starter template with TypeScript',
            type: 'PROJECT',
            category: 'web-framework',
            language: 'TYPESCRIPT',
            framework: 'Next.js',
            tags: ['react', 'nextjs', 'typescript', 'starter'],
            content: {
                structure: ['pages/', 'components/', 'styles/', 'public/'],
                dependencies: ['next', 'react', 'typescript']
            },
            isPublic: true,
            authorId: 'codai-team',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    const filteredTemplates = templates.filter(template => {
        if (req.query.type && template.type !== req.query.type) return false;
        if (req.query.category && template.category !== req.query.category) return false;
        if (req.query.language && template.language !== req.query.language) return false;
        return true;
    });

    const response = req.responseBuilder.success({
        templates: filteredTemplates,
        total: filteredTemplates.length
    });

    res.json(response);
});

app.post('/api/v1/templates',
    validate(wrapSchema(CodaiSchemas.createTemplate)),
    async (req, res) => {
        // Mock implementation
        const newTemplate = {
            id: 'template-' + Date.now(),
            ...req.body,
            authorId: 'user-123', // From JWT token in real implementation
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newTemplate);
        res.status(201).json(response);
    }
);

// Error handling (simplified)
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.use((req: any, res: any) => {
    res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`💻 CODAI Service API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;

