/**
 * AnalyticsDashboard - Advanced Memory Analytics and Insights Component
 * Phase 6.3.1: Analytics Dashboard Service
 * 
 * Provides comprehensive data visualization and reporting for memory analytics:
 * - Usage patterns and trends visualization
 * - Performance metrics dashboards
 * - Memory distribution analysis
 * - Interactive charts and graphs
 * - Forecasting and predictive insights
 * - Export capabilities for reports
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import UsagePatternVisualization from './UsagePatternVisualization';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    RadialBarChart,
    RadialBar,
    ScatterChart,
    Scatter
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    Brain,
    Clock,
    Star,
    Database,
    Users,
    Zap,
    Target,
    Calendar,
    Download,
    RefreshCw,
    Filter,
    Settings,
    Eye,
    AlertTriangle,
    CheckCircle,
    Info,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemoryAnalytics {
    overview: {
        totalMemories: number;
        averageImportance: number;
        totalCategories: number;
        activeDays: number;
        growthRate: number;
        retentionRate: number;
    };

    usagePatterns: {
        dailyActivity: Array<{
            date: string;
            memories: number;
            searches: number;
            importance: number;
        }>;
        hourlyDistribution: Array<{
            hour: number;
            activity: number;
            peak: boolean;
        }>;
        weeklyTrends: Array<{
            week: string;
            memories: number;
            trend: 'up' | 'down' | 'stable';
        }>;
    };

    memoryDistribution: {
        byCategory: Array<{
            category: string;
            count: number;
            percentage: number;
            avgImportance: number;
            color: string;
        }>;
        byImportance: Array<{
            range: string;
            count: number;
            percentage: number;
        }>;
        byProject: Array<{
            project: string;
            count: number;
            lastActivity: string;
        }>;
    };

    performanceMetrics: {
        responseTime: Array<{
            operation: string;
            avgTime: number;
            benchmark: number;
            status: 'excellent' | 'good' | 'needs_improvement';
        }>;
        searchEffectiveness: {
            totalSearches: number;
            successRate: number;
            avgResultsReturned: number;
            userSatisfaction: number;
        };
        systemHealth: {
            uptime: number;
            errorRate: number;
            cacheHitRate: number;
            memoryUsage: number;
        };
    };

    insights: Array<{
        type: 'trend' | 'pattern' | 'recommendation' | 'alert';
        title: string;
        description: string;
        impact: 'high' | 'medium' | 'low';
        actionable: boolean;
        metrics?: Record<string, number>;
    }>;

    forecasting?: {
        memoryGrowth: Array<{
            period: string;
            predicted: number;
            confidence: number;
        }>;
        usageTrends: Array<{
            metric: string;
            forecast: number;
            trend: 'increasing' | 'decreasing' | 'stable';
        }>;
    };
}

interface AnalyticsDashboardProps {
    agentId: string;
    className?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

export default function AnalyticsDashboard({
    agentId,
    className,
    autoRefresh = false,
    refreshInterval = 300000 // 5 minutes
}: AnalyticsDashboardProps) {
    const [analytics, setAnalytics] = useState<MemoryAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
    const [includeForecasting, setIncludeForecasting] = useState(true);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Color schemes for charts
    const categoryColors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
    ];

    const importanceColors = {
        excellent: '#10B981',
        good: '#3B82F6',
        needs_improvement: '#F59E0B'
    };

    useEffect(() => {
        loadAnalytics();
    }, [agentId, timeRange, includeForecasting]);

    useEffect(() => {
        if (autoRefresh && refreshInterval > 0) {
            const interval = setInterval(loadAnalytics, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval, agentId, timeRange]);

    const loadAnalytics = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/analytics/dashboard?agentId=${agentId}&timeRange=${timeRange}&includeForecasting=${includeForecasting}`);
            const data = await response.json();

            if (data.success) {
                setAnalytics(data.data);
                setLastUpdated(new Date());
            } else {
                setError(data.error || 'Failed to load analytics');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
            console.error('Analytics loading failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (format: 'pdf' | 'csv' | 'json') => {
        if (!analytics) return;

        try {
            const response = await fetch('/api/analytics/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    agentId,
                    timeRange,
                    format,
                    data: analytics
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `memorai-analytics-${timeRange}-${Date.now()}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatPercentage = (num: number): string => {
        return `${(num * 100).toFixed(1)}%`;
    };

    const getMetricIcon = (type: string) => {
        switch (type) {
            case 'trend': return <TrendingUp className="h-4 w-4" />;
            case 'pattern': return <Activity className="h-4 w-4" />;
            case 'recommendation': return <Target className="h-4 w-4" />;
            case 'alert': return <AlertTriangle className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className={cn('flex items-center justify-center h-96', className)}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn('flex items-center justify-center h-96', className)}>
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium">Analytics Error</p>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={loadAnalytics}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className={cn('text-center py-12', className)}>
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-7 w-7 text-blue-600" />
                        Memory Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Comprehensive insights into your memory patterns and usage
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}

                    <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="quarter">Quarter</SelectItem>
                            <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>

                    <Button variant="outline" size="sm" onClick={loadAnalytics}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Memories</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalMemories)}</p>
                            </div>
                            <Database className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            {analytics.overview.growthRate > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={analytics.overview.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatPercentage(Math.abs(analytics.overview.growthRate))} {timeRange}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg. Importance</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageImportance.toFixed(1)}</p>
                            </div>
                            <Star className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                                Quality Score: {Math.round(analytics.overview.averageImportance * 10)}%
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Days</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeDays}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                            <Activity className="h-4 w-4 mr-1" />
                            {formatPercentage(analytics.overview.retentionRate)} retention
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Categories</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalCategories}</p>
                            </div>
                            <Brain className="h-8 w-8 text-purple-500" />
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                            <Sparkles className="h-4 w-4 mr-1" />
                            AI-categorized
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Analytics Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="patterns">Patterns</TabsTrigger>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                    <TabsTrigger value="distribution">Distribution</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daily Activity Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Memory Activity Over Time</CardTitle>
                                <CardDescription>Daily memory creation and search patterns</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={analytics.usagePatterns.dailyActivity}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                            formatter={(value: any, name: string) => [value, name === 'memories' ? 'Memories Created' : 'Searches']}
                                        />
                                        <Legend />
                                        <Area type="monotone" dataKey="memories" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Memories" />
                                        <Area type="monotone" dataKey="searches" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Searches" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Hourly Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity by Hour</CardTitle>
                                <CardDescription>Your peak productivity hours</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.usagePatterns.hourlyDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(value) => `${value}:00`}
                                            formatter={(value: any) => [value, 'Activity']}
                                        />
                                        <Bar
                                            dataKey="activity"
                                            fill="#8B5CF6"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Weekly Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Trends</CardTitle>
                            <CardDescription>Memory creation trends over recent weeks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={analytics.usagePatterns.weeklyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="memories"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="patterns" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Search Effectiveness */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Search Effectiveness</CardTitle>
                                <CardDescription>How well your searches are performing</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Success Rate</span>
                                    <span className="text-sm text-gray-600">{formatPercentage(analytics.performanceMetrics.searchEffectiveness.successRate)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${analytics.performanceMetrics.searchEffectiveness.successRate * 100}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Avg. Results</span>
                                    <span className="text-sm text-gray-600">{analytics.performanceMetrics.searchEffectiveness.avgResultsReturned.toFixed(1)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">User Satisfaction</span>
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                        <span className="text-sm text-gray-600">{analytics.performanceMetrics.searchEffectiveness.userSatisfaction.toFixed(1)}/5</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Response Times</CardTitle>
                                <CardDescription>System performance across operations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {analytics.performanceMetrics.responseTime.map((metric, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{metric.operation}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">{metric.avgTime}ms</span>
                                                <Badge
                                                    className={cn(
                                                        'text-xs',
                                                        metric.status === 'excellent' && 'bg-green-100 text-green-800',
                                                        metric.status === 'good' && 'bg-blue-100 text-blue-800',
                                                        metric.status === 'needs_improvement' && 'bg-yellow-100 text-yellow-800'
                                                    )}
                                                >
                                                    {metric.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="usage" className="space-y-4">
                    <UsagePatternVisualization
                        agentId={agentId}
                        timeRange={timeRange}
                        autoUpdate={autoRefresh}
                        updateInterval={refreshInterval}
                        className="min-h-[800px]"
                    />
                </TabsContent>

                <TabsContent value="distribution" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Category Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Memory Categories</CardTitle>
                                <CardDescription>Distribution of memories by category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={analytics.memoryDistribution.byCategory}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ category, percentage }) => `${category} (${(percentage * 100).toFixed(0)}%)`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {analytics.memoryDistribution.byCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any, name: string) => [value, 'Memories']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Importance Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Importance Distribution</CardTitle>
                                <CardDescription>How your memories are rated by importance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.memoryDistribution.byImportance} layout="horizontal">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="range" type="category" width={80} />
                                        <Tooltip formatter={(value: any) => [value, 'Memories']} />
                                        <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* System Health Cards */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-green-500" />
                                    Uptime
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatPercentage(analytics.performanceMetrics.systemHealth.uptime)}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">System availability</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-blue-500" />
                                    Cache Hit Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatPercentage(analytics.performanceMetrics.systemHealth.cacheHitRate)}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Query optimization</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Error Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatPercentage(analytics.performanceMetrics.systemHealth.errorRate)}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">System reliability</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                    <div className="grid gap-4">
                        {analytics.insights.map((insight, index) => (
                            <Card key={index} className={cn('border-l-4', getImpactColor(insight.impact))}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getMetricIcon(insight.type)}
                                                <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {insight.impact} impact
                                                </Badge>
                                                {insight.actionable && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Actionable
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-gray-700 mb-2">{insight.description}</p>
                                            {insight.metrics && (
                                                <div className="flex gap-4 text-sm text-gray-600">
                                                    {Object.entries(insight.metrics).map(([key, value]) => (
                                                        <span key={key}>
                                                            {key}: <strong>{typeof value === 'number' && value < 1 ? formatPercentage(value) : value}</strong>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Badge className={cn('ml-2', getImpactColor(insight.impact))}>
                                            {insight.type}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Forecasting Section */}
            {includeForecasting && analytics.forecasting && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-500" />
                            Forecasting & Predictions
                        </CardTitle>
                        <CardDescription>AI-powered predictions based on your usage patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium mb-3">Memory Growth Forecast</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={analytics.forecasting.memoryGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="predicted"
                                            stroke="#6366F1"
                                            strokeDasharray="5 5"
                                            dot={{ fill: '#6366F1' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div>
                                <h4 className="font-medium mb-3">Usage Trends</h4>
                                <div className="space-y-3">
                                    {analytics.forecasting.usageTrends.map((trend, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{trend.metric}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">{trend.forecast.toFixed(1)}</span>
                                                {trend.trend === 'increasing' && <TrendingUp className="h-4 w-4 text-green-500" />}
                                                {trend.trend === 'decreasing' && <TrendingDown className="h-4 w-4 text-red-500" />}
                                                {trend.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full"></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
