'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Settings,
    User,
    Shield,
    Bell,
    Palette,
    Network,
    Database,
    Key,
    Globe,
    Moon,
    Sun,
    Monitor,
    Save,
    RefreshCw,
    Download,
    Upload,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    Smartphone,
    Mail,
    Lock,
    Trash2,
    Plus,
    Edit
} from 'lucide-react'

interface UserProfile {
    username: string
    email: string
    walletAddress: string
    joinDate: string
    kycStatus: 'verified' | 'pending' | 'not_started'
    twoFactorEnabled: boolean
}

interface SecuritySettings {
    twoFactorAuth: boolean
    biometricAuth: boolean
    sessionTimeout: string
    loginNotifications: boolean
    ipWhitelist: string[]
    apiKeyGenerated: boolean
}

interface NotificationSettings {
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    transactionAlerts: boolean
    governanceUpdates: boolean
    validatorAlerts: boolean
    priceAlerts: boolean
}

interface ThemeSettings {
    darkMode: boolean
    colorScheme: 'default' | 'blue' | 'purple' | 'green'
    fontSize: 'small' | 'medium' | 'large'
    language: string
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'theme' | 'network'>('profile')
    const [showApiKey, setShowApiKey] = useState(false)
    const [showPrivateKey, setShowPrivateKey] = useState(false)

