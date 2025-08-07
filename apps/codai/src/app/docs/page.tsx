'use client';

import React, { useState } from 'react';
import {
    FileText,
    Plus,
    Search,
    Filter,
    Settings,
    Edit,
    Trash2,
    Share,
    Eye,
    BookOpen,
    Folder,
    Star,
    Clock,
    Users,
    Tag,
    Download,
    Upload,
    Copy,
    ExternalLink,
    ChevronRight,
    ChevronDown,
    MoreVertical,
    RefreshCw,
    Grid,
    List,
    SortAsc,
    SortDesc,
    Calendar,
    User,
    MessageSquare,
    Heart,
    ThumbsUp,
    History,
    GitBranch,
    Code,
    Image,
    Video,
    File,
    Archive,
    Lock,
    Globe,
    Shield,
    Bell,
    Bookmark
} from 'lucide-react';

export default function DocumentationPage() {
    const [selectedView, setSelectedView] = useState('browse');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('recent');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const documentCategories = [
        {
            id: 1,
            name: 'API Documentation',
            description: 'REST API endpoints, GraphQL schemas, and integration guides',
            count: 45,
            icon: Code,
            color: 'bg-blue-100 text-blue-600',
            lastUpdated: '2 hours ago'
        },
        {
            id: 2,
            name: 'User Guides',
            description: 'Step-by-step tutorials and user manuals',
            count: 32,
            icon: BookOpen,
            color: 'bg-green-100 text-green-600',
            lastUpdated: '1 day ago'
        },
        {
            id: 3,
            name: 'Architecture',
            description: 'System design, diagrams, and technical specifications',
            count: 18,
            icon: GitBranch,
            color: 'bg-purple-100 text-purple-600',
            lastUpdated: '3 hours ago'
        },
        {
            id: 4,
            name: 'Development',
            description: 'Coding standards, best practices, and development workflows',
            count: 28,
            icon: Code,
            color: 'bg-orange-100 text-orange-600',
            lastUpdated: '5 hours ago'
        },
        {
            id: 5,
            name: 'Deployment',
            description: 'Deployment guides, CI/CD processes, and infrastructure docs',
            count: 15,
            icon: Upload,
            color: 'bg-red-100 text-red-600',
            lastUpdated: '1 hour ago'
        },
        {
            id: 6,
            name: 'Security',
            description: 'Security policies, compliance guides, and best practices',
            count: 12,
            icon: Shield,
            color: 'bg-yellow-100 text-yellow-600',
            lastUpdated: '6 hours ago'
        }
    ];

    const documents = [
        {
            id: 1,
            title: 'CODAI Platform API Reference',
            description: 'Complete API documentation with examples and authentication',
            category: 'API Documentation',
            author: 'Alice Smith',
            lastModified: '2 hours ago',
            views: 1247,
            likes: 89,
            comments: 12,
            status: 'published',
            visibility: 'public',
            tags: ['API', 'Reference', 'Authentication'],
            size: '2.4 MB',
            type: 'markdown',
            version: '3.2.1',
            isStarred: true,
            collaborators: 8
        },
        {
            id: 2,
            title: 'Getting Started with CODAI',
            description: 'New user onboarding guide and quick start tutorial',
            category: 'User Guides',
            author: 'Bob Johnson',
            lastModified: '1 day ago',
            views: 892,
            likes: 67,
            comments: 8,
            status: 'published',
            visibility: 'public',
            tags: ['Tutorial', 'Onboarding', 'Beginner'],
            size: '1.8 MB',
            type: 'markdown',
            version: '2.1.0',
            isStarred: false,
            collaborators: 5
        },
        {
            id: 3,
            title: 'System Architecture Overview',
            description: 'High-level system design and component relationships',
            category: 'Architecture',
            author: 'Carol Wilson',
            lastModified: '3 hours ago',
            views: 534,
            likes: 45,
            comments: 15,
            status: 'published',
            visibility: 'internal',
            tags: ['Architecture', 'Design', 'Systems'],
            size: '5.2 MB',
            type: 'pdf',
            version: '1.5.2',
            isStarred: true,
            collaborators: 12
        },
        {
            id: 4,
            title: 'React Development Guidelines',
            description: 'Coding standards and best practices for React development',
            category: 'Development',
            author: 'David Brown',
            lastModified: '5 hours ago',
            views: 723,
            likes: 78,
            comments: 22,
            status: 'published',
            visibility: 'public',
            tags: ['React', 'Standards', 'Best Practices'],
            size: '3.1 MB',
            type: 'markdown',
            version: '4.0.0',
            isStarred: false,
            collaborators: 6
        },
        {
            id: 5,
            title: 'Docker Deployment Guide',
            description: 'Step-by-step guide for containerizing and deploying applications',
            category: 'Deployment',
            author: 'Emma Davis',
            lastModified: '1 hour ago',
            views: 456,
            likes: 34,
            comments: 6,
            status: 'draft',
            visibility: 'internal',
            tags: ['Docker', 'Deployment', 'Containers'],
            size: '2.7 MB',
            type: 'markdown',
            version: '1.0.0',
            isStarred: true,
            collaborators: 4
        },
        {
            id: 6,
            title: 'Security Best Practices',
            description: 'Comprehensive security guidelines and compliance requirements',
            category: 'Security',
            author: 'Frank Miller',
            lastModified: '6 hours ago',
            views: 612,
            likes: 56,
            comments: 9,
            status: 'published',
            visibility: 'internal',
            tags: ['Security', 'Compliance', 'Guidelines'],
            size: '4.3 MB',
            type: 'pdf',
            version: '2.3.1',
            isStarred: false,
            collaborators: 7
        }
    ];

    const recentActivity = [
        {
            id: 1,
            type: 'created',
            user: 'Alice Smith',
            document: 'API Authentication Methods',
            timestamp: '15 minutes ago',
            action: 'created new document'
        },
        {
            id: 2,
            type: 'updated',
            user: 'Bob Johnson',
            document: 'Getting Started Guide',
            timestamp: '1 hour ago',
            action: 'updated section 3.2'
        },
        {
            id: 3,
            type: 'commented',
            user: 'Carol Wilson',
            document: 'System Architecture',
            timestamp: '2 hours ago',
            action: 'added comment on diagram clarity'
        },
        {
            id: 4,
            type: 'published',
            user: 'David Brown',
            document: 'React Guidelines v4.0',
            timestamp: '3 hours ago',
            action: 'published new version'
        },
        {
            id: 5,
            type: 'shared',
            user: 'Emma Davis',
            document: 'Docker Deployment',
            timestamp: '4 hours ago',
            action: 'shared with DevOps team'
        }
    ];

    const popularDocuments = [
        { id: 1, title: 'CODAI Platform API Reference', views: 1247, trend: 'up' },
        { id: 2, title: 'Getting Started with CODAI', views: 892, trend: 'up' },
        { id: 3, title: 'React Development Guidelines', views: 723, trend: 'down' },
        { id: 4, title: 'Security Best Practices', views: 612, trend: 'up' },
        { id: 5, title: 'System Architecture Overview', views: 534, trend: 'stable' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-600';
            case 'draft': return 'bg-yellow-100 text-yellow-600';
            case 'archived': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility) {
            case 'public': return <Globe className="w-4 h-4 text-green-600" />;
            case 'internal': return <Users className="w-4 h-4 text-blue-600" />;
            case 'private': return <Lock className="w-4 h-4 text-red-600" />;
            default: return <Shield className="w-4 h-4 text-gray-400" />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'markdown': return <FileText className="w-4 h-4 text-blue-600" />;
            case 'pdf': return <File className="w-4 h-4 text-red-600" />;
            case 'image': return <Image className="w-4 h-4 text-green-600" />;
            case 'video': return <Video className="w-4 h-4 text-purple-600" />;
            default: return <FileText className="w-4 h-4 text-gray-400" />;
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'created': return <Plus className="w-4 h-4 text-green-600" />;
            case 'updated': return <Edit className="w-4 h-4 text-blue-600" />;
            case 'commented': return <MessageSquare className="w-4 h-4 text-purple-600" />;
            case 'published': return <Upload className="w-4 h-4 text-green-600" />;
            case 'shared': return <Share className="w-4 h-4 text-orange-600" />;
            default: return <FileText className="w-4 h-4 text-gray-400" />;
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
                    <p className="text-gray-600 mt-1">
                        Create, organize, and share knowledge across your development teams
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Document
                    </button>
                </div>
            </div>

            {/* Documentation Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
                            <div className="text-sm text-gray-500">Total Documents</div>
                        </div>
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-green-600">{documentCategories.length}</div>
                            <div className="text-sm text-gray-500">Categories</div>
                        </div>
                        <Folder className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-purple-600">
                                {documents.reduce((sum, doc) => sum + doc.views, 0)}
                            </div>
                            <div className="text-sm text-gray-500">Total Views</div>
                        </div>
                        <Eye className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-orange-600">
                                {documents.reduce((sum, doc) => sum + doc.collaborators, 0)}
                            </div>
                            <div className="text-sm text-gray-500">Collaborators</div>
                        </div>
                        <Users className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'browse', name: 'Browse', icon: FileText },
                            { id: 'categories', name: 'Categories', icon: Folder },
                            { id: 'recent', name: 'Recent', icon: Clock },
                            { id: 'popular', name: 'Popular', icon: Star },
                            { id: 'activity', name: 'Activity', icon: History }
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedView(tab.id)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${selectedView === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <TabIcon className="w-4 h-4 mr-2" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {selectedView === 'browse' && (
                        <div className="space-y-6">
                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search documents..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Categories</option>
                                        {documentCategories.map(category => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="recent">Most Recent</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="alphabetical">Alphabetical</option>
                                        <option value="category">By Category</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm text-gray-500 ml-4">
                                        {filteredDocuments.length} documents
                                    </span>
                                </div>
                            </div>

                            {/* Documents Grid/List */}
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredDocuments.map((doc) => (
                                        <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    {getTypeIcon(doc.type)}
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                                                        {doc.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {getVisibilityIcon(doc.visibility)}
                                                    {doc.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{doc.description}</p>

                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {doc.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {doc.tags.length > 3 && (
                                                    <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                                                        +{doc.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-1">
                                                        <Eye className="w-4 h-4" />
                                                        <span>{doc.views}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <ThumbsUp className="w-4 h-4" />
                                                        <span>{doc.likes}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span>{doc.comments}</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs">{doc.size}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-medium text-blue-600">
                                                            {doc.author.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <span className="text-gray-600">{doc.author}</span>
                                                </div>
                                                <span className="text-gray-500">{doc.lastModified}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center space-x-2">
                                                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                                                        <Share className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    v{doc.version} • {doc.collaborators} collaborators
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredDocuments.map((doc) => (
                                        <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4 flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        {getTypeIcon(doc.type)}
                                                        {doc.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                                    </div>

                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                            <span>{doc.author}</span>
                                                            <span>{doc.lastModified}</span>
                                                            <span>{doc.category}</span>
                                                            <span>v{doc.version}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                        <Eye className="w-4 h-4" />
                                                        <span>{doc.views}</span>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                                                        {doc.status}
                                                    </span>
                                                    {getVisibilityIcon(doc.visibility)}
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedView === 'categories' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {documentCategories.map((category) => {
                                const CategoryIcon = category.icon;
                                return (
                                    <div key={category.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color}`}>
                                                <CategoryIcon className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs text-gray-500">{category.lastUpdated}</span>
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{category.description}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="text-lg font-bold text-gray-900">{category.count} docs</div>
                                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                Browse
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {selectedView === 'popular' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Most Popular Documents</h3>
                            {popularDocuments.map((doc, index) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{doc.title}</h4>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Eye className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{doc.views} views</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {doc.trend === 'up' && <ChevronRight className="w-4 h-4 text-green-600 rotate-90" />}
                                        {doc.trend === 'down' && <ChevronRight className="w-4 h-4 text-red-600 -rotate-90" />}
                                        {doc.trend === 'stable' && <div className="w-4 h-4" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedView === 'activity' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-900">{activity.user}</span>
                                            <span className="text-gray-600"> {activity.action} </span>
                                            <span className="font-medium text-gray-900">{activity.document}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{activity.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Document Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Create New Document</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <MoreVertical className="w-6 h-6" />
                            </button>
                        </div>

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Document Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter document title..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief description of the document..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        {documentCategories.map(category => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="markdown">Markdown</option>
                                        <option value="pdf">PDF</option>
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Visibility
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input type="radio" name="visibility" value="public" className="mr-2" />
                                        <Globe className="w-4 h-4 mr-1" />
                                        Public
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="visibility" value="internal" className="mr-2" defaultChecked />
                                        <Users className="w-4 h-4 mr-1" />
                                        Internal
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="visibility" value="private" className="mr-2" />
                                        <Lock className="w-4 h-4 mr-1" />
                                        Private
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (comma separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="api, tutorial, guide..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Create Document
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
