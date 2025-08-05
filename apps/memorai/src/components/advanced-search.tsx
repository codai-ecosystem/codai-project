'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, Sparkles, Clock, Tag, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Memory } from '@/types/memory';
import { useMemorAIApi } from '@/hooks/use-memorai-api';
import { useNotificationContext } from '@/contexts/notification-context';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const searchVariants = cva(
    "relative flex items-center space-x-2 transition-all duration-200",
    {
        variants: {
            mode: {
                simple: "bg-background border rounded-lg p-3",
                advanced: "bg-muted/50 border-2 border-dashed rounded-xl p-4"
            },
            focus: {
                true: "ring-2 ring-primary ring-offset-2",
                false: ""
            }
        },
        defaultVariants: {
            mode: "simple",
            focus: false
        }
    }
);

interface SearchFilters {
    categories?: string[];
    tags?: string[];
    importance?: {
        min?: number;
        max?: number;
    };
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    isPublic?: boolean;
    contentType?: 'all' | 'text' | 'code' | 'notes';
}

interface AdvancedSearchProps {
    onSearch: (query: string, filters?: SearchFilters) => void;
    onClear: () => void;
    isSearching?: boolean;
    searchResults?: Memory[];
    className?: string;
}

const SEARCH_SUGGESTIONS = [
    { text: 'React hooks', icon: '⚛️', type: 'technical' },
    { text: 'project planning', icon: '📋', type: 'work' },
    { text: 'meeting notes', icon: '📝', type: 'notes' },
    { text: 'code snippets', icon: '💾', type: 'code' },
    { text: 'important tasks', icon: '⚡', type: 'priority' },
    { text: 'recent memories', icon: '🕒', type: 'time' }
];

