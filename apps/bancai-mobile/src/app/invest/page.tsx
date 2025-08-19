'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    ArrowLeft,
    Plus,
    Eye,
    EyeOff,
    PieChart,
    BarChart3,
    DollarSign,
    Star,
    Clock,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Zap,
    Shield,
    Globe,
    Building,
    Briefcase
} from 'lucide-react'

interface Investment {
    id: string
    name: string
    symbol: string
    type: 'stock' | 'etf' | 'crypto' | 'bond' | 'mutual_fund'
    amount: number
    shares: number
    currentPrice: number
    dayChange: number
    dayChangePercent: number
    totalReturn: number
    totalReturnPercent: number
    sector: string
    riskLevel: 'low' | 'medium' | 'high'
}

interface Portfolio {
    totalValue: number
    totalInvested: number
    totalReturn: number
    totalReturnPercent: number
    dayChange: number
    dayChangePercent: number
    diversity: {
        stocks: number
        etfs: number
        crypto: number
        bonds: number
    }
}

interface MarketNews {
    id: string
    title: string
    summary: string
    time: string
    sentiment: 'positive' | 'negative' | 'neutral'
    impact: 'high' | 'medium' | 'low'
}

export default function InvestPage() {
    const [showBalance, setShowBalance] = useState(true)
    const [selectedTab, setSelectedTab] = useState('portfolio')

    const [portfolio] = useState<Portfolio>({
        totalValue: 45678.90,
        totalInvested: 42000.00,
        totalReturn: 3678.90,
        totalReturnPercent: 8.76,
        dayChange: 234.56,
        dayChangePercent: 0.52,
        diversity: {
            stocks: 65,
            etfs: 20,
            crypto: 10,
            bonds: 5
        }
    })

    const [investments] = useState<Investment[]>([
        {
            id: '1',
            name: 'Apple Inc.',
            symbol: 'AAPL',
            type: 'stock',
            amount: 8945.67,
            shares: 52.3,
            currentPrice: 171.12,
            dayChange: 2.34,
            dayChangePercent: 1.39,
            totalReturn: 1234.56,
            totalReturnPercent: 16.02,
            sector: 'Technology',
            riskLevel: 'medium'
        },
        {
            id: '2',
            name: 'Vanguard S&P 500 ETF',
            symbol: 'VOO',
            type: 'etf',
            amount: 12567.89,
            shares: 31.2,
            currentPrice: 402.83,
            dayChange: 1.67,
            dayChangePercent: 0.42,
            totalReturn: 2345.67,
            totalReturnPercent: 22.92,
            sector: 'Diversified',
            riskLevel: 'low'
        },
        {
            id: '3',
            name: 'Bitcoin',
            symbol: 'BTC',
            type: 'crypto',
            amount: 6789.12,
            shares: 0.1567,
            currentPrice: 43234.56,
            dayChange: -567.89,
            dayChangePercent: -1.31,
            totalReturn: 567.89,
            totalReturnPercent: 9.13,
            sector: 'Cryptocurrency',
            riskLevel: 'high'
        },
        {
            id: '4',
            name: 'Microsoft Corporation',
            symbol: 'MSFT',
            type: 'stock',
            amount: 7234.56,
            shares: 18.9,
            currentPrice: 382.67,
            dayChange: 4.23,
            dayChangePercent: 1.12,
            totalReturn: 891.23,
            totalReturnPercent: 14.08,
            sector: 'Technology',
            riskLevel: 'medium'
        },
        {
            id: '5',
            name: 'iShares Core US Aggregate Bond ETF',
            symbol: 'AGG',
            type: 'etf',
            amount: 3456.78,
            shares: 33.7,
            currentPrice: 102.56,
            dayChange: -0.12,
            dayChangePercent: -0.12,
            totalReturn: -123.45,
            totalReturnPercent: -3.45,
            sector: 'Bonds',
            riskLevel: 'low'
        }
    ])

    const [marketNews] = useState<MarketNews[]>([
        {
            id: '1',
            title: 'Tech Stocks Rally on AI Optimism',
            summary: 'Major technology companies see gains as investors remain bullish on artificial intelligence prospects.',
            time: '2 hours ago',
            sentiment: 'positive',
            impact: 'high'
        },
        {
            id: '2',
            title: 'Federal Reserve Maintains Interest Rates',
            summary: 'Central bank keeps rates steady, signaling cautious approach to monetary policy.',
            time: '5 hours ago',
            sentiment: 'neutral',
            impact: 'medium'
        },
        {
            id: '3',
            title: 'Cryptocurrency Market Shows Volatility',
            summary: 'Bitcoin and major altcoins experience mixed trading as regulatory clarity remains uncertain.',
            time: '1 day ago',
            sentiment: 'negative',
            impact: 'medium'
        }
    ])

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'stock': return <TrendingUp className="w-4 h-4" />
            case 'etf': return <PieChart className="w-4 h-4" />
            case 'crypto': return <Zap className="w-4 h-4" />
            case 'bond': return <Shield className="w-4 h-4" />
            case 'mutual_fund': return <Briefcase className="w-4 h-4" />
            default: return <DollarSign className="w-4 h-4" />
        }
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'low': return 'text-green-600 bg-green-100'
            case 'medium': return 'text-yellow-600 bg-yellow-100'
            case 'high': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'border-l-green-500 bg-green-50'
            case 'negative': return 'border-l-red-500 bg-red-50'
            case 'neutral': return 'border-l-blue-500 bg-blue-50'
            default: return 'border-l-gray-500 bg-gray-50'
        }
    }

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
                            <h1 className="text-lg font-bold">Investments</h1>
                            <p className="text-green-100 text-sm">Grow your wealth with AI insights</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowBalance(!showBalance)}
                            className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
                        >
                            {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                        <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Portfolio Summary */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-center mb-4">
                        <div className="text-2xl font-bold">
                            {showBalance ? `$${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                        </div>
                        <div className="text-sm text-green-100">Portfolio Value</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="text-sm text-green-100">Today's Change</div>
                            <div className={`text-lg font-semibold ${portfolio.dayChange >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                                {portfolio.dayChange >= 0 ? '+' : ''}${portfolio.dayChange.toFixed(2)}
                            </div>
                            <div className={`text-xs ${portfolio.dayChangePercent >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                                ({portfolio.dayChangePercent >= 0 ? '+' : ''}{portfolio.dayChangePercent.toFixed(2)}%)
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-green-100">Total Return</div>
                            <div className={`text-lg font-semibold ${portfolio.totalReturn >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                                {showBalance ? `${portfolio.totalReturn >= 0 ? '+' : ''}$${Math.abs(portfolio.totalReturn).toFixed(2)}` : '••••••'}
                            </div>
                            <div className={`text-xs ${portfolio.totalReturnPercent >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                                ({portfolio.totalReturnPercent >= 0 ? '+' : ''}{portfolio.totalReturnPercent.toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="px-4 py-6">
                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
                        <div className="flex space-x-1">
                            {[
                                { id: 'portfolio', label: 'Portfolio', icon: <PieChart className="w-4 h-4" /> },
                                { id: 'watchlist', label: 'Watchlist', icon: <Star className="w-4 h-4" /> },
                                { id: 'news', label: 'Market News', icon: <Globe className="w-4 h-4" /> }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedTab === tab.id
                                            ? 'bg-green-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Portfolio Tab */}
                {selectedTab === 'portfolio' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Diversity Chart */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Stocks</span>
                                    </div>
                                    <span className="font-semibold">{portfolio.diversity.stocks}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">ETFs</span>
                                    </div>
                                    <span className="font-semibold">{portfolio.diversity.etfs}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Crypto</span>
                                    </div>
                                    <span className="font-semibold">{portfolio.diversity.crypto}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Bonds</span>
                                    </div>
                                    <span className="font-semibold">{portfolio.diversity.bonds}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Holdings */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900">Your Holdings</h3>
                            {investments.map((investment, index) => (
                                <motion.div
                                    key={investment.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 rounded-full text-green-600">
                                                {getTypeIcon(investment.type)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{investment.name}</div>
                                                <div className="text-sm text-gray-600">{investment.symbol} • {investment.shares} shares</div>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(investment.riskLevel)}`}>
                                                        {investment.riskLevel} risk
                                                    </span>
                                                    <span className="text-xs text-gray-500">{investment.sector}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900">
                                                {showBalance ? `$${investment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                                            </div>
                                            <div className={`text-sm flex items-center ${investment.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {investment.dayChange >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                                {investment.dayChange >= 0 ? '+' : ''}${Math.abs(investment.dayChange).toFixed(2)}
                                            </div>
                                            <div className={`text-xs ${investment.totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {investment.totalReturnPercent >= 0 ? '+' : ''}{investment.totalReturnPercent.toFixed(2)}% total
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* AI Recommendations */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">AI Investment Insights</h3>

                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">Portfolio Rebalancing</div>
                                        <div className="text-sm text-green-100">Consider reducing tech exposure by 5%</div>
                                    </div>
                                    <Target className="w-8 h-8 text-green-200" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">Tax Optimization</div>
                                        <div className="text-sm text-blue-100">Harvest losses to offset gains</div>
                                    </div>
                                    <Shield className="w-8 h-8 text-blue-200" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Watchlist Tab */}
                {selectedTab === 'watchlist' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-12"
                    >
                        <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Your Watchlist</h3>
                        <p className="text-gray-600 mb-6">Track stocks, ETFs, and crypto you're interested in</p>
                        <button className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors">
                            Add to Watchlist
                        </button>
                    </motion.div>
                )}

                {/* Market News Tab */}
                {selectedTab === 'news' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <h3 className="text-lg font-semibold text-gray-900">Market News & Analysis</h3>
                        {marketNews.map((news, index) => (
                            <motion.div
                                key={news.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border-l-4 ${getSentimentColor(news.sentiment)}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900 flex-1 mr-2">{news.title}</h4>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${news.impact === 'high' ? 'bg-red-100 text-red-600' :
                                                news.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-green-100 text-green-600'
                                            }`}>
                                            {news.impact} impact
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{news.summary}</p>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{news.time}</span>
                                    </div>
                                    <button className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                                        <span>Read More</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Investment CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8"
                >
                    <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span className="font-semibold">Start Investing</span>
                        </div>
                        <div className="text-sm text-green-100 mt-1">Begin your investment journey with AI guidance</div>
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
