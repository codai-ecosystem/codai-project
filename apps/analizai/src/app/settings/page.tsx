'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, User, Bell, Shield, Database, Palette, Globe,
    Monitor, Smartphone, Lock, Key, Eye, EyeOff, Save, RefreshCw,
    Download, Upload, Trash2, AlertCircle, CheckCircle, Info,
    Mail, Phone, MapPin, Calendar, Clock, Languages, Zap,
    BarChart3, PieChart, LineChart, Activity, Target, Award,
    Sun, Moon, Laptop, Volume2, VolumeX, FileText, Image,
    Video, Music, Archive, HardDrive, Cloud, Wifi, Server
} from 'lucide-react'

// TypeScript interfaces for settings
interface UserSettings {
    profile: {
        name: string
        email: string
        phone: string
        location: string
        timezone: string
        language: string
        jobTitle: string
        department: string
    }
    preferences: {
        theme: 'light' | 'dark' | 'auto'
        language: string
        currency: string
        dateFormat: string
        timeFormat: '12h' | '24h'
        notifications: boolean
        emailUpdates: boolean
        soundEnabled: boolean
    }
    privacy: {
        profileVisibility: 'public' | 'team' | 'private'
        showEmail: boolean
        showPhone: boolean
        activityTracking: boolean
        dataCollection: boolean
    }
    analytics: {
        defaultChartType: 'bar' | 'line' | 'pie' | 'area'
        autoRefresh: boolean
        refreshInterval: number
        showTooltips: boolean
        animationsEnabled: boolean
        dataPointsLimit: number
    }
}

interface SystemSettings {
    security: {
        twoFactorEnabled: boolean
        sessionTimeout: number
        passwordExpiry: number
        ipWhitelist: string[]
        deviceLimit: number
    }
    integrations: {
        apiAccess: boolean
        webhooksEnabled: boolean
        exportFormats: string[]
        connectedServices: number
        dataRetention: number
    }
    performance: {
        cacheEnabled: boolean
        compressionEnabled: boolean
        cdnEnabled: boolean
        autoBackup: boolean
        backupFrequency: 'daily' | 'weekly' | 'monthly'
    }
}

// Mock settings data
const mockUserSettings: UserSettings = {
    profile: {
        name: 'Maria Popescu',
        email: 'maria.popescu@analizai.com',
        phone: '+40 721 123 456',
        location: 'Bucharest, Romania',
        timezone: 'Europe/Bucharest',
        language: 'Romanian',
        jobTitle: 'Analytics Manager',
        department: 'Business Intelligence'
    },
    preferences: {
        theme: 'auto',
        language: 'ro-RO',
        currency: 'RON',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        notifications: true,
        emailUpdates: true,
        soundEnabled: false
    },
    privacy: {
        profileVisibility: 'team',
        showEmail: true,
        showPhone: false,
        activityTracking: true,
        dataCollection: true
    },
    analytics: {
        defaultChartType: 'bar',
        autoRefresh: true,
        refreshInterval: 30,
        showTooltips: true,
        animationsEnabled: true,
        dataPointsLimit: 1000
    }
}

const mockSystemSettings: SystemSettings = {
    security: {
        twoFactorEnabled: true,
        sessionTimeout: 480,
        passwordExpiry: 90,
        ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        deviceLimit: 5
    },
    integrations: {
        apiAccess: true,
        webhooksEnabled: false,
        exportFormats: ['CSV', 'PDF', 'Excel', 'JSON'],
        connectedServices: 3,
        dataRetention: 365
    },
    performance: {
        cacheEnabled: true,
        compressionEnabled: true,
        cdnEnabled: true,
        autoBackup: true,
        backupFrequency: 'daily'
    }
}

// Settings Section Component
const SettingsSection: React.FC<{
    title: string
    description: string
    icon: React.ReactNode
    children: React.ReactNode
}> = ({ title, description, icon, children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
            <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </motion.div>
    )
}

// Toggle Switch Component
const ToggleSwitch: React.FC<{
    enabled: boolean
    onChange: (enabled: boolean) => void
    label: string
    description?: string
}> = ({ enabled, onChange, label, description }) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <label className="text-sm font-medium text-gray-900">{label}</label>
                {description && <p className="text-xs text-gray-600">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    )
}

