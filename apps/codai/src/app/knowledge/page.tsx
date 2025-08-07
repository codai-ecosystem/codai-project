'use client';

import React, { useState } from 'react';
import {
    Brain,
    Plus,
    Search,
    Filter,
    Settings,
    Edit,
    Trash2,
    Share,
    Eye,
    BookOpen,
    Lightbulb,
    HelpCircle,
    MessageSquare,
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
    Bookmark,
    Zap,
    Target,
    Award,
    TrendingUp,
    Database,
    Cpu,
    Network,
    Layers,
    FileText,
    Folder,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export default function KnowledgeBasePage() {
    const [selectedView, setSelectedView] = useState('browse');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('recent');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const knowledgeCategories = [
        {
            id: 1,
            name: 'Technical Solutions',
            description: 'Code snippets, troubleshooting guides, and technical fixes',
            count: 89,
            icon: Code,
            color: 'bg-blue-100 text-blue-600',
            articles: 89,
            contributors: 23,
            avgRating: 4.6
        },
        {
            id: 2,
            name: 'Best Practices',
            description: 'Development patterns, conventions, and proven methodologies',
            count: 67,
            icon: Target,
            color: 'bg-green-100 text-green-600',
            articles: 67,
            contributors: 19,
            avgRating: 4.8
        },
        {
            id: 3,
            name: 'Troubleshooting',
            description: 'Common issues, error fixes, and debugging strategies',
            count: 124,
            icon: AlertCircle,
            color: 'bg-red-100 text-red-600',
            articles: 124,
            contributors: 31,
            avgRating: 4.5
        },
        {
            id: 4,
            name: 'Architecture Patterns',
            description: 'System design patterns, architectural decisions, and frameworks',
            count: 43,
            icon: Layers,
            color: 'bg-purple-100 text-purple-600',
            articles: 43,
            contributors: 15,
            avgRating: 4.7
        },
        {
            id: 5,
            name: 'DevOps & Infrastructure',
            description: 'Deployment strategies, infrastructure patterns, and operations',
            count: 56,
            icon: Network,
            color: 'bg-orange-100 text-orange-600',
            articles: 56,
            contributors: 12,
            avgRating: 4.4
        },
        {
            id: 6,
            name: 'Learning Resources',
            description: 'Tutorials, guides, and educational content for skill development',
            count: 78,
            icon: BookOpen,
            color: 'bg-yellow-100 text-yellow-600',
            articles: 78,
            contributors: 27,
            avgRating: 4.6
        }
    ];

    const knowledgeArticles = [
        {
            id: 1,
            title: 'Optimizing React Performance with Lazy Loading',
            summary: 'Complete guide to implementing code splitting and lazy loading in React applications for improved performance',
            category: 'Technical Solutions',
            author: 'Alice Smith',
            lastModified: '2 hours ago',
            views: 1247,
            likes: 89,
            comments: 12,
            rating: 4.8,
            difficulty: 'intermediate',
            readTime: '8 min',
            tags: ['React', 'Performance', 'Code Splitting', 'Optimization'],
            isBookmarked: true,
            isFeatured: true,
            votes: { helpful: 156, notHelpful: 8 },
            lastReviewed: '1 week ago',
            status: 'verified'
        },
        {
            id: 2,
            title: 'Debugging Docker Container Issues',
            summary: 'Step-by-step troubleshooting guide for common Docker container problems and solutions',
            category: 'Troubleshooting',
            author: 'Bob Johnson',
            lastModified: '1 day ago',
            views: 892,
            likes: 67,
            comments: 18,
            rating: 4.6,
            difficulty: 'advanced',
            readTime: '12 min',
            tags: ['Docker', 'Debugging', 'Containers', 'DevOps'],
            isBookmarked: false,
            isFeatured: false,
            votes: { helpful: 134, notHelpful: 12 },
            lastReviewed: '3 days ago',
            status: 'verified'
        },
        {
            id: 3,
            title: 'Microservices Communication Patterns',
            summary: 'Best practices for service-to-service communication in microservices architecture',
            category: 'Architecture Patterns',
            author: 'Carol Wilson',
            lastModified: '3 hours ago',
            views: 634,
            likes: 78,
            comments: 24,
            rating: 4.9,
            difficulty: 'advanced',
            readTime: '15 min',
            tags: ['Microservices', 'Architecture', 'Communication', 'Patterns'],
            isBookmarked: true,
            isFeatured: true,
            votes: { helpful: 189, notHelpful: 5 },
            lastReviewed: '2 days ago',
            status: 'verified'
        },
        {
            id: 4,
            title: 'TypeScript Error Handling Strategies',
            summary: 'Comprehensive guide to error handling patterns and type safety in TypeScript applications',
            category: 'Best Practices',
            author: 'David Brown',
            lastModified: '5 hours ago',
            views: 523,
            likes: 45,
            comments: 9,
            rating: 4.7,
            difficulty: 'intermediate',
            readTime: '10 min',
            tags: ['TypeScript', 'Error Handling', 'Best Practices', 'Type Safety'],
            isBookmarked: false,
            isFeatured: false,
            votes: { helpful: 98, notHelpful: 7 },
            lastReviewed: '5 days ago',
            status: 'pending_review'
        },
        {
            id: 5,
            title: 'CI/CD Pipeline Optimization Tips',
            summary: 'Proven strategies to reduce build times and improve deployment reliability',
            category: 'DevOps & Infrastructure',
            author: 'Emma Davis',
            lastModified: '1 hour ago',
            views: 456,
            likes: 34,
            comments: 6,
            rating: 4.5,
            difficulty: 'intermediate',
            readTime: '7 min',
            tags: ['CI/CD', 'DevOps', 'Optimization', 'Automation'],
            isBookmarked: true,
            isFeatured: false,
            votes: { helpful: 87, notHelpful: 3 },
            lastReviewed: '1 week ago',
            status: 'verified'
        },
        {
            id: 6,
            title: 'Learning Path: Advanced React Patterns',
            summary: 'Structured learning path covering advanced React patterns and modern development practices',
            category: 'Learning Resources',
            author: 'Frank Miller',
            lastModified: '6 hours ago',
            views: 789,
            likes: 92,
            comments: 31,
            rating: 4.8,
            difficulty: 'advanced',
            readTime: '20 min',
            tags: ['React', 'Learning Path', 'Advanced', 'Patterns'],
            isBookmarked: false,
            isFeatured: true,
            votes: { helpful: 213, notHelpful: 11 },
            lastReviewed: '4 days ago',
            status: 'verified'
        }
    ];

    const recentActivity = [
        {
            id: 1,
            type: 'created',
            user: 'Alice Smith',
            action: 'created new article',
            target: 'React Performance Optimization',
            timestamp: '15 minutes ago',
            category: 'Technical Solutions'
        },
        {
            id: 2,
            type: 'updated',
            user: 'Bob Johnson',
            action: 'updated troubleshooting guide',
            target: 'Docker Container Debugging',
            timestamp: '1 hour ago',
            category: 'Troubleshooting'
        },
        {
            id: 3,
            type: 'reviewed',
            user: 'Carol Wilson',
            action: 'reviewed and approved',
            target: 'Microservices Patterns',
            timestamp: '2 hours ago',
            category: 'Architecture Patterns'
        },
        {
            id: 4,
            type: 'contributed',
            user: 'David Brown',
            action: 'added solution to',
            target: 'TypeScript Error Handling',
            timestamp: '3 hours ago',
            category: 'Best Practices'
        },
        {
            id: 5,
            type: 'featured',
            user: 'System',
            action: 'featured article',
            target: 'CI/CD Optimization Tips',
            timestamp: '4 hours ago',
            category: 'DevOps & Infrastructure'
        }
    ];

    const topContributors = [
        { id: 1, name: 'Alice Smith', articles: 23, likes: 456, avatar: '/avatars/alice.jpg', badge: 'Expert' },
        { id: 2, name: 'Bob Johnson', articles: 19, likes: 389, avatar: '/avatars/bob.jpg', badge: 'Specialist' },
        { id: 3, name: 'Carol Wilson', articles: 17, likes: 367, avatar: '/avatars/carol.jpg', badge: 'Expert' },
        { id: 4, name: 'David Brown', articles: 15, likes: 298, avatar: '/avatars/david.jpg', badge: 'Contributor' },
        { id: 5, name: 'Emma Davis', articles: 12, likes: 245, avatar: '/avatars/emma.jpg', badge: 'Contributor' }
    ];

    const trendingTopics = [
        { name: 'React Performance', count: 34, trend: 'up' },
        { name: 'Docker Troubleshooting', count: 28, trend: 'up' },
        { name: 'TypeScript Best Practices', count: 24, trend: 'stable' },
        { name: 'Microservices Architecture', count: 21, trend: 'up' },
        { name: 'CI/CD Optimization', count: 18, trend: 'down' }
    ];

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-600';
            case 'intermediate': return 'bg-yellow-100 text-yellow-600';
            case 'advanced': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-600';
            case 'pending_review': return 'bg-yellow-100 text-yellow-600';
            case 'draft': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'created': return <Plus className="w-4 h-4 text-green-600" />;
            case 'updated': return <Edit className="w-4 h-4 text-blue-600" />;
            case 'reviewed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'contributed': return <ThumbsUp className="w-4 h-4 text-purple-600" />;
            case 'featured': return <Star className="w-4 h-4 text-yellow-600" />;
            default: return <FileText className="w-4 h-4 text-gray-400" />;
        }
    };

    const getBadgeColor = (badge: string) => {
        switch (badge) {
            case 'Expert': return 'bg-purple-100 text-purple-600';
            case 'Specialist': return 'bg-blue-100 text-blue-600';
            case 'Contributor': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const filteredArticles = knowledgeArticles.filter(article => {
        const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const knowledgeStats = {
        totalArticles: knowledgeArticles.length,
        totalViews: knowledgeArticles.reduce((sum, article) => sum + article.views, 0),
        totalContributors: topContributors.length,
        avgRating: (knowledgeArticles.reduce((sum, article) => sum + article.rating, 0) / knowledgeArticles.length).toFixed(1)
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
                    <p className="text-gray-600 mt-1">
                        Discover, share, and learn from collective team knowledge and expertise
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
                        New Article
                    </button>
                </div>
            </div>

            {/* Knowledge Base Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{knowledgeStats.totalArticles}</div>
                            <div className="text-sm text-gray-500">Articles</div>
                        </div>
                        <Brain className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-green-600">{knowledgeStats.totalViews.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Total Views</div>
                        </div>
                        <Eye className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-purple-600">{knowledgeStats.totalContributors}</div>
                            <div className="text-sm text-gray-500">Contributors</div>
                        </div>
                        <Users className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-orange-600">{knowledgeStats.avgRating}</div>
                            <div className="text-sm text-gray-500">Avg Rating</div>
                        </div>
                        <Star className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'browse', name: 'Browse', icon: Brain },
                            { id: 'categories', name: 'Categories', icon: Folder },
                            { id: 'trending', name: 'Trending', icon: TrendingUp },
                            { id: 'contributors', name: 'Contributors', icon: Users },
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
                                            placeholder="Search knowledge base..."
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
                                        {knowledgeCategories.map(category => (
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
                                        <option value="rating">Highest Rated</option>
                                        <option value="helpful">Most Helpful</option>
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
                                        {filteredArticles.length} articles
                                    </span>
                                </div>
                            </div>

                            {/* Featured Articles */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Articles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredArticles.filter(article => article.isFeatured).map((article) => (
                                        <div key={article.id} className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                                    <span className="text-sm font-medium text-blue-600">Featured</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm font-medium text-gray-700">{article.rating}</span>
                                                </div>
                                            </div>

                                            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h4>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{article.summary}</p>

                                            <div className="flex items-center justify-between text-sm mb-4">
                                                <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(article.difficulty)}`}>
                                                    {article.difficulty}
                                                </span>
                                                <span className="text-gray-500">{article.readTime} read</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <Eye className="w-4 h-4" />
                                                        <span>{article.views}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <ThumbsUp className="w-4 h-4" />
                                                        <span>{article.likes}</span>
                                                    </div>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                    Read More
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* All Articles */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Articles</h3>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredArticles.map((article) => (
                                            <div key={article.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(article.status)}`}>
                                                            {article.status.replace('_', ' ')}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(article.difficulty)}`}>
                                                            {article.difficulty}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {article.isBookmarked && <Bookmark className="w-4 h-4 text-blue-500 fill-current" />}
                                                        <button className="text-gray-400 hover:text-gray-600">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h4>
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{article.summary}</p>

                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {article.tags.slice(0, 3).map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {article.tags.length > 3 && (
                                                        <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                                                            +{article.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center space-x-1">
                                                            <Eye className="w-4 h-4" />
                                                            <span>{article.views}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <ThumbsUp className="w-4 h-4" />
                                                            <span>{article.likes}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <MessageSquare className="w-4 h-4" />
                                                            <span>{article.comments}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                        <span>{article.rating}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-xs font-medium text-blue-600">
                                                                {article.author.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-600">{article.author}</span>
                                                    </div>
                                                    <span className="text-gray-500">{article.readTime}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredArticles.map((article) => (
                                            <div key={article.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(article.status)}`}>
                                                                {article.status.replace('_', ' ')}
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(article.difficulty)}`}>
                                                                {article.difficulty}
                                                            </span>
                                                            {article.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                                            {article.isBookmarked && <Bookmark className="w-4 h-4 text-blue-500 fill-current" />}
                                                        </div>

                                                        <h4 className="font-semibold text-gray-900 mb-1">{article.title}</h4>
                                                        <p className="text-sm text-gray-600 mb-2">{article.summary}</p>

                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>{article.author}</span>
                                                            <span>{article.lastModified}</span>
                                                            <span>{article.category}</span>
                                                            <span>{article.readTime} read</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4 ml-4">
                                                        <div className="text-center">
                                                            <div className="text-sm font-medium text-gray-900">{article.views}</div>
                                                            <div className="text-xs text-gray-500">views</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="flex items-center space-x-1">
                                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                                <span className="text-sm font-medium">{article.rating}</span>
                                                            </div>
                                                            <div className="text-xs text-gray-500">rating</div>
                                                        </div>
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
                        </div>
                    )}

                    {selectedView === 'categories' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {knowledgeCategories.map((category) => {
                                const CategoryIcon = category.icon;
                                return (
                                    <div key={category.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color}`}>
                                                <CategoryIcon className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm font-medium text-gray-700">{category.avgRating}</span>
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{category.description}</p>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <div className="text-lg font-bold text-gray-900">{category.articles}</div>
                                                <div className="text-xs text-gray-500">Articles</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-gray-900">{category.contributors}</div>
                                                <div className="text-xs text-gray-500">Contributors</div>
                                            </div>
                                        </div>

                                        <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            Browse Category
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {selectedView === 'trending' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Topics</h3>
                                <div className="space-y-4">
                                    {trendingTopics.map((topic, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{topic.name}</h4>
                                                    <div className="text-sm text-gray-600">{topic.count} articles</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {topic.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                                                {topic.trend === 'down' && <ChevronRight className="w-4 h-4 text-red-600 -rotate-90" />}
                                                {topic.trend === 'stable' && <div className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedView === 'contributors' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {topContributors.map((contributor) => (
                                    <div key={contributor.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600">
                                                    {contributor.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{contributor.name}</h4>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(contributor.badge)}`}>
                                                    {contributor.badge}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{contributor.articles}</div>
                                                <div className="text-xs text-gray-500">Articles</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{contributor.likes}</div>
                                                <div className="text-xs text-gray-500">Likes</div>
                                            </div>
                                        </div>

                                        <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            View Profile
                                        </button>
                                    </div>
                                ))}
                            </div>
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
                                            <span className="font-medium text-gray-900">{activity.target}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{activity.category} • {activity.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Article Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Create New Article</h3>
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
                                    Article Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter article title..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Summary
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief summary of the article..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        {knowledgeCategories.map(category => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Difficulty
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (comma separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="react, performance, optimization..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estimated Read Time
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., 5 min"
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
                                    Create Article
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
