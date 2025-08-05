/**
 * ADMIN Service API Implementation
 * Standardized administration and management API using CODAI standards
 */

import express from 'express';
import {
    setupCodaiMiddleware,
    createStandardApiConfig,
    jwtAuthMiddleware,
    validate,
    CodaiValidationSchemas,
    generateServiceOpenApiSpec,
    globalErrorHandler,
    notFoundHandler
} from '../lib/api-standards';
import { OpenAPIV3 } from 'openapi-types';
import swaggerUi from 'swagger-ui-express';
import { z } from 'zod';

const app = express();
const config = createStandardApiConfig('admin', 4005);

// Setup universal CODAI middleware
setupCodaiMiddleware(app, config);

// ADMIN specific validation schemas
const AdminSchemas = {
    createUser: z.object({
        email: z.string().email(),
        name: z.string().min(1),
        role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).default('USER'),
        isActive: z.boolean().default(true),
        permissions: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional()
    }),

    updateUser: z.object({
        name: z.string().min(1).optional(),
        role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
        isActive: z.boolean().optional(),
        permissions: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional()
    }),

    listUsers: z.object({
        role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
        isActive: z.boolean().optional(),
        search: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        offset: z.coerce.number().int().min(0).default(0)
    }),

    updateSystemConfig: z.object({
        section: z.string().min(1),
        config: z.record(z.any())
    }),

    createBackup: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        includeFiles: z.boolean().default(false),
        includeLogs: z.boolean().default(false)
    }),

    updateService: z.object({
        action: z.enum(['START', 'STOP', 'RESTART', 'RELOAD']),
        force: z.boolean().default(false)
    }),

    createAuditLog: z.object({
        action: z.string().min(1),
        resource: z.string().min(1),
        resourceId: z.string().optional(),
        userId: z.string().min(1),
        metadata: z.record(z.any()).optional()
    })
};

