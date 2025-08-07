'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Server,
    Database,
    Shield,
    Bell,
    Mail,
    Globe,
    Users,
    Key,
    Palette,
    Monitor,
    Smartphone,
    Save,
    RotateCcw,
    Download,
    Upload,
    FileText,
    Trash2,
    Plus,
    Edit,
    Eye,
    EyeOff,
    Check,
    X,
    Info,
    AlertTriangle,
    CheckCircle,
    Clock,
    Zap,
    Cloud,
    Lock,
    Unlock,
    RefreshCw,
    Search,
    Filter,
    MoreHorizontal,
    Cpu,
    HardDrive,
    Wifi,
    Activity,
    BarChart3,
    PieChart,
    TrendingUp,
    Calendar,
    Target,
    Archive,
    Layers,
    GitBranch,
    BookOpen,
    HelpCircle,
    ExternalLink,
    Copy,
    Link,
    Code,
    Terminal,
    Package,
    Plug,
    Radio,
    Bluetooth,
    Headphones,
    Mic,
    Camera,
    MapPin,
    Timer,
    Flag,
    Tag,
    Bookmark,
    Star,
    Heart,
    MessageSquare,
    Share,
    ThumbsUp,
    Award,
    Briefcase,
    Building,
    Home,
    Car,
    Plane,
    Ship,
    Train,
    Truck,
    Bike
} from 'lucide-react';

interface SettingField {
    id: string;
    label: string;
    description: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'password' | 'email' | 'url' | 'color' | 'file';
    value: any;
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
    disabled?: boolean;
    validation?: {
        pattern?: string;
        message?: string;
    };
    group?: string;
    help?: string;
}

