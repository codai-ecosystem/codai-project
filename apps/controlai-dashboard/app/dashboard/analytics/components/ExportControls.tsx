'use client'

import React from 'react'
/**
 * Export Controls Component - Data Export and Sharing
 */

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
    Download, Share2, FileText, Image, Table, BarChart3,
    Calendar, Filter, Settings, Mail, Link, Users, Clock,
    CheckCircle2, RefreshCw, Archive, Zap
} from 'lucide-react'

interface ExportControlsProps {
    onExport: (format: string) => void
    metrics: any[]
    timeRange: any
}

export function ExportControls({ onExport, metrics, timeRange }: ExportControlsProps) {
    const [selectedFormat, setSelectedFormat] = useState('pdf')
    const [includeCharts, setIncludeCharts] = useState(true)
    const [includeRawData, setIncludeRawData] = useState(false)
    const [shareMethod, setShareMethod] = useState('download')
    const [recipients, setRecipients] = useState<string[]>([])
    const [scheduledExport, setScheduledExport] = useState(false)

    const exportFormats = [
        {
            id: 'pdf',
            label: 'PDF Report',
            icon: FileText,
            description: 'Formatted report with charts and analysis',
            size: '2.3 MB',
            features: ['Charts', 'Analysis', 'Branded']
        },
        {
            id: 'excel',
            label: 'Excel Workbook',
            icon: Table,
            description: 'Spreadsheet with data and calculations',
            size: '1.8 MB',
            features: ['Raw Data', 'Formulas', 'Pivot Tables']
        },
        {
            id: 'csv',
            label: 'CSV Data',
            icon: BarChart3,
            description: 'Raw data for external analysis',
            size: '0.5 MB',
            features: ['Raw Data', 'Universal', 'Lightweight']
        },
        {
            id: 'png',
            label: 'Chart Images',
            icon: Image,
            description: 'High-resolution chart images',
            size: '1.2 MB',
            features: ['Visual', 'Presentation', 'High-res']
        }
    ]

    const shareOptions = [
        { id: 'download', label: 'Download', icon: Download },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'link', label: 'Share Link', icon: Link },
        { id: 'team', label: 'Team Share', icon: Users }
    ]

    const scheduleOptions = [
        { id: 'none', label: 'One-time Export' },
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' }
    ]

    const handleExport = () => {
        console.log('Exporting with options:', {
            format: selectedFormat,
            includeCharts,
            includeRawData,
            shareMethod,
            recipients,
            scheduledExport
        })
        onExport(selectedFormat)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                            <Download className="w-7 h-7 mr-3 text-green-500" />
                            Export & Share
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Export analytics data and reports for {timeRange.label.toLowerCase()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Data includes</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {metrics.length} metrics
                        </p>
                    </div>
                </div>
            </div>

            {/* Export Format Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Choose Export Format
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {exportFormats.map((format) => {
                        const Icon = format.icon
                        const isSelected = selectedFormat === format.id

                        return (
                            <button
                                key={format.id}
                                onClick={() => setSelectedFormat(format.id)}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                        ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <Icon className={`w-6 h-6 ${isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`} />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{format.size}</span>
                                </div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                    {format.label}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {format.description}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {format.features.map((feature) => (
                                        <span
                                            key={feature}
                                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </motion.div>

            {/* Export Options */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {/* Content Options */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-blue-500" />
                        Content Options
                    </h3>
                    <div className="space-y-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={includeCharts}
                                onChange={(e) => setIncludeCharts(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="ml-3 text-gray-900 dark:text-white">Include charts and visualizations</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={includeRawData}
                                onChange={(e) => setIncludeRawData(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="ml-3 text-gray-900 dark:text-white">Include raw data tables</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                defaultChecked
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="ml-3 text-gray-900 dark:text-white">Include insights and recommendations</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                defaultChecked
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="ml-3 text-gray-900 dark:text-white">Include executive summary</span>
                        </label>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Date Range</h4>
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {timeRange.label} ({new Date().toLocaleDateString()})
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sharing Options */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Share2 className="w-5 h-5 mr-2 text-purple-500" />
                        Sharing Options
                    </h3>
                    <div className="space-y-4">
                        {shareOptions.map((option) => {
                            const Icon = option.icon
                            const isSelected = shareMethod === option.id

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setShareMethod(option.id)}
                                    className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 flex items-center ${isSelected
                                            ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`} />
                                    <span className={`font-medium ${isSelected ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-white'}`}>
                                        {option.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {shareMethod === 'email' && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Email Recipients
                            </label>
                            <input
                                type="email"
                                placeholder="Enter email addresses..."
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                            />
                        </div>
                    )}

                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Schedule Export</h4>
                        <select
                            value={scheduledExport ? 'weekly' : 'none'}
                            onChange={(e) => setScheduledExport(e.target.value !== 'none')}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                        >
                            {scheduleOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Export Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Export Summary
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p>• Format: {exportFormats.find(f => f.id === selectedFormat)?.label}</p>
                            <p>• Metrics: {metrics.length} included</p>
                            <p>• Time Range: {timeRange.label}</p>
                            <p>• Sharing: {shareOptions.find(s => s.id === shareMethod)?.label}</p>
                            {scheduledExport && <p>• Scheduled: Weekly automation</p>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Estimated size</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {exportFormats.find(f => f.id === selectedFormat)?.size}
                            </p>
                        </div>
                        <button
                            onClick={handleExport}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Export Now
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Recent Exports */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Archive className="w-5 h-5 mr-2 text-gray-500" />
                        Recent Exports
                    </h3>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[
                        {
                            name: 'Q1 Performance Report.pdf',
                            format: 'PDF',
                            size: '2.3 MB',
                            date: '2025-01-20 10:30',
                            status: 'completed',
                            downloads: 12
                        },
                        {
                            name: 'Analytics Data Export.xlsx',
                            format: 'Excel',
                            size: '1.8 MB',
                            date: '2025-01-19 15:45',
                            status: 'completed',
                            downloads: 8
                        },
                        {
                            name: 'Weekly Metrics.csv',
                            format: 'CSV',
                            size: '0.5 MB',
                            date: '2025-01-18 09:15',
                            status: 'generating',
                            downloads: 0
                        }
                    ].map((export_, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-lg">
                                        <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {export_.name}
                                        </h4>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span>{export_.format} • {export_.size}</span>
                                            <span className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {export_.date}
                                            </span>
                                            {export_.downloads > 0 && (
                                                <span className="flex items-center">
                                                    <Download className="w-3 h-3 mr-1" />
                                                    {export_.downloads} downloads
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${export_.status === 'completed'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        }`}>
                                        {export_.status === 'completed' ? (
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                        ) : (
                                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                        )}
                                        {export_.status}
                                    </div>
                                    {export_.status === 'completed' && (
                                        <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Export Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-orange-500" />
                            Export Status
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Monitor your export queue and processing status
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}


