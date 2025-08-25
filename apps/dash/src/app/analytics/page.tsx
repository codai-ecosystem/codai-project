'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Activity,
    TrendingUp,
    TrendingDown,
    Zap,
    Settings,
    Play,
    Pause,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    DollarSign,
    ShoppingCart,
    Globe,
    Smartphone,
    Monitor,
    Wifi,
    WifiOff,
    Signal,
    AlertCircle,
    Target,
    BarChart3,
    LineChart,
    PieChart,
    Eye,
    Download,
    Share2,
    Filter,
    Calendar,
    Bell,
    BellOff,
    Maximize2,
    Minimize2,
    Grid3X3,
    Layout,
    Server,
    Database,
    Cpu,
    MemoryStick,
    HardDrive,
    Network,
    Thermometer,
    Battery,
    Volume2,
    VolumeX,
    Radio
} from 'lucide-react'

// TypeScript interfaces for real-time analytics
interface LiveMetric {
    id: string
    name: string
    value: number
    unit: string
    change: number
    trend: 'up' | 'down' | 'stable'
    status: 'healthy' | 'warning' | 'critical'
    threshold: {
        warning: number
        critical: number
    }
    category: 'business' | 'technical' | 'user' | 'system'
    dataPoints: DataPoint[]
}

interface DataPoint {
    timestamp: number
    value: number
}

interface SystemHealth {
    id: string
    component: string
    status: 'online' | 'degraded' | 'offline'
    uptime: number
    responseTime: number
    errorRate: number
    lastCheck: string
    icon: string
}

interface RealTimeEvent {
    id: string
    timestamp: string
    type: 'info' | 'warning' | 'error' | 'success'
    message: string
    source: string
    details?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
}

interface AlertRule {
    id: string
    name: string
    metric: string
    condition: 'greater_than' | 'less_than' | 'equals'
    threshold: number
    enabled: boolean
    notifications: string[]
    lastTriggered?: string
}

