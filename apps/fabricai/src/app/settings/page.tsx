'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Settings Icons
    Settings as SettingsIcon,
    Cog,
    Sliders,
    ToggleLeft,
    ToggleRight,

    // User Management Icons
    Users,
    User,
    UserPlus,
    UserMinus,
    UserCheck,
    UserX,
    Shield,
    ShieldCheck,

    // System Icons
    Server,
    Database,
    HardDrive,
    Cpu,
    Monitor,
    Wifi,
    WifiOff,

    // Notification Icons
    Bell,
    BellOff,
    BellRing,
    Mail,
    MessageSquare,
    Phone,

    // Security Icons
    Lock,
    Unlock,
    Key,
    Fingerprint,
    Eye,
    EyeOff,

    // Manufacturing Icons
    Factory,
    Wrench,
    Gauge,
    Activity,
    BarChart3,
    Target,

    // Interface Icons
    Palette,
    Sun,
    Moon,
    Languages,
    Globe,
    Layout,

    // Control Icons
    Play,
    Pause,
    Square,
    RotateCcw,
    RefreshCw,
    Download,
    Upload,

    // Status Icons
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    Clock,
    Calendar,

    // Navigation Icons
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Plus,
    Minus,
    X,

    // File Icons
    FileText,
    FolderOpen,
    Archive,
    Trash2,
    Save,

    // Communication Icons
    Headphones,
    Mic,
    MicOff,
    Volume2,
    VolumeX
} from 'lucide-react'

// Enhanced Settings Interfaces
interface UserProfile {
    id: string
    username: string
    email: string
    firstName: string
    lastName: string
    role: 'admin' | 'manager' | 'supervisor' | 'operator' | 'maintenance' | 'quality' | 'safety'
    department: string
    permissions: string[]

    // Profile Settings
    avatar?: string
    timezone: string
    language: string
    dateFormat: string

    // Security
    lastLogin: string
    mfaEnabled: boolean
    sessionTimeout: number // minutes

    // Preferences
    theme: 'light' | 'dark' | 'auto'
    notifications: {
        email: boolean
        sms: boolean
        inApp: boolean
        desktop: boolean
    }

    // Manufacturing Specific
    shiftSchedule?: string
    certifications: string[]
    safetyTraining: {
        completed: string[]
        expires: string[]
    }

    // Status
    status: 'active' | 'inactive' | 'suspended'
    createdAt: string
    updatedAt: string
}

interface SystemConfiguration {
    id: string
    category: 'general' | 'production' | 'quality' | 'safety' | 'maintenance' | 'reporting'
    name: string
    description: string

    // Value Configuration
    value: any
    defaultValue: any
    dataType: 'string' | 'number' | 'boolean' | 'array' | 'object'

    // Validation
    required: boolean
    validation?: {
        min?: number
        max?: number
        pattern?: string
        enum?: string[]
    }

    // Access Control
    readOnly: boolean
    requiresApproval: boolean
    approvedBy?: string
    approvedAt?: string

    // Metadata
    unit?: string
    impact: 'low' | 'medium' | 'high' | 'critical'
    restartRequired: boolean

    // History
    lastModified: string
    modifiedBy: string
    changeHistory: {
        timestamp: string
        user: string
        oldValue: any
        newValue: any
        reason: string
    }[]
}

interface NotificationSettings {
    id: string
    category: 'alerts' | 'warnings' | 'info' | 'emergency' | 'maintenance' | 'quality' | 'production'
    name: string
    description: string

    // Delivery Methods
    channels: {
        email: {
            enabled: boolean
            addresses: string[]
            template: string
        }
        sms: {
            enabled: boolean
            numbers: string[]
        }
        inApp: {
            enabled: boolean
            priority: 'low' | 'medium' | 'high' | 'urgent'
        }
        desktop: {
            enabled: boolean
            sound: boolean
        }
        dashboard: {
            enabled: boolean
            widget: boolean
        }
    }

    // Scheduling
    schedule: {
        enabled: boolean
        businessHoursOnly: boolean
        timezone: string
        quietHours: {
            start: string
            end: string
        }
    }

    // Conditions
    triggers: {
        threshold?: number
        operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
        duration?: number
        frequency?: number
    }

    // Escalation
    escalation: {
        enabled: boolean
        levels: {
            level: number
            delay: number // minutes
            recipients: string[]
            methods: string[]
        }[]
    }

    // Status
    status: 'active' | 'inactive' | 'testing'
    lastTriggered?: string
    testResults?: {
        timestamp: string
        success: boolean
        error?: string
    }[]
}

