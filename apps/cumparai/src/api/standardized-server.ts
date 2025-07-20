/**
 * CUMPARAI Service API Implementation
 * Standardized e-commerce API using CODAI standards
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
const config = createStandardApiConfig('cumparai', 4008);

// Setup universal CODAI middleware
setupCodaiMiddleware(app, config);

// CUMPARAI specific validation schemas
const CumparaiSchemas = {
    createProduct: z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        price: z.number().positive(),
        currency: z.string().length(3).default('RON'),
        category: z.string().min(1),
        brand: z.string().optional(),
        sku: z.string().min(1),
        stock: z.number().int().min(0).default(0),
        images: z.array(z.string().url()).optional(),
        attributes: z.record(z.any()).optional(),
        tags: z.array(z.string()).optional(),
        isActive: z.boolean().default(true),
        metadata: z.record(z.any()).optional()
    }),

    searchProducts: z.object({
        query: z.string().optional(),
        category: z.string().optional(),
        brand: z.string().optional(),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().positive().optional(),
        inStock: z.boolean().optional(),
        sortBy: z.enum(['price', 'name', 'created', 'rating']).default('created'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        offset: z.coerce.number().int().min(0).default(0)
    }),

    addToCart: z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
        variant: z.string().optional(),
        metadata: z.record(z.any()).optional()
    }),

    updateCartItem: z.object({
        quantity: z.number().int().min(0),
        variant: z.string().optional(),
        metadata: z.record(z.any()).optional()
    }),

    createOrder: z.object({
        items: z.array(z.object({
            productId: z.string().min(1),
            quantity: z.number().int().min(1),
            price: z.number().positive()
        })),
        shippingAddress: z.object({
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            company: z.string().optional(),
            address1: z.string().min(1),
            address2: z.string().optional(),
            city: z.string().min(1),
            state: z.string().min(1),
            postalCode: z.string().min(1),
            country: z.string().length(2)
        }),
        paymentMethod: z.string().min(1),
        notes: z.string().optional(),
        metadata: z.record(z.any()).optional()
    })
};

// CUMPARAI Service specific paths for OpenAPI
const cumparaiServicePaths: OpenAPIV3.PathsObject = {
    '/products': {
        get: {
            tags: ['Products'],
            summary: 'Search products',
            description: 'Search and filter products in the catalog',
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
                    schema: { type: 'string' }
                },
                {
                    name: 'brand',
                    in: 'query',
                    description: 'Filter by brand',
                    schema: { type: 'string' }
                },
                {
                    name: 'minPrice',
                    in: 'query',
                    description: 'Minimum price filter',
                    schema: { type: 'number', minimum: 0 }
                },
                {
                    name: 'maxPrice',
                    in: 'query',
                    description: 'Maximum price filter',
                    schema: { type: 'number', minimum: 0 }
                },
                {
                    name: 'inStock',
                    in: 'query',
                    description: 'Filter by stock availability',
                    schema: { type: 'boolean' }
                },
                {
                    name: 'sortBy',
                    in: 'query',
                    description: 'Sort products by field',
                    schema: { type: 'string', enum: ['price', 'name', 'created', 'rating'], default: 'created' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of products to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
                }
            ],
            responses: {
                '200': {
                    description: 'Product search results',
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
                                                    products: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Product' }
                                                    },
                                                    total: { type: 'integer' },
                                                    facets: { type: 'object' }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        },
        post: {
            tags: ['Products'],
            summary: 'Create product',
            description: 'Add a new product to the catalog',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateProductRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Product created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Product' }
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
    '/cart': {
        get: {
            tags: ['Cart'],
            summary: 'Get shopping cart',
            description: 'Retrieve current user shopping cart',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Shopping cart contents',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Cart' }
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
            tags: ['Cart'],
            summary: 'Add to cart',
            description: 'Add a product to the shopping cart',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/AddToCartRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Item added to cart successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Cart' }
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
    },
    '/orders': {
        get: {
            tags: ['Orders'],
            summary: 'List orders',
            description: 'Retrieve user orders',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'status',
                    in: 'query',
                    description: 'Filter by order status',
                    schema: {
                        type: 'string',
                        enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
                    }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of orders to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
                }
            ],
            responses: {
                '200': {
                    description: 'List of orders',
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
                                                    orders: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Order' }
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
            tags: ['Orders'],
            summary: 'Create order',
            description: 'Create a new order',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateOrderRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Order created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Order' }
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

// CUMPARAI Service specific schemas
const cumparaiServiceSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    Product: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Product ID' },
            name: { type: 'string', description: 'Product name' },
            description: { type: 'string', description: 'Product description' },
            price: { type: 'number', description: 'Product price' },
            currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' },
            category: { type: 'string', description: 'Product category' },
            brand: { type: 'string', description: 'Product brand' },
            sku: { type: 'string', description: 'Stock keeping unit' },
            stock: { type: 'integer', description: 'Available stock quantity' },
            images: { type: 'array', items: { type: 'string' }, description: 'Product images' },
            attributes: { type: 'object', description: 'Product attributes' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Product tags' },
            rating: { type: 'number', description: 'Average rating' },
            reviewCount: { type: 'integer', description: 'Number of reviews' },
            isActive: { type: 'boolean', description: 'Product active status' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'name', 'description', 'price', 'currency', 'category', 'sku', 'stock', 'createdAt']
    },
    CreateProductRequest: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1, description: 'Product name' },
            description: { type: 'string', minLength: 1, description: 'Product description' },
            price: { type: 'number', minimum: 0.01, description: 'Product price' },
            currency: { type: 'string', minLength: 3, maxLength: 3, default: 'RON', description: 'Currency code' },
            category: { type: 'string', minLength: 1, description: 'Product category' },
            brand: { type: 'string', description: 'Product brand' },
            sku: { type: 'string', minLength: 1, description: 'Stock keeping unit' },
            stock: { type: 'integer', minimum: 0, default: 0, description: 'Initial stock quantity' },
            images: { type: 'array', items: { type: 'string', format: 'uri' }, description: 'Product images' },
            attributes: { type: 'object', description: 'Product attributes' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Product tags' },
            isActive: { type: 'boolean', default: true, description: 'Product active status' }
        },
        required: ['name', 'description', 'price', 'category', 'sku']
    },
    Cart: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Cart ID' },
            userId: { type: 'string', description: 'User ID' },
            items: {
                type: 'array',
                items: { $ref: '#/components/schemas/CartItem' },
                description: 'Cart items'
            },
            totalItems: { type: 'integer', description: 'Total number of items' },
            totalAmount: { type: 'number', description: 'Total amount' },
            currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'userId', 'items', 'totalItems', 'totalAmount', 'currency', 'updatedAt']
    },
    CartItem: {
        type: 'object',
        properties: {
            productId: { type: 'string', description: 'Product ID' },
            product: { $ref: '#/components/schemas/Product' },
            quantity: { type: 'integer', description: 'Item quantity' },
            price: { type: 'number', description: 'Unit price at time of addition' },
            variant: { type: 'string', description: 'Product variant' },
            subtotal: { type: 'number', description: 'Item subtotal' }
        },
        required: ['productId', 'quantity', 'price', 'subtotal']
    },
    AddToCartRequest: {
        type: 'object',
        properties: {
            productId: { type: 'string', minLength: 1, description: 'Product ID' },
            quantity: { type: 'integer', minimum: 1, description: 'Quantity to add' },
            variant: { type: 'string', description: 'Product variant' }
        },
        required: ['productId', 'quantity']
    },
    Order: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Order ID' },
            orderNumber: { type: 'string', description: 'Human-readable order number' },
            userId: { type: 'string', description: 'Customer user ID' },
            status: {
                type: 'string',
                enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
                description: 'Order status'
            },
            items: {
                type: 'array',
                items: { $ref: '#/components/schemas/OrderItem' },
                description: 'Order items'
            },
            totalAmount: { type: 'number', description: 'Total order amount' },
            currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' },
            shippingAddress: { type: 'object', description: 'Shipping address' },
            paymentMethod: { type: 'string', description: 'Payment method' },
            notes: { type: 'string', description: 'Order notes' },
            createdAt: { type: 'string', format: 'date-time', description: 'Order creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'orderNumber', 'userId', 'status', 'items', 'totalAmount', 'currency', 'createdAt']
    },
    OrderItem: {
        type: 'object',
        properties: {
            productId: { type: 'string', description: 'Product ID' },
            productName: { type: 'string', description: 'Product name at time of order' },
            quantity: { type: 'integer', description: 'Ordered quantity' },
            price: { type: 'number', description: 'Unit price at time of order' },
            subtotal: { type: 'number', description: 'Item subtotal' }
        },
        required: ['productId', 'productName', 'quantity', 'price', 'subtotal']
    },
    CreateOrderRequest: {
        type: 'object',
        properties: {
            items: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        productId: { type: 'string', minLength: 1 },
                        quantity: { type: 'integer', minimum: 1 },
                        price: { type: 'number', minimum: 0.01 }
                    },
                    required: ['productId', 'quantity', 'price']
                },
                minItems: 1,
                description: 'Order items'
            },
            shippingAddress: {
                type: 'object',
                properties: {
                    firstName: { type: 'string', minLength: 1 },
                    lastName: { type: 'string', minLength: 1 },
                    company: { type: 'string' },
                    address1: { type: 'string', minLength: 1 },
                    address2: { type: 'string' },
                    city: { type: 'string', minLength: 1 },
                    state: { type: 'string', minLength: 1 },
                    postalCode: { type: 'string', minLength: 1 },
                    country: { type: 'string', minLength: 2, maxLength: 2 }
                },
                required: ['firstName', 'lastName', 'address1', 'city', 'state', 'postalCode', 'country'],
                description: 'Shipping address'
            },
            paymentMethod: { type: 'string', minLength: 1, description: 'Payment method' },
            notes: { type: 'string', description: 'Order notes' }
        },
        required: ['items', 'shippingAddress', 'paymentMethod']
    }
};

// Generate OpenAPI specification
const openApiSpec = generateServiceOpenApiSpec('CUMPARAI', cumparaiServicePaths, { schemas: cumparaiServiceSchemas });

// Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CUMPARAI Service API Documentation',
}));

// Authentication middleware for protected routes
const authMiddleware = jwtAuthMiddleware({
    jwtSecret: config.auth.jwtSecret,
    skipPaths: ['/health', '/ready', '/docs', '/api/v1/products']
});

// API Routes
app.use('/api/v1', authMiddleware);

// Products endpoints (public access)
app.get('/api/v1/products',
    validate({ query: CumparaiSchemas.searchProducts }),
    async (req, res) => {
        // Mock implementation
        const products = [
            {
                id: 'prod-123e4567-e89b-12d3-a456-426614174000',
                name: 'Laptop Gaming ASUS ROG',
                description: 'High-performance gaming laptop with RTX graphics',
                price: 4999.99,
                currency: 'RON',
                category: 'Electronics',
                brand: 'ASUS',
                sku: 'ASUS-ROG-2024',
                stock: 15,
                images: ['https://example.com/laptop1.jpg'],
                attributes: { color: 'Black', ram: '16GB', storage: '512GB SSD' },
                tags: ['gaming', 'laptop', 'asus'],
                rating: 4.7,
                reviewCount: 128,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        const filteredProducts = products.filter(product => {
            if (req.query.query && !product.name.toLowerCase().includes((req.query.query as string).toLowerCase())) return false;
            if (req.query.category && product.category !== req.query.category) return false;
            if (req.query.brand && product.brand !== req.query.brand) return false;
            if (req.query.minPrice && product.price < parseFloat(req.query.minPrice as string)) return false;
            if (req.query.maxPrice && product.price > parseFloat(req.query.maxPrice as string)) return false;
            if (req.query.inStock && product.stock === 0) return false;
            return true;
        });

        const response = req.responseBuilder.success({
            products: filteredProducts.slice(0, parseInt(req.query.limit as string) || 20),
            total: filteredProducts.length,
            facets: {
                categories: ['Electronics', 'Books', 'Clothing'],
                brands: ['ASUS', 'Dell', 'HP'],
                priceRanges: ['0-1000', '1000-5000', '5000+']
            }
        });

        res.json(response);
    }
);

// Cart endpoints (authenticated)
app.get('/api/v1/cart', async (req, res) => {
    // Mock implementation
    const cart = {
        id: 'cart-user-123',
        userId: 'user-123',
        items: [
            {
                productId: 'prod-123e4567-e89b-12d3-a456-426614174000',
                product: {
                    id: 'prod-123e4567-e89b-12d3-a456-426614174000',
                    name: 'Laptop Gaming ASUS ROG',
                    price: 4999.99,
                    images: ['https://example.com/laptop1.jpg']
                },
                quantity: 1,
                price: 4999.99,
                variant: 'Black/16GB',
                subtotal: 4999.99
            }
        ],
        totalItems: 1,
        totalAmount: 4999.99,
        currency: 'RON',
        updatedAt: new Date().toISOString()
    };

    const response = req.responseBuilder.success(cart);
    res.json(response);
});

app.post('/api/v1/cart',
    validate({ body: CumparaiSchemas.addToCart }),
    async (req, res) => {
        // Mock implementation - cart after adding item
        const cart = {
            id: 'cart-user-123',
            userId: 'user-123',
            items: [
                {
                    productId: req.body.productId,
                    quantity: req.body.quantity,
                    price: 4999.99, // Would be fetched from product
                    variant: req.body.variant,
                    subtotal: req.body.quantity * 4999.99
                }
            ],
            totalItems: req.body.quantity,
            totalAmount: req.body.quantity * 4999.99,
            currency: 'RON',
            updatedAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(cart);
        res.json(response);
    }
);

// Orders endpoints
app.get('/api/v1/orders', async (req, res) => {
    // Mock implementation
    const orders = [
        {
            id: 'order-123e4567-e89b-12d3-a456-426614174000',
            orderNumber: 'ORD-2024-001',
            userId: 'user-123',
            status: 'SHIPPED',
            items: [
                {
                    productId: 'prod-123e4567-e89b-12d3-a456-426614174000',
                    productName: 'Laptop Gaming ASUS ROG',
                    quantity: 1,
                    price: 4999.99,
                    subtotal: 4999.99
                }
            ],
            totalAmount: 4999.99,
            currency: 'RON',
            shippingAddress: {
                firstName: 'John',
                lastName: 'Doe',
                address1: '123 Main St',
                city: 'Bucharest',
                state: 'Bucharest',
                postalCode: '010101',
                country: 'RO'
            },
            paymentMethod: 'Credit Card',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    const filteredOrders = orders.filter(order => {
        if (req.query.status && order.status !== req.query.status) return false;
        return true;
    });

    const response = req.responseBuilder.success({
        orders: filteredOrders.slice(0, parseInt(req.query.limit as string) || 20),
        total: filteredOrders.length
    });

    res.json(response);
});

app.post('/api/v1/orders',
    validate({ body: CumparaiSchemas.createOrder }),
    async (req, res) => {
        // Mock implementation
        const newOrder = {
            id: 'order-' + Date.now(),
            orderNumber: 'ORD-2024-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
            userId: 'user-123', // From JWT token in real implementation
            status: 'PENDING',
            ...req.body,
            totalAmount: req.body.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
            currency: 'RON',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newOrder);
        res.status(201).json(response);
    }
);

// Error handling
app.use(globalErrorHandler);
app.use(notFoundHandler);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🛒 CUMPARAI Service API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;
