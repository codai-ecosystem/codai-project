'use client';

import React, { useState } from 'react';
import {
    FolderOpen,
    Plus,
    Search,
    Filter,
    Grid,
    List,
    MoreVertical,
    Edit3,
    Trash2,
    Share2,
    Copy,
    Download,
    Upload,
    Eye,
    Lock,
    Globe,
    Users,
    Calendar,
    Clock,
    Database,
    Tag,
    Star,
    Bookmark,
    Archive,
    RefreshCw,
    Settings,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    PieChart,
    Target,
    Zap,
    Brain,
    FileText,
    Image,
    Video,
    Music,
    File,
    Link,
    User,
    ChevronDown,
    ChevronRight,
    ArrowUpDown,
    ExternalLink,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Layers
} from 'lucide-react';

interface Collection {
    id: string;
    name: string;
    description: string;
    type: 'personal' | 'team' | 'public' | 'archive';
    memoryCount: number;
    totalSize: string;
    createdAt: string;
    updatedAt: string;
    creator: string;
    collaborators: string[];
    tags: string[];
    isPublic: boolean;
    accessLevel: 'read' | 'write' | 'admin';
    statistics: {
        viewCount: number;
        searchCount: number;
        lastAccessed: string;
        averageRelevance: number;
        memoryTypes: Record<string, number>;
    };
    permissions: {
        canView: string[];
        canEdit: string[];
        canShare: string[];
        canDelete: string[];
    };
    metadata: {
        thumbnail?: string;
        color?: string;
        category?: string;
        language?: string;
        status: 'active' | 'archived' | 'draft';
    };
}

interface CollectionFilter {
    type: string[];
    creator: string[];
    accessLevel: string[];
    status: string[];
    tags: string[];
    isPublic?: boolean;
    hasCollaborators?: boolean;
}

interface CollectionSort {
    field: 'name' | 'createdAt' | 'updatedAt' | 'memoryCount' | 'totalSize' | 'viewCount';
    direction: 'asc' | 'desc';
}

