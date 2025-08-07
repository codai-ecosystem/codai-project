'use client';

import React, { useEffect, useState } from 'react';
import {
    Monitor,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Server,
    Database,
    Cpu,
    HardDrive,
    Wifi,
    Zap,
    Shield,
    TrendingUp,
    TrendingDown,
    Bell,
    Settings,
    RefreshCw,
    Filter,
    Search,
    Eye,
    BarChart3,
    LineChart,
    PieChart,
    Target,
    Gauge,
    Thermometer,
    Power,
    Globe,
    Lock,
    Users,
    Calendar,
    Archive,
    AlertCircle,
    Info,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Download,
    Upload,
    PlayCircle,
    PauseCircle,
    StopCircle,
    Layers,
    Network,
    Radio,
    Smartphone,
    Tablet,
    Desktop,
    Cloud,
    GitBranch,
    FileText,
    MemoryStick,
    Bluetooth
} from 'lucide-react';

interface MetricValue {
    current: number;
    previous: number;
    threshold: {
        warning: number;
        critical: number;
    };
    unit: string;
    trend: 'up' | 'down' | 'stable';
}

interface Alert {
    id: string;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    source: string;
    timestamp: string;
    acknowledged: boolean;
    resolved: boolean;
    assignee?: string;
    category: 'performance' | 'security' | 'availability' | 'capacity' | 'custom';
}

interface MonitoringTarget {
    id: string;
    name: string;
    type: 'service' | 'infrastructure' | 'application' | 'network' | 'database';
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
    url?: string;
    lastCheck: string;
    responseTime: number;
    uptime: number;
    metrics: {
        [key: string]: MetricValue;
    };
    tags: string[];
    location: string;
    version?: string;
    dependencies: string[];
}

interface IncidentSummary {
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    startedAt: string;
    resolvedAt?: string;
    affectedServices: string[];
    assignee: string;
    updates: Array<{
        timestamp: string;
        message: string;
        author: string;
    }>;
}

