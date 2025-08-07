'use client'

import React from 'react';

import { useState, useEffect } from 'react';
import { Tag, FolderIcon, Filter, X, Search } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    color: string;
    count: number;
}

interface MemoryCategoriesProps {
    selectedCategory?: string;
    onCategorySelect: (category: string | null) => void;
    onCategoriesChange?: (categories: Category[]) => void;
}

// Predefined categories with colors
const DEFAULT_CATEGORIES: Category[] = [
    { id: 'learning', name: 'Learning', color: 'bg-blue-100 text-blue-800 border-blue-200', count: 0 },
    { id: 'work', name: 'Work', color: 'bg-green-100 text-green-800 border-green-200', count: 0 },
    { id: 'personal', name: 'Personal', color: 'bg-purple-100 text-purple-800 border-purple-200', count: 0 },
    { id: 'ideas', name: 'Ideas', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', count: 0 },
    { id: 'research', name: 'Research', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', count: 0 },
    { id: 'projects', name: 'Projects', color: 'bg-red-100 text-red-800 border-red-200', count: 0 },
    { id: 'meetings', name: 'Meetings', color: 'bg-orange-100 text-orange-800 border-orange-200', count: 0 },
    { id: 'notes', name: 'Notes', color: 'bg-gray-100 text-gray-800 border-gray-200', count: 0 },
    { id: 'reference', name: 'Reference', color: 'bg-teal-100 text-teal-800 border-teal-200', count: 0 },
    { id: 'archive', name: 'Archive', color: 'bg-slate-100 text-slate-800 border-slate-200', count: 0 }
];

export default function MemoryCategories({
    selectedCategory,
    onCategorySelect,
    onCategoriesChange
}: MemoryCategoriesProps) {
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCategoryCounts();
    }, []);

    const loadCategoryCounts = async () => {
        try {
            setIsLoading(true);

            // Load category counts from API
            const promises = DEFAULT_CATEGORIES.map(async (category) => {
                try {
                    const response = await fetch(`/api/memories?category=${category.id}&limit=0`);
                    if (response.ok) {
                        const data = await response.json();
                        return {
                            ...category,
                            count: data.meta?.total || 0
                        };
                    }
                    return { ...category, count: 0 };
                } catch (error) {
                    console.error(`Error loading count for category ${category.id}:`, error);
                    return { ...category, count: 0 };
                }
            });

            const categoriesWithCounts = await Promise.all(promises);
            setCategories(categoriesWithCounts);
            onCategoriesChange?.(categoriesWithCounts);
        } catch (error) {
            console.error('Error loading category counts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalMemories = categories.reduce((sum, category) => sum + category.count, 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FolderIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Categories
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({totalMemories} total)
                    </span>
                </div>
                {selectedCategory && (
                    <button
                        onClick={() => onCategorySelect(null)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        <X className="h-4 w-4" />
                        Clear filter
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
            </div>

            {/* Categories Grid */}
            <div className="space-y-2">
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* All Memories Option */}
                        <button
                            onClick={() => onCategorySelect(null)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${!selectedCategory
                                    ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Filter className="h-4 w-4" />
                                <span className="font-medium">All Memories</span>
                            </div>
                            <span className="text-sm font-semibold">
                                {totalMemories}
                            </span>
                        </button>

                        {/* Category Buttons */}
                        {filteredCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => onCategorySelect(category.id)}
                                disabled={category.count === 0}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${selectedCategory === category.id
                                        ? `${category.color} border-current`
                                        : category.count > 0
                                            ? 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                                            : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-900 dark:border-gray-700 dark:text-gray-500'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${category.count > 0
                                            ? category.color.split(' ')[0].replace('bg-', 'bg-')
                                            : 'bg-gray-300 dark:bg-gray-600'
                                        }`} />
                                    <span className="font-medium">
                                        {category.name}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold">
                                    {category.count}
                                </span>
                            </button>
                        ))}
                    </>
                )}
            </div>

            {filteredCategories.length === 0 && searchTerm && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FolderIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No categories found matching "{searchTerm}"</p>
                </div>
            )}

            {/* Refresh Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={loadCategoryCounts}
                    disabled={isLoading}
                    className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Refreshing...' : 'Refresh Counts'}
                </button>
            </div>
        </div>
    );
}

