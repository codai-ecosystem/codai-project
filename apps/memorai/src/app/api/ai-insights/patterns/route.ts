import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsService } from '@/lib/ai-insights';
import { Memory } from '@/types/memory';

/**
 * POST /api/ai-insights/patterns
 * Identify patterns in user's memories
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { memories, userId, patternTypes } = body;

        if (!userId || !Array.isArray(memories)) {
            return NextResponse.json(
                { error: 'User ID and memories array are required' },
                { status: 400 }
            );
        }

        const patterns = await aiInsightsService.identifyMemoryPatterns(
            memories,
            patternTypes
        );

        return NextResponse.json({
            success: true,
            data: patterns,
            generatedAt: new Date().toISOString(),
            patternCount: patterns.length
        });

    } catch (error) {
        console.error('Pattern Analysis Error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to identify memory patterns',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
