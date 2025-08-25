import { NextRequest, NextResponse } from 'next/server';
import { UpdateMemorySchema, sanitizeInput } from '../../../../lib/validation';
import { vectorOperations } from '../../../../lib/vector-operations';
import { cbdClient } from '@/lib/cbd-client';
import { ApiResponse, Memory, UpdateMemoryRequest } from '../../../../types/memory';
import { authenticateAPI, getAuthenticatedUserId, addSecurityHeaders } from '../../../../middleware/auth';

interface RouteParams {
    params: {
        id: string;
    };
}

// GET /api/memories/[id] - Get specific memory
export async function GET(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        // 🔐 Authentication check
        const authResponse = authenticateAPI(request);
        if (authResponse) return addSecurityHeaders(authResponse);

        const { id } = await params;
        const userId = getAuthenticatedUserId(request);

        if (!id) {
            return addSecurityHeaders(NextResponse.json({
                error: 'Memory ID is required',
            }, { status: 400 }));
        }

        let memory: Memory | null = null;

        // For tests: get from test database
        if (process.env.NODE_ENV === 'test') {
            const testDb = (await import('../../../../tests/utils/test-database')).testDb;
            memory = testDb.getMemoryById(id);
        } else {
            // Get memory from CBD using findById (which checks in-memory store)
            memory = await cbdClient.findById('memories', id);
        }

        if (!memory) {
            return addSecurityHeaders(NextResponse.json({
                error: 'Memory not found',
            }, { status: 404 }));
        }

        // Check if memory belongs to current user
        if (memory.userId !== userId) {
            return addSecurityHeaders(NextResponse.json({
                error: 'Access denied',
            }, { status: 403 }));
        }

        // Increment view count
        const updatedMemory = { ...memory, viewCount: (memory.viewCount || 0) + 1 };
        
        // For tests: update in test database
        if (process.env.NODE_ENV === 'test') {
            const testDb = (await import('../../../../tests/utils/test-database')).testDb;
            testDb.data.memories = testDb.data.memories.map(m => 
                m.id === id ? updatedMemory : m
            );
        }

        return addSecurityHeaders(NextResponse.json(updatedMemory));

    } catch (error) {
        console.error('Error fetching memory:', error);
        return addSecurityHeaders(NextResponse.json({
            error: 'Failed to fetch memory',
        }, { status: 500 }));
    }
}

// PUT /api/memories/[id] - Update memory
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse<Memory>>> {
    try {
        // 🔐 Authentication check
        const authResponse = authenticateAPI(request);
        if (authResponse) return addSecurityHeaders(authResponse);

        const { id } = await params;
        const userId = getAuthenticatedUserId(request);
        const body: UpdateMemoryRequest = await request.json();

        if (!id) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Memory ID is required',
                },
            }, { status: 400 }));
        }

        // Validate input
        const validationResult = UpdateMemorySchema.safeParse(body);
        if (!validationResult.success) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid memory data',
                    details: validationResult.error.errors,
                },
            }, { status: 400 }));
        }

        let existingMemory: Memory | null = null;

        // For tests: get from test database
        if (process.env.NODE_ENV === 'test') {
            const testDb = (await import('../../../../tests/utils/test-database')).testDb;
            existingMemory = testDb.getMemoryById(id);
        } else {
            // Get existing memory using findById (which checks in-memory store)
            existingMemory = await cbdClient.findById('memories', id);
        }

        if (!existingMemory) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Memory not found',
                },
            }, { status: 404 }));
        }

        // Check if memory belongs to current user
        if (existingMemory.userId !== userId) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                },
            }, { status: 403 }));
        }

        // Prepare updated data
        const { content, title, category, tags } = validationResult.data;
        const updatedData: Partial<Memory> = {};

        if (content !== undefined) {
            const sanitizedContent = sanitizeInput(content);
            if (sanitizedContent.trim().length === 0) {
                return NextResponse.json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Memory content cannot be empty',
                    },
                }, { status: 400 });
            }
            updatedData.content = sanitizedContent;
        }

        if (title !== undefined) {
            updatedData.title = title ? sanitizeInput(title) : undefined;
        }

        if (category !== undefined) {
            updatedData.category = category ? sanitizeInput(category) : undefined;
        }

        if (tags !== undefined) {
            updatedData.tags = tags.map(tag => sanitizeInput(tag));
        }

        // Create updated memory object
        const updatedMemory: Memory = {
            ...existingMemory,
            ...updatedData,
            updatedAt: new Date().toISOString(),
        };

        // Update memory with new vector if content changed
        const result = await vectorOperations.updateMemoryVector(updatedMemory);

        if (!result.success) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'UPDATE_ERROR',
                    message: result.error || 'Failed to update memory',
                },
            }, { status: 500 }));
        }

        // For tests: update in test database
        if (process.env.NODE_ENV === 'test') {
            const testDb = (await import('../../../../tests/utils/test-database')).testDb;
            testDb.data.memories = testDb.data.memories.map(m => 
                m.id === id ? updatedMemory : m
            );
        }

        return addSecurityHeaders(NextResponse.json({
            success: true,
            data: updatedMemory,
            meta: {
                timestamp: new Date().toISOString(),
            },
        }));

    } catch (error) {
        console.error('Error updating memory:', error);
        return addSecurityHeaders(NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to update memory',
            },
        }, { status: 500 }));
    }
}

// DELETE /api/memories/[id] - Delete memory
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
    try {
        // 🔐 Authentication check
        const authResponse = authenticateAPI(request);
        if (authResponse) return addSecurityHeaders(authResponse);

        const { id } = await params;
        const userId = getAuthenticatedUserId(request);

        if (!id) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Memory ID is required',
                },
            }, { status: 400 }));
        }

        let existingMemory: Memory | null = null;

        // For tests: get from test database
        if (process.env.NODE_ENV === 'test') {
            const testDb = (await import('../../../../tests/utils/test-database')).testDb;
            existingMemory = testDb.getMemoryById(id);
        } else {
            // Get existing memory to check ownership using findById
            existingMemory = await cbdClient.findById('memories', id);
        }

        if (!existingMemory) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Memory not found',
                },
            }, { status: 404 }));
        }

        // Check if memory belongs to current user
        if (existingMemory.userId !== userId) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                },
            }, { status: 403 }));
        }

        // For tests: delete from test database
        if (process.env.NODE_ENV === 'test') {
            const testDb = (await import('../../../../tests/utils/test-database')).testDb;
            testDb.data.memories = testDb.data.memories.filter(m => m.id !== id);
        } else {
            // Delete memory and its vector
            const result = await vectorOperations.deleteMemoryVector(id);

            if (!result.success) {
                return addSecurityHeaders(NextResponse.json({
                    success: false,
                    error: {
                        code: 'DELETE_ERROR',
                        message: result.error || 'Failed to delete memory',
                    },
                }, { status: 500 }));
            }
        }

        return addSecurityHeaders(NextResponse.json({
            success: true,
            data: { deleted: true },
            meta: {
                timestamp: new Date().toISOString(),
            },
        }, { status: 204 })); // 204 No Content is standard for successful DELETE

    } catch (error) {
        console.error('Error deleting memory:', error);
        return addSecurityHeaders(NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to delete memory',
            },
        }, { status: 500 }));
    }
}
