import React from 'react'
/**
 * Custom Reports Component - Advanced Report Generation
 */
'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
    FileText, Download, Calendar, Filter, Search, Plus,
    Clock, Users, Target, TrendingUp, BarChart3, PieChart,
    Settings, Share2, Archive, RefreshCw, CheckCircle2
} from 'lucide-react'

interface CustomReportsProps {
    metrics: any[]
    timeRange: any
    onExport: (format: string) => void
}

export function CustomReports({ metrics, timeRange, onExport }: CustomReportsProps) {
    const [selectedReports, setSelectedReports] = useState<string[]>([])
    const [reportType, setReportType] = useState('summary')
    const [filterOpen, setFilterOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const reportTemplates = [
        {
            id: 'executive-summary',
            name: 'Executive Summary',
            description: 'High-level overview for leadership',
            icon: Target,
            category: 'management',
            frequency: 'weekly',
            lastGenerated: '2025-01-20',
            status: 'ready'
        },
        {
            id: 'performance-detailed',
            name: 'Performance Analysis',
            description: 'Detailed performance metrics and trends',
            icon: TrendingUp,
            category: 'performance',
            frequency: 'daily',
            lastGenerated: '2025-01-20',
            status: 'generating'
        },
        {
            id: 'team-productivity',
            name: 'Team Productivity Report',
            description: 'Team efficiency and collaboration metrics',
            icon: Users,
            category: 'team',
            frequency: 'bi-weekly',
            lastGenerated: '2025-01-18',
            status: 'ready'
        },
        {
            id: 'project-status',
            name: 'Project Status Dashboard',
            description: 'Current project health and progress',
            icon: BarChart3,
            category: 'projects',
            frequency: 'weekly',
            lastGenerated: '2025-01-19',
            status: 'ready'
        },
        {
            id: 'financial-overview',
            name: 'Financial Performance',
            description: 'Budget utilization and cost analysis',
            icon: PieChart,
            category: 'financial',
            frequency: 'monthly',
            lastGenerated: '2025-01-15',
            status: 'outdated'
        },
        {
            id: 'operational-metrics',
            name: 'Operational Efficiency',
            description: 'System performance and operational KPIs',
            icon: Settings,
            category: 'operations',
            frequency: 'daily',
            lastGenerated: '2025-01-20',
            status: 'ready'
        }
    ]

    const categories = [
        { id: 'all', label: 'All Reports' },
        { id: 'management', label: 'Management' },
        { id: 'performance', label: 'Performance' },
        { id: 'team', label: 'Team' },
        { id: 'projects', label: 'Projects' },
        { id: 'financial', label: 'Financial' },
        { id: 'operations', label: 'Operations' }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
            case 'generating': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
            case 'outdated': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ready': return <CheckCircle2 className="w-4 h-4" />
            case 'generating': return <RefreshCw className="w-4 h-4 animate-spin" />
            case 'outdated': return <Clock className="w-4 h-4" />
            default: return <FileText className="w-4 h-4" />
        }
    }

    const filteredReports = reportTemplates.filter(report => {
        const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = reportType === 'all' || report.category === reportType
        return matchesSearch && matchesCategory
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                        <FileText className="w-7 h-7 mr-3 text-blue-500" />
                        Custom Reports
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Generate and manage custom analytics reports for {timeRange.label.toLowerCase()}
                    </p>
                </div>

                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white"
                    >
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.label}
                            </option>
                        ))}
                    </select>

                    {/* Create New Report */}
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        New Report
                    </button>
                </div>
            </div>

            {/* Report Templates Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredReports.map((report, index) => {
                    const Icon = report.icon
                    const isSelected = selectedReports.includes(report.id)

                    return (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${isSelected
                                    ? 'border-blue-500 dark:border-blue-400 shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => {
                                setSelectedReports(prev =>
                                    isSelected
                                        ? prev.filter(id => id !== report.id)
                                        : [...prev, report.id]
                                )
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg ${isSelected
                                        ? 'bg-blue-100 dark:bg-blue-900/30'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                    <Icon className={`w-6 h-6 ${isSelected
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                                    <div className="flex items-center">
                                        {getStatusIcon(report.status)}
                                        <span className="ml-1 capitalize">{report.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                        {report.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {report.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        <span>{report.frequency}</span>
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400">
                                        Last: {report.lastGenerated}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {report.category}
                                    </span>
                                    <div className="flex space-x-2">
                                        <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                            <Archive className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Selected Reports Actions */}
            {selectedReports.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {selectedReports.length} Report{selectedReports.length > 1 ? 's' : ''} Selected
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Generate selected reports or perform bulk actions
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Export Format Buttons */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onExport('pdf')}
                                    className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 flex items-center"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    PDF
                                </button>
                                <button
                                    onClick={() => onExport('excel')}
                                    className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 flex items-center"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Excel
                                </button>
                                <button
                                    onClick={() => onExport('csv')}
                                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 flex items-center"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    CSV
                                </button>
                            </div>

                            {/* Generate Button */}
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Generate Reports
                            </button>

                            {/* Clear Selection */}
                            <button
                                onClick={() => setSelectedReports([])}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Recent Reports */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Archive className="w-5 h-5 mr-2 text-gray-500" />
                        Recent Reports
                    </h3>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reportTemplates.slice(0, 5).map((report) => {
                        const Icon = report.icon
                        return (
                            <div key={report.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-lg mr-4">
                                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {report.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Generated on {report.lastGenerated} • {report.frequency}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Report Generation Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Report Generation Queue
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        Processing 2 of 6 reports
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin mr-3" />
                            <span className="text-gray-900 dark:text-white">Performance Analysis</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">65%</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-gray-900 dark:text-white">Financial Overview</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">Queued</span>
                            <span className="text-xs text-gray-400">ETA: 5 min</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

