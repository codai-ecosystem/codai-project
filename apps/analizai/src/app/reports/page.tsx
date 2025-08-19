'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FileText, Calendar, Download, Share2, Filter, Search, Plus,
    Eye, Edit, Trash2, Clock, CheckCircle, AlertCircle, Play,
    Pause, BarChart3, TrendingUp, Users, Target, Activity,
    Settings, Copy, Archive, RefreshCw, Bookmark, Send
} from 'lucide-react'

// TypeScript interfaces for reports
interface Report {
    id: string
    title: string
    description?: string
    type: 'analytics' | 'performance' | 'financial' | 'operational' | 'custom'
    status: 'completed' | 'generating' | 'scheduled' | 'failed' | 'draft'
    createdAt: string
    updatedAt: string
    generatedAt?: string
    scheduledFor?: string
    author: {
        id: string
        name: string
        avatar?: string
    }
    metrics: {
        pages: number
        charts: number
        dataPoints: number
        fileSize: string
    }
    tags: string[]
    isShared: boolean
    shareUrl?: string
    downloadCount: number
    lastAccessed?: string
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    recipients?: string[]
}

interface ReportTemplate {
    id: string
    name: string
    description: string
    type: 'analytics' | 'performance' | 'financial' | 'operational' | 'custom'
    category: string
    icon: string
    sections: string[]
    estimatedTime: number // in minutes
    dataRequirements: string[]
    popularity: number // 1-5 stars
}

interface ReportMetrics {
    totalReports: number
    completedReports: number
    scheduledReports: number
    failedReports: number
    avgGenerationTime: number
    totalDownloads: number
    activeTemplates: number
    sharedReports: number
}

// Mock data for demonstration
const mockReports: Report[] = [
    {
        id: 'rpt-1',
        title: 'Q3 Performance Analytics',
        description: 'Comprehensive quarterly performance report with KPI analysis',
        type: 'analytics',
        status: 'completed',
        createdAt: '2025-08-01T10:30:00Z',
        updatedAt: '2025-08-01T11:45:00Z',
        generatedAt: '2025-08-01T11:45:00Z',
        author: {
            id: 'user-1',
            name: 'Maria Popescu',
            avatar: '/avatars/maria.jpg'
        },
        metrics: {
            pages: 24,
            charts: 15,
            dataPoints: 45000,
            fileSize: '8.2 MB'
        },
        tags: ['quarterly', 'kpi', 'performance'],
        isShared: true,
        shareUrl: 'https://reports.analizai.ro/share/rpt-1',
        downloadCount: 47,
        lastAccessed: '2025-08-07T09:15:00Z',
        frequency: 'quarterly',
        recipients: ['team@company.com', 'executives@company.com']
    },
    {
        id: 'rpt-2',
        title: 'Daily Operations Dashboard',
        description: 'Real-time operational metrics and performance indicators',
        type: 'operational',
        status: 'generating',
        createdAt: '2025-08-07T08:00:00Z',
        updatedAt: '2025-08-07T08:00:00Z',
        author: {
            id: 'user-2',
            name: 'Alexandru Ionescu',
            avatar: '/avatars/alex.jpg'
        },
        metrics: {
            pages: 8,
            charts: 12,
            dataPoints: 15000,
            fileSize: '3.1 MB'
        },
        tags: ['daily', 'operations', 'real-time'],
        isShared: false,
        downloadCount: 23,
        frequency: 'daily',
        recipients: ['operations@company.com']
    },
    {
        id: 'rpt-3',
        title: 'Financial Summary Report',
        description: 'Monthly financial analysis with revenue and cost breakdown',
        type: 'financial',
        status: 'scheduled',
        createdAt: '2025-08-05T14:20:00Z',
        updatedAt: '2025-08-05T14:20:00Z',
        scheduledFor: '2025-08-10T09:00:00Z',
        author: {
            id: 'user-3',
            name: 'Elena Georgescu',
            avatar: '/avatars/elena.jpg'
        },
        metrics: {
            pages: 16,
            charts: 8,
            dataPoints: 25000,
            fileSize: '5.4 MB'
        },
        tags: ['monthly', 'financial', 'revenue'],
        isShared: true,
        shareUrl: 'https://reports.analizai.ro/share/rpt-3',
        downloadCount: 31,
        frequency: 'monthly',
        recipients: ['finance@company.com']
    },
    {
        id: 'rpt-4',
        title: 'Customer Analytics Deep Dive',
        description: 'Detailed customer behavior analysis and segmentation study',
        type: 'analytics',
        status: 'completed',
        createdAt: '2025-08-03T16:45:00Z',
        updatedAt: '2025-08-04T10:30:00Z',
        generatedAt: '2025-08-04T10:30:00Z',
        author: {
            id: 'user-4',
            name: 'Radu Marinescu',
            avatar: '/avatars/radu.jpg'
        },
        metrics: {
            pages: 32,
            charts: 20,
            dataPoints: 67000,
            fileSize: '12.8 MB'
        },
        tags: ['customer', 'analytics', 'segmentation'],
        isShared: false,
        downloadCount: 18,
        lastAccessed: '2025-08-06T15:20:00Z'
    },
    {
        id: 'rpt-5',
        title: 'Performance Benchmark',
        description: 'System performance metrics vs industry benchmarks',
        type: 'performance',
        status: 'failed',
        createdAt: '2025-08-06T12:00:00Z',
        updatedAt: '2025-08-06T12:15:00Z',
        author: {
            id: 'user-1',
            name: 'Maria Popescu',
            avatar: '/avatars/maria.jpg'
        },
        metrics: {
            pages: 0,
            charts: 0,
            dataPoints: 0,
            fileSize: '0 MB'
        },
        tags: ['performance', 'benchmark', 'system'],
        isShared: false,
        downloadCount: 0
    }
]

