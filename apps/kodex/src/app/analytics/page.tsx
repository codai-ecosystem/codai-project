'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    BarChart3,
    Activity,
    TrendingUp,
    TrendingDown,
    Zap,
    Users,
    Server,
    Globe,
    Clock,
    DollarSign,
    Cpu,
    Network,
    Database,
    Shield,
    Calendar,
    Filter,
    Download,
    RefreshCw,
    Eye,
    AlertCircle,
    CheckCircle,
    Hash,
    Coins
} from 'lucide-react'

interface NetworkMetrics {
    blockHeight: number
    blockTime: string
    transactionCount: number
    activeValidators: number
    totalStake: string
    networkHashrate: string
    avgBlockSize: string
    gasPrice: string
}

interface PerformanceData {
    tps: number
    latency: string
    uptime: string
    efficiency: string
    throughput: string
    congestion: string
}

interface NetworkHealth {
    overall: number
    consensus: number
    security: number
    decentralization: number
    performance: number
}

interface ChartData {
    timestamp: string
    transactions: number
    blockSize: number
    gasUsed: number
    validatorCount: number
    stakeAmount: number
}

export default function AnalyticsPage() {
    const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
    const [selectedMetric, setSelectedMetric] = useState<'transactions' | 'blocks' | 'validators' | 'stake'>('transactions')
    const [autoRefresh, setAutoRefresh] = useState(true)

    const networkMetrics: NetworkMetrics = {
        blockHeight: 2847392,
        blockTime: '3.2s',
        transactionCount: 1247892,
        activeValidators: 2456,
        totalStake: '847.3M KODEX',
        networkHashrate: '15.7 TH/s',
        avgBlockSize: '1.2 MB',
        gasPrice: '0.003 KODEX'
    }

    const performanceData: PerformanceData = {
        tps: 8947,
        latency: '245ms',
        uptime: '99.97%',
        efficiency: '94.8%',
        throughput: '1.2 GB/h',
        congestion: 'Low'
    }

    const networkHealth: NetworkHealth = {
        overall: 98.5,
        consensus: 99.2,
        security: 97.8,
        decentralization: 96.4,
        performance: 98.9
    }

    const recentBlocks = [
        {
            height: 2847392,
            hash: '0xa1b2c3d4e5f6789012345678901234567890abcdef',
            validator: 'KodexCore',
            transactions: 145,
            size: '1.3 MB',
            gasUsed: '98.5%',
            timestamp: '2s ago'
        },
        {
            height: 2847391,
            hash: '0xb2c3d4e5f6789012345678901234567890abcdef1',
            validator: 'Quantum Nodes',
            transactions: 132,
            size: '1.1 MB',
            gasUsed: '89.2%',
            timestamp: '5s ago'
        },
        {
            height: 2847390,
            hash: '0xc3d4e5f6789012345678901234567890abcdef12',
            validator: 'Stellar Stake',
            transactions: 156,
            size: '1.4 MB',
            gasUsed: '92.7%',
            timestamp: '8s ago'
        },
        {
            height: 2847389,
            hash: '0xd4e5f6789012345678901234567890abcdef123',
            validator: 'Cosmic Validators',
            transactions: 128,
            size: '1.0 MB',
            gasUsed: '85.1%',
            timestamp: '11s ago'
        }
    ]

    const getHealthColor = (score: number) => {
        if (score >= 95) return 'text-green-600'
        if (score >= 85) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getHealthBg = (score: number) => {
        if (score >= 95) return 'bg-green-500'
        if (score >= 85) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const getCongestionColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'low': return 'text-green-600'
            case 'medium': return 'text-yellow-600'
            case 'high': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    const truncateHash = (hash: string) => {
        return `${hash.slice(0, 8)}...${hash.slice(-6)}`
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
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Network Analytics</h1>
                                    <p className="text-indigo-100">Real-time network performance monitoring</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className="text-sm">{autoRefresh ? 'Live' : 'Paused'}</span>
                            </div>
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                            </button>
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors">
                                <Download className="w-4 h-4" />
                                <span>Export Data</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Network Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6 mb-8"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Database className="w-5 h-5 text-blue-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkMetrics.blockHeight.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Block Height</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkMetrics.blockTime}</p>
                        <p className="text-sm text-gray-600">Block Time</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Activity className="w-5 h-5 text-purple-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkMetrics.transactionCount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Transactions</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Users className="w-5 h-5 text-yellow-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkMetrics.activeValidators.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Validators</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Coins className="w-5 h-5 text-indigo-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkMetrics.totalStake}</p>
                        <p className="text-sm text-gray-600">Total Stake</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Cpu className="w-5 h-5 text-orange-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkMetrics.networkHashrate}</p>
                        <p className="text-sm text-gray-600">Hashrate</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-pink-100 rounded-lg">
                                <Database className="w-5 h-5 text-pink-600" />
                            </div>
                            <Activity className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkMetrics.avgBlockSize}</p>
                        <p className="text-sm text-gray-600">Avg Block Size</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Zap className="w-5 h-5 text-red-600" />
                            </div>
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{networkMetrics.gasPrice}</p>
                        <p className="text-sm text-gray-600">Gas Price</p>
                    </div>
                </motion.div>

                {/* Performance Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
                >
                    {/* Performance Stats */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Zap className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Transactions per Second</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">{performanceData.tps.toLocaleString()}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Clock className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Average Latency</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">{performanceData.latency}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Activity className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Network Uptime</span>
                                </div>
                                <span className="text-2xl font-bold text-green-600">{performanceData.uptime}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <BarChart3 className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Network Efficiency</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">{performanceData.efficiency}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Network className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Data Throughput</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">{performanceData.throughput}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Globe className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Network Congestion</span>
                                </div>
                                <span className={`text-2xl font-bold ${getCongestionColor(performanceData.congestion)}`}>
                                    {performanceData.congestion}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Network Health */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Network Health Score</h2>
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="2"
                                            strokeDasharray={`${networkHealth.overall}, 100`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-gray-900">{networkHealth.overall}%</span>
                                    </div>
                                </div>
                                <p className="text-lg font-medium text-gray-700">Overall Health</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: 'Consensus', score: networkHealth.consensus },
                                    { label: 'Security', score: networkHealth.security },
                                    { label: 'Decentralization', score: networkHealth.decentralization },
                                    { label: 'Performance', score: networkHealth.performance }
                                ].map((metric, index) => (
                                    <div key={metric.label} className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">{metric.label}</span>
                                            <span className={`font-bold ${getHealthColor(metric.score)}`}>
                                                {metric.score}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getHealthBg(metric.score)}`}
                                                style={{ width: `${metric.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Chart Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8"
                >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Network Activity Chart</h2>
                            <p className="text-gray-600">Real-time network metrics visualization</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {['transactions', 'blocks', 'validators', 'stake'].map((metric) => (
                                    <button
                                        key={metric}
                                        onClick={() => setSelectedMetric(metric as any)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedMetric === metric
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {(['1h', '24h', '7d', '30d'] as const).map((timeframe) => (
                                    <button
                                        key={timeframe}
                                        onClick={() => setSelectedTimeframe(timeframe)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedTimeframe === timeframe
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {timeframe}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="mt-6 h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">
                                Interactive chart showing {selectedMetric} over {selectedTimeframe} would appear here
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Blocks */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Recent Blocks</h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">{recentBlocks.length} latest blocks</span>
                                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                    View All
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Height</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Hash</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Validator</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Transactions</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Size</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Gas Used</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBlocks.map((block, index) => (
                                    <motion.tr
                                        key={block.height}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-6">
                                            <span className="font-bold text-indigo-600">#{block.height.toLocaleString()}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2">
                                                <Hash className="w-4 h-4 text-gray-400" />
                                                <span className="font-mono text-sm text-gray-700">{truncateHash(block.hash)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-medium text-gray-900">{block.validator}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-medium text-gray-900">{block.transactions}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-gray-700">{block.size}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: block.gasUsed }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600">{block.gasUsed}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm text-gray-600">{block.timestamp}</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
