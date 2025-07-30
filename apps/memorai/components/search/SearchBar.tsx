'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Search, Filter, Clock, Tag, FileText, Database, BookOpen, Lightbulb } from 'lucide-react'
import { advancedSearch, SearchResult, SearchOptions } from '../../lib/search/advanced-search'
import { logSearch, logUser } from '../../lib/logger'

interface SearchBarProps {
    onSearch: (results: SearchResult[]) => void
    onLoading: (loading: boolean) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onLoading }) => {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [searchOptions, setSearchOptions] = useState<SearchOptions>({
        type: 'all',
        maxResults: 50,
        sortBy: 'relevance'
    })
    const [showFilters, setShowFilters] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    // Debounced search function
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            onSearch([])
            return
        }

        setIsSearching(true)
        onLoading(true)

        try {
            const results = await advancedSearch.search(searchQuery, searchOptions)
            onSearch(results)

            await logUser('search-performed', {
                context: {
                    query: searchQuery,
                    resultCount: results.length,
                    options: searchOptions
                }
            })
        } catch (error) {
            console.error('Search failed:', error)
            onSearch([])
        } finally {
            setIsSearching(false)
            onLoading(false)
        }
    }, [searchOptions, onSearch, onLoading])

    // Get suggestions
    const getSuggestions = useCallback(async (partialQuery: string) => {
        if (partialQuery.length >= 2) {
            try {
                const newSuggestions = await advancedSearch.getSuggestions(partialQuery, 8)
                setSuggestions(newSuggestions)
                setShowSuggestions(true)
            } catch (error) {
                console.error('Failed to get suggestions:', error)
            }
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }, [])

    // Handle query change
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value
        setQuery(newQuery)
        getSuggestions(newQuery)
    }

    // Handle search submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setShowSuggestions(false)
        performSearch(query)
    }

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion)
        setShowSuggestions(false)
        performSearch(suggestion)
    }

    // Search type icons
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'memory': return <Lightbulb className="w-4 h-4" />
            case 'knowledge': return <BookOpen className="w-4 h-4" />
            case 'document': return <FileText className="w-4 h-4" />
            case 'note': return <Database className="w-4 h-4" />
            default: return <Search className="w-4 h-4" />
        }
    }

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Main Search Bar */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className={`h-5 w-5 ${isSearching ? 'animate-pulse text-blue-500' : 'text-gray-400'}`} />
                    </div>

                    <input
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        onFocus={() => setShowSuggestions(suggestions.length > 0)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Search memories, knowledge, documents..."
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                    />

                    <div className="absolute inset-y-0 right-0 flex items-center">
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                            >
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700">{suggestion}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </form>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Content Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content Type
                            </label>
                            <select
                                value={searchOptions.type || 'all'}
                                onChange={(e) => setSearchOptions(prev => ({ ...prev, type: e.target.value as any }))}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="all">All Types</option>
                                <option value="memory">Memories</option>
                                <option value="knowledge">Knowledge</option>
                                <option value="document">Documents</option>
                                <option value="note">Notes</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort By
                            </label>
                            <select
                                value={searchOptions.sortBy || 'relevance'}
                                onChange={(e) => setSearchOptions(prev => ({ ...prev, sortBy: e.target.value as any }))}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="date">Date</option>
                                <option value="title">Title</option>
                            </select>
                        </div>

                        {/* Max Results */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Results
                            </label>
                            <select
                                value={searchOptions.maxResults || 50}
                                onChange={(e) => setSearchOptions(prev => ({ ...prev, maxResults: parseInt(e.target.value) }))}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={200}>200</option>
                            </select>
                        </div>
                    </div>

                    {/* Semantic vs Fuzzy Weight Sliders */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Semantic Search Weight: {((searchOptions.semanticWeight || 0.6) * 100).toFixed(0)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={searchOptions.semanticWeight || 0.6}
                                onChange={(e) => setSearchOptions(prev => ({
                                    ...prev,
                                    semanticWeight: parseFloat(e.target.value),
                                    fuzzyWeight: 1 - parseFloat(e.target.value)
                                }))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fuzzy Search Weight: {((searchOptions.fuzzyWeight || 0.4) * 100).toFixed(0)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={searchOptions.fuzzyWeight || 0.4}
                                onChange={(e) => setSearchOptions(prev => ({
                                    ...prev,
                                    fuzzyWeight: parseFloat(e.target.value),
                                    semanticWeight: 1 - parseFloat(e.target.value)
                                }))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchBar
