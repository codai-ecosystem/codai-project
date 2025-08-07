'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Plus, Search, Filter, MoreHorizontal, Edit, Trash2,
    Copy, Download, Upload, RefreshCw, Eye, Calendar, User,
    Tag, Globe, Clock, Heart, MessageSquare, Share2, TrendingUp,
    Image, Video, Mic, File, Link, Bookmark, Star, CheckCircle,
    XCircle, AlertCircle, PlayCircle, PauseCircle, Settings,
    Grid3X3, List, SortAsc, Target, BarChart3, Users, Activity,
    Camera, FileVideo, Music, FileImage, Archive, FolderOpen,
    Layers, Layout, Type, Palette, Scissors, Wand2, Lightbulb,
    Monitor, Smartphone, Tablet, Mail, Facebook, Twitter,
    Instagram, Linkedin, Youtube, MessageCircle, Send, Save,
    Workflow, GitBranch, Timer, Bell, ShoppingCart, UserCheck,
    ArrowRight, ChevronDown, Repeat, FilterX, Bot, Cpu, Gauge
} from 'lucide-react';

interface AutomationWorkflow {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'paused' | 'draft' | 'error';
    trigger: {
        type: 'time' | 'event' | 'condition' | 'webhook';
        name: string;
        icon: any;
        description: string;
    };
    actions: {
        id: string;
        type: string;
        name: string;
        description: string;
        icon: any;
    }[];
    metrics: {
        executions: number;
        successRate: number;
        avgExecutionTime: string;
        lastRun: string;
    };
    created: string;
    updated: string;
    author: string;
    tags: string[];
    category: string;
    priority: 'low' | 'medium' | 'high';
}

interface AutomationTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    complexity: 'simple' | 'medium' | 'advanced';
    usageCount: number;
    rating: number;
    estimatedTime: string;
    triggers: string[];
    actions: string[];
}

