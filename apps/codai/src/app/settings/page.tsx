'use client';

import React, { useState } from 'react';
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Key,
    Monitor,
    Smartphone,
    Download,
    Upload,
    Save,
    RefreshCw,
    Trash2,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    CheckCircle,
    AlertCircle,
    Info,
    X,
    Plus,
    Edit,
    Search,
    Filter,
    MoreVertical,
    Moon,
    Sun,
    Languages,
    Clock,
    MapPin,
    Mail,
    Phone,
    Link,
    Database,
    Server,
    Cloud,
    Terminal,
    Code,
    Layers,
    Network,
    HardDrive,
    Cpu,
    Activity,
    BarChart3,
    Zap,
    Target,
    Award,
    Bookmark,
    Heart,
    Coffee,
    Tag,
    FileText,
    Archive,
    Package,
    Workflow,
    GitBranch,
    Calendar,
    Users,
    MessageSquare,
    Camera,
    Volume2,
    VolumeX,
    Wifi,
    WifiOff,
    Power,
    RotateCcw,
    ExternalLink,
    Copy,
    Share
} from 'lucide-react';

interface SettingsData {
    general: {
        theme: string;
        language: string;
        timezone: string;
        autoSave: boolean;
        compactMode: boolean;
        animations: boolean;
        soundEffects: boolean;
        betaFeatures: boolean;
    };
    privacy: {
        profileVisibility: string;
        activityTracking: boolean;
        dataCollection: boolean;
        analyticsOptIn: boolean;
        thirdPartyIntegrations: boolean;
        locationSharing: boolean;
    };
    notifications: {
        email: boolean;
        push: boolean;
        desktop: boolean;
        mobile: boolean;
        projectUpdates: boolean;
        teamMentions: boolean;
        securityAlerts: boolean;
        marketingEmails: boolean;
        weeklyDigest: boolean;
        instantMessages: boolean;
    };
    security: {
        twoFactorAuth: boolean;
        sessionTimeout: number;
        passwordExpiry: number;
        loginNotifications: boolean;
        deviceTrust: boolean;
        apiAccess: boolean;
        downloadRestrictions: boolean;
        ipWhitelist: string[];
    };
    editor: {
        fontSize: number;
        fontFamily: string;
        tabSize: number;
        wordWrap: boolean;
        lineNumbers: boolean;
        minimap: boolean;
        autoComplete: boolean;
        formatOnSave: boolean;
        darkMode: boolean;
        syntaxHighlighting: boolean;
    };
    integrations: {
        github: boolean;
        slack: boolean;
        discord: boolean;
        figma: boolean;
        notion: boolean;
        jira: boolean;
        trello: boolean;
        zapier: boolean;
    };
}

