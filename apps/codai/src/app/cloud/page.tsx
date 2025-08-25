'use client';

import React, { useState } from 'react';
import {
    Cloud,
    Server,
    Globe,
    Settings,
    Monitor,
    Activity,
    Zap,
    Shield,
    Database,
    HardDrive,
    Cpu,
    Wifi,
    Upload,
    Download,
    Play,
    Pause,
    Square,
    RotateCcw,
    Trash2,
    Edit,
    Copy,
    ExternalLink,
    Plus,
    Search,
    Filter,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Clock,
    Circle,
    Calendar,
    Users,
    Tag,
    MapPin,
    Target,
    Layers,
    Box,
    Package,
    Route,
    Network,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Terminal,
    FileText,
    Code,
    GitBranch,
    Workflow,
    Gauge,
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    ArrowUp,
    ArrowDown,
    DollarSign,
    CreditCard,
    Wallet,
    Receipt,
    Calculator,
    Percent,
    MoreHorizontal,
    Power,
    PowerOff,
    Maximize,
    Minimize,
    Volume2,
    VolumeX,
    Link,
    Unlink,
    Anchor,
    Compass,
    Navigation,
    Smartphone,
    Monitor as MonitorIcon,
    Tablet,
    Archive,
    FolderOpen,
    Save,
    Import,
    Building,
    Building2,
    Briefcase,
    Factory,
    Warehouse,
    Home,
    MapIcon
} from 'lucide-react';

interface CloudProvider {
    id: string;
    name: string;
    type: 'aws' | 'azure' | 'gcp' | 'digitalocean' | 'vercel' | 'netlify';
    connected: boolean;
    regions: string[];
    services: CloudService[];
    billing: {
        current: number;
        projected: number;
        lastMonth: number;
    };
    limits: {
        compute: { used: number; total: number };
        storage: { used: number; total: number };
        bandwidth: { used: number; total: number };
    };
}

interface CloudService {
    id: string;
    name: string;
    type: 'compute' | 'database' | 'storage' | 'cdn' | 'function' | 'container' | 'monitoring';
    status: 'running' | 'stopped' | 'deploying' | 'error' | 'scaling';
    region: string;
    url?: string;
    environment: 'production' | 'staging' | 'development';
    resources: {
        cpu: string;
        memory: string;
        storage: string;
    };
    cost: {
        hourly: number;
        monthly: number;
    };
    metrics: {
        uptime: number;
        responseTime: number;
        requests: number;
        errors: number;
    };
    lastDeployed: Date;
    version: string;
}

interface Deployment {
    id: string;
    name: string;
    service: string;
    environment: 'production' | 'staging' | 'development';
    status: 'success' | 'failed' | 'in-progress' | 'queued';
    provider: string;
    region: string;
    startTime: Date;
    duration?: number;
    version: string;
    branch: string;
    commit: string;
    logs: string[];
    rollbackAvailable: boolean;
}

const mockProviders: CloudProvider[] = [
    {
        id: 'aws',
        name: 'Amazon Web Services',
        type: 'aws',
        connected: true,
        regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
        services: [],
        billing: { current: 234.56, projected: 289.12, lastMonth: 198.43 },
        limits: {
            compute: { used: 12, total: 20 },
            storage: { used: 2.4, total: 10 },
            bandwidth: { used: 567, total: 1000 }
        }
    },
    {
        id: 'vercel',
        name: 'Vercel',
        type: 'vercel',
        connected: true,
        regions: ['iad1', 'sfo1', 'fra1', 'sin1'],
        services: [],
        billing: { current: 45.00, projected: 50.00, lastMonth: 38.75 },
        limits: {
            compute: { used: 5, total: 10 },
            storage: { used: 0.8, total: 5 },
            bandwidth: { used: 89, total: 100 }
        }
    },
    {
        id: 'azure',
        name: 'Microsoft Azure',
        type: 'azure',
        connected: false,
        regions: ['eastus', 'westus2', 'westeurope', 'southeastasia'],
        services: [],
        billing: { current: 0, projected: 0, lastMonth: 0 },
        limits: {
            compute: { used: 0, total: 0 },
            storage: { used: 0, total: 0 },
            bandwidth: { used: 0, total: 0 }
        }
    }
];

