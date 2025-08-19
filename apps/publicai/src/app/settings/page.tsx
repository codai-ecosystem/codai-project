'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, Users, Shield, Key, Bell, Database, Globe,
    Monitor, Lock, Unlock, Eye, EyeOff, Save, RefreshCw,
    AlertTriangle, CheckCircle, XCircle, Info, Plus, Trash2,
    Edit, Search, Filter, Download, Upload, Copy, ExternalLink,
    User, UserPlus, UserMinus, Crown, Mail, Phone, Calendar,
    Building2, MapPin, Clock, Activity, BarChart3, Zap,
    Server, Cloud, HardDrive, Wifi, Cpu, MemoryStick,
    NetworkActivity, AlertCircle, TrendingUp, FileText,
    RotateCcw, Power, Pause, Play, StopCircle, ArrowRight
} from 'lucide-react'

interface SystemConfig {
    siteName: string
    adminEmail: string
    maintenanceMode: boolean
    apiRateLimit: number
    sessionTimeout: number
    backupFrequency: string
    cacheExpiry: number
    logLevel: string
}

interface UserAccount {
    id: string
    name: string
    email: string
    role: 'admin' | 'moderator' | 'user' | 'api-user'
    status: 'active' | 'inactive' | 'suspended'
    lastLogin: string
    createdAt: string
    permissions: string[]
    apiKeyCount: number
}

interface SecuritySetting {
    id: string
    name: string
    description: string
    enabled: boolean
    level: 'low' | 'medium' | 'high' | 'critical'
    category: 'authentication' | 'data' | 'api' | 'access'
}

interface SystemMetric {
    name: string
    value: string
    status: 'good' | 'warning' | 'critical'
    trend: 'up' | 'down' | 'stable'
    lastUpdated: string
}