interface SettingsGroup {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    fields: SettingField[];
    requiresRestart?: boolean;
    dangerous?: boolean;
}

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState<{ [key: string]: any }>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // Settings Configuration
    const settingsGroups: SettingsGroup[] = [
        {
            id: 'general',
            title: 'General Settings',
            description: 'Core Hub configuration and basic settings',
            icon: <Settings className="w-5 h-5" />,
            fields: [
                {
                    id: 'hub_name',
                    label: 'Hub Name',
                    description: 'Display name for this Hub instance',
                    type: 'text',
                    value: 'CODAI Ecosystem Hub',
                    required: true,
                    placeholder: 'Enter hub name'
                },
                {
                    id: 'hub_description',
                    label: 'Hub Description',
                    description: 'Brief description of this Hub instance',
                    type: 'textarea',
                    value: 'Central coordination platform for the CODAI ecosystem',
                    placeholder: 'Enter hub description'
                },
                {
                    id: 'timezone',
                    label: 'Timezone',
                    description: 'Default timezone for the Hub',
                    type: 'select',
                    value: 'UTC',
                    options: [
                        { value: 'UTC', label: 'UTC' },
                        { value: 'America/New_York', label: 'Eastern Time' },
                        { value: 'America/Chicago', label: 'Central Time' },
                        { value: 'America/Denver', label: 'Mountain Time' },
                        { value: 'America/Los_Angeles', label: 'Pacific Time' },
                        { value: 'Europe/London', label: 'London' },
                        { value: 'Europe/Paris', label: 'Paris' },
                        { value: 'Europe/Berlin', label: 'Berlin' },
                        { value: 'Asia/Tokyo', label: 'Tokyo' },
                        { value: 'Asia/Shanghai', label: 'Shanghai' },
                        { value: 'Australia/Sydney', label: 'Sydney' }
                    ]
                },
                {
                    id: 'language',
                    label: 'Default Language',
                    description: 'Default language for the Hub interface',
                    type: 'select',
                    value: 'en',
                    options: [
                        { value: 'en', label: 'English' },
                        { value: 'ro', label: 'Romanian' },
                        { value: 'es', label: 'Spanish' },
                        { value: 'fr', label: 'French' },
                        { value: 'de', label: 'German' },
                        { value: 'it', label: 'Italian' },
                        { value: 'pt', label: 'Portuguese' },
                        { value: 'ru', label: 'Russian' },
                        { value: 'zh', label: 'Chinese' },
                        { value: 'ja', label: 'Japanese' }
                    ]
                },
                {
                    id: 'auto_refresh',
                    label: 'Auto Refresh',
                    description: 'Automatically refresh data every 30 seconds',
                    type: 'boolean',
                    value: true
                },
                {
                    id: 'refresh_interval',
                    label: 'Refresh Interval (seconds)',
                    description: 'How often to refresh data automatically',
                    type: 'number',
                    value: 30,
                    min: 5,
                    max: 300
                },
                {
                    id: 'max_logs',
                    label: 'Maximum Log Entries',
                    description: 'Maximum number of log entries to keep in memory',
                    type: 'number',
                    value: 1000,
                    min: 100,
                    max: 10000
                }
            ]
        },
        {
            id: 'ecosystem',
            title: 'Ecosystem Settings',
            description: 'Configuration for CODAI ecosystem applications',
            icon: <Globe className="w-5 h-5" />,
            fields: [
                {
                    id: 'ecosystem_discovery',
                    label: 'Auto Discovery',
                    description: 'Automatically discover new CODAI applications',
                    type: 'boolean',
                    value: true
                },
                {
                    id: 'discovery_port_range',
                    label: 'Discovery Port Range',
                    description: 'Port range for application discovery (start-end)',
                    type: 'text',
                    value: '4000-7000',
                    placeholder: '4000-7000',
                    validation: {
                        pattern: '^\\d+-\\d+$',
                        message: 'Format: start-end (e.g., 4000-7000)'
                    }
                },
                {
                    id: 'health_check_interval',
                    label: 'Health Check Interval (seconds)',
                    description: 'How often to check application health',
                    type: 'number',
                    value: 60,
                    min: 15,
                    max: 600
                },
                {
                    id: 'health_check_timeout',
                    label: 'Health Check Timeout (seconds)',
                    description: 'Timeout for health check requests',
                    type: 'number',
                    value: 10,
                    min: 1,
                    max: 60
                },
                {
                    id: 'service_restart_enabled',
                    label: 'Auto Restart Services',
                    description: 'Automatically restart failed services',
                    type: 'boolean',
                    value: false
                },
                {
                    id: 'restart_attempts',
                    label: 'Max Restart Attempts',
                    description: 'Maximum number of restart attempts before giving up',
                    type: 'number',
                    value: 3,
                    min: 1,
                    max: 10
                },
                {
                    id: 'ecosystem_domains',
                    label: 'Ecosystem Domains',
                    description: 'Comma-separated list of domains for ecosystem apps',
                    type: 'textarea',
                    value: 'localhost, codai.local, hub.codai.local',
                    placeholder: 'domain1.com, domain2.com'
                }
            ]
        },
        {
            id: 'monitoring',
            title: 'Monitoring & Alerts',
            description: 'Monitoring thresholds and alerting configuration',
            icon: <Monitor className="w-5 h-5" />,
            fields: [
                {
                    id: 'monitoring_enabled',
                    label: 'Enable Monitoring',
                    description: 'Enable comprehensive system monitoring',
                    type: 'boolean',
                    value: true
                },
                {
                    id: 'cpu_warning_threshold',
                    label: 'CPU Warning Threshold (%)',
                    description: 'CPU usage threshold for warnings',
                    type: 'number',
                    value: 70,
                    min: 1,
                    max: 100
                },
                {
                    id: 'cpu_critical_threshold',
                    label: 'CPU Critical Threshold (%)',
                    description: 'CPU usage threshold for critical alerts',
                    type: 'number',
                    value: 85,
                    min: 1,
                    max: 100
                },
                {
                    id: 'memory_warning_threshold',
                    label: 'Memory Warning Threshold (%)',
                    description: 'Memory usage threshold for warnings',
                    type: 'number',
                    value: 80,
                    min: 1,
                    max: 100
                },
                {
                    id: 'memory_critical_threshold',
                    label: 'Memory Critical Threshold (%)',
                    description: 'Memory usage threshold for critical alerts',
                    type: 'number',
                    value: 90,
                    min: 1,
                    max: 100
                },
                {
                    id: 'disk_warning_threshold',
                    label: 'Disk Warning Threshold (%)',
                    description: 'Disk usage threshold for warnings',
                    type: 'number',
                    value: 80,
                    min: 1,
                    max: 100
                },
                {
                    id: 'response_time_threshold',
                    label: 'Response Time Threshold (ms)',
                    description: 'Response time threshold for performance alerts',
                    type: 'number',
                    value: 1000,
                    min: 100,
                    max: 10000
                },
                {
                    id: 'error_rate_threshold',
                    label: 'Error Rate Threshold (%)',
                    description: 'Error rate threshold for alerts',
                    type: 'number',
                    value: 5,
                    min: 0.1,
                    max: 50
                }
            ]
        },
        {
            id: 'notifications',
            title: 'Notifications',
            description: 'Alert and notification preferences',
            icon: <Bell className="w-5 h-5" />,
            fields: [
                {
                    id: 'notifications_enabled',
                    label: 'Enable Notifications',
                    description: 'Enable system notifications',
                    type: 'boolean',
                    value: true
                },
                {
                    id: 'email_notifications',
                    label: 'Email Notifications',
                    description: 'Send notifications via email',
                    type: 'boolean',
                    value: true
                },
                {
                    id: 'notification_email',
                    label: 'Notification Email',
                    description: 'Email address for notifications',
                    type: 'email',
                    value: 'admin@codai.local',
                    placeholder: 'notifications@example.com'
                },
                {
                    id: 'smtp_server',
                    label: 'SMTP Server',
                    description: 'SMTP server for sending emails',
                    type: 'text',
                    value: 'localhost',
                    placeholder: 'smtp.example.com'
                },
                {
                    id: 'smtp_port',
                    label: 'SMTP Port',
                    description: 'SMTP server port',
                    type: 'number',
                    value: 587,
                    min: 1,
                    max: 65535
                },
                {
                    id: 'smtp_username',
                    label: 'SMTP Username',
                    description: 'Username for SMTP authentication',
                    type: 'text',
                    value: '',
                    placeholder: 'username@example.com'
                },
                {
                    id: 'smtp_password',
                    label: 'SMTP Password',
                    description: 'Password for SMTP authentication',
                    type: 'password',
                    value: '',
                    placeholder: 'Enter SMTP password'
                },
                {
                    id: 'webhook_notifications',
                    label: 'Webhook Notifications',
                    description: 'Send notifications to webhook URLs',
                    type: 'boolean',
                    value: false
                },
                {
                    id: 'webhook_url',
                    label: 'Webhook URL',
                    description: 'URL for webhook notifications',
                    type: 'url',
                    value: '',
                    placeholder: 'https://hooks.example.com/webhook'
                }
            ]
        },
        {
            id: 'security',
            title: 'Security Settings',
            description: 'Authentication and security configuration',
            icon: <Shield className="w-5 h-5" />,
            requiresRestart: true,
            fields: [
                {
                    id: 'security_enabled',
                    label: 'Enable Security',
                    description: 'Enable authentication and authorization',
                    type: 'boolean',
                    value: true
                },
                {
                    id: 'session_timeout',
                    label: 'Session Timeout (minutes)',
                    description: 'User session timeout duration',
                    type: 'number',
                    value: 60,
                    min: 5,
                    max: 480
                },
                {
                    id: 'password_min_length',
                    label: 'Minimum Password Length',
                    description: 'Minimum required password length',
                    type: 'number',
                    value: 8,
                    min: 4,
                    max: 64
                },
                {
                    id: 'require_mfa',
                    label: 'Require Multi-Factor Authentication',
                    description: 'Require MFA for all users',
                    type: 'boolean',
                    value: false
                },
                {
                    id: 'api_rate_limit',
                    label: 'API Rate Limit (requests/minute)',
                    description: 'Maximum API requests per minute per user',
                    type: 'number',
                    value: 100,
                    min: 10,
                    max: 1000
                },
                {
                    id: 'allowed_origins',
                    label: 'Allowed Origins',
                    description: 'Comma-separated list of allowed CORS origins',
                    type: 'textarea',
                    value: 'http://localhost:3000, https://codai.local',
                    placeholder: 'https://example.com, https://app.example.com'
                },
                {
                    id: 'jwt_secret',
                    label: 'JWT Secret Key',
                    description: 'Secret key for JWT token signing',
                    type: 'password',
                    value: '',
                    placeholder: 'Enter JWT secret (leave empty to auto-generate)',
                    help: 'Leave empty to auto-generate a secure key'
                },
                {
                    id: 'encrypt_storage',
                    label: 'Encrypt Storage',
                    description: 'Encrypt sensitive data at rest',
                    type: 'boolean',
                    value: true
                }
            ]
        },
        {
            id: 'performance',
            title: 'Performance Settings',
            description: 'Performance tuning and optimization',
            icon: <Zap className="w-5 h-5" />,
            requiresRestart: true,
            fields: [
                {
                    id: 'cache_enabled',
                    label: 'Enable Caching',
                    description: 'Enable response caching for better performance',
                    type: 'boolean',
                    value: true
                },
                {
                    id: 'cache_ttl',
                    label: 'Cache TTL (seconds)',
                    description: 'Time-to-live for cached responses',
                    type: 'number',
                    value: 300,
                    min: 30,
                    max: 3600
                },
                {
                    id: 'max_concurrent_requests',
                    label: 'Max Concurrent Requests',
                    description: 'Maximum number of concurrent API requests',
                    type: 'number',
                    value: 100,
                    min: 10,
                    max: 1000
                },
                {
                    id: 'request_timeout',
                    label: 'Request Timeout (seconds)',
                    description: 'Timeout for API requests',
                    type: 'number',
                    value: 30,
                    min: 5,
                    max: 300
                },
                {
                    id: 'worker_processes',
                    label: 'Worker Processes',
                    description: 'Number of worker processes (0 = auto)',
                    type: 'number',
                    value: 0,
                    min: 0,
                    max: 16,
                    help: 'Set to 0 for automatic detection based on CPU cores'
                },
                {
                    id: 'memory_limit',
                    label: 'Memory Limit (MB)',
                    description: 'Maximum memory usage per process',
                    type: 'number',
                    value: 512,
                    min: 128,
                    max: 4096
                },
                {
                    id: 'compression_enabled',
                    label: 'Enable Compression',
                    description: 'Enable gzip compression for responses',
                    type: 'boolean',
                    value: true
                },
                {
                    id: 'compression_level',
                    label: 'Compression Level',
                    description: 'Gzip compression level (1-9)',
                    type: 'number',
                    value: 6,
                    min: 1,
                    max: 9
                }
            ]
        },
        {
            id: 'integrations',
            title: 'Integrations',
            description: 'External service integrations and APIs',
            icon: <Plug className="w-5 h-5" />,
            fields: [
                {
                    id: 'prometheus_enabled',
                    label: 'Prometheus Metrics',
                    description: 'Enable Prometheus metrics export',
                    type: 'boolean',
                    value: true
                },
                {
                    id: 'prometheus_endpoint',
                    label: 'Prometheus Endpoint',
                    description: 'Endpoint path for Prometheus metrics',
                    type: 'text',
                    value: '/metrics',
                    placeholder: '/metrics'
                },
                {
                    id: 'grafana_enabled',
                    label: 'Grafana Integration',
                    description: 'Enable Grafana dashboard integration',
                    type: 'boolean',
                    value: false
                },
                {
                    id: 'grafana_url',
                    label: 'Grafana URL',
                    description: 'URL of Grafana instance',
                    type: 'url',
                    value: '',
                    placeholder: 'https://grafana.example.com'
                },
                {
                    id: 'grafana_api_key',
                    label: 'Grafana API Key',
                    description: 'API key for Grafana integration',
                    type: 'password',
                    value: '',
                    placeholder: 'Enter Grafana API key'
                },
                {
                    id: 'slack_integration',
                    label: 'Slack Integration',
                    description: 'Enable Slack notifications',
                    type: 'boolean',
                    value: false
                },
                {
                    id: 'slack_webhook_url',
                    label: 'Slack Webhook URL',
                    description: 'Slack webhook URL for notifications',
                    type: 'url',
                    value: '',
                    placeholder: 'https://hooks.slack.com/services/...'
                },
                {
                    id: 'slack_channel',
                    label: 'Slack Channel',
                    description: 'Default Slack channel for notifications',
                    type: 'text',
                    value: '#alerts',
                    placeholder: '#alerts'
                },
                {
                    id: 'discord_integration',
                    label: 'Discord Integration',
                    description: 'Enable Discord notifications',
                    type: 'boolean',
                    value: false
                },
                {
                    id: 'discord_webhook_url',
                    label: 'Discord Webhook URL',
                    description: 'Discord webhook URL for notifications',
                    type: 'url',
                    value: '',
                    placeholder: 'https://discord.com/api/webhooks/...'
                }
            ]
        },
        {
            id: 'advanced',
            title: 'Advanced Settings',
            description: 'Advanced configuration options (use with caution)',
            icon: <Code className="w-5 h-5" />,
            requiresRestart: true,
            dangerous: true,
            fields: [
                {
                    id: 'debug_mode',
                    label: 'Debug Mode',
                    description: 'Enable debug logging and detailed error messages',
                    type: 'boolean',
                    value: false
                },
                {
                    id: 'log_level',
                    label: 'Log Level',
                    description: 'Minimum log level to record',
                    type: 'select',
                    value: 'info',
                    options: [
                        { value: 'debug', label: 'Debug' },
                        { value: 'info', label: 'Info' },
                        { value: 'warn', label: 'Warning' },
                        { value: 'error', label: 'Error' },
                        { value: 'fatal', label: 'Fatal' }
                    ]
                },
                {
                    id: 'enable_experimental',
                    label: 'Enable Experimental Features',
                    description: 'Enable experimental and beta features',
                    type: 'boolean',
                    value: false
                },
                {
                    id: 'custom_config',
                    label: 'Custom Configuration',
                    description: 'Custom JSON configuration (advanced users only)',
                    type: 'textarea',
                    value: '{}',
                    placeholder: '{"key": "value"}',
                    validation: {
                        pattern: '^{.*}$',
                        message: 'Must be valid JSON object'
                    },
                    help: 'Advanced users only. Invalid JSON will be ignored.'
                },
                {
                    id: 'maintenance_mode',
                    label: 'Maintenance Mode',
                    description: 'Enable maintenance mode (disables public access)',
                    type: 'boolean',
                    value: false
                },
                {
                    id: 'maintenance_message',
                    label: 'Maintenance Message',
                    description: 'Message to display during maintenance',
                    type: 'textarea',
                    value: 'The system is currently under maintenance. Please try again later.',
                    placeholder: 'Enter maintenance message'
                }
            ]
        }
    ];

    // Initialize settings
    useEffect(() => {
        const initialSettings: { [key: string]: any } = {};
        settingsGroups.forEach(group => {
            group.fields.forEach(field => {
                initialSettings[field.id] = field.value;
            });
        });
        setSettings(initialSettings);
    }, []);

    const updateSetting = (fieldId: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [fieldId]: value
        }));
        setHasUnsavedChanges(true);
        setSaveStatus('idle');
    };

    const saveSettings = async () => {
        setIsLoading(true);
        setSaveStatus('saving');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setHasUnsavedChanges(false);
            setSaveStatus('saved');

            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        } catch (error) {
            setSaveStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetSettings = () => {
        const initialSettings: { [key: string]: any } = {};
        settingsGroups.forEach(group => {
            group.fields.forEach(field => {
                initialSettings[field.id] = field.value;
            });
        });
        setSettings(initialSettings);
        setHasUnsavedChanges(false);
        setSaveStatus('idle');
    };

    const exportSettings = () => {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            settings: settings
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hub-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredGroups = settingsGroups.filter(group => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            group.title.toLowerCase().includes(searchLower) ||
            group.description.toLowerCase().includes(searchLower) ||
            group.fields.some(field =>
                field.label.toLowerCase().includes(searchLower) ||
                field.description.toLowerCase().includes(searchLower)
            )
        );
    });

    const currentGroup = settingsGroups.find(g => g.id === activeTab);
    const filteredFields = currentGroup?.fields.filter(field => {
        if (!searchTerm) return showAdvanced || !currentGroup.dangerous;

        const searchLower = searchTerm.toLowerCase();
        return (
            field.label.toLowerCase().includes(searchLower) ||
            field.description.toLowerCase().includes(searchLower)
        );
    });

    const renderField = (field: SettingField) => {
        const value = settings[field.id];

        switch (field.type) {
            case 'boolean':
                return (
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={value || false}
                            onChange={(e) => updateSetting(field.id, e.target.checked)}
                            disabled={field.disabled}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{field.label}</span>
                    </label>
                );

            case 'select':
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => updateSetting(field.id, e.target.value)}
                        disabled={field.disabled}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        {field.options?.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'textarea':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => updateSetting(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                );

            case 'password':
                return (
                    <div className="relative">
                        <input
                            type="password"
                            value={value || ''}
                            onChange={(e) => updateSetting(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            disabled={field.disabled}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value || ''}
                        onChange={(e) => updateSetting(field.id, Number(e.target.value))}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        min={field.min}
                        max={field.max}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                );

            case 'color':
                return (
                    <div className="flex items-center space-x-2">
                        <input
                            type="color"
                            value={value || '#000000'}
                            onChange={(e) => updateSetting(field.id, e.target.value)}
                            disabled={field.disabled}
                            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => updateSetting(field.id, e.target.value)}
                            placeholder="#000000"
                            disabled={field.disabled}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                );

            default:
                return (
                    <input
                        type={field.type}
                        value={value || ''}
                        onChange={(e) => updateSetting(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        required={field.required}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                );
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hub Settings</h1>
                    <p className="mt-2 text-gray-600">
                        Configure your CODAI Hub instance settings and preferences
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    {hasUnsavedChanges && (
                        <span className="flex items-center text-sm text-yellow-600">
                            <Clock className="w-4 h-4 mr-1" />
                            Unsaved changes
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="flex items-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Settings saved
                        </span>
                    )}
                    <button
                        onClick={exportSettings}
                        className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={resetSettings}
                        disabled={!hasUnsavedChanges}
                        className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </button>
                    <button
                        onClick={saveSettings}
                        disabled={!hasUnsavedChanges || isLoading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search settings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                </div>
                {settingsGroups.some(g => g.dangerous) && (
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={showAdvanced}
                            onChange={(e) => setShowAdvanced(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show advanced settings</span>
                    </label>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 space-y-1">
                    {filteredGroups.map((group) => (
                        <button
                            key={group.id}
                            onClick={() => setActiveTab(group.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${activeTab === group.id
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'text-gray-700 hover:bg-gray-100'
                                } ${group.dangerous && !showAdvanced ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <div className={`p-1 rounded ${activeTab === group.id ? 'text-blue-700' : 'text-gray-500'
                                }`}>
                                {group.icon}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">{group.title}</div>
                                {group.requiresRestart && (
                                    <div className="text-xs text-orange-600 mt-1">Requires restart</div>
                                )}
                                {group.dangerous && (
                                    <div className="text-xs text-red-600 mt-1">Advanced</div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1">
                    {currentGroup && (
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                        {currentGroup.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{currentGroup.title}</h2>
                                        <p className="text-gray-600">{currentGroup.description}</p>
                                    </div>
                                </div>
                                {currentGroup.requiresRestart && (
                                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                                            <span className="text-sm text-orange-700">
                                                Changes to these settings require a system restart to take effect.
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {currentGroup.dangerous && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <AlertTriangle className="w-4 h-4 text-red-600" />
                                            <span className="text-sm text-red-700">
                                                ⚠️ Advanced settings - modify with caution. Incorrect values may cause system instability.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-6">
                                {filteredFields?.map((field) => (
                                    <div key={field.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-medium text-gray-700">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {field.help && (
                                                <div className="group relative">
                                                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                        {field.help}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{field.description}</p>

                                        {field.type !== 'boolean' && (
                                            <div className="space-y-1">
                                                {renderField(field)}
                                                {field.validation && (
                                                    <p className="text-xs text-gray-500">{field.validation.message}</p>
                                                )}
                                            </div>
                                        )}

                                        {field.type === 'boolean' && renderField(field)}
                                    </div>
                                ))}

                                {filteredFields?.length === 0 && searchTerm && (
                                    <div className="text-center py-8">
                                        <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">No settings found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
