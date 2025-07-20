/**
 * WALLET Service API Implementation
 * Standardized payment and financial services API using CODAI standards
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
import { z } from 'zod';

const app = express();
const config = createStandardApiConfig('wallet', 4009);

// Setup universal CODAI middleware
setupCodaiMiddleware(app, config);

// WALLET specific validation schemas
const WalletSchemas = {
    createWallet: z.object({
        name: z.string().min(1),
        currency: z.string().length(3).default('RON'),
        type: z.enum(['PERSONAL', 'BUSINESS', 'SAVINGS', 'INVESTMENT']).default('PERSONAL'),
        description: z.string().optional(),
        initialBalance: z.number().min(0).default(0),
        metadata: z.record(z.any()).optional()
    }),

    updateWallet: z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(['ACTIVE', 'FROZEN', 'CLOSED']).optional(),
        metadata: z.record(z.any()).optional()
    }),

    createTransaction: z.object({
        fromWalletId: z.string().optional(),
        toWalletId: z.string().optional(),
        amount: z.number().positive(),
        currency: z.string().length(3).default('RON'),
        type: z.enum(['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND']),
        category: z.string().optional(),
        description: z.string().min(1),
        reference: z.string().optional(),
        metadata: z.record(z.any()).optional()
    }),

    searchTransactions: z.object({
        walletId: z.string().optional(),
        type: z.enum(['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND']).optional(),
        category: z.string().optional(),
        status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
        minAmount: z.number().min(0).optional(),
        maxAmount: z.number().positive().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        sortBy: z.enum(['amount', 'date', 'type', 'status']).default('date'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        offset: z.coerce.number().int().min(0).default(0)
    }),

    createPaymentMethod: z.object({
        type: z.enum(['CARD', 'BANK_ACCOUNT', 'PAYPAL', 'CRYPTO']),
        name: z.string().min(1),
        details: z.object({
            cardNumber: z.string().optional(),
            expiryMonth: z.number().int().min(1).max(12).optional(),
            expiryYear: z.number().int().optional(),
            accountNumber: z.string().optional(),
            routingNumber: z.string().optional(),
            paypalEmail: z.string().email().optional(),
            cryptoAddress: z.string().optional(),
            cryptoNetwork: z.string().optional()
        }),
        isDefault: z.boolean().default(false),
        metadata: z.record(z.any()).optional()
    }),

    processPayment: z.object({
        paymentMethodId: z.string().min(1),
        amount: z.number().positive(),
        currency: z.string().length(3).default('RON'),
        description: z.string().min(1),
        merchantId: z.string().optional(),
        reference: z.string().optional(),
        metadata: z.record(z.any()).optional()
    })
};

// WALLET Service specific paths for OpenAPI
const walletServicePaths: OpenAPIV3.PathsObject = {
    '/wallets': {
        get: {
            tags: ['Wallets'],
            summary: 'List user wallets',
            description: 'Retrieve all wallets for the authenticated user',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'type',
                    in: 'query',
                    description: 'Filter by wallet type',
                    schema: {
                        type: 'string',
                        enum: ['PERSONAL', 'BUSINESS', 'SAVINGS', 'INVESTMENT']
                    }
                },
                {
                    name: 'currency',
                    in: 'query',
                    description: 'Filter by currency',
                    schema: { type: 'string', minLength: 3, maxLength: 3 }
                },
                {
                    name: 'status',
                    in: 'query',
                    description: 'Filter by wallet status',
                    schema: {
                        type: 'string',
                        enum: ['ACTIVE', 'FROZEN', 'CLOSED']
                    }
                }
            ],
            responses: {
                '200': {
                    description: 'List of wallets',
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
                                                    wallets: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Wallet' }
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
            tags: ['Wallets'],
            summary: 'Create wallet',
            description: 'Create a new wallet for the user',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateWalletRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Wallet created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Wallet' }
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
    '/transactions': {
        get: {
            tags: ['Transactions'],
            summary: 'Search transactions',
            description: 'Search and filter user transactions',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'walletId',
                    in: 'query',
                    description: 'Filter by wallet ID',
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
                    name: 'status',
                    in: 'query',
                    description: 'Filter by transaction status',
                    schema: {
                        type: 'string',
                        enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']
                    }
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
                    description: 'Filter from date (ISO string)',
                    schema: { type: 'string', format: 'date-time' }
                },
                {
                    name: 'endDate',
                    in: 'query',
                    description: 'Filter to date (ISO string)',
                    schema: { type: 'string', format: 'date-time' }
                },
                {
                    name: 'sortBy',
                    in: 'query',
                    description: 'Sort transactions by field',
                    schema: { type: 'string', enum: ['amount', 'date', 'type', 'status'], default: 'date' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of transactions to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
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
                                                    summary: {
                                                        type: 'object',
                                                        properties: {
                                                            totalAmount: { type: 'number' },
                                                            averageAmount: { type: 'number' },
                                                            transactionCount: { type: 'integer' }
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
                '401': { $ref: '#/components/responses/Unauthorized' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    },
    '/payment-methods': {
        get: {
            tags: ['Payment Methods'],
            summary: 'List payment methods',
            description: 'Retrieve user payment methods',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'type',
                    in: 'query',
                    description: 'Filter by payment method type',
                    schema: {
                        type: 'string',
                        enum: ['CARD', 'BANK_ACCOUNT', 'PAYPAL', 'CRYPTO']
                    }
                }
            ],
            responses: {
                '200': {
                    description: 'List of payment methods',
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
                                                    paymentMethods: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/PaymentMethod' }
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
                '401': { $ref: '#/components/responses/Unauthorized' }
            }
        },
        post: {
            tags: ['Payment Methods'],
            summary: 'Add payment method',
            description: 'Add a new payment method for the user',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreatePaymentMethodRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Payment method added successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/PaymentMethod' }
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
    '/payments': {
        post: {
            tags: ['Payments'],
            summary: 'Process payment',
            description: 'Process a payment using a registered payment method',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ProcessPaymentRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Payment processed successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Payment' }
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

// WALLET Service specific schemas
const walletServiceSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    Wallet: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Wallet ID' },
            userId: { type: 'string', description: 'Owner user ID' },
            name: { type: 'string', description: 'Wallet name' },
            currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' },
            type: {
                type: 'string',
                enum: ['PERSONAL', 'BUSINESS', 'SAVINGS', 'INVESTMENT'],
                description: 'Wallet type'
            },
            balance: { type: 'number', description: 'Current balance' },
            availableBalance: { type: 'number', description: 'Available balance (excluding pending)' },
            status: {
                type: 'string',
                enum: ['ACTIVE', 'FROZEN', 'CLOSED'],
                description: 'Wallet status'
            },
            description: { type: 'string', description: 'Wallet description' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'userId', 'name', 'currency', 'type', 'balance', 'availableBalance', 'status', 'createdAt']
    },
    CreateWalletRequest: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1, description: 'Wallet name' },
            currency: { type: 'string', minLength: 3, maxLength: 3, default: 'RON', description: 'Currency code' },
            type: {
                type: 'string',
                enum: ['PERSONAL', 'BUSINESS', 'SAVINGS', 'INVESTMENT'],
                default: 'PERSONAL',
                description: 'Wallet type'
            },
            description: { type: 'string', description: 'Wallet description' },
            initialBalance: { type: 'number', minimum: 0, default: 0, description: 'Initial balance' }
        },
        required: ['name']
    },
    Transaction: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Transaction ID' },
            fromWalletId: { type: 'string', description: 'Source wallet ID' },
            toWalletId: { type: 'string', description: 'Destination wallet ID' },
            amount: { type: 'number', description: 'Transaction amount' },
            currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' },
            type: {
                type: 'string',
                enum: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND'],
                description: 'Transaction type'
            },
            status: {
                type: 'string',
                enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
                description: 'Transaction status'
            },
            category: { type: 'string', description: 'Transaction category' },
            description: { type: 'string', description: 'Transaction description' },
            reference: { type: 'string', description: 'External reference' },
            fee: { type: 'number', description: 'Transaction fee' },
            exchangeRate: { type: 'number', description: 'Exchange rate (if currency conversion)' },
            createdAt: { type: 'string', format: 'date-time', description: 'Transaction timestamp' },
            completedAt: { type: 'string', format: 'date-time', description: 'Completion timestamp' }
        },
        required: ['id', 'amount', 'currency', 'type', 'status', 'description', 'createdAt']
    },
    CreateTransactionRequest: {
        type: 'object',
        properties: {
            fromWalletId: { type: 'string', description: 'Source wallet ID' },
            toWalletId: { type: 'string', description: 'Destination wallet ID' },
            amount: { type: 'number', minimum: 0.01, description: 'Transaction amount' },
            currency: { type: 'string', minLength: 3, maxLength: 3, default: 'RON', description: 'Currency code' },
            type: {
                type: 'string',
                enum: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND'],
                description: 'Transaction type'
            },
            category: { type: 'string', description: 'Transaction category' },
            description: { type: 'string', minLength: 1, description: 'Transaction description' },
            reference: { type: 'string', description: 'External reference' }
        },
        required: ['amount', 'type', 'description']
    },
    PaymentMethod: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Payment method ID' },
            userId: { type: 'string', description: 'Owner user ID' },
            type: {
                type: 'string',
                enum: ['CARD', 'BANK_ACCOUNT', 'PAYPAL', 'CRYPTO'],
                description: 'Payment method type'
            },
            name: { type: 'string', description: 'Display name' },
            lastFour: { type: 'string', description: 'Last 4 digits/characters' },
            brand: { type: 'string', description: 'Card brand or bank name' },
            expiryMonth: { type: 'integer', description: 'Expiry month (cards)' },
            expiryYear: { type: 'integer', description: 'Expiry year (cards)' },
            isDefault: { type: 'boolean', description: 'Default payment method flag' },
            status: {
                type: 'string',
                enum: ['ACTIVE', 'EXPIRED', 'DISABLED'],
                description: 'Payment method status'
            },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'userId', 'type', 'name', 'isDefault', 'status', 'createdAt']
    },
    CreatePaymentMethodRequest: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                enum: ['CARD', 'BANK_ACCOUNT', 'PAYPAL', 'CRYPTO'],
                description: 'Payment method type'
            },
            name: { type: 'string', minLength: 1, description: 'Display name' },
            details: {
                type: 'object',
                properties: {
                    cardNumber: { type: 'string', description: 'Card number (for cards)' },
                    expiryMonth: { type: 'integer', minimum: 1, maximum: 12, description: 'Expiry month (cards)' },
                    expiryYear: { type: 'integer', description: 'Expiry year (cards)' },
                    accountNumber: { type: 'string', description: 'Account number (bank accounts)' },
                    routingNumber: { type: 'string', description: 'Routing number (bank accounts)' },
                    paypalEmail: { type: 'string', format: 'email', description: 'PayPal email' },
                    cryptoAddress: { type: 'string', description: 'Crypto wallet address' },
                    cryptoNetwork: { type: 'string', description: 'Crypto network (BTC, ETH, etc.)' }
                },
                description: 'Payment method specific details'
            },
            isDefault: { type: 'boolean', default: false, description: 'Set as default payment method' }
        },
        required: ['type', 'name', 'details']
    },
    Payment: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Payment ID' },
            paymentMethodId: { type: 'string', description: 'Payment method used' },
            amount: { type: 'number', description: 'Payment amount' },
            currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' },
            status: {
                type: 'string',
                enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
                description: 'Payment status'
            },
            description: { type: 'string', description: 'Payment description' },
            merchantId: { type: 'string', description: 'Merchant ID' },
            reference: { type: 'string', description: 'External reference' },
            fee: { type: 'number', description: 'Processing fee' },
            createdAt: { type: 'string', format: 'date-time', description: 'Payment timestamp' },
            completedAt: { type: 'string', format: 'date-time', description: 'Completion timestamp' }
        },
        required: ['id', 'paymentMethodId', 'amount', 'currency', 'status', 'description', 'createdAt']
    },
    ProcessPaymentRequest: {
        type: 'object',
        properties: {
            paymentMethodId: { type: 'string', minLength: 1, description: 'Payment method ID' },
            amount: { type: 'number', minimum: 0.01, description: 'Payment amount' },
            currency: { type: 'string', minLength: 3, maxLength: 3, default: 'RON', description: 'Currency code' },
            description: { type: 'string', minLength: 1, description: 'Payment description' },
            merchantId: { type: 'string', description: 'Merchant ID' },
            reference: { type: 'string', description: 'External reference' }
        },
        required: ['paymentMethodId', 'amount', 'description']
    }
};

// Generate OpenAPI specification
const openApiSpec = generateServiceOpenApiSpec('WALLET', walletServicePaths, { schemas: walletServiceSchemas });

// Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'WALLET Service API Documentation',
}));

// Authentication middleware for all routes (wallet is always secure)
const authMiddleware = jwtAuthMiddleware({
    jwtSecret: config.auth.jwtSecret,
    skipPaths: ['/health', '/ready', '/docs']
});

app.use('/api/v1', authMiddleware);

// Wallets endpoints
app.get('/api/v1/wallets', async (req, res) => {
    // Mock implementation
    const wallets = [
        {
            id: 'wallet-123e4567-e89b-12d3-a456-426614174000',
            userId: 'user-123',
            name: 'Main Wallet',
            currency: 'RON',
            type: 'PERSONAL',
            balance: 15000.50,
            availableBalance: 14500.50,
            status: 'ACTIVE',
            description: 'Primary personal wallet',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'wallet-987f6543-d21c-43ba-9876-123456789012',
            userId: 'user-123',
            name: 'Savings Account',
            currency: 'EUR',
            type: 'SAVINGS',
            balance: 5000.00,
            availableBalance: 5000.00,
            status: 'ACTIVE',
            description: 'Euro savings account',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    const filteredWallets = wallets.filter(wallet => {
        if (req.query.type && wallet.type !== req.query.type) return false;
        if (req.query.currency && wallet.currency !== req.query.currency) return false;
        if (req.query.status && wallet.status !== req.query.status) return false;
        return true;
    });

    const response = req.responseBuilder.success({
        wallets: filteredWallets,
        total: filteredWallets.length
    });

    res.json(response);
});

app.post('/api/v1/wallets',
    validate({ body: WalletSchemas.createWallet }),
    async (req, res) => {
        // Mock implementation
        const newWallet = {
            id: 'wallet-' + Date.now(),
            userId: 'user-123', // From JWT token in real implementation
            ...req.body,
            balance: req.body.initialBalance || 0,
            availableBalance: req.body.initialBalance || 0,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newWallet);
        res.status(201).json(response);
    }
);

// Transactions endpoints
app.get('/api/v1/transactions',
    validate({ query: WalletSchemas.searchTransactions }),
    async (req, res) => {
        // Mock implementation
        const transactions = [
            {
                id: 'txn-123e4567-e89b-12d3-a456-426614174000',
                fromWalletId: 'wallet-123e4567-e89b-12d3-a456-426614174000',
                toWalletId: 'wallet-987f6543-d21c-43ba-9876-123456789012',
                amount: 500.00,
                currency: 'RON',
                type: 'TRANSFER',
                status: 'COMPLETED',
                category: 'Personal',
                description: 'Monthly transfer to savings',
                reference: 'TXN-2024-001',
                fee: 2.50,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            },
            {
                id: 'txn-987f6543-d21c-43ba-9876-123456789012',
                toWalletId: 'wallet-123e4567-e89b-12d3-a456-426614174000',
                amount: 2000.00,
                currency: 'RON',
                type: 'DEPOSIT',
                status: 'COMPLETED',
                category: 'Salary',
                description: 'Monthly salary deposit',
                reference: 'SAL-2024-01',
                fee: 0,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            }
        ];

        let filteredTransactions = transactions.filter(txn => {
            if (req.query.walletId &&
                txn.fromWalletId !== req.query.walletId &&
                txn.toWalletId !== req.query.walletId) return false;
            if (req.query.type && txn.type !== req.query.type) return false;
            if (req.query.status && txn.status !== req.query.status) return false;
            if (req.query.minAmount && txn.amount < parseInt(req.query.minAmount as string)) return false;
            if (req.query.maxAmount && txn.amount > parseInt(req.query.maxAmount as string)) return false;
            if (req.query.category && txn.category !== req.query.category) return false;
            return true;
        });

        const total = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
        const summary = {
            totalAmount: total,
            averageAmount: total / filteredTransactions.length || 0,
            transactionCount: filteredTransactions.length
        };

        const response = req.responseBuilder.success({
            transactions: filteredTransactions.slice(0, parseInt(req.query.limit as string) || 20),
            total: filteredTransactions.length,
            summary
        });

        res.json(response);
    }
);

app.post('/api/v1/transactions',
    validate({ body: WalletSchemas.createTransaction }),
    async (req, res) => {
        // Mock implementation
        const newTransaction = {
            id: 'txn-' + Date.now(),
            ...req.body,
            status: 'PENDING',
            fee: req.body.amount * 0.005, // 0.5% fee
            createdAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newTransaction);
        res.status(201).json(response);
    }
);

// Payment Methods endpoints
app.get('/api/v1/payment-methods', async (req, res) => {
    // Mock implementation
    const paymentMethods = [
        {
            id: 'pm-123e4567-e89b-12d3-a456-426614174000',
            userId: 'user-123',
            type: 'CARD',
            name: 'Personal Visa Card',
            lastFour: '4242',
            brand: 'Visa',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'pm-987f6543-d21c-43ba-9876-123456789012',
            userId: 'user-123',
            type: 'BANK_ACCOUNT',
            name: 'BCR Account',
            lastFour: '5678',
            brand: 'BCR',
            isDefault: false,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    const filteredMethods = paymentMethods.filter(method => {
        if (req.query.type && method.type !== req.query.type) return false;
        return true;
    });

    const response = req.responseBuilder.success({
        paymentMethods: filteredMethods
    });

    res.json(response);
});

app.post('/api/v1/payment-methods',
    validate({ body: WalletSchemas.createPaymentMethod }),
    async (req, res) => {
        // Mock implementation
        const newPaymentMethod = {
            id: 'pm-' + Date.now(),
            userId: 'user-123', // From JWT token in real implementation
            type: req.body.type,
            name: req.body.name,
            lastFour: req.body.type === 'CARD' ? req.body.details.cardNumber?.slice(-4) :
                req.body.type === 'BANK_ACCOUNT' ? req.body.details.accountNumber?.slice(-4) : '****',
            brand: req.body.type === 'CARD' ? 'Unknown' : req.body.type,
            expiryMonth: req.body.details.expiryMonth,
            expiryYear: req.body.details.expiryYear,
            isDefault: req.body.isDefault,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newPaymentMethod);
        res.status(201).json(response);
    }
);

// Payments endpoints
app.post('/api/v1/payments',
    validate({ body: WalletSchemas.processPayment }),
    async (req, res) => {
        // Mock implementation
        const newPayment = {
            id: 'pay-' + Date.now(),
            ...req.body,
            status: Math.random() > 0.1 ? 'COMPLETED' : 'FAILED', // 90% success rate
            fee: req.body.amount * 0.029 + 0.30, // Stripe-like fees
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newPayment);
        res.json(response);
    }
);

// Error handling
app.use(globalErrorHandler);
app.use(notFoundHandler);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`💳 WALLET Service API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;