export default function SettingsAdministration() {
    const [activeTab, setActiveTab] = useState('system')
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
    const [showApiKeys, setShowApiKeys] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const [systemConfig, setSystemConfig] = useState<SystemConfig>({
        siteName: 'PublicAI - Civic Intelligence Platform',
        adminEmail: 'admin@publicai.gov',
        maintenanceMode: false,
        apiRateLimit: 1000,
        sessionTimeout: 60,
        backupFrequency: 'daily',
        cacheExpiry: 3600,
        logLevel: 'info'
    })

    const [users, setUsers] = useState<UserAccount[]>([
        {
            id: 'admin-001',
            name: 'Dr. Sarah Chen',
            email: 'sarah.chen@publicai.gov',
            role: 'admin',
            status: 'active',
            lastLogin: '2025-08-07T10:30:00Z',
            createdAt: '2024-01-15T09:00:00Z',
            permissions: ['read', 'write', 'admin', 'api', 'users'],
            apiKeyCount: 3
        },
        {
            id: 'mod-002',
            name: 'Michael Rodriguez',
            email: 'michael.r@publicai.gov',
            role: 'moderator',
            status: 'active',
            lastLogin: '2025-08-07T09:15:00Z',
            createdAt: '2024-03-22T14:30:00Z',
            permissions: ['read', 'write', 'moderate'],
            apiKeyCount: 1
        },
        {
            id: 'api-003',
            name: 'City Data Integration',
            email: 'integration@city.gov',
            role: 'api-user',
            status: 'active',
            lastLogin: '2025-08-07T10:45:00Z',
            createdAt: '2024-06-10T11:00:00Z',
            permissions: ['api', 'read'],
            apiKeyCount: 5
        },
        {
            id: 'user-004',
            name: 'Dr. Jennifer Liu',
            email: 'j.liu@university.edu',
            role: 'user',
            status: 'active',
            lastLogin: '2025-08-06T16:20:00Z',
            createdAt: '2024-08-01T10:15:00Z',
            permissions: ['read'],
            apiKeyCount: 0
        }
    ])

    const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([
        {
            id: 'two-factor',
            name: 'Two-Factor Authentication',
            description: 'Require 2FA for all admin accounts',
            enabled: true,
            level: 'high',
            category: 'authentication'
        },
        {
            id: 'api-encryption',
            name: 'API Response Encryption',
            description: 'Encrypt all API responses containing sensitive data',
            enabled: true,
            level: 'critical',
            category: 'api'
        },
        {
            id: 'data-masking',
            name: 'Automatic Data Masking',
            description: 'Mask personally identifiable information in logs',
            enabled: true,
            level: 'high',
            category: 'data'
        },
        {
            id: 'ip-filtering',
            name: 'IP Address Filtering',
            description: 'Restrict API access to approved IP ranges',
            enabled: false,
            level: 'medium',
            category: 'access'
        },
        {
            id: 'session-monitoring',
            name: 'Session Monitoring',
            description: 'Monitor and log all user sessions',
            enabled: true,
            level: 'medium',
            category: 'authentication'
        },
        {
            id: 'data-retention',
            name: 'Data Retention Policies',
            description: 'Automatically purge old data based on retention rules',
            enabled: true,
            level: 'high',
            category: 'data'
        }
    ])

    const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
        {
            name: 'API Response Time',
            value: '127ms',
            status: 'good',
            trend: 'stable',
            lastUpdated: '2025-08-07T10:50:00Z'
        },
        {
            name: 'Database Connections',
            value: '45/100',
            status: 'good',
            trend: 'stable',
            lastUpdated: '2025-08-07T10:50:00Z'
        },
        {
            name: 'Memory Usage',
            value: '68%',
            status: 'warning',
            trend: 'up',
            lastUpdated: '2025-08-07T10:50:00Z'
        },
        {
            name: 'Disk Space',
            value: '1.2TB/2TB',
            status: 'good',
            trend: 'up',
            lastUpdated: '2025-08-07T10:50:00Z'
        },
        {
            name: 'Active Sessions',
            value: '847',
            status: 'good',
            trend: 'up',
            lastUpdated: '2025-08-07T10:50:00Z'
        },
        {
            name: 'Error Rate',
            value: '0.02%',
            status: 'good',
            trend: 'down',
            lastUpdated: '2025-08-07T10:50:00Z'
        }
    ])

    const tabs = [
        { id: 'system', label: 'System Config', icon: Settings },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'api', label: 'API Management', icon: Key },
        { id: 'monitoring', label: 'System Health', icon: Monitor }
    ]

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800'
            case 'moderator': return 'bg-blue-100 text-blue-800'
            case 'api-user': return 'bg-purple-100 text-purple-800'
            case 'user': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'inactive': return 'bg-gray-100 text-gray-800'
            case 'suspended': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getMetricStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'text-green-600'
            case 'warning': return 'text-yellow-600'
            case 'critical': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    const getSecurityLevelColor = (level: string) => {
        switch (level) {
            case 'low': return 'bg-green-100 text-green-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'high': return 'bg-orange-100 text-orange-800'
            case 'critical': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const saveSystemConfig = () => {
        // Simulate API call
        console.log('Saving system config:', systemConfig)
    }

    const toggleMaintenanceMode = () => {
        setIsMaintenanceMode(!isMaintenanceMode)
        setSystemConfig(prev => ({ ...prev, maintenanceMode: !isMaintenanceMode }))
    }

    const toggleSecuritySetting = (id: string) => {
        setSecuritySettings(prev => prev.map(setting =>
            setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
        ))
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        // Simulate real-time metrics updates
        const interval = setInterval(() => {
            setSystemMetrics(prev => prev.map(metric => ({
                ...metric,
                value: metric.name === 'Active Sessions'
                    ? `${Math.floor(Math.random() * 50) + 820}`
                    : metric.value,
                lastUpdated: new Date().toISOString()
            })))
        }, 15000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
            {/* Enhanced Header */}
            <motion.div
                className="bg-white/80 backdrop-blur-sm border-b border-teal-200/50 sticky top-0 z-40"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                                    Settings & Administration
                                </h1>
                                <p className="text-sm text-gray-600">System Configuration & Management</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-2">
                                    <Activity className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">System Online</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">{users.length} Users</span>
                                </div>
                            </div>

                            <button
                                onClick={toggleMaintenanceMode}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isMaintenanceMode
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600'
                                    }`}
                            >
                                {isMaintenanceMode ? (
                                    <>
                                        <Power className="w-4 h-4 inline mr-2" />
                                        Exit Maintenance
                                    </>
                                ) : (
                                    <>
                                        <Pause className="w-4 h-4 inline mr-2" />
                                        Maintenance Mode
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-1">
                        <div className="flex space-x-1 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* System Configuration Tab */}
                {activeTab === 'system' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">System Configuration</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                                        <input
                                            type="text"
                                            value={systemConfig.siteName}
                                            onChange={(e) => setSystemConfig(prev => ({ ...prev, siteName: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                                        <input
                                            type="email"
                                            value={systemConfig.adminEmail}
                                            onChange={(e) => setSystemConfig(prev => ({ ...prev, adminEmail: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit (per hour)</label>
                                        <input
                                            type="number"
                                            value={systemConfig.apiRateLimit}
                                            onChange={(e) => setSystemConfig(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                                        <input
                                            type="number"
                                            value={systemConfig.sessionTimeout}
                                            onChange={(e) => setSystemConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                                        <select
                                            value={systemConfig.backupFrequency}
                                            onChange={(e) => setSystemConfig(prev => ({ ...prev, backupFrequency: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        >
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cache Expiry (seconds)</label>
                                        <input
                                            type="number"
                                            value={systemConfig.cacheExpiry}
                                            onChange={(e) => setSystemConfig(prev => ({ ...prev, cacheExpiry: parseInt(e.target.value) }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                                        <select
                                            value={systemConfig.logLevel}
                                            onChange={(e) => setSystemConfig(prev => ({ ...prev, logLevel: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        >
                                            <option value="debug">Debug</option>
                                            <option value="info">Info</option>
                                            <option value="warn">Warning</option>
                                            <option value="error">Error</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                                            <p className="text-sm text-gray-600">Temporarily disable public access</p>
                                        </div>
                                        <button
                                            onClick={toggleMaintenanceMode}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemConfig.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemConfig.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={saveSystemConfig}
                                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors"
                                >
                                    <Save className="w-4 h-4 inline mr-2" />
                                    Save Configuration
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* User Management Tab */}
                {activeTab === 'users' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                                <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                                    <UserPlus className="w-4 h-4 inline mr-2" />
                                    Add User
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="overflow-hidden border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Keys</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 flex items-center justify-center">
                                                                <User className="w-5 h-5 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                        {user.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(user.lastLogin).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.apiKeyCount}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-teal-600 hover:text-teal-900">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-900">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>

                            <div className="space-y-4">
                                {securitySettings.map((setting) => (
                                    <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="font-medium text-gray-900">{setting.name}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSecurityLevelColor(setting.level)}`}>
                                                    {setting.level}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{setting.description}</p>
                                        </div>

                                        <button
                                            onClick={() => toggleSecuritySetting(setting.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.enabled ? 'bg-teal-500' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* System Health Tab */}
                {activeTab === 'monitoring' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">System Health</h2>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <RefreshCw className="w-4 h-4 inline mr-2" />
                                    Refresh
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {systemMetrics.map((metric, index) => (
                                    <motion.div
                                        key={metric.name}
                                        className="bg-gray-50 rounded-xl p-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium text-gray-900">{metric.name}</h3>
                                            <div className={`p-2 rounded-lg ${metric.status === 'good' ? 'bg-green-100 text-green-600' :
                                                    metric.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-red-100 text-red-600'
                                                }`}>
                                                {metric.status === 'good' ? <CheckCircle className="w-4 h-4" /> :
                                                    metric.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                                                        <XCircle className="w-4 h-4" />}
                                            </div>
                                        </div>

                                        <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className={`flex items-center space-x-1 ${getMetricStatusColor(metric.status)}`}>
                                                {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                                                    metric.trend === 'down' ? <TrendingUp className="w-3 h-3 rotate-180" /> :
                                                        <Activity className="w-3 h-3" />}
                                                <span>{metric.trend}</span>
                                            </div>
                                            <span className="text-gray-500">
                                                {new Date(metric.lastUpdated).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Other tabs placeholder */}
                {!['system', 'users', 'security', 'monitoring'].includes(activeTab) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-12 text-center"
                    >
                        <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Settings className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{activeTab} Management</h3>
                        <p className="text-gray-600 mb-6">Advanced {activeTab} features are being implemented.</p>
                        <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                            Coming Soon
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Modern Footer */}
            <motion.footer
                className="bg-white/80 backdrop-blur-sm border-t border-teal-200/50 mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white"
                            whileHover={{ scale: 1.02 }}
                        >
                            <Shield className="w-8 h-8 mb-3" />
                            <h3 className="text-lg font-semibold mb-2">Security First</h3>
                            <p className="text-teal-100 text-sm">Enterprise-grade security for public data protection.</p>
                        </motion.div>

                        <motion.div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white"
                            whileHover={{ scale: 1.02 }}
                        >
                            <Monitor className="w-8 h-8 mb-3" />
                            <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
                            <p className="text-blue-100 text-sm">Continuous system health and performance monitoring.</p>
                        </motion.div>

                        <motion.div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white"
                            whileHover={{ scale: 1.02 }}
                        >
                            <Users className="w-8 h-8 mb-3" />
                            <h3 className="text-lg font-semibold mb-2">User Management</h3>
                            <p className="text-indigo-100 text-sm">Comprehensive user access control and administration.</p>
                        </motion.div>
                    </div>
                </div>
            </motion.footer>
        </div>
    )
}
