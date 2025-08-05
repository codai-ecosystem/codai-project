'use client';

import { useState, useEffect } from 'react';
import { Tag, X, Plus, Hash, Search, TrendingUp } from 'lucide-react';

interface MemoryTag {
    name: string;
    count: number;
    trending?: boolean;
}

interface MemoryTagsProps {
    selectedTags?: string[];
    onTagsSelect: (tags: string[]) => void;
    onTagsChange?: (tags: MemoryTag[]) => void;
}

export default function MemoryTags({
    selectedTags = [],
    onTagsSelect,
    onTagsChange
}: MemoryTagsProps) {
    const [availableTags, setAvailableTags] = useState<MemoryTag[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            setIsLoading(true);

            // In a real implementation, this would be an API call to get tag statistics
            // For now, we'll simulate with some sample data
            const response = await fetch('/api/memories?limit=100');
            if (response.ok) {
                const data = await response.json();
                const tagCounts: { [key: string]: number } = {};

                // Count tag occurrences from all memories
                data.data?.forEach((memory: any) => {
                    memory.tags?.forEach((tag: string) => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                });

                // Convert to MemoryTag array and sort by count
                const tags: MemoryTag[] = Object.entries(tagCounts)
                    .map(([name, count]) => ({
                        name,
                        count,
                        trending: count > 2 // Mark as trending if used more than 2 times
                    }))
                    .sort((a, b) => b.count - a.count);

                setAvailableTags(tags);
                onTagsChange?.(tags);
            }
        } catch (error) {
            console.error('Error loading tags:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTagToggle = (tagName: string) => {
        const newTags = selectedTags.includes(tagName)
            ? selectedTags.filter(tag => tag !== tagName)
            : [...selectedTags, tagName];
        onTagsSelect(newTags);
    };

    const filteredTags = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedTags = showAll ? filteredTags : filteredTags.slice(0, 20);

    const getTagColor = (tag: MemoryTag, isSelected: boolean) => {
        if (isSelected) {
            return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600';
        }
        if (tag.trending) {
            return 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 border-purple-200 hover:from-pink-200 hover:to-purple-200 dark:from-pink-900/20 dark:to-purple-900/20 dark:text-purple-300 dark:border-purple-700';
        }
        return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Tags
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({availableTags.length} available)
                    </span>
                </div>
                {selectedTags.length > 0 && (
                    <button
                        onClick={() => onTagsSelect([])}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        <X className="h-4 w-4" />
                        Clear all ({selectedTags.length})
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected Tags ({selectedTags.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => {
                            const tagData = availableTags.find(t => t.name === tag);
                            return (
                                <button
                                    key={`selected-${tag}`}
                                    onClick={() => handleTagToggle(tag)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full border-2 bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    <Hash className="h-3 w-3" />
                                    {tag}
                                    {tagData && (
                                        <span className="ml-1 text-xs">
                                            {tagData.count}
                                        </span>
                                    )}
                                    <X className="h-3 w-3 ml-1" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Available Tags */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"
                            />
                        ))}
                    </div>
                ) : availableTags.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No tags found in your memories yet</p>
                        <p className="text-sm mt-1">Tags will appear here as you create memories</p>
                    </div>
                ) : (
                    <>
                        {displayedTags.length === 0 && searchTerm ? (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No tags found matching "{searchTerm}"</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {displayedTags.map((tag) => {
                                    const isSelected = selectedTags.includes(tag.name);
                                    return (
                                        <button
                                            key={tag.name}
                                            onClick={() => handleTagToggle(tag.name)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 ${getTagColor(tag, isSelected)}`}
                                        >
                                            {tag.trending && (
                                                <TrendingUp className="h-3 w-3" />
                                            )}
                                            <Hash className="h-3 w-3" />
                                            {tag.name}
                                            <span className="text-xs">
                                                {tag.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Show More/Less */}
                        {filteredTags.length > 20 && (
                            <div className="text-center">
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                    <Plus className={`h-4 w-4 transition-transform ${showAll ? 'rotate-45' : ''}`} />
                                    {showAll ? 'Show Less' : `Show ${filteredTags.length - 20} More`}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Refresh Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={loadTags}
                    disabled={isLoading}
                    className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Refreshing...' : 'Refresh Tags'}
                </button>
            </div>
        </div>
    );
}
