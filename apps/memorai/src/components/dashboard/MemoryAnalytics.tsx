/**
 * Memory Analytics Module
 * Enhanced with Microsoft TypeScript best practices and strict typing
 * Extracted from memory-analytics-dashboard.tsx following Microsoft modular patterns
 */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
    Activity
} from 'lucide-react';
import { AnalyticsData, APIError } from '../../types';

// Component-specific types following Microsoft patterns
interface AnalyticsState {
    readonly data: AnalyticsData | null;
    readonly isLoading: boolean;
    readonly error: APIError | null;
}

interface TimeRangeOption {
    readonly value: string;
    readonly label: string;
}

interface ChartProps {
    readonly data: AnalyticsData;
    readonly height?: number;
}

// Type guards and validators
const isValidTimeRange = (range: string): range is '7d' | '30d' | '90d' | '1y' => {
    return ['7d', '30d', '90d', '1y'].includes(range);
};

const validateAnalyticsData = (data: unknown): data is AnalyticsData => {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;

    return (
        Array.isArray(d.memoryGrowth) &&
        Array.isArray(d.categoryDistribution) &&
        Array.isArray(d.weeklyActivity) &&
        Array.isArray(d.topTags) &&
        d.memoryGrowth.every(item =>
            typeof item === 'object' &&
            item !== null &&
            'date' in item &&
            'count' in item &&
            typeof (item as any).date === 'string' &&
            typeof (item as any).count === 'number'
        )
    );
};

// Memoized chart components following Microsoft patterns with accessibility enhancements
const MemoryGrowthChart = React.memo<ChartProps>(({ data, height = 300 }) => (
    <div role="img" aria-label="Memory growth over time chart showing the increase in memories from January to August 2025">
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart
                data={data.memoryGrowth}
                aria-label="Area chart displaying memory growth data"
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    aria-label="Time period"
                />
                <YAxis
                    aria-label="Number of memories"
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    name="Memory Count"
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
));
MemoryGrowthChart.displayName = 'MemoryGrowthChart';

