'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Shield,
    Server,
    Users,
    Zap,
    TrendingUp,
    Activity,
    CheckCircle,
    AlertCircle,
    Clock,
    Award,
    DollarSign,
    Cpu,
    Network,
    Globe,
    Eye,
    Settings,
    Plus,
    Filter,
    Search,
    Coins,
    BarChart3,
    MapPin,
    Wifi
} from 'lucide-react'

interface Validator {
    id: string
    name: string
    address: string
    status: 'active' | 'inactive' | 'jailed' | 'unbonding'
    stake: string
    commission: string
    uptime: string
    blocks: number
    lastSeen: string
    location: string
    website?: string
    delegators: number
    selfStake: string
    totalRewards: string
}

interface NetworkStats {
    totalValidators: number
    activeValidators: number
    totalStake: string
    averageUptime: string
    blockHeight: number
    networkHealth: string
}

interface StakingPool {
    totalStaked: string
    totalDelegators: number
    annualYield: string
    unbondingPeriod: string
    minStake: string
    slashingRate: string
}

export default function ValidatorsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedValidator, setSelectedValidator] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'validators' | 'staking' | 'rewards'>('validators')
    const [filter, setFilter] = useState({
        status: 'all',
        location: 'all'
    })

    const networkStats: NetworkStats = {
        totalValidators: 2847,
        activeValidators: 2456,
        totalStake: '847.3M KODEX',
        averageUptime: '99.87%',
        blockHeight: 2847392,
        networkHealth: '98.5%'
    }

    const stakingPool: StakingPool = {
        totalStaked: '847.3M KODEX',
        totalDelegators: 18456,
        annualYield: '12.5%',
        unbondingPeriod: '21 days',
        minStake: '100 KODEX',
        slashingRate: '5%'
    }

    const validators: Validator[] = [
        {
            id: 'val1',
            name: 'KodexCore Validator',
            address: 'kodexvaloper1qw2eh...7x9k',
            status: 'active',
            stake: '45.7M KODEX',
            commission: '5%',
            uptime: '99.98%',
            blocks: 234567,
            lastSeen: '2s ago',
            location: 'North America',
            website: 'https://kodexcore.io',
            delegators: 1247,
            selfStake: '2.5M KODEX',
            totalRewards: '567K KODEX'
        },
        {
            id: 'val2',
            name: 'Quantum Nodes',
            address: 'kodexvaloper1abc123...def4',
            status: 'active',
            stake: '38.2M KODEX',
            commission: '3%',
            uptime: '99.95%',
            blocks: 189456,
            lastSeen: '1s ago',
            location: 'Europe',
            website: 'https://quantumnodes.com',
            delegators: 892,
            selfStake: '1.8M KODEX',
            totalRewards: '423K KODEX'
        },
        {
            id: 'val3',
            name: 'Stellar Stake',
            address: 'kodexvaloper1xyz789...abc1',
            status: 'active',
            stake: '32.1M KODEX',
            commission: '4%',
            uptime: '99.92%',
            blocks: 156789,
            lastSeen: '3s ago',
            location: 'Asia',
            delegators: 654,
            selfStake: '1.2M KODEX',
            totalRewards: '345K KODEX'
        },
        {
            id: 'val4',
            name: 'Cosmic Validators',
            address: 'kodexvaloper1def456...ghi7',
            status: 'active',
            stake: '28.9M KODEX',
            commission: '6%',
            uptime: '99.89%',
            blocks: 134567,
            lastSeen: '5s ago',
            location: 'South America',
            delegators: 567,
            selfStake: '950K KODEX',
            totalRewards: '289K KODEX'
        },
        {
            id: 'val5',
            name: 'Digital Fortress',
            address: 'kodexvaloper1ghi789...jkl0',
            status: 'inactive',
            stake: '15.4M KODEX',
            commission: '8%',
            uptime: '98.45%',
            blocks: 89456,
            lastSeen: '2h ago',
            location: 'Africa',
            delegators: 234,
            selfStake: '500K KODEX',
            totalRewards: '156K KODEX'
        }
    ]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'inactive': return <Clock className="w-4 h-4 text-yellow-500" />
            case 'jailed': return <AlertCircle className="w-4 h-4 text-red-500" />
            case 'unbonding': return <Activity className="w-4 h-4 text-orange-500" />
            default: return <Activity className="w-4 h-4 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700'
            case 'inactive': return 'bg-yellow-100 text-yellow-700'
            case 'jailed': return 'bg-red-100 text-red-700'
            case 'unbonding': return 'bg-orange-100 text-orange-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getUptimeColor = (uptime: string) => {
        const uptimeValue = parseFloat(uptime)
        if (uptimeValue >= 99.9) return 'text-green-600'
        if (uptimeValue >= 99.5) return 'text-yellow-600'
        return 'text-red-600'
    }

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 12)}...${address.slice(-4)}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white py-4 px-6 shadow-xl"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Validator Network</h1>
                                    <p className="text-indigo-100">Monitor and manage network validators</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="px-3 py-1 bg-green-500/20 rounded-lg flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm">Network Active</span>
                            </div>
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>Become Validator</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Network Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkStats.totalValidators.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Validators</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkStats.activeValidators.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Active Validators</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Coins className="w-5 h-5 text-purple-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkStats.totalStake}</p>
                        <p className="text-sm text-gray-600">Total Stake</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Zap className="w-5 h-5 text-yellow-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkStats.averageUptime}</p>
                        <p className="text-sm text-gray-600">Average Uptime</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Server className="w-5 h-5 text-indigo-600" />
                            </div>
                            <Activity className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkStats.blockHeight.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Block Height</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Shield className="w-5 h-5 text-green-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkStats.networkHealth}</p>
                        <p className="text-sm text-gray-600">Network Health</p>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg mb-8"
                >
                    <div className="flex space-x-1">
                        {[
                            { id: 'validators', label: 'Validators', icon: Server },
                            { id: 'staking', label: 'Staking Pool', icon: Coins },
                            { id: 'rewards', label: 'Rewards', icon: Award }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Content based on active tab */}
                {activeTab === 'validators' && (
                    <>
                        {/* Search and Filters */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8"
                        >
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by validator name or address..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <select
                                        value={filter.status}
                                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="jailed">Jailed</option>
                                        <option value="unbonding">Unbonding</option>
                                    </select>
                                    <select
                                        value={filter.location}
                                        onChange={(e) => setFilter({ ...filter, location: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Locations</option>
                                        <option value="North America">North America</option>
                                        <option value="Europe">Europe</option>
                                        <option value="Asia">Asia</option>
                                        <option value="South America">South America</option>
                                        <option value="Africa">Africa</option>
                                        <option value="Oceania">Oceania</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>

                        {/* Validators List */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Network Validators</h2>
                                <p className="text-gray-600">Active validators securing the KodexChain network</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Validator</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Stake</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Commission</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Uptime</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Blocks</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Delegators</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Location</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {validators.map((validator, index) => (
                                            <motion.tr
                                                key={validator.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{validator.name}</div>
                                                        <div className="text-sm text-gray-600 font-mono">{truncateAddress(validator.address)}</div>
                                                        <div className="text-xs text-gray-500">Last seen: {validator.lastSeen}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(validator.status)}`}>
                                                        {getStatusIcon(validator.status)}
                                                        <span className="capitalize">{validator.status}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{validator.stake}</div>
                                                        <div className="text-xs text-gray-500">Self: {validator.selfStake}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-medium text-gray-900">{validator.commission}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`font-medium ${getUptimeColor(validator.uptime)}`}>
                                                        {validator.uptime}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-medium text-gray-900">{validator.blocks.toLocaleString()}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-medium text-gray-900">{validator.delegators.toLocaleString()}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{validator.location}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-indigo-600 hover:text-indigo-700 p-1">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-green-600 hover:text-green-700 p-1">
                                                            <DollarSign className="w-4 h-4" />
                                                        </button>
                                                        {validator.website && (
                                                            <button className="text-gray-600 hover:text-gray-700 p-1">
                                                                <Globe className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </>
                )}

                {activeTab === 'staking' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-8"
                    >
                        {/* Staking Pool Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Coins className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stakingPool.totalStaked}</p>
                                <p className="text-sm text-gray-600">Total Staked</p>
                                <div className="mt-2 text-xs text-gray-500">
                                    {stakingPool.totalDelegators.toLocaleString()} delegators
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <BarChart3 className="w-5 h-5 text-green-600" />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stakingPool.annualYield}</p>
                                <p className="text-sm text-gray-600">Annual Yield</p>
                                <div className="mt-2 text-xs text-gray-500">
                                    Estimated returns
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <Clock className="w-4 h-4 text-blue-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stakingPool.unbondingPeriod}</p>
                                <p className="text-sm text-gray-600">Unbonding Period</p>
                                <div className="mt-2 text-xs text-gray-500">
                                    Min stake: {stakingPool.minStake}
                                </div>
                            </div>
                        </div>

                        {/* Staking Actions */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Stake Your KODEX</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Delegate to Validator</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Stake</label>
                                            <input
                                                type="text"
                                                placeholder="100 KODEX"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Validator</label>
                                            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                                                <option>KodexCore Validator (5% commission)</option>
                                                <option>Quantum Nodes (3% commission)</option>
                                                <option>Stellar Stake (4% commission)</option>
                                            </select>
                                        </div>
                                        <button className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                                            Stake KODEX
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4">Staking Information</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Annual Yield:</span>
                                            <span className="font-medium text-green-600">{stakingPool.annualYield}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Minimum Stake:</span>
                                            <span className="font-medium">{stakingPool.minStake}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Unbonding Period:</span>
                                            <span className="font-medium">{stakingPool.unbondingPeriod}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Slashing Rate:</span>
                                            <span className="font-medium text-red-600">{stakingPool.slashingRate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'rewards' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="p-4 bg-yellow-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                <Award className="w-10 h-10 text-yellow-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Staking Rewards</h2>
                            <p className="text-gray-600 mb-8">
                                View and claim your staking rewards. Rewards are automatically distributed to delegators based on validator performance.
                            </p>
                            <div className="space-y-4">
                                <button className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                                    <Award className="w-5 h-5" />
                                    <span>View My Rewards</span>
                                </button>
                                <button className="w-full px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors flex items-center justify-center space-x-2">
                                    <DollarSign className="w-5 h-5" />
                                    <span>Claim All Rewards</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
