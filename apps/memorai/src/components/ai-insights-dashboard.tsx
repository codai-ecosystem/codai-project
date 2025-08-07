'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Brain,
    TrendingUp,
    Target,
    Sparkles,
    BarChart3,
    PieChart,
    Lightbulb,
    Zap,
    Users,
    Clock,
    Tag,
    Star,
    ArrowUp,
    ArrowDown,
    ArrowRight,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    XCircle,
    Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Memory } from '@/types/memory';
import {
    AIInsightsDashboard as AIInsightsDashboardType,
    MemoryPattern,
    MemoryRecommendation,
    MemoryCluster,
    AIInsight,
    MemoryHealthScore,
    PatternType,
    RecommendationType,
    RecommendationImpact,
    InsightType
} from '@/types/ai-insights';
import { aiInsightsService, AIInsightsUtils } from '@/lib/ai-insights';
import { useNotificationContext } from '@/contexts/notification-context';
import { Loading } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const insightCardVariants = cva(
    "transition-all duration-200 hover:shadow-md",
    {
        variants: {
            impact: {
                critical: "border-red-200 bg-red-50/50",
                high: "border-orange-200 bg-orange-50/50",
                medium: "border-yellow-200 bg-yellow-50/50",
                low: "border-blue-200 bg-blue-50/50"
            }
        },
        defaultVariants: {
            impact: "low"
        }
    }
);

interface AIInsightsDashboardProps {
    memories: Memory[];
    userId: string;
    className?: string;
    onRecommendationAction?: (recommendation: MemoryRecommendation) => void;
    onPatternExplore?: (pattern: MemoryPattern) => void;
    onClusterView?: (cluster: MemoryCluster) => void;
}

