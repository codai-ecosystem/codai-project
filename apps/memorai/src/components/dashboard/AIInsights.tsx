/**
 * AI Insights Module
 * Enhanced with Microsoft TypeScript best practices and strict typing
 * Extracted from ai-insights-dashboard.tsx following Microsoft modular patterns
 */
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
// Standard lucide-react import - optimized by Next.js experimental.optimizePackageImports
import {
    Brain,
    Lightbulb,
    TrendingUp,
    Users,
    Target,
    Zap,
    Star,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIInsight, InsightStats, APIError } from '../../types';

// Component-specific types following Microsoft patterns
interface AIInsightsState {
    readonly insights: readonly AIInsight[];
    readonly stats: InsightStats | null;
    readonly isLoading: boolean;
    readonly error: APIError | null;
}

interface InsightIconProps {
    readonly type: AIInsight['type'];
    readonly className?: string;
}

interface InsightCardProps {
    readonly insight: AIInsight;
    readonly onInsightAction?: (insightId: string) => void;
}

// Type guards for runtime validation
const isValidInsightType = (type: string): type is AIInsight['type'] => {
    return ['pattern', 'suggestion', 'connection', 'trend'].includes(type);
};

const validateInsight = (insight: unknown): insight is AIInsight => {
    if (!insight || typeof insight !== 'object') return false;
    const i = insight as Record<string, unknown>;

    return (
        typeof i.id === 'string' &&
        typeof i.title === 'string' &&
        typeof i.description === 'string' &&
        typeof i.confidence === 'number' &&
        i.confidence >= 0 && i.confidence <= 1 &&
        Array.isArray(i.relevantMemories) &&
        i.relevantMemories.every(mem => typeof mem === 'string') &&
        typeof i.createdAt === 'string' &&
        isValidInsightType(i.type as string)
    );
};

// Memoized sub-components following Microsoft performance patterns
const InsightIcon = React.memo<InsightIconProps>(({ type, className = "h-5 w-5" }) => {
    const IconComponent = useMemo(() => {
        switch (type) {
            case 'pattern': return TrendingUp;
            case 'suggestion': return Lightbulb;
            case 'connection': return Users;
            case 'trend': return Target;
            default: return Brain;
        }
    }, [type]);

    return <IconComponent className={className} />;
});
InsightIcon.displayName = 'InsightIcon';

