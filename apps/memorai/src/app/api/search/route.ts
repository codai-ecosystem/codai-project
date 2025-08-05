import { NextRequest, NextResponse } from 'next/server';
import { SearchMemorySchema, sanitizeInput } from '../../../lib/validation';
import { vectorOperations } from '../../../lib/vector-operations';
import { memoryCache, cacheHelpers, CACHE_CONFIGS } from '../../../lib/cache';
import { ApiResponse, SearchMemoryRequest, SearchMemoryResult } from '../../../types/memory';

// Mock user ID - will be replaced with proper auth
const MOCK_USER_ID = 'user-12345';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<SearchMemoryResult[]>>> {
    try {
        const body: SearchMemoryRequest = await request.json();

        // Validate input
        const validationResult = SearchMemorySchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid search parameters',
                    details: validationResult.error.errors,
                },
            }, { status: 400 });
        }

        const { query, limit = 10, category, tags } = validationResult.data;

        // Sanitize search query
        const sanitizedQuery = sanitizeInput(query);

        if (sanitizedQuery.trim().length === 0) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Search query cannot be empty',
                },
            }, { status: 400 });
        }

        // Generate cache key for search results
        const filters = JSON.stringify({ category, tags, limit });
        const cacheKey = cacheHelpers.searchKey(MOCK_USER_ID, sanitizedQuery, filters);

        // Check cache first
        let searchResults = memoryCache.get<SearchMemoryResult[]>(cacheKey);
        let fromCache = false;

        if (searchResults) {
            fromCache = true;
        } else {
            // Perform semantic search
            searchResults = await vectorOperations.searchSimilarMemories(
                sanitizedQuery,
                MOCK_USER_ID,
                limit,
                category,
                tags
            );

            // Cache the search results
            if (searchResults && searchResults.length > 0) {
                memoryCache.set(cacheKey, searchResults, CACHE_CONFIGS.SEARCH_RESULTS.TTL);
            }
        }

        return NextResponse.json({
            success: true,
            data: searchResults,
            meta: {
                count: searchResults.length,
                query: sanitizedQuery,
                timestamp: new Date().toISOString(),
            },
        });

    } catch (error) {
        console.error('Error searching memories:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'SEARCH_ERROR',
                message: 'Failed to search memories',
            },
        }, { status: 500 });
    }
}

// GET method for simple text searches via query parameters
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<SearchMemoryResult[]>>> {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || searchParams.get('query');
        const limitParam = searchParams.get('limit');
        const category = searchParams.get('category') || undefined;
        const tagsParam = searchParams.get('tags');

        if (!query) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Query parameter is required',
                },
            }, { status: 400 });
        }

        const limit = limitParam ? parseInt(limitParam, 10) : 10;
        const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()) : undefined;

        // Validate parameters
        const validationResult = SearchMemorySchema.safeParse({
            query,
            limit,
            category,
            tags,
        });

        if (!validationResult.success) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid search parameters',
                    details: validationResult.error.errors,
                },
            }, { status: 400 });
        }

        const sanitizedQuery = sanitizeInput(query);

        // Perform semantic search
        const searchResults = await vectorOperations.searchSimilarMemories(
            sanitizedQuery,
            MOCK_USER_ID,
            limit,
            category,
            tags
        );

        return NextResponse.json({
            success: true,
            data: searchResults,
            meta: {
                count: searchResults.length,
                query: sanitizedQuery,
                timestamp: new Date().toISOString(),
            },
        });

    } catch (error) {
        console.error('Error searching memories:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'SEARCH_ERROR',
                message: 'Failed to search memories',
            },
        }, { status: 500 });
    }
}
