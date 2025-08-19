'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    Target,
    FileText,
    RefreshCw,
    PieChart,
    Activity,
    Download,
    Share2
} from 'lucide-react'

// Import Modular Components
import AnalyticsOverview from './components/AnalyticsOverview'
import DonationAnalytics from './components/DonationAnalytics'
import CampaignPerformance from './components/CampaignPerformance'
import DonorInsights from './components/DonorInsights'
import ReportManagement from './components/ReportManagement'

// TypeScript Interfaces
interface AnalyticsMetric {
    id: string
    title: string
    value: string
    change: string
    trend: 'up' | 'down' | 'stable'
    icon: React.ReactNode
    color: string
}

export default function AnalyticsReportsPage() {
    const [activeView, setActiveView] = useState('overview')
    const [selectedPeriod, setSelectedPeriod] = useState('last-30-days')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)

    // Mock Data
    const keyMetrics: AnalyticsMetric[] = [
        {
            id: '1',
            title: 'Total Donations',
            value: '₹2,847,650',
            change: '+24.8%',
            trend: 'up',
            icon: <DollarSign className="h-6 w-6" />,
            color: 'text-green-600'
        },
        {
            id: '2',
            title: 'Total Donors',
            value: '4,392',
            change: '+18.2%',
            trend: 'up',
            icon: <Users className="h-6 w-6" />,
            color: 'text-blue-600'
        },
        {
            id: '3',
            title: 'Active Campaigns',
            value: '67',
            change: '+12.4%',
            trend: 'up',
            icon: <Target className="h-6 w-6" />,
            color: 'text-purple-600'
        },
        {
            id: '4',
            title: 'Success Rate',
            value: '87.3%',
            change: '+5.1%',
            trend: 'up',
            icon: <Award className="h-6 w-6" />,
            color: 'text-emerald-600'
        },
        {
            id: '5',
            title: 'Avg Donation',
            value: '₹648',
            change: '+8.7%',
            trend: 'up',
            icon: <Heart className="h-6 w-6" />,
            color: 'text-red-600'
        },
        {
            id: '6',
            title: 'Monthly Growth',
            value: '32.1%',
            change: '+14.3%',
            trend: 'up',
            icon: <TrendingUp className="h-6 w-6" />,
            color: 'text-indigo-600'
        }
    ]

    const donationTrends: DonationAnalytics[] = [
        {
            id: '1',
            period: 'January 2025',
            totalDonations: 567890,
            donorCount: 892,
            avgDonation: 637,
            conversionRate: 8.4,
            campaigns: 23,
            recurring: 34.2
        },
        {
            id: '2',
            period: 'February 2025',
            totalDonations: 634570,
            donorCount: 967,
            avgDonation: 656,
            conversionRate: 9.1,
            campaigns: 28,
            recurring: 38.7
        },
        {
            id: '3',
            period: 'March 2025',
            totalDonations: 723450,
            donorCount: 1123,
            avgDonation: 644,
            conversionRate: 10.3,
            campaigns: 31,
            recurring: 42.1
        },
        {
            id: '4',
            period: 'April 2025',
            totalDonations: 789320,
            donorCount: 1245,
            avgDonation: 634,
            conversionRate: 11.7,
            campaigns: 35,
            recurring: 45.8
        },
        {
            id: '5',
            period: 'May 2025',
            totalDonations: 845670,
            donorCount: 1367,
            avgDonation: 619,
            conversionRate: 12.4,
            campaigns: 38,
            recurring: 48.3
        },
        {
            id: '6',
            period: 'June 2025',
            totalDonations: 923480,
            donorCount: 1489,
            avgDonation: 621,
            conversionRate: 13.8,
            campaigns: 42,
            recurring: 51.7
        }
    ]

    const campaignPerformance: CampaignPerformance[] = [
        {
            id: '1',
            name: 'Emergency Flood Relief - Constanța',
            category: 'Emergency',
            raised: 87650,
            goal: 120000,
            donors: 342,
            conversionRate: 14.7,
            daysLeft: 18,
            status: 'active'
        },
        {
            id: '2',
            name: 'Rural School Technology Fund',
            category: 'Education',
            raised: 65400,
            goal: 85000,
            donors: 278,
            conversionRate: 11.2,
            daysLeft: 25,
            status: 'active'
        },
        {
            id: '3',
            name: 'Children\'s Hospital Equipment',
            category: 'Healthcare',
            raised: 142300,
            goal: 150000,
            donors: 567,
            conversionRate: 18.9,
            daysLeft: 8,
            status: 'active'
        },
        {
            id: '4',
            name: 'Elderly Care Support Program',
            category: 'Social',
            raised: 78900,
            goal: 75000,
            donors: 234,
            conversionRate: 15.3,
            daysLeft: 0,
            status: 'completed'
        },
        {
            id: '5',
            name: 'Environmental Conservation',
            category: 'Environment',
            raised: 54200,
            goal: 100000,
            donors: 189,
            conversionRate: 9.7,
            daysLeft: 45,
            status: 'active'
        }
    ]

    const donorInsights: DonorInsight[] = [
        {
            id: '1',
            segment: 'First-time Donors',
            count: 1847,
            avgDonation: 423,
            totalContribution: 780941,
            retentionRate: 34.2,
            growthRate: 28.7
        },
        {
            id: '2',
            segment: 'Recurring Donors',
            count: 893,
            avgDonation: 756,
            totalContribution: 675108,
            retentionRate: 87.3,
            growthRate: 12.4
        },
        {
            id: '3',
            segment: 'Major Donors',
            count: 156,
            avgDonation: 2340,
            totalContribution: 365040,
            retentionRate: 94.8,
            growthRate: 18.9
        },
        {
            id: '4',
            segment: 'Corporate Partners',
            count: 67,
            avgDonation: 4580,
            totalContribution: 306860,
            retentionRate: 91.2,
            growthRate: 22.1
        }
    ]

    const reportTemplates: ReportTemplate[] = [
        {
            id: '1',
            name: 'Monthly Donation Summary',
            description: 'Comprehensive overview of monthly donation activities and performance',
            frequency: 'Monthly',
            lastGenerated: '2025-08-01',
            recipients: 12,
            status: 'active'
        },
        {
            id: '2',
            name: 'Campaign Performance Report',
            description: 'Detailed analysis of individual campaign performance and ROI',
            frequency: 'Weekly',
            lastGenerated: '2025-08-05',
            recipients: 8,
            status: 'active'
        },
        {
            id: '3',
            name: 'Donor Engagement Analysis',
            description: 'Insights into donor behavior patterns and engagement metrics',
            frequency: 'Quarterly',
            lastGenerated: '2025-07-01',
            recipients: 15,
            status: 'active'
        },
        {
            id: '4',
            name: 'Financial Impact Statement',
            description: 'Detailed financial reporting for transparency and compliance',
            frequency: 'Monthly',
            lastGenerated: '2025-08-01',
            recipients: 25,
            status: 'active'
        },
        {
            id: '5',
            name: 'Board Meeting Dashboard',
            description: 'Executive summary for board presentations and strategic planning',
            frequency: 'Quarterly',
            lastGenerated: '2025-07-15',
            recipients: 6,
            status: 'draft'
        }
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const refreshData = async () => {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-md border-b border-green-200/50 sticky top-0 z-40"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Analytics & Reports
                                </h1>
                                <p className="text-gray-600 text-sm">Comprehensive donation insights and reporting</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="last-7-days">Last 7 Days</option>
                                <option value="last-30-days">Last 30 Days</option>
                                <option value="last-90-days">Last 90 Days</option>
                                <option value="last-year">Last Year</option>
                                <option value="all-time">All Time</option>
                            </select>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={refreshData}
                                disabled={loading}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex space-x-6 mt-4 border-b border-gray-200">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'donations', label: 'Donation Analytics', icon: DollarSign },
                            { id: 'campaigns', label: 'Campaign Performance', icon: Target },
                            { id: 'donors', label: 'Donor Insights', icon: Users },
                            { id: 'reports', label: 'Reports', icon: FileText }
                        ].map((tab) => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ y: -2 }}
                                onClick={() => setActiveView(tab.id)}
                                className={`flex items-center space-x-2 px-3 py-2 border-b-2 transition-all duration-200 ${activeView === tab.id
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                <span className="font-medium">{tab.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {/* Overview View */}
                    {activeView === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {keyMetrics.map((metric, index) => (
                                    <motion.div
                                        key={metric.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-600 text-sm font-medium">{metric.title}</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                                                <div className={`flex items-center space-x-1 mt-2 ${metric.color}`}>
                                                    <TrendingUp className="h-4 w-4" />
                                                    <span className="text-sm font-medium">{metric.change}</span>
                                                </div>
                                            </div>
                                            <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color === 'text-green-600' ? 'from-green-100 to-green-200' :
                                                    metric.color === 'text-blue-600' ? 'from-blue-100 to-blue-200' :
                                                        metric.color === 'text-purple-600' ? 'from-purple-100 to-purple-200' :
                                                            metric.color === 'text-emerald-600' ? 'from-emerald-100 to-emerald-200' :
                                                                metric.color === 'text-red-600' ? 'from-red-100 to-red-200' :
                                                                    'from-indigo-100 to-indigo-200'
                                                }`}>
                                                <div className={metric.color}>{metric.icon}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Quick Insights */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Donation Trends Chart */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Monthly Donation Trends</h3>
                                        <LineChart className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="space-y-4">
                                        {donationTrends.slice(-3).map((trend, index) => (
                                            <div key={trend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{trend.period}</p>
                                                    <p className="text-sm text-gray-600">{trend.donorCount} donors</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-green-600">{formatCurrency(trend.totalDonations)}</p>
                                                    <p className="text-sm text-gray-600">{trend.conversionRate}% conversion</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Top Performing Campaigns */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Top Performing Campaigns</h3>
                                        <Award className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="space-y-4">
                                        {campaignPerformance.slice(0, 3).map((campaign, index) => (
                                            <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 truncate">{campaign.name}</p>
                                                    <p className="text-sm text-gray-600">{campaign.category} • {campaign.donors} donors</p>
                                                    <div className="mt-2">
                                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                            <span>{formatCurrency(campaign.raised)}</span>
                                                            <span>{formatCurrency(campaign.goal)}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                                                                style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* Donation Analytics View */}
                    {activeView === 'donations' && (
                        <motion.div
                            key="donations"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">Donation Analytics Dashboard</h3>
                                    <div className="flex space-x-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
                                        >
                                            <Download className="h-4 w-4 mr-2 inline" />
                                            Export
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                                        >
                                            <Share2 className="h-4 w-4 mr-2 inline" />
                                            Share
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Donation Trends Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Period</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Total Donations</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Donors</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Avg Donation</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Conversion Rate</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Campaigns</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Recurring %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {donationTrends.map((trend, index) => (
                                                <motion.tr
                                                    key={trend.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="py-3 px-4 font-medium text-gray-900">{trend.period}</td>
                                                    <td className="py-3 px-4 text-green-600 font-semibold">{formatCurrency(trend.totalDonations)}</td>
                                                    <td className="py-3 px-4 text-gray-700">{trend.donorCount.toLocaleString()}</td>
                                                    <td className="py-3 px-4 text-gray-700">{formatCurrency(trend.avgDonation)}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                            {trend.conversionRate}%
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-700">{trend.campaigns}</td>
                                                    <td className="py-3 px-4 text-gray-700">{trend.recurring}%</td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Campaign Performance View */}
                    {activeView === 'campaigns' && (
                        <motion.div
                            key="campaigns"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">Campaign Performance Analysis</h3>
                                    <div className="flex items-center space-x-3">
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="all">All Categories</option>
                                            <option value="emergency">Emergency</option>
                                            <option value="education">Education</option>
                                            <option value="healthcare">Healthcare</option>
                                            <option value="environment">Environment</option>
                                            <option value="social">Social</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {campaignPerformance.map((campaign, index) => (
                                        <motion.div
                                            key={campaign.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50 hover:shadow-lg transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-2">{campaign.name}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                                                            campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                    {campaign.category}
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                        <span>Progress</span>
                                                        <span>{Math.round((campaign.raised / campaign.goal) * 100)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                                                            style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                                                        <span>{formatCurrency(campaign.raised)}</span>
                                                        <span>{formatCurrency(campaign.goal)}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Donors</p>
                                                        <p className="font-semibold text-gray-900">{campaign.donors}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Conversion</p>
                                                        <p className="font-semibold text-green-600">{campaign.conversionRate}%</p>
                                                    </div>
                                                </div>

                                                {campaign.status === 'active' && (
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{campaign.daysLeft} days remaining</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Donor Insights View */}
                    {activeView === 'donors' && (
                        <motion.div
                            key="donors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">Donor Insights & Segmentation</h3>
                                    <PieChart className="h-6 w-6 text-green-600" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {donorInsights.map((insight, index) => (
                                        <motion.div
                                            key={insight.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.15 }}
                                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-900">{insight.segment}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' :
                                                            index === 1 ? 'bg-blue-500' :
                                                                index === 2 ? 'bg-purple-500' :
                                                                    'bg-orange-500'
                                                        }`} />
                                                    <span className="text-sm font-medium text-gray-600">{insight.count} donors</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Avg Donation</p>
                                                        <p className="text-xl font-bold text-gray-900">{formatCurrency(insight.avgDonation)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Total Contribution</p>
                                                        <p className="text-xl font-bold text-green-600">{formatCurrency(insight.totalContribution)}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Retention Rate</p>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-green-500 h-2 rounded-full"
                                                                    style={{ width: `${insight.retentionRate}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900">{insight.retentionRate}%</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Growth Rate</p>
                                                        <div className="flex items-center space-x-1 text-green-600">
                                                            <TrendingUp className="h-4 w-4" />
                                                            <span className="text-sm font-semibold">+{insight.growthRate}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Reports View */}
                    {activeView === 'reports' && (
                        <motion.div
                            key="reports"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">Automated Reports & Templates</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                                    >
                                        <FileText className="h-4 w-4 mr-2 inline" />
                                        Create New Report
                                    </motion.button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {reportTemplates.map((report, index) => (
                                        <motion.div
                                            key={report.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50 hover:shadow-lg transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-2">{report.name}</h4>
                                                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'active' ? 'bg-green-100 text-green-700' :
                                                        report.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Frequency</p>
                                                        <p className="font-medium text-gray-900">{report.frequency}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Recipients</p>
                                                        <p className="font-medium text-gray-900">{report.recipients} users</p>
                                                    </div>
                                                </div>

                                                <div className="text-sm">
                                                    <p className="text-gray-600">Last Generated</p>
                                                    <p className="font-medium text-gray-900">{report.lastGenerated}</p>
                                                </div>

                                                <div className="flex space-x-2 pt-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1 inline" />
                                                        View
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                                    >
                                                        <Download className="h-4 w-4 mr-1 inline" />
                                                        Download
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/70 backdrop-blur-md border-t border-green-200/50 mt-16"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
                            <p className="text-sm text-gray-600">Live donation tracking and performance monitoring</p>
                        </div>

                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Automated Reporting</h3>
                            <p className="text-sm text-gray-600">Comprehensive reports generated automatically</p>
                        </div>

                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">AI Insights</h3>
                            <p className="text-sm text-gray-600">Smart recommendations and predictive analytics</p>
                        </div>
                    </div>
                </div>
            </motion.footer>
        </div>
    )
}
