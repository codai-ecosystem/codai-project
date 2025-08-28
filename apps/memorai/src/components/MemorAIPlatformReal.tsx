'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Search, Star, Tag, Users, Settings, BarChart3, Plus, Filter, Archive, Download, Upload, Trash2 } from 'lucide-react';
import { Memory } from '@/types/memory';
import memoraiApiClient from '@/lib/memorai-api';

const MemorAIPlatform = () => {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [currentUser] = useState('user'); // Default user ID

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Load memories
            const memoriesResponse = await memoraiApiClient.getAllMemories(currentUser);
            if (memoriesResponse.success && memoriesResponse.data) {
                setMemories(memoriesResponse.data);
                setFilteredMemories(memoriesResponse.data);
            } else {
                throw new Error(memoriesResponse.error?.message || 'Failed to load memories');
            }

            // Load categories
            const categoriesResponse = await memoraiApiClient.getCategories(currentUser);
            if (categoriesResponse.success && categoriesResponse.data) {
                setCategories(categoriesResponse.data);
            }

            // Load tags
            const tagsResponse = await memoraiApiClient.getTags(currentUser);
            if (tagsResponse.success && tagsResponse.data) {
                setTags(tagsResponse.data);
            }

            // Load analytics
            const analyticsResponse = await memoraiApiClient.getMemoryAnalytics(currentUser);
            if (analyticsResponse.success && analyticsResponse.data) {
                setAnalytics(analyticsResponse.data);
            }

        } catch (err) {
            console.error('Error loading data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Handle search
    useEffect(() => {
        if (searchQuery.trim()) {
            performSearch(searchQuery);
        } else {
            filterMemories();
        }
    }, [searchQuery, selectedCategory, memories]);

    const performSearch = async (query: string) => {
        try {
            const searchResponse = await memoraiApiClient.searchMemories({
                query,
                userId: currentUser,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                limit: 50
            });

            if (searchResponse.success && searchResponse.data) {
                setFilteredMemories(searchResponse.data);
            }
        } catch (err) {
            console.error('Search error:', err);
            // Fallback to local filtering
            filterMemories();
        }
    };

    const filterMemories = () => {
        let filtered = memories;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(memory => memory.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(memory =>
                memory.title.toLowerCase().includes(query) ||
                memory.content.toLowerCase().includes(query) ||
                memory.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        setFilteredMemories(filtered);
    };

    // Handle creating new memory
    const handleCreateMemory = async (memoryData: {
        title: string;
        content: string;
        category: string;
        tags: string[];
        priority: 'low' | 'medium' | 'high';
        isPrivate: boolean;
    }) => {
        try {
            const response = await memoraiApiClient.createMemory({
                ...memoryData,
                userId: currentUser,
                type: 'note'
            });

            if (response.success && response.data) {
                setMemories(prev => [response.data!, ...prev]);
                setShowCreateForm(false);
                loadInitialData(); // Refresh data
            } else {
                throw new Error(response.error?.message || 'Failed to create memory');
            }
        } catch (err) {
            console.error('Error creating memory:', err);
            setError(err instanceof Error ? err.message : 'Failed to create memory');
        }
    };

    // Handle deleting memory
    const handleDeleteMemory = async (memoryId: string) => {
        if (!confirm('Are you sure you want to delete this memory?')) {
            return;
        }

        try {
            const response = await memoraiApiClient.deleteMemory(memoryId);
            if (response.success) {
                setMemories(prev => prev.filter(m => m.id !== memoryId));
                setSelectedMemory(null);
            } else {
                throw new Error(response.error?.message || 'Failed to delete memory');
            }
        } catch (err) {
            console.error('Error deleting memory:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete memory');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl">Loading MemorAI Platform...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center text-white bg-red-500/20 p-8 rounded-lg border border-red-500/30">
                    <h2 className="text-2xl font-bold mb-4">Error Loading MemorAI</h2>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={loadInitialData}
                        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            {/* Header */}
            <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Brain className="h-8 w-8 text-purple-400" />
                            <div>
                                <h1 className="text-xl font-bold text-white">MemorAI Platform</h1>
                                <p className="text-sm text-purple-300">Intelligent Memory Management System</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="text-purple-300 hover:text-white">
                                <Settings className="h-5 w-5" />
                            </button>
                            <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">U</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Analytics Dashboard */}
                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-purple-800/30">
                            <div className="flex items-center">
                                <Brain className="h-8 w-8 text-purple-400" />
                                <div className="ml-3">
                                    <p className="text-sm text-purple-300">Total Memories</p>
                                    <p className="text-2xl font-bold text-white">{analytics.totalMemories}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-purple-800/30">
                            <div className="flex items-center">
                                <Tag className="h-8 w-8 text-blue-400" />
                                <div className="ml-3">
                                    <p className="text-sm text-purple-300">Categories</p>
                                    <p className="text-2xl font-bold text-white">{analytics.categoriesCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-purple-800/30">
                            <div className="flex items-center">
                                <Star className="h-8 w-8 text-yellow-400" />
                                <div className="ml-3">
                                    <p className="text-sm text-purple-300">Avg. AI Score</p>
                                    <p className="text-2xl font-bold text-white">{analytics.averageImportance.toFixed(1)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-purple-800/30">
                            <div className="flex items-center">
                                <BarChart3 className="h-8 w-8 text-green-400" />
                                <div className="ml-3">
                                    <p className="text-sm text-purple-300">Tags Used</p>
                                    <p className="text-2xl font-bold text-white">{analytics.tagsCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Controls */}
                <div className="bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-purple-800/30 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                            <input
                                type="text"
                                placeholder="Search memories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-purple-900/30 border border-purple-700/50 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-purple-900/30 border border-purple-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Memory</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Memory List */}
                    <div className="lg:col-span-2">
                        <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-purple-800/30">
                            <div className="p-6 border-b border-purple-800/30">
                                <h2 className="text-xl font-bold text-white">Memories ({filteredMemories.length})</h2>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {filteredMemories.length === 0 ? (
                                    <div className="p-6 text-center text-purple-300">
                                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No memories found. Create your first memory to get started!</p>
                                    </div>
                                ) : (
                                    filteredMemories.map((memory) => (
                                        <div
                                            key={memory.id}
                                            onClick={() => setSelectedMemory(memory)}
                                            className="p-4 border-b border-purple-800/20 hover:bg-purple-800/10 cursor-pointer transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white mb-1">{memory.title}</h3>
                                                    <p className="text-purple-300 text-sm mb-2 line-clamp-2">{memory.content}</p>
                                                    <div className="flex items-center space-x-4 text-xs text-purple-400">
                                                        <span className="flex items-center">
                                                            <Tag className="h-3 w-3 mr-1" />
                                                            {memory.category}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            {memory.aiScore.toFixed(1)}
                                                        </span>
                                                        <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    {memory.isFavorite && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                                                    {memory.isPrivate && <Users className="h-4 w-4 text-red-400" />}
                                                </div>
                                            </div>
                                            {memory.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {memory.tags.slice(0, 3).map(tag => (
                                                        <span key={tag} className="px-2 py-1 text-xs bg-purple-600/30 text-purple-200 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {memory.tags.length > 3 && (
                                                        <span className="px-2 py-1 text-xs bg-purple-600/30 text-purple-200 rounded">
                                                            +{memory.tags.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Memory Detail / Sidebar */}
                    <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-purple-800/30">
                        {selectedMemory ? (
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-white">{selectedMemory.title}</h2>
                                    <button
                                        onClick={() => handleDeleteMemory(selectedMemory.id)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-purple-300 text-sm leading-relaxed">{selectedMemory.content}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-purple-400">Category:</span>
                                            <span className="text-white">{selectedMemory.category}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-purple-400">Priority:</span>
                                            <span className="text-white capitalize">{selectedMemory.priority}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-purple-400">AI Score:</span>
                                            <span className="text-white">{selectedMemory.aiScore.toFixed(1)}/100</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-purple-400">Created:</span>
                                            <span className="text-white">{new Date(selectedMemory.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {selectedMemory.tags.length > 0 && (
                                        <div>
                                            <p className="text-purple-400 text-sm mb-2">Tags:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedMemory.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-1 text-xs bg-purple-600/30 text-purple-200 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-purple-300">
                                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Select a memory to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Memory Modal */}
            {showCreateForm && (
                <CreateMemoryModal
                    onClose={() => setShowCreateForm(false)}
                    onCreate={handleCreateMemory}
                    categories={categories}
                    tags={tags}
                />
            )}
        </div>
    );
};

// Create Memory Modal Component
const CreateMemoryModal = ({
    onClose,
    onCreate,
    categories,
    tags
}: {
    onClose: () => void;
    onCreate: (data: any) => void;
    categories: string[];
    tags: string[];
}) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: categories[0] || 'General',
        tags: [] as string[],
        priority: 'medium' as 'low' | 'medium' | 'high',
        isPrivate: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.title.trim() && formData.content.trim()) {
            onCreate(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-purple-900/90 p-6 rounded-lg border border-purple-600/30 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4">Create New Memory</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 bg-purple-800/30 border border-purple-600/50 rounded text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Memory title..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                            Content *
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 bg-purple-800/30 border border-purple-600/50 rounded text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="What do you want to remember..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 bg-purple-800/30 border border-purple-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                            <option value="New Category">+ Create New Category</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                            Priority
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                            className="w-full px-3 py-2 bg-purple-800/30 border border-purple-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isPrivate"
                            checked={formData.isPrivate}
                            onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                            className="rounded border-purple-600/50 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="isPrivate" className="text-sm text-purple-300">
                            Private memory
                        </label>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-purple-600/50 text-purple-300 rounded hover:bg-purple-800/20"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                            Create Memory
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MemorAIPlatform;
