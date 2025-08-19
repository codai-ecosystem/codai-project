'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Signal,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Activity,
  BarChart3,
  LineChart,
  Eye,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Bell,
  BellOff,
  Star,
  StarOff,
  Play,
  Pause,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Percent,
  TrendingUpIcon,
  TrendingDownIcon,
  Shield,
  Lightbulb,
  Rocket,
  Gauge
} from 'lucide-react'

interface AISignal {
  id: string
  symbol: string
  name: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  currentPrice: number
  targetPrice: number
  stopLoss: number
  expectedReturn: number
  timeHorizon: string
  pattern: string
  strength: 'STRONG' | 'MODERATE' | 'WEAK'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  aiReasoning: string[]
  technicalIndicators: {
    rsi: number
    macd: string
    sma: number
    volume: string
  }
  marketSentiment: number
  newsImpact: number
  volumeProfile: string
  isActive: boolean
  isWatchlisted: boolean
  generatedAt: string
  expiresAt: string
  accuracy: number
  sector?: string
  exchange: string
}

interface MarketIndicator {
  name: string
  value: number
  change: number
  status: 'bullish' | 'bearish' | 'neutral'
  description: string
}

interface AIModel {
  id: string
  name: string
  type: 'neural_network' | 'ensemble' | 'deep_learning' | 'quantum'
  accuracy: number
  isActive: boolean
  lastTrained: string
  signalsGenerated: number
  successRate: number
  specialty: string
}

