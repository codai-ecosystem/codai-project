import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsService } from '@/lib/ai-insights';
import { Memory } from '@/types/memory';

/**
 * POST /api/ai-insights/recommendations
 * Generate personalized recommendations for memory organization
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { memories, userId, context } = body;

        if (!userId || !Array.isArray(memories)) {
            return NextResponse.json(
                { error: 'User ID and memories array are required' },
                { status: 400 }
            );
        }

        const recommendations = await aiInsightsService.generateRecommendations(
            memories,
            userId,
            context
        );

        return NextResponse.json({
            success: true,
            data: recommendations,
            generatedAt: new Date().toISOString(),
            recommendationCount: recommendations.length
        });

    } catch (error) {
        console.error('Recommendation Generation Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate recommendations',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
