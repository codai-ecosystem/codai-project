'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Box,
    Zap,
    Pause,
    Activity,
    Workflow,
    Plus,
    ArrowUpRight,
    Clock,
    Download,
    Star,
    Layers,
    BarChart3,
    PieChart,
    TrendingUp,
    CheckCircle,
    AlertTriangle,
    XCircle,
    RefreshCw,
    PlayCircle,
    Rocket
} from 'lucide-react'

// TypeScript interfaces for MOD automation builder data structures
interface AutomationMetrics {
    totalModules: number
    activeWorkflows: number
    connectionsCount: number
    executionsToday: number
    monthlyExecutions: number
    executionGrowth: number
    averageExecutionTime: number
    successRate: number
    errorRate: number
    uptime: number
}

interface WorkflowItem {
    id: string
    name: string
    description: string
    modules: number
    status: 'running' | 'paused' | 'stopped' | 'error'
    lastRun: string
    nextRun: string
    executionTime: number
    successRate: number
    owner: string
    tags: string[]
    isPublic: boolean
    executionsToday: number
}

interface ExecutionLog {
    id: string
    workflowId: string
    workflowName: string
    status: 'success' | 'error' | 'warning' | 'running'
    startTime: string
    duration: number
    trigger: 'manual' | 'scheduled' | 'webhook' | 'api'
    errorMessage?: string
    executedModules: number
    totalModules: number
}

interface Template {
    id: string
    name: string
    description: string
    category: string
    modules: number
    downloads: number
    rating: number
    author: string
    isOfficial: boolean
    tags: string[]
    preview: string
    complexity: 'beginner' | 'intermediate' | 'advanced'
}

