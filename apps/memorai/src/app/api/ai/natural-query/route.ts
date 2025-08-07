/**
 * Natural Language Query API Endpoints
 * Provides chat-like interface for querying memories using natural language
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryProcessorService, type ConversationContext } from '../../../../services/ai/QueryProcessorService';
import { z } from 'zod';

// Request validation schemas
const NaturalQueryRequestSchema = z.object({
    query: z.string().min(1, 'Query is required').max(500, 'Query too long'),
    sessionId: z.string().optional(),
    context: z.object({
        currentTopic: z.string().optional(),
        userPreferences: z.object({
            defaultSortBy: z.string().optional(),
            preferredFormats: z.array(z.string()).optional(),
            languagePreference: z.enum(['en', 'ro']).optional()
        }).optional(),
        activeFilters: z.object({
            tags: z.array(z.string()).optional(),
            project: z.string().optional(),
            importance: z.object({
                min: z.number().optional(),
                max: z.number().optional()
            }).optional(),
            dateRange: z.object({
                start: z.string().optional(),
                end: z.string().optional()
            }).optional(),
            contentType: z.array(z.string()).optional(),
            sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
            complexity: z.enum(['simple', 'medium', 'complex']).optional(),
            language: z.string().optional(),
            hasAttachments: z.boolean().optional(),
            excludeTags: z.array(z.string()).optional(),
            excludeProjects: z.array(z.string()).optional()
        }).optional()
    }).optional(),
    options: z.object({
        includeProcessingDetails: z.boolean().optional(),
        includeAlternatives: z.boolean().optional(),
        maxResults: z.number().min(1).max(100).optional(),
        responseFormat: z.enum(['detailed', 'summary', 'minimal']).optional()
    }).optional()
});

const ChatSessionRequestSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    action: z.enum(['create', 'get', 'update', 'delete'])
});

const BatchQueryRequestSchema = z.object({
    queries: z.array(z.object({
        query: z.string().min(1),
        sessionId: z.string().optional(),
        context: z.any().optional()
    })).min(1).max(10, 'Maximum 10 queries per batch')
});

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        timestamp: string;
        processingTime?: number;
        version: string;
        queryId?: string;
    };
}

function createResponse<T>(
    data?: T,
    error?: string,
    status = 200,
    processingTime?: number,
    queryId?: string
): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
        success: !error,
        ...(data && { data }),
        ...(error && { error }),
        metadata: {
            timestamp: new Date().toISOString(),
            ...(processingTime && { processingTime }),
            ...(queryId && { queryId }),
            version: '1.0.0'
        }
    };

    return NextResponse.json(response, { status });
}

/**
 * POST /api/ai/natural-query - Process natural language query
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    const queryId = `nlq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        const body = await request.json();

        // Validate request
        const validationResult = NaturalQueryRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return createResponse(
                null,
                `Validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
                400,
                Date.now() - startTime,
                queryId
            );
        }

        const { query, sessionId, context, options } = validationResult.data;

        // Process the natural language query
        const processedQuery = await queryProcessorService.processQuery(
            query,
            sessionId,
            context as Partial<ConversationContext>
        );

        // Execute the query
        const queryResponse = await queryProcessorService.executeQuery(processedQuery);

        // Format response based on requested format
        const responseFormat = options?.responseFormat || 'detailed';
        let formattedData;

        switch (responseFormat) {
            case 'minimal':
                formattedData = {
                    results: queryResponse.results.slice(0, options?.maxResults || 10),
                    totalFound: queryResponse.summary.totalFound,
                    query: processedQuery.naturalLanguageQuery.originalQuery
                };
                break;

            case 'summary':
                formattedData = {
                    results: queryResponse.results.slice(0, options?.maxResults || 20),
                    summary: queryResponse.summary,
                    insights: queryResponse.insights,
                    relatedQueries: queryResponse.relatedQueries.slice(0, 3)
                };
                break;

            default: // detailed
                formattedData = {
                    results: queryResponse.results.slice(0, options?.maxResults || 20),
                    summary: queryResponse.summary,
                    insights: queryResponse.insights,
                    relatedQueries: queryResponse.relatedQueries,
                    ...(options?.includeProcessingDetails && {
                        processingDetails: {
                            naturalLanguageQuery: processedQuery.naturalLanguageQuery,
                            searchParameters: processedQuery.searchParameters,
                            suggestions: processedQuery.suggestions,
                            metadata: processedQuery.metadata
                        }
                    }),
                    ...(options?.includeAlternatives && {
                        alternatives: processedQuery.suggestions.alternativeQueries
                    })
                };
                break;
        }

        const processingTime = Date.now() - startTime;

        return createResponse(formattedData, undefined, 200, processingTime, queryId);

    } catch (error) {
        console.error('Natural query API error:', error);
        const processingTime = Date.now() - startTime;

        return createResponse(
            null,
            error instanceof Error ? error.message : 'Internal server error',
            500,
            processingTime,
            queryId
        );
    }
}

/**
 * GET /api/ai/natural-query - Get query suggestions and help
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const sessionId = searchParams.get('sessionId');

        switch (action) {
            case 'suggestions':
                // Return query suggestions
                const suggestions = {
                    commonQueries: [
                        "Show me my recent notes",
                        "Find code examples for React",
                        "What did I learn about TypeScript?",
                        "Show important tasks from last week",
                        "Find documentation about APIs",
                        "Search for ideas tagged as innovation"
                    ],
                    queryTemplates: [
                        {
                            template: "Find {topic} from {timeframe}",
                            example: "Find React components from last month",
                            description: "Search for specific topics within a time range"
                        },
                        {
                            template: "Show {contentType} tagged as {tag}",
                            example: "Show code tagged as performance",
                            description: "Filter by content type and tags"
                        },
                        {
                            template: "What did I save about {topic}?",
                            example: "What did I save about machine learning?",
                            description: "Natural question format for topic search"
                        },
                        {
                            template: "List {importance} items in {project}",
                            example: "List important items in MemorAI project",
                            description: "Project-specific search with importance filter"
                        }
                    ],
                    helpTips: [
                        "Use natural language - ask questions as you would to a person",
                        "Be specific about time ranges: 'last week', 'this month', 'yesterday'",
                        "Mention projects: 'in MemorAI project', 'from CODAI'",
                        "Use hashtags for tags: '#react #typescript'",
                        "Specify content types: 'code', 'notes', 'tasks', 'ideas'",
                        "Ask for similar content: 'similar to my React component notes'"
                    ]
                };

                return createResponse(suggestions, undefined, 200, Date.now() - startTime);

            case 'session':
                if (!sessionId) {
                    return createResponse(null, 'Session ID required', 400);
                }

                // Get session statistics
                const stats = queryProcessorService.getConversationStats();
                return createResponse({
                    sessionStats: stats,
                    sessionId: sessionId
                }, undefined, 200, Date.now() - startTime);

            case 'examples':
                // Return example queries with expected results
                const examples = {
                    beginner: [
                        {
                            query: "Show my notes",
                            description: "Basic search for all notes",
                            expectedResult: "Returns all saved notes"
                        },
                        {
                            query: "Find React code",
                            description: "Search for React-related content",
                            expectedResult: "Returns code snippets and notes about React"
                        }
                    ],
                    intermediate: [
                        {
                            query: "Show important tasks from last week",
                            description: "Filtered search with time range and importance",
                            expectedResult: "Returns high-priority tasks from the past week"
                        },
                        {
                            query: "Find documentation tagged as API",
                            description: "Content type and tag filtering",
                            expectedResult: "Returns documentation specifically about APIs"
                        }
                    ],
                    advanced: [
                        {
                            query: "What patterns do I see in my React components?",
                            description: "Analytical query requesting pattern analysis",
                            expectedResult: "Returns analysis of common patterns in React code"
                        },
                        {
                            query: "Show me everything similar to my TypeScript interface definitions",
                            description: "Semantic similarity search",
                            expectedResult: "Returns content semantically similar to TypeScript interfaces"
                        }
                    ]
                };

                return createResponse(examples, undefined, 200, Date.now() - startTime);

            default:
                // Return general help information
                const help = {
                    description: "Natural Language Query Interface for MemorAI",
                    version: "1.0.0",
                    capabilities: [
                        "Natural language understanding",
                        "Intent recognition",
                        "Entity extraction",
                        "Context-aware search",
                        "Conversation memory",
                        "Query suggestions",
                        "Result analysis"
                    ],
                    supportedLanguages: ["English", "Romanian"],
                    queryTypes: [
                        "Search queries",
                        "Filter queries",
                        "Analysis queries",
                        "List queries",
                        "Comparison queries"
                    ]
                };

                return createResponse(help, undefined, 200, Date.now() - startTime);
        }

    } catch (error) {
        console.error('Natural query help API error:', error);
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
 * PUT /api/ai/natural-query - Batch process multiple queries
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        const body = await request.json();

        // Validate batch request
        const validationResult = BatchQueryRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return createResponse(
                null,
                `Validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
                400
            );
        }

        const { queries } = validationResult.data;

        // Process all queries
        const results = [];
        for (const queryRequest of queries) {
            try {
                const processedQuery = await queryProcessorService.processQuery(
                    queryRequest.query,
                    queryRequest.sessionId,
                    queryRequest.context as Partial<ConversationContext>
                );

                const queryResponse = await queryProcessorService.executeQuery(processedQuery);

                results.push({
                    query: queryRequest.query,
                    success: true,
                    results: queryResponse.results.slice(0, 10), // Limit results for batch
                    summary: queryResponse.summary,
                    confidence: processedQuery.naturalLanguageQuery.confidence
                });
            } catch (error) {
                results.push({
                    query: queryRequest.query,
                    success: false,
                    error: error instanceof Error ? error.message : 'Query processing failed'
                });
            }
        }

        const processingTime = Date.now() - startTime;

        return createResponse({
            results,
            summary: {
                totalQueries: queries.length,
                successfulQueries: results.filter(r => r.success).length,
                failedQueries: results.filter(r => !r.success).length,
                averageConfidence: results
                    .filter(r => r.success && r.confidence)
                    .reduce((sum, r) => sum + r.confidence!, 0) /
                    results.filter(r => r.success && r.confidence).length || 0
            }
        }, undefined, 200, processingTime);

    } catch (error) {
        console.error('Batch natural query API error:', error);
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
 * PATCH /api/ai/natural-query - Update conversation context
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        const body = await request.json();

        // Validate session request
        const validationResult = ChatSessionRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return createResponse(
                null,
                `Validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
                400
            );
        }

        const { sessionId, action } = validationResult.data;

        switch (action) {
            case 'create':
                // Create new session context
                await queryProcessorService.processQuery('', sessionId);
                return createResponse({
                    sessionId,
                    created: true,
                    timestamp: new Date().toISOString()
                }, undefined, 201, Date.now() - startTime);

            case 'get':
                // Get session statistics
                const stats = queryProcessorService.getConversationStats();
                return createResponse({
                    sessionId,
                    stats
                }, undefined, 200, Date.now() - startTime);

            case 'delete':
                // Clear session history
                queryProcessorService.clearConversationHistory(sessionId);
                return createResponse({
                    sessionId,
                    cleared: true,
                    timestamp: new Date().toISOString()
                }, undefined, 200, Date.now() - startTime);

            default:
                return createResponse(null, 'Invalid action', 400);
        }

    } catch (error) {
        console.error('Session management API error:', error);
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
 * DELETE /api/ai/natural-query - Clear all conversation history
 */
export async function DELETE(): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        // Clear all conversation history
        queryProcessorService.clearConversationHistory();

        const processingTime = Date.now() - startTime;

        return createResponse({
            cleared: true,
            clearedAt: new Date().toISOString(),
            message: 'All conversation history cleared'
        }, undefined, 200, processingTime);

    } catch (error) {
        console.error('Clear conversation history API error:', error);
        const processingTime = Date.now() - startTime;

        return createResponse(
            null,
            error instanceof Error ? error.message : 'Internal server error',
            500,
            processingTime
        );
    }
}
