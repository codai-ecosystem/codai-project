/**
 * MemorAI Similar Memories API
 * GET /api/memories/[id]/similar - Find similar memories
 */

import { NextRequest, NextResponse } from 'next/server';
import { cbdClient } from '@/lib/cbd-client';
import { ApiResponse, Memory } from '../../../../../types/memory';

// Mock user ID - will be replaced with proper auth
const MOCK_USER_ID = 'user-12345';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse<Memory[]>>> {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '5');

        if (!id) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Memory ID is required',
                },
            }, { status: 400 });
        }

        // Get the source memory
        const sourceResult = await cbdClient.getDocument('memories', id);
        if (!sourceResult.success || !sourceResult.data) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Memory not found',
                },
            }, { status: 404 });
        }

        const sourceMemory = sourceResult.data as Memory;

        // Check if memory belongs to current user
        if (sourceMemory.userId !== MOCK_USER_ID) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                },
            }, { status: 403 });
        }

        // Find similar memories based on content, category, and tags
        const allMemoriesResult = await cbdClient.findDocuments('memories', {
            userId: MOCK_USER_ID
        });

        if (!allMemoriesResult.success || !allMemoriesResult.data) {
            return NextResponse.json({
                success: true,
                data: [],
            });
        }

        const allMemories = allMemoriesResult.data as Memory[];

        // Filter out the source memory and calculate similarity
        const similarMemories = allMemories
            .filter(memory => memory.id !== id)
            .map(memory => {
                let similarity = 0;

                // Category similarity (weight: 40%)
                if (memory.category === sourceMemory.category) {
                    similarity += 0.4;
                }

                // Tag similarity (weight: 30%)
                const sourceTags = sourceMemory.tags || [];
                const memoryTags = memory.tags || [];
                const commonTags = sourceTags.filter(tag => memoryTags.includes(tag));
                if (sourceTags.length > 0) {
                    similarity += (commonTags.length / sourceTags.length) * 0.3;
                }

                // Content similarity (basic keyword matching - weight: 30%)
                const sourceWords = sourceMemory.content.toLowerCase().split(/\s+/);
                const memoryWords = memory.content.toLowerCase().split(/\s+/);
                const commonWords = sourceWords.filter(word =>
                    word.length > 3 && memoryWords.includes(word)
                );
                if (sourceWords.length > 0) {
                    similarity += (commonWords.length / sourceWords.length) * 0.3;
                }

                return { ...memory, similarity };
            })
            .filter(memory => memory.similarity > 0.1) // Minimum similarity threshold
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(({ similarity, ...memory }) => memory); // Remove similarity from output

        return NextResponse.json({
            success: true,
            data: similarMemories,
        });

    } catch (error) {
        console.error('Error finding similar memories:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to find similar memories',
            },
        }, { status: 500 });
    }
}
