'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings,
    Bell,
    Shield,
    Database,
    Globe,
    Download,
    Upload,
    RefreshCw,
    Save,
    CheckCircle,
    AlertTriangle,
    Info,
    Zap,
    HardDrive,
    Cpu,
    Wifi,
    Server,
    Archive,
    Trash2,
    AlertCircle
} from 'lucide-react'

// TypeScript interfaces for Settings & Configuration
interface SettingSection {
    id: string
    title: string
    description: string
    icon: React.ComponentType<any>
    settings: Setting[]
}

interface Setting {
    id: string
    type: 'toggle' | 'select' | 'input' | 'textarea' | 'slider' | 'color' | 'file'
    label: string
    description: string
    value: any
    options?: Array<{ value: string; label: string }>
    min?: number
    max?: number
    step?: number
    placeholder?: string
    validation?: {
        required?: boolean
        pattern?: string
        minLength?: number
        maxLength?: number
    }
}

interface SystemStatus {
    component: string
    status: 'healthy' | 'warning' | 'error'
    value: string
    description: string
    icon: React.ComponentType<any>
}

export default function SettingsConfiguration() {
    const [activeSection, setActiveSection] = useState('general')
    const [settings, setSettings] = useState<Record<string, any>>({
        // General settings
        organizationName: 'Acme Corporation',
        timezone: 'America/New_York',
        language: 'en',
        theme: 'light',

        // Notifications
        emailNotifications: true,
        pushNotifications: false,
        workflowAlerts: true,
        securityAlerts: true,

        // Security
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordPolicy: 'strict',

        // API & Integrations
        apiRateLimit: 1000,
        webhookRetries: 3,
        timeoutDuration: 30,

        // Data & Storage
        dataRetention: 90,
        backupFrequency: 'daily',
        exportFormat: 'json',

        // Performance
        maxConcurrentWorkflows: 10,
        cacheTimeout: 3600,
        logLevel: 'info'
    })

    const [isSaving, setIsSaving] = useState(false)

    // Setting sections
    const settingSections: SettingSection[] = [
        {
            id: 'general',
            title: 'General',
            description: 'Basic organization and interface settings',
            icon: Settings,
            settings: [
                {
                    id: 'organizationName',
                    type: 'input',
                    label: 'Organization Name',
                    description: 'The name of your organization',
                    value: settings.organizationName,
                    placeholder: 'Enter organization name',
                    validation: { required: true, minLength: 2, maxLength: 50 }
                },
                {
                    id: 'timezone',
                    type: 'select',
                    label: 'Timezone',
                    description: 'Default timezone for scheduling and timestamps',
                    value: settings.timezone,
                    options: [
                        { value: 'America/New_York', label: 'Eastern Time (ET)' },
                        { value: 'America/Chicago', label: 'Central Time (CT)' },
                        { value: 'America/Denver', label: 'Mountain Time (MT)' },
                        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                        { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
                        { value: 'Europe/Paris', label: 'Central European Time (CET)' },
                        { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' }
                    ]
                },
                {
                    id: 'language',
                    type: 'select',
                    label: 'Interface Language',
                    description: 'Language for the user interface',
                    value: settings.language,
                    options: [
                        { value: 'en', label: 'English' },
                        { value: 'es', label: 'Spanish' },
                        { value: 'fr', label: 'French' },
                        { value: 'de', label: 'German' },
                        { value: 'ja', label: 'Japanese' },
                        { value: 'zh', label: 'Chinese' }
                    ]
                },
                {
                    id: 'theme',
                    type: 'select',
                    label: 'Theme',
                    description: 'Choose your preferred color theme',
                    value: settings.theme,
                    options: [
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'auto', label: 'Auto (System)' }
                    ]
                }
            ]
        },
        {
            id: 'notifications',
            title: 'Notifications',
            description: 'Configure notification preferences',
            icon: Bell,
            settings: [
                {
                    id: 'emailNotifications',
                    type: 'toggle',
                    label: 'Email Notifications',
                    description: 'Receive notifications via email',
                    value: settings.emailNotifications
                },
                {
                    id: 'pushNotifications',
                    type: 'toggle',
                    label: 'Push Notifications',
                    description: 'Receive browser push notifications',
                    value: settings.pushNotifications
                },
                {
                    id: 'workflowAlerts',
                    type: 'toggle',
                    label: 'Workflow Alerts',
                    description: 'Get notified about workflow status changes',
                    value: settings.workflowAlerts
                },
                {
                    id: 'securityAlerts',
                    type: 'toggle',
                    label: 'Security Alerts',
                    description: 'Receive security-related notifications',
                    value: settings.securityAlerts
                }
            ]
        },
        {
            id: 'security',
            title: 'Security',
            description: 'Security and authentication settings',
            icon: Shield,
            settings: [
                {
                    id: 'twoFactorAuth',
                    type: 'toggle',
                    label: 'Two-Factor Authentication',
                    description: 'Enable 2FA for enhanced security',
                    value: settings.twoFactorAuth
                },
                {
                    id: 'sessionTimeout',
                    type: 'slider',
                    label: 'Session Timeout',
                    description: 'Minutes of inactivity before automatic logout',
                    value: settings.sessionTimeout,
                    min: 5,
                    max: 120,
                    step: 5
                },
                {
                    id: 'passwordPolicy',
                    type: 'select',
                    label: 'Password Policy',
                    description: 'Complexity requirements for passwords',
                    value: settings.passwordPolicy,
                    options: [
                        { value: 'basic', label: 'Basic (8+ characters)' },
                        { value: 'medium', label: 'Medium (8+ chars, mixed case)' },
                        { value: 'strict', label: 'Strict (12+ chars, symbols)' }
                    ]
                }
            ]
        },
        {
            id: 'api',
            title: 'API & Integrations',
            description: 'API configuration and integration settings',
            icon: Globe,
            settings: [
                {
                    id: 'apiRateLimit',
                    type: 'slider',
                    label: 'API Rate Limit',
                    description: 'Maximum API requests per hour',
                    value: settings.apiRateLimit,
                    min: 100,
                    max: 10000,
                    step: 100
                },
                {
                    id: 'webhookRetries',
                    type: 'slider',
                    label: 'Webhook Retries',
                    description: 'Number of retry attempts for failed webhooks',
                    value: settings.webhookRetries,
                    min: 0,
                    max: 10,
                    step: 1
                },
                {
                    id: 'timeoutDuration',
                    type: 'slider',
                    label: 'Request Timeout',
                    description: 'Timeout duration for API requests (seconds)',
                    value: settings.timeoutDuration,
                    min: 5,
                    max: 120,
                    step: 5
                }
            ]
        },
        {
            id: 'data',
            title: 'Data & Storage',
            description: 'Data management and storage settings',
            icon: Database,
            settings: [
                {
                    id: 'dataRetention',
                    type: 'slider',
                    label: 'Data Retention',
                    description: 'Number of days to retain workflow data',
                    value: settings.dataRetention,
                    min: 30,
                    max: 365,
                    step: 30
                },
                {
                    id: 'backupFrequency',
                    type: 'select',
                    label: 'Backup Frequency',
                    description: 'How often to create data backups',
                    value: settings.backupFrequency,
                    options: [
                        { value: 'hourly', label: 'Hourly' },
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'monthly', label: 'Monthly' }
                    ]
                },
                {
                    id: 'exportFormat',
                    type: 'select',
                    label: 'Export Format',
                    description: 'Default format for data exports',
                    value: settings.exportFormat,
                    options: [
                        { value: 'json', label: 'JSON' },
                        { value: 'csv', label: 'CSV' },
                        { value: 'xlsx', label: 'Excel' },
                        { value: 'xml', label: 'XML' }
                    ]
                }
            ]
        },
        {
            id: 'performance',
            title: 'Performance',
            description: 'System performance and optimization settings',
            icon: Zap,
            settings: [
                {
                    id: 'maxConcurrentWorkflows',
                    type: 'slider',
                    label: 'Max Concurrent Workflows',
                    description: 'Maximum number of workflows running simultaneously',
                    value: settings.maxConcurrentWorkflows,
                    min: 1,
                    max: 50,
                    step: 1
                },
                {
                    id: 'cacheTimeout',
                    type: 'slider',
                    label: 'Cache Timeout',
                    description: 'Cache timeout duration in seconds',
                    value: settings.cacheTimeout,
                    min: 300,
                    max: 86400,
                    step: 300
                },
                {
                    id: 'logLevel',
                    type: 'select',
                    label: 'Log Level',
                    description: 'Verbosity level for system logs',
                    value: settings.logLevel,
                    options: [
                        { value: 'error', label: 'Error' },
                        { value: 'warn', label: 'Warning' },
                        { value: 'info', label: 'Info' },
                        { value: 'debug', label: 'Debug' }
                    ]
                }
            ]
        }
    ]

    // System status
    const systemStatus: SystemStatus[] = [
        {
            component: 'Database',
            status: 'healthy',
            value: '99.9% uptime',
            description: 'All database connections are healthy',
            icon: Database
        },
        {
            component: 'API Server',
            status: 'healthy',
            value: '2.3ms avg response',
            description: 'API server is responding normally',
            icon: Server
        },
        {
            component: 'Workflow Engine',
            status: 'warning',
            value: '85% capacity',
            description: 'Workflow engine approaching capacity limit',
            icon: Zap
        },
        {
            component: 'Storage',
            status: 'healthy',
            value: '67% used',
            description: 'Storage usage is within normal limits',
            icon: HardDrive
        },
        {
            component: 'Network',
            status: 'healthy',
            value: '45ms latency',
            description: 'Network connections are stable',
            icon: Wifi
        },
        {
            component: 'Cache',
            status: 'error',
            value: 'Service down',
            description: 'Cache service is currently unavailable',
            icon: Cpu
        }
    ]

    const handleSettingChange = (settingId: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [settingId]: value
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        // Simulate save delay
        setTimeout(() => setIsSaving(false), 2000)
    }

    const renderSetting = (setting: Setting) => {
        switch (setting.type) {
            case 'toggle':
                return (
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-gray-900">{setting.label}</label>
                            <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSettingChange(setting.id, !setting.value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.value ? 'bg-purple-600' : 'bg-gray-300'
                                }`}
                        >
                            <motion.span
                                animate={{ x: setting.value ? 20 : 4 }}
                                className="inline-block h-4 w-4 bg-white rounded-full shadow transform transition-transform"
                            />
                        </motion.button>
                    </div>
                )

            case 'select':
                return (
                    <div>
                        <label className="block font-medium text-gray-900 mb-1">{setting.label}</label>
                        <p className="text-sm text-gray-500 mb-3">{setting.description}</p>
                        <select
                            value={setting.value}
                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {setting.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )

            case 'input':
                return (
                    <div>
                        <label className="block font-medium text-gray-900 mb-1">{setting.label}</label>
                        <p className="text-sm text-gray-500 mb-3">{setting.description}</p>
                        <input
                            type="text"
                            value={setting.value}
                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                            placeholder={setting.placeholder}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                )

            case 'slider':
                return (
                    <div>
                        <label className="block font-medium text-gray-900 mb-1">{setting.label}</label>
                        <p className="text-sm text-gray-500 mb-3">{setting.description}</p>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min={setting.min}
                                max={setting.max}
                                step={setting.step}
                                value={setting.value}
                                onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                                {setting.value}
                                {setting.id.includes('timeout') || setting.id.includes('Duration') ? 's' : ''}
                                {setting.id.includes('Limit') && setting.max && setting.max > 1000 ? '/hr' : ''}
                                {setting.id.includes('retention') || setting.id.includes('Retention') ? 'd' : ''}
                            </span>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-100'
            case 'warning': return 'text-yellow-600 bg-yellow-100'
            case 'error': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return CheckCircle
            case 'warning': return AlertTriangle
            case 'error': return AlertCircle
            default: return Info
        }
    }

    const currentSection = settingSections.find(section => section.id === activeSection)

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
                                    <Settings className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                                        Settings & Configuration
                                    </h1>
                                    <p className="text-sm text-gray-500">Manage system settings and preferences</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <RefreshCw className="h-4 w-4 inline mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 inline mr-2" />
                                )}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Settings Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-80 space-y-6"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Settings</h3>
                            <div className="space-y-2">
                                {settingSections.map((section) => {
                                    const Icon = section.icon
                                    return (
                                        <motion.button
                                            key={section.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${activeSection === section.id
                                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Icon className="h-5 w-5" />
                                                <div>
                                                    <div className="font-medium">{section.title}</div>
                                                    <div className={`text-xs ${activeSection === section.id ? 'text-purple-100' : 'text-gray-500'
                                                        }`}>
                                                        {section.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
                            <div className="space-y-3">
                                {systemStatus.map((status, index) => {
                                    const Icon = status.icon
                                    const StatusIcon = getStatusIcon(status.status)

                                    return (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Icon className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{status.component}</div>
                                                    <div className="text-xs text-gray-500">{status.value}</div>
                                                </div>
                                            </div>
                                            <span className={`p-1 rounded-full ${getStatusColor(status.status)}`}>
                                                <StatusIcon className="h-3 w-3" />
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Settings Content */}
                    <div className="flex-1">
                        {currentSection && (
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-100 shadow-sm"
                            >
                                <div className="flex items-center space-x-4 mb-8">
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl">
                                        <currentSection.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{currentSection.title}</h2>
                                        <p className="text-gray-600">{currentSection.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {currentSection.settings.map((setting, index) => (
                                        <motion.div
                                            key={setting.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-6 bg-gray-50 rounded-xl"
                                        >
                                            {renderSetting(setting)}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Additional Actions */}
                                {activeSection === 'data' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl"
                                    >
                                        <h4 className="text-lg font-bold text-blue-900 mb-4">Data Management</h4>
                                        <div className="flex flex-wrap gap-4">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                            >
                                                <Download className="h-4 w-4 inline mr-2" />
                                                Export Data
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                            >
                                                <Upload className="h-4 w-4 inline mr-2" />
                                                Import Data
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                            >
                                                <Archive className="h-4 w-4 inline mr-2" />
                                                Create Backup
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'security' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl"
                                    >
                                        <h4 className="text-lg font-bold text-red-900 mb-4">Danger Zone</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <h5 className="font-medium text-red-900 mb-2">Reset All Settings</h5>
                                                <p className="text-sm text-red-700 mb-3">This will reset all settings to their default values.</p>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                                >
                                                    <RefreshCw className="h-4 w-4 inline mr-2" />
                                                    Reset Settings
                                                </motion.button>
                                            </div>
                                            <div>
                                                <h5 className="font-medium text-red-900 mb-2">Delete All Data</h5>
                                                <p className="text-sm text-red-700 mb-3">Permanently delete all workflows, data, and configurations.</p>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                                >
                                                    <Trash2 className="h-4 w-4 inline mr-2" />
                                                    Delete All Data
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
