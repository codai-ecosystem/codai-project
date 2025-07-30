/**
 * MARKETAI Service API Implementation
 * Standardized marketing automation API using CODAI standards
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
const config = createStandardApiConfig('marketai', 4010);

// Setup universal CODAI middleware
setupCodaiMiddleware(app, config);

// MARKETAI specific validation schemas
const MarketaiSchemas = {
    createCampaign: z.object({
        name: z.string().min(1),
        type: z.enum(['EMAIL', 'SMS', 'SOCIAL', 'PPC', 'DISPLAY', 'CONTENT']),
        status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED']).default('DRAFT'),
        description: z.string().optional(),
        targetAudience: z.object({
            segments: z.array(z.string()),
            demographics: z.record(z.any()).optional(),
            interests: z.array(z.string()).optional(),
            geography: z.array(z.string()).optional()
        }),
        content: z.object({
            subject: z.string().optional(),
            body: z.string().min(1),
            callToAction: z.string().optional(),
            assets: z.array(z.string()).optional()
        }),
        schedule: z.object({
            startDate: z.string().datetime().optional(),
            endDate: z.string().datetime().optional(),
            timezone: z.string().default('Europe/Bucharest')
        }).optional(),
        budget: z.object({
            amount: z.number().positive(),
            currency: z.string().length(3).default('RON'),
            type: z.enum(['DAILY', 'TOTAL', 'MONTHLY'])
        }).optional(),
        goals: z.array(z.object({
            metric: z.string(),
            target: z.number(),
            unit: z.string()
        })).optional(),
        metadata: z.record(z.any()).optional()
    }),

    searchCampaigns: z.object({
        query: z.string().optional(),
        type: z.enum(['EMAIL', 'SMS', 'SOCIAL', 'PPC', 'DISPLAY', 'CONTENT']).optional(),
        status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        sortBy: z.enum(['name', 'created', 'startDate', 'budget', 'performance']).default('created'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        offset: z.coerce.number().int().min(0).default(0)
    }),

    createLead: z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        source: z.string().min(1),
        campaign: z.string().optional(),
        tags: z.array(z.string()).optional(),
        customFields: z.record(z.any()).optional(),
        score: z.number().int().min(0).max(100).optional(),
        status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST']).default('NEW'),
        metadata: z.record(z.any()).optional()
    }),

    updateLead: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        tags: z.array(z.string()).optional(),
        customFields: z.record(z.any()).optional(),
        score: z.number().int().min(0).max(100).optional(),
        status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
        metadata: z.record(z.any()).optional()
    })
};

// MARKETAI Service specific paths for OpenAPI
const marketaiServicePaths: OpenAPIV3.PathsObject = {
    '/campaigns': {
        get: {
            tags: ['Campaigns'],
            summary: 'Search campaigns',
            description: 'Search and filter marketing campaigns',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'query',
                    in: 'query',
                    description: 'Search query',
                    schema: { type: 'string' }
                },
                {
                    name: 'type',
                    in: 'query',
                    description: 'Filter by campaign type',
                    schema: {
                        type: 'string',
                        enum: ['EMAIL', 'SMS', 'SOCIAL', 'PPC', 'DISPLAY', 'CONTENT']
                    }
                },
                {
                    name: 'status',
                    in: 'query',
                    description: 'Filter by campaign status',
                    schema: {
                        type: 'string',
                        enum: ['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED']
                    }
                },
                {
                    name: 'sortBy',
                    in: 'query',
                    description: 'Sort campaigns by field',
                    schema: { type: 'string', enum: ['name', 'created', 'startDate', 'budget', 'performance'], default: 'created' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of campaigns to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
                }
            ],
            responses: {
                '200': {
                    description: 'Campaign search results',
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
                                                    campaigns: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Campaign' }
                                                    },
                                                    total: { type: 'integer' },
                                                    summary: {
                                                        type: 'object',
                                                        properties: {
                                                            totalBudget: { type: 'number' },
                                                            activeCount: { type: 'integer' },
                                                            averagePerformance: { type: 'number' }
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
            tags: ['Campaigns'],
            summary: 'Create campaign',
            description: 'Create a new marketing campaign',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateCampaignRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Campaign created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Campaign' }
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
    '/leads': {
        get: {
            tags: ['Leads'],
            summary: 'List leads',
            description: 'Retrieve marketing leads with filtering options',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'status',
                    in: 'query',
                    description: 'Filter by lead status',
                    schema: {
                        type: 'string',
                        enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST']
                    }
                },
                {
                    name: 'source',
                    in: 'query',
                    description: 'Filter by lead source',
                    schema: { type: 'string' }
                },
                {
                    name: 'campaign',
                    in: 'query',
                    description: 'Filter by campaign',
                    schema: { type: 'string' }
                },
                {
                    name: 'minScore',
                    in: 'query',
                    description: 'Minimum lead score',
                    schema: { type: 'integer', minimum: 0, maximum: 100 }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of leads to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
                }
            ],
            responses: {
                '200': {
                    description: 'List of leads',
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
                                                    leads: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Lead' }
                                                    },
                                                    total: { type: 'integer' },
                                                    conversion: {
                                                        type: 'object',
                                                        properties: {
                                                            rate: { type: 'number' },
                                                            qualified: { type: 'integer' },
                                                            won: { type: 'integer' }
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
            tags: ['Leads'],
            summary: 'Create lead',
            description: 'Add a new marketing lead',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateLeadRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Lead created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Lead' }
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
    '/analytics': {
        get: {
            tags: ['Analytics'],
            summary: 'Get marketing analytics',
            description: 'Retrieve marketing performance analytics and insights',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'period',
                    in: 'query',
                    description: 'Analytics period',
                    schema: { type: 'string', enum: ['7d', '30d', '90d', '1y'], default: '30d' }
                },
                {
                    name: 'metrics',
                    in: 'query',
                    description: 'Specific metrics to include (comma-separated)',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'Marketing analytics data',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/MarketingAnalytics' }
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

// MARKETAI Service specific schemas
const marketaiServiceSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    Campaign: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Campaign ID' },
            name: { type: 'string', description: 'Campaign name' },
            type: {
                type: 'string',
                enum: ['EMAIL', 'SMS', 'SOCIAL', 'PPC', 'DISPLAY', 'CONTENT'],
                description: 'Campaign type'
            },
            status: {
                type: 'string',
                enum: ['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED'],
                description: 'Campaign status'
            },
            description: { type: 'string', description: 'Campaign description' },
            targetAudience: {
                type: 'object',
                properties: {
                    segments: { type: 'array', items: { type: 'string' } },
                    demographics: { type: 'object' },
                    interests: { type: 'array', items: { type: 'string' } },
                    geography: { type: 'array', items: { type: 'string' } }
                },
                description: 'Target audience definition'
            },
            content: {
                type: 'object',
                properties: {
                    subject: { type: 'string' },
                    body: { type: 'string' },
                    callToAction: { type: 'string' },
                    assets: { type: 'array', items: { type: 'string' } }
                },
                description: 'Campaign content'
            },
            performance: {
                type: 'object',
                properties: {
                    impressions: { type: 'integer' },
                    clicks: { type: 'integer' },
                    conversions: { type: 'integer' },
                    cost: { type: 'number' },
                    ctr: { type: 'number' },
                    cpc: { type: 'number' },
                    cpa: { type: 'number' },
                    roi: { type: 'number' }
                },
                description: 'Campaign performance metrics'
            },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'name', 'type', 'status', 'createdAt']
    },
    CreateCampaignRequest: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1, description: 'Campaign name' },
            type: {
                type: 'string',
                enum: ['EMAIL', 'SMS', 'SOCIAL', 'PPC', 'DISPLAY', 'CONTENT'],
                description: 'Campaign type'
            },
            description: { type: 'string', description: 'Campaign description' },
            targetAudience: {
                type: 'object',
                properties: {
                    segments: { type: 'array', items: { type: 'string' }, minItems: 1 },
                    demographics: { type: 'object' },
                    interests: { type: 'array', items: { type: 'string' } },
                    geography: { type: 'array', items: { type: 'string' } }
                },
                required: ['segments'],
                description: 'Target audience definition'
            },
            content: {
                type: 'object',
                properties: {
                    subject: { type: 'string' },
                    body: { type: 'string', minLength: 1 },
                    callToAction: { type: 'string' },
                    assets: { type: 'array', items: { type: 'string' } }
                },
                required: ['body'],
                description: 'Campaign content'
            },
            budget: {
                type: 'object',
                properties: {
                    amount: { type: 'number', minimum: 0.01 },
                    currency: { type: 'string', minLength: 3, maxLength: 3, default: 'RON' },
                    type: { type: 'string', enum: ['DAILY', 'TOTAL', 'MONTHLY'] }
                },
                required: ['amount', 'type'],
                description: 'Campaign budget'
            }
        },
        required: ['name', 'type', 'targetAudience', 'content']
    },
    Lead: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Lead ID' },
            email: { type: 'string', format: 'email', description: 'Lead email address' },
            firstName: { type: 'string', description: 'First name' },
            lastName: { type: 'string', description: 'Last name' },
            phone: { type: 'string', description: 'Phone number' },
            company: { type: 'string', description: 'Company name' },
            source: { type: 'string', description: 'Lead source' },
            campaign: { type: 'string', description: 'Associated campaign' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Lead tags' },
            score: { type: 'integer', minimum: 0, maximum: 100, description: 'Lead score' },
            status: {
                type: 'string',
                enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST'],
                description: 'Lead status'
            },
            activities: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        description: { type: 'string' },
                        timestamp: { type: 'string', format: 'date-time' }
                    }
                },
                description: 'Lead activity history'
            },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'email', 'source', 'score', 'status', 'createdAt']
    },
    CreateLeadRequest: {
        type: 'object',
        properties: {
            email: { type: 'string', format: 'email', description: 'Lead email address' },
            firstName: { type: 'string', description: 'First name' },
            lastName: { type: 'string', description: 'Last name' },
            phone: { type: 'string', description: 'Phone number' },
            company: { type: 'string', description: 'Company name' },
            source: { type: 'string', minLength: 1, description: 'Lead source' },
            campaign: { type: 'string', description: 'Associated campaign' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Lead tags' },
            score: { type: 'integer', minimum: 0, maximum: 100, description: 'Lead score' }
        },
        required: ['email', 'source']
    },
    MarketingAnalytics: {
        type: 'object',
        properties: {
            overview: {
                type: 'object',
                properties: {
                    totalCampaigns: { type: 'integer' },
                    activeCampaigns: { type: 'integer' },
                    totalLeads: { type: 'integer' },
                    qualifiedLeads: { type: 'integer' },
                    conversionRate: { type: 'number' },
                    totalSpend: { type: 'number' },
                    totalRevenue: { type: 'number' },
                    roi: { type: 'number' }
                },
                description: 'Overview metrics'
            },
            campaigns: {
                type: 'object',
                properties: {
                    performance: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                type: { type: 'string' },
                                impressions: { type: 'integer' },
                                clicks: { type: 'integer' },
                                conversions: { type: 'integer' },
                                cost: { type: 'number' },
                                roi: { type: 'number' }
                            }
                        }
                    },
                    byType: { type: 'object', additionalProperties: { type: 'number' } },
                    trends: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                date: { type: 'string', format: 'date' },
                                impressions: { type: 'integer' },
                                clicks: { type: 'integer' },
                                conversions: { type: 'integer' }
                            }
                        }
                    }
                },
                description: 'Campaign analytics'
            },
            leads: {
                type: 'object',
                properties: {
                    bySource: { type: 'object', additionalProperties: { type: 'integer' } },
                    byStatus: { type: 'object', additionalProperties: { type: 'integer' } },
                    scoreDistribution: { type: 'object', additionalProperties: { type: 'integer' } },
                    timeline: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                date: { type: 'string', format: 'date' },
                                new: { type: 'integer' },
                                qualified: { type: 'integer' },
                                converted: { type: 'integer' }
                            }
                        }
                    }
                },
                description: 'Lead analytics'
            }
        },
        required: ['overview', 'campaigns', 'leads']
    }
};

// Generate OpenAPI specification
const openApiSpec = generateServiceOpenApiSpec('MARKETAI', marketaiServicePaths, { schemas: marketaiServiceSchemas });

// Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MARKETAI Service API Documentation',
}));

// Authentication middleware for all routes
const authMiddleware = jwtAuthMiddleware({
    jwtSecret: config.auth.jwtSecret,
    skipPaths: ['/health', '/ready', '/docs']
});

app.use('/api/v1', authMiddleware);

// Campaigns endpoints
app.get('/api/v1/campaigns',
    validate({ query: MarketaiSchemas.searchCampaigns }),
    async (req, res) => {
        // Mock implementation
        const campaigns = [
            {
                id: 'camp-123e4567-e89b-12d3-a456-426614174000',
                name: 'Spring Product Launch',
                type: 'EMAIL',
                status: 'ACTIVE',
                description: 'Launch campaign for new spring collection',
                targetAudience: {
                    segments: ['existing-customers', 'lookalike'],
                    demographics: { ageRange: '25-45', gender: 'all' },
                    interests: ['fashion', 'spring-trends'],
                    geography: ['Romania', 'Moldova']
                },
                content: {
                    subject: '🌸 Discover Our Spring Collection',
                    body: 'New arrivals are here! Shop the latest trends...',
                    callToAction: 'Shop Now',
                    assets: ['spring-banner.jpg', 'products-grid.jpg']
                },
                performance: {
                    impressions: 50000,
                    clicks: 2500,
                    conversions: 125,
                    cost: 1500.00,
                    ctr: 0.05,
                    cpc: 0.60,
                    cpa: 12.00,
                    roi: 3.2
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        const filteredCampaigns = campaigns.filter(campaign => {
            if (req.query.query && !campaign.name.toLowerCase().includes((req.query.query as string).toLowerCase())) return false;
            if (req.query.type && campaign.type !== req.query.type) return false;
            if (req.query.status && campaign.status !== req.query.status) return false;
            return true;
        });

        const summary = {
            totalBudget: filteredCampaigns.reduce((sum, c) => sum + c.performance.cost, 0),
            activeCount: filteredCampaigns.filter(c => c.status === 'ACTIVE').length,
            averagePerformance: filteredCampaigns.reduce((sum, c) => sum + c.performance.roi, 0) / filteredCampaigns.length || 0
        };

        const response = req.responseBuilder.success({
            campaigns: filteredCampaigns.slice(0, parseInt(req.query.limit as string) || 20),
            total: filteredCampaigns.length,
            summary
        });

        res.json(response);
    }
);

app.post('/api/v1/campaigns',
    validate({ body: MarketaiSchemas.createCampaign }),
    async (req, res) => {
        // Mock implementation
        const newCampaign = {
            id: 'camp-' + Date.now(),
            ...req.body,
            performance: {
                impressions: 0,
                clicks: 0,
                conversions: 0,
                cost: 0,
                ctr: 0,
                cpc: 0,
                cpa: 0,
                roi: 0
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newCampaign);
        res.status(201).json(response);
    }
);

// Leads endpoints
app.get('/api/v1/leads', async (req, res) => {
    // Mock implementation
    const leads = [
        {
            id: 'lead-123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+40123456789',
            company: 'Tech Startup SRL',
            source: 'Spring Campaign',
            campaign: 'camp-123e4567-e89b-12d3-a456-426614174000',
            tags: ['qualified', 'high-value'],
            score: 85,
            status: 'QUALIFIED',
            activities: [
                {
                    type: 'EMAIL_OPENED',
                    description: 'Opened spring campaign email',
                    timestamp: new Date().toISOString()
                },
                {
                    type: 'LINK_CLICKED',
                    description: 'Clicked CTA button',
                    timestamp: new Date().toISOString()
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    const filteredLeads = leads.filter(lead => {
        if (req.query.status && lead.status !== req.query.status) return false;
        if (req.query.source && lead.source !== req.query.source) return false;
        if (req.query.campaign && lead.campaign !== req.query.campaign) return false;
        if (req.query.minScore && lead.score < parseFloat(req.query.minScore as string)) return false;
        return true;
    });

    const qualified = filteredLeads.filter(l => ['QUALIFIED', 'PROPOSAL'].includes(l.status)).length;
    const won = filteredLeads.filter(l => l.status === 'CLOSED_WON').length;
    const conversion = {
        rate: filteredLeads.length > 0 ? won / filteredLeads.length : 0,
        qualified,
        won
    };

    const response = req.responseBuilder.success({
        leads: filteredLeads.slice(0, parseInt(req.query.limit as string) || 20),
        total: filteredLeads.length,
        conversion
    });

    res.json(response);
});

app.post('/api/v1/leads',
    validate({ body: MarketaiSchemas.createLead }),
    async (req, res) => {
        // Mock implementation
        const newLead = {
            id: 'lead-' + Date.now(),
            ...req.body,
            score: req.body.score || Math.floor(Math.random() * 100),
            activities: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newLead);
        res.status(201).json(response);
    }
);

// Analytics endpoint
app.get('/api/v1/analytics', async (req, res) => {
    // Mock implementation
    const analytics = {
        overview: {
            totalCampaigns: 12,
            activeCampaigns: 5,
            totalLeads: 1250,
            qualifiedLeads: 384,
            conversionRate: 0.087,
            totalSpend: 15600.00,
            totalRevenue: 75400.00,
            roi: 4.83
        },
        campaigns: {
            performance: [
                {
                    name: 'Spring Product Launch',
                    type: 'EMAIL',
                    impressions: 50000,
                    clicks: 2500,
                    conversions: 125,
                    cost: 1500.00,
                    roi: 3.2
                }
            ],
            byType: {
                'EMAIL': 45.2,
                'SOCIAL': 28.7,
                'PPC': 15.8,
                'DISPLAY': 10.3
            },
            trends: [
                {
                    date: '2024-01-01',
                    impressions: 45000,
                    clicks: 2250,
                    conversions: 112
                }
            ]
        },
        leads: {
            bySource: {
                'Spring Campaign': 145,
                'Social Media': 98,
                'PPC Ads': 67,
                'Direct': 34
            },
            byStatus: {
                'NEW': 125,
                'CONTACTED': 89,
                'QUALIFIED': 67,
                'PROPOSAL': 23,
                'CLOSED_WON': 15,
                'CLOSED_LOST': 25
            },
            scoreDistribution: {
                '0-20': 45,
                '21-40': 78,
                '41-60': 112,
                '61-80': 89,
                '81-100': 54
            },
            timeline: [
                {
                    date: '2024-01-01',
                    new: 25,
                    qualified: 12,
                    converted: 3
                }
            ]
        }
    };

    const response = req.responseBuilder.success(analytics);
    res.json(response);
});

// Error handling
app.use(globalErrorHandler);
app.use(notFoundHandler);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`📈 MARKETAI Service API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;
