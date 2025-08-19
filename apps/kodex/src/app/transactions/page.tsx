'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Activity,
    ArrowRight,
    ArrowDown,
    ArrowUp,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    Copy,
    ExternalLink,
    TrendingUp,
    Users,
    Coins,
    Cpu,
    Network,
    Hash,
    Calendar,
    DollarSign
} from 'lucide-react'

interface Transaction {
    hash: string
    type: 'transfer' | 'stake' | 'unstake' | 'contract' | 'ai_compute' | 'governance'
    from: string
    to: string
    amount: string
    fee: string
    timestamp: string
    block: number
    status: 'confirmed' | 'pending' | 'failed'
    confirmations: number
}

interface TransactionSummary {
    totalTransactions: number
    totalVolume: string
    averageFee: string
    successRate: string
    pendingCount: number
    failedCount: number
}

interface TransactionFilter {
    type: string
    status: string
    timeRange: string
    minAmount: string
    maxAmount: string
}

export default function TransactionsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)
    const [filter, setFilter] = useState<TransactionFilter>({
        type: 'all',
        status: 'all',
        timeRange: '24h',
        minAmount: '',
        maxAmount: ''
    })
    const [showFilters, setShowFilters] = useState(false)

    const transactionSummary: TransactionSummary = {
        totalTransactions: 1247892,
        totalVolume: '45.7M KODEX',
        averageFee: '0.003 KODEX',
        successRate: '99.97%',
        pendingCount: 157,
        failedCount: 23
    }

    const recentTransactions: Transaction[] = [
        {
            hash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
            type: 'ai_compute',
            from: '0x742d35Cc6...891011',
            to: '0x1234567890...abcdef',
            amount: '1,250 KODEX',
            fee: '0.005 KODEX',
            timestamp: '12s ago',
            block: 2847392,
            status: 'confirmed',
            confirmations: 15
        },
        {
            hash: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567a',
            type: 'stake',
            from: '0x567890abcd...ef1234',
            to: 'Staking Contract',
            amount: '50,000 KODEX',
            fee: '0.012 KODEX',
            timestamp: '45s ago',
            block: 2847391,
            status: 'confirmed',
            confirmations: 28
        },
        {
            hash: '0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2',
            type: 'transfer',
            from: '0xabcdef1234...567890',
            to: '0x234567890a...bcdef1',
            amount: '500 KODEX',
            fee: '0.002 KODEX',
            timestamp: '1m ago',
            block: 2847390,
            status: 'pending',
            confirmations: 0
        },
        {
            hash: '0xd4e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2c3',
            type: 'contract',
            from: '0x890abcdef1...234567',
            to: '0x456789012a...bcdef1',
            amount: '2,750 KODEX',
            fee: '0.008 KODEX',
            timestamp: '2m ago',
            block: 2847389,
            status: 'confirmed',
            confirmations: 45
        },
        {
            hash: '0xe5f6789012345678901234567890abcdef1234567890abcdef1234567ab2c3d4',
            type: 'unstake',
            from: 'Staking Contract',
            to: '0x123456789a...bcdef1',
            amount: '25,000 KODEX',
            fee: '0.006 KODEX',
            timestamp: '3m ago',
            block: 2847388,
            status: 'confirmed',
            confirmations: 62
        },
        {
            hash: '0xf6789012345678901234567890abcdef1234567890abcdef1234567ab2c3d4e5',
            type: 'governance',
            from: '0x789abcdef1...234567',
            to: 'Governance Contract',
            amount: '0 KODEX',
            fee: '0.001 KODEX',
            timestamp: '5m ago',
            block: 2847387,
            status: 'failed',
            confirmations: 0
        }
    ]

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'ai_compute': return <Cpu className="w-4 h-4 text-purple-500" />
            case 'stake': return <Coins className="w-4 h-4 text-green-500" />
            case 'unstake': return <ArrowDown className="w-4 h-4 text-orange-500" />
            case 'transfer': return <ArrowRight className="w-4 h-4 text-blue-500" />
            case 'contract': return <Network className="w-4 h-4 text-indigo-500" />
            case 'governance': return <Users className="w-4 h-4 text-pink-500" />
            default: return <Activity className="w-4 h-4 text-gray-500" />
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'ai_compute': return 'bg-purple-100 text-purple-700'
            case 'stake': return 'bg-green-100 text-green-700'
            case 'unstake': return 'bg-orange-100 text-orange-700'
            case 'transfer': return 'bg-blue-100 text-blue-700'
            case 'contract': return 'bg-indigo-100 text-indigo-700'
            case 'governance': return 'bg-pink-100 text-pink-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
            case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
            default: return <Activity className="w-4 h-4 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'failed': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const truncateAddress = (address: string) => {
        if (address.length <= 20) return address
        return `${address.slice(0, 8)}...${address.slice(-6)}`
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
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
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Transaction Explorer</h1>
                                    <p className="text-indigo-100">Browse and analyze blockchain transactions</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="px-3 py-1 bg-green-500/20 rounded-lg flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm">Live Updates</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Transaction Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Hash className="w-5 h-5 text-blue-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{transactionSummary.totalTransactions.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Transactions</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{transactionSummary.totalVolume}</p>
                        <p className="text-sm text-gray-600">Total Volume</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Coins className="w-5 h-5 text-purple-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{transactionSummary.averageFee}</p>
                        <p className="text-sm text-gray-600">Average Fee</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{transactionSummary.successRate}</p>
                        <p className="text-sm text-gray-600">Success Rate</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <Clock className="w-4 h-4 text-yellow-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{transactionSummary.pendingCount}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{transactionSummary.failedCount}</p>
                        <p className="text-sm text-gray-600">Failed</p>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
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
                                    placeholder="Search by transaction hash, address, or block number..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>
                    </div>

                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={filter.type}
                                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="transfer">Transfer</option>
                                        <option value="stake">Stake</option>
                                        <option value="unstake">Unstake</option>
                                        <option value="contract">Contract</option>
                                        <option value="ai_compute">AI Compute</option>
                                        <option value="governance">Governance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={filter.status}
                                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                                    <select
                                        value={filter.timeRange}
                                        onChange={(e) => setFilter({ ...filter, timeRange: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="1h">Last Hour</option>
                                        <option value="24h">Last 24 Hours</option>
                                        <option value="7d">Last 7 Days</option>
                                        <option value="30d">Last 30 Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                                    <input
                                        type="text"
                                        value={filter.minAmount}
                                        onChange={(e) => setFilter({ ...filter, minAmount: e.target.value })}
                                        placeholder="0 KODEX"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                                    <input
                                        type="text"
                                        value={filter.maxAmount}
                                        onChange={(e) => setFilter({ ...filter, maxAmount: e.target.value })}
                                        placeholder="∞ KODEX"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">{recentTransactions.length} transactions</span>
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
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Hash</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Type</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">From</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">To</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Amount</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Fee</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Time</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Block</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((tx, index) => (
                                    <motion.tr
                                        key={tx.hash}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedTransaction(tx.hash)}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2">
                                                <Hash className="w-4 h-4 text-gray-400" />
                                                <span className="font-mono text-sm text-indigo-600 hover:text-indigo-700">
                                                    {truncateAddress(tx.hash)}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        copyToClipboard(tx.hash)
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(tx.type)}`}>
                                                {getTypeIcon(tx.type)}
                                                <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-mono text-sm text-gray-700">{truncateAddress(tx.from)}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-mono text-sm text-gray-700">{truncateAddress(tx.to)}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-medium text-gray-900">{tx.amount}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-gray-600">{tx.fee}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                                                {getStatusIcon(tx.status)}
                                                <span className="capitalize">{tx.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm text-gray-600">{tx.timestamp}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-indigo-600 font-medium">#{tx.block.toLocaleString()}</span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Transaction Details Modal Placeholder */}
                {selectedTransaction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedTransaction(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Hash:</span>
                                        <p className="font-mono text-indigo-600">{selectedTransaction}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <p className="font-medium">Confirmed</p>
                                    </div>
                                </div>
                                <div className="text-center py-8 text-gray-500">
                                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>Detailed transaction information would appear here</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
