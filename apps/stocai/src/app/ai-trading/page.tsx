'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  AlertTriangle,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Play,
  Pause,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  DollarSign,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Download,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Volume2,
  Star,
  Heart,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Globe,
  Cpu,
  Database
} from 'lucide-react'
import Link from 'next/link'

interface AIRecommendation {
  id: string
  symbol: string
  name: string
  action: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  targetPrice: number
  currentPrice: number
  expectedReturn: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  aiScore: number
  reasoning: string[]
  timeHorizon: string
  sector: string
  marketCap: string
  volume: number
  timestamp: string
}

interface AIStrategy {
  id: string
  name: string
  description: string
  type: 'MOMENTUM' | 'VALUE' | 'GROWTH' | 'DIVIDEND' | 'VOLATILITY'
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED'
  performance: number
  accuracy: number
  totalTrades: number
  winRate: number
  allocation: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  enabled: boolean
}

interface AIInsight {
  id: string
  type: 'OPPORTUNITY' | 'RISK' | 'MARKET' | 'TECHNICAL'
  title: string
  description: string
  confidence: number
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  symbols: string[]
  timestamp: string
  category: string
}

interface MarketSignal {
  id: string
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  strength: number
  description: string
  indicators: string[]
  timeframe: string
  confidence: number
}

