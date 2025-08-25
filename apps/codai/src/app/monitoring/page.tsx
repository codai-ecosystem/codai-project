'use client';

import React, { useState } from 'react';
import {
    Monitor,
    Server,
    Cpu,
    HardDrive,
    Activity,
    Zap,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Bell,
    BellOff,
    Play,
    Pause,
    Square,
    RotateCcw,
    Settings,
    Download,
    Filter,
    Search,
    TrendingUp,
    TrendingDown,
    Wifi,
    WifiOff,
    Database,
    Cloud,
    Globe,
    Shield,
    Lock,
    Unlock,
    BarChart3,
    PieChart,
    LineChart,
    RefreshCw,
    Eye,
    EyeOff,
    Maximize2,
    Minimize2,
    MoreHorizontal,
    Calendar,
    FileText,
    Users,
    Code,
    GitBranch,
    Hash,
    Target,
    Flame,
    Thermometer,
    Gauge,
    Radio,
    Smartphone,
    Laptop,
    Router,
    HelpCircle,
    Link
} from 'lucide-react';

interface SystemMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
    threshold: {
        warning: number;
        critical: number;
    };
    trend: 'up' | 'down' | 'stable';
    lastUpdated: Date;
}

interface ServiceHealth {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'degraded' | 'maintenance';
    uptime: number;
    responseTime: number;
    version: string;
    environment: 'production' | 'staging' | 'development';
    dependencies: string[];
    endpoints: {
        health: string;
        metrics: string;
    };
    lastCheck: Date;
}

interface Alert {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    timestamp: Date;
    acknowledged: boolean;
    assignedTo?: string;
    tags: string[];
    metadata?: Record<string, any>;
}

interface InfrastructureNode {
    id: string;
    name: string;
    type: 'server' | 'database' | 'load_balancer' | 'cdn' | 'cache' | 'queue' | 'storage';
    region: string;
    provider: string;
    status: 'healthy' | 'warning' | 'critical' | 'offline';
    metrics: {
        cpu: number;
        memory: number;
        disk: number;
        network: number;
    };
    instances: number;
    cost: number;
}

const systemMetrics: SystemMetric[] = [
    {
        id: '1',
        name: 'CPU Usage',
        value: 68.5,
        unit: '%',
        status: 'warning',
        threshold: { warning: 70, critical: 90 },
        trend: 'up',
        lastUpdated: new Date(Date.now() - 30000)
    },
    {
        id: '2',
        name: 'Memory Usage',
        value: 45.2,
        unit: '%',
        status: 'healthy',
        threshold: { warning: 80, critical: 95 },
        trend: 'stable',
        lastUpdated: new Date(Date.now() - 15000)
    },
    {
        id: '3',
        name: 'Disk Usage',
        value: 78.9,
        unit: '%',
        status: 'warning',
        threshold: { warning: 75, critical: 90 },
        trend: 'up',
        lastUpdated: new Date(Date.now() - 45000)
    },
    {
        id: '4',
        name: 'Network I/O',
        value: 234.5,
        unit: 'MB/s',
        status: 'healthy',
        threshold: { warning: 500, critical: 800 },
        trend: 'down',
        lastUpdated: new Date(Date.now() - 20000)
    },
    {
        id: '5',
        name: 'Response Time',
        value: 89,
        unit: 'ms',
        status: 'healthy',
        threshold: { warning: 200, critical: 500 },
        trend: 'stable',
        lastUpdated: new Date(Date.now() - 10000)
    },
    {
        id: '6',
        name: 'Error Rate',
        value: 0.12,
        unit: '%',
        status: 'healthy',
        threshold: { warning: 1, critical: 5 },
        trend: 'down',
        lastUpdated: new Date(Date.now() - 25000)
    }
];

