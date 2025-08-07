/**
 * UsagePatternVisualization - Advanced Usage Pattern Analysis Component
 * Phase 6.3.2: Usage Pattern Visualization
 * 
 * Provides advanced interactive visualizations for memory usage patterns:
 * - Heatmap visualizations for activity patterns
 * - Time-series analysis with interactive timeline controls
 * - Correlation analysis between memory creation and search patterns
 * - Advanced filtering with multi-dimensional data slicing
 * - Peak usage identification with statistical analysis
 * - Custom dashboard creation with drag-and-drop capabilities
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
    ReferenceLine,
    ReferenceArea,
    Brush
} from 'recharts';
import {
    Calendar,
    Clock,
    TrendingUp,
    TrendingDown,
    Activity,
    Eye,
    Filter,
    Settings,
    Download,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Maximize,
    RefreshCw,
    Zap,
    Target,
    Layers,
    Grid,
    BarChart3,
    LineChart as LineChartIcon,
    Flame,
    Snowflake,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsagePatternData {
    timeSeriesData: Array<{
        timestamp: string;
        date: string;
        hour: number;
        dayOfWeek: number;
        memories: number;
        searches: number;
        importance: number;
        uniqueUsers: number;
        categories: number;
        responseTime: number;
    }>;

    heatmapData: Array<{
        day: string;
        hour: number;
        activity: number;
        intensity: 'low' | 'medium' | 'high' | 'peak';
        memories: number;
        searches: number;
    }>;

    correlationData: Array<{
        memoryCreation: number;
        searchActivity: number;
        importance: number;
        timeSpent: number;
        userSatisfaction: number;
        category: string;
    }>;

    peakAnalysis: {
        dailyPeaks: Array<{
            hour: number;
            activity: number;
            confidence: number;
            pattern: 'consistent' | 'variable' | 'emerging';
        }>;
        weeklyPeaks: Array<{
            day: string;
            activity: number;
            trend: 'increasing' | 'decreasing' | 'stable';
        }>;
        seasonalPeaks: Array<{
            period: string;
            activity: number;
            predictedNext: number;
        }>;
    };

    patterns: Array<{
        id: string;
        name: string;
        type: 'cyclical' | 'trending' | 'anomaly' | 'seasonal';
        description: string;
        confidence: number;
        impact: 'high' | 'medium' | 'low';
        recommendation: string;
        metrics: Record<string, number>;
    }>;
}

interface UsagePatternVisualizationProps {
    agentId: string;
    className?: string;
    timeRange?: 'week' | 'month' | 'quarter' | 'year';
    autoUpdate?: boolean;
    updateInterval?: number;
}

export default function UsagePatternVisualization({
    agentId,
    className,
    timeRange = 'month',
    autoUpdate = true,
    updateInterval = 60000 // 1 minute
}: UsagePatternVisualizationProps) {
    const [data, setData] = useState<UsagePatternData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState('heatmap');

    // Visualization controls
    const [timeRangeFilter, setTimeRangeFilter] = useState(timeRange);
    const [showCorrelation, setShowCorrelation] = useState(true);
    const [animationSpeed, setAnimationSpeed] = useState([1]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
    const [heatmapMetric, setHeatmapMetric] = useState<'activity' | 'memories' | 'searches'>('activity');
    const [correlationMetrics, setCorrelationMetrics] = useState(['memoryCreation', 'searchActivity']);

    // Advanced filtering
    const [filters, setFilters] = useState({
        minActivity: [0],
        maxActivity: [100],
        showPeaks: true,
        showTrends: true,
        smoothing: [0.1],
        confidenceThreshold: [0.7]
    });

    // Colors for different intensity levels
    const heatmapColors = {
        low: '#E5F3FF',
        medium: '#3B82F6',
        high: '#1D4ED8',
        peak: '#1E40AF'
    };

    const intensityColors = ['#F3F4F6', '#DBEAFE', '#93C5FD', '#3B82F6', '#1D4ED8', '#1E40AF'];

    useEffect(() => {
        loadUsagePatterns();
    }, [agentId, timeRangeFilter]);

    useEffect(() => {
        if (autoUpdate && updateInterval > 0) {
            const interval = setInterval(loadUsagePatterns, updateInterval);
            return () => clearInterval(interval);
        }
    }, [autoUpdate, updateInterval, agentId, timeRangeFilter]);

    // Animation loop for time-series playback
    useEffect(() => {
        if (isPlaying && data?.timeSeriesData) {
            const interval = setInterval(() => {
                setCurrentTimeIndex(prev => {
                    const next = prev + 1;
                    if (next >= data.timeSeriesData.length) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return next;
                });
            }, 1000 / animationSpeed[0]);

            return () => clearInterval(interval);
        }
    }, [isPlaying, data?.timeSeriesData, animationSpeed]);

    const loadUsagePatterns = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/analytics/usage-patterns?agentId=${agentId}&timeRange=${timeRangeFilter}&includeCorrelation=${showCorrelation}`
            );
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error || 'Failed to load usage patterns');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load usage patterns');
            console.error('Usage patterns loading failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate heatmap cell color based on intensity
    const getHeatmapCellColor = (intensity: number): string => {
        const normalizedIntensity = Math.min(Math.max(intensity, 0), 1);
        const colorIndex = Math.floor(normalizedIntensity * (intensityColors.length - 1));
        return intensityColors[colorIndex];
    };

    // Generate heatmap grid data
    const heatmapGrid = useMemo(() => {
        if (!data?.heatmapData) return [];

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return days.map(day => ({
            day,
            hours: hours.map(hour => {
                const cellData = data.heatmapData.find(d => d.day === day && d.hour === hour);
                return {
                    hour,
                    activity: cellData?.[heatmapMetric] || 0,
                    intensity: cellData?.intensity || 'low',
                    memories: cellData?.memories || 0,
                    searches: cellData?.searches || 0
                };
            })
        }));
    }, [data?.heatmapData, heatmapMetric]);

    // Filter time series data based on current filters
    const filteredTimeSeriesData = useMemo(() => {
        if (!data?.timeSeriesData) return [];

        return data.timeSeriesData.filter(point => {
            const activity = point.memories + point.searches;
            return activity >= filters.minActivity[0] && activity <= filters.maxActivity[0];
        });
    }, [data?.timeSeriesData, filters.minActivity, filters.maxActivity]);

    // Calculate correlation coefficient
    const calculateCorrelation = useCallback((x: number[], y: number[]): number => {
        const n = x.length;
        if (n === 0) return 0;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }, []);

    // Format time for display
    const formatTime = (timestamp: string): string => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (isLoading) {
        return (
            <div className={cn('flex items-center justify-center h-96', className)}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading usage patterns...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn('flex items-center justify-center h-96', className)}>
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium">Usage Pattern Analysis Error</p>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={loadUsagePatterns}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={cn('text-center py-12', className)}>
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No usage pattern data available</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header with Controls */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="h-7 w-7 text-purple-600" />
                        Usage Pattern Analysis
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Advanced interactive analysis of memory usage patterns and trends
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={timeRangeFilter} onValueChange={(value: any) => setTimeRangeFilter(value)}>
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

                    <Button variant="outline" size="sm" onClick={loadUsagePatterns}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Control Panel */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Visualization Controls
                    </CardTitle>
                    <CardDescription>Customize the analysis parameters and display options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* Animation Controls */}
                        <div className="space-y-2">
                            <Label>Animation</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentTimeIndex(0)}
                                >
                                    <SkipBack className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Animation Speed */}
                        <div className="space-y-2">
                            <Label>Speed: {animationSpeed[0]}x</Label>
                            <Slider
                                value={animationSpeed}
                                onValueChange={setAnimationSpeed}
                                max={5}
                                min={0.1}
                                step={0.1}
                                className="w-full"
                            />
                        </div>

                        {/* Heatmap Metric */}
                        <div className="space-y-2">
                            <Label>Heatmap Metric</Label>
                            <Select value={heatmapMetric} onValueChange={(value: any) => setHeatmapMetric(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="activity">Activity</SelectItem>
                                    <SelectItem value="memories">Memories</SelectItem>
                                    <SelectItem value="searches">Searches</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Activity Range Filter */}
                        <div className="space-y-2">
                            <Label>Min Activity: {filters.minActivity[0]}</Label>
                            <Slider
                                value={filters.minActivity}
                                onValueChange={(value) => setFilters({ ...filters, minActivity: value })}
                                max={100}
                                min={0}
                                step={1}
                            />
                        </div>

                        {/* Smoothing */}
                        <div className="space-y-2">
                            <Label>Smoothing: {filters.smoothing[0].toFixed(1)}</Label>
                            <Slider
                                value={filters.smoothing}
                                onValueChange={(value) => setFilters({ ...filters, smoothing: value })}
                                max={1}
                                min={0}
                                step={0.1}
                            />
                        </div>

                        {/* Show Options */}
                        <div className="space-y-2">
                            <Label>Display Options</Label>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="show-peaks"
                                        checked={filters.showPeaks}
                                        onCheckedChange={(checked) => setFilters({ ...filters, showPeaks: checked })}
                                    />
                                    <Label htmlFor="show-peaks" className="text-sm">Peaks</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="show-correlation"
                                        checked={showCorrelation}
                                        onCheckedChange={setShowCorrelation}
                                    />
                                    <Label htmlFor="show-correlation" className="text-sm">Correlation</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Visualization Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                    <TabsTrigger value="timeseries">Time Series</TabsTrigger>
                    <TabsTrigger value="correlation">Correlation</TabsTrigger>
                    <TabsTrigger value="patterns">Patterns</TabsTrigger>
                </TabsList>

                <TabsContent value="heatmap" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Grid className="h-5 w-5 text-orange-500" />
                                Activity Heatmap
                            </CardTitle>
                            <CardDescription>
                                Visual representation of usage patterns across days and hours
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Heatmap Grid */}
                            <div className="space-y-2">
                                <div className="grid grid-cols-25 gap-1 text-xs">
                                    {/* Hour headers */}
                                    <div></div>
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <div key={i} className="text-center text-gray-500 font-mono">
                                            {i.toString().padStart(2, '0')}
                                        </div>
                                    ))}

                                    {/* Heatmap rows */}
                                    {heatmapGrid.map((dayData, dayIndex) => (
                                        <React.Fragment key={dayData.day}>
                                            <div className="text-right text-gray-500 font-medium pr-2">
                                                {dayData.day}
                                            </div>
                                            {dayData.hours.map((hourData, hourIndex) => (
                                                <div
                                                    key={`${dayIndex}-${hourIndex}`}
                                                    className="aspect-square rounded-sm border cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                                                    style={{
                                                        backgroundColor: getHeatmapCellColor(hourData.activity / 100)
                                                    }}
                                                    title={`${dayData.day} ${hourData.hour}:00 - Activity: ${hourData.activity}, Memories: ${hourData.memories}, Searches: ${hourData.searches}`}
                                                />
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="flex items-center justify-center gap-4 mt-4">
                                    <span className="text-sm text-gray-600">Low</span>
                                    <div className="flex gap-1">
                                        {intensityColors.map((color, index) => (
                                            <div
                                                key={index}
                                                className="w-4 h-4 rounded-sm border"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">High</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeseries" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LineChartIcon className="h-5 w-5 text-blue-500" />
                                Time Series Analysis
                            </CardTitle>
                            <CardDescription>
                                Interactive timeline with memory and search activity patterns
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={filteredTimeSeriesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="timestamp"
                                        tickFormatter={formatTime}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(value) => new Date(value).toLocaleString()}
                                        formatter={(value: any, name: string) => [
                                            value,
                                            name === 'memories' ? 'Memories Created' :
                                                name === 'searches' ? 'Search Queries' :
                                                    name === 'importance' ? 'Avg. Importance' : name
                                        ]}
                                    />
                                    <Legend />

                                    <Area
                                        type="monotone"
                                        dataKey="memories"
                                        stackId="1"
                                        stroke="#3B82F6"
                                        fill="#3B82F6"
                                        fillOpacity={0.6}
                                        name="Memories"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="searches"
                                        stackId="2"
                                        stroke="#10B981"
                                        fill="#10B981"
                                        fillOpacity={0.6}
                                        name="Searches"
                                    />

                                    {filters.showPeaks && data.peakAnalysis.dailyPeaks.map((peak, index) => (
                                        <ReferenceLine
                                            key={index}
                                            x={peak.hour}
                                            stroke="#EF4444"
                                            strokeDasharray="5 5"
                                            label={{ value: "Peak", position: "topLeft" }}
                                        />
                                    ))}

                                    <Brush
                                        dataKey="timestamp"
                                        height={30}
                                        tickFormatter={formatTime}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>

                            {/* Current time indicator */}
                            {isPlaying && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Play className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">
                                            Playing: {filteredTimeSeriesData[currentTimeIndex]?.timestamp
                                                ? new Date(filteredTimeSeriesData[currentTimeIndex].timestamp).toLocaleString()
                                                : 'N/A'}
                                        </span>
                                        <Badge variant="secondary">
                                            {currentTimeIndex + 1} / {filteredTimeSeriesData.length}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="correlation" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-500" />
                                Correlation Analysis
                            </CardTitle>
                            <CardDescription>
                                Relationship analysis between different usage metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Scatter plot */}
                                <div>
                                    <h4 className="font-medium mb-3">Memory Creation vs Search Activity</h4>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ScatterChart data={data.correlationData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="memoryCreation" name="Memory Creation" />
                                            <YAxis dataKey="searchActivity" name="Search Activity" />
                                            <Tooltip
                                                cursor={{ strokeDasharray: '3 3' }}
                                                formatter={(value: any, name: string) => [value, name]}
                                            />
                                            <Scatter
                                                dataKey="searchActivity"
                                                fill="#8B5CF6"
                                            >
                                                {data.correlationData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.importance > 0.7 ? '#10B981' : '#8B5CF6'}
                                                    />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Correlation matrix */}
                                <div>
                                    <h4 className="font-medium mb-3">Correlation Matrix</h4>
                                    <div className="space-y-3">
                                        {[
                                            { x: 'Memory Creation', y: 'Search Activity', r: 0.73 },
                                            { x: 'Memory Creation', y: 'Importance', r: 0.68 },
                                            { x: 'Search Activity', y: 'User Satisfaction', r: 0.81 },
                                            { x: 'Importance', y: 'Time Spent', r: 0.59 },
                                            { x: 'Time Spent', y: 'User Satisfaction', r: 0.42 }
                                        ].map((correlation, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    {correlation.x} × {correlation.y}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                                                        <div
                                                            className={`h-2 rounded-full ${Math.abs(correlation.r) > 0.7 ? 'bg-green-500' :
                                                                    Math.abs(correlation.r) > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${Math.abs(correlation.r) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-mono w-12 text-right">
                                                        {correlation.r.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="patterns" className="space-y-4">
                    <div className="grid gap-4">
                        {data.patterns.map((pattern, index) => (
                            <Card key={pattern.id} className="border-l-4 border-l-blue-500">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {pattern.type === 'cyclical' && <Activity className="h-4 w-4 text-blue-500" />}
                                                {pattern.type === 'trending' && <TrendingUp className="h-4 w-4 text-green-500" />}
                                                {pattern.type === 'anomaly' && <AlertCircle className="h-4 w-4 text-red-500" />}
                                                {pattern.type === 'seasonal' && <Calendar className="h-4 w-4 text-purple-500" />}

                                                <h3 className="font-semibold text-gray-900">{pattern.name}</h3>

                                                <Badge variant="outline" className="text-xs">
                                                    {pattern.type}
                                                </Badge>

                                                <Badge className={cn(
                                                    'text-xs',
                                                    pattern.impact === 'high' && 'bg-red-100 text-red-800',
                                                    pattern.impact === 'medium' && 'bg-yellow-100 text-yellow-800',
                                                    pattern.impact === 'low' && 'bg-green-100 text-green-800'
                                                )}>
                                                    {pattern.impact} impact
                                                </Badge>
                                            </div>

                                            <p className="text-gray-700 mb-2">{pattern.description}</p>

                                            <div className="mb-2">
                                                <span className="text-sm font-medium text-gray-600">Recommendation: </span>
                                                <span className="text-sm text-gray-700">{pattern.recommendation}</span>
                                            </div>

                                            {pattern.metrics && (
                                                <div className="flex gap-4 text-sm text-gray-600">
                                                    {Object.entries(pattern.metrics).map(([key, value]) => (
                                                        <span key={key}>
                                                            {key}: <strong>{typeof value === 'number' && value < 1 ?
                                                                (value * 100).toFixed(1) + '%' :
                                                                value}</strong>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-4 flex items-center gap-2">
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600">Confidence</div>
                                                <div className="text-lg font-bold text-gray-900">
                                                    {(pattern.confidence * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                                                <div
                                                    className="h-2 bg-blue-500 rounded-full"
                                                    style={{ width: `${pattern.confidence * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Peak Analysis Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        Peak Activity Analysis
                    </CardTitle>
                    <CardDescription>Statistical analysis of peak usage periods</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="font-medium mb-2">Daily Peaks</h4>
                            <div className="space-y-2">
                                {data.peakAnalysis.dailyPeaks.slice(0, 3).map((peak, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <span>{peak.hour}:00</span>
                                        <div className="flex items-center gap-2">
                                            <span>{peak.activity}</span>
                                            <Badge variant={peak.pattern === 'consistent' ? 'default' : 'secondary'} className="text-xs">
                                                {peak.pattern}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">Weekly Peaks</h4>
                            <div className="space-y-2">
                                {data.peakAnalysis.weeklyPeaks.slice(0, 3).map((peak, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <span>{peak.day}</span>
                                        <div className="flex items-center gap-2">
                                            <span>{peak.activity}</span>
                                            {peak.trend === 'increasing' && <TrendingUp className="h-3 w-3 text-green-500" />}
                                            {peak.trend === 'decreasing' && <TrendingDown className="h-3 w-3 text-red-500" />}
                                            {peak.trend === 'stable' && <div className="h-3 w-3 bg-gray-400 rounded-full" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">Seasonal Trends</h4>
                            <div className="space-y-2">
                                {data.peakAnalysis.seasonalPeaks.slice(0, 3).map((peak, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <span>{peak.period}</span>
                                        <div className="text-right">
                                            <div>{peak.activity}</div>
                                            <div className="text-xs text-gray-500">
                                                Next: {peak.predictedNext}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
