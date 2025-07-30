/**
 * Request Validation for CODAI APIs
 * Zod-based validation schemas and middleware
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { sendCodaiResponse } from './response';

// Common validation schemas
export const CommonSchemas = {
    // Pagination
    pagination: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    }),

    // ID parameters
    uuid: z.string().uuid(),
    objectId: z.string().regex(/^[a-fA-F0-9]{24}$/), // MongoDB ObjectId

    // Common fields
    email: z.string().email(),
    password: z.string().min(8).max(100),
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),

    // Timestamps
    timestamp: z.string().datetime(),
    dateRange: z.object({
        from: z.string().datetime(),
        to: z.string().datetime(),
    }),

    // Metadata
    tags: z.array(z.string()).max(20),
    metadata: z.record(z.any()).optional(),

    // Status fields
    status: z.enum(['active', 'inactive', 'pending', 'archived']),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
};

// Validation result interface
interface ValidationResult {
    success: boolean;
    data?: any;
    errors?: {
        field: string;
        message: string;
    }[];
}

/**
 * Validate data against a Zod schema
 */
export const validateData = <T>(schema: ZodSchema<T>, data: unknown): ValidationResult => {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            return { success: false, errors };
        }
        return { success: false, errors: [{ field: 'unknown', message: 'Validation failed' }] };
    }
};

/**
 * Express middleware for request body validation
 */
export const validateBody = <T>(schema: ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = validateData(schema, req.body);

        if (!result.success) {
            const response = req.responseBuilder.validationError(
                result.errors?.[0]?.field || 'body',
                'Request body validation failed',
                result.errors
            );
            return sendCodaiResponse(res, response);
        }

        req.body = result.data;
        next();
    };
};

/**
 * Express middleware for query parameter validation
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = validateData(schema, req.query);

        if (!result.success) {
            const response = req.responseBuilder.validationError(
                result.errors?.[0]?.field || 'query',
                'Query parameters validation failed',
                result.errors
            );
            return sendCodaiResponse(res, response);
        }

        req.query = result.data as any;
        next();
    };
};

/**
 * Express middleware for URL parameter validation
 */
export const validateParams = <T>(schema: ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = validateData(schema, req.params);

        if (!result.success) {
            const response = req.responseBuilder.validationError(
                result.errors?.[0]?.field || 'params',
                'URL parameters validation failed',
                result.errors
            );
            return sendCodaiResponse(res, response);
        }

        req.params = result.data as any;
        next();
    };
};

/**
 * Combined validation middleware
 */
export const validate = <
    TBody = any,
    TQuery = any,
    TParams = any
>(options: {
    body?: ZodSchema<TBody>;
    query?: ZodSchema<TQuery>;
    params?: ZodSchema<TParams>;
}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors: { field: string; message: string }[] = [];

        // Validate body
        if (options.body) {
            const bodyResult = validateData(options.body, req.body);
            if (!bodyResult.success) {
                errors.push(...(bodyResult.errors || []));
            } else {
                req.body = bodyResult.data;
            }
        }

        // Validate query
        if (options.query) {
            const queryResult = validateData(options.query, req.query);
            if (!queryResult.success) {
                errors.push(...(queryResult.errors || []));
            } else {
                req.query = queryResult.data as any;
            }
        }

        // Validate params
        if (options.params) {
            const paramsResult = validateData(options.params, req.params);
            if (!paramsResult.success) {
                errors.push(...(paramsResult.errors || []));
            } else {
                req.params = paramsResult.data as any;
            }
        }

        if (errors.length > 0) {
            const response = req.responseBuilder.validationError(
                errors[0].field,
                'Validation failed',
                errors
            );
            return sendCodaiResponse(res, response);
        }

        next();
    };
};

// Common validation schemas for CODAI services
export const CodaiValidationSchemas = {
    // User-related
    createUser: z.object({
        email: CommonSchemas.email,
        password: CommonSchemas.password,
        name: CommonSchemas.name,
        roles: z.array(z.string()).optional(),
    }),

    updateUser: z.object({
        name: CommonSchemas.name.optional(),
        email: CommonSchemas.email.optional(),
        roles: z.array(z.string()).optional(),
    }),

    // Authentication
    login: z.object({
        email: CommonSchemas.email,
        password: z.string().min(1),
    }),

    // Pagination queries
    paginatedQuery: CommonSchemas.pagination.extend({
        search: z.string().max(100).optional(),
        sortBy: z.string().max(50).optional(),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }),

    // Resource creation
    createResource: z.object({
        name: CommonSchemas.name,
        description: CommonSchemas.description,
        tags: CommonSchemas.tags.optional(),
        metadata: CommonSchemas.metadata,
        status: CommonSchemas.status.default('active'),
    }),

    // Resource update
    updateResource: z.object({
        name: CommonSchemas.name.optional(),
        description: CommonSchemas.description,
        tags: CommonSchemas.tags.optional(),
        metadata: CommonSchemas.metadata,
        status: CommonSchemas.status.optional(),
    }),

    // URL parameters
    uuidParam: z.object({
        id: CommonSchemas.uuid,
    }),

    objectIdParam: z.object({
        id: CommonSchemas.objectId,
    }),
};
