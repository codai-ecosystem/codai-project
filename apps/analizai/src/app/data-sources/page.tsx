'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Database, CheckCircle, XCircle, RefreshCw, Clock, AlertTriangle,
    Plus, Settings, Search, Filter, Download, Upload, Link, Trash2,
    Activity, Zap, Globe, Server, File, BarChart3, Play, Pause,
    Eye, Edit, Copy, Shield, Key, Wifi, WifiOff, Timer, Target
} from 'lucide-react'

// TypeScript interfaces for data sources
interface DataSource {
    id: string
    name: string
    type: 'database' | 'api' | 'file' | 'stream' | 'webhook' | 'cloud'
    status: 'connected' | 'disconnected' | 'syncing' | 'error' | 'paused'
    description?: string
    lastSync: string
    nextSync?: string
    recordCount: number
    dataQuality: number
    syncInterval: number // in minutes
    createdAt: string
    updatedAt: string
    tags: string[]
    configuration: {
        endpoint?: string
        authentication?: string
        schema?: string
        format?: string
        [key: string]: any
    }
    metrics: {
        totalRecords: number
        successfulSyncs: number
        failedSyncs: number
        avgSyncTime: number
        dataQuality: number
    }
}

interface ConnectionTemplate {
    id: string
    name: string
    type: 'database' | 'api' | 'file' | 'stream' | 'webhook' | 'cloud'
    icon: string
    description: string
    category: string
    configFields: Array<{
        name: string
        type: 'text' | 'password' | 'select' | 'number' | 'url'
        label: string
        required: boolean
        options?: string[]
    }>
}

// Mock data for demonstration
const mockDataSources: DataSource[] = [
    {
        id: 'ds-1',
        name: 'Production Database',
        type: 'database',
        status: 'connected',
        description: 'Primary PostgreSQL database with user data',
        lastSync: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        nextSync: new Date(Date.now() + 900000).toISOString(), // 15 minutes from now
        recordCount: 1250000,
        dataQuality: 0.98,
        syncInterval: 15,
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 300000).toISOString(),
        tags: ['production', 'critical', 'users'],
        configuration: {
            endpoint: 'postgresql://prod-db.company.com:5432/analytics',
            authentication: 'credentials',
            schema: 'public'
        },
        metrics: {
            totalRecords: 1250000,
            successfulSyncs: 2847,
            failedSyncs: 12,
            avgSyncTime: 45.6,
            dataQuality: 0.98
        }
    },
    {
        id: 'ds-2',
        name: 'Google Analytics API',
        type: 'api',
        status: 'syncing',
        description: 'Website traffic and user behavior data',
        lastSync: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        nextSync: new Date(Date.now() + 1800000).toISOString(), // 30 minutes from now
        recordCount: 45000,
        dataQuality: 0.92,
        syncInterval: 60,
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
        tags: ['analytics', 'web', 'marketing'],
        configuration: {
            endpoint: 'https://analyticsreporting.googleapis.com/v4',
            authentication: 'oauth2',
            format: 'json'
        },
        metrics: {
            totalRecords: 45000,
            successfulSyncs: 720,
            failedSyncs: 8,
            avgSyncTime: 23.4,
            dataQuality: 0.92
        }
    },
    {
        id: 'ds-3',
        name: 'Sales CSV Export',
        type: 'file',
        status: 'error',
        description: 'Monthly sales data from CRM system',
        lastSync: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        recordCount: 8500,
        dataQuality: 0.85,
        syncInterval: 1440, // daily
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        tags: ['sales', 'crm', 'monthly'],
        configuration: {
            endpoint: 'sftp://crm.company.com/exports/sales.csv',
            authentication: 'key',
            format: 'csv'
        },
        metrics: {
            totalRecords: 8500,
            successfulSyncs: 6,
            failedSyncs: 3,
            avgSyncTime: 12.8,
            dataQuality: 0.85
        }
    },
    {
        id: 'ds-4',
        name: 'Real-time Events',
        type: 'stream',
        status: 'connected',
        description: 'Live event stream from application servers',
        lastSync: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
        recordCount: 2340000,
        dataQuality: 0.96,
        syncInterval: 1, // real-time
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 30000).toISOString(),
        tags: ['real-time', 'events', 'streaming'],
        configuration: {
            endpoint: 'wss://events.company.com/stream',
            authentication: 'token',
            format: 'json'
        },
        metrics: {
            totalRecords: 2340000,
            successfulSyncs: 7200,
            failedSyncs: 45,
            avgSyncTime: 0.8,
            dataQuality: 0.96
        }
    },
    {
        id: 'ds-5',
        name: 'AWS S3 Bucket',
        type: 'cloud',
        status: 'paused',
        description: 'Data lake storage with historical analytics',
        lastSync: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        recordCount: 5600000,
        dataQuality: 0.94,
        syncInterval: 720, // 12 hours
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
        tags: ['cloud', 'storage', 'historical'],
        configuration: {
            endpoint: 's3://analytics-bucket/data/',
            authentication: 'aws-iam',
            format: 'parquet'
        },
        metrics: {
            totalRecords: 5600000,
            successfulSyncs: 40,
            failedSyncs: 2,
            avgSyncTime: 180.5,
            dataQuality: 0.94
        }
    }
]

