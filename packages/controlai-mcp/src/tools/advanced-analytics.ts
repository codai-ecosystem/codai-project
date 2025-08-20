/**
 * Advanced Analytics Tool for ControlAI MCP
 * Provides enterprise-grade analytics, metrics, and insights
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseService } from '../database/DatabaseService.js';
import { AIService } from '../ai/AIService.js';
import { AdvancedAnalyticsService } from '../services/AdvancedAnalyticsService.js';
import { Logger } from '../utils/logger.js';

export const advancedAnalyticsTool: Tool = {
    name: 'get_advanced_analytics',
    description: 'Get comprehensive advanced analytics including project trends, agent performance, predictive insights, and custom metrics',
    inputSchema: {
        type: 'object',
        properties: {
            workspaceId: {
                type: 'string',
                description: 'Workspace ID to get analytics for'
            },
            timeRange: {
                type: 'object',
                properties: {
                    start: { type: 'string', description: 'Start date (ISO string)' },
                    end: { type: 'string', description: 'End date (ISO string)' }
                },
                description: 'Time range for analytics (defaults to last 30 days)'
            },
            metrics: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: [
                        'project_trends',
                        'agent_performance',
                        'task_analytics',
                        'productivity_metrics',
                        'collaboration_metrics',
                        'quality_metrics',
                        'predictive_insights',
                        'custom_metrics'
                    ]
                },
                description: 'Specific metrics to include (defaults to all)'
            },
            filters: {
                type: 'object',
                properties: {
                    projectIds: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Filter by specific project IDs'
                    },
                    agentTypes: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Filter by agent types'
                    },
                    priority: {
                        type: 'string',
                        enum: ['low', 'medium', 'high', 'critical'],
                        description: 'Filter by priority level'
                    }
                },
                description: 'Optional filters to apply to analytics'
            },
            aggregation: {
                type: 'string',
                enum: ['daily', 'weekly', 'monthly'],
                description: 'Data aggregation level (defaults to weekly)'
            }
        },
        required: ['workspaceId'],
    },
};

export async function handleAdvancedAnalytics(
    args: any,
    databaseService: DatabaseService,
    aiService: AIService
): Promise<any> {
    try {
        Logger.info('Processing advanced analytics request', {
            workspaceId: args.workspaceId,
            metrics: args.metrics,
            timeRange: args.timeRange
        });

        const analyticsService = new AdvancedAnalyticsService(databaseService, aiService);

        // Set default time range if not provided
        const now = new Date();
        const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

        const timeRange = args.timeRange ? {
            start: new Date(args.timeRange.start),
            end: new Date(args.timeRange.end)
        } : {
            start: defaultStart,
            end: now
        };

        // Get comprehensive analytics
        const analytics = await analyticsService.getAdvancedAnalytics(timeRange);

        Logger.info('Advanced analytics generated successfully', {
            workspaceId: args.workspaceId,
            dataPoints: analytics.projectTrends?.length || 0,
            agentMetrics: analytics.agentPerformanceMetrics?.length || 0
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        data: analytics,
                        metadata: {
                            workspaceId: args.workspaceId,
                            timeRange,
                            generatedAt: new Date().toISOString(),
                            dataPoints: {
                                projectTrends: analytics.projectTrends?.length || 0,
                                agentMetrics: analytics.agentPerformanceMetrics?.length || 0,
                                resourceMetrics: analytics.resourceUtilization ? 1 : 0,
                                predictiveInsights: analytics.predictiveInsights?.length || 0
                            }
                        }
                    }, null, 2)
                }
            ]
        };

    } catch (error) {
        Logger.error('Failed to generate advanced analytics', error);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: 'Failed to generate advanced analytics',
                        details: error instanceof Error ? error.message : 'Unknown error'
                    }, null, 2)
                }
            ]
        };
    }
}
