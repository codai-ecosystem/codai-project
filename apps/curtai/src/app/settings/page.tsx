'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Settings,
    User,
    Bell,
    Heart,
    MapPin,
    Palette,
    Globe,
    Shield,
    Smartphone,
    Volume2,
    VolumeX,
    Sun,
    Moon,
    Monitor,
    Languages,
    Clock,
    ArrowLeft,
    Save,
    RefreshCw,
    Download,
    Upload,
    Trash2,
    Edit,
    Eye,
    EyeOff,
    Plus,
    Minus,
    Filter,
    Target,
    Calendar,
    MessageCircle,
    Video,
    Camera,
    Mic,
    Navigation,
    Search,
    Star,
    Award,
    TrendingUp,
    Users,
    Coffee,
    Music,
    Gamepad2,
    Utensils,
    Mountain,
    Film,
    BookOpen,
    Zap,
    Info,
    ChevronRight,
    ChevronDown,
    Check,
    X,
    AlertCircle,
    HelpCircle
} from 'lucide-react'
import Link from 'next/link'

interface Setting {
    id: string
    title: string
    description: string
    type: 'toggle' | 'select' | 'range' | 'input' | 'multi-select'
    value: any
    options?: { label: string; value: any }[]
    min?: number
    max?: number
    category: string
    premium?: boolean
}

interface NotificationSetting {
    id: string
    title: string
    description: string
    enabled: boolean
    channels: ('push' | 'email' | 'sms')[]
    category: string
}

interface MatchPreference {
    id: string
    title: string
    description: string
    value: number | string | string[] | [number, number]
    type: 'range' | 'select' | 'multi-select'
    options?: { label: string; value: any }[]
    min?: number
    max?: number
}

const CurtAISettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'matching' | 'appearance'>('general')
    const [settings, setSettings] = useState<Setting[]>([])
    const [notifications, setNotifications] = useState<NotificationSetting[]>([])
    const [matchPreferences, setMatchPreferences] = useState<MatchPreference[]>([])
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [unsavedChanges, setUnsavedChanges] = useState(false)

    const initialSettings: Setting[] = [
        {
            id: 'language',
            title: 'Language',
            description: 'Choose your preferred language',
            type: 'select',
            value: 'en',
            options: [
                { label: 'English', value: 'en' },
                { label: 'Spanish', value: 'es' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' },
                { label: 'Italian', value: 'it' }
            ],
            category: 'general'
        },
        {
            id: 'timezone',
            title: 'Time Zone',
            description: 'Set your local time zone',
            type: 'select',
            value: 'America/New_York',
            options: [
                { label: 'Eastern Time (ET)', value: 'America/New_York' },
                { label: 'Central Time (CT)', value: 'America/Chicago' },
                { label: 'Mountain Time (MT)', value: 'America/Denver' },
                { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' }
            ],
            category: 'general'
        },
        {
            id: 'distanceUnit',
            title: 'Distance Unit',
            description: 'Choose your preferred distance measurement',
            type: 'select',
            value: 'miles',
            options: [
                { label: 'Miles', value: 'miles' },
                { label: 'Kilometers', value: 'km' }
            ],
            category: 'general'
        },
        {
            id: 'autoplay',
            title: 'Autoplay Videos',
            description: 'Automatically play videos in profiles',
            type: 'toggle',
            value: true,
            category: 'general'
        },
        {
            id: 'soundEffects',
            title: 'Sound Effects',
            description: 'Play sounds for app interactions',
            type: 'toggle',
            value: true,
            category: 'general'
        },
        {
            id: 'dataUsage',
            title: 'Data Saving Mode',
            description: 'Reduce data usage on mobile networks',
            type: 'toggle',
            value: false,
            category: 'general'
        }
    ]

    const initialNotifications: NotificationSetting[] = [
        {
            id: 'newMatches',
            title: 'New Matches',
            description: 'When you receive a new match',
            enabled: true,
            channels: ['push', 'email'],
            category: 'matches'
        },
        {
            id: 'messages',
            title: 'New Messages',
            description: 'When someone sends you a message',
            enabled: true,
            channels: ['push'],
            category: 'messages'
        },
        {
            id: 'likes',
            title: 'Profile Likes',
            description: 'When someone likes your profile',
            enabled: true,
            channels: ['push'],
            category: 'activity'
        },
        {
            id: 'profileViews',
            title: 'Profile Views',
            description: 'When someone views your profile',
            enabled: false,
            channels: [],
            category: 'activity'
        },
        {
            id: 'events',
            title: 'Event Reminders',
            description: 'Reminders for upcoming events',
            enabled: true,
            channels: ['push', 'email'],
            category: 'events'
        },
        {
            id: 'promotions',
            title: 'Promotions & Features',
            description: 'Information about new features and offers',
            enabled: false,
            channels: ['email'],
            category: 'marketing'
        }
    ]

    const initialMatchPreferences: MatchPreference[] = [
        {
            id: 'ageRange',
            title: 'Age Range',
            description: 'Preferred age range for matches',
            value: [25, 35] as [number, number],
            type: 'range',
            min: 18,
            max: 65
        },
        {
            id: 'distance',
            title: 'Maximum Distance',
            description: 'How far you\'re willing to travel',
            value: 25,
            type: 'range',
            min: 1,
            max: 100
        },
        {
            id: 'interests',
            title: 'Shared Interests',
            description: 'Activities you enjoy doing together',
            value: ['dining', 'travel', 'fitness', 'movies'] as string[],
            type: 'multi-select',
            options: [
                { label: 'Dining', value: 'dining' },
                { label: 'Travel', value: 'travel' },
                { label: 'Fitness', value: 'fitness' },
                { label: 'Movies', value: 'movies' },
                { label: 'Music', value: 'music' },
                { label: 'Books', value: 'books' },
                { label: 'Art', value: 'art' },
                { label: 'Gaming', value: 'gaming' },
                { label: 'Cooking', value: 'cooking' },
                { label: 'Sports', value: 'sports' }
            ]
        },
        {
            id: 'relationship',
            title: 'Relationship Type',
            description: 'What you\'re looking for',
            value: 'serious',
            type: 'select',
            options: [
                { label: 'Casual Dating', value: 'casual' },
                { label: 'Serious Relationship', value: 'serious' },
                { label: 'Marriage', value: 'marriage' },
                { label: 'Friendship', value: 'friendship' }
            ]
        },
        {
            id: 'education',
            title: 'Education Level',
            description: 'Preferred education background',
            value: ['bachelors', 'masters'] as string[],
            type: 'multi-select',
            options: [
                { label: 'High School', value: 'highschool' },
                { label: 'Some College', value: 'somecollege' },
                { label: 'Bachelor\'s Degree', value: 'bachelors' },
                { label: 'Master\'s Degree', value: 'masters' },
                { label: 'PhD/Doctorate', value: 'phd' }
            ]
        }
    ]

    React.useEffect(() => {
        setSettings(initialSettings)
        setNotifications(initialNotifications)
        setMatchPreferences(initialMatchPreferences)
    }, [])

    const updateSetting = (id: string, value: any) => {
        setSettings(prev =>
            prev.map(setting =>
                setting.id === id ? { ...setting, value } : setting
            )
        )
        setUnsavedChanges(true)
    }

    const updateNotification = (id: string, updates: Partial<NotificationSetting>) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, ...updates } : notif
            )
        )
        setUnsavedChanges(true)
    }

    const updateMatchPreference = (id: string, value: any) => {
        setMatchPreferences(prev =>
            prev.map(pref =>
                pref.id === id ? { ...pref, value } : pref
            )
        )
        setUnsavedChanges(true)
    }

    const saveAllSettings = () => {
        // Simulate saving settings
        setTimeout(() => {
            setUnsavedChanges(false)
            setShowConfirmDialog(false)
        }, 1000)
    }

    const resetToDefaults = () => {
        setSettings(initialSettings)
        setNotifications(initialNotifications)
        setMatchPreferences(initialMatchPreferences)
        setUnsavedChanges(true)
    }

    const renderSettingControl = (setting: Setting) => {
        switch (setting.type) {
            case 'toggle':
                return (
                    <button
                        onClick={() => updateSetting(setting.id, !setting.value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.value
                                ? 'bg-gradient-to-r from-pink-500 to-red-500'
                                : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                )

            case 'select':
                return (
                    <select
                        value={setting.value}
                        onChange={(e) => updateSetting(setting.id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                        {setting.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )

            case 'range':
                return (
                    <div className="w-32">
                        <input
                            type="range"
                            min={setting.min}
                            max={setting.max}
                            value={setting.value}
                            onChange={(e) => updateSetting(setting.id, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="text-center text-sm text-gray-600 mt-1">
                            {setting.value}
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    const renderMatchPreferenceControl = (preference: MatchPreference) => {
        switch (preference.type) {
            case 'range':
                if (Array.isArray(preference.value) && preference.value.length === 2) {
                    // Age range slider
                    const [minVal, maxVal] = preference.value as [number, number]
                    return (
                        <div className="w-48">
                            <div className="flex space-x-4 mb-2">
                                <input
                                    type="range"
                                    min={preference.min}
                                    max={preference.max}
                                    value={minVal}
                                    onChange={(e) => {
                                        const newValue: [number, number] = [parseInt(e.target.value), maxVal]
                                        updateMatchPreference(preference.id, newValue)
                                    }}
                                    className="flex-1"
                                />
                                <input
                                    type="range"
                                    min={preference.min}
                                    max={preference.max}
                                    value={maxVal}
                                    onChange={(e) => {
                                        const newValue: [number, number] = [minVal, parseInt(e.target.value)]
                                        updateMatchPreference(preference.id, newValue)
                                    }}
                                    className="flex-1"
                                />
                            </div>
                            <div className="text-center text-sm text-gray-600">
                                {minVal} - {maxVal}
                            </div>
                        </div>
                    )
                } else {
                    // Single value range
                    return (
                        <div className="w-32">
                            <input
                                type="range"
                                min={preference.min}
                                max={preference.max}
                                value={preference.value as number}
                                onChange={(e) => updateMatchPreference(preference.id, parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-center text-sm text-gray-600 mt-1">
                                {preference.value} miles
                            </div>
                        </div>
                    )
                }

            case 'select':
                return (
                    <select
                        value={preference.value as string}
                        onChange={(e) => updateMatchPreference(preference.id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                        {preference.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )

            case 'multi-select':
                const selectedValues = preference.value as string[]
                return (
                    <div className="space-y-2 max-w-md">
                        <div className="flex flex-wrap gap-2">
                            {selectedValues.map((selectedValue) => {
                                const option = preference.options?.find(opt => opt.value === selectedValue)
                                return option ? (
                                    <span
                                        key={selectedValue}
                                        className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                                    >
                                        <span>{option.label}</span>
                                        <button
                                            onClick={() => {
                                                const newValue = selectedValues.filter(v => v !== selectedValue)
                                                updateMatchPreference(preference.id, newValue)
                                            }}
                                            className="hover:text-pink-900"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ) : null
                            })}
                        </div>
                        <select
                            onChange={(e) => {
                                if (e.target.value && !selectedValues.includes(e.target.value)) {
                                    const newValue = [...selectedValues, e.target.value]
                                    updateMatchPreference(preference.id, newValue)
                                }
                                e.target.value = ''
                            }}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                            <option value="">Add interest...</option>
                            {preference.options?.filter(option => !selectedValues.includes(option.value)).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )

            default:
                return null
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'matches': return <Heart className="w-4 h-4" />
            case 'messages': return <MessageCircle className="w-4 h-4" />
            case 'activity': return <TrendingUp className="w-4 h-4" />
            case 'events': return <Calendar className="w-4 h-4" />
            case 'marketing': return <Star className="w-4 h-4" />
            default: return <Bell className="w-4 h-4" />
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
                                <Settings className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Settings & Preferences</h1>
                                <p className="text-pink-100">Customize Your CurtAI Experience</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {unsavedChanges && (
                                <button
                                    onClick={() => setShowConfirmDialog(true)}
                                    className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </button>
                            )}
                            <button
                                onClick={resetToDefaults}
                                className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Settings Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">24</div>
                            <div className="text-pink-100 text-sm">Total Settings</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">6</div>
                            <div className="text-pink-100 text-sm">Notifications</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">5</div>
                            <div className="text-pink-100 text-sm">Match Preferences</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">High</div>
                            <div className="text-pink-100 text-sm">Privacy Level</div>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
                    <div className="flex space-x-2">
                        {[
                            { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
                            { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
                            { id: 'matching', label: 'Match Preferences', icon: <Heart className="w-4 h-4" /> },
                            { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> }
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

                {/* General Settings Tab */}
                {activeTab === 'general' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Account Settings */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>

                            <div className="space-y-6">
                                {settings.map((setting, index) => (
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
                                            </div>
                                            <p className="text-gray-600 text-sm mt-1">{setting.description}</p>
                                        </div>

                                        <div className="ml-4">
                                            {renderSettingControl(setting)}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Data & Storage */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Data & Storage</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900">Storage Usage</h3>
                                            <span className="text-sm text-gray-600">2.3 GB / 5 GB</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full" style={{ width: '46%' }} />
                                        </div>
                                    </div>

                                    <button className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-pink-300 hover:text-pink-600 transition-colors">
                                        <Download className="w-4 h-4" />
                                        <span>Export My Data</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Cache Size</h3>
                                        <p className="text-gray-600 text-sm mb-3">Clear cached images and data</p>
                                        <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                                            Clear Cache (156 MB)
                                        </button>
                                    </div>

                                    <button className="w-full flex items-center justify-center space-x-2 p-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete Account</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Notification Settings */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                            <div className="space-y-6">
                                {notifications.map((notification, index) => (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                                                    {getCategoryIcon(notification.category)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                                    <p className="text-gray-600 text-sm">{notification.description}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => updateNotification(notification.id, { enabled: !notification.enabled })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notification.enabled
                                                        ? 'bg-gradient-to-r from-pink-500 to-red-500'
                                                        : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notification.enabled ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        {notification.enabled && (
                                            <div className="ml-11">
                                                <p className="text-sm text-gray-600 mb-2">Delivery methods:</p>
                                                <div className="flex space-x-3">
                                                    {['push', 'email', 'sms'].map((channel) => (
                                                        <button
                                                            key={channel}
                                                            onClick={() => {
                                                                const newChannels = notification.channels.includes(channel as any)
                                                                    ? notification.channels.filter(c => c !== channel)
                                                                    : [...notification.channels, channel as any]
                                                                updateNotification(notification.id, { channels: newChannels })
                                                            }}
                                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${notification.channels.includes(channel as any)
                                                                    ? 'bg-pink-100 text-pink-700'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            {channel.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Quiet Hours */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Quiet Hours</h2>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Do Not Disturb</h3>
                                    <p className="text-gray-600 text-sm">Silence notifications during specific hours</p>
                                </div>
                                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Match Preferences Tab */}
                {activeTab === 'matching' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Matching Preferences */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Matching Preferences</h2>

                            <div className="space-y-8">
                                {matchPreferences.map((preference, index) => (
                                    <motion.div
                                        key={preference.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">{preference.title}</h3>
                                            <p className="text-gray-600 text-sm">{preference.description}</p>
                                        </div>

                                        <div className="ml-6">
                                            {renderMatchPreferenceControl(preference)}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
                                <span className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    Premium
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Lifestyle Preferences</h3>
                                        <div className="space-y-2">
                                            {['Non-smoker', 'Social drinker', 'Fitness enthusiast', 'Pet lover'].map((lifestyle) => (
                                                <label key={lifestyle} className="flex items-center space-x-2">
                                                    <input type="checkbox" className="rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                                                    <span className="text-sm text-gray-700">{lifestyle}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Deal Breakers</h3>
                                        <div className="space-y-2">
                                            {['Smoking', 'No children', 'Different religion', 'Long distance'].map((dealbreaker) => (
                                                <label key={dealbreaker} className="flex items-center space-x-2">
                                                    <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                                                    <span className="text-sm text-gray-700">{dealbreaker}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Theme Settings */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Theme & Display</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Color Theme</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'light', name: 'Light', icon: <Sun className="w-6 h-6" />, colors: 'bg-white border-gray-300' },
                                            { id: 'dark', name: 'Dark', icon: <Moon className="w-6 h-6" />, colors: 'bg-gray-900 border-gray-700' },
                                            { id: 'auto', name: 'Auto', icon: <Monitor className="w-6 h-6" />, colors: 'bg-gradient-to-r from-white to-gray-900 border-gray-400' }
                                        ].map((theme) => (
                                            <button
                                                key={theme.id}
                                                className={`p-4 border-2 rounded-lg transition-all duration-200 ${theme.colors} hover:border-pink-400`}
                                            >
                                                <div className="text-center">
                                                    <div className="flex justify-center mb-2 text-gray-600">
                                                        {theme.icon}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{theme.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Accent Color</h3>
                                    <div className="flex space-x-3">
                                        {[
                                            'bg-pink-500',
                                            'bg-red-500',
                                            'bg-purple-500',
                                            'bg-blue-500',
                                            'bg-green-500',
                                            'bg-yellow-500'
                                        ].map((color) => (
                                            <button
                                                key={color}
                                                className={`w-10 h-10 rounded-full ${color} border-2 border-white shadow-lg hover:scale-110 transition-transform`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Display Preferences */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Display Preferences</h2>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Large Text</h3>
                                        <p className="text-gray-600 text-sm">Increase text size for better readability</p>
                                    </div>
                                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Reduce Motion</h3>
                                        <p className="text-gray-600 text-sm">Minimize animations and transitions</p>
                                    </div>
                                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">High Contrast</h3>
                                        <p className="text-gray-600 text-sm">Increase contrast for better visibility</p>
                                    </div>
                                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Save Confirmation Dialog */}
                <AnimatePresence>
                    {showConfirmDialog && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-xl p-6 max-w-md w-full"
                            >
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-pink-100 rounded-lg">
                                        <Save className="w-6 h-6 text-pink-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Save Changes?</h3>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    You have unsaved changes. Would you like to save them now?
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowConfirmDialog(false)}
                                        className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveAllSettings}
                                        className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 font-medium"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-12 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Settings className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Personalized Experience</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Customize every aspect of your dating journey with advanced preferences
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Explore Features
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Heart className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Smart Matching</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                AI-powered algorithms learn from your preferences to find perfect matches
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Update Preferences
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Shield className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Privacy Control</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Complete control over your data and privacy with granular settings
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Privacy Settings
                            </button>
                        </motion.div>
                    </div>

                    <div className="text-center mt-8 pt-8 border-t border-white/20">
                        <p className="text-pink-100">
                            © 2025 CurtAI - Your Perfect Dating Experience, Fully Customized. Part of the CODAI Ecosystem.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default CurtAISettingsPage
