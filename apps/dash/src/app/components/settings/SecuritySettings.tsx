'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    Lock,
    Key,
    Eye,
    EyeOff,
    Smartphone,
    Globe,
    Clock,
    AlertTriangle,
    CheckCircle,
    Save
} from 'lucide-react'

export default function SecuritySettings() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
    const [sessionTimeout, setSessionTimeout] = useState(30)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                    <p className="text-gray-600">Manage your account security and privacy</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                </button>
            </div>

            {/* Password Change */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    <span>Change Password</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Two-Factor Authentication */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-green-500" />
                    <span>Two-Factor Authentication</span>
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-gray-900">Enable 2FA</div>
                        <div className="text-sm text-gray-600">Add an extra layer of security to your account</div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {twoFactorEnabled && <CheckCircle className="w-5 h-5 text-green-500" />}
                        <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Session Management */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span>Session Management</span>
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                        <select
                            value={sessionTimeout}
                            onChange={(e) => setSessionTimeout(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={240}>4 hours</option>
                        </select>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
