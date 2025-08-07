/**
 * Auto-Categorization API Endpoints
 * Provides AI-powered content analysis and automatic categorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { categorizationService, type CategorizationRequest } from '../../../services/ai/CategorizationService';
import { z } from 'zod';

// Request validation schemas
const CategorizationRequestSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    existingTags: z.array(z.string()).optional(),
    existingProject: z.string().optional(),
    userPreferences: z.object({
        autoTagging: z.boolean().optional(),
        autoProjectAssignment: z.boolean().optional(),
        importanceAdjustment: z.number().min(-2).max(2).optional(),
        customRules: z.array(z.any()).optional()
    }).optional(),
    context: z.object({
        similarMemories: z.array(z.object({
            id: z.string(),
            tags: z.array(z.string()),
            project: z.string().optional(),
            importance: z.number()
        })).optional(),
        currentProject: z.string().optional(),
        recentTags: z.array(z.string()).optional()
    }).optional()
});

const BatchCategorizationRequestSchema = z.object({
    requests: z.array(CategorizationRequestSchema).min(1).max(50, 'Maximum 50 requests per batch')
});

const ApplyCategorizationSchema = z.object({
    memoryId: z.string().min(1, 'Memory ID is required'),
    suggestions: z.object({
        tags: z.array(z.string()),
        project: z.string().optional(),
        importance: z.number().min(1).max(10)
    })
});

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        timestamp: string;
        processingTime?: number;
        version: string;
    };
}

function createResponse<T>(
    data?: T,
    error?: string,
    status = 200,
    processingTime?: number
): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
        success: !error,
        ...(data && { data }),
        ...(error && { error }),
        metadata: {
            timestamp: new Date().toISOString(),
            ...(processingTime && { processingTime }),
            version: '1.0.0'
        }
    };

    return NextResponse.json(response, { status });
}

/**
 * POST /api/ai/categorize - Analyze and categorize content
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        const body = await request.json();

        // Validate request
        const validationResult = CategorizationRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return createResponse(
                null,
                `Validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
                400
            );
        }

        const categorizationRequest: CategorizationRequest = validationResult.data;

        // Perform categorization
        const result = await categorizationService.categorize(categorizationRequest);

        const processingTime = Date.now() - startTime;

        return createResponse(result, undefined, 200, processingTime);

    } catch (error) {
        console.error('Categorization API error:', error);
        const processingTime = Date.now() - startTime;

        return createResponse(
            null,
            error instanceof Error ? error.message : 'Internal server error',
            500,
            processingTime
        );
    }
}

/**
 * POST /api/ai/categorize/batch - Batch categorize multiple contents
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        const body = await request.json();

        // Validate batch request
        const validationResult = BatchCategorizationRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return createResponse(
                null,
                `Validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
                400
            );
        }

        const { requests } = validationResult.data;

        // Perform batch categorization
        const results = await categorizationService.batchCategorize(requests);

        const processingTime = Date.now() - startTime;

        return createResponse({
            results,
            summary: {
                totalRequests: requests.length,
                successfulResults: results.length,
                averageConfidence: results.reduce((sum, r) => sum + r.metadata.confidence, 0) / results.length,
                averageProcessingTime: results.reduce((sum, r) => sum + r.metadata.processingTime, 0) / results.length
            }
        }, undefined, 200, processingTime);

    } catch (error) {
        console.error('Batch categorization API error:', error);
        const processingTime = Date.now() - startTime;

        return createResponse(
            null,
            error instanceof Error ? error.message : 'Internal server error',
            500,
            processingTime
        );
    }
}

/**
 * GET /api/ai/categorize/stats - Get categorization statistics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        const { searchParams } = new URL(request.url);
        const includeImprovements = searchParams.get('include_improvements') === 'true';
        const cacheStats = searchParams.get('cache_stats') === 'true';

        // Get basic stats
        const stats = await categorizationService.getCategorizationStats();

        let improvements = undefined;
        if (includeImprovements) {
            improvements = await categorizationService.getSuggestedImprovements();
        }

        let cacheInfo = undefined;
        if (cacheStats) {
            cacheInfo = categorizationService.getCacheStats();
        }

        const processingTime = Date.now() - startTime;

        return createResponse({
            stats,
            ...(improvements && { improvements }),
            ...(cacheInfo && { cache: cacheInfo })
        }, undefined, 200, processingTime);

    } catch (error) {
        console.error('Categorization stats API error:', error);
        const processingTime = Date.now() - startTime;

        return createResponse(
            null,
            error instanceof Error ? error.message : 'Internal server error',
            500,
            processingTime
        );
    }
}

/**
 * PATCH /api/ai/categorize/apply - Apply categorization suggestions to a memory
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        const body = await request.json();

        // Validate apply request
        const validationResult = ApplyCategorizationSchema.safeParse(body);
        if (!validationResult.success) {
            return createResponse(
                null,
                `Validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
                400
            );
        }

        const { memoryId, suggestions } = validationResult.data;

        // Apply categorization
        const success = await categorizationService.applyCategorization(memoryId, suggestions);

        if (!success) {
            return createResponse(
                null,
                'Failed to apply categorization suggestions',
                500
            );
        }

        const processingTime = Date.now() - startTime;

        return createResponse({
            applied: true,
            memoryId,
            appliedSuggestions: suggestions
        }, undefined, 200, processingTime);

    } catch (error) {
        console.error('Apply categorization API error:', error);
        const processingTime = Date.now() - startTime;

        return createResponse(
            null,
            error instanceof Error ? error.message : 'Internal server error',
            500,
            processingTime
        );
    }
}

/**
 * DELETE /api/ai/categorize/cache - Clear categorization cache
 */
export async function DELETE(): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        // Clear cache
        categorizationService.clearCache();

        const processingTime = Date.now() - startTime;

        return createResponse({
            cleared: true,
            clearedAt: new Date().toISOString()
        }, undefined, 200, processingTime);

    } catch (error) {
        console.error('Clear cache API error:', error);
        const processingTime = Date.now() - startTime;

        return createResponse(
            null,
            error instanceof Error ? error.message : 'Internal server error',
            500,
            processingTime
        );
    }
}