// Input Field Component
const InputField: React.FC<{
    label: string
    value: string
    onChange: (value: string) => void
    type?: string
    placeholder?: string
    description?: string
}> = ({ label, value, onChange, type = 'text', placeholder, description }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
            {description && <p className="text-xs text-gray-600 mb-2">{description}</p>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
        </div>
    )
}

// Select Field Component
const SelectField: React.FC<{
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    description?: string
}> = ({ label, value, onChange, options, description }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
            {description && <p className="text-xs text-gray-600 mb-2">{description}</p>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

// Main Settings Component
export default function SettingsPage() {
    const [userSettings, setUserSettings] = useState<UserSettings>(mockUserSettings)
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(mockSystemSettings)
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'privacy' | 'analytics' | 'security' | 'integrations' | 'performance'>('profile')
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    const updateUserSettings = (path: keyof UserSettings, field: string, value: any) => {
        setUserSettings(prev => ({
            ...prev,
            [path]: {
                ...prev[path],
                [field]: value
            }
        }))
        setHasUnsavedChanges(true)
    }

    const updateSystemSettings = (path: keyof SystemSettings, field: string, value: any) => {
        setSystemSettings(prev => ({
            ...prev,
            [path]: {
                ...prev[path],
                [field]: value
            }
        }))
        setHasUnsavedChanges(true)
    }

    const handleSaveSettings = () => {
        console.log('Saving settings:', { userSettings, systemSettings })
        setHasUnsavedChanges(false)
    }

    const handleResetSettings = () => {
        if (window.confirm('Are you sure you want to reset all settings to default?')) {
            setUserSettings(mockUserSettings)
            setSystemSettings(mockSystemSettings)
            setHasUnsavedChanges(false)
        }
    }

    const handleExportSettings = () => {
        const settings = { userSettings, systemSettings }
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'analizai-settings.json'
        a.click()
        URL.revokeObjectURL(url)
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
                                Settings
                            </h1>
                            <p className="text-gray-600">
                                Configure your AnalizAI analytics platform preferences
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {hasUnsavedChanges && (
                                <div className="flex items-center text-orange-600 text-sm">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Unsaved changes
                                </div>
                            )}
                            <button
                                onClick={handleExportSettings}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </button>
                            <button
                                onClick={handleResetSettings}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                disabled={!hasUnsavedChanges}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8"
                >
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
                            { id: 'preferences', label: 'Preferences', icon: <Settings className="h-4 w-4" /> },
                            { id: 'privacy', label: 'Privacy', icon: <Eye className="h-4 w-4" /> },
                            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
                            { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
                            { id: 'integrations', label: 'Integrations', icon: <Database className="h-4 w-4" /> },
                            { id: 'performance', label: 'Performance', icon: <Zap className="h-4 w-4" /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.icon}
                                <span className="ml-2">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Settings Content */}
                <div className="grid grid-cols-1 gap-6">
                    {activeTab === 'profile' && (
                        <SettingsSection
                            title="Profile Information"
                            description="Manage your personal information and contact details"
                            icon={<User className="h-5 w-5 text-purple-600" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Full Name"
                                    value={userSettings.profile.name}
                                    onChange={(value) => updateUserSettings('profile', 'name', value)}
                                />
                                <InputField
                                    label="Email Address"
                                    value={userSettings.profile.email}
                                    onChange={(value) => updateUserSettings('profile', 'email', value)}
                                    type="email"
                                />
                                <InputField
                                    label="Phone Number"
                                    value={userSettings.profile.phone}
                                    onChange={(value) => updateUserSettings('profile', 'phone', value)}
                                    type="tel"
                                />
                                <InputField
                                    label="Location"
                                    value={userSettings.profile.location}
                                    onChange={(value) => updateUserSettings('profile', 'location', value)}
                                />
                                <SelectField
                                    label="Timezone"
                                    value={userSettings.profile.timezone}
                                    onChange={(value) => updateUserSettings('profile', 'timezone', value)}
                                    options={[
                                        { value: 'Europe/Bucharest', label: 'Europe/Bucharest (UTC+2)' },
                                        { value: 'UTC', label: 'UTC (UTC+0)' },
                                        { value: 'America/New_York', label: 'America/New_York (UTC-5)' }
                                    ]}
                                />
                                <SelectField
                                    label="Language"
                                    value={userSettings.profile.language}
                                    onChange={(value) => updateUserSettings('profile', 'language', value)}
                                    options={[
                                        { value: 'Romanian', label: 'Romanian' },
                                        { value: 'English', label: 'English' },
                                        { value: 'French', label: 'French' }
                                    ]}
                                />
                                <InputField
                                    label="Job Title"
                                    value={userSettings.profile.jobTitle}
                                    onChange={(value) => updateUserSettings('profile', 'jobTitle', value)}
                                />
                                <InputField
                                    label="Department"
                                    value={userSettings.profile.department}
                                    onChange={(value) => updateUserSettings('profile', 'department', value)}
                                />
                            </div>
                        </SettingsSection>
                    )}

                    {activeTab === 'preferences' && (
                        <SettingsSection
                            title="Application Preferences"
                            description="Customize your AnalizAI experience and interface"
                            icon={<Settings className="h-5 w-5 text-purple-600" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <SelectField
                                        label="Theme"
                                        value={userSettings.preferences.theme}
                                        onChange={(value) => updateUserSettings('preferences', 'theme', value)}
                                        options={[
                                            { value: 'light', label: 'Light Theme' },
                                            { value: 'dark', label: 'Dark Theme' },
                                            { value: 'auto', label: 'Auto (System)' }
                                        ]}
                                        description="Choose your preferred color scheme"
                                    />
                                    <SelectField
                                        label="Language"
                                        value={userSettings.preferences.language}
                                        onChange={(value) => updateUserSettings('preferences', 'language', value)}
                                        options={[
                                            { value: 'ro-RO', label: 'Romanian' },
                                            { value: 'en-US', label: 'English (US)' },
                                            { value: 'fr-FR', label: 'French' }
                                        ]}
                                    />
                                    <SelectField
                                        label="Currency"
                                        value={userSettings.preferences.currency}
                                        onChange={(value) => updateUserSettings('preferences', 'currency', value)}
                                        options={[
                                            { value: 'RON', label: 'Romanian Leu (RON)' },
                                            { value: 'EUR', label: 'Euro (EUR)' },
                                            { value: 'USD', label: 'US Dollar (USD)' }
                                        ]}
                                    />
                                    <SelectField
                                        label="Date Format"
                                        value={userSettings.preferences.dateFormat}
                                        onChange={(value) => updateUserSettings('preferences', 'dateFormat', value)}
                                        options={[
                                            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                                            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                                            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                                        ]}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <SelectField
                                        label="Time Format"
                                        value={userSettings.preferences.timeFormat}
                                        onChange={(value) => updateUserSettings('preferences', 'timeFormat', value)}
                                        options={[
                                            { value: '24h', label: '24-hour (23:59)' },
                                            { value: '12h', label: '12-hour (11:59 PM)' }
                                        ]}
                                    />
                                    <ToggleSwitch
                                        enabled={userSettings.preferences.notifications}
                                        onChange={(value) => updateUserSettings('preferences', 'notifications', value)}
                                        label="Enable Notifications"
                                        description="Receive in-app notifications for important events"
                                    />
                                    <ToggleSwitch
                                        enabled={userSettings.preferences.emailUpdates}
                                        onChange={(value) => updateUserSettings('preferences', 'emailUpdates', value)}
                                        label="Email Updates"
                                        description="Receive email notifications for reports and insights"
                                    />
                                    <ToggleSwitch
                                        enabled={userSettings.preferences.soundEnabled}
                                        onChange={(value) => updateUserSettings('preferences', 'soundEnabled', value)}
                                        label="Sound Effects"
                                        description="Enable sound effects for interactions"
                                    />
                                </div>
                            </div>
                        </SettingsSection>
                    )}

                    {activeTab === 'analytics' && (
                        <SettingsSection
                            title="Analytics Configuration"
                            description="Configure your analytics dashboard and visualization preferences"
                            icon={<BarChart3 className="h-5 w-5 text-purple-600" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <SelectField
                                        label="Default Chart Type"
                                        value={userSettings.analytics.defaultChartType}
                                        onChange={(value) => updateUserSettings('analytics', 'defaultChartType', value)}
                                        options={[
                                            { value: 'bar', label: 'Bar Chart' },
                                            { value: 'line', label: 'Line Chart' },
                                            { value: 'pie', label: 'Pie Chart' },
                                            { value: 'area', label: 'Area Chart' }
                                        ]}
                                        description="Default chart type for new visualizations"
                                    />
                                    <InputField
                                        label="Auto-refresh Interval (seconds)"
                                        value={userSettings.analytics.refreshInterval.toString()}
                                        onChange={(value) => updateUserSettings('analytics', 'refreshInterval', parseInt(value) || 30)}
                                        type="number"
                                        description="How often to automatically refresh dashboard data"
                                    />
                                    <InputField
                                        label="Data Points Limit"
                                        value={userSettings.analytics.dataPointsLimit.toString()}
                                        onChange={(value) => updateUserSettings('analytics', 'dataPointsLimit', parseInt(value) || 1000)}
                                        type="number"
                                        description="Maximum number of data points to display in charts"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <ToggleSwitch
                                        enabled={userSettings.analytics.autoRefresh}
                                        onChange={(value) => updateUserSettings('analytics', 'autoRefresh', value)}
                                        label="Auto-refresh Dashboard"
                                        description="Automatically refresh dashboard data at regular intervals"
                                    />
                                    <ToggleSwitch
                                        enabled={userSettings.analytics.showTooltips}
                                        onChange={(value) => updateUserSettings('analytics', 'showTooltips', value)}
                                        label="Show Chart Tooltips"
                                        description="Display detailed information when hovering over charts"
                                    />
                                    <ToggleSwitch
                                        enabled={userSettings.analytics.animationsEnabled}
                                        onChange={(value) => updateUserSettings('analytics', 'animationsEnabled', value)}
                                        label="Chart Animations"
                                        description="Enable smooth animations for chart transitions"
                                    />
                                </div>
                            </div>
                        </SettingsSection>
                    )}

                    {activeTab === 'security' && (
                        <SettingsSection
                            title="Security & Access"
                            description="Manage your account security and access controls"
                            icon={<Shield className="h-5 w-5 text-purple-600" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <ToggleSwitch
                                        enabled={systemSettings.security.twoFactorEnabled}
                                        onChange={(value) => updateSystemSettings('security', 'twoFactorEnabled', value)}
                                        label="Two-Factor Authentication"
                                        description="Add an extra layer of security to your account"
                                    />
                                    <InputField
                                        label="Session Timeout (minutes)"
                                        value={systemSettings.security.sessionTimeout.toString()}
                                        onChange={(value) => updateSystemSettings('security', 'sessionTimeout', parseInt(value) || 480)}
                                        type="number"
                                        description="Automatically log out after period of inactivity"
                                    />
                                    <InputField
                                        label="Password Expiry (days)"
                                        value={systemSettings.security.passwordExpiry.toString()}
                                        onChange={(value) => updateSystemSettings('security', 'passwordExpiry', parseInt(value) || 90)}
                                        type="number"
                                        description="Require password change after specified days"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <InputField
                                        label="Device Limit"
                                        value={systemSettings.security.deviceLimit.toString()}
                                        onChange={(value) => updateSystemSettings('security', 'deviceLimit', parseInt(value) || 5)}
                                        type="number"
                                        description="Maximum number of devices that can access your account"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">IP Whitelist</label>
                                        <p className="text-xs text-gray-600 mb-2">Restrict access to specific IP addresses or ranges</p>
                                        <div className="space-y-2">
                                            {systemSettings.security.ipWhitelist.map((ip, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        value={ip}
                                                        onChange={(e) => {
                                                            const newList = [...systemSettings.security.ipWhitelist]
                                                            newList[index] = e.target.value
                                                            updateSystemSettings('security', 'ipWhitelist', newList)
                                                        }}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newList = systemSettings.security.ipWhitelist.filter((_, i) => i !== index)
                                                            updateSystemSettings('security', 'ipWhitelist', newList)
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newList = [...systemSettings.security.ipWhitelist, '']
                                                    updateSystemSettings('security', 'ipWhitelist', newList)
                                                }}
                                                className="text-purple-600 text-sm hover:text-purple-700"
                                            >
                                                + Add IP Address
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SettingsSection>
                    )}

                    {activeTab === 'integrations' && (
                        <SettingsSection
                            title="Integrations & API"
                            description="Manage external integrations and API access"
                            icon={<Database className="h-5 w-5 text-purple-600" />}
                        >
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <ToggleSwitch
                                            enabled={systemSettings.integrations.apiAccess}
                                            onChange={(value) => updateSystemSettings('integrations', 'apiAccess', value)}
                                            label="Enable API Access"
                                            description="Allow external applications to access your data via API"
                                        />
                                        <ToggleSwitch
                                            enabled={systemSettings.integrations.webhooksEnabled}
                                            onChange={(value) => updateSystemSettings('integrations', 'webhooksEnabled', value)}
                                            label="Enable Webhooks"
                                            description="Send real-time notifications to external services"
                                        />
                                        <InputField
                                            label="Data Retention (days)"
                                            value={systemSettings.integrations.dataRetention.toString()}
                                            onChange={(value) => updateSystemSettings('integrations', 'dataRetention', parseInt(value) || 365)}
                                            type="number"
                                            description="How long to keep exported data"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Export Formats</label>
                                            <p className="text-xs text-gray-600 mb-2">Available formats for data export</p>
                                            <div className="space-y-2">
                                                {['CSV', 'PDF', 'Excel', 'JSON', 'XML'].map((format) => (
                                                    <label key={format} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={systemSettings.integrations.exportFormats.includes(format)}
                                                            onChange={(e) => {
                                                                const formats = e.target.checked
                                                                    ? [...systemSettings.integrations.exportFormats, format]
                                                                    : systemSettings.integrations.exportFormats.filter(f => f !== format)
                                                                updateSystemSettings('integrations', 'exportFormats', formats)
                                                            }}
                                                            className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                        />
                                                        <span className="text-sm text-gray-700">{format}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Connected Services</h4>
                                            <p className="text-2xl font-bold text-purple-600">{systemSettings.integrations.connectedServices}</p>
                                            <p className="text-xs text-gray-600">Active integrations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SettingsSection>
                    )}

                    {activeTab === 'performance' && (
                        <SettingsSection
                            title="Performance & Optimization"
                            description="Configure performance settings and optimization options"
                            icon={<Zap className="h-5 w-5 text-purple-600" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <ToggleSwitch
                                        enabled={systemSettings.performance.cacheEnabled}
                                        onChange={(value) => updateSystemSettings('performance', 'cacheEnabled', value)}
                                        label="Enable Caching"
                                        description="Cache frequently accessed data for faster performance"
                                    />
                                    <ToggleSwitch
                                        enabled={systemSettings.performance.compressionEnabled}
                                        onChange={(value) => updateSystemSettings('performance', 'compressionEnabled', value)}
                                        label="Data Compression"
                                        description="Compress data transfers to reduce bandwidth usage"
                                    />
                                    <ToggleSwitch
                                        enabled={systemSettings.performance.cdnEnabled}
                                        onChange={(value) => updateSystemSettings('performance', 'cdnEnabled', value)}
                                        label="CDN Acceleration"
                                        description="Use content delivery network for faster asset loading"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <ToggleSwitch
                                        enabled={systemSettings.performance.autoBackup}
                                        onChange={(value) => updateSystemSettings('performance', 'autoBackup', value)}
                                        label="Automatic Backups"
                                        description="Automatically backup your data and settings"
                                    />
                                    <SelectField
                                        label="Backup Frequency"
                                        value={systemSettings.performance.backupFrequency}
                                        onChange={(value) => updateSystemSettings('performance', 'backupFrequency', value)}
                                        options={[
                                            { value: 'daily', label: 'Daily' },
                                            { value: 'weekly', label: 'Weekly' },
                                            { value: 'monthly', label: 'Monthly' }
                                        ]}
                                        description="How often to create automatic backups"
                                    />
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                            <div>
                                                <h4 className="text-sm font-medium text-green-900">System Optimized</h4>
                                                <p className="text-xs text-green-700">All performance settings are configured optimally</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SettingsSection>
                    )}
                </div>

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
                >
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Download className="h-6 w-6 text-blue-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Export Settings</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Download your current settings configuration as a backup.
                        </p>
                        <button
                            onClick={handleExportSettings}
                            className="text-purple-600 text-sm font-medium hover:text-purple-700"
                        >
                            Download config →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Upload className="h-6 w-6 text-green-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Import Settings</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Restore settings from a previously exported configuration file.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            Import config →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <RefreshCw className="h-6 w-6 text-orange-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Reset Settings</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Restore all settings to their default values.
                        </p>
                        <button
                            onClick={handleResetSettings}
                            className="text-purple-600 text-sm font-medium hover:text-purple-700"
                        >
                            Reset to default →
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
