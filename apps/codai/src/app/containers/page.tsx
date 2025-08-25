'use client';

import React, { useState } from 'react';
import {
    Container,
    Play,
    Pause,
    Square,
    RotateCcw,
    Trash2,
    Download,
    Upload,
    Settings,
    Monitor,
    Activity,
    Cpu,
    HardDrive,
    Wifi,
    Database,
    Globe,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Terminal,
    FileText,
    Search,
    Filter,
    RefreshCw,
    Plus,
    Edit,
    Copy,
    ExternalLink,
    AlertTriangle,
    CheckCircle,
    Clock,
    Circle,
    Minus,
    Calendar,
    Users,
    Tag,
    Layers,
    Box,
    Server,
    Cloud,
    Code,
    Zap,
    Shield,
    Gauge,
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Power,
    PowerOff,
    Maximize,
    Minimize,
    Volume2,
    VolumeX,
    Link,
    Unlink,
    GitBranch,
    Image,
    Package,
    Bookmark,
    BookmarkCheck,
    Workflow,
    Route,
    MapPin,
    Network,
    Anchor,
    Compass,
    Archive
} from 'lucide-react';

interface DockerContainer {
    id: string;
    name: string;
    image: string;
    status: 'running' | 'stopped' | 'paused' | 'restarting' | 'dead';
    created: Date;
    ports: string[];
    volumes: string[];
    networks: string[];
    cpuUsage: number;
    memoryUsage: number;
    memoryLimit: string;
    uptime: string;
    restartCount: number;
    environment: string[];
    labels: Record<string, string>;
    health: 'healthy' | 'unhealthy' | 'starting' | 'none';
}

