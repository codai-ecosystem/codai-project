'use client';

import React, { useState } from 'react';
import {
    Database,
    Search,
    Brain,
    Plus,
    Filter,
    Download,
    Upload,
    Eye,
    Edit3,
    Trash2,
    Copy,
    Share2,
    Tag,
    Calendar,
    User,
    Clock,
    FileText,
    Image,
    Video,
    Music,
    File,
    Link,
    Bookmark,
    Star,
    Heart,
    Flag,
    Archive,
    RefreshCw,
    Grid,
    List,
    MoreVertical,
    ChevronDown,
    ChevronRight,
    Layers,
    Target,
    Zap,
    Globe,
    Lock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Cpu,
    Network,
    TrendingUp,
    BarChart3,
    PieChart,
    Activity,
    Settings,
    ExternalLink,
    FolderOpen,
    Folder,
    ArrowUpDown,
    SortAsc,
    SortDesc
} from 'lucide-react';

interface Memory {
    id: string;
    title: string;
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'link' | 'code';
    size: string;
    createdAt: string;
    updatedAt: string;
    creator: string;
    tags: string[];
    collection: string;
    isPublic: boolean;
    embeddings: {
        vector: number[];
        model: string;
        accuracy: number;
    };
    metadata: {
        source?: string;
        language?: string;
        sentiment?: number;
        importance?: number;
        accessCount: number;
        lastAccessed: string;
    };
    relationships: {
        related: string[];
        duplicates: string[];
        references: string[];
    };
}

interface MemoryFilter {
    type: string[];
    collection: string[];
    creator: string[];
    tags: string[];
    dateRange: {
        start: string;
        end: string;
    };
    relevanceThreshold: number;
    isPublic?: boolean;
}

interface MemorySort {
    field: 'createdAt' | 'updatedAt' | 'title' | 'size' | 'relevance' | 'accessCount';
    direction: 'asc' | 'desc';
}

