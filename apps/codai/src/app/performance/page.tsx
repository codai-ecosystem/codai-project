'use client';

import React, { useState } from 'react';
import {
    Activity,
    Zap,
    Gauge,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    Database,
    Server,
    Globe,
    Cpu,
    HardDrive,
    Wifi,
    BarChart3,
    PieChart,
    LineChart,
    Target,
    Settings,
    RefreshCw,
    Download,
    Filter,
    Calendar,
    ArrowUp,
    ArrowDown,
    Minus,
    Eye,
    Play,
    Pause,
    RotateCcw,
    Lightbulb,
    Wrench,
    Search,
    Bell,
    AlertCircle,
    Info,
    ExternalLink,
    Code,
    MonitorSpeaker,
    Route,
    Timer,
    Layers,
    Smartphone,
    Monitor,
    Tablet,
    MapPin,
    Users,
    Flame,
    Snowflake,
    ThermometerSun,
    Wind,
    Waves,
    Sparkles,
    Rocket,
    Shield
} from 'lucide-react';

interface PerformanceMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    target: number;
    status: 'good' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
    change: number;
    category: 'core' | 'web' | 'api' | 'database' | 'infrastructure';
}

interface ServicePerformance {
    name: string;
    score: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
    status: 'healthy' | 'degraded' | 'critical';
}

interface OptimizationRecommendation {
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    category: string;
    estimatedImprovement: string;
    priority: number;
}

const performanceMetrics: PerformanceMetric[] = [
    {
        id: '1',
        name: 'Page Load Time',
        value: 1.24,
        unit: 's',
        target: 2.0,
        status: 'good',
        trend: 'down',
        change: -12.5,
        category: 'web'
    },
    {
        id: '2',
        name: 'First Contentful Paint',
        value: 0.89,
        unit: 's',
        target: 1.5,
        status: 'good',
        trend: 'down',
        change: -8.3,
        category: 'web'
    },
    {
        id: '3',
        name: 'Core Web Vitals Score',
        value: 92,
        unit: '/100',
        target: 90,
        status: 'good',
        trend: 'up',
        change: 3.2,
        category: 'web'
    },
    {
        id: '4',
        name: 'API Response Time',
        value: 145,
        unit: 'ms',
        target: 200,
        status: 'good',
        trend: 'stable',
        change: 0.8,
        category: 'api'
    },
    {
        id: '5',
        name: 'Database Query Time',
        value: 89,
        unit: 'ms',
        target: 100,
        status: 'good',
        trend: 'down',
        change: -15.2,
        category: 'database'
    },
    {
        id: '6',
        name: 'Memory Usage',
        value: 78.5,
        unit: '%',
        target: 80,
        status: 'warning',
        trend: 'up',
        change: 5.7,
        category: 'infrastructure'
    },
    {
        id: '7',
        name: 'CPU Utilization',
        value: 45.2,
        unit: '%',
        target: 70,
        status: 'good',
        trend: 'stable',
        change: -1.2,
        category: 'infrastructure'
    },
    {
        id: '8',
        name: 'Throughput',
        value: 2456,
        unit: 'req/min',
        target: 2000,
        status: 'good',
        trend: 'up',
        change: 23.4,
        category: 'api'
    }
];

const servicePerformance: ServicePerformance[] = [
    {
        name: 'CODAI API',
        score: 94,
        responseTime: 145,
        throughput: 1250,
        errorRate: 0.12,
        availability: 99.98,
        status: 'healthy'
    },
    {
        name: 'Auth Service',
        score: 97,
        responseTime: 89,
        throughput: 450,
        errorRate: 0.05,
        availability: 99.99,
        status: 'healthy'
    },
    {
        name: 'Database',
        score: 89,
        responseTime: 89,
        throughput: 2100,
        errorRate: 0.23,
        availability: 99.95,
        status: 'healthy'
    },
    {
        name: 'Cache Service',
        score: 91,
        responseTime: 12,
        throughput: 3200,
        errorRate: 0.08,
        availability: 99.97,
        status: 'healthy'
    },
    {
        name: 'File Storage',
        score: 85,
        responseTime: 234,
        throughput: 150,
        errorRate: 0.34,
        availability: 99.92,
        status: 'degraded'
    }
];

const optimizationRecommendations: OptimizationRecommendation[] = [
    {
        id: '1',
        title: 'Enable Redis Caching for Database Queries',
        description: 'Implement Redis caching layer for frequently accessed database queries to reduce response times by up to 60%.',
        impact: 'high',
        effort: 'medium',
        category: 'Database',
        estimatedImprovement: '60% faster query response',
        priority: 1
    },
    {
        id: '2',
        title: 'Implement Code Splitting for Frontend',
        description: 'Break down large JavaScript bundles into smaller chunks to improve initial page load times.',
        impact: 'high',
        effort: 'medium',
        category: 'Frontend',
        estimatedImprovement: '35% faster initial load',
        priority: 2
    },
    {
        id: '3',
        title: 'Optimize Database Indexes',
        description: 'Add missing indexes on frequently queried columns to improve database performance.',
        impact: 'medium',
        effort: 'low',
        category: 'Database',
        estimatedImprovement: '25% faster queries',
        priority: 3
    },
    {
        id: '4',
        title: 'Enable Gzip Compression',
        description: 'Configure server to use Gzip compression for static assets to reduce bandwidth usage.',
        impact: 'medium',
        effort: 'low',
        category: 'Infrastructure',
        estimatedImprovement: '40% smaller file sizes',
        priority: 4
    },
    {
        id: '5',
        title: 'Implement CDN for Static Assets',
        description: 'Use Content Delivery Network to serve static assets from edge locations worldwide.',
        impact: 'high',
        effort: 'high',
        category: 'Infrastructure',
        estimatedImprovement: '50% faster global load times',
        priority: 5
    }
];

