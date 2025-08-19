'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield,
    Lock,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    UserCheck,
    Phone,
    MapPin,
    Camera,
    MessageCircle,
    Bell,
    Settings,
    ArrowLeft,
    Info,
    FileText,
    HelpCircle,
    Flag,
    Users,
    Heart,
    Zap,
    Clock,
    Globe,
    Smartphone,
    Key,
    Database,
    Fingerprint,
    UserX,
    Activity,
    Download,
    Share2,
    ChevronRight,
    ChevronDown,
    ExternalLink,
    Copy,
    RefreshCw,
    Calendar,
    Video,
    Mic,
    Navigation,
    Search
} from 'lucide-react'
import Link from 'next/link'

interface SafetyTip {
    id: string
    title: string
    description: string
    category: string
    priority: 'high' | 'medium' | 'low'
    icon: React.ReactNode
}

interface PrivacySetting {
    id: string
    title: string
    description: string
    enabled: boolean
    category: string
    locked?: boolean
    premium?: boolean
}

interface SecurityFeature {
    id: string
    title: string
    description: string
    status: 'active' | 'inactive' | 'configured'
    icon: React.ReactNode
    action?: string
}

interface ReportOption {
    id: string
    title: string
    description: string
    severity: 'low' | 'medium' | 'high'
    icon: React.ReactNode
}

const CurtAISafetyPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'safety' | 'privacy' | 'security' | 'report'>('safety')
    const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([])
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
    const [showDataDownload, setShowDataDownload] = useState(false)

    const safetyTips: SafetyTip[] = [
        {
            id: '1',
            title: 'Meet in Public Places',
            description: 'Always choose crowded, public locations for first dates. Avoid private homes or isolated areas.',
            category: 'dating',
            priority: 'high',
            icon: <Users className="w-5 h-5" />
        },
        {
            id: '2',
            title: 'Tell Someone Your Plans',
            description: 'Share your date details with a trusted friend or family member, including location and time.',
            category: 'dating',
            priority: 'high',
            icon: <MessageCircle className="w-5 h-5" />
        },
        {
            id: '3',
            title: 'Trust Your Instincts',
            description: 'If something feels wrong or uncomfortable, don\'t ignore that feeling. Leave if necessary.',
            category: 'personal',
            priority: 'high',
            icon: <Heart className="w-5 h-5" />
        },
        {
            id: '4',
            title: 'Video Chat Before Meeting',
            description: 'Have a video call to verify identity and build comfort before meeting in person.',
            category: 'online',
            priority: 'medium',
            icon: <Video className="w-5 h-5" />
        },
        {
            id: '5',
            title: 'Control Your Transportation',
            description: 'Drive yourself or use your own ride service. Don\'t rely on your date for transportation.',
            category: 'dating',
            priority: 'medium',
            icon: <Navigation className="w-5 h-5" />
        },
        {
            id: '6',
            title: 'Limit Personal Information',
            description: 'Be cautious about sharing personal details like home address, workplace, or financial information.',
            category: 'online',
            priority: 'medium',
            icon: <Lock className="w-5 h-5" />
        }
    ]

    const initialPrivacySettings: PrivacySetting[] = [
        {
            id: '1',
            title: 'Profile Visibility',
            description: 'Control who can see your profile and photos',
            enabled: true,
            category: 'profile'
        },
        {
            id: '2',
            title: 'Location Sharing',
            description: 'Share your approximate location with matches',
            enabled: false,
            category: 'location'
        },
        {
            id: '3',
            title: 'Online Status',
            description: 'Show when you\'re active on the platform',
            enabled: true,
            category: 'activity'
        },
        {
            id: '4',
            title: 'Read Receipts',
            description: 'Let others know when you\'ve read their messages',
            enabled: false,
            category: 'messaging'
        },
        {
            id: '5',
            title: 'Data Analytics',
            description: 'Allow anonymous usage data to improve the platform',
            enabled: true,
            category: 'data'
        },
        {
            id: '6',
            title: 'Third-party Sharing',
            description: 'Share data with verified partner services',
            enabled: false,
            category: 'data',
            premium: true
        }
    ]

    React.useEffect(() => {
        setPrivacySettings(initialPrivacySettings)
    }, [])

    const securityFeatures: SecurityFeature[] = [
        {
            id: '1',
            title: 'Two-Factor Authentication',
            description: 'Add an extra layer of security to your account',
            status: 'active',
            icon: <Fingerprint className="w-5 h-5" />,
            action: 'Configure'
        },
        {
            id: '2',
            title: 'Photo Verification',
            description: 'Verify your identity with real-time photos',
            status: 'configured',
            icon: <Camera className="w-5 h-5" />,
            action: 'Verified'
        },
        {
            id: '3',
            title: 'Background Check',
            description: 'Optional criminal background verification',
            status: 'inactive',
            icon: <UserCheck className="w-5 h-5" />,
            action: 'Start Check'
        },
        {
            id: '4',
            title: 'Safe Call Feature',
            description: 'In-app calling without sharing phone numbers',
            status: 'active',
            icon: <Phone className="w-5 h-5" />,
            action: 'Active'
        },
        {
            id: '5',
            title: 'Emergency Contacts',
            description: 'Quick access to emergency contacts during dates',
            status: 'configured',
            icon: <AlertTriangle className="w-5 h-5" />,
            action: 'Manage'
        }
    ]

    const reportOptions: ReportOption[] = [
        {
            id: '1',
            title: 'Inappropriate Behavior',
            description: 'Report harassment, inappropriate messages, or behavior',
            severity: 'high',
            icon: <Flag className="w-5 h-5" />
        },
        {
            id: '2',
            title: 'Fake Profile',
            description: 'Report suspected fake or catfish profiles',
            severity: 'medium',
            icon: <UserX className="w-5 h-5" />
        },
        {
            id: '3',
            title: 'Safety Concern',
            description: 'Report any safety-related issues or threats',
            severity: 'high',
            icon: <AlertTriangle className="w-5 h-5" />
        },
        {
            id: '4',
            title: 'Spam or Scam',
            description: 'Report promotional spam or financial scams',
            severity: 'medium',
            icon: <Shield className="w-5 h-5" />
        }
    ]

    const faqItems = [
        {
            id: '1',
            question: 'How does CurtAI verify user profiles?',
            answer: 'We use multiple verification methods including photo verification, phone number confirmation, and optional background checks. All profile photos are screened by AI and human moderators.'
        },
        {
            id: '2',
            question: 'What information does CurtAI collect?',
            answer: 'We collect profile information, usage data, location data (if enabled), and communication within the app. We never sell personal data and only share anonymized analytics to improve our service.'
        },
        {
            id: '3',
            question: 'Can I delete my data permanently?',
            answer: 'Yes, you can request complete data deletion from your account settings. This process takes up to 30 days and removes all personal information from our systems.'
        },
        {
            id: '4',
            question: 'How do I report someone?',
            answer: 'You can report users directly from their profile or message thread. We investigate all reports within 24 hours and take appropriate action based on our community guidelines.'
        }
    ]

    const togglePrivacySetting = (id: string) => {
        setPrivacySettings(prev =>
            prev.map(setting =>
                setting.id === id && !setting.locked
                    ? { ...setting, enabled: !setting.enabled }
                    : setting
            )
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'configured': return 'bg-blue-100 text-blue-800'
            case 'inactive': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'border-red-300 hover:border-red-400'
            case 'medium': return 'border-yellow-300 hover:border-yellow-400'
            case 'low': return 'border-green-300 hover:border-green-400'
            default: return 'border-gray-300 hover:border-gray-400'
        }
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />
            case 'medium': return <Info className="w-4 h-4 text-yellow-500" />
            case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />
            default: return <Info className="w-4 h-4 text-gray-500" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-8 shadow-xl"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="p-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Shield className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Safety & Privacy</h1>
                                <p className="text-pink-100">Your Security & Privacy Matter</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <HelpCircle className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Security Status */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-2">Security Status</h2>
                                <p className="text-pink-100">Your account security level</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2 text-green-300">High</div>
                                <div className="text-pink-100">Protection Level</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
                    <div className="flex space-x-2">
                        {[
                            { id: 'safety', label: 'Safety Tips', icon: <Shield className="w-4 h-4" /> },
                            { id: 'privacy', label: 'Privacy Settings', icon: <Eye className="w-4 h-4" /> },
                            { id: 'security', label: 'Security Features', icon: <Lock className="w-4 h-4" /> },
                            { id: 'report', label: 'Report & Support', icon: <Flag className="w-4 h-4" /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 flex-1 justify-center ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                                    }`}
                            >
                                {tab.icon}
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Safety Tips Tab */}
                {activeTab === 'safety' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Essential Safety Tips */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                <h2 className="text-xl font-bold text-gray-900">Essential Safety Tips</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {safetyTips.filter(tip => tip.priority === 'high').map((tip, index) => (
                                    <motion.div
                                        key={tip.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="border-2 border-red-200 rounded-lg p-4 bg-red-50"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                                {tip.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                                                <p className="text-gray-600 text-sm">{tip.description}</p>
                                            </div>
                                            {getPriorityIcon(tip.priority)}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Safety Guidelines */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Guidelines</h2>

                            <div className="space-y-4">
                                {safetyTips.filter(tip => tip.priority !== 'high').map((tip, index) => (
                                    <motion.div
                                        key={tip.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
                                    >
                                        <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                                            {tip.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                                            <p className="text-gray-600 text-sm">{tip.description}</p>
                                        </div>
                                        {getPriorityIcon(tip.priority)}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Emergency Resources */}
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">Emergency Resources</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                                    <Phone className="w-8 h-8 mx-auto mb-2" />
                                    <h3 className="font-semibold mb-1">Emergency Services</h3>
                                    <p className="text-sm text-pink-100 mb-2">Call 911 for immediate help</p>
                                    <button className="bg-white text-red-600 px-3 py-1 rounded-lg text-sm font-medium">
                                        Call Now
                                    </button>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                                    <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                                    <h3 className="font-semibold mb-1">Crisis Text Line</h3>
                                    <p className="text-sm text-pink-100 mb-2">Text HOME to 741741</p>
                                    <button className="bg-white text-red-600 px-3 py-1 rounded-lg text-sm font-medium">
                                        Text Support
                                    </button>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                                    <Shield className="w-8 h-8 mx-auto mb-2" />
                                    <h3 className="font-semibold mb-1">CurtAI Support</h3>
                                    <p className="text-sm text-pink-100 mb-2">24/7 safety support</p>
                                    <button className="bg-white text-red-600 px-3 py-1 rounded-lg text-sm font-medium">
                                        Contact Us
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Privacy Settings Tab */}
                {activeTab === 'privacy' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Privacy Controls */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Privacy Controls</h2>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setShowDataDownload(!showDataDownload)}
                                        className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download My Data</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {privacySettings.map((setting, index) => (
                                    <motion.div
                                        key={setting.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold text-gray-900">{setting.title}</h3>
                                                {setting.premium && (
                                                    <span className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                        Premium
                                                    </span>
                                                )}
                                                {setting.locked && (
                                                    <Lock className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm mt-1">{setting.description}</p>
                                        </div>

                                        <button
                                            onClick={() => togglePrivacySetting(setting.id)}
                                            disabled={setting.locked}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.enabled
                                                    ? 'bg-gradient-to-r from-pink-500 to-red-500'
                                                    : 'bg-gray-300'
                                                } ${setting.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Data Download Modal */}
                            <AnimatePresence>
                                {showDataDownload && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                                    >
                                        <div className="bg-white rounded-xl p-6 max-w-md w-full">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Download Your Data</h3>
                                            <p className="text-gray-600 text-sm mb-6">
                                                We'll prepare a comprehensive file containing all your data. This may take a few minutes.
                                            </p>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => setShowDataDownload(false)}
                                                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200">
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Data Usage Information */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">How We Use Your Data</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Profile Matching</h3>
                                            <p className="text-gray-600 text-sm">To find compatible matches based on preferences</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Activity className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Platform Improvement</h3>
                                            <p className="text-gray-600 text-sm">To enhance features and user experience</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Shield className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Safety & Security</h3>
                                            <p className="text-gray-600 text-sm">To protect users and prevent misuse</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Bell className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Communications</h3>
                                            <p className="text-gray-600 text-sm">To send relevant updates and notifications</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Security Features Tab */}
                {activeTab === 'security' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Security Features */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Security Features</h2>

                            <div className="space-y-4">
                                {securityFeatures.map((feature, index) => (
                                    <motion.div
                                        key={feature.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-pink-100 rounded-lg text-pink-600">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                                                <p className="text-gray-600 text-sm">{feature.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feature.status)}`}>
                                                {feature.status}
                                            </span>
                                            {feature.action && (
                                                <button className="text-pink-600 hover:text-pink-700 font-medium text-sm">
                                                    {feature.action}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Account Security */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Security</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900">Password</h3>
                                            <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                                                Change
                                            </button>
                                        </div>
                                        <p className="text-gray-600 text-sm">Last updated 30 days ago</p>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900">Email Address</h3>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                Verified
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">user@example.com</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900">Phone Number</h3>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                Verified
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">+1 (555) ***-**98</p>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900">Login Sessions</h3>
                                            <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                                                Manage
                                            </button>
                                        </div>
                                        <p className="text-gray-600 text-sm">3 active sessions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Report & Support Tab */}
                {activeTab === 'report' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Report Options */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Report an Issue</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reportOptions.map((option, index) => (
                                    <motion.button
                                        key={option.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`text-left p-4 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${getSeverityColor(option.severity)}`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                                {option.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                                                <p className="text-gray-600 text-sm">{option.description}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

                            <div className="space-y-4">
                                {faqItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="border border-gray-200 rounded-lg"
                                    >
                                        <button
                                            onClick={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="font-semibold text-gray-900">{item.question}</span>
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-400 transition-transform ${expandedFAQ === item.id ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {expandedFAQ === item.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="px-4 pb-4"
                                                >
                                                    <p className="text-gray-600 text-sm">{item.answer}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Support */}
                        <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">Need More Help?</h2>
                            <p className="text-pink-100 mb-6">
                                Our support team is available 24/7 to help with any safety or privacy concerns.
                            </p>
                            <div className="flex space-x-4">
                                <button className="bg-white text-pink-600 px-6 py-3 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                    Contact Support
                                </button>
                                <button className="border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium">
                                    Live Chat
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-12 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Shield className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Industry-Leading Security</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Bank-level encryption and advanced security measures protect your data
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Learn More
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <UserCheck className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Verified Community</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Photo verification and background checks ensure authentic profiles
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Verification Info
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Clock className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Round-the-clock safety support and incident response team
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Get Help
                            </button>
                        </motion.div>
                    </div>

                    <div className="text-center mt-8 pt-8 border-t border-white/20">
                        <p className="text-pink-100">
                            © 2025 CurtAI - Your Safety & Privacy Are Our Priority. Part of the CODAI Ecosystem.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default CurtAISafetyPage
