import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsService } from '@/lib/ai-insights';
import { Memory } from '@/types/memory';

/**
 * POST /api/ai-insights/health
 * Calculate comprehensive memory health score and recommendations
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { memories, userId } = body;

        if (!userId || !Array.isArray(memories)) {
            return NextResponse.json(
                { error: 'User ID and memories array are required' },
                { status: 400 }
            );
        }

        const healthScore = await aiInsightsService.calculateMemoryHealthScore(memories, userId);

        return NextResponse.json({
            success: true,
            data: healthScore,
            generatedAt: new Date().toISOString(),
            memoryCount: memories.length
        });

    } catch (error) {
        console.error('Memory Health Calculation Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to calculate memory health score',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
