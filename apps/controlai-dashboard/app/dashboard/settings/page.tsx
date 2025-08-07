import React from 'react'
/**
 * Settings Page - System Configuration and User Preferences
 * Comprehensive settings management for ControlAI Dashboard
 */
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, User, Shield, Bell, Palette, Database,
    Globe, Key, Monitor, Smartphone, Mail, Clock,
    Eye, EyeOff, Save, RefreshCw, Download, Upload,
    CheckCircle2, AlertTriangle, Info, Zap, Lock,
    Users, BarChart3, MessageSquare, Calendar, Moon, Sun
} from 'lucide-react'

// Import modular components
import { SettingsHeader } from './components/SettingsHeader'
import { GeneralSettings } from './components/GeneralSettings'
import { SecuritySettings } from './components/SecuritySettings'
import { NotificationSettings } from './components/NotificationSettings'
import { ThemeSettings } from './components/ThemeSettings'
import { DataSettings } from './components/DataSettings'
import { IntegrationSettings } from './components/IntegrationSettings'
import { AdvancedSettings } from './components/AdvancedSettings'
import { SettingsFooter } from './components/SettingsFooter'
import { ThemeSettings } from './components/ThemeSettings'
import { DataSettings } from './components/DataSettings'
import { IntegrationSettings } from './components/IntegrationSettings'
import { AdvancedSettings } from './components/AdvancedSettings'
import { SettingsFooter } from './components/SettingsFooter'

interface SettingsState {
    activeSection: 'general' | 'security' | 'notifications' | 'theme' | 'data' | 'integrations' | 'advanced'
    hasUnsavedChanges: boolean
    isLoading: boolean
    lastSaved: string
    backupStatus: 'none' | 'creating' | 'complete' | 'error'
    validationErrors: string[]
}

interface UserSettings {
    // General
    username: string
    email: string
    timezone: string
    language: string
    dateFormat: string

    // Security
    twoFactorEnabled: boolean
    sessionTimeout: number
    passwordExpiry: number
    loginNotifications: boolean

    // Notifications
    emailNotifications: boolean
    pushNotifications: boolean
    slackIntegration: boolean
    notificationSchedule: string

    // Theme
    theme: 'light' | 'dark' | 'auto'
    accentColor: string
    compactMode: boolean
    animations: boolean

    // Data
    dataRetention: number
    autoBackup: boolean
    exportFormat: string
    dataSharing: boolean

    // Integrations
    connectedServices: string[]
    apiKeys: Record<string, string>
    webhooks: any[]

    // Advanced
    debugMode: boolean
    performanceMonitoring: boolean
    experimentalFeatures: boolean
    customCSS: string
}

