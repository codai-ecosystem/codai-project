/**
 * Memory Routes for MemorAI API
 * Handles CRUD operations for user memories using CBD database
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { asyncHandler, ValidationError, NotFoundError, handleValidationErrors } from '@/middleware/errorHandler.js';
import { authenticateJWT, AuthenticatedRequest, requireRole } from '@/middleware/auth.js';
import { cbdService, Memory } from '@/services/cbdService.js';
import { logger } from '@/utils/logger.js';

const router = Router();

// Apply authentication to all memory routes
router.use(authenticateJWT);

/**
 * Create a new memory
 * POST /memories
 */
router.post('/', [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    body('content')
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 1, max: 10000 })
        .withMessage('Content must be between 1 and 10000 characters'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
        .custom((tags: string[]) => {
            if (tags && tags.length > 10) {
                throw new Error('Maximum 10 tags allowed');
            }
            return true;
        }),
    body('source')
        .optional()
        .isString()
        .withMessage('Source must be a string')
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw handleValidationErrors(errors.array());
    }

    const user = req.user!;
    const { title, content, tags = [], source = 'manual' } = req.body;

    try {
        const memory: Omit<Memory, 'id'> = {
            userId: user.id,
            title,
            content,
            metadata: {
                tags,
                source,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            }
        };

        const result = await cbdService.storeMemory(memory);

        if (!result.success) {
            logger.error('Failed to create memory', {
                userId: user.id,
                error: result.error,
                title: title.substring(0, 50)
            });

            return res.status(500).json({
                success: false,
                error: result.error || 'Failed to create memory'
            });
        }

        logger.info('Memory created successfully', {
            userId: user.id,
            memoryId: result.data!.id,
            title: title.substring(0, 50),
            tags: tags.length
        });

        res.status(201).json({
            success: true,
            data: result.data,
            message: 'Memory created successfully'
        });
    } catch (error) {
        logger.error('Memory creation error', {
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            title: title.substring(0, 50)
        });

        res.status(500).json({
            success: false,
            error: 'Failed to create memory'
        });
    }
}));

/**
 * Get all memories for the authenticated user
 * GET /memories
 */
router.get('/', [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('tags')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                const tags = value.split(',').map(tag => tag.trim());
                if (tags.some(tag => tag.length > 50)) {
                    throw new Error('Tag length cannot exceed 50 characters');
                }
            }
            return true;
        }),
    query('search')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Search query must be between 1 and 200 characters')
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw handleValidationErrors(errors.array());
    }

    const user = req.user!;
    const {
        page = 1,
        limit = 20,
        tags: tagsQuery,
        search
    } = req.query;

    try {
        let memories: Memory[] = [];

        if (search) {
            // Use vector search for content-based search
            const searchResult = await cbdService.searchMemories(
                search as string,
                user.id,
                {
                    limit: parseInt(limit as string),
                    tags: tagsQuery ? (tagsQuery as string).split(',').map(tag => tag.trim()) : undefined
                }
            );

            if (searchResult.success && searchResult.data) {
                memories = searchResult.data.map(result => result.memory);
            }
        } else {
            // TODO: Implement pagination and filtering for all memories
            // For now, return empty array and implement later
            memories = [];
        }

        const totalCount = memories.length;
        const totalPages = Math.ceil(totalCount / parseInt(limit as string));

        logger.info('Memories retrieved', {
            userId: user.id,
            count: memories.length,
            search: search ? (search as string).substring(0, 50) : undefined,
            tags: tagsQuery,
            page,
            limit
        });

        res.status(200).json({
            success: true,
            data: memories,
            meta: {
                pagination: {
                    currentPage: parseInt(page as string),
                    totalPages,
                    totalCount,
                    limit: parseInt(limit as string),
                    hasNext: parseInt(page as string) < totalPages,
                    hasPrev: parseInt(page as string) > 1
                },
                filters: {
                    search: search || null,
                    tags: tagsQuery ? (tagsQuery as string).split(',').map(tag => tag.trim()) : []
                }
            }
        });
    } catch (error) {
        logger.error('Memory retrieval error', {
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            search,
            tags: tagsQuery
        });

        res.status(500).json({
            success: false,
            error: 'Failed to retrieve memories'
        });
    }
}));

/**
 * Get a specific memory by ID
 * GET /memories/:id
 */
router.get('/:id', [
    param('id')
        .notEmpty()
        .withMessage('Memory ID is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Invalid memory ID format')
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw handleValidationErrors(errors.array());
    }

    const user = req.user!;
    const { id } = req.params;

    try {
        const result = await cbdService.getMemory(id, user.id);

        if (!result.success) {
            if (result.error?.includes('not found')) {
                throw new NotFoundError('Memory');
            }

            logger.error('Failed to retrieve memory', {
                userId: user.id,
                memoryId: id,
                error: result.error
            });

            return res.status(500).json({
                success: false,
                error: result.error || 'Failed to retrieve memory'
            });
        }

        logger.debug('Memory retrieved', {
            userId: user.id,
            memoryId: id,
            title: result.data!.title.substring(0, 50)
        });

        res.status(200).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }

        logger.error('Memory retrieval error', {
            userId: user.id,
            memoryId: id,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        res.status(500).json({
            success: false,
            error: 'Failed to retrieve memory'
        });
    }
}));