const CategoryDistributionChart = React.memo<ChartProps>(({ data, height = 250 }) => (
    <div
        role="img"
        aria-label={`Pie chart showing memory distribution across categories: ${data.categoryDistribution.map(cat => `${cat.name} ${cat.value}%`).join(', ')}`}
    >
        <ResponsiveContainer width="100%" height={height}>
            <PieChart aria-label="Category distribution pie chart">
                <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    aria-label="Memory categories"
                >
                    {data.categoryDistribution.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            aria-label={`${entry.name}: ${entry.value}%`}
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
        {/* Screen reader accessible data table */}
        <table className="sr-only" aria-label="Category distribution data">
            <caption>Memory distribution by category</caption>
            <thead>
                <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Percentage</th>
                </tr>
            </thead>
            <tbody>
                {data.categoryDistribution.map((category) => (
                    <tr key={category.name}>
                        <td>{category.name}</td>
                        <td>{category.value}%</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
));
CategoryDistributionChart.displayName = 'CategoryDistributionChart';

const WeeklyActivityChart = React.memo<ChartProps>(({ data, height = 250 }) => (
    <div
        role="img"
        aria-label={`Weekly activity chart showing memories and searches for each day: ${data.weeklyActivity.map(day => `${day.day}: ${day.memories} memories, ${day.searches} searches`).join('; ')}`}
    >
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data.weeklyActivity}
                aria-label="Weekly activity bar chart"
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="day"
                    aria-label="Days of the week"
                />
                <YAxis
                    aria-label="Activity count"
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
                <Legend />
                <Bar
                    dataKey="memories"
                    fill="#3B82F6"
                    name="Memories Created"
                    aria-label="Number of memories created"
                />
                <Bar
                    dataKey="searches"
                    fill="#10B981"
                    name="Searches Performed"
                    aria-label="Number of searches performed"
                />
            </BarChart>
        </ResponsiveContainer>
        {/* Screen reader accessible data table */}
        <table className="sr-only" aria-label="Weekly activity data">
            <caption>Weekly activity showing memories created and searches performed</caption>
            <thead>
                <tr>
                    <th scope="col">Day</th>
                    <th scope="col">Memories</th>
                    <th scope="col">Searches</th>
                </tr>
            </thead>
            <tbody>
                {data.weeklyActivity.map((day) => (
                    <tr key={day.day}>
                        <td>{day.day}</td>
                        <td>{day.memories}</td>
                        <td>{day.searches}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
));
WeeklyActivityChart.displayName = 'WeeklyActivityChart';

// Loading skeleton component with accessibility
const AnalyticsLoadingSkeleton = React.memo(() => (
    <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="status"
        aria-label="Loading analytics data"
    >
        <span className="sr-only">Loading analytics dashboard...</span>
        {Array.from({ length: 6 }, (_, i) => (
            <Card key={i} className="animate-pulse">
                <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4" aria-hidden="true"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-32 bg-gray-200 rounded" aria-hidden="true"></div>
                </CardContent>
            </Card>
        ))}
    </div>
));
AnalyticsLoadingSkeleton.displayName = 'AnalyticsLoadingSkeleton';

export default function MemoryAnalytics(): JSX.Element {
    const [state, setState] = useState<AnalyticsState>({
        data: null,
        isLoading: true,
        error: null
    });
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

    // Memoized time range options
    const timeRangeOptions = useMemo<readonly TimeRangeOption[]>(() => [
        { value: '7d', label: '7 Days' },
        { value: '30d', label: '30 Days' },
        { value: '90d', label: '90 Days' },
        { value: '1y', label: '1 Year' }
    ], []);

    // Memoized handlers following Microsoft patterns
    const handleTimeRangeChange = useCallback((range: string) => {
        if (isValidTimeRange(range)) {
            setTimeRange(range);
        } else {
            console.warn('Invalid time range:', range);
        }
    }, []);

    const handleRetryLoad = useCallback(() => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
    }, []);

    // Load analytics data with proper error handling
    useEffect(() => {
        const loadAnalytics = async () => {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            try {
                // Simulated analytics data - replace with actual API
                await new Promise(resolve => setTimeout(resolve, 1000));

                const mockData: AnalyticsData = {
                    memoryGrowth: [
                        { date: '2025-01', count: 45 },
                        { date: '2025-02', count: 78 },
                        { date: '2025-03', count: 123 },
                        { date: '2025-04', count: 167 },
                        { date: '2025-05', count: 234 },
                        { date: '2025-06', count: 289 },
                        { date: '2025-07', count: 356 },
                        { date: '2025-08', count: 423 }
                    ],
                    categoryDistribution: [
                        { name: 'Work', value: 35, color: '#3B82F6' },
                        { name: 'Personal', value: 25, color: '#10B981' },
                        { name: 'Learning', value: 20, color: '#F59E0B' },
                        { name: 'Ideas', value: 15, color: '#EF4444' },
                        { name: 'Other', value: 5, color: '#8B5CF6' }
                    ],
                    weeklyActivity: [
                        { day: 'Mon', memories: 12, searches: 45 },
                        { day: 'Tue', memories: 19, searches: 52 },
                        { day: 'Wed', memories: 15, searches: 38 },
                        { day: 'Thu', memories: 22, searches: 67 },
                        { day: 'Fri', memories: 18, searches: 43 },
                        { day: 'Sat', memories: 8, searches: 22 },
                        { day: 'Sun', memories: 6, searches: 18 }
                    ],
                    topTags: [
                        { name: 'project-alpha', count: 45 },
                        { name: 'meeting-notes', count: 32 },
                        { name: 'ideas', count: 28 },
                        { name: 'research', count: 24 },
                        { name: 'todo', count: 19 }
                    ]
                };

                // Validate analytics data
                if (!validateAnalyticsData(mockData)) {
                    throw new APIError('Invalid analytics data format');
                }

                setState({
                    data: mockData,
                    isLoading: false,
                    error: null
                });

            } catch (error) {
                const apiError = error instanceof APIError
                    ? error
                    : new APIError('Failed to load analytics data');

                setState({
                    data: null,
                    isLoading: false,
                    error: apiError
                });
                console.error('Failed to load analytics:', error);
            }
        };

        loadAnalytics();
    }, [timeRange]);

    // Memoized tag elements
    const tagElements = useMemo(() => {
        if (!state.data) return null;

        return state.data.topTags.map((tag, index) => (
            <Badge
                key={tag.name}
                variant="secondary"
                className="text-sm px-3 py-1"
            >
                #{tag.name} ({tag.count})
            </Badge>
        ));
    }, [state.data]);

    // Early returns for loading and error states
    if (state.isLoading) {
        return <AnalyticsLoadingSkeleton />;
    }

    if (state.error) {
        return (
            <div className="space-y-6">
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div
                            className="flex items-center space-x-2 text-red-600"
                            role="alert"
                            aria-live="polite"
                        >
                            <BarChart3 className="h-5 w-5" aria-hidden="true" />
                            <h3 className="font-medium">Error Loading Analytics</h3>
                        </div>
                        <p className="text-red-500 mt-2" id="error-description">
                            {state.error.message}
                        </p>
                        <Button
                            onClick={handleRetryLoad}
                            className="mt-4"
                            size="sm"
                            variant="outline"
                            aria-describedby="error-description"
                            aria-label="Retry loading analytics data"
                        >
                            Retry Loading
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!state.data) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" aria-hidden="true" />
                        <h3
                            className="text-lg font-medium text-gray-900 dark:text-white mb-2"
                            id="no-data-title"
                        >
                            No Analytics Data Available
                        </h3>
                        <p
                            className="text-gray-500 mb-4"
                            id="no-data-description"
                        >
                            Start creating memories to see analytics about your usage patterns.
                        </p>
                        <Button
                            onClick={handleRetryLoad}
                            aria-describedby="no-data-description"
                            aria-label="Load analytics data"
                        >
                            Load Analytics
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6" role="main" aria-label="Memory analytics dashboard">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center">
                <h2
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                    id="analytics-title"
                >
                    Memory Analytics
                </h2>
                <div
                    className="flex space-x-2"
                    role="group"
                    aria-label="Time range selector"
                    aria-describedby="analytics-title"
                >
                    {timeRangeOptions.map((option) => (
                        <Button
                            key={option.value}
                            variant={timeRange === option.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleTimeRangeChange(option.value)}
                            aria-pressed={timeRange === option.value}
                            aria-label={`Filter analytics for ${option.label}`}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="region" aria-label="Analytics charts">
                {/* Memory Growth Chart */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2" aria-hidden="true" />
                            Memory Growth Over Time
                        </CardTitle>
                        <CardDescription>Track how your memory collection grows</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MemoryGrowthChart data={state.data} />
                    </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <PieChartIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                            Category Distribution
                        </CardTitle>
                        <CardDescription>
                            Breakdown of memories by category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryDistributionChart data={state.data} />
                    </CardContent>
                </Card>

                {/* Weekly Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="h-5 w-5 mr-2" aria-hidden="true" />
                            Weekly Activity
                        </CardTitle>
                        <CardDescription>
                            Memory creation and search activity by day
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WeeklyActivityChart data={state.data} />
                    </CardContent>
                </Card>

                {/* Top Tags */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Tag className="h-5 w-5 mr-2" aria-hidden="true" />
                            Most Used Tags ({state.data.topTags.length})
                        </CardTitle>
                        <CardDescription>
                            Your most frequently used tags for organizing memories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="flex flex-wrap gap-2"
                            role="list"
                            aria-label="List of most used tags"
                        >
                            {tagElements}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}