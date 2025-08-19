'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    // Navigation and Action Icons
    ArrowLeft,
    ArrowRight,
    Save,
    RefreshCw,
    Upload,
    Download,
    ExternalLink,
    Edit3,

    // User and Profile Icons
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Camera,
    Shield,
    Key,

    // Settings Categories Icons
    Settings,
    Bell,
    Heart,
    Dog,
    Cat,
    Home,
    CreditCard,
    Globe,

    // Privacy and Security Icons
    Lock,
    Eye,
    EyeOff,
    Fingerprint,
    Smartphone,
    Database,

    // Notification Icons
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Mail as MailIcon,
    PhoneCall,

    // Preference Icons
    Palette,
    Moon,
    Sun,
    Volume2,
    VolumeX,
    Languages,
    Accessibility,

    // Data and Privacy Icons
    FileText,
    Trash2,
    Archive,
    Share2,
    Clipboard,

    // Support Icons
    HelpCircle,
    MessageCircle,
    Headphones,
    Bug,

    // Status Icons
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Zap,

    // Advanced Icons
    Sliders,
    Code,
    Server,
    Wifi,
    Monitor
} from 'lucide-react'

// Settings Interfaces
interface UserProfile {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: {
        street: string
        city: string
        county: string
        postalCode: string
        country: string
    }
    dateOfBirth: Date
    avatar: string
    verified: boolean
    joinDate: Date
    membershipType: 'basic' | 'premium' | 'volunteer' | 'shelter'
}

interface NotificationSettings {
    email: {
        newMatches: boolean
        applicationUpdates: boolean
        petUpdates: boolean
        eventReminders: boolean
        newsletter: boolean
        marketing: boolean
    }
    sms: {
        urgentUpdates: boolean
        appointmentReminders: boolean
        emergencyAlerts: boolean
    }
    push: {
        newMessages: boolean
        petActivities: boolean
        communityUpdates: boolean
        systemNotifications: boolean
    }
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
}

interface AdoptionPreferences {
    petTypes: Array<'dog' | 'cat' | 'other'>
    agePreferences: Array<'puppy' | 'kitten' | 'young' | 'adult' | 'senior'>
    sizePreferences: Array<'small' | 'medium' | 'large' | 'extra-large'>
    energyLevel: Array<'low' | 'moderate' | 'high' | 'very-high'>
    experienceLevel: 'first-time' | 'some-experience' | 'experienced' | 'expert'
    specialNeeds: boolean
    maxTravelDistance: number
    budgetRange: {
        min: number
        max: number
    }
    livingSpace: 'apartment' | 'house-small-yard' | 'house-large-yard' | 'farm'
    familyComposition: {
        adults: number
        children: number
        childrenAges: number[]
        otherPets: number
    }
}

interface PrivacySettings {
    profileVisibility: 'public' | 'adopters-only' | 'private'
    sharePersonalInfo: boolean
    allowDirectMessages: boolean
    showOnlineStatus: boolean
    shareAdoptionHistory: boolean
    allowReviews: boolean
    twoFactorAuth: boolean
    loginNotifications: boolean
    dataRetention: 'minimal' | 'standard' | 'extended'
}

interface AppearanceSettings {
    theme: 'light' | 'dark' | 'system'
    colorScheme: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
    fontSize: 'small' | 'medium' | 'large'
    reducedMotion: boolean
    highContrast: boolean
    language: string
    currency: string
    dateFormat: string
    timeFormat: '12h' | '24h'
}

