/**
 * MemorAI System Info API
 * GET /api/system/info - Get system information
 */

import { NextRequest, NextResponse } from 'next/server';
import cbdClient from '../../../../lib/cbd-client';
import { ApiResponse } from '../../../../types/memory';

interface SystemInfo {
    service: string;
    version: string;
    status: string;
    uptime: number;
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    database: {
        status: string;
        collections: string[];
        totalDocuments: number;
    };
    features: string[];
    endpoints: string[];
}

export async function GET(
    request: NextRequest
): Promise<NextResponse<ApiResponse<SystemInfo>>> {
    try {
        // Get process memory info
        const memoryUsage = process.memoryUsage();
        const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

        // Get uptime in seconds
        const uptime = Math.floor(process.uptime());

        // Get database info
        let databaseInfo = {
            status: 'unknown',
            collections: [],
            totalDocuments: 0
        };

        try {
            // Try to get database statistics
            const isHealthy = await cbdClient.healthCheck();
            if (isHealthy) {
                databaseInfo.status = 'connected';
                databaseInfo.collections = ['memories', 'analytics', 'cache'];

                // Try to get memory count
                const memoriesResult = await cbdClient.findDocuments('memories', {});
                if (memoriesResult.success && memoriesResult.data) {
                    databaseInfo.totalDocuments = memoriesResult.data.length;
                }
            }
        } catch (error) {
            console.warn('Could not fetch database info:', error);
            databaseInfo.status = 'disconnected';
        }

        const systemInfo: SystemInfo = {
            service: 'MemorAI',
            version: '1.0.0',
            status: 'running',
            uptime,
            memory: {
                used: memoryUsedMB,
                total: memoryTotalMB,
                percentage: Math.round((memoryUsedMB / memoryTotalMB) * 100)
            },
            database: databaseInfo,
            features: [
                'memory_management',
                'context_storage',
                'intelligent_recall',
                'vector_search',
                'analytics',
                'batch_operations',
                'archive_restore'
            ],
            endpoints: [
                '/api/health',
                '/api/memories',
                '/api/search',
                '/api/analytics',
                '/api/system/info',
                '/api/system/cache/clear'
            ]
        };

        return NextResponse.json({
            success: true,
            data: systemInfo,
        });

    } catch (error) {
        console.error('Error getting system info:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to get system information',
            },
        }, { status: 500 });
    }
}
