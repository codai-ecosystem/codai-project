'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Bell,
    Mail,
    Smartphone,
    Monitor,
    AlertTriangle,
    TrendingUp,
    Users,
    Database,
    Save,
    Volume2,
    VolumeX
} from 'lucide-react'

interface NotificationConfig {
    email: {
        alerts: boolean
        reports: boolean
        sharing: boolean
        system: boolean
    }
    push: {
        alerts: boolean
        reports: boolean
        sharing: boolean
        system: boolean
    }
    desktop: {
        alerts: boolean
        reports: boolean
        sharing: boolean
        system: boolean
    }
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
    quietHours: {
        enabled: boolean
        start: string
        end: string
    }
    soundEnabled: boolean
}

export default function NotificationSettings() {
    const [config, setConfig] = useState<NotificationConfig>({
        email: {
            alerts: true,
            reports: true,
            sharing: true,
            system: false
        },
        push: {
            alerts: true,
            reports: false,
            sharing: true,
            system: false
        },
        desktop: {
            alerts: true,
            reports: false,
            sharing: false,
            system: false
        },
        frequency: 'immediate',
        quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
        },
        soundEnabled: true
    })

    const updateConfig = (updates: Partial<NotificationConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }))
    }

    const updateChannelConfig = (channel: 'email' | 'push' | 'desktop', updates: Partial<NotificationConfig['email']>) => {
        setConfig(prev => ({
            ...prev,
            [channel]: { ...prev[channel], ...updates }
        }))
    }

    const notificationTypes = [
        { key: 'alerts', label: 'Critical Alerts', desc: 'System errors, data anomalies, threshold breaches', icon: AlertTriangle },
        { key: 'reports', label: 'Report Updates', desc: 'Completed reports, scheduled deliveries', icon: TrendingUp },
        { key: 'sharing', label: 'Collaboration', desc: 'Dashboard shares, comments, mentions', icon: Users },
        { key: 'system', label: 'System Updates', desc: 'Maintenance, feature releases, account changes', icon: Database }
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
                    <p className="text-gray-600">Control how and when you receive notifications</p>
                </div>
                <button
                    onClick={() => { }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                </button>
            </div>

            {/* Notification Channels */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <span>Notification Channels</span>
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-900">Notification Type</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-900">
                                    <div className="flex items-center justify-center space-x-2">
                                        <Mail className="w-4 h-4" />
                                        <span>Email</span>
                                    </div>
                                </th>
                                <th className="text-center py-3 px-4 font-medium text-gray-900">
                                    <div className="flex items-center justify-center space-x-2">
                                        <Smartphone className="w-4 h-4" />
                                        <span>Push</span>
                                    </div>
                                </th>
                                <th className="text-center py-3 px-4 font-medium text-gray-900">
                                    <div className="flex items-center justify-center space-x-2">
                                        <Monitor className="w-4 h-4" />
                                        <span>Desktop</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {notificationTypes.map((type) => (
                                <tr key={type.key} className="border-b border-gray-100">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center space-x-3">
                                            <type.icon className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <div className="font-medium text-gray-900">{type.label}</div>
                                                <div className="text-sm text-gray-600">{type.desc}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={config.email[type.key as keyof typeof config.email]}
                                            onChange={(e) => updateChannelConfig('email', { [type.key]: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={config.push[type.key as keyof typeof config.push]}
                                            onChange={(e) => updateChannelConfig('push', { [type.key]: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={config.desktop[type.key as keyof typeof config.desktop]}
                                            onChange={(e) => updateChannelConfig('desktop', { [type.key]: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Frequency & Quiet Hours */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequency</h3>
                    <div className="space-y-3">
                        {[
                            { value: 'immediate', label: 'Immediate', desc: 'Send notifications right away' },
                            { value: 'hourly', label: 'Hourly Digest', desc: 'Bundle notifications every hour' },
                            { value: 'daily', label: 'Daily Digest', desc: 'Send a summary once per day' },
                            { value: 'weekly', label: 'Weekly Summary', desc: 'Send a summary once per week' }
                        ].map((freq) => (
                            <label key={freq.value} className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="frequency"
                                    value={freq.value}
                                    checked={config.frequency === freq.value}
                                    onChange={(e) => updateConfig({ frequency: e.target.value as any })}
                                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">{freq.label}</div>
                                    <div className="text-sm text-gray-600">{freq.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiet Hours</h3>
                    <div className="space-y-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.quietHours.enabled}
                                onChange={(e) => updateConfig({
                                    quietHours: { ...config.quietHours, enabled: e.target.checked }
                                })}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div>
                                <div className="font-medium text-gray-900">Enable Quiet Hours</div>
                                <div className="text-sm text-gray-600">Pause non-critical notifications</div>
                            </div>
                        </label>

                        {config.quietHours.enabled && (
                            <div className="grid grid-cols-2 gap-4 ml-7">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        value={config.quietHours.start}
                                        onChange={(e) => updateConfig({
                                            quietHours: { ...config.quietHours, start: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                    <input
                                        type="time"
                                        value={config.quietHours.end}
                                        onChange={(e) => updateConfig({
                                            quietHours: { ...config.quietHours, end: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.soundEnabled}
                                onChange={(e) => updateConfig({ soundEnabled: e.target.checked })}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex items-center space-x-2">
                                {config.soundEnabled ? (
                                    <Volume2 className="w-4 h-4 text-blue-500" />
                                ) : (
                                    <VolumeX className="w-4 h-4 text-gray-500" />
                                )}
                                <span className="font-medium text-gray-900">Notification Sounds</span>
                            </div>
                        </label>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
