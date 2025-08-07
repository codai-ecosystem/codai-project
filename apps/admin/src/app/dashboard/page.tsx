'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Server,
    Shield,
    Activity,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    Database,
    Globe,
    Cpu,
    HardDrive,
    Network,
    BarChart3,
    PieChart,
    LineChart,
    Bell,
    Settings,
    RefreshCw,
    Download,
    Filter,
    Search,
    Calendar,
    MoreVertical,
    Eye,
    ExternalLink,
    Zap,
    Package,
    FileText,
    Lock,
    Unlock,
    AlertCircle,
    Info,
    XCircle,
    PlayCircle,
    PauseCircle,
    StopCircle
} from 'lucide-react';

interface SystemMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    status: 'healthy' | 'warning' | 'critical';
    change: number;
    changeType: 'increase' | 'decrease';
    lastUpdated: string;
}

interface ServiceStatus {
    id: string;
    name: string;
    status: 'running' | 'stopped' | 'error' | 'starting';
    uptime: string;
    version: string;
    port: number;
    healthCheck: boolean;
    lastRestart: string;
    memoryUsage: number;
    cpuUsage: number;
}

interface SecurityAlert {
    id: string;
    type: 'authentication' | 'authorization' | 'system' | 'network';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
    resolved: boolean;
    affectedResource: string;
}

interface UserActivity {
    id: string;
    user: string;
    action: string;
    resource: string;
    timestamp: string;
    status: 'success' | 'failed';
    ipAddress: string;
    userAgent: string;
}

