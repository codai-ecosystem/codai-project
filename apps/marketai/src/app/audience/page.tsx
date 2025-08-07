'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, UserPlus, Target, Filter, Search, MoreHorizontal,
    Edit, Trash2, Copy, Download, Upload, RefreshCw, Plus,
    Eye, MapPin, Calendar, Mail, Phone, Globe, Smartphone,
    Monitor, Tablet, Heart, ShoppingBag, Star, TrendingUp,
    BarChart3, PieChart, Activity, Award, AlertCircle,
    CheckCircle, Clock, Zap, Settings, ArrowUpRight,
    ArrowDownRight, Minus, SortAsc, Grid3X3, List
} from 'lucide-react';

interface AudienceSegment {
    id: string;
    name: string;
    description: string;
    size: number;
    growth: string;
    trend: 'up' | 'down' | 'neutral';
    lastUpdated: string;
    criteria: {
        demographics: string[];
        behavior: string[];
        interests: string[];
        location: string[];
    };
    engagement: {
        emailOpenRate: number;
        clickRate: number;
        conversionRate: number;
        avgOrderValue: number;
    };
    campaigns: number;
    revenue: number;
    status: 'active' | 'inactive' | 'archived';
    tags: string[];
}

interface DemographicData {
    category: string;
    segments: { label: string; value: number; color: string }[];
}

interface GeographicData {
    country: string;
    users: number;
    revenue: number;
    conversionRate: number;
    flag: string;
}

