'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Settings,
    User,
    Shield,
    Bell,
    Globe,
    Palette,
    Database,
    Cloud,
    Key,
    Sliders,
    Monitor,
    Smartphone,
    Save,
    RefreshCw,
    Download,
    Upload,
    Eye,
    EyeOff,
    Check,
    X,
    AlertTriangle,
    Info,
    Lock,
    Unlock,
    Zap,
    Code,
    GitBranch,
    Server,
    Cpu,
    HardDrive,
    Wifi,
    Battery
} from 'lucide-react'

interface SettingsSection {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    category: 'general' | 'development' | 'security' | 'integrations'
}

interface UserSettings {
    // Profile settings
    displayName: string
    email: string
    avatar: string
    timezone: string
    language: string

    // Appearance settings
    theme: 'light' | 'dark' | 'system'
    accentColor: string
    fontSize: 'small' | 'medium' | 'large'
    compactMode: boolean
    animationsEnabled: boolean

    // Development settings
    defaultEditor: string
    autoSave: boolean
    autoFormat: boolean
    tabSize: number
    showLineNumbers: boolean
    enableLinting: boolean
    enableAutoComplete: boolean

    // AI settings
    aiAssistantEnabled: boolean
    aiSuggestions: boolean
    aiCodeGeneration: boolean
    aiModelPreference: string

    // Notification settings
    emailNotifications: boolean
    pushNotifications: boolean
    desktopNotifications: boolean
    soundEnabled: boolean

    // Security settings
    twoFactorEnabled: boolean
    sessionTimeout: number
    loginNotifications: boolean
    apiKeyManagement: boolean

    // Integration settings
    githubIntegration: boolean
    dockerIntegration: boolean
    awsIntegration: boolean
    slackIntegration: boolean
}

