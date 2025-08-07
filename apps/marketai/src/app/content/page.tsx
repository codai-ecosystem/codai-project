'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Plus, Search, Filter, MoreHorizontal, Edit, Trash2,
    Copy, Download, Upload, RefreshCw, Eye, Calendar, User,
    Tag, Globe, Clock, Heart, MessageSquare, Share2, TrendingUp,
    Image, Video, Mic, File, Link, Bookmark, Star, CheckCircle,
    XCircle, AlertCircle, PlayCircle, PauseCircle, Settings,
    Grid3X3, List, SortAsc, Target, BarChart3, Users, Zap,
    Camera, FileVideo, Music, FileImage, Archive, FolderOpen,
    Layers, Layout, Type, Palette, Scissors, Wand2, Lightbulb,
    Monitor, Smartphone, Tablet, Mail, Facebook, Twitter,
    Instagram, Linkedin, Youtube, MessageCircle, Send, Save
} from 'lucide-react';

interface ContentItem {
    id: string;
    title: string;
    description: string;
    type: 'blog' | 'social' | 'email' | 'video' | 'image' | 'document' | 'ad' | 'landing';
    status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
    author: {
        name: string;
        avatar: string;
    };
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    tags: string[];
    category: string;
    platform: string[];
    metrics: {
        views: number;
        engagements: number;
        shares: number;
        conversions: number;
    };
    thumbnail: string;
    wordCount?: number;
    duration?: string;
    dimensions?: string;
    campaigns: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    performance: {
        reach: number;
        engagement: number;
        clickRate: number;
        conversionRate: number;
    };
}

interface ContentTemplate {
    id: string;
    name: string;
    description: string;
    type: ContentItem['type'];
    thumbnail: string;
    category: string;
    usageCount: number;
    rating: number;
}

interface ContentCalendar {
    date: string;
    content: ContentItem[];
}

