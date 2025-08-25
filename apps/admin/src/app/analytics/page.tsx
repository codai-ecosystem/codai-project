'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    Users,
    Activity,
    Globe,
    Smartphone,
    Monitor,
    Calendar,
    Clock,
    Eye,
    MousePointer,
    Download,
    Share,
    RefreshCw,
    Filter,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Target,
    DollarSign,
    ShoppingCart,
    UserPlus,
    LogIn,
    LogOut,
    FileText,
    Database,
    Server,
    Cpu,
    HardDrive,
    Network,
    AlertCircle,
    CheckCircle,
    Info,
    ExternalLink,
    Maximize2,
    MoreVertical
} from 'lucide-react';

interface AnalyticsMetric {
    id: string;
    name: string;
    value: number;
    previousValue: number;
    unit: string;
    format: 'number' | 'currency' | 'percentage' | 'duration';
    trend: 'up' | 'down' | 'stable';
    change: number;
    changeType: 'increase' | 'decrease';
    status: 'good' | 'warning' | 'critical';
    description: string;
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
        fill?: boolean;
    }[];
}

interface UserAnalytics {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    sessionDuration: number;
    bounceRate: number;
    pageViews: number;
    uniquePageViews: number;
}

interface SystemAnalytics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    uptime: number;
    errors: number;
    serverLoad: number;
    bandwidth: number;
}

interface BusinessMetrics {
    revenue: number;
    conversions: number;
    conversionRate: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    churnRate: number;
    retention: number;
    growthRate: number;
}