const AIDE_Settings: React.FC = () => {
    const [activeSection, setActiveSection] = useState('profile')
    const [settings, setSettings] = useState<UserSettings | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [showApiKeys, setShowApiKeys] = useState(false)
    const [saving, setSaving] = useState(false)

    const settingsSections: SettingsSection[] = [
        {
            id: 'profile',
            name: 'Profile & Account',
            description: 'Personal information and account settings',
            icon: <User className="w-5 h-5" />,
            category: 'general'
        },
        {
            id: 'appearance',
            name: 'Appearance',
            description: 'Theme, colors, and display preferences',
            icon: <Palette className="w-5 h-5" />,
            category: 'general'
        },
        {
            id: 'notifications',
            name: 'Notifications',
            description: 'Email, push, and desktop notification settings',
            icon: <Bell className="w-5 h-5" />,
            category: 'general'
        },
        {
            id: 'development',
            name: 'Development',
            description: 'Editor preferences and coding settings',
            icon: <Code className="w-5 h-5" />,
            category: 'development'
        },
        {
            id: 'ai-assistant',
            name: 'AI Assistant',
            description: 'AI features and model preferences',
            icon: <Zap className="w-5 h-5" />,
            category: 'development'
        },
        {
            id: 'security',
            name: 'Security & Privacy',
            description: 'Authentication and security settings',
            icon: <Shield className="w-5 h-5" />,
            category: 'security'
        },
        {
            id: 'integrations',
            name: 'Integrations',
            description: 'Third-party service connections',
            icon: <Globe className="w-5 h-5" />,
            category: 'integrations'
        },
        {
            id: 'system',
            name: 'System & Performance',
            description: 'Resource usage and performance settings',
            icon: <Server className="w-5 h-5" />,
            category: 'development'
        }
    ]

    useEffect(() => {
        // Simulate loading user settings
        setSettings({
            // Profile
            displayName: 'John Developer',
            email: 'john@example.com',
            avatar: '',
            timezone: 'UTC-5',
            language: 'en-US',

            // Appearance
            theme: 'dark',
            accentColor: '#3B82F6',
            fontSize: 'medium',
            compactMode: false,
            animationsEnabled: true,

            // Development
            defaultEditor: 'vscode',
            autoSave: true,
            autoFormat: true,
            tabSize: 2,
            showLineNumbers: true,
            enableLinting: true,
            enableAutoComplete: true,

            // AI
            aiAssistantEnabled: true,
            aiSuggestions: true,
            aiCodeGeneration: true,
            aiModelPreference: 'gpt-4',

            // Notifications
            emailNotifications: true,
            pushNotifications: true,
            desktopNotifications: false,
            soundEnabled: true,

            // Security
            twoFactorEnabled: true,
            sessionTimeout: 30,
            loginNotifications: true,
            apiKeyManagement: true,

            // Integrations
            githubIntegration: true,
            dockerIntegration: true,
            awsIntegration: false,
            slackIntegration: true
        })
    }, [])

    const handleSettingChange = (key: keyof UserSettings, value: any) => {
        if (settings) {
            setSettings({ ...settings, [key]: value })
            setHasChanges(true)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSaving(false)
        setHasChanges(false)
    }

    const renderProfileSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
                        <input
                            type="text"
                            value={settings?.displayName || ''}
                            onChange={(e) => handleSettingChange('displayName', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={settings?.email || ''}
                            onChange={(e) => handleSettingChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                        <select
                            value={settings?.timezone || ''}
                            onChange={(e) => handleSettingChange('timezone', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="UTC-8">Pacific Time (UTC-8)</option>
                            <option value="UTC-5">Eastern Time (UTC-5)</option>
                            <option value="UTC+0">Greenwich Mean Time (UTC+0)</option>
                            <option value="UTC+1">Central European Time (UTC+1)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                        <select
                            value={settings?.language || ''}
                            onChange={(e) => handleSettingChange('language', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="en-US">English (US)</option>
                            <option value="en-GB">English (UK)</option>
                            <option value="es-ES">Spanish</option>
                            <option value="fr-FR">French</option>
                            <option value="de-DE">German</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderAppearanceSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Theme & Display</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Theme Preference</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['light', 'dark', 'system'].map((theme) => (
                                <button
                                    key={theme}
                                    onClick={() => handleSettingChange('theme', theme)}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${settings?.theme === theme
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-300 hover:border-slate-400'
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Monitor className="w-5 h-5" />
                                        <span className="text-sm font-medium capitalize">{theme}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Font Size</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['small', 'medium', 'large'].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => handleSettingChange('fontSize', size)}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${settings?.fontSize === size
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-300 hover:border-slate-400'
                                        }`}
                                >
                                    <span className={`font-medium capitalize ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
                                        }`}>
                                        {size}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between py-3">
                    <div>
                        <p className="font-medium text-slate-900">Compact Mode</p>
                        <p className="text-sm text-slate-600">Reduce spacing and padding throughout the interface</p>
                    </div>
                    <button
                        onClick={() => handleSettingChange('compactMode', !settings?.compactMode)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${settings?.compactMode ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${settings?.compactMode ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between py-3">
                    <div>
                        <p className="font-medium text-slate-900">Animations</p>
                        <p className="text-sm text-slate-600">Enable smooth transitions and animations</p>
                    </div>
                    <button
                        onClick={() => handleSettingChange('animationsEnabled', !settings?.animationsEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${settings?.animationsEnabled ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${settings?.animationsEnabled ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                    </button>
                </div>
            </div>
        </div>
    )

    const renderDevelopmentSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Editor Preferences</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Default Editor</label>
                        <select
                            value={settings?.defaultEditor || ''}
                            onChange={(e) => handleSettingChange('defaultEditor', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="vscode">VS Code</option>
                            <option value="webstorm">WebStorm</option>
                            <option value="sublime">Sublime Text</option>
                            <option value="atom">Atom</option>
                            <option value="vim">Vim</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tab Size</label>
                        <select
                            value={settings?.tabSize || ''}
                            onChange={(e) => handleSettingChange('tabSize', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={2}>2 spaces</option>
                            <option value={4}>4 spaces</option>
                            <option value={8}>8 spaces</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4 mt-6">
                    {[
                        { key: 'autoSave', label: 'Auto Save', description: 'Automatically save files when modified' },
                        { key: 'autoFormat', label: 'Auto Format', description: 'Format code on save' },
                        { key: 'showLineNumbers', label: 'Line Numbers', description: 'Show line numbers in editor' },
                        { key: 'enableLinting', label: 'Linting', description: 'Enable real-time code linting' },
                        { key: 'enableAutoComplete', label: 'Auto Complete', description: 'Enable intelligent code completion' }
                    ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium text-slate-900">{setting.label}</p>
                                <p className="text-sm text-slate-600">{setting.description}</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange(setting.key as keyof UserSettings, !settings?.[setting.key as keyof UserSettings])}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${settings?.[setting.key as keyof UserSettings] ? 'bg-blue-600' : 'bg-slate-300'
                                    }`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${settings?.[setting.key as keyof UserSettings] ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderAISection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">AI Assistant Configuration</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred AI Model</label>
                    <select
                        value={settings?.aiModelPreference || ''}
                        onChange={(e) => handleSettingChange('aiModelPreference', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="gpt-4">GPT-4 (Recommended)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="claude">Claude</option>
                        <option value="codex">GitHub Codex</option>
                    </select>
                </div>

                <div className="space-y-4">
                    {[
                        { key: 'aiAssistantEnabled', label: 'AI Assistant', description: 'Enable AI-powered development assistance' },
                        { key: 'aiSuggestions', label: 'AI Suggestions', description: 'Show AI suggestions while coding' },
                        { key: 'aiCodeGeneration', label: 'Code Generation', description: 'Allow AI to generate code snippets' }
                    ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium text-slate-900">{setting.label}</p>
                                <p className="text-sm text-slate-600">{setting.description}</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange(setting.key as keyof UserSettings, !settings?.[setting.key as keyof UserSettings])}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${settings?.[setting.key as keyof UserSettings] ? 'bg-blue-600' : 'bg-slate-300'
                                    }`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${settings?.[setting.key as keyof UserSettings] ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderSecuritySection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Settings</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                    <select
                        value={settings?.sessionTimeout || ''}
                        onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={240}>4 hours</option>
                        <option value={480}>8 hours</option>
                    </select>
                </div>

                <div className="space-y-4">
                    {[
                        { key: 'twoFactorEnabled', label: 'Two-Factor Authentication', description: 'Require 2FA for account access' },
                        { key: 'loginNotifications', label: 'Login Notifications', description: 'Get notified of new login attempts' },
                        { key: 'apiKeyManagement', label: 'API Key Management', description: 'Enable advanced API key controls' }
                    ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium text-slate-900">{setting.label}</p>
                                <p className="text-sm text-slate-600">{setting.description}</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange(setting.key as keyof UserSettings, !settings?.[setting.key as keyof UserSettings])}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${settings?.[setting.key as keyof UserSettings] ? 'bg-blue-600' : 'bg-slate-300'
                                    }`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${settings?.[setting.key as keyof UserSettings] ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900">API Keys</h4>
                        <button
                            onClick={() => setShowApiKeys(!showApiKeys)}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                        >
                            {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showApiKeys ? 'Hide' : 'Show'} Keys
                        </button>
                    </div>

                    {showApiKeys && (
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Development API Key</span>
                                    <code className="text-xs bg-white px-2 py-1 rounded border">aide_dev_••••••••••••7d3f</code>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Production API Key</span>
                                    <code className="text-xs bg-white px-2 py-1 rounded border">aide_prod_••••••••••••9a2b</code>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    const renderIntegrationsSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Connected Services</h3>

                <div className="space-y-4">
                    {[
                        { key: 'githubIntegration', label: 'GitHub', description: 'Connect to GitHub repositories', icon: <GitBranch className="w-5 h-5" /> },
                        { key: 'dockerIntegration', label: 'Docker', description: 'Container management integration', icon: <Database className="w-5 h-5" /> },
                        { key: 'awsIntegration', label: 'AWS', description: 'Amazon Web Services integration', icon: <Cloud className="w-5 h-5" /> },
                        { key: 'slackIntegration', label: 'Slack', description: 'Team communication integration', icon: <Bell className="w-5 h-5" /> }
                    ].map((integration) => (
                        <div key={integration.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    {integration.icon}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{integration.label}</p>
                                    <p className="text-sm text-slate-600">{integration.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSettingChange(integration.key as keyof UserSettings, !settings?.[integration.key as keyof UserSettings])}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${settings?.[integration.key as keyof UserSettings] ? 'bg-blue-600' : 'bg-slate-300'
                                    }`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${settings?.[integration.key as keyof UserSettings] ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderSystemSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">System Information</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Cpu className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">CPU Usage</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Current</span>
                                <span className="font-medium">34%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '34%' }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <HardDrive className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Memory Usage</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Current</span>
                                <span className="font-medium">2.1 GB / 8.0 GB</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '26%' }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Wifi className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">Network</span>
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Status</span>
                                <span className="font-medium text-green-600">Connected</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Latency</span>
                                <span className="font-medium">12ms</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Battery className="w-5 h-5 text-yellow-600" />
                            <span className="font-medium">Performance</span>
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Mode</span>
                                <span className="font-medium">Optimized</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Uptime</span>
                                <span className="font-medium">2d 14h</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderContent = () => {
        switch (activeSection) {
            case 'profile': return renderProfileSection()
            case 'appearance': return renderAppearanceSection()
            case 'development': return renderDevelopmentSection()
            case 'ai-assistant': return renderAISection()
            case 'security': return renderSecuritySection()
            case 'integrations': return renderIntegrationsSection()
            case 'system': return renderSystemSection()
            default: return renderProfileSection()
        }
    }

    if (!settings) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                                Settings & Configuration
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Customize your AIDE development environment and preferences
                            </p>
                        </div>

                        {hasChanges && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-gradient-to-r from-blue-600 to-slate-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                            >
                                {saving ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Settings</h3>
                                <nav className="space-y-1">
                                    {settingsSections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${activeSection === section.id
                                                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                                    : 'hover:bg-slate-50 text-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1 rounded ${activeSection === section.id ? 'text-blue-600' : 'text-slate-500'
                                                    }`}>
                                                    {section.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{section.name}</div>
                                                    <div className="text-xs text-slate-500 mt-1">{section.description}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-slate-200 shadow-lg"
                        >
                            {renderContent()}
                        </motion.div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            AI Development Environment
                        </h3>
                        <p className="text-slate-600 max-w-3xl mx-auto">
                            AIDE provides a comprehensive settings system with intelligent defaults,
                            real-time configuration validation, and seamless integration with development tools
                            to create the optimal coding environment for every developer.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIDE_Settings
