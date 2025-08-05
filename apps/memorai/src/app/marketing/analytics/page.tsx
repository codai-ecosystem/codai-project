'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MarketingMetrics {
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    avgOrderValue: number;
    ltv: number;
    cac: number;
}

interface TrafficSource {
    source: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
}

interface Campaign {
    id: string;
    name: string;
    type: 'email' | 'social' | 'search' | 'display';
    status: 'active' | 'paused' | 'completed';
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cvr: number;
    cpc: number;
    roi: number;
}

interface ABTest {
    id: string;
    name: string;
    status: 'running' | 'completed' | 'draft';
    variants: {
        name: string;
        traffic: number;
        conversions: number;
        conversionRate: number;
        isWinner?: boolean;
    }[];
    startDate: string;
    endDate?: string;
    confidence: number;
}

export default function MarketingAnalyticsPage() {
    const router = useRouter();

    const [timeRange, setTimeRange] = useState('30d');
    const [selectedTab, setSelectedTab] = useState('overview');

    const [metrics, setMetrics] = useState<MarketingMetrics>({
        visitors: 45678,
        conversions: 892,
        conversionRate: 1.95,
        revenue: 25740,
        avgOrderValue: 28.85,
        ltv: 247.50,
        cac: 14.20
    });

    const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([
        {
            source: 'Organic Search',
            visitors: 18234,
            conversions: 487,
            conversionRate: 2.67,
            revenue: 14056
        },
        {
            source: 'Direct',
            visitors: 12456,
            conversions: 234,
            conversionRate: 1.88,
            revenue: 6754
        },
        {
            source: 'Social Media',
            visitors: 8923,
            conversions: 123,
            conversionRate: 1.38,
            revenue: 3547
        },
        {
            source: 'Email Marketing',
            visitors: 4567,
            conversions: 34,
            conversionRate: 0.74,
            revenue: 981
        },
        {
            source: 'Paid Search',
            visitors: 1498,
            conversions: 14,
            conversionRate: 0.93,
            revenue: 402
        }
    ]);

    const [campaigns, setCampaigns] = useState<Campaign[]>([
        {
            id: '1',
            name: 'Google Ads - AI Memory',
            type: 'search',
            status: 'active',
            budget: 5000,
            spent: 3456,
            impressions: 125678,
            clicks: 2341,
            conversions: 89,
            ctr: 1.86,
            cvr: 3.80,
            cpc: 1.48,
            roi: 2.4
        },
        {
            id: '2',
            name: 'Facebook - Pro Features',
            type: 'social',
            status: 'active',
            budget: 3000,
            spent: 2890,
            impressions: 89234,
            clicks: 1456,
            conversions: 34,
            ctr: 1.63,
            cvr: 2.34,
            cpc: 1.98,
            roi: 1.8
        },
        {
            id: '3',
            name: 'LinkedIn - Enterprise',
            type: 'social',
            status: 'paused',
            budget: 2000,
            spent: 1234,
            impressions: 34567,
            clicks: 567,
            conversions: 12,
            ctr: 1.64,
            cvr: 2.12,
            cpc: 2.18,
            roi: 1.2
        }
    ]);

    const [abTests, setAbTests] = useState<ABTest[]>([
        {
            id: '1',
            name: 'Landing Page Headline',
            status: 'running',
            variants: [
                { name: 'Control', traffic: 50, conversions: 89, conversionRate: 2.1 },
                { name: 'Variant A', traffic: 50, conversions: 134, conversionRate: 3.2, isWinner: true }
            ],
            startDate: '2024-01-01',
            confidence: 95
        },
        {
            id: '2',
            name: 'Pricing Page CTA',
            status: 'completed',
            variants: [
                { name: 'Control', traffic: 33, conversions: 45, conversionRate: 1.8 },
                { name: 'Variant A', traffic: 33, conversions: 67, conversionRate: 2.7, isWinner: true },
                { name: 'Variant B', traffic: 34, conversions: 52, conversionRate: 2.1 }
            ],
            startDate: '2023-12-01',
            endDate: '2023-12-31',
            confidence: 99
        }
    ]);

    useEffect(() => {
        // Simulate data updates based on time range
        if (timeRange === '7d') {
            setMetrics(prev => ({
                ...prev,
                visitors: Math.round(prev.visitors * 0.23),
                conversions: Math.round(prev.conversions * 0.23),
                revenue: Math.round(prev.revenue * 0.23)
            }));
        } else if (timeRange === '90d') {
            setMetrics(prev => ({
                ...prev,
                visitors: Math.round(prev.visitors * 3),
                conversions: Math.round(prev.conversions * 3),
                revenue: Math.round(prev.revenue * 3)
            }));
        }
    }, [timeRange]);

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'running':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'paused':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            case 'completed':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            default:
                return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Marketing Analytics
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Track performance, optimize campaigns, and measure ROI
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>

                        <button
                            onClick={() => router.push('/marketing/campaigns/new')}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            New Campaign
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', name: 'Overview' },
                            { id: 'campaigns', name: 'Campaigns' },
                            { id: 'ab-tests', name: 'A/B Tests' },
                            { id: 'attribution', name: 'Attribution' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === tab.id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Overview Tab */}
                {selectedTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Total Visitors
                                            </dt>
                                            <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {formatNumber(metrics.visitors)}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Conversions
                                            </dt>
                                            <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {formatNumber(metrics.conversions)}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Conversion Rate
                                            </dt>
                                            <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {metrics.conversionRate}%
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Revenue
                                            </dt>
                                            <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(metrics.revenue)}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Customer Metrics
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Avg Order Value</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(metrics.avgOrderValue)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Customer LTV</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(metrics.ltv)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Customer CAC</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(metrics.cac)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                                        <span className="text-gray-600 dark:text-gray-300">LTV:CAC Ratio</span>
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            {(metrics.ltv / metrics.cac).toFixed(1)}:1
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Traffic Sources
                                </h3>
                                <div className="space-y-4">
                                    {trafficSources.map((source, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {source.source}
                                                    </span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        {formatNumber(source.visitors)} visitors • {source.conversionRate}% CVR
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${(source.visitors / metrics.visitors) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="ml-4 text-right">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(source.revenue)}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                                    {source.conversions} conv
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Campaigns Tab */}
                {selectedTab === 'campaigns' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Active Campaigns
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Campaign
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Budget
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Impressions
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Clicks
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Conversions
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                ROI
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {campaigns.map((campaign) => (
                                            <tr key={campaign.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {campaign.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                            {campaign.type} campaign
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    <div>
                                                        {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {((campaign.spent / campaign.budget) * 100).toFixed(0)}% used
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {formatNumber(campaign.impressions)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    <div>
                                                        {formatNumber(campaign.clicks)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {campaign.ctr}% CTR
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    <div>
                                                        {campaign.conversions}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {campaign.cvr}% CVR
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`font-medium ${campaign.roi > 2
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : campaign.roi > 1
                                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {campaign.roi.toFixed(1)}x
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
                                                        Edit
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* A/B Tests Tab */}
                {selectedTab === 'ab-tests' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                A/B Tests
                            </h2>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                                Create Test
                            </button>
                        </div>

                        <div className="grid gap-6">
                            {abTests.map((test) => (
                                <div key={test.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {test.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Started {new Date(test.startDate).toLocaleDateString()}
                                                {test.endDate && ` • Ended ${new Date(test.endDate).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(test.status)}`}>
                                                {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                                            </span>
                                            {test.confidence >= 95 && (
                                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                                                    {test.confidence}% Confident
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        {test.variants.map((variant, index) => (
                                            <div key={index} className={`p-4 rounded-lg border ${variant.isWinner
                                                    ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900'
                                                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                                                }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {variant.name}
                                                    </h4>
                                                    {variant.isWinner && (
                                                        <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                                                            Winner
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                                    <div>Traffic: {variant.traffic}%</div>
                                                    <div>Conversions: {variant.conversions}</div>
                                                    <div className="font-medium">Rate: {variant.conversionRate}%</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Attribution Tab */}
                {selectedTab === 'attribution' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                Attribution Models
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                                        First-Touch Attribution
                                    </h4>
                                    <div className="space-y-3">
                                        {trafficSources.slice(0, 3).map((source, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-300">{source.source}</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {((source.conversions / metrics.conversions) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                                        Last-Touch Attribution
                                    </h4>
                                    <div className="space-y-3">
                                        {trafficSources.slice(0, 3).map((source, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-300">{source.source}</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {((source.conversions / metrics.conversions) * 100 * 0.8).toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