export default function RealTimeAnalyticsPage() {
    const [isLiveMode, setIsLiveMode] = useState(true)
    const [selectedTimeRange, setSelectedTimeRange] = useState('1h')
    const [alertsEnabled, setAlertsEnabled] = useState(true)
    const [viewMode, setViewMode] = useState('dashboard')
    const [selectedCategory, setSelectedCategory] = useState('all')

    // Live metrics state
    const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([
        {
            id: '1',
            name: 'Active Users',
            value: 2847,
            unit: '',
            change: 12.5,
            trend: 'up',
            status: 'healthy',
            threshold: { warning: 3000, critical: 3500 },
            category: 'user',
            dataPoints: []
        },
        {
            id: '2',
            name: 'Revenue/Hour',
            value: 1584,
            unit: '$',
            change: -3.2,
            trend: 'down',
            status: 'warning',
            threshold: { warning: 1200, critical: 800 },
            category: 'business',
            dataPoints: []
        },
        {
            id: '3',
            name: 'API Response Time',
            value: 245,
            unit: 'ms',
            change: 8.7,
            trend: 'up',
            status: 'critical',
            threshold: { warning: 200, critical: 300 },
            category: 'technical',
            dataPoints: []
        },
        {
            id: '4',
            name: 'Error Rate',
            value: 2.3,
            unit: '%',
            change: -1.2,
            trend: 'down',
            status: 'healthy',
            threshold: { warning: 3, critical: 5 },
            category: 'technical',
            dataPoints: []
        },
        {
            id: '5',
            name: 'Page Views/Min',
            value: 156,
            unit: '',
            change: 15.4,
            trend: 'up',
            status: 'healthy',
            threshold: { warning: 100, critical: 50 },
            category: 'user',
            dataPoints: []
        },
        {
            id: '6',
            name: 'CPU Usage',
            value: 67,
            unit: '%',
            change: 5.3,
            trend: 'up',
            status: 'warning',
            threshold: { warning: 70, critical: 85 },
            category: 'system',
            dataPoints: []
        },
        {
            id: '7',
            name: 'Memory Usage',
            value: 78,
            unit: '%',
            change: 2.1,
            trend: 'up',
            status: 'warning',
            threshold: { warning: 80, critical: 90 },
            category: 'system',
            dataPoints: []
        },
        {
            id: '8',
            name: 'Conversion Rate',
            value: 3.7,
            unit: '%',
            change: 0.8,
            trend: 'up',
            status: 'healthy',
            threshold: { warning: 2, critical: 1 },
            category: 'business',
            dataPoints: []
        }
    ])

    // System health state
    const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([
        {
            id: '1',
            component: 'Web Server',
            status: 'online',
            uptime: 99.97,
            responseTime: 145,
            errorRate: 0.12,
            lastCheck: '30 seconds ago',
            icon: 'server'
        },
        {
            id: '2',
            component: 'Database',
            status: 'online',
            uptime: 99.99,
            responseTime: 89,
            errorRate: 0.03,
            lastCheck: '15 seconds ago',
            icon: 'database'
        },
        {
            id: '3',
            component: 'API Gateway',
            status: 'degraded',
            uptime: 98.45,
            responseTime: 267,
            errorRate: 1.23,
            lastCheck: '45 seconds ago',
            icon: 'network'
        },
        {
            id: '4',
            component: 'Cache Layer',
            status: 'online',
            uptime: 99.85,
            responseTime: 12,
            errorRate: 0.01,
            lastCheck: '20 seconds ago',
            icon: 'cpu'
        },
        {
            id: '5',
            component: 'CDN',
            status: 'online',
            uptime: 99.92,
            responseTime: 56,
            errorRate: 0.08,
            lastCheck: '10 seconds ago',
            icon: 'globe'
        },
        {
            id: '6',
            component: 'Payment Gateway',
            status: 'offline',
            uptime: 97.23,
            responseTime: 0,
            errorRate: 100,
            lastCheck: '2 minutes ago',
            icon: 'dollar-sign'
        }
    ])

    // Real-time events
    const [realtimeEvents, setRealtimeEvents] = useState<RealTimeEvent[]>([
        {
            id: '1',
            timestamp: new Date(Date.now() - 30000).toISOString(),
            type: 'warning',
            message: 'API response time exceeded threshold',
            source: 'API Monitor',
            details: 'Average response time: 245ms (threshold: 200ms)',
            severity: 'medium'
        },
        {
            id: '2',
            timestamp: new Date(Date.now() - 120000).toISOString(),
            type: 'error',
            message: 'Payment gateway connection failed',
            source: 'Payment Service',
            details: 'Connection timeout after 30 seconds',
            severity: 'critical'
        },
        {
            id: '3',
            timestamp: new Date(Date.now() - 180000).toISOString(),
            type: 'success',
            message: 'Database backup completed successfully',
            source: 'Backup Service',
            details: 'Backup size: 2.4GB, Duration: 45 minutes',
            severity: 'low'
        },
        {
            id: '4',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'warning',
            message: 'High memory usage detected',
            source: 'System Monitor',
            details: 'Memory usage: 78% (threshold: 75%)',
            severity: 'medium'
        },
        {
            id: '5',
            timestamp: new Date(Date.now() - 450000).toISOString(),
            type: 'info',
            message: 'New user registration spike',
            source: 'User Analytics',
            details: '150% increase in registrations in the last hour',
            severity: 'low'
        }
    ])

    // Alert rules
    const [alertRules] = useState<AlertRule[]>([
        {
            id: '1',
            name: 'High CPU Usage',
            metric: 'cpu_usage',
            condition: 'greater_than',
            threshold: 80,
            enabled: true,
            notifications: ['email', 'slack'],
            lastTriggered: '2 hours ago'
        },
        {
            id: '2',
            name: 'Low Conversion Rate',
            metric: 'conversion_rate',
            condition: 'less_than',
            threshold: 2,
            enabled: true,
            notifications: ['email'],
            lastTriggered: 'Never'
        },
        {
            id: '3',
            name: 'API Response Time',
            metric: 'api_response_time',
            condition: 'greater_than',
            threshold: 200,
            enabled: true,
            notifications: ['email', 'slack', 'sms'],
            lastTriggered: '30 minutes ago'
        }
    ])

    // Simulate real-time updates
    useEffect(() => {
        if (!isLiveMode) return

        const interval = setInterval(() => {
            const now = Date.now()

            setLiveMetrics(prev => prev.map(metric => {
                const newValue = metric.value + (Math.random() - 0.5) * (metric.value * 0.05)
                const change = ((newValue - metric.value) / metric.value) * 100

                // Determine status based on thresholds
                let status: 'healthy' | 'warning' | 'critical' = 'healthy'
                if (newValue >= metric.threshold.critical) {
                    status = 'critical'
                } else if (newValue >= metric.threshold.warning) {
                    status = 'warning'
                }

                // Add new data point
                const newDataPoints = [...metric.dataPoints, { timestamp: now, value: newValue }]
                // Keep only last 50 data points for performance
                if (newDataPoints.length > 50) {
                    newDataPoints.shift()
                }

                return {
                    ...metric,
                    value: newValue,
                    change,
                    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
                    status,
                    dataPoints: newDataPoints
                }
            }))

            // Simulate system health updates
            setSystemHealth(prev => prev.map(system => ({
                ...system,
                responseTime: system.status === 'offline' ? 0 :
                    system.responseTime + (Math.random() - 0.5) * 20,
                errorRate: Math.max(0, system.errorRate + (Math.random() - 0.5) * 0.5),
                lastCheck: 'Just now'
            })))

            // Occasionally add new events
            if (Math.random() < 0.1) {
                const eventTypes: Array<'info' | 'warning' | 'error' | 'success'> = ['info', 'warning', 'error', 'success']
                const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical']
                const sources = ['System Monitor', 'API Gateway', 'Database', 'User Analytics', 'Payment Service']
                const messages = [
                    'Performance spike detected',
                    'New threshold reached',
                    'System optimization completed',
                    'User activity surge',
                    'Backup process initiated'
                ]

                const newEvent: RealTimeEvent = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: new Date().toISOString(),
                    type: eventTypes[Math.floor(Math.random() * eventTypes.length)] || 'info',
                    message: messages[Math.floor(Math.random() * messages.length)] || 'Unknown event',
                    source: sources[Math.floor(Math.random() * sources.length)] || 'system',
                    severity: severities[Math.floor(Math.random() * severities.length)] || 'low'
                }

                setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 19)]) // Keep only 20 events
            }
        }, 2000) // Update every 2 seconds

        return () => clearInterval(interval)
    }, [isLiveMode])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'online': return 'text-green-600 bg-green-100'
            case 'warning':
            case 'degraded': return 'text-yellow-600 bg-yellow-100'
            case 'critical':
            case 'offline': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-600 bg-green-100'
            case 'info': return 'text-blue-600 bg-blue-100'
            case 'warning': return 'text-yellow-600 bg-yellow-100'
            case 'error': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return 'border-green-200'
            case 'medium': return 'border-yellow-200'
            case 'high': return 'border-orange-200'
            case 'critical': return 'border-red-200'
            default: return 'border-gray-200'
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'business': return <DollarSign className="w-5 h-5" />
            case 'technical': return <Server className="w-5 h-5" />
            case 'user': return <Users className="w-5 h-5" />
            case 'system': return <Cpu className="w-5 h-5" />
            default: return <Activity className="w-5 h-5" />
        }
    }

    const filteredMetrics = selectedCategory === 'all'
        ? liveMetrics
        : liveMetrics.filter(metric => metric.category === selectedCategory)

    const criticalAlertsCount = liveMetrics.filter(m => m.status === 'critical').length
    const warningAlertsCount = liveMetrics.filter(m => m.status === 'warning').length

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
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h1 className="text-2xl font-bold">Real-time Analytics</h1>
                                        {isLiveMode && (
                                            <div className="flex items-center space-x-2 text-green-200">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-sm">Live</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-blue-100">Live monitoring and real-time data streams</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setIsLiveMode(!isLiveMode)}
                                className={`px-4 py-2 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors ${isLiveMode
                                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-100'
                                    : 'bg-white/20 hover:bg-white/30'
                                    }`}
                            >
                                {isLiveMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                <span>{isLiveMode ? 'Pause' : 'Start'}</span>
                            </button>
                            <button
                                onClick={() => setAlertsEnabled(!alertsEnabled)}
                                className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${alertsEnabled
                                    ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100'
                                    : 'bg-white/20 hover:bg-white/30'
                                    }`}
                            >
                                {alertsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                            </button>
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Alert Banner */}
                {(criticalAlertsCount > 0 || warningAlertsCount > 0) && alertsEnabled && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl mb-8 ${criticalAlertsCount > 0
                            ? 'bg-red-100 border-l-4 border-red-500'
                            : 'bg-yellow-100 border-l-4 border-yellow-500'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {criticalAlertsCount > 0 ?
                                    <AlertTriangle className="w-5 h-5 text-red-600" /> :
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                }
                                <div>
                                    <div className={`font-medium ${criticalAlertsCount > 0 ? 'text-red-800' : 'text-yellow-800'}`}>
                                        {criticalAlertsCount > 0
                                            ? `${criticalAlertsCount} Critical Alert${criticalAlertsCount > 1 ? 's' : ''}`
                                            : `${warningAlertsCount} Warning${warningAlertsCount > 1 ? 's' : ''}`
                                        }
                                    </div>
                                    <div className={`text-sm ${criticalAlertsCount > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                                        {criticalAlertsCount > 0
                                            ? 'Immediate attention required'
                                            : 'Monitor closely for potential issues'
                                        }
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-500 hover:text-gray-700">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8"
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="business">Business</option>
                                    <option value="technical">Technical</option>
                                    <option value="user">User</option>
                                    <option value="system">System</option>
                                </select>
                            </div>
                            <select
                                value={selectedTimeRange}
                                onChange={(e) => setSelectedTimeRange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="5m">Last 5 minutes</option>
                                <option value="15m">Last 15 minutes</option>
                                <option value="1h">Last hour</option>
                                <option value="24h">Last 24 hours</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('dashboard')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Layout className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Live Metrics */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden mb-8">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Live Metrics</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredMetrics.map((metric) => (
                                        <motion.div
                                            key={metric.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white rounded-xl p-6 shadow-lg border-l-4"
                                            style={{
                                                borderLeftColor:
                                                    metric.status === 'critical' ? '#EF4444' :
                                                        metric.status === 'warning' ? '#F59E0B' : '#10B981'
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    {getCategoryIcon(metric.category)}
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                                                    {metric.status}
                                                </span>
                                            </div>
                                            <div className="mb-2">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                                                </div>
                                                <div className="text-sm text-gray-600">{metric.name}</div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className={`flex items-center space-x-1 text-sm ${metric.trend === 'up' ? 'text-green-600' :
                                                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                                    }`}>
                                                    {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                                                        metric.trend === 'down' ? <TrendingDown className="w-4 h-4" /> :
                                                            <Activity className="w-4 h-4" />}
                                                    <span>{metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%</span>
                                                </div>
                                                {isLiveMode && (
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {systemHealth.map((system) => (
                                        <div key={system.id} className="bg-white rounded-xl p-6 shadow-lg">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        {system.icon === 'server' && <Server className="w-5 h-5" />}
                                                        {system.icon === 'database' && <Database className="w-5 h-5" />}
                                                        {system.icon === 'network' && <Network className="w-5 h-5" />}
                                                        {system.icon === 'cpu' && <Cpu className="w-5 h-5" />}
                                                        {system.icon === 'globe' && <Globe className="w-5 h-5" />}
                                                        {system.icon === 'dollar-sign' && <DollarSign className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{system.component}</h3>
                                                        <div className="text-sm text-gray-500">{system.lastCheck}</div>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system.status)}`}>
                                                    {system.status}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Uptime:</span>
                                                    <span className="font-medium">{system.uptime.toFixed(2)}%</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Response:</span>
                                                    <span className="font-medium">{system.responseTime}ms</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Error Rate:</span>
                                                    <span className="font-medium">{system.errorRate.toFixed(2)}%</span>
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
                        {/* Real-time Events */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Events</h3>
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {realtimeEvents.slice(0, 10).map((event) => (
                                    <div key={event.id} className={`p-3 border-l-2 rounded-lg bg-gray-50 ${getSeverityColor(event.severity)}`}>
                                        <div className="flex items-start justify-between mb-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                                                {event.type}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(event.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 mb-1">{event.message}</p>
                                        <p className="text-xs text-gray-600">{event.source}</p>
                                        {event.details && (
                                            <p className="text-xs text-gray-500 mt-1">{event.details}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Alert Rules */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Rules</h3>
                            <div className="space-y-3">
                                {alertRules.map((rule) => (
                                    <div key={rule.id} className="p-3 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900 text-sm">{rule.name}</h4>
                                            <div className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">
                                            {rule.metric} {rule.condition.replace('_', ' ')} {rule.threshold}
                                        </p>
                                        <div className="text-xs text-gray-500">
                                            Last triggered: {rule.lastTriggered || 'Never'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Metrics</span>
                                    <span className="font-medium">{liveMetrics.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Healthy</span>
                                    <span className="font-medium text-green-600">
                                        {liveMetrics.filter(m => m.status === 'healthy').length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Warnings</span>
                                    <span className="font-medium text-yellow-600">{warningAlertsCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Critical</span>
                                    <span className="font-medium text-red-600">{criticalAlertsCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Update Rate</span>
                                    <span className="font-medium">2s</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
