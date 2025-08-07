import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsService } from '@/lib/ai-insights';
import { Memory } from '@/types/memory';
import { AIInsightsDashboard } from '@/types/ai-insights';

/**
 * GET /api/ai-insights
 * Generate comprehensive AI insights dashboard for user's memories
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const forceRefresh = searchParams.get('forceRefresh') === 'true';

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // In a real application, you would fetch memories from your database
        // For now, we'll expect the memories to be provided via the request
        const memories: Memory[] = []; // This would be fetched from your database

        const timeRange = {
            start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: endDate ? new Date(endDate) : new Date()
        };

        const dashboard = await aiInsightsService.generateAIInsightsDashboard(
            memories,
            userId,
            timeRange
        );

        return NextResponse.json({
            success: true,
            data: dashboard,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI Insights API Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate AI insights',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/ai-insights
 * Generate AI insights for provided memories
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { memories, userId, timeRange, options } = body;

        if (!userId || !Array.isArray(memories)) {
            return NextResponse.json(
                { error: 'User ID and memories array are required' },
                { status: 400 }
            );
        }

        const dashboard = await aiInsightsService.generateAIInsightsDashboard(
            memories,
            userId,
            timeRange || {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: new Date()
            },
            options
        );

        return NextResponse.json({
            success: true,
            data: dashboard,
            generatedAt: new Date().toISOString(),
            memoryCount: memories.length
        });

    } catch (error) {
        console.error('AI Insights Generation Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate AI insights',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