// ADMIN Service specific paths for OpenAPI
const adminServicePaths: OpenAPIV3.PathsObject = {
    '/users': {
        get: {
            tags: ['User Management'],
            summary: 'List users',
            description: 'Retrieve all users with filtering options',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'role',
                    in: 'query',
                    description: 'Filter by user role',
                    schema: {
                        type: 'string',
                        enum: ['USER', 'ADMIN', 'SUPER_ADMIN']
                    }
                },
                {
                    name: 'isActive',
                    in: 'query',
                    description: 'Filter by active status',
                    schema: { type: 'boolean' }
                },
                {
                    name: 'search',
                    in: 'query',
                    description: 'Search in user name or email',
                    schema: { type: 'string' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of users to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
                },
                {
                    name: 'offset',
                    in: 'query',
                    description: 'Number of users to skip',
                    schema: { type: 'integer', minimum: 0, default: 0 }
                }
            ],
            responses: {
                '200': {
                    description: 'List of users',
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
                                                    users: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/User' }
                                                    },
                                                    total: { type: 'integer' },
                                                    offset: { type: 'integer' },
                                                    limit: { type: 'integer' }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' }
            }
        },
        post: {
            tags: ['User Management'],
            summary: 'Create user',
            description: 'Create a new user account',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateUserRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'User created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/User' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '400': { $ref: '#/components/responses/BadRequest' },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    },
    '/users/{id}': {
        get: {
            tags: ['User Management'],
            summary: 'Get user details',
            description: 'Get detailed information about a specific user',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'User ID',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'User details',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/User' }
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
            tags: ['User Management'],
            summary: 'Update user',
            description: 'Update an existing user account',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'User ID',
                    schema: { type: 'string' }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateUserRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'User updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/User' }
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
            tags: ['User Management'],
            summary: 'Delete user',
            description: 'Delete a user account',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'User ID',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'User deleted successfully',
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
    '/system/config': {
        get: {
            tags: ['System Management'],
            summary: 'Get system configuration',
            description: 'Retrieve system configuration settings',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'System configuration',
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
                                                    config: { type: 'object' }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' }
            }
        },
        put: {
            tags: ['System Management'],
            summary: 'Update system configuration',
            description: 'Update system configuration settings',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateSystemConfigRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Configuration updated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CodaiResponse' }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    },
    '/system/services': {
        get: {
            tags: ['System Management'],
            summary: 'List system services',
            description: 'Get status of all system services',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'System services status',
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
                                                    services: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/SystemService' }
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
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' }
            }
        }
    },
    '/system/services/{name}': {
        post: {
            tags: ['System Management'],
            summary: 'Control service',
            description: 'Start, stop, restart, or reload a system service',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'name',
                    in: 'path',
                    required: true,
                    description: 'Service name',
                    schema: { type: 'string' }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateServiceRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Service action completed',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/SystemService' }
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
        }
    },
    '/system/backups': {
        get: {
            tags: ['System Management'],
            summary: 'List backups',
            description: 'Get all system backups',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'List of backups',
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
                                                    backups: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Backup' }
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
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' }
            }
        },
        post: {
            tags: ['System Management'],
            summary: 'Create backup',
            description: 'Create a new system backup',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateBackupRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Backup created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Backup' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    },
    '/audit-logs': {
        get: {
            tags: ['Audit'],
            summary: 'List audit logs',
            description: 'Retrieve system audit logs',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'action',
                    in: 'query',
                    description: 'Filter by action',
                    schema: { type: 'string' }
                },
                {
                    name: 'resource',
                    in: 'query',
                    description: 'Filter by resource',
                    schema: { type: 'string' }
                },
                {
                    name: 'userId',
                    in: 'query',
                    description: 'Filter by user ID',
                    schema: { type: 'string' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of logs to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 }
                }
            ],
            responses: {
                '200': {
                    description: 'Audit logs',
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
                                                    auditLogs: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/AuditLog' }
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
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' }
            }
        },
        post: {
            tags: ['Audit'],
            summary: 'Create audit log',
            description: 'Create a new audit log entry',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateAuditLogRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Audit log created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/AuditLog' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '403': { $ref: '#/components/responses/Forbidden' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    }
};

// ADMIN Service specific schemas
const adminServiceSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    User: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'User ID'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'User email address'
            },
            name: {
                type: 'string',
                description: 'User full name'
            },
            role: {
                type: 'string',
                enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
                description: 'User role'
            },
            isActive: {
                type: 'boolean',
                description: 'User active status'
            },
            permissions: {
                type: 'array',
                items: { type: 'string' },
                description: 'User permissions'
            },
            metadata: {
                type: 'object',
                description: 'Additional user metadata'
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
            },
            lastLoginAt: {
                type: 'string',
                format: 'date-time',
                description: 'Last login timestamp'
            }
        },
        required: ['id', 'email', 'name', 'role', 'isActive', 'createdAt']
    },
    CreateUserRequest: {
        type: 'object',
        properties: {
            email: {
                type: 'string',
                format: 'email',
                description: 'User email address'
            },
            name: {
                type: 'string',
                minLength: 1,
                description: 'User full name'
            },
            role: {
                type: 'string',
                enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
                default: 'USER',
                description: 'User role'
            },
            isActive: {
                type: 'boolean',
                default: true,
                description: 'User active status'
            },
            permissions: {
                type: 'array',
                items: { type: 'string' },
                description: 'User permissions'
            },
            metadata: {
                type: 'object',
                description: 'Additional user metadata'
            }
        },
        required: ['email', 'name']
    },
    UpdateUserRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                description: 'User full name'
            },
            role: {
                type: 'string',
                enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
                description: 'User role'
            },
            isActive: {
                type: 'boolean',
                description: 'User active status'
            },
            permissions: {
                type: 'array',
                items: { type: 'string' },
                description: 'User permissions'
            },
            metadata: {
                type: 'object',
                description: 'Additional user metadata'
            }
        }
    },
    SystemService: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'Service name'
            },
            status: {
                type: 'string',
                enum: ['RUNNING', 'STOPPED', 'STARTING', 'STOPPING', 'ERROR'],
                description: 'Service status'
            },
            port: {
                type: 'integer',
                description: 'Service port'
            },
            uptime: {
                type: 'number',
                description: 'Service uptime in seconds'
            },
            cpu: {
                type: 'number',
                description: 'CPU usage percentage'
            },
            memory: {
                type: 'number',
                description: 'Memory usage in MB'
            },
            lastRestart: {
                type: 'string',
                format: 'date-time',
                description: 'Last restart timestamp'
            }
        },
        required: ['name', 'status']
    },
    UpdateSystemConfigRequest: {
        type: 'object',
        properties: {
            section: {
                type: 'string',
                minLength: 1,
                description: 'Configuration section'
            },
            config: {
                type: 'object',
                description: 'Configuration object'
            }
        },
        required: ['section', 'config']
    },
    UpdateServiceRequest: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['START', 'STOP', 'RESTART', 'RELOAD'],
                description: 'Service action'
            },
            force: {
                type: 'boolean',
                default: false,
                description: 'Force the action'
            }
        },
        required: ['action']
    },
    Backup: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'Backup ID'
            },
            name: {
                type: 'string',
                description: 'Backup name'
            },
            description: {
                type: 'string',
                description: 'Backup description'
            },
            size: {
                type: 'number',
                description: 'Backup size in bytes'
            },
            includeFiles: {
                type: 'boolean',
                description: 'Files included in backup'
            },
            includeLogs: {
                type: 'boolean',
                description: 'Logs included in backup'
            },
            status: {
                type: 'string',
                enum: ['CREATED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
                description: 'Backup status'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Creation timestamp'
            },
            completedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Completion timestamp'
            }
        },
        required: ['id', 'name', 'status', 'createdAt']
    },
    CreateBackupRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                description: 'Backup name'
            },
            description: {
                type: 'string',
                description: 'Backup description'
            },
            includeFiles: {
                type: 'boolean',
                default: false,
                description: 'Include files in backup'
            },
            includeLogs: {
                type: 'boolean',
                default: false,
                description: 'Include logs in backup'
            }
        },
        required: ['name']
    },
    AuditLog: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'Audit log ID'
            },
            action: {
                type: 'string',
                description: 'Action performed'
            },
            resource: {
                type: 'string',
                description: 'Resource affected'
            },
            resourceId: {
                type: 'string',
                description: 'Resource ID'
            },
            userId: {
                type: 'string',
                description: 'User who performed the action'
            },
            metadata: {
                type: 'object',
                description: 'Additional audit metadata'
            },
            timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Action timestamp'
            }
        },
        required: ['id', 'action', 'resource', 'userId', 'timestamp']
    },
    CreateAuditLogRequest: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                minLength: 1,
                description: 'Action performed'
            },
            resource: {
                type: 'string',
                minLength: 1,
                description: 'Resource affected'
            },
            resourceId: {
                type: 'string',
                description: 'Resource ID'
            },
            userId: {
                type: 'string',
                minLength: 1,
                description: 'User who performed the action'
            },
            metadata: {
                type: 'object',
                description: 'Additional audit metadata'
            }
        },
        required: ['action', 'resource', 'userId']
    }
};

