'use client'

import React from 'react'
/**
 * Integrations Page - Connected Services and API Management
 * Comprehensive integration hub for ControlAI Dashboard
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Plug, Globe, Key, Webhook, Database, Cloud, Shield,
    CheckCircle, XCircle, AlertTriangle, Plus, Settings,
    Zap, Link, RefreshCw, Eye, EyeOff, Copy, Edit,
    Trash2, ExternalLink, Monitor, Users, Bell,
    GitBranch, MessageSquare, BarChart3, Lock
} from 'lucide-react'

interface Integration {
    id: string
    name: string
    description: string
    category: 'development' | 'communication' | 'monitoring' | 'storage' | 'analytics'
    icon: string
    status: 'connected' | 'disconnected' | 'error' | 'pending'
    lastSync: string
    features: string[]
    credentials: any
    config: any
    usage?: {
        requests: number
        limit: number
        period: string
    }
}

interface Webhook {
    id: string
    name: string
    url: string
    events: string[]
    active: boolean
    lastTriggered: string
    successRate: number
}

interface ApiKey {
    id: string
    name: string
    key: string
    permissions: string[]
    lastUsed: string
    created: string
    expiresAt?: string
}

export default function IntegrationsPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'webhooks' | 'apikeys'>('overview')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [showApiKeys, setShowApiKeys] = useState(false)

    const [integrations, setIntegrations] = useState<Integration[]>([
        {
            id: 'github',
            name: 'GitHub',
            description: 'Source code management and CI/CD integration',
            category: 'development',
            icon: '🐙',
            status: 'connected',
            lastSync: '2 minutes ago',
            features: ['Repository access', 'Webhook events', 'Actions integration', 'Pull requests'],
            credentials: { type: 'OAuth', scopes: ['repo', 'workflow', 'read:user'] },
            config: { autoSync: true, notifications: true },
            usage: { requests: 1247, limit: 5000, period: 'hour' }
        },
        {
            id: 'slack',
            name: 'Slack',
            description: 'Team communication and notifications',
            category: 'communication',
            icon: '💬',
            status: 'connected',
            lastSync: '5 minutes ago',
            features: ['Message posting', 'Channel management', 'Bot integration', 'File sharing'],
            credentials: { type: 'Webhook', url: 'https://hooks.slack.com/services/...' },
            config: { defaultChannel: '#general', mentions: true },
            usage: { requests: 342, limit: 1000, period: 'hour' }
        },
        {
            id: 'aws',
            name: 'Amazon Web Services',
            description: 'Cloud infrastructure and deployment platform',
            category: 'storage',
            icon: '☁️',
            status: 'error',
            lastSync: '1 hour ago',
            features: ['EC2 management', 'S3 storage', 'Lambda functions', 'CloudWatch'],
            credentials: { type: 'API Key', keyId: 'AKIA...', region: 'us-east-1' },
            config: { region: 'us-east-1', autoScale: true },
            usage: { requests: 89, limit: 2000, period: 'hour' }
        },
        {
            id: 'docker',
            name: 'Docker Hub',
            description: 'Container registry and image management',
            category: 'development',
            icon: '🐳',
            status: 'disconnected',
            lastSync: 'Never',
            features: ['Image push/pull', 'Registry webhooks', 'Automated builds', 'Security scanning'],
            credentials: { type: 'Username/Password' },
            config: { autoPublish: false, scanOnPush: true }
        },
        {
            id: 'datadog',
            name: 'Datadog',
            description: 'Application performance monitoring and logging',
            category: 'monitoring',
            icon: '📊',
            status: 'connected',
            lastSync: '30 seconds ago',
            features: ['Metrics collection', 'Log aggregation', 'APM', 'Alerting'],
            credentials: { type: 'API Token' },
            config: { logLevel: 'info', alerting: true },
            usage: { requests: 2156, limit: 10000, period: 'hour' }
        },
        {
            id: 'stripe',
            name: 'Stripe',
            description: 'Payment processing and billing management',
            category: 'analytics',
            icon: '💳',
            status: 'connected',
            lastSync: '10 minutes ago',
            features: ['Payment processing', 'Subscription management', 'Analytics', 'Webhooks'],
            credentials: { type: 'API Key' },
            config: { currency: 'USD', webhooks: true },
            usage: { requests: 45, limit: 1000, period: 'hour' }
        },
        {
            id: 'sentry',
            name: 'Sentry',
            description: 'Error tracking and performance monitoring',
            category: 'monitoring',
            icon: '🐛',
            status: 'connected',
            lastSync: '1 minute ago',
            features: ['Error tracking', 'Performance monitoring', 'Release tracking', 'Alerts'],
            credentials: { type: 'DSN' },
            config: { environment: 'production', sampling: 0.1 },
            usage: { requests: 156, limit: 5000, period: 'hour' }
        },
        {
            id: 'mongodb',
            name: 'MongoDB Atlas',
            description: 'Cloud database service',
            category: 'storage',
            icon: '🍃',
            status: 'pending',
            lastSync: 'Connecting...',
            features: ['Database hosting', 'Backup management', 'Monitoring', 'Scaling'],
            credentials: { type: 'Connection String' },
            config: { cluster: 'production', backups: true }
        }
    ])

    const [webhooks, setWebhooks] = useState<Webhook[]>([
        {
            id: 'deploy',
            name: 'Deployment Notifications',
            url: 'https://api.controlai.com/webhooks/deploy',
            events: ['deployment.started', 'deployment.completed', 'deployment.failed'],
            active: true,
            lastTriggered: '2 hours ago',
            successRate: 98.5
        },
        {
            id: 'alerts',
            name: 'System Alerts',
            url: 'https://api.controlai.com/webhooks/alerts',
            events: ['alert.critical', 'alert.warning', 'alert.resolved'],
            active: true,
            lastTriggered: '5 minutes ago',
            successRate: 99.2
        },
        {
            id: 'analytics',
            name: 'Analytics Events',
            url: 'https://api.controlai.com/webhooks/analytics',
            events: ['analytics.report', 'analytics.threshold', 'analytics.anomaly'],
            active: false,
            lastTriggered: 'Never',
            successRate: 0
        }
    ])

    const [apiKeys, setApiKeys] = useState<ApiKey[]>([
        {
            id: 'prod',
            name: 'Production API Key',
            key: 'cai_prod_sk_1234567890abcdef',
            permissions: ['read', 'write', 'admin'],
            lastUsed: '2 minutes ago',
            created: '2024-01-15',
            expiresAt: '2025-01-15'
        },
        {
            id: 'staging',
            name: 'Staging Environment',
            key: 'cai_staging_sk_abcdef1234567890',
            permissions: ['read', 'write'],
            lastUsed: '1 hour ago',
            created: '2024-01-10',
            expiresAt: '2025-01-10'
        },
        {
            id: 'dev',
            name: 'Development Key',
            key: 'cai_dev_sk_fedcba0987654321',
            permissions: ['read'],
            lastUsed: '1 day ago',
            created: '2024-01-05'
        }
    ])

    const categories = [
        { id: 'all', label: 'All Categories', count: integrations.length },
        { id: 'development', label: 'Development', count: integrations.filter(i => i.category === 'development').length },
        { id: 'communication', label: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
        { id: 'monitoring', label: 'Monitoring', count: integrations.filter(i => i.category === 'monitoring').length },
        { id: 'storage', label: 'Storage', count: integrations.filter(i => i.category === 'storage').length },
        { id: 'analytics', label: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length }
    ]

    const filteredIntegrations = integrations.filter(integration => {
        const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
        const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            integration.description.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'text-green-600 dark:text-green-400'
            case 'error': return 'text-red-600 dark:text-red-400'
            case 'pending': return 'text-yellow-600 dark:text-yellow-400'
            case 'disconnected': return 'text-gray-600 dark:text-gray-400'
            default: return 'text-gray-600 dark:text-gray-400'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return CheckCircle
            case 'error': return XCircle
            case 'pending': return RefreshCw
            case 'disconnected': return XCircle
            default: return XCircle
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'connected': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            case 'error': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            case 'disconnected': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }
    }

    const connectedCount = integrations.filter(i => i.status === 'connected').length
    const totalUsage = integrations.reduce((sum, i) => sum + (i.usage?.requests || 0), 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-green-900/20">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Integrations Hub
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage connected services, APIs, and webhooks
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>Add Integration</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <RefreshCw className="w-4 h-4" />
                                <span>Sync All</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100">Connected Services</p>
                                    <p className="text-2xl font-bold">{connectedCount}</p>
                                </div>
                                <Plug className="w-8 h-8 text-blue-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100">API Requests</p>
                                    <p className="text-2xl font-bold">{totalUsage.toLocaleString()}</p>
                                </div>
                                <BarChart3 className="w-8 h-8 text-green-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100">Active Webhooks</p>
                                    <p className="text-2xl font-bold">{webhooks.filter(w => w.active).length}</p>
                                </div>
                                <Webhook className="w-8 h-8 text-purple-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100">API Keys</p>
                                    <p className="text-2xl font-bold">{apiKeys.length}</p>
                                </div>
                                <Key className="w-8 h-8 text-orange-200" />
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
                            { id: 'overview', label: 'Overview', icon: Globe },
                            { id: 'services', label: 'Connected Services', icon: Plug },
                            { id: 'webhooks', label: 'Webhooks', icon: Webhook },
                            { id: 'apikeys', label: 'API Keys', icon: Key }
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
                        {/* Integration Status Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Connection Health */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                    <Monitor className="w-6 h-6 mr-3 text-blue-500" />
                                    Connection Health
                                </h3>

                                <div className="space-y-4">
                                    {integrations.slice(0, 5).map((integration) => {
                                        const StatusIcon = getStatusIcon(integration.status)
                                        return (
                                            <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-xl">{integration.icon}</span>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {integration.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Last sync: {integration.lastSync}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {integration.usage && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                                            <div>{integration.usage.requests}/{integration.usage.limit}</div>
                                                            <div>requests/hour</div>
                                                        </div>
                                                    )}
                                                    <StatusIcon className={`w-5 h-5 ${getStatusColor(integration.status)}`} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                    <Bell className="w-6 h-6 mr-3 text-green-500" />
                                    Recent Activity
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                GitHub sync completed
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                2 minutes ago • 47 repositories updated
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                Slack notification sent
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                5 minutes ago • Deployment alert to #engineering
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                Datadog metrics updated
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                30 seconds ago • Performance data collected
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                AWS connection error
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                1 hour ago • Authentication failed, requires attention
                                            </div>
                                        </div>
                                    </div>
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
                                            <div className="font-medium text-blue-900 dark:text-blue-100">Add Service</div>
                                            <div className="text-sm text-blue-700 dark:text-blue-300">Connect new integration</div>
                                        </div>
                                    </div>
                                </button>

                                <button className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 transition-all duration-200">
                                    <div className="flex items-center space-x-3">
                                        <Key className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        <div className="text-left">
                                            <div className="font-medium text-green-900 dark:text-green-100">New API Key</div>
                                            <div className="text-sm text-green-700 dark:text-green-300">Generate access token</div>
                                        </div>
                                    </div>
                                </button>

                                <button className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transition-all duration-200">
                                    <div className="flex items-center space-x-3">
                                        <Webhook className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        <div className="text-left">
                                            <div className="font-medium text-purple-900 dark:text-purple-100">Add Webhook</div>
                                            <div className="text-sm text-purple-700 dark:text-purple-300">Create event listener</div>
                                        </div>
                                    </div>
                                </button>

                                <button className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-xl hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 transition-all duration-200">
                                    <div className="flex items-center space-x-3">
                                        <RefreshCw className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        <div className="text-left">
                                            <div className="font-medium text-orange-900 dark:text-orange-100">Sync All</div>
                                            <div className="text-sm text-orange-700 dark:text-orange-300">Refresh connections</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'services' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Filters */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search integrations..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
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
                            </div>

                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>Browse Marketplace</span>
                            </button>
                        </div>

                        {/* Integrations Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredIntegrations.map((integration) => {
                                const StatusIcon = getStatusIcon(integration.status)
                                return (
                                    <motion.div
                                        key={integration.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-3xl">{integration.icon}</span>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {integration.name}
                                                    </h3>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(integration.status)}`}>
                                                        {integration.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            {integration.description}
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Last sync:</span>
                                                <span className="text-gray-900 dark:text-white">{integration.lastSync}</span>
                                            </div>

                                            {integration.usage && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500 dark:text-gray-400">Usage:</span>
                                                        <span className="text-gray-900 dark:text-white">
                                                            {integration.usage.requests}/{integration.usage.limit} per {integration.usage.period}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{
                                                                width: `${Math.min((integration.usage.requests / integration.usage.limit) * 100, 100)}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-1">
                                                {integration.features.slice(0, 3).map((feature, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                                {integration.features.length > 3 && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                                        +{integration.features.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                                Configure
                                            </button>

                                            <div className="flex items-center space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" title="Test connection">
                                                    <Zap className="w-4 h-4" />
                                                </button>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={integration.status === 'connected'}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'webhooks' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Webhooks Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Webhook Endpoints
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Configure event-driven integrations
                                </p>
                            </div>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>Add Webhook</span>
                            </button>
                        </div>

                        {/* Webhooks List */}
                        <div className="space-y-4">
                            {webhooks.map((webhook) => (
                                <div
                                    key={webhook.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {webhook.name}
                                                </h3>
                                                <span className={`text-xs px-2 py-1 rounded-full ${webhook.active
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {webhook.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                                    {webhook.url}
                                                </code>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {webhook.events.map((event, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded"
                                                    >
                                                        {event}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span>Success rate: {webhook.successRate}%</span>
                                                <span>•</span>
                                                <span>Last triggered: {webhook.lastTriggered}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Test webhook">
                                                <Zap className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors" title="Edit webhook">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete webhook">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={webhook.active}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'apikeys' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* API Keys Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    API Keys
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Manage authentication tokens and access keys
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowApiKeys(!showApiKeys)}
                                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    <span>{showApiKeys ? 'Hide' : 'Show'} Keys</span>
                                </button>
                                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    <span>Generate Key</span>
                                </button>
                            </div>
                        </div>

                        {/* API Keys List */}
                        <div className="space-y-4">
                            {apiKeys.map((apiKey) => (
                                <div
                                    key={apiKey.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {apiKey.name}
                                                </h3>
                                                <div className="flex space-x-1">
                                                    {apiKey.permissions.map((permission) => (
                                                        <span
                                                            key={permission}
                                                            className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                                                        >
                                                            {permission}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                <span className="font-mono">
                                                    {showApiKeys ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                                                </span>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(apiKey.key)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    title="Copy to clipboard"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span>Created: {apiKey.created}</span>
                                                <span>•</span>
                                                <span>Last used: {apiKey.lastUsed}</span>
                                                {apiKey.expiresAt && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Expires: {apiKey.expiresAt}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors" title="Regenerate key">
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Revoke key">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Security Notice */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                            <div className="flex items-start space-x-3">
                                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                        API Key Security Best Practices
                                    </h4>
                                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                        <li>• Store API keys securely and never commit them to version control</li>
                                        <li>• Use environment variables or secure key management systems</li>
                                        <li>• Rotate keys regularly and revoke unused ones immediately</li>
                                        <li>• Monitor API key usage for suspicious activity</li>
                                        <li>• Use least privilege principle when setting permissions</li>
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

