'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    // Settings Icons
    Settings,
    User,
    Bell,
    Shield,
    CreditCard,
    Globe,

    // Action Icons
    Save,
    RotateCcw,
    Upload,
    Trash2,

    // Status Icons
    Info,

    // Navigation Icons
    ChevronRight,

    // Feature Icons
    Palette,
    Moon,
    Sun
} from 'lucide-react'

interface SettingsSection {
    id: string
    title: string
    description: string
    icon: any
    color: string
}

interface NotificationSetting {
    id: string
    label: string
    description: string
    enabled: boolean
    channel: 'email' | 'push' | 'sms'
}

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('profile')
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [notifications, setNotifications] = useState<NotificationSetting[]>([
        {
            id: 'new-tickets',
            label: 'New Tickets',
            description: 'Get notified when new support tickets are created',
            enabled: true,
            channel: 'email'
        },
        {
            id: 'ticket-updates',
            label: 'Ticket Updates',
            description: 'Receive updates when tickets are modified',
            enabled: true,
            channel: 'push'
        },
        {
            id: 'system-alerts',
            label: 'System Alerts',
            description: 'Important system notifications and alerts',
            enabled: true,
            channel: 'email'
        },
        {
            id: 'marketing',
            label: 'Marketing Updates',
            description: 'Product updates and promotional content',
            enabled: false,
            channel: 'email'
        }
    ])

    // Settings sections
    const sections: SettingsSection[] = [
        {
            id: 'profile',
            title: 'Profile Settings',
            description: 'Manage your personal information and preferences',
            icon: User,
            color: 'blue'
        },
        {
            id: 'notifications',
            title: 'Notifications',
            description: 'Configure how you receive notifications',
            icon: Bell,
            color: 'yellow'
        },
        {
            id: 'security',
            title: 'Security',
            description: 'Password, two-factor authentication, and security settings',
            icon: Shield,
            color: 'red'
        },
        {
            id: 'billing',
            title: 'Billing & Plan',
            description: 'Manage your subscription and payment methods',
            icon: CreditCard,
            color: 'green'
        },
        {
            id: 'appearance',
            title: 'Appearance',
            description: 'Customize the look and feel of your workspace',
            icon: Palette,
            color: 'purple'
        },
        {
            id: 'integrations',
            title: 'Integrations',
            description: 'Connect with third-party tools and services',
            icon: Globe,
            color: 'indigo'
        },
        {
            id: 'advanced',
            title: 'Advanced',
            description: 'Advanced settings and developer options',
            icon: Settings,
            color: 'gray'
        }
    ]

    const toggleNotification = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
            )
        )
    }

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        defaultValue="John"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Doe"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue="john.doe@example.com"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        defaultValue="+1 (555) 123-4567"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-2xl font-semibold">JD</span>
                                </div>
                                <div className="flex space-x-3">
                                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <Upload className="h-4 w-4" />
                                        <span>Upload New</span>
                                    </button>
                                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                        <span>Remove</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                            <div className="space-y-4">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{notification.label}</h4>
                                            <p className="text-sm text-gray-600">{notification.description}</p>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <span className="text-xs text-gray-500">Via:</span>
                                                <span className={`px-2 py-1 text-xs rounded ${notification.channel === 'email' ? 'bg-blue-100 text-blue-800' :
                                                        notification.channel === 'push' ? 'bg-green-100 text-green-800' :
                                                            'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {notification.channel.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleNotification(notification.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notification.enabled ? 'bg-blue-600' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notification.enabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </motion.button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )

            case 'security':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Authentication</h3>
                            <div className="space-y-4">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Password</h4>
                                            <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                                        </div>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Change Password
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Enabled</span>
                                            <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                                Configure
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Active Sessions</h4>
                                            <p className="text-sm text-gray-600">Manage your active login sessions</p>
                                        </div>
                                        <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                            View Sessions
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Preferences</h3>
                            <div className="space-y-4">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {isDarkMode ? <Moon className="h-5 w-5 text-purple-600" /> : <Sun className="h-5 w-5 text-yellow-600" />}
                                            <div>
                                                <h4 className="font-medium text-gray-900">Dark Mode</h4>
                                                <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setIsDarkMode(!isDarkMode)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-purple-600' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Interface Density</h4>
                                    <div className="space-y-2">
                                        {['Compact', 'Default', 'Comfortable'].map((density) => (
                                            <label key={density} className="flex items-center space-x-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="density"
                                                    defaultChecked={density === 'Default'}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{density}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            default:
                return (
                    <div className="text-center py-12">
                        <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Section</h3>
                        <p className="text-gray-600">Configure your {activeSection} preferences here.</p>
                    </div>
                )
        }
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your account preferences and configuration</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Settings Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                            <h2 className="font-semibold text-gray-900 mb-4">Settings</h2>
                            <nav className="space-y-2">
                                {sections.map((section) => {
                                    const IconComponent = section.icon
                                    const isActive = activeSection === section.id

                                    return (
                                        <motion.button
                                            key={section.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${isActive
                                                    ? `bg-${section.color}-100 text-${section.color}-700 border-${section.color}-200`
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                        >
                                            <IconComponent className="h-5 w-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">{section.title}</div>
                                                <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                                            </div>
                                            <ChevronRight className="h-4 w-4" />
                                        </motion.button>
                                    )
                                })}
                            </nav>
                        </div>
                    </motion.div>

                    {/* Settings Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {sections.find(s => s.id === activeSection)?.title}
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {sections.find(s => s.id === activeSection)?.description}
                                    </p>
                                </div>
                                <div className="flex space-x-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center space-x-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        <span>Reset</span>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>Save Changes</span>
                                    </motion.button>
                                </div>
                            </div>

                            {renderContent()}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
