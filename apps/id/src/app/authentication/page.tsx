'use client';

import React, { useState } from 'react';
import {
    Shield,
    Key,
    Smartphone,
    QrCode,
    Settings,
    Users,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Clock,
    Globe,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RotateCcw,
    Plus,
    Edit3,
    Trash2,
    Copy,
    Download,
    Upload,
    Filter,
    Search,
    Calendar,
    MapPin,
    Monitor,
    Tablet,
    ExternalLink,
    RefreshCw,
    MoreVertical,
    Zap,
    Database,
    Cloud,
    Server,
    Wifi,
    WifiOff,
    Activity,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Info,
    Bell,
    User
} from 'lucide-react';

interface AuthProvider {
    id: string;
    name: string;
    type: 'oauth' | 'saml' | 'ldap' | 'openid';
    icon: string;
    status: 'active' | 'inactive' | 'error';
    users: number;
    lastSync: string;
    config: {
        clientId?: string;
        domain?: string;
        endpoints?: string[];
    };
}

interface AuthMethod {
    id: string;
    name: string;
    type: 'password' | 'mfa' | 'biometric' | 'sso' | 'api_key';
    enabled: boolean;
    users: number;
    successRate: number;
    lastUsed: string;
}

interface AuthSession {
    id: string;
    user: string;
    provider: string;
    device: string;
    location: string;
    startTime: string;
    lastActivity: string;
    status: 'active' | 'expired' | 'revoked';
    ipAddress: string;
}

