'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Database,
    Layers,
    Settings,
    Plus,
    RefreshCw,
    Play,
    Pause,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Zap,
    Activity,
    Signal,
    WifiOff,
    Wifi,
    Download,
    Upload,
    Share2,
    Edit,
    Trash2,
    Eye,
    Copy,
    Link,
    Unlink,
    Filter,
    Search,
    Calendar,
    BarChart3,
    LineChart,
    PieChart,
    TrendingUp,
    Users,
    DollarSign,
    ShoppingCart,
    Globe,
    Server,
    Cloud,
    HardDrive,
    Cpu,
    Memory,
    Network,
    Shield,
    Key,
    Lock,
    Unlock,
    FileText,
    FolderOpen,
    Code,
    GitBranch,
    ArrowUpRight,
    ArrowDownRight,
    RotateCcw,
    Power,
    PowerOff,
    Maximize2,
    Minimize2,
    MonitorSpeaker,
    Volume2,
    VolumeX
} from 'lucide-react'

// TypeScript interfaces for data sources
interface DataSource {
    id: string
    name: string
    type: 'database' | 'api' | 'file' | 'cloud' | 'streaming' | 'webhook'
    status: 'connected' | 'disconnected' | 'error' | 'syncing'
    provider: string
    lastSync: string
    recordCount: number
    dataSize: string
    syncFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'manual'
    health: number
    latency: number
    errorRate: number
    throughput: number
    credentials: {
        encrypted: boolean
        lastUpdated: string
    }
    schema: {
        tables: number
        columns: number
        lastUpdated: string
    }
    monitoring: {
        alerts: number
        uptime: number
        performance: number
    }
}

interface DataPipeline {
    id: string
    name: string
    description: string
    source: string
    destination: string
    status: 'running' | 'stopped' | 'error' | 'paused'
    type: 'etl' | 'streaming' | 'batch' | 'real-time'
    schedule: string
    lastRun: string
    nextRun: string
    recordsProcessed: number
    duration: string
    successRate: number
    transformations: number
}

interface ConnectionMetric {
    id: string
    sourceId: string
    metric: string
    value: number
    unit: string
    trend: 'up' | 'down' | 'stable'
    threshold: {
        warning: number
        critical: number
    }
    status: 'healthy' | 'warning' | 'critical'
}

interface DataSchema {
    id: string
    sourceId: string
    tableName: string
    columnCount: number
    recordCount: number
    lastUpdated: string
    dataTypes: { [key: string]: string }
    primaryKeys: string[]
    indexes: string[]
}