export default function MemoryBank() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortConfig, setSortConfig] = useState<MemorySort>({ field: 'updatedAt', direction: 'desc' });
    const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
    const [showMemoryDetails, setShowMemoryDetails] = useState(false);

    // Mock data - in real app would come from API
    const memories: Memory[] = [
        {
            id: '1',
            title: 'Authentication Implementation Guide',
            content: 'Comprehensive guide for implementing JWT-based authentication with refresh tokens and secure session management...',
            type: 'text',
            size: '45.2 KB',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-16T14:22:00Z',
            creator: 'Alice Johnson',
            tags: ['authentication', 'jwt', 'security', 'guide'],
            collection: 'Security Documentation',
            isPublic: true,
            embeddings: {
                vector: [0.234, 0.567, 0.891, 0.123],
                model: 'text-embedding-ada-002',
                accuracy: 0.94
            },
            metadata: {
                source: 'Internal Documentation',
                language: 'en',
                sentiment: 0.2,
                importance: 0.9,
                accessCount: 127,
                lastAccessed: '2024-01-16T09:15:00Z'
            },
            relationships: {
                related: ['2', '5', '8'],
                duplicates: [],
                references: ['security-policy-v2', 'oauth-implementation']
            }
        },
        {
            id: '2',
            title: 'React Component Architecture',
            content: 'Best practices for building scalable React applications with modern component patterns, hooks, and state management...',
            type: 'text',
            size: '67.8 KB',
            createdAt: '2024-01-14T16:45:00Z',
            updatedAt: '2024-01-15T11:30:00Z',
            creator: 'John Smith',
            tags: ['react', 'components', 'architecture', 'frontend'],
            collection: 'Development Guides',
            isPublic: false,
            embeddings: {
                vector: [0.445, 0.223, 0.778, 0.556],
                model: 'text-embedding-ada-002',
                accuracy: 0.91
            },
            metadata: {
                source: 'Code Review Session',
                language: 'en',
                sentiment: 0.1,
                importance: 0.8,
                accessCount: 89,
                lastAccessed: '2024-01-15T08:20:00Z'
            },
            relationships: {
                related: ['3', '6', '9'],
                duplicates: [],
                references: ['react-docs', 'component-library']
            }
        },
        {
            id: '3',
            title: 'Database Schema Design',
            content: 'Normalized database schema for user management system with proper indexing and relationship constraints...',
            type: 'text',
            size: '34.1 KB',
            createdAt: '2024-01-13T12:15:00Z',
            updatedAt: '2024-01-14T09:45:00Z',
            creator: 'Sarah Wilson',
            tags: ['database', 'schema', 'design', 'sql'],
            collection: 'Architecture Documents',
            isPublic: true,
            embeddings: {
                vector: [0.123, 0.789, 0.456, 0.234],
                model: 'text-embedding-ada-002',
                accuracy: 0.88
            },
            metadata: {
                source: 'Database Design Workshop',
                language: 'en',
                sentiment: 0.0,
                importance: 0.85,
                accessCount: 156,
                lastAccessed: '2024-01-14T07:30:00Z'
            },
            relationships: {
                related: ['1', '4', '7'],
                duplicates: [],
                references: ['user-requirements', 'data-model']
            }
        },
        {
            id: '4',
            title: 'API Rate Limiting Strategy',
            content: 'Implementation of sliding window rate limiting with Redis backend for high-traffic API endpoints...',
            type: 'code',
            size: '23.7 KB',
            createdAt: '2024-01-12T14:20:00Z',
            updatedAt: '2024-01-13T16:10:00Z',
            creator: 'Mike Chen',
            tags: ['api', 'rate-limiting', 'redis', 'performance'],
            collection: 'Performance Optimization',
            isPublic: false,
            embeddings: {
                vector: [0.678, 0.345, 0.912, 0.567],
                model: 'text-embedding-ada-002',
                accuracy: 0.92
            },
            metadata: {
                source: 'Performance Sprint',
                language: 'typescript',
                sentiment: 0.1,
                importance: 0.75,
                accessCount: 203,
                lastAccessed: '2024-01-13T14:45:00Z'
            },
            relationships: {
                related: ['5', '8', '10'],
                duplicates: [],
                references: ['redis-config', 'api-gateway']
            }
        },
        {
            id: '5',
            title: 'Security Audit Report 2024',
            content: 'Comprehensive security audit findings and recommendations for infrastructure hardening...',
            type: 'file',
            size: '2.1 MB',
            createdAt: '2024-01-11T09:30:00Z',
            updatedAt: '2024-01-12T11:15:00Z',
            creator: 'Security Team',
            tags: ['security', 'audit', 'report', 'compliance'],
            collection: 'Security Reports',
            isPublic: false,
            embeddings: {
                vector: [0.567, 0.891, 0.234, 0.789],
                model: 'text-embedding-ada-002',
                accuracy: 0.96
            },
            metadata: {
                source: 'External Audit',
                language: 'en',
                sentiment: -0.3,
                importance: 0.95,
                accessCount: 45,
                lastAccessed: '2024-01-12T10:20:00Z'
            },
            relationships: {
                related: ['1', '6'],
                duplicates: [],
                references: ['compliance-framework', 'security-policy']
            }
        },
        {
            id: '6',
            title: 'UI/UX Design System',
            content: 'Complete design system with components, color palettes, typography, and usage guidelines...',
            type: 'image',
            size: '156.4 KB',
            createdAt: '2024-01-10T15:45:00Z',
            updatedAt: '2024-01-11T13:20:00Z',
            creator: 'Design Team',
            tags: ['design', 'ui', 'ux', 'components', 'system'],
            collection: 'Design Resources',
            isPublic: true,
            embeddings: {
                vector: [0.789, 0.123, 0.567, 0.345],
                model: 'text-embedding-ada-002',
                accuracy: 0.87
            },
            metadata: {
                source: 'Design Workshop',
                language: 'visual',
                sentiment: 0.4,
                importance: 0.8,
                accessCount: 312,
                lastAccessed: '2024-01-11T12:10:00Z'
            },
            relationships: {
                related: ['2', '7'],
                duplicates: [],
                references: ['brand-guidelines', 'component-library']
            }
        }
    ];

    const collections = Array.from(new Set(memories.map(m => m.collection)));
    const creators = Array.from(new Set(memories.map(m => m.creator)));
    const allTags = Array.from(new Set(memories.flatMap(m => m.tags)));

    const [filters, setFilters] = useState<MemoryFilter>({
        type: [],
        collection: [],
        creator: [],
        tags: [],
        dateRange: { start: '', end: '' },
        relevanceThreshold: 0,
        isPublic: undefined
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'text': return <FileText className="w-5 h-5 text-blue-600" />;
            case 'image': return <Image className="w-5 h-5 text-green-600" />;
            case 'video': return <Video className="w-5 h-5 text-red-600" />;
            case 'audio': return <Music className="w-5 h-5 text-purple-600" />;
            case 'code': return <Cpu className="w-5 h-5 text-orange-600" />;
            case 'link': return <Link className="w-5 h-5 text-indigo-600" />;
            case 'file': return <File className="w-5 h-5 text-gray-600" />;
            default: return <FileText className="w-5 h-5 text-gray-600" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getImportanceColor = (importance: number) => {
        if (importance >= 0.9) return 'text-red-600 bg-red-100';
        if (importance >= 0.7) return 'text-orange-600 bg-orange-100';
        if (importance >= 0.5) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    const handleMemorySelect = (memoryId: string) => {
        setSelectedMemories(prev =>
            prev.includes(memoryId)
                ? prev.filter(id => id !== memoryId)
                : [...prev, memoryId]
        );
    };

    const handleBulkAction = (action: string) => {
        console.log(`Performing ${action} on memories:`, selectedMemories);
        // Implement bulk actions
        setSelectedMemories([]);
    };

    const filteredAndSortedMemories = memories
        .filter(memory => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matches = memory.title.toLowerCase().includes(query) ||
                    memory.content.toLowerCase().includes(query) ||
                    memory.tags.some(tag => tag.toLowerCase().includes(query));
                if (!matches) return false;
            }

            if (filters.type.length > 0 && !filters.type.includes(memory.type)) return false;
            if (filters.collection.length > 0 && !filters.collection.includes(memory.collection)) return false;
            if (filters.creator.length > 0 && !filters.creator.includes(memory.creator)) return false;
            if (filters.tags.length > 0 && !filters.tags.some(tag => memory.tags.includes(tag))) return false;
            if (filters.isPublic !== undefined && memory.isPublic !== filters.isPublic) return false;
            if (memory.embeddings.accuracy < filters.relevanceThreshold) return false;

            return true;
        })
        .sort((a, b) => {
            const { field, direction } = sortConfig;
            let aValue: any, bValue: any;

            switch (field) {
                case 'createdAt':
                case 'updatedAt':
                    aValue = new Date(a[field]).getTime();
                    bValue = new Date(b[field]).getTime();
                    break;
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'size':
                    aValue = parseFloat(a.size);
                    bValue = parseFloat(b.size);
                    break;
                case 'relevance':
                    aValue = a.embeddings.accuracy;
                    bValue = b.embeddings.accuracy;
                    break;
                case 'accessCount':
                    aValue = a.metadata.accessCount;
                    bValue = b.metadata.accessCount;
                    break;
                default:
                    return 0;
            }

            if (direction === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Memory Bank</h1>
                    <p className="text-gray-600 mt-1">
                        Store, search, and manage your AI-powered memories with vector embeddings
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center px-4 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Memory
                    </button>
                </div>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search memories by title, content, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <select
                        value={`${sortConfig.field}-${sortConfig.direction}`}
                        onChange={(e) => {
                            const [field, direction] = e.target.value.split('-') as [typeof sortConfig.field, typeof sortConfig.direction];
                            setSortConfig({ field, direction });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="updatedAt-desc">Recently Updated</option>
                        <option value="createdAt-desc">Recently Created</option>
                        <option value="title-asc">Title A-Z</option>
                        <option value="title-desc">Title Z-A</option>
                        <option value="size-desc">Largest First</option>
                        <option value="size-asc">Smallest First</option>
                        <option value="relevance-desc">Highest Relevance</option>
                        <option value="accessCount-desc">Most Accessed</option>
                    </select>

                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <div className="space-y-2">
                                {['text', 'image', 'video', 'audio', 'code', 'file', 'link'].map(type => (
                                    <label key={type} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.type.includes(type)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters(prev => ({ ...prev, type: [...prev.type, type] }));
                                                } else {
                                                    setFilters(prev => ({ ...prev, type: prev.type.filter(t => t !== type) }));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Collection Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Collection</label>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {collections.map(collection => (
                                    <label key={collection} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.collection.includes(collection)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters(prev => ({ ...prev, collection: [...prev.collection, collection] }));
                                                } else {
                                                    setFilters(prev => ({ ...prev, collection: prev.collection.filter(c => c !== collection) }));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{collection}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Creator Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Creator</label>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {creators.map(creator => (
                                    <label key={creator} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.creator.includes(creator)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters(prev => ({ ...prev, creator: [...prev.creator, creator] }));
                                                } else {
                                                    setFilters(prev => ({ ...prev, creator: prev.creator.filter(c => c !== creator) }));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{creator}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Other Filters */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Other Filters</label>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={filters.isPublic === true}
                                        onChange={(e) => setFilters(prev => ({ ...prev, isPublic: e.target.checked ? true : undefined }))}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Public only</span>
                                </label>

                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                        Min Relevance: {(filters.relevanceThreshold * 100).toFixed(0)}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={filters.relevanceThreshold}
                                        onChange={(e) => setFilters(prev => ({ ...prev, relevanceThreshold: parseFloat(e.target.value) }))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Showing {filteredAndSortedMemories.length} of {memories.length} memories
                        </div>
                        <button
                            onClick={() => setFilters({
                                type: [], collection: [], creator: [], tags: [],
                                dateRange: { start: '', end: '' }, relevanceThreshold: 0, isPublic: undefined
                            })}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            Clear all filters
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Actions */}
            {selectedMemories.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">
                            {selectedMemories.length} {selectedMemories.length === 1 ? 'memory' : 'memories'} selected
                        </span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleBulkAction('export')}
                                className="flex items-center px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50"
                            >
                                <Download className="w-3 h-3 mr-1" />
                                Export
                            </button>
                            <button
                                onClick={() => handleBulkAction('archive')}
                                className="flex items-center px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50"
                            >
                                <Archive className="w-3 h-3 mr-1" />
                                Archive
                            </button>
                            <button
                                onClick={() => handleBulkAction('delete')}
                                className="flex items-center px-3 py-1 text-sm text-red-700 bg-white border border-red-300 rounded hover:bg-red-50"
                            >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Memory Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {filteredAndSortedMemories.map((memory) => (
                    <div
                        key={memory.id}
                        className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow ${viewMode === 'list' ? 'p-4' : 'p-6'
                            }`}
                    >
                        {viewMode === 'grid' ? (
                            /* Grid View */
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        {getTypeIcon(memory.type)}
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${memory.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {memory.isPublic ? 'Public' : 'Private'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedMemories.includes(memory.id)}
                                            onChange={() => handleMemorySelect(memory.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{memory.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{memory.content}</p>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{memory.size}</span>
                                        <span className={`px-2 py-1 rounded ${getImportanceColor(memory.metadata.importance || 0)}`}>
                                            {((memory.metadata.importance || 0) * 100).toFixed(0)}% important
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {memory.tags.slice(0, 3).map((tag, index) => (
                                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {tag}
                                            </span>
                                        ))}
                                        {memory.tags.length > 3 && (
                                            <span className="text-xs text-gray-500">+{memory.tags.length - 3}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{memory.creator}</span>
                                        <span>{formatDate(memory.updatedAt)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                            <Eye className="w-3 h-3" />
                                            <span>{memory.metadata.accessCount}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {(memory.embeddings.accuracy * 100).toFixed(1)}% relevance
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => {
                                                setSelectedMemory(memory);
                                                setShowMemoryDetails(true);
                                            }}
                                            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View
                                        </button>
                                        <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded">
                                            <Edit3 className="w-3 h-3 mr-1" />
                                            Edit
                                        </button>
                                        <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded">
                                            <Share2 className="w-3 h-3 mr-1" />
                                            Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* List View */
                            <div className="flex items-center space-x-4">
                                <input
                                    type="checkbox"
                                    checked={selectedMemories.includes(memory.id)}
                                    onChange={() => handleMemorySelect(memory.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />

                                <div className="flex items-center space-x-2">
                                    {getTypeIcon(memory.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="font-medium text-gray-900 truncate">{memory.title}</h3>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${memory.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {memory.isPublic ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate mt-1">{memory.content}</p>
                                </div>

                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <span>{memory.size}</span>
                                    <span>{memory.creator}</span>
                                    <span>{formatDate(memory.updatedAt)}</span>
                                    <span>{memory.metadata.accessCount} views</span>
                                    <span>{(memory.embeddings.accuracy * 100).toFixed(1)}%</span>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => {
                                            setSelectedMemory(memory);
                                            setShowMemoryDetails(true);
                                        }}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedMemories.length === 0 && (
                <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No memories found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchQuery || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f)
                            ? 'Try adjusting your search or filters'
                            : 'Start by adding your first memory to the bank'
                        }
                    </p>
                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 mx-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Memory
                    </button>
                </div>
            )}

            {/* Memory Details Modal */}
            {showMemoryDetails && selectedMemory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">{selectedMemory.title}</h2>
                                <button
                                    onClick={() => setShowMemoryDetails(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Content</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-gray-700">{selectedMemory.content}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMemory.tags.map((tag, index) => (
                                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedMemory.relationships.related.length > 0 && (
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-2">Related Memories</h3>
                                            <div className="space-y-2">
                                                {selectedMemory.relationships.related.map((relatedId) => (
                                                    <div key={relatedId} className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                                                        <Link className="w-3 h-3" />
                                                        <span>Memory {relatedId}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Type:</span>
                                                <span className="text-gray-900 capitalize">{selectedMemory.type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Size:</span>
                                                <span className="text-gray-900">{selectedMemory.size}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Creator:</span>
                                                <span className="text-gray-900">{selectedMemory.creator}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Collection:</span>
                                                <span className="text-gray-900">{selectedMemory.collection}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Visibility:</span>
                                                <span className={`${selectedMemory.isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                                                    {selectedMemory.isPublic ? 'Public' : 'Private'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">AI Embeddings</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Model:</span>
                                                <span className="text-gray-900">{selectedMemory.embeddings.model}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Accuracy:</span>
                                                <span className="text-gray-900">{(selectedMemory.embeddings.accuracy * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Importance:</span>
                                                <span className="text-gray-900">{((selectedMemory.metadata.importance || 0) * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Activity</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Access Count:</span>
                                                <span className="text-gray-900">{selectedMemory.metadata.accessCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Last Accessed:</span>
                                                <span className="text-gray-900">{formatDate(selectedMemory.metadata.lastAccessed)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Created:</span>
                                                <span className="text-gray-900">{formatDate(selectedMemory.createdAt)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Updated:</span>
                                                <span className="text-gray-900">{formatDate(selectedMemory.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit Memory
                                    </button>
                                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Copy className="w-4 h-4 mr-2" />
                                        Duplicate
                                    </button>
                                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </button>
                                </div>
                                <button className="flex items-center px-4 py-2 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
