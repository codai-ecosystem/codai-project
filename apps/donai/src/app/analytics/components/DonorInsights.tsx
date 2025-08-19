'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Heart, TrendingUp, Award, UserCheck, Clock, PieChart, BarChart3 } from 'lucide-react'

interface DonorSegment {
    id: string
    name: string
    count: number
    totalDonated: number
    avgDonation: number
    retentionRate: number
    color: string
}

interface DonorBehavior {
    id: string
    metric: string
    value: number
    trend: number
    description: string
    icon: any
}

interface DonorInsightsProps {
    selectedPeriod: string
}

export default function DonorInsights({ selectedPeriod }: DonorInsightsProps) {
    const [selectedSegment, setSelectedSegment] = useState('all')

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const donorSegments: DonorSegment[] = [
        {
            id: 'new',
            name: 'New Donors',
            count: 487,
            totalDonated: 234560,
            avgDonation: 482,
            retentionRate: 23.4,
            color: 'bg-green-500'
        },
        {
            id: 'recurring',
            name: 'Recurring Donors',
            count: 892,
            totalDonated: 567890,
            avgDonation: 637,
            retentionRate: 78.9,
            color: 'bg-blue-500'
        },
        {
            id: 'major',
            name: 'Major Donors',
            count: 124,
            totalDonated: 456780,
            avgDonation: 3684,
            retentionRate: 89.5,
            color: 'bg-purple-500'
        },
        {
            id: 'lapsed',
            name: 'Lapsed Donors',
            count: 234,
            totalDonated: 89340,
            avgDonation: 382,
            retentionRate: 12.8,
            color: 'bg-orange-500'
        }
    ]

    const donorBehaviors: DonorBehavior[] = [
        {
            id: '1',
            metric: 'Avg Time to First Donation',
            value: 3.2,
            trend: -12.5,
            description: 'Days from registration to first donation',
            icon: Clock
        },
        {
            id: '2',
            metric: 'Donation Frequency',
            value: 4.7,
            trend: 18.3,
            description: 'Average donations per donor per year',
            icon: TrendingUp
        },
        {
            id: '3',
            metric: 'Donor Lifetime Value',
            value: 2847,
            trend: 23.7,
            description: 'Average total contribution per donor',
            icon: Award
        },
        {
            id: '4',
            metric: 'Monthly Retention Rate',
            value: 67.8,
            trend: 8.9,
            description: 'Percentage of donors who donate monthly',
            icon: UserCheck
        }
    ]

    const getSegmentPercentage = (segment: DonorSegment) => {
        const totalDonors = donorSegments.reduce((sum, s) => sum + s.count, 0)
        return ((segment.count / totalDonors) * 100).toFixed(1)
    }

    return (
        <motion.div
            key="donors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            {/* Donor Segmentation */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Donor Segmentation Analysis</h3>
                    <div className="flex items-center space-x-2">
                        <PieChart className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Segment Distribution</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {donorSegments.map((segment, index) => (
                        <motion.div
                            key={segment.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-4 h-4 rounded-full ${segment.color}`} />
                                <span className="text-2xl font-bold text-gray-600">{getSegmentPercentage(segment)}%</span>
                            </div>

                            <h4 className="font-semibold text-gray-900 mb-3">{segment.name}</h4>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Count</span>
                                    <span className="font-semibold text-gray-900">{segment.count.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Donated</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(segment.totalDonated)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Avg Donation</span>
                                    <span className="font-semibold text-blue-600">{formatCurrency(segment.avgDonation)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Retention</span>
                                    <span className="font-semibold text-purple-600">{segment.retentionRate}%</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Donor Segment Chart */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200/50">
                    <h4 className="font-semibold text-gray-900 mb-4">Segment Distribution</h4>
                    <div className="space-y-3">
                        {donorSegments.map((segment, index) => (
                            <div key={segment.id} className="flex items-center space-x-4">
                                <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900">{segment.name}</span>
                                        <span className="text-sm text-gray-600">{getSegmentPercentage(segment)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getSegmentPercentage(segment)}%` }}
                                            transition={{ delay: index * 0.2, duration: 0.8 }}
                                            className={`h-2 rounded-full ${segment.color}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Donor Behavior Analytics */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Donor Behavior Analytics</h3>
                    <div className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Behavioral Insights</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {donorBehaviors.map((behavior, index) => (
                        <motion.div
                            key={behavior.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-6 border border-blue-200/50"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <behavior.icon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{behavior.metric}</h4>
                                        <p className="text-sm text-gray-600">{behavior.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {behavior.metric.includes('Value') ? formatCurrency(behavior.value) :
                                            behavior.metric.includes('Rate') || behavior.metric.includes('Frequency') ? `${behavior.value}${behavior.metric.includes('Rate') ? '%' : ''}` :
                                                `${behavior.value} days`}
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${behavior.trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    <TrendingUp className={`h-3 w-3 ${behavior.trend < 0 ? 'rotate-180' : ''}`} />
                                    <span>{Math.abs(behavior.trend)}%</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Donor Growth & Retention */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Growth & Retention Metrics</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200/50">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">New Donor Acquisition</h4>
                                <p className="text-sm text-gray-600">Monthly growth rate</p>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-green-600 mb-2">+23.4%</div>
                        <div className="text-sm text-gray-600">487 new donors this month</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Heart className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Donor Retention</h4>
                                <p className="text-sm text-gray-600">12-month retention rate</p>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-blue-600 mb-2">78.9%</div>
                        <div className="text-sm text-gray-600">Above industry average</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200/50">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Award className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Donor Engagement</h4>
                                <p className="text-sm text-gray-600">Active engagement score</p>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-purple-600 mb-2">8.7/10</div>
                        <div className="text-sm text-gray-600">Highly engaged community</div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