const services: ServiceHealth[] = [
    {
        id: '1',
        name: 'CODAI API Gateway',
        status: 'online',
        uptime: 99.98,
        responseTime: 89,
        version: 'v2.4.1',
        environment: 'production',
        dependencies: ['PostgreSQL', 'Redis', 'Elasticsearch'],
        endpoints: {
            health: '/api/health',
            metrics: '/api/metrics'
        },
        lastCheck: new Date(Date.now() - 30000)
    },
    {
        id: '2',
        name: 'MemorAI MCP Server',
        status: 'online',
        uptime: 99.95,
        responseTime: 45,
        version: 'v1.8.3',
        environment: 'production',
        dependencies: ['CBD Database', 'Vector Store'],
        endpoints: {
            health: '/health',
            metrics: '/metrics'
        },
        lastCheck: new Date(Date.now() - 15000)
    },
    {
        id: '3',
        name: 'CBD Database',
        status: 'online',
        uptime: 99.99,
        responseTime: 12,
        version: 'v3.2.0',
        environment: 'production',
        dependencies: [],
        endpoints: {
            health: '/api/health',
            metrics: '/api/metrics'
        },
        lastCheck: new Date(Date.now() - 20000)
    },
    {
        id: '4',
        name: 'RomAI AGI Server',
        status: 'degraded',
        uptime: 97.83,
        responseTime: 245,
        version: 'v0.9.7',
        environment: 'production',
        dependencies: ['PyTorch', 'CUDA', 'Vector Database'],
        endpoints: {
            health: '/health',
            metrics: '/metrics'
        },
        lastCheck: new Date(Date.now() - 10000)
    },
    {
        id: '5',
        name: 'Search Engine',
        status: 'maintenance',
        uptime: 0,
        responseTime: 0,
        version: 'v8.8.0',
        environment: 'production',
        dependencies: ['Elasticsearch Cluster'],
        endpoints: {
            health: '/_health',
            metrics: '/_stats'
        },
        lastCheck: new Date(Date.now() - 300000)
    }
];

const alerts: Alert[] = [
    {
        id: '1',
        title: 'High CPU Usage Detected',
        description: 'CPU usage on production server exceeded 85% for the last 5 minutes',
        severity: 'high',
        source: 'server-prod-01',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        acknowledged: false,
        tags: ['cpu', 'performance', 'production']
    },
    {
        id: '2',
        title: 'Database Connection Pool Warning',
        description: 'PostgreSQL connection pool utilization reached 78%',
        severity: 'medium',
        source: 'postgresql-primary',
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        acknowledged: true,
        assignedTo: 'devops-team',
        tags: ['database', 'connections', 'performance']
    },
    {
        id: '3',
        title: 'SSL Certificate Expiring Soon',
        description: 'SSL certificate for api.codai.dev expires in 7 days',
        severity: 'medium',
        source: 'certificate-monitor',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: false,
        tags: ['ssl', 'security', 'certificate']
    },
    {
        id: '4',
        title: 'Disk Space Warning',
        description: 'Disk usage on /var/log partition reached 82%',
        severity: 'medium',
        source: 'server-prod-03',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        acknowledged: false,
        tags: ['disk', 'storage', 'logs']
    }
];

const infrastructureNodes: InfrastructureNode[] = [
    {
        id: '1',
        name: 'Production API Servers',
        type: 'server',
        region: 'us-east-1',
        provider: 'AWS',
        status: 'warning',
        metrics: { cpu: 68.5, memory: 45.2, disk: 78.9, network: 234.5 },
        instances: 3,
        cost: 1245.67
    },
    {
        id: '2',
        name: 'PostgreSQL Cluster',
        type: 'database',
        region: 'us-east-1',
        provider: 'AWS RDS',
        status: 'healthy',
        metrics: { cpu: 23.1, memory: 67.8, disk: 45.3, network: 89.2 },
        instances: 2,
        cost: 789.23
    },
    {
        id: '3',
        name: 'Redis Cache',
        type: 'cache',
        region: 'us-east-1',
        provider: 'ElastiCache',
        status: 'healthy',
        metrics: { cpu: 12.3, memory: 34.5, disk: 15.7, network: 156.8 },
        instances: 2,
        cost: 234.56
    },
    {
        id: '4',
        name: 'Load Balancer',
        type: 'load_balancer',
        region: 'us-east-1',
        provider: 'AWS ALB',
        status: 'healthy',
        metrics: { cpu: 8.9, memory: 12.3, disk: 0, network: 567.9 },
        instances: 1,
        cost: 78.90
    }
];

