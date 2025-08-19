/**
 * MemorAI Memory Restore API
 * Handles restoring archived memories
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
 * POST /api/memories/[id]/restore - Restore an archived memory
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

        // Update memory to remove archived status
        const restoredMemory: Memory = {
            ...memory,
            status: 'active',
            restoredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Remove archivedAt field if it exists
        delete restoredMemory.archivedAt;

        const updateResult = await cbdClient.updateDocument('memories', id, restoredMemory);
        if (!updateResult.success) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to restore memory',
                },
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: restoredMemory,
        });

    } catch (error) {
        console.error('Restore memory API error:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Failed to restore memory',
            },
        }, { status: 500 });
    }
}
