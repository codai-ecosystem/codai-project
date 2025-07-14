'use client'

import React from 'react'
import { Clock, Tag, FileText, Database, BookOpen, Lightbulb, ExternalLink } from 'lucide-react'
import { SearchResult } from '../../lib/search/advanced-search'

interface SearchResultsProps {
    results: SearchResult[]
    loading: boolean
    query: string
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, loading, query }) => {
    // Get icon for content type
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'memory':
                return <Lightbulb className="w-5 h-5 text-yellow-500" />
            case 'knowledge':
                return <BookOpen className="w-5 h-5 text-blue-500" />
            case 'document':
                return <FileText className="w-5 h-5 text-green-500" />
            case 'note':
                return <Database className="w-5 h-5 text-purple-500" />
            default:
                return <FileText className="w-5 h-5 text-gray-500" />
        }
    }

    // Get type label
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'memory': return 'Memory'
            case 'knowledge': return 'Knowledge'
            case 'document': return 'Document'
            case 'note': return 'Note'
            default: return 'Item'
        }
    }

    // Format date
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date))
    }

    // Highlight query terms in text
    const highlightText = (text: string, searchQuery: string) => {
        if (!searchQuery.trim()) return text

        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        const parts = text.split(regex)

        return parts.map((part, index) =>
            regex.test(part) ? (
                <mark key={index} className="bg-yellow-200 px-1 rounded">
                    {part}
                </mark>
            ) : part
        )
    }

    // Truncate content
    const truncateContent = (content: string, maxLength: number = 300) => {
        if (content.length <= maxLength) return content
        return content.substring(0, maxLength) + '...'
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-5 h-5 bg-white/20 rounded"></div>
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-white/20 rounded"></div>
                                    <div className="h-3 bg-white/20 rounded w-5/6"></div>
                                </div>
                                <div className="flex space-x-4">
                                    <div className="h-3 bg-white/20 rounded w-20"></div>
                                    <div className="h-3 bg-white/20 rounded w-16"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (results.length === 0 && query) {
        return (
            <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-white">No results found</h3>
                <p className="mt-1 text-sm text-slate-400">
                    Try adjusting your search terms or filters.
                </p>
            </div>
        )
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-white">Start searching</h3>
                <p className="mt-1 text-sm text-slate-400">
                    Enter a search query to find memories, knowledge, and documents.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between text-sm text-slate-400 mb-6">
                <span>
                    Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                </span>
                <span>
                    Sorted by relevance
                </span>
            </div>

            {/* Results List */}
            <div className="space-y-4">
                {results.map((result, index) => (
                    <div
                        key={result.id}
                        className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-6 hover:bg-white/15 transition-all cursor-pointer"
                    >
                        <div className="flex items-start space-x-4">
                            {/* Type Icon */}
                            <div className="flex-shrink-0 mt-1">
                                {getTypeIcon(result.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-white truncate">
                                            {highlightText(result.title, query)}
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-slate-300">
                                                {getTypeLabel(result.type)}
                                            </span>
                                            <span className="text-sm text-slate-400">
                                                Score: {(result.score * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    <button className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-300">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Content Preview */}
                                <div className="mt-3">
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {highlightText(truncateContent(result.content), query)}
                                    </p>
                                </div>

                                {/* Highlights */}
                                {result.highlights && result.highlights.length > 0 && (
                                    <div className="mt-3">
                                        <div className="text-xs font-medium text-slate-400 mb-1">Matches:</div>
                                        <div className="space-y-1">
                                            {result.highlights.slice(0, 3).map((highlight, highlightIndex) => (
                                                <div
                                                    key={highlightIndex}
                                                    className="text-xs text-slate-300 bg-white/10 px-2 py-1 rounded border-l-2 border-blue-400"
                                                >
                                                    ...{highlightText(highlight, query)}...
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDate(result.createdAt)}</span>
                                        </div>

                                        {result.metadata.tags && result.metadata.tags.length > 0 && (
                                            <div className="flex items-center space-x-1">
                                                <Tag className="w-3 h-3" />
                                                <span>
                                                    {result.metadata.tags.slice(0, 3).join(', ')}
                                                    {result.metadata.tags.length > 3 && ` +${result.metadata.tags.length - 3}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {result.updatedAt && result.updatedAt !== result.createdAt && (
                                        <div className="text-slate-500">
                                            Updated {formatDate(result.updatedAt)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button (if needed) */}
            {results.length >= 50 && (
                <div className="text-center pt-6">
                    <button className="inline-flex items-center px-4 py-2 border border-white/20 shadow-sm text-sm font-medium rounded-md text-slate-300 bg-white/10 backdrop-blur-xl hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Load More Results
                    </button>
                </div>
            )}
        </div>
    )
}

export default SearchResults
