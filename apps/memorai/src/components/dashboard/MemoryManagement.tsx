/**
 * Memory Management Module
 * Core memory management functionality extracted from memory-dashboard.tsx
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
    Search,
    Plus,
    Clock,
    Star,
    Database,
    Activity,
    Edit3,
    Trash2,
    ExternalLink,
    Filter
} from 'lucide-react';

interface MemoryStats {
    totalMemories: number;
    recentMemories: number;
    favorites: number;
    connections: number;
}

interface MemoryItem {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    isFavorite: boolean;
}

interface MemoryManagementProps {
    stats: MemoryStats;
    isLoading: boolean;
}

export default function MemoryManagement({ stats, isLoading }: MemoryManagementProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [recentMemories, setRecentMemories] = useState<MemoryItem[]>([
        {
            id: '1',
            title: 'Project Alpha Meeting Notes',
            content: 'Discussed the new feature requirements and timeline for Q4...',
            category: 'Work',
            tags: ['meeting', 'project-alpha', 'planning'],
            createdAt: '2025-08-21T10:30:00Z',
            updatedAt: '2025-08-21T10:30:00Z',
            isFavorite: true
        },
        {
            id: '2',
            title: 'React Component Patterns',
            content: 'Best practices for building reusable React components following Microsoft guidelines...',
            category: 'Learning',
            tags: ['react', 'components', 'best-practices'],
            createdAt: '2025-08-21T09:15:00Z',
            updatedAt: '2025-08-21T09:15:00Z',
            isFavorite: false
        },
        {
            id: '3',
            title: 'Weekend Trip Ideas',
            content: 'List of potential destinations for the upcoming long weekend...',
            category: 'Personal',
            tags: ['travel', 'weekend', 'planning'],
            createdAt: '2025-08-21T08:45:00Z',
            updatedAt: '2025-08-21T08:45:00Z',
            isFavorite: false
        }
    ]);

    const categories = ['all', 'work', 'personal', 'learning', 'ideas'];

    if (isLoading) {
        return (
            <div className="space-y-6" aria-live="polite" aria-label="Loading memory management dashboard">
                <div className="sr-only">Loading memory statistics and recent memories...</div>
                {/* Stats Grid Skeleton */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    role="region"
                    aria-label="Memory statistics loading"
                >
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div
                                    className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"
                                    aria-hidden="true"
                                ></div>
                                <div
                                    className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"
                                    aria-hidden="true"
                                ></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Memories Skeleton */}
                <div
                    className="space-y-4"
                    role="region"
                    aria-label="Recent memories loading"
                >
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div
                                    className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"
                                    aria-hidden="true"
                                ></div>
                                <div
                                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"
                                    aria-hidden="true"
                                ></div>
                                <div
                                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"
                                    aria-hidden="true"
                                ></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6" role="main" aria-label="Memory management dashboard">
            {/* Stats Overview */}
            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                role="region"
                aria-label="Memory statistics overview"
            >
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p
                                    className="text-sm text-gray-600 dark:text-gray-400"
                                    id="total-memories-label"
                                >
                                    Total Memories
                                </p>
                                <p
                                    className="text-2xl font-bold text-gray-900 dark:text-white"
                                    aria-labelledby="total-memories-label"
                                    role="status"
                                    aria-live="polite"
                                >
                                    {stats.totalMemories.toLocaleString()}
                                </p>
                            </div>
                            <Database
                                className="h-8 w-8 text-blue-500"
                                aria-hidden="true"
                                role="img"
                                aria-label="Database icon representing total memories"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p
                                    className="text-sm text-gray-600 dark:text-gray-400"
                                    id="recent-memories-label"
                                >
                                    Recent
                                </p>
                                <p
                                    className="text-2xl font-bold text-gray-900 dark:text-white"
                                    aria-labelledby="recent-memories-label"
                                    role="status"
                                    aria-live="polite"
                                >
                                    {stats.recentMemories}
                                </p>
                            </div>
                            <Clock
                                className="h-8 w-8 text-green-500"
                                aria-hidden="true"
                                role="img"
                                aria-label="Clock icon representing recent memories"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p
                                    className="text-sm text-gray-600 dark:text-gray-400"
                                    id="favorites-label"
                                >
                                    Favorites
                                </p>
                                <p
                                    className="text-2xl font-bold text-gray-900 dark:text-white"
                                    aria-labelledby="favorites-label"
                                    role="status"
                                    aria-live="polite"
                                >
                                    {stats.favorites}
                                </p>
                            </div>
                            <Star
                                className="h-8 w-8 text-yellow-500"
                                aria-hidden="true"
                                role="img"
                                aria-label="Star icon representing favorite memories"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p
                                    className="text-sm text-gray-600 dark:text-gray-400"
                                    id="connections-label"
                                >
                                    Connections
                                </p>
                                <p
                                    className="text-2xl font-bold text-gray-900 dark:text-white"
                                    aria-labelledby="connections-label"
                                    role="status"
                                    aria-live="polite"
                                >
                                    {stats.connections}
                                </p>
                            </div>
                            <Activity
                                className="h-8 w-8 text-purple-500"
                                aria-hidden="true"
                                role="img"
                                aria-label="Activity icon representing memory connections"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <fieldset className="flex flex-col sm:flex-row gap-4">
                        <legend className="sr-only">Search and filter memories</legend>

                        <div className="relative flex-1">
                            <label htmlFor="memory-search" className="sr-only">
                                Search memories
                            </label>
                            <Search
                                className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                                aria-hidden="true"
                            />
                            <Input
                                id="memory-search"
                                placeholder="Search memories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                                role="searchbox"
                                aria-label="Search through your memories"
                                aria-describedby="search-help"
                            />
                            <div id="search-help" className="sr-only">
                                Type to search through memory titles, content, and tags
                            </div>
                        </div>

                        <div className="flex space-x-2" role="group" aria-label="Filter controls">
                            <label htmlFor="category-select" className="sr-only">
                                Filter by category
                            </label>
                            <select
                                id="category-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                aria-label="Filter memories by category"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <Button
                                size="sm"
                                variant="outline"
                                aria-label="Open advanced filters"
                                title="Advanced filtering options"
                            >
                                <Filter className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">Advanced filters</span>
                            </Button>
                        </div>
                    </fieldset>
                </CardContent>
            </Card>

            {/* Recent Memories */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2
                        className="text-lg font-medium text-gray-900 dark:text-white"
                        id="recent-memories-heading"
                    >
                        Recent Memories
                    </h2>
                    <Link href="/memories">
                        <Button
                            variant="outline"
                            size="sm"
                            aria-label="View all memories in detail page"
                            className="inline-flex items-center"
                        >
                            View All
                            <ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />
                        </Button>
                    </Link>
                </div>

                <div
                    role="list"
                    aria-labelledby="recent-memories-heading"
                    aria-live="polite"
                    className="space-y-4"
                >
                    {recentMemories.map((memory, index) => (
                        <Card
                            key={memory.id}
                            className="hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500"
                            role="listitem"
                        >
                            <CardContent className="p-6">
                                <article>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <h3
                                                    className="text-lg font-medium text-gray-900 dark:text-white"
                                                    id={`memory-title-${memory.id}`}
                                                >
                                                    {memory.title}
                                                </h3>
                                                {memory.isFavorite && (
                                                    <Star
                                                        className="h-4 w-4 text-yellow-500 fill-current"
                                                        role="img"
                                                        aria-label="Favorite memory"
                                                        title="This memory is marked as favorite"
                                                    />
                                                )}
                                            </div>

                                            <p
                                                className="text-gray-600 dark:text-gray-400 line-clamp-2"
                                                aria-describedby={`memory-title-${memory.id}`}
                                            >
                                                {memory.content}
                                            </p>

                                            <div
                                                className="flex items-center space-x-4 text-sm"
                                                role="group"
                                                aria-label={`Memory metadata for ${memory.title}`}
                                            >
                                                <Badge
                                                    variant="outline"
                                                    role="status"
                                                    aria-label={`Category: ${memory.category}`}
                                                >
                                                    {memory.category}
                                                </Badge>

                                                <div
                                                    className="flex space-x-1"
                                                    role="list"
                                                    aria-label="Memory tags"
                                                >
                                                    {memory.tags.slice(0, 3).map((tag) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="text-xs"
                                                            role="listitem"
                                                            aria-label={`Tag: ${tag}`}
                                                        >
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                    {memory.tags.length > 3 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                            role="listitem"
                                                            aria-label={`${memory.tags.length - 3} more tags available`}
                                                        >
                                                            +{memory.tags.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <time
                                                    className="text-gray-500 flex items-center"
                                                    dateTime={memory.createdAt}
                                                    aria-label={`Created on ${new Date(memory.createdAt).toLocaleDateString()}`}
                                                >
                                                    <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                                                    {new Date(memory.createdAt).toLocaleDateString()}
                                                </time>
                                            </div>
                                        </div>

                                        <div
                                            className="flex space-x-2 ml-4"
                                            role="group"
                                            aria-label={`Actions for memory: ${memory.title}`}
                                        >
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                aria-label={`Edit memory: ${memory.title}`}
                                                title="Edit this memory"
                                            >
                                                <Edit3 className="h-4 w-4" aria-hidden="true" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                aria-label={`Delete memory: ${memory.title}`}
                                                title="Delete this memory"
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                            </Button>
                                        </div>
                                    </div>
                                </article>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle id="quick-actions-title">Quick Actions</CardTitle>
                    <CardDescription>Common memory management tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        role="group"
                        aria-labelledby="quick-actions-title"
                    >
                        <Button
                            className="h-20 flex flex-col items-center space-y-2 focus:ring-2 focus:ring-blue-500"
                            aria-label="Create a new memory"
                            title="Start creating a new memory entry"
                        >
                            <Plus className="h-6 w-6" aria-hidden="true" />
                            <span>Create Memory</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center space-y-2 focus:ring-2 focus:ring-blue-500"
                            aria-label="Open advanced search for memories"
                            title="Access detailed search and filtering options"
                        >
                            <Search className="h-6 w-6" aria-hidden="true" />
                            <span>Advanced Search</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center space-y-2 focus:ring-2 focus:ring-blue-500"
                            aria-label="View memory connection map"
                            title="Visualize connections between your memories"
                        >
                            <Activity className="h-6 w-6" aria-hidden="true" />
                            <span>Memory Map</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}