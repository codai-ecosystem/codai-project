'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, TrendingDown, Users, Target,
    Mail, Share2, MessageSquare, DollarSign, Eye, Heart,
    Calendar, Filter, Download, RefreshCw, ArrowUpRight,
    ArrowDownRight, Zap, Clock, Globe, Smartphone, Monitor,
    PieChart, LineChart, Activity, Award, AlertTriangle,
    CheckCircle, Plus, Settings, Search, Maximize2
} from 'lucide-react';

interface MetricData {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: React.ElementType;
    description: string;
}

interface ChartData {
    name: string;
    value: number;
    percentage?: number;
    color: string;
}

interface TimeSeriesData {
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
}

interface ChannelPerformance {
    channel: string;
    icon: React.ElementType;
    reach: number;
    engagement: number;
    conversions: number;
    cost: number;
    roi: number;
    trend: 'up' | 'down' | 'neutral';
}

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d');
    const [selectedMetric, setSelectedMetric] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAnalyticsData();
    }, [timeRange]);

    const loadAnalyticsData = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
    };

    const refreshData = async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setRefreshing(false);
    };

    const metrics: MetricData[] = [
        {
            label: 'Total Impressions',
            value: '2.4M',
            change: '+18.5%',
            trend: 'up',
            icon: Eye,
            description: 'Total ad impressions across all campaigns'
        },
        {
            label: 'Click-Through Rate',
            value: '3.2%',
            change: '+0.8%',
            trend: 'up',
            icon: Target,
            description: 'Average CTR across all campaigns'
        },
        {
            label: 'Conversion Rate',
            value: '8.4%',
            change: '+1.2%',
            trend: 'up',
            icon: TrendingUp,
            description: 'Percentage of clicks that convert'
        },
        {
            label: 'Cost Per Acquisition',
            value: '$12.50',
            change: '-15.3%',
            trend: 'up',
            icon: DollarSign,
            description: 'Average cost to acquire a customer'
        },
        {
            label: 'Return on Ad Spend',
            value: '4.8x',
            change: '+0.9x',
            trend: 'up',
            icon: Award,
            description: 'Revenue generated per dollar spent'
        },
        {
            label: 'Total Revenue',
            value: '$487K',
            change: '+24.7%',
            trend: 'up',
            icon: DollarSign,
            description: 'Total revenue from marketing campaigns'
        }
    ];

    const channelPerformance: ChannelPerformance[] = [
        {
            channel: 'Email Marketing',
            icon: Mail,
            reach: 245000,
            engagement: 12.5,
            conversions: 3420,
            cost: 8500,
            roi: 5.8,
            trend: 'up'
        },
        {
            channel: 'Social Media',
            icon: Share2,
            reach: 890000,
            engagement: 8.3,
            conversions: 5200,
            cost: 15200,
            roi: 4.2,
            trend: 'up'
        },
        {
            channel: 'Google Ads',
            icon: Target,
            reach: 450000,
            engagement: 15.7,
            conversions: 7800,
            cost: 28000,
            roi: 3.9,
            trend: 'down'
        },
        {
            channel: 'Content Marketing',
            icon: MessageSquare,
            reach: 120000,
            engagement: 22.1,
            conversions: 1890,
            cost: 5600,
            roi: 6.2,
            trend: 'up'
        }
    ];

    const audienceData: ChartData[] = [
        { name: '18-24', value: 18, color: '#8B5CF6' },
        { name: '25-34', value: 32, color: '#A78BFA' },
        { name: '35-44', value: 28, color: '#C4B5FD' },
        { name: '45-54', value: 15, color: '#DDD6FE' },
        { name: '55+', value: 7, color: '#EDE9FE' }
    ];

    const deviceData: ChartData[] = [
        { name: 'Mobile', value: 58, color: '#EC4899' },
        { name: 'Desktop', value: 35, color: '#F472B6' },
        { name: 'Tablet', value: 7, color: '#F9A8D4' }
    ];

    const timeSeriesData: TimeSeriesData[] = [
        { date: '2024-01-01', impressions: 45000, clicks: 1200, conversions: 89, revenue: 4500 },
        { date: '2024-01-02', impressions: 52000, clicks: 1450, conversions: 102, revenue: 5200 },
        { date: '2024-01-03', impressions: 48000, clicks: 1350, conversions: 95, revenue: 4800 },
        { date: '2024-01-04', impressions: 61000, clicks: 1680, conversions: 125, revenue: 6200 },
        { date: '2024-01-05', impressions: 58000, clicks: 1590, conversions: 118, revenue: 5900 },
        { date: '2024-01-06', impressions: 55000, clicks: 1520, conversions: 112, revenue: 5600 },
        { date: '2024-01-07', impressions: 63000, clicks: 1720, conversions: 132, revenue: 6800 }
    ];

    const topPerformingCampaigns = [
        { name: 'Summer Product Launch', performance: 95, revenue: 67500, roi: 7.7 },
        { name: 'Social Media Boost', performance: 88, revenue: 95000, roi: 5.1 },
        { name: 'Google Ads Campaign', performance: 82, revenue: 78500, roi: 3.6 },
        { name: 'Flash Sale Campaign', performance: 96, revenue: 42000, roi: 8.8 }
    ];

    const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up': return <ArrowUpRight className="w-4 h-4 text-green-600" />;
            case 'down': return <ArrowDownRight className="w-4 h-4 text-red-600" />;
            default: return <Minus className="w-4 h-4 text-gray-600" />;
        }
    };

    const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up': return 'text-green-600 bg-green-50';
            case 'down': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Enhanced Header */}
            <header className="bg-white/90 backdrop-blur-lg border-b border-purple-100/50 sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Marketing Analytics
                                    </h1>
                                    <p className="text-sm text-gray-600">Performance insights and data visualization</p>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center space-x-2 ml-8">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm text-gray-600">Real-time data</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search metrics..."
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50"
                                />
                            </div>

                            {/* Time Range Selector */}
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
                            >
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="1y">Last year</option>
                                <option value="custom">Custom range</option>
                            </select>

                            {/* Action Buttons */}
                            <button
                                onClick={refreshData}
                                disabled={refreshing}
                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>

                            <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                <Download className="w-5 h-5" />
                            </button>

                            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2">
                                <Plus className="w-4 h-4" />
                                <span>Custom Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Metric Tabs */}
                    <nav className="flex space-x-1 bg-gray-100/50 rounded-xl p-1">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'performance', label: 'Performance', icon: TrendingUp },
                            { id: 'audience', label: 'Audience', icon: Users },
                            { id: 'channels', label: 'Channels', icon: Globe },
                            { id: 'campaigns', label: 'Campaigns', icon: Target }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedMetric(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${selectedMetric === tab.id
                                            ? 'bg-white text-purple-600 shadow-md'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                {selectedMetric === 'overview' && (
                    <div className="space-y-8">
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                            {metrics.map((metric, index) => {
                                const Icon = metric.icon;
                                return (
                                    <motion.div
                                        key={metric.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-100/50 hover:shadow-lg transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.trend === 'up' ? 'from-green-500 to-emerald-600' :
                                                    metric.trend === 'down' ? 'from-red-500 to-rose-600' :
                                                        'from-gray-500 to-slate-600'
                                                } flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(metric.trend)}`}>
                                                {getTrendIcon(metric.trend)}
                                                <span>{metric.change}</span>
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                                        <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
                                        <p className="text-xs text-gray-500">{metric.description}</p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Performance Chart Placeholder */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                                    <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                                    <div className="text-center">
                                        <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 mb-1">Revenue Trend Chart</p>
                                        <p className="text-xs text-gray-500">Interactive chart will be implemented</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
                                    <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: 'Impressions', value: 2400000, percentage: 100 },
                                        { label: 'Clicks', value: 76800, percentage: 3.2 },
                                        { label: 'Visitors', value: 68400, percentage: 2.85 },
                                        { label: 'Leads', value: 5750, percentage: 0.24 },
                                        { label: 'Customers', value: 483, percentage: 0.02 }
                                    ].map((stage, index) => (
                                        <div key={stage.label} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                                <span className="font-medium text-gray-900">{stage.label}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{stage.value.toLocaleString()}</p>
                                                <p className="text-xs text-gray-600">{stage.percentage}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Performing Campaigns */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Top Performing Campaigns</h3>
                                <a href="/campaigns" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                                    View all campaigns
                                </a>
                            </div>

                            <div className="space-y-4">
                                {topPerformingCampaigns.map((campaign, index) => (
                                    <motion.div
                                        key={campaign.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                                <Award className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                                                <p className="text-sm text-gray-600">Performance Score: {campaign.performance}%</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-8">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-gray-900">${campaign.revenue.toLocaleString()}</p>
                                                <p className="text-xs text-gray-600">Revenue</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-gray-900">{campaign.roi}x</p>
                                                <p className="text-xs text-gray-600">ROI</p>
                                            </div>
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${campaign.performance}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Channel Performance Tab */}
                {selectedMetric === 'channels' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                            {channelPerformance.map((channel, index) => {
                                const Icon = channel.icon;
                                return (
                                    <motion.div
                                        key={channel.channel}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-100/50 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div className={`p-1 rounded-full ${getTrendColor(channel.trend)}`}>
                                                {getTrendIcon(channel.trend)}
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-4">{channel.channel}</h3>

                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Reach</span>
                                                <span className="font-medium">{channel.reach.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Engagement</span>
                                                <span className="font-medium">{channel.engagement}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Conversions</span>
                                                <span className="font-medium">{channel.conversions.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">ROI</span>
                                                <span className="font-medium text-green-600">{channel.roi}x</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Other tabs placeholder */}
                {!['overview', 'channels'].includes(selectedMetric) && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Analytics
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Advanced {selectedMetric} analytics and insights will be implemented in the next phase.
                        </p>
                        <p className="text-sm text-gray-500">
                            Coming soon with detailed charts and interactive visualizations.
                        </p>
                    </div>
                )}
            </main>

            {/* Modern Footer */}
            <footer className="bg-white/70 backdrop-blur-sm border-t border-purple-100/50 mt-12">
                <div className="px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                                <span className="font-bold text-gray-900">Analytics Hub</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Comprehensive marketing analytics with real-time insights and performance tracking.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Analytics</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Performance Metrics</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Audience Insights</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Channel Analysis</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">ROI Tracking</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Reports</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Custom Reports</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Scheduled Reports</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Data Export</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Dashboard Builder</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Tools</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Data Visualization</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Trend Analysis</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">Predictive Models</a></li>
                                <li><a href="#" className="hover:text-purple-600 transition-colors">API Access</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-purple-100/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-600">
                            © 2024 MarketAI Analytics by CODAI. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Privacy</a>
                            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Terms</a>
                            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