const mockServices: CloudService[] = [
    {
        id: 'svc_1',
        name: 'CODAI API Production',
        type: 'compute',
        status: 'running',
        region: 'us-east-1',
        url: 'https://api.codai.dev',
        environment: 'production',
        resources: { cpu: '2 vCPU', memory: '4GB', storage: '20GB SSD' },
        cost: { hourly: 0.234, monthly: 169.00 },
        metrics: { uptime: 99.98, responseTime: 145, requests: 125000, errors: 23 },
        lastDeployed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        version: 'v1.2.3'
    },
    {
        id: 'svc_2',
        name: 'CODAI Frontend',
        type: 'function',
        status: 'running',
        region: 'iad1',
        url: 'https://codai.dev',
        environment: 'production',
        resources: { cpu: 'Serverless', memory: '1GB', storage: '5GB' },
        cost: { hourly: 0.045, monthly: 32.40 },
        metrics: { uptime: 99.99, responseTime: 89, requests: 89000, errors: 5 },
        lastDeployed: new Date(Date.now() - 6 * 60 * 60 * 1000),
        version: 'v2.1.0'
    },
    {
        id: 'svc_3',
        name: 'PostgreSQL Database',
        type: 'database',
        status: 'running',
        region: 'us-east-1',
        environment: 'production',
        resources: { cpu: '2 vCPU', memory: '8GB', storage: '100GB SSD' },
        cost: { hourly: 0.456, monthly: 329.00 },
        metrics: { uptime: 99.95, responseTime: 12, requests: 250000, errors: 8 },
        lastDeployed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        version: 'PostgreSQL 15'
    },
    {
        id: 'svc_4',
        name: 'Redis Cache',
        type: 'database',
        status: 'running',
        region: 'us-east-1',
        environment: 'production',
        resources: { cpu: '1 vCPU', memory: '2GB', storage: '10GB' },
        cost: { hourly: 0.089, monthly: 64.00 },
        metrics: { uptime: 99.97, responseTime: 3, requests: 500000, errors: 2 },
        lastDeployed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        version: 'Redis 7.0'
    },
    {
        id: 'svc_5',
        name: 'File Storage CDN',
        type: 'cdn',
        status: 'running',
        region: 'global',
        url: 'https://cdn.codai.dev',
        environment: 'production',
        resources: { cpu: 'Edge', memory: 'N/A', storage: '500GB' },
        cost: { hourly: 0.023, monthly: 16.50 },
        metrics: { uptime: 99.99, responseTime: 34, requests: 750000, errors: 12 },
        lastDeployed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        version: 'v1.0.0'
    },
    {
        id: 'svc_6',
        name: 'Staging Environment',
        type: 'compute',
        status: 'stopped',
        region: 'us-west-2',
        url: 'https://staging.codai.dev',
        environment: 'staging',
        resources: { cpu: '1 vCPU', memory: '2GB', storage: '10GB SSD' },
        cost: { hourly: 0.089, monthly: 64.00 },
        metrics: { uptime: 0, responseTime: 0, requests: 0, errors: 0 },
        lastDeployed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        version: 'v1.3.0-beta'
    }
];

