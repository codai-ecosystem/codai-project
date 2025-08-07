'use client';

import React, { useState, useEffect } from 'react';
import {
    Server,
    Database,
    Cpu,
    HardDrive,
    Network,
    Activity,
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Zap,
    Globe,
    Shield,
    Package,
    Settings,
    Monitor,
    Thermometer,
    Wifi,
    Power,
    Download,
    Upload,
    Eye,
    MoreVertical,
    PlayCircle,
    PauseCircle,
    StopCircle,
    RotateCcw,
    Terminal,
    FileText,
    Calendar,
    AlertCircle,
    Info
} from 'lucide-react';

interface SystemMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    status: 'healthy' | 'warning' | 'critical';
    threshold: {
        warning: number;
        critical: number;
    };
    history: number[];
}

interface Service {
    id: string;
    name: string;
    type: 'application' | 'database' | 'cache' | 'queue' | 'proxy';
    status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
    port: number;
    version: string;
    uptime: string;
    cpu: number;
    memory: number;
    disk: number;
    network: {
        incoming: number;
        outgoing: number;
    };
    healthCheck: {
        status: boolean;
        lastCheck: string;
        responseTime: number;
    };
    dependencies: string[];
}

interface SystemInfo {
    hostname: string;
    os: string;
    kernel: string;
    architecture: string;
    totalMemory: number;
    totalDisk: number;
    cpuCores: number;
    cpuModel: string;
    uptime: string;
    bootTime: string;
    timezone: string;
    environment: 'development' | 'staging' | 'production';
}

