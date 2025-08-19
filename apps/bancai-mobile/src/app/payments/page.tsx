'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    CreditCard,
    Zap,
    Smartphone,
    Calendar,
    Search,
    Plus,
    History,
    Star,
    Bell,
    Settings,
    Home,
    Wallet,
    Activity,
    TrendingUp,
    Menu,
    ChevronRight,
    ChevronDown,
    Eye,
    EyeOff,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    DollarSign,
    Shield,
    Wifi,
    Phone,
    Car,
    Home as HomeIcon,
    Droplets,
    Building,
    Gamepad2,
    Tv,
    Music,
    Book,
    Heart,
    Filter,
    SortDesc,
    RefreshCw,
    FileText,
    Receipt,
    MapPin,
    User,
    Building2,
    Globe,
    Banknote,
    QrCode,
    Scan,
    ContactIcon,
    Send
} from 'lucide-react'

// TypeScript interfaces for payment management
interface PaymentMethod {
    id: string
    type: 'card' | 'bank' | 'digital_wallet' | 'mobile_payment'
    name: string
    last4?: string
    bankName?: string
    expiryDate?: string
    isDefault: boolean
    isVerified: boolean
    brand?: string
    balance?: number
    nickname?: string
}

interface Payee {
    id: string
    name: string
    category: string
    accountNumber?: string
    routingNumber?: string
    address?: string
    phone?: string
    website?: string
    logoUrl?: string
    isFavorite: boolean
    isVerified: boolean
    lastPayment?: string
    totalPaid?: number
    autopayEnabled?: boolean
    nextDueDate?: string
    averageAmount?: number
    nickname?: string
}

interface Payment {
    id: string
    payeeId: string
    payeeName: string
    amount: number
    currency: string
    status: 'completed' | 'pending' | 'scheduled' | 'failed' | 'cancelled'
    date: string
    scheduledDate?: string
    paymentMethod: string
    confirmationNumber: string
    reference?: string
    category: string
    isRecurring?: boolean
    frequency?: string
    nextPayment?: string
    fees?: number
    description?: string
}

interface BillReminder {
    id: string
    payeeName: string
    amount: number
    dueDate: string
    category: string
    isOverdue: boolean
    daysTillDue: number
    isAutoPay: boolean
    priority: 'high' | 'medium' | 'low'
}

interface PaymentLimits {
    dailyLimit: number
    monthlyLimit: number
    dailyUsed: number
    monthlyUsed: number
    singleTransactionLimit: number
}

interface NewPayment {
    payeeId: string
    amount: number
    currency: string
    paymentMethod: string
    scheduledDate?: string
    description: string
    isRecurring: boolean
    frequency?: string
    enableAutoPay: boolean
}