export default function Collections() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortConfig, setSortConfig] = useState<CollectionSort>({ field: 'updatedAt', direction: 'desc' });
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [showCollectionDetails, setShowCollectionDetails] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Mock data - in real app would come from API
    const collections: Collection[] = [
        {
            id: '1',
            name: 'Product Knowledge Base',
            description: 'Comprehensive documentation for all product features, APIs, and user guides',
            type: 'team',
            memoryCount: 12450,
            totalSize: '890 MB',
            createdAt: '2024-01-10T10:30:00Z',
            updatedAt: '2024-01-16T14:22:00Z',
            creator: 'Alice Johnson',
            collaborators: ['John Smith', 'Sarah Wilson', 'Mike Chen'],
            tags: ['product', 'documentation', 'api', 'guides'],
            isPublic: true,
            accessLevel: 'admin',
            statistics: {
                viewCount: 2847,
                searchCount: 15623,
                lastAccessed: '2024-01-16T09:15:00Z',
                averageRelevance: 0.92,
                memoryTypes: {
                    text: 8934,
                    image: 2345,
                    code: 1023,
                    file: 148
                }
            },
            permissions: {
                canView: ['all'],
                canEdit: ['product-team', 'documentation-team'],
                canShare: ['product-team'],
                canDelete: ['alice.johnson']
            },
            metadata: {
                color: '#3B82F6',
                category: 'Documentation',
                language: 'en',
                status: 'active',
                thumbnail: '/collections/product-kb.jpg'
            }
        },
        {
            id: '2',
            name: 'Customer Support Archive',
            description: 'Historical customer support conversations, tickets, and resolution strategies',
            type: 'team',
            memoryCount: 8932,
            totalSize: '567 MB',
            createdAt: '2024-01-08T16:45:00Z',
            updatedAt: '2024-01-15T11:30:00Z',
            creator: 'Support Team',
            collaborators: ['Emily Davis', 'Mark Johnson', 'Lisa Park'],
            tags: ['support', 'customer', 'tickets', 'solutions'],
            isPublic: false,
            accessLevel: 'write',
            statistics: {
                viewCount: 1923,
                searchCount: 8945,
                lastAccessed: '2024-01-15T08:20:00Z',
                averageRelevance: 0.88,
                memoryTypes: {
                    text: 7234,
                    image: 1456,
                    file: 242
                }
            },
            permissions: {
                canView: ['support-team', 'management'],
                canEdit: ['support-team'],
                canShare: ['support-leads'],
                canDelete: ['support-manager']
            },
            metadata: {
                color: '#10B981',
                category: 'Support',
                language: 'en',
                status: 'active'
            }
        },
        {
            id: '3',
            name: 'Research Papers Collection',
            description: 'Academic research papers, technical publications, and industry whitepapers',
            type: 'public',
            memoryCount: 5678,
            totalSize: '1.2 GB',
            createdAt: '2024-01-05T12:15:00Z',
            updatedAt: '2024-01-14T09:45:00Z',
            creator: 'Research Team',
            collaborators: ['Dr. Smith', 'Prof. Wilson', 'Research Intern'],
            tags: ['research', 'academic', 'papers', 'science'],
            isPublic: true,
            accessLevel: 'read',
            statistics: {
                viewCount: 1456,
                searchCount: 5623,
                lastAccessed: '2024-01-14T07:30:00Z',
                averageRelevance: 0.95,
                memoryTypes: {
                    file: 3456,
                    text: 1890,
                    image: 332
                }
            },
            permissions: {
                canView: ['all'],
                canEdit: ['research-team'],
                canShare: ['research-team', 'academic-partners'],
                canDelete: ['research-lead']
            },
            metadata: {
                color: '#8B5CF6',
                category: 'Research',
                language: 'en',
                status: 'active'
            }
        },
        {
            id: '4',
            name: 'Code Repository Insights',
            description: 'Code documentation, development best practices, and architecture decisions',
            type: 'team',
            memoryCount: 7234,
            totalSize: '423 MB',
            createdAt: '2024-01-03T14:20:00Z',
            updatedAt: '2024-01-13T16:10:00Z',
            creator: 'Engineering Team',
            collaborators: ['Dev Lead', 'Senior Engineer', 'Architect'],
            tags: ['code', 'development', 'architecture', 'best-practices'],
            isPublic: false,
            accessLevel: 'write',
            statistics: {
                viewCount: 1789,
                searchCount: 9234,
                lastAccessed: '2024-01-13T14:45:00Z',
                averageRelevance: 0.87,
                memoryTypes: {
                    code: 4567,
                    text: 2345,
                    image: 322
                }
            },
            permissions: {
                canView: ['engineering-team'],
                canEdit: ['senior-engineers'],
                canShare: ['team-leads'],
                canDelete: ['engineering-manager']
            },
            metadata: {
                color: '#F59E0B',
                category: 'Engineering',
                language: 'multiple',
                status: 'active'
            }
        },
        {
            id: '5',
            name: 'Marketing Campaign Assets',
            description: 'Marketing materials, campaign data, creative assets, and performance metrics',
            type: 'team',
            memoryCount: 3456,
            totalSize: '2.3 GB',
            createdAt: '2024-01-01T09:30:00Z',
            updatedAt: '2024-01-12T11:15:00Z',
            creator: 'Marketing Team',
            collaborators: ['Creative Director', 'Copywriter', 'Analyst'],
            tags: ['marketing', 'campaigns', 'creative', 'analytics'],
            isPublic: false,
            accessLevel: 'admin',
            statistics: {
                viewCount: 892,
                searchCount: 3445,
                lastAccessed: '2024-01-12T10:20:00Z',
                averageRelevance: 0.83,
                memoryTypes: {
                    image: 2134,
                    video: 789,
                    text: 445,
                    file: 88
                }
            },
            permissions: {
                canView: ['marketing-team', 'management'],
                canEdit: ['marketing-team'],
                canShare: ['marketing-leads'],
                canDelete: ['marketing-director']
            },
            metadata: {
                color: '#EF4444',
                category: 'Marketing',
                language: 'en',
                status: 'active'
            }
        },
        {
            id: '6',
            name: 'Personal Learning Notes',
            description: 'Personal collection of learning materials, tutorials, and reference documents',
            type: 'personal',
            memoryCount: 1234,
            totalSize: '156 MB',
            createdAt: '2023-12-15T15:45:00Z',
            updatedAt: '2024-01-11T13:20:00Z',
            creator: 'John Doe',
            collaborators: [],
            tags: ['personal', 'learning', 'tutorials', 'reference'],
            isPublic: false,
            accessLevel: 'admin',
            statistics: {
                viewCount: 567,
                searchCount: 1234,
                lastAccessed: '2024-01-11T12:10:00Z',
                averageRelevance: 0.79,
                memoryTypes: {
                    text: 890,
                    image: 234,
                    file: 110
                }
            },
            permissions: {
                canView: ['john.doe'],
                canEdit: ['john.doe'],
                canShare: ['john.doe'],
                canDelete: ['john.doe']
            },
            metadata: {
                color: '#6B7280',
                category: 'Personal',
                language: 'en',
                status: 'active'
            }
        }
    ];

    const [filters, setFilters] = useState<CollectionFilter>({
        type: [],
        creator: [],
        accessLevel: [],
        status: [],
        tags: [],
        isPublic: undefined,
        hasCollaborators: undefined
    });

    const collectionTypes = Array.from(new Set(collections.map(c => c.type)));
    const creators = Array.from(new Set(collections.map(c => c.creator)));
    const accessLevels = Array.from(new Set(collections.map(c => c.accessLevel)));
    const statuses = Array.from(new Set(collections.map(c => c.metadata.status)));
    const allTags = Array.from(new Set(collections.flatMap(c => c.tags)));

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'personal': return <User className="w-5 h-5 text-blue-600" />;
            case 'team': return <Users className="w-5 h-5 text-green-600" />;
            case 'public': return <Globe className="w-5 h-5 text-purple-600" />;
            case 'archive': return <Archive className="w-5 h-5 text-gray-600" />;
            default: return <FolderOpen className="w-5 h-5 text-gray-600" />;
        }
    };

    const getAccessLevelColor = (level: string) => {
        switch (level) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'write': return 'bg-yellow-100 text-yellow-800';
            case 'read': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatFileSize = (sizeString: string) => {
        return sizeString;
    };

    const handleCollectionSelect = (collectionId: string) => {
        setSelectedCollections(prev =>
            prev.includes(collectionId)
                ? prev.filter(id => id !== collectionId)
                : [...prev, collectionId]
        );
    };

    const handleBulkAction = (action: string) => {
        console.log(`Performing ${action} on collections:`, selectedCollections);
        setSelectedCollections([]);
    };

    const filteredAndSortedCollections = collections
        .filter(collection => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matches = collection.name.toLowerCase().includes(query) ||
                    collection.description.toLowerCase().includes(query) ||
                    collection.tags.some(tag => tag.toLowerCase().includes(query)) ||
                    collection.creator.toLowerCase().includes(query);
                if (!matches) return false;
            }

            if (filters.type.length > 0 && !filters.type.includes(collection.type)) return false;
            if (filters.creator.length > 0 && !filters.creator.includes(collection.creator)) return false;
            if (filters.accessLevel.length > 0 && !filters.accessLevel.includes(collection.accessLevel)) return false;
            if (filters.status.length > 0 && !filters.status.includes(collection.metadata.status)) return false;
            if (filters.tags.length > 0 && !filters.tags.some(tag => collection.tags.includes(tag))) return false;
            if (filters.isPublic !== undefined && collection.isPublic !== filters.isPublic) return false;
            if (filters.hasCollaborators !== undefined) {
                const hasCollaborators = collection.collaborators.length > 0;
                if (hasCollaborators !== filters.hasCollaborators) return false;
            }

            return true;
        })
        .sort((a, b) => {
            const { field, direction } = sortConfig;
            let aValue: any, bValue: any;

            switch (field) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'createdAt':
                case 'updatedAt':
                    aValue = new Date(a[field]).getTime();
                    bValue = new Date(b[field]).getTime();
                    break;
                case 'memoryCount':
                    aValue = a.memoryCount;
                    bValue = b.memoryCount;
                    break;
                case 'totalSize':
                    aValue = parseFloat(a.totalSize);
                    bValue = parseFloat(b.totalSize);
                    break;
                case 'viewCount':
                    aValue = a.statistics.viewCount;
                    bValue = b.statistics.viewCount;
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
                    <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
                    <p className="text-gray-600 mt-1">
                        Organize and manage your memory collections with collaborative features
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
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Collection
                    </button>
                </div>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search collections by name, description, creator, or tags..."
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
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="memoryCount-desc">Most Memories</option>
                        <option value="totalSize-desc">Largest Size</option>
                        <option value="viewCount-desc">Most Viewed</option>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <div className="space-y-2">
                                {collectionTypes.map(type => (
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

                        {/* Access Level Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                            <div className="space-y-2">
                                {accessLevels.map(level => (
                                    <label key={level} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.accessLevel.includes(level)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters(prev => ({ ...prev, accessLevel: [...prev.accessLevel, level] }));
                                                } else {
                                                    setFilters(prev => ({ ...prev, accessLevel: prev.accessLevel.filter(l => l !== level) }));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 capitalize">{level}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <div className="space-y-2">
                                {statuses.map(status => (
                                    <label key={status} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.status.includes(status)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters(prev => ({ ...prev, status: [...prev.status, status] }));
                                                } else {
                                                    setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Other Filters */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Other</label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={filters.isPublic === true}
                                        onChange={(e) => setFilters(prev => ({ ...prev, isPublic: e.target.checked ? true : undefined }))}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Public only</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={filters.hasCollaborators === true}
                                        onChange={(e) => setFilters(prev => ({ ...prev, hasCollaborators: e.target.checked ? true : undefined }))}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Has collaborators</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Showing {filteredAndSortedCollections.length} of {collections.length} collections
                        </div>
                        <button
                            onClick={() => setFilters({
                                type: [], creator: [], accessLevel: [], status: [], tags: [],
                                isPublic: undefined, hasCollaborators: undefined
                            })}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            Clear all filters
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Actions */}
            {selectedCollections.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">
                            {selectedCollections.length} {selectedCollections.length === 1 ? 'collection' : 'collections'} selected
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
                                onClick={() => handleBulkAction('share')}
                                className="flex items-center px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50"
                            >
                                <Share2 className="w-3 h-3 mr-1" />
                                Share
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

            {/* Collections Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {filteredAndSortedCollections.map((collection) => (
                    <div
                        key={collection.id}
                        className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow ${viewMode === 'list' ? 'p-4' : 'p-6'
                            }`}
                    >
                        {viewMode === 'grid' ? (
                            /* Grid View */
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        {getTypeIcon(collection.type)}
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: collection.metadata.color || '#6B7280' }}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedCollections.includes(collection.id)}
                                            onChange={() => handleCollectionSelect(collection.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{collection.name}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{collection.description}</p>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{collection.memoryCount.toLocaleString()} memories</span>
                                        <span className="text-gray-600">{formatFileSize(collection.totalSize)}</span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(collection.accessLevel)}`}>
                                            {collection.accessLevel}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collection.metadata.status)}`}>
                                            {collection.metadata.status}
                                        </span>
                                        {collection.isPublic && (
                                            <Globe className="w-3 h-3 text-green-600" title="Public" />
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {collection.tags.slice(0, 3).map((tag, index) => (
                                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {tag}
                                            </span>
                                        ))}
                                        {collection.tags.length > 3 && (
                                            <span className="text-xs text-gray-500">+{collection.tags.length - 3}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{collection.creator}</span>
                                        <span>{formatDate(collection.updatedAt)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                            <Eye className="w-3 h-3" />
                                            <span>{collection.statistics.viewCount}</span>
                                        </div>
                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                            <Users className="w-3 h-3" />
                                            <span>{collection.collaborators.length}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => {
                                                setSelectedCollection(collection);
                                                setShowCollectionDetails(true);
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
                                    checked={selectedCollections.includes(collection.id)}
                                    onChange={() => handleCollectionSelect(collection.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />

                                <div className="flex items-center space-x-2">
                                    {getTypeIcon(collection.type)}
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: collection.metadata.color || '#6B7280' }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="font-medium text-gray-900 truncate">{collection.name}</h3>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(collection.accessLevel)}`}>
                                            {collection.accessLevel}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collection.metadata.status)}`}>
                                            {collection.metadata.status}
                                        </span>
                                        {collection.isPublic && (
                                            <Globe className="w-3 h-3 text-green-600" title="Public" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 truncate mt-1">{collection.description}</p>
                                </div>

                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <span>{collection.memoryCount.toLocaleString()} memories</span>
                                    <span>{formatFileSize(collection.totalSize)}</span>
                                    <span>{collection.creator}</span>
                                    <span>{formatDate(collection.updatedAt)}</span>
                                    <span>{collection.statistics.viewCount} views</span>
                                    <span>{collection.collaborators.length} collaborators</span>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => {
                                            setSelectedCollection(collection);
                                            setShowCollectionDetails(true);
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
            {filteredAndSortedCollections.length === 0 && (
                <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchQuery || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f)
                            ? 'Try adjusting your search or filters'
                            : 'Start by creating your first collection to organize your memories'
                        }
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 mx-auto"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Collection
                    </button>
                </div>
            )}

            {/* Collection Details Modal */}
            {showCollectionDetails && selectedCollection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: selectedCollection.metadata.color || '#6B7280' }}
                                    >
                                        {getTypeIcon(selectedCollection.type)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{selectedCollection.name}</h2>
                                        <p className="text-gray-600">{selectedCollection.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCollectionDetails(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Collection details content would go here */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <h3 className="font-medium text-gray-900 mb-4">Collection Overview</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p>Detailed collection content, memory list, analytics, etc.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Statistics</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Memories:</span>
                                                <span className="text-gray-900">{selectedCollection.memoryCount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Size:</span>
                                                <span className="text-gray-900">{selectedCollection.totalSize}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">View Count:</span>
                                                <span className="text-gray-900">{selectedCollection.statistics.viewCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Search Count:</span>
                                                <span className="text-gray-900">{selectedCollection.statistics.searchCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Avg. Relevance:</span>
                                                <span className="text-gray-900">{(selectedCollection.statistics.averageRelevance * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Memory Types</h3>
                                        <div className="space-y-2 text-sm">
                                            {Object.entries(selectedCollection.statistics.memoryTypes).map(([type, count]) => (
                                                <div key={type} className="flex justify-between">
                                                    <span className="text-gray-600 capitalize">{type}:</span>
                                                    <span className="text-gray-900">{count.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Collaborators</h3>
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600">Creator: {selectedCollection.creator}</div>
                                            {selectedCollection.collaborators.map((collaborator, index) => (
                                                <div key={index} className="flex items-center space-x-2 text-sm">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                    <span className="text-gray-900">{collaborator}</span>
                                                </div>
                                            ))}
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
                                        Edit Collection
                                    </button>
                                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Copy className="w-4 h-4 mr-2" />
                                        Duplicate
                                    </button>
                                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </button>
                                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
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

            {/* Create Collection Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Create New Collection</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Collection Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter collection name..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        placeholder="Describe your collection..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option value="personal">Personal</option>
                                            <option value="team">Team</option>
                                            <option value="public">Public</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Documentation, Research..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                    <input
                                        type="text"
                                        placeholder="Enter tags separated by commas..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Make this collection public</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Allow collaboration</span>
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                    Create Collection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
