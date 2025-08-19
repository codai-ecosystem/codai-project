import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsService } from '@/lib/ai-insights';
import { Memory } from '@/types/memory';

/**
 * POST /api/ai-insights/clusters
 * Generate memory clusters based on content similarity and usage patterns
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { memories, userId, clusteringAlgorithm = 'semantic' } = body;

        if (!userId || !Array.isArray(memories)) {
            return NextResponse.json(
                { error: 'User ID and memories array are required' },
                { status: 400 }
            );
        }

        const clusters = await aiInsightsService.performMemoryClustering(
            memories,
            clusteringAlgorithm
        );

        return NextResponse.json({
            success: true,
            data: clusters,
            generatedAt: new Date().toISOString(),
            clusterCount: clusters.length,
            algorithm: clusteringAlgorithm
        });

    } catch (error) {
        console.error('Memory Clustering Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to perform memory clustering',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
