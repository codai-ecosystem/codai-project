// Search Analytics API Route - Search-specific analytics
// GET /api/analytics/search - Return search analytics data

import { NextRequest, NextResponse } from 'next/server';
import { MemoryAnalyticsEngine, AnalyticsFilter } from '@/lib/analytics-engine';

const analyticsEngine = new MemoryAnalyticsEngine();

export async function GET(request: NextRequest) {
    const startTime = Date.now();

    try {
        // For demo purposes, using a default user ID
        const userId = 'demo-user-123';

        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const dateRange = {
            start: searchParams.get('start')
                ? new Date(searchParams.get('start')!)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            end: searchParams.get('end')
                ? new Date(searchParams.get('end')!)
                : new Date()
        };

        const categories = searchParams.get('categories')?.split(',').filter(Boolean);
        const tags = searchParams.get('tags')?.split(',').filter(Boolean);

        const filter: AnalyticsFilter = {
            dateRange,
            categories,
            tags,
            userId: userId
        };

        // Generate analytics with focus on search data
        const analytics = await analyticsEngine.generateAnalytics(userId, filter);

        // Map the analytics data to match GraphQL schema expectations for search analytics
        const searchAnalytics = {
            totalMemories: analytics.totalMemories,
            totalSearches: analytics.searchPatterns?.length || 0,
            averageQueryTime: analytics.performanceMetrics?.averageResponseTime || 0,
            memoryGrowthRate: 0, // Calculate based on creation trends
            categories: analytics.categoriesDistribution || [],
            tags: analytics.tagsDistribution || [],
            searchPatterns: analytics.searchPatterns || [],
            performanceMetrics: {
                averageResponseTime: analytics.performanceMetrics?.averageResponseTime || 0,
                throughput: analytics.performanceMetrics?.apiUsage?.reduce((sum, api) => sum + api.calls, 0) || 0,
                errorRate: 0, // Could be calculated from performance data
                cacheHitRate: analytics.performanceMetrics?.cacheHitRate || 0,
                searchSuccessRate: analytics.performanceMetrics?.searchSuccessRate || 0
            }
        };

        return NextResponse.json({
            success: true,
            data: searchAnalytics,
            metadata: {
                userId: userId,
                filter: {
                    dateRange: {
                        start: filter.dateRange.start.toISOString(),
                        end: filter.dateRange.end.toISOString()
                    },
                    categories: filter.categories || [],
                    tags: filter.tags || []
                },
                generated: new Date().toISOString(),
                responseTime: Date.now() - startTime
            }
        });

    } catch (error) {
        console.error('Search analytics API error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate search analytics',
                details: error instanceof Error ? error.message : 'Unknown error',
                responseTime: Date.now() - startTime
            },
            { status: 500 }
        );
    }
}
