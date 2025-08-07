'use client';

import React, { useState } from 'react';
import {
    Zap,
    Plus,
    Settings,
    ExternalLink,
    Check,
    X,
    AlertCircle,
    RefreshCw,
    Search,
    Filter,
    MoreVertical,
    Github,
    GitBranch,
    Mail,
    MessageSquare,
    Users,
    Calendar,
    FileText,
    Database,
    Cloud,
    Monitor,
    Shield,
    Key,
    Globe,
    Webhook,
    Code,
    Terminal,
    Package,
    Building,
    Briefcase,
    Activity,
    BarChart3,
    TrendingUp,
    Bell,
    Camera,
    Upload,
    Download,
    Link,
    Server,
    Network,
    HardDrive,
    Cpu,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Copy,
    Edit,
    Trash2,
    Star,
    Heart,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    Palette,
    Sun,
    Moon,
    Volume2,
    Smartphone,
    Laptop,
    Tablet,
    Wifi,
    Bluetooth,
    Usb,
    Headphones,
    Mic,
    Video,
    Image,
    Music,
    PlayCircle,
    PauseCircle,
    StopCircle,
    SkipForward,
    SkipBack,
    Repeat,
    Shuffle,
    VolumeX,
    Volume1,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    ChevronUp,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ArrowDown,
    Home,
    User,
    Folder,
    File,
    Save,
    Share,
    Print,
    Bookmark,
    Tag,
    Flag,
    MapPin,
    Navigation,
    Compass,
    Target,
    Crosshair,
    Move,
    RotateCcw,
    RotateCw,
    FlipHorizontal,
    FlipVertical,
    Maximize,
    Minimize,
    Square,
    Circle,
    Triangle,
    Hexagon,
    Octagon,
    Diamond,
    Pentagon,
    Workflow
} from 'lucide-react';

interface Integration {
    id: string;
    name: string;
    description: string;
    category: 'development' | 'communication' | 'productivity' | 'analytics' | 'security' | 'storage' | 'deployment' | 'monitoring';
    icon: any;
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    isPopular: boolean;
    isPremium: boolean;
    lastSync?: string;
    connectionDate?: string;
    settings?: {
        [key: string]: any;
    };
    webhooks?: {
        url: string;
        events: string[];
        status: 'active' | 'inactive';
    }[];
    apiKeys?: {
        id: string;
        name: string;
        key: string;
        permissions: string[];
        lastUsed?: string;
    }[];
}

interface IntegrationTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: any;
    isPopular: boolean;
    isPremium: boolean;
    configFields: {
        name: string;
        type: 'text' | 'password' | 'select' | 'checkbox' | 'url';
        label: string;
        required: boolean;
        options?: string[];
    }[];
}

