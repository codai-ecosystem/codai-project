/**
 * AI-Powered Search Component for MemorAI Phase 3.2
 * Enhanced search interface with AI insights and intelligent ranking
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Sparkles, Filter, SortDesc, Brain, Target, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Memory } from '@/types/memory';
import {
    AISearchQuery,
    AISearchResult,
    SmartSuggestion,
    IntentType,
    MatchType,
    ActionType,
    SearchMetrics
} from '@/types/ai-search';
import { aiSearchService } from '@/lib/ai-search';
import { useNotifications } from '@/contexts/NotificationContext';

interface AISearchComponentProps {
    onResultSelect?: (memory: Memory) => void;
    className?: string;
    placeholder?: string;
    enablePersonalization?: boolean;
    showAnalytics?: boolean;
}

interface SearchState {
    query: string;
    results: AISearchResult[];
    suggestions: SmartSuggestion[];
    isLoading: boolean;
    isSearching: boolean;
    showAdvanced: boolean;
    searchMetrics: SearchMetrics | null;
    selectedIntent: IntentType | null;
    filters: SearchFilters;
}

interface SearchFilters {
    timeframe: string;
    categories: string[];
    matchTypes: MatchType[];
    minRelevance: number;
}

const AISearchComponent: React.FC<AISearchComponentProps> = ({
    onResultSelect,
    className = '',
    placeholder = 'Search with AI-powered intelligence...',
    enablePersonalization = true,
    showAnalytics = true
}) => {
    const { addNotification } = useNotifications();

    const [state, setState] = useState<SearchState>({
        query: '',
        results: [],
        suggestions: [],
        isLoading: false,
        isSearching: false,
        showAdvanced: false,
        searchMetrics: null,
        selectedIntent: null,
        filters: {
            timeframe: 'all',
            categories: [],
            matchTypes: [],
            minRelevance: 0.3
        }
    });

    // Debounced search suggestions
    useEffect(() => {
        if (state.query.trim().length < 2) {
            setState(prev => ({ ...prev, suggestions: [] }));
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const suggestions = await aiSearchService.generateSmartSuggestions(
                    state.query,
                    { enablePersonalization }
                );
                setState(prev => ({ ...prev, suggestions }));
            } catch (error) {
                console.error('Error generating suggestions:', error);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [state.query, enablePersonalization]);

    // Load search metrics
    useEffect(() => {
        if (showAnalytics) {
            loadSearchMetrics();
        }
    }, [showAnalytics]);

    const loadSearchMetrics = async () => {
        try {
            const metrics = await aiSearchService.getSearchMetrics();
            setState(prev => ({ ...prev, searchMetrics: metrics }));
        } catch (error) {
            console.error('Error loading search metrics:', error);
        }
    };

    const handleSearch = useCallback(async (searchQuery?: string) => {
        const query = searchQuery || state.query;
        if (!query.trim()) return;

        setState(prev => ({ ...prev, isSearching: true, suggestions: [] }));

        try {
            console.log('🔍 Starting AI-powered search for:', query);

            const aiQuery: AISearchQuery = {
                query: query.trim(),
                context: {
                    userId: 'current-user', // Would come from auth context
                    sessionId: `session-${Date.now()}`,
                    currentCategory: state.filters.categories[0],
                    recentSearches: [] // Would be stored in local storage
                },
                personalization: {
                    usePersonalization: enablePersonalization,
                    considerSearchHistory: true,
                    considerAccessPatterns: true,
                    considerTimeContext: true,
                    boostRecentlyAccessed: true,
                    boostFrequentlyUsed: true,
                    personalizedRanking: true,
                    adaptiveFiltering: true
                },
                aiEnhancements: {
                    useNaturalLanguage: true,
                    enableQueryExpansion: true,
                    enableSemanticSimilarity: true,
                    enableConceptualSearch: true,
                    enableAutoCorrection: false,
                    enableSmartSuggestions: true,
                    useContextualRanking: true,
                    enableClusteringResults: true
                }
            };

            // Add intent if selected
            if (state.selectedIntent) {
                aiQuery.intent = {
                    type: state.selectedIntent,
                    confidence: 0.9,
                    entities: []
                };
            }

            const results = await aiSearchService.performAISearch(aiQuery);

            // Apply filters
            const filteredResults = applyFilters(results, state.filters);

            setState(prev => ({
                ...prev,
                results: filteredResults,
                isSearching: false
            }));

            addNotification({
                id: `search-${Date.now()}`,
                type: 'success',
                title: 'Search Complete',
                message: `Found ${filteredResults.length} AI-powered results`,
                duration: 3000
            });

        } catch (error) {
            console.error('AI search error:', error);
            setState(prev => ({ ...prev, isSearching: false }));
            addNotification({
                id: `search-error-${Date.now()}`,
                type: 'error',
                title: 'Search Error',
                message: 'Failed to perform AI search. Please try again.',
                duration: 5000
            });
        }
    }, [state.query, state.selectedIntent, state.filters, enablePersonalization, addNotification]);

    const applyFilters = (results: AISearchResult[], filters: SearchFilters): AISearchResult[] => {
        return results.filter(result => {
            // Relevance filter
            if (result.relevanceScore < filters.minRelevance) return false;

            // Match type filter
            if (filters.matchTypes.length > 0 &&
                !filters.matchTypes.includes(result.aiInsights.matchType)) {
                return false;
            }

            // Category filter (simplified)
            if (filters.categories.length > 0 && result.memory.tags) {
                const hasCategory = filters.categories.some(category =>
                    result.memory.tags!.some(tag =>
                        tag.toLowerCase().includes(category.toLowerCase())
                    )
                );
                if (!hasCategory) return false;
            }

            return true;
        });
    };

    const handleSuggestionClick = (suggestion: SmartSuggestion) => {
        setState(prev => ({ ...prev, query: suggestion.suggestion }));
        handleSearch(suggestion.suggestion);
    };

    const handleResultClick = (result: AISearchResult) => {
        if (onResultSelect) {
            onResultSelect(result.memory);
        }
    };

    const handleActionClick = async (result: AISearchResult, action: any) => {
        try {
            switch (action.type) {
                case ActionType.EXPLORE_RELATED:
                    // Find related memories and show them
                    if (result.relatedMemories.length > 0) {
                        addNotification({
                            id: `related-${Date.now()}`,
                            type: 'info',
                            title: 'Related Memories',
                            message: `Found ${result.relatedMemories.length} related memories`,
                            duration: 3000
                        });
                    }
                    break;

                case ActionType.REFINE_SEARCH:
                    setState(prev => ({ ...prev, showAdvanced: true }));
                    break;

                case ActionType.SAVE_SEARCH:
                    // Save search to favorites (would implement with backend)
                    addNotification({
                        id: `save-${Date.now()}`,
                        type: 'success',
                        title: 'Search Saved',
                        message: 'Search query saved to your favorites',
                        duration: 3000
                    });
                    break;

                default:
                    console.log('Action not implemented:', action.type);
            }
        } catch (error) {
            console.error('Error handling action:', error);
        }
    };

    const getMatchTypeColor = (matchType: MatchType): string => {
        switch (matchType) {
            case MatchType.EXACT: return 'bg-green-100 text-green-800';
            case MatchType.SEMANTIC: return 'bg-blue-100 text-blue-800';
            case MatchType.CONTEXTUAL: return 'bg-purple-100 text-purple-800';
            case MatchType.TEMPORAL: return 'bg-orange-100 text-orange-800';
            case MatchType.PATTERN_BASED: return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getIntentIcon = (intent: IntentType) => {
        switch (intent) {
            case IntentType.EXACT_MATCH: return <Target className="w-4 h-4" />;
            case IntentType.TEMPORAL: return <Clock className="w-4 h-4" />;
            case IntentType.TASK_ORIENTED: return <Filter className="w-4 h-4" />;
            case IntentType.EXPLORATORY: return <TrendingUp className="w-4 h-4" />;
            default: return <Brain className="w-4 h-4" />;
        }
    };

    const memoizedResults = useMemo(() => {
        return state.results.map(result => (
            <Card
                key={result.memory.id}
                className="mb-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleResultClick(result)}
            >
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-500" />
                            {result.memory.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge className={getMatchTypeColor(result.aiInsights.matchType)}>
                                {result.aiInsights.matchType.replace('_', ' ')}
                            </Badge>
                            <div className="text-sm text-gray-500">
                                {Math.round(result.relevanceScore * 100)}% match
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Memory Content Preview */}
                        <p className="text-gray-600 line-clamp-2">
                            {result.memory.content.substring(0, 200)}
                            {result.memory.content.length > 200 && '...'}
                        </p>

                        {/* AI Insights */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">AI Insights</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                                <div>Semantic: {Math.round(result.aiInsights.semanticSimilarity * 100)}%</div>
                                <div>Quality: {Math.round(result.aiInsights.qualityScore * 100)}%</div>
                                <div>Context: {Math.round(result.aiInsights.contextualRelevance * 100)}%</div>
                                <div>Temporal: {Math.round(result.aiInsights.temporalRelevance * 100)}%</div>
                            </div>
                        </div>

                        {/* Reasoning */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-800">Why this result?</span>
                            </div>
                            <p className="text-xs text-gray-600">{result.reasoning.explanation}</p>

                            {/* Confidence Score */}
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Confidence</span>
                                    <span>{Math.round(result.reasoning.confidence * 100)}%</span>
                                </div>
                                <Progress value={result.reasoning.confidence * 100} className="h-1" />
                            </div>
                        </div>

                        {/* Related Memories */}
                        {result.relatedMemories.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Related:</span>
                                {result.relatedMemories.slice(0, 2).map(related => (
                                    <Badge key={related.id} variant="outline" className="text-xs">
                                        {related.title.substring(0, 20)}...
                                    </Badge>
                                ))}
                                {result.relatedMemories.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{result.relatedMemories.length - 2} more
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Suggested Actions */}
                        <div className="flex flex-wrap gap-2">
                            {result.suggestedActions.map((action, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleActionClick(result, action);
                                    }}
                                >
                                    {action.label}
                                </Button>
                            ))}
                        </div>

                        {/* Memory Metadata */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                            <div className="flex items-center gap-4">
                                {result.memory.tags && (
                                    <div className="flex gap-1">
                                        {result.memory.tags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                {new Date(result.memory.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ));
    }, [state.results]);

return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
        <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="search" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Search
                </TabsTrigger>
                <TabsTrigger value="filters" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Advanced
                </TabsTrigger>
                {showAnalytics && (
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Analytics
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="search" className="space-y-4">
                {/* Main Search Interface */}
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-4">
                            {/* Search Input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder={placeholder}
                                    value={state.query}
                                    onChange={(e) => setState(prev => ({ ...prev, query: e.target.value }))}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 pr-4 py-2 w-full border-2 border-blue-200 focus:border-blue-500 rounded-lg"
                                    disabled={state.isSearching}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <Button
                                        onClick={() => handleSearch()}
                                        disabled={state.isSearching || !state.query.trim()}
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {state.isSearching ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <Sparkles className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Intent Selection */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-gray-600 py-1">Search Intent:</span>
                                {Object.values(IntentType).map(intent => (
                                    <Button
                                        key={intent}
                                        variant={state.selectedIntent === intent ? "default" : "outline"}
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => setState(prev => ({
                                            ...prev,
                                            selectedIntent: prev.selectedIntent === intent ? null : intent
                                        }))}
                                    >
                                        {getIntentIcon(intent)}
                                        <span className="ml-1">{intent.replace('_', ' ')}</span>
                                    </Button>
                                ))}
                            </div>

                            {/* Smart Suggestions */}
                            {state.suggestions.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-600">Smart Suggestions:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {state.suggestions.map((suggestion, idx) => (
                                            <Button
                                                key={idx}
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs border border-gray-200 hover:border-blue-300"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span>{suggestion.suggestion}</span>
                                                    <Badge variant="secondary" className="text-xs ml-1">
                                                        {Math.round(suggestion.score * 100)}%
                                                    </Badge>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Search Results */}
                {state.results.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Brain className="w-5 h-5 text-blue-600" />
                                AI-Powered Results ({state.results.length})
                            </h3>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    <SortDesc className="w-4 h-4 mr-1" />
                                    Sort by Relevance
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {memoizedResults}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {state.results.length === 0 && state.query && !state.isSearching && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No results found</h3>
                            <p className="text-gray-500 mb-4">
                                Try adjusting your search query or using different keywords
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setState(prev => ({ ...prev, showAdvanced: true }))}
                            >
                                Try Advanced Search
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Advanced Search Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Relevance Threshold */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Minimum Relevance Score: {Math.round(state.filters.minRelevance * 100)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={state.filters.minRelevance}
                                onChange={(e) => setState(prev => ({
                                    ...prev,
                                    filters: { ...prev.filters, minRelevance: parseFloat(e.target.value) }
                                }))}
                                className="w-full"
                            />
                        </div>

                        {/* Match Types */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Match Types
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {Object.values(MatchType).map(type => (
                                    <Button
                                        key={type}
                                        variant={state.filters.matchTypes.includes(type) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            setState(prev => ({
                                                ...prev,
                                                filters: {
                                                    ...prev.filters,
                                                    matchTypes: prev.filters.matchTypes.includes(type)
                                                        ? prev.filters.matchTypes.filter(t => t !== type)
                                                        : [...prev.filters.matchTypes, type]
                                                }
                                            }));
                                        }}
                                    >
                                        {type.replace('_', ' ')}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={() => handleSearch()}
                            className="w-full"
                            disabled={!state.query.trim()}
                        >
                            Apply Filters & Search
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            {showAnalytics && (
                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Search Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {state.searchMetrics ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {state.searchMetrics.totalSearches}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Searches</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {Math.round((state.searchMetrics.successfulSearches / state.searchMetrics.totalSearches) * 100)}%
                                        </div>
                                        <div className="text-sm text-gray-600">Success Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {state.searchMetrics.averageQueryTime}ms
                                        </div>
                                        <div className="text-sm text-gray-600">Avg Query Time</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {state.searchMetrics.userSatisfaction.toFixed(1)}
                                        </div>
                                        <div className="text-sm text-gray-600">Satisfaction</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">Loading analytics...</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            )}
        </Tabs>
    </div>
);
};

export default AISearchComponent;
