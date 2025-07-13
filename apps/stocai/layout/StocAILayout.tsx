// StocAI Layout Component - AI Stock Trading Platform Layout

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../utils'
import {
  TrendingUp, TrendingDown, DollarSign, BarChart3,
  Search, Bell, User, Settings, Menu, X,
  Wallet, Activity, Target, AlertCircle,
  PieChart, LineChart, Zap, Shield
} from 'lucide-react'

// StocAI-specific navigation items with trading platform focus
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: BarChart3, color: 'text-emerald-400' },
  { name: 'Portfolio', href: '/portfolio', icon: PieChart, color: 'text-blue-400' },
  { name: 'Trading', href: '/trading', icon: TrendingUp, color: 'text-green-400' },
  { name: 'Analysis', href: '/analysis', icon: LineChart, color: 'text-purple-400' },
  { name: 'Watchlist', href: '/watchlist', icon: Target, color: 'text-orange-400' },
  { name: 'Signals', href: '/signals', icon: Zap, color: 'text-yellow-400' },
  { name: 'News', href: '/news', icon: Activity, color: 'text-indigo-400' },
  { name: 'Wallet', href: '/wallet', icon: Wallet, color: 'text-teal-400' }
]

// Quick action items for trading platform
const quickActions = [
  { name: 'Buy Order', icon: TrendingUp, color: 'text-green-400', action: 'buy' },
  { name: 'Sell Order', icon: TrendingDown, color: 'text-red-400', action: 'sell' },
  { name: 'Set Alert', icon: Bell, color: 'text-yellow-400', action: 'alert' },
  { name: 'Analyze Stock', icon: BarChart3, color: 'text-blue-400', action: 'analyze' }
]

interface StocAILayoutProps {
  children: React.ReactNode
}

export default function StocAILayout({ children }: StocAILayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeItem, setActiveItem] = useState('Dashboard')
  const [notifications, setNotifications] = useState(3)
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | 'pre-market' | 'after-hours'>('open')

  useEffect(() => {
    setMounted(true)

    // Simulate real-time market status updates
    const checkMarketStatus = () => {
      const now = new Date()
      const hour = now.getHours()

      if (hour >= 9 && hour < 16) {
        setMarketStatus('open')
      } else if (hour >= 4 && hour < 9) {
        setMarketStatus('pre-market')
      } else if (hour >= 16 && hour < 20) {
        setMarketStatus('after-hours')
      } else {
        setMarketStatus('closed')
      }
    }

    checkMarketStatus()
    const interval = setInterval(checkMarketStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return null
  }

  const getMarketStatusColor = () => {
    switch (marketStatus) {
      case 'open': return 'text-green-400'
      case 'pre-market': return 'text-yellow-400'
      case 'after-hours': return 'text-orange-400'
      case 'closed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getMarketStatusText = () => {
    switch (marketStatus) {
      case 'open': return 'Market Open'
      case 'pre-market': return 'Pre-Market'
      case 'after-hours': return 'After Hours'
      case 'closed': return 'Market Closed'
      default: return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 text-white overflow-hidden">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-green-800/30 to-teal-900/20" />

        {/* Animated trading chart patterns */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-emerald-400/10 to-green-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-teal-400/10 to-emerald-500/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Stock ticker pattern */}
        <motion.div
          className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500/20 via-emerald-400/30 to-teal-500/20"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 border-b border-emerald-800/30 backdrop-blur-xl bg-emerald-950/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Market Status */}
            <div className="flex items-center space-x-6">
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                    StocAI
                  </h1>
                  <p className="text-xs text-emerald-300/70">AI Trading Platform</p>
                </div>
              </motion.div>

              {/* Market Status */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/30">
                <motion.div
                  className={cn("w-2 h-2 rounded-full", getMarketStatusColor())}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className={cn("text-xs font-medium", getMarketStatusColor())}>
                  {getMarketStatusText()}
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Search stocks, symbols..."
                  className="w-full pl-10 pr-4 py-2 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-white placeholder-emerald-300/50 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions - Desktop */}
              <div className="hidden lg:flex items-center space-x-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/30 hover:border-emerald-600/50 transition-all duration-200 group"
                    title={action.name}
                  >
                    <action.icon className={cn("w-4 h-4", action.color)} />
                  </motion.button>
                ))}
              </div>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/30 hover:border-emerald-600/50 transition-all duration-200"
              >
                <Bell className="w-5 h-5 text-emerald-400" />
                {notifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.button>

              {/* User Menu */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/30 hover:border-emerald-600/50 transition-all duration-200"
              >
                <User className="w-5 h-5 text-emerald-400" />
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/30"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Menu className="w-5 h-5 text-emerald-400" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="hidden md:flex w-64 flex-col border-r border-emerald-800/30 backdrop-blur-xl bg-emerald-950/30"
        >
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveItem(item.name)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  activeItem === item.name
                    ? "bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : "hover:bg-emerald-950/50 border border-transparent hover:border-emerald-800/30"
                )}
              >
                <item.icon className={cn("w-5 h-5", item.color, activeItem === item.name ? "scale-110" : "")} />
                <span className={cn(
                  "font-medium transition-colors duration-200",
                  activeItem === item.name ? "text-emerald-300" : "text-emerald-200 group-hover:text-emerald-300"
                )}>
                  {item.name}
                </span>
                {activeItem === item.name && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 bg-emerald-400 rounded-full"
                  />
                )}
              </motion.a>
            ))}
          </nav>

          {/* Trading Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-4 border-t border-emerald-800/30"
          >
            <div className="bg-gradient-to-br from-emerald-950/50 to-green-950/50 rounded-xl p-4 border border-emerald-800/30">
              <h3 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Portfolio Value
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-400">Total Value</span>
                  <span className="text-sm font-bold text-emerald-300">$29,835.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-400">Day Change</span>
                  <span className="text-sm font-bold text-green-400">+$835.00 (+2.88%)</span>
                </div>
                <div className="w-full bg-emerald-950/50 rounded-full h-2 mt-3">
                  <motion.div
                    className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "72%" }}
                    transition={{ delay: 0.8, duration: 1.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.aside>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-80 h-full bg-emerald-950/95 backdrop-blur-xl border-r border-emerald-800/30"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-emerald-800/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-emerald-300">StocAI</h1>
                      <p className="text-xs text-emerald-400">AI Trading Platform</p>
                    </div>
                  </div>
                </div>

                <nav className="p-4 space-y-2">
                  {navigationItems.map((item, index) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveItem(item.name)
                        setIsMenuOpen(false)
                      }}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                        activeItem === item.name
                          ? "bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30"
                          : "hover:bg-emerald-950/50 border border-transparent"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", item.color)} />
                      <span className="font-medium text-emerald-200">{item.name}</span>
                    </motion.a>
                  ))}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-full overflow-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Global Trading Notifications */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-gradient-to-r from-emerald-900/90 to-green-900/90 backdrop-blur-xl border border-emerald-700/50 rounded-xl p-4 shadow-2xl shadow-emerald-500/10 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-200">Market Alert</p>
                <p className="text-xs text-emerald-300/70">AAPL reached your target price of $185</p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
