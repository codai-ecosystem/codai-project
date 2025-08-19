import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsService } from '@/lib/ai-insights';
import { Memory } from '@/types/memory';

/**
 * POST /api/ai-insights/analytics
 * Generate comprehensive usage analytics for user's memories
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { memories, userId, timeRange } = body;

        if (!userId || !Array.isArray(memories)) {
            return NextResponse.json(
                { error: 'User ID and memories array are required' },
                { status: 400 }
            );
        }

        const analytics = await aiInsightsService.generateUsageAnalytics(
            memories,
            timeRange || {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: new Date()
            }
        );

        return NextResponse.json({
            success: true,
            data: analytics,
            generatedAt: new Date().toISOString(),
            timeRange: timeRange || {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                end: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Usage Analytics Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate usage analytics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
