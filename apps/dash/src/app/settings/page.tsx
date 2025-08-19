'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Settings,
    User,
    Monitor,
    Bell,
    Shield,
    Database,
    Zap
} from 'lucide-react'
import ProfileSettings from '../components/settings/ProfileSettings'
import DashboardPreferences from '../components/settings/DashboardPreferences'
import NotificationSettings from '../components/settings/NotificationSettings'
import SecuritySettings from '../components/settings/SecuritySettings'
import DataSettings from '../components/settings/DataSettings'
import IntegrationSettings from '../components/settings/IntegrationSettings'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User, component: ProfileSettings },
        { id: 'dashboard', label: 'Dashboard', icon: Monitor, component: DashboardPreferences },
        { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
        { id: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
        { id: 'data', label: 'Data', icon: Database, component: DataSettings },
        { id: 'integrations', label: 'Integrations', icon: Zap, component: IntegrationSettings }
    ]

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProfileSettings

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-6 shadow-xl"
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
                                    <p className="text-blue-100">Configure your analytics platform preferences</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
                >
                    {/* Navigation Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex flex-wrap space-x-1 p-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Settings Content */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-6"
                    >
                        <ActiveComponent />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}