// Generate OpenAPI specification
const openApiSpec = generateServiceOpenApiSpec('ADMIN', adminServicePaths, { schemas: adminServiceSchemas });

// Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ADMIN Service API Documentation',
}));

// Authentication middleware for protected routes
const authMiddleware = jwtAuthMiddleware({
    jwtSecret: config.auth.jwtSecret,
    skipPaths: ['/health', '/ready', '/docs']
});

// API Routes - All routes require authentication
app.use('/api/v1', authMiddleware);

// User management endpoints
app.get('/api/v1/users',
    validate({ query: AdminSchemas.listUsers }),
    async (req, res) => {
        // Mock implementation
        const users = [
            {
                id: 'user-123e4567-e89b-12d3-a456-426614174000',
                email: 'admin@codai.ro',
                name: 'System Administrator',
                role: 'SUPER_ADMIN',
                isActive: true,
                permissions: ['*'],
                metadata: { department: 'Engineering' },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
            },
            {
                id: 'user-223e4567-e89b-12d3-a456-426614174001',
                email: 'user@codai.ro',
                name: 'Test User',
                role: 'USER',
                isActive: true,
                permissions: ['read:profile', 'write:profile'],
                metadata: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
            }
        ];

        const filteredUsers = users.filter(user => {
            if (req.query.role && user.role !== req.query.role) return false;
            if (req.query.isActive !== undefined && user.isActive !== (req.query.isActive === 'true')) return false;
            if (req.query.search) {
                const search = (req.query.search as string).toLowerCase();
                if (!user.name.toLowerCase().includes(search) && !user.email.toLowerCase().includes(search)) {
                    return false;
                }
            }
            return true;
        });

        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 20;

        const response = req.responseBuilder.success({
            users: filteredUsers.slice(offset, offset + limit),
            total: filteredUsers.length,
            offset,
            limit
        });

        res.json(response);
    }
);

