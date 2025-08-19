import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    LineChart,
    PieChart,
    TrendingUp,
    TrendingDown,
    Target,
    Users,
    DollarSign,
    Calendar,
    Download,
    Filter,
    RefreshCw,
    Eye,
    Share2,
    Heart,
    MessageCircle,
    Award,
    Zap,
    Clock,
    ArrowUp,
    ArrowDown,
    Minus
} from 'lucide-react'

interface AnalyticsMetric {
    id: string
    label: string
    value: number
    previousValue: number
    format: 'currency' | 'number' | 'percentage'
    trend: 'up' | 'down' | 'stable'
    change: number
}

interface CampaignPerformance {
    id: string
    title: string
    raised: number
    goal: number
    donorCount: number
    averageDonation: number
    conversionRate: number
    socialShares: number
    pageViews: number
    timeline: Array<{
        date: string
        raised: number
        donors: number
    }>
}

interface FundraisingAnalyticsProps {
    campaigns: CampaignPerformance[]
    metrics: AnalyticsMetric[]
}

export function FundraisingAnalytics({ campaigns, metrics }: FundraisingAnalyticsProps) {
    const [activeView, setActiveView] = useState<'overview' | 'campaigns' | 'donors' | 'trends'>('overview')
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all')

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON'
        }).format(amount)
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
        return num.toString()
    }

    const formatValue = (value: number, format: string) => {
        switch (format) {
            case 'currency':
                return formatCurrency(value)
            case 'percentage':
                return `${value.toFixed(1)}%`
            default:
                return formatNumber(value)
        }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <ArrowUp className="h-4 w-4 text-green-600" />
            case 'down':
                return <ArrowDown className="h-4 w-4 text-red-600" />
            default:
                return <Minus className="h-4 w-4 text-gray-600" />
        }
    }

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'up':
                return 'text-green-600'
            case 'down':
                return 'text-red-600'
            default:
                return 'text-gray-600'
        }
    }

    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return 'from-green-400 to-green-500'
        if (percentage >= 60) return 'from-yellow-400 to-yellow-500'
        if (percentage >= 40) return 'from-orange-400 to-orange-500'
        return 'from-red-400 to-red-500'
    }

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatValue(metric.value, metric.format)}
                                </p>
                            </div>
                            <div className="flex items-center space-x-1">
                                {getTrendIcon(metric.trend)}
                                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500">
                            vs. previous period: {formatValue(metric.previousValue, metric.format)}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Performance Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Fundraising Performance</h3>
                    <div className="flex items-center space-x-2">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </motion.button>
                    </div>
                </div>

                {/* Mock Chart Area */}
                <div className="h-64 bg-gradient-to-t from-green-50 to-transparent rounded-xl p-4 flex items-end justify-between">
                    {Array.from({ length: 30 }, (_, i) => {
                        const height = Math.random() * 80 + 20
                        return (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: 0.02 * i }}
                                className="bg-gradient-to-t from-green-500 to-emerald-400 w-2 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                            />
                        )
                    })}
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>30 days ago</span>
                    <span>Today</span>
                </div>
            </div>

            {/* Top Performing Campaigns */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Campaigns</h3>
                <div className="space-y-4">
                    {campaigns.slice(0, 5).map((campaign, index) => {
                        const progress = (campaign.raised / campaign.goal) * 100

                        return (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-1">{campaign.title}</h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span>{campaign.donorCount} donors</span>
                                        <span>{formatCurrency(campaign.averageDonation)} avg</span>
                                        <span>{campaign.conversionRate.toFixed(1)}% conversion</span>
                                    </div>

                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>{formatCurrency(campaign.raised)}</span>
                                            <span>{formatCurrency(campaign.goal)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`bg-gradient-to-r ${getProgressColor(progress)} h-2 rounded-full`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">
                                        {progress.toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-gray-500">Completed</div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )

    const renderCampaigns = () => (
        <div className="space-y-6">
            {/* Campaign Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Campaign Analytics</h3>
                    <div className="flex items-center space-x-2">
                        <select
                            value={selectedCampaign}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="all">All Campaigns</option>
                            {campaigns.map(campaign => (
                                <option key={campaign.id} value={campaign.id}>
                                    {campaign.title}
                                </option>
                            ))}
                        </select>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Campaign Details */}
            <div className="grid gap-6">
                {campaigns.map((campaign, index) => {
                    const progress = (campaign.raised / campaign.goal) * 100

                    return (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">{campaign.title}</h4>
                                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <Users className="h-4 w-4" />
                                            <span>{campaign.donorCount} donors</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Eye className="h-4 w-4" />
                                            <span>{formatNumber(campaign.pageViews)} views</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Share2 className="h-4 w-4" />
                                            <span>{campaign.socialShares} shares</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {progress.toFixed(0)}%
                                    </div>
                                    <div className="text-sm text-gray-500">Goal Reached</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">Total Raised</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-900">
                                        {formatCurrency(campaign.raised)}
                                    </div>
                                    <div className="text-xs text-green-600">
                                        of {formatCurrency(campaign.goal)} goal
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800">Avg Donation</span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-900">
                                        {formatCurrency(campaign.averageDonation)}
                                    </div>
                                    <div className="text-xs text-blue-600">
                                        per donor
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Target className="h-5 w-5 text-purple-600" />
                                        <span className="text-sm font-medium text-purple-800">Conversion</span>
                                    </div>
                                    <div className="text-2xl font-bold text-purple-900">
                                        {campaign.conversionRate.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-purple-600">
                                        visitor to donor
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        <span className="text-sm font-medium text-orange-800">Social Impact</span>
                                    </div>
                                    <div className="text-2xl font-bold text-orange-900">
                                        {campaign.socialShares}
                                    </div>
                                    <div className="text-xs text-orange-600">
                                        shares & mentions
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Campaign Progress</span>
                                    <span>{formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`bg-gradient-to-r ${getProgressColor(progress)} h-3 rounded-full`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Timeline Chart */}
                            <div>
                                <h5 className="font-medium text-gray-900 mb-3">Fundraising Timeline</h5>
                                <div className="h-32 bg-gradient-to-t from-gray-50 to-transparent rounded-xl p-3 flex items-end justify-between">
                                    {campaign.timeline.map((point, i) => {
                                        const height = (point.raised / campaign.goal) * 100
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ delay: 0.05 * i }}
                                                className="bg-gradient-to-t from-green-500 to-emerald-400 w-3 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                                                title={`${point.date}: ${formatCurrency(point.raised)}`}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )

    const renderDonors = () => (
        <div className="space-y-6">
            {/* Donor Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-900">2,847</div>
                            <div className="text-sm text-blue-700">Total Donors</div>
                        </div>
                    </div>
                    <div className="text-xs text-blue-600">
                        +12% from last month
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-green-500 p-2 rounded-lg">
                            <Heart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-900">456</div>
                            <div className="text-sm text-green-700">Recurring Donors</div>
                        </div>
                    </div>
                    <div className="text-xs text-green-600">
                        16% of total donors
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-purple-500 p-2 rounded-lg">
                            <Award className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-900">89</div>
                            <div className="text-sm text-purple-700">Major Donors</div>
                        </div>
                    </div>
                    <div className="text-xs text-purple-600">
                        Donations over 1000 RON
                    </div>
                </div>
            </div>

            {/* Donor Segmentation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Donor Segmentation</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* By Donation Amount */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-4">By Donation Amount</h4>
                        <div className="space-y-3">
                            {[
                                { label: 'Small (< 100 RON)', count: 1825, percentage: 64, color: 'bg-blue-500' },
                                { label: 'Medium (100-500 RON)', count: 678, percentage: 24, color: 'bg-green-500' },
                                { label: 'Large (500-1000 RON)', count: 255, percentage: 9, color: 'bg-yellow-500' },
                                { label: 'Major (> 1000 RON)', count: 89, percentage: 3, color: 'bg-purple-500' }
                            ].map((segment, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className="w-32 text-sm text-gray-600">{segment.label}</div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${segment.percentage}%` }}
                                            transition={{ delay: 0.2 * index }}
                                            className={`${segment.color} h-2 rounded-full`}
                                        />
                                    </div>
                                    <div className="w-16 text-sm font-medium text-gray-900">{segment.count}</div>
                                    <div className="w-8 text-xs text-gray-500">{segment.percentage}%</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* By Frequency */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-4">By Donation Frequency</h4>
                        <div className="space-y-3">
                            {[
                                { label: 'One-time', count: 2391, percentage: 84, color: 'bg-gray-500' },
                                { label: 'Monthly', count: 341, percentage: 12, color: 'bg-green-500' },
                                { label: 'Quarterly', count: 85, percentage: 3, color: 'bg-blue-500' },
                                { label: 'Yearly', count: 30, percentage: 1, color: 'bg-purple-500' }
                            ].map((segment, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className="w-32 text-sm text-gray-600">{segment.label}</div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${segment.percentage}%` }}
                                            transition={{ delay: 0.2 * index }}
                                            className={`${segment.color} h-2 rounded-full`}
                                        />
                                    </div>
                                    <div className="w-16 text-sm font-medium text-gray-900">{segment.count}</div>
                                    <div className="w-8 text-xs text-gray-500">{segment.percentage}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Donors */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Top Donors This Month</h3>
                <div className="space-y-4">
                    {[
                        { name: 'Maria Popescu', amount: 5000, campaigns: 3, type: 'major' },
                        { name: 'Ion Gheorghiu', amount: 3500, campaigns: 2, type: 'major' },
                        { name: 'Ana Ionescu', amount: 2200, campaigns: 4, type: 'recurring' },
                        { name: 'Mihai Stoica', amount: 1800, campaigns: 1, type: 'major' },
                        { name: 'Elena Radu', amount: 1500, campaigns: 2, type: 'recurring' }
                    ].map((donor, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {donor.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{donor.name}</h4>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <span>{donor.campaigns} campaigns</span>
                                        <span>•</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${donor.type === 'major'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                            {donor.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                    {formatCurrency(donor.amount)}
                                </div>
                                <div className="text-xs text-gray-500">This month</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderTrends = () => (
        <div className="space-y-6">
            {/* Trend Analysis */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Fundraising Trends</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Seasonal Trends */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-4">Seasonal Performance</h4>
                        <div className="space-y-3">
                            {[
                                { season: 'Winter', amount: 145000, growth: 12.5, color: 'bg-blue-500' },
                                { season: 'Spring', amount: 98000, growth: -5.2, color: 'bg-green-500' },
                                { season: 'Summer', amount: 67000, growth: -18.3, color: 'bg-yellow-500' },
                                { season: 'Autumn', amount: 112000, growth: 8.7, color: 'bg-orange-500' }
                            ].map((period, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 ${period.color} rounded-full`} />
                                        <span className="font-medium text-gray-900">{period.season}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="font-bold text-gray-900">
                                            {formatCurrency(period.amount)}
                                        </span>
                                        <span className={`text-sm font-medium flex items-center space-x-1 ${period.growth > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {period.growth > 0 ? (
                                                <TrendingUp className="h-3 w-3" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3" />
                                            )}
                                            <span>{Math.abs(period.growth)}%</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Growth */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-4">Monthly Growth Rate</h4>
                        <div className="h-48 bg-gradient-to-t from-gray-50 to-transparent rounded-xl p-4 flex items-end justify-between">
                            {[12, 8, -3, 15, 22, 7, 18, 5, 11, 25, 14, 9].map((growth, i) => {
                                const height = Math.abs(growth) * 2 + 10
                                const isPositive = growth > 0

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ delay: 0.05 * i }}
                                        className={`w-4 rounded-t-sm ${isPositive
                                                ? 'bg-gradient-to-t from-green-500 to-green-400'
                                                : 'bg-gradient-to-t from-red-500 to-red-400'
                                            } opacity-80 hover:opacity-100 transition-opacity`}
                                        title={`${growth > 0 ? '+' : ''}${growth}%`}
                                    />
                                )
                            })}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Jan</span>
                            <span>Dec</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Predictions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Fundraising Predictions</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-3">
                            <Zap className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Next Month</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900 mb-1">
                            {formatCurrency(125000)}
                        </div>
                        <div className="text-xs text-blue-600">
                            Projected fundraising
                        </div>
                        <div className="flex items-center space-x-1 mt-2">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">+8% confidence</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center space-x-2 mb-3">
                            <Target className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Quarter Goal</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900 mb-1">
                            {formatCurrency(450000)}
                        </div>
                        <div className="text-xs text-green-600">
                            Achievability: High
                        </div>
                        <div className="flex items-center space-x-1 mt-2">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">87% likelihood</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center space-x-2 mb-3">
                            <Clock className="h-5 w-5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-800">Best Time</span>
                        </div>
                        <div className="text-lg font-bold text-purple-900 mb-1">
                            15:00 - 18:00
                        </div>
                        <div className="text-xs text-purple-600">
                            Peak donation hours
                        </div>
                        <div className="flex items-center space-x-1 mt-2">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">32% higher conversion</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">AI Recommendations</h3>
                <div className="space-y-4">
                    {[
                        {
                            type: 'optimization',
                            title: 'Optimize Campaign Timing',
                            description: 'Launch new campaigns on Tuesday mornings for 23% higher engagement',
                            impact: 'High',
                            effort: 'Low'
                        },
                        {
                            type: 'targeting',
                            title: 'Target Recurring Donors',
                            description: 'Focus on converting one-time donors to monthly supporters',
                            impact: 'Medium',
                            effort: 'Medium'
                        },
                        {
                            type: 'content',
                            title: 'Update Success Stories',
                            description: 'Campaigns with recent impact stories see 18% more donations',
                            impact: 'Medium',
                            effort: 'Low'
                        }
                    ].map((rec, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-gray-900">{rec.title}</h4>
                                <div className="flex space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${rec.impact === 'High'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {rec.impact} Impact
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${rec.effort === 'Low'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {rec.effort} Effort
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white/50 p-1 rounded-xl">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'campaigns', label: 'Campaigns', icon: Target },
                    { id: 'donors', label: 'Donors', icon: Users },
                    { id: 'trends', label: 'Trends', icon: TrendingUp }
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveView(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all flex-1 justify-center ${activeView === tab.id
                                ? 'bg-white text-green-600 shadow-md'
                                : 'text-gray-600 hover:text-green-600'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span className="font-medium">{tab.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeView === 'overview' && renderOverview()}
                {activeView === 'campaigns' && renderCampaigns()}
                {activeView === 'donors' && renderDonors()}
                {activeView === 'trends' && renderTrends()}
            </motion.div>
        </div>
    )
}
