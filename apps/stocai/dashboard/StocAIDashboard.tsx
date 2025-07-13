// StocAI Dashboard - AI Stock Trading Platform Dashboard

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, DollarSign, BarChart3,
  Eye, Target, Zap, Activity, AlertCircle,
  ChevronUp, ChevronDown, Star, ArrowRight,
  PieChart, LineChart, Wallet, Bell,
  Brain, Shield, Clock, Users
} from 'lucide-react'
import StocAILayout from '../layout/StocAILayout'
import { stocaiService, Stock, Portfolio, TradingSignal, MarketAnalysis } from '../services/stocaiService'
import { cn } from '../utils'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

// Dashboard widgets component
const DashboardWidget = ({
  title,
  children,
  className = "",
  icon: Icon,
  headerAction
}: {
  title: string
  children: React.ReactNode
  className?: string
  icon?: any
  headerAction?: React.ReactNode
}) => (
  <motion.div
    variants={itemVariants}
    className={cn(
      "bg-gradient-to-br from-emerald-950/50 to-green-950/50 backdrop-blur-xl border border-emerald-800/30 rounded-xl p-6",
      className
    )}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-5 h-5 text-emerald-400" />}
        <h3 className="text-lg font-semibold text-emerald-300">{title}</h3>
      </div>
      {headerAction}
    </div>
    {children}
  </motion.div>
)