const connectionTemplates: ConnectionTemplate[] = [
    {
        id: 'postgresql',
        name: 'PostgreSQL',
        type: 'database',
        icon: 'Database',
        description: 'Connect to PostgreSQL database',
        category: 'Databases',
        configFields: [
            { name: 'host', type: 'text', label: 'Host', required: true },
            { name: 'port', type: 'number', label: 'Port', required: true },
            { name: 'database', type: 'text', label: 'Database', required: true },
            { name: 'username', type: 'text', label: 'Username', required: true },
            { name: 'password', type: 'password', label: 'Password', required: true }
        ]
    },
    {
        id: 'mysql',
        name: 'MySQL',
        type: 'database',
        icon: 'Database',
        description: 'Connect to MySQL database',
        category: 'Databases',
        configFields: [
            { name: 'host', type: 'text', label: 'Host', required: true },
            { name: 'port', type: 'number', label: 'Port', required: true },
            { name: 'database', type: 'text', label: 'Database', required: true },
            { name: 'username', type: 'text', label: 'Username', required: true },
            { name: 'password', type: 'password', label: 'Password', required: true }
        ]
    },
    {
        id: 'google-analytics',
        name: 'Google Analytics',
        type: 'api',
        icon: 'BarChart3',
        description: 'Connect to Google Analytics API',
        category: 'Analytics',
        configFields: [
            { name: 'property_id', type: 'text', label: 'Property ID', required: true },
            { name: 'credentials', type: 'text', label: 'Service Account JSON', required: true }
        ]
    },
    {
        id: 'rest-api',
        name: 'REST API',
        type: 'api',
        icon: 'Globe',
        description: 'Connect to any REST API endpoint',
        category: 'APIs',
        configFields: [
            { name: 'endpoint', type: 'url', label: 'API Endpoint', required: true },
            { name: 'method', type: 'select', label: 'HTTP Method', required: true, options: ['GET', 'POST'] },
            { name: 'auth_type', type: 'select', label: 'Authentication', required: false, options: ['none', 'api_key', 'bearer_token', 'basic'] }
        ]
    },
    {
        id: 'csv-file',
        name: 'CSV File',
        type: 'file',
        icon: 'File',
        description: 'Upload or connect to CSV files',
        category: 'Files',
        configFields: [
            { name: 'file_path', type: 'text', label: 'File Path/URL', required: true },
            { name: 'delimiter', type: 'select', label: 'Delimiter', required: false, options: [',', ';', '|', '\\t'] },
            { name: 'has_header', type: 'select', label: 'Has Header Row', required: false, options: ['true', 'false'] }
        ]
    },
    {
        id: 'aws-s3',
        name: 'AWS S3',
        type: 'cloud',
        icon: 'Server',
        description: 'Connect to AWS S3 bucket',
        category: 'Cloud Storage',
        configFields: [
            { name: 'bucket_name', type: 'text', label: 'Bucket Name', required: true },
            { name: 'region', type: 'text', label: 'Region', required: true },
            { name: 'access_key', type: 'text', label: 'Access Key ID', required: true },
            { name: 'secret_key', type: 'password', label: 'Secret Access Key', required: true }
        ]
    }
]

