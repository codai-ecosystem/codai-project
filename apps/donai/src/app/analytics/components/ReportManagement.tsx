'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileText, Download, Calendar, Clock, Send, Settings,
    Filter, Plus, Eye, Edit, Trash2, CheckCircle
} from 'lucide-react'

interface Report {
    id: string
    name: string
    type: 'financial' | 'campaign' | 'donor' | 'impact'
    status: 'scheduled' | 'generating' | 'ready' | 'sent'
    lastGenerated: string
    nextScheduled: string
    recipients: string[]
    format: 'PDF' | 'Excel' | 'CSV'
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
}

interface ReportTemplate {
    id: string
    name: string
    description: string
    type: string
    popular: boolean
}

interface ReportManagementProps {
    selectedPeriod: string
}

export default function ReportManagement({ selectedPeriod }: ReportManagementProps) {
    const [selectedType, setSelectedType] = useState('all')
    const [showNewReportModal, setShowNewReportModal] = useState(false)

    const reports: Report[] = [
        {
            id: '1',
            name: 'Monthly Financial Summary',
            type: 'financial',
            status: 'ready',
            lastGenerated: '2025-01-31T10:00:00',
            nextScheduled: '2025-02-28T10:00:00',
            recipients: ['admin@donai.ro', 'finance@donai.ro'],
            format: 'PDF',
            frequency: 'monthly'
        },
        {
            id: '2',
            name: 'Weekly Campaign Performance',
            type: 'campaign',
            status: 'scheduled',
            lastGenerated: '2025-01-28T09:00:00',
            nextScheduled: '2025-02-04T09:00:00',
            recipients: ['marketing@donai.ro', 'admin@donai.ro'],
            format: 'Excel',
            frequency: 'weekly'
        },
        {
            id: '3',
            name: 'Donor Analytics Report',
            type: 'donor',
            status: 'generating',
            lastGenerated: '2025-01-30T14:30:00',
            nextScheduled: '2025-02-06T14:30:00',
            recipients: ['admin@donai.ro'],
            format: 'PDF',
            frequency: 'weekly'
        },
        {
            id: '4',
            name: 'Quarterly Impact Assessment',
            type: 'impact',
            status: 'sent',
            lastGenerated: '2025-01-01T12:00:00',
            nextScheduled: '2025-04-01T12:00:00',
            recipients: ['board@donai.ro', 'admin@donai.ro', 'public@donai.ro'],
            format: 'PDF',
            frequency: 'quarterly'
        },
        {
            id: '5',
            name: 'Daily Donation Summary',
            type: 'financial',
            status: 'ready',
            lastGenerated: '2025-01-31T18:00:00',
            nextScheduled: '2025-02-01T18:00:00',
            recipients: ['admin@donai.ro'],
            format: 'CSV',
            frequency: 'daily'
        }
    ]

    const reportTemplates: ReportTemplate[] = [
        {
            id: '1',
            name: 'Financial Summary',
            description: 'Comprehensive financial overview with donations, expenses, and ROI',
            type: 'financial',
            popular: true
        },
        {
            id: '2',
            name: 'Campaign Performance',
            description: 'Detailed analysis of campaign effectiveness and donor engagement',
            type: 'campaign',
            popular: true
        },
        {
            id: '3',
            name: 'Donor Insights',
            description: 'Deep dive into donor behavior, segmentation, and retention',
            type: 'donor',
            popular: false
        },
        {
            id: '4',
            name: 'Impact Measurement',
            description: 'Outcome tracking and social impact assessment',
            type: 'impact',
            popular: true
        },
        {
            id: '5',
            name: 'Tax Compliance',
            description: 'Tax-ready reports for donors and regulatory compliance',
            type: 'financial',
            popular: false
        },
        {
            id: '6',
            name: 'Operational Metrics',
            description: 'Platform performance, user engagement, and system analytics',
            type: 'operational',
            popular: false
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready': return 'bg-green-100 text-green-700'
            case 'generating': return 'bg-yellow-100 text-yellow-700'
            case 'scheduled': return 'bg-blue-100 text-blue-700'
            case 'sent': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'financial': return 'bg-green-100 text-green-700'
            case 'campaign': return 'bg-blue-100 text-blue-700'
            case 'donor': return 'bg-purple-100 text-purple-700'
            case 'impact': return 'bg-orange-100 text-orange-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const filteredReports = reports.filter(report =>
        selectedType === 'all' || report.type === selectedType
    )

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <motion.div
            key="reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            {/* Report Management Header */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
                    <h3 className="text-xl font-semibold text-gray-900">Report Management System</h3>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="all">All Report Types</option>
                            <option value="financial">Financial</option>
                            <option value="campaign">Campaign</option>
                            <option value="donor">Donor</option>
                            <option value="impact">Impact</option>
                        </select>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowNewReportModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Report</span>
                        </motion.button>
                    </div>
                </div>

                {/* Active Reports */}
                <div className="space-y-4">
                    {filteredReports.map((report, index) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-r from-white to-gray-50/50 rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <FileText className="h-5 w-5 text-gray-500" />
                                        <h4 className="font-semibold text-gray-900">{report.name}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                                            {report.type}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            <span>Last: {formatDate(report.lastGenerated)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>Next: {formatDate(report.nextScheduled)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Send className="h-4 w-4" />
                                            <span>{report.recipients.length} recipients</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <FileText className="h-4 w-4" />
                                            <span>{report.format} • {report.frequency}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View Report"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Download Report"
                                    >
                                        <Download className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                        title="Edit Report"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Report"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Report Templates */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Report Templates</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportTemplates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-6 border border-blue-200/50 hover:shadow-lg transition-shadow group cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                                        {template.popular && (
                                            <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                                Popular
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                                    {template.type}
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Use Template
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Report Statistics */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Report System Statistics</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
                        <div className="flex items-center space-x-3 mb-2">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <span className="text-2xl font-bold text-green-600">12</span>
                        </div>
                        <div className="text-sm text-gray-600">Active Reports</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
                        <div className="flex items-center space-x-3 mb-2">
                            <Download className="h-6 w-6 text-blue-600" />
                            <span className="text-2xl font-bold text-blue-600">347</span>
                        </div>
                        <div className="text-sm text-gray-600">Reports Generated</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-center space-x-3 mb-2">
                            <Send className="h-6 w-6 text-purple-600" />
                            <span className="text-2xl font-bold text-purple-600">892</span>
                        </div>
                        <div className="text-sm text-gray-600">Reports Sent</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200/50">
                        <div className="flex items-center space-x-3 mb-2">
                            <Settings className="h-6 w-6 text-orange-600" />
                            <span className="text-2xl font-bold text-orange-600">6</span>
                        </div>
                        <div className="text-sm text-gray-600">Template Types</div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
