#!/usr/bin/env node

/**
 * Analytics MCP Server
 * Model Context Protocol server for comprehensive data analytics and metrics collection
 * 
 * Features:
 * - Real-time metrics collection and aggregation
 * - Performance analytics and trend analysis
 * - Custom dashboard creation and reporting
 * - Data visualization and insights generation
 * - Cross-service analytics correlation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Types
interface MetricData {
    id: string;
    name: string;
    value: number;
    timestamp: string;
    tags: Record<string, string>;
    service: string;
}

interface AnalyticsQuery {
    metrics: string[];
    timeRange: {
        start: string;
        end: string;
    };
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
    groupBy?: string[];
    filters?: Record<string, any>;
}

interface Dashboard {
    id: string;
    name: string;
    description: string;
    widgets: DashboardWidget[];
    createdAt: string;
    updatedAt: string;
}

interface DashboardWidget {
    id: string;
    type: 'chart' | 'metric' | 'table' | 'text';
    title: string;
    query: AnalyticsQuery;
    config: any;
}

// In-memory storage (in production, this would be a real database)
const metrics: MetricData[] = [];
const dashboards: Dashboard[] = [];

// Analytics functions
function addMetric(data: Omit<MetricData, 'id' | 'timestamp'>): MetricData {
    const metric: MetricData = {
        ...data,
        id: uuidv4(),
        timestamp: new Date().toISOString()
    };

    metrics.push(metric);
    return metric;
}

function queryMetrics(query: AnalyticsQuery): any {
    let filteredMetrics = metrics.filter(metric =>
        query.metrics.includes(metric.name) &&
        new Date(metric.timestamp) >= new Date(query.timeRange.start) &&
        new Date(metric.timestamp) <= new Date(query.timeRange.end)
    );

    // Apply filters
    if (query.filters) {
        filteredMetrics = filteredMetrics.filter(metric => {
            return Object.entries(query.filters).every(([key, value]) => {
                if (key === 'service') return metric.service === value;
                return metric.tags[key] === value;
            });
        });
    }

    // Group and aggregate
    const grouped: Record<string, MetricData[]> = {};

    if (query.groupBy && query.groupBy.length > 0) {
        filteredMetrics.forEach(metric => {
            const groupKey = query.groupBy!.map(field => {
                if (field === 'service') return metric.service;
                return metric.tags[field] || 'unknown';
            }).join('|');

            if (!grouped[groupKey]) grouped[groupKey] = [];
            grouped[groupKey].push(metric);
        });
    } else {
        grouped['all'] = filteredMetrics;
    }

    // Apply aggregation
    const results = Object.entries(grouped).map(([groupKey, groupMetrics]) => {
        let aggregatedValue: number;

        switch (query.aggregation) {
            case 'sum':
                aggregatedValue = groupMetrics.reduce((sum, m) => sum + m.value, 0);
                break;
            case 'avg':
                aggregatedValue = groupMetrics.reduce((sum, m) => sum + m.value, 0) / groupMetrics.length;
                break;
            case 'min':
                aggregatedValue = Math.min(...groupMetrics.map(m => m.value));
                break;
            case 'max':
                aggregatedValue = Math.max(...groupMetrics.map(m => m.value));
                break;
            case 'count':
                aggregatedValue = groupMetrics.length;
                break;
            default:
                aggregatedValue = groupMetrics.length;
        }

        return {
            group: groupKey,
            value: aggregatedValue,
            count: groupMetrics.length,
            timeRange: query.timeRange
        };
    });

    return {
        query,
        results,
        totalPoints: filteredMetrics.length,
        executedAt: new Date().toISOString()
    };
}

function generateInsights(metricName: string, days: number = 7): any {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const recentMetrics = metrics.filter(m =>
        m.name === metricName &&
        new Date(m.timestamp) >= startDate
    );

    if (recentMetrics.length === 0) {
        return {
            metric: metricName,
            insights: ['No data available for analysis'],
            recommendations: []
        };
    }

    const values = recentMetrics.map(m => m.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Trend analysis
    const halfPoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, halfPoint);
    const secondHalf = values.slice(halfPoint);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const trend = secondAvg > firstAvg ? 'increasing' : 'decreasing';
    const trendPercent = Math.abs((secondAvg - firstAvg) / firstAvg * 100);

    const insights = [
        `Average ${metricName}: ${avg.toFixed(2)}`,
        `Range: ${min} - ${max}`,
        `Trend: ${trend} by ${trendPercent.toFixed(1)}% over ${days} days`,
        `Total data points: ${recentMetrics.length}`
    ];

    const recommendations = [];
    if (trend === 'increasing' && metricName.includes('error')) {
        recommendations.push('Consider investigating the increase in errors');
    }
    if (trend === 'decreasing' && metricName.includes('performance')) {
        recommendations.push('Performance is declining, optimization may be needed');
    }

    return {
        metric: metricName,
        period: `${days} days`,
        statistics: { avg, min, max, count: recentMetrics.length },
        trend: { direction: trend, percentage: trendPercent },
        insights,
        recommendations
    };
}

// Create and configure the server
const server = new Server(
    {
        name: 'analytics-mcp',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'collect_metric',
                description: 'Collect a metric data point for analytics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Metric name (e.g., response_time, error_count, user_count)'
                        },
                        value: {
                            type: 'number',
                            description: 'Metric value'
                        },
                        service: {
                            type: 'string',
                            description: 'Source service name'
                        },
                        tags: {
                            type: 'object',
                            description: 'Additional tags/metadata',
                            additionalProperties: { type: 'string' }
                        }
                    },
                    required: ['name', 'value', 'service']
                }
            },
            {
                name: 'query_metrics',
                description: 'Query and aggregate metric data',
                inputSchema: {
                    type: 'object',
                    properties: {
                        metrics: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of metric names to query'
                        },
                        timeRange: {
                            type: 'object',
                            properties: {
                                start: { type: 'string', description: 'Start date (ISO string)' },
                                end: { type: 'string', description: 'End date (ISO string)' }
                            },
                            required: ['start', 'end']
                        },
                        aggregation: {
                            type: 'string',
                            enum: ['sum', 'avg', 'min', 'max', 'count'],
                            description: 'Aggregation method'
                        },
                        groupBy: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Fields to group by'
                        },
                        filters: {
                            type: 'object',
                            description: 'Additional filters',
                            additionalProperties: true
                        }
                    },
                    required: ['metrics', 'timeRange', 'aggregation']
                }
            },
            {
                name: 'generate_insights',
                description: 'Generate AI-powered insights for a metric',
                inputSchema: {
                    type: 'object',
                    properties: {
                        metricName: {
                            type: 'string',
                            description: 'Name of the metric to analyze'
                        },
                        days: {
                            type: 'number',
                            description: 'Number of days to analyze (default: 7)',
                            default: 7
                        }
                    },
                    required: ['metricName']
                }
            },
            {
                name: 'create_dashboard',
                description: 'Create a new analytics dashboard',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Dashboard name'
                        },
                        description: {
                            type: 'string',
                            description: 'Dashboard description'
                        },
                        widgets: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: {
                                        type: 'string',
                                        enum: ['chart', 'metric', 'table', 'text']
                                    },
                                    title: { type: 'string' },
                                    query: {
                                        type: 'object',
                                        description: 'Analytics query for the widget'
                                    },
                                    config: {
                                        type: 'object',
                                        description: 'Widget configuration'
                                    }
                                },
                                required: ['type', 'title']
                            }
                        }
                    },
                    required: ['name', 'widgets']
                }
            },
            {
                name: 'get_dashboard',
                description: 'Get dashboard by ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        dashboardId: {
                            type: 'string',
                            description: 'Dashboard ID'
                        }
                    },
                    required: ['dashboardId']
                }
            },
            {
                name: 'list_dashboards',
                description: 'List all available dashboards',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'get_service_metrics',
                description: 'Get comprehensive metrics for a specific service',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serviceName: {
                            type: 'string',
                            description: 'Name of the service'
                        },
                        hours: {
                            type: 'number',
                            description: 'Number of hours to look back (default: 24)',
                            default: 24
                        }
                    },
                    required: ['serviceName']
                }
            },
            {
                name: 'export_data',
                description: 'Export analytics data in various formats',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'object',
                            description: 'Analytics query to export'
                        },
                        format: {
                            type: 'string',
                            enum: ['json', 'csv', 'excel'],
                            description: 'Export format'
                        }
                    },
                    required: ['query', 'format']
                }
            }
        ]
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case 'collect_metric': {
                const metric = addMetric({
                    name: args.name as string,
                    value: args.value as number,
                    service: args.service as string,
                    tags: (args.tags as Record<string, string>) || {}
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Metric collected successfully:\n${JSON.stringify(metric, null, 2)}`
                        }
                    ]
                };
            }

            case 'query_metrics': {
                const result = queryMetrics(args as any as AnalyticsQuery);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Analytics Query Results:\n${JSON.stringify(result, null, 2)}`
                        }
                    ]
                };
            }

            case 'generate_insights': {
                const insights = generateInsights(args.metricName as string, (args.days as number) || 7);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Analytics Insights for ${args.metricName}:\n${JSON.stringify(insights, null, 2)}`
                        }
                    ]
                };
            }

            case 'create_dashboard': {
                const dashboard: Dashboard = {
                    id: uuidv4(),
                    name: args.name as string,
                    description: (args.description as string) || '',
                    widgets: (args.widgets as any[]).map((w: any) => ({
                        id: uuidv4(),
                        ...w
                    })),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                dashboards.push(dashboard);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Dashboard created successfully:\n${JSON.stringify(dashboard, null, 2)}`
                        }
                    ]
                };
            }

            case 'get_dashboard': {
                const dashboard = dashboards.find(d => d.id === (args.dashboardId as string));

                if (!dashboard) {
                    throw new McpError(ErrorCode.InvalidParams, `Dashboard not found: ${args.dashboardId as string}`);
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Dashboard Details:\n${JSON.stringify(dashboard, null, 2)}`
                        }
                    ]
                };
            }

            case 'list_dashboards': {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Available Dashboards:\n${JSON.stringify(dashboards.map(d => ({
                                id: d.id,
                                name: d.name,
                                description: d.description,
                                widgetCount: d.widgets.length,
                                createdAt: d.createdAt
                            })), null, 2)}`
                        }
                    ]
                };
            }

            case 'get_service_metrics': {
                const hours = (args.hours as number) || 24;
                const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));

                const serviceMetrics = metrics.filter(m =>
                    m.service === (args.serviceName as string) &&
                    new Date(m.timestamp) >= cutoffTime
                );

                const summary = {
                    service: args.serviceName as string,
                    timeRange: `Last ${hours} hours`,
                    totalMetrics: serviceMetrics.length,
                    uniqueMetricTypes: [...new Set(serviceMetrics.map(m => m.name))],
                    averageValues: {}
                };

                // Calculate averages for each metric type
                summary.uniqueMetricTypes.forEach(metricName => {
                    const metricValues = serviceMetrics
                        .filter(m => m.name === metricName)
                        .map(m => m.value);

                    if (metricValues.length > 0) {
                        summary.averageValues[metricName] =
                            metricValues.reduce((a, b) => a + b, 0) / metricValues.length;
                    }
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Service Metrics Summary:\n${JSON.stringify(summary, null, 2)}`
                        }
                    ]
                };
            }

            case 'export_data': {
                const result = queryMetrics(args.query as any as AnalyticsQuery);

                let exportData;
                switch (args.format as string) {
                    case 'json':
                        exportData = JSON.stringify(result, null, 2);
                        break;
                    case 'csv':
                        // Simple CSV export
                        const headers = ['Group', 'Value', 'Count'];
                        const csvRows = [
                            headers.join(','),
                            ...result.results.map(r => [r.group, r.value, r.count].join(','))
                        ];
                        exportData = csvRows.join('\n');
                        break;
                    default:
                        exportData = JSON.stringify(result, null, 2);
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Exported Data (${args.format as string}):\n${exportData}`
                        }
                    ]
                };
            }

            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
    }
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Analytics MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
