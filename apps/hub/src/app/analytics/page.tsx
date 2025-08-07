'use client';

import React, { useEffect, useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    Server,
    Database,
    Zap,
    Clock,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Download,
    Filter,
    RefreshCw,
    PieChart,
    LineChart,
    Settings,
    Target,
    Gauge,
    Monitor,
    Cpu,
    HardDrive,
    Wifi,
    AlertTriangle,
    CheckCircle,
    Layers,
    Globe,
    Smartphone,
    Desktop,
    Tablet,
    Chrome,
    Firefox,
    Safari,
    Navigation
} from 'lucide-react';

interface MetricData {
    label: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    color: string;
    icon: React.ReactNode;
}

interface ChartData {
    labels: string[];
    data: number[];
    colors: string[];
}

interface AnalyticsData {
    timeRange: string;
    overview: MetricData[];
    performance: {
        responseTime: ChartData;
        throughput: ChartData;
        errorRate: ChartData;
        availability: ChartData;
    };
    usage: {
        activeUsers: ChartData;
        requests: ChartData;
        dataTransfer: ChartData;
        apiCalls: ChartData;
    };
    system: {
        cpuUsage: ChartData;
        memoryUsage: ChartData;
        diskUsage: ChartData;
        networkTraffic: ChartData;
    };
    services: {
        servicePerfomance: Array<{
            name: string;
            uptime: number;
            responseTime: number;
            requests: number;
            errors: number;
            status: 'healthy' | 'warning' | 'error';
        }>;
    };
    geographic: {
        regions: Array<{
            region: string;
            users: number;
            requests: number;
            percentage: number;
        }>;
    };
    devices: {
        types: Array<{
            type: string;
            count: number;
            percentage: number;
            icon: React.ReactNode;
        }>;
        browsers: Array<{
            browser: string;
            count: number;
            percentage: number;
            icon: React.ReactNode;
        }>;
    };
}