export default function SystemOverview() {
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('1h');

    // Mock system info
    const [systemInfo, setSystemInfo] = useState<SystemInfo>({
        hostname: 'codai-production-01',
        os: 'Ubuntu 22.04.3 LTS',
        kernel: '5.15.0-78-generic',
        architecture: 'x86_64',
        totalMemory: 32768, // MB
        totalDisk: 1024000, // MB
        cpuCores: 16,
        cpuModel: 'Intel Xeon E5-2686 v4',
        uptime: '15d 7h 23m',
        bootTime: '2024-07-22T08:00:00Z',
        timezone: 'UTC',
        environment: 'production'
    });

    // Mock system metrics
    const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
        {
            id: 'cpu',
            name: 'CPU Usage',
            value: 67,
            unit: '%',
            status: 'warning',
            threshold: { warning: 70, critical: 90 },
            history: [45, 52, 48, 67, 59, 71, 65, 67]
        },
        {
            id: 'memory',
            name: 'Memory Usage',
            value: 82,
            unit: '%',
            status: 'critical',
            threshold: { warning: 80, critical: 95 },
            history: [65, 70, 75, 78, 80, 85, 83, 82]
        },
        {
            id: 'disk',
            name: 'Disk Usage',
            value: 45,
            unit: '%',
            status: 'healthy',
            threshold: { warning: 80, critical: 95 },
            history: [40, 42, 43, 44, 45, 45, 45, 45]
        },
        {
            id: 'network',
            name: 'Network Load',
            value: 23,
            unit: '%',
            status: 'healthy',
            threshold: { warning: 70, critical: 90 },
            history: [20, 25, 22, 28, 21, 19, 24, 23]
        },
        {
            id: 'temperature',
            name: 'CPU Temperature',
            value: 68,
            unit: '°C',
            status: 'healthy',
            threshold: { warning: 75, critical: 85 },
            history: [65, 66, 67, 68, 69, 68, 67, 68]
        },
        {
            id: 'load',
            name: 'System Load',
            value: 2.4,
            unit: '',
            status: 'healthy',
            threshold: { warning: 8, critical: 12 },
            history: [1.8, 2.1, 2.3, 2.4, 2.2, 2.5, 2.3, 2.4]
        }
    ]);

    // Mock services
    const [services, setServices] = useState<Service[]>([
        {
            id: '1',
            name: 'CBD Database',
            type: 'database',
            status: 'running',
            port: 4180,
            version: '1.2.0',
            uptime: '15d 7h 23m',
            cpu: 15,
            memory: 256,
            disk: 1024,
            network: { incoming: 1.2, outgoing: 0.8 },
            healthCheck: {
                status: true,
                lastCheck: '2024-08-06T10:30:00Z',
                responseTime: 45
            },
            dependencies: []
        },
        {
            id: '2',
            name: 'MemorAI MCP Server',
            type: 'application',
            status: 'running',
            port: 4950,
            version: '2.1.0',
            uptime: '3d 12h 45m',
            cpu: 28,
            memory: 512,
            disk: 2048,
            network: { incoming: 2.5, outgoing: 1.8 },
            healthCheck: {
                status: true,
                lastCheck: '2024-08-06T10:30:00Z',
                responseTime: 120
            },
            dependencies: ['CBD Database']
        },
        {
            id: '3',
            name: 'RomAI AGI Server',
            type: 'application',
            status: 'running',
            port: 8000,
            version: '3.0.0',
            uptime: '7d 2h 15m',
            cpu: 45,
            memory: 1024,
            disk: 4096,
            network: { incoming: 5.2, outgoing: 3.1 },
            healthCheck: {
                status: true,
                lastCheck: '2024-08-06T10:30:00Z',
                responseTime: 85
            },
            dependencies: ['CBD Database', 'Redis Cache']
        },
        {
            id: '4',
            name: 'Gateway Service',
            type: 'proxy',
            status: 'running',
            port: 4003,
            version: '1.5.2',
            uptime: '12d 18h 33m',
            cpu: 8,
            memory: 128,
            disk: 512,
            network: { incoming: 8.7, outgoing: 12.3 },
            healthCheck: {
                status: true,
                lastCheck: '2024-08-06T10:30:00Z',
                responseTime: 25
            },
            dependencies: []
        },
        {
            id: '5',
            name: 'Redis Cache',
            type: 'cache',
            status: 'running',
            port: 6379,
            version: '7.0.12',
            uptime: '15d 7h 23m',
            cpu: 5,
            memory: 64,
            disk: 128,
            network: { incoming: 0.5, outgoing: 0.3 },
            healthCheck: {
                status: true,
                lastCheck: '2024-08-06T10:30:00Z',
                responseTime: 15
            },
            dependencies: []
        }
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'running':
                return 'text-green-600 bg-green-100';
            case 'warning':
            case 'starting':
                return 'text-yellow-600 bg-yellow-100';
            case 'critical':
            case 'error':
                return 'text-red-600 bg-red-100';
            case 'stopped':
            case 'stopping':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getServiceTypeIcon = (type: string) => {
        switch (type) {
            case 'database':
                return <Database className="w-4 h-4" />;
            case 'application':
                return <Package className="w-4 h-4" />;
            case 'cache':
                return <Zap className="w-4 h-4" />;
            case 'queue':
                return <BarChart3 className="w-4 h-4" />;
            case 'proxy':
                return <Globe className="w-4 h-4" />;
            default:
                return <Server className="w-4 h-4" />;
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const refreshData = async () => {
        setRefreshing(true);
        try {
            // Simulate API call to refresh system data
            await new Promise(resolve => setTimeout(resolve, 2000));
            // In real app, would fetch fresh data
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Monitor className="w-4 h-4" /> },
        { id: 'services', label: 'Services', icon: <Package className="w-4 h-4" /> },
        { id: 'performance', label: 'Performance', icon: <Activity className="w-4 h-4" /> },
        { id: 'network', label: 'Network', icon: <Network className="w-4 h-4" /> },
        { id: 'logs', label: 'System Logs', icon: <FileText className="w-4 h-4" /> }
    ];

    return (
        <div className="lg:pl-64">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
                        <p className="text-gray-600 mt-1">
                            Monitor system health, performance, and service status
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="5m">Last 5 minutes</option>
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                        </select>

                        <button
                            onClick={refreshData}
                            disabled={refreshing}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* System Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">System Information</h3>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">Hostname: <span className="font-medium text-gray-900">{systemInfo.hostname}</span></p>
                                <p className="text-sm text-gray-600">OS: <span className="font-medium text-gray-900">{systemInfo.os}</span></p>
                                <p className="text-sm text-gray-600">Kernel: <span className="font-medium text-gray-900">{systemInfo.kernel}</span></p>
                                <p className="text-sm text-gray-600">Architecture: <span className="font-medium text-gray-900">{systemInfo.architecture}</span></p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Hardware</h3>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">CPU: <span className="font-medium text-gray-900">{systemInfo.cpuModel}</span></p>
                                <p className="text-sm text-gray-600">Cores: <span className="font-medium text-gray-900">{systemInfo.cpuCores}</span></p>
                                <p className="text-sm text-gray-600">Memory: <span className="font-medium text-gray-900">{formatBytes(systemInfo.totalMemory * 1024 * 1024)}</span></p>
                                <p className="text-sm text-gray-600">Disk: <span className="font-medium text-gray-900">{formatBytes(systemInfo.totalDisk * 1024 * 1024)}</span></p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Runtime</h3>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">Uptime: <span className="font-medium text-gray-900">{systemInfo.uptime}</span></p>
                                <p className="text-sm text-gray-600">Boot Time: <span className="font-medium text-gray-900">{formatDate(systemInfo.bootTime)}</span></p>
                                <p className="text-sm text-gray-600">Timezone: <span className="font-medium text-gray-900">{systemInfo.timezone}</span></p>
                                <p className="text-sm text-gray-600">Environment: <span className={`font-medium ${systemInfo.environment === 'production' ? 'text-red-600' : 'text-green-600'}`}>{systemInfo.environment}</span></p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                                    <Terminal className="w-4 h-4 mr-2" />
                                    Open Terminal
                                </button>
                                <button className="w-full flex items-center justify-center px-3 py-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Restart Services
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${selectedTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {selectedTab === 'overview' && (
                            <div className="space-y-6">
                                {/* System Metrics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {systemMetrics.map((metric) => (
                                        <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-medium text-gray-700">{metric.name}</h3>
                                                <div className={`p-1 rounded ${getStatusColor(metric.status)}`}>
                                                    {metric.status === 'healthy' && <CheckCircle className="w-3 h-3" />}
                                                    {metric.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                                                    {metric.status === 'critical' && <XCircle className="w-3 h-3" />}
                                                </div>
                                            </div>

                                            <div className="flex items-baseline space-x-2 mb-2">
                                                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                                                <span className="text-sm text-gray-500">{metric.unit}</span>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                <div
                                                    className={`h-2 rounded-full ${metric.status === 'healthy' ? 'bg-green-500' :
                                                            metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${Math.min(metric.value, 100)}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                                                <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Services Tab */}
                        {selectedTab === 'services' && (
                            <div className="space-y-4">
                                {services.map((service) => (
                                    <div key={service.id} className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                                                    {getServiceTypeIcon(service.type)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>v{service.version}</span>
                                                        <span>Port {service.port}</span>
                                                        <span>Type: {service.type}</span>
                                                        <span>Uptime: {service.uptime}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(service.status)}`}>
                                                    {service.status}
                                                </span>
                                                <button className="p-2 text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="bg-white rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500">CPU Usage</p>
                                                        <p className="text-lg font-semibold text-gray-900">{service.cpu}%</p>
                                                    </div>
                                                    <Cpu className="w-6 h-6 text-blue-600" />
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Memory</p>
                                                        <p className="text-lg font-semibold text-gray-900">{service.memory}MB</p>
                                                    </div>
                                                    <Activity className="w-6 h-6 text-green-600" />
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Disk</p>
                                                        <p className="text-lg font-semibold text-gray-900">{service.disk}MB</p>
                                                    </div>
                                                    <HardDrive className="w-6 h-6 text-purple-600" />
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Health Check</p>
                                                        <p className="text-lg font-semibold text-gray-900">{service.healthCheck.responseTime}ms</p>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full ${service.healthCheck.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span className="flex items-center">
                                                    <Download className="w-4 h-4 mr-1" />
                                                    In: {service.network.incoming} MB/s
                                                </span>
                                                <span className="flex items-center">
                                                    <Upload className="w-4 h-4 mr-1" />
                                                    Out: {service.network.outgoing} MB/s
                                                </span>
                                                <span>Dependencies: {service.dependencies.length > 0 ? service.dependencies.join(', ') : 'None'}</span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button className="flex items-center px-3 py-1 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View Logs
                                                </button>
                                                <button className="flex items-center px-3 py-1 text-sm text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100">
                                                    <RotateCcw className="w-4 h-4 mr-1" />
                                                    Restart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Performance Tab */}
                        {selectedTab === 'performance' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {systemMetrics.slice(0, 4).map((metric) => (
                                        <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-sm font-medium text-gray-700 mb-3">{metric.name} History</h3>
                                            <div className="h-32 bg-white rounded border flex items-end space-x-1 p-2">
                                                {metric.history.map((value, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex-1 bg-blue-500 rounded-t"
                                                        style={{ height: `${(value / 100) * 100}%` }}
                                                        title={`${value}${metric.unit}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Last 8 data points</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Network Tab */}
                        {selectedTab === 'network' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">Network Interfaces</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-white rounded">
                                                <div className="flex items-center space-x-3">
                                                    <Wifi className="w-5 h-5 text-green-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">eth0</p>
                                                        <p className="text-xs text-gray-500">192.168.1.100</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white rounded">
                                                <div className="flex items-center space-x-3">
                                                    <Network className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">lo</p>
                                                        <p className="text-xs text-gray-500">127.0.0.1</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">Port Status</h3>
                                        <div className="space-y-2">
                                            {services.map((service) => (
                                                <div key={service.id} className="flex items-center justify-between p-2 bg-white rounded text-sm">
                                                    <span>{service.port}</span>
                                                    <span className="text-gray-600">{service.name}</span>
                                                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(service.status)}`}>
                                                        {service.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* System Logs Tab */}
                        {selectedTab === 'logs' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Recent System Logs</h3>
                                    <button className="flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Refresh Logs
                                    </button>
                                </div>

                                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                    <div className="space-y-1 text-green-400">
                                        <div>[2024-08-06 10:30:15] INFO: System boot completed successfully</div>
                                        <div>[2024-08-06 10:29:45] INFO: Starting CBD Database service on port 4180</div>
                                        <div>[2024-08-06 10:29:42] INFO: Initializing MemorAI MCP Server</div>
                                        <div>[2024-08-06 10:29:38] INFO: Loading system configuration</div>
                                        <div className="text-yellow-400">[2024-08-06 10:29:35] WARN: High memory usage detected</div>
                                        <div>[2024-08-06 10:29:30] INFO: RomAI AGI Server health check passed</div>
                                        <div>[2024-08-06 10:29:25] INFO: Network interfaces initialized</div>
                                        <div className="text-red-400">[2024-08-06 10:29:20] ERROR: Temporary connection timeout to external service</div>
                                        <div>[2024-08-06 10:29:15] INFO: Gateway Service proxy started</div>
                                        <div>[2024-08-06 10:29:10] INFO: Redis Cache connection established</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
