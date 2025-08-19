'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    FileText,
    Calendar,
    Filter,
    Search,
    Download,
    Share2,
    Plus,
    Edit,
    Trash2,
    Eye,
    Clock,
    BarChart3,
    PieChart,
    LineChart,
    TrendingUp,
    Users,
    DollarSign,
    Target,
    Activity,
    RefreshCw,
    Settings,
    ChevronDown,
    Star,
    BookOpen,
    Send,
    Archive
} from 'lucide-react'

// TypeScript interfaces for reports data
interface Report {
    id: string
    name: string
    description: string
    type: 'sales' | 'users' | 'performance' | 'financial' | 'custom'
    status: 'active' | 'scheduled' | 'draft' | 'archived'
    lastGenerated: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
    recipients: number
    size: string
    format: 'pdf' | 'excel' | 'csv' | 'dashboard'
    views: number
    favorite: boolean
}

interface ReportTemplate {
    id: string
    name: string
    description: string
    category: 'business' | 'financial' | 'marketing' | 'operations'
    metrics: string[]
    complexity: 'simple' | 'intermediate' | 'advanced'
    estimatedTime: string
}

interface RecentGeneration {
    id: string
    reportName: string
    generatedAt: string
    status: 'completed' | 'processing' | 'failed'
    recipient: string
    size: string
    downloadUrl?: string
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('lastGenerated')
    const [filterType, setFilterType] = useState('all')

    const [reports] = useState<Report[]>([
        {
            id: '1',
            name: 'Monthly Sales Report',
            description: 'Comprehensive sales performance analysis with revenue trends and conversion metrics',
            type: 'sales',
            status: 'active',
            lastGenerated: '2 hours ago',
            frequency: 'monthly',
            recipients: 8,
            size: '2.4 MB',
            format: 'pdf',
            views: 47,
            favorite: true
        },
        {
            id: '2',
            name: 'User Engagement Analytics',
            description: 'Detailed user behavior analysis including session duration and page views',
            type: 'users',
            status: 'active',
            lastGenerated: '1 day ago',
            frequency: 'weekly',
            recipients: 12,
            size: '1.8 MB',
            format: 'dashboard',
            views: 89,
            favorite: false
        },
        {
            id: '3',
            name: 'Financial Performance Dashboard',
            description: 'Real-time financial metrics with revenue, expenses, and profit analysis',
            type: 'financial',
            status: 'scheduled',
            lastGenerated: '3 days ago',
            frequency: 'daily',
            recipients: 5,
            size: '3.1 MB',
            format: 'excel',
            views: 156,
            favorite: true
        },
        {
            id: '4',
            name: 'Marketing Campaign ROI',
            description: 'Campaign performance metrics with conversion rates and cost analysis',
            type: 'performance',
            status: 'draft',
            lastGenerated: '1 week ago',
            frequency: 'custom',
            recipients: 6,
            size: '1.2 MB',
            format: 'pdf',
            views: 23,
            favorite: false
        },
        {
            id: '5',
            name: 'Custom Analytics Report',
            description: 'Tailored report with specific KPIs and custom date ranges',
            type: 'custom',
            status: 'active',
            lastGenerated: '5 hours ago',
            frequency: 'weekly',
            recipients: 15,
            size: '4.2 MB',
            format: 'csv',
            views: 78,
            favorite: true
        }
    ])

    const [reportTemplates] = useState<ReportTemplate[]>([
        {
            id: '1',
            name: 'Executive Summary',
            description: 'High-level business metrics for leadership team',
            category: 'business',
            metrics: ['Revenue', 'Users', 'Conversion Rate', 'Growth Rate'],
            complexity: 'simple',
            estimatedTime: '5 minutes'
        },
        {
            id: '2',
            name: 'Financial Analysis',
            description: 'Comprehensive financial performance with detailed breakdowns',
            category: 'financial',
            metrics: ['Revenue', 'Expenses', 'Profit Margin', 'Cash Flow', 'ROI'],
            complexity: 'advanced',
            estimatedTime: '15 minutes'
        },
        {
            id: '3',
            name: 'Marketing Performance',
            description: 'Campaign effectiveness and marketing funnel analysis',
            category: 'marketing',
            metrics: ['Impressions', 'CTR', 'CPC', 'Conversions', 'ROAS'],
            complexity: 'intermediate',
            estimatedTime: '10 minutes'
        },
        {
            id: '4',
            name: 'Operations Dashboard',
            description: 'Operational efficiency and performance indicators',
            category: 'operations',
            metrics: ['Productivity', 'Quality Score', 'Response Time', 'SLA'],
            complexity: 'intermediate',
            estimatedTime: '8 minutes'
        }
    ])

    const [recentGenerations] = useState<RecentGeneration[]>([
        {
            id: '1',
            reportName: 'Monthly Sales Report',
            generatedAt: '2 hours ago',
            status: 'completed',
            recipient: 'team@company.com',
            size: '2.4 MB',
            downloadUrl: '/downloads/report-1'
        },
        {
            id: '2',
            reportName: 'User Engagement Analytics',
            generatedAt: '1 day ago',
            status: 'completed',
            recipient: 'analytics@company.com',
            size: '1.8 MB',
            downloadUrl: '/downloads/report-2'
        },
        {
            id: '3',
            reportName: 'Financial Performance Dashboard',
            generatedAt: '6 hours ago',
            status: 'processing',
            recipient: 'finance@company.com',
            size: 'Processing...'
        },
        {
            id: '4',
            reportName: 'Custom Analytics Report',
            generatedAt: '2 days ago',
            status: 'failed',
            recipient: 'admin@company.com',
            size: 'Failed'
        }
    ])

