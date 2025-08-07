'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Save,
    RefreshCw,
    Shield,
    Globe,
    Bell,
    User,
    Database,
    Server,
    Mail,
    Phone,
    Key,
    Eye,
    EyeOff,
    Upload,
    Download,
    AlertTriangle,
    CheckCircle,
    Info,
    Clock,
    Palette,
    Monitor,
    Lock,
    Unlock,
    FileText,
    Code,
    Zap,
    Activity,
    BarChart3,
    Users,
    Calendar,
    MapPin,
    Tag,
    Link,
    ExternalLink,
    Copy,
    Edit,
    Trash2,
    Plus,
    Minus,
    RotateCcw,
    Search,
    Filter,
    Star,
    Heart,
    MessageSquare,
    Share2,
    Bookmark,
    Flag,
    Archive,
    Layers,
    Box,
    Package,
    Workflow,
    GitBranch,
    Cloud,
    HardDrive,
    Cpu,
    MemoryStick,
    Network,
    Wifi,
    Bluetooth,
    Volume2,
    VolumeX,
    Camera,
    Mic,
    MicOff,
    Image,
    Video,
    Music,
    PlayCircle,
    PauseCircle,
    StopCircle,
    SkipForward,
    SkipBack,
    Shuffle,
    Repeat,
    Volume,
    VolumeX as VolumeMute,
    Sun,
    Moon,
    CloudRain,
    CloudSnow
} from 'lucide-react';

interface SystemSettings {
    general: {
        siteName: string;
        siteDescription: string;
        timezone: string;
        language: string;
        dateFormat: string;
        maintenanceMode: boolean;
        debugMode: boolean;
        allowRegistration: boolean;
        defaultUserRole: string;
        maxFileUploadSize: number;
        sessionTimeout: number;
    };
    security: {
        passwordPolicy: {
            minLength: number;
            requireUppercase: boolean;
            requireLowercase: boolean;
            requireNumbers: boolean;
            requireSymbols: boolean;
            maxAge: number;
        };
        twoFactorAuth: {
            enabled: boolean;
            required: boolean;
            methods: string[];
        };
        rateLimiting: {
            enabled: boolean;
            loginAttempts: number;
            lockoutDuration: number;
            apiRateLimit: number;
        };
        encryption: {
            algorithm: string;
            keyRotation: number;
        };
    };
    email: {
        provider: string;
        smtpHost: string;
        smtpPort: number;
        smtpUser: string;
        smtpPassword: string;
        smtpEncryption: string;
        fromEmail: string;
        fromName: string;
        testEmail: string;
    };
    notifications: {
        systemAlerts: boolean;
        securityEvents: boolean;
        userRegistrations: boolean;
        errorReports: boolean;
        performanceAlerts: boolean;
        backupNotifications: boolean;
        channels: {
            email: boolean;
            slack: boolean;
            webhook: boolean;
            sms: boolean;
        };
    };
    backup: {
        enabled: boolean;
        frequency: string;
        retention: number;
        location: string;
        encryption: boolean;
        includeFiles: boolean;
        includeDatabase: boolean;
        testRestore: boolean;
    };
    performance: {
        caching: {
            enabled: boolean;
            driver: string;
            ttl: number;
        };
        compression: {
            enabled: boolean;
            level: number;
        };
        cdn: {
            enabled: boolean;
            provider: string;
            url: string;
        };
        optimization: {
            minifyAssets: boolean;
            lazyLoading: boolean;
            imageOptimization: boolean;
        };
    };
    integrations: {
        analytics: {
            enabled: boolean;
            provider: string;
            trackingId: string;
        };
        monitoring: {
            enabled: boolean;
            provider: string;
            apiKey: string;
        };
        logging: {
            level: string;
            driver: string;
            retention: number;
        };
    };
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const [settings, setSettings] = useState<SystemSettings>({
        general: {
            siteName: 'CODAI Admin System',
            siteDescription: 'Advanced AI-powered administration platform',
            timezone: 'Europe/Bucharest',
            language: 'en',
            dateFormat: 'Y-m-d H:i:s',
            maintenanceMode: false,
            debugMode: true,
            allowRegistration: true,
            defaultUserRole: 'user',
            maxFileUploadSize: 10,
            sessionTimeout: 3600
        },
        security: {
            passwordPolicy: {
                minLength: 12,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSymbols: true,
                maxAge: 90
            },
            twoFactorAuth: {
                enabled: true,
                required: false,
                methods: ['totp', 'sms', 'email']
            },
            rateLimiting: {
                enabled: true,
                loginAttempts: 5,
                lockoutDuration: 900,
                apiRateLimit: 1000
            },
            encryption: {
                algorithm: 'AES-256-GCM',
                keyRotation: 30
            }
        },
        email: {
            provider: 'smtp',
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUser: 'admin@codai.com',
            smtpPassword: '********',
            smtpEncryption: 'tls',
            fromEmail: 'noreply@codai.com',
            fromName: 'CODAI Admin',
            testEmail: 'test@codai.com'
        },
        notifications: {
            systemAlerts: true,
            securityEvents: true,
            userRegistrations: true,
            errorReports: true,
            performanceAlerts: true,
            backupNotifications: true,
            channels: {
                email: true,
                slack: false,
                webhook: false,
                sms: false
            }
        },
        backup: {
            enabled: true,
            frequency: 'daily',
            retention: 30,
            location: 's3://codai-backups/',
            encryption: true,
            includeFiles: true,
            includeDatabase: true,
            testRestore: false
        },
        performance: {
            caching: {
                enabled: true,
                driver: 'redis',
                ttl: 3600
            },
            compression: {
                enabled: true,
                level: 6
            },
            cdn: {
                enabled: false,
                provider: 'cloudflare',
                url: ''
            },
            optimization: {
                minifyAssets: true,
                lazyLoading: true,
                imageOptimization: true
            }
        },
        integrations: {
            analytics: {
                enabled: true,
                provider: 'google',
                trackingId: 'GA-XXXX-X'
            },
            monitoring: {
                enabled: true,
                provider: 'datadog',
                apiKey: '********'
            },
            logging: {
                level: 'info',
                driver: 'file',
                retention: 30
            }
        }
    });

