import React from 'react'
/**
 * Reports Page - Comprehensive Analytics and Reporting Dashboard
 * Final page for ControlAI Dashboard with advanced reporting capabilities
 */
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FileText, Download, Calendar, Filter, TrendingUp, TrendingDown,
    Users, Target, Clock, Activity, BarChart3, PieChart, LineChart,
    Settings, Share, Mail, Printer, Eye, Edit, Trash2, Plus,
    ChevronDown, ChevronRight, RefreshCw, AlertCircle, CheckCircle,
    Star, Bookmark, Search, Grid, List, ExternalLink, Database,
    Zap, Shield, Globe, Code, MessageSquare, GitBranch
} from 'lucide-react'

interface Report {
    id: string
    name: string
    description: string
    category: 'performance' | 'analytics' | 'security' | 'operations' | 'custom'
    type: 'scheduled' | 'on-demand' | 'real-time'
    status: 'generating' | 'ready' | 'error' | 'scheduled'
    createdAt: string
    lastGenerated?: string
    nextScheduled?: string
    size?: string
    author: string
    recipients?: string[]
    tags: string[]
    metrics: {
        views: number
        downloads: number
        shares: number
    }
    config: {
        frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly'
        format: 'pdf' | 'excel' | 'csv' | 'json'
        autoSend: boolean
    }
}

interface ReportTemplate {
    id: string
    name: string
    description: string
    category: string
    icon: string
    metrics: string[]
    estimatedTime: string
    popularity: number
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'templates' | 'scheduled'>('overview')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'downloads' | 'status'>('date')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    const [reports, setReports] = useState<Report[]>([
        {
            id: 'agent-performance',
            name: 'Agent Performance Report',
            description: 'Comprehensive analysis of AI agent performance metrics and efficiency',
            category: 'performance',
            type: 'scheduled',
            status: 'ready',
            createdAt: '2025-08-01',
            lastGenerated: '2025-08-07 08:00',
            nextScheduled: '2025-08-14 08:00',
            size: '2.4 MB',
            author: 'System Admin',
            recipients: ['admin@controlai.com', 'metrics@controlai.com'],
            tags: ['agents', 'performance', 'weekly'],
            metrics: { views: 156, downloads: 42, shares: 8 },
            config: { frequency: 'weekly', format: 'pdf', autoSend: true }
        },
        {
            id: 'task-analytics',
            name: 'Task Completion Analytics',
            description: 'Detailed breakdown of task completion rates, bottlenecks, and optimization opportunities',
            category: 'analytics',
            type: 'on-demand',
            status: 'generating',
            createdAt: '2025-08-06',
            author: 'Analytics Team',
            tags: ['tasks', 'productivity', 'optimization'],
            metrics: { views: 89, downloads: 23, shares: 4 },
            config: { format: 'excel', autoSend: false }
        },
        {
            id: 'security-audit',
            name: 'Security Audit Report',
            description: 'Monthly security assessment including vulnerability scans and compliance checks',
            category: 'security',
            type: 'scheduled',
            status: 'ready',
            createdAt: '2025-07-15',
            lastGenerated: '2025-08-01 09:00',
            nextScheduled: '2025-09-01 09:00',
            size: '5.1 MB',
            author: 'Security Team',
            recipients: ['security@controlai.com', 'compliance@controlai.com'],
            tags: ['security', 'compliance', 'monthly'],
            metrics: { views: 234, downloads: 67, shares: 15 },
            config: { frequency: 'monthly', format: 'pdf', autoSend: true }
        },
        {
            id: 'integration-health',
            name: 'Integration Health Dashboard',
            description: 'Real-time monitoring of all connected services and API performance',
            category: 'operations',
            type: 'real-time',
            status: 'ready',
            createdAt: '2025-08-05',
            lastGenerated: '2025-08-07 14:30',
            size: '1.8 MB',
            author: 'DevOps Team',
            tags: ['integrations', 'monitoring', 'real-time'],
            metrics: { views: 345, downloads: 89, shares: 22 },
            config: { format: 'json', autoSend: false }
        },
        {
            id: 'custom-metrics',
            name: 'Custom Business Metrics',
            description: 'Tailored report combining business KPIs with technical performance indicators',
            category: 'custom',
            type: 'on-demand',
            status: 'error',
            createdAt: '2025-08-04',
            author: 'Business Intelligence',
            tags: ['custom', 'kpi', 'business'],
            metrics: { views: 67, downloads: 12, shares: 2 },
            config: { format: 'excel', autoSend: false }
        },
        {
            id: 'team-productivity',
            name: 'Team Productivity Analysis',
            description: 'Weekly analysis of team collaboration, task distribution, and efficiency metrics',
            category: 'analytics',
            type: 'scheduled',
            status: 'scheduled',
            createdAt: '2025-07-20',
            nextScheduled: '2025-08-08 10:00',
            author: 'HR Analytics',
            recipients: ['hr@controlai.com', 'managers@controlai.com'],
            tags: ['teams', 'productivity', 'collaboration'],
            metrics: { views: 198, downloads: 54, shares: 11 },
            config: { frequency: 'weekly', format: 'pdf', autoSend: true }
        }
    ])

