/**
 * Memory Intelligence API Endpoint
 * Phase 6.2.4: Memory Intelligence Engine
 * 
 * Provides comprehensive AI-powered memory analysis and intelligence:
 * - Individual memory intelligence analysis
 * - Batch memory analysis
 * - Global memory insights
 * - Intelligence reports
 * - Performance analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import MemoryIntelligenceService from '@/services/ai/MemoryIntelligenceService';

// Validation schemas
const IntelligenceOptionsSchema = z.object({
    includeRelationships: z.boolean().optional().default(true),
    includeInsights: z.boolean().optional().default(true),
    includeRecommendations: z.boolean().optional().default(true),
    includeAnalytics: z.boolean().optional().default(true),
    analysisDepth: z.enum(['basic', 'standard', 'comprehensive']).optional().default('standard'),
    timeWindow: z.string().optional().default('30d'),
    minConfidence: z.number().min(0).max(1).optional().default(0.5)
});

const SingleAnalysisSchema = z.object({
    memoryId: z.string().min(1, 'Memory ID is required'),
    options: IntelligenceOptionsSchema.optional()
});

const BatchAnalysisSchema = z.object({
    memoryIds: z.array(z.string()).min(1, 'At least one memory ID is required').max(50, 'Maximum 50 memories per batch'),
    options: IntelligenceOptionsSchema.optional()
});

const GlobalInsightsSchema = z.object({
    agentId: z.string().min(1, 'Agent ID is required'),
    options: IntelligenceOptionsSchema.optional()
});

// Response interfaces
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        timestamp: string;
        processingTime: number;
        cacheHit?: boolean;
        analysisDepth: string;
    };
}

// Initialize service
const intelligenceService = new MemoryIntelligenceService();

/**
 * POST /api/ai/memory-intelligence
 * Analyze individual memory intelligence
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    const startTime = Date.now();

    try {
        const body = await request.json();
        const validatedData = SingleAnalysisSchema.parse(body);

        const report = await intelligenceService.analyzeMemoryIntelligence(
            validatedData.memoryId,
            validatedData.options || {}
        );

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            data: report,
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime,
                analysisDepth: validatedData.options?.analysisDepth || 'standard'
            }
        });

    } catch (error) {
        console.error('Memory intelligence analysis failed:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
                metadata: {
                    timestamp: new Date().toISOString(),
                    processingTime: Date.now() - startTime,
                    analysisDepth: 'none'
                }
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to analyze memory intelligence',
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                analysisDepth: 'none'
            }
        }, { status: 500 });
    }
}

/**
 * PUT /api/ai/memory-intelligence
 * Batch analyze multiple memories
 */
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    const startTime = Date.now();

    try {
        const body = await request.json();
        const validatedData = BatchAnalysisSchema.parse(body);

        const reports = await intelligenceService.batchAnalyzeIntelligence(
            validatedData.memoryIds,
            validatedData.options || {}
        );

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            data: {
                reports,
                summary: {
                    totalRequested: validatedData.memoryIds.length,
                    totalAnalyzed: reports.length,
                    averageImportance: reports.reduce((sum, r) => sum + r.currentImportance, 0) / reports.length,
                    averagePredictedImportance: reports.reduce((sum, r) => sum + r.predictedImportance, 0) / reports.length,
                    totalRelationships: reports.reduce((sum, r) => sum + r.relationships.length, 0),
                    totalInsights: reports.reduce((sum, r) => sum + r.insights.length, 0)
                }
            },
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime,
                analysisDepth: validatedData.options?.analysisDepth || 'standard'
            }
        });

    } catch (error) {
        console.error('Batch memory intelligence analysis failed:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
                metadata: {
                    timestamp: new Date().toISOString(),
                    processingTime: Date.now() - startTime,
                    analysisDepth: 'none'
                }
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to perform batch analysis',
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                analysisDepth: 'none'
            }
        }, { status: 500 });
    }
}

/**
 * GET /api/ai/memory-intelligence
 * Get global memory insights and analytics
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    const startTime = Date.now();

    try {
        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get('agentId');
        const analysisDepth = searchParams.get('analysisDepth') as 'basic' | 'standard' | 'comprehensive' || 'standard';
        const timeWindow = searchParams.get('timeWindow') || '30d';
        const minConfidence = parseFloat(searchParams.get('minConfidence') || '0.5');

        if (!agentId) {
            return NextResponse.json({
                success: false,
                error: 'Agent ID is required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    processingTime: Date.now() - startTime,
                    analysisDepth: 'none'
                }
            }, { status: 400 });
        }

        const validatedData = GlobalInsightsSchema.parse({
            agentId,
            options: {
                analysisDepth,
                timeWindow,
                minConfidence,
                includeRelationships: true,
                includeInsights: true,
                includeRecommendations: true,
                includeAnalytics: true
            }
        });

        const insights = await intelligenceService.generateGlobalInsights(
            validatedData.agentId,
            validatedData.options || {}
        );

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            data: insights,
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime,
                analysisDepth
            }
        });

    } catch (error) {
        console.error('Global insights generation failed:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
                metadata: {
                    timestamp: new Date().toISOString(),
                    processingTime: Date.now() - startTime,
                    analysisDepth: 'none'
                }
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate global insights',
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                analysisDepth: 'none'
            }
        }, { status: 500 });
    }
}

/**
 * PATCH /api/ai/memory-intelligence
 * Update intelligence service configuration or clear cache
 */
export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    const startTime = Date.now();

    try {
        const body = await request.json();
        const { action, config } = body;

        let result: any = {};

        switch (action) {
            case 'clear_cache':
                intelligenceService.clearCache();
                result = { message: 'Cache cleared successfully' };
                break;

            case 'get_stats':
                result = {
                    cacheStats: intelligenceService.getCacheStats(),
                    serviceInfo: {
                        name: 'MemoryIntelligenceService',
                        version: '1.0.0',
                        capabilities: [
                            'memory_analysis',
                            'relationship_detection',
                            'importance_prediction',
                            'global_insights',
                            'batch_processing'
                        ]
                    }
                };
                break;

            default:
                return NextResponse.json({
                    success: false,
                    error: `Unknown action: ${action}. Available actions: clear_cache, get_stats`,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        processingTime: Date.now() - startTime,
                        analysisDepth: 'none'
                    }
                }, { status: 400 });
        }

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            data: result,
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime,
                analysisDepth: 'service_management'
            }
        });

    } catch (error) {
        console.error('Intelligence service management failed:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to manage intelligence service',
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                analysisDepth: 'none'
            }
        }, { status: 500 });
    }
}

/**
 * DELETE /api/ai/memory-intelligence
 * Reset intelligence service and clear all cached data
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    const startTime = Date.now();

    try {
        // Clear all cached intelligence data
        intelligenceService.clearCache();

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            data: {
                message: 'Intelligence service reset successfully',
                clearedCache: true,
                timestamp: new Date().toISOString()
            },
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime,
                analysisDepth: 'service_reset'
            }
        });

    } catch (error) {
        console.error('Intelligence service reset failed:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reset intelligence service',
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                analysisDepth: 'none'
            }
        }, { status: 500 });
    }
}
