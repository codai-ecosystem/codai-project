'use client';

import React, { useEffect, useState } from 'react';
import {
    Server,
    Activity,
    Database,
    Cloud,
    Network,
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Play,
    Square,
    RotateCcw,
    Settings,
    Eye,
    BarChart3,
    Cpu,
    HardDrive,
    Zap,
    Globe,
    Lock,
    Unlock,
    Bell,
    Filter,
    Search,
    ExternalLink,
    Monitor,
    Radio,
    Wifi,
    HardDriveIcon,
    MemoryStick,
    ThermometerSun,
    Power,
    Gauge
} from 'lucide-react';

interface ServiceHealth {
    endpoint: string;
    status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
    responseTime: number;
    lastCheck: string;
    message?: string;
}

interface ServiceMetrics {
    cpu: number;
    memory: number;
    disk: number;
    network: {
        inbound: number;
        outbound: number;
    };
    requests: {
        total: number;
        errors: number;
        avgResponseTime: number;
    };
    uptime: string;
    connections: number;
}

interface Service {
    id: string;
    name: string;
    displayName: string;
    type: 'application' | 'database' | 'cache' | 'messaging' | 'monitoring' | 'security' | 'infrastructure';
    status: 'running' | 'stopped' | 'error' | 'warning' | 'maintenance';
    version: string;
    port?: number;
    host: string;
    description: string;
    healthChecks: ServiceHealth[];
    metrics: ServiceMetrics;
    dependencies: string[];
    dependents: string[];
    lastRestart: string;
    autoRestart: boolean;
    scalable: boolean;
    instances: number;
    maxInstances: number;
    tags: string[];
    icon: React.ReactNode;
    color: string;
    configUrl?: string;
    logsUrl?: string;
    metricsUrl?: string;
}