export default function SettingsPage() {
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [searchTerm, setSearchTerm] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    const [settings, setSettings] = useState<SettingsData>({
        general: {
            theme: 'dark',
            language: 'en',
            timezone: 'PST',
            autoSave: true,
            compactMode: false,
            animations: true,
            soundEffects: true,
            betaFeatures: false
        },
        privacy: {
            profileVisibility: 'team',
            activityTracking: true,
            dataCollection: false,
            analyticsOptIn: true,
            thirdPartyIntegrations: true,
            locationSharing: false
        },
        notifications: {
            email: true,
            push: true,
            desktop: true,
            mobile: true,
            projectUpdates: true,
            teamMentions: true,
            securityAlerts: true,
            marketingEmails: false,
            weeklyDigest: true,
            instantMessages: true
        },
        security: {
            twoFactorAuth: true,
            sessionTimeout: 30,
            passwordExpiry: 90,
            loginNotifications: true,
            deviceTrust: true,
            apiAccess: false,
            downloadRestrictions: true,
            ipWhitelist: []
        },
        editor: {
            fontSize: 14,
            fontFamily: 'Fira Code',
            tabSize: 2,
            wordWrap: true,
            lineNumbers: true,
            minimap: true,
            autoComplete: true,
            formatOnSave: true,
            darkMode: true,
            syntaxHighlighting: true
        },
        integrations: {
            github: true,
            slack: true,
            discord: false,
            figma: true,
            notion: false,
            jira: true,
            trello: false,
            zapier: false
        }
    });

    const settingsCategories = [
        {
            id: 'general',
            name: 'General',
            icon: Settings,
            description: 'Basic preferences and application settings'
        },
        {
            id: 'privacy',
            name: 'Privacy & Data',
            icon: Shield,
            description: 'Control your privacy and data collection preferences'
        },
        {
            id: 'notifications',
            name: 'Notifications',
            icon: Bell,
            description: 'Manage notification preferences and alerts'
        },
        {
            id: 'security',
            name: 'Security',
            icon: Lock,
            description: 'Security settings and authentication options'
        },
        {
            id: 'editor',
            name: 'Editor',
            icon: Code,
            description: 'Code editor preferences and customization'
        },
        {
            id: 'integrations',
            name: 'Integrations',
            icon: Link,
            description: 'Third-party service integrations and connections'
        }
    ];

    const themes = [
        { id: 'light', name: 'Light', icon: Sun },
        { id: 'dark', name: 'Dark', icon: Moon },
        { id: 'system', name: 'System', icon: Monitor }
    ];

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'pt', name: 'Português', flag: '🇵🇹' }
    ];

    const timezones = [
        'PST (UTC-8)', 'EST (UTC-5)', 'GMT (UTC+0)', 'CET (UTC+1)',
        'IST (UTC+5:30)', 'JST (UTC+9)', 'AEST (UTC+10)', 'NZST (UTC+12)'
    ];

    const fontFamilies = [
        'Fira Code', 'Source Code Pro', 'Monaco', 'Consolas',
        'Ubuntu Mono', 'JetBrains Mono', 'Cascadia Code', 'SF Mono'
    ];

    const updateSetting = (category: keyof SettingsData, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
        setUnsavedChanges(true);
    };

    const handleSaveSettings = () => {
        // Save settings logic here
        setUnsavedChanges(false);
    };

    const handleResetCategory = () => {
        // Reset category logic here
        setShowResetModal(false);
        setUnsavedChanges(true);
    };

    const handleExportSettings = () => {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'codai-settings.json';
        link.click();
        setShowExportModal(false);
    };

    const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    );

    const filteredCategories = settingsCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">
                        Configure your CODAI experience and preferences
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </button>
                    {unsavedChanges && (
                        <button
                            onClick={handleSaveSettings}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </button>
                    )}
                </div>
            </div>

            {/* Unsaved Changes Banner */}
            {unsavedChanges && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                        <div className="flex-1">
                            <p className="text-sm text-yellow-800">
                                You have unsaved changes. Don't forget to save your settings.
                            </p>
                        </div>
                        <button
                            onClick={handleSaveSettings}
                            className="ml-4 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                            Save Now
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-6">
                {/* Settings Sidebar */}
                <div className="w-80 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search settings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Categories */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Settings Categories</h3>
                        </div>
                        <div className="p-2">
                            {filteredCategories.map((category) => {
                                const CategoryIcon = category.icon;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${selectedCategory === category.id
                                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <CategoryIcon className="w-5 h-5 mr-3" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium">{category.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{category.description}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {settingsCategories.find(c => c.id === selectedCategory)?.name}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {settingsCategories.find(c => c.id === selectedCategory)?.description}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowResetModal(true)}
                                    className="flex items-center px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <RotateCcw className="w-4 h-4 mr-1" />
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {selectedCategory === 'general' && (
                                <div className="space-y-6">
                                    {/* Theme Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Theme
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {themes.map((theme) => {
                                                const ThemeIcon = theme.icon;
                                                return (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => updateSetting('general', 'theme', theme.id)}
                                                        className={`flex items-center justify-center p-4 border-2 rounded-lg transition-colors ${settings.general.theme === theme.id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <ThemeIcon className="w-6 h-6 mr-2" />
                                                        <span className="font-medium">{theme.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Language */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Language
                                        </label>
                                        <select
                                            value={settings.general.language}
                                            onChange={(e) => updateSetting('general', 'language', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {languages.map((lang) => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.flag} {lang.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Timezone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Timezone
                                        </label>
                                        <select
                                            value={settings.general.timezone}
                                            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {timezones.map((tz) => (
                                                <option key={tz} value={tz}>{tz}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* General Preferences */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900">General Preferences</h3>

                                        {[
                                            { key: 'autoSave', label: 'Auto-save changes', description: 'Automatically save your work as you type' },
                                            { key: 'compactMode', label: 'Compact mode', description: 'Use a more compact interface layout' },
                                            { key: 'animations', label: 'Enable animations', description: 'Show smooth transitions and animations' },
                                            { key: 'soundEffects', label: 'Sound effects', description: 'Play sounds for notifications and actions' },
                                            { key: 'betaFeatures', label: 'Enable beta features', description: 'Access experimental features (may be unstable)' }
                                        ].map((pref) => (
                                            <div key={pref.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                                <div>
                                                    <div className="font-medium text-gray-900">{pref.label}</div>
                                                    <div className="text-sm text-gray-600">{pref.description}</div>
                                                </div>
                                                <ToggleSwitch
                                                    checked={settings.general[pref.key as keyof typeof settings.general] as boolean}
                                                    onChange={(value) => updateSetting('general', pref.key, value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedCategory === 'privacy' && (
                                <div className="space-y-6">
                                    {/* Profile Visibility */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Profile Visibility
                                        </label>
                                        <select
                                            value={settings.privacy.profileVisibility}
                                            onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="public">Public - Anyone can view</option>
                                            <option value="team">Team Only - Team members can view</option>
                                            <option value="private">Private - Only you can view</option>
                                        </select>
                                    </div>

                                    {/* Privacy Preferences */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900">Privacy & Data Collection</h3>

                                        {[
                                            { key: 'activityTracking', label: 'Activity tracking', description: 'Track your usage patterns to improve experience' },
                                            { key: 'dataCollection', label: 'Data collection', description: 'Allow collection of anonymous usage data' },
                                            { key: 'analyticsOptIn', label: 'Analytics', description: 'Help improve CODAI with usage analytics' },
                                            { key: 'thirdPartyIntegrations', label: 'Third-party integrations', description: 'Allow connections to external services' },
                                            { key: 'locationSharing', label: 'Location sharing', description: 'Share your location for team collaboration' }
                                        ].map((pref) => (
                                            <div key={pref.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                                <div>
                                                    <div className="font-medium text-gray-900">{pref.label}</div>
                                                    <div className="text-sm text-gray-600">{pref.description}</div>
                                                </div>
                                                <ToggleSwitch
                                                    checked={settings.privacy[pref.key as keyof typeof settings.privacy] as boolean}
                                                    onChange={(value) => updateSetting('privacy', pref.key, value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Data Export */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-blue-900">Data Portability</h4>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    You can export your data at any time. This includes your profile, projects, and settings.
                                                </p>
                                                <button className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                                    Export My Data
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedCategory === 'notifications' && (
                                <div className="space-y-6">
                                    {/* Notification Channels */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-4">Notification Channels</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { key: 'email', label: 'Email', icon: Mail },
                                                { key: 'push', label: 'Push', icon: Bell },
                                                { key: 'desktop', label: 'Desktop', icon: Monitor },
                                                { key: 'mobile', label: 'Mobile', icon: Smartphone }
                                            ].map((channel) => {
                                                const ChannelIcon = channel.icon;
                                                return (
                                                    <div key={channel.key} className="text-center">
                                                        <button
                                                            onClick={() => updateSetting('notifications', channel.key, !settings.notifications[channel.key as keyof typeof settings.notifications])}
                                                            className={`w-full p-4 rounded-lg border-2 transition-colors ${settings.notifications[channel.key as keyof typeof settings.notifications]
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <ChannelIcon className="w-8 h-8 mx-auto mb-2" />
                                                            <div className="font-medium">{channel.label}</div>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Notification Types */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900">Notification Types</h3>

                                        {[
                                            { key: 'projectUpdates', label: 'Project updates', description: 'Get notified about project changes and milestones' },
                                            { key: 'teamMentions', label: 'Team mentions', description: 'When someone mentions you in comments or discussions' },
                                            { key: 'securityAlerts', label: 'Security alerts', description: 'Important security-related notifications' },
                                            { key: 'marketingEmails', label: 'Marketing emails', description: 'Product updates and feature announcements' },
                                            { key: 'weeklyDigest', label: 'Weekly digest', description: 'Weekly summary of your activity and updates' },
                                            { key: 'instantMessages', label: 'Instant messages', description: 'Real-time chat and direct messages' }
                                        ].map((notif) => (
                                            <div key={notif.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                                <div>
                                                    <div className="font-medium text-gray-900">{notif.label}</div>
                                                    <div className="text-sm text-gray-600">{notif.description}</div>
                                                </div>
                                                <ToggleSwitch
                                                    checked={settings.notifications[notif.key as keyof typeof settings.notifications] as boolean}
                                                    onChange={(value) => updateSetting('notifications', notif.key, value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Quiet Hours */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-2">Quiet Hours</h4>
                                        <p className="text-sm text-gray-600 mb-4">Set hours when you don't want to receive notifications</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                                                <input
                                                    type="time"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    defaultValue="22:00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                                <input
                                                    type="time"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    defaultValue="08:00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedCategory === 'security' && (
                                <div className="space-y-6">
                                    {/* Two-Factor Authentication */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start">
                                                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-green-900">Two-Factor Authentication</h4>
                                                    <p className="text-sm text-green-700 mt-1">
                                                        Your account is protected with 2FA using authenticator app
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                                                Manage
                                            </button>
                                        </div>
                                    </div>

                                    {/* Session Management */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-4">Session Management</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Session Timeout (minutes)
                                                </label>
                                                <select
                                                    value={settings.security.sessionTimeout}
                                                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value={15}>15 minutes</option>
                                                    <option value={30}>30 minutes</option>
                                                    <option value={60}>1 hour</option>
                                                    <option value={240}>4 hours</option>
                                                    <option value={480}>8 hours</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Password Expiry (days)
                                                </label>
                                                <select
                                                    value={settings.security.passwordExpiry}
                                                    onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value={30}>30 days</option>
                                                    <option value={60}>60 days</option>
                                                    <option value={90}>90 days</option>
                                                    <option value={180}>180 days</option>
                                                    <option value={365}>1 year</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Preferences */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900">Security Preferences</h3>

                                        {[
                                            { key: 'loginNotifications', label: 'Login notifications', description: 'Get notified when someone logs into your account' },
                                            { key: 'deviceTrust', label: 'Device trust', description: 'Remember trusted devices for faster login' },
                                            { key: 'apiAccess', label: 'API access', description: 'Allow third-party applications to access your account' },
                                            { key: 'downloadRestrictions', label: 'Download restrictions', description: 'Restrict file downloads from untrusted sources' }
                                        ].map((pref) => (
                                            <div key={pref.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                                <div>
                                                    <div className="font-medium text-gray-900">{pref.label}</div>
                                                    <div className="text-sm text-gray-600">{pref.description}</div>
                                                </div>
                                                <ToggleSwitch
                                                    checked={settings.security[pref.key as keyof typeof settings.security] as boolean}
                                                    onChange={(value) => updateSetting('security', pref.key, value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Active Sessions */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-4">Active Sessions</h3>
                                        <div className="space-y-3">
                                            {[
                                                { device: 'Chrome on Windows', location: 'San Francisco, CA', lastActive: '2 minutes ago', current: true },
                                                { device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '1 hour ago', current: false },
                                                { device: 'Firefox on macOS', location: 'New York, NY', lastActive: '2 days ago', current: false }
                                            ].map((session, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center">
                                                        <Monitor className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <div className="font-medium text-gray-900 flex items-center">
                                                                {session.device}
                                                                {session.current && (
                                                                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {session.location} • {session.lastActive}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!session.current && (
                                                        <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                                                            Revoke
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedCategory === 'editor' && (
                                <div className="space-y-6">
                                    {/* Font Settings */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Font Family
                                            </label>
                                            <select
                                                value={settings.editor.fontFamily}
                                                onChange={(e) => updateSetting('editor', 'fontFamily', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {fontFamilies.map((font) => (
                                                    <option key={font} value={font}>{font}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Font Size
                                            </label>
                                            <input
                                                type="range"
                                                min="10"
                                                max="24"
                                                value={settings.editor.fontSize}
                                                onChange={(e) => updateSetting('editor', 'fontSize', parseInt(e.target.value))}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                                                <span>10px</span>
                                                <span>{settings.editor.fontSize}px</span>
                                                <span>24px</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tab Settings */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tab Size
                                        </label>
                                        <div className="flex space-x-3">
                                            {[2, 4, 8].map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => updateSetting('editor', 'tabSize', size)}
                                                    className={`px-4 py-2 border rounded-lg transition-colors ${settings.editor.tabSize === size
                                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {size} spaces
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Editor Preferences */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900">Editor Preferences</h3>

                                        {[
                                            { key: 'wordWrap', label: 'Word wrap', description: 'Wrap long lines automatically' },
                                            { key: 'lineNumbers', label: 'Line numbers', description: 'Show line numbers in the editor' },
                                            { key: 'minimap', label: 'Minimap', description: 'Show code overview minimap' },
                                            { key: 'autoComplete', label: 'Auto-complete', description: 'Show intelligent code suggestions' },
                                            { key: 'formatOnSave', label: 'Format on save', description: 'Automatically format code when saving' },
                                            { key: 'syntaxHighlighting', label: 'Syntax highlighting', description: 'Highlight code syntax with colors' }
                                        ].map((pref) => (
                                            <div key={pref.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                                <div>
                                                    <div className="font-medium text-gray-900">{pref.label}</div>
                                                    <div className="text-sm text-gray-600">{pref.description}</div>
                                                </div>
                                                <ToggleSwitch
                                                    checked={settings.editor[pref.key as keyof typeof settings.editor] as boolean}
                                                    onChange={(value) => updateSetting('editor', pref.key, value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Editor Theme Preview */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-3">Theme Preview</h3>
                                        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                                            <div className="text-green-400">// React Component Example</div>
                                            <div className="text-blue-400">import</div> <div className="text-white">React</div> <div className="text-blue-400">from</div> <div className="text-yellow-300">'react'</div><div className="text-white">;</div>
                                            <br />
                                            <div className="text-blue-400">const</div> <div className="text-white">MyComponent = () =&gt; {`{`}</div>
                                            <div className="text-white ml-4"><div className="text-blue-400">return</div> <div className="text-red-400">&lt;div&gt;</div><div className="text-white">Hello World</div><div className="text-red-400">&lt;/div&gt;</div>;</div>
                                            <div className="text-white">{`}`};</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedCategory === 'integrations' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { key: 'github', name: 'GitHub', description: 'Connect your GitHub repositories', icon: '🐙', color: 'bg-gray-900 text-white' },
                                            { key: 'slack', name: 'Slack', description: 'Get notifications in Slack channels', icon: '💬', color: 'bg-purple-600 text-white' },
                                            { key: 'discord', name: 'Discord', description: 'Connect with Discord communities', icon: '🎮', color: 'bg-indigo-600 text-white' },
                                            { key: 'figma', name: 'Figma', description: 'Sync designs and prototypes', icon: '🎨', color: 'bg-pink-600 text-white' },
                                            { key: 'notion', name: 'Notion', description: 'Sync documentation and notes', icon: '📝', color: 'bg-gray-800 text-white' },
                                            { key: 'jira', name: 'Jira', description: 'Track issues and project progress', icon: '📊', color: 'bg-blue-600 text-white' },
                                            { key: 'trello', name: 'Trello', description: 'Manage boards and task lists', icon: '📋', color: 'bg-blue-500 text-white' },
                                            { key: 'zapier', name: 'Zapier', description: 'Automate workflows and integrations', icon: '⚡', color: 'bg-orange-500 text-white' }
                                        ].map((integration) => (
                                            <div key={integration.key} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.color} mr-3`}>
                                                            <span className="text-lg">{integration.icon}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{integration.name}</h4>
                                                            <p className="text-sm text-gray-600">{integration.description}</p>
                                                        </div>
                                                    </div>
                                                    <ToggleSwitch
                                                        checked={settings.integrations[integration.key as keyof typeof settings.integrations]}
                                                        onChange={(value) => updateSetting('integrations', integration.key, value)}
                                                    />
                                                </div>
                                                {settings.integrations[integration.key as keyof typeof settings.integrations] && (
                                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                        <span className="text-sm text-green-600 flex items-center">
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Connected
                                                        </span>
                                                        <button className="text-sm text-blue-600 hover:text-blue-700">
                                                            Configure
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* API Keys */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-4">API Keys</h3>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-start">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-yellow-900">Security Notice</h4>
                                                    <p className="text-sm text-yellow-700 mt-1">
                                                        API keys provide access to your account. Keep them secure and never share them publicly.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { name: 'Production API Key', created: '2024-01-15', lastUsed: '2 hours ago' },
                                                { name: 'Development API Key', created: '2024-02-01', lastUsed: '1 day ago' }
                                            ].map((key, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{key.name}</div>
                                                        <div className="text-sm text-gray-600">
                                                            Created {key.created} • Last used {key.lastUsed}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button className="p-2 text-gray-400 hover:text-blue-600">
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Generate New Key
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reset Category Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Reset Settings</h3>
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-gray-900">
                                        Are you sure you want to reset all {settingsCategories.find(c => c.id === selectedCategory)?.name} settings to their default values?
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetCategory}
                                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                                >
                                    Reset Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Settings Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Export Settings</h3>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Export your current settings as a JSON file. You can use this to backup your preferences or share them with team members.
                            </p>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="text-sm font-medium text-gray-900">codai-settings.json</div>
                                <div className="text-xs text-gray-600 mt-1">
                                    {JSON.stringify(settings).length} characters
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExportSettings}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Export Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