export default function AuthenticationPage() {
    const [activeTab, setActiveTab] = useState('providers');
    const [selectedProvider, setSelectedProvider] = useState<AuthProvider | null>(null);
    const [showAddProvider, setShowAddProvider] = useState(false);

    const authProviders: AuthProvider[] = [
        {
            id: '1',
            name: 'Google OAuth 2.0',
            type: 'oauth',
            icon: '🔵',
            status: 'active',
            users: 45230,
            lastSync: '2 minutes ago',
            config: {
                clientId: 'google-oauth-client-id',
                endpoints: ['https://accounts.google.com/oauth2/v2/auth', 'https://oauth2.googleapis.com/token']
            }
        },
        {
            id: '2',
            name: 'Microsoft Azure AD',
            type: 'oauth',
            icon: '🟦',
            status: 'active',
            users: 23451,
            lastSync: '5 minutes ago',
            config: {
                clientId: 'azure-ad-client-id',
                domain: 'company.onmicrosoft.com'
            }
        },
        {
            id: '3',
            name: 'LDAP Directory',
            type: 'ldap',
            icon: '📁',
            status: 'active',
            users: 18923,
            lastSync: '1 hour ago',
            config: {
                domain: 'ldap.company.com',
                endpoints: ['ldap://ldap.company.com:389']
            }
        },
        {
            id: '4',
            name: 'SAML Enterprise',
            type: 'saml',
            icon: '🏢',
            status: 'inactive',
            users: 0,
            lastSync: 'Never',
            config: {
                endpoints: ['https://sso.company.com/saml2']
            }
        },
        {
            id: '5',
            name: 'GitHub OAuth',
            type: 'oauth',
            icon: '⚫',
            status: 'error',
            users: 12034,
            lastSync: 'Failed 30 minutes ago',
            config: {
                clientId: 'github-oauth-client-id'
            }
        }
    ];

    const authMethods: AuthMethod[] = [
        {
            id: '1',
            name: 'Password Authentication',
            type: 'password',
            enabled: true,
            users: 89341,
            successRate: 96.7,
            lastUsed: '1 minute ago'
        },
        {
            id: '2',
            name: 'Multi-Factor Authentication',
            type: 'mfa',
            enabled: true,
            users: 67892,
            successRate: 99.2,
            lastUsed: '3 minutes ago'
        },
        {
            id: '3',
            name: 'Biometric Authentication',
            type: 'biometric',
            enabled: true,
            users: 23451,
            successRate: 98.9,
            lastUsed: '15 minutes ago'
        },
        {
            id: '4',
            name: 'Single Sign-On',
            type: 'sso',
            enabled: true,
            users: 45230,
            successRate: 97.8,
            lastUsed: '2 minutes ago'
        },
        {
            id: '5',
            name: 'API Key Authentication',
            type: 'api_key',
            enabled: true,
            users: 12034,
            successRate: 99.8,
            lastUsed: '5 minutes ago'
        }
    ];

    const authSessions: AuthSession[] = [
        {
            id: '1',
            user: 'john.doe@company.com',
            provider: 'Google OAuth 2.0',
            device: 'Chrome on Windows',
            location: 'San Francisco, CA',
            startTime: '2 hours ago',
            lastActivity: '5 minutes ago',
            status: 'active',
            ipAddress: '192.168.1.100'
        },
        {
            id: '2',
            user: 'alice.smith@company.com',
            provider: 'Microsoft Azure AD',
            device: 'Safari on iPhone',
            location: 'New York, NY',
            startTime: '4 hours ago',
            lastActivity: '15 minutes ago',
            status: 'active',
            ipAddress: '10.0.0.50'
        },
        {
            id: '3',
            user: 'bob.wilson@company.com',
            provider: 'LDAP Directory',
            device: 'Firefox on MacOS',
            location: 'London, UK',
            startTime: '1 day ago',
            lastActivity: '2 hours ago',
            status: 'expired',
            ipAddress: '172.16.0.25'
        },
        {
            id: '4',
            user: 'sarah.jones@company.com',
            provider: 'Google OAuth 2.0',
            device: 'Chrome on Android',
            location: 'Tokyo, Japan',
            startTime: '3 hours ago',
            lastActivity: '1 hour ago',
            status: 'active',
            ipAddress: '192.168.2.75'
        },
        {
            id: '5',
            user: 'mike.brown@company.com',
            provider: 'GitHub OAuth',
            device: 'Edge on Windows',
            location: 'Sydney, Australia',
            startTime: '6 hours ago',
            lastActivity: '3 hours ago',
            status: 'revoked',
            ipAddress: '10.1.1.200'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'error': return 'bg-red-100 text-red-800';
            case 'expired': return 'bg-yellow-100 text-yellow-800';
            case 'revoked': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getMethodIcon = (type: string) => {
        switch (type) {
            case 'password': return <Key className="w-5 h-5 text-blue-600" />;
            case 'mfa': return <Smartphone className="w-5 h-5 text-green-600" />;
            case 'biometric': return <Eye className="w-5 h-5 text-purple-600" />;
            case 'sso': return <Globe className="w-5 h-5 text-indigo-600" />;
            case 'api_key': return <Database className="w-5 h-5 text-orange-600" />;
            default: return <Shield className="w-5 h-5 text-gray-600" />;
        }
    };

    const getDeviceIcon = (device: string) => {
        if (device.includes('iPhone') || device.includes('Android')) return <Smartphone className="w-4 h-4" />;
        if (device.includes('iPad') || device.includes('Tablet')) return <Tablet className="w-4 h-4" />;
        return <Monitor className="w-4 h-4" />;
    };

    const tabs = [
        { id: 'providers', name: 'Auth Providers', icon: Shield },
        { id: 'methods', name: 'Auth Methods', icon: Key },
        { id: 'sessions', name: 'Active Sessions', icon: Clock },
        { id: 'policies', name: 'Security Policies', icon: Lock },
        { id: 'analytics', name: 'Auth Analytics', icon: BarChart3 }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Authentication Management</h1>
                    <p className="text-gray-600 mt-1">
                        Configure and monitor authentication providers, methods, and policies
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync All
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Provider
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

            {/* Auth Providers Tab */}
            {activeTab === 'providers' && (
                <div className="space-y-6">
                    {/* Provider Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{authProviders.length}</div>
                                    <div className="text-sm text-gray-500">Total Providers</div>
                                </div>
                                <Shield className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {authProviders.filter(p => p.status === 'active').length}
                                    </div>
                                    <div className="text-sm text-gray-500">Active Providers</div>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {authProviders.reduce((sum, p) => sum + p.users, 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Users</div>
                                </div>
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {authProviders.filter(p => p.status === 'error').length}
                                    </div>
                                    <div className="text-sm text-gray-500">Failed Providers</div>
                                </div>
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Providers List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Authentication Providers</h2>
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search providers..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button className="flex items-center px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Filter className="w-4 h-4 mr-2" />
                                        Filter
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {authProviders.map((provider) => (
                                <div key={provider.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-2xl">{provider.icon}</div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                                                        {provider.status}
                                                    </span>
                                                    <span className="text-sm text-gray-500 capitalize">{provider.type}</span>
                                                    <span className="text-sm text-gray-500">{provider.users.toLocaleString()} users</span>
                                                    <span className="text-sm text-gray-500">Last sync: {provider.lastSync}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setSelectedProvider(provider)}
                                                className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                            >
                                                Configure
                                            </button>
                                            <button className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                                                Test
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {provider.config && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Configuration</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                {provider.config.clientId && (
                                                    <div>
                                                        <span className="text-gray-500">Client ID:</span>
                                                        <span className="ml-2 font-mono text-gray-900">{provider.config.clientId}</span>
                                                    </div>
                                                )}
                                                {provider.config.domain && (
                                                    <div>
                                                        <span className="text-gray-500">Domain:</span>
                                                        <span className="ml-2 font-mono text-gray-900">{provider.config.domain}</span>
                                                    </div>
                                                )}
                                                {provider.config.endpoints && (
                                                    <div className="col-span-2">
                                                        <span className="text-gray-500">Endpoints:</span>
                                                        <div className="mt-1">
                                                            {provider.config.endpoints.map((endpoint, index) => (
                                                                <div key={index} className="font-mono text-gray-900 text-xs bg-white px-2 py-1 rounded border">
                                                                    {endpoint}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Auth Methods Tab */}
            {activeTab === 'methods' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {authMethods.map((method) => (
                            <div key={method.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        {getMethodIcon(method.type)}
                                        <h3 className="text-lg font-medium text-gray-900">{method.name}</h3>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${method.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Active Users</span>
                                        <span className="text-sm font-medium text-gray-900">{method.users.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Success Rate</span>
                                        <span className="text-sm font-medium text-gray-900">{method.successRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Last Used</span>
                                        <span className="text-sm font-medium text-gray-900">{method.lastUsed}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Status</span>
                                        <button className={`px-3 py-1 rounded-full text-xs font-medium ${method.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {method.enabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 flex space-x-2">
                                    <button className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm">
                                        Configure
                                    </button>
                                    <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Active Authentication Sessions</h2>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">
                                        {authSessions.filter(s => s.status === 'active').length} active sessions
                                    </span>
                                    <button className="flex items-center px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Revoke All
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {authSessions.map((session) => (
                                <div key={session.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                {getDeviceIcon(session.device)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{session.user}</h3>
                                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                    <span>{session.provider}</span>
                                                    <span>•</span>
                                                    <span>{session.device}</span>
                                                    <span>•</span>
                                                    <div className="flex items-center">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {session.location}
                                                    </div>
                                                    <span>•</span>
                                                    <span>{session.ipAddress}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                                    {session.status}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Started {session.startTime}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Last active {session.lastActivity}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {session.status === 'active' && (
                                                    <button className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50">
                                                        Revoke
                                                    </button>
                                                )}
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Security Policies Tab */}
            {activeTab === 'policies' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Policy</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Minimum Length</span>
                                    <span className="text-sm font-medium">8 characters</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Require Uppercase</span>
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Require Numbers</span>
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Require Symbols</span>
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Password Expiry</span>
                                    <span className="text-sm font-medium">90 days</span>
                                </div>
                            </div>
                            <button className="mt-4 w-full px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                                Edit Policy
                            </button>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Policy</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Session Timeout</span>
                                    <span className="text-sm font-medium">30 minutes</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Max Concurrent Sessions</span>
                                    <span className="text-sm font-medium">3 devices</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Remember Me Duration</span>
                                    <span className="text-sm font-medium">30 days</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Force Logout on IP Change</span>
                                    <XCircle className="w-4 h-4 text-red-600" />
                                </div>
                            </div>
                            <button className="mt-4 w-full px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                                Edit Policy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Auth Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">98.7%</div>
                                    <div className="text-sm text-gray-500">Success Rate</div>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">12,543</div>
                                    <div className="text-sm text-gray-500">Daily Logins</div>
                                </div>
                                <Activity className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">89</div>
                                    <div className="text-sm text-gray-500">Failed Attempts</div>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">24m 15s</div>
                                    <div className="text-sm text-gray-500">Avg Session</div>
                                </div>
                                <Clock className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Trends</h2>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>Authentication analytics chart would be rendered here</p>
                                <p className="text-sm">Integration with charting library required</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