const mockTemplates: ReportTemplate[] = [
    {
        id: 'tpl-1',
        name: 'Executive Dashboard',
        description: 'High-level KPI overview for executives',
        type: 'analytics',
        category: 'Executive',
        icon: 'TrendingUp',
        sections: ['Executive Summary', 'Key Metrics', 'Performance Trends', 'Recommendations'],
        estimatedTime: 15,
        dataRequirements: ['Financial Data', 'Performance Metrics', 'Customer Data'],
        popularity: 5
    },
    {
        id: 'tpl-2',
        name: 'Financial Report',
        description: 'Comprehensive financial analysis template',
        type: 'financial',
        category: 'Finance',
        icon: 'BarChart3',
        sections: ['Revenue Analysis', 'Cost Breakdown', 'Profit Margins', 'Forecasting'],
        estimatedTime: 25,
        dataRequirements: ['Financial Data', 'Transaction Data', 'Budget Data'],
        popularity: 4
    },
    {
        id: 'tpl-3',
        name: 'Performance Analytics',
        description: 'Detailed performance metrics and analysis',
        type: 'performance',
        category: 'Operations',
        icon: 'Activity',
        sections: ['System Metrics', 'User Activity', 'Performance Trends', 'Optimization'],
        estimatedTime: 20,
        dataRequirements: ['Performance Data', 'User Data', 'System Logs'],
        popularity: 4
    },
    {
        id: 'tpl-4',
        name: 'Customer Analysis',
        description: 'Customer behavior and satisfaction analysis',
        type: 'analytics',
        category: 'Customer',
        icon: 'Users',
        sections: ['Customer Segments', 'Behavior Analysis', 'Satisfaction Scores', 'Recommendations'],
        estimatedTime: 30,
        dataRequirements: ['Customer Data', 'Transaction Data', 'Survey Data'],
        popularity: 5
    },
    {
        id: 'tpl-5',
        name: 'Operational Report',
        description: 'Daily operational metrics and insights',
        type: 'operational',
        category: 'Operations',
        icon: 'Target',
        sections: ['Daily Metrics', 'Process Efficiency', 'Resource Utilization', 'Issues'],
        estimatedTime: 12,
        dataRequirements: ['Operational Data', 'Resource Data', 'Process Data'],
        popularity: 3
    },
    {
        id: 'tpl-6',
        name: 'Custom Analysis',
        description: 'Flexible template for custom reporting needs',
        type: 'custom',
        category: 'Custom',
        icon: 'Settings',
        sections: ['Custom Sections', 'Flexible Charts', 'Dynamic Content', 'Personalized Insights'],
        estimatedTime: 45,
        dataRequirements: ['Any Data Source', 'Custom Metrics', 'User Defined'],
        popularity: 3
    }
]

