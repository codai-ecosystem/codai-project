import React from 'react'
/**
 * Security Settings Component - Authentication and Access Control
 */
'use client'

import { motion } from 'framer-motion'
import {
    Shield, Lock, Key, Eye, EyeOff, Smartphone,
    Clock, AlertTriangle, CheckCircle2, Settings,
    RefreshCw, Mail, Users, Globe, Calendar
} from 'lucide-react'
import { useState } from 'react'

interface SecuritySettingsProps {
    settings: any
    onChange: (section: string, key: string, value: any) => void
}

export function SecuritySettings({ settings, onChange }: SecuritySettingsProps) {
    const [showApiKey, setShowApiKey] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const sessionTimeouts = [
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 60, label: '1 hour' },
        { value: 240, label: '4 hours' },
        { value: 480, label: '8 hours' },
        { value: 1440, label: '24 hours' }
    ]

    const passwordExpiryOptions = [
        { value: 30, label: '30 days' },
        { value: 60, label: '60 days' },
        { value: 90, label: '90 days' },
        { value: 180, label: '6 months' },
        { value: 365, label: '1 year' },
        { value: 0, label: 'Never' }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Authentication */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Lock className="w-6 h-6 mr-3 text-red-500" />
                    Authentication
                </h3>

                <div className="space-y-6">
                    {/* Password Change */}
                    <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Change Password
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        <button
                            disabled={!newPassword || newPassword !== confirmPassword}
                            className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Update Password
                        </button>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                                    <Smartphone className="w-5 h-5 mr-2 text-green-500" />
                                    Two-Factor Authentication
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Add an extra layer of security to your account
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.twoFactorEnabled}
                                    onChange={(e) => onChange('security', 'twoFactorEnabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {settings.twoFactorEnabled && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <div className="flex items-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                    <span className="text-green-800 dark:text-green-200 font-medium">
                                        Two-factor authentication is enabled
                                    </span>
                                </div>
                                <p className="text-green-700 dark:text-green-300 text-sm mt-2">
                                    Your account is protected with SMS and authenticator app verification.
                                </p>
                                <button className="mt-3 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-sm underline">
                                    Manage 2FA Settings
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Password Expiry */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Password Expiry
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Automatically expire passwords for enhanced security
                                </p>
                            </div>
                            <select
                                value={settings.passwordExpiry}
                                onChange={(e) => onChange('security', 'passwordExpiry', parseInt(e.target.value))}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {passwordExpiryOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Management */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-blue-500" />
                    Session Management
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Session Timeout
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Automatically log out after period of inactivity
                            </p>
                        </div>
                        <select
                            value={settings.sessionTimeout}
                            onChange={(e) => onChange('security', 'sessionTimeout', parseInt(e.target.value))}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            {sessionTimeouts.map(timeout => (
                                <option key={timeout.value} value={timeout.value}>
                                    {timeout.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Login Notifications
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Notify when your account is accessed
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.loginNotifications}
                                onChange={(e) => onChange('security', 'loginNotifications', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Remember Device
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Skip 2FA for trusted devices for 30 days
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.rememberDevice !== false}
                                onChange={(e) => onChange('security', 'rememberDevice', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* API Access */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Key className="w-6 h-6 mr-3 text-purple-500" />
                    API Access
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Personal Access Token
                        </label>
                        <div className="flex space-x-2">
                            <div className="flex-1 relative">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value="sk-proj-abcd1234efgh5678ijkl9012mnop3456"
                                    readOnly
                                    className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <button
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Use this token to authenticate API requests. Keep it secure!
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                API Rate Limiting
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Limit API requests per hour for security
                            </p>
                        </div>
                        <select
                            value={settings.apiRateLimit || 1000}
                            onChange={(e) => onChange('security', 'apiRateLimit', parseInt(e.target.value))}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value={100}>100 requests/hour</option>
                            <option value={500}>500 requests/hour</option>
                            <option value={1000}>1,000 requests/hour</option>
                            <option value={5000}>5,000 requests/hour</option>
                            <option value={0}>Unlimited</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-green-500" />
                    Privacy & Data Protection
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Activity Logging
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Log user actions for security and audit purposes
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.activityLogging !== false}
                                onChange={(e) => onChange('security', 'activityLogging', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Data Encryption
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Encrypt sensitive data at rest and in transit
                            </p>
                        </div>
                        <div className="flex items-center">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Enabled
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                GDPR Compliance
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Comply with General Data Protection Regulation
                            </p>
                        </div>
                        <div className="flex items-center">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Compliant
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Status */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CheckCircle2 className="w-6 h-6 mr-3 text-green-500" />
                    Security Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">Excellent</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Security Score</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3 min</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Last Security Check</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Security Threats</div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

