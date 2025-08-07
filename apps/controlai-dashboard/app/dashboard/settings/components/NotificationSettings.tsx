import React from 'react'
/**
 * Notification Settings Component - Alerts and Communication Preferences
 */
'use client'

import { motion } from 'framer-motion'
import {
    Bell, Mail, Smartphone, MessageSquare, Calendar,
    Clock, Volume2, VolumeX, Settings, Users,
    AlertTriangle, CheckCircle2, Info, Zap, Globe
} from 'lucide-react'
import { useState } from 'react'

interface NotificationSettingsProps {
    settings: any
    onChange: (section: string, key: string, value: any) => void
}

export function NotificationSettings({ settings, onChange }: NotificationSettingsProps) {
    const [testNotification, setTestNotification] = useState(false)

    const notificationTypes = [
        {
            id: 'system',
            label: 'System Alerts',
            description: 'Critical system notifications and updates',
            icon: AlertTriangle,
            color: 'red',
            categories: ['Security alerts', 'System maintenance', 'Server issues', 'Critical errors']
        },
        {
            id: 'tasks',
            label: 'Task Updates',
            description: 'Task assignments, completions, and deadlines',
            icon: CheckCircle2,
            color: 'green',
            categories: ['Task assignments', 'Due date reminders', 'Completion notices', 'Status changes']
        },
        {
            id: 'projects',
            label: 'Project Activity',
            description: 'Project milestones, updates, and collaborations',
            icon: Users,
            color: 'blue',
            categories: ['Milestone updates', 'Team mentions', 'Project deadlines', 'Status reports']
        },
        {
            id: 'analytics',
            label: 'Analytics Reports',
            description: 'Performance reports and data insights',
            icon: Zap,
            color: 'purple',
            categories: ['Weekly reports', 'Performance alerts', 'Data anomalies', 'Custom reports']
        }
    ]

    const deliveryMethods = [
        {
            id: 'email',
            label: 'Email',
            icon: Mail,
            description: 'Receive notifications via email',
            enabled: settings.emailNotifications
        },
        {
            id: 'push',
            label: 'Push Notifications',
            icon: Bell,
            description: 'Browser and mobile push notifications',
            enabled: settings.pushNotifications
        },
        {
            id: 'sms',
            label: 'SMS',
            icon: Smartphone,
            description: 'Text message notifications for critical alerts',
            enabled: settings.smsNotifications || false
        },
        {
            id: 'slack',
            label: 'Slack',
            icon: MessageSquare,
            description: 'Notifications in Slack channels',
            enabled: settings.slackIntegration
        }
    ]

    const scheduleOptions = [
        { value: 'always', label: 'Always', description: '24/7 notifications' },
        { value: 'business_hours', label: 'Business Hours', description: '9 AM - 6 PM weekdays' },
        { value: 'custom', label: 'Custom Schedule', description: 'Set your own hours' },
        { value: 'weekdays', label: 'Weekdays Only', description: 'Monday to Friday only' }
    ]

    const sendTestNotification = async () => {
        setTestNotification(true)

        // Simulate sending test notification
        setTimeout(() => {
            setTestNotification(false)
            // You would typically show a success message here
        }, 2000)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Notification Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Bell className="w-6 h-6 mr-3 text-blue-500" />
                    Notification Types
                </h3>

                <div className="space-y-6">
                    {notificationTypes.map((type) => {
                        const Icon = type.icon
                        const isEnabled = settings[`${type.id}Notifications`] !== false

                        return (
                            <div key={type.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-lg bg-${type.color}-100 dark:bg-${type.color}-900/30`}>
                                            <Icon className={`w-5 h-5 text-${type.color}-600 dark:text-${type.color}-400`} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {type.label}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {type.description}
                                            </p>
                                        </div>
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isEnabled}
                                            onChange={(e) => onChange('notifications', `${type.id}Notifications`, e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {isEnabled && (
                                    <div className="ml-11">
                                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Notification Categories:
                                        </h5>
                                        <div className="grid grid-cols-2 gap-2">
                                            {type.categories.map((category) => (
                                                <label key={category} className="flex items-center text-sm">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-2"
                                                    />
                                                    <span className="text-gray-600 dark:text-gray-400">{category}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Delivery Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Globe className="w-6 h-6 mr-3 text-green-500" />
                    Delivery Methods
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deliveryMethods.map((method) => {
                        const Icon = method.icon

                        return (
                            <div key={method.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {method.label}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {method.description}
                                            </p>
                                        </div>
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={method.enabled}
                                            onChange={(e) => onChange('notifications', `${method.id}Notifications`, e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {method.enabled && (
                                    <div className="space-y-2">
                                        {method.id === 'email' && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={settings.email}
                                                    onChange={(e) => onChange('general', 'email', e.target.value)}
                                                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        )}

                                        {method.id === 'sms' && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={settings.phoneNumber || ''}
                                                    onChange={(e) => onChange('notifications', 'phoneNumber', e.target.value)}
                                                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>
                                        )}

                                        {method.id === 'slack' && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Slack Channel
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.slackChannel || ''}
                                                    onChange={(e) => onChange('notifications', 'slackChannel', e.target.value)}
                                                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="#general"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Notification Schedule */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-purple-500" />
                    Notification Schedule
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            When would you like to receive notifications?
                        </label>
                        <div className="space-y-3">
                            {scheduleOptions.map((option) => (
                                <label key={option.value} className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="notificationSchedule"
                                        value={option.value}
                                        checked={settings.notificationSchedule === option.value}
                                        onChange={(e) => onChange('notifications', 'notificationSchedule', e.target.value)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
                                    />
                                    <div className="ml-3">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {option.label}
                                        </span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {option.description}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {settings.notificationSchedule === 'custom' && (
                        <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                Custom Schedule
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={settings.customScheduleStart || '09:00'}
                                        onChange={(e) => onChange('notifications', 'customScheduleStart', e.target.value)}
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={settings.customScheduleEnd || '18:00'}
                                        onChange={(e) => onChange('notifications', 'customScheduleEnd', e.target.value)}
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Active Days
                                </label>
                                <div className="flex space-x-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                        <label key={day} className="flex flex-col items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                defaultChecked={day !== 'Sat' && day !== 'Sun'}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                {day}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sound and Visual Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Volume2 className="w-6 h-6 mr-3 text-orange-500" />
                    Sound & Visual
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Notification Sounds
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Play sound alerts for notifications
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notificationSounds !== false}
                                onChange={(e) => onChange('notifications', 'notificationSounds', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Desktop Banners
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Show notification banners on desktop
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.desktopBanners !== false}
                                onChange={(e) => onChange('notifications', 'desktopBanners', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Badge Notifications
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Show unread count badges
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.badgeNotifications !== false}
                                onChange={(e) => onChange('notifications', 'badgeNotifications', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {settings.notificationSounds && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Notification Sound
                            </label>
                            <select
                                value={settings.notificationSound || 'default'}
                                onChange={(e) => onChange('notifications', 'notificationSound', e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="default">Default</option>
                                <option value="chime">Chime</option>
                                <option value="ding">Ding</option>
                                <option value="pop">Pop</option>
                                <option value="subtle">Subtle</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Test Notifications */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Settings className="w-6 h-6 mr-3 text-blue-500" />
                    Test Notifications
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Send a test notification to verify your settings are working correctly.
                </p>

                <button
                    onClick={sendTestNotification}
                    disabled={testNotification}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 disabled:opacity-50"
                >
                    {testNotification ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Sending Test...
                        </>
                    ) : (
                        <>
                            <Bell className="w-4 h-4 mr-2" />
                            Send Test Notification
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    )
}