export default function AITradingPage() {
  const [activeTab, setActiveTab] = useState('recommendations')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [aiTradingEnabled, setAiTradingEnabled] = useState(true)
  const [selectedStrategy, setSelectedStrategy] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  const [aiRecommendations] = useState<AIRecommendation[]>([
    {
      id: '1',
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      action: 'BUY',
      confidence: 94,
      targetPrice: 580.00,
      currentPrice: 512.34,
      expectedReturn: 13.2,
      riskLevel: 'MEDIUM',
      aiScore: 95,
      reasoning: [
        'Strong AI/ML market growth trajectory',
        'Excellent Q3 earnings beat expectations',
        'Data center revenue acceleration',
        'Technical breakout above resistance'
      ],
      timeHorizon: '3-6 months',
      sector: 'Technology',
      marketCap: '$1.26T',
      volume: 45680000,
      timestamp: '2025-08-07T14:30:00Z'
    },
    {
      id: '2',
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      action: 'SELL',
      confidence: 78,
      targetPrice: 210.00,
      currentPrice: 238.45,
      expectedReturn: -11.9,
      riskLevel: 'HIGH',
      aiScore: 75,
      reasoning: [
        'Valuation concerns at current levels',
        'EV market competition intensifying',
        'Production guidance uncertainty',
        'Technical resistance at $240 level'
      ],
      timeHorizon: '1-3 months',
      sector: 'Automotive',
      marketCap: '$758B',
      volume: 89350000,
      timestamp: '2025-08-07T14:25:00Z'
    },
    {
      id: '3',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      action: 'HOLD',
      confidence: 85,
      targetPrice: 190.00,
      currentPrice: 182.41,
      expectedReturn: 4.2,
      riskLevel: 'LOW',
      aiScore: 92,
      reasoning: [
        'Stable dividend and buyback program',
        'Services revenue growth continues',
        'AI integration in products promising',
        'Strong balance sheet position'
      ],
      timeHorizon: '6-12 months',
      sector: 'Technology',
      marketCap: '$2.89T',
      volume: 67420000,
      timestamp: '2025-08-07T14:20:00Z'
    },
    {
      id: '4',
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      action: 'BUY',
      confidence: 89,
      targetPrice: 380.00,
      currentPrice: 325.89,
      expectedReturn: 16.6,
      riskLevel: 'MEDIUM',
      aiScore: 86,
      reasoning: [
        'Metaverse investments showing ROI',
        'Ad revenue recovery accelerating',
        'Cost optimization initiatives working',
        'VR/AR market leadership position'
      ],
      timeHorizon: '3-9 months',
      sector: 'Technology',
      marketCap: '$825B',
      volume: 23450000,
      timestamp: '2025-08-07T14:15:00Z'
    },
    {
      id: '5',
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      action: 'BUY',
      confidence: 82,
      targetPrice: 175.00,
      currentPrice: 153.37,
      expectedReturn: 14.1,
      riskLevel: 'MEDIUM',
      aiScore: 82,
      reasoning: [
        'AWS growth momentum continues',
        'E-commerce margin improvements',
        'AI services gaining traction',
        'Prime membership expansion'
      ],
      timeHorizon: '6-12 months',
      sector: 'E-commerce',
      marketCap: '$1.59T',
      volume: 34680000,
      timestamp: '2025-08-07T14:10:00Z'
    }
  ])

  const [aiStrategies] = useState<AIStrategy[]>([
    {
      id: '1',
      name: 'Momentum Alpha',
      description: 'AI-driven momentum strategy targeting trending stocks with strong technical indicators',
      type: 'MOMENTUM',
      status: 'ACTIVE',
      performance: 18.5,
      accuracy: 74,
      totalTrades: 156,
      winRate: 68,
      allocation: 25,
      riskLevel: 'MEDIUM',
      enabled: true
    },
    {
      id: '2',
      name: 'Value Discovery',
      description: 'Deep value analysis using AI to identify undervalued opportunities',
      type: 'VALUE',
      status: 'ACTIVE',
      performance: 12.3,
      accuracy: 82,
      totalTrades: 89,
      winRate: 76,
      allocation: 20,
      riskLevel: 'LOW',
      enabled: true
    },
    {
      id: '3',
      name: 'Growth Accelerator',
      description: 'AI-powered growth stock selection with earnings momentum focus',
      type: 'GROWTH',
      status: 'PAUSED',
      performance: 24.7,
      accuracy: 69,
      totalTrades: 203,
      winRate: 65,
      allocation: 30,
      riskLevel: 'HIGH',
      enabled: false
    },
    {
      id: '4',
      name: 'Dividend Hunter',
      description: 'AI-enhanced dividend strategy for income-focused investing',
      type: 'DIVIDEND',
      status: 'ACTIVE',
      performance: 8.9,
      accuracy: 85,
      totalTrades: 67,
      winRate: 78,
      allocation: 15,
      riskLevel: 'LOW',
      enabled: true
    },
    {
      id: '5',
      name: 'Volatility Harvester',
      description: 'Advanced AI strategy exploiting market volatility patterns',
      type: 'VOLATILITY',
      status: 'STOPPED',
      performance: -2.1,
      accuracy: 58,
      totalTrades: 234,
      winRate: 52,
      allocation: 10,
      riskLevel: 'HIGH',
      enabled: false
    }
  ])

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'OPPORTUNITY',
      title: 'AI Sector Breakout Pattern Detected',
      description: 'Multiple AI-related stocks showing coordinated bullish signals with high probability of sector rotation.',
      confidence: 92,
      impact: 'HIGH',
      symbols: ['NVDA', 'AMD', 'GOOGL'],
      timestamp: '2025-08-07T14:35:00Z',
      category: 'Technical Analysis'
    },
    {
      id: '2',
      type: 'RISK',
      title: 'Elevated Market Volatility Expected',
      description: 'AI models predict increased volatility in the next 5-7 trading days due to earnings calendar concentration.',
      confidence: 87,
      impact: 'MEDIUM',
      symbols: ['SPY', 'QQQ', 'IWM'],
      timestamp: '2025-08-07T14:30:00Z',
      category: 'Market Risk'
    },
    {
      id: '3',
      type: 'MARKET',
      title: 'Bond Yield Inflection Point',
      description: 'AI analysis suggests 10-year treasury yields approaching key technical level with equity market implications.',
      confidence: 78,
      impact: 'HIGH',
      symbols: ['TLT', 'SPY'],
      timestamp: '2025-08-07T14:25:00Z',
      category: 'Macro Analysis'
    },
    {
      id: '4',
      type: 'TECHNICAL',
      title: 'Support Level Test in Progress',
      description: 'Major indices testing critical support levels. AI models suggest high probability of bounce or breakdown.',
      confidence: 84,
      impact: 'MEDIUM',
      symbols: ['SPY', 'QQQ'],
      timestamp: '2025-08-07T14:20:00Z',
      category: 'Technical Analysis'
    }
  ])

  const [marketSignals] = useState<MarketSignal[]>([
    {
      id: '1',
      signal: 'BULLISH',
      strength: 78,
      description: 'Strong bullish momentum in technology sector',
      indicators: ['RSI Oversold Recovery', 'Volume Surge', 'Breakout Confirmation'],
      timeframe: '1-2 weeks',
      confidence: 85
    },
    {
      id: '2',
      signal: 'BEARISH',
      strength: 65,
      description: 'Defensive rotation pattern emerging',
      indicators: ['VIX Elevation', 'Yield Curve Flattening', 'Sector Rotation'],
      timeframe: '2-4 weeks',
      confidence: 72
    },
    {
      id: '3',
      signal: 'NEUTRAL',
      strength: 45,
      description: 'Mixed signals in mid-cap space',
      indicators: ['Sideways Trend', 'Volume Decline', 'Range Bound'],
      timeframe: '1-3 weeks',
      confidence: 58
    }
  ])

  const tabs = [
    { id: 'recommendations', label: 'AI Recommendations', icon: Bot },
    { id: 'strategies', label: 'AI Strategies', icon: Brain },
    { id: 'insights', label: 'Market Insights', icon: Zap },
    { id: 'signals', label: 'AI Signals', icon: Activity },
    { id: 'backtesting', label: 'Backtesting', icon: BarChart3 },
    { id: 'settings', label: 'AI Settings', icon: Settings }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 bg-green-100'
      case 'SELL': return 'text-red-600 bg-red-100'
      case 'HOLD': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HIGH': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600'
    if (confidence >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100'
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100'
      case 'STOPPED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BULLISH': return 'text-green-600 bg-green-100'
      case 'BEARISH': return 'text-red-600 bg-red-100'
      case 'NEUTRAL': return 'text-gray-600 bg-gray-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Trading Assistant</h1>
                  <p className="text-sm text-gray-500">Powered by advanced machine learning</p>
                </div>
              </Link>
            </div>

            {/* Header Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">94%</div>
                <div className="text-xs text-gray-500">AI Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">12</div>
                <div className="text-xs text-gray-500">Active Signals</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">$2.4M</div>
                <div className="text-xs text-gray-500">AI-Managed</div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">AI Trading</span>
                <button
                  onClick={() => setAiTradingEnabled(!aiTradingEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${aiTradingEnabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${aiTradingEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <Link href="/settings" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                <p className="text-2xl font-bold text-green-600">87.3%</p>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Returns</p>
                <p className="text-2xl font-bold text-blue-600">+23.8%</p>
                <p className="text-sm text-gray-500">YTD performance</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Strategies</p>
                <p className="text-2xl font-bold text-purple-600">8</p>
                <p className="text-sm text-gray-500">Currently running</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Score</p>
                <p className="text-2xl font-bold text-orange-600">6.2</p>
                <p className="text-sm text-gray-500">Out of 10</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* AI Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option value="all">All Actions</option>
                      <option value="BUY">Buy</option>
                      <option value="SELL">Sell</option>
                      <option value="HOLD">Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="LOW">Low Risk</option>
                      <option value="MEDIUM">Medium Risk</option>
                      <option value="HIGH">High Risk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confidence</label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option value="all">All Levels</option>
                      <option value="high">High (85%+)</option>
                      <option value="medium">Medium (70-85%)</option>
                      <option value="low">Low (<70%)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh AI</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
              {aiRecommendations.map((rec) => (
                <div key={rec.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {rec.symbol.substring(0, 2)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{rec.symbol}</h3>
                        <p className="text-sm text-gray-500">{rec.name}</p>
                        <p className="text-xs text-gray-400">{rec.sector} • {rec.marketCap}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getActionColor(rec.action)}`}>
                        {rec.action}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(rec.riskLevel)}`}>
                        {rec.riskLevel} RISK
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Current Price</div>
                      <div className="text-lg font-semibold text-gray-900">{formatCurrency(rec.currentPrice)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Target Price</div>
                      <div className="text-lg font-semibold text-gray-900">{formatCurrency(rec.targetPrice)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Expected Return</div>
                      <div className={`text-lg font-semibold ${rec.expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(rec.expectedReturn)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">AI Confidence</div>
                      <div className={`text-lg font-semibold ${getConfidenceColor(rec.confidence)}`}>
                        {rec.confidence}%
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">AI Reasoning:</h4>
                    <ul className="space-y-1">
                      {rec.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Time Horizon: {rec.timeHorizon}</span>
                      <span>AI Score: {rec.aiScore}/100</span>
                      <span>Volume: {(rec.volume / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Bookmark className="h-5 w-5" />
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Execute Trade
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Strategies Tab */}
        {activeTab === 'strategies' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {aiStrategies.map((strategy) => (
                <div key={strategy.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{strategy.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{strategy.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(strategy.status)}`}>
                        {strategy.status}
                      </span>
                      <button
                        onClick={() => {/* Toggle strategy */ }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${strategy.enabled ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${strategy.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Performance</div>
                      <div className={`text-lg font-semibold ${strategy.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(strategy.performance)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Accuracy</div>
                      <div className="text-lg font-semibold text-gray-900">{strategy.accuracy}%</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Win Rate</div>
                      <div className="text-lg font-semibold text-blue-600">{strategy.winRate}%</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Allocation</div>
                      <div className="text-lg font-semibold text-purple-600">{strategy.allocation}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Trades: {strategy.totalTrades}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRiskColor(strategy.riskLevel)}`}>
                        {strategy.riskLevel} RISK
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <BarChart3 className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Settings className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Other tabs content placeholder */}
        {!['recommendations', 'strategies'].includes(activeTab) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center"
          >
            <div className="text-gray-500 mb-4">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold">Advanced AI Features</h3>
              <p>This section will be available in the full implementation.</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <Bot className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">AI Trading Engine</h3>
              <p className="text-green-100 text-sm mb-4">Advanced machine learning algorithms for intelligent trading decisions.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Learn More <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <Brain className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Strategy Optimization</h3>
              <p className="text-blue-100 text-sm mb-4">AI-powered strategy development and real-time performance optimization.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Optimize Now <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <Shield className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Risk Management</h3>
              <p className="text-purple-100 text-sm mb-4">Intelligent risk assessment and automated portfolio protection.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Manage Risk <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