// Market overview component
const MarketOverview = () => {
  const [marketData, setMarketData] = useState<any>(null)

  useEffect(() => {
    // Simulate real-time market data
    const updateMarketData = () => {
      setMarketData({
        sp500: { value: 5234.45, change: 23.67, changePercent: 0.45 },
        nasdaq: { value: 16789.23, change: -45.78, changePercent: -0.27 },
        dow: { value: 38456.78, change: 156.34, changePercent: 0.41 },
        vix: { value: 16.78, change: -1.23, changePercent: -6.83 }
      })
    }

    updateMarketData()
    const interval = setInterval(updateMarketData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!marketData) return <div className="animate-pulse h-20 bg-emerald-950/30 rounded-lg" />

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(marketData).map(([key, data]: [string, any]) => (
        <motion.div
          key={key}
          whileHover={{ scale: 1.02 }}
          className="bg-emerald-950/30 rounded-lg p-4 border border-emerald-800/20"
        >
          <div className="text-xs text-emerald-400 uppercase tracking-wide mb-1">
            {key === 'sp500' ? 'S&P 500' : key.toUpperCase()}
          </div>
          <div className="text-lg font-bold text-emerald-200">
            {data.value.toLocaleString()}
          </div>
          <div className={cn(
            "text-sm flex items-center",
            data.change >= 0 ? "text-green-400" : "text-red-400"
          )}>
            {data.change >= 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {Math.abs(data.change).toFixed(2)} ({Math.abs(data.changePercent).toFixed(2)}%)
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Portfolio summary component
const PortfolioSummary = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const data = await stocaiService.getPortfolio('user-001')
        setPortfolio(data)
      } catch (error) {
        console.error('Error loading portfolio:', error)
      }
    }

    loadPortfolio()
  }, [])

  if (!portfolio) return <div className="animate-pulse h-40 bg-emerald-950/30 rounded-lg" />

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-emerald-400 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-emerald-300">
            ${portfolio.totalValue.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-emerald-400 mb-1">Day Change</div>
          <div className={cn(
            "text-xl font-bold flex items-center",
            portfolio.totalGainLoss >= 0 ? "text-green-400" : "text-red-400"
          )}>
            {portfolio.totalGainLoss >= 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
            ${Math.abs(portfolio.totalGainLoss).toLocaleString()} ({Math.abs(portfolio.totalGainLossPercent).toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {portfolio.positions.slice(0, 3).map((position) => (
          <div key={position.id} className="flex items-center justify-between p-3 bg-emerald-950/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-white">{position.symbol}</span>
              </div>
              <div>
                <div className="font-medium text-emerald-200">{position.symbol}</div>
                <div className="text-xs text-emerald-400">{position.shares} shares</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-emerald-300">${position.totalValue.toLocaleString()}</div>
              <div className={cn(
                "text-xs",
                position.gainLoss >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {position.gainLoss >= 0 ? '+' : ''}${position.gainLoss.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Top movers component
const TopMovers = () => {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [type, setType] = useState<'gainers' | 'losers'>('gainers')

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const data = type === 'gainers'
          ? await stocaiService.getTopPerformers(5)
          : await stocaiService.getTopLosers(5)
        setStocks(data)
      } catch (error) {
        console.error('Error loading stocks:', error)
      }
    }

    loadStocks()
  }, [type])

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        {(['gainers', 'losers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setType(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              type === tab
                ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
            )}
          >
            {tab === 'gainers' ? 'Top Gainers' : 'Top Losers'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {stocks.map((stock, index) => (
          <motion.div
            key={stock.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-emerald-950/30 rounded-lg hover:bg-emerald-950/50 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{stock.symbol}</span>
                </div>
                {stock.aiScore >= 8 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-2 h-2 text-yellow-900" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-emerald-200 group-hover:text-emerald-100 transition-colors">
                  {stock.symbol}
                </div>
                <div className="text-xs text-emerald-400">${stock.price.toFixed(2)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                "font-medium",
                stock.changePercent >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </div>
              <div className="text-xs text-emerald-400">
                AI Score: {stock.aiScore}/10
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Trading signals component
const TradingSignals = () => {
  const [signals, setSignals] = useState<TradingSignal[]>([])

  useEffect(() => {
    const loadSignals = async () => {
      try {
        const data = await stocaiService.getTradingSignals()
        setSignals(data)
      } catch (error) {
        console.error('Error loading signals:', error)
      }
    }

    loadSignals()
  }, [])

  return (
    <div className="space-y-3">
      {signals.map((signal, index) => (
        <motion.div
          key={signal.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-800/20"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                signal.type === 'buy' ? "bg-green-500/20 text-green-400" :
                  signal.type === 'sell' ? "bg-red-500/20 text-red-400" :
                    "bg-yellow-500/20 text-yellow-400"
              )}>
                {signal.type === 'buy' ? <TrendingUp className="w-5 h-5" /> :
                  signal.type === 'sell' ? <TrendingDown className="w-5 h-5" /> :
                    <Target className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-semibold text-emerald-200">{signal.symbol}</div>
                <div className="text-xs text-emerald-400 capitalize">{signal.type} Signal</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-emerald-300">
                Strength: {signal.strength}/10
              </div>
              <div className="text-xs text-emerald-400">
                {(signal.confidence * 100).toFixed(0)}% confidence
              </div>
            </div>
          </div>

          <div className="text-sm text-emerald-300 mb-2">
            Target: ${signal.priceTarget.toFixed(2)} | Stop: ${signal.stopLoss.toFixed(2)}
          </div>

          <div className="text-xs text-emerald-400">
            {signal.reasoning[0]}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// AI Insights component
const AIInsights = () => {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const data = await stocaiService.getMarketAnalysis()
        setAnalysis(data)
      } catch (error) {
        console.error('Error loading analysis:', error)
      }
    }

    loadAnalysis()
  }, [])

  if (!analysis) return <div className="animate-pulse h-40 bg-emerald-950/30 rounded-lg" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600/10 to-green-600/10 rounded-lg border border-emerald-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-emerald-200">Market Sentiment</div>
            <div className="text-xs text-emerald-400">AI Analysis</div>
          </div>
        </div>
        <div className="text-right">
          <div className={cn(
            "text-lg font-bold capitalize",
            analysis.marketSentiment.includes('bullish') ? "text-green-400" :
              analysis.marketSentiment.includes('bearish') ? "text-red-400" :
                "text-yellow-400"
          )}>
            {analysis.marketSentiment.replace('_', ' ')}
          </div>
          <div className="text-xs text-emerald-400">VIX: {analysis.vixLevel}</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-emerald-300 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          AI Insights
        </h4>
        {analysis.aiInsights.slice(0, 3).map((insight, index) => (
          <div key={index} className="p-3 bg-emerald-950/30 rounded-lg text-sm text-emerald-200">
            {insight}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StocAIDashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <StocAILayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-emerald-950/30 rounded-lg w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-emerald-950/30 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </StocAILayout>
    )
  }

  return (
    <StocAILayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
              Trading Dashboard
            </h1>
            <p className="text-emerald-400 mt-1">AI-powered stock analysis and trading insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600/20 rounded-lg border border-emerald-500/30"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Market Overview */}
        <DashboardWidget title="Market Overview" icon={BarChart3}>
          <MarketOverview />
        </DashboardWidget>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Summary */}
          <DashboardWidget
            title="Portfolio Summary"
            icon={PieChart}
            headerAction={
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center"
              >
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </motion.button>
            }
          >
            <PortfolioSummary />
          </DashboardWidget>

          {/* Top Movers */}
          <DashboardWidget title="Market Movers" icon={TrendingUp}>
            <TopMovers />
          </DashboardWidget>

          {/* AI Insights */}
          <DashboardWidget title="AI Market Analysis" icon={Brain}>
            <AIInsights />
          </DashboardWidget>
        </div>

        {/* Trading Signals */}
        <DashboardWidget
          title="AI Trading Signals"
          icon={Zap}
          headerAction={
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center"
            >
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </motion.button>
          }
        >
          <TradingSignals />
        </DashboardWidget>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { name: 'Buy Order', icon: TrendingUp, color: 'text-green-400', bg: 'from-green-600/10 to-emerald-600/10', border: 'border-green-500/20' },
            { name: 'Sell Order', icon: TrendingDown, color: 'text-red-400', bg: 'from-red-600/10 to-pink-600/10', border: 'border-red-500/20' },
            { name: 'Set Alert', icon: Bell, color: 'text-yellow-400', bg: 'from-yellow-600/10 to-orange-600/10', border: 'border-yellow-500/20' },
            { name: 'Research', icon: Eye, color: 'text-blue-400', bg: 'from-blue-600/10 to-indigo-600/10', border: 'border-blue-500/20' }
          ].map((action, index) => (
            <motion.button
              key={action.name}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "p-4 rounded-xl border transition-all duration-200 group bg-gradient-to-br",
                action.bg, action.border
              )}
            >
              <action.icon className={cn("w-8 h-8 mx-auto mb-2", action.color)} />
              <div className="text-sm font-medium text-emerald-200 group-hover:text-emerald-100 transition-colors">
                {action.name}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </StocAILayout>
  )
}