    const tabs = [
        { id: 'general', name: 'General', icon: Settings },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'email', name: 'Email', icon: Mail },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'backup', name: 'Backup', icon: Archive },
        { id: 'performance', name: 'Performance', icon: Zap },
        { id: 'integrations', name: 'Integrations', icon: Layers }
    ];

    const updateSetting = (section: keyof SystemSettings, field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
        setHasChanges(true);
    };

    const updateNestedSetting = (section: keyof SystemSettings, subsection: string, field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subsection]: {
                    ...prev[section][subsection as keyof typeof prev[section]],
                    [field]: value
                }
            }
        }));
        setHasChanges(true);
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setHasChanges(false);
            console.log('Settings saved:', settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const testEmailConnection = async () => {
        setTestingConnection(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log('Email connection test successful');
        } catch (error) {
            console.error('Email connection test failed:', error);
        } finally {
            setTestingConnection(false);
        }
    };

    const resetToDefaults = () => {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            // Reset logic would go here
            setHasChanges(true);
        }
    };

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Site Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                        <input
                            type="text"
                            value={settings.general.siteName}
                            onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                            value={settings.general.timezone}
                            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="Europe/Bucharest">Europe/Bucharest</option>
                            <option value="Europe/London">Europe/London</option>
                            <option value="America/New_York">America/New_York</option>
                            <option value="Asia/Tokyo">Asia/Tokyo</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                        <textarea
                            value={settings.general.siteDescription}
                            onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                            <p className="text-sm text-gray-500">Temporarily disable public access</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.general.maintenanceMode}
                                onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Debug Mode</h4>
                            <p className="text-sm text-gray-500">Enable detailed error reporting</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.general.debugMode}
                                onChange={(e) => updateSetting('general', 'debugMode', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Allow Registration</h4>
                            <p className="text-sm text-gray-500">Allow new users to register</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.general.allowRegistration}
                                onChange={(e) => updateSetting('general', 'allowRegistration', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
                        <input
                            type="number"
                            value={settings.security.passwordPolicy.minLength}
                            onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'minLength', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password Max Age (days)</label>
                        <input
                            type="number"
                            value={settings.security.passwordPolicy.maxAge}
                            onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'maxAge', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {[
                        { key: 'requireUppercase', label: 'Uppercase' },
                        { key: 'requireLowercase', label: 'Lowercase' },
                        { key: 'requireNumbers', label: 'Numbers' },
                        { key: 'requireSymbols', label: 'Symbols' }
                    ].map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.security.passwordPolicy[key as keyof typeof settings.security.passwordPolicy] as boolean}
                                onChange={(e) => updateNestedSetting('security', 'passwordPolicy', key, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="text-sm text-gray-700">{label}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Enable 2FA</h4>
                            <p className="text-sm text-gray-500">Allow users to enable two-factor authentication</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.security.twoFactorAuth.enabled}
                                onChange={(e) => updateNestedSetting('security', 'twoFactorAuth', 'enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Require 2FA</h4>
                            <p className="text-sm text-gray-500">Make two-factor authentication mandatory</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.security.twoFactorAuth.required}
                                onChange={(e) => updateNestedSetting('security', 'twoFactorAuth', 'required', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Limiting</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Login Attempts</label>
                        <input
                            type="number"
                            value={settings.security.rateLimiting.loginAttempts}
                            onChange={(e) => updateNestedSetting('security', 'rateLimiting', 'loginAttempts', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lockout Duration (seconds)</label>
                        <input
                            type="number"
                            value={settings.security.rateLimiting.lockoutDuration}
                            onChange={(e) => updateNestedSetting('security', 'rateLimiting', 'lockoutDuration', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit</label>
                        <input
                            type="number"
                            value={settings.security.rateLimiting.apiRateLimit}
                            onChange={(e) => updateNestedSetting('security', 'rateLimiting', 'apiRateLimit', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEmailSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                        <input
                            type="text"
                            value={settings.email.smtpHost}
                            onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                        <input
                            type="number"
                            value={settings.email.smtpPort}
                            onChange={(e) => updateSetting('email', 'smtpPort', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                        <input
                            type="text"
                            value={settings.email.smtpUser}
                            onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                value={settings.email.smtpPassword}
                                onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPasswords ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
                        <select
                            value={settings.email.smtpEncryption}
                            onChange={(e) => updateSetting('email', 'smtpEncryption', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="none">None</option>
                            <option value="tls">TLS</option>
                            <option value="ssl">SSL</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Test Email</label>
                        <div className="flex space-x-2">
                            <input
                                type="email"
                                value={settings.email.testEmail}
                                onChange={(e) => updateSetting('email', 'testEmail', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                onClick={testEmailConnection}
                                disabled={testingConnection}
                                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {testingConnection ? 'Testing...' : 'Test'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sender Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                        <input
                            type="email"
                            value={settings.email.fromEmail}
                            onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                        <input
                            type="text"
                            value={settings.email.fromName}
                            onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Notifications</h3>
                <div className="space-y-4">
                    {[
                        { key: 'systemAlerts', label: 'System Alerts', description: 'Critical system notifications' },
                        { key: 'securityEvents', label: 'Security Events', description: 'Security-related notifications' },
                        { key: 'userRegistrations', label: 'User Registrations', description: 'New user registration alerts' },
                        { key: 'errorReports', label: 'Error Reports', description: 'Application error notifications' },
                        { key: 'performanceAlerts', label: 'Performance Alerts', description: 'Performance degradation alerts' },
                        { key: 'backupNotifications', label: 'Backup Notifications', description: 'Backup status notifications' }
                    ].map(({ key, label, description }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                                <p className="text-sm text-gray-500">{description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications[key as keyof typeof settings.notifications] as boolean}
                                    onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { key: 'email', label: 'Email', icon: Mail },
                        { key: 'slack', label: 'Slack', icon: MessageSquare },
                        { key: 'webhook', label: 'Webhook', icon: Link },
                        { key: 'sms', label: 'SMS', icon: Phone }
                    ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <Icon className="w-5 h-5 text-gray-600" />
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-900">{label}</label>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.notifications.channels[key as keyof typeof settings.notifications.channels]}
                                onChange={(e) => updateNestedSetting('notifications', 'channels', key, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderCurrentTab = () => {
        switch (activeTab) {
            case 'general':
                return renderGeneralSettings();
            case 'security':
                return renderSecuritySettings();
            case 'email':
                return renderEmailSettings();
            case 'notifications':
                return renderNotificationSettings();
            case 'backup':
                return (
                    <div className="space-y-6">
                        <div className="text-center py-12">
                            <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Backup settings will be implemented here</p>
                        </div>
                    </div>
                );
            case 'performance':
                return (
                    <div className="space-y-6">
                        <div className="text-center py-12">
                            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Performance settings will be implemented here</p>
                        </div>
                    </div>
                );
            case 'integrations':
                return (
                    <div className="space-y-6">
                        <div className="text-center py-12">
                            <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Integration settings will be implemented here</p>
                        </div>
                    </div>
                );
            default:
                return renderGeneralSettings();
        }
    };

    return (
        <div className="lg:pl-64">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                        <p className="text-gray-600 mt-1">
                            Configure system-wide settings and preferences
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <button
                            onClick={resetToDefaults}
                            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset to Defaults
                        </button>

                        <button
                            onClick={saveSettings}
                            disabled={!hasChanges || saving}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>

                {/* Settings Interface */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Settings Tabs */}
                    <div className="lg:w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${activeTab === tab.id
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            {renderCurrentTab()}
                        </div>
                    </div>
                </div>

                {/* Save Status */}
                {hasChanges && (
                    <div className="fixed bottom-6 right-6 bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            <p className="text-sm text-yellow-800">You have unsaved changes</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
