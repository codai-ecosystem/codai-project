'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    BarChart3,
    Activity,
    Eye,
    Zap,
    Users,
    Bell,
    Settings,
    Search,
    Star,
    ArrowUpRight,
    ArrowDownRight,
    Brain,
    Target,
    Briefcase,
    PieChart,
    Clock,
    Shield,
    AlertTriangle,
    Filter,
    Play,
    Pause,
    MoreVertical,
    Info,
    ChevronRight,
    LineChart,
    Wallet,
    Globe
} from 'lucide-react'

interface StockData {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    volume: string
    marketCap: string
    aiScore: number
    recommendation: 'BUY' | 'SELL' | 'HOLD'
    sector: string
}

interface MarketStat {
    label: string
    value: string
    change: string
    changePercent: number
    icon: any
    color: string
}

interface AIInsight {
    id: string
    type: 'bullish' | 'bearish' | 'neutral'
    title: string
    description: string
    confidence: number
    timeframe: string
    impact: 'high' | 'medium' | 'low'
}

export default function StocAIPage() {
    const [activeStock, setActiveStock] = useState('AAPL')
    const [selectedTimeframe, setSelectedTimeframe] = useState('1D')
    const [isLiveData, setIsLiveData] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')

    const stockData: StockData[] = [
        {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            price: 175.43,
            change: 2.34,
            changePercent: 1.35,
            volume: '42.3M',
            marketCap: '2.8T',
            aiScore: 87,
            recommendation: 'BUY',
            sector: 'Technology'
        },
        {
            symbol: 'MSFT',
            name: 'Microsoft Corp.',
            price: 338.11,
            change: -1.23,
            changePercent: -0.36,
            volume: '28.1M',
            marketCap: '2.5T',
            aiScore: 92,
            recommendation: 'HOLD',
            sector: 'Technology'
        },
        {
            symbol: 'GOOGL',
            name: 'Alphabet Inc.',
            price: 128.45,
            change: 3.22,
            changePercent: 2.57,
            volume: '35.7M',
            marketCap: '1.6T',
            aiScore: 89,
            recommendation: 'BUY',
            sector: 'Technology'
        },
        {
            symbol: 'TSLA',
            name: 'Tesla Inc.',
            price: 248.91,
            change: 12.45,
            changePercent: 5.27,
            volume: '89.2M',
            marketCap: '792B',
            aiScore: 76,
            recommendation: 'HOLD',
            sector: 'Automotive'
        },
        {
            symbol: 'NVDA',
            name: 'NVIDIA Corp.',
            price: 721.33,
            change: 18.77,
            changePercent: 2.67,
            volume: '52.8M',
            marketCap: '1.8T',
            aiScore: 94,
            recommendation: 'BUY',
            sector: 'Semiconductors'
        },
        {
            symbol: 'AMZN',
            name: 'Amazon.com Inc.',
            price: 152.89,
            change: -2.11,
            changePercent: -1.36,
            volume: '45.6M',
            marketCap: '1.6T',
            aiScore: 83,
            recommendation: 'HOLD',
            sector: 'E-commerce'
        }
    ]

    const marketStats: MarketStat[] = [
        {
            label: 'Portfolio Value',
            value: '$847,832',
            change: '+$23,421',
            changePercent: 2.84,
            icon: Wallet,
            color: 'text-emerald-400'
        },
        {
            label: 'Active Positions',
            value: '24',
            change: '+3 today',
            changePercent: 14.29,
            icon: Briefcase,
            color: 'text-blue-400'
        },
        {
            label: 'AI Confidence',
            value: '89%',
            change: '+5% today',
            changePercent: 5.95,
            icon: Brain,
            color: 'text-purple-400'
        },
        {
            label: 'Daily P&L',
            value: '+$8,923',
            change: 'vs yesterday',
            changePercent: 3.21,
            icon: TrendingUp,
            color: 'text-emerald-400'
        },
    ]

    const aiInsights: AIInsight[] = [
        {
            id: '1',
            type: 'bullish',
            title: 'NVIDIA Breakthrough Signal',
            description: 'Strong momentum pattern detected with RSI divergence indicating continued upward movement',
            confidence: 94,
            timeframe: '2-5 days',
            impact: 'high'
        },
        {
            id: '2',
            type: 'bearish',
            title: 'Tesla Resistance Warning',
            description: 'Approaching key resistance level at $260 with declining volume suggesting potential reversal',
            confidence: 78,
            timeframe: '1-3 days',
            impact: 'medium'
        },
        {
            id: '3',
            type: 'neutral',
            title: 'Tech Sector Consolidation',
            description: 'Major tech stocks entering consolidation phase after recent gains',
            confidence: 85,
            timeframe: '1-2 weeks',
            impact: 'medium'
        }
    ]

    // Simulate real-time price updates
    useEffect(() => {
        if (!isLiveData) return

        const interval = setInterval(() => {
            // Simulate small price movements
            const randomChange = () => (Math.random() - 0.5) * 2
            // Update would happen here with real API
        }, 5000)

        return () => clearInterval(interval)
    }, [isLiveData])

    const filteredStocks = stockData.filter(stock => {
        const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stock.name.toLowerCase().includes(searchQuery.toLowerCase())

        if (filterType === 'all') return matchesSearch
        if (filterType === 'gainers') return matchesSearch && stock.change > 0
        if (filterType === 'losers') return matchesSearch && stock.change < 0
        if (filterType === 'high-ai') return matchesSearch && stock.aiScore > 85

        return matchesSearch
    })

    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation) {
            case 'BUY': return 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30'
            case 'SELL': return 'text-red-400 bg-red-400/20 border-red-400/30'
            case 'HOLD': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
            default: return 'text-slate-400 bg-slate-400/20 border-slate-400/30'
        }
    }

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'bullish': return 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30'
            case 'bearish': return 'text-red-400 bg-red-400/20 border-red-400/30'
            case 'neutral': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
            default: return 'text-slate-400 bg-slate-400/20 border-slate-400/30'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
            {/* Enhanced Navigation */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-50"
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
                                <BarChart3 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                    StocAI
                                </h1>
                                <p className="text-slate-300 text-sm">AI-Powered Trading Platform</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-8" role="status" aria-live="polite">
                                <div className={`w-2 h-2 rounded-full ${isLiveData ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                                <span className="text-sm text-slate-300" aria-label={`Data status: ${isLiveData ? 'Live updates active' : 'Offline mode'}`}>
                                    {isLiveData ? 'Live Data' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search stocks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={() => setIsLiveData(!isLiveData)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {isLiveData ? <Pause className="w-5 h-5 text-slate-300" /> : <Play className="w-5 h-5 text-slate-300" />}
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <Bell className="w-5 h-5 text-slate-300" />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <Settings className="w-5 h-5 text-slate-300" />
                            </button>
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Welcome to StocAI 📈
                        </h1>
                        <p className="text-slate-300 text-lg">
                            Your intelligent AI-powered trading companion
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                    >
                        <Zap className="w-5 h-5" />
                        <span>Execute AI Trade</span>
                    </motion.button>
                </motion.div>

                {/* Enhanced Market Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {marketStats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color === 'text-emerald-400' ? 'from-emerald-500 to-teal-500' :
                                    stat.color === 'text-blue-400' ? 'from-blue-500 to-cyan-500' :
                                        stat.color === 'text-purple-400' ? 'from-purple-500 to-pink-500' :
                                            'from-emerald-500 to-teal-500'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1 text-emerald-400">
                                        <ArrowUpRight className="w-4 h-4" />
                                        <span className="text-sm font-medium">{stat.changePercent}%</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-slate-300 text-sm mb-2">{stat.label}</p>
                                <span className="text-slate-400 text-sm">{stat.change}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Enhanced Stock List */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-white">Market Overview</h2>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setFilterType('all')}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${filterType === 'all' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-white/10'}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilterType('gainers')}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${filterType === 'gainers' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-white/10'}`}
                                    >
                                        Gainers
                                    </button>
                                    <button
                                        onClick={() => setFilterType('losers')}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${filterType === 'losers' ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:bg-white/10'}`}
                                    >
                                        Losers
                                    </button>
                                    <button
                                        onClick={() => setFilterType('high-ai')}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${filterType === 'high-ai' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:bg-white/10'}`}
                                    >
                                        AI Top Picks
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredStocks.map((stock, index) => (
                                    <motion.div
                                        key={stock.symbol}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => setActiveStock(stock.symbol)}
                                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${activeStock === stock.symbol
                                                ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/25'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                                    <span className="text-white font-bold text-sm">{stock.symbol}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white text-lg">{stock.symbol}</h3>
                                                    <p className="text-slate-300 text-sm">{stock.name}</p>
                                                    <p className="text-slate-400 text-xs">{stock.sector}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-white">${stock.price.toFixed(2)}</p>
                                                <div className="flex items-center space-x-1">
                                                    {stock.change > 0 ? (
                                                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                                    ) : (
                                                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                                                    )}
                                                    <span className={`text-sm font-medium ${stock.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-4 text-slate-400">
                                                    <span>Vol: {stock.volume}</span>
                                                    <span>Cap: {stock.marketCap}</span>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center space-x-1">
                                                        <Brain className="w-3 h-3 text-purple-400" />
                                                        <span className="text-purple-400 font-medium">{stock.aiScore}/100</span>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getRecommendationColor(stock.recommendation)}`}>
                                                        {stock.recommendation}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Enhanced Chart Section */}
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white flex items-center">
                                    <LineChart className="w-6 h-6 mr-2 text-blue-400" />
                                    Real-time Chart - {activeStock}
                                </h2>
                                <div className="flex items-center space-x-2">
                                    {['5M', '1H', '1D', '1W', '1M', '1Y'].map((timeframe) => (
                                        <button
                                            key={timeframe}
                                            onClick={() => setSelectedTimeframe(timeframe)}
                                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${selectedTimeframe === timeframe
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'text-slate-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {timeframe}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl flex items-center justify-center border border-white/10">
                                <div className="text-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <BarChart3 className="w-20 h-20 text-blue-400 mx-auto mb-4" />
                                    </motion.div>
                                    <p className="text-white text-xl font-medium mb-2">Advanced Trading Chart</p>
                                    <p className="text-slate-300 text-sm">Real-time data visualization with AI insights</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                                    >
                                        Enable Pro Charts
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced AI Assistant & Insights */}
                    <div className="space-y-8">
                        {/* AI Trading Assistant */}
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse">
                                    <Brain className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
                                    <p className="text-slate-300 text-sm">Advanced Market Analysis</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {aiInsights.map((insight, index) => (
                                    <motion.div
                                        key={insight.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-4 rounded-lg border ${getInsightColor(insight.type)} hover:bg-opacity-30 transition-all duration-300 cursor-pointer group`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                {insight.type === 'bullish' && <TrendingUp className="w-4 h-4" />}
                                                {insight.type === 'bearish' && <TrendingDown className="w-4 h-4" />}
                                                {insight.type === 'neutral' && <Activity className="w-4 h-4" />}
                                                <span className="text-sm font-medium">{insight.title}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs opacity-75">{insight.confidence}%</span>
                                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-white/80 mb-3">{insight.description}</p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="opacity-75">Timeframe: {insight.timeframe}</span>
                                            <span className={`px-2 py-1 rounded ${insight.impact === 'high' ? 'bg-red-400/20 text-red-400' :
                                                    insight.impact === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                                                        'bg-emerald-400/20 text-emerald-400'
                                                }`}>
                                                {insight.impact} impact
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h3 className="text-sm font-medium text-white mb-3 flex items-center">
                                    <PieChart className="w-4 h-4 mr-2 text-purple-400" />
                                    Market Sentiment Analysis
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-300">Bullish Sentiment</span>
                                        <div className="flex-1 mx-3 bg-slate-700 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '68%' }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="bg-emerald-400 h-2 rounded-full"
                                            />
                                        </div>
                                        <span className="text-sm text-white font-medium">68%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-300">Bearish Sentiment</span>
                                        <div className="flex-1 mx-3 bg-slate-700 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '32%' }}
                                                transition={{ duration: 1, delay: 0.7 }}
                                                className="bg-red-400 h-2 rounded-full"
                                            />
                                        </div>
                                        <span className="text-sm text-white font-medium">32%</span>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                                <Zap className="w-5 h-5" />
                                <span>Generate AI Trade Signal</span>
                            </motion.button>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Target className="w-5 h-5 mr-2 text-blue-400" />
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: Eye, label: 'Watchlist', color: 'from-blue-500 to-cyan-500' },
                                    { icon: Briefcase, label: 'Portfolio', color: 'from-emerald-500 to-teal-500' },
                                    { icon: AlertTriangle, label: 'Alerts', color: 'from-yellow-500 to-orange-500' },
                                    { icon: Shield, label: 'Risk Analysis', color: 'from-red-500 to-pink-500' },
                                ].map((action, index) => (
                                    <motion.button
                                        key={action.label}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group"
                                    >
                                        <div className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                                            <action.icon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Market News & Updates */}
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Globe className="w-5 h-5 mr-2 text-purple-400" />
                                Market Updates
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { title: 'Fed Rate Decision Pending', time: '2h ago', impact: 'high' },
                                    { title: 'Tech Earnings Beat Expectations', time: '4h ago', impact: 'medium' },
                                    { title: 'Global Markets Rally Continues', time: '6h ago', impact: 'low' },
                                ].map((news, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">
                                                    {news.title}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    <span className="text-slate-400 text-xs">{news.time}</span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${news.impact === 'high' ? 'bg-red-400/20 text-red-400' :
                                                    news.impact === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                                                        'bg-emerald-400/20 text-emerald-400'
                                                }`}>
                                                {news.impact}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}