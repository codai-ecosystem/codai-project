'use client';

import React from 'react';
import AdvancedSearchInterface from './AdvancedSearchInterface';
import { SearchResult } from '@/lib/search-engine';

interface SearchInterfaceProps {
    onSearch?: (query: string) => void;
    onSearchResults?: (results: SearchResult[]) => void;
    className?: string;
}

// Enhanced search interface with advanced AI-powered search capabilities
export default function SearchInterface({
    onSearch,
    onSearchResults,
    className = ''
}: SearchInterfaceProps) {

    // Handle backward compatibility with onSearch prop
    const handleSearchResults = (results: SearchResult[]) => {
        // Call the results callback if provided
        onSearchResults?.(results);

        // For backward compatibility, also call onSearch with empty string
        // This maintains compatibility with existing code that expects onSearch
        if (onSearch && results.length > 0) {
            // Extract the first search result's content or provide a summary
            const summary = results.length > 0
                ? `Found ${results.length} results`
                : '';
            onSearch(summary);
        }
    };

    return (
        <div className={`enhanced-search-container ${className}`}>
            <AdvancedSearchInterface
                onSearchResults={handleSearchResults}
                className="w-full"
            />
        </div>
    );
}