interface DockerImage {
    id: string;
    repository: string;
    tag: string;
    size: string;
    created: Date;
    inUse: boolean;
    vulnerabilities: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

interface DockerVolume {
    name: string;
    driver: string;
    mountpoint: string;
    size: string;
    created: Date;
    inUse: boolean;
    containers: string[];
}

interface DockerNetwork {
    id: string;
    name: string;
    driver: string;
    scope: string;
    containers: number;
    created: Date;
    internal: boolean;
}

const mockContainers: DockerContainer[] = [
    {
        id: 'cont_1',
        name: 'codai-api',
        image: 'codai/api:latest',
        status: 'running',
        created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        ports: ['3000:3000', '3001:3001'],
        volumes: ['codai-data:/app/data', 'logs:/app/logs'],
        networks: ['codai-network', 'bridge'],
        cpuUsage: 45.2,
        memoryUsage: 234.5,
        memoryLimit: '512MB',
        uptime: '2d 14h 32m',
        restartCount: 0,
        environment: ['NODE_ENV=production', 'PORT=3000', 'DB_HOST=postgres'],
        labels: { 'app': 'codai-api', 'version': '1.2.3', 'environment': 'production' },
        health: 'healthy'
    },
    {
        id: 'cont_2',
        name: 'postgres-db',
        image: 'postgres:15-alpine',
        status: 'running',
        created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        ports: ['5432:5432'],
        volumes: ['postgres-data:/var/lib/postgresql/data'],
        networks: ['codai-network'],
        cpuUsage: 12.8,
        memoryUsage: 156.7,
        memoryLimit: '256MB',
        uptime: '5d 8h 15m',
        restartCount: 1,
        environment: ['POSTGRES_DB=codai', 'POSTGRES_USER=admin'],
        labels: { 'app': 'database', 'type': 'postgres' },
        health: 'healthy'
    },
    {
        id: 'cont_3',
        name: 'redis-cache',
        image: 'redis:7-alpine',
        status: 'running',
        created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        ports: ['6379:6379'],
        volumes: ['redis-data:/data'],
        networks: ['codai-network'],
        cpuUsage: 8.5,
        memoryUsage: 45.2,
        memoryLimit: '128MB',
        uptime: '3d 12h 45m',
        restartCount: 0,
        environment: ['REDIS_PASSWORD=secure123'],
        labels: { 'app': 'cache', 'type': 'redis' },
        health: 'healthy'
    },
    {
        id: 'cont_4',
        name: 'nginx-proxy',
        image: 'nginx:alpine',
        status: 'running',
        created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        ports: ['80:80', '443:443'],
        volumes: ['nginx-config:/etc/nginx', 'ssl-certs:/etc/ssl'],
        networks: ['codai-network', 'bridge'],
        cpuUsage: 5.1,
        memoryUsage: 28.4,
        memoryLimit: '64MB',
        uptime: '1d 6h 23m',
        restartCount: 0,
        environment: ['NGINX_HOST=codai.dev'],
        labels: { 'app': 'proxy', 'type': 'nginx' },
        health: 'healthy'
    },
    {
        id: 'cont_5',
        name: 'monitoring-agent',
        image: 'codai/monitor:v2.1',
        status: 'stopped',
        created: new Date(Date.now() - 6 * 60 * 60 * 1000),
        ports: ['9090:9090'],
        volumes: ['monitor-data:/data'],
        networks: ['codai-network'],
        cpuUsage: 0,
        memoryUsage: 0,
        memoryLimit: '128MB',
        uptime: '0s',
        restartCount: 3,
        environment: ['MONITOR_INTERVAL=30s'],
        labels: { 'app': 'monitoring', 'critical': 'true' },
        health: 'none'
    }
];

const mockImages: DockerImage[] = [
    {
        id: 'img_1',
        repository: 'codai/api',
        tag: 'latest',
        size: '245MB',
        created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        inUse: true,
        vulnerabilities: { critical: 0, high: 1, medium: 3, low: 8 }
    },
    {
        id: 'img_2',
        repository: 'postgres',
        tag: '15-alpine',
        size: '158MB',
        created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        inUse: true,
        vulnerabilities: { critical: 0, high: 0, medium: 1, low: 2 }
    },
    {
        id: 'img_3',
        repository: 'redis',
        tag: '7-alpine',
        size: '29MB',
        created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        inUse: true,
        vulnerabilities: { critical: 0, high: 0, medium: 0, low: 1 }
    },
    {
        id: 'img_4',
        repository: 'nginx',
        tag: 'alpine',
        size: '23MB',
        created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        inUse: true,
        vulnerabilities: { critical: 0, high: 0, medium: 2, low: 4 }
    },
    {
        id: 'img_5',
        repository: 'codai/monitor',
        tag: 'v2.0',
        size: '89MB',
        created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        inUse: false,
        vulnerabilities: { critical: 1, high: 2, medium: 5, low: 12 }
    }
];

const mockVolumes: DockerVolume[] = [
    {
        name: 'codai-data',
        driver: 'local',
        mountpoint: '/var/lib/docker/volumes/codai-data/_data',
        size: '2.3GB',
        created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        inUse: true,
        containers: ['codai-api']
    },
    {
        name: 'postgres-data',
        driver: 'local',
        mountpoint: '/var/lib/docker/volumes/postgres-data/_data',
        size: '456MB',
        created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        inUse: true,
        containers: ['postgres-db']
    },
    {
        name: 'redis-data',
        driver: 'local',
        mountpoint: '/var/lib/docker/volumes/redis-data/_data',
        size: '12MB',
        created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        inUse: true,
        containers: ['redis-cache']
    },
    {
        name: 'logs',
        driver: 'local',
        mountpoint: '/var/lib/docker/volumes/logs/_data',
        size: '789MB',
        created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        inUse: true,
        containers: ['codai-api', 'nginx-proxy']
    }
];

const mockNetworks: DockerNetwork[] = [
    {
        id: 'net_1',
        name: 'codai-network',
        driver: 'bridge',
        scope: 'local',
        containers: 4,
        created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        internal: false
    },
    {
        id: 'net_2',
        name: 'bridge',
        driver: 'bridge',
        scope: 'local',
        containers: 2,
        created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        internal: false
    },
    {
        id: 'net_3',
        name: 'monitoring-net',
        driver: 'overlay',
        scope: 'swarm',
        containers: 0,
        created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        internal: true
    }
];

export default function ContainersPage() {
    const [selectedTab, setSelectedTab] = useState('containers');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedContainers, setSelectedContainers] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <Play className="w-4 h-4 text-green-600" />;
            case 'stopped': return <Square className="w-4 h-4 text-gray-600" />;
            case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
            case 'restarting': return <RotateCcw className="w-4 h-4 text-blue-600 animate-spin" />;
            case 'dead': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default: return <Circle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-green-600 bg-green-100 border-green-200';
            case 'stopped': return 'text-gray-600 bg-gray-100 border-gray-200';
            case 'paused': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'restarting': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'dead': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'unhealthy': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'starting': return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'none': return <Minus className="w-4 h-4 text-gray-400" />;
            default: return <Circle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getVulnerabilityColor = (level: 'critical' | 'high' | 'medium' | 'low', count: number) => {
        if (count === 0) return 'text-gray-400';
        switch (level) {
            case 'critical': return 'text-red-600';
            case 'high': return 'text-orange-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-blue-600';
            default: return 'text-gray-400';
        }
    };

