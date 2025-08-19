'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Send,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Scan,
  Copy,
  QrCode,
  Wallet,
  CreditCard,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Eye,
  EyeOff,
  Calculator,
  Star,
  Network,
  Zap,
  Settings,
  History,
  ExternalLink,
  Plus,
  Minus,
  Globe,
  Lock,
  User,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Bookmark
} from 'lucide-react'

// TypeScript Interfaces
interface Asset {
  id: string
  symbol: string
  name: string
  icon: string
  balance: number
  value: number
  price: number
  network: string
  decimals: number
  contractAddress?: string
  gasEstimate: number
  minTransfer: number
  maxTransfer: number
  transferFee: number
  confirmations: number
}

interface TransferState {
  mode: 'send' | 'receive'
  selectedAsset: Asset | null
  recipient: string
  amount: string
  memo: string
  gasPrice: 'slow' | 'standard' | 'fast'
  isValidAddress: boolean
  estimatedFee: number
  estimatedTime: number
  totalCost: number
}

interface RecentContact {
  id: string
  name: string
  address: string
  avatar: string
  network: string
  lastUsed: string
  favorite: boolean
  verified: boolean
}

interface NetworkInfo {
  id: string
  name: string
  symbol: string
  color: string
  gasPrice: number
  blockTime: number
  confirmations: number
  explorerUrl: string
}