const CATEGORIES = [
    { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800' },
    { value: 'work', label: 'Work', color: 'bg-blue-100 text-blue-800' },
    { value: 'personal', label: 'Personal', color: 'bg-green-100 text-green-800' },
    { value: 'learning', label: 'Learning', color: 'bg-purple-100 text-purple-800' },
    { value: 'project', label: 'Project', color: 'bg-orange-100 text-orange-800' },
    { value: 'meeting', label: 'Meeting', color: 'bg-pink-100 text-pink-800' },
    { value: 'idea', label: 'Idea', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'code', label: 'Code', color: 'bg-indigo-100 text-indigo-800' }
];

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
    onSearch,
    onClear,
    isSearching = false,
    searchResults,
    className
}) => {
    const [query, setQuery] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [isFocused, setIsFocused] = useState(false);

    const { showNotification } = useNotificationContext();
    const api = useMemorAIApi();

    const handleSearch = useCallback(async (searchQuery?: string, searchFilters?: SearchFilters) => {
        const finalQuery = searchQuery || query;
        const finalFilters = searchFilters || filters;

        if (!finalQuery.trim() && Object.keys(finalFilters).length === 0) {
            showNotification({
                type: 'warning',
                title: 'Search Required',
                message: 'Please enter a search query or apply filters'
            });
            return;
        }

        try {
            // Hide suggestions when searching
            setShowSuggestions(false);
            
            // Call the parent search handler
            onSearch(finalQuery, finalFilters);
            
            showNotification({
                type: 'info',
                title: 'Searching...',
                message: finalQuery ? `Searching for "${finalQuery}"` : 'Applying filters...'
            });
        } catch (err) {
            showNotification({
                type: 'error',
                title: 'Search Failed',
                message: 'Failed to perform search. Please try again.'
            });
        }
    }, [query, filters, onSearch, showNotification]);

    const handleClear = useCallback(() => {
        setQuery('');
        setFilters({});
        setShowSuggestions(false);
        onClear();
        
        showNotification({
            type: 'info',
            title: 'Search Cleared',
            message: 'Search results and filters have been reset'
        });
    }, [onClear, showNotification]);

    const handleSuggestionClick = (suggestion: typeof SEARCH_SUGGESTIONS[0]) => {
        setQuery(suggestion.text);
        setShowSuggestions(false);
        handleSearch(suggestion.text);
    };

    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const removeFilter = (key: keyof SearchFilters) => {
        setFilters(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    };

    const hasActiveFilters = useMemo(() => {
        return Object.keys(filters).some(key => {
            const value = filters[key as keyof SearchFilters];
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== undefined);
            }
            return value !== undefined;
        });
    }, [filters]);

    const resultsCount = searchResults?.length || 0;

    return (
        <div className={cn("space-y-4", className)}>
            {/* Main Search Interface */}
            <div className={searchVariants({ 
                mode: showAdvanced ? 'advanced' : 'simple',
                focus: isFocused 
            })}>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search memories... (e.g., 'React hooks', 'meeting notes', 'project ideas')"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            setIsFocused(true);
                            setShowSuggestions(true);
                        }}
                        onBlur={() => {
                            setIsFocused(false);
                            // Delay hiding suggestions to allow clicks
                            setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            } else if (e.key === 'Escape') {
                                setShowSuggestions(false);
                            }
                        }}
                        className="pl-10 pr-4 border-0 focus-visible:ring-0 bg-transparent"
                        disabled={isSearching}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={cn(
                            "transition-colors",
                            hasActiveFilters && "bg-primary text-primary-foreground"
                        )}
                    >
                        <Filter className="h-4 w-4 mr-1" />
                        Filters
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {Object.keys(filters).length}
                            </Badge>
                        )}
                    </Button>

                    <Button
                        onClick={() => handleSearch()}
                        disabled={isSearching}
                        size="sm"
                        className="min-w-[80px]"
                    >
                        {isSearching ? (
                            <>
                                <div className="animate-spin h-4 w-4 mr-1 border-2 border-current border-t-transparent rounded-full" />
                                Searching
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-1" />
                                Search
                            </>
                        )}
                    </Button>

                    {(query || hasActiveFilters || searchResults) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && !query && (
                <Card className="p-4 border-dashed">
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">Popular Searches</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {SEARCH_SUGGESTIONS.map((suggestion, index) => (
                            <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="justify-start h-auto p-2 text-left"
                            >
                                <span className="mr-2">{suggestion.icon}</span>
                                <span className="text-sm">{suggestion.text}</span>
                            </Button>
                        ))}
                    </div>
                </Card>
            )}

            {/* Advanced Filters */}
            {showAdvanced && (
                <Card className="p-4 space-y-4 border-dashed bg-muted/30">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Advanced Filters</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilters({})}
                            className="text-xs text-muted-foreground"
                        >
                            Clear All
                        </Button>
                    </div>

                    {/* Categories Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            Categories
                        </label>
                        <div className="flex flex-wrap gap-1">
                            {CATEGORIES.map(category => (
                                <Button
                                    key={category.value}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const current = filters.categories || [];
                                        const updated = current.includes(category.value)
                                            ? current.filter(c => c !== category.value)
                                            : [...current, category.value];
                                        handleFilterChange('categories', updated);
                                    }}
                                    className={cn(
                                        "h-7 text-xs",
                                        filters.categories?.includes(category.value) && category.color
                                    )}
                                >
                                    {category.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Importance Range */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Importance Level
                        </label>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                min={1}
                                max={10}
                                value={filters.importance?.min || ''}
                                onChange={(e) => handleFilterChange('importance', {
                                    ...filters.importance,
                                    min: e.target.value ? parseInt(e.target.value) : undefined
                                })}
                                className="w-20 h-8 text-xs"
                            />
                            <span className="text-xs text-muted-foreground">to</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                min={1}
                                max={10}
                                value={filters.importance?.max || ''}
                                onChange={(e) => handleFilterChange('importance', {
                                    ...filters.importance,
                                    max: e.target.value ? parseInt(e.target.value) : undefined
                                })}
                                className="w-20 h-8 text-xs"
                            />
                        </div>
                    </div>

                    {/* Visibility Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            Visibility
                        </label>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFilterChange('isPublic', true)}
                                className={cn(
                                    "h-7 text-xs",
                                    filters.isPublic === true && "bg-green-100 text-green-800"
                                )}
                            >
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFilterChange('isPublic', false)}
                                className={cn(
                                    "h-7 text-xs",
                                    filters.isPublic === false && "bg-blue-100 text-blue-800"
                                )}
                            >
                                <User className="h-3 w-3 mr-1" />
                                Private
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {filters.categories?.map(category => (
                        <Badge
                            key={category}
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeFilter('categories')}
                        >
                            Category: {category}
                            <X className="h-3 w-3 ml-1" />
                        </Badge>
                    ))}
                    
                    {filters.importance && (
                        <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeFilter('importance')}
                        >
                            Importance: {filters.importance.min || 1}-{filters.importance.max || 10}
                            <X className="h-3 w-3 ml-1" />
                        </Badge>
                    )}
                    
                    {filters.isPublic !== undefined && (
                        <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeFilter('isPublic')}
                        >
                            {filters.isPublic ? 'Public' : 'Private'} only
                            <X className="h-3 w-3 ml-1" />
                        </Badge>
                    )}
                </div>
            )}

            {/* Search Results Summary */}
            {searchResults && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        {resultsCount === 0 
                            ? 'No memories found' 
                            : `Found ${resultsCount} ${resultsCount === 1 ? 'memory' : 'memories'}`
                        }
                        {query && ` for "${query}"`}
                    </span>
                    
                    {resultsCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Updated results
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdvancedSearch;
