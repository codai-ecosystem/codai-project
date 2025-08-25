'use client'

import React from 'react'
/**
 * Integration Settings Component - API Connections and Third-party Services
 */

import { motion } from 'framer-motion'
import {
    Plug, Globe, Key, Webhook, Database, Cloud,
    CheckCircle, XCircle, AlertTriangle, Settings,
    Zap, Link, Shield, Eye, EyeOff, Copy,
    RefreshCw, Plus, Trash2, Edit, ExternalLink
} from 'lucide-react'
import { useState } from 'react'

interface IntegrationSettingsProps {
    settings: any
    onChange: (section: string, key: string, value: any) => void
}

export function IntegrationSettings({ settings, onChange }: IntegrationSettingsProps) {
    const [showApiKeys, setShowApiKeys] = useState(false)
    const [newApiKey, setNewApiKey] = useState('')
    const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)

    const integrations = [
        {
            id: 'github',
            name: 'GitHub',
            description: 'Source code management and CI/CD integration',
            icon: '🐙',
            status: 'connected',
            lastSync: '2 minutes ago',
            features: ['Repository access', 'Webhook events', 'Actions integration'],
            credentials: {
                type: 'OAuth',
                connected: true,
                scopes: ['repo', 'workflow', 'read:user']
            }
        },
        {
            id: 'slack',
            name: 'Slack',
            description: 'Team communication and notifications',
            icon: '💬',
            status: 'connected',
            lastSync: '5 minutes ago',
            features: ['Message posting', 'Channel management', 'Bot integration'],
            credentials: {
                type: 'Webhook',
                connected: true,
                url: 'https://hooks.slack.com/services/...'
            }
        },
        {
            id: 'aws',
            name: 'AWS',
            description: 'Amazon Web Services cloud infrastructure',
            icon: '☁️',
            status: 'warning',
            lastSync: '1 hour ago',
            features: ['EC2 management', 'S3 storage', 'Lambda functions'],
            credentials: {
                type: 'API Key',
                connected: true,
                keyId: 'AKIA...',
                region: 'us-east-1'
            }
        },
        {
            id: 'docker',
            name: 'Docker Hub',
            description: 'Container registry and image management',
            icon: '🐳',
            status: 'disconnected',
            lastSync: 'Never',
            features: ['Image push/pull', 'Registry webhooks', 'Automated builds'],
            credentials: {
                type: 'Username/Password',
                connected: false
            }
        },
        {
            id: 'monitoring',
            name: 'Monitoring Stack',
            description: 'Application performance and error tracking',
            icon: '📊',
            status: 'connected',
            lastSync: '30 seconds ago',
            features: ['Error tracking', 'Performance metrics', 'Alerting'],
            credentials: {
                type: 'API Token',
                connected: true,
                endpoints: ['Sentry', 'DataDog', 'New Relic']
            }
        },
        {
            id: 'database',
            name: 'External Databases',
            description: 'Connect to external database services',
            icon: '🗄️',
            status: 'connected',
            lastSync: '1 minute ago',
            features: ['Query execution', 'Schema sync', 'Data migration'],
            credentials: {
                type: 'Connection String',
                connected: true,
                databases: ['PostgreSQL', 'MongoDB', 'Redis']
            }
        }
    ]

    const webhookEndpoints = [
        {
            id: 'deploy',
            name: 'Deployment Webhook',
            url: 'https://api.controlai.com/webhooks/deploy',
            events: ['deployment.started', 'deployment.completed', 'deployment.failed'],
            active: true,
            lastTriggered: '2 hours ago'
        },
        {
            id: 'alerts',
            name: 'Alert Webhook',
            url: 'https://api.controlai.com/webhooks/alerts',
            events: ['alert.critical', 'alert.warning', 'alert.resolved'],
            active: true,
            lastTriggered: '5 minutes ago'
        },
        {
            id: 'analytics',
            name: 'Analytics Webhook',
            url: 'https://api.controlai.com/webhooks/analytics',
            events: ['analytics.report', 'analytics.threshold'],
            active: false,
            lastTriggered: 'Never'
        }
    ]

    const apiKeys = [
        {
            id: 'prod',
            name: 'Production API Key',
            key: 'cai_prod_...',
            permissions: ['read', 'write', 'admin'],
            lastUsed: '2 minutes ago',
            created: '2024-01-15'
        },
        {
            id: 'staging',
            name: 'Staging API Key',
            key: 'cai_staging_...',
            permissions: ['read', 'write'],
            lastUsed: '1 hour ago',
            created: '2024-01-10'
        },
        {
            id: 'dev',
            name: 'Development API Key',
            key: 'cai_dev_...',
            permissions: ['read'],
            lastUsed: '1 day ago',
            created: '2024-01-05'
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'text-green-600 dark:text-green-400'
            case 'warning': return 'text-yellow-600 dark:text-yellow-400'
            case 'disconnected': return 'text-red-600 dark:text-red-400'
            default: return 'text-gray-600 dark:text-gray-400'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return CheckCircle
            case 'warning': return AlertTriangle
            case 'disconnected': return XCircle
            default: return XCircle
        }
    }

    const handleTestConnection = (integrationId: string) => {
        console.log(`Testing connection for ${integrationId}`)
    }

    const handleToggleIntegration = (integrationId: string, enabled: boolean) => {
        console.log(`${enabled ? 'Enabling' : 'Disabling'} integration: ${integrationId}`)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Integrations Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Plug className="w-6 h-6 mr-3 text-blue-500" />
                    Connected Integrations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {integrations.map((integration) => {
                        const StatusIcon = getStatusIcon(integration.status)
                        return (
                            <div
                                key={integration.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{integration.icon}</span>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {integration.name}
                                            </h4>
                                            <div className="flex items-center space-x-2">
                                                <StatusIcon className={`w-4 h-4 ${getStatusColor(integration.status)}`} />
                                                <span className={`text-sm capitalize ${getStatusColor(integration.status)}`}>
                                                    {integration.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedIntegration(
                                            selectedIntegration === integration.id ? null : integration.id
                                        )}
                                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {integration.description}
                                </p>

                                <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                    Last sync: {integration.lastSync}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleTestConnection(integration.id)}
                                        className="flex-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        Test
                                    </button>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={integration.status === 'connected'}
                                            onChange={(e) => handleToggleIntegration(integration.id, e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {selectedIntegration === integration.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    Features
                                                </label>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {integration.features.map((feature, index) => (
                                                        <span
                                                            key={index}
                                                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                                                        >
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    Authentication
                                                </label>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    Type: {integration.credentials.type}
                                                </p>
                                            </div>

                                            <div className="flex space-x-2">
                                                <button className="flex-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 py-2 px-3 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                                                    <RefreshCw className="w-3 h-3 inline mr-1" />
                                                    Sync
                                                </button>
                                                <button className="flex-1 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 py-2 px-3 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                                                    <Edit className="w-3 h-3 inline mr-1" />
                                                    Configure
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* API Keys Management */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <Key className="w-6 h-6 mr-3 text-green-500" />
                        API Keys
                    </h3>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowApiKeys(!showApiKeys)}
                            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span>{showApiKeys ? 'Hide' : 'Show'} Keys</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            <span>New API Key</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                        <div
                            key={apiKey.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                        >
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {apiKey.name}
                                    </h4>
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

                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-mono">
                                        {showApiKeys ? apiKey.key : '••••••••••••••••'}
                                    </span>
                                    <span>•</span>
                                    <span>Last used: {apiKey.lastUsed}</span>
                                    <span>•</span>
                                    <span>Created: {apiKey.created}</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => copyToClipboard(apiKey.key)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Copy API key"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                    title="Regenerate key"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete key"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        API Key Security
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Keep your API keys secure and never share them publicly</li>
                        <li>• Use environment variables to store keys in your applications</li>
                        <li>• Rotate keys regularly and revoke unused ones</li>
                        <li>• Monitor API key usage for suspicious activity</li>
                    </ul>
                </div>
            </div>

            {/* Webhook Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <Webhook className="w-6 h-6 mr-3 text-purple-500" />
                        Webhook Endpoints
                    </h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Add Webhook</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {webhookEndpoints.map((webhook) => (
                        <div
                            key={webhook.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                        >
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {webhook.name}
                                    </h4>
                                    <span className={`text-xs px-2 py-1 rounded ${webhook.active
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                            : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {webhook.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <code className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-xs">
                                        {webhook.url}
                                    </code>
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>Events: {webhook.events.length}</span>
                                    <span>•</span>
                                    <span>Last triggered: {webhook.lastTriggered}</span>
                                </div>

                                <div className="flex flex-wrap gap-1 mt-2">
                                    {webhook.events.map((event, index) => (
                                        <span
                                            key={index}
                                            className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded"
                                        >
                                            {event}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Test webhook"
                                >
                                    <Zap className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                    title="Edit webhook"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={webhook.active}
                                        onChange={(e) => console.log(`Toggle webhook ${webhook.id}: ${e.target.checked}`)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Integration Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Globe className="w-6 h-6 mr-3 text-orange-500" />
                    Integration Settings
                </h3>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Auto-sync Enabled
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Automatically synchronize data with connected services
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.autoSync !== false}
                                onChange={(e) => onChange('integrations', 'autoSync', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sync Frequency
                        </label>
                        <select
                            value={settings.syncFrequency || '300'}
                            onChange={(e) => onChange('integrations', 'syncFrequency', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="60">Every minute</option>
                            <option value="300">Every 5 minutes</option>
                            <option value="900">Every 15 minutes</option>
                            <option value="1800">Every 30 minutes</option>
                            <option value="3600">Every hour</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Rate Limiting
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Enable rate limiting for API requests
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.rateLimiting !== false}
                                onChange={(e) => onChange('integrations', 'rateLimiting', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Retry Failed Requests
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Automatically retry failed API requests
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.retryFailedRequests !== false}
                                onChange={(e) => onChange('integrations', 'retryFailedRequests', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}