const mockMetrics: ReportMetrics = {
    totalReports: 156,
    completedReports: 142,
    scheduledReports: 8,
    failedReports: 6,
    avgGenerationTime: 18.5,
    totalDownloads: 1247,
    activeTemplates: 12,
    sharedReports: 67
}

// Utility functions
const getStatusIcon = (status: Report['status']) => {
    switch (status) {
        case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
        case 'generating': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        case 'scheduled': return <Clock className="h-4 w-4 text-yellow-600" />
        case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />
        case 'draft': return <Edit className="h-4 w-4 text-gray-600" />
        default: return <FileText className="h-4 w-4 text-gray-600" />
    }
}

const getStatusColor = (status: Report['status']) => {
    switch (status) {
        case 'completed': return 'text-green-600 bg-green-50 border-green-200'
        case 'generating': return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'scheduled': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        case 'failed': return 'text-red-600 bg-red-50 border-red-200'
        case 'draft': return 'text-gray-600 bg-gray-50 border-gray-200'
        default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
}

const getTypeIcon = (type: Report['type']) => {
    switch (type) {
        case 'analytics': return <BarChart3 className="h-5 w-5" />
        case 'performance': return <Activity className="h-5 w-5" />
        case 'financial': return <TrendingUp className="h-5 w-5" />
        case 'operational': return <Target className="h-5 w-5" />
        case 'custom': return <Settings className="h-5 w-5" />
        default: return <FileText className="h-5 w-5" />
    }
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
}

// Report Card Component
const ReportCard: React.FC<{
    report: Report
    onView: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onDownload: (id: string) => void
    onShare: (id: string) => void
}> = ({ report, onView, onEdit, onDelete, onDownload, onShare }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        {getTypeIcon(report.type)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{report.type} Report</p>
                    </div>
                </div>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    <span className="ml-1 capitalize">{report.status}</span>
                </div>
            </div>

            {report.description && (
                <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-500">Author</p>
                    <p className="font-medium">{report.author.name}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">File Size</p>
                    <p className="font-medium">{report.metrics.fileSize}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Pages</p>
                    <p className="font-medium">{report.metrics.pages}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Downloads</p>
                    <p className="font-medium">{report.downloadCount}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-gray-600">
                <div className="text-center">
                    <p className="font-medium">{report.metrics.charts}</p>
                    <p>Charts</p>
                </div>
                <div className="text-center">
                    <p className="font-medium">{report.metrics.dataPoints.toLocaleString('ro-RO')}</p>
                    <p>Data Points</p>
                </div>
                <div className="text-center">
                    <p className="font-medium">
                        {report.generatedAt ? formatTimeAgo(report.generatedAt) :
                            report.scheduledFor ? formatDate(report.scheduledFor) : 'N/A'}
                    </p>
                    <p>{report.status === 'scheduled' ? 'Scheduled' : 'Generated'}</p>
                </div>
            </div>

            {report.tags && report.tags.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {report.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onView(report.id)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Report"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    {report.status === 'completed' && (
                        <button
                            onClick={() => onDownload(report.id)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download"
                        >
                            <Download className="h-4 w-4" />
                        </button>
                    )}
                    {report.status === 'completed' && (
                        <button
                            onClick={() => onShare(report.id)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Share"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onEdit(report.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(report.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

// Report Template Card Component
const TemplateCard: React.FC<{
    template: ReportTemplate
    onSelect: (template: ReportTemplate) => void
}> = ({ template, onSelect }) => {
    const IconComponent = template.icon === 'TrendingUp' ? TrendingUp :
        template.icon === 'BarChart3' ? BarChart3 :
            template.icon === 'Activity' ? Activity :
                template.icon === 'Users' ? Users :
                    template.icon === 'Target' ? Target :
                        template.icon === 'Settings' ? Settings : FileText

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onSelect(template)}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg mr-3">
                        <IconComponent className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.category}</p>
                    </div>
                </div>
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <span
                            key={i}
                            className={`text-xs ${i < template.popularity ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{template.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{template.sections.length} sections</span>
                <span>~{template.estimatedTime}min</span>
            </div>
        </motion.div>
    )
}

// Main Reports Component
export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>(mockReports)
    const [filteredReports, setFilteredReports] = useState<Report[]>(mockReports)
    const [templates] = useState<ReportTemplate[]>(mockTemplates)
    const [metrics] = useState<ReportMetrics>(mockMetrics)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [activeTab, setActiveTab] = useState<'reports' | 'templates' | 'scheduled'>('reports')
    const [isLoading, setIsLoading] = useState(false)

    // Filter reports
    useEffect(() => {
        let filtered = reports

        if (searchTerm) {
            filtered = filtered.filter(report =>
                report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(report => report.status === statusFilter)
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(report => report.type === typeFilter)
        }

        setFilteredReports(filtered)
    }, [reports, searchTerm, statusFilter, typeFilter])

    const handleView = (id: string) => {
        console.log('View report:', id)
        // Implementation for view functionality
    }

    const handleEdit = (id: string) => {
        console.log('Edit report:', id)
        // Implementation for edit functionality
    }

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            setReports(prev => prev.filter(report => report.id !== id))
        }
    }

    const handleDownload = (id: string) => {
        console.log('Download report:', id)
        // Update download count
        setReports(prev => prev.map(report =>
            report.id === id ? { ...report, downloadCount: report.downloadCount + 1 } : report
        ))
    }

    const handleShare = (id: string) => {
        const report = reports.find(r => r.id === id)
        if (report?.shareUrl) {
            navigator.clipboard.writeText(report.shareUrl)
            // Show success message
        }
    }

    const handleTemplateSelect = (template: ReportTemplate) => {
        console.log('Create report from template:', template)
        // Implementation for creating report from template
    }

    const statusCounts = {
        all: reports.length,
        completed: reports.filter(r => r.status === 'completed').length,
        generating: reports.filter(r => r.status === 'generating').length,
        scheduled: reports.filter(r => r.status === 'scheduled').length,
        failed: reports.filter(r => r.status === 'failed').length,
        draft: reports.filter(r => r.status === 'draft').length
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Reports
                            </h1>
                            <p className="text-gray-600">
                                Generate, manage, and share analytics reports
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <Download className="h-4 w-4 mr-2" />
                                Export All
                            </button>
                            <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200">
                                <Plus className="h-4 w-4 mr-2" />
                                New Report
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Metrics Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Reports</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalReports}</p>
                            </div>
                            <FileText className="h-8 w-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{metrics.completedReports}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg Generation</p>
                                <p className="text-2xl font-bold text-blue-600">{metrics.avgGenerationTime}min</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Downloads</p>
                                <p className="text-2xl font-bold text-purple-600">{metrics.totalDownloads}</p>
                            </div>
                            <Download className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reports'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                All Reports ({statusCounts.all})
                            </button>
                            <button
                                onClick={() => setActiveTab('templates')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'templates'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Templates ({templates.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('scheduled')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'scheduled'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Scheduled ({statusCounts.scheduled})
                            </button>
                        </div>

                        {activeTab === 'reports' && (
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search reports..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="completed">Completed</option>
                                        <option value="generating">Generating</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="failed">Failed</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="analytics">Analytics</option>
                                        <option value="performance">Performance</option>
                                        <option value="financial">Financial</option>
                                        <option value="operational">Operational</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Content based on active tab */}
                {activeTab === 'reports' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {filteredReports.map((report) => (
                            <ReportCard
                                key={report.id}
                                report={report}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onDownload={handleDownload}
                                onShare={handleShare}
                            />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'templates' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {templates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onSelect={handleTemplateSelect}
                            />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'scheduled' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {reports.filter(r => r.status === 'scheduled').map((report) => (
                            <ReportCard
                                key={report.id}
                                report={report}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onDownload={handleDownload}
                                onShare={handleShare}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
                >
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Calendar className="h-6 w-6 text-purple-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Automated Reports</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Schedule reports to generate automatically at specified intervals.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            Set up automation →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Share2 className="h-6 w-6 text-blue-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Report Sharing</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Share reports with team members and stakeholders securely.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            Manage sharing →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Settings className="h-6 w-6 text-green-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Custom Templates</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Create custom report templates tailored to your specific needs.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            Create template →
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