const ServicesPage = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [systemMetrics, setSystemMetrics] = useState({
        totalServices: 0,
        runningServices: 0,
        errorServices: 0,
        avgResponseTime: 0,
        totalRequests: 0,
        systemLoad: 0
    });

    // Initialize services data
    useEffect(() => {
        const servicesData: Service[] = [
            {
                id: 'codai-app',
                name: 'codai',
                displayName: 'CODAI Application',
                type: 'application',
                status: 'running',
                version: '2.1.5',
                port: 4001,
                host: 'localhost',
                description: 'Main AI development platform application server',
                healthChecks: [
                    { endpoint: '/api/health', status: 'healthy', responseTime: 45, lastCheck: '30s ago' },
                    { endpoint: '/api/ai/status', status: 'healthy', responseTime: 67, lastCheck: '30s ago' },
                    { endpoint: '/api/auth/verify', status: 'healthy', responseTime: 23, lastCheck: '30s ago' }
                ],
                metrics: {
                    cpu: 45,
                    memory: 68,
                    disk: 15,
                    network: { inbound: 125.4, outbound: 89.7 },
                    requests: { total: 125000, errors: 45, avgResponseTime: 145 },
                    uptime: '7d 14h 23m',
                    connections: 247
                },
                dependencies: ['postgres-main', 'redis-cache', 'memorai-service'],
                dependents: ['admin-panel', 'hub-central'],
                lastRestart: '7 days ago',
                autoRestart: true,
                scalable: true,
                instances: 3,
                maxInstances: 8,
                tags: ['critical', 'primary', 'api'],
                icon: <Server className="w-5 h-5" />,
                color: 'blue',
                configUrl: '/config/codai',
                logsUrl: '/logs/codai',
                metricsUrl: '/metrics/codai'
            },
            {
                id: 'postgres-main',
                name: 'postgresql',
                displayName: 'PostgreSQL Database',
                type: 'database',
                status: 'running',
                version: '15.4',
                port: 5432,
                host: 'localhost',
                description: 'Primary PostgreSQL database server',
                healthChecks: [
                    { endpoint: 'tcp://localhost:5432', status: 'healthy', responseTime: 12, lastCheck: '15s ago' },
                    { endpoint: 'pg_isready', status: 'healthy', responseTime: 8, lastCheck: '15s ago' }
                ],
                metrics: {
                    cpu: 23,
                    memory: 45,
                    disk: 67,
                    network: { inbound: 89.2, outbound: 45.8 },
                    requests: { total: 45000, errors: 2, avgResponseTime: 34 },
                    uptime: '15d 8h 45m',
                    connections: 89
                },
                dependencies: [],
                dependents: ['codai-app', 'memorai-service', 'bancai-app'],
                lastRestart: '15 days ago',
                autoRestart: true,
                scalable: false,
                instances: 1,
                maxInstances: 1,
                tags: ['critical', 'database', 'persistent'],
                icon: <Database className="w-5 h-5" />,
                color: 'green',
                configUrl: '/config/postgres',
                logsUrl: '/logs/postgres',
                metricsUrl: '/metrics/postgres'
            },
            {
                id: 'redis-cache',
                name: 'redis',
                displayName: 'Redis Cache',
                type: 'cache',
                status: 'running',
                version: '7.2.1',
                port: 6379,
                host: 'localhost',
                description: 'In-memory data structure store for caching',
                healthChecks: [
                    { endpoint: 'tcp://localhost:6379', status: 'healthy', responseTime: 5, lastCheck: '30s ago' },
                    { endpoint: 'redis://ping', status: 'healthy', responseTime: 3, lastCheck: '30s ago' }
                ],
                metrics: {
                    cpu: 12,
                    memory: 78,
                    disk: 5,
                    network: { inbound: 234.5, outbound: 189.3 },
                    requests: { total: 890000, errors: 0, avgResponseTime: 2 },
                    uptime: '12d 6h 30m',
                    connections: 156
                },
                dependencies: [],
                dependents: ['codai-app', 'memorai-service', 'romai-service'],
                lastRestart: '12 days ago',
                autoRestart: true,
                scalable: true,
                instances: 2,
                maxInstances: 4,
                tags: ['cache', 'performance', 'memory'],
                icon: <Zap className="w-5 h-5" />,
                color: 'red',
                configUrl: '/config/redis',
                logsUrl: '/logs/redis',
                metricsUrl: '/metrics/redis'
            },
            {
                id: 'nginx-proxy',
                name: 'nginx',
                displayName: 'Nginx Reverse Proxy',
                type: 'infrastructure',
                status: 'running',
                version: '1.25.3',
                port: 80,
                host: 'localhost',
                description: 'Reverse proxy and load balancer',
                healthChecks: [
                    { endpoint: 'http://localhost/nginx_status', status: 'healthy', responseTime: 15, lastCheck: '1m ago' },
                    { endpoint: 'tcp://localhost:80', status: 'healthy', responseTime: 8, lastCheck: '1m ago' }
                ],
                metrics: {
                    cpu: 8,
                    memory: 25,
                    disk: 2,
                    network: { inbound: 456.7, outbound: 389.2 },
                    requests: { total: 1200000, errors: 67, avgResponseTime: 25 },
                    uptime: '20d 12h 15m',
                    connections: 1247
                },
                dependencies: [],
                dependents: ['codai-app', 'memorai-service', 'bancai-app', 'admin-panel'],
                lastRestart: '20 days ago',
                autoRestart: true,
                scalable: false,
                instances: 1,
                maxInstances: 1,
                tags: ['proxy', 'critical', 'entry-point'],
                icon: <Globe className="w-5 h-5" />,
                color: 'orange',
                configUrl: '/config/nginx',
                logsUrl: '/logs/nginx',
                metricsUrl: '/metrics/nginx'
            },
            {
                id: 'memorai-service',
                name: 'memorai',
                displayName: 'MemorAI Service',
                type: 'application',
                status: 'running',
                version: '4.1.0',
                port: 4006,
                host: 'localhost',
                description: 'Advanced memory management and context storage',
                healthChecks: [
                    { endpoint: '/health', status: 'healthy', responseTime: 78, lastCheck: '45s ago' },
                    { endpoint: '/api/memory/status', status: 'healthy', responseTime: 123, lastCheck: '45s ago' }
                ],
                metrics: {
                    cpu: 56,
                    memory: 89,
                    disk: 45,
                    network: { inbound: 234.5, outbound: 189.3 },
                    requests: { total: 78000, errors: 12, avgResponseTime: 89 },
                    uptime: '6d 4h 52m',
                    connections: 512
                },
                dependencies: ['postgres-main', 'redis-cache'],
                dependents: ['codai-app', 'romai-service', 'bancai-app'],
                lastRestart: '6 days ago',
                autoRestart: true,
                scalable: true,
                instances: 4,
                maxInstances: 10,
                tags: ['ai', 'memory', 'vectors'],
                icon: <Activity className="w-5 h-5" />,
                color: 'purple',
                configUrl: '/config/memorai',
                logsUrl: '/logs/memorai',
                metricsUrl: '/metrics/memorai'
            },
            {
                id: 'prometheus',
                name: 'prometheus',
                displayName: 'Prometheus Monitoring',
                type: 'monitoring',
                status: 'running',
                version: '2.47.0',
                port: 9090,
                host: 'localhost',
                description: 'Metrics collection and monitoring system',
                healthChecks: [
                    { endpoint: 'http://localhost:9090/-/healthy', status: 'healthy', responseTime: 34, lastCheck: '2m ago' },
                    { endpoint: 'http://localhost:9090/api/v1/targets', status: 'healthy', responseTime: 67, lastCheck: '2m ago' }
                ],
                metrics: {
                    cpu: 15,
                    memory: 34,
                    disk: 23,
                    network: { inbound: 45.2, outbound: 67.8 },
                    requests: { total: 23000, errors: 0, avgResponseTime: 45 },
                    uptime: '18d 23h 12m',
                    connections: 45
                },
                dependencies: [],
                dependents: ['grafana', 'alertmanager'],
                lastRestart: '18 days ago',
                autoRestart: true,
                scalable: false,
                instances: 1,
                maxInstances: 1,
                tags: ['monitoring', 'metrics', 'observability'],
                icon: <BarChart3 className="w-5 h-5" />,
                color: 'yellow',
                configUrl: '/config/prometheus',
                logsUrl: '/logs/prometheus',
                metricsUrl: '/metrics/prometheus'
            },
            {
                id: 'security-gateway',
                name: 'security-gateway',
                displayName: 'Security Gateway',
                type: 'security',
                status: 'warning',
                version: '1.2.4',
                port: 8443,
                host: 'localhost',
                description: 'API security and threat protection gateway',
                healthChecks: [
                    { endpoint: '/security/health', status: 'degraded', responseTime: 234, lastCheck: '1m ago', message: 'High response times detected' },
                    { endpoint: '/security/threats', status: 'healthy', responseTime: 45, lastCheck: '1m ago' }
                ],
                metrics: {
                    cpu: 67,
                    memory: 78,
                    disk: 12,
                    network: { inbound: 123.4, outbound: 98.7 },
                    requests: { total: 67000, errors: 234, avgResponseTime: 167 },
                    uptime: '4d 12h 8m',
                    connections: 89
                },
                dependencies: ['redis-cache'],
                dependents: ['codai-app', 'memorai-service'],
                lastRestart: '4 days ago',
                autoRestart: true,
                scalable: true,
                instances: 2,
                maxInstances: 4,
                tags: ['security', 'gateway', 'protection'],
                icon: <Shield className="w-5 h-5" />,
                color: 'indigo',
                configUrl: '/config/security',
                logsUrl: '/logs/security',
                metricsUrl: '/metrics/security'
            },
            {
                id: 'logai-analytics',
                name: 'logai',
                displayName: 'LogAI Analytics',
                type: 'application',
                status: 'error',
                version: '1.4.7',
                port: 5200,
                host: 'localhost',
                description: 'Advanced logging and analytics platform',
                healthChecks: [
                    { endpoint: '/health', status: 'unhealthy', responseTime: 0, lastCheck: '5m ago', message: 'Service unreachable' },
                    { endpoint: '/api/logs/status', status: 'unknown', responseTime: 0, lastCheck: '5m ago' }
                ],
                metrics: {
                    cpu: 0,
                    memory: 0,
                    disk: 78,
                    network: { inbound: 0, outbound: 0 },
                    requests: { total: 0, errors: 45, avgResponseTime: 0 },
                    uptime: '0h 0m',
                    connections: 0
                },
                dependencies: ['postgres-main', 'elasticsearch'],
                dependents: [],
                lastRestart: '2 hours ago',
                autoRestart: false,
                scalable: true,
                instances: 0,
                maxInstances: 4,
                tags: ['analytics', 'error', 'down'],
                icon: <XCircle className="w-5 h-5" />,
                color: 'red',
                configUrl: '/config/logai',
                logsUrl: '/logs/logai',
                metricsUrl: '/metrics/logai'
            }
        ];

        setServices(servicesData);
        setFilteredServices(servicesData);

        // Calculate system metrics
        const running = servicesData.filter(s => s.status === 'running').length;
        const errors = servicesData.filter(s => s.status === 'error').length;
        const totalRequests = servicesData.reduce((sum, s) => sum + s.metrics.requests.total, 0);
        const avgResponseTime = servicesData.reduce((sum, s) => sum + s.metrics.requests.avgResponseTime, 0) / servicesData.length;
        const systemLoad = servicesData.reduce((sum, s) => sum + s.metrics.cpu, 0) / servicesData.length;

        setSystemMetrics({
            totalServices: servicesData.length,
            runningServices: running,
            errorServices: errors,
            avgResponseTime: Math.round(avgResponseTime),
            totalRequests,
            systemLoad: Math.round(systemLoad)
        });
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = services;

        if (searchTerm) {
            filtered = filtered.filter(service =>
                service.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter(service => service.type === selectedType);
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(service => service.status === selectedStatus);
        }

        setFilteredServices(filtered);
    }, [services, searchTerm, selectedType, selectedStatus]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-green-600 bg-green-100';
            case 'stopped': return 'text-gray-600 bg-gray-100';
            case 'error': return 'text-red-600 bg-red-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'maintenance': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <CheckCircle className="w-4 h-4" />;
            case 'stopped': return <XCircle className="w-4 h-4" />;
            case 'error': return <AlertTriangle className="w-4 h-4" />;
            case 'warning': return <AlertTriangle className="w-4 h-4" />;
            case 'maintenance': return <Clock className="w-4 h-4" />;
            default: return <XCircle className="w-4 h-4" />;
        }
    };

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600';
            case 'unhealthy': return 'text-red-600';
            case 'degraded': return 'text-yellow-600';
            case 'unknown': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'application': return 'bg-blue-100 text-blue-800';
            case 'database': return 'bg-green-100 text-green-800';
            case 'cache': return 'bg-red-100 text-red-800';
            case 'messaging': return 'bg-purple-100 text-purple-800';
            case 'monitoring': return 'bg-yellow-100 text-yellow-800';
            case 'security': return 'bg-indigo-100 text-indigo-800';
            case 'infrastructure': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const refreshData = async () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const handleServiceAction = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
        console.log(`${action} action for service ${serviceId}`);
        const service = services.find(s => s.id === serviceId);
        if (service) {
            if (action === 'start') {
                service.status = 'running';
            } else if (action === 'stop') {
                service.status = 'stopped';
            } else if (action === 'restart') {
                service.status = 'running';
            }
            setServices([...services]);
        }
    };

    const serviceTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'application', label: 'Applications' },
        { value: 'database', label: 'Databases' },
        { value: 'cache', label: 'Cache' },
        { value: 'messaging', label: 'Messaging' },
        { value: 'monitoring', label: 'Monitoring' },
        { value: 'security', label: 'Security' },
        { value: 'infrastructure', label: 'Infrastructure' }
    ];

    const serviceStatuses = [
        { value: 'all', label: 'All Status' },
        { value: 'running', label: 'Running' },
        { value: 'stopped', label: 'Stopped' },
        { value: 'error', label: 'Error' },
        { value: 'warning', label: 'Warning' },
        { value: 'maintenance', label: 'Maintenance' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Services</h1>
                    <p className="mt-2 text-gray-600">
                        Monitor and manage system services and infrastructure
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

            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Services</p>
                            <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalServices}</p>
                        </div>
                        <Server className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Running</p>
                            <p className="text-2xl font-bold text-green-600">{systemMetrics.runningServices}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Errors</p>
                            <p className="text-2xl font-bold text-red-600">{systemMetrics.errorServices}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Response</p>
                            <p className="text-2xl font-bold text-blue-600">{systemMetrics.avgResponseTime}ms</p>
                        </div>
                        <Gauge className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Requests</p>
                            <p className="text-2xl font-bold text-purple-600">{systemMetrics.totalRequests.toLocaleString()}</p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">System Load</p>
                            <p className="text-2xl font-bold text-orange-600">{systemMetrics.systemLoad}%</p>
                        </div>
                        <Cpu className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                        />
                    </div>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {serviceTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {serviceStatuses.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                    <div key={service.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg bg-${service.color}-100 text-${service.color}-600`}>
                                        {service.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{service.displayName}</h3>
                                        <p className="text-sm text-gray-500">{service.name} v{service.version}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                                    {getStatusIcon(service.status)}
                                    <span className="ml-1 capitalize">{service.status}</span>
                                </div>
                            </div>

                            {/* Description and Type */}
                            <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                            <div className="flex items-center space-x-2 mb-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(service.type)}`}>
                                    {service.type}
                                </span>
                                {service.port && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        :{service.port}
                                    </span>
                                )}
                                {service.scalable && (
                                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">
                                        {service.instances}/{service.maxInstances} instances
                                    </span>
                                )}
                            </div>

                            {/* Health Checks */}
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Health Checks</h4>
                                <div className="space-y-1">
                                    {service.healthChecks.map((check, index) => (
                                        <div key={index} className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">{check.endpoint}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className={getHealthColor(check.status)}>
                                                    {check.status}
                                                </span>
                                                <span className="text-gray-500">{check.responseTime}ms</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                    <p className="text-gray-500">CPU</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${service.metrics.cpu}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium">{service.metrics.cpu}%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500">Memory</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${service.metrics.memory}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium">{service.metrics.memory}%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500">Requests</p>
                                    <p className="font-medium">{service.metrics.requests.total.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Connections</p>
                                    <p className="font-medium">{service.metrics.connections}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => handleServiceAction(service.id, 'start')}
                                        disabled={service.status === 'running'}
                                        className="p-2 text-green-600 hover:bg-green-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Start Service"
                                    >
                                        <Play className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleServiceAction(service.id, 'stop')}
                                        disabled={service.status === 'stopped'}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Stop Service"
                                    >
                                        <Square className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleServiceAction(service.id, 'restart')}
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                        title="Restart Service"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex space-x-1">
                                    {service.port && (
                                        <a
                                            href={`http://${service.host}:${service.port}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                            title="Open Service"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectedService(service);
                                            setShowServiceModal(true);
                                        }}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                        title="Settings"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredServices.length === 0 && (
                <div className="text-center py-12">
                    <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            )}

            {/* Service Details Modal */}
            {showServiceModal && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-3 rounded-lg bg-${selectedService.color}-100 text-${selectedService.color}-600`}>
                                        {selectedService.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{selectedService.displayName}</h2>
                                        <p className="text-gray-600">{selectedService.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowServiceModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Service Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Service Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Name:</span>
                                            <span className="text-gray-900">{selectedService.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Version:</span>
                                            <span className="text-gray-900">{selectedService.version}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Type:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedService.type)}`}>
                                                {selectedService.type}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Host:</span>
                                            <span className="text-gray-900">{selectedService.host}:{selectedService.port}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Uptime:</span>
                                            <span className="text-gray-900">{selectedService.metrics.uptime}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Status & Configuration</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status:</span>
                                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedService.status)}`}>
                                                {getStatusIcon(selectedService.status)}
                                                <span className="ml-1 capitalize">{selectedService.status}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Auto Restart:</span>
                                            <span className="text-gray-900">{selectedService.autoRestart ? 'Enabled' : 'Disabled'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Scalable:</span>
                                            <span className="text-gray-900">{selectedService.scalable ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Instances:</span>
                                            <span className="text-gray-900">{selectedService.instances}/{selectedService.maxInstances}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Last Restart:</span>
                                            <span className="text-gray-900">{selectedService.lastRestart}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Health Checks Detail */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Health Checks</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="space-y-3">
                                        {selectedService.healthChecks.map((check, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                                                <div>
                                                    <div className="font-medium text-sm">{check.endpoint}</div>
                                                    {check.message && (
                                                        <div className="text-xs text-gray-500 mt-1">{check.message}</div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-sm font-medium ${getHealthColor(check.status)}`}>
                                                        {check.status}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {check.responseTime}ms • {check.lastCheck}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Dependencies */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Dependencies</h3>
                                    <div className="space-y-2">
                                        {selectedService.dependencies.length > 0 ? (
                                            selectedService.dependencies.map((dep) => (
                                                <div key={dep} className="flex items-center space-x-2 text-sm">
                                                    <Network className="w-4 h-4 text-gray-400" />
                                                    <span>{dep}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-gray-500 text-sm">No dependencies</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Dependents</h3>
                                    <div className="space-y-2">
                                        {selectedService.dependents.length > 0 ? (
                                            selectedService.dependents.map((dep) => (
                                                <div key={dep} className="flex items-center space-x-2 text-sm">
                                                    <Network className="w-4 h-4 text-gray-400" />
                                                    <span>{dep}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-gray-500 text-sm">No dependents</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => handleServiceAction(selectedService.id, 'start')}
                                    disabled={selectedService.status === 'running'}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start
                                </button>
                                <button
                                    onClick={() => handleServiceAction(selectedService.id, 'stop')}
                                    disabled={selectedService.status === 'stopped'}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Square className="w-4 h-4 mr-2" />
                                    Stop
                                </button>
                                <button
                                    onClick={() => handleServiceAction(selectedService.id, 'restart')}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Restart
                                </button>
                                {selectedService.configUrl && (
                                    <a
                                        href={selectedService.configUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        Configure
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesPage;
