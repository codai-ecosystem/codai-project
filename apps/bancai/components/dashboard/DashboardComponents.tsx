// 🏦 BancAI Dashboard Components
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Eye,
    EyeOff,
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    CreditCard,
    Building2,
    DollarSign
} from 'lucide-react'

// ==================== BALANCE OVERVIEW COMPONENT ====================

interface BalanceOverviewProps {
    totalBalance: number
    currency: string
    showBalance: boolean
    onToggleBalance: () => void
    monthlyChange: number
}

export const BalanceOverview: React.FC<BalanceOverviewProps> = ({
    totalBalance,
    currency,
    showBalance,
    onToggleBalance,
    monthlyChange
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Total Balance</h3>
                <button
                    onClick={onToggleBalance}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                    {showBalance ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
                </button>
            </div>

            <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">
                    {showBalance ? `${totalBalance.toLocaleString('ro-RO')} ${currency}` : '••••••••'}
                </div>
                <div className="flex items-center justify-center space-x-2 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>+{monthlyChange}% this month</span>
                </div>
            </div>
        </motion.div>
    )
}

// ==================== QUICK ACTIONS COMPONENT ====================

interface QuickAction {
    href: string
    icon: React.ReactNode
    title: string
    description: string
    color: string
}

export const QuickActions: React.FC = () => {
    const actions: QuickAction[] = [
        {
            href: '/transfer',
            icon: <ArrowUpRight className="w-8 h-8" />,
            title: 'Send Money',
            description: 'Transfer funds',
            color: 'text-blue-400'
        },
        {
            href: '/receive',
            icon: <ArrowDownLeft className="w-8 h-8" />,
            title: 'Receive',
            description: 'Request payment',
            color: 'text-emerald-400'
        },
        {
            href: '/cards',
            icon: <CreditCard className="w-8 h-8" />,
            title: 'Cards',
            description: 'Manage cards',
            color: 'text-purple-400'
        },
        {
            href: '/investments',
            icon: <TrendingUp className="w-8 h-8" />,
            title: 'Invest',
            description: 'Grow wealth',
            color: 'text-yellow-400'
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
            {actions.map((action, index) => (
                <a
                    key={action.href}
                    href={action.href}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all group"
                >
                    <div className={`${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                        {action.icon}
                    </div>
                    <h4 className="text-white font-semibold">{action.title}</h4>
                    <p className="text-blue-200 text-sm">{action.description}</p>
                </a>
            ))}
        </motion.div>
    )
}

// ==================== ACCOUNT CARD COMPONENT ====================

interface Account {
    id: string
    type: string
    name: string
    balance: number
    currency: string
    iban: string
    status: string
}

interface AccountCardProps {
    account: Account
    showBalance: boolean
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, showBalance }) => {
    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'checking': return <Wallet className="w-5 h-5 text-white" />
            case 'savings': return <Building2 className="w-5 h-5 text-white" />
            case 'business': return <CreditCard className="w-5 h-5 text-white" />
            default: return <DollarSign className="w-5 h-5 text-white" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/20 text-emerald-400'
            case 'blocked': return 'bg-red-500/20 text-red-400'
            case 'pending': return 'bg-yellow-500/20 text-yellow-400'
            default: return 'bg-gray-500/20 text-gray-400'
        }
    }

    return (
        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    {getAccountIcon(account.type)}
                </div>
                <div>
                    <h4 className="text-white font-medium">{account.name}</h4>
                    <p className="text-blue-200 text-sm">{account.iban.slice(-8)}</p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-white font-semibold">
                    {showBalance ? `${account.balance.toLocaleString('ro-RO')} ${account.currency}` : '••••••'}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(account.status)}`}>
                    {account.status}
                </div>
            </div>
        </div>
    )
}

// ==================== TRANSACTION ITEM COMPONENT ====================

interface Transaction {
    id: string
    type: 'debit' | 'credit'
    amount: number
    description: string
    merchant: string
    date: string
    status: 'completed' | 'pending' | 'failed'
    category: string
}

interface TransactionItemProps {
    transaction: Transaction
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/20 text-emerald-400'
            case 'pending': return 'bg-yellow-500/20 text-yellow-400'
            case 'failed': return 'bg-red-500/20 text-red-400'
            default: return 'bg-gray-500/20 text-gray-400'
        }
    }

    return (
        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'credit' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                    }`}>
                    {transaction.type === 'credit' ? (
                        <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                    )}
                </div>
                <div>
                    <h4 className="text-white font-medium">{transaction.description}</h4>
                    <p className="text-blue-200 text-sm">{transaction.merchant} • {transaction.date}</p>
                </div>
            </div>
            <div className="text-right">
                <div className={`font-semibold ${transaction.type === 'credit' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toLocaleString('ro-RO')} RON
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                </div>
            </div>
        </div>
    )
}

// ==================== FINANCIAL INSIGHTS COMPONENT ====================

export const FinancialInsights: React.FC = () => {
    const insights = [
        {
            icon: <DollarSign className="w-8 h-8 text-white" />,
            title: 'Monthly Spending',
            description: '15% below budget',
            color: 'from-blue-500 to-emerald-500'
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-white" />,
            title: 'Savings Goal',
            description: '67% completed',
            color: 'from-emerald-500 to-blue-500'
        },
        {
            icon: <Building2 className="w-8 h-8 text-white" />,
            title: 'Security Score',
            description: 'Excellent (95/100)',
            color: 'from-purple-500 to-blue-500'
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
            <h3 className="text-xl font-semibold text-white mb-6">Financial Insights</h3>
            <div className="grid md:grid-cols-3 gap-6">
                {insights.map((insight, index) => (
                    <div key={index} className="text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${insight.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                            {insight.icon}
                        </div>
                        <h4 className="text-white font-semibold">{insight.title}</h4>
                        <p className="text-blue-200">{insight.description}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
