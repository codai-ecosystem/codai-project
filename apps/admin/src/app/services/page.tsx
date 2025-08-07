'use client';

import React, { useState, useEffect } from 'react';
import {
    Server,
    Play,
    Pause,
    Square,
    RotateCcw,
    Settings,
    Monitor,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Cpu,
    MemoryStick,
    HardDrive,
    Network,
    Database,
    Globe,
    Shield,
    Zap,
    Users,
    BarChart3,
    RefreshCw,
    ExternalLink,
    Edit,
    Trash2,
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    Eye,
    EyeOff,
    Power,
    PowerOff,
    AlertCircle,
    Info,
    FileText,
    Calendar,
    MapPin,
    Tag,
    Layers,
    Box,
    Container,
    Workflow,
    GitBranch,
    Cloud,
    Smartphone,
    Laptop,
    Terminal,
    Code,
    Package,
    Bookmark,
    Star,
    TrendingUp,
    TrendingDown,
    Minus,
    MoreVertical
} from 'lucide-react';

interface Service {
    id: string;
    name: string;
    displayName: string;
    category: 'core' | 'frontend' | 'backend' | 'ai' | 'data' | 'infrastructure' | 'monitoring';
    type: 'web' | 'api' | 'database' | 'cache' | 'queue' | 'ml' | 'storage' | 'proxy';
    status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping' | 'restarting';
    health: 'healthy' | 'warning' | 'critical' | 'unknown';
    version: string;
    port: number;
    url?: string;
    description: string;
    uptime: number;
    lastRestart: string;
    restartCount: number;
    cpu: number;
    memory: number;
    memoryLimit: number;
    disk: number;
    diskLimit: number;
    network: {
        bytesIn: number;
        bytesOut: number;
    };
    dependencies: string[];
    environment: 'development' | 'staging' | 'production';
    configuration: {
        autoRestart: boolean;
        healthCheckEnabled: boolean;
        logLevel: string;
        scaling: {
            minInstances: number;
            maxInstances: number;
            currentInstances: number;
        };
    };
    metrics: {
        requestsPerSecond: number;
        responseTime: number;
        errorRate: number;
        availability: number;
    };
    logs: {
        level: 'info' | 'warning' | 'error' | 'debug';
        message: string;
        timestamp: string;
    }[];
}

interface ServiceCategory {
    id: string;
    name: string;
    description: string;
    services: string[];
    color: string;
}

