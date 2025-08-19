'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Download, Share2 } from 'lucide-react'

interface DonationAnalytics {
    id: string
    period: string
    totalDonations: number
    donorCount: number
    avgDonation: number
    conversionRate: number
    campaigns: number
    recurring: number
}

interface DonationAnalyticsProps {
    selectedPeriod: string
}

export default function DonationAnalytics({ selectedPeriod }: DonationAnalyticsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

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
        },
        {
            id: '7',
            period: 'July 2025',
            totalDonations: 1056780,
            donorCount: 1634,
            avgDonation: 647,
            conversionRate: 14.9,
            campaigns: 45,
            recurring: 54.2
        },
        {
            id: '8',
            period: 'August 2025',
            totalDonations: 1189320,
            donorCount: 1812,
            avgDonation: 656,
            conversionRate: 16.2,
            campaigns: 48,
            recurring: 57.8
        }
    ]

    return (
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

                {/* Summary Statistics */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(donationTrends.reduce((sum, trend) => sum + trend.totalDonations, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Total Collected</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
                        <div className="text-2xl font-bold text-blue-600">
                            {donationTrends.reduce((sum, trend) => sum + trend.donorCount, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Donors</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
                        <div className="text-2xl font-bold text-purple-600">
                            {Math.round(donationTrends.reduce((sum, trend) => sum + trend.avgDonation, 0) / donationTrends.length)} RON
                        </div>
                        <div className="text-sm text-gray-600">Avg Donation</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200/50">
                        <div className="text-2xl font-bold text-orange-600">
                            {Math.round(donationTrends.reduce((sum, trend) => sum + trend.conversionRate, 0) / donationTrends.length)}%
                        </div>
                        <div className="text-sm text-gray-600">Avg Conversion</div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
