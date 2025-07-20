'use client'

import { useEffect, useState } from 'react'
import { useBancaiStore } from '../store/bancai'
import { motion } from 'framer-motion'
import {
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    Plus,
    Eye,
    EyeOff,
    Settings,
    Bell,
    Search,
    Filter
} from 'lucide-react'

export default function BankingDashboard() {
    const {
        accounts,
        transactions,
        insights,
        isLoading,
        error,
        fetchAccounts,
        fetchTransactions,
        fetchInsights,
        getTotalBalance,
        getTransactionsByAccount
    } = useBancaiStore()

    const [showBalances, setShowBalances] = useState(true)
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

    useEffect(() => {
        // Initialize dashboard data
        fetchAccounts()
        fetchInsights('user_1') // Mock user ID

        // Fetch transactions for all accounts
        accounts.forEach(account => {
            fetchTransactions(account.id)
        })
    }, [])

    const totalBalance = getTotalBalance()

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const getAccountTypeIcon = (type: string) => {
        switch (type) {
            case 'checking': return '🏦'
            case 'savings': return '💰'
            case 'credit': return '💳'
            case 'investment': return '📈'
            default: return '🏦'
        }
    }

    const getTransactionIcon = (type: string) => {
        return type === 'credit' ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
        ) : (
            <ArrowDownLeft className="w-4 h-4 text-red-500" />
        )
    }

    if (isLoading && accounts.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Loading your banking dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Banking Dashboard</h1>
                        <p className="text-slate-300">Welcome back to your financial overview</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="glass-card p-3 hover:bg-white/20 transition-all">
                            <Search className="w-5 h-5 text-white" />
                        </button>
                        <button className="glass-card p-3 hover:bg-white/20 transition-all">
                            <Bell className="w-5 h-5 text-white" />
                        </button>
                        <button className="glass-card p-3 hover:bg-white/20 transition-all">
                            <Settings className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Total Balance Card */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <h2 className="text-lg text-slate-300">Total Balance</h2>
                                <button
                                    onClick={() => setShowBalances(!showBalances)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="text-4xl font-bold text-white">
                                {showBalances ? formatCurrency(totalBalance) : '••••••'}
                            </div>
                            <p className="text-emerald-400 text-sm mt-1">
                                +2.5% from last month
                            </p>
                        </div>
                        <div className="text-6xl opacity-20">💰</div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Accounts Section */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Your Accounts</h2>
                            <button className="flex items-center space-x-2 glass-card px-4 py-2 hover:bg-white/20 transition-all">
                                <Plus className="w-4 h-4" />
                                <span>Add Account</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {accounts.map((account, index) => (
                                <motion.div
                                    key={account.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="glass-card p-6 hover:bg-white/10 transition-all cursor-pointer"
                                    onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-2xl">{getAccountTypeIcon(account.type)}</div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{account.accountName}</h3>
                                                <p className="text-slate-400 text-sm">
                                                    {account.type.charAt(0).toUpperCase() + account.type.slice(1)} • {account.accountNumber}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-white">
                                                {showBalances ? formatCurrency(account.balance) : '••••••'}
                                            </div>
                                            <div className={`text-sm ${account.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                {account.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Account Details */}
                                    {selectedAccount === account.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-6 pt-6 border-t border-white/10"
                                        >
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-slate-400 text-sm">Available Balance</p>
                                                    <p className="text-white font-semibold">{formatCurrency(account.balance)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 text-sm">Account Type</p>
                                                    <p className="text-white font-semibold capitalize">{account.type}</p>
                                                </div>
                                            </div>

                                            <h4 className="text-white font-semibold mb-3">Recent Transactions</h4>
                                            <div className="space-y-2">
                                                {getTransactionsByAccount(account.id).slice(0, 3).map((transaction) => (
                                                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            {getTransactionIcon(transaction.type)}
                                                            <div>
                                                                <p className="text-white text-sm">{transaction.description}</p>
                                                                <p className="text-slate-400 text-xs">{transaction.category}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`font-semibold ${transaction.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                            </p>
                                                            <p className="text-slate-400 text-xs">
                                                                {transaction.date.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex space-x-3 mt-4">
                                                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors">
                                                    Transfer
                                                </button>
                                                <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors">
                                                    View Details
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar - Insights & Quick Actions */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="glass-card p-4 hover:bg-white/20 transition-all text-center">
                                <ArrowUpRight className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                <p className="text-white text-sm">Transfer</p>
                            </button>
                            <button className="glass-card p-4 hover:bg-white/20 transition-all text-center">
                                <CreditCard className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                <p className="text-white text-sm">Pay Bills</p>
                            </button>
                            <button className="glass-card p-4 hover:bg-white/20 transition-all text-center">
                                <Plus className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                <p className="text-white text-sm">Deposit</p>
                            </button>
                            <button className="glass-card p-4 hover:bg-white/20 transition-all text-center">
                                <TrendingUp className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                                <p className="text-white text-sm">Invest</p>
                            </button>
                        </div>
                    </motion.div>

                    {/* Financial Insights */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">AI Insights</h3>
                        <div className="space-y-3">
                            {insights.map((insight, index) => (
                                <div key={insight.id} className="glass-card p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${insight.impact === 'high' ? 'bg-red-500' :
                                                insight.impact === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                                            }`} />
                                        <div className="flex-1">
                                            <h4 className="text-white font-medium text-sm">{insight.title}</h4>
                                            <p className="text-slate-300 text-xs mt-1">{insight.description}</p>
                                            {insight.actionable && (
                                                <button className="text-indigo-400 text-xs mt-2 hover:text-indigo-300">
                                                    Take Action →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            {transactions.slice(0, 5).map((transaction) => (
                                <div key={transaction.id} className="glass-card p-3">
                                    <div className="flex items-center space-x-3">
                                        {getTransactionIcon(transaction.type)}
                                        <div className="flex-1">
                                            <p className="text-white text-sm">{transaction.description}</p>
                                            <p className="text-slate-400 text-xs">{transaction.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold ${transaction.type === 'credit' ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-4 right-4 glass-card p-4 bg-red-500/20 border border-red-500/30"
                >
                    <p className="text-red-300">{error}</p>
                </motion.div>
            )}
        </div>
    )
}
