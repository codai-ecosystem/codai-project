import { NextRequest, NextResponse } from 'next/server';
import { cbdClient } from '@/lib/cbd-client';
import { memoryCategorizationService } from '@/lib/categorization';
import { Memory } from '@/types/memory';
import { sanitizeInput } from '@/lib/validation';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const userId = request.headers.get('x-user-id') || 'anonymous';

        switch (action) {
            case 'list':
                // Return all available categories
                const categories = memoryCategorizationService.getAvailableCategories();
                return NextResponse.json({
                    success: true,
                    data: categories,
                    meta: {
                        timestamp: new Date().toISOString(),
                        userId,
                        total: categories.length
                    }
                });

            case 'stats':
                // Get category statistics for user's memories
                try {
                    const memoriesResponse = await cbdClient.findDocuments('memories', { userId });
                    const memories = memoriesResponse.data || [];
                    const stats = memoryCategorizationService.getCategoryStats(memories);
                    return NextResponse.json({
                        success: true,
                        data: stats,
                        meta: {
                            timestamp: new Date().toISOString(),
                            userId,
                            totalMemories: memories.length
                        }
                    });
                } catch (error) {
                    console.error('Error getting category stats:', error);
                    return NextResponse.json({
                        success: false,
                        error: 'Failed to get category statistics',
                        meta: { timestamp: new Date().toISOString() }
                    }, { status: 500 });
                }

            case 'suggestions':
                // Get recategorization suggestions
                try {
                    const memoriesResponse = await cbdClient.findDocuments('memories', { userId });
                    const memories = memoriesResponse.data || [];
                    const suggestions = memoryCategorizationService.suggestRecategorization(memories);
                    return NextResponse.json({
                        success: true,
                        data: suggestions,
                        meta: {
                            timestamp: new Date().toISOString(),
                            userId,
                            totalSuggestions: suggestions.length
                        }
                    });
                } catch (error) {
                    console.error('Error getting recategorization suggestions:', error);
                    return NextResponse.json({
                        success: false,
                        error: 'Failed to get categorization suggestions',
                        meta: { timestamp: new Date().toISOString() }
                    }, { status: 500 });
                }

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action. Use: list, stats, or suggestions',
                    meta: { timestamp: new Date().toISOString() }
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Categories API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            meta: { timestamp: new Date().toISOString() }
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, memoryId, category, applyToAll } = body;
        const userId = request.headers.get('x-user-id') || 'anonymous';

        switch (action) {
            case 'categorize':
                // Categorize a specific memory
                if (!memoryId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Memory ID is required for categorization',
                        meta: { timestamp: new Date().toISOString() }
                    }, { status: 400 });
                }

                try {
                    const memoryResponse = await cbdClient.getDocument('memories', memoryId);
                    const memory = memoryResponse.data;
                    if (!memory || memory.userId !== userId) {
                        return NextResponse.json({
                            success: false,
                            error: 'Memory not found',
                            meta: { timestamp: new Date().toISOString() }
                        }, { status: 404 });
                    }

                    // Auto-categorize or use provided category
                    let newCategory = category;
                    if (!newCategory) {
                        newCategory = memoryCategorizationService.categorizeMemory(memory);
                    }

                    // Generate suggested tags
                    const suggestedTags = memoryCategorizationService.generateTags(memory);

                    // Update memory with new category and tags
                    const updatedMemory = {
                        ...memory,
                        category: sanitizeInput(newCategory),
                        tags: [...(memory.tags || []), ...suggestedTags].filter((tag, index, arr) => arr.indexOf(tag) === index), // Remove duplicates
                        updatedAt: new Date().toISOString()
                    };

                    await cbdClient.updateDocument('memories', memoryId, updatedMemory);

                    return NextResponse.json({
                        success: true,
                        data: {
                            memory: updatedMemory,
                            previousCategory: memory.category,
                            suggestedTags
                        },
                        meta: {
                            timestamp: new Date().toISOString(),
                            userId,
                            action: 'categorize'
                        }
                    });
                } catch (error) {
                    console.error('Error categorizing memory:', error);
                    return NextResponse.json({
                        success: false,
                        error: 'Failed to categorize memory',
                        meta: { timestamp: new Date().toISOString() }
                    }, { status: 500 });
                }

            case 'auto_categorize_all':
                // Auto-categorize all uncategorized memories
                try {
                    const memoriesResponse = await cbdClient.findDocuments('memories', { userId });
                    const memories = memoriesResponse.data || [];
                    const uncategorizedMemories = memories.filter((m: any) =>
                        !m.category || m.category === 'general' || m.category === 'other'
                    );

                    const results = [];
                    for (const memory of uncategorizedMemories) {
                        const newCategory = memoryCategorizationService.categorizeMemory(memory);
                        const suggestedTags = memoryCategorizationService.generateTags(memory);

                        if (newCategory !== 'general') {
                            const updatedMemory = {
                                ...memory,
                                category: newCategory,
                                tags: [...(memory.tags || []), ...suggestedTags].filter((tag, index, arr) => arr.indexOf(tag) === index),
                                updatedAt: new Date().toISOString()
                            };

                            await cbdClient.updateDocument('memories', memory.id, updatedMemory);
                            results.push({
                                memoryId: memory.id,
                                previousCategory: memory.category || 'none',
                                newCategory,
                                suggestedTags
                            });
                        }
                    }

                    return NextResponse.json({
                        success: true,
                        data: {
                            categorizedCount: results.length,
                            totalMemories: memories.length,
                            results
                        },
                        meta: {
                            timestamp: new Date().toISOString(),
                            userId,
                            action: 'auto_categorize_all'
                        }
                    });
                } catch (error) {
                    console.error('Error auto-categorizing memories:', error);
                    return NextResponse.json({
                        success: false,
                        error: 'Failed to auto-categorize memories',
                        meta: { timestamp: new Date().toISOString() }
                    }, { status: 500 });
                }

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action. Use: categorize or auto_categorize_all',
                    meta: { timestamp: new Date().toISOString() }
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Categories POST API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            meta: { timestamp: new Date().toISOString() }
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { memoryIds, category } = body;
        const userId = request.headers.get('x-user-id') || 'anonymous';

        if (!memoryIds || !Array.isArray(memoryIds) || memoryIds.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Memory IDs array is required',
                meta: { timestamp: new Date().toISOString() }
            }, { status: 400 });
        }

        if (!category) {
            return NextResponse.json({
                success: false,
                error: 'Category is required',
                meta: { timestamp: new Date().toISOString() }
            }, { status: 400 });
        }

        try {
            const results = [];
            for (const memoryId of memoryIds) {
                const memoryResponse = await cbdClient.getDocument('memories', memoryId);
                const memory = memoryResponse.data;
                if (memory && memory.userId === userId) {
                    const updatedMemory = {
                        ...memory,
                        category: sanitizeInput(category),
                        updatedAt: new Date().toISOString()
                    };

                    await cbdClient.updateDocument('memories', memoryId, updatedMemory);
                    results.push({
                        memoryId,
                        previousCategory: memory.category,
                        newCategory: category
                    });
                }
            }

            return NextResponse.json({
                success: true,
                data: {
                    updatedCount: results.length,
                    results
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    userId,
                    action: 'bulk_categorize'
                }
            });
        } catch (error) {
            console.error('Error bulk categorizing memories:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to bulk categorize memories',
                meta: { timestamp: new Date().toISOString() }
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Categories PUT API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            meta: { timestamp: new Date().toISOString() }
        }, { status: 500 });
    }
}
