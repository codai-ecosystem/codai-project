'use client';

import React, { useState } from 'react';
import {
    Settings,
    Shield,
    Key,
    Database,
    Globe,
    Bell,
    Users,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Save,
    RefreshCw,
    Download,
    Upload,
    Copy,
    Edit3,
    Trash2,
    Plus,
    Check,
    X,
    AlertTriangle,
    Info,
    Clock,
    Server,
    Cloud,
    Smartphone,
    Monitor,
    Mail,
    MessageSquare,
    Slack,
    Webhook,
    ExternalLink,
    RotateCw,
    HardDrive,
    Wifi,
    Zap,
    FileText,
    Calendar,
    Timer,
    Activity,
    BarChart3,
    PieChart,
    TrendingUp,
    Filter,
    Search,
    MoreVertical,
    ChevronRight,
    ChevronDown,
    Toggle,
    Sliders,
    Cog,
    Tool,
    Archive,
    Import,
    GitBranch,
    Package,
    Link,
    Target
} from 'lucide-react';

interface SystemSetting {
    id: string;
    category: 'general' | 'authentication' | 'security' | 'integrations' | 'notifications' | 'backup' | 'advanced';
    name: string;
    description: string;
    type: 'boolean' | 'string' | 'number' | 'select' | 'multiselect' | 'json';
    value: any;
    defaultValue: any;
    options?: Array<{ label: string; value: any }>;
    required: boolean;
    sensitive: boolean;
    restartRequired: boolean;
    lastModified: string;
    modifiedBy: string;
}

interface ServiceConfiguration {
    id: string;
    name: string;
    status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
    version: string;
    description: string;
    port: number;
    health: 'healthy' | 'unhealthy' | 'warning';
    uptime: string;
    memoryUsage: number;
    cpuUsage: number;
    lastRestart: string;
    autoStart: boolean;
    logLevel: string;
    configFile: string;
}

interface IntegrationConfig {
    id: string;
    name: string;
    type: 'oauth' | 'api_key' | 'webhook' | 'saml' | 'ldap';
    status: 'connected' | 'disconnected' | 'error' | 'configuring';
    description: string;
    provider: string;
    lastSync: string;
    nextSync: string;
    errorCount: number;
    totalRequests: number;
    successRate: number;
    configuration: Record<string, any>;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceConfiguration | null>(null);