export default function SettingsPage() {
    // State Management
    const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'preferences' | 'privacy' | 'appearance' | 'account' | 'support'>('profile')
    const [isEditing, setIsEditing] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [showExportData, setShowExportData] = useState(false)

    // Sample User Profile
    const [userProfile, setUserProfile] = useState<UserProfile>({
        id: 'user-123',
        firstName: 'Maria',
        lastName: 'Popescu',
        email: 'maria.popescu@email.com',
        phone: '+40 721 123 456',
        address: {
            street: 'Str. Florilor, nr. 25',
            city: 'București',
            county: 'București',
            postalCode: '012345',
            country: 'România'
        },
        dateOfBirth: new Date('1985-06-15'),
        avatar: '/placeholder-user-avatar.jpg',
        verified: true,
        joinDate: new Date('2024-01-15'),
        membershipType: 'premium'
    })

    // Sample Notification Settings
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        email: {
            newMatches: true,
            applicationUpdates: true,
            petUpdates: true,
            eventReminders: true,
            newsletter: false,
            marketing: false
        },
        sms: {
            urgentUpdates: true,
            appointmentReminders: true,
            emergencyAlerts: true
        },
        push: {
            newMessages: true,
            petActivities: true,
            communityUpdates: false,
            systemNotifications: true
        },
        frequency: 'immediate'
    })

    // Sample Adoption Preferences
    const [adoptionPreferences, setAdoptionPreferences] = useState<AdoptionPreferences>({
        petTypes: ['dog'],
        agePreferences: ['puppy', 'young', 'adult'],
        sizePreferences: ['medium', 'large'],
        energyLevel: ['moderate', 'high'],
        experienceLevel: 'some-experience',
        specialNeeds: false,
        maxTravelDistance: 50,
        budgetRange: {
            min: 500,
            max: 2000
        },
        livingSpace: 'house-large-yard',
        familyComposition: {
            adults: 2,
            children: 1,
            childrenAges: [8],
            otherPets: 0
        }
    })

    // Sample Privacy Settings
    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
        profileVisibility: 'adopters-only',
        sharePersonalInfo: false,
        allowDirectMessages: true,
        showOnlineStatus: true,
        shareAdoptionHistory: true,
        allowReviews: true,
        twoFactorAuth: true,
        loginNotifications: true,
        dataRetention: 'standard'
    })

    // Sample Appearance Settings
    const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
        theme: 'system',
        colorScheme: 'blue',
        fontSize: 'medium',
        reducedMotion: false,
        highContrast: false,
        language: 'ro',
        currency: 'RON',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
    })

    // Settings Sections
    const settingsSections = [
        {
            id: 'profile',
            name: 'Profile',
            description: 'Personal information and account details',
            icon: User,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            id: 'notifications',
            name: 'Notifications',
            description: 'Email, SMS, and push notification preferences',
            icon: Bell,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        },
        {
            id: 'preferences',
            name: 'Adoption Preferences',
            description: 'Pet matching and adoption criteria',
            icon: Heart,
            color: 'text-red-600',
            bgColor: 'bg-red-100'
        },
        {
            id: 'privacy',
            name: 'Privacy & Security',
            description: 'Data protection and account security',
            icon: Shield,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            id: 'appearance',
            name: 'Appearance',
            description: 'Theme, language, and accessibility settings',
            icon: Palette,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            id: 'account',
            name: 'Account Management',
            description: 'Subscription, data export, and account deletion',
            icon: Settings,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100'
        },
        {
            id: 'support',
            name: 'Help & Support',
            description: 'Contact support, report issues, and feedback',
            icon: HelpCircle,
            color: 'text-teal-600',
            bgColor: 'bg-teal-100'
        }
    ]

    // Handle section navigation
    const handleSectionChange = (sectionId: string) => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to leave this section?')) {
                setActiveSection(sectionId as any)
                setHasUnsavedChanges(false)
                setIsEditing(false)
            }
        } else {
            setActiveSection(sectionId as any)
        }
    }

    // Save changes
    const handleSaveChanges = () => {
        // Simulate API call
        setTimeout(() => {
            setHasUnsavedChanges(false)
            setIsEditing(false)
            // Show success message
        }, 1000)
    }

    // Get membership badge color
    const getMembershipColor = (type: string) => {
        switch (type) {
            case 'premium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'volunteer': return 'bg-green-100 text-green-800 border-green-200'
            case 'shelter': return 'bg-purple-100 text-purple-800 border-purple-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Settings</h1>
                            <p className="text-blue-100 text-lg">Manage your account and adoption preferences</p>
                        </div>
                        <div className="text-right">
                            <div className={`inline-block px-3 py-1 rounded-full border text-sm font-medium ${getMembershipColor(userProfile.membershipType)}`}>
                                {userProfile.membershipType} Member
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Settings Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Settings</h2>
                            <nav className="space-y-2">
                                {settingsSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => handleSectionChange(section.id)}
                                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${activeSection === section.id
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 ${section.bgColor} rounded-lg flex items-center justify-center`}>
                                            <section.icon className={`h-4 w-4 ${section.color}`} />
                                        </div>
                                        <div>
                                            <div className="font-medium">{section.name}</div>
                                            <div className="text-xs text-gray-500">{section.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <AnimatePresence mode="wait">
                                {/* Profile Settings */}
                                {activeSection === 'profile' && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-8"
                                    >
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                                                <p className="text-gray-600">Update your personal information and contact details</p>
                                            </div>
                                            <button
                                                onClick={() => setIsEditing(!isEditing)}
                                                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                                            </button>
                                        </div>

                                        {/* Profile Photo */}
                                        <div className="flex items-center space-x-6 mb-8">
                                            <div className="relative">
                                                <img
                                                    src={userProfile.avatar}
                                                    alt="Profile"
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                                />
                                                {isEditing && (
                                                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                                        <Camera className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {userProfile.firstName} {userProfile.lastName}
                                                </h3>
                                                <p className="text-gray-600">{userProfile.email}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    {userProfile.verified && (
                                                        <div className="flex items-center space-x-1 text-green-600">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            <span className="text-sm">Verified Account</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Profile Form */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                                <input
                                                    type="text"
                                                    value={userProfile.firstName}
                                                    disabled={!isEditing}
                                                    onChange={(e) => {
                                                        setUserProfile(prev => ({ ...prev, firstName: e.target.value }))
                                                        setHasUnsavedChanges(true)
                                                    }}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={userProfile.lastName}
                                                    disabled={!isEditing}
                                                    onChange={(e) => {
                                                        setUserProfile(prev => ({ ...prev, lastName: e.target.value }))
                                                        setHasUnsavedChanges(true)
                                                    }}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    value={userProfile.email}
                                                    disabled={!isEditing}
                                                    onChange={(e) => {
                                                        setUserProfile(prev => ({ ...prev, email: e.target.value }))
                                                        setHasUnsavedChanges(true)
                                                    }}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={userProfile.phone}
                                                    disabled={!isEditing}
                                                    onChange={(e) => {
                                                        setUserProfile(prev => ({ ...prev, phone: e.target.value }))
                                                        setHasUnsavedChanges(true)
                                                    }}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                                <input
                                                    type="text"
                                                    value={userProfile.address.street}
                                                    disabled={!isEditing}
                                                    onChange={(e) => {
                                                        setUserProfile(prev => ({
                                                            ...prev,
                                                            address: { ...prev.address, street: e.target.value }
                                                        }))
                                                        setHasUnsavedChanges(true)
                                                    }}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                                <input
                                                    type="text"
                                                    value={userProfile.address.city}
                                                    disabled={!isEditing}
                                                    onChange={(e) => {
                                                        setUserProfile(prev => ({
                                                            ...prev,
                                                            address: { ...prev.address, city: e.target.value }
                                                        }))
                                                        setHasUnsavedChanges(true)
                                                    }}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                                                <input
                                                    type="text"
                                                    value={userProfile.address.county}
                                                    disabled={!isEditing}
                                                    onChange={(e) => {
                                                        setUserProfile(prev => ({
                                                            ...prev,
                                                            address: { ...prev.address, county: e.target.value }
                                                        }))
                                                        setHasUnsavedChanges(true)
                                                    }}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                                />
                                            </div>
                                        </div>

                                        {/* Account Information */}
                                        <div className="mt-8 pt-8 border-t border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex items-center space-x-3">
                                                    <Calendar className="h-5 w-5 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Member Since</p>
                                                        <p className="text-gray-600">{userProfile.joinDate.toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Shield className="h-5 w-5 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Account Status</p>
                                                        <p className="text-green-600">Verified & Active</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {hasUnsavedChanges && (
                                            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                                        <span className="text-yellow-800">You have unsaved changes</span>
                                                    </div>
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => {
                                                                setHasUnsavedChanges(false)
                                                                setIsEditing(false)
                                                                // Reset form data
                                                            }}
                                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                                        >
                                                            Discard
                                                        </button>
                                                        <button
                                                            onClick={handleSaveChanges}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                        >
                                                            Save Changes
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Notification Settings */}
                                {activeSection === 'notifications' && (
                                    <motion.div
                                        key="notifications"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-8"
                                    >
                                        <div className="mb-8">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
                                            <p className="text-gray-600">Choose how you want to receive updates and notifications</p>
                                        </div>

                                        {/* Email Notifications */}
                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                                <MailIcon className="h-5 w-5 text-blue-600" />
                                                <span>Email Notifications</span>
                                            </h3>
                                            <div className="space-y-4">
                                                {Object.entries(notificationSettings.email).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {key === 'newMatches' && 'Get notified when new pets match your preferences'}
                                                                {key === 'applicationUpdates' && 'Updates on your adoption applications'}
                                                                {key === 'petUpdates' && 'News about pets you\'re interested in'}
                                                                {key === 'eventReminders' && 'Upcoming adoption events and appointments'}
                                                                {key === 'newsletter' && 'Monthly newsletter with adoption tips'}
                                                                {key === 'marketing' && 'Special offers and promotional content'}
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={value}
                                                                onChange={(e) => {
                                                                    setNotificationSettings(prev => ({
                                                                        ...prev,
                                                                        email: { ...prev.email, [key]: e.target.checked }
                                                                    }))
                                                                    setHasUnsavedChanges(true)
                                                                }}
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* SMS Notifications */}
                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                                <PhoneCall className="h-5 w-5 text-green-600" />
                                                <span>SMS Notifications</span>
                                            </h3>
                                            <div className="space-y-4">
                                                {Object.entries(notificationSettings.sms).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {key === 'urgentUpdates' && 'Critical updates requiring immediate attention'}
                                                                {key === 'appointmentReminders' && 'Reminders for scheduled appointments'}
                                                                {key === 'emergencyAlerts' && 'Emergency notifications for your pets'}
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={value}
                                                                onChange={(e) => {
                                                                    setNotificationSettings(prev => ({
                                                                        ...prev,
                                                                        sms: { ...prev.sms, [key]: e.target.checked }
                                                                    }))
                                                                    setHasUnsavedChanges(true)
                                                                }}
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notification Frequency */}
                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Frequency</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                {['immediate', 'daily', 'weekly', 'monthly'].map((frequency) => (
                                                    <label key={frequency} className="relative">
                                                        <input
                                                            type="radio"
                                                            name="frequency"
                                                            value={frequency}
                                                            checked={notificationSettings.frequency === frequency}
                                                            onChange={(e) => {
                                                                setNotificationSettings(prev => ({
                                                                    ...prev,
                                                                    frequency: e.target.value as any
                                                                }))
                                                                setHasUnsavedChanges(true)
                                                            }}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700">
                                                            <div className="text-center">
                                                                <div className="font-medium capitalize">{frequency}</div>
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    {frequency === 'immediate' && 'As they happen'}
                                                                    {frequency === 'daily' && 'Once per day'}
                                                                    {frequency === 'weekly' && 'Weekly digest'}
                                                                    {frequency === 'monthly' && 'Monthly summary'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {hasUnsavedChanges && (
                                            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                                        <span className="text-yellow-800">You have unsaved changes</span>
                                                    </div>
                                                    <button
                                                        onClick={handleSaveChanges}
                                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Other sections would go here with similar structure */}
                                {activeSection === 'preferences' && (
                                    <motion.div
                                        key="preferences"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-8"
                                    >
                                        <div className="text-center py-12">
                                            <Heart className="h-16 w-16 text-red-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Adoption Preferences</h3>
                                            <p className="text-gray-600">Configure your pet matching preferences and adoption criteria</p>
                                            <button className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                                Configure Preferences
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'privacy' && (
                                    <motion.div
                                        key="privacy"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-8"
                                    >
                                        <div className="text-center py-12">
                                            <Shield className="h-16 w-16 text-green-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy & Security</h3>
                                            <p className="text-gray-600">Manage your privacy settings and account security</p>
                                            <button className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                                Manage Privacy
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'appearance' && (
                                    <motion.div
                                        key="appearance"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-8"
                                    >
                                        <div className="text-center py-12">
                                            <Palette className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Appearance Settings</h3>
                                            <p className="text-gray-600">Customize theme, language, and accessibility options</p>
                                            <button className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                                                Customize Appearance
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'account' && (
                                    <motion.div
                                        key="account"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-8"
                                    >
                                        <div className="text-center py-12">
                                            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Account Management</h3>
                                            <p className="text-gray-600">Export data, manage subscription, or delete account</p>
                                            <div className="flex justify-center space-x-4 mt-6">
                                                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                                    Export Data
                                                </button>
                                                <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'support' && (
                                    <motion.div
                                        key="support"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-8"
                                    >
                                        <div className="text-center py-12">
                                            <HelpCircle className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Help & Support</h3>
                                            <p className="text-gray-600">Contact support, report issues, or provide feedback</p>
                                            <div className="flex justify-center space-x-4 mt-6">
                                                <button className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                                                    Contact Support
                                                </button>
                                                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                                    Report Issue
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