    const filteredContainers = mockContainers.filter(container => {
        const matchesSearch = !searchQuery ||
            container.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            container.image.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || container.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const runningContainers = mockContainers.filter(c => c.status === 'running').length;
    const totalCpuUsage = mockContainers.reduce((sum, c) => sum + c.cpuUsage, 0);
    const totalMemoryUsage = mockContainers.reduce((sum, c) => sum + c.memoryUsage, 0);

    return (
        <div className="min-h-screen bg-gray-50 ml-80">
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Container Management</h1>
                            <p className="text-gray-600 mt-2">Manage Docker containers, images, volumes, and networks</p>
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
                            <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 text-sm ${viewMode === 'list'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 text-sm border-l border-gray-300 ${viewMode === 'grid'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Box className="w-4 h-4" />
                                </button>
                            </div>
                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Plus className="w-4 h-4" />
                                <span>Create</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <Container className="w-8 h-8 text-blue-600" />
                            <span className="text-green-600 text-sm font-medium">+2</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{runningContainers}/{mockContainers.length}</p>
                        <p className="text-gray-600 text-sm">Running Containers</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <Image className="w-8 h-8 text-purple-600" />
                            <span className="text-blue-600 text-sm font-medium">{mockImages.filter(i => !i.inUse).length} unused</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{mockImages.length}</p>
                        <p className="text-gray-600 text-sm">Docker Images</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <Cpu className="w-8 h-8 text-green-600" />
                            <span className="text-gray-600 text-sm font-medium">avg</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{(totalCpuUsage / mockContainers.length).toFixed(1)}%</p>
                        <p className="text-gray-600 text-sm">CPU Usage</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <HardDrive className="w-8 h-8 text-orange-600" />
                            <span className="text-yellow-600 text-sm font-medium">total</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{totalMemoryUsage.toFixed(0)}MB</p>
                        <p className="text-gray-600 text-sm">Memory Usage</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <Network className="w-8 h-8 text-red-600" />
                            <span className="text-gray-600 text-sm font-medium">{mockNetworks.length} total</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{mockNetworks.reduce((sum, n) => sum + n.containers, 0)}</p>
                        <p className="text-gray-600 text-sm">Network Connections</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                    {[
                        { id: 'containers', label: 'Containers', icon: Container, count: mockContainers.length },
                        { id: 'images', label: 'Images', icon: Image, count: mockImages.length },
                        { id: 'volumes', label: 'Volumes', icon: HardDrive, count: mockVolumes.length },
                        { id: 'networks', label: 'Networks', icon: Network, count: mockNetworks.length }
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
                            <span className={`px-2 py-1 rounded-full text-xs ${selectedTab === tab.id
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-200 text-gray-600'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {selectedTab === 'containers' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search containers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                    />
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="running">Running</option>
                                    <option value="stopped">Stopped</option>
                                    <option value="paused">Paused</option>
                                    <option value="restarting">Restarting</option>
                                </select>

                                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedContainers.size > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-800">
                                        {selectedContainers.size} container{selectedContainers.size > 1 ? 's' : ''} selected
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                                            <Play className="w-4 h-4" />
                                            <span>Start</span>
                                        </button>
                                        <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700">
                                            <Pause className="w-4 h-4" />
                                            <span>Stop</span>
                                        </button>
                                        <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                                            <Trash2 className="w-4 h-4" />
                                            <span>Remove</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Containers List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedContainers(new Set(filteredContainers.map(c => c.id)));
                                                        } else {
                                                            setSelectedContainers(new Set());
                                                        }
                                                    }}
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Container</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ports</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resources</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uptime</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredContainers.map((container) => (
                                            <tr key={container.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        checked={selectedContainers.has(container.id)}
                                                        onChange={(e) => {
                                                            const newSelected = new Set(selectedContainers);
                                                            if (e.target.checked) {
                                                                newSelected.add(container.id);
                                                            } else {
                                                                newSelected.delete(container.id);
                                                            }
                                                            setSelectedContainers(newSelected);
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <Container className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{container.name}</div>
                                                            <div className="text-sm text-gray-500 font-mono">{container.id.substring(0, 12)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(container.status)}
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(container.status)}`}>
                                                            {container.status}
                                                        </span>
                                                        {container.health !== 'none' && (
                                                            <div className="flex items-center space-x-1">
                                                                {getHealthIcon(container.health)}
                                                                <span className="text-xs text-gray-500">{container.health}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{container.image}</div>
                                                    <div className="text-sm text-gray-500">Created {container.created.toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {container.ports.map((port, index) => (
                                                            <div key={index} className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                                                {port}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Cpu className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-600">{container.cpuUsage.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <HardDrive className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-600">{container.memoryUsage.toFixed(0)}MB</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{container.uptime}</div>
                                                    {container.restartCount > 0 && (
                                                        <div className="text-xs text-gray-500">{container.restartCount} restarts</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        {container.status === 'running' ? (
                                                            <button className="text-gray-400 hover:text-red-600" title="Stop">
                                                                <Square className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button className="text-gray-400 hover:text-green-600" title="Start">
                                                                <Play className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button className="text-gray-400 hover:text-blue-600" title="Restart">
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-400 hover:text-purple-600" title="Logs">
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-400 hover:text-green-600" title="Terminal">
                                                            <Terminal className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-400 hover:text-gray-600" title="More">
                                                            <MoreHorizontal className="w-4 h-4" />
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

                {selectedTab === 'images' && (
                    <div className="space-y-6">
                        {/* Images Grid */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repository</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tag</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vulnerabilities</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockImages.map((image) => (
                                            <tr key={image.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                            <Image className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{image.repository}</div>
                                                            <div className="text-sm text-gray-500 font-mono">{image.id.substring(0, 12)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                                                        {image.tag}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{image.size}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{image.created.toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        {image.vulnerabilities.critical > 0 && (
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getVulnerabilityColor('critical', image.vulnerabilities.critical)} bg-red-100`}>
                                                                {image.vulnerabilities.critical} Critical
                                                            </span>
                                                        )}
                                                        {image.vulnerabilities.high > 0 && (
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getVulnerabilityColor('high', image.vulnerabilities.high)} bg-orange-100`}>
                                                                {image.vulnerabilities.high} High
                                                            </span>
                                                        )}
                                                        {image.vulnerabilities.medium > 0 && (
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getVulnerabilityColor('medium', image.vulnerabilities.medium)} bg-yellow-100`}>
                                                                {image.vulnerabilities.medium} Med
                                                            </span>
                                                        )}
                                                        {Object.values(image.vulnerabilities).every(v => v === 0) && (
                                                            <span className="px-2 py-1 rounded text-xs font-medium text-green-600 bg-green-100">
                                                                Clean
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${image.inUse
                                                        ? 'text-green-600 bg-green-100 border border-green-200'
                                                        : 'text-gray-600 bg-gray-100 border border-gray-200'
                                                        }`}>
                                                        {image.inUse ? 'In Use' : 'Unused'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-gray-400 hover:text-blue-600" title="Pull">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-400 hover:text-green-600" title="Run">
                                                            <Play className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-400 hover:text-purple-600" title="Inspect">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {!image.inUse && (
                                                            <button className="text-gray-400 hover:text-red-600" title="Remove">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
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

                {selectedTab === 'volumes' && (
                    <div className="space-y-6">
                        {/* Volumes Grid */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Containers</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockVolumes.map((volume) => (
                                            <tr key={volume.name} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                            <HardDrive className="w-5 h-5 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{volume.name}</div>
                                                            <div className="text-sm text-gray-500 font-mono truncate max-w-xs">
                                                                {volume.mountpoint}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{volume.driver}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{volume.size}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{volume.created.toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {volume.containers.map((container, index) => (
                                                            <div key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                {container}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${volume.inUse
                                                        ? 'text-green-600 bg-green-100 border border-green-200'
                                                        : 'text-gray-600 bg-gray-100 border border-gray-200'
                                                        }`}>
                                                        {volume.inUse ? 'In Use' : 'Unused'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-gray-400 hover:text-blue-600" title="Inspect">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-400 hover:text-green-600" title="Backup">
                                                            <Archive className="w-4 h-4" />
                                                        </button>
                                                        {!volume.inUse && (
                                                            <button className="text-gray-400 hover:text-red-600" title="Remove">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
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

                {selectedTab === 'networks' && (
                    <div className="space-y-6">
                        {/* Networks Grid */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Network</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scope</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Containers</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockNetworks.map((network) => (
                                            <tr key={network.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                            <Network className="w-5 h-5 text-red-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{network.name}</div>
                                                            <div className="text-sm text-gray-500 font-mono">{network.id.substring(0, 12)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{network.driver}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{network.scope}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{network.containers}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{network.created.toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${network.internal
                                                        ? 'text-orange-600 bg-orange-100 border border-orange-200'
                                                        : 'text-green-600 bg-green-100 border border-green-200'
                                                        }`}>
                                                        {network.internal ? 'Internal' : 'External'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-gray-400 hover:text-blue-600" title="Inspect">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-400 hover:text-green-600" title="Connect">
                                                            <Link className="w-4 h-4" />
                                                        </button>
                                                        {network.containers === 0 && network.name !== 'bridge' && (
                                                            <button className="text-gray-400 hover:text-red-600" title="Remove">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
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
            </div>
        </div>
    );
}
