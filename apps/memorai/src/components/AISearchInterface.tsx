/**
 * AI Search Interface Component
 * Optimized following Microsoft React best practices
 * - Modular component architecture
 * - Performance optimizations with React.memo and custom hooks
 * - Accessibility compliance (WCAG 2.1 AA)
 * - TypeScript best practices
 */
'use client';

import React, { memo, useRef, useCallback } from 'react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

// Import optimized sub-components
import SearchHeader from './ai-search/SearchHeader';
import SearchInput from './ai-search/SearchInput';
import ConversationView, { type ConversationMessage, type QueryResult } from './ai-search/ConversationView';
import { useAISearch } from '@/hooks/useAISearch';
interface AISearchInterfaceProps {
    onResultSelect?: (result: QueryResult) => void;
    className?: string;
    sessionId?: string;
    showSuggestions?: boolean;
    maxResults?: number;
    onCopy?: (text: string) => void;
}

/**
 * AISearchInterface - Main search interface component
 * Refactored following Microsoft's React best practices:
 * - Uses custom hook for state management
 * - Broken into smaller, focused components
 * - Implements proper memoization and performance optimizations
 * - Full accessibility compliance
 */
const AISearchInterface = memo(({
    onResultSelect,
    className,
    sessionId,
    showSuggestions = true,
    maxResults = 20,
    onCopy
}: AISearchInterfaceProps) => {

    // Use custom hook for all search functionality
    const {
        query,
        conversation,
        isLoading,
        suggestions,
        relatedQueries,
        showDetails,
        currentSessionId,
        setQuery,
        handleSubmit,
        clearConversation,
        toggleDetails,
        copyToClipboard
    } = useAISearch({
        sessionId,
        maxResults,
        showSuggestions,
        autoLoadSuggestions: true
    });

    const inputRef = useRef<HTMLInputElement>(null);

    // Memoized event handlers
    const handleQueryChange = useCallback((newQuery: string) => {
        setQuery(newQuery);
    }, [setQuery]);

    const handleQuerySubmit = useCallback(async (queryText: string) => {
        await handleSubmit(queryText);
        inputRef.current?.focus();
    }, [handleSubmit]);

    const handleSuggestionClick = useCallback((suggestion: string) => {
        setQuery(suggestion);
        inputRef.current?.focus();
    }, [setQuery]);

    const handleResultSelect = useCallback((result: QueryResult) => {
        onResultSelect?.(result);
    }, [onResultSelect]);

    const handleCopy = useCallback(async (text: string) => {
        await copyToClipboard(text);
        onCopy?.(text);
    }, [copyToClipboard, onCopy]);

    return (
        <div
            className={cn(
                'flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden',
                className
            )}
            role="main"
            aria-label="AI Memory Search Interface"
        >
            {/* Header with controls */}
            <SearchHeader
                sessionId={currentSessionId}
                showDetails={showDetails}
                onToggleDetails={toggleDetails}
                onClearConversation={clearConversation}
                messageCount={conversation.length}
            />

            {/* Conversation area */}
            <ConversationView
                messages={conversation as any}
                onResultSelect={handleResultSelect}
                onCopy={handleCopy}
                showTimestamps={true}
                showMetadata={showDetails}
                className="flex-1"
            />

            {/* Related queries */}
            {relatedQueries.length > 0 && (
                <div
                    className="p-4 border-t bg-white/50"
                    role="region"
                    aria-label="Related search suggestions"
                >
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                        <span>Related queries:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {relatedQueries.map((relatedQuery, index) => (
                            <Badge
                                key={`related-${index}`}
                                variant="outline"
                                className="cursor-pointer hover:bg-blue-50 text-xs"
                                onClick={() => handleSuggestionClick(relatedQuery)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleSuggestionClick(relatedQuery);
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label={`Search for: ${relatedQuery}`}
                            >
                                {relatedQuery}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Search input */}
            <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
                <SearchInput
                    ref={inputRef}
                    value={query}
                    onChange={handleQueryChange}
                    onSubmit={handleQuerySubmit}
                    isLoading={isLoading}
                    suggestions={[...suggestions]}
                    onSuggestionClick={handleSuggestionClick}
                    placeholder="Ask me anything about your memories..."
                    showSuggestions={showSuggestions && suggestions.length > 0}
                />
            </div>
        </div>
    );
});

// Set display name for debugging
AISearchInterface.displayName = 'AISearchInterface';

export default AISearchInterface;
