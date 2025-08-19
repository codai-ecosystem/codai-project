/**
 * MemorAI Batch Memory Operations API
 * Handles batch create, update, delete operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import cbdClient from '@/lib/cbd-client';

// Batch operation schemas
const BatchCreateSchema = z.object({
    type: z.literal('create'),
    data: z.object({
        content: z.string().min(1, 'Content is required'),
        agentId: z.string().min(1, 'Agent ID is required'),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
        metadata: z.record(z.any()).optional()
    })
});

const BatchUpdateSchema = z.object({
    type: z.literal('update'),
    id: z.string().min(1, 'Memory ID is required'),
    data: z.object({
        content: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        metadata: z.record(z.any()).optional()
    })
});

const BatchDeleteSchema = z.object({
    type: z.literal('delete'),
    id: z.string().min(1, 'Memory ID is required')
});

const BatchOperationSchema = z.discriminatedUnion('type', [
    BatchCreateSchema,
    BatchUpdateSchema,
    BatchDeleteSchema
]);

const BatchRequestSchema = z.object({
    operations: z.array(BatchOperationSchema).min(1).max(100, 'Maximum 100 operations per batch')
});

/**
 * POST /api/memories/batch - Execute batch memory operations
 */
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate batch request
        const validationResult = BatchRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                success: false,
                error: 'Invalid batch request',
                details: validationResult.error.format(),
                code: 'VALIDATION_ERROR'
            }, { status: 400 });
        }

        const { operations } = validationResult.data;
        const results = [];

        // Process each operation
        for (const operation of operations) {
            try {
                let result: any;

                switch (operation.type) {
                    case 'create':
                        const createData = {
                            ...operation.data,
                            timestamp: new Date().toISOString(),
                            id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                        };

                        await cbdClient.storeDocument('memories', createData);
                        result = {
                            operation: 'create',
                            success: true,
                            data: createData
                        };
                        break;

                    case 'update':
                        // Get existing memory first
                        const existingMemory = await cbdClient.findById('memories', operation.id);
                        if (!existingMemory) {
                            result = {
                                operation: 'update',
                                success: false,
                                error: 'Memory not found',
                                id: operation.id
                            };
                            break;
                        }

                        const updateData = {
                            ...existingMemory,
                            ...operation.data,
                            updatedAt: new Date().toISOString()
                        };

                        await cbdClient.updateDocument('memories', operation.id, updateData);
                        result = {
                            operation: 'update',
                            success: true,
                            data: updateData
                        };
                        break;

                    case 'delete':
                        await cbdClient.deleteDocument('memories', operation.id);
                        result = {
                            operation: 'delete',
                            success: true,
                            id: operation.id
                        };
                        break;
                }

                results.push(result);
            } catch (operationError) {
                // Handle individual operation errors
                results.push({
                    operation: operation.type,
                    success: false,
                    error: operationError instanceof Error ? operationError.message : 'Operation failed',
                    ...(operation.type !== 'create' && { id: (operation as any).id })
                });
            }
        }

        // Calculate success/failure stats
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        return NextResponse.json({
            success: true,
            data: {
                results,
                summary: {
                    total: operations.length,
                    successful: successCount,
                    failed: failureCount,
                    successRate: (successCount / operations.length) * 100
                }
            },
            message: `Batch operation completed: ${successCount} successful, ${failureCount} failed`
        });

    } catch (error) {
        console.error('Batch memories API error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
            code: 'BATCH_ERROR'
        }, { status: 500 });
    }
}