    const [templates, setTemplates] = useState<ReportTemplate[]>([
        {
            id: 'agent-overview',
            name: 'Agent Performance Overview',
            description: 'Standard template for agent performance analysis',
            category: 'Performance',
            icon: '🤖',
            metrics: ['Response Time', 'Accuracy Rate', 'Task Completion', 'Error Rate'],
            estimatedTime: '5 minutes',
            popularity: 95
        },
        {
            id: 'security-standard',
            name: 'Security Assessment',
            description: 'Comprehensive security audit and compliance report',
            category: 'Security',
            icon: '🔒',
            metrics: ['Vulnerability Count', 'Compliance Score', 'Risk Level', 'Patch Status'],
            estimatedTime: '15 minutes',
            popularity: 87
        },
        {
            id: 'analytics-deep',
            name: 'Deep Analytics Dive',
            description: 'Detailed analytics with custom metrics and insights',
            category: 'Analytics',
            icon: '📊',
            metrics: ['User Engagement', 'Conversion Rates', 'Trend Analysis', 'Predictions'],
            estimatedTime: '10 minutes',
            popularity: 92
        },
        {
            id: 'operations-health',
            name: 'Operations Health Check',
            description: 'System health, performance, and operational metrics',
            category: 'Operations',
            icon: '⚙️',
            metrics: ['Uptime', 'Response Time', 'Error Rates', 'Resource Usage'],
            estimatedTime: '8 minutes',
            popularity: 78
        },
        {
            id: 'financial-summary',
            name: 'Financial Performance',
            description: 'Cost analysis, ROI calculations, and budget tracking',
            category: 'Finance',
            icon: '💰',
            metrics: ['Cost per Task', 'ROI', 'Budget Utilization', 'Cost Trends'],
            estimatedTime: '12 minutes',
            popularity: 84
        },
        {
            id: 'compliance-audit',
            name: 'Compliance Audit',
            description: 'Regulatory compliance and audit trail documentation',
            category: 'Compliance',
            icon: '📋',
            metrics: ['Compliance Score', 'Audit Trail', 'Policy Adherence', 'Risk Assessment'],
            estimatedTime: '20 minutes',
            popularity: 71
        }
    ])

    const categories = [
        { id: 'all', label: 'All Reports', count: reports.length },
        { id: 'performance', label: 'Performance', count: reports.filter(r => r.category === 'performance').length },
        { id: 'analytics', label: 'Analytics', count: reports.filter(r => r.category === 'analytics').length },
        { id: 'security', label: 'Security', count: reports.filter(r => r.category === 'security').length },
        { id: 'operations', label: 'Operations', count: reports.filter(r => r.category === 'operations').length },
        { id: 'custom', label: 'Custom', count: reports.filter(r => r.category === 'custom').length }
    ]

    const statusOptions = [
        { id: 'all', label: 'All Status' },
        { id: 'ready', label: 'Ready' },
        { id: 'generating', label: 'Generating' },
        { id: 'scheduled', label: 'Scheduled' },
        { id: 'error', label: 'Error' }
    ]

    const filteredReports = reports.filter(report => {
        const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus
        const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesCategory && matchesStatus && matchesSearch
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready': return 'text-green-600 dark:text-green-400'
            case 'generating': return 'text-blue-600 dark:text-blue-400'
            case 'scheduled': return 'text-orange-600 dark:text-orange-400'
            case 'error': return 'text-red-600 dark:text-red-400'
            default: return 'text-gray-600 dark:text-gray-400'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ready': return CheckCircle
            case 'generating': return RefreshCw
            case 'scheduled': return Clock
            case 'error': return AlertCircle
            default: return Clock
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ready': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            case 'generating': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            case 'scheduled': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
            case 'error': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'performance': return Activity
            case 'analytics': return BarChart3
            case 'security': return Shield
            case 'operations': return Settings
            case 'custom': return Star
            default: return FileText
        }
    }