app.post('/api/v1/users',
    validate({ body: AdminSchemas.createUser }),
    async (req, res) => {
        // Mock implementation
        const newUser = {
            id: 'user-' + Date.now(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: null
        };

        const response = req.responseBuilder.success(newUser);
        res.status(201).json(response);
    }
);

app.get('/api/v1/users/:id', async (req, res) => {
    // Mock implementation
    const user = {
        id: req.params.id,
        email: 'user@codai.ro',
        name: 'Test User',
        role: 'USER',
        isActive: true,
        permissions: ['read:profile', 'write:profile'],
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
    };

    const response = req.responseBuilder.success(user);
    res.json(response);
});

// System management endpoints
app.get('/api/v1/system/config', async (req, res) => {
    // Mock implementation
    const config = {
        auth: {
            jwtExpiry: '15m',
            refreshExpiry: '7d',
            maxLoginAttempts: 5
        },
        api: {
            rateLimit: 100,
            timeout: 30000
        },
        features: {
            userRegistration: true,
            emailVerification: true,
            passwordReset: true
        }
    };

    const response = req.responseBuilder.success({ config });
    res.json(response);
});

app.get('/api/v1/system/services', async (req, res) => {
    // Mock implementation
    const services = [
        {
            name: 'id',
            status: 'RUNNING',
            port: 4001,
            uptime: 86400,
            cpu: 15.2,
            memory: 128.5,
            lastRestart: new Date(Date.now() - 86400000).toISOString()
        },
        {
            name: 'memorai',
            status: 'RUNNING',
            port: 4002,
            uptime: 86400,
            cpu: 8.7,
            memory: 256.1,
            lastRestart: new Date(Date.now() - 86400000).toISOString()
        },
        {
            name: 'hub',
            status: 'RUNNING',
            port: 4003,
            uptime: 86400,
            cpu: 5.3,
            memory: 64.8,
            lastRestart: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    const response = req.responseBuilder.success({ services });
    res.json(response);
});

// Audit logs endpoints
app.get('/api/v1/audit-logs', async (req, res) => {
    // Mock implementation
    const auditLogs = [
        {
            id: 'audit-123e4567-e89b-12d3-a456-426614174000',
            action: 'USER_CREATED',
            resource: 'user',
            resourceId: 'user-123',
            userId: 'admin-456',
            metadata: { email: 'newuser@codai.ro' },
            timestamp: new Date().toISOString()
        },
        {
            id: 'audit-223e4567-e89b-12d3-a456-426614174001',
            action: 'SERVICE_RESTARTED',
            resource: 'service',
            resourceId: 'memorai',
            userId: 'admin-456',
            metadata: { reason: 'maintenance' },
            timestamp: new Date().toISOString()
        }
    ];

    const response = req.responseBuilder.success({
        auditLogs,
        total: auditLogs.length
    });

    res.json(response);
});

app.post('/api/v1/audit-logs',
    validate({ body: AdminSchemas.createAuditLog }),
    async (req, res) => {
        // Mock implementation
        const newAuditLog = {
            id: 'audit-' + Date.now(),
            ...req.body,
            timestamp: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newAuditLog);
        res.status(201).json(response);
    }
);

// Error handling
app.use(globalErrorHandler);
app.use(notFoundHandler);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`⚙️  ADMIN Service API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;
