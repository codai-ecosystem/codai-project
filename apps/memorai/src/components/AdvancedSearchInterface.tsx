'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, Clock, TrendingUp, X, ChevronDown, Loader2 } from 'lucide-react';
import { AdvancedSearchEngine, SearchResult, SearchFilters } from '@/lib/search-engine';
import { deduplicateSuggestions } from '@/utils/suggestion-deduplicator';

interface AdvancedSearchInterfaceProps {
    onSearchResults?: (results: SearchResult[]) => void;
    className?: string;
}

export default function AdvancedSearchInterface({
    onSearchResults,
    className = ''
}: AdvancedSearchInterfaceProps) {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [searchStats, setSearchStats] = useState<any>(null);

    const searchEngine = useRef(new AdvancedSearchEngine());
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounced search function
    const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters = {}) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setSuggestions([]);
            onSearchResults?.([]);
            return;
        }

        setIsSearching(true);

        try {
            const searchResult = await searchEngine.current.search(searchQuery, searchFilters);

            setResults(searchResult.results);

            // Apply suggestion deduplication to fix MCP server bug
            const cleanedSuggestions = deduplicateSuggestions(
                searchResult.suggestions || [],
                searchQuery,
                5
            );
            setSuggestions(cleanedSuggestions);

            setSearchStats(searchResult.analytics);

            onSearchResults?.(searchResult.results);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    }, [onSearchResults]);

    // Handle search input changes with debouncing
    const handleSearchChange = useCallback((value: string) => {
        setQuery(value);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (value.trim()) {
            setShowSuggestions(true);
            searchTimeout.current = setTimeout(() => {
                performSearch(value, filters);
            }, 300); // 300ms debounce
        } else {
            setResults([]);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [filters, performSearch]);

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters: SearchFilters) => {
        setFilters(newFilters);
        if (query.trim()) {
            performSearch(query, newFilters);
        }
    }, [query, performSearch]);

    // Handle suggestion selection
    const handleSuggestionSelect = useCallback((suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        performSearch(suggestion, filters);
        inputRef.current?.focus();
    }, [filters, performSearch]);

    // Clear search
    const clearSearch = useCallback(() => {
        setQuery('');
        setResults([]);
        setSuggestions([]);
        setShowSuggestions(false);
        setSearchStats(null);
        onSearchResults?.([]);
    }, [onSearchResults]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false);
            inputRef.current?.blur();
        }
    }, []);

    return (
        <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <div className="relative flex items-center">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(suggestions.length > 0)}
                        placeholder="Search memories with advanced AI-powered search..."
                        className="w-full pl-10 pr-20 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />

                    {/* Search Actions */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        {isSearching && (
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        )}

                        {query && (
                            <button
                                onClick={clearSearch}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Clear search"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-1 rounded transition-colors ${showFilters
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
                                }`}
                            title="Search filters"
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionSelect(suggestion)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <AdvancedSearchFilters
                        filters={filters}
                        onChange={handleFilterChange}
                    />
                </div>
            )}

            {/* Search Statistics */}
            {searchStats && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                        <span>Found {results.length} results</span>
                        <span>Search time: {searchStats.searchTime}ms</span>
                    </div>

                    {searchStats.resultCount > 0 && (
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>Relevance sorted</span>
                        </div>
                    )}
                </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
                <div className="mt-6 space-y-4">
                    {results.map((result, index) => (
                        <SearchResultCard
                            key={result.id}
                            result={result}
                            searchQuery={query}
                            rank={index + 1}
                        />
                    ))}
                </div>
            )}

            {/* No Results Message */}
            {!isSearching && query && results.length === 0 && (
                <div className="mt-8 text-center py-8">
                    <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No results found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Try adjusting your search terms or filters
                    </p>
                    {suggestions.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-400">Suggestions:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionSelect(suggestion)}
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Advanced Search Filters Component
interface AdvancedSearchFiltersProps {
    filters: SearchFilters;
    onChange: (filters: SearchFilters) => void;
}

function AdvancedSearchFilters({ filters, onChange }: AdvancedSearchFiltersProps) {
    const [availableCategories] = useState([
        'Personal', 'Work', 'Ideas', 'Learning', 'Projects', 'Research'
    ]);

    const [availableTags] = useState([
        'important', 'urgent', 'creative', 'technical', 'meeting', 'todo'
    ]);

    const updateFilters = (updates: Partial<SearchFilters>) => {
        onChange({ ...filters, ...updates });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Advanced Search Filters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Categories Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Categories
                    </label>
                    <select
                        multiple
                        value={filters.categories || []}
                        onChange={(e) => updateFilters({
                            categories: Array.from(e.target.selectedOptions, option => option.value)
                        })}
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-sm"
                        size={3}
                    >
                        {availableCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Tags Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Tags
                    </label>
                    <select
                        multiple
                        value={filters.tags || []}
                        onChange={(e) => updateFilters({
                            tags: Array.from(e.target.selectedOptions, option => option.value)
                        })}
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-sm"
                        size={3}
                    >
                        {availableTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>

                {/* Content Type Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Content Type
                    </label>
                    <select
                        value={filters.contentType || 'all'}
                        onChange={(e) => updateFilters({
                            contentType: e.target.value as 'text' | 'image' | 'document' | 'all'
                        })}
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="text">Text</option>
                        <option value="image">Images</option>
                        <option value="document">Documents</option>
                    </select>
                </div>
            </div>

            {/* Minimum Score Filter */}
            <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Minimum Relevance Score: {filters.minScore || 0}
                </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={filters.minScore || 0}
                    onChange={(e) => updateFilters({ minScore: parseFloat(e.target.value) })}
                    className="w-full"
                />
            </div>
        </div>
    );
}

// Search Result Card Component
interface SearchResultCardProps {
    result: SearchResult;
    searchQuery: string;
    rank: number;
}

function SearchResultCard({ result, searchQuery, rank }: SearchResultCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        #{rank}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Score: {result.relevanceScore.toFixed(2)}
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    {result.category && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                            {result.category}
                        </span>
                    )}
                </div>
            </div>

            {result.title && (
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {result.title}
                </h3>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                {result.snippet}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                    <span>Updated: {result.updatedAt.toLocaleDateString()}</span>
                    {result.matchedTerms.length > 0 && (
                        <span>Matches: {result.matchedTerms.join(', ')}</span>
                    )}
                </div>

                {result.tags.length > 0 && (
                    <div className="flex space-x-1">
                        {result.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
