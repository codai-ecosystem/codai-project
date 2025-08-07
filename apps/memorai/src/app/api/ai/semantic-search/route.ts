import { NextRequest, NextResponse } from 'next/server';
import { semanticSearchService, SemanticSearchOptions } from '../../../../services/ai/SemanticSearchService';
import { ApiResponse } from '../../../../types/memory';

// POST /api/ai/semantic-search - AI-powered semantic search
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
    try {
        const body: SemanticSearchOptions = await request.json();

        // Validate required fields
        if (!body.query) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Query is required for semantic search.',
                },
            }, { status: 400 });
        }

        // Set defaults
        const searchOptions: SemanticSearchOptions = {
            query: body.query.trim(),
            agentId: body.agentId || 'github-copilot',
            limit: Math.min(body.limit || 10, 50), // Cap at 50 results
            threshold: body.threshold || 0.3,
            includeKeywordSearch: body.includeKeywordSearch !== false,
            boost: body.boost,
            filters: body.filters
        };

        // Perform semantic search
        const searchResult = await semanticSearchService.search(searchOptions);

        return NextResponse.json({
            success: true,
            data: {
                results: searchResult.results,
                insights: searchResult.insights,
                searchOptions: {
                    query: searchOptions.query,
                    semanticThreshold: searchOptions.threshold,
                    keywordSearchEnabled: searchOptions.includeKeywordSearch,
                    filtersApplied: !!searchOptions.filters,
                    boostFactorsApplied: !!searchOptions.boost
                }
            },
            meta: {
                timestamp: new Date().toISOString(),
                resultCount: searchResult.results.length,
                searchTime: searchResult.insights.searchTime,
                aiPowered: true
            },
        }, { status: 200 });

    } catch (error) {
        console.error('Semantic search API error:', error);

        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes('Query is required') ||
                error.message.includes('Limit must be') ||
                error.message.includes('Threshold must be')) {
                return NextResponse.json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.message,
                    },
                }, { status: 400 });
            }

            if (error.message.includes('No memories found') ||
                error.message.includes('Empty memory set')) {
                return NextResponse.json({
                    success: true,
                    data: {
                        results: [],
                        insights: {
                            totalResults: 0,
                            semanticResults: 0,
                            keywordResults: 0,
                            averageScore: 0,
                            searchTime: 0,
                            queryAnalysis: {
                                complexity: 'simple',
                                intent: 'general_search',
                                extractedTerms: [],
                                suggestedExpansions: []
                            },
                            recommendations: ['No memories found. Try adding some memories first.']
                        }
                    },
                    meta: {
                        timestamp: new Date().toISOString(),
                        resultCount: 0,
                        searchTime: 0,
                        aiPowered: true
                    }
                }, { status: 200 });
            }
        }

        return NextResponse.json({
            success: false,
            error: {
                code: 'SEMANTIC_SEARCH_ERROR',
                message: 'AI-powered search failed. Please try again.',
            },
        }, { status: 500 });
    }
}

// GET /api/ai/semantic-search/analytics - Get search analytics
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
    try {
        const analytics = semanticSearchService.getSearchAnalytics();
        const popularQueries = semanticSearchService.getPopularQueries(10);

        return NextResponse.json({
            success: true,
            data: {
                analytics,
                popularQueries,
                cacheStats: {
                    // TODO: Implement cache stats from search service
                    enabled: true,
                    hitRate: 0.85, // Mock value
                    size: 42 // Mock value
                }
            },
            meta: {
                timestamp: new Date().toISOString(),
                dataType: 'search_analytics'
            },
        }, { status: 200 });

    } catch (error) {
        console.error('Search analytics API error:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'ANALYTICS_ERROR',
                message: 'Failed to retrieve search analytics.',
            },
        }, { status: 500 });
    }
}