export default function IntegrationsPage() {
    const [selectedTab, setSelectedTab] = useState('marketplace');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewIntegration, setShowNewIntegration] = useState(false);
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [showSettings, setShowSettings] = useState<string | null>(null);

    const [integrations, setIntegrations] = useState<Integration[]>([
        {
            id: '1',
            name: 'GitHub',
            description: 'Connect your repositories for seamless code management and CI/CD',
            category: 'development',
            icon: Github,
            status: 'connected',
            isPopular: true,
            isPremium: false,
            lastSync: '2 minutes ago',
            connectionDate: '2024-01-15',
            settings: {
                repositories: ['codai-project', 'web-app', 'api-service'],
                autoSync: true,
                webhookEnabled: true
            },
            webhooks: [
                {
                    url: 'https://api.codai.dev/webhooks/github',
                    events: ['push', 'pull_request', 'issues'],
                    status: 'active'
                }
            ],
            apiKeys: [
                {
                    id: 'gh_1',
                    name: 'Production Key',
                    key: 'ghp_***************************',
                    permissions: ['repo', 'workflow', 'read:org'],
                    lastUsed: '5 minutes ago'
                }
            ]
        },
        {
            id: '2',
            name: 'Slack',
            description: 'Get real-time notifications and collaborate with your team',
            category: 'communication',
            icon: MessageSquare,
            status: 'connected',
            isPopular: true,
            isPremium: false,
            lastSync: '10 minutes ago',
            connectionDate: '2024-01-10',
            settings: {
                channels: ['#general', '#development', '#alerts'],
                mentions: true,
                directMessages: true
            }
        },
        {
            id: '3',
            name: 'AWS',
            description: 'Deploy and manage your cloud infrastructure',
            category: 'deployment',
            icon: Cloud,
            status: 'connected',
            isPopular: true,
            isPremium: true,
            lastSync: '1 hour ago',
            connectionDate: '2024-01-05',
            settings: {
                region: 'us-west-2',
                services: ['EC2', 'S3', 'RDS', 'Lambda'],
                autoScale: true
            }
        },
        {
            id: '4',
            name: 'Google Analytics',
            description: 'Track and analyze your application usage and performance',
            category: 'analytics',
            icon: BarChart3,
            status: 'error',
            isPopular: true,
            isPremium: false,
            connectionDate: '2024-01-20'
        },
        {
            id: '5',
            name: 'Jira',
            description: 'Sync issues and track project progress',
            category: 'productivity',
            icon: Briefcase,
            status: 'disconnected',
            isPopular: false,
            isPremium: false
        },
        {
            id: '6',
            name: 'Docker Hub',
            description: 'Manage container images and automate deployments',
            category: 'deployment',
            icon: Package,
            status: 'pending',
            isPopular: false,
            isPremium: false
        }
    ]);

    const [availableIntegrations] = useState<IntegrationTemplate[]>([
        {
            id: 'discord',
            name: 'Discord',
            description: 'Send notifications to Discord channels',
            category: 'communication',
            icon: MessageSquare,
            isPopular: true,
            isPremium: false,
            configFields: [
                { name: 'webhookUrl', type: 'url', label: 'Webhook URL', required: true },
                { name: 'defaultChannel', type: 'text', label: 'Default Channel', required: false }
            ]
        },
        {
            id: 'vercel',
            name: 'Vercel',
            description: 'Deploy frontend applications automatically',
            category: 'deployment',
            icon: Globe,
            isPopular: true,
            isPremium: false,
            configFields: [
                { name: 'apiToken', type: 'password', label: 'API Token', required: true },
                { name: 'teamId', type: 'text', label: 'Team ID', required: false }
            ]
        },
        {
            id: 'datadog',
            name: 'Datadog',
            description: 'Monitor application performance and infrastructure',
            category: 'monitoring',
            icon: Activity,
            isPopular: true,
            isPremium: true,
            configFields: [
                { name: 'apiKey', type: 'password', label: 'API Key', required: true },
                { name: 'appKey', type: 'password', label: 'Application Key', required: true },
                { name: 'site', type: 'select', label: 'Site', required: true, options: ['datadoghq.com', 'datadoghq.eu', 'us3.datadoghq.com'] }
            ]
        },
        {
            id: 'stripe',
            name: 'Stripe',
            description: 'Handle payments and subscription management',
            category: 'productivity',
            icon: Database,
            isPopular: true,
            isPremium: true,
            configFields: [
                { name: 'publishableKey', type: 'text', label: 'Publishable Key', required: true },
                { name: 'secretKey', type: 'password', label: 'Secret Key', required: true },
                { name: 'webhookSecret', type: 'password', label: 'Webhook Secret', required: false }
            ]
        },
        {
            id: 'notion',
            name: 'Notion',
            description: 'Sync documentation and project notes',
            category: 'productivity',
            icon: FileText,
            isPopular: false,
            isPremium: false,
            configFields: [
                { name: 'apiToken', type: 'password', label: 'API Token', required: true },
                { name: 'databaseId', type: 'text', label: 'Database ID', required: false }
            ]
        },
        {
            id: 'sentry',
            name: 'Sentry',
            description: 'Track errors and performance issues',
            category: 'monitoring',
            icon: Shield,
            isPopular: true,
            isPremium: false,
            configFields: [
                { name: 'dsn', type: 'url', label: 'DSN', required: true },
                { name: 'environment', type: 'select', label: 'Environment', required: true, options: ['development', 'staging', 'production'] }
            ]
        }
    ]);

    const categories = [
        { id: 'all', name: 'All Categories', icon: Workflow },
        { id: 'development', name: 'Development', icon: Code },
        { id: 'communication', name: 'Communication', icon: MessageSquare },
        { id: 'productivity', name: 'Productivity', icon: Briefcase },
        { id: 'analytics', name: 'Analytics', icon: BarChart3 },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'storage', name: 'Storage', icon: Database },
        { id: 'deployment', name: 'Deployment', icon: Cloud },
        { id: 'monitoring', name: 'Monitoring', icon: Activity }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'text-green-600 bg-green-100';
            case 'disconnected': return 'text-gray-600 bg-gray-100';
            case 'error': return 'text-red-600 bg-red-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return <CheckCircle className="w-4 h-4" />;
            case 'disconnected': return <XCircle className="w-4 h-4" />;
            case 'error': return <AlertTriangle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const filteredIntegrations = integrations.filter(integration => {
        const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            integration.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredAvailableIntegrations = availableIntegrations.filter(integration => {
        const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            integration.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
        const notAlreadyConnected = !integrations.some(connected => connected.name.toLowerCase() === integration.name.toLowerCase());
        return matchesSearch && matchesCategory && notAlreadyConnected;
    });

    const integrationStats = {
        total: integrations.length,
        connected: integrations.filter(i => i.status === 'connected').length,
        errors: integrations.filter(i => i.status === 'error').length,
        pending: integrations.filter(i => i.status === 'pending').length
    };

    const toggleIntegrationStatus = (integrationId: string) => {
        setIntegrations(prev => prev.map(integration =>
            integration.id === integrationId
                ? {
                    ...integration,
                    status: integration.status === 'connected' ? 'disconnected' : 'connected',
                    lastSync: integration.status === 'disconnected' ? 'Just now' : undefined
                }
                : integration
        ));
    };

    const refreshIntegration = (integrationId: string) => {
        setIntegrations(prev => prev.map(integration =>
            integration.id === integrationId
                ? { ...integration, lastSync: 'Just now' }
                : integration
        ));
    };

    const removeIntegration = (integrationId: string) => {
        setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
                    <p className="text-gray-600 mt-1">
                        Connect your favorite tools and services to enhance your workflow
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowWebhookModal(true)}
                        className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Webhook className="w-4 h-4 mr-2" />
                        Webhooks
                    </button>
                    <button
                        onClick={() => setShowApiKeyModal(true)}
                        className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Key className="w-4 h-4 mr-2" />
                        API Keys
                    </button>
                    <button
                        onClick={() => setShowNewIntegration(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Integration
                    </button>
                </div>
            </div>

            {/* Integration Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{integrationStats.total}</div>
                            <div className="text-sm text-gray-500">Total Integrations</div>
                        </div>
                        <Zap className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-green-600">{integrationStats.connected}</div>
                            <div className="text-sm text-green-600">Connected</div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-red-600">{integrationStats.errors}</div>
                            <div className="text-sm text-red-600">Errors</div>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">{integrationStats.pending}</div>
                            <div className="text-sm text-yellow-600">Pending</div>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-64 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search integrations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Navigation */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Browse</h3>
                        </div>
                        <div className="p-2">
                            {[
                                { id: 'connected', name: 'My Integrations', icon: Zap },
                                { id: 'marketplace', name: 'Marketplace', icon: Globe },
                                { id: 'custom', name: 'Custom', icon: Code }
                            ].map((tab) => {
                                const TabIcon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedTab(tab.id)}
                                        className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${selectedTab === tab.id
                                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <TabIcon className="w-5 h-5 mr-3" />
                                        <span className="font-medium">{tab.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Categories</h3>
                        </div>
                        <div className="p-2">
                            {categories.map((category) => {
                                const CategoryIcon = category.icon;
                                const count = selectedTab === 'marketplace'
                                    ? filteredAvailableIntegrations.filter(i => category.id === 'all' || i.category === category.id).length
                                    : filteredIntegrations.filter(i => category.id === 'all' || i.category === category.id).length;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${selectedCategory === category.id
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <CategoryIcon className="w-4 h-4 mr-2" />
                                            <span className="text-sm">{category.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {selectedTab === 'connected' ? (
                        /* Connected Integrations */
                        <div className="space-y-4">
                            {filteredIntegrations.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                    <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
                                    <p className="text-gray-600 mb-4">
                                        {searchTerm
                                            ? "No integrations match your search criteria."
                                            : "Connect your first integration to get started."
                                        }
                                    </p>
                                    <button
                                        onClick={() => setSelectedTab('marketplace')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Browse Marketplace
                                    </button>
                                </div>
                            ) : (
                                filteredIntegrations.map((integration) => {
                                    const IntegrationIcon = integration.icon;
                                    return (
                                        <div key={integration.id} className="bg-white rounded-xl border border-gray-200 p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4">
                                                    <div className="p-3 bg-gray-100 rounded-lg">
                                                        <IntegrationIcon className="w-6 h-6 text-gray-700" />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                                                                {getStatusIcon(integration.status)}
                                                                <span className="ml-1 capitalize">{integration.status}</span>
                                                            </span>
                                                            {integration.isPopular && (
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
                                                                    Popular
                                                                </span>
                                                            )}
                                                            {integration.isPremium && (
                                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-medium rounded-full">
                                                                    Premium
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-gray-600 mb-3">{integration.description}</p>

                                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                            {integration.connectionDate && (
                                                                <span>Connected {integration.connectionDate}</span>
                                                            )}
                                                            {integration.lastSync && (
                                                                <span>Last sync: {integration.lastSync}</span>
                                                            )}
                                                            <span className="capitalize">{integration.category}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => refreshIntegration(integration.id)}
                                                        className="p-2 text-gray-400 hover:text-gray-600"
                                                        title="Refresh"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowSettings(showSettings === integration.id ? null : integration.id)}
                                                        className="p-2 text-gray-400 hover:text-gray-600"
                                                        title="Settings"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                    <ToggleSwitch
                                                        checked={integration.status === 'connected'}
                                                        onChange={() => toggleIntegrationStatus(integration.id)}
                                                    />
                                                    <button
                                                        onClick={() => removeIntegration(integration.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Settings Panel */}
                                            {showSettings === integration.id && integration.settings && (
                                                <div className="mt-6 pt-6 border-t border-gray-200">
                                                    <h4 className="font-medium text-gray-900 mb-4">Integration Settings</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {Object.entries(integration.settings).map(([key, value]) => (
                                                            <div key={key}>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                                </label>
                                                                {typeof value === 'boolean' ? (
                                                                    <ToggleSwitch checked={value} onChange={() => { }} />
                                                                ) : Array.isArray(value) ? (
                                                                    <div className="text-sm text-gray-600">
                                                                        {value.join(', ')}
                                                                    </div>
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        value={value}
                                                                        readOnly
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Webhooks */}
                                                    {integration.webhooks && integration.webhooks.length > 0 && (
                                                        <div className="mt-6">
                                                            <h5 className="font-medium text-gray-900 mb-3">Webhooks</h5>
                                                            <div className="space-y-2">
                                                                {integration.webhooks.map((webhook, index) => (
                                                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-900">{webhook.url}</div>
                                                                            <div className="text-xs text-gray-500">Events: {webhook.events.join(', ')}</div>
                                                                        </div>
                                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${webhook.status === 'active'
                                                                                ? 'bg-green-100 text-green-600'
                                                                                : 'bg-gray-100 text-gray-600'
                                                                            }`}>
                                                                            {webhook.status}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* API Keys */}
                                                    {integration.apiKeys && integration.apiKeys.length > 0 && (
                                                        <div className="mt-6">
                                                            <h5 className="font-medium text-gray-900 mb-3">API Keys</h5>
                                                            <div className="space-y-2">
                                                                {integration.apiKeys.map((apiKey) => (
                                                                    <div key={apiKey.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                                                                            <div className="text-xs text-gray-500">
                                                                                Permissions: {apiKey.permissions.join(', ')}
                                                                                {apiKey.lastUsed && ` • Last used: ${apiKey.lastUsed}`}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="text-xs text-gray-600">{apiKey.key}</span>
                                                                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                                                                <Copy className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : selectedTab === 'marketplace' ? (
                        /* Integration Marketplace */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAvailableIntegrations.map((integration) => {
                                const IntegrationIcon = integration.icon;
                                return (
                                    <div key={integration.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-gray-100 rounded-lg">
                                                <IntegrationIcon className="w-6 h-6 text-gray-700" />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {integration.isPopular && (
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
                                                        Popular
                                                    </span>
                                                )}
                                                {integration.isPremium && (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-medium rounded-full">
                                                        Premium
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{integration.description}</p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">
                                                {integration.category}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setSelectedIntegration(integration);
                                                    setShowNewIntegration(true);
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                            >
                                                Connect
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredAvailableIntegrations.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
                                    <p className="text-gray-600">
                                        No integrations match your search criteria or all available integrations are already connected.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Custom Integrations */
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Integrations</h3>
                            <p className="text-gray-600 mb-6">
                                Build your own integrations using our API and webhooks.
                            </p>
                            <div className="space-y-3">
                                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Create Custom Integration
                                </button>
                                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                    View API Documentation
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Integration Modal */}
            {showNewIntegration && selectedIntegration && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Connect {selectedIntegration.name}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowNewIntegration(false);
                                    setSelectedIntegration(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <selectedIntegration.icon className="w-5 h-5 text-gray-700" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{selectedIntegration.name}</h4>
                                    <p className="text-sm text-gray-600">{selectedIntegration.description}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedIntegration.configFields.map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {field.type === 'select' ? (
                                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                                <option value="">Select {field.label}</option>
                                                {field.options?.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        ) : field.type === 'checkbox' ? (
                                            <label className="flex items-center">
                                                <input type="checkbox" className="mr-2" />
                                                <span className="text-sm text-gray-600">Enable {field.label}</span>
                                            </label>
                                        ) : (
                                            <input
                                                type={field.type}
                                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowNewIntegration(false);
                                    setSelectedIntegration(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Connect Integration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Webhook Management Modal */}
            {showWebhookModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Webhook Management</h3>
                            <button
                                onClick={() => setShowWebhookModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900">Active Webhooks</h4>
                                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                        Add Webhook
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {integrations.flatMap(integration =>
                                        integration.webhooks?.map((webhook, index) => (
                                            <div key={`${integration.id}-${index}`} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium text-gray-900">{integration.name}</span>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${webhook.status === 'active'
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {webhook.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-gray-400 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600 mb-1">{webhook.url}</div>
                                                <div className="text-xs text-gray-500">Events: {webhook.events.join(', ')}</div>
                                            </div>
                                        )) || []
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* API Key Management Modal */}
            {showApiKeyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">API Key Management</h3>
                            <button
                                onClick={() => setShowApiKeyModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900">API Keys</h4>
                                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                        Generate Key
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {integrations.flatMap(integration =>
                                        integration.apiKeys?.map((apiKey) => (
                                            <div key={apiKey.id} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium text-gray-900">{integration.name}</span>
                                                        <span className="text-sm text-gray-600">- {apiKey.name}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-gray-400 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600 mb-1">{apiKey.key}</div>
                                                <div className="text-xs text-gray-500">
                                                    Permissions: {apiKey.permissions.join(', ')}
                                                    {apiKey.lastUsed && ` • Last used: ${apiKey.lastUsed}`}
                                                </div>
                                            </div>
                                        )) || []
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