/**
 * Update a specific memory
 * PUT /memories/:id
 */
router.put('/:id', [
    param('id')
        .notEmpty()
        .withMessage('Memory ID is required'),
    body('title')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    body('content')
        .optional()
        .isLength({ min: 1, max: 10000 })
        .withMessage('Content must be between 1 and 10000 characters'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
        .custom((tags: string[]) => {
            if (tags && tags.length > 10) {
                throw new Error('Maximum 10 tags allowed');
            }
            return true;
        })
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw handleValidationErrors(errors.array());
    }

    const user = req.user!;
    const { id } = req.params;
    const updates = req.body;

    // Remove undefined fields
    Object.keys(updates).forEach(key =>
        updates[key] === undefined && delete updates[key]
    );

    if (Object.keys(updates).length === 0) {
        throw new ValidationError('At least one field must be provided for update');
    }

    try {
        const result = await cbdService.updateMemory(id, user.id, updates);

        if (!result.success) {
            if (result.error?.includes('not found')) {
                throw new NotFoundError('Memory');
            }

            logger.error('Failed to update memory', {
                userId: user.id,
                memoryId: id,
                error: result.error,
                updates: Object.keys(updates)
            });

            return res.status(500).json({
                success: false,
                error: result.error || 'Failed to update memory'
            });
        }

        logger.info('Memory updated successfully', {
            userId: user.id,
            memoryId: id,
            updatedFields: Object.keys(updates)
        });

        res.status(200).json({
            success: true,
            data: result.data,
            message: 'Memory updated successfully'
        });
    } catch (error) {
        if (error instanceof ValidationError || error instanceof NotFoundError) {
            throw error;
        }

        logger.error('Memory update error', {
            userId: user.id,
            memoryId: id,
            error: error instanceof Error ? error.message : 'Unknown error',
            updates: Object.keys(updates)
        });

        res.status(500).json({
            success: false,
            error: 'Failed to update memory'
        });
    }
}));

/**
 * Delete a specific memory
 * DELETE /memories/:id
 */
router.delete('/:id', [
    param('id')
        .notEmpty()
        .withMessage('Memory ID is required')
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw handleValidationErrors(errors.array());
    }

    const user = req.user!;
    const { id } = req.params;

    try {
        const result = await cbdService.deleteMemory(id, user.id);

        if (!result.success) {
            if (result.error?.includes('not found')) {
                throw new NotFoundError('Memory');
            }

            logger.error('Failed to delete memory', {
                userId: user.id,
                memoryId: id,
                error: result.error
            });

            return res.status(500).json({
                success: false,
                error: result.error || 'Failed to delete memory'
            });
        }

        logger.info('Memory deleted successfully', {
            userId: user.id,
            memoryId: id
        });

        res.status(200).json({
            success: true,
            message: 'Memory deleted successfully'
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }

        logger.error('Memory deletion error', {
            userId: user.id,
            memoryId: id,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        res.status(500).json({
            success: false,
            error: 'Failed to delete memory'
        });
    }
}));

/**
 * Search memories using vector similarity
 * POST /memories/search
 */
router.post('/search', [
    body('query')
        .notEmpty()
        .withMessage('Search query is required')
        .isLength({ min: 1, max: 500 })
        .withMessage('Query must be between 1 and 500 characters'),
    body('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    body('similarityThreshold')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Similarity threshold must be between 0 and 1'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw handleValidationErrors(errors.array());
    }

    const user = req.user!;
    const {
        query: searchQuery,
        limit = 10,
        similarityThreshold = 0.7,
        tags
    } = req.body;

    try {
        const result = await cbdService.searchMemories(
            searchQuery,
            user.id,
            {
                limit,
                similarityThreshold,
                tags
            }
        );

        if (!result.success) {
            logger.error('Memory search failed', {
                userId: user.id,
                query: searchQuery.substring(0, 50),
                error: result.error
            });

            return res.status(500).json({
                success: false,
                error: result.error || 'Search failed'
            });
        }

        logger.info('Memory search completed', {
            userId: user.id,
            query: searchQuery.substring(0, 50),
            resultCount: result.data!.length,
            tags: tags?.length || 0
        });

        res.status(200).json({
            success: true,
            data: result.data,
            meta: {
                query: searchQuery,
                resultCount: result.data!.length,
                similarityThreshold,
                tags: tags || []
            }
        });
    } catch (error) {
        logger.error('Memory search error', {
            userId: user.id,
            query: searchQuery.substring(0, 50),
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        res.status(500).json({
            success: false,
            error: 'Search failed'
        });
    }
}));

/**
 * Get user's memory statistics
 * GET /memories/stats
 */
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;

    try {
        const result = await cbdService.getUserStats(user.id);

        if (!result.success) {
            logger.error('Failed to retrieve user stats', {
                userId: user.id,
                error: result.error
            });

            return res.status(500).json({
                success: false,
                error: result.error || 'Failed to retrieve statistics'
            });
        }

        logger.debug('User stats retrieved', {
            userId: user.id,
            totalMemories: result.data!.totalMemories
        });

        res.status(200).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        logger.error('User stats retrieval error', {
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        res.status(500).json({
            success: false,
            error: 'Failed to retrieve statistics'
        });
    }
}));

export default router;