export default function ModDashboard() {
    const [activeTab, setActiveTab] = useState('overview')
    const [refreshing, setRefreshing] = useState(false)

    // Mock data for automation metrics with real-time simulation
    const [metrics, setMetrics] = useState<AutomationMetrics>({
        totalModules: 156,
        activeWorkflows: 23,
        connectionsCount: 342,
        executionsToday: 1247,
        monthlyExecutions: 38420,
        executionGrowth: 15.7,
        averageExecutionTime: 1.4,
        successRate: 98.7,
        errorRate: 1.3,
        uptime: 99.8
    })

    // Mock data for modules library

    // Mock data for active workflows
    const [workflows] = useState<WorkflowItem[]>([
        {
            id: 'wf1',
            name: 'Customer Onboarding Automation',
            description: 'Automated customer registration, verification, and welcome sequence',
            modules: 8,
            status: 'running',
            lastRun: '2025-08-08T14:32:00Z',
            nextRun: '2025-08-08T15:00:00Z',
            executionTime: 2.3,
            successRate: 96.8,
            owner: 'Alexandru Popescu',
            tags: ['customer', 'onboarding', 'email'],
            isPublic: false,
            executionsToday: 24
        },
        {
            id: 'wf2',
            name: 'Data Sync Pipeline',
            description: 'Synchronize data between multiple systems and databases',
            modules: 5,
            status: 'running',
            lastRun: '2025-08-08T14:15:00Z',
            nextRun: '2025-08-08T16:00:00Z',
            executionTime: 1.8,
            successRate: 99.2,
            owner: 'Maria Ionescu',
            tags: ['data', 'sync', 'database'],
            isPublic: true,
            executionsToday: 12
        },
        {
            id: 'wf3',
            name: 'Report Generator',
            description: 'Generate and distribute automated reports to stakeholders',
            modules: 6,
            status: 'paused',
            lastRun: '2025-08-08T13:45:00Z',
            nextRun: '2025-08-08T18:00:00Z',
            executionTime: 3.1,
            successRate: 98.5,
            owner: 'Andrei Gheorghe',
            tags: ['reports', 'analytics', 'email'],
            isPublic: false,
            executionsToday: 8
        },
        {
            id: 'wf4',
            name: 'Social Media Scheduler',
            description: 'Schedule and publish content across social media platforms',
            modules: 7,
            status: 'running',
            lastRun: '2025-08-08T14:30:00Z',
            nextRun: '2025-08-08T17:00:00Z',
            executionTime: 1.2,
            successRate: 97.3,
            owner: 'Elena Munteanu',
            tags: ['social', 'content', 'scheduler'],
            isPublic: true,
            executionsToday: 18
        },
        {
            id: 'wf5',
            name: 'Inventory Management',
            description: 'Monitor inventory levels and trigger reorder workflows',
            modules: 9,
            status: 'running',
            lastRun: '2025-08-08T14:28:00Z',
            nextRun: '2025-08-08T15:30:00Z',
            executionTime: 2.7,
            successRate: 99.1,
            owner: 'Cristian Pavel',
            tags: ['inventory', 'supply', 'alerts'],
            isPublic: false,
            executionsToday: 15
        }
    ])

    // Mock data for recent execution logs
    const [executionLogs] = useState<ExecutionLog[]>([
        {
            id: 'exec1',
            workflowId: 'wf1',
            workflowName: 'Customer Onboarding Automation',
            status: 'success',
            startTime: '2025-08-08T14:32:15Z',
            duration: 2.3,
            trigger: 'webhook',
            executedModules: 8,
            totalModules: 8
        },
        {
            id: 'exec2',
            workflowId: 'wf4',
            workflowName: 'Social Media Scheduler',
            status: 'success',
            startTime: '2025-08-08T14:30:42Z',
            duration: 1.2,
            trigger: 'scheduled',
            executedModules: 7,
            totalModules: 7
        },
        {
            id: 'exec3',
            workflowId: 'wf5',
            workflowName: 'Inventory Management',
            status: 'warning',
            startTime: '2025-08-08T14:28:33Z',
            duration: 2.7,
            trigger: 'api',
            executedModules: 8,
            totalModules: 9,
            errorMessage: 'Module timeout warning: Email notification delayed'
        },
        {
            id: 'exec4',
            workflowId: 'wf2',
            workflowName: 'Data Sync Pipeline',
            status: 'success',
            startTime: '2025-08-08T14:15:28Z',
            duration: 1.8,
            trigger: 'scheduled',
            executedModules: 5,
            totalModules: 5
        },
        {
            id: 'exec5',
            workflowId: 'wf1',
            workflowName: 'Customer Onboarding Automation',
            status: 'error',
            startTime: '2025-08-08T14:10:15Z',
            duration: 0.8,
            trigger: 'manual',
            executedModules: 3,
            totalModules: 8,
            errorMessage: 'Database connection timeout in module: Database Writer'
        }
    ])

    // Mock data for popular templates
    const [templates] = useState<Template[]>([
        {
            id: 'temp1',
            name: 'E-commerce Order Processing',
            description: 'Complete order processing workflow with payment verification and shipping',
            category: 'E-commerce',
            modules: 12,
            downloads: 1847,
            rating: 4.9,
            author: 'MOD Team',
            isOfficial: true,
            tags: ['ecommerce', 'orders', 'payment', 'shipping'],
            preview: '/templates/ecommerce-order.png',
            complexity: 'intermediate'
        },
        {
            id: 'temp2',
            name: 'Lead Generation Pipeline',
            description: 'Automated lead capture, scoring, and nurturing workflow',
            category: 'Marketing',
            modules: 8,
            downloads: 2134,
            rating: 4.8,
            author: 'Marketing Pro',
            isOfficial: false,
            tags: ['marketing', 'leads', 'crm', 'automation'],
            preview: '/templates/lead-generation.png',
            complexity: 'beginner'
        },
        {
            id: 'temp3',
            name: 'Content Moderation System',
            description: 'AI-powered content moderation with human review fallback',
            category: 'AI & ML',
            modules: 6,
            downloads: 892,
            rating: 4.7,
            author: 'AI Specialist',
            isOfficial: false,
            tags: ['ai', 'moderation', 'content', 'review'],
            preview: '/templates/content-moderation.png',
            complexity: 'advanced'
        },
        {
            id: 'temp4',
            name: 'Employee Onboarding',
            description: 'HR automation for new employee setup and training scheduling',
            category: 'HR',
            modules: 10,
            downloads: 1456,
            rating: 4.6,
            author: 'HR Solutions',
            isOfficial: true,
            tags: ['hr', 'onboarding', 'training', 'automation'],
            preview: '/templates/hr-onboarding.png',
            complexity: 'intermediate'
        }
    ])

    // Simulated real-time data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                executionsToday: prev.executionsToday + Math.floor(Math.random() * 3),
                activeWorkflows: prev.activeWorkflows + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)
            }))
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    // Simulated data refresh
    const handleRefresh = async () => {
        setRefreshing(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Update metrics with variations
        setMetrics(prev => ({
            ...prev,
            executionsToday: prev.executionsToday + Math.floor(Math.random() * 50),
            monthlyExecutions: prev.monthlyExecutions + Math.floor(Math.random() * 200),
            executionGrowth: prev.executionGrowth + (Math.random() - 0.5) * 5,
            successRate: Math.min(99.9, prev.successRate + (Math.random() - 0.5) * 2),
            averageExecutionTime: Math.max(0.5, prev.averageExecutionTime + (Math.random() - 0.5) * 0.5)
        }))

        setRefreshing(false)
    }

    // Get status icon and color
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case 'running': return <PlayCircle className="h-4 w-4 text-blue-500" />
            case 'active': return <Activity className="h-4 w-4 text-green-500" />
            case 'paused': return <Pause className="h-4 w-4 text-gray-500" />
            default: return <Clock className="h-4 w-4 text-gray-400" />
        }
    }

    // Format time duration
    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds.toFixed(1)}s`
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}m ${remainingSeconds.toFixed(0)}s`
    }

    // Format time ago
    const formatTimeAgo = (dateString: string) => {
        const now = new Date()
        const date = new Date(dateString)
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ago`
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays}d ago`
    }

    // Tab navigation options
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'workflows', label: 'Workflows', icon: Workflow },
        { id: 'modules', label: 'Module Library', icon: Box },
        { id: 'executions', label: 'Execution Logs', icon: Activity },
        { id: 'templates', label: 'Templates', icon: Layers },
        { id: 'analytics', label: 'Analytics', icon: PieChart }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
            {/* Enhanced Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md border-b border-purple-200 shadow-sm sticky top-0 z-40"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-xl">
                                    <Box className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                                        MOD Dashboard
                                    </h1>
                                    <p className="text-sm text-gray-500">Modular Automation Builder</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-2">
                                    <Workflow className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium">{metrics.activeWorkflows}</span>
                                    <span className="text-gray-500">active</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Zap className="h-4 w-4 text-indigo-600" />
                                    <span className="font-medium">{metrics.executionsToday.toLocaleString()}</span>
                                    <span className="text-gray-500">today</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Activity className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium">{metrics.successRate}%</span>
                                    <span className="text-gray-500">success</span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                            >
                                {refreshing ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </motion.div>
                                ) : (
                                    <span className="flex items-center space-x-2">
                                        <RefreshCw className="h-4 w-4" />
                                        <span>Refresh</span>
                                    </span>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Tabbed Navigation */}
            <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white/60 backdrop-blur-sm border-b border-purple-100"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-purple-500 text-purple-600 font-medium'
                                        : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </motion.button>
                            )
                        })}
                    </div>
                </div>
            </motion.nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Modules</p>
                                        <p className="text-2xl font-bold text-gray-900">{metrics.totalModules}</p>
                                        <div className="flex items-center mt-2">
                                            <Box className="h-4 w-4 text-purple-500" />
                                            <span className="text-sm text-purple-600 font-medium ml-1">
                                                Library
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl">
                                        <Box className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100 shadow-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Active Workflows</p>
                                        <p className="text-2xl font-bold text-gray-900">{metrics.activeWorkflows}</p>
                                        <div className="flex items-center mt-2">
                                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                                            <span className="text-sm text-green-600 font-medium ml-1">
                                                +{metrics.executionGrowth.toFixed(1)}%
                                            </span>
                                            <span className="text-sm text-gray-500 ml-1">this month</span>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-3 rounded-xl">
                                        <Workflow className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Executions Today</p>
                                        <p className="text-2xl font-bold text-gray-900">{metrics.executionsToday.toLocaleString()}</p>
                                        <div className="flex items-center mt-2">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm text-blue-600 font-medium ml-1">
                                                {formatDuration(metrics.averageExecutionTime)}
                                            </span>
                                            <span className="text-sm text-gray-500 ml-1">avg time</span>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                                        <Zap className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Success Rate</p>
                                        <p className="text-2xl font-bold text-gray-900">{metrics.successRate}%</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                            <span className="text-sm text-green-600 font-medium ml-1">
                                                {metrics.uptime}%
                                            </span>
                                            <span className="text-sm text-gray-500 ml-1">uptime</span>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl">
                                        <CheckCircle className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Plus className="h-5 w-5" />
                                        <span>Create Workflow</span>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Box className="h-5 w-5" />
                                        <span>Browse Modules</span>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Layers className="h-5 w-5" />
                                        <span>Use Template</span>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <BarChart3 className="h-5 w-5" />
                                        <span>View Analytics</span>
                                    </div>
                                </motion.button>
                            </div>
                        </div>

                        {/* Active Workflows & Recent Executions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Active Workflows */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Active Workflows</h3>
                                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                                        View All
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {workflows.slice(0, 4).map((workflow, index) => (
                                        <motion.div
                                            key={workflow.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="flex items-center justify-between p-4 bg-purple-50/50 rounded-xl border border-purple-100 hover:bg-purple-50 transition-colors duration-200 cursor-pointer"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg">
                                                    {getStatusIcon(workflow.status)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{workflow.name}</p>
                                                    <p className="text-sm text-gray-600">{workflow.modules} modules • {workflow.executionsToday} executions today</p>
                                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                        <span>Last run: {formatTimeAgo(workflow.lastRun)}</span>
                                                        <span>•</span>
                                                        <span className={`px-2 py-1 rounded-full ${workflow.status === 'running'
                                                            ? 'bg-green-100 text-green-700'
                                                            : workflow.status === 'paused'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {workflow.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-purple-600">
                                                    {workflow.successRate.toFixed(1)}%
                                                </p>
                                                <p className="text-xs text-gray-500">success rate</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Recent Executions */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100 shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Recent Executions</h3>
                                    <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                        View Logs
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {executionLogs.slice(0, 5).map((log, index) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-2 rounded-lg">
                                                    {getStatusIcon(log.status)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{log.workflowName}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {formatTimeAgo(log.startTime)} • {formatDuration(log.duration)} • {log.trigger}
                                                    </p>
                                                    {log.errorMessage && (
                                                        <p className="text-xs text-red-600 mt-1">{log.errorMessage}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs px-2 py-1 rounded-full ${log.status === 'success'
                                                    ? 'bg-green-100 text-green-700'
                                                    : log.status === 'error'
                                                        ? 'bg-red-100 text-red-700'
                                                        : log.status === 'warning'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {log.status}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {log.executedModules}/{log.totalModules} modules
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Popular Templates Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Popular Templates</h3>
                                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                                    Browse All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {templates.map((template, index) => (
                                    <motion.div
                                        key={template.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="relative">
                                            <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center">
                                                <Layers className="h-12 w-12 text-purple-500 opacity-30" />
                                            </div>
                                            {template.isOfficial && (
                                                <div className="absolute top-2 right-2 bg-purple-500 text-white p-1 rounded-full">
                                                    <Star className="h-3 w-3" />
                                                </div>
                                            )}
                                            <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium ${template.complexity === 'beginner'
                                                ? 'bg-green-100 text-green-700'
                                                : template.complexity === 'intermediate'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {template.complexity}
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1">
                                                {template.name}
                                            </h4>
                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                                {template.description}
                                            </p>

                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Box className="h-3 w-3" />
                                                    <span>{template.modules} modules</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Download className="h-3 w-3" />
                                                    <span>{template.downloads.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-3 w-3 text-yellow-500" />
                                                    <span className="text-xs text-gray-600">{template.rating}</span>
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:shadow-lg transition-all duration-200"
                                                >
                                                    Use Template
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Other tabs content placeholders */}
                {activeTab !== 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-100 shadow-lg text-center"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {tabs.find(tab => tab.id === activeTab)?.label}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            This section will be implemented in the next development phase with comprehensive features for {activeTab}.
                        </p>
                        <div className="inline-flex items-center space-x-2 text-purple-600">
                            <Rocket className="h-5 w-5" />
                            <span className="font-medium">Coming Soon</span>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Enhanced Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white/60 backdrop-blur-sm border-t border-purple-100 mt-16"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-6 rounded-2xl"
                        >
                            <Workflow className="h-8 w-8 mb-3" />
                            <h3 className="font-bold text-lg mb-2">Visual Builder</h3>
                            <p className="text-purple-100 text-sm mb-4">
                                Create complex workflows with our intuitive drag-and-drop interface.
                            </p>
                            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                                Start Building
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-6 rounded-2xl"
                        >
                            <Box className="h-8 w-8 mb-3" />
                            <h3 className="font-bold text-lg mb-2">Module Library</h3>
                            <p className="text-indigo-100 text-sm mb-4">
                                Access 150+ pre-built modules for any automation scenario.
                            </p>
                            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                                Explore Modules
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-2xl"
                        >
                            <Layers className="h-8 w-8 mb-3" />
                            <h3 className="font-bold text-lg mb-2">Ready Templates</h3>
                            <p className="text-blue-100 text-sm mb-4">
                                Get started instantly with proven automation templates.
                            </p>
                            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                                Browse Templates
                            </button>
                        </motion.div>
                    </div>

                    <div className="text-center mt-8 pt-6 border-t border-purple-200">
                        <p className="text-gray-600 text-sm">
                            © 2025 MOD - Modular Automation Builder. Part of the CODAI Ecosystem.
                        </p>
                    </div>
                </div>
            </motion.footer>
        </div>
    )
}

