'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  Bot,
  Bell,
  Settings,
  User,
  Activity,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  Cpu,
  Brain,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  MoreHorizontal,
  Wallet,
  RefreshCw,
  PieChart,
  LineChart,
  CandlestickChart,
  Star,
  Shield,
  Layers,
  Signal,
  Database,
  Network,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';

// Trading Platform Interfaces
interface Portfolio {
  totalValue: number
  dailyPnL: number
  dailyPnLPercent: number
  positions: Position[]
}

interface Position {
  symbol: string
  amount: number
  value: number
  allocation: number
  pnl: string
  pnlPercent: string
}

interface AISignal {
  symbol: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  price: string
  change: string
  direction: 'up' | 'down'
  pattern: string
}

interface MarketData {
  symbol: string
  price: string
  change: string
  volume: string
  direction: 'up' | 'down'
  high24h: string
  low24h: string
}

interface AutoTrader {
  name: string
  status: 'active' | 'paused'
  profit: string
  trades: number
  winRate: string
  strategy: string
}

export default function TradingDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedPair, setSelectedPair] = useState('BTC/USDT')
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')

  const [aiSignals] = useState<AISignal[]>([
    { symbol: 'BTC/USDT', signal: 'BUY', confidence: 87, price: '$42,150', change: '+2.4%', direction: 'up', pattern: 'Bullish Breakout' },
    { symbol: 'ETH/USDT', signal: 'SELL', confidence: 73, price: '$2,580', change: '-1.2%', direction: 'down', pattern: 'Bearish Divergence' },
    { symbol: 'ADA/USDT', signal: 'HOLD', confidence: 65, price: '$0.485', change: '+0.8%', direction: 'up', pattern: 'Consolidation' }
  ])

  const [portfolio] = useState<Portfolio>({
    totalValue: 125750.50,
    dailyPnL: 2150.75,
    dailyPnLPercent: 1.74,
    positions: [
      { symbol: 'BTC', amount: 2.5, value: 105375, allocation: 84, pnl: '+$4,250', pnlPercent: '+4.2%' },
      { symbol: 'ETH', amount: 7.8, value: 20125, allocation: 16, pnl: '-$125', pnlPercent: '-0.6%' },
    ]
  })

  const [marketData] = useState<MarketData[]>([
    { symbol: 'BTC/USDT', price: '$42,150.00', change: '+2.4%', volume: '$1.2B', direction: 'up', high24h: '$43,200', low24h: '$40,800' },
    { symbol: 'ETH/USDT', price: '$2,580.00', change: '-1.2%', volume: '$856M', direction: 'down', high24h: '$2,650', low24h: '$2,520' },
    { symbol: 'BNB/USDT', price: '$310.50', change: '+0.8%', volume: '$245M', direction: 'up', high24h: '$315', low24h: '$305' },
    { symbol: 'ADA/USDT', price: '$0.485', change: '+3.1%', volume: '$123M', direction: 'up', high24h: '$0.492', low24h: '$0.465' },
    { symbol: 'SOL/USDT', price: '$65.20', change: '-0.5%', volume: '$98M', direction: 'down', high24h: '$67.80', low24h: '$64.15' }
  ])

  const [autoTraders] = useState<AutoTrader[]>([
    { name: 'AI Scalper Pro', status: 'active', profit: '+$1,250', trades: 45, winRate: '87%', strategy: 'Momentum' },
    { name: 'Grid Trader Elite', status: 'active', profit: '+$850', trades: 12, winRate: '75%', strategy: 'Grid Trading' },
    { name: 'Arbitrage Seeker', status: 'paused', profit: '+$320', trades: 8, winRate: '100%', strategy: 'Arbitrage' },
    { name: 'DCA Bot Master', status: 'active', profit: '+$540', trades: 23, winRate: '65%', strategy: 'DCA' }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleTrade = () => {
    if (amount && price) {
      console.log('Executing trade:', { selectedPair, orderType, amount, price })
      // Trade execution logic
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-pink-900">
      {/* Header */}
      <header className="bg-red-950/80 backdrop-blur-sm border-b border-red-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">X Trading</h1>
                <p className="text-red-300 text-xs">AI-Powered Exchange Layer</p>
              </div>
            </div>

            {/* Market Status */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm">Markets Open</span>
              </div>
              <div className="text-white text-sm">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Secure</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-red-300 hover:text-white hover:bg-red-800/50 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <button className="p-2 text-red-300 hover:text-white hover:bg-red-800/50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-red-300 text-sm font-medium">Total Portfolio</h3>
              <Wallet className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-white text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</p>
            <div className="flex items-center mt-2">
              {portfolio.dailyPnL > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400 mr-1" />
              )}
              <span className={`text-sm font-medium ${portfolio.dailyPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${Math.abs(portfolio.dailyPnL).toLocaleString()} ({portfolio.dailyPnLPercent > 0 ? '+' : ''}{portfolio.dailyPnLPercent}%)
              </span>
            </div>
          </div>

          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-red-300 text-sm font-medium">AI Signals</h3>
              <Brain className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-white text-2xl font-bold">12</p>
            <div className="flex items-center mt-2">
              <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm font-medium">8 Active</span>
            </div>
          </div>

          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-red-300 text-sm font-medium">Auto-Traders</h3>
              <Bot className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-white text-2xl font-bold">4</p>
            <div className="flex items-center mt-2">
              <Play className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm font-medium">3 Running</span>
            </div>
          </div>

          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-red-300 text-sm font-medium">24h Volume</h3>
              <Activity className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-white text-2xl font-bold">$45.2K</p>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm font-medium">+15.3%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trading Interface */}
          <div className="lg:col-span-2">
            {/* Quick Trade */}
            <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-red-400" />
                Quick Trade
                <span className="ml-auto text-sm text-red-300">Connected to 3 Exchanges</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-red-300 text-sm font-medium mb-2 block">Trading Pair</label>
                    <select 
                      value={selectedPair}
                      onChange={(e) => setSelectedPair(e.target.value)}
                      className="w-full bg-red-900/50 border border-red-700/50 rounded-lg text-white p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="BTC/USDT">BTC/USDT</option>
                      <option value="ETH/USDT">ETH/USDT</option>
                      <option value="ADA/USDT">ADA/USDT</option>
                      <option value="SOL/USDT">SOL/USDT</option>
                      <option value="BNB/USDT">BNB/USDT</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-red-300 text-sm font-medium mb-2 block">Order Type</label>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setOrderType('BUY')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                          orderType === 'BUY' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-green-600/30 text-green-300 hover:bg-green-600/50'
                        }`}
                      >
                        BUY
                      </button>
                      <button 
                        onClick={() => setOrderType('SELL')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                          orderType === 'SELL' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-red-600/30 text-red-300 hover:bg-red-600/50'
                        }`}
                      >
                        SELL
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-red-300 text-sm font-medium mb-2 block">Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-red-900/50 border border-red-700/50 rounded-lg text-white p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-300 text-sm">
                        {selectedPair.split('/')[0]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-red-300 text-sm font-medium mb-2 block">Price</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Market Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-red-900/50 border border-red-700/50 rounded-lg text-white p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-300 text-sm">
                        {selectedPair.split('/')[1]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-red-300">
                <span>Available Balance: $15,420.50</span>
                <span>Est. Total: ${amount && price ? (parseFloat(amount) * parseFloat(price)).toFixed(2) : '0.00'}</span>
              </div>
              <button 
                onClick={handleTrade}
                className="w-full mt-4 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50"
                disabled={!amount || !price}
              >
                Execute {orderType} Order
              </button>
            </div>
            {/* Market Data */}
            <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-red-400" />
                  Market Overview
                </h3>
                <div className="flex space-x-2">
                  <button className="p-2 text-red-300 hover:text-white hover:bg-red-800/50 rounded-lg transition-colors">
                    <LineChart className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-300 hover:text-white hover:bg-red-800/50 rounded-lg transition-colors">
                    <CandlestickChart className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-300 hover:text-white hover:bg-red-800/50 rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {marketData.map((market, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-red-800/30 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{market.symbol}</p>
                        <p className="text-red-300 text-sm">Vol: {market.volume}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">{market.price}</p>
                      <p className="text-red-300 text-xs">H: {market.high24h} L: {market.low24h}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        {market.direction === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        ) : (
                          <TrendingDownIcon className="w-4 h-4 text-red-400 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${market.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                          {market.change}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Signals & Automation */}
          <div className="lg:col-span-1">
            {/* AI Trading Signals */}
            <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-red-400" />
                AI Signals
                <span className="ml-auto">
                  <Signal className="w-4 h-4 text-green-400" />
                </span>
              </h3>
              <div className="space-y-4">
                {aiSignals.map((signal, index) => (
                  <div key={index} className="bg-red-900/30 rounded-lg p-4 border border-red-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{signal.symbol}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        signal.signal === 'BUY' ? 'bg-green-600 text-white' :
                        signal.signal === 'SELL' ? 'bg-red-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {signal.signal}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-red-300">Confidence: {signal.confidence}%</span>
                      <span className="text-white">{signal.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-300">{signal.pattern}</span>
                      <span className={`font-medium ${signal.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {signal.change}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="w-full bg-red-800/30 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-pink-500 h-1.5 rounded-full" 
                          style={{ width: `${signal.confidence}%` }}
                        ></div>
                      </div>
                      <button className="ml-2 text-red-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Auto-Traders */}
            <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-red-400" />
                Auto-Traders
                <span className="ml-auto text-sm text-green-400">3 Active</span>
              </h3>
              <div className="space-y-3">
                {autoTraders.map((bot, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-red-800/30 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${bot.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                      <div>
                        <p className="text-white font-medium text-sm">{bot.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-red-300">
                          <span>{bot.trades} trades</span>
                          <span>•</span>
                          <span>{bot.winRate} win</span>
                          <span>•</span>
                          <span>{bot.strategy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold text-sm">{bot.profit}</p>
                      <button className="text-red-400 hover:text-white transition-colors">
                        {bot.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-red-800/50 hover:bg-red-800/70 text-white py-2 rounded-lg text-sm transition-colors">
                Configure Auto-Traders
              </button>
            </div>

            {/* Portfolio Holdings */}
            <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-red-400" />
                Holdings
              </h3>
              <div className="space-y-3">
                {portfolio.positions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{position.symbol}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{position.amount} {position.symbol}</p>
                        <p className="text-red-300 text-xs">${position.value.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-300 text-sm">{position.allocation}%</p>
                      <p className={`text-xs font-medium ${position.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {position.pnl}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Monitor */}
            <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                Risk Monitor
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-red-300 text-sm">Portfolio Risk</span>
                  <span className="text-green-400 text-sm font-semibold">Low</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-300 text-sm">Max Drawdown</span>
                  <span className="text-yellow-400 text-sm font-semibold">-2.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-300 text-sm">Daily Limit Used</span>
                  <span className="text-white text-sm font-semibold">35%</span>
                </div>
                <div className="w-full bg-red-900/50 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-red-300 text-sm">Stop Loss Active</span>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-300 text-sm">AI Risk Score</span>
                  <span className="text-green-400 text-sm font-semibold">3.2/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
