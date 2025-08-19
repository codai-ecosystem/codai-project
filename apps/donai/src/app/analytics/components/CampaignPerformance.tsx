'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Target, Calendar, Filter, Search } from 'lucide-react'

interface Campaign {
    id: string
    name: string
    category: string
    goal: number
    raised: number
    donors: number
    startDate: string
    endDate: string
    status: 'active' | 'completed' | 'upcoming'
    successRate: number
    avgDonation: number
}

interface CampaignPerformanceProps {
    selectedPeriod: string
}

export default function CampaignPerformance({ selectedPeriod }: CampaignPerformanceProps) {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const campaigns: Campaign[] = [
        {
            id: '1',
            name: 'Ajutați copiii din casa de copii "Speranța"',
            category: 'Copii',
            goal: 150000,
            raised: 178950,
            donors: 234,
            startDate: '2025-01-15',
            endDate: '2025-03-15',
            status: 'completed',
            successRate: 119.3,
            avgDonation: 765
        },
        {
            id: '2',
            name: 'Construim școala din satul Mihai Viteazu',
            category: 'Educație',
            goal: 300000,
            raised: 267340,
            donors: 412,
            startDate: '2025-02-01',
            endDate: '2025-06-01',
            status: 'active',
            successRate: 89.1,
            avgDonation: 649
        },
        {
            id: '3',
            name: 'Echipamente medicale pentru spitalul județean',
            category: 'Sănătate',
            goal: 450000,
            raised: 523780,
            donors: 789,
            startDate: '2024-11-01',
            endDate: '2025-02-28',
            status: 'completed',
            successRate: 116.4,
            avgDonation: 664
        },
        {
            id: '4',
            name: 'Salvați pădurea din Munții Carpați',
            category: 'Mediu',
            goal: 200000,
            raised: 156780,
            donors: 298,
            startDate: '2025-03-01',
            endDate: '2025-08-31',
            status: 'active',
            successRate: 78.4,
            avgDonation: 526
        },
        {
            id: '5',
            name: 'Renovarea casei de bătrâni din Brașov',
            category: 'Social',
            goal: 180000,
            raised: 198450,
            donors: 367,
            startDate: '2024-12-01',
            endDate: '2025-04-30',
            status: 'active',
            successRate: 110.3,
            avgDonation: 541
        },
        {
            id: '6',
            name: 'Tabără de vară pentru copiii defavorizați',
            category: 'Copii',
            goal: 80000,
            raised: 89650,
            donors: 156,
            startDate: '2025-04-01',
            endDate: '2025-06-15',
            status: 'active',
            successRate: 112.1,
            avgDonation: 575
        }
    ]

    const categories = ['all', 'Copii', 'Educație', 'Sănătate', 'Mediu', 'Social']

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700'
            case 'completed': return 'bg-blue-100 text-blue-700'
            case 'upcoming': return 'bg-yellow-100 text-yellow-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getProgressColor = (rate: number) => {
        if (rate >= 100) return 'bg-green-500'
        if (rate >= 75) return 'bg-yellow-500'
        return 'bg-orange-500'
    }

    return (
        <motion.div
            key="campaigns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
                    <h3 className="text-xl font-semibold text-gray-900">Campaign Performance Analysis</h3>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Campaign Performance Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCampaigns.map((campaign, index) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-white to-green-50/30 rounded-xl p-6 border border-green-200/50 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {campaign.name}
                                    </h4>
                                    <div className="flex items-center space-x-2 mb-3">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                            {campaign.category}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(campaign.status)}`}>
                                            {campaign.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-semibold text-gray-900">{campaign.successRate.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${getProgressColor(campaign.successRate)}`}
                                        style={{ width: `${Math.min(campaign.successRate, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Campaign Stats */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Target className="h-4 w-4" />
                                        <span className="text-sm">Goal</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{formatCurrency(campaign.goal)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-green-600">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-sm">Raised</span>
                                    </div>
                                    <span className="font-semibold text-green-600">{formatCurrency(campaign.raised)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-blue-600">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm">Donors</span>
                                    </div>
                                    <span className="font-semibold text-blue-600">{campaign.donors}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-purple-600">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">Avg Donation</span>
                                    </div>
                                    <span className="font-semibold text-purple-600">{formatCurrency(campaign.avgDonation)}</span>
                                </div>
                            </div>

                            {/* Campaign Dates */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500">
                                    {new Date(campaign.startDate).toLocaleDateString('ro-RO')} - {new Date(campaign.endDate).toLocaleDateString('ro-RO')}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Performance Summary */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
                        <div className="text-2xl font-bold text-green-600">
                            {filteredCampaigns.filter(c => c.status === 'active').length}
                        </div>
                        <div className="text-sm text-gray-600">Active Campaigns</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
                        <div className="text-2xl font-bold text-blue-600">
                            {Math.round(filteredCampaigns.reduce((sum, c) => sum + c.successRate, 0) / filteredCampaigns.length)}%
                        </div>
                        <div className="text-sm text-gray-600">Avg Success Rate</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
                        <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(filteredCampaigns.reduce((sum, c) => sum + c.raised, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Total Raised</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200/50">
                        <div className="text-2xl font-bold text-orange-600">
                            {filteredCampaigns.reduce((sum, c) => sum + c.donors, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Donors</div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
