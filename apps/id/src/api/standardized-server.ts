/**
 * ID Service API Implementation
 * Standardized authentication and user management API using CODAI standards
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
} from '@codai/api-standards';
import { OpenAPIV3 } from 'openapi-types';
import swaggerUi from 'swagger-ui-express';

const app = express();
const config = createStandardApiConfig('id', 4001);

// Setup universal CODAI middleware
setupCodaiMiddleware(app, config);

// ID Service specific paths for OpenAPI
const idServicePaths: OpenAPIV3.PathsObject = {
    '/users': {
        get: {
            tags: ['Users'],
            summary: 'List all users',
            description: 'Retrieve a paginated list of all users',
            security: [{ BearerAuth: [] }],
            parameters: [
                { $ref: '#/components/parameters/Page' },
                { $ref: '#/components/parameters/Limit' },
                {
                    name: 'search',
                    in: 'query',
                    description: 'Search users by name or email',
                    schema: { type: 'string' }
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
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/User' }
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
            tags: ['Users'],
            summary: 'Create new user',
            description: 'Create a new user account',
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
                '409': { $ref: '#/components/responses/Conflict' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    },
    '/users/{id}': {
        get: {
            tags: ['Users'],
            summary: 'Get user by ID',
            description: 'Retrieve a specific user by their ID',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'User ID',
                    schema: { type: 'string', format: 'uuid' }
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
                '404': { $ref: '#/components/responses/NotFound' }
            }
        },
        put: {
            tags: ['Users'],
            summary: 'Update user',
            description: 'Update user information',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'User ID',
                    schema: { type: 'string', format: 'uuid' }
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
            tags: ['Users'],
            summary: 'Delete user',
            description: 'Delete a user account',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'User ID',
                    schema: { type: 'string', format: 'uuid' }
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
    '/auth/login': {
        post: {
            tags: ['Authentication'],
            summary: 'User login',
            description: 'Authenticate user and return JWT token',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/LoginRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Login successful',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/AuthResponse' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    },
    '/auth/logout': {
        post: {
            tags: ['Authentication'],
            summary: 'User logout',
            description: 'Logout user and invalidate token',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Logout successful',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CodaiResponse' }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' }
            }
        }
    },
    '/auth/validate': {
        post: {
            tags: ['Authentication'],
            summary: 'Validate JWT token',
            description: 'Validate JWT token and return user information',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Token is valid',
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
                '401': { $ref: '#/components/responses/Unauthorized' }
            }
        }
    }
};

// ID Service specific schemas
const idServiceSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    User: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'Unique user identifier'
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
            roles: {
                type: 'array',
                items: { type: 'string' },
                description: 'User roles'
            },
            status: {
                type: 'string',
                enum: ['active', 'inactive', 'pending'],
                description: 'User account status'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Account creation timestamp'
            },
            lastLoginAt: {
                type: 'string',
                format: 'date-time',
                description: 'Last login timestamp'
            }
        },
        required: ['id', 'email', 'name', 'roles', 'status', 'createdAt']
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
                maxLength: 100,
                description: 'User full name'
            },
            password: {
                type: 'string',
                minLength: 8,
                maxLength: 100,
                description: 'User password'
            },
            roles: {
                type: 'array',
                items: { type: 'string' },
                description: 'User roles (optional)'
            }
        },
        required: ['email', 'name', 'password']
    },
    UpdateUserRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'User full name'
            },
            roles: {
                type: 'array',
                items: { type: 'string' },
                description: 'User roles'
            },
            status: {
                type: 'string',
                enum: ['active', 'inactive'],
                description: 'User account status'
            }
        }
    },
    LoginRequest: {
        type: 'object',
        properties: {
            email: {
                type: 'string',
                format: 'email',
                description: 'User email address'
            },
            password: {
                type: 'string',
                minLength: 1,
                description: 'User password'
            }
        },
        required: ['email', 'password']
    },
    AuthResponse: {
        type: 'object',
        properties: {
            token: {
                type: 'string',
                description: 'JWT access token'
            },
            refreshToken: {
                type: 'string',
                description: 'JWT refresh token'
            },
            expiresIn: {
                type: 'number',
                description: 'Token expiration time in seconds'
            },
            user: {
                $ref: '#/components/schemas/User'
            }
        },
        required: ['token', 'refreshToken', 'expiresIn', 'user']
    }
};

// Generate OpenAPI specification
const openApiSpec = generateServiceOpenApiSpec('ID', idServicePaths, { schemas: idServiceSchemas });

// Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ID Service API Documentation',
}));

// Authentication middleware for protected routes
const authMiddleware = jwtAuthMiddleware({
    jwtSecret: config.auth.jwtSecret,
    skipPaths: ['/health', '/ready', '/docs', '/auth/login', '/auth/register']
});

// API Routes
app.use('/api/v1', authMiddleware);

// Users endpoints
app.get('/api/v1/users',
    validate({ query: CodaiValidationSchemas.paginatedQuery }),
    async (req, res) => {
        // Mock implementation for now
        const users = [
            {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'user@codai.ro',
                name: 'Test User',
                roles: ['user'],
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
            }
        ];

        const response = req.responseBuilder.success({
            users,
            pagination: {
                page: req.query.page,
                limit: req.query.limit,
                total: 1,
                pages: 1,
                hasNext: false,
                hasPrev: false
            }
        });

        res.json(response);
    }
);

app.post('/api/v1/users',
    validate({ body: CodaiValidationSchemas.createUser }),
    async (req, res) => {
        // Mock implementation
        const newUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: req.body.email,
            name: req.body.name,
            roles: req.body.roles || ['user'],
            status: 'active',
            createdAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newUser);
        res.status(201).json(response);
    }
);

app.get('/api/v1/users/:id',
    validate({ params: CodaiValidationSchemas.uuidParam }),
    async (req, res) => {
        // Mock implementation
        const user = {
            id: req.params.id,
            email: 'user@codai.ro',
            name: 'Test User',
            roles: ['user'],
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(user);
        res.json(response);
    }
);

// Authentication endpoints
app.post('/api/v1/auth/login',
    validate({ body: CodaiValidationSchemas.login }),
    async (req, res) => {
        // Mock implementation
        const authResponse = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            expiresIn: 900, // 15 minutes
            user: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: req.body.email,
                name: 'Test User',
                roles: ['user'],
                status: 'active',
                createdAt: new Date().toISOString()
            }
        };

        const response = req.responseBuilder.success(authResponse);
        res.json(response);
    }
);

app.post('/api/v1/auth/logout', async (req, res) => {
    const response = req.responseBuilder.success({ message: 'Logout successful' });
    res.json(response);
});

app.post('/api/v1/auth/validate', async (req, res) => {
    const response = req.responseBuilder.success(req.user);
    res.json(response);
});

// Error handling
app.use(globalErrorHandler);
app.use(notFoundHandler);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🆔 ID Service API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;
