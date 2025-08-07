import { NextRequest, NextResponse } from 'next/server';
import { memoraiMCPClient } from '../../../../utils/memorai-mcp-client';
import { ApiResponse } from '../../../../types/memory';

// Mock user ID - will be replaced with proper auth
const MOCK_USER_ID = 'user-12345';

interface ImportMemory {
    structuredKey?: string;
    content: string;
    agentId: string;
    importance?: number;
    project?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
}

interface ImportRequest {
    memories: ImportMemory[];
    options?: {
        skipDuplicates?: boolean;
        updateExisting?: boolean;
        preserveTimestamps?: boolean;
    };
}

// POST /api/memories/import - Import memories
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
    try {
        const body: ImportRequest = await request.json();

        if (!body || !body.memories || !Array.isArray(body.memories)) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid import data. Expected array of memories.',
                },
            }, { status: 400 });
        }

        const { memories, options = {} } = body;
        const {
            skipDuplicates = true,
            updateExisting = false,
            preserveTimestamps = false
        } = options;

        if (memories.length === 0) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'No memories provided for import.',
                },
            }, { status: 400 });
        }

        if (memories.length > 1000) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Too many memories. Maximum 1000 memories per import.',
                },
            }, { status: 400 });
        }

        // Validate each memory
        const invalidMemories: any[] = [];
        const validMemories: ImportMemory[] = [];

        memories.forEach((memory, index) => {
            if (!memory.content || typeof memory.content !== 'string' || memory.content.trim().length === 0) {
                invalidMemories.push({ index, error: 'Content is required and cannot be empty' });
                return;
            }

            if (!memory.agentId || typeof memory.agentId !== 'string') {
                invalidMemories.push({ index, error: 'Agent ID is required' });
                return;
            }

            validMemories.push(memory);
        });

        if (invalidMemories.length > 0) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Some memories have validation errors',
                    details: invalidMemories
                },
            }, { status: 400 });
        }

        // Get existing memories for duplicate checking
        let existingMemories: any[] = [];
        if (skipDuplicates || updateExisting) {
            try {
                existingMemories = await memoraiMCPClient.getAllMemories();
            } catch (error) {
                console.warn('Could not fetch existing memories for duplicate checking:', error);
            }
        }

        // Process imports
        const results = {
            imported: 0,
            updated: 0,
            skipped: 0,
            errors: [] as any[]
        };

        for (const memory of validMemories) {
            try {
                // Check for duplicates (by content similarity)
                const isDuplicate = existingMemories.some(existing =>
                    existing.content.trim().toLowerCase() === memory.content.trim().toLowerCase() &&
                    existing.agentId === memory.agentId
                );

                if (isDuplicate) {
                    if (skipDuplicates) {
                        results.skipped++;
                        continue;
                    } else if (updateExisting) {
                        // Find existing memory and update it
                        const existingMemory = existingMemories.find(existing =>
                            existing.content.trim().toLowerCase() === memory.content.trim().toLowerCase() &&
                            existing.agentId === memory.agentId
                        );

                        if (existingMemory) {
                            // Update existing memory by recreating it with new metadata
                            await memoraiMCPClient.addMemory(
                                existingMemory.content,
                                memory.agentId,
                                {
                                    importance: memory.importance || existingMemory.importance,
                                    project: memory.project || existingMemory.project,
                                    tags: memory.tags || existingMemory.tags
                                }
                            );
                            results.updated++;
                            continue;
                        }
                    }
                }

                // Create new memory via MCP
                await memoraiMCPClient.addMemory(
                    memory.content,
                    memory.agentId,
                    {
                        importance: memory.importance || 5,
                        project: memory.project,
                        tags: memory.tags || []
                    }
                );
                results.imported++;

            } catch (error) {
                console.error('Error importing memory:', error);
                results.errors.push({
                    content: memory.content?.substring(0, 50) + '...',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalProcessed: validMemories.length,
                    imported: results.imported,
                    updated: results.updated,
                    skipped: results.skipped,
                    errors: results.errors.length
                },
                details: results.errors.length > 0 ? { errors: results.errors } : undefined
            },
            meta: {
                timestamp: new Date().toISOString(),
                options: { skipDuplicates, updateExisting, preserveTimestamps }
            },
        }, { status: 200 });

    } catch (error) {
        console.error('Error importing memories:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'IMPORT_ERROR',
                message: 'Failed to import memories',
            },
        }, { status: 500 });
    }
}