export default function Services() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [healthFilter, setHealthFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showConfiguration, setShowConfiguration] = useState(false);
    const [bulkActions, setBulkActions] = useState<string[]>([]);

    // Mock services data
    const [services, setServices] = useState<Service[]>([
        {
            id: 'memorai-mcp',
            name: 'memorai-mcp',
            displayName: 'MemorAI MCP Server',
            category: 'ai',
            type: 'api',
            status: 'running',
            health: 'healthy',
            version: '1.2.0',
            port: 4950,
            url: 'http://localhost:4950',
            description: 'Advanced memory management and context processing server',
            uptime: 86400,
            lastRestart: '2024-08-05T10:00:00Z',
            restartCount: 2,
            cpu: 15.3,
            memory: 256,
            memoryLimit: 512,
            disk: 1.2,
            diskLimit: 10,
            network: { bytesIn: 1234567, bytesOut: 987654 },
            dependencies: ['cbd-database'],
            environment: 'development',
            configuration: {
                autoRestart: true,
                healthCheckEnabled: true,
                logLevel: 'debug',
                scaling: { minInstances: 1, maxInstances: 3, currentInstances: 1 }
            },
            metrics: {
                requestsPerSecond: 125.7,
                responseTime: 45,
                errorRate: 0.2,
                availability: 99.8
            },
            logs: [
                { level: 'info', message: 'Memory context processed successfully', timestamp: '2024-08-06T10:30:15Z' },
                { level: 'debug', message: 'Vector embedding generated for query', timestamp: '2024-08-06T10:29:45Z' }
            ]
        },
        {
            id: 'cbd-database',
            name: 'cbd-database',
            displayName: 'CBD Database',
            category: 'data',
            type: 'database',
            status: 'running',
            health: 'healthy',
            version: '2.1.0',
            port: 4180,
            url: 'http://localhost:4180',
            description: 'Core business database with advanced querying capabilities',
            uptime: 172800,
            lastRestart: '2024-08-04T09:00:00Z',
            restartCount: 1,
            cpu: 8.7,
            memory: 512,
            memoryLimit: 1024,
            disk: 25.6,
            diskLimit: 100,
            network: { bytesIn: 9876543, bytesOut: 5432109 },
            dependencies: [],
            environment: 'development',
            configuration: {
                autoRestart: true,
                healthCheckEnabled: true,
                logLevel: 'info',
                scaling: { minInstances: 1, maxInstances: 2, currentInstances: 1 }
            },
            metrics: {
                requestsPerSecond: 87.3,
                responseTime: 12,
                errorRate: 0.05,
                availability: 99.9
            },
            logs: [
                { level: 'info', message: 'Database backup completed successfully', timestamp: '2024-08-06T10:00:00Z' },
                { level: 'info', message: 'Connection pool optimized', timestamp: '2024-08-06T09:45:30Z' }
            ]
        },
        {
            id: 'gateway-service',
            name: 'gateway-service',
            displayName: 'API Gateway',
            category: 'infrastructure',
            type: 'proxy',
            status: 'running',
            health: 'healthy',
            version: '3.0.1',
            port: 4003,
            url: 'http://localhost:4003',
            description: 'Main API gateway for routing and load balancing',
            uptime: 259200,
            lastRestart: '2024-08-03T14:30:00Z',
            restartCount: 0,
            cpu: 5.2,
            memory: 128,
            memoryLimit: 256,
            disk: 0.8,
            diskLimit: 5,
            network: { bytesIn: 15678902, bytesOut: 12345678 },
            dependencies: [],
            environment: 'development',
            configuration: {
                autoRestart: true,
                healthCheckEnabled: true,
                logLevel: 'info',
                scaling: { minInstances: 2, maxInstances: 5, currentInstances: 2 }
            },
            metrics: {
                requestsPerSecond: 423.8,
                responseTime: 25,
                errorRate: 0.1,
                availability: 99.95
            },
            logs: [
                { level: 'info', message: 'Load balancing optimized for peak traffic', timestamp: '2024-08-06T10:15:00Z' },
                { level: 'warning', message: 'Rate limit approaching for client', timestamp: '2024-08-06T10:10:30Z' }
            ]
        },
        {
            id: 'codai-app',
            name: 'codai-app',
            displayName: 'CODAI Frontend',
            category: 'frontend',
            type: 'web',
            status: 'running',
            health: 'healthy',
            version: '1.5.2',
            port: 4001,
            url: 'http://localhost:4001',
            description: 'Main CODAI application frontend interface',
            uptime: 86400,
            lastRestart: '2024-08-05T10:00:00Z',
            restartCount: 3,
            cpu: 12.1,
            memory: 192,
            memoryLimit: 512,
            disk: 2.1,
            diskLimit: 10,
            network: { bytesIn: 2345678, bytesOut: 1876543 },
            dependencies: ['gateway-service'],
            environment: 'development',
            configuration: {
                autoRestart: true,
                healthCheckEnabled: true,
                logLevel: 'info',
                scaling: { minInstances: 1, maxInstances: 3, currentInstances: 1 }
            },
            metrics: {
                requestsPerSecond: 234.5,
                responseTime: 67,
                errorRate: 0.3,
                availability: 99.7
            },
            logs: [
                { level: 'info', message: 'Hot reload completed successfully', timestamp: '2024-08-06T10:25:00Z' },
                { level: 'debug', message: 'Component tree optimized', timestamp: '2024-08-06T10:20:15Z' }
            ]
        },
        {
            id: 'romai-agi',
            name: 'romai-agi',
            displayName: 'RomAI AGI Server',
            category: 'ai',
            type: 'ml',
            status: 'running',
            health: 'warning',
            version: '2.0.0-beta',
            port: 8000,
            url: 'http://localhost:8000',
            description: 'Advanced Romanian AI with quantum consciousness capabilities',
            uptime: 43200,
            lastRestart: '2024-08-05T22:00:00Z',
            restartCount: 1,
            cpu: 78.5,
            memory: 2048,
            memoryLimit: 4096,
            disk: 15.7,
            diskLimit: 50,
            network: { bytesIn: 876543, bytesOut: 654321 },
            dependencies: [],
            environment: 'development',
            configuration: {
                autoRestart: true,
                healthCheckEnabled: true,
                logLevel: 'debug',
                scaling: { minInstances: 1, maxInstances: 2, currentInstances: 1 }
            },
            metrics: {
                requestsPerSecond: 45.2,
                responseTime: 1200,
                errorRate: 1.2,
                availability: 98.5
            },
            logs: [
                { level: 'warning', message: 'GPU memory usage approaching limit', timestamp: '2024-08-06T10:28:00Z' },
                { level: 'info', message: 'Quantum consciousness engine initialized', timestamp: '2024-08-06T10:00:00Z' }
            ]
        },
        {
            id: 'admin-dashboard',
            name: 'admin-dashboard',
            displayName: 'Admin Dashboard',
            category: 'frontend',
            type: 'web',
            status: 'error',
            health: 'critical',
            version: '1.0.0',
            port: 4007,
            description: 'Administrative dashboard for system management',
            uptime: 0,
            lastRestart: '2024-08-06T10:30:00Z',
            restartCount: 5,
            cpu: 0,
            memory: 0,
            memoryLimit: 256,
            disk: 0.5,
            diskLimit: 5,
            network: { bytesIn: 0, bytesOut: 0 },
            dependencies: ['gateway-service'],
            environment: 'development',
            configuration: {
                autoRestart: false,
                healthCheckEnabled: true,
                logLevel: 'error',
                scaling: { minInstances: 1, maxInstances: 2, currentInstances: 0 }
            },
            metrics: {
                requestsPerSecond: 0,
                responseTime: 0,
                errorRate: 100,
                availability: 0
            },
            logs: [
                { level: 'error', message: 'Failed to start: Port already in use', timestamp: '2024-08-06T10:30:15Z' },
                { level: 'error', message: 'Dependency check failed', timestamp: '2024-08-06T10:30:10Z' }
            ]
        }
    ]);

    // Service categories
    const categories: ServiceCategory[] = [
        {
            id: 'core',
            name: 'Core Services',
            description: 'Essential system components',
            services: ['gateway-service', 'cbd-database'],
            color: 'blue'
        },
        {
            id: 'frontend',
            name: 'Frontend Apps',
            description: 'User-facing applications',
            services: ['codai-app', 'admin-dashboard'],
            color: 'green'
        },
        {
            id: 'ai',
            name: 'AI Services',
            description: 'Artificial intelligence and ML services',
            services: ['memorai-mcp', 'romai-agi'],
            color: 'purple'
        },
        {
            id: 'data',
            name: 'Data Services',
            description: 'Database and storage systems',
            services: ['cbd-database'],
            color: 'orange'
        },
        {
            id: 'infrastructure',
            name: 'Infrastructure',
            description: 'Core infrastructure services',
            services: ['gateway-service'],
            color: 'gray'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running':
                return 'text-green-600 bg-green-100';
            case 'stopped':
                return 'text-gray-600 bg-gray-100';
            case 'error':
                return 'text-red-600 bg-red-100';
            case 'starting':
            case 'stopping':
            case 'restarting':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'healthy':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'critical':
                return 'text-red-600';
            case 'unknown':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'healthy':
                return <CheckCircle className="w-4 h-4" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4" />;
            case 'critical':
                return <XCircle className="w-4 h-4" />;
            case 'unknown':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        const cat = categories.find(c => c.id === category);
        return cat?.color || 'gray';
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleServiceAction = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return;

        // Update service status
        const updatedServices = services.map(s => {
            if (s.id === serviceId) {
                let newStatus = s.status;
                switch (action) {
                    case 'start':
                        newStatus = s.status === 'stopped' ? 'starting' : s.status;
                        break;
                    case 'stop':
                        newStatus = s.status === 'running' ? 'stopping' : s.status;
                        break;
                    case 'restart':
                        newStatus = 'restarting';
                        break;
                }
                return { ...s, status: newStatus };
            }
            return s;
        });

        setServices(updatedServices);

        // Simulate action completion
        setTimeout(() => {
            setServices(prevServices =>
                prevServices.map(s => {
                    if (s.id === serviceId) {
                        let finalStatus = s.status;
                        switch (action) {
                            case 'start':
                                finalStatus = 'running';
                                break;
                            case 'stop':
                                finalStatus = 'stopped';
                                break;
                            case 'restart':
                                finalStatus = 'running';
                                break;
                        }
                        return {
                            ...s,
                            status: finalStatus,
                            lastRestart: action === 'restart' ? new Date().toISOString() : s.lastRestart,
                            restartCount: action === 'restart' ? s.restartCount + 1 : s.restartCount
                        };
                    }
                    return s;
                })
            );
        }, 3000);
    };

    const refreshServices = async () => {
        setRefreshing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Simulate updated metrics
            setServices(prevServices =>
                prevServices.map(service => ({
                    ...service,
                    cpu: Math.max(0, service.cpu + (Math.random() - 0.5) * 10),
                    memory: Math.max(0, service.memory + (Math.random() - 0.5) * 50),
                    metrics: {
                        ...service.metrics,
                        requestsPerSecond: Math.max(0, service.metrics.requestsPerSecond + (Math.random() - 0.5) * 20),
                        responseTime: Math.max(1, service.metrics.responseTime + (Math.random() - 0.5) * 10)
                    }
                }))
            );
        } catch (error) {
            console.error('Failed to refresh services:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
        const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
        const matchesHealth = healthFilter === 'all' || service.health === healthFilter;

        return matchesSearch && matchesCategory && matchesStatus && matchesHealth;
    });

    const sortedServices = [...filteredServices].sort((a, b) => {
        const aValue = a[sortBy as keyof Service];
        const bValue = b[sortBy as keyof Service];

        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    // Calculate statistics
    const stats = {
        total: services.length,
        running: services.filter(s => s.status === 'running').length,
        stopped: services.filter(s => s.status === 'stopped').length,
        error: services.filter(s => s.status === 'error').length,
        healthy: services.filter(s => s.health === 'healthy').length,
        warning: services.filter(s => s.health === 'warning').length,
        critical: services.filter(s => s.health === 'critical').length
    };

    return (
        <div className="lg:pl-64">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
                        <p className="text-gray-600 mt-1">
                            Monitor and manage all system services and applications
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <button
                            onClick={refreshServices}
                            disabled={refreshing}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>

                        <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Plus className="w-4 h-4 mr-2" />
                            Deploy Service
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Services</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Server className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Running</p>
                                <p className="text-2xl font-bold text-green-600">{stats.running}</p>
                            </div>
                            <Play className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Stopped</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.stopped}</p>
                            </div>
                            <Square className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Errors</p>
                                <p className="text-2xl font-bold text-red-600">{stats.error}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Healthy</p>
                                <p className="text-2xl font-bold text-green-600">{stats.healthy}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Warning</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Critical</p>
                                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="running">Running</option>
                                <option value="stopped">Stopped</option>
                                <option value="error">Error</option>
                            </select>

                            <select
                                value={healthFilter}
                                onChange={(e) => setHealthFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Health</option>
                                <option value="healthy">Healthy</option>
                                <option value="warning">Warning</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-3">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="status">Sort by Status</option>
                                <option value="health">Sort by Health</option>
                                <option value="cpu">Sort by CPU</option>
                                <option value="memory">Sort by Memory</option>
                                <option value="uptime">Sort by Uptime</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="p-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedServices.map((service) => (
                        <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Service Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg bg-${getCategoryColor(service.category)}-100`}>
                                            <Server className={`w-5 h-5 text-${getCategoryColor(service.category)}-600`} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{service.displayName}</h3>
                                            <p className="text-sm text-gray-500">v{service.version}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <div className={`flex items-center space-x-1 ${getHealthColor(service.health)}`}>
                                            {getHealthIcon(service.health)}
                                            <span className="text-xs font-medium">{service.health}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                                        {service.status}
                                    </span>

                                    {service.url && (
                                        <a
                                            href={service.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 mt-3">{service.description}</p>
                            </div>

                            {/* Service Metrics */}
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Cpu className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs text-gray-500">CPU</span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{service.cpu.toFixed(1)}%</div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-500 h-1.5 rounded-full"
                                                style={{ width: `${Math.min(service.cpu, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <MemoryStick className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs text-gray-500">Memory</span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{service.memory}MB</div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-green-500 h-1.5 rounded-full"
                                                style={{ width: `${(service.memory / service.memoryLimit) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs text-gray-500">Uptime</span>
                                        </div>
                                        <div className="font-medium text-gray-900">{formatUptime(service.uptime)}</div>
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Activity className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs text-gray-500">RPS</span>
                                        </div>
                                        <div className="font-medium text-gray-900">{service.metrics.requestsPerSecond.toFixed(1)}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Zap className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs text-gray-500">Response</span>
                                        </div>
                                        <div className="font-medium text-gray-900">{service.metrics.responseTime}ms</div>
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Shield className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs text-gray-500">Uptime</span>
                                        </div>
                                        <div className="font-medium text-gray-900">{service.metrics.availability}%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Actions */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {service.status === 'running' ? (
                                            <>
                                                <button
                                                    onClick={() => handleServiceAction(service.id, 'stop')}
                                                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Stop"
                                                >
                                                    <Square className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleServiceAction(service.id, 'restart')}
                                                    className="p-1.5 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                                                    title="Restart"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleServiceAction(service.id, 'start')}
                                                className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                                                title="Start"
                                            >
                                                <Play className="w-4 h-4" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setSelectedService(service)}
                                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        <button className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        Port {service.port}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Service Details Modal */}
                {selectedService && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg bg-${getCategoryColor(selectedService.category)}-100`}>
                                            <Server className={`w-6 h-6 text-${getCategoryColor(selectedService.category)}-600`} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-gray-900">{selectedService.displayName}</h3>
                                            <p className="text-sm text-gray-500">{selectedService.name} v{selectedService.version}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedService(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Service Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Status:</span>
                                                <span className={`font-medium ${getStatusColor(selectedService.status)}`}>
                                                    {selectedService.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Health:</span>
                                                <span className={`font-medium ${getHealthColor(selectedService.health)}`}>
                                                    {selectedService.health}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Port:</span>
                                                <span className="text-gray-900 font-medium">{selectedService.port}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Uptime:</span>
                                                <span className="text-gray-900 font-medium">{formatUptime(selectedService.uptime)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Restarts:</span>
                                                <span className="text-gray-900 font-medium">{selectedService.restartCount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Resource Usage</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-500">CPU Usage</span>
                                                    <span className="text-gray-900 font-medium">{selectedService.cpu.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${Math.min(selectedService.cpu, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-500">Memory Usage</span>
                                                    <span className="text-gray-900 font-medium">
                                                        {selectedService.memory}MB / {selectedService.memoryLimit}MB
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${(selectedService.memory / selectedService.memoryLimit) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-500">Disk Usage</span>
                                                    <span className="text-gray-900 font-medium">
                                                        {selectedService.disk}GB / {selectedService.diskLimit}GB
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-purple-500 h-2 rounded-full"
                                                        style={{ width: `${(selectedService.disk / selectedService.diskLimit) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Metrics</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="text-center p-3 bg-gray-50 rounded">
                                            <div className="text-lg font-medium text-gray-900">{selectedService.metrics.requestsPerSecond.toFixed(1)}</div>
                                            <div className="text-gray-500">Requests/sec</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded">
                                            <div className="text-lg font-medium text-gray-900">{selectedService.metrics.responseTime}ms</div>
                                            <div className="text-gray-500">Avg Response</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded">
                                            <div className="text-lg font-medium text-gray-900">{selectedService.metrics.errorRate}%</div>
                                            <div className="text-gray-500">Error Rate</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded">
                                            <div className="text-lg font-medium text-gray-900">{selectedService.metrics.availability}%</div>
                                            <div className="text-gray-500">Availability</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Logs</h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {selectedService.logs.map((log, index) => (
                                            <div key={index} className="flex items-start space-x-3 text-sm">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${log.level === 'error' ? 'text-red-600 bg-red-100' :
                                                        log.level === 'warning' ? 'text-yellow-600 bg-yellow-100' :
                                                            log.level === 'info' ? 'text-blue-600 bg-blue-100' :
                                                                'text-gray-600 bg-gray-100'
                                                    }`}>
                                                    {log.level}
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                                <span className="text-gray-900 flex-1">{log.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