    const getReportTypeIcon = (type: string) => {
        switch (type) {
            case 'sales': return <DollarSign className="w-5 h-5 text-green-500" />
            case 'users': return <Users className="w-5 h-5 text-blue-500" />
            case 'performance': return <TrendingUp className="w-5 h-5 text-purple-500" />
            case 'financial': return <BarChart3 className="w-5 h-5 text-orange-500" />
            case 'custom': return <Target className="w-5 h-5 text-indigo-500" />
            default: return <FileText className="w-5 h-5 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700'
            case 'scheduled': return 'bg-blue-100 text-blue-700'
            case 'draft': return 'bg-yellow-100 text-yellow-700'
            case 'archived': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getGenerationStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100'
            case 'processing': return 'text-yellow-600 bg-yellow-100'
            case 'failed': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'simple': return 'text-green-600 bg-green-100'
            case 'intermediate': return 'text-yellow-600 bg-yellow-100'
            case 'advanced': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'all' || report.type === filterType
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'favorites' && report.favorite) ||
            (activeTab === 'active' && report.status === 'active') ||
            (activeTab === 'scheduled' && report.status === 'scheduled')

        return matchesSearch && matchesType && matchesTab
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-6 shadow-xl"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                                    <p className="text-blue-100">Generate and manage comprehensive business reports</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>New Report</span>
                            </button>
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Total Reports</div>
                                <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
                            </div>
                            <FileText className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Active Reports</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {reports.filter(r => r.status === 'active').length}
                                </div>
                            </div>
                            <Activity className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Scheduled</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {reports.filter(r => r.status === 'scheduled').length}
                                </div>
                            </div>
                            <Clock className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Total Views</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {reports.reduce((sum, r) => sum + r.views, 0)}
                                </div>
                            </div>
                            <Eye className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Reports List */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
                            {/* Tabs */}
                            <div className="border-b border-gray-200">
                                <div className="flex space-x-1 p-1">
                                    {[
                                        { id: 'all', label: 'All Reports', count: reports.length },
                                        { id: 'favorites', label: 'Favorites', count: reports.filter(r => r.favorite).length },
                                        { id: 'active', label: 'Active', count: reports.filter(r => r.status === 'active').length },
                                        { id: 'scheduled', label: 'Scheduled', count: reports.filter(r => r.status === 'scheduled').length }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                                }`}
                                        >
                                            <span>{tab.label}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.id
                                                    ? 'bg-white text-blue-600'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filters and Search */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search reports..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="sales">Sales</option>
                                            <option value="users">Users</option>
                                            <option value="performance">Performance</option>
                                            <option value="financial">Financial</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="lastGenerated">Last Generated</option>
                                            <option value="name">Name</option>
                                            <option value="views">Views</option>
                                            <option value="type">Type</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Reports Grid */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {filteredReports.map((report) => (
                                        <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4 flex-1">
                                                    <div className="p-3 bg-gray-100 rounded-lg">
                                                        {getReportTypeIcon(report.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <h3 className="font-semibold text-gray-900">{report.name}</h3>
                                                            {report.favorite && (
                                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                            )}
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                                                {report.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>Last generated: {report.lastGenerated}</span>
                                                            <span>•</span>
                                                            <span>{report.frequency} frequency</span>
                                                            <span>•</span>
                                                            <span>{report.recipients} recipients</span>
                                                            <span>•</span>
                                                            <span>{report.views} views</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                                                        <Share2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        {/* Quick Actions */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2">
                                    <Plus className="w-4 h-4" />
                                    <span>Create Report</span>
                                </button>
                                <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center space-x-2">
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Refresh All</span>
                                </button>
                                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2">
                                    <Archive className="w-4 h-4" />
                                    <span>Manage Archive</span>
                                </button>
                            </div>
                        </div>

                        {/* Report Templates */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates</h3>
                            <div className="space-y-3">
                                {reportTemplates.slice(0, 3).map((template) => (
                                    <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getComplexityColor(template.complexity)}`}>
                                                {template.complexity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                                        <div className="text-xs text-gray-500">{template.estimatedTime}</div>
                                    </div>
                                ))}
                                <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium py-2">
                                    View All Templates
                                </button>
                            </div>
                        </div>

                        {/* Recent Generations */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Generations</h3>
                            <div className="space-y-3">
                                {recentGenerations.slice(0, 4).map((generation) => (
                                    <div key={generation.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{generation.reportName}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs text-gray-500">{generation.generatedAt}</p>
                                                <span className={`px-2 py-1 rounded-full text-xs ${getGenerationStatusColor(generation.status)}`}>
                                                    {generation.status}
                                                </span>
                                            </div>
                                        </div>
                                        {generation.downloadUrl && (
                                            <button className="text-blue-600 hover:text-blue-700">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
