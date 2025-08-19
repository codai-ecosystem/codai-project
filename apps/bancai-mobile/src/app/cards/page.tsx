'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard,
    Plus,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Settings,
    ArrowLeft,
    MoreVertical,
    Wallet,
    Star,
    Zap,
    Shield,
    TrendingUp,
    Clock,
    DollarSign,
    User
} from 'lucide-react'

interface Card {
    id: string
    name: string
    type: 'debit' | 'credit' | 'prepaid'
    number: string
    balance: number
    creditLimit?: number
    expiryDate: string
    status: 'active' | 'locked' | 'pending'
    color: string
    rewards: number
    lastUsed: string
}

interface CardTransaction {
    id: string
    description: string
    amount: number
    date: string
    merchant: string
    category: string
}

export default function CardsPage() {
    const [showCardNumbers, setShowCardNumbers] = useState(false)
    const [selectedCard, setSelectedCard] = useState<string | null>(null)

    const [cards] = useState<Card[]>([
        {
            id: '1',
            name: 'BancAI Rewards Card',
            type: 'credit',
            number: '4532 1234 5678 9012',
            balance: 2847.65,
            creditLimit: 15000,
            expiryDate: '12/27',
            status: 'active',
            color: 'from-purple-500 to-indigo-600',
            rewards: 12847,
            lastUsed: '2 hours ago'
        },
        {
            id: '2',
            name: 'BancAI Debit Card',
            type: 'debit',
            number: '4532 9876 5432 1098',
            balance: 6901.32,
            expiryDate: '08/26',
            status: 'active',
            color: 'from-green-500 to-emerald-600',
            rewards: 3456,
            lastUsed: '1 day ago'
        },
        {
            id: '3',
            name: 'BancAI Travel Card',
            type: 'prepaid',
            number: '4532 1111 2222 3333',
            balance: 1250.00,
            expiryDate: '03/25',
            status: 'active',
            color: 'from-blue-500 to-cyan-600',
            rewards: 890,
            lastUsed: '1 week ago'
        }
    ])

    const [recentTransactions] = useState<CardTransaction[]>([
        {
            id: '1',
            description: 'Starbucks Coffee',
            amount: -5.47,
            date: '2 hours ago',
            merchant: 'Starbucks Store #1234',
            category: 'Food & Dining'
        },
        {
            id: '2',
            description: 'Amazon Purchase',
            amount: -89.99,
            date: 'Yesterday',
            merchant: 'Amazon.com',
            category: 'Shopping'
        },
        {
            id: '3',
            description: 'Gas Station',
            amount: -45.67,
            date: '2 days ago',
            merchant: 'Shell Gas Station',
            category: 'Transportation'
        }
    ])

    const getCardIcon = (type: string) => {
        switch (type) {
            case 'credit': return <CreditCard className="w-5 h-5" />
            case 'debit': return <Wallet className="w-5 h-5" />
            case 'prepaid': return <DollarSign className="w-5 h-5" />
            default: return <CreditCard className="w-5 h-5" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100'
            case 'locked': return 'text-red-600 bg-red-100'
            case 'pending': return 'text-yellow-600 bg-yellow-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const formatCardNumber = (number: string) => {
        if (!showCardNumbers) {
            return '**** **** **** ' + number.slice(-4)
        }
        return number
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 pb-20">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white py-4 px-4 shadow-xl"
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold">My Cards</h1>
                            <p className="text-green-100 text-sm">Manage your payment cards</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowCardNumbers(!showCardNumbers)}
                            className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
                        >
                            {showCardNumbers ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.header>

            <div className="px-4 py-6">
                {/* Cards List */}
                <div className="space-y-4 mb-6">
                    {cards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Card Design */}
                            <div className={`bg-gradient-to-r ${card.color} rounded-2xl p-6 text-white shadow-2xl`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center space-x-2">
                                        {getCardIcon(card.type)}
                                        <span className="text-sm font-medium opacity-90">{card.type.toUpperCase()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${card.status === 'active' ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-200'
                                            }`}>
                                            {card.status}
                                        </span>
                                        <button className="p-1 bg-white/20 rounded-full">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="text-xl font-mono tracking-wider mb-2">
                                        {formatCardNumber(card.number)}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm opacity-90">
                                            <div>Valid Thru</div>
                                            <div className="font-medium">{card.expiryDate}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs opacity-75">Balance</div>
                                            <div className="text-lg font-bold">
                                                ${card.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-sm">
                                        <div className="opacity-75">Cardholder</div>
                                        <div className="font-medium">{card.name}</div>
                                    </div>
                                    {card.type === 'credit' && (
                                        <div className="text-right text-sm">
                                            <div className="opacity-75">Credit Limit</div>
                                            <div className="font-medium">${card.creditLimit?.toLocaleString()}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (index * 0.1) + 0.2 }}
                                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 -mt-4 mx-2 shadow-lg"
                            >
                                <div className="grid grid-cols-4 gap-4">
                                    <button className="flex flex-col items-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                                        <Lock className="w-5 h-5 text-blue-600 mb-1" />
                                        <span className="text-xs font-medium text-blue-700">Lock</span>
                                    </button>
                                    <button className="flex flex-col items-center p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                                        <Star className="w-5 h-5 text-green-600 mb-1" />
                                        <span className="text-xs font-medium text-green-700">Rewards</span>
                                    </button>
                                    <button className="flex flex-col items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                                        <TrendingUp className="w-5 h-5 text-purple-600 mb-1" />
                                        <span className="text-xs font-medium text-purple-700">Spending</span>
                                    </button>
                                    <button className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <Settings className="w-5 h-5 text-gray-600 mb-1" />
                                        <span className="text-xs font-medium text-gray-700">Settings</span>
                                    </button>
                                </div>

                                <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>Last used {card.lastUsed}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span>{card.rewards} points</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Card Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Card Activity</h3>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
                        {recentTransactions.map((transaction, index) => (
                            <div key={transaction.id} className={`p-4 ${index !== recentTransactions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-red-100 rounded-full">
                                            <CreditCard className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{transaction.description}</div>
                                            <div className="text-sm text-gray-600">{transaction.merchant}</div>
                                            <div className="text-xs text-gray-500">{transaction.date}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-red-600">
                                            ${Math.abs(transaction.amount).toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-500">{transaction.category}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Card Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                >
                    <h3 className="text-lg font-semibold text-gray-900">Card Benefits</h3>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">Cashback Rewards</div>
                                    <div className="text-sm text-purple-100">Earn 2% on all purchases</div>
                                </div>
                                <Star className="w-8 h-8 text-purple-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">Fraud Protection</div>
                                    <div className="text-sm text-green-100">24/7 AI-powered security monitoring</div>
                                </div>
                                <Shield className="w-8 h-8 text-green-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">Travel Benefits</div>
                                    <div className="text-sm text-blue-100">No foreign transaction fees</div>
                                </div>
                                <Zap className="w-8 h-8 text-blue-200" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Add New Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6"
                >
                    <button className="w-full bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-dashed border-green-300 hover:border-green-400 transition-colors">
                        <div className="flex flex-col items-center text-green-600">
                            <Plus className="w-8 h-8 mb-2" />
                            <div className="font-semibold">Add New Card</div>
                            <div className="text-sm text-green-500">Apply for a new BancAI card</div>
                        </div>
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
