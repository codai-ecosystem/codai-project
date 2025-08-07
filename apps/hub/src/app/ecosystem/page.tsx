'use client';

import React, { useEffect, useState } from 'react';
import {
    ExternalLink,
    Play,
    Square,
    RotateCcw,
    Settings,
    Activity,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Clock,
    Users,
    Database,
    Cpu,
    HardDrive,
    Network,
    Eye,
    BarChart3,
    Filter,
    Search,
    Grid,
    List,
    RefreshCw,
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
    Palette,
    Image,
    FileText,
    Sun,
    Zap,
    Globe,
    Layers,
    Package,
    Monitor,
    Cloud,
    Server
} from 'lucide-react';

interface EcosystemApp {
    id: string;
    name: string;
    port: number;
    status: 'online' | 'offline' | 'starting' | 'error' | 'maintenance';
    category: 'core' | 'business' | 'ai' | 'utility' | 'analytics';
    description: string;
    version: string;
    uptime: string;
    memoryUsage: string;
    cpuUsage: string;
    lastDeployment: string;
    activeUsers: number;
    requestsPerMinute: number;
    url: string;
    icon: React.ReactNode;
    color: string;
    dependencies: string[];
    tags: string[];
}

const EcosystemPage = () => {
    const [apps, setApps] = useState<EcosystemApp[]>([]);
    const [filteredApps, setFilteredApps] = useState<EcosystemApp[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initialize apps data
    useEffect(() => {
        const ecosystemApps: EcosystemApp[] = [
            {
                id: 'codai',
                name: 'CODAI',
                port: 4001,
                status: 'online',
                category: 'core',
                description: 'Main AI development platform with comprehensive tools',
                version: 'v2.1.5',
                uptime: '99.8%',
                memoryUsage: '1.2 GB',
                cpuUsage: '45%',
                lastDeployment: '2 hours ago',
                activeUsers: 247,
                requestsPerMinute: 1250,
                url: 'http://localhost:4001',
                icon: <Code className="w-5 h-5" />,
                color: 'blue',
                dependencies: ['MemorAI', 'ID'],
                tags: ['ai', 'development', 'core']
            },
            {
                id: 'id',
                name: 'ID Service',
                port: 4004,
                status: 'online',
                category: 'core',
                description: 'Identity and authentication management system',
                version: 'v1.8.2',
                uptime: '99.9%',
                memoryUsage: '512 MB',
                cpuUsage: '12%',
                lastDeployment: '1 day ago',
                activeUsers: 1247,
                requestsPerMinute: 450,
                url: 'http://localhost:4004',
                icon: <Shield className="w-5 h-5" />,
                color: 'green',
                dependencies: [],
                tags: ['auth', 'security', 'core']
            },
            {
                id: 'bancai',
                name: 'BancAI',
                port: 4005,
                status: 'online',
                category: 'business',
                description: 'AI-powered financial services and banking platform',
                version: 'v3.2.1',
                uptime: '99.7%',
                memoryUsage: '2.1 GB',
                cpuUsage: '67%',
                lastDeployment: '4 hours ago',
                activeUsers: 89,
                requestsPerMinute: 680,
                url: 'http://localhost:4005',
                icon: <CreditCard className="w-5 h-5" />,
                color: 'purple',
                dependencies: ['ID', 'MemorAI'],
                tags: ['finance', 'banking', 'ai']
            },
            {
                id: 'memorai',
                name: 'MemorAI',
                port: 4006,
                status: 'online',
                category: 'ai',
                description: 'Advanced memory management and context storage',
                version: 'v4.1.0',
                uptime: '99.9%',
                memoryUsage: '3.8 GB',
                cpuUsage: '23%',
                lastDeployment: '6 hours ago',
                activeUsers: 512,
                requestsPerMinute: 2100,
                url: 'http://localhost:4006',
                icon: <Brain className="w-5 h-5" />,
                color: 'indigo',
                dependencies: ['ID'],
                tags: ['memory', 'ai', 'storage']
            },
            {
                id: 'admin',
                name: 'Admin Panel',
                port: 4007,
                status: 'online',
                category: 'core',
                description: 'System administration and management interface',
                version: 'v2.0.8',
                uptime: '99.8%',
                memoryUsage: '256 MB',
                cpuUsage: '8%',
                lastDeployment: '12 hours ago',
                activeUsers: 15,
                requestsPerMinute: 45,
                url: 'http://localhost:4007',
                icon: <Settings className="w-5 h-5" />,
                color: 'red',
                dependencies: ['ID'],
                tags: ['admin', 'management', 'core']
            },
            {
                id: 'hub',
                name: 'Hub Central',
                port: 4008,
                status: 'online',
                category: 'core',
                description: 'Central coordination and monitoring platform',
                version: 'v1.5.3',
                uptime: '99.9%',
                memoryUsage: '512 MB',
                cpuUsage: '15%',
                lastDeployment: 'Just now',
                activeUsers: 34,
                requestsPerMinute: 120,
                url: 'http://localhost:4008',
                icon: <Globe className="w-5 h-5" />,
                color: 'orange',
                dependencies: ['ID'],
                tags: ['hub', 'coordination', 'core']
            },
            {
                id: 'romai',
                name: 'RomAI',
                port: 6100,
                status: 'online',
                category: 'ai',
                description: 'Romanian AI with cultural context understanding',
                version: 'v2.8.4',
                uptime: '99.6%',
                memoryUsage: '1.8 GB',
                cpuUsage: '56%',
                lastDeployment: '8 hours ago',
                activeUsers: 156,
                requestsPerMinute: 890,
                url: 'http://localhost:6100',
                icon: <Bot className="w-5 h-5" />,
                color: 'yellow',
                dependencies: ['MemorAI', 'ID'],
                tags: ['ai', 'romanian', 'cultural']
            },
            {
                id: 'logai',
                name: 'LogAI',
                port: 5200,
                status: 'error',
                category: 'analytics',
                description: 'Advanced logging and analytics platform',
                version: 'v1.4.7',
                uptime: '97.2%',
                memoryUsage: '2.8 GB',
                cpuUsage: '89%',
                lastDeployment: '2 days ago',
                activeUsers: 78,
                requestsPerMinute: 340,
                url: 'http://localhost:5200',
                icon: <BarChart3 className="w-5 h-5" />,
                color: 'cyan',
                dependencies: ['ID'],
                tags: ['analytics', 'logging', 'monitoring']
            },
            {
                id: 'marketai',
                name: 'MarketAI',
                port: 5300,
                status: 'online',
                category: 'business',
                description: 'Market intelligence and trading analysis',
                version: 'v3.1.2',
                uptime: '99.4%',
                memoryUsage: '1.5 GB',
                cpuUsage: '34%',
                lastDeployment: '1 day ago',
                activeUsers: 67,
                requestsPerMinute: 290,
                url: 'http://localhost:5300',
                icon: <TrendingUp className="w-5 h-5" />,
                color: 'emerald',
                dependencies: ['MemorAI', 'LogAI'],
                tags: ['market', 'trading', 'analysis']
            },
            {
                id: 'muzicai',
                name: 'MuzicAI',
                port: 5800,
                status: 'online',
                category: 'ai',
                description: 'AI-powered music generation and analysis',
                version: 'v2.3.6',
                uptime: '99.1%',
                memoryUsage: '3.2 GB',
                cpuUsage: '72%',
                lastDeployment: '6 hours ago',
                activeUsers: 145,
                requestsPerMinute: 520,
                url: 'http://localhost:5800',
                icon: <Music className="w-5 h-5" />,
                color: 'pink',
                dependencies: ['MemorAI'],
                tags: ['music', 'ai', 'generation']
            },
            {
                id: 'studiai',
                name: 'StudiAI',
                port: 6400,
                status: 'maintenance',
                category: 'ai',
                description: 'Educational AI and learning management',
                version: 'v1.9.3',
                uptime: '0%',
                memoryUsage: '0 MB',
                cpuUsage: '0%',
                lastDeployment: '1 day ago',
                activeUsers: 0,
                requestsPerMinute: 0,
                url: 'http://localhost:6400',
                icon: <GraduationCap className="w-5 h-5" />,
                color: 'violet',
                dependencies: ['MemorAI', 'ID'],
                tags: ['education', 'learning', 'ai']
            },
            {
                id: 'talentai',
                name: 'TalentAI',
                port: 6600,
                status: 'online',
                category: 'business',
                description: 'HR management and talent acquisition AI',
                version: 'v2.5.1',
                uptime: '99.5%',
                memoryUsage: '1.1 GB',
                cpuUsage: '28%',
                lastDeployment: '3 hours ago',
                activeUsers: 43,
                requestsPerMinute: 180,
                url: 'http://localhost:6600',
                icon: <Users2 className="w-5 h-5" />,
                color: 'teal',
                dependencies: ['ID', 'MemorAI'],
                tags: ['hr', 'talent', 'recruitment']
            },
            {
                id: 'tools',
                name: 'Tools',
                port: 6700,
                status: 'online',
                category: 'utility',
                description: 'Utility tools and helper services',
                version: 'v1.2.8',
                uptime: '99.3%',
                memoryUsage: '256 MB',
                cpuUsage: '5%',
                lastDeployment: '1 day ago',
                activeUsers: 23,
                requestsPerMinute: 65,
                url: 'http://localhost:6700',
                icon: <Tool className="w-5 h-5" />,
                color: 'slate',
                dependencies: [],
                tags: ['tools', 'utility', 'helpers']
            }
        ];

        setApps(ecosystemApps);
        setFilteredApps(ecosystemApps);
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = apps;

        if (searchTerm) {
            filtered = filtered.filter(app =>
                app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

        setFilteredApps(filtered);
    }, [apps, searchTerm, selectedCategory, selectedStatus]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-600 bg-green-100';
            case 'offline': return 'text-gray-600 bg-gray-100';
            case 'starting': return 'text-blue-600 bg-blue-100';
            case 'error': return 'text-red-600 bg-red-100';
            case 'maintenance': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online': return <CheckCircle className="w-4 h-4" />;
            case 'offline': return <XCircle className="w-4 h-4" />;
            case 'starting': return <Clock className="w-4 h-4" />;
            case 'error': return <AlertTriangle className="w-4 h-4" />;
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
        // Simulate data refresh
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const handleAppAction = (appId: string, action: 'start' | 'stop' | 'restart') => {
        console.log(`${action} action for app ${appId}`);
        // In a real implementation, this would make API calls to control services
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
        { value: 'online', label: 'Online' },
        { value: 'offline', label: 'Offline' },
        { value: 'error', label: 'Error' },
        { value: 'maintenance', label: 'Maintenance' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ecosystem Overview</h1>
                    <p className="mt-2 text-gray-600">
                        Manage and monitor all CODAI platform applications
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
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Apps</p>
                            <p className="text-2xl font-bold text-gray-900">{apps.length}</p>
                        </div>
                        <Package className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Online</p>
                            <p className="text-2xl font-bold text-green-600">
                                {apps.filter(app => app.status === 'online').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Issues</p>
                            <p className="text-2xl font-bold text-red-600">
                                {apps.filter(app => app.status === 'error').length}
                            </p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {apps.reduce((sum, app) => sum + app.activeUsers, 0).toLocaleString()}
                            </p>
                        </div>
                        <Users className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Applications Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredApps.map((app) => (
                        <div key={app.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg bg-${app.color}-100 text-${app.color}-600`}>
                                            {app.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                                            <p className="text-sm text-gray-500">v{app.version}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                        {getStatusIcon(app.status)}
                                        <span className="ml-1 capitalize">{app.status}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-600 mb-4">{app.description}</p>

                                {/* Category and Tags */}
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(app.category)}`}>
                                        {app.category}
                                    </span>
                                    {app.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Active Users</p>
                                        <p className="font-medium">{app.activeUsers}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Uptime</p>
                                        <p className="font-medium">{app.uptime}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Memory</p>
                                        <p className="font-medium">{app.memoryUsage}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">CPU</p>
                                        <p className="font-medium">{app.cpuUsage}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleAppAction(app.id, 'start')}
                                            className="p-2 text-green-600 hover:bg-green-100 rounded"
                                            disabled={app.status === 'online'}
                                        >
                                            <Play className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleAppAction(app.id, 'stop')}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                                            disabled={app.status === 'offline'}
                                        >
                                            <Square className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleAppAction(app.id, 'restart')}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex space-x-1">
                                        <a
                                            href={app.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200">
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
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Users
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Resources
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
                                                    <div className="text-sm font-medium text-gray-900">{app.name}</div>
                                                    <div className="text-sm text-gray-500">Port {app.port}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)} w-fit`}>
                                                {getStatusIcon(app.status)}
                                                <span className="ml-1 capitalize">{app.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(app.category)}`}>
                                                {app.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {app.activeUsers}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>CPU: {app.cpuUsage}</div>
                                            <div>Memory: {app.memoryUsage}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {app.uptime}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => handleAppAction(app.id, 'start')}
                                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                                    disabled={app.status === 'online'}
                                                >
                                                    <Play className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAppAction(app.id, 'stop')}
                                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                    disabled={app.status === 'offline'}
                                                >
                                                    <Square className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAppAction(app.id, 'restart')}
                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                                <a
                                                    href={app.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {filteredApps.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    );
};

export default EcosystemPage;