    const userProfile: UserProfile = {
        username: 'KodexTrader2025',
        email: 'trader@kodexchain.com',
        walletAddress: 'kodex1qw2eh7x9k8v3n2p5m7t1s4r6y9u2w5e8r0t3y6u',
        joinDate: '2024-01-15',
        kycStatus: 'verified',
        twoFactorEnabled: true
    }

    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        twoFactorAuth: true,
        biometricAuth: false,
        sessionTimeout: '30m',
        loginNotifications: true,
        ipWhitelist: ['192.168.1.100', '10.0.0.50'],
        apiKeyGenerated: true
    })

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        transactionAlerts: true,
        governanceUpdates: true,
        validatorAlerts: false,
        priceAlerts: true
    })

    const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
        darkMode: false,
        colorScheme: 'default',
        fontSize: 'medium',
        language: 'en'
    })

    const getKycStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'not_started': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getKycStatusIcon = (status: string) => {
        switch (status) {
            case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />
            case 'not_started': return <AlertCircle className="w-4 h-4 text-gray-500" />
            default: return <AlertCircle className="w-4 h-4 text-gray-500" />
        }
    }

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 12)}...${address.slice(-8)}`
    }

    const handleSaveSettings = () => {
        // Save settings logic here
        console.log('Settings saved')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white py-4 px-6 shadow-xl"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Settings className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Settings</h1>
                                    <p className="text-indigo-100">Manage your account and preferences</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleSaveSettings}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Settings Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900">Settings Menu</h2>
                            </div>
                            <nav className="p-2">
                                {[
                                    { id: 'profile', label: 'Profile', icon: User },
                                    { id: 'security', label: 'Security', icon: Shield },
                                    { id: 'notifications', label: 'Notifications', icon: Bell },
                                    { id: 'theme', label: 'Appearance', icon: Palette },
                                    { id: 'network', label: 'Network', icon: Network }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </motion.div>

                    {/* Settings Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                            <input
                                                type="text"
                                                value={userProfile.username}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                value={userProfile.email}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={truncateAddress(userProfile.walletAddress)}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                                    readOnly
                                                />
                                                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                                    <Eye className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                                            <input
                                                type="text"
                                                value={userProfile.joinDate}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
                                            <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg ${getKycStatusColor(userProfile.kycStatus)}`}>
                                                {getKycStatusIcon(userProfile.kycStatus)}
                                                <span className="capitalize font-medium">{userProfile.kycStatus.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Account Actions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button className="p-4 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2">
                                            <Download className="w-5 h-5 text-gray-600" />
                                            <span>Export Data</span>
                                        </button>
                                        <button className="p-4 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2">
                                            <Upload className="w-5 h-5 text-gray-600" />
                                            <span>Import Settings</span>
                                        </button>
                                        <button className="p-4 border border-red-300 hover:bg-red-50 text-red-600 rounded-lg transition-colors flex items-center space-x-2">
                                            <Trash2 className="w-5 h-5" />
                                            <span>Delete Account</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h3>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                                                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={securitySettings.twoFactorAuth}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Biometric Authentication</h4>
                                                <p className="text-sm text-gray-600">Use fingerprint or face recognition</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={securitySettings.biometricAuth}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, biometricAuth: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout</label>
                                            <select
                                                value={securitySettings.sessionTimeout}
                                                onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            >
                                                <option value="15m">15 minutes</option>
                                                <option value="30m">30 minutes</option>
                                                <option value="1h">1 hour</option>
                                                <option value="4h">4 hours</option>
                                                <option value="never">Never</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Login Notifications</h4>
                                                <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={securitySettings.loginNotifications}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, loginNotifications: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">API Access</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type={showApiKey ? 'text' : 'password'}
                                                    value={showApiKey ? 'kodex_api_1234567890abcdef' : '••••••••••••••••••••'}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                                    readOnly
                                                />
                                                <button
                                                    onClick={() => setShowApiKey(!showApiKey)}
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition-colors">
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex space-x-3">
                                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                                                Generate New Key
                                            </button>
                                            <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
                                                Download Key
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notification Settings */}
                        {activeTab === 'notifications' && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h3>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-4">Delivery Methods</h4>
                                        <div className="space-y-4">
                                            {[
                                                { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
                                                { key: 'pushNotifications', label: 'Push Notifications', icon: Smartphone },
                                                { key: 'smsNotifications', label: 'SMS Notifications', icon: Smartphone }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <item.icon className="w-5 h-5 text-gray-600" />
                                                        <span className="font-medium text-gray-900">{item.label}</span>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationSettings[item.key as keyof NotificationSettings] as boolean}
                                                            onChange={(e) => setNotificationSettings({
                                                                ...notificationSettings,
                                                                [item.key]: e.target.checked
                                                            })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-4">Notification Types</h4>
                                        <div className="space-y-4">
                                            {[
                                                { key: 'transactionAlerts', label: 'Transaction Alerts', description: 'Get notified of all transactions' },
                                                { key: 'governanceUpdates', label: 'Governance Updates', description: 'New proposals and voting updates' },
                                                { key: 'validatorAlerts', label: 'Validator Alerts', description: 'Validator status and performance updates' },
                                                { key: 'priceAlerts', label: 'Price Alerts', description: 'KODEX price movement notifications' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between">
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">{item.label}</h5>
                                                        <p className="text-sm text-gray-600">{item.description}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationSettings[item.key as keyof NotificationSettings] as boolean}
                                                            onChange={(e) => setNotificationSettings({
                                                                ...notificationSettings,
                                                                [item.key]: e.target.checked
                                                            })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Theme Settings */}
                        {activeTab === 'theme' && (
                            <div className="space-y-6">
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Appearance Settings</h3>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Theme Mode</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { value: 'light', label: 'Light', icon: Sun },
                                                    { value: 'dark', label: 'Dark', icon: Moon },
                                                    { value: 'system', label: 'System', icon: Monitor }
                                                ].map((mode) => (
                                                    <button
                                                        key={mode.value}
                                                        className={`p-4 border-2 rounded-lg transition-colors flex flex-col items-center space-y-2 ${(!themeSettings.darkMode && mode.value === 'light') ||
                                                                (themeSettings.darkMode && mode.value === 'dark')
                                                                ? 'border-indigo-600 bg-indigo-50'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                    >
                                                        <mode.icon className="w-6 h-6 text-gray-600" />
                                                        <span className="font-medium text-gray-900">{mode.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Color Scheme</label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[
                                                    { value: 'default', color: 'bg-indigo-500' },
                                                    { value: 'blue', color: 'bg-blue-500' },
                                                    { value: 'purple', color: 'bg-purple-500' },
                                                    { value: 'green', color: 'bg-green-500' }
                                                ].map((scheme) => (
                                                    <button
                                                        key={scheme.value}
                                                        onClick={() => setThemeSettings({ ...themeSettings, colorScheme: scheme.value as any })}
                                                        className={`p-4 border-2 rounded-lg transition-colors flex flex-col items-center space-y-2 ${themeSettings.colorScheme === scheme.value
                                                                ? 'border-indigo-600 bg-indigo-50'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full ${scheme.color}`}></div>
                                                        <span className="font-medium text-gray-900 capitalize">{scheme.value}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                                            <select
                                                value={themeSettings.fontSize}
                                                onChange={(e) => setThemeSettings({ ...themeSettings, fontSize: e.target.value as any })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            >
                                                <option value="small">Small</option>
                                                <option value="medium">Medium</option>
                                                <option value="large">Large</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                            <select
                                                value={themeSettings.language}
                                                onChange={(e) => setThemeSettings({ ...themeSettings, language: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Español</option>
                                                <option value="fr">Français</option>
                                                <option value="de">Deutsch</option>
                                                <option value="zh">中文</option>
                                                <option value="ja">日本語</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Network Settings */}
                        {activeTab === 'network' && (
                            <div className="space-y-6">
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Network Configuration</h3>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">RPC Endpoint</label>
                                            <input
                                                type="text"
                                                value="https://rpc.kodexchain.com"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Chain ID</label>
                                            <input
                                                type="text"
                                                value="kodex-1"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Gas Price (KODEX)</label>
                                            <input
                                                type="text"
                                                value="0.003"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Default Gas Limit</label>
                                            <input
                                                type="text"
                                                value="200000"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Connection Status</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-700">Network Status</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-green-600 font-medium">Connected</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-700">Block Height</span>
                                            <span className="font-mono text-gray-900">2,847,392</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-700">Network Version</span>
                                            <span className="font-mono text-gray-900">v2.1.0</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-700">Peer Count</span>
                                            <span className="font-mono text-gray-900">47</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
