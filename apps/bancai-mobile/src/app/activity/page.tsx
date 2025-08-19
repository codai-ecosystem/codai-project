'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Activity,
    ArrowLeft,
    Calendar,
    Filter,
    Search,
    Download,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Smartphone,
    TrendingUp,
    Clock,
    ChevronRight,
    Star,
    DollarSign,
    Zap,
    FileText
} from 'lucide-react'

interface Transaction {
    id: string
    type: 'income' | 'expense' | 'transfer' | 'payment'
    description: string
    amount: number
    date: string
    time: string
    category: string
    merchant: string
    account: string
    status: 'completed' | 'pending' | 'failed'
    paymentMethod: string
    location?: string
    reference?: string
}

interface ActivityFilter {
    timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year'
    type: 'all' | 'income' | 'expense' | 'transfer' | 'payment'
    category: string
    amount: { min: number; max: number }
}

export default function ActivityPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState<ActivityFilter>({
        timeRange: 'month',
        type: 'all',
        category: 'all',
        amount: { min: 0, max: 10000 }
    })

    const [transactions] = useState<Transaction[]>([
        {
            id: '1',
            type: 'expense',
            description: 'Starbucks Coffee',
            amount: -5.47,
            date: 'Today',
            time: '2:34 PM',
            category: 'Food & Dining',
            merchant: 'Starbucks Store #1234',
            account: 'BancAI Rewards Card',
            status: 'completed',
            paymentMethod: 'Credit Card',
            location: 'Downtown Seattle'
        },
        {
            id: '2',
            type: 'income',
            description: 'Direct Deposit - Salary',
            amount: 3200.00,
            date: 'Yesterday',
            time: '9:00 AM',
            category: 'Income',
            merchant: 'TechCorp Inc.',
            account: 'Primary Checking',
            status: 'completed',
            paymentMethod: 'ACH Transfer',
            reference: 'PAY-2024-001234'
        },
        {
            id: '3',
            type: 'expense',
            description: 'Amazon Purchase',
            amount: -89.99,
            date: 'Yesterday',
            time: '3:45 PM',
            category: 'Shopping',
            merchant: 'Amazon.com',
            account: 'BancAI Debit Card',
            status: 'completed',
            paymentMethod: 'Debit Card',
            reference: 'AMZ-789123456'
        },
        {
            id: '4',
            type: 'transfer',
            description: 'Transfer to Savings',
            amount: -500.00,
            date: '2 days ago',
            time: '11:15 AM',
            category: 'Transfer',
            merchant: 'Internal Transfer',
            account: 'Primary Checking → High-Yield Savings',
            status: 'completed',
            paymentMethod: 'Internal',
            reference: 'TXN-987654321'
        },
        {
            id: '5',
            type: 'payment',
            description: 'Electric Bill Payment',
            amount: -127.45,
            date: '3 days ago',
            time: '8:30 AM',
            category: 'Utilities',
            merchant: 'City Power Company',
            account: 'Primary Checking',
            status: 'completed',
            paymentMethod: 'Online Banking',
            reference: 'ELEC-2024-03-15'
        },
        {
            id: '6',
            type: 'expense',
            description: 'Gas Station',
            amount: -45.67,
            date: '4 days ago',
            time: '7:22 AM',
            category: 'Transportation',
            merchant: 'Shell Gas Station',
            account: 'BancAI Debit Card',
            status: 'completed',
            paymentMethod: 'Debit Card',
            location: 'Highway 101'
        },
        {
            id: '7',
            type: 'expense',
            description: 'Grocery Shopping',
            amount: -156.78,
            date: '5 days ago',
            time: '6:15 PM',
            category: 'Groceries',
            merchant: 'Whole Foods Market',
            account: 'BancAI Rewards Card',
            status: 'completed',
            paymentMethod: 'Credit Card',
            location: 'Capitol Hill'
        },
        {
            id: '8',
            type: 'income',
            description: 'Freelance Payment',
            amount: 750.00,
            date: '1 week ago',
            time: '2:00 PM',
            category: 'Income',
            merchant: 'Client XYZ',
            account: 'Primary Checking',
            status: 'completed',
            paymentMethod: 'Wire Transfer',
            reference: 'WIRE-456789123'
        }
    ])

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'income': return <ArrowDownLeft className="w-5 h-5 text-green-600" />
            case 'expense': return <ArrowUpRight className="w-5 h-5 text-red-600" />
            case 'transfer': return <Activity className="w-5 h-5 text-blue-600" />
            case 'payment': return <CreditCard className="w-5 h-5 text-purple-600" />
            default: return <DollarSign className="w-5 h-5 text-gray-600" />
        }
    }

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'income': return 'text-green-600'
            case 'expense': return 'text-red-600'
            case 'transfer': return 'text-blue-600'
            case 'payment': return 'text-purple-600'
            default: return 'text-gray-600'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100'
            case 'pending': return 'text-yellow-600 bg-yellow-100'
            case 'failed': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'food & dining': return '🍽️'
            case 'shopping': return '🛍️'
            case 'transportation': return '🚗'
            case 'utilities': return '⚡'
            case 'groceries': return '🛒'
            case 'income': return '💰'
            case 'transfer': return '🔄'
            default: return '💳'
        }
    }

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.category.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesType = selectedFilter.type === 'all' || transaction.type === selectedFilter.type

        return matchesSearch && matchesType
    })

    const totalSpent = transactions
        .filter(t => t.type === 'expense' && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalIncome = transactions
        .filter(t => t.type === 'income' && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 pb-20">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white py-4 px-4 shadow-xl"
            >
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                        <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold">Activity</h1>
                            <p className="text-green-100 text-sm">Transaction history & insights</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xs text-green-100">This Month</div>
                        <div className="text-lg font-bold">${totalSpent.toFixed(0)}</div>
                        <div className="text-xs text-green-100">Spent</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xs text-green-100">This Month</div>
                        <div className="text-lg font-bold">${totalIncome.toFixed(0)}</div>
                        <div className="text-xs text-green-100">Earned</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xs text-green-100">Transactions</div>
                        <div className="text-lg font-bold">{transactions.length}</div>
                        <div className="text-xs text-green-100">Total</div>
                    </div>
                </div>
            </motion.header>

            <div className="px-4 py-6">
                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-lg"
                        />
                    </div>
                </motion.div>

                {/* Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
                        <div className="flex space-x-1">
                            {[
                                { id: 'all', label: 'All', count: transactions.length },
                                { id: 'expense', label: 'Expenses', count: transactions.filter(t => t.type === 'expense').length },
                                { id: 'income', label: 'Income', count: transactions.filter(t => t.type === 'income').length },
                                { id: 'transfer', label: 'Transfers', count: transactions.filter(t => t.type === 'transfer').length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedFilter({ ...selectedFilter, type: tab.id as any })}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedFilter.type === tab.id
                                            ? 'bg-green-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    {tab.label}
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${selectedFilter.type === tab.id
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Transactions List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                >
                    {filteredTransactions.map((transaction, index) => (
                        <motion.div
                            key={transaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' :
                                            transaction.type === 'expense' ? 'bg-red-100' :
                                                transaction.type === 'transfer' ? 'bg-blue-100' : 'bg-purple-100'
                                        }`}>
                                        {getTransactionIcon(transaction.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
                                            <span className="font-medium text-gray-900">{transaction.description}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">{transaction.merchant}</div>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                            <div className="flex items-center space-x-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{transaction.date} • {transaction.time}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500">{transaction.account}</div>
                                </div>
                            </div>

                            {/* Transaction Details (Expandable) */}
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-3 pt-3 border-t border-gray-100"
                            >
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-500">Payment Method</div>
                                        <div className="font-medium">{transaction.paymentMethod}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Category</div>
                                        <div className="font-medium">{transaction.category}</div>
                                    </div>
                                    {transaction.location && (
                                        <div>
                                            <div className="text-gray-500">Location</div>
                                            <div className="font-medium">{transaction.location}</div>
                                        </div>
                                    )}
                                    {transaction.reference && (
                                        <div>
                                            <div className="text-gray-500">Reference</div>
                                            <div className="font-medium font-mono text-xs">{transaction.reference}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center mt-3">
                                    <button className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                                        <FileText className="w-4 h-4" />
                                        <span>View Receipt</span>
                                    </button>
                                    <button className="flex items-center space-x-1 text-gray-600 text-sm">
                                        <span>More Details</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Load More */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 text-center"
                >
                    <button className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg text-green-600 font-medium hover:bg-green-50 transition-colors">
                        Load More Transactions
                    </button>
                </motion.div>

                {/* Insights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 space-y-4"
                >
                    <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>

                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">Spending Analysis</div>
                                <div className="text-sm text-green-100">You spent 12% less on dining this month!</div>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">Savings Opportunity</div>
                                <div className="text-sm text-blue-100">Consider switching to our high-yield savings</div>
                            </div>
                            <Star className="w-8 h-8 text-blue-200" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