export default function DataSourcesPage() {
    const [activeTab, setActiveTab] = useState('sources')
    const [selectedSource, setSelectedSource] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [isMonitoring, setIsMonitoring] = useState(true)

    // Data sources state
    const [dataSources, setDataSources] = useState<DataSource[]>([
        {
            id: '1',
            name: 'PostgreSQL Main DB',
            type: 'database',
            status: 'connected',
            provider: 'PostgreSQL',
            lastSync: '2 minutes ago',
            recordCount: 2847563,
            dataSize: '45.2 GB',
            syncFrequency: 'real-time',
            health: 98,
            latency: 23,
            errorRate: 0.12,
            throughput: 1250,
            credentials: {
                encrypted: true,
                lastUpdated: '7 days ago'
            },
            schema: {
                tables: 47,
                columns: 342,
                lastUpdated: '1 hour ago'
            },
            monitoring: {
                alerts: 0,
                uptime: 99.97,
                performance: 95
            }
        },
        {
            id: '2',
            name: 'Salesforce CRM API',
            type: 'api',
            status: 'connected',
            provider: 'Salesforce',
            lastSync: '15 minutes ago',
            recordCount: 156789,
            dataSize: '8.7 GB',
            syncFrequency: 'hourly',
            health: 94,
            latency: 156,
            errorRate: 1.34,
            throughput: 890,
            credentials: {
                encrypted: true,
                lastUpdated: '3 days ago'
            },
            schema: {
                tables: 12,
                columns: 89,
                lastUpdated: '30 minutes ago'
            },
            monitoring: {
                alerts: 2,
                uptime: 98.45,
                performance: 87
            }
        },
        {
            id: '3',
            name: 'AWS S3 Data Lake',
            type: 'cloud',
            status: 'syncing',
            provider: 'Amazon S3',
            lastSync: '1 hour ago',
            recordCount: 8934521,
            dataSize: '234.8 GB',
            syncFrequency: 'daily',
            health: 89,
            latency: 78,
            errorRate: 0.89,
            throughput: 2340,
            credentials: {
                encrypted: true,
                lastUpdated: '1 day ago'
            },
            schema: {
                tables: 156,
                columns: 1247,
                lastUpdated: '2 hours ago'
            },
            monitoring: {
                alerts: 1,
                uptime: 99.12,
                performance: 92
            }
        },
        {
            id: '4',
            name: 'Kafka Event Stream',
            type: 'streaming',
            status: 'connected',
            provider: 'Apache Kafka',
            lastSync: 'Live',
            recordCount: 15678432,
            dataSize: '156.7 GB',
            syncFrequency: 'real-time',
            health: 96,
            latency: 12,
            errorRate: 0.05,
            throughput: 5670,
            credentials: {
                encrypted: true,
                lastUpdated: '12 hours ago'
            },
            schema: {
                tables: 23,
                columns: 145,
                lastUpdated: '5 minutes ago'
            },
            monitoring: {
                alerts: 0,
                uptime: 99.89,
                performance: 98
            }
        },
        {
            id: '5',
            name: 'Google Analytics API',
            type: 'api',
            status: 'error',
            provider: 'Google Analytics',
            lastSync: '2 hours ago',
            recordCount: 0,
            dataSize: '0 GB',
            syncFrequency: 'daily',
            health: 0,
            latency: 0,
            errorRate: 100,
            throughput: 0,
            credentials: {
                encrypted: true,
                lastUpdated: '5 days ago'
            },
            schema: {
                tables: 8,
                columns: 67,
                lastUpdated: '2 days ago'
            },
            monitoring: {
                alerts: 5,
                uptime: 76.23,
                performance: 12
            }
        },
        {
            id: '6',
            name: 'Payment Webhook',
            type: 'webhook',
            status: 'connected',
            provider: 'Stripe',
            lastSync: '30 seconds ago',
            recordCount: 89754,
            dataSize: '2.1 GB',
            syncFrequency: 'real-time',
            health: 92,
            latency: 45,
            errorRate: 0.78,
            throughput: 340,
            credentials: {
                encrypted: true,
                lastUpdated: '2 days ago'
            },
            schema: {
                tables: 5,
                columns: 34,
                lastUpdated: '10 minutes ago'
            },
            monitoring: {
                alerts: 1,
                uptime: 97.84,
                performance: 88
            }
        }
    ])

    // Data pipelines state
    const [dataPipelines] = useState<DataPipeline[]>([
        {
            id: '1',
            name: 'Sales Data ETL',
            description: 'Extract sales data from CRM, transform for analytics, load to warehouse',
            source: 'Salesforce CRM API',
            destination: 'PostgreSQL Main DB',
            status: 'running',
            type: 'etl',
            schedule: 'Every 2 hours',
            lastRun: '45 minutes ago',
            nextRun: '1 hour 15 minutes',
            recordsProcessed: 15678,
            duration: '12m 34s',
            successRate: 98.7,
            transformations: 8
        },
        {
            id: '2',
            name: 'Real-time Events',
            description: 'Stream user events from Kafka to analytics engine',
            source: 'Kafka Event Stream',
            destination: 'AWS S3 Data Lake',
            status: 'running',
            type: 'streaming',
            schedule: 'Continuous',
            lastRun: 'Live',
            nextRun: 'Continuous',
            recordsProcessed: 567890,
            duration: 'Ongoing',
            successRate: 99.8,
            transformations: 4
        },
        {
            id: '3',
            name: 'Payment Processing',
            description: 'Process payment webhooks and update customer records',
            source: 'Payment Webhook',
            destination: 'PostgreSQL Main DB',
            status: 'running',
            type: 'real-time',
            schedule: 'Event-driven',
            lastRun: '30 seconds ago',
            nextRun: 'On event',
            recordsProcessed: 8934,
            duration: '156ms avg',
            successRate: 99.2,
            transformations: 5
        },
        {
            id: '4',
            name: 'Analytics Data Sync',
            description: 'Daily sync of analytics data for reporting',
            source: 'Google Analytics API',
            destination: 'AWS S3 Data Lake',
            status: 'error',
            type: 'batch',
            schedule: 'Daily at 3:00 AM',
            lastRun: '2 days ago',
            nextRun: 'Paused',
            recordsProcessed: 0,
            duration: 'Failed',
            successRate: 0,
            transformations: 6
        }
    ])

    // Connection metrics
    const [connectionMetrics, setConnectionMetrics] = useState<ConnectionMetric[]>([
        {
            id: '1',
            sourceId: '1',
            metric: 'Response Time',
            value: 23,
            unit: 'ms',
            trend: 'stable',
            threshold: { warning: 50, critical: 100 },
            status: 'healthy'
        },
        {
            id: '2',
            sourceId: '2',
            metric: 'Error Rate',
            value: 1.34,
            unit: '%',
            trend: 'up',
            threshold: { warning: 2, critical: 5 },
            status: 'healthy'
        },
        {
            id: '3',
            sourceId: '3',
            metric: 'Throughput',
            value: 2340,
            unit: 'records/min',
            trend: 'up',
            threshold: { warning: 1000, critical: 500 },
            status: 'healthy'
        },
        {
            id: '4',
            sourceId: '5',
            metric: 'Uptime',
            value: 76.23,
            unit: '%',
            trend: 'down',
            threshold: { warning: 95, critical: 90 },
            status: 'critical'
        }
    ])

    // Simulate real-time updates
    useEffect(() => {
        if (!isMonitoring) return

        const interval = setInterval(() => {
            setDataSources(prev => prev.map(source => ({
                ...source,
                health: Math.max(0, Math.min(100, source.health + (Math.random() - 0.5) * 2)),
                latency: Math.max(0, source.latency + (Math.random() - 0.5) * 10),
                errorRate: Math.max(0, source.errorRate + (Math.random() - 0.5) * 0.5),
                throughput: Math.max(0, source.throughput + (Math.random() - 0.5) * 100)
            })))

            setConnectionMetrics(prev => prev.map(metric => {
                const newValue = Math.max(0, metric.value + (Math.random() - 0.5) * (metric.value * 0.1))
                let status: 'healthy' | 'warning' | 'critical' = 'healthy'

                if (newValue >= metric.threshold.critical) {
                    status = 'critical'
                } else if (newValue >= metric.threshold.warning) {
                    status = 'warning'
                }

                return {
                    ...metric,
                    value: newValue,
                    status
                }
            }))
        }, 3000)

        return () => clearInterval(interval)
    }, [isMonitoring])

    const getSourceTypeIcon = (type: string) => {
        switch (type) {
            case 'database': return <Database className="w-5 h-5 text-blue-500" />
            case 'api': return <Globe className="w-5 h-5 text-green-500" />
            case 'file': return <FileText className="w-5 h-5 text-orange-500" />
            case 'cloud': return <Cloud className="w-5 h-5 text-purple-500" />
            case 'streaming': return <Activity className="w-5 h-5 text-red-500" />
            case 'webhook': return <Zap className="w-5 h-5 text-yellow-500" />
            default: return <Server className="w-5 h-5 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'text-green-600 bg-green-100'
            case 'disconnected': return 'text-gray-600 bg-gray-100'
            case 'error': return 'text-red-600 bg-red-100'
            case 'syncing': return 'text-blue-600 bg-blue-100'
            case 'running': return 'text-green-600 bg-green-100'
            case 'stopped': return 'text-gray-600 bg-gray-100'
            case 'paused': return 'text-yellow-600 bg-yellow-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getHealthColor = (health: number) => {
        if (health >= 95) return 'text-green-600'
        if (health >= 80) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getMetricStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-100'
            case 'warning': return 'text-yellow-600 bg-yellow-100'
            case 'critical': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const filteredSources = dataSources.filter(source => {
        const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            source.provider.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || source.status === filterStatus
        const matchesType = filterType === 'all' || source.type === filterType

        return matchesSearch && matchesStatus && matchesType
    })

    const healthySources = dataSources.filter(s => s.status === 'connected').length
    const errorSources = dataSources.filter(s => s.status === 'error').length
    const totalRecords = dataSources.reduce((sum, s) => sum + s.recordCount, 0)

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
                                    <Database className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h1 className="text-2xl font-bold">Data Sources</h1>
                                        {isMonitoring && (
                                            <div className="flex items-center space-x-2 text-green-200">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-sm">Monitoring</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-blue-100">Manage data connections, pipelines, and monitoring</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setIsMonitoring(!isMonitoring)}
                                className={`px-4 py-2 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors ${isMonitoring
                                        ? 'bg-green-500/20 hover:bg-green-500/30 text-green-100'
                                        : 'bg-white/20 hover:bg-white/30'
                                    }`}
                            >
                                {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                <span>{isMonitoring ? 'Pause' : 'Start'}</span>
                            </button>
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>Add Source</span>
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
                                <div className="text-sm text-gray-600">Total Sources</div>
                                <div className="text-2xl font-bold text-gray-900">{dataSources.length}</div>
                            </div>
                            <Database className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Healthy Sources</div>
                                <div className="text-2xl font-bold text-gray-900">{healthySources}</div>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Error Sources</div>
                                <div className="text-2xl font-bold text-gray-900">{errorSources}</div>
                            </div>
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Total Records</div>
                                <div className="text-2xl font-bold text-gray-900">{totalRecords.toLocaleString()}</div>
                            </div>
                            <BarChart3 className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
                >
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-1 p-1">
                            {[
                                { id: 'sources', label: 'Data Sources', icon: Database },
                                { id: 'pipelines', label: 'Pipelines', icon: GitBranch },
                                { id: 'monitoring', label: 'Monitoring', icon: Activity },
                                { id: 'schema', label: 'Schema', icon: Code }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Data Sources Tab */}
                    {activeTab === 'sources' && (
                        <div className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search data sources..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="connected">Connected</option>
                                    <option value="disconnected">Disconnected</option>
                                    <option value="error">Error</option>
                                    <option value="syncing">Syncing</option>
                                </select>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="database">Database</option>
                                    <option value="api">API</option>
                                    <option value="file">File</option>
                                    <option value="cloud">Cloud</option>
                                    <option value="streaming">Streaming</option>
                                    <option value="webhook">Webhook</option>
                                </select>
                            </div>

                            {/* Sources Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredSources.map((source) => (
                                    <motion.div
                                        key={source.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white rounded-xl shadow-lg p-6 border-l-4"
                                        style={{
                                            borderLeftColor:
                                                source.status === 'connected' ? '#10B981' :
                                                    source.status === 'error' ? '#EF4444' :
                                                        source.status === 'syncing' ? '#3B82F6' : '#6B7280'
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="p-3 bg-gray-100 rounded-lg">
                                                    {getSourceTypeIcon(source.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(source.status)}`}>
                                                            {source.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 mb-2">{source.provider}</div>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span>Last sync: {source.lastSync}</span>
                                                        <span>•</span>
                                                        <span>{source.recordCount.toLocaleString()} records</span>
                                                        <span>•</span>
                                                        <span>{source.dataSize}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className={`text-lg font-bold ${getHealthColor(source.health)}`}>
                                                    {source.health.toFixed(0)}%
                                                </div>
                                                <div className="text-xs text-gray-600">Health</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {source.latency.toFixed(0)}ms
                                                </div>
                                                <div className="text-xs text-gray-600">Latency</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {source.errorRate.toFixed(2)}%
                                                </div>
                                                <div className="text-xs text-gray-600">Error Rate</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {source.throughput.toFixed(0)}
                                                </div>
                                                <div className="text-xs text-gray-600">Records/min</div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex items-center space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                {source.credentials.encrypted && (
                                                    <div className="flex items-center space-x-1">
                                                        <Lock className="w-3 h-3" />
                                                        <span>Encrypted</span>
                                                    </div>
                                                )}
                                                {source.monitoring.alerts > 0 && (
                                                    <div className="flex items-center space-x-1 text-red-500">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        <span>{source.monitoring.alerts} alerts</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pipelines Tab */}
                    {activeTab === 'pipelines' && (
                        <div className="p-6">
                            <div className="space-y-6">
                                {dataPipelines.map((pipeline) => (
                                    <div key={pipeline.id} className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">{pipeline.name}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pipeline.status)}`}>
                                                        {pipeline.status}
                                                    </span>
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                                        {pipeline.type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-3">{pipeline.description}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-600">Source:</span>
                                                        <span className="ml-2 text-gray-900">{pipeline.source}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Destination:</span>
                                                        <span className="ml-2 text-gray-900">{pipeline.destination}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Schedule:</span>
                                                        <span className="ml-2 text-gray-900">{pipeline.schedule}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Success Rate:</span>
                                                        <span className="ml-2 text-gray-900">{pipeline.successRate}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 border-t border-gray-200">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {pipeline.recordsProcessed.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-600">Records Processed</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{pipeline.duration}</div>
                                                <div className="text-xs text-gray-600">Duration</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{pipeline.transformations}</div>
                                                <div className="text-xs text-gray-600">Transformations</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{pipeline.lastRun}</div>
                                                <div className="text-xs text-gray-600">Last Run</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="text-sm text-gray-600">
                                                Next run: {pipeline.nextRun}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                                                    {pipeline.status === 'running' ? 'Pause' : 'Start'}
                                                </button>
                                                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                                    Configure
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Monitoring Tab */}
                    {activeTab === 'monitoring' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Connection Metrics */}
                                <div className="lg:col-span-2">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Metrics</h3>
                                    <div className="space-y-4">
                                        {connectionMetrics.map((metric) => {
                                            const source = dataSources.find(s => s.id === metric.sourceId)
                                            return (
                                                <div key={metric.id} className="bg-white rounded-xl shadow-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{source?.name}</h4>
                                                            <div className="text-sm text-gray-600">{metric.metric}</div>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMetricStatusColor(metric.status)}`}>
                                                            {metric.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-2xl font-bold text-gray-900">
                                                            {metric.value.toFixed(metric.unit === '%' ? 2 : 0)}{metric.unit}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Warning: {metric.threshold.warning}{metric.unit} |
                                                            Critical: {metric.threshold.critical}{metric.unit}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Alerts & Status */}
                                <div className="lg:col-span-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                                    <div className="space-y-4">
                                        {dataSources.filter(s => s.monitoring.alerts > 0).map((source) => (
                                            <div key={source.id} className="bg-white rounded-xl shadow-lg p-4">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                    <h4 className="font-medium text-gray-900">{source.name}</h4>
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    {source.monitoring.alerts} active alerts
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Uptime: {source.monitoring.uptime}% |
                                                    Performance: {source.monitoring.performance}%
                                                </div>
                                            </div>
                                        ))}

                                        {dataSources.filter(s => s.monitoring.alerts === 0).length > 0 && (
                                            <div className="bg-green-50 rounded-xl p-4">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                    <span className="font-medium text-green-900">All systems operational</span>
                                                </div>
                                                <div className="text-sm text-green-700 mt-1">
                                                    {dataSources.filter(s => s.monitoring.alerts === 0).length} sources running smoothly
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Schema Tab */}
                    {activeTab === 'schema' && (
                        <div className="p-6">
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Code className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Schema Explorer</h3>
                                <p className="text-gray-600 mb-6">Explore and manage data schemas across all sources</p>
                                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                                    Browse Schemas
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
