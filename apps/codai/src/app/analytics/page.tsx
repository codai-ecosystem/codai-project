'use client';

import React, { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    PieChart,
    LineChart,
    Activity,
    Users,
    Code,
    GitBranch,
    Clock,
    Target,
    Zap,
    Eye,
    Download,
    Filter,
    Calendar,
    RefreshCw,
    ArrowUp,
    ArrowDown,
    Minus,
    Play,
    Pause,
    Square,
    Settings,
    Share2,
    Maximize2,
    MoreHorizontal,
    AlertCircle,
    CheckCircle,
    XCircle,
    DollarSign,
    Percent,
    Hash,
    Globe,
    Smartphone,
    Monitor,
    MapPin,
    Star
} from 'lucide-react';

interface AnalyticsMetric {
    id: string;
    name: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    period: string;
    icon: React.ReactNode;
    color: string;
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        color: string;
    }[];
}

interface RealtimeEvent {
    id: string;
    type: 'user_action' | 'error' | 'performance' | 'deployment';
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, any>;
}

const analyticsMetrics: AnalyticsMetric[] = [
    {
        id: '1',
        name: 'Active Users',
        value: '12,456',
        change: 8.2,
        trend: 'up',
        period: 'vs last week',
        icon: <Users className="w-6 h-6" />,
        color: 'blue'
    },
    {
        id: '2',
        name: 'Page Views',
        value: '89,234',
        change: -2.4,
        trend: 'down',
        period: 'vs last week',
        icon: <Eye className="w-6 h-6" />,
        color: 'green'
    },
    {
        id: '3',
        name: 'Code Commits',
        value: '1,567',
        change: 15.7,
        trend: 'up',
        period: 'vs last week',
        icon: <GitBranch className="w-6 h-6" />,
        color: 'purple'
    },
    {
        id: '4',
        name: 'API Requests',
        value: '456,789',
        change: 5.3,
        trend: 'up',
        period: 'vs last week',
        icon: <Zap className="w-6 h-6" />,
        color: 'orange'
    },
    {
        id: '5',
        name: 'Response Time',
        value: '89ms',
        change: -12.1,
        trend: 'down',
        period: 'vs last week',
        icon: <Clock className="w-6 h-6" />,
        color: 'red'
    },
    {
        id: '6',
        name: 'Conversion Rate',
        value: '3.42%',
        change: 0.8,
        trend: 'up',
        period: 'vs last week',
        icon: <Target className="w-6 h-6" />,
        color: 'indigo'
    }
];

const userActivityData: ChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            label: 'Active Users',
            data: [12000, 19000, 15000, 22000, 18000, 8000, 11000],
            color: '#3B82F6'
        },
        {
            label: 'New Users',
            data: [2000, 3500, 2800, 4200, 3100, 1200, 1800],
            color: '#10B981'
        }
    ]
};

const performanceData: ChartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
        {
            label: 'Response Time (ms)',
            data: [89, 94, 120, 145, 167, 98],
            color: '#EF4444'
        },
        {
            label: 'CPU Usage (%)',
            data: [45, 52, 68, 78, 85, 58],
            color: '#F59E0B'
        }
    ]
};

const realtimeEvents: RealtimeEvent[] = [
    {
        id: '1',
        type: 'user_action',
        message: 'User john.doe created new project "AI Dashboard"',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        severity: 'low'
    },
    {
        id: '2',
        type: 'deployment',
        message: 'Successfully deployed v2.1.0 to production',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        severity: 'medium'
    },
    {
        id: '3',
        type: 'error',
        message: 'Database connection timeout in /api/users endpoint',
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        severity: 'high'
    },
    {
        id: '4',
        type: 'performance',
        message: 'High memory usage detected on server-03 (87%)',
        timestamp: new Date(Date.now() - 18 * 60 * 1000),
        severity: 'medium'
    },
    {
        id: '5',
        type: 'user_action',
        message: '127 users currently active in the system',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        severity: 'low'
    }
];

const topPages = [
    { path: '/dashboard', views: 45623, bounce: 12.3, avgTime: '3:42' },
    { path: '/projects', views: 34512, bounce: 18.7, avgTime: '4:15' },
    { path: '/editor', views: 28934, bounce: 8.9, avgTime: '8:23' },
    { path: '/analytics', views: 19876, bounce: 22.1, avgTime: '2:58' },
    { path: '/settings', views: 12456, bounce: 35.4, avgTime: '1:45' }
];

const userSegments = [
    { name: 'New Users', count: 3420, percentage: 28.5, color: '#3B82F6' },
    { name: 'Returning Users', count: 5680, percentage: 47.3, color: '#10B981' },
    { name: 'Power Users', count: 2134, percentage: 17.8, color: '#F59E0B' },
    { name: 'Enterprise', count: 756, percentage: 6.4, color: '#8B5CF6' }
];

const geographicData = [
    { country: 'United States', users: 4520, percentage: 38.2 },
    { country: 'United Kingdom', users: 2134, percentage: 18.1 },
    { country: 'Germany', users: 1890, percentage: 16.0 },
    { country: 'France', users: 1456, percentage: 12.3 },
    { country: 'Canada', users: 1123, percentage: 9.5 },
    { country: 'Others', users: 677, percentage: 5.9 }
];

