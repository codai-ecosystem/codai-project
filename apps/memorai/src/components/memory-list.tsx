'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Memory } from '@/types/memory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, ExternalLink, Star } from 'lucide-react';

interface MemoryListProps {
    memories: Memory[];
    selectedMemory?: Memory | null;
    onSelectMemory: (memory: Memory) => void;
    onDeleteMemory: (id: string) => void;
    loading?: boolean;
    viewMode?: 'list' | 'grid';
    onMemorySelect?: (memory: Memory) => void;
    onMemoryEdit?: (memory: Memory) => void;
}

const MemoryCard: React.FC<{
    memory: Memory;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
    viewMode: 'list' | 'grid';
}> = ({ memory, isSelected, onSelect, onDelete, viewMode }) => {
    const getCategoryColor = (category: string) => {
        const colors = {
            development: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            testing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            planning: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            general: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
            personal: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            work: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return colors[category as keyof typeof colors] || colors.general;
    };

    const getImportanceColor = (importance: number) => {
        if (importance >= 9) return 'text-red-500';
        if (importance >= 7) return 'text-yellow-500';
        if (importance >= 5) return 'text-blue-500';
        return 'text-gray-400';
    };

    const truncateContent = (content: string, maxLength: number) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    if (viewMode === 'grid') {
        return (
            <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
                }`}
                onClick={onSelect}
            >
                <CardContent className="p-4">
                    <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <Badge className={getCategoryColor(memory.category)}>
                                {memory.category}
                            </Badge>
                            <div className="flex items-center space-x-1">
                                <Star 
                                    className={`h-4 w-4 ${getImportanceColor(memory.importance || 5)}`}
                                    fill={memory.importance && memory.importance >= 8 ? "currentColor" : "none"}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                                {truncateContent(memory.content, 120)}
                            </p>
                            
                            {/* Tags */}
                            {memory.tags && memory.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {memory.tags.slice(0, 3).map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                    {memory.tags.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                            +{memory.tags.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>
                                {formatDistanceToNow(new Date(memory.updatedAt), { addSuffix: true })}
                            </span>
                            <ExternalLink className="h-3 w-3" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // List view
    return (
        <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
                isSelected ? 'ring-2 ring-blue-500 shadow-sm' : ''
            }`}
            onClick={onSelect}
        >
            <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                    {/* Importance indicator */}
                    <div className="flex-shrink-0 pt-1">
                        <Star 
                            className={`h-4 w-4 ${getImportanceColor(memory.importance || 5)}`}
                            fill={memory.importance && memory.importance >= 8 ? "currentColor" : "none"}
                        />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getCategoryColor(memory.category)}>
                                {memory.category}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(memory.updatedAt), { addSuffix: true })}
                            </span>
                        </div>
                        
                        <p className="text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {memory.content}
                        </p>

                        {/* Tags */}
                        {memory.tags && memory.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {memory.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function MemoryList({
    memories,
    selectedMemory,
    onSelectMemory,
    onDeleteMemory,
    loading = false,
    viewMode = 'list',
    onMemorySelect,
    onMemoryEdit
}: MemoryListProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="flex space-x-2">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (memories.length === 0) {
        return (
            <div className="p-4 sm:p-6 text-center text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-base sm:text-lg font-medium">No memories found</p>
                <p className="mt-1 text-sm sm:text-base">Create your first memory to get started</p>
            </div>
        );
    }

    return (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {memories.map((memory) => (
                <MemoryCard
                    key={memory.id}
                    memory={memory}
                    isSelected={selectedMemory?.id === memory.id}
                    onSelect={() => onSelectMemory(memory)}
                    onDelete={() => onDeleteMemory(memory.id)}
                    viewMode={viewMode}
                />
            ))}
        </div>
    );
}
