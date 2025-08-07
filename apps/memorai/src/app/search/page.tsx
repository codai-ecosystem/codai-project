'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Clock,
    Star,
    Bookmark,
    TrendingUp,
    Target,
    Brain,
    Zap,
    Eye,
    Download,
    Share2,
    Copy,
    ExternalLink,
    FileText,
    Image,
    Video,
    Music,
    File,
    Code,
    Link,
    Database,
    Tag,
    User,
    Calendar,
    Globe,
    Lock,
    Layers,
    Network,
    BarChart3,
    PieChart,
    Activity,
    RefreshCw,
    SortAsc,
    SortDesc,
    ArrowUpDown,
    ChevronDown,
    ChevronRight,
    Plus,
    Minus,
    X,
    Check,
    AlertTriangle,
    Info,
    Settings,
    Sliders,
    Grid,
    List,
    MoreVertical
} from 'lucide-react';

interface SearchResult {
    id: string;
    title: string;
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'link' | 'code';
    collection: string;
    creator: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    relevanceScore: number;
    semanticSimilarity: number;
    highlights: string[];
    metadata: {
        size: string;
        language?: string;
        sentiment?: number;
        importance?: number;
        accessCount: number;
        lastAccessed: string;
    };
    embedding: {
        model: string;
        vector: number[];
        accuracy: number;
    };
}

interface SearchQuery {
    text: string;
    filters: SearchFilters;
    sort: SearchSort;
    embeddings: boolean;
    fuzzy: boolean;
    contextual: boolean;
}

interface SearchFilters {
    types: string[];
    collections: string[];
    creators: string[];
    tags: string[];
    dateRange: {
        start: string;
        end: string;
    };
    relevanceThreshold: number;
    sizeRange: {
        min: number;
        max: number;
    };
    languages: string[];
    sentiment: {
        min: number;
        max: number;
    };
    importance: {
        min: number;
        max: number;
    };
}

interface SearchSort {
    field: 'relevance' | 'date' | 'size' | 'popularity' | 'similarity';
    direction: 'asc' | 'desc';
}