    const systemSettings: SystemSetting[] = [
        {
            id: '1',
            category: 'general',
            name: 'System Name',
            description: 'Display name for the identity management system',
            type: 'string',
            value: 'CODAI Identity Manager',
            defaultValue: 'CODAI Identity Manager',
            required: true,
            sensitive: false,
            restartRequired: false,
            lastModified: '2 days ago',
            modifiedBy: 'System Admin'
        },
        {
            id: '2',
            category: 'general',
            name: 'Session Timeout',
            description: 'Default session timeout in minutes',
            type: 'number',
            value: 30,
            defaultValue: 30,
            required: true,
            sensitive: false,
            restartRequired: false,
            lastModified: '1 week ago',
            modifiedBy: 'Sarah Wilson'
        },
        {
            id: '3',
            category: 'authentication',
            name: 'MFA Required',
            description: 'Require multi-factor authentication for all users',
            type: 'boolean',
            value: true,
            defaultValue: false,
            required: false,
            sensitive: false,
            restartRequired: false,
            lastModified: '3 days ago',
            modifiedBy: 'David Rodriguez'
        },
        {
            id: '4',
            category: 'authentication',
            name: 'Allowed Auth Providers',
            description: 'Enabled authentication providers',
            type: 'multiselect',
            value: ['local', 'google', 'microsoft'],
            defaultValue: ['local'],
            options: [
                { label: 'Local Database', value: 'local' },
                { label: 'Google OAuth', value: 'google' },
                { label: 'Microsoft Azure AD', value: 'microsoft' },
                { label: 'GitHub OAuth', value: 'github' },
                { label: 'SAML SSO', value: 'saml' },
                { label: 'LDAP/Active Directory', value: 'ldap' }
            ],
            required: true,
            sensitive: false,
            restartRequired: true,
            lastModified: '1 day ago',
            modifiedBy: 'Alice Johnson'
        },
        {
            id: '5',
            category: 'security',
            name: 'Password Policy',
            description: 'Password complexity requirements',
            type: 'json',
            value: {
                minLength: 12,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSymbols: true,
                maxAge: 90
            },
            defaultValue: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: false,
                requireSymbols: false,
                maxAge: 365
            },
            required: true,
            sensitive: false,
            restartRequired: false,
            lastModified: '5 days ago',
            modifiedBy: 'Security Team'
        },
        {
            id: '6',
            category: 'security',
            name: 'Rate Limiting',
            description: 'API and login rate limiting configuration',
            type: 'json',
            value: {
                loginAttempts: 5,
                loginWindow: 15,
                apiRequests: 1000,
                apiWindow: 60
            },
            defaultValue: {
                loginAttempts: 3,
                loginWindow: 15,
                apiRequests: 100,
                apiWindow: 60
            },
            required: true,
            sensitive: false,
            restartRequired: true,
            lastModified: '2 weeks ago',
            modifiedBy: 'DevOps Team'
        }
    ];

    const serviceConfigurations: ServiceConfiguration[] = [
        {
            id: 'auth-service',
            name: 'Authentication Service',
            status: 'running',
            version: '2.1.0',
            description: 'Core authentication and authorization service',
            port: 4004,
            health: 'healthy',
            uptime: '15 days, 3 hours',
            memoryUsage: 245,
            cpuUsage: 12,
            lastRestart: '15 days ago',
            autoStart: true,
            logLevel: 'info',
            configFile: '/etc/auth/config.yml'
        },
        {
            id: 'user-service',
            name: 'User Management Service',
            status: 'running',
            version: '1.8.2',
            description: 'User profile and management service',
            port: 4005,
            health: 'healthy',
            uptime: '12 days, 8 hours',
            memoryUsage: 189,
            cpuUsage: 8,
            lastRestart: '12 days ago',
            autoStart: true,
            logLevel: 'info',
            configFile: '/etc/users/config.yml'
        },
        {
            id: 'session-service',
            name: 'Session Management Service',
            status: 'running',
            version: '1.5.1',
            description: 'Session tracking and management service',
            port: 4006,
            health: 'warning',
            uptime: '8 days, 14 hours',
            memoryUsage: 312,
            cpuUsage: 18,
            lastRestart: '8 days ago',
            autoStart: true,
            logLevel: 'debug',
            configFile: '/etc/sessions/config.yml'
        },
        {
            id: 'audit-service',
            name: 'Audit Logging Service',
            status: 'running',
            version: '1.3.0',
            description: 'Audit trail and compliance logging service',
            port: 4007,
            health: 'healthy',
            uptime: '20 days, 1 hour',
            memoryUsage: 156,
            cpuUsage: 5,
            lastRestart: '20 days ago',
            autoStart: true,
            logLevel: 'info',
            configFile: '/etc/audit/config.yml'
        }
    ];

    const integrationConfigs: IntegrationConfig[] = [
        {
            id: 'google-oauth',
            name: 'Google OAuth 2.0',
            type: 'oauth',
            status: 'connected',
            description: 'Google authentication integration',
            provider: 'Google',
            lastSync: '5 minutes ago',
            nextSync: 'Real-time',
            errorCount: 0,
            totalRequests: 1245,
            successRate: 99.8,
            configuration: {
                clientId: 'google-client-id',
                scopes: ['openid', 'email', 'profile'],
                redirectUri: 'https://id.codai.io/auth/google/callback'
            }
        },
        {
            id: 'microsoft-azure',
            name: 'Microsoft Azure AD',
            type: 'oauth',
            status: 'connected',
            description: 'Microsoft Azure Active Directory integration',
            provider: 'Microsoft',
            lastSync: '2 minutes ago',
            nextSync: 'Real-time',
            errorCount: 2,
            totalRequests: 856,
            successRate: 99.5,
            configuration: {
                tenantId: 'azure-tenant-id',
                clientId: 'azure-client-id',
                scopes: ['openid', 'email', 'profile']
            }
        },
        {
            id: 'slack-webhook',
            name: 'Slack Notifications',
            type: 'webhook',
            status: 'connected',
            description: 'Slack webhook for security notifications',
            provider: 'Slack',
            lastSync: '1 hour ago',
            nextSync: 'Event-driven',
            errorCount: 0,
            totalRequests: 45,
            successRate: 100,
            configuration: {
                webhookUrl: 'https://hooks.slack.com/services/...',
                channel: '#security-alerts',
                events: ['login_failure', 'security_incident']
            }
        },
        {
            id: 'ldap-server',
            name: 'Corporate LDAP',
            type: 'ldap',
            status: 'disconnected',
            description: 'Corporate LDAP directory integration',
            provider: 'Active Directory',
            lastSync: '2 days ago',
            nextSync: 'Manual',
            errorCount: 5,
            totalRequests: 234,
            successRate: 87.2,
            configuration: {
                host: 'ldap.company.com',
                port: 389,
                baseDN: 'dc=company,dc=com',
                bindDN: 'cn=service,dc=company,dc=com'
            }
        }
    ];

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'general': return <Settings className="w-4 h-4" />;
            case 'authentication': return <Key className="w-4 h-4" />;
            case 'security': return <Shield className="w-4 h-4" />;
            case 'integrations': return <Link className="w-4 h-4" />;
            case 'notifications': return <Bell className="w-4 h-4" />;
            case 'backup': return <Archive className="w-4 h-4" />;
            case 'advanced': return <Cog className="w-4 h-4" />;
            default: return <Settings className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': case 'connected': case 'healthy':
                return 'bg-green-100 text-green-800';
            case 'stopped': case 'disconnected':
                return 'bg-gray-100 text-gray-800';
            case 'error': case 'unhealthy':
                return 'bg-red-100 text-red-800';
            case 'warning': case 'configuring':
                return 'bg-yellow-100 text-yellow-800';
            case 'starting': case 'stopping':
                return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'healthy': return <Check className="w-4 h-4 text-green-600" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'unhealthy': return <X className="w-4 h-4 text-red-600" />;
            default: return <Info className="w-4 h-4 text-gray-600" />;
        }
    };

    const renderSettingInput = (setting: SystemSetting) => {
        switch (setting.type) {
            case 'boolean':
                return (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={setting.value}
                            onChange={(e) => {
                                setting.value = e.target.checked;
                                setUnsavedChanges(true);
                            }}
                            className="rounded"
                        />
                    </div>
                );

            case 'string':
                return (
                    <input
                        type={setting.sensitive ? 'password' : 'text'}
                        value={setting.value}
                        onChange={(e) => {
                            setting.value = e.target.value;
                            setUnsavedChanges(true);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={setting.value}
                        onChange={(e) => {
                            setting.value = parseInt(e.target.value);
                            setUnsavedChanges(true);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                );

            case 'select':
                return (
                    <select
                        value={setting.value}
                        onChange={(e) => {
                            setting.value = e.target.value;
                            setUnsavedChanges(true);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {setting.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'multiselect':
                return (
                    <div className="space-y-2">
                        {setting.options?.map((option) => (
                            <label key={option.value} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={setting.value.includes(option.value)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setting.value = [...setting.value, option.value];
                                        } else {
                                            setting.value = setting.value.filter((v: any) => v !== option.value);
                                        }
                                        setUnsavedChanges(true);
                                    }}
                                    className="rounded"
                                />
                                <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'json':
                return (
                    <textarea
                        value={JSON.stringify(setting.value, null, 2)}
                        onChange={(e) => {
                            try {
                                setting.value = JSON.parse(e.target.value);
                                setUnsavedChanges(true);
                            } catch (error) {
                                // Invalid JSON, don't update
                            }
                        }}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                );

            default:
                return <div className="text-gray-500">Unsupported setting type</div>;
        }
    };

    const tabs = [
        { id: 'general', name: 'General Settings', icon: Settings },
        { id: 'services', name: 'Service Configuration', icon: Server },
        { id: 'integrations', name: 'Integrations', icon: Link },
        { id: 'backup', name: 'Backup & Restore', icon: Archive },
        { id: 'maintenance', name: 'System Maintenance', icon: Tool }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-600 mt-1">
                        Configure and manage your identity management system settings
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {unsavedChanges && (
                        <div className="flex items-center text-orange-600 text-sm">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Unsaved changes
                        </div>
                    )}
                    <button
                        onClick={() => setUnsavedChanges(false)}
                        disabled={!unsavedChanges}
                        className={`flex items-center px-4 py-2 rounded-lg ${unsavedChanges
                                ? 'text-white bg-blue-600 hover:bg-blue-700'
                                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            }`}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* General Settings Tab */}
            {activeTab === 'general' && (
                <div className="space-y-6">
                    {/* Settings by Category */}
                    {['general', 'authentication', 'security', 'notifications', 'advanced'].map((category) => {
                        const categorySettings = systemSettings.filter(s => s.category === category);
                        if (categorySettings.length === 0) return null;

                        return (
                            <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        {getCategoryIcon(category)}
                                        <h2 className="text-lg font-semibold text-gray-900 capitalize">
                                            {category.replace('_', ' ')} Settings
                                        </h2>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {categorySettings.map((setting) => (
                                        <div key={setting.id} className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 pr-6">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="text-sm font-medium text-gray-900">{setting.name}</h3>
                                                        {setting.required && (
                                                            <span className="text-red-500 text-xs">*</span>
                                                        )}
                                                        {setting.sensitive && (
                                                            <Lock className="w-3 h-3 text-gray-400" />
                                                        )}
                                                        {setting.restartRequired && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                                Restart Required
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                                                    <div className="text-xs text-gray-500">
                                                        Last modified {setting.lastModified} by {setting.modifiedBy}
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0 w-64">
                                                    {renderSettingInput(setting)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Service Configuration Tab */}
            {activeTab === 'services' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Service Status</h2>
                                <div className="flex items-center space-x-3">
                                    <button className="flex items-center px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                                        <RefreshCw className="w-4 h-4 mr-1" />
                                        Refresh
                                    </button>
                                    <button className="flex items-center px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Service
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {serviceConfigurations.map((service) => (
                                <div key={service.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                {getHealthIcon(service.health)}
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                                                    <p className="text-sm text-gray-600">{service.description}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                                                    {service.status}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Port {service.port} • v{service.version}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-sm text-gray-900">
                                                    {service.memoryUsage}MB • {service.cpuUsage}% CPU
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Uptime: {service.uptime}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedService(service);
                                                        setShowConfigModal(true);
                                                    }}
                                                    className="p-2 text-gray-600 hover:text-gray-800"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-600 hover:text-gray-800">
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-600 hover:text-gray-800">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Auto Start:</span>
                                            <span className="ml-2 text-gray-900">
                                                {service.autoStart ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Log Level:</span>
                                            <span className="ml-2 text-gray-900 capitalize">{service.logLevel}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Last Restart:</span>
                                            <span className="ml-2 text-gray-900">{service.lastRestart}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Config File:</span>
                                            <span className="ml-2 text-gray-900 font-mono text-xs">{service.configFile}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">External Integrations</h2>
                                <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Integration
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {integrationConfigs.map((integration) => (
                                <div key={integration.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                                                <p className="text-sm text-gray-600">{integration.description}</p>
                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                    <span>Provider: {integration.provider}</span>
                                                    <span>Type: {integration.type.replace('_', ' ').toUpperCase()}</span>
                                                    <span>Last sync: {integration.lastSync}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                                                    {integration.status}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {integration.successRate}% success rate
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-sm text-gray-900">
                                                    {integration.totalRequests.toLocaleString()} requests
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {integration.errorCount} errors
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button className="p-2 text-blue-600 hover:text-blue-800">
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-green-600 hover:text-green-800">
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-600 hover:text-gray-800">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Configuration Preview */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() => setActiveSection(activeSection === integration.id ? null : integration.id)}
                                            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                                        >
                                            {activeSection === integration.id ? (
                                                <ChevronDown className="w-4 h-4 mr-1" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 mr-1" />
                                            )}
                                            View Configuration
                                        </button>

                                        {activeSection === integration.id && (
                                            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                                <pre className="text-sm text-gray-700 overflow-x-auto">
                                                    {JSON.stringify(integration.configuration, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Backup & Restore Tab */}
            {activeTab === 'backup' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Backup Configuration */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Backup Configuration</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Schedule</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="daily">Daily at 2:00 AM</option>
                                        <option value="weekly">Weekly on Sunday</option>
                                        <option value="monthly">Monthly on 1st</option>
                                        <option value="manual">Manual only</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Retention Policy</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="7">Keep 7 backups</option>
                                        <option value="30">Keep 30 backups</option>
                                        <option value="90">Keep 90 backups</option>
                                        <option value="365">Keep 1 year</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Storage Location</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" name="storage" value="local" defaultChecked className="rounded" />
                                            <span className="text-sm text-gray-700">Local Storage</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" name="storage" value="s3" className="rounded" />
                                            <span className="text-sm text-gray-700">Amazon S3</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" name="storage" value="azure" className="rounded" />
                                            <span className="text-sm text-gray-700">Azure Blob Storage</span>
                                        </label>
                                    </div>
                                </div>

                                <button className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                    Update Backup Settings
                                </button>
                            </div>
                        </div>

                        {/* Recent Backups */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Recent Backups</h2>
                                    <button className="flex items-center px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                                        <Download className="w-4 h-4 mr-1" />
                                        Create Backup
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {[
                                    { id: 1, date: '2025-08-06 02:00:00', size: '245 MB', status: 'Completed' },
                                    { id: 2, date: '2025-08-05 02:00:00', size: '243 MB', status: 'Completed' },
                                    { id: 3, date: '2025-08-04 02:00:00', size: '241 MB', status: 'Completed' },
                                    { id: 4, date: '2025-08-03 02:00:00', size: '239 MB', status: 'Completed' }
                                ].map((backup) => (
                                    <div key={backup.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">{backup.date}</div>
                                            <div className="text-sm text-gray-500">{backup.size}</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {backup.status}
                                            </span>
                                            <button className="p-1 text-gray-600 hover:text-gray-800">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Restore Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Restore from Backup</h2>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center space-x-4">
                                <input
                                    type="file"
                                    accept=".backup,.sql,.json"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <button className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Restore System
                                </button>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                ⚠️ Warning: Restoring from backup will overwrite all current data. This action cannot be undone.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* System Maintenance Tab */}
            {activeTab === 'maintenance' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* System Health */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Database Connection</span>
                                    <div className="flex items-center space-x-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-green-600">Connected</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Redis Cache</span>
                                    <div className="flex items-center space-x-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-green-600">Online</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">External APIs</span>
                                    <div className="flex items-center space-x-2">
                                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                        <span className="text-sm text-yellow-600">Partial</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">SSL Certificate</span>
                                    <div className="flex items-center space-x-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-green-600">Valid (45 days)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Maintenance Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Maintenance Actions</h2>
                            </div>

                            <div className="p-6 space-y-3">
                                <button className="w-full flex items-center justify-between px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <Database className="w-4 h-4 text-blue-600" />
                                        <span className="font-medium">Clean Database</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>

                                <button className="w-full flex items-center justify-between px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <RefreshCw className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">Clear Caches</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>

                                <button className="w-full flex items-center justify-between px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <Archive className="w-4 h-4 text-purple-600" />
                                        <span className="font-medium">Archive Old Logs</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>

                                <button className="w-full flex items-center justify-between px-4 py-3 text-left border border-red-300 rounded-lg hover:bg-red-50 text-red-600">
                                    <div className="flex items-center space-x-3">
                                        <RotateCw className="w-4 h-4" />
                                        <span className="font-medium">Restart System</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* System Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <div className="text-sm text-gray-500">System Version</div>
                                    <div className="text-lg font-medium text-gray-900">v2.1.0</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Uptime</div>
                                    <div className="text-lg font-medium text-gray-900">15 days, 3 hours</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Active Users</div>
                                    <div className="text-lg font-medium text-gray-900">1,247</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Database Size</div>
                                    <div className="text-lg font-medium text-gray-900">2.4 GB</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Configuration Modal */}
            {showConfigModal && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Configure {selectedService.name}
                                </h2>
                                <button
                                    onClick={() => setShowConfigModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Auto Start</label>
                                    <input
                                        type="checkbox"
                                        defaultChecked={selectedService.autoStart}
                                        className="rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                                    <select
                                        defaultValue={selectedService.logLevel}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="debug">Debug</option>
                                        <option value="info">Info</option>
                                        <option value="warn">Warning</option>
                                        <option value="error">Error</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Configuration File</label>
                                <textarea
                                    rows={12}
                                    defaultValue={`# ${selectedService.name} Configuration
port: ${selectedService.port}
logLevel: ${selectedService.logLevel}
autoStart: ${selectedService.autoStart}

# Additional configuration options would be loaded from:
# ${selectedService.configFile}`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfigModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowConfigModal(false)}
                                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
