/**
 * Analytics Dashboard API Endpoint
 * Phase 6.3.1: Advanced Analytics & Insights
 * 
 * Provides comprehensive REST API access to analytics data:
 * - Dashboard metrics and KPIs
 * - Usage patterns and trends
 * - Performance monitoring
 * - Forecasting and predictions
 * - Export capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import AnalyticsDashboardService from '../../../../services/analytics/AnalyticsDashboardService';

// Validation schemas
const AnalyticsQuerySchema = z.object({
    agentId: z.string().min(1, 'Agent ID is required'),
    timeRange: z.enum(['day', 'week', 'month', 'quarter', 'year', 'all']).optional().default('month'),
    granularity: z.enum(['hour', 'day', 'week', 'month']).optional().default('day'),
    includeForecasting: z.boolean().optional().default(true),
    includeComparisons: z.boolean().optional().default(true),
    includeInsights: z.boolean().optional().default(true),
    filterByProject: z.array(z.string()).optional(),
    filterByCategory: z.array(z.string()).optional(),
    filterByImportance: z.object({
        min: z.number().min(1).max(10),
        max: z.number().min(1).max(10)
    }).optional(),
    aggregateBy: z.enum(['time', 'category', 'project', 'importance']).optional()
});

const ExportConfigSchema = z.object({
    format: z.enum(['json', 'csv', 'excel', 'pdf']).default('json'),
    sections: z.array(z.enum([
        'overview',
        'growth',
        'quality',
        'patterns',
        'performance',
        'forecasting',
        'insights'
    ])).optional(),
    compressed: z.boolean().optional().default(false),
    includeCharts: z.boolean().optional().default(false)
});

// Response types
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata?: {
        timestamp: string;
        version: string;
        requestId: string;
        processingTime: number;
        cacheHit: boolean;
    };
}

// Service instance
const analyticsService = new AnalyticsDashboardService();

/**
 * GET /api/analytics/dashboard
 * Retrieve comprehensive dashboard analytics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
        const { searchParams } = new URL(request.url);

        // Parse and validate query parameters
        const queryData = {
            agentId: searchParams.get('agentId') || 'default',
            timeRange: searchParams.get('timeRange') || 'month',
            granularity: searchParams.get('granularity') || 'day',
            includeForecasting: searchParams.get('includeForecasting') !== 'false',
            includeComparisons: searchParams.get('includeComparisons') !== 'false',
            includeInsights: searchParams.get('includeInsights') !== 'false',
            filterByProject: searchParams.get('filterByProject')?.split(',').filter(p => p.trim()),
            filterByCategory: searchParams.get('filterByCategory')?.split(',').filter(c => c.trim()),
            filterByImportance: searchParams.get('minImportance') && searchParams.get('maxImportance') ? {
                min: parseInt(searchParams.get('minImportance')!),
                max: parseInt(searchParams.get('maxImportance')!)
            } : undefined,
            aggregateBy: searchParams.get('aggregateBy') || undefined
        };

        const validationResult = AnalyticsQuerySchema.safeParse(queryData);
        if (!validationResult.success) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid query parameters',
                    details: validationResult.error.issues
                }
            }, { status: 400 });
        }

        const options = validationResult.data;

        console.log(`Analytics Dashboard API: Generating analytics for agent ${options.agentId} with options:`, options);

        // Generate comprehensive analytics
        const analytics = await analyticsService.generateDashboardAnalytics(options.agentId, options);

        const processingTime = Date.now() - startTime;

        const response: ApiResponse<typeof analytics> = {
            success: true,
            data: analytics,
            metadata: {
                timestamp: new Date().toISOString(),
                version: '6.3.1',
                requestId,
                processingTime,
                cacheHit: processingTime < 100 // Simple cache hit detection
            }
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'X-Request-ID': requestId,
                'X-Processing-Time': processingTime.toString(),
                'Cache-Control': 'public, max-age=300' // 5 minutes
            }
        });

    } catch (error) {
        console.error('Analytics Dashboard API Error:', error);

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Failed to generate analytics dashboard',
                details: error instanceof Error ? error.stack : undefined
            },
            metadata: {
                timestamp: new Date().toISOString(),
                version: '6.3.1',
                requestId,
                processingTime,
                cacheHit: false
            }
        }, { status: 500 });
    }
}

/**
 * POST /api/analytics/dashboard
 * Generate custom analytics with advanced filtering
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
        const body = await request.json();

        const validationResult = AnalyticsQuerySchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request body',
                    details: validationResult.error.issues
                }
            }, { status: 400 });
        }

        const options = validationResult.data;

        console.log(`Analytics Dashboard API: Custom analytics generation for agent ${options.agentId}`);

        // Generate analytics with custom options
        const analytics = await analyticsService.generateDashboardAnalytics(options.agentId, options);

        const processingTime = Date.now() - startTime;

        const response: ApiResponse<typeof analytics> = {
            success: true,
            data: analytics,
            metadata: {
                timestamp: new Date().toISOString(),
                version: '6.3.1',
                requestId,
                processingTime,
                cacheHit: false
            }
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'X-Request-ID': requestId,
                'X-Processing-Time': processingTime.toString()
            }
        });

    } catch (error) {
        console.error('Analytics Dashboard Custom API Error:', error);

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Failed to generate custom analytics',
                details: error instanceof Error ? error.stack : undefined
            },
            metadata: {
                timestamp: new Date().toISOString(),
                version: '6.3.1',
                requestId,
                processingTime,
                cacheHit: false
            }
        }, { status: 500 });
    }
}

/**
 * PUT /api/analytics/dashboard
 * Export analytics data in various formats
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
        const body = await request.json();

        // Validate analytics options
        const analyticsValidation = AnalyticsQuerySchema.safeParse(body.analytics || {});
        if (!analyticsValidation.success) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid analytics options',
                    details: analyticsValidation.error.issues
                }
            }, { status: 400 });
        }

        // Validate export config
        const exportValidation = ExportConfigSchema.safeParse(body.export || {});
        if (!exportValidation.success) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid export configuration',
                    details: exportValidation.error.issues
                }
            }, { status: 400 });
        }

        const analyticsOptions = analyticsValidation.data;
        const exportConfig = exportValidation.data;

        console.log(`Analytics Export API: Exporting ${exportConfig.format} for agent ${analyticsOptions.agentId}`);

        // Generate analytics data
        const analytics = await analyticsService.generateDashboardAnalytics(analyticsOptions.agentId, analyticsOptions);

        // Filter sections if specified
        let exportData = analytics;
        if (exportConfig.sections && exportConfig.sections.length > 0) {
            exportData = {} as any;
            exportConfig.sections.forEach(section => {
                switch (section) {
                    case 'overview':
                        (exportData as any).overview = {
                            totalMemories: analytics.totalMemories,
                            memoriesThisWeek: analytics.memoriesThisWeek,
                            memoriesThisMonth: analytics.memoriesThisMonth,
                            averageImportance: analytics.averageImportance
                        };
                        break;
                    case 'growth':
                        (exportData as any).growthMetrics = analytics.growthMetrics;
                        break;
                    case 'quality':
                        (exportData as any).qualityMetrics = analytics.qualityMetrics;
                        break;
                    case 'patterns':
                        (exportData as any).usagePatterns = analytics.usagePatterns;
                        (exportData as any).temporalAnalytics = analytics.temporalAnalytics;
                        break;
                    case 'performance':
                        (exportData as any).performanceMetrics = analytics.performanceMetrics;
                        break;
                    case 'forecasting':
                        (exportData as any).projectedGrowth = analytics.growthMetrics.projectedGrowth;
                        break;
                    case 'insights':
                        (exportData as any).insights = {
                            qualityInsights: analytics.qualityMetrics.qualityInsights,
                            usagePatterns: analytics.usagePatterns,
                            projectAnalytics: analytics.projectAnalytics.map(p => ({ project: p.project, insights: p.insights }))
                        };
                        break;
                }
            });
        }

        // Format data based on export format
        let responseData;
        let contentType = 'application/json';
        let filename = `memorai-analytics-${new Date().toISOString().split('T')[0]}.json`;

        switch (exportConfig.format) {
            case 'json':
                responseData = exportConfig.compressed ?
                    JSON.stringify(exportData) :
                    JSON.stringify(exportData, null, 2);
                break;

            case 'csv':
                responseData = await convertToCSV(exportData);
                contentType = 'text/csv';
                filename = filename.replace('.json', '.csv');
                break;

            case 'excel':
                responseData = await convertToExcel(exportData);
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                filename = filename.replace('.json', '.xlsx');
                break;

            case 'pdf':
                responseData = await convertToPDF(exportData, exportConfig.includeCharts);
                contentType = 'application/pdf';
                filename = filename.replace('.json', '.pdf');
                break;

            default:
                responseData = JSON.stringify(exportData, null, 2);
        }

        const processingTime = Date.now() - startTime;

        return new NextResponse(responseData, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'X-Request-ID': requestId,
                'X-Processing-Time': processingTime.toString(),
                'X-Export-Format': exportConfig.format,
                'X-Export-Size': responseData.length.toString()
            }
        });

    } catch (error) {
        console.error('Analytics Export API Error:', error);

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: false,
            error: {
                code: 'EXPORT_ERROR',
                message: error instanceof Error ? error.message : 'Failed to export analytics data',
                details: error instanceof Error ? error.stack : undefined
            },
            metadata: {
                timestamp: new Date().toISOString(),
                version: '6.3.1',
                requestId,
                processingTime,
                cacheHit: false
            }
        }, { status: 500 });
    }
}

/**
 * PATCH /api/analytics/dashboard
 * Clear analytics cache and regenerate
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'clear-cache') {
            console.log('Analytics Dashboard API: Clearing cache');
            analyticsService.clearCache();

            return NextResponse.json({
                success: true,
                data: { message: 'Analytics cache cleared successfully' },
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '6.3.1',
                    requestId,
                    processingTime: Date.now() - startTime,
                    cacheHit: false
                }
            });
        }

        if (action === 'cache-stats') {
            const stats = analyticsService.getCacheStats();

            return NextResponse.json({
                success: true,
                data: stats,
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '6.3.1',
                    requestId,
                    processingTime: Date.now() - startTime,
                    cacheHit: false
                }
            });
        }

        return NextResponse.json({
            success: false,
            error: {
                code: 'INVALID_ACTION',
                message: 'Invalid action specified. Use "clear-cache" or "cache-stats"'
            }
        }, { status: 400 });

    } catch (error) {
        console.error('Analytics Dashboard Management API Error:', error);

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Failed to perform cache operation',
                details: error instanceof Error ? error.stack : undefined
            },
            metadata: {
                timestamp: new Date().toISOString(),
                version: '6.3.1',
                requestId,
                processingTime,
                cacheHit: false
            }
        }, { status: 500 });
    }
}

/**
 * DELETE /api/analytics/dashboard
 * Reset analytics data (for development/testing)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
        const { searchParams } = new URL(request.url);
        const confirm = searchParams.get('confirm');

        if (confirm !== 'true') {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'CONFIRMATION_REQUIRED',
                    message: 'Add ?confirm=true to confirm analytics cache reset'
                }
            }, { status: 400 });
        }

        console.log('Analytics Dashboard API: Resetting analytics cache');
        analyticsService.clearCache();

        return NextResponse.json({
            success: true,
            data: {
                message: 'Analytics cache reset successfully',
                warning: 'This action cleared all cached analytics data'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                version: '6.3.1',
                requestId,
                processingTime: Date.now() - startTime,
                cacheHit: false
            }
        });

    } catch (error) {
        console.error('Analytics Dashboard Reset API Error:', error);

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Failed to reset analytics cache',
                details: error instanceof Error ? error.stack : undefined
            },
            metadata: {
                timestamp: new Date().toISOString(),
                version: '6.3.1',
                requestId,
                processingTime,
                cacheHit: false
            }
        }, { status: 500 });
    }
}

/**
 * Helper functions for data conversion
 */

