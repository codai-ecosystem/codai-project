'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Zap,
    Plus,
    Search,
    Filter,
    Settings,
    CheckCircle,
    AlertCircle,
    Clock,
    Mail,
    Cloud,
    CreditCard,
    Users,
    Calendar,
    BarChart3,
    MessageSquare,
    Code,
    RefreshCw,
    Layers
} from 'lucide-react'

// TypeScript interfaces for Integrations Hub
interface Integration {
    id: string
    name: string
    description: string
    category: string
    provider: string
    status: 'connected' | 'disconnected' | 'error' | 'pending'
    lastSync: string
    syncFrequency: string
    apiVersion: string
    config: {
        endpoint?: string
        authType: 'oauth' | 'api_key' | 'basic' | 'jwt'
        permissions: string[]
        rateLimits: {
            requests: number
            period: string
        }
    }
    stats: {
        totalRequests: number
        successRate: number
        avgResponseTime: number
        lastError?: string
    }
    icon: React.ComponentType<any>
    color: string
    featured: boolean
}

interface IntegrationCategory {
    id: string
    name: string
    icon: React.ComponentType<any>
    count: number
    description: string
}

export default function IntegrationsHub() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

    // Integration categories
    const categories: IntegrationCategory[] = [
        { id: 'all', name: 'All Integrations', icon: Layers, count: 48, description: 'Browse all available integrations' },
        { id: 'crm', name: 'CRM', icon: Users, count: 8, description: 'Customer relationship management' },
        { id: 'communication', name: 'Communication', icon: Mail, count: 6, description: 'Email, SMS, and messaging' },
        { id: 'storage', name: 'Cloud Storage', icon: Cloud, count: 5, description: 'File storage and management' },
        { id: 'payment', name: 'Payment', icon: CreditCard, count: 4, description: 'Payment processing' },
        { id: 'analytics', name: 'Analytics', icon: BarChart3, count: 7, description: 'Data analytics and reporting' },
        { id: 'social', name: 'Social Media', icon: MessageSquare, count: 6, description: 'Social media platforms' },
        { id: 'productivity', name: 'Productivity', icon: Calendar, count: 8, description: 'Task and project management' },
        { id: 'development', name: 'Development', icon: Code, count: 4, description: 'Developer tools and APIs' }
    ]

    // Sample integrations
    const integrations: Integration[] = [
        {
            id: 'int-1',
            name: 'Salesforce CRM',
            description: 'Connect with Salesforce to sync leads, contacts, and opportunities.',
            category: 'crm',
            provider: 'Salesforce',
            status: 'connected',
            lastSync: '2024-01-20T10:30:00Z',
            syncFrequency: 'every 15 minutes',
            apiVersion: 'v58.0',
            config: {
                endpoint: 'https://your-instance.salesforce.com',
                authType: 'oauth',
                permissions: ['read_leads', 'write_contacts', 'read_opportunities'],
                rateLimits: {
                    requests: 100000,
                    period: '24 hours'
                }
            },
            stats: {
                totalRequests: 12847,
                successRate: 99.2,
                avgResponseTime: 245,
                lastError: undefined
            },
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            featured: true
        },
        {
            id: 'int-2',
            name: 'Gmail API',
            description: 'Send emails, manage labels, and access Gmail data programmatically.',
            category: 'communication',
            provider: 'Google',
            status: 'connected',
            lastSync: '2024-01-20T09:15:00Z',
            syncFrequency: 'real-time',
            apiVersion: 'v1',
            config: {
                endpoint: 'https://gmail.googleapis.com',
                authType: 'oauth',
                permissions: ['gmail.send', 'gmail.readonly', 'gmail.labels'],
                rateLimits: {
                    requests: 1000000000,
                    period: '100 seconds'
                }
            },
            stats: {
                totalRequests: 45623,
                successRate: 98.7,
                avgResponseTime: 180,
                lastError: undefined
            },
            icon: Mail,
            color: 'from-red-500 to-red-600',
            featured: true
        },
        {
            id: 'int-3',
            name: 'Stripe Payments',
            description: 'Process payments, manage subscriptions, and handle billing automation.',
            category: 'payment',
            provider: 'Stripe',
            status: 'connected',
            lastSync: '2024-01-20T08:45:00Z',
            syncFrequency: 'every 5 minutes',
            apiVersion: '2023-10-16',
            config: {
                endpoint: 'https://api.stripe.com',
                authType: 'api_key',
                permissions: ['payments', 'customers', 'subscriptions'],
                rateLimits: {
                    requests: 100,
                    period: '1 second'
                }
            },
            stats: {
                totalRequests: 8934,
                successRate: 99.8,
                avgResponseTime: 120,
                lastError: undefined
            },
            icon: CreditCard,
            color: 'from-purple-500 to-purple-600',
            featured: true
        },
        {
            id: 'int-4',
            name: 'Google Drive',
            description: 'Store, sync, and share files with Google Drive integration.',
            category: 'storage',
            provider: 'Google',
            status: 'error',
            lastSync: '2024-01-19T14:20:00Z',
            syncFrequency: 'every 30 minutes',
            apiVersion: 'v3',
            config: {
                endpoint: 'https://www.googleapis.com/drive',
                authType: 'oauth',
                permissions: ['drive.file', 'drive.readonly'],
                rateLimits: {
                    requests: 1000,
                    period: '100 seconds'
                }
            },
            stats: {
                totalRequests: 2341,
                successRate: 89.3,
                avgResponseTime: 290,
                lastError: 'Authentication token expired'
            },
            icon: Cloud,
            color: 'from-green-500 to-green-600',
            featured: false
        },
        {
            id: 'int-5',
            name: 'Slack Workspace',
            description: 'Send messages, create channels, and manage Slack workspace automation.',
            category: 'communication',
            provider: 'Slack',
            status: 'connected',
            lastSync: '2024-01-20T11:00:00Z',
            syncFrequency: 'real-time',
            apiVersion: 'v1.7',
            config: {
                endpoint: 'https://slack.com/api',
                authType: 'oauth',
                permissions: ['chat:write', 'channels:read', 'users:read'],
                rateLimits: {
                    requests: 1,
                    period: '1 second'
                }
            },
            stats: {
                totalRequests: 15672,
                successRate: 97.4,
                avgResponseTime: 156,
                lastError: undefined
            },
            icon: MessageSquare,
            color: 'from-indigo-500 to-indigo-600',
            featured: false
        },
        {
            id: 'int-6',
            name: 'HubSpot CRM',
            description: 'Sync contacts, deals, and marketing data with HubSpot.',
            category: 'crm',
            provider: 'HubSpot',
            status: 'disconnected',
            lastSync: '2024-01-15T16:30:00Z',
            syncFrequency: 'every 1 hour',
            apiVersion: 'v3',
            config: {
                endpoint: 'https://api.hubapi.com',
                authType: 'api_key',
                permissions: ['contacts', 'deals', 'companies'],
                rateLimits: {
                    requests: 100,
                    period: '10 seconds'
                }
            },
            stats: {
                totalRequests: 3456,
                successRate: 95.8,
                avgResponseTime: 234,
                lastError: 'API key revoked'
            },
            icon: Users,
            color: 'from-orange-500 to-orange-600',
            featured: false
        }
    ]

    // Filter integrations
    const filteredIntegrations = integrations.filter(integration => {
        const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            integration.provider.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory

        return matchesSearch && matchesCategory
    })

    const getStatusColor = (status: Integration['status']) => {
        switch (status) {
            case 'connected': return 'text-green-600 bg-green-100'
            case 'disconnected': return 'text-gray-600 bg-gray-100'
            case 'error': return 'text-red-600 bg-red-100'
            case 'pending': return 'text-yellow-600 bg-yellow-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getStatusIcon = (status: Integration['status']) => {
        switch (status) {
            case 'connected': return CheckCircle
            case 'disconnected': return Clock
            case 'error': return AlertCircle
            case 'pending': return RefreshCw
            default: return Clock
        }
    }

    const formatLastSync = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMins = Math.floor(diffMs / (1000 * 60))

        if (diffHours > 0) return `${diffHours}h ago`
        if (diffMins > 0) return `${diffMins}m ago`
        return 'Just now'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
            {/* Header */}
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
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                                        Integrations Hub
                                    </h1>
                                    <p className="text-sm text-gray-500">Connect and manage your integrations</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search integrations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowFilters(!showFilters)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200"
                            >
                                <Filter className="h-4 w-4" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                            >
                                <Plus className="h-4 w-4 inline mr-2" />
                                Add Integration
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Categories Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-80 space-y-6"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
                            <div className="space-y-2">
                                {categories.map((category) => {
                                    const Icon = category.icon
                                    return (
                                        <motion.button
                                            key={category.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${selectedCategory === category.id
                                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Icon className="h-5 w-5" />
                                                    <div>
                                                        <div className="font-medium">{category.name}</div>
                                                        <div className={`text-xs ${selectedCategory === category.id ? 'text-purple-100' : 'text-gray-500'
                                                            }`}>
                                                            {category.count} integrations
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Integration Status</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Connected</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {integrations.filter(i => i.status === 'connected').length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Errors</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {integrations.filter(i => i.status === 'error').length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Disconnected</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {integrations.filter(i => i.status === 'disconnected').length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Integrations Grid */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {selectedCategory === 'all' ? 'All Integrations' : categories.find(c => c.id === selectedCategory)?.name}
                                </h2>
                                <p className="text-gray-600 mt-1">{filteredIntegrations.length} integrations available</p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {filteredIntegrations.map((integration, index) => {
                                const Icon = integration.icon
                                const StatusIcon = getStatusIcon(integration.status)

                                return (
                                    <motion.div
                                        key={integration.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 ${integration.featured ? 'ring-2 ring-purple-300' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className={`bg-gradient-to-r ${integration.color} p-3 rounded-xl`}>
                                                    <Icon className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{integration.name}</h3>
                                                    <p className="text-sm text-gray-500">{integration.provider}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <span className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(integration.status)}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    <span className="capitalize">{integration.status}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-4">{integration.description}</p>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                                                <div className="text-sm font-medium text-gray-900">{integration.stats.successRate}%</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Avg Response</div>
                                                <div className="text-sm font-medium text-gray-900">{integration.stats.avgResponseTime}ms</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Last Sync</div>
                                                <div className="text-sm font-medium text-gray-900">{formatLastSync(integration.lastSync)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Sync Frequency</div>
                                                <div className="text-sm font-medium text-gray-900">{integration.syncFrequency}</div>
                                            </div>
                                        </div>

                                        {integration.stats.lastError && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm text-red-700 font-medium">Error</span>
                                                </div>
                                                <p className="text-xs text-red-600 mt-1">{integration.stats.lastError}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500">API v{integration.apiVersion}</span>
                                                <span className="text-xs text-gray-300">•</span>
                                                <span className="text-xs text-gray-500">{integration.stats.totalRequests.toLocaleString()} requests</span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                                    title="Settings"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </motion.button>

                                                {integration.status === 'connected' ? (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg font-medium transition-all duration-200"
                                                    >
                                                        Disconnect
                                                    </motion.button>
                                                ) : (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                                                    >
                                                        Connect
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