const mockDeployments: Deployment[] = [
    {
        id: 'dep_1',
        name: 'CODAI Frontend v2.1.0',
        service: 'CODAI Frontend',
        environment: 'production',
        status: 'success',
        provider: 'Vercel',
        region: 'iad1',
        startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        duration: 145,
        version: 'v2.1.0',
        branch: 'main',
        commit: 'a1b2c3d',
        logs: ['Building application...', 'Running tests...', 'Deploying to production...', 'Deployment successful'],
        rollbackAvailable: true
    },
    {
        id: 'dep_2',
        name: 'CODAI API v1.2.3',
        service: 'CODAI API Production',
        environment: 'production',
        status: 'success',
        provider: 'AWS',
        region: 'us-east-1',
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        duration: 324,
        version: 'v1.2.3',
        branch: 'release',
        commit: 'e4f5g6h',
        logs: ['Starting deployment...', 'Building Docker image...', 'Updating ECS service...', 'Health checks passed'],
        rollbackAvailable: true
    },
    {
        id: 'dep_3',
        name: 'CODAI API v1.3.0-beta',
        service: 'Staging Environment',
        environment: 'staging',
        status: 'failed',
        provider: 'AWS',
        region: 'us-west-2',
        startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
        duration: 89,
        version: 'v1.3.0-beta',
        branch: 'develop',
        commit: 'i7j8k9l',
        logs: ['Starting deployment...', 'Building Docker image...', 'Error: Build failed due to dependency issues'],
        rollbackAvailable: false
    },
    {
        id: 'dep_4',
        name: 'Database Migration',
        service: 'PostgreSQL Database',
        environment: 'production',
        status: 'in-progress',
        provider: 'AWS',
        region: 'us-east-1',
        startTime: new Date(Date.now() - 15 * 60 * 1000),
        version: 'v1.2.4',
        branch: 'main',
        commit: 'm1n2o3p',
        logs: ['Starting migration...', 'Backing up database...', 'Running migration scripts...'],
        rollbackAvailable: false
    }
];