export default function PaymentsPage() {
    const [showAmounts, setShowAmounts] = useState(true)
    const [showMenu, setShowMenu] = useState(false)
    const [activeTab, setActiveTab] = useState<'pay' | 'scheduled' | 'history' | 'bills'>('pay')
    const [selectedPayee, setSelectedPayee] = useState<string | null>(null)
    const [showNewPayment, setShowNewPayment] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [showFilters, setShowFilters] = useState(false)

    const [limits, setLimits] = useState<PaymentLimits>({
        dailyLimit: 10000,
        monthlyLimit: 50000,
        dailyUsed: 2350,
        monthlyUsed: 18900,
        singleTransactionLimit: 5000
    })

    const [newPayment, setNewPayment] = useState<NewPayment>({
        payeeId: '',
        amount: 0,
        currency: 'USD',
        paymentMethod: '1',
        description: '',
        isRecurring: false,
        enableAutoPay: false
    })

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        {
            id: '1',
            type: 'card',
            name: 'Visa Debit',
            last4: '1234',
            expiryDate: '12/26',
            isDefault: true,
            isVerified: true,
            brand: 'Visa',
            nickname: 'Primary Card'
        },
        {
            id: '2',
            type: 'bank',
            name: 'Primary Checking',
            bankName: 'BancAI',
            isDefault: false,
            isVerified: true,
            balance: 6901.65
        },
        {
            id: '3',
            type: 'digital_wallet',
            name: 'Apple Pay',
            isDefault: false,
            isVerified: true,
            balance: 150.00
        },
        {
            id: '4',
            type: 'mobile_payment',
            name: 'Venmo',
            isDefault: false,
            isVerified: true,
            balance: 75.50
        }
    ])

    const [payees, setPayees] = useState<Payee[]>([
        {
            id: '1',
            name: 'Pacific Gas & Electric',
            category: 'Utilities',
            accountNumber: '****5678',
            isFavorite: true,
            isVerified: true,
            lastPayment: '2 weeks ago',
            totalPaid: 2847.50,
            autopayEnabled: true,
            nextDueDate: '2025-08-15',
            averageAmount: 125.80,
            nickname: 'PG&E'
        },
        {
            id: '2',
            name: 'Verizon Wireless',
            category: 'Phone',
            accountNumber: '****9012',
            phone: '+1 800-922-0204',
            isFavorite: true,
            isVerified: true,
            lastPayment: '1 week ago',
            totalPaid: 1890.75,
            autopayEnabled: false,
            nextDueDate: '2025-08-12',
            averageAmount: 89.50
        },
        {
            id: '3',
            name: 'Netflix',
            category: 'Entertainment',
            website: 'netflix.com',
            isFavorite: false,
            isVerified: true,
            lastPayment: '1 month ago',
            totalPaid: 179.94,
            autopayEnabled: true,
            nextDueDate: '2025-08-20',
            averageAmount: 14.99
        },
        {
            id: '4',
            name: 'Chase Credit Card',
            category: 'Credit Cards',
            accountNumber: '****3456',
            isFavorite: true,
            isVerified: true,
            lastPayment: '3 days ago',
            totalPaid: 8950.25,
            autopayEnabled: false,
            nextDueDate: '2025-08-18',
            averageAmount: 350.00
        },
        {
            id: '5',
            name: 'State Farm Insurance',
            category: 'Insurance',
            phone: '+1 800-782-8332',
            isFavorite: false,
            isVerified: true,
            lastPayment: '2 months ago',
            totalPaid: 2100.00,
            autopayEnabled: true,
            nextDueDate: '2025-09-01',
            averageAmount: 175.00
        }
    ])

    const [recentPayments, setRecentPayments] = useState<Payment[]>([
        {
            id: '1',
            payeeId: '1',
            payeeName: 'Pacific Gas & Electric',
            amount: 125.80,
            currency: 'USD',
            status: 'completed',
            date: '2025-08-08',
            paymentMethod: 'Visa ****1234',
            confirmationNumber: 'PAY123456789',
            category: 'Utilities',
            description: 'Monthly utility bill'
        },
        {
            id: '2',
            payeeId: '2',
            payeeName: 'Verizon Wireless',
            amount: 89.50,
            currency: 'USD',
            status: 'completed',
            date: '2025-08-07',
            paymentMethod: 'Bank Transfer',
            confirmationNumber: 'PAY987654321',
            category: 'Phone'
        },
        {
            id: '3',
            payeeId: '4',
            payeeName: 'Chase Credit Card',
            amount: 450.00,
            currency: 'USD',
            status: 'pending',
            date: '2025-08-09',
            scheduledDate: '2025-08-10',
            paymentMethod: 'Primary Checking',
            confirmationNumber: 'PAY456789123',
            category: 'Credit Cards',
            description: 'Credit card payment'
        },
        {
            id: '4',
            payeeId: '3',
            payeeName: 'Netflix',
            amount: 14.99,
            currency: 'USD',
            status: 'scheduled',
            date: '2025-08-20',
            scheduledDate: '2025-08-20',
            paymentMethod: 'Apple Pay',
            confirmationNumber: 'PAY789123456',
            category: 'Entertainment',
            isRecurring: true,
            frequency: 'Monthly',
            nextPayment: '2025-09-20'
        }
    ])

    const [billReminders, setBillReminders] = useState<BillReminder[]>([
        {
            id: '1',
            payeeName: 'Verizon Wireless',
            amount: 89.50,
            dueDate: '2025-08-12',
            category: 'Phone',
            isOverdue: false,
            daysTillDue: 3,
            isAutoPay: false,
            priority: 'high'
        },
        {
            id: '2',
            payeeName: 'Pacific Gas & Electric',
            amount: 125.80,
            dueDate: '2025-08-15',
            category: 'Utilities',
            isOverdue: false,
            daysTillDue: 6,
            isAutoPay: true,
            priority: 'medium'
        },
        {
            id: '3',
            payeeName: 'Chase Credit Card',
            amount: 350.00,
            dueDate: '2025-08-18',
            category: 'Credit Cards',
            isOverdue: false,
            daysTillDue: 9,
            isAutoPay: false,
            priority: 'high'
        }
    ])

    const categories = [
        'all', 'Utilities', 'Phone', 'Internet', 'Entertainment', 'Credit Cards',
        'Insurance', 'Healthcare', 'Rent', 'Loans', 'Subscriptions', 'Other'
    ]

    // Real-time updates simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setLimits(prev => ({
                ...prev,
                dailyUsed: prev.dailyUsed + (Math.random() * 20)
            }))
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    const filteredPayees = payees.filter(payee => {
        const matchesSearch = payee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (payee.nickname && payee.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesCategory = selectedCategory === 'all' || payee.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const filteredPayments = recentPayments.filter(payment => {
        const matchesSearch = payment.payeeName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || payment.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'utilities': return <Droplets className="w-5 h-5 text-blue-600" />
            case 'phone': return <Phone className="w-5 h-5 text-green-600" />
            case 'internet': return <Wifi className="w-5 h-5 text-purple-600" />
            case 'entertainment': return <Tv className="w-5 h-5 text-red-600" />
            case 'credit cards': return <CreditCard className="w-5 h-5 text-orange-600" />
            case 'insurance': return <Shield className="w-5 h-5 text-indigo-600" />
            case 'healthcare': return <Heart className="w-5 h-5 text-pink-600" />
            case 'rent': return <HomeIcon className="w-5 h-5 text-brown-600" />
            case 'loans': return <Building className="w-5 h-5 text-gray-600" />
            case 'subscriptions': return <RefreshCw className="w-5 h-5 text-teal-600" />
            default: return <DollarSign className="w-5 h-5 text-gray-600" />
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
            case 'scheduled': return <Calendar className="w-4 h-4 text-blue-600" />
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />
            case 'cancelled': return <AlertCircle className="w-4 h-4 text-gray-600" />
            default: return <Clock className="w-4 h-4 text-gray-600" />
        }
    }

    const getPaymentMethodIcon = (type: string) => {
        switch (type) {
            case 'card': return <CreditCard className="w-5 h-5 text-blue-600" />
            case 'bank': return <Building className="w-5 h-5 text-green-600" />
            case 'digital_wallet': return <Smartphone className="w-5 h-5 text-purple-600" />
            case 'mobile_payment': return <QrCode className="w-5 h-5 text-orange-600" />
            default: return <DollarSign className="w-5 h-5 text-gray-600" />
        }
    }

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount)
    }

    const getDaysTillDue = (dueDate: string) => {
        const today = new Date()
        const due = new Date(dueDate)
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const handleMakePayment = () => {
        if (!newPayment.payeeId || !newPayment.amount) return

        const payment: Payment = {
            id: Date.now().toString(),
            payeeId: newPayment.payeeId,
            payeeName: payees.find(p => p.id === newPayment.payeeId)?.name || '',
            amount: newPayment.amount,
            currency: newPayment.currency,
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            scheduledDate: newPayment.scheduledDate,
            paymentMethod: paymentMethods.find(m => m.id === newPayment.paymentMethod)?.name || '',
            confirmationNumber: `PAY${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            category: payees.find(p => p.id === newPayment.payeeId)?.category || 'Other',
            description: newPayment.description,
            isRecurring: newPayment.isRecurring
        }

        setRecentPayments(prev => [payment, ...prev])
        setNewPayment({
            payeeId: '',
            amount: 0,
            currency: 'USD',
            paymentMethod: '1',
            description: '',
            isRecurring: false,
            enableAutoPay: false
        })
        setShowNewPayment(false)
        setActiveTab('history')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50">
            {/* Mobile Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white py-4 px-4 shadow-xl"
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Payments</h1>
                            <p className="text-green-100 text-sm">Pay bills & manage payments</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowAmounts(!showAmounts)}
                            className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
                        >
                            {showAmounts ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Payment Limits */}
                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-green-100">Daily Payment Limit</span>
                        <span className="text-sm font-medium">
                            {showAmounts ? formatCurrency(limits.dailyUsed) : '••••••'} / {showAmounts ? formatCurrency(limits.dailyLimit) : '••••••'}
                        </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${(limits.dailyUsed / limits.dailyLimit) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Navigation Menu */}
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm shadow-xl rounded-b-2xl p-4 z-50"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/" className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl text-green-700 hover:bg-green-100 transition-colors">
                                <Home className="w-5 h-5" />
                                <span className="font-medium">Dashboard</span>
                            </Link>
                            <Link href="/accounts" className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors">
                                <Wallet className="w-5 h-5" />
                                <span className="font-medium">Accounts</span>
                            </Link>
                            <Link href="/transactions" className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl text-purple-700 hover:bg-purple-100 transition-colors">
                                <Activity className="w-5 h-5" />
                                <span className="font-medium">Transactions</span>
                            </Link>
                            <Link href="/transfers" className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl text-orange-700 hover:bg-orange-100 transition-colors">
                                <Send className="w-5 h-5" />
                                <span className="font-medium">Transfers</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </motion.header>

            <div className="px-4 py-6">
                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl mb-6"
                >
                    <div className="flex space-x-1">
                        {[
                            { id: 'pay', label: 'Pay Bills', icon: <CreditCard className="w-4 h-4" /> },
                            { id: 'scheduled', label: 'Scheduled', icon: <Calendar className="w-4 h-4" /> },
                            { id: 'bills', label: 'Bills Due', icon: <Bell className="w-4 h-4" /> },
                            { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-2 rounded-xl transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                    }`}
                            >
                                {tab.icon}
                                <span className="font-medium text-xs">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Payment Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-3 gap-3 mb-6"
                >
                    <button
                        onClick={() => {
                            setActiveTab('pay')
                            setShowNewPayment(true)
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-lg flex flex-col items-center"
                    >
                        <Zap className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Quick Pay</span>
                    </button>
                    <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl shadow-lg flex flex-col items-center">
                        <QrCode className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Scan Bill</span>
                    </button>
                    <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg flex flex-col items-center">
                        <Calendar className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Schedule</span>
                    </button>
                </motion.div>

                {/* Content based on active tab */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'pay' && (
                        <div className="space-y-6">
                            {/* New Payment Form */}
                            {showNewPayment && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Make Payment</h3>
                                        <button
                                            onClick={() => setShowNewPayment(false)}
                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Pay To</label>
                                            <select
                                                value={newPayment.payeeId}
                                                onChange={(e) => setNewPayment(prev => ({ ...prev, payeeId: e.target.value }))}
                                                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <option value="">Select payee</option>
                                                {payees.map(payee => (
                                                    <option key={payee.id} value={payee.id}>{payee.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                            <input
                                                type="number"
                                                value={newPayment.amount || ''}
                                                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                                placeholder="0.00"
                                                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                            <select
                                                value={newPayment.paymentMethod}
                                                onChange={(e) => setNewPayment(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                {paymentMethods.map(method => (
                                                    <option key={method.id} value={method.id}>
                                                        {method.name} {method.last4 ? `****${method.last4}` : ''}
                                                        {method.balance && showAmounts ? ` (${formatCurrency(method.balance)})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                                            <input
                                                type="text"
                                                value={newPayment.description}
                                                onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Payment description"
                                                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Payment</label>
                                            <input
                                                type="date"
                                                value={newPayment.scheduledDate || ''}
                                                onChange={(e) => setNewPayment(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="recurring"
                                                checked={newPayment.isRecurring}
                                                onChange={(e) => setNewPayment(prev => ({ ...prev, isRecurring: e.target.checked }))}
                                                className="rounded border-gray-300"
                                            />
                                            <label htmlFor="recurring" className="text-sm text-gray-700">Make this a recurring payment</label>
                                        </div>

                                        <button
                                            onClick={handleMakePayment}
                                            disabled={!newPayment.payeeId || !newPayment.amount}
                                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {newPayment.scheduledDate ? 'Schedule Payment' : 'Pay Now'}
                                            {showAmounts && newPayment.amount > 0 ? ` - ${formatCurrency(newPayment.amount)}` : ''}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Favorite Payees */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Favorite Payees</h3>
                                    <button className="flex items-center space-x-2 text-green-600">
                                        <Plus className="w-4 h-4" />
                                        <span>Add</span>
                                    </button>
                                </div>

                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search payees..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
                                    />
                                </div>

                                <div className="flex items-center space-x-2 mb-4">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg text-sm"
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span>Filter</span>
                                    </button>

                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-3 py-1 bg-gray-100 rounded-lg text-sm border border-gray-200"
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category === 'all' ? 'All Categories' : category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    {filteredPayees.map(payee => (
                                        <motion.div
                                            key={payee.id}
                                            whileHover={{ scale: 1.01 }}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                                                        {getCategoryIcon(payee.category)}
                                                    </div>
                                                    {payee.isFavorite && (
                                                        <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-current" />
                                                    )}
                                                    {payee.isVerified && (
                                                        <Shield className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 fill-current" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{payee.name}</div>
                                                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                                                        <span>{payee.category}</span>
                                                        {payee.lastPayment && (
                                                            <>
                                                                <span>•</span>
                                                                <span>Last: {payee.lastPayment}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {payee.nextDueDate && (
                                                        <div className="text-xs text-orange-600">
                                                            Due: {new Date(payee.nextDueDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {payee.autopayEnabled && (
                                                    <div className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                                                        AutoPay
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setNewPayment(prev => ({ ...prev, payeeId: payee.id }))
                                                        setShowNewPayment(true)
                                                    }}
                                                    className="bg-green-100 text-green-600 p-2 rounded-lg"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bills' && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Upcoming Bills</h3>
                                <button className="text-green-600 text-sm font-medium">
                                    Mark All Paid
                                </button>
                            </div>

                            <div className="space-y-3">
                                {billReminders.map(bill => (
                                    <motion.div
                                        key={bill.id}
                                        whileHover={{ scale: 1.01 }}
                                        className={`p-4 rounded-xl border-l-4 ${bill.isOverdue ? 'bg-red-50 border-red-500' :
                                                bill.daysTillDue <= 3 ? 'bg-orange-50 border-orange-500' :
                                                    'bg-gray-50 border-gray-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-white rounded-full shadow-sm">
                                                    {getCategoryIcon(bill.category)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{bill.payeeName}</div>
                                                    <div className="text-sm text-gray-600">
                                                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                                                    </div>
                                                    <div className={`text-xs ${bill.isOverdue ? 'text-red-600' :
                                                            bill.daysTillDue <= 3 ? 'text-orange-600' :
                                                                'text-gray-500'
                                                        }`}>
                                                        {bill.isOverdue ? 'Overdue' :
                                                            bill.daysTillDue === 0 ? 'Due Today' :
                                                                `${bill.daysTillDue} days left`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {showAmounts ? formatCurrency(bill.amount) : '••••••'}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {bill.isAutoPay && (
                                                        <div className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                                                            AutoPay
                                                        </div>
                                                    )}
                                                    <button className="bg-green-100 text-green-600 px-3 py-1 rounded text-xs">
                                                        Pay Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'scheduled' && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Scheduled Payments</h3>
                                <button className="text-green-600 text-sm font-medium">
                                    Manage All
                                </button>
                            </div>

                            <div className="space-y-3">
                                {recentPayments.filter(p => p.status === 'scheduled').map(payment => (
                                    <motion.div
                                        key={payment.id}
                                        whileHover={{ scale: 1.01 }}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-white rounded-full shadow-sm">
                                                {getCategoryIcon(payment.category)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{payment.payeeName}</div>
                                                <div className="text-sm text-gray-600">{payment.description}</div>
                                                <div className="text-xs text-blue-600 flex items-center space-x-2">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Scheduled: {payment.scheduledDate}</span>
                                                    {payment.isRecurring && (
                                                        <>
                                                            <RefreshCw className="w-3 h-3" />
                                                            <span>{payment.frequency}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-gray-900">
                                                {showAmounts ? formatCurrency(payment.amount) : '••••••'}
                                            </div>
                                            <div className="text-xs text-gray-500">{payment.paymentMethod}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                                <button className="text-green-600 text-sm font-medium">
                                    Export
                                </button>
                            </div>

                            <div className="space-y-3">
                                {filteredPayments.map(payment => (
                                    <motion.div
                                        key={payment.id}
                                        whileHover={{ scale: 1.01 }}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-white rounded-full shadow-sm">
                                                {getStatusIcon(payment.status)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{payment.payeeName}</div>
                                                <div className="text-sm text-gray-600">{payment.description}</div>
                                                <div className="text-xs text-gray-500 flex items-center space-x-2">
                                                    <span>{payment.date}</span>
                                                    <span>•</span>
                                                    <span>{payment.confirmationNumber}</span>
                                                    <span>•</span>
                                                    <span>{payment.paymentMethod}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-gray-900">
                                                {showAmounts ? formatCurrency(payment.amount) : '••••••'}
                                            </div>
                                            <div className="text-xs text-gray-500 capitalize">{payment.status}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Bottom Navigation */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-2"
            >
                <div className="flex justify-around items-center">
                    <Link href="/" className="flex flex-col items-center p-2 text-gray-500">
                        <Home className="w-5 h-5" />
                        <span className="text-xs font-medium mt-1">Home</span>
                    </Link>
                    <Link href="/accounts" className="flex flex-col items-center p-2 text-gray-500">
                        <Wallet className="w-5 h-5" />
                        <span className="text-xs font-medium mt-1">Accounts</span>
                    </Link>
                    <Link href="/transactions" className="flex flex-col items-center p-2 text-gray-500">
                        <Activity className="w-5 h-5" />
                        <span className="text-xs font-medium mt-1">Activity</span>
                    </Link>
                    <Link href="/investments" className="flex flex-col items-center p-2 text-gray-500">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-xs font-medium mt-1">Invest</span>
                    </Link>
                    <Link href="/settings" className="flex flex-col items-center p-2 text-gray-500">
                        <Settings className="w-5 h-5" />
                        <span className="text-xs font-medium mt-1">Settings</span>
                    </Link>
                </div>
            </motion.div>

            {/* Padding for bottom navigation */}
            <div className="h-20"></div>
        </div>
    )
}