export default function PerformancePage() {
    const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedTab, setSelectedTab] = useState('overview');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'good':
            case 'healthy':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'warning':
            case 'degraded':
                return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'critical':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Info className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good':
            case 'healthy':
                return 'text-green-600 bg-green-100 border-green-200';
            case 'warning':
            case 'degraded':
                return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'critical':
                return 'text-red-600 bg-red-100 border-red-200';
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getTrendIcon = (trend: string, change: number) => {
        if (trend === 'up') {
            return change > 0 ?
                <ArrowUp className="w-4 h-4 text-green-600" /> :
                <ArrowUp className="w-4 h-4 text-red-600" />;
        } else if (trend === 'down') {
            return change < 0 ?
                <ArrowDown className="w-4 h-4 text-green-600" /> :
                <ArrowDown className="w-4 h-4 text-red-600" />;
        }
        return <Minus className="w-4 h-4 text-gray-600" />;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'web': return <Globe className="w-4 h-4 text-blue-600" />;
            case 'api': return <Zap className="w-4 h-4 text-purple-600" />;
            case 'database': return <Database className="w-4 h-4 text-green-600" />;
            case 'infrastructure': return <Server className="w-4 h-4 text-orange-600" />;
            case 'core': return <Activity className="w-4 h-4 text-red-600" />;
            default: return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-100 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-100 border-green-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getEffortColor = (effort: string) => {
        switch (effort) {
            case 'low': return 'text-green-600 bg-green-100 border-green-200';
            case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'high': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const filteredMetrics = performanceMetrics.filter(metric =>
        selectedCategory === 'all' || metric.category === selectedCategory
    );

    const overallScore = Math.round(
        performanceMetrics.reduce((sum, metric) => {
            if (metric.status === 'good') return sum + 100;
            if (metric.status === 'warning') return sum + 70;
            return sum + 30;
        }, 0) / performanceMetrics.length
    );

    return (
        <div className="min-h-screen bg-gray-50 ml-80">
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Performance</h1>
                            <p className="text-gray-600 mt-2">Monitor and optimize system performance across all services</p>
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
                            <select
                                value={selectedTimeRange}
                                onChange={(e) => setSelectedTimeRange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="1h">Last hour</option>
                                <option value="6h">Last 6 hours</option>
                                <option value="24h">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                            </select>
                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Settings className="w-4 h-4" />
                                <span>Configure</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Overall Performance Score */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Overall Performance Score</h2>
                            <div className="flex items-center space-x-4">
                                <div className="text-4xl font-bold">{overallScore}/100</div>
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="w-6 h-6 text-green-300" />
                                    <span className="text-green-300 font-medium">+5.2%</span>
                                    <span className="text-blue-100">vs last week</span>
                                </div>
                            </div>
                            <p className="text-blue-100 mt-2">System performing {overallScore >= 90 ? 'excellent' : overallScore >= 70 ? 'good' : 'needs attention'}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                <Gauge className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'services', label: 'Services', icon: Server },
                        { id: 'optimization', label: 'Optimization', icon: Target },
                        { id: 'real-time', label: 'Real-time', icon: Activity }
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
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {selectedTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Category Filter */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Filter by category:</span>
                            <div className="flex items-center space-x-2">
                                {[
                                    { id: 'all', label: 'All', icon: Activity },
                                    { id: 'web', label: 'Web', icon: Globe },
                                    { id: 'api', label: 'API', icon: Zap },
                                    { id: 'database', label: 'Database', icon: Database },
                                    { id: 'infrastructure', label: 'Infrastructure', icon: Server }
                                ].map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm border ${selectedCategory === category.id
                                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <category.icon className="w-4 h-4" />
                                        <span>{category.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Performance Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredMetrics.map((metric) => (
                                <div key={metric.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            {getCategoryIcon(metric.category)}
                                            <span className="text-sm font-medium text-gray-500 capitalize">{metric.category}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {getStatusIcon(metric.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(metric.status)}`}>
                                                {metric.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{metric.name}</h3>
                                        <div className="flex items-baseline space-x-1">
                                            <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                                            <span className="text-gray-600">{metric.unit}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1">
                                            {getTrendIcon(metric.trend, metric.change)}
                                            <span className={`text-sm font-medium ${(metric.trend === 'up' && metric.change > 0) || (metric.trend === 'down' && metric.change < 0)
                                                    ? 'text-green-600'
                                                    : (metric.trend === 'up' && metric.change < 0) || (metric.trend === 'down' && metric.change > 0)
                                                        ? 'text-red-600'
                                                        : 'text-gray-600'
                                                }`}>
                                                {Math.abs(metric.change)}%
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Target: {metric.target}{metric.unit}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${metric.status === 'good' ? 'bg-green-600' :
                                                        metric.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                                                    }`}
                                                style={{
                                                    width: `${Math.min(100, (metric.value / metric.target) * 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Performance Trends Chart Placeholder */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
                                <div className="flex items-center space-x-2">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">Performance trend chart will be displayed here</p>
                                    <p className="text-sm text-gray-500 mt-1">Integration with Chart.js coming soon</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTab === 'services' && (
                    <div className="space-y-6">
                        {/* Services Performance Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            {servicePerformance.map((service, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Server className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(service.status)}
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                                                        {service.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">{service.score}/100</div>
                                            <div className="text-sm text-gray-500">Performance Score</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Clock className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm font-medium text-gray-700">Response Time</span>
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900">{service.responseTime}ms</div>
                                        </div>

                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Activity className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium text-gray-700">Throughput</span>
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900">{service.throughput}/min</div>
                                        </div>

                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                                <span className="text-sm font-medium text-gray-700">Error Rate</span>
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900">{service.errorRate}%</div>
                                        </div>

                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Shield className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-medium text-gray-700">Availability</span>
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900">{service.availability}%</div>
                                        </div>
                                    </div>

                                    {/* Service Score Progress */}
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full ${service.score >= 90 ? 'bg-green-600' :
                                                        service.score >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                                                    }`}
                                                style={{ width: `${service.score}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedTab === 'optimization' && (
                    <div className="space-y-6">
                        {/* Optimization Summary */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Optimization Opportunities</h3>
                                    <p className="text-gray-600">AI-powered recommendations to improve system performance</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                    <span className="text-sm font-medium text-gray-700">{optimizationRecommendations.length} recommendations</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Rocket className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">45%</div>
                                    <div className="text-sm text-gray-600">Potential Speed Improvement</div>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Sparkles className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">3 High</div>
                                    <div className="text-sm text-gray-600">Priority Optimizations</div>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Target className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">2 weeks</div>
                                    <div className="text-sm text-gray-600">Estimated Implementation</div>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations List */}
                        <div className="space-y-4">
                            {optimizationRecommendations.map((recommendation) => (
                                <div key={recommendation.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-sm font-bold text-blue-600">#{recommendation.priority}</span>
                                                </div>
                                                <h4 className="text-lg font-semibold text-gray-900">{recommendation.title}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(recommendation.impact)}`}>
                                                        {recommendation.impact} impact
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEffortColor(recommendation.effort)}`}>
                                                        {recommendation.effort} effort
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mb-4">{recommendation.description}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-1">
                                                        <Tag className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{recommendation.category}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm font-medium text-green-600">{recommendation.estimatedImprovement}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                                                        <Eye className="w-4 h-4" />
                                                        <span>Details</span>
                                                    </button>
                                                    <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded">
                                                        <Wrench className="w-4 h-4" />
                                                        <span>Implement</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedTab === 'real-time' && (
                    <div className="space-y-6">
                        {/* Real-time Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <Cpu className="w-8 h-8 text-red-600" />
                                    <span className="text-green-600 text-sm font-medium">Normal</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">45.2%</p>
                                <p className="text-gray-600 text-sm">CPU Usage</p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '45.2%' }}></div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <HardDrive className="w-8 h-8 text-blue-600" />
                                    <span className="text-yellow-600 text-sm font-medium">Warning</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">78.5%</p>
                                <p className="text-gray-600 text-sm">Memory Usage</p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78.5%' }}></div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <Wifi className="w-8 h-8 text-green-600" />
                                    <span className="text-green-600 text-sm font-medium">Excellent</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">2.1 Gbps</p>
                                <p className="text-gray-600 text-sm">Network Speed</p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <Database className="w-8 h-8 text-purple-600" />
                                    <span className="text-green-600 text-sm font-medium">Optimal</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">89ms</p>
                                <p className="text-gray-600 text-sm">DB Response</p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Real-time Chart Placeholder */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Real-time Performance Monitor</h3>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-gray-600">Live</span>
                                </div>
                            </div>

                            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">Real-time performance chart will be displayed here</p>
                                    <p className="text-sm text-gray-500 mt-1">Live metrics updating every 5 seconds</p>
                                </div>
                            </div>
                        </div>

                        {/* Active Alerts */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Performance Alerts</h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium text-yellow-800">High Memory Usage</p>
                                            <p className="text-sm text-yellow-600">Memory usage has exceeded 75% threshold</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-yellow-600">2 min ago</div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <Info className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-blue-800">Cache Miss Rate Increased</p>
                                            <p className="text-sm text-blue-600">Cache efficiency dropped to 85%</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-blue-600">5 min ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