interface IntegrationSettings {
    id: string
    name: string
    type: 'erp' | 'mes' | 'scada' | 'api' | 'database' | 'cloud' | 'iot'
    description: string

    // Connection
    endpoint: string
    authentication: {
        type: 'none' | 'basic' | 'bearer' | 'oauth' | 'certificate'
        credentials?: any
    }

    // Configuration
    settings: {
        timeout: number
        retries: number
        batchSize: number
        syncInterval: number
    }

    // Data Mapping
    dataMappings: {
        source: string
        target: string
        transformation?: string
    }[]

    // Status
    status: 'connected' | 'disconnected' | 'error' | 'testing'
    lastSync?: string
    lastError?: string

    // Monitoring
    health: {
        uptime: number
        responseTime: number
        errorRate: number
        throughput: number
    }

    // Security
    encryption: boolean
    certificateExpiry?: string
}

interface BackupConfiguration {
    id: string
    name: string
    type: 'full' | 'incremental' | 'differential'

    // Schedule
    schedule: {
        frequency: 'daily' | 'weekly' | 'monthly'
        time: string
        timezone: string
        enabled: boolean
    }

    // Data Selection
    dataSources: {
        production: boolean
        quality: boolean
        maintenance: boolean
        users: boolean
        configurations: boolean
        logs: boolean
    }

    // Storage
    storage: {
        location: 'local' | 'cloud' | 'network'
        path: string
        retention: number // days
        compression: boolean
        encryption: boolean
    }

    // Verification
    verification: {
        enabled: boolean
        checksum: boolean
        testRestore: boolean
    }

    // Status
    lastBackup?: string
    nextBackup: string
    status: 'success' | 'failed' | 'running' | 'scheduled'
    size?: number

    // History
    backupHistory: {
        timestamp: string
        type: string
        status: 'success' | 'failed'
        size: number
        duration: number
        error?: string
    }[]
}

