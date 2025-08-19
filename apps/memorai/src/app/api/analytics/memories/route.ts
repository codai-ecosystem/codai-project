// Memory Analytics API Route - Specialized memory analytics
// GET /api/analytics/memories - Return memory-specific analytics

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

        // Generate memory-specific analytics
        const analytics = await analyticsEngine.generateAnalytics(userId, filter);

        // Map the analytics data to match GraphQL schema expectations for memory analytics
        const memoryAnalytics = {
            totalMemories: analytics.totalMemories,
            memoriesThisWeek: analytics.memoriesThisWeek,
            memoriesThisMonth: analytics.memoriesThisMonth,
            averageMemorySize: analytics.averageMemorySize,
            totalStorageUsed: analytics.totalStorageUsed,
            categories: analytics.categoriesDistribution || [],
            tags: analytics.tagsDistribution || [],
            creationTrends: analytics.creationTrends || [],
            userBehavior: analytics.userBehavior || {
                activeHours: [],
                preferredCategories: [],
                searchFrequency: 'Low',
                engagementScore: 0
            },
            insights: analytics.insights || []
        };

        return NextResponse.json({
            success: true,
            data: memoryAnalytics,
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
        console.error('Memory analytics API error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate memory analytics',
                details: error instanceof Error ? error.message : 'Unknown error',
                responseTime: Date.now() - startTime
            },
            { status: 500 }
        );
    }
}