interface SavedSearch {
    id: string;
    name: string;
    query: SearchQuery;
    resultCount: number;
    createdAt: string;
    lastUsed: string;
    isStarred: boolean;
}

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [searchTime, setSearchTime] = useState(0);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showSavedSearches, setShowSavedSearches] = useState(false);
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const [searchConfig, setSearchConfig] = useState<SearchQuery>({
        text: '',
        filters: {
            types: [],
            collections: [],
            creators: [],
            tags: [],
            dateRange: { start: '', end: '' },
            relevanceThreshold: 0.5,
            sizeRange: { min: 0, max: 1000 },
            languages: [],
            sentiment: { min: -1, max: 1 },
            importance: { min: 0, max: 1 }
        },
        sort: { field: 'relevance', direction: 'desc' },
        embeddings: true,
        fuzzy: false,
        contextual: true
    });

    // Mock search results - in real app would come from API
    const mockResults: SearchResult[] = [
        {
            id: '1',
            title: 'JWT Authentication Implementation Guide',
            content: 'Comprehensive guide for implementing JWT-based authentication with refresh tokens, secure session management, and best practices for token storage...',
            type: 'text',
            collection: 'Security Documentation',
            creator: 'Alice Johnson',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-16T14:22:00Z',
            tags: ['authentication', 'jwt', 'security', 'guide'],
            relevanceScore: 0.94,
            semanticSimilarity: 0.87,
            highlights: [
                'JWT-based <mark>authentication</mark> with refresh tokens',
                'secure session <mark>management</mark> and best practices',
                'token storage and <mark>security</mark> considerations'
            ],
            metadata: {
                size: '45.2 KB',
                language: 'en',
                sentiment: 0.2,
                importance: 0.9,
                accessCount: 127,
                lastAccessed: '2024-01-16T09:15:00Z'
            },
            embedding: {
                model: 'text-embedding-ada-002',
                vector: [0.234, 0.567, 0.891, 0.123],
                accuracy: 0.94
            }
        },
        {
            id: '2',
            title: 'React Component Architecture Best Practices',
            content: 'Modern React development patterns including hooks, context, state management, performance optimization, and scalable component design...',
            type: 'text',
            collection: 'Development Guides',
            creator: 'John Smith',
            createdAt: '2024-01-14T16:45:00Z',
            updatedAt: '2024-01-15T11:30:00Z',
            tags: ['react', 'components', 'architecture', 'frontend'],
            relevanceScore: 0.89,
            semanticSimilarity: 0.82,
            highlights: [
                'Modern <mark>React</mark> development patterns',
                '<mark>component</mark> design and architecture',
                'performance <mark>optimization</mark> strategies'
            ],
            metadata: {
                size: '67.8 KB',
                language: 'en',
                sentiment: 0.1,
                importance: 0.8,
                accessCount: 89,
                lastAccessed: '2024-01-15T08:20:00Z'
            },
            embedding: {
                model: 'text-embedding-ada-002',
                vector: [0.445, 0.223, 0.778, 0.556],
                accuracy: 0.91
            }
        },
        {
            id: '3',
            title: 'Database Schema Design Principles',
            content: 'Normalized database schema design for user management systems with proper indexing, relationship constraints, and performance considerations...',
            type: 'text',
            collection: 'Architecture Documents',
            creator: 'Sarah Wilson',
            createdAt: '2024-01-13T12:15:00Z',
            updatedAt: '2024-01-14T09:45:00Z',
            tags: ['database', 'schema', 'design', 'sql'],
            relevanceScore: 0.85,
            semanticSimilarity: 0.78,
            highlights: [
                '<mark>Database</mark> schema design principles',
                'proper indexing and <mark>relationship</mark> constraints',
                'performance <mark>optimization</mark> for queries'
            ],
            metadata: {
                size: '34.1 KB',
                language: 'en',
                sentiment: 0.0,
                importance: 0.85,
                accessCount: 156,
                lastAccessed: '2024-01-14T07:30:00Z'
            },
            embedding: {
                model: 'text-embedding-ada-002',
                vector: [0.123, 0.789, 0.456, 0.234],
                accuracy: 0.88
            }
        },
        {
            id: '4',
            title: 'API Rate Limiting Implementation',
            content: 'Sliding window rate limiting with Redis backend for high-traffic API endpoints, including monitoring and alerting strategies...',
            type: 'code',
            collection: 'Performance Optimization',
            creator: 'Mike Chen',
            createdAt: '2024-01-12T14:20:00Z',
            updatedAt: '2024-01-13T16:10:00Z',
            tags: ['api', 'rate-limiting', 'redis', 'performance'],
            relevanceScore: 0.82,
            semanticSimilarity: 0.75,
            highlights: [
                'Sliding window <mark>rate limiting</mark>',
                '<mark>Redis</mark> backend implementation',
                'monitoring and <mark>alerting</mark> strategies'
            ],
            metadata: {
                size: '23.7 KB',
                language: 'typescript',
                sentiment: 0.1,
                importance: 0.75,
                accessCount: 203,
                lastAccessed: '2024-01-13T14:45:00Z'
            },
            embedding: {
                model: 'text-embedding-ada-002',
                vector: [0.678, 0.345, 0.912, 0.567],
                accuracy: 0.92
            }
        }
    ];

    const savedSearches: SavedSearch[] = [
        {
            id: '1',
            name: 'Authentication Security',
            query: {
                text: 'authentication security jwt oauth',
                filters: {
                    types: ['text', 'code'],
                    collections: ['Security Documentation'],
                    creators: [],
                    tags: ['authentication', 'security'],
                    dateRange: { start: '', end: '' },
                    relevanceThreshold: 0.7,
                    sizeRange: { min: 0, max: 1000 },
                    languages: [],
                    sentiment: { min: -1, max: 1 },
                    importance: { min: 0.5, max: 1 }
                },
                sort: { field: 'relevance', direction: 'desc' },
                embeddings: true,
                fuzzy: false,
                contextual: true
            },
            resultCount: 23,
            createdAt: '2024-01-10T10:30:00Z',
            lastUsed: '2024-01-16T09:15:00Z',
            isStarred: true
        },
        {
            id: '2',
            name: 'React Development',
            query: {
                text: 'react components hooks state management',
                filters: {
                    types: ['text', 'code'],
                    collections: ['Development Guides'],
                    creators: [],
                    tags: ['react', 'frontend'],
                    dateRange: { start: '', end: '' },
                    relevanceThreshold: 0.6,
                    sizeRange: { min: 0, max: 1000 },
                    languages: [],
                    sentiment: { min: -1, max: 1 },
                    importance: { min: 0, max: 1 }
                },
                sort: { field: 'relevance', direction: 'desc' },
                embeddings: true,
                fuzzy: true,
                contextual: true
            },
            resultCount: 45,
            createdAt: '2024-01-08T16:45:00Z',
            lastUsed: '2024-01-15T11:30:00Z',
            isStarred: false
        }
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'text': return <FileText className="w-4 h-4 text-blue-600" />;
            case 'image': return <Image className="w-4 h-4 text-green-600" />;
            case 'video': return <Video className="w-4 h-4 text-red-600" />;
            case 'audio': return <Music className="w-4 h-4 text-purple-600" />;
            case 'code': return <Code className="w-4 h-4 text-orange-600" />;
            case 'link': return <Link className="w-4 h-4 text-indigo-600" />;
            case 'file': return <File className="w-4 h-4 text-gray-600" />;
            default: return <FileText className="w-4 h-4 text-gray-600" />;
        }
    };

    const getRelevanceColor = (score: number) => {
        if (score >= 0.9) return 'text-green-600 bg-green-100';
        if (score >= 0.7) return 'text-blue-600 bg-blue-100';
        if (score >= 0.5) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        const startTime = Date.now();

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            // Filter results based on query
            const filtered = mockResults.filter(result =>
                result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                result.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            setSearchResults(filtered);
            setTotalResults(filtered.length);
            setSearchTime(Date.now() - startTime);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAdvancedSearch = async () => {
        setIsSearching(true);
        const startTime = Date.now();

        try {
            // Simulate advanced search with filters
            await new Promise(resolve => setTimeout(resolve, 1200));

            let filtered = mockResults;

            // Apply filters
            if (searchConfig.filters.types.length > 0) {
                filtered = filtered.filter(result => searchConfig.filters.types.includes(result.type));
            }

            if (searchConfig.filters.relevanceThreshold > 0) {
                filtered = filtered.filter(result => result.relevanceScore >= searchConfig.filters.relevanceThreshold);
            }

            // Apply semantic search if enabled
            if (searchConfig.embeddings && searchQuery) {
                filtered = filtered.filter(result =>
                    result.semanticSimilarity >= 0.7 ||
                    result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    result.content.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            setSearchResults(filtered);
            setTotalResults(filtered.length);
            setSearchTime(Date.now() - startTime);
        } catch (error) {
            console.error('Advanced search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSavedSearchLoad = (savedSearch: SavedSearch) => {
        setSearchQuery(savedSearch.query.text);
        setSearchConfig(savedSearch.query);
        setShowSavedSearches(false);
        handleAdvancedSearch();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey) {
                handleAdvancedSearch();
            } else {
                handleSearch();
            }
        }
    };

    useEffect(() => {
        if (searchQuery.length > 2) {
            const debounceTimer = setTimeout(() => {
                handleSearch();
            }, 500);
            return () => clearTimeout(debounceTimer);
        }
    }, [searchQuery]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Advanced Search</h1>
                    <p className="text-gray-600 mt-1">
                        AI-powered semantic search with vector embeddings and advanced filtering
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowSavedSearches(!showSavedSearches)}
                        className={`flex items-center px-4 py-2 border rounded-lg ${showSavedSearches ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Bookmark className="w-4 h-4 mr-2" />
                        Saved Searches
                    </button>
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center px-4 py-2 border rounded-lg ${showAdvancedFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Sliders className="w-4 h-4 mr-2" />
                        Advanced Filters
                    </button>
                </div>
            </div>

            {/* Main Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search memories using natural language or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        className="flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSearching ? (
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Search className="w-5 h-5 mr-2" />
                        )}
                        Search
                    </button>
                    <button
                        onClick={handleAdvancedSearch}
                        disabled={isSearching}
                        className="flex items-center px-6 py-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                    >
                        <Brain className="w-5 h-5 mr-2" />
                        AI Search
                    </button>
                </div>

                {/* Search Options */}
                <div className="flex items-center space-x-6 text-sm">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={searchConfig.embeddings}
                            onChange={(e) => setSearchConfig(prev => ({ ...prev, embeddings: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Semantic search</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={searchConfig.fuzzy}
                            onChange={(e) => setSearchConfig(prev => ({ ...prev, fuzzy: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Fuzzy matching</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={searchConfig.contextual}
                            onChange={(e) => setSearchConfig(prev => ({ ...prev, contextual: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Contextual search</span>
                    </label>
                </div>
            </div>

            {/* Saved Searches Panel */}
            {showSavedSearches && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Saved Searches</h2>
                        <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                            <Plus className="w-4 h-4 mr-1" />
                            Save Current
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedSearches.map((savedSearch) => (
                            <div key={savedSearch.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleSavedSearchLoad(savedSearch)}>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-medium text-gray-900">{savedSearch.name}</h3>
                                    <div className="flex items-center space-x-1">
                                        {savedSearch.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{savedSearch.query.text}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{savedSearch.resultCount} results</span>
                                    <span>Last used {formatDate(savedSearch.lastUsed)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Advanced Search Filters</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Content Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Content Type</label>
                            <div className="space-y-2">
                                {['text', 'image', 'video', 'audio', 'code', 'file', 'link'].map(type => (
                                    <label key={type} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={searchConfig.filters.types.includes(type)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSearchConfig(prev => ({
                                                        ...prev,
                                                        filters: { ...prev.filters, types: [...prev.filters.types, type] }
                                                    }));
                                                } else {
                                                    setSearchConfig(prev => ({
                                                        ...prev,
                                                        filters: { ...prev.filters, types: prev.filters.types.filter(t => t !== type) }
                                                    }));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Relevance Threshold */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Relevance Threshold: {(searchConfig.filters.relevanceThreshold * 100).toFixed(0)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={searchConfig.filters.relevanceThreshold}
                                onChange={(e) => setSearchConfig(prev => ({
                                    ...prev,
                                    filters: { ...prev.filters, relevanceThreshold: parseFloat(e.target.value) }
                                }))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                            <div className="space-y-2">
                                <input
                                    type="date"
                                    value={searchConfig.filters.dateRange.start}
                                    onChange={(e) => setSearchConfig(prev => ({
                                        ...prev,
                                        filters: { ...prev.filters, dateRange: { ...prev.filters.dateRange, start: e.target.value } }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="Start date"
                                />
                                <input
                                    type="date"
                                    value={searchConfig.filters.dateRange.end}
                                    onChange={(e) => setSearchConfig(prev => ({
                                        ...prev,
                                        filters: { ...prev.filters, dateRange: { ...prev.filters.dateRange, end: e.target.value } }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="End date"
                                />
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Sort By</label>
                            <select
                                value={`${searchConfig.sort.field}-${searchConfig.sort.direction}`}
                                onChange={(e) => {
                                    const [field, direction] = e.target.value.split('-') as [typeof searchConfig.sort.field, typeof searchConfig.sort.direction];
                                    setSearchConfig(prev => ({
                                        ...prev,
                                        sort: { field, direction }
                                    }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="relevance-desc">Relevance (High to Low)</option>
                                <option value="relevance-asc">Relevance (Low to High)</option>
                                <option value="date-desc">Date (Newest First)</option>
                                <option value="date-asc">Date (Oldest First)</option>
                                <option value="size-desc">Size (Largest First)</option>
                                <option value="size-asc">Size (Smallest First)</option>
                                <option value="popularity-desc">Popularity (Most Popular)</option>
                                <option value="similarity-desc">Similarity (Most Similar)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
                        <button
                            onClick={() => setSearchConfig({
                                text: searchQuery,
                                filters: {
                                    types: [],
                                    collections: [],
                                    creators: [],
                                    tags: [],
                                    dateRange: { start: '', end: '' },
                                    relevanceThreshold: 0.5,
                                    sizeRange: { min: 0, max: 1000 },
                                    languages: [],
                                    sentiment: { min: -1, max: 1 },
                                    importance: { min: 0, max: 1 }
                                },
                                sort: { field: 'relevance', direction: 'desc' },
                                embeddings: true,
                                fuzzy: false,
                                contextual: true
                            })}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            Reset Filters
                        </button>
                        <button
                            onClick={handleAdvancedSearch}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Search Results */}
            {(searchResults.length > 0 || isSearching) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Results Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                {isSearching ? (
                                    <div className="flex items-center">
                                        <RefreshCw className="w-5 h-5 mr-2 animate-spin text-blue-600" />
                                        <span className="text-lg font-semibold text-gray-900">Searching...</span>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {totalResults.toLocaleString()} results for "{searchQuery}"
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Found in {searchTime}ms using AI-powered semantic search
                                        </p>
                                    </div>
                                )}
                            </div>

                            {!isSearching && (
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <Grid className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results List */}
                    {!isSearching && (
                        <div className="divide-y divide-gray-200">
                            {searchResults.map((result) => (
                                <div key={result.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            {getTypeIcon(result.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                                                    {result.title}
                                                </h3>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(result.relevanceScore)}`}>
                                                        {(result.relevanceScore * 100).toFixed(0)}% match
                                                    </span>
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div
                                                className="text-sm text-gray-600 mb-3 line-clamp-2"
                                                dangerouslySetInnerHTML={{ __html: result.highlights[0] || result.content.substring(0, 200) + '...' }}
                                            />

                                            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                                                <span className="flex items-center">
                                                    <Database className="w-3 h-3 mr-1" />
                                                    {result.collection}
                                                </span>
                                                <span className="flex items-center">
                                                    <User className="w-3 h-3 mr-1" />
                                                    {result.creator}
                                                </span>
                                                <span className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {formatDate(result.updatedAt)}
                                                </span>
                                                <span className="flex items-center">
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    {result.metadata.accessCount} views
                                                </span>
                                                <span>{result.metadata.size}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-wrap gap-2">
                                                    {result.tags.slice(0, 4).map((tag, index) => (
                                                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {result.tags.length > 4 && (
                                                        <span className="text-xs text-gray-500">+{result.tags.length - 4} more</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        View
                                                    </button>
                                                    <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded">
                                                        <Copy className="w-3 h-3 mr-1" />
                                                        Copy
                                                    </button>
                                                    <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded">
                                                        <Share2 className="w-3 h-3 mr-1" />
                                                        Share
                                                    </button>
                                                    <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded">
                                                        <Download className="w-3 h-3 mr-1" />
                                                        Export
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Loading State */}
                    {isSearching && (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Analyzing memories with AI...</p>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600 mb-6">
                        We couldn't find any memories matching "{searchQuery}". Try different keywords or adjust your filters.
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                            }}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Clear Search
                        </button>
                        <button
                            onClick={() => setShowAdvancedFilters(true)}
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Try Advanced Search
                        </button>
                    </div>
                </div>
            )}

            {/* Search Tips */}
            {!searchQuery && !isSearching && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Tips</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Brain className="w-4 h-4 mr-2 text-blue-600" />
                                AI-Powered Search
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Use natural language queries</li>
                                <li>• Search by concepts, not just keywords</li>
                                <li>• AI understands context and meaning</li>
                                <li>• Vector embeddings find related content</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Target className="w-4 h-4 mr-2 text-green-600" />
                                Advanced Features
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Use quotes for exact phrases</li>
                                <li>• Apply filters for precise results</li>
                                <li>• Save frequently used searches</li>
                                <li>• Export results for external use</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