export default function XAISignalsPage() {
  const [aiSignals, setAiSignals] = useState<AISignal[]>([
    {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      signal: 'BUY',
      confidence: 94,
      currentPrice: 67500,
      targetPrice: 75000,
      stopLoss: 63000,
      expectedReturn: 11.1,
      timeHorizon: '2-4 weeks',
      pattern: 'Bull Flag Breakout',
      strength: 'STRONG',
      riskLevel: 'MEDIUM',
      aiReasoning: [
        'Strong institutional buying pressure detected',
        'Technical breakout above resistance at $66,800',
        'Positive news sentiment with ETF approvals',
        'Volume surge indicates genuine momentum'
      ],
      technicalIndicators: {
        rsi: 68,
        macd: 'Bullish Crossover',
        sma: 65200,
        volume: 'Above Average'
      },
      marketSentiment: 78,
      newsImpact: 82,
      volumeProfile: 'High',
      isActive: true,
      isWatchlisted: true,
      generatedAt: '2025-08-07T14:30:00Z',
      expiresAt: '2025-08-07T18:30:00Z',
      accuracy: 87,
      exchange: 'Binance'
    },
    {
      id: '2',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      signal: 'SELL',
      confidence: 78,
      currentPrice: 192.50,
      targetPrice: 175.00,
      stopLoss: 198.00,
      expectedReturn: -9.1,
      timeHorizon: '1-2 weeks',
      pattern: 'Head and Shoulders',
      strength: 'MODERATE',
      riskLevel: 'LOW',
      aiReasoning: [
        'Bearish divergence in RSI momentum',
        'Earnings disappointment expected',
        'Technical pattern shows weakness',
        'Profit-taking at resistance levels'
      ],
      technicalIndicators: {
        rsi: 78,
        macd: 'Bearish Divergence',
        sma: 188.40,
        volume: 'Below Average'
      },
      marketSentiment: 42,
      newsImpact: 38,
      volumeProfile: 'Low',
      isActive: true,
      isWatchlisted: false,
      generatedAt: '2025-08-07T13:45:00Z',
      expiresAt: '2025-08-07T17:45:00Z',
      accuracy: 82,
      sector: 'Technology',
      exchange: 'NASDAQ'
    },
    {
      id: '3',
      symbol: 'ETH',
      name: 'Ethereum',
      signal: 'BUY',
      confidence: 89,
      currentPrice: 3750,
      targetPrice: 4200,
      stopLoss: 3500,
      expectedReturn: 12.0,
      timeHorizon: '3-5 weeks',
      pattern: 'Cup and Handle',
      strength: 'STRONG',
      riskLevel: 'MEDIUM',
      aiReasoning: [
        'Shanghai upgrade momentum building',
        'DeFi TVL increasing significantly',
        'Strong support at $3,600 level',
        'Institutional adoption accelerating'
      ],
      technicalIndicators: {
        rsi: 62,
        macd: 'Bullish',
        sma: 3680,
        volume: 'High'
      },
      marketSentiment: 85,
      newsImpact: 79,
      volumeProfile: 'Very High',
      isActive: true,
      isWatchlisted: true,
      generatedAt: '2025-08-07T14:15:00Z',
      expiresAt: '2025-08-07T18:15:00Z',
      accuracy: 91,
      exchange: 'Coinbase'
    },
    {
      id: '4',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      signal: 'HOLD',
      confidence: 72,
      currentPrice: 268.75,
      targetPrice: 280.00,
      stopLoss: 255.00,
      expectedReturn: 4.2,
      timeHorizon: '2-3 weeks',
      pattern: 'Consolidation',
      strength: 'WEAK',
      riskLevel: 'HIGH',
      aiReasoning: [
        'Mixed signals from production data',
        'Sideways trading pattern established',
        'Awaiting Q3 delivery numbers',
        'Volatility remains elevated'
      ],
      technicalIndicators: {
        rsi: 48,
        macd: 'Neutral',
        sma: 272.30,
        volume: 'Average'
      },
      marketSentiment: 55,
      newsImpact: 48,
      volumeProfile: 'Average',
      isActive: true,
      isWatchlisted: false,
      generatedAt: '2025-08-07T14:00:00Z',
      expiresAt: '2025-08-07T18:00:00Z',
      accuracy: 79,
      sector: 'Technology',
      exchange: 'NASDAQ'
    },
    {
      id: '5',
      symbol: 'EURUSD',
      name: 'Euro / US Dollar',
      signal: 'BUY',
      confidence: 85,
      currentPrice: 1.092,
      targetPrice: 1.105,
      stopLoss: 1.085,
      expectedReturn: 1.2,
      timeHorizon: '1-2 weeks',
      pattern: 'Bullish Wedge',
      strength: 'MODERATE',
      riskLevel: 'LOW',
      aiReasoning: [
        'ECB hawkish stance supporting Euro',
        'US Dollar showing weakness',
        'Technical breakout confirmed',
        'Risk-on sentiment favoring EUR'
      ],
      technicalIndicators: {
        rsi: 58,
        macd: 'Bullish',
        sma: 1.089,
        volume: 'High'
      },
      marketSentiment: 68,
      newsImpact: 72,
      volumeProfile: 'High',
      isActive: true,
      isWatchlisted: true,
      generatedAt: '2025-08-07T14:20:00Z',
      expiresAt: '2025-08-07T18:20:00Z',
      accuracy: 84,
      exchange: 'eToro'
    }
  ])

  const [marketIndicators] = useState<MarketIndicator[]>([
    {
      name: 'Market Fear & Greed',
      value: 72,
      change: 8,
      status: 'bullish',
      description: 'Greed territory - market optimism high'
    },
    {
      name: 'VIX (Volatility)',
      value: 18.5,
      change: -2.3,
      status: 'bullish',
      description: 'Low volatility indicates stable markets'
    },
    {
      name: 'BTC Dominance',
      value: 52.8,
      change: 1.2,
      status: 'neutral',
      description: 'Bitcoin maintaining market leadership'
    },
    {
      name: 'Risk Sentiment',
      value: 68,
      change: 5,
      status: 'bullish',
      description: 'Risk-on environment favors growth assets'
    }
  ])

  const [aiModels] = useState<AIModel[]>([
    {
      id: '1',
      name: 'Neural Prophet',
      type: 'neural_network',
      accuracy: 87.3,
      isActive: true,
      lastTrained: '2 hours ago',
      signalsGenerated: 1247,
      successRate: 84.2,
      specialty: 'Price prediction'
    },
    {
      id: '2',
      name: 'Quantum Alpha',
      type: 'quantum',
      accuracy: 91.7,
      isActive: true,
      lastTrained: '6 hours ago',
      signalsGenerated: 892,
      successRate: 89.1,
      specialty: 'Pattern recognition'
    },
    {
      id: '3',
      name: 'Ensemble Master',
      type: 'ensemble',
      accuracy: 85.9,
      isActive: true,
      lastTrained: '1 hour ago',
      signalsGenerated: 2156,
      successRate: 82.7,
      specialty: 'Risk assessment'
    },
    {
      id: '4',
      name: 'Deep Trader',
      type: 'deep_learning',
      accuracy: 89.4,
      isActive: false,
      lastTrained: '12 hours ago',
      signalsGenerated: 734,
      successRate: 86.8,
      specialty: 'Sentiment analysis'
    }
  ])

  const [selectedTab, setSelectedTab] = useState<'signals' | 'models' | 'indicators' | 'backtesting' | 'settings'>('signals')
  const [filterSignal, setFilterSignal] = useState<'all' | 'BUY' | 'SELL' | 'HOLD'>('all')
  const [filterConfidence, setFilterConfidence] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [filterRisk, setFilterRisk] = useState<'all' | 'LOW' | 'MEDIUM' | 'HIGH'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-400 bg-green-900/30 border-green-700/50'
      case 'SELL': return 'text-red-400 bg-red-900/30 border-red-700/50'
      case 'HOLD': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50'
      default: return 'text-gray-400 bg-gray-900/30 border-gray-700/50'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-400'
    if (confidence >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'HIGH': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const filteredSignals = aiSignals.filter(signal => {
    const matchesSearch = signal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signal.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSignal = filterSignal === 'all' || signal.signal === filterSignal
    const matchesConfidence = filterConfidence === 'all' ||
      (filterConfidence === 'high' && signal.confidence >= 85) ||
      (filterConfidence === 'medium' && signal.confidence >= 70 && signal.confidence < 85) ||
      (filterConfidence === 'low' && signal.confidence < 70)
    const matchesRisk = filterRisk === 'all' || signal.riskLevel === filterRisk

    return matchesSearch && matchesSignal && matchesConfidence && matchesRisk
  })

  const toggleWatchlist = (signalId: string) => {
    setAiSignals(prev => prev.map(signal =>
      signal.id === signalId
        ? { ...signal, isWatchlisted: !signal.isWatchlisted }
        : signal
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-950/50 backdrop-blur-sm border-b border-red-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">AI Trading Signals</h1>
                  <p className="text-red-300">AI-powered market analysis and trading recommendations</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Signal className="w-5 h-5 text-green-400" />
                  <span className="text-white font-bold text-xl">{filteredSignals.length} Active</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-400">AI Confidence: 86%</span>
                  <span className="text-blue-400">Models: 3 Active</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-colors ${autoRefresh
                      ? 'bg-green-800/50 text-green-400'
                      : 'text-red-400 hover:text-white hover:bg-red-800/50'
                    }`}
                  title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                >
                  <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`p-2 rounded-lg transition-colors ${notificationsEnabled
                      ? 'bg-blue-800/50 text-blue-400'
                      : 'text-red-400 hover:text-white hover:bg-red-800/50'
                    }`}
                  title={notificationsEnabled ? 'Notifications ON' : 'Notifications OFF'}
                >
                  {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </button>
                <button className="p-2 text-red-300 hover:text-white hover:bg-red-800/50 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-950/30 backdrop-blur-sm border border-red-700/50 rounded-xl mb-6">
          <div className="flex border-b border-red-800/30">
            {(['signals', 'models', 'indicators', 'backtesting', 'settings'] as const).map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-4 px-6 font-medium capitalize transition-colors ${selectedTab === tab
                    ? 'text-white border-b-2 border-red-400 bg-red-900/30'
                    : 'text-red-300 hover:text-white hover:bg-red-900/20'
                  }`}
              >
                {tab === 'signals' && <Signal className="w-4 h-4 mr-2" />}
                {tab === 'models' && <Brain className="w-4 h-4 mr-2" />}
                {tab === 'indicators' && <Gauge className="w-4 h-4 mr-2" />}
                {tab === 'backtesting' && <BarChart3 className="w-4 h-4 mr-2" />}
                {tab === 'settings' && <Settings className="w-4 h-4 mr-2" />}
                {tab}
              </motion.button>
            ))}
          </div>
        </div>

        {/* AI Signals Tab */}
        {selectedTab === 'signals' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-5 h-5 text-red-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search signals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-white placeholder-red-300 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <select
                    value={filterSignal}
                    onChange={(e) => setFilterSignal(e.target.value as any)}
                    className="px-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="all">All Signals</option>
                    <option value="BUY">Buy Signals</option>
                    <option value="SELL">Sell Signals</option>
                    <option value="HOLD">Hold Signals</option>
                  </select>

                  <select
                    value={filterConfidence}
                    onChange={(e) => setFilterConfidence(e.target.value as any)}
                    className="px-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="all">All Confidence</option>
                    <option value="high">High (85%+)</option>
                    <option value="medium">Medium (70-84%)</option>
                    <option value="low">Low (<70%)</option>
                  </select>

                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value as any)}
                    className="px-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-red-300 text-sm">{filteredSignals.length} signals found</span>
                </div>
              </div>
            </div>

            {/* AI Signals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSignals.map((signal, index) => (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6"
                >
                  {/* Signal Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{signal.symbol}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{signal.symbol}</h4>
                        <p className="text-red-300 text-sm">{signal.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getSignalColor(signal.signal)}`}>
                        {signal.signal}
                      </span>
                      <button
                        onClick={() => toggleWatchlist(signal.id)}
                        className={`p-1 rounded transition-colors ${signal.isWatchlisted
                            ? 'text-yellow-400 hover:text-yellow-300'
                            : 'text-red-400 hover:text-white'
                          }`}
                      >
                        {signal.isWatchlisted ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Price and Target Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-red-300 text-sm">Current Price</p>
                      <p className="text-white font-semibold">{formatCurrency(signal.currentPrice)}</p>
                    </div>
                    <div>
                      <p className="text-red-300 text-sm">Target Price</p>
                      <p className="text-white font-semibold">{formatCurrency(signal.targetPrice)}</p>
                    </div>
                    <div>
                      <p className="text-red-300 text-sm">Stop Loss</p>
                      <p className="text-red-400 font-semibold">{formatCurrency(signal.stopLoss)}</p>
                    </div>
                    <div>
                      <p className="text-red-300 text-sm">Expected Return</p>
                      <p className={`font-semibold ${signal.expectedReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(signal.expectedReturn)}
                      </p>
                    </div>
                  </div>

                  {/* Confidence and Risk */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-red-300 text-sm">Confidence</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-red-900/50 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${signal.confidence}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${getConfidenceColor(signal.confidence)}`}>
                            {signal.confidence}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-red-300 text-sm">Risk Level</p>
                        <span className={`text-sm font-medium ${getRiskColor(signal.riskLevel)}`}>
                          {signal.riskLevel}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-300 text-sm">Pattern</p>
                      <p className="text-white text-sm font-medium">{signal.pattern}</p>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="mb-4">
                    <p className="text-red-300 text-sm mb-2">AI Reasoning:</p>
                    <div className="space-y-1">
                      {signal.aiReasoning.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-white text-xs">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Indicators */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-red-400 text-xs">RSI</p>
                      <p className="text-white text-sm font-medium">{signal.technicalIndicators.rsi}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 text-xs">MACD</p>
                      <p className="text-white text-xs">{signal.technicalIndicators.macd}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 text-xs">Volume</p>
                      <p className="text-white text-xs">{signal.technicalIndicators.volume}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 text-xs">Sentiment</p>
                      <p className="text-white text-sm font-medium">{signal.marketSentiment}%</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-red-800/30">
                    <div className="flex items-center space-x-2 text-xs text-red-300">
                      <Clock className="w-3 h-3" />
                      <span>Expires in 2h 15m</span>
                      <span>•</span>
                      <span>{signal.accuracy}% accuracy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-red-400 hover:text-white hover:bg-red-800/30 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-400 hover:text-white hover:bg-red-800/30 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs placeholder - to be implemented modularly */}
        {selectedTab === 'models' && (
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">AI Models Management</h3>
              <p className="text-red-300">Coming in next update...</p>
            </div>
          </div>
        )}

        {selectedTab === 'indicators' && (
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="text-center py-12">
              <Gauge className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Market Indicators</h3>
              <p className="text-red-300">Coming in next update...</p>
            </div>
          </div>
        )}

        {selectedTab === 'backtesting' && (
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Strategy Backtesting</h3>
              <p className="text-red-300">Coming in next update...</p>
            </div>
          </div>
        )}

        {selectedTab === 'settings' && (
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">AI Settings</h3>
              <p className="text-red-300">Coming in next update...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
