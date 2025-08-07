'use client';

import React, { useEffect, useState } from 'react';
import {
    Package,
    Plus,
    Settings,
    Play,
    Square,
    RotateCcw,
    Trash2,
    Edit,
    ExternalLink,
    Eye,
    Download,
    Upload,
    GitBranch,
    Activity,
    Users,
    Database,
    Cpu,
    HardDrive,
    Network,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    RefreshCw,
    Search,
    Filter,
    ArrowUpDown,
    MoreVertical,
    Code,
    Shield,
    CreditCard,
    Brain,
    Bot,
    Music,
    GraduationCap,
    Users2,
    Tool,
    TrendingUp,
    BarChart3,
    Globe,
    Layers,
    Monitor,
    Cloud,
    FileText,
    Calendar,
    Zap,
    Link,
    Tag,
    Server
} from 'lucide-react';

interface Application {
    id: string;
    name: string;
    displayName: string;
    port: number;
    status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping' | 'maintenance';
    category: 'core' | 'business' | 'ai' | 'utility' | 'analytics';
    version: string;
    latestVersion: string;
    description: string;
    repository: string;
    branch: string;
    lastCommit: string;
    lastDeployment: string;
    uptime: string;
    restarts: number;
    activeUsers: number;
    requestsPerMinute: number;
    memoryUsage: number;
    memoryLimit: number;
    cpuUsage: number;
    diskUsage: number;
    networkIn: number;
    networkOut: number;
    healthCheckUrl: string;
    configPath: string;
    logPath: string;
    dependencies: string[];
    tags: string[];
    icon: React.ReactNode;
    color: string;
    environment: {
        [key: string]: string;
    };
    scaling: {
        minInstances: number;
        maxInstances: number;
        currentInstances: number;
    };
}

interface DeploymentHistory {
    id: string;
    version: string;
    deployedBy: string;
    deployedAt: string;
    status: 'success' | 'failed' | 'rollback';
    changes: string[];
    duration: string;
}

