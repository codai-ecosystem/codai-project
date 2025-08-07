'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart as PieChartIcon,
    Calendar,
    Tag,
    Users,
    Search,
    Download,
    Filter,
    RefreshCw,
    Activity,
    ArrowLeft,
    Brain
} from 'lucide-react';
import { memoraiMCPClient } from '../utils/memorai-mcp-client';

interface AnalyticsData {
    timeSeriesData: Array<{ date: string; count: number; importance: number }>;
    importanceDistribution: Array<{ range: string; count: number; percentage: number }>;
    projectAnalytics: Array<{ project: string; count: number; avgImportance: number; latestActivity: string }>;
    tagAnalytics: Array<{ tag: string; count: number; importance: number }>;
    agentActivity: Array<{ agent: string; count: number; avgImportance: number; lastActive: string }>;
    searchInsights: { totalSearches: number; popularQueries: string[]; successRate: number };
}

interface TrendsData {
    growthRate: number;
    averageDaily: number;
    peakDay: { date: string; count: number };
    trendDirection: 'up' | 'down' | 'stable';
}

export default function MemoryAnalyticsDashboard() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState(30);
    const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'projects' | 'tags'>('overview');

    useEffect(() => {
        loadAnalyticsData();
    }, [dateRange]);

    const loadAnalyticsData = async () => {
        setIsLoading(true);
        try {
            const [analytics, trends] = await Promise.all([
                memoraiMCPClient.getMemoryAnalytics('github-copilot'),
                memoraiMCPClient.getMemoryTrends('github-copilot', dateRange)
            ]);

            setAnalyticsData(analytics);
            setTrendsData(trends);
        } catch (error) {
            console.error('Failed to load analytics data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getTrendIcon = (direction: string) => {
        switch (direction) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
            default: return <Activity className="w-4 h-4 text-blue-500" />;
        }
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center gap-2 text-gray-600">
                            <RefreshCw className="w-6 h-6 animate-spin" />
                            <span>Loading analytics...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-8 h-8 text-blue-600" />
                                Memory Analytics
                            </h1>
                            <p className="text-gray-600 mt-1">Insights and trends from your AI memory system</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(parseInt(e.target.value))}
                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                            <option value={365}>Last year</option>
                        </select>
                        <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* View Selector */}
                <div className="flex gap-2">
                    {[
                        { key: 'overview', label: 'Overview', icon: BarChart3 },
                        { key: 'trends', label: 'Trends', icon: TrendingUp },
                        { key: 'projects', label: 'Projects', icon: Activity },
                        { key: 'tags', label: 'Tags', icon: Tag }
                    ].map(({ key, label, icon: Icon }) => (
                        <Button
                            key={key}
                            variant={selectedView === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedView(key as any)}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {label}
                        </Button>
                    ))}
                </div>

                {/* Key Metrics Cards */}
                {trendsData && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                                        <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                                            {trendsData.growthRate > 0 ? '+' : ''}{trendsData.growthRate.toFixed(1)}%
                                            {getTrendIcon(trendsData.trendDirection)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Calendar className="w-8 h-8 text-green-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Daily Average</p>
                                        <p className="text-2xl font-bold text-gray-900">{trendsData.averageDaily.toFixed(1)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Activity className="w-8 h-8 text-purple-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Peak Day</p>
                                        <p className="text-lg font-bold text-gray-900">{trendsData.peakDay.count}</p>
                                        <p className="text-xs text-gray-500">{formatDate(trendsData.peakDay.date)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Search className="w-8 h-8 text-blue-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Search Success</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {analyticsData?.searchInsights.successRate.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Main Analytics Content */}
                {selectedView === 'overview' && analyticsData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Memory Creation Timeline */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Memory Creation Over Time</CardTitle>
                                <CardDescription>Daily memory creation and average importance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analyticsData.timeSeriesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tickFormatter={formatDate} />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip
                                            labelFormatter={(value) => formatDate(value as string)}
                                            formatter={(value, name) => [
                                                name === 'count' ? `${value} memories` : `${(value as number).toFixed(1)} avg importance`,
                                                name === 'count' ? 'Memories Created' : 'Average Importance'
                                            ]}
                                        />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="count" />
                                        <Line yAxisId="right" type="monotone" dataKey="importance" stroke="#F59E0B" strokeWidth={2} name="importance" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Importance Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Importance Distribution</CardTitle>
                                <CardDescription>How you rate your memories</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={analyticsData.importanceDistribution}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                                        >
                                            {analyticsData.importanceDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} memories`, 'Count']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Top Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Popular Tags</CardTitle>
                                <CardDescription>Most frequently used tags</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {analyticsData.tagAnalytics.slice(0, 8).map((tag, index) => (
                                        <div key={tag.tag} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="text-xs">
                                                    #{tag.tag}
                                                </Badge>
                                                <span className="text-sm text-gray-600">{tag.count} uses</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {tag.importance.toFixed(1)} avg
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Projects View */}
                {selectedView === 'projects' && analyticsData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Project Activity</CardTitle>
                                <CardDescription>Memory count and importance by project</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analyticsData.projectAnalytics.slice(0, 10)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="project" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                name === 'count' ? `${value} memories` : `${(value as number).toFixed(1)} avg importance`,
                                                name === 'count' ? 'Memory Count' : 'Average Importance'
                                            ]}
                                        />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="count" />
                                        <Line yAxisId="right" type="monotone" dataKey="avgImportance" stroke="#F59E0B" strokeWidth={2} name="avgImportance" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                                <CardDescription>Latest activity and statistics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analyticsData.projectAnalytics.slice(0, 6).map((project) => (
                                        <div key={project.project} className="border rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">{project.project}</h4>
                                                <Badge variant="outline">{project.count} memories</Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span>Avg Importance: {project.avgImportance.toFixed(1)}/10</span>
                                                <span>Last: {formatDate(project.latestActivity)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Search Insights</CardTitle>
                                <CardDescription>Popular search queries</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Total Searches</span>
                                        <span className="font-medium">{analyticsData.searchInsights.totalSearches}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-900">Popular Queries:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {analyticsData.searchInsights.popularQueries.map((query) => (
                                                <Badge key={query} variant="secondary" className="text-xs">
                                                    {query}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