export default function ContentPage() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [templates, setTemplates] = useState<ContentTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContent, setSelectedContent] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
    const [selectedTab, setSelectedTab] = useState('content');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadContentData();
    }, []);

    const loadContentData = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setContent([
            {
                id: '1',
                title: 'Ultimate Guide to Email Marketing in 2024',
                description: 'Comprehensive guide covering best practices, automation, and advanced strategies for email marketing success.',
                type: 'blog',
                status: 'published',
                author: { name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg' },
                createdAt: '2024-01-15',
                updatedAt: '2024-01-20',
                publishedAt: '2024-01-20',
                tags: ['email-marketing', 'automation', 'best-practices', 'guide'],
                category: 'Marketing',
                platform: ['Website', 'LinkedIn', 'Medium'],
                metrics: { views: 15420, engagements: 892, shares: 156, conversions: 89 },
                thumbnail: '/content/email-guide.jpg',
                wordCount: 3500,
                campaigns: ['Q1 Content Marketing', 'Email Series'],
                priority: 'high',
                performance: { reach: 25000, engagement: 5.8, clickRate: 3.2, conversionRate: 2.1 }
            },
            {
                id: '2',
                title: 'Social Media Strategy Template',
                description: 'Ready-to-use template for creating comprehensive social media strategies.',
                type: 'document',
                status: 'approved',
                author: { name: 'Mike Chen', avatar: '/avatars/mike.jpg' },
                createdAt: '2024-01-18',
                updatedAt: '2024-01-19',
                tags: ['social-media', 'strategy', 'template', 'planning'],
                category: 'Templates',
                platform: ['Internal', 'Client Portal'],
                metrics: { views: 890, engagements: 67, shares: 23, conversions: 12 },
                thumbnail: '/content/strategy-template.jpg',
                campaigns: ['Client Resources'],
                priority: 'medium',
                performance: { reach: 1200, engagement: 7.5, clickRate: 5.2, conversionRate: 1.8 }
            },
            {
                id: '3',
                title: 'Product Launch Announcement Video',
                description: 'Dynamic video announcing our latest marketing automation features.',
                type: 'video',
                status: 'review',
                author: { name: 'Alex Rivera', avatar: '/avatars/alex.jpg' },
                createdAt: '2024-01-22',
                updatedAt: '2024-01-22',
                tags: ['product-launch', 'announcement', 'features', 'demo'],
                category: 'Product Marketing',
                platform: ['YouTube', 'Website', 'Social Media'],
                metrics: { views: 0, engagements: 0, shares: 0, conversions: 0 },
                thumbnail: '/content/product-video.jpg',
                duration: '2:45',
                campaigns: ['Product Launch 2024'],
                priority: 'urgent',
                performance: { reach: 0, engagement: 0, clickRate: 0, conversionRate: 0 }
            },
            {
                id: '4',
                title: 'Instagram Story Campaign - Summer Sale',
                description: 'Eye-catching Instagram story series promoting summer sale with interactive elements.',
                type: 'social',
                status: 'published',
                author: { name: 'Emma Davis', avatar: '/avatars/emma.jpg' },
                createdAt: '2024-01-10',
                updatedAt: '2024-01-12',
                publishedAt: '2024-01-12',
                tags: ['instagram', 'stories', 'sale', 'interactive'],
                category: 'Social Media',
                platform: ['Instagram'],
                metrics: { views: 12500, engagements: 1240, shares: 89, conversions: 145 },
                thumbnail: '/content/instagram-story.jpg',
                dimensions: '1080x1920',
                campaigns: ['Summer Sale 2024', 'Social Media Boost'],
                priority: 'high',
                performance: { reach: 18000, engagement: 6.9, clickRate: 4.8, conversionRate: 3.2 }
            },
            {
                id: '5',
                title: 'Weekly Newsletter - Market Insights',
                description: 'Weekly newsletter featuring latest marketing trends and industry insights.',
                type: 'email',
                status: 'draft',
                author: { name: 'David Park', avatar: '/avatars/david.jpg' },
                createdAt: '2024-01-25',
                updatedAt: '2024-01-25',
                tags: ['newsletter', 'insights', 'trends', 'weekly'],
                category: 'Email Marketing',
                platform: ['Email'],
                metrics: { views: 0, engagements: 0, shares: 0, conversions: 0 },
                thumbnail: '/content/newsletter.jpg',
                campaigns: ['Weekly Communications'],
                priority: 'medium',
                performance: { reach: 0, engagement: 0, clickRate: 0, conversionRate: 0 }
            },
            {
                id: '6',
                title: 'Brand Identity Guidelines',
                description: 'Comprehensive brand guidelines including logos, colors, typography, and usage examples.',
                type: 'document',
                status: 'published',
                author: { name: 'Lisa Wong', avatar: '/avatars/lisa.jpg' },
                createdAt: '2024-01-05',
                updatedAt: '2024-01-08',
                publishedAt: '2024-01-08',
                tags: ['brand', 'guidelines', 'identity', 'design'],
                category: 'Brand Assets',
                platform: ['Internal', 'Partner Portal'],
                metrics: { views: 2340, engagements: 156, shares: 45, conversions: 23 },
                thumbnail: '/content/brand-guidelines.jpg',
                campaigns: ['Brand Consistency'],
                priority: 'high',
                performance: { reach: 3500, engagement: 4.5, clickRate: 2.8, conversionRate: 1.2 }
            },
            {
                id: '7',
                title: 'PPC Ad Creative - Mobile App',
                description: 'High-converting ad creative for mobile app download campaign.',
                type: 'ad',
                status: 'approved',
                author: { name: 'Tom Wilson', avatar: '/avatars/tom.jpg' },
                createdAt: '2024-01-20',
                updatedAt: '2024-01-21',
                tags: ['ppc', 'mobile', 'app', 'download'],
                category: 'Paid Advertising',
                platform: ['Google Ads', 'Facebook Ads'],
                metrics: { views: 45000, engagements: 1890, shares: 67, conversions: 890 },
                thumbnail: '/content/mobile-ad.jpg',
                dimensions: '1200x628',
                campaigns: ['Mobile App Launch', 'PPC Q1'],
                priority: 'high',
                performance: { reach: 78000, engagement: 2.4, clickRate: 1.8, conversionRate: 4.2 }
            },
            {
                id: '8',
                title: 'Landing Page - Free Trial Signup',
                description: 'Conversion-optimized landing page for free trial signups with A/B test variants.',
                type: 'landing',
                status: 'published',
                author: { name: 'Rachel Green', avatar: '/avatars/rachel.jpg' },
                createdAt: '2024-01-12',
                updatedAt: '2024-01-15',
                publishedAt: '2024-01-15',
                tags: ['landing-page', 'conversion', 'free-trial', 'ab-test'],
                category: 'Web Pages',
                platform: ['Website'],
                metrics: { views: 8900, engagements: 1245, shares: 23, conversions: 567 },
                thumbnail: '/content/landing-page.jpg',
                campaigns: ['Free Trial Campaign', 'Conversion Optimization'],
                priority: 'urgent',
                performance: { reach: 12000, engagement: 14.0, clickRate: 8.5, conversionRate: 6.4 }
            }
        ]);

        setTemplates([
            {
                id: '1',
                name: 'Blog Post Template',
                description: 'Professional blog post layout with SEO optimization',
                type: 'blog',
                thumbnail: '/templates/blog-template.jpg',
                category: 'Content Marketing',
                usageCount: 156,
                rating: 4.8
            },
            {
                id: '2',
                name: 'Social Media Post',
                description: 'Engaging social media post template for multiple platforms',
                type: 'social',
                thumbnail: '/templates/social-template.jpg',
                category: 'Social Media',
                usageCount: 234,
                rating: 4.6
            },
            {
                id: '3',
                name: 'Email Newsletter',
                description: 'Responsive email newsletter template with modern design',
                type: 'email',
                thumbnail: '/templates/email-template.jpg',
                category: 'Email Marketing',
                usageCount: 189,
                rating: 4.9
            },
            {
                id: '4',
                name: 'Product Demo Video',
                description: 'Professional video template for product demonstrations',
                type: 'video',
                thumbnail: '/templates/video-template.jpg',
                category: 'Video Marketing',
                usageCount: 67,
                rating: 4.7
            },
            {
                id: '5',
                name: 'PPC Ad Creative',
                description: 'High-converting ad template for paid campaigns',
                type: 'ad',
                thumbnail: '/templates/ad-template.jpg',
                category: 'Paid Advertising',
                usageCount: 123,
                rating: 4.5
            },
            {
                id: '6',
                name: 'Landing Page',
                description: 'Conversion-optimized landing page template',
                type: 'landing',
                thumbnail: '/templates/landing-template.jpg',
                category: 'Web Pages',
                usageCount: 98,
                rating: 4.8
            }
        ]);

        setLoading(false);
    };

    const getTypeIcon = (type: ContentItem['type']) => {
        switch (type) {
            case 'blog': return FileText;
            case 'social': return MessageSquare;
            case 'email': return Mail;
            case 'video': return Video;
            case 'image': return Image;
            case 'document': return File;
            case 'ad': return Target;
            case 'landing': return Monitor;
            default: return FileText;
        }
    };

    const getStatusColor = (status: ContentItem['status']) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'published': return 'bg-green-100 text-green-800 border-green-200';
            case 'archived': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: ContentItem['priority']) => {
        switch (priority) {
            case 'low': return 'text-gray-600';
            case 'medium': return 'text-blue-600';
            case 'high': return 'text-orange-600';
            case 'urgent': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const filteredContent = content.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            item.author.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    const sortedContent = [...filteredContent].sort((a, b) => {
        const aValue = a[sortBy as keyof ContentItem];
        const bValue = b[sortBy as keyof ContentItem];

        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    const toggleContentSelection = (contentId: string) => {
        setSelectedContent(prev =>
            prev.includes(contentId)
                ? prev.filter(id => id !== contentId)
                : [...prev, contentId]
        );
    };

    const selectAllContent = () => {
        if (selectedContent.length === sortedContent.length) {
            setSelectedContent([]);
        } else {
            setSelectedContent(sortedContent.map(c => c.id));
        }
    };

    const totalContent = content.length;
    const publishedContent = content.filter(c => c.status === 'published').length;
    const draftContent = content.filter(c => c.status === 'draft').length;
    const avgEngagement = content.reduce((sum, c) => sum + c.performance.engagement, 0) / content.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Enhanced Header */}
            <header className="bg-white/90 backdrop-blur-lg border-b border-purple-100/50 sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Content Management
                                    </h1>
                                    <p className="text-sm text-gray-600">Create, organize, and optimize your marketing content</p>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center space-x-6 ml-8">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{totalContent}</p>
                                    <p className="text-xs text-gray-600">Total Content</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{publishedContent}</p>
                                    <p className="text-xs text-gray-600">Published</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{draftContent}</p>
                                    <p className="text-xs text-gray-600">Drafts</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{avgEngagement.toFixed(1)}%</p>
                                    <p className="text-xs text-gray-600">Avg Engagement</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Content</span>
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <nav className="flex space-x-1 bg-gray-100/50 rounded-xl p-1">
                        {[
                            { id: 'content', label: 'Content Library', icon: FileText },
                            { id: 'templates', label: 'Templates', icon: Layout },
                            { id: 'calendar', label: 'Calendar', icon: Calendar },
                            { id: 'analytics', label: 'Performance', icon: BarChart3 },
                            { id: 'assets', label: 'Assets', icon: FolderOpen }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${selectedTab === tab.id
                                            ? 'bg-white text-purple-600 shadow-md'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                {selectedTab === 'content' && (
                    <div className="space-y-6">
                        {/* Filters and Controls */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50">
                            <div className="flex flex-wrap items-center gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search content..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 w-64"
                                    />
                                </div>

                                {/* Type Filter */}
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
                                >
                                    <option value="all">All Types</option>
                                    <option value="blog">Blog Posts</option>
                                    <option value="social">Social Media</option>
                                    <option value="email">Email</option>
                                    <option value="video">Video</option>
                                    <option value="image">Images</option>
                                    <option value="document">Documents</option>
                                    <option value="ad">Ads</option>
                                    <option value="landing">Landing Pages</option>
                                </select>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
                                >
                                    <option value="all">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="review">Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>

                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
                                >
                                    <option value="updatedAt">Last Updated</option>
                                    <option value="createdAt">Created Date</option>
                                    <option value="title">Title</option>
                                    <option value="performance.engagement">Engagement</option>
                                    <option value="metrics.views">Views</option>
                                </select>

                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white/70"
                                >
                                    <SortAsc className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                                </button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                    {selectedContent.length > 0 && `${selectedContent.length} selected • `}
                                    {sortedContent.length} items
                                </span>

                                <div className="flex items-center space-x-1 border border-gray-200 rounded-lg bg-white/70">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'} rounded-l-lg transition-colors`}
                                    >
                                        <Grid3X3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'} transition-colors`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('calendar')}
                                        className={`p-2 ${viewMode === 'calendar' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'} rounded-r-lg transition-colors`}
                                    >
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedContent.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-100/50 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">
                                        {selectedContent.length} item{selectedContent.length > 1 ? 's' : ''} selected
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-1">
                                            <Edit className="w-3 h-3" />
                                            <span>Bulk Edit</span>
                                        </button>
                                        <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors flex items-center space-x-1">
                                            <Copy className="w-3 h-3" />
                                            <span>Duplicate</span>
                                        </button>
                                        <button className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors flex items-center space-x-1">
                                            <Send className="w-3 h-3" />
                                            <span>Publish</span>
                                        </button>
                                        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-1">
                                            <Download className="w-3 h-3" />
                                            <span>Export</span>
                                        </button>
                                        <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-1">
                                            <Trash2 className="w-3 h-3" />
                                            <span>Archive</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Content Grid/List */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50">
                            <div className="p-6 border-b border-purple-100/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedContent.length === sortedContent.length}
                                            onChange={selectAllContent}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Content Library ({sortedContent.length})
                                        </h2>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                            <Upload className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {loading ? (
                                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className={viewMode === 'grid' ? 'h-80 bg-gray-200 rounded-lg' : 'h-24 bg-gray-200 rounded-lg'}></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : sortedContent.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                                        <p className="text-gray-600 mb-4">Create your first piece of content to get started.</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                                        >
                                            Create Content
                                        </button>
                                    </div>
                                ) : viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {sortedContent.map((item, index) => {
                                            const isSelected = selectedContent.includes(item.id);
                                            const TypeIcon = getTypeIcon(item.type);

                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`border rounded-xl hover:shadow-lg transition-all cursor-pointer ${isSelected ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 bg-white/50'
                                                        }`}
                                                    onClick={() => toggleContentSelection(item.id)}
                                                >
                                                    <div className="relative">
                                                        <div className="h-48 bg-gray-100 rounded-t-xl flex items-center justify-center">
                                                            <TypeIcon className="w-12 h-12 text-gray-400" />
                                                        </div>
                                                        <div className="absolute top-3 left-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleContentSelection(item.id)}
                                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div className="absolute top-3 right-3 flex items-center space-x-2">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                                                                {item.status}
                                                            </span>
                                                            <button
                                                                className="p-1 text-gray-600 hover:text-gray-800 rounded transition-colors bg-white/80"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                <TypeIcon className="w-4 h-4 text-purple-600" />
                                                                <span className="text-xs text-gray-600 capitalize">{item.type}</span>
                                                            </div>
                                                            <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                                                {item.priority}
                                                            </span>
                                                        </div>

                                                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                                                        <div className="flex items-center space-x-3 mb-3 text-xs text-gray-600">
                                                            <div className="flex items-center space-x-1">
                                                                <User className="w-3 h-3" />
                                                                <span>{item.author.name}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                                <p className="font-semibold text-gray-900">{item.metrics.views.toLocaleString()}</p>
                                                                <p className="text-gray-600">Views</p>
                                                            </div>
                                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                                <p className="font-semibold text-gray-900">{item.performance.engagement}%</p>
                                                                <p className="text-gray-600">Engagement</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-1 mb-3">
                                                            {item.tags.slice(0, 2).map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {item.tags.length > 2 && (
                                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                                                                    +{item.tags.length - 2}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                            <div className="flex items-center space-x-2">
                                                                <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button className="p-1 text-gray-600 hover:text-purple-600 transition-colors">
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button className="p-1 text-gray-600 hover:text-green-600 transition-colors">
                                                                    <Share2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <span className="text-xs text-gray-600">{item.campaigns.length} campaigns</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sortedContent.map((item, index) => {
                                            const isSelected = selectedContent.includes(item.id);
                                            const TypeIcon = getTypeIcon(item.type);

                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${isSelected ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 bg-white/50'
                                                        }`}
                                                    onClick={() => toggleContentSelection(item.id)}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleContentSelection(item.id)}
                                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />

                                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <TypeIcon className="w-6 h-6 text-gray-400" />
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center space-x-3">
                                                                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                                                                        {item.status}
                                                                    </span>
                                                                    <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                                                        {item.priority}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-gray-600">{new Date(item.updatedAt).toLocaleDateString()}</span>
                                                            </div>

                                                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>

                                                            <div className="flex items-center space-x-4 text-xs text-gray-600">
                                                                <div className="flex items-center space-x-1">
                                                                    <TypeIcon className="w-3 h-3" />
                                                                    <span className="capitalize">{item.type}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <User className="w-3 h-3" />
                                                                    <span>{item.author.name}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <Eye className="w-3 h-3" />
                                                                    <span>{item.metrics.views.toLocaleString()} views</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <TrendingUp className="w-3 h-3" />
                                                                    <span>{item.performance.engagement}% engagement</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Templates Tab */}
                {selectedTab === 'templates' && (
                    <div className="space-y-6">
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Content Templates</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {templates.map((template, index) => {
                                    const TypeIcon = getTypeIcon(template.type);

                                    return (
                                        <motion.div
                                            key={template.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="border border-gray-200 rounded-xl hover:shadow-lg transition-all cursor-pointer bg-white/50"
                                        >
                                            <div className="h-32 bg-gray-100 rounded-t-xl flex items-center justify-center">
                                                <TypeIcon className="w-8 h-8 text-gray-400" />
                                            </div>

                                            <div className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs text-purple-600 font-medium capitalize">{template.type}</span>
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                        <span className="text-xs text-gray-600">{template.rating}</span>
                                                    </div>
                                                </div>

                                                <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                                                <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                                                    <span>{template.category}</span>
                                                    <span>{template.usageCount} uses</span>
                                                </div>

                                                <button className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm">
                                                    Use Template
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Other tabs placeholder */}
                {!['content', 'templates'].includes(selectedTab) && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Feature
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Advanced {selectedTab} functionality will be implemented in the next phase.
                        </p>
                        <p className="text-sm text-gray-500">
                            Coming soon with comprehensive content management tools.
                        </p>
                    </div>
                )}
            </main>

            {/* Create Content Modal (Placeholder) */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Create Content</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                >
                                    <Plus className="w-5 h-5 rotate-45" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { type: 'blog', icon: FileText, label: 'Blog Post', color: 'text-blue-600' },
                                    { type: 'social', icon: MessageSquare, label: 'Social Post', color: 'text-green-600' },
                                    { type: 'email', icon: Mail, label: 'Email', color: 'text-purple-600' },
                                    { type: 'video', icon: Video, label: 'Video', color: 'text-red-600' },
                                    { type: 'image', icon: Image, label: 'Image', color: 'text-orange-600' },
                                    { type: 'document', icon: File, label: 'Document', color: 'text-gray-600' },
                                    { type: 'ad', icon: Target, label: 'Advertisement', color: 'text-pink-600' },
                                    { type: 'landing', icon: Monitor, label: 'Landing Page', color: 'text-indigo-600' }
                                ].map((contentType) => {
                                    const Icon = contentType.icon;
                                    return (
                                        <button
                                            key={contentType.type}
                                            className="p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all text-center"
                                        >
                                            <Icon className={`w-8 h-8 mx-auto mb-2 ${contentType.color}`} />
                                            <span className="text-sm font-medium text-gray-900">{contentType.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="text-center mt-8">
                                <p className="text-gray-600 mb-4">
                                    Advanced content creation wizard will be implemented in the next development phase.
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modern Footer */}
            <footer className="bg-white/70 backdrop-blur-sm border-t border-purple-100/50 mt-12">
                <div className="px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <FileText className="w-6 h-6 text-purple-600" />
                                <span className="font-bold text-gray-900">Content Hub</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Comprehensive content management system for creating, organizing, and optimizing marketing content.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Content Types</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Blog Posts</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Social Media</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Email Campaigns</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Video Content</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Tools</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Content Editor</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Template Library</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Asset Manager</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Performance Analytics</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Collaboration Tools</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Version Control</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Content Calendar</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Workflow Management</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-purple-100/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-600">
                            © 2024 MarketAI Content Hub by CODAI. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Privacy</a>
                            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Terms</a>
                            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