export default function SettingsPage() {
    const [state, setState] = useState<SettingsState>({
        activeSection: 'general',
        hasUnsavedChanges: false,
        isLoading: false,
        lastSaved: new Date().toISOString(),
        backupStatus: 'none',
        validationErrors: []
    })

    const [settings, setSettings] = useState<UserSettings>({
        // General defaults
        username: 'admin',
        email: 'admin@controlai.com',
        timezone: 'UTC',
        language: 'en',
        dateFormat: 'YYYY-MM-DD',

        // Security defaults
        twoFactorEnabled: true,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginNotifications: true,

        // Notifications defaults
        emailNotifications: true,
        pushNotifications: true,
        slackIntegration: false,
        notificationSchedule: 'business_hours',

        // Theme defaults
        theme: 'auto',
        accentColor: '#3B82F6',
        compactMode: false,
        animations: true,

        // Data defaults
        dataRetention: 365,
        autoBackup: true,
        exportFormat: 'json',
        dataSharing: false,

        // Integrations defaults
        connectedServices: ['github', 'slack'],
        apiKeys: {},
        webhooks: [],

        // Advanced defaults
        debugMode: false,
        performanceMonitoring: true,
        experimentalFeatures: false,
        customCSS: ''
    })

    const navigationSections = [
        { id: 'general', label: 'General', icon: User, description: 'Profile and basic preferences' },
        { id: 'security', label: 'Security', icon: Shield, description: 'Authentication and access control' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts and communication' },
        { id: 'theme', label: 'Appearance', icon: Palette, description: 'Theme and visual customization' },
        { id: 'data', label: 'Data', icon: Database, description: 'Storage and backup settings' },
        { id: 'integrations', label: 'Integrations', icon: Globe, description: 'Connected services and APIs' },
        { id: 'advanced', label: 'Advanced', icon: Settings, description: 'Expert configuration options' }
    ]

    // Settings update handler
    const handleSettingChange = (section: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }))

        setState(prev => ({
            ...prev,
            hasUnsavedChanges: true,
            validationErrors: []
        }))
    }

    // Save settings
    const handleSave = async () => {
        setState(prev => ({ ...prev, isLoading: true }))

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            setState(prev => ({
                ...prev,
                hasUnsavedChanges: false,
                isLoading: false,
                lastSaved: new Date().toISOString()
            }))

            console.log('Settings saved:', settings)
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                validationErrors: ['Failed to save settings. Please try again.']
            }))
        }
    }

    // Reset to defaults
    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            setSettings({
                username: 'admin',
                email: 'admin@controlai.com',
                timezone: 'UTC',
                language: 'en',
                dateFormat: 'YYYY-MM-DD',
                twoFactorEnabled: true,
                sessionTimeout: 30,
                passwordExpiry: 90,
                loginNotifications: true,
                emailNotifications: true,
                pushNotifications: true,
                slackIntegration: false,
                notificationSchedule: 'business_hours',
                theme: 'auto',
                accentColor: '#3B82F6',
                compactMode: false,
                animations: true,
                dataRetention: 365,
                autoBackup: true,
                exportFormat: 'json',
                dataSharing: false,
                connectedServices: ['github', 'slack'],
                apiKeys: {},
                webhooks: [],
                debugMode: false,
                performanceMonitoring: true,
                experimentalFeatures: false,
                customCSS: ''
            })

            setState(prev => ({
                ...prev,
                hasUnsavedChanges: true
            }))
        }
    }

    // Export settings
    const handleExport = () => {
        const exportData = {
            settings,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `controlai-settings-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Import settings
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target?.result as string)
                if (importData.settings) {
                    setSettings(importData.settings)
                    setState(prev => ({
                        ...prev,
                        hasUnsavedChanges: true
                    }))
                }
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    validationErrors: ['Invalid settings file format']
                }))
            }
        }
        reader.readAsText(file)
    }

    // Create backup
    const handleCreateBackup = async () => {
        setState(prev => ({ ...prev, backupStatus: 'creating' }))

        try {
            await new Promise(resolve => setTimeout(resolve, 2000))
            setState(prev => ({ ...prev, backupStatus: 'complete' }))

            setTimeout(() => {
                setState(prev => ({ ...prev, backupStatus: 'none' }))
            }, 3000)
        } catch (error) {
            setState(prev => ({ ...prev, backupStatus: 'error' }))
        }
    }

    const activeSection = navigationSections.find(section => section.id === state.activeSection)

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Settings Header */}
            <SettingsHeader
                activeSection={state.activeSection}
                hasUnsavedChanges={state.hasUnsavedChanges}
                lastSaved={state.lastSaved}
                onSave={handleSave}
                onReset={handleReset}
                onExport={handleExport}
                onImport={handleImport}
                onCreateBackup={handleCreateBackup}
                isLoading={state.isLoading}
                backupStatus={state.backupStatus}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Settings Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                Settings Categories
                            </h2>

                            <nav className="space-y-2">
                                {navigationSections.map((section) => {
                                    const Icon = section.icon
                                    const isActive = state.activeSection === section.id

                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setState(prev => ({ ...prev, activeSection: section.id as any }))}
                                            className={`w-full flex items-start p-3 rounded-xl text-left transition-all duration-200 ${isActive
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-transparent'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                                                }`} />
                                            <div>
                                                <div className={`font-medium ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                                                    }`}>
                                                    {section.label}
                                                </div>
                                                <div className={`text-sm mt-1 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {section.description}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </nav>

                            {/* Quick Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                                    Quick Actions
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={handleExport}
                                        className="w-full flex items-center p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Export Settings
                                    </button>
                                    <label className="w-full flex items-center p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Import Settings
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleImport}
                                            className="hidden"
                                        />
                                    </label>
                                    <button
                                        onClick={handleCreateBackup}
                                        disabled={state.backupStatus === 'creating'}
                                        className="w-full flex items-center p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors disabled:opacity-50"
                                    >
                                        <Database className="w-4 h-4 mr-2" />
                                        {state.backupStatus === 'creating' ? 'Creating...' : 'Create Backup'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            key={state.activeSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Validation Errors */}
                            {state.validationErrors.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                                >
                                    <div className="flex items-center">
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                                        <span className="text-red-800 dark:text-red-200 font-medium">
                                            Please fix the following errors:
                                        </span>
                                    </div>
                                    <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                                        {state.validationErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}

                            {/* Dynamic Settings Content */}
                            {state.activeSection === 'general' && (
                                <GeneralSettings
                                    settings={settings}
                                    onChange={handleSettingChange}
                                />
                            )}

                            {state.activeSection === 'security' && (
                                <SecuritySettings
                                    settings={settings}
                                    onChange={handleSettingChange}
                                />
                            )}

                            {state.activeSection === 'notifications' && (
                                <NotificationSettings
                                    settings={settings}
                                    onChange={handleSettingChange}
                                />
                            )}

                            {state.activeSection === 'theme' && (
                                <ThemeSettings
                                    settings={settings}
                                    onChange={handleSettingChange}
                                />
                            )}

                            {state.activeSection === 'data' && (
                                <DataSettings
                                    settings={settings}
                                    onChange={handleSettingChange}
                                />
                            )}

                            {state.activeSection === 'integrations' && (
                                <IntegrationSettings
                                    settings={settings}
                                    onChange={handleSettingChange}
                                />
                            )}

                            {state.activeSection === 'advanced' && (
                                <AdvancedSettings
                                    settings={settings}
                                    onChange={handleSettingChange}
                                />
                            )}
                        </motion.div>

                        {/* Save Actions */}
                        <div className="mt-8 flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-4">
                                {state.hasUnsavedChanges && (
                                    <div className="flex items-center text-amber-600 dark:text-amber-400">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        <span className="text-sm">You have unsaved changes</span>
                                    </div>
                                )}

                                {!state.hasUnsavedChanges && (
                                    <div className="flex items-center text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        <span className="text-sm">
                                            All changes saved • Last saved {new Date(state.lastSaved).toLocaleTimeString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleReset}
                                    disabled={state.isLoading}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                                >
                                    Reset to Defaults
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={!state.hasUnsavedChanges || state.isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 disabled:opacity-50"
                                >
                                    {state.isLoading ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    {state.isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Footer */}
            <SettingsFooter
                hasChanges={state.hasUnsavedChanges}
                isSaving={state.isLoading}
                lastSaved={state.lastSaved}
                onSave={handleSave}
                onReset={handleReset}
                onExport={handleExport}
                onImport={() => { }}
                onBack={() => window.history.back()}
            />

            {/* Backup Status Notification */}
            {state.backupStatus !== 'none' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div className={`p-4 rounded-lg shadow-lg backdrop-blur-xl border ${state.backupStatus === 'complete'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : state.backupStatus === 'error'
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        }`}>
                        <div className="flex items-center">
                            {state.backupStatus === 'creating' && (
                                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin mr-3" />
                            )}
                            {state.backupStatus === 'complete' && (
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                            )}
                            {state.backupStatus === 'error' && (
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                            )}

                            <div>
                                <span className={`font-medium text-sm block ${state.backupStatus === 'complete'
                                        ? 'text-green-800 dark:text-green-200'
                                        : state.backupStatus === 'error'
                                            ? 'text-red-800 dark:text-red-200'
                                            : 'text-blue-800 dark:text-blue-200'
                                    }`}>
                                    {state.backupStatus === 'creating' && 'Creating backup...'}
                                    {state.backupStatus === 'complete' && 'Backup created successfully'}
                                    {state.backupStatus === 'error' && 'Backup failed'}
                                </span>
                                {state.backupStatus !== 'creating' && (
                                    <span className={`text-xs ${state.backupStatus === 'complete'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {state.backupStatus === 'complete' && 'Settings backup saved to cloud'}
                                        {state.backupStatus === 'error' && 'Please try again later'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