export default function AutomationPage() {
    const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
    const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('updated');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedTab, setSelectedTab] = useState('workflows');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadAutomationData();
    }, []);

    const loadAutomationData = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setWorkflows([
            {
                id: '1',
                name: 'Welcome Email Series',
                description: 'Automated welcome email sequence for new subscribers with progressive content delivery.',
                status: 'active',
                trigger: {
                    type: 'event',
                    name: 'New Subscriber',
                    icon: UserCheck,
                    description: 'Triggered when someone subscribes to newsletter'
                },
                actions: [
                    { id: '1', type: 'email', name: 'Send Welcome Email', description: 'Immediate welcome message', icon: Mail },
                    { id: '2', type: 'delay', name: 'Wait 2 Days', description: 'Delay before next action', icon: Timer },
                    { id: '3', type: 'email', name: 'Send Tips Email', description: 'Marketing tips and best practices', icon: Mail },
                    { id: '4', type: 'delay', name: 'Wait 5 Days', description: 'Extended delay period', icon: Timer },
                    { id: '5', type: 'email', name: 'Send Resource Guide', description: 'Comprehensive resource compilation', icon: Mail }
                ],
                metrics: {
                    executions: 1247,
                    successRate: 98.5,
                    avgExecutionTime: '2.3s',
                    lastRun: '2024-01-25T10:30:00Z'
                },
                created: '2024-01-10',
                updated: '2024-01-20',
                author: 'Sarah Johnson',
                tags: ['email-marketing', 'onboarding', 'nurturing'],
                category: 'Email Marketing',
                priority: 'high'
            },
            {
                id: '2',
                name: 'Social Media Cross-Posting',
                description: 'Automatically share blog posts across multiple social media platforms with optimized content.',
                status: 'active',
                trigger: {
                    type: 'event',
                    name: 'New Blog Post',
                    icon: FileVideo,
                    description: 'Triggered when new blog post is published'
                },
                actions: [
                    { id: '1', type: 'social', name: 'Post to Twitter', description: 'Share with hashtags and mentions', icon: Twitter },
                    { id: '2', type: 'social', name: 'Post to LinkedIn', description: 'Professional format with summary', icon: Linkedin },
                    { id: '3', type: 'social', name: 'Post to Facebook', description: 'Engaging post with call-to-action', icon: Facebook },
                    { id: '4', type: 'analytics', name: 'Track Performance', description: 'Monitor engagement across platforms', icon: BarChart3 }
                ],
                metrics: {
                    executions: 89,
                    successRate: 94.2,
                    avgExecutionTime: '45s',
                    lastRun: '2024-01-24T14:15:00Z'
                },
                created: '2024-01-15',
                updated: '2024-01-22',
                author: 'Mike Chen',
                tags: ['social-media', 'content-distribution', 'cross-platform'],
                category: 'Social Media',
                priority: 'medium'
            },
            {
                id: '3',
                name: 'Lead Scoring & Segmentation',
                description: 'Intelligent lead scoring based on behavior and automatic segmentation for targeted campaigns.',
                status: 'active',
                trigger: {
                    type: 'condition',
                    name: 'User Activity',
                    icon: Activity,
                    description: 'Based on user engagement and behavior patterns'
                },
                actions: [
                    { id: '1', type: 'analytics', name: 'Calculate Score', description: 'Behavior-based lead scoring', icon: Gauge },
                    { id: '2', type: 'condition', name: 'Check Score Threshold', description: 'Evaluate lead quality', icon: CheckCircle },
                    { id: '3', type: 'segmentation', name: 'Assign to Segment', description: 'Auto-segment based on score', icon: Users },
                    { id: '4', type: 'notification', name: 'Notify Sales Team', description: 'Alert for high-value leads', icon: Bell }
                ],
                metrics: {
                    executions: 3456,
                    successRate: 96.8,
                    avgExecutionTime: '1.2s',
                    lastRun: '2024-01-25T16:45:00Z'
                },
                created: '2024-01-08',
                updated: '2024-01-24',
                author: 'Alex Rivera',
                tags: ['lead-scoring', 'segmentation', 'sales-automation'],
                category: 'Lead Management',
                priority: 'high'
            },
            {
                id: '4',
                name: 'Abandoned Cart Recovery',
                description: 'Multi-step recovery sequence for abandoned shopping carts with personalized offers.',
                status: 'active',
                trigger: {
                    type: 'event',
                    name: 'Cart Abandoned',
                    icon: ShoppingCart,
                    description: 'When user leaves items in cart for 30 minutes'
                },
                actions: [
                    { id: '1', type: 'delay', name: 'Wait 1 Hour', description: 'Initial delay before first contact', icon: Timer },
                    { id: '2', type: 'email', name: 'Reminder Email', description: 'Gentle cart reminder with product images', icon: Mail },
                    { id: '3', type: 'delay', name: 'Wait 24 Hours', description: 'Extended delay for second attempt', icon: Timer },
                    { id: '4', type: 'email', name: 'Discount Offer', description: '10% discount to encourage purchase', icon: Tag },
                    { id: '5', type: 'delay', name: 'Wait 48 Hours', description: 'Final delay before last attempt', icon: Timer },
                    { id: '6', type: 'email', name: 'Final Reminder', description: 'Last chance with urgency messaging', icon: Mail }
                ],
                metrics: {
                    executions: 567,
                    successRate: 89.7,
                    avgExecutionTime: '3.1s',
                    lastRun: '2024-01-25T09:20:00Z'
                },
                created: '2024-01-12',
                updated: '2024-01-23',
                author: 'Emma Davis',
                tags: ['ecommerce', 'cart-recovery', 'conversion'],
                category: 'E-commerce',
                priority: 'high'
            },
            {
                id: '5',
                name: 'Content Performance Monitoring',
                description: 'Monitor content performance and automatically promote high-performing posts.',
                status: 'paused',
                trigger: {
                    type: 'time',
                    name: 'Daily Check',
                    icon: Clock,
                    description: 'Runs daily at 9 AM to analyze content performance'
                },
                actions: [
                    { id: '1', type: 'analytics', name: 'Analyze Performance', description: 'Check engagement metrics', icon: BarChart3 },
                    { id: '2', type: 'condition', name: 'Check Thresholds', description: 'Identify high-performing content', icon: TrendingUp },
                    { id: '3', type: 'social', name: 'Boost on Social', description: 'Increase promotion budget', icon: Zap },
                    { id: '4', type: 'notification', name: 'Send Report', description: 'Weekly performance summary', icon: Mail }
                ],
                metrics: {
                    executions: 45,
                    successRate: 92.1,
                    avgExecutionTime: '15s',
                    lastRun: '2024-01-20T09:00:00Z'
                },
                created: '2024-01-05',
                updated: '2024-01-18',
                author: 'David Park',
                tags: ['content-analysis', 'performance', 'automation'],
                category: 'Content Marketing',
                priority: 'medium'
            },
            {
                id: '6',
                name: 'Customer Feedback Collection',
                description: 'Automated feedback collection system with follow-up actions based on responses.',
                status: 'draft',
                trigger: {
                    type: 'event',
                    name: 'Purchase Complete',
                    icon: CheckCircle,
                    description: 'Triggered after successful purchase completion'
                },
                actions: [
                    { id: '1', type: 'delay', name: 'Wait 3 Days', description: 'Allow time for product experience', icon: Timer },
                    { id: '2', type: 'email', name: 'Feedback Request', description: 'Send satisfaction survey', icon: MessageSquare },
                    { id: '3', type: 'condition', name: 'Check Response', description: 'Analyze feedback sentiment', icon: Heart },
                    { id: '4', type: 'email', name: 'Follow-up Action', description: 'Thank you or issue resolution', icon: Mail }
                ],
                metrics: {
                    executions: 0,
                    successRate: 0,
                    avgExecutionTime: '0s',
                    lastRun: 'Never'
                },
                created: '2024-01-22',
                updated: '2024-01-24',
                author: 'Lisa Wong',
                tags: ['feedback', 'customer-service', 'post-purchase'],
                category: 'Customer Experience',
                priority: 'low'
            }
        ]);

        setTemplates([
            {
                id: '1',
                name: 'Email Drip Campaign',
                description: 'Multi-step email sequence for lead nurturing',
                category: 'Email Marketing',
                complexity: 'simple',
                usageCount: 234,
                rating: 4.8,
                estimatedTime: '15 min',
                triggers: ['New Subscriber', 'Form Submission'],
                actions: ['Send Email', 'Add Delay', 'Tag Contact']
            },
            {
                id: '2',
                name: 'Social Media Scheduler',
                description: 'Automated social media posting across platforms',
                category: 'Social Media',
                complexity: 'medium',
                usageCount: 189,
                rating: 4.6,
                estimatedTime: '25 min',
                triggers: ['Time-based', 'Content Published'],
                actions: ['Post to Social', 'Track Analytics', 'Generate Report']
            },
            {
                id: '3',
                name: 'Lead Qualification',
                description: 'Intelligent lead scoring and routing system',
                category: 'Lead Management',
                complexity: 'advanced',
                usageCount: 156,
                rating: 4.9,
                estimatedTime: '45 min',
                triggers: ['Lead Capture', 'Behavior Tracking'],
                actions: ['Score Lead', 'Route to Sales', 'Update CRM']
            },
            {
                id: '4',
                name: 'Customer Onboarding',
                description: 'Complete customer onboarding workflow',
                category: 'Customer Experience',
                complexity: 'medium',
                usageCount: 123,
                rating: 4.7,
                estimatedTime: '35 min',
                triggers: ['New Customer', 'Trial Started'],
                actions: ['Send Welcome', 'Schedule Demo', 'Track Progress']
            }
        ]);

        setLoading(false);
    };

    const getStatusColor = (status: AutomationWorkflow['status']) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'error': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getComplexityColor = (complexity: AutomationTemplate['complexity']) => {
        switch (complexity) {
            case 'simple': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'advanced': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const filteredWorkflows = workflows.filter(workflow => {
        const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            workflow.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || workflow.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const sortedWorkflows = [...filteredWorkflows].sort((a, b) => {
        const aValue = a[sortBy as keyof AutomationWorkflow];
        const bValue = b[sortBy as keyof AutomationWorkflow];

        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    const toggleWorkflowSelection = (workflowId: string) => {
        setSelectedWorkflows(prev =>
            prev.includes(workflowId)
                ? prev.filter(id => id !== workflowId)
                : [...prev, workflowId]
        );
    };

    const selectAllWorkflows = () => {
        if (selectedWorkflows.length === sortedWorkflows.length) {
            setSelectedWorkflows([]);
        } else {
            setSelectedWorkflows(sortedWorkflows.map(w => w.id));
        }
    };

    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.status === 'active').length;
    const totalExecutions = workflows.reduce((sum, w) => sum + w.metrics.executions, 0);
    const avgSuccessRate = workflows.reduce((sum, w) => sum + w.metrics.successRate, 0) / workflows.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Enhanced Header */}
            <header className="bg-white/90 backdrop-blur-lg border-b border-purple-100/50 sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Marketing Automation
                                    </h1>
                                    <p className="text-sm text-gray-600">Automate your marketing workflows and campaigns</p>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center space-x-6 ml-8">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{totalWorkflows}</p>
                                    <p className="text-xs text-gray-600">Total Workflows</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{activeWorkflows}</p>
                                    <p className="text-xs text-gray-600">Active</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{totalExecutions.toLocaleString()}</p>
                                    <p className="text-xs text-gray-600">Executions</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{avgSuccessRate.toFixed(1)}%</p>
                                    <p className="text-xs text-gray-600">Success Rate</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Workflow</span>
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <nav className="flex space-x-1 bg-gray-100/50 rounded-xl p-1">
                        {[
                            { id: 'workflows', label: 'Workflows', icon: Workflow },
                            { id: 'templates', label: 'Templates', icon: Layout },
                            { id: 'triggers', label: 'Triggers', icon: Zap },
                            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                            { id: 'settings', label: 'Settings', icon: Settings }
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

            {/* Main Content - Workflows Tab */}
            <main className="p-6">
                {selectedTab === 'workflows' && (
                    <div className="space-y-6">
                        {/* Filters and Controls */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50">
                            <div className="flex flex-wrap items-center gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search workflows..."
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
                                    <option value="draft">Draft</option>
                                    <option value="error">Error</option>
                                </select>

                                {/* Category Filter */}
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="Email Marketing">Email Marketing</option>
                                    <option value="Social Media">Social Media</option>
                                    <option value="Lead Management">Lead Management</option>
                                    <option value="E-commerce">E-commerce</option>
                                    <option value="Content Marketing">Content Marketing</option>
                                    <option value="Customer Experience">Customer Experience</option>
                                </select>

                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
                                >
                                    <option value="updated">Last Updated</option>
                                    <option value="created">Created Date</option>
                                    <option value="name">Name</option>
                                    <option value="metrics.executions">Executions</option>
                                    <option value="metrics.successRate">Success Rate</option>
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
                                    {selectedWorkflows.length > 0 && `${selectedWorkflows.length} selected • `}
                                    {sortedWorkflows.length} workflows
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
                        {selectedWorkflows.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-100/50 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">
                                        {selectedWorkflows.length} workflow{selectedWorkflows.length > 1 ? 's' : ''} selected
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors flex items-center space-x-1">
                                            <PlayCircle className="w-3 h-3" />
                                            <span>Start</span>
                                        </button>
                                        <button className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors flex items-center space-x-1">
                                            <PauseCircle className="w-3 h-3" />
                                            <span>Pause</span>
                                        </button>
                                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-1">
                                            <Copy className="w-3 h-3" />
                                            <span>Duplicate</span>
                                        </button>
                                        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-1">
                                            <Download className="w-3 h-3" />
                                            <span>Export</span>
                                        </button>
                                        <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-1">
                                            <Trash2 className="w-3 h-3" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Workflows Grid/List */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50">
                            <div className="p-6 border-b border-purple-100/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedWorkflows.length === sortedWorkflows.length}
                                            onChange={selectAllWorkflows}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Automation Workflows ({sortedWorkflows.length})
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
                                                <div className={viewMode === 'grid' ? 'h-80 bg-gray-200 rounded-lg' : 'h-32 bg-gray-200 rounded-lg'}></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : sortedWorkflows.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
                                        <p className="text-gray-600 mb-4">Create your first automation workflow to get started.</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                                        >
                                            Create Workflow
                                        </button>
                                    </div>
                                ) : viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {sortedWorkflows.map((workflow, index) => {
                                            const isSelected = selectedWorkflows.includes(workflow.id);
                                            const TriggerIcon = workflow.trigger.icon;

                                            return (
                                                <motion.div
                                                    key={workflow.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`border rounded-xl hover:shadow-lg transition-all cursor-pointer ${isSelected ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 bg-white/50'
                                                        }`}
                                                    onClick={() => toggleWorkflowSelection(workflow.id)}
                                                >
                                                    <div className="p-6">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleWorkflowSelection(workflow.id)}
                                                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                <div>
                                                                    <h3 className="font-semibold text-gray-900 mb-1">{workflow.name}</h3>
                                                                    <p className="text-sm text-gray-600">{workflow.description}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(workflow.status)}`}>
                                                                    {workflow.status}
                                                                </span>
                                                                <button
                                                                    className="p-1 text-gray-600 hover:text-gray-800 rounded transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Trigger */}
                                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <TriggerIcon className="w-4 h-4 text-purple-600" />
                                                                <span className="text-sm font-medium text-gray-900">Trigger: {workflow.trigger.name}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-600">{workflow.trigger.description}</p>
                                                        </div>

                                                        {/* Actions Flow */}
                                                        <div className="mb-4">
                                                            <p className="text-sm font-medium text-gray-900 mb-2">Actions ({workflow.actions.length})</p>
                                                            <div className="flex items-center space-x-1 overflow-x-auto pb-2">
                                                                {workflow.actions.slice(0, 4).map((action, idx) => {
                                                                    const ActionIcon = action.icon;
                                                                    return (
                                                                        <div key={action.id} className="flex items-center space-x-1 flex-shrink-0">
                                                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                                                <ActionIcon className="w-4 h-4 text-purple-600" />
                                                                            </div>
                                                                            {idx < Math.min(workflow.actions.length - 1, 3) && (
                                                                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                                {workflow.actions.length > 4 && (
                                                                    <span className="text-xs text-gray-600 ml-2">+{workflow.actions.length - 4} more</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Metrics */}
                                                        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                                <p className="font-semibold text-gray-900">{workflow.metrics.executions.toLocaleString()}</p>
                                                                <p className="text-gray-600">Executions</p>
                                                            </div>
                                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                                <p className="font-semibold text-gray-900">{workflow.metrics.successRate}%</p>
                                                                <p className="text-gray-600">Success Rate</p>
                                                            </div>
                                                        </div>

                                                        {/* Tags */}
                                                        <div className="flex flex-wrap gap-1 mb-4">
                                                            {workflow.tags.slice(0, 2).map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {workflow.tags.length > 2 && (
                                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                                                                    +{workflow.tags.length - 2}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Footer */}
                                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-xs text-gray-600">
                                                            <span>by {workflow.author}</span>
                                                            <span>Updated {new Date(workflow.updated).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sortedWorkflows.map((workflow, index) => {
                                            const isSelected = selectedWorkflows.includes(workflow.id);
                                            const TriggerIcon = workflow.trigger.icon;

                                            return (
                                                <motion.div
                                                    key={workflow.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${isSelected ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 bg-white/50'
                                                        }`}
                                                    onClick={() => toggleWorkflowSelection(workflow.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleWorkflowSelection(workflow.id)}
                                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />

                                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                                <TriggerIcon className="w-6 h-6 text-purple-600" />
                                                            </div>

                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-3 mb-1">
                                                                    <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(workflow.status)}`}>
                                                                        {workflow.status}
                                                                    </span>
                                                                    <span className="text-xs text-gray-600">{workflow.category}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                                                                <div className="flex items-center space-x-4 text-xs text-gray-600">
                                                                    <span>{workflow.metrics.executions.toLocaleString()} executions</span>
                                                                    <span>{workflow.metrics.successRate}% success</span>
                                                                    <span>{workflow.actions.length} actions</span>
                                                                    <span>by {workflow.author}</span>
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Automation Templates</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {templates.map((template, index) => (
                                    <motion.div
                                        key={template.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="border border-gray-200 rounded-xl hover:shadow-lg transition-all cursor-pointer bg-white/50"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs text-purple-600 font-medium">{template.category}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-xs font-medium ${getComplexityColor(template.complexity)}`}>
                                                        {template.complexity}
                                                    </span>
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                        <span className="text-xs text-gray-600">{template.rating}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                                            <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                                            <div className="space-y-2 mb-4">
                                                <div className="text-xs text-gray-600">
                                                    <span className="font-medium">Triggers:</span> {template.triggers.join(', ')}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    <span className="font-medium">Actions:</span> {template.actions.join(', ')}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                                                <span>{template.usageCount} uses</span>
                                                <span>~{template.estimatedTime}</span>
                                            </div>

                                            <button className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm">
                                                Use Template
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Other tabs placeholder */}
                {!['workflows', 'templates'].includes(selectedTab) && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Feature
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Advanced {selectedTab} functionality will be implemented in the next phase.
                        </p>
                        <p className="text-sm text-gray-500">
                            Coming soon with comprehensive automation tools.
                        </p>
                    </div>
                )}
            </main>

            {/* Create Workflow Modal (Placeholder) */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Create Automation Workflow</h3>
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
                                <Workflow className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Workflow Builder</h4>
                                <p className="text-gray-600 mb-4">
                                    Advanced workflow creation wizard will be implemented in the next development phase.
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
                                <Zap className="w-6 h-6 text-purple-600" />
                                <span className="font-bold text-gray-900">Automation Hub</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Powerful marketing automation platform for creating intelligent workflows and campaigns.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Automation</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Email Workflows</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Social Media</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Lead Management</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">E-commerce</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Workflow Builder</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Template Library</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Analytics Dashboard</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">API Integrations</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Tutorials</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Community</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Help Center</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-purple-100/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-600">
                            © 2024 MarketAI Automation Hub by CODAI. All rights reserved.
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
