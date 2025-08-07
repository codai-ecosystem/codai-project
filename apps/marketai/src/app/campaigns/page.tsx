'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Rocket, Plus, Search, Filter, SortAsc, MoreHorizontal,
    Play, Pause, Copy, Edit, Trash2, Eye, Target, Mail,
    Share2, MessageSquare, Calendar, DollarSign, Users,
    TrendingUp, BarChart3, Clock, CheckCircle, XCircle,
    AlertCircle, RefreshCw, Download, Upload, Settings,
    ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    description: string;
    type: 'email' | 'social' | 'ads' | 'content' | 'sms' | 'push';
    status: 'active' | 'paused' | 'completed' | 'draft' | 'scheduled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    budget: number;
    spent: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    cpa: number;
    roi: number;
    startDate: string;
    endDate: string;
    createdAt: string;
    lastModified: string;
    createdBy: string;
    tags: string[];
    targetAudience: string;
    platform: string[];
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('lastModified');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setCampaigns([
            {
                id: '1',
                name: 'Summer Product Launch',
                description: 'Comprehensive product launch campaign for our new summer collection',
                type: 'email',
                status: 'active',
                priority: 'high',
                budget: 15000,
                spent: 8750,
                reach: 45000,
                impressions: 125000,
                clicks: 3500,
                conversions: 890,
                revenue: 67500,
                ctr: 2.8,
                cpa: 9.83,
                roi: 7.7,
                startDate: '2024-01-15',
                endDate: '2024-02-15',
                createdAt: '2024-01-10',
                lastModified: '2024-01-20',
                createdBy: 'Sarah Johnson',
                tags: ['product-launch', 'summer', 'email'],
                targetAudience: 'Existing customers, 25-45 years',
                platform: ['Mailchimp', 'Sendgrid']
            },
            {
                id: '2',
                name: 'Social Media Boost',
                description: 'Multi-platform social media engagement campaign',
                type: 'social',
                status: 'active',
                priority: 'medium',
                budget: 25000,
                spent: 18500,
                reach: 125000,
                impressions: 450000,
                clicks: 12500,
                conversions: 2150,
                revenue: 95000,
                ctr: 2.8,
                cpa: 8.60,
                roi: 5.1,
                startDate: '2024-01-10',
                endDate: '2024-02-10',
                createdAt: '2024-01-05',
                lastModified: '2024-01-18',
                createdBy: 'Mike Chen',
                tags: ['social-media', 'engagement', 'brand-awareness'],
                targetAudience: 'Gen Z and Millennials',
                platform: ['Facebook', 'Instagram', 'TikTok']
            },
            {
                id: '3',
                name: 'Google Ads Campaign',
                description: 'Targeted Google Ads for lead generation',
                type: 'ads',
                status: 'paused',
                priority: 'high',
                budget: 30000,
                spent: 22100,
                reach: 89000,
                impressions: 320000,
                clicks: 15200,
                conversions: 1750,
                revenue: 78500,
                ctr: 4.8,
                cpa: 12.63,
                roi: 3.6,
                startDate: '2024-01-05',
                endDate: '2024-02-05',
                createdAt: '2024-01-01',
                lastModified: '2024-01-15',
                createdBy: 'Alex Rodriguez',
                tags: ['google-ads', 'lead-generation', 'ppc'],
                targetAudience: 'Business professionals, 30-55 years',
                platform: ['Google Ads']
            },
            {
                id: '4',
                name: 'Content Marketing Series',
                description: 'Educational content series to drive organic traffic',
                type: 'content',
                status: 'draft',
                priority: 'medium',
                budget: 12000,
                spent: 0,
                reach: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0,
                revenue: 0,
                ctr: 0,
                cpa: 0,
                roi: 0,
                startDate: '2024-02-01',
                endDate: '2024-03-01',
                createdAt: '2024-01-25',
                lastModified: '2024-01-25',
                createdBy: 'Emma Davis',
                tags: ['content-marketing', 'seo', 'organic'],
                targetAudience: 'Industry professionals',
                platform: ['Blog', 'LinkedIn', 'Medium']
            },
            {
                id: '5',
                name: 'Flash Sale Campaign',
                description: 'Limited-time flash sale promotion',
                type: 'sms',
                status: 'completed',
                priority: 'urgent',
                budget: 5000,
                spent: 4800,
                reach: 25000,
                impressions: 25000,
                clicks: 8500,
                conversions: 1250,
                revenue: 42000,
                ctr: 34.0,
                cpa: 3.84,
                roi: 8.8,
                startDate: '2024-01-01',
                endDate: '2024-01-03',
                createdAt: '2023-12-28',
                lastModified: '2024-01-03',
                createdBy: 'David Kim',
                tags: ['flash-sale', 'urgent', 'sms'],
                targetAudience: 'VIP customers',
                platform: ['Twilio']
            },
            {
                id: '6',
                name: 'Mobile App Push Campaign',
                description: 'Push notifications for app engagement',
                type: 'push',
                status: 'scheduled',
                priority: 'low',
                budget: 3000,
                spent: 0,
                reach: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0,
                revenue: 0,
                ctr: 0,
                cpa: 0,
                roi: 0,
                startDate: '2024-02-15',
                endDate: '2024-03-15',
                createdAt: '2024-01-28',
                lastModified: '2024-01-28',
                createdBy: 'Lisa Wang',
                tags: ['mobile-app', 'push-notifications', 'engagement'],
                targetAudience: 'Mobile app users',
                platform: ['Firebase', 'OneSignal']
            }
        ]);

        setLoading(false);
    };

    const getStatusIcon = (status: Campaign['status']) => {
        switch (status) {
            case 'active': return <Play className="w-4 h-4 text-green-600" />;
            case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
            case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
            case 'draft': return <Edit className="w-4 h-4 text-gray-600" />;
            case 'scheduled': return <Clock className="w-4 h-4 text-purple-600" />;
            default: return <XCircle className="w-4 h-4 text-red-600" />;
        }
    };

    const getStatusColor = (status: Campaign['status']) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    const getPriorityColor = (priority: Campaign['priority']) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getTypeIcon = (type: Campaign['type']) => {
        switch (type) {
            case 'email': return Mail;
            case 'social': return Share2;
            case 'ads': return Target;
            case 'content': return MessageSquare;
            case 'sms': return MessageSquare;
            case 'push': return MessageSquare;
            default: return Rocket;
        }
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        const matchesType = typeFilter === 'all' || campaign.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
        const aValue = a[sortBy as keyof Campaign];
        const bValue = b[sortBy as keyof Campaign];

        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    const toggleCampaignSelection = (campaignId: string) => {
        setSelectedCampaigns(prev =>
            prev.includes(campaignId)
                ? prev.filter(id => id !== campaignId)
                : [...prev, campaignId]
        );
    };

    const selectAllCampaigns = () => {
        if (selectedCampaigns.length === sortedCampaigns.length) {
            setSelectedCampaigns([]);
        } else {
            setSelectedCampaigns(sortedCampaigns.map(c => c.id));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Enhanced Header */}
            <header className="bg-white/90 backdrop-blur-lg border-b border-purple-100/50 sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                                    <Rocket className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Campaign Management
                                    </h1>
                                    <p className="text-sm text-gray-600">Create and manage marketing campaigns</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Campaign</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters and Controls */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search campaigns..."
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
                                <option value="paused">Paused</option>
                                <option value="completed">Completed</option>
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                            </select>

                            {/* Type Filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
                            >
                                <option value="all">All Types</option>
                                <option value="email">Email</option>
                                <option value="social">Social</option>
                                <option value="ads">Ads</option>
                                <option value="content">Content</option>
                                <option value="sms">SMS</option>
                                <option value="push">Push</option>
                            </select>

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
                            >
                                <option value="lastModified">Last Modified</option>
                                <option value="name">Name</option>
                                <option value="status">Status</option>
                                <option value="budget">Budget</option>
                                <option value="roi">ROI</option>
                                <option value="createdAt">Created Date</option>
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
                                {selectedCampaigns.length > 0 && `${selectedCampaigns.length} selected • `}
                                {sortedCampaigns.length} campaigns
                            </span>

                            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg bg-white/70">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'} rounded-l-lg transition-colors`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'} rounded-r-lg transition-colors`}
                                >
                                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                                        <div className="bg-current rounded-sm"></div>
                                        <div className="bg-current rounded-sm"></div>
                                        <div className="bg-current rounded-sm"></div>
                                        <div className="bg-current rounded-sm"></div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                {/* Bulk Actions */}
                {selectedCampaigns.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-100/50 p-4 mb-6"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                                {selectedCampaigns.length} campaign{selectedCampaigns.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center space-x-2">
                                <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors flex items-center space-x-1">
                                    <Play className="w-3 h-3" />
                                    <span>Start</span>
                                </button>
                                <button className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors flex items-center space-x-1">
                                    <Pause className="w-3 h-3" />
                                    <span>Pause</span>
                                </button>
                                <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-1">
                                    <Copy className="w-3 h-3" />
                                    <span>Duplicate</span>
                                </button>
                                <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-1">
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Campaigns List/Grid */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50">
                    {/* Table Header */}
                    <div className="p-6 border-b border-purple-100/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <input
                                    type="checkbox"
                                    checked={selectedCampaigns.length === sortedCampaigns.length}
                                    onChange={selectAllCampaigns}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <h2 className="text-lg font-semibold text-gray-900">
                                    All Campaigns ({sortedCampaigns.length})
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
                                    <Upload className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Campaigns Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        ) : sortedCampaigns.length === 0 ? (
                            <div className="text-center py-12">
                                <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                                <p className="text-gray-600 mb-4">Get started by creating your first marketing campaign.</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                                >
                                    Create Campaign
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedCampaigns.map((campaign, index) => {
                                    const Icon = getTypeIcon(campaign.type);
                                    const isSelected = selectedCampaigns.includes(campaign.id);

                                    return (
                                        <motion.div
                                            key={campaign.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${isSelected ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 bg-white/50'
                                                }`}
                                            onClick={() => toggleCampaignSelection(campaign.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleCampaignSelection(campaign.id)}
                                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />

                                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                                        <Icon className="w-6 h-6 text-purple-600" />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                                                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(campaign.priority)}`}></div>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(campaign.status)}`}>
                                                                {getStatusIcon(campaign.status)}
                                                                <span className="ml-1 capitalize">{campaign.status}</span>
                                                            </span>
                                                            <span className="text-xs text-gray-500 capitalize">{campaign.type}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>By {campaign.createdBy}</span>
                                                            <span>•</span>
                                                            <span>Modified {new Date(campaign.lastModified).toLocaleDateString()}</span>
                                                            <span>•</span>
                                                            <span>{campaign.startDate} - {campaign.endDate}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-8">
                                                    {/* Performance Metrics */}
                                                    <div className="grid grid-cols-4 gap-6 text-center">
                                                        <div>
                                                            <p className="text-lg font-bold text-gray-900">
                                                                {campaign.reach > 0 ? campaign.reach.toLocaleString() : '-'}
                                                            </p>
                                                            <p className="text-xs text-gray-600">Reach</p>
                                                        </div>

                                                        <div>
                                                            <p className="text-lg font-bold text-gray-900">
                                                                {campaign.conversions > 0 ? campaign.conversions.toLocaleString() : '-'}
                                                            </p>
                                                            <p className="text-xs text-gray-600">Conversions</p>
                                                        </div>

                                                        <div>
                                                            <p className="text-lg font-bold text-gray-900">
                                                                {campaign.roi > 0 ? `${campaign.roi}x` : '-'}
                                                            </p>
                                                            <p className="text-xs text-gray-600">ROI</p>
                                                        </div>

                                                        <div>
                                                            <p className="text-lg font-bold text-gray-900">
                                                                ${campaign.spent.toLocaleString()}
                                                            </p>
                                                            <p className="text-xs text-gray-600">Spent</p>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
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
            </main>

            {/* Create Campaign Modal (Placeholder) */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Create New Campaign</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="text-center py-8">
                                <Rocket className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Campaign Creation</h4>
                                <p className="text-gray-600 mb-4">
                                    Campaign creation wizard will be implemented in the next development phase.
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
                                <Rocket className="w-6 h-6 text-purple-600" />
                                <span className="font-bold text-gray-900">Campaign Manager</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Create, manage, and optimize marketing campaigns with advanced analytics and automation.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Campaign Types</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Email Campaigns</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Social Media</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Paid Advertising</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Content Marketing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">A/B Testing</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Automation Rules</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Performance Analytics</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">ROI Tracking</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Campaign Guide</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Best Practices</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Templates</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Help Center</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-purple-100/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-600">
                            © 2024 MarketAI Campaign Manager by CODAI. All rights reserved.
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