const SendReceivePage = () => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [hideAmounts, setHideAmounts] = useState(false)
  const [transfer, setTransfer] = useState<TransferState>({
    mode: 'send',
    selectedAsset: null,
    recipient: '',
    amount: '',
    memo: '',
    gasPrice: 'standard',
    isValidAddress: false,
    estimatedFee: 0,
    estimatedTime: 0,
    totalCost: 0
  })

  const [recentContacts] = useState<RecentContact[]>([
    {
      id: '1',
      name: 'Alice Cooper',
      address: '0x742d35Cc6635C0532925a3b8D0897dBF7BDF3Ac7',
      avatar: '👩‍💼',
      network: 'ethereum',
      lastUsed: '2025-08-07T12:30:00Z',
      favorite: true,
      verified: true
    },
    {
      id: '2',
      name: 'Bob Wilson',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      avatar: '👨‍💻',
      network: 'bitcoin',
      lastUsed: '2025-08-06T15:45:00Z',
      favorite: false,
      verified: true
    },
    {
      id: '3',
      name: 'Carol Davis',
      address: '7xKXQhKHkdKdXhKdKdX7',
      avatar: '👩‍🎨',
      network: 'solana',
      lastUsed: '2025-08-05T09:20:00Z',
      favorite: true,
      verified: false
    }
  ])

  const networks: NetworkInfo[] = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: 'from-blue-500 to-indigo-600', gasPrice: 25, blockTime: 12, confirmations: 12, explorerUrl: 'etherscan.io' },
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', color: 'from-orange-500 to-yellow-600', gasPrice: 15, blockTime: 600, confirmations: 6, explorerUrl: 'blockstream.info' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', color: 'from-purple-500 to-pink-600', gasPrice: 0.0001, blockTime: 1, confirmations: 32, explorerUrl: 'solscan.io' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC', color: 'from-indigo-500 to-purple-600', gasPrice: 2, blockTime: 2, confirmations: 64, explorerUrl: 'polygonscan.com' }
  ]

  // Sample assets
  useEffect(() => {
    const sampleAssets: Asset[] = [
      {
        id: '1',
        symbol: 'BTC',
        name: 'Bitcoin',
        icon: '₿',
        balance: 0.7845,
        value: 52674.23,
        price: 67145.89,
        network: 'bitcoin',
        decimals: 8,
        gasEstimate: 0.0001,
        minTransfer: 0.00001,
        maxTransfer: 10,
        transferFee: 0.0001,
        confirmations: 6
      },
      {
        id: '2',
        symbol: 'ETH',
        name: 'Ethereum',
        icon: 'Ξ',
        balance: 5.2347,
        value: 18096.45,
        price: 3456.78,
        network: 'ethereum',
        decimals: 18,
        contractAddress: '0x0000000000000000000000000000000000000000',
        gasEstimate: 0.0045,
        minTransfer: 0.001,
        maxTransfer: 100,
        transferFee: 0.0045,
        confirmations: 12
      },
      {
        id: '3',
        symbol: 'SOL',
        name: 'Solana',
        icon: '◎',
        balance: 47.8923,
        value: 7845.67,
        price: 163.89,
        network: 'solana',
        decimals: 9,
        gasEstimate: 0.000005,
        minTransfer: 0.01,
        maxTransfer: 1000,
        transferFee: 0.000005,
        confirmations: 32
      },
      {
        id: '4',
        symbol: 'MATIC',
        name: 'Polygon',
        icon: '⬢',
        balance: 567.89,
        value: 978.45,
        price: 1.72,
        network: 'polygon',
        decimals: 18,
        contractAddress: '0x0000000000000000000000000000000000001010',
        gasEstimate: 0.01,
        minTransfer: 1,
        maxTransfer: 10000,
        transferFee: 0.01,
        confirmations: 64
      }
    ]
    setAssets(sampleAssets)
    setTransfer(prev => ({ ...prev, selectedAsset: sampleAssets[0] }))
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatCrypto = (amount: number, decimals: number = 4) => {
    return amount.toFixed(decimals)
  }

  const validateAddress = (address: string, network: string) => {
    // Simplified validation - in real app, use proper validation libraries
    const patterns = {
      ethereum: /^0x[a-fA-F0-9]{40}$/,
      bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
      solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      polygon: /^0x[a-fA-F0-9]{40}$/
    }
    return patterns[network as keyof typeof patterns]?.test(address) || false
  }

  const calculateFees = (amount: number, asset: Asset | null, gasPrice: string) => {
    if (!asset || !amount) return { fee: 0, time: 0, total: 0 }

    const gasMultipliers = { slow: 0.8, standard: 1, fast: 1.5 }
    const timeMultipliers = { slow: 2, standard: 1, fast: 0.5 }

    const baseFee = asset.transferFee * gasMultipliers[gasPrice]
    const estimatedTime = asset.confirmations * timeMultipliers[gasPrice]
    const total = amount + baseFee

    return { fee: baseFee, time: estimatedTime, total }
  }

  useEffect(() => {
    if (transfer.selectedAsset && transfer.amount) {
      const amount = parseFloat(transfer.amount)
      const { fee, time, total } = calculateFees(amount, transfer.selectedAsset, transfer.gasPrice)
      setTransfer(prev => ({
        ...prev,
        estimatedFee: fee,
        estimatedTime: time,
        totalCost: total,
        isValidAddress: validateAddress(prev.recipient, prev.selectedAsset?.network || '')
      }))
    }
  }, [transfer.amount, transfer.selectedAsset, transfer.gasPrice, transfer.recipient])

  const handleSend = async () => {
    if (!transfer.selectedAsset || !transfer.amount || !transfer.recipient) return

    // Simulate transaction
    console.log('Sending transaction:', {
      asset: transfer.selectedAsset.symbol,
      amount: transfer.amount,
      recipient: transfer.recipient,
      fee: transfer.estimatedFee
    })

    alert('Transaction sent successfully!')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const generateReceiveAddress = () => {
    if (!transfer.selectedAsset) return 'No asset selected'

    // Mock addresses for different networks
    const addresses = {
      bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      ethereum: '0x742d35Cc6635C0532925a3b8D0897dBF7BDF3Ac7',
      solana: '7xKXQhKHkdKdXhKdKdX7xKXQhKHkdKdXhKdKdX7',
      polygon: '0x742d35Cc6635C0532925a3b8D0897dBF7BDF3Ac7'
    }

    return addresses[transfer.selectedAsset.network as keyof typeof addresses] || 'Address not available'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Enhanced Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Send className="w-8 h-8 text-slate-400" />
                Send & Receive
              </h1>
              <p className="text-slate-300 mt-1">Transfer cryptocurrencies securely across networks</p>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setHideAmounts(!hideAmounts)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-xl text-purple-300 transition-colors"
              >
                {hideAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {hideAmounts ? 'Show' : 'Hide'} Amounts
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTransfer(prev => ({ ...prev, mode: 'send' }))}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${transfer.mode === 'send'
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                    : 'text-slate-300 hover:bg-white/10'
                  }`}
              >
                <ArrowUpRight className="w-5 h-5" />
                Send
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTransfer(prev => ({ ...prev, mode: 'receive' }))}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${transfer.mode === 'receive'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-white/10'
                  }`}
              >
                <ArrowDownLeft className="w-5 h-5" />
                Receive
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Transfer Interface */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                {transfer.mode === 'send' ? (
                  <>
                    <ArrowUpRight className="w-6 h-6 text-red-400" />
                    Send Cryptocurrency
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-6 h-6 text-green-400" />
                    Receive Cryptocurrency
                  </>
                )}
              </h3>

              {transfer.mode === 'send' ? (
                <div className="space-y-6">
                  {/* Asset Selection */}
                  <div>
                    <label className="block text-slate-300 mb-3 font-medium">Select Asset</label>
                    <div className="grid grid-cols-2 gap-3">
                      {assets.map((asset) => (
                        <motion.button
                          key={asset.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setTransfer(prev => ({ ...prev, selectedAsset: asset }))}
                          className={`p-4 rounded-xl border transition-all ${transfer.selectedAsset?.id === asset.id
                              ? 'bg-purple-500/30 border-purple-400 text-white'
                              : 'bg-white/5 border-white/20 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-xl">
                              {asset.icon}
                            </div>
                            <div className="text-left">
                              <p className="font-bold">{asset.symbol}</p>
                              <p className="text-sm opacity-75">
                                {hideAmounts ? '••••••' : formatCrypto(asset.balance)} {asset.symbol}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Address */}
                  <div>
                    <label className="block text-slate-300 mb-3 font-medium">Recipient Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter recipient address..."
                        value={transfer.recipient}
                        onChange={(e) => setTransfer(prev => ({ ...prev, recipient: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-24"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-slate-500/20 hover:bg-slate-500/30 rounded-lg text-slate-300 transition-colors"
                        >
                          <QrCode className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-slate-500/20 hover:bg-slate-500/30 rounded-lg text-slate-300 transition-colors"
                        >
                          <Scan className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    {transfer.recipient && (
                      <div className="mt-2 flex items-center gap-2">
                        {transfer.isValidAddress ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm ${transfer.isValidAddress ? 'text-green-400' : 'text-red-400'}`}>
                          {transfer.isValidAddress ? 'Valid address' : 'Invalid address format'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-slate-300 mb-3 font-medium">Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={transfer.amount}
                        onChange={(e) => setTransfer(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-16"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-300 font-medium">
                        {transfer.selectedAsset?.symbol}
                      </span>
                    </div>
                    {transfer.selectedAsset && (
                      <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
                        <span>Available: {hideAmounts ? '••••••' : formatCrypto(transfer.selectedAsset.balance)} {transfer.selectedAsset.symbol}</span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTransfer(prev => ({
                            ...prev,
                            amount: prev.selectedAsset ? (prev.selectedAsset.balance - prev.selectedAsset.transferFee).toString() : ''
                          }))}
                          className="text-purple-400 hover:text-purple-300 font-medium"
                        >
                          Max
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Gas Price Selection */}
                  <div>
                    <label className="block text-slate-300 mb-3 font-medium">Transaction Speed</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['slow', 'standard', 'fast'] as const).map((speed) => (
                        <motion.button
                          key={speed}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setTransfer(prev => ({ ...prev, gasPrice: speed }))}
                          className={`p-4 rounded-xl border transition-all ${transfer.gasPrice === speed
                              ? 'bg-purple-500/30 border-purple-400 text-white'
                              : 'bg-white/5 border-white/20 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                          <div className="text-center">
                            <p className="font-bold capitalize">{speed}</p>
                            <p className="text-sm opacity-75">
                              {speed === 'slow' && '~30 min'}
                              {speed === 'standard' && '~5 min'}
                              {speed === 'fast' && '~1 min'}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Transaction Summary */}
                  {transfer.amount && transfer.selectedAsset && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/20">
                      <h4 className="font-bold text-white mb-4">Transaction Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-300">Amount</span>
                          <span className="text-white font-medium">
                            {hideAmounts ? '••••••' : transfer.amount} {transfer.selectedAsset.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Network Fee</span>
                          <span className="text-white font-medium">
                            {hideAmounts ? '••••••' : formatCrypto(transfer.estimatedFee, 6)} {transfer.selectedAsset.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-white/20 pt-3">
                          <span className="text-slate-300 font-medium">Total</span>
                          <span className="text-white font-bold">
                            {hideAmounts ? '••••••' : formatCrypto(transfer.totalCost)} {transfer.selectedAsset.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Est. Time</span>
                          <span className="text-white font-medium">{transfer.estimatedTime} min</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Send Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSend}
                    disabled={!transfer.amount || !transfer.recipient || !transfer.isValidAddress}
                    className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send {transfer.selectedAsset?.symbol || 'Crypto'}
                  </motion.button>
                </div>
              ) : (
                /* Receive Interface */
                <div className="space-y-6">
                  {/* Asset Selection for Receive */}
                  <div>
                    <label className="block text-slate-300 mb-3 font-medium">Select Asset to Receive</label>
                    <div className="grid grid-cols-2 gap-3">
                      {assets.map((asset) => (
                        <motion.button
                          key={asset.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setTransfer(prev => ({ ...prev, selectedAsset: asset }))}
                          className={`p-4 rounded-xl border transition-all ${transfer.selectedAsset?.id === asset.id
                              ? 'bg-green-500/30 border-green-400 text-white'
                              : 'bg-white/5 border-white/20 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-xl">
                              {asset.icon}
                            </div>
                            <div className="text-left">
                              <p className="font-bold">{asset.symbol}</p>
                              <p className="text-sm opacity-75">{asset.name}</p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Receive Address Display */}
                  {transfer.selectedAsset && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/20">
                      <h4 className="font-bold text-white mb-4">Your {transfer.selectedAsset.symbol} Address</h4>
                      <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-white break-all">{generateReceiveAddress()}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => copyToClipboard(generateReceiveAddress())}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300 transition-colors ml-3"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                        </div>
                        <div className="flex justify-center">
                          <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                            <QrCode className="w-24 h-24 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-blue-300 font-medium">Important Notes:</p>
                            <ul className="text-sm text-slate-300 mt-2 space-y-1">
                              <li>• Only send {transfer.selectedAsset.symbol} to this address</li>
                              <li>• Minimum transfer: {transfer.selectedAsset.minTransfer} {transfer.selectedAsset.symbol}</li>
                              <li>• Confirmations required: {transfer.selectedAsset.confirmations}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Contacts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Recent Contacts
              </h3>
              <div className="space-y-3">
                {recentContacts.map((contact) => (
                  <motion.button
                    key={contact.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTransfer(prev => ({ ...prev, recipient: contact.address }))}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-lg">
                        {contact.avatar}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{contact.name}</p>
                          {contact.favorite && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                          {contact.verified && <CheckCircle className="w-3 h-3 text-green-400" />}
                        </div>
                        <p className="text-xs text-slate-300 font-mono truncate">{contact.address}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Network Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Network className="w-5 h-5" />
                Network Status
              </h3>
              <div className="space-y-3">
                {networks.map((network) => (
                  <div key={network.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 bg-gradient-to-r ${network.color} rounded-full`}></div>
                      <span className="text-white font-medium">{network.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-400">Online</span>
                      </div>
                      <p className="text-xs text-slate-300">{network.gasPrice} gwei</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Shield className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Secure Transfers</h3>
              <p className="text-slate-300">Multi-signature security with hardware wallet support and transaction verification.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Globe className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Network</h3>
              <p className="text-slate-300">Support for Bitcoin, Ethereum, Solana, Polygon and other major blockchain networks.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Zap className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Fast & Efficient</h3>
              <p className="text-slate-300">Optimized gas fees with real-time transaction tracking and instant confirmations.</p>
            </motion.div>
          </div>

          <div className="text-center text-slate-300 mt-8 pt-8 border-t border-white/10">
            <p>&copy; 2025 Wallet Platform. All rights reserved. | Send & Receive v2.0.0</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default SendReceivePage