export default function AudiencePage() {
    const [segments, setSegments] = useState<AudienceSegment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('size');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTab, setSelectedTab] = useState('segments');

    useEffect(() => {
        loadAudienceData();
    }, []);

    const loadAudienceData = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSegments([
            {
                id: '1',
                name: 'High-Value Customers',
                description: 'Customers with lifetime value > $1000 and frequent purchases',
                size: 12450,
                growth: '+8.3%',
                trend: 'up',
                lastUpdated: '2024-01-20',
                criteria: {
                    demographics: ['Age 25-45', 'Income >$75k'],
                    behavior: ['Purchase frequency >5', 'Cart value >$200'],
                    interests: ['Premium products', 'Tech gadgets'],
                    location: ['Urban areas', 'North America', 'Europe']
                },
                engagement: {
                    emailOpenRate: 45.2,
                    clickRate: 12.8,
                    conversionRate: 8.9,
                    avgOrderValue: 285
                },
                campaigns: 15,
                revenue: 450000,
                status: 'active',
                tags: ['high-value', 'loyal', 'premium']
            },
            {
                id: '2',
                name: 'Young Professionals',
                description: 'Tech-savvy millennials and Gen Z professionals',
                size: 28750,
                growth: '+15.7%',
                trend: 'up',
                lastUpdated: '2024-01-19',
                criteria: {
                    demographics: ['Age 22-35', 'College educated'],
                    behavior: ['Mobile-first', 'Social media active'],
                    interests: ['Technology', 'Career growth', 'Sustainability'],
                    location: ['Major cities', 'Global']
                },
                engagement: {
                    emailOpenRate: 38.5,
                    clickRate: 9.2,
                    conversionRate: 6.4,
                    avgOrderValue: 125
                },
                campaigns: 22,
                revenue: 320000,
                status: 'active',
                tags: ['millennial', 'professional', 'tech-savvy']
            },
            {
                id: '3',
                name: 'Budget Conscious Shoppers',
                description: 'Price-sensitive customers who respond well to discounts',
                size: 45200,
                growth: '+5.2%',
                trend: 'up',
                lastUpdated: '2024-01-18',
                criteria: {
                    demographics: ['All ages', 'Mixed income'],
                    behavior: ['Coupon usage', 'Sale season purchases'],
                    interests: ['Deals', 'Value products', 'Reviews'],
                    location: ['Suburban areas', 'Global']
                },
                engagement: {
                    emailOpenRate: 42.1,
                    clickRate: 11.5,
                    conversionRate: 7.2,
                    avgOrderValue: 85
                },
                campaigns: 18,
                revenue: 275000,
                status: 'active',
                tags: ['budget', 'discount', 'value-seeking']
            },
            {
                id: '4',
                name: 'Luxury Enthusiasts',
                description: 'Premium customers interested in high-end products',
                size: 5890,
                growth: '+12.4%',
                trend: 'up',
                lastUpdated: '2024-01-17',
                criteria: {
                    demographics: ['Age 35-55', 'High income'],
                    behavior: ['Premium purchases', 'Brand loyalty'],
                    interests: ['Luxury brands', 'Exclusivity', 'Quality'],
                    location: ['Affluent areas', 'International']
                },
                engagement: {
                    emailOpenRate: 52.3,
                    clickRate: 15.7,
                    conversionRate: 11.8,
                    avgOrderValue: 485
                },
                campaigns: 8,
                revenue: 380000,
                status: 'active',
                tags: ['luxury', 'premium', 'exclusive']
            },
            {
                id: '5',
                name: 'Inactive Users',
                description: 'Users who haven\'t engaged in the last 90 days',
                size: 18350,
                growth: '-2.8%',
                trend: 'down',
                lastUpdated: '2024-01-16',
                criteria: {
                    demographics: ['Mixed demographics'],
                    behavior: ['No recent activity', 'Low engagement'],
                    interests: ['Previously active', 'Re-engagement potential'],
                    location: ['Global']
                },
                engagement: {
                    emailOpenRate: 18.4,
                    clickRate: 3.2,
                    conversionRate: 1.1,
                    avgOrderValue: 45
                },
                campaigns: 5,
                revenue: 25000,
                status: 'inactive',
                tags: ['inactive', 're-engagement', 'dormant']
            },
            {
                id: '6',
                name: 'Mobile-First Users',
                description: 'Users who primarily interact via mobile devices',
                size: 35600,
                growth: '+22.1%',
                trend: 'up',
                lastUpdated: '2024-01-15',
                criteria: {
                    demographics: ['Age 18-40', 'Mobile natives'],
                    behavior: ['App usage', 'Mobile purchases'],
                    interests: ['Mobile apps', 'Quick checkout', 'Push notifications'],
                    location: ['Global', 'Mobile-heavy regions']
                },
                engagement: {
                    emailOpenRate: 35.8,
                    clickRate: 8.9,
                    conversionRate: 5.7,
                    avgOrderValue: 95
                },
                campaigns: 12,
                revenue: 185000,
                status: 'active',
                tags: ['mobile', 'app-users', 'digital-native']
            }
        ]);

        setLoading(false);
    };

    const demographicData: DemographicData[] = [
        {
            category: 'Age Groups',
            segments: [
                { label: '18-24', value: 18, color: '#8B5CF6' },
                { label: '25-34', value: 32, color: '#A78BFA' },
                { label: '35-44', value: 28, color: '#C4B5FD' },
                { label: '45-54', value: 15, color: '#DDD6FE' },
                { label: '55+', value: 7, color: '#EDE9FE' }
            ]
        },
        {
            category: 'Device Usage',
            segments: [
                { label: 'Mobile', value: 58, color: '#EC4899' },
                { label: 'Desktop', value: 35, color: '#F472B6' },
                { label: 'Tablet', value: 7, color: '#F9A8D4' }
            ]
        },
        {
            category: 'Income Level',
            segments: [
                { label: '<$30k', value: 15, color: '#F59E0B' },
                { label: '$30k-$60k', value: 35, color: '#F97316' },
                { label: '$60k-$100k', value: 30, color: '#EF4444' },
                { label: '>$100k', value: 20, color: '#DC2626' }
            ]
        }
    ];

    const geographicData: GeographicData[] = [
        { country: 'United States', users: 45200, revenue: 1250000, conversionRate: 8.5, flag: '🇺🇸' },
        { country: 'United Kingdom', users: 18500, revenue: 485000, conversionRate: 7.2, flag: '🇬🇧' },
        { country: 'Canada', users: 12300, revenue: 320000, conversionRate: 6.8, flag: '🇨🇦' },
        { country: 'Australia', users: 9800, revenue: 275000, conversionRate: 7.9, flag: '🇦🇺' },
        { country: 'Germany', users: 15600, revenue: 420000, conversionRate: 6.5, flag: '🇩🇪' },
        { country: 'France', users: 11200, revenue: 295000, conversionRate: 5.8, flag: '🇫🇷' }
    ];

    const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up': return <ArrowUpRight className="w-4 h-4 text-green-600" />;
            case 'down': return <ArrowDownRight className="w-4 h-4 text-red-600" />;
            default: return <Minus className="w-4 h-4 text-gray-600" />;
        }
    };

    const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up': return 'text-green-600 bg-green-50';
            case 'down': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusColor = (status: AudienceSegment['status']) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredSegments = segments.filter(segment => {
        const matchesSearch = segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            segment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            segment.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || segment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const sortedSegments = [...filteredSegments].sort((a, b) => {
        const aValue = a[sortBy as keyof AudienceSegment];
        const bValue = b[sortBy as keyof AudienceSegment];

        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    const toggleSegmentSelection = (segmentId: string) => {
        setSelectedSegments(prev =>
            prev.includes(segmentId)
                ? prev.filter(id => id !== segmentId)
                : [...prev, segmentId]
        );
    };

    const selectAllSegments = () => {
        if (selectedSegments.length === sortedSegments.length) {
            setSelectedSegments([]);
        } else {
            setSelectedSegments(sortedSegments.map(s => s.id));
        }
    };

    const totalAudienceSize = segments.reduce((sum, segment) => sum + segment.size, 0);
    const activeSegments = segments.filter(s => s.status === 'active').length;
    const avgEngagement = segments.reduce((sum, s) => sum + s.engagement.emailOpenRate, 0) / segments.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Enhanced Header */}
            <header className="bg-white/90 backdrop-blur-lg border-b border-purple-100/50 sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Audience Management
                                    </h1>
                                    <p className="text-sm text-gray-600">Segment and target your audience effectively</p>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center space-x-6 ml-8">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{totalAudienceSize.toLocaleString()}</p>
                                    <p className="text-xs text-gray-600">Total Audience</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{activeSegments}</p>
                                    <p className="text-xs text-gray-600">Active Segments</p>
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
                                <UserPlus className="w-4 h-4" />
                                <span>Create Segment</span>
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <nav className="flex space-x-1 bg-gray-100/50 rounded-xl p-1">
                        {[
                            { id: 'segments', label: 'Segments', icon: Users },
                            { id: 'demographics', label: 'Demographics', icon: PieChart },
                            { id: 'geography', label: 'Geography', icon: Globe },
                            { id: 'behavior', label: 'Behavior', icon: Activity },
                            { id: 'insights', label: 'Insights', icon: TrendingUp }
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
                {selectedTab === 'segments' && (
                    <div className="space-y-6">
                        {/* Filters and Controls */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50">
                            <div className="flex flex-wrap items-center gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search segments..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 w-64"
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="archived">Archived</option>
                                </select>

                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
                                >
                                    <option value="size">Audience Size</option>
                                    <option value="name">Name</option>
                                    <option value="revenue">Revenue</option>
                                    <option value="lastUpdated">Last Updated</option>
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
                                    {selectedSegments.length > 0 && `${selectedSegments.length} selected • `}
                                    {sortedSegments.length} segments
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
                                        className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'} rounded-r-lg transition-colors`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedSegments.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-100/50 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">
                                        {selectedSegments.length} segment{selectedSegments.length > 1 ? 's' : ''} selected
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-1">
                                            <Target className="w-3 h-3" />
                                            <span>Create Campaign</span>
                                        </button>
                                        <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors flex items-center space-x-1">
                                            <Copy className="w-3 h-3" />
                                            <span>Duplicate</span>
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

                        {/* Segments Grid/List */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50">
                            <div className="p-6 border-b border-purple-100/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedSegments.length === sortedSegments.length}
                                            onChange={selectAllSegments}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Audience Segments ({sortedSegments.length})
                                        </h2>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                            <Download className="w-4 h-4" />
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
                                                <div className={viewMode === 'grid' ? 'h-64 bg-gray-200 rounded-lg' : 'h-20 bg-gray-200 rounded-lg'}></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : sortedSegments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No segments found</h3>
                                        <p className="text-gray-600 mb-4">Create your first audience segment to get started.</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                                        >
                                            Create Segment
                                        </button>
                                    </div>
                                ) : viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {sortedSegments.map((segment, index) => {
                                            const isSelected = selectedSegments.includes(segment.id);

                                            return (
                                                <motion.div
                                                    key={segment.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-6 border rounded-xl hover:shadow-lg transition-all cursor-pointer ${isSelected ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 bg-white/50'
                                                        }`}
                                                    onClick={() => toggleSegmentSelection(segment.id)}
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSegmentSelection(segment.id)}
                                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(segment.status)}`}>
                                                                {segment.status}
                                                            </span>
                                                            <button
                                                                className="p-1 text-gray-600 hover:text-gray-800 rounded transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <h3 className="font-semibold text-gray-900 mb-2">{segment.name}</h3>
                                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{segment.description}</p>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Audience Size</span>
                                                            <div className="flex items-center space-x-1">
                                                                <span className="font-semibold text-gray-900">{segment.size.toLocaleString()}</span>
                                                                <div className={`flex items-center space-x-1 px-1 py-0.5 rounded text-xs ${getTrendColor(segment.trend)}`}>
                                                                    {getTrendIcon(segment.trend)}
                                                                    <span>{segment.growth}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Email Open Rate</span>
                                                            <span className="font-semibold text-gray-900">{segment.engagement.emailOpenRate}%</span>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Revenue</span>
                                                            <span className="font-semibold text-green-600">${segment.revenue.toLocaleString()}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Active Campaigns</span>
                                                            <span className="font-semibold text-gray-900">{segment.campaigns}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                                        <div className="flex flex-wrap gap-1">
                                                            {segment.tags.slice(0, 3).map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {segment.tags.length > 3 && (
                                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                                                                    +{segment.tags.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sortedSegments.map((segment, index) => {
                                            const isSelected = selectedSegments.includes(segment.id);

                                            return (
                                                <motion.div
                                                    key={segment.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${isSelected ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 bg-white/50'
                                                        }`}
                                                    onClick={() => toggleSegmentSelection(segment.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleSegmentSelection(segment.id)}
                                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />

                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-3 mb-1">
                                                                    <h3 className="font-semibold text-gray-900">{segment.name}</h3>
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(segment.status)}`}>
                                                                        {segment.status}
                                                                    </span>
                                                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getTrendColor(segment.trend)}`}>
                                                                        {getTrendIcon(segment.trend)}
                                                                        <span>{segment.growth}</span>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-gray-600">{segment.description}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-8">
                                                            <div className="text-center">
                                                                <p className="text-lg font-bold text-gray-900">{segment.size.toLocaleString()}</p>
                                                                <p className="text-xs text-gray-600">Audience</p>
                                                            </div>

                                                            <div className="text-center">
                                                                <p className="text-lg font-bold text-gray-900">{segment.engagement.emailOpenRate}%</p>
                                                                <p className="text-xs text-gray-600">Open Rate</p>
                                                            </div>

                                                            <div className="text-center">
                                                                <p className="text-lg font-bold text-green-600">${segment.revenue.toLocaleString()}</p>
                                                                <p className="text-xs text-gray-600">Revenue</p>
                                                            </div>

                                                            <div className="text-center">
                                                                <p className="text-lg font-bold text-gray-900">{segment.campaigns}</p>
                                                                <p className="text-xs text-gray-600">Campaigns</p>
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

                {/* Demographics Tab */}
                {selectedTab === 'demographics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {demographicData.map((category, index) => (
                                <motion.div
                                    key={category.category}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-6"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>

                                    <div className="space-y-3">
                                        {category.segments.map((segment) => (
                                            <div key={segment.label} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: segment.color }}
                                                    ></div>
                                                    <span className="text-sm text-gray-700">{segment.label}</span>
                                                </div>
                                                <span className="font-medium text-gray-900">{segment.value}%</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Placeholder for chart */}
                                    <div className="mt-4 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <PieChart className="w-8 h-8 text-gray-400" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Geography Tab */}
                {selectedTab === 'geography' && (
                    <div className="space-y-6">
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Geographic Distribution</h3>

                            <div className="space-y-4">
                                {geographicData.map((country, index) => (
                                    <motion.div
                                        key={country.country}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-100"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <span className="text-2xl">{country.flag}</span>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{country.country}</h4>
                                                <p className="text-sm text-gray-600">{country.users.toLocaleString()} users</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-8">
                                            <div className="text-center">
                                                <p className="font-semibold text-gray-900">${country.revenue.toLocaleString()}</p>
                                                <p className="text-xs text-gray-600">Revenue</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-gray-900">{country.conversionRate}%</p>
                                                <p className="text-xs text-gray-600">Conversion</p>
                                            </div>
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                                    style={{ width: `${(country.users / 50000) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Other tabs placeholder */}
                {!['segments', 'demographics', 'geography'].includes(selectedTab) && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Analysis
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Advanced {selectedTab} analysis and insights will be implemented in the next phase.
                        </p>
                        <p className="text-sm text-gray-500">
                            Coming soon with detailed analytics and behavioral insights.
                        </p>
                    </div>
                )}
            </main>

            {/* Create Segment Modal (Placeholder) */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Create Audience Segment</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                >
                                    <Plus className="w-5 h-5 rotate-45" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="text-center py-8">
                                <UserPlus className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Segment Builder</h4>
                                <p className="text-gray-600 mb-4">
                                    Advanced segment creation wizard will be implemented in the next development phase.
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
                                <Users className="w-6 h-6 text-purple-600" />
                                <span className="font-bold text-gray-900">Audience Hub</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Advanced audience segmentation and targeting for personalized marketing campaigns.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Segmentation</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Demographic Targeting</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Behavioral Analysis</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Geographic Insights</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Custom Segments</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Analytics</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Engagement Metrics</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Conversion Tracking</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Audience Growth</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Performance Reports</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Tools</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Segment Builder</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">A/B Testing</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Lookalike Audiences</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Data Import</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-purple-100/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-600">
                            © 2024 MarketAI Audience Hub by CODAI. All rights reserved.
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
