import { NextRequest, NextResponse } from 'next/server';
import { SearchMemorySchema, sanitizeAndValidateInput } from '../../../lib/validation';
import { vectorOperations } from '../../../lib/vector-operations';
import { memoryCache, cacheHelpers, CACHE_CONFIGS } from '../../../lib/cache';
import { ApiResponse, SearchMemoryRequest, SearchMemoryResult } from '../../../types/memory';
import { authenticateAPI, getAuthenticatedUserId, addSecurityHeaders } from '../../../middleware/auth';
import { searchRateLimit } from '../../../middleware/rateLimit';

// Mock user ID - will be replaced with proper auth
const MOCK_USER_ID = 'user-12345';

export async function POST(request: NextRequest): Promise<NextResponse<any>> {
    try {
        // 🔐 Authentication check
        const authResponse = authenticateAPI(request);
        if (authResponse) return addSecurityHeaders(authResponse);

        // 🛡️ Rate limiting check  
        const rateLimitResponse = searchRateLimit(request);
        if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

        // Get authenticated user ID
        const userId = getAuthenticatedUserId(request);

        const body: SearchMemoryRequest = await request.json();

        // Validate input
        const validationResult = SearchMemorySchema.safeParse(body);
        if (!validationResult.success) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid search parameters',
                    details: validationResult.error.errors,
                },
            }, { status: 400 }));
        }

        const { query, limit = 10, category, tags } = validationResult.data;

        // 🛡️ Enhanced SQL injection protection
        const sanitizationResult = sanitizeAndValidateInput(query);
        if (!sanitizationResult.isValid) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'SECURITY_VIOLATION',
                    message: 'Invalid query detected',
                    details: sanitizationResult.error,
                },
            }, { status: 400 }));
        }

        const sanitizedQuery = sanitizationResult.sanitized;

        if (sanitizedQuery.trim().length === 0) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Search query cannot be empty',
                },
            }, { status: 400 }));
        }

        // Generate cache key for search results
        const filters = JSON.stringify({ category, tags, limit });
        const cacheKey = cacheHelpers.searchKey(userId, sanitizedQuery, filters);

        // Check cache first
        let searchResults = memoryCache.get<SearchMemoryResult[]>(cacheKey);
        let fromCache = false;

        if (searchResults) {
            fromCache = true;
        } else {
            // Perform semantic search
            searchResults = await vectorOperations.searchSimilarMemories(
                sanitizedQuery,
                userId,
                limit,
                category,
                tags
            );

            // Cache the search results
            if (searchResults && searchResults.length > 0) {
                memoryCache.set(cacheKey, searchResults, CACHE_CONFIGS.SEARCH_RESULTS.TTL);
            }
        }

        return addSecurityHeaders(NextResponse.json({
            success: true,
            data: searchResults,
            meta: {
                count: searchResults.length,
                query: sanitizedQuery,
                timestamp: new Date().toISOString(),
                cached: fromCache,
                authenticated: true,
            },
        }));

    } catch (error) {
        console.error('Error searching memories:', error);
        return addSecurityHeaders(NextResponse.json({
            success: false,
            error: {
                code: 'SEARCH_ERROR',
                message: 'Failed to search memories',
            },
        }, { status: 500 }));
    }
}

// GET method for simple text searches via query parameters
export async function GET(request: NextRequest): Promise<NextResponse<any>> {
    try {
        // 🔐 Authentication check
        const authResponse = authenticateAPI(request);
        if (authResponse) return addSecurityHeaders(authResponse);

        // 🛡️ Rate limiting check  
        const rateLimitResponse = searchRateLimit(request);
        if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

        // Get authenticated user ID
        const userId = getAuthenticatedUserId(request);

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || searchParams.get('query');
        const limitParam = searchParams.get('limit');
        const category = searchParams.get('category') || undefined;
        const tagsParam = searchParams.get('tags');

        if (!query) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Query parameter is required',
                },
            }, { status: 400 }));
        }

        // 🛡️ Enhanced SQL injection protection
        const sanitizationResult = sanitizeAndValidateInput(query);
        if (!sanitizationResult.isValid) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'SECURITY_VIOLATION',
                    message: 'Invalid query detected',
                    details: sanitizationResult.error,
                },
            }, { status: 400 }));
        }

        const limit = limitParam ? parseInt(limitParam, 10) : 10;
        const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()) : undefined;

        // Validate parameters
        const validationResult = SearchMemorySchema.safeParse({
            query: sanitizationResult.sanitized,
            limit,
            category,
            tags,
        });

        if (!validationResult.success) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid search parameters',
                    details: validationResult.error.errors,
                },
            }, { status: 400 }));
        }

        const sanitizedQuery = sanitizationResult.sanitized;

        // Perform semantic search
        const searchResults = await vectorOperations.searchSimilarMemories(
            sanitizedQuery,
            userId,
            limit,
            category,
            tags
        );

        return addSecurityHeaders(NextResponse.json({
            success: true,
            data: searchResults,
            meta: {
                count: searchResults.length,
                query: sanitizedQuery,
                timestamp: new Date().toISOString(),
                authenticated: true,
            },
        }));

    } catch (error) {
        console.error('Error searching memories:', error);
        return addSecurityHeaders(NextResponse.json({
            success: false,
            error: {
                code: 'SEARCH_ERROR',
                message: 'Failed to search memories',
            },
        }, { status: 500 }));
    }
}
