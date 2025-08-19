'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    Users,
    DollarSign,
    Target,
    Award,
    Heart,
    LineChart
} from 'lucide-react'

interface AnalyticsMetric {
    id: string
    title: string
    value: string
    change: string
    trend: 'up' | 'down' | 'stable'
    icon: React.ReactNode
    color: string
}

interface DonationTrend {
    id: string
    period: string
    totalDonations: number
    donorCount: number
    conversionRate: number
}

interface Campaign {
    id: string
    name: string
    category: string
    raised: number
    goal: number
    donors: number
}

interface AnalyticsOverviewProps {
    selectedPeriod: string
    loading: boolean
}

export default function AnalyticsOverview({ selectedPeriod, loading }: AnalyticsOverviewProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const keyMetrics: AnalyticsMetric[] = [
        {
            id: '1',
            title: 'Total Donations',
            value: '2,847,650 RON',
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
            value: '648 RON',
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

    const donationTrends: DonationTrend[] = [
        {
            id: '4',
            period: 'April 2025',
            totalDonations: 789320,
            donorCount: 1245,
            conversionRate: 11.7
        },
        {
            id: '5',
            period: 'May 2025',
            totalDonations: 845670,
            donorCount: 1367,
            conversionRate: 12.4
        },
        {
            id: '6',
            period: 'June 2025',
            totalDonations: 923480,
            donorCount: 1489,
            conversionRate: 13.8
        }
    ]

    const topCampaigns: Campaign[] = [
        {
            id: '1',
            name: 'Emergency Flood Relief - Constanța',
            category: 'Emergency',
            raised: 87650,
            goal: 120000,
            donors: 342
        },
        {
            id: '2',
            name: 'Children\'s Hospital Equipment',
            category: 'Healthcare',
            raised: 142300,
            goal: 150000,
            donors: 567
        },
        {
            id: '3',
            name: 'Rural School Technology Fund',
            category: 'Education',
            raised: 65400,
            goal: 85000,
            donors: 278
        }
    ]

    return (
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
                        {donationTrends.map((trend, index) => (
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
                        {topCampaigns.map((campaign, index) => (
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

            {/* Performance Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">94.7%</div>
                        <div className="text-sm text-gray-600">Campaign Success Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">1.8x</div>
                        <div className="text-sm text-gray-600">Donor Retention Growth</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">47</div>
                        <div className="text-sm text-gray-600">Active Campaigns</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">32.1%</div>
                        <div className="text-sm text-gray-600">Monthly Growth Rate</div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
