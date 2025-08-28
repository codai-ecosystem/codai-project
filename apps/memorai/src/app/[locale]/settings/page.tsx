'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings,
    User,
    Shield,
    Bell,
    Database,
    Zap,
    Globe,
    Palette,
    Key,
    Download,
    Upload,
    RefreshCw,
    Trash2,
    Save,
    X,
    Check,
    AlertTriangle,
    Info,
    Eye,
    EyeOff,
    Clock,
    Calendar,
    Users,
    HardDrive,
    Server,
    Activity,
    BarChart3,
    FileText,
    Code,
    Link,
    Webhook,
    Mail,
    MessageSquare,
    Smartphone,
    Monitor,
    Moon,
    Sun,
    Volume2,
    VolumeX,
    Lock,
    Unlock,
    Edit,
    Plus,
    Minus,
    ChevronRight,
    ChevronDown,
    MoreVertical,
    ExternalLink,
    Copy,
    Archive,
    LogOut
} from 'lucide-react';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    timezone: string;
    language: string;
    joinedAt: string;
    lastLogin: string;
}

interface SystemSettings {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    compactMode: boolean;
    animations: boolean;
    soundEnabled: boolean;
    autoSave: boolean;
    autoSaveInterval: number;
}

interface PrivacySettings {
    profileVisibility: 'public' | 'private' | 'team';
    searchableProfile: boolean;
    shareUsageData: boolean;
    trackingEnabled: boolean;
    cookiesEnabled: boolean;
    dataRetention: number;
    exportEnabled: boolean;
    deleteAccountEnabled: boolean;
}

interface NotificationSettings {
    email: boolean;
    push: boolean;
    desktop: boolean;
    mobile: boolean;
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
    types: {
        memoryCreated: boolean;
        collectionShared: boolean;
        searchResults: boolean;
        systemUpdates: boolean;
        securityAlerts: boolean;
        weeklyDigest: boolean;
    };
}

interface SecuritySettings {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
    passwordLastChanged: string;
    activeSessions: number;
    trustedDevices: number;
    apiKeyCount: number;
    webhookCount: number;
}

interface StorageSettings {
    totalStorage: number;
    usedStorage: number;
    autoCleanup: boolean;
    cleanupInterval: number;
    compressionEnabled: boolean;
    backupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionPeriod: number;
}

