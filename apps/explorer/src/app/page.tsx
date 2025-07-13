'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    TrendingUp,
    Activity,
    Blocks,
    Users,
    Zap,
    Eye,
    Database,
    Clock,
    Hash,
    ArrowUpRight,
    ArrowDownLeft,
    Cpu,
    Globe,
    Shield
} from 'lucide-react'

export default function BlockchainExplorerPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('blocks')

    const blockchainStats = [
        { label: 'Total Blocks', value: '18,245,892', change: '+142 today', icon: Blocks, color: 'text-blue-400' },
        { label: 'Active Nodes', value: '15,847', change: '+23 nodes', icon: Globe, color: 'text-green-400' },
        { label: 'Hash Rate', value: '247.8 TH/s', change: '+2.3% today', icon: Cpu, color: 'text-yellow-400' },
        { label: 'Total Transactions', value: '2.1B', change: '+847K today', icon: Activity, color: 'text-purple-400' },
    ]

    const recentBlocks = [
        { height: 18245892, hash: '0x1a2b3c...def456', txCount: 234, miner: '0xabc123...789def', time: '12s ago', size: '1.2 MB' },
        { height: 18245891, hash: '0x2b3c4d...ef5678', txCount: 187, miner: '0xbcd234...89aef0', time: '24s ago', size: '0.9 MB' },
        { height: 18245890, hash: '0x3c4d5e...f67890', txCount: 312, miner: '0xcde345...9abf01', time: '36s ago', size: '1.4 MB' },
        { height: 18245889, hash: '0x4d5e6f...678901', txCount: 156, miner: '0xdef456...abcd02', time: '48s ago', size: '0.7 MB' },
        { height: 18245888, hash: '0x5e6f70...789012', txCount: 278, miner: '0xef0567...bcde03', time: '1m ago', size: '1.1 MB' },
    ]

    const recentTransactions = [
        { hash: '0xa1b2c3...d4e5f6', from: '0x123abc...789def', to: '0x456def...abc123', value: '15.7 ETH', status: 'success', time: '5s ago' },
        { hash: '0xb2c3d4...e5f6g7', from: '0x234bcd...89aef0', to: '0x567ef0...bcd234', value: '0.5 ETH', status: 'success', time: '18s ago' },
        { hash: '0xc3d4e5...f6g7h8', from: '0x345cde...9abf01', to: '0x678f01...cde345', value: '42.3 ETH', status: 'pending', time: '25s ago' },
        { hash: '0xd4e5f6...g7h8i9', from: '0x456def...abcd02', to: '0x789012...def456', value: '2.1 ETH', status: 'success', time: '32s ago' },
        { hash: '0xe5f6g7...h8i9j0', from: '0x567ef0...bcde03', to: '0x89a123...ef0567', value: '8.9 ETH', status: 'failed', time: '44s ago' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/20 backdrop-blur-md border-b border-white/10"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <Blocks className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Explorer</h1>
                                <p className="text-sm text-gray-300">AI Blockchain Explorer</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by address, hash, or block..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-96 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Blockchain Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {blockchainStats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
                                    {stat.change}
                                </span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-sm text-gray-300">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8"
                >
                    <div className="flex space-x-4 mb-6">
                        <button
                            onClick={() => setActiveTab('blocks')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'blocks'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            Recent Blocks
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'transactions'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            Recent Transactions
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'analytics'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            AI Analytics
                        </button>
                    </div>

                    {/* Blocks Tab */}
                    {activeTab === 'blocks' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-400 border-b border-white/10 pb-2">
                                <span>Block</span>
                                <span className="col-span-2">Hash</span>
                                <span>Transactions</span>
                                <span className="col-span-2">Miner</span>
                                <span>Time</span>
                                <span>Size</span>
                            </div>
                            {recentBlocks.map((block, index) => (
                                <motion.div
                                    key={block.height}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="grid grid-cols-8 gap-4 items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <span className="text-blue-400 font-medium">{block.height.toLocaleString()}</span>
                                    <span className="col-span-2 text-gray-300 font-mono text-sm">{block.hash}</span>
                                    <span className="text-white">{block.txCount}</span>
                                    <span className="col-span-2 text-gray-300 font-mono text-sm">{block.miner}</span>
                                    <span className="text-gray-400">{block.time}</span>
                                    <span className="text-gray-300">{block.size}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === 'transactions' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-400 border-b border-white/10 pb-2">
                                <span className="col-span-2">Hash</span>
                                <span>From</span>
                                <span>To</span>
                                <span>Value</span>
                                <span>Status</span>
                                <span>Time</span>
                            </div>
                            {recentTransactions.map((tx, index) => (
                                <motion.div
                                    key={tx.hash}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="grid grid-cols-7 gap-4 items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <span className="col-span-2 text-blue-400 font-mono text-sm">{tx.hash}</span>
                                    <span className="text-gray-300 font-mono text-sm">{tx.from}</span>
                                    <span className="text-gray-300 font-mono text-sm">{tx.to}</span>
                                    <span className="text-white font-medium">{tx.value}</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'success' ? 'bg-green-400/20 text-green-400' :
                                            tx.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                                                'bg-red-400/20 text-red-400'
                                        }`}>
                                        {tx.status}
                                    </span>
                                    <span className="text-gray-400">{tx.time}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            <div className="bg-white/5 rounded-xl p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <TrendingUp className="w-6 h-6 text-green-400" />
                                    <h3 className="text-lg font-semibold text-white">Network Growth</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Daily Transactions</span>
                                        <span className="text-green-400">+12.5%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Active Addresses</span>
                                        <span className="text-green-400">+8.3%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Network Hash Rate</span>
                                        <span className="text-green-400">+4.7%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Shield className="w-6 h-6 text-blue-400" />
                                    <h3 className="text-lg font-semibold text-white">Security Metrics</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Network Security</span>
                                        <span className="text-blue-400">99.8%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Block Confirmation</span>
                                        <span className="text-blue-400">12.3s avg</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Failed Transactions</span>
                                        <span className="text-red-400">0.2%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 bg-white/5 rounded-xl p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Zap className="w-6 h-6 text-yellow-400" />
                                    <h3 className="text-lg font-semibold text-white">AI Predictions</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4">
                                        <p className="text-sm text-gray-300 mb-2">Network Load</p>
                                        <p className="text-white font-semibold">Moderate (↑5%)</p>
                                        <p className="text-xs text-gray-400 mt-1">Next hour prediction</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4">
                                        <p className="text-sm text-gray-300 mb-2">Gas Price</p>
                                        <p className="text-white font-semibold">25 Gwei (↓8%)</p>
                                        <p className="text-xs text-gray-400 mt-1">Optimal for transactions</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-4">
                                        <p className="text-sm text-gray-300 mb-2">Block Time</p>
                                        <p className="text-white font-semibold">12.1s (stable)</p>
                                        <p className="text-xs text-gray-400 mt-1">Within normal range</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Real-time Network Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Network Status</h2>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 text-sm">Live</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Real-time Monitoring</h3>
                            <p className="text-gray-300 text-sm">24/7 blockchain network monitoring with AI-powered anomaly detection</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Database className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Data Analytics</h3>
                            <p className="text-gray-300 text-sm">Advanced analytics and insights for blockchain transaction patterns</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Eye className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Smart Alerts</h3>
                            <p className="text-gray-300 text-sm">Intelligent notifications for important network events and changes</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
