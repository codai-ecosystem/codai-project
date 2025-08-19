'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings,
    ArrowLeft,
    User,
    Bell,
    Shield,
    CreditCard,
    Smartphone,
    Globe,
    DollarSign,
    Lock,
    Eye,
    Moon,
    Sun,
    ChevronRight,
    Fingerprint,
    Key,
    MapPin,
    Download,
    HelpCircle,
    MessageSquare,
    LogOut,
    Star,
    Coffee
} from 'lucide-react'

interface SettingSection {
    id: string
    title: string
    icon: React.ReactNode
    items: SettingItem[]
}

interface SettingItem {
    id: string
    title: string
    description?: string
    type: 'toggle' | 'navigation' | 'action'
    value?: boolean
    action?: () => void
}

export default function SettingsPage() {
    const [darkMode, setDarkMode] = useState(false)
    const [notifications, setNotifications] = useState(true)
    const [biometric, setBiometric] = useState(true)
    const [transactionAlerts, setTransactionAlerts] = useState(true)
    const [marketingEmails, setMarketingEmails] = useState(false)

    const settingSections: SettingSection[] = [
        {
            id: 'account',
            title: 'Account & Profile',
            icon: <User className="w-5 h-5" />,
            items: [
                {
                    id: 'profile',
                    title: 'Personal Information',
                    description: 'Update your name, email, and contact details',
                    type: 'navigation'
                },
                {
                    id: 'verification',
                    title: 'Account Verification',
                    description: 'Verify your identity and increase limits',
                    type: 'navigation'
                },
                {
                    id: 'preferences',
                    title: 'Preferences',
                    description: 'Language, currency, and display settings',
                    type: 'navigation'
                }
            ]
        },
        {
            id: 'security',
            title: 'Security & Privacy',
            icon: <Shield className="w-5 h-5" />,
            items: [
                {
                    id: 'biometric',
                    title: 'Biometric Authentication',
                    description: 'Use fingerprint or face ID to unlock',
                    type: 'toggle',
                    value: biometric
                },
                {
                    id: 'pin',
                    title: 'Change PIN',
                    description: 'Update your 4-digit security PIN',
                    type: 'navigation'
                },
                {
                    id: 'password',
                    title: 'Change Password',
                    description: 'Update your account password',
                    type: 'navigation'
                },
                {
                    id: 'twofa',
                    title: 'Two-Factor Authentication',
                    description: 'Add an extra layer of security',
                    type: 'navigation'
                },
                {
                    id: 'privacy',
                    title: 'Privacy Settings',
                    description: 'Control how your data is used',
                    type: 'navigation'
                }
            ]
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: <Bell className="w-5 h-5" />,
            items: [
                {
                    id: 'push',
                    title: 'Push Notifications',
                    description: 'Receive notifications on your device',
                    type: 'toggle',
                    value: notifications
                },
                {
                    id: 'transactions',
                    title: 'Transaction Alerts',
                    description: 'Get notified of account activity',
                    type: 'toggle',
                    value: transactionAlerts
                },
                {
                    id: 'marketing',
                    title: 'Marketing Emails',
                    description: 'Receive promotional offers and updates',
                    type: 'toggle',
                    value: marketingEmails
                },
                {
                    id: 'schedule',
                    title: 'Notification Schedule',
                    description: 'Set quiet hours and preferences',
                    type: 'navigation'
                }
            ]
        },
        {
            id: 'banking',
            title: 'Banking Settings',
            icon: <CreditCard className="w-5 h-5" />,
            items: [
                {
                    id: 'limits',
                    title: 'Transaction Limits',
                    description: 'Set daily and monthly spending limits',
                    type: 'navigation'
                },
                {
                    id: 'autopay',
                    title: 'AutoPay Settings',
                    description: 'Manage automatic bill payments',
                    type: 'navigation'
                },
                {
                    id: 'statements',
                    title: 'Statements & Documents',
                    description: 'Download and manage your statements',
                    type: 'navigation'
                },
                {
                    id: 'beneficiaries',
                    title: 'Beneficiaries',
                    description: 'Manage saved transfer recipients',
                    type: 'navigation'
                }
            ]
        },
        {
            id: 'app',
            title: 'App Settings',
            icon: <Smartphone className="w-5 h-5" />,
            items: [
                {
                    id: 'theme',
                    title: 'Dark Mode',
                    description: 'Switch to dark theme',
                    type: 'toggle',
                    value: darkMode
                },
                {
                    id: 'language',
                    title: 'Language',
                    description: 'Change app language',
                    type: 'navigation'
                },
                {
                    id: 'currency',
                    title: 'Currency Display',
                    description: 'Set your preferred currency',
                    type: 'navigation'
                },
                {
                    id: 'offline',
                    title: 'Offline Access',
                    description: 'Manage offline data storage',
                    type: 'navigation'
                }
            ]
        },
        {
            id: 'support',
            title: 'Help & Support',
            icon: <HelpCircle className="w-5 h-5" />,
            items: [
                {
                    id: 'faq',
                    title: 'FAQ',
                    description: 'Find answers to common questions',
                    type: 'navigation'
                },
                {
                    id: 'contact',
                    title: 'Contact Support',
                    description: '24/7 customer service',
                    type: 'navigation'
                },
                {
                    id: 'feedback',
                    title: 'Send Feedback',
                    description: 'Help us improve the app',
                    type: 'navigation'
                },
                {
                    id: 'rate',
                    title: 'Rate BancAI Mobile',
                    description: 'Share your experience',
                    type: 'action'
                }
            ]
        }
    ]

    const handleToggle = (settingId: string) => {
        switch (settingId) {
            case 'theme':
                setDarkMode(!darkMode)
                break
            case 'push':
                setNotifications(!notifications)
                break
            case 'biometric':
                setBiometric(!biometric)
                break
            case 'transactions':
                setTransactionAlerts(!transactionAlerts)
                break
            case 'marketing':
                setMarketingEmails(!marketingEmails)
                break
        }
    }

    const getSectionColor = (sectionId: string) => {
        switch (sectionId) {
            case 'account': return 'bg-blue-100 text-blue-600'
            case 'security': return 'bg-red-100 text-red-600'
            case 'notifications': return 'bg-yellow-100 text-yellow-600'
            case 'banking': return 'bg-green-100 text-green-600'
            case 'app': return 'bg-purple-100 text-purple-600'
            case 'support': return 'bg-orange-100 text-orange-600'
            default: return 'bg-gray-100 text-gray-600'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 pb-20">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white py-4 px-4 shadow-xl"
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold">Settings</h1>
                            <p className="text-green-100 text-sm">Manage your banking preferences</p>
                        </div>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Settings className="w-5 h-5" />
                    </div>
                </div>
            </motion.header>

            <div className="px-4 py-6">
                {/* User Profile Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            JD
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">John Doe</h3>
                            <p className="text-sm text-gray-600">john.doe@email.com</p>
                            <div className="flex items-center space-x-2 mt-2">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    Verified Account
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    Premium Member
                                </span>
                            </div>
                        </div>
                        <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </motion.div>

                {/* Settings Sections */}
                <div className="space-y-6">
                    {settingSections.map((section, sectionIndex) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + sectionIndex * 0.1 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center space-x-2 mb-3">
                                <div className={`p-2 rounded-lg ${getSectionColor(section.id)}`}>
                                    {section.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
                                {section.items.map((item, itemIndex) => (
                                    <div
                                        key={item.id}
                                        className={`p-4 ${itemIndex !== section.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{item.title}</div>
                                                {item.description && (
                                                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                                                )}
                                            </div>

                                            {item.type === 'toggle' && (
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleToggle(item.id)}
                                                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${item.value ? 'bg-green-500' : 'bg-gray-300'
                                                        }`}
                                                >
                                                    <motion.div
                                                        animate={{ x: item.value ? 24 : 4 }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                                    />
                                                </motion.button>
                                            )}

                                            {item.type === 'navigation' && (
                                                <button className="p-1">
                                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                                </button>
                                            )}

                                            {item.type === 'action' && (
                                                <button className="text-green-600 font-medium">
                                                    Open
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 space-y-4"
                >
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white text-left">
                            <Download className="w-6 h-6 mb-2" />
                            <div className="font-semibold">Download Statement</div>
                            <div className="text-sm text-blue-100">Get your latest bank statement</div>
                        </button>

                        <button className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-4 text-white text-left">
                            <MessageSquare className="w-6 h-6 mb-2" />
                            <div className="font-semibold">Live Chat</div>
                            <div className="text-sm text-purple-100">Get instant support</div>
                        </button>
                    </div>
                </motion.div>

                {/* App Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mt-8"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mx-auto flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900">BancAI Mobile</h4>
                            <p className="text-sm text-gray-600">Version 2.4.1</p>
                            <p className="text-xs text-gray-500">Built with ❤️ for secure mobile banking</p>
                        </div>

                        <div className="flex justify-center space-x-4 mt-6 pt-6 border-t border-gray-100">
                            <button className="text-green-600 text-sm font-medium">Privacy Policy</button>
                            <button className="text-green-600 text-sm font-medium">Terms of Service</button>
                            <button className="text-green-600 text-sm font-medium">Licenses</button>
                        </div>
                    </div>
                </motion.div>

                {/* Sign Out */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="mt-8"
                >
                    <button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl p-4 font-semibold transition-colors flex items-center justify-center space-x-2">
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