// Utility functions
const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
        case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />
        case 'error': return <XCircle className="h-4 w-4 text-red-600" />
        case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />
        default: return <Clock className="h-4 w-4 text-gray-600" />
    }
}

const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
        case 'connected': return 'text-green-600 bg-green-50 border-green-200'
        case 'error': return 'text-red-600 bg-red-50 border-red-200'
        case 'syncing': return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'paused': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
}

const getTypeIcon = (type: DataSource['type']) => {
    switch (type) {
        case 'database': return <Database className="h-5 w-5" />
        case 'api': return <Globe className="h-5 w-5" />
        case 'file': return <File className="h-5 w-5" />
        case 'stream': return <Activity className="h-5 w-5" />
        case 'webhook': return <Zap className="h-5 w-5" />
        case 'cloud': return <Server className="h-5 w-5" />
        default: return <Database className="h-5 w-5" />
    }
}

const formatLastSync = (lastSync: string) => {
    const now = new Date()
    const syncTime = new Date(lastSync)
    const diffMs = now.getTime() - syncTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
}

// Data Source Card Component
const DataSourceCard: React.FC<{
    dataSource: DataSource
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onSync: (id: string) => void
    onPause: (id: string) => void
}> = ({ dataSource, onEdit, onDelete, onSync, onPause }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        {getTypeIcon(dataSource.type)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{dataSource.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{dataSource.type}</p>
                    </div>
                </div>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(dataSource.status)}`}>
                    {getStatusIcon(dataSource.status)}
                    <span className="ml-1 capitalize">{dataSource.status}</span>
                </div>
            </div>

            {dataSource.description && (
                <p className="text-sm text-gray-600 mb-4">{dataSource.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-500">Records</p>
                    <p className="font-medium">{dataSource.recordCount.toLocaleString('ro-RO')}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Data Quality</p>
                    <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                                style={{ width: `${dataSource.dataQuality * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium">{(dataSource.dataQuality * 100).toFixed(1)}%</span>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Last Sync</p>
                    <p className="font-medium">{formatLastSync(dataSource.lastSync)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Sync Interval</p>
                    <p className="font-medium">
                        {dataSource.syncInterval < 60 ? `${dataSource.syncInterval}m` :
                            dataSource.syncInterval < 1440 ? `${Math.floor(dataSource.syncInterval / 60)}h` :
                                `${Math.floor(dataSource.syncInterval / 1440)}d`}
                    </p>
                </div>
            </div>

            {dataSource.tags && dataSource.tags.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {dataSource.tags.map((tag, index) => (
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
                        onClick={() => onSync(dataSource.id)}
                        disabled={dataSource.status === 'syncing'}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Sync Now"
                    >
                        <RefreshCw className={`h-4 w-4 ${dataSource.status === 'syncing' ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => onPause(dataSource.id)}
                        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title={dataSource.status === 'paused' ? 'Resume' : 'Pause'}
                    >
                        {dataSource.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => onEdit(dataSource.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(dataSource.id)}
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

// Connection Template Card Component
const ConnectionTemplateCard: React.FC<{
    template: ConnectionTemplate
    onSelect: (template: ConnectionTemplate) => void
}> = ({ template, onSelect }) => {
    const IconComponent = template.icon === 'Database' ? Database :
        template.icon === 'BarChart3' ? BarChart3 :
            template.icon === 'Globe' ? Globe :
                template.icon === 'File' ? File :
                    template.icon === 'Server' ? Server : Database

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onSelect(template)}
        >
            <div className="flex items-center mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg mr-3">
                    <IconComponent className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.category}</p>
                </div>
            </div>
            <p className="text-sm text-gray-600">{template.description}</p>
        </motion.div>
    )
}

// Main Data Sources Component
export default function DataSourcesPage() {
    const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources)
    const [filteredDataSources, setFilteredDataSources] = useState<DataSource[]>(mockDataSources)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<ConnectionTemplate | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Filter data sources
    useEffect(() => {
        let filtered = dataSources

        if (searchTerm) {
            filtered = filtered.filter(ds =>
                ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ds.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ds.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(ds => ds.status === statusFilter)
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(ds => ds.type === typeFilter)
        }

        setFilteredDataSources(filtered)
    }, [dataSources, searchTerm, statusFilter, typeFilter])

    const handleSync = async (id: string) => {
        setIsLoading(true)
        // Simulate sync operation
        setTimeout(() => {
            setDataSources(prev => prev.map(ds =>
                ds.id === id ? { ...ds, status: 'syncing' as const, lastSync: new Date().toISOString() } : ds
            ))
            setIsLoading(false)

            // Simulate sync completion
            setTimeout(() => {
                setDataSources(prev => prev.map(ds =>
                    ds.id === id ? { ...ds, status: 'connected' as const } : ds
                ))
            }, 3000)
        }, 1000)
    }

    const handlePause = (id: string) => {
        setDataSources(prev => prev.map(ds =>
            ds.id === id ? {
                ...ds,
                status: ds.status === 'paused' ? 'connected' as const : 'paused' as const
            } : ds
        ))
    }

    const handleEdit = (id: string) => {
        console.log('Edit data source:', id)
        // Implementation for edit functionality
    }

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this data source?')) {
            setDataSources(prev => prev.filter(ds => ds.id !== id))
        }
    }

    const handleTemplateSelect = (template: ConnectionTemplate) => {
        setSelectedTemplate(template)
        setShowAddModal(true)
    }

    const statusCounts = {
        all: dataSources.length,
        connected: dataSources.filter(ds => ds.status === 'connected').length,
        error: dataSources.filter(ds => ds.status === 'error').length,
        syncing: dataSources.filter(ds => ds.status === 'syncing').length,
        paused: dataSources.filter(ds => ds.status === 'paused').length
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
                                Data Sources
                            </h1>
                            <p className="text-gray-600">
                                Manage and monitor your data connections
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Data Source
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Status Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
                >
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Sources</p>
                                <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
                            </div>
                            <Database className="h-8 w-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Connected</p>
                                <p className="text-2xl font-bold text-green-600">{statusCounts.connected}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Syncing</p>
                                <p className="text-2xl font-bold text-blue-600">{statusCounts.syncing}</p>
                            </div>
                            <RefreshCw className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Errors</p>
                                <p className="text-2xl font-bold text-red-600">{statusCounts.error}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Paused</p>
                                <p className="text-2xl font-bold text-yellow-600">{statusCounts.paused}</p>
                            </div>
                            <Pause className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>
                </motion.div>

                {/* Filters and Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8"
                >
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search data sources..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="connected">Connected</option>
                                <option value="syncing">Syncing</option>
                                <option value="error">Error</option>
                                <option value="paused">Paused</option>
                            </select>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="all">All Types</option>
                                <option value="database">Database</option>
                                <option value="api">API</option>
                                <option value="file">File</option>
                                <option value="stream">Stream</option>
                                <option value="cloud">Cloud</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Data Sources Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                    {filteredDataSources.map((dataSource) => (
                        <DataSourceCard
                            key={dataSource.id}
                            dataSource={dataSource}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSync={handleSync}
                            onPause={handlePause}
                        />
                    ))}
                </motion.div>

                {/* Quick Add Templates */}
                {!showAddModal && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Connect</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {connectionTemplates.slice(0, 6).map((template) => (
                                <ConnectionTemplateCard
                                    key={template.id}
                                    template={template}
                                    onSelect={handleTemplateSelect}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Shield className="h-6 w-6 text-green-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Data Security</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            All connections are encrypted and secured with industry-standard protocols.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            Learn more about security →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Activity className="h-6 w-6 text-blue-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Sync Monitoring</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Real-time monitoring and alerts for all your data synchronization processes.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            View sync logs →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Target className="h-6 w-6 text-purple-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Data Quality</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Automated data quality checks and validation rules for reliable analytics.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            Configure quality rules →
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
