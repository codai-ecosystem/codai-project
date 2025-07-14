'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RealBankingService } from '../../services/RealBankingService'
import {
    CreditCard,
    Send,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle,
    XCircle,
    Euro,
    DollarSign,
    Banknote,
    History,
    Plus,
    Eye,
    Download
} from 'lucide-react'

interface PaymentMethod {
    id: string;
    type: 'card' | 'bank_account';
    last4: string;
    brand?: string;
    name: string;
    isDefault: boolean;
}

interface Transaction {
    id: string;
    amount: number;
    currency: string;
    type: 'debit' | 'credit';
    status: 'completed' | 'pending' | 'failed';
    description: string;
    merchant?: string;
    timestamp: Date;
    category: string;
}

export default function PaymentsPage() {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [paymentDescription, setPaymentDescription] = useState('')
    const [selectedMethod, setSelectedMethod] = useState<string>('')
    const [processingPayment, setProcessingPayment] = useState(false)
    const [paymentResult, setPaymentResult] = useState<any>(null)

    const bankingService = RealBankingService.getInstance()

    useEffect(() => {
        loadPaymentData()
    }, [])

    const loadPaymentData = async () => {
        try {
            setLoading(true)

            // Simulate loading payment methods and transactions
            const mockPaymentMethods: PaymentMethod[] = [
                {
                    id: 'pm_1',
                    type: 'card',
                    last4: '4242',
                    brand: 'visa',
                    name: 'Visa •••• 4242',
                    isDefault: true
                },
                {
                    id: 'pm_2',
                    type: 'card',
                    last4: '5555',
                    brand: 'mastercard',
                    name: 'Mastercard •••• 5555',
                    isDefault: false
                },
                {
                    id: 'pm_3',
                    type: 'bank_account',
                    last4: '1234',
                    name: 'BRD Cont Principal ••1234',
                    isDefault: false
                }
            ]

            // Get real transaction data
            const transactions = await bankingService.getRealTransactionData('current_user')

            setPaymentMethods(mockPaymentMethods)
            setRecentTransactions(transactions)
            setSelectedMethod(mockPaymentMethods[0]?.id || '')

        } catch (error) {
            console.error('Error loading payment data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePayment = async () => {
        if (!paymentAmount || !paymentDescription || !selectedMethod) {
            alert('Vă rugăm completați toate câmpurile')
            return
        }

        try {
            setProcessingPayment(true)

            const paymentData = {
                amount: parseFloat(paymentAmount),
                currency: 'RON',
                description: paymentDescription,
                paymentMethodId: selectedMethod
            }

            const result = await bankingService.processRealPayment(paymentData)
            setPaymentResult(result)

            if (result.success) {
                // Refresh transactions
                await loadPaymentData()
                // Clear form
                setPaymentAmount('')
                setPaymentDescription('')
            }

        } catch (error) {
            console.error('Payment error:', error)
            setPaymentResult({
                success: false,
                error: error?.toString() || 'Plata a eșuat'
            })
        } finally {
            setProcessingPayment(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />
            case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />
            case 'failed': return <XCircle className="w-5 h-5 text-red-400" />
            default: return <Clock className="w-5 h-5 text-gray-400" />
        }
    }

    const getTransactionIcon = (type: string) => {
        return type === 'credit' ?
            <ArrowDownLeft className="w-5 h-5 text-green-400" /> :
            <ArrowUpRight className="w-5 h-5 text-red-400" />
    }

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'food': 'bg-green-500/20 text-green-400',
            'transport': 'bg-blue-500/20 text-blue-400',
            'entertainment': 'bg-purple-500/20 text-purple-400',
            'utilities': 'bg-yellow-500/20 text-yellow-400',
            'shopping': 'bg-pink-500/20 text-pink-400',
            'cash': 'bg-gray-500/20 text-gray-400',
            'other': 'bg-slate-500/20 text-slate-400'
        }
        return colors[category] || colors['other']
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <Send className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Plăți & Tranzacții</h1>
                                <p className="text-sm text-gray-400">Gestionează plățile și istoricul</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Payment Form */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Plată Nouă
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Sumă (RON)
                                    </label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Descriere
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentDescription}
                                        onChange={(e) => setPaymentDescription(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Descrierea plății..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Metodă de Plată
                                    </label>
                                    <select
                                        value={selectedMethod}
                                        onChange={(e) => setSelectedMethod(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {paymentMethods.map(method => (
                                            <option key={method.id} value={method.id} className="bg-gray-800">
                                                {method.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={processingPayment}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processingPayment ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Procesare...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Trimite Plata
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Payment Result */}
                            {paymentResult && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`mt-4 p-4 rounded-lg ${paymentResult.success
                                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                                        : 'bg-red-500/20 border border-red-500/30 text-red-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {paymentResult.success ?
                                            <CheckCircle className="w-5 h-5" /> :
                                            <XCircle className="w-5 h-5" />
                                        }
                                        <span className="font-semibold">
                                            {paymentResult.success ? 'Plată Reușită!' : 'Plată Eșuată'}
                                        </span>
                                    </div>
                                    {paymentResult.success ? (
                                        <div className="text-sm space-y-1">
                                            <p>Sumă: {paymentResult.amount} {paymentResult.currency}</p>
                                            <p>ID: {paymentResult.paymentIntentId}</p>
                                            <p>Status: {paymentResult.status}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm">{paymentResult.error}</p>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Payment Methods */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mt-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Metode de Plată
                            </h3>
                            <div className="space-y-3">
                                {paymentMethods.map(method => (
                                    <div key={method.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                {method.type === 'card' ?
                                                    <CreditCard className="w-5 h-5 text-emerald-400" /> :
                                                    <Banknote className="w-5 h-5 text-emerald-400" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{method.name}</p>
                                                {method.isDefault && (
                                                    <span className="text-xs text-emerald-400">Implicit</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <History className="w-5 h-5" />
                                    Tranzacții Recente
                                </h2>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/20 transition-all">
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>

                            <div className="space-y-3">
                                {recentTransactions.slice(0, 10).map(transaction => (
                                    <motion.div
                                        key={transaction.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                {getTransactionIcon(transaction.type)}
                                                {getStatusIcon(transaction.status)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{transaction.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(transaction.category)}`}>
                                                        {transaction.category}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {transaction.timestamp.toLocaleDateString('ro-RO')} {transaction.timestamp.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                                {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toFixed(2)} {transaction.currency}
                                            </p>
                                            {transaction.merchant && (
                                                <p className="text-xs text-gray-400">{transaction.merchant}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {recentTransactions.length === 0 && (
                                <div className="text-center py-12">
                                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-400">Nu există tranzacții recente</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