const ApplicationsPage = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [filteredApps, setFilteredApps] = useState<Application[]>([]);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [showAppModal, setShowAppModal] = useState(false);
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initialize applications data
    useEffect(() => {
        const appsData: Application[] = [
            {
                id: 'codai',
                name: 'codai',
                displayName: 'CODAI Platform',
                port: 4001,
                status: 'running',
                category: 'core',
                version: '2.1.5',
                latestVersion: '2.1.6',
                description: 'Main AI development platform with comprehensive tools and services',
                repository: 'codai-ecosystem/codai-core',
                branch: 'main',
                lastCommit: 'feat: add new AI model integration (2h ago)',
                lastDeployment: '2 hours ago',
                uptime: '7d 14h 23m',
                restarts: 2,
                activeUsers: 247,
                requestsPerMinute: 1250,
                memoryUsage: 1200,
                memoryLimit: 2048,
                cpuUsage: 45,
                diskUsage: 15.6,
                networkIn: 125.4,
                networkOut: 89.7,
                healthCheckUrl: '/api/health',
                configPath: '/config/codai.json',
                logPath: '/logs/codai.log',
                dependencies: ['memorai', 'id-service'],
                tags: ['ai', 'development', 'core', 'platform'],
                icon: <Code className="w-5 h-5" />,
                color: 'blue',
                environment: {
                    NODE_ENV: 'production',
                    AI_MODEL_VERSION: '2.1.5',
                    REDIS_URL: 'redis://localhost:6379',
                    DATABASE_URL: 'postgresql://localhost:5432/codai'
                },
                scaling: {
                    minInstances: 2,
                    maxInstances: 8,
                    currentInstances: 3
                }
            },
            {
                id: 'id-service',
                name: 'id',
                displayName: 'ID Service',
                port: 4004,
                status: 'running',
                category: 'core',
                version: '1.8.2',
                latestVersion: '1.8.2',
                description: 'Identity and authentication management system',
                repository: 'codai-ecosystem/id-service',
                branch: 'main',
                lastCommit: 'fix: improve JWT validation (1d ago)',
                lastDeployment: '1 day ago',
                uptime: '15d 8h 45m',
                restarts: 0,
                activeUsers: 1247,
                requestsPerMinute: 450,
                memoryUsage: 512,
                memoryLimit: 1024,
                cpuUsage: 12,
                diskUsage: 8.2,
                networkIn: 45.2,
                networkOut: 38.9,
                healthCheckUrl: '/health',
                configPath: '/config/auth.json',
                logPath: '/logs/auth.log',
                dependencies: [],
                tags: ['auth', 'security', 'core', 'jwt'],
                icon: <Shield className="w-5 h-5" />,
                color: 'green',
                environment: {
                    NODE_ENV: 'production',
                    JWT_SECRET: '***',
                    OAUTH_PROVIDERS: 'google,github,microsoft',
                    SESSION_TIMEOUT: '24h'
                },
                scaling: {
                    minInstances: 2,
                    maxInstances: 4,
                    currentInstances: 2
                }
            },
            {
                id: 'bancai',
                name: 'bancai',
                displayName: 'BancAI',
                port: 4005,
                status: 'running',
                category: 'business',
                version: '3.2.1',
                latestVersion: '3.2.2',
                description: 'AI-powered financial services and banking platform',
                repository: 'codai-ecosystem/bancai',
                branch: 'main',
                lastCommit: 'feat: add new payment gateway (4h ago)',
                lastDeployment: '4 hours ago',
                uptime: '3d 12h 18m',
                restarts: 1,
                activeUsers: 89,
                requestsPerMinute: 680,
                memoryUsage: 2100,
                memoryLimit: 4096,
                cpuUsage: 67,
                diskUsage: 32.1,
                networkIn: 89.4,
                networkOut: 156.7,
                healthCheckUrl: '/api/status',
                configPath: '/config/banking.json',
                logPath: '/logs/banking.log',
                dependencies: ['id-service', 'memorai'],
                tags: ['finance', 'banking', 'ai', 'payments'],
                icon: <CreditCard className="w-5 h-5" />,
                color: 'purple',
                environment: {
                    NODE_ENV: 'production',
                    PAYMENT_GATEWAY: 'stripe',
                    ENCRYPTION_KEY: '***',
                    COMPLIANCE_MODE: 'strict'
                },
                scaling: {
                    minInstances: 2,
                    maxInstances: 6,
                    currentInstances: 3
                }
            },
            {
                id: 'memorai',
                name: 'memorai',
                displayName: 'MemorAI',
                port: 4006,
                status: 'running',
                category: 'ai',
                version: '4.1.0',
                latestVersion: '4.1.0',
                description: 'Advanced memory management and context storage system',
                repository: 'codai-ecosystem/memorai',
                branch: 'main',
                lastCommit: 'perf: optimize vector search (6h ago)',
                lastDeployment: '6 hours ago',
                uptime: '12d 6h 30m',
                restarts: 1,
                activeUsers: 512,
                requestsPerMinute: 2100,
                memoryUsage: 3800,
                memoryLimit: 8192,
                cpuUsage: 23,
                diskUsage: 45.8,
                networkIn: 234.5,
                networkOut: 189.3,
                healthCheckUrl: '/health',
                configPath: '/config/memory.json',
                logPath: '/logs/memory.log',
                dependencies: ['id-service'],
                tags: ['memory', 'ai', 'storage', 'vectors'],
                icon: <Brain className="w-5 h-5" />,
                color: 'indigo',
                environment: {
                    NODE_ENV: 'production',
                    VECTOR_DB_URL: 'pinecone://...',
                    EMBEDDING_MODEL: 'text-embedding-ada-002',
                    MAX_CONTEXT_LENGTH: '4096'
                },
                scaling: {
                    minInstances: 2,
                    maxInstances: 10,
                    currentInstances: 4
                }
            },
            {
                id: 'admin',
                name: 'admin',
                displayName: 'Admin Panel',
                port: 4007,
                status: 'running',
                category: 'core',
                version: '2.0.8',
                latestVersion: '2.0.8',
                description: 'System administration and management interface',
                repository: 'codai-ecosystem/admin-panel',
                branch: 'main',
                lastCommit: 'ui: improve dashboard layout (12h ago)',
                lastDeployment: '12 hours ago',
                uptime: '9d 18h 42m',
                restarts: 0,
                activeUsers: 15,
                requestsPerMinute: 45,
                memoryUsage: 256,
                memoryLimit: 512,
                cpuUsage: 8,
                diskUsage: 5.2,
                networkIn: 12.3,
                networkOut: 18.7,
                healthCheckUrl: '/api/health',
                configPath: '/config/admin.json',
                logPath: '/logs/admin.log',
                dependencies: ['id-service'],
                tags: ['admin', 'management', 'core', 'dashboard'],
                icon: <Settings className="w-5 h-5" />,
                color: 'red',
                environment: {
                    NODE_ENV: 'production',
                    ADMIN_ROLE: 'super_admin',
                    AUDIT_LOGGING: 'enabled',
                    BACKUP_SCHEDULE: '0 2 * * *'
                },
                scaling: {
                    minInstances: 1,
                    maxInstances: 2,
                    currentInstances: 1
                }
            },
            {
                id: 'hub',
                name: 'hub',
                displayName: 'Hub Central',
                port: 4008,
                status: 'running',
                category: 'core',
                version: '1.5.3',
                latestVersion: '1.5.3',
                description: 'Central coordination and monitoring platform',
                repository: 'codai-ecosystem/hub-central',
                branch: 'main',
                lastCommit: 'feat: add ecosystem overview (just now)',
                lastDeployment: 'Just now',
                uptime: '5d 23h 15m',
                restarts: 0,
                activeUsers: 34,
                requestsPerMinute: 120,
                memoryUsage: 512,
                memoryLimit: 1024,
                cpuUsage: 15,
                diskUsage: 12.4,
                networkIn: 28.9,
                networkOut: 34.1,
                healthCheckUrl: '/api/health',
                configPath: '/config/hub.json',
                logPath: '/logs/hub.log',
                dependencies: ['id-service'],
                tags: ['hub', 'coordination', 'core', 'monitoring'],
                icon: <Globe className="w-5 h-5" />,
                color: 'orange',
                environment: {
                    NODE_ENV: 'production',
                    HUB_MODE: 'central',
                    MONITORING_INTERVAL: '30s',
                    ALERT_WEBHOOK: 'https://...'
                },
                scaling: {
                    minInstances: 1,
                    maxInstances: 3,
                    currentInstances: 1
                }
            },
            {
                id: 'romai',
                name: 'romai',
                displayName: 'RomAI',
                port: 6100,
                status: 'running',
                category: 'ai',
                version: '2.8.4',
                latestVersion: '2.8.5',
                description: 'Romanian AI with cultural context understanding',
                repository: 'codai-ecosystem/romai',
                branch: 'main',
                lastCommit: 'feat: improve cultural context (8h ago)',
                lastDeployment: '8 hours ago',
                uptime: '6d 4h 52m',
                restarts: 2,
                activeUsers: 156,
                requestsPerMinute: 890,
                memoryUsage: 1800,
                memoryLimit: 4096,
                cpuUsage: 56,
                diskUsage: 28.9,
                networkIn: 67.8,
                networkOut: 92.4,
                healthCheckUrl: '/health',
                configPath: '/config/romai.json',
                logPath: '/logs/romai.log',
                dependencies: ['memorai', 'id-service'],
                tags: ['ai', 'romanian', 'cultural', 'nlp'],
                icon: <Bot className="w-5 h-5" />,
                color: 'yellow',
                environment: {
                    NODE_ENV: 'production',
                    LANGUAGE_MODEL: 'romai-v2.8',
                    CULTURAL_DB: 'romania-context',
                    TRANSLATION_API: 'deepl'
                },
                scaling: {
                    minInstances: 2,
                    maxInstances: 6,
                    currentInstances: 3
                }
            },
            {
                id: 'logai',
                name: 'logai',
                displayName: 'LogAI',
                port: 5200,
                status: 'error',
                category: 'analytics',
                version: '1.4.7',
                latestVersion: '1.4.8',
                description: 'Advanced logging and analytics platform',
                repository: 'codai-ecosystem/logai',
                branch: 'main',
                lastCommit: 'fix: memory leak in log processing (2d ago)',
                lastDeployment: '2 days ago',
                uptime: '0h 0m',
                restarts: 5,
                activeUsers: 0,
                requestsPerMinute: 0,
                memoryUsage: 0,
                memoryLimit: 4096,
                cpuUsage: 0,
                diskUsage: 78.4,
                networkIn: 0,
                networkOut: 0,
                healthCheckUrl: '/health',
                configPath: '/config/logging.json',
                logPath: '/logs/logai.log',
                dependencies: ['id-service'],
                tags: ['analytics', 'logging', 'monitoring', 'metrics'],
                icon: <BarChart3 className="w-5 h-5" />,
                color: 'cyan',
                environment: {
                    NODE_ENV: 'production',
                    LOG_LEVEL: 'info',
                    RETENTION_DAYS: '90',
                    ANALYTICS_ENGINE: 'elasticsearch'
                },
                scaling: {
                    minInstances: 1,
                    maxInstances: 4,
                    currentInstances: 0
                }
            }
        ];

        setApplications(appsData);
        setFilteredApps(appsData);
    }, []);

    // Apply filters and sorting
    useEffect(() => {
        let filtered = applications;

        if (searchTerm) {
            filtered = filtered.filter(app =>
                app.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(app => app.category === selectedCategory);
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(app => app.status === selectedStatus);
        }

        // Sort applications
        filtered.sort((a, b) => {
            let aValue: any = a[sortBy as keyof Application];
            let bValue: any = b[sortBy as keyof Application];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        setFilteredApps(filtered);
    }, [applications, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-green-600 bg-green-100';
            case 'stopped': return 'text-gray-600 bg-gray-100';
            case 'error': return 'text-red-600 bg-red-100';
            case 'starting': return 'text-blue-600 bg-blue-100';
            case 'stopping': return 'text-yellow-600 bg-yellow-100';
            case 'maintenance': return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <CheckCircle className="w-4 h-4" />;
            case 'stopped': return <XCircle className="w-4 h-4" />;
            case 'error': return <AlertTriangle className="w-4 h-4" />;
            case 'starting': return <Clock className="w-4 h-4" />;
            case 'stopping': return <Clock className="w-4 h-4" />;
            case 'maintenance': return <Settings className="w-4 h-4" />;
            default: return <XCircle className="w-4 h-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'core': return 'bg-blue-100 text-blue-800';
            case 'business': return 'bg-green-100 text-green-800';
            case 'ai': return 'bg-purple-100 text-purple-800';
            case 'utility': return 'bg-gray-100 text-gray-800';
            case 'analytics': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const refreshData = async () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const handleAppAction = async (appId: string, action: 'start' | 'stop' | 'restart' | 'deploy') => {
        console.log(`${action} action for app ${appId}`);
        // Simulate action
        const app = applications.find(a => a.id === appId);
        if (app) {
            if (action === 'start') {
                app.status = 'starting';
                setTimeout(() => {
                    app.status = 'running';
                    setApplications([...applications]);
                }, 2000);
            } else if (action === 'stop') {
                app.status = 'stopping';
                setTimeout(() => {
                    app.status = 'stopped';
                    setApplications([...applications]);
                }, 1000);
            } else if (action === 'restart') {
                app.status = 'stopping';
                setTimeout(() => {
                    app.status = 'starting';
                    setTimeout(() => {
                        app.status = 'running';
                        app.restarts++;
                        setApplications([...applications]);
                    }, 2000);
                }, 1000);
            }
            setApplications([...applications]);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'core', label: 'Core Services' },
        { value: 'business', label: 'Business Apps' },
        { value: 'ai', label: 'AI Services' },
        { value: 'utility', label: 'Utilities' },
        { value: 'analytics', label: 'Analytics' }
    ];

    const statuses = [
        { value: 'all', label: 'All Status' },
        { value: 'running', label: 'Running' },
        { value: 'stopped', label: 'Stopped' },
        { value: 'error', label: 'Error' },
        { value: 'maintenance', label: 'Maintenance' }
    ];

    const sortOptions = [
        { value: 'displayName', label: 'Name' },
        { value: 'status', label: 'Status' },
        { value: 'category', label: 'Category' },
        { value: 'memoryUsage', label: 'Memory Usage' },
        { value: 'cpuUsage', label: 'CPU Usage' },
        { value: 'activeUsers', label: 'Active Users' },
        { value: 'uptime', label: 'Uptime' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
                    <p className="mt-2 text-gray-600">
                        Manage and deploy CODAI ecosystem applications
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Deploy New
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Applications</p>
                            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                        </div>
                        <Package className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Running</p>
                            <p className="text-2xl font-bold text-green-600">
                                {applications.filter(app => app.status === 'running').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Memory</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {formatBytes(applications.reduce((sum, app) => sum + app.memoryUsage, 0) * 1024 * 1024)}
                            </p>
                        </div>
                        <HardDrive className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {applications.reduce((sum, app) => sum + app.activeUsers, 0).toLocaleString()}
                            </p>
                        </div>
                        <Users className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {statuses.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                Sort by {option.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Application
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Version
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resources
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Users
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Uptime
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredApps.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-lg bg-${app.color}-100 text-${app.color}-600 mr-3`}>
                                                {app.icon}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{app.displayName}</div>
                                                <div className="text-sm text-gray-500">{app.name} (:{app.port})</div>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(app.category)}`}>
                                                        {app.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(app.status)}`}>
                                            {getStatusIcon(app.status)}
                                            <span className="ml-1 capitalize">{app.status}</span>
                                        </div>
                                        {app.restarts > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {app.restarts} restart{app.restarts > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{app.version}</div>
                                        {app.version !== app.latestVersion && (
                                            <div className="text-xs text-blue-600">
                                                {app.latestVersion} available
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>CPU: {app.cpuUsage}%</div>
                                        <div>RAM: {app.memoryUsage}MB / {app.memoryLimit}MB</div>
                                        <div>Disk: {app.diskUsage}GB</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>{app.activeUsers}</div>
                                        <div className="text-xs text-gray-500">
                                            {app.requestsPerMinute}/min
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {app.uptime}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleAppAction(app.id, 'start')}
                                                disabled={app.status === 'running' || app.status === 'starting'}
                                                className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Start"
                                            >
                                                <Play className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleAppAction(app.id, 'stop')}
                                                disabled={app.status === 'stopped' || app.status === 'stopping'}
                                                className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Stop"
                                            >
                                                <Square className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleAppAction(app.id, 'restart')}
                                                disabled={app.status === 'stopped'}
                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Restart"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                            <a
                                                href={`http://localhost:${app.port}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                title="Open Application"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => {
                                                    setSelectedApp(app);
                                                    setShowAppModal(true);
                                                }}
                                                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                title="More Actions"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredApps.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>

            {/* Application Details Modal */}
            {showAppModal && selectedApp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-3 rounded-lg bg-${selectedApp.color}-100 text-${selectedApp.color}-600`}>
                                        {selectedApp.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{selectedApp.displayName}</h2>
                                        <p className="text-gray-600">{selectedApp.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAppModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Name:</span>
                                            <span className="text-gray-900">{selectedApp.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Port:</span>
                                            <span className="text-gray-900">{selectedApp.port}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Version:</span>
                                            <span className="text-gray-900">{selectedApp.version}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Category:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedApp.category)}`}>
                                                {selectedApp.category}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Repository:</span>
                                            <span className="text-gray-900">{selectedApp.repository}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Runtime Status</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status:</span>
                                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApp.status)}`}>
                                                {getStatusIcon(selectedApp.status)}
                                                <span className="ml-1 capitalize">{selectedApp.status}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Uptime:</span>
                                            <span className="text-gray-900">{selectedApp.uptime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Restarts:</span>
                                            <span className="text-gray-900">{selectedApp.restarts}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Active Users:</span>
                                            <span className="text-gray-900">{selectedApp.activeUsers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Requests/min:</span>
                                            <span className="text-gray-900">{selectedApp.requestsPerMinute}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Resource Usage */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Resource Usage</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">Memory</span>
                                            <Cpu className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="text-lg font-semibold">{selectedApp.memoryUsage}MB</div>
                                        <div className="text-xs text-gray-500">of {selectedApp.memoryLimit}MB</div>
                                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${(selectedApp.memoryUsage / selectedApp.memoryLimit) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">CPU</span>
                                            <Activity className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="text-lg font-semibold">{selectedApp.cpuUsage}%</div>
                                        <div className="text-xs text-gray-500">utilization</div>
                                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${selectedApp.cpuUsage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">Disk</span>
                                            <HardDrive className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="text-lg font-semibold">{selectedApp.diskUsage}GB</div>
                                        <div className="text-xs text-gray-500">used</div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">Network</span>
                                            <Network className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="text-lg font-semibold">
                                            ↑{selectedApp.networkOut} MB/s
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            ↓{selectedApp.networkIn} MB/s
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Environment Variables */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Environment</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(selectedApp.environment).map(([key, value]) => (
                                            <div key={key} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{key}:</span>
                                                <span className="text-gray-900 font-mono">
                                                    {value === '***' ? '••••••••' : value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Dependencies & Tags */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Dependencies</h3>
                                    <div className="space-y-2">
                                        {selectedApp.dependencies.length > 0 ? (
                                            selectedApp.dependencies.map((dep) => (
                                                <div key={dep} className="flex items-center space-x-2 text-sm">
                                                    <Link className="w-4 h-4 text-gray-400" />
                                                    <span>{dep}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-gray-500 text-sm">No dependencies</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedApp.tags.map((tag) => (
                                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => handleAppAction(selectedApp.id, 'start')}
                                    disabled={selectedApp.status === 'running'}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start
                                </button>
                                <button
                                    onClick={() => handleAppAction(selectedApp.id, 'stop')}
                                    disabled={selectedApp.status === 'stopped'}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Square className="w-4 h-4 mr-2" />
                                    Stop
                                </button>
                                <button
                                    onClick={() => handleAppAction(selectedApp.id, 'restart')}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Restart
                                </button>
                                <a
                                    href={`http://localhost:${selectedApp.port}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open App
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationsPage;