const AnalyticsPage = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
    const [activeTab, setActiveTab] = useState('overview');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initialize analytics data
    useEffect(() => {
        const data: AnalyticsData = {
            timeRange: selectedTimeRange,
            overview: [
                {
                    label: 'Total Users',
                    value: 12470,
                    change: 8.2,
                    trend: 'up',
                    color: 'blue',
                    icon: <Users className="w-5 h-5" />
                },
                {
                    label: 'Active Sessions',
                    value: 3247,
                    change: 15.3,
                    trend: 'up',
                    color: 'green',
                    icon: <Activity className="w-5 h-5" />
                },
                {
                    label: 'API Requests',
                    value: 89500,
                    change: -2.1,
                    trend: 'down',
                    color: 'purple',
                    icon: <Zap className="w-5 h-5" />
                },
                {
                    label: 'Response Time',
                    value: 145,
                    change: -12.5,
                    trend: 'up',
                    color: 'orange',
                    icon: <Clock className="w-5 h-5" />
                },
                {
                    label: 'System Uptime',
                    value: 99.87,
                    change: 0.03,
                    trend: 'up',
                    color: 'teal',
                    icon: <Server className="w-5 h-5" />
                },
                {
                    label: 'Error Rate',
                    value: 0.12,
                    change: -45.2,
                    trend: 'up',
                    color: 'red',
                    icon: <AlertTriangle className="w-5 h-5" />
                },
                {
                    label: 'Data Processed',
                    value: 2.4,
                    change: 23.8,
                    trend: 'up',
                    color: 'indigo',
                    icon: <Database className="w-5 h-5" />
                },
                {
                    label: 'CPU Usage',
                    value: 34.5,
                    change: 5.7,
                    trend: 'down',
                    color: 'yellow',
                    icon: <Cpu className="w-5 h-5" />
                }
            ],
            performance: {
                responseTime: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    data: [120, 135, 145, 165, 155, 140],
                    colors: ['#3B82F6']
                },
                throughput: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    data: [850, 920, 1100, 1350, 1200, 980],
                    colors: ['#10B981']
                },
                errorRate: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    data: [0.08, 0.12, 0.15, 0.18, 0.14, 0.10],
                    colors: ['#EF4444']
                },
                availability: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    data: [99.95, 99.87, 99.92, 99.89, 99.91, 99.96, 99.94],
                    colors: ['#8B5CF6']
                }
            },
            usage: {
                activeUsers: {
                    labels: ['00:00', '06:00', '12:00', '18:00'],
                    data: [1247, 2890, 3247, 2156],
                    colors: ['#3B82F6']
                },
                requests: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    data: [75000, 82000, 89500, 91000, 87500, 65000, 58000],
                    colors: ['#10B981']
                },
                dataTransfer: {
                    labels: ['00:00', '06:00', '12:00', '18:00'],
                    data: [1.2, 2.1, 2.4, 1.8],
                    colors: ['#F59E0B']
                },
                apiCalls: {
                    labels: ['Auth', 'Users', 'Data', 'AI', 'Files'],
                    data: [25000, 18000, 15000, 12000, 8000],
                    colors: ['#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']
                }
            },
            system: {
                cpuUsage: {
                    labels: ['Server 1', 'Server 2', 'Server 3', 'Database', 'Cache'],
                    data: [34, 28, 41, 23, 15],
                    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                },
                memoryUsage: {
                    labels: ['Application', 'Database', 'Cache', 'OS', 'Free'],
                    data: [45, 25, 15, 10, 5],
                    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280']
                },
                diskUsage: {
                    labels: ['Data', 'Logs', 'Backups', 'System', 'Free'],
                    data: [67, 15, 8, 5, 5],
                    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280']
                },
                networkTraffic: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    data: [125, 89, 156, 234, 189, 145],
                    colors: ['#8B5CF6']
                }
            },
            services: {
                servicePerfomance: [
                    { name: 'CODAI App', uptime: 99.95, responseTime: 145, requests: 125000, errors: 45, status: 'healthy' },
                    { name: 'MemorAI', uptime: 99.87, responseTime: 234, requests: 78000, errors: 12, status: 'healthy' },
                    { name: 'PostgreSQL', uptime: 99.99, responseTime: 23, requests: 45000, errors: 2, status: 'healthy' },
                    { name: 'Redis Cache', uptime: 99.92, responseTime: 5, requests: 890000, errors: 0, status: 'healthy' },
                    { name: 'Security Gateway', uptime: 99.65, responseTime: 167, requests: 67000, errors: 234, status: 'warning' },
                    { name: 'LogAI', uptime: 87.23, responseTime: 0, requests: 0, errors: 45, status: 'error' }
                ]
            },
            geographic: {
                regions: [
                    { region: 'Romania', users: 4523, requests: 35000, percentage: 36.3 },
                    { region: 'Europe', users: 3247, requests: 28000, percentage: 26.0 },
                    { region: 'North America', users: 2156, requests: 18000, percentage: 17.3 },
                    { region: 'Asia Pacific', users: 1687, requests: 12000, percentage: 13.5 },
                    { region: 'Other', users: 857, requests: 6500, percentage: 6.9 }
                ]
            },
            devices: {
                types: [
                    { type: 'Desktop', count: 6785, percentage: 54.4, icon: <Desktop className="w-4 h-4" /> },
                    { type: 'Mobile', count: 4234, percentage: 33.9, icon: <Smartphone className="w-4 h-4" /> },
                    { type: 'Tablet', count: 1451, percentage: 11.7, icon: <Tablet className="w-4 h-4" /> }
                ],
                browsers: [
                    { browser: 'Chrome', count: 7823, percentage: 62.7, icon: <Chrome className="w-4 h-4" /> },
                    { browser: 'Firefox', count: 2456, percentage: 19.7, icon: <Firefox className="w-4 h-4" /> },
                    { browser: 'Safari', count: 1734, percentage: 13.9, icon: <Safari className="w-4 h-4" /> },
                    { browser: 'Other', count: 457, percentage: 3.7, icon: <Globe className="w-4 h-4" /> }
                ]
            }
        };

        setAnalyticsData(data);
    }, [selectedTimeRange]);

    const refreshData = async () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const getMetricTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4" />;
            case 'down': return <TrendingDown className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const getMetricTrendColor = (trend: string, change: number) => {
        if (trend === 'up' && change > 0) return 'text-green-600';
        if (trend === 'up' && change < 0) return 'text-green-600'; // Positive trend (like reduced errors)
        if (trend === 'down') return 'text-red-600';
        return 'text-gray-600';
    };

    const getServiceStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'error': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getServiceStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-4 h-4" />;
            case 'warning': return <AlertTriangle className="w-4 h-4" />;
            case 'error': return <AlertTriangle className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const formatNumber = (num: number, suffix?: string) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M${suffix || ''}`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K${suffix || ''}`;
        }
        return `${num}${suffix || ''}`;
    };

    const timeRanges = [
        { value: '1h', label: 'Last Hour' },
        { value: '24h', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' }
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'performance', label: 'Performance', icon: <Activity className="w-4 h-4" /> },
        { id: 'usage', label: 'Usage', icon: <Users className="w-4 h-4" /> },
        { id: 'system', label: 'System', icon: <Server className="w-4 h-4" /> },
        { id: 'services', label: 'Services', icon: <Layers className="w-4 h-4" /> },
        { id: 'geographic', label: 'Geographic', icon: <Globe className="w-4 h-4" /> },
        { id: 'devices', label: 'Devices', icon: <Monitor className="w-4 h-4" /> }
    ];

    if (!analyticsData) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="mt-2 text-gray-600">
                        Comprehensive analytics and insights for the CODAI ecosystem
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {timeRanges.map(range => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {analyticsData.overview.map((metric, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg bg-${metric.color}-100 text-${metric.color}-600`}>
                                {metric.icon}
                            </div>
                            <div className={`flex items-center space-x-1 ${getMetricTrendColor(metric.trend, metric.change)}`}>
                                {getMetricTrendIcon(metric.trend)}
                                <span className="text-sm font-medium">
                                    {Math.abs(metric.change)}%
                                </span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {metric.label === 'Response Time' ? `${metric.value}ms` :
                                    metric.label === 'System Uptime' ? `${metric.value}%` :
                                        metric.label === 'Error Rate' ? `${metric.value}%` :
                                            metric.label === 'Data Processed' ? `${metric.value}TB` :
                                                metric.label === 'CPU Usage' ? `${metric.value}%` :
                                                    formatNumber(metric.value)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

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
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">System Health Overview</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Services Running</span>
                                    <span className="text-sm font-medium text-green-600">6/8 (75%)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Average Uptime</span>
                                    <span className="text-sm font-medium text-green-600">98.9%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Critical Alerts</span>
                                    <span className="text-sm font-medium text-red-600">2 Active</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Performance Score</span>
                                    <span className="text-sm font-medium text-blue-600">87/100</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <Target className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-medium">Performance Report</span>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                                </button>
                                <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                        <span className="text-sm font-medium">View Alerts</span>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                                </button>
                                <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <Settings className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-medium">Configure Metrics</span>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Response Time Trends</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <LineChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Response Time Chart</p>
                                    <p className="text-xs text-gray-400">Current: 145ms avg</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Throughput Analysis</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Throughput Chart</p>
                                    <p className="text-xs text-gray-400">Peak: 1,350 req/min</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Error Rate Monitoring</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Error Rate Chart</p>
                                    <p className="text-xs text-gray-400">Current: 0.12%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Service Availability</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Availability Chart</p>
                                    <p className="text-xs text-gray-400">Weekly Average: 99.87%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'usage' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Active Users</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Users Chart</p>
                                    <p className="text-xs text-gray-400">Peak: 3,247 concurrent</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">API Usage by Endpoint</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <PieChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">API Usage Chart</p>
                                    <p className="text-xs text-gray-400">Auth: 28% • Users: 20%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Volume</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Request Volume Chart</p>
                                    <p className="text-xs text-gray-400">Daily Peak: 91K requests</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Transfer</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Data Transfer Chart</p>
                                    <p className="text-xs text-gray-400">Peak: 2.4TB processed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">CPU Usage by Service</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <Cpu className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">CPU Usage Chart</p>
                                    <p className="text-xs text-gray-400">Average: 34.5%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Memory Distribution</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <PieChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Memory Chart</p>
                                    <p className="text-xs text-gray-400">Used: 75% • Free: 25%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Disk Usage</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <HardDrive className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Disk Usage Chart</p>
                                    <p className="text-xs text-gray-400">Data: 67% • Free: 5%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Network Traffic</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <Wifi className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Network Traffic Chart</p>
                                    <p className="text-xs text-gray-400">Peak: 234 MB/s</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Service Performance</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uptime</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Errors</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {analyticsData.services.servicePerfomance.map((service, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getServiceStatusColor(service.status)}`}>
                                                    {getServiceStatusIcon(service.status)}
                                                    <span className="capitalize">{service.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {service.uptime}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {service.responseTime > 0 ? `${service.responseTime}ms` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatNumber(service.requests)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {service.errors}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'geographic' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Users by Region</h3>
                            <div className="space-y-4">
                                {analyticsData.geographic.regions.map((region, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-900">{region.region}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">{formatNumber(region.users)}</div>
                                            <div className="text-xs text-gray-500">{region.percentage}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center">
                                    <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">World Map</p>
                                    <p className="text-xs text-gray-400">Romania: 36.3% • Europe: 26.0%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'devices' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Device Types</h3>
                            <div className="space-y-4">
                                {analyticsData.devices.types.map((device, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {device.icon}
                                            <span className="text-sm font-medium text-gray-900">{device.type}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">{formatNumber(device.count)}</div>
                                            <div className="text-xs text-gray-500">{device.percentage}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Browser Usage</h3>
                            <div className="space-y-4">
                                {analyticsData.devices.browsers.map((browser, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {browser.icon}
                                            <span className="text-sm font-medium text-gray-900">{browser.browser}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">{formatNumber(browser.count)}</div>
                                            <div className="text-xs text-gray-500">{browser.percentage}%</div>
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
};

export default AnalyticsPage;