export default function Analytics() {
    const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
    const [selectedCategory, setSelectedCategory] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: '2024-07-30',
        end: '2024-08-06'
    });

    // Mock analytics metrics
    const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetric[]>([
        {
            id: 'total_users',
            name: 'Total Users',
            value: 12547,
            previousValue: 11892,
            unit: 'users',
            format: 'number',
            trend: 'up',
            change: 5.5,
            changeType: 'increase',
            status: 'good',
            description: 'Total registered users in the system'
        },
        {
            id: 'active_users',
            name: 'Active Users (24h)',
            value: 3247,
            previousValue: 3456,
            unit: 'users',
            format: 'number',
            trend: 'down',
            change: -6.0,
            changeType: 'decrease',
            status: 'warning',
            description: 'Users who logged in within the last 24 hours'
        },
        {
            id: 'revenue',
            name: 'Revenue',
            value: 45780,
            previousValue: 42350,
            unit: 'USD',
            format: 'currency',
            trend: 'up',
            change: 8.1,
            changeType: 'increase',
            status: 'good',
            description: 'Total revenue generated in the selected period'
        },
        {
            id: 'conversion_rate',
            name: 'Conversion Rate',
            value: 3.2,
            previousValue: 2.8,
            unit: '%',
            format: 'percentage',
            trend: 'up',
            change: 14.3,
            changeType: 'increase',
            status: 'good',
            description: 'Percentage of visitors who completed a conversion'
        },
        {
            id: 'avg_session',
            name: 'Avg Session Duration',
            value: 287,
            previousValue: 324,
            unit: 'seconds',
            format: 'duration',
            trend: 'down',
            change: -11.4,
            changeType: 'decrease',
            status: 'warning',
            description: 'Average time users spend in a session'
        },
        {
            id: 'system_uptime',
            name: 'System Uptime',
            value: 99.8,
            previousValue: 99.2,
            unit: '%',
            format: 'percentage',
            trend: 'up',
            change: 0.6,
            changeType: 'increase',
            status: 'good',
            description: 'System availability percentage'
        }
    ]);

    // Mock user analytics
    const [userAnalytics, setUserAnalytics] = useState<UserAnalytics>({
        totalUsers: 12547,
        activeUsers: 3247,
        newUsers: 655,
        returningUsers: 2592,
        sessionDuration: 287,
        bounceRate: 34.5,
        pageViews: 48392,
        uniquePageViews: 31246
    });

    // Mock system analytics
    const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics>({
        totalRequests: 125847,
        successfulRequests: 123456,
        failedRequests: 2391,
        averageResponseTime: 145,
        uptime: 99.8,
        errors: 23,
        serverLoad: 67,
        bandwidth: 1247.5
    });

    // Mock business metrics
    const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
        revenue: 45780,
        conversions: 1247,
        conversionRate: 3.2,
        averageOrderValue: 36.72,
        customerLifetimeValue: 234.50,
        churnRate: 2.1,
        retention: 87.3,
        growthRate: 12.4
    });

    // Mock chart data
    const [userActivityChart, setUserActivityChart] = useState<ChartData>({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Active Users',
            data: [2890, 3247, 3156, 3421, 3789, 2234, 1987],
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
            fill: true
        }]
    });

    const [revenueChart, setRevenueChart] = useState<ChartData>({
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
            label: 'Revenue',
            data: [11200, 12800, 10900, 10880],
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgb(16, 185, 129)',
            fill: true
        }]
    });

    const [deviceChart, setDeviceChart] = useState<ChartData>({
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [{
            label: 'Users by Device',
            data: [5847, 4923, 1777],
            // @ts-ignore
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)'
            ]
        }]
    });

    const formatValue = (value: number, format: string, unit: string) => {
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(value);
            case 'percentage':
                return `${value.toFixed(1)}%`;
            case 'duration':
                const minutes = Math.floor(value / 60);
                const seconds = value % 60;
                return `${minutes}m ${seconds}s`;
            case 'number':
            default:
                return new Intl.NumberFormat('en-US').format(value);
        }
    };

    const getChangeColor = (trend: string, changeType: string) => {
        if (trend === 'stable') return 'text-gray-600';

        // For most metrics, increase is good (green), decrease is bad (red)
        // But for some metrics like bounce rate, churn rate, decrease is good
        const isPositiveChange = changeType === 'increase';

        if (trend === 'up') {
            return isPositiveChange ? 'text-green-600' : 'text-red-600';
        } else {
            return isPositiveChange ? 'text-red-600' : 'text-green-600';
        }
    };

    const refreshData = async () => {
        setRefreshing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            // In real app, would fetch fresh analytics data
        } catch (error) {
            console.error('Failed to refresh analytics:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const exportData = () => {
        // In real app, would export analytics data
        console.log('Exporting analytics data...');
    };

    const categories = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'users', label: 'User Analytics', icon: <Users className="w-4 h-4" /> },
        { id: 'system', label: 'System Performance', icon: <Server className="w-4 h-4" /> },
        { id: 'business', label: 'Business Metrics', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'engagement', label: 'User Engagement', icon: <Activity className="w-4 h-4" /> }
    ];

    const timeRanges = [
        { value: '1h', label: 'Last Hour' },
        { value: '24h', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 3 Months' },
        { value: 'custom', label: 'Custom Range' }
    ];

    return (
        <div className="lg:pl-64">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Comprehensive analytics and insights for data-driven decisions
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <select
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {timeRanges.map((range) => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                        </select>

                        <button
                            onClick={exportData}
                            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>

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

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {analyticsMetrics.map((metric) => (
                        <div key={metric.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                                <div className={`w-2 h-2 rounded-full ${metric.status === 'good' ? 'bg-green-500' :
                                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />
                            </div>

                            <div className="space-y-2">
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatValue(metric.value, metric.format, metric.unit)}
                                </p>

                                <div className={`flex items-center text-sm ${getChangeColor(metric.trend, metric.changeType)}`}>
                                    {metric.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                                    {metric.trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                                    {metric.trend === 'stable' && <div className="w-3 h-3 mr-1" />}
                                    {metric.change !== 0 ? `${Math.abs(metric.change).toFixed(1)}%` : 'No change'}
                                    <span className="text-gray-500 ml-1">vs previous period</span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-3">{metric.description}</p>
                        </div>
                    ))}
                </div>

                {/* Category Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${selectedCategory === category.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {category.icon}
                                    <span>{category.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {selectedCategory === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* User Activity Chart */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <Maximize2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="h-64 bg-white rounded border flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p>User Activity Chart</p>
                                                <p className="text-sm">Interactive chart would be rendered here</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                            <div className="text-center">
                                                <p className="text-gray-500">Peak Hour</p>
                                                <p className="font-medium text-gray-900">2:00 PM</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-gray-500">Avg Daily</p>
                                                <p className="font-medium text-gray-900">3,247</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-gray-500">Growth</p>
                                                <p className="font-medium text-green-600">+12.3%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Revenue Trend */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <Maximize2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="h-64 bg-white rounded border flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p>Revenue Trend Chart</p>
                                                <p className="text-sm">Interactive chart would be rendered here</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                            <div className="text-center">
                                                <p className="text-gray-500">This Month</p>
                                                <p className="font-medium text-gray-900">$45,780</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-gray-500">Last Month</p>
                                                <p className="font-medium text-gray-900">$42,350</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-gray-500">Growth</p>
                                                <p className="font-medium text-green-600">+8.1%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Device Usage Distribution */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Device Usage Distribution</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-white rounded-lg p-4 text-center">
                                            <Monitor className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">5,847</p>
                                            <p className="text-sm text-gray-500">Desktop</p>
                                            <p className="text-xs text-blue-600 mt-1">46.6%</p>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 text-center">
                                            <Smartphone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">4,923</p>
                                            <p className="text-sm text-gray-500">Mobile</p>
                                            <p className="text-xs text-green-600 mt-1">39.2%</p>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 text-center">
                                            <Monitor className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">1,777</p>
                                            <p className="text-sm text-gray-500">Tablet</p>
                                            <p className="text-xs text-yellow-600 mt-1">14.2%</p>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 text-center">
                                            <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">12,547</p>
                                            <p className="text-sm text-gray-500">Total</p>
                                            <p className="text-xs text-purple-600 mt-1">100%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Analytics Tab */}
                        {selectedCategory === 'users' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-blue-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-blue-600">Total Users</p>
                                                <p className="text-2xl font-bold text-blue-900">{userAnalytics.totalUsers.toLocaleString()}</p>
                                            </div>
                                            <Users className="w-8 h-8 text-blue-600" />
                                        </div>
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-green-600">Active Users</p>
                                                <p className="text-2xl font-bold text-green-900">{userAnalytics.activeUsers.toLocaleString()}</p>
                                            </div>
                                            <Activity className="w-8 h-8 text-green-600" />
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-purple-600">New Users</p>
                                                <p className="text-2xl font-bold text-purple-900">{userAnalytics.newUsers.toLocaleString()}</p>
                                            </div>
                                            <UserPlus className="w-8 h-8 text-purple-600" />
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-orange-600">Returning Users</p>
                                                <p className="text-2xl font-bold text-orange-900">{userAnalytics.returningUsers.toLocaleString()}</p>
                                            </div>
                                            <LogIn className="w-8 h-8 text-orange-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">User Engagement Metrics</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-white rounded">
                                                <div className="flex items-center space-x-3">
                                                    <Clock className="w-5 h-5 text-blue-600" />
                                                    <span className="text-sm font-medium text-gray-900">Avg Session Duration</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {Math.floor(userAnalytics.sessionDuration / 60)}m {userAnalytics.sessionDuration % 60}s
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-white rounded">
                                                <div className="flex items-center space-x-3">
                                                    <MousePointer className="w-5 h-5 text-green-600" />
                                                    <span className="text-sm font-medium text-gray-900">Bounce Rate</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{userAnalytics.bounceRate}%</span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-white rounded">
                                                <div className="flex items-center space-x-3">
                                                    <Eye className="w-5 h-5 text-purple-600" />
                                                    <span className="text-sm font-medium text-gray-900">Page Views</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{userAnalytics.pageViews.toLocaleString()}</span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-white rounded">
                                                <div className="flex items-center space-x-3">
                                                    <Target className="w-5 h-5 text-orange-600" />
                                                    <span className="text-sm font-medium text-gray-900">Unique Page Views</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{userAnalytics.uniquePageViews.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">User Journey Analysis</h3>

                                        <div className="space-y-3">
                                            <div className="bg-white rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-900">Login Page</span>
                                                    <span className="text-xs text-gray-500">Entry Point</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">85% success rate</p>
                                            </div>

                                            <div className="bg-white rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-900">Dashboard</span>
                                                    <span className="text-xs text-gray-500">Main Hub</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">92% retention</p>
                                            </div>

                                            <div className="bg-white rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-900">Features</span>
                                                    <span className="text-xs text-gray-500">Engagement</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">67% feature adoption</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* System Performance Tab */}
                        {selectedCategory === 'system' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                                                <p className="text-2xl font-bold text-gray-900">{systemAnalytics.totalRequests.toLocaleString()}</p>
                                            </div>
                                            <Server className="w-8 h-8 text-blue-600" />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                                                <p className="text-2xl font-bold text-gray-900">{systemAnalytics.averageResponseTime}ms</p>
                                            </div>
                                            <Zap className="w-8 h-8 text-green-600" />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                                                <p className="text-2xl font-bold text-gray-900">{systemAnalytics.uptime}%</p>
                                            </div>
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                                                <p className="text-2xl font-bold text-gray-900">{((systemAnalytics.failedRequests / systemAnalytics.totalRequests) * 100).toFixed(2)}%</p>
                                            </div>
                                            <AlertCircle className="w-8 h-8 text-red-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Usage</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                                                    <span className="text-sm text-gray-600">{systemAnalytics.serverLoad}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${systemAnalytics.serverLoad}%` }}></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                                                    <span className="text-sm text-gray-600">72%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                                                    <span className="text-sm text-gray-600">45%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Bandwidth</span>
                                                    <span className="text-sm text-gray-600">{systemAnalytics.bandwidth} MB/s</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Status Distribution</h3>

                                        <div className="space-y-3">
                                            <div className="bg-white rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                        <span className="text-sm font-medium text-gray-900">Successful (2xx)</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-gray-900">{systemAnalytics.successfulRequests.toLocaleString()}</p>
                                                        <p className="text-xs text-gray-500">{((systemAnalytics.successfulRequests / systemAnalytics.totalRequests) * 100).toFixed(1)}%</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                        <span className="text-sm font-medium text-gray-900">Failed (4xx/5xx)</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-gray-900">{systemAnalytics.failedRequests.toLocaleString()}</p>
                                                        <p className="text-xs text-gray-500">{((systemAnalytics.failedRequests / systemAnalytics.totalRequests) * 100).toFixed(1)}%</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                        <span className="text-sm font-medium text-gray-900">Active Errors</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-gray-900">{systemAnalytics.errors}</p>
                                                        <p className="text-xs text-gray-500">Requires attention</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Business Metrics Tab */}
                        {selectedCategory === 'business' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-green-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-green-600">Revenue</p>
                                                <p className="text-2xl font-bold text-green-900">${businessMetrics.revenue.toLocaleString()}</p>
                                            </div>
                                            <DollarSign className="w-8 h-8 text-green-600" />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-blue-600">Conversions</p>
                                                <p className="text-2xl font-bold text-blue-900">{businessMetrics.conversions.toLocaleString()}</p>
                                            </div>
                                            <Target className="w-8 h-8 text-blue-600" />
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-purple-600">Conversion Rate</p>
                                                <p className="text-2xl font-bold text-purple-900">{businessMetrics.conversionRate}%</p>
                                            </div>
                                            <TrendingUp className="w-8 h-8 text-purple-600" />
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-orange-600">Growth Rate</p>
                                                <p className="text-2xl font-bold text-orange-900">{businessMetrics.growthRate}%</p>
                                            </div>
                                            <BarChart3 className="w-8 h-8 text-orange-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Metrics</h3>

                                        <div className="space-y-4">
                                            <div className="bg-white rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">Average Order Value</span>
                                                    <span className="text-lg font-bold text-gray-900">${businessMetrics.averageOrderValue}</span>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">Customer Lifetime Value</span>
                                                    <span className="text-lg font-bold text-gray-900">${businessMetrics.customerLifetimeValue}</span>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">Churn Rate</span>
                                                    <span className="text-lg font-bold text-red-600">{businessMetrics.churnRate}%</span>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">Retention Rate</span>
                                                    <span className="text-lg font-bold text-green-600">{businessMetrics.retention}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Indicators</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Revenue Growth</span>
                                                    <span className="text-sm text-green-600">+{businessMetrics.growthRate}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Target: 15%</p>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                                                    <span className="text-sm text-blue-600">4.2/5</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Target: 4.5/5</p>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Market Share</span>
                                                    <span className="text-sm text-purple-600">12.3%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Target: 20%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Engagement Tab */}
                        {selectedCategory === 'engagement' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-blue-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-blue-600">Daily Active Users</p>
                                                <p className="text-2xl font-bold text-blue-900">3,247</p>
                                                <p className="text-xs text-blue-600 mt-1">+5.2% from yesterday</p>
                                            </div>
                                            <Activity className="w-8 h-8 text-blue-600" />
                                        </div>
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-green-600">Feature Adoption</p>
                                                <p className="text-2xl font-bold text-green-900">67.3%</p>
                                                <p className="text-xs text-green-600 mt-1">+2.1% this week</p>
                                            </div>
                                            <Zap className="w-8 h-8 text-green-600" />
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-purple-600">User Satisfaction</p>
                                                <p className="text-2xl font-bold text-purple-900">4.2/5</p>
                                                <p className="text-xs text-purple-600 mt-1">Based on 1,247 reviews</p>
                                            </div>
                                            <CheckCircle className="w-8 h-8 text-purple-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Usage Breakdown</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">Dashboard</span>
                                                <span className="text-xs text-gray-500">95.2%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">Analytics</span>
                                                <span className="text-xs text-gray-500">78.6%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '79%' }}></div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">Settings</span>
                                                <span className="text-xs text-gray-500">65.3%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">API Tools</span>
                                                <span className="text-xs text-gray-500">42.1%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">Reports</span>
                                                <span className="text-xs text-gray-500">38.7%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-red-500 h-2 rounded-full" style={{ width: '39%' }}></div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">Integration</span>
                                                <span className="text-xs text-gray-500">23.4%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                                            </div>
                                        </div>
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