async function convertToCSV(data: any): Promise<string> {
    // Simplified CSV conversion - in production, use a proper CSV library
    const lines = ['Metric,Value'];

    const addMetric = (path: string, value: any, prefix = '') => {
        const fullPath = prefix ? `${prefix}.${path}` : path;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.entries(value).forEach(([key, val]) => {
                addMetric(key, val, fullPath);
            });
        } else if (Array.isArray(value)) {
            lines.push(`${fullPath}.length,${value.length}`);
        } else {
            lines.push(`${fullPath},"${value}"`);
        }
    };

    Object.entries(data).forEach(([key, value]) => {
        addMetric(key, value);
    });

    return lines.join('\n');
}

async function convertToExcel(data: any): Promise<string> {
    // Placeholder - in production, use a library like xlsx
    return JSON.stringify(data, null, 2);
}

async function convertToPDF(data: any, includeCharts: boolean = false): Promise<string> {
    // Placeholder - in production, use a library like puppeteer or jsPDF
    const summary = `
MemorAI Analytics Report
Generated: ${new Date().toISOString()}

Total Memories: ${data.totalMemories || 0}
Average Importance: ${data.averageImportance || 0}
Quality Score: ${data.qualityMetrics?.overallQualityScore || 0}

${includeCharts ? '[Charts would be included here]' : ''}
    `;

    return summary;
}
