'use client';

import React, { useState, useEffect } from 'react';
import { Memory } from '@/types/memory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MemoryList from '@/components/memory-list';
import MemoryViewer from '@/components/memory-viewer';
import MemoryEditor from '@/components/memory-editor';
import AdvancedSearch from '@/components/advanced-search';
import AISearchComponent from '@/components/ai-search';
import ConnectionStatus from '@/components/connection-status';
import { useNotificationContext } from '@/contexts/notification-context';
import { useWebSocket } from '@/hooks/use-websocket';
import { useMemorAIApi } from '@/lib/memorai-api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIInsightsDashboard from '@/components/ai-insights-dashboard';
import { 
    Brain, Plus, Search, Filter, List, Grid, 
    Calendar, Tag, User, Settings, RefreshCw, Download, Upload, Zap, BarChart3, Sparkles 
} from 'lucide-react';

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

export default function MemoryDashboard() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Memory[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [analytics, setAnalytics] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'memories' | 'search' | 'insights'>('memories');
    const [filters, setFilters] = useState<FilterOptions>({
        sortBy: 'updated',
        sortOrder: 'desc'
    });

    const { showNotification } = useNotificationContext();
    const { isConnected } = useWebSocket();
    const api = useMemorAIApi();

    // Current user - in a real app, this would come from authentication
    const currentUserId = 'user-1'; // This should be dynamic based on auth

    // Load memories on component mount
    useEffect(() => {
        loadMemories();
        loadAnalytics();
    }, []);

    // Real-time WebSocket message handling
    useEffect(() => {
        if (isConnected) {
            showNotification({
                type: 'success',
                title: 'Connected',
                message: 'Real-time updates are now active'
            });
        } else {
            showNotification({
                type: 'warning',
                title: 'Disconnected',
                message: 'Real-time updates are paused'
            });
        }
    }, [isConnected, showNotification]);

    // Handle WebSocket memory updates
    const handleWebSocketMessage = (message: any) => {
        try {
            const data = typeof message === 'string' ? JSON.parse(message) : message;
            
            switch (data.type) {
                case 'MEMORY_CREATED':
                    if (data.memory && data.memory.userId === currentUserId) {
                        setMemories(prev => [data.memory, ...prev]);
                        showNotification({
                            type: 'info',
                            title: 'New Memory',
                            message: 'A new memory was created'
                        });
                    }
                    break;
                    
                case 'MEMORY_UPDATED':
                    if (data.memory && data.memory.userId === currentUserId) {
                        setMemories(prev => prev.map(memory => 
                            memory.id === data.memory.id ? data.memory : memory
                        ));
                        showNotification({
                            type: 'info',
                            title: 'Memory Updated',
                            message: 'A memory was updated'
                        });
                    }
                    break;
                    
                case 'MEMORY_DELETED':
                    if (data.memoryId) {
                        setMemories(prev => prev.filter(memory => memory.id !== data.memoryId));
                        showNotification({
                            type: 'info',
                            title: 'Memory Deleted',
                            message: 'A memory was deleted'
                        });
                    }
                    break;
                    
                case 'ANALYTICS_UPDATED':
                    if (data.analytics && data.userId === currentUserId) {
                        setAnalytics(data.analytics);
                    }
                    break;
                    
                default:
                    console.log('Unknown WebSocket message type:', data.type);
            }
        } catch (err) {
            console.error('Error processing WebSocket message:', err);
        }
    };

    // Register WebSocket message handler
    useEffect(() => {
        // In a real implementation, this would be handled by the useWebSocket hook
        // For now, we'll set up a mock handler that can be extended
        const mockWebSocketHandler = (event: MessageEvent) => {
            handleWebSocketMessage(event.data);
        };
        
        // This would be replaced with actual WebSocket event listener
        // window.addEventListener('memorai-websocket-message', mockWebSocketHandler);
        
        return () => {
            // window.removeEventListener('memorai-websocket-message', mockWebSocketHandler);
        };
    }, [currentUserId, showNotification]);

    const loadMemories = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.getAllMemories(currentUserId);
            
            if (response.success && response.data) {
                setMemories(response.data);
                showNotification({
                    type: 'success',
                    title: 'Memories Loaded',
                    message: `Loaded ${response.data.length} memories successfully`
                });
            } else if (response.error) {
                // If API fails, fall back to mock data for development
                console.warn('API failed, using mock data:', response.error);
                const mockMemories = [
                    {
                        id: '1',
                        content: 'Remember to implement the new memory dashboard with advanced search capabilities',
                        category: 'development',
                        tags: ['memorai', 'dashboard', 'phase-2'],
                        createdAt: new Date('2025-08-05T10:00:00Z'),
                        updatedAt: new Date('2025-08-05T11:00:00Z'),
                        userId: 'user-1',
                        importance: 8,
                        isPublic: false
                    },
                    {
                        id: '2', 
                        content: 'UI Component Testing achieved 91% success rate - Button, Card, Input, Loading all at 100%',
                        category: 'testing',
                        tags: ['testing', 'ui', 'components', 'success'],
                        createdAt: new Date('2025-08-05T09:30:00Z'),
                        updatedAt: new Date('2025-08-05T11:30:00Z'),
                        userId: 'user-1',
                        importance: 9,
                        isPublic: false
                    },
                    {
                        id: '3',
                        content: 'MemorAI Phase 2 API Integration: Successfully connected dashboard to real MemorAI MCP backend',
                        category: 'development',
                        tags: ['phase-2', 'api', 'integration', 'memorai'],
                        createdAt: new Date('2025-08-05T08:00:00Z'),
                        updatedAt: new Date('2025-08-05T12:00:00Z'),
                        userId: 'user-1',
                        importance: 10,
                        isPublic: false
                    }
                ];
                setMemories(mockMemories);
                setError('Connected to mock data - API integration in progress');
                showNotification({
                    type: 'warning',
                    title: 'Using Mock Data',
                    message: 'API connection failed, using development data'
                });
            }
        } catch (err) {
            setError('Failed to load memories');
            showNotification({
                type: 'error',
                title: 'Load Failed',
                message: 'Failed to load memories. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            const response = await api.getMemoryAnalytics(currentUserId);
            if (response.success && response.data) {
                setAnalytics(response.data);
            }
        } catch (err) {
            console.warn('Analytics loading failed:', err);
        }
    };

    // Apply filters when they change
    useEffect(() => {
        applyFilters();
    }, [memories, filters, searchResults]);

    const applyFilters = () => {
        let filtered = searchResults || memories;

        // Apply category filter
        if (filters.category) {
            filtered = filtered.filter(memory => memory.category === filters.category);
        }

        // Apply tags filter
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(memory => 
                filters.tags!.some(tag => memory.tags.includes(tag))
            );
        }

        // Apply date range filter
        if (filters.dateRange?.start || filters.dateRange?.end) {
            filtered = filtered.filter(memory => {
                const memoryDate = new Date(memory.createdAt);
                const start = filters.dateRange?.start ? new Date(filters.dateRange.start) : null;
                const end = filters.dateRange?.end ? new Date(filters.dateRange.end) : null;
                
                if (start && memoryDate < start) return false;
                if (end && memoryDate > end) return false;
                return true;
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (filters.sortBy) {
                case 'created':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'updated':
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    break;
                case 'relevance':
                    comparison = (a.importance || 0) - (b.importance || 0);
                    break;
                case 'alphabetical':
                    comparison = a.content.localeCompare(b.content);
                    break;
                default:
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            }
            
            return filters.sortOrder === 'desc' ? -comparison : comparison;
        });

        setFilteredMemories(filtered);
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults(null);
            setSearchQuery('');
            return;
        }

        try {
            setIsSearching(true);
            setSearchQuery(query);
            
            // Try semantic search first
            const response = await api.semanticSearch(query, currentUserId, 20);
            
            if (response.success && response.data) {
                setSearchResults(response.data);
                showNotification({
                    type: 'success',
                    title: 'Search Results',
                    message: `Found ${response.data.length} memories matching "${query}"`
                });
            } else {
                // Fallback to local search if API fails
                const results = memories.filter(memory => 
                    memory.content.toLowerCase().includes(query.toLowerCase()) ||
                    memory.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
                    memory.category.toLowerCase().includes(query.toLowerCase())
                );
                
                setSearchResults(results);
                showNotification({
                    type: 'info',
                    title: 'Local Search Results',
                    message: `Found ${results.length} memories matching "${query}" (local search)`
                });
            }
        } catch (err) {
            showNotification({
                type: 'error',
                title: 'Search Failed',
                message: 'Failed to search memories. Please try again.'
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreateMemory = async (memoryData: Partial<Memory>) => {
        try {
            const response = await api.createMemory({
                content: memoryData.content || '',
                category: memoryData.category,
                tags: memoryData.tags || [],
                importance: memoryData.importance,
                isPublic: memoryData.isPublic || false,
            });
            
            if (response.success && response.data) {
                setMemories(prev => [response.data!, ...prev]);
                setIsCreating(false);
                
                showNotification({
                    type: 'success',
                    title: 'Memory Created',
                    message: 'New memory created successfully'
                });
            } else {
                throw new Error(response.error?.message || 'Failed to create memory');
            }
        } catch (err) {
            // Fallback to mock creation for development
            const newMemory: Memory = {
                id: Date.now().toString(),
                content: memoryData.content || '',
                category: memoryData.category || 'general',
                tags: memoryData.tags || [],
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: currentUserId,
                importance: memoryData.importance || 5,
                isPublic: memoryData.isPublic || false
            };
            
            setMemories(prev => [newMemory, ...prev]);
            setIsCreating(false);
            
            showNotification({
                type: 'warning',
                title: 'Memory Created (Mock)',
                message: 'Memory created using mock data - API integration in progress'
            });
        }
    };

    const handleUpdateMemory = async (id: string, updates: Partial<Memory>) => {
        try {
            const response = await api.updateMemory(id, updates);
            
            if (response.success && response.data) {
                setMemories(prev => prev.map(memory => 
                    memory.id === id ? response.data! : memory
                ));
                
                setIsEditing(false);
                setSelectedMemory(null);
                
                showNotification({
                    type: 'success',
                    title: 'Memory Updated',
                    message: 'Memory updated successfully'
                });
            } else {
                throw new Error(response.error?.message || 'Failed to update memory');
            }
        } catch (err) {
            // Fallback to mock update for development
            setMemories(prev => prev.map(memory => 
                memory.id === id 
                    ? { ...memory, ...updates, updatedAt: new Date() }
                    : memory
            ));
            
            setIsEditing(false);
            setSelectedMemory(null);
            
            showNotification({
                type: 'warning',
                title: 'Memory Updated (Mock)',
                message: 'Memory updated using mock data - API integration in progress'
            });
        }
    };

    const handleDeleteMemory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this memory?')) {
            return;
        }

        try {
            const response = await api.deleteMemory(id);
            
            if (response.success) {
                setMemories(prev => prev.filter(memory => memory.id !== id));
                setSelectedMemory(null);
                
                showNotification({
                    type: 'success',
                    title: 'Memory Deleted',
                    message: 'Memory deleted successfully'
                });
            } else {
                throw new Error(response.error?.message || 'Failed to delete memory');
            }
        } catch (err) {
            // Fallback to mock deletion for development
            setMemories(prev => prev.filter(memory => memory.id !== id));
            setSelectedMemory(null);
            
            showNotification({
                type: 'warning',
                title: 'Memory Deleted (Mock)',
                message: 'Memory deleted using mock data - API integration in progress'
            });
        }
    };

    const handleRefresh = () => {
        loadMemories();
        loadAnalytics();
    };

    const displayMemories = filteredMemories;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Brain className="h-8 w-8 text-blue-600" />
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                MemorAI Dashboard
                            </h1>
                            <ConnectionStatus isConnected={isConnected} />
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                onClick={() => setIsCreating(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Memory
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'memories' | 'search' | 'insights')} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="memories" className="flex items-center space-x-2">
                            <Brain className="h-4 w-4" />
                            <span>My Memories</span>
                        </TabsTrigger>
                        <TabsTrigger value="search" className="flex items-center space-x-2">
                            <Sparkles className="h-4 w-4" />
                            <span>AI Search</span>
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="flex items-center space-x-2">
                            <Zap className="h-4 w-4" />
                            <span>AI Insights</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="memories" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="space-y-6">
                                    {/* Quick Stats */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Total Memories</span>
                                                    <span className="font-semibold">{memories.length}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Categories</span>
                                                    <span className="font-semibold">
                                                        {new Set(memories.map(m => m.category)).size}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Tags</span>
                                                    <span className="font-semibold">
                                                        {new Set(memories.flatMap(m => m.tags)).size}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Filters */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm font-medium flex items-center">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Filters
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Sort By
                                            </label>
                                            <select
                                                value={filters.sortBy}
                                                onChange={(e) => setFilters(prev => ({ 
                                                    ...prev, 
                                                    sortBy: e.target.value as FilterOptions['sortBy']
                                                }))}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700"
                                            >
                                                <option value="updated">Last Updated</option>
                                                <option value="created">Date Created</option>
                                                <option value="relevance">Importance</option>
                                                <option value="alphabetical">Alphabetical</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Order
                                            </label>
                                            <select
                                                value={filters.sortOrder}
                                                onChange={(e) => setFilters(prev => ({ 
                                                    ...prev, 
                                                    sortOrder: e.target.value as FilterOptions['sortOrder']
                                                }))}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700"
                                            >
                                                <option value="desc">Descending</option>
                                                <option value="asc">Ascending</option>
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Main Panel */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Memories</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <Grid className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 mt-4">
                                    <div className="flex-1">
                                        <Input
                                            type="text"
                                            placeholder="Search memories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                                            className="w-full"
                                        />
                                    </div>
                                    <Button
                                        onClick={() => handleSearch(searchQuery)}
                                        variant="outline"
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                    {searchResults && (
                                        <Button
                                            onClick={() => {
                                                setSearchResults(null);
                                                setSearchQuery('');
                                            }}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading memories...</p>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12">
                                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                                        <Button onClick={loadMemories} variant="outline">
                                            Try Again
                                        </Button>
                                    </div>
                                ) : displayMemories.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                            {searchResults ? 'No memories found matching your search' : 'No memories yet'}
                                        </p>
                                        <Button onClick={() => setIsCreating(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Your First Memory
                                        </Button>
                                    </div>
                                ) : (
                                    <MemoryList
                                        memories={displayMemories}
                                        selectedMemory={selectedMemory}
                                        onSelectMemory={setSelectedMemory}
                                        onDeleteMemory={handleDeleteMemory}
                                        viewMode={viewMode}
                                        loading={loading}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="search" className="mt-0">
                <div className="space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                            <Sparkles className="h-8 w-8 text-blue-600" />
                            AI-Powered Search
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Experience next-generation search with natural language processing, 
                            semantic understanding, and personalized results powered by AI insights.
                        </p>
                    </div>

                    <AISearchComponent
                        onResultSelect={(memory) => {
                            setSelectedMemory(memory);
                            setActiveTab('memories');
                        }}
                        enablePersonalization={true}
                        showAnalytics={true}
                        className="w-full"
                    />
                </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
                <AIInsightsDashboard
                    memories={memories}
                    userId="current-user" // TODO: Get from authentication context
                    onRecommendationAction={(recommendation) => {
                        // Handle recommendation actions
                        console.log('Recommendation action:', recommendation);
                        // TODO: Implement recommendation handling logic
                    }}
                    onPatternExplore={(pattern) => {
                        // Handle pattern exploration
                        console.log('Pattern explore:', pattern);
                        // TODO: Implement pattern exploration logic
                    }}
                    onClusterView={(cluster) => {
                        // Handle cluster viewing
                        console.log('Cluster view:', cluster);
                        // TODO: Implement cluster viewing logic
                    }}
                />
            </TabsContent>
        </Tabs>
    </div>

            {/* Modals */}
            {selectedMemory && !isEditing && !isCreating && (
                <MemoryViewer
                    memory={selectedMemory}
                    onClose={() => setSelectedMemory(null)}
                    onEdit={() => setIsEditing(true)}
                    onDelete={() => handleDeleteMemory(selectedMemory.id)}
                />
            )}

            {isEditing && selectedMemory && (
                <MemoryEditor
                    memory={selectedMemory}
                    onSave={(updates) => handleUpdateMemory(selectedMemory.id, updates)}
                    onCancel={() => {
                        setIsEditing(false);
                        setSelectedMemory(null);
                    }}
                />
            )}

            {isCreating && (
                <MemoryEditor
                    onSave={handleCreateMemory}
                    onCancel={() => setIsCreating(false)}
                />
            )}
        </div>
    );
}
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchResults, setSearchResults] = useState<Memory[] | null>(null);

    // Notification context
    const notifications = useNotificationContext();

    // Organization state
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [filters, setFilters] = useState<FilterOptions>({
        sortBy: 'created',
        sortOrder: 'desc'
    });
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('list');

    // WebSocket integration for real-time updates
    const { state: wsState, notifyMemoryCreated, notifyMemoryUpdated, notifyMemoryDeleted } = useWebSocket({
        userId: 'current-user', // TODO: Get from authentication context
        onMessage: (message) => {
            console.log('📨 WebSocket message received:', message);

            switch (message.type) {
                case 'memory_created':
                    if (message.data && message.userId !== 'current-user') {
                        setMemories(prev => [message.data, ...prev]);
                        notifications.info(
                            `New memory "${message.data.title}" was created by another user.`,
                            'Collaborative Update'
                        );
                    }
                    break;

                case 'memory_updated':
                    if (message.data && message.userId !== 'current-user') {
                        setMemories(prev => prev.map(m =>
                            m.id === message.data.id ? { ...m, ...message.data } : m
                        ));
                        notifications.info(
                            `Memory "${message.data.title}" was updated by another user.`,
                            'Collaborative Update'
                        );
                    }
                    break;

                case 'memory_deleted':
                    if (message.data && message.userId !== 'current-user') {
                        setMemories(prev => prev.filter(m => m.id !== message.data));
                        notifications.warning(
                            'A memory was deleted by another user.',
                            'Collaborative Update'
                        );
                    }
                    break;

                case 'user_activity':
                    // Handle user activity notifications
                    console.log('👤 User activity:', message.data);
                    break;
            }
        },
        onConnect: () => {
            console.log('🔌 WebSocket connected to MemorAI');
            notifications.success('Real-time collaboration enabled', 'Connected');
        },
        onDisconnect: () => {
            console.log('🔌 WebSocket disconnected from MemorAI');
            notifications.warning('Real-time collaboration disabled', 'Disconnected');
        }
    });

    // Load memories on component mount
    useEffect(() => {
        loadMemories();
    }, []);

    // Apply filters whenever dependencies change
    useEffect(() => {
        applyFilters();
    }, [memories, selectedCategory, selectedTags, filters]);

    const loadMemories = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/memories');
            const result: ApiResponse<Memory[]> = await response.json();

            if (result.success && result.data) {
                setMemories(result.data);
            } else {
                setError(result.error?.message || 'Failed to load memories');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...memories];

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(memory => memory.category === selectedCategory);
        }

        // Apply tags filter
        if (selectedTags.length > 0) {
            filtered = filtered.filter(memory =>
                memory.tags?.some(tag => selectedTags.includes(tag))
            );
        }

        // Apply date range filter
        if (filters.dateRange?.start || filters.dateRange?.end) {
            filtered = filtered.filter(memory => {
                const memoryDate = new Date(memory.createdAt);
                const start = filters.dateRange?.start ? new Date(filters.dateRange.start) : null;
                const end = filters.dateRange?.end ? new Date(filters.dateRange.end) : null;

                if (start && memoryDate < start) return false;
                if (end && memoryDate > end) return false;
                return true;
            });
        }

        // Apply author filter
        if (filters.author) {
            filtered = filtered.filter(memory =>
                memory.userId?.toLowerCase().includes(filters.author!.toLowerCase())
            );
        }

        // Apply sorting
        const sortBy = filters.sortBy || 'created';
        const sortOrder = filters.sortOrder || 'desc';

        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortBy) {
                case 'created':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'updated':
                    aValue = new Date(a.updatedAt);
                    bValue = new Date(b.updatedAt);
                    break;
                case 'alphabetical':
                    aValue = a.title?.toLowerCase() || a.content.toLowerCase();
                    bValue = b.title?.toLowerCase() || b.content.toLowerCase();
                    break;
                case 'relevance':
                default:
                    // For relevance, we could use search scores if available
                    aValue = a.relevanceScore || 0;
                    bValue = b.relevanceScore || 0;
                    break;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredMemories(filtered);
    };

    const handleFiltersChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
    };

    const handleFiltersReset = () => {
        setSelectedCategory(null);
        setSelectedTags([]);
        setFilters({
            sortBy: 'created',
            sortOrder: 'desc'
        });
    };

    const handleCreateMemory = async (memoryData: { content: string; title?: string; category?: string; tags?: string[] }) => {
        try {
            const response = await fetch('/api/memories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memoryData),
            });

            const result: ApiResponse<Memory> = await response.json();

            if (result.success && result.data) {
                setMemories(prev => [result.data!, ...prev]);
                setIsCreating(false);
                setSelectedMemory(null);

                // Notify other users via WebSocket
                notifyMemoryCreated(result.data);

                // Show success notification
                notifications.success(
                    `Memory "${result.data.title || 'Untitled'}" has been created successfully.`,
                    'Memory Created'
                );
            } else {
                const errorMsg = result.error?.message || 'Failed to create memory';
                setError(errorMsg);
                notifications.error(errorMsg, 'Creation Failed');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMsg);
            notifications.error(errorMsg, 'Creation Error');
        }
    };

    const handleUpdateMemory = async (id: string, updates: Partial<Memory>) => {
        try {
            const response = await fetch(`/api/memories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            const result: ApiResponse<Memory> = await response.json();

            if (result.success && result.data) {
                setMemories(prev => prev.map(m => m.id === id ? result.data! : m));
                setSelectedMemory(result.data);
                setIsEditing(false); // Exit edit mode after successful update

                // Notify other users via WebSocket
                notifyMemoryUpdated(result.data);

                // Show success notification
                notifications.info(
                    `Memory "${result.data.title || 'Untitled'}" has been updated.`,
                    'Memory Updated'
                );
            } else {
                const errorMsg = result.error?.message || 'Failed to update memory';
                setError(errorMsg);
                notifications.error(errorMsg, 'Update Failed');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMsg);
            notifications.error(errorMsg, 'Update Error');
        }
    };

    const handleDeleteMemory = async (id: string) => {
        try {
            const memoryToDelete = memories.find(m => m.id === id);

            const response = await fetch(`/api/memories/${id}`, {
                method: 'DELETE',
            });

            const result: ApiResponse = await response.json();

            if (result.success) {
                setMemories(prev => prev.filter(m => m.id !== id));
                setSelectedMemory(null);

                // Notify other users via WebSocket
                notifyMemoryDeleted(id);

                // Show success notification
                notifications.warning(
                    `Memory "${memoryToDelete?.title || 'Untitled'}" has been deleted.`,
                    'Memory Deleted'
                );
            } else {
                const errorMsg = result.error?.message || 'Failed to delete memory';
                setError(errorMsg);
                notifications.error(errorMsg, 'Delete Failed');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMsg);
            notifications.error(errorMsg, 'Delete Error');
        }
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults(null);
            return;
        }

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            const result = await response.json();

            if (result.success && result.data) {
                // Extract memories from search results
                setSearchResults(result.data.map((item: any) => item.memory || item));
            } else {
                setError(result.error?.message || 'Search failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search error');
        }
    };

    const displayMemories = searchResults || filteredMemories;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <div className="flex items-center min-w-0 flex-1">
                            <div className="flex-shrink-0">
                                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                                    🧠 MemorAI
                                </h1>
                            </div>
                            <div className="ml-2 sm:ml-4 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                    Your Personal Memory Assistant
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 sm:p-2 rounded-md transition-colors touch-target ${viewMode === 'list'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    aria-label="List view"
                                >
                                    <List className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 sm:p-2 rounded-md transition-colors touch-target ${viewMode === 'grid'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    aria-label="Grid view"
                                >
                                    <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('timeline')}
                                    className={`p-1.5 sm:p-2 rounded-md transition-colors touch-target ${viewMode === 'timeline'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    aria-label="Timeline view"
                                >
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                            </div>

                            {/* Sidebar Toggle */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors touch-target"
                                aria-label="Toggle sidebar"
                            >
                                <Sidebar className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>

                            {/* WebSocket Status Indicator */}
                            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                {wsState.isConnected ? (
                                    <>
                                        <Wifi className="h-3 w-3 text-green-500" />
                                        <span className="hidden sm:inline">Live</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="h-3 w-3 text-gray-400" />
                                        <span className="hidden sm:inline">Offline</span>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => setIsCreating(true)}
                                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-target"
                            >
                                <span className="hidden sm:inline">+ New Memory</span>
                                <span className="sm:hidden">+</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Error display */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className={`flex gap-6 ${sidebarOpen ? 'lg:grid-cols-4' : 'lg:grid-cols-1'}`}>
                    {/* Sidebar - Organization Components */}
                    {sidebarOpen && (
                        <div className="w-80 space-y-6">
                            {/* Advanced Search Interface */}
                            <AdvancedSearch
                                onSearch={(query, searchFilters) => {
                                    handleSearch(query);
                                    if (searchFilters) {
                                        // Apply advanced filters
                                        setFilters(prev => ({
                                            ...prev,
                                            category: searchFilters.categories?.[0] || prev.category,
                                            tags: searchFilters.tags || prev.tags,
                                            // Add more filter mappings as needed
                                        }));
                                    }
                                }}
                                onClear={() => {
                                    setSearchResults(null);
                                    setSearchQuery('');
                                    setFilters({
                                        sortBy: 'updated',
                                        sortOrder: 'desc'
                                    });
                                }}
                                isSearching={isSearching}
                                searchResults={searchResults}
                            />

                            {/* Filters */}
                            <MemoryFilters
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                onReset={handleFiltersReset}
                                totalResults={displayMemories.length}
                            />

                            {/* Categories */}
                            <MemoryCategories
                                selectedCategory={selectedCategory}
                                onCategorySelect={setSelectedCategory}
                            />

                            {/* Tags */}
                            <MemoryTags
                                selectedTags={selectedTags}
                                onTagsSelect={setSelectedTags}
                            />
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        {/* Memory List or Grid */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {searchResults
                                            ? `Search Results (${searchResults.length})`
                                            : `Memories (${displayMemories.length})`
                                        }
                                    </h2>
                                    {!sidebarOpen && (
                                        <button
                                            onClick={() => setSidebarOpen(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            <Layout className="h-4 w-4" />
                                            Show Filters
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                    >
                                        <Plus className="h-4 w-4" />
                                        New Memory
                                    </button>
                                </div>
                            </div>

                            {/* Memory List Content */}
                            <div className="p-6">
                                <MemoryList
                                    memories={displayMemories}
                                    viewMode={viewMode}
                                    onMemorySelect={setSelectedMemory}
                                    onMemoryEdit={setEditingMemory}
                                    onMemoryDelete={handleMemoryDelete}
                                />
                            </div>
                        </div>
                    </div>

        {/* Error display */}
        {error && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setError(null)}
                                className="text-red-400 hover:text-red-600"
                            >
                                <span className="sr-only">Dismiss</span>
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className={`flex flex-col lg:flex-row gap-4 lg:gap-6`}>
            {/* Sidebar - Organization Components */}
            {sidebarOpen && (
                <div className="w-full lg:w-80 space-y-4 lg:space-y-6 order-2 lg:order-1">
                    {/* Search Interface */}
                    <div className="lg:hidden">
                        <SearchInterface onSearch={handleSearch} />
                    </div>

                    {/* Mobile accordion for filters */}
                    <div className="lg:hidden bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="p-4 space-y-4">
                            <MemoryFilters
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                onReset={handleFiltersReset}
                                totalResults={displayMemories.length}
                            />
                            <MemoryCategories
                                selectedCategory={selectedCategory}
                                onCategorySelect={setSelectedCategory}
                            />
                            <MemoryTags
                                selectedTags={selectedTags}
                                onTagsSelect={setSelectedTags}
                            />
                        </div>
                    </div>

                    {/* Desktop sidebar */}
                    <div className="hidden lg:block space-y-6">
                        <SearchInterface onSearch={handleSearch} />
                        <ConnectionStatus
                            userId="current-user"
                            className="lg:sticky lg:top-4"
                        />
                        <MemoryFilters
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                            onReset={handleFiltersReset}
                            totalResults={displayMemories.length}
                        />
                        <MemoryCategories
                            selectedCategory={selectedCategory}
                            onCategorySelect={setSelectedCategory}
                        />
                        <MemoryTags
                            selectedTags={selectedTags}
                            onTagsSelect={setSelectedTags}
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 space-y-4 lg:space-y-6 order-1 lg:order-2">
                {viewMode === 'timeline' ? (
                    <MemoryTimeline
                        memories={displayMemories}
                        onMemorySelect={setSelectedMemory}
                        onMemoryEdit={(memory) => {
                            setSelectedMemory(memory);
                            setIsEditing(true);
                        }}
                    />
                ) : (
                    /* Memory List or Grid */
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                                    {searchResults
                                        ? `Search Results (${searchResults.length})`
                                        : `Memories (${displayMemories.length})`
                                    }
                                </h2>
                                {!sidebarOpen && (
                                    <button
                                        onClick={() => setSidebarOpen(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 touch-target self-start sm:self-auto"
                                    >
                                        <Layout className="h-4 w-4" />
                                        Show Filters
                                    </button>
                                )}
                            </div>
                            {searchResults && (
                                <button
                                    onClick={() => setSearchResults(null)}
                                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 touch-target"
                                >
                                    ← Back to all memories
                                </button>
                            )}
                        </div>

                        {/* Memory List Content */}
                        {loading ? (
                            <div className="p-4 sm:p-6 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading memories...</p>
                            </div>
                        ) : (
                            <div className="p-3 sm:p-6">
                                <MemoryList
                                    memories={displayMemories}
                                    selectedMemory={selectedMemory}
                                    onSelectMemory={setSelectedMemory}
                                    onDeleteMemory={handleDeleteMemory}
                                    viewMode={viewMode}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Memory Viewer Modal */}
        {selectedMemory && !isEditing && !isCreating && (
            <MemoryViewer
                memory={selectedMemory}
                onClose={() => setSelectedMemory(null)}
                onEdit={() => setIsEditing(true)}
                onDelete={() => handleDeleteMemory(selectedMemory.id)}
            />
        )}

        {/* Memory Editor Modal */}
        {isEditing && selectedMemory && (
            <MemoryEditor
                memory={selectedMemory}
                onSave={(updates) => handleUpdateMemory(selectedMemory.id, updates)}
                onCancel={() => {
                    setIsEditing(false);
                    setSelectedMemory(null);
                }}
            />
        )}

        {/* Memory Creator Modal */}
        {isCreating && (
            <MemoryEditor
                onSave={handleCreateMemory}
                onCancel={() => setIsCreating(false)}
            />
        )}
        </div>
    );
}
