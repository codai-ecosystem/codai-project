/**
 * MemorAI Memory Archive API
 * Handles archiving and restoring memories
 */

import { NextRequest, NextResponse } from 'next/server';
import cbdClient from '@/lib/cbd-client';
import { ApiResponse, Memory } from '@/types/memory';

// Mock user ID - will be replaced with proper auth
const MOCK_USER_ID = 'user-12345';

interface RouteParams {
    params: {
        id: string;
    };
}

/**
 * POST /api/memories/[id]/archive - Archive a memory
 */
export async function POST(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse<Memory>>> {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Memory ID is required',
                },
            }, { status: 400 });
        }

        // Get existing memory using findById
        const memory = await cbdClient.findById('memories', id);
        if (!memory) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Memory not found',
                },
            }, { status: 404 });
        }

        // Check if memory belongs to current user
        if (memory.userId !== MOCK_USER_ID) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                },
            }, { status: 403 });
        }

        // Update memory with archived status
        const archivedMemory: Memory = {
            ...memory,
            status: 'archived',
            archivedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updateResult = await cbdClient.updateDocument('memories', id, archivedMemory);
        if (!updateResult.success) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to archive memory',
                },
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: archivedMemory,
        });

    } catch (error) {
        console.error('Archive memory API error:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Failed to archive memory',
            },
        }, { status: 500 });
    }
}