interface IntegrationSettings {
    activeIntegrations: number;
    totalIntegrations: number;
    syncEnabled: boolean;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    conflictResolution: 'manual' | 'auto';
    webhooksEnabled: boolean;
    apiEnabled: boolean;
}

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Mock user data - in real app would come from API
    const [userProfile, setUserProfile] = useState<UserProfile>({
        id: '1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        avatar: '/avatars/john-doe.jpg',
        role: 'Premium User',
        timezone: 'America/New_York',
        language: 'en',
        joinedAt: '2024-01-01T00:00:00Z',
        lastLogin: '2024-01-16T09:15:00Z'
    });

    const [systemSettings, setSystemSettings] = useState<SystemSettings>({
        theme: 'system',
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h',
        compactMode: false,
        animations: true,
        soundEnabled: true,
        autoSave: true,
        autoSaveInterval: 30
    });

    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
        profileVisibility: 'team',
        searchableProfile: true,
        shareUsageData: false,
        trackingEnabled: false,
        cookiesEnabled: true,
        dataRetention: 365,
        exportEnabled: true,
        deleteAccountEnabled: true
    });

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        email: true,
        push: true,
        desktop: false,
        mobile: true,
        quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
        },
        types: {
            memoryCreated: true,
            collectionShared: true,
            searchResults: false,
            systemUpdates: true,
            securityAlerts: true,
            weeklyDigest: true
        }
    });

    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        twoFactorEnabled: false,
        sessionTimeout: 24,
        loginNotifications: true,
        passwordLastChanged: '2024-01-01T00:00:00Z',
        activeSessions: 3,
        trustedDevices: 5,
        apiKeyCount: 2,
        webhookCount: 3
    });

    const [storageSettings, setStorageSettings] = useState<StorageSettings>({
        totalStorage: 10240, // MB
        usedStorage: 2456,
        autoCleanup: true,
        cleanupInterval: 30,
        compressionEnabled: true,
        backupEnabled: true,
        backupFrequency: 'weekly',
        retentionPeriod: 90
    });

    const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
        activeIntegrations: 8,
        totalIntegrations: 12,
        syncEnabled: true,
        syncFrequency: 'hourly',
        conflictResolution: 'manual',
        webhooksEnabled: true,
        apiEnabled: true
    });

    const settingsSections = [
        { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        { id: 'system', label: 'System', icon: <Settings className="w-4 h-4" /> },
        { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
        { id: 'storage', label: 'Storage', icon: <HardDrive className="w-4 h-4" /> },
        { id: 'integrations', label: 'Integrations', icon: <Globe className="w-4 h-4" /> }
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const saveSettings = async () => {
        setIsLoading(true);
        try {
            // Simulate API call to save settings
            await new Promise(resolve => setTimeout(resolve, 1000));
            setHasChanges(false);
            // Show success message
        } catch (error) {
            console.error('Failed to save settings:', error);
            // Show error message
        } finally {
            setIsLoading(false);
        }
    };

    const exportData = async () => {
        setIsLoading(true);
        try {
            // Simulate data export
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Trigger download
        } catch (error) {
            console.error('Failed to export data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteAccount = async () => {
        setIsLoading(true);
        try {
            // Simulate account deletion
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Redirect to goodbye page
        } catch (error) {
            console.error('Failed to delete account:', error);
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">
                        Manage your account, privacy, security, and system preferences
                    </p>
                </div>

                {hasChanges && (
                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-amber-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Unsaved changes
                        </span>
                        <button
                            onClick={saveSettings}
                            disabled={isLoading}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Settings Navigation */}
                <div className="lg:w-64 space-y-1">
                    <nav className="space-y-1">
                        {settingsSections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg ${activeSection === section.id
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {section.icon}
                                <span className="font-medium">{section.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1 space-y-6">
                    {/* Profile Settings */}
                    {activeSection === 'profile' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={userProfile.name}
                                            onChange={(e) => {
                                                setUserProfile(prev => ({ ...prev, name: e.target.value }));
                                                setHasChanges(true);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={userProfile.email}
                                            onChange={(e) => {
                                                setUserProfile(prev => ({ ...prev, email: e.target.value }));
                                                setHasChanges(true);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                        <select
                                            value={userProfile.timezone}
                                            onChange={(e) => {
                                                setUserProfile(prev => ({ ...prev, timezone: e.target.value }));
                                                setHasChanges(true);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="America/New_York">Eastern Time</option>
                                            <option value="America/Chicago">Central Time</option>
                                            <option value="America/Denver">Mountain Time</option>
                                            <option value="America/Los_Angeles">Pacific Time</option>
                                            <option value="Europe/London">London</option>
                                            <option value="Europe/Berlin">Berlin</option>
                                            <option value="Asia/Tokyo">Tokyo</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                        <select
                                            value={userProfile.language}
                                            onChange={(e) => {
                                                setUserProfile(prev => ({ ...prev, language: e.target.value }));
                                                setHasChanges(true);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                            <option value="ja">Japanese</option>
                                            <option value="ko">Korean</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>Member since: {formatDate(userProfile.joinedAt)}</span>
                                        <span>Last login: {formatDate(userProfile.lastLogin)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* System Settings */}
                    {activeSection === 'system' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">System Preferences</h2>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                                            <select
                                                value={systemSettings.theme}
                                                onChange={(e) => {
                                                    setSystemSettings(prev => ({ ...prev, theme: e.target.value as any }));
                                                    setHasChanges(true);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="light">Light</option>
                                                <option value="dark">Dark</option>
                                                <option value="system">System</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                                            <select
                                                value={systemSettings.timeFormat}
                                                onChange={(e) => {
                                                    setSystemSettings(prev => ({ ...prev, timeFormat: e.target.value as any }));
                                                    setHasChanges(true);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="12h">12 Hour</option>
                                                <option value="24h">24 Hour</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Compact Mode</h3>
                                                <p className="text-sm text-gray-600">Reduce spacing and use smaller interface elements</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={systemSettings.compactMode}
                                                    onChange={(e) => {
                                                        setSystemSettings(prev => ({ ...prev, compactMode: e.target.checked }));
                                                        setHasChanges(true);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Animations</h3>
                                                <p className="text-sm text-gray-600">Enable smooth transitions and animations</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={systemSettings.animations}
                                                    onChange={(e) => {
                                                        setSystemSettings(prev => ({ ...prev, animations: e.target.checked }));
                                                        setHasChanges(true);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Auto Save</h3>
                                                <p className="text-sm text-gray-600">Automatically save changes every {systemSettings.autoSaveInterval} seconds</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={systemSettings.autoSave}
                                                    onChange={(e) => {
                                                        setSystemSettings(prev => ({ ...prev, autoSave: e.target.checked }));
                                                        setHasChanges(true);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Privacy Settings */}
                    {activeSection === 'privacy' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy & Data</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                                        <select
                                            value={privacySettings.profileVisibility}
                                            onChange={(e) => {
                                                setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as any }));
                                                setHasChanges(true);
                                            }}
                                            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="public">Public</option>
                                            <option value="team">Team Only</option>
                                            <option value="private">Private</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'searchableProfile', label: 'Searchable Profile', desc: 'Allow others to find your profile in search' },
                                            { key: 'shareUsageData', label: 'Share Usage Data', desc: 'Help improve MemorAI by sharing anonymous usage data' },
                                            { key: 'trackingEnabled', label: 'Analytics Tracking', desc: 'Allow tracking for analytics and personalization' },
                                            { key: 'cookiesEnabled', label: 'Cookies', desc: 'Enable cookies for better user experience' }
                                        ].map((setting) => (
                                            <div key={setting.key} className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">{setting.label}</h3>
                                                    <p className="text-sm text-gray-600">{setting.desc}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={privacySettings[setting.key as keyof PrivacySettings] as boolean}
                                                        onChange={(e) => {
                                                            setPrivacySettings(prev => ({ ...prev, [setting.key]: e.target.checked }));
                                                            setHasChanges(true);
                                                        }}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Data Management */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h2>

                                <div className="space-y-4">
                                    <button
                                        onClick={exportData}
                                        disabled={isLoading}
                                        className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        {isLoading ? 'Exporting...' : 'Export My Data'}
                                    </button>

                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeSection === 'notifications' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {[
                                            { key: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
                                            { key: 'push', label: 'Push', icon: <Bell className="w-4 h-4" /> },
                                            { key: 'desktop', label: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
                                            { key: 'mobile', label: 'Mobile', icon: <Smartphone className="w-4 h-4" /> }
                                        ].map((channel) => (
                                            <div key={channel.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    {channel.icon}
                                                    <span className="text-sm font-medium text-gray-900">{channel.label}</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings[channel.key as keyof NotificationSettings] as boolean}
                                                        onChange={(e) => {
                                                            setNotificationSettings(prev => ({ ...prev, [channel.key]: e.target.checked }));
                                                            setHasChanges(true);
                                                        }}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Quiet Hours */}
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Quiet Hours</h3>
                                                <p className="text-sm text-gray-600">Pause notifications during these hours</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.quietHours.enabled}
                                                    onChange={(e) => {
                                                        setNotificationSettings(prev => ({
                                                            ...prev,
                                                            quietHours: { ...prev.quietHours, enabled: e.target.checked }
                                                        }));
                                                        setHasChanges(true);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        {notificationSettings.quietHours.enabled && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={notificationSettings.quietHours.start}
                                                        onChange={(e) => {
                                                            setNotificationSettings(prev => ({
                                                                ...prev,
                                                                quietHours: { ...prev.quietHours, start: e.target.value }
                                                            }));
                                                            setHasChanges(true);
                                                        }}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={notificationSettings.quietHours.end}
                                                        onChange={(e) => {
                                                            setNotificationSettings(prev => ({
                                                                ...prev,
                                                                quietHours: { ...prev.quietHours, end: e.target.value }
                                                            }));
                                                            setHasChanges(true);
                                                        }}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notification Types */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-4">Notification Types</h3>
                                        <div className="space-y-3">
                                            {Object.entries(notificationSettings.types).map(([key, enabled]) => (
                                                <div key={key} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={enabled}
                                                            onChange={(e) => {
                                                                setNotificationSettings(prev => ({
                                                                    ...prev,
                                                                    types: { ...prev.types, [key]: e.target.checked }
                                                                }));
                                                                setHasChanges(true);
                                                            }}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeSection === 'security' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900">{securitySettings.activeSessions}</div>
                                            <div className="text-sm text-gray-600">Active Sessions</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900">{securitySettings.trustedDevices}</div>
                                            <div className="text-sm text-gray-600">Trusted Devices</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900">{securitySettings.apiKeyCount}</div>
                                            <div className="text-sm text-gray-600">API Keys</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900">{securitySettings.webhookCount}</div>
                                            <div className="text-sm text-gray-600">Webhooks</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                                                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`text-xs font-medium ${securitySettings.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                                <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                                                    {securitySettings.twoFactorEnabled ? 'Manage' : 'Enable'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Login Notifications</h3>
                                                <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={securitySettings.loginNotifications}
                                                    onChange={(e) => {
                                                        setSecuritySettings(prev => ({ ...prev, loginNotifications: e.target.checked }));
                                                        setHasChanges(true);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Session Timeout</h3>
                                                <p className="text-sm text-gray-600">Automatically sign out after {securitySettings.sessionTimeout} hours of inactivity</p>
                                            </div>
                                            <select
                                                value={securitySettings.sessionTimeout}
                                                onChange={(e) => {
                                                    setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }));
                                                    setHasChanges(true);
                                                }}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value={1}>1 hour</option>
                                                <option value={4}>4 hours</option>
                                                <option value={8}>8 hours</option>
                                                <option value={24}>24 hours</option>
                                                <option value={168}>1 week</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Password</h3>
                                                <p className="text-sm text-gray-600">Last changed {formatDate(securitySettings.passwordLastChanged)}</p>
                                            </div>
                                            <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Storage Settings */}
                    {activeSection === 'storage' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Storage Management</h2>

                                <div className="space-y-6">
                                    {/* Storage Usage */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-gray-900">Storage Usage</h3>
                                            <span className="text-sm text-gray-600">
                                                {formatFileSize(storageSettings.usedStorage * 1024 * 1024)} of {formatFileSize(storageSettings.totalStorage * 1024 * 1024)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${(storageSettings.usedStorage / storageSettings.totalStorage) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {((storageSettings.usedStorage / storageSettings.totalStorage) * 100).toFixed(1)}% used
                                        </p>
                                    </div>

                                    {/* Storage Settings */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Auto Cleanup</h3>
                                                <p className="text-sm text-gray-600">Automatically remove old temporary files every {storageSettings.cleanupInterval} days</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={storageSettings.autoCleanup}
                                                    onChange={(e) => {
                                                        setStorageSettings(prev => ({ ...prev, autoCleanup: e.target.checked }));
                                                        setHasChanges(true);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Compression</h3>
                                                <p className="text-sm text-gray-600">Compress files to save storage space</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={storageSettings.compressionEnabled}
                                                    onChange={(e) => {
                                                        setStorageSettings(prev => ({ ...prev, compressionEnabled: e.target.checked }));
                                                        setHasChanges(true);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Automatic Backup</h3>
                                                <p className="text-sm text-gray-600">Create {storageSettings.backupFrequency} backups of your data</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={storageSettings.backupFrequency}
                                                    onChange={(e) => {
                                                        setStorageSettings(prev => ({ ...prev, backupFrequency: e.target.value as any }));
                                                        setHasChanges(true);
                                                    }}
                                                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                </select>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={storageSettings.backupEnabled}
                                                        onChange={(e) => {
                                                            setStorageSettings(prev => ({ ...prev, backupEnabled: e.target.checked }));
                                                            setHasChanges(true);
                                                        }}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Integration Settings */}
                    {activeSection === 'integrations' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Integration Settings</h2>

                                <div className="space-y-6">
                                    {/* Integration Overview */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900">{integrationSettings.activeIntegrations}</div>
                                            <div className="text-sm text-gray-600">Active Integrations</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900">{integrationSettings.totalIntegrations}</div>
                                            <div className="text-sm text-gray-600">Total Available</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {integrationSettings.syncEnabled ? 'ON' : 'OFF'}
                                            </div>
                                            <div className="text-sm text-gray-600">Sync Status</div>
                                        </div>
                                    </div>

                                    {/* Integration Settings */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Enable Sync</h3>
                                                <p className="text-sm text-gray-600">Allow data synchronization with connected services</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={integrationSettings.syncEnabled}
                                                    onChange={(e) => {
                                                        setIntegrationSettings(prev => ({ ...prev, syncEnabled: e.target.checked }));
                                                        setHasChanges(true);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Sync Frequency</h3>
                                                <p className="text-sm text-gray-600">How often to sync data with connected services</p>
                                            </div>
                                            <select
                                                value={integrationSettings.syncFrequency}
                                                onChange={(e) => {
                                                    setIntegrationSettings(prev => ({ ...prev, syncFrequency: e.target.value as any }));
                                                    setHasChanges(true);
                                                }}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="realtime">Real-time</option>
                                                <option value="hourly">Hourly</option>
                                                <option value="daily">Daily</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Webhooks</h3>
                                                <p className="text-sm text-gray-600">Enable webhook notifications for external services</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={integrationSettings.webhooksEnabled}
                                                    onChange={(e) => {
                                                        setIntegrationSettings(prev => ({ ...prev, webhooksEnabled: e.target.checked }));
                                                        setHasChanges(true);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">API Access</h3>
                                                <p className="text-sm text-gray-600">Allow external access via API</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={integrationSettings.apiEnabled}
                                                    onChange={(e) => {
                                                        setIntegrationSettings(prev => ({ ...prev, apiEnabled: e.target.checked }));
                                                        setHasChanges(true);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Manage your integrations and API keys</span>
                                            <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                                                View Integrations
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </p>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteAccount}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