export default function Settings() {
    // Settings State
    const [selectedSection, setSelectedSection] = useState<'general' | 'users' | 'system' | 'notifications' | 'integrations' | 'backup' | 'security'>('general')
    const [isModified, setIsModified] = useState(false)
    const [saving, setSaving] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>([])

    // Current User Profile State
    const [currentUser] = useState<UserProfile>({
        id: 'user-001',
        username: 'admin',
        email: 'admin@fabricai.com',
        firstName: 'Administrator',
        lastName: 'User',
        role: 'admin',
        department: 'IT',
        permissions: ['read', 'write', 'admin', 'configure'],
        timezone: 'Europe/Bucharest',
        language: 'en-US',
        dateFormat: 'DD/MM/YYYY',
        lastLogin: '2025-08-09T08:30:00Z',
        mfaEnabled: true,
        sessionTimeout: 30,
        theme: 'light',
        notifications: {
            email: true,
            sms: false,
            inApp: true,
            desktop: true
        },
        certifications: ['ISO 45001 Lead Auditor', 'Lean Six Sigma Green Belt'],
        safetyTraining: {
            completed: ['General Safety', 'Emergency Response', 'Machinery Safety'],
            expires: ['2025-12-01', '2025-11-15', '2026-01-30']
        },
        status: 'active',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2025-08-09T08:30:00Z'
    })

    // System Configuration State
    const [systemConfigurations] = useState<SystemConfiguration[]>([
        {
            id: 'config-001',
            category: 'production',
            name: 'Production Line Efficiency Target',
            description: 'Target efficiency percentage for production lines',
            value: 95,
            defaultValue: 90,
            dataType: 'number',
            required: true,
            validation: { min: 70, max: 100 },
            readOnly: false,
            requiresApproval: true,
            unit: '%',
            impact: 'high',
            restartRequired: false,
            lastModified: '2025-08-01T10:00:00Z',
            modifiedBy: 'Production Manager',
            changeHistory: [
                {
                    timestamp: '2025-08-01T10:00:00Z',
                    user: 'Production Manager',
                    oldValue: 90,
                    newValue: 95,
                    reason: 'Improved equipment performance'
                }
            ]
        },
        {
            id: 'config-002',
            category: 'quality',
            name: 'Quality Control Sample Rate',
            description: 'Percentage of products to sample for quality control',
            value: 15,
            defaultValue: 10,
            dataType: 'number',
            required: true,
            validation: { min: 5, max: 50 },
            readOnly: false,
            requiresApproval: true,
            unit: '%',
            impact: 'medium',
            restartRequired: false,
            lastModified: '2025-07-20T14:30:00Z',
            modifiedBy: 'Quality Manager',
            changeHistory: [
                {
                    timestamp: '2025-07-20T14:30:00Z',
                    user: 'Quality Manager',
                    oldValue: 10,
                    newValue: 15,
                    reason: 'Enhanced quality assurance requirements'
                }
            ]
        },
        {
            id: 'config-003',
            category: 'safety',
            name: 'Safety Incident Auto-Escalation Time',
            description: 'Time in minutes before safety incidents are auto-escalated',
            value: 30,
            defaultValue: 60,
            dataType: 'number',
            required: true,
            validation: { min: 15, max: 180 },
            readOnly: false,
            requiresApproval: false,
            unit: 'minutes',
            impact: 'critical',
            restartRequired: false,
            lastModified: '2025-08-05T09:15:00Z',
            modifiedBy: 'Safety Manager',
            changeHistory: [
                {
                    timestamp: '2025-08-05T09:15:00Z',
                    user: 'Safety Manager',
                    oldValue: 60,
                    newValue: 30,
                    reason: 'Faster emergency response required'
                }
            ]
        }
    ])

    // Notification Settings State
    const [notificationSettings] = useState<NotificationSettings[]>([
        {
            id: 'notify-001',
            category: 'emergency',
            name: 'Emergency Alert System',
            description: 'Critical emergency notifications for immediate response',
            channels: {
                email: {
                    enabled: true,
                    addresses: ['emergency@fabricai.com', 'safety@fabricai.com'],
                    template: 'emergency_alert'
                },
                sms: {
                    enabled: true,
                    numbers: ['+40 21 123 4567', '+40 21 123 4568']
                },
                inApp: {
                    enabled: true,
                    priority: 'urgent'
                },
                desktop: {
                    enabled: true,
                    sound: true
                },
                dashboard: {
                    enabled: true,
                    widget: true
                }
            },
            schedule: {
                enabled: false,
                businessHoursOnly: false,
                timezone: 'Europe/Bucharest',
                quietHours: { start: '22:00', end: '06:00' }
            },
            triggers: {
                threshold: 1,
                operator: 'gte',
                duration: 0,
                frequency: 1
            },
            escalation: {
                enabled: true,
                levels: [
                    { level: 1, delay: 5, recipients: ['safety-team'], methods: ['sms', 'email'] },
                    { level: 2, delay: 15, recipients: ['management'], methods: ['phone', 'sms'] },
                    { level: 3, delay: 30, recipients: ['executives'], methods: ['phone'] }
                ]
            },
            status: 'active',
            lastTriggered: '2025-08-08T14:30:00Z'
        },
        {
            id: 'notify-002',
            category: 'production',
            name: 'Production Line Down Alert',
            description: 'Notifications when production lines stop unexpectedly',
            channels: {
                email: {
                    enabled: true,
                    addresses: ['production@fabricai.com'],
                    template: 'production_alert'
                },
                sms: {
                    enabled: false,
                    numbers: []
                },
                inApp: {
                    enabled: true,
                    priority: 'high'
                },
                desktop: {
                    enabled: true,
                    sound: false
                },
                dashboard: {
                    enabled: true,
                    widget: true
                }
            },
            schedule: {
                enabled: true,
                businessHoursOnly: true,
                timezone: 'Europe/Bucharest',
                quietHours: { start: '22:00', end: '06:00' }
            },
            triggers: {
                threshold: 300,
                operator: 'gte',
                duration: 5,
                frequency: 1
            },
            escalation: {
                enabled: true,
                levels: [
                    { level: 1, delay: 10, recipients: ['production-supervisors'], methods: ['email'] },
                    { level: 2, delay: 30, recipients: ['production-manager'], methods: ['sms', 'email'] }
                ]
            },
            status: 'active'
        }
    ])

    // Integration Settings State
    const [integrationSettings] = useState<IntegrationSettings[]>([
        {
            id: 'int-001',
            name: 'ERP Integration',
            type: 'erp',
            description: 'Integration with SAP ERP system for material and order management',
            endpoint: 'https://erp.fabricai.com/api/v1',
            authentication: {
                type: 'oauth',
                credentials: { clientId: 'fabricai-prod', scope: 'read write' }
            },
            settings: {
                timeout: 30000,
                retries: 3,
                batchSize: 100,
                syncInterval: 300
            },
            dataMappings: [
                { source: 'material_code', target: 'product_id' },
                { source: 'order_number', target: 'work_order' },
                { source: 'quantity', target: 'planned_quantity' }
            ],
            status: 'connected',
            lastSync: '2025-08-09T09:45:00Z',
            health: {
                uptime: 99.8,
                responseTime: 250,
                errorRate: 0.1,
                throughput: 1500
            },
            encryption: true,
            certificateExpiry: '2026-03-15T00:00:00Z'
        },
        {
            id: 'int-002',
            name: 'IoT Sensor Network',
            type: 'iot',
            description: 'Real-time data collection from production floor sensors',
            endpoint: 'mqtt://iot.fabricai.com:8883',
            authentication: {
                type: 'certificate',
                credentials: { certificate: 'iot-client.pem' }
            },
            settings: {
                timeout: 5000,
                retries: 5,
                batchSize: 50,
                syncInterval: 10
            },
            dataMappings: [
                { source: 'sensor/temperature', target: 'environmental.temperature' },
                { source: 'sensor/pressure', target: 'equipment.pressure' },
                { source: 'sensor/vibration', target: 'equipment.vibration' }
            ],
            status: 'connected',
            lastSync: '2025-08-09T10:00:00Z',
            health: {
                uptime: 99.9,
                responseTime: 50,
                errorRate: 0.05,
                throughput: 5000
            },
            encryption: true,
            certificateExpiry: '2025-12-01T00:00:00Z'
        }
    ])

    // Backup Configuration State
    const [backupConfigurations] = useState<BackupConfiguration[]>([
        {
            id: 'backup-001',
            name: 'Daily Production Backup',
            type: 'incremental',
            schedule: {
                frequency: 'daily',
                time: '02:00',
                timezone: 'Europe/Bucharest',
                enabled: true
            },
            dataSources: {
                production: true,
                quality: true,
                maintenance: true,
                users: false,
                configurations: false,
                logs: false
            },
            storage: {
                location: 'network',
                path: '\\\\backup-server\\fabricai\\daily',
                retention: 30,
                compression: true,
                encryption: true
            },
            verification: {
                enabled: true,
                checksum: true,
                testRestore: false
            },
            lastBackup: '2025-08-09T02:00:00Z',
            nextBackup: '2025-08-10T02:00:00Z',
            status: 'success',
            size: 2.4, // GB
            backupHistory: [
                {
                    timestamp: '2025-08-09T02:00:00Z',
                    type: 'incremental',
                    status: 'success',
                    size: 2.4,
                    duration: 45,
                },
                {
                    timestamp: '2025-08-08T02:00:00Z',
                    type: 'incremental',
                    status: 'success',
                    size: 2.2,
                    duration: 42,
                }
            ]
        },
        {
            id: 'backup-002',
            name: 'Weekly Full System Backup',
            type: 'full',
            schedule: {
                frequency: 'weekly',
                time: '01:00',
                timezone: 'Europe/Bucharest',
                enabled: true
            },
            dataSources: {
                production: true,
                quality: true,
                maintenance: true,
                users: true,
                configurations: true,
                logs: true
            },
            storage: {
                location: 'cloud',
                path: 'azure://fabricai-backups/weekly',
                retention: 90,
                compression: true,
                encryption: true
            },
            verification: {
                enabled: true,
                checksum: true,
                testRestore: true
            },
            lastBackup: '2025-08-04T01:00:00Z',
            nextBackup: '2025-08-11T01:00:00Z',
            status: 'success',
            size: 15.8, // GB
            backupHistory: [
                {
                    timestamp: '2025-08-04T01:00:00Z',
                    type: 'full',
                    status: 'success',
                    size: 15.8,
                    duration: 180,
                }
            ]
        }
    ])

    // Settings Sections
    const settingsSections = [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'system', label: 'System Configuration', icon: Server },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'integrations', label: 'Integrations', icon: Wifi },
        { id: 'backup', label: 'Backup & Recovery', icon: Archive },
        { id: 'security', label: 'Security', icon: Shield }
    ]

    // Toggle item expansion
    const toggleExpanded = (itemId: string) => {
        setExpandedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        )
    }

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'connected':
            case 'success':
                return 'text-green-600 bg-green-100'
            case 'inactive':
            case 'disconnected':
            case 'failed':
                return 'text-red-600 bg-red-100'
            case 'testing':
            case 'running':
                return 'text-blue-600 bg-blue-100'
            case 'error':
                return 'text-red-600 bg-red-100'
            case 'scheduled':
                return 'text-yellow-600 bg-yellow-100'
            default:
                return 'text-gray-600 bg-gray-100'
        }
    }

    // Get impact color
    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'critical': return 'text-red-600 bg-red-100'
            case 'high': return 'text-orange-600 bg-orange-100'
            case 'medium': return 'text-yellow-600 bg-yellow-100'
            case 'low': return 'text-green-600 bg-green-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    // Save settings
    const handleSave = async () => {
        setSaving(true)
        // Simulate save operation
        await new Promise(resolve => setTimeout(resolve, 1500))
        setSaving(false)
        setIsModified(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                System Settings
                            </h1>
                            <p className="text-gray-600 mt-2">Configure system preferences, user management, and integrations</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isModified && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-medium"
                                >
                                    Unsaved Changes
                                </motion.div>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={!isModified || saving}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors ${isModified
                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {saving ? (
                                    <div className="flex items-center space-x-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Save className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Settings Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                            <nav className="space-y-2">
                                {settingsSections.map((section) => {
                                    const Icon = section.icon
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setSelectedSection(section.id as any)}
                                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${selectedSection === section.id
                                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="font-medium">{section.label}</span>
                                        </button>
                                    )
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            key={selectedSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 p-6"
                        >
                            {/* General Settings */}
                            {selectedSection === 'general' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900">General Settings</h2>

                                    {/* User Profile */}
                                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Profile</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={`${currentUser.firstName} ${currentUser.lastName}`}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    value={currentUser.email}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                                <input
                                                    type="text"
                                                    value={currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                                <input
                                                    type="text"
                                                    value={currentUser.department}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preferences */}
                                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                                                    <option value="light">Light</option>
                                                    <option value="dark">Dark</option>
                                                    <option value="auto">Auto</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                                                    <option value="en-US">English (US)</option>
                                                    <option value="ro-RO">Română</option>
                                                    <option value="de-DE">Deutsch</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                                                    <option value="Europe/Bucharest">Europe/Bucharest</option>
                                                    <option value="Europe/London">Europe/London</option>
                                                    <option value="America/New_York">America/New_York</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* System Configuration */}
                            {selectedSection === 'system' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900">System Configuration</h2>

                                    {systemConfigurations.map((config, index) => (
                                        <motion.div
                                            key={config.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200"
                                        >
                                            <div
                                                className="p-4 cursor-pointer"
                                                onClick={() => toggleExpanded(config.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(config.impact)}`}>
                                                                {config.impact.charAt(0).toUpperCase() + config.impact.slice(1)} Impact
                                                            </div>
                                                            {config.requiresApproval && (
                                                                <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                                    Requires Approval
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 text-sm">{config.description}</p>
                                                        <div className="flex items-center space-x-4 mt-2 text-sm">
                                                            <span className="text-gray-600">Current: <span className="font-semibold">{config.value}{config.unit}</span></span>
                                                            <span className="text-gray-600">Default: <span className="font-semibold">{config.defaultValue}{config.unit}</span></span>
                                                            <span className="text-gray-600">Modified: {new Date(config.lastModified).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedItems.includes(config.id) ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>

                                            {expandedItems.includes(config.id) && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="px-4 pb-4 border-t border-orange-200"
                                                >
                                                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="number"
                                                                    value={config.value}
                                                                    min={config.validation?.min}
                                                                    max={config.validation?.max}
                                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                                />
                                                                <span className="text-sm text-gray-600">{config.unit}</span>
                                                            </div>
                                                            {config.validation && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Range: {config.validation.min} - {config.validation.max}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                                            <input
                                                                type="text"
                                                                value={config.category.charAt(0).toUpperCase() + config.category.slice(1)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>

                                                    {config.changeHistory.length > 0 && (
                                                        <div className="mt-4">
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Changes</h4>
                                                            <div className="space-y-2">
                                                                {config.changeHistory.slice(0, 3).map((change, changeIndex) => (
                                                                    <div key={changeIndex} className="text-xs text-gray-600 bg-white/50 rounded p-2">
                                                                        <span className="font-medium">{change.user}</span> changed from{' '}
                                                                        <span className="font-semibold">{change.oldValue}</span> to{' '}
                                                                        <span className="font-semibold">{change.newValue}</span> on{' '}
                                                                        {new Date(change.timestamp).toLocaleDateString()}
                                                                        {change.reason && <span className="block">Reason: {change.reason}</span>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Other sections placeholder */}
                            {(['users', 'notifications', 'integrations', 'backup', 'security'].includes(selectedSection)) && (
                                <div className="text-center py-12">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Settings
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Advanced {selectedSection} management features will be implemented here.
                                    </p>
                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg inline-block">
                                        Coming Soon: {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Management
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