const InsightCard = React.memo<InsightCardProps>(({ insight, onInsightAction }) => {
    const handleAction = useCallback(() => {
        onInsightAction?.(insight.id);
    }, [insight.id, onInsightAction]);

    const insightColor = useMemo(() => {
        switch (insight.type) {
            case 'pattern': return 'bg-blue-500';
            case 'suggestion': return 'bg-yellow-500';
            case 'connection': return 'bg-green-500';
            case 'trend': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    }, [insight.type]);

    const insightTypeLabel = useMemo(() => {
        switch (insight.type) {
            case 'pattern': return 'Pattern Analysis';
            case 'suggestion': return 'AI Suggestion';
            case 'connection': return 'Memory Connection';
            case 'trend': return 'Usage Trend';
            default: return 'AI Insight';
        }
    }, [insight.type]);

    const formattedDate = useMemo(() => {
        try {
            return new Date(insight.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    }, [insight.createdAt]);

    const displayedMemories = useMemo(() => {
        return insight.relevantMemories.slice(0, 3);
    }, [insight.relevantMemories]);

    const additionalMemoriesCount = useMemo(() => {
        return Math.max(0, insight.relevantMemories.length - 3);
    }, [insight.relevantMemories.length]);

    const confidencePercentage = useMemo(() => {
        return Math.round(Math.max(0, Math.min(100, insight.confidence * 100)));
    }, [insight.confidence]);

    return (
        <Card className="hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
            <CardContent className="p-6">
                <article>
                    <div className="flex items-start space-x-4">
                        <div
                            className={`p-2 rounded-full ${insightColor}`}
                            role="img"
                            aria-label={`${insightTypeLabel} indicator`}
                            title={insightTypeLabel}
                        >
                            <InsightIcon type={insight.type} className="h-5 w-5 text-white" />
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <h3
                                    className="text-lg font-medium text-gray-900 dark:text-white"
                                    id={`insight-title-${insight.id}`}
                                >
                                    {insight.title}
                                </h3>
                                <div
                                    className="flex items-center space-x-2"
                                    role="group"
                                    aria-label={`Insight metadata for ${insight.title}`}
                                >
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                        role="status"
                                        aria-label={`${confidencePercentage} percent confidence level`}
                                    >
                                        {confidencePercentage}% confidence
                                    </Badge>
                                    <time
                                        className="text-xs text-gray-500 flex items-center"
                                        dateTime={insight.createdAt}
                                        aria-label={`Created on ${formattedDate}`}
                                    >
                                        <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                                        {formattedDate}
                                    </time>
                                </div>
                            </div>

                            <p
                                className="text-gray-600 dark:text-gray-400"
                                aria-describedby={`insight-title-${insight.id}`}
                            >
                                {insight.description}
                            </p>

                            <div
                                className="flex items-center space-x-2"
                                role="group"
                                aria-label="Related memories"
                            >
                                <span
                                    className="text-sm text-gray-500"
                                    id={`related-memories-${insight.id}`}
                                >
                                    Related:
                                </span>
                                <div
                                    className="flex space-x-1 flex-wrap"
                                    role="list"
                                    aria-labelledby={`related-memories-${insight.id}`}
                                >
                                    {displayedMemories.map((memory) => (
                                        <Badge
                                            key={memory}
                                            variant="secondary"
                                            className="text-xs"
                                            role="listitem"
                                            aria-label={`Related memory: ${memory}`}
                                        >
                                            {memory}
                                        </Badge>
                                    ))}
                                    {additionalMemoriesCount > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                            role="listitem"
                                            aria-label={`${additionalMemoriesCount} additional related memories`}
                                        >
                                            +{additionalMemoriesCount} more
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </CardContent>
        </Card>
    );
});
InsightCard.displayName = 'InsightCard';

// Loading skeleton component
const LoadingSkeleton = React.memo(() => (
    <div className="space-y-6" aria-live="polite" aria-label="Loading AI insights dashboard">
        <div className="sr-only">Loading AI insights statistics and recent analysis...</div>
        <div
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
            role="region"
            aria-label="AI insights statistics loading"
        >
            {Array.from({ length: 4 }, (_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                        <div
                            className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"
                            aria-hidden="true"
                        ></div>
                        <div
                            className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"
                            aria-hidden="true"
                        ></div>
                    </CardContent>
                </Card>
            ))}
        </div>
        <div
            className="space-y-4"
            role="region"
            aria-label="AI insights loading"
        >
            {Array.from({ length: 3 }, (_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                        <div
                            className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"
                            aria-hidden="true"
                        ></div>
                        <div
                            className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"
                            aria-hidden="true"
                        ></div>
                        <div
                            className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"
                            aria-hidden="true"
                        ></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

export default function AIInsights(): React.JSX.Element {
    const [state, setState] = useState<AIInsightsState>({
        insights: [],
        stats: null,
        isLoading: true,
        error: null
    });

    // Memoized handlers following Microsoft patterns
    const handleGenerateInsights = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            // TODO: Replace with actual AI insights API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Simulated insight generation
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof APIError ? error : new APIError('Failed to generate insights', 'INSIGHTS_ERROR'),
                isLoading: false
            }));
        }
    }, []);

    const handleInsightAction = useCallback((insightId: string) => {
        console.log('Insight action triggered for:', insightId);
        // TODO: Implement insight action handling
    }, []);

    // Load insights with proper error handling and validation
    useEffect(() => {
        const loadInsights = async () => {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            try {
                // Simulated AI insights data - replace with actual AI API
                await new Promise(resolve => setTimeout(resolve, 1200));

                const mockInsights: AIInsight[] = [
                    {
                        id: '1',
                        type: 'pattern',
                        title: 'Weekly Meeting Pattern Detected',
                        description: 'You consistently create memories about team meetings on Mondays and Thursdays. Consider setting up automated meeting summaries.',
                        confidence: 0.89,
                        relevantMemories: ['meeting-alpha-team', 'weekly-standup', 'project-review'],
                        createdAt: '2025-08-21T10:30:00Z',
                        updatedAt: '2025-08-21T10:30:00Z'
                    },
                    {
                        id: '2',
                        type: 'suggestion',
                        title: 'Similar Ideas Connection',
                        description: 'Your "mobile app redesign" memory shares concepts with "user experience improvements". Consider linking these for better organization.',
                        confidence: 0.76,
                        relevantMemories: ['mobile-app-redesign', 'ux-improvements'],
                        createdAt: '2025-08-21T09:15:00Z',
                        updatedAt: '2025-08-21T09:15:00Z'
                    },
                    {
                        id: '3',
                        type: 'connection',
                        title: 'Cross-Project Knowledge Bridge',
                        description: 'The solution you documented for Project Alpha could be applicable to the current challenge in Project Beta.',
                        confidence: 0.82,
                        relevantMemories: ['project-alpha-solution', 'project-beta-challenge'],
                        createdAt: '2025-08-21T08:45:00Z',
                        updatedAt: '2025-08-21T08:45:00Z'
                    },
                    {
                        id: '4',
                        type: 'trend',
                        title: 'Learning Focus Shift',
                        description: 'Your recent memories show increased interest in AI/ML topics. Consider creating a dedicated learning pathway.',
                        confidence: 0.71,
                        relevantMemories: ['ml-course-notes', 'ai-research-papers', 'neural-networks'],
                        createdAt: '2025-08-21T07:20:00Z',
                        updatedAt: '2025-08-21T07:20:00Z'
                    }
                ];

                // Validate insights data
                const validatedInsights = mockInsights.filter(validateInsight);
                if (validatedInsights.length !== mockInsights.length) {
                    console.warn('Some insights failed validation and were filtered out');
                }

                const mockStats: InsightStats = {
                    totalInsights: 47,
                    patternsFound: 12,
                    suggestionsGenerated: 18,
                    connectionsDiscovered: 17
                };

                setState({
                    insights: validatedInsights,
                    stats: mockStats,
                    isLoading: false,
                    error: null
                });

            } catch (error) {
                const apiError = error instanceof APIError
                    ? error
                    : new APIError('Failed to load AI insights', 'INSIGHTS_LOAD_ERROR');

                setState(prev => ({
                    ...prev,
                    error: apiError,
                    isLoading: false
                }));
                console.error('Failed to load AI insights:', error);
            }
        };

        loadInsights();
    }, []);

    // Memoized computations
    const statsCards = useMemo(() => {
        if (!state.stats) return [];

        return [
            {
                label: 'Total Insights',
                value: state.stats.totalInsights,
                icon: Brain,
                color: 'text-blue-500'
            },
            {
                label: 'Patterns Found',
                value: state.stats.patternsFound,
                icon: TrendingUp,
                color: 'text-blue-500'
            },
            {
                label: 'Suggestions',
                value: state.stats.suggestionsGenerated,
                icon: Lightbulb,
                color: 'text-yellow-500'
            },
            {
                label: 'Connections',
                value: state.stats.connectionsDiscovered,
                icon: Users,
                color: 'text-green-500'
            }
        ];
    }, [state.stats]);

    // Early returns for loading and error states
    if (state.isLoading) {
        return <LoadingSkeleton />;
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
                            <Target className="h-5 w-5" aria-hidden="true" />
                            <h3 className="font-medium">Error Loading AI Insights</h3>
                        </div>
                        <p className="text-red-500 mt-2" id="error-description">
                            {state.error.message}
                        </p>
                        <Button
                            onClick={handleGenerateInsights}
                            className="mt-4"
                            size="sm"
                            variant="outline"
                            aria-describedby="error-description"
                            aria-label="Retry loading AI insights"
                        >
                            Retry Loading
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6" role="main" aria-label="AI insights dashboard">
            {/* AI Insights Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Brain
                        className="h-6 w-6 text-blue-600"
                        aria-hidden="true"
                        role="img"
                        aria-label="AI brain icon"
                    />
                    <h1
                        className="text-xl font-semibold text-gray-900 dark:text-white"
                        id="ai-insights-title"
                    >
                        AI-Powered Insights
                    </h1>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateInsights}
                    disabled={state.isLoading}
                    aria-describedby="ai-insights-title"
                    aria-label="Generate new AI insights from your memories"
                    title="Analyze your memories to discover new patterns and connections"
                >
                    <Zap className="h-4 w-4 mr-2" aria-hidden="true" />
                    Generate New Insights
                </Button>
            </div>

            {/* Stats Overview */}
            {state.stats && (
                <section
                    className="grid grid-cols-1 md:grid-cols-4 gap-4"
                    role="region"
                    aria-label="AI insights statistics overview"
                >
                    {statsCards.map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p
                                            className="text-sm text-gray-600 dark:text-gray-400"
                                            id={`stat-label-${stat.label.replace(/\s+/g, '-').toLowerCase()}`}
                                        >
                                            {stat.label}
                                        </p>
                                        <p
                                            className="text-2xl font-bold text-gray-900 dark:text-white"
                                            aria-labelledby={`stat-label-${stat.label.replace(/\s+/g, '-').toLowerCase()}`}
                                            role="status"
                                            aria-live="polite"
                                        >
                                            {stat.value}
                                        </p>
                                    </div>
                                    <stat.icon
                                        className={`h-8 w-8 ${stat.color}`}
                                        aria-hidden="true"
                                        role="img"
                                        aria-label={`${stat.label} icon`}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            )}

            {/* Insights List */}
            <section className="space-y-4">
                <h2
                    className="text-lg font-medium text-gray-900 dark:text-white"
                    id="recent-insights-heading"
                >
                    Recent Insights ({state.insights.length})
                </h2>
                {state.insights.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Brain
                                className="h-12 w-12 mx-auto text-gray-400 mb-4"
                                aria-hidden="true"
                                role="img"
                                aria-label="AI brain icon"
                            />
                            <h3
                                className="text-lg font-medium text-gray-900 dark:text-white mb-2"
                                id="no-insights-title"
                            >
                                No Insights Available
                            </h3>
                            <p
                                className="text-gray-500 mb-4"
                                id="no-insights-description"
                            >
                                Start creating memories to get AI-powered insights about your patterns and connections.
                            </p>
                            <Button
                                onClick={handleGenerateInsights}
                                aria-describedby="no-insights-description"
                                aria-label="Generate AI insights from your memories"
                            >
                                Generate Insights
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div
                        role="list"
                        aria-labelledby="recent-insights-heading"
                        aria-live="polite"
                        className="space-y-4"
                    >
                        {state.insights.map((insight, index) => (
                            <div key={insight.id} role="listitem">
                                <InsightCard
                                    insight={insight}
                                    onInsightAction={handleInsightAction}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}