export default function AnalyticsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000);
    };

    const getMetricIcon = (trend: string, change: number) => {
        if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-600" />;
        if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-600" />;
        return <Minus className="w-4 h-4 text-gray-600" />;
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'user_action': return <Users className="w-4 h-4 text-blue-600" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'performance': return <Activity className="w-4 h-4 text-orange-600" />;
            case 'deployment': return <CheckCircle className="w-4 h-4 text-green-600" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 ml-80">
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                            <p className="text-gray-600 mt-2">Monitor performance, user behavior, and system metrics</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="1d">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                            </select>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Share2 className="w-4 h-4" />
                                <span>Share</span>
                            </button>
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
                                onClick={() => setActiveTab('users')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                User Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('performance')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'performance'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Performance
                            </button>
                            <button
                                onClick={() => setActiveTab('realtime')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'realtime'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Real-time
                            </button>
                        </nav>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                            {analyticsMetrics.map((metric) => (
                                <div key={metric.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${metric.color}-100`}>
                                            <div className={`text-${metric.color}-600`}>
                                                {metric.icon}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {getMetricIcon(metric.trend, metric.change)}
                                            <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' :
                                                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                {Math.abs(metric.change)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                        <p className="text-sm text-gray-600">{metric.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{metric.period}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* User Activity Chart */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Chart Placeholder - In real implementation, use Chart.js or similar */}
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600">User Activity Chart</p>
                                        <p className="text-sm text-gray-500">Interactive chart would be rendered here</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center space-x-6 mt-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Active Users</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">New Users</span>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Chart */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600">Performance Chart</p>
                                        <p className="text-sm text-gray-500">Real-time performance metrics</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center space-x-6 mt-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Response Time</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">CPU Usage</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Pages and User Segments */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Pages */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bounce %</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {topPages.map((page, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <code className="text-sm font-mono text-gray-900">{page.path}</code>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {page.views.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {page.bounce}%
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {page.avgTime}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* User Segments */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">User Segments</h3>

                                <div className="space-y-4">
                                    {userSegments.map((segment, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: segment.color }}
                                                ></div>
                                                <span className="text-sm font-medium text-gray-900">{segment.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm text-gray-600">{segment.count.toLocaleString()}</span>
                                                <span className="text-sm font-medium text-gray-900">{segment.percentage}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                        {userSegments.map((segment, index) => (
                                            <div
                                                key={index}
                                                className="h-full float-left"
                                                style={{
                                                    width: `${segment.percentage}%`,
                                                    backgroundColor: segment.color
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-8">
                        {/* User Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <Users className="w-8 h-8 text-blue-600" />
                                    <span className="text-green-600 text-sm font-medium">+12.5%</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">12,456</p>
                                <p className="text-gray-600">Total Users</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <Activity className="w-8 h-8 text-green-600" />
                                    <span className="text-green-600 text-sm font-medium">+8.2%</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">3,421</p>
                                <p className="text-gray-600">Active Today</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <Clock className="w-8 h-8 text-purple-600" />
                                    <span className="text-red-600 text-sm font-medium">-5.1%</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">4:32</p>
                                <p className="text-gray-600">Avg Session</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <Star className="w-8 h-8 text-yellow-600" />
                                    <span className="text-green-600 text-sm font-medium">+15.3%</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">89.2%</p>
                                <p className="text-gray-600">Satisfaction</p>
                            </div>
                        </div>

                        {/* Geographic Distribution */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Geographic Distribution</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {geographicData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">{item.country}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${item.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600 w-12 text-right">{item.percentage}%</span>
                                                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                                                    {item.users.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600">World Map</p>
                                        <p className="text-sm text-gray-500">Interactive geographic visualization</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Device Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-4">Device Types</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Monitor className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm text-gray-900">Desktop</span>
                                        </div>
                                        <span className="text-sm font-medium">68.5%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Smartphone className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-gray-900">Mobile</span>
                                        </div>
                                        <span className="text-sm font-medium">28.3%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Monitor className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm text-gray-900">Tablet</span>
                                        </div>
                                        <span className="text-sm font-medium">3.2%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-4">Operating Systems</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">Windows</span>
                                        <span className="text-sm font-medium">45.2%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">macOS</span>
                                        <span className="text-sm font-medium">28.7%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">Linux</span>
                                        <span className="text-sm font-medium">15.3%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">Android</span>
                                        <span className="text-sm font-medium">7.8%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">iOS</span>
                                        <span className="text-sm font-medium">3.0%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-4">Browsers</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">Chrome</span>
                                        <span className="text-sm font-medium">67.8%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">Safari</span>
                                        <span className="text-sm font-medium">18.2%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">Firefox</span>
                                        <span className="text-sm font-medium">8.9%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">Edge</span>
                                        <span className="text-sm font-medium">4.1%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">Other</span>
                                        <span className="text-sm font-medium">1.0%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'realtime' && (
                    <div className="space-y-8">
                        {/* Real-time Status */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-gray-900">Live Users</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">127</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Activity className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-900">Requests/min</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">2,456</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Zap className="w-4 h-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-gray-900">Avg Response</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">89ms</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center space-x-3 mb-2">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-900">Errors/min</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">0</p>
                            </div>
                        </div>

                        {/* Real-time Events */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Live Event Stream</h3>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600">Live</span>
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                <div className="divide-y divide-gray-200">
                                    {realtimeEvents.map((event) => (
                                        <div key={event.id} className="p-6 hover:bg-gray-50">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getEventIcon(event.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm text-gray-900">{event.message}</p>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                                                            {event.severity}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {Math.floor((Date.now() - event.timestamp.getTime()) / (1000 * 60))}m ago
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
