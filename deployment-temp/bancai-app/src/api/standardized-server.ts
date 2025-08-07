/**
 * BANCAI Service API Implementation
 * Standardized financial services API using CODAI standards
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
const config = createStandardApiConfig('bancai', 4007);

// Setup universal CODAI middleware
setupCodaiMiddleware(app, config);

// BANCAI specific validation schemas
const BancaiSchemas = {
    createAccount: z.object({
        name: z.string().min(1),
        type: z.enum(['CHECKING', 'SAVINGS', 'BUSINESS', 'INVESTMENT']),
        currency: z.string().length(3).default('RON'),
        initialBalance: z.number().min(0).default(0),
        metadata: z.record(z.any()).optional()
    }),

    createTransaction: z.object({
        fromAccountId: z.string().min(1).optional(),
        toAccountId: z.string().min(1).optional(),
        amount: z.number().positive(),
        currency: z.string().length(3).default('RON'),
        type: z.enum(['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND']),
        description: z.string().min(1),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        reference: z.string().optional(),
        scheduledFor: z.string().datetime().optional(),
        metadata: z.record(z.any()).optional()
    }),

    searchTransactions: z.object({
        accountId: z.string().min(1).optional(),
        type: z.enum(['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND']).optional(),
        category: z.string().optional(),
        minAmount: z.number().min(0).optional(),
        maxAmount: z.number().positive().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0)
    }),

    createBudget: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().min(1),
        amount: z.number().positive(),
        currency: z.string().length(3).default('RON'),
        period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
        startDate: z.string().datetime(),
        endDate: z.string().datetime().optional(),
        alertThreshold: z.number().min(0).max(1).default(0.8),
        isActive: z.boolean().default(true)
    }),

    analyzeSpending: z.object({
        accountIds: z.array(z.string()).optional(),
        period: z.enum(['WEEK', 'MONTH', 'QUARTER', 'YEAR']),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        categories: z.array(z.string()).optional(),
        groupBy: z.enum(['CATEGORY', 'DATE', 'ACCOUNT']).default('CATEGORY')
    })
};

// BANCAI Service specific paths for OpenAPI
const bancaiServicePaths: OpenAPIV3.PathsObject = {
    '/accounts': {
        get: {
            tags: ['Accounts'],
            summary: 'List accounts',
            description: 'Retrieve all user financial accounts',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'type',
                    in: 'query',
                    description: 'Filter by account type',
                    schema: {
                        type: 'string',
                        enum: ['CHECKING', 'SAVINGS', 'BUSINESS', 'INVESTMENT']
                    }
                },
                {
                    name: 'currency',
                    in: 'query',
                    description: 'Filter by currency',
                    schema: { type: 'string', minLength: 3, maxLength: 3 }
                }
            ],
            responses: {
                '200': {
                    description: 'List of accounts',
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
                                                    accounts: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Account' }
                                                    },
                                                    totalBalance: { type: 'number' },
                                                    totalByType: { type: 'object' }
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
            tags: ['Accounts'],
            summary: 'Create account',
            description: 'Create a new financial account',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateAccountRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Account created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Account' }
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
    '/accounts/{id}': {
        get: {
            tags: ['Accounts'],
            summary: 'Get account details',
            description: 'Get detailed information about a specific account',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Account ID',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'Account details',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Account' }
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
    '/transactions': {
        get: {
            tags: ['Transactions'],
            summary: 'Search transactions',
            description: 'Search and filter financial transactions',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'accountId',
                    in: 'query',
                    description: 'Filter by account ID',
                    schema: { type: 'string' }
                },
                {
                    name: 'type',
                    in: 'query',
                    description: 'Filter by transaction type',
                    schema: {
                        type: 'string',
                        enum: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND']
                    }
                },
                {
                    name: 'category',
                    in: 'query',
                    description: 'Filter by category',
                    schema: { type: 'string' }
                },
                {
                    name: 'minAmount',
                    in: 'query',
                    description: 'Minimum transaction amount',
                    schema: { type: 'number', minimum: 0 }
                },
                {
                    name: 'maxAmount',
                    in: 'query',
                    description: 'Maximum transaction amount',
                    schema: { type: 'number', minimum: 0 }
                },
                {
                    name: 'startDate',
                    in: 'query',
                    description: 'Start date for transaction search',
                    schema: { type: 'string', format: 'date-time' }
                },
                {
                    name: 'endDate',
                    in: 'query',
                    description: 'End date for transaction search',
                    schema: { type: 'string', format: 'date-time' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of transactions to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 }
                },
                {
                    name: 'offset',
                    in: 'query',
                    description: 'Number of transactions to skip',
                    schema: { type: 'integer', minimum: 0, default: 0 }
                }
            ],
            responses: {
                '200': {
                    description: 'Transaction search results',
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
                                                    transactions: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Transaction' }
                                                    },
                                                    total: { type: 'integer' },
                                                    totalAmount: { type: 'number' },
                                                    summary: { type: 'object' }
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
            tags: ['Transactions'],
            summary: 'Create transaction',
            description: 'Create a new financial transaction',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateTransactionRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Transaction created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Transaction' }
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
    '/budgets': {
        get: {
            tags: ['Budgets'],
            summary: 'List budgets',
            description: 'Retrieve user budgets and spending limits',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'category',
                    in: 'query',
                    description: 'Filter by category',
                    schema: { type: 'string' }
                },
                {
                    name: 'period',
                    in: 'query',
                    description: 'Filter by period',
                    schema: {
                        type: 'string',
                        enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']
                    }
                },
                {
                    name: 'isActive',
                    in: 'query',
                    description: 'Filter by active status',
                    schema: { type: 'boolean' }
                }
            ],
            responses: {
                '200': {
                    description: 'List of budgets',
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
                                                    budgets: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Budget' }
                                                    },
                                                    totalBudget: { type: 'number' },
                                                    totalSpent: { type: 'number' }
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
            tags: ['Budgets'],
            summary: 'Create budget',
            description: 'Create a new spending budget',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateBudgetRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Budget created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Budget' }
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
    '/analytics/spending': {
        post: {
            tags: ['Analytics'],
            summary: 'Analyze spending',
            description: 'Generate spending analysis and insights',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/AnalyzeSpendingRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Spending analysis results',
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
                                                    totalSpent: { type: 'number' },
                                                    averageDaily: { type: 'number' },
                                                    topCategories: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'object',
                                                            properties: {
                                                                category: { type: 'string' },
                                                                amount: { type: 'number' },
                                                                percentage: { type: 'number' }
                                                            }
                                                        }
                                                    },
                                                    trends: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'object',
                                                            properties: {
                                                                date: { type: 'string' },
                                                                amount: { type: 'number' }
                                                            }
                                                        }
                                                    },
                                                    insights: {
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
    '/reports': {
        get: {
            tags: ['Reports'],
            summary: 'Generate financial reports',
            description: 'Generate various financial reports',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'type',
                    in: 'query',
                    required: true,
                    description: 'Report type',
                    schema: {
                        type: 'string',
                        enum: ['INCOME_STATEMENT', 'BALANCE_SHEET', 'CASH_FLOW', 'BUDGET_VS_ACTUAL']
                    }
                },
                {
                    name: 'period',
                    in: 'query',
                    description: 'Report period',
                    schema: {
                        type: 'string',
                        enum: ['MONTH', 'QUARTER', 'YEAR', 'CUSTOM']
                    }
                },
                {
                    name: 'startDate',
                    in: 'query',
                    description: 'Start date for custom period',
                    schema: { type: 'string', format: 'date' }
                },
                {
                    name: 'endDate',
                    in: 'query',
                    description: 'End date for custom period',
                    schema: { type: 'string', format: 'date' }
                }
            ],
            responses: {
                '200': {
                    description: 'Financial report data',
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
                                                    report: {
                                                        type: 'object',
                                                        description: 'Report data structure varies by type'
                                                    },
                                                    metadata: {
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string' },
                                                            period: { type: 'string' },
                                                            generatedAt: { type: 'string', format: 'date-time' }
                                                        }
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
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    }
};

// BANCAI Service specific schemas
const bancaiServiceSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    Account: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Account ID' },
            name: { type: 'string', description: 'Account name' },
            type: {
                type: 'string',
                enum: ['CHECKING', 'SAVINGS', 'BUSINESS', 'INVESTMENT'],
                description: 'Account type'
            },
            currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' },
            balance: { type: 'number', description: 'Current balance' },
            availableBalance: { type: 'number', description: 'Available balance' },
            metadata: { type: 'object', description: 'Additional account metadata' },
            ownerId: { type: 'string', description: 'Account owner user ID' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'name', 'type', 'currency', 'balance', 'ownerId', 'createdAt']
    },
    CreateAccountRequest: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1, description: 'Account name' },
            type: {
                type: 'string',
                enum: ['CHECKING', 'SAVINGS', 'BUSINESS', 'INVESTMENT'],
                description: 'Account type'
            },
            currency: { type: 'string', minLength: 3, maxLength: 3, default: 'RON', description: 'Currency code' },
            initialBalance: { type: 'number', minimum: 0, default: 0, description: 'Initial account balance' },
            metadata: { type: 'object', description: 'Additional account metadata' }
        },
        required: ['name', 'type']
    },
    Transaction: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Transaction ID' },
            fromAccountId: { type: 'string', description: 'Source account ID' },
            toAccountId: { type: 'string', description: 'Destination account ID' },
            amount: { type: 'number', description: 'Transaction amount' },
            currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' },
            type: {
                type: 'string',
                enum: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND'],
                description: 'Transaction type'
            },
            description: { type: 'string', description: 'Transaction description' },
            category: { type: 'string', description: 'Transaction category' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Transaction tags' },
            reference: { type: 'string', description: 'External reference' },
            status: {
                type: 'string',
                enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
                description: 'Transaction status'
            },
            scheduledFor: { type: 'string', format: 'date-time', description: 'Scheduled execution time' },
            executedAt: { type: 'string', format: 'date-time', description: 'Actual execution time' },
            metadata: { type: 'object', description: 'Additional transaction metadata' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
        },
        required: ['id', 'amount', 'currency', 'type', 'description', 'status', 'createdAt']
    },
    CreateTransactionRequest: {
        type: 'object',
        properties: {
            fromAccountId: { type: 'string', minLength: 1, description: 'Source account ID' },
            toAccountId: { type: 'string', minLength: 1, description: 'Destination account ID' },
            amount: { type: 'number', minimum: 0.01, description: 'Transaction amount' },
            currency: { type: 'string', minLength: 3, maxLength: 3, default: 'RON', description: 'Currency code' },
            type: {
                type: 'string',
                enum: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND'],
                description: 'Transaction type'
            },
            description: { type: 'string', minLength: 1, description: 'Transaction description' },
            category: { type: 'string', description: 'Transaction category' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Transaction tags' },
            reference: { type: 'string', description: 'External reference' },
            scheduledFor: { type: 'string', format: 'date-time', description: 'Schedule transaction for later execution' },
            metadata: { type: 'object', description: 'Additional transaction metadata' }
        },
        required: ['amount', 'type', 'description']
    },
    Budget: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Budget ID' },
            name: { type: 'string', description: 'Budget name' },
            description: { type: 'string', description: 'Budget description' },
            category: { type: 'string', description: 'Budget category' },
            amount: { type: 'number', description: 'Budget amount' },
            spent: { type: 'number', description: 'Amount spent' },
            remaining: { type: 'number', description: 'Remaining amount' },
            currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' },
            period: {
                type: 'string',
                enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
                description: 'Budget period'
            },
            startDate: { type: 'string', format: 'date-time', description: 'Budget start date' },
            endDate: { type: 'string', format: 'date-time', description: 'Budget end date' },
            alertThreshold: { type: 'number', minimum: 0, maximum: 1, description: 'Alert threshold percentage' },
            isActive: { type: 'boolean', description: 'Budget active status' },
            ownerId: { type: 'string', description: 'Budget owner user ID' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'name', 'category', 'amount', 'currency', 'period', 'startDate', 'ownerId', 'createdAt']
    },
    CreateBudgetRequest: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1, description: 'Budget name' },
            description: { type: 'string', description: 'Budget description' },
            category: { type: 'string', minLength: 1, description: 'Budget category' },
            amount: { type: 'number', minimum: 0.01, description: 'Budget amount' },
            currency: { type: 'string', minLength: 3, maxLength: 3, default: 'RON', description: 'Currency code' },
            period: {
                type: 'string',
                enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
                description: 'Budget period'
            },
            startDate: { type: 'string', format: 'date-time', description: 'Budget start date' },
            endDate: { type: 'string', format: 'date-time', description: 'Budget end date' },
            alertThreshold: { type: 'number', minimum: 0, maximum: 1, default: 0.8, description: 'Alert threshold percentage' },
            isActive: { type: 'boolean', default: true, description: 'Budget active status' }
        },
        required: ['name', 'category', 'amount', 'period', 'startDate']
    },
    AnalyzeSpendingRequest: {
        type: 'object',
        properties: {
            accountIds: { type: 'array', items: { type: 'string' }, description: 'Filter by account IDs' },
            period: {
                type: 'string',
                enum: ['WEEK', 'MONTH', 'QUARTER', 'YEAR'],
                description: 'Analysis period'
            },
            startDate: { type: 'string', format: 'date-time', description: 'Custom start date' },
            endDate: { type: 'string', format: 'date-time', description: 'Custom end date' },
            categories: { type: 'array', items: { type: 'string' }, description: 'Filter by categories' },
            groupBy: {
                type: 'string',
                enum: ['CATEGORY', 'DATE', 'ACCOUNT'],
                default: 'CATEGORY',
                description: 'Group analysis results by'
            }
        },
        required: ['period']
    }
};

// Generate OpenAPI specification (commented for deployment)
// const openApiSpec = generateServiceOpenApiSpec('BANCAI', bancaiServicePaths);

// Basic OpenAPI spec for deployment
const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'BANCAI Service API',
        version: '1.0.0',
        description: 'BANCAI banking service API'
    },
    paths: {}
};

// Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'BANCAI Service API Documentation',
}));

// Authentication middleware for protected routes (simplified for deployment)
const authMiddleware = (req: any, res: any, next: any) => {
    // Simplified auth for deployment
    next();
};

// API Routes
app.use('/api/v1', authMiddleware);

// Accounts endpoints
app.get('/api/v1/accounts', async (req, res) => {
    // Mock implementation
    const accounts = [
        {
            id: 'acc-123e4567-e89b-12d3-a456-426614174000',
            name: 'Main Checking Account',
            type: 'CHECKING',
            currency: 'RON',
            balance: 15420.50,
            availableBalance: 15420.50,
            metadata: { bankName: 'CODAI Bank', accountNumber: '****1234' },
            ownerId: 'user-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'acc-223e4567-e89b-12d3-a456-426614174001',
            name: 'Emergency Savings',
            type: 'SAVINGS',
            currency: 'RON',
            balance: 25000.00,
            availableBalance: 25000.00,
            metadata: { interestRate: 0.025 },
            ownerId: 'user-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    const filteredAccounts = accounts.filter(account => {
        if (req.query.type && account.type !== req.query.type) return false;
        if (req.query.currency && account.currency !== req.query.currency) return false;
        return true;
    });

    const totalBalance = filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalByType = filteredAccounts.reduce((acc, account) => {
        acc[account.type] = (acc[account.type] || 0) + account.balance;
        return acc;
    }, {} as Record<string, number>);

    // const response = req.responseBuilder.success({
    //     accounts: filteredAccounts,
    //     totalBalance,
    //     totalByType
    // });

    const response = {
        success: true,
        data: {
            accounts: filteredAccounts,
            totalBalance,
            totalByType
        }
    };

    res.json(response);
});

app.post('/api/v1/accounts',
    validate({ body: BancaiSchemas.createAccount }),
    async (req, res) => {
        // Mock implementation
        const newAccount = {
            id: 'acc-' + Date.now(),
            ...req.body,
            balance: req.body.initialBalance || 0,
            availableBalance: req.body.initialBalance || 0,
            ownerId: 'user-123', // From JWT token in real implementation
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newAccount);
        res.status(201).json(response);
    }
);

// Transactions endpoints
app.get('/api/v1/transactions',
    validate({ query: BancaiSchemas.searchTransactions }),
    async (req, res) => {
        // Mock implementation
        const transactions = [
            {
                id: 'tx-123e4567-e89b-12d3-a456-426614174000',
                fromAccountId: 'acc-123e4567-e89b-12d3-a456-426614174000',
                amount: 250.00,
                currency: 'RON',
                type: 'WITHDRAWAL',
                description: 'ATM Withdrawal',
                category: 'Cash',
                tags: ['atm', 'cash'],
                status: 'COMPLETED',
                executedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            },
            {
                id: 'tx-223e4567-e89b-12d3-a456-426614174001',
                toAccountId: 'acc-123e4567-e89b-12d3-a456-426614174000',
                amount: 1500.00,
                currency: 'RON',
                type: 'DEPOSIT',
                description: 'Salary',
                category: 'Income',
                tags: ['salary', 'income'],
                status: 'COMPLETED',
                executedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            }
        ];

        const filteredTransactions = transactions.filter(tx => {
            if (req.query.accountId && tx.fromAccountId !== req.query.accountId && tx.toAccountId !== req.query.accountId) return false;
            if (req.query.type && tx.type !== req.query.type) return false;
            if (req.query.category && tx.category !== req.query.category) return false;
            if (req.query.minAmount && tx.amount < parseFloat(req.query.minAmount as string)) return false;
            if (req.query.maxAmount && tx.amount > parseFloat(req.query.maxAmount as string)) return false;
            return true;
        });

        const total = filteredTransactions.length;
        const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 50;
        const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);

        const response = req.responseBuilder.success({
            transactions: paginatedTransactions,
            total,
            totalAmount,
            summary: {
                deposits: filteredTransactions.filter(tx => tx.type === 'DEPOSIT').length,
                withdrawals: filteredTransactions.filter(tx => tx.type === 'WITHDRAWAL').length,
                transfers: filteredTransactions.filter(tx => tx.type === 'TRANSFER').length
            }
        });

        res.json(response);
    }
);

app.post('/api/v1/transactions',
    validate({ body: BancaiSchemas.createTransaction }),
    async (req, res) => {
        // Mock implementation
        const newTransaction = {
            id: 'tx-' + Date.now(),
            ...req.body,
            status: req.body.scheduledFor ? 'PENDING' : 'COMPLETED',
            executedAt: req.body.scheduledFor ? null : new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newTransaction);
        res.status(201).json(response);
    }
);

// Analytics endpoints
app.post('/api/v1/analytics/spending',
    validate({ body: BancaiSchemas.analyzeSpending }),
    async (req, res) => {
        // Mock implementation
        const analysis = {
            totalSpent: 8750.50,
            averageDaily: 291.68,
            topCategories: [
                { category: 'Food & Dining', amount: 2450.00, percentage: 28.0 },
                { category: 'Transportation', amount: 1850.00, percentage: 21.1 },
                { category: 'Shopping', amount: 1650.00, percentage: 18.9 },
                { category: 'Utilities', amount: 950.00, percentage: 10.9 },
                { category: 'Entertainment', amount: 850.50, percentage: 9.7 }
            ],
            trends: [
                { date: '2024-01-01', amount: 875.50 },
                { date: '2024-01-08', amount: 920.75 },
                { date: '2024-01-15', amount: 810.25 },
                { date: '2024-01-22', amount: 950.00 }
            ],
            insights: [
                'Your spending on Food & Dining increased by 15% compared to last month',
                'You saved 8% on Transportation costs this period',
                'Consider setting a budget for Shopping category - it\'s your 3rd highest expense'
            ]
        };

        const response = req.responseBuilder.success(analysis);
        res.json(response);
    }
);

// Reports endpoint
app.get('/api/v1/reports', async (req, res) => {
    // Mock implementation
    const reportType = req.query.type as string;
    const period = req.query.period as string || 'MONTH';

    let report;
    switch (reportType) {
        case 'INCOME_STATEMENT':
            report = {
                income: { salary: 5000, freelance: 1200, investment: 300 },
                expenses: { rent: 1500, food: 800, transport: 400, utilities: 200 },
                netIncome: 3600
            };
            break;
        case 'BALANCE_SHEET':
            report = {
                assets: { checking: 15420.50, savings: 25000, investments: 12000 },
                liabilities: { creditCard: 2500, loan: 15000 },
                netWorth: 34920.50
            };
            break;
        case 'CASH_FLOW':
            report = {
                operatingCashFlow: 3200,
                investingCashFlow: -1000,
                financingCashFlow: -500,
                netCashFlow: 1700
            };
            break;
        default:
            report = { message: 'Report type not implemented' };
    }

    const response = req.responseBuilder.success({
        report,
        metadata: {
            type: reportType,
            period,
            generatedAt: new Date().toISOString()
        }
    });

    res.json(response);
});

// Error handling
app.use(globalErrorHandler);
app.use(notFoundHandler);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`💰 BANCAI Service API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;