const MonitoringPage = () => {
    const [targets, setTargets] = useState<MonitoringTarget[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
    const [filteredTargets, setFilteredTargets] = useState<MonitoringTarget[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [systemHealth, setSystemHealth] = useState({
        overall: 98.7,
        services: 95.2,
        infrastructure: 99.1,
        network: 97.8,
        database: 99.5,
        security: 96.3
    });

    // Initialize monitoring data
    useEffect(() => {
        const targetsData: MonitoringTarget[] = [
            {
                id: 'codai-app',
                name: 'CODAI Application',
                type: 'application',
                status: 'healthy',
                url: 'http://localhost:4001',
                lastCheck: '30 seconds ago',
                responseTime: 145,
                uptime: 99.95,
                metrics: {
                    cpu: { current: 45, previous: 42, threshold: { warning: 70, critical: 85 }, unit: '%', trend: 'up' },
                    memory: { current: 68, previous: 65, threshold: { warning: 80, critical: 90 }, unit: '%', trend: 'up' },
                    requests: { current: 1247, previous: 1156, threshold: { warning: 2000, critical: 2500 }, unit: 'req/min', trend: 'up' },
                    errors: { current: 0.12, previous: 0.15, threshold: { warning: 1, critical: 5 }, unit: '%', trend: 'down' }
                },
                tags: ['critical', 'production', 'web'],
                location: 'Primary DC',
                version: '2.1.5',
                dependencies: ['postgres-db', 'redis-cache', 'nginx-proxy']
            },
            {
                id: 'postgres-db',
                name: 'PostgreSQL Database',
                type: 'database',
                status: 'healthy',
                url: 'postgres://localhost:5432',
                lastCheck: '15 seconds ago',
                responseTime: 23,
                uptime: 99.99,
                metrics: {
                    cpu: { current: 23, previous: 25, threshold: { warning: 60, critical: 80 }, unit: '%', trend: 'down' },
                    memory: { current: 45, previous: 43, threshold: { warning: 70, critical: 85 }, unit: '%', trend: 'up' },
                    connections: { current: 89, previous: 92, threshold: { warning: 150, critical: 200 }, unit: 'conns', trend: 'down' },
                    disk: { current: 67, previous: 66, threshold: { warning: 80, critical: 90 }, unit: '%', trend: 'up' }
                },
                tags: ['critical', 'database', 'persistent'],
                location: 'Primary DC',
                version: '15.4',
                dependencies: []
            },
            {
                id: 'redis-cache',
                name: 'Redis Cache',
                type: 'service',
                status: 'healthy',
                url: 'redis://localhost:6379',
                lastCheck: '30 seconds ago',
                responseTime: 5,
                uptime: 99.92,
                metrics: {
                    cpu: { current: 12, previous: 15, threshold: { warning: 50, critical: 70 }, unit: '%', trend: 'down' },
                    memory: { current: 78, previous: 75, threshold: { warning: 85, critical: 95 }, unit: '%', trend: 'up' },
                    operations: { current: 2890, previous: 2567, threshold: { warning: 5000, critical: 8000 }, unit: 'ops/sec', trend: 'up' },
                    keyspace: { current: 15678, previous: 15234, threshold: { warning: 50000, critical: 100000 }, unit: 'keys', trend: 'up' }
                },
                tags: ['cache', 'performance', 'memory'],
                location: 'Primary DC',
                version: '7.2.1',
                dependencies: []
            },
            {
                id: 'nginx-proxy',
                name: 'Nginx Reverse Proxy',
                type: 'infrastructure',
                status: 'healthy',
                url: 'http://localhost:80',
                lastCheck: '1 minute ago',
                responseTime: 15,
                uptime: 99.96,
                metrics: {
                    cpu: { current: 8, previous: 10, threshold: { warning: 40, critical: 60 }, unit: '%', trend: 'down' },
                    memory: { current: 25, previous: 23, threshold: { warning: 50, critical: 70 }, unit: '%', trend: 'up' },
                    requests: { current: 3456, previous: 3123, threshold: { warning: 10000, critical: 15000 }, unit: 'req/min', trend: 'up' },
                    bandwidth: { current: 234, previous: 198, threshold: { warning: 500, critical: 800 }, unit: 'MB/s', trend: 'up' }
                },
                tags: ['proxy', 'load-balancer', 'entry-point'],
                location: 'Edge',
                version: '1.25.3',
                dependencies: []
            },
            {
                id: 'security-gateway',
                name: 'Security Gateway',
                type: 'service',
                status: 'warning',
                url: 'https://localhost:8443',
                lastCheck: '45 seconds ago',
                responseTime: 234,
                uptime: 99.65,
                metrics: {
                    cpu: { current: 67, previous: 45, threshold: { warning: 70, critical: 85 }, unit: '%', trend: 'up' },
                    memory: { current: 78, previous: 72, threshold: { warning: 80, critical: 90 }, unit: '%', trend: 'up' },
                    threats: { current: 23, previous: 18, threshold: { warning: 50, critical: 100 }, unit: 'blocked/min', trend: 'up' },
                    latency: { current: 234, previous: 156, threshold: { warning: 200, critical: 500 }, unit: 'ms', trend: 'up' }
                },
                tags: ['security', 'gateway', 'protection'],
                location: 'Primary DC',
                version: '1.2.4',
                dependencies: ['redis-cache']
            },
            {
                id: 'network-switch',
                name: 'Core Network Switch',
                type: 'network',
                status: 'healthy',
                lastCheck: '2 minutes ago',
                responseTime: 2,
                uptime: 99.98,
                metrics: {
                    utilization: { current: 34, previous: 32, threshold: { warning: 70, critical: 85 }, unit: '%', trend: 'up' },
                    packets: { current: 45678, previous: 43567, threshold: { warning: 100000, critical: 150000 }, unit: 'pps', trend: 'up' },
                    errors: { current: 0, previous: 1, threshold: { warning: 10, critical: 50 }, unit: 'errors/min', trend: 'down' },
                    temperature: { current: 42, previous: 40, threshold: { warning: 60, critical: 75 }, unit: '°C', trend: 'up' }
                },
                tags: ['network', 'infrastructure', 'core'],
                location: 'Primary DC',
                dependencies: []
            },
            {
                id: 'backup-service',
                name: 'Backup Service',
                type: 'service',
                status: 'critical',
                lastCheck: '5 minutes ago',
                responseTime: 0,
                uptime: 87.23,
                metrics: {
                    cpu: { current: 0, previous: 45, threshold: { warning: 70, critical: 85 }, unit: '%', trend: 'down' },
                    memory: { current: 0, previous: 67, threshold: { warning: 80, critical: 90 }, unit: '%', trend: 'down' },
                    backups: { current: 0, previous: 12, threshold: { warning: 5, critical: 2 }, unit: 'completed/day', trend: 'down' },
                    storage: { current: 89, previous: 87, threshold: { warning: 85, critical: 95 }, unit: '%', trend: 'up' }
                },
                tags: ['backup', 'maintenance', 'storage'],
                location: 'Secondary DC',
                version: '3.4.1',
                dependencies: ['postgres-db']
            }
        ];

        const alertsData: Alert[] = [
            {
                id: 'alert-1',
                title: 'High Response Time',
                message: 'Security Gateway response time is above threshold (234ms > 200ms)',
                severity: 'warning',
                source: 'security-gateway',
                timestamp: '2 minutes ago',
                acknowledged: false,
                resolved: false,
                category: 'performance'
            },
            {
                id: 'alert-2',
                title: 'Service Down',
                message: 'Backup Service is not responding to health checks',
                severity: 'critical',
                source: 'backup-service',
                timestamp: '5 minutes ago',
                acknowledged: true,
                resolved: false,
                assignee: 'DevOps Team',
                category: 'availability'
            },
            {
                id: 'alert-3',
                title: 'High CPU Usage',
                message: 'Security Gateway CPU usage is approaching threshold (67% > 65%)',
                severity: 'warning',
                source: 'security-gateway',
                timestamp: '8 minutes ago',
                acknowledged: false,
                resolved: false,
                category: 'performance'
            },
            {
                id: 'alert-4',
                title: 'Storage Space Warning',
                message: 'Backup Service storage usage is high (89% > 85%)',
                severity: 'warning',
                source: 'backup-service',
                timestamp: '1 hour ago',
                acknowledged: true,
                resolved: false,
                assignee: 'Storage Team',
                category: 'capacity'
            }
        ];

        const incidentsData: IncidentSummary[] = [
            {
                id: 'inc-1',
                title: 'Backup Service Outage',
                severity: 'high',
                status: 'investigating',
                startedAt: '10 minutes ago',
                affectedServices: ['backup-service'],
                assignee: 'DevOps Team',
                updates: [
                    { timestamp: '10 minutes ago', message: 'Service down, investigating root cause', author: 'John Doe' },
                    { timestamp: '5 minutes ago', message: 'Identified disk space issue, working on resolution', author: 'Jane Smith' }
                ]
            },
            {
                id: 'inc-2',
                title: 'Security Gateway Performance Degradation',
                severity: 'medium',
                status: 'monitoring',
                startedAt: '15 minutes ago',
                affectedServices: ['security-gateway'],
                assignee: 'Security Team',
                updates: [
                    { timestamp: '15 minutes ago', message: 'High response times detected', author: 'Security Team' },
                    { timestamp: '10 minutes ago', message: 'Scaling up instances to handle load', author: 'DevOps Team' }
                ]
            }
        ];

        setTargets(targetsData);
        setFilteredTargets(targetsData);
        setAlerts(alertsData);
        setIncidents(incidentsData);
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = targets;

        if (searchTerm) {
            filtered = filtered.filter(target =>
                target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                target.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter(target => target.type === selectedType);
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(target => target.status === selectedStatus);
        }

        setFilteredTargets(filtered);
    }, [targets, searchTerm, selectedType, selectedStatus]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'critical': return 'bg-red-100 text-red-800';
            case 'unknown': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-4 h-4" />;
            case 'warning': return <AlertTriangle className="w-4 h-4" />;
            case 'critical': return <XCircle className="w-4 h-4" />;
            case 'unknown': return <Clock className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'application': return <Monitor className="w-4 h-4" />;
            case 'service': return <Server className="w-4 h-4" />;
            case 'database': return <Database className="w-4 h-4" />;
            case 'infrastructure': return <Cloud className="w-4 h-4" />;
            case 'network': return <Network className="w-4 h-4" />;
            default: return <Monitor className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'application': return 'bg-blue-100 text-blue-800';
            case 'service': return 'bg-purple-100 text-purple-800';
            case 'database': return 'bg-green-100 text-green-800';
            case 'infrastructure': return 'bg-orange-100 text-orange-800';
            case 'network': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'info': return 'bg-blue-100 text-blue-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'error': return 'bg-red-100 text-red-800';
            case 'critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'info': return <Info className="w-4 h-4" />;
            case 'warning': return <AlertTriangle className="w-4 h-4" />;
            case 'error': return <XCircle className="w-4 h-4" />;
            case 'critical': return <AlertCircle className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const getIncidentStatusColor = (status: string) => {
        switch (status) {
            case 'investigating': return 'bg-yellow-100 text-yellow-800';
            case 'identified': return 'bg-blue-100 text-blue-800';
            case 'monitoring': return 'bg-purple-100 text-purple-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const refreshData = async () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const acknowledgeAlert = (alertId: string) => {
        setAlerts(alerts.map(alert =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ));
    };

    const resolveAlert = (alertId: string) => {
        setAlerts(alerts.map(alert =>
            alert.id === alertId ? { ...alert, resolved: true } : alert
        ));
    };

    const targetTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'application', label: 'Applications' },
        { value: 'service', label: 'Services' },
        { value: 'database', label: 'Databases' },
        { value: 'infrastructure', label: 'Infrastructure' },
        { value: 'network', label: 'Network' }
    ];

    const targetStatuses = [
        { value: 'all', label: 'All Status' },
        { value: 'healthy', label: 'Healthy' },
        { value: 'warning', label: 'Warning' },
        { value: 'critical', label: 'Critical' },
        { value: 'unknown', label: 'Unknown' }
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Monitor className="w-4 h-4" /> },
        { id: 'alerts', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
        { id: 'targets', label: 'Targets', icon: <Target className="w-4 h-4" /> },
        { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'metrics', label: 'Metrics', icon: <BarChart3 className="w-4 h-4" /> }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Monitoring</h1>
                    <p className="mt-2 text-gray-600">
                        Real-time monitoring and alerting for the CODAI ecosystem
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

            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Overall Health</p>
                            <p className="text-2xl font-bold text-green-600">{systemHealth.overall}%</p>
                        </div>
                        <Gauge className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Services</p>
                            <p className="text-2xl font-bold text-green-600">{systemHealth.services}%</p>
                        </div>
                        <Server className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Infrastructure</p>
                            <p className="text-2xl font-bold text-green-600">{systemHealth.infrastructure}%</p>
                        </div>
                        <Cloud className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Network</p>
                            <p className="text-2xl font-bold text-green-600">{systemHealth.network}%</p>
                        </div>
                        <Network className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Database</p>
                            <p className="text-2xl font-bold text-green-600">{systemHealth.database}%</p>
                        </div>
                        <Database className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Security</p>
                            <p className="text-2xl font-bold text-green-600">{systemHealth.security}%</p>
                        </div>
                        <Shield className="w-8 h-8 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Critical Alerts Banner */}
            {alerts.filter(a => a.severity === 'critical' && !a.resolved).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-red-900">Critical Alerts</h3>
                            <p className="text-red-700">
                                {alerts.filter(a => a.severity === 'critical' && !a.resolved).length} critical alert(s) require immediate attention
                            </p>
                        </div>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            View Alerts
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {tab.id === 'alerts' && alerts.filter(a => !a.resolved).length > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                                    {alerts.filter(a => !a.resolved).length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Active Incidents */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Active Incidents</h3>
                            <div className="space-y-3">
                                {incidents.filter(i => i.status !== 'resolved').map((incident) => (
                                    <div key={incident.id} className="p-3 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">{incident.title}</h4>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getIncidentStatusColor(incident.status)}`}>
                                                {incident.status}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">Assignee: {incident.assignee}</p>
                                        <p className="text-sm text-gray-500">Started: {incident.startedAt}</p>
                                    </div>
                                ))}
                                {incidents.filter(i => i.status !== 'resolved').length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No active incidents</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Alerts */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Alerts</h3>
                            <div className="space-y-3">
                                {alerts.slice(0, 5).map((alert) => (
                                    <div key={alert.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                                        <div className={`p-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                                            {getSeverityIcon(alert.severity)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                                            <p className="text-xs text-gray-500">{alert.source} • {alert.timestamp}</p>
                                        </div>
                                        {!alert.acknowledged && (
                                            <button
                                                onClick={() => acknowledgeAlert(alert.id)}
                                                className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                            >
                                                ACK
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Metrics */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">System Metrics</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <LineChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Real-time Metrics Chart</p>
                                    <p className="text-xs text-gray-400">CPU, Memory, Network trends</p>
                                </div>
                            </div>
                        </div>

                        {/* Service Status */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
                            <div className="space-y-2">
                                {targets.slice(0, 5).map((target) => (
                                    <div key={target.id} className="flex items-center justify-between p-2 rounded">
                                        <div className="flex items-center space-x-3">
                                            {getTypeIcon(target.type)}
                                            <span className="text-sm font-medium">{target.name}</span>
                                        </div>
                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(target.status)}`}>
                                            {getStatusIcon(target.status)}
                                            <span className="capitalize">{target.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Alert Management</h3>
                                    <div className="flex space-x-2">
                                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                            {alerts.filter(a => a.severity === 'critical' && !a.resolved).length} Critical
                                        </span>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                            {alerts.filter(a => a.severity === 'warning' && !a.resolved).length} Warning
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {alerts.map((alert) => (
                                            <tr key={alert.id} className={`hover:bg-gray-50 ${alert.resolved ? 'opacity-50' : ''}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                                                        <div className="text-sm text-gray-500">{alert.message}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                                        {getSeverityIcon(alert.severity)}
                                                        <span className="capitalize">{alert.severity}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {alert.source}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {alert.timestamp}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        {alert.acknowledged && (
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">ACK</span>
                                                        )}
                                                        {alert.resolved && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Resolved</span>
                                                        )}
                                                        {alert.assignee && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{alert.assignee}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        {!alert.acknowledged && (
                                                            <button
                                                                onClick={() => acknowledgeAlert(alert.id)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                Acknowledge
                                                            </button>
                                                        )}
                                                        {!alert.resolved && (
                                                            <button
                                                                onClick={() => resolveAlert(alert.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Resolve
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

                {activeTab === 'targets' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search targets..."
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
                                    {targetTypes.map(type => (
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
                                    {targetStatuses.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Targets Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredTargets.map((target) => (
                                <div key={target.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${getTypeColor(target.type)}`}>
                                                    {getTypeIcon(target.type)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{target.name}</h3>
                                                    <p className="text-sm text-gray-500">{target.location} • {target.version}</p>
                                                </div>
                                            </div>
                                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(target.status)}`}>
                                                {getStatusIcon(target.status)}
                                                <span className="ml-1 capitalize">{target.status}</span>
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Uptime</span>
                                                <span className="font-medium">{target.uptime}%</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Response Time</span>
                                                <span className="font-medium">{target.responseTime}ms</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Last Check</span>
                                                <span className="font-medium">{target.lastCheck}</span>
                                            </div>
                                        </div>

                                        {/* Key Metrics */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            {Object.entries(target.metrics).slice(0, 4).map(([key, metric]) => (
                                                <div key={key} className="text-sm">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-gray-600 capitalize">{key}</span>
                                                        <span className="font-medium">{metric.current}{metric.unit}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full ${metric.current > metric.threshold.critical ? 'bg-red-600' :
                                                                        metric.current > metric.threshold.warning ? 'bg-yellow-600' : 'bg-green-600'
                                                                    }`}
                                                                style={{ width: `${Math.min((metric.current / metric.threshold.critical) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {target.tags.map((tag) => (
                                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex space-x-1">
                                                {target.url && (
                                                    <a
                                                        href={target.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                                        title="Open Target"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex space-x-1">
                                                <button
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                                    title="Configure"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'incidents' && (
                    <div className="space-y-6">
                        {incidents.map((incident) => (
                            <div key={incident.id} className="bg-white rounded-lg border border-gray-200">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                                            <p className="text-sm text-gray-500">Started: {incident.startedAt} • Assignee: {incident.assignee}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getIncidentStatusColor(incident.status)}`}>
                                            {incident.status}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Affected Services</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {incident.affectedServices.map((service) => (
                                                <span key={service} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Updates</h4>
                                        <div className="space-y-2">
                                            {incident.updates.map((update, index) => (
                                                <div key={index} className="border-l-2 border-gray-200 pl-4 pb-2">
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <span className="text-gray-500">{update.timestamp}</span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-600">{update.author}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-900 mt-1">{update.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'metrics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">CPU Usage Trends</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <LineChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">CPU Metrics Chart</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Memory Usage</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Memory Metrics Chart</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Network Traffic</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <Network className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Network Metrics Chart</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Response Times</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Response Time Chart</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonitoringPage;