export default function AdminDashboard() {
    const [refreshing, setRefreshing] = useState(false);
    const [timeFilter, setTimeFilter] = useState('24h');
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

    // Mock data - in real app would come from APIs
    const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
        {
            id: '1',
            name: 'Total Users',
            value: 15847,
            unit: 'users',
            status: 'healthy',
            change: 12.5,
            changeType: 'increase',
            lastUpdated: '2024-08-06T10:30:00Z'
        },
        {
            id: '2',
            name: 'Active Sessions',
            value: 2341,
            unit: 'sessions',
            status: 'healthy',
            change: 8.2,
            changeType: 'increase',
            lastUpdated: '2024-08-06T10:30:00Z'
        },
        {
            id: '3',
            name: 'System Load',
            value: 67,
            unit: '%',
            status: 'warning',
            change: 15.3,
            changeType: 'increase',
            lastUpdated: '2024-08-06T10:30:00Z'
        },
        {
            id: '4',
            name: 'Memory Usage',
            value: 82,
            unit: '%',
            status: 'critical',
            change: 23.1,
            changeType: 'increase',
            lastUpdated: '2024-08-06T10:30:00Z'
        },
        {
            id: '5',
            name: 'Storage Usage',
            value: 45,
            unit: '%',
            status: 'healthy',
            change: 2.8,
            changeType: 'increase',
            lastUpdated: '2024-08-06T10:30:00Z'
        },
        {
            id: '6',
            name: 'API Requests/min',
            value: 1247,
            unit: 'req/min',
            status: 'healthy',
            change: 5.7,
            changeType: 'decrease',
            lastUpdated: '2024-08-06T10:30:00Z'
        }
    ]);

    const [services, setServices] = useState<ServiceStatus[]>([
        {
            id: '1',
            name: 'CBD Database',
            status: 'running',
            uptime: '15d 7h 23m',
            version: '1.2.0',
            port: 4180,
            healthCheck: true,
            lastRestart: '2024-07-22T08:00:00Z',
            memoryUsage: 256,
            cpuUsage: 15
        },
        {
            id: '2',
            name: 'MemorAI MCP',
            status: 'running',
            uptime: '3d 12h 45m',
            version: '2.1.0',
            port: 4950,
            healthCheck: true,
            lastRestart: '2024-08-03T14:30:00Z',
            memoryUsage: 512,
            cpuUsage: 28
        },
        {
            id: '3',
            name: 'RomAI AGI Server',
            status: 'running',
            uptime: '7d 2h 15m',
            version: '3.0.0',
            port: 8000,
            healthCheck: true,
            lastRestart: '2024-07-30T10:15:00Z',
            memoryUsage: 1024,
            cpuUsage: 45
        },
        {
            id: '4',
            name: 'Gateway Service',
            status: 'running',
            uptime: '12d 18h 33m',
            version: '1.5.2',
            port: 4003,
            healthCheck: true,
            lastRestart: '2024-07-25T06:45:00Z',
            memoryUsage: 128,
            cpuUsage: 8
        },
        {
            id: '5',
            name: 'ID Service',
            status: 'error',
            uptime: '0d 0h 0m',
            version: '1.1.0',
            port: 4004,
            healthCheck: false,
            lastRestart: '2024-08-06T09:45:00Z',
            memoryUsage: 0,
            cpuUsage: 0
        }
    ]);

    const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
        {
            id: '1',
            type: 'authentication',
            severity: 'high',
            message: 'Multiple failed login attempts detected from IP 192.168.1.100',
            timestamp: '2024-08-06T10:15:00Z',
            resolved: false,
            affectedResource: 'Authentication Service'
        },
        {
            id: '2',
            type: 'system',
            severity: 'critical',
            message: 'High memory usage detected on RomAI AGI Server',
            timestamp: '2024-08-06T09:45:00Z',
            resolved: false,
            affectedResource: 'RomAI AGI Server'
        },
        {
            id: '3',
            type: 'network',
            severity: 'medium',
            message: 'Unusual network traffic pattern detected',
            timestamp: '2024-08-06T09:30:00Z',
            resolved: true,
            affectedResource: 'Network Gateway'
        }
    ]);

    const [recentActivity, setRecentActivity] = useState<UserActivity[]>([
        {
            id: '1',
            user: 'admin@codai.com',
            action: 'Updated system configuration',
            resource: 'System Settings',
            timestamp: '2024-08-06T10:25:00Z',
            status: 'success',
            ipAddress: '192.168.1.50',
            userAgent: 'Mozilla/5.0...'
        },
        {
            id: '2',
            user: 'john.doe@company.com',
            action: 'Created new user account',
            resource: 'User Management',
            timestamp: '2024-08-06T10:20:00Z',
            status: 'success',
            ipAddress: '192.168.1.75',
            userAgent: 'Mozilla/5.0...'
        },
        {
            id: '3',
            user: 'support@codai.com',
            action: 'Failed to restart service',
            resource: 'ID Service',
            timestamp: '2024-08-06T10:15:00Z',
            status: 'failed',
            ipAddress: '192.168.1.25',
            userAgent: 'Mozilla/5.0...'
        }
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'running':
            case 'success':
                return 'text-green-600 bg-green-100';
            case 'warning':
            case 'starting':
                return 'text-yellow-600 bg-yellow-100';
            case 'critical':
            case 'error':
            case 'failed':
                return 'text-red-600 bg-red-100';
            case 'stopped':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low':
                return 'text-blue-600 bg-blue-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'high':
                return 'text-orange-600 bg-orange-100';
            case 'critical':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
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
            // Simulate API calls to refresh data
            await new Promise(resolve => setTimeout(resolve, 2000));
            // In real app, would fetch fresh data from APIs
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="lg:pl-64">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Monitor and manage the CODAI ecosystem
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
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

                {/* System Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {systemMetrics.map((metric) => (
                        <div
                            key={metric.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedMetric(metric.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-2xl font-bold text-gray-900">{metric.value.toLocaleString()}</span>
                                        <span className="text-sm text-gray-500">{metric.unit}</span>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                                    {metric.status === 'healthy' && <CheckCircle className="w-5 h-5" />}
                                    {metric.status === 'warning' && <AlertTriangle className="w-5 h-5" />}
                                    {metric.status === 'critical' && <XCircle className="w-5 h-5" />}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                    {metric.changeType === 'increase' ? (
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    )}
                                    <span className={`text-sm font-medium ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {metric.change}%
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    Updated {formatDate(metric.lastUpdated)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Services Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Services Status</h2>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        {services.filter(s => s.status === 'running').length} / {services.length} running
                                    </span>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {services.map((service) => (
                                    <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                                                {service.status === 'running' && <PlayCircle className="w-4 h-4" />}
                                                {service.status === 'stopped' && <StopCircle className="w-4 h-4" />}
                                                {service.status === 'error' && <XCircle className="w-4 h-4" />}
                                                {service.status === 'starting' && <RefreshCw className="w-4 h-4 animate-spin" />}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
                                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                    <span>v{service.version}</span>
                                                    <span>Port {service.port}</span>
                                                    <span>Uptime: {service.uptime}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">Memory</div>
                                                <div className="text-sm font-medium text-gray-900">{service.memoryUsage}MB</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">CPU</div>
                                                <div className="text-sm font-medium text-gray-900">{service.cpuUsage}%</div>
                                            </div>
                                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Security Alerts */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Security Alerts</h2>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        {securityAlerts.filter(alert => !alert.resolved).length} active
                                    </span>
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {securityAlerts.map((alert) => (
                                    <div key={alert.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                        <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                                            {alert.type === 'authentication' && <Lock className="w-4 h-4" />}
                                            {alert.type === 'authorization' && <Shield className="w-4 h-4" />}
                                            {alert.type === 'system' && <Server className="w-4 h-4" />}
                                            {alert.type === 'network' && <Network className="w-4 h-4" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-gray-900 capitalize">
                                                    {alert.type} Alert
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                                                        {alert.severity}
                                                    </span>
                                                    {alert.resolved && (
                                                        <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                                                            Resolved
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-500">{alert.affectedResource}</span>
                                                <span className="text-xs text-gray-500">{formatDate(alert.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                            <button className="text-sm text-blue-600 hover:text-blue-700">
                                View All
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <th className="pb-3">User</th>
                                        <th className="pb-3">Action</th>
                                        <th className="pb-3">Resource</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">Time</th>
                                        <th className="pb-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="space-y-2">
                                    {recentActivity.map((activity) => (
                                        <tr key={activity.id} className="border-t border-gray-100">
                                            <td className="py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <Users className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{activity.user}</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span className="text-sm text-gray-600">{activity.action}</span>
                                            </td>
                                            <td className="py-3">
                                                <span className="text-sm text-gray-600">{activity.resource}</span>
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                                                    {activity.status}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span className="text-sm text-gray-500">{formatDate(activity.timestamp)}</span>
                                            </td>
                                            <td className="py-3">
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