export default function CloudPage() {
    const [selectedTab, setSelectedTab] = useState('overview');
    const [selectedProvider, setSelectedProvider] = useState<string>('all');
    const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const getProviderIcon = (type: string) => {
        switch (type) {
            case 'aws': return <Building className="w-5 h-5 text-orange-600" />;
            case 'azure': return <Building2 className="w-5 h-5 text-blue-600" />;
            case 'gcp': return <Factory className="w-5 h-5 text-green-600" />;
            case 'vercel': return <Zap className="w-5 h-5 text-black" />;
            case 'netlify': return <Globe className="w-5 h-5 text-teal-600" />;
            case 'digitalocean': return <Cloud className="w-5 h-5 text-blue-500" />;
            default: return <Server className="w-5 h-5 text-gray-600" />;
        }
    };

    const getServiceTypeIcon = (type: string) => {
        switch (type) {
            case 'compute': return <Server className="w-4 h-4 text-blue-600" />;
            case 'database': return <Database className="w-4 h-4 text-green-600" />;
            case 'storage': return <HardDrive className="w-4 h-4 text-purple-600" />;
            case 'cdn': return <Globe className="w-4 h-4 text-orange-600" />;
            case 'function': return <Zap className="w-4 h-4 text-yellow-600" />;
            case 'container': return <Box className="w-4 h-4 text-red-600" />;
            case 'monitoring': return <Monitor className="w-4 h-4 text-gray-600" />;
            default: return <Cloud className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <Play className="w-4 h-4 text-green-600" />;
            case 'stopped': return <Square className="w-4 h-4 text-gray-600" />;
            case 'deploying': return <Upload className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'scaling': return <TrendingUp className="w-4 h-4 text-purple-600" />;
            case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'in-progress': return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'queued': return <Clock className="w-4 h-4 text-yellow-600" />;
            default: return <Circle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running':
            case 'success':
                return 'text-green-600 bg-green-100 border-green-200';
            case 'stopped':
                return 'text-gray-600 bg-gray-100 border-gray-200';
            case 'deploying':
            case 'scaling':
            case 'in-progress':
                return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'error':
            case 'failed':
                return 'text-red-600 bg-red-100 border-red-200';
            case 'queued':
                return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getEnvironmentColor = (env: string) => {
        switch (env) {
            case 'production': return 'text-red-600 bg-red-100 border-red-200';
            case 'staging': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'development': return 'text-green-600 bg-green-100 border-green-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const connectedProviders = mockProviders.filter(p => p.connected);
    const totalMonthlySpend = connectedProviders.reduce((sum, p) => sum + p.billing.current, 0);
    const totalServices = mockServices.length;
    const runningServices = mockServices.filter(s => s.status === 'running').length;
    const recentDeployments = mockDeployments.slice(0, 3);

    return (
        <div className="min-h-screen bg-gray-50 ml-80">
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Cloud Deployment</h1>
                            <p className="text-gray-600 mt-2">Manage cloud services, deployments, and infrastructure across providers</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className="text-sm text-gray-600">
                                    {autoRefresh ? 'Auto-refresh' : 'Paused'}
                                </span>
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                            </div>
                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Plus className="w-4 h-4" />
                                <span>Deploy</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <Cloud className="w-8 h-8 text-blue-600" />
                            <span className="text-green-600 text-sm font-medium">+1</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{connectedProviders.length}</p>
                        <p className="text-gray-600 text-sm">Cloud Providers</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <Server className="w-8 h-8 text-green-600" />
                            <span className="text-blue-600 text-sm font-medium">{runningServices}/{totalServices}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{runningServices}</p>
                        <p className="text-gray-600 text-sm">Running Services</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="w-8 h-8 text-purple-600" />
                            <span className="text-yellow-600 text-sm font-medium">+15%</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">${totalMonthlySpend.toFixed(2)}</p>
                        <p className="text-gray-600 text-sm">Monthly Spend</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <Upload className="w-8 h-8 text-orange-600" />
                            <span className="text-green-600 text-sm font-medium">+5</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{mockDeployments.length}</p>
                        <p className="text-gray-600 text-sm">Deployments Today</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <Gauge className="w-8 h-8 text-red-600" />
                            <span className="text-green-600 text-sm font-medium">99.9%</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">99.97%</p>
                        <p className="text-gray-600 text-sm">Global Uptime</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'services', label: 'Services', icon: Server },
                        { id: 'deployments', label: 'Deployments', icon: Upload },
                        { id: 'providers', label: 'Providers', icon: Cloud },
                        { id: 'monitoring', label: 'Monitoring', icon: Monitor }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === tab.id
                                ? 'bg-white text-blue-600 shadow'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {selectedTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Recent Deployments */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Deployments</h3>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all</button>
                                </div>

                                <div className="space-y-4">
                                    {recentDeployments.map((deployment) => (
                                        <div key={deployment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(deployment.status)}
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deployment.status)}`}>
                                                        {deployment.status}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{deployment.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {deployment.provider} • {deployment.region} • {deployment.branch}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-900">
                                                    {deployment.duration ? `${deployment.duration}s` : 'Running...'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {deployment.startTime.toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Service Health */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Health</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mockServices.filter(s => s.environment === 'production').map((service) => (
                                        <div key={service.id} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    {getServiceTypeIcon(service.type)}
                                                    <span className="font-medium text-gray-900">{service.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(service.status)}
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                                                        {service.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Uptime:</span>
                                                    <span className="ml-1 font-medium">{service.metrics.uptime}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Response:</span>
                                                    <span className="ml-1 font-medium">{service.metrics.responseTime}ms</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Requests:</span>
                                                    <span className="ml-1 font-medium">{service.metrics.requests.toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Errors:</span>
                                                    <span className="ml-1 font-medium text-red-600">{service.metrics.errors}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Cloud Providers */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cloud Providers</h3>

                                <div className="space-y-3">
                                    {mockProviders.map((provider) => (
                                        <div key={provider.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {getProviderIcon(provider.type)}
                                                <div>
                                                    <div className="font-medium text-gray-900">{provider.name}</div>
                                                    <div className="text-sm text-gray-500">{provider.regions.length} regions</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {provider.connected ? (
                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                ) : (
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                )}
                                                <span className={`text-xs ${provider.connected ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {provider.connected ? 'Connected' : 'Disconnected'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>

                                <div className="space-y-4">
                                    {connectedProviders.map((provider) => (
                                        <div key={provider.id}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">{provider.name}</span>
                                                <span className="text-sm font-medium text-gray-900">${provider.billing.current.toFixed(2)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${(provider.billing.current / totalMonthlySpend) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">Total Monthly</span>
                                            <span className="text-lg font-bold text-gray-900">${totalMonthlySpend.toFixed(2)}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Projected: ${connectedProviders.reduce((sum, p) => sum + p.billing.projected, 0).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

                                <div className="space-y-3">
                                    <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                        <Upload className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Deploy Application</p>
                                            <p className="text-sm text-gray-500">Start new deployment</p>
                                        </div>
                                    </button>

                                    <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                        <Settings className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <p className="font-medium">Configure Service</p>
                                            <p className="text-sm text-gray-500">Update service settings</p>
                                        </div>
                                    </button>

                                    <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                        <Monitor className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">View Metrics</p>
                                            <p className="text-sm text-gray-500">Service performance</p>
                                        </div>
                                    </button>

                                    <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Security Scan</p>
                                            <p className="text-sm text-gray-500">Check vulnerabilities</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTab === 'services' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search services..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                    />
                                </div>

                                <select
                                    value={selectedProvider}
                                    onChange={(e) => setSelectedProvider(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Providers</option>
                                    <option value="aws">AWS</option>
                                    <option value="vercel">Vercel</option>
                                    <option value="azure">Azure</option>
                                </select>

                                <select
                                    value={selectedEnvironment}
                                    onChange={(e) => setSelectedEnvironment(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Environments</option>
                                    <option value="production">Production</option>
                                    <option value="staging">Staging</option>
                                    <option value="development">Development</option>
                                </select>

                                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* Services Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {mockServices.map((service) => (
                                <div key={service.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                {getServiceTypeIcon(service.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEnvironmentColor(service.environment)}`}>
                                                        {service.environment}
                                                    </span>
                                                    <span className="text-sm text-gray-500">{service.region}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(service.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                                                {service.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <span className="text-sm text-gray-500">CPU:</span>
                                            <span className="ml-1 text-sm font-medium">{service.resources.cpu}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Memory:</span>
                                            <span className="ml-1 text-sm font-medium">{service.resources.memory}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Storage:</span>
                                            <span className="ml-1 text-sm font-medium">{service.resources.storage}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Cost:</span>
                                            <span className="ml-1 text-sm font-medium">${service.cost.monthly}/mo</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4 mb-4 text-center">
                                        <div>
                                            <div className="text-lg font-bold text-green-600">{service.metrics.uptime}%</div>
                                            <div className="text-xs text-gray-500">Uptime</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-blue-600">{service.metrics.responseTime}ms</div>
                                            <div className="text-xs text-gray-500">Response</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-purple-600">{service.metrics.requests.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">Requests</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-red-600">{service.metrics.errors}</div>
                                            <div className="text-xs text-gray-500">Errors</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="text-sm text-gray-500">
                                            Last deployed: {service.lastDeployed.toLocaleDateString()} • {service.version}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {service.url && (
                                                <button className="text-gray-400 hover:text-blue-600" title="Open">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="text-gray-400 hover:text-purple-600" title="Logs">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button className="text-gray-400 hover:text-green-600" title="Terminal">
                                                <Terminal className="w-4 h-4" />
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-600" title="Settings">
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedTab === 'deployments' && (
                    <div className="space-y-6">
                        {/* Deployments List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deployment</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Environment</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockDeployments.map((deployment) => (
                                            <tr key={deployment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{deployment.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {deployment.branch} • {deployment.commit}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(deployment.status)}
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deployment.status)}`}>
                                                            {deployment.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEnvironmentColor(deployment.environment)}`}>
                                                        {deployment.environment}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{deployment.provider}</div>
                                                    <div className="text-sm text-gray-500">{deployment.region}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {deployment.duration ? `${deployment.duration}s` : 'Running...'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {deployment.startTime.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-gray-400 hover:text-blue-600" title="View Logs">
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                        {deployment.rollbackAvailable && (
                                                            <button className="text-gray-400 hover:text-yellow-600" title="Rollback">
                                                                <RotateCcw className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button className="text-gray-400 hover:text-green-600" title="Redeploy">
                                                            <Upload className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTab === 'providers' && (
                    <div className="space-y-6">
                        {/* Providers Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {mockProviders.map((provider) => (
                                <div key={provider.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                {getProviderIcon(provider.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                                                <div className="flex items-center space-x-2">
                                                    {provider.connected ? (
                                                        <span className="flex items-center space-x-1 text-green-600 text-sm">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                            <span>Connected</span>
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center space-x-1 text-gray-500 text-sm">
                                                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                            <span>Disconnected</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button className="text-gray-400 hover:text-blue-600" title="Settings">
                                                <Settings className="w-4 h-4" />
                                            </button>
                                            {provider.connected ? (
                                                <button className="text-gray-400 hover:text-red-600" title="Disconnect">
                                                    <Unlink className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button className="text-gray-400 hover:text-green-600" title="Connect">
                                                    <Link className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {provider.connected && (
                                        <>
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-900">${provider.billing.current.toFixed(2)}</div>
                                                    <div className="text-sm text-gray-500">Current</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-600">${provider.billing.projected.toFixed(2)}</div>
                                                    <div className="text-sm text-gray-500">Projected</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-600">${provider.billing.lastMonth.toFixed(2)}</div>
                                                    <div className="text-sm text-gray-500">Last Month</div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-gray-500">Compute Usage</span>
                                                        <span className="font-medium">{provider.limits.compute.used}/{provider.limits.compute.total}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${(provider.limits.compute.used / provider.limits.compute.total) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-gray-500">Storage Usage</span>
                                                        <span className="font-medium">{provider.limits.storage.used}GB/{provider.limits.storage.total}GB</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-purple-600 h-2 rounded-full"
                                                            style={{ width: `${(provider.limits.storage.used / provider.limits.storage.total) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-gray-500">Bandwidth Usage</span>
                                                        <span className="font-medium">{provider.limits.bandwidth.used}GB/{provider.limits.bandwidth.total}GB</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full"
                                                            style={{ width: `${(provider.limits.bandwidth.used / provider.limits.bandwidth.total) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="text-sm text-gray-500">
                                                    Regions: {provider.regions.join(', ')}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {!provider.connected && (
                                        <div className="text-center py-8">
                                            <div className="text-gray-400 mb-4">
                                                <Cloud className="w-12 h-12 mx-auto" />
                                            </div>
                                            <div className="text-gray-600 mb-4">Not connected</div>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                Connect Provider
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedTab === 'monitoring' && (
                    <div className="space-y-6">
                        {/* Global Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <Activity className="w-8 h-8 text-green-600" />
                                    <span className="text-green-600 text-sm font-medium">+0.02%</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">99.97%</p>
                                <p className="text-gray-600 text-sm">Global Uptime</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <Clock className="w-8 h-8 text-blue-600" />
                                    <span className="text-green-600 text-sm font-medium">-8ms</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">89ms</p>
                                <p className="text-gray-600 text-sm">Avg Response Time</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <TrendingUp className="w-8 h-8 text-purple-600" />
                                    <span className="text-blue-600 text-sm font-medium">+15%</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">1.2M</p>
                                <p className="text-gray-600 text-sm">Requests/Hour</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                    <span className="text-green-600 text-sm font-medium">-50%</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">0.02%</p>
                                <p className="text-gray-600 text-sm">Error Rate</p>
                            </div>
                        </div>

                        {/* Monitoring Chart Placeholder */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Global Performance Metrics</h3>
                                <div className="flex items-center space-x-2">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">Global performance monitoring chart will be displayed here</p>
                                    <p className="text-sm text-gray-500 mt-1">Real-time metrics across all cloud providers</p>
                                </div>
                            </div>
                        </div>

                        {/* Regional Performance */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Regional Performance</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { region: 'US East', uptime: 99.98, response: 67, status: 'healthy' },
                                    { region: 'US West', uptime: 99.95, response: 89, status: 'healthy' },
                                    { region: 'Europe', uptime: 99.97, response: 112, status: 'healthy' },
                                    { region: 'Asia Pacific', uptime: 99.92, response: 145, status: 'warning' }
                                ].map((region, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900">{region.region}</span>
                                            <span className={`w-2 h-2 rounded-full ${region.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}></span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Uptime:</span>
                                                <span className="font-medium">{region.uptime}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Response:</span>
                                                <span className="font-medium">{region.response}ms</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