export const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
    memories,
    userId,
    className,
    onRecommendationAction,
    onPatternExplore,
    onClusterView
}) => {
    const [dashboardData, setDashboardData] = useState<AIInsightsDashboardType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const { showNotification } = useNotificationContext();

    // Generate AI insights dashboard
    const generateInsights = async (showLoadingState = true) => {
        try {
            if (showLoadingState) {
                setIsLoading(true);
            } else {
                setIsRefreshing(true);
            }

            const insights = await aiInsightsService.generateAIInsightsDashboard(
                memories,
                userId,
                {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                    end: new Date()
                }
            );

            setDashboardData(insights);
            setLastUpdated(new Date());

            if (!showLoadingState) {
                showNotification({
                    type: 'success',
                    title: 'Insights Updated',
                    message: 'AI insights have been refreshed with latest data'
                });
            }
        } catch (error) {
            console.error('Failed to generate AI insights:', error);
            showNotification({
                type: 'error',
                title: 'Insights Failed',
                message: 'Failed to generate AI insights. Please try again.'
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Generate insights on mount and when memories change
    useEffect(() => {
        if (memories.length > 0) {
            generateInsights();
        } else {
            setIsLoading(false);
        }
    }, [memories.length, userId]);

    // Refresh insights when memories are updated
    useEffect(() => {
        if (dashboardData && memories.length > 0) {
            const debounceTimer = setTimeout(() => {
                generateInsights(false);
            }, 2000); // Debounce updates

            return () => clearTimeout(debounceTimer);
        }
    }, [memories]);

    const handleRecommendationAction = (recommendation: MemoryRecommendation, action: 'accept' | 'dismiss') => {
        if (action === 'accept' && onRecommendationAction) {
            onRecommendationAction(recommendation);
        }

        showNotification({
            type: action === 'accept' ? 'success' : 'info',
            title: action === 'accept' ? 'Recommendation Applied' : 'Recommendation Dismissed',
            message: recommendation.title
        });
    };

    const getImpactIcon = (impact: RecommendationImpact) => {
        switch (impact) {
            case RecommendationImpact.CRITICAL: return <AlertCircle className="h-4 w-4 text-red-600" />;
            case RecommendationImpact.HIGH: return <XCircle className="h-4 w-4 text-orange-600" />;
            case RecommendationImpact.MEDIUM: return <Info className="h-4 w-4 text-yellow-600" />;
            case RecommendationImpact.LOW: return <CheckCircle className="h-4 w-4 text-blue-600" />;
        }
    };

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
            case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
            case 'stable': return <ArrowRight className="h-4 w-4 text-gray-600" />;
        }
    };

    const getPatternTypeIcon = (type: PatternType) => {
        switch (type) {
            case PatternType.CONTENT_SIMILARITY: return <Brain className="h-4 w-4" />;
            case PatternType.USAGE_FREQUENCY: return <TrendingUp className="h-4 w-4" />;
            case PatternType.TEMPORAL_CLUSTERING: return <Clock className="h-4 w-4" />;
            case PatternType.TAG_CORRELATION: return <Tag className="h-4 w-4" />;
            default: return <Sparkles className="h-4 w-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className={cn("space-y-6", className)}>
                <div className="flex items-center justify-center py-12">
                    <Loading size="lg">
                        <Brain className="h-8 w-8 text-primary" />
                        <span className="text-lg font-medium">Generating AI Insights...</span>
                        <span className="text-sm text-muted-foreground">Analyzing your memory patterns</span>
                    </Loading>
                </div>
            </div>
        );
    }

    if (!dashboardData || memories.length === 0) {
        return (
            <div className={cn("space-y-6", className)}>
                <Card className="text-center py-12">
                    <CardContent>
                        <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
                        <p className="text-muted-foreground mb-4">
                            {memories.length === 0
                                ? "Create some memories to see AI-powered insights and recommendations"
                                : "AI insights will appear here once analysis is complete"
                            }
                        </p>
                        {memories.length > 0 && (
                            <Button onClick={() => generateInsights()} disabled={isRefreshing}>
                                <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                                Generate Insights
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">AI Insights</h2>
                        <p className="text-sm text-muted-foreground">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateInsights(false)}
                    disabled={isRefreshing}
                >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Memory Health Score */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-primary" />
                        <span>Memory Health Score</span>
                        <Badge variant="secondary" className="ml-auto">
                            {dashboardData.healthScore.overall}/100
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(dashboardData.healthScore.dimensions).map(([dimension, score]) => (
                            <div key={dimension} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="capitalize">{dimension.replace('_', ' ')}</span>
                                    <span className={AIInsightsUtils.getHealthScoreColor(score)}>
                                        {score}%
                                    </span>
                                </div>
                                <Progress value={score} className="h-2" />
                            </div>
                        ))}
                    </div>

                    {dashboardData.healthScore.recommendations.length > 0 && (
                        <div className="mt-4 p-3 bg-background/50 rounded-lg">
                            <h4 className="text-sm font-medium mb-2">Health Recommendations:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {dashboardData.healthScore.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tabs for Different Insight Types */}
            <Tabs defaultValue="insights" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="insights" className="flex items-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span>Insights</span>
                    </TabsTrigger>
                    <TabsTrigger value="recommendations" className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4" />
                        <span>Recommendations</span>
                    </TabsTrigger>
                    <TabsTrigger value="patterns" className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Patterns</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center space-x-2">
                        <PieChart className="h-4 w-4" />
                        <span>Analytics</span>
                    </TabsTrigger>
                </TabsList>

                {/* AI Insights Tab */}
                <TabsContent value="insights" className="space-y-4">
                    {dashboardData.insights.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dashboardData.insights.map((insight) => (
                                <Card key={insight.id} className={insightCardVariants({ impact: insight.impact })}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">{insight.title}</CardTitle>
                                            <div className="flex items-center space-x-1">
                                                {getTrendIcon(insight.trend)}
                                                {getImpactIcon(insight.impact)}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {insight.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-primary">
                                                {insight.value}
                                            </span>
                                            {insight.actionable && (
                                                <Badge variant="outline" className="text-xs">
                                                    Actionable
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-8">
                            <CardContent>
                                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">
                                    No insights available yet. Keep using MemorAI to generate meaningful insights.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-4">
                    {dashboardData.recommendations.length > 0 ? (
                        <div className="space-y-4">
                            {dashboardData.recommendations.map((recommendation) => (
                                <Card key={recommendation.id} className={insightCardVariants({ impact: recommendation.impact })}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base flex items-center space-x-2">
                                                    {getImpactIcon(recommendation.impact)}
                                                    <span>{recommendation.title}</span>
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {recommendation.description}
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                {AIInsightsUtils.formatConfidence(recommendation.confidence)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                <span>Impact: {AIInsightsUtils.formatImpact(recommendation.impact)}</span>
                                                <span>Affects: {recommendation.relatedMemories.length} memories</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRecommendationAction(recommendation, 'dismiss')}
                                                >
                                                    Dismiss
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleRecommendationAction(recommendation, 'accept')}
                                                >
                                                    Apply
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-8">
                            <CardContent>
                                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">
                                    No recommendations available. Your memory system is well-organized!
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Patterns Tab */}
                <TabsContent value="patterns" className="space-y-4">
                    {dashboardData.patterns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dashboardData.patterns.map((pattern) => (
                                <Card key={pattern.id} className="hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => onPatternExplore?.(pattern)}>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center space-x-2">
                                            {getPatternTypeIcon(pattern.type)}
                                            <span>{pattern.name}</span>
                                            <Badge variant="secondary" className="ml-auto">
                                                {AIInsightsUtils.formatConfidence(pattern.confidence)}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {pattern.description}
                                        </p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">
                                                Type: {AIInsightsUtils.formatPatternType(pattern.type)}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {pattern.memories.length} memories
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-8">
                            <CardContent>
                                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">
                                    No patterns detected yet. Add more memories to discover interesting patterns.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Key Metrics */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{dashboardData.analytics.totalMemories}</div>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardData.analytics.memoriesCreated} created this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{dashboardData.analytics.engagementScore}</div>
                                <Progress value={dashboardData.analytics.engagementScore} className="mt-2" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-semibold capitalize">
                                    {dashboardData.analytics.topCategories[0]?.category || 'None'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardData.analytics.topCategories[0]?.count || 0} memories
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Memory Clusters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{dashboardData.clusters.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Organized groups found
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Categories and Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Top Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {dashboardData.analytics.topCategories.slice(0, 5).map((category, index) => (
                                        <div key={category.category} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-primary opacity-80"
                                                    style={{ opacity: 1 - (index * 0.15) }} />
                                                <span className="text-sm capitalize">{category.category}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium">{category.count}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({Math.round(category.percentage)}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Popular Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {dashboardData.analytics.topTags.slice(0, 5).map((tag, index) => (
                                        <div key={tag.tag} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Tag className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{tag.tag}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium">{tag.count}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    uses
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AIInsightsDashboard;
