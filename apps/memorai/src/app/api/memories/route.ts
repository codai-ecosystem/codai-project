import { NextRequest, NextResponse } from 'next/server';
import { CreateMemorySchema, UpdateMemorySchema, sanitizeInput } from '../../../lib/validation';
import { vectorOperations } from '../../../lib/vector-operations';
import { memoryCategorizationService } from '../../../lib/categorization';
import { memoryCache, cacheHelpers, CACHE_CONFIGS } from '../../../lib/cache';
import { ApiResponse, Memory, CreateMemoryRequest, SearchMemoryResult } from '../../../types/memory';
import { authenticateAPI, getAuthenticatedUserId, addSecurityHeaders } from '../../../middleware/auth';
import { sensitiveRateLimit, createRateLimit } from '../../../middleware/rateLimit';
import { v4 as uuidv4 } from 'uuid';

// Mock user ID - will be replaced with proper auth
const MOCK_USER_ID = 'user-12345';

// POST /api/memories - Create new memory
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Memory>>> {
    try {
        // 🔐 Authentication check
        const authResponse = authenticateAPI(request);
        if (authResponse) return addSecurityHeaders(authResponse);

        // 🛡️ Rate limiting check (strict for creation)
        const rateLimitResponse = createRateLimit(request);
        if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

        // Get authenticated user ID
        const userId = getAuthenticatedUserId(request);

        const body: CreateMemoryRequest = await request.json();

        // Validate input
        const validationResult = CreateMemorySchema.safeParse(body);
        if (!validationResult.success) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid memory data',
                    details: validationResult.error.errors,
                },
            }, { status: 400 }));
        }

        const { content, title, category, tags = [] } = validationResult.data;

        // Sanitize input
        const sanitizedContent = sanitizeInput(content);
        const sanitizedTitle = title ? sanitizeInput(title) : undefined;
        const sanitizedCategory = category ? sanitizeInput(category) : undefined;
        const sanitizedTags = tags.map(tag => sanitizeInput(tag));

        if (sanitizedContent.trim().length === 0) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Memory content cannot be empty',
                },
            }, { status: 400 }));
        }

        // Create memory object
        const memory: Memory = {
            id: uuidv4(),
            userId: userId,
            content: sanitizedContent,
            title: sanitizedTitle,
            category: sanitizedCategory,
            tags: sanitizedTags,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Auto-categorize if no category provided
        if (!memory.category || memory.category === 'general') {
            memory.category = memoryCategorizationService.categorizeMemory(memory);
        }

        // Generate additional tags if none provided
        if (!memory.tags || memory.tags.length === 0) {
            memory.tags = memoryCategorizationService.generateTags(memory);
        } else {
            // Merge provided tags with generated ones
            const generatedTags = memoryCategorizationService.generateTags(memory);
            memory.tags = [...memory.tags, ...generatedTags].filter((tag, index, arr) => arr.indexOf(tag) === index);
        }

        // Store memory with vector embedding
        const result = await vectorOperations.storeMemoryWithVector(memory);

        if (!result.success) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'STORAGE_ERROR',
                    message: result.error || 'Failed to store memory',
                },
            }, { status: 500 }));
        }

        // Cache the created memory
        const cacheKey = cacheHelpers.memoryKey(memory.userId, memory.id);
        memoryCache.set(cacheKey, memory, CACHE_CONFIGS.MEMORIES.TTL);

        // Invalidate user's memory list cache
        cacheHelpers.invalidateUserCache(memory.userId);

        return addSecurityHeaders(NextResponse.json({
            success: true,
            data: memory,
            meta: {
                timestamp: new Date().toISOString(),
                cached: true,
                authenticated: true
            },
        }, { status: 201 }));

    } catch (error) {
        console.error('Error creating memory:', error);
        return addSecurityHeaders(NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to create memory',
            },
        }, { status: 500 }));
    }
}

// GET /api/memories - List user memories
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Memory[]>>> {
    try {
        // 🔐 Authentication check
        const authResponse = authenticateAPI(request);
        if (authResponse) return addSecurityHeaders(authResponse);

        // 🛡️ Rate limiting check
        const rateLimitResponse = sensitiveRateLimit(request);
        if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

        // Get authenticated user ID
        const userId = getAuthenticatedUserId(request);

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const tagsParam = searchParams.get('tags');
        const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()) : undefined;
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        // Generate cache key for this specific query
        const filters = JSON.stringify({ category, tags, limit });
        const cacheKey = cacheHelpers.userMemoriesKey(userId, filters);

        // Try to get from cache first
        let filteredMemories = memoryCache.get<Memory[]>(cacheKey);
        let fromCache = false;

        if (filteredMemories) {
            fromCache = true;
        } else {
            // Get all user memories
            const memories = await vectorOperations.getAllUserMemories(userId);

            // Apply filters
            filteredMemories = memories;

            if (category) {
                filteredMemories = filteredMemories.filter(memory =>
                    memory.category?.toLowerCase() === category.toLowerCase()
                );
            }

            if (tags && tags.length > 0) {
                filteredMemories = filteredMemories.filter(memory =>
                    tags.some(tag => memory.tags.some(memoryTag =>
                        memoryTag.toLowerCase().includes(tag.toLowerCase())
                    ))
                );
            }

            // Cache the filtered results
            memoryCache.set(cacheKey, filteredMemories, CACHE_CONFIGS.MEMORIES.TTL);
        }

        // Apply limit
        if (limit && limit > 0) {
            filteredMemories = filteredMemories.slice(0, limit);
        }

        // Sort by creation date (newest first)
        filteredMemories.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return addSecurityHeaders(NextResponse.json({
            success: true,
            data: filteredMemories,
            meta: {
                count: filteredMemories.length,
                timestamp: new Date().toISOString(),
                cached: fromCache,
                filters: { category, tags, limit },
                authenticated: true
            },
        }));

    } catch (error) {
        console.error('Error fetching memories:', error);
        return addSecurityHeaders(NextResponse.json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to fetch memories',
            },
        }, { status: 500 }));
    }
}