export default function MonitoringPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);
    const [alertsFilter, setAlertsFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'online':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'warning':
            case 'degraded':
                return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'critical':
            case 'offline':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'maintenance':
                return <Clock className="w-4 h-4 text-blue-600" />;
            default:
                return <HelpCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'online':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'warning':
            case 'degraded':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'critical':
            case 'offline':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'maintenance':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'server': return <Server className="w-4 h-4" />;
            case 'database': return <Database className="w-4 h-4" />;
            case 'load_balancer': return <Router className="w-4 h-4" />;
            case 'cdn': return <Globe className="w-4 h-4" />;
            case 'cache': return <Zap className="w-4 h-4" />;
            case 'queue': return <Radio className="w-4 h-4" />;
            case 'storage': return <HardDrive className="w-4 h-4" />;
            default: return <Monitor className="w-4 h-4" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-3 h-3 text-red-600" />;
            case 'down': return <TrendingDown className="w-3 h-3 text-green-600" />;
            default: return <Activity className="w-3 h-3 text-gray-600" />;
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesFilter = alertsFilter === 'all' || alert.severity === alertsFilter;
        const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const systemHealthScore = Math.round(
        systemMetrics.reduce((acc, metric) => {
            const score = metric.status === 'healthy' ? 100 :
                metric.status === 'warning' ? 70 :
                    metric.status === 'critical' ? 30 : 0;
            return acc + score;
        }, 0) / systemMetrics.length
    );

    return (
        <div className="min-h-screen bg-gray-50 ml-80">
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
                            <p className="text-gray-600 mt-2">Monitor infrastructure health, performance metrics, and system alerts</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className="text-sm text-gray-600">
                                    {autoRefresh ? `Auto-refresh (${refreshInterval}s)` : 'Manual refresh'}
                                </span>
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                            </div>
                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Settings className="w-4 h-4" />
                                <span>Configure</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Health Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Gauge className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className={`text-2xl font-bold ${systemHealthScore >= 90 ? 'text-green-600' :
                                systemHealthScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {systemHealthScore}%
                            </span>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">System Health</p>
                            <p className="text-sm text-gray-600">Overall system status</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-2xl font-bold text-green-600">
                                {services.filter(s => s.status === 'online').length}/{services.length}
                            </span>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">Services Online</p>
                            <p className="text-sm text-gray-600">Active services</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <span className="text-2xl font-bold text-red-600">
                                {alerts.filter(a => !a.acknowledged).length}
                            </span>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">Active Alerts</p>
                            <p className="text-sm text-gray-600">Unacknowledged</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-2xl font-bold text-purple-600">99.8%</span>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">Uptime</p>
                            <p className="text-sm text-gray-600">Last 30 days</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('services')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'services'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Services
                            </button>
                            <button
                                onClick={() => setActiveTab('alerts')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'alerts'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Alerts
                            </button>
                            <button
                                onClick={() => setActiveTab('infrastructure')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'infrastructure'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Infrastructure
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* System Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {systemMetrics.map((metric) => (
                                        <div key={metric.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(metric.status)}
                                                    <span className="font-medium text-gray-900">{metric.name}</span>
                                                </div>
                                                {getTrendIcon(metric.trend)}
                                            </div>

                                            <div className="mb-4">
                                                <div className="flex items-baseline space-x-1">
                                                    <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                                                    <span className="text-sm text-gray-600">{metric.unit}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                                                    <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${metric.status === 'healthy' ? 'bg-green-600' :
                                                            metric.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                                                            }`}
                                                        style={{
                                                            width: `${Math.min((metric.value / metric.threshold.critical) * 100, 100)}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-500 mt-3">
                                                Updated {Math.floor((Date.now() - metric.lastUpdated.getTime()) / 1000)}s ago
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Performance Chart */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
                                        <div className="flex items-center space-x-2">
                                            <select className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option>Last 24 hours</option>
                                                <option>Last 7 days</option>
                                                <option>Last 30 days</option>
                                            </select>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <Maximize2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-600">Performance Trends Chart</p>
                                            <p className="text-sm text-gray-500">Real-time system metrics visualization</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div className="space-y-6">
                                {/* Services List */}
                                <div className="space-y-4">
                                    {services.map((service) => (
                                        <div
                                            key={service.id}
                                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => setSelectedService(service)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            {getStatusIcon(service.status)}
                                                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                                                            {service.status}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.environment === 'production' ? 'bg-red-100 text-red-800' :
                                                            service.environment === 'staging' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {service.environment}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Uptime</p>
                                                            <p className="font-semibold text-gray-900">{service.uptime}%</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Response Time</p>
                                                            <p className="font-semibold text-gray-900">{service.responseTime}ms</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Version</p>
                                                            <p className="font-semibold text-gray-900">{service.version}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Last Check</p>
                                                            <p className="font-semibold text-gray-900">
                                                                {Math.floor((Date.now() - service.lastCheck.getTime()) / 1000)}s ago
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center space-x-1">
                                                            <Globe className="w-4 h-4 text-gray-400" />
                                                            <code className="text-sm text-gray-600">{service.endpoints.health}</code>
                                                        </div>
                                                        {service.dependencies.length > 0 && (
                                                            <div className="flex items-center space-x-1">
                                                                <Link className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm text-gray-600">
                                                                    {service.dependencies.length} dependencies
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col space-y-2 ml-4">
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'alerts' && (
                            <div className="space-y-6">
                                {/* Alert Filters */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Search alerts..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                                                />
                                            </div>

                                            <select
                                                value={alertsFilter}
                                                onChange={(e) => setAlertsFilter(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">All Severities</option>
                                                <option value="critical">Critical</option>
                                                <option value="high">High</option>
                                                <option value="medium">Medium</option>
                                                <option value="low">Low</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                                <Bell className="w-4 h-4" />
                                                <span>Configure Alerts</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Alerts List */}
                                <div className="space-y-4">
                                    {filteredAlerts.map((alert) => (
                                        <div key={alert.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                                                            {alert.severity}
                                                        </span>
                                                        {alert.acknowledged && (
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                                Acknowledged
                                                            </span>
                                                        )}
                                                        <span className="text-sm text-gray-600">
                                                            {Math.floor((Date.now() - alert.timestamp.getTime()) / (1000 * 60))}m ago
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{alert.title}</h3>
                                                    <p className="text-gray-600 mb-4">{alert.description}</p>

                                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                        <div className="flex items-center space-x-1">
                                                            <Server className="w-4 h-4" />
                                                            <span>{alert.source}</span>
                                                        </div>
                                                        {alert.assignedTo && (
                                                            <div className="flex items-center space-x-1">
                                                                <Users className="w-4 h-4" />
                                                                <span>{alert.assignedTo}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center space-x-1">
                                                            <Hash className="w-4 h-4" />
                                                            <span>{alert.tags.join(', ')}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col space-y-2 ml-4">
                                                    {!alert.acknowledged && (
                                                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                                            Acknowledge
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'infrastructure' && (
                            <div className="space-y-6">
                                {/* Infrastructure Overview */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Infrastructure Map</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {infrastructureNodes.map((node) => (
                                            <div key={node.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 rounded-lg ${node.status === 'healthy' ? 'bg-green-100' :
                                                            node.status === 'warning' ? 'bg-yellow-100' :
                                                                node.status === 'critical' ? 'bg-red-100' : 'bg-gray-100'
                                                            }`}>
                                                            {getTypeIcon(node.type)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{node.name}</h4>
                                                            <p className="text-sm text-gray-600">{node.provider} - {node.region}</p>
                                                        </div>
                                                    </div>
                                                    {getStatusIcon(node.status)}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">CPU</p>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{ width: `${node.metrics.cpu}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium">{node.metrics.cpu}%</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Memory</p>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-green-600 h-2 rounded-full"
                                                                    style={{ width: `${node.metrics.memory}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium">{node.metrics.memory}%</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">{node.instances} instances</span>
                                                    <span className="font-medium text-gray-900">${node.cost.toFixed(2)}/month</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Service Details */}
                        {selectedService && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{selectedService.name}</h4>
                                        <div className="flex items-center space-x-2 mt-1">
                                            {getStatusIcon(selectedService.status)}
                                            <span className="text-sm text-gray-600">{selectedService.status}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Version</span>
                                            <span className="font-medium">{selectedService.version}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Environment</span>
                                            <span className="font-medium">{selectedService.environment}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Uptime</span>
                                            <span className="font-medium">{selectedService.uptime}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Response Time</span>
                                            <span className="font-medium">{selectedService.responseTime}ms</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <h5 className="font-medium text-gray-900 mb-2">Dependencies</h5>
                                        <div className="space-y-1">
                                            {selectedService.dependencies.map((dep, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                                    <span className="text-sm text-gray-600">{dep}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex flex-col space-y-2">
                                            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                <Eye className="w-4 h-4" />
                                                <span>View Details</span>
                                            </button>
                                            <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                                <Settings className="w-4 h-4" />
                                                <span>Configure</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

                            <div className="space-y-3">
                                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                    <Bell className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Create Alert Rule</p>
                                        <p className="text-sm text-gray-500">Set up monitoring alerts</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">View Metrics</p>
                                        <p className="text-sm text-gray-500">Detailed performance metrics</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                    <Settings className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <p className="font-medium">Configure Monitoring</p>
                                        <p className="text-sm text-gray-500">Adjust monitoring settings</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                    <Download className="w-5 h-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium">Export Reports</p>
                                        <p className="text-sm text-gray-500">Download monitoring data</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Overall Health</span>
                                    <div className="flex items-center space-x-1">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-600">Healthy</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Last Incident</span>
                                    <span className="text-sm font-medium text-gray-900">3 days ago</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Active Monitors</span>
                                    <span className="text-sm font-medium text-gray-900">24</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Data Retention</span>
                                    <span className="text-sm font-medium text-gray-900">90 days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
