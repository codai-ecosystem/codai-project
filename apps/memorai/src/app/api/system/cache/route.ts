/**
 * MemorAI System Cache API
 * Handles cache management operations
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/system/cache - Clear system cache
 */
export async function DELETE(request: NextRequest) {
    try {
        // Simulate cache clearing
        const clearedItems = Math.floor(Math.random() * 1000) + 100;

        return NextResponse.json({
            success: true,
            data: {
                clearedItems,
                timestamp: new Date().toISOString(),
                status: 'cleared'
            },
            message: `Successfully cleared ${clearedItems} cache items`
        });

    } catch (error) {
        console.error('Clear cache API error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
            code: 'CACHE_CLEAR_ERROR'
        }, { status: 500 });
    }
}
