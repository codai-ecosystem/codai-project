/**
 * FABRICAI Service API Implementation
 * Standardized content creation API using CODAI standards
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
const config = createStandardApiConfig('fabricai', 4011);

// Setup universal CODAI middleware
setupCodaiMiddleware(app, config);

// FABRICAI specific validation schemas
const FabricaiSchemas = {
    generateContent: z.object({
        type: z.enum(['TEXT', 'BLOG_POST', 'SOCIAL_MEDIA', 'EMAIL', 'AD_COPY', 'PRODUCT_DESCRIPTION', 'PRESS_RELEASE']),
        prompt: z.string().min(10),
        tone: z.enum(['PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'FORMAL', 'CREATIVE', 'PERSUASIVE']).default('PROFESSIONAL'),
        length: z.enum(['SHORT', 'MEDIUM', 'LONG']).default('MEDIUM'),
        language: z.string().length(2).default('en'),
        audience: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        format: z.enum(['PLAIN', 'MARKDOWN', 'HTML']).default('PLAIN'),
        style: z.object({
            includeEmojis: z.boolean().default(false),
            includeHashtags: z.boolean().default(false),
            includeCTA: z.boolean().default(false),
            customInstructions: z.string().optional()
        }).optional(),
        metadata: z.record(z.any()).optional()
    }),

    createTemplate: z.object({
        name: z.string().min(1),
        category: z.enum(['BLOG', 'EMAIL', 'SOCIAL', 'ADS', 'PRODUCT', 'MARKETING']),
        description: z.string().min(1),
        template: z.string().min(1),
        variables: z.array(z.object({
            name: z.string().min(1),
            type: z.enum(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'ARRAY']),
            description: z.string().optional(),
            required: z.boolean().default(true),
            defaultValue: z.any().optional()
        })),
        tags: z.array(z.string()).optional(),
        isPublic: z.boolean().default(false),
        metadata: z.record(z.any()).optional()
    }),

    searchContent: z.object({
        query: z.string().optional(),
        type: z.enum(['TEXT', 'BLOG_POST', 'SOCIAL_MEDIA', 'EMAIL', 'AD_COPY', 'PRODUCT_DESCRIPTION', 'PRESS_RELEASE']).optional(),
        tone: z.enum(['PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'FORMAL', 'CREATIVE', 'PERSUASIVE']).optional(),
        language: z.string().length(2).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        sortBy: z.enum(['created', 'updated', 'title', 'type']).default('created'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        offset: z.coerce.number().int().min(0).default(0)
    }),

    searchTemplates: z.object({
        query: z.string().optional(),
        category: z.enum(['BLOG', 'EMAIL', 'SOCIAL', 'ADS', 'PRODUCT', 'MARKETING']).optional(),
        isPublic: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        sortBy: z.enum(['name', 'created', 'updated', 'usage']).default('created'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        offset: z.coerce.number().int().min(0).default(0)
    }),

    generateFromTemplate: z.object({
        templateId: z.string().min(1),
        variables: z.record(z.any()),
        customization: z.object({
            tone: z.enum(['PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'FORMAL', 'CREATIVE', 'PERSUASIVE']).optional(),
            language: z.string().length(2).optional(),
            format: z.enum(['PLAIN', 'MARKDOWN', 'HTML']).optional()
        }).optional(),
        metadata: z.record(z.any()).optional()
    })
};

// FABRICAI Service specific paths for OpenAPI
const fabricaiServicePaths: OpenAPIV3.PathsObject = {
    '/content/generate': {
        post: {
            tags: ['Content Generation'],
            summary: 'Generate content',
            description: 'Generate AI-powered content based on prompt and parameters',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/GenerateContentRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Content generated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/GeneratedContent' }
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
    '/content': {
        get: {
            tags: ['Content Management'],
            summary: 'Search content',
            description: 'Search and filter generated content',
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
                    description: 'Filter by content type',
                    schema: {
                        type: 'string',
                        enum: ['TEXT', 'BLOG_POST', 'SOCIAL_MEDIA', 'EMAIL', 'AD_COPY', 'PRODUCT_DESCRIPTION', 'PRESS_RELEASE']
                    }
                },
                {
                    name: 'tone',
                    in: 'query',
                    description: 'Filter by tone',
                    schema: {
                        type: 'string',
                        enum: ['PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'FORMAL', 'CREATIVE', 'PERSUASIVE']
                    }
                },
                {
                    name: 'language',
                    in: 'query',
                    description: 'Filter by language code',
                    schema: { type: 'string', minLength: 2, maxLength: 2 }
                },
                {
                    name: 'sortBy',
                    in: 'query',
                    description: 'Sort content by field',
                    schema: { type: 'string', enum: ['created', 'updated', 'title', 'type'], default: 'created' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of content items to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
                }
            ],
            responses: {
                '200': {
                    description: 'Content search results',
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
                                                    content: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/ContentItem' }
                                                    },
                                                    total: { type: 'integer' },
                                                    summary: {
                                                        type: 'object',
                                                        properties: {
                                                            byType: { type: 'object', additionalProperties: { type: 'integer' } },
                                                            byLanguage: { type: 'object', additionalProperties: { type: 'integer' } },
                                                            totalWords: { type: 'integer' }
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
        }
    },
    '/templates': {
        get: {
            tags: ['Templates'],
            summary: 'Search templates',
            description: 'Search and filter content templates',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'query',
                    in: 'query',
                    description: 'Search query',
                    schema: { type: 'string' }
                },
                {
                    name: 'category',
                    in: 'query',
                    description: 'Filter by category',
                    schema: {
                        type: 'string',
                        enum: ['BLOG', 'EMAIL', 'SOCIAL', 'ADS', 'PRODUCT', 'MARKETING']
                    }
                },
                {
                    name: 'isPublic',
                    in: 'query',
                    description: 'Filter by visibility',
                    schema: { type: 'boolean' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of templates to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
                }
            ],
            responses: {
                '200': {
                    description: 'Template search results',
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
                                                        items: { $ref: '#/components/schemas/ContentTemplate' }
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
            description: 'Create a new content template',
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
                                            data: { $ref: '#/components/schemas/ContentTemplate' }
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
    '/templates/{templateId}/generate': {
        post: {
            tags: ['Templates'],
            summary: 'Generate from template',
            description: 'Generate content using a specific template',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'templateId',
                    in: 'path',
                    required: true,
                    description: 'Template ID',
                    schema: { type: 'string' }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/GenerateFromTemplateRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Content generated from template successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/GeneratedContent' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '404': { $ref: '#/components/responses/NotFound' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    }
};

// FABRICAI Service specific schemas
const fabricaiServiceSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    GenerateContentRequest: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                enum: ['TEXT', 'BLOG_POST', 'SOCIAL_MEDIA', 'EMAIL', 'AD_COPY', 'PRODUCT_DESCRIPTION', 'PRESS_RELEASE'],
                description: 'Content type to generate'
            },
            prompt: { type: 'string', minLength: 10, description: 'Content generation prompt' },
            tone: {
                type: 'string',
                enum: ['PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'FORMAL', 'CREATIVE', 'PERSUASIVE'],
                default: 'PROFESSIONAL',
                description: 'Content tone'
            },
            length: {
                type: 'string',
                enum: ['SHORT', 'MEDIUM', 'LONG'],
                default: 'MEDIUM',
                description: 'Content length'
            },
            language: { type: 'string', minLength: 2, maxLength: 2, default: 'en', description: 'Language code' },
            audience: { type: 'string', description: 'Target audience' },
            keywords: { type: 'array', items: { type: 'string' }, description: 'Keywords to include' },
            format: {
                type: 'string',
                enum: ['PLAIN', 'MARKDOWN', 'HTML'],
                default: 'PLAIN',
                description: 'Output format'
            },
            style: {
                type: 'object',
                properties: {
                    includeEmojis: { type: 'boolean', default: false },
                    includeHashtags: { type: 'boolean', default: false },
                    includeCTA: { type: 'boolean', default: false },
                    customInstructions: { type: 'string' }
                },
                description: 'Style customizations'
            }
        },
        required: ['type', 'prompt']
    },
    GeneratedContent: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Content ID' },
            title: { type: 'string', description: 'Generated title' },
            content: { type: 'string', description: 'Generated content' },
            type: {
                type: 'string',
                enum: ['TEXT', 'BLOG_POST', 'SOCIAL_MEDIA', 'EMAIL', 'AD_COPY', 'PRODUCT_DESCRIPTION', 'PRESS_RELEASE'],
                description: 'Content type'
            },
            tone: {
                type: 'string',
                enum: ['PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'FORMAL', 'CREATIVE', 'PERSUASIVE'],
                description: 'Content tone'
            },
            language: { type: 'string', description: 'Content language' },
            wordCount: { type: 'integer', description: 'Word count' },
            characterCount: { type: 'integer', description: 'Character count' },
            readingTime: { type: 'integer', description: 'Estimated reading time in minutes' },
            keywords: { type: 'array', items: { type: 'string' }, description: 'Extracted keywords' },
            summary: { type: 'string', description: 'Content summary' },
            quality: {
                type: 'object',
                properties: {
                    score: { type: 'number', minimum: 0, maximum: 100 },
                    readability: { type: 'string' },
                    grammarScore: { type: 'number' },
                    seoScore: { type: 'number' }
                },
                description: 'Content quality metrics'
            },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
        },
        required: ['id', 'title', 'content', 'type', 'tone', 'language', 'wordCount', 'createdAt']
    },
    ContentItem: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Content ID' },
            title: { type: 'string', description: 'Content title' },
            type: {
                type: 'string',
                enum: ['TEXT', 'BLOG_POST', 'SOCIAL_MEDIA', 'EMAIL', 'AD_COPY', 'PRODUCT_DESCRIPTION', 'PRESS_RELEASE'],
                description: 'Content type'
            },
            tone: {
                type: 'string',
                enum: ['PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'FORMAL', 'CREATIVE', 'PERSUASIVE'],
                description: 'Content tone'
            },
            language: { type: 'string', description: 'Content language' },
            wordCount: { type: 'integer', description: 'Word count' },
            excerpt: { type: 'string', description: 'Content excerpt' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Content tags' },
            usage: {
                type: 'object',
                properties: {
                    views: { type: 'integer' },
                    copies: { type: 'integer' },
                    shares: { type: 'integer' }
                },
                description: 'Usage statistics'
            },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'title', 'type', 'tone', 'language', 'wordCount', 'createdAt']
    },
    ContentTemplate: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Template ID' },
            name: { type: 'string', description: 'Template name' },
            category: {
                type: 'string',
                enum: ['BLOG', 'EMAIL', 'SOCIAL', 'ADS', 'PRODUCT', 'MARKETING'],
                description: 'Template category'
            },
            description: { type: 'string', description: 'Template description' },
            template: { type: 'string', description: 'Template content with variables' },
            variables: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        type: { type: 'string', enum: ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'ARRAY'] },
                        description: { type: 'string' },
                        required: { type: 'boolean' },
                        defaultValue: {}
                    },
                    required: ['name', 'type']
                },
                description: 'Template variables'
            },
            tags: { type: 'array', items: { type: 'string' }, description: 'Template tags' },
            isPublic: { type: 'boolean', description: 'Public template flag' },
            usage: {
                type: 'object',
                properties: {
                    total: { type: 'integer' },
                    thisMonth: { type: 'integer' },
                    rating: { type: 'number' }
                },
                description: 'Template usage statistics'
            },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'name', 'category', 'description', 'template', 'variables', 'isPublic', 'createdAt']
    },
    CreateTemplateRequest: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1, description: 'Template name' },
            category: {
                type: 'string',
                enum: ['BLOG', 'EMAIL', 'SOCIAL', 'ADS', 'PRODUCT', 'MARKETING'],
                description: 'Template category'
            },
            description: { type: 'string', minLength: 1, description: 'Template description' },
            template: { type: 'string', minLength: 1, description: 'Template content with variables' },
            variables: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        type: { type: 'string', enum: ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'ARRAY'] },
                        description: { type: 'string' },
                        required: { type: 'boolean', default: true },
                        defaultValue: {}
                    },
                    required: ['name', 'type']
                },
                description: 'Template variables'
            },
            tags: { type: 'array', items: { type: 'string' }, description: 'Template tags' },
            isPublic: { type: 'boolean', default: false, description: 'Public template flag' }
        },
        required: ['name', 'category', 'description', 'template', 'variables']
    },
    GenerateFromTemplateRequest: {
        type: 'object',
        properties: {
            templateId: { type: 'string', minLength: 1, description: 'Template ID' },
            variables: { type: 'object', description: 'Variable values for template' },
            customization: {
                type: 'object',
                properties: {
                    tone: {
                        type: 'string',
                        enum: ['PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'FORMAL', 'CREATIVE', 'PERSUASIVE']
                    },
                    language: { type: 'string', minLength: 2, maxLength: 2 },
                    format: { type: 'string', enum: ['PLAIN', 'MARKDOWN', 'HTML'] }
                },
                description: 'Content customization options'
            }
        },
        required: ['templateId', 'variables']
    }
};

// Generate OpenAPI specification
const openApiSpec = generateServiceOpenApiSpec('FABRICAI', fabricaiServicePaths, { schemas: fabricaiServiceSchemas });

// Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FABRICAI Service API Documentation',
}));

// Authentication middleware for all routes
const authMiddleware = jwtAuthMiddleware({
    jwtSecret: config.auth.jwtSecret,
    skipPaths: ['/health', '/ready', '/docs']
});

app.use('/api/v1', authMiddleware);

// Content generation endpoints
app.post('/api/v1/content/generate',
    validate({ body: FabricaiSchemas.generateContent }),
    async (req, res) => {
        // Mock implementation
        const wordCount = req.body.length === 'SHORT' ? 150 : req.body.length === 'LONG' ? 800 : 400;

        const generatedContent = {
            id: 'content-' + Date.now(),
            title: `Generated ${req.body.type.toLowerCase()} content`,
            content: `This is a ${req.body.tone.toLowerCase()} ${req.body.type.toLowerCase()} generated based on: "${req.body.prompt}". The content would be AI-generated here with the specified parameters.`,
            type: req.body.type,
            tone: req.body.tone,
            language: req.body.language,
            wordCount,
            characterCount: wordCount * 5.5, // Approximate character count
            readingTime: Math.ceil(wordCount / 200), // 200 words per minute
            keywords: req.body.keywords || ['AI', 'content', 'generation'],
            summary: `AI-generated ${req.body.type.toLowerCase()} content in ${req.body.tone.toLowerCase()} tone`,
            quality: {
                score: 85 + Math.floor(Math.random() * 15),
                readability: 'Good',
                grammarScore: 90 + Math.floor(Math.random() * 10),
                seoScore: 75 + Math.floor(Math.random() * 25)
            },
            createdAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(generatedContent);
        res.json(response);
    }
);

// Content management endpoints
app.get('/api/v1/content',
    validate({ query: FabricaiSchemas.searchContent }),
    async (req, res) => {
        // Mock implementation
        const content = [
            {
                id: 'content-123e4567-e89b-12d3-a456-426614174000',
                title: 'Spring Collection Blog Post',
                type: 'BLOG_POST',
                tone: 'CREATIVE',
                language: 'en',
                wordCount: 650,
                excerpt: 'Discover the latest trends in our spring collection...',
                tags: ['fashion', 'spring', 'trends'],
                usage: {
                    views: 1250,
                    copies: 45,
                    shares: 23
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        const filteredContent = content.filter(item => {
            if (req.query.query && !item.title.toLowerCase().includes((req.query.query as string).toLowerCase())) return false;
            if (req.query.type && item.type !== req.query.type) return false;
            if (req.query.tone && item.tone !== req.query.tone) return false;
            if (req.query.language && item.language !== req.query.language) return false;
            return true;
        });

        const summary = {
            byType: filteredContent.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            byLanguage: filteredContent.reduce((acc, item) => {
                acc[item.language] = (acc[item.language] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            totalWords: filteredContent.reduce((sum, item) => sum + item.wordCount, 0)
        };

        const response = req.responseBuilder.success({
            content: filteredContent.slice(0, parseInt(req.query.limit as string) || 20),
            total: filteredContent.length,
            summary
        });

        res.json(response);
    }
);

// Template endpoints
app.get('/api/v1/templates',
    validate({ query: FabricaiSchemas.searchTemplates }),
    async (req, res) => {
        // Mock implementation
        const templates = [
            {
                id: 'template-123e4567-e89b-12d3-a456-426614174000',
                name: 'Product Launch Email',
                category: 'EMAIL',
                description: 'Professional email template for product launches',
                template: 'Subject: Introducing {{productName}} - {{tagline}}\n\nDear {{customerName}},\n\nWe\'re excited to announce {{productName}}, {{description}}.\n\n{{callToAction}}\n\nBest regards,\n{{companyName}}',
                variables: [
                    { name: 'productName', type: 'TEXT', description: 'Product name', required: true },
                    { name: 'tagline', type: 'TEXT', description: 'Product tagline', required: true },
                    { name: 'customerName', type: 'TEXT', description: 'Customer name', required: false },
                    { name: 'description', type: 'TEXT', description: 'Product description', required: true },
                    { name: 'callToAction', type: 'TEXT', description: 'Call to action', required: true },
                    { name: 'companyName', type: 'TEXT', description: 'Company name', required: true }
                ],
                tags: ['email', 'product', 'launch'],
                isPublic: true,
                usage: {
                    total: 156,
                    thisMonth: 23,
                    rating: 4.7
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        const filteredTemplates = templates.filter(template => {
            if (req.query.query && !template.name.toLowerCase().includes((req.query.query as string).toLowerCase())) return false;
            if (req.query.category && template.category !== req.query.category) return false;
            if (req.query.isPublic !== undefined && template.isPublic !== (req.query.isPublic === 'true')) return false;
            return true;
        });

        const response = req.responseBuilder.success({
            templates: filteredTemplates.slice(0, parseInt(req.query.limit as string) || 20),
            total: filteredTemplates.length
        });

        res.json(response);
    }
);

app.post('/api/v1/templates',
    validate({ body: FabricaiSchemas.createTemplate }),
    async (req, res) => {
        // Mock implementation
        const newTemplate = {
            id: 'template-' + Date.now(),
            ...req.body,
            usage: {
                total: 0,
                thisMonth: 0,
                rating: 0
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newTemplate);
        res.status(201).json(response);
    }
);

// Template generation endpoint
app.post('/api/v1/templates/:templateId/generate',
    validate({ body: FabricaiSchemas.generateFromTemplate }),
    async (req, res) => {
        // Mock implementation - replace template variables
        let content = 'Subject: Introducing {{productName}} - {{tagline}}\n\nDear {{customerName}},\n\nWe\'re excited to announce {{productName}}, {{description}}.\n\n{{callToAction}}\n\nBest regards,\n{{companyName}}';

        // Replace variables with provided values
        Object.entries(req.body.variables).forEach(([key, value]) => {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });

        const generatedContent = {
            id: 'generated-' + Date.now(),
            title: `Generated from template ${req.params.templateId}`,
            content,
            type: 'EMAIL',
            tone: req.body.customization?.tone || 'PROFESSIONAL',
            language: req.body.customization?.language || 'en',
            wordCount: content.split(' ').length,
            characterCount: content.length,
            readingTime: Math.ceil(content.split(' ').length / 200),
            keywords: ['template', 'generated', 'email'],
            summary: 'Content generated from template with provided variables',
            quality: {
                score: 88,
                readability: 'Excellent',
                grammarScore: 95,
                seoScore: 82
            },
            createdAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(generatedContent);
        res.json(response);
    }
);

// Error handling
app.use(globalErrorHandler);
app.use(notFoundHandler);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`✨ FABRICAI Service API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;

