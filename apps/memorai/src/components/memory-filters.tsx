'use client';

import { useState, useEffect } from 'react';
import { Filter, X, Calendar, Search, SortAsc, SortDesc, Clock, User } from 'lucide-react';

interface FilterOptions {
    category?: string;
    tags?: string[];
    dateRange?: {
        start?: string;
        end?: string;
    };
    sortBy?: 'created' | 'updated' | 'relevance' | 'alphabetical';
    sortOrder?: 'asc' | 'desc';
    author?: string;
    searchQuery?: string;
}

interface MemoryFiltersProps {
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    onReset: () => void;
    totalResults?: number;
}

const SORT_OPTIONS = [
    { value: 'created', label: 'Date Created', icon: Calendar },
    { value: 'updated', label: 'Last Updated', icon: Clock },
    { value: 'relevance', label: 'Relevance', icon: Search },
    { value: 'alphabetical', label: 'Alphabetical', icon: SortAsc }
];

export default function MemoryFilters({
    filters,
    onFiltersChange,
    onReset,
    totalResults
}: MemoryFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = <K extends keyof FilterOptions>(
        key: K,
        value: FilterOptions[K]
    ) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
        const newDateRange = { ...localFilters.dateRange, [field]: value };
        handleFilterChange('dateRange', newDateRange);
    };

    const hasActiveFilters = () => {
        return !!(
            localFilters.category ||
            (localFilters.tags && localFilters.tags.length > 0) ||
            localFilters.dateRange?.start ||
            localFilters.dateRange?.end ||
            localFilters.author ||
            localFilters.searchQuery
        );
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (localFilters.category) count++;
        if (localFilters.tags && localFilters.tags.length > 0) count += localFilters.tags.length;
        if (localFilters.dateRange?.start || localFilters.dateRange?.end) count++;
        if (localFilters.author) count++;
        if (localFilters.searchQuery) count++;
        return count;
    };

    const clearDateRange = () => {
        handleFilterChange('dateRange', {});
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Filters
                    </h3>
                    {hasActiveFilters() && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            {getActiveFilterCount()} active
                        </span>
                    )}
                    {totalResults !== undefined && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({totalResults} results)
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters() && (
                        <button
                            onClick={onReset}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4" />
                            Reset
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    >
                        <Filter className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-4">
                {/* Search Query Display */}
                {localFilters.searchQuery && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-blue-800 dark:text-blue-300">
                            Searching for: <strong>"{localFilters.searchQuery}"</strong>
                        </span>
                        <button
                            onClick={() => handleFilterChange('searchQuery', undefined)}
                            className="ml-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Sort Options */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sort by:
                    </label>
                    <select
                        value={localFilters.sortBy || 'created'}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => handleFilterChange('sortOrder', localFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                        title={`Sort ${localFilters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                        {localFilters.sortOrder === 'asc' ?
                            <SortAsc className="h-4 w-4" /> :
                            <SortDesc className="h-4 w-4" />
                        }
                    </button>
                </div>
            </div>

            {/* Expanded Filters */}
            {isExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                    {/* Date Range Filter */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date Range
                            </label>
                            {(localFilters.dateRange?.start || localFilters.dateRange?.end) && (
                                <button
                                    onClick={clearDateRange}
                                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.dateRange?.start || ''}
                                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.dateRange?.end || ''}
                                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Author Filter */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                            Author
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Filter by author..."
                                value={localFilters.author || ''}
                                onChange={(e) => handleFilterChange('author', e.target.value || undefined)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters() && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Active filters:
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {localFilters.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-md">
                                Category: {localFilters.category}
                                <button
                                    onClick={() => handleFilterChange('category', undefined)}
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {localFilters.tags?.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-md"
                            >
                                #{tag}
                                <button
                                    onClick={() => {
                                        const newTags = localFilters.tags?.filter(t => t !== tag);
                                        handleFilterChange('tags', newTags?.length ? newTags : undefined);
                                    }}
                                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        {(localFilters.dateRange?.start || localFilters.dateRange?.end) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-md">
                                Date: {localFilters.dateRange.start || 'start'} - {localFilters.dateRange.end || 'end'}
                                <button
                                    onClick={clearDateRange}
                                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