    const readyReports = reports.filter(r => r.status === 'ready').length
    const totalDownloads = reports.reduce((sum, r) => sum + r.metrics.downloads, 0)
    const scheduledReports = reports.filter(r => r.status === 'scheduled').length

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-green-900/20">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Reports & Analytics
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Generate, schedule, and manage comprehensive reports
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>New Report</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <Download className="w-4 h-4" />
                                <span>Export All</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100">Ready Reports</p>
                                    <p className="text-2xl font-bold">{readyReports}</p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100">Total Downloads</p>
                                    <p className="text-2xl font-bold">{totalDownloads}</p>
                                </div>
                                <Download className="w-8 h-8 text-green-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100">Scheduled</p>
                                    <p className="text-2xl font-bold">{scheduledReports}</p>
                                </div>
                                <Calendar className="w-8 h-8 text-purple-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100">Templates</p>
                                    <p className="text-2xl font-bold">{templates.length}</p>
                                </div>
                                <Settings className="w-8 h-8 text-orange-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'reports', label: 'My Reports', icon: FileText },
                            { id: 'templates', label: 'Templates', icon: Grid },
                            { id: 'scheduled', label: 'Scheduled', icon: Calendar }
                        ].map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Recent Reports */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                    <TrendingUp className="w-6 h-6 mr-3 text-green-500" />
                                    Recent Reports
                                </h3>

                                <div className="space-y-4">
                                    {reports.slice(0, 5).map((report) => {
                                        const StatusIcon = getStatusIcon(report.status)
                                        const CategoryIcon = getCategoryIcon(report.category)
                                        return (
                                            <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <CategoryIcon className="w-5 h-5 text-blue-500" />
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {report.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {report.lastGenerated || report.createdAt}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {report.metrics.downloads} downloads
                                                    </span>
                                                    <StatusIcon className={`w-4 h-4 ${getStatusColor(report.status)}`} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Popular Templates */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                    <Star className="w-6 h-6 mr-3 text-yellow-500" />
                                    Popular Templates
                                </h3>

                                <div className="space-y-4">
                                    {templates.sort((a, b) => b.popularity - a.popularity).slice(0, 5).map((template) => (
                                        <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xl">{template.icon}</span>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {template.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {template.category} • {template.estimatedTime}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {template.popularity}% popularity
                                                </div>
                                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                <BarChart3 className="w-6 h-6 mr-3 text-blue-500" />
                                Report Performance
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {reports.reduce((sum, r) => sum + r.metrics.views, 0)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Views</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {totalDownloads}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Downloads</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                        {reports.reduce((sum, r) => sum + r.metrics.shares, 0)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Shares</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                <Zap className="w-6 h-6 mr-3 text-orange-500" />
                                Quick Actions
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all duration-200">
                                    <div className="flex items-center space-x-3">
                                        <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        <div className="text-left">
                                            <div className="font-medium text-blue-900 dark:text-blue-100">New Report</div>
                                            <div className="text-sm text-blue-700 dark:text-blue-300">Create custom report</div>
                                        </div>
                                    </div>
                                </button>

                                <button className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 transition-all duration-200">
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        <div className="text-left">
                                            <div className="font-medium text-green-900 dark:text-green-100">Schedule Report</div>
                                            <div className="text-sm text-green-700 dark:text-green-300">Automate generation</div>
                                        </div>
                                    </div>
                                </button>

                                <button className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transition-all duration-200">
                                    <div className="flex items-center space-x-3">
                                        <Grid className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        <div className="text-left">
                                            <div className="font-medium text-purple-900 dark:text-purple-100">Use Template</div>
                                            <div className="text-sm text-purple-700 dark:text-purple-300">Quick start guide</div>
                                        </div>
                                    </div>
                                </button>

                                <button className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-xl hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 transition-all duration-200">
                                    <div className="flex items-center space-x-3">
                                        <Download className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        <div className="text-left">
                                            <div className="font-medium text-orange-900 dark:text-orange-100">Export Data</div>
                                            <div className="text-sm text-orange-700 dark:text-orange-300">Download reports</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'reports' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Filters and Controls */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search reports..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                </div>

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.label} ({category.count})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    {statusOptions.map(status => (
                                        <option key={status.id} value={status.id}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="date">Sort by Date</option>
                                    <option value="name">Sort by Name</option>
                                    <option value="downloads">Sort by Downloads</option>
                                    <option value="status">Sort by Status</option>
                                </select>
                            </div>
                        </div>

                        {/* Reports Display */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredReports.map((report) => {
                                    const StatusIcon = getStatusIcon(report.status)
                                    const CategoryIcon = getCategoryIcon(report.category)
                                    return (
                                        <motion.div
                                            key={report.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <CategoryIcon className="w-6 h-6 text-blue-500" />
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                                            {report.name}
                                                        </h3>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(report.status)}`}>
                                                            {report.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                                        <Share className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                {report.description}
                                            </p>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                                    <span className="text-gray-900 dark:text-white">{report.createdAt}</span>
                                                </div>

                                                {report.lastGenerated && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500 dark:text-gray-400">Last generated:</span>
                                                        <span className="text-gray-900 dark:text-white">{report.lastGenerated}</span>
                                                    </div>
                                                )}

                                                {report.size && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500 dark:text-gray-400">Size:</span>
                                                        <span className="text-gray-900 dark:text-white">{report.size}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {report.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center space-x-4">
                                                    <span>{report.metrics.views} views</span>
                                                    <span>{report.metrics.downloads} downloads</span>
                                                </div>
                                                <span>{report.config.format.toUpperCase()}</span>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Report
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Created
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Downloads
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredReports.map((report) => {
                                                const StatusIcon = getStatusIcon(report.status)
                                                const CategoryIcon = getCategoryIcon(report.category)
                                                return (
                                                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center space-x-3">
                                                                <CategoryIcon className="w-5 h-5 text-blue-500" />
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {report.name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {report.author}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                                {report.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {report.createdAt}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {report.metrics.downloads}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center space-x-2">
                                                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                                <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
                                                                    <Share className="w-4 h-4" />
                                                                </button>
                                                                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'templates' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Templates Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Report Templates
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Pre-built templates for common reporting needs
                                </p>
                            </div>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>Create Template</span>
                            </button>
                        </div>

                        {/* Templates Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map((template) => (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-3xl">{template.icon}</span>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {template.name}
                                                </h3>
                                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                                    {template.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {template.popularity}%
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {template.description}
                                    </p>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Estimated time:</span>
                                            <span className="text-gray-900 dark:text-white">{template.estimatedTime}</span>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Included metrics:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {template.metrics.map((metric, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                                                    >
                                                        {metric}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                            Preview
                                        </button>
                                        <button className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                            <Plus className="w-3 h-3" />
                                            <span>Use Template</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'scheduled' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Scheduled Reports Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Scheduled Reports
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Automated report generation and delivery
                                </p>
                            </div>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                <Calendar className="w-4 h-4" />
                                <span>Schedule Report</span>
                            </button>
                        </div>

                        {/* Scheduled Reports List */}
                        <div className="space-y-4">
                            {reports.filter(r => r.type === 'scheduled').map((report) => {
                                const StatusIcon = getStatusIcon(report.status)
                                const CategoryIcon = getCategoryIcon(report.category)
                                return (
                                    <div
                                        key={report.id}
                                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <CategoryIcon className="w-6 h-6 text-blue-500" />
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {report.name}
                                                        </h3>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(report.status)}`}>
                                                            {report.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    {report.description}
                                                </p>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {report.config.frequency} • {report.config.format.toUpperCase()}
                                                        </div>
                                                    </div>

                                                    {report.nextScheduled && (
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Next run:</span>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {report.nextScheduled}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {report.recipients && (
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Recipients:</span>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {report.recipients.length} users
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Run now">
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors" title="Edit schedule">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete schedule">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={report.config.autoSend}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Schedule Configuration */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                            <div className="flex items-start space-x-3">
                                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                        Scheduling Best Practices
                                    </h4>
                                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                        <li>• Schedule reports during off-peak hours to minimize system load</li>
                                        <li>• Use appropriate frequencies based on data update cycles</li>
                                        <li>• Configure delivery lists to include only relevant stakeholders</li>
                                        <li>• Set up backup schedules for critical business reports</li>
                                        <li>• Monitor generation times and adjust schedules as needed</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

